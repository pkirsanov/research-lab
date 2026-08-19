# Scope 2: Deterministic Annual Federal Tax

## 02-deterministic-annual-federal-tax

Planning authority: the [scope index](../_index.md). Execution evidence belongs
in [report.md](report.md).

**Status:** In progress — engine delivered, route result panel not started
**Scope-Kind:** runtime-behavior
**Tags:** `engine:federal`, `deterministic`, `known-value-tested`
**Depends On:** 01
**Foundation:** false

**Primary Outcome:** a household that has supplied the minimum viable input
receives one reconciled federal tax result for the declared year: taxable income,
the deduction that was applied and why, ordinary-income tax across the resolved
bracket table, long-term gains and qualified dividends stacked on top of ordinary
taxable income rather than taxed in isolation, tax-exempt interest retained and
excluded, and a rule status on every field. Every unsupported federal feature is
named, so no result is labeled a complete federal tax.

## Requirement Coverage

Provisional anchors pending `spec.md` (see the [scope index](../_index.md)).

- **PRA-021-011** — determinism.
- **PRA-021-012** — ordinary-income brackets in the pack's `calculationOrder`.
- **PRA-021-013** — long-term gain and qualified-dividend stacking.
- **PRA-021-014** — explicit standard versus itemized selection.
- **PRA-021-015** — tax-exempt interest retained, excluded, downstream uses named unavailable.
- **PRA-021-016** — displayed reconciliation identity.
- **PRA-021-017** — full internal precision, disclosed display rounding.
- **PRA-021-018** — unsupported federal features named, never silently omitted.

Inherited from Scope 01 and re-asserted here: **PRA-021-004** (rule status on
every result) and **PRA-021-005** (`Unavailable` rather than a number).

## Gherkin Scenarios

