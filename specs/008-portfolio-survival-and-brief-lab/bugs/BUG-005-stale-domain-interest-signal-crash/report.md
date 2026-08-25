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

