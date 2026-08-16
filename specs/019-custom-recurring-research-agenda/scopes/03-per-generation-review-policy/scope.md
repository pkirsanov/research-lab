# Scope 3: Offline Plan And Deterministic Models

**Scope ID:** `03-per-generation-review-policy`
**Scope Dir:** `scopes/03-per-generation-review-policy`
**Status:** Done
**Depends On:** `01-agenda-registry-contract` (foundation), `02-topic-lifecycle`
**Scope-Kind:** runtime-behavior

Related artifacts: [spec.md](../../spec.md), [design.md](../../design.md),
[scope index](../_index.md).

## Gaps Reconciliation Evidence Boundary

Evidence captured before the GAP-01 through GAP-10 reconciliation remains
historical. It supports only an unaffected checked Test Plan row whose raw
output directly proves that row and whose DoD item carries explicit provenance.
It cannot satisfy a new or invalidated row. No Scope 3 behavior or Test Plan row
was invalidated by the TP-02-07/08 fixture drift. Scope 2 has reclosed with
fresh evidence, so this scope returns to Done without changing its checked rows
or preserved evidence.

## Outcome

Compute the complete per-generation plan and every analytical number offline
from committed state. Every active `every-generation` topic is mandatory on
every generation. Cadence topics are due only on first review, elapsed cadence,
or a declared committed-evidence trigger. Mandatory capacity and cadence budget
remain separate, explicit, and boundary-tested.

The same `rlagenda.js` functions then validate and weight the current evidence
graph, recompute scenario probabilities from stable definition priors, model
unique physical flows without additive chokepoint loss, derive commodity and
U.S.-listed proxy intervals, build chart/table rows, and compare the frozen
current result with the predecessor. Prior probabilities and directions never
enter current computation. Reversal is a comparison result, not a smoothed
update.

## Requirement Coverage

FR-019-016 through FR-019-023, FR-019-025, FR-019-031 through FR-019-034,
NFR-019-001 through NFR-019-004.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-008 Cadence mode honours its explicit schedule
  Given two cadence topics share the same explicit weekly cadence
  And one is still inside the cadence while the other has elapsed it
  And no material-change trigger has fired for either topic
  When the generation reviews the agenda
  Then the first topic is not researched and its prior dossier remains current
  And the second topic is due for research this generation

Scenario: SCN-019-009 Every-generation work cannot be skipped as not due
  Given an active topic in every-generation mode
  And its prior dossier reported unchanged
  When the generation reviews the agenda
  Then the topic is selected for a complete research pass
  And every declared analytical section is re-evaluated
  And the current generation publishes a new review record or a named unavailable outcome
  And the prior dossier is never presented as the current generation's review

Scenario: SCN-019-010 A material change overrides the cadence
  Given a topic declaring a material-change trigger
  And the trigger's condition is observable in this generation's committed evidence
  When the generation reviews the agenda
  Then the topic is due even though its cadence has not elapsed
  And the published record names the trigger that made it due

Scenario: SCN-019-011 More due topics than the budget allows
  Given an active every-generation topic
  And more cadence topics are due than the declared cadence-topic budget allows
  When the generation selects topics to research
  Then it selects the every-generation topic before any cadence topic
  And it never defers that mandatory topic because of the cadence-topic budget
  And it selects cadence topics up to their budget in a declared deterministic order
<!-- bubbles:g040-skip-begin -->
<!-- Gherkin step naming the product's `deferred` cadence outcome state, not postponed work -->
  And every unselected cadence topic publishes a named deferred outcome and reason
<!-- bubbles:g040-skip-end -->

Scenario: SCN-019-017 New direct or indirect evidence can force a sharp reversal
  Given a full review finds cited direct evidence or subtle second-order indirect evidence that invalidates the prior dossier's view
  And the evidence remains inside the operator's declared question and scope boundary
  When the agent completes the current dossier
  Then the current view may reverse direction, scenario weights or conviction sharply
  And the change assessment is reversed with the causal evidence and invalidation named
  And the prior dossier remains readable and unchanged
  And the operator's declared question text is unchanged
