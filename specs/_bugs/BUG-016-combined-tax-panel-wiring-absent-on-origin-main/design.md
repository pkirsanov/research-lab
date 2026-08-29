# Design: BUG-016 — How A Committed Implementation Left The Deployed Branch

## What This Document Does And Does Not Do

It isolates the mechanism, separates the parts of the failure that look alike but are not,
and enumerates remedy options with their consequences. It selects no remedy. The selection
depends on a branch-reconciliation decision that belongs to the operator and that this
filing was explicitly forbidden to make.

## Capability Foundation

The foundation is **one coherence assertion: the deployed page carries the selectors its specs
exercise**. It is a single check with a single job — make a silent loss loud.

What makes this a foundation rather than a local fix is the recurrence. `## The Loss Is Recurrent,
Not Singular` records that the wiring was written, committed, and then discarded by four separate
merges. Restoring the markup a fifth time without the assertion would have produced the same state
the packet was filed against, on the next merge that touched the region.

The foundation stops at presence. It does not verify the panel's arithmetic — that is the module's
own coverage, and the module was never the defect.

## Concrete Implementations

| # | Implementation | Asserts | Artifact | Failure mode it closes |
|---|---|---|---|---|
| 1 | Selector assertions on the deployed page | The mount EXISTS | `tests/lifetime-tax-combined.spec.mjs` | A merge silently dropping the wiring again |
| 2 | Deploy-gate execution of that spec | The assertion RUNS on the branch that publishes | `pages.yml` browser step | A green local run masking a red deployed branch |

Both are required and neither subsumes the other. An assertion that never runs against the deployed
revision is exactly the gap that let a local tip diverge from `origin/main` unnoticed; a gate that
runs specs which do not assert the mount would stay green while the panel was absent.

### Variation Axes

- **Axis 1 — what is asserted versus where it is asserted.** This is the axis that forced two implementations. The spec can only assert what a selector should exist; only the deploy gate can assert it against the revision that actually publishes. The original defect lived precisely in the gap between them: the wiring existed on a local tip and not on `origin/main`.
- **Axis 2 — how a missing mount surfaces.** Fixed, not variable. It surfaces as a failing assertion naming the absent selector, not as a timeout. That distinction is load-bearing: the packet's own report records that a fix validated against the thirty-second timeout alone clears one test of six, because a timeout tells you nothing about WHICH selector is missing.
- **Axis deliberately NOT taken — having the gate report its ownership split.** Enumerated as open question 3 and recorded as NOT adopted. It would change how every red run is read, not only this one, so its blast radius is wider than this packet. The split for this run is recorded in `report.md` instead; generalising it remains available and unclaimed.

## Mechanism

The six failing tests wait for three selectors. None of the three exists on the deployed
page. Playwright reports the absence twice over, in two shapes that read as different bugs:

- Five tests use `expect(locator).toHaveAttribute(...)`, whose default budget is five
  seconds. They report `element(s) not found` after 5000ms.
- One test reads `locator.textContent()` directly with no assertion wrapper, so it inherits
  the thirty-second test budget and reports `Test timeout of 30000ms exceeded … waiting for
  locator('[data-rl-value="combinedFederalLeg"]')`.

The second shape is the more quotable error, and it is the one a reader is most likely to
carry away. Treating it as *the* symptom is a trap: it names one selector out of three, and a
fix validated against it alone leaves five tests red. The accessibility snapshot embedded in
each `error-context.md` settles the matter — all six show a page containing only the
single-jurisdiction settlement region, with no combined region at all.

## Isolating What Is Absent From What Is Present

Three things could each explain the failures, and only one of them is true here.

| Candidate | Status on the deployed branch | Evidence |
|---|---|---|
| The computation module is missing | **Present**, and byte-identical to the local copy | blob `a24991f8c…` at both tips |
| The spec file is missing | **Present**, at an older revision | blob differs from local |
| The page wiring is missing | **Absent** | all four markers count zero |

So the remedy is narrower than the failure count suggests. Nothing needs to be computed,
ported, or rewritten. The markup and the script tag that mount an already-deployed module are
what is gone.

## Why It Was Not Noticed

The condition is invisible to every check that runs before the gate.

