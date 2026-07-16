# Scopes: Trend Dynamics and Cycle Lab

Planning authority: [spec.md](spec.md) and [design.md](design.md). Execution evidence belongs in [report.md](report.md), and human acceptance is tracked in [uservalidation.md](uservalidation.md).

This is a five-scope, single-file plan for the active `full-delivery` workflow. Every scope is a complete vertical increment, every scope is gated by its declared dependencies, and no scope may start while a lower-numbered eligible scope remains incomplete. Planning creates obligations only; every status and Definition of Done checkbox remains unclaimed until current execution evidence exists.

## Execution Outline

### Phase Order

1. **Scope 1 - Deterministic capability foundation:** establish the closed config, source/vintage/quality/transform contracts, numerical guards, cycle typing, scheduler contract, source-qualified fixtures, focused validator, and truthful HTTP foundation.
2. **Scope 2 - Trend, dynamics, change, and sensitivity engine:** implement the finite trend/change registry, family clustering, conservative consensus, influence probes, and governed speed/reliability behavior over the Scope 1 contracts.
3. **Scope 3 - Season, cycle, context, and association engine:** implement break-first decomposition, regular/irregular/time-varying periodicity, typed catalog evaluation, multiplicity, held-out evidence, and availability-safe lead/lag.
4. **Scope 4 - Complete Simple/Power experience and publication:** render every required screen from one immutable result, register the route atomically, add the methodology note, and publish one state-faithful owner read without changing shared analytical owners.
5. **Scope 5 - As-of replay and regression closure:** implement immutable turn revisions, observation/vintage replay, walk-forward scoring, progress/cancellation, and the full G044 before/after regression comparison.

Scope 1 is the capability foundation. Scopes 2 through 5 are concrete engine, UI, publication, or replay overlays and each explicitly depends on Scope 1. The chain is intentionally sequential because cycle activation depends on break evidence, the UI depends on both engines, and replay certification depends on the complete result contract.

### New Types And Signatures

