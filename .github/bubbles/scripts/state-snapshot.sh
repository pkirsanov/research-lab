#!/usr/bin/env bash
set -euo pipefail

# state-snapshot.sh
# Per-turn state snapshot helper for Bubbles orchestrator agents.
#
# Each orchestrator agent calls this script at the start and end of every
# turn (a turn = one operator-visible cycle of work) to write a tiny
# structured record into `.specify/memory/bubbles.session.json` under a
# `turnSnapshots` array. The records make crash-resume deterministic and
# give the operator a per-turn audit trail of agent decisions.
#
# Hard dependency: jq. If jq is missing, this script fails loudly.
# (jq is already used elsewhere in the framework.)
#
# See: agents/bubbles_shared/operating-baseline.md
#      → "Per-Turn State Snapshot"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_BINDING="$SCRIPT_DIR/repository-binding.sh"
SESSION_STATE_LIB="$SCRIPT_DIR/session-state-lib.sh"

usage() {
  cat <<'EOF'
Usage: bash bubbles/scripts/state-snapshot.sh \
         --phase <name> [--scope-id <id>] [--note <string>] [--mode <start|end>] \
         [--posture <autonomy>] \
         [--context-boundary <kind>[:<checkpointId>]] \
         [--decision <text> [--decision-principle <name>] [--decision-chose <option>] \
          [--decision-considered <csv>]] \
         [--convergence-iteration <N> --spec-dir <path>] \
         [--scenario-file <compiled-scenario.json> --node-id <node-id>] \
         --session-id <id> --session-control-file <path> --binding-packet-file <path>

Required:
  --phase <name>       Phase the orchestrator is entering or closing
                       (e.g. phase_2_plan, phase_3_execute).

Required repository binding:
  --session-id <id>    Current interactive session id.
  --session-control-file <path>
                       Host-private authoritative session control record.
  --binding-packet-file <path>
                       Current local actionable repository binding packet.

Optional goal-node binding:
  --scenario-file <path>
                       Compiled scenario that declares the goal node.
  --node-id <id>       Goal-node ID declared by --scenario-file. Both
                       --scenario-file and --node-id MUST be supplied together.

Optional:
  --scope-id <id>      Scope being worked, when applicable.
  --occurrence-id <id> IMP-047 S-C. Occurrence identity for THIS phase run,
                       e.g. `validate#2`, as assigned by
                       bubbles/scripts/phase-coordinator.sh. A mode that runs
                       one phase twice produces two snapshots whose `phase` is
                       identical, so resume keyed on the name alone cannot tell
                       them apart. The legacy `phase` field is UNCHANGED and
                       still written; this mirrors it with the id that is
                       actually distinct. Omitted for a single-occurrence phase.
  --note <string>      Free-form note attached to this snapshot.
  --mode <start|end>   Records turn-start (default) or turn-end.
  --convergence-iteration <N>
                       Integer ≥ 0. When supplied alongside --spec-dir,
                       append-preserves the summary keyed by canonical specDir
                       plus the current Goal Contract identity core. Updates
                       must be equal (idempotent) or advance by exactly one.
                       Legacy goal-free records retain their historical
                       (specDir, agent) compatibility key. Enforced by Gate
                       G082 via `bubbles/scripts/convergence-cap-guard.sh`.
                       Both --convergence-iteration and --spec-dir MUST be
                       supplied together; supplying only one is an error.
  --spec-dir <path>    Spec directory (repo-relative) that the
                       convergence iteration refers to. Paired with
                       --convergence-iteration.
  -h, --help           Print this usage and exit.

Behavior:
  - Appends a single record to `.specify/memory/bubbles.session.json` under
    the `turnSnapshots[]` array. Each record carries:
        turnNumber  (auto-incremented integer; 1 for first record)
        timestamp   (UTC ISO8601, wall clock)
        phase       (the --phase value)
        occurrenceId(the --occurrence-id value or null; mirrors `phase` with an
                     identity that is distinct across repeated occurrences)
        scopeId     (the --scope-id value or null)
        mode        ("start" | "end")
        note        (the --note value or null)
        agent       ($BUBBLES_AGENT_NAME if set, otherwise "unknown")
        hostSessionId
                    (the --session-id value; attributes the record to ONE host
                     session so two concurrent sessions in one repository read
                     back their own trajectory instead of each other's —
                     bubbles/scripts/session-liveness.sh consumes it)
  - Prior records are NEVER touched. The array grows monotonically.
  - Two consecutive `--mode start` calls for the same phase + scope are
    intentionally allowed to support resume-after-crash flows.
  - The repository root comes only from the validated actionable packet.
    PWD and BUBBLES_REPO_ROOT are never repository authority.

Hard dependency:
  - `jq` is required. If `jq` is missing the script exits non-zero
    with a clear error message — no silent fallback.

Reference:
  agents/bubbles_shared/operating-baseline.md
    -> "Per-Turn State Snapshot"
EOF
}

