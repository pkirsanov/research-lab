# Actionable Market Brief — Agent Runbook

> **Tool id:** `market-brief` · **Status:** Phase 0 (foundation) — the cockpit HTML is not built yet.
>
> **This is the operating runbook the Copilot agent FOLLOWS on every brief update** — the four daily
> windows and any ad-hoc refresh. It encodes the full spec plus the operator's ratified decisions
> (2026-07-06). Keep it current: it is the single source of truth for what the agent does each run.
>
> **Educational only — NOT investment advice.** Every number the brief shows is either a live
> in-browser computation or a clearly-labeled estimate. Nothing here is a guarantee.

Companion files:

- [`market-brief.config.json`](../market-brief.config.json) — universe, deep-link map, windows, thresholds, macro-events.
- [`watchlist.json`](../watchlist.json) — tickers only (never sizes / P&L).
- `market-brief.payload.json` — the agent layer output, rewritten each run (§9 schema).
- `brief-history.jsonl` — append-only per-run snapshots (the brief's memory for change-detection, §5).
- [`notes/shared-data-layer.md`](shared-data-layer.md) — the `rlData` / `RLDATA` shared-cache contract.

---

## 0. TL;DR for the agent

The brief is a **cockpit**, not another analysis tool. It answers exactly one question —
**"what changed that I should act on, and what's coming?"** — and deep-links every *why* to the tool
that already owns it.

It renders **two layers**:

- **Live layer** — client-side, no commit. Reuses the existing tools' math on the shared `rlData`
  cache (regime, momentum, rotation state, gamma walls, MAs). Fresh whenever the page is opened.
- **Agent layer** — committed each run as `market-brief.payload.json`. The narrative, recommendations,
  event probabilities and psychology read. This is the only thing a routine run changes.

The brief **owns** only these things (everything else is a deep link):

1. The ranked **attention feed** (≤ 7 cards).
2. **Change-detection** over time (accel/decel, regime just-flipped/approaching, rotation about-to-flip).
3. The **events + probabilities + expected-effect** table.
4. The **watchlist roll-up**.
5. The **standing big-picture backdrop** (§6c) — the structural frame (primary trend, macro cycle, global
   tensions, what's priced in) that ALL of the above sit inside, so the tactical reads never float free of it.

**Golden rules:** reuse — never duplicate — the existing tools; **APPEND** missing data, never refetch
everything; keep it actionable and low-noise; **structure first, noise last** (§6c) — anchor every read in
the larger picture and never flip a call on one window's intraday micro-move; probabilities are **estimates
with inputs shown**, never facts; the watchlist is **tickers-only** (public repo).

---

## 1. Update windows (ET, Mon–Fri) + per-window checklist

| # | ET | Window id | Relative to session | Focus |
|---|----|-----------|---------------------|-------|
| W1 | 07:30 | `pre-market` | 2 h before open | overnight / pre-market gaps, futures, Asia/Europe, overnight news; today's events + option-implied moves; gap-fill odds; levels to watch at the open |
| W2 | 11:00 | `morning` | 1.5 h after open | did the open hold/reject key levels (gamma flip, 20/50/200 MA); morning trend vs the pre-market thesis; rotation confirmation; intraday breadth |
| W3 | 15:00 | `pre-close` | 1 h before close | positioning into the close; gamma pin / magnet; MOC imbalance tells; hold vs hedge overnight; tomorrow's pre-market events |
| W4 | 17:00 | `after-hours` | 1 h after close | after-hours earnings reactions; regime / rotation deltas vs the prior close; what changed today + expected follow-through; overnight risk |

Cron (`TZ=America/New_York`): `30 7 * * 1-5` and `0 11,15,17 * * 1-5`.

Each run declares its `window` so the brief renders the matching focus and the agent weights the right
signals (pre-market = gaps/futures/events; morning = confirmation; pre-close = positioning/MOC;
after-hours = reactions/follow-through).

---

## 2. Trigger topology (wired in Phase 4)

- **Tier A (data) + Tier B (narrative) — on THIS MacBook (macOS `launchd`, 4×/day) → commit → push.** The
  launchd job (`scripts/com.researchlab.brief-refresh.plist`) runs the timer wrapper
  `scripts/brief-refresh-and-push.sh`, which on each run:
  1. runs `scripts/brief-refresh.mjs` (fetches VIX + Fear&Greed + daily bars — Yahoo, no CORS in Node —
     recomputes the deterministic signals: regime, per-name momentum, per-sector RRG-lite), appends one
     `brief-history.jsonl` snapshot, and writes `market-brief.snapshot.json` (the "Computed (Tier-A)" slice);
  2. **regenerates the Tier-B narrative `market-brief.payload.json` with the GitHub Copilot CLI**
     (`copilot -p … --model claude-opus-4.8 --allow-all-tools --deny-tool=shell` — locked to file edits, no
     shell/scripts/git and no URL/web-fetch — so it only reads the fresh data + runbook and rewrites the
     payload) per §6/§9: attention feed, recommendations, event probabilities, psychology read;
  3. **commits the changed brief files (scoped — never `git add -A`) and `git push`es** (HTTPS remote + macOS
     osxkeychain helper; the Copilot CLI reuses its own login — both headless-safe) so **GitHub Pages
     redeploys**.
  It skips weekends (no bars ⇒ nothing to commit); a narrative failure/timeout falls back to a data-only
  commit and never wedges the timer. Knobs: `BRIEF_MODEL` (default `claude-opus-4.8`), `BRIEF_SKIP_NARRATIVE=1`
  (data-only). Install once: the Copilot CLI (`npm i -g @github/copilot`, then `copilot` → `/login`), then
  `cp scripts/com.researchlab.brief-refresh.plist ~/Library/LaunchAgents/` (edit the wrapper path) and
  `launchctl load ~/Library/LaunchAgents/com.researchlab.brief-refresh.plist`. evo-x2 + a knb systemd timer
  is an equivalent always-on alternative host.
- **On-demand narrative — macOS Copilot in VS Code.** `/market-brief-update window=<id>` runs the same
  narrative authoring interactively — useful when you also want to build/update a tool alongside the brief.
  The headless timer above covers the routine 4×/day regeneration; this is the manual override.

On this setup **this MacBook owns the whole loop**: launchd fires the data refresh, the Copilot-CLI narrative
regeneration (Opus 4.8), the commit, and the push — all four windows, unattended. (You can still author the
narrative interactively in VS Code with `/market-brief-update` when you want to build tooling alongside it.)

---

## 3. Data + shared-cache rules

- Use `rlData` / `RLDATA` ([shared-data-layer.md](shared-data-layer.md)). **APPEND** — `putBars` dedupes by
  `t`, plus `putMacro` / `putOptions` / `putEvents`. Honor the TTL freshness table. **Never refetch a series
  a sibling tool already cached.** Provider-tag every series (`src`); never blend adjusted and raw closes.
- **FREE sources only, same mechanism as the option chains:**
  - **Bars / quotes:** Yahoo `v8/finance/chart` (adjusted) via `direct → allorigins → codetabs` proxies;
    Twelve Data (shared `rlApiKeys` key, 8/min throttle) as fallback.
  - **Options / gamma:** Yahoo option chains per-expiry via public proxies (the exact mechanism the gamma /
    options labs use); reuse `rlData.options` / legacy `optSnaps` (`spot, netGEX, callWall, putWall, flip,
    maxPain, pcOI, pcVol, atmIV, oi{K}`). The persisted `netGEX`/`flip` are already sign-applied — read as-is.
  - **VIX + term:** Yahoo `^VIX`, `^VIX9D`, `^VIX3M` (contango/backwardation).
  - **Fear & Greed:** CNN `fearandgreed/graphdata` JSON via proxy — the same free-proxy path; consumed by
    the shared `rlg.js` regime classifier.
  - **Breadth:** computed in-browser from sector / watchlist member bars (adv/dec, % > 50-day). A **proxy**,
    not an exchange breadth feed — label it as such.
  - **Events:** per-ticker earnings / ex-div from Yahoo (`rlData.events`); the macro econ calendar
    (CPI / FOMC / NFP / OPEX) is agent-maintained in `market-brief.config.json → macroEvents[]` from public
    schedules (low churn — verify each run).
- **FLOWS = PROXIES ONLY.** There is no free real-time fund-flow feed. Approximate with: OBV, `$`-volume
  (price × volume) trend, up/down-volume delta, sector advance/decline, relative volume, and price-vs-VWAP.
  **Always render these under a "flow proxy" label** — never call a proxy a "flow."
- **Honest staleness.** Surface each block's data age; a stale block says "N min old / re-fetch", never
  presented as live.

---

## 4. No-duplication → deep-link map

The brief shows a one-line state + a delta, then links out. It NEVER re-implements these.

| Brief signal | Owning tool (deep-link) |
|---|---|
| Regime · bull/bear · Fear&Greed · VIX | `rlg.js` engine → `swing-structure-lab.html` |
| Sector rotation · leading→lagging flips · breadth | `sector-research-lab.html` |
| Market-wide green/red map · breadth at a glance · leaders/laggards · sector-vs-constituent | `market-heatmap-lab.html` |
| Momentum + momentum Δ (ETF / sector / name) | `etf-momentum-lab.html` · `sector-research-lab.html` |
| Gamma flip · call/put walls · OPEX clock | `gamma-trading-lab.html` · `options-structure-lab.html` |
| Unusual options positioning · vol/OI · premium · IV · call-vs-put lean | `options-flow-feed-lab.html` (positioning proxy, NOT a live tape — see §3) |
| 20/50/200 MA · support/resistance · patterns | `swing-structure-lab.html` |
| Intraday control (VWAP / opening range / profile) | `intraday-tape-lab.html` |
| Disclosed smart-money flow | `smart-money-flow-lab.html` (real-time flows = proxy, see §3) |
| Thematic (AI capex) | `ai-capex-strategy-lab.html` |
| Mega-cap (Mag 7) + semis group read · breadth · notable members | `sector-research-lab.html` (owns the MAG7 / SEMIS baskets) · `etf-momentum-lab.html` — the brief owns the roll-up + per-run notable-member elevation (§7a) |
| Per-stock deep read | `msft-july-print-model.html` (+ new per-name tools, §7) |
| Events + probabilities · attention feed · recommendations · psychology | **the brief owns these** |

If a signal has no owning tool and grows recurring, apply §7/§8: **build a new tool and deep-link it** —
do not fatten the brief.

**Auto-coverage (NON-NEGOTIABLE).** This table is the human-readable form of
`market-brief.config.json → deepLinks`; the **single source of truth for WHICH tools exist is
[`tools.json`](../tools.json)**. Every run, cross-check `tools.json`: every registered tool MUST be
represented here — analyzed for its current read and deep-linked — or explicitly justified as
not-brief-relevant. A **newly-added tool is picked up automatically** (it appears in `tools.json`), never
silently omitted. When a tool exposes a machine-readable `toolReads[<id>]` slot in the shared cache, read
it directly; until then, recompute its Simple-view read from `rlData` the same way the tool does.

---

## 5. Change-detection (the brief's memory)

You cannot report a *change* without a stored prior. Each run appends ONE snapshot to
`brief-history.jsonl`:

```text
{ ts, window, regimeScore, vix, fearGreed,
  sectors:{XLK:{rsMom1m, rsMom3m, rsMom6m, rsRatio, rsMom, quad, accel, rrgState, rotation, maStack, ma200Dist}, …},
  names:{MSFT:{mom5, mom21, mom63}, …}, spy:{flip, callWall, putWall}, breadth, flowProxies }
```

Then compute and feed the attention feed:

- **Trend accel/decel** — Δ of the momentum slope across the 5 / 21 / 63-day lookbacks.
- **Regime just-flipped** — `rlg.js` score sign-change vs the last N snapshots; **approaching** — score
  within a threshold of a flip, or a VIX jump ≥ the configured `regimeChangeVixJump`.
- **Rotation about-to-flip** — an RRG state nearing a Leading↔Lagging boundary, or RS-momentum crossing
  (within `rotationFlipWarnZ`).
- **Gamma-flip proximity** — spot within `gammaFlipProximityPct` of the SPY/QQQ flip.

No prior snapshot ⇒ label the card "baseline (no prior run)".

**Persistence gate (anti-whipsaw, see §6c).** A momentum / RS micro-delta is **noise until proven signal**.
It earns an attention card or a recommendation *change* only if it (a) **persists ≥ 2–3 consecutive
snapshots** in the same direction, **or** (b) **breaks a structural level** (a 50/200-day MA cross, a prior
swing high/low, a range boundary), **or** (c) is corroborated by a second independent signal (breadth, VIX
regime, cross-asset). A single-slice wiggle that clears none of these is labeled **"intraday noise — not yet
a trend"** with capped confidence, never an action. The history file is what makes this checkable — read the
last 2–3 snapshots before calling anything a "change."

---

## 6. Events, probabilities & psychology (kept honest)

**Near-term FIRST — always.** Sort `events[]` by `when` ASCENDING and LEAD with the nearest catalysts. A
brief that only lists month-end earnings and monthly OPEX has failed: every run MUST surface the IMMINENT
calendar — today and the next ~1–10 trading days — with equal or greater prominence than the far-out marquee
names. Research the live calendar each run (§6b): this week's macro prints (CPI / PPI / PCE, jobless claims,
retail sales, ISM / PMI, consumer sentiment, housing), Fed speakers + FOMC / minutes, Treasury auctions
(2y / 10y / 30y), OPEX / quad-witch, index rebalances, and notable in-window earnings (with their read-through
to the watchlist + sectors). If a window genuinely has no near-term catalyst, SAY SO — never pad with stale
far-out items.

1. **Seed the expected move from options** where available (ATM straddle via the options-structure-lab helper
   / `rlData.options.atmIV` + `T`). Scenario odds start from the MSFT model's risk-neutral scenario-odds
   helper (targets + vol → probabilities), then get psychology-adjusted (below). For a macro print with no
   single-name straddle, `impliedMovePct` is `null` (renders "—") — put the index reaction band in the
   scenario `expectedEffect` instead.
2. **Adjust for psychology, rationale written out:** Fear & Greed extreme (`rlg.js`); positioning (put/call,
   dealer gamma); **recent reaction asymmetry** (are beats being sold? = a sell-the-news regime); crowding /
   concentration; cross-asset confirmation (rates, USD, credit, crude, JPY carry).
3. **Output per event** (§9 schema): `{ event, when, type, consensus, impliedMovePct,
   scenarios:[{name, prob, expectedEffect(overall/sector/name)}], psychologyNote }`. Scenario `prob`s SUM to
   1.00. **Every probability is a labeled estimate with its inputs shown** — never a fact, never a blackbox
   number. Anything carried from a prior run is labeled **STALE** with what to re-pull live.

---

## 6b. Deep-research & original-analysis mandate (the QUALITY BAR)

The brief is a **research product, not a data dump.** Reusing the existing tools' math is the FLOOR, not the
ceiling. Every regeneration MUST add original, defensible analysis on top of the deterministic slice:

- **Research recent + upcoming reality (use the web).** Within the curated finance/econ domain allowlist
  wired into the runner, research: recent price / volatility PATTERNS (gaps, failed breakouts, breadth
  thrusts / divergences, vol-of-vol, term-structure kinks), recent NEWS / EVENTS that moved or will move the
  tape, the live macro + earnings CALENDAR (§6), positioning / flow color, and cross-asset signals (rates,
  USD, credit spreads, crude, gold, JPY carry). VERIFY — never assert a "recent" fact without its source, or
  else label it STALE / estimate.
- **Read psychology + regime, don't just print a number.** NAME the regime (risk-on/off, positive/negative
  gamma, trend vs mean-revert, dispersion vs correlation, leadership) and the crowd's POSTURE (complacency,
  capitulation, FOMO, sell-the-news) — with the evidence for it and what would FALSIFY it.
