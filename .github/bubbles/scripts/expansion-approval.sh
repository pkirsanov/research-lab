#!/usr/bin/env bash
# expansion-approval.sh — architecture-expansion approval (IMP-041 SCOPE-4 / GF-10).
#
# WHY THIS IS SEPARATE FROM ACTION APPROVAL
#
# scenario-compile.md already requires operator approval before a HOST-MUTATING
# action node runs. That gate is real, but it fires too late: by the time a
# deploy node asks permission, planning and delivery have already decided the
# system will grow a runner, a cache, a virtual machine. The expensive,
# hard-to-reverse commitment is the ARCHITECTURE decision, not the deploy.
#
# This gate authorises architecture expansion. It does not authorise runtime
# mutation, and it never replaces the action-node approval.
#
# WHAT MAKES IT UNBYPASSABLE BY A CONVERSATIONAL "yes"
#
# Approval must NAME a canonical expansionDigest computed over the preview. A
# generic "continue", "approved", "lgtm", or a previously-granted action
# approval cannot contain a digest that did not exist when it was written, so
# none of them can approve an expansion. That is a structural property, not a
# matter of the agent being careful.
#
# NARROWING STAYS VALID, GROWTH DOES NOT
#
# verify accepts a plan COVERED by a recorded approval — same or fewer change
# classes, same or lower counts. Any increase escapes coverage and is refused,
# which is why a later delta increase silently invalidates the prior approval
# without anyone having to remember to revoke it.
#
# Exit codes
#   0  no approval-required class present, or the plan is covered by an approval
#   1  REFUSED — expansion present and not covered by a recorded approval
#   2  usage or runtime error
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
SESSION_STATE_LIB="$SCRIPT_DIR/session-state-lib.sh"
[[ -f "$SESSION_STATE_LIB" ]] || { echo "expansion-approval: required session-state library not found: $SESSION_STATE_LIB" >&2; exit 2; }
# shellcheck source=./session-state-lib.sh
source "$SESSION_STATE_LIB"

usage() {
  cat <<'EOF'
Usage:
  expansion-approval.sh preview --session-file <path> --planned-delta <json>
        [--reason <changeClass>=<why>]... [--rejected-alternative <text>]
        [--rollback <text>] [--shared-infrastructure true|false]

  expansion-approval.sh approve --session-file <path> --preview-file <path>
        (records the preview ONLY if the contract's approvalNote names its digest)

  expansion-approval.sh verify  --session-file <path> --planned-delta <json>

Approval is bound by:
  goal-contract.sh revise --approval-note "... expansion:<expansionDigest> ..."

A generic continuation is not an approval. There is no --force / --skip.
EOF
}

fail_usage() { echo "expansion-approval: $*" >&2; exit 2; }
fail_refuse() { echo "expansion-approval: REFUSED — $*" >&2; exit 1; }

command -v jq >/dev/null 2>&1 || fail_usage "jq is required"

sha256_stdin() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then shasum -a 256 | awk '{print $1}'
  elif command -v openssl >/dev/null 2>&1; then openssl dgst -sha256 | awk '{print $NF}'
  else echo "expansion-approval: sha256sum, shasum, or openssl is required" >&2; exit 2; fi
}

canon_digest() { printf 'sha256:%s' "$(jq -S -c '.' <<< "$1" | sha256_stdin)"; }

read_contract() {
  local session_file="$1" contract snapshot rc=0
  snapshot="$(mktemp "${TMPDIR:-/tmp}/expansion-approval-read.XXXXXX")" || fail_usage "could not create immutable session snapshot"
  session_state_read_object "$session_file" refuse "$snapshot" || rc=$?
  if [[ "$rc" -ne 0 ]]; then
    rm -f "$snapshot"
    return "$rc"
  fi
  contract="$(jq -c '.goalContract // empty' "$snapshot")"
  rm -f "$snapshot"
  [[ -n "$contract" ]] || fail_refuse "no Goal Contract at .goalContract in $session_file"
  printf '%s' "$contract"
}

