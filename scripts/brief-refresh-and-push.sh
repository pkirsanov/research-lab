#!/usr/bin/env bash
#
# Actionable Market Brief — timer wrapper (refresh -> regenerate narrative -> commit -> push).
#
# This is the "timer wrapper" referenced by notes/market-brief.md §2. It runs on THIS
# MacBook 4x/day via launchd (scripts/com.researchlab.brief-refresh.plist). Each run:
#   1. runs scripts/brief-refresh.mjs (Tier-A deterministic data — writes
#      market-brief.snapshot.json + appends brief-history.jsonl; weekends are a no-op),
#   2. regenerates the Tier-B NARRATIVE (market-brief.payload.json) with the GitHub Copilot
#      CLI (Opus 4.8 by default), locked to file edits only (shell + network denied),
#   3. commits the changed brief files (data + narrative) — scoped, never `git add -A`,
#   4. git-pushes so GitHub Pages redeploys.
#
# Auth: the push uses the repo's HTTPS remote + the macOS osxkeychain credential helper;
# the Copilot CLI reuses its own login (`copilot` → /login once). Both work headlessly
# under launchd while you are logged in (no ssh-agent needed).
#
# Env knobs:
#   BRIEF_MODEL           model slug for the narrative (default: claude-opus-4.8)
#   BRIEF_SKIP_NARRATIVE  set to 1 for a data-only run (skip the Copilot step)
#
# Usage:  bash scripts/brief-refresh-and-push.sh [--dry-run]
#   --dry-run : refresh + stage + print what WOULD be committed, then revert; NO narrative
#               AI call, no commit, no push.
#
# It never wedges the timer: refresh/narrative failures are soft — the run still commits
# whatever valid changes it has (data-only fallback), or exits 0 cleanly.

set -uo pipefail

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT" || { echo "[brief-timer] cannot cd to repo root"; exit 0; }

# launchd runs with a minimal PATH — make node + git + copilot + the osxkeychain helper findable.
export PATH="/opt/homebrew/bin:/opt/local/bin:/usr/local/bin:/usr/bin:/bin"

find_bin() {
  local want="$1"; shift
  local b; b="$(command -v "$want" 2>/dev/null || true)"
  if [ -n "$b" ]; then echo "$b"; return; fi
  local c; for c in "$@"; do [ -x "$c" ] && { echo "$c"; return; }; done
}
NODE_BIN="$(find_bin node /opt/homebrew/bin/node /usr/local/bin/node)"
GIT_BIN="$(find_bin git /opt/local/bin/git /usr/bin/git /opt/homebrew/bin/git)"
COPILOT_BIN="$(find_bin copilot /opt/homebrew/bin/copilot)"
[ -z "$NODE_BIN" ] && { echo "[brief-timer] node not found — skipping"; exit 0; }
[ -z "$GIT_BIN" ]  && { echo "[brief-timer] git not found — skipping"; exit 0; }

MODEL="${BRIEF_MODEL:-claude-opus-4.8}"

# Portable timeout (macOS has no `timeout` by default): timeout -> gtimeout -> watchdog.
run_with_timeout() {
  local secs="$1"; shift
  if command -v timeout  >/dev/null 2>&1; then timeout  "$secs" "$@"; return $?; fi
  if command -v gtimeout >/dev/null 2>&1; then gtimeout "$secs" "$@"; return $?; fi
  "$@" & local pid=$!
  ( sleep "$secs"; kill -TERM "$pid" 2>/dev/null ) & local w=$!
  local rc=0; wait "$pid" 2>/dev/null || rc=$?
  kill -TERM "$w" 2>/dev/null || true; wait "$w" 2>/dev/null || true
  [ "$rc" -eq 143 ] && rc=124
  return "$rc"
}

DATA_FILES=(market-brief.snapshot.json brief-history.jsonl)
PAYLOAD="market-brief.payload.json"

