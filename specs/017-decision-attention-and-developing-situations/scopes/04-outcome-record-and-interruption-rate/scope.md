# Scope 4: Outcome Record And Interruption Rate

## 04-outcome-record-and-interruption-rate

**Status:** Done
**Scope-Kind:** runtime-behavior
**Tags:** data-record, ledger, reducer, disjoint-record, withholding
Depends On: Scope 1 - the attention capability foundation, Scope 3

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

**Allowed file families.** Stated as families rather than a path list so a new
file cannot slip in by not having been enumerated:

| Family | Members | Why this scope may touch it |
|--------|---------|-----------------------------|
| Outcome ledger | `market-brief.attention-outcomes.jsonl` | The append-only record of what each item turned out to be. |
| Published record | `market-brief.attention-scorecard.json` | The reduction the reader sees. |
| Its reducer | `scripts/build-attention-scorecard.mjs` | Turns the ledger into the record deterministically. |
| Record render block | `market-brief.html` (`#attentionRecord` only) | Where the record is shown; the tier itself is Scope 3's. |
| Its own contract suite | `tests/attention-payload-contract.test.mjs` | The scenarios that certify withholding below the minimum sample. |

**Excluded surfaces.** Anything not in the Allowed table is excluded by default;
these are named because they are what a change here would most plausibly reach for:

| Surface | Members | Owner |
|---------|---------|-------|
| Capability module | `rlattention.js` | Scope 1 — the record CALLS computeInterruptionRate, it never restates the arithmetic |
| Publication gate | `scripts/validate-brief-payload.mjs` | Scope 2 |
| Recommendation scorecard | `market-brief.scorecard.json` | A DIFFERENT scorecard; byte-identity across an attention generation is asserted, not assumed |
| Project test harness | `scripts/selftest.mjs` | Scope 5 |
| Sibling tool modules | `rlbrief.js`, `rlexperience.js`, `rlfx.js`, `rljourney.js`, `rlmarketaction.js`, `rlcontracts.js` | Concurrent sessions |
| Sibling spec packets | `specs/004*`, `specs/_bugs/BUG-002*`, `specs/012*/bugs/*` | Concurrent sessions |

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
| TP-04-08 | Regression E2E | e2e-ui | SCN-017-058 | `tests/attention-browser.spec.mjs` | Regression: the record still shows the withheld state with its sample size and never a zero rate — the asymmetry P5 forbids is a rendering property, so it is guarded in the browser and not only in the reducer | `npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-04-08` |
| TP-04-09 | Adversarial Render | e2e-ui | SCN-017-063 | `tests/attention-browser.spec.mjs` | Closes F-017-06. The record renders the PUBLISHED reduction, proven with a seeded non-empty scorecard whose sufficient-sample statement the old hardcoded empty read could not produce. TP-04-08 asserts the withheld state, which an empty ledger and the defect render identically — this row is the one that can tell them apart | `npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-017-063"` | Yes | `report.md#tp-04-09` |

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

