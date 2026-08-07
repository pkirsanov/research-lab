# User Validation: BUG-005 Journey Readiness Budget

## Checklist

- [x] The packet preserves the complete-suite Journey timeout as an open finding without changing Feature 004 artifacts.
- [x] The packet records that the exact Journey target and all 9 same-file Journey tests currently pass.
- [x] The intraday expected-failure is classified as expected and excluded from counted failures; no false bug is filed.

## Goal

- **Goal:** Keep the global Journey regression reliable under the complete browser-suite workload without weakening what a ready Journey means.
- **Success signal:** Both complete-suite worker profiles pass with retries disabled while the visible-panel, ready-state, live-controller, full-registry, uniqueness, and first-tool assertions remain intact.

## Journey Steps

| Step | User Intent | Observed | Evidence | Friction |
|---|---|---|---|---|
| 1 | Run the exact global Journey behavior alone | The top-level runner observed 1/1 pass | `report.md#before-fix-full-suite-evidence` | works |
| 2 | Run every same-file Journey predecessor and target | 9/9 passed; target passed eighth in 3.1s | `report.md#same-file-cumulative-state-discriminator` | works |
| 3 | Run the complete browser workload | The preserved serial suite timed out at the 15-second mount wait | `report.md#before-fix-full-suite-evidence` | broken |

## Open Refinements

- F-BUG005-001 is routed to `bubbles.implement` for the bounded test-only mutation, followed by independent `bubbles.test` execution.
