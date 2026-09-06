# Scopes: Feature 028 Volatility Roughness and Model-Assumption Diagnostic

## Execution Outline

### Phase Order

1. **Delivered Feature 011 base**: use the certified volatility decision, UMD formula owner, cache hydration, and Simple/Power route as the unchanged technical foundation.
2. **SCOPE-028-01 — RLVOL Formula and Admission Foundation (`foundation:true`)**: add the single immutable UMD formula owner for proxy construction, structure functions, scaling fits, deterministic incremental block bootstrap, admission, classification, and diagnostic identity.
3. **SCOPE-028-02 — Versioned Decision Diagnostic Projection**: wrap the exact Feature 011 decision in `rlvol-decision-diagnostic-projection/v1` with `parentDecisionId`, diagnostic evidence, and at most one wrapper-owned non-blocking conflict while proving strict base-decision invariance.
4. **SCOPE-028-03 — Power Evaluation UI and Accessibility**: add opt-in cooperative evaluation with page states kept separate from canonical diagnostic states, while preserving Simple as the unchanged decision-first surface except for the admitted compact conflict.
5. **SCOPE-028-04 — Integration, Snapshot, Compatibility, Performance, and Release Proof**: prove immutable cached-snapshot use, deterministic replay, browser/Node parity, exact file-origin configuration-unavailable parity, the 750 ms budget, unchanged registry, and release compatibility.

### New Types and Signatures

- `RoughnessSettingsV1` and `RoughnessDiagnosticInputV1`
- `StructureFunctionPointV1`, `ScalingFitV1`, `CommonHFitV1`, and `RoughnessBootstrapV1`
- `RoughnessDiagnosticV1` with deterministic `diagnosticId`
- `RoughnessBootstrapStateV1` with `nextResampleIndex`, PRNG state, ordered complete values, and rejected count
- `buildObservedLogVolPath(input)`
- `buildStructureFunctions(path, settings)`
- `fitScalingExponent(points, q)` and `fitCommonH(fits)`
- `movingBlockResample(path, settings, random)`
- `startRoughnessBootstrap(path, settings, seedIdentity)`, `stepRoughnessBootstrap(state, maximumResamples)`, and `finalizeRoughnessBootstrap(state)`
- `buildRoughnessDiagnostic(input, bootstrap)`
- `buildDiagnosticProjection(decision, projectionState, diagnostic)` and `projectModelAssumptionConflict(diagnostic)`
- `VolDecisionDiagnosticProjectionV1` with `contractVersion: "rlvol-decision-diagnostic-projection/v1"`, exact `baseDecision`, `parentDecisionId`, projection state, optional diagnostic, and wrapper-owned conflicts
- additive non-blocking `ModelAssumptionConflictV1`
- page-local `RoughnessRuntimeV1` whose `disabled`, `computing`, `cancelled`, and `stale-result` evaluation states never become canonical `unavailable`, `inconclusive`, or `supported` diagnostic states

### Validation Checkpoints

- SCOPE-028-01 blocks all later scopes until formula, threshold-boundary, replay, immutability, and numerical-admission checks pass.
- SCOPE-028-02 blocks UI work until all diagnostic states preserve the canonical Feature 011 decision and conflict projection is proven additive.
- SCOPE-028-03 blocks final integration until every state is inspectable through keyboard, screen-reader text, semantic tables, and non-color meaning.
- SCOPE-028-04 is the final compatibility checkpoint. It runs the complete build-free project checks and leaves release status unchanged unless later validation certifies the implementation.

## Overview and Ordering Rationale

The plan follows the approved four work packages and keeps one primary outcome per scope. Feature 011 is the delivered technical base and sole external dependency. SCOPE-028-01 is the first implementation scope eligible for pickup when execution begins.

The pure RLVOL capability lands first because every decision and presentation consumer must share one formula owner. Versioned wrapper composition follows before UI work so the page cannot invent a second state or conflict policy. The UI then consumes the proven immutable result. Final integration verifies cross-runtime, immutable cached-snapshot, exact file-origin parity, performance, registry, and release compatibility across the complete vertical slice.

All scopes use the single-file layout. Every later scope depends on all required predecessors. A scope cannot start until every dependency is Done. Feature 011 artifacts are read-only context and are excluded from the change boundary. Missing future test files are explicit delivery obligations, not current evidence.

### Plan-Wide Change Boundary

Allowed file families: additive Feature 028 changes in `rlvol.js`, `volatility-sizing-lab.html`, the named Feature 028 test files, and additive assertions in `scripts/selftest.mjs`.

Excluded surfaces: Feature 011 artifacts, `rldata.js`, registries, navigation, providers, backends, package configuration, deployment surfaces, and every repository outside Research Lab. Collateral cleanup is excluded unless a later approved planning change adds it explicitly.

