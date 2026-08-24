# BUG-004 Report

## Summary

This packet consolidates two bug folders that were filed for one defect,
adopts the occurrence-identity repair in `rlportfolio.js`, and records a two-arm
differential proving the repair against the committed specification.

`BUG-003-behavior-dedup-contradicts-occurrence-model` held the richer decision
analysis and no execution artifacts. Its analysis was merged into `bug.md`,
`spec.md`, and `design.md`, and the folder was deleted. One defect now has one
packet.

Root cause is confirmed: commit `edbbddf0d` rejected a distinct occurrence by
combining semantic identity with civil-date occurrence metadata, contradicting
`BehaviorOccurrence/v1`. The repair restores exact `eventId` comparison.

Delivery is NOT complete. Two findings remain unresolved and are routed.

## Completion Statement

Status and certification remain `in_progress`. `certification` was not modified
by this invocation, because certification belongs to `bubbles.validate`.

What is proven and closed:

- the root cause, by a two-arm on-disk differential;
- the repair, by the committed specification suite passing end to end;
- both halves of the duplicate contract, by the adversarial regression;
- the growth bound, by reading both enforcement sites in current source;
- repository-wide invariants, by the canonical selftest and `git diff --check`.

What blocks closure:

- `BUG-004-F1`. Parent design reconciliation is unowned and undone. Owner
  `bubbles.design`.
- `BUG-004-F2`. `spec.md` FR-B003-005 requires `evidenceScore` to be unchanged
  by a semantic repeat, and the adopted behavior changes it. This is a contract
  conflict requiring an owner decision, not a defect this fix may decide.

Three planned test rows were also never created or executed: the adversarial
functional anti-inflation row, and the two Playwright browser rows. Their DoD
items remain unchecked.

## Root Cause Evidence

### Two-arm differential {#control-arm}

**Executed by this agent:** YES
**Claim Source:** executed

Both arms ran against the same committed specification test, hashed identically
in both arms at
`dbe43efdd2ce44dc382d00831d342a19877c09b03b8a78bce9068bae53eb65d7`.
`git status --porcelain -- tests/portfolio-foundation.unit.mjs` returned empty,
confirming the file is unmodified. Only the predicate differed.

The control arm ran in a throwaway `git worktree` at `/tmp/rl_bug003_control`
detached at `HEAD` = `5d4a27778`, so no shipped source was mutated to produce
it. The worktree was removed after the run and `git worktree list` confirms only
the main worktree remains.

```
# CONTROL ARM (HEAD 5d4a27778, edbbddf0d predicate) node --test tests/portfolio-foundation.unit.mjs
$ node --test tests/portfolio-foundation.unit.mjs
exit: 1
lines: 378
sha256: 936cd67da703f3cd22ea3a23906dba213d6ac6be34faa6f2895b2fc5605372ab
--- failure-shaped lines from the omitted region ---
not ok 27 - privacy inventory reports real category counts and carries no stored subject value
--- last 20 ---
1..58
# tests 58
# suites 0
# pass 57
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1964.734008
```

Focused control run of the failing row returned this assertion:

```
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:

    false !== true

  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: true
  actual: false
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///tmp/rl_bug003_control/tests/portfolio-foundation.unit.mjs:738:10)
```

`tests/portfolio-foundation.unit.mjs:738` asserts
`laterOccurrence.value.accepted === true`. `HEAD` is therefore broken against
its own committed, design-sanctioned specification.

| Arm | Predicate | Result | Exit |
|---|---|---|---|
| Control, pristine `HEAD` worktree | `edbbddf0d` content + civil day | `tests 58`, `pass 57`, `fail 1` | 1 |
| Treatment, working tree | `eventId` occurrence identity | `tests 58`, `pass 58`, `fail 0` | 0 |

### Adopted predicate

**Executed by this agent:** YES
**Claim Source:** executed

`git diff -- rlportfolio.js` shows the adopted change replacing the
semantic-plus-civil-date predicate with exact `eventId` comparison:

```diff
-    // Same content on the same civil day. `eventId` fingerprints occurredAt, so it never repeats.
     var duplicate = candidate.behaviorEvents.some(function (entry) {
-      return entry.dedupeKey === eventResult.value.dedupeKey &&
-        entry.occurrence.newYorkCivilDate === eventResult.value.occurrence.newYorkCivilDate;
+      return entry.eventId === eventResult.value.eventId;
     });
```

### Growth bound

**Executed by this agent:** YES
**Claim Source:** executed

Both enforcement sites were read in current source.

