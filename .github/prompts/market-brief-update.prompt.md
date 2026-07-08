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
5. **Research deep + author to the QUALITY BAR** (§6, §6b, §9). This is a research product, not a data dump:
   research recent events / patterns / psychology / regime (web-fetch trusted finance-econ sources; VERIFY or
   label STALE) and apply real technique (regime-switching, momentum/RRG, vol term-structure, dealer-gamma,
   dispersion/breadth, seasonality/event-study, risk models). Then author: the attention feed (≤ 7 ranked),
   **an events table sorted NEAREST-FIRST that leads with imminent catalysts** (this week + next ~10 trading
   days — CPI/PPI/PCE, claims, ISM/PMI, Fed speakers/FOMC, auctions, OPEX, in-window earnings — not only
   month-end / OPEX), **concrete ACTIONABLE sector-rotation + ETF/factor-momentum recommendations**
   (instrument, direction, the level / RS-cross trigger, deep-link), and a psychology+regime read that NAMES
   the regime and crowd posture with evidence + what would falsify it — **each with its inputs shown and
   labeled an estimate, never a fact.**
6. **Per watchlist item + experimental tools** (§7): produce a computed status card by default; build a
   bespoke tool only when the name is complex AND recurring. When research reveals a durable, reusable edge
   with no owning tool, **draft an experimental `<id>.html`, iterate, and — once genuinely useful — PROMOTE it
   to a final tool** (registry sync + `notes/<id>.md` + a selftest group + validation, §8/§11), deep-linked
   from the brief. Surface not-yet-built ideas in `payload.experimental[]`. Never commit watchlist sizes/P&L.
7. **Write outputs.** Rewrite `market-brief.payload.json` (§9 schema) — stamp `generatedAt` with the actual
   current ISO timestamp of this run (distinct from `asOf`, the window anchor) — and append one line to
   `brief-history.jsonl`. Apply the redeploy decision rule (§8): data-only ⇒ commit data (no HTML redeploy);
   tool change ⇒ redeploy + registry sync + validation.
8. **Validate & commit.** If any HTML/JS changed, run `node scripts/selftest.mjs` and the Section-9 check
   first. Keep the brief actionable and low-noise. Commit → GitHub Pages auto-deploys.
