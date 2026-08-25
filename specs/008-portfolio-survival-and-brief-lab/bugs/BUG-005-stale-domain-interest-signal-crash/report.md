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

## Independent Implement Provenance Verification - 2026-08-25 {#implement-provenance-verification-2026-08-25}

- **Phase:** `implement`
- **Execution actor:** `bubbles.bug` (delegated BUG-005 implementation provenance)
- **Recorded at:** `2026-08-25T17:57:02Z`
**Claim Source:** executed

This is independent verification of a pre-existing implementation. It does not
claim authorship of the production change. Commit `732bccb6c` identifies
`pkirsanov` as its author and predates this invocation. The existing
`execution.completedPhaseClaims` entry remains attributed to
`bubbles.implement`; the additive `executionHistory` record states only what
this `bubbles.bug` invocation independently inspected and executed to back that
already-existing claim. No production source, carrier, note, planning artifact,
human-acceptance field, certification field, DoD checkbox, or status changed in
this verification.

Gate G022 Check 6B explicitly accepts a `bubbles.bug` history entry as delegated
provenance for `implement` when `provenanceMode` is `specialist`. That is the
record shape used here. No parent-expansion claim and no invented specialist
invocation is recorded.

### Production commit and current module inspection

The production commit and all of its paths were inspected directly. The only
non-packet paths in the commit are one production module, one new carrier, and
one registry-note row.

```text
$ timeout 30 git show --format=fuller --name-status 732bccb6c
commit 732bccb6c8949008d3eaf9323c26d85467352e44
Author:     pkirsanov <pkirsanov@users.noreply.github.com>
AuthorDate: Tue Aug 25 05:38:06 2026 +0000
Commit:     pkirsanov <pkirsanov@users.noreply.github.com>
CommitDate: Tue Aug 25 05:38:06 2026 +0000

    fix(BUG-005): omit stale-only interest domains

M       notes/portfolio-survival-allocation-lab.md
M       rlportfolio.js
A       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/bug.md
A       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/design.md
A       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/report.md
A       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/scenario-manifest.json
A       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/scopes.md
A       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/spec.md
A       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/state.json
A       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/uservalidation.md
A       tests/portfolio-stale-domain-signal.unit.mjs
```

**Exit Code:** 0
**Claim Source:** executed

The production diff moves bucket creation from before the age filter to the
post-filter accumulation loop. It does not change the evidence-age predicate,
dedupe call, signal validator, expiry formula, or persisted schema.

```diff
$ timeout 30 git diff 732bccb6c^..732bccb6c -- rlportfolio.js
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
```

**Exit Code:** 0
**Claim Source:** executed

Current `rlportfolio.js` was also inspected directly. The only later commit on
that path is `cda9394c9`, and its complete diff from `732bccb6c` is the
comment-only correction already recorded by the simplify phase:

```diff
$ timeout 30 git diff 732bccb6c..HEAD -- rlportfolio.js
diff --git a/rlportfolio.js b/rlportfolio.js
index dc2643865..841daa26f 100644
--- a/rlportfolio.js
+++ b/rlportfolio.js
@@ -2468,7 +2468,7 @@
     if (!dedupedResult.ok) return dedupedResult;
     dedupedResult.value.events.forEach(function (event) {
       // Created HERE, after the age filter. A domain with no in-window evidence must not own a
-      // bucket at all: `latest` would stay null and `expiresAt` below becomes an invalid date.
+      // bucket at all: `latest` would stay null and `expiresAt` below then THROWS RangeError.
       var key = String(event.domain);
       if (!byDomain[key]) {
         byDomain[key] = {
```

**Exit Code:** 0
**Claim Source:** executed

### Current six-row carrier - GREEN

```text
$ timeout 120 node --test tests/portfolio-stale-domain-signal.unit.mjs
✔ BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing (88.946985ms)
✔ BUG-005: a future-dated-only domain is omitted through the same filter without throwing (12.469227ms)
✔ BUG-005: a stale domain must not suppress the fresh domains beside it (69.541697ms)
✔ BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing (42.870351ms)
✔ BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red (92.239265ms)
✔ BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance (47.644023ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 453.566371
```

**Exit Code:** 0
**Result:** PASS
**Claim Source:** executed

### Isolated detached historical carrier - RED

The historical control never checked out or rewrote the main tree. A detached
worktree was created at `732bccb6c^`, which resolved to `31aad20d4`. The current
carrier was copied into that worktree and compared byte-for-byte. Its only
worktree change was the untracked carrier, and the post-filter source marker was
absent before execution.

```text
$ [[ ! -e /tmp/research-lab-bug005-g022-red ]] && timeout 120 git worktree add --detach /tmp/research-lab-bug005-g022-red 732bccb6c^
Preparing worktree (detached HEAD 31aad20d4)
Updating files: 100% (9926/9926), done.
HEAD is now at 31aad20d4 Merge remote-tracking branch 'origin/main'
$ timeout 30 cp tests/portfolio-stale-domain-signal.unit.mjs /tmp/research-lab-bug005-g022-red/tests/portfolio-stale-domain-signal.unit.mjs
$ timeout 30 cmp tests/portfolio-stale-domain-signal.unit.mjs /tmp/research-lab-bug005-g022-red/tests/portfolio-stale-domain-signal.unit.mjs
CARRIER_COPY_IDENTICAL=yes
$ timeout 30 git -C /tmp/research-lab-bug005-g022-red status --short
?? tests/portfolio-stale-domain-signal.unit.mjs
$ grep -n "Created HERE, after the age filter" /tmp/research-lab-bug005-g022-red/rlportfolio.js
POST_FILTER_MARKER=absent
```

**Exit Code:** 0
**Claim Source:** executed

The expected failing run was routed through `evidence-capture.sh`. The hash
covers all 145 lines, including all six failure bodies rather than only the
displayed first and last twenty lines.

```text
# BUG-005 G022 independent historical RED at 732bccb6c^
$ timeout 120 node --test tests/portfolio-stale-domain-signal.unit.mjs
exit: 1
lines: 145
sha256: 18622435f266139a64404f8fd8ab6f7bad495eff90b0874be2c012004db34bb0
--- first 20 ---
TAP version 13
# Subtest: BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
not ok 1 - BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
  ---
  duration_ms: 88.938291
  type: 'test'
  location: '/tmp/research-lab-bug005-g022-red/tests/portfolio-stale-domain-signal.unit.mjs:165:1'
  failureType: 'testCodeFailure'
  error: 'Invalid time value'
  code: 'ERR_TEST_FAILURE'
  name: 'RangeError'
  stack: |-
    Date.toISOString (<anonymous>)
    /tmp/research-lab-bug005-g022-red/rlportfolio.js:2518:101
    Array.map (<anonymous>)
    Object.deriveInterestSignals (/tmp/research-lab-bug005-g022-red/rlportfolio.js:2491:48)
    TestContext.<anonymous> (file:///tmp/research-lab-bug005-g022-red/tests/portfolio-stale-domain-signal.unit.mjs:184:23)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.start (node:internal/test_runner/test:944:17)
--- failure-shaped lines from the omitted region ---
not ok 2 - BUG-005: a future-dated-only domain is omitted through the same filter without throwing
not ok 3 - BUG-005: a stale domain must not suppress the fresh domains beside it
not ok 4 - BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing
not ok 5 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
not ok 6 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
--- omitted 105 line(s); sha256 above covers the full output ---
--- last 20 ---
    Date.toISOString (<anonymous>)
    /tmp/research-lab-bug005-g022-red/rlportfolio.js:2518:101
    Array.map (<anonymous>)
    Object.deriveInterestSignals (/tmp/research-lab-bug005-g022-red/rlportfolio.js:2491:48)
    TestContext.<anonymous> (file:///tmp/research-lab-bug005-g022-red/tests/portfolio-stale-domain-signal.unit.mjs:300:23)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.processPendingSubtests (node:internal/test_runner/test:744:18)
    Test.postRun (node:internal/test_runner/test:1173:19)
    Test.run (node:internal/test_runner/test:1101:12)
  ...
1..6
# tests 6
# suites 0
# pass 0
# fail 6
# cancelled 0
# skipped 0
# todo 0
# duration_ms 351.30829
```