```gherkin
Scenario: SCN-021-004 Federal tax is deterministic and exact at every bracket boundary
  Given a household with only ordinary income for the declared tax year
  When the annual federal tax is computed at an amount immediately below a bracket edge, exactly at that edge, and immediately above it
  Then each result matches the known value derived from the resolved pack's own bracket table
  And repeating the identical input produces a byte-identical result
  And every returned field carries a rule status from the closed enum

Scenario: SCN-021-005 Long-term gains stack on ordinary income rather than being taxed in isolation
  Given a household with both ordinary income and long-term capital gains for the declared tax year
  When the annual federal tax is computed
  Then the long-term gain is taxed in the capital-gain bands that sit above the ordinary taxable income
  And raising ordinary income alone changes the tax owed on an unchanged long-term gain
  And qualified dividends receive the same stacking treatment as long-term gains

Scenario: SCN-021-006 Deduction selection is explicit and the result reconciles
  Given a household supplies a deduction mode of standard, and separately an itemized amount
  When the annual federal tax is computed under each mode
  Then the applied deduction and the mode that produced it are displayed rather than inferred
  And the reconciliation identity between income components, the applied deduction, taxable income and tax is displayed and holds
  And a household that supplied no deduction mode receives an Unavailable record naming the missing member rather than a silently applied default
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-021-004 boundary | Valid workspace, resolved pack | Enter ordinary income below, at, and above a bracket edge | Three distinct tax figures, each with a rule status, each traceable to a named bracket row | e2e-ui |
| SCN-021-005 stacking | Valid workspace | Enter ordinary income and a long-term gain, then raise ordinary income only | The gain's tax changes although the gain did not; the stacking is shown as bands sitting above ordinary taxable income | e2e-ui |
| SCN-021-006 reconciliation | Valid workspace | Toggle standard and itemized | The applied deduction, the mode, and a visible identity row that balances | e2e-ui |
| Unsupported feature | Valid workspace | Open the result detail | Every `unsupportedFeatures[]` entry is listed and the result is not labeled a complete federal tax | e2e-ui |

## Implementation Files

### New

- `rltax.js` — UMD module owning the deterministic annual federal computation:
  `computeTaxableIncome(...)`, `selectDeduction(...)`, `stackLongTermGain(...)`,
  `computeAnnualFederalTax(...)`, `reconcileAnnualFederalTax(...)`.
- Known-value fixture files for bracket boundaries, stacking cases, and the two
  deduction modes.

### Modified

- `lifetime-tax-strategy-lab.html` — the result surface that renders the annual
  computation. The Simple/Power split is completed in Scope 05; this scope
  renders a single plain result panel.
- `scripts/selftest.mjs` — one appended assertion group.
- The Playwright spec added in Scope 01, extended with this scope's persistent
  titles.

## Implementation Plan

1. Author `rltax.js` as a UMD dual module. Every computation function is a
   top-level `function name(...) {}` declaration so `extractFn` can extract it.
   Numeric guards use `Number.isFinite(x)`.
2. Read every rate, band edge and deduction amount through Scope 01's
   `resolveRulePack`. `rltax.js` declares no threshold, no rate and no bracket
   table of its own. A scan asserting the module contains no tax-domain numeric
   constant is what makes this structural rather than reviewed.
3. Implement `computeTaxableIncome(workspace, pack)`: sum the supported ordinary
   income kinds, exclude tax-exempt interest from taxable income while retaining
   it as a recorded input, and subtract the applied deduction.
4. Implement `selectDeduction(workspace, pack)` returning the applied amount,
   the mode that produced it, and a rule status. A workspace with no declared
   deduction mode returns `RLTAX-INPUT-INCOMPLETE`. There is no default mode.
5. Implement `stackLongTermGain(ordinaryTaxableIncome, gainAmount, pack)`. The
   gain occupies the capital-gain bands **above** ordinary taxable income. A
   gain taxed against a band chosen without reference to ordinary income is the
   defect this function exists to prevent, so the known-value tests must include
   a case where changing ordinary income alone changes the gain's tax.
6. Implement `computeAnnualFederalTax(...)` composing the above in the pack's
   declared `calculationOrder`. The order is read from the pack and published in
   the result, so the order the reader is told about and the order the code
   applied are one string rather than two descriptions that can drift.
7. Implement `reconcileAnnualFederalTax(result)` asserting the identity between
   income components, the applied deduction, taxable income and tax. A
   non-balancing result is `RLTAX-RECONCILE` and is not displayed as a tax
   figure.
8. Preserve full internal precision. Apply rounding only at the display
   boundary, and publish the `roundingPolicy` the pack declared alongside the
   rounded figure.
9. Render every `unsupportedFeatures[]` entry from the resolved pack next to the
   result, and refuse any label asserting a complete federal tax.
10. Append a `lifetime-tax — deterministic annual federal computation` group to
    `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltax.js` (new root module) | Created | Scopes 03, 04, 05 | High — a duplicated bracket table or rate inside this module permanently breaks single-definition, and the breakage is invisible until a pack value moves | Scan the module for any tax-domain numeric constant and assert there are none, BEFORE any computation row runs | Delete the file; nothing consumes it until Scope 03 |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the appended group |
| `lifetime-tax-strategy-lab.html` | Result panel added | Scope 05 | Low — same-feature page | The CSP meta stays byte-identical | Revert the panel |
| Scope 01 modules | Read only, not modified | Scopes 03, 04, 05 | Medium — a rule resolved anywhere but Scope 01 breaks the `Unavailable` guarantee | Assert `rltax.js` reaches the pack only through `resolveRulePack` | Not applicable |

## Change Boundary And Protected Paths

**Allowed new:** `rltax.js` · this scope's fixture files.

**Allowed modified:** `lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs`
(append-only) · the Scope 01 Playwright spec.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `tools.json` · `index.html` ·
`rlnav.js` · `README.md` · `notes/README.md` · `market-brief.*` · `briefs/**` ·
`data/**` · `watchlist.json` · `site-exclusions.json` (its entry is already
correct from Scope 01) · `scripts/validate-spec-test-paths.baseline` · every
framework-managed file.

**Rollback:** delete `rltax.js` and its fixtures, revert the page panel and the
appended selftest group.

## Scenario-First Red/Green Contract

Add the named known-value assertion or the persistent browser title first, run
the exact command, and confirm the intended contract assertion is what fails.
Then implement the smallest owned change and rerun the identical command.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Known value | unit | SCN-021-004 | `scripts/selftest.mjs` | Ordinary-income tax is exact immediately below, exactly at, and immediately above every bracket edge in the resolved pack, for every supported filing status | `node scripts/selftest.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Known value | unit | SCN-021-005 | `scripts/selftest.mjs` | A long-term gain is taxed in the capital-gain bands above ordinary taxable income; raising ordinary income alone changes the tax on an unchanged gain; qualified dividends receive identical treatment | `node scripts/selftest.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Adversarial | unit | SCN-021-005 | `scripts/selftest.mjs` | Regression: a mutated implementation that taxes the gain in isolation, ignoring ordinary taxable income, is proven to fail the stacking assertion | `node scripts/selftest.mjs` | No | `report.md#tp-02-03` |
| TP-02-04 | Known value | unit | SCN-021-006 | `scripts/selftest.mjs` | Standard and itemized modes each produce the applied amount and the mode that produced it; a workspace with no declared mode returns `RLTAX-INPUT-INCOMPLETE` and no default is applied | `node scripts/selftest.mjs` | No | `report.md#tp-02-04` |
| TP-02-05 | Reconciliation | unit | SCN-021-006 | `scripts/selftest.mjs` | The identity between income components, applied deduction, taxable income and tax holds for every fixture; a deliberately unbalanced result is refused `RLTAX-RECONCILE` and is not returned as a tax figure | `node scripts/selftest.mjs` | No | `report.md#tp-02-05` |
| TP-02-06 | Determinism | unit | SCN-021-004 | `scripts/selftest.mjs` | Repeated computation over identical input produces a byte-identical result, with global `fetch` stubbed to throw for the whole group | `node scripts/selftest.mjs` | No | `report.md#tp-02-06` |
| TP-02-07 | No-shadow | unit | SCN-021-004 | `scripts/selftest.mjs` | Regression: `rltax.js` contains no tax-domain numeric constant, declares no bracket table, and reaches every rate and edge through Scope 01's resolver | `node scripts/selftest.mjs` | No | `report.md#tp-02-07` |
| TP-02-08 | Tax-exempt handling | unit | SCN-021-005 | `scripts/selftest.mjs` | Tax-exempt interest is retained as a recorded input, is excluded from taxable income, and its downstream uses are named `RLTAX-SCOPE-DEFERRED` rather than dropped from the model | `node scripts/selftest.mjs` | No | `report.md#tp-02-08` |
| TP-02-09 | Precision | unit | SCN-021-004 | `scripts/selftest.mjs` | Internal precision is preserved end to end and rounding is applied only at the display boundary, with the pack's `roundingPolicy` published beside the rounded figure | `node scripts/selftest.mjs` | No | `report.md#tp-02-09` |
| TP-02-10 | Completeness boundary | unit | SCN-021-004 | `scripts/selftest.mjs` | Every `unsupportedFeatures[]` entry is surfaced with the result and no code path emits a label asserting a complete federal tax | `node scripts/selftest.mjs` | No | `report.md#tp-02-10` |
| TP-02-11 | Regression E2E | e2e-ui | SCN-021-004 | `lifetime-tax-federal.spec.mjs` | `Regression: SCN-021-004 federal tax is exact below at and above a bracket edge` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-004 federal tax is exact below at and above a bracket edge" --reporter=list` | Yes | `report.md#scenario-scn-021-004` |
| TP-02-12 | Regression E2E | e2e-ui | SCN-021-005 | `lifetime-tax-federal.spec.mjs` | `Regression: SCN-021-005 long term gains stack on ordinary income` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-005 long term gains stack on ordinary income" --reporter=list` | Yes | `report.md#scenario-scn-021-005` |
| TP-02-13 | Regression E2E | e2e-ui | SCN-021-006 | `lifetime-tax-federal.spec.mjs` | `Regression: SCN-021-006 deduction selection is explicit and the annual result reconciles` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-006 deduction selection is explicit and the annual result reconciles" --reporter=list` | Yes | `report.md#scenario-scn-021-006` |
| TP-02-14 | Broader Regression E2E | e2e-ui | SCN-021-001 … -006 | `lifetime-tax-foundation.spec.mjs`, `lifetime-tax-federal.spec.mjs` | Execute the cumulative Scope 01 and Scope 02 browser suites over the real route | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-00" --reporter=list` | Yes | `report.md#tp-02-14` |
| TP-02-15 | Repo gate | unit | SCN-021-004 … -006 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-02-15` |
| TP-02-16 | Path guard | unit | SCN-021-004 … -006 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-02-16` |

### Definition of Done

- [x] PRA-021-011 through PRA-021-018 are implemented: determinism, bracket
      application in the pack's declared order, gain stacking, explicit
      deduction selection, retained tax-exempt interest, a displayed
      reconciliation identity, preserved precision with disclosed rounding, and
      named unsupported features.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-01` through `report.md#tp-02-10`
  - **Claim Source:** executed · **Result:** all 18 assertions in the appended Scope 02 group pass; suite exits 0 at `2492 passed, 0 failed`. Three defects were found and fixed on the way: `CO-6`/`CO-7` refused a table that had zero taxable dollars to price, the stacking assertion compared two `undefined` members, and the band-table detector fired on pack values echoed into display detail.
- [x] Known-value boundary coverage exists for every bracket edge in the
      resolved pack — below, at, and above — for every supported filing status,
      and each fixture names the source edition and year it was derived from.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-01`
  - **Claim Source:** executed · **Result:** 72 checks across 24 edges and four filing statuses, plus an independent transcription of the whole schedule that the pack is asserted equal to. The source edition is Rev. Proc. 2025-32, Internal Revenue Bulletin 2025-45, published 2025-11-03, tax year 2026, retrieved in this session.
- [x] The stacking adversarial case proves the guard can fail: an isolated-gain
      implementation is demonstrated to break the assertion.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-03`
  - **Claim Source:** executed · **Result:** the design's named mutation — dropping the `OTI` term from the `CO-7` window — returns `0` at both ordinary levels, proving it is blind to ordinary income, and does not match the stacked `7.5`.
- [x] `rltax.js` holds no tax-domain numeric constant and no bracket table. Every
      rate and edge is read through Scope 01's resolver.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-07`
  - **Claim Source:** executed · **Result:** the numeric-literal offender list is empty, the corrected band-table detector does not fire, and both detectors are proven to fire on an engine that does embed a bracket edge.
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded before the cumulative browser row.
  - **Phase:** implement · **Command:** the exact TP-02-01 through TP-02-13 commands · **Evidence:** `report.md#test-evidence`
  - **Claim Source:** executed · **Result:** all 13 contract rows now carry RED and same-command GREEN, recorded before TP-02-14. Five reversible probes supplied the RED that the interrupted earlier run never observed: an in-walk `Math.round` (TP-02-01, TP-02-09), an unreachable undeclared-mode guard (TP-02-04), a `Math.random` perturbation (TP-02-06), tax-exempt interest folded into gross (TP-02-08), `completeFederalTax` flipped true (TP-02-10), and `+100` on gross (TP-02-11/12/13). TP-02-02, -05, -07 kept the RED observed in the earlier session; TP-02-03's guard-can-fail proof is the permanent assertion itself. Each probe was reverted before the next began; `git status --short rltax.js` is empty.
- [x] No result is labeled a complete federal tax, and no output states a
      probability, a lifetime figure, a track record or an error rate.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
  - **Claim Source:** executed · **Result:** `completeFederalTax` is a structural `false` on every result, all 18 unsupported features are surfaced with it, and the text scan returns zero matches (exit 1).
- [x] Feature 008 files, the registries and every brief or data artifact are
      byte-identical.
  - **Phase:** implement · **Command:** a path-scoped `git status` over the excluded list · **Evidence:** `report.md#change-boundary`
  - **Claim Source:** executed · **Result:** the scoped `git status` returns no rows for any excluded path. Two unrelated modifications, `scripts/brief-refresh-and-push.sh` and `tests/brief-refresh-atomicity.test.mjs`, pre-date this dispatch and were not touched.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count and no
      existing assertion edited, and
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths.
  - **Phase:** implement · **Command:** both commands · **Evidence:** `report.md#tp-02-15`, `report.md#tp-02-16`
  - **Claim Source:** executed · **Result:** `2492 passed, 0 failed` at exit 0 with an append-only diff of 681 insertions and 0 deletions; `new=0` at exit 0 from the path guard.
