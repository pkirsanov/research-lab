# BUG-002 Scopes

**Layout:** single-file
**Mode:** bugfix-fastlane
**Packet status:** `in_progress` (preserved; this planning reconciliation does
not transition packet or scope execution status)
**Next owner:** `bubbles.test` for scenario-first persistent regression
authorship; `bubbles.implement` remains blocked until those regressions fail on
the current source for the expected BUG-002 reasons.

No test, implementation, or verification result is claimed by this plan.

---

## Execution Outline

### Phase Order

1. **Scenario-first regression authorship (`bubbles.test`)** - Add the six exact
   persistent test cases below in
   `tests/portfolio-survival-foundation.spec.mjs`, preserving every unrelated
   Scope 28 worktree hunk, and prove the current source fails the new cases for
   the intended authority-contract gaps.
2. **Compensating transaction repair (`bubbles.implement`)** - Change only
   `rlportfolio.js` to retain the committed bytes, centralize authority restore
   and validation, apply pointer-first final deletion, and return the closed
   compensation failure reasons.
3. **Focused and broader verification (`bubbles.test`)** - Rerun every exact
   BUG-002 title, the complete Feature 008 browser regression file, and the
   registered repository selftest without weakening assertions.
4. **Certification (`bubbles.validate`)** - Inspect current-session evidence
   and own any DoD or status transition after every planned row passes.

### New Types And Signatures

- Internal invocation value:
  `CommittedClearAuthority { activeSlot, activeKey, pointerKey, pointerBytes,
  tombstoneBytes, generation, semanticFingerprint, contentSha256 }`.
- Extended internal return:
  `commitClearTombstone(...) -> CommittedClearAuthority` only after its existing
  independent reread succeeds.
- Private procedure:
  `ensureCommittedClearAuthority(committedAuthority) -> retained | restored`;
  it writes tombstone bytes before pointer bytes and verifies exact bytes,
  schemas, and cross-record identity.
- No persisted schema, public result shape, configuration value, endpoint, or
  user-visible success copy changes.

### Validation Checkpoints

- Checkpoint A blocks implementation until all six exact persistent test
  titles exist and the new adversarial cases fail against the current source.
- Checkpoint B blocks broad verification until the focused six-title run passes
  against the implementation repair.
- Checkpoint C blocks certification until the complete Feature 008 browser file,
  repository selftest, packet artifact lint, traceability guard, and capability
  guard pass.

| Scope | Outcome | Future owned paths | Dependency | Status |
| --- | --- | --- | --- | --- |
| 1 | Preserve or restore authority on every partial arm and prove absence before success | `tests/portfolio-survival-foundation.spec.mjs` (`bubbles.test`), then `rlportfolio.js` (`bubbles.implement`) | Scenario-first tests -> implementation -> focused/broad retest -> validation | Not Started |

---

## Scope 1 - Preserve Full-Clear Tombstone Authority

**Status:** Not Started
**Depends On:** None; `spec.md` and `design.md` are finalized at checkpoint
`8c18fc44f`.
**Execution dependency:** `bubbles.test` -> `bubbles.implement` ->
`bubbles.test` -> `bubbles.validate`.

### In Scope

- Correct the final pointer/tombstone cleanup transaction in `rlportfolio.js`.
- Correct the stale authority assertions in the existing foundation clear fault
  matrix without weakening its unfaulted control.
- Prove pointer-delete, active-tombstone-delete, early old-key-delete,
  compensation-write, compensation-verification, and unfaulted success arms.
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
  When one early old-key deletion throws
  Then the faulted residue remains when it existed
  And the pointer and active tombstone remain authoritative
  And the assertion does not require exactly one surviving key
