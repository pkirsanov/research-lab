# BUG-002 Diagnostic Design Handoff

**Ownership status:** `route_required` to `bubbles.design`.

This file records grounded design inputs produced during bug discovery. It is
not a validate-owned certification and does not authorize source changes.

## Root Cause Analysis

### Transaction Path

`commitClearTombstone()` selects the inactive workspace slot, writes and
validates `ClearTombstone/v1`, writes the pointer to that slot, rereads both,
and returns the active key. `clearAllPersonalData()` then excludes that active
key and the pointer while it removes and verifies every other personal
category.

After those checks pass, final cleanup calls:

1. `removeItem(activeKey)`;
2. `removeItem(pointerKey)`.

Both calls share one catch block. The catch emits
`P008-CLEAR-PARTIAL / tombstone-delete-failed`, but does not restore either key
and does not verify whether the surviving pointer resolves.

### Root Cause

The implementation has a two-key authority invariant but a non-transactional
two-call cleanup. Its failure handler preserves the error identity while
discarding the state invariant. A pointer-removal exception after successful
active-key removal therefore leaves a dangling pointer.

### Why The Test Finding Is Different

The browser matrix assumes every fault arm leaves only the faulted key. That
assumption conflicts with the parent design before the production cleanup bug
is considered. During a partial deletion, the pointer and active tombstone are
supposed to remain together. The test must be corrected to assert authority,
but that correction cannot make the dangling-pointer production arm valid.

## Expected Minimal Repair

The final design should make the smallest change that establishes these
properties:

1. Preserve the committed pointer bytes and validated tombstone bytes through
   final cleanup.
2. Attempt final removal in an order that does not delete the tombstone before
   a pointer-removal fault can be known.
3. If the second removal fails, restore the committed pointer/tombstone pair.
4. Reread and validate the restored pair before returning partial.
5. Reread both keys as absent before returning success.
6. Return a distinct named partial reason if compensation or compensation
   verification itself fails; never claim authority that was not reread.

The likely minimal implementation is pointer-first removal plus pointer
restoration when active-tombstone removal fails. `bubbles.design` must decide
the exact compensation failure contract before implementation.

## Rejected Surface Fixes

### Reverse The Two Calls Only

Rejected as incomplete. It protects the pointer-removal fault arm but moves the
asymmetric failure window to active-tombstone removal after pointer deletion.

### Change Only The Browser Expectation

Rejected. Removing the exactly-one-key assertion corrects the stale test
premise, but the current pointer-fault arm would still leave a dangling pointer.

### Swallow The Final Cleanup Failure

Rejected. Parent FR-151 requires a named partial failure for residue and the
design forbids success based only on intended delete calls.

## Impact Analysis

- **Source owner:** `rlportfolio.js`, `clearAllPersonalData()` final cleanup.
- **Test owner:** `tests/portfolio-survival-foundation.spec.mjs` fault matrix.
- **Contract owner:** no parent contract change expected.
- **Persistence:** local browser storage only.
- **Public assets:** must remain byte-identical.
- **Migration:** none expected because the repair governs an in-flight clear.

## Open Design Decision

Define the stable error reason and safe result shape when compensation cannot
restore or reread the pointer/tombstone pair. The design must report that loss
honestly without claiming an authoritative tombstone.

## Complexity Tracking

| Decision | Simpler fix considered | Why rejected |
| --- | --- | --- |
| Compensating final cleanup | Reverse the two remove calls | Reversal alone leaves the opposite second-call failure non-authoritative. |
