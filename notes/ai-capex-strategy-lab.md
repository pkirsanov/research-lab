# AI Capex Strategy Lab — Analysis Notes & Methodology

> **Audience: the next agent / analyst who continues this work.**
> This document is the full record of *how* the analysis was built so you can update it,
> extend it, and re-validate it. The tool itself (`ai-capex-strategy-lab.html`) is a single
> self-contained HTML file — **all logic and all data are inline in that file**, no build step.
>
> **As-of date: 2026-06-30.** Treat every numeric assumption as "valid as of this date" and
> re-check it against current conditions when you pick this up.
>
> **Not investment advice.** Everything here is an educational model driven by *editable
> assumptions*. No live market prices are used anywhere.

---

## 0. TL;DR for continuing the work

1. Open `ai-capex-strategy-lab.html`. Everything is in the one `<script>` block.
2. The **data** you most likely need to refresh is the `ASSETS[]` array (per-ticker assumptions)
   and the prose in the `<details class="research">` sections.
3. The **model constants** (horizon fractions, regime decay, correlations, optimizer mapping)
   are small, named, and documented in §3 below.
4. After editing: re-run the **validation checklist** (§6), then deploy (§8).
5. Common extensions (new horizon, new factor, new tickers, better regime model) are in §7.

---

## 1. What the tool is

An interactive playground for **US/Canada equity & ETF-proxy strategies** built around the
**AI-datacenter capital-expenditure cycle**. It has two views (a checkbox toggle):

- **Simple mode (default):** one *optimal strategy card per time horizon* (1M / 3M / 6M / 1Y),
  each with a single **risk↔reward slider** and a shared **market-regime** lever. This is the
  headline experience: "what should I hold for *this* horizon at *this* risk level?"
- **Power tool:** the full optimizer — editable per-asset assumptions, five optimizer objectives,
  theme-aware correlation, per-position caps, the cross-horizon "best playbooks" table, and charts.

The two modes share one state object and one underlying model; Simple mode is just a constrained,
opinionated front-end over the same `allocationFor()` engine.

---

## 2. The investment thesis (the analytical backbone)

The binding constraint of the AI build-out **walks downstream over time**:

> silicon → memory → advanced packaging → power → the grid → fuel → cooling → water → skilled labor

The market reprices the early links first; durable edge is further down, where supply is
capacity-inelastic (monopoly/oligopoly, capital- and permit-bound). This produces a **horizon
structure** that the tool is designed to express:

| Horizon | What is "live" | Representative names |
|--------|----------------|----------------------|
| **1M**  | the memory/storage price spike (HBM crowd-out → DRAM/NAND/HDD) + immediate packaging | MU, STX, WDC, TER, SNDK, RMBS |
| **3M**  | packaging/test follow-through + optical | ONTO, CAMT, TSM, BESIY, COHR, LITE |
| **6M**  | grid/power bridge + power electronics | ETN, POWL, NVT, GEV, MPWR, VICR |
| **1Y**  | nuclear fuel, critical minerals, frontier optionality (risk-adjusted core stays defensive) | LEU, OKLO, CCJ, MP, BE, AMSC |

Key honest nuance the model preserves: at a **risk-adjusted** setting, longer horizons favor
**lower-volatility defensive quality** (gas/industrials/connectors) because volatility scales with
√time and penalizes the high-β AI names; the nuclear/fusion **optionality is an aggressive-only
bet**, surfaced as a barbell "upside sleeve," not a core holding. Do not distort the optimizer to
force moonshots into the default basket — that was tried and is wrong.

The full written thesis (chokepoint-by-chokepoint, critical minerals, innovation triggers,
corrections log, scarcity tiers) lives in the `<details class="research">` sections inside the HTML.
Keep that prose in sync when the model changes.

---

## 3. The model (exact math + where it lives)

All of the following are in the one `<script>` block of `ai-capex-strategy-lab.html`.

### 3.1 Per-asset assumptions — `ASSETS[]`
Each asset is a two-state annual-return bet:

| field | meaning |
|------|---------|
| `tk` / `nm` / `mk` | ticker / name / market (`US`, `US-ADR`) |
| `th` | theme (see §4) — drives correlation + catalyst bias |
| `tier` | scarcity tier `S`/`A`/`B` (S = near-monopoly/hardest to scale) |
| `trig` | catalyst timing: `now` / `1-3y` / `3-5y` / `5-10y` |
| `base` | **bull** annualized return if the thesis works (decimal) |
| `down` | **thesis-fails** annualized return (decimal, negative) |
| `vol`  | annualized volatility (decimal) |
| `p`    | probability the bull case is realized |

**Assumption-setting methodology (how `base`/`down`/`vol`/`p` were chosen):** judgment from the
scarcity analysis, kept *internally consistent* — higher `base` is paired with higher `vol` and/or
lower `p`. Tier-S/oligopoly chokepoints get higher `p`; thin-float binary names (SMR/fusion/
small-cap minerals) get low `p`, high `vol`, and large `base`/`down` spread. **This array is the
single source of truth for the data — update it here, not in the notes.**

