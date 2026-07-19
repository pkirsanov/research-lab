# Scope 09: Evidence-First Atomic Publication

**Status:** Done
**Depends On:** 08
**Scope-Kind:** runtime-behavior
**Requirements:** FR-011 through FR-019, FR-024 through FR-028, FR-054 through FR-063, FR-067 through FR-070, FR-077, FR-118, FR-121, FR-126, FR-132; NFR-004 through NFR-006, NFR-009, NFR-013 through NFR-016, NFR-022

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Run one evidence-first scheduled transaction in an isolated Git worktree: resolve calendar and acquire bounded sources, freeze the immutable cutoff/evidence set, evaluate all owner reads, author/validate every source brief, author/validate the final, validate and promote one whole artifact graph pointer-last, commit an exact inventory, and push that exact commit. Any required failure leaves prior current state and the user's dirty root untouched; retries never reacquire or reauthor frozen work.

### Gherkin Scenarios

#### SCN-002-010: Enforce the evidence-to-push barrier order for one coherent run

```gherkin
Scenario: SCN-002-010 publishes one complete coherent scheduled run
  Given the run lock source revision frozen registry policies calendar coverage and Git target validate
  When the scheduler acquires bounded sources freezes cutoff evidence and all owner reads then authors every source brief and the final brief
  Then no read or author uses evidence first available after cutoff
  And final authorship begins only after all 22 current source outcomes validate
  And one complete evidence read brief final history index manifest pointer compatibility commit and push inventory shares the same run identity
  And briefs/current.json advances last only after whole-set validation
```

#### SCN-002-011: Preserve prior current state across every required-phase failure

```gherkin
Scenario: SCN-002-011 preserves the prior coherent publication on a required failure
  Given a prior validated current pointer and a new isolated run worktree exist
  When calendar source cutoff owner read author budget unsafe input final history publish-set or artifact-budget validation fails
  Then no current pointer compatibility projection authoritative history commit or push exposes the partial run
  And final authorship never starts with an incomplete source barrier
  And safe run events and the private local journal identify the exact refusal or resumable state without rejected/private bodies
```

#### SCN-002-012: Deduplicate invocations and retry exact bytes without dirty-root impact

```gherkin
Scenario: SCN-002-012 resolves duplicate concurrent commit-failed push-failed and remote-advanced attempts safely
  Given the user's root worktree contains unrelated dirty and untracked paths and a run key has known state
  When duplicate leases completed runs commit failure push failure non-overlapping remote advance overlapping declared paths crash resume rollback or cleanup execute
  Then at most one authoritative content event commit and push path exists
  And push retry reuses the exact commit without source refresh owner evaluation or authorship
  And remote overlap refuses automation while every unrelated root byte index entry and worktree state remains unchanged and unstaged
```

### Implementation Plan

1. Refactor `scripts/brief-refresh-and-push.sh` into a thin portable dispatcher with `#!/usr/bin/env bash`, exact exit propagation, and the existing cross-platform timeout helper pattern. Remove data-only/soft current publication and all model/calendar/parser logic from shell.
2. Implement the exact barrier sequence in `scripts/brief-refresh.mjs::runBriefRefresh` and `scripts/brief-publication.mjs::{buildPublishSet,validatePublishSet,promotePublishSet,resumePublish,rollbackPublication}`: lease, fetched revision worktree, config/registry/calendar validation, owner refresh, bounded source acquisition, immutable cutoff/evidence freeze, reads, input freeze, reuse/budget reservation, source authors, source barrier, lifecycle/grouping, final author, whole-set staging/validation, pointer-last promotion, exact staging, commit, push/receipt.
3. Implement `BriefRunManifest/v1`, scheduled/ad-hoc run key, fingerprint/ID, attempt identity, policy/source revision, three run clocks, complete evidence/read/brief/final refs, usage/attempts, declared inventory, validation, Git intent, and commit/push state. Duplicate/in-progress/completed resolution is deterministic.
4. Enforce source acquisition before freeze only. Retries for owner/tool/final/commit/push/rollback consume the exact frozen evidence and staged bytes; a changed input after completion requires a distinct explicit run identity.
5. Build/validate all immutable objects and monthly appends in a run-scoped staging directory. Re-hash after promotion, write `briefs/current.json` last, and stage only manifest-declared paths. Reject undeclared index entries or byte drift.
6. Create an isolated worktree from fetched target revision. Never mutate, stash, reset, restore, clean, rebase, stage, commit, or push from the user's root checkout. Record root status paths/hashes for canary comparison only.
7. Commit with `Brief-Run-Id`, `Brief-Run-Fingerprint`, and `Brief-Manifest-SHA256` trailers. Preserve staged bytes on commit failure. Retry the exact commit after push failure; reconcile only proven non-overlap and refuse declared-path overlap.
8. Persist safe structured run events and a user-private local hash/state journal for crash recovery. Validate hashes before resume; reconcile duplicate public events idempotently. Rollback selects a prior validated manifest and appends rollback history without source/model/author calls.

