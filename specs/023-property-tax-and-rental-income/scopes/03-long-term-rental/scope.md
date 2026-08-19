# Scope 3: Long-Term Rental

## 03-long-term-rental

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** Implemented
**Scope-Kind:** runtime-behavior
**Tags:** `engine:rental`, `loss-limits:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** 01, 02
**Foundation:** false

**Primary Outcome:** a landlord receives an honest after-depreciation,
after-limits rental figure. Cost recovery comes from a sourced recovery period and
convention rather than a recalled one, the at-risk limit and the passive-activity
limit are applied in a proven order, and every disallowed amount is published with
the limit that disallowed it rather than silently zeroed.

## Requirement Coverage

- **FR-023-015** — rental income and operating expenses are declared; the net
  result is computed and published as a named leg.
- **FR-023-016** — depreciation is computed from a sourced recovery period and a
  sourced convention; neither may be recalled, derived or defaulted.
- **FR-023-017** — the at-risk limit is applied before the passive-activity limit
  and the order is asserted rather than assumed.
- **FR-023-018** — the special allowance is computed from a sourced amount and a
  sourced phase-out range at the declared modified adjusted gross income.
- **FR-023-019** — every disallowed amount is published with the limit that
  disallowed it; none is zeroed, merged or omitted.
- **FR-023-020** — an opening suspended-loss carryforward is a declaration; the
  closing figure is published for the declared year only.
- **FR-023-021** — the rental leg appears in the headline, the comparison, the
  curve and the export.

Inherited and re-asserted: **FR-023-008** the deduction composition,
**NFR-023-001** declared or sourced never conflated, **NFR-023-002** zero network,
**NFR-023-003** privacy, **NFR-023-004** vocabulary unchanged, **NFR-023-005** no
figure in any module, **NFR-023-006** leg visibility, **NFR-023-007** no
projection, **NFR-023-009** Feature 008 byte-identity.

## Gherkin Scenarios

```gherkin
Scenario: SCN-023-007 A long-term rental settles on Schedule E after depreciation
  Given declared rental income, declared operating expenses and a declared depreciable basis and placed-in-service month
  And a pack carrying a sourced recovery period and a sourced convention
  When the rental settlement runs
  Then depreciation is computed from the sourced period and convention rather than from a recalled figure
  And the net result is published as a named leg of the federal settlement
  And a pack whose recovery period was not retrieved refuses the depreciation rather than omitting it

Scenario: SCN-023-008 A rental loss is limited and the disallowed amount is carried, not dropped
  Given a rental producing a loss, a declared at-risk amount and a declared modified adjusted gross income inside the special-allowance phase-out
  When the limits are applied
  Then the at-risk limit is applied before the passive-activity limit and the applied order is recorded
  And the special allowance is computed from the sourced amount and the sourced phase-out range
  And each disallowed amount is published with the limit that disallowed it and none is silently zeroed

Scenario: SCN-023-009 A declared opening suspended loss is used without becoming a projection
  Given a declared opening suspended-loss carryforward
  When the rental settlement runs
  Then the opening figure is treated as a declaration and carries no citation
  And it is allowed only to the extent the declared year's rules permit
  And the closing figure is published for the declared year only, with no future year computed, displayed or implied
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-023-007 settled | Full declarations, sourced period and convention | Open the rental panel | Income, expenses, depreciation with its citation and locator, and the net leg | e2e-ui |
| SCN-023-007 period absent | Recovery period not retrieved | Open the rental panel | `RLTAX-THRESHOLD-UNAVAILABLE` on depreciation and on the rental leg, with no settlement shown without cost recovery | e2e-ui |
| SCN-023-008 limit ladder | Loss with at-risk and passive limits both biting | Open the rental panel | The ladder in applied order, each limit's before, allowed and disallowed amounts, and the special allowance with its phase-out | e2e-ui |
| SCN-023-009 carryforward | Declared opening suspended loss | Open the rental panel | The opening figure labelled the household's declaration, the closing figure for the declared year, and no future year anywhere on the page | e2e-ui |
| Leg visibility | The all-non-zero leg fixture | Open Simple then Power | The rental leg reaches the headline, the comparison, the curve and the export | e2e-ui |

## Implementation Files

