# Report: BUG-005 Stale-Domain Interest Signal Crash

## Summary

`rlportfolio.deriveInterestSignals` threw an uncaught `RangeError: Invalid time
value` whenever every eligible event in a domain had aged out of the declared
evidence window. The bucket for that domain was created in the pre-filter loop,
so it survived the age filter with `latest` still `null`, and the downstream
`expiresAt` computation called `toISOString` on an invalid date.

The fix relocates bucket creation into the post-filter accumulation loop, so a
domain with no in-window evidence never owns a bucket at all. It shipped in
`732bccb6c` and is contained in the current `HEAD`.

This report records the reproduction, provenance, divergence characterization,
fix confinement, green verification, and boundary checks. Every block below was
produced by execution in the current session.

## Completion Statement

Scope 1 is implemented and its Definition of Done is satisfied by the evidence
recorded here. Independent certification (`bubbles.validate`) and human
acceptance are separate facts and are NOT claimed by this report.

## Evidence Provenance

- Every block carries the command that produced it, its real exit code, and
  real output. Blocks over 40 lines were produced by
  `.github/bubbles/scripts/evidence-capture.sh`, which runs the command itself
  and emits a `sha256` over the FULL output, so the recorded result can be
  re-derived rather than merely re-read.
- Two blocks required the pre-fix module. Both were produced by checking out
  `rlportfolio.js` alone at the historical revision, running, and restoring.
  The restore is verified in each block; the working tree is clean.
- **Normalization, disclosed:** Node prints stack frames with the absolute
  checkout root. That path trips this repository's `pii-scan.sh` machine-local
  token check, so the root prefix is rendered repo-relative below
  (`rlportfolio.js:2518:101`, not the absolute form). The recorded `sha256`
  covers the RAW, un-normalized output. Only the displayed prefix differs.
- `node --test` embeds per-test `duration_ms`, so the same command yields a
  different `sha256` on every run. Each hash therefore verifies its own
  capture; it is not a cross-run identity claim.

## Test Evidence

### Pre-fix reproduction — the crash, its type, message, and frame {#pre-fix-reproduction}

`rlportfolio.js` was reverted to `732bccb6c^` (the revision immediately before
the fix, which was `HEAD` when the defect was filed), the carrier was run
against that unmodified module, and the file was restored.

```text
$ git checkout 732bccb6c^ -- rlportfolio.js
REVERTED rlportfolio.js to 732bccb6c^

# BUG-005 pre-fix reproduction: carrier against rlportfolio.js at 732bccb6c^
$ node --test tests/portfolio-stale-domain-signal.unit.mjs
exit: 1
lines: 145
sha256: b422519550147288b151b8e8034d20bcfe90902886bea3f1b9a2c9eb99e5b408
--- first 30 ---
TAP version 13
# Subtest: BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
not ok 1 - BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
  ---
  duration_ms: 93.790334
  type: 'test'
  location: 'tests/portfolio-stale-domain-signal.unit.mjs:165:1'
  failureType: 'testCodeFailure'
  error: 'Invalid time value'
  code: 'ERR_TEST_FAILURE'
  name: 'RangeError'
  stack: |-
    Date.toISOString (<anonymous>)
    rlportfolio.js:2518:101
    Array.map (<anonymous>)
    Object.deriveInterestSignals (rlportfolio.js:2491:48)
    TestContext.<anonymous> (tests/portfolio-stale-domain-signal.unit.mjs:184:23)
--- failure-shaped lines from the omitted region ---
not ok 2 - BUG-005: a future-dated-only domain is omitted through the same filter without throwing
not ok 3 - BUG-005: a stale domain must not suppress the fresh domains beside it
not ok 4 - BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing
not ok 5 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
not ok 6 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
--- last 30 ---
1..6
# tests 6
# suites 0
# pass 0
# fail 6
# cancelled 0
# skipped 0
# todo 0

$ git checkout HEAD -- rlportfolio.js
RESTORE_EXIT=0
$ git status --porcelain
(empty — working tree restored clean)
```

Thrown type `RangeError`. Message `Invalid time value`. Source frame
`rlportfolio.js:2518:101` inside `Date.toISOString`, reached from
`Object.deriveInterestSignals` at `rlportfolio.js:2491:48`.

The failure surfaces at carrier line `184:23`, which is the
`deriveInterestSignals` call. The fixture's two vacuity guards sit at lines
165-181 and therefore executed and PASSED before the throw: the asserted
domain genuinely holds stored, `eligible` evidence, and every row of it is
outside the declared window. The red is the defect, not a malformed fixture.

### Provenance — the same fault predates the BehaviorOccurrence repair {#provenance}

`a59e38d71` is `fix(008): separate behavior occurrences from relevance`, the
BehaviorOccurrence repair. Reproducing at its PARENT shows the crash already
existed before that work, so BUG-005 is not a regression it introduced.

```text
$ git checkout a59e38d71^ -- rlportfolio.js
REVERTED rlportfolio.js to a59e38d71^

# BUG-005 provenance: carrier against rlportfolio.js at a59e38d71^
$ node --test tests/portfolio-stale-domain-signal.unit.mjs
exit: 1
lines: 145
sha256: 68bb935bd982d4c68f569028ab79324a3d4612099d26a7551a432f27a997821f
--- first 22 ---
TAP version 13
not ok 1 - BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
  ---
  error: 'Invalid time value'
  code: 'ERR_TEST_FAILURE'
  name: 'RangeError'
  stack: |-
    Date.toISOString (<anonymous>)
    rlportfolio.js:2512:101
    Array.map (<anonymous>)
    Object.deriveInterestSignals (rlportfolio.js:2485:48)
--- failure-shaped lines from the omitted region ---
not ok 2 - BUG-005: a future-dated-only domain is omitted through the same filter without throwing
not ok 3 - BUG-005: a stale domain must not suppress the fresh domains beside it
not ok 4 - BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing
not ok 5 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
not ok 6 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
--- last 22 ---
1..6
# tests 6
# pass 0
# fail 6
# cancelled 0
# skipped 0
# todo 0

$ git checkout HEAD -- rlportfolio.js
RESTORE_EXIT=0
$ git status --porcelain
(empty — working tree restored clean)
```

Identical thrown type, identical message, identical call path. The frame line
numbers differ (`2512:101` / `2485:48` here versus `2518:101` / `2491:48` at
the later revision) only because the BehaviorOccurrence repair shifted the file
by six lines. Same fault, older file.

### Divergence — the brief returns `ok` where the portfolio throws {#divergence}

The DoD asks whether the two derivations disagree on BYTE-IDENTICAL input. A
throwaway probe, executed outside the repository so the working tree is never
touched, answers it directly.

Method. `rlcontracts.js`, `rlportfolio.js`, `rlportfoliobrief.js`, and
`portfolio-survival-allocation.config.json` are all read from git object
storage at `732bccb6c^` and evaluated as SOURCE TEXT inside one throwaway
browser-shaped root — the same technique the carrier already uses to prove
predicate sensitivity without editing shipped source. Nothing is checked out.
Both derivations therefore come from the SAME pre-fix revision. The fixture is
the carrier's `mixedWorkspace`. The shared input — the `behaviorEvents` array,
the cutoff instant, and the declared window — is hashed BEFORE the first call
and again AFTER the second, so "byte-identical" is measured rather than
asserted.

```text
$ node /tmp/bug005-divergence-probe.cjs
exit: 0
pre-fix revision:      732bccb6c^ (resolved from git object storage, no checkout)
rlportfolio.js  sha256: 950e67cf72177c65e95d414fbe562812dc58ffb65f79c5f0d0f2d15ef18b06f1
rlportfoliobrief sha256: 14df3cc796e151d7c07a01d37b1fc2a6130a70b53baaf81a8a8f0615fe42ebb3
shared input sha256:   b41a53b7be8ad56e45be4984193db0fe1fd57df278de3a6ba83d9c7f4127b2d6
shared input:          4 behaviorEvents, cutoff 2026-07-20T08:00:00.000Z, maximumEvidenceAgeDays 56
stale domain "equity-research": 1 stored occurrence(s), age(s) in days 190.92 — all outside the declared window

--- consumer A: rlportfolio.deriveInterestSignals(workspace, NOW, policy) ---
THREW    RangeError: Invalid time value
  frame  at Date.toISOString (<anonymous>)
  frame  at eval (eval at evalInto (/tmp/bug005-divergence-probe.cjs:31:3), <anonymous>:2520:101)
  frame  at Array.map (<anonymous>)

--- consumer B: rlportfoliobrief.deriveInterestSignals({behaviorCutoffAt, events, policy}) ---
returned: ok=true
  stale row for "equity-research" IS emitted, with null support:
    score                        = 0
    supportingOccurrenceIds      = []
    latestSupportAt              = null
    floor.satisfied              = false
    floor.distinctCompletionIdentities = 0
    floor.rawOccurrenceCount     = 1

input sha256 after both calls: b41a53b7be8ad56e45be4984193db0fe1fd57df278de3a6ba83d9c7f4127b2d6
input byte-identical across both consumers: true
DIVERGENCE: rlportfolio THREW RangeError | rlportfoliobrief RETURNED ok=true
```

