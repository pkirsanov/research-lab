# Scope 04: Five-Gate Synthesis And Candidate Selection

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `decision-synthesis:true`

**Depends On:** Scope 01 - Capability Foundation And Shared Contracts; Scope 02 - Technique Engine And Evidence Independence; Scope 03 - Level Geometry And Setup Lifecycle

**Primary Outcome:** Feature-owned observations, families, levels, setup candidates, validation posture, and risk geometry resolve through five ordered mandatory gates into one immutable read that abstains on any required failure, preserves conflict, and selects by complete evidence rather than direction or indicator count.

## Gherkin Scenarios

### SCN-007-001 / BS-001 - Aligned multi-timeframe trend still needs a setup

```gherkin
Scenario: Aligned trend without location remains no edge
  Given the primary, setup, and trigger roles all show a confirmed uptrend
  And price is extended away from every governed support or value zone
  When the overview evaluates the five gates
  Then primary context passes
  And location fails
  And the UnifiedRead is NO EDGE rather than a bullish trigger
```

### SCN-007-002 / BS-002 - Five gates produce one explainable trigger

```gherkin
Scenario: Every mandatory gate passes for one configured setup
  Given the exact SetupDefinition has a supported ValidationRecord
  And primary context, regime, location, and closed-bar confirmation satisfy its rules
  And the precommitted plan remains attractive after configured costs
  When the overview resolves
  Then the candidate is TRIGGERED
  And trigger, invalidation, target path, gross and net reward-to-risk, strongest support, strongest contradiction, and setup expiry are visible
```

### SCN-007-003 / BS-003 - A failed mandatory gate cannot be outvoted

```gherkin
Scenario: Correlated bullish indicators cannot override a structural break
  Given several moving averages and oscillators are bullish
  And the significant setup structure has closed beyond its invalidation
  When evidence is synthesized
  Then the related indicators count within their declared families
  And the invalidation gate fails
  And the setup is INVALIDATED
```

### SCN-007-004 / BS-004 - Timeframe disagreement remains visible

```gherkin
Scenario: Tactical strength conflicts with the primary downtrend
  Given the trigger role turns up
  And the closed primary role remains a confirmed downtrend
  When the user reads the overview
  Then the result states the timeframe conflict
  And it does not call the primary trend reversed
  And only setup families explicitly eligible for countertrend research may remain armed
```

### SCN-007-022 / BS-022 - No-trade day is a valid result

```gherkin
Scenario: No specialist setup clears every gate
  Given trend, range, and reversal models each have unresolved contradictions
  When the overview evaluates all eligible candidates
  Then the UnifiedRead is NO EDGE or MIXED
  And the strongest near-ready candidate and its missing condition may be shown
  And no low-confidence directional signal is forced
```

### SCN-007-027 / BS-027 - Candidate selection favors gate quality over direction

```gherkin
Scenario: Several eligible setups compete for the overview
  Given a bullish breakout, bearish failed-break, and two-sided mean-reversion candidate are simultaneously eligible
  And their mandatory gates, validation quality, contradictions, and freshness differ
  When the Overview Model selects one setup
  Then it selects the candidate with the strongest complete gate and validation evidence rather than the most bullish score
  And the non-selected candidates remain visible with their weaker or missing conditions
  And evidence reused across candidates is counted once by family
```

## Exact Pure Symbol Ownership

Scope 04 implements `tadRankCandidates`, `tadEvaluatePrimaryGate`, `tadEvaluateRegimeGate`, `tadEvaluateLocationGate`, `tadEvaluateTriggerGate`, `tadEvaluateValidationRiskProcessGate`, `tadSynthesizeFiveGates`, and `tadBuildUnifiedRead`.

## Implementation Plan

