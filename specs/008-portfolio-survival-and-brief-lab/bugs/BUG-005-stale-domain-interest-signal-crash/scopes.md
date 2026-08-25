# BUG-005 Scopes

Governing artifacts: `bug.md` (defect and provenance), `spec.md` (expected
behavior EB-1..EB-5 and AC-1..AC-7), `design.md` (root cause, semantics
decision, divergence resolution, regression strategy).

Workflow mode: `bugfix-fastlane`. Single scope, single-file layout.

## Scope 1 - Omit Stale-Only Domains Instead Of Throwing

**Status:** In Progress

**Depends On:** none.

**Owner:** `bubbles.implement` for `rlportfolio.js`; `bubbles.test` for the new
carrier.

### Change Boundary

Authorized paths:

| Path | Authorized change |
| --- | --- |
| `rlportfolio.js` | `deriveInterestSignals` only — relocate domain-bucket creation into the post-age-filter accumulation loop |
| `tests/portfolio-stale-domain-signal.unit.mjs` | new adversarial regression carrier |
| `notes/portfolio-survival-allocation-lab.md` | one carrier row in the existing test table |
| `specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/**` | this packet |

Explicitly out of boundary — touching any of these is a boundary excursion and
must be routed, not absorbed:

- `validateInterestSignal` or `INTEREST_SIGNAL_FIELDS` in `rlportfolio.js`.
- `rlportfoliobrief.js` (see `design.md` § Divergence Resolution — no repair is
  required there).
- `portfolio-survival-allocation.config.json` or any declared policy value.
- Any BUG-004 packet artifact, and BUG-004's declared carriers
  `tests/portfolio-behavior-occurrence.unit.mjs` and
  `tests/portfolio-brief.functional.mjs`. Both are RE-RUN as regression, and
  neither is edited.

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
| TP-B005-005 | Regression | `functional` | `scripts/selftest.mjs` | Registry, navigation, and canonical model invariants | `node scripts/selftest.mjs` | No |

### Definition of Done

#### Core Items

- [ ] Crash reproduced at HEAD before any fix, with the thrown type, message,
      and source frame recorded
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] Provenance established by execution: the same crash reproduces at
      `a59e38d71^`, proving the defect predates the BehaviorOccurrence repair
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] Divergence characterized by execution: brief returns `ok` with a
      null-support row on byte-identical input
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] Adversarial regression carrier authored and proven RED against unmodified
      `rlportfolio.js`, with every eligible event in the asserted domain stale
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] Fix implemented in `deriveInterestSignals` within the declared Change
      Boundary
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] Carrier GREEN after the fix (TP-B005-001, TP-B005-002)
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] Source-mutation discrimination proves sensitivity: reinstating the
      superseded pre-filter bucket creation throws `RangeError`
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] BUG-004 carrier `tests/portfolio-behavior-occurrence.unit.mjs` passes and
      is unmodified (TP-B005-003)
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] `tests/portfolio-brief.functional.mjs` passes and is unmodified
      (TP-B005-004)
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] `node scripts/selftest.mjs` passes (TP-B005-005)
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] Divergence resolved or justified in `design.md`, and what remains rejected
      after the fix is stated in `spec.md` EB-5
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

#### Build Quality Gate

- [ ] Change Boundary respected — the dirty set contains only authorized paths;
      no BUG-004 artifact and no BUG-004 carrier is modified
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] No contract weakened — `validateInterestSignal`, `INTEREST_SIGNAL_FIELDS`,
      `rlportfoliobrief.js`, and the policy file are byte-identical to HEAD
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```

- [ ] Artifact lint clean for this packet
      - Raw output evidence (inline, no references):
        ```
        [pending execution]
        ```
