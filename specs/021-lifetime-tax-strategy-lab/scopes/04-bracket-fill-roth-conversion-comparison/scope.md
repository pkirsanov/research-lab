# Scope 4: Bracket-Fill Roth Conversion Comparison

## 04-bracket-fill-roth-conversion-comparison

Planning authority: the [scope index](../_index.md). Execution evidence belongs
in [report.md](report.md).

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** `strategy:single-year`, `two-policy`, `disclosure-bound`
**Depends On:** 01, 02, 03
**Foundation:** false

**Primary Outcome:** a household selects one ordinary-income bracket and sees
exactly two policies compared on identical inputs against the identical resolved
pack — no conversion, and convert enough to fill that bracket. The result states
the conversion amount, the federal tax under each policy, the difference, and
the effective marginal rate at the fill edge taken from the Scope 03 curve.
Alongside it sits a closed disclosure naming everything the comparison did not
model, which in slice 1 is most of what actually decides a Roth conversion.

## Why This Scope Is Deliberately Small

The source note lists seven conversion policies and requires each to disclose
Medicare lookback effects, the Roth five-year clocks, later distribution and
survivor effects, and lost growth on taxes paid. None of those is reachable in a
single-year federal slice, and several depend on unresolved owner decisions.

Shipping one comparison with a complete, structural disclosure of what is
missing is honest. Shipping seven comparisons whose disclosures are prose would
produce a number that looks like a conversion recommendation and is not one.
This scope therefore constrains itself hard: two policies, one year, federal
only, no ranking, no break-even, no recommendation.

## Requirement Coverage

Provisional anchors pending `spec.md` (see the [scope index](../_index.md)).

- **PRA-021-025** — exactly two policies on identical inputs and the identical pack.
- **PRA-021-026** — the conversion amount derives from the resolved pack's bracket edge, never a constant.
- **PRA-021-027** — amount, per-policy tax, difference, and the marginal rate at the fill edge from Scope 03.
- **PRA-021-028** — a closed `notModeled[]` disclosure with a required minimum membership.
- **PRA-021-029** — outside-funds versus withheld tax distinguished, or named unavailable.
- **PRA-021-030** — no probability, no lifetime outcome, no break-even year, no ranking, no recommendation.

Inherited and re-asserted: **PRA-021-004** (rule status on every result),
**PRA-021-005** (`Unavailable` rather than a number) and **PRA-021-023** (the
marginal cost comes from the Scope 03 curve, not from a statutory bracket).

## Gherkin Scenarios

