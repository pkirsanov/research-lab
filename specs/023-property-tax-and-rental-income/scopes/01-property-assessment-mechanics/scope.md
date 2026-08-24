# Scope 1: Property Assessment Mechanics And Statutory Relief Regimes

## 01-property-assessment-mechanics

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** Executed — 13 of 13 Definition of Done rows satisfied
**Scope-Kind:** runtime-behavior
**Tags:** `foundation:true`, `declared-vs-sourced:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** none
**Foundation:** true

**Primary Outcome:** a household declares what only it knows — an assessed value, a
local combined rate, the exemptions it claims — and receives a property-tax figure
shaped by a statutory relief regime it can read the constitutional section of. The
two halves refuse differently and render differently, so a user can always tell
which half is missing. This scope also builds the leg-visibility machinery that
every later leg in this feature is checked by.

## Requirement Coverage

- **FR-023-001** — `PropertyAssessment/v1` carries only declared members and no
  `sourceRef`; every displayed assessment figure is labelled a declaration.
- **FR-023-002** — `PropertyReliefRegime/v1` carries only sourced members with
  citations and locators; an unretrieved member is an `AbsentFigure/v1`.
- **FR-023-003** — a missing declaration refuses `RLTAX-INPUT-INCOMPLETE` and an
  unretrieved rule refuses `RLTAX-THRESHOLD-UNAVAILABLE`, structurally distinct.
- **FR-023-004** — each relief mechanism declares its application point and the
  engine applies it there; incoherent points are refused.
- **FR-023-005** — the assessment cap declares its basis from a closed set and the
  engine applies it at that basis with no regime-name branch.
- **FR-023-006** — a rate ceiling is applied as a ceiling and never as the rate.
- **FR-023-007** — the property-tax settlement is a leg with a rule status,
  surfaced in the headline, the comparison, the curve and the export.

Inherited and re-asserted: **NFR-023-001** declared or sourced never conflated,
**NFR-023-002** zero network, **NFR-023-003** no household value in any URL or
request, **NFR-023-004** vocabulary unchanged, **NFR-023-005** no figure in any
module, **NFR-023-006** leg visibility, **NFR-023-009** Feature 008 byte-identity,
**NFR-023-010** no registration.

## Gherkin Scenarios

```gherkin
Scenario: SCN-023-001 A declared assessment and a sourced regime refuse differently
  Given a property whose assessed value is undeclared
  And separately a property whose jurisdiction's relief regime member was not retrieved
  When the property-tax settlement runs for each
  Then the first is RLTAX-INPUT-INCOMPLETE naming the missing declaration
  And the second is RLTAX-THRESHOLD-UNAVAILABLE naming the unretrieved rule
  And neither shows a zero, an average or a typical rate in place of the refusal

Scenario: SCN-023-002 An exemption and an assessment-growth cap are applied at their declared points
  Given a declared assessment, a declared prior-year assessed value and a regime carrying an exemption and a growth cap
  When the settlement runs
  Then the exemption is applied to the assessment at its declared application point
  And the cap is applied against the regime's declared cap basis
  And the before and after figures are both shown with the section that establishes each

Scenario: SCN-023-003 An acquisition-value regime is a different figure, not a different percentage
  Given a property whose declared acquisition value differs materially from its declared current assessed value
  When the settlement runs under a regime declaring an acquisition-value cap basis
  Then the taxable basis is the capped acquisition value rather than the current assessed value
  And a regime declaring a prior-assessed-value cap basis is proven to produce a different figure from the same declarations
  And a declared local rate below the regime's rate ceiling is used unchanged with that fact stated
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-023-001 declared missing | Regime resolved, assessed value blank | Open the property panel | `RLTAX-INPUT-INCOMPLETE` naming the member, no numeral, labelled as the household's own missing input | e2e-ui |
| SCN-023-001 sourced missing | Assessment complete, regime member absent | Open the property panel | `RLTAX-THRESHOLD-UNAVAILABLE` naming the rule and its remediation, reading differently from the input refusal | e2e-ui |
| SCN-023-002 relief applied | Full declarations, regime with exemption and cap | Open the property panel | Assessment before, exemption applied, cap applied, taxable basis after, each citation reachable with its locator | e2e-ui |
| SCN-023-003 cap basis | Acquisition value far below current assessed value | Open the property panel | The taxable basis follows the acquisition value, and the panel names the cap basis in force | e2e-ui |
| Origin labelling | Any complete settlement | Open the property panel | Every declared figure is labelled the household's input and carries no citation; every sourced figure carries a citation and no declaration label | e2e-ui |
| Leg visibility | The all-non-zero leg fixture | Open Simple then Power | The property leg appears in the headline total, the comparison table, the curve contributor list and the export | e2e-ui |