## Dependency Graph

`Feature 011 delivered base → SCOPE-028-01 → SCOPE-028-02 → SCOPE-028-03 → SCOPE-028-04`

Feature 011 supplies the unchanged volatility workspace and decision contract. Feature 028 has no action-ledger prerequisite checkpoint and no special revalidation trigger. Shared-file edits still receive ordinary compatibility review during their owning scopes.

## Active Scope Inventory

| Scope | Name | Surfaces | Owning scenarios | Status |
| --- | --- | --- | --- | --- |
| SCOPE-028-01 | RLVOL Formula and Admission Foundation | `rlvol.js`, formula tests | SCN-028-001, 003, 004, 005, 006, 007 | Not Started |
| SCOPE-028-02 | Additive Decision and Conflict Projection | `rlvol.js`, decision integration tests | SCN-028-008, 009, 010, 013 | Not Started |
| SCOPE-028-03 | Power Evidence UI and Accessibility | `volatility-sizing-lab.html`, Playwright | SCN-028-002, 014 | Not Started |
| SCOPE-028-04 | Integration, Cache, Compatibility, Performance, and Release Proof | cache/browser/Node/file-origin/registry/release checks | SCN-028-011, 012 | Not Started |

## Scope 1: RLVOL Formula and Admission Foundation

**Status:** Not Started

Scope-Kind: contract-only

Foundation: true

Depends On: Feature 011 delivered base

Consumer Surface: the `RLVOL` browser-global and CommonJS formula contracts. Route projection begins in SCOPE-028-03.

Exposure-Deferred: Production-route exposure requires the HTML wiring owned by SCOPE-028-03; Scope 1 intentionally proves only the formula contract -> `spec.md#exposure-contract`.

Owning Scenarios: SCN-028-001, SCN-028-003, SCN-028-004, SCN-028-005, SCN-028-006, SCN-028-007

### Outcome

One pure, immutable, deterministic RLVOL capability computes or truthfully withholds complete roughness evidence.

### Change Boundary

Allowed production file: `rlvol.js`. Allowed persistent tests: `tests/rlvol-roughness.unit.mjs`, `tests/volatility-roughness.integration.mjs`, and additive Feature 028 assertions in `scripts/selftest.mjs`.

Excluded: HTML rendering, `rldata.js`, registries, providers, backends, package manifests, Feature 011 artifacts, and all QuantitativeFinance files. Collateral refactors require an approved scope change.

### Use Cases

```gherkin
Scenario: SCN-028-001 Supported multi-q scaling
	Given at least 500 retained observed log-volatility proxy values and admissible fits for every fixed moment order
	When buildRoughnessDiagnostic evaluates the canonical input
	Then it returns all 24 structure-function points, four admitted scaling fits, an admitted common-H fit, deterministic bootstrap evidence, a supported interval, and a benchmark classification

Scenario: SCN-028-003 Insufficient retained observations
	Given exclusions leave fewer than 500 retained proxy values
	When admission evaluates the retained sample
	Then the result is unavailable, carries retained and required counts, preserves valid intermediate evidence, and emits no H or classification

Scenario: SCN-028-004 Invalid volatility proxy values
	Given invalid closes, broken return continuity, or non-positive or non-finite proxy values
	When the observed log-volatility path is built
	Then each excluded endpoint receives one closed primary reason and sufficiency is reassessed from retained values only

Scenario: SCN-028-005 Per-order fit is weak
	Given any fixed q order has fewer than five valid lags, a non-positive slope, or R-squared below 0.90
	When per-order admission runs
	Then the diagnostic is inconclusive, keeps all structure points and fit evidence, and does not produce a supported common-H conclusion

Scenario: SCN-028-006 Cross-order scaling is weak
	Given all four per-order fits pass but common-fit R-squared is below 0.95 or maximum absolute residual exceeds 0.10
	When common-fit admission runs
	Then the diagnostic is inconclusive, exposes each residual and failed rule, and withholds H

Scenario: SCN-028-007 Uncertainty is too wide
	Given the point fit passes but fewer than 450 resamples complete or the 95 percent interval width exceeds 0.25
	When uncertainty admission runs
	Then the diagnostic is inconclusive, preserves candidate and bootstrap evidence, and withholds H and classification
```

### Implementation Plan

