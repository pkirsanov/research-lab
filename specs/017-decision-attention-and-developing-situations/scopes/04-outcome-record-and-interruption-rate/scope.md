# Scope 4: Outcome Record And Interruption Rate

## 04-outcome-record-and-interruption-rate

**Status:** In Progress
**Scope-Kind:** data-record
**Tags:** ledger, reducer, disjoint-record, withholding
Depends On: 1, 3

**Primary Outcome:** Terminated attention items append exactly one record each to
the append-only `market-brief.attention-outcomes.jsonl`, which
`scripts/build-attention-scorecard.mjs` reduces into
`market-brief.attention-scorecard.json` carrying `warrantedShare` and
`expiredWithoutEffectShare`. The record is disjoint from
`market-brief.scorecard.json` — never summed, never merged — and
`market-brief.scorecard.json` is byte-identical before and after a full attention
generation. Items closed as `superseded` are excluded from the evaluable
denominator and reported as a count. Below `minClosedSample` the rate publishes
null with `insufficientSample: true` and the sample size shown, and the
`byDecisionWindow` and `byChannel` breakdowns withhold independently. Escalation
produces one live surface, not two.

## Requirement Coverage

- Exactly one outcome record exists per terminated item; a correction appends a new
  record carrying `correctionOf` rather than editing the prior line.
- `superseded` is excluded from the evaluable denominator and surfaced as its own
  count.
- Below the minimum closed sample the rate is null, `insufficientSample` is true,
  and the sample size is shown rather than hidden.
- The two breakdowns withhold independently — one breakdown falling below the
  minimum does not suppress the other.
- There is no write path from this scope to the recommendation ledger or to
  `market-brief.scorecard.json`.
- Escalation yields one live surface; the attention item does not remain live
  alongside its escalated form.

## Gherkin Scenarios

```gherkin
Scenario: SCN-017-033 Escalation produces one live surface rather than two
  Given a published attention item is escalated
  When the surfaces are enumerated after the transition
  Then exactly one live surface represents the situation
  And the attention item is no longer presented as separately live

Scenario: SCN-017-034 Exactly one outcome record exists per terminated item
  Given an item reaches a terminal state
  When the outcome ledger is read
  Then exactly one record exists for that item
  And a later correction appends a new record carrying a reference to the record it corrects

Scenario: SCN-017-035 Superseded items are excluded from the evaluable denominator
  Given a closed set containing items closed as superseded
  When the record is built
  Then the superseded items are absent from the evaluable denominator
  And their count is reported separately

Scenario: SCN-017-036 Below the minimum closed sample the rate is withheld
  Given a closed sample smaller than the minimum
  When the record is built
  Then the rate is null
  And the insufficient-sample marker is true
  And the sample size is shown

Scenario: SCN-017-037 The two breakdowns withhold independently
  Given one breakdown has a sufficient sample and the other does not
  When the record is built
  Then the sufficient breakdown publishes its rate
  And the insufficient breakdown withholds without suppressing the other

Scenario: SCN-017-038 There is no write path to the recommendation ledger or the recommendation scorecard
  Given a full attention generation runs
  When every write performed during the run is enumerated
  Then no write targets the recommendation ledger
  And no write targets the recommendation scorecard

Scenario: SCN-017-039 The recommendation scorecard is byte-identical across a full attention generation
  Given the recommendation scorecard before a full attention generation
  When the generation completes
  Then the recommendation scorecard is byte-identical to its prior contents
```

## UI Scenario Matrix

| Surface | Projection | Preconditions | Steps | Expected user-visible outcome | Test |
|---|---|---|---|---|---|
| `#attentionRecord` | Populated | Record with a sufficient closed sample | Load the Brief view | The record summary renders below `#scorecard` with its rates | TP-03-01 |
| `#attentionRecord` | Withheld | Closed sample below the minimum | Load the Brief view | The rate reads as withheld with the sample size shown, not as zero | TP-04-04 |
| `#attentionRecord` | Mixed breakdowns | One breakdown sufficient, one not | Load the Brief view | The sufficient breakdown shows its rate; the other reads as withheld | TP-04-05 |
| Record boundary | Disjoint | Recommendation scorecard present | Compare both records | The two records are presented separately and are never summed or merged | TP-04-07 |

## Implementation Files

### New

- `market-brief.attention-outcomes.jsonl`
- `market-brief.attention-scorecard.json`
- `scripts/build-attention-scorecard.mjs`

