# Scope 5: Combined Settlement And Combined Marginal Curve

## 05-combined-settlement-and-marginal-curve

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** `route:integrated`, `adversarial-ordering:true`, `no-registration:true`, `known-value-tested`
**Depends On:** 01, 02, 03, 04
**Foundation:** false

**Primary Outcome:** the household sees one combined answer and one combined
curve. The combined total is the sum of two settlements that never touch, and the
independence is proven by an adversarial mutation rather than asserted. The curve
carries a federal component, a state component and a combined rate at every
sampled level, with every step landing exactly on the threshold that caused it and
tagged with the jurisdiction that owns it. A no-tax state contributes a flat,
sourced-zero state series rather than an absent one.

## Requirement Coverage

- **FR-022-028** — the two settlements are computed independently and the combined
  result is order-independent.
- **FR-022-029** — the combined total is the sum of the jurisdiction totals, is a
  refusal if either is, and treats a sourced zero as a real addend.
- **FR-022-030** — an itemized household receives the coupling notice naming the
  unmodeled federal deduction for state income tax paid.
- **FR-022-031** — the combined curve carries the three per-point rates and no
  scalar average.
- **FR-022-032** — the sample set is the union of both jurisdictions' crossings,
  each bracketed exactly.
- **FR-022-033** — every segment names its contributing thresholds tagged with the
  owning jurisdiction, and an unattributable rate change is refused.
- **FR-022-034** — two packs that do not both cover the declared year produce
  `RLTAX-PACK-YEAR-MISMATCH` naming both packs and both year sets.

Inherited and re-asserted: every NFR, and specifically **NFR-022-002** zero
network, **NFR-022-003** no household value in any URL or request,
**NFR-022-006** tooltips and text-equivalent tables, **NFR-022-008** no new root
HTML, **NFR-022-009** Feature 008 byte-identity.

## Gherkin Scenarios

