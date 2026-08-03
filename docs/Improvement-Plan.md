# Research Lab — Improvement Plan

**Date:** 2026-08-02 · **Baseline:** HEAD `64ff26e6` · **Status:** authoritative delivery plan
**Supersedes the roadmap in:** [`Product-Review-and-Roadmap.md`](Product-Review-and-Roadmap.md) §11 (Steps 1–9, all shipped)
**Related:** [`Product-Principles.md`](Product-Principles.md) · [`DomainModel.md`](DomainModel.md) · [`../notes/market-brief.md`](../notes/market-brief.md)

Every claim below is measured at HEAD. Every step carries one acceptance metric and the exact command that
proves it. No step depends on a later one.

---

## 1. Premises — agreed, corrected, and added

The attached fifth-pass review proposed a set of premises. Re-measured at HEAD, they resolve as follows.

### 1.1 Agreed and now **proven** (the nine-step roadmap landed)

| Premise | Verdict at HEAD | Proof |
|---|---|---|
| Model-authored text must be escaped at every sink | **Holds. Done.** | `grep` for unescaped LLM-content sinks → 0 hits; 26/26 pages carry a CSP |
| The brief must draw evidence from the tools that own the math | **Holds. Done to target.** | `toolCoverage`: 11 `analyzed` (was 5) |
| A claim that is never scored is opinion with extra steps | **Holds. Done.** | 180 closed events; `market-brief.scorecard.json` renders above the feed |
| Shipped-but-unreachable assets are a defect | **Holds. Done.** | `site-exclusions.json` makes each an accounted decision with a recorded reason |
| One metric definition; bounded payload; CI enforces everything | **Holds. Done.** | `rlmetrics.js`; first load 159 KB vs 200 KB budget; CI runs the full selftest **and** full Playwright suite, blocking |

### 1.2 Agreed but **wrong in emphasis** — corrected

| Original premise | Correction | Evidence |
|---|---|---|
| “Tool count is not the constraint; integration is” | Right, but incomplete. **Reader comprehension is the binding constraint.** Integration is now largely done and the product is still unusable. | §2 |
| “≥ 11/23 tools contributing rich reads” is a sufficient coverage target | It measures the **market** axis only. It says nothing about whether the tickers the user actually watches were analysed. | §4 |
| “Close events exist, rising daily” is a sufficient ledger target | 180 closed, but **150 (83%) are `not-evaluable`**. A close event is not a score. | §2 · D5 was satisfiable without producing knowledge |
| “Selftest + Playwright in CI” is a sufficient quality target | Both run and both are blocking — **and the browser suite asserts the placeholder copy as correct.** Execution was measured; usefulness was not. | §2 N2 |

### 1.3 **Missing** premise — the one the whole product turns on

> **A surface that a reader cannot act on has not shipped, however green its tests are.**

The nine-step roadmap optimised for *contract conformance*: escaped, bounded, wired, asserted, deployed. All
true. None of it required the product to be legible. §2 is the direct consequence.

---

## 2. The frontier — measured defects at HEAD

These are new. None appear in the fifth-pass register, because each fix exposed the next layer.

### N1 · The four-view shell renders framework bookkeeping as product copy — **critical, product-wide**

Measured by rendering **every registered tool in a real browser** and reading the visible text of every view
(`node scripts/audit-reader-legibility.mjs`, added by this plan):

```
pages audited: 23   with view tabs: 23   errored: 0   TOTAL LEAKS: 157   CLEAN PAGES: 0

  22  dependency-slug     "dependency-pending", "feature-002"
  20  gate-code           "E012-DEPENDENCY"
  20  withheld-list       "Withheld:"
  20  acceptance-gate     "Acceptance gate:"
  16  scope-number        "Scope 01", "Scope 04", "Scope 08", "Scope 11", "Scope 12"
  13  compute-digest      "sha256:46674ec4367016cd…"
  10  generic-heading     "Simple model result"
   8  contract-version    "options-anomaly/v1", "session-auction/v1", "palm-springs/v1"
   3  integration-state   "not-integrated", "coverage-only"
```

**This is not a sample. It is all 23 tools, and not one is clean.** Every ordinary tool exposes
`Simple | Power | Brief | Journey | Portfolio`; `market-brief` exposes `Brief | Journey | Portfolio | Red Alert`.
The Brief view alone leaks the governance box on **20 of 23** tools.

| Surface | Source | What the reader sees |
|---|---|---|
| Simple heading | `rlexperience.js` `renderSimpleProjectionInternal` | the constant **“Simple model result”** — on 10 tools |
| Simple value | same, `projection.valueText + unit` | raw contract ids, e.g. **“bills-cash leads sleeve outcomes total-return-decimal”** |
| Simple footer | `rlexperience.js:1302` | **“Last valid model run preserved: sha256:…”** — on 13 page-views |
| Simple limitation | model contract `limitations[]` | **“Scope 01 validates declaration metadata only…”** |
| Brief / Portfolio | `rlviews.js` `dependencyMarkup` + `rlexperience.js` `projectDependencyGateInternal` | **“Withheld: …”**, **“Acceptance gate: status=done; certification=done; milestones=all-4-required”**, **“Gate: E012-DEPENDENCY:feature-002”** |
| Brief body | `rlbrief.js:541`, `rlbrief.js:1477` | **“Coverage only — Not run this cycle”**, **“No recommendation - not-integrated”** |
| Red Alert | `rlviews.js` `buildPanels` | **“dependency-pending”**, **“Scope 12”** |

