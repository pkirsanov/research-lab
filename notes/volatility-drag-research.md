# Volatility drag — cross-cutting research note

> **Type:** cross-cutting research note (not a per-tool notes file). Shares the
> `notes/` folder with `shared-data-layer.md` under the same convention.
> **Date:** 2026-07-30
> **Scope:** how volatility drag is (and is not) represented across the shipped
> research-lab tools, shared modules, and specs.
> **Companion:** the sibling QuantitativeFinance repository has a parallel
> analysis at `docs/Volatility_Drag_Analysis.md`. Several findings are the *same
> defect arrived at independently*; §5 explains why that matters.
> **Method:** static source reading + analytic derivation. No tool was run and
> no live fetch was performed for this pass. Every claim cites the file it was
> read from; derivations are labelled as derivations.

---

## 1. Purpose

Volatility drag (variance drain) is the gap between the arithmetic mean return
and the geometric growth rate a portfolio actually experiences:

$$g \;\approx\; \mu - \frac{\sigma^{2}}{2}
\qquad\Longrightarrow\qquad
\text{drag} \;=\; \mu - g \;\approx\; \frac{\sigma^{2}}{2}$$

This note answers one question: **where does research-lab already depend on
volatility drag, and where does it show it?**

Short answer: it depends on drag in at least four shipped tools and shows it in
**none**. In `etf-momentum-lab` both halves of the subtraction are already
computed and sitting in the same object.

---

## 2. Identities used in this note

| # | Identity | Used in |
|---|----------|---------|
| I-1 | $g \approx \mu - \sigma^{2}/2$; $\text{drag} = \mu - g \approx \sigma^{2}/2$ | RL-1, RL-2 |
| I-2 | Sharpe is defined on the **arithmetic** mean excess return (Sharpe 1966 / 1994) | RL-2 |
| I-3 | Kelly scales exposure by $1/\sigma^{2}$; vol targeting scales by $1/\sigma$. They agree only if $\mu \propto \sigma$ (constant Sharpe across regimes) | RL-3 |
| I-4 | Growth at exposure fraction $f$: $g(f) = f\mu - \tfrac{1}{2}f^{2}\sigma^{2}$ — holding $f\sigma$ constant holds the drag term constant | RL-3 |

---

## 3. Current state map

