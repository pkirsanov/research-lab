# Design — Published Row Provenance Policy

**Status:** not_started. This document records what is already known so the decision can be made
from evidence rather than re-derived. It deliberately does **not** choose a mechanism.

## What Is Established

The overwrite is real and was observed, not inferred. `mergeRows` builds a `Map` keyed by row
timestamp and writes both existing and fresh rows into it with `set`, so a fresh row for an
already-published timestamp replaces the published one with no comparison, no record and no signal.

## What Is Not Established

Whether the observed COP movement was a vendor restatement, a vendor error, or an artefact of the
adjusted-close arithmetic BUG-012 removed. This matters: if every observed in-place change was
caused by that arithmetic, the remaining exposure is narrow. If vendors restate independently, it
is not.

**This question must be answered before a mechanism is chosen.** Measuring it is cheap — replay the
ingestion path against the committed corpus and count how many timestamps would change value — and
choosing a mechanism without it would be choosing in the dark.

## Option Sketches (not a decision)

| Option | Shape | Cost |
|---|---|---|
| **Immutable rows** | Refuse any write to an already-published timestamp | Preserves a known-wrong value forever; needs a separate correction channel |
| **Overwrite with an append-only change log** | Keep the current write, record `(t, old, new, observedAt)` | Auditable; consumers still cannot detect a change without reading the log |
| **Versioned rows** | A published row carries a revision counter | Consumer-detectable; largest contract change |
| **Refuse-and-alert** | Overwrite is an error the ingestion surfaces rather than absorbs | Cheapest to implement; turns a silent condition into an operational one |

Each is defensible. That is precisely why this is an owner decision and not an implementation task.

## Constraint Inherited From BUG-012

Whatever is chosen must not reintroduce adjusted-close values into `o`/`h`/`l`/`c`. BUG-012's
INV-012B invariants and its committed coherence scan (`validate-bars-coherence.mjs`) remain binding
and must continue to pass.