Two aggravating facts:

1. **The gate is satisfied and still renders as an obstruction.** `tool-experience.gates.json` records
   `FEATURE002` as `status: done`, `certification: done`, all 4 milestones. The panel correctly says
   *“Dependency available”* — then prints a `Withheld:` list underneath it anyway.
2. **This violates the repository's own written paradigm.** `.github/copilot-instructions.md` requires Simple to be
   *“a high-level, decision-first cockpit: one clear verdict / read”*. A constant heading plus a hash plus a
   scope citation is none of those things.

> **Method note.** This defect class was invisible to the original review because that review measured the
> product the same way the test suite does — greps, counts and JSON contracts — and never rendered a page.
> `scripts/audit-reader-legibility.mjs` exists so that can never recur: it is the D13 enforcement mechanism.

### N2 · The browser suite asserts the defect — **critical**

```
tests/simple-model-adapters-macro-fundamental.spec.mjs:574   expect(result.baseline.heading).toBe('Simple model result');
tests/simple-model-adapters-market.spec.mjs:665              expect(result.baseline.heading).toBe('Simple model result');
tests/simple-model-adapters-strategy-property.spec.mjs:546   expect(result.baseline.heading).toBe('Simple model result');
tests/simple-models.spec.mjs:236                             expect(result.hostText).toContain('Last valid model run preserved');
```

Four specs **require** the placeholder copy — the last one requires the `sha256:` provenance line to be
*present*. Correcting the product fails the suite. Per the repo's own spec-first doctrine — *tests validate
specifications, never implementations* — these assertions encode an implementation accident, not the
Simple/Power specification, and must be corrected **before** the renderer.

This is why 1,138 selftest assertions and 33 blocking Playwright specs coexist with 157 reader-visible leaks:
**nothing in the suite tests reader value.**

### N3 · The universal-tooltip rule is unenforced in the shell — **high**

`.github/copilot-instructions.md` requires *every* term, KPI, value and control to carry a contextual tooltip
saying both what it is and what the current reading means. A search of `rlexperience.js` for control-level
`title` / `data-tip` wiring returns **zero hits** — the shell that renders the parameter levers for every tool
attaches no tooltips. Observed on `bond-regime-lab`: of 8 levers, only *Horizon* and *Convexity* carry the
glossary underline, and those come from `rlg.js` term matching, not from the control renderer.

### N4 · The public watchlist matrix has zero covered cells — **critical**

`market-brief.html` composes the matrix as:

```js
RLMARKETACTIONCENTER.composePublicMatrix({
  matrixId: "market-action-public-matrix/live", cutoffAt: cutoff(),
  generationRef: "legacy-market-brief-payload", domainMapVersion: "matrix-domain-map/v1",
  watchlist: { items: items }, applicability: applicabilityFor(items)
})
```

**`ownerReads` is never passed.** `rlmarketaction.js` therefore takes its documented fallback for every cell:

```js
/* applicable but no current owner read: EXPLICITLY unavailable, never neutral. */
return { state: "unavailable", gapReason: "no current public owner read for this ticker in this domain", … }
```

4 watchlist tickers × 7 domains = 28 cells; 24 applicable; **0 covered**. The contract, the domain taxonomy,
the owner-precedence input, the privacy assertion and the validator all exist and are tested. The **producer**
does not. The Portfolio view is a grid of the word `unavailable`.

### N5 · 83% of the published track record is not machine-evaluable — **critical**

```
30-day window   closed 180   satisfied 16   invalidated 14   notEvaluable 150   hitRate 0.5333
  by horizon    swing      104/106 not-evaluable (98.1%)
                tactical    39/40  not-evaluable (97.5%)
                structural   7/34  not-evaluable (20.6%)
```

Root cause, from the events themselves:

```
105 × evaluabilityReason = "no-attributable-price-level"
 53 × evaluabilityReason = "no-attributable-invalidation-level"
```

The Tier-B narrative lane authors recommendations in prose and the evaluator cannot find a level to check. The
scorecard is honest about this — it publishes `notEvaluableShare: 0.8333` — which is exactly why it is
actionable: **the moat is measured, and the measurement says it is 83% blind.**

### N6 · Red Alert and Portfolio panels are constants — **high**

```js
// rlviews.js buildPanels()
} else if (mode === "portfolio") {
  panel.innerHTML = '<h2>Portfolio</h2><p>Public watchlist research remains available…</p>' + dependencyMarkup("FEATURE008");
} else if (mode === "red-alert") {
  panel.innerHTML = '<h2>Red Alert</h2><p>No current evidence-qualified alert is published by this shell foundation.</p>';
}
```

Red Alert is hardcoded prose on every page — it never consults the alert engine that exists in
`rlmarketaction.js`. Portfolio is a stub plus a governance box; only `market-brief.html` prepends real matrix
content over it, and that content is the empty grid of N4.

