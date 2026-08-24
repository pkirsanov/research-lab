# Design: BUG-002 Full-Clear Tombstone Authority

## Design Brief

### Current State

`commitClearTombstone()` writes and verifies canonical tombstone and pointer
bytes. It returns only the active slot and key.

`clearAllPersonalData()` protects both keys during the early personal-data
sweep. It then removes the tombstone before the pointer.

A pointer removal fault can therefore leave a pointer that names absent bytes.
The current catch returns a named partial result without repairing authority.

### Target State

Treat final pointer and tombstone cleanup as one compensating transaction.
Preserve the exact committed bytes until the whole clear verifies.

Delete the pointer first. Delete the tombstone only after reread proves the
pointer absent. Restore and verify the committed pair before any partial return.

### Patterns To Follow

- Extend `commitClearTombstone()` in `rlportfolio.js` to return the exact bytes
   it already canonicalizes and verifies.
- Reuse `pointerResult()` and `validateClearTombstone()` for pair validation.
- Follow `commitDurable()` by saving authoritative bytes before mutation and
   rereading storage after a compensating write.
- Keep `failure()`, `clearFailure()`, and `clearResult()` as the result-shaping
   primitives.

### Patterns To Avoid

- Do not reverse the two `removeItem()` calls without compensation. That only
   moves the non-authoritative failure window.
- Do not infer deletion from a returned `removeItem()` call. Reread each key.
- Do not require early sweep faults to delete later keys. The sweep aborts on
   its first thrown removal.
- Do not expose saved storage bytes or caught exception text in any result.

### Resolved Decisions

- Preserve canonical pointer and tombstone bytes in invocation memory.
- Remove the pointer before the active tombstone.
- Verify pointer absence before removing the active tombstone.
- Restore the tombstone before restoring the pointer.
- Verify exact bytes, schema, and cross-record identity after restoration.
- Keep `FullClearResult/v1` unchanged.
- Keep `tombstone-delete-failed` for a compensated final delete fault.
- Use closed, non-recoverable reasons for compensation write and verification
   failure.

### Open Questions

None. The implementation and test owners can proceed from this contract.

## Purpose And Scope

This design narrows parent FR-151 and implements FR-B002-001 through
FR-B002-007. It changes only the in-flight full-personal clear transaction.

The repair affects `commitClearTombstone()` and `clearAllPersonalData()` in
`rlportfolio.js`. The focused browser matrix remains in
`tests/portfolio-survival-foundation.spec.mjs`.

The design does not add a storage namespace, schema version, public endpoint,
configuration value, or user-visible success state. It does not change the
exact confirmation phrase or the personal category registry.

## Architecture

### Authority Invariant

After tombstone commit, an authoritative retained state contains both records:

1. `pointerKey` contains the canonical committed pointer bytes.
2. `activeKey` contains the canonical committed `ClearTombstone/v1` bytes.
3. The pointer names `activeSlot`, which resolves to `activeKey`.
4. Pointer generation equals `tombstone.workspace.generation`.
5. Semantic fingerprints and content hashes match across both records.
6. Both records independently reread and pass their existing validators.

An absent final state is authoritative only when independent reads return
`null` for both keys. Intended writes and deletes never establish either state.

### Saved Authority Snapshot

Extend the internal success value from `commitClearTombstone()` with these
invocation-only fields:

```text
CommittedClearAuthority {
   activeSlot,
   activeKey,
   pointerKey,
   pointerBytes,
   tombstoneBytes,
   generation,
   semanticFingerprint,
   contentSha256
}
```

`pointerBytes` is the exact canonical string already assigned to
`pointerKey`. `tombstoneBytes` is the exact canonical string already assigned
to `activeKey`.

The helper must return these values only after its existing reread succeeds.
The snapshot stays in memory for the current clear invocation. It is never
stored in `FullClearResult/v1`, diagnostics, logs, or the UI.

### Private Authority Procedure

Use one private `ensureCommittedClearAuthority()` procedure inside the existing
storage foundation. Four post-commit branches require the same protocol, so a
single procedure prevents order and validation drift.

The procedure first rereads the pointer and tombstone. It returns success
without writing when the exact committed pair remains valid.

If that check fails, the procedure compensates in this order:

1. Write `tombstoneBytes` to `activeKey`.
2. Reread `activeKey` and require exact byte equality.
3. Parse the bytes and run `validateClearTombstone()`.
4. Write `pointerBytes` to `pointerKey` only after step 3 succeeds.
5. Reread both keys and require exact byte equality.
6. Parse the pointer and run `pointerResult()`.
7. Recheck slot, generation, semantic fingerprint, and content hash links.

Writing the tombstone first prevents compensation from creating a new dangling
pointer. The procedure returns only `retained` or `restored` internally. These
states are not added to the public result contract.