### Change Boundary

**Allowed:** `scripts/brief-refresh.mjs`, new `scripts/brief-publication.mjs`, thin `scripts/brief-refresh-and-push.sh`, exact run/publish validators, run-scoped generated brief/data artifacts, Scope 09 tests using isolated temp repos/remotes.

**Excluded:** root-worktree mutation, unrelated Git paths, source/owner formulas, author/reducer/final policy except orchestration calls, UI/pages, direct legacy-history mutation, CI/Pages workflow, dependency files, other specs, credentials/private state, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

Inventory scheduler launchd/nudge entrypoints, current data refresh, root compatibility outputs, staged path lists, branch/remote behavior, `brief-history.jsonl` writer, Market Brief loaders, docs, and tests. Search for append-before-validation, root-worktree Git commands, soft/data-only success, author-before-barrier, source acquisition after freeze, mutable-current multi-file promotion, or push retry that refreshes/reauthors.

### Shared Infrastructure Impact Sweep

The scheduler, shell wrapper, publication module, run journal, static artifacts, and Git boundary are protected. Independent phase-order and dirty-root canaries run after each shared hunk and before fault/stress suites. Canary assertions use call/event traces and root byte/index snapshots, not the changed scheduler's own success flag. Rollback is pointer-only run recovery plus a narrow shared-code revert; it never deletes immutable history or touches unrelated root state.

### Test Plan

All Git/filesystem tests use isolated temporary worktrees and bare remotes. The stress row is required by the explicit concurrent-run, retry, acquisition, and artifact-budget contracts. No test writes prod/operate telemetry, backup paths, deployment manifests, release-train config, or the real repository's current/history artifacts.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-002-010 | `tests/distributed-briefs.scheduler.unit.mjs` - `SCN-002-010: run state permits only evidence freeze reads authors final publish commit and push order` | `node --test tests/distributed-briefs.scheduler.unit.mjs` | No | Red: illegal transition/final-before-barrier passes; Green: closed state machine rejects it. |
| Unit | unit | SCN-002-010 | `tests/distributed-briefs.scheduler.unit.mjs` - `SCN-002-010: manifest inventory and pointer-last generation share one run identity` | `node --test tests/distributed-briefs.scheduler.unit.mjs` | No | Red: mixed run/inventory can validate; Green: exact identity/hash/order checks pass. |
| Integration | integration | SCN-002-010 | `tests/distributed-briefs.scheduler.integration.mjs` - `scheduler publishes one exact run through isolated worktree commit and temporary remote` | `node --test tests/distributed-briefs.scheduler.integration.mjs` | Yes | Red: real transaction is incomplete/mixed; Green: remote tree, trailers, graph, and events prove one run. |
| Canary | functional | SCN-002-010 | `tests/distributed-briefs.scheduler.canary.mjs` - `Canary: evidence freezes before owner reads and final author waits for all 22 source outcomes` | `node --test tests/distributed-briefs.scheduler.canary.mjs` | No | Red: call trace violates barriers; Green: independent event trace proves exact order. |
| Integration | integration | SCN-002-011 | `tests/distributed-briefs.scheduler-failures.integration.mjs` - `calendar source cutoff read author budget final history and publish faults preserve prior pointers` | `node --test tests/distributed-briefs.scheduler-failures.integration.mjs` | Yes | Red: one injected phase exposes partial state; Green: byte/hash snapshots remain prior for every fault. |
| Integration | integration | SCN-002-012 | `tests/distributed-briefs.scheduler-failures.integration.mjs` - `duplicate concurrent commit push crash and rollback paths remain idempotent` | `node --test tests/distributed-briefs.scheduler-failures.integration.mjs` | Yes | Red: retries duplicate/reacquire/reauthor; Green: counters/events/commit bytes prove one path. |
| Integration | integration | SCN-002-012 | `tests/distributed-briefs.git-isolation.integration.mjs` - `dirty root non-overlap and overlap cases preserve every unrelated byte and index entry` | `node --test tests/distributed-briefs.git-isolation.integration.mjs` | Yes | Red: root/staging changes or overlap auto-merges; Green: exact before/after root proof and refusal pass. |
| Stress | stress | SCN-002-012 | `tests/distributed-briefs.scheduler.stress.mjs` - `Stress: concurrent duplicate and crash-resume attempts produce one authoritative run within budgets` | `node tests/distributed-briefs.scheduler.stress.mjs` | Yes | Red: lease/event/file/byte/call budget breaches; Green: measured production orchestration remains bounded/idempotent. |
| Regression E2E | e2e-api | SCN-002-010 | `tests/distributed-briefs.scheduler.e2e.mjs` - `Regression: SCN-002-010 evidence then owners then all briefs then final then atomic publish commit and push` | `node --test tests/distributed-briefs.scheduler.e2e.mjs` | Yes | Red: production run order/identity diverges; Green: complete remote artifact graph validates. |
| Regression E2E | e2e-api | SCN-002-011 | `tests/distributed-briefs.scheduler.e2e.mjs` - `Regression: SCN-002-011 every required-phase failure leaves prior current authority unchanged` | `node --test tests/distributed-briefs.scheduler.e2e.mjs` | Yes | Red: fault exposes partial current/history; Green: all prior pointers/projections remain exact. |
| Regression E2E | e2e-api | SCN-002-012 | `tests/distributed-briefs.scheduler.e2e.mjs` - `Regression: SCN-002-012 duplicate and push-only retries reuse exact bytes and preserve dirty root` | `node --test tests/distributed-briefs.scheduler.e2e.mjs` | Yes | Red: call counters/root bytes advance; Green: exact idempotent transaction proof passes. |
| Integration | integration | SCN-002-010, SCN-002-011, SCN-002-012 | Complete distributed publication graph validator | `node scripts/validate-distributed-briefs.mjs --root .` | Yes | Red: current/history/manifest/projection graph differs; Green: all hashes/refs/inventory reconcile. |
| Full Regression | e2e-api | SCN-002-010, SCN-002-011, SCN-002-012 | Complete final/history/scheduler E2E suite | `node --test tests/distributed-briefs.final.e2e.mjs tests/distributed-briefs.history.e2e.mjs tests/distributed-briefs.scheduler.e2e.mjs` | Yes | Red: upstream final/history behavior regresses; Green: all persistent scenarios pass together. |
| Baseline | functional | SCN-002-010, SCN-002-011, SCN-002-012 | Existing complete repository selftest | `node scripts/selftest.mjs` | Yes | Red: scheduler changes regress product invariants; Green: unchanged baseline passes. |

