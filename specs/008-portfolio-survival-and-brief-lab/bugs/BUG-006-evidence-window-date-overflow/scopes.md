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

1. `bubbles.test` adds the required boundary, one-over, overflow, refusal-shape,
  non-finite-precedence, and shipped-policy cases, then records the expected
  focused RED result against current source.
2. `bubbles.implement` adds the private named constant and one validation
  predicate without changing derivation or consumer surfaces.
3. `bubbles.test` reruns the focused carrier, allocation-page non-movement
  regression, broader Feature 008 regressions, and canonical repository
  selftest.
4. `bubbles.validate` runs packet checks and owns any certification or terminal
  transition.

### New Types And Signatures

- One private module constant: `MAXIMUM_EVIDENCE_AGE_DAYS`.
- No exported symbol, function signature, schema, route, or storage change.
- `validatePolicy()` retains its existing result envelope.

### Validation Checkpoints

1. The focused carrier must fail before source implementation because `36526`
  and a TimeClip-overflowing finite value are still admitted.
2. The exact boundary, shipped `56` value, refusal envelope, and non-finite
  refusal precedence must pass after implementation.
3. The TimeClip-overflow fixture must return the config refusal without
  throwing.
4. The allocation page, broader Feature 008 browser matrix, repository
  selftest, and packet guards must remain green before certification.

| Scope | Outcome | Planned source and test paths | Status |
| --- | --- | --- | --- |
| 1 | Reject unsafe evidence-age policy before Date derivation | `rlportfolio.js`, `tests/portfolio-foundation.unit.mjs` | In Progress |

## Scope 1 - Bound The Evidence-Age Policy

**Status:** In Progress
**Depends On:** —
**Execution dependency:** `bubbles.test` (RED) -> `bubbles.implement` ->
`bubbles.test` (GREEN and regression) -> `bubbles.validate`.

### Change Boundary

Allowed implementation files:

- `rlportfolio.js` for the named constant and behavior-policy predicate only.
- `tests/portfolio-foundation.unit.mjs` for focused policy boundary coverage.
- This bug packet for owned workflow evidence.

Excluded surfaces:

- `portfolio-survival-allocation.config.json`. Its value remains `56`.
- The `deriveInterestSignals()` expiry expression.
- `rlportfoliobrief.js` and every other shared module.
- Public HTML, tool registration, navigation, storage, and schema contracts.
- Product notes, README content, and other managed documentation.
- Parent Feature 008 artifacts and sibling bug packets.

Collateral cleanup is excluded. A required change outside this boundary must
be routed before implementation.

### Consumer Impact Sweep

The repair changes only which policy values are accepted. It changes no public
name, arity, object field, URL, registry identity, or storage record.

| Consumer | Valid-policy effect | Invalid-policy effect |
| --- | --- | --- |
| Direct `validatePolicy()` callers | No change at or below the bound | Above-bound values return the existing config refusal |
| `deriveInterestSignals()` | No change for valid policy | Returns validation failure before Date arithmetic |
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
```

### Scenario Obligation Matrix

| Scenario | Behavior traits | Required proof and rows | Implementation owners | Test mechanism and negative control |
| --- | --- | --- | --- | --- |
| `SCN-B006-BOUNDARY-ACCEPTED` | `pure-calculation`, `static-metadata` | `TP-B006-001` proves returned validation values and the committed `56`; `TP-B006-004` proves page-level non-movement only. | `rlportfolio.js#validatePolicy`, `portfolio-survival-allocation.config.json` | `public-function` + `recorded-fixture` + `returned-value` + `not-applicable`; changing `36525` to `36526` must change acceptance to the exact refusal (`perturbed-input`, medium risk). |
| `SCN-B006-ONE-OVER-REFUSED` | `pure-calculation`, `degraded-state` | `TP-B006-000` records RED and `TP-B006-002` proves the exact non-default refusal after repair. | `rlportfolio.js#validatePolicy` | `public-function` + `synthetic-fixture` + `returned-value` + `not-applicable`; removing the upper-bound predicate must make `36526` accepted (`perturbed-input`, medium risk). |
| `SCN-B006-OVERFLOW-REFUSED` | `pure-calculation`, `degraded-state` | `TP-B006-000` records RED and `TP-B006-003` proves validate-first refusal without an escaped exception. | `rlportfolio.js#validatePolicy`, `rlportfolio.js#deriveInterestSignals` | `public-function` + `synthetic-fixture` + `returned-value` + `not-applicable`; the fixture must first prove direct Date overflow, while removing the predicate must expose acceptance or `RangeError` (`perturbed-input`, medium risk). |

### Implementation Plan

1. `bubbles.test` extends `tests/portfolio-foundation.unit.mjs` with all three
  scenarios, exact envelope assertions, non-finite-precedence coverage, and a
  direct proof that the overflow fixture exceeds TimeClip.
2. `bubbles.test` runs the focused carrier before any source edit and records
  the expected RED result for both newly rejected finite input classes.
3. `bubbles.implement` defines `MAXIMUM_EVIDENCE_AGE_DAYS` as
   `100 * 365 + 25` near the policy constants.
4. `bubbles.implement` adds one above-bound predicate to the behavior-policy
   validation branch.
5. `bubbles.test` proves the focused carrier green and scans for skipped or
   weakened assertions.
6. `bubbles.test` runs the allocation-page and Feature 008 browser regressions.
7. `bubbles.test` runs the canonical repository selftest.
8. `bubbles.validate` runs packet lint, traceability, scenario-contract, and
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
- [ ] Change Boundary is respected and zero excluded file families are changed.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero warnings, zero unresolved findings,
  exact changed-path containment, and no stale product documentation. Executable
  tests and guards are tracked individually above.

All items remain unchecked. This filing records no implementation, test, or
certification claim.