| Surface | Drag status | Evidence |
|---|---|---|
| `etf-momentum-lab.html` | Computes **both** `cagr` and `annArith` in the same metrics object — never subtracts them | [`../etf-momentum-lab.html`](../etf-momentum-lab.html) `computeMetrics()` |
| `etf-momentum-lab.html` Sharpe / Sortino | **Geometric numerator over arithmetic σ** | same file, two sites (`computeMetrics` and the strategy path) |
| `scripts/brief-refresh.mjs` → `oneYearWindowMetrics` | Same geometric-numerator Sharpe | [`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) |
| `rlexperience-adapters/strategy-research.js` → `metrics()` | **Arithmetic** Sharpe `(mean/sd)·√ANN` — the *other* definition | [`../rlexperience-adapters/strategy-research.js`](../rlexperience-adapters/strategy-research.js) |
| `volatility-sizing-lab.html` (Feature 011, `done`) | Ships a $1/\sigma$ throttle whose entire economic basis is drag; drag never named | [`../volatility-sizing-lab.html`](../volatility-sizing-lab.html) |
| `portfolio-survival-allocation-lab.html` (shipped) | **Zero** occurrences of drag / arithmetic / geometric / CAGR / Kelly / growth in 1201 lines | [`../portfolio-survival-allocation-lab.html`](../portfolio-survival-allocation-lab.html) |
| Feature 008 (owns the drag requirements) | `status: not_started` | `specs/008-portfolio-survival-and-brief-lab/state.json` |
| Shared modules `rlportfolio.js`, `rlvol.js`, `rlg.js` glossary | **No drag concept at all** | grep across `rl*.js` |
| `scripts/selftest.mjs` | No drag group — because no drag helper exists to bind | [`../scripts/selftest.mjs`](../scripts/selftest.mjs) |

---

## 4. Findings

### RL-1 · The drag number is one subtraction away and never taken — **HIGH**

`computeMetrics()` in `etf-momentum-lab.html` already produces both halves:

```js
var cagr     = years > 0 ? Math.pow(last / first, 1 / years) - 1 : winRet;  // geometric
var annVol   = stdev(r) * Math.sqrt(ANN);
var annArith = mean(r) * ANN;                                              // arithmetic
```

and returns them side by side in the same object (`{ ..., cagr: cagr, annVol: annVol, annArith: annArith, ... }`).

By identity I-1, `annArith - cagr` **is** the observed volatility drag for that
window. It is never computed.

Worse, the two are offered to the user as a **mutually exclusive dropdown
choice** in the rolling-metric selector:

```html
<option value="cagr">window CAGR</option>
<option value="arith">arithmetic mean</option>
```

So the tool presents two different "return" numbers for the same fund, invites
the user to pick one, and never explains that the difference between them is a
measurable, volatility-driven cost. This is exactly the failure mode that
Feature 008's `SCN-008-013` was written to prevent:

> *"arithmetic mean compounded CAGR and observed volatility drag are shown
> separately / And the approximation g ~= mu - sigma squared over two is
> labeled conditional with assumptions / And no conclusion states that lower
> volatility universally produces higher wealth"*

Feature 008 is `not_started`, so this is **planned-but-unbuilt**, not a
regression. But the raw material is already on the page.

---

### RL-2 · Two different Sharpe definitions coexist, differing by exactly σ/2 — **HIGH**

Three shipped surfaces, two incompatible definitions:

| Surface | Formula | Numerator |
|---|---|---|
| `etf-momentum-lab.html` (2 sites) | `(cagr - state.rf) / annVol` | **geometric** |
| `scripts/brief-refresh.mjs` `oneYearWindowMetrics` | `(cagr - riskFree) / annVol` | **geometric** |
| `rlexperience-adapters/strategy-research.js` `metrics()` | `(mean / sd) * Math.sqrt(ANN)` | **arithmetic** |

**Mechanism.** Since $\mathrm{CAGR} \approx \mu - \sigma^{2}/2$ (I-1) and Sharpe
is defined on the arithmetic mean (I-2):

$$\text{Sharpe}_{\text{geometric-numerator}}
\;\approx\; \frac{\mu - \sigma^{2}/2 - r_f}{\sigma}
\;=\; \text{Sharpe}_{\text{standard}} - \frac{\sigma}{2}$$

The volatility penalty is applied **twice** — once by the σ already in the
denominator, once by the drag hidden inside the CAGR numerator.

| Annualised vol | Geometric-numerator Sharpe is lower by |
|---|---|
| 15% | 0.075 |
| 20% | 0.10 |
| 40% | 0.20 |
| 80% | 0.40 |

**Why this is a real defect and not a style choice.**

1. **A `sharpeFloor` gate means different things on different surfaces.**
   `strategy-self-improvement-universe.json` and
   `strategy-validation-universe.json` both declare goals of the shape
   `{ targetCagr, sharpeFloor, maxDdCeiling, minTimeInMarket }`. The strategy
   family evaluates that floor with the **arithmetic** Sharpe; the ETF lab and
   the market brief report the **geometric** one. A `sharpeFloor: 1.0` is
   therefore a materially stricter bar on one surface than the other, with no
   note anywhere saying so.
2. **Cross-surface comparison is invalid.** A brief card and a strategy-lab
   result are read on the same screen and are not on the same scale.
3. **The bias is monotone in σ**, so any ranking or screen that sorts on the
   geometric variant systematically demotes higher-volatility funds beyond what
   the ratio's own definition intends.
4. **External comparability is broken** for the geometric variant — a published
   Sharpe from any provider is the arithmetic one.

**Fairness notes.**
- A deliberate "geometric Sharpe" is a defensible statistic. The defect is that
  the choice is undocumented, unlabelled, inconsistent across the repo, and
  inherits a name that means something else.
- `strategy-validation-lab.html` uses **Deflated Sharpe**, which is defined on
  the standard arithmetic Sharpe. That family feeds it the arithmetic form, so
  DSR is *internally consistent today*. It would silently become biased if the
  geometric form were ever plumbed into it.
- The comment in `strategy-research.js` — *"Byte-identical to the page's
  metrics"* — is true for the strategy pages it mirrors. The divergence is
  **between tool families**, not between an adapter and its page.

Sortino in `etf-momentum-lab` inherits the same geometric numerator. **Calmar
does not need fixing** — `cagr / |maxDD|` is the conventional Calmar definition.

---

### RL-3 · `volatility-sizing-lab` is a drag tool that never says the word — **MEDIUM-HIGH**

The tool's whole output is:

```text
multiplier = min(cap, targetVol / max(floor, forecastVol))
```

This is inverse-vol targeting. Its economic justification *is* volatility drag:
by identity I-4, holding $f\sigma$ constant holds the drag term
$\tfrac{1}{2}f^{2}\sigma^{2}$ constant, which is the entire reason the throttle
improves compounded outcomes. The tool never says this, and never shows the
growth consequence of throttling — only the multiplier.

**The unstated assumption.** Vol targeting scales by $1/\sigma$; Kelly scales by
$1/\sigma^{2}$ (I-3). The two agree **only** when $\mu \propto \sigma$, i.e.
when Sharpe is constant across volatility regimes. That is an empirical
assumption, it is contested, and the tool asserts it silently by construction.

This matters more than usual because the tool is otherwise unusually careful
about disclosure — it explicitly withholds a multiplier on
`INSUFFICIENT_HISTORY`, `MANAGED_SUPPRESSED`, and `STALE_BEYOND_POLICY`, and it
refuses to be an in-tool verdict. The one unstated assumption is the load-bearing
one.

---

### RL-4 · The shipped survival/allocation tool contains no drag content — **MEDIUM**

`portfolio-survival-allocation-lab.html` is 1201 lines and

```text
grep -ciE 'drag|arith|geometric|cagr|kelly|growth'  →  0
```

Feature 008 — the spec that owns `FR-070` (*"Volatility drag must be shown as an
observed or modeled relationship and not as an unconditional causal proof"*),
`SCN-008-013`, and scope `07-return-and-drawdown-x-ray` — is `not_started`.

So the tool whose name matches the spec shipped **without** the Risk X-Ray
content, and the spec that would add it has never been executed. Recorded as a
**planned-vs-shipped gap**, not a regression.

---

### RL-5 · No drag primitive exists in the shared module layer — **MEDIUM**

A grep for `drag|geometric|arithmetic|kelly|cagr|growthRate|compound` across all
21 `rl*.js` shared modules returns **three** hits, all false positives:
`"dragging a slider"` (`rlexperience.js`), `"Local-Equity-Led With FX Drag"`
(`rlfx.js`), and `"geometric decay toward long-run"` (`rlvol.js`, describing a
GARCH term structure).

Consequences:

- Every tool that needs drag would have to re-derive it locally — which is
  precisely how RL-2's split definition arose.
- `rlg.js` (the shared glossary that auto-tooltips terms across every tool) has
  no volatility-drag entry, so the concept cannot be explained in place.
- `scripts/selftest.mjs` has no drag group, because there is no top-level
  `function` for `extractFn` to pull. Per the repo's selftest pattern a shared
  helper must be a top-level `function` declaration (not an arrow const) to be
  testable — so the fix and its test land together.

---

## 5. Why the QF parallel matters

The sibling QuantitativeFinance repository — different language, different
authors, different route — has the **same** defect class:

| research-lab | QuantitativeFinance |
|---|---|
| `sharpe = (cagr - rf) / annVol` (RL-2) | `sharpe_ratio()` = `(annualized_return - rf) / ann_volatility`, where `annualized_return` is a compounded CAGR |
| Drag implicit in a $1/\sigma$ throttle, never named (RL-3) | Drag implicit in `log_returns`, then subtracted a **second** time in `kelly_criterion`'s growth term |
| No shared drag primitive (RL-5) | A correct `compute/ergodicity.rs` exists and is unreferenced dead code |

Two independent implementations converging on the same mistake is evidence that
this is a **conceptual gap, not a typo**. The generalisable statement:

> Drag is applied implicitly — through log returns, through CAGR numerators,
> through $1/\sigma$ throttles — and never surfaced explicitly, so it cannot be
> audited. Where it *is* written explicitly, it risks being applied twice.

That argues for **one named primitive** emitted by every return-metric surface,
rather than a series of local patches.

---

## 6. Competitive read

Bounded scan — three sources fetched 2026-07-30. Absence of an observation below
is **not** evidence of absence.

| Source | Observation | Implication for research-lab |
|---|---|---|
| **testfol.io** | Lists **"drag"** as a first-class *modelable parameter* alongside rebalancing schedules, inflation and glidepaths; ships dedicated **Sequence of Returns Risk** and **Rebalancing Sensitivity** tools | Path dependence is a product surface for a DIY-facing competitor. research-lab has neither surface. |
| **Portfolio Visualizer** | Ships **volatility targeting** as a headline tactical model | `volatility-sizing-lab`'s *rule* is table stakes; the differentiator is *explaining* it (RL-3) |
| **ergodicityeconomics.com** (LML) | Actively publishing, e.g. *"What's a growth rate, really?"* | The time-average framing is current and citable |

I did **not** observe a competitor surfacing the explicit $\mu - g = \text{drag}$
decomposition tied to a sizing recommendation. On a three-source scan that is a
weak signal, but it is consistent with this being an available differentiator
rather than a catch-up item.

---

## 7. Proposals

| # | Proposal | Impact | Effort | Addresses |
|---|---|---|---|---|
| **RL-IP-1** | Pick **one** Sharpe definition repo-wide (recommend the standard arithmetic numerator) and align `etf-momentum-lab` + `brief-refresh.mjs` to it; if a geometric variant is kept, give it a distinct label | **High** | S | RL-2 |
| **RL-IP-2** | Add a shared `volatilityDrag(returns)` helper (top-level `function`, drag `= annArith − cagr`, plus the conditional $\sigma^{2}/2$ approximation clearly labelled as conditional) with a `scripts/selftest.mjs` group | **High** | S | RL-1, RL-5 |
| **RL-IP-3** | Surface drag in `etf-momentum-lab`: show `arithmetic / CAGR / drag` **together** instead of as an either/or dropdown | **High** | S | RL-1 |
| **RL-IP-4** | Add a `rlg.js` glossary entry for volatility drag / geometric vs arithmetic return so it auto-explains everywhere | Med-High | S | RL-5 |
| **RL-IP-5** | State the $\mu \propto \sigma$ assumption in `volatility-sizing-lab`, and show the growth consequence of the throttle (the $1/\sigma$ vs $1/\sigma^{2}$ divergence) | Med-High | M | RL-3 |
| **RL-IP-6** | Execute Feature 008's `07-return-and-drawdown-x-ray` scope, or add the drag panel directly to `portfolio-survival-allocation-lab` | Med | M | RL-4 |
| **RL-IP-7** ⭐ | New tool or panel: leveraged / daily-reset path dependence (LETF decay, rebalance-frequency sensitivity) — the most legible real-world face of drag, and a surface neither repo has | Med | M | gap; testfol.io parity |

**Sequencing.** RL-IP-2 first — it creates the primitive and its selftest group.
RL-IP-1 and RL-IP-3 land together (same files). RL-IP-4 is independent and cheap.
RL-IP-5 and RL-IP-6 depend on the primitive existing. RL-IP-7 last.

**Glossary caution (carried forward from `sector-research-lab`):** `rlg.js`
auto-tooltips the word **"call"** as an options call. Avoid it in any new drag
copy or heading.

---

## 8. Known limitations of this analysis

- No tool was executed and no live fetch was performed. All findings are from
  reading source.
- The RL-2 magnitudes are **analytic derivations**, not measurements taken from
  live tool output. Confirm empirically as part of RL-IP-1.
- The competitive scan covered **three homepages**; it cannot establish what
  competitors do *not* do.
- RL-4 is a planned-vs-shipped gap, **not** a regression — Feature 008 is
  `not_started`, so nothing was removed.
- No claim is made about whether any of this has changed a real allocation
  decision.

---

## 9. Next-run checklist

1. Decide the repo-wide Sharpe convention (RL-IP-1) — this unblocks everything
   else and is the only decision that needs a human.
2. Add `volatilityDrag()` as a top-level `function` in a shared `rl*.js` module,
   and add its `scripts/selftest.mjs` group in the same change (run
   `node scripts/selftest.mjs`, full output).
3. Re-grep after landing: `grep -rioE 'sharpe\s*=' *.html rl*.js scripts/*.mjs`
   should show one definition.
4. Confirm `strategy-validation-lab`'s Deflated Sharpe is still fed the
   **arithmetic** Sharpe after any RL-IP-1 change.
5. Re-check whether Feature 008 has moved off `not_started` before duplicating
   its Risk X-Ray content in the shipped tool (RL-IP-6).

---

## 10. References

**In-repository**

- [`../etf-momentum-lab.html`](../etf-momentum-lab.html) — `computeMetrics()`, rolling-metric selector
- [`../volatility-sizing-lab.html`](../volatility-sizing-lab.html) — vol-targeting multiplier
- [`../portfolio-survival-allocation-lab.html`](../portfolio-survival-allocation-lab.html)
- [`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) — `oneYearWindowMetrics()`
- [`../rlexperience-adapters/strategy-research.js`](../rlexperience-adapters/strategy-research.js) — `metrics()`
- `specs/008-portfolio-survival-and-brief-lab/` — `FR-070`, `SCN-008-013`, scope `07-return-and-drawdown-x-ray`
- [`volatility-sizing-lab.md`](volatility-sizing-lab.md), [`etf-momentum-lab.md`](etf-momentum-lab.md) — per-tool notes
- Companion analysis: `docs/Volatility_Drag_Analysis.md` in the QuantitativeFinance repository

**External**

- Sharpe, W. F. (1966; rev. 1994). *Mutual Fund Performance* / *The Sharpe Ratio.*
- Kelly, J. L. (1956). *A New Interpretation of Information Rate.* Bell System Technical Journal.
- Peters, O. & Gell-Mann, M. (2016). *Evaluating gambles using dynamics.* Chaos.
- Peters, O. (2019). *The ergodicity problem in economics.* Nature Physics.

---

## 11. Version history

| Date | Change |
|---|---|
| 2026-07-30 | Initial cross-cutting research note. Findings RL-1..RL-5, proposals RL-IP-1..RL-IP-7. Diagnostic only — no tool, shared module, spec, or `state.json` changed. |
