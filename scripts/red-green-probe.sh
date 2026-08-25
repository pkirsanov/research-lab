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
#     [--find <literal> --replace <literal>]... \
#     [--file <path> --find <literal> --replace <literal>]... \
#     --label <label> [--bound <seconds>] [--summary-match <regex>] \
#     -- <command...>
#
# COMPOSED MUTATIONS. --find/--replace may repeat, and --file may repeat, so one
# probe can express a case that needs several edits across several files. Each
# --find/--replace pair binds to the most recent --file, which makes the single
# pair form a special case of the general one rather than a separate mode.
#
# This exists because an assertion can be OVER-DETERMINED: defended by several
# independent layers, so that removing any one alone leaves the others
# sufficient and the probe correctly reports exit 7. Such an assertion is not
# vacuous, but its true adversarial case is a COMBINATION, and a harness that
# applies one edit to one file cannot state it. Composing mutations lets the
# probe drive the case a design actually names instead of the largest case the
# harness happened to be able to express.
#
# The revert is ALL-OR-NOTHING across every target: each file is registered and
# hash-pinned BEFORE the first mutation is applied, so a failure part-way
# through — or a signal — still reverts every file that was already changed.
#
# Exit codes:
#   0  RED and GREEN discriminated; every file reverted and hash-verified
#   2  usage error
#   3  refused: a --replace could exfiltrate data
#   4  refused: a target file is untracked or dirty at start
#   5  refused: a mutation did not land (--find absent, or --find == --replace)
#   6  revert verification failed (a file does not match its committed blob)
#   7  refused: RED and GREEN produced the same outcome (probe did not
#      discriminate — the assertion under test cannot fail)
#   8  refused: --summary-match was supplied but matched no line in the RED
#      and/or GREEN capture, so the summary channel could not be read
#
# The verdict has two channels:
#   * exit status — always compared.
#   * summary line — compared ONLY when --summary-match is supplied, and
#     compared with elapsed-time tokens normalised out ("1 passed (3.7s)" and
#     "1 passed (2.8s)" are the same outcome). The probe discriminates if
#     EITHER channel differs; exit 7 means both agreed.
# The second channel exists because some suites exit non-zero even unmutated
# (a teardown fault that force-kills a worker after every test passed). Without
# it such a probe is unprovable, and the only workaround would be to swallow
# the command's exit code — which would destroy the guarantee entirely.
#
# Portability: macOS BSD userland and Linux GNU userland alike. No `sed -i`,
# no `timeout` (the optional --bound uses perl's alarm), no GNU-only flags.
# No network access.

set -euo pipefail

readonly EXIT_USAGE=2
readonly EXIT_EXFIL=3
readonly EXIT_DIRTY=4
readonly EXIT_NO_MUTATION=5
readonly EXIT_REVERT=6
readonly EXIT_NO_DISCRIMINATION=7
readonly EXIT_SUMMARY_UNMATCHED=8

# One entry per --find/--replace pair, in declaration order. MUT_FILE[i] is the
# --file in force when that pair was declared.
MUT_FILE=()
MUT_FIND=()
MUT_REPLACE=()
MUT_OCCURRENCES=()

# One entry per DISTINCT target file, deduplicated. These carry the revert.
TARGET_ABS=()
TARGET_REL=()
TARGET_HASH=()

PROBE_CURRENT_FILE=""
PROBE_PENDING_FIND=""
PROBE_HAVE_PENDING_FIND=0
PROBE_LABEL=""
PROBE_BOUND=""
PROBE_SUMMARY_MATCH=""
PROBE_CMD=()

REPO_ROOT=""
CHILD_PID=""
WORK_DIR=""
TARGETS_ARMED=0

die() {
  local code="$1"; shift
  printf 'red-green-probe: REFUSED — %s\n' "$*" >&2
  exit "$code"
}

usage() {
  printf '%s\n' \
    'Usage: scripts/red-green-probe.sh --file <path> --find <literal> --replace <literal>' \
    '         [--find <literal> --replace <literal>]... [--file <path> ...]' \
    '         --label <label> [--bound <seconds>] [--summary-match <regex>] -- <command...>' \
    '' \
    '  --find/--replace may repeat; each pair binds to the most recent --file.' >&2
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
  git -C "$REPO_ROOT" hash-object -- "$1"
}