### N7 · Five tools remain `stale` in the brief — **medium**

`ai-capex-strategy-lab`, `bond-regime-lab`, `options-flow-feed-lab`, `smart-money-flow-lab`,
`technical-analysis-decision-lab`. Each shows *“Coverage only — Not run this cycle”* rather than a read.

### ~~N8 · Journeys are reachable from 2 of 25 pages~~ — **WITHDRAWN, never a defect**

> This entry was **my measurement error**, not a product gap. I grepped the HTML for a static
> `<script src="rlviews.js">` tag, found it on 2 pages, and concluded the journey panel shipped on 2 of 25.
> But [`../rlapp.js`](../rlapp.js) line 339 loads that shell *dynamically* via `ensureSharedScript`, so the
> panel exists on pages whose HTML never names the file.
>
> Browser-measured truth (`node scripts/audit-reader-legibility.mjs`): **23 of 23** tool pages expose
> `Simple · Power · Brief · Journey`, each rendering `journeyToolRows=1 journeyGoals=2`. Reach was always 100%.
>
> The real defect in this area was **N10** below — every page showed *all* tools' journeys. See Step 8 (void)
> and anti-drift **D17**.

### N10 · Every view was global; none was scoped to the tool the reader is in — **high** · *journey part delivered*

**The rule.** A tool page shows **that tool's** journeys, brief and actions. The Market Action Center is the
only **global** surface. Guidance that lists everything is a directory.

**Measured before the fix** — `node scripts/audit-reader-legibility.mjs`:

```
every one of the 23 pages:  journeyToolRows=23   journeyGoals=48
```

All 23 pages — including all 22 tool pages — rendered the complete 23-tool, 48-goal inventory. A reader on
`bond-regime-lab` had to scan 23 groups to reach the 2 that belong to that page.

**Measured after the fix:**

```
market-brief (Action Center):  journeyToolRows=23  journeyGoals=48   <- global, correct
every tool page:              journeyToolRows=1   journeyGoals=2    <- scoped, correct
```

**Scenario reconciliation.** `SCN-012-032` requires that *every registered tool resolves concrete goals* —
registry completeness. It does **not** require every page to list every tool. Completeness is still proven
page-free by `tests/journey-definitions.functional.mjs` and, in the browser, on the Center where global is the
specification. The two browser assertions that tested completeness from a *tool* page were re-pointed at the
Center, and a new assertion pins tool-page scoping. No scenario was weakened.

**Outstanding.** The same rule must reach **briefs** and **actions**: a tool page shows its own brief and its
own actions; the Center aggregates. The audit's `briefSections` / `actionRows` probes currently read `0`
because the brief mount uses `.rlbrief-mount` / `data-rlbrief-part` rather than the selectors probed — that
measurement is **not yet trustworthy and is not claimed**. Correcting the probe is the first task of Step 2b.

---

### N9 · Superseded bug still open — **medium**

`BUG-001-central-provider-credential-security` remains `in_progress` at High severity although
`BUG-002-two-tier-provider-access` is `done` and explicitly reverses its Tier-2 clause. Carried from the
fifth-pass register (§5.8) unremediated.

---

## 3. The unifying thesis

> **Every surface — tool, brief, journey — should produce the same object: a legible, level-bearing,
> machine-checkable claim about a ticker the reader actually watches. The ledger scores that object. The
> scorecard publishes the score.**

Read against the frontier this is not an aspiration, it is a diagnosis:

- N1/N2/N3 — the object is **not legible**.
- N4 — the object is **not about the reader's tickers**.
- N5 — the object is **not machine-checkable**.
- N6/N8 — the object has **nowhere to surface**.

One object, four failures. That is why the fixes compose instead of competing.

---

## 4. The two-axis coverage model

The product conflates two different coverage questions and only answers one.

| | Axis A — **breadth** (market) | Axis B — **depth** (watchlist) |
|---|---|---|
| Question | *What is the market doing?* | *What are MY tickers doing?* |
| Input | each tool's own universe (`*-universe.json`) | `watchlist.json` |
| Output | brief attention cards | per-ticker matrix cells + per-ticker calls |
| Status | **built** — 11/23 tools | **absent** — 0/24 cells |

Axis A is supply-side breadth: sector ETFs, global/regional ETFs, commodities, bonds, AI-capex names — the
tickers a tool needs to say something about *the market*. It stays exactly as it is; it is working.

Axis B is demand-side depth: the tickers the reader declared. **It is additive, never a replacement.** A tool
keeps its own universe and additionally answers for each applicable watchlist ticker.

### Routing rule — which tool answers for which ticker

Routing is already half-declared and needs no invention:

- `tools.json` → `experience.matrixDomains` already assigns each tool the domains it owns
  (`fundamentals`, `options`, `technical`, `macro-rotation`, `volatility`, `catalyst`, `gaps`).
- `watchlist.json` → each item already carries a `type` (`etf`, `stock`).
- `market-brief.html` → `applicabilityFor()` already encodes the one type rule that exists:
  single-company `fundamentals` does not apply to a broad ETF.

What is missing is that this lives inline in a page instead of in a declared, testable map, and that nothing
consumes it to actually run a tool against a ticker.

