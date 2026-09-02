#!/usr/bin/env bash
# convergence-materiality.sh — the convergence materiality brake
# (IMP-041 SCOPE-7 / GF-13).
#
# WHY PERSISTENCE NEEDS A BRAKE
#
# The `autonomous-goal` mode enables solution search and
# `neverStopForFixableObstacles`. Both are correct for their purpose: an agent
# that stops at the first compile error is useless. But neither rule
# distinguishes "this is hard" from "this is BIGGER". Without that distinction,
# persistence amplifies expansion — every iteration that discovers more work
# treats the extra work as an obstacle to push through rather than as evidence
# the goal changed.
#
# This brake makes the distinction mechanical. It compares the current
# iteration's planned delta against the baseline recorded at the first
# iteration:
#
#   narrower or equal  -> proceed (solution search is doing its job)
#   larger             -> REFUSE, naming exactly what grew
#
# An undeclared expansion is a NEW GOAL, not a fixable obstacle. The refusal
# offers the only two honest ways forward: narrow the plan, or widen the
# contract through an approved revision.
#
# A generic continuation resumes the approved graph and nothing more. A session
# budget limits runtime cost and never grants scope.
#
# ---------------------------------------------------------------------------
# AD-HOC BINDING (IMP-048 SCOPE-8 / GF-15)
#
# Everything above binds inside a GOAL CONTRACT: it needs `.goalContract` and a
# recorded `convergenceBaseline`, so it only ever fires in the `autonomous-goal`
# mode. A session that opens as an ordinary question and grows into a delivery
# scope never reaches a `check` call at all — the measured incident is "read two
# days of RAID activity" becoming "deliver S5B containment hardening", which had
# no contract to grow relative to and therefore met no brake for five days.
#
# `open-surface` / `guard` / `declare-boundary` extend the SAME brake to that
# case. They reuse this file's refusal framing verbatim (an undeclared expansion
# is a NEW GOAL, and the two honest ways forward are to narrow the plan or widen
# the contract), its exit codes (0 / 1 REFUSED / 2 usage) and its
# no-bypass-flag rule. They add no second brake and no second store.
#
# THE LOAD-BEARING SAFETY PROPERTY (R7): THE BRAKE BINDS AT THE FIRST **MUTABLE**
# ACTION, NEVER AT A READ. A read-only investigation is never refused — that is
# the difference between a control people keep and one that gets switched off on
# day one. `guard --action-kind read` returns ALLOWED *before* the surface is
# even looked up, so the property is structural rather than a branch that has to
# be remembered.
#
# THE SURFACE IS DECLARED, NOT GUESSED. There is no inference from the prompt
# text. The opening surface exists only when someone recorded it with
# `open-surface`. With none recorded the brake is a NO-OP, because guessing
# intent and then blocking on the guess is worse than not binding at all.
#
# ONE STORE. The surface lives in the session store SCOPE-7 keys by host session
# id (`.specify/memory/bubbles.session.json`), under `adHocSurfaces[<sessionId>]`,
# so two concurrent sessions in one repository cannot inherit each other's
# boundary.
#
# DEFAULT OFF, per repo, same idiom as `sessionLiveness:` / `sessionReview:`.
# With no `adHocMateriality:` block or an explicit `adapter: none`, all three
# ad-hoc subcommands are clean no-ops. An unconfigured repository behaves exactly
# as it does today, and `check` / `baseline` / `show` are untouched either way.
#
# Exit codes
#   0  baseline recorded, or the iteration is within it; ad-hoc action allowed,
#      skipped or no-op
#   1  REFUSED — the plan grew relative to the baseline, or a mutable action
#      landed outside the declared opening surface
#   2  usage or runtime error
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
SESSION_STATE_LIB="$SCRIPT_DIR/session-state-lib.sh"
[[ -f "$SESSION_STATE_LIB" ]] || { echo "convergence-materiality: required session-state library not found: $SESSION_STATE_LIB" >&2; exit 2; }
# shellcheck source=./session-state-lib.sh
source "$SESSION_STATE_LIB"

