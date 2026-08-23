# BUG-002 Scopes

**Layout:** single-file
**Mode:** bugfix-fastlane
**Planning status:** Initial bug-discovery handoff; final planning ownership is
`bubbles.plan` after `bubbles.design` resolves the compensation contract.

---

## Scope 1 - Preserve Full-Clear Tombstone Authority

**Status:** Not Started

### In Scope

- Correct the final pointer/tombstone cleanup transaction in `rlportfolio.js`.
- Correct the stale authority assertions in the existing foundation clear fault
  matrix without weakening its unfaulted control.
- Prove pointer-removal, active-tombstone-removal, and pre-final deletion faults.
- Preserve public generic data byte-for-byte.

### Out Of Scope

- New storage namespaces or schema versions.
- Changes to FR-151, category discovery, or controller reset semantics.
- Unrelated Scope 28 test-integrity changes already present in the worktree.

### Gherkin Scenarios

```gherkin
Scenario: SCN-B002-POINTER-FAULT-PRESERVES-AUTHORITY
  Given a populated durable workspace and a validated empty tombstone
  And every other personal category has reread empty
  When final pointer deletion throws
  Then the result is P008-CLEAR-PARTIAL and never Verified empty
  And the pointer resolves to the retained validated empty tombstone
  And public generic data is byte-identical

Scenario: SCN-B002-TOMBSTONE-FAULT-COMPENSATES
  Given a populated durable workspace and a validated empty tombstone
  When final active-tombstone deletion throws after pointer cleanup begins
  Then the result is P008-CLEAR-PARTIAL
  And compensation restores and rereads the authoritative pair
  And public generic data is byte-identical

Scenario: SCN-B002-EARLY-FAULT-RETAINS-PAIR-AND-RESIDUE
  Given a populated durable workspace and a validated empty tombstone
  When one pre-final declared deletion throws
  Then the faulted residue remains when it existed
  And the pointer and active tombstone remain authoritative
  And the assertion does not require exactly one surviving key
```

### Implementation Plan

1. `bubbles.design` finalizes the compensation and compensation-failure contract.
2. `bubbles.plan` converts this handoff into the final plan-owned test matrix and
   Definition of Done.
3. `bubbles.test` makes the pointer-fault case fail on the current source and
   removes the exactly-one-residue premise.
4. `bubbles.implement` applies the minimal compensating cleanup repair.
5. `bubbles.test` reruns the same focused row and the broader repository suite.
6. `bubbles.validate` owns certification and any terminal transition.

### Change Boundary

- Allowed implementation files: `rlportfolio.js` and the persistent
  `tests/portfolio-survival-foundation.spec.mjs` feature regression suite.
- Allowed planning file for this repair: this `scopes.md` only.
- Excluded surfaces: every other product source or test file, parent Feature 008
  artifacts, `report.md`, `state.json`, `uservalidation.md`, public data assets,
  storage namespace/version declarations, and configuration.
- Collateral cleanup is not implicit. Any required change outside the allowed
  files must be routed as a separate owned finding before implementation.

### Test Plan

Test Plan parity is exact: five persistent Test Plan rows map one-to-one to the
five `TP-B002-*` test items under Definition of Done. The three scenario rows
share one planned persistent fault-matrix `test()` title because that matrix
injects each fault independently; each row still asserts its own scenario
contract.