```gherkin
Scenario: SCN-021-010 Two policies are compared on identical inputs and the fill amount comes from the pack
  Given a household with a reconciled annual federal result and a selected ordinary-income bracket
  When the conversion comparison runs
  Then exactly two policies are returned: no conversion, and fill to the selected bracket
  And both policies were computed from the identical workspace and the identical resolved rule pack
  And the conversion amount equals the distance from current ordinary taxable income to that bracket's edge as declared by the pack
  And changing the pack's bracket edge changes the conversion amount, proving no threshold is hard-coded

Scenario: SCN-021-011 The comparison discloses in full what it did not model
  Given a completed conversion comparison for the declared tax year
  When the result's disclosure is read
  Then a closed notModeled list names at minimum state tax, Medicare and IRMAA effects, the premium tax credit, the Roth five-year clocks, later-year distribution and required-distribution pressure, survivor effects, and lost growth on taxes paid
  And each entry carries a reason and its deferral code rather than a bare label
  And the result is not presented as a conversion recommendation, a ranking, or a preferred policy

Scenario: SCN-021-012 The comparison emits a single-year federal cost difference and nothing more
  Given a completed conversion comparison
  When every emitted field is inspected
  Then no field carries a probability, a lifetime total, a break-even year, a survival figure, a rank, or an accuracy claim
  And the result states plainly that it is a single-year federal tax difference
  And a household that did not declare a tax funding source receives an Unavailable record for the outside-funds versus withheld distinction rather than a silently assumed source
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-021-010 two policies | Valid workspace, reconciled Scope 02 result, Scope 03 curve available | Select an ordinary-income bracket | Two labeled policy rows, the conversion amount, the tax under each, the difference, and the marginal rate at the fill edge | e2e-ui |
| SCN-021-011 disclosure | Comparison rendered | Open the disclosure panel | Every `notModeled` entry with its reason and code, and an explicit statement that this is not a recommendation | e2e-ui |
| SCN-021-012 claim boundary | Comparison rendered | Read the full result surface | No probability, lifetime total, break-even year, rank or accuracy figure anywhere on the surface | e2e-ui |
| Funding source | Workspace with no declared tax funding source | Run the comparison | An Unavailable record for the outside-funds versus withheld distinction, with what would make it available | e2e-ui |

## Implementation Files

### New

- `rltaxstrategy.js` — UMD module owning `ConversionComparison/v1`,
  `fillToBracketConversion(...)` and `compareConversionPolicies(...)`.
- Fixture files for a bracket-edge fill, a household already above the selected
  edge, a household whose gain stacking moves under conversion, a workspace with
  no declared funding source, and a mutated pack whose edge moved.
- A new Playwright spec named `lifetime-tax-conversion.spec.mjs` in the
  repository test directory.

### Modified

- `lifetime-tax-strategy-lab.html` — the comparison panel and its disclosure
  surface. The Simple/Power split is completed in Scope 05.
- `scripts/selftest.mjs` — one appended assertion group.

## Implementation Plan

1. Author `rltaxstrategy.js` as a UMD dual module at the repository root, with
   every pure function a top-level `function name(...) {}` declaration so
   `extractFn` can reach it. Numeric guards use `Number.isFinite(x)`.
2. Implement `fillToBracketConversion(workspace, pack, bracketId)`. The fill
   amount is the distance from current ordinary taxable income to the edge of
   the named bracket, read through Scope 01's `resolveRulePack`. The module
   declares no bracket edge of its own. A household already at or above the
   selected edge yields a zero-amount conversion that is explicitly labeled as
   such, not an `Unavailable` and not a negative amount.
3. Implement `compareConversionPolicies(workspace, pack, bracketId)` returning
   exactly two policies. Both call Scope 02's `computeAnnualFederalTax`. The
   comparison contains no tax arithmetic of its own, because a second
   computation path would let the two policies be priced by different rules.
4. Recompute rather than adjust. The conversion adds ordinary income, which
   moves the ordinary taxable income that long-term gains stack on top of, so
   the converted case must run the whole Scope 02 computation again. Adding a
   marginal-rate product to the baseline tax would understate the gain effect
   and is the specific defect this step exists to prevent.
5. Read the marginal cost at the fill edge from Scope 03's
   `computeEffectiveMarginalCurve`. Citing a statutory bracket rate here is
   forbidden. Where the curve labels itself incomplete, the comparison inherits
   that incompleteness and states it, rather than presenting the marginal cost
   as settled.
6. Define `notModeled[]` as a closed list in this module with a required minimum
   membership: state tax, Medicare and IRMAA effects, the premium tax credit,
   the Roth five-year clocks, later-year distribution and required-distribution
   pressure, survivor effects, lost growth on taxes paid. Each entry carries a
   reason and a deferral code. The list is a structural member of the result, so
   a rendering change cannot drop it.
7. Handle the funding source. If the workspace declares that conversion taxes
   are paid from outside funds or withheld from the converted amount, report the
   distinction. If it declares neither, return a `TaxUnavailable/v1` for that
   field naming what would make it available. There is no assumed default,
   because the two cases differ materially and a silent assumption would decide
   the answer for the user.
8. Assert the claim boundary in code, not only in copy: the result record has no
   member for a probability, a lifetime total, a break-even year, a rank or an
   accuracy figure, and a test enumerates the record's members to prove it.
9. Append a `lifetime-tax — bracket-fill conversion comparison` group to
   `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary before broad tests | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltaxstrategy.js` (new root module) | Created | Scope 05 | **High** — a module that re-implements tax arithmetic or hard-codes a bracket edge breaks single-definition, and the break stays invisible until a pack value moves | Scan the module for any tax-domain numeric constant and assert there are none; assert every tax figure came from `computeAnnualFederalTax`, BEFORE any comparison row runs | Delete the file; nothing consumes it until Scope 05 |
| Scope 02 and Scope 03 functions | Read only, not modified | Scope 05 | Medium — an adjustment-based converted case rather than a recomputation understates the gain-stacking effect | Assert the converted case reproduces a full independent `computeAnnualFederalTax` call at the converted income, not a marginal-rate product | Not applicable |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the appended group |
| `lifetime-tax-strategy-lab.html` | Comparison panel added | Scope 05 | Low — same-feature page | CSP meta stays byte-identical | Revert the panel |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxstrategy.js` · this scope's fixture files ·
`lifetime-tax-conversion.spec.mjs` in the repository test directory.