usage() {
  cat <<'EOF'
Usage: convergence-materiality.sh check --session-file <path> --planned-delta <json>
                                        [--iteration <n>] [--scenario-file <path>]
       convergence-materiality.sh baseline --session-file <path> --planned-delta <json>
                                           [--scenario-file <path>]
       convergence-materiality.sh show --session-file <path>

  check     compare this iteration against the recorded baseline; records the
            baseline itself when none exists yet
  baseline  (re)record a baseline — only permitted when the contract revision
            changed, i.e. after an approved widening
  show      print the recorded baseline

Ad-hoc session binding (IMP-048 SCOPE-8 / GF-15), default OFF per repo:

       convergence-materiality.sh open-surface --session-file <path> --session-id <id>
                                        --surface <path> [--surface <path> ...]
                                        [--repo-root <path>] [--note <text>]
       convergence-materiality.sh guard --session-file <path> --session-id <id>
                                        --action-kind read|mutable --target <path>
                                        [--repo-root <path>]
       convergence-materiality.sh declare-boundary --session-file <path> --session-id <id>
                                        --target <path> --note <text> [--repo-root <path>]
       convergence-materiality.sh surface --session-file <path> --session-id <id>
                                        [--repo-root <path>]

  open-surface     record the surface implied by the opening request
  guard            check one action against that surface; a READ is always allowed
  declare-boundary widen the surface explicitly, before the mutation lands
  surface          print the recorded surface for a host session

Project config (default OFF):

  adHocMateriality:
    adapter: none | session-json

There is no --force / --skip / --accept-growth / --retroactive.
EOF
}

fail_usage() { echo "convergence-materiality: $*" >&2; exit 2; }
fail_refuse() { echo "convergence-materiality: REFUSED — $*" >&2; exit 1; }

command -v jq >/dev/null 2>&1 || fail_usage "jq is required"

SESSION_FILE=""
PLANNED_DELTA=""
SCENARIO_FILE=""
ITERATION=""

parse() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --session-file) SESSION_FILE="${2:-}"; shift 2 ;;
      --planned-delta) PLANNED_DELTA="${2:-}"; shift 2 ;;
      --scenario-file) SCENARIO_FILE="${2:-}"; shift 2 ;;
      --iteration) ITERATION="${2:-}"; shift 2 ;;
      -h|--help) usage; exit 0 ;;
      --force|--skip|--accept-growth|--no-verify)
        fail_usage "bypass-shaped flag '$1' does not exist — growth is a new goal, not an obstacle to push through" ;;
      *) fail_usage "unknown option: $1" ;;
    esac
  done
  [[ -n "$SESSION_FILE" ]] || fail_usage "--session-file is required"
  [[ -f "$SESSION_FILE" ]] || fail_usage "session file not found: $SESSION_FILE"
}

require_delta() {
  [[ -n "$PLANNED_DELTA" ]] || fail_usage "--planned-delta is required"
  jq empty <<< "$PLANNED_DELTA" 2>/dev/null || fail_usage "--planned-delta is not valid JSON"
}