```

### Required Transaction Matrix Arms And Control

These are explicit test variants of the three stable Gherkin scenarios above,
not additional scenario-manifest entries:

- **Compensation write failure arm** - Extend
  `SCN-B002-TOMBSTONE-FAULT-COMPENSATES` by faulting the compensating tombstone
  and pointer writes separately. Each arm must return
  `tombstone-compensation-failed`, `recoverable: false`, and `field: storage`,
  make no retained-authority or success claim, and expose no key, saved bytes,
  stored value, or exception text.
- **Compensation verification failure arm** - Extend
  `SCN-B002-TOMBSTONE-FAULT-COMPENSATES` after compensating writes return. Cover
  reread throw, byte mismatch, parse/schema rejection, validator rejection, and
  broken cross-record identity. Each arm must return
  `tombstone-compensation-verification-failed`, `recoverable: false`, and
  `field: storage`, make no retained-authority or success claim, and expose no
  raw storage detail.
- **Unfaulted success control** - Run beside the three fault scenarios. Require
  independent `null` reads for pointer and active tombstone, every other
  personal category empty, the controller closed sentinel present, and the
  public fingerprint unchanged before the cleared result or verified success
  copy can appear.

### Implementation Plan

1. `bubbles.test` owns
  `tests/portfolio-survival-foundation.spec.mjs`. It adds the six exact
  `test()` titles in the Test Plan, injects each fault at its named transaction
  phase, and records red-before-repair evidence. It must preserve unrelated
  Scope 28 modifications already present in that shared file.
2. `bubbles.implement` owns `rlportfolio.js` after step 1. It extends
  `commitClearTombstone()` to return the exact committed pointer and tombstone
  bytes plus their identity fields, only after the existing reread validates.
3. `bubbles.implement` adds one private
  `ensureCommittedClearAuthority()` procedure. The procedure first accepts an
  exact valid pair without writing; otherwise it restores `activeKey` before
  `pointerKey`, independently rereads both, and validates byte equality,
  schemas, slot, generation, semantic fingerprint, and content hash.
4. `bubbles.implement` routes every post-commit early partial arm through the
  authority procedure. An early old-key exception retains its named residue,
  may leave later sweep keys unreached, and must not imply an exact survivor
  count.
5. `bubbles.implement` changes final cleanup to remove `pointerKey`, verify its
  absence, remove `activeKey`, and then independently verify both absent.
  Pointer or active-tombstone delete faults that compensate successfully keep
  `tombstone-delete-failed`.
6. `bubbles.implement` maps a compensating `setItem()` throw to
  `tombstone-compensation-failed` and every compensation reread, byte,
  parse/schema, validator, or cross-record failure to
  `tombstone-compensation-verification-failed`. Both are non-recoverable,
  use `field: "storage"`, and expose no authority bytes or exception text.
7. `bubbles.implement` retains the existing final reserved-key scan, controller
  closed-sentinel inspection, and public fingerprint comparison. A late final
  verification fault compensates before returning; success is shaped only
  after independent reads prove both authority keys absent.
8. `bubbles.test` reruns the six exact tests, the complete persistent Feature
  008 browser file, and `node scripts/selftest.mjs`. `bubbles.validate` owns
  evidence acceptance and any later status transition.

### Owner And Path Handoff

| Order | Owner | Owned path | Dependency and deliverable |
| --- | --- | --- | --- |
| 1 | `bubbles.test` | `tests/portfolio-survival-foundation.spec.mjs` | Depends on this finalized plan; authors all six exact persistent titles and proves the adversarial rows fail before implementation. |
| 2 | `bubbles.implement` | `rlportfolio.js` | Depends on order 1 red evidence; implements the saved authority snapshot, shared restore/verify procedure, final ordering, and closed failure taxonomy. |
| 3 | `bubbles.test` | `tests/portfolio-survival-foundation.spec.mjs`, read-only execution of `scripts/selftest.mjs` | Depends on order 2; makes no assertion weaker and proves focused plus broader behavior. |
| 4 | `bubbles.validate` | Certification/evidence surfaces only | Depends on every Test Plan row passing; owns certification and status, not this planning invocation. |

### Change Boundary

- Allowed implementation files: `rlportfolio.js` and the persistent
  `tests/portfolio-survival-foundation.spec.mjs` feature regression suite.
- Allowed planning file for this repair: this `scopes.md` only.
- This `bubbles.plan` invocation must not edit
  `tests/portfolio-survival-foundation.spec.mjs`; its current unrelated Scope 28
  worktree changes are protected. The future `bubbles.test` owner must reconcile
  against those hunks without overwriting or attributing them to BUG-002.
- Excluded surfaces: every other product source or test file, parent Feature 008
  artifacts, `report.md`, `state.json`, `uservalidation.md`, public data assets,
  storage namespace/version declarations, and configuration.
- Collateral cleanup is not implicit. Any required change outside the allowed
  files must be routed as a separate owned finding before implementation.

### Test Plan

Test Plan parity is exact: eight persistent Test Plan rows map one-to-one to the
eight `TP-B002-*` test items under Definition of Done. The six focused titles
are deliberately separate so each transaction phase, fail-closed matrix arm,
and success control can fail independently. No row is authored or executed by
this planning change.

| Plan ID | Test Type | Category | Live system | Persistent file | Scenario and exact planned/existing `test()` title | Required behavior | Command | Authorship and execution state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-B002-001 | Regression E2E (adversarial) | `e2e-ui` | Yes | `tests/portfolio-survival-foundation.spec.mjs` | `SCN-B002-POINTER-FAULT-PRESERVES-AUTHORITY` -> planned title `Regression: BUG-002 pointer-delete fault retains verified tombstone authority` | Inject thrown and no-removal pointer-delete variants after all other personal categories reread empty. Require `P008-CLEAR-PARTIAL` / `tombstone-delete-failed`, no success payload or copy, exact pointer-to-tombstone validation across slot/generation/fingerprint/hash, and byte-identical public data. The row must fail against the current dangling-pointer behavior. | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 -g "Regression: BUG-002 pointer-delete fault retains verified tombstone authority"` | Planned for `bubbles.test`; not authored or executed here. |
| TP-B002-002 | Regression E2E (adversarial) | `e2e-ui` | Yes | `tests/portfolio-survival-foundation.spec.mjs` | `SCN-B002-TOMBSTONE-FAULT-COMPENSATES` -> planned title `Regression: BUG-002 active-tombstone-delete fault restores the committed authority pair` | Inject thrown and no-removal active-tombstone-delete variants after pointer absence verifies. Require tombstone-first then pointer compensation, exact independent pair rereads and validation, `tombstone-delete-failed`, no success payload or copy, and unchanged public bytes. | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 -g "Regression: BUG-002 active-tombstone-delete fault restores the committed authority pair"` | Planned for `bubbles.test`; not authored or executed here. |
| TP-B002-003 | Regression E2E (adversarial) | `e2e-ui` | Yes | `tests/portfolio-survival-foundation.spec.mjs` | `SCN-B002-EARLY-FAULT-RETAINS-PAIR-AND-RESIDUE` -> planned title `Regression: BUG-002 early old-key delete fault keeps phase-accurate residue and authority` | Fault an old slot that exists before the final pair cleanup. Require the faulted key to remain, independently validate the retained pair, preserve public bytes, reject success, and avoid any exact survivor-count or later-key deletion premise after the sweep aborts. | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 -g "Regression: BUG-002 early old-key delete fault keeps phase-accurate residue and authority"` | Planned for `bubbles.test`; not authored or executed here. |
| TP-B002-004 | Functional regression (adversarial) | `functional` | No | `tests/portfolio-survival-foundation.spec.mjs` | `SCN-B002-TOMBSTONE-FAULT-COMPENSATES` compensation-write arm -> planned title `Regression: BUG-002 compensation write failure is non-recoverable and value-safe` | Trigger a final delete fault, then separately fault compensating `setItem()` for each restore phase. Require `tombstone-compensation-failed`, `recoverable: false`, `field: storage`, no retained-authority claim, no success payload/copy, and no raw key, bytes, value, or exception leakage. | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 -g "Regression: BUG-002 compensation write failure is non-recoverable and value-safe"` | Planned for `bubbles.test`; not authored or executed here. |
| TP-B002-005 | Functional regression (adversarial) | `functional` | No | `tests/portfolio-survival-foundation.spec.mjs` | `SCN-B002-TOMBSTONE-FAULT-COMPENSATES` compensation-verification arm -> planned title `Regression: BUG-002 compensation verification failure is non-recoverable and value-safe` | Table-drive compensation reread throw, byte mismatch, parse/schema rejection, validator rejection, and broken cross-record identity after writes return. Require `tombstone-compensation-verification-failed`, `recoverable: false`, `field: storage`, no retained-authority claim, no success payload/copy, and no raw storage leakage. | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 -g "Regression: BUG-002 compensation verification failure is non-recoverable and value-safe"` | Planned for `bubbles.test`; not authored or executed here. |
| TP-B002-006 | Regression E2E | `e2e-ui` | Yes | `tests/portfolio-survival-foundation.spec.mjs` | FR-B002-003 unfaulted control for all three stable scenarios -> planned title `Regression: BUG-002 unfaulted full clear proves final authority absence before success` | Require independent `null` reads for pointer and active tombstone, every other personal category empty, controller closed sentinel present, and unchanged public fingerprint before `status: cleared` or verified success copy is observable. | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 -g "Regression: BUG-002 unfaulted full clear proves final authority absence before success"` | Planned for `bubbles.test`; not authored or executed here. |
| TP-B002-007 | Broader E2E regression | `e2e-ui` | Yes | `tests/portfolio-survival-foundation.spec.mjs` | Complete persistent Feature 008 browser regression file, including existing title `Regression: TP-03-06 full-personal clear empties every declared category and leaves the generic public cache byte-identical` | Every pre-existing Feature 008 browser scenario remains green after the narrow repair; no existing assertion is removed or weakened to admit the new transaction. | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1` | Existing persistent suite plus planned BUG-002 rows; not executed here. |
| TP-B002-008 | Repository regression | `functional` | No | `scripts/selftest.mjs` | Existing registered repository selftest | Registered Research Lab invariants remain green after the narrow source/test repair. | `node scripts/selftest.mjs` | Existing persistent check; not executed here. |