### Clear Ordering

The clear transaction keeps parent steps 1 through 8 unchanged. The final
steps use this order:

1. Before every early partial return, run the authority procedure.
2. Remove `pointerKey` first.
3. Reread `pointerKey` and require `null`.
4. Remove `activeKey` only after step 3 succeeds.
5. Reread `activeKey` and `pointerKey` and require both `null`.
6. Run the existing final reserved-key scan and public fingerprint check.
7. Return `cleared` only after every final check succeeds.

The block is synchronous and contains no yield. Another local step cannot
observe the temporary unpointed tombstone inside this block.

Any failure in steps 2 through 5 runs the authority procedure. A verified
restore returns the original final-delete reason. A failed restore uses a
compensation reason.

Any failure in step 6 also runs the authority procedure before returning
partial. This preserves the parent rule after a late residue, storage reread,
or public fingerprint failure.

### Fault-Class Behavior

| Fault class | State before fault | Required action | Allowed return state |
| --- | --- | --- | --- |
| Pointer delete fails or does not remove the key | The committed pair is present | Verify the pair. Restore it only if verification fails. | Named partial with a verified pair |
| Active tombstone delete fails or does not remove the key | The pointer is verified absent | Restore tombstone bytes, then pointer bytes, then verify both. | Named partial with a verified pair |
| Early old-key delete fails | The committed pair was excluded from the sweep | Verify the pair before returning. Restore it only if verification fails. | Named partial with a verified pair plus the faulted and any unreached residue |

An early deletion exception aborts the current sweep. The design does not claim
that keys ordered after the fault were deleted. Tests must not require an exact
survivor count for this class.

## Data Model And Storage

No persisted model changes. `ClearTombstone/v1`, the workspace pointer, and
`FullClearResult/v1` retain their current versions and fields.

`CommittedClearAuthority` is an internal invocation snapshot. It does not
create a new durable record or migration.

## API And Error Contract

### Closed Failure Taxonomy

This repair keeps all final-cleanup failures under `P008-CLEAR-PARTIAL`.

| Code | Reason | Condition | Recoverable | Permitted claim |
| --- | --- | --- | --- | --- |
| `P008-CLEAR-PARTIAL` | `clear-verification-failed` | An early delete, controller, registry, or category check failed and the pair verifies | `true` | Partial clear with retained authority |
| `P008-CLEAR-PARTIAL` | `tombstone-delete-failed` | Pointer or tombstone deletion failed, or absence did not verify, and compensation verifies | `true` | Partial clear with retained or restored authority |
| `P008-CLEAR-PARTIAL` | `final-verification-failed` | Final storage or public verification failed after both final deletes, and compensation verifies | `true` | Partial clear with restored authority |
| `P008-CLEAR-PARTIAL` | `tombstone-compensation-failed` | A compensating `setItem()` throws | `false` | Partial clear with authority unknown |
| `P008-CLEAR-PARTIAL` | `tombstone-compensation-verification-failed` | A compensation reread throws, differs, fails parsing, fails validation, or breaks a cross-record link | `false` | Partial clear with authority unknown |

Both final delete fault classes retain `tombstone-delete-failed`. This preserves
the current stable UI and regression premise.

The two compensation reasons are closed. The implementation must not collapse
them into `tombstone-delete-failed`, because that reason permits an authority
claim after verified compensation.

Compensation failures use `field: "storage"`. They use the existing error
contract with `valueEchoed: false`. They must not include exception messages,
keys, pointer bytes, tombstone bytes, or stored personal values.

`P008-CLEAR-UNDECLARED / undeclared-personal-category` remains unchanged. Its
post-commit return must pass through the same authority procedure.

### Safe Result Payload

Every post-commit failure may carry the existing `FullClearResult/v1` value.
The value must satisfy these rules:

- `status` is `partial`.
- `tombstoneCommitted` means the commit completed historically.
- `tombstoneCommitted` does not claim that authority remains available.
- `categoryResults` contains counts, emptiness flags, and safe residue hashes.
- `publicAfterFingerprint` is non-null only after a successful public reread.
- No result contains pointer bytes, tombstone bytes, raw residue, or exceptions.
- No failure result can reach the `Verified empty` UI state.

When compensation fails, the error reason and `recoverable: false` are the only
authority status. The payload must not claim a retained pair or final absence.

### Success Contract

Success keeps the existing `FullClearResult/v1` payload with `status: cleared`.
It requires all of these observations:

1. `pointerKey` independently rereads as absent.
2. `activeKey` independently rereads as absent.
3. Every other personal category rereads empty.
4. The controller contains its closed empty sentinel.
5. The final public fingerprint equals the pre-clear fingerprint.

