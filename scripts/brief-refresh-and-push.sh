#!/usr/bin/env bash
#
# Actionable Market Brief — Tier-A timer wrapper (refresh -> commit -> push).
#
# This is the "timer wrapper" referenced by notes/market-brief.md §2. It runs on THIS
# MacBook 4x/day via launchd (scripts/com.researchlab.brief-refresh.plist), or on evo-x2
# via a knb systemd timer. Each run:
#   1. runs scripts/brief-refresh.mjs (Tier-A deterministic data refresh — writes
#      market-brief.snapshot.json + appends brief-history.jsonl; weekends are a no-op),
#   2. commits ONLY those two data files (it NEVER sweeps up unrelated working-tree edits),
#   3. git-pushes so GitHub Pages redeploys the fresh data.
#
# Tier B (the narrative in market-brief.payload.json) is NOT touched here — that needs the
# interactive Copilot agent (run /market-brief-update in VS Code). See §2.
#
# Auth: the repo uses an HTTPS remote + the macOS osxkeychain credential helper, so the
# push works headlessly under launchd while you are logged in (no ssh-agent needed).
#
# Usage:  bash scripts/brief-refresh-and-push.sh [--dry-run]
#   --dry-run : refresh + stage + print what WOULD be committed, then revert; no commit/push.
#
# It never wedges the timer: a network failure in the refresh is a soft no-op (exit 0).

set -uo pipefail

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT" || { echo "[brief-timer] cannot cd to repo root"; exit 0; }

# launchd runs with a minimal PATH — make node + git + the osxkeychain credential helper findable.
export PATH="/opt/homebrew/bin:/opt/local/bin:/usr/local/bin:/usr/bin:/bin"

find_bin() {
  local want="$1"; shift
  local b; b="$(command -v "$want" 2>/dev/null || true)"
  if [ -n "$b" ]; then echo "$b"; return; fi
  local c; for c in "$@"; do [ -x "$c" ] && { echo "$c"; return; }; done
}
NODE_BIN="$(find_bin node /opt/homebrew/bin/node /usr/local/bin/node)"
GIT_BIN="$(find_bin git /opt/local/bin/git /usr/bin/git /opt/homebrew/bin/git)"
[ -z "$NODE_BIN" ] && { echo "[brief-timer] node not found — skipping"; exit 0; }
[ -z "$GIT_BIN" ]  && { echo "[brief-timer] git not found — skipping"; exit 0; }

DATA_FILES=(market-brief.snapshot.json brief-history.jsonl)

echo "[brief-timer] $(TZ=America/New_York date '+%Y-%m-%d %H:%M:%S %Z') — refresh @ $REPO_ROOT (node=$NODE_BIN git=$GIT_BIN dry=$DRY_RUN)"

# 1) Tier-A refresh (brief-refresh.mjs soft-fails to exit 0 internally on a network error / weekend)
"$NODE_BIN" scripts/brief-refresh.mjs || echo "[brief-timer] refresh returned non-zero (soft) — continuing"

# 2) stage ONLY the two data files (scoped — never `git add -A`)
"$GIT_BIN" add -- "${DATA_FILES[@]}" 2>/dev/null || true

if "$GIT_BIN" diff --cached --quiet -- "${DATA_FILES[@]}"; then
  echo "[brief-timer] no data changes (weekend / market closed / no new bars) — nothing to commit"
  exit 0
fi

MSG="market-brief: Tier-A auto-refresh $(TZ=America/New_York date '+%Y-%m-%d %H:%M %Z')"

if [ "$DRY_RUN" = "1" ]; then
  echo "[brief-timer] DRY-RUN — would commit as: $MSG"
  "$GIT_BIN" --no-pager diff --cached --stat -- "${DATA_FILES[@]}"
  "$GIT_BIN" restore --staged -- "${DATA_FILES[@]}" 2>/dev/null || "$GIT_BIN" reset -q HEAD -- "${DATA_FILES[@]}" 2>/dev/null || true
  "$GIT_BIN" checkout -- "${DATA_FILES[@]}" 2>/dev/null || true
  echo "[brief-timer] DRY-RUN — reverted working tree; no commit, no push"
  exit 0
fi

# 3) commit ONLY the data files + push so GitHub Pages redeploys
"$GIT_BIN" commit -q -m "$MSG" -- "${DATA_FILES[@]}"
echo "[brief-timer] committed: $MSG"

BR="$("$GIT_BIN" rev-parse --abbrev-ref HEAD)"
if "$GIT_BIN" push -q origin "HEAD:$BR"; then
  echo "[brief-timer] pushed to origin/$BR — Pages will redeploy"
else
  echo "[brief-timer] push rejected — pull --rebase --autostash then retry once"
  if "$GIT_BIN" pull --rebase --autostash origin "$BR" && "$GIT_BIN" push -q origin "HEAD:$BR"; then
    echo "[brief-timer] pushed after rebase — Pages will redeploy"
  else
    echo "[brief-timer] push still failing — commit left local for manual push"
    exit 0
  fi
fi
