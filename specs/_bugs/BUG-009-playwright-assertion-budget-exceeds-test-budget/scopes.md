# Scopes: BUG-009 — Declared Wait Budgets Must Be Reachable

**Layout:** single-file
**Workflow mode:** spec-scope-hardening
**Scope count:** 2

Two scopes, ordered. Scope 01 installs the guard and proves it red against the committed tree. Scope
02 makes the three declarations reachable and turns the guard green. The order is deliberate: a guard
written after the fix can only ever be observed green, which proves nothing.

---

## Scope 1: Budget-Coherence Guard, Proven RED On The Committed Tree

**Status:** Not Started
**Depends On:** none
**Owner surface:** `scripts/validate-playwright-timeout-budgets.mjs`, `scripts/selftest.mjs`

### Gherkin Scenarios

```gherkin
Feature: A declared wait budget cannot exceed the test budget that contains it

  Scenario: SCN-009B-003 the guard names every unreachable declaration on the committed tree
    Given playwright.config.mjs declares no timeout, so the project default governs
    And tests/contextual-tooltip.spec.mjs:11 declares a 120000 ms wait in a shared helper
    And tests/trend-dynamics-cycle-lab.spec.mjs:1035 and :1040 each declare a 60000 ms poll
    When the budget-coherence guard runs against the committed tree
    Then it exits non-zero
    And it names exactly those three sites with declared value, enclosing value, and attribution

  Scenario: SCN-009B-005 the guard cannot pass by matching nothing
    Given a spec corpus in which the guard's declaration pattern matches zero sites
    When the guard runs
    Then it fails, because a vacuous scan is indistinguishable from a broken pattern

  Scenario: SCN-009B-006 the guard does not red-line a correctly declared budget
    Given a test that declares setTimeout(120_000) and then waits 60_000 inside its own body
    And a file whose budget is raised once in beforeEach and whose waits sit below it
    When the guard runs over both
    Then neither is reported, because attribution is per test and follows the call graph
```

### Implementation Plan

1. Add `scripts/validate-playwright-timeout-budgets.mjs` implementing the algorithm in
   `design.md` §3.2, exporting `validatePlaywrightTimeoutBudgets(root)` and
   `formatTimeoutBudgetFindings(findings, indent)`, and runnable as a CLI.
2. Derive the project default from `playwright.config.mjs`; do not hardcode it blindly.
3. Scrub comments and string/template literals before scanning.
4. Attribute per test, resolving module-level helpers to the minimum budget across reaching callers,
   transitively, with a visited set.
5. Fail on a vacuous scan (zero declarations or zero test blocks).
6. Run the guard **before** any fix and capture the red transcript.
7. Wire it into `scripts/selftest.mjs` following the `validate-spec-test-paths.mjs` import-and-assert
   pattern at lines 27 and 8699.

### Test Plan

| ID | Test | Type | Command | Live |
|---|---|---|---|---|
| T-09-U1 | Guard reports exactly the 3 committed sites and exits non-zero | `unit` | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| T-09-U2 | Guard stays green on the two verified near-miss shapes (AC-4) | `unit` | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| T-09-U3 | Adversarial: guard fails on a scratch fixture re-introducing the defect | `unit` | guard invoked against a disposable fixture root | No |
| T-09-U4 | Vacuous scan (zero declarations / zero test blocks) fails | `unit` | guard invoked against a disposable empty fixture root | No |
| T-09-R1 | Repository selftest passes with the guard wired in | `unit` | `node scripts/selftest.mjs` | No |

### Definition of Done

- [ ] `scripts/validate-playwright-timeout-budgets.mjs` exists and implements `design.md` §3.2
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] Guard exits non-zero on the committed pre-fix tree, naming exactly 3 sites in 2 files — [T-09-U1]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] Guard does not report `simple-model-adapters-macro-fundamental.spec.mjs` or `market-brief-session-date-drift.spec.mjs` — [T-09-U2]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] Adversarial fixture re-introducing the defect is caught — [T-09-U3]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] A scan matching zero declarations fails rather than passing — [T-09-U4]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] Guard is wired into `scripts/selftest.mjs` and `node scripts/selftest.mjs` passes — [T-09-R1]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] Build Quality Gate: no assertion weakened, no wait budget lowered, no `timeout` added to `playwright.config.mjs`, no file under `.github/bubbles/**` touched
  - Raw output evidence (inline, no references):
    ```
    ```

---

## Scope 2: Make The Three Declarations Reachable