### New

- `rltaxrental.js` — UMD module owning `computeRentalSettlement`,
  `applyAtRiskLimit` and `applyPassiveActivityLimit`.
- Fixture packs: one carrying a deliberately non-standard recovery period and
  convention so a recalled figure cannot pass, one with the period absent, one with
  the special allowance absent, and one whose modified adjusted gross income sits
  below, exactly at and above each phase-out edge.
- `lifetime-tax-rental.spec.mjs` under `tests/` — this scope's Playwright spec.

### Modified

- `rltaxrules.js` — `RentalActivity/v1`, `CostRecovery/v1`, `LossLimitation/v1`.
- `rltax.js` — stage `CO-17` and reconciliation leg `L9`.
- `rltaxworkspace.js` — the rental declarations plus their privacy surface.
- `lifetime-tax-strategy-lab.html` — the rental inputs, the `power-rental` section
  and one Simple field.
- `scripts/selftest.mjs` — one appended group. This scope owns no supersession and
  appends only.

## Implementation Plan

1. Add `RentalActivity/v1`, `CostRecovery/v1` and `LossLimitation/v1` to
   `rltaxrules.js`. `CostRecovery/v1` refuses a missing `recoveryPeriod` or
   `convention` and refuses either carrying no citation, so a default cannot exist.
2. **Retrieve `BI-5`.** Open Publication 527 and Publication 946, transcribe the
   residential rental recovery period and the applicable convention, and record
   each with its locator. If either is unretrieved it ships absent and the
   depreciation and the rental leg both refuse.
3. **Retrieve `BI-6`.** Transcribe the passive-activity special allowance amount
   and its phase-out range from Publication 925 with locators. If unretrieved, the
   allowance refuses and the leg refuses rather than applying the limit without it.
4. **Retrieve `BI-7`.** Transcribe the at-risk limitation statement and the
   ordering of the at-risk and passive limits from Publication 925 with locators.
   The ordering is a sourced rule, not an assumption; if unretrieved the leg
   refuses.
5. Implement cost recovery from the declared basis and placed-in-service month and
   the sourced period and convention. The fixture pack carries a deliberately
   non-standard period so an implementation using a recalled figure fails.
6. Implement `LossLimitation/v1` with an integer `appliedOrder`. The engine asserts
   the applied orders are strictly increasing, which is how the ordering is proven
   rather than assumed.
7. Implement the at-risk limit, then the passive-activity limit with the special
   allowance and its phase-out. Each produces its own `LossLimitation` record with
   `amountBefore`, `allowedAmount` and `disallowedAmount`, and `disposition:
   "suspended"`.
8. Implement the opening carryforward as a declaration carrying no citation, and
   publish the closing figure for the declared year only. Assert no future year
   appears in the record, in the page, or in the export.
9. Add stage `CO-17` and reconciliation leg `L9`, derived from the pack's declared
   leg set.
10. Extend the Scope 01 leg-visibility identity to cover `L9`.
11. Add the rental declarations to `rltaxworkspace.js` with their inventory, clear
    and export-sanitizer entries.
12. Render the `power-rental` section and one Simple field carrying the net rental
    contribution. Simple stays decision-level; the limit ladder lives in Power.
13. Append a `lifetime-tax — long-term rental, cost recovery and loss limits` group
    to `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltax.js` leg set | Leg `L9` added | Scopes 04, 05 | High — a hardcoded leg list would drop it | Assert every prior fixture produces its exact prior leg set before `L9` is added | Remove the leg from the declared set |
