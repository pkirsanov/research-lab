# Report: 002 Distributed Tool Briefs and Recommendation History

**Related artifacts:** [scopes/_index.md](scopes/_index.md) | [uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

## Planning Baseline

This is the aggregate execution-evidence template for the ten sequential scopes in [scopes/_index.md](scopes/_index.md). Each scope owns its evidence in `scopes/<NN-name>/report.md`; this file summarizes only after those records exist. `bubbles.plan` authored contracts but did not implement, execute acceptance journeys, or certify product behavior. A planning path, title, expected result, fixture, or source-response sample is not delivery evidence.

## Summary

- Feature intent: use the frozen registry to give every source tool one truthful current brief/history contract; the current 23-entry canary is 22 sources, including Bond Regime, plus Market Brief as the non-recursive final participant. Runtime membership remains registry-derived while cutoff-safe market-session/report evidence stays outside owning-model authority.
- Scope order: MarketSessionEvidence foundation -> Yahoo extended-hours and CPI release adapters -> cutoff-safe reaction and owner integration -> registry reads -> bounded authorship/lifecycle -> append-only history/migration -> window-aware final aggregation -> evidence-first atomic publication -> shared UI/Pages acceptance.
- Shared-risk posture: changes to `rlcontracts.js`, `rlsession.js`, `RLDATA`, `RLAPP`, `tools.json`, owner-read adapters, scheduler ordering, history storage, and page mounts require independent canaries and rollback/restore proof.
- Evidence policy: committed normalized vectors and captured external responses prove contract behavior only. Live tests may prove current structure, bounded acquisition, provenance, freshness, cutoff eligibility, identity, atomicity, and UI behavior; none proves a fixed market value, recommendation correctness, or investment performance.
- Delivery status: no implementation or test execution is claimed by this planning packet.

## Decision Record

Planning fixed the following execution boundaries from [design.md](design.md): provider-neutral MarketSessionEvidence precedes concrete Yahoo/BLS adapters; exact calendar rows and immutable cutoffs govern session/report evidence; owners publish interpretations through ToolModelRead without foundation or author recomputation; registry membership is the only participant discovery mechanism; final authorship waits until read and brief outcome ID sets exactly equal the frozen registry's derived source ID set; unchanged briefs carry by reference; recommendation identity is deterministic and provenance-aware; `briefs/current.json` and `briefs/history-current.json` are the only mutable pointers; monthly JSONL is append-only; publication uses an isolated worktree with pointers advanced last; and compatibility projections remain complete.

Execution agents must append any implementation decision that changes file grouping while preserving these contracts, including the affected scope, alternatives considered, contract/version impact, rollback boundary, and evidence reference.

## Completion Statement

Planning reconciliation is complete. Product delivery is not claimed. All 122 test-related DoD items and every implementation DoD item remain unchecked, all ten scope statuses remain Not Started, user acceptance journeys are unexecuted, and `state.json` remains `not_started` with certification untouched.

## Code Diff Evidence

Planning-only paths created or updated by this invocation:

- `specs/002-distributed-tool-briefs-and-history/scopes/_index.md`
- `specs/002-distributed-tool-briefs-and-history/scopes/*/scope.md`
- `specs/002-distributed-tool-briefs-and-history/scopes/*/report.md`
- `specs/002-distributed-tool-briefs-and-history/report.md`
- `specs/002-distributed-tool-briefs-and-history/uservalidation.md`
- `specs/002-distributed-tool-briefs-and-history/scenario-manifest.json`
- `specs/002-distributed-tool-briefs-and-history/test-plan.json`
- plan-permitted execution metadata in `specs/002-distributed-tool-briefs-and-history/state.json`

No source, runtime, config, contract, test, docs, Spec 001, or unrelated product path is claimed by this planning phase.

## Test Evidence

No product implementation test, browser test, source smoke, migration, scheduler transaction, or Pages acceptance command has been executed by `bubbles.plan`. Exact commands, paths, titles, live-system classifications, and red-to-green contracts are defined in each scope and bound by ordered row hashes in [test-plan.json](test-plan.json). Delivery evidence must contain full unfiltered output, the actual exit code, and a `Claim Source` value for each command.

### Planned Test Inventory

The active plan contains 122 ordered test rows across ten scopes. The Markdown rows are authoritative; [test-plan.json](test-plan.json) stores each exact row's `TP-*` identifier, order, and SHA-256 contract. The previous five-scope rows remain only under `supersededScopes` with `doNotExecute: true`.

## Scenario Contract Evidence

No runtime scenario evidence exists. [scenario-manifest.json](scenario-manifest.json) registers SCN-002-001 through SCN-002-028 with exact persistent live regression identifiers and per-scope report anchors. Every scenario remains unlocked and not run.

| Scenario Range | Owning Scopes | Evidence Status |
| --- | --- | --- |
| SCN-002-016, SCN-002-018, SCN-002-021, SCN-002-022 | 01 | Not run |
| SCN-002-017, SCN-002-028 | 02 | Not run |
| SCN-002-019, SCN-002-023, SCN-002-024 | 03 | Not run |
| SCN-002-020, SCN-002-026 | 04 | Not run |
| SCN-002-001 through SCN-002-003 | 05 | Not run |
| SCN-002-004 through SCN-002-006 | 06 | Not run |
| SCN-002-007 through SCN-002-009 | 07 | Not run |
| SCN-002-025, SCN-002-027 | 08 | Not run |
| SCN-002-010 through SCN-002-012 | 09 | Not run |
| SCN-002-013 through SCN-002-015 and amendment UI regressions | 10 | Not run |

## Coverage Report

Planning maps all 28 stable scenario contracts to exact persistent live regression identifiers and assigns FR-001 through FR-132, NFR-001 through NFR-024, BS-002-001 through BS-002-030, and AC-001 through AC-033 across the ten-scope DAG. NFR-023 is assigned to Scopes 02, 03, 04, 05, 06, 08, and 10; NFR-024 is assigned to Scopes 03, 04, 05, 06, 08, and 10. Runtime coverage percentages and pass counts are unavailable until implementation tests execute.

## Lint and Quality

Planning governance command evidence is reported by the invoking plan agent. Product lint is not declared by the repository. Product behavior validation remains the exact Node and Playwright surfaces defined in [test-plan.json](test-plan.json).

## Uncertainty Declarations

- **Scopes 1-10:** Product behavior, planned test-file existence, and implementation command outcomes were not evaluated by `bubbles.plan`. Resolution requires sequential implementation and test ownership to create the planned surfaces, execute each exact command, and append raw evidence without weakening the scenarios.
- **Market proof:** No planned fixture or test result may be interpreted as evidence of investment performance or recommendation correctness. Resolution of a recommendation outcome uses only frozen terms and later source evidence under the implemented lifecycle contract.

## Spot-Check Recommendations

Independent validation should inspect opening-boundary assignment, holiday/early-close/DST rows, exact five-minute Yahoo request and no-write smoke, official-versus-indicative price separation, comparable-volume exclusions, CPI pre-release/released/revision/dispute lineage, release-aligned no-look-ahead reactions, owner authority, registry count/roles, exact four-worker call accounting, carry-forward, lifecycle/conflict groups, one monthly query, actual-corpus (derived row count) migration parity, every scheduler fault, dirty-root preservation, and all-page desktop/mobile/zoom rendering.

## Validation Summary

No product validation verdict exists. Planning validation results are supplied in the `bubbles.plan` result envelope and do not certify delivery.

## Audit Verdict

No audit verdict exists. `bubbles.audit` and `bubbles.validate` retain ownership of audit evidence and terminal certification.