## Implementation Files

### New

- `rltaxproperty.js` — UMD module owning `resolvePropertyRegime`,
  `computePropertyTax` and `propertyMarginalContext`.
- `tax-rules/property/FL/<year>.json` — the Florida relief regime.
- `tax-rules/property/CA/<year>.json` — the California relief regime.
- Fixture regimes: one declaring `capBasis: "prior-assessed-value"`, one declaring
  `capBasis: "acquisition-value"`, one carrying a rate ceiling, one carrying an
  unretrieved cap, and one invalid regime declaring an exemption applied to a rate.
- The all-non-zero leg-visibility fixture.

### Modified

- `rltaxrules.js` — `PropertyAssessment/v1`, `PropertyReliefRegime/v1`, the
  cap-basis enum, the property regime path grammar.
- `rltax.js` — stage `CO-15`, reconciliation leg `L8`, the leg-visibility set
  identity helper.
- `rltaxworkspace.js` — the property declarations plus their inventory, clear and
  export-sanitizer entries.
- `lifetime-tax-strategy-lab.html` — the property inputs and the `power-property`
  section.
- `scripts/selftest.mjs` — one appended group, plus SUP-023-05.
- `tests/lifetime-tax-route.spec.mjs` — SUP-023-06 only.
- `tests/lifetime-tax-foundation.spec.mjs` — SUP-023-07 and SUP-023-08 only.

## Implementation Plan

1. Add `PropertyAssessment/v1` to `rltaxrules.js`. Validation refuses any
   `sourceRef` on any member, which is what makes the declared half structurally
   incapable of impersonating a sourced figure.
2. Add `PropertyReliefRegime/v1`. Every value-bearing member carries a
   `ComponentSource/v1` reused unchanged from Feature 022. An unretrieved member is
   an `AbsentFigure/v1` with a `missingSource` pointer and no smuggled numeric
   member.
3. Add the cap-basis enum with exactly the two members
   `prior-assessed-value` and `acquisition-value`. The engine branches on the
   member. Extend the no-shadow scan to assert no module holds a regime name, a
   state name, a county name, a cap figure or a ceiling figure.
4. Add the relief-mechanism coherence rules: an exemption applied to a rate and a
   cap applied to a tax amount are each refused `RLTAX-PACK-INVALID` naming the
   incoherent pairing.
5. Author `rltaxproperty.js`. `computePropertyTax(assessment, regime)` takes the
   declared assessment and the sourced regime **and no federal or state income
   figure**. There must be no parameter through which one could arrive.
6. Implement the two refusal paths and prove they are distinguishable by contract
   shape rather than by message text, so a copy edit cannot collapse them.
7. Implement the rate ceiling as `min(declaredRate, ceiling)` and publish which
   side bound. A regime with no ceiling publishes that no ceiling applies.
8. **Retrieve `BI-1`.** Open the Florida constitutional article and the Florida
   Department of Revenue property-tax pages, transcribe the homestead exemption
   amounts and tiers and the Save Our Homes assessment-increase cap and its basis,
   and record each in a `SourceRecord` with its locator. If a member cannot be
   retrieved it ships absent and the Florida settlement refuses.
9. **Retrieve `BI-2`.** Open California Constitution Article XIII A and the
   California State Board of Equalization pages, transcribe the acquisition-value
   basis, the annual assessed-value inflation cap and the ad valorem rate ceiling,
   and record each the same way. Same consequence on failure.
10. Author both regime packs from the retrieved records only. No figure in
    `spec.md` or `design.md` may be transcribed into either pack.
11. Add stage `CO-15` and reconciliation leg `L8` in `rltax.js`, derived from the
    pack's declared leg set rather than from a list in the module.
12. Build the **leg-visibility set identity helper**: given the settled record's
    declared legs and the four surfaces, assert two-directional set equality
    against the all-non-zero fixture, and name the missing leg on failure rather
    than reporting a numeric mismatch. Every later scope in this feature consumes
    it unchanged.
