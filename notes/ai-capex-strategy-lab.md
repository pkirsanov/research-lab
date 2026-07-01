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
5. The 2026-06-30 refresh adds missing central AI-infra supplier layers: **AI networking/custom ASICs**, **server/integrator suppliers**, **EDA/design IP**, **datacenter build services**, **advanced packaging services**, and **contracted power**. Hyperscalers and neocloud/capacity buyers are intentionally excluded from core strategies.

---

## 1. What the tool is

An interactive playground for **US/Canada supplier-beneficiary equity & ADR/ETF-proxy strategies** around the **AI-datacenter capital-expenditure cycle**. The core screen is: *who benefits from hyperscaler datacenter / AI-infrastructure spending*, not *which hyperscaler is best*.

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
| --- | --- | --- |
| **1M** | memory/storage price spike + immediate packaging + networking momentum | MU, STX, TER, AMKR, AVGO, ANET, CRDO |
| **3M** | packaging/test follow-through + optical/custom ASICs + server/buildout suppliers | ONTO, CAMT, TSM, BESIY, MRVL, GLW, DELL, HPE |
| **6M** | grid/power bridge + power electronics + contracted power | ETN, POWL, GEV, MPWR, TLN, VST, CEG |
| **1Y** | nuclear fuel, critical minerals, frontier optionality, design IP, buildout services | LEU, CCJ, OKLO, MP, SNPS, CDNS, DLR, EQIX, AMSC |

Important nuance: at a **risk-adjusted** setting, longer horizons favor lower-volatility quality because volatility scales with sqrt(time). Nuclear/fusion/high-beta server optionality belongs in the **aggressive/barbell sleeve**, not default core.

### Explicit exclusions from the core universe

The tool intentionally excludes or screens out **hyperscalers / cloud capacity buyers** (`ORCL`, `CRWV`, `NBIS`, `IREN`, and similar) from the core supplier universe. They may be AI-compute demand trades, but they are also capital spenders, competitors, or capacity intermediaries. The tool is now centered on suppliers and landlords that monetize hyperscaler spend: networking, packaging, servers/integrators, power, cooling/mechanical/EPC, data-center real estate, EDA/IP, minerals and ETFs.

---

## 3. Model math

### 3.1 Asset assumptions — `ASSETS[]`

Each asset is a two-state annual-return bet:

| field | meaning |
| --- | --- |
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
runwayMult  = RESOURCE_RUNWAY[theme].b[hk]
runwayDown  = RESOURCE_RUNWAY[theme].d[hk]
regimeFade  = REGIME_PERSIST[hk]
scenario_m  = 1 + (SCEN[scenario].m - 1) * regimeFade
scenario_p  = 1 + (SCEN[scenario].p - 1) * regimeFade
bull_hz     = base * triggerFrac * scenario_m * runwayMult
down_hz     = down * triggerFrac + runwayDown
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

`RESOURCE_RUNWAY` is the model's answer to "how much is still left to buy?" It is heuristic, but deliberately asymmetric by theme:

- Memory/storage and server hardware: high near-term runway, but 6M/1Y upside haircuts and extra downside for contract saturation / P-E compression.
- Packaging/networking: still useful in 3M-6M but starts getting a longer-horizon de-rating haircut.
- Grid/electrical, power, buildout services, EDA/IP: longer runway because interconnects, substations, power equipment, construction backlogs and ASIC design cycles stretch over years.
- ETF proxies: smoothed runway, lower upside and lower downside.

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

Process: rank → keep `maxpos` → cap at `maxw` → water-fill → normalize. Convex mode softens risk and adds an upside-tail bonus. Negative-only scores fall back to min-variance (or upside-weighted in convex). In Simple mode, lower-risk profiles carry an `etfTilt` bonus for theme `ETF Proxies`, letting the safe side rotate away from concentrated single-name bets and into diversified baskets when those baskets score better.

The optimizer also subtracts a small `CROWDING` haircut from names that already look heavily repriced / crowded (for example VRT/POWL/OKLO/NNE/high-beta connectivity names). This is deliberately a **ranking friction**, not a change to user-editable bull/down/vol assumptions; the next analyst should refresh it whenever market leadership changes.

### 3.6 Catalyst bias — `playbookBias(a, hk, profile)`

Transparent scoring bias that makes playbooks horizon-aware:

- 1M: memory/storage, packaging, AI networking, immediate catalysts
- 3M: packaging/test, optical/networking, servers/integrators and EDA follow-through
- 6M: grid/power, buildout services, power electronics, contracted power
- 1Y: nuclear, critical minerals, EDA/design IP, datacenter buildout, frontier optionality

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
- **Servers & Integrators:** DELL, HPE, SMCI
- **EDA & Design IP:** SNPS, CDNS
- **Datacenter Build Services:** EME, FIX, TT, DOV, PH, DLR, EQIX
- **Gases & Frontier:** LIN, APD, AMSC
- **ETF Proxies:** SMH, SOXX, XSD, GRID, PAVE, XLU, URA, NLR, COPX, XME, FCG

Added presets:

- `networking`: AVGO/MRVL/ANET/CRDO/COHR/CIEN/GLW/APH/FN
- `servers`: DELL/HPE/SMCI/APH/GLW/ANET
- `buildout`: EME/FIX/TT/DOV/PH/DLR/EQIX/ETN/NVT/VRT
- `designip`: SNPS/CDNS/AVGO/MRVL/TSM/AMKR
- `etfs`: diversified ETF implementation layer (semis, grid/infrastructure, utilities, uranium/nuclear, copper/metals)

ETF caveat: there is **no pure DRAM/HBM ETF**. `SMH/SOXX/XSD` are semiconductor proxies, not memory-only instruments; use them to lower idiosyncratic risk, not to express a pure DRAM view.

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

### Server / design / buildout supplier screen

- **Oracle removed:** OCI may have a capacity story, but `ORCL` is not a clean supplier-beneficiary of hyperscaler datacenter capex and should not appear in default strategies.
- **Neoclouds removed from core:** CoreWeave/Nebius/IREN are capital spenders / compute-capacity intermediaries. Keep them as a separate speculative demand trade only if the user explicitly wants that, not in this supplier tool.
- **Server OEMs retained:** Dell/HPE/Supermicro sell systems into the AI buildout. Dell/HPE are cleaner lower-beta suppliers; SMCI is kept but penalized with high downside/vol because quality/governance risk matters.
- **EDA/IP added:** Synopsys/Cadence monetize the custom-ASIC design arms race without needing to fund datacenter capex themselves.
- **Buildout beneficiaries added:** EMCOR/Comfort Systems/Trane/Dover/Parker plus DLR/EQIX capture mechanical, cooling, EPC and datacenter-landlord exposure.
- Strategy: replace the old `neocloud` preset with `servers`, `buildout`, and `designip` presets.

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
- Server OEMs, datacenter REITs, merchant-power producers, and speculative nuclear remain path-dependent; balance-sheet risk is embedded only through assumptions, not a separate factor.

---

## 7. Next-run checklist

- [ ] Refresh every ticker for liquidity/listing/rename/delisting.
- [ ] Update `ASSETS[]` assumptions from latest earnings, backlog, capex, and valuation.
- [ ] Add a valuation/crowding factor if the tool starts favoring already-priced winners.
- [ ] Add explicit leverage / balance-sheet risk for power producers, server OEMs, datacenter REITs, and speculative nuclear.
- [ ] Refresh `RESOURCE_RUNWAY` using current backlog/order commentary: how much of each resource has already been contracted vs still needs to be bought, and whether P/E compression is starting.
- [ ] Reconfirm no cloud-capacity buyers slipped back into the core universe. If adding ORCL/CRWV/NBIS/IREN-type names, create a separate explicitly speculative tool/preset, not default supplier strategies.
- [ ] Consider ETF proxies (`NLR`, `URA`, `URNM`, `SMH`, `SOXX`, `BOTZ`, etc.) if the user wants lower single-name risk.
- [ ] Refresh ETF proxies: check whether better vehicles exist for semis/memory, grid, uranium/nuclear, copper/metals, and gas. Keep the "no pure DRAM/HBM ETF" caveat current.
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

## 9. Critical universe review (why each name is here)

Every asset should have a supplier-beneficiary rationale and a caveat. This section exists to prevent weak names from slipping in without scrutiny.

### Memory & Storage

- `MU` — US HBM/DRAM leverage; best US-listed memory proxy. Caveat: commodity memory is cyclical.
- `STX` — nearline HDD oligopoly / HAMR scarcity. Caveat: cyclical hardware and customer concentration.
- `WDC` — HDD + NAND exposure. Caveat: NAND cycle can dominate AI storage benefit.
- `SNDK` — NAND/SSD proxy. Caveat: less structural than HBM/HDD.
- `TER` — US proxy for HBM/SoC test. Caveat: Advantest is closer to HBM-test leadership.
- `RMBS` — memory interface/IP. Caveat: indirect, model assumes bandwidth bottleneck pull-through.

### Packaging & Semis

