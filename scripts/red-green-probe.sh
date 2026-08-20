#!/usr/bin/env bash
# Research-Lab — self-reverting RED/GREEN probe harness.
#
# Captures "intended RED, then same-command GREEN" evidence by mutating a
# committed module, running a command, reverting, and running the identical
# command again.
#
# Why this exists as a STANDALONE SCRIPT rather than an inline shell recipe:
# a `trap ... EXIT` set in an agent's persistent interactive shell never fires,
# because that shell does not exit between tool calls. Three truncated
# dispatches have therefore left a live mutation inside a shipped module. A
# standalone script's EXIT trap fires when the script exits — including on
# timeout, on SIGINT and on SIGTERM — so the revert is structural rather than
# a step someone has to remember.
#
# Usage:
#   scripts/red-green-probe.sh \
#     --file <path> --find <literal> --replace <literal> \
#     --label <label> [--bound <seconds>] [--summary-match <regex>] \
#     -- <command...>
#
# Exit codes:
#   0  RED and GREEN discriminated; file reverted and hash-verified
#   2  usage error
#   3  refused: --replace could exfiltrate data
#   4  refused: target file is untracked or dirty at start
#   5  refused: mutation did not land (--find absent, or --find == --replace)
#   6  revert verification failed (file does not match the committed blob)
#   7  refused: RED and GREEN produced the same outcome (probe did not
#      discriminate — the assertion under test cannot fail)
#
# Portability: macOS BSD userland and Linux GNU userland alike. No `sed -i`,
# no `timeout`, no GNU-only flags. No network access.

set -euo pipefail

readonly EXIT_USAGE=2
readonly EXIT_EXFIL=3
readonly EXIT_DIRTY=4
readonly EXIT_NO_MUTATION=5
readonly EXIT_REVERT=6
readonly EXIT_NO_DISCRIMINATION=7

PROBE_FILE=""
PROBE_FIND=""
PROBE_REPLACE=""
PROBE_LABEL=""
PROBE_BOUND=""
PROBE_SUMMARY_MATCH=""
PROBE_CMD=()

REPO_ROOT=""
REL_PATH=""
COMMITTED_HASH=""
CHILD_PID=""
WORK_DIR=""

die() {
  local code="$1"; shift
  printf 'red-green-probe: REFUSED — %s\n' "$*" >&2
  exit "$code"
}

usage() {
  printf '%s\n' \
    'Usage: scripts/red-green-probe.sh --file <path> --find <literal> --replace <literal>' \
    '         --label <label> [--bound <seconds>] [--summary-match <regex>] -- <command...>' >&2
}

# Rewrite anything that looks like an absolute home path so emitted evidence
# never carries a personal path into a report (the repo PII scan rejects those).
scrub() {
  RGP_ROOT="${REPO_ROOT:-}" perl -0777 -pe '
    my $r = $ENV{RGP_ROOT};
    s/\Q$r\E/./g if defined($r) && length($r);
    s{/Users/[^\s:,"\x27)\]]+}{<redacted-path>}g;
    s{/home/[^\s:,"\x27)\]]+}{<redacted-path>}g;
  '
}

# Count literal (non-regex) occurrences of $2 inside file $1.
count_literal() {
  RGP_NEEDLE="$2" perl -0777 -ne '
    BEGIN { $n = $ENV{RGP_NEEDLE} }
    my $c = () = /\Q$n\E/g;
    print $c;
  ' "$1"
}

working_hash() {
  git -C "$REPO_ROOT" hash-object -- "$REL_PATH"
}

# Restore the target from the index/HEAD and prove the restoration by hash.
# Idempotent by construction: a second call is a no-op that still verifies.
restore() {
  local rc=$?
  if [[ -n "$REPO_ROOT" && -n "$REL_PATH" && -n "$COMMITTED_HASH" ]]; then
    git -C "$REPO_ROOT" checkout -- "$REL_PATH" 2>/dev/null || true
    local now
    now="$(working_hash 2>/dev/null || printf 'unreadable')"
    if [[ "$now" != "$COMMITTED_HASH" ]]; then
      printf 'red-green-probe: REVERT FAILED for %s (committed=%s restored=%s)\n' \
        "$REL_PATH" "$COMMITTED_HASH" "$now" >&2
      printf 'red-green-probe: restore by hand with: git checkout -- %s\n' "$REL_PATH" >&2
      [[ -n "$WORK_DIR" ]] && rm -rf "$WORK_DIR"
      exit "$EXIT_REVERT"
    fi
  fi
  [[ -n "$WORK_DIR" ]] && rm -rf "$WORK_DIR"
  return "$rc"
}

on_signal() {
  local signum="$1"
  if [[ -n "$CHILD_PID" ]]; then
    kill -TERM "$CHILD_PID" 2>/dev/null || true
  fi
  trap - EXIT
  restore || true
  printf 'red-green-probe: interrupted by signal %s — target reverted\n' "$signum" >&2
  exit $((128 + signum))
}

# ---------- argument parsing ----------

while [[ $# -gt 0 ]]; do
  case "$1" in
    --file) shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--file requires a value'; }; PROBE_FILE="$1" ;;
    --find) shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--find requires a value'; }; PROBE_FIND="$1" ;;
    --replace) shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--replace requires a value'; }; PROBE_REPLACE="$1" ;;
    --label) shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--label requires a value'; }; PROBE_LABEL="$1" ;;
    --bound) shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--bound requires a value'; }; PROBE_BOUND="$1" ;;
    --summary-match) shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--summary-match requires a value'; }; PROBE_SUMMARY_MATCH="$1" ;;
    -h|--help) usage; exit 0 ;;
    --) shift; PROBE_CMD=("$@"); break ;;
    *) usage; die "$EXIT_USAGE" "unknown argument: $1" ;;
  esac
  shift
