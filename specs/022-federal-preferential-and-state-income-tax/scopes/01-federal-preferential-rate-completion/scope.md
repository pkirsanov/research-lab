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

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
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

`rltax.js` is excluded deliberately. This scope supplies a table the engine was
already written to consume; if the engine needs a change to consume it, the
contract is wrong and that is a finding rather than an edit.

**Rollback:** revert the pack file and the validator addition; delete the
fixtures; revert the page panel and the appended selftest group. Reverting the
twelve `SUP-022-*` replacements restores the Feature 021 originals verbatim,
because every one of them either retains the original clause or moves it onto a
fixture; none is deleted.

## Assertion Supersession Owned By This Scope

This scope owns twelve of the twenty-one entries in the
[supersession ledger](../../spec.md#supersession-ledger) and follows the
[per-scope procedure](../_index.md#assertion-supersession-procedure) for each.

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
| TP-01-11 | Determinism | unit | SCN-022-002 | `scripts/selftest.mjs` | Repeated computation over identical input produces a byte-identical result, with global `fetch` stubbed to throw for the whole group | `node scripts/selftest.mjs` | No | `report.md#tp-01-11` |
| TP-01-12 | No-shadow | unit | SCN-022-002 | `scripts/selftest.mjs` | Regression: `rltaxrules.js` and `rltax.js` contain no tax-domain numeric constant, no bracket table, no jurisdiction name and no authority name; both detectors are proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-01-12` |
| TP-01-13 | Regression E2E | e2e-ui | SCN-022-001 | `lifetime-tax-preferential.spec.mjs` | `Regression: SCN-022-001 a preferential table displays a distinct source per component` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-001 a preferential table displays a distinct source per component" --reporter=list` | Yes | `report.md#scenario-scn-022-001` |
| TP-01-14 | Regression E2E | e2e-ui | SCN-022-002 | `lifetime-tax-preferential.spec.mjs` | `Regression: SCN-022-002 a household with preferential income receives a valued federal total` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-002 a household with preferential income receives a valued federal total" --reporter=list` | Yes | `report.md#scenario-scn-022-002` |
| TP-01-15 | Regression E2E | e2e-ui | SCN-022-003 | `lifetime-tax-preferential.spec.mjs` | `Regression: SCN-022-003 unsupported preferential categories are named and never folded in` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-003 unsupported preferential categories are named and never folded in" --reporter=list` | Yes | `report.md#scenario-scn-022-003` |
| TP-01-16 | Broader Regression E2E | e2e-ui | SCN-021-001 … -015 | `lifetime-tax-foundation.spec.mjs`, `lifetime-tax-federal.spec.mjs`, `lifetime-tax-marginal.spec.mjs`, `lifetime-tax-conversion.spec.mjs`, `lifetime-tax-route.spec.mjs` | Execute Feature 021's cumulative browser suite over the real route and prove no regression. Every title is byte-identical. Only the SUP-022-07, -09, -12, -13 and -17 expectations differ, and each differs exactly as its ledger entry specifies | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-" --reporter=list` | Yes | `report.md#tp-01-16` |
| TP-01-17 | Repo gate | unit | SCN-022-001 … -003 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-01-17` |
| TP-01-18 | Path guard | unit | SCN-022-001 … -003 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-01-18` |
| TP-01-19 | Deploy gate | unit | SCN-022-001 … -003 | `scripts/build-pages-site.mjs` | The Pages plan succeeds and `site-exclusions.json` is unchanged, proving no new root HTML entered without a deploy decision | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-01-19` |
| TP-01-20 | Supersession conformance | unit | SCN-022-001 … -003 | `scripts/selftest.mjs` | The marker check: every distinct `SUP-022-NN` marker in the repository is a ledger id, the delivered set equals this scope's eleven owned entries, each marked region names its shape, and no assertion changed without a marker | `node scripts/selftest.mjs` | No | `report.md#tp-01-20` |
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
- [ ] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Phase:** implement · **Command:** the exact TP-01-01 through TP-01-16 commands · **Evidence:** `report.md#test-evidence`
  - **Not closed.** Finding **F-01-K** (supersedes F-01-E, whose blocking absence
    is now cleared): `tests/lifetime-tax-preferential.spec.mjs` exists and
    TP-01-13/14/15/16 are GREEN (66 passed, 0 failed, exit 0). RED remains
    uncaptured for TP-01-11, -13, -14, -15, -16, -17, -18, -19 and -20. See
    `report.md#verification-pass-2--2026-08-18--dod-item-10-still-does-not-hold-but-f-01-e-is-closed`.
- [ ] Feature 008's files, Feature 021's spec directory, the registries,
      `site-exclusions.json` and every brief or data artifact are byte-identical.
      The only Feature 021 test files touched are
      `tests/lifetime-tax-federal.spec.mjs`,
      `tests/lifetime-tax-foundation.spec.mjs`,
      `tests/lifetime-tax-marginal.spec.mjs` and
      `tests/lifetime-tax-route.spec.mjs`, and in each only the expectations
      SUP-022-07, -09, -12, -13 and -17 name changed.
      `tests/lifetime-tax-conversion.spec.mjs` and `tests/lifetime-tax.support.mjs`
      are byte-identical.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
  - **Not closed.** Finding **F-01-H**: `site-exclusions.json` (commit `e903749c0`)
    and `scripts/validate-spec-test-paths.baseline` (commit `2229da3c0`) are not
    byte-identical, and the per-expectation clause is unverifiable because
    Features 021 and 022 landed in one squashed commit (`b9d92a3f1`). The other
    seventeen excluded paths are proven byte-identical. See
    `report.md#verification-pass-2--2026-08-18--dod-item-11-does-not-hold`.
- [ ] All twelve owned supersessions are delivered: each replacement is at least as
      strong as the clause it superseded, each was written before the behaviour
      change and seen to fail against the unchanged implementation, each carries
      its `SUP-022-NN` marker naming its shape, and each of the ledger's
      adversarial cases was seen to fail before it was seen to pass.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the TP-01-16 browser command · **Evidence:** `report.md#supersession-ledger`
  - **Not closed.** Finding **F-01-L**: all twelve markers are present with their
    shapes named (12/12, derived), marker↔ledger closure passes (`TP-05-22`), and
    the six retained branches are proven non-vacuous. The "written before the
    behaviour change and seen to fail" and "at least as strong as the clause it
    superseded" clauses are unverifiable — Features 021 and 022 landed in one
    squashed commit (`b9d92a3f1`), so no unchanged-implementation state and no
    superseded-clause original exist to run or compare against. See
    `report.md#verification-pass-2--2026-08-18--dod-item-12-does-not-hold`.
- [x] Per-component-kind year containment is implemented and both outcomes are
      demonstrated on the same source record: the top-band rate override passes
      containment and a breakpoint override to the same record refuses.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-07`, `report.md#verification-pass-2--2026-08-18--dod-item-13-holds`
- [x] Every retained branch is non-vacuous: the absent-table fixture exercises the
      original clauses of SUP-022-02, SUP-022-05, SUP-022-06, SUP-022-11,
      SUP-022-12 and SUP-022-13 at least once, independently of how many shipped
      statuses resolved.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus `npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line --workers=2` · **Evidence:** `report.md#tp-01-21`, `report.md#verification-pass-2--2026-08-18--dod-item-14-holds`
- [ ] No assertion outside the twelve owned ledger entries was edited, relaxed or
      deleted, and no sourcing rule, tolerance, determinism, privacy,
      zero-network or Feature 008 canary was touched.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-20`
  - **Not closed.** Finding **F-01-I**: the marker check (`TP-05-22`) proves
    marker↔ledger closure but cannot detect an *unmarked* edit, and no pre-scope
    baseline exists to diff against because Features 021 and 022 landed in one
    squashed commit (`b9d92a3f1`). The row also states the owned-entry count three
    ways — twelve, eleven, seven. The second clause (no sourcing, tolerance,
    determinism, privacy, zero-network or Feature 008 canary touched) is proven.
    See `report.md#verification-pass-2--2026-08-18--dod-item-15-does-not-hold`.
- [ ] `node scripts/selftest.mjs` is green with no fall in pass count and no
      assertion edited outside this scope's twelve ledger entries,
      `node scripts/validate-spec-test-paths.mjs`
      reports zero new missing paths, and `node scripts/build-pages-site.mjs
      --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-01-17`, `report.md#tp-01-18`, `report.md#tp-01-19`
  - **Not closed.** Finding **F-01-J**: `node scripts/validate-spec-test-paths.mjs`
    (exit 0, `new=0`) and `node scripts/build-pages-site.mjs --dry-run` (exit 0)
    both pass. `node scripts/selftest.mjs` is at `2993 passed, 1 failed` — the one
    failure is the concurrent session's stale
    `tests/market-brief-cockpit.spec.mjs` reference, foreign to this scope and
    deliberately untouched. The item says "is green", so it is not ticked. See
    `report.md#verification-pass-2--2026-08-18--dod-item-16-does-not-hold`.
