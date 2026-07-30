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
| `etf-momentum-lab.html` Sharpe / Sortino | Geometric numerator over arithmetic σ — a **documented, deliberate convention** | formula in the file, convention declared in [`etf-momentum-lab.md`](etf-momentum-lab.md) § Methodology |
| `scripts/brief-refresh.mjs` → `oneYearWindowMetrics` | Same geometric-numerator Sharpe — **not documented anywhere** | [`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) |
| `rlexperience-adapters/strategy-research.js` → `metrics()` | **Arithmetic** Sharpe `(mean/sd)·√ANN` — the *other* definition | [`../rlexperience-adapters/strategy-research.js`](../rlexperience-adapters/strategy-research.js) |
| `volatility-sizing-lab.html` (Feature 011, `done`) | Ships a $1/\sigma$ throttle whose entire economic basis is drag — **assumption now disclosed**, see RL-3 | [`../volatility-sizing-lab.html`](../volatility-sizing-lab.html) `[data-sizing-assumption]` |
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

### RL-2 · Two different Sharpe definitions coexist, differing by exactly σ/2 — **MEDIUM**

> **Corrected 2026-07-30 (same day).** The first version of this note rated this
> HIGH and asserted the choice was "undocumented". That was **wrong**.
> [`etf-momentum-lab.md`](etf-momentum-lab.md) § *Methodology* states the formula
> explicitly: `Sharpe = (CAGR − rf)/vol · Sortino = (CAGR − rf)/downside-dev ·
> Calmar = CAGR/|maxDD|`. The ETF lab's geometric numerator is a **deliberate,
> documented product decision**, not an accident. What survives is narrower — the
> *divergence between tool families* and the undocumented copy in
> `brief-refresh.mjs` — so this is a coherence and labelling issue, not a bug.
> Changing the ETF lab's formula would override a documented decision and is the
> owner's call, not a fix.

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

**What is still genuinely a problem.**

1. **No document states that the two families differ.** Each convention is
   defensible on its own; nothing anywhere reconciles them. `etf-momentum-lab.md`
   documents the geometric form for its own tool and is silent on the strategy
   family; `brief-refresh.mjs` copies the geometric form with no note at all.
2. **A `sharpeFloor` gate means different things on different surfaces.**
   `strategy-self-improvement-universe.json` and
   `strategy-validation-universe.json` both declare goals of the shape
   `{ targetCagr, sharpeFloor, maxDdCeiling, minTimeInMarket }`. The strategy
   family evaluates that floor with the **arithmetic** Sharpe; the ETF lab and
   the market brief report the **geometric** one. A `sharpeFloor: 1.0` is a
   materially stricter bar on one surface than the other.
3. **Cross-surface comparison is invalid.** A brief card and a strategy-lab
   result are read on the same screen and are not on the same scale.
4. **The on-screen label is unqualified.** A user reading the tool UI — rather
   than the notes file — sees only "Sharpe", so the geometric variant is not
   distinguishable from a published Sharpe at the point of use.

**Fairness notes.**
- A deliberate "geometric Sharpe" is a defensible statistic, it is documented
  for the ETF lab, and it arguably suits a buy-and-hold ETF screen better than
  the arithmetic form. This finding is **not** a claim that the formula is wrong.
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

### RL-3 · `volatility-sizing-lab` is a drag tool that never says the word — ~~**HIGH**~~ **RESOLVED 2026-07-30**

> **Fixed in `4ae6a292`.** The Power sizing card now carries a
> `[data-sizing-assumption]` disclosure, spec 011 gained Honest Finding 13, and
> [`volatility-sizing-lab.md`](volatility-sizing-lab.md) records it as a known
> limitation (v1.1). Disclosure only — no math, policy, or computed value
> changed. Validation: `node scripts/selftest.mjs` exit 0 and
> `playwright test tests/volatility-sizing-lab.spec.mjs --project=system-chrome`
> → 16 passed. The analysis below is retained as the rationale.

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

**Verified against the spec (2026-07-30).** Feature 011's `spec.md` is
exhaustive about honesty: it declares an estimator-honesty policy, a typing
policy, a cap-and-floor policy, a conditional-sizing policy, a no-backtest-here
policy, a managed-market policy, a magnitude-only rule, and a whole *"Honest
Findings, Contradictions, And Limitations"* section covering GARCH-vs-MLE, data
reach, and manufactured low volatility.

The $\mu \propto \sigma$ assumption appears in **none** of them. The only
mentions of Kelly in the spec are in the prior-art section noting that QF already
has `f^{*} = \mu/\sigma^{2}` *and* a `vol_target` mode — the two scaling laws are
named side by side without observing that they differ, or when.

So this is not an oversight by a careless tool. It is the one economic
assumption missing from an otherwise rigorous disclosure regime, in the tool
whose entire output depends on it. That makes RL-3 the **highest-severity item
in this note that is actually a live defect** — RL-2 turned out to be a
documented convention, and RL-1/RL-4/RL-5 are gaps rather than defects.

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
| `sharpe = (cagr - rf) / annVol` (RL-2) — **documented** as the tool's convention | `sharpe_ratio()` = `(annualized_return - rf) / ann_volatility`, where `annualized_return` is a compounded CAGR. The formula is in a doc comment; the geometric/arithmetic mismatch and its comparability consequence are not called out |
| Drag implicit in a $1/\sigma$ throttle, never named (RL-3) | Drag implicit in `log_returns`, then subtracted a **second** time in `kelly_criterion`'s growth term |
| No shared drag primitive (RL-5) | A correct `compute/ergodicity.rs` exists and is unreferenced dead code |

Note the asymmetry the correction pass exposed: research-lab **documented** its
convention and QF did not, and QF's is an outright double-count rather than a
choice. The shared pattern is still real — but research-lab is the better-behaved
of the two here, and this note should not be read as accusing it of QF's bug.

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
| **RL-IP-1** | **Owner decision, not a fix.** Either (a) keep the documented geometric convention and label it at the point of use (e.g. "Sharpe (geometric)") + document the divergence + add the missing note to `brief-refresh.mjs`, or (b) standardise repo-wide on the arithmetic numerator. Do **not** silently change `etf-momentum-lab` — its formula is a declared product decision | Med | S | RL-2 |
| **RL-IP-2** | Add a shared `volatilityDrag(returns)` helper (top-level `function`, drag `= annArith − cagr`, plus the conditional $\sigma^{2}/2$ approximation clearly labelled as conditional) with a `scripts/selftest.mjs` group | **High** | S | RL-1, RL-5 |
| **RL-IP-3** | Surface drag in `etf-momentum-lab`: show `arithmetic / CAGR / drag` **together** instead of as an either/or dropdown | **High** | S | RL-1 |
| **RL-IP-4** | Add a `rlg.js` glossary entry for volatility drag / geometric vs arithmetic return so it auto-explains everywhere | Med-High | S | RL-5 |
| **RL-IP-5** | ~~State the $\mu \propto \sigma$ assumption in `volatility-sizing-lab`~~ — **DONE `4ae6a292`**. Remaining optional extension: also *show* the growth consequence of the throttle (the $1/\sigma$ vs $1/\sigma^{2}$ divergence), which needs the RL-IP-2 primitive | Med-High | M | RL-3 |
| **RL-IP-6** | Execute Feature 008's `07-return-and-drawdown-x-ray` scope, or add the drag panel directly to `portfolio-survival-allocation-lab` | Med | M | RL-4 |
| **RL-IP-7** ⭐ | New tool or panel: leveraged / daily-reset path dependence (LETF decay, rebalance-frequency sensitivity) — the most legible real-world face of drag, and a surface neither repo has | Med | M | gap; testfol.io parity |

**Sequencing.** ~~RL-IP-5 first~~ — **done** (`4ae6a292`); it was the only live
defect and was a disclosure change, not a numerical one. Next is RL-IP-2 (creates
the shared primitive and its selftest group), then RL-IP-3 and RL-IP-4. RL-IP-1
waits on the owner decision. RL-IP-6 depends on the primitive existing.
RL-IP-7 last.

**How RL-IP-5 landed — reusable pattern.** Feature 011 is certified `done`, so it
was not a drive-by HTML edit: the tool's Power card, the spec's Honest Findings,
and the tool notes changed together. Two test constraints shaped the wording and
will shape any follow-up — `tests/volatility-sizing-lab.spec.mjs` asserts
`#simpleView` contains neither `sharpe` nor `cagr` (BS-007) and checks both views
against a directional-word regex (BS-005), and the estimator test substring-bans
`mle`, `institutional`, and `maximum likelihood` from Power. Note `mle` is an
unanchored substring check, so ordinary words must be scanned for it.

**Glossary caution (carried forward from `sector-research-lab`):** `rlg.js`
auto-tooltips the word **"call"** as an options call. Avoid it in any new drag
copy or heading.

---

## 8. Known limitations of this analysis

- No tool was executed and no live fetch was performed. All findings are from
  reading source.
- **RL-2 was overstated in the first version of this note** and is corrected
  above. Treat that as the calibration signal for the rest: claims of the form
  "X is undocumented" in this note were made from source reading, and the
  per-tool notes files and specs are a second documentation layer that must be
  checked before acting. RL-3 has since been checked against Feature 011's
  `spec.md`; RL-1, RL-4 and RL-5 are absence-of-code claims verified by grep
  rather than absence-of-documentation claims.
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

1. ~~Disclose the μ∝σ assumption in `volatility-sizing-lab` (RL-IP-5)~~ —
   **done `4ae6a292`**.
2. Decide the repo-wide Sharpe convention (RL-IP-1) — an owner product decision,
   **not** a bug fix. `etf-momentum-lab`'s geometric form is documented and
   deliberate; do not change it silently. This is now the only open decision
   that needs a human.
3. Add `volatilityDrag()` as a top-level `function` in a shared `rl*.js` module,
   and add its `scripts/selftest.mjs` group in the same change (run
   `node scripts/selftest.mjs`, full output).
4. Re-grep after landing: `grep -rioE 'sharpe\s*=' *.html rl*.js scripts/*.mjs`
   should show one definition per declared convention, each documented.
5. Confirm `strategy-validation-lab`'s Deflated Sharpe is still fed the
   **arithmetic** Sharpe after any RL-IP-1 change.
6. Re-check whether Feature 008 has moved off `not_started` before duplicating
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
| 2026-07-30 | **Correction pass.** RL-2 downgraded HIGH → MEDIUM: `etf-momentum-lab.md` § Methodology documents `Sharpe = (CAGR − rf)/vol`, so the geometric numerator is a deliberate documented convention and the original "undocumented" claim was wrong. RL-IP-1 reframed from "align to arithmetic" to an owner decision. RL-3 upgraded MEDIUM-HIGH → HIGH after verifying against Feature 011's `spec.md`: nine explicit honesty policies plus a limitations section, none of which state the μ∝σ assumption. RL-3 became the only live defect in this note; RL-IP-5 moved to the front of the sequence with its cross-artifact scope and test constraints recorded. |
| 2026-07-30 | **RL-3 resolved** in `4ae6a292`. `volatility-sizing-lab` now discloses the assumption behind its $1/\sigma$ throttle via `[data-sizing-assumption]` in the Power sizing card, spec 011 carries it as Honest Finding 13, and the tool notes record it as a known limitation (v1.1). Disclosure only. `node scripts/selftest.mjs` exit 0; `playwright … --project=system-chrome` 16 passed. No live defect remains open in this note — RL-IP-1 is an owner decision and RL-1 / RL-4 / RL-5 are gaps rather than defects. |
