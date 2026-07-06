# MSFT July-Print Margin &amp; EPS Model — Analysis &amp; Methodology Notes

> **Tool:** [`msft-july-print-model.html`](../msft-july-print-model.html) · **Tool id:** `msft-july-print-model`
> **Last analysis run:** 2026-07-06 · **Scenario "today":** 2026-07-06 (pre–FY26 Q4 print)
> **Status:** living document — the next agent should update dates, plug in the actual Q4 print, refresh consensus, and re-verify the cost-cycle sources.
>
> **Educational only — NOT investment advice.** No live market prices; every output is a mechanical function of editable assumptions.

This file is the full handoff for the next analysis run: what the tool does, the verified data behind it, the model math, every input lever, the key findings/corrections, the cost-cycle thesis with sources, known limitations, and a next-run checklist.

---

## 0. TL;DR for the next agent

- The tool models **Microsoft's late-July FY26 Q4 print** and a **FY27E operating-margin bridge → EPS → implied price**, reconciled against **reported Q1–Q3 FY26 actuals**.
- Core thesis (verified): **operating margin is already compressing** (Q1 48.9% → Q2 47.1% → Q3 46.3%) *before* the bulk of the FY27 depreciation wave; the market is applying a "show-me" discount.
- A pasted third-party claim of **"~47% Q4 operating margin"** is a **bull-stretch** — it requires margins to *rise* QoQ against a 3-quarter downtrend and FY25's −77 bps Q3→Q4 seasonality. Internally consistent base ≈ **44.5–45.6%**.
- A **cost-cycle / market-structure overlay** (hardware-cost inflation → hyperscaler consolidation → multi-year pricing) is verified and wired to 3 phase presets. Inflation phase is **structural through ~2027–2028 (some see 2030)**.
- Everything is a single self-contained HTML file: no build, no deps, no network. Edit → validate (Section 9) → commit → push (Pages auto-redeploys).

---

## 1. What the tool computes

| Block | What it shows |
|---|---|
| **Margin trajectory** | Q1/Q2/Q3 actual OM + Q4 scenario, with QoQ deltas |
| **Q4 anchors** | Consensus-implied, seasonality-implied, flat-vs-Q3, and the pasted "47%" claim side by side |
| **Q4 print view** | Q4 revenue vs guide, sequential growth, operating EPS, capex intensity |
| **Q4 reconciliation** | Consensus FY26 EBIT margin → implied Q4 revenue / OI / OM; scenario FY26 OM roll-up |
| **FY27 results** | Revenue, operating margin (+bps vs FY26), EPS, implied price |
| **OM bridge** | FY26 OI → +price/mix → +volume → −FX → −churn → −opex → −depreciation → FY27 OI |
| **Valuation ladder** | EPS × {18,20,22,25,28,32}× → implied price, benchmarked to spot |
| **Heatmap** | FY27 OM / Op income / EPS across volume growth × depreciation (metric toggle) |
| **Cost-cycle overlay** | 3-phase timeline (Inflation/Transition/Deflation) + phase presets |

---

## 2. Verified FY26 actuals (Microsoft IR — primary source)

All figures GAAP, from Microsoft IR press releases &amp; financial statements. Reading the IR `press-release-webcast` pages gives the full income statement, balance sheet, and cash-flow statement per quarter.