### Feasibility — what is deliverable now, from committed data

| Domain | Applicable tickers | Data at HEAD | Deliverable now |
|---|---|---|---|
| `technical` | QQQ SPMO VGT MSFT | bars: **4/4** | **4 cells** |
| `macro-rotation` | QQQ SPMO VGT MSFT | bars: **4/4** | **4 cells** |
| `volatility` | QQQ SPMO VGT MSFT | bars: **4/4** | **4 cells** |
| `options` | QQQ SPMO VGT MSFT | chains: **QQQ, MSFT** | **2 cells** + 2 honest `unavailable` |
| `fundamentals` | MSFT only (`type: stock`) | company data | **1 cell** + 3 `not-applicable` |
| `catalyst` | QQQ SPMO VGT MSFT | no event source | 4 honest `unavailable` |
| `gaps` | derived | — | derived |

**15 of 24 applicable cells are deliverable from data already committed**, with the remaining 9 rendering as
*honest, reasoned* `unavailable` rather than the current undifferentiated blank. That is the measurable
benefit of Step 4.

---

## 5. Delivery steps

Ordered so that each ships reader-visible value alone, is independently revertable, and ends with a command
that proves its benefit. Effort is *focused working time* and is explicitly **derived judgement**.

---

### Step 1 · Correct the tests that pin the placeholder — **0.5 d** · ⚠ blocks Step 2

**Why first.** Three specs assert `heading === 'Simple model result'`. Under the repo's spec-first doctrine a
test encodes the specification; these encode an implementation accident and must be corrected before the
renderer, or Step 2 cannot land.

**Change**
1. Replace the four assertions with assertions drawn from the actual specification: the heading is the
   **tool's own verdict**, is not the generic contract label, differs between two tools, and provenance is
   asserted in **Power**, not Simple.
2. **Done already:** `scripts/audit-reader-legibility.mjs` renders every registered tool in a real browser,
   activates every view, and fails on any framework vocabulary in reader-visible copy. It is the D13 gate.
3. Wire the audit into `scripts/selftest.mjs` and the CI `verify` job so a regression cannot land.

**Acceptance metric** — the audit exists, is non-vacuous, and **fails against HEAD** with a specific count.

```bash
node scripts/audit-reader-legibility.mjs
# measured at HEAD: 157 leaks across 23/23 tools, exit 1  — the assertion bites
node scripts/selftest.mjs
```

**Done when** the four pinning assertions encode the specification instead of the placeholder, the audit is
wired into selftest and CI, and every other spec still passes.

---

### Step 2 · Make the Simple view speak to a human — **1.5 d** · 🔴 highest perceived value

**Change**
1. `renderSimpleProjectionInternal` stops printing `lastValidComputeIdentity`. Preserved-run provenance moves
   to the Power evidence disclosure where provenance belongs.
2. Heading becomes the tool's own verdict, supplied by the model contract, not the constant string.
3. `valueText`/`unit` render through a declared human label; a contract id never reaches the reader.
4. `limitations[]` copy is rewritten to describe the *model's* limit in plain language. No scope numbers, no
   framework nouns.
5. Every parameter lever gets the contextual tooltip the house rule already requires (N3) — what it is **and**
   what the current setting implies.

**Acceptance metric** — Simple-view leaks fall to **0** across all 23 tools, and headings are distinct per tool.

```bash
node scripts/audit-reader-legibility.mjs
node scripts/selftest.mjs
```

**Done when** no Simple panel contains `sha256:`, `E012-`, `Scope `, or a raw contract id, every lever has a
contextual tooltip, and no two tools share a heading.

---

### Step 3 · Stop rendering governance to readers — **0.5 d**

**Change**
1. `dependencyMarkup()` renders **nothing** when the gate is satisfied. A satisfied gate is not news.
2. When genuinely pending, it renders one plain sentence naming the missing capability in product language —
   no `Withheld:` list, no `Acceptance gate:` predicate, no `E012-DEPENDENCY:` code, no observed-status dump.
3. The full projection stays available under Power as an evidence disclosure, which is its correct home.
4. `rlbrief.js` state labels become reader language: *“Coverage only”* → what the reader should do instead;
   *“No recommendation - not-integrated”* → why, in one clause.

**Acceptance metric** — total audit leaks fall from **157 to 0**; the `gate-code`, `withheld-list`,
`acceptance-gate`, `dependency-slug` and `scope-number` classes reach zero.

```bash
node scripts/audit-reader-legibility.mjs
node scripts/selftest.mjs
```

**Done when** `E012-`, `Withheld:`, `Acceptance gate:`, `dependency-pending:` and `feature-00N` appear in zero
default-view panels across all 25 pages, and the pending case still states the limitation truthfully.

---

### Step 4 · Route the watchlist into the tools — **2–3 d** · ⚠ the coverage loop

**Change**
1. **Declare the routing map.** Lift `applicabilityFor()` out of `market-brief.html` into a declared,
   registry-derived map: `type → domain → applicable | not-applicable`, and `domain → ordered owner tools`
   derived from `tools.json` `experience.matrixDomains`. Selftest asserts every domain has ≥1 owner and every
   watchlist `type` resolves for all 7 domains.