1. Implement Primary Context over closed primary/setup structure, Feature-007 trend families, source truth, and explicit comparison role states. Tactical strength cannot rewrite the closed primary direction.
2. Implement Regime And Phase over trend/range/compression/transition evidence and bounded phase hypotheses. It names eligible setup families and keeps unresolved/contradictory phase evidence visible.
3. Implement Location And Asymmetry over sourced levels, confluence, volatility-normalized distance, natural invalidation, and pre-derived targets. Middle-of-range, chasing, missing location, or insufficient structural room fails the gate.
4. Implement Trigger And Confirmation using exact close, excursion, reclaim, retest, acceptance, displacement, participation, relative confirmation, follow-through, and closed/provisional policies declared by the setup.
5. Implement Validation/Risk/Process using exact passport status, frozen plan, explicit cost posture, target audit, arithmetic integrity, and behavior guard. Missing required costs or validation never becomes a pass.
6. Implement ordered synthesis with exactly five gate records. Stop transition eligibility at the first mandatory fail/unavailable while still computing diagnostic records for all five gates. Optional support cannot outvote a mandatory result.
7. Implement deterministic lexicographic ranking: mandatory gate state/completion, validation, truth, contradiction severity/count, eligibility/specificity, then registry/definition/candidate id. Direction is absent from rank dimensions.
8. Build one frozen `TadUnifiedReadV1` only after every required job resolves to a result, explicit unavailable state, or structured failure. Preserve all candidates, families, levels, setup events, missing evidence, support, contradiction, caveats, and exact identity.
9. Extend unit/validator fixtures and visible page receipts for no-edge, triggered, invalidated, mixed, timeframe conflict, and candidate competition. Every fixture causes the result through production predicates rather than carrying an expected verdict field.

## Shared Infrastructure Impact Sweep

| Shared surface | Protected behavior | Canary and restore contract |
| --- | --- | --- |
| `scripts/selftest.mjs` | Existing groups and Scope 01-03 Feature 007 assertions | Full selftest and prior focused rows run before broad E2E; Scope 04 assertions use a named sub-marker and exact reverse-hunk rollback |
| Feature page/config | Source/session truth, exact formulas, family counts, level/setup history, and config identity | All Scope 01-03 focused titles plus the cumulative suite remain green; no renderer-private gate calculation appears |
| Candidate/lifecycle records | Existing immutable event ids and terminal states | Unit tests compare pre/post ledgers and prove synthesis appends no event unless a legal transition occurs |

## Change Boundary And Rollback

**Allowed edits:** Feature 007 page/config/validator, Feature 007 selftest marker, Feature 007 browser file, and Feature 007 fixtures.

**Marker-bounded page edit:** Scope 04 declarations live between `/* ---------- Feature 007 Scope 04: five-gate synthesis ---------- */` and its matching end marker. Selftest additions use the matching sub-marker.

**Explicitly excluded:** shared runtime helpers, owner publishers, registries/navigation, notes/docs, Market Brief, package/workflow files, Feature 005/006 paths, and unrelated tests. Comparison, option, and cost algorithms assigned to Scopes 06-07 may appear only as explicit unavailable inputs in Scope 04 fixtures.

**Rollback/restore:** remove only Scope 04 synthesis/config/fixture/test hunks; rerun all Scope 01-03 focused rows and cumulative suite; verify candidate ledgers and prior contract/config digests are unchanged.

## Scenario-First TDD Contract

