#!/usr/bin/env bash
#
# Scheduler entry point for Actionable Market Brief publication.
#
# launchd invokes this script from the developer checkout. The worker runs against
# a disposable clone that is explicitly fast-forwarded from the configured remote
# before any refresh starts, so editor changes, staged files, and an interrupted
# prior refresh can never block or overwrite the developer worktree.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="${BRIEF_SCHEDULE_SOURCE_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
BRANCH="${BRIEF_SCHEDULE_BRANCH:-main}"
REMOTE_NAME="${BRIEF_SCHEDULE_REMOTE:-origin}"
LOCK_DIR="${BRIEF_SCHEDULE_LOCK_DIR:-${TMPDIR:-/tmp}/research-lab-brief-publisher.lock}"
LOCK_STALE_AFTER="${BRIEF_SCHEDULE_LOCK_STALE_AFTER:-21600}"
DUE_ONLY="${BRIEF_SCHEDULE_DUE_ONLY:-0}"

export PATH="/opt/homebrew/bin:/opt/local/bin:/usr/local/bin:/usr/bin:/bin"
export BRIEF_NARRATIVE_ATTEMPTS="${BRIEF_NARRATIVE_ATTEMPTS:-1}"
export BRIEF_NARRATIVE_TIMEOUT="${BRIEF_NARRATIVE_TIMEOUT:-1800}"
export BRIEF_LANE_ATTEMPTS="${BRIEF_LANE_ATTEMPTS:-2}"
export BRIEF_LANE_CONCURRENCY="${BRIEF_LANE_CONCURRENCY:-2}"
export BRIEF_LANE_EXIT_GRACE="${BRIEF_LANE_EXIT_GRACE:-60}"
export BRIEF_LANE_TERMINATE_GRACE="${BRIEF_LANE_TERMINATE_GRACE:-5}"
export BRIEF_REPAIR_INVALID_BASELINE="${BRIEF_REPAIR_INVALID_BASELINE:-1}"
export BRIEF_REQUIRE_COMPLETE_RUN=1
GIT_BIN="$(command -v git 2>/dev/null || true)"
[ -z "$GIT_BIN" ] && { echo "[brief-scheduler] git not found"; exit 1; }

if [ ! -d "$SOURCE_ROOT/.git" ] && [ ! -f "$SOURCE_ROOT/.git" ]; then
  echo "[brief-scheduler] source checkout is not a git worktree: $SOURCE_ROOT"
  exit 1
fi

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  lock_pid=""
  lock_started=""
  [ -r "$LOCK_DIR/pid" ] && IFS= read -r lock_pid <"$LOCK_DIR/pid"
  [ -r "$LOCK_DIR/started-epoch" ] && IFS= read -r lock_started <"$LOCK_DIR/started-epoch"
  if [ -z "$lock_started" ]; then
    lock_started="$(stat -f %m "$LOCK_DIR" 2>/dev/null || stat -c %Y "$LOCK_DIR" 2>/dev/null || true)"
  fi
  now_epoch="$(date +%s)"
  lock_age=""
  case "$lock_started" in
    ''|*[!0-9]*) ;;
    *) lock_age=$((now_epoch - lock_started)) ;;
  esac
  lock_live=0
  case "$lock_pid" in
    ''|*[!0-9]*) ;;
    *) kill -0 "$lock_pid" 2>/dev/null && lock_live=1 ;;
  esac
  if [ "$lock_live" -eq 1 ]; then
    echo "[brief-scheduler] another scheduled publication is active (pid=$lock_pid) — skipping overlap"
    exit 0
  fi
  if [ -z "$lock_pid" ] && { [ -z "$lock_age" ] || [ "$lock_age" -lt "$LOCK_STALE_AFTER" ]; }; then
    echo "[brief-scheduler] another scheduled publication is active (pid=$lock_pid) — skipping overlap"
    exit 0
  fi
  echo "[brief-scheduler] reclaiming stale publication lock (pid=${lock_pid:-unknown} age=${lock_age:-unknown}s)"
  stale_lock="${LOCK_DIR}.stale.$$"
  if ! mv "$LOCK_DIR" "$stale_lock" 2>/dev/null; then
    echo "[brief-scheduler] stale lock recovery lost a concurrent acquisition"
    exit 1
  fi
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    rm -rf "$stale_lock"
    echo "[brief-scheduler] stale lock recovery lost a concurrent acquisition"
    exit 1
  fi
  rm -rf "$stale_lock"
