# Scope 02: Technique Engine And Evidence Independence

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `technique-engine:true`

**Depends On:** Scope 01 - Capability Foundation And Shared Contracts

**Primary Outcome:** Every Feature-007-owned technical method executes as an exact, inspectable pure function over source-qualified observations, while correlated transforms collapse into declared evidence clusters and unsupported claims remain unable to influence methods, defaults, gates, or copy.

## Gherkin Scenarios

### SCN-007-009 / BS-009 - Volume confirms without identifying an actor

```gherkin
Scenario: Expansion volume supports a breakout hypothesis
  Given price closes beyond a structural boundary
  And source-qualified relative volume exceeds the configured threshold
  When the breakout model evaluates confirmation
  Then participation supports the breakout family
  And the source, normalization window, and bar classification are visible
  And no participant identity is inferred
```

### SCN-007-010 / BS-010 - Indicator families prevent vote inflation

```gherkin
Scenario: Related indicators count once at family level
  Given SMA, EMA, MACD, RSI, and Bollinger-derived conditions are all positive
  When the overview counts independent support
  Then SMA and EMA variants remain in the trend family
  And MACD and RSI remain in their declared momentum clusters
  And the user can inspect raw methods without the raw count becoming confidence
```

### SCN-007-011 / BS-011 - Range stays unresolved before confirmation

```gherkin
Scenario: Sideways range after a decline is not declared accumulation
  Given price has formed a mature range after a downtrend
  And no configured spring, sign of strength, or confirmed range break has completed
  When the phase model resolves
  Then accumulation remains a candidate hypothesis
  And distribution and continuation contradictions remain visible
  And the overview does not trigger a long setup
```

### SCN-007-031 / BS-031 - Unreviewed transcript claim cannot enter the model

```gherkin
Scenario: New transcript assertion has no independent grounding
  Given a transcript confidently states a universal win rate, hidden actor, or causal chart rule
  And the assertion has no supported or bounded ledger verdict with an independent source or reproducible calculation
  When the claim-admission policy evaluates it
  Then the assertion remains rejected and cannot affect a default, TechniqueResult, SetupDefinition, GateResult, or product copy
  And the ledger names the evidence required for reconsideration
  And repeated wording across transcripts does not count as independent support
```

## Exact Pure Symbol Ownership

Scope 02 implements these exact top-level declarations from `design.md`: `tadSmaSeries`, `tadEmaSeries`, `tadAtrSeries`, `tadRsiSeries`, `tadMacdSeries`, `tadBollingerSeries`, `tadAdxDmiSeries`, `tadObvSeries`, `tadCmfSeries`, `tadRelativeVolume`, `tadEffortResult`, `tadVolumeProfile`, `tadVwapEnvelope`, `tadPivots`, `tadRelativeStrength`, `tadEvaluateTechnique`, and `tadClusterEvidenceFamilies`.

## Implementation Plan

1. Implement SMA/EMA 20/50/200 stack, slope, cross, ATR distance, and level state with explicit lengths and smoothing. All lengths and both smoothing forms remain one trend-filter cluster for a gate.
2. Implement Wilder ATR/ATRP, RSI, ADX/DMI, MACD, and Bollinger center/sample-dispersion/width/position with exact finite/history/parameter guards. ATR and ADX strength never supply direction by themselves; overbought, oversold, and band touch never create a reversal.
3. Implement OBV, CMF, relative volume, effort/result, and bar-direction volume with visible source lineage, normalization window, and proxy classification. These transforms form one participation family and never identify a participant or motive.
4. Implement VWAP statistical envelopes and volume-at-price profile independently. The profile discloses source interval, allocation/bucket method, value-area share, POC, VAH/VAL, HVN/LVN, and up/down proxy; no result is named resting liquidity.
5. Implement confirmed/provisional pivot structure and aligned total-return-normalized relative strength. Raw price similarity, incompatible timestamps, and mixed adjustment/session inputs fail explicitly.
6. Implement `tadEvaluateTechnique` as a closed id-to-code dispatch over `TadTechniqueDefinitionV1`. JSON selects known ids and parameters but cannot inject code, formula text, markup, or an unknown technique.
7. Implement `tadClusterEvidenceFamilies` using family, cluster, input kinds, lineage keys, and transform signatures. Opposing methods in one cluster become `unstable`; support, contradiction, unstable, disabled, and unavailable denominators remain separate.
8. Enforce claim admission in config validation and technique dispatch. Only `supported` or `bounded` claim records with an independent source or reproducible calculation, tier, scope, limitation, and allowed treatment may activate a method or explanation.
9. Extend the Feature 007 validator, source-qualified/analytic/invalid fixtures, selftest marker block, and real-page browser suite. Analytic series prove formulas; source-qualified snapshots prove lineage and state; no fixture value is presented as current external evidence.

## Shared Infrastructure Impact Sweep

| Shared surface | Protected behavior | Canary and restore contract |
| --- | --- | --- |
| `scripts/selftest.mjs` | Existing test groups, Feature 005/006 markers, extraction helpers, totals, and exit status | Run full selftest before trusting focused assertions; edits remain inside the Feature 007 marker and rollback removes only Scope 02 assertions |
| `technical-analysis-decision-lab.html` | Scope 01 contract symbols, config-first boot, truth state, source/session identities, and fixture publication block | Scope 01 focused titles and full cumulative Feature 007 browser suite must remain green before Scope 03 starts |
| `technical-analysis-decision-universe.json` | Closed ids, references, bounds, claims, versions, and source/session policies | Focused validator parses JSON and proves registry/reference parity before the page test runs |