# The classes in this plan that require an approval gate. TWO populations
# qualify, and missing the second one was a real gap the SCOPE-8 corpus caught:
#
#   gated       explicitly listed in approvalRequiredChangeClasses
#   undeclared  in NEITHER list — neither pre-approved nor gated
#
# An undeclared class is the more dangerous of the two: a contract that simply
# never mentioned virtual machines would otherwise wave them straight through,
# which is exactly the overbuilt-evaluation shape this IMP exists to refuse.
expanding_classes() {
  local contract="$1" delta="$2"
  jq -n -r --argjson c "$contract" --argjson d "$delta" '
    if ($c.semanticBoundary // null) == null then empty
    else
      ($c.semanticBoundary.approvalRequiredChangeClasses // []) as $gated
      | ($c.semanticBoundary.allowedChangeClasses // []) as $allowed
      | [ ($d.changeClasses // [])[] as $x
          | select(($gated | index($x)) or (($allowed | index($x)) | not))
          | $x ]
      | unique | .[]?
    end'
}

build_preview() {
  local contract="$1" delta="$2" reasons="$3" alternative="$4" rollback="$5" shared="$6"
  jq -n \
    --argjson c "$contract" --argjson d "$delta" --argjson r "$reasons" \
    --arg alt "$alternative" --arg rb "$rollback" --arg shared "$shared" '
    ($c.semanticBoundary.approvalRequiredChangeClasses // []) as $gated
    | ($c.semanticBoundary.allowedChangeClasses // []) as $allowed
    | {
        goalId: $c.goalId,
        revision: $c.revision,
        executionShape: $c.semanticBoundary.executionShape,
        expandingChangeClasses: ([ ($d.changeClasses // [])[] as $x
                                   | select(($gated | index($x)) or (($allowed | index($x)) | not))
                                   | $x ] | unique),
        plannedCounts: ($d | with_entries(select(.key | startswith("max")))),
        sharedInfrastructure: ($shared == "true"),
        contributionReasons: $r,
        rejectedNarrowerAlternative: $alt,
        rollbackBehavior: $rb
      }'
}

# --- preview ----------------------------------------------------------------
cmd_preview() {
  local session_file="" delta="" alternative="" rollback="" shared="false"
  local reason_keys=() reason_vals=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --session-file) session_file="${2:-}"; shift 2 ;;
      --planned-delta) delta="${2:-}"; shift 2 ;;
      --rejected-alternative) alternative="${2:-}"; shift 2 ;;
      --rollback) rollback="${2:-}"; shift 2 ;;
      --shared-infrastructure) shared="${2:-}"; shift 2 ;;
      --reason)
        [[ "${2:-}" == *"="* ]] || fail_usage "--reason must be <changeClass>=<why> (observed: ${2:-})"
        reason_keys[${#reason_keys[@]}]="${2%%=*}"
        reason_vals[${#reason_vals[@]}]="${2#*=}"
        shift 2 ;;
      -h|--help) usage; exit 0 ;;
      --force|--skip|--assume-approved) fail_usage "bypass-shaped flag '$1' does not exist" ;;
      *) fail_usage "unknown option: $1" ;;
    esac
  done
  [[ -n "$session_file" ]] || fail_usage "preview requires --session-file"
  [[ -n "$delta" ]] || fail_usage "preview requires --planned-delta"
  jq empty <<< "$delta" 2>/dev/null || fail_usage "--planned-delta is not valid JSON"

  local contract reasons i preview
  contract="$(read_contract "$session_file")"
  reasons='{}'
  i=0
  while [[ "$i" -lt "${#reason_keys[@]}" ]]; do
    reasons="$(jq -c --arg k "${reason_keys[$i]}" --arg v "${reason_vals[$i]}" '. + {($k): $v}' <<< "$reasons")"
    i=$((i + 1))
  done

  preview="$(build_preview "$contract" "$delta" "$reasons" "$alternative" "$rollback" "$shared")"

  # A preview that names no gated class is not an expansion at all. Say so
  # plainly rather than minting a digest nobody needs to approve.
  local expanding
  expanding="$(jq -r '.expandingChangeClasses | length' <<< "$preview")"
  if [[ "$expanding" -eq 0 ]]; then
    jq -n --argjson p "$preview" '$p + { expansion: false, expansionDigest: null }'
    return 0
  fi

  # Every gated class must carry a reason. "We need a VM" with no stated
  # contribution is the shape that slips through review.
  local missing
  missing="$(jq -r --argjson r "$reasons" '[ .expandingChangeClasses[] | select($r[.] // "" | length == 0) ] | join(", ")' <<< "$preview")"
  [[ -z "$missing" ]] || fail_usage "every expanding change class needs --reason <class>=<why>; missing: $missing"

  jq -n --argjson p "$preview" --arg dg "$(canon_digest "$preview")" \
    '$p + { expansion: true, expansionDigest: $dg }'
}

# --- approve ----------------------------------------------------------------
expansion_approval_mutation() {
  local locked_input="$1" candidate="$2" operation_context="$3"
  local preview="$4" digest="$5"
  local contract violations note session_id sb_digest current_rev stamped
  : "$operation_context"

  contract="$(jq -c '.goalContract // empty' "$locked_input")" || return 2
  if [[ -z "$contract" ]]; then
    echo "expansion-approval: REFUSED — no Goal Contract at .goalContract in the locked session object" >&2
    return 1
  fi
  violations="$(session_state_goal_contract_violations "$contract")" || return 2
  if [[ -n "$violations" ]]; then
    echo "expansion-approval: REFUSED — the locked Goal Contract failed complete validation: $violations" >&2
    return 1
  fi

  note="$(jq -r '.approval.approvalNote // ""' <<< "$contract")" || return 2
  case "$note" in
    *"expansion:$digest"*) ;;
    *)
      echo "expansion-approval: REFUSED — the Goal Contract approval note does not name expansion:$digest. Record it with: goal-contract.sh revise --approval-note \"... expansion:$digest ...\". A generic continuation or an action approval cannot approve an architecture expansion." >&2
      return 1
      ;;
  esac

  session_id="$(jq -r '.provenance.sessionId' <<< "$contract")" || return 2
  sb_digest="$(canon_digest "$(jq -c '.semanticBoundary // null' <<< "$contract")")" || return 2
  current_rev="$(jq -r '.revision' <<< "$contract")" || return 2
  stamped="$(jq -c --arg sid "$session_id" --arg sbd "$sb_digest" --argjson rev "$current_rev" \
    '. + { approvedSessionId: $sid, approvedSemanticBoundaryDigest: $sbd, approvedAtRevision: $rev }' <<< "$preview")" || return 2
  jq --argjson p "$stamped" \
    '. + { expansionApprovals: ((.expansionApprovals // []) + [$p]) }' "$locked_input" > "$candidate" || return 2
  echo "expansion-approval: recorded approval for $digest (session $session_id, revision $current_rev)"
}

