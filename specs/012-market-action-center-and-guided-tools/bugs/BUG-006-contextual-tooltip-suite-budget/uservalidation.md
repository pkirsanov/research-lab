# User Validation: BUG-006 Contextual Tooltip Suite Budget

## Checklist

- [x] The packet preserves the current four-worker timeout as an open finding and does not claim a product failure.
- [x] The packet records the focused 1/1 and same-file 3/3 green discriminators without relabeling top-level runner evidence as filing-agent execution.
- [x] The proposed mutation is limited to one finite target-local outer-budget statement in the named mobile test.
- [x] The packet forbids global timeout changes, retries, sleeps, force clicks, programmatic close dispatch, interception, and assertion weakening.
- [x] BUG-005, Feature 004, BUG-002, parent Feature 012 artifacts, product code, and concurrent dirty bytes remain outside the mutation boundary.

## Goal

- **Goal:** Keep the mobile contextual-disclosure regression reliable under the complete browser workload without weakening user interaction or fallback coverage.
- **Success signal:** Focused, same-file, four-worker complete-suite, and serial complete-suite profiles pass with retries disabled while every current mobile, focus, actionability, no-canvas, and malformed-context assertion remains intact.

## Journey Steps

| Step | User Intent | Observed | Evidence | Friction |
|---|---|---|---|---|
| 1 | Run the exact mobile disclosure behavior alone | Top-level runner observed 1/1 pass | `report.md#focused-target-discriminator` | works |
| 2 | Run every contextual-tooltip test serially | Top-level runner observed 3/3 pass | `report.md#complete-same-file-discriminator` | works |
| 3 | Run the complete four-worker browser workload | Sole target timed out at the second real close-button action | `report.md#before-fix-four-worker-full-suite-evidence` | broken |

## Open Refinements

- F-BUG006-001 is routed to `bubbles.implement` for the one-statement test-only mutation, followed by independent `bubbles.test` execution and validate-owned certification.
