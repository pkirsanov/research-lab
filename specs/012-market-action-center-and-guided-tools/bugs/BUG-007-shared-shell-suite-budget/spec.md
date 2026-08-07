# Bug Specification: BUG-007 Shared-Shell Suite Budget

- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Workflow mode:** `bugfix-fastlane`
- **Status:** In progress; diagnosed and routed, not implemented

## Problem Statement

Two shared-shell browser regressions preserve correct product assertions but
can exhaust test-harness budgets inside the complete four-worker suite. The
repair must add only finite local margin. It must preserve every behavior
predicate and assertion.

## Outcome Contract

**Intent:** Make both shared-shell regressions deterministic under the complete
browser workload without weakening what either test proves.

**Success signal:** Focused and same-file carriers pass. Both complete-suite
profiles pass all 280 current identities across 33 files with retries disabled.

**Hard constraints:** Change only two explicit 30-second helper waits and add
one target-local `test.slow()` statement. Keep all other bytes unchanged.

**Failure condition:** Any acceptance profile fails, discovery changes, any
assertion weakens, or any global, product, configuration, or retry surface
changes.

## Concurrent Baseline Requirement

The current exact system-Chrome list baseline at repository HEAD
`923833254b9463cfb163cac2aace2b2fb305333b` is 280 identities across 33 files.
Earlier 277-identity executions remain valid historical evidence, but they do
not satisfy the current complete-suite acceptance requirement. This count-only
reconciliation leaves the commands, retries, worker profiles, diagnosis,
bounded fixes, assertions, and behavior contract unchanged.

## Requirements

| ID | Requirement |
|---|---|
| FR-B007-01 | The exact TP-15-04 owner-parity sweep MUST pass with one worker and retries disabled. |
| FR-B007-02 | Every test in `tests/simple-production-wiring.spec.mjs` MUST pass serially with retries disabled. |
| FR-B007-03 | The exact BUG-001 options-flow regression MUST pass with one worker and retries disabled. |
| FR-B007-04 | Every test in `tests/tool-experience.spec.mjs` MUST pass serially with retries disabled. |
| FR-B007-05 | The complete system-Chrome suite MUST pass all 280 current identities across 33 files with four workers and retries disabled. |
| FR-B007-06 | The complete system-Chrome suite MUST pass all 280 current identities across 33 files serially with retries disabled. |
| FR-B007-07 | Only the two `openAndAwaitOwnerEvidence` readiness waits MAY change from 30,000 ms to 60,000 ms. |
| FR-B007-08 | The 600,000 ms hydration deadline and 60,000 ms owner-state polling deadline MUST remain unchanged. |
| FR-B007-09 | Only the named BUG-001 options-flow target MAY receive `test.slow()`, as its first statement. |
| FR-B007-10 | The TP-15-04 900,000 ms outer budget MUST remain unchanged. |
| FR-B007-11 | Every selector, predicate, interaction, owner-parity check, delta-count check, shell check, panel check, tab check, and navigation assertion MUST remain unchanged. |
| FR-B007-12 | Global timeout changes, retries, fixed sleeps, interception, catch-based suppression, bailout returns, optional assertions, forced interactions, and product changes are forbidden. |
| FR-B007-13 | BUG-005, BUG-006, Feature 004, BUG-002, parent Feature 012, unrelated dirty work, and certification fields MUST remain untouched. |

## Acceptance Scenarios

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

## Adversarial Contract

The complete four-worker suite is the observed adversarial timing carrier. The
focused green runs must not replace it. Any lost ready predicate, owner-parity
fact, native-demotion check, first-delta ordering check, twelve-request check,
shell count, tab count, panel count, or navigation action remains a failure.

## Quality Attributes

- **Bounded execution:** every allowance remains finite.
- **Isolation:** only two test files may change.
- **Fidelity:** real pages and unchanged production predicates remain decisive.
- **Determinism:** retries remain zero.
- **Completeness:** both complete-suite profiles retain all 280 identities.

## Out Of Scope

- Product runtime optimization without new product-failure evidence.
- Global Playwright timeout changes.
- Any wait unrelated to the two named targets.
- Changes to Feature 012 planning or certification.