```
rlportfolio.js:2423:      if (candidate.behaviorEvents.length + 1 > policy.behavior.maxBehaviorEvents) {
rlportfolio.js:1511:    if (value.behaviorEvents.length > policy.behavior.maxBehaviorEvents) {
rlportfolio.js:2298:    if (events.length > policy.behavior.maxBehaviorEvents) {
rlportfoliobrief.js:339:        input.events.length > input.policy.behavior.maxBehaviorEvents) {
portfolio-survival-allocation.config.json:173:        "maxBehaviorEvents": 500,
```

The write-path guard returns BEFORE the `push`, with a recoverable named error,
leaving the store untouched. It does not evict.

**Growth IS bounded.** The bound is `maxBehaviorEvents`, currently 500, enforced
at the write path before the append and re-enforced at three read paths.

### `evidenceScore` is repeat-sensitive

**Executed by this agent:** YES
**Claim Source:** executed

`rlportfolio.js:2480` accumulates `bucket.score` once per retained occurrence,
inside the per-event loop. `rlportfoliobrief.js:452` repeats the pattern.
Everything else is set-based and therefore repeat-immune, verified by reading
`rlportfolio.js:2476-2517`. A repository-wide search across `*.js`, `*.mjs`, and
`*.html` found no non-test reader of `evidenceScore` on any portfolio surface.

This is recorded as finding `BUG-004-F2`. It is a contract conflict with
FR-B003-005, not a certification of safety.

## Test Evidence

### CMD 1 - adversarial regression {#cmd-1}

