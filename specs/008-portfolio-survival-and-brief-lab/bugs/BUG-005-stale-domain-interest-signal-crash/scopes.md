# BUG-005 Scopes

Governing artifacts: `bug.md` (defect and provenance), `spec.md` (expected
behavior EB-1..EB-5 and AC-1..AC-7), `design.md` (root cause, semantics
decision, divergence resolution, regression design).

Workflow mode: `bugfix-fastlane`. Single scope, single-file layout.

## Scope 1 - Omit Stale-Only Domains Instead Of Throwing

**Status:** Done

**Depends On:** none.

**Owner:** `bubbles.implement` for `rlportfolio.js`; `bubbles.test` for the new
carrier.

### Change Boundary

Allowed file families:

| Path | Authorized change |
| --- | --- |
| `rlportfolio.js` | `deriveInterestSignals` only — relocate domain-bucket creation into the post-age-filter accumulation loop |
| `tests/portfolio-stale-domain-signal.unit.mjs` | new adversarial regression carrier |
| `notes/portfolio-survival-allocation-lab.md` | one carrier row in the existing test table |
| `specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/**` | this packet |

Excluded surfaces — these MUST remain untouched. Editing any of them is a
boundary excursion and must be routed, not absorbed:

- `validateInterestSignal` or `INTEREST_SIGNAL_FIELDS` in `rlportfolio.js`.
- `rlportfoliobrief.js` (see `design.md` § Divergence Resolution — no repair is
  required there).
- `portfolio-survival-allocation.config.json` or any declared policy value.
- Any BUG-004 packet artifact, and BUG-004's declared carriers
  `tests/portfolio-behavior-occurrence.unit.mjs` and
  `tests/portfolio-brief.functional.mjs`. Both are RE-RUN as regression, and
  neither is edited.

Collateral cleanup is opt-in, not implicit: an unrelated defect noticed inside
`rlportfolio.js` while making this change is filed, not absorbed.

### Consumer Impact Sweep

This fix mutates NO public interface identity. It relocates one statement
**inside** `deriveInterestSignals`; the function keeps its name, arity, call
signature, and export site. Nothing is renamed, removed, moved, or deprecated,
so no consumer has a reference that could go stale.

The sweep is recorded because that claim has to be checked rather than assumed —
a relocation that quietly dropped an export would look identical in prose.
Surfaces enumerated and confirmed unchanged:

| Consumer surface | Expected effect | Verification |
| --- | --- | --- |
| Exported symbol table of `rlportfolio.js` | unchanged | `deriveInterestSignals: deriveInterestSignals` still present exactly once |
| Exported symbol table of `rlportfoliobrief.js` | unchanged | out of boundary; byte-identical across the fix |
| First-party call sites (`*.js`, `*.mjs`, `*.html`) | all still resolve | 42 tracked references, all to the same unchanged name |
| Page wiring in `portfolio-survival-allocation-lab.html` | unchanged | calls `window.RLPORTFOLIOBRIEF.deriveInterestSignals`, an excluded surface |
| Navigation, breadcrumb, redirect, deep link, API client, generated client | not applicable | this is an internal function, reachable through no route, URL, or slug |
| Stale-reference scan | zero hits | no old identifier exists to leave behind |

`_site/rlportfolio.js` also matches the sweep but is a gitignored build output
(`.gitignore:16:/_site/`), not a first-party source surface. It is rebuilt from
`rlportfolio.js` and is therefore not a consumer that can hold a stale
reference.

### Gherkin Scenarios

