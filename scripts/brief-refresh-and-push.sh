#!/usr/bin/env bash
#
# Actionable Market Brief — timer wrapper (refresh -> regenerate narrative -> commit -> push).
#
# This is the "timer wrapper" referenced by notes/market-brief.md §2. It runs on THIS
# MacBook 4x/day via launchd (scripts/com.researchlab.brief-refresh.plist). Each run:
#   1. refreshes shared same-origin bars/options, then runs scripts/brief-refresh.mjs
#      (Tier-A deterministic data — writes market-brief.snapshot.json + appends
#      brief-history.jsonl; closed-market runs target the next session),
#   2. regenerates and contract-validates the Tier-B NARRATIVE (market-brief.payload.json) with the GitHub Copilot
#      CLI (Opus 4.8 by default), locked to file edits only (shell + network denied),
#      RETRYING (default 2 attempts) until the payload validates so each run fully generates,
#   3. commits the changed brief files (data + narrative) — scoped, never `git add -A`,
#   4. ALWAYS git-pushes any local brief commit (including a prior run's unpushed commit) so
#      GitHub Pages redeploys.
#
# Auth: the push uses the repo's HTTPS remote + the macOS osxkeychain credential helper;
# the Copilot CLI reuses its own login (`copilot` → /login once). Both work headlessly
# under launchd while you are logged in (no ssh-agent needed).
#
# Env knobs:
#   BRIEF_MODEL              model slug for the narrative (default: claude-opus-4.8)
#   BRIEF_SKIP_NARRATIVE     set to 1 for a data-only run (skip the Copilot step)
#   BRIEF_NARRATIVE_ATTEMPTS max narrative gen+validate attempts per run (default: 1)
#   BRIEF_NARRATIVE_TIMEOUT  per-attempt timeout in seconds for the Copilot call (default: 1800)
#
# Usage:  bash scripts/brief-refresh-and-push.sh [--dry-run]
#   --dry-run : refresh + stage + print what WOULD be committed, then revert; NO narrative
#               AI call, no commit, no push.
#
# It never wedges the timer: refresh/narrative failures are soft — the run still commits
# whatever valid changes it has (data-only fallback) and ALWAYS pushes any local brief commit
# (this run's or a prior run's unpushed one), or exits 0 cleanly when there is genuinely nothing to do.

