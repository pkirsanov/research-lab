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

The brief **owns** only four things (everything else is a deep link):

1. The ranked **attention feed** (≤ 7 cards).
2. **Change-detection** over time (accel/decel, regime just-flipped/approaching, rotation about-to-flip).
3. The **events + probabilities + expected-effect** table.
4. The **watchlist roll-up**.

**Golden rules:** reuse — never duplicate — the existing tools; **APPEND** missing data, never refetch
everything; keep it actionable and low-noise; probabilities are **estimates with inputs shown**, never
facts; the watchlist is **tickers-only** (public repo).

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
| Momentum + momentum Δ (ETF / sector / name) | `etf-momentum-lab.html` · `sector-research-lab.html` |
| Gamma flip · call/put walls · OPEX clock | `gamma-trading-lab.html` · `options-structure-lab.html` |
| 20/50/200 MA · support/resistance · patterns | `swing-structure-lab.html` |
| Intraday control (VWAP / opening range / profile) | `intraday-tape-lab.html` |
| Disclosed smart-money flow | `smart-money-flow-lab.html` (real-time flows = proxy, see §3) |
| Thematic (AI capex) | `ai-capex-strategy-lab.html` |
| Per-stock deep read | `msft-july-print-model.html` (+ new per-name tools, §7) |
| Events + probabilities · attention feed · recommendations · psychology | **the brief owns these** |

If a signal has no owning tool and grows recurring, apply §7/§8: **build a new tool and deep-link it** —
do not fatten the brief.

---

## 5. Change-detection (the brief's memory)

You cannot report a *change* without a stored prior. Each run appends ONE snapshot to
`brief-history.jsonl`:

```text
{ ts, window, regimeScore, vix, fearGreed, sectors:{XLK:{rrgState, rsMom}, …},
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

---

## 6. Events, probabilities & psychology (kept honest)

1. **Seed from options.** Expected move = the ATM straddle (options-structure-lab helper /
   `rlData.options.atmIV` + `T`). Scenario odds = the MSFT model's risk-neutral scenario-odds helper
   (targets + vol → probabilities).
2. **Adjust for psychology, with the rationale written out:** Fear & Greed extreme (`rlg.js`); positioning
   (put/call, dealer gamma); **recent reaction asymmetry** (are beats being sold? = a sell-the-news regime);
   crowding / concentration.
3. **Output per event** (§9 schema): `{ event, when, type, consensus, impliedMovePct,
   scenarios:[{name, prob, expectedEffect(overall/sector/name)}], psychologyNote }`. **Every probability is
   a labeled estimate with its inputs shown** — never a fact, never a blackbox number.

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

---

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
  "attention": [
    { "rank": 1, "domain": "rotation|gamma|momentum|regime|flows|event",
      "title": "", "what": "", "why": "", "confidence": 0, "deepLink": "" }
  ],
  "recommendations": [
    { "action": "trim|add|hedge|watch|rotate", "subject": "", "rationale": "", "confidence": 0, "deepLink": "" }
  ],
  "events": [
    { "event": "", "when": "", "type": "EARNINGS|CPI|FOMC|NFP|OPEX", "consensus": "", "impliedMovePct": 0,
      "scenarios": [ { "name": "beat|inline|miss", "prob": 0, "expectedEffect": "" } ], "psychologyNote": "" }
  ],
  "psychology": { "read": "", "inputs": [], "tiltOnProbabilities": "" },
  "watchlistNotes": { "TICKER": { "status": "", "deepLink": "" } },
  "experimental": [ { "title": "", "note": "", "hiddenByDefault": true } ]
}
```

**`asOf` vs `generatedAt`:** `asOf` is the window/session the brief analyzes (e.g. the 11:00 ET `morning` window); `generatedAt` is the actual ISO wall-clock of the run that produced this file. Stamp `generatedAt` fresh on **every** (re)generation — the cockpit header renders it as “· regenerated …”. Tier-A (`brief-refresh.mjs`) sets both to the run time automatically.

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