```gherkin
Feature: BUG-005 Stale-domain interest signal derivation

  Scenario: SCN-B005-STALE-OMITTED - a domain whose every event has aged out yields no signal
    Given a workspace whose only event in "equity-research" occurred 190.92 days ago
    And the declared maximumEvidenceAgeDays is 56
    When interest signals are derived at that reference instant
    Then the derivation returns an ok envelope rather than throwing
    And no signal is emitted for "equity-research"

  Scenario: SCN-B005-FRESH-SIBLING - a stale domain does not suppress a fresh one
    Given a workspace holding one stale-only domain and one domain with in-window evidence
    When interest signals are derived
    Then the derivation returns an ok envelope
    And the fresh domain emits its signal with an unchanged evidenceScore and relevanceBand
    And the stale domain is absent

  Scenario: SCN-B005-DISCRIMINATION - reinstating the superseded ordering turns the fix red
    Given module source in which the domain bucket is created before the age filter
    When the stale-only input is derived against that source
    Then a RangeError is thrown, proving the shipped ordering is what prevents it

  Scenario: SCN-B005-FLOOR-PRESERVED - in-window evidence below the floor is still reported
    Given a domain with one in-window event and a declared floor of two distinct completions
    When interest signals are derived
    Then a signal is emitted for that domain with floorSatisfied false
    And its relevanceBand is insufficient-evidence

  Scenario: SCN-B005-BRIEF-AGREEMENT - both derivations deny live relevance to a stale domain
    Given the stale-only workspace
    When rlportfolio and rlportfoliobrief each derive interest signals
    Then rlportfolio emits no signal for the domain
    And the brief emits the domain with zero score, no supporting occurrences, and an unsatisfied floor
```

### Implementation Plan

1. Author `tests/portfolio-stale-domain-signal.unit.mjs` and prove it RED
   against unmodified `rlportfolio.js`.
2. In `deriveInterestSignals`, delete the `byDomain[key] = {...}` creation from
   the pre-filter `forEach` and create the bucket lazily inside the
   `dedupedResult.value.events.forEach` accumulation loop.
3. Prove the carrier GREEN.
4. Re-run BUG-004's two declared carriers and the canonical selftest unmodified.
5. Add the carrier row to `notes/portfolio-survival-allocation-lab.md`.

### Test Plan

| ID | Test Type | Category | File | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-B005-001 | Unit | `unit` | `tests/portfolio-stale-domain-signal.unit.mjs` | AC-1, AC-2, AC-4, AC-5, AC-6, AC-7 — stale omission, future-dated omission, source-mutation discrimination, floor preservation, brief agreement | `node --test tests/portfolio-stale-domain-signal.unit.mjs` | No |
| TP-B005-002 | Unit | `unit` | `tests/portfolio-stale-domain-signal.unit.mjs` | AC-3 — fresh sibling survives, score and band unchanged | `node --test tests/portfolio-stale-domain-signal.unit.mjs` | No |
| TP-B005-003 | Regression | `unit` | `tests/portfolio-behavior-occurrence.unit.mjs` | BUG-004 storage and anti-inflation contract unaffected — file unmodified | `node --test tests/portfolio-behavior-occurrence.unit.mjs` | No |
| TP-B005-004 | Regression | `functional` | `tests/portfolio-brief.functional.mjs` | Brief-side derivation and floor accounting unaffected — file unmodified | `node --test tests/portfolio-brief.functional.mjs` | No |
| TP-B005-005 | Regression | `functional` | `scripts/selftest.mjs` | Registry, navigation, and canonical model invariants | `node scripts/selftest.mjs` | No || TP-B005-006 | Regression E2E | `e2e-ui` | `tests/portfolio-survival-allocation.spec.mjs` | Regression: `SCN-B005-STALE-OMITTED` in the browser — a workspace whose only `equity-research` event is outside `maximumEvidenceAgeDays` renders the allocation lab without an uncaught `RangeError`, and the fresh sibling domain still renders its signal. **NOT YET AUTHORED — routed to `bubbles.test`.** | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --project=system-chrome` | Yes |
| TP-B005-007 | Regression E2E | `e2e-ui` | `tests/portfolio-survival-*.spec.mjs` | Broader Feature 008 browser matrix, all 8 carriers, proving the relocation did not disturb the shipped surfaces. **NOT YET EXECUTED IN THIS PACKET — routed to `bubbles.test`.** | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --project=system-chrome` | Yes |