# Normalised comparison shape. Targets and change classes are sets; every max*
# key is a scalar ceiling. Anything absent from the baseline counts as zero, so
# a NEW dimension is growth rather than an unconstrained free pass.
normalise() {
  local delta="$1" scenario_targets="$2"
  jq -n --argjson d "$delta" --argjson t "$scenario_targets" '{
    changeClasses: (($d.changeClasses // []) | unique),
    targets: ($t | unique),
    counts: ($d | with_entries(select(.key | startswith("max"))))
  }'
}

scenario_targets() {
  if [[ -n "$SCENARIO_FILE" ]]; then
    [[ -f "$SCENARIO_FILE" ]] || fail_usage "scenario file not found: $SCENARIO_FILE"
    jq -c '[ (.repos // [])[].id ] + [ (.nodes // [])[].repo ] | map(select(. != null)) | unique' "$SCENARIO_FILE"
  else
    printf '[]'
  fi
}

materiality_baseline_mutation() {
  local locked_input="$1" candidate="$2" operation_context="$3"
  local current="$4" command_kind="$5" iteration="$6"
  local revision baseline at growth
  : "$operation_context"

  revision="$(jq -r '.goalContract.revision // 0' "$locked_input")" || return 2
  baseline="$(jq -c '.convergenceBaseline // null' "$locked_input")" || return 2

  if [[ "$command_kind" == "baseline" ]]; then
    if [[ "$baseline" != "null" ]]; then
      at="$(jq -r '.atRevision // -1' <<< "$baseline")" || return 2
      if [[ "$at" == "$revision" ]]; then
        echo "convergence-materiality: REFUSED — a baseline already exists at contract revision $revision. Re-baselining without an approved revision would release the brake from inside the loop — widen the contract with 'goal-contract.sh revise --approval-note' first." >&2
        return 1
      fi
    fi
    jq --argjson b "$current" --argjson rev "$revision" \
      '. + { convergenceBaseline: ($b + { atRevision: $rev }) }' "$locked_input" > "$candidate" || return 2
    echo "convergence-materiality: baseline recorded at contract revision $revision"
    return 0
  fi

  if [[ "$baseline" == "null" ]]; then
    jq --argjson b "$current" --argjson rev "$revision" \
      '. + { convergenceBaseline: ($b + { atRevision: $rev }) }' "$locked_input" > "$candidate" || return 2
    echo "convergence-materiality: OK (first iteration — baseline recorded at contract revision $revision)"
    return 0
  fi

  at="$(jq -r '.atRevision // -1' <<< "$baseline")" || return 2
  if [[ "$at" != "$revision" ]]; then
    jq --argjson b "$current" --argjson rev "$revision" \
      '. + { convergenceBaseline: ($b + { atRevision: $rev }) }' "$locked_input" > "$candidate" || return 2
    echo "convergence-materiality: OK (contract revision moved $at -> $revision; baseline re-recorded against the approved contract)"
    return 0
  fi

  growth="$(jq -r -n --argjson b "$baseline" --argjson c "$current" '
    [ (($c.changeClasses - $b.changeClasses)[] | "change class \(. | tojson)"),
      (($c.targets - $b.targets)[] | "target \(. | tojson)"),
      ($c.counts | to_entries[] | . as $e
        | select($e.value > (($b.counts[$e.key]) // 0))
        | "\($e.key) \((($b.counts[$e.key]) // 0)) -> \($e.value)") ]
    | join("; ")')" || return 2

  if [[ -n "$growth" ]]; then
    echo "convergence-materiality: REFUSED — iteration ${iteration:-<n>} grows the goal: $growth. Undeclared expansion is a NEW GOAL, not a fixable obstacle — neverStopForFixableObstacles does not apply. Either narrow the plan back inside the baseline, or record an approved widening with 'goal-contract.sh revise --approval-note' and re-baseline." >&2
    return 1
  fi

  cp "$locked_input" "$candidate" || return 3
  echo "convergence-materiality: OK (iteration ${iteration:-<n>} is within the baseline at contract revision $revision)"
}

cmd_show() {
  parse "$@"
  local snapshot rc=0
  snapshot="$(mktemp "${TMPDIR:-/tmp}/convergence-materiality-show.XXXXXX")" || fail_usage "could not create immutable session snapshot"
  session_state_read_object "$SESSION_FILE" refuse "$snapshot" || rc=$?
  if [[ "$rc" -ne 0 ]]; then
    rm -f "$snapshot"
    return "$rc"
  fi
  jq -c '.convergenceBaseline // null' "$snapshot"
  rm -f "$snapshot"
}

cmd_baseline() {
  parse "$@"
  require_delta
  local current transaction_rc=0
  current="$(normalise "$PLANNED_DELTA" "$(scenario_targets)")"
  session_state_transaction "$SESSION_FILE" refuse convergence-materiality-baseline \
    materiality_baseline_mutation "$current" baseline "$ITERATION" || transaction_rc=$?
  return "$transaction_rc"
}

cmd_check() {
  parse "$@"
  require_delta
  local current transaction_rc=0
  current="$(normalise "$PLANNED_DELTA" "$(scenario_targets)")"
  session_state_transaction "$SESSION_FILE" refuse convergence-materiality-check \
    materiality_baseline_mutation "$current" check "$ITERATION" || transaction_rc=$?
  return "$transaction_rc"
}

# ===========================================================================
# IMP-048 SCOPE-8 / GF-15 — ad-hoc session binding
# ===========================================================================

ADHOC_REPO_ROOT=""
ADHOC_SESSION_ID=""
ADHOC_TARGET=""
ADHOC_ACTION_KIND=""
ADHOC_NOTE=""
ADHOC_SURFACES=""

parse_adhoc() {
  ADHOC_REPO_ROOT="$PWD"
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --session-file) SESSION_FILE="${2:-}"; shift 2 ;;
      --repo-root) ADHOC_REPO_ROOT="${2:-}"; shift 2 ;;
      --session-id) ADHOC_SESSION_ID="${2:-}"; shift 2 ;;
      --target) ADHOC_TARGET="${2:-}"; shift 2 ;;
      --action-kind) ADHOC_ACTION_KIND="${2:-}"; shift 2 ;;
      --note) ADHOC_NOTE="${2:-}"; shift 2 ;;
      --surface) ADHOC_SURFACES="${ADHOC_SURFACES}${2:-}"$'\n'; shift 2 ;;
      -h|--help) usage; exit 0 ;;
      # Same rule as the goal-contract path above: an expansion is widened by
      # declaring it, never by asserting past the brake. `--retroactive` is
      # named explicitly because laundering a landed mutation is the exact
      # abuse this subcommand set has to survive.
      --force|--skip|--accept-growth|--no-verify|--retroactive|--assume*|--ignore*)
        fail_usage "bypass-shaped flag '$1' does not exist — growth is a new goal, not an obstacle to push through" ;;
      *) fail_usage "unknown option: $1" ;;
    esac
  done
  [[ -n "$SESSION_FILE" ]] || fail_usage "--session-file is required"
  [[ -n "$ADHOC_SESSION_ID" ]] || fail_usage "--session-id is required"
  case "$ADHOC_SESSION_ID" in
    *[!A-Za-z0-9._:-]*) fail_usage "invalid --session-id '$ADHOC_SESSION_ID' (allowed: A-Z a-z 0-9 . _ : -)" ;;
  esac
  [[ -d "$ADHOC_REPO_ROOT" ]] || fail_usage "repo root not found: $ADHOC_REPO_ROOT"
  ADHOC_REPO_ROOT="$(cd "$ADHOC_REPO_ROOT" && pwd)"
}