**Status:** Not Started
**Depends On:** Scope 1
**Owner surface:** `tests/contextual-tooltip.spec.mjs` (Feature 012), `tests/trend-dynamics-cycle-lab.spec.mjs` (Feature 006)

### Gherkin Scenarios

```gherkin
Feature: A wait that asks for 120 seconds is allowed to wait 120 seconds

  Scenario: SCN-009B-001 the Feature 012 heatmap regressions survive a loaded host
    Given waitForHeatmap() declares a 120000 ms wait for data-heatmap-hydration
    And SCN-012-003 and SCN-012-004 call it
    When the host is under CPU pressure and hydration takes longer than 30 seconds
    Then both tests wait for hydration instead of being killed at 30000 ms
    And neither test's assertions are changed to accommodate the delay

  Scenario: SCN-009B-002 the Feature 006 replay regression can honour both declared polls
    Given the test at line 985 declares two sequential 60000 ms completion polls
    When both polls take their full declared budget
    Then the enclosing test budget still contains them

  Scenario: SCN-009B-004 the fix changes only budgets
    Given the committed diff for this scope
    When it is reviewed
    Then it adds only test.setTimeout declarations and replaces one test.slow()
    And no expectation, wait condition, or declared wait budget is altered
```

### Implementation Plan

1. `tests/contextual-tooltip.spec.mjs`: add `test.setTimeout(180_000)` to the tests at lines 21 and
   63, and replace `test.slow()` at line 153 with `test.setTimeout(180_000)` — `slow()` yields only
   90 s, below the helper's declared 120 s.
2. `tests/trend-dynamics-cycle-lab.spec.mjs`: add `test.setTimeout(180_000)` to the test at line 985,
   covering both sequential 60 s polls.
3. Re-run the guard: green.
4. Re-run both affected spec files under CPU pressure and confirm the previously failing tests pass.
5. Re-run the full committed suite and confirm 498 tests remain, none removed or skipped.

### Test Plan

| ID | Test | Type | Command | Live |
|---|---|---|---|---|
| T-09-U5 | Guard is green post-fix | `unit` | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| T-09-E1 | `SCN-012-003` / `SCN-012-004` pass under the CPU pressure that previously failed them | `e2e-ui` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/contextual-tooltip.spec.mjs` | Yes |
| T-09-E2 | Feature 006 replay regression still passes | `e2e-ui` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/trend-dynamics-cycle-lab.spec.mjs` | Yes |
| T-09-E3 | Full committed suite retains 498 tests with none removed, skipped, or newly failing | `e2e-ui` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes |
| T-09-R2 | Repository selftest passes | `unit` | `node scripts/selftest.mjs` | No |

### Definition of Done

- [ ] All three callers of `waitForHeatmap()` have an effective budget of at least 120000 ms — [AC-1]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] `trend-dynamics-cycle-lab.spec.mjs` test at line 985 covers both declared 60000 ms polls — [AC-2]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] Guard green post-fix — [T-09-U5]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] `SCN-012-003` and `SCN-012-004` pass under the same CPU pressure that reproduced the failure — [T-09-E1]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] Feature 006 replay regression passes — [T-09-E2]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] Full suite reports 498 tests, none removed, skipped, or newly failing — [T-09-E3]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] `node scripts/selftest.mjs` passes — [T-09-R2]
  - Raw output evidence (inline, no references):
    ```
    ```
- [ ] Change Boundary: the diff touches only the two spec files named above plus scope 01's guard and its `selftest.mjs` wiring; no assertion or declared wait budget altered; `playwright.config.mjs` unchanged; nothing under `specs/015-recommendation-outcome-ledger-and-track-record/**` or `.github/bubbles/**` modified — [SCN-009B-004]
  - Raw output evidence (inline, no references):
    ```
    ```

---

## Change Boundary

**Allowed:** `scripts/validate-playwright-timeout-budgets.mjs` (new), `scripts/selftest.mjs` (one
import plus one assertion block), `tests/contextual-tooltip.spec.mjs` (budget declarations only),
`tests/trend-dynamics-cycle-lab.spec.mjs` (one budget declaration), and this bug folder.

**Excluded:** `playwright.config.mjs`; every other spec file; every wait-budget literal in the
repository; `specs/015-recommendation-outcome-ledger-and-track-record/**`, whose `T-01-R2` row is
blocked by this bug and must not be closed by editing these files from inside that scope; anything
under `.github/bubbles/**`.
