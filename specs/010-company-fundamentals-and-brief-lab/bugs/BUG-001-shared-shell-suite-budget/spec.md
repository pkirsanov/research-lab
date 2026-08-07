# Bug Specification: BUG-001 Shared-Shell Suite Budget

- **Owning feature:** `specs/010-company-fundamentals-and-brief-lab`
- **Workflow mode:** `bugfix-fastlane`
- **Status:** In progress. Diagnosis is complete and implementation is routed.

## Problem Statement

One Feature 010 browser regression preserves decisive product assertions but
can exhaust a helper-local shell-readiness budget in the complete four-worker
suite. The repair must add finite local margin without weakening any behavior
check.

## Outcome Contract

**Intent:** Keep the Feature 010 native research surface regression reliable
under the complete browser workload.

**Success signal:** The focused target and its 32-test file pass. Both complete
suite profiles pass all 280 current identities across 33 files with retries
disabled.

**Hard constraints:** Change only the shell-ready assertion in
`openNativeResearchSurface`. Add `timeout: 30_000` and keep every other byte in
the target file and Playwright configuration unchanged.

**Failure condition:** Any required carrier fails. The repair also fails if it
changes product behavior, configuration, retries, call sites, or assertions.

## Goals

- Give the shell-ready predicate a finite suite-safe expectation budget.
- Preserve all eight consumers of the helper.
- Preserve every fail-loud native-surface guard.
- Keep the complete browser suite at 280 current identities across 33 files.

## Non-Goals

- Change product runtime behavior.
- Change global Playwright configuration.
- Add retries, sleeps, catches, interception, or forced interactions.
- Rewrite parent Feature 010 or any sibling bug packet.

## Concurrent Baseline Requirement

The current exact system-Chrome list baseline at repository HEAD
`923833254b9463cfb163cac2aace2b2fb305333b` is 280 identities across 33 files.
The supplied 277-identity pre-fix RED carrier remains valid historical evidence,
but it does not satisfy the current complete-suite acceptance requirement. This
count-only reconciliation leaves the commands, retries, worker profiles,
diagnosis, bounded fix, assertions, and behavior contract unchanged.

## Requirements

| ID | Requirement |
|---|---|
| FR-B001-01 | Preserve the supplied four-worker 277-identity run as the pre-fix 276/1 RED carrier. |
| FR-B001-02 | The exact SCN-010-007 target MUST pass with one worker and retries disabled. |
| FR-B001-03 | All 32 tests in `tests/company-fundamentals-lab.spec.mjs` MUST pass with one worker and retries disabled. |
| FR-B001-04 | The complete suite MUST pass 280/280 across 33 files with four workers and retries disabled. |
| FR-B001-05 | The complete suite MUST pass 280/280 across 33 files with one worker and retries disabled. |
| FR-B001-06 | Only the shell-ready `toBeVisible` call inside `openNativeResearchSurface` MAY gain `{ timeout: 30_000 }`. |
| FR-B001-07 | The selector, Power click, body mode check, focused-class check, detailed-tabs check, and all eight call sites MUST remain unchanged. |
| FR-B001-08 | Missing shell readiness MUST still fail after 30 seconds. |
| FR-B001-09 | Wrong Power mode, lingering `rlv-focused`, or hidden detailed tabs MUST still fail through their direct assertions. |
| FR-B001-10 | `playwright.config.mjs`, dependencies, workers, retries, and product code MUST remain unchanged. |
| FR-B001-11 | Feature 004, BUG-002, BUG-005 through BUG-007, parent Feature 010, certification fields, and concurrent dirty work MUST remain untouched. |

## Acceptance Scenario

```gherkin
Scenario: SCN-B001-001 Company fundamentals helper survives shared-shell startup contention
  Given the complete 280-identity system-Chrome browser suite runs with four workers and retries disabled under shared host load
  When the SCN-010-007 mixed-currency and fiscal-period regression opens the company fundamentals native research surface through openNativeResearchSurface
  Then the ready shared shell becomes visible within a finite 30-second expectation budget and the existing Power-mode body class and detailed-tab assertions remain fail-loud
```

## Adversarial Contract

The complete four-worker suite is the observed timing adversary. The focused
green run cannot replace it.

The helper must still fail when any protected state is absent or wrong:

- the shell never reaches `data-rlexperience-shell="ready"`;
- the Power click does not produce `data-rlview="power"`;
- `rlv-focused` remains on the body;
- the detailed tabs remain hidden.

The exact one-line diff and bugfix guard must prove these assertions remain
direct, required, and free of bailout logic.

## Acceptance Criteria

1. TP-B001-01 and TP-B001-02 preserve the focused and owning-file behavior.
2. TP-B001-03 and TP-B001-04 pass every current browser identity.
3. TP-B001-06 and TP-B001-08 preserve adversarial failure semantics.
4. TP-B001-08 proves the production and configuration diff is empty.
5. TP-B001-09 and TP-B001-10 validate the packet and control plane.

## Quality Attributes

- **Bounded execution:** the local readiness allowance remains finite.
- **Isolation:** one assertion in one test file may change.
- **Fidelity:** real pages and direct assertions remain decisive.
- **Determinism:** retries remain zero.
- **Completeness:** both complete-suite profiles retain 280 identities.

## Exposure Contract

This repair changes no product capability or reachable surface. It changes one
internal browser-test readiness budget only.