# Default OFF per repo. A configured-but-unknown adapter fails LOUD rather than
# degrading to `none`: a typo that silently produced "not binding" would be
# indistinguishable from a deliberate opt-out.
resolve_adhoc_adapter() {
  local config_file='' adapter=''
  if [[ -f "$ADHOC_REPO_ROOT/.github/bubbles-project.yaml" ]]; then
    config_file="$ADHOC_REPO_ROOT/.github/bubbles-project.yaml"
  elif [[ -f "$ADHOC_REPO_ROOT/bubbles-project.yaml" ]]; then
    config_file="$ADHOC_REPO_ROOT/bubbles-project.yaml"
  fi

  if [[ -n "$config_file" ]]; then
    adapter="$(awk '
      /^[[:space:]]*#/ { next }
      /^adHocMateriality:[[:space:]]*$/ { inblock = 1; next }
      inblock && /^[^[:space:]]/ { inblock = 0 }
      inblock && $1 == "adapter:" {
        value = $2
        gsub(/["\047]/, "", value)
        print value
        exit
      }
    ' "$config_file" 2>/dev/null || true)"
  fi

  [[ -n "$adapter" ]] || adapter='none'
  case "$adapter" in
    none|session-json) ;;
    *) fail_usage "unknown adHocMateriality.adapter '$adapter' (expected none or session-json)" ;;
  esac
  printf '%s' "$adapter"
}

# Paths are compared as declared prefixes, so `./x/` and `x` are the same
# surface and a trailing slash never decides whether a mutation is inside it.
normalise_path() {
  local p="$1"
  p="${p#./}"
  while [[ "$p" == */ && "$p" != "/" ]]; do p="${p%/}"; done
  printf '%s' "$p"
}

# sha256 over stdin; macOS ships `shasum`, GNU ships `sha256sum`, neither is
# guaranteed, so both are probed and absence is loud rather than degrading to an
# unverified digest.
sha256_stream() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum | awk '{print $1}'
  else
    shasum -a 256 | awk '{print $1}'
  fi
}

