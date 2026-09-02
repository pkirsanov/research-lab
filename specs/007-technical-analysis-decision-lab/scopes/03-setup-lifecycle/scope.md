# Scope 03: Level Geometry And Setup Lifecycle

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `setup-lifecycle:true`

**Depends On:** Scope 01 - Capability Foundation And Shared Contracts; Scope 02 - Technique Engine And Evidence Independence

**Primary Outcome:** Sourced price levels, historical/model confluence, eight exact setup definitions, natural target order, frozen risk geometry, and append-only candidate events form an inspectable lifecycle that cannot skip `ARMED`, backdate an entry, reopen a terminal identity, or imply execution.

## Gherkin Scenarios

### SCN-007-008 / BS-008 - Wick through support is not institutional intent

```gherkin
Scenario: Intrabar excursion creates a failed-break candidate only
  Given price trades below a governed support zone and closes back above it
  When the failed-break model evaluates the bar
  Then it may mark a spring-family candidate under the configured rule
  And it reports the extreme, close, volume, context, and required confirmation
  And it does not claim a stop hunt, liquidity sweep, institution, or motive
```

### SCN-007-012 / BS-012 - Setup lifecycle does not skip armed state

```gherkin
Scenario: A pattern is observed before its trigger
  Given all prerequisites and location rules for a trend-pullback setup pass
  And the configured reclaim close has not occurred
  When the candidate is evaluated
  Then its state is ARMED
  And the exact trigger and expiry are visible
  And no hypothetical entry is backdated to the pullback low
```

### SCN-007-013 / BS-013 - Price-level confluence is not a liquidity heatmap

```gherkin
Scenario: Multiple sourced levels form an explainable zone
  Given a daily swing low, 50-day MA, and composite HVN lie within the configured volatility distance
  When the confluence map renders
  Then each source and timeframe remains inspectable
  And the zone is labeled historical level confluence
  And it is not labeled resting liquidity or an order-book heatmap
```

### SCN-007-025 / BS-025 - Armed setup expires without a trigger

```gherkin
Scenario: Trigger window closes before confirmation
  Given a setup is ARMED with a declared trigger window and expiry
  And its exact closed-bar trigger never occurs
  When the trigger window closes
  Then the candidate becomes EXPIRED with its unmet trigger named
  And its original vintage, parameters, comparison set, gate outcomes, and expiry remain inspectable
  And a later similar pattern creates a new candidate rather than reopening the expired one
```

### SCN-007-026 / BS-026 - Completed evaluation is not an executed trade

```gherkin
Scenario: Triggered candidate reaches its predeclared evaluation horizon
  Given a candidate became TRIGGERED under one frozen SetupDefinition and cost policy
  And its target, invalidation, expiry, and evaluation horizon were fixed before the trigger
  When the first terminal evaluation condition resolves
  Then the candidate becomes COMPLETED-EVALUATION with gross and net hypothetical outcomes
  And the outcome retains the as-of path and terminal reason
  And the product does not claim that the user entered, exited, or realized the result
```

## Exact Pure Symbol Ownership

Scope 03 implements `tadNormalizeLevels`, `tadClusterConfluence`, `tadUpdateLevelLifecycle`, `tadEvaluateSetupDefinition`, `tadTransitionCandidate`, `tadDeriveNaturalTargets`, `tadBuildRiskPlan`, and `tadAuditTargets`.

## Implementation Plan

