#!/usr/bin/env bash
# Run a spec's full scenario pass + transition guard against a PINNED revision.
#
# Why a worktree rather than the checkout you are sitting in: scenario receipts are
# stamped with the revision they were produced at, and scenario-state-resolve.sh
# derives that revision with `git -C "$SPEC_DIR" rev-parse HEAD`. That is per-tree,
# not global. In a shared checkout any commit -- including one from another session
# touching an unrelated file -- moves HEAD and invalidates every receipt already
# minted, so a long pass can never finish valid. A detached worktree has its own
# immovable HEAD, which makes concurrent commits structurally unable to drift it.
#
# Usage: scripts/scenario-receipts-pinned.sh <spec-dir> [pin-revision]
#        pin-revision defaults to current HEAD.
set -u

SPEC_DIR="${1:?usage: scenario-receipts-pinned.sh <spec-dir> [pin-revision]}"
MAIN="$(git rev-parse --show-toplevel)" || exit 1
PIN="${2:-$(git -C "$MAIN" rev-parse HEAD)}"

WT="${TMPDIR:-/tmp}/rl-cert-wt"
RUNDIR="${TMPDIR:-/tmp}/rl-verify"
mkdir -p "$RUNDIR"
DONE="$RUNDIR/cert.done"
rm -f "$DONE"

echo "CERT_PIN=$PIN"
date +%H:%M:%S

git -C "$MAIN" worktree remove --force "$WT" 2>/dev/null
git -C "$MAIN" worktree add --detach "$WT" "$PIN" >/dev/null 2>&1 || {
  echo "CERT_RESULT=WORKTREE_ADD_FAILED"
  echo fail > "$DONE"
  exit 2
}
# node_modules is large and read-only here; the runner's isolated copy links through it.
ln -sfn "$MAIN/node_modules" "$WT/node_modules"

cd "$WT" || exit 1
echo "CERT_WT_HEAD=$(git rev-parse HEAD)"

node scripts/scenario-receipts.mjs --spec "$SPEC_DIR" --all --quiet-child
echo "PASS_EXIT=$?"

# Proof the pin held: WT_HEAD_AFTER must equal CERT_PIN even if MAIN_HEAD_NOW moved.
echo "CERT_WT_HEAD_AFTER=$(git rev-parse HEAD)"
echo "CERT_MAIN_HEAD_NOW=$(git -C "$MAIN" rev-parse HEAD)"

bash .github/bubbles/scripts/state-transition-guard.sh "$SPEC_DIR"
echo "GUARD_EXIT=$?"
date +%H:%M:%S
echo done > "$DONE"
