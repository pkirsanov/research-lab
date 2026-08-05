#!/usr/bin/env bash
#
# Actionable Market Brief — timer wrapper (data -> all tool briefs -> final -> commit -> push).
#
# This is the "timer wrapper" referenced by notes/market-brief.md §2. It runs on THIS
# MacBook 4x/day via launchd (scripts/com.researchlab.brief-refresh.plist). Each run:
#   1. refreshes shared same-origin bars/options, then runs scripts/brief-refresh.mjs
#      (Tier-A deterministic data — writes market-brief.snapshot.json + appends
#      brief-history.jsonl; closed-market runs target the next session),
#   2. builds and validates one registry-derived brief outcome for EVERY source tool,
#   3. regenerates and contract-validates the Tier-B FINAL narrative (market-brief.payload.json) with the GitHub Copilot
#      CLI (Opus 4.8 by default), locked to file edits only (shell + network denied),
#      RETRYING (default 2 attempts) until the payload validates so each run fully generates,
#   4. publishes the exact tool bundle + final graph and commits scoped files (never `git add -A`),
#   5. ALWAYS git-pushes any local brief commit (including a prior run's unpushed commit) so
#      GitHub Pages redeploys.
#
# Auth: the push uses the repo's HTTPS remote + the macOS osxkeychain credential helper;
# the Copilot CLI reuses its own login (`copilot` → /login once). Both work headlessly
# under launchd while you are logged in (no ssh-agent needed).
#
# Env knobs:
#   BRIEF_MODEL              model slug for the narrative (default: claude-opus-4.8)
#   BRIEF_SKIP_NARRATIVE     set to 1 for a data-only run (skip the Copilot step)
#   BRIEF_COPILOT_EXPECTED_PATH    pinned narrative-runtime path (default: /opt/homebrew/bin/copilot)
#   BRIEF_COPILOT_EXPECTED_VERSION pinned narrative-runtime version as SELF-REPORTED by `copilot --version`
#                                  (default: 1.0.75; npm package metadata is NOT the runtime version)
#   BRIEF_NARRATIVE_ATTEMPTS max narrative gen+validate attempts per run (default: 1)
#   BRIEF_NARRATIVE_TIMEOUT  per-attempt timeout in seconds for the Copilot call (default: 1800)
#   BRIEF_LANE_ATTEMPTS      attempts for each failed lane (scheduler default: 2)
#   BRIEF_LANE_CONCURRENCY   maximum simultaneous Copilot lanes (scheduler default: 2)
#   BRIEF_LANE_EXIT_GRACE    seconds to await process exit after a complete fragment (scheduler default: 60)
#   BRIEF_LANE_TERMINATE_GRACE seconds between TERM and KILL for a lingering lane (scheduler default: 5)
#   BRIEF_FETCH_BARS_TIMEOUT maximum seconds for the canonical bar refresh (default: 1200)
#   BRIEF_FETCH_OPTIONS_TIMEOUT maximum seconds for the option refresh (default: 900)
#   BRIEF_TIER_A_TIMEOUT     maximum seconds for deterministic Tier A (default: 600)
#   BRIEF_REQUIRE_COMPLETE_RUN fail closed on incomplete data/tool/final publication (scheduler forces 1)
#   BRIEF_PUBLICATION_ACK_FILE private scheduler-owned post-push acknowledgment path
#
# Usage:  bash scripts/brief-refresh-and-push.sh [--dry-run]
#   --dry-run : refresh + stage + print what WOULD be committed, then revert; NO narrative
#               AI call, no commit, no push.
#
# Scheduled runs set BRIEF_REQUIRE_COMPLETE_RUN=1 and refuse on any incomplete data, tool-bundle,
# final-author, graph-validation, commit, or push boundary. Direct ad-hoc runs retain the historical
# data-only fallback unless the caller explicitly enables complete-run mode.

set -uo pipefail