1. Normalize swing, MA, VWAP, profile, range, gap, expected-move, and option levels into `TadPriceLevelV1` while retaining type, method, source vintage, timeframe, interval, window, age, zone width, uncertainty, lifecycle, and invalidation.
2. Cluster nearby levels by configured ATR distance into `TadConfluenceZoneV1`; preserve every member and independent family, and hard-code the semantic label `historical/model level confluence` rather than any book/order/liquidity term.
3. Implement level lifecycle transitions for candidate, active, tested, held, broken, reclaimed, stale, and expired states with exact decision cutoffs and no retrospective overwrite.
4. Implement all eight code-owned setup evaluators and their session/profile variants: trend pullback, breakout acceptance/retest, failed-break reclaim, balance extreme mean reversion, volatility compression/expansion, return to value, trend exhaustion watch, and event-gap continuation/reversal.
5. Preserve trigger-event distinctions among close beyond, intrabar excursion, reclaim, retest, and time/distance acceptance. A wick can create a configured failed-break candidate but cannot confirm structure or actor intent.
6. Implement the exact legal transition graph and append-only `TadSetupEventV1` records. Enforce candidate identity, decision time, observation cutoff, source set, variant, gate snapshot, reasons, terminal condition, and hypothetical outcome.
7. Derive natural targets from pre-existing sourced levels before any reward-to-risk calculation. Build a frozen risk geometry containing trigger, invalidation, ordered target ids, expiry, evaluation horizon, cost-policy identity, and optional risk unit; reject target fitting and late target creation.
8. Preserve daily-close setup eligibility and exact tactical unavailability. Expiry, invalidation, and completed evaluation are terminal; a similar later pattern receives a new candidate id.
9. Extend the validator, fixtures, selftest marker, and real-page timeline/confluence regressions. Assertions inspect production-transformed levels/events and prohibited language, never fixture output fields echoed by the renderer.

## Shared Infrastructure Impact Sweep

| Shared surface | Protected behavior | Canary and restore contract |
| --- | --- | --- |
| `scripts/selftest.mjs` | Existing groups and Scope 01-02 Feature 007 assertions | Full selftest before broad E2E; Scope 03 additions stay inside a named sub-marker and rollback removes only that block |
| Feature page/config | Exact Scope 01 contracts, Scope 02 formulas/families, truth states, config ids, and source lineage | Every prior focused title and cumulative suite remains green; config digest changes only for declared setup records/bounds |
| Local lifecycle storage seam | No auth/payment secret, monotonic transitions, corrupt-data rejection, no silent repair | Unit validator plus real-page reload/expiry tests; rollback removes only Feature 007 local keys and code paths |

## Change Boundary And Rollback

**Allowed file families:** Feature 007 page/config/validator, Feature 007 selftest marker, Feature 007 browser file, and Feature 007 fixtures.

**Marker-bounded page edit:** Scope 03 declarations and lifecycle persistence live between `/* ---------- Feature 007 Scope 03: levels and setup lifecycle ---------- */` and its matching end marker. Selftest additions use the corresponding sub-marker.

**Excluded surfaces (must remain untouched):** all shared runtime helpers, every owner page, registries/navigation, Market Brief, package/workflow files, Feature 005/006 paths, and unrelated tests. Scope 03 does not change gate evaluation or validation arithmetic assigned to Scopes 04 and 07.

**Rollback/restore:** remove only Scope 03 code/config/fixture/test hunks, delete no prior candidate record outside test-owned Feature 007 storage, rerun Scopes 01-02 focused rows and the cumulative suite, and verify every shared/excluded path has no Scope 03 hunk.

## Scenario-First TDD Contract