**Exit Code:** 1 (expected historical RED)
**Result:** PASS - the current carrier discriminates against the pre-fix source
**Claim Source:** executed

Cleanup completed and the temporary worktree no longer exists:

```text
$ timeout 120 git worktree remove --force /tmp/research-lab-bug005-g022-red
$ timeout 30 git worktree prune
DETACHED_WORKTREE_REMOVED=yes
```

**Exit Code:** 0
**Claim Source:** executed

### Bug-scoped change confinement

The executable and registry-note delta in the production commit is confined to
the expected three paths. This is an independent implementation-provenance
receipt, not an attempt to clear the separately routed G053/G093 certification
finding or to introduce the exact heading that those gates require.

```text
$ timeout 30 git diff --name-status 732bccb6c^..732bccb6c -- rlportfolio.js tests notes
M       notes/portfolio-survival-allocation-lab.md
M       rlportfolio.js
A       tests/portfolio-stale-domain-signal.unit.mjs
$ timeout 30 git diff --numstat 732bccb6c^..732bccb6c -- rlportfolio.js tests/portfolio-stale-domain-signal.unit.mjs notes/portfolio-survival-allocation-lab.md
1       0       notes/portfolio-survival-allocation-lab.md
11      9       rlportfolio.js
335     0       tests/portfolio-stale-domain-signal.unit.mjs
$ timeout 30 git diff --name-status -- rlportfolio.js tests/portfolio-stale-domain-signal.unit.mjs notes/portfolio-survival-allocation-lab.md specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/state.json
(empty - detached RED did not mutate the main production, carrier, note, or packet state paths)
```

**Exit Code:** 0
**Claim Source:** executed

### Finding disposition

`TEST-B005-T3` is addressed by this current-session record. The existing
`implement` claim now has delegated `bubbles.bug` execution-history provenance
grounded in the shipped GREEN, detached historical RED, current-source
inspection, and commit confinement above.

This does **not** clear G022 as a whole. The required `stabilize`, `security`,
`validate`, and `audit` phases still have no completion records. The broader
`BUG-005-G022-PIPELINE-PHASES` route therefore remains open, as do every other
previously routed finding. Status remains `in_progress`; certification and
human acceptance remain untouched.

### Post-record validation

The packet was linted after the independent history record and finding
disposition were written.