1. Add frozen q `[0.5, 1.0, 1.5, 2.0]`, lag `[1, 2, 4, 8, 16, 32]`, 500-observation, 400-pair, five-lag, fit, residual, bootstrap, and interval policies inside the UMD closure.
2. Validate versioned input, explicit decision time, ordered unique timestamps, fixed settings, and finite positive closes without DOM, storage, network, timer, or ambient random access.
3. Build ten-return annualized realized-volatility windows without bridging invalid rows. Count each exclusion under one closed reason.
4. Compute all fixed structure points; retain invalid points with pair count and reason.
5. Implement per-order OLS and through-origin common-H fits with complete residual and R² evidence.
6. Implement formula-owned `startRoughnessBootstrap()`, `stepRoughnessBootstrap()`, and `finalizeRoughnessBootstrap()` over immutable `RoughnessBootstrapStateV1`. Advance strictly by `nextResampleIndex`; make batch sizes 1, 7, 25, and 500 canonically equivalent; require all 500 attempts before Type 7 interval finalization.
7. Apply admission in stage order. Return `unavailable`, `inconclusive`, or `supported` without throwing for domain limitations.
8. Deep-freeze all nested results, preserve caller input, and derive deterministic `diagnosticId`.

### Shared Infrastructure Impact Sweep

`rlvol.js` is a high-fan-out formula owner. Preserve every existing export and UMD loading behavior. Run focused RLVOL canaries before the full selftest. Rollback removes additive exports and assertions only; no migration or stored state exists.

### Test Plan

| ID | Type | Scenario | Persistent file and exact title | Command | Required behavior |
| --- | --- | --- | --- | --- | --- |
| TP-028-01-01 | unit | SCN-028-001 | `tests/rlvol-roughness.unit.mjs` — `SCN-028-001 supported multi-q scaling returns complete admitted evidence` | `node --test tests/*.unit.mjs` | Fixed grids and formulas, complete supported evidence, immutability, deterministic identity. |
| TP-028-01-02 | unit | SCN-028-003, SCN-028-004 | `tests/rlvol-roughness.unit.mjs` — `Regression: SCN-028-003 and SCN-028-004 retain exact insufficiency and exclusion evidence` | `node --test tests/*.unit.mjs` | 499/500/501 and every exclusion reason through production formulas. |
| TP-028-01-03 | unit | SCN-028-005 | `tests/rlvol-roughness.unit.mjs` — `Regression: SCN-028-005 rejects weak per-order fits at every boundary` | `node --test tests/*.unit.mjs` | Four/five/six lags, non-positive slope, values adjacent to R² 0.90. |
| TP-028-01-04 | unit | SCN-028-006 | `tests/rlvol-roughness.unit.mjs` — `Regression: SCN-028-006 rejects weak common scaling and excessive residuals` | `node --test tests/*.unit.mjs` | Values adjacent to R² 0.95 and residual 0.10. |
| TP-028-01-05 | unit | SCN-028-007 | `tests/rlvol-roughness.unit.mjs` — `Regression: SCN-028-007 withholds H for incomplete or wide incremental bootstrap evidence` | `node --test tests/*.unit.mjs` | Formula-owned start/step/finalize; 449/450/451 complete fits; width below/at/above 0.25; all 500 attempts required; batch-size replay equality; no ambient randomness. |
| TP-028-01-06 | integration | SCN-028-001, SCN-028-003, SCN-028-007 | `tests/volatility-roughness.integration.mjs` — `RLVOL diagnostic contract is immutable and keeps admitted and withheld states distinct` | `node --test tests/*.integration.mjs` | CommonJS receives frozen machine-readable states without input mutation. |
| TP-028-01-08 | functional | SCN-028-001, SCN-028-003, SCN-028-007 | `scripts/selftest.mjs` — `Canary: existing RLVOL exports and UMD consumers survive the additive roughness foundation` | `node scripts/selftest.mjs` | Independent shared-owner canary proves prior exports, loading, and consumers remain intact. |

### Definition of Done

#### Core Items

- [ ] Complete formula, admission, deterministic bootstrap, identity, and immutable-result behavior implements all six owned scenarios. Evidence: `report.md#scope-028-01-implementation`.
- [ ] No excluded surface, ambient source, or second formula owner changes. Evidence: `report.md#scope-028-01-boundary`.

#### Test Items — seven rows, seven items

- [ ] TP-028-01-01 passes for SCN-028-001. Evidence: `report.md#tp-028-01-01`.
- [ ] TP-028-01-02 passes for SCN-028-003 and SCN-028-004. Evidence: `report.md#tp-028-01-02`.
- [ ] TP-028-01-03 passes for SCN-028-005. Evidence: `report.md#tp-028-01-03`.
- [ ] TP-028-01-04 passes for SCN-028-006. Evidence: `report.md#tp-028-01-04`.
- [ ] TP-028-01-05 passes for SCN-028-007. Evidence: `report.md#tp-028-01-05`.
- [ ] TP-028-01-06 passes for SCN-028-001, SCN-028-003, and SCN-028-007. Evidence: `report.md#tp-028-01-06`.
- [ ] TP-028-01-08 independent shared-owner canary passes. Evidence: `report.md#tp-028-01-08`.
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns. Evidence: `report.md#scope-028-01-canary`.
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified. Evidence: `report.md#scope-028-01-rollback`.

