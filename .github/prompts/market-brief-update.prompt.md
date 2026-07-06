---
mode: agent
description: Run one Actionable Market Brief update window end-to-end, per notes/market-brief.md.
---

Update the **Actionable Market Brief** for window: `${input:window:pre-market}` (one of
`pre-market` | `morning` | `pre-close` | `after-hours`).

Follow [`notes/market-brief.md`](../../notes/market-brief.md) exactly — it is the source of truth. Steps:

1. **Load context.** Read `market-brief.config.json`, `watchlist.json`, the last `brief-history.jsonl`
   snapshot, and the current `market-brief.payload.json`.
2. **Refresh only what's missing.** Append missing/stale data into the shared `rlData` cache per the
   append-not-refetch rule and the free / option-chain data sources in the runbook (§3). Never refetch a
   series a sibling tool already cached.
3. **Recompute the live signals** — regime (`rlg.js`), momentum + Δ, rotation states, gamma flip/walls,
   20/50/200 MA, breadth, flow proxies — **reusing the existing tools' helpers; do NOT duplicate them** (§4).
4. **Detect changes** vs the last snapshot (§5): trend accel/decel, regime just-flipped/approaching,
   rotation about-to-flip, gamma-flip proximity.
5. **Author the agent layer** (§6, §9): the attention feed (≤ 7 ranked cards), recommendations, the events
   table with option-implied moves + scenario probabilities + expected effect, and the psychology read —
   **each with its inputs shown and labeled an estimate, never a fact.**
6. **Per watchlist item** (§7): produce a computed status card by default; update or build a bespoke tool
   only when the name is complex AND recurring. Never commit watchlist sizes/P&L.
7. **Write outputs.** Rewrite `market-brief.payload.json` (§9 schema) and append one line to
   `brief-history.jsonl`. Apply the redeploy decision rule (§8): data-only ⇒ commit data (no HTML redeploy);
   tool change ⇒ redeploy + registry sync + validation.
8. **Validate & commit.** If any HTML/JS changed, run `node scripts/selftest.mjs` and the Section-9 check
   first. Keep the brief actionable and low-noise. Commit → GitHub Pages auto-deploys.