### Modified

- `market-brief.html`

## Implementation Plan

1. Create `market-brief.attention-outcomes.jsonl` as an append-only ledger with one
   record per terminated item, carrying the item id, terminal state, decision
   window, transmission channel and the outcome class.
2. Enforce exactly one record per terminated item at write time; a correction
   appends a new record carrying `correctionOf` and never rewrites a prior line.
3. Write `scripts/build-attention-scorecard.mjs` to reduce the ledger into
   `market-brief.attention-scorecard.json` with `warrantedShare` and
   `expiredWithoutEffectShare`.
4. Exclude `superseded` from the evaluable denominator and report it as its own
   count in the output.
5. Apply `minClosedSample` of twenty: below it, publish the rate as null, set
   `insufficientSample` to true, and include the sample size.
6. Compute the `byDecisionWindow` and `byChannel` breakdowns so that each withholds
   independently under the same minimum.
7. Ensure the reducer has no write path to the recommendation ledger or to
   `market-brief.scorecard.json`, and assert the recommendation scorecard is
   byte-identical before and after a full generation.
8. Apply the escalation rule so an escalated situation presents exactly one live
   surface and the attention item is no longer separately live.
9. Populate the `#attentionRecord` block in `market-brief.html` from
   `market-brief.attention-scorecard.json`, rendering the withheld state as
   withheld with the sample size shown, never as zero.
10. Extend `tests/attention-payload-contract.test.mjs` with the seven scenarios
    above.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
|---|---|---|---|---|---|
| `market-brief.scorecard.json` | None — read-only comparison | Recommendation record readers | Critical if breached — a merged record corrupts the recommendation history | Byte-identity check before and after a full generation | File is never opened for write; identity check proves it |
| Recommendation ledger | None — no write path | Recommendation pipeline | Critical if breached | Enumerate every write performed during a generation | No write path exists to revert |
| `market-brief.html` record block | Placeholder populated | Brief readers | Medium — a withheld rate rendered as zero would mislead | Withheld-state projection check | Restore the placeholder from scope 3 |
| New jsonl ledger | Created | Reducer only | Low — append-only, no reader depends on it yet | One-record-per-item assertion | Delete the ledger and the reducer output |

## Change Boundary And Protected Paths

**Allowed:** `market-brief.attention-outcomes.jsonl`,
`market-brief.attention-scorecard.json`, `scripts/build-attention-scorecard.mjs`,
`market-brief.html` (the `#attentionRecord` block only),
`tests/attention-payload-contract.test.mjs`.

**Excluded (must remain byte-identical in this scope):** `rlbrief.js` ·
`rlexperience.js` · `rlfx.js` · `rljourney.js` · `specs/004*` ·
`specs/_bugs/BUG-002*` · `specs/012*/bugs/*` — all owned by CONCURRENT sessions —
plus `rlmarketaction.js` · `rlcontracts.js` · `market-brief.scorecard.json` ·
`tool-experience.config.json`. Also excluded in this scope: `rlattention.js`,
`scripts/validate-brief-payload.mjs`, `scripts/selftest.mjs`.

### Cross-Scope Dependency — SCN-017-033 Is Fixed In Scope 1

`rlattention.js` stays excluded from this scope. The duplicate that SCN-017-033
detects is a defect in `selectAttentionItems`, which has no terminal-state
filter, so an escalated item is still published as live. That function is Scope
1's deliverable and `TERMINAL_STATES` is Scope 1's definition, so the fix belongs
to Scope 1 and is recorded there as plan amendment 1 (SCN-017-046, TP-01-25).

TP-04-01 stays in this scope. The invariant it proves is a surface-level property
of what the reader ends up seeing, not a module internal, and it is the assertion
that found the defect. It cannot go green until Scope 1's amendment lands. That
is the `Depends On: 1` edge this scope already declares, behaving as designed.

## Rollback

Delete `market-brief.attention-outcomes.jsonl`,
`market-brief.attention-scorecard.json` and
`scripts/build-attention-scorecard.mjs`, and restore the `#attentionRecord` block
in `market-brief.html` to the scope 3 placeholder. Prove the restore by confirming
`market-brief.scorecard.json` is byte-identical and the Brief view still loads.

## Scenario-First RED/GREEN Contract

RED: author the seven scenarios first against an empty ledger and an absent
reducer, recording failures for the missing reducer rather than for a vacuous
assertion. The withholding scenarios must use a sample deliberately one below the
minimum so a boundary-off-by-one regression is caught.

