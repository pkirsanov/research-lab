# Scopes: BUG-007 Shared-Shell Suite Budget

Links: [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) |
[uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) |
[test-plan.json](test-plan.json)

## Planning Adoption

`bubbles.plan` adopts SCOPE-01 without technical amendment. The two scenarios,
exact three-edit boundary, thirteen-row Test Plan, and test-related DoD parity
remain authoritative. Implementation may begin only through
`bubbles.implement`; status and certification remain `in_progress` until the
required execution, independent testing, audit, and validation complete.

## Execution Outline

### Phase Order

1. **SCOPE-01 - Calibrate shared-shell suite budgets.** Apply the two
  helper-local timeout replacements and the one target-local slow annotation,
  then execute every focused, same-file, complete-suite, regression, syntax,
  diff, and packet-integrity carrier.

### New Types and Signatures

- No production type, API, schema, route, configuration key, dependency, or
  reusable helper is introduced.
- `openAndAwaitOwnerEvidence` keeps its existing signature and predicates; only
  its two single-use readiness margins change from 30 seconds to 60 seconds.
- The named BUG-001 options-flow target keeps its existing title and body; its
  first statement becomes `test.slow();`.

### Validation Checkpoints

1. After the helper-local replacements, TP-B007-01 and TP-B007-02 prove the
  focused owner-parity sweep and its complete owning file remain decisive.
2. After the target-local annotation, TP-B007-03 and TP-B007-04 prove the
  focused options flow and its complete owning file remain decisive.
3. TP-B007-05 and TP-B007-06 are the mandatory adversarial and serial suite
  gates; both must retain all 280 identities across 33 files with retries 0.
4. TP-B007-07 through TP-B007-12 protect repository behavior, regression
  quality, syntax, the exact three-edit boundary, and packet integrity before
  audit or certification routing.

## Scope Inventory

| Scope | Outcome | Status |
|---|---|---|
| SCOPE-01 | Calibrate only the two remaining shared-shell suite budgets | In Progress |

## SCOPE-01 - Calibrate Shared-Shell Suite Budgets

- **Status:** In Progress
- **Depends On:** none
- **Next owner:** `bubbles.implement`, followed by independent `bubbles.test`
- **Change class:** test-harness-only bug fix

### Gherkin Scenarios

```gherkin
Scenario: SCN-B007-001 Owner-parity sweep survives shared-shell startup contention
  Given the complete 280-identity system-Chrome browser suite runs with four workers and retries disabled under shared host load
  When the TP-15-04 sweep opens every wired ordinary tool and awaits the synchronous shared shell plus owner-provider registration
  Then finite helper-local readiness waits tolerate delayed script start while all 19-tool owner-parity and native-demotion assertions remain unchanged

Scenario: SCN-B007-002 Options-flow startup ordering survives shared suite contention
  Given the complete 280-identity system-Chrome browser suite runs with four workers and retries disabled under shared host load
  When the BUG-001 options-flow regression observes the first delta start and all 12 distinct option-delta requests
  Then a finite target-local containing budget accommodates suite contention while every shell-ordering panel tab navigation and delta-count assertion remains unchanged
```

### Implementation Plan

1. Preserve the supplied 275/2 complete-suite RED and both isolated GREEN
   discriminators as pre-fix evidence.
2. Change only the two `openAndAwaitOwnerEvidence` readiness waits from
   `30000` to `60000`.
3. Add `test.slow();` as the first statement of only the named BUG-001 target.
4. Keep all other deadlines, selectors, predicates, actions, and assertions
   byte-identical.
5. Prove the two-file diff contains two replacements and one insertion only.
6. Execute all thirteen Test Plan rows.

### Change Boundary

**Allowed after owner adoption:**

- `tests/simple-production-wiring.spec.mjs`: two readiness timeout literals.
- `tests/tool-experience.spec.mjs`: one target-local `test.slow()` statement.

**Forbidden:** production, global configuration, dependencies, retries, sleeps,
interception, catches, bailout returns, optional assertions, forced actions,
unrelated waits, BUG-005, BUG-006, Feature 004, BUG-002, parent Feature 012,
certification fields, and concurrent dirty work.

### Test Plan

