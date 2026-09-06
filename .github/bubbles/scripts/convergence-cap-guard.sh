#!/usr/bin/env bash
set -euo pipefail

# convergence-cap-guard.sh
#
# Gate G082 — convergence_cap_enforcement_gate.
#
# Mechanically enforces the orchestrator convergence iteration cap
# (`maxConvergenceIterations`, default 10) declared in
# `bubbles/workflows.yaml`. Reads `.specify/memory/bubbles.session.json`
# and inspects the `convergenceLoops[]` array (append-preserved by
# `bubbles/scripts/state-snapshot.sh --convergence-iteration <N>`),
# derives the active attempt from the current Goal Contract, and computes
# the maximum observed `iterationCount` for that exact authorized attempt.
# Historical attempts remain visible as diagnostics but cannot poison a new
# authorized Goal Contract revision. Without a Goal Contract, identity-free
# legacy entries retain the pre-upgrade fail-closed verdict.
#
# Exit codes:
#   0  cap not exceeded (or no convergence loops recorded for this spec)
#   1  cap exceeded — orchestrator MUST treat this spec as `blocked`
#       with finding G082; stderr names the cap and active attempt
#   2  malformed / missing inputs (workflows.yaml, session.json), or
#       missing required arguments — diagnostic on stderr
#
# Usage:
#   bash bubbles/scripts/convergence-cap-guard.sh <specDir> [--quiet]
#
# Inputs:
#   <specDir>   Path to the spec directory (e.g.
#               specs/900-convergence-fixture). Used to filter
#               convergenceLoops[] entries.
#   --quiet     Suppress informational stdout on success (PASS line is
#               always written to stdout; informational lines suppressed).
#
# Dependencies:
#   - jq      (hard dependency)
#   - awk     (POSIX; used as a tiny YAML reader for one scalar)
#
# Schema (additive in bubbles.session.json):
#   {
#     "convergenceLoops": [
#       {
#         "specDir":        "<canonical-repo-relative-path>",
#         "goalRef":        {"goalId": "...", "revision": 2,
#                            "sourceRequestDigest": "sha256:..."},
#         "iterationCount": <int>,
#         "startedAt":      "<RFC3339>",
#         "lastUpdated":    "<RFC3339>",
#         "agents":         ["bubbles.workflow", "bubbles.goal"]
#       },
#       ...
#     ]
#   }
#
# Reference: docs/Framework_Convergence_Health.md

QUIET="false"
SPEC_DIR=""
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
SESSION_STATE_LIB="$SCRIPT_DIR/session-state-lib.sh"

if [[ ! -f "$SESSION_STATE_LIB" ]]; then
  echo "convergence-cap-guard: required session-state library not found: $SESSION_STATE_LIB" >&2
  exit 2
fi
# shellcheck source=./session-state-lib.sh
source "$SESSION_STATE_LIB"

usage() {
  cat <<'EOF'
Usage: bash bubbles/scripts/convergence-cap-guard.sh <specDir> [--quiet]

Required:
  <specDir>   Spec directory whose convergence iterations are inspected
              (e.g. specs/900-convergence-fixture).

Optional:
  --quiet     Suppress informational stdout; the final PASS or VIOLATION
              line is still emitted (stdout on pass, stderr on fail).
  -h, --help  Print this usage and exit.

Exit codes:
  0 = cap not exceeded
  1 = cap exceeded (Gate G082 violation)
  2 = malformed inputs or missing arguments
EOF
}

# --- Argument parsing ----------------------------------------------------

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
    --quiet)
      QUIET="true"
      shift
      ;;
    --*)
      echo "convergence-cap-guard: unknown flag: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [[ -z "$SPEC_DIR" ]]; then
        SPEC_DIR="$1"
      else
        echo "convergence-cap-guard: unexpected positional argument: $1" >&2
        usage >&2
        exit 2
      fi
      shift
      ;;
  esac
done

if [[ -z "$SPEC_DIR" ]]; then
  echo "convergence-cap-guard: <specDir> is required" >&2
  usage >&2
  exit 2
fi

info() {
  if [[ "$QUIET" != "true" ]]; then
    echo "convergence-cap-guard: $*"
  fi
}

# --- jq dependency check -------------------------------------------------

if ! command -v jq >/dev/null 2>&1; then
  echo "convergence-cap-guard: jq is required but not found in PATH" >&2
  exit 2
fi

# --- Repo root resolution ------------------------------------------------