Rows TP-B005-006 and TP-B005-007 are declared obligations, not delivered
coverage. No browser carrier in this repository currently exercises the
stale-domain path: `grep -rlniE 'stale.domain|BUG-005|maximumEvidenceAgeDays'
tests/*.spec.mjs` returns no file, and this packet's `report.md` records no
Playwright execution at all. The 94-passed Feature 008 matrix that exists in the
repository is BUG-004's `TP-B004-006` receipt and is NOT evidence for BUG-005.
Both rows therefore stay unchecked in the Definition of Done below.
### Definition of Done

#### Core Items

- [x] `SCN-B005-STALE-OMITTED` holds: given a workspace whose only
      `equity-research` event occurred 190.92 days ago against a declared
      `maximumEvidenceAgeDays` of 56, deriving interest signals at that
      reference instant returns an ok envelope rather than throwing, and emits
      no signal for that domain
      - Raw output evidence (inline, no references):
        ```
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        ok 1 - BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
        ok 2 - BUG-005: a future-dated-only domain is omitted through the same filter without throwing
        1..6
        # tests 6
        # pass 6
        # fail 0
        # skipped 0
        CARRIER_EXIT=0
        ```
        Row 1 carries both halves of the Then clause: the derivation returns an
        envelope instead of throwing, AND the stale domain is absent from it.
        Row 2 proves the same filter also omits a future-dated-only domain, so
        the omission follows the declared age window in both directions rather
        than special-casing the past. The claim is discriminating, not vacuous:
        the same six rows are 0/6 RED against the pre-fix module with
        `RangeError: Invalid time value`, recorded at
        `report.md#pre-fix-reproduction`, and the vacuity guards inside the
        carrier assert the stale domain really did store a row, so "no signal
        emitted" cannot pass because nothing was ever recorded.
        **Claim Source:** executed

- [x] `SCN-B005-FRESH-SIBLING` holds: given a workspace holding one stale-only
      domain beside one domain with in-window evidence, the derivation returns
      an ok envelope, the fresh domain emits its signal with an unchanged
      `evidenceScore` and `relevanceBand`, and the stale domain is absent
      - Raw output evidence (inline, no references):
        ```
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        ok 3 - BUG-005: a stale domain must not suppress the fresh domains beside it
        1..6
        # tests 6
        # pass 6
        # fail 0
        ```
        This is the blast-radius half of the defect and the reason it mattered:
        the throw happened inside `Array.prototype.map`, so one retired domain
        destroyed the derivation for every fresh domain beside it. The carrier
        row asserts the fresh domain's score and band against an isolated
        fresh-only derivation of the same workspace, so an implementation that
        silently degraded the survivor would fail rather than pass.
        **Claim Source:** executed

- [x] `SCN-B005-DISCRIMINATION` holds: given module source in which the domain
      bucket is created before the age filter, deriving the stale-only input
      against that source throws a `RangeError`, proving the shipped ordering
      is what prevents it
      - Raw output evidence (inline, no references):
        ```
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        ok 5 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
        1..6
        # tests 6
        # pass 6
        # fail 0
        ```
        Row 5 rebuilds the module from source text with the superseded
        pre-filter bucket creation reinstated and requires that mutant to THROW
        on the input the shipped ordering survives. Its green therefore means
        the failure path was exercised rather than omitted, so the aggregate
        cannot go green by the assertion being absent. Both directions of the
        discrimination are recorded at `report.md#discrimination`.
        **Claim Source:** executed

- [x] `SCN-B005-FLOOR-PRESERVED` holds: given a domain with one in-window event
      and a declared floor of two distinct completions, a signal is still
      emitted for that domain with `floorSatisfied` false and `relevanceBand`
      `insufficient-evidence`
      - Raw output evidence (inline, no references):
        ```
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        ok 4 - BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing
        1..6
        # tests 6
        # pass 6
        # fail 0
        ```
        This is the containment assertion for the fix: omitting stale-only
        domains must not become "omit anything weak". A domain with in-window
        evidence BELOW the floor is still emitted and merely marked
        unsatisfied, which is the behavior `spec.md` EB-5 requires stay
        rejected-as-a-change. Without this row the fix could have passed by
        dropping below-floor domains too, which would widen the omission.
        **Claim Source:** executed