- **Apply real technique.** Bring quantitative methods where they add signal: regime-switching / state
  classification, momentum acceleration + factor rotation (RRG), vol term-structure & realized-vs-implied,
  options-flow / dealer-gamma inference, correlation / dispersion & breadth, seasonality & event-study base
  rates, mean-reversion vs trend tests, simple risk models (CVaR / drawdown / beta). Reuse the labs' helpers
  when they exist; reason explicitly when they don't.
- **Be ACTIONABLE — especially rotation + momentum.** Every run MUST produce concrete, tradable reads for
  **sector rotation** (which sectors / ETFs to favor vs fade, the leading↔lagging flips, the exact level or
  RS-cross that confirms / negates) and **ETF / factor momentum** (which factor / ETF is accelerating vs
  rolling over, the trigger, the risk). Recommendations name the instrument, the direction (add / trim / hedge
  / rotate / watch), the level / condition, and the deep-link — never vague commentary.
- **Sector-rotation recs MUST match the rotation tool by construction — SOURCE THEM FROM THE SNAPSHOT'S
  TOOL-ALIGNED FIELDS, NEVER FROM RAW RS LEVEL.** `sector-research-lab.html` ranks rotation by an RRG
  (RS-Ratio / RS-Momentum z-scores, `rsLook=63` / `momSpan=10`) plus a **2-week momentum acceleration**,
  labeling each ETF `Leading` / `Weakening ↓` / `Lagging` / `Improving ↑` and the early-turn sub-states
  `Basing ↑` (lagging but accelerating — early accumulation) / `Peaking ⚠` (leading but rolling over — early
  distribution), with a mechanical Rotate-**INTO** / Rotate-**OUT** split. The Tier-A refresher
  (`scripts/brief-refresh.mjs`) now emits that EXACT verdict per sector + group ETF in the snapshot:
  `rrgState` (the 6-state label), `accel` (2-wk Δ RS-Momentum), `rotation` (`into` / `out` / `neutral`), and
  `rsRatio` / `rsMom` / `quad`. **Author every sector-rotation call from these fields**: an "add / rotate-in"
  needs `rotation:"into"` or `Basing ↑` / `Improving ↑`; a "trim / rotate-out" needs `rotation:"out"` or
  `Peaking ⚠` / `Weakening ↓`. Do NOT author a rotation direction from the `rsMom1m` **level** alone — that is
  the metric-lens bug that made the brief disagree with the tool. If your narrative view differs from the
  snapshot's `rrgState` / `rotation`, either the level (structural anchor) and the acceleration (tactical
  signal) genuinely diverge — say so explicitly and cite BOTH (e.g. "XLE `Lagging` on 6-mo level but `Basing ↑`,
  `rotation:into` — early-accumulation watch, not a clean trim") — or your read is wrong. Never silently
  contradict the tool.
- **Invent when the map has a hole.** When research surfaces a RECURRING, valuable pattern with no owning
  tool, capture it as an **experimental** item (§7): a titled hypothesis + the method + the inputs it needs,
  in `payload.experimental[]` (rendered in the cockpit's "Experimental" drawer). Promote proven experiments to
  real tools per §7 / §8.

Deep does NOT mean speculative (§10): show inputs, label estimates / proxies / stale data, and never
fabricate a fetch, a number, or a "recent" event.

---

## 6c. Larger-picture, anti-reactivity mandate (the ANTI-OVERFIT BAR)

> The #1 failure mode of a 4×/day brief is **over-reacting to intraday noise** — treating a single-slice
> wiggle in 1-month / 5-day relative-strength (e.g. "XLK 1m RS −0.53→−0.94") as if it were a regime change,
> and writing shallow, whipsaw recommendations that flip every window. This section is the guard against it.
> **Structure first, noise last. A recommendation that rests only on a run-over-run micro-delta is a defect.**

**The multi-timeframe hierarchy (PRIMARY → secondary → tactical).** Every read and every recommendation is
anchored top-down, and states its frame explicitly:

1. **PRIMARY — the structural trend (weeks–months).** Where is price vs its **20 / 50 / 200-day moving
   averages** (stacked bullish, stacked bearish, or tangled)? The **200-day slope**. The 6–12-month trend and
   the **126 / 252-day** momentum. Position in the **52-week range** and distance from the ATH / the last
   major swing low. This is the frame; nothing below overrides it **without a structural break**.
2. **SECONDARY — the swing structure (days–weeks).** The 21 / 63-day momentum and its acceleration, the RRG
   quadrant and its *trajectory across several reads* (never one), key horizontal **support / resistance**,
   prior swing highs / lows (**tops / bottoms**), the gap base, round numbers.
3. **TACTICAL — the intraday tape (this session).** 1-month / 5-day RS deltas, the open's hold/reject, VWAP,
   the gamma pin. **Tactical signals may only *tune* a structurally-anchored view — they may never *be* the
   view.** Label a tactical-only read `horizon: tactical` and cap its confidence (≤ 55).

**Anti-overfitting / persistence rule (NON-NEGOTIABLE).** A run-over-run change in a noisy momentum series is
**noise until proven signal** (mechanics in §5):

- It becomes an **attention card or a recommendation change only if** it (a) **persists ≥ 2–3 consecutive
  snapshots** in the same direction (check `brief-history.jsonl`), **or** (b) **breaks a structural level**
  (a 50/200-day MA cross, a prior swing high/low, a range boundary), **or** (c) is corroborated by a second
  independent signal (breadth, VIX regime, cross-asset).
- A single-slice wiggle that satisfies none is reported — if at all — as **"intraday noise — not yet a
  trend"** with capped confidence, NOT as an action. **Do not flip a recommendation on one window's
  micro-move.** Prefer "**unchanged vs the structural thesis**" over manufacturing a new whipsaw call.
- **Round, don't over-precision.** Two-decimal RS deltas (−0.53→−0.94) imply false precision on a proxy.
  Speak in **structure** ("XLK still Lagging, RS negative, price below a falling 50-day") and reserve exact
  figures for levels that actually matter.

**The standing big-picture backdrop (research it, weigh it, EVERY run).** The brief is not just the US
micro data-calendar. Author the `backdrop` block (§9) that names the larger forces and — critically —
**what is already priced in**:

- **Regime & trend:** the primary market regime (bull / bear / range), **where we are in it** (early / mid /
  late / topping / bottoming), breadth confirmation vs divergence, valuation / dispersion context.
- **The macro cycle:** the central-bank path (cut / hold / hike + what the curve prices), the rates trend,
  USD, credit spreads, liquidity — the **direction of the cycle**, not just the next print.
- **Global events & geopolitics:** the standing global-tension set — armed conflict / war-risk, trade &
  tariffs & sanctions, elections & policy shifts, China growth, energy / commodity shocks, JPY-carry &
  cross-asset contagion. Maintain them in `config.json → globalBackdrop[]` (low-churn — **verify each run**,
  §6b) and read their **current** market impact. Never fabricate breaking news — cite it or label it
  STALE / estimate.
- **Expectations vs positioning:** what consensus and the options / positioning are pricing (rate path,
  earnings growth, the vol regime), and where the crowd is **offside** — the asymmetry that matters more
  than the last tick.

**Tops / bottoms & mean-reversion discipline.** Explicitly assess exhaustion / extension: distance above/below
the 50-day in ATR terms, overbought/oversold on a longer oscillator, momentum **divergences** at highs/lows,
sentiment extremes (Fear & Greed). A name or index far above a rising 200-day into resistance is **late**, not
**strong** — say so, and prefer "trim / hedge / wait" over "chase." Symmetrically, a capitulation into
structural support with a sentiment washout is a **bottoming** setup, not just "more weakness."

**Every recommendation** now carries: the **horizon** (`structural` / `swing` / `tactical`), the
**structuralAnchor** (the MA / level / trend it rests on), the **trigger** (the level or *confirmed* cross
that acts), and the **invalidation** (what falsifies it). A rec with no structural anchor is not ready to ship.

---

## 7. Watchlist + per-item analysis decision rule

- **Watchlist = tickers only.** NEVER commit position sizes, share counts, cost basis, or P&L — this repo is
  public. If sizing is ever needed it lives in `localStorage` / a gitignored local file **only**.
- **Per item, default = a computed status card** (no new tool): trend / MA stack, momentum + Δ, RRG position,
  gamma (if optionable), next event + implied move, flow proxy — deep-linking the relevant labs scoped to the
  ticker.
- **Bespoke tool only when the name is complex AND recurring.** Build `<ticker>-model.html` +
  `notes/<ticker>-model.md` (MSFT = the exemplar). ETFs get an **ETF-profile** template (holdings
  concentration, factor / sector exposure, vs-benchmark, flow proxy) reusing sector-lab's ETF-selector
  metrics. `watchlist.json[].model` points at a bespoke tool when one exists; absence ⇒ status-card default.
- **Experimental tools → promotion.** Research that reveals a durable, reusable edge with no owning tool
  becomes a NEW tool. **Headless runs** (the 4×/day timer) capture the idea in `payload.experimental[]`
  (title + method + inputs) — they do NOT create or redeploy HTML tools unattended (no validation surface).
  **Interactive runs** (`/market-brief-update` in VS Code) MAY draft the experimental `<id>.html`, iterate,
  and — once genuinely useful — **PROMOTE** it: registry sync (`tools.json` + `index.html` TOOLS + `rlnav.js`
  TOOLS) + `notes/<id>.md` + a `market-brief`-style selftest group + `node scripts/selftest.mjs` + the
  Section-9 check (§11), then commit (§8). Deep-link the brief to the new tool instead of fattening the brief.

---

## 7a. Mega-caps & thematic groups (Mag 7 + semis)

`market-brief.config.json → track.groups[]` declares the thematic baskets the brief tracks as GROUPS: the
**Mag 7** (proxied by the **MAGS** ETF; members mirror the sector-lab MAG7 basket) and **semis** (proxied by
**SOXX**). Tier-A (`brief-refresh.mjs`) computes a deterministic slice per group into
`market-brief.snapshot.json` + `brief-history.jsonl`:

- **Group read** — the ETF proxy treated sector-style: relative-strength vs SPY (1m / 3m / 6m), the RRG-lite
  state, and the 20/50/200-day MA stack.
- **Members** — each constituent name-style: price, 5 / 21 / 63-day momentum, and the §6c structural block
  (126 / 252-day momentum, 50 / 200-day distance, MA stack, 52-week-range position).
- **Breadth** — how many of the N members are individually bull-stacked / above their 50- & 200-day /
  positive on 21-day momentum (`groupBreadth`) — the internal health behind the ETF-level read.

**Notable-member mandate.** Each run, ELEVATE the notable members — do NOT force all 7 / 12 every window. A
member is notable when it (a) clears the `notableMemberMinMovePct` move bar (|21d| or |5d|), OR (b)
structurally DIVERGES from the group (bear-stacked, or below its 200-day). The `notableMembers` helper picks
and ranks them, capped at `notableMemberMaxCount`. Anchor them structure-first (§6c) and honor the persistence
gate (§5): a one-window member wiggle is intraday noise, not a trend. Surface the group read + its notable
members in the cockpit's **Mega-caps & thematic groups** panel (`payload.groups[]`, §9), and promote a
genuinely market-moving member into the attention feed / `watchlistNotes` when it clears the bar (e.g. the
MSFT de-rate). The group cards **deep-link** the rotation lab that owns the basket (`sector-research-lab.html`)
— the brief owns only the roll-up + the per-run notable-member call, never a re-implementation of the
rotation math (§4).

## 8. Redeploy decision rule

- **Data-only change** (payload / history / watchlist / config *values*) ⇒ commit the data; **no HTML
  redeploy**. GitHub Pages serves the new JSON; the tool is unchanged.
- **Tool logic / layout change, or a new per-name tool** ⇒ redeploy (HTML/JS commit) + registry sync
  (`tools.json` + `index.html` TOOLS + `rlnav.js` TOOLS) + validation (§11).

---

## 9. Output contract — `market-brief.payload.json`

```json
{
  "toolId": "market-brief",
  "window": "pre-market|morning|pre-close|after-hours",
  "asOf": "<ISO8601 — the window/session this brief analyzes>",
  "generatedAt": "<ISO8601 — actual wall-clock when THIS payload was (re)generated>",
  "dataAsOf": { "bars": "", "options": "", "macro": "", "events": "" },
  "regime": {
    "bias": "bull|bear|neutral", "score": 0,
    "fearGreed": { "score": 0, "band": "", "delta": 0 },
    "vix": { "level": 0, "delta": 0, "term": "contango|backwardation" },
    "breadth": {}, "note": ""
  },
  "backdrop": {
    "primaryTrend": "<the structural regime + WHERE-in-cycle (early/mid/late/topping/bottoming) + the 20/50/200 MA structure>",
    "trendEvidence": [ "<MA stack / 200-day slope / 52-week-range position / 126-252d momentum inputs — labeled, live where possible>" ],
    "structuralLevels": { "SPY": { "support": [], "resistance": [], "ma50": 0, "ma200": 0, "note": "re-pull live if stale" } },
    "macroCycle": "<central-bank path + what the curve prices + rates trend + USD + credit + liquidity — the DIRECTION>",
    "globalBackdrop": [ "<standing global tension read (war-risk / trade+tariffs / elections / China / energy / JPY-carry), current market impact — verify each run, label STALE>" ],
    "pricedIn": "<what consensus + options/positioning already price (rate path, earnings growth, vol regime)>",
    "asymmetry": "<where the crowd is offside — the risk/reward skew that matters more than the last tick>",
    "whatWouldChangeIt": [ "<structural falsifiers of THIS big-picture read (an MA cross, a range break, a regime flip)>" ]
  },
  "attention": [
    { "rank": 1, "domain": "rotation|gamma|momentum|regime|flows|event",
      "horizon": "structural|swing|tactical", "structuralAnchor": "<the MA/level/trend this rests on>",
      "title": "", "what": "", "why": "", "confidence": 0, "deepLink": "" }
  ],
  "recommendations": [
    { "action": "trim|add|hedge|watch|rotate", "horizon": "structural|swing|tactical",
      "subject": "", "rationale": "", "structuralAnchor": "<the MA/level/trend it rests on>",
      "trigger": "<the level or CONFIRMED cross that acts>", "invalidation": "<what falsifies it>",
      "confidence": 0, "deepLink": "" }
  ],
  "events": [
    { "event": "", "when": "", "type": "EARNINGS|CPI|FOMC|NFP|OPEX", "consensus": "", "impliedMovePct": 0,
      "scenarios": [ { "name": "beat|inline|miss", "prob": 0, "expectedEffect": "" } ], "psychologyNote": "" }
  ],
  "psychology": { "read": "", "inputs": [], "tiltOnProbabilities": "" },
  "groups": [
    { "id": "mags|semis", "label": "", "etf": "MAGS|SOXX", "deepLink": "sector-research-lab.html",
      "read": { "rrgState": "Leading|Weakening \u2193|Lagging|Improving \u2191|Basing \u2191|Peaking \u26a0", "rotation": "into|out|neutral", "accel": 0, "maStack": "bull-stack|bear-stack|tangled", "rsMom1m": 0, "rsMom3m": 0, "ma200Dist": 0 },
      "breadth": { "n": 0, "bullStacked": 0, "above50": 0, "above200": 0, "upMom": 0, "label": "" },
      "notable": [ { "ticker": "", "mom21": 0, "mom5": 0, "maStack": "", "ma200Dist": 0, "reason": "", "horizon": "structural|swing|tactical" } ],
      "note": "<the group read in one line — structure first, the notable members, what it means>" }
  ],
  "watchlistNotes": { "TICKER": { "status": "", "deepLink": "" } },
  "experimental": [ { "title": "", "note": "", "hiddenByDefault": true } ]
}
```

**`asOf` vs `generatedAt`:** `asOf` is the window/session the brief analyzes (e.g. the 11:00 ET `morning` window); `generatedAt` is the actual ISO wall-clock of the run that produced this file. Stamp `generatedAt` fresh on **every** (re)generation — the cockpit header renders it as “· regenerated …”. Tier-A (`brief-refresh.mjs`) sets both to the run time automatically.

**`backdrop` (§6c) is the standing frame — author it EVERY run.** It renders at the TOP of the cockpit,
above the attention feed, so the reader sees the larger picture (primary trend, macro cycle, global
tensions, what's priced in) BEFORE any tactical card. Its reads are structural (weeks–months) and change
slowly; do not rewrite it on an intraday wiggle. **`horizon`** on every attention card and recommendation
(`structural` / `swing` / `tactical`) is what keeps the reader from mistaking a one-session tape read for a
trend — a `tactical`-only item is capped at confidence ≤ 55 and must still name its `structuralAnchor`.

**`groups` (§7a) is the mega-cap / thematic roll-up.** Tier-A populates the deterministic `read`, `breadth`
and `members`; the agent adds the per-run `notable[]` selection (structure-first, persistence-gated) and the
one-line `note`. Prefer the Tier-A `snapshot.groups` numbers verbatim — never hand-fabricate a member move.
The cockpit renders `payload.groups` if present, else falls back to the Tier-A `snapshot.groups`.

---

## 10. Anti-fabrication / honesty

Consistent with every Research Lab tool: estimates are estimates (show inputs), proxies are labeled as
proxies, there are no stored / blackbox analytics, and this is not investment advice. Do not claim a run
happened, a fetch succeeded, or a number holds without the underlying compute. "Modest and correct beats
pretty and misleading."

---

## 11. Artifacts, registry sync, validation

Files: `market-brief.html` (cockpit) · `rlbrief.js` (shared brief components) · `market-brief.config.json` ·
`market-brief.payload.json` · `brief-history.jsonl` · `watchlist.json` · `notes/market-brief.md` (this) ·
`.github/copilot-instructions.md` · `.github/prompts/market-brief-update.prompt.md` ·
`scripts/brief-refresh.mjs` (Tier A). Also implement the `RLDATA` shared layer — the brief's
`macro` / `events` needs are its first real consumer.

The mega-cap / thematic groups (§7a) live in `config.json → track.groups[]`, are computed by
`scripts/brief-refresh.mjs`, rendered by `rlbrief.js → renderGroups` (pure helpers `groupBreadth` /
`notableMembers`, covered by the `market-brief` selftest group), and shown in the cockpit's
**Mega-caps & thematic groups** panel.

When the HTML lands: sync `tools.json` + `index.html` TOOLS + `rlnav.js` TOOLS, add a `market-brief` group
to `scripts/selftest.mjs`, run `node scripts/selftest.mjs` + the per-tool Section-9 check, then commit
(Pages auto-deploys).

---

## 12b. Universal tooltips & ticker links (NON-NEGOTIABLE — all tools)

Every ticker the brief renders is a Yahoo Finance link with a rich tooltip (company + kind) via the shared
`rlticker.js` (`RLTKR.tag()` in renderers; `class="tkr"` / `data-tkr` / `data-tkr-auto` for static + chart
content). Every term, section, KPI, badge, chart and value carries a rich tooltip saying BOTH *what it is* AND
*what the current value means in this context* — `rlg.js` covers "what it is", and the renderer sets a contextual
`title` / `data-tip` for the current reading. This is a house standard for ALL tools (see
`.github/copilot-instructions.md`). A bare ticker or an un-tooltipped value is a defect.

---

## 12. Phase status

- **Phase 0 — foundation — DONE:** this runbook + `market-brief.config.json` + `watchlist.json` +
  `.github/copilot-instructions.md` + `.github/prompts/market-brief-update.prompt.md`.
- **Phase 1 — NEXT:** `RLDATA` layer + `rlbrief.js` + `market-brief.html` live layer + registry + selftest.
- Phase 2 agent payload + history + change-detection + events/probabilities · Phase 3 watchlist cards +
  per-item rule · Phase 4 automation (evo-x2 Tier A + ntfy nudge) · Phase 5 selftest + validation.
- **Mega-caps & thematic groups (§7a) — DONE:** `track.groups` (Mag 7 → MAGS, semis → SOXX) + Tier-A group
  compute + `renderGroups` cockpit panel + `groupBreadth` / `notableMembers` selftest coverage.