2. **Produce per-ticker owner reads** in Tier-A, reusing the *same* adapters that already build the 11
   market-level reads — `rlexperience-adapters/market-structure.js`, `options.js`, `macro-rotation.js` — run
   per watchlist ticker instead of per universe. Emit `market-brief.owner-reads.json` keyed
   `[toolId][ticker] = { state, read, asOf, provenance, levels, ownerDeepLink }`.
3. **Feed the matrix.** `market-brief.html` passes `ownerReads` and `ownerPrecedence` into
   `composePublicMatrix`. Missing data must yield a *reasoned* `unavailable` naming what is absent — never a
   fabricated read.

**Acceptance metric** — covered cells rise from **0 to ≥ 15**.

```bash
node scripts/brief-refresh.mjs --dry-run
jq -r '.scopeSummary.coveredCellCount, .scopeSummary.gapCount' market-brief.owner-reads.json
npx --no-install playwright test tests/public-watchlist-matrix.spec.mjs --config=playwright.config.mjs --project=system-chrome
node scripts/selftest.mjs
```

**Done when** `coveredCellCount ≥ 15`, every remaining gap carries a specific reason, and no cell is covered
without a real underlying read.

---

### Step 5 · Make Red Alert and Portfolio real — **1 d** · depends on Step 4

**Change**
1. Red Alert consults the alert engine already in `rlmarketaction.js` instead of printing a constant, and
   states its quorum honestly when nothing qualifies (*“no alert clears 2 independent origins today”*).
2. Portfolio renders the Step-4 matrix as its primary content on every page carrying the four-view shell, not
   only on `market-brief.html`.

**Acceptance metric** — both panels are data-derived; the constant strings are gone.

```bash
npx --no-install playwright test tests/market-action-center.spec.mjs --config=playwright.config.mjs --project=system-chrome
node scripts/selftest.mjs
```

**Done when** neither panel contains its hardcoded sentence and both change with the underlying data.

---

### Step 6 · Recommendations born evaluable — **2 d** · depends on Step 4 · ⚠ the moat

**Why it follows Step 4.** A per-ticker owner read already carries levels — a gamma flip, a wall, a swing
pivot, a regime band. A claim derived from that read inherits a machine-checkable trigger and invalidation
**by construction**, which is precisely what the 158 not-evaluable proposals lack.

**Change**
1. Recommendations derive their `levels`, `trigger` and `invalidation` from the owner read that motivated them
   rather than from prose.
2. The proposal path **refuses** to emit `evaluability: not-evaluable` for `swing` and `tactical` horizons —
   if no level can be attributed, no call is published. An unscoreable tactical call is not a call.
3. The Tier-B narrative lane may still add reasoning, but may not originate a level.

**Acceptance metric** — `notEvaluableShare` falls from **0.8333 to ≤ 0.25**, and no NEW proposal carries
`no-attributable-price-level`.

```bash
node scripts/evaluate-recommendations.mjs --dry-run
node scripts/build-scorecard.mjs
jq -r '.windows["30d"] | {closed, resolved, notEvaluableShare, hitRate}' market-brief.scorecard.json
node scripts/selftest.mjs
```

**Done when** `notEvaluableShare ≤ 0.25`, `resolved` rises materially, and the swing/tactical horizons stop
reporting `insufficientSample`.

---

### Step 7 · Close the last five stale tools — **1.5 d**

**Change** — one Tier-A read builder per tool, following the existing `buildEtfToolRead` template, shipped as
five independently revertable commits: `technical-analysis-decision-lab` → `bond-regime-lab` →
`options-flow-feed-lab` → `ai-capex-strategy-lab` → `smart-money-flow-lab`. Each fails honestly with a named
reason when its data is absent. `smart-money-flow-lab` uses real filing data or the tool is retired — its
synthetic filings are beaten by a competitor's free tier.

**Acceptance metric** — `analyzed` rises **11 → 16**, `stale` falls **5 → 0**.

```bash
node scripts/brief-refresh.mjs --dry-run
jq -r '.toolCoverage[] | [.status, .id] | @tsv' market-brief.payload.json | sort | uniq -c
node scripts/selftest.mjs
```

**Done when** no tool with data on disk reports `stale`.

---

### Step 8 · A journey entry on every tool page — ~~1 d~~ **VOID — premise was a measurement error**

> **Withdrawn, not delivered-by-luck.** This step existed because I measured journey reach by grepping the HTML
> for a static `<script src="rlviews.js">` tag and found **2 of 25** pages. That measurement was wrong.
> [`../rlapp.js`](../rlapp.js) line 339 loads the view shell *dynamically* through `ensureSharedScript`, so the
> `[data-rljourney-mount]` anchor is created at runtime on pages whose HTML never names the file. A static grep
> is blind to that.
>
> Re-measured in a real browser via
> [`../scripts/audit-reader-legibility.mjs`](../scripts/audit-reader-legibility.mjs):
>
> ```
> pages audited: 23   with view tabs: 23
> every tool page   views=[Simple|Power|Brief|Journey]  journeyToolRows=1 journeyGoals=2
> market-brief      + [Portfolio|Red Alert]             journeyToolRows=23 journeyGoals=48
> ```
>
> Reach was already **23/23**. The acceptance metric `2/25 → 25/25` was therefore unachievable *and* meaningless:
> it measured a quantity that was never 2.
>
> The **real** defect in this area was different and is already fixed (`e0bed8cd`): every page rendered *all 23
> tools'* journeys, so a reader on one tool got the whole catalogue instead of that tool's two goals. Scoping
> now holds — tool pages show their own, the Action Center shows all.
>
> **Retained obligation.** One clause of the original "done when" is still live and moves to Step 9's paperwork
> sweep: *no test may inject its own mount anchor*. `tests/journey-mobile.spec.mjs` still does, which means it
> proves the controller works but not that the page ships the anchor. That is a test-integrity item (**D14**),
> not a product gap.