- [x] `SCN-B005-BRIEF-AGREEMENT` holds: given the stale-only workspace,
      `rlportfolio` emits no signal for the domain while `rlportfoliobrief`
      emits it with zero score, no supporting occurrences, and an unsatisfied
      floor — both denying live relevance
      - Raw output evidence (inline, no references):
        ```
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        ok 6 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
        1..6
        # tests 6
        # pass 6
        # fail 0
        ```
        The two derivations differ in FORM — one omits the row, the other emits
        a null-support row — while agreeing in SUBSTANCE that the domain
        carries no live relevance. That is exactly the disposition
        `design.md` § Divergence Resolution records, and it is asserted here
        behaviorally rather than left as prose, which is what makes the
        "no repair owed on the brief side" decision checkable. The measured
        divergence backing it is at `report.md#divergence`.
        **Claim Source:** executed

- [x] Crash reproduced at HEAD before any fix, with the thrown type, message,
      and source frame recorded
      - Raw output evidence (inline, no references):
        ```
        $ git checkout 732bccb6c^ -- rlportfolio.js
        REVERTED rlportfolio.js to 732bccb6c^
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        exit: 1
        lines: 145
        sha256: b422519550147288b151b8e8034d20bcfe90902886bea3f1b9a2c9eb99e5b408
        not ok 1 - BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
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
        1..6
        # tests 6
        # pass 0
        # fail 6
        # skipped 0
        $ git checkout HEAD -- rlportfolio.js
        RESTORE_EXIT=0
        $ git status --porcelain
        (empty - working tree restored clean)
        ```
        Thrown type `RangeError`; message `Invalid time value`; source frame
        `rlportfolio.js:2518:101` in `Date.toISOString`, reached from
        `deriveInterestSignals` at `rlportfolio.js:2491:48`. `732bccb6c^` is
        the revision immediately before the fix, which was HEAD when the defect
        was filed. Stack frames are rendered repo-relative because the absolute
        checkout root trips this repository's `pii-scan.sh`; the recorded
        `sha256` covers the raw un-normalized output.
        **Claim Source:** executed

- [x] Provenance established by execution: the same crash reproduces at
      `a59e38d71^`, proving the defect predates the BehaviorOccurrence repair
      - Raw output evidence (inline, no references):
        ```
        $ git checkout a59e38d71^ -- rlportfolio.js
        REVERTED rlportfolio.js to a59e38d71^
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        exit: 1
        lines: 145
        sha256: 68bb935bd982d4c68f569028ab79324a3d4612099d26a7551a432f27a997821f
        not ok 1 - BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
          error: 'Invalid time value'
          code: 'ERR_TEST_FAILURE'
          name: 'RangeError'
          stack: |-
            Date.toISOString (<anonymous>)
            rlportfolio.js:2512:101
            Array.map (<anonymous>)
            Object.deriveInterestSignals (rlportfolio.js:2485:48)
        not ok 2 - BUG-005: a future-dated-only domain is omitted through the same filter without throwing
        not ok 3 - BUG-005: a stale domain must not suppress the fresh domains beside it
        1..6
        # tests 6
        # pass 0
        # fail 6
        # skipped 0
        $ git checkout HEAD -- rlportfolio.js
        RESTORE_EXIT=0
        $ git status --porcelain
        (empty - working tree restored clean)
        ```
        `a59e38d71` is `fix(008): separate behavior occurrences from
        relevance`. Its PARENT already throws the identical `RangeError` with
        the identical message and call path, so the defect predates that
        repair. The frame line numbers differ (`2512:101` / `2485:48` versus
        `2518:101` / `2491:48`) only because the repair shifted the file by six
        lines; the faulting statement is the same.
        **Claim Source:** executed

