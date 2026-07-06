#!/usr/bin/env bash
# Actionable Market Brief — Tier B nudge.
#
# Sends an ntfy push so the operator runs the Copilot agent step (`/market-brief-update`)
# at the four ET windows. The Copilot agent runs on macOS/WSL (it cannot run on evo-x2),
# so evo-x2 fires the DATA refresh (brief-refresh.mjs) and then this nudge; the human runs
# the narrative step in VS Code. Wire this into the SAME knb systemd timer that runs
# brief-refresh.mjs (data first, then nudge).
#
# Config (non-secret): set BRIEF_NTFY_TOPIC and optionally BRIEF_NTFY_URL. The ntfy topic
# name IS the only auth for a public ntfy topic — keep it unguessable; do NOT commit it.
# This script never prints the topic value.
#
# Usage:  BRIEF_NTFY_TOPIC=<your-topic> bash scripts/brief-nudge.sh [window]
set -euo pipefail

NTFY_URL="${BRIEF_NTFY_URL:-https://ntfy.sh}"
TOPIC="${BRIEF_NTFY_TOPIC:?BRIEF_NTFY_TOPIC must be set (the ntfy topic; keep it private)}"

# Derive the window from the ET clock unless one was passed.
window="${1:-}"
if [ -z "$window" ]; then
  et_h=$(TZ=America/New_York date +%H)
  et_m=$(TZ=America/New_York date +%M)
  mins=$((10#$et_h * 60 + 10#$et_m))
  if   [ "$mins" -ge 1020 ]; then window="after-hours"   # 17:00
  elif [ "$mins" -ge 900  ]; then window="pre-close"     # 15:00
  elif [ "$mins" -ge 660  ]; then window="morning"       # 11:00
  else window="pre-market"; fi
fi

curl -fsS \
  -H "Title: Market Brief — ${window}" \
  -H "Tags: chart_with_upwards_trend" \
  -H "Priority: default" \
  -d "Run /market-brief-update window=${window} in VS Code (Copilot). Data snapshot already refreshed by brief-refresh.mjs." \
  "${NTFY_URL}/${TOPIC}" >/dev/null

echo "[brief-nudge] sent window=${window} to ntfy (topic hidden)"
