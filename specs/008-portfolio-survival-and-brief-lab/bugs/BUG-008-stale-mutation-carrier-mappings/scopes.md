# BUG-008 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.test` for `TP-B008-000` persistent RED,
followed by the seven focused carrier additions in `TP-B008-001` through
`TP-B008-007`.

[Spec](spec.md) | [Design](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

This filing changes no product source, persistent test, BUG-007 artifact, or
parent Feature 008 artifact.

## Execution Outline

### Phase Order

1. **Scope 1 - Restore Mutation Mapping Causality:** reconcile the initial
   filing into seven independent RED/GREEN carrier repairs, retain each title
   remap only after its exact mutation produces `ERR_ASSERTION`, then run the
   strict 18-case registry and the required regressions.

### New Types And Signatures

- No product type, public API, schema, configuration, or persistence signature
  changes.
- Seven new persistent functional `test()` titles, one per stale mutation.
- Registry-only metadata and checks in `CASES`: exact title remaps,
  `intendedHook` representation metadata for all 18 cases, and reuse of the
  assertion-origin causality check already supplied by the BUG-007 prerequisite.
- No change to `tests/portfolio-defect-injector.cjs`.

### Validation Checkpoints

1. BUG-007 `HARDEN-B007-001` owns and lands the injector coordination repair;
  BUG-008 verifies that prerequisite without staging or claiming it.
2. The pre-repair comprehensive registry applies all 18 mutations and names
  exactly the seven selected titles that remain green.
3. Each new focused title passes exactly once on shipped source before its
  registry mapping is retained.
4. Each exact mutation applies once and makes only its selected title fail once
  through `ERR_ASSERTION`; injector, preload, setup, anchor, syntax, and
  module-load failures are rejected.
5. The final registry preserves 18 cases and seven unchanged anchors, then all
  focused carriers, browser regressions, selftest, adversarial checks, and
  packet gates run before certification.

| Scope | Outcome | Planned test paths | Status |
| --- | --- | --- | --- |
| 1 | Make all seven stale mutation mappings causally protective | `tests/portfolio-test-integrity.unit.mjs` plus five affected functional carriers | Not Started |

## Scope 1 - Restore Mutation Mapping Causality

**Scope ID:** `01-restore-mutation-mapping-causality`
**Status:** Not Started
**Depends On:** BUG-007 `HARDEN-B007-001` (external, foreign-owned prerequisite)
**Finding:** `B008-MAPPING-001`
**Execution prerequisite:** BUG-007 `HARDEN-B007-001` must first provide the
shared injector coordination repair. BUG-008 consumes that repaired injector
without editing, staging, claiming, or certifying it.
**Execution dependency:** `bubbles.plan` -> `bubbles.test` (seven focused RED
proofs) -> `bubbles.test` (carrier repair and shipped-source GREEN) -> quality
phases -> `bubbles.validate`

### Implementation Files

| Path | Planned role |
| --- | --- |
| `tests/portfolio-test-integrity.unit.mjs` | Registry-only hunk: preserve all 18 cases and seven anchors; add representation-hook metadata, apply the strict assertion-origin helper to every case, and retain seven exact title remaps only after RED proof. Do not stage or claim the adjacent BUG-007 repair. |
| `tests/portfolio-privacy.functional.mjs` | Add one focused title that asserts the complete public-exclusion inventory for `F008-CLEAR-TEST-001`. |
| `tests/portfolio-paths.functional.mjs` | Add separate focused titles for direct stale token identity rejection and exact dated cash-need scheduling. |
| `tests/portfolio-diversification.functional.mjs` | Add separate focused titles for qualified Forbes-Rigobon orientation/value and non-aligned excess-return refusal. |
| `tests/portfolio-allocation.functional.mjs` | Add one focused title proving the declared BND cap makes the named minimum-variance candidate infeasible with a concrete conflicting set. |
| `tests/portfolio-dossier.functional.mjs` | Add one focused title that submits an actually incomplete decision-fold request and asserts `request-invalid`. |

### Change Boundary

Allowed delivery changes are limited to the five functional carriers above,
the BUG-008 registry-only hunk in `tests/portfolio-test-integrity.unit.mjs`,
and phase-owned BUG-008 packet updates.

Excluded changes include all product source, the shared defect injector,
BUG-007 source/report changes, parent Feature 008 artifacts, and unrelated
tests. The existing dirty BUG-007 hunks in
`tests/portfolio-defect-injector.cjs` and
`tests/portfolio-test-integrity.unit.mjs` remain foreign-owned. BUG-008 may
commit only its registry hunk in the latter after the prerequisite lands or by
an owner-coordinated path-specific commit that cannot absorb the foreign hunk.

### Shared Infrastructure Impact Sweep

The full 18-mutation registry is mandatory after every mapping repair. It must
retain one case per audited finding, one marker application through the
declared intended hook per case, one selected test per case, and
assertion-origin failure under every mutation. The registry loop must apply the
same `readApplications()` and `mutationCausalityProblems()` contract to the 18
Feature 008 cases that the BUG-007 prerequisite provides for its own cases.

The shared injector remains byte-identical. Rollback reverts only the registry
mapping and focused carrier assertions.

### Consumer Impact Sweep

| Consumer | Required outcome |
| --- | --- |
| Scope 28 `SCN-008-054` | All audited defects are load-bearing again. |
| Privacy carrier | Public exclusions are observed separately from personal deletion. |
| Path carrier | Stale identity and dated cash-need behavior are both causal. |
| Diversification carrier | Qualified adjustment and hedge sample contracts are causal. |
| Allocation carrier | Declared constraints can make a named candidate infeasible. |
| Dossier carrier | Incomplete fold requests fail their exact contract. |
| Feature 008 browser surface | Existing behavior remains unchanged. |

### Mutation Obligation Matrix

| Scenario | Finding | Preserved source substitution | Exact planned protective title | Exact assertion surface |
| --- | --- | --- | --- | --- |
| `SCN-B008-001` | `F008-CLEAR-TEST-001` | `} else if (!reservedPersonalKey(stored.key)) {` -> `} else if (false) {` | `BUG-008 clear mapping: public exclusions enumerate untouched public storage` | Deeply assert the expected `publicExclusions` inventory, including `categoryId`, `location`, `sourcePath`, and content hash; the mutation removes the entry. |
| `SCN-B008-002` | `F008-PATH-CONTRACT-001` | `if (token.workspaceIdentity !== spec.workspaceIdentity || token.scenarioIdentity !== identity) {` -> `if (false) {` | `BUG-008 token mapping: mismatched scenario identity is superseded directly` | Pass an otherwise active token with a mismatched scenario identity directly to `runScenarioChunk()` and require `P008-COMPUTE-SUPERSEDED`. |
| `SCN-B008-003` | `F008-SURVIVAL-PATH-001` | `if (sessionDates[s] >= flow.date) { session = s; break; }` -> `if (s === 0) { session = s; break; }` | `BUG-008 cash-need mapping: declared date resolves to the first eligible session` | Require the `2026-02-04` need to report `declaredDate=2026-02-04`, `modeledDate=2026-02-04`, and zero-based `session=2`, not merely an event. |
| `SCN-B008-004` | `F008-DIVERSIFICATION-001` | `if (input && input.contractVersion === "ForbesRigobonRequest/v1") {` -> `if (false) {` | `BUG-008 diversification mapping: qualified Forbes-Rigobon adjustment exposes orientation and estimate` | Require qualified state, `TARGET` -> `PROXY` anchor orientation, named tranquil/turbulent samples, and the deterministic adjusted estimate from the frozen samples. |
| `SCN-B008-005` | `F008-HEDGE-001` | `if (request.sample.definitionKind !== "aligned-excess-returns") {` -> `if (false) {` | `BUG-008 hedge mapping: non-aligned excess-return sample is unavailable` | Supply a valid sample with a non-`aligned-excess-returns` definition and require unavailable reason `excess-return-sample-required`. |
| `SCN-B008-006` | `F008-ALLOCATION-001` | `var list = Array.isArray(constraints) ? constraints : [];` -> `var list = [];` | `BUG-008 allocation mapping: declared BND cap makes minimum variance infeasible` | Require the minimum-variance candidate to be infeasible under `BND maximum=0.5` and expose a conflicting row whose subject is `BND`, kind is `maximum`, required is `0.5`, and actual exceeds required. |
| `SCN-B008-007` | `F008-DOSSIER-001` | `]) || request.contractVersion !== DECISION_FOLD_REQUEST_VERSION) {` -> `]) && false) {` | `BUG-008 dossier mapping: incomplete decision-fold request is request-invalid` | Submit a pre-computation request missing one exact required fold key and require `state=unavailable` plus `reason=request-invalid`; do not derive the request from an already-computed fold result. |

### Gherkin Scenarios

```gherkin
Scenario: SCN-B008-001 public clear exposes the exclusion inventory
  Given all 18 mutation cases remain registered
  And F008-CLEAR-TEST-001 retains the public-exclusion branch anchor
  When its selected clear title runs on shipped source and with `else if (false)`
  Then shipped source passes by asserting the complete public exclusion inventory
  And the mutant fails once through ERR_ASSERTION because that inventory entry disappears

Scenario: SCN-B008-002 stale token identity is refused or superseded
  Given F008-PATH-CONTRACT-001 retains the token identity mismatch anchor
  And a token carries a stale or mismatched scenario identity without another failure trigger
  When the selected token title runs on shipped source and under the identity-check mutation
  Then shipped source refuses or supersedes the stale token directly
  And the mutant fails once through ERR_ASSERTION because that stale identity is accepted

Scenario: SCN-B008-003 a cash need lands on its declared session and date
  Given F008-SURVIVAL-PATH-001 retains the first-session-on-or-after-date anchor
  And a cash need declares a date that maps to a known modeled session
  When the selected path title runs on shipped source and under the scheduling mutation
  Then shipped source records the event on the declared modeled date and session
  And the mutant fails once through ERR_ASSERTION on that exact timing rather than event existence

Scenario: SCN-B008-004 qualified Forbes-Rigobon adjustment is observable
  Given F008-DIVERSIFICATION-001 retains the qualified ForbesRigobonRequest/v1 dispatch anchor
  And the fixture qualifies for the adjustment branch
  When the selected diversification title runs on shipped source and under the dispatch mutation
  Then shipped source reports the qualified branch state orientation and calculated value
  And the mutant fails once through ERR_ASSERTION on that exact adjustment result

Scenario: SCN-B008-005 non-aligned hedge samples are unavailable
  Given F008-HEDGE-001 retains the aligned-excess-returns sample requirement anchor
  And the fixture supplies a sample whose definition is not aligned-excess-returns
  When the selected hedge title runs on shipped source and under the sample-check mutation
  Then shipped source refuses the sample or marks the result unavailable for that exact reason
  And the mutant fails once through ERR_ASSERTION rather than through a neighboring partial-cost case

Scenario: SCN-B008-006 declared allocation constraints produce a concrete conflict
  Given F008-ALLOCATION-001 retains the declared-constraints normalization anchor
  And a named candidate violates a named declared constraint
  When the selected allocation title runs on shipped source and with constraints dropped
  Then shipped source identifies the concrete infeasible candidate and conflicting constraint set
  And the mutant fails once through ERR_ASSERTION because the conflict is no longer enforced

Scenario: SCN-B008-007 incomplete decision-fold requests are request-invalid
  Given F008-DOSSIER-001 retains the exact fold keys and request-version anchor
  And the fixture submits an actually incomplete decision-fold request before computation
  When the selected dossier title runs on shipped source and under the acceptance mutation
  Then shipped source returns request-invalid for the incomplete request
  And the mutant fails once through ERR_ASSERTION rather than inspecting an already-computed fold
```

### UI Scenario Matrix

No new user-visible behavior is planned. Existing Feature 008 browser carriers
serve as regression coverage for accidental product-test weakening.

### Implementation Plan

1. Confirm BUG-007 `HARDEN-B007-001` has supplied the shared injector
  coordination repair. Record it only as a prerequisite; do not edit, stage,
  commit, or claim the injector repair from BUG-008.
2. Rerun the comprehensive registry before carrier edits. Require 18 applied
  mutations and exactly the seven named green mutants from the current
  diagnostic, with no representation or infrastructure failure.
3. Add the seven exact titles from the Mutation Obligation Matrix as separate
  tests in their five owning functional carriers. Do not weaken or repurpose
  the existing broad titles.
4. Run each new title alone on shipped source. Require exactly one discovered
  test, one pass, zero failures, zero skips, and zero todos.
5. Provisionally remap one `CASES` title at a time and run the comprehensive
  registry. Retain the remap only when that exact case applies once through
  its declared hook and the selected title fails once with `ERR_ASSERTION`.
  Keep every unrepaired finding explicit in the staged RED output.
6. In the registry-only hunk, add declared hook metadata for all 18 cases and
  apply the strict assertion-origin causality helper to every case. Preserve
  all finding ids and every `find`/`replace` anchor byte-for-byte.
7. After all seven remaps, run the complete three-test integrity file and
  require all 18 mutations to satisfy shipped GREEN plus mutant assertion RED.
8. Run all five affected functional files, affected and broader Feature 008
  browser matrices, the canonical selftest, and the bugfix adversarial guard.
9. Run planning and delivery gates without a skip, baseline, budget increase,
  source weakening, or excluded-path change. Human acceptance remains
  unchecked until a human records it; `bubbles.validate` owns certification.

### Test Plan

| Plan ID | Scenario | Category | Persistent file and exact title | Shipped-source command | Mutant proof | Required assertion |
| --- | --- | --- | --- | --- | --- | --- |
| `TP-B008-000` | `SCN-B008-001` through `SCN-B008-007` | `unit` | `tests/portfolio-test-integrity.unit.mjs` - `Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing` | `timeout 240 node --test --test-name-pattern="^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$" tests/portfolio-test-integrity.unit.mjs` | Pre-repair outer RED must show 18 applied cases and exactly the seven named green mutants. | Establish the persistent RED without injector, preload, setup, anchor, syntax, or module-load failure. |
| `TP-B008-001` | `SCN-B008-001` | `functional` | `tests/portfolio-privacy.functional.mjs` - `BUG-008 clear mapping: public exclusions enumerate untouched public storage` | `timeout 240 node --test --test-name-pattern="^BUG-008 clear mapping: public exclusions enumerate untouched public storage$" tests/portfolio-privacy.functional.mjs` | Provisionally remap `F008-CLEAR-TEST-001`, then run the `TP-B008-000` command. | One shipped pass; one applied mutation; one `ERR_ASSERTION` failure on the exact public exclusion inventory. |
| `TP-B008-002` | `SCN-B008-002` | `functional` | `tests/portfolio-paths.functional.mjs` - `BUG-008 token mapping: mismatched scenario identity is superseded directly` | `timeout 240 node --test --test-name-pattern="^BUG-008 token mapping: mismatched scenario identity is superseded directly$" tests/portfolio-paths.functional.mjs` | Provisionally remap `F008-PATH-CONTRACT-001`, then run the `TP-B008-000` command. | One shipped pass; one applied mutation; one `ERR_ASSERTION` failure on `P008-COMPUTE-SUPERSEDED`. |
| `TP-B008-003` | `SCN-B008-003` | `functional` | `tests/portfolio-paths.functional.mjs` - `BUG-008 cash-need mapping: declared date resolves to the first eligible session` | `timeout 240 node --test --test-name-pattern="^BUG-008 cash-need mapping: declared date resolves to the first eligible session$" tests/portfolio-paths.functional.mjs` | Provisionally remap `F008-SURVIVAL-PATH-001`, then run the `TP-B008-000` command. | One shipped pass; one applied mutation; one `ERR_ASSERTION` failure on declared date, modeled date, or session `2`. |
| `TP-B008-004` | `SCN-B008-004` | `functional` | `tests/portfolio-diversification.functional.mjs` - `BUG-008 diversification mapping: qualified Forbes-Rigobon adjustment exposes orientation and estimate` | `timeout 240 node --test --test-name-pattern="^BUG-008 diversification mapping: qualified Forbes-Rigobon adjustment exposes orientation and estimate$" tests/portfolio-diversification.functional.mjs` | Provisionally remap `F008-DIVERSIFICATION-001`, then run the `TP-B008-000` command. | One shipped pass; one applied mutation; one `ERR_ASSERTION` failure on qualified orientation or adjusted estimate. |
| `TP-B008-005` | `SCN-B008-005` | `functional` | `tests/portfolio-diversification.functional.mjs` - `BUG-008 hedge mapping: non-aligned excess-return sample is unavailable` | `timeout 240 node --test --test-name-pattern="^BUG-008 hedge mapping: non-aligned excess-return sample is unavailable$" tests/portfolio-diversification.functional.mjs` | Provisionally remap `F008-HEDGE-001`, then run the `TP-B008-000` command. | One shipped pass; one applied mutation; one `ERR_ASSERTION` failure on `excess-return-sample-required`. |
| `TP-B008-006` | `SCN-B008-006` | `functional` | `tests/portfolio-allocation.functional.mjs` - `BUG-008 allocation mapping: declared BND cap makes minimum variance infeasible` | `timeout 240 node --test --test-name-pattern="^BUG-008 allocation mapping: declared BND cap makes minimum variance infeasible$" tests/portfolio-allocation.functional.mjs` | Provisionally remap `F008-ALLOCATION-001`, then run the `TP-B008-000` command. | One shipped pass; one applied mutation; one `ERR_ASSERTION` failure on the named infeasible candidate and conflicting set. |
| `TP-B008-007` | `SCN-B008-007` | `functional` | `tests/portfolio-dossier.functional.mjs` - `BUG-008 dossier mapping: incomplete decision-fold request is request-invalid` | `timeout 240 node --test --test-name-pattern="^BUG-008 dossier mapping: incomplete decision-fold request is request-invalid$" tests/portfolio-dossier.functional.mjs` | Provisionally remap `F008-DOSSIER-001`, then run the `TP-B008-000` command. | One shipped pass; one applied mutation; one `ERR_ASSERTION` failure on `request-invalid`. |
| `TP-B008-008` | all seven | `unit` | `tests/portfolio-test-integrity.unit.mjs` - all three outer tests | `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs` | Final strict registry run after all seven mappings are retained. | Preserve all 18 cases and seven anchors; every shipped title passes once and every mutant fails once through `ERR_ASSERTION`. |
| `TP-B008-009` | all seven | `functional` | all five affected functional carrier files | `timeout 600 node --test tests/portfolio-privacy.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-dossier.functional.mjs` | Not applicable; this is the complete shipped-source carrier checkpoint. | Every affected file passes with zero skip or todo. |
| `TP-B008-010` | all seven regression boundary | `e2e-ui` | four affected Feature 008 browser carriers | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Not applicable; product source is unchanged. | Existing visible privacy, path, diversification, allocation, and dossier-adjacent behavior remains unchanged. |
| `TP-B008-011` | all seven regression boundary | `e2e-ui` | complete eight-file Feature 008 browser matrix | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Not applicable; product source is unchanged. | The full Feature 008 route matrix remains green. |
| `TP-B008-012` | all seven repository boundary | `functional` | `scripts/selftest.mjs` | `timeout 1800 node scripts/selftest.mjs` | Not applicable. | Canonical invariants remain green without budget or baseline changes. |
| `TP-B008-013` | all seven integrity boundary | `functional` | registry plus five functional carriers | `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-test-integrity.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-dossier.functional.mjs` | The seven exact mutations are the negative controls. | No bailout, skip, interception, optional assertion, tautological setup, or broad-title substitution satisfies the bugfix. |

### Test Plan To DoD Parity

| Test Plan row | Primary DoD item |
| --- | --- |
| `TP-B008-000` | Persistent pre-fix registry RED is recorded |
| `TP-B008-001` | Clear inventory title passes shipped and rejects its exact mutation |
| `TP-B008-002` | Token identity title passes shipped and rejects its exact mutation |
| `TP-B008-003` | Cash-need timing title passes shipped and rejects its exact mutation |
| `TP-B008-004` | Forbes-Rigobon title passes shipped and rejects its exact mutation |
| `TP-B008-005` | Hedge sample title passes shipped and rejects its exact mutation |
| `TP-B008-006` | Allocation constraint title passes shipped and rejects its exact mutation |
| `TP-B008-007` | Dossier request title passes shipped and rejects its exact mutation |
| `TP-B008-008` | Full strict 18-case registry passes |
| `TP-B008-009` | Five complete affected functional carriers pass |
| `TP-B008-010` | Affected browser regression passes |
| `TP-B008-011` | Broader Feature 008 browser regression passes |
| `TP-B008-012` | Canonical repository selftest passes |
| `TP-B008-013` | Adversarial integrity guard passes |

### Definition of Done - Tiered Validation

#### Core Items

- [ ] BUG-007 `HARDEN-B007-001` is consumed only as a prerequisite. BUG-008
  does not edit, stage, commit, claim, or certify the injector coordination
  repair.
- [ ] The registry-only hunk preserves all 18 cases and all seven exact
  `find`/`replace` anchors, declares the intended representation hook for every
  case, and applies the strict assertion-origin causality helper to every case.
- [ ] Delivery changes remain inside the declared Change Boundary with zero
  product-source, shared-injector, BUG-007, parent Feature 008, or unrelated
  test changes.
- [ ] `TP-B008-000` records the persistent pre-fix registry RED before mapping
  or carrier repair. Evidence: `report.md#tp-b008-000`.
- [ ] `TP-B008-001` proves `SCN-B008-001`: the clear title passes once on
  shipped source and fails once through `ERR_ASSERTION` under
  `F008-CLEAR-TEST-001`. Evidence: `report.md#tp-b008-001`.
- [ ] `TP-B008-002` proves `SCN-B008-002`: the token title passes once on
  shipped source and fails once through `ERR_ASSERTION` under
  `F008-PATH-CONTRACT-001`. Evidence: `report.md#tp-b008-002`.
- [ ] `TP-B008-003` proves `SCN-B008-003`: the cash-need title passes once on
  shipped source and fails once through `ERR_ASSERTION` under
  `F008-SURVIVAL-PATH-001`. Evidence: `report.md#tp-b008-003`.
- [ ] `TP-B008-004` proves `SCN-B008-004`: the Forbes-Rigobon title passes once
  on shipped source and fails once through `ERR_ASSERTION` under
  `F008-DIVERSIFICATION-001`. Evidence: `report.md#tp-b008-004`.
- [ ] `TP-B008-005` proves `SCN-B008-005`: the hedge title passes once on
  shipped source and fails once through `ERR_ASSERTION` under
  `F008-HEDGE-001`. Evidence: `report.md#tp-b008-005`.
- [ ] `TP-B008-006` proves `SCN-B008-006`: the allocation title passes once on
  shipped source and fails once through `ERR_ASSERTION` under
  `F008-ALLOCATION-001`. Evidence: `report.md#tp-b008-006`.
- [ ] `TP-B008-007` proves `SCN-B008-007`: the dossier title passes once on
  shipped source and fails once through `ERR_ASSERTION` under
  `F008-DOSSIER-001`. Evidence: `report.md#tp-b008-007`.
- [ ] `TP-B008-008` proves all three outer integrity tests and all 18 mutation
  cases are causally green. Evidence: `report.md#tp-b008-008`.
- [ ] `TP-B008-009` proves all five affected functional carrier files pass in
  full with zero skip or todo. Evidence: `report.md#tp-b008-009`.
- [ ] `TP-B008-010` affected Feature 008 browser regression passes. Evidence:
  `report.md#tp-b008-010`.
- [ ] `TP-B008-011` broader Feature 008 browser regression passes. Evidence:
  `report.md#tp-b008-011`.
- [ ] `TP-B008-012` canonical repository selftest passes without a budget or
  baseline change. Evidence: `report.md#tp-b008-012`.
- [ ] `TP-B008-013` adversarial integrity guard passes without bailout, skip,
  interception, optional assertion, or tautological carrier. Evidence:
  `report.md#tp-b008-013`.
- [ ] Human acceptance disposition remains human-owned in
  `uservalidation.md`.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero skipped required tests, zero
  infrastructure-error substitutes, zero removed cases, zero baselines, zero
  weakened anchors, exact changed-path containment, current packet
  documentation, artifact lint, traceability, scenario-obligation lint,
  test-mechanism lint, scope-context-fit lint, capability-foundation guard,
  implementation-reality scan, and validate-owned transition checks green.

All items remain unchecked. This packet records diagnosis and planned work. It
does not claim implementation, test completion, human acceptance, or
certification.