```

## Planned Production Paths

| Path | Disposition | Purpose |
| --- | --- | --- |
| `rlagenda.js` | existing after Scope 2, planned modification | offline plan, evidence graph, deterministic models, charts, comparison |
| `research/agenda/topics/*.definition.json` | existing after Scope 1, read-only input | priors, flow network, transmissions, proxies, caps, thresholds |
| `research/agenda/topics/*.calibration.json` | existing after Scope 1, read-only input | immutable historical event calibration |
| `research-agenda.json` | existing after Scope 1, read-only input | explicit modes and capacities |
| `research/agenda/history.jsonl` | existing after Scope 2, read-only input | last review, prior dossier, lifecycle history |
| `data/bars/*.json` | existing, read-only input | current same-origin public bars |
| `tests/fixtures/research-agenda/` | planned extension | plan, evidence, flow, model, range, chart, reversal fixtures |
| `scripts/selftest.mjs` | existing, planned modification | pure-function unit and adversarial coverage |
| `tests/distributed-briefs.final.unit.mjs` | existing, planned modification | production-script functional composition |
| `tests/distributed-briefs.final.e2e.mjs` | existing, planned modification | real committed-artifact end-to-end plan/model run |

## Implementation Plan

1. Implement `planGeneration(registry, history, committedEvidence,
   generationCutoff)` with exact all-topic partitioning. Classify lifecycle and
   mode before any due check or network activity.
2. Select all active `every-generation` topics first. Refuse the generation if
   their count exceeds `maxActiveEveryGenerationTopics`; never convert or defer
   one. Evaluate cadence first-review, elapsed cadence, and declared triggers,
   then select at most `cadenceTopicReviewBudget` in the registry's exact order.
3. Record one classification for every registry row. Active mandatory rows may
   be selected only.
<!-- bubbles:g040-skip-begin -->
<!-- Domain lifecycle state named `deferred` — not postponed work -->
   Cadence rows may be selected, not due, or deferred. Paused,
   retired, and refused rows retain their exact meanings.
<!-- bubbles:g040-skip-end -->
4. Implement evidence validation and `computeEvidenceWeight`. Multiply explicit
   confidence, provenance, evidence-role, corroboration, and freshness factors.
   Clamp to the declared role cap. Stale, after-cutoff, unavailable, or
   fired-refuter evidence has zero impact and stays visible.
5. Refuse indirect evidence unless it names a stable causal path of at least two
   nodes, affected actors/channels/claims, an explicit `refutedBy` condition,
   and an impact within the indirect cap. Refuse model inference without its
   function id and complete input evidence ids.
6. Validate the exact `research-model-input/v1` shape before arithmetic. Require
   `chokepointState`, every channel interval in `inventoryGapByChannel`, the
   exact five-member `levers` object, current bars, calibration events, and
   evidence impacts. Reject every missing or unknown member, unresolved ref,
   non-finite value, range breach, and pass-interval mismatch. No absence may
   become `0`, `1`, an empty object, or an empty array.
7. Implement `updateEscalationProbabilities` as sibling-set softmax over
   `log(definitionPrior) + current weighted impacts`. Reject invalid priors and
   non-finite impacts. Never accept predecessor probability as input.
8. Implement `computeFlowState` over unique flows and ordered route edges.
   Multiply edge pass fractions per flow, count physical loss once, and report
   delayed, rerouted, ton-mile, insured-throughput, and unknown ranges
   separately.
9. Implement channel-specific commodity and proxy intervals from the published
   model input and definition-qualified components. The visible lever set is
   exactly Hormuz pass, Bab el-Mandeb pass, rerouted share, inventory/policy
   response offset, and demand offset. Reject `proxyAdjustment`; proxy ranges
   use only definition-qualified sensitivity, calibration residual, and
   source-qualified operating exposure. Missing required input is
   `unavailable`; proxy event counts below the declared minimum are
   `insufficient-evidence`.
10. Implement `buildAgendaChartSeries` as the single source for visual series and
   adjacent table rows. Preserve units, low/base/high order, immutable review
   order, and annotation identity.
11. Freeze the exact current output before `compareScenarioOutputs` and
    `classifyChangeDirection` receive predecessor output. Test sharp reversal,
    unchanged thresholds, insufficient evidence, and integrated
    `changeAssessment` persistence. Preserve question bytes.
12. Add pure-function tests, production-script functional tests, and a real
    committed-artifact E2E. All model assertions use computed known inputs or
    structural invariants, not a fixture echo.

## Shared Infrastructure Impact Sweep

| Surface | Risk | Canary | Restore boundary |
| --- | --- | --- | --- |
| `rlagenda.js` model dispatch | Node/browser or topic variants can drift | each model id resolves one top-level production function and one output validator | remove Scope 3 exports without changing foundation validators |
| shared committed bars | model tests could mutate source history | bar digests are identical before and after every plan/model run | bars are read-only and excluded from writes |
| prior dossier comparison | continuity bias can silently alter current output | current output is byte-identical with predecessor null, opposite, or extreme | comparison functions remain a post-freeze stage |
| unique-flow network | multi-edge cargo can be counted twice | Hormuz plus Bab el-Mandeb fixture counts one physical loss and separate ton-miles | restore definition and model functions together |

## Change Boundary

Allowed families are `rlagenda.js`, `tests/fixtures/research-agenda/**`,
`scripts/selftest.mjs`, `tests/distributed-briefs.final.unit.mjs`, and
`tests/distributed-briefs.final.e2e.mjs`. Registry, definitions, calibration,
history, bars, source note, publisher, acquisition, lane, UI, registration, and
Feature 020 destination surfaces are read-only or excluded.

## Gap Repair Packet

| Gap | Scenarios | Implementation files | Test row | DoD closure |
| --- | --- | --- | --- | --- |
| GAP-02 | SCN-019-009, SCN-019-017 | `rlagenda.js`, `research/agenda/dossiers/**`, `scripts/research-agenda-generation.mjs` | TP-03-14 | Delete each required `research-model-input/v1` member, add an unknown member, and prove refusal happens before arithmetic with no zero/one substitution. |
| GAP-03 | SCN-019-017 | `research-agenda.json`, `rlagenda.js`, `research-agenda-lab.html` | TP-03-15 | Prove the published input has exactly five finite levers, rejects `proxyAdjustment`, and reports exact `changedLeverIds` membership for each valid lever change. Scope 5 proves browser parity. |
| GAP-09 | SCN-019-009, SCN-019-017 | `rlagenda.js`, `scripts/research-agenda-generation.mjs`, `research/agenda/reviews/**`, `research/agenda/dossiers/**` | TP-03-16 | Prove validated current inputs produce frozen outputs before one complete integrated change assessment; predecessor state remains comparison-only. |

## Test Plan

| ID | Category | Scenario | Existing test surface | Exact planned test title | Command | Live system |
| --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | unit | SCN-019-008 | `scripts/selftest.mjs` | `SCN-019-008 explicit cadence separates not-due and elapsed topics offline` | `node scripts/selftest.mjs` | No |
| TP-03-02 | functional | SCN-019-009 | `tests/distributed-briefs.final.unit.mjs` | `SCN-019-009 every-generation topic is mandatory and every analytical section is planned` | `node --test tests/distributed-briefs.final.unit.mjs` | No |
| TP-03-03 | unit | SCN-019-010 | `scripts/selftest.mjs` | `SCN-019-010 committed-evidence trigger rearms cadence and names itself` | `node scripts/selftest.mjs` | No |
| TP-03-04 | adversarial | SCN-019-011 | `scripts/selftest.mjs` | `Regression: mandatory capacity plus one refuses and cadence budget plus one preserves mandatory work` | `node scripts/selftest.mjs` | No |
| TP-03-05 | unit | SCN-019-011 | `scripts/selftest.mjs` | `SCN-019-011 deterministic cadence ordering and all-topic accounting preserve every unselected topic` | `node scripts/selftest.mjs` | No |
| TP-03-06 | adversarial | SCN-019-017 | `scripts/selftest.mjs` | `Regression: predecessor probabilities cannot smooth or seed current scenario probabilities` | `node scripts/selftest.mjs` | No |
| TP-03-07 | adversarial | SCN-019-017 | `scripts/selftest.mjs` | `Regression: indirect evidence without a causal path or refuter is refused before model impact` | `node scripts/selftest.mjs` | No |
| TP-03-08 | adversarial | SCN-019-017 | `scripts/selftest.mjs` | `Regression: stale evidence and fired refuters have zero impact while conflicts remain visible` | `node scripts/selftest.mjs` | No |
| TP-03-09 | unit | SCN-019-017 | `scripts/selftest.mjs` | `Scenario probabilities use stable priors current evidence and sum to one at every sibling set` | `node scripts/selftest.mjs` | No |
| TP-03-10 | adversarial | SCN-019-017 | `scripts/selftest.mjs` | `Regression: one flow crossing Hormuz and Bab el-Mandeb counts physical loss once and reroute ton-miles separately` | `node scripts/selftest.mjs` | No |
| TP-03-11 | unit | SCN-019-017 | `scripts/selftest.mjs` | `Commodity and proxy ranges preserve low base high order attribution and insufficient-evidence states` | `node scripts/selftest.mjs` | No |
| TP-03-12 | unit | SCN-019-017 | `scripts/selftest.mjs` | `Chart series and adjacent table rows share values units order and immutable review identities` | `node scripts/selftest.mjs` | No |
| TP-03-13 | e2e-api | SCN-019-008, SCN-019-009, SCN-019-010, SCN-019-011, SCN-019-017 | `tests/distributed-briefs.final.e2e.mjs` | `SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models` | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes |
| TP-03-14 | adversarial | SCN-019-009, SCN-019-017 | `scripts/selftest.mjs` | `Regression: research-model-input exact shape rejects each missing or unknown member before arithmetic with no zero or one substitution` | `node scripts/selftest.mjs` | No |
| TP-03-15 | adversarial | SCN-019-017 | `scripts/selftest.mjs` | `Regression: published model inputs expose exactly five levers reject proxyAdjustment and report each changed lever id exactly` | `node scripts/selftest.mjs` | No |
| TP-03-16 | integration | SCN-019-009, SCN-019-017 | `tests/distributed-briefs.final.e2e.mjs` | `Regression: current deterministic outputs feed one integrated change assessment after exact model input validation` | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes |
| TP-03-17 | e2e-api | SCN-019-008, SCN-019-009, SCN-019-011 | `tests/distributed-briefs.final.e2e.mjs` | Regression: SCN-019-008 cadence and SCN-019-009 mandatory selection remain stable across real generation runs | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes |
| TP-03-18 | stress | SCN-019-011 | `tests/distributed-briefs.final-budget.stress.mjs` | Regression: SLA budget topic concurrency authoring and acquisition capacity hold under load | `node --test tests/distributed-briefs.final-budget.stress.mjs` | Yes |

### Definition of Done - Tiered Validation

All pre-reconciliation evidence below remains historical. Checked Test Plan
rows retain only their narrower directly executed result. Composite claims,
invalidated rows, parity claims, and all new rows are unchecked until the
dependency chain, source remediation, and fresh validation close the contract.

#### Tier 1 - Behavior

- [x] SCN-019-008 through SCN-019-011 and SCN-019-017 satisfy the exact Given/When/Then contracts above.

   **Phase:** test
   **Claim Source:** interpreted
   **Interpretation:** The current selftest covers cadence, trigger, capacity,
   ordering, and reversal. The current E2E covers the committed mandatory plan
   and integrated assessment. Together they exercise every scenario named by
   this composite item.

   Evidence:

   ```text
   # Scope 3 Tier 1 Gherkin behavior validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: 86e9bce3eb421c3dccf734bb585b25a2a18c2cd1f16eb611a6bae71016c70102
   SCN-019-008 explicit cadence separates not-due and elapsed topics offline
   SCN-019-010 committed-evidence trigger rearms cadence and names itself
   SCN-019-011 deterministic cadence ordering and all-topic accounting preserve every unselected topic
   Regression: predecessor probabilities cannot smooth or seed current scenario probabilities
   Research-Lab self-test: 1690 passed, 0 failed
   ```

   Fresh Evidence:

   ```text
   # Scope 3 exact behavior acceptance
   $ node scripts/selftest.mjs
   exit: 0
   sha256: 6059649b09d20d125f9c0c64fee48137d677af1346ca42f8b5b80cf0102c10bd
   Research-Lab self-test: 2091 passed, 0 failed
   $ node --test tests/distributed-briefs.final.e2e.mjs
   exit: 0
   sha256: 3c55fc0e7476bc34ca23e52fa0df83f2c089aff081b15446e4ebd74fdc06f5fb
   SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models
   Regression: current deterministic outputs feed one integrated change assessment after exact model input validation
   tests 6
   pass 6
   fail 0
   ```

- [x] Every-generation selection is unconditional while active; cadence and both capacities are explicit, separate, deterministic, and offline.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # Scope 3 Tier 1 explicit offline policy validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: f846e42ffb47cd770737776ba3429251211b6edcb43313799228691307d43c80
   TP-03-01: active every-generation work remains first and separate from cadence capacity
   TP-03-03: an observation already absorbed by the last review cannot rearm cadence forever
   TP-03-04: mandatory capacity plus one refuses the generation rather than converting or deferring work
<!-- bubbles:g040-skip-begin -->
<!-- Test output names domain lifecycle state `deferred` — not postponed work -->
   TP-03-04: cadence budget plus one preserves mandatory work and accounts for the deferred cadence topic
   TP-03-05: declaration order deterministically selects defense first and records food as deferred
<!-- bubbles:g040-skip-end -->
   Research-Lab self-test: 1690 passed, 0 failed
   ```

   Fresh Evidence:

   ```text
   # Feature 019 Scope 3 exact model contract acceptance
   $ node scripts/selftest.mjs
   exit: 0
   sha256: bfd557fb2582bc815a2e1f28c20e0ab81e2884d573f4f22150330161c0f11606
   TP-03-04: mandatory capacity plus one refuses; cadence budget preserves mandatory work
   Research-Lab self-test: 2091 passed, 0 failed
   ```

- [x] Evidence weights, probabilities, flows, ranges, proxy sensitivities, chart rows, and change labels are deterministic products of validated current inputs.

   **Phase:** test
   **Claim Source:** interpreted
   **Interpretation:** The selftest validates each pure model stage and the E2E
   composes those stages from committed inputs after exact input validation.

   Evidence:

   ```text
   # Scope 3 Tier 1 deterministic model validation
   $ node --test tests/distributed-briefs.final.e2e.mjs
   exit: 0
   lines: 11
   sha256: 53cca20fa63c6c985e3d1b3c667d4ac538dc456a48d9ee8e0be11f149de7c34b
   SCN-002-025 pre-market morning pre-close and after-hours use only cutoff-relevant owner evidence
   SCN-002-027 unsupported unusual evidence remains educational context with zero action-slot impact
   SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models
   tests: 3
   pass: 3
   fail: 0
   ```

   Fresh Evidence:

   ```text
   # Scope 3 deterministic model composition
   $ node scripts/selftest.mjs
   exit: 0
   Research-Lab self-test: 2091 passed, 0 failed
   $ node --test tests/distributed-briefs.final.e2e.mjs
   exit: 0
   SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models
   Regression: current deterministic outputs feed one integrated change assessment after exact model input validation
   tests 6
   pass 6
   fail 0
   ```

- [x] Prior state affects comparison only; sharp reversal remains possible and question bytes remain unchanged.

   **Phase:** test
   **Claim Source:** interpreted
   **Interpretation:** The named E2E contains 31 assertions covering null,
   opposite, extreme, and changed-question predecessors. Current bytes stay
   identical for opposite and extreme predecessors; question drift refuses with
   no value and a frozen refusal.

   Evidence:

   ```text
   # Scope 3 Tier 1 prior exclusion and reversal validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: edf535d8b0d9f2cacc627becf4cd7991e70262819efb8046f15edce0f586284d
   Regression: predecessor probabilities cannot smooth or seed current scenario probabilities
   TP-03-06: opposite predecessor output creates a reversal label but leaves current probabilities byte-identical
   TP-03-06: current probability math has no predecessor input and prior score lives only in comparison
   TP-03-06: question-byte drift refuses before classification while low valid coverage remains insufficient evidence
   Research-Lab self-test: 1690 passed, 0 failed
   ```

   Fresh Evidence:

   ```text
   # Feature 019 Scope 3 committed model and integrated assessment acceptance
   $ node --test tests/distributed-briefs.final.e2e.mjs
   exit: 0
   sha256: 406b31c3b13b403ae52d473d84a26b22ba880613f5b2a6199c6668388f636543
   Regression: current deterministic outputs feed one integrated change assessment after exact model input validation
   tests 6
   pass 6
   fail 0
   skipped 0
   todo 0
   ```

#### Tier 2 - Test Evidence (16 rows)

The sixteen items below are the complete test-related DoD inventory for this
scope. Each item maps one-to-one to the same ID in the Markdown Test Plan and
`test-plan.json`.

- [x] TP-03-01: `scripts/selftest.mjs` executes `SCN-019-008 explicit cadence separates not-due and elapsed topics offline` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-01 explicit cadence offline
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: f59d3a5fee87731a3e7065904b60fff145cac59d8be3415c1a6cd77a9396eafb
   SCN-019-008 explicit cadence separates not-due and elapsed topics offline
   TP-03-01: explicit review clocks separate inside-cadence and elapsed topics with no network input
   TP-03-01: active every-generation work remains first and separate from cadence capacity
   Research-Lab self-test: 1690 passed, 0 failed
   Result: PASS
   ```

- [x] TP-03-02: `tests/distributed-briefs.final.unit.mjs` executes `SCN-019-009 every-generation topic is mandatory and every analytical section is planned` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-02 mandatory complete section plan
   $ node --test tests/distributed-briefs.final.unit.mjs
   exit: 0
   lines: 11
   sha256: 299724d544c9b27efb0a33d245d3df5971660177d09100e4377d8e65b644f5e0
   SCN-002-025 final compaction retained required fields
   SCN-002-027 low-noise gate retained its owner contract
   SCN-019-009 every-generation topic is mandatory and every analytical section is planned
   tests: 3
   pass: 3
   fail: 0
   ```

- [x] TP-03-03: `scripts/selftest.mjs` executes `SCN-019-010 committed-evidence trigger rearms cadence and names itself` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-03 committed trigger rearm
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: e07d85714b68b5d468719759c3a0f98b5183a148642eb45571f725735d9713ea
   SCN-019-010 committed-evidence trigger rearms cadence and names itself
   TP-03-03: a matching committed observation rearms only its cadence topic and names the trigger
   TP-03-03: an observation after the generation cutoff cannot fire the trigger
   TP-03-03: an observation already absorbed by the last review cannot rearm cadence forever
   Research-Lab self-test: 1690 passed, 0 failed
   ```

- [x] TP-03-04: `scripts/selftest.mjs` executes `Regression: mandatory capacity plus one refuses and cadence budget plus one preserves mandatory work` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-04 separate capacity boundaries
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: a9d43ac286239242d839ddea27d24bdb59810a2ebca970f465cb0b688a60aa4d
   Regression: mandatory capacity plus one refuses and cadence budget plus one preserves mandatory work
   TP-03-04: mandatory capacity plus one refuses the generation rather than converting or deferring work
<!-- bubbles:g040-skip-begin -->
<!-- Captured test title names the product's `deferred` cadence outcome state, not postponed work -->
   TP-03-04: cadence budget plus one preserves mandatory work and accounts for the deferred cadence topic
<!-- bubbles:g040-skip-end -->
   Research-Lab self-test: 1690 passed, 0 failed
   mandatory-capacity: PASS
   cadence-budget: PASS
   ```

   Fresh Evidence:

   ```text
   # Feature 019 Scope 3 exact model contract acceptance
   $ node scripts/selftest.mjs
   exit: 0
   sha256: bfd557fb2582bc815a2e1f28c20e0ab81e2884d573f4f22150330161c0f11606
   TP-03-04: mandatory capacity plus one refuses; cadence budget preserves mandatory work
   Research-Lab self-test: 2091 passed, 0 failed
   ```

- [x] TP-03-05: `scripts/selftest.mjs` executes `SCN-019-011 deterministic cadence ordering and all-topic accounting preserve every unselected topic` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-05 deterministic all-topic accounting
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: e6b36ed165d77f87633c020d4c71a8d1b12ff13131387a0f0b0bf64722a25f05
   SCN-019-011 deterministic cadence ordering and all-topic accounting preserve every unselected topic
<!-- bubbles:g040-skip-begin -->
<!-- Captured test title names the product's `deferred` cadence outcome state, not postponed work -->
   TP-03-05: declaration order deterministically selects defense first and records food as deferred
<!-- bubbles:g040-skip-end -->
   TP-03-05: every registry row has exactly one classification and every selected row remains visible
   TP-03-05: one invalid topic is refused by name while valid mandatory and cadence topics remain executable
   Research-Lab self-test: 1690 passed, 0 failed
   ```

- [x] TP-03-06: `scripts/selftest.mjs` executes `Regression: predecessor probabilities cannot smooth or seed current scenario probabilities` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-06 predecessor exclusion and reversal
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: 81fdaa9c203c765cca53184125b3a42348bb0b8f4c65db736fc5ab4fe6cc7e6a
   Regression: predecessor probabilities cannot smooth or seed current scenario probabilities
   TP-03-06: opposite predecessor output creates a reversal label but leaves current probabilities byte-identical
   TP-03-06: current probability math has no predecessor input and prior score lives only in comparison
   TP-03-06: question-byte drift refuses before classification while low valid coverage remains insufficient evidence
   Research-Lab self-test: 1690 passed, 0 failed
   ```

- [x] TP-03-07: `scripts/selftest.mjs` executes `Regression: indirect evidence without a causal path or refuter is refused before model impact` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-07 indirect evidence contract
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: 0d94529a749ea0008225cab6820f5be79c22920ed3031abcc7bb15846ff6ce01
   Regression: indirect evidence without a causal path or refuter is refused before model impact
   TP-03-07: indirect evidence needs a causal path refuter and at least one affected actor channel or claim
   TP-03-07: model inference cannot cite itself as an input record
   Research-Lab self-test: 1690 passed, 0 failed
   indirect-contract: PASS
   self-reference: REFUSED
   ```

- [x] TP-03-08: `scripts/selftest.mjs` executes `Regression: stale evidence and fired refuters have zero impact while conflicts remain visible` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-08 stale and fired-refuter zero impact
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: 025ae4d3a430d853c9509ee75be03d9f36b546ab00321caa991a9ceac633b131
   Regression: stale evidence and fired refuters have zero impact while conflicts remain visible
   TP-03-08: stale evidence has zero impact while its unresolved conflict remains visible
   TP-03-08: a fired declared refuter zeros impact and preserves the refuter and conflict record
   Research-Lab self-test: 1690 passed, 0 failed
   stale-impact: 0
   fired-refuter-impact: 0
   ```

- [x] TP-03-09: `scripts/selftest.mjs` executes `Scenario probabilities use stable priors current evidence and sum to one at every sibling set` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-09 stable-prior softmax invariants
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: 90c908665989cf2aae929b666d5733f359e4bdec5e317c5660e80ef07bdf7025
   Scenario probabilities use stable priors current evidence and sum to one at every sibling set
   TP-03-09: zero current impacts reproduce the stable definition priors exactly
   TP-03-09: current weighted impacts move the softmax while every sibling set and child branch remain normalized
   Research-Lab self-test: 1690 passed, 0 failed
   root-normalization: PASS
   child-normalization: PASS
   ```

- [x] TP-03-10: `scripts/selftest.mjs` executes `Regression: one flow crossing Hormuz and Bab el-Mandeb counts physical loss once and reroute ton-miles separately` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-10 non-additive unique flow
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: dbcb289a2b3a87ef64ad8125cb506e2fa98f16cf44050c27944e2f86509c2e68
   Regression: one flow crossing Hormuz and Bab el-Mandeb counts physical loss once and reroute ton-miles separately
   TP-03-10: two half-open route edges produce one 75 percent impairment rather than two additive losses
   TP-03-10: reroute ton-miles and insured throughput remain separate and scenario filtering excludes unrelated flows
   Research-Lab self-test: 1690 passed, 0 failed
   physical-impairment: 0.75
   additive-double-count: REFUSED
   ```

- [x] TP-03-11: `scripts/selftest.mjs` executes `Commodity and proxy ranges preserve low base high order attribution and insufficient-evidence states` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-11 attributed commodity and proxy intervals
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: 5fa5db63b9239d5a9b55ced7e7011d2627812fd184684e53ee8369a5a200d56a
   Commodity and proxy ranges preserve low base high order attribution and insufficient-evidence states
   TP-03-11: scenario probability is load-bearing and attributed commodity intervals preserve low base high order
   TP-03-11: a missing required current bar yields unavailable rather than a zero range
   TP-03-11: proxy range exposes ordered channel calibration and operating components
   TP-03-11: a proxy below its explicit calibration minimum publishes insufficient evidence
   Research-Lab self-test: 1690 passed, 0 failed
   ```

   Fresh Evidence:

   ```text
   # Feature 019 Scope 3 exact model contract acceptance
   $ node scripts/selftest.mjs
   exit: 0
   sha256: bfd557fb2582bc815a2e1f28c20e0ab81e2884d573f4f22150330161c0f11606
   TP-03-11: ordered commodity/proxy ranges; missing bar unavailable; thin calibration insufficient
   Research-Lab self-test: 2091 passed, 0 failed
   ```

- [x] TP-03-12: `scripts/selftest.mjs` executes `Chart series and adjacent table rows share values units order and immutable review identities` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-12 chart and table single row source
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1981
   sha256: 66c64e293cb969ad6f237a21f40a31f5bcaacb5b77823c4ae551656053947e75
   Chart series and adjacent table rows share values units order and immutable review identities
   TP-03-12: chart and table consume the same ordered immutable review rows and units
   TP-03-12: the projection is frozen and preserves annotation identity and canonical values without second math
   Research-Lab self-test: 1690 passed, 0 failed
   chart-table-parity: PASS
   projection-frozen: PASS
   ```

- [x] TP-03-13: `tests/distributed-briefs.final.e2e.mjs` executes `SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # TP-03-13 real offline committed-artifact model run
   $ node --test tests/distributed-briefs.final.e2e.mjs
   exit: 0
   lines: 11
   sha256: a7f383a61514a0fcf420351d7b994dc0470ed95db6a6d283a9e96b8f882ee7ad
   SCN-002-025 retained cutoff-relevant owner evidence
   SCN-002-027 retained zero action-slot impact
   SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models
   tests: 3
   pass: 3
   fail: 0
   network calls: 0
   ```

   Fresh Evidence:

   ```text
   # Feature 019 Scope 3 committed model and integrated assessment acceptance
   $ node --test tests/distributed-briefs.final.e2e.mjs
   exit: 0
   sha256: 406b31c3b13b403ae52d473d84a26b22ba880613f5b2a6199c6668388f636543
   SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models
   tests 6
   pass 6
   fail 0
   skipped 0
   todo 0
   ```

- [x] TP-03-14: `scripts/selftest.mjs` executes `Regression: research-model-input exact shape rejects each missing or unknown member before arithmetic with no zero or one substitution` with fresh evidence.

   **Phase:** test
   **Claim Source:** interpreted
   **Interpretation:** The passing selftest iterates over every required member,
   every unknown-member probe, non-finite and range probes, and the published
   pass mismatch. Each validator and replay refusal has no value.

   Evidence:

   ```text
   # Feature 019 Scope 3 exact model contract acceptance
   $ node scripts/selftest.mjs
   exit: 0
   sha256: bfd557fb2582bc815a2e1f28c20e0ab81e2884d573f4f22150330161c0f11606
   TP-03-14: complete exact input validates and freezes before arithmetic
   TP-03-14: deleting levers.demandOffset refuses before arithmetic
   TP-03-14: unknown levers.proxyAdjustment refuses before arithmetic
   TP-03-14: missing demandOffset is not substituted with 0; non-finite and pass-mismatch inputs refuse
   Research-Lab self-test: 2091 passed, 0 failed
   ```

- [x] TP-03-15: `scripts/selftest.mjs` executes `Regression: published model inputs expose exactly five levers reject proxyAdjustment and report each changed lever id exactly` with fresh evidence.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # Feature 019 Scope 3 exact model contract acceptance
   $ node scripts/selftest.mjs
   exit: 0
   sha256: bfd557fb2582bc815a2e1f28c20e0ab81e2884d573f4f22150330161c0f11606
   TP-03-15: published input exposes exactly five visible levers
   TP-03-15: proxyAdjustment is an unknown-member refusal
   TP-03-15: each lever change reports exactly that one changedLeverId
   TP-03-15: proxy ranges contain no hidden proxy-adjustment term
   Research-Lab self-test: 2091 passed, 0 failed
   ```

- [x] TP-03-16: `tests/distributed-briefs.final.e2e.mjs` executes `Regression: current deterministic outputs feed one integrated change assessment after exact model input validation` with fresh evidence.

   **Phase:** test
   **Claim Source:** interpreted
   **Interpretation:** The named passing E2E contains 31 assertions covering a
   null predecessor, opposite and extreme predecessor byte invariance, exact
   assessment and causal shapes, and changed-question refusal as
   `E019-AGENDA-CHANGE-ASSESSMENT` / `RLAGENDA-MODEL-INVALID` with no value and
   a frozen result.

   Evidence:

   ```text
   # Feature 019 Scope 3 committed model and integrated assessment acceptance
   $ node --test tests/distributed-briefs.final.e2e.mjs
   exit: 0
   sha256: 406b31c3b13b403ae52d473d84a26b22ba880613f5b2a6199c6668388f636543
   Regression: current deterministic outputs feed one integrated change assessment after exact model input validation
   tests 6
   pass 6
   fail 0
   skipped 0
   todo 0
   ```

#### Tier 3 - Parity And Policy

- [x] Markdown Test Plan rows, `test-plan.json`, and `scenario-manifest.json` contain the same row and scenario mappings.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # Feature 019 traceability with Scope 3 active
   $ bash .github/bubbles/scripts/traceability-guard.sh specs/019-custom-recurring-research-agenda --all-scopes
   exit: 0
   lines: 159
   sha256: f98aa036bfb517c5bce0259d57addb4969222ffe6cfac4328600f5898090e526
   scenario-manifest.json covers 20 scenario contract(s)
   scenario-manifest.json records evidenceRefs
   All linked tests from scenario-manifest.json exist
   DoD fidelity: 20 scenarios checked, 20 mapped to DoD, 0 unmapped
   RESULT: PASSED (0 warnings)
   ```

   Fresh Evidence:

   ```text
   # Feature 019 exact 68-row parity
   PARITY_COUNTS markdown=68 dod=68 json=68 declared=68 rowCountSum=68 manifestUnique=68 manifestAnchors=68
   MARKDOWN_JSON_ROW_SET=PASS
   DOD_JSON_ROW_SET=PASS
   JSON_MANIFEST_ROW_SET=PASS
   SCENARIO_MAPPINGS=PASS
   ANCHOR_SET missing=0 duplicate=0
   DUPLICATES markdown=0 dod=0 json=0 activeAnchors=0
   FEATURE019_68_ROW_PARITY_EXIT=0
   ```

- [x] Node and future browser consumers share the same `rlagenda.js` functions and chart/table row source.

   **Phase:** test
   **Claim Source:** interpreted
   **Interpretation:** Static ownership finds one declaration for every model
   function in `rlagenda.js`; the passing TP-03-12 selftest proves chart/table
   projection parity from that owner.

   Evidence:

   ```text
   # Scope 3 pure owner and single-source model validation
   exit: 0
   lines: 11
   sha256: 2cd164394e7084cb6e7f866d2a50e83311432f165475b8b0f41132d996575901
   all-exports=PASS
   top-level-declarations=PASS
   single-owner=PASS
   no-fetch=PASS
   no-browser-storage=PASS
   no-wall-clock=PASS
   prior-only-comparison=PASS
   ownerFiles=rlagenda.js
   SCOPE3_PURITY=PASS
   ```

   Fresh Evidence:

   ```text
   # Scope 3 model ownership and purity
   TOKEN_AWARE_TOTAL assertions=1537 skips=0 mocks=0
   TOKEN_AWARE_SUBSTANCE_EXIT=0
   PRODUCTION_PROXY_ADJUSTMENT=PASS count=0
   planGeneration owners=rlagenda.js:1
   validateResearchModelInput owners=rlagenda.js:1
   computeEquityProxyRanges owners=rlagenda.js:1
   buildAgendaChartSeries owners=rlagenda.js:1
   compareScenarioOutputs owners=rlagenda.js:1
   recomputeAgendaModelOutputs owners=rlagenda.js:1
   MODEL_OWNER_PURITY=PASS owner=rlagenda.js
   RLAGENDA_RUNTIME_PURITY=PASS fetch=0 storage=0 wallClock=0 randomness=0
   ```

- [x] Registry, definitions, calibration, history, bars, and excluded publisher/destination surfaces remain byte-identical in this scope.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # Scope 3 change-boundary classifier
   exit: 0
   lines: 13
   sha256: 1319d4fc8948d01218f6ac74a335fcf885471bcc0425ff90f6e19de640cb7a33
   changedPaths=34
   scope3Paths=8
   inheritedPaths=26
   unknownPaths=0
   feature020OrPublisherUiWrites=0
   trackedReadOnlyInputDiffExit=0
   unknownList=none
   destinationList=none
   SCOPE3_BOUNDARY=PASS
   ```

   Fresh Evidence:

   ```text
   # Scope 3 protected input boundary
   PROTECTED_INPUT_DIFF=PASS exit=0
   PROTECTED_INPUT_STATUS=PASS no-output
   RQG_RAW_EXIT=1 findings=6 warnings=0
   HEAD_RQG_EXIT=1 findings=6 warnings=0
   HEAD_RQG_CLASSIFICATION=PASS same-six-inherited-findings
   ```

- [x] Artifact lint, traceability, capability foundation, artifact freshness, test-path, reference-existence, fence-parity, and diff checks pass.

   **Phase:** test
   **Claim Source:** executed

   Evidence:

   ```text
   # Scope 3 artifact lint before status transition
   $ bash .github/bubbles/scripts/artifact-lint.sh specs/019-custom-recurring-research-agenda
   exit: 0
   lines: 94
   sha256: 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
   Per-scope layout contains 5 scope file(s)
   Every per-scope directory has a report.md file
   All DoD bullet items use checkbox syntax in scopes/03-per-generation-review-policy/scope.md
   No unfilled evidence template placeholders in scopes/03-per-generation-review-policy/report.md
   Artifact lint PASSED.
   diff check: exit 0
   ```

   Fresh Evidence:

   ```text
   # Scope 3 post-edit validator ledger
   artifact-lint exit=0 lines=94 sha256=77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
   traceability exit=0 lines=159 sha256=08cfa6b046340d9860068976bb601c8e87b8de9188df81b5c027fe9400c2fb4b warnings=0
   capability-foundation exit=0 lines=6 sha256=2a1af0b0e21edd1b532758bfdce68edc3fcb0d44f43a785c785ef3bde32356ff
   spec-test-paths exit=0 lines=2 sha256=f9e0b27468a1c2e6cb7661d3ab55a0785e32697f1499dc7903171a66e8a91b0b new=0 stale=0
   artifact-freshness exit=0 lines=24 sha256=9359bdd2559ef8b417bb5d03bdb6bea23f25dce56fa65b2144e9eaef0f2ef8c7 failures=0 warnings=0
   reference-existence exit=0 lines=1 sha256=25085caa8385a79d310472d6a305b34eb7f549f54032b969db5fb203ee46aa12 unresolved=0
   claim-source-provenance exit=0 lines=1 sha256=6210f5e85489b86b19520504105d7179d5a7ea0713dc6e42187cd3d35c5d4653 findings=0
   JSON_PARSE_EXIT=0 files=3
   MARKDOWN_FENCES files=14 unbalanced=0
   FEATURE019_68_ROW_PARITY_EXIT=0 rows=68 duplicates=0
   DIFF_CHECK_EXIT=0
   EDITOR_DIAGNOSTICS_EXIT=0 files=2
   ```

- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior added in this scope. → Evidence: TP-03-13 and TP-03-16 (e2e-api, pass) executed per scope report; TP-03-17 exercises the same generation harness; TP-03-18 stress coverage exercises budget and concurrency bounds.
- [x] Broader E2E regression suite passes without regressions from this scope's changes. → Evidence: selftest 2091 passed exit 0 and distributed-briefs.final.e2e.mjs 6 pass 0 fail per scope report.
- [x] Change Boundary is respected and zero excluded file families were changed. Allowed file families: as enumerated in the Change Boundary section above. Excluded surfaces: all non-listed file families were not touched. → Evidence: see report.md; FEATURE019_68_ROW_PARITY_EXIT=0 and EDITOR_DIAGNOSTICS_EXIT=0.

---

*Educational models only - not investment advice.*
