# Unusual Options Activity Lab — notes

> **Status: LIVE (v1.0, 2026-07-08).** Single-file tool:
> [`../options-flow-feed-lab.html`](../options-flow-feed-lab.html). Registered in
> [`../index.html`](../index.html) `TOOLS`, [`../tools.json`](../tools.json), and
> [`../rlnav.js`](../rlnav.js); pure math covered by `scripts/selftest.mjs` (chain
> parse, vol/OI + premium + unusual-score, tape read). **Educational only — not
> investment advice.** Everything is a delayed / EOD, positioning-derived **proxy**
> from public data you fetch yourself.
>
> **As built (v1):** scans a liquid-name set (SPY, QQQ, IWM + megacaps), fetching
> each nearest-expiry Yahoo chain **best-effort** (same proxy chain as the option
> labs), cached in this tool's OWN namespaced store (`rlOptFlow:<sym>`) and reused
> cache-first on reload. Each strike is scored 0-100 by how unusual its activity is
> **relative to the rest of the chain** (vol/OI + volume share + premium notional +
> IV) — NOT vs a historical baseline (a single fetch has no prior-day OI). Ranks the
> standouts + reads the net call-vs-put premium lean. Never infers buy/sell side. If
> the browser blocks the proxies the scan stays empty (honest EOD, not live).
>
> **Discovery source.** Mined from Unusual Whales' "Follow the Flow" live options
> feed during the 2026-07-08 QuantitativeFinance competitor review.
>
> **⚠️ Honesty gate (read first).** Unusual Whales streams **real-time,
> trade-level** options prints (premium, buy/sell side, sweep vs block). **There
> is no free real-time trade-level options feed** (repo rule: *flows = proxies
> only*). This tool therefore does **NOT** replicate the UW tape. It is scoped as
> an honest **EOD "unusual activity" scanner**: it flags strikes where **volume,
> volume/OI ratio, premium notional, or IV** look anomalous versus their own
> recent history — a *positioning* proxy, never a *trade-flow* claim. Building the
> tool as if it were a real-time tape would be the failure condition, not the goal.

Proposed single-file tool: `../options-flow-feed-lab.html` (not yet built)
Proposed editable universe: `../options-flow-feed-universe.json` (not yet built) —
may reuse [`../options-structure-universe.json`](../options-structure-universe.json).

---

## Purpose

Answer one question well: **which option strikes, across my watchlist, lit up
today relative to their own normal — and is that build bullish or bearish?** A
ranked feed of "unusual" strikes: unusually high volume, high volume/OI (new
positioning vs existing), large premium notional (`volume × 100 × mid`), or a
sharp IV move — each tagged call/put, near/far expiry, and OI-building vs
OI-closing, with a one-line read.

It is the **watchlist-wide scanner** sibling to the single-name
[Options Structure Lab](options-structure-lab.md) (deep read of one ticker's
walls/gamma) and the [Smart-Money Flow Lab](smart-money-flow-lab.md) (disclosed
insider/institutional). This tool sweeps *many* names for the *biggest positioning
anomalies* and surfaces the top N.

---

## Outcome Contract

- **Intent.** Give a researcher a fast, honest, in-browser **watchlist-wide scan**
  of anomalous option positioning (volume / vol-OI / premium / IV), ranked by how
  unusual each strike is versus its own baseline, computed from chains they fetch
  themselves — no paywalled vendor, no real-time-flow pretense.