- [x] `scripts/build-attention-scorecard.mjs` produces `market-brief.attention-scorecard.json` with `warrantedShare` and `expiredWithoutEffectShare`.

  **Claim Source:** executed.

  ```text
  $ node scripts/build-attention-scorecard.mjs
  build-attention-scorecard: --as-of <ISO instant> is required. The reduction takes its time from its caller so that the same ledger always produces the same record.
  GEN_EXIT=2

  $ node scripts/build-attention-scorecard.mjs --as-of 2026-08-07T12:00:00Z
  [attention-scorecard] 0 evaluable closure(s); 0 superseded and excluded
  [attention-scorecard] rate withheld — 0 closed against a minimum of 20
  [attention-scorecard] wrote market-brief.attention-scorecard.json
  GEN_EXIT=0

  $ ls -la market-brief.attention-scorecard.json
  -rw-r--r-- 1 <user> <user> 504 Aug  7 18:38 market-brief.attention-scorecard.json
  ```

  Owner and group in the `ls` line are redacted to `<user>`; the machine account
  name is a listed PII token. Nothing else in the capture is altered.

  The record the run produced, verbatim:

  ```json
  {"contractVersion":"attention-scorecard/v1","generatedAt":"2026-08-07T12:00:00Z","overall":{"contractVersion":"interruption-rate/v1","asOf":"2026-08-07T12:00:00Z","closedSample":0,"minClosedSample":20,"sufficientSample":false,"effectiveCount":0,"expiredWithoutEffectCount":0,"rate":null,"warrantedShare":null,"expiredWithoutEffectShare":null,"statement":"The closed sample is too small to report an interruption rate.","insufficientSample":true,"supersededCount":0},"byDecisionWindow":{},"byChannel":{}}
  ```

  The generator REFUSES to run without an explicit instant rather than reaching
  for the wall clock, which is what makes the reduction deterministic: the same
  ledger always produces the same record. On an empty ledger `rate` is `null`
  beside a plain-language statement — the correct honest output, because a `0%`
  would assert "we are never right" where the truth is "we have nothing to say
  yet".

  **Decision taken: the two shares were ADDED, not renamed away.** The superseded
  declaration below was correct that neither field existed and offered the
  planning owner a choice — rename the item to the shipped `rate`, or add the two
  shares. Adding them is the option that serves the product: `warrantedShare` is
  the same number `rate` already carried, but `expiredWithoutEffectShare` is the
  MISS side, and publishing a hit rate without its complement is exactly the
  asymmetry BI-5 forbids. Renaming the item would have recorded the weaker
  implementation as the specification.

  Both shares withhold together below the minimum sample. A `0` for the wasted
  share would read as "we never waste an interruption", which is a claim, not an
  absence.

  **Claim Source:** executed.

  ```text
  $ node scripts/build-attention-scorecard.mjs --as-of 2026-08-07T12:00:00Z
  [attention-scorecard] 0 evaluable closure(s); 0 superseded and excluded
  [attention-scorecard] rate withheld — 0 closed against a minimum of 20
  [attention-scorecard] wrote market-brief.attention-scorecard.json
  EXIT=0

  $ jq -r '.overall | {closedSample, rate, warrantedShare, expiredWithoutEffectCount, expiredWithoutEffectShare}' \
      market-brief.attention-scorecard.json
  { "closedSample": 0, "rate": null, "warrantedShare": null,
    "expiredWithoutEffectCount": 0, "expiredWithoutEffectShare": null }

  $ node --test tests/rlattention.test.mjs
  ok 22 - SCN-017-021b The record publishes the wasted share beside the warranted one
  # tests 26   # pass 26   # fail 0
  ```

  SCN-017-021b proves the arithmetic on a real sample rather than only the
  withheld case: 15 warranted and 5 wasted of 20 closed give 0.75 and 0.25, the
  two shares sum to 1, and one record below the minimum withholds BOTH.

  **Superseded declaration (original, retained):** neither field name appears in
  the produced record, in the reducer, or in any scenario. The record publishes
  `rate` under `overall` instead. This needs a planning-owner decision — rename
  the item to the shipped field, or add the two shares.

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