#### Build Quality Gate

- [ ] Boundary matrices, replay, deep-freeze, source ownership, selftest canaries, and docs alignment are independently verified with no skipped check or unresolved finding. Evidence: `report.md#scope-028-01-quality`.

## Scope 2: Versioned Decision Diagnostic Projection

**Status:** Not Started

Scope-Kind: contract-only

Depends On: SCOPE-028-01 (foundation)

Consumer Surface: the existing `volatility-sizing-lab.html` web page decision projection through the additive `RLVOL` result contract.

Owning Scenarios: SCN-028-008, SCN-028-009, SCN-028-010, SCN-028-013

### Outcome

Supported diagnostic evidence composes with the Feature 011 decision without changing its identity or semantics.

### Change Boundary

Allowed production file: additive composition and projection in `rlvol.js`. Allowed tests: `tests/rlvol-roughness.unit.mjs`, `tests/volatility-roughness.integration.mjs`, and additive `scripts/selftest.mjs` canaries.

Excluded: UI, Feature 011 artifacts, registries, hydration, pricing or trading logic, and reinterpretation of existing fields.

### Use Cases

```gherkin
Scenario: SCN-028-008 Evidence lies below the smooth benchmark
	Given a supported interval whose upper bound is strictly below 0.5
	When classification and projection run
	Then classification is below-0.5 and exactly one non-blocking model-assumption conflict may be appended

Scenario: SCN-028-009 Evidence does not distinguish the benchmark
	Given a supported interval that includes 0.5 at an endpoint or internally
	When classification and projection run
	Then classification is indistinguishable-from-0.5, no conflict is added, and no equality or validation claim appears

Scenario: SCN-028-010 Evidence lies above the benchmark
	Given a supported interval whose lower bound is strictly above 0.5
	When classification and projection run
	Then classification is above-0.5, at most one non-blocking conflict is added, and no directional language appears

Scenario: SCN-028-013 Existing decision invariance
	Given one canonical Feature 011 decision
	When a disabled, pending, unavailable, inconclusive, supported-below, supported-indistinguishable, or supported-above projection is built
	Then the wrapper parentDecisionId and diagnostic parentDecisionId equal the unchanged base decisionId, the exact base object reference and canonical bytes remain unchanged, and only wrapper-owned diagnostic evidence and the permitted wrapper conflict differ
```

### Implementation Plan

1. Implement `buildDiagnosticProjection()` returning `rlvol-decision-diagnostic-projection/v1`; preserve `baseDecision` as the exact frozen `rlvol-decision-read/v1` object reference and set wrapper `parentDecisionId` to its unchanged `decisionId`.
2. Apply strict outside and inclusive-containment interval classification.
3. Enforce wrapper projection states `disabled`, `pending`, and `available`; only `available` carries a diagnostic, whose `parentDecisionId` must match the wrapper and base decision identities.
4. Implement a fixed, non-blocking, zero-or-one wrapper-owned conflict carrying diagnostic and parent identities, same-origin deep link, source as-of context, and unchanged-decision statement.
5. Preserve all base conflicts in original order and every Feature 011 field. Keep `projectVolToolRead()` on `projection.baseDecision`; it must not project the wrapper conflict.
6. Reject bullish, bearish, long, short, buy, and sell interpretations. Add canonical byte, exact-key-set, rigid-parser, object-reference, conflict-isolation, and identity canaries for every wrapper and diagnostic state.

### Consumer Impact Sweep

Inspect native Simple and Power, compact owner read, Market Brief conflict consumption, CommonJS tests, and Feature 011 E2E assertions. Search `decisionId`, `parentDecisionId`, `baseDecision`, `conflicts`, `rlvol-decision-read/v1`, and versioned owner-read consumers. The new wrapper is additive; no existing path, identifier, or v1 key is renamed. Rollback restores consumers to the exact base decision before removing wrapper exports.

### Test Plan

