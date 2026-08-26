# BUG-006 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.test`

[Spec](spec.md) | [Design](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

No source or test change is part of this packet filing. No product test result
is claimed.

## Execution Outline

### Phase Order

1. Preserve the delivered shared-validator boundary and core-consumer
  regression contract without reopening its implementation or evidence.
2. `bubbles.test` adds the exported `composeBrief()` policy-consumer regression
  and records its focused RED result against the current brief source.
3. `bubbles.implement` delegates from `composeBrief()` to the shared validator
  at the design-specified insertion point without changing local error
  precedence or either Date expression.
4. `bubbles.test` reruns the focused brief carrier, existing focused carrier,
  allocation-page non-movement regression, broader Feature 008 regressions,
  and canonical repository selftest.
5. `bubbles.validate` runs packet checks and owns any certification or terminal
  transition.

### New Types And Signatures

- One private module constant: `MAXIMUM_EVIDENCE_AGE_DAYS`.
- One additional shared-validator delegation inside exported
  `rlportfoliobrief.js::composeBrief()`.
- No exported symbol, function signature, schema, route, or storage change.
- `validatePolicy()` retains its existing result envelope.

### Validation Checkpoints

1. The new brief carrier must fail before the brief source edit because
  `36526` succeeds, non-finite policy bypasses shared validation, and a finite
  backward-TimeClip overflow can throw.
2. After the brief repair, local brief failures must retain precedence, `36525`
  must compose successfully, and all invalid policies must return the exact
  shared envelope without throwing.
3. The delivered shared-validator and core-consumer focused carrier must remain
  green without further source or test changes.
4. The allocation page, broader Feature 008 browser matrix, repository
  selftest, and packet guards must remain green before certification.

| Scope | Outcome | Planned source and test paths | Status |
| --- | --- | --- | --- |
| 1 | Reject unsafe evidence-age policy before both policy-derived Date consumers | `rlportfolio.js`, `rlportfoliobrief.js`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-behavior-occurrence.unit.mjs` | In Progress |

## Scope 1 - Bound The Evidence-Age Policy

**Status:** In Progress
**Depends On:** —
**Execution dependency:** `bubbles.test` (RED) -> `bubbles.implement` ->
`bubbles.test` (GREEN and regression) -> `bubbles.validate`.

### Implementation Files

#### Scope 01 Paths

- `rlportfolio.js`
- `rlportfoliobrief.js`
- `tests/portfolio-foundation.unit.mjs`
- `tests/portfolio-brief.functional.mjs`
- `tests/portfolio-behavior-occurrence.unit.mjs`

### Change Boundary

Allowed implementation files:

- `rlportfolio.js` for the named constant and behavior-policy predicate only.
- `tests/portfolio-foundation.unit.mjs` for focused policy boundary coverage.
- `rlportfoliobrief.js` for one `composeBrief()` delegation to
  `portfolio.validatePolicy()` immediately before the first
  `maximumEvidenceAgeDays` read.
- `tests/portfolio-brief.functional.mjs` for the exported-consumer boundary,
  refusal, overflow, and local-error-precedence regression.
- `tests/portfolio-behavior-occurrence.unit.mjs` as a test-only collateral
  regression path. Its allowed change is limited to pairing the existing
  BUG-004 `deriveInterestSignals()` shared-validation check with the uniquely
  following derive-loop statement, removing exactly that pair while preserving
  the loop opener, and retaining the new `composeBrief()` validation pair.
- This bug packet for owned workflow evidence.

Excluded surfaces:

- `portfolio-survival-allocation.config.json`. Its value remains `56`.
- The `deriveInterestSignals()` expiry expression.
- `rlportfoliobrief.js::deriveInterestSignals()` and every other shared-module
  behavior outside the single `composeBrief()` delegation.
- Both policy-derived Date expressions and existing brief local checks.
- Public HTML, tool registration, navigation, storage, and schema contracts.
- Product notes, README content, and other managed documentation.
- Parent Feature 008 artifacts and sibling bug packets.

Collateral cleanup remains excluded beyond the named mutation-anchor repair. A
required change outside this boundary must be routed before implementation.

### Consumer Impact Sweep

The repair changes only which policy values are accepted. It changes no public
name, arity, object field, URL, registry identity, or storage record.

| Consumer | Valid-policy effect | Invalid-policy effect |
| --- | --- | --- |
| Direct `validatePolicy()` callers | No change at or below the bound | Above-bound values return the existing config refusal |
| `deriveInterestSignals()` | No change for valid policy | Returns validation failure before Date arithmetic |
| `rlportfoliobrief.js::composeBrief()` | Existing local input, window, timestamp, cutoff, and valid-policy composition behavior remain unchanged | After local prerequisites pass, returns the shared validator failure unchanged before action-history cutoff formatting |
| `tests/portfolio-brief.functional.mjs` | Existing action-history cutoff assertions remain authoritative | Adds persistent RED/GREEN coverage for shared-policy delegation and no-throw behavior |
| `tests/portfolio-behavior-occurrence.unit.mjs` | Existing BUG-004 occurrence contract and expected outcome remain unchanged | Its mutation anchor removes only the `deriveInterestSignals()` validation pair, preserves the following loop, and leaves the `composeBrief()` validation pair present so the collateral regression remains unambiguous |
| Allocation page | Shipped 56-day config remains valid | No user-configurable path is added |
| Stored workspaces | No migration or rewrite | None |

### Gherkin Scenarios

```gherkin
Scenario: SCN-B006-BOUNDARY-ACCEPTED
  Given the behavior policy sets maximumEvidenceAgeDays to 100 * 365 + 25
  When validatePolicy checks the policy
  Then the policy is accepted
  And the committed 56-day policy remains accepted and unchanged
  And a non-finite value still returns the existing non-finite-policy refusal
  before semantic bound validation

Scenario: SCN-B006-ONE-OVER-REFUSED
  Given the behavior policy sets maximumEvidenceAgeDays to one day above the named maximum
  When validatePolicy checks the policy
  Then it returns P008-CONFIG with reason invalid-policy and field behavior
  And it does not clamp or echo the rejected value

Scenario: SCN-B006-OVERFLOW-REFUSED
  Given a valid workspace and an evidence-age window known to exceed the ECMAScript TimeClip range
  When deriveInterestSignals is called with that policy
  Then validation returns P008-CONFIG with reason invalid-policy and field behavior
  And no RangeError escapes

Scenario: SCN-B006-BRIEF-POLICY-VALIDATION
  Given composeBrief inputs that pass its existing local input, window, timestamp, and cutoff checks
  And a separate call has both an invalid local brief prerequisite and an invalid policy
  When composeBrief evaluates maximumEvidenceAgeDays values 36525, 36526, Infinity, and 100100000
  Then 36525 succeeds with the unchanged action-history cutoff expression
  And 36526 returns the exact shared P008-CONFIG invalid-policy behavior envelope
  And Infinity returns the existing shared non-finite-policy refusal with field policy.behavior.maximumEvidenceAgeDays
  And 100100000 returns the shared invalid-policy behavior envelope without a RangeError
  And the doubly invalid call returns the existing local brief error first
```

### Scenario Obligation Matrix

| Scenario | Behavior traits | Required proof and rows | Implementation owners | Test mechanism and negative control |
| --- | --- | --- | --- | --- |
| `SCN-B006-BOUNDARY-ACCEPTED` | `pure-calculation`, `static-metadata` | `TP-B006-001` proves returned validation values and the committed `56`; `TP-B006-004` proves page-level non-movement only. | `rlportfolio.js#validatePolicy`, `portfolio-survival-allocation.config.json` | `public-function` + `recorded-fixture` + `returned-value` + `not-applicable`; changing `36525` to `36526` must change acceptance to the exact refusal (`perturbed-input`, medium risk). |
| `SCN-B006-ONE-OVER-REFUSED` | `pure-calculation`, `degraded-state` | `TP-B006-000` records RED and `TP-B006-002` proves the exact non-default refusal after repair. | `rlportfolio.js#validatePolicy` | `public-function` + `synthetic-fixture` + `returned-value` + `not-applicable`; removing the upper-bound predicate must make `36526` accepted (`perturbed-input`, medium risk). |
| `SCN-B006-OVERFLOW-REFUSED` | `pure-calculation`, `degraded-state` | `TP-B006-000` records RED and `TP-B006-003` proves validate-first refusal without an escaped exception; `TP-B006-011` preserves an unambiguous collateral mutation anchor for the existing derivation validation pair. | `rlportfolio.js#validatePolicy`, `rlportfolio.js#deriveInterestSignals` | `public-function` + `synthetic-fixture` + `returned-value` + `not-applicable`; the fixture must first prove direct Date overflow, while removing the predicate must expose acceptance or `RangeError` (`perturbed-input`, medium risk). |
| `SCN-B006-BRIEF-POLICY-VALIDATION` | `pure-calculation`, `degraded-state`, `shared-consumer` | `TP-B006-009` records the consumer-specific RED; `TP-B006-010` proves valid-boundary composition, exact shared refusals, local-error precedence, and no escaped `RangeError`; `TP-B006-011` proves the collateral mutation removes only the derivation pair while preserving the new brief pair and derive loop; `TP-B006-005` remains the real Brief-route consumer-surface non-movement proof. | `rlportfoliobrief.js#composeBrief`, `rlportfolio.js#validatePolicy`, `portfolio-survival-allocation-lab.html#composeBrief` | `public-function` + `recorded-fixture` + `returned-value` + `not-applicable`; an isolated validator-delegation mutation must expose successful invalid composition or `RangeError` (`mutation`, high risk), while the route row proves only current-surface non-movement. |

### Implementation Plan

1. Preserve the delivered shared-validator source and focused foundation
  regression without further edits.
2. `bubbles.test` adds `SCN-B006-BRIEF-POLICY-VALIDATION` to
  `tests/portfolio-brief.functional.mjs`, using its existing action-history
  cutoff fixture and exact returned-envelope assertions.
3. `bubbles.test` runs the brief carrier before any brief source edit and
  records the expected RED behavior: `36526` succeeds, non-finite policy does
  not return the shared field path, or `100100000` throws `RangeError`.
4. `bubbles.implement` adds one direct `portfolio.validatePolicy(input.policy)`
  delegation after existing local prerequisite checks and immediately before
  `composeBrief()` first reads `maximumEvidenceAgeDays`.
5. `bubbles.implement` returns a failed shared result unchanged and does not
  catch Date errors, duplicate the ceiling, or translate the refusal.
6. `bubbles.test` proves the same brief carrier green, including local-error
  precedence, `36525`, `36526`, `Infinity`, and `100100000`.
7. `bubbles.test` runs a delegation negative control and restores the source
  before any further action.
8. `bubbles.test` reruns the existing focused foundation carrier, allocation
  page, Feature 008 browser regressions, and canonical repository selftest.
9. `bubbles.test` repairs only the BUG-004 mutation anchor in
  `tests/portfolio-behavior-occurrence.unit.mjs`, proves exactly one
  `deriveInterestSignals()` validation pair is removed while its loop opener
  and the `composeBrief()` pair remain, and records the focused carrier result.
10. `bubbles.validate` runs packet lint, traceability, scenario-contract, and
  transition checks.

### Browser Coverage Decision

The defect is a module policy-contract failure. The shipped policy is a static
same-origin asset, and the page offers no control that can set this value.

The unit and functional rows directly prove the fix. The E2E rows are honest
non-movement checks. They prove the still-valid 56-day policy loads in the real
page, but they are not represented as direct overflow-path coverage.

### Test Plan

| Plan ID | Test Type | Category | Live system | Persistent file | Scenario and planned test title | Required behavior | Command | State |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-B006-000 | Pre-fix RED regression | `unit` | No | `tests/portfolio-foundation.unit.mjs` | `SCN-B006-ONE-OVER-REFUSED`, `SCN-B006-OVERFLOW-REFUSED` -> newly added BUG-006 refusal tests | Before `rlportfolio.js` changes, the focused carrier exits non-zero because current source admits both finite above-bound inputs; this evidence is recorded before implementation. | `timeout 240 node --test tests/portfolio-foundation.unit.mjs` | Required RED run before implementation; not authored or run |
| TP-B006-001 | Unit regression | `unit` | No | `tests/portfolio-foundation.unit.mjs` | `SCN-B006-BOUNDARY-ACCEPTED` -> `BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary` | The named boundary and shipped `56` value validate, the committed config remains `56`, and non-finite input retains the existing refusal precedence. | `timeout 240 node --test tests/portfolio-foundation.unit.mjs` | Planned, not authored or run |
| TP-B006-002 | Unit adversarial regression | `unit` | No | `tests/portfolio-foundation.unit.mjs` | `SCN-B006-ONE-OVER-REFUSED` -> `BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary` | Boundary plus one returns the exact config refusal. The row fails if the predicate is absent. | `timeout 240 node --test tests/portfolio-foundation.unit.mjs` | Planned, not authored or run |
| TP-B006-003 | Functional regression | `functional` | No | `tests/portfolio-foundation.unit.mjs` | `SCN-B006-OVERFLOW-REFUSED` -> `BUG-006: an overflowing evidence window is refused before interest derivation` | A known overflowing value returns the exact config refusal without throwing. | `timeout 240 node --test tests/portfolio-foundation.unit.mjs` | Planned, not authored or run |
| TP-B006-004 | Regression E2E | `e2e-ui` | Yes | `tests/portfolio-survival-allocation.spec.mjs` | Allocation-page non-movement with the committed 56-day policy | The real page loads its policy and remains usable. This row is not direct overflow coverage. | `timeout 900 npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Existing carrier, re-execution required after implementation |
| TP-B006-005 | Broader Regression E2E | `e2e-ui` | Yes | Feature 008 Playwright carriers | Complete eight-file Feature 008 browser matrix | Existing user workflows remain green. | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Existing carriers, re-execution required after implementation |
| TP-B006-006 | Repository regression | `functional` | No | `scripts/selftest.mjs` | Registered repository checks | All current repository invariants remain green. | `timeout 1800 node scripts/selftest.mjs` | Existing check, re-execution required after implementation |
| TP-B006-007 | Packet guard battery | `artifact` | No | BUG-006 planning artifacts | Artifact shape, scenario traceability, derived obligations, declared test mechanisms, and fresh-context scope fit are valid. | `timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow && timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow && timeout 600 bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow && timeout 600 bash .github/bubbles/scripts/test-mechanism-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow --repo-root . && timeout 600 bash .github/bubbles/scripts/scope-context-fit-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow` | Required after planning changes and before certification |
| TP-B006-008 | Transition guard | `guard` | No | BUG-006 packet and execution evidence | The bugfix-fastlane completion contract is satisfied without planner-owned certification writes. | `timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow` | Required only after implementation, tests, evidence, and human acceptance are complete |
| TP-B006-009 | Pre-fix brief RED regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | `SCN-B006-BRIEF-POLICY-VALIDATION` -> `BUG-006: composeBrief validates shared evidence-age policy before Date formatting` | Before `rlportfoliobrief.js` changes, the persistent consumer test exits non-zero because invalid policy can compose successfully or throw instead of returning the shared envelope; local-error-precedence and `36525` assertions remain part of the same contract. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Required RED run before brief source implementation; not authored or run |
| TP-B006-010 | Post-fix brief functional GREEN | `functional` | No | `tests/portfolio-brief.functional.mjs` | `SCN-B006-BRIEF-POLICY-VALIDATION` -> `BUG-006: composeBrief validates shared evidence-age policy before Date formatting` | The unchanged persistent test passes: local errors retain precedence, `36525` succeeds, `36526` returns exact shared invalid-policy behavior, `Infinity` returns the existing non-finite field path, and `100100000` returns shared invalid-policy without `RangeError`. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Required after brief source implementation; not run |
| TP-B006-011 | Collateral mutation-anchor regression | `unit` | No | `tests/portfolio-behavior-occurrence.unit.mjs` | `SCN-B006-OVERFLOW-REFUSED`, `SCN-B006-BRIEF-POLICY-VALIDATION` -> `BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing` | The BUG-004 mutation anchor pairs the derivation validation check with the uniquely following derive-loop statement, removes exactly that pair, re-emits the loop opener, and proves the `composeBrief()` validation pair remains. The BUG-004 contract and expected outcome do not change. | `timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs` | Planned; bubbles.test must verify and record durable evidence |

### Test Plan To DoD Parity

| Test Plan row | Primary DoD item |
| --- | --- |
| TP-B006-000 | Pre-fix focused RED result is demonstrated before implementation |
| TP-B006-001 | `SCN-B006-BOUNDARY-ACCEPTED` holds |
| TP-B006-002 | `SCN-B006-ONE-OVER-REFUSED` holds |
| TP-B006-003 | `SCN-B006-OVERFLOW-REFUSED` holds |
| TP-B006-004 | Allocation-page non-movement regression passes |
| TP-B006-005 | Broader E2E regression suite passes |
| TP-B006-006 | Canonical repository selftest passes |
| TP-B006-007 | Packet guard battery passes |
| TP-B006-008 | Transition guard passes before validate-owned certification |
| TP-B006-009 | Pre-fix brief consumer RED result is demonstrated before the brief source edit |
| TP-B006-010 | `SCN-B006-BRIEF-POLICY-VALIDATION` holds through the post-fix functional carrier |
| TP-B006-011 | Collateral mutation anchor removes only the derivation pair and preserves the derive loop and brief pair |

### Definition of Done

#### Core Items

- [ ] The named `MAXIMUM_EVIDENCE_AGE_DAYS` constant is derived as
  `100 * 365 + 25`, documented as a conservative product horizon, and enforced
  only by the behavior-policy validator.
- [ ] Above-bound policy returns the exact existing
  `P008-CONFIG / invalid-policy / behavior` envelope before Date arithmetic.
- [ ] The committed 56-day config, expiry arithmetic for valid policies,
  evidence scoring, signal identity, schemas, and public interfaces are
  unchanged.
- [ ] `TP-B006-000` demonstrates the pre-fix RED state before any product
  source edit: the newly added one-over and huge-finite refusal assertions fail
  against current source. Evidence: `report.md#tp-b006-000`.
- [ ] `SCN-B006-BOUNDARY-ACCEPTED` holds through `TP-B006-001`: the named
  100-year boundary and the committed 56-day value both validate, the
  committed config remains `56`, and non-finite input retains its existing
  refusal ordering. Evidence: `report.md#tp-b006-001`.
- [ ] `SCN-B006-ONE-OVER-REFUSED` holds through `TP-B006-002`: one day above
  the named maximum returns `P008-CONFIG / invalid-policy / behavior`, does not
  echo the value, and does not clamp it. Evidence: `report.md#tp-b006-002`.
- [ ] `SCN-B006-OVERFLOW-REFUSED` holds through `TP-B006-003`: a known
  TimeClip-overflowing value returns the same config refusal and no `RangeError`
  escapes. Evidence: `report.md#tp-b006-003`.
- [ ] Allocation-page non-movement regression passes through `TP-B006-004` for
  the committed 56-day policy. This is honest page-level non-movement proof,
  not direct overflow-path evidence. Evidence: `report.md#tp-b006-004`.
- [ ] Broader E2E regression suite passes
  - `TP-B006-005` covers all eight Feature 008 browser carriers. Evidence:
    `report.md#tp-b006-005`.
- [ ] `TP-B006-006` canonical repository selftest passes. Evidence:
  `report.md#tp-b006-006`.
- [ ] `TP-B006-007` packet guard battery passes for artifact shape,
  traceability, scenario obligations, test mechanism, and scope context fit.
  Evidence: `report.md#tp-b006-007`.
- [ ] `TP-B006-008` transition guard passes only after implementation, test,
  evidence, and human-acceptance prerequisites are satisfied; certification
  remains validate-owned. Evidence: `report.md#tp-b006-008`.
- [ ] `TP-B006-009` demonstrates the pre-fix brief-consumer RED state before
  any `rlportfoliobrief.js` edit: the persistent regression exposes successful
  invalid-policy composition or escaped `RangeError`. Evidence:
  `report.md#tp-b006-009`.
- [ ] `SCN-B006-BRIEF-POLICY-VALIDATION` holds through `TP-B006-010`: existing
  local brief errors retain precedence, `36525` composes successfully, `36526`
  returns the exact shared invalid-policy behavior envelope, `Infinity`
  retains the shared non-finite field path, and `100100000` returns shared
  invalid-policy without `RangeError`. Evidence: `report.md#tp-b006-010`.
- [ ] `TP-B006-011` proves the test-only collateral mutation anchor removes
  exactly the `deriveInterestSignals()` shared-validation pair, preserves its
  uniquely following loop opener, and retains the `composeBrief()` validation
  pair without changing the BUG-004 contract or expected outcome. Evidence:
  `report.md#tp-b006-011`.
- [ ] Change Boundary is respected and zero excluded file families are changed.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero warnings, zero unresolved findings,
  exact changed-path containment, and no stale product documentation. Executable
  tests and guards are tracked individually above.

All items remain unchecked. This filing records no implementation, test, or
certification claim.