**Allowed modified:** `lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs`
(append-only).

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `tools.json` · `index.html` ·
`rlnav.js` · `README.md` · `notes/README.md` · `market-brief.*` · `rlbrief.js` ·
`briefs/**` · `data/**` · `brief-history.jsonl` · every script under
`scripts/brief-*` · `watchlist.json` · `site-exclusions.json` ·
`scripts/validate-spec-test-paths.baseline` · every framework-managed file under
`.github/bubbles/`, `.github/agents/bubbles*`, `.github/prompts/bubbles.*`,
`.github/instructions/bubbles-*` and `.github/skills/bubbles-*`.

**Dirty-work discipline:** capture a path-scoped `git status` and a zero-context
diff before each allowed path. No formatter and no broad rewrite runs.

**Rollback:** delete `rltaxstrategy.js`, its fixtures and the new spec; revert
the panel and the appended selftest group.

## Scenario-First Red/Green Contract

Add the named comparison assertion or the persistent browser title first and run
the exact command. RED is valid only when the intended contract assertion fails.
A syntax error, a missing browser, an absent test discovery or a different
failing assertion does not satisfy RED. After the smallest owned implementation,
rerun the identical command for GREEN.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Contract | unit | SCN-021-010 | `scripts/selftest.mjs` | The comparison returns exactly two policies, no conversion and fill-to-bracket, both computed from the identical workspace and the identical resolved pack | `node scripts/selftest.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Known value | unit | SCN-021-010 | `scripts/selftest.mjs` | The conversion amount equals the distance from current ordinary taxable income to the named bracket edge, for every supported filing status and every bracket in the pack | `node scripts/selftest.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | No-shadow | unit | SCN-021-010 | `scripts/selftest.mjs` | Regression: mutating the pack's bracket edge changes the conversion amount; `rltaxstrategy.js` holds no tax-domain numeric constant and declares no bracket edge | `node scripts/selftest.mjs` | No | `report.md#tp-04-03` |
| TP-04-04 | Recomputation | unit | SCN-021-010 | `scripts/selftest.mjs` | The converted case equals an independent full `computeAnnualFederalTax` call at the converted income, including moved long-term-gain stacking | `node scripts/selftest.mjs` | No | `report.md#tp-04-04` |
| TP-04-05 | Adversarial | unit | SCN-021-010 | `scripts/selftest.mjs` | Regression: a mutated implementation that adds a marginal-rate product to the baseline tax instead of recomputing is proven to fail the gain-stacking assertion | `node scripts/selftest.mjs` | No | `report.md#tp-04-05` |
| TP-04-06 | Boundary | unit | SCN-021-010 | `scripts/selftest.mjs` | A household already at or above the selected edge yields an explicitly labeled zero-amount conversion, never a negative amount and never an `Unavailable` | `node scripts/selftest.mjs` | No | `report.md#tp-04-06` |
| TP-04-07 | Marginal cost source | unit | SCN-021-010 | `scripts/selftest.mjs` | The reported marginal rate at the fill edge equals the Scope 03 curve value at that point; no statutory bracket rate is cited in its place; an incomplete curve propagates its incompleteness to the comparison | `node scripts/selftest.mjs` | No | `report.md#tp-04-07` |
| TP-04-08 | Disclosure | unit | SCN-021-011 | `scripts/selftest.mjs` | `notModeled[]` contains at minimum state tax, Medicare and IRMAA, the premium tax credit, the Roth five-year clocks, later-year distribution and required-distribution pressure, survivor effects, and lost growth on taxes paid, each with a reason and a deferral code | `node scripts/selftest.mjs` | No | `report.md#tp-04-08` |
| TP-04-09 | Adversarial | unit | SCN-021-011 | `scripts/selftest.mjs` | Regression: removing any required `notModeled` entry is proven to fail, and the list is a structural record member rather than page copy | `node scripts/selftest.mjs` | No | `report.md#tp-04-09` |
| TP-04-10 | Claim boundary | unit | SCN-021-012 | `scripts/selftest.mjs` | Enumerating the result record's members proves there is no probability, lifetime total, break-even year, survival figure, rank or accuracy field, and no such string is emitted | `node scripts/selftest.mjs` | No | `report.md#tp-04-10` |
| TP-04-11 | Funding source | unit | SCN-021-012 | `scripts/selftest.mjs` | Declared outside-funds and declared withheld produce distinguishable results; an undeclared funding source produces a `TaxUnavailable/v1` naming what would make it available, with no assumed default | `node scripts/selftest.mjs` | No | `report.md#tp-04-11` |
| TP-04-12 | Regression E2E | e2e-ui | SCN-021-010 | `lifetime-tax-conversion.spec.mjs` | `Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack" --reporter=list` | Yes | `report.md#scenario-scn-021-010` |
| TP-04-13 | Regression E2E | e2e-ui | SCN-021-011 | `lifetime-tax-conversion.spec.mjs` | `Regression: SCN-021-011 the conversion comparison discloses everything it did not model` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-011 the conversion comparison discloses everything it did not model" --reporter=list` | Yes | `report.md#scenario-scn-021-011` |
| TP-04-14 | Regression E2E | e2e-ui | SCN-021-012 | `lifetime-tax-conversion.spec.mjs` | `Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking" --reporter=list` | Yes | `report.md#scenario-scn-021-012` |
| TP-04-15 | Broader Regression E2E | e2e-ui | SCN-021-001 … -012 | `lifetime-tax-foundation.spec.mjs`, `lifetime-tax-federal.spec.mjs`, `lifetime-tax-marginal.spec.mjs`, `lifetime-tax-conversion.spec.mjs` | Execute the cumulative Scope 01 through Scope 04 browser suites over the real route with no request interception, no service worker and no external provider | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-0" --reporter=list` | Yes | `report.md#tp-04-15` |
| TP-04-16 | Repo gate | unit | SCN-021-010 … -012 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-04-16` |
| TP-04-17 | Path guard | unit | SCN-021-010 … -012 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-04-17` |

