# Scopes: BUG-006 Contextual Tooltip Suite Budget

## Scope Inventory

| Scope | Outcome | Status |
|---|---|---|
| SCOPE-01 | Give only the mobile contextual-disclosure regression finite complete-suite margin without weakening behavior | In Progress |

## SCOPE-01 - Calibrate The Mobile Disclosure Outer Budget

- **Status:** In Progress
- **Depends On:** none
- **Owner:** `bubbles.implement`, followed by independent `bubbles.test`
- **Change class:** test-harness-only bug fix

### Gherkin Scenario

```gherkin
Scenario: SCN-B006-001 Mobile contextual disclosure survives complete-suite contention
  Given the complete 280-identity system-Chrome browser suite runs with four workers and retries disabled under shared host load
  When the mobile contextual disclosure regression performs both real touch-open close paths, focus restoration, and the no-canvas same-data fallback
  Then the target-local finite outer budget accommodates suite contention
  And every interaction, geometry, actionability, fallback, and failure-path assertion remains unchanged
```

### Implementation Plan

1. Preserve the inherited four-worker complete-suite RED and the focused and
   same-file GREEN discriminators; do not manufacture a product failure.
2. Add `test.slow()` as the first statement in only the named mobile target.
3. Keep every existing target operation and assertion byte-identical after that
   insertion, including the real locator close click.
4. Prove the target-test diff matches the one-statement design and that
   `playwright.config.mjs` remains unchanged.
5. Execute all ten Test Plan rows below. Every browser command uses retries 0.

### Change Boundary

**Allowed after packet creation:** one target-local outer-budget statement in
`tests/contextual-tooltip.spec.mjs`.

**Forbidden:** global configuration, retries, fixed sleeps, force clicks,
programmatic click dispatch, direct DOM close calls, interception, bailout
returns, optional assertions, product code, dependencies, unrelated tests,
BUG-005, Feature 004, BUG-002, parent Feature 012 artifacts, and certification
fields.

### Test Plan

| ID | Test Type | Category | Scenario | File / Location | Exact behavior | Command | Live System |
|---|---|---|---|---|---|---|---|
| TP-B006-00 | Pre-fix adversarial E2E | `e2e-ui` | SCN-B006-001 | complete browser suite | Existing default outer budget reaches the second real close path and times out under the preserved four-worker workload | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0` | Yes |
| TP-B006-01 | Focused regression E2E | `e2e-ui` | SCN-B006-001 | `tests/contextual-tooltip.spec.mjs` | Exact mobile target preserves every interaction and passes alone | `timeout 180 npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas" --reporter=list --workers=1 --retries=0` | Yes |
| TP-B006-02 | Same-file regression E2E | `e2e-ui` | SCN-B006-001 | `tests/contextual-tooltip.spec.mjs` | All three contextual tests pass serially, including malformed-context failure behavior | `timeout 300 npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0` | Yes |
| TP-B006-03 | Adversarial full-suite E2E | `e2e-ui` | SCN-B006-001 | all committed browser specs | Four-worker suite passes 280 identities across the unchanged 33-file path set with zero counted failures | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0` | Yes |
| TP-B006-04 | Serial full-suite E2E | `e2e-ui` | SCN-B006-001 | all committed browser specs | Serial complete suite passes every identity with zero counted failures | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0` | Yes |
| TP-B006-05 | Repository regression | `functional` | SCN-B006-001 | `scripts/selftest.mjs` | Build-free project selftest preserves its registered checks | `timeout 1200 node scripts/selftest.mjs` | No |
| TP-B006-06 | Regression quality | `functional` | SCN-B006-001 | `tests/contextual-tooltip.spec.mjs` | Adversarial and failure-path coverage remains present with no bailout or interception | `timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/contextual-tooltip.spec.mjs` | No |
| TP-B006-07 | JavaScript syntax | `functional` | SCN-B006-001 | `tests/contextual-tooltip.spec.mjs` | The modified test module parses | `timeout 30 node --check tests/contextual-tooltip.spec.mjs` | No |
| TP-B006-08 | Exact mutation boundary | `functional` | SCN-B006-001 | target test and Playwright config | Diff is whitespace-clean, config is unchanged, and the test equals HEAD plus only the one authorized `test.slow()` statement | `git diff --check -- tests/contextual-tooltip.spec.mjs playwright.config.mjs && git --no-pager diff -- tests/contextual-tooltip.spec.mjs playwright.config.mjs` | No |
| TP-B006-09 | Packet integrity | `functional` | SCN-B006-001 | BUG-006 packet | Artifact lint passes and all eight artifacts, state mirror, mode, and scenario hash are valid | `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget` | No |

