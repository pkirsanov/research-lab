# Bug Specification: BUG-006 Contextual Tooltip Suite Budget

- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Workflow mode:** `bugfix-fastlane`
- **Status:** In progress; diagnosed and routed, not implemented

## Problem Statement

The mobile contextual-disclosure regression validates the correct product
behavior but can exhaust its containing 30-second Playwright test budget during
the complete four-worker suite. The repair must preserve real browser
actionability and every substantive assertion while giving only this heavy
target enough finite outer execution margin.

## Outcome Contract

**Intent:** Make the mobile disclosure regression deterministic under complete
browser-suite contention without changing the behavior it proves.

**Success signal:** The exact target, complete contextual-tooltip file,
four-worker 280-test suite, and serial 280-test suite pass across the unchanged
33-file path set with retries disabled. The first touch open, sheet geometry,
Escape close, close-button click, focus restoration, no-canvas same-data
fallback, and invalid-context failure checks remain intact.

**Hard constraints:** Change only the named target in
`tests/contextual-tooltip.spec.mjs`; keep the budget finite and target-local;
retain real locator actionability; retain zero retries and zero interception.

**Failure condition:** Any acceptance profile still times out; discovery no
longer reports 280 identities across the unchanged 33-file path set; any
interaction or assertion is removed or weakened; or the larger budget affects
other tests or global Playwright configuration.

## Concurrent Baseline Requirement

The current exact system-Chrome list baseline at repository HEAD
`923833254b9463cfb163cac2aace2b2fb305333b` is 280 identities across 33 files.
Earlier 277-identity executions remain valid historical evidence, but they do
not satisfy the current complete-suite acceptance requirement. This count-only
reconciliation leaves the commands, retries, worker profiles, diagnosis,
bounded fix, assertions, and behavior contract unchanged.

## Requirements

| ID | Requirement |
|---|---|
| FR-B006-01 | The exact mobile disclosure target MUST pass with one worker and retries disabled. |
| FR-B006-02 | All three tests in `tests/contextual-tooltip.spec.mjs` MUST pass serially with retries disabled. |
| FR-B006-03 | The complete system-Chrome suite MUST pass with four workers, retries disabled, 280 identities, 33 unchanged test paths, and no counted failure. |
| FR-B006-04 | The complete system-Chrome suite MUST also pass serially with retries disabled. |
| FR-B006-05 | Any larger outer budget MUST be finite and scoped only to `Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas`. |
| FR-B006-06 | The target MUST retain the real first touch open, mobile sheet geometry, Escape close, second touch open, actionable close-button click, both focus-restoration assertions, and one-trigger invariant. |
| FR-B006-07 | The target MUST retain the separate no-canvas page and assertions that the chart is unavailable, the same-data table is primary and visible, the hint explains promotion, and the verdict is non-empty. |
| FR-B006-08 | The owning file's invalid label-only context case MUST remain intact so malformed context still fails without hiding valid peers. |
| FR-B006-09 | Global timeout changes, retries, fixed sleeps, forced clicks, programmatic click dispatch, request interception, bailout returns, optional assertions, and assertion weakening are forbidden. |
| FR-B006-10 | BUG-005, Feature 004, BUG-002, parent Feature 012 artifacts, product code, configuration, dependencies, unrelated tests, and certification fields MUST remain byte-untouched by this fix. |

## Acceptance Scenario

```gherkin
Scenario: SCN-B006-001 Mobile contextual disclosure survives complete-suite contention
  Given the complete 280-identity system-Chrome browser suite runs with four workers and retries disabled under shared host load
  When the mobile contextual disclosure regression performs both real touch-open close paths, focus restoration, and the no-canvas same-data fallback
  Then the target-local finite outer budget accommodates suite contention
  And every interaction, geometry, actionability, fallback, and failure-path assertion remains unchanged
```

## Adversarial Contract

The four-worker complete suite is the adversarial timing carrier. Removing the
target-local outer budget while preserving the same workload must retain the
observed risk of exhausting the 30-second containing timeout. Independently,
the test file must remain red for malformed contextual data, a hidden or
out-of-bounds mobile sheet, failed focus restoration, a non-actionable close
control, an available canvas in the forced no-canvas page, or a fallback table
that is not promoted.

## Quality Attributes

- **Determinism:** retries remain zero in every browser acceptance command.
- **Bounded execution:** the allowance is finite and local to one target.
- **Test fidelity:** real page, real pointer events, real locator click, and real
  browser actionability remain in use.
- **Isolation:** one test statement is the expected implementation surface.

## Out Of Scope

- Product runtime optimization without new evidence of a product bottleneck.
- A global Playwright timeout increase.
- A shared helper timeout increase.
- Changes to contextual disclosure behavior or accessibility contracts.