- [x] Divergence characterized by execution: brief returns `ok` with a
      null-support row on byte-identical input
      - Raw output evidence (inline, no references):
        ```
        $ node /tmp/bug005-divergence-probe.cjs
        exit: 0
        pre-fix revision:      732bccb6c^ (resolved from git object storage, no checkout)
        rlportfolio.js  sha256: 950e67cf72177c65e95d414fbe562812dc58ffb65f79c5f0d0f2d15ef18b06f1
        rlportfoliobrief sha256: 14df3cc796e151d7c07a01d37b1fc2a6130a70b53baaf81a8a8f0615fe42ebb3
        shared input sha256:   b41a53b7be8ad56e45be4984193db0fe1fd57df278de3a6ba83d9c7f4127b2d6
        shared input:          4 behaviorEvents, cutoff 2026-07-20T08:00:00.000Z, maximumEvidenceAgeDays 56
        stale domain "equity-research": 1 stored occurrence(s), age(s) in days 190.92 - all outside the declared window

        --- consumer A: rlportfolio.deriveInterestSignals(workspace, NOW, policy) ---
        THREW    RangeError: Invalid time value
          frame  at Date.toISOString (<anonymous>)
          frame  at eval (<anonymous>:2520:101)
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
        Both consumers were loaded as SOURCE TEXT from git object storage at
        `732bccb6c^` into one throwaway browser-shaped root, so nothing was
        checked out and both are pre-fix. The shared input was hashed before
        the first call and again after the second and is identical, so
        "byte-identical" is measured, not asserted. On that one input the brief
        returns an `ok` envelope carrying a null-support row - `score` 0, empty
        `supportingOccurrenceIds`, null `latestSupportAt`, unsatisfied floor -
        while `rawOccurrenceCount: 1` preserves the history; the portfolio
        derivation throws. Full method at `report.md#divergence`.
        **Claim Source:** executed

- [x] Adversarial regression carrier authored and proven RED against unmodified
      `rlportfolio.js`, with every eligible event in the asserted domain stale
      - Raw output evidence (inline, no references):
        ```
        $ git checkout 732bccb6c^ -- rlportfolio.js
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        exit: 1
        sha256: b422519550147288b151b8e8034d20bcfe90902886bea3f1b9a2c9eb99e5b408
        not ok 1 - BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
          location: 'tests/portfolio-stale-domain-signal.unit.mjs:165:1'
            TestContext.<anonymous> (tests/portfolio-stale-domain-signal.unit.mjs:184:23)
        not ok 2 - BUG-005: a future-dated-only domain is omitted through the same filter without throwing
        not ok 3 - BUG-005: a stale domain must not suppress the fresh domains beside it
        not ok 4 - BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing
        not ok 5 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
        not ok 6 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
        1..6
        # tests 6
        # pass 0
        # fail 6
        # skipped 0
        $ git checkout HEAD -- rlportfolio.js
        RESTORE_EXIT=0
        ```
        All six rows are RED against the unmodified pre-fix module, and none is
        skipped. The all-stale precondition is proven by WHERE row 1 failed,
        not by assertion: the test declares two vacuity guards at lines 165-181
        - that the fixture's measured age exceeds the DECLARED
        `maximumEvidenceAgeDays` read from policy, and that EVERY eligible row
        in the asserted domain is out of window - and the throw is raised later,
        at the `deriveInterestSignals` call on line `184:23`. Both guards
        therefore executed and passed before the crash, so the red is the defect
        rather than a malformed or tautological fixture.
        **Claim Source:** executed

- [x] Fix implemented in `deriveInterestSignals` within the declared Change
      Boundary
      - Raw output evidence (inline, no references):
        ```
        $ git diff 732bccb6c^..732bccb6c -- rlportfolio.js
        @@ -2459,6 +2459,16 @@
        +      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
        +      if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;
        +      eligibleEvents.push(event);
        +    });
        +    var dedupedResult = dedupeBehaviorEvents(eligibleEvents, policy);
        +    if (!dedupedResult.ok) return dedupedResult;
        +    dedupedResult.value.events.forEach(function (event) {
        +      // Created HERE, after the age filter. A domain with no in-window evidence must not own a
        +      // bucket at all: `latest` would stay null and `expiresAt` below becomes an invalid date.
               var key = String(event.domain);
        @@ -2471,15 +2481,7 @@
        -      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
        -      if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;
        -      eligibleEvents.push(event);
        -      var bucket = byDomain[String(event.domain)];
        +      var bucket = byDomain[key];
        exit: 0

        $ git diff --unified=0 732bccb6c^..732bccb6c -- rlportfolio.js | grep -E '^@@'
        @@ -2461,0 +2462,10 @@
        @@ -2474,9 +2484 @@
        exit: 0

        $ awk '/^  function deriveInterestSignals/{s=NR} s&&/^  }$/&&NR>s{print s"-"NR; exit}' rlportfolio.js
        deriveInterestSignals spans lines 2448-2536
        exit: 0
        ```
        Every changed line (`2462`-`2471` added, `2474`-`2482` removed) lies
        inside `deriveInterestSignals` (`2448`-`2536`), so no other function in
        the module is touched. The change is a relocation of bucket creation -
        same filter, same dedupe, same accumulation, reordered so a bucket
        cannot outlive the age filter - which is exactly the authorized change
        for `rlportfolio.js` in the Change Boundary table.
        **Claim Source:** executed