13. Add the property declarations to `rltaxworkspace.js`. Treat the assessed value
    and the acquisition value as location-adjacent: extend the inventory, the clear
    action and the export sanitizer, and prove each independently.
14. Render the `power-property` section and the origin labelling. Every declared
    figure is labelled the household's input; every sourced figure carries a
    citation with its locator.
15. Deliver SUP-023-05, SUP-023-06, SUP-023-07 and SUP-023-08 under the
    [supersession procedure](../_index.md#assertion-supersession-procedure).
16. Append a `lifetime-tax — property assessment and statutory relief` group to
    `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltaxrules.js` contract registry | Two contracts added | Scopes 02–05 | High — a validator that accepts a `sourceRef` on a declared object destroys the feature's central distinction | Assert a declared object carrying a citation is refused, and a sourced object missing one is refused, before either is consumed | Remove both contracts |
| `rltax.js` leg set | Leg `L8` added, derived from the pack | Scopes 02–05 and Feature 022's reconciliation | High — a hardcoded leg list would silently drop every later leg | Assert Feature 021 and 022 fixtures produce their exact prior leg sets before `L8` is added | Remove the leg from the pack's declared set |
| The leg-visibility helper | New shared assertion surface | Scopes 02–05 | High — a helper that passes on an all-zero fixture proves nothing and would certify the exact defect it exists to catch | Assert the helper fails when a leg is removed from each of the four surfaces in turn, on the all-non-zero fixture | Remove the helper and its fixture |
| `rltaxworkspace.js` | Property declarations plus privacy surface | Scopes 02–05 | High — the assessed value is location-adjacent | Assert each new key is inventoried, cleared, redacted, and absent from every URL, request, referrer and console message | Remove the members |
| `POWER_SECTION_IDS` and the withheld-link set | One section added | Scopes 02–05, and both superseded link counts | Medium — a link added without a section makes the withheld-detail promise false | The SUP-023-05 and SUP-023-06 replacements assert two-directional identity, so a link without a section fails | Remove the section |
| `scripts/selftest.mjs` | One group appended plus SUP-023-05 | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the group and revert the marker |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxproperty.js` · `tax-rules/property/FL/<year>.json` ·
`tax-rules/property/CA/<year>.json` · this scope's fixture regimes and
leg-visibility fixture · this scope's Playwright spec.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs` (append, plus SUP-023-05)
· `tests/lifetime-tax-route.spec.mjs` (SUP-023-06 only) ·
`tests/lifetime-tax-foundation.spec.mjs` (SUP-023-07 and SUP-023-08 only).

The three prior-feature test files above are allowed **because** the
[per-file marker distribution](../design.md#per-file-marker-distribution) places
this scope's owned markers in them. No other prior-feature test file is opened.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `rltaxstrategy.js` · `rltaxstate.js` · `rltaxcombined.js` ·
`tax-rules/federal/**` · `tax-rules/state/**` · `tools.json` · `index.html` ·
`rlnav.js` · `README.md` · `notes/README.md` · `market-brief.*` · `briefs/**` ·
`data/**` · `watchlist.json` · `site-exclusions.json` ·
`scripts/build-pages-site.mjs` · `scripts/validate-spec-test-paths.baseline` ·
`tests/lifetime-tax-conversion.spec.mjs` · `tests/lifetime-tax-federal.spec.mjs` ·
`tests/lifetime-tax-marginal.spec.mjs` · `tests/lifetime-tax.support.mjs` ·
every framework-managed file.

`tax-rules/federal/**` and `tax-rules/state/**` are excluded deliberately. Opening
the housing axis must not require an income-tax pack edit; if it does, the axis is
not a seam.

**Rollback:** delete `rltaxproperty.js`, both regime packs and the fixtures; revert
the two contracts, the cap-basis enum, stage `CO-15`, leg `L8`, the leg-visibility
helper and the workspace members; revert the page section; revert the four
supersession replacements to their superseded clauses.

## Assertion Supersession Owned By This Scope

Four entries: **SUP-023-05**, **SUP-023-06**, **SUP-023-07**, **SUP-023-08**. Each
is caused by a deliberate change this scope's requirement coverage names: the
added Power section changes the withheld-link count (FR-023-007's surfacing
obligation), and the added workspace declarations change the storage inventory
count (NFR-023-003's privacy obligation). Each replacement derives its expected
value from the artifact it describes, so the growth Scopes 02 through 05 add is
absorbed without a further entry.

Every other pre-existing assertion must still pass unchanged at the end of this
scope. An assertion outside these four that fails is either a defect in this
scope's change and is fixed, or an ASC-8 admission recorded in the ledger before
the edit.

## Scenario-First Red/Green Contract

Add the named known-value assertion first, run the exact command, and confirm the
intended contract assertion is what fails. Then implement the smallest owned change
and rerun the identical command.

**Named intended-RED assertion for this scope:** two fixture regimes identical in
every member except `capBasis` — one `prior-assessed-value`, one
`acquisition-value` — settled against the same declared assessment, must produce
**different** taxable bases, and the assertion must name which basis produced
which. Before the cap-basis branch exists the two produce the same figure and the
assertion fails on equality. A syntax error, a missing browser or an absent test
does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Contract | unit | SCN-023-001 | `scripts/selftest.mjs` | `PropertyAssessment/v1` refuses any member carrying a `sourceRef`, and `PropertyReliefRegime/v1` refuses any value-bearing member missing one or missing a locator | `node scripts/selftest.mjs` | No | `report.md#tp-01-01` |
| TP-01-02 | Refusal separation | unit | SCN-023-001 | `scripts/selftest.mjs` | A missing declaration is `RLTAX-INPUT-INCOMPLETE` naming the member; an unretrieved regime member is `RLTAX-THRESHOLD-UNAVAILABLE` naming the rule; the two are distinguished by contract shape and not by message text | `node scripts/selftest.mjs` | No | `report.md#tp-01-02` |
| TP-01-03 | Adversarial | unit | SCN-023-001 | `scripts/selftest.mjs` | Regression: an implementation returning `0` for an undeclared assessed value is proven to fail the refusal assertion | `node scripts/selftest.mjs` | No | `report.md#tp-01-03` |
| TP-01-04 | Contract | unit | SCN-023-002 | `scripts/selftest.mjs` | A regime declaring an exemption applied to a rate, and one declaring a cap applied to a tax amount, are each refused `RLTAX-PACK-INVALID` naming the incoherent pairing | `node scripts/selftest.mjs` | No | `report.md#tp-01-04` |
| TP-01-05 | Known value | unit | SCN-023-002 | `scripts/selftest.mjs` | A fixture regime's exemption and cap applied at their declared points produce the expected taxable basis below, exactly at and above the cap boundary | `node scripts/selftest.mjs` | No | `report.md#tp-01-05` |
| TP-01-06 | Known value | unit | SCN-023-003 | `scripts/selftest.mjs` | Two fixture regimes differing only in `capBasis` produce different taxable bases from identical declarations, and the record names which basis was applied | `node scripts/selftest.mjs` | No | `report.md#tp-01-06` |
| TP-01-07 | Adversarial | unit | SCN-023-003 | `scripts/selftest.mjs` | Regression: an implementation branching on a regime name rather than on `capBasis` is proven to fail against the fixture regimes, which carry no real regime name | `node scripts/selftest.mjs` | No | `report.md#tp-01-07` |
| TP-01-08 | Known value | unit | SCN-023-003 | `scripts/selftest.mjs` | A declared rate below the ceiling is used unchanged and the record states no ceiling bound; a declared rate above it is reduced to the ceiling and the record states the ceiling bound | `node scripts/selftest.mjs` | No | `report.md#tp-01-08` |
| TP-01-09 | Adversarial | unit | SCN-023-003 | `scripts/selftest.mjs` | Regression: an implementation using the ceiling as the rate is proven to fail the below-ceiling assertion | `node scripts/selftest.mjs` | No | `report.md#tp-01-09` |
| TP-01-10 | Sourcing | unit | SCN-023-001 | `scripts/selftest.mjs` | Every value-bearing member of both shipped regimes resolves to exactly one retrieved source with a locator, and every unretrieved member is an `AbsentFigure` with a `missingSource` pointer and no smuggled numeric member | `node scripts/selftest.mjs` | No | `report.md#tp-01-10` |
| TP-01-11 | Independence | unit | SCN-023-002 | `scripts/selftest.mjs` | `computePropertyTax` accepts no federal or state income figure through any parameter | `node scripts/selftest.mjs` | No | `report.md#tp-01-11` |
| TP-01-12 | Leg visibility | unit | SCN-023-002 | `scripts/selftest.mjs` | Against the all-non-zero fixture, the settled record's declared leg set equals the leg set of the headline, the comparison, the curve contributors and the export, in both directions | `node scripts/selftest.mjs` | No | `report.md#tp-01-12` |
| TP-01-13 | Adversarial | unit | SCN-023-002 | `scripts/selftest.mjs` | Regression: removing the property leg from each of the four surfaces in turn is proven to fail the leg-visibility identity, and the failure names the missing leg | `node scripts/selftest.mjs` | No | `report.md#tp-01-13` |
| TP-01-14 | Vocabulary | unit | SCN-023-001 | `scripts/selftest.mjs` | The refusal vocabulary member count equals its pre-feature value and every pre-existing member retains its meaning and raising site | `node scripts/selftest.mjs` | No | `report.md#tp-01-14` |
| TP-01-15 | No-shadow | unit | SCN-023-003 | `scripts/selftest.mjs` | Regression: no module holds a regime name, state name, county name, cap figure, ceiling figure or authority name; the detector is proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-01-15` |
| TP-01-16 | Privacy | unit | SCN-023-001 | `scripts/selftest.mjs` | Each property declaration is inventoried, cleared, redacted by the export sanitizer, and absent from every URL, request, referrer and console message | `node scripts/selftest.mjs` | No | `report.md#tp-01-16` |
| TP-01-17 | Supersession | unit | SCN-023-002 | `scripts/selftest.mjs` | SUP-023-05's replacement derives the withheld-link and section counts from the page and asserts two-directional identity; the superseded literal is proven to have failed first | `node scripts/selftest.mjs` | No | `report.md#supersession-ledger` |
| TP-01-18 | Regression E2E | e2e-ui | SCN-023-001 | `lifetime-tax-property.spec.mjs` | `Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero" --reporter=list` | Yes | `report.md#scenario-scn-023-001` |
| TP-01-19 | Regression E2E | e2e-ui | SCN-023-002 | `lifetime-tax-property.spec.mjs` | `Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations" --reporter=list` | Yes | `report.md#scenario-scn-023-002` |
| TP-01-20 | Regression E2E | e2e-ui | SCN-023-003 | `lifetime-tax-property.spec.mjs` | `Regression: SCN-023-003 an acquisition-value cap basis produces a different taxable basis and the rate ceiling is a ceiling` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-003 an acquisition-value cap basis produces a different taxable basis and the rate ceiling is a ceiling" --reporter=list` | Yes | `report.md#scenario-scn-023-003` |
| TP-01-21 | Leg visibility E2E | e2e-ui | SCN-023-002 | `lifetime-tax-property.spec.mjs` | `Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export" --reporter=list` | Yes | `report.md#tp-01-21` |
| TP-01-22 | Privacy E2E | e2e-ui | SCN-023-001 | `lifetime-tax-property.spec.mjs` | `Regression: SCN-023-001 the request ledger does not grow after first paint, every entry is a declared same-origin read, and no property declaration reaches a URL` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-001 the request ledger does not grow after first paint, every entry is a declared same-origin read, and no property declaration reaches a URL" --reporter=list` | Yes | `report.md#tp-01-22` |
| TP-01-23 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-001 … -003 | The prior features' specs plus this scope's | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-01-23` |
| TP-01-24 | Repo gate | unit | SCN-023-001 … -003 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-01-24` |
| TP-01-25 | Path guard | unit | SCN-023-001 … -003 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-01-25` |
| TP-01-26 | Deploy gate | unit | SCN-023-001 … -003 | `scripts/build-pages-site.mjs` | The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-01-26` |

### Definition of Done

- [x] FR-023-001 through FR-023-003 are implemented: the declared object refuses a
      citation, the sourced object requires one, and the two refusals are
      distinguished by contract shape rather than by message text.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-01`, `report.md#tp-01-02`, `report.md#tp-01-03`
- [x] FR-023-004 and FR-023-005 are implemented: each relief mechanism is applied
      at its declared point, the cap is applied at its declared basis, and a
      regime-name branch is proven to fail against the fixture regimes.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-04`, `report.md#tp-01-05`, `report.md#tp-01-06`, `report.md#tp-01-07`
- [x] FR-023-006 is implemented: the rate ceiling bounds the declared rate, a
      below-ceiling rate is used unchanged with that fact stated, and using the
      ceiling as the rate is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-08`, `report.md#tp-01-09`
- [x] `BI-1` and `BI-2` were closed by retrievals performed in the implementation
      session and recorded with their own `retrievedAt` and locators, or the
      affected regime member ships as an `AbsentFigure/v1`, its settlement refuses,
      and the relief path is proven by a fixture regime instead.
  - **Phase:** implement · **Command:** the retrieval records in both packs plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-01-10`
- [x] FR-023-007 and NFR-023-006 are implemented: the property leg is surfaced in
      the headline, the comparison, the curve and the export, proven by a
      two-directional set identity against a fixture in which every leg is non-zero
      and mutually distinct, and removing the leg from each surface in turn is
      demonstrated to fail with the missing leg named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser leg-visibility row · **Evidence:** `report.md#tp-01-12`, `report.md#tp-01-13`, `report.md#tp-01-21`
- [x] `computePropertyTax` accepts no federal or state income figure through any
      parameter.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-11`
- [x] NFR-023-004 holds: the refusal vocabulary member count equals its pre-feature
      value and no member's meaning changed.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-14`
- [x] NFR-023-003 and NFR-023-005 hold: every property declaration is inventoried,
      cleared and redacted, the request ledger does not grow after first paint,
      every entry in it is a read of a path the route's own configuration
      declares, both regime packs are present in the ledger the run produced, and
      no module holds a regime name or a figure.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser privacy row · **Evidence:** `report.md#tp-01-15`, `report.md#tp-01-16`, `report.md#tp-01-22`
  - **Restated 2026-08-22 (F-REG-03).** The superseded text read "the request
    ledger stays empty with two regime packs now loaded from disk", which is
    false and self-contradictory: a ledger holding two pack reads is not empty.
    The cited row TP-01-22 (`SCN-023-001`) captures `afterFirstPaint =
    ledger.length`, asserts `expect(afterFirstPaint).toBeGreaterThan(0)`, and
    then asserts `expect(ledger.length).toBe(afterFirstPaint)` — no-growth, not
    emptiness. The restatement names only what that row establishes. Adversarial
    cases: a request issued after first paint fails the no-growth assertion; a
    read of a path the configuration does not declare fails
    `paths.forEach((path) => expect(permitted).toContain(path))`; a boot that
    read nothing fails the greater-than-zero pin; and a regime pack that is
    permitted but never fetched fails `expect(paths).toContain('/' +
    FL_REGIME_PATH)`. The row does NOT constrain the origin of an entry — it
    compares `new URL(entry.url).pathname` only — so no same-origin claim is
    made here; that gap is carried by Feature 021 Scope 01 `TP-01-18`.
- [x] SUP-023-05 through SUP-023-08 are delivered with their markers, each
      replacement derived from the artifact it describes, each superseded clause
      recorded verbatim, and each intended-RED failure recorded before its green.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the two browser specs the markers land in · **Evidence:** `report.md#supersession-ledger`, `report.md#tp-01-17`
- [x] Every excluded path is byte-identical, including both income-tax pack
      families, proving the housing axis is a seam rather than an income-tax edit.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
- [x] No output states a probability, an appreciation assumption, a lifetime
      figure, a track record or an error rate, and no property figure is presented
      as an estimate or a typical rate.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Phase:** implement · **Command:** the exact TP-01-01 through TP-01-26 commands · **Evidence:** `report.md#test-evidence`, `report.md#completion-statement`, and the per-row probes `report.md#probe-1--same-command-red-for-tp-01-06-tp-01-07-and-tp-01-20` through `report.md#probe-26--same-command-red-and-green-for-tp-01-26`
  - **How it closed.** All twenty-six rows now carry both halves. The RED evidence
    is mutation-derived rather than before-implementation and is recorded as such:
    each probe removes the behaviour its row names, runs the command the row names,
    reverts inside the same shell invocation with the revert verified, and re-runs
    that same command. `report.md#completion-statement` carries the row-to-probe
    map. Probe 23 supplied the last row, `TP-01-23`, and discarded a timed-out
    first attempt because a killed run is not a failed run.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds with
      `site-exclusions.json` unchanged.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-01-24`, `report.md#tp-01-25`, `report.md#tp-01-26`
