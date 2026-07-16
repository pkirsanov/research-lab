# Feature 007 Scopes Index

Planning authority: [spec.md](../spec.md) and [design.md](../design.md). Human acceptance is tracked in [uservalidation.md](../uservalidation.md). Each scope owns its [scope.md](./01-capability-foundation/scope.md)-shaped contract and adjacent `report.md` evidence file.

This is a nine-scope, per-scope-directory plan for the active `full-delivery` workflow. Every scope is a testable vertical outcome. Scope 1 establishes the reusable capability contracts; every publisher, adapter, overlay, UI, publication, and regression scope depends on it. The execution order is strict: a scope may start only when every lower-numbered scope and every declared dependency is `Done`.

## Execution Outline

### Phase Order

1. **Scope 01 - Capability foundation and shared contracts (`foundation:true`):** establish source-qualified interval/session transport, shared validation primitives, the closed config and all evidence/technique/level/setup/gate/UnifiedRead contracts, plus independent shared-surface canaries.
2. **Scope 02 - Technique engine and evidence independence:** implement all Feature-007-owned indicator, participation, value, structure, and relative-strength formulas with family-level de-correlation and claim admission.
3. **Scope 03 - Level geometry and setup lifecycle:** implement sourced levels, confluence, eight setup definitions, immutable candidate events, expiry, invalidation, and hypothetical terminal evaluation.
4. **Scope 04 - Five-gate synthesis and candidate selection:** resolve ordered mandatory gates, direction versus setup state, abstention, timeframe conflict, and deterministic direction-neutral candidate ranking.
5. **Scope 05 - Existing-owner publication and strict adapters:** add six closed nested owner-read publishers, preserve Strategy Validation as the seventh existing owner integration through shared primitive parity, and consume Feature 006 only when its real compatible owner read exists.
6. **Scope 06 - Comparison and optional evidence:** implement frozen market/sector/peer roles, denominator-aware variants, option-convention integrity, and exact microstructure unavailability.
7. **Scope 07 - Validation, cost, expectancy, and process:** implement exact-variant passports, as-of setup simulation, explicit costs, gross/net arithmetic, natural-target audit, and observable process guards.
8. **Scope 08 - Complete experience, publication, and registration:** render Simple, Power, mobile, accessible charts/tables, truth recovery, safe export, one owner read, and synchronized registry/navigation entries from one immutable result.
9. **Scope 09 - Protected regression and governance closure:** execute the complete focused and broad Node/Playwright matrix, compare shared-surface canaries, and close every owned finding without changing excluded work.

### New Types And Signatures

- Static contracts: `tad-config/v1`, `tad-source-vintage/v1`, `tad-series/v1`, `tad-analysis-request/v1`, `tad-validation-passport/v1`, `tad-unified-read/v1`, `rl-ta-owner-read/v1`, and `tad-tool-decision-read/v1` nested in `rl-tool-read/v1`.
- Foundation records: `TadSourceVintageV1`, `TadSessionContractV1`, `TadTimeframeProfileV1`, `TadEvidenceObservationV1`, `TadEvidenceFamilyV1`, `TadTechniqueDefinitionV1`, `TadTechniqueResultV1`, `TadPriceLevelV1`, `TadSetupDefinitionV1`, `TadSetupCandidateV1`, `TadSetupEventV1`, `TadValidationPassportV1`, `TadRiskPlanV1`, `TadBehaviorGuardV1`, `TadGateResultV1`, and `TadUnifiedReadV1`.
- Shared transport: `RLDATA.putQualifiedBarSeries(envelope)` and `RLDATA.qualifiedBarSeries(symbol, interval, sourcePolicy, decisionTime)` preserve all existing daily `barSeries` and generic `toolRead` behavior.
- Shared validation: `RLVALID` exposes `rlvBuildPurgedFolds`, `rlvAdjustBenjaminiHochberg`, `rlvAdjustHolm`, `rlvDeflatedSharpe`, `rlvWilsonInterval`, `rlvQuantiles`, and `rlvSummarizeOutcomes`.
- Feature kernel: all 65 exact page-local `tad*` declarations from `design.md`, culminating in `tadBuildUnifiedRead`, `tadBuildViewModel`, `tadBuildToolDecisionRead`, and `tadBuildExport`.
- Static resources: `GET technical-analysis-decision-lab.html` and same-origin `GET technical-analysis-decision-universe.json`; no application API or mutation endpoint is introduced.

