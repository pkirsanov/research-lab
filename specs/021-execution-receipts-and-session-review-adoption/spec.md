# Spec 021 — Execution Receipts and In-Session Review Adoption

**Status:** SPEC ONLY — awaiting `bubbles.design` → `bubbles.plan`. No design, scopes, or execution packet exists yet.
**Depends on:** `bubbles` `improvements/IMP-048-in-session-review-and-execution-receipts.md` SCOPE-1 (review loop), SCOPE-3 (leaf receipts), SCOPE-4 (mutation receipts), SCOPE-6 (session budgets), SCOPE-7 (session liveness). SCOPE-2 (dispatch receipts) applies only when work is dispatched to specialists.
**Owner on adoption:** `bubbles.plan`

## Build-Free Constraint

This repository has no build step, no service lifecycle, and no project CLI. Verification runs through the exact committed Node commands from the repository root. Nothing in this spec introduces a wrapper, a bundler, a package manager step, or an invented command. Where a check is needed, it is a Node script invoked directly, consistent with the existing validator scripts.

## Problem

Three weaknesses are specific to this repository's shape.

1. **Mutation testing has already caused a real incident here.** Proving a guard is load-bearing by perturbing shipped source is correct practice, but in a repository where concurrent sessions commit from the same working tree, the window between mutate and restore is a commit window. On 2026-08-10 a shared module was mutated to neutralise a check; a concurrent session committed during that window, so the published commit shipped the neutralised check under a message claiming the opposite. It was caught only by diffing afterwards and required a corrective commit. The practice is right; the isolation was missing.

2. **A known-flaky functional suite makes green ambiguous.** A tool-experience suite is run repeatedly to observe whether it passes consistently. Without a recorded distinction between a real failure and an unstable one, a passing run carries less information than it appears to, and a failing run invites a rerun rather than a diagnosis.

3. **Declared negative controls are unproved.** `.github/bubbles-project.yaml` declares no `mutationExecution:` block, so scenarios declaring mutation as their control mechanism have no execution behind the declaration. This matters more than usual here because the product's core promise is that every displayed number is recomputed in-browser and honestly provenanced — the guards that enforce provenance, staleness labelling, and null-safety are exactly the code whose tests must be provably sensitive.

## Outcome Contract

**Intent:** A guard in this repository is only trusted once it has been shown to fail when the behavior it protects is broken, and demonstrating that never risks publishing a neutralised guard.

**Success Signal:** Every mutation runs in an isolated checkout with a verified restore; each flaky suite is classified rather than silently rerun; and mutation receipts exist for the provenance and null-safety guards.

**Hard Constraints:**
- Build-free is preserved. No bundler, no project CLI, no new runtime dependency.
- Framework-managed Bubbles files are never patched locally; refreshes flow through the installer.
- Central provider access is unchanged: no page-local key input, no tokenized URL, no new key surface.
- Committed content stays tickers-only. Receipts MUST NOT record position size, cost basis, P&L, or credentials.
- Mutation MUST NOT be performed in the shared working tree.

**Failure Condition:** A mutation proof is produced by editing the shared tree, and a concurrent session publishes the mutated state. That is the incident this spec exists to prevent, and it would be worse than having no mutation proof at all.

## Actors

| Actor | Interest |
|---|---|
| Reader of a tool | Depends on every displayed number being honestly labelled and never fabricated |
| Delivery agent | Needs to prove a guard is load-bearing without endangering the published site |
| Concurrent session | Must never inherit or publish a mutated working tree |
| Operator | Needs flaky suites classified rather than rerun indefinitely |

## Requirements

### R1 — Isolated mutation with verified restore

- R1.1 `.github/bubbles-project.yaml` MUST declare a `mutationExecution:` block with a repository-owned Node runner and a measured timeout.
- R1.2 Every mutation MUST be applied in an isolated checkout or copied fixture, never in the shared working tree.
- R1.3 Restoration MUST be verified by digest, and the verification MUST confirm the shared tree was unchanged for the whole mutate-observe-restore window.
- R1.4 A mutation receipt MUST record the mutant identity, the expected failing assertion, the observed failure, and the restored digest.
- R1.5 Where a non-tautological proof is available without perturbing shipped source — for example an empty-allowlist case proving a guard fails closed — that form is PREFERRED over mutation.

### R2 — The guards that owe proof

- R2.1 The following mutants MUST each be killed by an existing check:

| Mutant | Perturbation | Must fail |
|---|---|---|
| `P1-unprovenanced-value` | Render a displayed value with no provenance class | The provenance-completeness check |
| `P2-missing-as-zero` | Render missing data as zero instead of unavailable | The honest-unavailable check |
| `P3-global-isfinite` | Replace a finite-number guard with the global coercing form | The null-safe first-paint check |
| `P4-registry-drift` | Publish a tool absent from the registry or navigation | The registry and navigation parity check |
| `P5-stale-unlabelled` | Serve cached data without its stale label | The freshness-labelling check |