# --- Arg parsing -----------------------------------------------------------

PHASE=""
SCOPE_ID=""
OCCURRENCE_ID=""
NOTE=""
MODE="start"
POSTURE=""
CONTEXT_BOUNDARY_KIND=""
CONTEXT_BOUNDARY_ID=""
DECISION=""
DECISION_PRINCIPLE=""
DECISION_CHOSE=""
DECISION_CONSIDERED=""
CONV_ITER=""
SPEC_DIR=""
SESSION_ID=""
SESSION_CONTROL_FILE=""
BINDING_PACKET_FILE=""
SCENARIO_FILE=""
NODE_ID=""

if [[ $# -eq 0 ]]; then
  usage >&2
  exit 2
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --phase)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --phase requires a value" >&2; exit 2; }
      PHASE="$2"
      shift 2
      ;;
    --scope-id)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --scope-id requires a value" >&2; exit 2; }
      SCOPE_ID="$2"
      shift 2
      ;;
    --occurrence-id)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --occurrence-id requires a value" >&2; exit 2; }
      OCCURRENCE_ID="$2"
      shift 2
      ;;
    --note)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --note requires a value" >&2; exit 2; }
      NOTE="$2"
      shift 2
      ;;
    --mode)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --mode requires a value" >&2; exit 2; }
      MODE="$2"
      shift 2
      ;;
    --posture)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --posture requires a value" >&2; exit 2; }
      POSTURE="$2"
      shift 2
      ;;
    --context-boundary)
      # <kind>[:<checkpointId>]. Gate G083 validates the recorded value; this
      # only splits it. Declaring `unavailable` is always legal and is the
      # honest answer when the host exposes no compaction primitive.
      [[ $# -ge 2 ]] || { echo "state-snapshot: --context-boundary requires a value" >&2; exit 2; }
      CONTEXT_BOUNDARY_KIND="${2%%:*}"
      if [[ "$2" == *:* ]]; then
        CONTEXT_BOUNDARY_ID="${2#*:}"
      fi
      case "$CONTEXT_BOUNDARY_KIND" in
        host-checkpoint | fresh-context | unavailable) ;;
        *)
          echo "state-snapshot: --context-boundary kind must be host-checkpoint, fresh-context or unavailable (got: '$CONTEXT_BOUNDARY_KIND')" >&2
          exit 2
          ;;
      esac
      if [[ "$CONTEXT_BOUNDARY_KIND" == "host-checkpoint" && -z "$CONTEXT_BOUNDARY_ID" ]]; then
        echo "state-snapshot: --context-boundary host-checkpoint requires a checkpoint id (host-checkpoint:<id>)" >&2
        exit 2
      fi
      shift 2
      ;;
    --decision)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --decision requires a value" >&2; exit 2; }
      DECISION="$2"
      shift 2
      ;;
    --decision-principle)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --decision-principle requires a value" >&2; exit 2; }
      DECISION_PRINCIPLE="$2"
      shift 2
      ;;
    --decision-chose)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --decision-chose requires a value" >&2; exit 2; }
      DECISION_CHOSE="$2"
      shift 2
      ;;
    --decision-considered)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --decision-considered requires a value" >&2; exit 2; }
      DECISION_CONSIDERED="$2"
      shift 2
      ;;
    --convergence-iteration)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --convergence-iteration requires a value" >&2; exit 2; }
      CONV_ITER="$2"
      shift 2
      ;;
    --spec-dir)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --spec-dir requires a value" >&2; exit 2; }
      SPEC_DIR="$2"
      shift 2
      ;;
    --session-id)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --session-id requires a value" >&2; exit 2; }
      SESSION_ID="$2"
      shift 2
      ;;
    --session-control-file)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --session-control-file requires a value" >&2; exit 2; }
      SESSION_CONTROL_FILE="$2"
      shift 2
      ;;
    --binding-packet-file)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --binding-packet-file requires a value" >&2; exit 2; }
      BINDING_PACKET_FILE="$2"
      shift 2
      ;;
    --scenario-file)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --scenario-file requires a value" >&2; exit 2; }
      SCENARIO_FILE="$2"
      shift 2
      ;;
    --node-id)
      [[ $# -ge 2 ]] || { echo "state-snapshot: --node-id requires a value" >&2; exit 2; }
      NODE_ID="$2"
      shift 2
      ;;
    *)
      echo "state-snapshot: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -n "$SCENARIO_FILE" && -z "$NODE_ID" ]]; then
  echo "state-snapshot: --scenario-file requires --node-id" >&2
  exit 2
fi
if [[ -n "$NODE_ID" && -z "$SCENARIO_FILE" ]]; then
  echo "state-snapshot: --node-id requires --scenario-file" >&2
  exit 2
fi

# Pair check: --convergence-iteration and --spec-dir must be supplied together.
if [[ -n "$CONV_ITER" && -z "$SPEC_DIR" ]]; then
  echo "state-snapshot: --convergence-iteration requires --spec-dir" >&2
  exit 2
fi
if [[ -n "$SPEC_DIR" && -z "$CONV_ITER" ]]; then
  echo "state-snapshot: --spec-dir requires --convergence-iteration" >&2
  exit 2
fi

# Validate --convergence-iteration is a non-negative integer.
if [[ -n "$CONV_ITER" ]]; then
  if ! [[ "$CONV_ITER" =~ ^[0-9]+$ ]]; then
    echo "state-snapshot: --convergence-iteration must be a non-negative integer (got: $CONV_ITER)" >&2
    exit 2
  fi
fi

if [[ -z "$PHASE" ]]; then
  echo "state-snapshot: --phase is required" >&2
  usage >&2
  exit 2
fi

case "$MODE" in
  start|end) ;;
  *)
    echo "state-snapshot: --mode must be 'start' or 'end' (got: $MODE)" >&2
    exit 2
    ;;