```gherkin
Scenario: SCN-022-013 The combined total is order-independent and says so
  Given a household with a resolvable federal pack and a resolvable state pack
  When the combined settlement is computed
  Then the combined total equals the sum of the two independent jurisdiction totals
  And settling the two in the opposite order produces a byte-identical result
  And an implementation that feeds either total into the other's deduction is demonstrated to fail the order-independence assertion

Scenario: SCN-022-014 The combined curve names the jurisdiction that owns each step
  Given a household in a state that imposes an income tax
  When the combined marginal rate curve is computed
  Then each point carries a federal component, a state component and a combined rate
  And each segment's contributing thresholds are tagged with the jurisdiction and the pack that owns them
  And a step at a state bracket edge and a step at a federal bracket edge are each placed exactly at their own edge rather than at a grid position

Scenario: SCN-022-015 A pack-year mismatch refuses rather than settling
  Given a resolved federal pack and a resolved state pack whose declared effective tax years do not both contain the declared year
  When the combined settlement is attempted
  Then the combined result is RLTAX-PACK-YEAR-MISMATCH naming both packs and both year sets
  And neither jurisdiction total is presented as a combined figure
  And no threshold from either pack is carried into the other's year
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-022-013 combined | Federal and state both resolvable | Open the Simple view | The combined total with the two jurisdiction totals beside it, each carrying its own rule status | e2e-ui |
| SCN-022-013 itemized | Deduction mode itemized | Open the coupling panel | The notice naming the unmodeled state-tax deduction and stating the declared amount was used exactly as declared | e2e-ui |
| SCN-022-014 curve | A state that imposes a tax | Open the combined curve | Three series; each step attributed to a named threshold with its jurisdiction; the text-equivalent table carrying the same numbers | e2e-ui |
| SCN-022-014 no-tax state | Residency in the no-tax state | Open the combined curve | A state series present and flat at zero across the domain, attributed to the no-tax authority, not absent | e2e-ui |
| SCN-022-015 mismatch | Two packs disagreeing on the year | Open the combined panel | `RLTAX-PACK-YEAR-MISMATCH` naming both packs and both year sets, and no combined numeral anywhere | e2e-ui |
| Registration absence | Any state | Open the site index and navigation | The tool absent from the tool list, the site index, the navigation and the market brief | e2e-ui |

## Implementation Files

### New

- `rltaxcombined.js` — UMD module owning `assertPackYearAgreement`,
  `combineSettlements`, `CombinedSettlement/v1`, `CombinedMarginalCurve/v1`,
  `computeCombinedMarginalCurve` and `combinedCurveTextRows`.
- Fixture pairs for the mismatch case and for the sourced-zero state series.

### Modified

- `lifetime-tax-strategy-lab.html` — `CombinedTotalLine` and `StateStatusChip` in
  Simple; `CombinedCurveChart`, `CombinedCurveTable`, `CouplingPanel` and
  `PackYearPanel` in Power.
- `scripts/selftest.mjs` — one appended assertion group.

No engine module is modified. `rltaxcombined.js` composes two settlements that are
already correct; if either needs a change, that is a finding routed to its owning
scope.

## Implementation Plan

1. Author `rltaxcombined.js` as a UMD dual module with top-level function
   declarations and `Number.isFinite` guards.
2. Implement `assertPackYearAgreement` first. It refuses
   `RLTAX-PACK-YEAR-MISMATCH` when the declared year is not a member of both
   packs' effective years, and the refusal carries both pack ids and both year
   arrays. A refusal naming one side of a mismatch sends the operator to the wrong
   pack.
3. Implement `combineSettlements` as a pure pairing. It calls the federal
   settlement and the state settlement with the workspace and their own packs, and
   passes **no** figure from either into the other. There is no parameter through
   which one could reach the other; that absence is the whole independence claim.
4. Set `orderIndependence.asserted` by actually settling both orders and comparing
   the serialized results, never by a constant. A difference anywhere in either
   settlement fails it.
5. Treat a `SourcedZero/v1` state total as a real addend. The combined total
   includes it; it is not skipped, not coerced, and not tested with a value
   comparison. The addition path branches on contract version.
6. Populate `crossJurisdictionCoupling` with an empty `modeled` array as a
   required member, the `notModeled` entry naming the federal itemized deduction
   for state income tax paid, and the `itemizedNotice` when the deduction mode is
   itemized. Do not attempt to resolve the circularity by iteration; a fixed-point
   figure has no retrieved source behind it.
7. Implement `computeCombinedMarginalCurve`. Each `T` is a full settlement at the
   sampled level, never a band lookup. Compute the federal and state marginal
   rates separately and the combined rate as their sum, then assert that the sum
   equals a single finite difference over the combined total — an identity that
   holds only while the two settlements are independent, which is what makes it
   worth asserting.
8. Build the sample set as the union of the grid, the federal crossing pairs and
   the **state** crossing pairs, each derived from its own settlement's marginal
   context. Insert the pair `(d − probe, d)` for each crossing and synthesize no
   point between a pair.
9. Refuse `RLTAX-CONFIG-INVALID` when the union would exceed `maxPoints`. Do not
   drop the state's crossings to fit the budget; a curve that silently became
   federal-only would look correct and say nothing about what it lost.
10. Tag every `contributingThresholds[]` entry with its jurisdiction and pack id,
    and refuse `RLTAX-THRESHOLD-UNAVAILABLE` for any segment whose rate moves with
    no attributable threshold in either pack.
11. Render the three-series chart with a text-equivalent table carrying the same
    numbers and an accessible label. No `requestAnimationFrame` wrapper around the
    drawing. Every displayed value carries a tooltip naming the question it
    answers.
12. Run the registration-absence assertion explicitly: the tool must still be
    absent from `tools.json`, `index.html`, `rlnav.js`, `README.md`,
    `notes/README.md` and market-brief coverage.
13. Append a `lifetime-tax — combined settlement and combined marginal curve`
    group to `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltaxcombined.js` (new root module) | Created | The route only | High — a combined module that re-derives either settlement would create a second definition of tax, invisible until a pack value moved | Scan the module for any tax-domain numeric constant and assert there are none, and assert it calls each settlement exactly once per sample, BEFORE any combined row runs | Delete the file; nothing else consumes it |
| The two settlement modules | Read only, not modified | none | Medium — a change here would mean the composition was not a composition | Assert both modules are byte-identical at the end of the scope | Not applicable |
| `lifetime-tax-strategy-lab.html` | Six surfaces added | none | Medium — the page is now the whole feature's only surface | The CSP meta stays byte-identical and the registration-absence assertion passes | Revert the panels |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the appended group |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxcombined.js` · this scope's fixture pairs.