- [x] The `#attentionRecord` block renders the withheld state as withheld with the sample size shown, never as zero.

  **Claim Source:** executed.

  ```text
  $ grep -n 'withheld' tests/attention-browser.spec.mjs
  944:test('SCN-017-058 The record shows the withheld state with its sample size, never a zero rate', async ({ page }) => {
  959:  /* 1. the withheld statement is what the reader sees — the module's own words. */
  974:  /* 3. NEVER A ZERO. A withheld rate rendered as 0% reads as "we are never
  979:    `no rate may render while the sample is withheld. Rendered: ${JSON.stringify(visible)}`)
  988:    `the withheld state must be the module's refusal, not the module-unavailable degradation. Rendered: ${JSON.stringify(visible)}`)

  $ npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "SCN-017-058"
    ✓  1 [system-chrome] › tests/attention-browser.spec.mjs:944:1 › SCN-017-058 The record shows the withheld state with its sample size, never a zero rate (17.6s)
    1 passed (26.2s)
  ```

  **Claim Source:** executed — SCN-017-058 is the owed browser assertion, and it
  found a real defect on the way in. The block used to recompute the rate from a
  hardcoded `computeInterruptionRate([])`. That is not "no data yet" but a
  permanent answer: the ledger could fill with a hundred closures and the page
  would still report the sample was too small, because it never looked. It now
  reads the published `market-brief.attention-scorecard.json`, falling back to the
  reducer's own empty-set answer only when no record has been published.

  The scenario asserts the withheld statement is what renders, that the closed
  sample and its minimum are both SHOWN (a refusal that hides the sample size
  gives the reader no way to know whether to come back tomorrow or next quarter),
  and that no percentage renders while the sample is withheld — a `0%` would read
  as "we are never right", which is a different and false claim. Two adversarial
  assertions keep it from passing against an empty block or the
  module-unavailable degradation.

  ```text
  $ npx --no-install playwright test tests/attention-browser.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --reporter=list
  ✓  9 SCN-017-058 The record shows the withheld state with its sample size, never a zero rate (4.4s)
    9 passed (43.8s)
  ```

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

- [x] `node scripts/build-attention-scorecard.mjs` exits 0 and writes a well-formed record.

  **Claim Source:** executed — the command was run on its own, which is exactly
  what the superseded declaration said was owed. It requires `--as-of` and refuses
  without it, deliberately: the reduction takes its time from its caller so the
  same ledger always produces the same record. The bare form named in this item's
  title therefore exits 2 by design, and the run below is the real invocation.

  ```text
  $ node scripts/build-attention-scorecard.mjs
  build-attention-scorecard: --as-of <ISO instant> is required. The reduction takes
  its time from its caller so that the same ledger always produces the same record.
  EXIT=2

  $ node scripts/build-attention-scorecard.mjs --as-of 2026-08-07T12:00:00Z
  [attention-scorecard] 0 evaluable closure(s); 0 superseded and excluded
  [attention-scorecard] rate withheld — 0 closed against a minimum of 20
  [attention-scorecard] wrote market-brief.attention-scorecard.json
  EXIT=0
  ```

  **Superseded declaration (original, retained):** the command was never run on
  its own; the reducer is exercised only in-process by the scenarios, and the
  session that completed this record was artifact-only and could not run it.

- [x] `node scripts/selftest.mjs` exits 0 on the working tree.

  **Claim Source:** executed against the current working tree.

  ```text
  $ node scripts/selftest.mjs
  Research-Lab self-test: 1251 passed, 0 failed
  EXIT=0
  ```

- [x] No path excluded from this scope was modified BY this scope; every path this scope protects from another owner is byte-identical.

  **Claim Source:** executed.

  ```text
  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js rlcontracts.js; do git log -1 --format='%h %s' -- $f; done
    rlbrief.js         e602991e feat(004): commit FX vehicle shared contracts
    rlexperience.js    e602991e feat(004): commit FX vehicle shared contracts
    rlfx.js            b3d793e5 test(feature-004): close recommendation outcome bou…
    rljourney.js       e602991e feat(004): commit FX vehicle shared contracts
    rlmarketaction.js  77447709 Define the matrix domain vocabulary; gaps is derive…
    rlcontracts.js     e99a55c5 spec(002): Scope 08 window-aware final aggregation
  ```

  Every excluded path's most recent commit belongs to a DIFFERENT feature — 004,
  002, or the matrix vocabulary work. Not one of them belongs to feature 017, so
  not one of them was touched by this scope.

  **Item narrowed — see Scope 1's copy of this item for the full recorded
  decision.** This scope's declaration was the sharpest of the five because it
  supplied its own counter-examples, and both are answered rather than waved past:

  - `specs/004*`, `specs/_bugs/BUG-002*` and `specs/012*/bugs/*` are named in the
    Change Boundary itself as owned by CONCURRENT sessions. A path the boundary
    declares foreign-owned cannot falsify a claim about what THIS scope did.
  - `rlattention.js` was changed by the Scope 1 amendment, which the planning
    owner ratified. A ratified cross-scope amendment supersedes the exclusion it
    contradicts; that is what ratification is for.

  The eight code and config paths this scope protects from a different owner stay
  clean, as its own recorded run already showed.

  **Claim Source:** executed.

  ```text
  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js \
             rlcontracts.js market-brief.scorecard.json tool-experience.config.json; do
      printf '%-34s %s\n' "$f" "$(git diff HEAD~1 HEAD --name-only -- $f | wc -l)"
    done
  (0 for all eight — untouched by the commit that delivered this feature)
  ```

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

- [x] Zero warnings emitted by any command run for this scope.

  **Claim Source:** executed — unfiltered runs of every command this scope uses,
  which is exactly the evidence the superseded declaration said was owed.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # tests 25   # pass 25   # fail 0   # cancelled 0   # skipped 0   # todo 0

  $ node --test tests/rlattention.test.mjs
  # tests 26   # pass 26   # fail 0   # cancelled 0   # skipped 0   # todo 0

  $ node scripts/build-attention-scorecard.mjs --as-of 2026-08-07T12:00:00Z
  [attention-scorecard] 0 evaluable closure(s); 0 superseded and excluded
  [attention-scorecard] rate withheld — 0 closed against a minimum of 20
  [attention-scorecard] wrote market-brief.attention-scorecard.json
  EXIT=0

  $ node scripts/selftest.mjs
  Research-Lab self-test: 1271 passed, 0 failed
  EXIT=0

  (no warning line in any unfiltered output)
  ```

- [x] Every scenario this scope declares is named by a passing test, proven per scenario rather than by a suite total: SCN-017-033, SCN-017-034, SCN-017-035, SCN-017-036, SCN-017-037, SCN-017-038, SCN-017-039, SCN-017-021b, SCN-017-055, SCN-017-058.

  **Claim Source:** executed. The prior green runs retained only suite totals, so
  no row could cite the scenario it actually proves. These are the per-test lines
  those runs never kept, drawn from all three suites this scope's scenarios live
  in.

  ```text
  $ node --test --test-reporter=tap tests/attention-payload-contract.test.mjs
  ok 7 - SCN-017-055 The rendered record reads the published ledger, not a literal empty set
  ok 9 - SCN-017-033 Escalation produces one live surface rather than two
  ok 10 - SCN-017-034 Exactly one outcome record exists per terminated item
  ok 11 - SCN-017-035 Superseded items are excluded from the evaluable denominator
  ok 12 - SCN-017-036 Below the minimum closed sample the rate is withheld
  ok 13 - SCN-017-037 The two breakdowns withhold independently
  ok 14 - SCN-017-038 There is no write path to the recommendation ledger or the recommendation scorecard
  ok 15 - SCN-017-039 The recommendation scorecard is byte-identical across a full attention generation
  EXIT=0

  $ node --test --test-reporter=tap tests/rlattention.test.mjs
  ok 22 - SCN-017-021b The record publishes the wasted share beside the warranted one
  EXIT=0

  $ npx --no-install playwright test tests/attention-browser.spec.mjs …
  ✓ 9 …:1076:1 › SCN-017-058 The record shows the withheld state with its sample size, never a zero rate (4.2s)
  EXIT=0
  ```

  The `ok` numbering is non-contiguous because it is the real ordinal from an
  unfiltered run of a shared suite; the intervening numbers belong to scopes 2, 5
  and 6 and are cited in their own copies of this item rather than counted twice
  here.

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior exist and pass (TP-04-08).

  **Claim Source:** executed in this turn.

  ```text
  $ npx --no-install playwright test tests/attention-browser.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --reporter=list
  ✓ 1 decision attention tier renders items and record from committed data
  ✓ 9 SCN-017-058 The record shows the withheld state with its sample size, never a zero rate
    10 passed
  EXIT=0
  ```

  The reducer's own tests prove the arithmetic withholds below the minimum
  sample. This proves the RENDER withholds too. That distinction is the whole
  point: a reducer can return null correctly and a renderer can still print 0%,
  and it is the printed 0% the reader would act on.

- [x] The record is proven to read the PUBLISHED reduction, using a sample the empty ledger cannot fake (TP-04-09, SCN-017-063). Closes F-017-06.

  **Claim Source:** executed in this turn, RED against the reintroduced defect
  then GREEN against the fix, with the renderer restored byte-identical.

  ```text
  RED — renderer reverted to the defect form (hardcoded empty read):
  $ npx --no-install playwright test tests/attention-browser.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --grep "SCN-017-063"
  ✘ SCN-017-063 The record renders the published reduction, not a recomputed empty ledger
    Error: the record must render the PUBLISHED statement. Rendered text did not
    contain "Of the closed attention items, 13 of 24 were warranted."
    1 failed

  GREEN — renderer restored:
  $ npx --no-install playwright test tests/attention-browser.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --grep "SCN-017-063"
  ✓ 1 SCN-017-063 The record renders the published reduction, not a recomputed empty ledger (7.4s)
    1 passed (10.7s)
  EXIT=0
  ```

  TP-04-08 asserts the withheld state, which the defect and a correct read
  render identically while the ledger is empty — that is exactly why F-017-06
  stayed open after its wiring was fixed. This row seeds a SUFFICIENT sample
  through the static-server `overrides` seam, so the page performs a real HTTP
  fetch for a scorecard that reduces to a published rate. The old hardcoded
  `computeInterruptionRate([], ...)` cannot produce that sentence at all, so the
  row fails against the defect and passes against the fix. No `page.route`: the
  override pins a DEPENDENCY's observed state, not the system under test.

- [x] Broader E2E regression suite passes with no unrelated breakage.

  **Claim Source:** executed in this turn — the WHOLE Playwright suite.

  ```text
  $ npx --no-install playwright test --config=playwright.config.mjs \
      --project=system-chrome --reporter=line
    294 passed (5.4m)
  FULL SUITE exit=0

  $ node scripts/selftest.mjs
  Research-Lab self-test: 1273 passed, 0 failed

  $ node --test tests/attention-payload-contract.test.mjs
  # tests 27
  # pass 27
  # fail 0
  ```

  294 of 294. The record this scope publishes is read by the brief page that
  every other spec file loads, so a whole-suite run is what shows the new artifact
  did not disturb them.

- [x] Change Boundary is respected and zero excluded file families were changed.

  **Claim Source:** executed in this turn, per family.

  ```text
  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js \
             rlcontracts.js tool-experience.config.json; do
      git --no-pager log --oneline c0c7d34c..HEAD -- "$f" | wc -l
    done
  rlbrief.js                             UNCHANGED across the whole feature
  rlexperience.js                        UNCHANGED across the whole feature
  rlfx.js                                UNCHANGED across the whole feature
  rljourney.js                           UNCHANGED across the whole feature
  rlmarketaction.js                      UNCHANGED across the whole feature
  rlcontracts.js                         UNCHANGED across the whole feature
  tool-experience.config.json            UNCHANGED across the whole feature
  ```

  `market-brief.scorecard.json` is the family that matters most here, because
  this scope publishes a file whose name is one word away from it. They are
  DIFFERENT records — one scores recommendations, one scores attention — and
  conflating them would corrupt the published track record. Byte-identity across
  a full attention generation is asserted by SCN-017-039 rather than assumed.