export BRIEF_PIPELINE_CONTRACT="pull-data-tools-final-ack-v2"

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1
REQUIRE_COMPLETE_RUN="${BRIEF_REQUIRE_COMPLETE_RUN:-0}"

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
PAGE_FILES=(market-brief.page.json market-brief.config.page.json market-brief.snapshot.page.json market-brief.tools.page.json market-brief.experimental.json)
DERIVED_FILES=(brief-history.recent.jsonl market-brief.scorecard.json)
DERIVED_DIRS=(briefs/tier-a)
OWNED_PATHS=("${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG" "${PAGE_FILES[@]}" "${DERIVED_FILES[@]}" "${DERIVED_DIRS[@]}" data)

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

for baseline_file in "${DATA_FILES[@]}" "$PAYLOAD" "$CONFIG" "${PAGE_FILES[@]}" "${DERIVED_FILES[@]}"; do
  cp "$baseline_file" "$BASELINE_DIR/$baseline_file" || {
    echo "[brief-timer] cannot capture baseline bytes for $baseline_file"
    exit 1
  }
done
for baseline_dir in "${DERIVED_DIRS[@]}"; do
  mkdir -p "$BASELINE_DIR/$(dirname "$baseline_dir")" || exit 1
  cp -R "$baseline_dir" "$BASELINE_DIR/$baseline_dir" || {
    echo "[brief-timer] cannot capture baseline directory $baseline_dir"
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

restore_page_baseline() {
  local page_file
  for page_file in "${PAGE_FILES[@]}"; do
    cp "$BASELINE_DIR/$page_file" "$page_file" || return 1
  done
}

restore_derived_baseline() {
  local derived_file derived_dir
  for derived_file in "${DERIVED_FILES[@]}"; do
    cp "$BASELINE_DIR/$derived_file" "$derived_file" || return 1
  done
  for derived_dir in "${DERIVED_DIRS[@]}"; do
    rm -rf "$derived_dir"
    mkdir -p "$(dirname "$derived_dir")" || return 1
    cp -R "$BASELINE_DIR/$derived_dir" "$derived_dir" || return 1
  done
}

restore_pair_baseline() {
  cp "$BASELINE_DIR/${DATA_FILES[0]}" "${DATA_FILES[0]}" && cp "$BASELINE_DIR/${DATA_FILES[1]}" "${DATA_FILES[1]}"
}

restore_owned_baseline() {
  "$GIT_BIN" restore --staged -- "${OWNED_PATHS[@]}" 2>/dev/null || true
  restore_pair_baseline || return 1
  restore_narrative_baseline || return 1
  restore_page_baseline || return 1
  restore_derived_baseline || return 1
  rm -rf data
  if [ ! -f "$BASELINE_DIR/data-absent" ]; then
    cp -R "$BASELINE_DIR/data" data || return 1
  fi
}

MODEL="${BRIEF_MODEL:-claude-opus-4.8}"
NARRATIVE_ATTEMPTS="${BRIEF_NARRATIVE_ATTEMPTS:-1}"
NARRATIVE_TIMEOUT="${BRIEF_NARRATIVE_TIMEOUT:-1800}"
FETCH_BARS_TIMEOUT="${BRIEF_FETCH_BARS_TIMEOUT:-1200}"
FETCH_OPTIONS_TIMEOUT="${BRIEF_FETCH_OPTIONS_TIMEOUT:-900}"
TIER_A_TIMEOUT="${BRIEF_TIER_A_TIMEOUT:-600}"
COPILOT_EXPECTED_PATH="${BRIEF_COPILOT_EXPECTED_PATH:-/opt/homebrew/bin/copilot}"
COPILOT_EXPECTED_VERSION="${BRIEF_COPILOT_EXPECTED_VERSION:-1.0.75}"

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
PUBLICATION_LEAD_MINUTES="${BRIEF_PUBLICATION_LEAD_MINUTES:-12}"
if   [ "$mins" -ge $((1020 - PUBLICATION_LEAD_MINUTES)) ]; then WINDOW=after-hours
elif [ "$mins" -ge $((900 - PUBLICATION_LEAD_MINUTES))  ]; then WINDOW=pre-close
elif [ "$mins" -ge $((660 - PUBLICATION_LEAD_MINUTES))  ]; then WINDOW=morning
else WINDOW=pre-market; fi

# GNU timeout runs its child in a NEW process group, and the Copilot native binary hangs there —
# `gtimeout 30 copilot --version` returns 124 with no output at all. So the version probe uses a
# same-process-group watchdog instead of run_with_timeout, and keeps the watchdog's own stdout off
# the capture pipe so a successful probe returns immediately instead of waiting out the bound.
copilot_version_probe() {
  local probe_bin="$1"
  "$probe_bin" --version 2>/dev/null &
  local probe_pid=$!
  ( sleep 30; kill -TERM "$probe_pid" 2>/dev/null ) >/dev/null 2>&1 &
  local probe_watch=$!
  wait "$probe_pid" 2>/dev/null
  kill -TERM "$probe_watch" 2>/dev/null || true
  wait "$probe_watch" 2>/dev/null || true
}

# The narrative runtime is pinned, and the pin is asserted rather than assumed, because this build
# has already drifted silently once: `copilot update` rewrote the native binary in place on 2026-07-24
# while the npm package metadata stayed at 1.0.69, so `npm ls` reports a version the runtime does not
# run. The version below is therefore the SELF-REPORTED one, and PATH is checked too because VS Code
# 1.132+ prepends its own extension-managed `copilot` shim ahead of Homebrew. A narrative published
# from an unverified build changes reader-facing output with no record of the change.
# An explicit BRIEF_COPILOT_BIN is an operator/test override and is reported, not measured.
COPILOT_BINDING_DETAIL=""
if [ -n "${BRIEF_COPILOT_BIN:-}" ]; then
  COPILOT_BINDING="override"
  COPILOT_BINDING_DETAIL="explicit BRIEF_COPILOT_BIN=$COPILOT_BIN"
elif [ -z "$COPILOT_BIN" ]; then
  COPILOT_BINDING="absent"
  COPILOT_BINDING_DETAIL="no copilot on PATH"
elif [ "$COPILOT_BIN" != "$COPILOT_EXPECTED_PATH" ]; then
  COPILOT_BINDING="path-mismatch"
  COPILOT_BINDING_DETAIL="resolved $COPILOT_BIN, expected $COPILOT_EXPECTED_PATH"
else
  # "GitHub Copilot CLI 1.0.75." -> 1.0.75; a trailing sentence period is not part of the version.
  copilot_version="$(copilot_version_probe "$COPILOT_BIN" \
    | awk 'NR==1{for(i=1;i<=NF;i++) if($i ~ /^[0-9]+\.[0-9]+\.[0-9]+\.?$/){sub(/\.$/,"",$i); print $i; exit}}')"
  if [ -z "$copilot_version" ]; then
    COPILOT_BINDING="version-unreadable"
    COPILOT_BINDING_DETAIL="$COPILOT_BIN did not report a parsable version"
  elif [ "$copilot_version" != "$COPILOT_EXPECTED_VERSION" ]; then
    COPILOT_BINDING="version-mismatch"
    COPILOT_BINDING_DETAIL="resolved $copilot_version, expected $COPILOT_EXPECTED_VERSION"
  else
    COPILOT_BINDING="ok"
    COPILOT_BINDING_DETAIL="$COPILOT_BIN $copilot_version"
  fi
fi

echo "[brief-timer] $(TZ=America/New_York date '+%Y-%m-%d %H:%M:%S %Z') — window=$WINDOW @ $REPO_ROOT (node=$NODE_BIN git=$GIT_BIN copilot=${COPILOT_BIN:-<none>} binding=$COPILOT_BINDING model=$MODEL dry=$DRY_RUN)"

# 1) Refresh canonical daily bars once for the union of every tool, then fetch
#    option chains and attach those same bar rows. Tier A and browser tools reuse
#    the resulting same-origin snapshots without another ticker-history request.
if [ "$DRY_RUN" != "1" ]; then
  run_with_timeout "$FETCH_BARS_TIMEOUT" env BRIEF_WINDOW="$WINDOW" "$NODE_BIN" scripts/fetch-bars.mjs || {
    echo "[brief-timer] fetch-bars failed"
    [ "$REQUIRE_COMPLETE_RUN" = "1" ] && { restore_owned_baseline || true; exit 1; }
  }
  run_with_timeout "$FETCH_OPTIONS_TIMEOUT" env BRIEF_WINDOW="$WINDOW" "$NODE_BIN" scripts/fetch-options.mjs || {
    echo "[brief-timer] fetch-options failed"
    [ "$REQUIRE_COMPLETE_RUN" = "1" ] && { restore_owned_baseline || true; exit 1; }
  }
  if [ "$REQUIRE_COMPLETE_RUN" = "1" ] && ! BRIEF_WINDOW="$WINDOW" "$NODE_BIN" scripts/validate-brief-cache.mjs --require-current-run; then
    echo "[brief-timer] current-window data refresh is incomplete — refusing before tool briefs"
    restore_owned_baseline || echo "[brief-timer] ERROR: owned baseline restoration failed"
    exit 1
  fi
fi

# 1b) Tier-A deterministic refresh. Scheduled runs fail closed; ad-hoc legacy runs retain the
# historical soft behavior unless BRIEF_REQUIRE_COMPLETE_RUN=1 is explicitly set.
if [ "$REQUIRE_COMPLETE_RUN" = "1" ]; then
  run_with_timeout "$TIER_A_TIMEOUT" env BRIEF_WINDOW="$WINDOW" "$NODE_BIN" scripts/brief-refresh.mjs --window "$WINDOW" --strict || {
    echo "[brief-timer] Tier-A refresh failed — refusing before tool briefs"
    restore_owned_baseline || true
    exit 1
  }
else
  run_with_timeout "$TIER_A_TIMEOUT" env BRIEF_WINDOW="$WINDOW" "$NODE_BIN" scripts/brief-refresh.mjs --window "$WINDOW" || echo "[brief-timer] refresh returned non-zero (soft) — continuing"
fi

# 1b-ii) Score every open call against its OWN published trigger/invalidation BEFORE the narrative
# lane runs, so the author sees this run's real track record rather than authoring blind. Appending
# outcomes is additive and never blocks publication: a scoring failure must not cost us the brief.
run_with_timeout "$TIER_A_TIMEOUT" "$NODE_BIN" scripts/evaluate-recommendations.mjs \
  || echo "[brief-timer] recommendation scoring returned non-zero (soft) — continuing"

SHARDED_HISTORY=0

# 1c) Freeze and validate one truthful brief outcome for every registry source BEFORE final authorship.
# Scheduled runs require this complete barrier; the exact bytes are passed to every final-author lane and
# later to the distributed publisher, which rejects any snapshot/registry/fingerprint drift.
TOOL_BRIEF_BUNDLE="$BASELINE_DIR/tool-brief-bundle.json"
TOOL_BRIEF_BUNDLE_READY=0
if [ "$REQUIRE_COMPLETE_RUN" = "1" ]; then
  if "$NODE_BIN" scripts/brief-distributed-publish.mjs --prepare-tools --root . --output "$TOOL_BRIEF_BUNDLE"; then
    TOOL_BRIEF_BUNDLE_READY=1
  else
    echo "[brief-timer] all-tool brief barrier failed — refusing before final brief"
    restore_owned_baseline || true
    exit 1
  fi
fi

# 2) Tier-B narrative regeneration with four write-disjoint Copilot lanes in parallel,
#    followed by one deterministic collector and the unchanged payload validator.
NARRATIVE_OK=0
if [ "$DRY_RUN" = "1" ]; then
  echo "[brief-timer] DRY-RUN — skipping the Copilot narrative AI call"
elif [ "${BRIEF_SKIP_NARRATIVE:-0}" = "1" ]; then
  if [ "$REQUIRE_COMPLETE_RUN" = "1" ]; then
    echo "[brief-timer] final brief is required for scheduled runs; BRIEF_SKIP_NARRATIVE is not permitted"
    restore_owned_baseline || true
    exit 1
  fi
  echo "[brief-timer] BRIEF_SKIP_NARRATIVE=1 — data-only run, narrative not regenerated"
elif [ -z "$COPILOT_BIN" ]; then
  if [ "$REQUIRE_COMPLETE_RUN" = "1" ]; then
    echo "[brief-timer] copilot CLI not found — refusing because the final brief is required"
    restore_owned_baseline || true
    exit 1
  fi
  echo "[brief-timer] copilot CLI not found — data-only run (install: npm i -g @github/copilot)"
elif [ "$COPILOT_BINDING" != "ok" ] && [ "$COPILOT_BINDING" != "override" ]; then
  if [ "$REQUIRE_COMPLETE_RUN" = "1" ]; then
    echo "[brief-timer] refusing: pinned narrative runtime failed its binding check ($COPILOT_BINDING: $COPILOT_BINDING_DETAIL)"
    echo "[brief-timer] publishing a narrative from an unverified Copilot build would change reader-facing output without review"
    echo "[brief-timer] remediation: restore $COPILOT_EXPECTED_PATH at $COPILOT_EXPECTED_VERSION, or raise BRIEF_COPILOT_EXPECTED_VERSION after validating one full run on the new build"
    restore_owned_baseline || true
    exit 1
  fi
  echo "[brief-timer] pinned narrative runtime failed its binding check ($COPILOT_BINDING: $COPILOT_BINDING_DETAIL) — data-only run, narrative not regenerated"
else
  # The parallel launcher owns its curated finance/econ web allowlist and keeps shell denied.
  WEB_STATE="curated-web-on"
  [ "${BRIEF_NO_WEB:-0}" = "1" ] && WEB_STATE="web-off"
  TODAY="$(TZ=America/New_York date '+%Y-%m-%d')"
  echo "[brief-timer] regenerating narrative via 4 parallel Copilot lanes ($MODEL; $WEB_STATE, shell denied; up to ${NARRATIVE_ATTEMPTS}x @ ${NARRATIVE_TIMEOUT}s per lane)…"
  # The delegated launcher applies --allow-all-tools, --deny-tool=shell, and its per-lane web policy.
  # Retry until the payload passes the full contract validator, so each run FULLY generates a valid brief;
  # a failed/timed-out/invalid attempt reverts the payload before the next try (never commit a broken payload).
  # --drop-unscoreable enforces D16 on THIS run's candidate: a tactical/swing call whose own prose cannot
  # attribute a direction-correct invalidation level is withheld by name, and the rest of the brief still
  # publishes. Refusing the whole run over one unscoreable call would cost us the brief, which is a larger
  # harm than the claim it prevents; the baseline and final rungs stay non-mutating and only report.
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
          BRIEF_TOOL_BUNDLE="$TOOL_BRIEF_BUNDLE" \
          "$NODE_BIN" scripts/brief-narrative-parallel.mjs \
       && "$NODE_BIN" scripts/validate-brief-payload.mjs "$PAYLOAD" --drop-unscoreable; then
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

if [ "$DRY_RUN" != "1" ] && [ "$REQUIRE_COMPLETE_RUN" = "1" ] && [ "$NARRATIVE_OK" != "1" ]; then
  echo "[brief-timer] final brief generation failed — refusing the complete scheduled run"
  restore_owned_baseline || true
  exit 1
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

# Validate cache files independently so a narrative failure can never discard a
# successful ticker refresh. Snapshot/payload remain fail-closed whenever selected.
if ! "$NODE_BIN" scripts/validate-brief-cache.mjs; then
  echo "[brief-timer] selected cache publication failed validation — restoring owned baseline"
  restore_owned_baseline || echo "[brief-timer] ERROR: owned baseline restoration failed"
  exit 1
fi
if [ "$SELECTION" != "raw-data-only" ]; then
  if ! "$NODE_BIN" scripts/validate-brief-payload.mjs "$PAYLOAD"; then
    echo "[brief-timer] selected publication pair failed final validation — restoring owned baseline"
    restore_owned_baseline || echo "[brief-timer] ERROR: owned baseline restoration failed"
    exit 1
  fi
  echo "[brief-timer] selected transaction=$SELECTION; cache + final pair validation passed"
else
  echo "[brief-timer] selected transaction=raw-data-only; cache validation passed; published brief pair left unchanged"
fi

# 3a) Re-shard only the SELECTED append-only history. This must run after any retained-pair
# restoration; sharding the rejected candidate first would publish a recent/monthly projection that
# disagreed with the restored source log.
if run_with_timeout "$TIER_A_TIMEOUT" "$NODE_BIN" scripts/shard-brief-history.mjs; then
  SHARDED_HISTORY=1
else
  echo "[brief-timer] history sharding returned non-zero (soft) — the cockpit keeps its previous bounded window"
fi

# 3b) Distributed per-tool brief graph (ADDITIVE + SOFT-FAIL, briefs/-only). Regenerate the
# content-addressed briefs/ graph (per-tool tool-briefs + per-tool history + final brief + indexes +
# briefs/current.json) from the just-published snapshot + narrative and ride it in the SAME scoped
# commit/push as the main brief. It is deliberately SOFT: any failure here logs a warning, discards any
# partial briefs/ writes, and the main-brief transaction proceeds byte-for-byte UNCHANGED. The publisher
# writes ONLY under briefs/ — never market-brief.*, never data/ — so it can never block or corrupt the
# main brief. On --dry-run it mutates nothing. briefs/ is NOT part of the pre-fetch owned-path refusal,
# so a dirty briefs/ can never block the main brief.
DISTRIBUTED_OK=0
if [ "$DRY_RUN" = "1" ]; then
  if "$NODE_BIN" scripts/brief-distributed-publish.mjs --dry-run --root .; then
    echo "[brief-timer] DRY-RUN — distributed publisher reported what it WOULD publish under briefs/ (no mutation)"
  else
    echo "[brief-timer] DRY-RUN — distributed publisher dry-run soft-failed (main brief unaffected)"
  fi
elif [ "$NARRATIVE_OK" != "1" ]; then
  echo "[brief-timer] distributed graph retained — this run did not generate a new final brief"
else
  tool_bundle_args=()
  if [ "$TOOL_BRIEF_BUNDLE_READY" = "1" ]; then
    tool_bundle_args=(--tool-bundle "$TOOL_BRIEF_BUNDLE")
  fi
  if "$NODE_BIN" scripts/brief-distributed-publish.mjs --root . "${tool_bundle_args[@]}" \
    && "$NODE_BIN" scripts/validate-distributed-briefs.mjs --root . --graph-only; then
    DISTRIBUTED_OK=1
    echo "[brief-timer] distributed briefs/ graph generated + graph-validated — will ride the same commit"
  else
    echo "[brief-timer] distributed publisher failed — discarding briefs/ changes"
    "$GIT_BIN" restore --staged -- briefs 2>/dev/null || true
    "$GIT_BIN" checkout -- briefs 2>/dev/null || true
    "$GIT_BIN" clean -fdq -- briefs 2>/dev/null || true
    if [ "$REQUIRE_COMPLETE_RUN" = "1" ]; then
      echo "[brief-timer] exact all-tool/final publication is required — refusing the scheduled run"
      restore_owned_baseline || true
      exit 1
    fi
    echo "[brief-timer] main brief proceeds unchanged by the optional distributed graph"
  fi
fi
if [ "$DISTRIBUTED_OK" = "1" ]; then
  SELECTED_FILES+=(briefs)
elif [ "${SHARDED_HISTORY:-0}" = "1" ]; then
  # The tier-A shards live under briefs/ but are independent of the distributed graph, so they still
  # ride the commit when that optional publisher did not run.
  SELECTED_FILES+=(briefs/tier-a)
fi
if [ "${SHARDED_HISTORY:-0}" = "1" ]; then
  SELECTED_FILES+=(brief-history.recent.jsonl)
fi

# 3c) The published track record. Derived purely from the outcome ledger, so it is regenerated AFTER
# scoring and rides the same scoped commit. It is not an owned-path refusal input: a stale scorecard
# must never be able to block the brief itself.
if run_with_timeout "$TIER_A_TIMEOUT" "$NODE_BIN" scripts/build-scorecard.mjs; then
  SELECTED_FILES+=(market-brief.scorecard.json)
else
  echo "[brief-timer] scorecard build returned non-zero (soft) — publishing without a refreshed track record"
fi

# 3d) Build the page-specific projections AFTER payload, snapshot, scorecard, and registry are final.
# The full artifacts remain the immutable research/audit records; the page consumes only the fields
# it renders on first paint, while hidden experimental prose is fetched on demand. A stale projection
# is a contradictory public surface, so unlike optional distributed publication this is fail-closed.
if [ "$DRY_RUN" = "1" ]; then
  run_with_timeout "$TIER_A_TIMEOUT" "$NODE_BIN" scripts/build-brief-page-artifacts.mjs --dry-run \
    || { echo "[brief-timer] compact page projection dry-run failed"; exit 1; }
else
  run_with_timeout "$TIER_A_TIMEOUT" "$NODE_BIN" scripts/build-brief-page-artifacts.mjs \
    || { echo "[brief-timer] compact page projection failed — restoring owned baseline"; restore_owned_baseline || true; exit 1; }
  SELECTED_FILES+=(
    market-brief.page.json
    market-brief.config.page.json
    market-brief.snapshot.page.json
    market-brief.tools.page.json
    market-brief.experimental.json
  )
fi

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

write_publication_ack() {
  [ -z "${BRIEF_PUBLICATION_ACK_FILE:-}" ] && return 0
  local ack_dir ack_tmp pushed_commit pushed_at pushed_epoch
  if [ -z "${BRIEF_PUBLICATION_ACK_TOKEN:-}" ]; then
    echo "[brief-timer] publication acknowledgment identity is incomplete"
    return 1
  fi
  pushed_commit="$("$GIT_BIN" rev-parse HEAD 2>/dev/null || true)"
  case "$pushed_commit" in
    ''|*[!0-9a-f]*)
      echo "[brief-timer] cannot resolve the pushed commit for publication acknowledgment"
      return 1
      ;;
  esac
  pushed_at="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  pushed_epoch="$(date +%s)"
  ack_dir="${BRIEF_PUBLICATION_ACK_FILE%/*}"
  [ "$ack_dir" = "$BRIEF_PUBLICATION_ACK_FILE" ] && ack_dir="."
  mkdir -p "$ack_dir" || return 1
  ack_tmp="${BRIEF_PUBLICATION_ACK_FILE}.tmp.$$"
  umask 077
  {
    printf '%s\n' "schemaVersion=1"
    printf '%s\n' "token=$BRIEF_PUBLICATION_ACK_TOKEN"
    printf '%s\n' "runKey=${BRIEF_PUBLICATION_RUN_KEY:-}"
    printf '%s\n' "window=${BRIEF_PUBLICATION_WINDOW-$WINDOW}"
    printf '%s\n' "branch=$BR"
    printf '%s\n' "remote=${BRIEF_PUBLICATION_REMOTE:-origin}"
    printf '%s\n' "commit=$pushed_commit"
    printf '%s\n' "pushedAt=$pushed_at"
    printf '%s\n' "pushedEpoch=$pushed_epoch"
  } >"$ack_tmp" || { rm -f "$ack_tmp"; return 1; }
  mv -f "$ack_tmp" "$BRIEF_PUBLICATION_ACK_FILE"
}