**Lesson recorded as anti-drift D17.** A reach/coverage claim about a browser product must be measured **in a
browser**. Static grep may be used to *locate* code, never to assert what a reader can reach. This document
asserted a wrong number twice before the browser audit contradicted it.

---

### Step 9 · Reconcile the paperwork — **1 d**

**Change** — close or withdraw `BUG-001` recording that `BUG-002` superseded its Tier-2 clause, retaining only
genuinely outstanding items. Reconcile every `in_progress` / `blocked` spec whose code has shipped to its
correct terminal status, or record a specific, operator-actionable blocker. Per anti-drift **D10**, no spec may
block on another spec's *status*.

**Acceptance metric** — zero specs whose shipped code contradicts their recorded status.

```bash
for f in specs/*/state.json specs/_bugs/*/state.json; do printf '%-72s %s\n' "$f" "$(jq -r .status "$f")"; done
node scripts/selftest.mjs
```

**Done when** `BUG-001` is terminal and every remaining non-terminal spec names a real missing capability.

---

### Sequencing

```
1  Correct the pinning tests ....... 0.5d   ✅ done  af1a6375..00cee721
2  Simple speaks to a human ........ 1.5d   ✅ done  00cee721  leaks 66 -> 37
3  Governance out of product copy .. 0.5d   ✅ done  b4bcc7c8  leaks 157 -> 0
4  Watchlist routed into tools ..... 2-3d   ✅ af221a89  owned 0 -> 28, covered 0 -> 14/28
5  Red Alert + Portfolio real ...... 1d     ✅ done  86254c09  constant -> computed coverage
6  Recommendations born evaluable .. 2d     ◐ 32692325  live payload 40% -> 80% scoreable
7  Last five stale tools ........... 1.5d   analyzed 11 -> 16
8  Journey on every tool page ...... ----   ✖ VOID — premise was a measurement error (D17)
9  Paperwork reconciled ............ 1d     zero status/code contradictions
```