- **Success signal.** After one fetch of a watchlist's chains, the tool renders a
  ranked feed (top ~25 unusual strikes) with, per row: ticker, strike, expiry,
  call/put, volume, OI, vol/OI, premium notional, ATM-relative IV, an
  OI-building-vs-closing tag, and a one-line read ("far-OTM call OI building on
  rising IV = bullish positioning") — and a user can name today's three most
  unusually-positioned names **without leaving the page or reading a paywalled
  vendor**.
- **Hard constraints.** (1) Every ranking metric is recomputed in-browser from the
  fetched chain — no stored/blackbox numbers. (2) The tool renders under an
  explicit **"positioning proxy — not real-time trade flow"** label at all times.
  (3) Reuse the same Yahoo option-chain endpoints + public proxies + `rlData.options`
  / legacy `optSnaps` the Options/Gamma labs already use — never refetch a chain a
  sibling cached; the persisted `netGEX`/`flip` are already sign-applied (read
  as-is). (4) Freshness is surfaced per row; a chain > 2 days old says "STALE —
  re-pull before sizing." (5) Canvas (if any sparkline) drawn synchronously;
  a11y text fallback for every visual.
- **Failure condition.** The tool fails if it presents the scan as **real-time
  order flow** or infers **buy/sell side** it cannot see (Yahoo gives volume + OI +
  IV, not trade side), if "unusual" is not defined against a transparent baseline,
  or if OI-building vs OI-closing is asserted without the prior-day OI it requires.

---

## Data & feasibility (free-source, honest proxy)

| Field | Source | Mechanism / honesty note |
|---|---|---|
| Per-strike volume, OI, IV, bid/ask/mid | Yahoo `v7/finance/options/<SYM>?date=<epoch>` per expiry, via the public proxy chain | exactly the endpoint the Options Structure / Gamma labs use; reuse `rlData.options` |
| Vol/OI ratio, premium notional | computed: `volume/OI`, `volume × 100 × mid` | in-browser |
| OI **building vs closing** | needs **prior-day OI** (ΔOI = today − yesterday) | requires ≥ 2 daily reads to accrue (like the Gamma Lab's `gammaHist`); until then, tag "OI baseline accruing" |
| "Unusual" score | z-score of today's volume / vol-OI / premium vs the strike's (or ticker's) recent daily baseline | transparent, tunable threshold lever |
| Buy/sell side, sweep/block | **NOT AVAILABLE** (no free trade-level feed) | explicitly omitted + labeled; direction is inferred only from call/put × OI-build, never from tape |

Options chains are Yahoo-only (Twelve Data has no free options) and proxy-gated on
hosted origins → treat as **best-effort**; degrade gracefully to the price/volume
path and say so when a chain will not resolve.

---

## Simple vs Power

- **Simple.** The ranked "what lit up today" feed (top N) + a one-line tape read
  ("net call-premium build across the watchlist = leaning bullish; TSLA + NVDA the
  standouts") + levers: **universe**, **min unusual-score**, **near/far expiry
  filter**, **calls/puts/both**.
- **Power.** Adds per-name expandable chains (the Options Structure snapshot,
  reused from cache — no refetch), a call/put premium-build bar per name, an
  IV-vs-history sparkline, and the raw sortable table (also the a11y fallback).

One compute → both views; `class="panel pw"` for Power-only panels.

---

## Brief integration

On ship, the [Market Brief](market-brief.md) gains a deep-link target for a new
"unusual options positioning" attention card:

1. Add a deep-link in [`../market-brief.config.json`](../market-brief.config.json)
   (`→ options-flow-feed-lab.html`).
2. Add the row to the brief's deep-link map in [market-brief.md](market-brief.md)
   §4 ("disclosed/positioning options anomalies" → owning tool). Keep the brief's
   existing **"flow = proxy"** labeling rule (§3) — this tool is the canonical home
   for that proxy, so the brief links out instead of duplicating.

---

## Build checklist (when promoting PROPOSED → LIVE)

1. Author `options-flow-feed-lab.html` (single self-contained file; ES5).
2. Wire `rlnav.js`, `rlg.js`, `rldata.js` (reuse `rlData.options` / `optSnaps`),
   `rlchart.js`. Avoid the bare word "call" in headings (rlg glossary tooltip).
3. Declare the scan math as **top-level `function` declarations**; add a
   `selftest.mjs` group asserting: (a) vol/OI + premium-notional formulas, (b) the
   unusual-score z-computation against a fixture baseline, (c) OI-building tag
   logic given a two-day OI pair, (d) the STALE-freshness gate.
4. Every visual gets an `aria-label` + text-fallback table; the ranked feed IS the
   fallback table.
5. Register in the three places (`index.html`, `rlnav.js`, `tools.json`) + footer
   notes link → `notes/options-flow-feed-lab.md` — only now.
6. Do the brief integration above.
7. `node scripts/selftest.mjs` (full output) passes; inline-script `new Function`
   parse-check; `JSON.parse` the universe.

---

## Version history

| Date | Change |
|---|---|
| 2026-07-08 | PROPOSED brief authored from the QF competitor review (Unusual Whales "Follow the Flow"), scoped down to an honest EOD unusual-activity proxy (no free real-time tape). |
| 2026-07-08 | **v1.0 built, registered (3-place), and selftest-validated** (17 assertions in the `options-flow-feed-lab` group; 162/0 total). Simple feed + Power table, cache-first best-effort fetch, ticker/term tooltips per the cross-tool contract. |
