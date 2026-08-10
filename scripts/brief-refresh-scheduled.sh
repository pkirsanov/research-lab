#!/usr/bin/env bash
#
# Scheduler entry point for Actionable Market Brief publication.
#
# launchd invokes this script from the developer checkout. The worker runs against
# a disposable clone that is explicitly fast-forwarded from the configured remote
# before any refresh starts, so editor changes, staged files, and an interrupted
# prior refresh can never block or overwrite the developer worktree.

# Bash reads script files lazily. Detach the running launcher from editor or
# updater writes before entering a long worker, then unlink the private copy
# after the child has opened it.
if [ "${BRIEF_SCHEDULE_IMMUTABLE_EXECUTION:-0}" != "1" ]; then
  launcher_source="${BASH_SOURCE[0]}"
  launcher_snapshot="$(mktemp "${TMPDIR:-/tmp}/research-lab-brief-scheduled.XXXXXX")" || {
    echo "[brief-scheduler] cannot create immutable launcher copy"
    exit 1
  }
  if ! cp "$launcher_source" "$launcher_snapshot"; then
    rm -f "$launcher_snapshot"
    echo "[brief-scheduler] cannot populate immutable launcher copy"
    exit 1
  fi
  trap 'rm -f "$launcher_snapshot"' EXIT
  export BRIEF_SCHEDULE_IMMUTABLE_EXECUTION=1
  export BRIEF_SCHEDULE_ENTRYPOINT="$launcher_source"
  export BRIEF_SCHEDULE_IMMUTABLE_SCRIPT="$launcher_snapshot"
  exec /bin/bash "$launcher_snapshot" "$@"
  exit_code=$?
  echo "[brief-scheduler] cannot execute immutable launcher copy" >&2
  exit "$exit_code"
fi

LAUNCHER_SOURCE="${BRIEF_SCHEDULE_ENTRYPOINT:-${BASH_SOURCE[0]}}"
if [ -n "${BRIEF_SCHEDULE_IMMUTABLE_SCRIPT:-}" ]; then
  rm -f "$BRIEF_SCHEDULE_IMMUTABLE_SCRIPT"
fi
unset BRIEF_SCHEDULE_IMMUTABLE_EXECUTION BRIEF_SCHEDULE_ENTRYPOINT BRIEF_SCHEDULE_IMMUTABLE_SCRIPT

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$LAUNCHER_SOURCE")" && pwd)"
SOURCE_ROOT="${BRIEF_SCHEDULE_SOURCE_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
BRANCH="${BRIEF_SCHEDULE_BRANCH:-main}"
REMOTE_NAME="${BRIEF_SCHEDULE_REMOTE:-origin}"
LOCK_DIR="${BRIEF_SCHEDULE_LOCK_DIR:-${TMPDIR:-/tmp}/research-lab-brief-publisher.lock}"
LOCK_STALE_AFTER="${BRIEF_SCHEDULE_LOCK_STALE_AFTER:-21600}"
DUE_ONLY="${BRIEF_SCHEDULE_DUE_ONLY:-0}"
PUBLICATION_LEAD_MINUTES="${BRIEF_PUBLICATION_LEAD_MINUTES:-30}"

export PATH="/opt/homebrew/bin:/opt/local/bin:/usr/local/bin:/usr/bin:/bin"
# A scheduled window is unattended and only comes round 4x a day, so losing one costs a whole
# publication. Both budgets below are deliberately more generous than the interactive defaults in
# brief-refresh-and-push.sh, which a human can simply re-run.
#   attempts 2: the narrative is model-authored, so a transient contract miss (e.g. a lane leaking a
#     status code into reader prose) is self-correcting on a fresh sample. At 1 attempt that single
#     slip discarded the window outright, which is what happened on 2026-08-04.
#   timeout 2700s: lane wall-time is dominated by machine load, not by the work. Observed core-lane
#     times on this host span 813s / 1649s / 1816s; the 1800s default lost the 2026-08-08 pre-close
#     window by SIXTEEN SECONDS. 2700s covers the observed spread with headroom.
# Worst case stays bounded: 2 attempts x (4 lanes / 2 concurrent) x 2700s = 3h, inside the 6h
# BRIEF_SCHEDULE_LOCK_STALE_AFTER, and the lock still prevents any overlap with the next window.
export BRIEF_NARRATIVE_ATTEMPTS="${BRIEF_NARRATIVE_ATTEMPTS:-2}"
export BRIEF_NARRATIVE_TIMEOUT="${BRIEF_NARRATIVE_TIMEOUT:-2700}"
export BRIEF_LANE_ATTEMPTS="${BRIEF_LANE_ATTEMPTS:-2}"
export BRIEF_LANE_CONCURRENCY="${BRIEF_LANE_CONCURRENCY:-2}"
export BRIEF_LANE_EXIT_GRACE="${BRIEF_LANE_EXIT_GRACE:-60}"
export BRIEF_LANE_TERMINATE_GRACE="${BRIEF_LANE_TERMINATE_GRACE:-5}"
export BRIEF_REPAIR_INVALID_BASELINE="${BRIEF_REPAIR_INVALID_BASELINE:-1}"
export BRIEF_REQUIRE_COMPLETE_RUN=1
export BRIEF_PUBLICATION_LEAD_MINUTES="$PUBLICATION_LEAD_MINUTES"
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
ACK_FILE="${BRIEF_SCHEDULE_ACK_FILE:-${STATUS_FILE}.publish-ack}"