esac

# Record the posture that produced this turn, so an audit never has to
# reconstruct the operator's shell environment. A resolver failure (e.g. an
# unbounded `unattended`) must not fail the snapshot: leave it unset instead.
if [[ -z "$POSTURE" && -x "$SCRIPT_DIR/autonomy-resolve.sh" ]]; then
  POSTURE="$(bash "$SCRIPT_DIR/autonomy-resolve.sh" --format json 2>/dev/null |
    sed -n 's/.*"autonomy":"\([^"]*\)".*/\1/p')"
fi

# Decision metadata without a decision would record a principle that fired on
# nothing, which is worse than no ledger entry at all.
if [[ -z "$DECISION" ]] &&
  [[ -n "$DECISION_PRINCIPLE$DECISION_CHOSE$DECISION_CONSIDERED" ]]; then
  echo "state-snapshot: --decision-principle/--decision-chose/--decision-considered require --decision" >&2
  exit 2
fi

[[ -n "$SESSION_ID" ]] || { echo "state-snapshot: --session-id is required for repository-local snapshots" >&2; exit 2; }
[[ -n "$SESSION_CONTROL_FILE" ]] || { echo "state-snapshot: --session-control-file is required for repository-local snapshots" >&2; exit 2; }
[[ -n "$BINDING_PACKET_FILE" ]] || { echo "state-snapshot: --binding-packet-file is required for repository-local snapshots" >&2; exit 2; }

# --- jq dependency check ---------------------------------------------------

if ! command -v jq >/dev/null 2>&1; then
  echo "state-snapshot: jq is required but not found in PATH." >&2
  echo "  Install jq before invoking state-snapshot.sh." >&2
  exit 3
fi

[[ -f "$SESSION_STATE_LIB" ]] || { echo "state-snapshot: session-state library missing at $SESSION_STATE_LIB" >&2; exit 3; }
# shellcheck source=session-state-lib.sh
source "$SESSION_STATE_LIB"