set -uo pipefail

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${BRIEF_REPO_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
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
if [ -n "${BRIEF_COPILOT_BIN:-}" ]; then
  COPILOT_BIN="$BRIEF_COPILOT_BIN"
else
  COPILOT_BIN="$(find_bin copilot /opt/homebrew/bin/copilot)"
fi
[ -z "$NODE_BIN" ] && { echo "[brief-timer] node not found — skipping"; exit 0; }
[ -z "$GIT_BIN" ]  && { echo "[brief-timer] git not found — skipping"; exit 0; }

DATA_FILES=(market-brief.snapshot.json brief-history.jsonl)
PAYLOAD="market-brief.payload.json"
CONFIG="market-brief.config.json"
OWNED_PATHS=("${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG" data)

# Refuse before any fetch or refresh when a wrapper-owned path is staged,
# unstaged, or untracked. Unrelated dirt is intentionally outside this query.
owned_status="$("$GIT_BIN" status --porcelain=v1 --untracked-files=all -- "${OWNED_PATHS[@]}")"
if [ -n "$owned_status" ]; then
  echo "[brief-timer] refusing: wrapper-owned publication paths are dirty"
  printf '%s\n' "$owned_status"
  exit 1
fi

# A broken published pair is not a valid transaction baseline. Repair requires
# an explicit reviewed data change, never an implicit scheduler rewrite.
if ! "$NODE_BIN" scripts/validate-brief-payload.mjs "$PAYLOAD"; then
  if [ "${BRIEF_REPAIR_INVALID_BASELINE:-0}" = "1" ]; then
    echo "[brief-timer] explicit repair mode: invalid baseline may be replaced only by a final-valid matching pair"
  else
    echo "[brief-timer] refusing: published snapshot/payload baseline is invalid"
    exit 1
  fi
fi

BASELINE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/research-lab-brief.XXXXXX")" || {
  echo "[brief-timer] cannot create private transaction baseline"
  exit 1
}
cleanup_baseline() {
  rm -rf "$BASELINE_DIR"
}
trap cleanup_baseline EXIT

for baseline_file in "${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG"; do
  cp "$baseline_file" "$BASELINE_DIR/$baseline_file" || {
    echo "[brief-timer] cannot capture baseline bytes for $baseline_file"
    exit 1
  }
done
if [ -d data ]; then
  cp -R data "$BASELINE_DIR/data" || {
    echo "[brief-timer] cannot capture baseline bytes for data"
    exit 1
  }
else
  : >"$BASELINE_DIR/data-absent"
fi

restore_narrative_baseline() {
  cp "$BASELINE_DIR/$PAYLOAD" "$PAYLOAD" && cp "$BASELINE_DIR/$CONFIG" "$CONFIG"
}

restore_pair_baseline() {
  cp "$BASELINE_DIR/${DATA_FILES[0]}" "${DATA_FILES[0]}" && cp "$BASELINE_DIR/${DATA_FILES[1]}" "${DATA_FILES[1]}"
}

restore_owned_baseline() {
  "$GIT_BIN" restore --staged -- "${OWNED_PATHS[@]}" 2>/dev/null || true
  restore_pair_baseline || return 1
  restore_narrative_baseline || return 1
  rm -rf data
  if [ ! -f "$BASELINE_DIR/data-absent" ]; then
    cp -R "$BASELINE_DIR/data" data || return 1
  fi
}

MODEL="${BRIEF_MODEL:-claude-opus-4.8}"
NARRATIVE_ATTEMPTS="${BRIEF_NARRATIVE_ATTEMPTS:-1}"
NARRATIVE_TIMEOUT="${BRIEF_NARRATIVE_TIMEOUT:-1800}"

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

# Window from the ET clock (same thresholds as brief-refresh.mjs).
et_h=$(TZ=America/New_York date +%H); et_m=$(TZ=America/New_York date +%M)
mins=$((10#$et_h * 60 + 10#$et_m))
if   [ "$mins" -ge 1020 ]; then WINDOW=after-hours
elif [ "$mins" -ge 900  ]; then WINDOW=pre-close
elif [ "$mins" -ge 660  ]; then WINDOW=morning
else WINDOW=pre-market; fi

echo "[brief-timer] $(TZ=America/New_York date '+%Y-%m-%d %H:%M:%S %Z') — window=$WINDOW @ $REPO_ROOT (node=$NODE_BIN git=$GIT_BIN copilot=${COPILOT_BIN:-<none>} model=$MODEL dry=$DRY_RUN)"

# 1) Refresh canonical daily bars once for the union of every tool, then fetch
#    option chains and attach those same bar rows. Tier A and browser tools reuse
#    the resulting same-origin snapshots without another ticker-history request.
if [ "$DRY_RUN" != "1" ]; then
  BRIEF_WINDOW="$WINDOW" "$NODE_BIN" scripts/fetch-bars.mjs    || echo "[brief-timer] fetch-bars soft-failed — continuing"
  BRIEF_WINDOW="$WINDOW" "$NODE_BIN" scripts/fetch-options.mjs || echo "[brief-timer] fetch-options soft-failed — continuing"
fi

# 1b) Tier-A deterministic refresh (soft-fails to exit 0 internally on a network error)
"$NODE_BIN" scripts/brief-refresh.mjs || echo "[brief-timer] refresh returned non-zero (soft) — continuing"

# 2) Tier-B narrative regeneration with four write-disjoint Copilot lanes in parallel,
#    followed by one deterministic collector and the unchanged payload validator.
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
  BRIEF_CONTRACT="Read snapshot.dataFreshness, snapshot.toolReads, and EVERY snapshot.toolCoverage entry. The same-origin data/bars and data/options snapshots were refreshed BEFORE Tier A; use those latest available inputs with each owning tool's model, and label any carried or failed snapshot stale. Mandatory every run: use the exact global-rotation-lab country/FX/session read and real-assets-lab model-specific GLD, SLV, BTC-USD/IBIT, broad-commodity and oil reads; analyze every other registered tool when its current data can change or confirm the plan, or record a specific not-brief-relevant reason. Author payload.nextSession FIRST for snapshot.nextSessionDate with at most config.thresholds.nextSessionMaxActions immediately executable actions. Exclude watch-only/vague items. Every nextSession action MUST use hold|trim|add|hedge|rotate and include rationale, horizon, structuralAnchor, trigger, invalidation, confidence, and deepLink. Count only DISTINCT market-bar/tool-read asOf dates for persistence; repeated weekend/holiday runs over one close are one observation. When snapshot.marketClosed is true, state that explicitly and target the next trading session rather than inventing intraday evidence."
  PROMPT="You are the analyst regenerating the Actionable Market Brief NARRATIVE for the '$WINDOW' window; today (ET) is $TODAY. This is a RESEARCH PRODUCT, not a data dump. notes/market-brief.md is the binding runbook — obey especially section 6 (near-term events FIRST), section 6b (deep-research + original-analysis mandate + ACTIONABLE rotation/momentum), and sections 9 and 10. The deterministic Tier-A data was already refreshed this run: read market-brief.snapshot.json, brief-history.jsonl (recent rows for change-detection), market-brief.config.json, and watchlist.json. You MAY web-fetch the allowlisted finance/econ domains to research RECENT events, recent price/vol patterns, the live macro and earnings calendar, positioning, and cross-asset signals — VERIFY every 'recent' claim or label it STALE/estimate; never assert an unverified fact. Then REWRITE market-brief.payload.json per the section-9 schema (window=$WINDOW, asOf=the window ET time, generatedAt=current actual ISO). DELIVER, at a high quality bar: (1) events[] sorted NEAREST-FIRST that LEADS with imminent catalysts — this week and the next ~10 trading days (CPI/PPI/PCE, jobless claims, retail sales, ISM/PMI, Fed speakers/FOMC, Treasury auctions, OPEX, in-window earnings) — NOT only month-end earnings and monthly OPEX; (2) CONCRETE, ACTIONABLE sector-rotation and ETF/factor-momentum recommendations — instrument, direction (add/trim/hedge/rotate/watch), the level or RS-cross trigger, and the deep-link — no vague commentary; (3) the attention feed (at most 7 ranked), a psychology+regime read that NAMES the regime and the crowd's posture with evidence and what would falsify it, and watchlistNotes; (4) any durable NEW pattern with no owning tool captured in experimental[] (title + method + inputs). Apply real technique per section 6b (regime-switching, momentum/RRG, vol term-structure, dealer-gamma, dispersion/breadth, seasonality/event-study, risk models). Every probability/estimate shows its inputs and is labeled; proxies labeled; carried data labeled STALE; scenario probs sum to 1.00. You MAY update ONLY the macroEvents[] array in market-brief.config.json with verified near-term catalysts (do NOT touch its thresholds, track, deepLinks, or windows). Do NOT create or redeploy any HTML tool file (headless has no validation surface — surface tool ideas in experimental[] for interactive promotion). Change only market-brief.payload.json and, optionally, the macroEvents[] of market-brief.config.json."
  echo "[brief-timer] regenerating narrative via 4 parallel Copilot lanes ($MODEL; $WEB_STATE, shell denied; up to ${NARRATIVE_ATTEMPTS}x @ ${NARRATIVE_TIMEOUT}s per lane)…"
  # --allow-all-tools auto-approves file edits + web-fetch; --deny-tool=shell blocks git/scripts/exec
  # (defense-in-depth against web-content injection); WEB_ALLOW gates web-fetch to trusted domains only.
  # ${arr[@]+"${arr[@]}"} is the bash-3.2 / set -u safe expansion when the allowlist is empty (BRIEF_NO_WEB=1).
  # Retry until the payload passes the full contract validator, so each run FULLY generates a valid brief;
  # a failed/timed-out/invalid attempt reverts the payload before the next try (never commit a broken payload).
  attempt=1
  while [ "$attempt" -le "$NARRATIVE_ATTEMPTS" ]; do
    echo "[brief-timer] narrative attempt $attempt/${NARRATIVE_ATTEMPTS}…"
    if ! restore_narrative_baseline; then
      echo "[brief-timer] cannot restore payload/config baseline before narrative attempt"
      restore_owned_baseline || true
      exit 1
    fi
    if BRIEF_COPILOT_BIN="$COPILOT_BIN" \
          BRIEF_MODEL="$MODEL" \
          BRIEF_NARRATIVE_TIMEOUT="$NARRATIVE_TIMEOUT" \
          BRIEF_NARRATIVE_ATTEMPT="$attempt" \
          BRIEF_WINDOW="$WINDOW" \
          BRIEF_TODAY="$TODAY" \
          "$NODE_BIN" scripts/brief-narrative-parallel.mjs \
       && "$NODE_BIN" scripts/validate-brief-payload.mjs "$PAYLOAD"; then
      NARRATIVE_OK=1
      echo "[brief-timer] parallel narrative collected + schema-valid (attempt $attempt/$NARRATIVE_ATTEMPTS)"
      break
    fi
    echo "[brief-timer] narrative attempt $attempt failed/invalid — restoring payload/config before retry"
    if ! restore_narrative_baseline; then
      echo "[brief-timer] cannot restore payload/config after failed narrative attempt"
      restore_owned_baseline || true
      exit 1
    fi
    attempt=$((attempt + 1))
  done
  [ "$NARRATIVE_OK" = "1" ] || echo "[brief-timer] narrative did not converge after $NARRATIVE_ATTEMPTS attempts — evaluating retained payload against candidate Tier A"
fi

# 3) Select one coherent publication transaction. A retained payload may use a
# candidate Tier A only when the unchanged validator accepts the complete pair.
RETAINED_TIER_B_OK=0
if [ "$NARRATIVE_OK" != "1" ]; then
  if ! restore_narrative_baseline; then
    echo "[brief-timer] cannot restore retained payload/config baseline"
    restore_owned_baseline || true
    exit 1
  fi
  if "$NODE_BIN" scripts/validate-brief-payload.mjs "$PAYLOAD"; then
    RETAINED_TIER_B_OK=1
    echo "[brief-timer] retained narrative matches candidate Tier A — same-target data-only publication selected"
  else
    echo "[brief-timer] retained narrative rejects candidate Tier A — restoring prior snapshot/history and selecting raw data only"
    if ! restore_pair_baseline; then
      echo "[brief-timer] cannot restore snapshot/history baseline"
      restore_owned_baseline || true
      exit 1
    fi
  fi
fi

if [ "$NARRATIVE_OK" = "1" ]; then
  SELECTED_FILES=("${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG" data)
  SELECTION="matching-pair"
elif [ "$RETAINED_TIER_B_OK" = "1" ]; then
  SELECTED_FILES=("${DATA_FILES[@]}" data)
  SELECTION="same-target-data-only"
else
  SELECTED_FILES=(data)
  SELECTION="raw-data-only"
fi

# Validate the exact selected worktree pair immediately before staging.
if ! "$NODE_BIN" scripts/validate-brief-payload.mjs "$PAYLOAD"; then
  echo "[brief-timer] selected publication pair failed final validation — restoring owned baseline"
  restore_owned_baseline || echo "[brief-timer] ERROR: owned baseline restoration failed"
  exit 1
fi
echo "[brief-timer] selected transaction=$SELECTION; final pair validation passed"

if ! "$GIT_BIN" add -- "${SELECTED_FILES[@]}"; then
  echo "[brief-timer] scoped staging failed — restoring owned baseline"
  restore_owned_baseline || echo "[brief-timer] ERROR: owned baseline restoration failed"
  exit 1
fi

BR="$("$GIT_BIN" rev-parse --abbrev-ref HEAD)"

# ALWAYS push any local brief commits that origin doesn't have yet — including a prior run that
# committed but failed to push. push_head returns 0 on success, 1 if it must leave the commit local.
push_head() {
  if "$GIT_BIN" push -q origin "HEAD:$BR"; then
    echo "[brief-timer] pushed to origin/$BR — Pages will redeploy"; return 0
  fi
  echo "[brief-timer] push rejected — pull --rebase without touching unrelated dirt, then retry once"
  if "$GIT_BIN" pull --rebase origin "$BR" && "$GIT_BIN" push -q origin "HEAD:$BR"; then
    echo "[brief-timer] pushed after rebase — Pages will redeploy"; return 0
  fi
  echo "[brief-timer] push still failing — commit left local for the next run to push"; return 1
}

# Are we ahead of origin already (unpushed commits from an earlier run)?
ahead=""
[ "$DRY_RUN" != "1" ] && ahead="$("$GIT_BIN" rev-list "origin/$BR..HEAD" 2>/dev/null || true)"

if "$GIT_BIN" diff --cached --quiet -- "${SELECTED_FILES[@]}"; then
  echo "[brief-timer] no new changes to commit this run"
  # Still ALWAYS push if a previous run left an unpushed commit.
  if [ -n "$ahead" ]; then
    echo "[brief-timer] local commits ahead of origin/$BR — pushing them"
    push_head || true
  fi
  exit 0
fi

if [ "$NARRATIVE_OK" = "1" ]; then
  MSG="market-brief: auto-refresh + narrative $(TZ=America/New_York date '+%Y-%m-%d %H:%M %Z') ($WINDOW)"
else
  MSG="market-brief: Tier-A data-only refresh $(TZ=America/New_York date '+%Y-%m-%d %H:%M %Z') ($WINDOW)"
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "[brief-timer] DRY-RUN — would commit as: $MSG"
  "$GIT_BIN" --no-pager diff --cached --stat -- "${SELECTED_FILES[@]}"
  if ! restore_owned_baseline; then
    echo "[brief-timer] DRY-RUN — owned baseline restoration failed"
    exit 1
  fi
  echo "[brief-timer] DRY-RUN — reverted working tree; no commit, no push"
  exit 0
fi

# 4) commit the changed brief files + ALWAYS push so GitHub Pages redeploys
if ! "$GIT_BIN" commit -q -m "$MSG" -- "${SELECTED_FILES[@]}"; then
  echo "[brief-timer] commit failed — restoring owned baseline"
  restore_owned_baseline || echo "[brief-timer] ERROR: owned baseline restoration failed"
  exit 1
fi
echo "[brief-timer] committed: $MSG"
push_head || exit 0