### Exact Pure Symbol Assignment

| Owning scope | Exact declarations |
| --- | --- |
| 01 | `tadError`, `tadIsPlainObject`, `tadHasExactKeys`, `tadFiniteNumber`, `tadStableSerialize`, `tadStableDigest`, `tadDeepFreeze`, `tadValidateConfig`, `tadIndexConfig`, `tadValidateSourceVintage`, `tadValidateSeriesEnvelope`, `tadValidateOwnerRead`, `tadResolveAsOf`, `tadResolveSession`, `tadClassifyBarStatus`, `tadAggregateBars`, `tadBuildTimeframeProfile`, `tadAlignSeries`, `tadBuildVariantIdentity`, `tadBuildSourceSetIdentity` |
| 02 | `tadSmaSeries`, `tadEmaSeries`, `tadAtrSeries`, `tadRsiSeries`, `tadMacdSeries`, `tadBollingerSeries`, `tadAdxDmiSeries`, `tadObvSeries`, `tadCmfSeries`, `tadRelativeVolume`, `tadEffortResult`, `tadVolumeProfile`, `tadVwapEnvelope`, `tadPivots`, `tadRelativeStrength`, `tadEvaluateTechnique`, `tadClusterEvidenceFamilies` |
| 03 | `tadNormalizeLevels`, `tadClusterConfluence`, `tadUpdateLevelLifecycle`, `tadEvaluateSetupDefinition`, `tadTransitionCandidate`, `tadDeriveNaturalTargets`, `tadBuildRiskPlan`, `tadAuditTargets` |
| 04 | `tadRankCandidates`, `tadEvaluatePrimaryGate`, `tadEvaluateRegimeGate`, `tadEvaluateLocationGate`, `tadEvaluateTriggerGate`, `tadEvaluateValidationRiskProcessGate`, `tadSynthesizeFiveGates`, `tadBuildUnifiedRead` |
| 06 | `tadBuildComparisonSet` |
| 07 | `tadBuildPurgedEvaluation`, `tadSimulateSetupVariant`, `tadApplyCosts`, `tadSummarizeValidation`, `tadBuildValidationPassport`, `tadAuditExpectancy`, `tadLossStreakScenario`, `tadEvaluateBehaviorGuard` |
| 08 | `tadBuildViewModel`, `tadBuildToolDecisionRead`, `tadBuildExport` |
| Shared Scope 01 helper | `rlvBuildPurgedFolds`, `rlvAdjustBenjaminiHochberg`, `rlvAdjustHolm`, `rlvDeflatedSharpe`, `rlvWilsonInterval`, `rlvQuantiles`, `rlvSummarizeOutcomes` |

The page-local rows contain exactly 65 unique `tad*` declarations. Scope 05 consumes the owner-read foundation and adds publisher wiring rather than a new pure declaration; Scope 09 validates the complete symbol inventory rather than re-owning it.

### Validation Checkpoints

- **After Scope 01:** shared `rldata.js`, new `rlvalidation.js`, Strategy Validation parity, closed config/contracts, session profiles, source/vintage truth, and foundation browser receipts pass independent canaries before any overlay work.
- **After Scope 02:** every production technique symbol, proxy label, evidence tier, family cluster, unavailable branch, and deterministic-repeat invariant passes focused selftest/validator and real-page regressions.
- **After Scopes 03-04:** setup transitions, levels, targets, five gates, family counting, abstention, and direction-neutral ranking pass focused tests and the cumulative browser suite.
- **After Scope 05:** every existing owner integration has marker-bounded publication/parity proof; absent or incompatible Feature 006 evidence remains unavailable and no delivery claim is inferred.
- **After Scopes 06-07:** comparison identity, optional evidence, passport identity, costs, arithmetic, targets, and process behavior pass exact scenario tests and cumulative browser regressions.
- **After Scope 08:** inline-script/ID integrity, desktop/mobile Simple/Power parity, accessibility, background-tab synchronous canvas pixels, truth recovery, safe publication, and registry parity pass.
- **After Scope 09:** `node scripts/selftest.mjs`, the committed Feature 007 validator, the complete Feature 007 system-Chrome suite, required broader browser canaries, artifact/freshness/G094/traceability guards, and editor/diff checks establish the delivery evidence packet.