done

[[ -n "$PROBE_FILE" ]] || { usage; die "$EXIT_USAGE" '--file is required'; }
[[ -n "$PROBE_FIND" ]] || { usage; die "$EXIT_USAGE" '--find is required'; }
[[ -n "$PROBE_REPLACE" ]] || { usage; die "$EXIT_USAGE" '--replace is required'; }
[[ -n "$PROBE_LABEL" ]] || { usage; die "$EXIT_USAGE" '--label is required'; }
[[ ${#PROBE_CMD[@]} -gt 0 ]] || { usage; die "$EXIT_USAGE" 'a command is required after --'; }
if [[ -n "$PROBE_BOUND" && ! "$PROBE_BOUND" =~ ^[0-9]+$ ]]; then
  die "$EXIT_USAGE" '--bound must be a whole number of seconds'
fi

# ---------- safety rail: mutations must be value-free by construction ----------

exfil_reason=""
case "$PROBE_REPLACE" in
  *'fetch('*) exfil_reason='contains fetch(' ;;
  *'http://'*) exfil_reason='contains an http:// URL' ;;
  *'https://'*) exfil_reason='contains an https:// URL' ;;
  *'navigator.sendBeacon'*) exfil_reason='contains navigator.sendBeacon' ;;
esac
if [[ -z "$exfil_reason" ]] && printf '%s' "$PROBE_REPLACE" | grep -qiE 'xmlhttprequest'; then
  exfil_reason='contains XMLHttpRequest'
fi
if [[ -z "$exfil_reason" ]] && printf '%s' "$PROBE_REPLACE" \
  | grep -qE 'location\.[A-Za-z_$][A-Za-z0-9_$]*[[:space:]]*=[^=]'; then
  exfil_reason='assigns to a location.* property'
fi
if [[ -z "$exfil_reason" ]] && printf '%s' "$PROBE_REPLACE" \
  | grep -qE 'location\.(assign|replace)[[:space:]]*\('; then
  exfil_reason='calls location.assign / location.replace'
fi
if [[ -n "$exfil_reason" ]]; then
  die "$EXIT_EXFIL" \
    "--replace $exfil_reason. A probe mutation must be value-free by construction: it may not open a network sink or a navigation sink that could carry the operator's data off the page."
fi

# ---------- resolve the target inside its repository ----------

[[ -f "$PROBE_FILE" ]] || die "$EXIT_DIRTY" "target file does not exist: $(printf '%s' "$PROBE_FILE" | scrub)"

file_dir="$(cd "$(dirname "$PROBE_FILE")" && pwd)"
file_base="$(basename "$PROBE_FILE")"

REPO_ROOT="$(git -C "$file_dir" rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$REPO_ROOT" ]] || die "$EXIT_DIRTY" 'target file is not inside a Git worktree'

REL_PATH="$(git -C "$file_dir" ls-files --full-name --error-unmatch -- "$file_base" 2>/dev/null || true)"
[[ -n "$REL_PATH" ]] || die "$EXIT_DIRTY" \
  "target file is not tracked by Git, so there is no committed blob to revert to: $file_base"

git -C "$REPO_ROOT" rev-parse --verify HEAD >/dev/null 2>&1 \
  || die "$EXIT_DIRTY" 'repository has no commit yet, so there is no committed blob to revert to'

# 1. A probe must start from a known-clean baseline. Reverting a dirty file
#    would discard real, uncommitted work.
if [[ -n "$(git -C "$REPO_ROOT" status --porcelain -- "$REL_PATH")" ]]; then
  die "$EXIT_DIRTY" \
    "$REL_PATH is dirty. A probe reverts by checking the file out, which would discard the uncommitted change. Commit or stash it first."
fi

COMMITTED_HASH="$(git -C "$REPO_ROOT" rev-parse "HEAD:$REL_PATH")"
start_hash="$(working_hash)"
[[ "$start_hash" == "$COMMITTED_HASH" ]] || die "$EXIT_DIRTY" \
  "$REL_PATH does not match its committed blob even though Git reports it clean"

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/rgprobe.XXXXXX")"
red_out="$WORK_DIR/red.out"
green_out="$WORK_DIR/green.out"

# 2. Arm the revert BEFORE anything is mutated. This ordering is the entire
#    point of the harness: every later exit path, including a kill, reverts.
trap 'on_signal 2' INT
trap 'on_signal 15' TERM
trap restore EXIT