- `ONTO` — advanced packaging metrology/inspection. Caveat: semi-capex cycle.
- `CAMT` — packaging inspection/metrology. Caveat: smaller-cap/high-multiple risk.
- `KLIC` — bonding/assembly tooling. Caveat: secondary to stronger hybrid-bonding tools.
- `BESIY` — hybrid bonding / advanced packaging scarcity. Caveat: ADR/liquidity/valuation.
- `TSM` — CoWoS/foundry chokepoint. Caveat: geopolitical and already-discovered.
- `AMKR` — outsourced packaging/test, TSMC US partnership. Caveat: lower-margin OSAT.
- `ASX` — ASE packaging/test ADR. Caveat: Taiwan/ADR and lower purity.
- `AMAT` — wafer-fab equipment. Caveat: broad WFE, not AI-packaging pure.

### Optical & Interconnect

- `COHR` — optics/lasers/transceivers. Caveat: optical-cycle volatility.
- `LITE` — transceiver components. Caveat: customer/product-cycle risk.
- `FN` — optical manufacturing capacity. Caveat: contract-manufacturer economics.
- `ALAB` — connectivity / PCIe-CXL retimers. Caveat: high valuation and concentration.
- `CRDO` — active electrical cables. Caveat: high beta; bold baskets only.
- `APH` — high-speed connectors. Caveat: diluted but high-quality exposure.

### AI Networking & ASICs

- `AVGO` — custom ASIC + networking leader. Caveat: well-owned and partly priced.
- `MRVL` — custom ASIC / optical DSP. Caveat: design-win-to-margin execution.
- `ANET` — AI Ethernet switching. Caveat: valuation and hyperscaler concentration.
- `CIEN` — optical transport. Caveat: telecom-cycle drag.
- `GLW` — fiber/cabling materials. Caveat: broad materials dilution.
- `NOK` — Nokia/Infinera optical routing. Caveat: ADR + legacy telecom drag.

### Power Electronics

- `MPWR` — server power modules. Caveat: valuation.
- `VICR` — vertical power delivery. Caveat: uneven execution history.
- `NVTS` — GaN power optionality. Caveat: small-cap/unproven datacenter ramp.
- `ON` — SiC/power semi scale. Caveat: EV/industrial cycle can dominate.

### Grid & Electrical

- `ETN` — electrical/switchgear/datacenter power distribution. Caveat: crowded but high quality.
- `POWL` — switchgear/electrical rooms. Caveat: parabolic move risk.
- `NVT` — enclosures/electrical/liquid-cooling adjacent. Caveat: diversified.
- `VRT` — datacenter power/cooling. Caveat: very crowded AI winner.
- `GEV` — grid + turbines. Caveat: already re-rated, backlog execution.
- `PWR` — grid/electrical EPC. Caveat: labor/project execution risk.

### Power Gen & Nuclear

- `VST` — merchant power / nuclear. Caveat: power-price and valuation risk.
- `CEG` — nuclear fleet / carbon-free PPAs. Caveat: policy/regulatory risk.
- `TLN` — contracted power / datacenter PPA angle. Caveat: concentrated deal volatility.
- `NRG` — merchant power. Caveat: less pure than VST/CEG/TLN.
- `BE` — fuel cells / onsite power. Caveat: balance sheet and execution.
- `CAT` — gensets/backup power. Caveat: broad industrial cycle.
- `CMI` — gas engines/gensets. Caveat: broad cyclical exposure.
- `CCJ` — uranium fuel. Caveat: uranium cycle/policy.
- `LEU` — HALEU bottleneck. Caveat: binary policy/execution.
- `OKLO` — microreactor optionality. Caveat: speculative tail only.
- `SMR` — NuScale SMR. Caveat: project economics/regulatory risk.
- `NNE` — micro-nuclear optionality. Caveat: extreme speculation.

### Critical Minerals

- `MP` — US rare-earth/magnet chain. Caveat: rare earths are adjacent, not core datacenter BOM.
- `UUUU` — uranium + rare-earth optionality. Caveat: small-cap commodity/policy risk.
- `USAR` — US magnet chain. Caveat: early execution risk.
- `TECK` — zinc/germanium/copper. Caveat: broad miner, weak purity.
- `FCX` — copper. Caveat: discovered macro copper trade.
- `AXTI` — GaAs/InP/Ge substrates. Caveat: China exposure cuts both ways.

### Servers & Integrators

- `DELL` — AI server/integrator supplier. Caveat: margin compression.
- `HPE` — AI servers/HPC/networking. Caveat: lower growth, less pure.
- `SMCI` — high-beta server assembly. Caveat: governance/quality and margin risk.

