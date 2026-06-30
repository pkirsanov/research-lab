# AI Capex Strategy Lab — Analysis Notes & Methodology

> **Tool:** [`ai-capex-strategy-lab.html`](../ai-capex-strategy-lab.html) · **Tool id:** `ai-capex-strategy-lab`
> **As-of / last deep refresh:** 2026-06-30
> **Audience:** the next agent / analyst who continues this work.
>
> **Educational only — NOT investment advice.** No live market prices are used; every return, probability, volatility, and strategy is a hypothetical output from editable assumptions.

This document is the full record of **how the AI Capex Strategy Lab was built** so the next run can update it, extend horizons, add factors, refresh sources, or re-cut strategies without re-deriving everything.

---

## 0. TL;DR for continuing the work

1. Open [`ai-capex-strategy-lab.html`](../ai-capex-strategy-lab.html). Everything is in one self-contained file: HTML, CSS, data, model logic, and research prose.
2. The main data to refresh is the `ASSETS[]` array and the `<details class="research">` prose.
3. The model constants are small and named: `HORIZONS`, `TRIG_FRAC`, `SCEN`, `REGIME_PERSIST`, correlation, and optimizer profiles.
4. After editing, run the validation commands in Section 8, then commit and push (GitHub Pages redeploys automatically).
5. The 2026-06-30 refresh adds missing central AI-infra layers: **AI networking/custom ASICs**, **neocloud/AI cloud & OEM capacity**, **advanced packaging services**, and **contracted power**.

---

## 1. What the tool is

An interactive playground for **US/Canada equity & ADR-proxy strategies** around the **AI-datacenter capital-expenditure cycle**.

- **Simple mode (default):** one optimal strategy card per time horizon (1M / 3M / 6M / 1Y), each with a single **risk↔reward slider** and a shared **market-regime** lever.
- **Power tool:** full editable optimizer: per-asset assumptions, five optimizer objectives, theme-aware correlation, per-position caps, cross-horizon playbooks, and charts.

The two modes share one underlying model. Simple mode is an opinionated front-end over `allocationFor()`.

---

## 2. Analytical backbone

The binding constraint of the AI build-out walks downstream over time:

> silicon → memory → advanced packaging → optical/networking → power → grid → fuel → cooling → water → skilled labor

The market reprices early links first. Durable edge sits where supply is capacity-inelastic: monopoly/oligopoly, capital-bound, permit-bound, geopolitically concentrated, or on a critical path.

### Horizon structure

| Horizon | What is live | Representative exposure |
|---|---|---|
| **1M** | memory/storage price spike + immediate packaging + networking momentum | MU, STX, TER, AMKR, AVGO, ANET, CRDO |
| **3M** | packaging/test follow-through + optical/custom ASICs + neocloud momentum | ONTO, CAMT, TSM, BESIY, MRVL, GLW, CRWV |
| **6M** | grid/power bridge + power electronics + contracted power | ETN, POWL, GEV, MPWR, TLN, VST, CEG |
| **1Y** | nuclear fuel, critical minerals, frontier optionality, capacity monetization | LEU, CCJ, OKLO, MP, IREN, NBIS, AMSC |

Important nuance: at a **risk-adjusted** setting, longer horizons favor lower-volatility quality because volatility scales with sqrt(time). Nuclear/fusion/neocloud optionality belongs in the **aggressive/barbell sleeve**, not default core.

---

## 3. Model math

### 3.1 Asset assumptions — `ASSETS[]`

Each asset is a two-state annual-return bet:

| field | meaning |
|---|---|
| `tk` / `nm` / `mk` | ticker / name / market (`US`, `US-ADR`) |
| `th` | theme, used for correlation and catalyst bias |
| `tier` | scarcity tier `S`/`A`/`B` |
| `trig` | catalyst timing: `now`, `1-3y`, `3-5y`, `5-10y` |
| `base` | bull annualized return if thesis works |
| `down` | thesis-fails annualized return |
| `vol` | annualized volatility |
| `p` | probability the bull case is realized |

Assumption-setting rule: higher `base` must be paired with higher `vol` and/or lower `p`. Tier-S chokepoints can have higher `p`; thin-float binary names get low `p`, high `vol`, and large `base/down` spread.

### 3.2 Horizon expected return — `assetHorizon(a, hk)`

```text
triggerFrac = TRIG_FRAC[trigger][hk]
regimeFade  = REGIME_PERSIST[hk]
scenario_m  = 1 + (SCEN[scenario].m - 1) * regimeFade
scenario_p  = 1 + (SCEN[scenario].p - 1) * regimeFade
bull_hz     = base * triggerFrac * scenario_m
down_hz     = down * triggerFrac
p_eff       = clamp(p * scenario_p, 0.02, 0.95)
E[r]_hz     = p_eff * bull_hz + (1 - p_eff) * down_hz
sigma_hz    = vol * sqrt(years)
```