fi

printf '%s\n' "$$" >"$LOCK_DIR/pid"
date +%s >"$LOCK_DIR/started-epoch"

if [ -n "${BRIEF_SCHEDULE_STATUS_FILE:-}" ]; then
  STATUS_FILE="$BRIEF_SCHEDULE_STATUS_FILE"
else
  status_path="$("$GIT_BIN" -C "$SOURCE_ROOT" rev-parse --git-path brief-scheduler.status 2>/dev/null || true)"
  case "$status_path" in
    /*) STATUS_FILE="$status_path" ;;
    *) STATUS_FILE="$SOURCE_ROOT/$status_path" ;;
  esac
fi

STARTED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
STARTED_EPOCH="$(date +%s)"
et_hour="$(TZ=America/New_York date +%H)"
et_minute="$(TZ=America/New_York date +%M)"
et_minutes=$((10#$et_hour * 60 + 10#$et_minute))
RUN_WINDOW=""
if [ "$et_minutes" -ge 1008 ]; then
  RUN_WINDOW="after-hours"
elif [ "$et_minutes" -ge 888 ]; then
  RUN_WINDOW="pre-close"
elif [ "$et_minutes" -ge 648 ]; then
  RUN_WINDOW="morning"
elif [ "$et_minutes" -ge 438 ]; then
  RUN_WINDOW="pre-market"
fi
if [ -n "${BRIEF_SCHEDULE_RUN_KEY:-}" ]; then
  RUN_KEY="$BRIEF_SCHEDULE_RUN_KEY"
elif [ -n "$RUN_WINDOW" ]; then
  RUN_KEY="$(TZ=America/New_York date +%Y-%m-%d)/$RUN_WINDOW"
else
  RUN_KEY=""
fi
FINISHED_AT=""
FINISHED_EPOCH=""
RUN_STATE="running"
RUN_EXIT_CODE=""
PUBLISHED_COMMIT=""
LAST_SUCCESS_AT=""
LAST_SUCCESS_EPOCH=""
LAST_SUCCESS_COMMIT=""
LAST_SUCCESS_RUN_KEY=""

if [ -r "$STATUS_FILE" ]; then
  while IFS='=' read -r status_key status_value; do
    case "$status_key" in
      lastSuccessAt) LAST_SUCCESS_AT="$status_value" ;;
      lastSuccessEpoch) LAST_SUCCESS_EPOCH="$status_value" ;;
      lastSuccessCommit) LAST_SUCCESS_COMMIT="$status_value" ;;
      lastSuccessRunKey) LAST_SUCCESS_RUN_KEY="$status_value" ;;
    esac
  done <"$STATUS_FILE"
fi

write_status() {
  local status_dir status_tmp
  status_dir="${STATUS_FILE%/*}"
  [ "$status_dir" = "$STATUS_FILE" ] && status_dir="."
  mkdir -p "$status_dir" || return 1
  status_tmp="${STATUS_FILE}.tmp.$$"
  umask 077
  {
    printf '%s\n' "schemaVersion=1"
    printf '%s\n' "state=$RUN_STATE"
    printf '%s\n' "pid=$$"
    printf '%s\n' "startedAt=$STARTED_AT"
    printf '%s\n' "startedEpoch=$STARTED_EPOCH"
    printf '%s\n' "finishedAt=$FINISHED_AT"
    printf '%s\n' "finishedEpoch=$FINISHED_EPOCH"
    printf '%s\n' "exitCode=$RUN_EXIT_CODE"
    printf '%s\n' "branch=$BRANCH"
    printf '%s\n' "remote=$REMOTE_NAME"
    printf '%s\n' "runKey=$RUN_KEY"
    printf '%s\n' "window=$RUN_WINDOW"
    printf '%s\n' "publishedCommit=$PUBLISHED_COMMIT"
    printf '%s\n' "lastSuccessAt=$LAST_SUCCESS_AT"
    printf '%s\n' "lastSuccessEpoch=$LAST_SUCCESS_EPOCH"
    printf '%s\n' "lastSuccessCommit=$LAST_SUCCESS_COMMIT"
    printf '%s\n' "lastSuccessRunKey=$LAST_SUCCESS_RUN_KEY"
  } >"$status_tmp" || { rm -f "$status_tmp"; return 1; }
  mv -f "$status_tmp" "$STATUS_FILE"
}

PUBLISH_PARENT=""
cleanup() {
  local cleanup_pid
  if [ -n "$PUBLISH_PARENT" ] && [ -d "$PUBLISH_PARENT" ]; then
    rm -rf "$PUBLISH_PARENT"
  fi
  cleanup_pid=""
  [ -r "$LOCK_DIR/pid" ] && IFS= read -r cleanup_pid <"$LOCK_DIR/pid"
  if [ "$cleanup_pid" = "$$" ]; then
    rm -f "$LOCK_DIR/pid" "$LOCK_DIR/started-epoch"
    rmdir "$LOCK_DIR" 2>/dev/null || true
  fi
}
finish() {
  local exit_code=$?
  FINISHED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  FINISHED_EPOCH="$(date +%s)"
  RUN_EXIT_CODE="$exit_code"
  if [ "$exit_code" -eq 0 ] && [ "$RUN_STATE" = "success" ]; then
    LAST_SUCCESS_AT="$FINISHED_AT"
    LAST_SUCCESS_EPOCH="$FINISHED_EPOCH"
    LAST_SUCCESS_COMMIT="$PUBLISHED_COMMIT"
    LAST_SUCCESS_RUN_KEY="$RUN_KEY"
  elif [ "$RUN_STATE" = "running" ]; then
    RUN_STATE="failed"
  fi
  write_status || echo "[brief-scheduler] WARNING: could not write run status to $STATUS_FILE" >&2
  cleanup
}
write_status || echo "[brief-scheduler] WARNING: could not initialize run status at $STATUS_FILE" >&2
trap finish EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

if [ "$DUE_ONLY" = "1" ]; then
  if [ -z "$RUN_KEY" ]; then
    RUN_STATE="not-due"
    echo "[brief-scheduler] no publication window is due yet"
    exit 0
  fi
  if [ "$LAST_SUCCESS_RUN_KEY" = "$RUN_KEY" ]; then
    RUN_STATE="already-current"
    echo "[brief-scheduler] publication already succeeded for $RUN_KEY — no catch-up needed"
    exit 0
  fi
  echo "[brief-scheduler] publication due for $RUN_KEY (last success=${LAST_SUCCESS_RUN_KEY:-none})"
fi

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
if ! "$GIT_BIN" clone --quiet --origin "$REMOTE_NAME" --branch "$BRANCH" --single-branch "$REMOTE_URL" "$PUBLISH_ROOT"; then
  echo "[brief-scheduler] clone failed"
  exit 1
fi

echo "[brief-scheduler] pulling latest $REMOTE_NAME/$BRANCH before tool updates"
if ! "$GIT_BIN" -C "$PUBLISH_ROOT" pull --ff-only "$REMOTE_NAME" "$BRANCH"; then
  echo "[brief-scheduler] fast-forward pull failed"
  exit 1
fi

WORKER="$PUBLISH_ROOT/scripts/brief-refresh-and-push.sh"
if [ ! -f "$WORKER" ]; then
  echo "[brief-scheduler] pulled worker is unavailable: $WORKER"
  exit 1
fi
if ! grep -q '^export BRIEF_PIPELINE_CONTRACT="pull-data-tools-final-v1"$' "$WORKER"; then
  echo "[brief-scheduler] pulled worker does not satisfy pull-data-tools-final-v1 — publish the scheduler changes before the next run"
  exit 1
fi

echo "[brief-scheduler] publisher checkout ready; developer worktree remains untouched"
echo "[brief-scheduler] narrative policy: ${BRIEF_NARRATIVE_ATTEMPTS} attempt(s), ${BRIEF_NARRATIVE_TIMEOUT}s each"
echo "[brief-scheduler] lane policy: ${BRIEF_LANE_CONCURRENCY} concurrent, ${BRIEF_LANE_ATTEMPTS} attempt(s) each, ${BRIEF_LANE_EXIT_GRACE}s post-write exit grace"
echo "[brief-scheduler] invalid-baseline repair: $BRIEF_REPAIR_INVALID_BASELINE (final validation remains mandatory)"
BRIEF_REPO_ROOT="$PUBLISH_ROOT" /bin/bash "$WORKER" "$@"
exit_code=$?
if [ "$exit_code" -eq 0 ]; then
  RUN_STATE="success"
  PUBLISHED_COMMIT="$("$GIT_BIN" -C "$PUBLISH_ROOT" rev-parse HEAD 2>/dev/null || true)"
else
  RUN_STATE="failed"
fi
echo "[brief-scheduler] publisher finished with exit=$exit_code"
exit "$exit_code"