**Allowed modified:** `lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs`
(append-only — this scope owns no supersession) · this scope's Playwright spec.

**Excluded — must remain byte-identical:** `rltaxrules.js` · `rltax.js` ·
`rltaxstate.js` · `rltaxworkspace.js` · `rltaxstrategy.js` · `tax-rules/**` ·
`rlportfolio.js` · `rlportfolioanalytics.js` ·
`portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`tools.json` · `index.html` · `rlnav.js` · `README.md` · `notes/README.md` ·
`market-brief.*` · `briefs/**` · `data/**` · `watchlist.json` ·
`site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` · `tests/lifetime-tax-*.spec.mjs` ·
`tests/lifetime-tax.support.mjs` · every framework-managed file.

**Rollback:** delete `rltaxcombined.js` and its fixtures; revert the page panels
and the appended selftest group.

## Assertion Supersession Owned By This Scope

**None.** This scope owns no entry in the
[supersession ledger](../../spec.md#supersession-ledger). Pairing two independent
settlements changes no behaviour any pre-existing assertion pins, so every one of
them — including the twenty-one replacements Scopes 01 and 02 delivered — must still
pass unchanged at the end of this scope. As the final scope, it also runs the
ledger's closing check: the delivered `SUP-022-NN` marker set equals all twenty-one
entries, and no assertion changed outside them. This scope appends only.

**Why adding a Simple field still supersedes nothing.** `CombinedTotalLine` and
`StateStatusChip` are Simple fields, and Scope 02's SUP-022-18 and SUP-022-19
replacements derive their expected values from the page itself rather than pinning
a length, so this scope's growth is absorbed with no edit. That holds only while
this scope obeys the Simple-view rule in
[`design.md`](../../design.md#where-the-combined-curve-lives-and-why-it-is-not-in-simple):
`CombinedCurveChart` and `CombinedCurveTable` render in **Power**, not Simple, and
every Simple surface this scope adds is a `data-rl-value` field whose id does not
match `band|curve|ledger|trace|reconcil|average`. Placing the chart or its table
in Simple would break `TP-05-01`'s no-`<canvas>` clause and
`Regression: SCN-021-013`'s zero-`<canvas>`, zero-`<table>` clauses, none of which
is eligible for supersession. If the chart cannot be rendered in Power, that is a
finding returned to planning, not an assertion edit.

## Scenario-First Red/Green Contract

Add the named known-value assertion or the persistent browser title first, run the
exact command, and confirm the intended contract assertion is what fails. Then
implement the smallest owned change and rerun the identical command.

**Named intended-RED assertion for this scope:** a state settlement mutated to
subtract the federal total from its taxable income must break the
order-independence assertion, and the unmutated implementation must satisfy it.
Before `orderIndependence` is computed by settling both orders, the assertion
fails because the flag is a constant that cannot go false. A syntax error, a
missing browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Contract | unit | SCN-022-015 | `scripts/selftest.mjs` | `assertPackYearAgreement` refuses `RLTAX-PACK-YEAR-MISMATCH` naming both pack ids and both year arrays, and accepts a pair that both cover the declared year | `node scripts/selftest.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Known value | unit | SCN-022-013 | `scripts/selftest.mjs` | The combined total equals the sum of the two jurisdiction totals for every fixture pair, and is the refusal of the refusing side when either refuses | `node scripts/selftest.mjs` | No | `report.md#tp-05-02` |
| TP-05-03 | Independence | unit | SCN-022-013 | `scripts/selftest.mjs` | `orderIndependence.asserted` is produced by settling both orders and comparing serialized results, and is not a constant | `node scripts/selftest.mjs` | No | `report.md#tp-05-03` |
| TP-05-04 | Adversarial | unit | SCN-022-013 | `scripts/selftest.mjs` | Regression: a state settlement mutated to subtract the federal total from its taxable income is proven to break the order-independence assertion and reconciliation leg `L7` | `node scripts/selftest.mjs` | No | `report.md#tp-05-04` |
| TP-05-05 | Adversarial | unit | SCN-022-013 | `scripts/selftest.mjs` | Regression: a federal settlement mutated to add the state total to its itemized deduction is proven to break the order-independence assertion | `node scripts/selftest.mjs` | No | `report.md#tp-05-05` |
| TP-05-06 | Sourced zero | unit | SCN-022-013 | `scripts/selftest.mjs` | A sourced-zero state total is included in the combined total as a real addend, the addition branches on contract version rather than on value, and the combined result is not labelled federal-only | `node scripts/selftest.mjs` | No | `report.md#tp-05-06` |
| TP-05-07 | Coupling | unit | SCN-022-013 | `scripts/selftest.mjs` | `crossJurisdictionCoupling.modeled` is present and empty, `notModeled` names the federal itemized state-tax deduction, and `itemizedNotice` is populated exactly when the deduction mode is itemized | `node scripts/selftest.mjs` | No | `report.md#tp-05-07` |
| TP-05-08 | Known value | unit | SCN-022-014 | `scripts/selftest.mjs` | Each curve point's combined rate equals the sum of its two component rates, and that sum equals a single finite difference over the combined total | `node scripts/selftest.mjs` | No | `report.md#tp-05-08` |
| TP-05-09 | Known value | unit | SCN-022-014 | `scripts/selftest.mjs` | The sample set is the union of the grid and both jurisdictions' crossings; each crossing emits the exact bracketing pair; no point is synthesized between a pair | `node scripts/selftest.mjs` | No | `report.md#tp-05-09` |
| TP-05-10 | Adversarial | unit | SCN-022-014 | `scripts/selftest.mjs` | Regression: an implementation that drops the state's crossings from the sample set is proven to fail the exact-crossing assertion at a state bracket edge | `node scripts/selftest.mjs` | No | `report.md#tp-05-10` |
| TP-05-11 | Attribution | unit | SCN-022-014 | `scripts/selftest.mjs` | Every contributing threshold carries a non-empty jurisdiction and pack id, and a segment whose rate moves with no attributable threshold is refused rather than rendered | `node scripts/selftest.mjs` | No | `report.md#tp-05-11` |
| TP-05-12 | Sourced zero | unit | SCN-022-014 | `scripts/selftest.mjs` | For the no-tax state the state series is present, flat at zero across the whole domain, and attributed to the no-tax authority rather than absent | `node scripts/selftest.mjs` | No | `report.md#tp-05-12` |
| TP-05-13 | Budget | unit | SCN-022-014 | `scripts/selftest.mjs` | A sweep whose union of crossings would exceed `maxPoints` is refused `RLTAX-CONFIG-INVALID`, and no implementation drops a jurisdiction's crossings to fit | `node scripts/selftest.mjs` | No | `report.md#tp-05-13` |
| TP-05-14 | Contract shape | unit | SCN-022-014 | `scripts/selftest.mjs` | The combined curve record carries no scalar average and no summary rate, and the chart and the text-equivalent table read the identical record | `node scripts/selftest.mjs` | No | `report.md#tp-05-14` |
| TP-05-15 | No-shadow | unit | SCN-022-013 | `scripts/selftest.mjs` | Regression: `rltaxcombined.js` holds no tax-domain numeric constant, no jurisdiction name and no second definition of either settlement, and calls each settlement exactly once per sample | `node scripts/selftest.mjs` | No | `report.md#tp-05-15` |
| TP-05-16 | Regression E2E | e2e-ui | SCN-022-013 | `lifetime-tax-combined.spec.mjs` | `Regression: SCN-022-013 the combined total is the sum of two independent settlements` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the combined total is the sum of two independent settlements" --reporter=list` | Yes | `report.md#scenario-scn-022-013` |
| TP-05-17 | Regression E2E | e2e-ui | SCN-022-014 | `lifetime-tax-combined.spec.mjs` | `Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction" --reporter=list` | Yes | `report.md#scenario-scn-022-014` |
| TP-05-18 | Regression E2E | e2e-ui | SCN-022-015 | `lifetime-tax-combined.spec.mjs` | `Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure" --reporter=list` | Yes | `report.md#scenario-scn-022-015` |
| TP-05-19 | Accessibility E2E | e2e-ui | SCN-022-014 | `lifetime-tax-combined.spec.mjs` | `Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table" --reporter=list` | Yes | `report.md#tp-05-19` |
| TP-05-20 | Privacy E2E | e2e-ui | SCN-022-013 | `lifetime-tax-combined.spec.mjs` | `Regression: SCN-022-013 the request ledger stays empty across the full combined workflow` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the request ledger stays empty across the full combined workflow" --reporter=list` | Yes | `report.md#tp-05-20` |
| TP-05-21 | Registration absence | e2e-ui | SCN-022-013 | `lifetime-tax-combined.spec.mjs` | `Regression: SCN-022-013 the tool is absent from every registry and the market brief` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the tool is absent from every registry and the market brief" --reporter=list` | Yes | `report.md#tp-05-21` |
| TP-05-22 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-001 … -015 | Feature 021's five specs plus this feature's five | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-05-22` |
| TP-05-23 | Repo gate | unit | SCN-022-013 … -015 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-05-23` |
| TP-05-24 | Path guard | unit | SCN-022-013 … -015 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-05-24` |
| TP-05-25 | Deploy gate | unit | SCN-022-013 … -015 | `scripts/build-pages-site.mjs` | The Pages plan succeeds, `site-exclusions.json` is unchanged, no new root HTML exists, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-05-25` |

### Definition of Done

- [x] FR-022-028 is implemented: the two settlements are computed independently
      with no parameter through which either could reach the other, and
      `orderIndependence` is produced by settling both orders rather than by a
      constant.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-03`
- [x] The order-independence guard is proven able to fail, by both adversarial
      mutations: state consuming the federal total, and federal consuming the
      state total.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-04`, `report.md#tp-05-05`
- [x] FR-022-029 is implemented: the combined total sums the jurisdiction totals,
      inherits either refusal, and treats a sourced zero as a real addend through a
      contract-version branch rather than a value comparison.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-02`, `report.md#tp-05-06`
- [x] FR-022-030 is implemented: the coupling record carries an empty `modeled`
      list as a required member, names the unmodeled state-tax deduction, and
      populates the itemized notice exactly when the deduction mode is itemized.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-07`
- [x] FR-022-031 and FR-022-032 are implemented: three rates per point, no scalar
      average, and a sample set that is the exact union of the grid and both
      jurisdictions' crossings, proven by an adversarial mutation that drops the
      state's crossings.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-08`, `report.md#tp-05-09`, `report.md#tp-05-10`, `report.md#tp-05-14`
- [x] FR-022-033 is implemented: every contributing threshold carries a non-empty
      jurisdiction and pack id, an unattributable rate change is refused, and the
      no-tax state contributes a present, flat, attributed zero series.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-11`, `report.md#tp-05-12`
  - **Claim Source:** executed. The middle clause is now observed rather than
    reserved. `declaredEdges` reads deductions, rate tables and threshold sets
    but not `reliefMechanisms`, which the state engine prices — so a credit sized
    to exhaust away from every declared edge moves the state marginal rate where
    no pack declares a threshold. The new assertion drives the real
    `computeCombinedMarginalCurve` with that pack and observes
    `RLTAX-THRESHOLD-UNAVAILABLE` at domain `combined-curve:ordinary:segment`
    with no partial curve, against a control on the shipped fixture that still
    produces one. Probed through `scripts/red-green-probe.sh`: neutralising the
    guard's own condition moves the assertion `✗ FAIL` → `✓`. See
    `report.md#tp-05-11`.
- [x] FR-022-034 is implemented: a pack-year mismatch refuses naming both packs
      and both year sets, and no combined figure is produced.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-01`
- [x] A sweep whose union of crossings exceeds the budget refuses rather than
      dropping a jurisdiction's crossings.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-13`
- [x] `rltaxcombined.js` holds no tax-domain numeric constant, no jurisdiction
      name and no second definition of either settlement, and every engine module
      is byte-identical.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a path-scoped status check · **Evidence:** `report.md#tp-05-15`, `report.md#change-boundary`
- [x] Every displayed value carries a tooltip, the combined curve has a
      text-equivalent table with an accessible label, the whole surface is
      reachable by keyboard, and no unavailable state renders as an empty box, a
      bare dash or an unattributed zero.
  - **Phase:** implement · **Command:** the accessibility browser row · **Evidence:** `report.md#tp-05-19`
- [x] The request ledger does not grow after first paint across the full combined
      workflow, every entry in it is a same-origin read of a document the page's
      own configuration declares, and no household value reaches any URL,
      request, referrer or console message.
  - **Restated 2026-08-22 (F-REG-02).** The superseded text read "The request ledger stays empty across the full combined workflow", which is false: the cited row captures `afterFirstPaint = ledger.length` and asserts `expect(afterFirstPaint).toBeGreaterThan(0)` on the very next line, so the row and its own evidence asserted opposite things. The row now states the three propositions the run actually establishes, and each stays falsifiable. Adversarial cases: a request issued after first paint fails `expect(ledger.length).toBe(afterFirstPaint)`; a read of a document the configuration does not declare, or of any remote document, fails the permitted-path and cross-origin filters; a residency or income declaration reaching a URL, a request body, a referrer or a console message fails the sentinel assertions; and a boot that read nothing fails `expect(afterFirstPaint).toBeGreaterThan(0)`. This restatement matches the corrected `NFR-022-002`. The persistent title of the browser row still carries the superseded wording; renaming it is a test artifact and is routed rather than taken here. This restatement is `bubbles.plan`'s artifact; the tick is not, and remains for a verifying pass.
  - **Ticked 2026-08-22.** The referrer surface the previous pass recorded as
    unasserted is now read by the cited row itself: `document.referrer`, every
    header of every request resolved through `allHeaders()`, and the page URL
    that is the referrer's source, all feeding one `expect(carriers).toEqual([])`
    verdict with a non-empty-corpus pin and a live-detector control. The clause
    is proven falsifiable by an intended-RED probe whose summary is pinned to
    this scan's own `page-url:` carrier label, so the recorded RED is the
    referrer verdict failing rather than some other assertion in the row. No
    wording was narrowed to earn the tick.
  - **Phase:** implement · **Command:** the privacy browser row · **Evidence:** `report.md#tp-05-20`, `report.md#scn-022-013-referrer-surface-closed-2026-08-22`
- [x] The tool is still absent from `tools.json`, `index.html`, `rlnav.js`,
      `README.md`, `notes/README.md` and market-brief coverage, and no new root
      HTML exists.
  - **Phase:** implement · **Command:** the registration-absence browser row plus `node scripts/build-pages-site.mjs --dry-run` · **Evidence:** `report.md#tp-05-21`, `report.md#tp-05-25`
  - **Evidence:** derived, not asserted. The detector was proven live first — five
    hits on the route page that does carry the token — and then returned zero on
    all six named surfaces, read both in the working tree and from the `HEAD`
    blob so a concurrent session's unrelated dirt on `notes/README.md` could not
    flatter the result. Market-brief coverage was scanned across all thirteen
    `market-brief.*` surfaces rather than the single config file the row names,
    all zero. No scope-05 commit adds a root HTML, and exactly one `lifetime-tax`
    root page exists — the route itself, which predates this scope. Both named
    commands ran green: the browser row `1 passed` at exit 0, and the Pages dry
    run at exit 0 with `registeredPages` 28 and `site-exclusions.json` clean. The
    row's missing intended-RED is a separate matter and is carried by the Test
    Plan evidence item below, which stays open and names TP-05-21.
- [x] The supersession ledger is closed, **derived rather than pinned**: every `SUP-022-NN` marker
      found in the five opened files is a row in the feature ledger; every ledger row the ledger's
      own `Disposition` column marks `marker required` carries a marker; every row it marks `marker
      forbidden` carries none anywhere in the tree; the only rows permitted to go unmarked are those
      the ledger itself dispositions `marker forbidden` or `marker pending`, read out of the ledger
      at run time rather than compared against a literal pair of ids, so a pending row's legitimate
      delivery shrinks the tolerated gap instead of falsifying this item; every row carries one of
      the three recognised dispositions and each tolerated one carries a reason, so an unreadable
      column is a failure rather than a free pass; the tolerated set never covers the whole ledger;
      the ids stay inside the declared range; the ledger total agrees three ways with the opening
      paragraph, the `Owning scope` column and step 4 of `design.md`'s marker check; this scope
      superseded nothing itself; the combined curve chart and its text-equivalent table render in
      Power rather than Simple; and every pre-existing assertion outside the ledger still passes
      unchanged.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#step-3--the-ledger-census-re-run-against-the-derived-form-2026-08-20`
  - **Evidence:** the derived form is in `scripts/selftest.mjs` and `SUP-022-19` is
    delivered, in that order. `node scripts/selftest.mjs` is `3155 passed, 0
    failed`. Every limb was checked on its own: `markersWithoutLedgerRow`,
    `unexplainedUnmarked`, `forbiddenButMarked`, `undispositionedRows` and
    `toleratedWithoutReason` are all empty; the disposition tally is 20 required,
    1 forbidden, 1 pending, so exactly one of twenty-two rows is both tolerated and
    unmarked; the total agrees three ways at 22 (opening paragraph, `Owning scope`
    tallying 12 + 9 + 1, and `design.md` step 4); no row is owned by this scope;
    and both the combined curve chart and its text-equivalent table sit inside
    `#power-combined` within the Power section. Four value-free adversarial
    mutations were each applied and reverted inside the invocation that applied
    them and each turned the assertion red — a dropped required marker
    (`3152 passed, 3 failed`), a marker attached to a forbidden row, a blanked
    `Disposition` cell, and every row dispositioned away (each `3154 passed, 1
    failed` with TP-05-22 alone).
  - **History — why this stayed open until 2026-08-20.**
    The census was run and the row as originally written failed
    twice over, and the second failure was a defect in the row rather than in the
    tree. It asked for **twenty-one** entries; the ledger declares **twenty-two**,
    because Scope 03's dispatch admitted `SUP-022-22` after the row was written.
    Separately, only **twenty** markers are delivered: `SUP-022-18` and
    `SUP-022-19` appear in `spec.md`, `design.md` and several scope artifacts but
    in no source or test file. `bubbles.test` then established what each of those
    two actually is — `SUP-022-18` was displaced in substance by `SUP-023-04` and
    `SUP-023-05` and must carry no marker at all, while `SUP-022-19`'s narrowed
    declared-target clause is genuine, buildable work that it built, proved with
    an intended RED and a same-command GREEN, and reverted. It reverted because
    the assertion carrying this row pinned the tolerated gap to the exact pair
    `{18, 19}` under `JSON.stringify`, so delivering `SUP-022-19` shrank the real
    gap to one id and turned a green assertion red — a self-staling contract that
    made provable work unlandable (finding **F-02-D**). The row is restated above
    to derive its tolerance from the ledger's `Disposition` column, which now
    records `marker forbidden` for `SUP-022-18` and `marker pending` for
    `SUP-022-19`. Both halves have since landed in the mandated order — the
    derived form went into `scripts/selftest.mjs` first, then `SUP-022-19` was
    delivered — and the census re-ran green against the derived form, which is
    what closes this item above.
- [x] No output states a probability, a lifetime figure, a break-even year, a
      ranking, a recommendation, a track record or an error rate, and no result is
      labelled a complete combined tax.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
  - **Evidence:** seven detectors were run over this scope's two output paths,
    each proven live on a control string first, with a sanity token that must be
    present so a scan which cannot read its inputs cannot report clean. That guard
    earned its place: the first run reported zero everywhere because zsh did not
    word-split the unquoted path list and `grep` was handed one non-existent
    filename. On the valid rerun, probability, break-even year, recommendation,
    track record and error rate are zero. The three lifetime-figure hits are the
    tool's own name — banner, `<title>`, `<h1>` — and all four ranking hits are
    disclaimers that deny the claim. `completeCombinedTax` has exactly one
    assignment in the tracked tree, the literal `false`, and the page prints that
    value through `String(...)` rather than a hand-written word.
    `node scripts/selftest.mjs` is green at `3106 passed, 0 failed`.
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including every browser row and the full cumulative suite.
  - **Phase:** implement · **Command:** the exact TP-05-01 through TP-05-22 commands · **Evidence:** `report.md#test-evidence`
  - **Evidence:** all twenty-two rows the item's own Command field names now carry
    an intended RED and a same-command GREEN. The five that were missing on
    2026-08-20 were closed through `scripts/red-green-probe.sh`, which reverts under
    its own `EXIT`/`INT`/`TERM` trap and re-verifies the file against its committed
    blob hash: TP-05-16 by reclassifying a sourced zero as an ordinary computed
    amount, TP-05-17 by stripping the owning jurisdiction off every declared edge,
    TP-05-18 by extending a pack into a year it does not declare, TP-05-21 by
    dropping the combined module out of the deploy exclusion list, and TP-05-22 by
    the TP-05-16 mutation run against the whole cumulative suite. TP-05-11 was
    closed earlier the same day by the same harness. **Recorded rather than
    absorbed, twice.** First, TP-05-21's *registration* clause is still unprobed —
    the only mutation that drives it is to register the tool, which is barred — so
    the row's RED rides its deploy-projection clause; the row is proven live, the
    six-surface scan is not. Second, TP-05-22 could not be discriminated by exit
    code: the suite exits `1` even when it reports `77 passed`, zero failed and zero
    skipped, because teardown force-kills a worker after every test passes. The
    verdict rides the summary channel — `76 passed` mutated against `77 passed`
    reverted. TP-05-23 … TP-05-25 are outside this item, which scopes itself to
    TP-05-01 through TP-05-22 in its Command field.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count and no
      existing assertion edited, `node scripts/validate-spec-test-paths.mjs`
      reports zero new missing paths, and `node scripts/build-pages-site.mjs
      --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-05-23`, `report.md#tp-05-24`, `report.md#tp-05-25`