The divergence is established by execution. On one input, hashed identical
before and after both calls, the brief returns an `ok` envelope carrying a
null-support row for the stale domain — `score` 0, `supportingOccurrenceIds`
empty, `latestSupportAt` null, floor unsatisfied with zero distinct
completions — while retaining `rawOccurrenceCount: 1` so the history is not
lost. The portfolio derivation throws on the same input.

The `<anonymous>:2520:101` offset is the in-eval line; it is the same statement
as `rlportfolio.js:2518:101` in the checked-out reproduction above, shifted by
the two-line wrapper prologue the `Function` constructor adds.

Both consumers are pre-fix by construction. `rlportfoliobrief.js` is in fact
byte-identical from `732bccb6c^` through `HEAD` (see
[change boundary](#change-boundary)), so the brief's behavior recorded here is
also its current behavior — which is why `design.md` § Divergence Resolution
requires no repair on the brief side.

### Fix confinement — the production change {#fix-confinement}

```text
$ git diff 732bccb6c^..732bccb6c -- rlportfolio.js
@@ -2459,6 +2459,16 @@
       if (!event.genericEvidenceIdentity || !event.eventIdentity || !event.occurrence) return;
+      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
+      if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;
+      eligibleEvents.push(event);
+    });
+
+    var dedupedResult = dedupeBehaviorEvents(eligibleEvents, policy);
+    if (!dedupedResult.ok) return dedupedResult;
+    dedupedResult.value.events.forEach(function (event) {
+      // Created HERE, after the age filter. A domain with no in-window evidence must not own a
+      // bucket at all: `latest` would stay null and `expiresAt` below becomes an invalid date.
       var key = String(event.domain);
       if (!byDomain[key]) {
@@ -2471,15 +2481,7 @@
         };
       }
-      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
-      if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;
-      eligibleEvents.push(event);
-    });
-
-    var dedupedResult = dedupeBehaviorEvents(eligibleEvents, policy);
-    if (!dedupedResult.ok) return dedupedResult;
-    dedupedResult.value.events.forEach(function (event) {
-      var bucket = byDomain[String(event.domain)];
+      var bucket = byDomain[key];
       var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;

$ git diff --unified=0 732bccb6c^..732bccb6c -- rlportfolio.js | grep -E '^@@'
@@ -2461,0 +2462,10 @@
@@ -2474,9 +2484 @@
exit: 0

$ awk '/^  function deriveInterestSignals/{s=NR} s&&/^  }$/&&NR>s{print s"-"NR; exit}' rlportfolio.js
deriveInterestSignals spans lines 2448-2536
exit: 0
```

Every changed line (`2462`-`2471` added, `2474`-`2482` removed) falls inside
`deriveInterestSignals` (`2448`-`2536`). No other function in the module is
touched. The change is a relocation of bucket creation, not new behavior: the
same filter, the same dedupe, the same accumulation, reordered so the bucket
cannot outlive the filter.

### Code Diff Evidence {#code-diff-evidence}

**Claim Source:** executed — both commands were run in this session against the
committed history and their real stdout and real exit codes are recorded below.

The delivery commit is `732bccb6c`; `HEAD` has since advanced past it, so a
working-tree diff no longer shows this change. The commit is therefore addressed
directly. The section above (`### Fix confinement`) analyses the same change
against its enclosing function; this section records the commit-addressed
production diff itself, with the `a/` and `b/` path headers intact.

```text
$ git show 732bccb6c -- rlportfolio.js
commit 732bccb6c8949008d3eaf9323c26d85467352e44
Author: pkirsanov <pkirsanov@users.noreply.github.com>
Date:   Tue Aug 25 05:38:06 2026 +0000

    fix(BUG-005): omit stale-only interest domains

diff --git a/rlportfolio.js b/rlportfolio.js
index 495538f19..dc2643865 100644
--- a/rlportfolio.js
+++ b/rlportfolio.js
@@ -2459,6 +2459,16 @@
       if (!event || !event.domain) return;
       if (event.lifecycleState !== "eligible") return;
       if (!event.genericEvidenceIdentity || !event.eventIdentity || !event.occurrence) return;
+      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
+      if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;
+      eligibleEvents.push(event);
+    });
+
+    var dedupedResult = dedupeBehaviorEvents(eligibleEvents, policy);
+    if (!dedupedResult.ok) return dedupedResult;
+    dedupedResult.value.events.forEach(function (event) {
+      // Created HERE, after the age filter. A domain with no in-window evidence must not own a
+      // bucket at all: `latest` would stay null and `expiresAt` below becomes an invalid date.
       var key = String(event.domain);
       if (!byDomain[key]) {
         byDomain[key] = {
@@ -2471,15 +2481,7 @@
           score: 0
         };
       }
-      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
-      if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;
-      eligibleEvents.push(event);
-    });
-
-    var dedupedResult = dedupeBehaviorEvents(eligibleEvents, policy);
-    if (!dedupedResult.ok) return dedupedResult;
-    dedupedResult.value.events.forEach(function (event) {
-      var bucket = byDomain[String(event.domain)];
+      var bucket = byDomain[key];
       var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
       bucket.eventIdentities[event.eventIdentity] = true;
       bucket.dates[event.occurrence.newYorkCivilDate] = true;
exit: 0
```

The full changed-path footprint of the same commit, with unabbreviated paths so
each entry classifies under its true family rather than under a display
ellipsis:

```text
$ git diff-tree --no-commit-id --name-only -r 732bccb6c
notes/portfolio-survival-allocation-lab.md
rlportfolio.js
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/bug.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/design.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/report.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/scenario-manifest.json
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/scopes.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/spec.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/state.json
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/uservalidation.md
tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
```

One production module (`rlportfolio.js`), one test carrier
(`tests/portfolio-stale-domain-signal.unit.mjs`), one notes update
(`notes/portfolio-survival-allocation-lab.md`), and the packet artifacts. The
delivery footprint outside `specs/` is real and is not artifact-only.

### Focused carrier GREEN {#focused-carrier}

```text
# BUG-005 carrier GREEN at HEAD (TP-B005-001, TP-B005-002)
$ node --test tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
lines: 46
sha256: 0d6fec812c15d3870c513833e9ef3d6d173976ae322186c2307135b6405a20a6
--- first 12 ---
TAP version 13
# Subtest: BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
ok 1 - BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
  ---
  duration_ms: 98.490703
  type: 'test'
  ...
# Subtest: BUG-005: a future-dated-only domain is omitted through the same filter without throwing
ok 2 - BUG-005: a future-dated-only domain is omitted through the same filter without throwing
--- last 12 ---
1..6
# tests 6
# suites 0
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Six rows green, zero skipped. Row 5 is the source-mutant case: it rebuilds the
module from source text with the superseded pre-filter bucket creation
reinstated and asserts that mutant THROWS `RangeError` on the same input the
shipped ordering survives. Its green therefore means the failure path was
exercised, not omitted — the aggregate cannot go green by the assertion being
absent.

### Source-mutation discrimination {#discrimination}

The discrimination is proven from both directions, and both directions are
already recorded above:

- Shipped ordering removed → the whole carrier goes red
  (six of six, [pre-fix reproduction](#pre-fix-reproduction)).
- Superseded ordering reinstated inside an otherwise-current module → the
  mutant throws `RangeError` while the shipped module returns an envelope on
  byte-identical input (carrier row 5, green in
  [focused carrier](#focused-carrier)).

A test that could not fail cannot do either of these.

### Unchanged BUG-004 regressions {#bug-004-regressions}

```text
# BUG-005 unchanged BUG-004 regression carriers (TP-B005-003, TP-B005-004)
$ node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs
exit: 0
lines: 226
sha256: 6c786136171500655c9617584a3b3dafcba724917f7910115a3537c34619e024
--- first 12 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
  ---
  duration_ms: 73.257256
  type: 'test'
  ...
# Subtest: BUG-004: an exact occurrence repeat is still refused as a duplicate
ok 2 - BUG-004: an exact occurrence repeat is still refused as a duplicate
--- last 12 ---
1..36
# tests 36
# suites 0
# pass 36
# fail 0
# cancelled 0
# skipped 0
# todo 0

$ git diff --name-only 732bccb6c^..HEAD -- tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs
exit: 0
(empty — both carriers byte-identical from the pre-fix revision through HEAD)
```

Thirty-six rows green across BUG-004's two declared carriers, and both files
are byte-identical to their pre-fix state. Re-running an unmodified carrier is
what makes it regression evidence; an edited one would prove nothing.

### Canonical repository selftest {#canonical-selftest}

```text
# BUG-005 canonical repository selftest (TP-B005-005)
$ node scripts/selftest.mjs
exit: 0
lines: 3893
sha256: 4b8229ab368f49a84f0a7f27dbf975e2e89928f199d7e6abb8e2ff561ccf29b9
--- first 8 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
--- last 8 ---
  ✓ all four window bands close at their own cutoff, so a run past the cutoff selects no window rather than one it cannot honestly satisfy (found 4/4)

================================================
Research-Lab self-test: 3409 passed, 0 failed
================================================
```

### Change boundary and contract integrity {#change-boundary}

```text
$ git diff --name-only 732bccb6c^..732bccb6c
notes/portfolio-survival-allocation-lab.md
rlportfolio.js
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/bug.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/design.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/report.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/scenario-manifest.json
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/scopes.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/spec.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/state.json
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/uservalidation.md
tests/portfolio-stale-domain-signal.unit.mjs
exit: 0

$ git diff --name-only 732bccb6c^..732bccb6c | grep -E 'BUG-004|portfolio-behavior-occurrence|portfolio-brief\.functional'
exit: 1
(empty — the BUG-005 change touches no BUG-004 artifact and no BUG-004 carrier)

$ git diff --stat 732bccb6c^..HEAD -- rlportfoliobrief.js
exit: 0
(empty — byte-identical)

$ git diff --stat 732bccb6c^..HEAD -- portfolio-survival-allocation.config.json
exit: 0
(empty — byte-identical)

$ git diff 732bccb6c^..HEAD -- rlportfolio.js | grep -nE '^[+-].*(validateInterestSignal|INTEREST_SIGNAL_FIELDS)'
exit: 1
(empty — neither symbol appears in any added or removed line)

$ git status --porcelain
exit: 0
(empty — clean tree; both historical reverts were restored)
```

Eleven changed paths, all authorized by the Change Boundary: the production
module, the new carrier, one row in the test-registry note, and this packet.
Nothing out of boundary was touched. `validateInterestSignal`,
`INTEREST_SIGNAL_FIELDS`, `rlportfoliobrief.js`, and the declared policy file
are untouched, so nothing was widened to make the carrier pass.

### Divergence resolution recorded in the governing artifacts {#divergence-resolved}

```text
$ grep -nE '^#{1,4} ' design.md
43:## Semantics Decision: Stale-Only Domains Are Omitted
50:### Candidate A — emit a null-support signal (rejected)
73:### Candidate B — omit the domain (chosen)
125:### What the fix deliberately does not do
145:## Divergence Resolution
exit: 0

$ grep -n -A 8 'EB-5' spec.md
53:### EB-5 — What remains rejected after the fix
55-The fix widens nothing. All of the following MUST still hold, and are asserted:
59-| Out-of-window evidence contributes to `evidenceScore` | No — score is unchanged for fresh domains and the stale domain has no score at all |
60-| Out-of-window evidence counts toward `minimumDistinctCompletions` / `minimumDistinctUtcDates` | No — the floor is computed only from surviving events |
61-| A domain with in-window evidence below the floor is dropped | No — it is still EMITTED with `floorSatisfied: false` and band `insufficient-evidence` |
exit: 0
```

`design.md` § Divergence Resolution states why the two derivations may
legitimately differ in FORM while agreeing in SUBSTANCE, and why no repair is
owed on the brief side. `spec.md` EB-5 pins what stays rejected after the fix.
Carrier rows 4 and 6 assert both, so the prose is enforced rather than merely
written.

### Artifact and regression quality {#artifact-and-regression-quality}

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
exit: 0
Artifact lint PASSED.

$ bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1

$ git diff --check
exit: 0
output: empty
```

## Open Verification

These remain open by design and are NOT claimed above:

- Independent certification by `bubbles.validate`. This report is
  implementation-owned evidence; it is not a certification, and no
  certification field was written by this pass.
- Human acceptance in `uservalidation.md`, which is a human-owned fact and
  cannot be produced by an agent.

## Validation Refusal — certification NOT granted {#validation-refusal}

`bubbles.validate` ran on 2026-08-25 and **refused certification**. Status
remains `in_progress`; no certification field was written.

### What replayed clean

Validation did not re-read the blocks above; it re-ran them.

```text
$ node --test tests/portfolio-stale-domain-signal.unit.mjs
CARRIER_EXIT=0   → tests 6, pass 6, fail 0, skipped 0

$ node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs
REGRESSION_EXIT=0 → tests 36, pass 36, fail 0, skipped 0

$ git diff --name-only 732bccb6c^..HEAD -- tests/portfolio-behavior-occurrence.unit.mjs \
      tests/portfolio-brief.functional.mjs rlportfoliobrief.js portfolio-survival-allocation.config.json
DIFF_EXIT=0 (empty — all four byte-identical)

$ git checkout 732bccb6c^ -- rlportfolio.js && node --test tests/portfolio-stale-domain-signal.unit.mjs
RED_EXIT=1 → tests 6, pass 0, fail 6
  name: 'RangeError'  error: 'Invalid time value'
  rlportfolio.js:2518:101 ← Object.deriveInterestSignals (rlportfolio.js:2491:48)
$ git checkout HEAD -- rlportfolio.js
RESTORE_EXIT=0 → only the three BUG-005 packet files remain dirty

$ node scripts/selftest.mjs
exit: 0  lines: 3893  → Research-Lab self-test: 3409 passed, 0 failed

$ bash .github/bubbles/scripts/artifact-lint.sh <this packet>
LINT_EXIT=0 → Artifact lint PASSED.
```

The independently reproduced RED matches the recorded reproduction exactly —
same exit code, same six failing rows, same thrown type, message and frame.

One disclosed discrepancy, checked rather than waved off: the replayed selftest
`sha256` differs from the recorded one. Two further consecutive runs produced
two more distinct hashes, so `scripts/selftest.mjs` output is non-deterministic
run-to-run and the difference is expected, not staleness. The material facts
(exit 0, 3893 lines, 3409 passed, 0 failed) match exactly. The report's
non-determinism disclosure is scoped to `node --test`; it applies here too.

### Why certification was refused

```text
$ bash .github/bubbles/scripts/state-transition-guard.sh <this packet>
GUARD_EXIT=1
🔴 TRANSITION BLOCKED: 33 failure(s), 2 warning(s)
blockingCode: DELIVERY_COMPLETION_FAILED
failedGateIds: [G022,G053,G027,G068,G093,G094,G097,G136]
workflowMode: bugfix-fastlane  auditProfile: delivery-completion-v1  targetStatus: done

$ bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification ...
G070_EXIT=1 → spec.md has no non-empty '## Outcome Contract'; declares no Hard Constraints

$ bash .github/bubbles/scripts/traceability-guard.sh <this packet>
TRACE_EXIT=1 → RESULT: FAILED (6 failures, 0 warnings)

$ bash .github/bubbles/scripts/delivery-implementation-delta-guard.sh <this packet>
G093_EXIT=1 → deliveryDeltaPaths=0 planningOnlyPaths=3 reportCodeDiffSections=0
              nextOwner: implementation
```

| Finding | Count | Owner |
| --- | --- | --- |
| G068 DoD-Gherkin fidelity, regression-E2E rows, consumer-impact sweep, change-boundary items — all `scopes.md` shape | 12 | `bubbles.plan` |
| G022 seven absent pipeline phases; `implement` claim without specialist provenance | 9 | `bubbles.workflow` |
| G027 / state integrity — `certification.completedScopes` empty against 1 Done scope | 2 | `bubbles.validate` (resolves on certification) |
| G053 + G093 — no `### Code Diff Evidence`; delivery window is planning-only | 2 | `bubbles.implement` |
| G094 capability foundation, G097 requirement-mechanism | 2 | `bubbles.design` |
| G136 human acceptance | 1 | **human — not agent-resolvable** |
| G070 Outcome Contract absent from `spec.md` | (separate gate) | `bubbles.analyst` |

Three points are load-bearing:

- **G136 blocks `done` on its own.** All six `uservalidation.md` checklist items
  are unchecked and the `## Human Acceptance Record` is present but unfilled
  (`acceptedBy: [unfilled]`). No agent may check these. The Scope 1 DoD being
  14/14 is a different artifact from human acceptance, and closing the first
  does not close the second.
- **Audit has not run.** The resolved `phaseOrder` still contains `audit` with
  no matching attempt, so this pass is pre-audit validation and could not write
  terminal certification even against a green guard.
- **G053 and G093 are largely a heading mismatch, not a missing fact.** The git
  diff is present under `### Fix confinement`; the gates read
  `### Code Diff Evidence`. The delivery window is planning-only because the
  production change landed in `732bccb6c` and `HEAD` has since advanced to
  `d54a773fa`.

G070 is a real gap rather than a convention that does not apply here: the
already-certified sibling `BUG-004` carries an Outcome Contract in its
`spec.md`, `report.md` and `state.json`, and this packet carries none anywhere.

## Outcome Contract Demonstration — 2026-08-25 {#outcome-contract-demonstration}

**Phase:** implement
**Agent:** `bubbles.implement`
**Repository binding:** `PREFLIGHT_COMMITTED decision=rb:<session>:94 revision=94 repository=research-lab root=<repo-root>`

The [validation refusal](#validation-refusal) above recorded
`G070_EXIT=1 → spec.md has no non-empty '## Outcome Contract'`. That line is a
true account of the run that produced it and is left as written. `bubbles.analyst`
has since added `## Outcome Contract` to `spec.md`, which activated the
previously dormant demonstration half of G070: the declared **Success Signal**
must be shown in evidence, not merely declared.

This section supplies that demonstration and introduces no new measurement.
Every figure in the table below is already recorded under `## Test Evidence` and
links to the block that produced it. This is implementation-owned demonstration,
not certification. Certification remains open and is still owned by
`bubbles.validate`.

### Outcome Contract Verification (G070)

| Field | Declared | Recorded evidence in this report | Status |
| --- | --- | --- | --- |
| Intent | Interest-signal derivation survives its own evidence-expiry policy. A stale-only domain resolves to nothing, the derivation returns its declared envelope instead of throwing, and the repair does not widen what counts as live evidence. | [Focused carrier GREEN](#focused-carrier) returns the envelope on the same mixed workspace that [the pre-fix module](#pre-fix-reproduction) throws on, and carrier row 4 holds below-floor in-window evidence emitted, so nothing was widened. | PASS |
| **Success Signal** | `tests/portfolio-stale-domain-signal.unit.mjs` is 6/6 green against the shipped `rlportfolio.js` and 0/6 against the same suite with only `rlportfolio.js` reverted to `732bccb6c^`, the leading row raising `RangeError: Invalid time value` from `Date.toISOString` inside `Object.deriveInterestSignals`. `SCN-B005-DISCRIMINATION` carries the same proof inside one run. Non-movement stays 36/36 and 3409 passed / 0 failed. | GREEN half: [focused carrier](#focused-carrier) `exit 0`, `tests 6, pass 6, fail 0, skipped 0`. RED half: [pre-fix reproduction](#pre-fix-reproduction) `exit 1`, `tests 6, pass 0, fail 6`, `name: 'RangeError'`, `error: 'Invalid time value'`, frame `rlportfolio.js:2518:101` reached from `Object.deriveInterestSignals (rlportfolio.js:2491:48)`. Single-run half: carrier row 5, the reinstated pre-filter mutant, green inside the same GREEN run and read in [source-mutation discrimination](#discrimination). Non-movement: [BUG-004 regressions](#bug-004-regressions) `exit 0`, `tests 36, pass 36, fail 0`, both carriers byte-identical from `732bccb6c^` through `HEAD`; [canonical selftest](#canonical-selftest) `exit 0`, `3409 passed, 0 failed`. | PASS — every declared half is recorded |
| Hard Constraints | One envelope protocol and never a throw; omission rather than a null-support row; `validateInterestSignal` unchanged and still strict; below-floor in-window evidence still emitted; out-of-window evidence contributes nothing and the window does not move; one stale domain does not suppress a fresh sibling; the filter keeps its position relative to `dedupeBehaviorEvents`; the change is confined to statement ordering and persists no new field. | Carrier rows 1-4 and 6 assert the envelope protocol, omission over null support, sibling survival, and below-floor emission executably. Order preservation is carried by [BUG-004 regressions](#bug-004-regressions) at 36/36 against byte-identical carriers. Confinement and the untouched window and validator rest on the diff receipts in [fix confinement](#fix-confinement), [code diff evidence](#code-diff-evidence) and [change boundary](#change-boundary), which are inspection rather than assertion. | PARTIAL — executable for the behavioral constraints, diff-backed for the confinement constraints |
| Failure Condition | The repair fails if a stale-only domain reacquires a bucket and throws, if it is emitted at all, if omission swallows below-floor in-window evidence, if a stale domain erases a fresh sibling, if the filter/dedupe order reopens BUG-004, or if the carrier ever passes against pre-fix source. | The first four classes are directly rejected by carrier rows 1-4, green in [focused carrier](#focused-carrier). Order regression is rejected by 36/36 in [BUG-004 regressions](#bug-004-regressions). Verification vacuity is rejected by the recorded 0/6 in [pre-fix reproduction](#pre-fix-reproduction): the suite does go red on pre-fix source, so its green discriminates. | PASS for the executable classes |

The pair is what carries the Success Signal, and both halves of the pair are
recorded above rather than asserted here. A suite that only passed would not
satisfy the declared signal, because the contract names the 0/6 red as part of
it.

**Command:** `bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir <bug-folder>`
**Exit Code:** 0
**Claim Source:** executed

```text
$ bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
goal-fidelity-guard: PASS boundary=pre-certification
GF_GUARD_EXIT_AFTER=0
```

Baseline for that run, executed in the same session before this section was
written: `GOAL-FIDELITY[GF-6] ... report.md never references the declared
Success Signal`, `goal-fidelity-guard: FAIL boundary=pre-certification
findings=1`, exit `1`. Findings moved 1 → 0.

G070 remains one input to certification and not certification itself. The
[validation refusal](#validation-refusal) above lists the other blocking gates,
including G136 human acceptance, which no agent may close.

## Test Phase — 2026-08-25 {#test-phase-2026-08-25}

Executed by `bubbles.test` at working-tree `HEAD 89561775e`, `git status
--porcelain` empty at entry and at exit. Every command below ran in THIS session
against a clean tree; nothing here is adopted from a prior run or from
operator-supplied scrollback.

### Declared carriers re-executed {#test-phase-carriers}

**Claim Source:** executed

```text
$ node --test tests/portfolio-stale-domain-signal.unit.mjs
✔ BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing (88.67385ms)
✔ BUG-005: a future-dated-only domain is omitted through the same filter without throwing (9.360342ms)
✔ BUG-005: a stale domain must not suppress the fresh domains beside it (54.535462ms)
✔ BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing (39.422956ms)
✔ BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red (81.206097ms)
✔ BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance (47.624205ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 418.264309
===TP_B005_001_002_EXIT=0===
```

TP-B005-001 and TP-B005-002, exit `0`, 6 of 6.

**Claim Source:** executed

```text
$ node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs
✔ BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity (121.454291ms)
✔ BUG-004: an exact occurrence repeat is still refused as a duplicate (43.063349ms)
✔ BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn (110.849654ms)
✔ BUG-004: stored occurrence growth is bounded by the declared behaviour-event cap (25.964449ms)
✔ BUG-004: reinstating the superseded content+civil-day predicate turns the accepted-occurrence assertion red (87.819188ms)
✔ BUG-004: the evidence-age window is applied before semantic collapse, so a stale first occurrence cannot erase a fresh repeat (120.971994ms)
✔ BUG-004: a corrupt policy still refuses on an empty workspace, and refuses exactly as the removed call did (31.440317ms)
✔ BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing (13.975319ms)
✔ Regression: BUG-004 same-semantic occurrences cannot inflate relevance (95.239445ms)
ℹ tests 36
ℹ suites 0
ℹ pass 36
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 772.714995
===TP_B005_003_004_EXIT=0===
```

TP-B005-003 and TP-B005-004, exit `0`, 36 of 36. Nine of the thirty-six rows are
quoted above; the run emitted all thirty-six and the counters are the full-run
totals.

**Claim Source:** executed

```text
# TP-B005-005 selftest (bubbles.test phase)
$ node scripts/selftest.mjs
exit: 0
lines: 3893
sha256: e4527d305250f386e86c8a4277e2ce043532bf11281d23faa7dc90fc882f4e8a
--- last 20 ---
================================================
Research-Lab self-test: 3409 passed, 0 failed
================================================
```

TP-B005-005, exit `0`, 3409 passed, 0 failed. Bounded through
`evidence-capture.sh`; the hash covers all 3893 produced lines and is
re-derivable with `--verify`.

### Discrimination re-proved independently, not adopted {#test-phase-discrimination}

The pre-fix RED was supplied to this agent as context. It was NOT restated as
this agent's evidence — it was re-executed here, in an isolated detached
worktree at `732bccb6c^` (`31aad20d4`), with the current carrier copied in
byte-identically (`cmp` reported identical). The working tree was never mutated:
`git status --porcelain` was empty before and after, and the worktree was
removed and pruned.

**Claim Source:** executed

```text
$ git worktree add --detach /tmp/b005-red 732bccb6c^
$ cp tests/portfolio-stale-domain-signal.unit.mjs /tmp/b005-red/tests/
$ cmp tests/portfolio-stale-domain-signal.unit.mjs /tmp/b005-red/tests/portfolio-stale-domain-signal.unit.mjs
cmp: identical
$ grep -c 'Created HERE, after the age filter' rlportfolio.js    # in the worktree
0
$ node --test tests/portfolio-stale-domain-signal.unit.mjs       # in the worktree
ℹ tests 6
ℹ pass 0
ℹ fail 6
  RangeError: Invalid time value
      at Date.toISOString (<anonymous>)
      at /tmp/b005-red/rlportfolio.js:2518:101
      at Array.map (<anonymous>)
      at Object.deriveInterestSignals (/tmp/b005-red/rlportfolio.js:2491:48)
===PREFIX_RED_EXIT=1===
```

Exit `1`, 0 of 6, `RangeError: Invalid time value` at `rlportfolio.js:2518:101`
reached through `Array.map` from `deriveInterestSignals` at `2491:48`. Five of
the six rows fail on that throw. The sixth, the source-mutation control, fails
for a different and correct reason — at `732bccb6c^` the shipped post-filter
ordering it mutates does not yet exist, so its anchor assertion fires
(`0 !== 1`). Row 5 is therefore an **in-run control at HEAD**, not a
cross-revision one, and this section does not claim otherwise.

Row 5's discrimination is real and re-runs on every invocation: it reads shipped
`rlportfolio.js`, asserts each anchor appears exactly once, rewrites the bucket
creation back to the superseded pre-filter position, loads the mutant from
source text in a throwaway browser-shaped root, confirms the mutant still
derives fresh-only input successfully (so it is not a strawman), asserts the
mutant throws `RangeError` on the mixed workspace, and asserts the shipped
module survives the identical input. The mutation is a faithful inverse of the
`732bccb6c` diff.

### Test integrity {#test-phase-integrity}

**Claim Source:** executed

```text
$ grep -rnE 't\.Skip|\.skip\(|xit\(|xdescribe\(|\.only\(|test\.todo|it\.todo|pending\(' \
    tests/portfolio-stale-domain-signal.unit.mjs \
    tests/portfolio-behavior-occurrence.unit.mjs \
    tests/portfolio-brief.functional.mjs
skip_scan_exit=1 (1 = zero matches = clean)

$ bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-stale-domain-signal.unit.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
RQG_DEFAULT_EXIT=0

$ bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-stale-domain-signal.unit.mjs
✅ Adversarial signal detected in tests/portfolio-stale-domain-signal.unit.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files with adversarial signals: 1
RQG_BUGFIX_EXIT=0
```

Zero skip, only, or todo markers across the three carriers. Adversarial signal
detected in the BUG-005 carrier in both guard modes.

### TP-B005-007 executed — the declared browser matrix {#test-phase-tp-b005-007}

TP-B005-007 was declared in the Test Plan and marked **NOT YET EXECUTED IN THIS
PACKET — routed to `bubbles.test`**. It is now executed by this agent, for this
packet, at `HEAD 89561775e`.

**Claim Source:** executed

```text
# TP-B005-007 Feature 008 browser matrix (bubbles.test phase)
$ npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --project=system-chrome
exit: 0
lines: 303
sha256: b92af567a3f381ad9352ec9842d821c3dad96b828217076132a4cd8d9c731e02
--- last lines ---
  94 passed (2.0m)
===TP_B005_007_WRAPPER_EXIT=0===
```

Exit `0`, 94 passed, 0 failed, across all eight `portfolio-survival-*.spec.mjs`
carriers. The count 94 coincides with BUG-004's `TP-B004-006` receipt; this is a
separate execution performed here at this revision and does not reuse that
receipt. The relocation in `732bccb6c` disturbed no shipped browser surface.

### Coverage gap — TP-B005-006 is unauthorable as specified {#test-phase-coverage-gap}

TP-B005-006 asks for a browser row asserting that a stale-only workspace renders
the allocation lab without an uncaught `RangeError`. Authoring that row as
written would produce a **tautological** test, because the browser never reaches
the repaired function. Rather than author a row that would pass identically
against pre-fix source, this agent refused it and routed it.

**Claim Source:** executed — the call-graph facts below

```text
$ grep -rn 'interestSignals' --include='*.html' --include='*.js' . | grep -v '/tests/' | grep -v '_site/'
./portfolio-survival-allocation-lab.html:3059:  ? state.opened.workspace.interestSignals
./rlportfolio.js:1135:      interestSignals: [],            # createEmptyWorkspace
./rlportfolio.js:2545:    candidate.interestSignals = derived.value;   # ONLY writer
...

$ grep -rn 'buildInterestSignalCandidate' . --include='*.mjs' --include='*.js' --include='*.html' | grep -v '_site/'
./rlportfolio.js:2541:  function buildInterestSignalCandidate(currentWorkspace, now, policy) {
./rlportfolio.js:4931:    buildInterestSignalCandidate: buildInterestSignalCandidate,
./tests/portfolio-foundation.unit.mjs:1044
./tests/portfolio-foundation.unit.mjs:1904
./tests/portfolio-privacy.functional.mjs:1704

$ grep -rlE '\bRLPORTFOLIO\b' --include='*.html' . | grep -v '_site/'
./portfolio-survival-allocation-lab.html            # the ONLY page loading rlportfolio.js

$ grep -nE 'buildInterestSignalCandidate|api\.deriveInterestSignals' portfolio-survival-allocation-lab.html
grep_exit_2=1 (1 = names neither)

$ grep -nE '\bapi\s*\[' portfolio-survival-allocation-lab.html
grep_exit_1=1 (1 = no dynamic dispatch on the alias at line 1253)
```

**Claim Source:** interpreted — the reachability conclusion drawn from those greps

The repaired `rlportfolio.deriveInterestSignals` is reachable only through
`buildInterestSignalCandidate`, whose only callers anywhere in the repository
are three test files. The single page that loads `rlportfolio.js` aliases the API
at `portfolio-survival-allocation-lab.html:1253` and names neither symbol, and
performs no bracket dispatch on that alias. This is a build-free repository with
no bundler and no dynamic dispatch, so the static call graph is complete.
Conclusion: **the repaired function is not reachable from any shipped page at
this revision**, therefore a browser row asserting "the lab does not throw"
cannot discriminate the fix.

**Uncertainty Declaration.** This is reasoned from executed greps over a
complete static call graph; it is NOT a runtime observation. This agent did not
instrument a live page load to record that `deriveInterestSignals` is never
invoked. A runtime probe would upgrade this from `interpreted` to `executed`.
No DoD item is advanced on it.

Two consequences are routed, not resolved here:

1. `TEST-B005-T1` — TP-B005-006 cannot be authored as specified. The Test Plan is
   `bubbles.plan`-owned content, so re-specification is routed there.
2. `TEST-B005-T2` — `bug.md` § Blast Radius states the lab "reads that persisted
   array at `portfolio-survival-allocation-lab.html:3059`" and concludes the
   defect "permanently breaks interest-signal derivation and the view-exclusion
   accounting ... until the user clears local history." That user-facing
   conclusion requires a writer for `workspace.interestSignals`, and the only
   writer has no shipped caller. The separate question this raises — whether the
   Black-Litterman exclusion accounting at line 3059 is silently computing over a
   permanently empty array — is a spec-versus-implementation question outside
   this agent's ownership and is routed rather than answered.

Neither routing weakens the fix. `deriveInterestSignals` and
`buildInterestSignalCandidate` are both frozen public exports at
`rlportfolio.js:4931-4932` with three existing test consumers; a public export
that throws `RangeError` on a legitimate workspace shape is a real defect at the
module contract boundary, which is exactly where this packet proved it (0 of 6
RED → 6 of 6 GREEN).

### Test phase verdict {#test-phase-verdict}

`✅ TESTED` for the executable scope of this packet. Five of the seven Test Plan
rows are executed and green (TP-B005-001 through TP-B005-005), and TP-B005-007
is now executed and green. TP-B005-006 remains unauthored by deliberate refusal
with the reasoning recorded above.

This agent wrote only `report.md` and the execution-owned half of `state.json`.
It did not write `status`, `certification.*`, `uservalidation.md`, or any DoD
checkbox. The [validation refusal](#validation-refusal) stands; the other
blocking gates, including G136 human acceptance, are untouched by this phase.

## Regression Phase — 2026-08-25 {#regression-phase-2026-08-25}

Executed by `bubbles.regression` at `HEAD 363effa64`, scoped to Feature 008.
This phase does not re-prove the fix; the [test phase](#test-phase-2026-08-25)
did that. It asks the four delta questions instead: did a previously-passing
test start failing, did this change reach another spec, does the design
contradict a neighbouring one, and did coverage drop.

**Working-tree state, disclosed.** The tree was NOT clean at entry. Seven files
were already modified and remain so at exit:
`.github/agents/bubbles.{bug,goal,iterate,sprint,workflow}.agent.md`,
`.github/bubbles/.checksums`, `.github/bubbles/.install-source.json`. All seven
are framework-install artifacts owned by the Bubbles installer, none is product
source or a Feature 008 artifact, and `git status --porcelain -- rlportfolio.js
tests/ scripts/ specs/008-portfolio-survival-and-brief-lab/` returned empty, so
every lane below ran against committed product source. This agent did not
create, touch, or resolve those seven files.

### Baseline comparison {#regression-baseline}

The baseline is the [test phase](#test-phase-2026-08-25) receipt set, taken at
`HEAD 89561775e`. This phase ran at `363effa64`. The baseline therefore MOVED,
and every delta below is reconciled to a cause rather than reported as noise.

| Lane | Baseline `89561775e` | This phase `363effa64` | Delta | Status |
|---|---|---|---|---|
| BUG-005 carrier (1 file) | 6/6 pass, exit 0 | 6/6 pass, exit 0 | 0 | 🟢 CLEAN |
| BUG-004 coherence lane (2 files) | 36/36 pass, exit 0 | 36/36 pass, exit 0 | 0 | 🟢 CLEAN |
| Feature 008 Node carriers (16 files) | not run as a set | 257/257 pass, exit 0 | new, wider | 🟢 CLEAN |
| Repository selftest | 3409 passed, 0 failed | 3411 passed, 0 failed | **+2** | 🟢 CLEAN (coverage up) |
| Feature 008 browser lane | 94 passed, 1 project | 188 passed, 2 projects | **+94** | 🟢 CLEAN (coverage up) |

Both non-zero deltas are increases, and both are attributed to causes outside
this packet:

- **selftest +2.** `scripts/selftest.mjs` changed by `+175/-6` between the two
  revisions, across three commits that belong to other packets: `b13924e9c`
  (BUG-016 W5), `cdff776c5` (BUG-016 W4), `17dafde4f` (BUG-019). Over the same
  range `git log 732bccb6c..363effa64 -- rlportfolio.js` is empty, so the
  changed product module is byte-identical to the one the test phase measured.
- **browser +94.** The baseline ran `--project=system-chrome`; this phase ran
  the unfiltered project matrix, so each of the 94 rows executed twice
  (`188 = 94 × 2`). This is a widening, not a different suite. Both projects
  already existed at `89561775e`; the `playwright.config.mjs` change in that
  range is comment-only around an unchanged `workers: 2`.

**Claim Source:** executed

```text
$ node --test tests/portfolio-stale-domain-signal.unit.mjs
✔ BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing (106.080404ms)
✔ BUG-005: a future-dated-only domain is omitted through the same filter without throwing (15.145715ms)
✔ BUG-005: a stale domain must not suppress the fresh domains beside it (67.876019ms)
✔ BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing (43.280757ms)
✔ BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red (83.260832ms)
✔ BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance (50.499017ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 478.212914
CARRIER_EXIT=0
```

Note the filename. The dispatch named a carrier `portfolio-stale-domain.unit.mjs`
under `tests/`; no such file exists, so it is deliberately NOT written here as a
repo-root path — `scripts/validate-spec-test-paths.mjs` reads any `tests/*.mjs`
token in a committed spec artifact as a claim that the file exists, and spelling
the absent name in full turns this honest disclosure into a selftest failure. Do
not "restore" the prefix. The carrier this packet actually ships is
`tests/portfolio-stale-domain-signal.unit.mjs`, which is what ran above and what
`scenario-manifest.json` links.

**Claim Source:** executed

```text
# regression: all 16 Feature 008 Node carriers
$ node --test tests/portfolio-allocation.functional.mjs tests/portfolio-analytics.unit.mjs tests/portfolio-bar-coverage.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-doc-integration.functional.mjs tests/portfolio-dossier.functional.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-paths.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-risk.functional.mjs tests/portfolio-stale-domain-signal.unit.mjs tests/portfolio-test-integrity.unit.mjs tests/portfolio-workspace.functional.mjs
exit: 0
lines: 1553
sha256: 117dfcdcc79289270cb3783cf0318275d2df80d296dcc7ea457326c22f803f8c
--- last 20 ---
1..257
# tests 257
# suites 0
# pass 257
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 15344.852787
```

The 16 files are every `tests/portfolio-*.mjs` carrier that imports from
`node:test`; the eight `portfolio-survival-*.spec.mjs` files import neither and
are Playwright, so they run in the browser lane below rather than here.

**Claim Source:** executed

```text
# regression: repo-wide selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3895
sha256: a79a1a8e53da36829f064e060ef66294c77a7c39b07f88112de46cde211c39ca
--- last 20 ---
================================================
Research-Lab self-test: 3411 passed, 0 failed
================================================
```

**Claim Source:** executed

```text
# regression: Feature 008 browser lane (8 portfolio-survival specs)
$ npx playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs
exit: 0
lines: 601
sha256: d53472aa93a1fef1fae6ff3163656a927ec5335e993eac48bb846c396812ebd6
--- last lines ---
  188 passed (6.0m)
```

The three bounded blocks above were produced by
`.github/bubbles/scripts/evidence-capture.sh`, which runs the command itself and
hashes the FULL output, so each is re-derivable with `--verify` rather than only
re-readable. Per the [provenance note](#evidence-provenance), `node --test`
embeds per-test `duration_ms`, so each hash verifies its own capture and is not
a cross-run identity claim.

### Cross-spec impact scan {#regression-cross-spec}

The fix commit `732bccb6c` changed exactly three files outside its own packet
artifacts: `rlportfolio.js` (`+20/-9`), `notes/portfolio-survival-allocation-lab.md`
(`+1`), and the new carrier (`+335/-0`). Only the first is executable product
source, so the blast radius is the reachable set of one function.

**The ordering hazard was the real risk here, and it is refuted, not assumed.**
Moving bucket creation out of the raw-event loop and into the post-dedupe loop
changes the INSERTION order of `byDomain`, which would be a silent behavioural
regression for any consumer reading that object positionally. It cannot reach
one: `rlportfolio.js:2492` emits with `Object.keys(byDomain).sort()` and
`rlportfoliobrief.js:519` emits with `Object.keys(buckets).sort()`. Both sort,
so insertion order is discarded before any caller sees it. The single
index-sensitive consumer in the repository,
`portfolio-survival-allocation-lab.html:6520`, reads
`ranked.value.interestSignals[0]` off the brief module's already-sorted array.

| Reachable consumer | Relationship to the change | Result |
|---|---|---|
| `rlportfolio.js:2542` `buildInterestSignalCandidate` | sole in-module caller | 🟢 covered by the 257-test lane |
| `rlportfolio.js:4931-4932` frozen export table | contract boundary | 🟢 export-shape rows green in `portfolio-brief.functional.mjs` |
| `rlportfoliobrief.js` `deriveInterestSignals` | different module, unchanged by `732bccb6c` | 🟢 carrier row 6 asserts the two agree |
| `portfolio-survival-allocation-lab.html:6422,6520` | calls the BRIEF export, not the changed one | 🟢 188-row browser lane green |
| `tests/portfolio-{foundation,privacy,behavior-occurrence,brief}` | the four test consumers | 🟢 all inside the 257-test lane |

Specs 002, 007, 012, 019 and 021-024 reference `rlportfolio.js` as a module but
call neither `deriveInterestSignals` nor `buildInterestSignalCandidate`; the
repository-wide grep for both symbols returns only the rows tabulated above.
No route collision, no shared-table mutation, and no API contract change was
found, because the change adds no symbol and alters no signature.

### Design coherence {#regression-design-coherence}

The coherence risk is with BUG-004, not with a distant spec: `a59e38d71`
(BUG-004) is the immediately preceding commit in the same function, and BUG-005
relocated code that BUG-004 placed. `design.md:127-128` claims the fix "does not
move the age filter relative to `dedupeBehaviorEvents`" because "BUG-004 settled
that placement".

That claim is verified against the source, not accepted. In the post-fix module
the first `forEach` still ends with the age check followed by
`eligibleEvents.push(event)`, so the array handed to `dedupeBehaviorEvents` is
composed by the identical predicate as before; the diff moves only the bucket
literal. BUG-004's declared carriers confirm it executably:

**Claim Source:** executed

```text
# regression: BUG-004 coherence lane (baseline 36)
$ node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs
exit: 0
lines: 226
sha256: b5757e50d4ead852fe9f6dcc72b68be7e13e8c3f5c06a2d4c24e3f95aecb8d7d
--- last 20 ---
1..36
# tests 36
# suites 0
# pass 36
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1724.32207
```

36 of 36, identical to baseline. No design contradiction found.

### Coverage regression {#regression-coverage}

**Claim Source:** executed

```text
$ git show --numstat --format='' 732bccb6c -- tests/
335     0       tests/portfolio-stale-domain-signal.unit.mjs

$ grep -rnE '\.(skip|only|todo)\(|\{\s*skip:\s*true|\{\s*todo:\s*true' <the 16 Node carriers>
SKIP_SCAN_EXIT=1 (1 = zero matches = clean)
```

- **No pre-existing carrier was weakened.** The fix commit's only `tests/` entry
  is `335` added against `0` deleted on a file that did not previously exist, so
  no existing assertion was removed, relaxed, or re-scoped.
- **No suppression markers.** Zero `skip`/`only`/`todo` across all 16 carriers.
- **Scenario traceability is 5 of 5.** Every scenario in
  `scenario-manifest.json` — `SCN-B005-STALE-OMITTED`, `-FRESH-SIBLING`,
  `-DISCRIMINATION`, `-FLOOR-PRESERVED`, `-BRIEF-AGREEMENT` — is `regressionRequired: true`,
  links this carrier, and maps to a named green row above. The carrier's sixth
  row, the future-dated-only case, exceeds the manifest rather than duplicating it.

**Claim Source:** executed

```text
$ bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-stale-domain-signal.unit.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
GUARD_DEFAULT_EXIT=0
---
$ bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-stale-domain-signal.unit.mjs
✅ Adversarial signal detected in tests/portfolio-stale-domain-signal.unit.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
GUARD_BUGFIX_EXIT=0
```

Checks R6 and R7 pass: no silent-pass bailout in the required carrier, and the
bug-fix regression carries an adversarial case rather than a tautological one.

### Deployment regression scan — not applicable {#regression-deployment}

Measured rather than assumed. `deploy/`, `scripts/deploy/`,
`config/research-lab.yaml` and `.github/workflows/build.yml` are all ABSENT; the
only workflows present are `pages.yml` and `tier-a.yml`. Research Lab is a
build-free, single-file, GitHub-Pages repository with no image artifact, config
bundle, or deployment manifest, so Gate G081 has no surface to regress here.

### Out of scope, and why that is defensible {#regression-out-of-scope}

The dispatch scoped this phase to Feature 008 and named `bond-regime-lab`,
spec 013 and spec 018 as out-of-scope failures. This agent did NOT run them and
does NOT report on their state. It did establish that they cannot be downstream
of this change:

**Claim Source:** executed

```text
$ grep -c 'rlportfolio' bond-regime-lab.html          → 0
$ grep -c 'rlportfolio' tests/bond-regime-lab.spec.mjs → 0
$ specs/013-market-regime-stack-and-strategy-playbook  → 0 file(s) referencing rlportfolio
$ specs/018-headless-official-curve-publication        → 0 file(s) referencing rlportfolio
```

Zero static dependency on the changed module in all three. Whatever their state,
`732bccb6c` is not its cause. **Boundary limit, stated plainly:** this is a
static-reference argument in a build-free repository with no bundler; it is
NOT an observation of those suites running, and no verdict about them is
implied here.

### Findings routed {#regression-findings}

| ID | Finding | Owner | Blocking for this phase |
|---|---|---|---|
| REG-B005-R1 | All five `scenario-manifest.json` scenarios still read `status: "not_started"` although each now has a named green carrier row. This is manifest bookkeeping, not a regression, and the manifest is planning-owned. | `bubbles.plan` | No |
| REG-B005-R2 | Seven framework-install files were dirty in the working tree at entry and exit, unrelated to this packet and unowned by this agent. Recorded so a later G073/G090 foreign-dirty reading has a dated cause. | operator | No |

Neither finding is a regression, and neither is fixed here: `scenario-manifest.json`
is a foreign artifact for this agent, and the dirty framework files are outside
this packet's work boundary.

### Regression verdict {#regression-verdict}

🟢 **REGRESSION_FREE**

- Test baseline: 6/6, 36/36, 257/257, 188/188 and 3411/0, every lane exit `0`.
- Previously-passing tests that now fail: **0**.
- Cross-spec conflicts: **0** (the insertion-order hazard is refuted by two
  `.sort()` boundaries).
- Design contradictions: **0** (BUG-004's placement is intact and green).
- Coverage: strictly up (+2 selftest assertions, +94 browser rows); zero
  suppression markers; no pre-existing carrier weakened.
- Scenario traceability: 5 of 5.

**What this verdict does NOT claim.** It is a delta verdict, not certification.
The [validation refusal](#validation-refusal) stands unchanged: G022, G053,
G027, G068, G093, G094, G097 and G136 are untouched by this phase, six pipeline
phases remain absent, and G136 still requires a human. This agent wrote only
`report.md` and the execution-owned half of `state.json`; it did not write
`status`, `certification.*`, `uservalidation.md`, or any DoD checkbox.

---

## Simplify Phase — 2026-08-25 {#simplify-phase-2026-08-25}

Executed as `bubbles.simplify` at HEAD `363effa64`, scoped to the code the fix
commit `732bccb6c` actually changed: the ~20-line relocation inside
`deriveInterestSignals` in `rlportfolio.js`. This is a cleanup pass, not a
re-proof of the fix and not certification.

**Working-tree state, disclosed rather than assumed clean.** At entry the seven
framework-install files already recorded as REG-B005-R2 were modified and remain
so at exit (`.github/agents/bubbles.{bug,goal,iterate,sprint,workflow}.agent.md`,
`.github/bubbles/.checksums`, `.github/bubbles/.install-source.json`). None is
product source or a Feature 008 artifact. `rlportfolio.js` was clean at entry.

### Findings considered and REJECTED — no churn applied {#simplify-rejected}

Three candidates were examined against source and rejected with a reason, rather
than applied to make the pass look productive.

- **Duplicated age computation is structurally necessary, not a defect.**
  `(Date.parse(now) - Date.parse(event.occurredAt)) / 86400000` appears twice in
  the function, at `rlportfolio.js:2462` (the age filter) and `:2485` (the decay
  term). It cannot be collapsed to one evaluation: `dedupeBehaviorEvents` sits
  between the two loops, so accumulating `score` in the first loop would count
  pre-collapse repeats and inflate every domain. The only available change is
  cosmetic extraction of a one-line expression used twice inside a single
  function. That is a stylistic preference, not evidence-driven, so it was not
  applied. The third `86400000` at `:2520` is a different operation — adding the
  retention window to derive `expiresAt`, not measuring an age.
- **`var byDomain` was left where it is.** Moving the declaration below the
  filter loop was considered as a tripwire against a future edit re-creating a
  bucket pre-filter. `var` is function-scoped and hoisted, so the name stays in
  lexical scope either way; the move would convert a silent wrong bucket into a
  `TypeError` only at runtime, while making the declaration read as stranded
  mid-function in a file that is deliberately ES5/UMD with no build step. Not
  worth the churn; the comment already carries the invariant.
- **No dead code.** `dedupeBehaviorEvents`'s `inputCount` / `retainedCount` /
  `collapsedCount` are asserted by `tests/portfolio-foundation.unit.mjs:631-643`,
  and the function is exported at `rlportfolio.js:4949` and consumed by three
  carriers. Nothing in the changed block is unreachable.

**Reuse across modules was NOT merged, deliberately.** `rlportfoliobrief.js:331`
defines its own `dedupeBehaviorEvents` with a different signature and a different
contract (`BehaviorInterestSignal/v1` versus `portfolio-interest-signal/v1`), and
the comment at `rlportfoliobrief.js:493` records why the `portfolio` call was
replaced by an inline collapse — hoisting `validatePolicy` would change which
refusal a doubly-invalid policy reports. That divergence is established by
BUG-004 and is intentional. Merging them was out of scope and is not recommended.

### Finding APPLIED 1 — the comment misstated the failure mode {#simplify-comment}

The comment the fix introduced said `expiresAt` "becomes an invalid date". It
does not; it throws. This matters because the bug's entire severity is that it
*crashes*: a reader who believes the failure merely produces a bad string could
reasonably relax the guard. The claim was measured rather than asserted.

```text
$ node -e "try { console.log(new Date(Date.parse(null) + 30*86400000).toISOString()); } catch (e) { console.log('THREW:', e.constructor.name + ':', e.message); } console.log('Date.parse(null) =', Date.parse(null));"
THREW: RangeError: Invalid time value
Date.parse(null) = NaN
```

The correction is one line, comment-only, zero behavior change:

```text
$ git diff rlportfolio.js
-      // bucket at all: `latest` would stay null and `expiresAt` below becomes an invalid date.
+      // bucket at all: `latest` would stay null and `expiresAt` below then THROWS RangeError.
```

**Claim Source:** executed

### Finding APPLIED 2 — this packet's report.md was breaking the repo selftest {#simplify-selftest-break}

The canonical selftest was RED on entry at `3410 passed, 1 failed`, exit 1. This
was **not** caused by the comment edit, and the cause was named from the guard's
own output rather than inferred.

> **Declared elision.** In the block below, and ONLY there, the offending path
> literal is rendered as `‹absent-path›`. Nothing else is altered. The literal is
> elided for the exact reason this finding documents: writing it in full inside a
> committed spec artifact is what fails the guard, so quoting the guard verbatim
> would re-break the gate the quote exists to explain. Expand `‹absent-path›` to
> the carrier name the dispatch used, under `tests/`, given in prose above.

```text
$ node -e "import('./scripts/validate-spec-test-paths.mjs').then(m=>{const r=m.validateSpecTestPaths(process.cwd()); console.log('ok=',r.ok,'vacuous=',r.vacuous); console.log(JSON.stringify(r.newMissing,null,2));});"
ok= false vacuous= false
newMissing count= 1
[
  {
    "path": "‹absent-path›",
    "sites": [
      {
        "artifact": "specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/report.md",
        "line": 1043,
        "spec": "specs/008-portfolio-survival-and-brief-lab"
      }
    ]
  }
]
```

The guard reads spec artifacts and the `tests/` tree; it never opens
`rlportfolio.js`, and it named `report.md:1043` — the regression phase's own
prose, which correctly disclosed that the dispatch had misnamed the carrier. The
disclosure was true and worth keeping; what broke the gate was writing the absent
name as a live repo-root `tests/*.mjs` token, which `TEST_PATH_TOKEN`
(`validate-spec-test-paths.mjs:60`) reads as a claim that the file exists.

The fix preserves the fact and drops only the path prefix, and says why, so a
later editor does not "restore" it and re-break the gate. **No true information
was deleted to make a gate green.** The correct carrier remains
`tests/portfolio-stale-domain-signal.unit.mjs`, named in full because it exists.

### Verification {#simplify-verification}

Both commands were re-run after the edits. Real exit codes:

```text
$ node --test tests/portfolio-stale-domain-signal.unit.mjs
✔ BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing (121.273438ms)
✔ BUG-005: a future-dated-only domain is omitted through the same filter without throwing (15.181018ms)
✔ BUG-005: a stale domain must not suppress the fresh domains beside it (66.522437ms)
✔ BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing (52.230415ms)
✔ BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red (122.920629ms)
✔ BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance (67.79913ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 572.917973
EXIT=0
```

```text
# simplify: canonical repository selftest after report.md path-token correction
$ node scripts/selftest.mjs
exit: 0
lines: 3895
sha256: a674e74249a4377588fa483f7024a886b8733f2584415754763b924b6a21511a
--- last 4 ---
================================================
Research-Lab self-test: 3411 passed, 0 failed
================================================
```

The selftest block came from `evidence-capture.sh`, which ran the command and
hashed the full 3895-line output, so it is re-derivable with `--verify`. The
count returned to `3411 passed, 0 failed` — byte-identical to the baseline the
[regression phase](#regression-phase-2026-08-25) recorded, which is the strongest
available evidence that the comment edit changed nothing and that the single
failure was the path token alone.

**Claim Source:** executed

### Simplify verdict {#simplify-verdict}

**MINIMAL — the fix needed no structural change.** The relocation in
`deriveInterestSignals` is already the smallest correct edit: it moves the bucket
literal and nothing else, carries a why-comment at the point of the hazard, and
introduces no duplication, no dead code, and no reusable abstraction that the
module lacks. Three candidate simplifications were examined and rejected on the
record. Two things were genuinely wrong and were fixed: a comment that
understated a throw as a bad value, and a `tests/*.mjs` token in this packet's
own `report.md` that was failing the repository selftest.

**What this verdict does NOT claim.** It is a cleanup verdict, not certification
and not a re-proof of the fix. The [validation refusal](#validation-refusal)
stands unchanged: G022, G053, G027, G068, G093, G094, G097 and G136 are untouched
by this phase. With `simplify` now recorded, the still-absent required phases are
**stabilize, security, validate and audit**, and G136 still requires a human. The
browser lane was NOT re-run in this phase — the changes are one code comment and
one line of report prose, neither reachable by a browser assertion — so the
regression phase's browser verdict is unchanged rather than re-established. This
agent wrote only `report.md`, one comment line in `rlportfolio.js`, and the
execution-owned half of `state.json`; it did not write `status`,
`certification.*`, `uservalidation.md`, or any DoD checkbox.