# ---------- 3. apply the mutation ----------

occurrences="$(count_literal "$PROBE_FILE" "$PROBE_FIND")"

RGP_FIND="$PROBE_FIND" RGP_REPLACE="$PROBE_REPLACE" perl -0777 -i -pe '
  BEGIN { $f = $ENV{RGP_FIND}; $r = $ENV{RGP_REPLACE} }
  s/\Q$f\E/$r/g;
' "$PROBE_FILE"

# ---------- 4. verify the mutation actually landed ----------

mutated_hash="$(working_hash)"
if [[ "$mutated_hash" == "$COMMITTED_HASH" ]]; then
  die "$EXIT_NO_MUTATION" \
    "the mutation did not change $REL_PATH — --find matched nothing (${occurrences} occurrence(s)) or --find equals --replace. A probe that silently mutates nothing produces a false GREEN."
fi
replaced="$(count_literal "$PROBE_FILE" "$PROBE_REPLACE")"
if [[ "$replaced" -eq 0 ]]; then
  die "$EXIT_NO_MUTATION" "the replacement literal is not present in $REL_PATH after substitution"
fi

# ---------- 5. run the command under the mutation — this is RED ----------

run_command() {
  local out="$1"
  local rc=0
  if [[ -n "$PROBE_BOUND" ]]; then
    perl -e 'alarm shift @ARGV; exec @ARGV' "$PROBE_BOUND" "${PROBE_CMD[@]}" >"$out" 2>&1 &
  else
    "${PROBE_CMD[@]}" >"$out" 2>&1 &
  fi
  CHILD_PID=$!
  # `wait` (unlike a foreground child) is interruptible, so a signal reaches
  # the trap immediately instead of after the command finishes. The `|| rc=$?`
  # form keeps errexit armed for the rest of the script: toggling `set -e`
  # inside a function would leak back to the caller, because `set` is global.
  wait "$CHILD_PID" || rc=$?
  CHILD_PID=""
  return "$rc"
}

red_rc=0
run_command "$red_out" || red_rc=$?

# ---------- 6. revert explicitly, then prove it by hash ----------

git -C "$REPO_ROOT" checkout -- "$REL_PATH"
restored_hash="$(working_hash)"
if [[ "$restored_hash" != "$COMMITTED_HASH" ]]; then
  printf 'red-green-probe: REVERT FAILED for %s (committed=%s restored=%s)\n' \
    "$REL_PATH" "$COMMITTED_HASH" "$restored_hash" >&2
  exit "$EXIT_REVERT"
fi

# ---------- 7. run the identical command again — this is GREEN ----------

green_rc=0
run_command "$green_out" || green_rc=$?

# ---------- 8. emit the evidence block ----------

summary_of() {
  RGP_MATCH="$PROBE_SUMMARY_MATCH" perl -0777 -ne '
    BEGIN { $p = $ENV{RGP_MATCH} }
    my @lines = grep { /\S/ } split /\n/, $_;
    if (defined($p) && length($p)) {
      my @hit = grep { /$p/ } @lines;
      @lines = @hit if @hit;
    }
    my $last = @lines ? $lines[-1] : "(no output)";
    $last = substr($last, 0, 200);
    print $last;
  ' "$1" | scrub
}

red_summary="$(summary_of "$red_out")"
green_summary="$(summary_of "$green_out")"
cmd_display="$(printf '%s ' "${PROBE_CMD[@]}" | scrub)"

printf '%s\n' '=== RED/GREEN PROBE EVIDENCE ==='
printf 'label:            %s\n' "$PROBE_LABEL"
printf 'file:             %s\n' "$REL_PATH"
printf 'mutation:         %s  ->  %s   (%s occurrence(s))\n' \
  "$PROBE_FIND" "$PROBE_REPLACE" "$occurrences"
printf 'command:          %s\n' "${cmd_display% }"
printf 'red-exit:         %s\n' "$red_rc"
printf 'red-summary:      %s\n' "$red_summary"
printf 'green-exit:       %s\n' "$green_rc"
printf 'green-summary:    %s\n' "$green_summary"
printf 'revert-verified:  yes (committed=%s restored=%s)\n' "$COMMITTED_HASH" "$restored_hash"

# ---------- 9. a probe that did not discriminate is not evidence ----------

if [[ "$red_rc" -eq "$green_rc" ]]; then
  printf 'discriminating:   NO (red-exit %s == green-exit %s)\n' "$red_rc" "$green_rc"
  printf '%s\n' '=== END RED/GREEN PROBE EVIDENCE ==='
  die "$EXIT_NO_DISCRIMINATION" \
    "RED and GREEN produced the same outcome (both exited $red_rc). The mutation did not make the command fail, so the assertion under test cannot fail and this is not RED/GREEN evidence."
fi

printf 'discriminating:   yes (red-exit %s != green-exit %s)\n' "$red_rc" "$green_rc"
printf '%s\n' '=== END RED/GREEN PROBE EVIDENCE ==='
