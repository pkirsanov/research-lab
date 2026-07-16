#!/usr/bin/env bash
#
# Scheduler entry point for Actionable Market Brief publication.
#
# launchd invokes this script from the developer checkout. The current worker
# implementation runs against a disposable clone of origin/main so editor changes,
# staged files, and an interrupted prior refresh can never block or overwrite the
# developer worktree. This also avoids executing stale worker code from origin.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="${BRIEF_SCHEDULE_SOURCE_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
BRANCH="${BRIEF_SCHEDULE_BRANCH:-main}"
REMOTE_NAME="${BRIEF_SCHEDULE_REMOTE:-origin}"
LOCK_DIR="${BRIEF_SCHEDULE_LOCK_DIR:-${TMPDIR:-/tmp}/research-lab-brief-publisher.lock}"

export PATH="/opt/homebrew/bin:/opt/local/bin:/usr/local/bin:/usr/bin:/bin"
export BRIEF_NARRATIVE_ATTEMPTS="${BRIEF_NARRATIVE_ATTEMPTS:-1}"
export BRIEF_NARRATIVE_TIMEOUT="${BRIEF_NARRATIVE_TIMEOUT:-1800}"
export BRIEF_REPAIR_INVALID_BASELINE="${BRIEF_REPAIR_INVALID_BASELINE:-1}"
GIT_BIN="$(command -v git 2>/dev/null || true)"
[ -z "$GIT_BIN" ] && { echo "[brief-scheduler] git not found"; exit 1; }

if [ ! -d "$SOURCE_ROOT/.git" ] && [ ! -f "$SOURCE_ROOT/.git" ]; then
  echo "[brief-scheduler] source checkout is not a git worktree: $SOURCE_ROOT"
  exit 1
fi

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "[brief-scheduler] another scheduled publication is active — skipping overlap"
  exit 0
fi

PUBLISH_PARENT=""
cleanup() {
  if [ -n "$PUBLISH_PARENT" ] && [ -d "$PUBLISH_PARENT" ]; then
    rm -rf "$PUBLISH_PARENT"
  fi
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

REMOTE_URL="$("$GIT_BIN" -C "$SOURCE_ROOT" remote get-url "$REMOTE_NAME" 2>/dev/null || true)"
if [ -z "$REMOTE_URL" ]; then
  echo "[brief-scheduler] remote '$REMOTE_NAME' is unavailable in $SOURCE_ROOT"
  exit 1
fi

PUBLISH_PARENT="$(mktemp -d "${TMPDIR:-/tmp}/research-lab-brief-publisher.XXXXXX")" || {
  echo "[brief-scheduler] cannot create disposable publication checkout"
  exit 1
}
PUBLISH_ROOT="$PUBLISH_PARENT/repo"

echo "[brief-scheduler] cloning $REMOTE_NAME/$BRANCH into a disposable checkout"
if ! "$GIT_BIN" clone --quiet --branch "$BRANCH" --single-branch "$REMOTE_URL" "$PUBLISH_ROOT"; then
  echo "[brief-scheduler] clone failed"
  exit 1
fi

VALIDATOR_SOURCE="$SOURCE_ROOT/scripts/validate-brief-payload.mjs"
if [ ! -f "$VALIDATOR_SOURCE" ]; then
  echo "[brief-scheduler] local contract validator is unavailable: $VALIDATOR_SOURCE"
  exit 1
fi
if ! cp "$VALIDATOR_SOURCE" "$PUBLISH_ROOT/scripts/validate-brief-payload.mjs"; then
  echo "[brief-scheduler] cannot install the local contract validator in the disposable checkout"
  exit 1
fi

echo "[brief-scheduler] publisher checkout ready; developer worktree remains untouched"
echo "[brief-scheduler] narrative policy: ${BRIEF_NARRATIVE_ATTEMPTS} attempt(s), ${BRIEF_NARRATIVE_TIMEOUT}s each"
echo "[brief-scheduler] invalid-baseline repair: $BRIEF_REPAIR_INVALID_BASELINE (final validation remains mandatory)"
BRIEF_REPO_ROOT="$PUBLISH_ROOT" /bin/bash "$SOURCE_ROOT/scripts/brief-refresh-and-push.sh" "$@"
exit_code=$?
echo "[brief-scheduler] publisher finished with exit=$exit_code"
exit "$exit_code"