Steps 1→2→3 are the legibility track. Step 4 is the coverage track and gates 5 and 6. Steps 7 and 9 are
independent. Step 8 is withdrawn — journey reach was already 23/23; the genuine defect there (every page
showing every tool's journeys) was N10 and is fixed.

**Reader legibility is closed.** `node scripts/audit-reader-legibility.mjs` — *pages audited: 23, with view tabs: 23,
errored: 0, **total leaks: 0***. Every registered tool renders `Simple · Power · Brief · Journey` with no framework
vocabulary in reader-visible copy, down from 157 occurrences across 23 of 23 tools at `af1a6375`.

Two of the last three were **authored content, not renderer bugs**, and were fixed at the authoring source as
well as in the artifact — `scripts/brief-narrative-parallel.mjs` now carries an explicit vocabulary rule mapping
each status code to plain words. Without that the 4×/day cron would have re-emitted the codes within hours and
silently undone the fix.

| Was | Now |
|---|---|
| `Simple model result` (every tool, every state) | the verdict itself, or `Partial result` / `Result may be out of date` / `No result yet` |
| `Owner model adapter required: simple-adapter/technical-five-gate/v1` | "This tool's own model is not loaded, so there is no result to show." |
| `Withheld: dynamic-tool-brief-v2, live-web-evidence, public-alert-publication` | "Not in this view yet: …" in words |
| `Gate: E012-DEPENDENCY:…` / `Acceptance gate:…` | removed from reader copy; still enforced |
| `dependency-pending:feature-002` | "not available in this view yet" (code kept as a data attribute) |
| `journey/market-action/prepare-session/v1` | "Prepare the next market session" |
| `returned coverage-only` in brief prose | `returned no call` |

**Do Step 7 next** (the five tools still stale in the brief), then Step 9 (paperwork), then reconcile
`Product-Review-and-Roadmap.md` sections 5, 10.2, 11 and 14 against its corrected sections 1 and 2.

### Suite intermittency — measured, NOT a repo defect

Four clean full-suite runs of an identical tree gave a **shifting** failure set: one run failed
`red-alert.spec.mjs:284`, another failed a different pair including
`technical-analysis-decision-lab.spec.mjs:130`, and another exited **0** with everything green. Each failure was
a page-readiness timeout, and each failing spec passes in isolation (`red-alert` 4/4 alone).

The obvious "fix" is to widen the 15 s readiness budget. **Do not.** Measured on the Action Center, the exact
condition those helpers wait for — shell `ready` + `RLMARKETACTIONCENTER` + the `red-alert` panel — resolves in:

    run 1: 551 ms      run 2: 388 ms      run 3: 361 ms      (budget 15 000 ms)

That is 27–40x headroom. A gate with that much slack does not expire because the page is *slow*; it expires
because the worker was starved or stalled. Widening it would convert a visible environmental problem into an
invisible one and would make the suite slower to fail when something is genuinely wrong.

These runs executed on a workstation concurrently running builds and greps in several other repositories, which
is the most probable cause. **Before treating this as a repo defect, re-run the suite on an otherwise idle
machine.** If it still flakes there, investigate worker isolation (per-worker static server) — not the timeout.
Recorded as **D18**.

---

### Step 4 — coverage is bounded by evidence, not by effort

`covered 0 → 14 of 28` public-matrix cells, each computed from committed same-origin data through
`scripts/build-owner-reads.mjs`. The original target was ≥15; the real ceiling is what the repo can honestly
compute, and 14 is that ceiling today.

| Domain | Owner | Cells | Read |
|---|---|---|---|
| volatility | `volatility-sizing-lab` | 4 | realized 63-session annualized volatility |
| technical | `swing-structure-lab` | 4 | 20/50/200 stack + distance from the 200-session average |
| macro-rotation | `etf-momentum-lab` | 4 | trailing 63-session return relative to `SPY`, in points |
| options | `options-structure-lab` | 2 | nearest-expiry at-the-money implied move |

The other 14 cells stay **explicit reasoned gaps** (BI-2), and the reasons are not interchangeable:

- **options for SPMO / VGT** — no committed chain. Borrowing a proxy symbol's volatility would render as *this*
  ticker's own, and be false.
- **fundamentals, catalyst** — no committed statement or event data.
- **`gaps`** — **eight unrelated tools claim this domain and nothing in the registry defines what it means.**
  Producing a read would be inventing a semantic. This is a registry defect worth resolving deliberately, not a
  data gap to fill.

**A real defect surfaced while doing this.** Reads were keyed `(tool, ticker)` only, but a tool owns several
domains — `options-structure-lab` owns options, technical *and* volatility. The moment it had a read, the
precedence walk would have served one implied-move figure as the answer to three different questions. Reads now
carry `domainId` and `resolveCell` skips a domain mismatch. This is also why `covered` moved `8 → 10` before the
technical producer existed: the old volatility read had been silently doubling as the technical cell.

### Step 6 — what was actually wrong

The scorecard said 150 of 180 closed calls (83.3%) were unscoreable, swing 98.1% and tactical 97.5%. The
natural reading is *"authors are not supplying levels."* That reading was **wrong**. The levels were authored;
**the parser could not read them.** Two defects, both measured against the product's own published text:

| Defect | Evidence | Fix |
|---|---|---|
| A level had to carry a tilde. `"a break below the 740.09 flip"` extracted **nothing**. | Ran `extractLevels` on the live payload's own invalidation fields. | Accept a bare decimal — **invalidation scan only**. |
| `UPSIDE_CLAUSE` contained a bare `re-?opens? the`, which matches `"re-opens the structural DOWNSIDE"` and flips the level to a trigger, deleting the risk side. | Across every published brief that form matched **26 times and was wrong all 26** (25× *"the structural downside"*, 1× *"re-open the crack"*). It never once matched a real upside. | Require an actual upside object. |

The widening is **deliberately asymmetric**, and that asymmetry is the design:

- a *missed* level → the call is withheld from scoring. Honest.
- a *fabricated invalidation* → scores as a **miss**. Costs us, never flatters us.
- a *fabricated trigger* → a free `satisfied` that **inflates the published hit rate**. Unacceptable.

So the risk side may be recovered aggressively; the win side may not. A bare decimal is genuinely ambiguous —
`closes above 741.69 on 7/31` is a *description of a past close*, syntactically identical to a gate. An existing
adversarial assertion already pinned that, and it **caught my first, unconditional widening**. I narrowed the
fix rather than weakening the test.

**Measured:** live payload `machine-checkable` **2/5 → 4/5**. The one remaining call is a sector-rotation thesis
expressed in relative-strength momentum rather than price — genuinely not price-evaluable, and correctly
withheld. Historical verdicts are **not** retroactively rewritten (the ledger is append-only), so 83.3% remains
a true statement about calls already closed; the improvement lands on new calls.

**Authoring was closed at the same time.** `scripts/brief-narrative-parallel.mjs` now requires every tactical or
swing call to carry a numeric price level on a named committed instrument in its invalidation field, and to
**withhold** the call otherwise (**D16**). Without that, the next brief would mint unscoreable calls faster than
the parser recovers them — the same trap as the vocabulary fix in Step 3.

---

## 6. Measurable definition of done

| Metric | HEAD | Target | Command |
|---|---|---|---|
| Reader-visible framework leaks (23 tools × all views) | **157** | **0** | `node scripts/audit-reader-legibility.mjs` |
| Tools with at least one leak | **23 / 23** | **0 / 23** | same |
| Journey rows on a tool page | **23** → **1** ✅ | **1** | same (`journeyToolRows`) |
| Journey rows on the Action Center | **23** ✅ | **23** | same |
| Brief / action scoping on a tool page | **not yet measured** | own tool only | Step 2b probe fix |
| Tools sharing the generic Simple heading | 10 | **0** | same |
| Parameter levers without a contextual tooltip | most | **0** | selftest static scan |
| Covered watchlist matrix cells | **0** / 24 | **≥ 15** | `jq .scopeSummary.coveredCellCount` |
| `notEvaluableShare` (30d) | **0.8333** | **≤ 0.25** | `jq '.windows["30d"].notEvaluableShare'` |
| Tools `analyzed` in the brief | 11 / 23 | **16 / 23** | `jq .toolCoverage` |
| Tools `stale` in the brief | 5 | **0** | `jq .toolCoverage` |
| Pages that can start a journey | 2 / 25 | **25 / 25** | `tests/journey-reach.spec.mjs` |
| Red Alert / Portfolio hardcoded constants | 2 | **0** | `tests/market-action-center.spec.mjs` |
| Specs whose status contradicts shipped code | ≥ 1 | **0** | status sweep |
| Selftest / Playwright | 1,138 / 33 pass | **pass, and assert reader value** | CI |

---

## 7. Anti-drift additions

The existing contract D1–D12 in [`Product-Review-and-Roadmap.md`](Product-Review-and-Roadmap.md) §12 stands.
The frontier requires four more.

| # | Rule | Enforced by |
|---|---|---|
| **D13** | **Framework vocabulary never reaches the reader.** No `E012-*`, gate code, `sha256:`, spec/scope number, contract id or capability slug renders in a default view. Provenance belongs in Power. | `tests/governance-not-in-product-copy.spec.mjs` + selftest scan |
| **D14** | **A test may not assert a placeholder.** Any assertion pinning generic contract copy as correct output is a defect in the test. Tests encode the specification, never the current implementation. | review + Step 1 |
| **D15** | **Every rendered control carries a contextual tooltip** stating what it is and what the current value implies. A value with no contextual tooltip is a defect. | selftest scan over the shell renderer |
| **D16** | **No unscoreable tactical or swing call is published.** If a level cannot be attributed, the claim is withheld rather than emitted as `not-evaluable`. | `scripts/evaluate-recommendations.mjs` + scorecard threshold |
| **D17** | **A reach or coverage claim about a browser product is measured in a browser.** Static grep may locate code; it may never assert what a reader can reach. Shared modules load dynamically, so the HTML does not name what the page runs. | `scripts/audit-reader-legibility.mjs --explain` (prints the selector that matched, so a false "this view exists" is visible) |
| **D18** | **Never widen a timeout to make an intermittent suite green until the underlying latency is measured.** A readiness gate that is exceeded despite large headroom is starvation or a stall, not slowness, and widening it hides the real cause. Measure first; widen only with the measurement recorded. | measured probe against the readiness condition (see note below) |

---

## 8. Spec re-plan

The existing spec inventory predates the frontier. Mapping, so nothing is duplicated and nothing is orphaned.

| Step | Existing spec | Disposition |
|---|---|---|
| 1–3 legibility | `012-market-action-center-and-guided-tools` (`blocked`) | **Re-scope.** The shell shipped; legibility is the unfinished half. Steps 1–3 become its remaining scopes. |
| 4 watchlist routing | `008-portfolio-survival-and-brief-lab` (`in_progress`) | **Narrow.** Step 4 is the *public* watchlist axis only. Private portfolio overlay stays out of scope and behind its own gate. |
| 5 Red Alert / Portfolio | `012` scope 12 (Red Alert engine) | **Unblock via Step 4** — the engine exists; it lacks per-ticker input. |
| 6 born-evaluable | `015-recommendation-outcome-ledger-and-track-record` (`blocked`) | **Unblock.** Its own `blockedReason` concedes the code exists and the block is status bookkeeping. Step 6 is its real remaining work. |
| 7 stale tools | `003`, `007`, `013` + tool specs | **Absorb** into one coverage scope per tool. |
| 8 journey reach | `012` journey scopes | **Absorb.** |
| 9 paperwork | `_bugs/BUG-001`, `_bugs/BUG-005`, `001`, `004`, `005`, `006`, `014` | **Reconcile** per Step 9; retire what shipped, re-scope what did not under **D9**. |

---

## 9. What not to build

Carried forward from the fifth-pass review §13 and still correct: no ESM migration (it would break `file://`),
no bundler, no tool #24 before the scorecard is trustworthy, no real-time options flow, no order execution, no
multi-user accounts. Added:

| Don't | Why |
|---|---|
| Add a “make it prettier” visual pass before Steps 1–3 | The defect is semantic, not cosmetic. A restyled hash is still a hash. |
| Fabricate a matrix cell to raise `coveredCellCount` | A reasoned `unavailable` is the honest output and **BI-2** forbids the alternative. |
| Suppress `notEvaluable` to improve the headline rate | **BI-5**: misses and blind spots publish with equal prominence. Step 6 fixes the *cause*. |
| Delete the three pinning assertions instead of correcting them | Coverage must not fall. They must assert the specification. |
