# BUG-006 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.design`

No source or test change is part of this packet filing. No product test result
is claimed.

## Execution Outline

### Phase Order

1. `bubbles.design` reviews and adopts the named product bound and exact refusal
   contract.
2. `bubbles.plan` owns final Gherkin, Test Plan, and DoD wording.
3. `bubbles.test` adds the boundary and one-over cases first, then records the
   expected red result against current source.
4. `bubbles.implement` adds the named constant and validation predicate.
5. `bubbles.test` reruns focused and broader regressions.
6. `bubbles.validate` owns certification and any terminal transition.

### New Types And Signatures

- One private module constant: `MAXIMUM_EVIDENCE_AGE_DAYS`.
- No exported symbol, function signature, schema, route, or storage change.
- `validatePolicy()` retains its existing result envelope.

### Validation Checkpoints

1. The one-over test must fail before source implementation.
2. The exact boundary and shipped value must pass after implementation.
3. The TimeClip-overflow fixture must return the config refusal without
   throwing.
4. Existing Feature 008 browser behavior and the repository selftest must
   remain green.

| Scope | Outcome | Planned source and test paths | Status |
| --- | --- | --- | --- |
| 1 | Reject unsafe evidence-age policy before Date derivation | `rlportfolio.js`, `tests/portfolio-foundation.unit.mjs` | Not Started |

## Scope 1 - Bound The Evidence-Age Policy

**Status:** Not Started
**Depends On:** `bubbles.design` approval of `design.md`.
**Execution dependency:** `bubbles.design` -> `bubbles.plan` -> `bubbles.test`
-> `bubbles.implement` -> `bubbles.test` -> `bubbles.validate`.

### Change Boundary

Allowed implementation files:

- `rlportfolio.js` for the named constant and behavior-policy predicate only.
- `tests/portfolio-foundation.unit.mjs` for focused policy boundary coverage.
- `notes/portfolio-survival-allocation-lab.md` only if its existing carrier
  inventory requires a row for the new test title.
- This bug packet for owned workflow evidence.

Excluded surfaces:

- `portfolio-survival-allocation.config.json`. Its value remains `56`.
- The `deriveInterestSignals()` expiry expression.
- `rlportfoliobrief.js` and every other shared module.
- Public HTML, tool registration, navigation, storage, and schema contracts.
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

### Implementation Plan

1. `bubbles.test` extends `tests/portfolio-foundation.unit.mjs` with all three
   scenarios and records the current one-over failure before source changes.
2. `bubbles.implement` defines `MAXIMUM_EVIDENCE_AGE_DAYS` as
   `100 * 365 + 25` near the policy constants.
3. `bubbles.implement` adds one above-bound predicate to the behavior-policy
   validation branch.
4. `bubbles.test` proves the focused carrier green and scans for skipped or
   weakened assertions.
5. `bubbles.test` runs the allocation-page and Feature 008 browser regressions.
6. `bubbles.test` runs the canonical repository selftest.
7. `bubbles.validate` runs packet lint, traceability, and transition checks.

### Browser Coverage Decision

The defect is a module policy-contract failure. The shipped policy is a static
same-origin asset, and the page offers no control that can set this value.

The unit and functional rows directly prove the fix. The E2E rows are honest
non-movement checks. They prove the still-valid 56-day policy loads in the real
page, but they are not represented as direct overflow-path coverage.

### Test Plan

| Plan ID | Test Type | Category | Live system | Persistent file | Scenario and planned test title | Required behavior | Command | State |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-B006-001 | Unit regression | `unit` | No | `tests/portfolio-foundation.unit.mjs` | `SCN-B006-BOUNDARY-ACCEPTED` -> `BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary` | The named boundary and shipped value validate. | `timeout 240 node --test tests/portfolio-foundation.unit.mjs` | Planned, not authored or run |
| TP-B006-002 | Unit adversarial regression | `unit` | No | `tests/portfolio-foundation.unit.mjs` | `SCN-B006-ONE-OVER-REFUSED` -> `BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary` | Boundary plus one returns the exact config refusal. The row fails if the predicate is absent. | `timeout 240 node --test tests/portfolio-foundation.unit.mjs` | Planned, not authored or run |
| TP-B006-003 | Functional regression | `functional` | No | `tests/portfolio-foundation.unit.mjs` | `SCN-B006-OVERFLOW-REFUSED` -> `BUG-006: an overflowing evidence window is refused before interest derivation` | A known overflowing value returns the exact config refusal without throwing. | `timeout 240 node --test tests/portfolio-foundation.unit.mjs` | Planned, not authored or run |
| TP-B006-004 | Regression E2E | `e2e-ui` | Yes | `tests/portfolio-survival-allocation.spec.mjs` | Allocation-page non-movement with the committed 56-day policy | The real page loads its policy and remains usable. This row is not direct overflow coverage. | `timeout 900 npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Existing carrier, re-execution required after implementation |
| TP-B006-005 | Broader Regression E2E | `e2e-ui` | Yes | Feature 008 Playwright carriers | Complete eight-file Feature 008 browser matrix | Existing user workflows remain green. | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Existing carriers, re-execution required after implementation |
| TP-B006-006 | Repository regression | `functional` | No | `scripts/selftest.mjs` | Registered repository checks | All current repository invariants remain green. | `timeout 1800 node scripts/selftest.mjs` | Existing check, re-execution required after implementation |

### Test Plan To DoD Parity

| Test Plan row | Primary DoD item |
| --- | --- |
| TP-B006-001 | `SCN-B006-BOUNDARY-ACCEPTED` holds |
| TP-B006-002 | `SCN-B006-ONE-OVER-REFUSED` holds |
| TP-B006-003 | `SCN-B006-OVERFLOW-REFUSED` holds |
| TP-B006-004 | Scenario-specific E2E regression tests for every changed behavior |
| TP-B006-005 | Broader E2E regression suite passes |
| TP-B006-006 | Canonical repository selftest passes |

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
- [ ] `SCN-B006-BOUNDARY-ACCEPTED` holds through `TP-B006-001`: the named
  100-year boundary and the committed 56-day value both validate. Evidence:
  `report.md#tp-b006-001`.
- [ ] `SCN-B006-ONE-OVER-REFUSED` holds through `TP-B006-002`: one day above
  the named maximum returns `P008-CONFIG / invalid-policy / behavior`, does not
  echo the value, and does not clamp it. Evidence: `report.md#tp-b006-002`.
- [ ] `SCN-B006-OVERFLOW-REFUSED` holds through `TP-B006-003`: a known
  TimeClip-overflowing value returns the same config refusal and no `RangeError`
  escapes. Evidence: `report.md#tp-b006-003`.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - `TP-B006-004` records the allocation-page non-movement boundary honestly.
    It is not direct overflow-path evidence. Evidence: `report.md#tp-b006-004`.
- [ ] Broader E2E regression suite passes
  - `TP-B006-005` covers all eight Feature 008 browser carriers. Evidence:
    `report.md#tp-b006-005`.
- [ ] `TP-B006-006` canonical repository selftest passes. Evidence:
  `report.md#tp-b006-006`.
- [ ] Change Boundary is respected and zero excluded file families are changed.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero warnings and zero deferrals. Focused
  tests, browser regressions, repository selftest, packet artifact lint,
  traceability, and validate-owned certification are clean.

All items remain unchecked. This filing records no implementation, test, or
certification claim.