No partial branch may reuse this success payload or success UI copy.

## UI And User-Visible Behavior

The page already displays `error.code + " · " + error.reason` on failure. No
new component or success copy is required.

The two compensation reasons therefore surface without exposing stored values.
Every failure keeps the error style and returns before workspace reopen or the
`Full personal data cleared` message.

## Security And Privacy

The saved authority snapshot contains personal tombstone bytes. Keep it inside
the synchronous clear invocation and release it when the call returns.

Do not write the snapshot to public caches, diagnostics, console output, test
messages, or `FullClearResult/v1`. Existing safe hashes remain the only residue
identifiers in the result.

Public generic cache bytes, provider settings, watchlist data, and tool registry
remain excluded from deletion. Compensation writes only the two private
authority keys.

## Configuration, Migration, And Rollout

No configuration or migration changes apply. The repair changes one browser
storage transaction and its persistent regression coverage.

Existing storage remains readable. The transaction uses the current pointer,
tombstone, and result contract versions.

## Observability And Failure Handling

This browser-only flow has no service trace or metrics workflow. The closed
error reason is the observable failure signal.

Tests must inspect raw storage independently. UI text alone cannot prove pair
authority or final absence.

Caught storage exceptions remain opaque. The design exposes the failed phase,
not browser or storage implementation text.

## Testing Strategy

| Requirement or scenario | Test type | Persistent location | Required assertion |
| --- | --- | --- | --- |
| SCN-B002 pointer delete fault | `e2e-ui` adversarial regression | `tests/portfolio-survival-foundation.spec.mjs` | `tombstone-delete-failed`, no success copy, exact pointer-to-tombstone authority, public bytes unchanged |
| SCN-B002 active tombstone fault | `e2e-ui` regression | `tests/portfolio-survival-foundation.spec.mjs` | Compensation restores tombstone then pointer, both reread valid, no success copy |
| SCN-B002 early old-key fault | `e2e-ui` regression | `tests/portfolio-survival-foundation.spec.mjs` | Faulted key remains, authority pair validates, and no exact survivor-count or later-key deletion claim is made |
| Compensation write and reread faults | `functional` regression | Existing Feature 008 privacy or foundation test surface | Closed compensation reason, `recoverable: false`, safe payload, and zero leaked bytes |
| Unfaulted full clear | `e2e-ui` regression | `tests/portfolio-survival-foundation.spec.mjs` | Both authority keys absent, all personal categories empty, public bytes unchanged, verified success copy |
| Repository invariants | `functional` | `scripts/selftest.mjs` | Registered Research Lab checks remain clean |

The focused browser matrix must classify each fault by transaction phase. A
final pointer or active-tombstone fault must leave exactly the verified pair.

An early old-key fault has a different contract. It must retain the faulted key
and the pair, but may also retain keys the aborted sweep never reached.

The compensation-failure test must fault restoration separately from the
original delete. Otherwise it cannot distinguish the original failure from a
failed repair.

## Alternatives And Tradeoffs

### Reverse The Existing Deletes Only

Rejected. Pointer-first order prevents a dangling pointer on the first fault,
but a second-call tombstone fault leaves an unpointed tombstone.

### Delete The Tombstone First

Rejected. This is the current order and permits a dangling pointer.

### Keep The Authority Pair After Every Successful Clear

Rejected. Parent FR-151 requires the final authority keys to reread absent on
success. Retaining the pair would weaken the existing success contract.

### Add A Storage Transaction Framework

Rejected. Browser storage has no atomic multi-key transaction here. One private
compensation procedure is sufficient for the existing two-key invariant.

### Single-Implementation Justification

This is a narrow repair inside the existing Feature 008 storage foundation.
There is one browser storage implementation and no new provider or shared
surface. A new capability layer would add indirection without reducing risk.

## Complexity Tracking

| Decision | Simpler alternative considered | Why rejected |
| --- | --- | --- |
| Save and compensate the exact committed pair | Reverse the two delete calls | Reversal leaves the second delete failure without authority. |
| Use one private authority procedure | Repeat restore and verification in each branch | Repetition could drift in write order or omit a cross-record check. |
| Add two compensation failure reasons | Reuse `tombstone-delete-failed` for every outcome | One reason would falsely imply that authority was restored and verified. |

## Risks And Open Questions

- A storage adapter can fail during compensation. The non-recoverable reasons
   report that authority is unknown without exposing bytes.
- A second browser context can mutate local storage between synchronous calls.
   Final rereads detect that race, then compensation restores the saved pair.
- The existing browser matrix has stale residue assumptions. `bubbles.plan` and
   `bubbles.test` must reconcile those assertions before implementation proof.
- Open questions: None.
