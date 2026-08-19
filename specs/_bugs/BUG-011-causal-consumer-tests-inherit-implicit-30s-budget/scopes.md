# Scopes: BUG-011 — Declaring The Budget These Tests Actually Need

## Scope 1: 01-declare-owner-reload-budget

**Status:** [ ] Not Started
**Depends On:** none
**Owner:** bubbles.bug (direct-authorized runner; no subagent dispatch surface available this run)

### Change Boundary

| Allowed | Forbidden |
|---|---|
| `tests/causal-rotation-consumers.spec.mjs` — add `test.setTimeout(...)` and one explanatory comment | `playwright.config.mjs` (no `timeout`, no `retries`) |
| This packet's own artifacts under `specs/_bugs/BUG-011-…/` | `sector-research-lab.html`, `global-rotation-lab.html`, `real-assets-lab.html` |
| — | `rlcausalconsumer.js`, `rlviews.js`, `rlapp.js`, `rlnav.js` |
| — | Any file under `specs/015-recommendation-outcome-ledger-and-track-record/` (in-flight uncommitted work) |
| — | Any other spec file under `tests/` |

### Gherkin Scenarios

```gherkin
Feature: BUG-011 Feature 001 consumer regressions run on a declared budget

  Scenario: SCN-011B-001 Every test in the file declares the budget its work needs
    Given tests/causal-rotation-consumers.spec.mjs drives openOwner one to three times per test
    And playwright.config.mjs declares no timeout, so the inherited budget is 30000 ms
    When the file is read
    Then every test declares test.setTimeout as its first statement
    And the declared value is a magnitude already used elsewhere in the repository

  Scenario: SCN-011B-002 The suite is green under its own parallelism
    Given the committed suite runs at four workers and contains a spec file taking 7.0 m
    And the two most expensive tests in this file previously failed in that run
    When the full committed suite is run exactly as the repository runs it
    Then no test in tests/causal-rotation-consumers.spec.mjs fails

  Scenario: SCN-011B-003 The red is removed by giving time, never by checking less
    Given four shortcuts would each turn the red green without verifying the behaviour
    When the committed diff is reviewed
    Then it introduces no retries configuration
    And it marks no test skip or fixme
    And it deletes or weakens no assertion
    And it leaves enterOwnerView byte-identical

  Scenario: SCN-011B-004 Raising an enclosing budget keeps every wait declaration reachable
    Given scripts/validate-playwright-timeout-budgets.mjs enforces BUG-009 INV-009-1
    When the guard runs over the changed tree
    Then it exits zero
    And it reports having scanned a non-zero number of declarations

  Scenario: SCN-011B-005 The suite still tests everything it tested before
    Given the committed suite enumerated 498 tests before the change
    When the suite is enumerated after the change
    Then it still enumerates 498 tests with none removed or skipped
```

### Implementation Plan

1. Add `test.setTimeout(180_000);` as the first statement of all five tests in
   `tests/causal-rotation-consumers.spec.mjs`.
2. Add one comment above `openOwner()` recording the measured cost, the inherited budget, and the
   honest limitation that the `networkidle` settle remains timing-dependent.
3. Change nothing else.

### Test Plan

| Test Type | Category | File / Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Regression, isolated | `e2e-ui` | `tests/causal-rotation-consumers.spec.mjs` | The file is green on its own after the change | `npx --no-install playwright test tests/causal-rotation-consumers.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes (local HTTP server, real pages) |
| Regression, adversarial | `e2e-ui` | full suite | The file is green under the four-worker contention that produced the red | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line` | Yes |
| Suite inventory | `unit` | full suite | No test removed, skipped, or renamed | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --list` | No |
| Budget coherence guard | `unit` | `scripts/validate-playwright-timeout-budgets.mjs` | No wait declaration became unreachable | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| Repository selftest | `unit` | `scripts/selftest.mjs` | Repository invariants, including the budget guard and the PII scan | `node scripts/selftest.mjs` | No |
| Diff review | `unit` | committed diff | The change is additive only and touches no prohibited surface | `git --no-pager diff` | No |
| Artifact lint | `unit` | this packet | The packet satisfies the Bubbles artifact contract | `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget` | No |

**Adversarial note.** The isolated run is *not* the regression test. It was green before the change
and would stay green if the fix did nothing. The test that can actually fail if the bug is
reintroduced is the **full-suite** run at four workers, because that is the condition under which the
30 s budget was observed to expire. A DoD that ticked only on the isolated run would be tautological.

### Definition of Done — 3-Part Validation

- [ ] Every test in `tests/causal-rotation-consumers.spec.mjs` declares `test.setTimeout(180_000)` as its first statement, and the value is an existing in-repo magnitude
- [ ] The file passes in isolation after the change
- [ ] The full committed suite passes with zero failures in `tests/causal-rotation-consumers.spec.mjs`, run at the four-worker parallelism that produced the red
- [ ] The committed diff is additive only, introduces no `retries`, marks no test `.skip`/`.fixme`, deletes no assertion, and leaves `enterOwnerView` unchanged
- [ ] `playwright.config.mjs` is unchanged
- [ ] `node scripts/validate-playwright-timeout-budgets.mjs` exits 0
- [ ] `node scripts/selftest.mjs` reports 0 failed and no reduction in assertion count
- [ ] The suite still enumerates 498 tests
- [ ] Build Quality Gate: artifact lint passes, `report.md` carries no absolute host path, and no issue found during this scope was deferred