cmd_approve() {
  local session_file="" preview_file=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --session-file) session_file="${2:-}"; shift 2 ;;
      --preview-file) preview_file="${2:-}"; shift 2 ;;
      -h|--help) usage; exit 0 ;;
      --force|--skip|--assume-approved) fail_usage "bypass-shaped flag '$1' does not exist" ;;
      *) fail_usage "unknown option: $1" ;;
    esac
  done
  [[ -n "$session_file" ]] || fail_usage "approve requires --session-file"
  [[ -n "$preview_file" ]] || fail_usage "approve requires --preview-file"
  [[ -f "$preview_file" ]] || fail_usage "preview file not found: $preview_file"
  jq empty "$preview_file" 2>/dev/null || fail_usage "preview file is not valid JSON"

  local preview digest
  preview="$(jq -c '.' "$preview_file")"
  digest="$(jq -r '.expansionDigest // ""' <<< "$preview")"
  [[ -n "$digest" && "$digest" != "null" ]] ||
    fail_usage "preview carries no expansionDigest — nothing to approve"

  # Recompute rather than trust: an edited preview must not be approvable.
  local body recomputed
  body="$(jq -c 'del(.expansion, .expansionDigest)' <<< "$preview")"
  recomputed="$(canon_digest "$body")"
  [[ "$recomputed" == "$digest" ]] ||
    fail_refuse "expansionDigest does not cover the preview body — the preview was edited after it was generated"

  local transaction_rc=0
  session_state_transaction "$session_file" refuse expansion-approval-approve \
    expansion_approval_mutation "$preview" "$digest" || transaction_rc=$?
  return "$transaction_rc"
}