resolve_repo_root() {
  if [[ -n "${BUBBLES_REPO_ROOT:-}" ]]; then
    printf '%s' "$BUBBLES_REPO_ROOT"
    return 0
  fi
  local dir
  dir="$(pwd)"
  while [[ "$dir" != "/" ]]; do
    if [[ -d "$dir/.specify/memory" ]]; then
      printf '%s' "$dir"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  return 1
}

REPO_ROOT="$(resolve_repo_root || true)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "convergence-cap-guard: unable to resolve repo root (no .specify/memory found)" >&2
  echo "  Set BUBBLES_REPO_ROOT explicitly or run from inside a Bubbles repo." >&2
  exit 2
fi

# --- Locate workflows.yaml (source-repo OR installed layout) -------------

WORKFLOWS_YAML=""
for candidate in \
  "$REPO_ROOT/bubbles/workflows.yaml" \
  "$REPO_ROOT/.github/bubbles/workflows.yaml"; do
  if [[ -f "$candidate" ]]; then
    WORKFLOWS_YAML="$candidate"
    break
  fi
done

if [[ -z "$WORKFLOWS_YAML" ]]; then
  echo "convergence-cap-guard: workflows.yaml not found under $REPO_ROOT/bubbles/ or $REPO_ROOT/.github/bubbles/" >&2
  exit 2
fi

# --- Extract maxConvergenceIterations (first occurrence) -----------------
#
# workflows.yaml currently declares maxConvergenceIterations only in the
# autonomous-goal workflow's constraints block. Future workflows MAY add
# their own. For Gate G082 we treat the first declared value as the
# framework-level cap; if no declaration is present we default to 10
# (the documented Convergence Loop ceiling).

read_max_iterations() {
  local yaml_file="$1"
  awk '
    /^[[:space:]]*maxConvergenceIterations[[:space:]]*:[[:space:]]*[0-9]+/ {
      # Extract the integer after the colon.
      n = $0
      sub(/^.*maxConvergenceIterations[[:space:]]*:[[:space:]]*/, "", n)
      sub(/[^0-9].*$/, "", n)
      if (n ~ /^[0-9]+$/) {
        print n
        exit
      }
    }
  ' "$yaml_file"
}

MAX_ITERATIONS="$(read_max_iterations "$WORKFLOWS_YAML" || true)"
if [[ -z "$MAX_ITERATIONS" ]]; then
  MAX_ITERATIONS=10
  info "maxConvergenceIterations not declared in $WORKFLOWS_YAML; using framework default cap=10"
fi

if ! [[ "$MAX_ITERATIONS" =~ ^[0-9]+$ ]] || [[ "$MAX_ITERATIONS" -lt 1 ]]; then
  echo "convergence-cap-guard: maxConvergenceIterations must be a positive integer, got: $MAX_ITERATIONS" >&2
  exit 2
fi

# --- Locate session.json -------------------------------------------------

SESSION_FILE="$REPO_ROOT/.specify/memory/bubbles.session.json"
if [[ ! -f "$SESSION_FILE" ]]; then
  # No session file recorded yet — no convergence loops to enforce.
  info "no $SESSION_FILE present; nothing to enforce"
  echo "PASS Gate G082 (convergence_cap_enforcement_gate) — cap=$MAX_ITERATIONS, observed=0 (no session.json), specDir=$SPEC_DIR"
  exit 0
fi

# --- Read one immutable object snapshot ----------------------------------

STATE_WORKSPACE="$(mktemp -d "${TMPDIR:-/tmp}/bubbles-convergence-cap.XXXXXX")" || {
  echo "convergence-cap-guard: could not create session snapshot workspace" >&2
  exit 2
}
cleanup() {
  rm -rf "$STATE_WORKSPACE"
}
trap cleanup EXIT INT TERM
SESSION_SNAPSHOT="$STATE_WORKSPACE/session.json"
if ! session_state_read_object "$SESSION_FILE" refuse "$SESSION_SNAPSHOT"; then
  echo "convergence-cap-guard: $SESSION_FILE is not valid session object state" >&2
  exit 2
fi

# --- Canonical spec identity ---------------------------------------------

NORMALIZED_SPEC=""
if ! NORMALIZED_SPEC="$(session_state_canonical_spec "$REPO_ROOT" "$SPEC_DIR")"; then
  echo "convergence-cap-guard: <specDir> must be a canonical repo-relative path or an absolute path under $REPO_ROOT (got: $SPEC_DIR)" >&2
  exit 2
fi

# --- Resolve the active attempt from the trusted Goal Contract -----------
#
# Identity equality uses the complete authorization core: goalId, revision,
# and sourceRequestDigest. `agent` is attribution only. Multiple compatible
# pre-upgrade records for one identity are grouped as one effective attempt by
# taking their maximum count and unioning their agents. A partial identity or a
# record that copies the current goalId+revision with another digest is an
# integrity error, never an empty budget.