# The witness that makes a retroactive declaration detectable. A target that does
# not exist yet is `absent`, which is itself a witness: creating it later changes
# the digest.
target_digest() {
  local abs="$1"
  command -v sha256sum >/dev/null 2>&1 || command -v shasum >/dev/null 2>&1 ||
    fail_usage "no sha256 tool (sha256sum/shasum) available to witness a target"
  if [[ -f "$abs" ]]; then
    sha256_stream < "$abs"
  elif [[ -d "$abs" ]]; then
    # Path list AND per-file bytes, so neither renaming a file nor editing one
    # in place leaves the witness unchanged. `sort` without `-z` because BSD
    # sort has no `-z`; a newline inside a path is pathological and would only
    # ever make the witness MORE likely to differ, never less.
    (
      cd "$abs" || exit 0
      find . -type f 2>/dev/null | LC_ALL=C sort | while IFS= read -r f; do
        [[ -n "$f" ]] || continue
        printf '%s ' "$f"
        sha256_stream < "$f"
      done
    ) | sha256_stream
  else
    printf 'absent'
  fi
}

adhoc_surface_recorded() {
  local snapshot="$1"
  jq -e --arg sid "$ADHOC_SESSION_ID" '(.adHocSurfaces[$sid] // null) != null' "$snapshot" >/dev/null 2>&1
}

materiality_adhoc_mutation() {
  local locked_input="$1" candidate="$2" operation_context="$3" filter="$4"
  shift 4
  : "$operation_context"
  jq "$@" "$filter" "$locked_input" > "$candidate"
}

adhoc_write() {
  local operation="$1" filter="$2" transaction_rc=0
  shift 2
  session_state_transaction "$SESSION_FILE" refuse "$operation" \
    materiality_adhoc_mutation "$filter" "$@" || transaction_rc=$?
  return "$transaction_rc"
}