- [x] Carrier GREEN after the fix (TP-B005-001, TP-B005-002)
      - Raw output evidence (inline, no references):
        ```
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        exit: 0
        lines: 46
        sha256: 0d6fec812c15d3870c513833e9ef3d6d173976ae322186c2307135b6405a20a6
        TAP version 13
        ok 1 - BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing
        ok 2 - BUG-005: a future-dated-only domain is omitted through the same filter without throwing
        1..6
        # tests 6
        # suites 0
        # pass 6
        # fail 0
        # cancelled 0
        # skipped 0
        # todo 0
        # duration_ms 462.302998
        ```
        Six of six green with zero skipped, against the same carrier that was
        six of six RED at `732bccb6c^` above. TP-B005-001 covers AC-1, AC-2,
        AC-4, AC-5, AC-6 and AC-7; TP-B005-002 covers AC-3.
        **Claim Source:** executed

- [x] Source-mutation discrimination proves sensitivity: reinstating the
      superseded pre-filter bucket creation throws `RangeError`
      - Raw output evidence (inline, no references):
        ```
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        exit: 0
        sha256: 0d6fec812c15d3870c513833e9ef3d6d173976ae322186c2307135b6405a20a6
        ok 5 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
        1..6
        # tests 6
        # pass 6
        # fail 0
        # skipped 0

        $ git checkout 732bccb6c^ -- rlportfolio.js
        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        exit: 1
        sha256: b422519550147288b151b8e8034d20bcfe90902886bea3f1b9a2c9eb99e5b408
        not ok 5 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
        # tests 6
        # pass 0
        # fail 6
        $ git checkout HEAD -- rlportfolio.js
        RESTORE_EXIT=0
        ```
        Sensitivity is proven in both directions. Row 5 rebuilds the module
        from source text with the superseded pre-filter bucket creation
        reinstated and asserts `assert.throws(..., RangeError)` for the mutant
        while the shipped module returns an envelope on the same input; that row
        is GREEN at HEAD, so the failure path was executed rather than omitted.
        Removing the shipped ordering entirely turns the whole carrier RED. A
        test that could not fail could do neither.
        **Claim Source:** executed

- [x] BUG-004 carrier `tests/portfolio-behavior-occurrence.unit.mjs` passes and
      is unmodified (TP-B005-003)
      - Raw output evidence (inline, no references):
        ```
        $ node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs
        exit: 0
        lines: 226
        sha256: 6c786136171500655c9617584a3b3dafcba724917f7910115a3537c34619e024
        TAP version 13
        ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
        ok 2 - BUG-004: an exact occurrence repeat is still refused as a duplicate
        1..36
        # tests 36
        # suites 0
        # pass 36
        # fail 0
        # cancelled 0
        # skipped 0
        # todo 0

        $ git diff --name-only 732bccb6c^..HEAD -- tests/portfolio-behavior-occurrence.unit.mjs
        exit: 0
        (empty - byte-identical from the pre-fix revision through HEAD)
        ```
        Green and unmodified. The `git diff --name-only` receipt is what makes
        this regression evidence: an edited carrier would prove nothing about
        BUG-004's contract surviving the BUG-005 change.
        **Claim Source:** executed

