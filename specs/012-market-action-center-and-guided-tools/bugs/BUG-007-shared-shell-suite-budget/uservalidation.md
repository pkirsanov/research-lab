# User Validation: BUG-007 Shared-Shell Suite Budget

## Checklist

- [x] The packet preserves the supplied 275/2 four-worker run as pre-fix interpreted evidence.
- [x] The packet records both focused GREEN discriminators without relabeling them as filing-agent execution.
- [x] BUG-001 remains terminal and unchanged. BUG-007 is a successor packet.
- [x] BUG-005 and BUG-006 remain outside this packet because their named targets are green.
- [x] The proposed mutation is limited to two helper timeout literals and one target-local `test.slow()` statement.
- [x] The packet preserves every selector, predicate, interaction, assertion, retry setting, and protected deadline.
- [x] Production, Playwright configuration, Feature 004, BUG-002, parent Feature 012, and concurrent dirty work remain excluded.

## Goal

- **Goal:** Keep both shared-shell regressions reliable under the complete browser workload without weakening product truth.
- **Success signal:** Focused, same-file, four-worker, and serial profiles pass with retries disabled. Both complete profiles pass 277/277 identities.

## Journey Steps

| Step | User Intent | Observed | Evidence | Friction |
|---|---|---|---|---|
| 1 | Run the owner-parity sweep alone | Operator observed 1/1 pass across all 19 tools | `report.md#focused-tp-15-04-discriminator` | works |
| 2 | Run the options startup target alone | Operator observed 1/1 pass with all 12 delta starts | `report.md#focused-bug-001-options-discriminator` | works |
| 3 | Run the complete four-worker browser workload | Both targets exhausted local budgets | `report.md#before-fix-four-worker-complete-suite-evidence` | broken |

## Open Refinements

- The exact three-edit implementation, independent testing, audit, and
	validate-owned certification remain open.