## Planning Assumptions And Boundaries

- Research Lab is build-free. Product validation uses repository-root Node commands and the checkout-local Playwright `1.61.1` runner with the committed `system-chrome` project.
- `.github/bubbles-project.yaml` defines neither `testImpact` nor `traceContracts`; no telemetry, SLO, e2e-api, load, or stress row is invented. Responsiveness and cancellation use deterministic functional and real-page assertions without a latency claim.
- Feature 006 is not certified. Its adapter accepts only a matching `tdc-tool-read/v1`; absence, staleness, mismatch, or incompatible selection yields explicit unavailable evidence while Feature-007-owned trend techniques remain independently evaluable.
- The seven existing owner integrations are treated exactly as designed: Swing Structure, Intraday Tape, Options Structure, Gamma Trading, Market Heatmap, and Sector Research publish nested reads; Strategy Validation consumes shared `RLVALID` primitives with parity and retains its own rule/UI. No seventh nested publisher is fabricated.
- Every shared/high-fan-out edit is marker-bounded, preceded by a path-scoped diff, followed by an independent consumer canary before broad tests, and paired with an exact reverse-hunk rollback. Unrelated dirty work and all Feature 005/006 hunks are preserved.
- Formula fixtures are explicitly analytic. Browser behavior fixtures are checked-in source-qualified historical snapshots with provenance. Neither fixture class is described as live external evidence.

## Dependency Graph And Pickup Order

| # | Scope | Tags | Depends On | Primary Surfaces | Status |
| --- | --- | --- | --- | --- | --- |
| 01 | [Capability Foundation And Shared Contracts](./01-capability-foundation/scope.md) | `foundation:true`, `runtime-behavior` | - | `rldata.js`, `rlvalidation.js`, Strategy Validation parity, config/page foundation, validator, fixtures, selftest, browser test | Blocked |
| 02 | [Technique Engine And Evidence Independence](./02-technique-engine/scope.md) | `overlay:true`, `runtime-behavior` | 01 | Feature page/config, validator, selftest, fixtures, browser test | Not Started |
| 03 | [Level Geometry And Setup Lifecycle](./03-setup-lifecycle/scope.md) | `overlay:true`, `runtime-behavior` | 01, 02 | Feature page/config, validator, selftest, fixtures, browser test | Not Started |
| 04 | [Five-Gate Synthesis And Candidate Selection](./04-five-gate-synthesis/scope.md) | `overlay:true`, `runtime-behavior` | 01, 02, 03 | Feature page/config, validator, selftest, fixtures, browser test | Not Started |
| 05 | [Existing-Owner Publication And Strict Adapters](./05-owner-publication/scope.md) | `publisher:true`, `runtime-behavior` | 01, 02, 03, 04 | Six owner pages, Strategy Validation canary, Feature page adapters, selftest, browser test | Not Started |
| 06 | [Comparison And Optional Evidence](./06-comparison-optional-evidence/scope.md) | `overlay:true`, `runtime-behavior` | 01, 02, 03, 04, 05 | Feature page/config, owner adapters, validator, selftest, fixtures, browser test | Not Started |
| 07 | [Validation Cost Expectancy And Process](./07-validation-risk-process/scope.md) | `overlay:true`, `runtime-behavior` | 01, 02, 03, 04, 05, 06 | Feature page/config, `rlvalidation.js` consumer, validator, selftest, fixtures, browser test | Not Started |
| 08 | [Complete Experience Publication And Registration](./08-experience-publication/scope.md) | `ui:true`, `publisher:true`, `runtime-behavior` | 01, 02, 03, 04, 05, 06, 07 | Feature page/note, registries/navigation, validator, selftest, browser test | Not Started |
| 09 | [Protected Regression And Governance Closure](./09-regression-closure/scope.md) | `validation-hardening:true`, `runtime-behavior` | 01, 02, 03, 04, 05, 06, 07, 08 | Feature tests plus declared existing canaries and governance checks | Not Started |

**Pickup rule:** Scope 01 is the only eligible scope. After it is `Done`, pick the lowest-numbered `Not Started` scope whose dependencies are all `Done`; the strict lower-number gate makes the effective order 01 through 09.
