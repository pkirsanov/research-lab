---
mode: agent
description: Run one Actionable Market Brief update window end-to-end, per notes/market-brief.md.
---

Update the **Actionable Market Brief** for window: `${input:window:pre-market}` (one of
`pre-market` | `morning` | `pre-close` | `after-hours`).

Follow [`notes/market-brief.md`](../../notes/market-brief.md) exactly — it is the source of truth. Steps:

1. **Load context.** Read `tools.json`, `market-brief.config.json`, `watchlist.json`, the last
   `brief-history.jsonl` snapshots, `market-brief.snapshot.json` (including `toolReads`, `toolCoverage`,
   `marketClosed`, and `nextSessionDate`), and the current `market-brief.payload.json`.
2. **Refresh only what's missing.** Append missing/stale data into the shared `rlData` cache per the
   append-not-refetch rule and the free / option-chain data sources in the runbook (§3). Never refetch a
   series a sibling tool already cached.
3. **Recompute the live signals** — regime (`rlg.js`), momentum + Δ, rotation states, gamma flip/walls,
   the **20/50/200-day MA structure**, the **long-horizon 126/252-day momentum + 52-week-range position**
   (the §6c structural frame — Tier-A now emits these), the **mega-cap / thematic group reads + breadth**
   (Mag 7 → MAGS, semis → SOXX; §7a — Tier-A now emits these), breadth, flow proxies — **reusing the existing
   tools' helpers; do NOT duplicate them** (§4).
4. **Detect changes** vs the last snapshot (§5): trend accel/decel, regime just-flipped/approaching,
   rotation about-to-flip, gamma-flip proximity. **Apply the persistence gate (§5/§6c):** a momentum / RS
   micro-delta is **noise until proven signal** — it earns a card or a rec *change* only if it persists
   ≥ 2–3 snapshots, breaks a structural level, or is corroborated by a second signal. Read the last 2–3
   `brief-history.jsonl` rows before calling anything a "change." Count only DISTINCT market-bar/tool-read
   `asOf` dates — repeated weekend/holiday narratives over the same close are one observation, not persistence.
   Never flip a call on one window's wiggle.
5. **Author the STRUCTURAL BACKDROP first (§6c, §9 `backdrop`)** — the larger-picture frame the whole brief
   sits inside, rendered at the TOP of the cockpit: the primary trend + **where-in-cycle** (early/mid/late/
   topping/bottoming) + the 20/50/200 MA structure; the **macro cycle** (CB path + what the curve prices,
   rates/USD/credit/liquidity direction); the **standing global/geopolitical backdrop** (`config.json →
   globalBackdrop[]` — war-risk, trade & tariffs, elections, China, energy, JPY-carry — read the CURRENT
   impact, verify live, never fabricate); **what's priced in**; and the **asymmetry / where the crowd is
   offside**. Structure first, noise last.
6. **Research deep + author to the QUALITY BAR** (§6, §6b, §9). Read every registered tool's available
   `toolRead` / coverage entry. Mandatory each run: `global-rotation-lab` country/FX/session analysis and
   `real-assets-lab` model-specific `GLD`, `SLV`, `BTC-USD` / `IBIT`, broad commodities and oil analysis.
   This is a research product, not a data dump: research recent events / patterns / psychology / regime (web-fetch trusted finance-econ sources; VERIFY or
   label STALE) and apply real technique (regime-switching, momentum/RRG, vol term-structure, dealer-gamma,
   dispersion/breadth, seasonality/event-study, risk models). Then author: the attention feed (≤ 7 ranked),
   **an events table sorted NEAREST-FIRST that leads with imminent catalysts** (this week + next ~10 trading
   days — CPI/PPI/PCE, claims, ISM/PMI, Fed speakers/FOMC, auctions, OPEX, in-window earnings — not only
   month-end / OPEX), **concrete ACTIONABLE sector-rotation + ETF/factor/global/real-asset recommendations**
   (instrument, direction, the level / RS-cross trigger, deep-link), and a psychology+regime read that NAMES
   the regime and crowd posture with evidence + what would falsify it — **each with its inputs shown and
   labeled an estimate, never a fact.** **Every attention card + recommendation carries a `horizon`
   (`structural` / `swing` / `tactical`) and a `structuralAnchor`; recs also carry a `trigger` +
   `invalidation`. A `tactical`-only item is capped at confidence ≤ 55, and a rec with no structural anchor
   is not ready to ship (§6c).**
7. **Author `nextSession` FIRST.** Emit at most the configured number of immediately executable actions for
   `snapshot.nextSessionDate`: no `watch`, no vague commentary, and no missing trigger / invalidation /
   structural anchor. Use `hold|trim|add|hedge|rotate`; if nothing clears the bar, emit an empty action list
   and say so. Elevate an owning-tool read only when it changes or independently confirms/falsifies that plan.
8. **Per watchlist item + experimental tools** (§7): produce a computed status card by default; build a
   bespoke tool only when the name is complex AND recurring. When research reveals a durable, reusable edge
   with no owning tool, **draft an experimental `<id>.html`, iterate, and — once genuinely useful — PROMOTE it
   to a final tool** (registry sync + `notes/<id>.md` + a selftest group + validation, §8/§11), deep-linked
   from the brief. Surface not-yet-built ideas in `payload.experimental[]`. **Author the mega-cap / thematic
   groups (§7a):** for each `track.groups[]` group write `payload.groups[]` with the ETF read + breadth (from
   the Tier-A slice) and ELEVATE the notable members (moving OR structurally diverging), capped +
   structure-first + persistence-gated — never force all members every run; promote a market-moving member
   into the attention feed / `watchlistNotes` when it clears the bar. Never commit watchlist sizes/P&L.
9. **Write outputs.** Rewrite `market-brief.payload.json` (§9 schema) — stamp `generatedAt` with the actual
   current ISO timestamp of this run (distinct from `asOf`, the window anchor) — and append one line to
   `brief-history.jsonl`. Apply the redeploy decision rule (§8): data-only ⇒ commit data (no HTML redeploy);
   tool change ⇒ redeploy + registry sync + validation.
10. **Validate & commit.** If any HTML/JS changed, run `node scripts/selftest.mjs` and the Section-9 check
   first. Keep the brief actionable and low-noise. Commit → GitHub Pages auto-deploys.
