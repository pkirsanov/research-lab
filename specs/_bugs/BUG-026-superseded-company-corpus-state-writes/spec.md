# Spec: BUG-026 — Only The Latest Company Reading Intent Owns Current-Subject State

## Purpose

Overlapping corpus loads must have deterministic ownership. A load superseded by a later subject may finish, but it must not commit state that the current subject can render or publish.

## Product Principle Alignment

- **P2 — Missing data renders as missing.** The current subject must not inherit evidence, absence, or readiness from a different subject's obsolete work.
- **P12 — Cache-first, automatic first paint.** Subject changes still paint immediately from available cache. The correction governs asynchronous commit ownership rather than adding a network gate.

This packet describes current repair work. It does not claim latest-intent ownership is delivered.

## Requirements

### FR-026-001 — Every load captures immutable intent context

A corpus load must capture the intent id and subject identity it belongs to before issuing asynchronous work. Later callbacks must not consult a mutable subject id as their authority.

### FR-026-002 — Asynchronous work builds an intent-local snapshot

Corpus status, committed events, authored plan, and version tree must be assembled as values local to that intent. The load chain must not use the route's current-subject slots as intermediate storage.

### FR-026-003 — Current-subject state commits atomically

After the intent-local snapshot is complete, one intent comparison decides whether all current-subject slots are committed together. A superseded intent commits none of them and triggers no render or publication.

### FR-026-004 — Keyed immutable caches remain reusable

A superseded load may retain completed bodies in a cache keyed by immutable path or symbol. Such cache population must not change which subject owns the current reading.

### FR-026-005 — Reversed completion order is covered

A browser regression must start two subject loads, release the newer load first and the older load last, and prove the newer intent still owns identity, readiness, events, plan, version state, rendered copy, and shared publication.

### FR-026-006 — Refusals preserve standing state

A refused replacement subject still leaves the standing subject's state intact. The atomic intent design must not regress BUG-018 Scope 1.

## Acceptance Criteria

1. The newer subject remains rendered after an older request chain completes last.
2. No event, authored-plan, version-tree, readiness, or published-read field from the older subject appears under the newer subject.
3. A superseded load performs no current-subject assignment after its intent becomes stale.
4. Immutable keyed cache reuse remains available.
5. BUG-018 focused tests, the full Company Intelligence browser suite, unit suite, and repository selftest remain green.

## Non-Goals

- Cancelling obsolete network requests. Cancellation can complement ownership but is not needed to make late completion harmless.
- Removing committed-body or bar caches.
- Changing company identity resolution or corpus coverage.
- Changing BUG-018 pending and settled copy.

## Grounding

- `bug.md` — source-confirmed write ordering and independent classification.
- `company-intelligence-lab.html` — module-state slots, load chain, and final intent guard.
- `docs/Product-Principles.md` — P2 and P12.