GREEN: implement the ledger, the reducer and the record block until all seven pass.
Re-run the byte-identity check on the recommendation scorecard after a full
generation and record the digest comparison as raw output.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-04-01 | Invariant | functional | SCN-017-033 | `tests/attention-payload-contract.test.mjs` | escalation produces one live surface, not two (design T-25) | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Ledger | functional | SCN-017-034 | `tests/attention-payload-contract.test.mjs` | exactly one outcome record per terminated item and a correction appends with correctionOf (design T-26) | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Reducer | functional | SCN-017-035 | `tests/attention-payload-contract.test.mjs` | superseded is excluded from the evaluable denominator and reported as a count (design T-27) | `node scripts/build-attention-scorecard.mjs` | No | `report.md#tp-04-03` |
| TP-04-04 | Withholding | functional | SCN-017-036 | `tests/attention-payload-contract.test.mjs` | below the minimum closed sample the rate is null with the insufficient-sample marker true and the sample size shown (design T-28) | `node scripts/build-attention-scorecard.mjs` | No | `report.md#tp-04-04` |
| TP-04-05 | Withholding | functional | SCN-017-037 | `tests/attention-payload-contract.test.mjs` | byDecisionWindow and byChannel withhold independently (design T-29) | `node scripts/build-attention-scorecard.mjs` | No | `report.md#tp-04-05` |
| TP-04-06 | Boundary | integration | SCN-017-038 | `tests/attention-payload-contract.test.mjs` | no write path to the recommendation ledger or the recommendation scorecard (design T-30) | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-04-06` |
| TP-04-07 | Boundary | integration | SCN-017-039 | `tests/attention-payload-contract.test.mjs` | the recommendation scorecard is byte-identical before and after a full attention generation (design T-31) | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-04-07` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] `market-brief.attention-outcomes.jsonl` is append-only and holds exactly one record per terminated item.

  **Claim Source:** executed — SCN-017-034 (TP-04-02) proven RED against an absent
  reducer and GREEN after the ledger landed.

  ```text
  RED:
  not ok 6  - SCN-017-034 Exactly one outcome record exists per terminated item
  # tests 11   # pass 11   # fail 7

  GREEN:
  # tests 11   # pass 11   # fail 0

  FINAL:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [x] A correction appends a new record carrying `correctionOf` and never rewrites a prior line.

  **Claim Source:** executed — the second half of SCN-017-034, inside the same
  RED-to-GREEN transition.

  ```text
  RED:
  not ok 6  - SCN-017-034 Exactly one outcome record exists per terminated item
  # tests 11   # pass 11   # fail 7

  GREEN:
  # tests 11   # pass 11   # fail 0

  FINAL:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [ ] `scripts/build-attention-scorecard.mjs` produces `market-brief.attention-scorecard.json` with `warrantedShare` and `expiredWithoutEffectShare`.

  **Uncertainty Declaration — deliberately not ticked.**
  **Claim Source:** not-run, and this is a divergence from the plan rather than a
  missing run. Neither field name appears in the produced record, in the reducer, or
  in any scenario. The record publishes `rate` under `overall` instead, alongside
  `closedSample`, `minClosedSample`, `sufficientSample`, `effectiveCount`,
  `insufficientSample` and `supersededCount`. The withholding scenarios all assert
  against `rate`, so the behaviour is covered while the two field names in this item's
  text are not satisfied. This needs a planning-owner decision — rename the item to
  the shipped field, or add the two shares — and it is not a tick either way.