materiality_guard_mutation() {
  local locked_input="$1" candidate="$2" operation_context="$3"
  local session_id="$4" target="$5" digest="$6" at="$7"
  local entry
  : "$operation_context"
  MATERIALITY_PUBLIC_RC=0

  if ! jq -e --arg sid "$session_id" '(.adHocSurfaces[$sid] // null) != null' "$locked_input" >/dev/null 2>&1; then
    cp "$locked_input" "$candidate" || return 3
    printf 'verdict=SKIPPED\nreason=no-opening-surface\n'
    return 0
  fi

  while IFS= read -r entry; do
    [[ -n "$entry" ]] || continue
    if [[ "$target" == "$entry" || "$target" == "$entry"/* ]]; then
      cp "$locked_input" "$candidate" || return 3
      printf 'target=%s\nmatchedSurface=%s\nverdict=ALLOWED\n' "$target" "$entry"
      return 0
    fi
  done < <(jq -r --arg sid "$session_id" '
    (.adHocSurfaces[$sid] // {}) as $s
    | (($s.surfaces // []) + (($s.declarations // []) | map(.target)))
    | unique | .[]' "$locked_input")

  jq --arg sid "$session_id" --arg t "$target" --arg d "$digest" --arg at "$at" '
    .adHocSurfaces[$sid].refusals = ((.adHocSurfaces[$sid].refusals // []) + [{
      target: $t, digest: $d, at: $at }])' "$locked_input" > "$candidate" || return 2
  printf 'target=%s\nwitnessDigest=%s\nverdict=REFUSED\n' "$target" "$digest"
  echo "convergence-materiality: REFUSED — the first mutable action on '$target' lands outside the opening surface recorded for session $session_id. Undeclared expansion is a NEW GOAL, not a fixable obstacle — neverStopForFixableObstacles does not apply. Either narrow the plan back inside the opening surface, or widen it explicitly with 'convergence-materiality.sh declare-boundary --target $target --note <why>' BEFORE the mutation lands." >&2
  MATERIALITY_PUBLIC_RC=1
  return 0
}

materiality_declare_boundary_mutation() {
  local locked_input="$1" candidate="$2" operation_context="$3"
  local session_id="$4" target="$5" note="$6" current_digest="$7" at="$8"
  local witness
  : "$operation_context"

  if ! jq -e --arg sid "$session_id" '(.adHocSurfaces[$sid] // null) != null' "$locked_input" >/dev/null 2>&1; then
    echo "convergence-materiality: no opening surface recorded for session $session_id — record one with 'open-surface' before widening it" >&2
    return 2
  fi

  witness="$(jq -r --arg sid "$session_id" --arg t "$target" '
    [ (.adHocSurfaces[$sid].refusals // [])[] | select(.target == $t) | .digest ] | last // ""' "$locked_input")" || return 2
  if [[ -n "$witness" ]]; then
    printf 'witnessDigest=%s\ncurrentDigest=%s\n' "$witness" "$current_digest"
    if [[ "$current_digest" != "$witness" ]]; then
      printf 'verdict=REFUSED\n'
      echo "convergence-materiality: REFUSED — '$target' changed between the refusal ($witness) and this declaration ($current_digest) — the mutation already landed, so this boundary would be granted retroactively to authorise work that was already done. A declaration widens what MAY happen, never what DID. Undeclared expansion is a NEW GOAL, not a fixable obstacle: revert '$target' to the witnessed bytes and declare the boundary before re-running the action, or record the expansion as the new goal it is." >&2
      return 1
    fi
  fi

  jq --arg sid "$session_id" --arg t "$target" --arg note "$note" --arg at "$at" '
    .adHocSurfaces[$sid].declarations = ((.adHocSurfaces[$sid].declarations // []) + [{
      target: $t, note: $note, at: $at }])' "$locked_input" > "$candidate" || return 2
  printf 'target=%s\nverdict=DECLARED\n' "$target"
}

now_iso() { date -u +%Y-%m-%dT%H:%M:%SZ; }

cmd_open_surface() {
  parse_adhoc "$@"
  local adapter
  adapter="$(resolve_adhoc_adapter)"
  printf 'adapter=%s\n' "$adapter"
  if [[ "$adapter" == "none" ]]; then
    printf 'verdict=SKIPPED\n'
    return 0
  fi
  [[ -n "$ADHOC_SURFACES" ]] || fail_usage "--surface is required at least once"
  [[ -f "$SESSION_FILE" ]] || fail_usage "session file not found: $SESSION_FILE"

  local surfaces_json='[]' line norm
  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    norm="$(normalise_path "$line")"
    surfaces_json="$(jq -c --arg s "$norm" '. + [$s] | unique' <<< "$surfaces_json")"
  done <<< "$ADHOC_SURFACES"

  adhoc_write convergence-materiality-open-surface '.adHocSurfaces = ((.adHocSurfaces // {}) | .[$sid] = {
      openedAt: $at, surfaces: $surfaces, note: $note, declarations: [], refusals: []
    })' \
    --arg sid "$ADHOC_SESSION_ID" --arg at "$(now_iso)" \
    --arg note "$ADHOC_NOTE" --argjson surfaces "$surfaces_json"

  printf 'sessionId=%s\n' "$ADHOC_SESSION_ID"
  printf 'surfaces=%s\n' "$(jq -r 'join(",")' <<< "$surfaces_json")"
  printf 'verdict=RECORDED\n'
}

cmd_surface() {
  parse_adhoc "$@"
  local adapter
  adapter="$(resolve_adhoc_adapter)"
  printf 'adapter=%s\n' "$adapter"
  if [[ "$adapter" == "none" ]]; then
    printf 'verdict=SKIPPED\n'
    return 0
  fi
  if [[ ! -e "$SESSION_FILE" ]]; then
    printf 'verdict=UNRECORDED\n'
    return 0
  fi
  local snapshot rc=0
  snapshot="$(mktemp "${TMPDIR:-/tmp}/convergence-materiality-surface.XXXXXX")" || fail_usage "could not create immutable session snapshot"
  session_state_read_object "$SESSION_FILE" refuse "$snapshot" || rc=$?
  if [[ "$rc" -ne 0 ]]; then
    rm -f "$snapshot"
    return "$rc"
  fi
  if ! adhoc_surface_recorded "$snapshot"; then
    rm -f "$snapshot"
    printf 'verdict=UNRECORDED\n'
    return 0
  fi
  jq -c --arg sid "$ADHOC_SESSION_ID" '.adHocSurfaces[$sid]' "$snapshot"
  rm -f "$snapshot"
  printf 'verdict=RECORDED\n'
}

cmd_guard() {
  parse_adhoc "$@"
  local adapter
  adapter="$(resolve_adhoc_adapter)"
  printf 'adapter=%s\n' "$adapter"
  if [[ "$adapter" == "none" ]]; then
    printf 'verdict=SKIPPED\n'
    return 0
  fi

  # An unrecognised action kind fails LOUD. Defaulting an unknown kind to `read`
  # would hand every caller a one-word bypass.
  case "$ADHOC_ACTION_KIND" in
    read|mutable) ;;
    '') fail_usage "--action-kind is required (read or mutable)" ;;
    *) fail_usage "unknown --action-kind '$ADHOC_ACTION_KIND' (expected read or mutable)" ;;
  esac
  [[ -n "$ADHOC_TARGET" ]] || fail_usage "--target is required"
  printf 'actionKind=%s\n' "$ADHOC_ACTION_KIND"

  # === R7. THE LOAD-BEARING SAFETY PROPERTY ===============================
  # A READ IS ALLOWED HERE, BEFORE THE SURFACE IS EVEN LOOKED UP. Reading is
  # how you find out whether the work is bigger than you thought; a brake that
  # refuses exploration gets switched off on day one and then protects nothing.
  # Keeping the return above the surface lookup makes this structural rather
  # than a condition someone has to remember to write correctly.
  if [[ "$ADHOC_ACTION_KIND" == "read" ]]; then
    printf 'verdict=ALLOWED\n'
    printf 'reason=read-only\n'
    return 0
  fi
  # =======================================================================

  # No session means no recorded opening surface and therefore no brake. An
  # existing malformed session is not absence: the shared transaction refuses
  # it before any clean verdict can be emitted.
  if [[ ! -e "$SESSION_FILE" ]]; then
    printf 'verdict=SKIPPED\n'
    printf 'reason=no-opening-surface\n'
    return 0
  fi

  local target digest transaction_rc=0
  target="$(normalise_path "$ADHOC_TARGET")"
  digest="$(target_digest "$ADHOC_REPO_ROOT/$target")"
  MATERIALITY_PUBLIC_RC=0
  session_state_transaction "$SESSION_FILE" refuse convergence-materiality-guard \
    materiality_guard_mutation "$ADHOC_SESSION_ID" "$target" "$digest" "$(now_iso)" || transaction_rc=$?
  [[ "$transaction_rc" -eq 0 ]] || return "$transaction_rc"
  return "$MATERIALITY_PUBLIC_RC"
}

cmd_declare_boundary() {
  parse_adhoc "$@"
  local adapter
  adapter="$(resolve_adhoc_adapter)"
  printf 'adapter=%s\n' "$adapter"
  if [[ "$adapter" == "none" ]]; then
    printf 'verdict=SKIPPED\n'
    return 0
  fi
  [[ -n "$ADHOC_TARGET" ]] || fail_usage "--target is required"
  [[ -n "$ADHOC_NOTE" ]] || fail_usage "--note is required — a boundary is widened on a stated reason, never silently"
  local target current transaction_rc=0
  target="$(normalise_path "$ADHOC_TARGET")"
  current="$(target_digest "$ADHOC_REPO_ROOT/$target")"
  session_state_transaction "$SESSION_FILE" refuse convergence-materiality-declare-boundary \
    materiality_declare_boundary_mutation "$ADHOC_SESSION_ID" "$target" "$ADHOC_NOTE" "$current" "$(now_iso)" || transaction_rc=$?
  return "$transaction_rc"
}

case "${1:-}" in
  check) shift; cmd_check "$@" ;;
  baseline) shift; cmd_baseline "$@" ;;
  show) shift; cmd_show "$@" ;;
  open-surface) shift; cmd_open_surface "$@" ;;
  guard) shift; cmd_guard "$@" ;;
  declare-boundary) shift; cmd_declare_boundary "$@" ;;
  surface) shift; cmd_surface "$@" ;;
  -h|--help) usage; exit 0 ;;
  "") usage >&2; exit 2 ;;
  *) fail_usage "unknown subcommand: $1" ;;
esac
