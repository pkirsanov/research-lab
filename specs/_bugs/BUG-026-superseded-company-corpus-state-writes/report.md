# Report: BUG-026 — A Superseded Company Corpus Load Writes Current-Subject State

## Summary

This filing classifies `BUG018-STABILIZE-004` as an independent concurrency-integrity defect. BUG-018 repaired one synchronous apply paint; it did not define ownership across overlapping asynchronous loads. No product implementation or test changed in this filing.

## Completion Statement

Bug filing is complete. Delivery and certification are not claimed. A reversed-completion browser reproduction has not run in this filing session.

## Test Evidence

### Source Intent-Ownership Inspection

**Phase:** bug
**Command:** `grep -nE 'var (readingIntent|corpusStatus|committedEvents|authoredPlan|versionTree)|readingIntent \+=|var intent = readingIntent|corpusStatus =|committedEvents =|authoredPlan =|versionTree =|if \(intent !== readingIntent\)' company-intelligence-lab.html`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The output shows current-subject state assignments preceding the sole stale-intent comparison. It proves that the token does not guard those writes. It does not prove which visible field a reversed completion changes.

```text
748:            var corpusStatus = "pending";
751:            var committedEvents = null;
754:            var authoredPlan = null;
755:            var versionTree = null;
760:            var readingIntent = 0;
1573:                readingIntent += 1;
1591:                corpusStatus = "pending";
1593:                if (result.refusal) corpusStatus = standingCorpusStatus;
1629:                var intent = readingIntent;
1630:                corpusStatus = "pending";
1633:                        corpusStatus = outcomes.indexOf("loaded") >= 0 || outcomes.indexOf("cached") >= 0 ? "loaded" : "unavailable";
1640:                        if (intent !== readingIntent) return;
1656:                return loadOptionalJson(path, function (file) { committedEvents = file; });
1710:                    authoredPlan = null;
1711:                    versionTree = null;
1721:                versionTree = tree;
1722:                return loadOptionalJson(paths.authoredPlan, function (file) { authoredPlan = file; })
INTENT_OWNERSHIP_SCAN_EXIT=0
```

### Runtime Reproduction

**Phase:** bug
**Claim Source:** not-run

> **Uncertainty Declaration**
> **What was attempted:** The current-subject slots, all assignments, and the final `readingIntent` comparison were inspected. Existing BUG-018 focused browser checks were reviewed.
> **What was observed:** The final repaint is stale-intent guarded; earlier assignments are not. No committed case reverses two subject completion orders.
> **Why this is uncertain:** A concrete visible consequence depends on controlled overlap with distinguishable subject data.
> **What would resolve this:** Run the planned BUG-026 reverse-completion browser case before the fix, then rerun it after per-intent snapshot commit is implemented.