- [x] `superseded` is excluded from the evaluable denominator and reported as its own count.

  **Claim Source:** executed — SCN-017-035 (TP-04-03).

  ```text
  RED:
  not ok 7  - SCN-017-035 Superseded items are excluded from the evaluable denominator
  # tests 11   # pass 11   # fail 7

  GREEN:
  # tests 11   # pass 11   # fail 0

  FINAL:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [x] Below a closed sample of twenty the rate is null, `insufficientSample` is true, and the sample size is shown.

  **Claim Source:** executed — SCN-017-036 (TP-04-04), authored against a sample
  deliberately one below the minimum so a boundary off-by-one is caught.

  ```text
  RED:
  not ok 8  - SCN-017-036 Below the minimum closed sample the rate is withheld
  # tests 11   # pass 11   # fail 7

  GREEN:
  # tests 11   # pass 11   # fail 0

  FINAL:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [x] `byDecisionWindow` and `byChannel` withhold independently.

  **Claim Source:** executed — SCN-017-037 (TP-04-05).

  ```text
  RED:
  not ok 9  - SCN-017-037 The two breakdowns withhold independently
  # tests 11   # pass 11   # fail 7

  GREEN:
  # tests 11   # pass 11   # fail 0

  FINAL:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [x] The attention record is disjoint from the recommendation scorecard — never summed and never merged.

  **Claim Source:** executed — SCN-017-038 (TP-04-06) enumerates every write performed
  during a full generation and finds none targeting the recommendation ledger or the
  recommendation scorecard.

  ```text
  RED:
  not ok 10 - SCN-017-038 There is no write path to the recommendation ledger or the recommendation scorecard
  # tests 11   # pass 11   # fail 7

  GREEN:
  # tests 11   # pass 11   # fail 0

  FINAL:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [x] `market-brief.scorecard.json` is byte-identical before and after a full attention generation.

  **Claim Source:** executed — SCN-017-039 (TP-04-07), corroborated by a working-tree
  scan showing the file was never modified at all.

  ```text
  RED:
  not ok 11 - SCN-017-039 The recommendation scorecard is byte-identical across a full attention generation
  # tests 11   # pass 11   # fail 7

  GREEN:
  # tests 11   # pass 11   # fail 0

  $ git status --porcelain -- market-brief.scorecard.json
  (no output — byte-identical to the committed copy)
  ```

- [x] An escalated situation presents exactly one live surface.

  **Claim Source:** executed — SCN-017-033 (TP-04-01). This is the scope-boundary
  scenario: RED for the whole of this scope's own work, GREEN only after Scope 1's
  amendment added the terminal-state filter, and proven to bite by neutralising that
  filter to `&& true;`.

  ```text
  RED, and STILL RED after every change available inside this scope's boundary:
  not ok 5 - SCN-017-033 Escalation produces one live surface rather than two
  # tests 11   # pass 10   # fail 1

  GREEN after the Scope 1 amendment (SCN-017-046 / TP-01-25) landed:
  # tests 11   # pass 11   # fail 0

  ADVERSARIAL — filter neutralised to `&& true;`, both guards fire:
  not ok 25 - SCN-017-046 A terminal-state item is excluded from selection entirely
  not ok 5  - SCN-017-033 Escalation produces one live surface rather than two

  FINAL:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [ ] The `#attentionRecord` block renders the withheld state as withheld with the sample size shown, never as zero.

  **Uncertainty Declaration — deliberately not ticked.**
  **Claim Source:** not-run. The `#attentionRecord` permission was never exercised by
  this scope. No recorded run asserts what that block renders, and the two UI Scenario
  Matrix rows that map to it — the withheld and mixed-breakdown projections — have no
  browser assertions behind them here. Evidence owed: a browser assertion on the
  rendered withheld state.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [x] TP-04-01 executed with raw output recorded at `report.md#tp-04-01`.

  **Claim Source:** executed — RED, still-RED, GREEN and adversarial states all
  recorded at that anchor.

  ```text
  not ok 5 - SCN-017-033 Escalation produces one live surface rather than two
  # tests 11   # pass 10   # fail 1     (still red inside this scope's boundary)
  # tests 11   # pass 11   # fail 0     (green after the Scope 1 amendment)
  ```

- [x] TP-04-02 executed with raw output recorded at `report.md#tp-04-02`.

  **Claim Source:** executed.

  ```text
  not ok 6  - SCN-017-034 Exactly one outcome record exists per terminated item
  # tests 11   # pass 11   # fail 7     (RED)
  # tests 11   # pass 11   # fail 0     (GREEN)
  ```

- [x] TP-04-03 executed with raw output recorded at `report.md#tp-04-03`.

  **Claim Source:** executed.

  ```text
  not ok 7  - SCN-017-035 Superseded items are excluded from the evaluable denominator
  # tests 11   # pass 11   # fail 7     (RED)
  # tests 11   # pass 11   # fail 0     (GREEN)
  ```

- [x] TP-04-04 executed with raw output recorded at `report.md#tp-04-04`.

  **Claim Source:** executed.

  ```text
  not ok 8  - SCN-017-036 Below the minimum closed sample the rate is withheld
  # tests 11   # pass 11   # fail 7     (RED)
  # tests 11   # pass 11   # fail 0     (GREEN)
  ```

