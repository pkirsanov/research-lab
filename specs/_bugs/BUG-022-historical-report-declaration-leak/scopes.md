# Scopes: BUG-022 Historical Report Declaration Leak

Links: [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Scope 1: Separate Active Declarations From Historical Receipts

**Status:** [~] In progress
**Depends On:** none
**Change Boundary:** parser, focused regression test, project command registry,
and this packet only

### Gherkin Scenarios

```gherkin
Feature: Current test discovery ignores immutable execution receipts

  Scenario: A historical command remains evidence without becoming authority
    Given a report.md receipt containing node --test tests/portfolio-*.mjs
    And Playwright selects tests/**/*.spec.mjs
    When current test declarations are collected
    Then the report contributes no Node declaration
    And the portfolio Playwright specifications do not cross because of it

  Scenario: The same pattern remains invalid when actively declared
    Given an active command authority containing node --test tests/portfolio-*.mjs
    And Playwright selects tests/**/*.spec.mjs
    When current test declarations are collected
    Then the Node declaration retains its active artifact and line
    And the portfolio Playwright specifications are reported as crossings

  Scenario: Legitimate Node families remain reachable through current authority
    Given current commands for tests/*.functional.mjs and tests/*.test.mjs
    When test-file reachability is validated
    Then those families are reachable without report receipts
    And no new orphan is absorbed into the baseline

  Scenario: Historical Feature 008 evidence remains immutable
    Given the Feature 008 BUG-004 report at the filing commit
    When the repair is complete
    Then its captured portfolio command, result, and sha256 are unchanged
```

### Implementation Plan

1. Have `bubbles.design` confirm the artifact-authority boundary and migration.
2. Have `bubbles.plan` confirm test-plan and DoD parity.
3. Capture a failing pre-fix runtime-foundation execution.
4. Add the parser authority predicate and focused adversarial regression.
5. Add active functional and `.test.mjs` commands to the command registry.
6. Re-run focused, reachability, Feature 008, clean-tree selftest, and packet
   governance checks.
7. Record exact path containment and current verdicts without editing protected
   evidence or concurrent dirt.

### Test Plan

| ID | Test Type | Category | Location | Required behavior | Command |
| --- | --- | --- | --- | --- | --- |
| TP-BUG022-01 | Pre-fix regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | Existing bytes fail on the eight report-derived portfolio crossings | `node --test tests/playwright-runtime.foundation.functional.mjs` |
| TP-BUG022-02 | Regression E2E - discovery authority | functional | `tests/playwright-runtime.foundation.functional.mjs` | Historical receipt is inert and the identical active pattern still crosses | `node --test tests/playwright-runtime.foundation.functional.mjs` |
| TP-BUG022-03 | Reachability validator | functional | `scripts/validate-test-file-reachability.mjs` | Current declarations cover legitimate families with no new orphan | `node scripts/validate-test-file-reachability.mjs` |
| TP-BUG022-04 | Repository selftest | functional | `scripts/selftest.mjs` | Full build-free invariant suite remains green | `node scripts/selftest.mjs` |
| TP-BUG022-05 | Feature 008 Node regressions | functional | `tests/portfolio-*.unit.mjs`, `tests/portfolio-*.functional.mjs` | All direct Node Feature 008 carriers remain green without selecting browser specs | `node --test tests/portfolio-*.unit.mjs tests/portfolio-*.functional.mjs` |
| TP-BUG022-06 | Feature 008 browser regressions | e2e-ui | `tests/portfolio-survival-*.spec.mjs` | Browser ownership and user-visible portfolio scenarios remain green | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |
| TP-BUG022-07 | Packet artifact lint | governance | this packet | Packet shape and evidence contract are valid | `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak` |
| TP-BUG022-08 | Packet transition guard | governance | this packet | Guard reports the truthful in-progress or certifiable state | `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak` |

### Definition of Done

- [ ] Root cause is confirmed by current-session execution and documented.
- [ ] The pre-fix runtime-foundation regression fails on the exact eight portfolio crossings.
- [ ] `bubbles.design` owns and confirms the final design.
- [ ] `bubbles.plan` owns and confirms this scope, Test Plan, and DoD parity.
- [ ] Historical `report.md` receipts contribute zero current Node declarations.
- [ ] An active broad Node declaration still produces a crossing and fails the adversarial assertion.
- [ ] `tests/*.functional.mjs` and `tests/*.test.mjs` have explicit current command authority.
- [ ] The Feature 008 BUG-004 report is byte-for-byte unchanged.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
- [ ] Broader E2E regression suite passes
- [ ] The reachability validator passes without baseline growth.
- [ ] The repository selftest passes in a clean tree.
- [ ] Applicable Feature 008 Node and browser regressions pass.
- [ ] Regression tests contain no skip, only, todo, or silent-pass bailout.
- [ ] Artifact lint and state-transition guard verdicts are recorded honestly.
- [ ] Explicit path containment reports zero protected or concurrent-dirt leakage.
- [ ] Documentation reflects active commands without rewriting historical evidence.
