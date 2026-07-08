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

# 2) Tier-B narrative regeneration with the Copilot CLI (Opus 4.8) — a RESEARCH product, not a data dump.
#    It may also update ONLY the macroEvents[] of the config with verified near-term catalysts.
CONFIG="market-brief.config.json"
NARRATIVE_OK=0
if [ "$DRY_RUN" = "1" ]; then
  echo "[brief-timer] DRY-RUN — skipping the Copilot narrative AI call"
elif [ "${BRIEF_SKIP_NARRATIVE:-0}" = "1" ]; then
  echo "[brief-timer] BRIEF_SKIP_NARRATIVE=1 — data-only run, narrative not regenerated"
elif [ -z "$COPILOT_BIN" ]; then
  echo "[brief-timer] copilot CLI not found — data-only run (install: npm i -g @github/copilot)"
else
  # Curated finance/econ web allowlist: the agent may web-fetch ONLY these for recent-event research.
  # Shell stays DENIED, so untrusted web content can never be executed — worst case is bad content, not code.
  WEB_ALLOW=(
    --allow-url=finance.yahoo.com --allow-url=query1.finance.yahoo.com --allow-url=query2.finance.yahoo.com
    --allow-url=production.dataviz.cnn.io
    --allow-url=www.federalreserve.gov --allow-url=www.bls.gov --allow-url=www.bea.gov
    --allow-url=fred.stlouisfed.org --allow-url=api.stlouisfed.org
    --allow-url=www.cnbc.com --allow-url=www.reuters.com --allow-url=www.marketwatch.com
    --allow-url=www.investing.com --allow-url=www.cmegroup.com --allow-url=www.treasurydirect.gov
  )
  WEB_STATE="curated-web-on"
  [ "${BRIEF_NO_WEB:-0}" = "1" ] && { WEB_ALLOW=(); WEB_STATE="web-off"; }
  TODAY="$(TZ=America/New_York date '+%Y-%m-%d')"
  PROMPT="You are the analyst regenerating the Actionable Market Brief NARRATIVE for the '$WINDOW' window; today (ET) is $TODAY. This is a RESEARCH PRODUCT, not a data dump. notes/market-brief.md is the binding runbook — obey especially section 6 (near-term events FIRST), section 6b (deep-research + original-analysis mandate + ACTIONABLE rotation/momentum), and sections 9 and 10. The deterministic Tier-A data was already refreshed this run: read market-brief.snapshot.json, brief-history.jsonl (recent rows for change-detection), market-brief.config.json, and watchlist.json. You MAY web-fetch the allowlisted finance/econ domains to research RECENT events, recent price/vol patterns, the live macro and earnings calendar, positioning, and cross-asset signals — VERIFY every 'recent' claim or label it STALE/estimate; never assert an unverified fact. Then REWRITE market-brief.payload.json per the section-9 schema (window=$WINDOW, asOf=the window ET time, generatedAt=current actual ISO). DELIVER, at a high quality bar: (1) events[] sorted NEAREST-FIRST that LEADS with imminent catalysts — this week and the next ~10 trading days (CPI/PPI/PCE, jobless claims, retail sales, ISM/PMI, Fed speakers/FOMC, Treasury auctions, OPEX, in-window earnings) — NOT only month-end earnings and monthly OPEX; (2) CONCRETE, ACTIONABLE sector-rotation and ETF/factor-momentum recommendations — instrument, direction (add/trim/hedge/rotate/watch), the level or RS-cross trigger, and the deep-link — no vague commentary; (3) the attention feed (at most 7 ranked), a psychology+regime read that NAMES the regime and the crowd's posture with evidence and what would falsify it, and watchlistNotes; (4) any durable NEW pattern with no owning tool captured in experimental[] (title + method + inputs). Apply real technique per section 6b (regime-switching, momentum/RRG, vol term-structure, dealer-gamma, dispersion/breadth, seasonality/event-study, risk models). Every probability/estimate shows its inputs and is labeled; proxies labeled; carried data labeled STALE; scenario probs sum to 1.00. You MAY update ONLY the macroEvents[] array in market-brief.config.json with verified near-term catalysts (do NOT touch its thresholds, track, deepLinks, or windows). Do NOT create or redeploy any HTML tool file (headless has no validation surface — surface tool ideas in experimental[] for interactive promotion). Change only market-brief.payload.json and, optionally, the macroEvents[] of market-brief.config.json."
  echo "[brief-timer] regenerating narrative via Copilot ($MODEL; deep-research, $WEB_STATE, shell denied)…"
  # --allow-all-tools auto-approves file edits + web-fetch; --deny-tool=shell blocks git/scripts/exec
  # (defense-in-depth against web-content injection); WEB_ALLOW gates web-fetch to trusted domains only.
  # ${arr[@]+"${arr[@]}"} is the bash-3.2 / set -u safe expansion when the allowlist is empty (BRIEF_NO_WEB=1).
  if run_with_timeout 900 "$COPILOT_BIN" -p "$PROMPT" \
        --allow-all-tools --deny-tool=shell ${WEB_ALLOW[@]+"${WEB_ALLOW[@]}"} \
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
  # Guard the config: never commit a non-parseable config the agent may have touched.
  if ! "$NODE_BIN" -e "require('./$CONFIG')" 2>/dev/null; then
    echo "[brief-timer] config.json not valid JSON after run — reverting config"
    "$GIT_BIN" checkout -- "$CONFIG" 2>/dev/null || true
  fi
fi

# 3) stage the deterministic data always; stage the narrative (payload + config) only if it regenerated cleanly.
"$GIT_BIN" add -- "${DATA_FILES[@]}" 2>/dev/null || true
[ "$NARRATIVE_OK" = "1" ] && { "$GIT_BIN" add -- "$PAYLOAD" "$CONFIG" 2>/dev/null || true; }

if "$GIT_BIN" diff --cached --quiet -- "${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG"; then
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
  "$GIT_BIN" --no-pager diff --cached --stat -- "${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG"
  "$GIT_BIN" restore --staged -- "${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG" 2>/dev/null || "$GIT_BIN" reset -q HEAD -- "${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG" 2>/dev/null || true
  "$GIT_BIN" checkout -- "${DATA_FILES[@]}" 2>/dev/null || true
  echo "[brief-timer] DRY-RUN — reverted working tree; no commit, no push"
  exit 0
fi

# 4) commit the changed brief files + push so GitHub Pages redeploys
"$GIT_BIN" commit -q -m "$MSG" -- "${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG"
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