| ID | Type | Scenario | Persistent file and exact title | Command | Required behavior |
| --- | --- | --- | --- | --- | --- |
| TP-028-02-01 | unit | SCN-028-008, SCN-028-009, SCN-028-010 | `tests/rlvol-roughness.unit.mjs` — `SCN-028 benchmark classification uses strict outside and inclusive containment boundaries` | `node --test tests/*.unit.mjs` | Below, endpoint-equal, containing, and above intervals classify exactly. |
| TP-028-02-02 | integration | SCN-028-008 | `tests/volatility-roughness.integration.mjs` — `Regression: SCN-028-008 projects one non-blocking below-benchmark conflict` | `node --test tests/*.integration.mjs` | Canonical conflict and no base mutation. |
| TP-028-02-03 | integration | SCN-028-009, SCN-028-010 | `tests/volatility-roughness.integration.mjs` — `Regression: benchmark containment emits no conflict and above-benchmark evidence stays non-directional` | `node --test tests/*.integration.mjs` | Containment has no conflict; above remains neutral. |
| TP-028-02-04 | integration | SCN-028-013 | `tests/volatility-roughness.integration.mjs` — `Regression: SCN-028-013 preserves exact Feature 011 bytes and parent identity in every wrapper state` | `node --test tests/*.integration.mjs` | Exact base reference, canonical bytes, key set, rigid-parser behavior, conflict order, contract version, decisionId, and parentDecisionId equality. |
| TP-028-02-05 | functional | SCN-028-008, SCN-028-013 | `scripts/selftest.mjs` — `Feature 028 additive diagnostic preserves Feature 011 identity and conflict compatibility` | `node scripts/selftest.mjs` | Existing and additive consumers and prior selftests remain compatible. |

### Definition of Done

#### Core Items

- [ ] Classification, decision composition, and conflict projection implement the four owned scenarios without changing Feature 011 semantics. Evidence: `report.md#scope-028-02-implementation`.
- [ ] Consumer sweep finds no rigid parser, stale reference, reordered conflict, or second identity. Evidence: `report.md#scope-028-02-consumers`.

#### Test Items — five rows, five items

- [ ] TP-028-02-01 passes for SCN-028-008, SCN-028-009, and SCN-028-010. Evidence: `report.md#tp-028-02-01`.
- [ ] TP-028-02-02 passes for SCN-028-008. Evidence: `report.md#tp-028-02-02`.
- [ ] TP-028-02-03 passes for SCN-028-009 and SCN-028-010. Evidence: `report.md#tp-028-02-03`.
- [ ] TP-028-02-04 passes for SCN-028-013. Evidence: `report.md#tp-028-02-04`.
- [ ] TP-028-02-05 passes for SCN-028-008 and SCN-028-013. Evidence: `report.md#tp-028-02-05`.
- [ ] Consumer impact sweep is complete and zero stale first-party references remain. Evidence: `report.md#scope-028-02-consumer-sweep`.

#### Build Quality Gate

- [ ] Invariance, compatibility, neutral language, owner-read minimization, rollback, and docs alignment are verified with no unresolved finding. Evidence: `report.md#scope-028-02-quality`.

## Scope 3: Power Evaluation UI and Accessibility

**Status:** Not Started

Scope-Kind: runtime-behavior

Depends On: SCOPE-028-02

Consumer Surface: the existing `volatility-sizing-lab.html` web page in its Simple and Power views.

Owning Scenarios: SCN-028-002, SCN-028-014

### Outcome

The existing route offers an opt-in, Power-only, accessible diagnostic while Simple remains decision-first.

### Change Boundary

Allowed production file: `volatility-sizing-lab.html`. Allowed test: `tests/volatility-sizing-lab.spec.mjs`.

Excluded: formula duplication, `rldata.js`, routes and registries, package changes, provider requests, workers, persistence, Feature 011 artifacts, and QuantitativeFinance API calls.

### Use Cases

```gherkin
Scenario: SCN-028-002 Diagnostic remains opt-in
	Given the researcher has not enabled the diagnostic
	When the real route completes first paint and switches between Simple and Power
	Then the Feature 011 decision is unchanged, the page state is disabled, the wrapper state is disabled with no canonical diagnostic, and no diagnostic computation or provider activity occurs

Scenario: SCN-028-014 Accessible evidence
	Given a keyboard-only or screen-reader user inspects page states disabled, computing, cancelled, and stale-result and canonical states unavailable, inconclusive, supported, and stale-qualified
	When the user navigates the Power diagnostic
	Then page evaluation outcomes never serialize as canonical scientific states, and native controls, visible focus, polite announcements, spoken equations, textual implications, complete semantic tables, and non-color state meaning expose all behavior at desktop, 320 CSS pixels, and 200 percent zoom
```

### Implementation Plan