# Window from the ET clock (same thresholds as brief-refresh.mjs).
et_h=$(TZ=America/New_York date +%H); et_m=$(TZ=America/New_York date +%M)
mins=$((10#$et_h * 60 + 10#$et_m))
if   [ "$mins" -ge 1020 ]; then WINDOW=after-hours
elif [ "$mins" -ge 900  ]; then WINDOW=pre-close
elif [ "$mins" -ge 660  ]; then WINDOW=morning
else WINDOW=pre-market; fi

echo "[brief-timer] $(TZ=America/New_York date '+%Y-%m-%d %H:%M:%S %Z') — window=$WINDOW @ $REPO_ROOT (node=$NODE_BIN git=$GIT_BIN copilot=${COPILOT_BIN:-<none>} model=$MODEL dry=$DRY_RUN)"

# 1) Tier-A deterministic refresh (soft-fails to exit 0 internally on a network error / weekend)
"$NODE_BIN" scripts/brief-refresh.mjs || echo "[brief-timer] refresh returned non-zero (soft) — continuing"

# 2) Tier-B narrative regeneration with the Copilot CLI (Opus 4.8), unless dry-run / disabled / missing.
NARRATIVE_OK=0
if [ "$DRY_RUN" = "1" ]; then
  echo "[brief-timer] DRY-RUN — skipping the Copilot narrative AI call"
elif [ "${BRIEF_SKIP_NARRATIVE:-0}" = "1" ]; then
  echo "[brief-timer] BRIEF_SKIP_NARRATIVE=1 — data-only run, narrative not regenerated"
elif [ -z "$COPILOT_BIN" ]; then
  echo "[brief-timer] copilot CLI not found — data-only run (install: npm i -g @github/copilot)"
else
  PROMPT="Regenerate the Actionable Market Brief NARRATIVE for the '$WINDOW' window. Follow notes/market-brief.md (the runbook) and .github/prompts/market-brief-update.prompt.md as the source of truth. The deterministic Tier-A data was ALREADY refreshed this run: use market-brief.snapshot.json, the last rows of brief-history.jsonl, market-brief.config.json, and watchlist.json as inputs. Do NOT fetch data, run scripts, or append to brief-history.jsonl. Rewrite ONLY market-brief.payload.json per the section-9 schema: set window to $WINDOW, asOf to the window ET time, and generatedAt to the current actual ISO timestamp; author the attention feed of at most 7 ranked cards, recommendations, the events table with option-implied moves and scenario probabilities and expected effect, the psychology read, and watchlistNotes. Every probability is a labeled estimate with its inputs shown, never a fact; deep-link the owning tool per the no-duplication map; keep it actionable and low-noise. Write valid JSON only to market-brief.payload.json and change no other file."
  echo "[brief-timer] regenerating narrative via Copilot ($MODEL; shell + network denied)…"
  # --allow-all-tools auto-approves file edits; --deny-tool=shell blocks git/scripts/fetch;
  # no URL allowance blocks web-fetch — so the agent can only read/write files in the repo.
  if run_with_timeout 420 "$COPILOT_BIN" -p "$PROMPT" \
        --allow-all-tools --deny-tool=shell \
        --no-ask-user --model "$MODEL" \
        --no-color --no-auto-update --log-level error \
        -C "$REPO_ROOT" </dev/null; then
    if "$NODE_BIN" -e "const p=require('./$PAYLOAD'); if(p.toolId!=='market-brief'||!p.generatedAt||!Array.isArray(p.attention)) process.exit(1)" 2>/dev/null; then
      NARRATIVE_OK=1
      echo "[brief-timer] narrative regenerated + schema-valid"
    else
      echo "[brief-timer] narrative produced invalid/incomplete payload — reverting it, keeping data"
      "$GIT_BIN" checkout -- "$PAYLOAD" 2>/dev/null || true
    fi
  else
    echo "[brief-timer] narrative step failed/timed out — reverting payload, keeping data"
    "$GIT_BIN" checkout -- "$PAYLOAD" 2>/dev/null || true
  fi
fi

# 3) stage the deterministic data always; stage the narrative only if it regenerated cleanly.
"$GIT_BIN" add -- "${DATA_FILES[@]}" 2>/dev/null || true
[ "$NARRATIVE_OK" = "1" ] && { "$GIT_BIN" add -- "$PAYLOAD" 2>/dev/null || true; }

if "$GIT_BIN" diff --cached --quiet -- "${DATA_FILES[@]}" "$PAYLOAD"; then
  echo "[brief-timer] no changes to commit (weekend / market closed / no new data or narrative)"
  exit 0
fi

if [ "$NARRATIVE_OK" = "1" ]; then
  MSG="market-brief: auto-refresh + narrative $(TZ=America/New_York date '+%Y-%m-%d %H:%M %Z') ($WINDOW)"
else
  MSG="market-brief: Tier-A data-only refresh $(TZ=America/New_York date '+%Y-%m-%d %H:%M %Z') ($WINDOW)"
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "[brief-timer] DRY-RUN — would commit as: $MSG"
  "$GIT_BIN" --no-pager diff --cached --stat -- "${DATA_FILES[@]}" "$PAYLOAD"
  "$GIT_BIN" restore --staged -- "${DATA_FILES[@]}" "$PAYLOAD" 2>/dev/null || "$GIT_BIN" reset -q HEAD -- "${DATA_FILES[@]}" "$PAYLOAD" 2>/dev/null || true
  "$GIT_BIN" checkout -- "${DATA_FILES[@]}" 2>/dev/null || true
  echo "[brief-timer] DRY-RUN — reverted working tree; no commit, no push"
  exit 0
fi

# 4) commit the changed brief files + push so GitHub Pages redeploys
"$GIT_BIN" commit -q -m "$MSG" -- "${DATA_FILES[@]}" "$PAYLOAD"
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
