# Design: BUG-026 — Build Per-Intent Snapshots And Commit The Latest Atomically

## Root Cause Analysis

### Investigation Summary

The route records `readingIntent` and increments it on each apply. `loadCorpus()` captures the value and checks it before the final `run()`. The preceding callbacks nevertheless assign `corpusStatus`, `committedEvents`, `authoredPlan`, and `versionTree` directly. The token therefore guards rendering but not state mutation.

### Root Cause

Current-subject module state doubles as asynchronous working state. Because older and newer promise chains share those slots, completion order rather than intent order decides which values remain there.

### Impact Analysis

- Current subject identity can disagree with module slots populated by a superseded subject.
- A later render or publication can consume stale event, plan, version, or readiness state.
- Immutable caches keyed by symbol or path are not themselves unsafe; the defect is the unkeyed current-subject commit.

## Fix Design

### Capture Intent And Subject

At the start of `loadCorpus()`, capture both `intent` and `subjectTicker`. Pass the captured subject into every loader. No asynchronous callback derives its subject from mutable `currentTicker`.

### Return Values Instead Of Assigning Slots

Refactor route-owned loaders to return values:

- bar outcomes return a candidate corpus status;
- event loading returns the candidate event document or `null`;
- research-record loading returns a candidate authored plan and version tree.

The existing `committedBodies` and RLDATA bar caches remain keyed by path or symbol. They may accept completed immutable data from any intent.

### Atomic Current-Intent Commit

When the snapshot is complete, compare the captured token with `readingIntent`. If it differs, return without assigning a current-subject slot, rendering, or publishing. If it matches, assign `corpusStatus`, `committedEvents`, `authoredPlan`, and `versionTree` together, then call `run()` once.

The synchronous pending paint on apply remains unchanged. It establishes the new intent's provisional state before asynchronous work begins.

### Regression Design

A browser case must create two valid subject intents with controlled response gates. It releases the newer subject's corpus first, waits for that subject to settle, then releases the older subject's remaining responses. Assertions run after both chains settle and cover:

- rendered subject identity;
- body readiness and corpus status;
- event, plan, and version surfaces;
- the shared `RLDATA` publication subject id; and
- no page or unhandled-rejection errors.

The case needs distinct subject data so stale leakage is observable rather than tautological.

## Alternatives Considered

1. **Add an intent check before each existing assignment.** Rejected because it spreads ownership across callbacks and permits a partial commit when intent changes between checks.
2. **Abort every obsolete request.** Rejected as the sole fix because abort delivery is asynchronous and cache callbacks may already have completed. Commit ownership must remain correct even when cancellation loses the race.
3. **Clear all module state on each apply.** Rejected because it does not prevent the older chain from writing the cleared slots again later.

## Complexity Tracking

| Decision | Simpler fix considered | Why rejected |
| --- | --- | --- |
| Intent-local snapshot with one commit point | Guard each assignment separately | Separate guards can commit a mixed snapshot and are harder to audit under overlapping completions. |