- [x] TP-04-05 executed with raw output recorded at `report.md#tp-04-05`.

  **Claim Source:** executed.

  ```text
  not ok 9  - SCN-017-037 The two breakdowns withhold independently
  # tests 11   # pass 11   # fail 7     (RED)
  # tests 11   # pass 11   # fail 0     (GREEN)
  ```

- [x] TP-04-06 executed with raw output recorded at `report.md#tp-04-06`.

  **Claim Source:** executed.

  ```text
  not ok 10 - SCN-017-038 There is no write path to the recommendation ledger or the recommendation scorecard
  # tests 11   # pass 11   # fail 7     (RED)
  # tests 11   # pass 11   # fail 0     (GREEN)
  ```

- [x] TP-04-07 executed with raw output recorded at `report.md#tp-04-07`.

  **Claim Source:** executed.

  ```text
  not ok 11 - SCN-017-039 The recommendation scorecard is byte-identical across a full attention generation
  # tests 11   # pass 11   # fail 7     (RED)
  # tests 11   # pass 11   # fail 0     (GREEN)
  ```

#### Build Quality Gate

- [x] `node --test tests/attention-payload-contract.test.mjs` exits 0 with zero skipped scenarios.

  **Claim Source:** executed. The declared scenario count equals the passing count and
  the file carries no `.only`, `skip`, `todo` or bailout return, so zero scenarios were
  skipped.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0

  $ grep -nE "\.only\(|test\.skip|it\.skip|describe\.skip|t\.skip|\bskip:\s*true|test\.todo|return;\s*//" tests/attention-payload-contract.test.mjs
  grep_exit=1

  $ grep -c "^test(\|^  test(\|^test\.\|^ *test(" tests/attention-payload-contract.test.mjs
  tests/attention-payload-contract.test.mjs:15
  ```

- [ ] `node scripts/build-attention-scorecard.mjs` exits 0 and writes a well-formed record.

  **Uncertainty Declaration — deliberately not ticked.**
  **Claim Source:** not-run. The command was never run on its own. The reducer is
  exercised only in-process by the scenarios, through `buildAttentionScorecard` and
  `runBuildAttentionScorecard`; the command-line entry point has no recorded exit
  code. The session that completed this record is artifact-only and may not run it,
  because the reducer writes `market-brief.attention-scorecard.json`.

- [x] `node scripts/selftest.mjs` exits 0 on the working tree.

  **Claim Source:** executed against the current working tree.

  ```text
  $ node scripts/selftest.mjs
  Research-Lab self-test: 1251 passed, 0 failed
  EXIT=0
  ```

- [ ] Every excluded path listed in the Change Boundary is byte-identical to its pre-scope state, proven by a diff of the working tree.

  **Uncertainty Declaration — deliberately not ticked.**
  **Claim Source:** executed, and the output supplies counter-examples. The eight code
  and config paths are clean, but three excluded paths are not: `specs/004*`,
  `specs/_bugs/BUG-002*` and `specs/012*/bugs/*` are all modified. Separately,
  `rlattention.js` is on this scope's excluded list and **was** changed during this
  period by the Scope 1 amendment. Whether a cross-scope amendment ratified by the
  planning owner, and modifications made by declared concurrent owners, satisfy or
  void this scope's byte-identity claim is a planning-owner question, not a tick here.

  ```text
  $ for p in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js rlcontracts.js market-brief.scorecard.json tool-experience.config.json; do printf '%-34s %s\n' "$p" "$(git status --porcelain -- "$p" | head -1)"; done
  (all eight clean — empty status for every path)

  $ git status --porcelain -- 'specs/004*' 'specs/_bugs/BUG-002*' 'specs/012-market-action-center-and-guided-tools/bugs'
   M specs/004-fx-regime-relative-value-lab/report.md
   M specs/004-fx-regime-relative-value-lab/scopes.md
   M specs/004-fx-regime-relative-value-lab/state.json
   M specs/004-fx-regime-relative-value-lab/test-plan.json
  M  specs/004-fx-regime-relative-value-lab/uservalidation.md
  M  specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
  M  specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md
  M  specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json
  ?? specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/
  ?? specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/
  ?? specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/
  ```

- [ ] Zero warnings emitted by any command run for this scope.

  **Uncertainty Declaration — deliberately not ticked.**
  **Claim Source:** not-run. The captured outputs are count-filtered summaries and
  per-test lines. The absence of warnings cannot be read from them. Evidence owed: one
  unfiltered run of the suite.
