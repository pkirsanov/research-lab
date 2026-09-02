# BUG-026: A Superseded Company Corpus Load Writes Current-Subject State

**Status:** Reported. The write ordering is confirmed from source; a reversed-completion browser reproduction has not run.

**Severity:** Medium concurrency integrity impact.

**Origin:** `BUG018-STABILIZE-004`, raised while reviewing `specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact`.

**Route:** `company-intelligence-lab.html`

## Summary

`loadCorpus()` captures `readingIntent`, but the intent comparison occurs only after bar, event, plan, pointer, and version work completes. Before that comparison, the chain writes module-scope `corpusStatus`, `committedEvents`, `authoredPlan`, and `versionTree`.

When a later subject supersedes an earlier load, the final `run()` for the earlier intent is suppressed. Its earlier state writes are not. A later composition can therefore read current-subject slots populated by an older request chain.

BUG-018 corrects the synchronous subject-switch paint and pending claims. It does not define ownership for overlapping asynchronous completions. This finding is independent and is tracked here.

## Reproduction Contract

1. Start one corpus load for a subject with committed event or research-record data.
2. Before that load completes, apply a different valid subject.
3. Hold both subjects' route-owned responses and release the newer subject first.
4. Release the older subject last.
5. Inspect the rendered identity, readiness, event/plan/version surfaces, and current-subject module state.

No current browser receipt reverses the completion order. The source path establishes pre-guard writes; the user-visible consequence remains to be executed.

## Expected Behavior

Only the latest `readingIntent` may commit current-subject module state or repaint the route. Superseded work may populate immutable path- or symbol-keyed caches, but it must not change the current subject's `corpusStatus`, event set, authored plan, or version tree.

## Actual Behavior

The final repaint is guarded, but module-state writes occur before the guard and can survive a superseded load.

## Root Cause

The load chain uses module-scope slots as working memory. The intent token protects only the final `run()`. It does not protect the assignments performed by `loadCorpus()`, `loadEvents()`, or `loadResearchRecord()` while the chain is still in flight.

## Independent Classification

BUG-018's FR-018-004 concerns the synchronous `data-corpus-status` value during one apply. BUG-026 concerns ownership across two overlapping asynchronous loads and four module-state slots. It needs a reversed-completion scenario and an atomic commit design not declared by BUG-018.

## Related

- `specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact/`
- `specs/025-company-multi-horizon-intelligence-lab/`