1. Add one native enable control and stable region after existing sizing evidence and before provenance.
2. Keep Simple as the default. Show no detailed evidence there and at most one derived non-blocking notice.
3. Complete Feature 011 first paint before queuing diagnostic work. On enablement, clone and deep-freeze the current `runtime.bars` and matching `readCachedBars()` source metadata snapshot. Never call `hydrate()`, `RLDATA.ensureBars()`, `fetch()`, or a provider adapter from the enable path; an already-running independent refresh may continue and later invalidate the snapshot normally.
4. Use zero-delay tasks, formula-owned incremental bootstrap batches of at most 25 resamples, stable focus, cancellation tokens, and source-key rejection.
5. Keep page evaluation states `disabled`, `computing`, `cancelled`, and `stale-result` separate from wrapper states `disabled`, `pending`, and `available` and canonical diagnostic states `unavailable`, `inconclusive`, and `supported`. A cancelled or stale result is discarded, never serialized as scientific evidence.
6. Render every threshold, exclusion, point, fit, residual, bootstrap count, interval, source fact, setting, limitation, and identity from the canonical result.
7. Pair charts with textual interpretation and permanently available same-data semantic tables.
8. Add replay disclosure and an informational QuantitativeFinance handoff without claiming remote consumption.
9. Preserve selected asset, estimator, horizon, target, notional, history, cards, and owner read through interactions.

### UI Scenario Matrix

| Flow | Preconditions | Steps | Visible assertion | Persistent E2E title |
| --- | --- | --- | --- | --- |
| Default boundary | Fresh real route | Open Simple and Power without enabling | Feature 011 visible; disabled message; invocation and request counters unchanged | `Regression: SCN-028-002 keeps first paint and provider activity unchanged until enablement` |
| Supported evidence | Admissible cached input | Enable and await | Interval, classification, thresholds, plots, tables, exclusions, provenance, unchanged-decision text | `SCN-028 supported Power evidence exposes the complete canonical diagnostic` |
| Withheld evidence | Insufficient and weak-fit inputs | Enable each | States distinct; H is Withheld; failed rules and intermediates retained | `Regression: Feature 028 withheld states preserve evidence and never substitute H` |
| Keyboard and assistive text | Any enabled input | Operate tabs, control, disclosure, tables, and evidence link | Focus visible; busy and completion announced; no pointer-only fact | `SCN-028-014 exposes diagnostic controls and evidence without pointer or color dependence` |
| Responsive evidence | Supported input | Inspect at 320 CSS pixels and 200 percent zoom | No page overflow; labelled evidence remains reachable | `Regression: Feature 028 Power evidence remains usable at narrow width and zoom` |

### Test Plan

| ID | Type | Scenario | Persistent file and exact title | Command | Required behavior |
| --- | --- | --- | --- | --- | --- |
| TP-028-03-01 | e2e-ui | SCN-028-002 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: SCN-028-002 keeps first paint and provider activity unchanged until enablement` | Playwright canonical command | Real route, no interception, disabled first paint, zero diagnostic invocation, and no provider request from enablement. |
| TP-028-03-02 | e2e-ui | SCN-028-014 | `tests/volatility-sizing-lab.spec.mjs` — `SCN-028-014 separates page evaluation outcomes from canonical diagnostic evidence` | Playwright canonical command | Cancelled and stale-result work is discarded; unavailable, inconclusive, and supported remain formula-owned; keyboard, focus, announcements, spoken definitions, tables, and text states remain accessible. |
| TP-028-03-03 | e2e-ui | SCN-028-001, SCN-028-003, SCN-028-004, SCN-028-005, SCN-028-006, SCN-028-007 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: Scope 1 formula and admission outcomes remain visible after Power projection wiring` | Playwright canonical command | Supported, excluded-input, unavailable, and inconclusive outcomes from the production formulas are visible only after route projection exists. |
| TP-028-03-04 | e2e-ui | SCN-028-014 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: Feature 028 Power evidence remains usable at narrow width and zoom` | Playwright canonical command | 320 CSS pixels and 200 percent zoom without page overflow or clipping. |
| TP-028-03-05 | e2e-ui | SCN-028-002, SCN-028-014 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: Feature 028 withheld states preserve evidence and never substitute H` | Playwright canonical command | Unavailable and inconclusive retain evidence and say Withheld. |
| TP-028-03-06 | e2e-ui | SCN-028-008, SCN-028-009, SCN-028-010, SCN-028-013 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: Scope 2 wrapper states preserve the production-route base decision after UI wiring` | Playwright canonical command | After the route projection exists, wrapper outcomes remain visible while exact base identity, owner read, and conflict isolation remain unchanged. |

Playwright canonical command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=2 tests/volatility-sizing-lab.spec.mjs`.

### Definition of Done

#### Core Items

- [ ] Opt-in cooperative evaluation and accessible states implement both owned scenarios without formula duplication or first-paint regression. Evidence: `report.md#scope-028-03-implementation`.
- [ ] No new route, registry row, provider, persistence, worker, package, or pricing or trading behavior exists. Evidence: `report.md#scope-028-03-boundary`.

#### Test Items — six rows, six items