- A merge that discards one side of a file produces no conflict and no diagnostic. It is a
  successful merge by git's definition.
- `node scripts/selftest.mjs` passes on the deployed branch. It asserts model and registry
  properties, not that a page mounts a panel.
- The gate itself does report the failure, correctly and loudly. But it reports thirty-one
  failures spanning four unrelated owners, and the six that belong here are outnumbered five
  to one by failures with a different cause. The signal exists; it is buried.
- The failure notification opens or updates a single issue for the whole run, so eleven
  consecutive red runs do not produce eleven distinct prompts.

## The Loss Is Recurrent, Not Singular

This is the finding that changes the remedy. The wiring was not forgotten — it was written,
committed, and then removed by merge on four separate occasions.

| Commit | Kind | Markers | Note |
|---|---|---|---|
| `c58719fb4` | ordinary | 2 | introduced the wiring; its parent carries 0 |
| `612382ddf` | merge | 0 | parents carried 2 and 0; result kept 0 |
| `a30410572` | merge | 0 | parents carried 2 and 0; result kept 0 |
| `e8235b996` | merge | 0 | parents carried 0 and 2; result kept 0 |
| `1e765338d` | merge | 0 | parents carried 0 and 2; result kept 0 |
| `4b087cf15` | merge base of the two tips | 0 | the shared ancestor still lacks it |

`c58719fb4` is an ancestor of the deployed branch. Its content is not. Four times a merge saw
one parent with the panel and one without, and kept the one without.

Two consequences follow. First, a description of this defect as *an implementation that was
never pushed* is wrong, and a remedy built on that description would look for an unpushed
commit that does not exist in that form. Second, restoring the wiring without addressing why
merges keep dropping it restores a value that the next merge may drop again — which is what
FR-016-006 exists to prevent.

## Why The Two Tips Now Disagree

The local line restored the wiring after the merge base; the remote line did not. The page is
a different blob at each tip — `8ffe66348…` locally against `4c64c6a2c…` remotely — while the
computation module is the same blob at both. The disagreement is confined to the one file
that mounts the panel.

## Remedy Options

These are enumerated, not chosen.

### Option A — Reconcile the branches

Bring the deployed branch to a resolution that carries the wiring. This is the smallest change
in content and the largest change in branch state. It is an operator decision and was placed
out of bounds for this filing.

**Consequence.** Clears the six failures. Leaves the twenty-five owned elsewhere untouched, so
the gate stays red until those are also resolved. Does nothing about recurrence.

### Option B — Reapply the wiring as a fresh commit on the deployed line

Treat the lost markup as new work and land it directly, rather than reconciling histories.

**Consequence.** Avoids a branch-topology decision. Duplicates content that already exists on
the local line, so the two lines must still be reconciled eventually or they will conflict on
exactly this file.

### Option C — Add a coherence check

Assert, before publication, that a spec file present on the branch has its selectors present
on the page it targets. This addresses FR-016-002 and FR-016-006 and addresses neither of the
first two options' content questions.

**Consequence.** Prevents the next silent recurrence. Does not clear the current redness.
Requires care in scoping: a naive check over every spec and every page is expensive and
noisy, and a check that fails on a known-open defect turns the suite red for unauthorised
work.

### What the remedy is not

It is not a change to `tests/lifetime-tax-combined.spec.mjs`. The tests are correct; they
describe behaviour the product is supposed to have. Relaxing them to pass against a page
without the panel would convert a true red into a false green.

## Open Questions For The Owner

1. **Which option, or which combination?** A and C are complementary. B and A are alternatives
   and choosing B without a plan for A defers a conflict on this exact file.
2. **Should the coherence check in Option C be built at all?** Four silent losses is evidence
   that something should notice. Whether the cost is proportionate is a judgement about how
   often this class of loss is expected to recur.
3. **Should the gate report its ownership split?** FR-016-003 states the property. Satisfying
   it changes how a red run is read by everyone, not just this packet's owner, so it is a
   shared decision rather than a local one.
4. **Does the spec-revision mismatch need separate handling?** The deployed branch runs a test
   title retired locally as a false claim. Reconciliation resolves it incidentally; Option B
   alone does not.