Write the exact gate/rank assertions first, capture intended RED, implement one predicate or ranking dimension, and rerun the same command to GREEN. Each changed visible behavior has a literal `Regression:` title. A broad pass cannot replace its focused RED/GREEN pair.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Unit | unit | SCN-007-001, 002, 003, 004, 022, 027 | `scripts/selftest.mjs` | Execute all five gate functions, ordered synthesis, deterministic rank ties, direction exclusion, mandatory precedence, diagnostic continuation, atomic completeness, and 100 identical canonical reads for identical inputs | `node scripts/selftest.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Contract validator | functional | SCN-007-001, 002, 003, 004, 022, 027 | `scripts/validate-technical-analysis-decision.mjs` | Validate exactly five ordered gates, mandatory setup references, ranking enums/order, full UnifiedRead keys, closed statuses, and fixture-to-contract parity | `node scripts/validate-technical-analysis-decision.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Regression E2E | e2e-ui | SCN-007-001 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-001 aligned trend without governed location remains no edge` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-001 aligned trend without governed location remains no edge" --reporter=list` | Yes | `report.md#scenario-scn-007-001` |
| TP-04-04 | Regression E2E | e2e-ui | SCN-007-002 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-002 five mandatory gates produce one complete triggered read` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-002 five mandatory gates produce one complete triggered read" --reporter=list` | Yes | `report.md#scenario-scn-007-002` |
| TP-04-05 | Regression E2E | e2e-ui | SCN-007-003 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-003 structural invalidation defeats correlated bullish indicators` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-003 structural invalidation defeats correlated bullish indicators" --reporter=list` | Yes | `report.md#scenario-scn-007-003` |
| TP-04-06 | Regression E2E | e2e-ui | SCN-007-004 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-004 tactical strength preserves primary downtrend conflict and eligibility` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-004 tactical strength preserves primary downtrend conflict and eligibility" --reporter=list` | Yes | `report.md#scenario-scn-007-004` |
| TP-04-07 | Regression E2E | e2e-ui | SCN-007-022 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-022 unresolved candidates produce no edge or mixed without a weak signal` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-022 unresolved candidates produce no edge or mixed without a weak signal" --reporter=list` | Yes | `report.md#scenario-scn-007-022` |
| TP-04-08 | Regression E2E | e2e-ui | SCN-007-027 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-027 candidate ranking favors complete evidence and keeps alternatives visible` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-027 candidate ranking favors complete evidence and keeps alternatives visible" --reporter=list` | Yes | `report.md#scenario-scn-007-027` |
| TP-04-09 | Broader Regression E2E | e2e-ui | SCN-007-001, 002, 003, 004, 022, 027 | `tests/technical-analysis-decision-lab.spec.mjs` | Execute the complete cumulative Feature 007 browser suite after every Scope 04 focused title | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-04-09` |

### Definition of Done

#### Core Delivery Items

- [ ] All five exact gate functions expose observed, required, outcome, reasons, dependencies, weakest evidence, closed state, and cutoff in fixed order.
- [ ] Mandatory fail/unavailable precedence, family-level counting, timeframe conflict, warning-versus-reversal, no-edge/mixed abstention, and diagnostic completion work exactly as specified.
- [ ] Candidate ranking is deterministic, validation/truth/contradiction aware, direction neutral, and preserves every non-selected candidate and losing dimension.
- [ ] `tadBuildUnifiedRead` commits one frozen complete identity and never publishes a partial, canceled, invalid, or internally inconsistent result.
- [ ] Scope 04 marker, Shared Impact Sweep, fixtures, lifecycle preservation, and rollback boundaries preserve all prior and excluded work.
- [ ] Every Scope 04 Test Plan row has intended RED and same-command GREEN evidence.

#### Test Evidence Items - Exact Parity With 9 Test Plan Rows

- [ ] TP-04-01 unit evidence proves every gate, ranking, precedence, tie, completeness, and deterministic-repeat branch.
- [ ] TP-04-02 functional evidence proves gate/setup/ranking/UnifiedRead config and contract closure.
- [ ] TP-04-03 Regression E2E evidence proves SCN-007-001 fails location and remains `NO EDGE` despite aligned trend.
- [ ] TP-04-04 Regression E2E evidence proves SCN-007-002 exposes one fully explained `TRIGGERED` read after all gates pass.
- [ ] TP-04-05 Regression E2E evidence proves SCN-007-003 invalidation defeats correlated bullish methods.
- [ ] TP-04-06 Regression E2E evidence proves SCN-007-004 preserves tactical/primary conflict and countertrend eligibility.
- [ ] TP-04-07 Regression E2E evidence proves SCN-007-022 emits complete no-edge/mixed abstention without a weak substitute.
- [ ] TP-04-08 Regression E2E evidence proves SCN-007-027 selects by complete evidence and retains alternatives.
- [ ] TP-04-09 broader E2E evidence proves the cumulative Feature 007 suite passes after focused Scope 04 rows.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, gate/rank semantic review, candidate-ledger immutability, marker diffs, no-interception/silent-pass scan, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, plan sync, and traceability are current and clean with every finding accounted for.