- [ ] TP-028-03-01 passes for SCN-028-002. Evidence: `report.md#tp-028-03-01`.
- [ ] TP-028-03-02 passes for SCN-028-014. Evidence: `report.md#tp-028-03-02`.
- [ ] TP-028-03-03 passes for SCN-028-001, SCN-028-003, SCN-028-004, SCN-028-005, SCN-028-006, and SCN-028-007. Evidence: `report.md#tp-028-03-03`.
- [ ] TP-028-03-04 passes for SCN-028-014. Evidence: `report.md#tp-028-03-04`.
- [ ] TP-028-03-05 passes for SCN-028-002 and SCN-028-014. Evidence: `report.md#tp-028-03-05`.
- [ ] TP-028-03-06 passes for SCN-028-008, SCN-028-009, SCN-028-010, and SCN-028-013 after UI wiring. Evidence: `report.md#tp-028-03-06`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass. Evidence: `report.md#scope-028-03-scenario-e2e`.
- [ ] Broader E2E regression suite passes. Evidence: `report.md#scope-028-03-broader-e2e`.

#### Build Quality Gate

- [ ] Real-route authenticity, chronology, accessibility, responsiveness, current-value implications, neutral language, no-silent-pass scans, and docs alignment are verified. Evidence: `report.md#scope-028-03-quality`.

## Scope 4: Integration, Snapshot, Compatibility, Performance, and Release Proof

**Status:** Not Started

Scope-Kind: runtime-behavior

Depends On: SCOPE-028-03

Consumer Surface: the existing `volatility-sizing-lab.html` web page, its shared-cache boundary, and the CommonJS compatibility consumer.

Owning Scenarios: SCN-028-011, SCN-028-012

### Outcome

The enhancement proves cache reuse, stale honesty, cross-runtime reproducibility, compatibility, and bounded performance without registration or file-origin regression.

### Change Boundary

Production remains limited to `rlvol.js` and `volatility-sizing-lab.html`. Tests remain limited to `tests/rlvol-roughness.unit.mjs`, `tests/volatility-roughness.integration.mjs`, `tests/volatility-sizing-lab.spec.mjs`, and additive `scripts/selftest.mjs` assertions.

Excluded: `rldata.js`, `tools.json`, `index.html`, `rlnav.js`, package and Playwright configuration, new data, routes, providers, backends, and Feature 011 artifacts.

### Use Cases

```gherkin
Scenario: SCN-028-011 Stale cached source
	Given the shared cache contains usable but stale daily closes
	When the enabled diagnostic computes on the real route
	Then it computes from one immutable `runtime.bars` and `readCachedBars()` metadata snapshot, labels every conclusion stale with source timing, never invokes ensureBars, and does not interfere with an independent refresh already in progress

Scenario: SCN-028-012 Browser and Node parity
	Given identical ordered bars, source metadata, decision time, and settings
	When browser-global and Node CommonJS consumers run the diagnostic
	Then canonical values, state, ordered reasons, bootstrap evidence, classification, and diagnosticId are identical
```

### Implementation Plan

1. Build deterministic 1,500-close test input outside the measured interval.
2. Prove stale metadata survives diagnostic, notice, evidence, and observability projections while the unchanged owner read continues to consume only `projection.baseDecision`.
3. Prove enablement clones and deep-freezes the current `runtime.bars` and `readCachedBars()` metadata snapshot and never calls `hydrate()`, `RLDATA.ensureBars()`, `fetch()`, or a provider adapter. Prove an independent existing refresh may continue and its later cache update triggers normal source-key invalidation rather than being cancelled or duplicated.
4. Compare browser-global and CommonJS canonical results from identical packets.
5. Prove presentation-only changes preserve identity and do not recompute.
6. Measure formula-owned start/step/finalize composition through `buildRoughnessDiagnostic(input, finalizedBootstrap)` only after module and fixture setup on Node 20. Fail above 750 ms and print environment facts. Include an explicit `stress` category row for this budget.
7. Add canaries for the unchanged registry trio, one HTML route, and no forbidden globals or provider surfaces. Under direct file origin, assert only exact parity with Feature 011's existing configuration-unavailable outcome across query and fragment variants; do not enable the control or claim operational `file://` success.
8. Run the complete unit, integration, selftest, and real-route E2E commands.

### Shared Infrastructure Impact Sweep

Selftest and E2E are shared canary surfaces. Add Feature 028 groups without weakening predecessor assertions. Run focused tests before complete checks. Rollback removes additive Feature 028 blocks only.

### Test Plan