# --- Validated repository root ---------------------------------------------

[[ -f "$REPOSITORY_BINDING" ]] || { echo "state-snapshot: repository binding validator missing at $REPOSITORY_BINDING" >&2; exit 3; }
NORMALIZED_PACKET_FILE=""
SNAPSHOT_NORMALIZED_FILE=""

cleanup_temp_files() {
  [[ -z "$NORMALIZED_PACKET_FILE" ]] || rm -f "$NORMALIZED_PACKET_FILE"
  [[ -z "$SNAPSHOT_NORMALIZED_FILE" ]] || rm -f "$SNAPSHOT_NORMALIZED_FILE"
}

trap cleanup_temp_files EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

NORMALIZED_PACKET_FILE="$(mktemp)"
cp -- "$BINDING_PACKET_FILE" "$NORMALIZED_PACKET_FILE" || {
  echo "state-snapshot: unable to read binding packet" >&2
  exit 2
}
chmod 600 "$NORMALIZED_PACKET_FILE"

# Validate the private packet copy before trusting its repository root. This
# read-only check also validates any requested goal node. The validated bytes
# become immutable callback input; no repository writer is nested here.
MIRROR_GOAL_NODE_ARGS=()
if [[ -n "$SCENARIO_FILE" ]]; then
  MIRROR_GOAL_NODE_ARGS=(--scenario-file "$SCENARIO_FILE" --node-id "$NODE_ID")
fi

set +e
BINDING_OUTPUT="$(bash "$REPOSITORY_BINDING" validate-packet \
  --session-id "$SESSION_ID" \
  --session-control-file "$SESSION_CONTROL_FILE" \
  --packet-file "$NORMALIZED_PACKET_FILE" \
  "${MIRROR_GOAL_NODE_ARGS[@]}" 2>&1)"
BINDING_RC=$?
set -e
if [[ "$BINDING_RC" -ne 0 ]]; then
  printf '%s\n' "$BINDING_OUTPUT" >&2
  exit "$BINDING_RC"
fi

# Freeze all callback inputs after external packet validation. The callback
# reads only the transaction's locked snapshot and commits mirror, turn,
# optional decision/context, and convergence state as one object.
PACKET_JSON="$(cat "$NORMALIZED_PACKET_FILE")"
REPO_ROOT="$(jq -r '.repositoryRoot' <<< "$PACKET_JSON")"
SESSION_DIR="$REPO_ROOT/.specify/memory"
SESSION_FILE="$SESSION_DIR/bubbles.session.json"

# Preserve the repository mirror command's session-path boundary while snapshot
# consumes the validated packet as data instead of invoking another writer.
if [[ -L "$REPO_ROOT/.specify" || -L "$SESSION_DIR" || -L "$SESSION_FILE" ]]; then
  printf '%s\n' 'REPOSITORY MIRROR REFUSED reason=SESSION_MIRROR_SYMLINK repoLocalSideEffects=zero' >&2
  exit 1
fi
mkdir -p "$SESSION_DIR" || exit 3
if [[ -L "$REPO_ROOT/.specify" || -L "$SESSION_DIR" || -L "$SESSION_FILE" ]] ||
  [[ "$(cd -P "$SESSION_DIR" 2>/dev/null && pwd -P)" != "$SESSION_DIR" ]]; then
  printf '%s\n' 'REPOSITORY MIRROR REFUSED reason=SESSION_MIRROR_SYMLINK repoLocalSideEffects=zero' >&2
  exit 1
fi

AUTHORITY_CONTEXT="$(session_state_authority_context "$REPO_ROOT" "$PACKET_JSON" packet)" || exit $?
AGENT_NAME="${BUBBLES_AGENT_NAME:-unknown}"
session_state_validate_agent "$AGENT_NAME" || exit $?

if [[ -n "$CONV_ITER" ]]; then
  SPEC_DIR="$(session_state_canonical_spec "$REPO_ROOT" "$SPEC_DIR")" || exit $?
fi