STARTED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
STARTED_EPOCH="$(date +%s)"
PUBLICATION_ACK_TOKEN="${STARTED_EPOCH}.$$"
et_hour="$(TZ=America/New_York date +%H)"
et_minute="$(TZ=America/New_York date +%M)"
et_minutes=$((10#$et_hour * 60 + 10#$et_minute))
RUN_WINDOW=""
if [ "$et_minutes" -ge $((1020 - PUBLICATION_LEAD_MINUTES)) ]; then
  RUN_WINDOW="after-hours"
elif [ "$et_minutes" -ge $((900 - PUBLICATION_LEAD_MINUTES)) ]; then
  RUN_WINDOW="pre-close"
elif [ "$et_minutes" -ge $((660 - PUBLICATION_LEAD_MINUTES)) ]; then
  RUN_WINDOW="morning"
elif [ "$et_minutes" -ge $((450 - PUBLICATION_LEAD_MINUTES)) ]; then
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
ACK_TOKEN=""
ACK_RUN_KEY=""
ACK_WINDOW=""
ACK_BRANCH=""
ACK_REMOTE=""
ACK_COMMIT=""
ACK_PUSHED_AT=""
ACK_PUSHED_EPOCH=""

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

load_publication_ack() {
  local ack_schema ack_key ack_value
  ack_schema=""
  ACK_TOKEN=""
  ACK_RUN_KEY=""
  ACK_WINDOW=""
  ACK_BRANCH=""
  ACK_REMOTE=""
  ACK_COMMIT=""
  ACK_PUSHED_AT=""
  ACK_PUSHED_EPOCH=""
  [ -r "$ACK_FILE" ] || return 1
  while IFS='=' read -r ack_key ack_value; do
    case "$ack_key" in
      schemaVersion) ack_schema="$ack_value" ;;
      token) ACK_TOKEN="$ack_value" ;;
      runKey) ACK_RUN_KEY="$ack_value" ;;
      window) ACK_WINDOW="$ack_value" ;;
      branch) ACK_BRANCH="$ack_value" ;;
      remote) ACK_REMOTE="$ack_value" ;;
      commit) ACK_COMMIT="$ack_value" ;;
      pushedAt) ACK_PUSHED_AT="$ack_value" ;;
      pushedEpoch) ACK_PUSHED_EPOCH="$ack_value" ;;
    esac
  done <"$ACK_FILE"
  [ "$ack_schema" = "1" ] || return 1
  [ -n "$ACK_TOKEN" ] || return 1
  [ "$ACK_BRANCH" = "$BRANCH" ] || return 1
  [ "$ACK_REMOTE" = "$REMOTE_NAME" ] || return 1
  case "$ACK_COMMIT" in ''|*[!0-9a-f]*) return 1 ;; esac
  [ "${#ACK_COMMIT}" -eq 40 ] || [ "${#ACK_COMMIT}" -eq 64 ] || return 1
  case "$ACK_PUSHED_EPOCH" in ''|*[!0-9]*) return 1 ;; esac
  return 0
}

ack_matches_current_run() {
  [ "$ACK_RUN_KEY" = "$RUN_KEY" ] && [ "$ACK_WINDOW" = "$RUN_WINDOW" ]
}

