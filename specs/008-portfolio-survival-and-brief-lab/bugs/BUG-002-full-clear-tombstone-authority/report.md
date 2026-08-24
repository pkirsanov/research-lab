# BUG-002 Report

## Summary

Current source, parent design, parent FR-151, and the exact Scope 28 browser row
were inspected under a committed Research Lab repository binding. The inspection
confirmed a production cleanup-order defect and a separate stale test premise.

No product source or test was edited. No product test was run by `bubbles.bug`.

## Completion Statement

Bug discovery and root-cause diagnosis are recorded. Delivery is not complete.
Status remains `in_progress`, certification remains `in_progress`, and the next
required owner is `bubbles.design`.

## Findings

### BUG-002-F1 - Production authority loss

`clearAllPersonalData()` removes the active tombstone and then the pointer in one
try block. A pointer-removal exception can therefore leave the pointer while its
target is absent. The catch returns the named partial failure but performs no
compensation or authority reread.

**Claim Source:** interpreted

This conclusion is derived from the current `rlportfolio.js` control flow and
the parent contract. A focused browser reproduction was not executed by this
agent.

### BUG-002-F2 - Stale exactly-one-residue test premise

The current browser row expects the correct public failure identity, but still
requires every populated fault arm to leave exactly `[faultKey]`. Parent design
requires the pointer and active tombstone to remain together after a partial
deletion, so that residue-count assertion is not a valid authority check.

**Claim Source:** interpreted

This is independent from BUG-002-F1. Correcting the test premise does not repair
the dangling-pointer production path.

## Executed Diagnostic Receipts

These commands inspect files only. Their exit `0` means the requested text or
diff was read successfully. It does not mean a product test passed.

### Source-order inspection

**Phase:** bug
**Command (workspace-relative):** `grep -nE 'function commitClearTombstone|local\.setItem\(inactiveKey|local\.setItem\(policy\.storage\.pointerKey|return success\(\{ activeSlot: inactiveSlot, activeKey: inactiveKey \}\)|keepLocal\[request\.policy\.storage\.pointerKey\]|keepLocal\[tombstoneCommit\.value\.activeKey\]|removeItem\(tombstoneCommit\.value\.activeKey\)|removeItem\(request\.policy\.storage\.pointerKey\)|tombstone-delete-failed' rlportfolio.js`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The output directly fixes the write/keep/final-delete order;
the authority-loss conclusion follows by applying the named pointer-removal
exception to that order.

```text
3630:  function commitClearTombstone(storageAdapters, tombstone, expectedGeneration, policy) {
3650:      local.setItem(inactiveKey, serialized);
3664:      local.setItem(policy.storage.pointerKey, pointerBytes);
3668:      return success({ activeSlot: inactiveSlot, activeKey: inactiveKey });
3791:    keepLocal[request.policy.storage.pointerKey] = true;
3792:    keepLocal[tombstoneCommit.value.activeKey] = true;
3900:      request.storageAdapters.localStorage.removeItem(tombstoneCommit.value.activeKey);
3901:      request.storageAdapters.localStorage.removeItem(request.policy.storage.pointerKey);
3905:        "tombstone-delete-failed",
SOURCE_INSPECTION_EXIT=0
```

### Contract-versus-test inspection

**Phase:** bug
**Command (workspace-relative):** `grep -nE 'Build ClearTombstone|Commit the tombstone|Delete every discovered personal key|Remove the tombstone and pointer|Any delete, reread|tombstone stays authoritative|FR-151:|Regression: TP-03-06|P008-CLEAR-PARTIAL.*tombstone-delete-failed|the other declared steps still delete|exactly one declared key survives' <parent-design> <parent-spec> <foundation-test>`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The parent contract requires retained authority after a
partial deletion. The current row instead requires all non-fault keys gone and
exactly one surviving key.

```text
design.md:1122:4. Build `ClearTombstone/v1` with an empty validated workspace and registry fingerprint.
design.md:1123:5. Commit the tombstone by the normal inactive-slot and pointer transaction.
design.md:1124:6. Delete every discovered personal key except the active tombstone and pointer.
design.md:1127:9. Remove the tombstone and pointer only after all other personal categories verify empty.
design.md:1132:Any delete, reread, controller reset, or public-fingerprint failure returns `P008-CLEAR-PARTIAL`. The tombstone stays authoritative after a partial deletion.
spec.md:1410:- **FR-151:** A full-personal clear must derive the complete personal category set from current persistent and live state. It must commit a validated empty tombstone before deletion and verify every category through independent reread and controller inspection. It must preserve public generic assets and return a named partial failure for any residue.
portfolio-survival-foundation.spec.mjs:1378:test('Regression: TP-03-06 every declared foundation clear step refuses success on its own and retains only its own key', async ({ browser }) => {
portfolio-survival-foundation.spec.mjs:1426:      await expect(page.locator('#privacyResult')).toHaveText('P008-CLEAR-PARTIAL · tombstone-delete-failed');
portfolio-survival-foundation.spec.mjs:1431:        `${faultKey}: the other declared steps still delete`).toEqual([]);
portfolio-survival-foundation.spec.mjs:1437:        expect(after.presentKeys, `${faultKey}: exactly one declared key survives`).toEqual([faultKey]);
CONTRACT_TEST_INSPECTION_EXIT=0
```