**Executed by this agent:** YES
**Claim Source:** executed
**Command:** `node --test tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 0

```
✔ BUG-003: a later same-civil-day completion is a distinct occurrence under one semantic identity (103.833532ms)
✔ BUG-003: an exact occurrence repeat is still refused as a duplicate (57.870683ms)
✔ BUG-003: a repeated same-day occurrence cannot buy relevance it did not earn (49.40973ms)
✔ BUG-003: stored occurrence growth is bounded by the declared behaviour-event cap (32.916119ms)
✔ BUG-003: reinstating the superseded content+civil-day predicate turns the accepted-occurrence assertion red (152.964659ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 550.268685
```

Both halves of the contract are pinned, verified by reading the assertions:

- Later same-day occurrence admitted, lines 98-131. `later.accepted` is `true`
  (L111), `later.event.eventIdentity` equals the first (L113),
  `later.event.occurrence.occurrenceId` does NOT equal the first (L117), and
  `eventId` equals `occurrenceId` (L119). Both occurrences are pinned to
  `newYorkCivilDate === '2026-07-15'` (L106-107) so a midnight-straddling
  fixture cannot make the case vacuous.
- Exact repeat still refused, lines 134-155. `exactRepeat.accepted` is `false`
  (L142) with `reason === 'duplicate-completion'` (L143), and the same holds for
  a repeat of the later occurrence (L152-153).

No half was missing, so no test was added.

### CMD 2 - committed specification suite {#cmd-2}

**Executed by this agent:** YES
**Claim Source:** executed
**Command:** `node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0

```
# CMD2 node --test tests/portfolio-foundation.unit.mjs
$ node --test tests/portfolio-foundation.unit.mjs
exit: 0
lines: 358
sha256: 2de64e496869b70544f8ba7badaa9e75d79a13f9214691de1e20b7bb8d68d195
--- last 20 ---
ok 57 - SCN-008-042 immutable PortfolioDraft lifecycle preserves stable holdings and commits an honest empty revision
  ---
  duration_ms: 97.016469
  type: 'test'
  ...
# Subtest: SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
ok 58 - SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
  ---
  duration_ms: 31.15703
  type: 'test'
  ...
1..58
# tests 58
# suites 0
# pass 58
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1913.519538
```

This file was NOT modified by this packet. `git status --porcelain` reports it
unmodified.

### CMD 3 - canonical repository selftest {#cmd-3}

**Executed by this agent:** YES
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0

```
# CMD3 node scripts/selftest.mjs
$ node scripts/selftest.mjs
exit: 0
lines: 3887
sha256: 6c54dfce275a470120ff434e7bd0c372188b8ac3a09ba6f76713361fc3963734
--- last 20 ---
brief window cutoff — publisher refuses what the consumer would reject
  ✓ the consumer module exports its cutoff resolver, so the publish gate resolves cutoffs with the same rule instead of a second copy
  ✓ a brief whose snapshot and payload are both past the declared cutoff is refused, and each breach is named separately rather than collapsed into one verdict
  ✓ the ordinary in-band publication, composed inside the lead window, is not refused — the gate must not block the 90% case it exists to protect
  ✓ all four window bands close at their own cutoff, so a run past the cutoff selects no window rather than one it cannot honestly satisfy (found 4/4)

================================================
Research-Lab self-test: 3404 passed, 0 failed
================================================
```

Meets the required threshold: exit 0, 3404 passed which is at least 3404, and 0
failed.

### CMD 4 - whitespace and conflict-marker check {#cmd-4}

**Executed by this agent:** YES
**Claim Source:** executed
**Command:** `git diff --check`
**Exit Code:** 0

The command produced no output, which is the clean result for this check.

### Not executed

**Executed by this agent:** NO
**Claim Source:** not-run

These planned rows were never created or run, and their DoD items stay
unchecked:

- `TP-B003-003`, the adversarial baseline-versus-augmented functional row in
  `tests/portfolio-brief.functional.mjs`. It does not exist.
- `TP-B003-005` and `TP-B003-006`, the Playwright browser rows.
- `TP-B003-004`, the exact Scope 28 TP-28-02 functional aggregate.

> **Uncertainty Declaration**
> **What was attempted:** The two-arm differential, the adversarial regression,
> the committed specification suite, the canonical selftest, the diff check, and
> a source read of both cap sites and the full signal derivation.
> **What was observed:** The repair is correct and proven. Growth is bounded.
> `evidenceScore` moves on a same-day repeat.
> **Why this is uncertain:** No executed test compares baseline-versus-augmented
> `evidenceScore` or ranked order, and no browser row ran in this session.
> **What would resolve this:** An owner decision on FR-B003-005, then a
> discriminating functional row and the browser matrix.

## Consolidation Record

The duplicate folder `BUG-003-behavior-dedup-contradicts-occurrence-model` was
untracked, so deletion is not recoverable from git. Its three artifacts
(`bug.md`, `design.md`, `spec.md`) were read in full and merged before deletion.
A safety copy was placed at `/tmp/rl_bug003_dup_backup` for this session.

`ls` of the bugs directory after consolidation returns three folders:
`BUG-001-tier-a-publisher-stamps-run-time-into-asof`,
`BUG-002-full-clear-tombstone-authority`, and
`BUG-004-same-day-behavior-occurrence-rejection`. No fourth folder was created.

## Files Created By This Invocation

Current source, parent SCN-008-044, parent D1-Q2, the focused unit carrier, the
Scope 28 report, and introducing commit `edbbddf0d` were inspected under a
committed Research Lab repository binding.

The inspection confirms that storage rejected a distinct occurrence by
combining semantic identity with civil date. It also identifies an unresolved
anti-inflation obligation in the current relevance derivation.

No product source or existing test file was edited by this bug invocation. No
product test was executed by `bubbles.bug`.

## Completion Statement

Bug filing and root-cause diagnosis are recorded. Delivery is not complete.
Status and certification remain `in_progress`. The next required owner is
`bubbles.design`.

## Root Cause Evidence

### Introducing commit

**Claim Source:** interpreted

Current-session `git show` inspection of `edbbddf0d` shows that
`buildBehaviorCandidate()` changed from exact `eventId` comparison to equal
`dedupeKey` plus equal `newYorkCivilDate`.

### Contract conflict

**Claim Source:** interpreted

Parent D1-Q2 defines semantic identity without occurrence time. It separately
stores `occurredAt`, `newYorkCivilDate`, and `occurrenceId` in
`BehaviorOccurrence/v1`. SCN-008-044 requires only exact semantic duplicates to
collapse and requires distinct completion identities for the floor.

### Current candidate

**Claim Source:** interpreted

The current uncommitted `rlportfolio.js` diff compares exact `eventId` again.
The current uncommitted browser diagnostic says
`duplicateExactOccurrence=rejected`. Both paths were present before this packet
and remain untouched.

### Residual anti-inflation path

**Claim Source:** interpreted

Current `deriveInterestSignals()` groups semantic identities for floor counting
but adds decay weight once per stored occurrence. It does not call
`dedupeBehaviorEvents()` before score accumulation. A real adversarial test is
required before this path can be called compliant.

### Concurrent occurrence carrier

**Claim Source:** interpreted

`tests/portfolio-behavior-occurrence.unit.mjs` appeared after the initial
dirty-tree snapshot. Static inspection shows five BUG-003 rows. They cover
same-day occurrence admission, exact-repeat refusal, floor state, storage cap,
and an in-memory mutation back to the superseded predicate. The relevance row
does not compare `evidenceScore`, and no row compares ranked order.

### Number collision

**Claim Source:** executed

The initial bug-directory listing contained BUG-001 and BUG-002 only. A later
`git status --short --branch` showed a concurrent
`BUG-003-behavior-dedup-contradicts-occurrence-model` directory. This packet was
renumbered to BUG-004 without modifying that directory.

## Parent Diagnostic Evidence

### Before-fix receipts

**Executed by this agent:** NO
**Claim Source:** not-run

The existing Scope 28 report records these earlier executions:

- focused unit command: exit `1`, one failed test;
- exact TP-28-02: exit `1`, 238 passed and one failed; and
- failing title: `privacy inventory reports real category counts and carries no stored subject value`.

These receipts are diagnostic input. This packet does not relabel them as
current execution by `bubbles.bug`.

### Candidate-fix receipts

**Executed by this agent:** NO
**Claim Source:** not-run

The existing Scope 28 report and operator context record:

- focused unit: exit `0`, one of one passed;
- exact TP-28-02: exit `0`, 239 of 239 passed;
- exact SCN-008-011 browser row: exit `0`, one passed, four stored
  completions, two ranked subjects, and `duplicateExactOccurrence=rejected`;
- exact TP-28-03: exit `0`, 93 of 93 passed; and
- canonical selftest: exit `0`, 3404 of 3404 passed.

These values remain diagnostic because this agent did not re-execute the
commands.

## Test Evidence

No product test was executed by `bubbles.bug`. Every test-plan row remains
unchecked and requires execution by `bubbles.test`.

> **Uncertainty Declaration**
> **What was attempted:** Source, contract, test, commit, and existing report
> surfaces were inspected.
> **What was observed:** The storage identity conflict is explicit. The current
> score loop adds weight per occurrence.
> **Why this is uncertain:** No adversarial baseline-versus-augmented relevance
> test was run by this invocation.
> **What would resolve this:** `bubbles.test` must capture the red anti-inflation
> row. `bubbles.implement` must repair the projection if it fails. The same row
> and all broader rows must then pass.

## Files Created By This Invocation

The six requested canonical artifacts and two current full-packet companions
were created only inside this BUG-004 directory:

- `bug.md`
- `spec.md`
- `design.md`
- `scopes.md`
- `report.md`
- `state.json`
- `uservalidation.md`
- `scenario-manifest.json`

## Invocation Audit

No subagent was invoked. This runtime exposes no `runSubagent` tool. The owner
packets are recorded in `design.md`, `scopes.md`, and `state.json` for the
top-level workflow runner.

## Validation Evidence

### Artifact lint

**Executed:** YES, in this invocation
**Command:** `timeout 540 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-004 artifact lint after completed move
$ timeout 540 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ All checklist bullet items use checkbox syntax
✅ uservalidation separates automation readiness from human acceptance
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
ℹ️ Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: ###[[:space:]]+Summary|^##[[:space:]]+Summary
✅ report.md contains section matching: ###[[:space:]]+Completion Statement|^##[[:space:]]+Completion Statement
✅ report.md contains section matching: ###[[:space:]]+Test Evidence|^##[[:space:]]+Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

The evidence helper captured this complete output under sha256
`182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567`.

### Diff and containment checks

**Executed:** YES, in this invocation
**Command:** `git diff --check`, followed by read-only status, packet inventory,
DoD counts, and candidate diff inspection
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The selected exact receipt lines below come from the full
unfiltered terminal output. They show whitespace status, packet cardinality,
unchecked DoD state, and successful candidate-diff inspection. They are a
diagnostic summary, not product-test evidence.

```text
DIFF_CHECK_EXIT=0
STATUS_EXIT=0
BUG004_FILE_COUNT=8
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/bug.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/design.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/scenario-manifest.json
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/scopes.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/spec.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/state.json
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/uservalidation.md
SUPERSEDED_PACKET_FILE_COUNT=0
0
CHECKED_DOD_GREP_EXIT=1
12
UNCHECKED_DOD_GREP_EXIT=0
CANDIDATE_DIFF_EXIT=0
```

The full candidate diff still contains the pre-existing exact-`eventId`
predicate and `duplicateExactOccurrence` diagnostic. The status output still
contains every dirty path observed before this packet, plus concurrent paths
that appeared during filing. No pre-existing or concurrent file was reverted.

## BUG-004 Test Reconciliation And Red Handoff - 2026-08-24

### Owned test change

This invocation changed only the untracked test carrier
`tests/portfolio-behavior-occurrence.unit.mjs` and this BUG-004 report. It did
not edit source, parent artifacts, packet planning artifacts, state, or
documentation. The carrier now uses `BUG-004` in its title, test names, and
packet references instead of the retired duplicate `BUG-003` number.

The existing anti-inflation row now compares three real projections:

- an eligible baseline with two semantic completions on two civil dates;
- an augmented stream that stores one additional same-semantic same-day
  occurrence; and
- a distinct third completion/date control.

The projection runs through `rlportfolio.deriveInterestSignals()` and the
current `rlportfoliobrief.js` semantic de-duplication, signal derivation,
candidate construction, and canonical ranking APIs. It compares semantic
evidence contribution, `evidenceScore`, brief score, floor and eligibility,
both signal identities, candidate/action identities, rank identity, and final
ranked order. The distinct completion/date control must change semantic
contribution, score, and order before the repeat-invariance assertion runs.

### Pre-edit focused baseline

**Executed:** YES, in this invocation before the carrier edit
**Command:** `timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ BUG-003: a later same-civil-day completion is a distinct occurrence under one semantic identity (198.513029ms)
✔ BUG-003: an exact occurrence repeat is still refused as a duplicate (97.731273ms)
✔ BUG-003: a repeated same-day occurrence cannot buy relevance it did not earn (53.418712ms)
✔ BUG-003: stored occurrence growth is bounded by the declared behaviour-event cap (60.808871ms)
✔ BUG-003: reinstating the superseded content+civil-day predicate turns the accepted-occurrence assertion red (147.990802ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 800.497681
```

**Result:** PASS for the duplicate-era carrier. This baseline did not contain
the required score and final-order equality assertion.

### Post-edit focused BUG-004 carrier

**Executed:** YES, in this invocation after the carrier edit
**Command:** `timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-004 semantic anti-inflation focused carrier
$ timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs
exit: 1
lines: 140
sha256: 2b4c68c33ca578bea01adcb6376d0fd1544bed25690e47466b2943bd03e03200
--- first 20 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
  ---
  duration_ms: 185.452052
  type: 'test'
  ...
# Subtest: BUG-004: an exact occurrence repeat is still refused as a duplicate
ok 2 - BUG-004: an exact occurrence repeat is still refused as a duplicate
  ---
  duration_ms: 182.644569
  type: 'test'
  ...
# Subtest: BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn
not ok 3 - BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn
  ---
  duration_ms: 261.182625
  type: 'test'
--- omitted 100 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 4 - BUG-004: stored occurrence growth is bounded by the declared behaviour-event cap
  ---
  duration_ms: 211.431006
  type: 'test'
  ...
# Subtest: BUG-004: reinstating the superseded content+civil-day predicate turns the accepted-occurrence assertion red
ok 5 - BUG-004: reinstating the superseded content+civil-day predicate turns the accepted-occurrence assertion red
  ---
  duration_ms: 365.083615
  type: 'test'
  ...
1..5
# tests 5
# suites 0
# pass 4
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1724.918596
```

The evidence helper captured all 140 lines under sha256
`2b4c68c33ca578bea01adcb6376d0fd1544bed25690e47466b2943bd03e03200`.

### Exact projection mismatch

**Claim Source:** interpreted from the complete direct failure diff and the
hash-verifiable execution above
**Interpretation:** The actual-versus-expected projection below identifies the
fields changed solely by the added same-semantic occurrence; unchanged fields
are retained to show the mismatch is downstream score and rank inflation rather
than a new semantic completion.

The baseline and augmented streams both retained the same two semantic
contribution identities, the same two supporting semantic identities, the
same candidate/action identity set, and the same portfolio signal identity.
Both remained eligible with two distinct completion identities, two distinct
New York civil dates, `floorSatisfied=true`, and
`relevanceBand=weak-relevance`.

The same-semantic same-day occurrence nevertheless changed these values:

| Projection | Baseline | Augmented repeat |
| --- | --- | --- |
| `evidenceScore` | `1.6062` | `2.4094` |
| Brief semantic score | `1.6062` | `2.4094` |
| Brief signal identity | `sha256:3c9e9f9580d90c483efc8b04b3bb403357ea52dbe71df67b98b12e56b3db7cfa` | `sha256:307925e27864507cbd36211d955661dd5f251fe941cf99093f8223e587232d52` |
| Rank identity | `sha256:93b3114beab1f1ce18736b6ca2a87b497f0e5e55dfd167ebfcac1df3ba03b6cd` | `sha256:0cd499b16c7b1447d3c43c8e378de3adbe3e85601de98efb6f0372ca11e219a9` |
| Final ranked order | `comparison-research, equity-research` | `equity-research, comparison-research` |

The unchanged candidate/action identities were
`comparison-research:sha256:d57b0380009eb93855f109cf78cadb478bb0bd58389e9a38dc8eac08a3c74b44`
and
`equity-research:sha256:38f56f064ed520cef52b4d769aa016940f3a56218541bac7ea65a79895c711d7`.
The unchanged portfolio signal identity was
`sha256:1b454dfda14b444f4281f8fdd6a20ce245d422993c0473ff80f6057df36c6394`.

The test reached its final repeat-invariance assertion only after the distinct
completion/date control changed semantic contribution, `evidenceScore`, and
final order. The failure is therefore not an inert equality check.

### Regression-quality guard

**Executed:** YES, in this invocation
**Command:** `timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: <repo-root>
  Timestamp: 2026-08-24T04:59:32Z
  Bugfix mode: true
============================================================
ℹ️  Scanning tests/portfolio-behavior-occurrence.unit.mjs
✅ Adversarial signal detected in tests/portfolio-behavior-occurrence.unit.mjs
============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

**Result:** PASS. The path is redacted in this report; the command and result
are otherwise unchanged.

### Exact Scope 28 TP-28-02 compatibility aggregate

**Executed:** YES, in this invocation
**Command:** `timeout 1140 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-analytics.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-bar-coverage.functional.mjs tests/portfolio-risk.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-dossier.functional.mjs tests/portfolio-workspace.functional.mjs tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-004 exact Scope 28 TP-28-02 compatibility aggregate
$ timeout 1140 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-analytics.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-bar-coverage.functional.mjs tests/portfolio-risk.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-dossier.functional.mjs tests/portfolio-workspace.functional.mjs tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 1444
sha256: 583911330bad6142f42e0dd030ee7f2063b2394ac24c02f48dd6e6f16a59ed94
--- first 20 ---
TAP version 13
# Subtest: TP-13-02 six production candidates share one frozen basis and keep their own states
ok 1 - TP-13-02 six production candidates share one frozen basis and keep their own states
  ---
  duration_ms: 94.889791
  type: 'test'
  ...
# Subtest: TP-13-08 a saved allocation survives a reread and is emptied by the full personal clear
ok 2 - TP-13-08 a saved allocation survives a reread and is emptied by the full personal clear
  ---
  duration_ms: 259.910006
  type: 'test'
  ...
# Subtest: TP-14-02 production sensitivity and Black-Litterman lifecycle run on the common basis
ok 3 - TP-14-02 production sensitivity and Black-Litterman lifecycle run on the common basis
  ---
  duration_ms: 7.020462
  type: 'test'
  ...
# Subtest: TP-24-02 six complete candidates retain one basis costs paths survival and no winner
--- omitted 1404 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 238 - TP-26-01 one workspace compute publishes one immutable view model under token cancel last-valid and rebase control
  ---
  duration_ms: 83.633351
  type: 'test'
  ...
# Subtest: Adversarial: recomputing navigation stale publication and fake return context cannot pass
ok 239 - Adversarial: recomputing navigation stale publication and fake return context cannot pass
  ---
  duration_ms: 92.568904
  type: 'test'
  ...
1..239
# tests 239
# suites 0
# pass 239
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 24265.782658
```

The aggregate is compatibility evidence only. It does not execute the new
focused carrier and cannot supersede its red result. The evidence helper
captured all 1444 lines under sha256
`583911330bad6142f42e0dd030ee7f2063b2394ac24c02f48dd6e6f16a59ed94`.

### Real SCN-008-011 browser row

**Executed:** YES, in this invocation
**Command:** `timeout 600 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio' --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

The checkout-local runner identity was verified first with
`timeout 30 npx --no-install playwright --version`, which exited `0` and
reported `Version 1.61.1`.

```text
Running 1 test using 1 worker
  ✓  1 … clear behavior removes ranking influence and preserves portfolio (5.1s)
[SCN-008-011] eligibleCompletionsBeforeClear=4
[SCN-008-011] rankedSubjectsBeforeClear=2
[SCN-008-011] rankingOrderBeforeClear=msft,bnd
[SCN-008-011] floorMetBeforeClear=msft
[SCN-008-011] previewOnlyChangedProjection=false
[SCN-008-011] rankingSurvivedReload=true
[SCN-008-011] duplicateExactOccurrence=rejected
[SCN-008-011] eligibleCompletionsAfterClear=0
[SCN-008-011] interestSignalsAfterClear=0
[SCN-008-011] portfolioPreserved=true
[SCN-008-011] mandatePreserved=true
[SCN-008-011] holdingsPreserved=BND,MSFT
[SCN-008-011] mandateConstraintSubjectsPreserved=MSFT,BND
[SCN-008-011] clearedSubjectScope=behaviorEvents,interestSignals,actionOutcomes,rankingRows
[SCN-008-011] cashNeedsPreserved=true
[SCN-008-011] quarantinePreservedByBehaviorClear=true
[SCN-008-011] sessionFallbackPreservedByBehaviorClear=true
[SCN-008-011] publicCacheByteIdentical=true
[SCN-008-011] foreignStorageKeys=rlData
[SCN-008-011] remotePersonalRequests=0
  1 passed (7.8s)
```

**Result:** PASS as real browser compatibility evidence. This existing row
does not supersede the focused anti-inflation failure.

### Test verdict and owner route

**Verdict:** RED. The strengthened BUG-004 carrier reports 4 passed, 1 failed,
0 skipped, and 0 todo. No assertion was weakened and no production source was
edited.

**nextRequiredOwner:** `bubbles.implement`

The implementation owner must collapse eligible occurrences by semantic
`eventIdentity` before both `rlportfolio.js` and `rlportfoliobrief.js`
accumulate score and derive signal/rank identity. The full occurrence stream
must remain available for audit and raw occurrence count. After repair,
`bubbles.test` must rerun the unchanged focused carrier, the exact TP-28-02
aggregate, and the real SCN-008-011 row.

### Post-evidence artifact lint

**Executed:** YES, in this invocation after the red handoff was appended
**Command:** `timeout 540 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-004 post-test-evidence artifact lint
$ timeout 540 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ All checklist bullet items use checkbox syntax
✅ uservalidation separates automation readiness from human acceptance
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
ℹ️ Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: ###[[:space:]]+Summary|^##[[:space:]]+Summary
✅ report.md contains section matching: ###[[:space:]]+Completion Statement|^##[[:space:]]+Completion Statement
✅ report.md contains section matching: ###[[:space:]]+Test Evidence|^##[[:space:]]+Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
```

The evidence helper captured all 40 lines under sha256
`182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567`.

### Post-evidence diff and containment check

**Executed:** YES, in this invocation
**Command:** `git diff --check`, followed by `git status --short --branch`
**Exit Code:** 0
**Claim Source:** executed

```text
GIT_DIFF_CHECK_EXIT=0
## main...origin/main [ahead 2]
 M notes/portfolio-survival-allocation-lab.md
 M rlportfolio.js
 M specs/008-portfolio-survival-and-brief-lab/design.md
 M specs/008-portfolio-survival-and-brief-lab/scenario-manifest.json
 M specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement/report.md
 M specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement/scope.md
 M specs/008-portfolio-survival-and-brief-lab/scopes/29-documentation-and-registry-truth/report.md
 M specs/008-portfolio-survival-and-brief-lab/scopes/29-documentation-and-registry-truth/scope.md
 M specs/008-portfolio-survival-and-brief-lab/scopes/_index.md
 M specs/008-portfolio-survival-and-brief-lab/test-plan.json
 M tests/portfolio-survival-brief.spec.mjs
 M tests/portfolio-survival-foundation.spec.mjs
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/
?? tests/portfolio-behavior-occurrence.unit.mjs
?? tests/portfolio-doc-integration.functional.mjs
```

The path set is identical to the pre-edit snapshot from this invocation. No
dirty path was removed, reverted, staged, committed, or pushed. The two owned
paths remain represented by the pre-existing untracked BUG-004 directory and
the pre-existing untracked carrier.

### Linked-test resolution

**Executed:** YES, in this invocation after the carrier rename
**Command:** `timeout 60 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection`
**Exit Code:** 1
**Claim Source:** executed

```text
scenario-test-resolve: FAIL — linked tests that do not resolve (Gate G057)
  MISSING-TITLE: SCN-B004-OCCURRENCE-ADMISSION -> tests/portfolio-behavior-occurrence.unit.mjs#BUG-003: a later same-civil-day completion is a distinct occurrence under one semantic identity
    the referenced file contains no test with this exact title
  MISSING-TITLE: SCN-B004-SEMANTIC-ANTI-INFLATION -> tests/portfolio-behavior-occurrence.unit.mjs#BUG-003: a repeated same-day occurrence cannot buy relevance it did not earn
    the referenced file contains no test with this exact title
  MISSING-TITLE: SCN-B004-SEMANTIC-ANTI-INFLATION -> tests/portfolio-brief.functional.mjs#Regression: BUG-004 same-semantic occurrences cannot inflate relevance
    the referenced file contains no test with this exact title
scenario-test-resolve: 3 unresolved reference(s) of 5 checked.
SCENARIO_TEST_RESOLVE_EXIT=1
```

**Result:** ROUTE REQUIRED. Two links are planning-manifest drift caused by the
required `BUG-003` to `BUG-004` carrier rename. The third is a pre-existing
planned functional title that is not authored. This test invocation does not
own planning content in `scenario-manifest.json`, so it did not rewrite those
links. The blocking executable result still routes first to
`bubbles.implement`. After the unchanged focused carrier is green,
`bubbles.plan` must reconcile the renamed linked titles, and `bubbles.test`
must either author the planned functional row or return it for plan removal.

## BUG-004 Validate Reconciliation - 2026-08-24

### Focused semantic anti-inflation carrier {#validate-focused-carrier}

**Phase:** validate
**Command:** `timeout 300 node --test tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity (87.844768ms)
✔ BUG-004: an exact occurrence repeat is still refused as a duplicate (32.553103ms)
✔ BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn (99.039401ms)
✔ BUG-004: stored occurrence growth is bounded by the declared behaviour-event cap (24.626651ms)
✔ BUG-004: reinstating the superseded content+civil-day predicate turns the accepted-occurrence assertion red (110.418532ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 507.090032
```

**Result:** PASS. The current carrier directly proves exact-occurrence
admission/refusal, bounded storage, semantic score and rank invariance, and
sensitivity to the superseded storage predicate.

### Outcome Contract Gate G070 {#validate-g070}

**Phase:** validate
**Command (home path redacted to `~`):** `cd ~/research-lab && printf '%s\n' '=== BUG-004 G070 PRE-CERTIFICATION ===' 'Repository: research-lab' 'Packet: BUG-004-same-day-behavior-occurrence-rejection' 'Boundary: pre-certification' 'Command follows:' && set +e; timeout 300 bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection; rc=$?; printf '%s\n' "GOAL_FIDELITY_EXIT=$rc" 'Certification permitted: no' 'Packet status retained: in_progress' 'Required owner: bubbles.analyst' '=== END BUG-004 G070 PRE-CERTIFICATION ==='; exit "$rc"`
**Exit Code:** 1
**Claim Source:** executed

```text
=== BUG-004 G070 PRE-CERTIFICATION ===
Repository: research-lab
Packet: BUG-004-same-day-behavior-occurrence-rejection
Boundary: pre-certification
Command follows:
GOAL-FIDELITY[G070] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/spec.md has no non-empty '## Outcome Contract' section. G070 requires Intent, Success Signal, Hard Constraints, and Failure Condition BEFORE bootstrap completes; without it there is no statement of what this feature was for.
GOAL-FIDELITY[G070] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/spec.md Outcome Contract declares no 'Hard Constraints'. Certification cannot claim constraints were preserved when none were stated.
goal-fidelity-guard: FAIL boundary=pre-certification findings=2
GOAL_FIDELITY_EXIT=1
Certification permitted: no
Packet status retained: in_progress
Required owner: bubbles.analyst
=== END BUG-004 G070 PRE-CERTIFICATION ===
```

**Result:** FAIL. G070 blocks certification before the remaining mechanical and
substance checks. The packet therefore remains nonterminal at `in_progress`.
The missing Outcome Contract is `spec.md` content owned by `bubbles.analyst`.

### Parent-provided current-session diagnostics

**Phase:** validate
**Claim Source:** not-run
**Source:** Parent execution summary supplied in the current request.

The parent reported successful focused unit, 13-file aggregate, SCN-008-011
browser, canonical selftest, regression-quality, and diff-check runs. This
validator did not execute those parent commands and does not relabel them as
validate-owned execution evidence. The focused unit carrier above was rerun by
this validator; the remaining parent results stay diagnostic input only.

> **Uncertainty Declaration**
> **What was attempted:** The focused BUG-004 carrier and mandatory G070
> pre-certification gate were executed by this validator.
> **What was observed:** The focused carrier is green, but G070 refuses because
> the packet has no Outcome Contract and no declared Hard Constraints.
> **Why this is uncertain:** Formal validation stops at G070, so the inherited
> aggregate, browser, selftest, quality-guard, and diff results were not adopted
> as validator execution evidence.
> **What would resolve this:** The spec owner must add the required Outcome
> Contract, after which validation can restart from G070 on the current tree.