ack_commit_is_remote() {
  if ! "$GIT_BIN" -C "$SOURCE_ROOT" fetch --quiet --no-tags "$REMOTE_NAME" "$BRANCH"; then
    return 1
  fi
  "$GIT_BIN" -C "$SOURCE_ROOT" merge-base --is-ancestor "$ACK_COMMIT" FETCH_HEAD
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
  local original_exit=$? exit_code
  exit_code="$original_exit"
  if load_publication_ack && ack_matches_current_run && [ "$ACK_TOKEN" = "$PUBLICATION_ACK_TOKEN" ]; then
    if [ "$exit_code" -ne 0 ] || [ "$RUN_STATE" != "success" ]; then
      echo "[brief-scheduler] recovered successful publication from the current post-push acknowledgment"
    fi
    exit_code=0
    RUN_STATE="success"
    PUBLISHED_COMMIT="$ACK_COMMIT"
  fi
  FINISHED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  FINISHED_EPOCH="$(date +%s)"
  RUN_EXIT_CODE="$exit_code"
  if [ "$exit_code" -eq 0 ] && [ "$RUN_STATE" = "success" ]; then
    LAST_SUCCESS_AT="${ACK_PUSHED_AT:-$FINISHED_AT}"
    LAST_SUCCESS_EPOCH="${ACK_PUSHED_EPOCH:-$FINISHED_EPOCH}"
    LAST_SUCCESS_COMMIT="$PUBLISHED_COMMIT"
    LAST_SUCCESS_RUN_KEY="$RUN_KEY"
  elif [ "$RUN_STATE" = "running" ]; then
    RUN_STATE="failed"
  fi
  write_status || echo "[brief-scheduler] WARNING: could not write run status to $STATUS_FILE" >&2
  cleanup
  if [ "$exit_code" -ne "$original_exit" ]; then
    trap - EXIT
    exit "$exit_code"
  fi
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
  if load_publication_ack && ack_matches_current_run && ack_commit_is_remote; then
    RUN_STATE="success"
    PUBLISHED_COMMIT="$ACK_COMMIT"
    echo "[brief-scheduler] reconciled successful remote publication for $RUN_KEY from its post-push acknowledgment"
    exit 0
  fi
  echo "[brief-scheduler] publication due for $RUN_KEY (last success=${LAST_SUCCESS_RUN_KEY:-none})"
fi

rm -f "$ACK_FILE"

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
if ! grep -q '^export BRIEF_PIPELINE_CONTRACT="pull-data-tools-final-ack-v2"$' "$WORKER"; then
  echo "[brief-scheduler] pulled worker does not satisfy pull-data-tools-final-ack-v2 — publish the scheduler changes before the next run"
  exit 1
fi

echo "[brief-scheduler] publisher checkout ready; developer worktree remains untouched"
echo "[brief-scheduler] narrative policy: ${BRIEF_NARRATIVE_ATTEMPTS} attempt(s), ${BRIEF_NARRATIVE_TIMEOUT}s each"
echo "[brief-scheduler] lane policy: ${BRIEF_LANE_CONCURRENCY} concurrent, ${BRIEF_LANE_ATTEMPTS} attempt(s) each, ${BRIEF_LANE_EXIT_GRACE}s post-write exit grace"
echo "[brief-scheduler] invalid-baseline repair: $BRIEF_REPAIR_INVALID_BASELINE (final validation remains mandatory)"
BRIEF_REPO_ROOT="$PUBLISH_ROOT" \
BRIEF_PUBLICATION_ACK_FILE="$ACK_FILE" \
BRIEF_PUBLICATION_ACK_TOKEN="$PUBLICATION_ACK_TOKEN" \
BRIEF_PUBLICATION_RUN_KEY="$RUN_KEY" \
BRIEF_PUBLICATION_WINDOW="$RUN_WINDOW" \
BRIEF_PUBLICATION_REMOTE="$REMOTE_NAME" \
/bin/bash "$WORKER" "$@"
exit_code=$?
if [ "$exit_code" -eq 0 ]; then
  if load_publication_ack && ack_matches_current_run && [ "$ACK_TOKEN" = "$PUBLICATION_ACK_TOKEN" ]; then
    RUN_STATE="success"
    PUBLISHED_COMMIT="$ACK_COMMIT"
  else
    RUN_STATE="failed"
    exit_code=1
    echo "[brief-scheduler] publisher returned success without a matching post-push acknowledgment"
  fi
else
  RUN_STATE="failed"
fi
echo "[brief-scheduler] publisher finished with exit=$exit_code"
exit "$exit_code"
