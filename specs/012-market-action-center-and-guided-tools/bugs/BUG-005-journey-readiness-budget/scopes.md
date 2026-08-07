# Scopes: BUG-005 Journey Readiness Budget

## Scope Inventory

| Scope | Outcome | Status |
|---|---|---|
| SCOPE-01 | Make the global Journey regression deterministic under complete-suite load without weakening readiness or registry assertions | In Progress |

## SCOPE-01 - Calibrate The Global Journey Mount Budget

- **Status:** In Progress
- **Depends On:** none
- **Owner:** `bubbles.implement`, followed by independent `bubbles.test`
- **Change class:** test-harness-only bug fix

### Gherkin Scenario

```gherkin
Scenario: SCN-B005-001 Global Journey readiness survives complete-suite load
  Given the full browser suite runs Feature 012 Journey cases under shared host load with retries disabled
  When the Market Action Center test opens Journey and waits for the shipped visible panel, ready mount state, and __rljourneyController
  Then the unchanged readiness assertions complete within a measured suite-safe budget
  And the Center lists the complete tool registry exactly once
  And market-brief remains the first Journey tool
```

### Implementation Plan

1. Capture a valid pre-fix RED from the complete-suite carrier with the existing
   15-second Center wait; do not manufacture RED by changing production bytes.
2. Parameterize `mountJourneyOnPage` with the existing 15-second value as its
   default.
3. Pass a finite, measured, Center-only wait at the target call site. Keep its
  containing target-only test budget strictly larger, using `test.slow()` only
  if required for deterministic assertion margin. Do not exceed a 30-second
  inner wait without stopping for a production/performance review.
4. Prove the wait predicate and all post-mount assertions are unchanged.
5. Run the focused, same-file, four-worker full-suite, serial full-suite,
   selftest, and regression-quality rows below with retries disabled.

### Change Boundary

**Allowed:** `tests/journey.spec.mjs` only.

**Forbidden:** production HTML/JavaScript/JSON, Playwright configuration,
retries, request interception, fixed sleeps, Feature 004 artifacts, parent
Feature 012 artifacts, unrelated tests, dependencies, and certification fields.

### Test Plan