### Test Applicability

| Category | Applicability |
|---|---|
| unit | Not applicable; no production or pure helper logic changes |
| functional | Required for selftest, quality, syntax, diff, and packet checks |
| integration | Not applicable; no service or component boundary changes |
| ui-unit | Not applicable; this is a real-page browser regression |
| e2e-api | Not applicable; no API behavior changes |
| e2e-ui | Required for focused, same-file, and both complete-suite profiles |
| stress | Not separately applicable; TP-B006-03 is the owning concurrent browser workload |
| load | Not applicable; no product throughput contract changes |

### Definition of Done

#### Core Outcomes

- [ ] Root cause is independently confirmed: the old containing budget fails
  only in complete-suite context while focused and same-file execution pass.
  > **Uncertainty Declaration**
  > **What was attempted:** the filing agent reviewed the supplied full-suite, focused, and same-file outcomes and inspected the controlling test/config.
  > **What was observed:** the outer 30-second deadline expired during a real click; focused 1/1 and same-file 3/3 were green.
  > **Why this is uncertain:** the filing agent did not re-execute the 277-test RED carrier.
  > **What would resolve this:** the implementation and test owners must preserve TP-B006-00 evidence and execute TP-B006-03 after the fix.
- [ ] The fix is exactly one finite target-local outer-budget statement; every
  existing interaction and assertion remains unchanged.
  > **Uncertainty Declaration**
  > **What was attempted:** no implementation was authorized in this invocation.
  > **What was observed:** the current target file is clean and the one-statement mutation is specified in design.md.
  > **Why this is uncertain:** the source mutation does not exist yet.
  > **What would resolve this:** TP-B006-08 must prove exact byte-boundary equivalence after implementation.
- [ ] The adversarial contract remains effective: malformed context, broken
  geometry, failed focus restoration, non-actionable close, and invalid
  no-canvas fallback states still fail without retry or bailout.
  > **Uncertainty Declaration**
  > **What was attempted:** current assertions and the neighboring label-only failure test were inspected.
  > **What was observed:** all required failure-sensitive assertions are present in the current file.
  > **Why this is uncertain:** source inspection is not post-fix execution evidence.
  > **What would resolve this:** TP-B006-02 and TP-B006-06 must pass after the exact mutation.

#### Test Evidence - Exact Parity With Ten Test Plan Rows

- [ ] TP-B006-00 preserves the pre-fix four-worker complete-suite RED at the
  real second close-button action under the default containing budget.
- [ ] TP-B006-01 focused target passes with one worker and retries disabled.
- [ ] TP-B006-02 complete contextual-tooltip file passes 3/3 serially.
- [ ] TP-B006-03 four-worker complete suite passes all 280 identities across
  the unchanged 33-file path set with retries disabled.
- [ ] TP-B006-04 serial complete suite passes with retries disabled.
- [ ] TP-B006-05 repository selftest passes with zero failures.
- [ ] TP-B006-06 bugfix regression-quality guard passes with adversarial signal
  and no silent-pass or interception violation.
- [ ] TP-B006-07 modified JavaScript parses.
- [ ] TP-B006-08 exact diff and mutation-boundary checks pass.
- [ ] TP-B006-09 artifact lint and packet integrity checks pass.

All ten test items remain unchecked because no implementation or post-fix test
execution was performed in this diagnostic invocation.

#### Build Quality Gate

- [ ] Test and packet checks are clean; no global config, product, BUG-005,
  Feature 004, BUG-002, parent Feature 012, unrelated dirty, or certification
  bytes change; documentation and evidence retain honest claim provenance.
  > **Uncertainty Declaration**
  > **What was attempted:** the packet creation boundary and pre-existing dirty baseline were recorded before this packet was added.
  > **What was observed:** `tests/contextual-tooltip.spec.mjs` had no pre-existing diff and its blob was recorded.
  > **Why this is uncertain:** implementation, full acceptance, and validate-owned certification have not occurred.
  > **What would resolve this:** all ten Test Plan rows plus validate-owned transition checks must pass after implementation.