| ID | Type | Scenario | Persistent file and exact title | Command | Required behavior |
| --- | --- | --- | --- | --- | --- |
| TP-028-04-01 | integration | SCN-028-011 | `tests/volatility-roughness.integration.mjs` — `Regression: SCN-028-011 evaluates one immutable cached snapshot without ensureBars` | `node --test tests/*.integration.mjs` | Frozen `runtime.bars` and `readCachedBars()` metadata snapshot, stale provenance, no enable-path hydration or fetch, and independent refresh coexistence. |
| TP-028-04-02 | integration | SCN-028-012 | `tests/volatility-roughness.integration.mjs` — `SCN-028-012 browser-global and CommonJS diagnostics are canonically identical` | `node --test tests/*.integration.mjs` | Values, state, reasons, interval, and identity match. |
| TP-028-04-03 | stress | SCN-028-001, SCN-028-012 | `tests/rlvol-roughness.unit.mjs` — `NFR-028-002 incrementally evaluates 1500 closes and 500 resamples within 750 ms on Node 20` | `node --test tests/*.unit.mjs` | Formula-owned start/step/finalize timing, 1/7/25/500 batch equivalence, and printed runner, Node, platform, and architecture facts. |
| TP-028-04-04 | e2e-ui | SCN-028-011, SCN-028-012 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: stale diagnostic reuses the real cache and presentation changes do not recompute` | Playwright canonical command | Stale label, request count, interaction, stable identity. |
| TP-028-04-05 | functional | SCN-028-011, SCN-028-012 | `scripts/selftest.mjs` — `Feature 028 preserves registry UMD ownership and exact file-origin unavailability parity` | `node scripts/selftest.mjs` | No new tool, registry, formula owner, or provider; query and fragment variants preserve the existing configuration-unavailable file-origin outcome without an operational-success claim. |
| TP-028-04-06 | regression | SCN-028-001 through SCN-028-014 | all persistent files — `Regression: complete Feature 028 scenario contract remains green` | all canonical commands | Full unit, integration, selftest, real-route E2E with no skip or interception. |

Playwright canonical command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=2 tests/volatility-sizing-lab.spec.mjs`.

### Definition of Done

#### Core Items

- [ ] Cache reuse, stale honesty, browser and CommonJS parity, compatibility, and performance implement both owned scenarios and applicable NFRs without excluded changes. Evidence: `report.md#scope-028-04-implementation`.
- [ ] Registry, file-origin, shared-cache, Feature 011, rollback, and full-suite canaries remain intact. Evidence: `report.md#scope-028-04-canaries`.

#### Test Items — six rows, six items

- [ ] TP-028-04-01 passes for SCN-028-011. Evidence: `report.md#tp-028-04-01`.
- [ ] TP-028-04-02 passes for SCN-028-012. Evidence: `report.md#tp-028-04-02`.
- [ ] TP-028-04-03 passes for SCN-028-001 and SCN-028-012 and records the reference environment. Evidence: `report.md#tp-028-04-03`.
- [ ] TP-028-04-04 passes for SCN-028-011 and SCN-028-012. Evidence: `report.md#tp-028-04-04`.
- [ ] TP-028-04-05 passes for SCN-028-011 and SCN-028-012. Evidence: `report.md#tp-028-04-05`.
- [ ] TP-028-04-06 passes for SCN-028-001 through SCN-028-014 with every canonical command. Evidence: `report.md#tp-028-04-06`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass. Evidence: `report.md#scope-028-04-scenario-e2e`.
- [ ] Broader E2E regression suite passes. Evidence: `report.md#scope-028-04-broader-e2e`.

#### Build Quality Gate

- [ ] Artifact, traceability, scenario-obligation, capability-foundation, regression-quality, change-boundary, planning checks, docs alignment, and finding closure pass with actual output and no skip, warning, deferral, or unresolved finding. Evidence: `report.md#scope-028-04-quality`.

## Plan-Wide Execution Rules

- [ ] Change Boundary is respected and zero excluded file families were changed. Evidence: `report.md#plan-wide-change-boundary`.
- Begin from the delivered Feature 011 base and execute SCOPE-028-01 through SCOPE-028-04 strictly in order. The next scope starts only after its dependency is Done with accepted evidence.
- Tests derive from the specification and design. Fix implementation rather than weakening conformant tests.
- Every changed behavior has a persistent regression row. Real-route E2E uses the existing same-origin server with no interception.
- No scope changes Feature 011 artifacts, creates a second formula owner, adds a tool or provider, or introduces pricing, calibration, trading, portfolio, or execution behavior.
- Missing and withheld values stay explicit. No default, fallback, zero substitute, or unsupported confidence claim is permitted.
- Every listed future test file is a delivery obligation and not evidence of present existence or execution. Every Test Plan ID has exactly one matching ID-specific DoD item: 7, 5, 6, and 6 by scope. Additional policy-gate DoD items remain independently verifiable.
- Human acceptance remains validation-owned and unclaimed.

## Planning Evidence Status

Product tests, performance checks, browser checks, and human acceptance have not run during planning. Actual planning-guard output must be recorded in `report.md` after execution.