# Are we ahead of origin already (unpushed commits from an earlier run)?
ahead=""
[ "$DRY_RUN" != "1" ] && ahead="$("$GIT_BIN" rev-list "origin/$BR..HEAD" 2>/dev/null || true)"

if "$GIT_BIN" diff --cached --quiet -- "${SELECTED_FILES[@]}"; then
  echo "[brief-timer] no new changes to commit this run"
  # Still ALWAYS push if a previous run left an unpushed commit.
  if [ -n "$ahead" ]; then
    echo "[brief-timer] local commits ahead of origin/$BR — pushing them"
    if ! push_head; then
      [ "$REQUIRE_COMPLETE_RUN" = "1" ] && exit 1
      exit 0
    fi
  fi
  if ! write_publication_ack; then
    echo "[brief-timer] post-push publication acknowledgment failed"
    [ "$REQUIRE_COMPLETE_RUN" = "1" ] && exit 1
  fi
  exit 0
fi

if [ "$NARRATIVE_OK" = "1" ]; then
  MSG="market-brief: auto-refresh + narrative $(TZ=America/New_York date '+%Y-%m-%d %H:%M %Z') ($WINDOW)"
elif [ "$SELECTION" = "raw-data-only" ]; then
  MSG="market-data: cache refresh $(TZ=America/New_York date '+%Y-%m-%d %H:%M %Z') ($WINDOW)"
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
if ! push_head; then
  [ "$REQUIRE_COMPLETE_RUN" = "1" ] && exit 1
  exit 0
fi
if ! write_publication_ack; then
  echo "[brief-timer] post-push publication acknowledgment failed"
  [ "$REQUIRE_COMPLETE_RUN" = "1" ] && exit 1
fi