Current `TRIG_FRAC`:

```text
now   : 1m .18  3m .42  6m .70  1y 1.00
1-3y  : 1m .04  3m .12  6m .28  1y .55
3-5y  : 1m .015 3m .05  6m .13  1y .30
5-10y : 1m .005 3m .02  6m .06  1y .16
```

Regime decays by horizon: `1m 100% · 3m 72% · 6m 50% · 1y 32%` so a bull/bear tilt is not unrealistically held at full strength for a full year.

### 3.3 Distribution and downside — `bandStats(mu, sd, target)`

Uses a lognormal simple-return model fitted to `(mu, sd)`:

- loss bounded at -100%
- upside fat-tailed
- reports `P(return >= target)` and 5% / 95% bands

Do **not** regress to raw Normal tails; an earlier version produced impossible sub--100% downside.

### 3.4 Portfolio aggregation

```text
mu = sum(w_i * er_i)
sigma = sqrt(sum_i sum_j w_i w_j sigma_i sigma_j rho_i,j)
rho_i,j = 1 if same asset
        = rhoIntra if same theme
        = rho if different themes
```

Also reports effective-N (inverse HHI), average conviction, expected $ return, target probability, and 5% downside.

### 3.5 Optimizer — `allocationFor(hk, profile, pool)`

Five objectives, each with a per-position cap (`maxw`) and max-position count (`maxpos`):

- `riskadj`: `mu - lambda * sigma`
- `prob`: `(mu - target) / sigma`
- `return`: `mu - 0.15 * sigma`
- `minvar`: `1 / sigma^2`
- `parity`: `1 / sigma`

Process: rank → keep `maxpos` → cap at `maxw` → water-fill → normalize. Convex mode softens risk and adds an upside-tail bonus. Negative-only scores fall back to min-variance (or upside-weighted in convex).

The optimizer also subtracts a small `CROWDING` haircut from names that already look heavily repriced / crowded (for example VRT/POWL/OKLO/NNE/high-beta connectivity names). This is deliberately a **ranking friction**, not a change to user-editable bull/down/vol assumptions; the next analyst should refresh it whenever market leadership changes.

### 3.6 Catalyst bias — `playbookBias(a, hk, profile)`

Transparent scoring bias that makes playbooks horizon-aware:

- 1M: memory/storage, packaging, AI networking, immediate catalysts
- 3M: packaging/test, optical/networking, neocloud momentum
- 6M: grid/power, power electronics, contracted power, AI cloud monetization
- 1Y: nuclear, critical minerals, frontier optionality, durable capacity

### 3.6a Crowding / valuation friction — `CROWDING` + `crowdingPenalty()`
`CROWDING` is a ticker→haircut map for names where the theme is already crowded, valuation-sensitive,
or hype-prone. `crowdingPenalty()` scales the haircut by horizon (light at 1M, full by 1Y) and profile
(reduced inside optionality tails). It prevents the optimizer from mechanically piling into the most
obvious/parabolic names when two alternatives have similar modeled return/risk.

### 3.7 Barbell — `barbellAlloc(hk)`

Aggressive/convex strategy is roughly **60% high-chance core + 40% concentrated optionality sleeve**, then re-capped. The optionality sleeve is shown in the UI.

---

## 4. Current universe after Jun-30 refresh

- **Memory & Storage:** MU, STX, WDC, SNDK, TER, RMBS
- **Packaging & Semis:** ONTO, CAMT, KLIC, BESIY, TSM, AMKR, ASX, AMAT
- **Optical & Interconnect:** COHR, LITE, FN, ALAB, CRDO, APH
- **AI Networking & ASICs:** AVGO, MRVL, ANET, CIEN, GLW, NOK
- **Power Electronics:** MPWR, VICR, NVTS, ON
- **Grid & Electrical:** ETN, POWL, NVT, VRT, GEV, PWR
- **Power Gen & Nuclear:** VST, CEG, TLN, NRG, BE, CAT, CMI, CCJ, LEU, OKLO, SMR, NNE
- **Critical Minerals:** MP, UUUU, USAR, TECK, FCX, AXTI
- **AI Cloud & OEM Capacity:** CRWV, NBIS, IREN, ORCL, DELL, SMCI
- **Gases & Frontier:** LIN, APD, AMSC

Added presets:

- `networking`: AVGO/MRVL/ANET/CRDO/COHR/CIEN/GLW/APH/FN
- `neocloud`: CRWV/NBIS/IREN/ORCL/DELL/SMCI/VRT/ETN

---

## 5. Jun-30 research refresh — evidence and implications

### Memory / HBM / storage

- AI datacenter demand is worsening the memory shortage.
- Reports cite AI datacenters consuming ~70% of memory chips in 2026.
- HBM/DRAM/NAND supply tightness is expected to persist into **2027-2028**, with some sources discussing 2030 scenarios.
- Strategy: memory is still central at 1M-3M, but commodity DRAM/NAND is cyclical.