| Plan ID | Test Type | Category | Persistent file | Scenario and exact planned/existing `test()` title | Required behavior | Command | Authorship and execution state |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-B002-001 | Regression E2E (adversarial) | `e2e-ui` | `tests/portfolio-survival-foundation.spec.mjs` | `SCN-B002-POINTER-FAULT-PRESERVES-AUTHORITY` -> planned title `Regression: BUG-002 final cleanup faults preserve or compensate tombstone authority` | A pointer-deletion fault after all other personal categories reread empty returns named `P008-CLEAR-PARTIAL`, never reports Verified empty, leaves a pointer resolving to a validated empty tombstone with matching slot/generation/fingerprints/hash, and preserves public bytes. The assertion must fail against the current dangling-pointer behavior. | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 -g "Regression: BUG-002 final cleanup faults preserve or compensate tombstone authority"` | Planned replacement of the stale existing fault-matrix title in the persistent feature test; BUG-002 assertions are not authored or executed by this planning repair. |
| TP-B002-002 | Regression E2E | `e2e-ui` | `tests/portfolio-survival-foundation.spec.mjs` | `SCN-B002-TOMBSTONE-FAULT-COMPENSATES` -> planned title `Regression: BUG-002 final cleanup faults preserve or compensate tombstone authority` | An active-tombstone deletion fault after pointer cleanup begins returns named `P008-CLEAR-PARTIAL`; compensation restores and independently rereads the matching pointer/tombstone pair; no success payload appears; public bytes remain identical. | Same focused command as TP-B002-001. | Planned in the same persistent fault matrix; BUG-002 assertions are not authored or executed by this planning repair. |
| TP-B002-003 | Regression E2E | `e2e-ui` | `tests/portfolio-survival-foundation.spec.mjs` | `SCN-B002-EARLY-FAULT-RETAINS-PAIR-AND-RESIDUE` -> planned title `Regression: BUG-002 final cleanup faults preserve or compensate tombstone authority` | Each pre-final declared deletion fault returns a named partial result, retains the faulted residue when it existed, and keeps the independently validated pointer/tombstone pair authoritative without requiring an exactly-one-key residue set. | Same focused command as TP-B002-001. | Planned in the same persistent fault matrix; BUG-002 assertions are not authored or executed by this planning repair. |
| TP-B002-004 | Broader E2E regression | `e2e-ui` | `tests/portfolio-survival-foundation.spec.mjs` | Existing title `Regression: TP-03-06 full-personal clear empties every declared category and leaves the generic public cache byte-identical` | The unfaulted control independently rereads both final authority keys absent, all other personal categories empty, and public fingerprints unchanged before reporting cleared; the entire persistent Feature 008 browser suite remains green. | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1` | Existing persistent test and suite; not authored or executed by this planning repair. |
| TP-B002-005 | Repository regression | `functional` | `scripts/selftest.mjs` | Existing registered repository selftest | Registered Research Lab invariants remain green after the narrow source/test repair. | `node scripts/selftest.mjs` | Existing persistent check; not authored or executed by this planning repair. |

### Definition of Done

#### Core Items

- [ ] The compensation contract, including a stable honest result when restore
  or compensation reread fails, is resolved before implementation.
- [ ] Final pointer/tombstone cleanup behaves as one compensating transaction:
  no partial return presents a dangling pointer or unpointed tombstone as
  authoritative, and any claimed restored pair is independently reread and
  validated.
- [ ] A `cleared` result is derived only from independent reread proving the
  pointer and active tombstone absent, every other personal category empty,
  and every public fingerprint unchanged.
- [ ] `P008-CLEAR-PARTIAL`, the exact confirmation phrase, runtime-derived
  category enumeration, controller inspection, and parent FR-151 remain
  intact with no fallback clear path.
- [ ] `TP-B002-001` / `SCN-B002-POINTER-FAULT-PRESERVES-AUTHORITY`:
  Scenario-specific E2E regression tests for EVERY new/changed/fixed
  behavior are authored in the persistent feature test and pass; the
  adversarial pointer fault returns named partial, never Verified empty,
  preserves public bytes, and leaves a pointer resolving to the matching
  validated empty tombstone.
- [ ] `TP-B002-002` / `SCN-B002-TOMBSTONE-FAULT-COMPENSATES`: the persistent
  scenario assertion passes, proving an active-tombstone deletion fault
  returns named partial and compensation restores and independently rereads
  the matching authoritative pair without a success payload or public-byte
  mutation.
- [ ] `TP-B002-003` / `SCN-B002-EARLY-FAULT-RETAINS-PAIR-AND-RESIDUE`: the
  persistent scenario assertion passes, proving the faulted pre-final
  residue survives when present, the pointer/tombstone pair remains
  authoritative, and no exactly-one-key residue assumption remains.
- [ ] `TP-B002-004`: Broader E2E regression suite passes, including the
  unfaulted verified-empty and public-byte-preservation control.
- [ ] `TP-B002-005`: the registered repository functional regression check
  passes after the narrow repair.
- [ ] Change Boundary is respected and zero excluded file families were changed.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero warnings and zero deferrals: the
  registered build-free repository checks are clean, exact packet artifact
  lint and traceability checks are clean, no unavailable build or formatter
  command is invented, and affected planning documentation remains aligned.

No Definition of Done item is claimed by this discovery packet.
