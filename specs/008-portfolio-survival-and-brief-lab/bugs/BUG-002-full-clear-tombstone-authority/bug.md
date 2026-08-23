# BUG-002 Full Clear Can Return Partial Without An Authoritative Tombstone

- **Filed at commit:** `648e0992b82066fe3e166d0ff38b068e64423f12`
- **Severity:** High - the full-personal privacy clear can lose its authoritative
  empty tombstone during a named partial failure.
- **Status:** Confirmed by current-source and contract inspection; runtime
  regression execution remains routed.
- **Workflow mode:** `bugfix-fastlane`
- **Parent feature:** `specs/008-portfolio-survival-and-brief-lab`
- **Discovery surface:** Scope 28 adversarial browser matrix.

## Summary

`clearAllPersonalData()` commits and verifies an empty tombstone, clears all
other personal categories, and then removes the active tombstone before it
removes the pointer. If active-tombstone removal succeeds and pointer removal
throws, the function returns `P008-CLEAR-PARTIAL / tombstone-delete-failed`
with a pointer that names a slot whose tombstone bytes have already been
deleted.

That state contradicts the parent design's Full Clear Transaction rule that
the tombstone stays authoritative after any partial deletion. It also violates
FR-151's requirement that a validated tombstone precede deletion and that any
residue produce a named partial failure without weakening the clear authority.

## Two Separate Findings

### Finding A - Stale Test Premise

The current browser row correctly expects
`P008-CLEAR-PARTIAL / tombstone-delete-failed`. Its remaining assumption is
wrong: it requires every faulted arm to leave exactly the faulted key and no
other declared foundation key.

That is not the transaction contract. A partial deletion before final cleanup
must retain the committed pointer and its active tombstone together. The
pointer bytes are also expected to change during tombstone commit because the
pointer must name the newly committed inactive slot and generation. Test
assertions must check authority and named residue, not byte identity or an
exactly-one-key residue count.

This is a planning/test defect. This packet does not edit the test.

### Finding B - Production Cleanup-Order Defect

The final cleanup uses one `try` block in this order:

1. remove the active tombstone key;
2. remove the pointer key;
3. return a named partial failure if either call throws.

When step 1 succeeds and step 2 throws, the surviving pointer is dangling.
The failure is named, but the tombstone is no longer authoritative. This is a
product defect independent of Finding A.

This packet does not edit production source.

## Reproduction Contract

1. Start from populated durable Feature 008 state.
2. Invoke the full-personal clear with the exact confirmation phrase.
3. Allow tombstone commit, all non-tombstone deletion, controller reset, and
   category verification to succeed.
4. Allow final active-tombstone removal to succeed.
5. Make final pointer removal throw.
6. Observe `P008-CLEAR-PARTIAL / tombstone-delete-failed`.
7. Read the pointer and the slot it names.

## Expected Behavior

Any partial outcome after tombstone commit leaves a verified pointer and a
verified `ClearTombstone/v1` pair that agree on active slot, generation,
semantic fingerprint, and content hash. Public generic assets remain
byte-identical. Full success is possible only after both final keys are absent
on independent reread.

## Actual Behavior

In the pointer-removal fault arm, the active tombstone is deleted first. The
pointer can then survive while naming a missing slot. The function returns a
partial result without repairing or re-verifying the authoritative pair.

## Root Cause

The implementation treats two authority-coupled keys as independent cleanup
calls. The catch block converts either exception into the correct public error,
but it has no compensating transaction and no post-failure authority check.
The call order therefore exposes one asymmetric failure window.

Reversing the two calls alone is insufficient. It would protect the pointer
fault arm, but an active-tombstone removal fault after successful pointer
removal would leave an unpointed tombstone. The minimal repair must preserve or
restore and reread the committed pointer/tombstone pair before returning a
partial outcome.

## Impact

- The privacy clear cannot prove its authoritative empty state in one storage
  fault arm.
- A later workspace open can encounter a pointer whose target is absent.
- No evidence in this packet establishes personal-data resurrection or loss;
  those outcomes remain unclaimed.
- The public cache preservation rule is unchanged.

## Ownership And Routing

- `bubbles.bug` owns this diagnosis and `bug.md`.
- `bubbles.design` must own the final compensating-transaction design.
- `bubbles.plan` must correct the authority-based scenario and DoD.
- `bubbles.test` must change or replace the stale browser assertion and prove
  the adversarial pointer-fault arm fails before the source repair.
- `bubbles.implement` must apply the minimal source repair only after those
  owned artifacts are ready.

The next required owner is `bubbles.design`. Status remains `in_progress`.

## Related Contracts

- Parent design: `design.md` section `One Clear Transaction`, steps 4-10.
- Parent requirement: `spec.md` FR-151.
- Current carrier: `tests/portfolio-survival-foundation.spec.mjs`, exact title
  `Regression: TP-03-06 every declared foundation clear step refuses success on its own and retains only its own key`.
