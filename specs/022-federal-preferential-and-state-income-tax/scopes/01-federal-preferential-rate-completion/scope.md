# Scope 1: Federal Preferential Rate Completion

## 01-federal-preferential-rate-completion

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** `foundation:true`, `provenance-critical:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** none
**Foundation:** true

**Primary Outcome:** a household holding a long-term capital gain or a qualified
dividend receives a real federal total instead of `RLTAX-THRESHOLD-UNAVAILABLE`,
because a rate table can now carry per-component provenance — its breakpoints
citing the inflation Revenue Procedure and its top-band rate citing the IRS
authority that states the statutory rate. Every component of every figure displays
the authority that establishes that specific component, and any component that
could not be retrieved remains an `AbsentFigure/v1`.

## Requirement Coverage

- **FR-022-001** — default citation plus per-component override list.
- **FR-022-002** — every effective component citation names a retrieved,
  non-newsroom source.
- **FR-022-003** — every effective component citation carries a locator.
- **FR-022-004** — the preferential table is carried per filing status where every
  component was retrieved, and absent where any was not.
- **FR-022-005** — preferential income stacks above ordinary taxable income;
  qualified dividends and long-term gains are pooled and taxed identically.
- **FR-022-006** — the pack names every preferential category it does not carry
  and no code path folds an unnamed category into a carried band.
- **FR-022-007** — no figure is derived, interpolated, extrapolated, carried
  between tax years, or taken from a summary release.

Inherited and re-asserted: **NFR-022-001** determinism, **NFR-022-005** no
in-module rule value, **NFR-022-007** append-first selftest, **NFR-022-009**
Feature 008 byte-identity, **NFR-022-010** harness conventions, **NFR-022-011**
supersession ledger conformance.

## Gherkin Scenarios

```gherkin
Scenario: SCN-022-001 A preferential rate table carries two authorities and both are displayed
  Given a resolved federal pack whose preferential rate table carries breakpoints from one authority and a top-band rate from another
  When the household opens the rule detail for that table
  Then each band rate and each breakpoint displays the title, URL, retrieval date and locator of the authority that establishes that specific component
  And an overridden component is visually distinguished from a component that inherited the table default
  And a component citing a source that was not retrieved, or citing a newsroom release, is refused rather than displayed

Scenario: SCN-022-002 A household with preferential income receives a real total
  Given a household with ordinary income and a realized long-term capital gain for the declared tax year
  When the annual federal tax is computed
  Then the preferential amount is priced in the bands sitting above ordinary taxable income and the total federal tax is a valued record rather than a refusal
  And the result is exact immediately below, exactly at, and immediately above every preferential breakpoint the pack carries
  And qualified dividends receive treatment identical to long-term capital gains

Scenario: SCN-022-003 A preferential category the pack does not carry refuses rather than being folded in
  Given the pack lists every preferential category taxed above its top carried rate as an unsupported feature
  When the household opens the preferential detail
  Then each unsupported category is named with its own reason
  And no code path folds any of them into the supported preferential bands
  And the result is not labelled a complete federal tax
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-022-001 provenance | Valid workspace, resolved pack | Open the rule detail, then the preferential table row | Per-component source rows; the overridden top-band rate visually distinct from the inherited breakpoints; each with title, URL, retrieval date and locator | e2e-ui |
| SCN-022-002 real total | Valid workspace | Enter ordinary income and a long-term gain, then a qualified dividend of the same amount instead | A valued total in both cases, identical between the two, with a rule status | e2e-ui |
| SCN-022-002 boundary | Valid workspace | Enter amounts placing preferential income below, at and above a breakpoint | Three distinct totals matching the values derived from the pack's own table | e2e-ui |
| SCN-022-003 unsupported | Valid workspace | Open the preferential detail | Every unsupported preferential category named with a reason; no complete-federal-tax label anywhere | e2e-ui |
| Absent status | Workspace in a status whose preferential table is absent | Open the result | `RLTAX-THRESHOLD-UNAVAILABLE` with the `missingSource` pointer, and no numeral in its place | e2e-ui |

## Implementation Files

### New

- Known-value fixture files for every preferential breakpoint, for each filing
  status the pack carries, each naming the source edition and tax year it was
  derived from.
- A provenance fixture pack exercising the refusal branches: a component citing a
  `not-retrieved` source, a component citing a newsroom release, a duplicate
  component override, and a component path naming an absent band.

### Modified

- `rltaxrules.js` — `ComponentSource/v1`, `componentKindOf`, `SourceRecord/v2`,
  `RateTable/v2`, `validateComponentSources`, `effectiveSourceFor`, and
  per-component-kind year containment. `RateTable/v1` and `SourceRecord/v1` stay
  valid.
- `tax-rules/federal/<year>.json` — version bump; preferential tables promoted to
  `RateTable/v2` for every status whose components were retrieved; the unsupported
  preferential categories added to `unsupportedFeatures[]`.
- `lifetime-tax-strategy-lab.html` — the `ComponentSourceLedger` surface in Power.
- `scripts/selftest.mjs` — one appended assertion group, plus the six
  `SUP-022-*` replacements this scope owns there.
- `tests/lifetime-tax-federal.spec.mjs` — `SUP-022-07` only. Title byte-identical.
- `tests/lifetime-tax-foundation.spec.mjs` — `SUP-022-09` and `SUP-022-12` only.
  Titles byte-identical.
- `tests/lifetime-tax-marginal.spec.mjs` — `SUP-022-13` only. Title
  byte-identical.
- `tests/lifetime-tax-route.spec.mjs` — `SUP-022-17` only. Title byte-identical.

## Implementation Plan

1. Add `ComponentSource/v1` to `rltaxrules.js` with the closed `component` path
   grammar from `design.md`. Every function is a top-level declaration; numeric
   guards use `Number.isFinite`.