TIMESTAMP="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
SNAPSHOT_MUTATION_JSON="$(jq -cn \
  --arg timestamp "$TIMESTAMP" \
  --arg phase "$PHASE" \
  --arg scopeId "$SCOPE_ID" \
  --arg occurrenceId "$OCCURRENCE_ID" \
  --arg note "$NOTE" \
  --arg mode "$MODE" \
  --arg posture "$POSTURE" \
  --arg contextBoundaryKind "$CONTEXT_BOUNDARY_KIND" \
  --arg contextBoundaryId "$CONTEXT_BOUNDARY_ID" \
  --arg decision "$DECISION" \
  --arg decisionPrinciple "$DECISION_PRINCIPLE" \
  --arg decisionChose "$DECISION_CHOSE" \
  --arg decisionConsidered "$DECISION_CONSIDERED" \
  --arg agent "$AGENT_NAME" \
  --arg hostSessionId "$SESSION_ID" \
  --arg convergenceIteration "$CONV_ITER" \
  --arg specDir "$SPEC_DIR" \
  '{
    timestamp:$timestamp,
    phase:$phase,
    scopeId:$scopeId,
    occurrenceId:$occurrenceId,
    note:$note,
    mode:$mode,
    posture:$posture,
    contextBoundaryKind:$contextBoundaryKind,
    contextBoundaryId:$contextBoundaryId,
    decision:$decision,
    decisionPrinciple:$decisionPrinciple,
    decisionChose:$decisionChose,
    decisionConsidered:$decisionConsidered,
    agent:$agent,
    hostSessionId:$hostSessionId,
    convergenceIteration:(if $convergenceIteration == "" then null else ($convergenceIteration | tonumber) end),
    specDir:(if $specDir == "" then null else $specDir end)
  }')" || exit 2

state_snapshot_goal_ref() {
  local locked_input="$1" authority_context="$2"
  local contract violations goal_session goal_alias authority_session authority_alias

  if [[ "$(jq -r 'has("goalContract") and .goalContract != null' "$locked_input")" != "true" ]]; then
    printf '%s' 'null'
    return 0
  fi

  contract="$(jq -c '.goalContract' "$locked_input")" || return 2
  violations="$(session_state_goal_contract_violations "$contract")" || return 2
  if [[ -n "$violations" ]]; then
    session_state_diagnostic state-snapshot REFUSED SESSION_GOAL_INVALID \
      message "current Goal Contract failed complete validation" violations "$violations" >&2
    return 2
  fi

  goal_session="$(jq -r '.provenance.sessionId' <<< "$contract")"
  goal_alias="$(jq -r '.provenance.repositoryAlias' <<< "$contract")"
  authority_session="$(jq -r '.sessionId' <<< "$authority_context")"
  authority_alias="$(jq -r '.repositoryAlias' <<< "$authority_context")"
  if [[ "$goal_session" != "$authority_session" ]]; then
    session_state_diagnostic state-snapshot REFUSED SESSION_PROVENANCE_SESSION \
      message "Goal Contract session does not match repository authority" \
      goalSession "$goal_session" authoritySession "$authority_session" >&2
    return 2
  fi
  if [[ "$goal_alias" != "$authority_alias" ]]; then
    session_state_diagnostic state-snapshot REFUSED SESSION_PROVENANCE_REPOSITORY \
      message "Goal Contract repository alias does not match repository authority" \
      goalRepository "$goal_alias" authorityRepository "$authority_alias" >&2
    return 2
  fi

  jq -c '{
    goalId:.goalId,
    revision:.revision,
    sourceRequestDigest:.sourceRequestDigest,
    workBoundary:.workBoundary
  } + (if has("semanticBoundary") then {semanticBoundary:.semanticBoundary} else {} end)' <<< "$contract"
}

state_snapshot_validate_ordinal() {
  local incoming="$1" previous="$2" authorized="$3" spec_dir="$4"
  if [[ "$previous" == "none" ]]; then
    if [[ "$authorized" == "true" && "$incoming" -ne 1 ]]; then
      echo "state-snapshot: refusing convergence update for a new authorized attempt: first iteration must be 1 (requested=$incoming specDir=$spec_dir)" >&2
      return 1
    fi
    return 0
  fi
  if [[ "$incoming" -eq "$previous" || "$incoming" -eq $((previous + 1)) ]]; then
    return 0
  fi
  if [[ "$incoming" -lt "$previous" ]]; then
    echo "state-snapshot: refusing non-monotonic convergence update for specDir=$spec_dir: current=$previous requested=$incoming" >&2
    return 1
  fi
  echo "state-snapshot: refusing skipped convergence ordinal for specDir=$spec_dir: current=$previous requested=$incoming" >&2
  return 1
}