### Existing test-correction attribution

**Phase:** bug
**Command (workspace-relative):** `git diff --unified=5 -G 'foundation-clear-incomplete|tombstone-delete-failed|exactly one declared key' -- tests/portfolio-survival-foundation.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```diff
-      await expect(page.locator('#privacyResult')).toHaveText('P008-STORE-WRITE · foundation-clear-incomplete');
+      await expect(page.locator('#privacyResult')).toHaveText('P008-CLEAR-PARTIAL · tombstone-delete-failed');
-        expect(after.values[faultKey], `${faultKey}: the retained key survives with its bytes unchanged`)
-          .toBe(before.values[faultKey]);
+        expect(after.values[faultKey], `${faultKey}: the faulted key remains as named residue`).not.toBeNull();
         expect(after.presentKeys, `${faultKey}: exactly one declared key survives`).toEqual([faultKey]);
FOCUSED_TEST_DIFF_EXIT=0
```

The diff proves that the public error and byte-identity assumptions were already
corrected in the existing uncommitted test change. It also proves the
exactly-one-key premise remains. This packet neither authored nor changed that
test hunk.

## Static Inspection Evidence

### Source transaction

**Phase:** bug
**Claim Source:** interpreted
**Tool:** VS Code `read_file`
**Path:** `rlportfolio.js`

Observed current-source sequence:

```text
commitClearTombstone writes and rereads the inactive tombstone.
commitClearTombstone writes and rereads the pointer to that tombstone.
clearAllPersonalData keeps the pointer and active tombstone during category deletion.
clearAllPersonalData returns partial before final cleanup when category deletion fails.
Final cleanup removes activeKey first.
Final cleanup removes pointerKey second.
One catch maps either exception to P008-CLEAR-PARTIAL / tombstone-delete-failed.
The catch does not restore the tombstone.
The catch does not restore the pointer.
The catch does not reread pointer-to-tombstone authority.
Success later requires finalPersonal to be empty and public fingerprints equal.
```

### Parent contract

**Phase:** bug
**Claim Source:** interpreted
**Tool:** VS Code `read_file`
**Paths:** `specs/008-portfolio-survival-and-brief-lab/design.md`,
`specs/008-portfolio-survival-and-brief-lab/spec.md`

```text
Design step 4 builds a validated ClearTombstone/v1.
Design step 5 commits it by the inactive-slot and pointer transaction.
Design step 6 excludes the active tombstone and pointer from early deletion.
Design step 8 independently rereads storage and controller categories.
Design step 9 removes the tombstone and pointer only after those checks pass.
Design step 10 rereads again and compares public fingerprints.
Any delete or reread failure returns P008-CLEAR-PARTIAL.
The design states that the tombstone stays authoritative after partial deletion.
FR-151 requires a validated empty tombstone before deletion.
FR-151 requires independent reread and controller inspection.
FR-151 requires a named partial failure for any residue.
```

## Operator-Supplied Diagnostic Context

The operator reported that the focused Scope 28 browser row exited `1` after its
expected public error was corrected. That scrollback is diagnostic input only.
It is not restated as execution evidence from this agent.

The supplied sequence exposed two stale assumptions before reaching the product
defect: pointer bytes legitimately change during tombstone commit, and an early
deletion fault can retain the faulted key plus the authoritative pair.

## Test Evidence

No product test was executed by `bubbles.bug`, and no passing result is claimed.

> **Uncertainty Declaration**
> **What was attempted:** Current source, contract, and test control flow were
> inspected. No Playwright command was run because product test execution belongs
> to `bubbles.test` in this discovery-only invocation.
> **What was observed:** The current source contains the asymmetric final cleanup,
> and the current row contains the exactly-one-key assertion.
> **Why this is uncertain:** Browser runtime behavior and the post-repair result
> require real execution.
> **What would resolve this:** `bubbles.test` must run the focused pointer-fault
> scenario before the source repair, preserve its failing output, and rerun the
> same scenario after `bubbles.implement` applies the approved repair.

## Files Changed By This Invocation

Only the eight files in this `BUG-002` packet are in scope. Existing uncommitted
Feature 008, Scope 28, test, brief, and `BUG-001` changes are preserved untouched.

| File | Purpose |
| --- | --- |
| `bug.md` | Discovery, severity, two-finding separation, root cause, routing |
| `spec.md` | Expected authority and failure behavior derived from parent FR-151 |
| `design.md` | Diagnostic design inputs and the route to `bubbles.design` |
| `scopes.md` | Non-terminal scenario/test/DoD handoff for `bubbles.plan` |
| `report.md` | Current-session diagnostic receipts and uncertainty declaration |
| `uservalidation.md` | Unchecked automation and human validation checklist |
| `scenario-manifest.json` | Three planned authority scenarios |
| `state.json` | Version 3 in-progress control plane and route-required metadata |

## Routing

1. `bubbles.design` - finalize compensation and compensation-failure semantics.
2. `bubbles.plan` - own final Gherkin, Test Plan, and DoD wording.
3. `bubbles.test` - correct the stale test premise and capture the pre-fix failure.
4. `bubbles.implement` - repair only the approved source path.
5. `bubbles.test` and `bubbles.validate` - execute post-fix regression and
   certification.