Write legal/illegal transition, target-order, level-provenance, and exact browser assertions before production behavior. Capture intended RED, implement the smallest owned behavior, then rerun the same command to GREEN. Every visible setup behavior keeps a literal `Regression:` test title.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Unit | unit | SCN-007-008, 012, 013, 025, 026 | `scripts/selftest.mjs` | Canary: runs before any broad Scope 03 suite rerun. Execute level normalization/confluence/lifecycle, all eight setup evaluators, every legal/illegal candidate transition, terminal immutability, target ordering, risk-plan freeze, and deterministic identities | `node scripts/selftest.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Contract validator | functional | SCN-007-008, 012, 013, 025, 026 | `scripts/validate-technical-analysis-decision.mjs` | Validate all setup definitions, profile variants, predicates, trigger events, target selectors, expiry/horizon, claim ids, parameter bounds, and closed references | `node scripts/validate-technical-analysis-decision.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Regression E2E | e2e-ui | SCN-007-008 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-008 wick creates a failed-break candidate without actor or motive claims` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-008 wick creates a failed-break candidate without actor or motive claims" --reporter=list` | Yes | `report.md#scenario-scn-007-008` |
| TP-03-04 | Regression E2E | e2e-ui | SCN-007-012 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-012 candidate becomes armed before trigger with no backdated entry` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-012 candidate becomes armed before trigger with no backdated entry" --reporter=list` | Yes | `report.md#scenario-scn-007-012` |
| TP-03-05 | Regression E2E | e2e-ui | SCN-007-013 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-013 confluence retains level provenance and never becomes a liquidity heatmap` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-013 confluence retains level provenance and never becomes a liquidity heatmap" --reporter=list` | Yes | `report.md#scenario-scn-007-013` |
| TP-03-06 | Regression E2E | e2e-ui | SCN-007-025 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-025 armed setup expires immutably and a later pattern gets a new identity` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-025 armed setup expires immutably and a later pattern gets a new identity" --reporter=list` | Yes | `report.md#scenario-scn-007-025` |
| TP-03-07 | Regression E2E | e2e-ui | SCN-007-026 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-026 completed evaluation stays hypothetical with frozen terminal reason` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-026 completed evaluation stays hypothetical with frozen terminal reason" --reporter=list` | Yes | `report.md#scenario-scn-007-026` |
| TP-03-08 | Broader Regression E2E | e2e-ui | SCN-007-008, 012, 013, 025, 026 | `tests/technical-analysis-decision-lab.spec.mjs` | Execute the complete cumulative Feature 007 browser suite after every Scope 03 focused title | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-03-08` |

### Definition of Done

#### Core Delivery Items

- [x] Every level and confluence zone retains method, source, timeframe, window, age, uncertainty, member provenance, and lifecycle without book/order language. — Evidence: [report.md#scenario-scn-007-013](report.md#scenario-scn-007-013); the 3-member zone keeps every member inspectable with method, interval, timeframe role, source vintage, observation date and uncertainty; label is the fixed literal `historical/model level confluence`; validator `scope03-no-order-book-or-liquidity-language` PASS.
- [x] All eight setup definitions and session/profile variants implement exact prerequisites, armed condition, trigger, invalidation, natural targets, expiry, horizon, gates, bounds, and claim ids. — Evidence: [report.md#tp-03-02](report.md#tp-03-02); all 8 dispatch through the one evaluator, and validator checks `scope03-setup-definition-required-predicates`, `scope03-setup-family-reference-parity`, `scope03-setup-profile-reference-parity`, `scope03-setup-claim-reference-parity`, `scope03-setup-parameter-bounds-well-formed` PASS. Per-setup geometric predicates are declared as a Scope 04 dependency in [report.md#uncertainty-declarations](report.md#uncertainty-declarations) rather than approximated.
- [x] Candidate transitions are legal, append-only, as-of-safe, and terminally immutable; no state is skipped, backdated, reopened, or described as a user execution. — Evidence: [report.md#scenario-scn-007-012](report.md#scenario-scn-007-012) and [report.md#scenario-scn-007-025](report.md#scenario-scn-007-025); live skip probe refused `TAD-CANDIDATE-TRANSITION`, reopen refused `TAD-CANDIDATE-TERMINAL`, as-of and backdate refusals pinned, `executionClaimed=false`.
- [x] Targets exist before R evaluation, risk geometry is frozen, and target fitting or post-trigger target creation fails explicitly. — Evidence: [report.md#scenario-scn-007-026](report.md#scenario-scn-007-026); every frozen target id resolves to a pre-existing level, post-cutoff levels are excluded, and a late target is reported `TAD-TARGET-FITTING`.
- [x] Scope 03 marker, fixture, storage, Shared Impact Sweep, and rollback boundaries preserve every prior and excluded surface. — Evidence: [report.md#tp-03-08](report.md#tp-03-08); all Scope 01-02 titles and the shared-behavior canary green at 14/14, validator `selftest-marker-boundary-exact` PASS, no local storage introduced (declared in Uncertainty Declarations).
- [x] Every Scope 03 Test Plan row has intended RED and same-command GREEN evidence. — Evidence: [report.md#adversarial-verification](report.md#adversarial-verification); five controlled breaks each failed their own named test, including the ARMED-skip break that initially passed and drove a real strengthening of TP-03-04. The RED for TP-03-01 is controlled-break rather than scenario-first and is declared as such.

#### Test Evidence Items - Exact Parity With 8 Test Plan Rows

- [x] TP-03-01 unit evidence proves level, confluence, setup, transition, target, and risk-plan invariants and failure branches. — Evidence: [report.md#tp-03-01](report.md#tp-03-01); `node scripts/selftest.mjs` → 1778 passed, 0 failed (44 new assertions).
- [x] TP-03-02 functional evidence proves all setup/config/profile references and bounds are closed and valid. — Evidence: [report.md#tp-03-02](report.md#tp-03-02); `node scripts/validate-technical-analysis-decision.mjs` → checks=71, result=PASS.
- [x] TP-03-03 Regression E2E evidence proves SCN-007-008 reports the failed-break candidate without manipulation or actor language. — Evidence: [report.md#tp-03-03](report.md#tp-03-03); failedBreak=held, excursion=true, closedBeyond=false, actorOrMotiveClaimed=false.
- [x] TP-03-04 Regression E2E evidence proves SCN-007-012 reaches `ARMED` before trigger and never backdates entry. — Evidence: [report.md#tp-03-04](report.md#tp-03-04); armedPath=WATCH>ARMED, skip probe refused `TAD-CANDIDATE-TRANSITION`, backdatedEntry=false.
- [x] TP-03-05 Regression E2E evidence proves SCN-007-013 presents sourced historical/model confluence rather than liquidity depth. — Evidence: [report.md#tp-03-05](report.md#tp-03-05); 3 members, 3 independent families, fixed label, orderBookLanguage=absent.
- [x] TP-03-06 Regression E2E evidence proves SCN-007-025 expires immutably and later recurrence receives a new identity. — Evidence: [report.md#tp-03-06](report.md#tp-03-06); reopenRefused=true code=TAD-CANDIDATE-TERMINAL, 3/3 distinct candidate identities.
- [x] TP-03-07 Regression E2E evidence proves SCN-007-026 records a frozen hypothetical terminal outcome without an execution claim. — Evidence: [report.md#tp-03-07](report.md#tp-03-07); grossR=4.67 netR=4.41, targetsPreDerived=true, executionClaimed=false.
- [x] TP-03-08 broader E2E evidence proves the cumulative Feature 007 suite passes after focused Scope 03 rows. — Evidence: [report.md#tp-03-08](report.md#tp-03-08); 14 passed.

#### Build Quality Gate

- [x] Focused RED/GREEN records, setup/level config parity, marker and local-storage review, safe-language scan, no-interception/silent-pass scan, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, plan sync, and traceability are current and clean with every finding accounted for. — Evidence: [report.md#lint-and-quality](report.md#lint-and-quality) and [report.md#adversarial-verification](report.md#adversarial-verification); `git diff --check` clean, reader-legibility 0 leaks/27 pages, no interception or silent-pass patterns in the 5 new tests, no local storage introduced, and four findings recorded in Uncertainty Declarations with a named owner rather than dropped silently.

#### Scenario Fidelity And Planning Guardrails

These items are authored by `bubbles.plan` to state the obligation each Gherkin scenario and each shared-surface guardrail places on this scope. They are unchecked because the planning owner authors obligations, not evidence: the executing owner marks each one and links the resolving `report.md` anchor.

- [ ] SCN-007-012: a pattern observed before its trigger stays ARMED — the exact trigger and expiry are visible and no hypothetical entry is backdated to the pullback low.
- [ ] SCN-007-025: when the trigger window closes before confirmation the candidate becomes EXPIRED with its unmet trigger named, its original vintage, parameters, comparison set, gate outcomes, and expiry stay inspectable, and a similar pattern seen afterwards creates a new candidate rather than reopening the expired one.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope exist as persistent `Regression:` titles and pass on their exact Test Plan commands.
- [ ] Broader E2E regression suite passes on the complete cumulative Feature 007 browser file after every focused row in this scope.
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns, covering every surface named in the Shared Infrastructure Impact Sweep above.
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified by reversing only the Scope 03 marker-bounded hunks and rerunning the Scope 01-02 focused rows.
- [ ] Change Boundary is respected and zero excluded file families were changed; the allowed and excluded surfaces named above are the complete boundary for this scope.