| The adjusted basis | Cost recovery reduces it | Scope 05 | High — Scope 05's gain reads it, so an unrecorded reduction understates the recapture component | Assert the adjusted basis published by this scope equals the declared basis less the published accumulated recovery, before Scope 05 consumes it | Revert cost recovery |
| The leg-visibility helper | Consumed unchanged, extended to `L9` | Scopes 04, 05 | Medium | Assert the helper still fails when `L8` is removed, before `L9` is registered | Unregister `L9` |
| Simple field set | One field added | Scope 05 | Low — SUP-023-04's replacement derives the set from the page | The derived Simple assertion absorbs it | Remove the field |
| `rltaxworkspace.js` | Rental declarations plus privacy surface | Scopes 04, 05 | Medium | Assert each new key is inventoried, cleared, redacted and absent from every URL and request | Remove the members |
| `scripts/selftest.mjs` | One group appended, no marker | The whole-repo gate | Medium | Pre-existing pass count must not fall and no assertion outside the appended group may change | Remove the group |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxrental.js` · this scope's fixture packs ·
`lifetime-tax-rental.spec.mjs` under `tests/`.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`lifetime-tax-strategy-lab.html` · `tax-rules/federal/<year>.json` (additive
insertion of the `BI-5`, `BI-6` and `BI-7` retrieved records only) ·
`scripts/selftest.mjs` (append-only — this scope owns no supersession).

`tax-rules/federal/<year>.json` is allowed here **because** FR-023-016,
FR-023-017 and FR-023-018 require the recovery period, the convention, the
special allowance, the phase-out range and the limit ordering to live in that
pack, and this scope's retrieval work produces them. The permission is additive
only: no pre-existing federal figure may change, and TP-03-02 asserts
byte-identity of every pre-existing figure. The planning cross-check against the
ledger and the requirement coverage confirms no scope forbids an edit it
requires.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `rltaxproperty.js` · `rltaxstrategy.js` · `rltaxstate.js` ·
`rltaxcombined.js` · `tax-rules/property/**` · `tax-rules/state/**` ·
`tools.json` · `index.html` · `rlnav.js` · `README.md` · `notes/README.md` ·
`market-brief.*` · `briefs/**` · `data/**` · `watchlist.json` ·
`site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` · every
`tests/lifetime-tax-*.spec.mjs` other than this scope's own ·
`tests/lifetime-tax.support.mjs` · every framework-managed file.

**Rollback:** delete `rltaxrental.js`, the fixtures and the spec file; revert the
three contracts, stage `CO-17`, leg `L9`, the federal pack insertions, the
workspace members and the page section.

## Assertion Supersession Owned By This Scope

**One, admitted in flight under ASC-8: `SUP-023-12`.** This scope was planned to
own none, and it owns none by prediction. During implementation TP-02-12's
byte-identity check failed for an ASC-1 cause: that check reconstructs the
pre-feature pack by deleting a hand-maintained list of exactly the three
top-level members Scope 02 added, and FR-023-016, FR-023-017 and FR-023-018
require this scope to insert two more. The entry, its cause and its traded
protection are recorded in the
[supersession ledger](../spec.md#supersession-ledger), the ownership table in the
[scope index](../_index.md#ownership), the opening count paragraph and
`design.md`'s per-file marker distribution — all four updated in the same change
that made the edit, as ASC-8 requires.

Every OTHER pre-existing assertion in `scripts/selftest.mjs` and in every
prior-feature Playwright spec still passes unchanged at the end of this scope.
Adding a rental leg changes no behaviour any of them pins, because SUP-023-04's
replacement derives the Simple field set from the page and Feature 022's
SUP-022-15 and SUP-022-16 replacements derive the reconciliation row count from
the published leg list. An assertion that fails here is either a defect in this
scope's change and is fixed, or a further ASC-8 admission recorded in the ledger
before the edit. Apart from the one admitted entry this scope appends only.

## Scenario-First Red/Green Contract

**Named intended-RED assertion for this scope:** a fixture pack carrying a
deliberately non-standard recovery period and convention must produce a
depreciation figure derived from **those** values, and the assertion must compare
against a figure recomputed from the pack rather than a literal. Before cost
recovery reads the pack the assertion fails because no depreciation is produced at
all. A syntax error, a missing browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Contract | unit | SCN-023-007 | `scripts/selftest.mjs` | `CostRecovery/v1` refuses a missing `recoveryPeriod`, a missing `convention`, and either carrying no citation or no locator | `node scripts/selftest.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Compatibility | unit | SCN-023-007 | `scripts/selftest.mjs` | Every pre-existing federal pack figure is byte-identical after the additive insertion of the recovery, allowance and ordering records | `node scripts/selftest.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Known value | unit | SCN-023-007 | `scripts/selftest.mjs` | Depreciation is recomputed from the fixture pack's deliberately non-standard period and convention, exact for a first partial year, a full year and a final partial year | `node scripts/selftest.mjs` | No | `report.md#tp-03-03` |
| TP-03-04 | Adversarial | unit | SCN-023-007 | `scripts/selftest.mjs` | Regression: an implementation using a recalled recovery period or a default convention is proven to fail against the non-standard fixture | `node scripts/selftest.mjs` | No | `report.md#tp-03-04` |
| TP-03-05 | Refusal | unit | SCN-023-007 | `scripts/selftest.mjs` | A pack whose recovery period or convention is an `AbsentFigure` refuses the depreciation and the rental leg, and no settlement is produced without cost recovery | `node scripts/selftest.mjs` | No | `report.md#tp-03-05` |
| TP-03-06 | Ordering | unit | SCN-023-008 | `scripts/selftest.mjs` | The applied limits carry strictly increasing `appliedOrder`, with the at-risk limit first, derived from the sourced ordering rule rather than from a module constant | `node scripts/selftest.mjs` | No | `report.md#tp-03-06` |
| TP-03-07 | Adversarial | unit | SCN-023-008 | `scripts/selftest.mjs` | Regression: an implementation applying the passive limit before the at-risk limit is proven to fail the strictly-increasing order assertion and to produce a different allowed amount | `node scripts/selftest.mjs` | No | `report.md#tp-03-07` |
| TP-03-08 | Known value | unit | SCN-023-008 | `scripts/selftest.mjs` | The special allowance is exact below, exactly at and above each edge of the sourced phase-out range | `node scripts/selftest.mjs` | No | `report.md#tp-03-08` |
| TP-03-09 | Refusal | unit | SCN-023-008 | `scripts/selftest.mjs` | An absent special allowance or an absent phase-out range refuses the leg rather than applying the passive limit without it | `node scripts/selftest.mjs` | No | `report.md#tp-03-09` |
| TP-03-10 | Contract | unit | SCN-023-008 | `scripts/selftest.mjs` | Every applied limit publishes `amountBefore`, `allowedAmount` and `disallowedAmount`, and the three reconcile exactly for every fixture | `node scripts/selftest.mjs` | No | `report.md#tp-03-10` |
| TP-03-11 | Adversarial | unit | SCN-023-008 | `scripts/selftest.mjs` | Regression: an implementation zeroing a disallowed amount instead of publishing it is proven to fail the reconciliation assertion | `node scripts/selftest.mjs` | No | `report.md#tp-03-11` |
| TP-03-12 | Contract | unit | SCN-023-009 | `scripts/selftest.mjs` | The opening carryforward is a declaration carrying no citation, and a carryforward member carrying a `sourceRef` is refused | `node scripts/selftest.mjs` | No | `report.md#tp-03-12` |
| TP-03-13 | No-projection | unit | SCN-023-009 | `scripts/selftest.mjs` | The record publishes exactly one closing figure for the declared year, and no member, page node or export field names a year other than the declared one | `node scripts/selftest.mjs` | No | `report.md#tp-03-13` |
| TP-03-14 | Adversarial | unit | SCN-023-009 | `scripts/selftest.mjs` | Regression: an implementation projecting the carryforward into a following year is proven to fail the single-year assertion | `node scripts/selftest.mjs` | No | `report.md#tp-03-14` |
| TP-03-15 | Basis integrity | unit | SCN-023-007 | `scripts/selftest.mjs` | The published adjusted basis equals the declared basis less the published accumulated recovery, for every fixture | `node scripts/selftest.mjs` | No | `report.md#tp-03-15` |
| TP-03-16 | Leg visibility | unit | SCN-023-007 | `scripts/selftest.mjs` | Against the all-non-zero fixture, leg `L9` appears in the headline, the comparison, the curve contributors and the export, in both directions, and `L8` still does | `node scripts/selftest.mjs` | No | `report.md#tp-03-16` |
| TP-03-17 | Adversarial | unit | SCN-023-007 | `scripts/selftest.mjs` | Regression: removing the rental leg from each of the four surfaces in turn is proven to fail the leg-visibility identity with the missing leg named | `node scripts/selftest.mjs` | No | `report.md#tp-03-17` |
| TP-03-18 | Vocabulary | unit | SCN-023-007 | `scripts/selftest.mjs` | The refusal vocabulary member count equals its pre-feature value | `node scripts/selftest.mjs` | No | `report.md#tp-03-18` |
| TP-03-19 | No-shadow | unit | SCN-023-007 | `scripts/selftest.mjs` | Regression: no module holds a recovery period, a convention, an allowance amount, a phase-out edge or an authority name; the detector is proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-03-19` |
| TP-03-20 | Privacy | unit | SCN-023-009 | `scripts/selftest.mjs` | The rental declarations are inventoried, cleared, redacted, and absent from every URL, request, referrer and console message | `node scripts/selftest.mjs` | No | `report.md#tp-03-20` |
| TP-03-21 | Regression E2E | e2e-ui | SCN-023-007 | `lifetime-tax-rental.spec.mjs` | `Regression: SCN-023-007 a long-term rental settles after sourced depreciation and refuses without it` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-007 a long-term rental settles after sourced depreciation and refuses without it" --reporter=list` | Yes | `report.md#scenario-scn-023-007` |
| TP-03-22 | Regression E2E | e2e-ui | SCN-023-008 | `lifetime-tax-rental.spec.mjs` | `Regression: SCN-023-008 the limit ladder is applied in order and every disallowed amount is published` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-008 the limit ladder is applied in order and every disallowed amount is published" --reporter=list` | Yes | `report.md#scenario-scn-023-008` |
| TP-03-23 | Regression E2E | e2e-ui | SCN-023-009 | `lifetime-tax-rental.spec.mjs` | `Regression: SCN-023-009 the suspended loss closes for the declared year and no future year appears` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-009 the suspended loss closes for the declared year and no future year appears" --reporter=list` | Yes | `report.md#scenario-scn-023-009` |
| TP-03-24 | Leg visibility E2E | e2e-ui | SCN-023-007 | `lifetime-tax-rental.spec.mjs` | `Regression: SCN-023-007 the rental leg reaches the headline, the comparison, the curve and the export` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-007 the rental leg reaches the headline, the comparison, the curve and the export" --reporter=list` | Yes | `report.md#tp-03-24` |
| TP-03-25 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-001 … -009 | The prior features' specs plus this feature's three | The cumulative browser suite over the real route | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list` | Yes | `report.md#tp-03-25` |
| TP-03-26 | Repo gate | unit | SCN-023-007 … -009 | `scripts/selftest.mjs` | The whole-repository suite stays green, the pre-existing pass count does not fall, and no assertion outside the appended group changed | `node scripts/selftest.mjs` | No | `report.md#tp-03-26` |
| TP-03-27 | Path guard | unit | SCN-023-007 … -009 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-03-27` |
| TP-03-28 | Deploy gate | unit | SCN-023-007 … -009 | `scripts/build-pages-site.mjs` | The Pages plan succeeds and `site-exclusions.json` is unchanged | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-03-28` |

### Definition of Done

- [x] FR-023-015 and FR-023-016 are implemented: the net rental result is a named
      leg, depreciation is computed from the sourced period and convention, and a
      recalled period is proven to fail against the non-standard fixture.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-01`, `report.md#tp-03-03`, `report.md#tp-03-04`, `report.md#tp-03-05`
- [x] `BI-5`, `BI-6` and `BI-7` were closed by retrievals performed in the
      implementation session and recorded with their own `retrievedAt` and
      locators, or the affected figure ships as an `AbsentFigure/v1` and the rental
      leg refuses; every pre-existing federal pack figure is byte-identical.
  - **Phase:** implement · **Command:** the retrieval records in the federal pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-03-02`
- [x] FR-023-017 and FR-023-018 are implemented: the applied order is strictly
      increasing with the at-risk limit first and derived from the sourced ordering
      rule, the special allowance is exact at every phase-out edge, and reversing
      the order is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-06`, `report.md#tp-03-07`, `report.md#tp-03-08`, `report.md#tp-03-09`
- [x] FR-023-019 is implemented: every applied limit publishes its before, allowed
      and disallowed amounts, the three reconcile exactly, and a zeroed disallowed
      amount is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-10`, `report.md#tp-03-11`
- [x] FR-023-020 and NFR-023-007 are implemented: the opening carryforward is a
      declaration, the closing figure is published for the declared year only, no
      year other than the declared one appears anywhere, and a projection is proven
      to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser row · **Evidence:** `report.md#tp-03-12`, `report.md#tp-03-13`, `report.md#tp-03-14`, `report.md#scenario-scn-023-009`
- [x] The published adjusted basis equals the declared basis less the published
      accumulated recovery, so Scope 05's recapture component reads a correct
      figure.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-15`
- [x] FR-023-021 and NFR-023-006 are implemented: leg `L9` is surfaced in the
      headline, the comparison, the curve and the export, `L8` still is, and
      removing `L9` from each surface in turn is demonstrated to fail with the
      missing leg named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser leg-visibility row · **Evidence:** `report.md#tp-03-16`, `report.md#tp-03-17`, `report.md#tp-03-24`
- [x] NFR-023-004 and NFR-023-005 hold: the refusal vocabulary member count is
      unchanged and no module holds a recovery period, convention, allowance
      amount, phase-out edge or authority name.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-18`, `report.md#tp-03-19`
- [x] NFR-023-003 holds: the rental declarations are inventoried, cleared and
      redacted, and the request ledger stays empty.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-20`
- [x] Every assertion this scope changed outside the appended selftest group is a
      ledgered supersession, and this scope owns exactly one: `SUP-023-12`, admitted
      in flight under ASC-8 because TP-02-12's byte-identity check reconstructed the
      pre-feature pack from a hand-maintained three-member removal list that
      FR-023-016 through FR-023-018 force this scope to grow. It is booked in the
      same change on all four surfaces ASC-8 requires — the ledger row, the
      ownership table, the per-file marker distribution and the marker at its own
      site — with its superseded clause recorded verbatim there and the superseded
      literal surviving nowhere else. No other pre-existing assertion differs from
      its pre-feature text. An assertion edited without a ledger row and a marker,
      or a marker carried in a file the distribution does not name, fails this row
      by name.
  - **Corrected by `bubbles.plan`.** This row previously predicted that the scope
    superseded nothing and that no `SUP-023-NN` marker was added. Delivery
    contradicts the prediction: `SUP-023-12` exists, and both `spec.md`'s ledger and
    `design.md`'s per-file marker distribution book its ownership to Scope 03, so
    the row could never be honestly ticked as written. The prediction is replaced by
    the ledgered-supersession requirement above, which keeps the original protective
    intent — an unledgered assertion edit still fails it — instead of asserting a
    count of zero the repository refutes.
  - **Verified and checked.** Every conjunct was executed against the committed
    tree. `scripts/selftest.mjs` has zero deleted lines from the pre-feature
    baseline `e903749c0^` to HEAD (`11265 0`), so no pre-existing assertion differs
    from its pre-feature text; the ownership table declares Scope 03 owns exactly
    `SUP-023-12`; all four ASC-8 surfaces book it; the superseded clause is quoted
    verbatim at its marker site and the literal survives in no live code and in no
    other file; and the marker sits only in the file the distribution names.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the marker check · **Evidence:** `report.md#supersession-ledger`, `report.md#verification-of-the-corrected-ledgered-supersession-row`
- [x] Every excluded path is byte-identical, and the only federal pack change is
      the additive insertion of the three retrieved records.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
- [x] No output states a probability, a lifetime figure, a future year, a track
      record or an error rate.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [ ] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **NOT SATISFIED.** Same-command GREEN is recorded for every row: the full
    selftest and the full browser suite both run clean and their verbatim output
    is in `report.md#gate-results`. Intended-RED was captured and recorded for
    `SUP-023-12` and for the four assertions that failed on first execution
    (TP-03-07, TP-03-12, TP-03-13, TP-03-14), each of which was seen to fail
    before it was seen to pass. It was NOT separately captured for every one of
    the remaining Test Plan rows, because those rows were written against an
    implementation that already existed by the time they ran. Recording a RED I
    did not observe would be fabricated evidence, so the row stays open.
  - **Phase:** implement · **Command:** the exact TP-03-01 through TP-03-25 commands · **Evidence:** `report.md#test-evidence`
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-03-26`, `report.md#tp-03-27`, `report.md#tp-03-28`