- [x] `tests/portfolio-brief.functional.mjs` passes and is unmodified
      (TP-B005-004)
      - Raw output evidence (inline, no references):
        ```
        $ node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs
        exit: 0
        lines: 226
        sha256: 6c786136171500655c9617584a3b3dafcba724917f7910115a3537c34619e024
        1..36
        # tests 36
        # suites 0
        # pass 36
        # fail 0
        # cancelled 0
        # skipped 0
        # todo 0
        # duration_ms 654.98493

        $ git diff --name-only 732bccb6c^..HEAD -- tests/portfolio-brief.functional.mjs
        exit: 0
        (empty - byte-identical from the pre-fix revision through HEAD)

        $ git diff --stat 732bccb6c^..HEAD -- rlportfoliobrief.js
        exit: 0
        (empty - the brief module itself is also byte-identical)
        ```
        The brief-side derivation and its floor accounting are unaffected. Both
        the carrier and the module it exercises are byte-identical to their
        pre-fix state, which is consistent with `design.md` Divergence
        Resolution declaring that no repair is owed on the brief side.
        **Claim Source:** executed

- [x] `node scripts/selftest.mjs` passes (TP-B005-005)
      - Raw output evidence (inline, no references):
        ```
        $ node scripts/selftest.mjs
        exit: 0
        lines: 3893
        sha256: 4b8229ab368f49a84f0a7f27dbf975e2e89928f199d7e6abb8e2ff561ccf29b9

        Step 1 security - escaped model sinks and CSP on every page
          [ok] every shipped HTML page carries a Content-Security-Policy meta
          [ok] all pages use one identical CSP instead of drifting per page
          [ok] CSP keeps the single-file inline-script design while defaulting to self
        ...
          [ok] all four window bands close at their own cutoff, so a run past the cutoff selects no window rather than one it cannot honestly satisfy (found 4/4)

        ================================================
        Research-Lab self-test: 3409 passed, 0 failed
        ================================================
        ```
        The canonical registry, navigation and model invariants hold: 3409
        assertions passed, zero failed. The `[ok]` markers stand in for the
        check-mark glyph the runner prints; counts and exit code are verbatim.
        **Claim Source:** executed

- [x] Divergence resolved or justified in `design.md`, and what remains rejected
      after the fix is stated in `spec.md` EB-5
      - Raw output evidence (inline, no references):
        ```
        $ grep -nE '^#{1,4} ' design.md
        1:# Design: BUG-005 Stale-Domain Interest Signal Crash
        3:## Root Cause
        43:## Semantics Decision: Stale-Only Domains Are Omitted
        50:### Candidate A — emit a null-support signal (rejected)
        73:### Candidate B — omit the domain (chosen)
        96:## Fix
        125:### What the fix deliberately does not do
        137:### Affected files
        145:## Divergence Resolution
        209:## Regression Design
        240:## Capability Shape
        258:### Single-Implementation Justification
        296:## Requirement-Mechanism Justifications
        318:## Complexity Tracking
        exit: 0

        $ grep -n -A 8 'EB-5' spec.md
        114:### EB-5 — What remains rejected after the fix
        115-
        116-The fix widens nothing. All of the following MUST still hold, and are asserted:
        117-
        118-| Rejection | Still enforced |
        119-| --- | --- |
        120-| Out-of-window evidence contributes to `evidenceScore` | No — score is unchanged for fresh domains and the stale domain has no score at all |
        121-| Out-of-window evidence counts toward `minimumDistinctCompletions` / `minimumDistinctUtcDates` | No — the floor is computed only from surviving events |
        122-| A domain with in-window evidence below the floor is dropped | No — it is still EMITTED with `floorSatisfied: false` and band `insufficient-evidence` |
        exit: 0
        ```
        `design.md` carries a `## Divergence Resolution` section explaining why
        the two derivations may differ in FORM while agreeing in SUBSTANCE, and
        why no repair is owed on the brief side; the measured divergence backing
        it is at `report.md#divergence`. `spec.md` EB-5 states what stays
        rejected after the fix. Neither is prose-only: carrier row 4 asserts the
        below-floor case is still emitted, and carrier row 6 asserts the
        portfolio/brief agreement, both green above.

        This receipt was re-executed after `design.md` was revised. The earlier
        transcription recorded the then-current regression heading at
        `design.md:209` — since retitled `## Regression Design` — and located
        EB-5 at `spec.md:53`; EB-5 now begins at `spec.md:114`. The line numbers
        and titles above are the current ones, so the receipt matches the
        artifacts it describes rather than a superseded revision of them.
        **Claim Source:** executed