| ID | Test Type | Category | Scenario | File / Location | Exact behavior | Command | Live System |
|---|---|---|---|---|---|---|---|
| TP-B007-01 | Focused regression E2E | `e2e-ui` | SCN-B007-001 | `tests/simple-production-wiring.spec.mjs` | Exact 19-tool owner-parity sweep passes with every assertion intact | `timeout 1200 npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact" --reporter=list --workers=1 --retries=0` | Yes |
| TP-B007-02 | Same-file regression E2E | `e2e-ui` | SCN-B007-001 | `tests/simple-production-wiring.spec.mjs` | Every test in the owning file passes serially | `timeout 1800 npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0` | Yes |
| TP-B007-03 | Focused regression E2E | `e2e-ui` | SCN-B007-002 | `tests/tool-experience.spec.mjs` | Exact BUG-001 ordering target passes all 12 delta and shell assertions | `timeout 180 npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list --workers=1 --retries=0` | Yes |
| TP-B007-04 | Same-file regression E2E | `e2e-ui` | SCN-B007-002 | `tests/tool-experience.spec.mjs` | Every test in the owning file passes serially | `timeout 600 npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0` | Yes |
| TP-B007-00 | Pre-fix adversarial E2E | `e2e-ui` | SCN-B007-001, SCN-B007-002 | `tests/simple-production-wiring.spec.mjs`, `tests/tool-experience.spec.mjs` within the complete browser suite | Preserved four-worker carrier reports 277 identities, 275 passed, and only the two named budget failures | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0` | Yes |
| TP-B007-05 | Adversarial complete-suite E2E | `e2e-ui` | SCN-B007-001, SCN-B007-002 | all committed browser specs | Four-worker suite passes all 280 identities across 33 files with zero counted failures | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0` | Yes |
| TP-B007-06 | Serial complete-suite E2E | `e2e-ui` | SCN-B007-001, SCN-B007-002 | all committed browser specs | Serial suite passes all 280 identities across 33 files with zero counted failures | `timeout 3600 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0` | Yes |
| TP-B007-07 | Repository regression | `functional` | SCN-B007-001, SCN-B007-002 | `scripts/selftest.mjs` | Build-free repository selftest passes with zero failures | `timeout 1200 node scripts/selftest.mjs` | No |
| TP-B007-08 | Regression quality | `functional` | SCN-B007-001 | `tests/simple-production-wiring.spec.mjs` | The sweep keeps adversarial assertions and has no bailout or interception violation | `timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/simple-production-wiring.spec.mjs` | No |
| TP-B007-09 | Regression quality | `functional` | SCN-B007-002 | `tests/tool-experience.spec.mjs` | The options target keeps ordering assertions and has no bailout or interception violation | `timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/tool-experience.spec.mjs` | No |
| TP-B007-10 | JavaScript syntax | `functional` | SCN-B007-001, SCN-B007-002 | both target test files | Both modified modules parse | `timeout 30 node --check tests/simple-production-wiring.spec.mjs && timeout 30 node --check tests/tool-experience.spec.mjs` | No |
| TP-B007-11 | Exact mutation boundary | `functional` | SCN-B007-001, SCN-B007-002 | both target tests and Playwright config | Diff is whitespace-clean and contains only two `30000` to `60000` replacements plus one `test.slow()` insertion | `git diff --check -- tests/simple-production-wiring.spec.mjs tests/tool-experience.spec.mjs playwright.config.mjs && git --no-pager diff -- tests/simple-production-wiring.spec.mjs tests/tool-experience.spec.mjs playwright.config.mjs` | No |
| TP-B007-12 | Packet lint and integrity | `functional` | SCN-B007-001, SCN-B007-002 | BUG-007 packet and machine plan | All nine artifacts, state mirror, workflow mode, scenario hashes, linked tests, and 13-row Markdown/JSON DoD parity remain valid | `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget && timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget --all-scopes` | No |

### Test Applicability

| Category | Applicability |
|---|---|
| unit | Not applicable because no production or pure helper logic changes |
| functional | Required for selftest, quality, syntax, diff, and packet checks |
| integration | Not applicable because no service boundary changes |
| ui-unit | Not applicable because these are real-page browser regressions |
| e2e-api | Not applicable because no API behavior changes |
| e2e-ui | Required for focused, same-file, and both complete-suite profiles |
| stress | TP-B007-05 is the owning concurrent browser workload |
| load | Not applicable because no product throughput contract changes |

### Definition of Done

#### Core Outcomes

- [ ] The implementation changes exactly two timeout literals and adds exactly
  one target-local `test.slow()` statement.
  > **Uncertainty Declaration**
  > **What was attempted:** No test or product mutation was authorized in this invocation.
  > **What was observed:** Both target files and Playwright configuration were clean before packet creation.
  > **Why this is uncertain:** The proposed source mutation does not exist.
  > **What would resolve this:** TP-B007-11 must pass after implementation.
- [ ] Every existing assertion and all protected deadlines remain unchanged.
  > **Uncertainty Declaration**
  > **What was attempted:** The exact current controlling regions were inspected.
  > **What was observed:** The proposal changes no predicate or assertion.
  > **Why this is uncertain:** Source inspection is not post-fix execution evidence.
  > **What would resolve this:** TP-B007-01 through TP-B007-11 must pass.

#### Test Evidence - Exact Parity With Thirteen Test Plan Rows

- [ ] TP-B007-00 preserves the supplied four-worker 275/2 pre-fix RED.
- [ ] SCN-B007-001 / TP-B007-01 focused TP-15-04 owner-parity sweep survives shared-shell startup contention and passes 1/1.
- [ ] TP-B007-02 complete simple-production-wiring file passes serially.
- [ ] SCN-B007-002 / TP-B007-03 focused BUG-001 options-flow startup ordering survives shared-suite contention and passes 1/1.
- [ ] TP-B007-04 complete tool-experience file passes serially.
- [ ] TP-B007-05 four-worker complete suite passes 280/280 across 33 files.
- [ ] TP-B007-06 serial complete suite passes 280/280 across 33 files.
- [ ] TP-B007-07 repository selftest passes with zero failures.
- [ ] TP-B007-08 simple-production bugfix regression guard passes.
- [ ] TP-B007-09 tool-experience bugfix regression guard passes.
- [ ] TP-B007-10 both JavaScript modules parse.
- [ ] TP-B007-11 exact mutation-boundary diff passes.
- [ ] TP-B007-12 packet artifact lint and integrity checks pass.

All thirteen test items remain unchecked. No implementation or post-fix test
execution occurred in this packet-only invocation.

#### Build Quality Gate

- [ ] Every declared check passes with zero warnings, zero retries, and no
  mutation outside the authorized two-file boundary. Documentation and evidence
  retain honest claim provenance.
  > **Uncertainty Declaration**
  > **What was attempted:** The initial packet boundary and dirty-tree baseline were recorded.
  > **What was observed:** This invocation adds only the BUG-007 directory.
  > **Why this is uncertain:** Implementation, browser acceptance, audit, and certification have not occurred.
  > **What would resolve this:** All Test Plan rows plus audit and validate-owned transition checks must pass.