### Definition of Done

#### Core Items

- [ ] `CommittedClearAuthority` retains the exact verified pointer and tombstone
  bytes in invocation memory only, and the shared authority procedure restores
  tombstone before pointer and verifies exact bytes, schemas, and all
  cross-record identity fields.
- [ ] Pointer-delete, active-tombstone-delete, and early old-key-delete partial
  arms preserve or restore a validated authoritative pair, keep their stable
  normal failure reasons, preserve public bytes, and never present success.
- [ ] Compensation write failure returns
  `tombstone-compensation-failed`; compensation reread, byte, parse/schema,
  validator, or cross-link failure returns
  `tombstone-compensation-verification-failed`. Both are non-recoverable,
  value-safe storage failures and make no retained-authority claim.
- [ ] A `cleared` result is derived only from independent reread proving the
  pointer and active tombstone absent, every other personal category empty,
  the controller closed sentinel present, and every public fingerprint
  unchanged.
- [ ] `P008-CLEAR-PARTIAL`, the exact confirmation phrase, runtime-derived
  category enumeration, controller inspection, and parent FR-151 remain
  intact with no fallback clear path.
- [ ] `TP-B002-001` / `SCN-B002-POINTER-FAULT-PRESERVES-AUTHORITY`:
  the exact persistent pointer-delete regression passes with both final-delete
  fault variants and proves named partial, no success, unchanged public bytes,
  and a matching validated authority pair. Evidence:
  `report.md#tp-b002-001`.
