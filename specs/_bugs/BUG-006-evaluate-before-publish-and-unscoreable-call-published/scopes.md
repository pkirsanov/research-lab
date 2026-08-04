# Scopes: BUG-006 Evaluate-Before-Publish Ordering, And An Unscoreable Call Published (D16)

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

> **This packet is DOCUMENTATION-ONLY and explicitly DO-NOT-FIX.** No scope
> below is started, and none may start until (a) the owner selects a remedy
> direction from
> [design.md](design.md#candidate-remedies-and-which-defect-each-addresses) and
> (b) the operator confirms it is safe to edit a pipeline that a live scheduler
> writes into an append-only ledger. **Every DoD box is intentionally unchecked.
> No certification is asserted.**

---

## Scope 1: Owner Decision On Remedy Direction

**Status:** [ ] Not started
**Depends On:** none
**Owner:** repository owner (NOT agent-ownable)
**Addresses:** Defects A and B — selection only, no implementation

### Description

Select among candidate remedies **R1–R6**. The selection is not mechanical: it
trades brief availability against invariant strength, and **no single remedy
closes both defects** (see the remedy table in
[design.md](design.md#candidate-remedies-and-which-defect-each-addresses)).

Two constraints bound the choice and MUST be carried into it:

1. **R4 (relax the assertion) is the highest-risk option.** The assertion is
   currently the only mechanical signal that an unscoreable call reached the
   ledger. Relaxing it without pairing R2 removes the signal rather than the
   defect. See
   [design.md](design.md#-the-risk-of-fixing-this-by-relaxing-the-assertion-r4).
2. **R3 (add `selftest` to the publisher) is unsafe alone.** On its own it turns
   a red `main` into a failed publish — the brief stops shipping.

### Gherkin Scenarios

```gherkin
Feature: A remedy direction is selected with its costs understood

  Scenario: Owner selects a remedy combination
    Given R1-R6 are documented with the defect each addresses and its cost
    And the R4 signal-removal risk is stated
    And the R3 publish-failure consequence is stated
    When the owner selects one remedy or a combination
    Then the decision and its rationale are recorded in a durable artifact
    And the defect each selected remedy leaves open is named explicitly

  Scenario: The assertion is relaxed without a replacement gate
    Given R4 is selected
    And R2 is not also selected
    Then the D16 breach continues with zero mechanical signal
    And the selection must be refused or amended

  Scenario: No direction is selected
    Given the decision is outstanding
    Then this bug remains blocked
    And main remains red until the next scheduled evaluate closes the pending call
```

### Implementation Plan

1. Owner reviews the remedy table and the two risk sections in
   [design.md](design.md).
2. Owner records the selected remedy or combination, with rationale.
3. Owner names, explicitly, which defect each selected remedy leaves open.
4. Owner confirms whether pipeline edits are permitted while the scheduler is
   live, or whether the work must be windowed.
5. A separate implementation packet is opened. **Not this packet.**

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| (none) | — | — | Decision scope; no executable test applies until a remedy is selected | — | No |

### Definition of Done

- [ ] Owner has selected a remedy or combination from R1–R6
- [ ] The selection and its rationale are recorded in a durable artifact
- [ ] For each selected remedy, the defect it leaves open is named explicitly
- [ ] If R4 is selected, R2 is selected alongside it, or the reason for not doing so is recorded
- [ ] Owner has stated whether pipeline edits may proceed while the scheduler is live

---

## Scope 2: Defect B — Enforce D16 At The Publish Gate

**Status:** [ ] In progress
**Depends On:** Scope 1
**Owner:** spec `015-recommendation-outcome-ledger-and-track-record` (currently `blocked`)
**Addresses:** **Defect B only**

### Description

Make D16 a gate instead of a request. Today the only D16 surface is a natural-
language string in an LLM prompt at
[`brief-narrative-parallel.mjs:232`](../../../scripts/brief-narrative-parallel.mjs),
while the publish gate at
[`validate-brief-payload.mjs:72`](../../../scripts/validate-brief-payload.mjs)
checks only that `invalidation` is non-empty text.

This is Step 6 `born-evaluable-calls`, bound `delivery=required` to spec 015
([`features.md:61`](../../../docs/releases/improvement-plan/features.md)). Spec
015 is `blocked`, so this scope **routes** rather than executes.

The rule MUST be expressed in the terms the evaluator actually decides on —
**attributed** invalidation levels after direction-aware classification — not in
terms of a numeral appearing in the invalidation prose. The published call
satisfied the current wording literally and was still unscoreable
(FR-006-004, and [bug.md](bug.md#c5--no-attributable-invalidation-level-does-not-mean-carries-no-level)).

The refusal path needs a stated policy: drop the offending action from the
payload, or fail the run? That choice belongs to Scope 1.

### Gherkin Scenarios

```gherkin
Feature: An unscoreable tactical or swing call cannot be published

  Scenario: A tactical call resolves to not-evaluable
    Given a nextSession action with horizon "tactical"
    And its body resolves to evaluability "not-evaluable"
    When the publish gate runs
    Then the gate refuses the call
    And no proposed row for it reaches the append-only ledger

  Scenario: A hedge whose invalidation is written on the wrong side
    Given a call with action "hedge" and directionSign -1
    And its invalidation field contains only "below" levels
    When the body is built
    Then zero levels are attributed to the invalidation side
    And the gate refuses the call rather than publishing it not-evaluable

  Scenario: ADVERSARIAL — numerals present but attribution empty
    Given an invalidation field containing four numeric levels on named instruments
    And zero of those levels survive direction-aware classification as invalidation
    Then a presence-only check would PASS and the call would still be unscoreable
    And the gate must therefore assert on attributed levels, not on numeral presence

  Scenario: A structural call is unaffected
    Given a call with horizon "structural"
    Then D16 does not apply and the gate does not refuse it
```

### Implementation Plan

1. Route to spec 015 as Step 6 work. **Do not patch the publish gate from this bug packet.**
2. Resolve spec 015's own blockers first (it is `status: blocked` / `certification.status: blocked`).
3. Express the rule against attributed invalidation levels (FR-006-004).
4. Implement the refusal policy chosen in Scope 1.
5. Sharpen the D16 wording in `docs/Improvement-Plan.md` (remedy R5) so the
   authoring instruction and the gate agree.

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Static | `unit` | `scripts/selftest.mjs` | A tactical action resolving to `not-evaluable` is refused by the publish gate | `node scripts/selftest.mjs` | No |
| Adversarial | `unit` | `scripts/selftest.mjs` | Numerals present in `invalidation` but zero attributed invalidation levels still refuses — a presence-only check would pass this case | `node scripts/selftest.mjs` | No |
| Adversarial | `unit` | `scripts/selftest.mjs` | A `hedge` with only `below` levels in `invalidation` is refused; the same text under `add` is accepted | `node scripts/selftest.mjs` | No |
| Negative | `unit` | `scripts/selftest.mjs` | A `structural` call resolving to `not-evaluable` is NOT refused | `node scripts/selftest.mjs` | No |

### Definition of Done

> Executed in a later, owner-authorized session that lifted DO-NOT-FIX **for
> Defect B only**. Full narrative and the drop-versus-fail rationale:
> [report.md](report.md#defect-b-remediation-run-later-session).

- [x] The publish gate mechanically refuses a `swing`/`tactical` action whose body resolves to `not-evaluable`

  ```
  $ node scripts/validate-brief-payload.mjs /tmp/bug006-d16-proof/offending.payload.json --enforce-d16
  [brief-contract] D16 REFUSED nextSession.actions[4] action=hedge horizon=tactical directionSign=-1 must break ABOVE reason=no-attributable-invalidation-level invalidationLevels=0 triggerLevels=3 subject="Keep a MINIMAL event-insurance residual into July NFP 8/7 — with VIX now easing back under 16 (15.86) the run-off case f"
  [brief-contract] FAIL: 1 unscoreable tactical/swing call(s) breach D16 — withhold them or give each one a direction-correct invalidation level
  PROOF_2_OFFENDING_EXIT=1

  $ node scripts/validate-brief-payload.mjs /tmp/bug006-d16-proof/corrected.payload.json --enforce-d16
  [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
  PROOF_3_CORRECTED_EXIT=0
  ```

  The offending fixture is the **real published payload, byte-for-byte**; the
  corrected fixture differs only in `actions[4].invalidation`. Exit `1` vs exit
  `0` on that single difference is the non-vacuity proof.

- [x] The rule is expressed against attributed invalidation levels, not numeral presence (FR-006-004)

  ```
  $ node --test tests/brief-d16-direction-aware-publish-gate.test.mjs
  ✔ the shipped body builder really does refuse the wrong-side invalidation — the fixtures are not strawmen (31.835123ms)
  ✔ requiredInvalidationRelation states the side each action family must break on (4.046152ms)
  ✔ findUnscoreableActions refuses a wrong-side call and accepts the direction-correct one (49.168817ms)
  ✔ D16 covers tactical and swing only — a structural call on the wrong side is not refused (2.291673ms)
  ✔ dropUnscoreableActions withholds exactly the refused call and keeps every other one (12.753749ms)
  ✔ --enforce-d16 refuses the wrong-side hedge by name and passes the direction-correct one (511.648836ms)
  ✔ --enforce-d16 refuses the wrong-side add and passes the direction-correct one (591.841643ms)
  ✔ --drop-unscoreable withholds the call and still publishes the brief (160.690837ms)
  ✔ the default mode reports without blocking, so a published baseline can never stall the scheduler (254.868321ms)
  ✔ an unknown flag is refused rather than silently ignored — a typo must not disable the gate (206.81549ms)
  ℹ tests 10
  ℹ pass 10
  ℹ fail 0
  D16_TEST_EXIT=0
  ```

  `findUnscoreableActions` calls the shipped `buildRecommendationBody` and reads
  `evaluability` / attributed `levels[].source`. It never inspects the prose for
  numerals.

- [x] An adversarial test exists that a numeral-presence-only check would pass and the real gate fails

  ```
  $ node --input-type=module -e '<extractLevels probe on the exact published clause forms>'
  published form (bare integer)    -> [{"instrument":"VIX","relation":"below","value":16,"upside":false}]
  tilde form                       -> [{"instrument":"SPY","relation":"above","value":765,"upside":false}]
  decimal form                     -> [{"instrument":"SPY","relation":"above","value":765,"upside":false}]
  below only (the defect)          -> [{"instrument":"SPY","relation":"below","value":755.68,"upside":false}]
  PROBE_EXIT=0

  $ node scripts/validate-brief-payload.mjs /tmp/bug006-d16-proof/offending.payload.json --enforce-d16
  [brief-contract] D16 REFUSED nextSession.actions[4] ... invalidationLevels=0 triggerLevels=3
  PROOF_2_OFFENDING_EXIT=1
  ```

  The refused payload's `invalidation` field carries **four** numerals on named
  instruments — a presence-only check passes it. Attribution yields
  `invalidationLevels=0`, and the gate refuses. This also closes open finding
  **DISC-006-004**: the missing `above` level was a **bare integer** (`765`),
  which `extractLevels` refuses, not the `at/above` compound form.

- [x] The refusal policy chosen in Scope 1 is implemented and documented

  ```
  $ node scripts/validate-brief-payload.mjs /tmp/bug006-d16-proof/offending.payload.json --drop-unscoreable
  [brief-contract] D16 REFUSED nextSession.actions[4] action=hedge horizon=tactical directionSign=-1 must break ABOVE reason=no-attributable-invalidation-level invalidationLevels=0 triggerLevels=3
  [brief-contract] D16 withheld 1 unscoreable call(s) from /tmp/bug006-d16-proof/offending.payload.json — the rest of the brief still publishes
  [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
  DROP_MODE_EXIT=0
  surviving actions: 4
    [0] hold/structural
    [1] hold/swing
    [2] rotate/swing
    [3] hold/swing

  $ node --test tests/brief-refresh-atomicity.test.mjs
  ℹ tests 26
  ℹ pass 26
  ℹ fail 0
  ```

  Policy: **drop the call, never fail the publish.** Forced by executed evidence —
  the committed payload already carries an offending call, so a blocking verdict
  would stall `brief-refresh-and-push.sh:95` on every future run and turn
  `selftest.mjs:462` red. Per-rung wiring and the full justification are in
  [report.md](report.md#the-refusal-policy-drop-the-call-never-fail-the-publish).

- [ ] `docs/Improvement-Plan.md` D16 wording matches what the gate enforces (R5)

  **NOT DONE — honest gap.** Only the author-prompt wording in
  `scripts/brief-narrative-parallel.mjs` was sharpened. `docs/Improvement-Plan.md`
  is an owner-authored surface ([design.md](design.md#ownership-and-routing)) and
  was left untouched. The gate currently enforces **more** than that document
  states: the direction-correct side and the accepted numeric form.

- [x] No existing ledger row was rewritten, deleted, or reordered (FR-006-006)

  ```
  $ git status --porcelain=v1   (post-change, ledger + brief artifact paths)
  # no entry under briefs/, no entry for market-brief.payload.json,
  # no entry for briefs/history/recommendations/2026-08.jsonl
  ```

  Every gate demonstration ran against copies under `/tmp/bug006-d16-proof/`.
  `market-brief.payload.json` was read but never written; no partition, index,
  pointer, or `briefs/` artifact was touched.

---

## Scope 3: Defect A — Reconcile The Ordering With The Asserted Invariant

**Status:** [ ] Not started
**Depends On:** Scope 1
**Owner:** repository owner
**Addresses:** **Defect A only**

### Description

Either make the committed ledger free of pending closures at commit time, or
restate the assertion to describe the ordering that actually exists — with the
reason recorded (FR-006-002).

If the selected remedy is **R1** (a second evaluate after the publish at `:407`),
the loop question **MUST** be assessed first. This scope does not assume R1 is
safe. The four prerequisites are enumerated in
[design.md](design.md#r1-the-loop-question--must-be-assessed-before-any-attempt);
the substantive hazard is that `runEvaluation` rewrites the ledger partition,
writes a new index fingerprint, and moves the `historyIndexRef` pointer **after**
the publish has frozen a run manifest recording that partition's `sha256`.

### Gherkin Scenarios

```gherkin
Feature: The committed ledger holds the invariant the selftest asserts

  Scenario: A publish mints an on-sight-closable call
    Given the publish appends a call the evaluator can close without an elapsed horizon
    When the pipeline reaches its commit step
    Then planEvaluation against the committed ledger returns zero rows
    And node scripts/selftest.mjs exits 0

  Scenario: A publish mints only calls that are still open
    Given the publish appends only machine-checkable calls inside their horizon
    Then planEvaluation returns zero rows because silence means open
    And the assertion was already green — this is the common case

  Scenario: ADVERSARIAL — the second evaluate must converge
    Given a second evaluator pass runs after the publish
    When it appends closure rows
    Then a third planEvaluation returns zero rows
    And the pass does not schedule further work

  Scenario: ADVERSARIAL — the second evaluate must not break publication
    Given the publish froze a run manifest recording each history partition sha256
    When a post-publish evaluate rewrites that partition and moves historyIndexRef
    Then validate-distributed-briefs and the next --prepare-tools barrier must still accept the tree
    And the projected site must still resolve exactly one canonical current history index
```

### Implementation Plan

1. Apply the remedy selected in Scope 1.
2. If R1: complete all four loop-assessment prerequisites **with executed
   evidence** before writing any code.
3. If R4: pair with Scope 2, and record why the removed signal is adequately
   replaced.
4. Re-run `node scripts/selftest.mjs` and confirm exit 0.
5. Confirm no ledger row was rewritten (FR-006-006).

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Canonical | `functional` | `scripts/selftest.mjs` | The repository check is green on a clean checkout | `node scripts/selftest.mjs` | No |
| Convergence | `functional` | (to be defined by the selected remedy) | A second evaluator pass leaves `planEvaluation().rows.length === 0` | (to be defined) | No |
| Publication integrity | `integration` | (to be defined) | Post-publish ledger mutation does not trip manifest-fingerprint or history-pointer validation | `node scripts/validate-distributed-briefs.mjs --root . --graph-only` | Yes |

### Definition of Done

- [ ] `node scripts/selftest.mjs` exits 0 on a clean checkout of `origin/main`
- [ ] If R1 was selected, all four loop-assessment prerequisites are answered with executed evidence
- [ ] Convergence is demonstrated on a real ledger, not on a fixture
- [ ] Publication-integrity validation passes after the change
- [ ] If R4 was selected, the replacement signal is in place and named
- [ ] No existing ledger row was rewritten, deleted, or reordered (FR-006-006)

---

## Scope 4: Contributing Factor A2 And Open Diagnostics

**Status:** [ ] Not started
**Depends On:** Scope 3 (A2 is unsafe to land before Defect A is resolved)
**Owner:** repository owner
**Addresses:** contributing factor A2, plus findings `DISC-006-004` and `DISC-006-005`

### Description

Three items, all secondary to the two defects:

- **A2** — `scripts/brief-refresh-and-push.sh` never runs `scripts/selftest.mjs`,
  while [`tier-a.yml:131`](../../../.github/workflows/tier-a.yml) does. Two
  commit paths into the same branch hold different gate standards (FR-006-005).
  **Landing this before Scope 3 would stop the brief from shipping**, which is
  why it depends on Scope 3.
- **DISC-006-004** — why *"SPY closing at/above the 765 call wall"* produced no
  `above` level has not been established. Read-only investigation of
  `extractLevels`. It determines whether the R5 wording fix alone would have
  changed this outcome.
- **DISC-006-005** — whether the `hedge` 0.9535 / `trim` 1.0 / `rotate` 1.0 /
  `add` 1.0 `notEvaluableShare` figures share the attribution root cause. The
  current evidence does **not** support a direction-sign-wide explanation and
  this packet does not claim one.

### Gherkin Scenarios

```gherkin
Feature: Both commit paths hold the same gate standard

  Scenario: The publisher path is gated
    Given Defect A is resolved so the invariant is holdable at commit time
    When brief-refresh-and-push.sh reaches its commit step
    Then it has run the same blocking check the scheduled workflow runs
    And a failing check prevents the commit

  Scenario: ADVERSARIAL — gating before Defect A is resolved
    Given Defect A is NOT resolved
    And an on-sight-closable call was just published
    When the publisher runs selftest before committing
    Then the run fails and the brief does not ship
    And this is why Scope 4 depends on Scope 3

Feature: The unextracted above-level is explained

  Scenario: The extractor is characterised
    Given the invalidation prose "SPY closing at/above the 765 call wall"
    When extractLevels runs against the committed universe
    Then whether it yields an "above" level is recorded with executed evidence
    And if it does not, the reason is named rather than guessed
```

### Implementation Plan

1. Complete Scope 3 first.
2. Wire the same blocking check into the publisher path, or document the
   divergence and its rationale (FR-006-005).
3. Investigate `DISC-006-004` read-only; record the result with executed
   evidence or record that it remains unknown.
4. Run the `DISC-006-005` cohort analysis, or record it as declined.

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Static | `functional` | `scripts/selftest.mjs` | Both commit paths reference the same blocking check | `node scripts/selftest.mjs` | No |
| Diagnostic | `unit` | (to be defined) | `extractLevels` behaviour on the `at/above <n> call wall` form is characterised | (to be defined) | No |

### Definition of Done

- [ ] Scope 3 is complete
- [ ] The publisher path runs the same blocking check as the scheduled workflow, or the divergence is documented with its rationale
- [ ] An adversarial test proves a failing check actually blocks the publisher's commit
- [ ] `DISC-006-004` is answered with executed evidence, or explicitly recorded as still unknown
- [ ] `DISC-006-005` is answered, or explicitly recorded as declined
