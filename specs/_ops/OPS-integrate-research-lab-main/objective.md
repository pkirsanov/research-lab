# Operational Objective: Integrate Research Lab Main

Links: [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [runbook.md](runbook.md) | [report.md](report.md)

## Objective

Preserve every intended Research Lab history before local `main` moves.
Build one reviewable local integration candidate without publishing or deleting repository state.

Scope 1 freezes the current Git inventory and records one design-time classification for every discovered item.
It performs no source-history mutation and selects no merge input.

## Scope 1 Success Conditions

- Validate the inherited repository decision before reading or changing repository state.
- Record fetch evidence separately from merge-input selection.
- Capture every ref, stash alias, and worktree registration with a full identity.
- Capture local `main`, `origin/main`, their merge base, and their divergence.
- Capture current non-packet dirt without hiding Feature 030, BUG-022, Company, Shock, or nested bug packets.
- Assign one closed-vocabulary design-time classification and one proposed action to every item.
- Freeze only when refs, stash state, worktree state, Git markers, locks, and scoped writers remain quiescent.
- Keep the three planned Scope 1 tests unchecked until `/bubbles.test` authors and runs them.

## Current Freeze

| Fact | Current-session value |
| --- | --- |
| Inventory identity | `sha256:e3d062462b03930c7abc565837254eb3e37c0866ac5b9dbd0ee537bc86f5acf5` |
| Observed at | `2026-09-03T13:14:27Z` |
| Ref count | 68 refs in 30 object groups |
| Worktree registrations | Five |
| Stash aliases | One |
| Local `main` | `fa9be9ddcd330220171c7e374071be6856adc677` |
| `origin/main` | `397dc41d7c4189299d2e2ceb0486927545e39677` |
| Merge base | `c0d7f5568805af40fa77ae70e1387fbc5dbca2a5` |
| Divergence | 79 local-only and 320 origin-only commits |
| Git locks | None observed |
| Git operation markers | None observed |
| Scoped Git writers | None observed |
| Selected merge inputs | None in Scope 1 |

The inventory excludes only `specs/_ops/OPS-integrate-research-lab-main/**` from dirty-status hashing.
All other tracked and untracked dirt remains represented.

## Current Dirty-State Boundary

The primary worktree contains 15 modified tracked paths and 18 untracked paths outside this OPS packet.
The untracked paths form two complete nested Feature 030 bug packets.
The Company worktree contains only `.bubbles-worktree` operational metadata.
The Shock worktree contains five modified bug-artifact paths and its `.bubbles-worktree` marker.
Two registered worktrees are prunable metadata with no live checkout.

Scope 1 records these facts without assigning final content ownership or inclusion proof.
Scope 2 owns those proof decisions under the existing design.

## Action Boundary

`PUSH: NOT AUTHORIZED`

`CLEANUP: NOT AUTHORIZED`

Scope 1 must not run checkout, branch creation, merge, rebase, reset, stash mutation, clean, commit, push, ref deletion, or worktree removal.
It must not change product files, tests, certification state, or human acceptance.

## Evidence Boundary

The packet-local [integration ledger](integration-ledger.jsonl) is the audit source for this freeze.
Its `selectedInputs` array is empty.
Its fetch fields distinguish the operator-reported fetch from Scope 1 execution.
Its worktree records use aliases and contain no absolute machine path.

<!-- End of operational objective. -->