# Restore EVERY registered target from the index/HEAD and prove each restoration
# by hash. All-or-nothing: one loop over the whole target set, and a single
# mismatch anywhere is a revert failure. Idempotent by construction, so a second
# call is a no-op that still verifies. Every target is registered and pinned
# before the first mutation lands, so this covers a partial mutation run too.
restore_targets() {
  local failed=0 idx now
  [[ "$TARGETS_ARMED" -eq 1 ]] || return 0
  for (( idx = 0; idx < ${#TARGET_REL[@]}; idx++ )); do
    git -C "$REPO_ROOT" checkout -- "${TARGET_REL[$idx]}" 2>/dev/null || true
    now="$(working_hash "${TARGET_REL[$idx]}" 2>/dev/null || printf 'unreadable')"
    if [[ "$now" != "${TARGET_HASH[$idx]}" ]]; then
      failed=1
      printf 'red-green-probe: REVERT FAILED for %s (committed=%s restored=%s)\n' \
        "${TARGET_REL[$idx]}" "${TARGET_HASH[$idx]}" "$now" >&2
      printf 'red-green-probe: restore by hand with: git checkout -- %s\n' "${TARGET_REL[$idx]}" >&2
    fi
  done
  return "$failed"
}

# Restore the targets from the index/HEAD and prove the restorations by hash.
restore() {
  local rc=$?
  if [[ -n "$REPO_ROOT" ]]; then
    if ! restore_targets; then
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
    --file)
      shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--file requires a value'; }
      # A --file may not arrive between a --find and its --replace: that would
      # leave the pair straddling two targets and silently bind it to whichever
      # file parsing happened to reach last.
      [[ "$PROBE_HAVE_PENDING_FIND" -eq 0 ]] || { usage; die "$EXIT_USAGE" \
        "--file appeared after --find '$PROBE_PENDING_FIND' but before its --replace, so that mutation has no complete definition"; }
      PROBE_CURRENT_FILE="$1"
      ;;
    --find)
      shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--find requires a value'; }
      [[ -n "$PROBE_CURRENT_FILE" ]] || { usage; die "$EXIT_USAGE" \
        "--find '$1' appeared before any --file, so there is no target to bind it to"; }
      [[ "$PROBE_HAVE_PENDING_FIND" -eq 0 ]] || { usage; die "$EXIT_USAGE" \
        "--find '$1' followed --find '$PROBE_PENDING_FIND' with no --replace between them"; }
      PROBE_PENDING_FIND="$1"
      PROBE_HAVE_PENDING_FIND=1
      ;;
    --replace)
      shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--replace requires a value'; }
      [[ "$PROBE_HAVE_PENDING_FIND" -eq 1 ]] || { usage; die "$EXIT_USAGE" \
        "--replace '$1' has no preceding --find"; }
      MUT_FILE+=("$PROBE_CURRENT_FILE")
      MUT_FIND+=("$PROBE_PENDING_FIND")
      MUT_REPLACE+=("$1")
      PROBE_PENDING_FIND=""
      PROBE_HAVE_PENDING_FIND=0
      ;;
    --label) shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--label requires a value'; }; PROBE_LABEL="$1" ;;
    --bound) shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--bound requires a value'; }; PROBE_BOUND="$1" ;;
    --summary-match) shift; [[ $# -gt 0 ]] || { usage; die "$EXIT_USAGE" '--summary-match requires a value'; }; PROBE_SUMMARY_MATCH="$1" ;;
    -h|--help) usage; exit 0 ;;
    --) shift; PROBE_CMD=("$@"); break ;;
    *) usage; die "$EXIT_USAGE" "unknown argument: $1" ;;
  esac
  shift
done

[[ -n "$PROBE_CURRENT_FILE" ]] || { usage; die "$EXIT_USAGE" '--file is required'; }
[[ "$PROBE_HAVE_PENDING_FIND" -eq 0 ]] || { usage; die "$EXIT_USAGE" \
  "--find '$PROBE_PENDING_FIND' has no --replace, so that mutation is incomplete"; }