Before any browser row, run `node scripts/validate-node-source-lock.mjs` and
`npx --no-install playwright --version`. These environment gates do not replace a
Test Plan row.

### Definition of Done

- [ ] PRA-021-025 through PRA-021-030 are implemented: exactly two policies on
      identical inputs, a pack-derived fill amount, the reported amount, per-policy
      tax, difference and marginal rate at the edge, a closed `notModeled[]`
      disclosure, the funding-source distinction, and no probability, lifetime
      outcome, break-even year, ranking or recommendation.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-01` through `report.md#tp-04-11`
- [ ] The converted case is proven to be a full recomputation rather than a
      marginal-rate adjustment, including moved long-term-gain stacking. The
      adversarial case proves the guard can fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-04`, `report.md#tp-04-05`
- [ ] The marginal cost at the fill edge comes from the Scope 03 curve. No
      statutory bracket rate is cited as the marginal cost, and an incomplete
      curve propagates its incompleteness.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-07`
- [ ] `notModeled[]` is a structural record member with the full required
      membership, and removing any required entry is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-08`, `report.md#tp-04-09`
- [ ] `rltaxstrategy.js` holds no tax-domain numeric constant and declares no
      bracket edge. Every tax figure came from Scope 02.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-03`
- [ ] Every Test Plan row has intended RED evidence and same-command GREEN
      evidence, recorded before the cumulative browser row.
  - **Phase:** implement · **Command:** the exact TP-04-01 through TP-04-14 commands · **Evidence:** `report.md#test-evidence`
- [ ] No source, artifact or UI string in this scope claims a published error
      rate, a self-invalidation statistic, a track record, an accuracy figure or
      a plan success probability.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [ ] Feature 008 files, the six registries and every brief or data artifact are
      byte-identical.
  - **Phase:** implement · **Command:** a path-scoped `git status` over the excluded list · **Evidence:** `report.md#change-boundary`
- [ ] `node scripts/selftest.mjs` is green with no fall in pass count and no
      existing assertion edited, relaxed or removed, and
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths
      with the baseline file unmodified.
  - **Phase:** implement · **Command:** both commands · **Evidence:** `report.md#tp-04-16`, `report.md#tp-04-17`