#### Build Quality Gate

- [x] Change Boundary is respected and zero excluded file families were changed
      — the dirty set contains only allowed paths; no BUG-004 artifact and no
      BUG-004 carrier is modified
      - Raw output evidence (inline, no references):
        ```
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
        (empty - no BUG-004 artifact and no BUG-004 carrier is touched)

        $ git status --porcelain
        exit: 0
        (empty - clean tree; both historical reverts were restored)
        ```
        Eleven changed paths, every one authorized: `rlportfolio.js`, the new
        carrier, one row in the test-registry note, and this packet. The grep
        returns exit 1 with no output, which is the honest form of "no match" -
        no BUG-004 packet artifact and neither declared BUG-004 carrier appears
        in the change set. The working tree is clean at the time of writing, so
        the two temporary historical reverts left nothing behind.
        **Claim Source:** executed

- [x] No contract weakened — `validateInterestSignal`, `INTEREST_SIGNAL_FIELDS`,
      `rlportfoliobrief.js`, and the policy file are byte-identical to HEAD
      - Raw output evidence (inline, no references):
        ```
        $ git diff 732bccb6c^..HEAD -- rlportfolio.js | grep -nE '^[+-].*(validateInterestSignal|INTEREST_SIGNAL_FIELDS)'
        exit: 1
        (empty - neither symbol appears in any added or removed line)

        $ git diff --stat 732bccb6c^..HEAD -- rlportfoliobrief.js
        exit: 0
        (empty - byte-identical)

        $ git diff --stat 732bccb6c^..HEAD -- portfolio-survival-allocation.config.json
        exit: 0
        (empty - byte-identical)

        $ node --test tests/portfolio-stale-domain-signal.unit.mjs
        exit: 0
        ok 4 - BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing
        # tests 6
        # pass 6
        # fail 0
        ```
        The two validator surfaces named in the Change Boundary exclusion list
        appear in no added or removed line, and the brief module and declared
        policy file are byte-identical across the fix. Nothing was relaxed to
        make the carrier pass. Carrier row 4 states the same fact behaviorally:
        a domain with in-window evidence BELOW the floor is still emitted with
        `floorSatisfied: false`, so the fix omitted stale-only domains without
        widening what qualifies.
        **Claim Source:** executed

- [x] Artifact lint clean for this packet
      - Raw output evidence (inline, no references):
        ```
        $ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
        [ok] Required artifact exists: spec.md / design.md / uservalidation.md / state.json / scopes.md / report.md
        [ok] Found DoD section in scopes.md
        [ok] All DoD bullet items use checkbox syntax in scopes.md
        [ok] uservalidation separates automation readiness from human acceptance
        [ok] Detected state.json status: in_progress
        [ok] Detected state.json workflowMode: bugfix-fastlane
        [ok] Top-level status matches certification.status
        [ok] report.md contains section matching: Summary
        [ok] report.md contains section matching: Completion Statement
        [ok] report.md contains section matching: Test Evidence

        === Anti-Fabrication Evidence Checks ===
        [ok] All checked DoD items in scopes.md have evidence blocks
        [ok] No unfilled evidence template placeholders in scopes.md
        [ok] No unfilled evidence template placeholders in report.md
        === End Anti-Fabrication Checks ===

        Artifact lint PASSED.
        exit: 0
        ```
        Clean, including the anti-fabrication checks: every checked DoD item
        carries an evidence block and no template placeholder survives in either
        `scopes.md` or `report.md`. The `[ok]` markers stand in for the
        check-mark glyph the linter prints; the verdict and exit code are
        verbatim. Status reads `in_progress` because certification is owned by
        `bubbles.validate` and was not written by this pass.
        **Claim Source:** executed