NORMALIZED_RECORDS="$STATE_WORKSPACE/convergence.json"
if ! session_state_validate_convergence \
  "$SESSION_SNAPSHOT" "$REPO_ROOT" "$NORMALIZED_SPEC" "$NORMALIZED_RECORDS"; then
  echo "convergence-cap-guard: inconsistent convergence attempt state: shared validation refused" >&2
  echo "  specDir:      $NORMALIZED_SPEC" >&2
  echo "  session.json: $SESSION_FILE" >&2
  exit 2
fi

GOAL_PRESENT="$(jq -r 'has("goalContract") and .goalContract != null' "$SESSION_SNAPSHOT")"
if [[ "$GOAL_PRESENT" == "true" ]]; then
  MIRROR_JSON="$(jq -c '.repositoryBindingMirror // null' "$SESSION_SNAPSHOT")"
  if ! AUTHORITY_CONTEXT="$(session_state_authority_context "$REPO_ROOT" "$MIRROR_JSON" mirror)"; then
    echo "convergence-cap-guard: inconsistent convergence attempt state: repository authority is invalid" >&2
    echo "  specDir:      $NORMALIZED_SPEC" >&2
    echo "  session.json: $SESSION_FILE" >&2
    exit 2
  fi
  if ! ATTEMPT_CORE="$(session_state_authorized_attempt "$SESSION_SNAPSHOT" "$AUTHORITY_CONTEXT" "$NORMALIZED_SPEC")"; then
    echo "convergence-cap-guard: inconsistent convergence attempt state: complete Goal Contract authorization failed" >&2
    echo "  specDir:      $NORMALIZED_SPEC" >&2
    echo "  session.json: $SESSION_FILE" >&2
    exit 2
  fi

  GOAL_ID="$(jq -r '.goalId' <<< "$ATTEMPT_CORE")"
  GOAL_REVISION="$(jq -r '.revision' <<< "$ATTEMPT_CORE")"
  GOAL_DIGEST="$(jq -r '.sourceRequestDigest' <<< "$ATTEMPT_CORE")"
  CURRENT_RECORDS="$(jq -c --arg goal "$GOAL_ID" --argjson revision "$GOAL_REVISION" --arg digest "$GOAL_DIGEST" '
    [.[] | select(
      .goalRef != null
      and .goalRef.goalId == $goal
      and .goalRef.revision == $revision
      and .goalRef.sourceRequestDigest == $digest)]
  ' "$NORMALIZED_RECORDS")"
  HISTORICAL_RECORDS="$(jq -c --arg goal "$GOAL_ID" --argjson revision "$GOAL_REVISION" --arg digest "$GOAL_DIGEST" '
    [.[] | select((
      .goalRef != null
      and .goalRef.goalId == $goal
      and .goalRef.revision == $revision
      and .goalRef.sourceRequestDigest == $digest) | not)]
  ' "$NORMALIZED_RECORDS")"
  ATTEMPT_JSON="$(jq -cn \
    --arg goal "$GOAL_ID" \
    --argjson revision "$GOAL_REVISION" \
    --argjson current "$CURRENT_RECORDS" \
    --argjson historical "$HISTORICAL_RECORDS" '
    def maximum($records): if ($records | length) == 0 then 0 else [$records[].iterationCount] | max end;
    def agents($records): [$records[].agents[]] | unique;
    def latest($records): [$records[].lastUpdated | select(. != null)] | max // null;
    def identity_key: [.goalRef.goalId, .goalRef.revision, .goalRef.sourceRequestDigest] | @json;
    (([$historical[] | select(.goalRef != null) | identity_key] | unique | length)
      + (if any($historical[]; .goalRef == null) then 1 else 0 end)) as $historical_count
    | {
        error:null,
        attemptKind:"goal",
        goalId:$goal,
        revision:$revision,
        observed:maximum($current),
        agents:agents($current),
        lastUpdated:latest($current),
        historicalAttempts:$historical_count,
        historicalMax:maximum($historical)
      }
  ')"