- Contracts: `TrendDynamicsConfigV1`, `SeriesEnvelopeV1`, `AnalysisRequestV1`, `DataQualityProfileV1`, `MethodDefinitionV1`, `DetectorResultV1`, `FamilyVoteV1`, `TurningRecordV1`, `CycleEligibilityV1`, `AnalysisResultV1`, and `ToolDecisionReadV1`.
- Versions: `tdc-config/v1`, `tdc-series/v1`, `tdc-observation/v1`, `tdc-analysis-request/v1`, `tdc-analysis-result/v1`, `tdc-method-registry/1`, `tdc-tool-read/v1`, and `tdc-history/v1`.
- Static resources: `GET trend-dynamics-cycle-lab.html`, `GET trend-dynamics-cycle-universe.json`, and descriptor-declared same-origin vintage snapshots; no application API or mutation endpoint is introduced.
- Pure foundation: validation, canonicalization, finite numeric/distribution/matrix helpers, as-of resolution, transforms, quality assessment, multiplicity, and deterministic work planning.
- Pure engines: the exact M01-M18 methods and the family/trend/dynamics/change/cycle/replay/consensus builders named in [design.md](design.md#exact-pure-symbols).
- Projection: `tdcBuildViewModel(result) -> immutable render model` and `tdcBuildToolRead(result) -> rl-tool-read/v1` with nested `tdc-tool-read/v1` metrics.

### Validation Checkpoints

- **Scope 1 recovery gate before Scopes 2-5:** complete the mutation-backed RED recovery packet, restore the exact production bytes after every mutation, capture the eleven-command post-Scope-1 G044 recovery baseline, and record the owner-attributed path/hunk inventory. This baseline measures the accepted Scope 1 state before any later scope; it does not claim to reconstruct the missing pre-Scope-1 chronology.
- **After Scope 1:** config/source/quality/transform contracts, exact numeric guards, cycle types, explicit fixture posture, source-cache canaries, page inline/ID integrity, and four source-truth Regression E2E scenarios pass.
- **After Scope 2:** deterministic trend/change fixtures, M01-M12, family anti-double-counting, sensitivity invariants, influence probes, mixed consensus, and five focused Regression E2E scenarios pass.
- **After Scope 3:** M13-M18, break-first gating, separate seasonal components, long-cycle refusal, official climate scope, multiplicity, held-out association, and six focused Regression E2E scenarios pass.
- **After Scope 4:** all Simple/Power screens, mode/focus parity, safe text, charts/tables, registration, methodology, owner-read truth, provider-credential boundary, responsive accessibility, and route-level Regression E2E pass.
- **After Scope 5:** as-of replay, immutable invalidations/revisions, one-sided versus retrospective dates, walk-forward metrics, cancellation stress, every focused scenario, every affected existing suite, artifact lint, freshness, traceability, and G094 pass before any status transition is requested.

## Planning Assumptions And Impact

- Research Lab is build-free. There is no project CLI, build, lint, format, typecheck, service lifecycle, API E2E, or deployment command to plan.
- `.github/bubbles-project.yaml` declares neither `testImpact` nor `traceContracts`; impact-plan and telemetry/SLO rows are not applicable.
- `e2e-api` is not applicable because Feature 006 adds no API endpoint. Real integration is the production page and static resources served over the Playwright suite's ephemeral HTTP server with no request interception.
- Synthetic deterministic mathematical series are used only where a known input is the correct proof of an algorithm. Browser E2E uses the production page over HTTP and either source-qualified checked-in historical snapshots or a visibly labeled analytic fixture; fixture mode disables owner publication and is never evidence of a live external market, climate, social, or political observation.
- Existing unrelated dirty work includes Feature 005 and shared surfaces it currently touches, including `scripts/selftest.mjs`, `tools.json`, `index.html`, `rlnav.js`, package/source-lock files, and Palm Springs source/tests/spec artifacts. Feature 006 work must preserve every pre-existing byte outside its exact additive hunks.
- Feature 005 files, `specs/005-palm-springs-rental-market-lab/**`, and every unrelated dirty file are prohibited change targets. No cleanup, formatting sweep, generated rewrite, reset, or rollback may cross that boundary.

## Scope Summary

| # | Scope | Surfaces | Primary Tests | DoD Summary | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Deterministic capability foundation | New page/config/validator/fixtures; additive selftest group | Pure unit, contract validator, inline/ID, 4 Regression E2E, foundation suite | Contracts, exact guards, source truth, cycle typing, and protected shared canary | Done |
| 2 | Trend, dynamics, change, and sensitivity engine | Page-local M01-M12 and synthesis; engine fixtures | Pure unit, contract validator, 5 Regression E2E, engine suite | Direction/dynamics/change separation, family consensus, sensitivity integrity | Done |
| 3 | Season, cycle, context, and association engine | Page-local M13-M18; catalog/source fixtures | Pure unit, contract validator, 6 Regression E2E, cycle/context suite | Break-first, multiplicity, typed cycles, held-out association | Not Started |
| 4 | Complete Simple/Power experience and publication | Page UI, registries, note, owner read; additive shared hunks | Inline/ID, view-model unit, validator, 4 Regression E2E, provider boundary | Complete accessible UI, route parity, safe publication and rollback | Not Started |
| 5 | As-of replay and regression closure | Replay/history/scheduler; complete test matrix | Replay unit/validator, 3 Regression E2E, stress, all affected suites | Immutable history, progress/cancel, G044 comparison, governance closure | Not Started |

## Outcome And Requirement Traceability

### Outcome Contract

| Outcome element | Owning proof |
| --- | --- |
| Intent: determine direction, persistence, strength, acceleration/deceleration, turn state, and contextual cycle relevance | Scopes 2 and 3 compute the evidence; Scope 4 renders it; Scope 5 proves what was knowable at each cutoff. |
| Success Signal: complete Simple read with horizon, strength, dynamics, effective/detection times, confidence, support/contradiction, context, and invalidation | SCN-006-001..006, SCN-006-016, and SCN-006-019; `tdcBuildViewModel`; focused browser assertions. |
| Success Signal: local sensitivity recompute without source mutation/refetch | SCN-006-006 and SCN-006-019; request observation in the real browser without interception. |
| Success Signal: Power reproduces decomposition, votes, revisions, cycle tests, tradeoffs, and as-of walk-forward outcomes | Scopes 2, 3, and 5; SCN-006-004, 005, 007, 008, 013, 014, 015, 016, and 017. |
| Hard Constraints: concept separation, as-of truth, provenance, bounded sensitivity, family disagreement, cycle evidence, insufficient-history refusal, calendar uncertainty, one model, educational scope | Typed contracts in Scope 1, engines in Scopes 2-3, UI/publication in Scope 4, and replay/regression closure in Scope 5. |
| Failure Condition | Every named failure is an adversarial unit/validator case and a visible Regression E2E assertion; no spectral, calendar, long-cycle, missing-data, or retrospective path can silently produce a current causal turn. |

### Functional Requirements

Ranges are inclusive. Their union is exactly FR-001 through FR-083; repeated rows identify cross-scope verification rather than omitted ownership.

| Requirement family | Primary scope | Concrete mechanism |
| --- | --- | --- |
| FR-001 through FR-010 | Scope 1 | One shared state, source/observation/config/request contracts, quality audit, transform eligibility/units, reversible adjustments, and as-of resolution. |
| FR-011 through FR-019 | Scope 2 | M01-M04, family clustering, direction/type/strength gates, visible contradictions, and first-class flat/mixed/unavailable. |
| FR-020 through FR-025 | Scope 2 | Nested horizons, slope change, local curvature/state, dynamics classifier, uncertainty/persistence/stability, and influence probes. |
| FR-026 through FR-036 | Scopes 2 and 5 | M05-M12 current evidence in Scope 2; immutable turning records, replay, delay, revision, and walk-forward scoring in Scope 5. |
| FR-037 through FR-043 | Scopes 1 and 2 | Closed profile/bounds contract in Scope 1; cached recompute, risk frontier, invariant gates, and nearby perturbations in Scope 2. |
| FR-044 through FR-055 | Scope 3 | M13-M16, separate components, regular/irregular/time-varying evidence, extrema controls, break-first gating, and residual diagnostics. |
| FR-056 through FR-065 | Scopes 1 and 3 | Closed six-type/ten-domain catalog schema in Scope 1; type-specific target relevance and eligibility in Scope 3. |
| FR-066 through FR-072 | Scope 3 | M17-M18, availability-safe alignment, explicit lag/search breadth, association label, BH/Holm, frozen held-out confirmation, and instability outcomes. |
| FR-073 through FR-080 | Scope 4 | Complete Simple/Power composition, accessible chart/table parity, one result, full audit, strict owner projection, and consumer truth preservation. |
| FR-081 through FR-083 | Scopes 1 and 4 | Closed safety/text/source rules plus visible educational/no-guarantee language, zero private/execution controls, and anti-fabrication output omission. |
| FR-003, FR-010, FR-027, FR-032, FR-034 through FR-036, FR-040 through FR-043, FR-071, FR-072, FR-075, FR-078 through FR-080 | Scope 5 verification | Prefix/vintage replay, endpoint separation, immutable records, deterministic evaluation, cancellation atomicity, and final cross-surface replay/publication proof. |

### Non-Functional Requirements

| Requirements | Owning scope and proof |
| --- | --- |
| NFR-001, NFR-002, NFR-004 | Scope 4 cache-first paint, local recompute/no-request assertion, and 390/1440 px no-body-overflow checks. |
| NFR-003 | Scope 5 fixed-work progress and cancellation stress scenario; prior complete result and navigation remain usable. |
| NFR-005 through NFR-010 | Scope 1 numeric/config/atomic contracts, Scope 2/3 deterministic engines, and Scope 5 repeated replay/failure preservation. |
| NFR-011 through NFR-015 | Scope 4 keyboard controls, concise live regions, chart/table equivalence, non-color state, and complete support/contradiction/invalidation explanations. |
| NFR-016 through NFR-018 | Scope 1 storage/text guards and Scope 4 visible notices, no private controls, and hostile-label browser assertions. |

## Design Contract And Symbol Traceability

| Design contracts / surfaces | Owning scope |
| --- | --- |
| `TrendDynamicsConfigV1`, `SeriesEnvelopeV1`, `AnalysisRequestV1`, `DataQualityProfileV1`, `MethodDefinitionV1`, endpoint posture, error/version model | Scope 1 |
| `DetectorResultV1`, `FamilyVoteV1`, current `TurningRecordV1`, M01-M12, family/trend/dynamics/change/consensus rules | Scope 2 |
| `CycleEligibilityV1`, M13-M18, six cycle evaluators, multiplicity, activation, association | Scope 3 |
| `AnalysisResultV1`, `ToolDecisionReadV1`, runtime/render state, Simple/Power component tree, charts/tables, registration and publication | Scope 4 |
| Immutable `RevisionV1`, local `tdc-history/v1`, cutoff/vintage replay, `WalkForwardRecord`, fixed-work scheduler completion/cancellation | Scope 5 |
| Shared daily-bar adapter and same-origin vintage adapter | Contracted in Scope 1; exercised by every later scope without modifying `rldata.js`. |
| Variation axes: source/time shape, endpoint posture, method family, cycle type, sensitivity, UI composition, publication | Scope 1 fixes the invariants; Scopes 2-5 implement the listed concrete variants. |

All 52 exact pure declarations from design are assigned below; none may be renamed, omitted, nested, or replaced by test-only copies.

| Scope | Exact symbols |
| --- | --- |
| 1 | `tdcError`, `tdcIsPlainObject`, `tdcHasExactKeys`, `tdcFiniteNumber`, `tdcStableSerialize`, `tdcStableDigest`, `tdcKahanSum`, `tdcQuantile`, `tdcMedian`, `tdcMad`, `tdcNormalCdf`, `tdcLogGamma`, `tdcRegularizedBeta`, `tdcStudentTCdf`, `tdcHouseholderSolve`, `tdcAutocorrelation`, `tdcLjungBox`, `tdcValidateConfig`, `tdcIndexConfig`, `tdcValidateSeriesEnvelope`, `tdcResolveAsOfVintage`, `tdcApplyTransform`, `tdcAssessDataQuality`, `tdcAdjustPValues`, `tdcCreateWorkPlan` |
| 2 | `tdcRollingOlsHac`, `tdcTheilSenKendall`, `tdcEndpointLocalQuadratic`, `tdcLocalLinearState`, `tdcCusum`, `tdcBocpd`, `tdcScaleShift`, `tdcDistributionShift`, `tdcCorrelationShift`, `tdcPenalizedLinearSegments`, `tdcGaussianHmm2`, `tdcProminentExtrema`, `tdcClusterFamilyVotes`, `tdcClassifyTrend`, `tdcClassifyDynamics`, `tdcBuildChangeTimeline`, `tdcBuildConsensus` |
| 3 | `tdcHarmonicDecomposition`, `tdcWelchSpectrum`, `tdcGeneralizedLombScargle`, `tdcRollingSpectrum`, `tdcLeadLag`, `tdcEventStudy`, `tdcEvaluateCycle` |
| 4 | `tdcBuildViewModel`, `tdcBuildToolRead` |
| 5 | `tdcWalkForward` plus full prefix/revision execution of the Scope 1-4 symbols |

## Stable Scenario Contract Map

| Business scenario | Stable ID | Scope | Exact persistent E2E title |
| --- | --- | --- | --- |
| BS-001 | SCN-006-001 | 2 | `Regression: SCN-006-001 noisy sustained trend ignores sub-threshold residual wiggles` |
| BS-002 | SCN-006-002 | 2 | `Regression: SCN-006-002 sustained uptrend reports accelerating dynamics separately` |
| BS-003 | SCN-006-003 | 2 | `Regression: SCN-006-003 decelerating uptrend remains positive and exposes invalidation` |
| BS-004 | SCN-006-004 | 5 | `Regression: SCN-006-004 provisional peak keeps effective detection and confirmation times separate` |
| BS-005 | SCN-006-005 | 5 | `Regression: SCN-006-005 failed early reversal remains immutable and invalidated` |
| BS-006 | SCN-006-006 | 2 | `Regression: SCN-006-006 early sensitivity changes risk metrics but preserves integrity gates` |
| BS-007 | SCN-006-007 | 5 | `Regression: SCN-006-007 retrospective turn never backdates the real-time alert` |
| BS-008 | SCN-006-008 | 3 | `Regression: SCN-006-008 weekly and annual components remain separate from trend` |
| BS-009 | SCN-006-009 | 1 | `Regression: SCN-006-009 irregular sampling creates no invented observations` |
| BS-010 | SCN-006-010 | 3 | `Regression: SCN-006-010 insufficient long-cycle history yields no phase or next turn` |
| BS-011 | SCN-006-011 | 1 | `Regression: SCN-006-011 technology attention remains a lifecycle proxy not an oscillation` |
| BS-012 | SCN-006-012 | 1 | `Regression: SCN-006-012 official political date remains uncertain calendar context` |
| BS-013 | SCN-006-013 | 3 | `Regression: SCN-006-013 ENSO context stays scoped to source season geography and mechanism` |
| BS-014 | SCN-006-014 | 3 | `Regression: SCN-006-014 structural break blocks contaminated cycle activation` |
| BS-015 | SCN-006-015 | 3 | `Regression: SCN-006-015 period and lag scans expose correction and reject in-sample winners` |
| BS-016 | SCN-006-016 | 2 | `Regression: SCN-006-016 method-family disagreement remains mixed and unconfirmed` |
| BS-017 | SCN-006-017 | 3 | `Regression: SCN-006-017 lead-lag evidence remains association without a mechanism` |
| BS-018 | SCN-006-018 | 1 | `Regression: SCN-006-018 missing stale and incompatible inputs never become current or neutral` |
| BS-019 | SCN-006-019 | 4 | `Regression: SCN-006-019 Simple Power mobile and local controls share one result without refetch` |
| BS-020 | SCN-006-020 | 4 | `Regression: SCN-006-020 owner read preserves mixed stale degraded and unavailable truth` |

## Repository Command Registry

Only these repository-realistic commands may satisfy planned checks.

### TDC-SELFTEST

```bash
node scripts/selftest.mjs
```

### TDC-VALIDATOR

```bash
node scripts/validate-trend-dynamics-cycle.mjs
```

The new validator is a planned Research Lab Node validator at the exact path above. It extracts production declarations, validates the production config and source-qualified fixtures, and exits nonzero on any contract, formula, provenance, fixture-posture, or linkage failure.

### TDC-PAGE-INLINE-ID

```bash
PAGE=trend-dynamics-cycle-lab.html node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'
```

### TDC-RUNNER-VERSION

```bash
npx --no-install playwright --version
```

The required output is exactly `Version 1.61.1`.

### TDC-E2E-FULL

```bash
npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

Every focused browser row uses the same command with `--grep "<exact title from the scenario map>"` immediately before `--reporter=list`. The file owns and closes a real ephemeral `127.0.0.1` static server. It may observe requests with browser events but contains no `page.route`, `context.route`, fulfillment, response replacement, service worker, internal mock, or silent-pass return.

## G044 Recovery Baseline And Final Comparison Contract

The original eleven-command pre-edit matrix was not captured and MUST NOT be claimed or reconstructed. Scope 1 therefore uses an honest recovery baseline: after every recovery mutation has been restored and TP-01-01 through TP-01-08 are green in their required order, but before any Scope 2-5 edit, execute and record every command below separately through `.github/bubbles/scripts/tool-log.sh` with `BUBBLES_SPEC=006-trend-dynamics-cycle-lab`, `BUBBLES_SCOPE=Scope-1`, and tags `g044,recovery-baseline,<baseline-family>`.

This recovery baseline proves the comprehensive repository state that Scopes 2-5 inherit, including the exact observed state of dirty Feature 005 validators and browser tests. It does not prove which commands passed before Scope 1 existed, and it cannot by itself establish that Scope 1 introduced no regression before this recovery run. Scope 1 acceptance instead combines the current comprehensive matrix, the controlled mutation recovery proof, the canonical reality scan, and owner-attributed containment.

| Baseline family | Exact command |
| --- | --- |
| Node source lock | `node scripts/validate-node-source-lock.mjs` |
| Runner identity | `npx --no-install playwright --version` |
| Repository pure helpers | `node scripts/selftest.mjs` |
| Market Brief contract | `node scripts/validate-brief-payload.mjs` |
| Causal contracts | `node scripts/validate-causal-rotation.mjs` |
| Palm Springs contracts | `node scripts/validate-palm-springs-rental-market.mjs` |
| Provider/credential browser boundary | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |
| Causal browser suite | `npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |
| Bond browser suite | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |
| FX browser suite | `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |
| Palm Springs browser suite | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |

For each recovery-baseline command, record the literal child command, exit code, complete test-title inventory when applicable, pass/fail/skip counts, and stable failure signature when nonzero. The Palm Springs validator and browser suite remain attributed to Feature 005 by path and title; Feature 006 does not edit those files to change their outcome.

Scope 5 reruns the same eleven child commands with tags `g044,final-comparison,<baseline-family>` and compares them one-for-one against this recovery baseline. A command absent from either side, a previously green title that becomes nonzero, a reduced passing-title inventory, a new skip, or a changed failure signature without an owner-attributed explanation is blocking. A matching Feature 005-owned dirty outcome remains visible as Feature 005 evidence and is neither relabeled green nor repaired by Feature 006.

---

## Scope 1: Deterministic Capability Foundation

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** foundation:true

**Depends On:** None

**Primary Outcome:** A closed, deterministic, fail-loud capability foundation can validate source-qualified series, resolve as-of truth, apply eligible transforms, report exact quality/eligibility failures, preserve cycle types, and schedule bounded work without modifying shared Research Lab transport owners.

### Gherkin Scenarios - Scope 1

#### SCN-006-009 / BS-009 - Irregular observations create no synthetic evidence

```gherkin
Scenario: SCN-006-009 Irregular observations create no synthetic evidence
  Given a source-qualified series has uneven availability times and missing intervals
  When the production foundation validates quality and resolves method eligibility
  Then the original observations and gaps remain explicit, no interval is silently interpolated, and regular-only methods are unavailable
```

#### SCN-006-011 / BS-011 - Technology attention remains a lifecycle proxy

```gherkin
Scenario: SCN-006-011 Technology attention remains a lifecycle proxy
  Given a configured technology entry declares lifecycle stages and a source-qualified attention proxy but no stable recurrence
  When the production cycle-type contract is evaluated
  Then the entry remains lifecycle context with proxy limitations and exposes no oscillatory period, phase, or adoption claim
```

#### SCN-006-012 / BS-012 - Political dates remain deterministic context

```gherkin
Scenario: SCN-006-012 Political dates remain deterministic context
  Given an official election or budget date is configured and prior target effects have dispersion
  When the production cycle-type contract is evaluated
  Then the date remains deterministic calendar context and direction and magnitude remain evidence-qualified scenarios rather than a turn signal
```

#### SCN-006-018 / BS-018 - Missing stale and incompatible inputs remain truthful

```gherkin
Scenario: SCN-006-018 Missing stale and incompatible inputs remain truthful
  Given required observations are missing, stale, unit-incompatible, or unavailable at the selected cutoff
  When the production foundation resolves quality, truth state, and eligible methods
  Then exact reasons are visible, cached data are not called current, and no missing value becomes zero, neutral evidence, confidence, or a conclusion
```

### Implementation Plan - Scope 1

1. Add `trend-dynamics-cycle-universe.json` with the exact closed top-level fields, 18 method definitions, profiles/bounds/horizons, transform declarations, initial source-qualified series, ten-domain cycle catalog, evaluation policy, display precision, and no hidden defaults.
2. Add the initial `trend-dynamics-cycle-lab.html` shell and one inline production script with the 25 Scope 1 symbols listed above, closed errors/versions, immutable success/error results, safe text/URL helpers, and no production parameter or source fallback.
3. Implement shared-bars and same-origin-vintage adapters without changing `rldata.js`; resolve `availableAt <= decisionTime`, retain observation/vintage lineage, label latest-only bars `observation-cutoff-only`, and report custom snapshot lifecycle through existing `RLAPP.report` behavior.
4. Implement strict config/envelope validation, finite boundaries, canonical serialization/digest, Kahan/distribution/QR helpers, quality assessment, explicit transforms/units, multiplicity adjustment, and deterministic work-plan ordering.
5. Add `scripts/validate-trend-dynamics-cycle.mjs` as the explicit focused validator. It extracts the exact production functions, validates config and fixtures, checks provenance and fixture labels, and rejects unknown keys/versions, non-finite values, dangling references, invalid ranges, and hidden fallback behavior.
6. Add `tests/fixtures/trend-dynamics-cycle/` with separate `source-qualified/`, `analytic/`, and `invalid/` records. Source-qualified records carry authority, URL, rights, retrieval time, observation/availability/vintage clocks, units, geography/population, and limitations. Analytic records state that they are deterministic algorithm inputs and disable owner publication.
7. Add one additive Feature 006 extraction group to `scripts/selftest.mjs`. Preserve every existing group and summary, and add independent canaries proving `RLDATA` bars/toolReads, `RLAPP` resource state, shared credential storage, and registry ordering are unchanged.
8. Add the real HTTP Playwright file with a closed, visibly labeled fixture selector. Its four Scope 1 tests assert production contract outcomes and rendered truth, never a fixture's asserted market meaning.

### Change Boundary And Shared Infrastructure Impact Sweep - Scope 1

**Allowed new files:** `trend-dynamics-cycle-lab.html`, `trend-dynamics-cycle-universe.json`, `scripts/validate-trend-dynamics-cycle.mjs`, `tests/trend-dynamics-cycle-lab.spec.mjs`, and `tests/fixtures/trend-dynamics-cycle/**`.

**Allowed shared edit:** one additive Feature 006 group in `scripts/selftest.mjs`, anchored immediately before its summary block after a path-scoped pre-edit diff and byte snapshot.

**Protected shared contracts:** balanced-brace extraction; existing assertion ordering and totals; `RLDATA` cache/toolReads; `RLAPP` state; provider credential ownership; every existing tool selftest. The independent canary is the complete `node scripts/selftest.mjs` result plus the pre-change G044 baseline, not the new group alone.

**Explicitly excluded:** `rldata.js`, `rlapp.js`, `rlchart.js`, `rlticker.js`, `rlg.js`, `rlbrief.js`, package/source-lock files, registries, workflows, every existing tool page/test/fixture, `specs/005-palm-springs-rental-market-lab/**`, and every unrelated dirty path.

**Rollback:** remove the new Scope 1 files and the exact Feature 006 selftest group with IDE edits; restore no pre-existing dirty hunk and touch no shared transport owner.

### Implementation Files

- `trend-dynamics-cycle-lab.html`
- `trend-dynamics-cycle-universe.json`
- `scripts/validate-trend-dynamics-cycle.mjs`
- `scripts/selftest.mjs`

### Scope 1 Recovery Acceptance Packet

The installed reality scanner recognizes the canonical heading above and therefore does not fall back to `design.md` or discover excluded `rldata.js`. Its current source-extension matcher resolves the supported declared production target; the exact `.mjs` Feature 006 block remains subject to the separate marker-bounded shared-hunk proof below.

#### Evidence Posture

- Zero valid RED-tagged Scope 1 tool-log entries exist before the interrupted implementation. No artifact may describe the recovery executions as pre-implementation chronology.
- The eight executions below are **recovery mutation proofs**: each deliberately breaks one already-implemented production invariant, proves the unchanged planned test catches that break, restores the exact production bytes, and reruns the same child command green before the implementation is accepted.
- Scenario assertions, `test()` titles, scenario hashes, fixtures, Test Plan commands, and DoD item text are immutable during recovery. Only `trend-dynamics-cycle-lab.html` may be temporarily mutated, one row at a time.
- A nonzero run counts as recovery RED only when its output names the expected assertion or exact protected scenario title below. Syntax errors, server failures, runner failures, or another scenario's failure do not satisfy the row.

#### Recovery Mutation Protocol

For every row in TP order:

1. Run `shasum -a 256 trend-dynamics-cycle-lab.html` and retain the digest as that row's restore target.
2. Use one IDE `apply_patch` edit to apply exactly the listed production mutation. If the original token is absent or occurs outside the named function, stop without editing tests.
3. Run the row's exact child command from the Test Plan through `.github/bubbles/scripts/tool-log.sh` with `BUBBLES_AGENT_NAME=bubbles.implement`, `BUBBLES_SPEC=006-trend-dynamics-cycle-lab`, `BUBBLES_SCOPE=Scope-1`, and tags `recovery-mutation-red,F006-S1-RED-001,<TP-ID>`. Require nonzero exit plus the listed RED signal.
4. Restore the exact original production text with one IDE `apply_patch` edit. Run `shasum -a 256 trend-dynamics-cycle-lab.html` again and require byte equality with step 1 before executing anything else.
5. Run the same unchanged child command through the tool log with tags `recovery-mutation-green,F006-S1-RED-001,<TP-ID>`. Require exit 0 and the original planned assertion/title. A RED without byte restoration and matching GREEN is invalid.

| Test row | Exact reversible production mutation in `trend-dynamics-cycle-lab.html` | Required recovery RED signal |
| --- | --- | --- |
| TP-01-01 | In `tdcApplyTransform`, change only the audit property `interpolationApplied: false` to `interpolationApplied: true`; restore it before GREEN. | `node scripts/selftest.mjs` exits nonzero and names `Trend Dynamics level transform preserves observation lineage without interpolation`. |
| TP-01-02 | In `tdcHasExactKeys`, change only `unknown.forEach(function (key)` to `unknown.slice(0, 0).forEach(function (key)` so an unknown key is not rejected; restore it before GREEN. | `node scripts/validate-trend-dynamics-cycle.mjs` exits nonzero and names `unknown-key must be rejected`. |
| TP-01-03 | Immediately before `function tdcError`, insert exactly `document.getElementById('tdc-recovery-missing-id');`; remove that exact line before GREEN. | The exact TDC-PAGE-INLINE-ID command exits nonzero with `missing ids: tdc-recovery-missing-id`. |
| TP-01-04 | In `tdcRenderIrregular` only, change the diagnostics field `interpolationApplied: transformed.audit.interpolationApplied` to `interpolationApplied: true`; restore it before GREEN. | The unchanged SCN-006-009 focused command exits nonzero and names `Regression: SCN-006-009 irregular sampling creates no invented observations` with the false-versus-true interpolation assertion. |
| TP-01-05 | In `tdcRenderLifecycle` only, change `state: 'contextual', stage:` to `state: 'contextual', period: 12, stage:`; remove `period: 12` before GREEN. | The unchanged SCN-006-011 focused command exits nonzero and names `Regression: SCN-006-011 technology attention remains a lifecycle proxy not an oscillation` with the forbidden `period` property. |
| TP-01-06 | In the `tdcRenderPolitical` `cycleResult` only, change `turnSignal: false` to `turnSignal: true`; restore it before GREEN. | The unchanged SCN-006-012 focused command exits nonzero and names `Regression: SCN-006-012 official political date remains uncertain calendar context` with the true-versus-false turn assertion. |
| TP-01-07 | In `tdcRenderInvalid` only, change `truthState: 'unavailable', errors:` to `truthState: 'unavailable', confidence: 0, errors:`; remove `confidence: 0` before GREEN. | The unchanged SCN-006-018 focused command exits nonzero and names `Regression: SCN-006-018 missing stale and incompatible inputs never become current or neutral` with the forbidden `confidence` property. |
| TP-01-08 | In the `tdcRenderIrregular` diagnostics assignment only, change `ownerReadPublished: false` to `ownerReadPublished: true`; restore it before GREEN. | The unchanged full Scope 1 browser command exits nonzero, still executes the four-title inventory, and names SCN-006-009 as the owner-publication failure. |

#### Owner-Attributed Path And Hunk Containment

The repository-wide excluded-byte aggregate is retired because concurrent sessions can legitimately change foreign files during the observation window. Containment is instead proven by path ownership, exact edit targets, marker-bounded shared hunks, and per-mutation restoration:

- **Scope 1-owned runtime/test paths:** `trend-dynamics-cycle-lab.html`, `trend-dynamics-cycle-universe.json`, `scripts/validate-trend-dynamics-cycle.mjs`, `tests/trend-dynamics-cycle-lab.spec.mjs`, and `tests/fixtures/trend-dynamics-cycle/**`.
- **Scope 1-owned shared hunk:** exactly one block in `scripts/selftest.mjs`, beginning with `/* ---------- Feature 006: Trend Dynamics deterministic capability foundation ---------- */` and ending immediately before `/* ---------- summary ---------- */`. Feature 006 owns no byte before its start marker or at/after the summary marker.
- **Feature 005-owned exclusions:** `specs/005-palm-springs-rental-market-lab/**`, `palm-springs-rental-market-lab.html`, `scripts/validate-palm-springs-rental-market.mjs`, `tests/palm-springs-rental-market-lab.spec.mjs`, Palm Springs fixtures, package/source-lock files, and Feature 005/shared registry hunks. Their dirty state is reported under Feature 005 and is never reset, reformatted, or counted as a Scope 1 edit.
- **Shared-owner exclusions:** `rldata.js`, `rlapp.js`, `rlchart.js`, `rlticker.js`, `rlg.js`, `rlbrief.js`, `tools.json`, `index.html`, and `rlnav.js` remain excluded from Scope 1. The current Scope 1 selftest deliberately asserts registration is absent until Scope 4.

Before recovery and after final GREEN, run these read-only commands with full output:

```bash
git status --short --untracked-files=all -- specs/006-trend-dynamics-cycle-lab trend-dynamics-cycle-lab.html trend-dynamics-cycle-universe.json scripts/validate-trend-dynamics-cycle.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/fixtures/trend-dynamics-cycle scripts/selftest.mjs specs/005-palm-springs-rental-market-lab palm-springs-rental-market-lab.html scripts/validate-palm-springs-rental-market.mjs tests/palm-springs-rental-market-lab.spec.mjs tools.json index.html rlnav.js package.json package-lock.json
git diff --unified=0 -- scripts/selftest.mjs
git status --short -- rldata.js rlapp.js rlchart.js rlticker.js rlg.js rlbrief.js
```

Record an owner table with one row per reported path or shared-file hunk: `path/hunk`, `owner`, `classification`, `recovery edit action`, and `evidence reference`. The only permitted recovery source edit action is temporary mutate/restore on `trend-dynamics-cycle-lab.html`; all excluded rows must say `none`. A concurrent foreign delta is acceptable only when its owner and hunk are explicit. An unknown owner, a Feature 006 hunk outside its markers, any recovery edit target outside the Scope 1 allowlist, or a nonempty shared-owner status without owner-attributed evidence keeps containment unresolved. No whole-worktree or all-excluded-path aggregate hash may be used as the acceptance criterion.

#### Required Recovery Rerun Order

1. Complete TP-01-01 through TP-01-08 recovery mutation RED -> exact restore -> same-command GREEN, one row at a time.
2. Rerun the final accepted GREEN sequence without mutations: TP-01-01, TP-01-02, TP-01-03, TP-01-04, TP-01-05, TP-01-06, TP-01-07, then TP-01-08.
3. Run `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/006-trend-dynamics-cycle-lab --verbose`; require canonical scope discovery, no `design.md` fallback, no `rldata.js` target, and exit 0.
4. Capture the owner-attributed path/hunk proof above and require every recovery edit target to be Scope 1-owned with every excluded action `none`.
5. Execute all eleven commands in `G044 Recovery Baseline And Final Comparison Contract` and freeze their child commands, title inventories, outcomes, and failure signatures before any Scope 2 edit.
6. Run the focused plan/test-plan synchronization check, artifact lint, artifact freshness guard, traceability guard, capability-foundation guard (G094), and editor diagnostics. Route back to planning if Markdown and JSON rows diverge; do not repair tests or begin Scope 2.

#### Focused Planning Synchronization Command

```bash
node -e 'const fs=require("node:fs"),crypto=require("node:crypto");const dir="specs/006-trend-dynamics-cycle-lab";const md=fs.readFileSync(dir+"/scopes.md","utf8"),plan=JSON.parse(fs.readFileSync(dir+"/test-plan.json","utf8")),manifest=JSON.parse(fs.readFileSync(dir+"/scenario-manifest.json","utf8")),spec=fs.readFileSync(dir+"/spec.md","utf8");const need=(value,message)=>{if(!value)throw new Error(message)};const same=(left,right)=>left.length===right.length&&left.every((value,index)=>value===right[index]);const marks=[...md.matchAll(/^## Scope (\d+):/gm)];need(marks.length===5,"scope count drift");const markdownIds=[],dodIds=[];for(let index=0;index<marks.length;index+=1){const section=md.slice(marks[index].index,index+1<marks.length?marks[index+1].index:md.length);const rowIds=[...section.matchAll(/^\|[^|\n]*\|\s*(TP-\d{2}-\d{2})\s*\|/gm)].map(match=>match[1]);const scopeDodIds=[...section.matchAll(/^- \[[ x]\].*(TP-\d{2}-\d{2}).*$/gm)].map(match=>match[1]);const jsonIds=plan.scopes[index].tests.map(test=>test.id);need(same(rowIds,jsonIds),"Markdown/JSON row drift in scope "+(index+1));need(same(scopeDodIds,jsonIds),"Test Plan/DoD drift in scope "+(index+1));markdownIds.push(...rowIds);dodIds.push(...scopeDodIds)}const jsonIds=plan.scopes.flatMap(scope=>scope.tests.map(test=>test.id));need(markdownIds.length===50&&new Set(markdownIds).size===50&&same(markdownIds,jsonIds),"50-row plan drift");need(dodIds.length===50&&same(dodIds,jsonIds),"50-item DoD drift");need(manifest.scenarios.length===20&&new Set(manifest.scenarios.map(scenario=>scenario.scenarioId)).size===20,"scenario contract drift");const sha=value=>crypto.createHash("sha256").update(value).digest("hex");need(manifest.scenarios.every(scenario=>scenario.gherkinHash==="sha256:"+sha(JSON.stringify(scenario.gherkin))),"scenario hash drift");const linkedTitles=manifest.scenarios.flatMap(scenario=>scenario.linkedTests.map(test=>test.testId));const commands=plan.scopes.flatMap(scope=>scope.tests.map(test=>test.command)).join("\n");need(linkedTitles.length===22&&new Set(linkedTitles).size===22&&linkedTitles.every(title=>md.includes(title)&&commands.includes(title)),"linked title drift");const fr=(spec.match(/^- \*\*FR-\d{3}:\*\*/gm)||[]).length,nfr=(spec.match(/^- \*\*NFR-\d{3}:\*\*/gm)||[]).length;need(fr===83&&nfr===18,"requirement count drift");need(plan.scopes[0].tests.length===8&&plan.scopes[0].tests.every(test=>test.recoveryProof&&test.recoveryProof.sameCommandGreenRequired===true),"Scope 1 recovery mapping drift");const statuses=[...md.matchAll(/^\*\*Status:\*\* (.+)$/gm)].map(match=>match[1]);need(same(statuses,["In Progress","Not Started","Not Started","Not Started","Not Started"]),"scope status drift");const implementation=(md.match(/### Implementation Files\n\n([\s\S]*?)\n### /)||[])[1]||"";need(implementation.includes("trend-dynamics-cycle-lab.html")&&implementation.includes("scripts/selftest.mjs")&&!implementation.includes("rldata.js"),"implementation declaration drift");console.log("[plan-sync] scopes=5");console.log("[plan-sync] markdown-test-rows="+markdownIds.length);console.log("[plan-sync] json-test-rows="+jsonIds.length);console.log("[plan-sync] dod-test-items="+dodIds.length);console.log("[plan-sync] scenario-contracts="+manifest.scenarios.length);console.log("[plan-sync] valid-scenario-hashes="+manifest.scenarios.length);console.log("[plan-sync] exact-linked-titles="+linkedTitles.length);console.log("[plan-sync] functional-requirements="+fr);console.log("[plan-sync] non-functional-requirements="+nfr);console.log("[plan-sync] scope1-recovery-rows="+plan.scopes[0].tests.length);console.log("[plan-sync] scope-status-order="+statuses.join(","));console.log("[plan-sync] implementation-fallback-target=rldata.js excluded=true");console.log("[plan-sync] OK")'
```

### Test Plan - Scope 1

TDD evidence remains mandatory for every row. Because historical pre-implementation RED was not captured, Scope 1 uses the explicitly labeled recovery mutation protocol above before accepting the existing implementation; this does not rewrite the historical chronology.

| Test Type | ID | Category | Scenario | File / Location | Exact behavior / title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unit | TP-01-01 | unit | SCN-006-009, 011, 012, 018 | `scripts/selftest.mjs` | Extract Scope 1 production symbols; prove exact config/source/as-of/transform/quality/numeric/type invariants and unchanged RLDATA/RLAPP canaries | `node scripts/selftest.mjs` | No |
| Contract validator | TP-01-02 | functional | SCN-006-009, 011, 012, 018 | `scripts/validate-trend-dynamics-cycle.mjs` | Accept every valid closed fixture and reject unknown/non-finite/dangling/incompatible records with exact `TDC-*` codes | `node scripts/validate-trend-dynamics-cycle.mjs` | No |
| Page integrity | TP-01-03 | functional | SCN-006-018 | `trend-dynamics-cycle-lab.html` | Parse every inline script and require every literal `getElementById` target to exist | Exact `TDC-PAGE-INLINE-ID` command above | No |
| Regression E2E | TP-01-04 | e2e-ui | SCN-006-009 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-009 irregular sampling creates no invented observations` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-009 irregular sampling creates no invented observations" --reporter=list` | Yes |
| Regression E2E | TP-01-05 | e2e-ui | SCN-006-011 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-011 technology attention remains a lifecycle proxy not an oscillation` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-011 technology attention remains a lifecycle proxy not an oscillation" --reporter=list` | Yes |
| Regression E2E | TP-01-06 | e2e-ui | SCN-006-012 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-012 official political date remains uncertain calendar context` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-012 official political date remains uncertain calendar context" --reporter=list` | Yes |
| Regression E2E | TP-01-07 | e2e-ui | SCN-006-018 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-018 missing stale and incompatible inputs never become current or neutral` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-018 missing stale and incompatible inputs never become current or neutral" --reporter=list` | Yes |
| Regression E2E | TP-01-08 | e2e-ui | SCN-006-009, 011, 012, 018 | `tests/trend-dynamics-cycle-lab.spec.mjs` | Complete Scope 1 browser matrix over the real static server | Exact `TDC-E2E-FULL` command above | Yes |

### Definition of Done - Scope 1

Core Delivery Items (Scope 1):

- [x] All Scope 1 contracts, versions, exact symbols, source/vintage rules, quality/transform audits, numerical guards, cycle-type invariants, fixture posture, and deterministic scheduler contract are fully implemented with no default, fallback, stub, or fabricated observation.

> **Phase:** implement
> **Claim Source:** executed
> **Commands:** `node scripts/selftest.mjs` and `node scripts/validate-trend-dynamics-cycle.mjs`
> **Exit Codes:** 0 and 0
> **Output:**
>
> ```text
> [tdc-validator] production-functions=25
> [tdc-validator] config=PASS version=tdc-config/v1
> [tdc-validator] methods=PASS count=18
> [tdc-validator] cycle-domains=PASS count=10
> [tdc-validator] cycle-types=PASS count=6
> [tdc-validator] irregular-sampling=PASS interpolation=false regular-method=TDC-METHOD-REGULARITY
> [tdc-validator] lifecycle=PASS period=omitted phase=omitted
> [tdc-validator] political-calendar=PASS effect=uncertain turnSignal=false
> [tdc-validator] numeric-guards=PASS singular=TDC-NUMERIC-SINGULAR
> [tdc-validator] multiplicity=PASS methods=benjamini-hochberg,holm
> [tdc-validator] source-cache-canaries=PASS shared-owners-untouched
> [tdc-validator] OK
> Research-Lab self-test: 421 passed, 0 failed
> ```
>
- [x] Source-qualified and analytic fixtures are visibly and structurally distinct; every source-qualified row has provenance/clocks/rights, every analytic row is limited to algorithm proof, and owner publication is disabled for all test fixture modes.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/validate-trend-dynamics-cycle.mjs`
> **Exit Code:** 0
> **Output:**
>
> ```text
> [tdc-validator] required=tests/fixtures/trend-dynamics-cycle/source-qualified/irregular-series.json exists=true
> [tdc-validator] required=tests/fixtures/trend-dynamics-cycle/source-qualified/political-calendar.json exists=true
> [tdc-validator] required=tests/fixtures/trend-dynamics-cycle/analytic/technology-lifecycle.json exists=true
> [tdc-validator] required=tests/fixtures/trend-dynamics-cycle/invalid/missing-stale-incompatible.json exists=true
> [tdc-validator] source-qualified-fixtures=PASS count=2
> [tdc-validator] analytic-fixture=PASS publication=false
> [tdc-validator] invalid-fixture=REJECTED codes=TDC-DATA-MISSING,TDC-DATA-UNIT,TDC-SOURCE-STALE
> [tdc-validator] fixture-posture=PASS owner-publication=false
> [tdc-validator] irregular-sampling=PASS interpolation=false regular-method=TDC-METHOD-REGULARITY
> [tdc-validator] lifecycle=PASS period=omitted phase=omitted
> [tdc-validator] political-calendar=PASS effect=uncertain turnSignal=false
> [tdc-validator] OK
> ```
>
- [x] The shared-infrastructure impact sweep proves one additive selftest hunk, unchanged RLDATA/RLAPP/credential contracts, exact rollback, and zero Feature 005 or excluded-file edits.

> **Phase:** implement
> **Claim Source:** interpreted
> **Interpretation:** The marker proof directly establishes one removable Feature 006 block and exact rollback; the 421-test GREEN directly establishes the shared RLDATA/RLAPP/credential canaries; and the pre/post owner-attributed status snapshots plus the recovery edit ledger show that every Feature 005, registry, package, and shared-owner path had recovery action `none`.
> **Commands:** owner-attributed pre/post `git status`; marker-bounded `node -e`; `node scripts/selftest.mjs`; eight per-row SHA-256 restore checks
> **Exit Codes:** all 0
> **Output:**
>
> ```text
> [scope1-shared-proof] path=scripts/selftest.mjs
> [scope1-shared-proof] insertionBlocks=1
> [scope1-shared-proof] summaryBlocks=1
> [scope1-shared-proof] baselineBytes=117922
> [scope1-shared-proof] baselineSha256=18d43ae578d7e58e007df296edb06e1839adfc2025da5a102e0b0f3fe447f2ca
> [scope1-shared-proof] expectedBaselineSha256=18d43ae578d7e58e007df296edb06e1839adfc2025da5a102e0b0f3fe447f2ca
> [scope1-shared-proof] baselineMatch=true
> [scope1-shared-proof] prefixPreserved=true
> [scope1-shared-proof] suffixPreserved=true
> [scope1-shared-proof] rollback=remove-exact-marked-block
> [scope1-shared-proof] result=PASS
>   ✓ Trend Dynamics shared canary leaves RLDATA toolReads and RLAPP resource state unchanged
>   ✓ Trend Dynamics shared canary leaves central credential ownership unchanged
> Research-Lab self-test: 421 passed, 0 failed
> ```
>

Test Evidence Items (Scope 1; Exact Parity With 8 Test Plan Rows):

- [x] TP-01-01 focused red then green evidence proves the complete extracted Scope 1 unit and shared-canary group.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/selftest.mjs`
> **Exit Codes:** recovery RED 1; recovery GREEN 0; final GREEN 0
> **Evidence Tags:** `recovery-mutation-red,F006-S1-RED-001,TP-01-01`; `recovery-mutation-green,F006-S1-RED-001,TP-01-01`; `recovery-final-green,F006-S1-RED-001,TP-01-01`
> **Output:**
>
> ```text
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> Feature 006 Trend Dynamics deterministic capability foundation
>   ✗ FAIL: Trend Dynamics level transform preserves observation lineage without interpolation
> Research-Lab self-test: 420 passed, 1 failed
> [tool-log] recorded exit=1 duration=472ms
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> Feature 006 Trend Dynamics deterministic capability foundation
>   ✓ Trend Dynamics level transform preserves observation lineage without interpolation
>   ✓ Trend Dynamics shared canary leaves RLDATA toolReads and RLAPP resource state unchanged
>   ✓ Trend Dynamics shared canary leaves central credential ownership unchanged
> Research-Lab self-test: 421 passed, 0 failed
> [tool-log] recorded exit=0 duration=460ms
> Research-Lab self-test: 421 passed, 0 failed
> [tool-log] recorded exit=0 duration=462ms
> ```
>
- [x] TP-01-02 focused red then green evidence proves the closed config/source/fixture validator and exact rejection codes.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/validate-trend-dynamics-cycle.mjs`
> **Exit Codes:** recovery RED 1; recovery GREEN 0; final GREEN 0
> **Evidence Tags:** `recovery-mutation-red,F006-S1-RED-001,TP-01-02`; `recovery-mutation-green,F006-S1-RED-001,TP-01-02`; `recovery-final-green,F006-S1-RED-001,TP-01-02`
> **Output:**
>
> ```text
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> AssertionError [ERR_ASSERTION]: unknown-key must be rejected
> true !== false
> [tool-log] recorded exit=1 duration=79ms
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> [tdc-validator] production-functions=25
> [tdc-validator] config=PASS version=tdc-config/v1
> [tdc-validator] config-rejections=unknown-key:TDC-CONFIG-KEY,missing-field:TDC-CONFIG-KEY,wrong-version:TDC-CONFIG-VERSION,dangling-reference:TDC-CONFIG-REFERENCE,non-finite:TDC-CONFIG-NUMERIC,out-of-range:TDC-CONFIG-RANGE
> [tdc-validator] source-qualified-fixtures=PASS count=2
> [tdc-validator] invalid-fixture=REJECTED codes=TDC-DATA-MISSING,TDC-DATA-UNIT,TDC-SOURCE-STALE
> [tdc-validator] fixture-posture=PASS owner-publication=false
> [tdc-validator] source-cache-canaries=PASS shared-owners-untouched
> [tdc-validator] OK
> [tool-log] recorded exit=0 duration=108ms
> [tool-log] recorded exit=0 duration=82ms
> ```
>
- [x] TP-01-03 focused red then green evidence proves inline script syntax and literal ID integrity.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** Exact `TDC-PAGE-INLINE-ID` child command from this scope
> **Exit Codes:** recovery RED 1; recovery GREEN 0; final GREEN 0; dynamic-ID audit 0
> **Evidence Tags:** `recovery-mutation-red,F006-S1-RED-001,TP-01-03`; `recovery-mutation-green,F006-S1-RED-001,TP-01-03`; `recovery-final-green,F006-S1-RED-001,TP-01-03`; `self-validation,dynamic-id,recovery-completion`
> **Output:**
>
> ```text
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> Error: missing ids: tdc-recovery-missing-id
> Node.js v26.4.0
> [tool-log] recorded exit=1 duration=97ms
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> OK page=trend-dynamics-cycle-lab.html inline=1 refs=0
> [tool-log] recorded exit=0 duration=51ms
> OK page=trend-dynamics-cycle-lab.html inline=1 refs=0
> [tool-log] recorded exit=0 duration=44ms
> [tdc-self-validation] dynamicTextTargets=11
> [tdc-self-validation] missingDynamicTextTargets=
> [tdc-self-validation] dynamic-text-targets-exist=PASS
> [tdc-self-validation] four-persistent-tests=PASS
> [tdc-self-validation] result=PASS
> ```
>
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior prove SCN-006-009 Irregular observations create no synthetic evidence: original observations and gaps remain explicit, no interval is silently interpolated, and regular-only methods are unavailable through the exact TP-01-04 Regression E2E row.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** Exact TP-01-04 focused Playwright child command
> **Exit Codes:** recovery RED 1; recovery GREEN 0; final GREEN 0
> **Evidence Tags:** `recovery-mutation-red,F006-S1-RED-001,TP-01-04`; `recovery-mutation-green,F006-S1-RED-001,TP-01-04`; `recovery-final-green,F006-S1-RED-001,TP-01-04`
> **Output:**
>
> ```text
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> Running 1 test using 1 worker
> Regression: SCN-006-009 irregular sampling creates no invented observations
> Expected: false
> Received: true
> expect(diagnostics.foundation.interpolationApplied).toBe(false);
> 1 failed
> [tool-log] recorded exit=1 duration=5858ms
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> [SCN-006-009] truth=DEGRADED
> [SCN-006-009] interpolationApplied=false
> [SCN-006-009] regularMethod=TDC-METHOD-REGULARITY
> [SCN-006-009] irregularMethod=eligible
> [SCN-006-009] ownerReadPublished=false
> 1 passed
> [tool-log] recorded exit=0 duration=3333ms
> ```
>
- [x] TP-01-05 Regression E2E evidence proves SCN-006-011 technology attention remains lifecycle proxy context with no oscillatory period, phase, or adoption claim.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** Exact TP-01-05 focused Playwright child command
> **Exit Codes:** recovery RED 1; recovery GREEN 0; final GREEN 0
> **Evidence Tags:** `recovery-mutation-red,F006-S1-RED-001,TP-01-05`; `recovery-mutation-green,F006-S1-RED-001,TP-01-05`; `recovery-final-green,F006-S1-RED-001,TP-01-05`
> **Output:**
>
> ```text
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> Running 1 test using 1 worker
> Regression: SCN-006-011 technology attention remains a lifecycle proxy not an oscillation
> Expected path: not "period"
> Received value: 12
> expect(diagnostics.foundation.cycle).not.toHaveProperty('period');
> 1 failed
> [tool-log] recorded exit=1 duration=5262ms
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> [SCN-006-011] type=lifecycle
> [SCN-006-011] state=contextual
> [SCN-006-011] period=omitted
> [SCN-006-011] phase=omitted
> [SCN-006-011] adoptionClaim=omitted
> 1 passed
> [tool-log] recorded exit=0 duration=2609ms
> ```
>
- [x] TP-01-06 Regression E2E evidence proves SCN-006-012 an official political date remains deterministic calendar context with uncertain direction/magnitude and no turn signal.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** Exact TP-01-06 focused Playwright child command
> **Exit Codes:** recovery RED 1; recovery GREEN 0; final GREEN 0
> **Evidence Tags:** `recovery-mutation-red,F006-S1-RED-001,TP-01-06`; `recovery-mutation-green,F006-S1-RED-001,TP-01-06`; `recovery-final-green,F006-S1-RED-001,TP-01-06`
> **Output:**
>
> ```text
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> Running 1 test using 1 worker
> Regression: SCN-006-012 official political date remains uncertain calendar context
> Expected: false
> Received: true
> expect(diagnostics.foundation.cycle.turnSignal).toBe(false);
> 1 failed
> [tool-log] recorded exit=1 duration=7004ms
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> [SCN-006-012] type=deterministic-calendar
> [SCN-006-012] effectState=uncertain
> [SCN-006-012] turnSignal=false
> [SCN-006-012] phase=omitted
> [SCN-006-012] ownerReadPublished=false
> 1 passed
> [tool-log] recorded exit=0 duration=2856ms
> ```
>
- [x] TP-01-07 Regression E2E evidence proves SCN-006-018 missing, stale, and incompatible inputs expose exact reasons and never become current, zero, neutral evidence, confidence, or conclusion.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** Exact TP-01-07 focused Playwright child command
> **Exit Codes:** recovery RED 1; recovery GREEN 0; final GREEN 0
> **Evidence Tags:** `recovery-mutation-red,F006-S1-RED-001,TP-01-07`; `recovery-mutation-green,F006-S1-RED-001,TP-01-07`; `recovery-final-green,F006-S1-RED-001,TP-01-07`
> **Output:**
>
> ```text
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> Running 1 test using 1 worker
> Regression: SCN-006-018 missing stale and incompatible inputs never become current or neutral
> Expected path: not "confidence"
> Received value: 0
> expect(diagnostics.foundation).not.toHaveProperty('confidence');
> 1 failed
> [tool-log] recorded exit=1 duration=3972ms
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> [SCN-006-018] truth=UNAVAILABLE
> [SCN-006-018] codes=TDC-DATA-MISSING,TDC-DATA-UNIT,TDC-SOURCE-STALE
> [SCN-006-018] confidence=omitted
> [SCN-006-018] conclusion=omitted
> [SCN-006-018] ownerReadPublished=false
> 1 passed
> [tool-log] recorded exit=0 duration=2776ms
> ```
>
- [x] Broader E2E regression suite passes through TP-01-08 after all focused Scope 1 rows pass.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
> **Exit Codes:** recovery RED 1; recovery GREEN 0; final GREEN 0
> **Evidence Tags:** `recovery-mutation-red,F006-S1-RED-001,TP-01-08`; `recovery-mutation-green,F006-S1-RED-001,TP-01-08`; `recovery-final-green,F006-S1-RED-001,TP-01-08`
> **Output:**
>
> ```text
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> Running 4 tests using 1 worker
> Regression: SCN-006-009 irregular sampling creates no invented observations
> Expected: false
> Received: true
> expect(diagnostics.ownerReadPublished).toBe(false);
> Regression: SCN-006-011 technology attention remains a lifecycle proxy not an oscillation
> Regression: SCN-006-012 official political date remains uncertain calendar context
> Regression: SCN-006-018 missing stale and incompatible inputs never become current or neutral
> 1 failed
> 3 passed
> [tool-log] recorded exit=1 duration=4809ms
> e55985630881b91f0b4fcc3c531b914cd2dc5b97c312e87828c468530638e738  trend-dynamics-cycle-lab.html
> [SCN-006-009] ownerReadPublished=false
> [SCN-006-011] period=omitted
> [SCN-006-012] turnSignal=false
> [SCN-006-018] confidence=omitted
> 4 passed
> [tool-log] recorded exit=0 duration=2926ms
> ```

Build Quality Gate (Scope 1):

- [x] The pre-edit G044 baseline, path-scoped dirty-tree record, exact changed-path classification, focused commands, artifact lint, freshness, traceability, and G094 checks are recorded; all Scope 1 findings are fixed and rerun without changing excluded surfaces.

> **Phase:** implement
> **Claim Source:** interpreted
> **Interpretation:** The authoritative `G044 Recovery Baseline And Final Comparison Contract` expressly substitutes the eleven-command post-Scope-1/pre-Scope-2 recovery baseline for the unavailable historical pre-Scope-1 matrix. The historical matrix still does not exist and is not claimed. Under that approved substitution, all recovery rows, current TP rows, containment checks, G028, planning sync, and completion guards passed; every excluded path had recovery action `none`.
> **Commands:** eleven separate `g044,recovery-baseline,<family>` child commands; focused plan sync; G028; artifact lint; freshness; traceability; G094; regression quality; no-interception; self-validation; source lock; `git diff --check`
> **Exit Codes:** all 0
> **Output:**
>
> ```text
> ℹ️  INFO: Resolved 1 implementation file(s) to scan
> Files scanned:  1
> Violations:     0
> Warnings:       0
> 🟢 PASSED: No source code reality violations detected
> [plan-sync] markdown-test-rows=50
> [plan-sync] json-test-rows=50
> [plan-sync] dod-test-items=50
> [plan-sync] scenario-contracts=20
> [plan-sync] exact-linked-titles=22
> [plan-sync] scope1-recovery-rows=8
> [plan-sync] implementation-fallback-target=rldata.js excluded=true
> [plan-sync] OK
> Research-Lab self-test: 421 passed, 0 failed
> [causal-contract] checks passed: 39
> [causal-contract] checks failed: 0
> 12 passed
> 4 passed
> 26 passed
> 9 passed
> 5 passed
> Artifact lint PASSED.
> RESULT: PASS (0 failures, 0 warnings)
> capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
> REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
> [tdc-test-integrity] result=PASS
> [tdc-self-validation] result=PASS
> [node-source-lock] actual=PASS
> ```

---

## Scope 2: Trend, Dynamics, Change, And Sensitivity Engine

**Status:** Done

**Scope-Kind:** runtime-behavior

**Depends On:** Scope 1 - Deterministic Capability Foundation

**Primary Outcome:** The finite M01-M12 registry computes direction, trend type, inspectable strength, acceleration/deceleration, current change/regime evidence, family-level disagreement, influence, nearby stability, and governed sensitivity without turning correlated methods into confidence.

### Gherkin Scenarios - Scope 2

#### SCN-006-001 / BS-001 - Sustained trend survives residual noise

```gherkin
Scenario: SCN-006-001 Sustained trend survives residual noise
  Given a source-qualified series has persistent positive direction across the selected horizon and residual wiggles below the change threshold
  When the balanced production registry and consensus are evaluated
  Then the result is a sustained rising trend with strength and uncertainty, no wiggle becomes a turn, and supporting and contradicting families remain visible
```

#### SCN-006-002 / BS-002 - Acceleration is separate from direction

```gherkin
Scenario: SCN-006-002 Acceleration is separate from direction
  Given an established rising trend has a persistent slope increase above the governed effect threshold
  When production trend dynamics are evaluated
  Then direction remains rising while dynamics are accelerating with units, horizon, uncertainty, persistence, and confirming families
```

#### SCN-006-003 / BS-003 - Deceleration is not a reversal

```gherkin
Scenario: SCN-006-003 Deceleration is not a reversal
  Given a supported positive trend slope is declining but has not crossed reversal or change confirmation gates
  When production trend dynamics are evaluated
  Then the result remains a decelerating rising trend and exposes distinct inflection confirmation and invalidation conditions
```

#### SCN-006-006 / BS-006 - Sensitivity changes risk rather than integrity

```gherkin
Scenario: SCN-006-006 Sensitivity changes risk rather than integrity
  Given one valid series, transform, horizon, and source cutoff
  When the user changes from cautious to early sensitivity within configured bounds
  Then detection timing, false alarms, misses, revisions, and governed thresholds may change while source, history, as-of, multiplicity, family independence, and invalidation gates remain identical
```

#### SCN-006-016 / BS-016 - Detector disagreement remains mixed

```gherkin
Scenario: SCN-006-016 Detector disagreement remains mixed
  Given trend families support acceleration while independent change and regime families remain below confirmation
  When the production consensus is formed
  Then disagreement remains visible and the result cannot become a confirmed regime change through averaging or correlated method counts
```

### Implementation Plan - Scope 2

1. Implement M01-M04 exactly: centered/scaled QR OLS with HAC, Theil-Sen/Kendall block uncertainty, one-sided local quadratic, and filtered/retrospective local-linear state with endpoint posture kept separate.
2. Implement M05-M12 exactly: calibrated CUSUM, log-space BOCPD, scale/distribution/correlation shifts, exact penalized linear segmentation, deterministic two-state Gaussian HMM, and prominent extrema with right-side delay.
3. Implement family clustering, direction/type/strength, nested dynamics, current change timeline, conservative confidence, confirmation/invalidation conditions, influence probes, nine-point stability, and one immutable complete consensus.
4. Enforce the profile/bounds contract: cautious/balanced/early alter only the designed speed/reliability values; custom tuning is exploratory; invalid edits retain the prior complete result and owner read.
5. Extend the focused validator and selftest with mathematically discriminating fixtures: exact linear slope, outlier-robust monotonic trend, quadratic acceleration/deceleration, prefix-invariant filtering, sustained shift, BOCPD normalization, variance/distribution/correlation shifts, segmentation, HMM, extrema, family anti-double-counting, and 100 byte-identical repeated results excluding timings.
6. Extend the production page's Evidence and current Change projections enough to expose every Scope 2 state through the real browser. Analytic browser fixtures remain visibly labeled and assertions target computed results, state transitions, and absent false claims.

### Change Boundary - Scope 2

**Allowed edits:** `trend-dynamics-cycle-lab.html`, `scripts/validate-trend-dynamics-cycle.mjs`, the Feature 006 group in `scripts/selftest.mjs`, `tests/trend-dynamics-cycle-lab.spec.mjs`, and `tests/fixtures/trend-dynamics-cycle/analytic/**`.

**Explicitly excluded:** config schema/registry ids established by Scope 1 except a plan-reconciled correction; all shared JS owners; all registries/docs; all Feature 005 files; all existing tests. No engine logic may move into a fixture or test helper.

**Rollback:** remove only the Scope 2 method/synthesis blocks, fixture cases, validator assertions, selftest assertions, and exact browser tests while retaining the complete Scope 1 foundation.

### Shared Infrastructure Impact Sweep - Scope 2

**Protected surfaces:** Scope 2 may extend only the marker-bounded Feature 006 group in shared `scripts/selftest.mjs`, the existing Feature 006 analytic-fixture family, and the Scope 1 production/validator/browser contracts. It may not rewrite the shared extractor, summary ordering, test harness, browser server, source cache, credential setup, or any fixture owned by another feature.

**Downstream contracts and blast radius:** preserve selftest extraction and assertion ordering, deterministic fixture identity and provenance, Scope 1 source/vintage/quality/transform behavior, RLDATA/RLAPP/credential canaries, the four accepted Scope 1 browser scenarios, and every pre-existing selftest group. Ordering, timing, bootstrap state, storage, session/context hydration, role detection, and shared browser setup are unchanged because Scope 2 adds page-local engine behavior only.

**Independent canary:** the TP-02-01 Fixture Canary runs the complete repository `node scripts/selftest.mjs` suite, including the accepted Scope 1 downstream contract canaries and every pre-existing feature group, before any broad Scope 2 Playwright rerun. A new failure, reduced assertion inventory, changed ordering, or altered shared-state canary is blocking even when the new M01-M12 assertions pass.

**Rollback/restore:** remove only the marker-bounded Scope 2 additions from the Feature 006 selftest group and analytic fixtures, then rerun the unchanged TP-02-01 canary and the accepted Scope 1 browser matrix. No shared harness, foreign fixture, or pre-existing dirty hunk is restored, reset, or rewritten.

### Test Plan - Scope 2

Scenario-first TDD is mandatory for every row: capture focused red evidence before its production behavior exists or after a controlled break, then capture green evidence with the same command and assertion identity after implementation.

| Test Type | ID | Category | Scenario | File / Location | Exact behavior / title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unit / Fixture Canary | TP-02-01 | unit | SCN-006-001, 002, 003, 006, 016 | `scripts/selftest.mjs` | Canary: run the complete repository selftest inventory before broad suite reruns, then extract M01-M12 and synthesis and prove formulas, prefix honesty, numerical failures, family clustering, influence, stability, confidence, and deterministic repeats | `node scripts/selftest.mjs` | No |
| Contract validator | TP-02-02 | functional | SCN-006-001, 002, 003, 006, 016 | `scripts/validate-trend-dynamics-cycle.mjs` | Validate finite engine outputs, exact endpoint postures, parameters, units, unavailable reasons, fixture provenance, and no self-validating expected-output fields | `node scripts/validate-trend-dynamics-cycle.mjs` | No |
| Regression E2E | TP-02-03 | e2e-ui | SCN-006-001 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-001 noisy sustained trend ignores sub-threshold residual wiggles` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-001 noisy sustained trend ignores sub-threshold residual wiggles" --reporter=list` | Yes |
| Regression E2E | TP-02-04 | e2e-ui | SCN-006-002 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-002 sustained uptrend reports accelerating dynamics separately` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-002 sustained uptrend reports accelerating dynamics separately" --reporter=list` | Yes |
| Regression E2E | TP-02-05 | e2e-ui | SCN-006-003 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-003 decelerating uptrend remains positive and exposes invalidation` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-003 decelerating uptrend remains positive and exposes invalidation" --reporter=list` | Yes |
| Regression E2E | TP-02-06 | e2e-ui | SCN-006-006 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-006 early sensitivity changes risk metrics but preserves integrity gates` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-006 early sensitivity changes risk metrics but preserves integrity gates" --reporter=list` | Yes |
| Regression E2E | TP-02-07 | e2e-ui | SCN-006-016 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-016 method-family disagreement remains mixed and unconfirmed` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-016 method-family disagreement remains mixed and unconfirmed" --reporter=list` | Yes |
| Regression E2E | TP-02-08 | e2e-ui | SCN-006-001, 002, 003, 006, 016 | `tests/trend-dynamics-cycle-lab.spec.mjs` | Complete Scope 1-2 browser matrix | Exact `TDC-E2E-FULL` command above | Yes |

### Definition of Done - Scope 2

Core Delivery Items (Scope 2):

- [x] M01-M12 and every assigned synthesis symbol implement the designed formulas, endpoint postures, eligibility, numerical guards, parameter records, and typed outputs without substituting a simpler indicator.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/validate-trend-dynamics-cycle.mjs`
> **Exit Code:** 0
> **Output:**
>
> ```text
> [tdc-validator] production-functions=54
> [tdc-validator] config=PASS version=tdc-config/v1
> [tdc-validator] methods=PASS count=18
> [tdc-validator] engine-fixture=PASS cases=5 expected-output-fields=0 publication=false
> [tdc-validator] numeric-guards=PASS singular=TDC-NUMERIC-SINGULAR
> [tdc-validator] scope2-methods=PASS count=12 endpoint-postures=one-sided-filtered,retrospective-segmented
> [tdc-validator] scope2-states=PASS sustained=rising accelerating=accelerating decelerating=decelerating disagreement=mixed-unconfirmed
> [tdc-validator] scope2-sensitivity=PASS integrity-equal=true thresholds-different=true
> [tdc-validator] scope2-determinism=PASS repeats=100 timings-excluded=true
> [tdc-validator] OK
> ```
>
- [x] Trend direction/type/strength, dynamics, change, regime, and extrema remain separate; family clustering prevents correlated confirmations and preserves unavailable, unstable, mixed, and contradicted states.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
> **Exit Code:** 0
> **Output:**
>
> ```text
> [SCN-006-001] direction=rising
> [SCN-006-001] lifecycle=sustained
> [SCN-006-001] change=none
> [SCN-006-001] supporting=trend-linear,trend-robust,trend-local-state
> [SCN-006-002] direction=rising
> [SCN-006-002] dynamics=accelerating
> [SCN-006-003] dynamics=decelerating
> [SCN-006-003] confirmedRegimeChange=false
> [SCN-006-016] agreement=mixed
> [SCN-006-016] change=mixed-unconfirmed
> [SCN-006-016] qualifyingChangeFamilies=1
> [SCN-006-016] requiredChangeFamilies=2
> [SCN-006-016] confirmedRegimeChange=false
> ```
>
- [x] Sensitivity and nearby perturbations alter only governed speed/reliability values, and influence diagnostics identify newest-row, boundary, adjustment, or broad-run dependence.

> **Phase:** implement
> **Claim Source:** executed
> **Commands:** `node scripts/selftest.mjs`; focused SCN-006-006 Playwright command
> **Exit Codes:** 0 and 0
> **Output:**
>
> ```text
>   ✓ Trend Dynamics M03-M04 preserve acceleration units, filtered prefix honesty, and retrospective-only smoothing revision
>   ✓ Trend Dynamics M05-M06 detect a sustained shift while BOCPD remains normalized and records truncation mass
>   ✓ Trend Dynamics M07-M09 discriminate scale, distribution, and paired-correlation changes with finite uncertainty
>   ✓ Trend Dynamics stability, influence, and change timeline preserve invariant gates and never promote unconfirmed disagreement
> [SCN-006-006] cautiousDetection=124
> [SCN-006-006] earlyDetection=69
> [SCN-006-006] cautiousFalseAlarms=0
> [SCN-006-006] earlyFalseAlarms=2
> [SCN-006-006] cautiousMisses=0
> [SCN-006-006] earlyMisses=0
> [SCN-006-006] integrityEqual=true
> [SCN-006-006] fixtureRefetch=0
> ```
>
- [x] Change Boundary is respected and zero excluded file families were changed; Scope 2 stays inside its allowed Feature 006 blocks and preserves the Scope 1 contract digests and every unrelated dirty hunk.

> **Phase:** implement
> **Claim Source:** interpreted
> **Interpretation:** The executed marker audit confines all 17 Scope 2 selftest symbols to the Feature 006 block, the path inventory contains only declared Feature 006 surfaces, the accepted lifecycle fixture retained its exact pre-run digest, and the unchanged four-test Scope 1 browser command passed. Together these prove the additive Scope 2 edit stayed within the declared boundary while concurrent foreign hunks remained separate.
> **Commands:** marker-bounded containment audit; scoped `git status --short`; final `shasum -a 256`; Scope 1 browser baseline
> **Exit Codes:** all 0
> **Output:**
>
> ```text
> [scope2-containment] feature006-marker-count=PASS
> [scope2-containment] feature007-marker-count=PASS
> [scope2-containment] boundary-order=PASS
> [scope2-containment] scope2-symbol-count=PASS
> [scope2-containment] all-scope2-symbols-in-feature006=PASS
> [scope2-containment] no-scope2-symbols-outside-feature006=PASS
> [scope2-containment] feature007-block-preserved-separate=PASS
> [scope2-containment] blockBytes=28687
> [scope2-containment] result=PASS
> 0f4ddc94f7b092166a466ba7819a7002316e4c25c08eab9d570770fdd76dbbb4  tests/fixtures/trend-dynamics-cycle/analytic/technology-lifecycle.json
> Running 4 tests using 1 worker
>   4 passed (6.5s)
> ```
>
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns and preserves the complete repository selftest inventory plus the accepted Scope 1 downstream contracts.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/selftest.mjs`
> **Exit Code:** 0
> **Evidence Tags:** `canary-pre-broad,TP-02-01,scope1-contracts`
> **Output:**
>
> ```text
> Feature 006 Trend Dynamics deterministic capability foundation
>   ✓ Trend Dynamics complete Scope 2 engine separates sustained direction, acceleration, deceleration, wiggles, and reversal gates
>   ✓ Trend Dynamics consensus is deeply frozen and produces 100 byte-identical results while excluding diagnostic timings
>   ✓ Trend Dynamics M01-M12 fail loud on non-finite, insufficient, or degenerate inputs without manufacturing neutral output
>   ✓ Trend Dynamics shared canary leaves RLDATA toolReads and RLAPP resource state unchanged
>   ✓ Trend Dynamics shared canary leaves central credential ownership unchanged
>   ✓ Trend Dynamics Scope 1 preserves registry ordering by deferring registration to Scope 4
> Feature 007 Technical Analysis Decision capability foundation
>   ✓ Strategy Validation delegates only through the marker-bounded RLVALID parity adapter
> ================================================
> Research-Lab self-test: 466 passed, 0 failed
> ================================================
> ```
>
- [x] Rollback or restore path for shared infrastructure changes is documented and verified without resetting shared harnesses, foreign fixtures, or pre-existing dirty hunks.

> **Phase:** implement
> **Claim Source:** interpreted
> **Interpretation:** Scope 2 rollback is a deletion of its bounded Feature 006 additions, not a reset of shared files. The marker audit proves the selftest removal boundary, the preserved lifecycle digest proves the accepted fixture was not rewritten, and the unchanged Scope 1 browser matrix proves the retained foundation remains runnable.
> **Commands:** marker-bounded containment audit; `shasum -a 256`; Scope 1 browser baseline
> **Exit Codes:** all 0
> **Output:**
>
> ```text
> [scope2-containment] feature006-marker-count=PASS
> [scope2-containment] feature007-marker-count=PASS
> [scope2-containment] summary-marker-count=PASS
> [scope2-containment] boundary-order=PASS
> [scope2-containment] all-scope2-symbols-in-feature006=PASS
> [scope2-containment] no-scope2-symbols-outside-feature006=PASS
> [scope2-containment] blockSha256=2040d75f91ca42781f97b0ed81bde6440fb196ed0721d953a1c25ebea857fec1
> [scope2-containment] result=PASS
> 0f4ddc94f7b092166a466ba7819a7002316e4c25c08eab9d570770fdd76dbbb4  tests/fixtures/trend-dynamics-cycle/analytic/technology-lifecycle.json
> [SCN-006-009] interpolationApplied=false
> [SCN-006-018] ownerReadPublished=false
>   4 passed (6.5s)
> ```
>

Test Evidence Items (Scope 2; Exact Parity With 8 Test Plan Rows):

- [x] TP-02-01 focused red then green unit evidence proves every M01-M12 formula, branch, failure, family, stability, and deterministic-repeat assertion.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/selftest.mjs`
> **Exit Codes:** RED 1; final GREEN 0
> **Structured Evidence:** tool-log rows tagged `red,TP-02-01,scope2-engine-missing` and `canary-pre-broad,TP-02-01,scope1-contracts`
> **Output:**
>
> ```text
> Feature 006 Trend Dynamics deterministic capability foundation
>   ✗ FAIL (Trend Dynamics foundation group threw): function not found: tdcRollingOlsHac
> Research-Lab self-test: 379 passed, 2 failed
> [tool-log] recorded exit=1 duration=555ms
> Feature 006 Trend Dynamics deterministic capability foundation
>   ✓ Trend Dynamics M01 fits exact slope with finite HAC bounds and exposes zero residual scale as unavailable
>   ✓ Trend Dynamics M02 preserves the monotonic slope and dependence-aware block interval under one extreme outlier
>   ✓ Trend Dynamics M03-M04 preserve acceleration units, filtered prefix honesty, and retrospective-only smoothing revision
>   ✓ Trend Dynamics M05-M06 detect a sustained shift while BOCPD remains normalized and records truncation mass
>   ✓ Trend Dynamics M10 exact penalized segmentation keeps the designed break stable across 0.8x, 1.0x, and 1.2x penalties
>   ✓ Trend Dynamics M11 converges with deterministic mean-sorted labels, valid occupancy, and one filtered probability row per input
>   ✓ Trend Dynamics M12 preserves prominent peak width and the explicit right-side confirmation delay
> Research-Lab self-test: 466 passed, 0 failed
> ```
>
- [x] TP-02-02 focused red then green validator evidence proves typed complete outputs and exact unavailable/error behavior.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/validate-trend-dynamics-cycle.mjs`
> **Exit Codes:** RED 1; final GREEN 0
> **Structured Evidence:** tool-log rows tagged `red,TP-02-02,scope2-engine-missing` and `functional,TP-02-02,final-green`
> **Output:**
>
> ```text
> [RED] command=node scripts/validate-trend-dynamics-cycle.mjs
> [RED] exitCode=1
> [RED] stdoutBytes=816 stderrBytes=857
> [RED] missing production function=tdcRollingOlsHac
> [tdc-validator] engine-fixture=PASS cases=5 expected-output-fields=0 publication=false
> [tdc-validator] invalid-fixture=REJECTED codes=TDC-DATA-MISSING,TDC-DATA-UNIT,TDC-SOURCE-STALE
> [tdc-validator] fixture-posture=PASS owner-publication=false
> [tdc-validator] scope2-methods=PASS count=12 endpoint-postures=one-sided-filtered,retrospective-segmented
> [tdc-validator] scope2-states=PASS sustained=rising accelerating=accelerating decelerating=decelerating disagreement=mixed-unconfirmed
> [tdc-validator] scope2-sensitivity=PASS integrity-equal=true thresholds-different=true
> [tdc-validator] scope2-determinism=PASS repeats=100 timings-excluded=true
> [tdc-validator] OK
> ```
>
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior prove SCN-006-001 Sustained trend survives residual noise: persistent positive direction remains a sustained rising trend with strength and uncertainty, sub-threshold residual wiggles create no turn, and supporting and contradicting families stay visible through TP-02-03.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** focused SCN-006-001 Playwright command from TP-02-03
> **Exit Codes:** RED 1; GREEN 0
> **Structured Evidence:** tool-log rows tagged `red,TP-02-03,SCN-006-001` and `green,TP-02-03,SCN-006-001`
> **Output:**
>
> ```text
> [RED] fixture path absent: #fixtureBand expected TEST FIXTURE - ANALYTIC
> [RED] 1 failed
> [SCN-006-001] direction=rising
> [SCN-006-001] lifecycle=sustained
> [SCN-006-001] strength=98.799686
> [SCN-006-001] uncertainty=0.449655..0.450508
> [SCN-006-001] change=none
> [SCN-006-001] supporting=trend-linear,trend-robust,trend-local-state
> [SCN-006-001] contradicting=change-online,change-scale-distribution,turn-extrema
> [SCN-006-001] turningRecords=0
> [SCN-006-001] ownerReadPublished=false
>   1 passed
> ```
>
- [x] TP-02-04 Regression E2E evidence proves SCN-006-002 rising direction and accelerating dynamics remain simultaneous separate fields with units, horizon, uncertainty, persistence, and families.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** focused SCN-006-002 Playwright command from TP-02-04
> **Exit Codes:** RED 1; GREEN 0
> **Structured Evidence:** tool-log rows tagged `red,TP-02-04,SCN-006-002` and `green,TP-02-04,SCN-006-002`
> **Output:**
>
> ```text
> [RED] fixture path absent: #fixtureBand expected TEST FIXTURE - ANALYTIC
> [RED] 1 failed
> [SCN-006-002] direction=rising
> [SCN-006-002] dynamics=accelerating
> [SCN-006-002] units=index-points/observation^2
> [SCN-006-002] horizon=126
> [SCN-006-002] persistence=true
> [SCN-006-002] interval=0.011902..0.012013
> [SCN-006-002] families=trend-local-state,nested-slope
> [SCN-006-002] ownerReadPublished=false
>   1 passed
> [tool-log] recorded exit=0
> ```
>
- [x] TP-02-05 Regression E2E evidence proves SCN-006-003 a declining positive slope remains a decelerating rising trend with distinct inflection confirmation/invalidation, not reversal.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** focused SCN-006-003 Playwright command from TP-02-05
> **Exit Codes:** RED 1; GREEN 0
> **Structured Evidence:** tool-log rows tagged `red,TP-02-05,SCN-006-003` and `green,TP-02-05,SCN-006-003`
> **Output:**
>
> ```text
> [RED] fixture path absent: #fixtureBand expected TEST FIXTURE - ANALYTIC
> [RED] 1 failed
> [SCN-006-003] direction=rising
> [SCN-006-003] currentSlope=0.654386
> [SCN-006-003] dynamics=decelerating
> [SCN-006-003] change=watching
> [SCN-006-003] confirmation=Confirm when 2 independent current change/turn families persist for 3 observations
> [SCN-006-003] invalidation=Invalidate when online statistics reset below half their configured limit
> [SCN-006-003] confirmedRegimeChange=false
> [SCN-006-003] ownerReadPublished=false
>   1 passed
> [tool-log] recorded exit=0
> ```
>
- [x] TP-02-06 Regression E2E evidence proves SCN-006-006 early sensitivity changes timing, false alarms, misses, revisions, and thresholds while source/history/as-of/multiplicity/family/invalidation gates remain identical.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** focused SCN-006-006 Playwright command from TP-02-06
> **Exit Codes:** RED 1; GREEN 0
> **Structured Evidence:** tool-log rows tagged `red,TP-02-06,SCN-006-006` and `green,TP-02-06,SCN-006-006`
> **Output:**
>
> ```text
> [RED] fixture path absent: #fixtureBand expected TEST FIXTURE - ANALYTIC
> [RED] 1 failed
> [SCN-006-006] cautiousDetection=124
> [SCN-006-006] earlyDetection=69
> [SCN-006-006] cautiousFalseAlarms=0
> [SCN-006-006] earlyFalseAlarms=2
> [SCN-006-006] cautiousMisses=0
> [SCN-006-006] earlyMisses=0
> [SCN-006-006] integrityEqual=true
> [SCN-006-006] fixtureRefetch=0
> [SCN-006-006] ownerReadPublished=false
>   1 passed
> ```
>
- [x] TP-02-07 Regression E2E evidence proves SCN-006-016 trend acceleration and unconfirmed change/regime families remain visible disagreement and cannot be averaged into confirmation.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** focused SCN-006-016 Playwright command from TP-02-07
> **Exit Codes:** RED 1; GREEN 0
> **Structured Evidence:** tool-log rows tagged `red,TP-02-07,SCN-006-016` and `green,TP-02-07,SCN-006-016`
> **Output:**
>
> ```text
> [RED] fixture path absent: #fixtureBand expected TEST FIXTURE - ANALYTIC
> [RED] 1 failed
> [SCN-006-016] agreement=mixed
> [SCN-006-016] trend=rising
> [SCN-006-016] dynamics=accelerating
> [SCN-006-016] change=mixed-unconfirmed
> [SCN-006-016] qualifyingChangeFamilies=1
> [SCN-006-016] requiredChangeFamilies=2
> [SCN-006-016] localStateVotes=1
> [SCN-006-016] confirmedRegimeChange=false
> [SCN-006-016] ownerReadPublished=false
>   1 passed
> ```
>
- [x] Broader E2E regression suite passes through TP-02-08 after all focused Scope 2 rows pass.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
> **Exit Code:** 0
> **Output:**
>
> ```text
> Running 9 tests using 1 worker
>   ✓ Regression: SCN-006-001 noisy sustained trend ignores sub-threshold residual wiggles
>   ✓ Regression: SCN-006-002 sustained uptrend reports accelerating dynamics separately
>   ✓ Regression: SCN-006-003 decelerating uptrend remains positive and exposes invalidation
>   ✓ Regression: SCN-006-006 early sensitivity changes risk metrics but preserves integrity gates
>   ✓ Regression: SCN-006-016 method-family disagreement remains mixed and unconfirmed
>   ✓ Regression: SCN-006-009 irregular sampling creates no invented observations
>   ✓ Regression: SCN-006-011 technology attention remains a lifecycle proxy not an oscillation
>   ✓ Regression: SCN-006-012 official political date remains uncertain calendar context
>   ✓ Regression: SCN-006-018 missing stale and incompatible inputs never become current or neutral
>   9 passed (4.7s)
> [tool-log] recorded exit=0 duration=5282ms
> ```
>

Build Quality Gate (Scope 2):

- [x] Scope 2 focused commands, path classification, artifact lint, freshness, traceability, G094, and unchanged Scope 1/browser baseline checks are recorded; every Scope 2 finding is fixed and rerun.

> **Phase:** implement
> **Claim Source:** executed
> **Commands:** regression-quality guard; implementation-reality scan; artifact lint; freshness guard; traceability guard; G094; source-lock validator; `git diff --check`
> **Exit Codes:** all 0
> **Output:**
>
> ```text
> REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
> [tdc-test-integrity] result=PASS
> [tdc-self-validation] result=PASS
> PASSED: No source code reality violations detected
> Artifact lint PASSED.
> RESULT: PASS (0 failures, 0 warnings)
> TRACEABILITY RESULT: PASSED (0 warnings)
> Scenarios checked: 20
> Test rows checked: 50
> capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
> [node-source-lock] actual=PASS
> [node-source-lock] OK adversarial=16 unexpectedAcceptances=0
> [scope2-completeness] result=PASS
> git diff --check: exit 0
> ```

---

## Scope 3: Season, Cycle, Context, And Association Engine

**Status:** In Progress

**Scope-Kind:** runtime-behavior

**Depends On:** Scope 1 - Deterministic Capability Foundation; Scope 2 - Trend, Dynamics, Change, And Sensitivity Engine

**Primary Outcome:** The M13-M18 registry and six typed cycle evaluators separate seasonal, quasi-periodic, lifecycle, regime, calendar, event, intervention, residual, and association evidence while enforcing break-first, repetition, multiplicity, mechanism/scope, stability, and held-out gates.

### Gherkin Scenarios - Scope 3

#### SCN-006-008 / BS-008 - Multiple seasonalities remain separate

```gherkin
Scenario: SCN-006-008 Multiple seasonalities remain separate
  Given a source-qualified regular series has enough complete weekly and annual repetitions
  When production harmonic, regular-spectrum, and stability methods evaluate it after break handling
  Then weekly and annual components retain separate strength, amplitude, phase, drift, repetition, and residual records and neither becomes trend
```

#### SCN-006-010 / BS-010 - Long-cycle history insufficiency is terminal for phase

```gherkin
Scenario: SCN-006-010 Long-cycle history insufficiency is terminal for phase
  Given a configured quasi-periodic cycle requires multiple complete repetitions and the selected series has less history
  When production cycle eligibility is evaluated
  Then the cycle is ineligible with exact duration and repetition shortfall and no phase, next-turn date, confidence, or neutral substitute exists
```

#### SCN-006-013 / BS-013 - Climate context stays geographically and seasonally scoped

```gherkin
Scenario: SCN-006-013 Climate context stays geographically and seasonally scoped
  Given an official ENSO state and a target-specific regional and seasonal mechanism record are source qualified
  When production climate context is evaluated
  Then source, phase, confidence, season, geography, mechanism, dispersion, and limitations are visible and no universal target effect is asserted
```

#### SCN-006-014 / BS-014 - Break evidence precedes periodicity

```gherkin
Scenario: SCN-006-014 Break evidence precedes periodicity
  Given a source definition change or intervention creates a persistent level shift
  When production periodicity and cycle activation are evaluated
  Then break evidence is shown first and unresolved contamination blocks or reduces periodic conclusions
```

#### SCN-006-015 / BS-015 - Multiple searches are corrected and held out

```gherkin
Scenario: SCN-006-015 Multiple searches are corrected and held out
  Given production evaluation scans multiple periods, transforms, lags, contexts, or regions
  When ranking and activation evidence are calculated
  Then exact search breadth, raw evidence, BH discovery, Holm activation, and frozen held-out results are visible and a failing in-sample winner is unsupported
```

#### SCN-006-017 / BS-017 - Lead-lag remains association

```gherkin
Scenario: SCN-006-017 Lead-lag remains association
  Given availability-safe target and context series show a lagged relationship and no independent mechanism is established
  When production lead-lag evaluation completes
  Then overlap, transform, lag search, effect, uncertainty, stability, regime dependence, held-out result, and search breadth are visible and the label remains association
```

### Implementation Plan - Scope 3

1. Implement M13 simultaneous robust harmonic decomposition with separate components/interventions/residual and frozen harmonic selection; expose full reconstruction and residual diagnostics.
2. Implement M14 ACF/Welch/harmonic significance for regular residuals, M15 generalized Lomb-Scargle for irregular observations without interpolation, and M16 rolling period/amplitude/phase stability with edge and resolution limits.
3. Implement M17 availability-safe lead/lag with frozen discovery lag and M18 non-overlapping event study with exact sign evidence; both remain association outputs.
4. Implement typed catalog dispatch for deterministic calendar, empirical seasonality, quasi-periodic oscillation, lifecycle, regime, and event. Type-incompatible fields are absent, not null-looking numeric substitutes.
5. Enforce break-first evaluation, complete repetitions/events/pairs, source mechanism/calendar, geography/population, BH/Holm, held-out improvement, nearby stability, and cycle activation. Unbound entries remain catalog-only/contextual/ineligible.
6. Add discriminating analytic fixtures for exact harmonic reconstruction, separate periods, irregular timestamps, rolling drift, break contamination, broad hypothesis grids, and frozen-lag confirmation. Add source-qualified historical records for official climate/calendar contexts with retrieval lineage and rights.
7. Extend Power cycle/context projections and focused browser tests so each state is visible with exact requirements/shortfalls and no type laundering.

### Change Boundary - Scope 3

**Allowed edits:** `trend-dynamics-cycle-lab.html`, `trend-dynamics-cycle-universe.json` only for evidence-bearing catalog entries that satisfy the existing schema, `scripts/validate-trend-dynamics-cycle.mjs`, the Feature 006 selftest group, the Feature 006 Playwright file, and Feature 006 fixtures.

**Explicitly excluded:** new cycle types, hidden catalog parameters, third-party analytical dependencies, network research code, shared JS owners, registries/docs, Feature 005, and existing tests. Catalog entries without real records cannot be upgraded by prose.

**Rollback:** remove Scope 3 methods/evaluators/render sections and exact catalog/fixture records while retaining the complete Scope 1-2 result contract and method ids.

### Consumer Impact Sweep - Scope 3

**Contract consumers:** M13-M18 and `CycleEligibilityV1` are consumed by the page's Simple context projection, Power cycle/context projections, source audit, complete `AnalysisResultV1`, validator, selftest extraction group, analytic/source-qualified fixtures, and scenario-specific browser tests. Type-incompatible fields that are absent by contract must remain absent for every consumer rather than being renamed, replaced, or emitted as neutral values.

**Navigation, breadcrumbs, redirects, and deep links:** Scope 3 changes no route, navigation entry, breadcrumb, redirect, or deep-link identity. The owning route and request fields remain byte-compatible; stale-reference scans must still confirm that no Scope 3 contract name or catalog id leaks into an unrelated navigation or link target.

**API clients and generated clients:** Research Lab exposes no application API and has no generated client for this feature. The browser-local result, fixture, and validator consumers listed above are the complete first-party contract surface and must remain synchronized.

**Docs, config, and tests:** `design.md` remains the design authority and is read-only during implementation; the existing closed universe config may gain only evidence-bearing records allowed by this scope; validator, selftest, fixture, and Playwright references must resolve the same method ids, cycle types, catalog ids, fields, and omission rules with zero stale references.

### Test Plan - Scope 3

Scenario-first TDD is mandatory for every row: capture focused red evidence before its production behavior exists or after a controlled break, then capture green evidence with the same command and assertion identity after implementation.

| Test Type | ID | Category | Scenario | File / Location | Exact behavior / title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unit | TP-03-01 | unit | SCN-006-008, 010, 013, 014, 015, 017 | `scripts/selftest.mjs` | Extract M13-M18/cycle evaluator; prove reconstruction, regular/irregular eligibility, no interpolation, drift, break-first, correction, held-out, and association invariants | `node scripts/selftest.mjs` | No |
| Contract validator | TP-03-02 | functional | SCN-006-008, 010, 013, 014, 015, 017 | `scripts/validate-trend-dynamics-cycle.mjs` | Validate all ten catalog domains, six types, source records, type-specific omissions, search keys, correction policy, and source-qualified historical fixtures | `node scripts/validate-trend-dynamics-cycle.mjs` | No |
| Regression E2E | TP-03-03 | e2e-ui | SCN-006-008 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-008 weekly and annual components remain separate from trend` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-008 weekly and annual components remain separate from trend" --reporter=list` | Yes |
| Regression E2E | TP-03-04 | e2e-ui | SCN-006-010 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-010 insufficient long-cycle history yields no phase or next turn` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-010 insufficient long-cycle history yields no phase or next turn" --reporter=list` | Yes |
| Regression E2E | TP-03-05 | e2e-ui | SCN-006-013 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-013 ENSO context stays scoped to source season geography and mechanism` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-013 ENSO context stays scoped to source season geography and mechanism" --reporter=list` | Yes |
| Regression E2E | TP-03-06 | e2e-ui | SCN-006-014 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-014 structural break blocks contaminated cycle activation` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-014 structural break blocks contaminated cycle activation" --reporter=list` | Yes |
| Regression E2E | TP-03-07 | e2e-ui | SCN-006-015 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-015 period and lag scans expose correction and reject in-sample winners` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-015 period and lag scans expose correction and reject in-sample winners" --reporter=list` | Yes |
| Regression E2E | TP-03-08 | e2e-ui | SCN-006-017 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-017 lead-lag evidence remains association without a mechanism` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-017 lead-lag evidence remains association without a mechanism" --reporter=list` | Yes |
| Regression E2E | TP-03-09 | e2e-ui | SCN-006-008, 010, 013, 014, 015, 017 | `tests/trend-dynamics-cycle-lab.spec.mjs` | Complete Scope 1-3 browser matrix | Exact `TDC-E2E-FULL` command above | Yes |

### Definition of Done - Scope 3

Core Delivery Items (Scope 3):

- [x] M13-M18 and `tdcEvaluateCycle` implement the exact designed algorithms, assumptions, search accounting, endpoint limitations, and typed outputs with no interpolation, causal promotion, or invented p-value.
  > **Phase:** implement
  > **Command:** `node scripts/validate-trend-dynamics-cycle.mjs`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green,TP-03-02,consumer-sweep,stale-reference,final-candidate`
  >
  > ```text
  > [tdc-validator] scope3-methods=PASS count=6 ids=M13,M14,M15,M16,M17,M18
  > [tdc-validator] scope3-cycle-types=PASS deterministic-calendar,empirical-seasonality,quasi-periodic-oscillation,lifecycle,regime,event
  > [tdc-validator] scope3-residual-audit=PASS periods=7,365 intervention=5.000000 max-error=2.415845e-13 residual-variance=4.588892e-27
  > [tdc-validator] scope3-irregular-audit=PASS observations=96 interpolation=false aliases=3
  > [tdc-validator] scope3-rolling-audit=PASS windows=8 first-period=26 last-period=34 edge-windows=2
  > [tdc-validator] scope3-event-audit=PASS events=8 overlaps=0 exact-sign-p=0.00781250
  > [tdc-validator] scope3-break-first=PASS activation=false candidate-visible=true
  > [tdc-validator] scope3-multiplicity=PASS breadth=29 discovery=benjamini-hochberg activation=holm held-out=0.000073 frozen=true supported=false
  > [tdc-validator] scope3-association=PASS discovery-lag=3 confirmation-lag=3 causal-promotion=false
  > [tdc-validator] OK
  > ```
  >
- [x] Every configured cycle entry retains one immutable type and complete authority/mechanism/scope/history/confounder/evidence/invalidation metadata across enable, disable, filter, compare, and evaluation.
  > **Phase:** implement
  > **Command:** `node scripts/validate-trend-dynamics-cycle.mjs`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `microfix-green,TP-03-02,catalog-immutability,catalog-repetitions`
  >
  > ```text
  > [tdc-validator] config=PASS version=tdc-config/v1
  > [tdc-validator] methods=PASS count=18
  > [tdc-validator] cycle-domains=PASS count=10
  > [tdc-validator] cycle-types=PASS count=6
  > [tdc-validator] lifecycle=PASS period=omitted phase=omitted
  > [tdc-validator] political-calendar=PASS effect=uncertain turnSignal=false
  > [tdc-validator] climate-context=PASS state=El-Nino-Advisory season=winter geography=southern-tier universal-effect=false
  > [tdc-validator] scope3-cycle-types=PASS deterministic-calendar,empirical-seasonality,quasi-periodic-oscillation,lifecycle,regime,event
  > [tdc-validator] scope3-catalog-immutability=PASS entries=10 views=enabled,disabled,filtered,compare metadata=type,domain,source,mechanism,scope,evidence-tier,invalidation
  > [tdc-validator] OK
  > ```
  >
- [x] Break-first, repetition, effect, stability, correction, held-out, mechanism, and scope gates are independently visible; a summary score cannot override any failed component.
  > **Phase:** implement
  > **Command:** `node scripts/validate-trend-dynamics-cycle.mjs`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green,TP-03-02,residual-audit,multiplicity-audit,Scope-3`
  >
  > ```text
  > [tdc-validator] multiplicity=PASS methods=benjamini-hochberg,holm
  > [tdc-validator] scope2-determinism=PASS repeats=100 timings-excluded=true
  > [tdc-validator] scope3-catalog-immutability=PASS entries=10 views=enabled,disabled,filtered,compare metadata=type,domain,source,mechanism,scope,evidence-tier,invalidation
  > [tdc-validator] scope3-residual-audit=PASS periods=7,365 intervention=5.000000 max-error=2.415845e-13 residual-variance=4.588892e-27
  > [tdc-validator] scope3-rolling-audit=PASS windows=8 first-period=26 last-period=34 edge-windows=2
  > [tdc-validator] scope3-break-first=PASS activation=false candidate-visible=true
  > [tdc-validator] scope3-multiplicity=PASS breadth=29 discovery=benjamini-hochberg activation=holm held-out=0.000073 frozen=true supported=false
  > [tdc-validator] scope3-association=PASS discovery-lag=3 confirmation-lag=3 causal-promotion=false
  > [tdc-validator] scope3-stale-reference-sweep=PASS heldout-key=heldOutMinimumGain reconstruction-key=maxAbsoluteError nav-targets=unchanged
  > [tdc-validator] OK
  > ```
  >
- [x] Scope 3 fixture, source, and catalog changes remain inside the declared boundary and do not modify shared analytical owners or unrelated dirty work.
  > **Phase:** implement
  > **Commands:** `shasum -a 256 trend-dynamics-cycle-lab.html tests/fixtures/trend-dynamics-cycle/analytic/trend-engine-inputs.json tests/fixtures/trend-dynamics-cycle/analytic/cycle-engine-inputs.json tests/fixtures/trend-dynamics-cycle/source-qualified/climate-context.json scripts/validate-trend-dynamics-cycle.mjs tests/trend-dynamics-cycle-lab.spec.mjs`; scoped `git status --short --untracked-files=all -- ...`
  > **Exit Codes:** 0; 0
  > **Claim Source:** executed
  > **Evidence Tags:** `authoritative-bytes,containment,final-candidate`; `path-classification,change-boundary,final-candidate`
  >
  > ```text
  > a9a74b759fcf3e82644a96f0483010adbec831497746d2e3564adee532e80e81  trend-dynamics-cycle-lab.html
  > e42311daf9493f4126260895d3d732369e5fa4e624d34e67e745cd5a76758df6  tests/fixtures/trend-dynamics-cycle/analytic/trend-engine-inputs.json
  > 39413b8c1222ca7ab71f94a8f8ad02b4a9f3d542b9be8dd9261120af7c2fd71a  tests/fixtures/trend-dynamics-cycle/analytic/cycle-engine-inputs.json
  > 2ac0c6d44bc3977e4a2b7fe72b0c78e39aabe494b49f0f311fb67a9662915be9  tests/fixtures/trend-dynamics-cycle/source-qualified/climate-context.json
  > 4bc04a53a824b1095602e9de6bf8f0870b909050a8dc9d896f1aef5dde422735  scripts/validate-trend-dynamics-cycle.mjs
  > 93578d5b70b717e17682abeb9ac7ee3581003c10a67eb02359a5e67cc8eb1ef9  tests/trend-dynamics-cycle-lab.spec.mjs
  > M scripts/selftest.mjs
  > ?? scripts/validate-trend-dynamics-cycle.mjs
  > ?? tests/fixtures/trend-dynamics-cycle/analytic/cycle-engine-inputs.json
  > ?? tests/fixtures/trend-dynamics-cycle/source-qualified/climate-context.json
  > ?? tests/trend-dynamics-cycle-lab.spec.mjs
  > ?? trend-dynamics-cycle-lab.html
  > ```
  >
- [x] The consumer impact sweep is complete and zero stale first-party references remain across navigation, breadcrumbs, redirects, API clients, generated clients, deep links, docs, config, projections, validators, fixtures, and tests.
  > **Phase:** implement
  > **Command:** `node scripts/validate-trend-dynamics-cycle.mjs`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green,TP-03-02,consumer-sweep,stale-reference,final-candidate`
  >
  > ```text
  > [tdc-validator] source-cache-canaries=PASS shared-owners-untouched
  > [tdc-validator] scope3-methods=PASS count=6 ids=M13,M14,M15,M16,M17,M18
  > [tdc-validator] scope3-cycle-types=PASS deterministic-calendar,empirical-seasonality,quasi-periodic-oscillation,lifecycle,regime,event
  > [tdc-validator] scope3-catalog-immutability=PASS entries=10 views=enabled,disabled,filtered,compare metadata=type,domain,source,mechanism,scope,evidence-tier,invalidation
  > [tdc-validator] scope3-irregular-audit=PASS observations=96 interpolation=false aliases=3
  > [tdc-validator] scope3-break-first=PASS activation=false candidate-visible=true
  > [tdc-validator] scope3-multiplicity=PASS breadth=29 discovery=benjamini-hochberg activation=holm held-out=0.000073 frozen=true supported=false
  > [tdc-validator] scope3-association=PASS discovery-lag=3 confirmation-lag=3 causal-promotion=false
  > [tdc-validator] scope3-consumer-sweep=PASS page-functions=8 selftest-marker=Feature-006 browser-titles=6 fixture-routes=2
  > [tdc-validator] scope3-stale-reference-sweep=PASS heldout-key=heldOutMinimumGain reconstruction-key=maxAbsoluteError nav-targets=unchanged
  > [tdc-validator] OK
  > ```
  >

Test Evidence Items (Scope 3; Exact Parity With 9 Test Plan Rows):

- [ ] TP-03-01 focused red then green unit evidence proves every M13-M18 formula, eligibility, break, correction, held-out, and association assertion.
  > **Phase:** implement
  > **Command:** `node scripts/selftest.mjs`
  > **Exit Code:** 1
  > **Claim Source:** executed
  > **Evidence Tags:** `green-attempt,TP-03-01,repository-selftest,final-candidate`
  >
  > ```text
  > Feature 006 Trend Dynamics deterministic capability foundation
  >   ✓ Trend Dynamics M13 preserves full reconstruction and residual diagnostics
  >   ✓ Trend Dynamics M14 computes regular ACF, Welch power, and finite harmonic significance without interpolation
  >   ✓ Trend Dynamics M15 uses generalized Lomb-Scargle on original irregular timestamps with no invented observations
  >   ✓ Trend Dynamics M16 exposes rolling period, amplitude, phase, drift, resolution, and edge limits
  >   ✓ Trend Dynamics M17 selects a discovery lag once, confirms that frozen lag on held-out availability-safe pairs, and remains association
  >   ✓ Trend Dynamics M18 preserves eight non-overlapping events, distribution diagnostics, and exact two-sided sign evidence
  >   ✓ Trend Dynamics typed cycle dispatch emits exactly type-compatible fields for all six cycle types
  > market brief — registry-wide coverage + action-only payload contract
  >   ✗ FAIL: current payload satisfies the executable brief contract: nextSession.sessionDate must match snapshot.nextSessionDate
  > Feature 009 Scope 1 cache-owned MSFT market truth
  >   ✓ Feature 009 quote validator accepts the actual cache value and exact quote clocks
  > Research-Lab self-test: 491 passed, 1 failed
  > [tool-log] recorded exit=1
  > ```
  >
  > **Uncertainty Declaration**
  > **What was attempted:** The exact TP-03-01 command ran repeatedly after the Scope 3 repairs.
  > **What was observed:** Every Scope 3 assertion and the concurrent Feature 009 group passed, but the aggregate command exited 1 on the Market Brief next-session mismatch.
  > **Why this is uncertain:** TP-03-01 requires the exact repository command to be green; a green Feature 006 subsection cannot substitute for exit 0.
  > **What would resolve this:** The exact `node scripts/selftest.mjs` command exits 0 with the Market Brief payload mismatch absent.
- [x] TP-03-02 focused red then green validator evidence proves ten-domain/six-type catalog completeness and source-qualified fixture contracts.
  > **Phase:** implement
  > **Command:** `node scripts/validate-trend-dynamics-cycle.mjs`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green,TP-03-02,consumer-sweep,stale-reference,final-candidate`
  >
  > ```text
  > [tdc-validator] production-functions=62
  > [tdc-validator] config=PASS version=tdc-config/v1
  > [tdc-validator] methods=PASS count=18
  > [tdc-validator] cycle-domains=PASS count=10
  > [tdc-validator] cycle-types=PASS count=6
  > [tdc-validator] source-qualified-fixtures=PASS count=3
  > [tdc-validator] cycle-fixture=PASS cases=8 expected-output-fields=0 publication=false
  > [tdc-validator] scope3-catalog-immutability=PASS entries=10 views=enabled,disabled,filtered,compare metadata=type,domain,source,mechanism,scope,evidence-tier,invalidation
  > [tdc-validator] scope3-consumer-sweep=PASS page-functions=8 selftest-marker=Feature-006 browser-titles=6 fixture-routes=2
  > [tdc-validator] scope3-stale-reference-sweep=PASS heldout-key=heldOutMinimumGain reconstruction-key=maxAbsoluteError nav-targets=unchanged
  > [tdc-validator] OK
  > ```
  >
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior prove SCN-006-008 Multiple seasonalities remain separate: weekly and annual components retain separate strength, amplitude, phase, drift, repetition, and residual records and neither becomes trend through TP-03-03.
  > **Phase:** implement
  > **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-008 weekly and annual components remain separate from trend" --reporter=list`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green,TP-03-03,SCN-006-008,e2e-ui`
  >
  > ```text
  > [SCN-006-008] periods=7,365
  > [SCN-006-008] strengths=1.000000,1.000000
  > [SCN-006-008] amplitudes=3.000000,8.000000
  > [SCN-006-008] phases=-1.270796,-0.770796
  > [SCN-006-008] repetitions=156.429,3.000
  > [SCN-006-008] drift=not-estimated-by-static-decomposition,not-estimated-by-static-decomposition
  > [SCN-006-008] intervention=definition-step:5.000000
  > [SCN-006-008] reconstructionMaxError=2.415845e-13
  > [SCN-006-008] residualVariance=4.576193e-27
  > [SCN-006-008] interpolationApplied=false
  > 1 passed (5.0s)
  > ```
  >
- [x] TP-03-04 Regression E2E evidence proves SCN-006-010 insufficient long-cycle history exposes exact duration/repetition shortfall and no phase, next-turn date, confidence, or neutral substitute.
  > **Phase:** implement
  > **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-010 insufficient long-cycle history yields no phase or next turn" --reporter=list`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `microfix-green,TP-03-04,SCN-006-010,catalog-repetitions`
  >
  > ```text
  > Running 1 test using 1 worker
  > [SCN-006-010] state=ineligible
  > [SCN-006-010] durationRequired=720
  > [SCN-006-010] durationObserved=240
  > [SCN-006-010] durationShortfall=480
  > [SCN-006-010] repetitionsRequired=4
  > [SCN-006-010] repetitionsObserved=1.333333
  > [SCN-006-010] phase=omitted nextTurnDate=omitted confidence=omitted
  > 1 passed (3.8s)
  > [tool-log] recorded exit=0
  > ```
  >
- [x] TP-03-05 Regression E2E evidence proves SCN-006-013 Climate context stays geographically and seasonally scoped: official ENSO source, phase, confidence, season, geography, mechanism, dispersion, and limitations remain visible with no universal target effect.
  > **Phase:** implement
  > **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-013 ENSO context stays scoped to source season geography and mechanism" --reporter=list`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green,TP-03-05,SCN-006-013,e2e-ui`
  >
  > ```text
  > Running 1 test using 1 worker
  > [SCN-006-013] authority=NOAA Climate.gov
  > [SCN-006-013] phase=El Nino
  > [SCN-006-013] confidence=0.84
  > [SCN-006-013] season=Northern Hemisphere winter 2023-24
  > [SCN-006-013] geography=southern tier of the United States
  > [SCN-006-013] dispersion=material
  > [SCN-006-013] universalTargetEffect=false
  > 1 passed (3.6s)
  > [tool-log] recorded exit=0
  > ```
  >
- [x] TP-03-06 Regression E2E evidence proves SCN-006-014 source-definition/intervention break evidence leads and blocks or reduces contaminated periodic conclusions.
  > **Phase:** implement
  > **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-014 structural break blocks contaminated cycle activation" --reporter=list`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green-attempt,TP-03-06,SCN-006-014,e2e-ui`
  >
  > ```text
  > Running 1 test using 1 worker
  > [SCN-006-014] breakOrder=1
  > [SCN-006-014] breakIndex=180
  > [SCN-006-014] contaminated=true
  > [SCN-006-014] candidatePower=147.356459
  > [SCN-006-014] cycleState=unresolved
  > [SCN-006-014] activation=false
  > [SCN-006-014] firstGate=break-clear:false
  > 1 passed (966ms)
  > [tool-log] recorded exit=0
  > ```
  >
- [x] TP-03-07 Regression E2E evidence proves SCN-006-015 exact search breadth, raw evidence, BH discovery, Holm activation, frozen held-out evidence, and unsupported in-sample failure.
  > **Phase:** implement
  > **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-015 period and lag scans expose correction and reject in-sample winners" --reporter=list`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green-attempt,TP-03-07,SCN-006-015,e2e-ui`
  >
  > ```text
  > Running 1 test using 1 worker
  > [SCN-006-015] searchBreadth=29
  > [SCN-006-015] rawP=0.000000e+0
  > [SCN-006-015] bh=0.000000e+0
  > [SCN-006-015] holm=0.000000e+0
  > [SCN-006-015] heldOutImprovement=0.000073
  > [SCN-006-015] frozen=true
  > [SCN-006-015] supported=false
  > 1 passed (2.3s)
  > [tool-log] recorded exit=0
  > ```
  >
- [x] TP-03-08 Regression E2E evidence proves SCN-006-017 availability-safe lead/lag exposes overlap, transform, lag range, effect, uncertainty, stability, regime, held-out result, and remains association without a mechanism.
  > **Phase:** implement
  > **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-017 lead-lag evidence remains association without a mechanism" --reporter=list`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green-attempt,TP-03-08,SCN-006-017,e2e-ui`
  >
  > ```text
  > [SCN-006-017] overlap=177
  > [SCN-006-017] transform=level
  > [SCN-006-017] lagRange=-6..6
  > [SCN-006-017] discoveryLag=3
  > [SCN-006-017] discoveryEffect=0.998509
  > [SCN-006-017] heldOutEffect=0.998503
  > [SCN-006-017] nearbyStability=1.000000
  > [SCN-006-017] label=association mechanismEstablished=false
  > 1 passed (2.3s)
  > [tool-log] recorded exit=0
  > ```
  >
- [x] Broader E2E regression suite passes through TP-03-09 after all focused Scope 3 rows pass.
  > **Phase:** implement
  > **Command:** `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence Tags:** `green,TP-03-09,Scope-1-3,e2e-ui,post-catalog-fix`
  >
  > ```text
  > Running 15 tests using 1 worker
  > [SCN-006-001] direction=rising
  > [SCN-006-001] lifecycle=sustained
  > [SCN-006-006] integrityEqual=true
  > [SCN-006-009] interpolationApplied=false
  > [SCN-006-011] phase=omitted
  > [SCN-006-012] turnSignal=false
  > [SCN-006-018] confidence=omitted
  > [SCN-006-008] periods=7,365
  > [SCN-006-010] durationShortfall=480
  > [SCN-006-013] universalTargetEffect=false
  > [SCN-006-014] firstGate=break-clear:false
  > [SCN-006-015] supported=false
  > [SCN-006-017] label=association mechanismEstablished=false
  > 15 passed (7.0s)
  > ```
  >

Build Quality Gate (Scope 3):

- [ ] Scope 3 focused commands, path classification, artifact lint, freshness, traceability, G094, residual/multiplicity audits, and unchanged Scope 1-2 checks are recorded; every Scope 3 finding is fixed and rerun.
  > **Phase:** implement
  > **Command:** canonical Scope 3 quality matrix plus `node scripts/selftest.mjs`
  > **Exit Code:** 1 (repository selftest); all Scope 3-focused and governance child commands exited 0
  > **Claim Source:** executed
  >
  > ```text
  > Version 1.61.1
  > [node-source-lock] OK adversarial=16 unexpectedAcceptances=0
  > OK page=trend-dynamics-cycle-lab.html inline=1 refs=4
  > REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  > [tdc-test-integrity] result=PASS
  > [tdc-self-validation] result=PASS
  > SCOPE3_GOVERNANCE reality=0 artifact=0 freshness=0 traceability=0 G094=0
  > [tdc-consumer-sweep] page-functions-exactly-once=PASS
  > [tdc-consumer-sweep] scope3-selftest-marker-contained=PASS
  > [tdc-consumer-sweep] fixture-route-consumers=PASS
  > [tdc-consumer-sweep] authoritative-scope2-fixture-preserved=PASS
  > [tdc-consumer-sweep] result=PASS
  > Market Brief contract: nextSession.sessionDate must match snapshot.nextSessionDate
  > Feature 009 quote/bar/cache ownership checks=PASS
  > Research-Lab self-test: 491 passed, 1 failed
  > [tool-log] recorded exit=1
  > ```
  >
  > **Uncertainty Declaration**
  > **What was attempted:** Every required focused, regression, integrity, consumer, source-lock, reality, artifact, freshness, traceability, G094, diff, and diagnostics check ran; the exact repository selftest also ran.
  > **What was observed:** Scope 3 checks and the concurrent Feature 009 group passed, while the repository selftest retained the Market Brief payload mismatch. The corrected current-session consumer sweep emitted `[tdc-consumer-sweep] result=PASS`.
  > **Why this is uncertain:** The grouped item requires the unchanged repository check to be clean, and its exact command is not clean.
  > **What would resolve this:** The exact `node scripts/selftest.mjs` command exits 0 with the Market Brief payload mismatch absent, followed by the same focused governance matrix with no new failure.

---

## Scope 4: Complete Simple/Power Experience, Registration, And Publication

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Depends On:** Scope 1 - Deterministic Capability Foundation; Scope 2 - Trend, Dynamics, Change, And Sensitivity Engine; Scope 3 - Season, Cycle, Context, And Association Engine

**Primary Outcome:** The production route renders every designed Simple/Power screen from one immutable result, preserves focus and truth across local controls and modes, registers atomically, documents methodology, and publishes one strict owner read without recomputing in any consumer.

### Gherkin Scenarios - Scope 4

#### SCN-006-019 / BS-019 - Simple and Power share one result

```gherkin
Scenario: SCN-006-019 Simple and Power share one result
  Given one valid selected series and one resolved request and complete result
  When the user switches Simple and Power or changes any governed local control
  Then both views retain one result id, request digest, truth state, trend, dynamics, turn, cycle relevance, focus context, and parameters and unchanged source data are not refetched
```

#### SCN-006-020 / BS-020 - Owner read preserves uncertainty

```gherkin
Scenario: SCN-006-020 Owner read preserves uncertainty
  Given the owning result is mixed, stale, degraded, or unavailable
  When the page publishes and a registry consumer reads the versioned owner envelope
  Then the same truth, caveat, omitted invalid fields, and deep link remain and the consumer cannot fill evidence, upgrade confidence, or recalculate the verdict
```

### UI Scenario Matrix - Scope 4

| Surface | Preconditions | Steps | User-visible assertions | Regression E2E |
| --- | --- | --- | --- | --- |
| Simple Decision Cockpit | Complete current, stale, degraded, and unavailable results | Open route; change series/transform/horizon/profile/threshold; inspect evidence/change/context | Separate trend/strength/dynamics/change, provenance, support/contradiction, invalidation, truth, local no-refetch recompute | SCN-006-019, SCN-006-020 |
| Power Evidence And Stability | Same result as Simple | Switch mode with keyboard; expand families; select frontier/stability cells | Identical result id/digest, family internals, matrix/table parity, preserved focus/control state | SCN-006-019 |
| Power Change Replay Entry | Current turning record exists | Open from Simple change record | Same candidate/request/cutoff and distinct effective/detected/retrospective labels | SCN-006-019; complete replay in Scope 5 |
| Power Cycles And Context | Eligible/ineligible cycle and context records exist | Navigate section index; filter/compare entries; inspect lag table | Separate type fields, exact shortfalls, safe labels, adjusted evidence, no causal wording | SCN-006-019 |
| Source Audit And Owner Read | Current/stale/degraded/unavailable source states | Inspect observation/analysis record; copy deep link | Full source/vintage/transform/method/search audit, strict omission, safe public link | SCN-006-020 |
| Responsive and accessible route | 390x844 and 1440x1000; keyboard; 130% root text | Traverse shell/mode/controls/charts/tables/popovers; inspect canvas pixels and overflow | No body overflow/overlap, nonblank synchronous charts, table equivalence, concise live regions, no color/hover-only state | SCN-006-019 |
| Registration and central credentials | Tool registered; credential present/absent centrally | Navigate from index/rlnav; open data settings link | Exact route/note/data registry parity; no credential field or tool-local secret storage | SCN-006-020 |

### Implementation Plan - Scope 4

1. Complete the page component tree and all six designed screens using one frozen `AnalysisResultV1`; render text/tables first, draw visible canvases synchronously, attach `RLCHART`, then publish only after every renderer succeeds.
2. Implement all controls, closed truth/state vocabularies, rich focus/tap explanations, live regions, mode and section navigation, keyboard chart traversal, table parity, safe text/URL rendering, shared ticker links, responsive layout, and visible educational/no-guarantee notices.
3. Implement `tdcBuildViewModel` and `tdcBuildToolRead`; preserve top-level source availability and nested analytical truth, omit invalid numerics, publish atomically through `RLDATA.putToolRead`, and surface publication failure without changing the result.
4. Add one exact entry to `tools.json`, `index.html`, and `rlnav.js` together, using tool id `trend-dynamics-cycle-lab`, route `trend-dynamics-cycle-lab.html`, data `trend-dynamics-cycle-universe.json`, and note `notes/trend-dynamics-cycle-lab.md`.
5. Add `notes/trend-dynamics-cycle-lab.md` with formulas, source/vintage posture, M01-M18 assumptions/eligibility/failures, cycle taxonomy, multiplicity/held-out policy, fixtures-versus-live evidence, controls, owner read, accessibility, and exact run handoff.
6. Extend the validator, selftest registry canary, and browser suite for route/note/data parity, one-result mode/control behavior, owner-read omission/truth, hostile labels, central credential boundary, synchronous canvas pixels, keyboard, announcements, and responsive containment.

### Consumer Impact Sweep, Change Boundary, And Rollback - Scope 4

**New consumers:** `tools.json`, `index.html`, and `rlnav.js` receive the additive route identity; the existing `RLDATA.toolReads` registry receives `tdc-tool-read/v1`; deep links return to the owning route. No existing route, id, path, contract, breadcrumb, redirect, or generated client is renamed or removed.

**Stale-reference search surfaces:** registry ids/order, route filename, config filename, note path, owner-read id/version/deep link, index card, shared nav entry, tests, and methodology references. Every occurrence must resolve to the same identity.

**Allowed edits:** Feature 006 page/config/validator/selftest/tests/fixtures; additive exact hunks in `tools.json`, `index.html`, `rlnav.js`; new `notes/trend-dynamics-cycle-lab.md`.

**Explicitly excluded:** `rldata.js`, `rlapp.js`, `rlchart.js`, `rlticker.js`, `rlg.js`, `rlbrief.js`, `market-brief.html`, Market Brief payload/config/calculations, README/docs indexes not named by design, Feature 005, and every unrelated dirty path. Existing registry entries may not be reordered or reformatted.

**Shared-file discipline:** capture a path-scoped diff and exact pre-edit hunk for each dirty shared file; apply only one feature-owned additive hunk; independently rerun registry and provider-credential canaries.

**Rollback:** remove the three exact registry entries and the new note, then remove only Scope 4 page/test blocks. Preserve all pre-existing dirty content and leave Scopes 1-3 executable.

### Test Plan - Scope 4

Scenario-first TDD is mandatory for every row: capture focused red evidence before its production behavior exists or after a controlled break, then capture green evidence with the same command and assertion identity after implementation.

| Test Type | ID | Category | Scenario | File / Location | Exact behavior / title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unit | TP-04-01 | unit | SCN-006-019, 020 | `scripts/selftest.mjs` | Extract view-model/tool-read functions; prove one-result identity, truth precedence, omission, safe text, deep-link allowlist, registry parity, and unchanged shared reads | `node scripts/selftest.mjs` | No |
| Contract validator | TP-04-02 | functional | SCN-006-019, 020 | `scripts/validate-trend-dynamics-cycle.mjs` | Validate complete page/config/note/registry identity, all design symbols, owner contract, fixture posture, and static source references | `node scripts/validate-trend-dynamics-cycle.mjs` | No |
| Page integrity | TP-04-03 | functional | SCN-006-019 | `trend-dynamics-cycle-lab.html` | Parse every inline script and require every literal ID reference | Exact `TDC-PAGE-INLINE-ID` command above | No |
| Regression E2E | TP-04-04 | e2e-ui | SCN-006-019 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-019 Simple Power mobile and local controls share one result without refetch` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-019 Simple Power mobile and local controls share one result without refetch" --reporter=list` | Yes |
| Regression E2E | TP-04-05 | e2e-ui | SCN-006-020 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-020 owner read preserves mixed stale degraded and unavailable truth` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-020 owner read preserves mixed stale degraded and unavailable truth" --reporter=list` | Yes |
| Regression E2E | TP-04-06 | e2e-ui | SCN-006-019 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-019 charts controls focus and 390px layout remain accessible and equivalent` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-019 charts controls focus and 390px layout remain accessible and equivalent" --reporter=list` | Yes |
| Regression E2E | TP-04-07 | e2e-ui | SCN-006-020 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-020 registration navigation and owner publication stay in parity` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-020 registration navigation and owner publication stay in parity" --reporter=list` | Yes |
| Integration browser | TP-04-08 | e2e-ui | SCN-006-020 | `tests/provider-credentials.spec.mjs` | Existing central credential/settings boundary remains green after route registration | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Regression E2E | TP-04-09 | e2e-ui | SCN-006-001 through 020 except replay-only transitions | `tests/trend-dynamics-cycle-lab.spec.mjs` | Complete Scope 1-4 browser suite | Exact `TDC-E2E-FULL` command above | Yes |

### Definition of Done - Scope 4

Core Delivery Items (Scope 4):

- [ ] Every specified Simple/Power screen, truth state, control, chart/table, explanation, focus/announcement path, responsive rule, source audit, and educational/privacy boundary renders from one complete result with no second calculation.
- [ ] Registration is atomic and identity-equal across `tools.json`, `index.html`, `rlnav.js`, page, config, note, owner read, deep link, and tests; no existing entry is reordered or changed.
- [ ] The owner read preserves source availability and analytical truth, omits invalid values, exposes caveats, and cannot be published from an invalid edit, partial run, canceled run, or render failure.
- [ ] The consumer impact sweep is complete and zero stale first-party references remain across navigation, breadcrumbs, redirects, API clients, generated clients, deep links, route/config/note identities, docs, and tests; dirty-file hunk discipline, the central credential boundary, exact rollback, and zero Feature 005/excluded edits are proven.

Test Evidence Items (Scope 4; Exact Parity With 9 Test Plan Rows):

- [ ] TP-04-01 focused red then green unit evidence proves view-model, owner-read, registry, safe-text, and shared-read invariants.
- [ ] TP-04-02 focused red then green validator evidence proves page/config/note/registry/symbol/publication contracts.
- [ ] TP-04-03 focused red then green evidence proves inline script syntax and ID integrity.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass for SCN-006-019 through TP-04-04.
- [ ] TP-04-05 Regression E2E evidence proves SCN-006-020 the owner read preserves mixed, stale, degraded, or unavailable truth, caveat, invalid-field omission, deep link, and no consumer recalculation or upgrade.
- [ ] TP-04-06 Regression E2E evidence proves keyboard, focus, announcements, synchronous nonblank canvas/table parity, 130% text, and 390/1440 containment.
- [ ] TP-04-07 Regression E2E evidence proves route/note/data/navigation and owner-publication identity.
- [ ] TP-04-08 integration browser evidence proves the existing central credential/settings suite remains green.
- [ ] Broader E2E regression suite passes through TP-04-09 after all focused Scope 4 rows pass.

Build Quality Gate (Scope 4):

- [ ] Scope 4 focused commands, path/hunk classification, consumer stale-reference audit, artifact lint, freshness, traceability, G094, and unchanged existing registry/credential canaries are recorded; every Scope 4 finding is fixed and rerun.

---

## Scope 5: As-Of Replay, Progress, And Regression Closure

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Depends On:** Scope 1 - Deterministic Capability Foundation; Scope 2 - Trend, Dynamics, Change, And Sensitivity Engine; Scope 3 - Season, Cycle, Context, And Association Engine; Scope 4 - Complete Simple/Power Experience, Registration, And Publication

**Primary Outcome:** The complete route proves what was knowable at each availability cutoff, retains false alarms and revisions immutably, compares real-time and retrospective anatomy without backdating, stays responsive under maximum configured work, and introduces no regression relative to the recorded pre-change baseline.

### Gherkin Scenarios - Scope 5

#### SCN-006-004 / BS-004 - Provisional peak records every clock

```gherkin
Scenario: SCN-006-004 Provisional peak records every clock
  Given an online detector raises a source-qualified peak candidate and an independent family later confirms it
  When the production replay advances through actual availability cutoffs
  Then the record remains provisional before confirmation and separately shows estimated effective, first detection, confirmation, and delay times
```

#### SCN-006-005 / BS-005 - Failed early reversal remains immutable

```gherkin
Scenario: SCN-006-005 Failed early reversal remains immutable
  Given early sensitivity raises a reversal candidate and later observations restore the prior trend before confirmation
  When the production history reevaluates the candidate
  Then the original cutoff, parameters, alert time, and record remain immutable and an appended revision marks it invalidated with a false-alarm outcome
```

#### SCN-006-007 / BS-007 - Retrospective anatomy cannot claim foresight

```gherkin
Scenario: SCN-006-007 Retrospective anatomy cannot claim foresight
  Given a two-sided final estimate dates a turn before the one-sided production detector first alerted
  When the user compares replay and retrospective views
  Then both dates and endpoint postures remain separate and early-warning history uses only the real-time detection date with explicit endpoint revision and delay
```

### Implementation Plan - Scope 5

1. Implement `tdcWalkForward`, actual availability-cutoff replay, latest-vintage selection by cutoff, online first-transition detection, retrospective-only anatomy, frozen discovery/confirmation partitions, target-event matching, false alarms, misses, precision, recall, delay distributions, state durations, and revision rates.
2. Complete `TurningRecordV1`/`RevisionV1` persistence under `tdc-history/v1`: immutable original identity/alert/parameters/cutoff, append-only revisions, read-back validation, explicit corruption/capacity degradation, and no silent repair.
3. Implement fixed-work jobs and browser scheduling exactly as designed: registry order, 32-cutoff/grid batches, monotonic run id, checks before/after work, visible progress/family, explicit cancel, timeout yielding, and atomic commit/publication only for `complete:true`.
4. Complete Power Change Replay: actual cutoff step/play/pause, side-by-side endpoint labels, vintage limitation, immutable invalidated candidates, event timeline, accessible tables, reduced motion, and focus return.
5. Add deterministic replay fixtures with availability/vintage changes and turn outcomes. They must cause different one-sided and retrospective dates through production code; expected metrics are independently calculated from the specification, not embedded as fixture output.
6. Add the stress case for maximum configured rows/work units. Assert keyboard/navigation service between units, progress monotonicity, cancel before the next unit, retained prior result, zero partial publication/history mutation, and deterministic rerun.
7. Execute the G044 post-change matrix and compare with the recorded baseline. Run every focused Feature 006 scenario, full suite, relevant existing validator/browser suite, and planning/governance guard; repair every owned finding and preserve every pre-existing unrelated failure classification.

### Change Boundary - Scope 5

**Allowed edits:** Feature 006 page/config only where replay/work limits already have designed fields, focused validator, Feature 006 selftest group, Feature 006 browser file, and Feature 006 replay fixtures. Planning/evidence/status updates remain within spec 006 ownership rules.

**Explicitly excluded:** changing an existing suite to make it pass, weakening a scenario/title/assertion, modifying shared harnesses, changing Playwright config/package graph, writing Market Brief logic, modifying Feature 005, or editing any unrelated dirty file.

**Regression isolation:** compare identical commands and test inventories before/after. A failure absent from baseline and caused by Feature 006 is owned and blocking. A matching baseline failure remains visible and cannot be relabeled green. Any ambiguous collision is routed with the exact path and output rather than repaired across ownership boundaries.

**Rollback:** remove Scope 5 replay/history/scheduler/UI/test blocks while retaining the complete non-replay Scope 1-4 tool; registry rollback remains the exact Scope 4 hunk if the whole feature is withdrawn.

### Test Plan - Scope 5

Scenario-first TDD is mandatory for every row: capture focused red evidence before its production behavior exists or after a controlled break, then capture green evidence with the same command and assertion identity after implementation.

| Test Type | ID | Category | Scenario | File / Location | Exact behavior / title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unit | TP-05-01 | unit | SCN-006-004, 005, 007 | `scripts/selftest.mjs` | Prefix/vintage honesty, immutable revisions, target matching, metrics, deterministic replay, cancel immutability, and 100 identical result bytes excluding timings | `node scripts/selftest.mjs` | No |
| Contract validator | TP-05-02 | functional | SCN-006-004, 005, 007 | `scripts/validate-trend-dynamics-cycle.mjs` | Validate replay/history/work-plan fixtures, clocks, append-only revisions, frozen parameters, and complete result/publication linkage | `node scripts/validate-trend-dynamics-cycle.mjs` | No |
| Regression E2E | TP-05-03 | e2e-ui | SCN-006-004 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-004 provisional peak keeps effective detection and confirmation times separate` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-004 provisional peak keeps effective detection and confirmation times separate" --reporter=list` | Yes |
| Regression E2E | TP-05-04 | e2e-ui | SCN-006-005 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-005 failed early reversal remains immutable and invalidated` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-005 failed early reversal remains immutable and invalidated" --reporter=list` | Yes |
| Regression E2E | TP-05-05 | e2e-ui | SCN-006-007 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: SCN-006-007 retrospective turn never backdates the real-time alert` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-006-007 retrospective turn never backdates the real-time alert" --reporter=list` | Yes |
| Stress | TP-05-06 | stress | NFR-003 | `tests/trend-dynamics-cycle-lab.spec.mjs` | `Regression: maximum work plan reports progress cancels atomically and keeps navigation responsive` | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: maximum work plan reports progress cancels atomically and keeps navigation responsive" --reporter=list` | Yes |
| Regression E2E | TP-05-07 | e2e-ui | SCN-006-001 through 020 | `tests/trend-dynamics-cycle-lab.spec.mjs` | Complete Feature 006 protected matrix | Exact `TDC-E2E-FULL` command above | Yes |
| Source-lock regression | TP-05-08 | functional | G044 | `scripts/validate-node-source-lock.mjs` | Existing exact package/registry/lock integrity remains unchanged | `node scripts/validate-node-source-lock.mjs` | No |
| Consumer contract regression | TP-05-09 | functional | G044 | `scripts/validate-brief-payload.mjs` | Existing Market Brief payload/owner coverage remains valid without duplicated Feature 006 computation | `node scripts/validate-brief-payload.mjs` | No |
| Causal contract regression | TP-05-10 | functional | G044 | `scripts/validate-causal-rotation.mjs` | Existing causal evidence/time/ledger contracts remain unchanged | `node scripts/validate-causal-rotation.mjs` | No |
| Palm Springs contract regression | TP-05-11 | functional | G044 | `scripts/validate-palm-springs-rental-market.mjs` | Dirty Feature 005 production contracts retain their recorded baseline outcome | `node scripts/validate-palm-springs-rental-market.mjs` | No |
| Credential integration regression | TP-05-12 | e2e-ui | G044 | `tests/provider-credentials.spec.mjs` | Central credential ownership remains unchanged across all registered routes | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Causal browser regression | TP-05-13 | e2e-ui | G044 | `tests/causal-rotation-lab.spec.mjs` | Existing evidence-time and source-cluster browser contracts match baseline | `npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Bond browser regression | TP-05-14 | e2e-ui | G044 | `tests/bond-regime-lab.spec.mjs` | Existing source, scenario, owner-read, canvas, and responsive contracts match baseline | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| FX browser regression | TP-05-15 | e2e-ui | G044 | `tests/fx-regime-relative-value-lab.spec.mjs` | Existing source-envelope, decision, consumer, and canvas contracts match baseline | `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Palm Springs browser regression | TP-05-16 | e2e-ui | G044 | `tests/palm-springs-rental-market-lab.spec.mjs` | Dirty Feature 005 browser scenario inventory retains its recorded baseline outcome | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

No `load` row is planned because the spec declares no throughput or percentile latency SLA. TP-05-06 is required because NFR-003 and design explicitly require progress/cancellation responsiveness under maximum configured work.

### Definition of Done - Scope 5

Core Delivery Items (Scope 5):

- [ ] Replay resolves actual availability/vintage cutoffs, freezes requests, separates online and retrospective endpoint postures, and reports false alarms, misses, precision, recall, delay, duration, and revisions without hindsight leakage.
- [ ] Original turning records and parameter states are immutable; confirmation, invalidation, merge, supersession, source revision, and model revision append typed records and never rewrite alert times.
- [ ] Maximum configured computation exposes deterministic progress and cancellation, keeps navigation/focus usable, and cannot atomically commit, persist, draw, or publish a partial/canceled/superseded result.
- [ ] The complete G044 before/after comparison accounts for every changed, unchanged, newly failing, pre-existing failing, and recovered command without editing tests to match broken behavior.
- [ ] Scope 5 and final feature closure stay inside the declared boundary with zero Feature 005 or unrelated dirty-file changes.

Test Evidence Items (Scope 5; Exact Parity With 16 Test Plan Rows):

- [ ] TP-05-01 focused red then green unit evidence proves prefix/vintage safety, revision immutability, walk-forward metrics, cancellation, and deterministic repeats.
- [ ] TP-05-02 focused red then green validator evidence proves replay/history/work-plan contracts and complete-result linkage.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior prove SCN-006-004 Provisional peak records every clock: the record remains provisional before confirmation and separately shows estimated effective, first detection, confirmation, and delay times through TP-05-03.
- [ ] TP-05-04 Regression E2E evidence proves SCN-006-005 the failed early reversal retains its original cutoff, parameters, alert time, and record while an appended revision marks invalidation and false alarm.
- [ ] TP-05-05 Regression E2E evidence proves SCN-006-007 two-sided retrospective and one-sided detection dates/postures remain separate and retrospective dates never populate online alert fields.
- [ ] TP-05-06 stress evidence proves progress, responsiveness, cancellation-before-next-unit, and prior-result/history/publication immutability.
- [ ] Broader E2E regression suite passes through TP-05-07 with all 20 protected scenario titles and the stress title executable.
- [ ] TP-05-08 source-lock evidence matches the pre-change registry/lock baseline.
- [ ] TP-05-09 Market Brief validator evidence matches baseline and proves no duplicated trend/cycle authority.
- [ ] TP-05-10 causal validator evidence matches the pre-change contract baseline.
- [ ] TP-05-11 Palm Springs validator evidence is compared exactly with the dirty Feature 005 baseline.
- [ ] TP-05-12 provider-credential browser evidence matches baseline and proves central ownership across the new route.
- [ ] TP-05-13 causal browser evidence matches the pre-change scenario baseline.
- [ ] TP-05-14 bond browser evidence matches the pre-change scenario, canvas, and responsive baseline.
- [ ] TP-05-15 FX browser evidence matches the pre-change source, decision, consumer, and canvas baseline.
- [ ] TP-05-16 Palm Springs browser evidence is compared exactly with the dirty Feature 005 baseline.

Build Quality Gate (Scope 5):

- [ ] All focused and broad commands, per-scope red/green evidence, G044 comparison, changed-path classification, no-interception/self-validation review, artifact lint, freshness, traceability, G094, framework write guard, and repository readiness are current and clean for owned work; every discovered finding is fixed or preserved in the result envelope with its exact owner.