- [ ] `TP-B002-002` / `SCN-B002-TOMBSTONE-FAULT-COMPENSATES`: the persistent
  exact active-tombstone-delete regression passes and proves tombstone-first
  compensation restores and independently validates the pair without success
  or public-byte mutation. Evidence: `report.md#tp-b002-002`.
- [ ] `TP-B002-003` / `SCN-B002-EARLY-FAULT-RETAINS-PAIR-AND-RESIDUE`: the
  exact early old-key-delete regression passes, proving the faulted residue
  survives when present, the pair remains authoritative, and no exact
  survivor-count or later-key premise remains. Evidence:
  `report.md#tp-b002-003`.
- [ ] `TP-B002-004` / `SCN-B002-TOMBSTONE-FAULT-COMPENSATES`
  compensation-write arm: the exact persistent regression passes for each
  restoration phase and proves the closed non-recoverable, value-safe result.
  Evidence: `report.md#tp-b002-004`.
- [ ] `TP-B002-005` / `SCN-B002-TOMBSTONE-FAULT-COMPENSATES`
  compensation-verification arm: the exact persistent matrix passes for
  reread, byte, parse/schema, validator, and cross-record failures and proves
  the closed non-recoverable, value-safe result. Evidence:
  `report.md#tp-b002-005`.
- [ ] `TP-B002-006` / FR-B002-003 unfaulted control: the exact regression
  passes and proves all required absence, emptiness, sentinel, and
  public-fingerprint reads precede the cleared result and success copy.
  Evidence: `report.md#tp-b002-006`.
- [ ] `TP-B002-007`: the complete persistent Feature 008 browser regression
  file passes without removed, skipped, or weakened assertions. Evidence:
  `report.md#tp-b002-007`.
- [ ] `TP-B002-008`: the registered repository functional selftest passes
  after the narrow repair. Evidence: `report.md#tp-b002-008`.
- [ ] Change Boundary is respected and zero excluded file families were changed.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero warnings and zero deferrals: the
  registered build-free repository checks are clean, exact packet artifact
  lint and traceability checks are clean, no unavailable build or formatter
  command is invented, and affected planning documentation remains aligned.

All DoD items remain unchecked. No implementation, test execution, evidence,
or completion is claimed by this planning reconciliation.