### Optical / networking / custom ASICs

- Credo: >3x FY2026 revenue; expects >80% FY2027 revenue growth from optical connectivity.
- Corning: multiyear, multibillion-dollar Amazon fiber agreement; also tied to Meta/Nvidia 2026 AI optics demand.
- Broadcom/Marvell/Arista/Ciena repeatedly show up as AI networking/custom silicon beneficiaries.
- Strategy: add **AI Networking & ASICs** as its own theme and preset.

### AI cloud / neocloud / OEM capacity

- CoreWeave: nearly $100B backlog, 5GW goal, but margin/interest-expense pressure.
- Nebius: very high AI-cloud growth and 4GW target; high valuation/short-interest risk.
- IREN: AI datacenter pivot; high optionality and high execution risk.
- Oracle: OCI AI cloud beneficiary; capital intensity and leverage matter.
- Dell/SMCI: AI server OEM exposure; SMCI gets high downside/vol because governance/quality risk matters.
- Strategy: add **AI Cloud & OEM Capacity** theme and `neocloud` preset.

### Advanced packaging / test

- CoWoS/HBM bottleneck is broadening into outsourced packaging and test capacity.
- Amkor: TSMC 10-year advanced packaging partnership, Arizona expansion, HDFO/2.5D ramp.
- ASE: advanced packaging/testing revenue outlook improved.
- Strategy: add AMKR and ASX.

### Power / nuclear / contracts

- Power remains a binding constraint; nuclear and merchant-power contracts remain strategic.
- Vistra/Constellation/Talen/NRG appear as AI power beneficiaries; PJM acceleration benefits power producers.
- Microsoft/Chevron gas bridge shows hyperscalers will use fossil bridge power to meet near-term demand.
- Strategy: add TLN and NRG, keep VST/CEG/GEV/ETN as core.

---

## 6. Known limitations

- No live market data or valuation input.
- Balance-sheet/leverage risk is embedded only through `p/down/vol`, not a separate factor.
- Correlation is theme-aware but simplified.
- The optimizer can overfit assumptions; review holdings rather than blindly accepting outputs.
- Neoclouds are extremely path-dependent: backlog/capacity are bullish; leverage, depreciation, and supplier dependency are bearish.

---

## 7. Next-run checklist

- [ ] Refresh every ticker for liquidity/listing/rename/delisting.
- [ ] Update `ASSETS[]` assumptions from latest earnings, backlog, capex, and valuation.
- [ ] Add a valuation/crowding factor if the tool starts favoring already-priced winners.
- [ ] Add explicit leverage / balance-sheet risk for neoclouds, power producers, and speculative nuclear.
- [ ] Consider ETF proxies (`NLR`, `URA`, `URNM`, `SMH`, `SOXX`, `BOTZ`, etc.) if the user wants lower single-name risk.
- [ ] Consider a new 2Y horizon only if converting from horizon scaling to multi-year chained projections.
- [ ] Keep research prose and notes synchronized with the tool.

---

## 8. Validation after edits

From repo root:

```bash
node -e 'const fs=require("fs");const h=fs.readFileSync("ai-capex-strategy-lab.html","utf8");const js=h.match(/<script>([\s\S]*?)<\/script>/)[1];new Function(js);const assets=new Function("return ["+h.split("var ASSETS=[")[1].split("];\r\nASSETS.forEach")[0]+"]")();const presets=new Function("return "+h.split("var PRESETS=")[1].split(";\r\n\r\n/* ---------------- state")[0])();const t=assets.map(a=>a.tk);const dup=t.filter((x,i)=>t.indexOf(x)!==i);if(dup.length)throw new Error("dup "+dup);const miss=[];Object.entries(presets).forEach(([p,w])=>Object.keys(w).forEach(x=>{if(!t.includes(x))miss.push(p+":"+x)}));if(miss.length)throw new Error("missing "+miss);console.log("OK assets="+assets.length+" presets="+Object.keys(presets).length)'
```

Then commit and push; Pages deploys from `main` automatically.

---

## 9. Version history

- **2026-06-30 initial:** single-file strategy lab with Simple/Power modes, editable universe, five optimizer objectives, theme-aware correlation, lognormal downside, independent horizon playbooks, and barbell strategies.
- **2026-06-30 adversarial tool pass:** corrected Simple-mode copy to match the actual monotonic slider (`minvar` → `riskadj` → `barbell`), added `CROWDING` / `crowdingPenalty()` as transparent optimizer-ranking friction for already-repriced/parabolic names, and validated that Simple mode still renders four distinct horizon baskets with bounded downside and monotonic 1Y risk.
- **2026-06-30 deep research refresh:** added AI networking/custom ASICs, neocloud/OEM capacity, advanced packaging services, and contracted-power names; added `networking` and `neocloud` presets; updated horizon bias logic; kept per-tool notes wired into the common notes convention.