# --- verify -----------------------------------------------------------------
cmd_verify() {
  local session_file="" delta=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --session-file) session_file="${2:-}"; shift 2 ;;
      --planned-delta) delta="${2:-}"; shift 2 ;;
      -h|--help) usage; exit 0 ;;
      --force|--skip|--assume-approved) fail_usage "bypass-shaped flag '$1' does not exist" ;;
      *) fail_usage "unknown option: $1" ;;
    esac
  done
  [[ -n "$session_file" ]] || fail_usage "verify requires --session-file"
  [[ -n "$delta" ]] || fail_usage "verify requires --planned-delta"
  jq empty <<< "$delta" 2>/dev/null || fail_usage "--planned-delta is not valid JSON"

  local contract expanding snapshot snapshot_rc=0
  snapshot="$(mktemp "${TMPDIR:-/tmp}/expansion-approval-verify.XXXXXX")" || fail_usage "could not create immutable session snapshot"
  session_state_read_object "$session_file" refuse "$snapshot" || snapshot_rc=$?
  if [[ "$snapshot_rc" -ne 0 ]]; then
    rm -f "$snapshot"
    return "$snapshot_rc"
  fi
  contract="$(jq -c '.goalContract // empty' "$snapshot")"
  if [[ -z "$contract" ]]; then
    rm -f "$snapshot"
    fail_refuse "no Goal Contract at .goalContract in $session_file"
  fi
  expanding="$(expanding_classes "$contract" "$delta" | tr '\n' ' ' | sed -E 's/[[:space:]]+$//')"
  if [[ -z "$expanding" ]]; then
    rm -f "$snapshot"
    echo "expansion-approval: OK (no approval-required change class in this plan)"
    return 0
  fi

  # COVERAGE, not equality: a recorded approval covers a plan whose gated
  # classes are a subset and whose counts do not exceed the approved ones.
  # Growth escapes coverage automatically; narrowing stays inside it.
  local covered sb_digest
  sb_digest="$(canon_digest "$(jq -c '.semanticBoundary // null' <<< "$contract")")"
  covered="$(jq -r --argjson d "$delta" --argjson c "$contract" --arg sbd "$sb_digest" '
    ($c.semanticBoundary.approvalRequiredChangeClasses // []) as $gated
    | ($c.semanticBoundary.allowedChangeClasses // []) as $allowed
    | ([ ($d.changeClasses // [])[] as $x
         | select(($gated | index($x)) or (($allowed | index($x)) | not))
         | $x ] | unique) as $want
    | ($d | with_entries(select(.key | startswith("max")))) as $counts
    | [ (.expansionApprovals // [])[]
        | select(.approvedSessionId == ($c.provenance.sessionId // ""))
        | select(.approvedSemanticBoundaryDigest == $sbd)
        | . as $a
        | select(($want - ($a.expandingChangeClasses // [])) | length == 0)
        | select([ $counts | to_entries[] | select(.value > (($a.plannedCounts[.key]) // 0)) ] | length == 0)
        | $a.expansionDigest ]
    | first // ""' "$snapshot")"
  rm -f "$snapshot"

  [[ -n "$covered" ]] ||
    fail_refuse "plan expands into [$expanding] with no recorded approval covering it under the current semantic boundary. Generate a preview, have the operator record its expansionDigest via 'goal-contract.sh revise --approval-note', then run 'expansion-approval.sh approve'."

  echo "expansion-approval: OK (covered by $covered)"
}

case "${1:-}" in
  preview) shift; cmd_preview "$@" ;;
  approve) shift; cmd_approve "$@" ;;
  verify) shift; cmd_verify "$@" ;;
  -h|--help) usage; exit 0 ;;
  "") usage >&2; exit 2 ;;
  *) fail_usage "unknown subcommand: $1" ;;
esac