### EDA & Design IP

- `SNPS` — EDA/IP for custom silicon. Caveat: software multiple / indirect capex exposure.
- `CDNS` — EDA/system design. Caveat: high quality but valuation-sensitive.

### Datacenter Build Services

- `EME` — electrical/mechanical EPC. Caveat: labor/project execution.
- `FIX` — mechanical/HVAC contractor. Caveat: already known datacenter winner.
- `TT` — thermal systems/chillers. Caveat: broad HVAC.
- `DOV` — CPC quick-disconnects/liquid-cooling components. Caveat: AI exposure diluted in conglomerate.
- `PH` — fluid connectors. Caveat: diversified industrial.
- `DLR` — datacenter REIT. Caveat: rate sensitivity and capital intensity.
- `EQIX` — colocation/datacenter REIT. Caveat: lower torque than suppliers.

### Gases & Frontier

- `LIN` — helium/industrial gas. Caveat: diluted AI/fusion exposure.
- `APD` — industrial gas. Caveat: company execution can dominate theme.
- `AMSC` — HTS/superconductor optionality. Caveat: long-dated frontier bet.

### ETF Proxies

- `SMH` — broad semiconductor proxy. Caveat: not DRAM/HBM pure.
- `SOXX` — broad semiconductor ETF. Caveat: large-cap semi concentration.
- `XSD` — more equal-weighted semiconductor beta. Caveat: higher volatility.
- `GRID` — smart-grid/electrical infrastructure basket. Caveat: composition drift.
- `PAVE` — US infrastructure basket. Caveat: broad, not datacenter-only.
- `XLU` — utilities defensive proxy. Caveat: low torque/rate sensitivity.
- `URA` — uranium/miners basket. Caveat: commodity/policy volatility.
- `NLR` — uranium/nuclear ETF. Caveat: imperfect HALEU/SMR proxy.
- `COPX` — copper miners. Caveat: broad commodity beta.
- `XME` — metals/mining basket. Caveat: weak AI purity.
- `FCG` — natural gas producers. Caveat: gas price dominates.

### Explicitly excluded / watchlist only

- `ORCL` — hyperscaler/cloud platform and capital spender, not a clean supplier-beneficiary.
- `CRWV`, `NBIS`, `IREN` — cloud-capacity / neocloud demand trades. They may deserve a separate speculative tool, but not this supplier-focused universe.

---

## 10. Version history

- **2026-06-30 initial:** single-file strategy lab with Simple/Power modes, editable universe, five optimizer objectives, theme-aware correlation, lognormal downside, independent horizon playbooks, and barbell strategies.
- **2026-06-30 adversarial tool pass:** corrected Simple-mode copy to match the actual monotonic slider (`minvar` → `riskadj` → `barbell`), added `CROWDING` / `crowdingPenalty()` as transparent optimizer-ranking friction for already-repriced/parabolic names, and validated that Simple mode still renders four distinct horizon baskets with bounded downside and monotonic 1Y risk.
- **2026-06-30 deep research refresh:** added AI networking/custom ASICs, server/integrator suppliers, advanced packaging services, EDA/design IP, datacenter buildout services, and contracted-power names; added `networking`, `servers`, `buildout`, and `designip` presets; removed hyperscaler/neocloud capacity buyers from the core supplier universe; updated horizon bias logic; kept per-tool notes wired into the common notes convention.
- **2026-06-30 ETF-risk pass:** added ETF proxy assets (`SMH/SOXX/XSD/GRID/PAVE/XLU/URA/NLR/COPX/XME/FCG`), a Power-mode `etfs` preset, and `etfTilt` in Simple mode so conservative risk settings can select diversified baskets while aggressive settings still use single-name/barbell exposure.
- **2026-06-30 supplier-universe / runway pass:** removed cloud-capacity buyers (`ORCL`, `CRWV`, `NBIS`, `IREN`) from executable strategies, added supplier-only categories (`Servers & Integrators`, `EDA & Design IP`, `Datacenter Build Services`), added ticker-by-ticker rationale/caveat coverage, linked visible tickers to Yahoo Finance, and added `RESOURCE_RUNWAY` so memory/server hardware fades over longer horizons while grid/power/buildout/EDA retain longer procurement runway.
- **2026-06-30 slider-usability pass:** fixed Simple-mode slider feedback so users can see changes while dragging: card profile now includes the live risk/reward percentage, visible allocation weights render with one decimal, and the handler listens to both `input` and `change` while refreshing all Simple cards.
