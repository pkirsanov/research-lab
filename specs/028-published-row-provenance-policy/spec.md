# Spec 028 — Published Row Provenance Policy

**Status:** not_started
**Filed by:** `bubbles.goal`, 2026-08-29, as the `spec-filed` disposition for a discovered issue in
[`specs/_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc`](../_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc/design.md)
§2.4.

## Purpose

Decide what policy governs a **published historical row changing value in place**, and implement
that policy in the bars ingestion path.

This is a design decision with defensible alternatives, not a defect with a single correct fix.
That is why it is a spec rather than a bug, and why BUG-012 explicitly declined to settle it: its
instruction was to stop adjusted-close values being written beside raw OHLC, and it did that.

## The Discovered Condition

`mergeRows` keys rows by timestamp and lets a fresh row overwrite an existing one:

```
162      byTimestamp.set(row.t, row);   // existing
165      byTimestamp.set(row.t, row);   // fresh — same key, silently replaces
```

During the BUG-012 investigation the COP close for `2026-08-13T13:30Z` was observed moving from
`124.5200` to `123.6950` **in place**. Nothing recorded that it moved, and **no consumer could
have detected it**.

## Why BUG-012 Did Not Close This

BUG-012 chose Option B — keep `o`/`h`/`l`/`c` raw — which makes an in-place value change far less
likely, because the most common cause was the adjusted-close arithmetic that Option B removes from
the write path.

Less likely is not prevented. The overwrite is still unconditional and still silent. BUG-012
recorded this as a separate decision rather than absorbing it, which was correct: a bug packet that
quietly expands into an unrelated contract change is how scope creep is laundered into a fix.

## What Must Be Decided

| Question | Why it is not obvious |
|---|---|
| Is a published row immutable, or may it be corrected? | Vendors do restate. An immutable corpus preserves auditability but can preserve a known-wrong number. |
| If it may be corrected, what records that it changed? | A change no consumer can detect is indistinguishable from data corruption. |
| Does a consumer need to detect a correction, or only an auditor? | The answer sets whether provenance lives in the row, in a sidecar, or in an append-only log. |
| Does this extend beyond bars to every committed data corpus? | Bars is where it was observed; the same `set`-by-key shape may exist elsewhere. |

## Explicitly Out Of Scope Until The Decision Is Made

No implementation should be attempted before the policy question above is answered by the owner.
Choosing a mechanism first would settle the policy by accident, which is the failure mode this
packet exists to avoid.

## Grounding

- [`specs/_bugs/BUG-012-.../design.md`](../_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc/design.md) §2.4 — the observed condition and the line references
- [`specs/_bugs/BUG-012-.../report.md`](../_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc/report.md) — the round that discovered it and declined to settle it