## Change Boundary And Rollback

**Allowed edits:** `technical-analysis-decision-lab.html`, `technical-analysis-decision-universe.json`, `scripts/validate-technical-analysis-decision.mjs`, the Feature 007 marker block in `scripts/selftest.mjs`, `tests/technical-analysis-decision-lab.spec.mjs`, and `tests/fixtures/technical-analysis-decision/**`.

**Marker-bounded page edit:** all Scope 02 declarations live between `/* ---------- Feature 007 Scope 02: technique engine ---------- */` and its matching end marker. The selftest additions live inside the existing Feature 007 group under a `Scope 02` sub-marker.

**Explicitly excluded:** `rldata.js`, `rlvalidation.js`, Strategy Validation, every owner publisher page, registries/navigation, shared shell/chart/ticker/glossary files, Market Brief, package/workflow files, all Feature 005/006 paths, and unrelated tests.

**Rollback/restore:** remove the Scope 02 page, config, validator, fixture, selftest, and browser-test hunks only; rerun every Scope 01 test row and verify exact Scope 01 contract/config digests and shared canaries.

## Scenario-First TDD Contract

Write each named unit/validator/browser assertion first and capture the intended behavior failure. Implement one method family or admission rule at a time, then rerun the identical command. Every visible behavior has a literal `Regression:` title; a syntax/server/runner failure or a different failing test is not RED evidence.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Unit | unit | SCN-007-009, 010, 011, 031 | `scripts/selftest.mjs` | Execute all 17 Scope 02 production symbols across formulas, bounds, unavailable histories, deterministic repeats, proxy lineage, family anti-double-counting, cluster conflict, and claim rejection | `node scripts/selftest.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Contract validator | functional | SCN-007-009, 010, 011, 031 | `scripts/validate-technical-analysis-decision.mjs` | Validate technique definitions, parameters, claims, formula versions, family/cluster references, output vocabularies, proxy labels, and config/universe parity | `node scripts/validate-technical-analysis-decision.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Regression E2E | e2e-ui | SCN-007-009 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-009 breakout volume supports one proxy family without actor identity` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-009 breakout volume supports one proxy family without actor identity" --reporter=list` | Yes | `report.md#scenario-scn-007-009` |
| TP-02-04 | Regression E2E | e2e-ui | SCN-007-010 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-010 correlated indicators count once and raw count is not confidence` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-010 correlated indicators count once and raw count is not confidence" --reporter=list` | Yes | `report.md#scenario-scn-007-010` |
| TP-02-05 | Regression E2E | e2e-ui | SCN-007-011 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-011 unresolved range preserves competing phase hypotheses and no long trigger` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-011 unresolved range preserves competing phase hypotheses and no long trigger" --reporter=list` | Yes | `report.md#scenario-scn-007-011` |
| TP-02-06 | Regression E2E | e2e-ui | SCN-007-031 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-031 ungrounded transcript claim stays rejected across model and copy` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-031 ungrounded transcript claim stays rejected across model and copy" --reporter=list` | Yes | `report.md#scenario-scn-007-031` |
| TP-02-07 | Broader Regression E2E | e2e-ui | SCN-007-009, 010, 011, 031 | `tests/technical-analysis-decision-lab.spec.mjs` | Execute the complete cumulative Feature 007 browser suite after every Scope 02 focused title | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-02-07` |

### Definition of Done

#### Core Delivery Items

- [ ] All 17 exact Scope 02 declarations implement the designed formulas, finite/history/parameter guards, units, formula versions, statuses, and immutable results without simpler substitutes.
- [ ] Mathematical families and lineage clusters prevent vote inflation while preserving every raw method, conflict, unavailable reason, denominator, and gate use.
- [ ] Participation, volume profile, phase, wick, and relative-strength outputs retain their proxy/method boundaries and make no actor, motive, resting-liquidity, universal-edge, or causal claim.
- [ ] Claim admission rejects every ungrounded transcript assertion from config, techniques, setup definitions, gate dependencies, defaults, and product copy.
- [ ] Shared Impact Sweep, marker boundary, fixture provenance, and rollback proof preserve Scope 01 plus all Feature 005/006 and excluded surfaces.
- [ ] Every Scope 02 Test Plan row has an intended RED and identical-command GREEN record.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-02-01 unit evidence proves every formula, boundary, deterministic repeat, proxy lineage, family cluster, and admission branch.
- [ ] TP-02-02 functional evidence proves the committed config validator enforces technique/family/claim/reference parity.
- [ ] TP-02-03 Regression E2E evidence proves SCN-007-009 qualifies breakout participation without participant identity.
- [ ] TP-02-04 Regression E2E evidence proves SCN-007-010 clusters correlated indicators and exposes no count-shaped confidence.
- [ ] TP-02-05 Regression E2E evidence proves SCN-007-011 preserves unresolved range hypotheses and blocks the long trigger.
- [ ] TP-02-06 Regression E2E evidence proves SCN-007-031 keeps an ungrounded transcript claim rejected across every active surface.
- [ ] TP-02-07 broader E2E evidence proves the complete cumulative Feature 007 browser suite passes after focused Scope 02 rows.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, source-qualified versus analytic fixture review, page/config/selftest marker diffs, no-interception/silent-pass scan, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, plan sync, and traceability are current and clean with every finding accounted for.