| ID | Test Type | Category | Scenario | File / Location | Exact behavior | Command | Live System |
|---|---|---|---|---|---|---|---|
| TP-B005-00 | Pre-fix Regression E2E | `e2e-ui` | SCN-B005-001 | complete browser suite | Existing 15-second Center wait fails at the shipped readiness predicate under the preserved full-suite workload | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0` | Yes |
| TP-B005-01 | Focused Regression E2E | `e2e-ui` | SCN-B005-001 | `tests/journey.spec.mjs` | Exact target reaches the shipped ready/controller state and proves complete registry order | `timeout 180 npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "the Market Action Center remains the global journey surface" --reporter=list --workers=1 --retries=0` | Yes |
| TP-B005-02 | Same-file Regression E2E | `e2e-ui` | SCN-B005-001 | `tests/journey.spec.mjs` | All same-file predecessors plus target pass serially; no cumulative file-local state leak | `timeout 300 npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0` | Yes |
| TP-B005-03 | Adversarial Full-suite Regression E2E | `e2e-ui` | SCN-B005-001 | all committed browser specs | Four-worker complete suite passes with retries disabled and 280 expected identities retained | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0` | Yes |
| TP-B005-04 | Serial Full-suite Regression E2E | `e2e-ui` | SCN-B005-001 | all committed browser specs | Serial complete suite passes with retries disabled and no Journey timeout | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0` | Yes |
| TP-B005-05 | Repository regression | `functional` | SCN-B005-001 | `scripts/selftest.mjs` | Build-free project selftest preserves its current registered checks | `timeout 1200 node scripts/selftest.mjs` | No |
| TP-B005-06 | Regression quality | `functional` | SCN-B005-001 | `tests/journey.spec.mjs` | No interception, retry, bailout, optional assertion, or weakened behavior contract | `timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/journey.spec.mjs` | No |

### Test Applicability

| Category | Applicability |
|---|---|
| unit | Not applicable; no production or pure helper logic changes |
| functional | Required for repository baseline and regression-quality checks |
| integration | Not applicable; no component or service boundary changes |
| ui-unit | Not applicable; this is a real-page Playwright timing defect |
| e2e-api | Not applicable; no API contract changes |
| e2e-ui | Required for focused, same-file, and complete-suite behavior |
| stress | Not separately applicable; TP-B005-03 is the owning concurrent browser workload |
| load | Not applicable; no product throughput or latency contract changes |

### Definition of Done

#### Core Outcomes

- [ ] Root cause is independently confirmed: the old Center budget fails only
  in complete-suite context while the unchanged shipped predicate passes focused
  and after all same-file predecessors.
  > **Uncertainty Declaration**
  > **What was attempted:** focused and complete same-file executions plus review of the preserved top-level full-suite failure.
  > **What was observed:** same-file 9/9 green; the top-level complete suite retains the only timeout.
  > **Why this is uncertain:** the filing agent did not re-execute the 277-test failing carrier.
  > **What would resolve this:** TP-B005-00 must produce the persistent pre-fix RED under the implementation owner.
- [ ] The fix changes only the helper timeout parameter and the global Center
  call site; every readiness and registry assertion is preserved.
  > **Uncertainty Declaration**
  > **What was attempted:** no implementation was authorized in this invocation.
  > **What was observed:** the proposed two-location mutation boundary is documented in design.md.
  > **Why this is uncertain:** no source mutation exists yet.
  > **What would resolve this:** implementation diff review must show only the allowed timeout flow.
- [ ] The adversarial contract remains effective: hidden, unavailable,
  controller-absent, incomplete-registry, duplicate-registry, or wrong-first-tool
  states still fail without retry or bailout.
  > **Uncertainty Declaration**
  > **What was attempted:** current assertions were read; no adversarial mutation was executed.
  > **What was observed:** all substantive conditions remain explicit in the current test.
  > **Why this is uncertain:** source inspection is not executed regression evidence.
  > **What would resolve this:** the implementation/test owners must run TP-B005-06 and a pre-fix budget replay without weakening the predicate.

#### Test Evidence - Exact Parity With Seven Test Plan Rows

- [ ] Pre-fix regression test fails under TP-B005-00 with the existing
  15-second Center budget and the failure reaches the readiness predicate.
- [ ] TP-B005-01 focused target passes with one worker and retries disabled.
- [ ] TP-B005-02 complete same-file Journey carrier passes 9/9 serially.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  pass in TP-B005-03, including the adversarial complete-suite workload.
- [ ] Broader E2E regression suite passes serially in TP-B005-04 with no counted
  failure, skip, retry, or unexpected pass.
- [ ] TP-B005-05 repository selftest passes with its expected registered count
  and zero failures.
- [ ] TP-B005-06 proves regression tests contain no interception or silent-pass
  bailout patterns.

All seven test items remain unchecked because no fix or post-fix validation was
performed in this diagnostic invocation.

#### Build Quality Gate

- [ ] Changed JavaScript parses; the test-only boundary is respected; no Feature
  004 or parent Feature 012 artifact changes; artifact lint, traceability, and
  validate-owned transition checks pass; documentation and evidence carry honest
  claim provenance.
  > **Uncertainty Declaration**
  > **What was attempted:** focused artifact lint, JSON/hash integrity, editor diagnostics, and target-test diff checks were executed after packet creation.
  > **What was observed:** artifact lint passed; both JSON files parse; the scenario hash matches; editor diagnostics are empty; both diagnosed test files have zero diff.
  > **Why this is uncertain:** no implementation exists, so JavaScript parse, traceability, post-fix browser profiles, and validate-owned transition checks cannot yet establish completion.
  > **What would resolve this:** the implementation and test owners must execute all seven Test Plan rows and the remaining governance checks after the bounded mutation.