```text
# BUG-005 independent implement provenance artifact lint
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
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
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
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

**Exit Code:** 0
**Result:** PASS
**Claim Source:** executed

The focused carrier and its anti-tautology guard also ran after the record was
written:

```text
$ timeout 120 node --test tests/portfolio-stale-domain-signal.unit.mjs
✔ BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing (122.211499ms)
✔ BUG-005: a future-dated-only domain is omitted through the same filter without throwing (13.274735ms)
✔ BUG-005: a stale domain must not suppress the fresh domains beside it (77.614818ms)
✔ BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing (76.053726ms)
✔ BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red (160.708198ms)
✔ BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance (60.019953ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 681.515959
```

**Exit Code:** 0
**Result:** PASS
**Claim Source:** executed

```text
$ timeout 300 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-stale-domain-signal.unit.mjs
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: <repo-root>
  Timestamp: 2026-08-25T17:59:44Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/portfolio-stale-domain-signal.unit.mjs
✅ Adversarial signal detected in tests/portfolio-stale-domain-signal.unit.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

**Exit Code:** 0
**Result:** PASS
**Claim Source:** executed (one absolute repository path replaced by the
`<repo-root>` placeholder; all other output is verbatim)

The canonical selftest includes the repository's spec-path validator, which is
load-bearing here because an earlier report-only path token broke that validator.

```text
# BUG-005 implement provenance canonical selftest
$ timeout 900 node scripts/selftest.mjs
exit: 0
lines: 3895
sha256: 102bf70280cc8091082837f585fbc7ba17d1f48f573b7470c7e8ccee6ff369a1
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title

Feature 004 RLFX/RLDATA foundation
  ✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
  ✓ RLFX universe is bounded closed and asserts no live source authorization
  ✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
  ✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
  ✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
  ✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3855 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ both prompt branches carry the required-leaf instruction, so no lane is judged against a contract it was not given
  ✓ a retry is told why the previous attempt was rejected and the reason reaches the prompt — a retry that re-sends the identical input is the same attempt run twice

experience shell — every registered tool is mountable
  ✓ the registered-tool sweep actually has tools to check (found 29)
  ✓ every registered tool page carries a [data-rlbrief-mount] anchor naming its own tool id — rlapp.js mounts the shell from nothing else (missing: none)
  ✓ no page carries two mount anchors — rlapp.js requires exactly one and silently declines to mount otherwise (offenders: none)
  ✓ every tool page carrying a mount anchor also enables it with <meta name="rlbrief-enabled"> (inert: none)
  ✓ the market-brief mount exemption is still live: that page carries an anchor and deliberately does not enable it
  ✓ every declared adapterModule is a module path string the shell can resolve against its bindings table

brief window cutoff — publisher refuses what the consumer would reject
  ✓ the consumer module exports its cutoff resolver, so the publish gate resolves cutoffs with the same rule instead of a second copy
  ✓ a brief whose snapshot and payload are both past the declared cutoff is refused, and each breach is named separately rather than collapsed into one verdict
  ✓ the ordinary in-band publication, composed inside the lead window, is not refused — the gate must not block the 90% case it exists to protect
  ✓ all four window bands close at their own cutoff, so a run past the cutoff selects no window rather than one it cannot honestly satisfy (found 4/4)

================================================
Research-Lab self-test: 3411 passed, 0 failed
================================================
```

**Exit Code:** 0
**Result:** PASS
**Claim Source:** executed

The complete transition guard was then re-run. It remains red, as required by
the unresolved routes; the result must not be read as packet completion.

```text
# BUG-005 G022 targeted state-transition recheck
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
exit: 1
lines: 346
sha256: 105cd0e46a876fea6ecd25c274f13d54da8819113aa54c3ac9c3812e6c5811c9
--- first 20 ---
============================================================
  BUBBLES STATE TRANSITION GUARD
  Feature: specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
  Timestamp: 2026-08-25T18:00:34Z
============================================================

--- Check 1: Required Artifacts ---
✅ PASS: Required artifact exists: spec.md
✅ PASS: Required artifact exists: design.md
✅ PASS: Required artifact exists: uservalidation.md
✅ PASS: Required artifact exists: state.json
✅ PASS: Required artifact exists: scopes.md
✅ PASS: Required artifact exists: report.md

--- Check 2: state.json Integrity ---
ℹ️  INFO: Current state.json status: in_progress
ℹ️  INFO: Current workflowMode: bugfix-fastlane

--- Check 2B: workflowMode Consistency ---
✅ PASS: workflowMode consistent across top-level and policySnapshot (bugfix-fastlane)
--- omitted 306 line(s); sha256 above covers the full output ---
--- last 20 ---

🔍 Running project-defined gates from <repo-root>/.github/bubbles-project.yaml...
BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:310a691f6ce263b6973a128fa7af16f09c3a3b192e7f4175bc074148ab146f16
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G057,G053,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G097,G098,G099,G100,G130,G131]
failedGateIds: [G022,G027,G040,G095,G136]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 13
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

**Exit Code:** 1 (expected while routed findings remain)
**Result:** NONTERMINAL - 13 blockers remain
**Claim Source:** executed (one absolute repository path replaced by the
`<repo-root>` placeholder; the SHA-256 is over the unmodified full output)

Because the compact guard block intentionally omits the middle of the stream,
the exact implement-provenance branch was checked separately against the state
record and the guard source that evaluates it. This targeted probe does not
replace the complete guard run above and does not claim G022 is green.

```text
$ timeout 30 node -e 'const fs=require("node:fs");const state=JSON.parse(fs.readFileSync("specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/state.json","utf8"));const guard=fs.readFileSync(".github/bubbles/scripts/state-transition-guard.sh","utf8");const claims=state.execution.completedPhaseClaims.filter(x=>x.phase==="implement");const history=state.executionHistory.filter(x=>x.agent==="bubbles.bug"&&x.phase==="implement"&&x.phasesExecuted.includes("implement"));const addressed=state.addressedFindings.some(x=>x.id==="TEST-B005-T3"&&x.status==="addressed");const unresolved=state.unresolvedFindings.some(x=>x.id==="TEST-B005-T3");const shortcut=guard.includes("bubbles.bug delegation shortcut for implement/test");const passText=guard.includes("has delegated provenance from bubbles.bug");console.log("probe=BUG-005-G022-implement-provenance");console.log("claim.count="+claims.length);console.log("claim.agent="+(claims[0]&&claims[0].agent));console.log("history.count="+history.length);console.log("history.agent="+(history[0]&&history[0].agent));console.log("history.phase="+(history[0]&&history[0].phase));console.log("history.provenanceMode="+(history[0]&&history[0].provenanceMode));console.log("guard.delegationShortcut="+shortcut);console.log("guard.delegationPassText="+passText);console.log("TEST-B005-T3.addressed="+addressed);console.log("TEST-B005-T3.unresolved="+unresolved);console.log("status="+state.status);console.log("certification.status="+state.certification.status);console.log("certification.completedScopes="+state.certification.completedScopes.length);const ok=claims.length===1&&claims[0].agent==="bubbles.implement"&&history.length===1&&history[0].provenanceMode==="specialist"&&shortcut&&passText&&addressed&&!unresolved&&state.status==="in_progress"&&state.certification.status==="in_progress"&&state.certification.completedScopes.length===0;console.log("result="+(ok?"PASS":"FAIL"));process.exit(ok?0:1);'
probe=BUG-005-G022-implement-provenance
claim.count=1
claim.agent=bubbles.implement
history.count=1
history.agent=bubbles.bug
history.phase=implement
history.provenanceMode=specialist
guard.delegationShortcut=true
guard.delegationPassText=true
TEST-B005-T3.addressed=true
TEST-B005-T3.unresolved=false
status=in_progress
certification.status=in_progress
certification.completedScopes=0
result=PASS
```

**Exit Code:** 0
**Result:** PASS - TEST-B005-T3's missing implement-provenance shape is closed
**Claim Source:** executed

The transition result also shows that several previously routed gate IDs now
appear in `passedGateIds`. Those finding records are not dispositioned here:
the operator constrained this change to TEST-B005-T3/G022, and their owning
agents must reconcile them. The only finding moved by this invocation is
TEST-B005-T3. G022 itself remains in `failedGateIds` because required pipeline
phases remain absent.

## Stabilize Phase — 2026-08-25 {#stabilize-phase-2026-08-25}

Measures whether the BUG-005 repair — the relocation of bucket creation to after
the age filter inside `deriveInterestSignals` in `rlportfolio.js` — costs
anything at the declared cap. **Verdict: STABLE.** No performance regression is
attributable to BUG-005.

### Provenance of the figures in this section {#stabilize-provenance}

This section **persists a measurement taken in a prior invocation**; it does not
re-establish one. The 4-minute fixture build was deliberately not re-run. The
distinction is recorded rather than blurred, because it changes how much weight
a reader may put on the numbers:

| What | Established by | Claim Source |
|---|---|---|
| Harness identity, pre-fix worktree identity, that the pre/post divergence is the BUG-005 hunk **and nothing else**, HEAD, runtime, method | Commands run in **this** invocation, below | `executed` |
| Every millisecond figure, ratio, `signals` count, heap delta and refusal code in the tables below | The prior harness run, **transcribed by the operator**. Raw captured stdout is **not** held in this packet. | `interpreted` |

**Interpretation:** the timing tables are recorded as `interpreted`, not
`executed`, because this agent did not run the harness in this session and
cannot show the raw output that produced them. They are treated as operator
diagnostic input that this agent transcribed, not as its own execution evidence.
What this agent *did* verify is that the measurement was set up to mean what it
claims — same harness, genuine pre-fix baseline, single-hunk divergence. A
reviewer wanting `executed`-grade timings must re-run the harness.

Verified in this invocation:

```text
$ git rev-parse --short=9 HEAD
e4c97ca9b

$ sha256sum /tmp/stab-b005/bench.mjs
24ea33c1bc1e7e984bd00b387a0ff794eb9fa63316b18d9a4b5dcacf534fb345  /tmp/stab-b005/bench.mjs

$ (cd /tmp/stab-b005-pre && git log -1 --format='%h %s')
31aad20d4 Merge remote-tracking branch 'origin/main'

$ node --version && nproc
v22.22.0
8
```

The pre-fix side is a genuine baseline, and the **only** thing that differs
between the two sides is the repair — so any delta measured here is attributable
to this change or to nothing:

```text
$ diff -u /tmp/stab-b005-pre/rlportfolio.js rlportfolio.js
@@ -2459,6 +2459,16 @@
+      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
+      if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;
+      eligibleEvents.push(event);
+    });
+
+    var dedupedResult = dedupeBehaviorEvents(eligibleEvents, policy);
+    if (!dedupedResult.ok) return dedupedResult;
+    dedupedResult.value.events.forEach(function (event) {
+      // Created HERE, after the age filter. ...
       var key = String(event.domain);
@@ -2471,15 +2481,7 @@
-      var ageDays = ...
-      var bucket = byDomain[String(event.domain)];
+      var bucket = byDomain[key];
```

That diff is the whole delta: one statement reordering, no added work per event.

**Method**, read from the harness source rather than assumed: one fixture serves
all three age regimes by varying `now`, so the regimes are the *same* 500 events
seen from three vantage points. Each figure is the **median of 21 timed
repetitions after 3 warm-ups**, with pre and post **interleaved** inside one
process so drift hits both sides equally. `maxBehaviorEvents` is `500` and
`maximumEvidenceAgeDays` is `56` in `portfolio-survival-allocation.config.json`.

**Claim Source:** executed

### `portfolio.deriveInterestSignals` at the cap, n=500 {#stabilize-regimes}

| Regime | In-window | Domains | pre | post | post/pre | Output |
|---|---|---|---|---|---|---|
| fresh | 500/500 | 4 | 724.8 ms | 867.0 ms | 1.196 | **IDENTICAL**, `signals=4` |
| mixed | 327/500 | 4 | 767.8 ms | 697.6 ms | 0.909 | **IDENTICAL**, `signals=4` |
| stale | 0/500 | 0 | **THREW `RangeError: Invalid time value`** | ok in 519.5 ms, `signals=0` | **not comparable** | — |

The stale row has no ratio and cannot have one: the pre side **throws**. That is
not a measurement failure, it **is the defect this bug repairs** — reproduced
here a third time, in a different harness, on a different code path than the
unit carrier. A stale-only workspace has no pre-fix runtime to compare against.

For the two comparable regimes the outputs are byte-identical, so the repair
changes cost only, never result.

**Claim Source:** interpreted
**Interpretation:** figures transcribed per `#stabilize-provenance`. The two
ratios point in **opposite directions** (1.196 and 0.909) for a change that adds
no per-event work, which is the signature of noise rather than effect — a real
regression would not reverse sign between two runs of the same function over the
same 500 events.

### Scaling, fresh regime {#stabilize-scaling}

| n | pre | post |
|---|---|---|
| 50 | 93.4 ms | 112.9 ms |
| 500 | 890.8 ms | 700.9 ms |

10× the events scales time by **pre 9.53× vs post 6.21×** — the post-fix side
scales *better*, because the age filter now runs before bucket allocation
instead of after it.

**This block also bounds the measurement noise floor, and that matters more than
the scaling number.** `n=500 fresh` is measured twice, once here and once in
[the regime table](#stabilize-regimes), and the two independent medians disagree:

| Same measurement | pre | post | post/pre |
|---|---|---|---|
| n=500 fresh (regime block) | 724.8 ms | 867.0 ms | 1.196 |
| n=500 fresh (scaling block) | 890.8 ms | 700.9 ms | 0.787 |

The same function over the same fixture varies by roughly ±20% **in both
directions**. That spread is wider than either observed pre/post gap, so the
1.196 in the regime table is inside the noise band and cannot be read as a
regression.

**Claim Source:** interpreted
**Interpretation:** the run-to-run spread is derived from the transcribed
figures themselves. Conclusion drawn: no pre/post delta observed here exceeds
the harness's own repeatability on this machine.

### The BUG-004 function is unchanged {#stabilize-bug004-path}

| Function | Module | n=500 fresh pre | post | post/pre |
|---|---|---|---|---|
| `brief.deriveInterestSignals` | `rlportfoliobrief.js` | 307.7 ms | 303.6 ms | 0.987 |

**Claim Source:** interpreted
**Interpretation:** figures transcribed per `#stabilize-provenance`. 0.987 is
within the noise band established above; the brief path is untouched by this
repair, as expected — BUG-005 changed only `rlportfolio.js`.

### Cap enforcement still refuses rather than degrades, n=501 {#stabilize-cap}

| Side | Outcome | Time |
|---|---|---|
| pre | refuses — `P008-SCHEMA-CORRUPT` / `behavior-event-cap-exceeded` | 0.8 ms |
| post | refuses — `P008-SCHEMA-CORRUPT` / `behavior-event-cap-exceeded` | 0.7 ms |

One event over the cap is rejected on both sides with the same code and reason,
in under a millisecond. The repair did not turn a refusal into slow work.

**Claim Source:** interpreted
**Interpretation:** figures transcribed per `#stabilize-provenance`. Identical
refusal code and reason on both sides is the load-independent signal here; the
sub-millisecond timings only confirm the refusal is still short-circuit.

### Retained growth, 200 consecutive post-fix calls at n=500 {#stabilize-growth}

| Regime | `heapUsed` delta | Output length |
|---|---|---|
| fresh | +0.05 MiB | 4 |
| mixed | +0.03 MiB | 4 |
| stale | −0.04 MiB | 0 |

Deltas straddle zero across 200 calls, so nothing accumulates. Output length is
bounded by **domain count** (4 / 4 / 0), not by `n` — which is the structural
reason the stale regime returns an empty list instead of allocating four dead
buckets, and the same property the repair relies on.

**Claim Source:** interpreted
**Interpretation:** figures transcribed per `#stabilize-provenance`. A negative
delta on the stale regime is GC noise, not reclamation attributable to the call;
the load-bearing reading is that none of the three regimes trends upward.

### Two caveats that MUST be read with these numbers {#stabilize-caveats}

**Caveat 1 — BUG-004's 201 ms baseline is a DIFFERENT function and does not
apply here.** BUG-004 recorded `201.7 / 201.623 ms` for
`brief.deriveInterestSignals`, which lives in `rlportfoliobrief.js`. The function
BUG-005 changed is `rlportfolio.deriveInterestSignals` in `rlportfolio.js`. They
share a name and nothing else — different module, different signature, different
contract (`BehaviorInterestSignal/v1` versus `portfolio-interest-signal/v1`), as
the [simplify phase](#simplify-rejected) already established when it declined to
merge them. Comparing this section's ~700-900 ms against BUG-004's 201 ms would
be comparing two unrelated functions and would manufacture a regression that does
not exist. The BUG-004 function was measured here for exactly that reason and
came back **303.6 ms post vs 307.7 ms pre — unchanged by this repair**. Note also
that BUG-004's packet carries its own `#stabilize-phase-2026-08-25` anchor; that
is a different packet's section, not this one.

**Caveat 2 — absolute milliseconds here are load-inflated and are NOT comparable
to figures taken on an idle machine.** The harness ran at **loadavg 13.90 across
8 cores**, i.e. roughly 1.7× oversubscribed, so every absolute number in this
section is stretched by contention from unrelated concurrent work. Absolute ms
must not be quoted as a latency budget, compared against a figure recorded on a
quiet machine, or used to set a threshold. The **load-independent** evidence is:
the pre/post **ratios** (both sides interleaved inside one process, so contention
hits them equally), the **byte-identical outputs** in the two comparable regimes,
the **identical refusal code** at the cap, and the **non-accumulating** heap
deltas. Those are what the verdict rests on.

### Stabilize verdict {#stabilize-verdict}

**STABLE — no performance regression attributable to BUG-005.** The repair adds
no per-event work; it reorders two statements so the age filter runs before
bucket allocation. Outputs are byte-identical wherever a pre-fix comparison is
possible, the post side scales better with `n`, the cap still refuses in under a
millisecond with the same code, and nothing accumulates across 200 calls. The one
regime where the sides differ in kind — stale-only — differs because the pre side
**crashes**, which is the bug.

Persisting this section changed no product source, but the repository check was
re-run rather than assumed, because a `tests/*.mjs`-shaped token written into a
spec artifact has broken this exact gate before (see
[#simplify-selftest-break](#simplify-selftest-break)):

```text
# stabilize: canonical repository selftest after BUG-005 stabilize section persisted
$ node scripts/selftest.mjs
exit: 0
lines: 3895
sha256: ba97624425497feff2ff84d7800b37b09fd6427eeb1d53c9cc535a460ec4f776
--- last 4 ---
================================================
Research-Lab self-test: 3411 passed, 0 failed
================================================
```

`3411 passed, 0 failed` is byte-identical to the count the
[simplify](#simplify-verification) and [regression](#regression-phase-2026-08-25)
phases recorded. The block came from `evidence-capture.sh`, which hashed the full
3895-line output, so it is re-derivable with `--verify`.

**Claim Source:** executed

**What this verdict does NOT claim.** It is a stability verdict, not
certification, and not a re-proof of correctness. It is graded `interpreted`, not
`executed`, for the reason given in [#stabilize-provenance](#stabilize-provenance):
the timings were transcribed from a prior run, not produced here. The
[validation refusal](#validation-refusal) stands unchanged — G022, G053, G027,
G068, G093, G094, G097 and G136 are untouched by this phase. With `stabilize`
recorded, the still-absent required phases are **security, validate and audit**,
and G136 still requires a human. The browser lane was NOT re-run: this phase
changed no product source, only `report.md` and the execution-owned half of
`state.json`. This agent wrote no `status` field, no `certification.*` field, no
`uservalidation.md`, and no DoD checkbox.

## Stabilize Current-Session Execution Upgrade — 2026-08-25 {#stabilize-current-session-execution-2026-08-25}

**Phase:** stabilize
**Agent:** `bubbles.stabilize`
**HEAD:** `e4c97ca9b`
**Repository binding:** `PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:201 revision=201 repository=research-lab`
**Claim Source:** executed

This addendum preserves the earlier stabilize record and upgrades its timing
provenance. The benchmark ran in this session against the current module and a
clean detached pre-fix root at `732bccb6c^` (`31aad20d4`). The harness hash was
`24ea33c1bc1e7e984bd00b387a0ff794eb9fa63316b18d9a4b5dcacf534fb345`.

### Applicable Stability Domains

| Domain | Disposition |
| --- | --- |
| Performance | Measured at 50 and 500 events across fresh, mixed, and stale input shapes. |
| Reliability | Measured valid-envelope behavior, stale-input recovery, and the 501-event refusal boundary. |
| Resource usage | Measured retained heap after 200 current-module calls in each age regime. |
| Configuration | Read the committed policy values: `maxBehaviorEvents=500`, `maximumEvidenceAgeDays=56`, and `halfLifeDays=14`. |
| Build and CI | Not applicable. The command registry declares a build-free shipped JavaScript surface. |
| Infrastructure and deployment | Not applicable. The changed function is synchronous in-memory code with no service or container path. |
| Observability | Not applicable. `.github/bubbles-project.yaml` declares no `traceContracts` or instrumented workflow for this packet. |

### Executed Benchmark Receipt

```text
# BUG-005 stabilize: interleaved pre/post bench of portfolio.deriveInterestSignals at the 500-event cap
$ node --expose-gc /tmp/stab-b005/bench.mjs
exit: 0
lines: 44
sha256: f8400762501f4de6da1ae88d551e7f9e0096aa2f535dae5172d9c84e3cc8b2f8
--- first 20 ---
node v22.22.0  reps=21 warmup=3  loadavg=6.91 9.71 10.17
pre  root: /tmp/stab-b005-pre
post root: <repo-root>

fixture n=500: events=500 distinctIdentities=500 domains=4
fixture n=50: events=50 distinctIdentities=50 domains=4
fixture accepted by pre: ok=true
fixture accepted by post: ok=true

--- regime fresh  now=2026-07-20T01:00:00.000Z  in-window 500/500 events across 4/4 domains ---
portfolio.deriveInterestSignals n=500 fresh pre    863.8 ms  post    861.1 ms  post/pre  0.997   [pre p25-p75 804.5-954.6 | post p25-p75 805.9-938.6]
                                           pre: ok | post: ok
  output identity pre vs post: IDENTICAL (post signals=4)

--- regime mixed  now=2026-08-09T00:00:00.000Z  in-window 327/500 events across 4/4 domains ---
portfolio.deriveInterestSignals n=500 mixed pre    687.7 ms  post    685.0 ms  post/pre  0.996   [pre p25-p75 629.6-739.4 | post p25-p75 635.9-734.0]
                                           pre: ok | post: ok
  output identity pre vs post: IDENTICAL (post signals=4)

--- regime stale  now=2026-09-18T00:00:00.000Z  in-window 0/500 events across 0/4 domains ---
--- omitted 4 line(s); sha256 above covers the full output ---
--- last 20 ---

--- scaling: n=50 vs n=500, fresh regime ---
portfolio.deriveInterestSignals n=50 fresh pre     76.9 ms  post     77.3 ms  post/pre  1.006   [pre p25-p75 74.6-84.5 | post p25-p75 74.7-82.5]
                                           pre: ok | post: ok
portfolio.deriveInterestSignals n=500 fresh pre    760.7 ms  post    772.6 ms  post/pre  1.016   [pre p25-p75 727.9-813.4 | post p25-p75 714.6-808.0]
                                           pre: ok | post: ok
  10x n scales time by: pre 9.89x  post 9.99x

--- BUG-004 path: brief.deriveInterestSignals (the function BUG-004 measured) ---
brief.deriveInterestSignals n=500 fresh    pre    229.2 ms  post    216.8 ms  post/pre  0.946   [pre p25-p75 214.3-239.8 | post p25-p75 209.8-227.8]
                                           pre: ok | post: ok

--- cap enforcement (n=501 must refuse, not degrade) ---
  pre: ok=false code=P008-SCHEMA-CORRUPT reason=behavior-event-cap-exceeded in 0.7 ms
  post: ok=false code=P008-SCHEMA-CORRUPT reason=behavior-event-cap-exceeded in 0.6 ms

--- retained growth: 200 consecutive post-fix calls at n=500 ---
  fresh  heapUsed delta 0.08 MiB   output length 4 (bounded by domain count, not n)
  mixed  heapUsed delta 0.02 MiB   output length 4 (bounded by domain count, not n)
  stale  heapUsed delta -0.03 MiB   output length 0 (bounded by domain count, not n)
```

The SHA-256 covers all 44 raw lines. One four-line stale window is bounded from
the retained block. It recorded the pre-fix `RangeError: Invalid time value`,
the current `ok` outcome, and `post signals: 0`.

### Current-Session Interpretation

**Claim Source:** interpreted
**Interpretation:** The raw receipt directly supplies the measurements. The
stability verdict combines those measurements with the changed control flow.

- Fresh and mixed medians are effectively unchanged at `0.997` and `0.996`
  post/pre. Their interquartile bands overlap almost completely.
- Ten times more events costs `9.89x` before and `9.99x` after. Both sides are
  linear at the declared cap. This supersedes the earlier claim that the move
  improved scaling. The current run supports no such causal claim.
- The stale-only current path returns an empty signal array. The pre-fix path
  throws. This is the intended reliability change, not a latency comparison.
- The 501-event shape refuses on both sides with the same code and reason.
- Retained heap stays near zero across 200 calls. Output remains bounded by the
  four-domain fixture rather than by event count.

### BUG-004 Boundary

BUG-004 measured `rlportfoliobrief.js`, not the function changed here. Its HIGH
500-event rebuild regression was repaired in that packet. The current control
is `229.2 ms` pre and `216.8 ms` post, with overlapping interquartile bands.

BUG-004 also records a separate MEDIUM observation about two brief dedupe passes
per render. That observation remains routed in the BUG-004 packet. It does not
belong to BUG-005 because this repair changes only `rlportfolio.js` and adds no
brief-side pass.

### Current-Session Verdict

**STABLE.** No performance, reliability, configuration, or resource finding is
attributable to BUG-005 after the intended crash repair. No remediation route
was created by this stabilize invocation.

This verdict does not certify the packet. Existing planning, traceability,
human-acceptance, security, validate, and audit work remains under its current
owners. This invocation changed no product source, test, `scopes.md`,
`uservalidation.md`, top-level status, or `certification.*` field.

## Security Phase — 2026-08-25 {#security-phase-2026-08-25}

**Phase:** security
**Agent:** `bubbles.security`
**HEAD:** `354dfac217`
**Repository binding:** `PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:203 revision=203 repository=research-lab`
**Fix under review:** commit `732bccb6c`, `rlportfolio.js::deriveInterestSignals`
**Carrier:** `tests/portfolio-stale-domain-signal.unit.mjs`

### Commands executed, with real exit codes {#security-commands}

**Claim Source:** executed

Every row ran after the repository binding above. Hashes are the
`evidence-capture.sh` full-output digests, re-derivable with `--verify`.

| # | Command | Exit | Result |
|---|---------|------|--------|
| 1 | Host adapter plus `repository-binding.sh preflight` | `0` | Research Lab confirmed at revision 203 |
| 2 | `node /tmp/sec-b005-current/security-contract-probe.mjs` | `0` | 25 pass, 0 fail, 1 classified observation; source `sha256:1bbc5c5e…` |
| 3 | `bash .github/bubbles/scripts/security-gate.sh --repo-root .` | `0` | 9936 tracked files, zero G034 findings; `sha256:10e79eda…` |
| 4 | Focused carrier, behavior, foundation, privacy, and publisher tests | `0` | 100 pass, 0 fail, 0 skipped; `sha256:bf064ad5…` |
| 5 | `node scripts/validate-node-source-lock.mjs` | `0` | zero runtime dependencies; exact Playwright 1.61.1; 16/16 adversarial mutations rejected |
| 6 | `node /tmp/sec-b005/probe.mjs` | `0` | `PROBE-FAILURES=0`; `sha256:2f5bffdf…`; source `sha256:c257ee11…` |
| 7 | `node /tmp/sec-b005/probe2.mjs` | `0` | pre/post characterization of the two policy observations; source `sha256:f172a9df…` |
| 8 | `node /tmp/sec-b005/probe3.mjs` | `0` | 8 pass, 0 fail on the shipped brief surface; source `sha256:89e2411b…` |
| 9 | `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-stale-domain-signal.unit.mjs` | `0` | 0 violations, adversarial signal detected; `sha256:3b85a815…` |
| 10 | `bash .github/bubbles/scripts/implementation-reality-scan.sh <packet> --verbose` | `0` | 0 violations, 1 planning warning; Scan 7 IDOR and Scan 8 silent-decode clean; `sha256:4aa4d182…` |
| 11 | Tracked call-site, writer, and computed-dispatch scans | `0` | one shipped brief caller, no shipped portfolio caller, expected no-match exit 1 for computed dispatch |
| 12 | `node scripts/selftest.mjs` | `0` | 3411 passed, 0 failed; `sha256:8a5a255c…` |

Read row 6 carefully. `PROBE-FAILURES=0` does **not** mean every line printed
`PASS`. The probe deliberately classifies two arms as informational rather than
as failures, so they get characterised instead of hidden. Those two arms are
`SEC-B005-S1` and `SEC-B005-N1` below. The probe sources are `/tmp/sec-b005/`
and `/tmp/sec-b005-current/` and are throwaway diagnostics, not product files.
Their source hashes bind the output to the code that produced it. The durable
proof is the repository-owned focused lane, selftest, G034 gate, and carrier.

### Current-session raw evidence {#security-current-session-evidence}

**Phase:** security
**Claim Source:** executed

The hostile contract matrix exercised the untrusted-data and state boundaries
requested for this review:

```text
BUG-005 SECURITY CONTRACT PROBE
declared maxBehaviorEvents=500 maximumEvidenceAgeDays=56
EVENT-1 stale-plus-fresh    PASS  ok=true signals=1
EVENT-2 derive immutable    PASS  workspace bytes unchanged after derivation
DATE-1 malformed            PASS  P008-SCHEMA-CORRUPT/behavior-event-invalid
DATE-2 noncanonical         PASS  P008-SCHEMA-CORRUPT/behavior-event-invalid
DATE-3 invalid-now          PASS  P008-SCHEMA-CORRUPT/timestamp-invalid
CAP-1 exact-cap             PASS  events=2 ok=true
CAP-2 append-cap-plus-one   PASS  P008-SCHEMA-CORRUPT/behavior-event-cap-exceeded
CAP-3 dedupe-cap-plus-one   PASS  P008-SCHEMA-CORRUPT/behavior-event-cap-exceeded
CAP-4 derive-cap-plus-one   PASS  P008-SCHEMA-CORRUPT/behavior-event-cap-exceeded
KEY-1 __proto__ token       PASS  P008-SCHEMA-CORRUPT/behavior-event-invalid
KEY-2 __proto__ field       PASS  P008-SCHEMA-CORRUPT/unknown-field; Object.prototype.polluted=undefined
KEY-3 inherited names       PASS  domains=constructor,tostring pollution=undefined
PRIVATE-1 rawText refused   PASS  P008-SCHEMA-CORRUPT/forbidden-behavior-source
PRIVATE-2 nested refused    PASS  P008-SCHEMA-CORRUPT/forbidden-behavior-source
PRIVATE-3 output allowlist  PASS  fields=14
PRIVATE-4 no source values  PASS  subject/result/generic/completion source values absent
STORE-1 candidate replace   PASS  events=2 signals=1
STORE-2 commit-and-reopen   PASS  generation=1 signals=1
CLEAR-1 behavior clear      PASS  events=0 signals=0
CLEAR-2 full clear          PASS  verifiedEmpty=true personalKeys=0 genericPreserved=true
REFUSAL-1 invalid-now       PASS  same=true outcome=P008-SCHEMA-CORRUPT/timestamp-invalid
REFUSAL-2 private-field     PASS  same=true outcome=P008-SCHEMA-CORRUPT/forbidden-behavior-source
REFUSAL-3 cap-plus-one      PASS  same=true outcome=P008-SCHEMA-CORRUPT/behavior-event-cap-exceeded
REFUSAL-4 valid parity      PASS  byteIdentical=true
OBS-1 window overflow       PASS  largestSafe=99979346 firstThrow=99979347 pre=RangeError post=RangeError
SECURITY-PROBE-SUMMARY pass=25 fail=0 observations=1
SECURITY_PROBE_EXIT=0
```

The repository-owned focused lane independently covered the same contracts:

```text
# BUG-005 security focused carrier privacy publisher and storage contracts
$ node --test tests/portfolio-stale-domain-signal.unit.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-publisher-boundary.functional.mjs
exit: 0
lines: 610
sha256: bf064ad5e0ec907c971a2995538b2975d569efe21517872b70a23f0d90fa9fdc
--- first 20 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
  ---
  duration_ms: 124.378078
  type: 'test'
  ...
# Subtest: BUG-004: an exact occurrence repeat is still refused as a duplicate
ok 2 - BUG-004: an exact occurrence repeat is still refused as a duplicate
--- omitted 570 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 99 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
  ---
  duration_ms: 116.975522
  type: 'test'
  ...
# Subtest: BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
ok 100 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
  ---
  duration_ms: 55.708477
  type: 'test'
  ...
1..100
# tests 100
# suites 0
# pass 100
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2119.060715
```

The mechanical floor and dependency source-lock validator both passed:

```text
# BUG-005 current-session G034 security gate
$ bash .github/bubbles/scripts/security-gate.sh --repo-root .
exit: 0
lines: 1
sha256: 10e79eda0372766008f94192b0cf1f1ef4ac71cc41e21b1b1394f5c5f4bb190d
--- output ---
[security-gate] OK — 9936 tracked file(s), zero G034 findings

[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=manifest-wrong-version result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=lifecycle-relaxation result=REJECTED code=NPMRC-IGNORE-SCRIPTS
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
SOURCE_LOCK_EXIT=0
```

The canonical selftest remained green at the same HEAD:

```text
# BUG-005 security canonical selftest at 354dfac217
$ node scripts/selftest.mjs
exit: 0
lines: 3895
sha256: 8a5a255c39cce86a0bed882a991a32a1744e72d0ea5fa7c230d9a3ca4e839635
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title
--- omitted 3855 line(s); sha256 above covers the full output ---
--- last 20 ---
experience shell — every registered tool is mountable
  ✓ the registered-tool sweep actually has tools to check (found 29)
  ✓ every registered tool page carries a [data-rlbrief-mount] anchor naming its own tool id — rlapp.js mounts the shell from nothing else (missing: none)
  ✓ no page carries two mount anchors — rlapp.js requires exactly one and silently declines to mount otherwise (offenders: none)
  ✓ every tool page carrying a mount anchor also enables it with <meta name="rlbrief-enabled"> (inert: none)
  ✓ the market-brief mount exemption is still live: that page carries an anchor and deliberately does not enable it
  ✓ every declared adapterModule is a module path string the shell can resolve against its bindings table

brief window cutoff — publisher refuses what the consumer would reject
  ✓ the consumer module exports its cutoff resolver, so the publish gate resolves cutoffs with the same rule instead of a second copy
  ✓ a brief whose snapshot and payload are both past the declared cutoff is refused, and each breach is named separately rather than collapsed into one verdict
  ✓ the ordinary in-band publication, composed inside the lead window, is not refused — the gate must not block the 90% case it exists to protect
  ✓ all four window bands close at their own cutoff, so a run past the cutoff selects no window rather than one it cannot honestly satisfy (found 4/4)

================================================
Research-Lab self-test: 3411 passed, 0 failed
================================================
```

### A premise in the request needs correcting before the availability answer {#security-reachability}

**Claim Source:** executed

The request states the pre-fix throw was "reachable from ordinary stored user
data". That is true of the **module API** and false of the **shipped page**, and
the distinction changes the severity.

Measured reachability:

- The only shipped page naming `deriveInterestSignals` is
  `portfolio-survival-allocation-lab.html`. It names it exactly once, at line
  `6422`, on `window.RLPORTFOLIOBRIEF` — the brief module, a **different**
  function that this fix did not touch.
- `grep -cE 'RLPORTFOLIO[[:space:]]*\[|(^|[^a-zA-Z_$.])api[[:space:]]*\['` over
  that page returns `0`, so the repaired symbol cannot be reached indirectly by
  computed property name either.
- `buildInterestSignalCandidate` is the only writer of
  `workspace.interestSignals`, and it has zero shipped callers. `SHIP-4`
  confirms `createEmptyWorkspace` leaves that array `[]`.

So the repaired function has **no shipped-page caller today**. This is the same
conclusion the packet's own `TEST-B005-T1` and `TEST-B005-T2` reached from the
other direction, and it is why `TP-B005-006` was refused as unauthorable.

The correct availability statement is therefore: the pre-fix crash was real and
reachable through the module's public API with ordinary stored data, and it was
**not** reachable from the deployed browser surface. The fix removes a latent
crash from an API before it is wired, rather than closing a live outage.

### 1. Availability and denial of service {#security-availability}

**Claim Source:** executed

The arm the fix closes, measured on both modules with identical input
(`SEC-2`, probe 2). The pre-fix module was rebuilt from `git show 732bccb6c^`:

| Module | Stale-only workspace, declared 56-day window |
|---|---|
| pre-fix `732bccb6c^` | `THREW RangeError: Invalid time value` |
| shipped post-fix | `ok=true`, 1 signal |

That is the discrimination, and it is not a strawman: the carrier proves the
same thing a second way by mutating only the bucket-creation site in module
source text and showing the mutant still derives fresh-only input correctly
before it dies on the mixed input.

Remaining throw surface, probed rather than reasoned:

| Probe | Input | Outcome |
|---|---|---|
| `A1` | stale-only domain beside a fresh one | envelope `ok=true`, fresh sibling survives |
| `A2` | every domain stale, so the mapper body runs zero times | envelope `ok=true`, 0 signals |
| `A3` | hand-edited `occurredAt: "not-a-timestamp"` in stored data | refuses `P008-SCHEMA-CORRUPT/behavior-event-invalid` |
| `A4` | `occurredAt` parseable but non-canonical (RFC 1123) | refuses `P008-SCHEMA-CORRUPT` |
| `A5` | `now` as `null`, `undefined`, `""`, `"nope"`, `12345`, `{}` | all six refuse `timestamp-invalid` |
| `A6` | 200 stale rows | envelope `ok=true`, 0 signals, 230 ms |

`A3` and `A4` matter most, because `localStorage` is hand-editable by anything
on the origin. A non-canonical `occurredAt` makes `Date.parse` return `NaN`, so
every age comparison is false and the row slips the age filter. It is then
caught by `dedupeBehaviorEvents`, which calls `validateBehaviorEvent` on each
row unconditionally, and the derivation returns a contract error. Two
independent guards cover this: `validateWorkspace` already validates every
stored event at `rlportfolio.js:1515-1519`, and the dedupe pass validates again
after the filter. Neither throws.

**Answer:** the fix closes the reported arm completely at the module API. No
stored-data input found in this review still throws instead of returning a
contract error.

### Stored-event cap and object-key safety {#security-cap-and-object-keys}

**Claim Source:** executed

The declared event cap remains fail-closed at every relevant entry point. A
two-event policy accepted exactly two rows. The third append, a direct three-row
dedupe, and derivation over a three-row stored workspace all returned
`P008-SCHEMA-CORRUPT/behavior-event-cap-exceeded`. None threw, evicted an older
row, or silently truncated the array. The repository-owned BUG-004 carrier also
exercises this boundary and was included in the 100-test focused run.

The relocation does not introduce a prototype-key sink. `byDomain`,
`eventIdentities`, `dates`, the workspace duplicate maps, and the dedupe map are
all created with `Object.create(null)`. Executed hostile cases established both
halves:

- `domain: "__proto__"` is refused by the closed safe-token grammar before it
  can become a key.
- An enumerable `__proto__` field is refused as `unknown-field`, and
  `Object.prototype.polluted` remains `undefined`.
- Valid inherited-object names `constructor` and `tostring` remain ordinary
  independent domain keys and both emit, proving the defense does not simply
  reject every awkward but valid token.

**Answer:** the cap cannot be bypassed by this relocation, and no tested object
key can mutate or shadow the aggregation maps.

### `SEC-B005-S1` LOW — `maximumEvidenceAgeDays` has no upper bound, so `expiresAt` can still overflow {#security-sec-b005-s1}

**Claim Source:** executed for the measurements, interpreted for the severity

One arm still throws. `expiresAt` is computed as
`new Date(Date.parse(bucket.latest) + behavior.maximumEvidenceAgeDays * 86400000).toISOString()`.
`validatePolicy` accepts `maximumEvidenceAgeDays` only as `finiteNonNegative`,
with no upper bound, so a large declared window pushes the sum past the
ECMAScript maximum time value and `toISOString` throws by specification.

Measured, by bisection over the window (`SEC-3`, probe 2):

| Quantity | Value |
|---|---|
| largest window that still returns an envelope | `99979346` or `99979347` days in the two fixtures, about 273,729 years |
| smallest window that throws | `99979347` or `99979348` days, one day after each fixture's largest safe value |
| shipped config value | `56` days |
| margin | `1.79e+6` × |

Three facts hold this at LOW rather than higher:

1. **It is pre-existing.** `SEC-1` ran the identical input against the pre-fix
   module rebuilt from `732bccb6c^` and against shipped source. Both threw
   `RangeError: Invalid time value`. The fix neither introduced nor widened it.
   `git show 732bccb6c -- rlportfolio.js` touches the `expiresAt` expression
   only in an adjacent comment line.
2. **No untrusted input reaches it.** The policy is fetched from a committed
   static asset with
   `fetch("portfolio-survival-allocation.config.json", { cache: "no-store", credentials: "same-origin" })`
   at `portfolio-survival-allocation-lab.html:7833`. A repository-wide grep
   found no path that reads policy from `localStorage`, from a query string, or
   from any user input. Reaching this arm requires editing a committed config
   file, which is a reviewed code change, or already controlling the origin.
3. **The margin is six orders of magnitude.**

It is still worth naming, because it is the **same failure class** this packet
exists to remove: an unguarded `new Date(...).toISOString()` on a value that
callers can make invalid. BUG-005 removed one instance of that class; a second
instance remains one config edit away.

**Route:** `bubbles.plan`, as a separate finding against `validatePolicy` rather
than against this fix. The blast radius is `validatePolicy`, not
`deriveInterestSignals`, so it sits outside this packet's changed surface and
must not be repaired inline here. The natural repair is an upper bound on
`maximumEvidenceAgeDays` in the behavior policy section, which would convert the
throw into the `P008-CONFIG/invalid-policy` refusal that every other malformed
window already produces.

**This finding does not block the BUG-005 fix.** The fix is a strict
improvement on the arm it addresses.

### 2. Privacy and retention {#security-privacy}

**Claim Source:** executed

| Probe | Question | Result |
|---|---|---|
| `B1-no-mutation` | does derivation mutate stored evidence? | workspace byte-identical before and after |
| `B1-stale-retained` | do stale occurrences survive omission? | yes, still stored and auditable |
| `B2-absence-total` | does the omitted domain leak into the output? | the name appears nowhere in the derived signal set |
| `B3-persist-retains` | does the persistence path prune evidence? | events 2 before, 2 after |
| `B3-persist-omits` | does persistence emit an unsupported domain? | no persisted signal for a domain with no live evidence |
| `B4-field-set` | did the fix widen the emitted record? | 14 fields, exactly the pre-existing set |
| `B4-sensitivity` | is the band still closed? | `sensitivityBand=non-sensitive` |

Retention **narrows**, it does not widen. `buildInterestSignalCandidate`
replaces `interestSignals` wholesale, so post-fix it persists strictly fewer
signals than before: a stale-only domain now contributes none. Nothing new is
written and nothing stored is deleted.

Absence stays honest, and this is the part worth checking hardest, because
"emit nothing" is also what data loss looks like. The two derivations state the
same fact in different forms, and the carrier pins the pair:

- `rlportfolio` omits the stale domain from `interestSignals`.
- `rlportfoliobrief` still reports it with `score: 0`,
  `supportingOccurrenceIds: []`, `latestSupportAt: null`,
  `floor.satisfied: false`, and `floor.rawOccurrenceCount: 1` (`SHIP-1`).

That `rawOccurrenceCount` is what lets the product say "history exists here but
none of it counts" rather than showing nothing and leaving the user to infer
why. Neither derivation grants live relevance to a retired domain.

**Answer:** the fix widens no retention, emits no signal for a domain without
live evidence, and leaves the underlying occurrences auditable.

#### Private-field, persistence, and clear checks

**Claim Source:** executed

The focused hostile matrix refused both a top-level `rawText` field and a
nested `costBasis` field as `forbidden-behavior-source`. The valid emitted
signal retained exactly the existing 14-field allowlist. Its serialized form
contained none of the event's subject id, result identity, generic evidence
identity, completion-condition id, or source-surface value. Supporting evidence
remains represented only by the validated event hashes the contract permits.

The mutation boundaries also remained distinct:

- Plain derivation left the workspace byte-identical.
- `buildInterestSignalCandidate` replaced `interestSignals`, retained both
  underlying events, and round-tripped one signal through the real store.
- The behavior-only clear committed and reread zero `behaviorEvents` and zero
  `interestSignals`.
- The full-personal clear verified zero remaining Feature 008 personal keys
  while preserving the unrelated `rlData` generic public cache byte-for-byte.
- The repository-owned privacy and publisher carriers were part of the same
  100/100 focused run, so the checks above do not substitute a throwaway probe
  for the durable privacy boundary.

**Answer:** moving bucket creation neither leaks private event fields nor
changes the distinction between derive, persist, behavior clear, and full clear.

### 3. Evidence-window integrity {#security-evidence-window}

**Claim Source:** executed

The predicate is textually unchanged. `git show 732bccb6c -- rlportfolio.js`
shows `if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;`
moved, not edited: it was removed from one position and reinserted verbatim
earlier in the same loop.

Behavioural confirmation against the declared 56-day window (`C1`):

| Age vs declared window | Emitted | Expected |
|---|---|---|
| 55.5 days, inside | yes | yes |
| 56 days, exactly at the boundary | yes | yes, the predicate is `>` |
| 56.001 days, just outside | no | no |
| 57 days | no | no |
| 224 days | no | no |
| −1 day, future-dated | no | no, the `ageDays < 0` arm |

`C3` proves the window is read live from policy rather than folded at fix time:
the same workspace yields 0 signals at a 5-day window and 1 signal at a 20-day
window. A relaxation would have shown up as a signal at 56.001 days.

**Are the carrier's refusal assertions real?** Yes, and I checked they are not
vacuous. `C2-baseline-accepted` first confirms the emitted signal itself
validates, which is the control that makes the refusals meaningful; a permissive
validator would pass the refusals for the wrong reason. Then five mutants are
each refused with `P008-SCHEMA-CORRUPT`: `latestSupportAt: null`,
`expiresAt: null`, `supportingEventIds: []`, `expiresAt: "Invalid Date"`, and
`sensitivityBand: "sensitive"`. The first three are exactly the assertions the
carrier makes, reproduced here independently of the carrier.

`regression-quality-guard.sh --bugfix` reports 0 violations and detects an
adversarial signal, which agrees with reading the fixture: the asserted stale
domain holds no in-window event at all, so the assertion cannot pass by
accident.

**Answer:** `maximumEvidenceAgeDays` was not relaxed. The carrier's refusal
assertions are real and were independently reproduced.

### 4. Input validation {#security-input-validation}

**Claim Source:** executed

`AUDIT-B004-A1` established the class: a `validatePolicy` call silently
disappearing from a path. `deriveInterestSignals` calls `validatePolicy` on line
one and returns its failure unchanged. Fourteen corrupt-policy mutants were
driven through the fixed path:

| Mutation | Outcome |
|---|---|
| `null` / `"string"` / `[]` | `P008-CONFIG/policy-required` |
| `{}` / `contractVersion` dropped | `P008-CONFIG/unknown-version` |
| `behavior` section dropped | `P008-CONFIG/unknown-field` |
| window `null` / `"56"` / `-1` | `P008-CONFIG/invalid-policy` |
| window `NaN` / `Infinity` | `P008-CONFIG/non-finite-policy` |
| injected `behavior.attackerField` | `P008-CONFIG/invalid-policy` |
| `eventLifecycleStates` widened to admit `"anything"` | `P008-CONFIG/invalid-policy` |

Thirteen of fourteen refuse. None silently succeeds. The closed field set and
the closed lifecycle vocabulary both hold, so an attacker-supplied policy cannot
widen what counts as eligible evidence.

### `SEC-B005-N1` NOT A FINDING — `halfLifeDays: 0` is accepted, and that is correct {#security-sec-b005-n1}

**Claim Source:** executed

The fourteenth mutant, `halfLifeDays: 0`, is accepted rather than refused, so I
chased it rather than recording it as a pass. `finiteNonNegative` admits `0`.
Two arms follow:

- Age greater than zero: `ageDays / 0` is `Infinity`,
  `Math.pow(0.5, Infinity)` is `0`. Result `ok=true`, `evidenceScore=0`,
  band `insufficient-evidence`. Finite, and honest about carrying no weight.
- Age exactly zero: `0 / 0` is `NaN`, so the score would be `NaN`. Measured
  outcome is `REFUSED P008-SCHEMA-CORRUPT/interest-signal-invalid`.
  `validateInterestSignal` catches it, so `NaN` can never be persisted.

`SEC-5` confirms both arms behave identically on the pre-fix module. This is
pre-existing, correctly guarded, and not a finding. It is recorded because
"accepted" appeared in the probe output and an unexplained non-`PASS` line is
how a real defect hides.

### Surfaces checked and found clean {#security-clean-surfaces}

**Claim Source:** executed

| Surface | Result |
|---|---|
| G034 mechanical floor | exit 0; committed key material, inline credentials, `curl \| bash`, world-writable tracked files, `eval` on command substitution all clean across 9936 files |
| Dependency vulnerability surface | `package.json` declares `dependencies: {}`; the sole devDependency is `playwright@1.61.1`, a test harness that ships nothing. `rlportfolio.js` has zero third-party imports |
| Injection, XSS, sink escaping | `scripts/selftest.mjs` Step 1 passes: identical CSP on every page, explicit `connect-src` allowlist, no open URL-forwarding relay, and no model-authored field reaching `innerHTML` without `esc()`, including its own detector self-check |
| Gate G047, IDOR | Scan 7 clean. Not applicable in substance: no server, no request-scoped identity, local-only single-user storage |
| Gate G048, silent decode | Scan 8 clean, and independently confirmed by `A3`/`A4`, where a corrupt row surfaces a refusal rather than being dropped |
| Secret hygiene | no credential, token, or key material in the changed surface; the changed function reads only local behaviour evidence |
| SSRF, path traversal, command injection, deserialization | no network call, no filesystem access, no `eval`, no dynamic dispatch in the changed function |

### Uncertainty declaration {#security-uncertainty}

**Claim Source:** interpreted

Two limits belong on this verdict.

**Lane.** Every probe here ran under Node. The repository also has a Playwright
browser lane, which I did not run in this session; the regression phase covers
it. `Date.prototype.toISOString` throwing `RangeError` on an invalid time value
is specified behaviour rather than an engine detail, so I expect no divergence,
but I did not measure the browser lane and do not claim it.

**Reachability method.** The "no shipped caller" conclusion rests on executed
greps over a complete static call graph plus a zero-match dynamic-dispatch
check, not on a runtime probe of the loaded page. That is the same method and
the same declared limit as `TEST-B005-T1`. A caller constructed at runtime from
a computed string would evade it, and I found no such construction.

### Security verdict {#security-verdict}

**Claim Source:** interpreted from the executed evidence above

**⚠️ FINDINGS** — 1 LOW, pre-existing, out of this packet's blast radius, and
route-only. Zero CRITICAL. Zero HIGH. Zero findings attributable to this fix.

On the four questions asked:

1. **Availability.** The fix closes the reported arm completely at the module
   API: the pre-fix module throws `RangeError` on input the shipped module
   answers with an envelope. No stored-data input found in this review still
   throws. One policy-reachable arm remains and is recorded as `SEC-B005-S1`.
   The premise that the pre-fix throw was reachable from the deployed browser
   surface does not hold; the repaired symbols have no shipped caller, so this
   was a latent crash rather than a live outage.
2. **Privacy.** Retention narrows rather than widens. No signal is emitted for a
   domain without live evidence, the stored occurrences stay auditable, and the
   brief still reports `rawOccurrenceCount` so absence is stated rather than
   implied.
3. **Evidence-window integrity.** `maximumEvidenceAgeDays` was not relaxed. The
   predicate moved verbatim, the boundary behaves exactly as declared at
   56/56.001 days, and the carrier's refusal assertions are real, non-vacuous,
   and independently reproduced.
4. **Input validation.** A corrupt policy still refuses with a contract error.
   Thirteen of fourteen mutants refuse; the fourteenth is correct behaviour and
   is documented as `SEC-B005-N1`.

**This phase grants no certification.** It changed no product source, no test,
no `spec.md`, no `design.md`, no `scopes.md`, no `uservalidation.md`, no
`completedScopes`, no DoD checkbox, no top-level `status`, and no
`certification.*` field. Planning, traceability, human-acceptance, validate, and
audit work remains with its current owners, and `SEC-B005-S1` is routed to
`bubbles.plan` as new, separate work.
