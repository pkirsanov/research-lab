---
mode: agent
description: Run one Actionable Market Brief update window end-to-end, per notes/market-brief.md.
---

Update the **Actionable Market Brief** for window: `${input:window:pre-market}` (one of
`pre-market` | `morning` | `pre-close` | `after-hours`).

Run the shared isolated publication launcher once:

`bash scripts/brief-refresh-scheduled.sh --trigger on-demand --window ${input:window:pre-market}`

The launcher owns source reads, frozen inputs, company composition, final-brief generation,
validation, restoration, commit, push, and acknowledgment. Do not edit payload, history,
configuration, registry, publication artifacts, or Git directly from this prompt.