2. Add `RateTable/v2` accepting `componentSources[]`. Retain every `v1` band rule
   unchanged — non-empty, ascending, first lower bound zero, contiguous, last
   upper bound `null` and `null` legal nowhere else, rate in the unit interval,
   closed `thresholdKind`, inclusive-lower and exclusive-upper edges. Accept a
   `v1` table unchanged and assert that acceptance against the unmodified
   Feature 021 pack.
3. Implement `validateComponentSources`: every `component` path resolves to a
   component that exists in the enclosing figure; no two entries name the same
   component; every `sourceRef` names a `SourceRecord` whose `retrievalOutcome` is
   `retrieved` and whose `documentKind` is not `newsroom-release`; every entry
   carries a non-empty `locator`. Each violation is `RLTAX-PACK-INVALID`, once per
   offending entry, with the component named.
4. Implement `componentKindOf` and `SourceRecord/v2` per
   [`design.md`](../../design.md#per-component-kind-year-containment): the total,
   closed four-kind map; `"year-invariant"` admissible only with a non-empty
   `yearInvarianceBasis` for that kind; an empty array a legal value that refuses
   every component of that kind; and a `SourceRecord/v1` named by any component of
   a `RateTable/v2` refused `RLTAX-PACK-INVALID`. Implement containment as a
   per-component-kind check, never against a whole-record year list. A flat list
   cannot satisfy SUP-022-02 and `TP-01-07` simultaneously, which is why this step
   exists as its own step rather than as a clause of the one above it.
5. Implement `effectiveSourceFor(figure, componentPath)` returning the override
   when present and the figure default otherwise, expanded to
   `{ title, url, retrievedAt, locator }` plus a flag stating whether the citation
   was inherited or overridden. It refuses rather than returning a default when
   the figure carries none.
6. **Retrieve `BI-1`.** The authority question is closed and the document is
   named: Rev. Proc. 2025-32 §4.03, IRB 2025-45, whose heading carries the
   declared-year label. Closure names the document; it does not supply the figure.
   Open §4.03, transcribe the maximum zero rate amount and the maximum 15-percent
   rate amount for each filing status directly from it, and record the retrieval in
   a `SourceRecord/v2` with this session's own `retrievedAt` and its own
   `declaredApplicableYearsByComponentKind`. Do **not** transcribe from `spec.md`,
   whose `RL-3` figures are a lead and a mismatch check, never a source; a
   disagreement between what you read and what `RL-3` records is a stop and a
   report. Any status whose figures cannot be read ships as an `AbsentFigure/v1`
   with a `missingSource` pointer, and no partial table ships.
7. **Retrieve `BI-3`.** The authority question is closed and the document is
   named: Topic no. 409. Open it, transcribe the rate applying above the maximum
   15-percent rate amount into a single `componentSources[]` override on the top
   band, and transcribe the three categories taxed above it into
   `unsupportedFeatures[]` per the deferral decision recorded in `spec.md`. Record
   its `SourceRecord/v2` with `rate` as `"year-invariant"` plus its cited
   `yearInvarianceBasis`, and `breakpoint` and `amount` carrying only the year the
   page itself labels. The 0-percent and 15-percent band rates inherit the table
   default, because the Revenue Procedure's own naming of its two amounts states
   those two rates.
8. Do **not** take any dollar breakpoint from the rate authority. Its amounts
   carry a different tax year and using them would be a tax-year mixing defect
   wearing a citation. `TP-01-07` exists to prove this cannot pass unnoticed, and
   it can only fire because containment is evaluated per component kind.
9. Verify `CO-7` now runs against a real table for the statuses whose tables
   resolved. No stacking arithmetic changes; Feature 021 already implemented and
   tested it against a fixture, and this scope only supplies the table it was
   waiting for.
10. Render `ComponentSourceLedger` in Power: per figure, per component, the
    effective title, URL, retrieval date and locator, with overrides visually
    distinguished from inherited defaults. It is a Power surface; this scope adds
    no Simple field and therefore touches no Simple contract.
11. Append a `lifetime-tax — per-component provenance and preferential completion`
    group to `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltaxrules.js` validator | `RateTable/v2` accepted alongside `v1` | Scopes 02, 03, 04, 05 and the shipped Feature 021 pack | High — a `v2` validator that rejects a `v1` table breaks the shipped pack and every Feature 021 test at once | Validate the **unmodified** Feature 021 pack through the new validator and assert it passes unchanged, BEFORE any `v2` table is authored | Revert the validator; `v1` tables are untouched |
| `tax-rules/federal/<year>.json` | Version bump, tables promoted | Every scope and every Feature 021 test | High — a promoted table with a wrong component path silently changes a total | Re-run Feature 021's full assertion group against the bumped pack and assert every previously passing value is unchanged | Revert the pack file; the validator still accepts the prior version |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the appended group |
| `lifetime-tax-strategy-lab.html` | Power ledger added | Scope 05 | Low — same-feature page | The CSP meta stays byte-identical | Revert the panel |

## Change Boundary And Protected Paths

**Allowed new:** this scope's fixture files.

**Allowed modified:** `rltaxrules.js` · `tax-rules/federal/<year>.json` ·
`lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs` (append-first; existing
assertions only under SUP-022-01, -02, -04, -05, -06, -11) ·
`tests/lifetime-tax-federal.spec.mjs` (SUP-022-07 and SUP-022-21 expectations
only) ·
`tests/lifetime-tax-foundation.spec.mjs` (SUP-022-09 and SUP-022-12 expectations
only) · `tests/lifetime-tax-marginal.spec.mjs` (SUP-022-13 expectation only) ·
`tests/lifetime-tax-route.spec.mjs` (SUP-022-17 expectation only) · this scope's
Playwright spec.

The four Feature 021 test files are named here because SUP-022-07, -09, -12, -13
and -17 cannot be delivered without them. Each file is opened **only** for the
clauses named beside it, and no other clause in any of those files may be touched.
Every test title stays byte-identical, because titles are the `--grep` contract.

**`tests/lifetime-tax-marginal.spec.mjs` is deliberately in the allowed list and
deliberately not in the excluded list.** An earlier revision of this plan had it
in both — permitted to Scope 02 for SUP-022-08 while Scope 01 forbade itself the
edit its own SUP-022-13 requires. That contradiction is resolved in favour of
widening Scope 01, not of moving SUP-022-13 to Scope 02: the long-term gain curve
becomes computable **in Scope 01**, so the expectation breaks inside Scope 01's
change, and ASC-3 requires the replacement in the same change. Deferring it would
leave a red suite at the end of Scope 01. Scope 01 touches only the SUP-022-13
expectation in that file; Scope 02 later touches only the three SUP-022-08
expectations; neither may touch the other's.

**Excluded — this scope must not change any of these:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` · `tools.json` ·
`index.html` · `rlnav.js` · `README.md` · `notes/README.md` · `market-brief.*` ·
`briefs/**` · `data/**` · `watchlist.json` · `site-exclusions.json` ·
`scripts/build-pages-site.mjs` · `scripts/validate-spec-test-paths.baseline` ·
`rltax.js` · `rltaxworkspace.js` · `rltaxstrategy.js` ·
`tests/lifetime-tax-conversion.spec.mjs` · `tests/lifetime-tax.support.mjs` ·
every framework-managed file.

Every file in the excluded list carries **no** `SUP-022-*` marker owned by this
scope, per the [per-file marker distribution](../../design.md#per-file-marker-distribution).
That is the test for membership, and it is what keeps the boundary and the ledger
from contradicting each other again.

### Excluded-Path Groups

The excluded list is not one kind of path, and one test cannot decide all of it.
DoD item 11 limb 1(b) decides each group on its own terms.

**Group E1 — frozen product surfaces.** `rltax.js` · `rltaxworkspace.js` ·
`rltaxstrategy.js` · `tests/lifetime-tax-conversion.spec.mjs` ·
`tests/lifetime-tax.support.mjs` · `rlportfolio.js` · `rlportfolioanalytics.js` ·
`portfolio-survival-allocation.config.json` · every framework-managed file. The
lifetime-tax engine and workspace modules, the two Feature 021 test files this
scope did not open, and Feature 008's module, analytics and pack. No automation
writes any of them and no other active feature arc has business in them, so a
commit touching one is this scope's to explain whatever its subject claims.

**Group E2 — shared registry and generated surfaces.** `tools.json` ·
`index.html` · `rlnav.js` · `site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` · `watchlist.json` · `market-brief.*` ·
`briefs/**` · `data/**`. These churn under foreign work by design: a new tool
registers itself in the registry trio, the brief refresh rewrites the brief and
data files on a schedule, and any feature may prune the spec-test-path baseline.
Freezing them would break this scope's plan every time an unrelated session
commits, which is the defect finding **F-01-N** already recorded once.

**Group E3 — foreign evidence and documentation.**
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` · `README.md` ·
`notes/README.md`. Evidence records and prose, not product. A verification session
legitimately records two features' evidence in one commit, so co-membership in a
commit carries no boundary signal here.

`rltax.js` is excluded deliberately. This scope supplies a table the engine was
already written to consume; if the engine needs a change to consume it, the
contract is wrong and that is a finding rather than an edit.

**Rollback:** revert the pack file and the validator addition; delete the
fixtures; revert the page panel and the appended selftest group. Reverting the
twelve `SUP-022-*` replacements restores the Feature 021 originals verbatim,
because every one of them either retains the original clause or moves it onto a
fixture; none is deleted.

## Assertion Supersession Owned By This Scope

This scope owns twelve of the twenty-two entries in the
[supersession ledger](../../spec.md#supersession-ledger) and follows the
[per-scope procedure](../_index.md#assertion-supersession-procedure) for each.
Twelve is the count everywhere in this scope. It is derived from the ledger's
`Owning scope` column, which carries twelve rows reading `01`, and it agrees with
the twelve markers the
[per-file marker distribution](../../design.md#per-file-marker-distribution)
assigns this scope.

| Entry | Target | Shape | Replacement in one line |
| --- | --- | --- | --- |
| SUP-022-01 | `scripts/selftest.mjs` ~L11244 | derive | Pack-derived cited-figure count plus full `ComponentSource` validity on every figure and every override |
| SUP-022-02 | `scripts/selftest.mjs` ~L11461 | partition | Present tables prove split-authority provenance and per-component-kind year containment; absent tables keep the original clause verbatim, exercised against the fixture pack |
| SUP-022-04 | `scripts/selftest.mjs` ~L11861 | derive | Two-directional set identity between surfaced notices and pack entries, with the three preferential category ids added |
| SUP-022-05 | `scripts/selftest.mjs` ~L11781 | relocate | Valued, reconciling total for resolved statuses; the whole original refusal assertion moves onto an absent-table fixture |
| SUP-022-06 | `scripts/selftest.mjs` ~L12156 | relocate | Exact crossings at every carried breakpoint plus gain/dividend curve identity; original refusal retained on the fixture |
| SUP-022-07 | `tests/lifetime-tax-federal.spec.mjs` L57-81 | derive | Quantitative stacking assertion derived from the pack, plus the explicit empty-state rule for the absent-figure inventory |
| SUP-022-09 | `tests/lifetime-tax-foundation.spec.mjs` L60-71 | derive | Both rendered counts derived from the pack; per-node code and remediation clauses retained unchanged |
| SUP-022-11 | `scripts/selftest.mjs` ~L12416 | relocate | A valued conversion difference equal to an independent recomputation; the whole original refusal moves onto the absent-table fixture |
| SUP-022-12 | `tests/lifetime-tax-foundation.spec.mjs` L66-73 | partition | A valued headline that moves by the pack-implied amount; every refusal clause retained verbatim on the absent-table branch |
| SUP-022-13 | `tests/lifetime-tax-marginal.spec.mjs` L121 | relocate | A rendered gain curve exact at every carried breakpoint and identical to the dividend curve; the refusal retained on a substituted absent-table pack |
| SUP-022-17 | `tests/lifetime-tax-route.spec.mjs` L82 | derive | Pack-derived source-record count, two-directional title identity, and the referrer guard widened from the first link to every link |
| SUP-022-21 | `tests/lifetime-tax-federal.spec.mjs` L132 | derive | The Power panel names the preferential schedule as a carried rule with its declared calculation order and its split authority, instead of the raw member name the empty absent-figure inventory used to print |

SUP-022-04 and SUP-022-09 are amended by Scope 02 after this scope delivers them.
That amendment edits this scope's replacement, not a Feature 021 original, and
carries no new ledger entry. No other entry this scope owns is amended, because
every one derives its expected value from the artifact it describes.

**This scope supersedes nothing else.** An assertion outside these twelve that
fails is a defect in this scope's change and is fixed rather than edited.

## Scenario-First Red/Green Contract

Add the named known-value assertion or the persistent browser title first, run the
exact command, and confirm the intended contract assertion is what fails. Then
implement the smallest owned change and rerun the identical command.

**Named intended-RED assertion for this scope:** a `RateTable/v2` whose top-band
rate override cites a source record with `retrievalOutcome: "not-retrieved"` must
be refused `RLTAX-PACK-INVALID` naming that component. Before
`validateComponentSources` exists, this assertion fails because the override is
accepted. A syntax error, a missing browser or an absent test does not satisfy
RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Contract | unit | SCN-022-001 | `scripts/selftest.mjs` | `RateTable/v2` validates with an override list; every component path resolves; a path naming an absent band, a duplicate component, an empty locator, a `not-retrieved` source and a newsroom source are each refused `RLTAX-PACK-INVALID` naming the component | `node scripts/selftest.mjs` | No | `report.md#tp-01-01` |
| TP-01-02 | Compatibility | unit | SCN-022-001 | `scripts/selftest.mjs` | The unmodified Feature 021 pack validates unchanged through the new validator, and every `RateTable/v1` table is accepted with its default citation intact | `node scripts/selftest.mjs` | No | `report.md#tp-01-02` |
| TP-01-03 | Contract | unit | SCN-022-001 | `scripts/selftest.mjs` | `effectiveSourceFor` returns the override when present and the default otherwise, flags which it returned, and refuses rather than defaulting when the figure carries no default | `node scripts/selftest.mjs` | No | `report.md#tp-01-03` |
| TP-01-04 | Known value | unit | SCN-022-002 | `scripts/selftest.mjs` | Preferential tax is exact immediately below, exactly at, and immediately above every breakpoint the pack carries, for every filing status whose table resolved, against values derived from the pack's own table | `node scripts/selftest.mjs` | No | `report.md#tp-01-04` |
| TP-01-05 | Known value | unit | SCN-022-002 | `scripts/selftest.mjs` | A qualified dividend and a long-term capital gain of the same amount produce an identical total, and pooling order does not change the result | `node scripts/selftest.mjs` | No | `report.md#tp-01-05` |
| TP-01-06 | Known value | unit | SCN-022-002 | `scripts/selftest.mjs` | `totalFederalTax` is a valued record for a household with preferential income in a status whose table resolved, and remains `RLTAX-THRESHOLD-UNAVAILABLE` for a status whose table is absent | `node scripts/selftest.mjs` | No | `report.md#tp-01-06` |
| TP-01-07 | Adversarial | unit | SCN-022-001 | `scripts/selftest.mjs` | Regression: a table whose breakpoints are overridden to the rate authority — whose `breakpoint` kind declares a different tax year — is demonstrated to fail per-component-kind containment, **while the top-band rate override to that same authority passes**, proving the two outcomes are separable and that a flat whole-record year list could not produce both | `node scripts/selftest.mjs` | No | `report.md#tp-01-07` |
| TP-01-08 | Adversarial | unit | SCN-022-003 | `scripts/selftest.mjs` | Regression: an implementation that prices an unsupported preferential category in a carried band is demonstrated to fail the unsupported-feature enumeration assertion | `node scripts/selftest.mjs` | No | `report.md#tp-01-08` |
| TP-01-09 | Coverage boundary | unit | SCN-022-003 | `scripts/selftest.mjs` | Every preferential category the pack does not carry is present in `unsupportedFeatures[]` with a reason, and no code path emits a label asserting a complete federal tax | `node scripts/selftest.mjs` | No | `report.md#tp-01-09` |
| TP-01-10 | Absence discipline | unit | SCN-022-002 | `scripts/selftest.mjs` | A filing status whose preferential components were not all retrieved carries an `AbsentFigure/v1` with a `missingSource` pointer, carries no `value`, `amount`, `rate`, `bands` or `default` member, and no partial table ships for it | `node scripts/selftest.mjs` | No | `report.md#tp-01-10` |
| TP-01-11 | Determinism | unit | SCN-022-002 | `scripts/selftest.mjs` | Repeated computation over identical input produces a byte-identical result, with global `fetch` stubbed to throw for the whole group. **AUTHORED.** The append-only group `Feature 022 Scope 01 — preferential settlement determinism` settles a household carrying preferential income 50 times over byte-identical input, for every filing status whose preferential table the pack carries and for both preferential income kinds, comparing a key-order-normalised sha256 digest and the raw serialisation, and asserting the preferential leg is priced rather than refused; an adversarial probe proves the comparison can see a single mutated member. It is this scope's own group and is not satisfied by the `TP-01-11` assertions belonging to other features' scope-01 plans. The row's own intended RED and same-command GREEN are both captured; the RED debt still open on this scope is the browser capture for TP-01-13 through TP-01-16 under DoD item 10, not this assertion | `node scripts/selftest.mjs` | No | `report.md#tp-01-11` |
| TP-01-12 | No-shadow | unit | SCN-022-002 | `scripts/selftest.mjs` | Regression: `rltaxrules.js` and `rltax.js` contain no tax-domain numeric constant, no bracket table, no jurisdiction name and no authority name; both detectors are proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-01-12` |
| TP-01-13 | Regression E2E | e2e-ui | SCN-022-001 | `lifetime-tax-preferential.spec.mjs` | `Regression: SCN-022-001 a preferential table displays a distinct source per component` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-001 a preferential table displays a distinct source per component" --reporter=list` | Yes | `report.md#scenario-scn-022-001` |
| TP-01-14 | Regression E2E | e2e-ui | SCN-022-002 | `lifetime-tax-preferential.spec.mjs` | `Regression: SCN-022-002 a household with preferential income receives a valued federal total` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-002 a household with preferential income receives a valued federal total" --reporter=list` | Yes | `report.md#scenario-scn-022-002` |
| TP-01-15 | Regression E2E | e2e-ui | SCN-022-003 | `lifetime-tax-preferential.spec.mjs` | `Regression: SCN-022-003 unsupported preferential categories are named and never folded in` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-003 unsupported preferential categories are named and never folded in" --reporter=list` | Yes | `report.md#scenario-scn-022-003` |
| TP-01-16 | Broader Regression E2E | e2e-ui | SCN-021-001 … -015 | `lifetime-tax-foundation.spec.mjs`, `lifetime-tax-federal.spec.mjs`, `lifetime-tax-marginal.spec.mjs`, `lifetime-tax-conversion.spec.mjs`, `lifetime-tax-route.spec.mjs` | Execute Feature 021's cumulative browser suite over the real route and prove no regression. Every title is byte-identical. Only the SUP-022-07, -09, -12, -13 and -17 expectations differ, and each differs exactly as its ledger entry specifies | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-" --reporter=list` | Yes | `report.md#tp-01-16` |
| TP-01-17 | Repo gate | unit | SCN-022-001 … -003 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-01-17` |
| TP-01-18 | Path guard | unit | SCN-022-001 … -003 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-01-18` |
| TP-01-19 | Deploy gate | unit | SCN-022-001 … -003 | `scripts/build-pages-site.mjs` | The Pages plan succeeds and `site-exclusions.json` is unchanged, proving no new root HTML entered without a deploy decision | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-01-19` |
| TP-01-20 | Supersession conformance | unit | SCN-022-001 … -003 | `scripts/selftest.mjs` | The marker check: every distinct `SUP-022-NN` marker in the repository is a ledger id, the delivered set equals this scope's twelve owned entries, each marked region names its shape, and each of the twelve markers sits in the file the per-file marker distribution assigns it and in no other. The row does **not** claim to detect an unmarked edit; a marker-set comparison cannot see one, and DoD item 15 carries the limbs that cover that ground instead | `node scripts/selftest.mjs` | No | `report.md#tp-01-20` |
| TP-01-21 | Supersession adversarial | unit | SCN-022-002 | `scripts/selftest.mjs` | Regression: each retained branch is proven non-vacuous by running against the absent-table fixture, and the fabricated-figure case — a present preferential table with no citation, and a plausible total returned for the absent-table fixture — is demonstrated to fail | `node scripts/selftest.mjs` | No | `report.md#tp-01-21` |

### Definition of Done

- [x] FR-022-001 through FR-022-003 are implemented: a figure carries a default
      citation plus an override list, every effective component citation names a
      retrieved non-newsroom source, and every one carries a locator.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-01`, `report.md#tp-01-03`
- [x] `RateTable/v1` is accepted unchanged and the unmodified Feature 021 pack
      validates and produces every previously passing value.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-02`
- [x] `BI-1` and `BI-3` were closed by retrievals performed in the implementation
      session, each recorded in a `SourceRecord/v1` with its own `retrievedAt`,
      and every figure transcribed directly from the opened document.
  - **Phase:** implement · **Command:** the retrieval record in the pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`
- [x] Every figure that a retrieval failed to establish ships as an
      `AbsentFigure/v1` with a `missingSource` pointer and no smuggled numeric
      member. No partial table ships for any status.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-10`
- [x] FR-022-004 and FR-022-005 are implemented: the preferential table resolves
      per status, preferential income stacks above ordinary taxable income, and
      the two preferential kinds are pooled and taxed identically.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-04`, `report.md#tp-01-05`, `report.md#tp-01-06`
- [x] Known-value boundary coverage exists for every preferential breakpoint the
      pack carries — below, at, and above — for every filing status, and each
      fixture names the source edition and tax year it was derived from.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-04`, `report.md#verification-pass-2--2026-08-18--dod-item-6-now-holds`
- [x] FR-022-006 and FR-022-007 are implemented: every uncarried preferential
      category is named, and the tax-year mixing adversarial case proves the guard
      can fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-07`, `report.md#tp-01-08`, `report.md#tp-01-09`
- [x] No module holds a tax-domain numeric constant, a bracket table, a
      jurisdiction name or an authority name, and both detectors are proven to
      fire on a module that does.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-12`, `report.md#verification-pass-2--2026-08-18--dod-item-8-now-holds`
- [x] No output states a probability, a lifetime figure, a track record or an
      error rate, and no result is labelled a complete federal tax.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Phase:** implement · **Command:** the exact TP-01-01 through TP-01-16 commands · **Evidence:** `report.md#verification-pass-5--2026-08-19--tp-01-13-intended-red-and-same-command-green`, `report.md#verification-pass-5--2026-08-19--tp-01-14-first-draft-missed-its-own-mutation-finding-f-01-p-was-strengthened-then-red-and-same-command-green`, `report.md#verification-pass-5--2026-08-19--tp-01-15-intended-red-and-same-command-green`, `report.md#verification-pass-5--2026-08-19--tp-01-16-intended-red-and-same-command-green`
  - **Closed at verification pass 5.** The four browser rows F-01-O named —
    TP-01-13, TP-01-14, TP-01-15 and TP-01-16 — now each carry an intended RED and a
    same-command GREEN, captured under `--project=system-chrome`. Every mutation was
    value-free (a provenance label, two formula changes and a rendered disclosure
    flag; never a household figure), was reverted inside the shell invocation that
    applied it under an `EXIT`/`INT`/`TERM` trap, and left `probe_residue=0`.
    TP-01-14's first draft **passed** under its own mutation; that miss is recorded
    as finding **F-01-P** and the row was strengthened with a stacked boundary family
    before its RED was accepted, rather than a false GREEN being banked. TP-01-21's
    RED half is the adversarial failure the row fires inside its own command, already
    recorded at `report.md#tp-01-21`. F-01-O is closed.
- [ ] Every excluded path is unchanged **by this scope**, and the four Feature 021
      test files this scope opened stay confined to the clauses the ledger assigns
      them. Three limbs, each decidable against the tree as it stands.

      **Limb 1 — attribution.** No change to any excluded path — in the working
      tree or in history since the delivery commit `b9d92a3f1` — is attributable to
      Feature 022. The limb states that property rather than naming the foreign
      commits that happen to satisfy it today. A closed commit list goes stale the
      moment any unrelated session commits, and this repository has concurrent
      sessions committing continuously, so an enumeration re-breaks the limb
      without anything about this scope having changed. Two conditions decide it,
      each re-decidable against the tree as it stands.

      *(a) Working tree.* `git diff` and `git diff --cached` restricted to the
      excluded list carry no `SUP-022` marker and no tax-domain content — no
      bracket, rate, breakpoint, filing status, declared tax year or tax authority.
      Feature 022's entire subject is tax rules and their provenance, so an
      uncommitted hunk carrying none of it is not this scope's.

      *(b) History.* Decided per [excluded-path group](#excluded-path-groups),
      because one test cannot decide three kinds of path. No clause turns on a
      commit subject: subjects are self-declared prose, and a breach is free to
      describe itself however it likes.

      **E1 — frozen product surfaces. Absolute.** `git log b9d92a3f1..HEAD`
      restricted to group E1 must return **no commits at all**. This is the clause
      that catches a module, a pack or a forbidden test file crossing the boundary,
      and it needs no attribution judgement to do it: those paths have no
      legitimate writer during this scope's arc, so movement is the finding.

      **E2 — shared registry and generated surfaces. Attribution by path.** The
      commit set touching group E2 must be disjoint from the commit set touching
      this scope's **exclusive owned product surfaces** — `rltaxrules.js`,
      `tax-rules/federal/**`, `lifetime-tax-strategy-lab.html`, this scope's
      fixtures and this scope's Playwright spec — and no commit may add a line
      matching `SUP-022-` to any E2 path. `scripts/selftest.mjs` and the four
      opened Feature 021 test files are deliberately **not** attribution signals
      here: every feature arc writes them, so their presence in a commit proves
      nothing about who owns it.

      **E3 — foreign evidence and documentation. No requirement capture.**
      Commit-set disjointness is **not** asserted for E3 and carries no boundary
      signal there. The property that matters is that Feature 022 never rewrote
      another feature's requirements to suit itself. For every commit touching both
      `specs/022-federal-preferential-and-state-income-tax/**` and a group E3 path,
      the diff restricted to E3 must add no line matching `SUP-022-`, must delete or
      reword no requirement line — no `**FR-`, no `**NFR-`, and no DoD requirement
      text — must flip no checkbox from `[x]` to `[ ]`, and must accompany every
      `[ ]`→`[x]` flip with an added `Claim Source:` line in the same file. Ticking
      another feature's DoD without evidence, or relaxing its requirement text,
      fails.

      *Merges.* A merge commit is exempt from all three clauses only when
      `git show --name-only <merge>` restricted to the excluded list is empty,
      proving it introduced no excluded-path change of its own.

      *Why this stays falsifiable — the case the superseded wording could not
      decide.* A session doing Feature 022 work edits `rltax.js` so the engine
      consumes the new `RateTable/v2`, and commits it **alone** under
      `fix(engine): accept the v2 rate table shape` — no Feature 022 spec file, no
      `SUP-022` marker. Under whole-list disjointness that commit joins only one of
      the two sets, so disjointness passes, and all that stands between it and a
      tick is a reading of its subject prose, which names no feature and can be
      argued either way. Under E1 it fails on the first command, because `rltax.js`
      moved at all. That is this scope's most consequential forbidden edit — the
      Change Boundary excludes `rltax.js` precisely because an engine change means
      the contract is wrong — and the restated limb is the first version of it that
      catches the edit without asking anyone's opinion of a commit message.

      The other shapes still fail too. Left uncommitted, an edit carries tax-domain
      content or a `SUP-022` marker and fails (a). Committed alongside this scope's
      own product files, an E2 edit fails E2's owned-surface disjointness. A
      Feature 021 requirement quietly relaxed to make this scope's job easier fails
      E3. What the limb no longer asserts is that two commit sets are disjoint
      across paths where co-membership was never evidence of anything.

      **Limb 2 — confinement.** The `SUP-022-NN` census over the five opened files
      equals the distribution
      [`design.md`](../../design.md#per-file-marker-distribution) assigns this
      scope, exactly and in both directions: SUP-022-01, -02, -04, -05, -06 and -11
      in `scripts/selftest.mjs`; SUP-022-07 and -21 in
      `tests/lifetime-tax-federal.spec.mjs`; SUP-022-09 and -12 in
      `tests/lifetime-tax-foundation.spec.mjs`; SUP-022-13 in
      `tests/lifetime-tax-marginal.spec.mjs`; SUP-022-17 in
      `tests/lifetime-tax-route.spec.mjs`. No Scope 01 marker appears in a file
      that table does not name for it, and
      `tests/lifetime-tax-conversion.spec.mjs` and `tests/lifetime-tax.support.mjs`
      carry zero `SUP-022` markers.

      **Limb 3 — behavioural invariance.** Feature 021's behaviour is unmoved
      outside the marked clauses: the Feature 021 Scope 01 through Scope 05
      selftest groups pass, and the fifteen browser scenarios SCN-021-001 through
      SCN-021-015 pass in full under titles the `--grep` contract still matches. A
      Feature 021 expectation silently changed outside a marker moves one of those
      results and fails this limb.
  - **Phase:** implement · **Command:** `git diff` and `git diff --cached` over the excluded list, `git log b9d92a3f1..HEAD` over group E1, over group E2 against this scope's owned product surfaces, and over group E3 against `specs/022-federal-preferential-and-state-income-tax/**`, a `SUP-022-NN` census over the five opened files, `node scripts/selftest.mjs`, and `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-" --reporter=list` · **Evidence:** `report.md#change-boundary`, `report.md#tp-01-16`, `report.md#verification-pass-6--2026-08-20--dod-item-11-re-derived-against-the-restated-limbs-1a-e2-e3-and-limb-2-hold-e1-is-false-finding-f-01-r`
  - **Open — E1 is false against the tree; finding F-01-R.** The restatement did
    fix what finding **F-01-Q** named: limb 1(b) no longer uses whole-list
    disjointness, and `1a2f1c00b` no longer breaks it. Re-derived at verification
    pass 6, limb 1(a) holds, E2 holds, E3 holds and limb 2 holds exactly and in
    both directions. **Group E1 does not.** It admits no commit at all and eleven
    exist — every one a framework-installer sync, none touching a line of product.
    Split on its own seam, E1's eight product paths return **zero** commits, so
    `rltax.js` and the rest never moved and the engine edit E1 was written to catch
    did not happen. What is false is E1's stated premise, *"No automation writes
    any of them"*: it is true of the eight product paths and false of the
    open-ended *every framework-managed file* clause, which has a dedicated
    automated writer. That is finding **F-01-N**'s failure mode arriving in a new
    place. **What would make it decidable:** range E1's absolute no-commit clause
    over the eight product paths only, and give framework-managed files the
    E2-shaped attribution test — disjointness from this scope's owned product
    surfaces plus no added `SUP-022-` line — since they churn under a foreign
    automated writer exactly as the E2 surfaces do. This is a requirement-text
    decision and is routed to `bubbles.plan` rather than taken here. Limb 3 was not
    re-run this pass and is recorded `not-run`, not carried forward.
  - **Why limb 1(b) no longer uses whole-list disjointness.** The superseded
    wording used commit-set disjointness as a proxy for *no product surface of one
    feature was changed by the other*. The proxy assumed commit membership is a
    reliable attribution signal, and it is not — the excluded list mixes product
    modules with **another feature's evidence directory**, and one verification
    session recording two features' DoD evidence puts a commit in both sets while
    nothing product crossed anything. `1a2f1c00b` is exactly that commit: four
    Feature 021 `report.md`/`scope.md` files closing Feature 021's own DoD with
    Feature 021's own executed evidence, plus this feature's `design.md`.
    It carries zero `SUP-022` markers in the excluded paths.

    The proxy was not merely over-broad, which alone would not justify touching it
    a third time. It was also **weak in the direction the item exists to protect**.
    Its only defence against a Feature 022 edit to an excluded module committed on
    its own was a clause asking whether the commit subject "attributes it to work
    other than Feature 022" — a judgement about self-declared prose, made about the
    one artefact a breach fully controls. A limb that false-positives on harmless
    documentation and can be talked past on a real module edit is failing in both
    directions, and restating it is a correction rather than a convenience.

    The restatement is strictly harder to satisfy accidentally. Group E1 admits
    **no** commit at all across the lifetime-tax engine and workspace modules, the
    two forbidden test files, and Feature 008's module, analytics and pack — where
    the superseded wording admitted any commit whose subject read plausibly. Group
    E2 replaces that prose judgement with path arithmetic against this scope's own
    product surfaces plus a marker test. Group E3 stops asserting a disjointness
    that was never evidence, and asserts instead the property that documentation
    boundary actually protects — no requirement of another feature deleted,
    reworded, un-ticked, or ticked without an accompanying `Claim Source:` line.
    Each clause is a command over the tree as it stands, and none needs a
    pre-scope baseline the repository does not contain. This supersedes the wording
    that produced finding **F-01-Q**.
  - **Why this shape.** The superseded wording asked for a per-expectation diff
    against a pre-scope original and for unqualified byte-identity. Neither is
    decidable here. `b9d92a3f1` is the only commit that has ever touched the four
    Feature 021 test files and it already carries their `SUP-022` markers, and
    `e903749c0` introduced the Feature 021 selftest groups already carrying
    twenty-eight markers, so no un-superseded original exists anywhere in history.
    Unqualified byte-identity was also false rather than merely unprovable, because
    `briefs/**`, `data/**` and two gate files moved in foreign commits. The three
    limbs protect the same property — this scope changed nothing it was forbidden
    to change — against the tree that does exist. This follows the
    behavioural-invariance precedent set in
    [Feature 024 Scope 04](../../../024-social-security-and-medicare/scopes/04-medicare-premiums-and-irmaa/scope.md#change-boundary-and-protected-paths).
    It supersedes the wording that produced finding **F-01-H**.
  - **Why limb 1 no longer enumerates.** Its superseded wording named a closed set
    of foreign commits and asserted that every other excluded path returned an
    empty diff. That was structurally unstable rather than merely wrong: each new
    unrelated commit falsified it again. It had already gone stale twice —
    Feature 021's spec directory moved six files in two unnamed commits,
    `scripts/validate-spec-test-paths.baseline` moved in a third, and `data/**`
    moved in a fourth — while the property it protected was intact throughout,
    every one of those commits being foreign to Feature 022 by its subject. The
    two conditions above assert that property directly, so a foreign commit no
    longer breaks the limb while a Feature 022 edit to an excluded path still
    does. This supersedes the wording that produced finding **F-01-N**.
- [ ] All twelve owned supersessions are delivered — SUP-022-01, -02, -04, -05,
      -06, -07, -09, -11, -12, -13, -17 and -21 — each carrying its `SUP-022-NN`
      marker, each marker naming its shape and recording the clause it superseded,
      and marker↔ledger closure passing in both directions.

      **Strength is proven against the tree as it stands, not against a prior run.**
      For each of the six retained-branch entries — SUP-022-02, -05, -06, -11, -12
      and -13, the partition and relocate shapes — the superseded clause is still
      asserted, is exercised against the absent-table fixture, and is shown
      non-vacuous. For each of the six derive-shaped entries — SUP-022-01, -04,
      -07, -09, -17 and -21 — the superseded clause is restated verbatim from its
      marker comment, evaluated against the current tree, and shown to be either
      false or vacuous while its replacement holds. A replacement weaker than what
      it displaced cannot satisfy both halves of that pair.

      **Adversarial cases fire inside the command that reports them.** Every
      adversarial case the ledger names is demonstrated to fail against a
      deliberately broken artifact within the same run, rather than asserted from a
      past red run that cannot be re-executed.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the TP-01-16 browser command · **Evidence:** `report.md#supersession-ledger`, `report.md#tp-01-20`, `report.md#tp-01-21`
  - **Why this shape.** The superseded wording required each replacement to have
    been "seen to fail against the unchanged implementation" and to be "at least as
    strong as the clause it superseded". Both need an artefact the repository does
    not contain: `b9d92a3f1` already carries the `SUP-022` markers in the four
    Feature 021 test files, and `e903749c0` already carries twenty-eight of them in
    `scripts/selftest.mjs`, so there is no unchanged implementation to run and no
    superseded original to compare. Restating the superseded clause against the
    current tree and proving it false or vacuous establishes the same asymmetry
    from evidence that exists, and it is falsifiable: a replacement that merely
    restated its predecessor leaves the predecessor true and fails. This is the
    demonstration
    [Feature 024 Scope 04](../../../024-social-security-and-medicare/scopes/04-medicare-premiums-and-irmaa/scope.md#definition-of-done)
    used for SUP-024-06 and SUP-024-07. It supersedes the wording that produced
    finding **F-01-L**.
- [x] Per-component-kind year containment is implemented and both outcomes are
      demonstrated on the same source record: the top-band rate override passes
      containment and a breakpoint override to the same record refuses.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-07`, `report.md#verification-pass-2--2026-08-18--dod-item-13-holds`
- [x] Every retained branch is non-vacuous: the absent-table fixture exercises the
      original clauses of SUP-022-02, SUP-022-05, SUP-022-06, SUP-022-11,
      SUP-022-12 and SUP-022-13 at least once, independently of how many shipped
      statuses resolved.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus `npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line --workers=2` · **Evidence:** `report.md#tp-01-21`, `report.md#verification-pass-2--2026-08-18--dod-item-14-holds`
- [x] Assertion change is contained to the **twelve** entries this scope owns, and
      no sourcing rule, tolerance, determinism, privacy, zero-network or Feature
      008 canary was touched. Twelve is the count everywhere in this scope, derived
      from the `Owning scope` column of the
      [supersession ledger](../../spec.md#supersession-ledger): SUP-022-01, -02,
      -04, -05, -06, -07, -09, -11, -12, -13, -17 and -21.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs`, a `SUP-022-NN` census over the five opened files, and `git diff --name-only b9d92a3f1 HEAD` over the excluded list · **Evidence:** `report.md#tp-01-20`, `report.md#change-boundary`, `report.md#verification-pass-4--2026-08-19--dod-item-15-holds`

      **Containment is proven four ways, none of which needs a pre-scope baseline.**
      Marker↔ledger closure passes in both directions (`TP-05-22`). Each of the
      twelve markers sits in the file
      [`design.md`](../../design.md#per-file-marker-distribution) assigns it and in
      no other file, so an edit that wandered into an unassigned file is visible.
      No change to an excluded path is attributable to Feature 022, in the working
      tree or in history, per DoD item 11 limb 1. The repository
      pass count does not fall between this scope's recorded intended-RED run and
      its same-command GREEN run, so no assertion was deleted or downgraded to
      reach green.

      **Second clause.** Feature 008's three files and its spec directory return an
      empty `git diff --name-only b9d92a3f1 HEAD`, and the sourcing, tolerance,
      determinism, privacy, zero-network and Feature 008 production-consumer canary
      assertions are each present by title and passing.
  - **Why this shape.** The superseded wording asked for a diff against a pre-scope
    assertion text, and no such text exists: `b9d92a3f1` already carries the
    `SUP-022` markers in the four Feature 021 test files and `e903749c0` already
    carries twenty-eight of them in `scripts/selftest.mjs`. The superseded wording
    also stated the owned-entry count three ways — twelve here, eleven in the
    TP-01-20 row and seven in the report narrative — and an assertion cannot target
    a set the plan states three ways. The four limbs above are each executable and
    each falsifiable, and the count is now twelve throughout. This supersedes the
    wording that produced finding **F-01-I**.
- [x] `node scripts/selftest.mjs` reports zero failures with no fall in pass count
      between this scope's recorded intended-RED run and its same-command GREEN
      run, `node scripts/validate-spec-test-paths.mjs` reports zero new missing
      paths, and `node scripts/build-pages-site.mjs --dry-run` succeeds. Assertion
      containment beyond that pass-count floor is DoD item 15's to prove and is
      deliberately not restated here, so this item turns on its three commands
      alone.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-01-17`, `report.md#tp-01-18`, `report.md#tp-01-19`, `report.md#verification-pass-4--2026-08-19--dod-item-16-holds`
  - **Why this shape.** The superseded wording carried an embedded sub-clause — "no
    assertion edited outside this scope's twelve ledger entries" — that restated
    DoD item 15's claim and therefore inherited its defect: it asked for a diff
    against a pre-scope baseline the repository does not contain. Findings
    **F-01-J** and **F-01-M** record that the three commands themselves already
    pass, so the sub-clause was the only thing holding this item open. Containment
    now lives in DoD item 15 alone, where it is stated in decidable limbs, and this
    item keeps the protection that matters to it: the suite must reach zero
    failures without the pass count falling, so a green reached by deleting
    assertions still fails.