state_snapshot_matching_spellings() {
  local locked_input="$1" canonical_spec="$2"
  local count index raw_spec observed result='[]'
  count="$(jq -r '(.convergenceLoops // []) | length' "$locked_input")" || return 2
  index=0
  while [[ "$index" -lt "$count" ]]; do
    raw_spec="$(jq -r --argjson index "$index" '.convergenceLoops[$index].specDir' "$locked_input")" || return 2
    observed="$(session_state_canonical_spec "$REPO_ROOT" "$raw_spec")" || return $?
    if [[ "$observed" == "$canonical_spec" ]]; then
      result="$(jq -cn --argjson values "$result" --arg value "$raw_spec" '$values + [$value]')" || return 2
    fi
    index=$((index + 1))
  done
  printf '%s' "$result"
}

state_snapshot_mutation() {
  local locked_input="$1" candidate="$2" operation_context="$3"
  local packet="$4" authority_context="$5" mutation="$6"
  local timestamp mirror
  local goal_ref incoming spec_dir agent authorized=false attempt='null'
  local previous='none' matching_spellings='[]' validation_rc=0
  : "$operation_context"

  timestamp="$(jq -r '.timestamp' <<< "$mutation")" || return 2
  mirror="$(jq -cn \
    --argjson binding "$packet" \
    --arg timestamp "$timestamp" \
    '$binding + {
      mirroredControlRevision: $binding.repositoryResolution.controlRevision,
      mirroredAt: $timestamp
    }')" || return 2
  goal_ref="$(state_snapshot_goal_ref "$locked_input" "$authority_context")" || return $?
  incoming="$(jq -r '.convergenceIteration // empty' <<< "$mutation")"
  spec_dir="$(jq -r '.specDir // empty' <<< "$mutation")"
  agent="$(jq -r '.agent' <<< "$mutation")"

  if [[ -n "$incoming" ]]; then
    SNAPSHOT_NORMALIZED_FILE="$(mktemp "$(dirname "$candidate")/.state-snapshot.convergence.XXXXXX")" || return 3
    session_state_validate_convergence "$locked_input" "$REPO_ROOT" "$spec_dir" \
      "$SNAPSHOT_NORMALIZED_FILE" || validation_rc=$?
    if [[ "$validation_rc" -ne 0 ]]; then
      rm -f "$SNAPSHOT_NORMALIZED_FILE"
      SNAPSHOT_NORMALIZED_FILE=""
      return "$validation_rc"
    fi

    if [[ "$goal_ref" != "null" ]]; then
      authorized=true
      attempt="$(session_state_authorized_attempt "$locked_input" "$authority_context" "$spec_dir")" || {
        validation_rc=$?
        rm -f "$SNAPSHOT_NORMALIZED_FILE"
        SNAPSHOT_NORMALIZED_FILE=""
        return "$validation_rc"
      }
      previous="$(jq -r --argjson attempt "$attempt" '
        [.[] | select(
          .goalRef != null
          and .goalRef.goalId == $attempt.goalId
          and .goalRef.revision == $attempt.revision
          and .goalRef.sourceRequestDigest == $attempt.sourceRequestDigest
        ) | .iterationCount]
        | if length == 0 then "none" else (max | tostring) end
      ' "$SNAPSHOT_NORMALIZED_FILE")" || validation_rc=2
    else
      if jq -e 'any(.[]; .goalRef != null)' "$SNAPSHOT_NORMALIZED_FILE" >/dev/null 2>&1; then
        session_state_diagnostic state-snapshot REFUSED SESSION_GOAL_MISSING \
          message "current Goal Contract is required for identity-bearing attempt authority" >&2
        validation_rc=2
      else
        previous="$(jq -r --arg agent "$agent" '
          [.[] | select(.goalRef == null and ((.agents // []) | index($agent) != null)) | .iterationCount]
          | if length == 0 then "none" else (max | tostring) end
        ' "$SNAPSHOT_NORMALIZED_FILE")" || validation_rc=2
      fi
    fi
    if [[ "$validation_rc" -eq 0 ]]; then
      matching_spellings="$(state_snapshot_matching_spellings "$locked_input" "$spec_dir")" || validation_rc=$?
    fi
    rm -f "$SNAPSHOT_NORMALIZED_FILE"
    SNAPSHOT_NORMALIZED_FILE=""
    [[ "$validation_rc" -eq 0 ]] || return "$validation_rc"
    state_snapshot_validate_ordinal "$incoming" "$previous" "$authorized" "$spec_dir" || return $?
  fi

  if ! jq -e '
      ((.turnSnapshots // []) | type) == "array"
      and ((.autonomyDecisions // []) | type) == "array"
    ' "$locked_input" >/dev/null 2>&1; then
    session_state_diagnostic state-snapshot REFUSED SESSION_SNAPSHOT_COLLECTION_INVALID \
      message "turnSnapshots and autonomyDecisions must be arrays when present" >&2
    return 2
  fi

  SNAPSHOT_NEXT_TURN="$(jq -r '((.turnSnapshots // []) | length) + 1' "$locked_input")" || return 2
  if ! [[ "$SNAPSHOT_NEXT_TURN" =~ ^[1-9][0-9]*$ ]]; then
    session_state_diagnostic state-snapshot REFUSED SESSION_TURN_INVALID \
      message "snapshot callback could not derive a positive committed turn number" >&2
    return 2
  fi
  if ! jq \
    --argjson mirror "$mirror" \
    --argjson mutation "$mutation" \
    --argjson goalRef "$goal_ref" \
    --argjson matchingSpecSpellings "$matching_spellings" \
    --argjson turn "$SNAPSHOT_NEXT_TURN" '
    def same_spec:
      .specDir as $recordSpec
      | ($recordSpec | type) == "string"
        and ($matchingSpecSpellings | index($recordSpec) != null);
    def same_core($goal):
      (.goalRef | type) == "object"
      and .goalRef.goalId == $goal.goalId
      and .goalRef.revision == $goal.revision
      and .goalRef.sourceRequestDigest == $goal.sourceRequestDigest;
    def record_agents:
      ((.agents // []) as $recordAgents
       | (if ($recordAgents | type) == "array" then $recordAgents else [] end)
         + [(.agent // empty)])
      | map(select(type == "string" and length > 0));
    def canonical_times($records):
      {
        started: (
          [$records[] | (.startedAt // .lastUpdated // .lastIterationAt // empty)
           | select(type == "string" and length > 0)]
          | min // $mutation.timestamp
        ),
        updated: (
          [$records[] | (.lastUpdated // .lastIterationAt // empty)
           | select(type == "string" and length > 0)]
          | max // $mutation.timestamp
        )
      };
    . as $root
    | ($root + {
        repositoryBindingMirror: $mirror,
        turnSnapshots: ((($root.turnSnapshots // []) + [{
          turnNumber: $turn,
          timestamp: $mutation.timestamp,
          phase: $mutation.phase,
          occurrenceId: (if $mutation.occurrenceId == "" then null else $mutation.occurrenceId end),
          scopeId: (if $mutation.scopeId == "" then null else $mutation.scopeId end),
          mode: $mutation.mode,
          posture: (if $mutation.posture == "" then null else $mutation.posture end),
          note: (if $mutation.note == "" then null else $mutation.note end),
          agent: $mutation.agent,
          hostSessionId: $mutation.hostSessionId,
          goalRef: $goalRef
        }])),
        autonomyPosture: (if $mutation.posture == "" then ($root.autonomyPosture // null) else $mutation.posture end),
        contextBoundary: (
          if $mutation.contextBoundaryKind == "" then ($root.contextBoundary // null)
          else {
            kind: $mutation.contextBoundaryKind,
            checkpointId: (if $mutation.contextBoundaryId == "" then null else $mutation.contextBoundaryId end),
            at: $mutation.timestamp
          }
          end
        ),
        autonomyDecisions: (
          if $mutation.decision == "" then ($root.autonomyDecisions // [])
          else (($root.autonomyDecisions // []) + [{
            turnNumber: $turn,
            timestamp: $mutation.timestamp,
            description: $mutation.decision,
            principle: (if $mutation.decisionPrinciple == "" then null else $mutation.decisionPrinciple end),
            chose: (if $mutation.decisionChose == "" then null else $mutation.decisionChose end),
            considered: (
              if $mutation.decisionConsidered == "" then []
              else ($mutation.decisionConsidered | split(",") | map(gsub("^ +| +$"; "")) | map(select(length > 0)))
              end
            ),
            posture: (if $mutation.posture == "" then null else $mutation.posture end),
            agent: $mutation.agent
          }])
          end
        )
      }) as $snapshot
    | if $mutation.convergenceIteration == null then
        $snapshot
      else
        ($root.convergenceLoops // []) as $loops
        | (if $goalRef != null then
            [$loops[] | select(same_spec and same_core($goalRef))] as $current
            | ([$current[].iterationCount] | max // null) as $previous
            | canonical_times($current) as $times
            | ([$current[] | record_agents[]] + [$mutation.agent] | unique) as $agents
            | ($current[0] // {}) as $base
            | ([$loops[] | select((same_spec and same_core($goalRef)) | not)] + [
                ($base + {
                  specDir: $mutation.specDir,
                  goalRef: $goalRef,
                  iterationCount: $mutation.convergenceIteration,
                  startedAt: $times.started,
                  lastUpdated: (if $previous == $mutation.convergenceIteration then $times.updated else $mutation.timestamp end),
                  agents: $agents
                } | del(.agent, .lastIterationAt))
              ])
          else
            [$loops[]
             | select(same_spec)
             | select(.goalRef == null)
             | select((.agent // "") == $mutation.agent
                      or ((.agents // []) | if type == "array" then index($mutation.agent) != null else false end))] as $current
            | ([$current[].iterationCount] | max // null) as $previous
            | canonical_times($current) as $times
            | ($current[0] // {}) as $base
            | ([$loops[]
                | select((same_spec
                          and (.goalRef == null)
                          and (((.agent // "") == $mutation.agent)
                               or ((.agents // []) | if type == "array" then index($mutation.agent) != null else false end))) | not)] + [
                ($base + {
                  specDir: $mutation.specDir,
                  agent: $mutation.agent,
                  iterationCount: $mutation.convergenceIteration,
                  startedAt: $times.started,
                  lastUpdated: (if $previous == $mutation.convergenceIteration then $times.updated else $mutation.timestamp end),
                  goalRef: null
                } | del(.agents, .lastIterationAt))
              ])
          end) as $updated
        | $snapshot + {convergenceLoops:$updated}
      end
    ' "$locked_input" > "$candidate"; then
    session_state_diagnostic state-snapshot REFUSED SESSION_CANDIDATE_INVALID \
      message "snapshot callback could not build one complete candidate object" >&2
    return 2
  fi
}

# Commit the validated repository mirror, turn, optional decision/context, and
# optional convergence summary through one lock acquisition and one replacement.
# Any callback refusal occurs before the shared transaction can replace bytes.
SNAPSHOT_NEXT_TURN=""
set +e
session_state_transaction "$SESSION_FILE" initialize-object state-snapshot state_snapshot_mutation "$PACKET_JSON" "$AUTHORITY_CONTEXT" "$SNAPSHOT_MUTATION_JSON"
TRANSACTION_RC=$?
set -e
if [[ "$TRANSACTION_RC" -ne 0 ]]; then
  exit "$TRANSACTION_RC"
fi
NEXT_TURN="$SNAPSHOT_NEXT_TURN"

# Echo a one-line summary to stdout for orchestrator log capture.
if [[ -n "$CONV_ITER" && -n "$SPEC_DIR" ]]; then
  printf 'state-snapshot: turnNumber=%s mode=%s phase=%s scopeId=%s agent=%s convergenceIteration=%s specDir=%s\n' \
    "$NEXT_TURN" "$MODE" "$PHASE" "${SCOPE_ID:-null}" "$AGENT_NAME" "$CONV_ITER" "$SPEC_DIR"
else
  printf 'state-snapshot: turnNumber=%s mode=%s phase=%s scopeId=%s agent=%s\n' \
    "$NEXT_TURN" "$MODE" "$PHASE" "${SCOPE_ID:-null}" "$AGENT_NAME"
fi