else
  if jq -e 'any(.[]; .goalRef != null)' "$NORMALIZED_RECORDS" >/dev/null 2>&1; then
    session_state_diagnostic convergence-cap-guard REFUSED SESSION_GOAL_MISSING \
      specDir "$NORMALIZED_SPEC" message "identity-bearing history requires a current authorized Goal Contract" >&2
    echo "convergence-cap-guard: inconsistent convergence attempt state: identity-bearing history has no current authorization" >&2
    exit 2
  fi
  ATTEMPT_JSON="$(jq -cn --argjson current "$(jq -c '[.[] | select(.goalRef == null)]' "$NORMALIZED_RECORDS")" '
    def maximum($records): if ($records | length) == 0 then 0 else [$records[].iterationCount] | max end;
    def agents($records): [$records[].agents[]] | unique;
    def latest($records): [$records[].lastUpdated | select(. != null)] | max // null;
    {
      error:null,
      attemptKind:"legacy",
      goalId:null,
      revision:null,
      observed:maximum($current),
      agents:agents($current),
      lastUpdated:latest($current),
      historicalAttempts:0,
      historicalMax:0
    }
  ')"
fi

if [[ -z "$ATTEMPT_JSON" ]] || ! jq empty <<< "$ATTEMPT_JSON" >/dev/null 2>&1; then
  echo "convergence-cap-guard: failed to parse convergenceLoops[] from $SESSION_FILE" >&2
  exit 2
fi

ATTEMPT_ERROR="$(jq -r '.error // empty' <<< "$ATTEMPT_JSON")"
if [[ -n "$ATTEMPT_ERROR" ]]; then
  echo "convergence-cap-guard: inconsistent convergence attempt state: $ATTEMPT_ERROR" >&2
  echo "  specDir:      $NORMALIZED_SPEC" >&2
  echo "  session.json: $SESSION_FILE" >&2
  exit 2
fi

OBSERVED="$(jq -r '.observed' <<< "$ATTEMPT_JSON")"
ATTEMPT_KIND="$(jq -r '.attemptKind' <<< "$ATTEMPT_JSON")"
GOAL_ID="$(jq -r '.goalId // "legacy"' <<< "$ATTEMPT_JSON")"
GOAL_REVISION="$(jq -r '.revision // "legacy"' <<< "$ATTEMPT_JSON")"
CONTRIBUTING_AGENTS="$(jq -r '.agents | if length == 0 then "none" else join(",") end' <<< "$ATTEMPT_JSON")"
LAST_AT="$(jq -r '.lastUpdated // "unknown"' <<< "$ATTEMPT_JSON")"
HISTORICAL_ATTEMPTS="$(jq -r '.historicalAttempts' <<< "$ATTEMPT_JSON")"
HISTORICAL_MAX="$(jq -r '.historicalMax' <<< "$ATTEMPT_JSON")"

if [[ "$ATTEMPT_KIND" == "goal" ]]; then
  ATTEMPT_LABEL="goalId=$GOAL_ID revision=$GOAL_REVISION"
else
  ATTEMPT_LABEL="legacy"
fi

if ! [[ "$OBSERVED" =~ ^[0-9]+$ ]]; then
  echo "convergence-cap-guard: malformed iterationCount in session.json: $OBSERVED" >&2
  exit 2
fi

# --- Decision -----------------------------------------------------------

if [[ "$OBSERVED" -gt "$MAX_ITERATIONS" ]]; then
  {
    echo "G082 convergence_cap_enforcement_gate violation"
    echo "  specDir:                  $NORMALIZED_SPEC"
    echo "  active attempt:           $ATTEMPT_LABEL"
    echo "  contributing agents:      $CONTRIBUTING_AGENTS"
    echo "  observed iterationCount:  $OBSERVED"
    echo "  maxConvergenceIterations: $MAX_ITERATIONS"
    echo "  lastUpdated:              $LAST_AT"
    echo "  historical attempts:      $HISTORICAL_ATTEMPTS"
    echo "  historical maximum:       $HISTORICAL_MAX"
    echo "  workflows.yaml:           $WORKFLOWS_YAML"
    echo "  session.json:             $SESSION_FILE"
    echo "  remediation:              orchestrator MUST emit a 'blocked' RESULT-ENVELOPE referencing Gate G082 and STOP further convergence iterations for this spec"
  } >&2
  exit 1
fi

info "specDir=$NORMALIZED_SPEC attempt=$ATTEMPT_LABEL observed=$OBSERVED maxConvergenceIterations=$MAX_ITERATIONS agents=$CONTRIBUTING_AGENTS lastUpdated=$LAST_AT historicalAttempts=$HISTORICAL_ATTEMPTS historicalMax=$HISTORICAL_MAX"
echo "PASS Gate G082 (convergence_cap_enforcement_gate) — cap=$MAX_ITERATIONS, observed=$OBSERVED, specDir=$NORMALIZED_SPEC, attempt=$ATTEMPT_LABEL, agents=$CONTRIBUTING_AGENTS, lastUpdated=$LAST_AT, historicalAttempts=$HISTORICAL_ATTEMPTS, historicalMax=$HISTORICAL_MAX"
exit 0