| Metric | Q1 FY26 (Sep'25) | Q2 FY26 (Dec'25) | Q3 FY26 (Mar'26) | 9-mo |
|---|---|---|---|---|
| Reported | Oct 29, 2025 | Jan 28, 2026 | Apr 29, 2026 | — |
| Revenue ($B) | 77.673 | 81.273 | 82.886 | **241.832** |
| Operating income ($B) | 37.961 | 38.275 | 38.398 | **114.634** |
| **Operating margin** | **48.87%** | **47.10%** | **46.33%** | **47.40%** |
| Diluted EPS (GAAP) | $3.72 | $5.16¹ | $4.27 | $13.14 |
| Diluted shares (M) | 7,466 | 7,460 | 7,445 | — |
| D&amp;A, qtr ($B, cash-flow) | ~8.15² | 9.198 | 10.167 | **27.512** |
| Capex — additions to PP&amp;E ($B) | 19.394 | 29.876 | 30.876 | **80.146** |
| Microsoft Cloud ($B) | 49.1 (+26%) | 51.5 (+26%) | 54.5 (+29%) | — |
| Commercial RPO ($B) | 392 (+51%) | 625 (+110%) | 627 (+99%) | — |
| Azure growth | +40% (+39% cc) | +39% (+38% cc) | +40% (+39% cc) | — |
| Shareholder returns ($B) | 10.7 | 12.7 | 10.2 | — |

¹ Q2 GAAP NI/EPS include a **+$7.583B / +$1.02** OpenAI mark-to-market **gain**; non-GAAP EPS $4.14. Q1 OpenAI impact −$3.086B / −$0.41; Q3 minimal (−$14M).
² Q1 standalone cash-flow line printed $13.061B, which is inconsistent with the 9-month total of $27.512B (Q3 statement) and Q2's $9.198B; treat the **9-month $27.512B** as authoritative and Q1 ≈ $8.15B (derived).

**Other anchors**

- Q3 balance sheet: PP&amp;E net **$283.228B** (accumulated depreciation $111.723B); total assets $694.228B.
- **FY25 Q4 (ref):** rev ~$76.4B, OI ~$34.3B → **OM ~44.9%**; FY25 Q3 OM 45.67% → **Q3→Q4 seasonality = −77 bps**.
- **Market (Jul 2–6, 2026):** spot **$390.49** (Jul 2 close; ~$388 Jul 6 pre-mkt, bounced from the $368.57 Jun-30 low), mkt cap ~$2,900B, 52-wk **$349.20–$555.45**, fwd P/E ~21× (compressed from high-20s). Analyst consensus Strong Buy, PT ~$561.
- **Jul-6 overhangs (new since last run):** Copilot functionality issues drove a ~10% drop → securities-fraud class action filed Jul 6; third layoff round in a year (~5k, "AI-spending" framing); Copilot reset + a $2.5B "Frontier" enterprise-AI unit; Haleon 5-yr AI/cloud deal (+4% Jul 1). Net: sharpens the "show-me" margin discount into the Jul 29 print.
- **Q4 FY26 guide:** revenue **$86.7–87.8B**; capex **>$40B**. Earnings call **July 29, 2026** (confirmed).
- **FY26 consensus (external, user-adjustable):** revenue ~**$329.5B**, EBIT margin ~**46.63%** (e.g., MarketScreener-style).

---

## 3. Model methodology

### 3a. FY27 annual operating-margin bridge (ex-depreciation contribution margins)

```
OI26       = revFY26 × om26
GP_price   = revFY26 × price%  × priceMargin     (≈pure margin, no capex)
GP_volume  = revFY26 × volume% × volumeMargin    (this is what CREATES the depreciation)
GP_fx      = revFY26 × fx%     × 0.95
GP_churn   = revFY26 × churn%  × churnMargin
ΔOpex      = opexIntensity × (price$ + volume$)
OI27       = OI26 + GP_price + GP_volume + GP_fx − GP_churn − ΔDep − ΔOpex
RevFY27    = revFY26 × (1 + price% + volume% + fx% − churn%)
OM27       = OI27 / RevFY27
NI         = (OI27 + otherIncome) × (1 − tax)     (operating-style; excludes OpenAI MTM)
EPS        = NI / shares
implied $  = EPS × fwdPE
```

Margins are **ex-depreciation cash contribution margins** so the depreciation step is isolated as an explicit line — this is the whole point (it makes the capex→depreciation drag visible).

### 3b. Q4 reconciliation (consensus vs seasonality)

```
consOI          = consRev × consEbitMargin
impliedQ4Rev    = consRev − ytdRev                 (≈ 87.7)
impliedQ4OI     = consOI  − ytdOI
impliedQ4OM     = impliedQ4OI / impliedQ4Rev       (≈ 44.5% at consensus 46.63%)
q3OM            = q3OI / q3Rev                      (= 46.33%)
seasonalQ4OM    = q3OM + seasonalDelta (−77 bps)   (≈ 45.56%)
flatQ4OM        = q3OM                              (= 46.33%)
scenarioFYOM    = (ytdOI + q4Rev×q4OM) / (ytdRev + q4Rev)
```

### 3c. Heatmap

- Grid: volume growth {6,8,10,12,14,16}% × depreciation step {10..40}$B.
- Color is **normalized to the grid's actual min/max** (dynamic), `hsl(6+t·134, 70%, 20+t·22%)`.
- Metric toggle: **OM% / Op income $B / EPS $**. ⚠️ OM is a *ratio* and nearly **volume-invariant** (within-row spread ~1.5% vs ~8.4% down a column) — so on OM% a row looks flat; OI and EPS vary on both axes (EPS ~$1.93 within-row, ~$3.26 down-column).

---

## 4. Inputs, defaults &amp; presets

### Base preset (FY27 annual)

`revFY26 329.5 · om26 46.6 · volumeGrowth 10.5 · priceMixGrowth 4.5 · churn 1.5 · fx −1.0 · priceMargin 95 · volumeMargin 66 · churnMargin 75 · opexIntensity 12 · deltaDep 22 · otherIncome 2 · taxRate 19 · shares 7.45 · fwdPE 22`
→ FY27 OM ≈ **42.0%**, EPS ≈ **$17.15**, implied ≈ **$377 @22×**.

### Q4 / reconciliation inputs (base)

`q3Revenue 82.886 · q3OperatingIncome 38.398 · q4Revenue 87.7 · q4OperatingMargin 45.0 · q4Capex 42 · q4DaEstimate 11.0 · consensusFY26Revenue 329.5 · consensusFY26EbitMargin 46.63 · ytdRevenue 241.832 · ytdOperatingIncome 114.634 · seasonalDeltaBps −77`

### Bull / Bear deltas

- **Bull:** volumeGrowth 12 · priceMixGrowth 5.5 · churn 1.0 · fx −0.5 · volumeMargin 68 · opexIntensity 10 · deltaDep 16 · q4OM 46.0 · fwdPE 28 · (om26 46.9, consEbit 47.0, seasonalDelta −40).
- **Bear:** volumeGrowth 8.5 · priceMixGrowth 3.0 · churn 2.5 · fx −2.0 · priceMargin 93 · volumeMargin 63 · churnMargin 72 · opexIntensity 15 · deltaDep 32 · q4OM 43.5 · fwdPE 19 · (om26 46.3, consEbit 46.2, seasonalDelta −150).

### Cost-cycle phase presets (illustrative single-year snapshots — NOT a chained projection)

| Phase | vol% | price% | volMargin | ΔDep | P/E | → OM | EPS | implied |
|---|---|---|---|---|---|---|---|---|
| 🔥 Inflation '26–'28 | 12.0 | 5.0 | 63 | 28 | 20 | ~40.4% | ~$16.80 | ~$336 |
| 🔁 Transition '28–'29 | 11.0 | 4.5 | 66 | 22 | 24 | ~42.1% | ~$17.24 | ~$414 |
| ❄️ Deflation '29–'30+ | 9.0 | 4.0 | 70 | 14 | 27 | ~44.2% | ~$17.71 | ~$478 |

---

## 5. Key findings &amp; corrections (carry forward)

1. **Margin downtrend is already underway** — 48.9% → 47.1% → 46.3% (Q1→Q3). Compression is *current*, not just a future FY27 risk.
2. **"47% Q4" is a bull-stretch.** Consensus (46.63% FY) → Q4 ≈ 44.5%; seasonality (−77 bps) → ≈ 45.6%; flat → 46.3%. 47% needs a QoQ margin *increase* against the downtrend.
3. **RPO is lumpy / OpenAI-concentrated** — $392B → $625B (**+$233B = the OpenAI commitment**) → $627B (flat). The +99% YoY is one mega-deal, not broad-based backlog acceleration.
4. **Capex definition matters** — reported **cash capex (additions to PP&amp;E)** is $80.1B for 9 months → FY26 **>$120B**. The widely-quoted **"$190B"** is a broader **calendar-year / lease-inclusive** figure — *not* the same metric; don't mix them.
5. **D&amp;A IS disclosed** (cash-flow statement), rising ~$1B/qtr; FY26 ≈ $38B. Only the **FY27 incremental step** is modeled.
6. **OM is volume-invariant** (a ratio) — drove the heatmap "same color per lane" issue; fixed with dynamic normalization + OM/OI/EPS toggle.
7. **EPS is operating-style** — excludes OpenAI mark-to-market, which swung GAAP EPS (Q1 −$0.41, Q2 +$1.02). Use this when comparing to consensus operating EPS, not headline GAAP.

---

## 6. Cost-cycle / market-structure thesis (verified Jun 2026)

**Thesis:** hardware-cost inflation favors scale players → consolidation toward hyperscalers → multi-year pricing dynamics (near-term pricing power, later deflation). **Verdict: largely TRUE, but the timeline is longer than "a few quarters."**

- **Inflation is structural through ~2027–2028, some see 2030:** "Memory shortage won't ease until 2028" (24/7 Wall St, Jun 29); "prices could keep rising through 2027" (Jefferies); "runs into 2028" (Goldman); "locked through 2030 / HBM crisis" (TechTimes, Computex 2026); Micron "beyond 2027"; Lenovo "high memory prices = the new normal." **DRAM price-fixing class actions** vs Samsung/SK Hynix/Micron = supply discipline ("no incentive to fix").
- **Sub-scale squeezed / consolidation:** Lenovo's **$21B AI-server backlog stalled** by HBM shortage; Dell'Oro — memory cost inflation drove data-center capex higher (1Q26); buildout "twice the US defense budget"; 142k tech layoffs partly to fund infra.
- **On-prem nuance (not dead):** Dell Tech World 2026 pushes sovereign/on-prem AI; InfoWorld sees long-term workload repatriation once innovation matures. Near-term consolidation is strong; on-prem persists for sovereignty/cost.
- **For MSFT — double-edged:** near-term margin pressure (input inflation + depreciation) **but** share gains from consolidation + its own **Maia** silicon as the eventual deflation lever.
- **Maia 200 status:** "only recently went live in *some* data centers" serving M365 Copilot + OpenAI workloads; MSFT is "furthest behind" AMZN/GOOGL on custom silicon; **not a wholesale Nvidia replacement** (the "Trojan Horse forces startups off CUDA" framing is premature).

---

## 7. Known limitations / simplifications

- **Single-period FY27 model.** The phase presets are *illustrative single-year snapshots* of the cost cycle, not a chained multi-year DCF.
- **Consensus inputs are external estimates** (FY26 revenue/EBIT margin), fully user-adjustable.
- **FY27 depreciation step is modeled**, anchored to the actual D&amp;A run-rate but not disclosed.
- **Other income** defaults to a normalized +$2B/yr; real other income is volatile due to OpenAI equity-method swings.
- **No live prices**; spot $368.57 is hardcoded as of 2026-06-29. Update on each run.
- **FX** is a single blended revenue-impact %, not modeled by currency.

---

## 8. Next-run checklist (what to update)

- [ ] Update "today" / **spot price** / 52-wk range / fwd P/E.
- [ ] **After the ~July 29 print:** replace Q4 *estimates* with **actual Q4 FY26 results** (revenue, OI, OM, EPS, D&amp;A, capex). The model becomes FY26-complete; re-point the reconciliation to **FY27 quarterly**.
- [ ] Refresh **FY27 consensus** (revenue, EBIT margin) and — most important catalyst — the **FY27 capex guide** (up again? decelerating?).
- [ ] Re-verify the **cost-cycle sources**; check whether the deflation phase has pulled forward or pushed out; update the phase years.
- [ ] Check **Maia 200** deployment progress (scaling beyond "some data centers"?).
- [ ] Re-examine the **OpenAI** relationship / RPO concentration (renewal, margin quality).
- [ ] Consider **new factors**: power/energy constraints, regulatory (Italy AGCM outcome + new probes), rate environment, FX regime, neoclouds / new entrants, antitrust.
- [ ] Add or re-cut **time horizons** as needed (e.g., explicit 1M/3M/6M/1Y like the AI Capex Lab).
- [ ] Re-run the **validation** in Section 9 before commit.

---

## 9. How to edit, validate &amp; ship

Single self-contained HTML — no build, no dependencies, no network. To validate after edits (from the repo root):

```bash
# JS parses + every getElementById has a matching id
node -e 'const fs=require("fs");const h=fs.readFileSync("msft-july-print-model.html","utf8");const js=h.match(/<script>([\s\S]*?)<\/script>/)[1];new Function(js);const ids=new Set([...h.matchAll(/id="([^"]+)"/g)].map(x=>x[1]));const refs=[...js.matchAll(/getElementById\("([^"]+)"\)/g)].map(x=>x[1]);const miss=[...new Set(refs.filter(i=>!ids.has(i)))];if(miss.length){console.error("MISSING:",miss.join(", "));process.exit(1)}console.log("OK refs="+refs.length)'
```

Then: `git add` the changed files → `git commit` → `git push origin main` (the `pages` workflow redeploys automatically).

---

## 10. Version history

- **v1** — initial FY27 model: OM bridge, EPS, valuation ladder, OM heatmap, bull/base/bear presets.
- **v2** — added Q4 quarterly view + heatmap; then the Q4 margin **reconciliation** (corrected a pasted "47%" to the consensus-implied ~44.5%).
- **v3** — rebuilt on **verified Q1–Q3 actuals**; margin-trajectory card; **dual Q4 anchors** (consensus + seasonality); RPO-concentration callout; capex guardrail.
- **v4 (published as `msft-july-print-model.html`)** — added the **cost-cycle / market-structure** module with 3 phase presets.
- **heatmap fix** — dynamic color normalization + OM/OI/EPS metric toggle (OM is volume-invariant).

---

*Notes convention: one file per tool at `notes/<tool-id>.md`, linked from a small footer in the tool's HTML and referenced via the `notes` field in `tools.json` / the `index.html` TOOLS array. See [`notes/README.md`](README.md).*