### Definition of Done - Tiered Validation

Core outcomes:

- [x] The scheduler enforces the exact evidence-first barrier sequence, immutable cutoff/frozen retry set, complete current/history graph, pointer-last promotion, exact inventory commit, exact-commit push, and safe event/journal contracts for one run identity. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] Every required failure preserves prior authority; duplicate/concurrent/commit/push/remote/crash/rollback paths are deterministic and idempotent with no source or author replay after freeze. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] Isolated-worktree execution proves the root checkout, index, Spec 001, unrelated product/spec paths, credentials, and every dirty/untracked path remain unchanged and unstaged. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] Consumer and Shared Infrastructure Impact Sweeps, independent barrier/root canaries, portable shell behavior, rollback, and the declared Change Boundary are complete. — Evidence: [report.md](report.md#test-evidence) (real evidence)

Test evidence items, one per Test Plan row:

- [x] [TP-09-01] Unit evidence passes for the closed run-state order after its recorded red stage. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-02] Unit evidence passes for one-run manifest/inventory/pointer identity after its recorded red stage. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-03] Integration evidence passes for one full isolated-worktree transaction and temporary remote. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-04] Independent evidence/read/source/final barrier canary passes before broad execution. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-05] Integration evidence passes for every required-phase fault with prior pointers exact. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-06] Integration evidence passes for duplicate/concurrent/commit/push/crash/rollback idempotency. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-07] Integration evidence passes for dirty-root and remote-overlap isolation. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-08] Stress evidence passes for concurrent attempts and declared acquisition/artifact/call budgets. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-09] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-010 pass with the exact amended title. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-10] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-011 pass with the exact amended title. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-11] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-012 pass with the exact amended title. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-12] Integration evidence passes for complete current/history/publication graph validation. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-13] Broader E2E regression suite passes for final/history/scheduler behavior. — Evidence: [report.md](report.md#test-evidence) (real evidence)
- [x] [TP-09-14] Baseline functional evidence passes for `node scripts/selftest.mjs` after focused checks are green. — Evidence: [report.md](report.md#test-evidence) (real evidence)

Build quality gate:

- [x] Exact Node and portable shell checks, env-pollution/source-use/privacy/path/inventory/internal-mock/self-validation scans, root diff proof, artifact validation, and full output are recorded in this scope report with zero warning or undeclared mutation. — Evidence: [report.md](report.md#test-evidence) (real evidence)