### 3.2 Horizon expected return — `assetHorizon(a, hk)`
```
expected_h = peff·bull_h + (1−peff)·down_h
  bull_h  = base · TRIG_FRAC[trig][hk] · regime_m
  down_h  = down · TRIG_FRAC[trig][hk]
  peff    = clamp(p · regime_p, 0.02, 0.95)
  sd_h    = vol · √(years_h)
```

- **`TRIG_FRAC`** — fraction of the annual move realized by each horizon, per trigger. A `now`
  catalyst front-loads; a `5-10y` trigger barely moves at 1M. Current table:
  ```
  now   : 1m .18  3m .42  6m .70  1y 1.00
  1-3y  : 1m .04  3m .12  6m .28  1y .55
  3-5y  : 1m .015 3m .05  6m .13  1y .30
  5-10y : 1m .005 3m .02  6m .06  1y .16
  ```
- **`SCEN`** — regime multipliers: `bear {m:0.5,p:0.82}`, `base {m:1,p:1}`, `bull {m:1.5,p:1.12}`.
- **`REGIME_PERSIST`** — *horizon decay* of the regime (the "a regime doesn't last a year"
  insight): `{1m:1.0, 3m:0.72, 6m:0.50, 1y:0.32}`. Effective multiplier
  `m = 1 + (SCEN.m − 1)·persist[hk]` (same for `p`). So Bull is full-strength at 1M and ~32% by 1Y.