- R2.2 Each mutant MUST perturb the module under test, never the test itself.

### R3 — Flaky suites are classified, not rerun

- R3.1 A suite observed to produce differing outcomes on identical bytes MUST be recorded as UNSTABLE with its observed pass ratio.
- R3.2 An UNSTABLE result MUST NOT satisfy an evidence obligation, and MUST NOT be reported as a product failure.
- R3.3 Stabilisation MUST be treated as a defect with an owner, not absorbed by repeated execution.

### R4 — Leaf-level validation receipts

- R4.1 Each Node test file and each validator script MUST record a receipt binding leaf identity, candidate digest, exit code, and output hash.
- R4.2 An unchanged leaf MUST be reported accepted and MUST NOT be re-executed.
- R4.3 A changed shared module MUST invalidate exactly the leaves covering it, including the tools that consume it.

### R5 — Session discipline

- R5.1 A `sessionBudget` MUST be recorded for delivery work.
- R5.2 Crossing the soft boundary MUST emit a handoff recommendation without marking any spec blocked.
- R5.3 Turn snapshots MUST be appended for any run exceeding three turns.
- R5.4 The in-session review MUST surface concurrent-session activity in this repository, because the shared working tree makes concurrency a correctness hazard rather than only a performance one.

## Scenarios

```gherkin
Scenario: SCN-021-01 mutation never touches the shared working tree
  Given a guard must be proved load-bearing
  When the mutant is applied
  Then it is applied in an isolated checkout or copied fixture
  And the shared working tree is unchanged for the entire window
  And the restored digest equals the pre-mutation digest

Scenario: SCN-021-02 a concurrent commit cannot publish a mutated guard
  Given another session may commit from this repository at any moment
  When a mutation run is in progress
  Then no mutated bytes exist in the shared tree to be committed

Scenario: SCN-021-03 removing provenance breaks the provenance check
  Given every displayed value carries a provenance class
  When a value is mutated to render without one
  Then the provenance-completeness check fails

Scenario: SCN-021-04 rendering missing data as zero breaks the honesty check
  Given missing data renders as unavailable
  When it is mutated to render as zero
  Then the honest-unavailable check fails

Scenario: SCN-021-05 an unstable suite is classified rather than rerun
  Given a suite produces differing outcomes on identical bytes
  When its result is recorded
  Then it is classified unstable with its observed pass ratio
  And it satisfies no evidence obligation
  And it is not reported as a product failure

Scenario: SCN-021-06 a shared-module change invalidates its consumers
  Given a shared module changes
  When the impacted set is resolved
  Then the leaves covering that module and the tools consuming it are invalidated
  And unrelated tool leaves remain accepted

Scenario: SCN-021-07 receipts carry no private holdings data
  Given a receipt is written for a validator leaf
  When it is inspected
  Then it contains identity, digests, exit code, and output hash only
  And it contains no position size, cost basis, P&L, or credential

Scenario: SCN-021-08 a non-mutating proof is preferred where available
  Given a guard can be proved fail-closed by an empty-allowlist case
  When the proof form is selected
  Then the non-mutating form is used
  And shipped source is not perturbed
```

## Non-Functional Requirements

- **Build-free:** every check is an existing-style Node invocation from the repository root.
- **Concurrency safety:** the shared tree is never left in a mutated state, even briefly.
- **Privacy:** receipts and records contain no holdings data or credentials.
- **Honest degradation:** unstable and unavailable are distinct recorded states, never collapsed into pass or fail.

## Outcomes

| # | Outcome | Proof |
|---|---|---|
| O1 | Guards are provably load-bearing | Killed-mutant receipts for the five named guards |
| O2 | Proving a guard cannot publish a broken one | Isolated-checkout mutation with verified shared-tree stability |
| O3 | Flakiness is a tracked defect | Unstable classifications with pass ratios and owners |
| O4 | Validation cost tracks change size | Accepted-leaf counts; shared-module changes invalidate consumers |
| O5 | Records are safe to commit | No holdings data or credentials in any receipt |
| O6 | Sessions end deliberately | Budget recorded; handoff emitted at the soft boundary |

## Out of Scope

- Framework implementation of receipts, review loop, or budgets — that is `IMP-048` in the bubbles repository.
- Any change to provider-access configuration, the shared data layer, or the Simple/Power paradigm.
- New tools or brief content changes.

## Next Owner

`bubbles.design`, then `bubbles.plan`.