[[ ${#MUT_FIND[@]} -gt 0 ]] || { usage; die "$EXIT_USAGE" 'at least one --find/--replace pair is required'; }
[[ -n "$PROBE_LABEL" ]] || { usage; die "$EXIT_USAGE" '--label is required'; }
[[ ${#PROBE_CMD[@]} -gt 0 ]] || { usage; die "$EXIT_USAGE" 'a command is required after --'; }
if [[ -n "$PROBE_BOUND" && ! "$PROBE_BOUND" =~ ^[0-9]+$ ]]; then
  die "$EXIT_USAGE" '--bound must be a whole number of seconds'
fi

# ---------- safety rail: mutations must be value-free by construction ----------

# Every --replace is screened, not just the first. A composed probe otherwise
# offers a way to smuggle a sink in behind a benign-looking opening pair.
for (( m = 0; m < ${#MUT_REPLACE[@]}; m++ )); do
  candidate="${MUT_REPLACE[$m]}"
  exfil_reason=""
  case "$candidate" in
    *'fetch('*) exfil_reason='contains fetch(' ;;
    *'http://'*) exfil_reason='contains an http:// URL' ;;
    *'https://'*) exfil_reason='contains an https:// URL' ;;
    *'navigator.sendBeacon'*) exfil_reason='contains navigator.sendBeacon' ;;
  esac
  if [[ -z "$exfil_reason" ]] && printf '%s' "$candidate" | grep -qiE 'xmlhttprequest'; then
    exfil_reason='contains XMLHttpRequest'
  fi
  if [[ -z "$exfil_reason" ]] && printf '%s' "$candidate" \
    | grep -qE 'location\.[A-Za-z_$][A-Za-z0-9_$]*[[:space:]]*=[^=]'; then
    exfil_reason='assigns to a location.* property'
  fi
  if [[ -z "$exfil_reason" ]] && printf '%s' "$candidate" \
    | grep -qE 'location\.(assign|replace)[[:space:]]*\('; then
    exfil_reason='calls location.assign / location.replace'
  fi
  if [[ -n "$exfil_reason" ]]; then
    die "$EXIT_EXFIL" \
      "--replace #$((m + 1)) $exfil_reason. A probe mutation must be value-free by construction: it may not open a network sink or a navigation sink that could carry the operator's data off the page."
  fi
done

# ---------- resolve every target inside its repository ----------

# Each distinct --file is validated and hash-pinned here, before ANY mutation is
# applied. That ordering is what makes the revert all-or-nothing: by the time
# the first byte changes, the harness already knows the committed blob of every
# file it may touch, so a failure at mutation 2 still restores mutation 1.
for (( m = 0; m < ${#MUT_FILE[@]}; m++ )); do
  probe_file="${MUT_FILE[$m]}"

  # Skip a file already registered by an earlier pair.
  already=0
  for (( t = 0; t < ${#TARGET_ABS[@]}; t++ )); do
    if [[ "${TARGET_ABS[$t]}" == "$probe_file" ]]; then already=1; break; fi
  done
  [[ "$already" -eq 0 ]] || continue

  [[ -f "$probe_file" ]] || die "$EXIT_DIRTY" "target file does not exist: $(printf '%s' "$probe_file" | scrub)"

  file_dir="$(cd "$(dirname "$probe_file")" && pwd)"
  file_base="$(basename "$probe_file")"

  file_root="$(git -C "$file_dir" rev-parse --show-toplevel 2>/dev/null || true)"
  [[ -n "$file_root" ]] || die "$EXIT_DIRTY" "target file is not inside a Git worktree: $file_base"

  if [[ -z "$REPO_ROOT" ]]; then
    REPO_ROOT="$file_root"
  elif [[ "$file_root" != "$REPO_ROOT" ]]; then
    # One revert path, one repository. Spanning two worktrees would mean two
    # independent checkouts and no way to keep the revert atomic across them.
    die "$EXIT_DIRTY" \
      "target $file_base is in a different Git worktree from the earlier targets, so the revert could not be kept all-or-nothing"
  fi

  rel_path="$(git -C "$file_dir" ls-files --full-name --error-unmatch -- "$file_base" 2>/dev/null || true)"
  [[ -n "$rel_path" ]] || die "$EXIT_DIRTY" \
    "target file is not tracked by Git, so there is no committed blob to revert to: $file_base"

  git -C "$REPO_ROOT" rev-parse --verify HEAD >/dev/null 2>&1 \
    || die "$EXIT_DIRTY" 'repository has no commit yet, so there is no committed blob to revert to'

  # 1. A probe must start from a known-clean baseline. Reverting a dirty file
  #    would discard real, uncommitted work.
  if [[ -n "$(git -C "$REPO_ROOT" status --porcelain -- "$rel_path")" ]]; then
    die "$EXIT_DIRTY" \
      "$rel_path is dirty. A probe reverts by checking the file out, which would discard the uncommitted change. Commit or stash it first."
  fi

  committed_hash="$(git -C "$REPO_ROOT" rev-parse "HEAD:$rel_path")"
  start_hash="$(working_hash "$rel_path")"
  [[ "$start_hash" == "$committed_hash" ]] || die "$EXIT_DIRTY" \
    "$rel_path does not match its committed blob even though Git reports it clean"

  TARGET_ABS+=("$probe_file")
  TARGET_REL+=("$rel_path")
  TARGET_HASH+=("$committed_hash")
done

# Resolve each mutation's file to its registered index once, so the mutation
# loop below never re-derives a path.
MUT_TARGET=()
for (( m = 0; m < ${#MUT_FILE[@]}; m++ )); do
  for (( t = 0; t < ${#TARGET_ABS[@]}; t++ )); do
    if [[ "${TARGET_ABS[$t]}" == "${MUT_FILE[$m]}" ]]; then MUT_TARGET+=("$t"); break; fi
  done
done

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/rgprobe.XXXXXX")"
red_out="$WORK_DIR/red.out"
green_out="$WORK_DIR/green.out"

# 2. Arm the revert BEFORE anything is mutated. This ordering is the entire
#    point of the harness: every later exit path, including a kill, reverts.
TARGETS_ARMED=1
trap 'on_signal 2' INT
trap 'on_signal 15' TERM
trap restore EXIT

# ---------- 3. apply the mutations, in declaration order ----------

for (( m = 0; m < ${#MUT_FIND[@]}; m++ )); do
  mut_path="${MUT_FILE[$m]}"
  mut_rel="${TARGET_REL[${MUT_TARGET[$m]}]}"
  MUT_OCCURRENCES+=("$(count_literal "$mut_path" "${MUT_FIND[$m]}")")

  before_hash="$(working_hash "$mut_rel")"

  RGP_FIND="${MUT_FIND[$m]}" RGP_REPLACE="${MUT_REPLACE[$m]}" perl -0777 -i -pe '
    BEGIN { $f = $ENV{RGP_FIND}; $r = $ENV{RGP_REPLACE} }
    s/\Q$f\E/$r/g;
  ' "$mut_path"

  # ---------- 4. verify THIS mutation actually landed ----------
  #
  # Compared against the hash taken immediately before this pair, not against
  # the committed blob: with several pairs on one file, an earlier pair has
  # already moved the file off its committed hash, so a committed-blob
  # comparison would report a no-op pair as having landed.
  after_hash="$(working_hash "$mut_rel")"
  if [[ "$after_hash" == "$before_hash" ]]; then
    die "$EXIT_NO_MUTATION" \
      "mutation #$((m + 1)) did not change $mut_rel — --find matched nothing (${MUT_OCCURRENCES[$m]} occurrence(s)) or --find equals --replace. A probe that silently mutates nothing produces a false GREEN."
  fi
  replaced="$(count_literal "$mut_path" "${MUT_REPLACE[$m]}")"
  if [[ "$replaced" -eq 0 ]]; then
    die "$EXIT_NO_MUTATION" "the replacement literal of mutation #$((m + 1)) is not present in $mut_rel after substitution"
  fi
done

# ---------- 5. run the command under the mutation — this is RED ----------

run_command() {
  local out="$1"
  local rc=0
  # Both branches go through one perl wrapper. It forks, optionally arms an
  # alarm, and translates the child's fate into an ordinary exit status. That
  # matters for more than the bound: a background job that dies by a signal
  # makes bash print its own job notice naming this script by absolute path,
  # and the repo PII scan rejects those. Translating rather than suppressing
  # keeps every byte the command produced in "$out".
  perl -e '
    my $limit = shift @ARGV;
    my $pid = fork();
    defined $pid or exit 127;
    if ($pid == 0) { exec { $ARGV[0] } @ARGV; exit 127 }
    $SIG{ALRM} = sub { kill "TERM", $pid; waitpid($pid, 0); exit 142 };
    $SIG{TERM} = $SIG{INT} = sub { kill "TERM", $pid; waitpid($pid, 0); exit 143 };
    alarm $limit if $limit > 0;
    waitpid($pid, 0);
    alarm 0;
    my $st = $?;
    exit($st & 127 ? 128 + ($st & 127) : $st >> 8);
  ' "${PROBE_BOUND:-0}" "${PROBE_CMD[@]}" >"$out" 2>&1 &
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

if ! restore_targets; then
  exit "$EXIT_REVERT"
fi
restored_note=""
for (( t = 0; t < ${#TARGET_REL[@]}; t++ )); do
  restored_note="${restored_note:+$restored_note, }$(printf '%s committed=%s restored=%s' \
    "${TARGET_REL[$t]}" "${TARGET_HASH[$t]}" "$(working_hash "${TARGET_REL[$t]}")")"
done

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

# The verdict-bearing form of the same read: the matching line itself, or the
# empty string when the pattern matched nothing. summary_of() above falls back
# to the last line of output when the pattern misses, which is right for
# DISPLAY and wrong for a VERDICT — a fallback line would silently be compared
# as though it were the summary.
summary_matched_line() {
  RGP_MATCH="$PROBE_SUMMARY_MATCH" perl -0777 -ne '
    BEGIN { $p = $ENV{RGP_MATCH} }
    my @hit = grep { /$p/ } grep { /\S/ } split /\n/, $_;
    print substr($hit[-1], 0, 200) if @hit;
  ' "$1" | scrub
}

# Most runners embed elapsed time in the very line that carries the verdict:
# Playwright prints "1 passed (3.7s)". Wall-clock time is not an outcome, so
# comparing the raw lines makes RED and GREEN differ on timing alone and
# reports an INERT mutation as discriminating — which is how a mutation that a
# substring assertion matched straight past was still scored as evidence.
# Normalise the volatile tokens out before comparing. The raw lines are still
# printed above, so nothing is hidden from the reviewer.
normalize_summary() {
  perl -0777 -pe '
    s/\((?:\s*\d+(?:\.\d+)?\s*(?:ms|s|m|h))+\s*\)/(<elapsed>)/g;
    s/\b\d+(?:\.\d+)?\s*ms\b/<elapsed>/g;
  '
}

red_summary="$(summary_of "$red_out")"
green_summary="$(summary_of "$green_out")"
red_matched=""
green_matched=""
red_compared=""
green_compared=""
if [[ -n "$PROBE_SUMMARY_MATCH" ]]; then
  red_matched="$(summary_matched_line "$red_out")"
  green_matched="$(summary_matched_line "$green_out")"
  red_compared="$(printf '%s' "$red_matched" | normalize_summary)"
  green_compared="$(printf '%s' "$green_matched" | normalize_summary)"
fi
# %q so the emitted command line is copy-runnable rather than merely indicative.
cmd_display="$(printf '%q ' "${PROBE_CMD[@]}" | scrub)"

printf '%s\n' '=== RED/GREEN PROBE EVIDENCE ==='
printf 'label:            %s\n' "$PROBE_LABEL"
# The single-pair form prints exactly the lines it always printed, so evidence
# already recorded against earlier rounds stays comparable byte for byte. The
# composed form enumerates instead, because one `file:` line cannot describe a
# case that spans two.
if [[ ${#MUT_FIND[@]} -eq 1 ]]; then
  printf 'file:             %s\n' "${TARGET_REL[0]}"
  printf 'mutation:         %s  ->  %s   (%s occurrence(s))\n' \
    "${MUT_FIND[0]}" "${MUT_REPLACE[0]}" "${MUT_OCCURRENCES[0]}"
else
  printf 'files:            %s\n' "$(printf '%s ' "${TARGET_REL[@]}" | sed 's/ $//')"
  printf 'mutations:        %s composed, applied together\n' "${#MUT_FIND[@]}"
  for (( m = 0; m < ${#MUT_FIND[@]}; m++ )); do
    printf '  mutation %s:     [%s]  %s  ->  %s   (%s occurrence(s))\n' \
      "$((m + 1))" "${TARGET_REL[${MUT_TARGET[$m]}]}" \
      "${MUT_FIND[$m]}" "${MUT_REPLACE[$m]}" "${MUT_OCCURRENCES[$m]}"
  done
fi
printf 'command:          %s\n' "${cmd_display% }"
printf 'red-exit:         %s\n' "$red_rc"
printf 'red-summary:      %s\n' "$red_summary"
printf 'green-exit:       %s\n' "$green_rc"
printf 'green-summary:    %s\n' "$green_summary"
if [[ -n "$PROBE_SUMMARY_MATCH" ]]; then
  printf 'summary-compared: %s  vs  %s   (elapsed time normalised out)\n' \
    "$red_compared" "$green_compared"
fi
if [[ ${#TARGET_REL[@]} -eq 1 ]]; then
  printf 'revert-verified:  yes (committed=%s restored=%s)\n' \
    "${TARGET_HASH[0]}" "$(working_hash "${TARGET_REL[0]}")"
else
  printf 'revert-verified:  yes, all %s targets (%s)\n' "${#TARGET_REL[@]}" "$restored_note"
fi

# ---------- 9. a probe that did not discriminate is not evidence ----------

# An unreadable channel is a failure, not a pass: the harness cannot verify
# what it cannot read, and treating a miss as "no difference" would turn a
# broken pattern into a silent exit-7, or worse into a false GREEN.
if [[ -n "$PROBE_SUMMARY_MATCH" ]]; then
  # Plain `if` rather than `[[ ... ]] && assign`: under errexit a false test as
  # the whole statement would exit the script instead of skipping the assign.
  unread=""
  if [[ -z "$red_matched" ]]; then unread="RED"; fi
  if [[ -z "$green_matched" ]]; then unread="${unread:+$unread and }GREEN"; fi
  if [[ -n "$unread" ]]; then
    printf 'discriminating:   UNREADABLE (--summary-match matched no line in the %s capture)\n' "$unread"
    printf '%s\n' '=== END RED/GREEN PROBE EVIDENCE ==='
    die "$EXIT_SUMMARY_UNMATCHED" \
      "--summary-match '$PROBE_SUMMARY_MATCH' matched no line in the $unread capture. The summary channel carries part of the verdict, so an unmatched pattern makes the probe unverifiable — the harness cannot verify what it cannot read."
  fi
fi

discriminating_reason=""
if [[ "$red_rc" -ne "$green_rc" ]]; then
  discriminating_reason="$(printf 'exit %s != %s' "$red_rc" "$green_rc")"
elif [[ -n "$PROBE_SUMMARY_MATCH" && "$red_compared" != "$green_compared" ]]; then
  discriminating_reason="$(printf 'summary differs: "%s" vs "%s"' "$red_matched" "$green_matched")"
fi

if [[ -z "$discriminating_reason" ]]; then
  if [[ -n "$PROBE_SUMMARY_MATCH" ]]; then
    printf 'discriminating:   NO (both channels agree: exit %s == %s, summary "%s" identical once elapsed time is normalised)\n' \
      "$red_rc" "$green_rc" "$red_compared"
    printf '%s\n' '=== END RED/GREEN PROBE EVIDENCE ==='
    die "$EXIT_NO_DISCRIMINATION" \
      "RED and GREEN produced the same outcome on both channels (both exited $red_rc, and the --summary-match line was \"$red_compared\" in each once elapsed time was normalised out). The mutation did not change what the command reported, so the assertion under test cannot fail and this is not RED/GREEN evidence."
  fi
  printf 'discriminating:   NO (red-exit %s == green-exit %s)\n' "$red_rc" "$green_rc"
  printf '%s\n' '=== END RED/GREEN PROBE EVIDENCE ==='
  die "$EXIT_NO_DISCRIMINATION" \
    "RED and GREEN produced the same outcome (both exited $red_rc). The mutation did not make the command fail, so the assertion under test cannot fail and this is not RED/GREEN evidence."
fi

printf 'discriminating:   yes (%s)\n' "$discriminating_reason"
printf '%s\n' '=== END RED/GREEN PROBE EVIDENCE ==='
