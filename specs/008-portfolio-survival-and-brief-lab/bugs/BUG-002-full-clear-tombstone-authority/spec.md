# BUG-002 Expected Behavior Specification

## Problem Statement

Feature 008 uses a validated empty tombstone as the authority boundary for a
full-personal clear. The current final cleanup can return a partial result after
deleting that tombstone but before deleting its pointer. A named failure is not
sufficient when the remaining authority record points to missing bytes.

This bug specification narrows parent FR-151. It does not introduce a new clear
contract, storage namespace, or public-data policy.

### Single-Capability Justification

This bug repairs Feature 008's existing local full-personal clear capability
and its established pointer/tombstone authority contract. It adds no second
clear capability, provider, storage implementation, or reusable foundation.

## Requirements

### FR-B002-001 - Partial clear preserves tombstone authority

After a tombstone has committed, every partial outcome MUST leave a pointer and
active `ClearTombstone/v1` that independently reread and validate as one pair.
The pointer and tombstone MUST agree on slot, generation, semantic fingerprint,
and content hash.

### FR-B002-002 - Final pair cleanup is compensating

Final pointer/tombstone removal MUST be treated as one compensating transaction.
The implementation MUST NOT return a partial outcome with a dangling pointer or
an unpointed tombstone presented as authoritative.

A source repair that only reverses the two existing remove calls does not meet
this requirement. Failure of the second call must restore and verify the
committed pair before the function returns.

### FR-B002-003 - Success derives from reread

The function MUST report `cleared` only after independent reread proves both
the pointer and active tombstone absent, every other personal category empty,
and every public fingerprint unchanged.

### FR-B002-004 - Partial failure stays named

A final cleanup failure MUST return `P008-CLEAR-PARTIAL` with a stable reason.
The repair MUST NOT convert a fault into success, suppress the failure, or add a
fallback clear path.

### FR-B002-005 - Public assets remain byte-identical

The full-personal clear and every partial arm MUST preserve the public generic
cache, public bar caches, provider capability settings, public watchlist, and
tool registry exactly as required by the parent feature.

### FR-B002-006 - Regression assertions follow authority, not residue count

The browser regression MUST NOT require exactly one declared key to survive
every fault arm. It MUST inspect the transaction phase and assert:

- the specifically faulted residue survives when that key existed;
- no success payload is shown;
- the pointer resolves to a validated active tombstone after every partial
  outcome following tombstone commit; and
- the unfaulted control removes both final keys and reports verified empty.

### FR-B002-007 - The parent contract is not weakened

FR-151 and the parent Full Clear Transaction remain authoritative. The repair
MUST NOT weaken runtime-derived category enumeration, controller inspection,
independent reread, public fingerprinting, or the exact confirmation phrase.

## Acceptance Scenarios

```gherkin
Scenario: Pointer deletion fails after all other personal categories clear
  Given a populated durable workspace and public generic data
  And the validated empty tombstone has committed
  And every non-tombstone personal category has independently reread empty
  When final pointer removal fails
  Then the clear returns P008-CLEAR-PARTIAL with a named final-cleanup reason
  And the pointer still resolves to a validated empty tombstone
  And public generic data is byte-identical
  And the product does not report Verified empty

Scenario: Active tombstone deletion fails after pointer removal begins
  Given a populated durable workspace and a committed empty tombstone
  When the final cleanup cannot delete the active tombstone
  Then the clear returns P008-CLEAR-PARTIAL
  And compensating storage restores and verifies the pointer/tombstone pair
  And the product does not report Verified empty

Scenario: A pre-final category deletion fails
  Given a populated durable workspace and a committed empty tombstone
  When one old slot or other declared personal key cannot be deleted
  Then the clear returns a named partial failure
  And the faulted residue remains when it existed
  And the pointer and active tombstone also remain authoritative
  And the test does not require an exactly-one-key residue set
```

## Parent Contract Alignment

This packet restores `SCN-008-043` and `FR-151`. It changes no product
principle, release claim, configuration, public-data source, or investment
decision behavior.