### 3.3 Distribution / risk — `bandStats(mu, sd, target)`
Returns are modeled **lognormal** (fitted to arithmetic `mu`,`sd`) so **loss is bounded at −100%**
(a long-only book can't lose more than capital) and the **upside is fat-tailed**. Provides the
5%/95% band, the 5% downside (VaR), and `P(return ≥ target)`. `invNorm()` is the Acklam inverse-normal.
*(History: an earlier raw-Normal version produced impossible sub-−100% losses — do not regress to it.)*

### 3.4 Portfolio aggregation — `portfolio()` / `portfolioFromAlloc()`
- `μ = Σ wᵢ·erᵢ`
- `σ = √(ΣΣ wᵢwⱼσᵢσⱼρ)` with **theme-aware correlation**: `rhoIntra` (same theme, default 0.72)
  vs `rho` (cross-theme, default 0.40) — so spreading across layers genuinely lowers modeled risk.
- Plus effective-N (inverse HHI) and average conviction.

### 3.5 Optimizer — `allocationFor(hk, profile, pool)`
Five objectives, each with a per-position cap (`maxw`) and a max-positions limit (`maxpos`):
`prob` (max chance ≥ target = z-score), `return` (chase return, light risk cap), `minvar`
(1/σ²), `parity` (1/σ), `riskadj` (μ − λσ, default). Convex mode adds an upside-tail bonus and
softens λ. Negative-only scores fall back to min-variance (or upside-weighted in convex). A
water-filling loop enforces the cap then renormalizes.

### 3.6 Catalyst bias — `playbookBias(a, hk, profile)`
A transparent per-horizon, per-profile tilt added to the optimizer score so baskets differ by
horizon (1M→memory/packaging, 3M→packaging/optical, 6M→grid/power, 1Y→nuclear/minerals/frontier).
This is the "thumb on the scale" that encodes *catalyst-timing conviction*; it never forces a
deeply negative-EV name to dominate.

### 3.7 Barbell — `barbellAlloc(hk)`
The aggressive/convex strategy = **60% high-chance core + 40% concentrated upside sleeve**, blended
then re-capped. Returns `{alloc, tail}` where `tail` is the optionality sleeve shown in the UI. This
keeps expected return positive while making the horizon's optionality visible.

### 3.8 Simple mode — `rrProfile(hk, rr)` + `simpleStrategy()` + cards
One slider `rr ∈ [0,1]` maps **monotonically in risk**:
`rr<0.22` → `minvar` (safest) · `0.22–0.80` → `riskadj` with λ falling 2.6→~0.1 · `rr≥0.80` →
`barbell` (boldest). Labels: Conservative / Balanced / Growth / Aggressive. Default `rr = 0.6`
(Growth) so the per-horizon theses are visible by default. **Probability is an *outcome*, not a
second slider** — for a fixed target it's the dual of the risk lever, so a separate probability
control would over-determine the problem. (This decision is documented in the UI footer note.)

---

## 4. The asset universe (themes → names)

The canonical list is `ASSETS[]` in the HTML. As of 2026-06-30 it is ~47 names across:

- **Memory & Storage:** MU, STX, WDC, SNDK, TER, RMBS
- **Packaging & Semis:** ONTO, CAMT, KLIC, BESIY, TSM, AMAT
- **Optical & Interconnect:** COHR, LITE, FN, ALAB, CRDO, APH
- **Power Electronics:** MPWR, VICR, NVTS, ON
- **Grid & Electrical:** ETN, POWL, NVT, VRT, GEV, PWR
- **Power Gen & Nuclear:** VST, CEG, BE, CAT, CMI, CCJ, LEU, OKLO, SMR, NNE
- **Critical Minerals:** MP, UUUU, USAR, TECK, FCX, AXTI
- **Gases & Frontier:** LIN, APD, AMSC

Themes are load-bearing: they drive (a) intra-theme correlation and (b) catalyst bias. If you add a
theme, wire it into `playbookBias` and confirm correlation behaves.

---

## 5. Known limitations / honest caveats (don't oversell)

- Assumptions are **judgment**, not forecasts; no live data feed.
- Correlation is a **two-number model** (intra/cross theme), not a full covariance matrix.
- Tails are **parametric lognormal** — better than Normal, but real drawdowns cluster worse.
- Regime decay is a **heuristic**, not a fitted transition model.
- Binary names (SMR/fusion/thin-float minerals) can go to zero; the model's `down` is a tame proxy.
- "Already priced" judgments in the prose are directional and **age quickly** — re-check.

---

## 6. Validation checklist (run after any change)

The tool was validated by driving it in a headless browser and asserting:

1. **No JS errors / static-clean** (`get_errors` on the file).
2. **Simple default:** 4 horizon cards render; baskets **differ across horizons**.
3. **Monotonic risk:** sliding a horizon safe→bold makes σ **non-decreasing**.
4. **Regime decay:** Bull lifts **1M expected more (relatively) than 1Y**.
5. **Bounded downside:** no portfolio's 5% loss exceeds −100% of capital.
6. **Convex is positive-EV** at every horizon (no "best" playbook with negative expected return).
7. **Mode toggle** both ways; **"Open in Power tool"** loads the basket + horizon + controls.
8. **Charts** (power mode) paint and **don't grow** on repeated render (Retina DPR bug — fixed; keep `setupCanvas` reading the stored logical height).

Practical method: serve the folder (or open `file://`) and use Playwright `page.evaluate` to read
card metrics / holdings and assert the above. See the project chat history for concrete snippets.

---

## 7. How to continue — concrete next-round tasks

- **Refresh the as-of date** (top of this file + the tool's `updated` fields + `tools.json`).
- **Re-review every `ASSETS[]` assumption** vs current conditions: which theses played out, which
  spiked/faded, which tickers changed (spins, renames, delistings). Update `base`/`down`/`vol`/`p`.
- **Add / retire tickers:** add an `ASSETS[]` row (all 8 fields) and, if it's optionality, add it to
  the relevant `playbookBias` lists.
- **Add a new time horizon** (e.g., 2Y): add to `HORIZONS` (with `tgt`), add a column to **every**
  `TRIG_FRAC` row, add a `REGIME_PERSIST` entry, and add a target. Simple cards + playbooks pick it
  up automatically.
- **Add a new factor/dimension** (e.g., valuation, liquidity, momentum, geopolitics): add a field to
  `ASSETS[]` and fold it into the score in `allocationFor()` (and/or `assetHorizon`). Keep it
  transparent and editable.
- **Improve the regime model:** replace the scalar decay with a Monte-Carlo path / regime-transition
  matrix / multi-regime blend (this is the highest-value modeling upgrade; see §3.2).
- **Add themes** (networking/software/robotics/datacenter-REITs) — extend `ASSETS[]` + `playbookBias`.
- **Refresh the research prose** in the `<details class="research">` sections to match.
- **Re-run §6**, then deploy (§8).

---

## 8. Where things live + deploy workflow

- **Canonical repo (deployed):** `research-lab` → GitHub Pages at
  `https://pkirsanov.github.io/research-lab/`. Pushing to `main` auto-deploys via
  `.github/workflows/pages.yml`.
- **Staging copy:** `QuantitativeFinance/research/` (where the file is edited; untracked in QF — do
  **not** commit research tooling into the QF product repo).
- **Deploy a change:** edit the HTML → copy it into `research-lab/` → `git add … && git commit` →
  `git push` → the `pages` workflow redeploys → verify the live URL (cache-bust with `?v=<sha>`).
- **Per-tool notes convention:** every tool `<id>.html` has its notes at `notes/<id>.md`, linked from
  a small footer line in the tool. Follow this for any new tool.

---

## 9. Change log

- **2026-06-30** — Initial deep analysis (AI-capex supply-chain chokepoints, critical minerals,
  innovation triggers). Built the optimizer (5 objectives, theme-aware correlation, lognormal risk),
  per-horizon "best playbooks," the barbell, then the **Simple/Power** redesign with one
  risk↔reward lever per horizon and horizon-decayed regime. Deployed to `research-lab` Pages.
  Authored these notes.
