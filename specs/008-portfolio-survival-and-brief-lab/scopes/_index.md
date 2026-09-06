# Feature 008 Scopes Index

Links: [spec.md](../spec.md) | [design.md](../design.md) | [uservalidation.md](../uservalidation.md) | [scenario-manifest.json](../scenario-manifest.json) | [test-plan.json](../test-plan.json)

## Execution Outline

### Phase Order

1. **01 Private Portfolio Import And Atomic Store** establishes mandatory policy, closed private contracts, local import/manual edit, atomic slots, session fallback, and the first unregistered setup UI.
2. **02 Mandate And Cash-Need Authority** adds explicit user-owned mandate and dated cash-need revisions without behavioral inference or hidden values.
3. **03 Local Behavior, Privacy Inventory, And Clear** adds the minimal completed-research ledger, privacy inventory, verified behavior clear, and profiling exclusions.
4. **04 Public Evidence Barrier And Coverage** adds coverage-aware public bars, generic/personal isolation, publisher sentinels, partial truth, and shared-module canaries.
5. **05 Four-Window Direct-Scope Brief** composes the exact four generic windows into separate held, watchlist, completed-research, and inferred lanes.
6. **06 Explainable Research Action Lifecycle** completes why-shown, setting exclusion, closed non-executing verbs, completion, dismissal, and owning-surface links.
7. **07 Return And Drawdown X-Ray** ships arithmetic/geometric/drag and cutoff-bounded drawdown/recovery as one visible Risk X-Ray slice.
8. **08 Concentration, CAPM, And Risk Contribution** completes the Risk X-Ray with coverage-aware lenses, benchmark/factor diagnostics, and reconciled contributions.
9. **09 Dependent Path Reproducibility** adds stationary-bootstrap paths, explicit seed/policy identity, parameter uncertainty, and deterministic reruns.
10. **10 Dated Cash Needs And Survival States** applies chronological cash flows and explicit survival definitions without invented floors or shifted needs.
11. **11 Stress, Tail, And Alternative Dependence** adds raw/adjusted stress, finite tail evidence, and appraisal/liquidity qualification.
12. **12 Hedge Variant Research** adds gross/net hedged variants with carry, cost, turnover, basis, liquidity, residual, and unavailable states.
13. **13 Six-Method Allocation Basis And Feasibility** runs all six methods on one frozen basis and preserves no-winner and infeasible states.
14. **14 Allocation Sensitivity And Explicit Black-Litterman** adds perturbation bands, instability, equilibrium separation, and user-entered views only.
15. **15 Walk-Forward Research Dossier And Claim Boundaries** adds decision-time validation, costs/trials, scoped efficiency claims, tax boundaries, and append-oriented records.
16. **16 Integrated Route, Accessibility, And Atomic Release** proves one six-tab identity across Simple/Power, mobile, canvases/tables, deep links, privacy boundaries, then registers the finished route in one release transaction.
17. **17 Local Lifecycle And Verified Clear Foundation** repairs holding edit/remove/empty behavior and one typed, atomic, runtime-derived full-personal clear.
18. **18 Behavior Identity And Ranking Foundation** establishes complete semantic de-duplication, temporal integrity, distinct-date evidence floor, and one canonical ranking result.
19. **19 Coverage-Aware Market Data Foundation** implements actual date coverage, static append, consent-bound public lookup, and high-fan-out RLDATA compatibility canaries.
20. **20 Generic Evidence Brief Policy And API** consumes the complete generic publisher contract under DST-safe policy and exports the full closed RLPORTFOLIO_BRIEF API.
21. **21 Partial Risk Input And Diagnostics** admits every eligible input family and completes elapsed-time, factor, look-through, covariance, and contribution diagnostics.
22. **22 Scenario Contract And Survival Distributions** binds complete scenario identity, chunk/token/cancel lifecycle, all-path cash needs, and path/parameter uncertainty.
23. **23 Stress Dependence And Hedge Effectiveness** adds distinct samples, qualified adjustment, intervals, appraisal sensitivity, return-regression basis risk, costs, and common paths.
24. **24 Complete Allocation And Explicit Views** implements six real constrained methods, explicit Black-Litterman posterior allocation, full outcomes, and multi-axis sensitivity.
25. **25 Decision-Time Dossier And Immutable Audit** adds decision-time fitting/rebalance/embargo, full cost/trial/state records, append corrections, persistence, and private export.
26. **26 Immutable Workspace Compute And Navigation** makes one token-safe compute/view model authoritative and completes real owning-page ReturnContext/return-focus behavior.
27. **27 Accessible Six-Tab Interaction** completes keyboard, modal, screen-reader, forced-colors, reduced-motion, zoom, text-spacing, touch, and responsive journeys.
28. **28 Spec-Driven Adversarial Test Replacement** replaces reduced/proxy assertions with exact discovered, persistent, discriminating proofs over every repaired behavior.
29. **29 Documentation And Registry Truth** reconciles `#brief` and evidence-bounded capability claims across the note, registry, landing page, navigation, and README.

### New Types And Signatures

- `PortfolioWorkspace/v1`, `PortfolioRevision/v1`, `MandateRevision/v1`, `BehaviorEvent/v1`, `InterestSignal/v1`, `ResearchAction/v1`, `ResearchDossier/v1`.
- `PortfolioBarSet/v1`, `GenericEvidenceWindow/v1`, `WorkspaceIdentity/v1`, `PortfolioAnalyticsResult/v1`, `ScenarioSpecification/v1`, `AllocationBasis/v1`, `ReturnContext/v1`.
- `RLPORTFOLIO.openWorkspace(...)`, `validateImport(...)`, `commitWorkspace(...)`, `recordCompletion(...)`, `clearBehavior(...)`, `clearAllPersonalData(...)`.
- `RLDATA.ensureBarCoverage(symbol, "1d", policy)` is additive; existing `ensureBars` and public cache contracts remain unchanged.
- `RLPORTFOLIO_BRIEF.composePortfolioBrief(...)` accepts validated generic evidence plus local direct/eligible behavior scope and emits only research actions.
- `RLPORTFOLIO_ANALYTICS` exposes the design-owned pure risk, path, dependence, hedge, allocation, sensitivity, and walk-forward functions.
- Public route: `portfolio-survival-allocation-lab.html` with fixed hashes `#brief`, `#risk-xray`, `#path-lab`, `#diversification`, `#allocation`, and `#dossier`.
- Mandatory configuration: `portfolio-survival-allocation.config.json`; missing, malformed, or unknown-version policy fails dependent computation visibly.
- Remediation contracts SCN-008-042 through SCN-008-055 are stable authoritative scenarios in `spec.md`, `scenario-manifest.json`, and `test-plan.json`, with exact design signatures and one remediation-scope owner each.
- Complete clear derives one personal-category registry across persistent keys and live controller state; complete compute publishes one immutable `PortfolioWorkspaceViewModel/v1` under token/cancel/rebase control.

### Validation Checkpoints

- Every scope starts with its named narrow red command and ends with the identical focused green command plus its scenario-specific real-page regressions.
- Scopes 01-04 are tagged `foundation:true`; no brief or analytics overlay starts until Scope 04 is Done and the private/public boundary canaries pass.
- Storage, fixture, `rldata.js`, and `rlnav.js` changes run independent downstream canaries before broader `node scripts/selftest.mjs` validation.
- UI scopes use the actual route through the fixture-overlay HTTP server with no browser request interception, external provider, or service worker.
- Scopes 07-15 preserve design test-file boundaries so math, paths, dependence, allocation, and dossier failures remain independently attributable.
- Scope 16 runs route-wide desktop/mobile, canvas-pixel/table-parity, keyboard, no-overlap, request-ledger privacy, stale-reference, registry parity, and broad selftest checkpoints before registration is accepted.
- Scopes 17-19 are remediation foundations. No remediation overlay starts until lifecycle/clear, behavior identity/ranking, and coverage canaries pass in sequence.
- Scopes 20-27 deliver independently testable vertical slices and retain the last valid workspace identity on every failure or supersession path.
- Scope 28 independently replaces reduced/proxy tests and reruns the complete Node, Feature 008 browser, existing-consumer, and selftest matrices.
- Scope 29 changes public claims only after Scope 28 supplies current exact behavior evidence; final validation then evaluates all 29 scopes without treating historical evidence as proof of repaired behavior.

## Complete Remediation Replan - 2026-08-20

Scopes 01-16 and their reports remain immutable historical delivery records. Their `Done` labels describe the evidence accepted at that time. They do not prove the gaps below are repaired. Active remediation begins with Scope 17 and uses new per-scope directories so no historical checkbox, status, scenario text, or evidence block is rewritten.

### Authority And Sequencing Gates

1. **A1 - Analyst authority - Resolved 2026-08-20:** `spec.md` defines authoritative Gherkin for SCN-008-037 through SCN-008-055, preserves SCN-008-001 through SCN-008-036, and maps SCN-008-042 through SCN-008-055 to the remediation requirements and findings.
2. **D1 - Design reconciliation - Resolved 2026-08-20:** `design.md` closes D1-Q1 through D1-Q10, maps SCN-008-037 through SCN-008-055 to exact proof obligations, and assigns every remediation finding once in its design trace.
3. **P1 - Plan reconciliation - Resolved 2026-08-20:** `scenario-manifest.json`, `test-plan.json`, Scopes 17-29, this index, and the execution routing in `state.json` form one planning handoff. The validation record for this reconciliation is the current P1 execution-history entry in `state.json`. It claims planning synchronization only, not implementation or test execution.
4. **V1 - Certification reopening:** `/bubbles.validate` alone may reopen or rewrite top-level status, `certification.status`, `certification.scopeProgress`, `certification.completedScopes`, or certified phase claims. This replan records the required transition request but does not forge a certification write.

### One-Owner Finding Ledger

Each audit finding appears exactly once. The scope column is the sole execution home. A route packet is used where this planning agent does not own the target artifact or repository.

| Finding | Severity / Class | Sole Owner | Execution Home | Required Outcome |
|---|---|---|---|---|
| F008-PORTFOLIO-LIFECYCLE-001 | high implement | `/bubbles.implement` | Scope 17 | Editable/removable holdings, additive manual rows, and an honest empty portfolio per FR-001/FR-009. |
| F008-CLEAR-RUNTIME-001 | critical implement | `/bubbles.implement` | Scope 17 | Typed-confirmation tombstone transaction derives and verifies every personal runtime/storage category, including display mode and in-memory route state. |
| F008-CLEAR-TEST-001 | high test | `/bubbles.test` | Scope 17 | Adversarial runtime-derived clear proof detects undeclared keys and non-sentinel residue. |
| F008-BEHAVIOR-CONTRACT-001 | high implement | `/bubbles.implement` | Scope 18 | Full semantic de-duplication identity, non-negative age, distinct-date floor, and one canonical ranking result across store/brief/route. |
| F008-BAR-COVERAGE-001 | high implement | `/bubbles.implement` | Scope 19 | Cache measurement, static append, allowed public lookup, explicit five-year dates, and enforced target coverage state. |
| F008-BRIEF-EVIDENCE-001 | critical implement | `/bubbles.implement` | Scope 20 | Generic snapshot/payload/history and owner-read evidence drive freshness, catalyst, action, and publisher identity. |
| F008-BRIEF-POLICY-001 | high implement | `/bubbles.implement` | Scope 20 | DST-safe America/New_York windows, correct behavior-floor identity, global lane cap, and stale-only Refresh/Revisit authoring. |
| F008-BROWSER-API-001 | high implement | `/bubbles.implement` | Scope 20 | The complete designed `RLPORTFOLIO_BRIEF` API and closed `PortfolioError/v1` contract exist and are exercised. |
| F008-RISK-INPUT-001 | critical implement | `/bubbles.implement` | Scope 21 | Weight-only, cash, and manual alternatives reach eligible metrics; unsupported holdings degrade per metric rather than refusing the portfolio. |
| F008-RISK-DIAGNOSTICS-001 | high implement | `/bubbles.implement` | Scope 21 | Exact elapsed-time CAGR, factor/look-through diagnostics, factor contributions, and disclosed covariance conditioning/PD state. |
| F008-PATH-CONTRACT-001 | critical implement | `/bubbles.implement` | Scope 22 | Complete ScenarioSpecification identity plus explicit path count, chunking, cancellation, last-valid publication, and regime/fat-tail state. |
| F008-SURVIVAL-PATH-001 | critical implement | `/bubbles.implement` | Scope 22 | Mandate cash needs and survival floors apply to every path at declared times with path and parameter distributions. |
| F008-DIVERSIFICATION-001 | critical implement | `/bubbles.implement` | Scope 23 | Distinct tranquil/stress samples, qualified Forbes-Rigobon adjustment, intervals, downside/drawdown/recovery overlap, and appraisal sensitivity. |
| F008-HEDGE-001 | high implement | `/bubbles.implement` | Scope 23 | Return-regression basis risk, explicit horizon and ratio variants, costs, and normal/stress/common-path effectiveness. |
| F008-ALLOCATION-001 | critical implement | `/bubbles.implement` | Scope 24 | Real six-method solvers enforce exclusions, cash, leverage, turnover, and groups with diagnostics, costs, contributions, paths, and survival outcomes. |
| F008-SENSITIVITY-BL-001 | high implement | `/bubbles.implement` | Scope 24 | Full sensitivity dimensions and explicit BL horizon/range/confidence/uncertainty feed posterior allocation; equilibrium benchmark is not equal-weight by accident. |
| F008-DOSSIER-001 | critical implement | `/bubbles.implement` | Scope 25 | Decision-time walk-forward, rebalance/embargo, complete costs/trials/states, append-only corrections, durable persistence, and private export. |
| F008-COMPUTE-NAV-001 | high implement | `/bubbles.implement` | Scope 26 | One immutable `computeWorkspace` view model with token/cancel/last-valid/rebase, ReturnContext handoff, and visible owner-return strip. |
| F008-ACCESSIBILITY-001 | high implement | `/bubbles.implement` | Scope 27 | Complete tab keyboard model, skip link, modal focus, reduced motion, forced colors, contrast, text spacing, and assistive-technology journeys. |
| F008-TEST-INTEGRITY-001 | critical test | `/bubbles.test` | Scope 28 | Reduced/proxy suites are replaced by spec-driven adversarial proofs that fail when each audited defect returns. |
| F008-SPEC-SCENARIO-001 | high analyst | `/bubbles.analyst` | Resolved A1 | `spec.md` authorizes SCN-008-037 through SCN-008-055 without weakening the original scenario set. |
| F008-PLAN-COHERENCE-001 | high plan | `/bubbles.plan` | Resolved P1 | Historical completion wording remains intact while the 55-scenario manifest, test plan, Scopes 17-29, index, and execution routing form one coherent handoff. |
| F008-DOC-INTEGRATION-001 | medium docs | `/bubbles.docs` | Scope 29 | Correct workspace hash and capability claims in the note, registry surfaces, and README after repaired behavior is executable. |
| F008-TEST-SCENARIO-RECEIPTS-001 | external framework-control | Bubbles framework owner | External packet X1 | Replace the grafted old-G022 receipt lifecycle with adversarial framework-owned scenario-receipt control; no Research Lab implementation scope claims this gap. |

### Resolved Design Owner Packet D1 - Historical Question Record

`design.md` resolves all ten questions below in D1-Q1 through D1-Q10 without reducing any existing FR, NFR, AC, or SCN behavior. The questions remain here as the evidence-bounded record of what D1 closed; they are not active routing gaps.

1. Which closed schema owns the complete clear-all personal-category registry, and how do storage keys plus in-memory controller state participate in one tombstone, deletion, reread, and partial-failure transaction?
2. What canonical identity and ordering contract is shared by behavior storage, brief composition, and route rendering, including DST-aware age, distinct-date evidence floor, global queue cap, stale authoring, and publisher evidence identity?
3. What exact generic snapshot/payload/history and owner-read fields are mandatory for `GenericEvidenceWindow/v1`, and what closed `P008-*` failures apply at every public `RLPORTFOLIO_BRIEF` function boundary?
4. What coverage target semantics, append order, public-lookup consent, and high-fan-out compatibility canaries govern `RLDATA.ensureBarCoverage`?
5. What partial-portfolio eligibility matrix allows weight-only, cash, listed, and manual assets to contribute only to supported metric families while preserving covariance/factor diagnostics?
6. What complete ScenarioSpecification, compute-token/chunk/cancel, regime/fat-tail availability, cash-flow timeline, and uncertainty contracts bind every path and allocation comparison?
7. What sample-selection, interval, Forbes-Rigobon, tail/downside/drawdown/recovery, appraisal de-smoothing, hedge-regression, and common-scenario contracts prevent diversification and hedge claims from drifting?
8. What solver interfaces and diagnostics implement minimum variance, equal-risk-contribution risk parity, explicit Black-Litterman posterior allocation, and constrained MVO under the full shared constraint/cost/path basis?
9. What append-oriented dossier, decision-time walk-forward, rebalance/embargo, trial ledger, correction, persistence, and private-export contracts are immutable?
10. What single controller/view-model and ReturnContext protocol guarantees one compute across mode/tab navigation, supersession safety, owner-return proof, and accessible focus restoration?

### External Framework-Control Packet X1

- **Owner:** canonical Bubbles framework repository; no downstream framework-managed file may be edited here.
- **Target:** scenario-receipt lifecycle and its relation to G022 phase-claim enforcement.
- **Required adversarial proof:** a historical feature delivered before receipt adoption must not pass because receipts were retrofitted onto unrelated phase claims; a missing, stale, duplicate, wrong-revision, wrong-scenario, or non-executed receipt must fail closed; a current executed receipt must bind scenario, test command, target revision, contract digest, and evidence identity one-to-one.
- **Research Lab disposition:** diagnostic input only. Feature 008 remains blocked on its own implementation/test gaps regardless of the framework packet outcome.

## Dependency Graph

Scope pickup is sequential: a scope may move to `In Progress` only when every listed dependency is `Done`. The linearized DAG keeps red-green evidence focused and prevents an overlay from becoming the accidental foundation.

Scope 28 owns SCN-008-054 and the exact test-integrity audit of carriers owned through Scope 28. It does not own, author, execute, or require the SCN-008-055 documentation-integration carrier. Scope 29 remains dependent on Scope 28 and is the sole owner of that carrier, so the sequence stays `28 -> 29` without either scope requiring work from its dependent.

| # | Scope | Tags | Depends On | Stable Scenarios | Primary Surfaces | Status |
|---|-------|------|------------|------------------|------------------|--------|
| 01 | [Private Portfolio Import And Atomic Store](01-private-portfolio-import-and-atomic-store/scope.md) | `foundation:true` | - | SCN-008-001, SCN-008-002 | config, `rlportfolio.js`, setup route, fixtures | Done |
| 02 | [Mandate And Cash-Need Authority](02-mandate-and-cash-need-authority/scope.md) | `foundation:true` | 01 | SCN-008-003, SCN-008-004 | private contracts, mandate editor, route states | Done |
| 03 | [Local Behavior, Privacy Inventory, And Clear](03-local-behavior-privacy-inventory-and-clear/scope.md) | `foundation:true` | 02 | SCN-008-011, SCN-008-012 | private store, privacy UI, lifecycle fixtures | In Progress |
| 04 | [Public Evidence Barrier And Coverage](04-public-evidence-barrier-and-coverage/scope.md) | `foundation:true` | 03 | SCN-008-005, SCN-008-035 | `rldata.js`, generic evidence, privacy boundary, partial truth | In Progress |
| 05 | [Four-Window Direct-Scope Brief](05-four-window-direct-scope-brief/scope.md) | `overlay:brief` | 04 | SCN-008-006, SCN-008-007, SCN-008-010 | `rlportfoliobrief.js`, Brief tab, four-window fixtures | In Progress |
| 06 | [Explainable Research Action Lifecycle](06-explainable-research-action-lifecycle/scope.md) | `overlay:brief` | 05 | SCN-008-008, SCN-008-009, SCN-008-034, SCN-008-037 | brief composer, why-shown UI, action lifecycle | In Progress |
| 07 | [Return And Drawdown X-Ray](07-return-and-drawdown-x-ray/scope.md) | `overlay:risk` | 06 | SCN-008-013, SCN-008-014 | analytics, Risk X-Ray route, chart/table | In Progress |
| 08 | [Concentration CAPM And Risk Contribution](08-concentration-capm-and-risk-contribution/scope.md) | `overlay:risk` | 07 | SCN-008-015, SCN-008-016, SCN-008-017 | analytics, Risk X-Ray Simple/Power | In Progress |
| 09 | [Dependent Path Reproducibility](09-dependent-path-reproducibility/scope.md) | `overlay:paths` | 08 | SCN-008-018, SCN-008-019, SCN-008-038 | analytics, Path Lab, path chart/table | In Progress |
| 10 | [Dated Cash Needs And Survival States](10-dated-cash-needs-and-survival-states/scope.md) | `overlay:paths` | 09 | SCN-008-020, SCN-008-021 | analytics, Path Lab timeline and states | In Progress |
| 11 | [Stress Tail And Alternative Dependence](11-stress-tail-and-alternative-dependence/scope.md) | `overlay:diversification` | 10 | SCN-008-022, SCN-008-023, SCN-008-024 | analytics, Diversification matrix/table | In Progress |
| 12 | [Hedge Variant Research](12-hedge-variant-research/scope.md) | `overlay:diversification` | 11 | SCN-008-025 | analytics, hedge comparison UI | In Progress |
| 13 | [Six-Method Allocation Basis And Feasibility](13-six-method-allocation-basis-and-feasibility/scope.md) | `overlay:allocation` | 12 | SCN-008-026, SCN-008-027, SCN-008-029, SCN-008-039 | analytics, Allocation Comparison | In Progress |
| 14 | [Allocation Sensitivity And Explicit Black-Litterman](14-allocation-sensitivity-and-explicit-black-litterman/scope.md) | `overlay:allocation` | 13 | SCN-008-028, SCN-008-030 | analytics, sensitivity UI, BL editor | In Progress |
| 15 | [Walk-Forward Research Dossier And Claim Boundaries](15-walk-forward-research-dossier-and-claim-boundaries/scope.md) | `overlay:dossier` | 14 | SCN-008-031, SCN-008-032, SCN-008-033, SCN-008-040 | analytics, dossier store/UI, claim validators | In Progress |
| 16 | [Integrated Route Accessibility And Atomic Release](16-integrated-route-accessibility-and-atomic-release/scope.md) | `release:atomic` | 15 | SCN-008-036, SCN-008-041 | six-tab route, mobile/a11y, `rlnav.js`, registries, notes | In Progress |
| 17 | [Local Lifecycle And Verified Clear Foundation](17-local-lifecycle-and-verified-clear-foundation/scope.md) | `foundation:true`, `remediation` | 16 | SCN-008-042, SCN-008-043 | store, editor, privacy, controller state | In Progress |
| 18 | [Behavior Identity And Ranking Foundation](18-behavior-identity-and-ranking-foundation/scope.md) | `foundation:true`, `remediation` | 17 | SCN-008-044 | store, brief composer, Why shown, ranking | In Progress |
| 19 | [Coverage-Aware Market Data Foundation](19-coverage-aware-market-data-foundation/scope.md) | `foundation:true`, `shared-infrastructure` | 18 | SCN-008-045 | `rldata.js`, coverage fixtures, provider canaries | In Progress |
| 20 | [Generic Evidence Brief Policy And API](20-generic-evidence-brief-policy-and-api/scope.md) | `overlay:brief` | 19 | SCN-008-046 | generic evidence, brief API/policy, route | In Progress |
| 21 | [Partial Risk Input And Diagnostics](21-partial-risk-input-and-diagnostics/scope.md) | `overlay:risk` | 20 | SCN-008-047 | analytics, Risk X-Ray Simple/Power | In Progress |
| 22 | [Scenario Contract And Survival Distributions](22-scenario-contract-and-survival-distributions/scope.md) | `overlay:paths` | 21 | SCN-008-048 | analytics, Path Lab, compute lifecycle | In Progress |
| 23 | [Stress Dependence And Hedge Effectiveness](23-stress-dependence-and-hedge-effectiveness/scope.md) | `overlay:diversification` | 22 | SCN-008-049 | dependence, alternatives, hedge, common paths | In Progress |
| 24 | [Complete Allocation And Explicit Views](24-complete-allocation-and-explicit-views/scope.md) | `overlay:allocation` | 23 | SCN-008-050 | constrained solvers, BL editor, sensitivity | In Progress |
| 25 | [Decision-Time Dossier And Immutable Audit](25-decision-time-dossier-and-immutable-audit/scope.md) | `overlay:dossier` | 24 | SCN-008-051 | walk-forward, costs/trials, dossier store/export | In Progress |
| 26 | [Immutable Workspace Compute And Navigation](26-immutable-workspace-compute-and-navigation/scope.md) | `integration:workspace` | 25 | SCN-008-052 | controller, view model, ReturnContext, `rlnav.js` | In Progress |
| 27 | [Accessible Six-Tab Interaction](27-accessible-six-tab-interaction/scope.md) | `integration:accessibility` | 26 | SCN-008-053 | route accessibility and responsive behavior | In Progress |
| 28 | [Spec-Driven Adversarial Test Replacement](28-spec-driven-adversarial-test-replacement/scope.md) | `test-integrity` | 27 | SCN-008-054 plus all authoritative scenarios | Feature 008 tests, fixtures, support server, validators | In Progress |
| 29 | [Documentation And Registry Truth](29-documentation-and-registry-truth/scope.md) | `docs-integration` | 28 | SCN-008-055 | note, tools, index, rlnav, README | Done |

## Authoritative Scenario Distribution - 55 Current Contracts

The first table preserves the 41 authoritative contracts and historical Scope 01-16 ownership. The second table records the 14 authoritative remediation contracts owned by Scopes 17-29. `spec.md`, `scenario-manifest.json`, `test-plan.json`, and the per-scope Gherkin/Test Plan/DoD sections use the same stable SCN-008-001 through SCN-008-055 set.

| Scope | Scenario Count | Scenario IDs |
|-------|----------------|--------------|
| 01 | 2 | SCN-008-001 through SCN-008-002 |
| 02 | 2 | SCN-008-003 through SCN-008-004 |
| 03 | 2 | SCN-008-011 through SCN-008-012 |
| 04 | 2 | SCN-008-005, SCN-008-035 |
| 05 | 3 | SCN-008-006, SCN-008-007, SCN-008-010 |
| 06 | 4 | SCN-008-008, SCN-008-009, SCN-008-034, SCN-008-037 |
| 07 | 2 | SCN-008-013 through SCN-008-014 |
| 08 | 3 | SCN-008-015 through SCN-008-017 |
| 09 | 3 | SCN-008-018, SCN-008-019, SCN-008-038 |
| 10 | 2 | SCN-008-020 through SCN-008-021 |
| 11 | 3 | SCN-008-022 through SCN-008-024 |
| 12 | 1 | SCN-008-025 |
| 13 | 4 | SCN-008-026, SCN-008-027, SCN-008-029, SCN-008-039 |
| 14 | 2 | SCN-008-028, SCN-008-030 |
| 15 | 4 | SCN-008-031, SCN-008-032, SCN-008-033, SCN-008-040 |
| 16 | 2 | SCN-008-036, SCN-008-041 |
| **Total** | **41** | **SCN-008-001 through SCN-008-041** |

### Remediation Scenario Ownership

These stable IDs are authoritative manifest entries. Each has one owning remediation scope, exact planned test bindings, scenario-derived obligations, and a scope-local evidence target. Authoring and execution state is recorded per owning scope rather than inferred from this index. Scope 27 retains TP-27-01 through TP-27-04 as authored and TP-27-05 as an existing shared carrier, with execution credit owned by test and validation evidence. Scope 28 carrier authorship is reconciled from current files and exact executable titles; this planning reconciliation creates no execution evidence and does not infer execution credit from file existence or prior receipts. The disposable interception-based TP-27-04 control remains neither a persistent Scope 28 carrier nor live E2E evidence.

| Scope | Scenario IDs | Exact purpose |
|---|---|---|
| 17 | SCN-008-042, SCN-008-043 | Holding edit/remove/empty lifecycle; runtime-derived tombstone clear |
| 18 | SCN-008-044 | Complete behavior identity, time, floor, and canonical ranking |
| 19 | SCN-008-045 | Actual requested bar coverage with append/consent/compatibility |
| 20 | SCN-008-046 | Complete generic evidence, DST policy, brief API, errors, global cap |
| 21 | SCN-008-047 | Partial mixed-input Risk X-Ray and complete diagnostics |
| 22 | SCN-008-048 | Complete scenario identity, compute lifecycle, all-path survival distributions |
| 23 | SCN-008-049 | Distinct stress/appraisal evidence and regression/common-path hedge effectiveness |
| 24 | SCN-008-050 | Complete constrained six-method allocation and explicit BL posterior |
| 25 | SCN-008-051 | Decision-time walk-forward and immutable dossier lifecycle |
| 26 | SCN-008-052 | One immutable compute, rebase, owning-page ReturnContext, restored focus |
| 27 | SCN-008-053 | Complete assistive interaction and no-overlap responsive behavior |
| 28 | SCN-008-054 | Exact discovered and adversarially discriminating test integrity |
| 29 | SCN-008-055 | Published `#brief` links and evidence-bounded capability claims |
| **Total** | **14** | **SCN-008-042 through SCN-008-055** |

**Combined authoritative total:** 55 scenarios across Scopes 01-29.

### Cross-Scope Conjunct Discharge

Scenario *ownership* is unchanged by this section: SCN-008-001 is still owned by Scope 01 and SCN-008-036 is still owned by Scope 16. What is recorded here is narrower — a single `And` clause whose conjuncts are verified in two different scopes, because no one scope renders both surfaces it names.

| Scenario | Clause | Conjunct | Verified by | Why there |
|----------|--------|----------|-------------|-----------|
| SCN-008-001 | `And the Portfolio Brief and portfolio analyses reference the new revision` | `the Portfolio Brief ... references the new revision` | Scope 01, TP-01-03 | The Brief tab is the only workspace surface Scope 01 ships, and Scope 01 is where an import becomes the current revision. |
| SCN-008-001 | same clause | `... portfolio analyses reference the new revision` | Scope 16, TP-16-05 | The five analysis tabs render `disabled` until Scopes 07-15 ship them, and Scope 16 is the first point at which all six tabs exist at once. SCN-008-036 already fixes one active revision in its `Given` and asserts that all six tabs expose equal identity values, so the conjunct is a re-reading of an existing row, not a new claim. |

The clause is preserved by composition, not by weakening: Scope 01 establishes that confirming a valid import is what makes a revision current, and Scope 16 establishes that every analysis tab renders the current revision's identity. Together they entail the clause exactly as written.

Three rules keep this honest and MUST hold for any future split:

1. **No Gherkin edit.** The scenario text is untouched. Rewriting Gherkin to match delivery is the inversion Gate G068 exists to detect.
2. **No orphaned conjunct.** A delegated conjunct is only delegable to a scope that already carries, or is given, a Gherkin scenario and a Test Plan row that assert it. Delegation to a scope with no verifying row is deletion with extra steps.
3. **No double-claiming.** The delegating scope's DoD item states explicitly that the conjunct is not resolvable there, so a green checkbox in Scope 01 never implies the analyses were checked.

#### Scope 03 Full-Personal-Clear Enumeration Discharge

Ruled by `bubbles.plan` as decision **D-03-11**. The three rules above govern it unchanged. What differs from the SCN-008-001 case is the delegating unit: there the split ran through one Gherkin `And` clause, here it runs through a DoD line that enumerates thirteen **nouns**, six of which name a surface Scope 03 neither owns nor can create.

The line — *"Full-personal clear mechanically verifies holdings, mandate/needs, events, interests, outcomes, scenarios, allocations, dossiers, quarantine, UI state, session fallback, and return context are empty while public generic assets remain"* — is **not** an over-reach. Its guarantee, that a full-personal clear leaves nothing personal behind, is sound and load-bearing. It is *mis-sited*: the set of personal categories is open at Scope 03 and closes only at Scope 16, so no foundation scope can quantify over it.

Ruling it a genuine Scope 03 obligation was rejected, and not for convenience. Scope 03 is `foundation:true` at the head of the strictly linear chain described in [blocker 3](#known-cross-scope-blockers); Scopes 04-16 all depend on it transitively. Requiring Scope 03 to observe surfaces introduced by Scopes 09, 13, and 15 makes 03 depend on its own dependents. That is the exact cycle blocker 3 forbids, and it deadlocks the feature rather than merely slowing one scope.

| Noun | Status at Scope 03 | Discharged to | Why there |
|------|--------------------|---------------|-----------|
| holdings, mandate, needs, events, quarantine, session fallback, return context | Reachable, proven non-empty before the clear, asserted empty after it | **Not discharged — Scope 03 retains all seven** | Each is a workspace array section or a `policy.storage` key that Scope 03 itself creates and sweeps. |
| interests (`interestSignals`) | Swept, but vacuously: `validateWorkspace` refuses any workspace with `interestSignals.length > 0` as `unsupported-contract-scope`, so no record can exist at this contract version | **Scope 06**, SCN-008-037 / TP-06-08 — **DISCHARGED** | Scope 06 implementation item 1 adds `deriveInterestSignals` in `rlportfoliobrief.js`, the first and only producer. TP-06-08 runs `tests/portfolio-privacy.functional.mjs`, the file carrying Scope 03's clear proof. Landed: `InterestSignal/v1` replaced the blanket refusal with a real contract, `buildInterestSignalCandidate` persists derived signals, and TP-06-08 proves the clear empties a genuinely persisted set on a storage reread. |
| outcomes (`actionOutcomes`) | Swept, but vacuously: the schema validates entries, yet no exported builder can hash one into a workspace | **Scope 06**, SCN-008-037 / TP-06-08 — **DISCHARGED** | Scope 06 owns completion and dismissal (FR-045 through FR-046, FR-051 through FR-055), which is what produces an action outcome. Landed: `buildActionOutcomeCandidate` hashes an outcome into a workspace and `actionIdentity` gives it a per-action identity, so an outcome discharges one authored action rather than every action sharing a subject. |
| scenarios | No workspace section, no storage key, not a declarable inventory category | **Scope 09**, SCN-008-038 / TP-09-06 | Scope 09 implementation item 1 adds `ScenarioSpecification/v1`, the first persisted scenario identity. |
| allocations | Same | **Scope 13**, SCN-008-039 / TP-13-08 | Scope 13 implementation item 1 adds `AllocationBasis/v1`, the first frozen allocation basis. |
| dossiers | Same | **Scope 15**, SCN-008-040 / TP-15-08 | Scope 15 implementation item 4 adds the `ResearchDossier/v1` projection and its append-oriented store. |
| UI state | Same, and no downstream scope names it either | **Scope 16**, SCN-008-041 / TP-16-12 | UI state is route-level, so it first exists once all six tabs do. TP-16-12 asserts the whole declared set derives from the runtime, which makes it the whole-set backstop. |

Discharge runs 03 → 06, 09, 13, 15, 16. Every edge points forward, so no cycle is introduced and no receiving scope becomes a prerequisite of its own predecessor.

**Rule 2 closure — the discharge is no longer orphaned.** The earlier discharge gave each receiving
scope a DoD item naming the obligation, which rule 2 does not accept: a DoD item is neither of the
two artifacts it requires. An audit of all five receiving scopes confirmed the gap was real rather
than bookkeeping — none of the previously cited rows asserted a clear at all. TP-06-02's declared
elements are a *no-mutation* proof and SCN-008-009 asserts the opposite direction (that no
`InterestSignal` is **created** from settings); TP-09-01 is a `unit` row over RNG vectors and
bootstrap hashes; TP-13-02 covers Pareto tradeoffs and infeasible rows; TP-15-02 covers backtest
claim limits. Each receiving scope now carries a purpose-built pair instead — a Gherkin scenario
and a Test Plan row that assert the clear directly — so every discharged conjunct has a verifying
row that reddens if the obligation is dropped:

| Noun | Scenario | Carrying row | Asserts the clear |
|------|----------|--------------|-------------------|
| interests, outcomes | SCN-008-037 | TP-06-08 | both sections empty on a storage reread; behavior-only clear preserves portfolio facts |
| scenarios | SCN-008-038 | TP-09-06 | scenario section empty on a storage reread; public assets byte-identical |
| allocations | SCN-008-039 | TP-13-08 | allocation section empty on a storage reread; public assets byte-identical |
| dossiers | SCN-008-040 | TP-15-08 | dossier section empty on a storage reread; public assets byte-identical |
| UI state + whole-set closure | SCN-008-041 | TP-16-12 | every declared category empty; no key outside the sweep; declared set derived from the runtime |

Each scenario requires its subject to be **proven non-empty before the clear**, so no receiving row
can discharge its conjunct vacuously the way Scope 03's own `interestSignals` and `actionOutcomes`
assertions do. All five are registered in `scenario-manifest.json` (41 scenarios, every
`gherkinHash` recomputed and matching) and `test-plan.json` (107 rows), with zero cross-reference
mismatches in either direction.

**Scope 03 does not walk away clean.** The discharge is enforceable only if a later scope cannot add a personal category *silently*, and today that holds for one half of the sweep and not the other.

| Sweep half | Mechanism | A new personal surface is |
|------------|-----------|---------------------------|
| Workspace array sections | `personalWorkspaceSections` derives itself from `createEmptyWorkspace` and keeps every array-valued entry | **auto-absorbed**, with no test edit |
| Declared storage keys | `policyDeclaredKeys` names `pointerKey`, `slotKeys`, `quarantineKey`, `sessionKey`, and `returnContextKey` one by one, and the assertions pin the resulting counts at 4 and 2 | **silently uncovered** — those counts are computed from the same hand-written list, so a seventh `policy.storage` key moves neither and nothing goes red |

UI state, scenarios, allocations, and dossiers would each most plausibly arrive as a storage key rather than as a workspace array, which is precisely the blind half. Scope 03 therefore **retains** the obligation to make the declared-key sweep derive from `policy.storage` rather than name its fields, so that an unswept personal key is a red test instead of an unnoticed one. That work sits inside Scope 03's declared allowed files, and it is the line's remaining blocker: the item stays unchecked, but it is now closable *within Scope 03* instead of blocked on Scopes 09 through 15.

## Requirement Ownership

The ranges below are execution ownership, not exclusions. Cross-cutting privacy, provenance, failure-state, accessibility, and educational boundaries are rechecked wherever their behavior is observable.

| Scope | Functional Requirements | Non-Functional Requirements |
|-------|-------------------------|-----------------------------|
| 01 | FR-001-FR-010, FR-017-FR-018 | NFR-001-NFR-003, NFR-007-NFR-008, NFR-012, NFR-019-NFR-020 |
| 02 | FR-011-FR-016 | NFR-003, NFR-005, NFR-007, NFR-012, NFR-022 |
| 03 | FR-019, FR-022-FR-023, FR-027-FR-038 | NFR-001, NFR-003-NFR-004, NFR-008, NFR-019, NFR-023-NFR-024 |
| 04 | FR-020-FR-026, FR-083 | NFR-001-NFR-002, NFR-005-NFR-006, NFR-008, NFR-010-NFR-012, NFR-018-NFR-021, NFR-024 |
| 05 | FR-039-FR-044, FR-047-FR-050, FR-056-FR-061, FR-064-FR-067 | NFR-003-NFR-006, NFR-010-NFR-013, NFR-018, NFR-021-NFR-023 |
| 06 | FR-045-FR-046, FR-051-FR-055, FR-062-FR-063 | NFR-003-NFR-004, NFR-011-NFR-013, NFR-019, NFR-022-NFR-023 |
| 07 | FR-068-FR-073, FR-083-FR-085 | NFR-002-NFR-003, NFR-005-NFR-006, NFR-011-NFR-018, NFR-021-NFR-022 |
| 08 | FR-074-FR-082 | NFR-002-NFR-003, NFR-005, NFR-011, NFR-013-NFR-018, NFR-021-NFR-022 |
| 09 | FR-086-FR-093, FR-097-FR-098, FR-100-FR-103 | NFR-002-NFR-003, NFR-005-NFR-006, NFR-009-NFR-012, NFR-014-NFR-018, NFR-021-NFR-022 |
| 10 | FR-094-FR-104 | NFR-002-NFR-003, NFR-005-NFR-007, NFR-009, NFR-011-NFR-018, NFR-021-NFR-022 |
| 11 | FR-105-FR-115, FR-122 | NFR-002-NFR-003, NFR-005-NFR-006, NFR-011, NFR-013-NFR-018, NFR-021-NFR-022 |
| 12 | FR-116-FR-122 | NFR-002-NFR-003, NFR-005, NFR-011, NFR-013-NFR-018, NFR-021-NFR-022 |
| 13 | FR-123-FR-129, FR-132-FR-141 | NFR-002-NFR-003, NFR-005-NFR-006, NFR-009, NFR-011-NFR-018, NFR-021-NFR-022 |
| 14 | FR-130-FR-140 | NFR-002-NFR-006, NFR-009, NFR-011-NFR-018, NFR-021-NFR-023 |
| 15 | FR-142-FR-150 | NFR-002-NFR-003, NFR-005-NFR-006, NFR-009, NFR-011, NFR-017-NFR-018, NFR-021-NFR-023 |
| 16 | FR-038-FR-039, FR-060, FR-066, FR-141 | NFR-001-NFR-024 |
| 17 | FR-001, FR-008-FR-009, FR-027, FR-029, FR-151 | NFR-007, NFR-024 |
| 18 | FR-034, FR-036, FR-056-FR-057, FR-067 | NFR-002, NFR-006, NFR-023 |
| 19 | FR-020, FR-050, FR-083, FR-152 | NFR-005-NFR-006, NFR-010, NFR-021 |
| 20 | FR-040-FR-057, FR-067, FR-153 | NFR-006, NFR-021, NFR-023 |
| 21 | FR-068-FR-085 | NFR-005, NFR-021 |
| 22 | FR-086-FR-104 | NFR-002, NFR-012, NFR-021 |
| 23 | FR-105-FR-122 | NFR-005-NFR-006, NFR-021 |
| 24 | FR-123-FR-141 | NFR-002, NFR-005, NFR-017, NFR-021 |
| 25 | FR-142-FR-150 | NFR-009, NFR-023 |
| 26 | FR-067, FR-154 | NFR-002, NFR-012-NFR-013 |
| 27 | - | NFR-013-NFR-016 |
| 28 | - | NFR-025 |
| 29 | - | NFR-026 |

## Shared Change Boundaries

- Allowed Feature 008 families are the new route/config/modules, `tests/fixtures/portfolio-survival-allocation/**`, design-named Feature 008 test files, additive `rldata.js`/`rlnav.js` changes, and the four release registration surfaces named in Scope 16.
- Existing generic Market Brief payloads, snapshots, history, config, HTML, publisher scripts, and scheduler are read-only consumers or boundary-test subjects; they are not personalized or rewritten.
- Existing Feature 001-007 artifacts, tests, tools, and concurrent dirty work remain untouched except for additive shared-module canaries explicitly named by a scope.
- No scope introduces a project CLI, package, remote portfolio service, external provider dependency, service worker, trade execution path, personalized-advice output, or hidden configuration value.
- The fixture overlay is deterministic and offline. Production HTML/JS is served unchanged, and Playwright request interception is prohibited.

## Release Transaction

The route remains directly testable and unregistered through Scopes 01-15. Scope 16 adds `index.html`, `tools.json`, `rlnav.js`, `README.md`, and `notes/portfolio-survival-allocation-lab.md` only after the route, tests, privacy boundary, mobile/accessibility behavior, and canvas/table parity satisfy their focused gates. Registry rollback removes that additive transaction without touching generic Market Brief artifacts or browser personal keys.

## Active Remediation Completion Gate

Current scope headers are authoritative for this plan-owned mirror. Every scope with one or more unchecked DoD rows remains `In Progress`; no such scope may remain `Done` or be promoted while any DoD row is unchecked.

Active completion requires all of the following:

- A1, D1, and P1 remain resolved and their synchronized scenario, design, test, scope, index, and execution-routing mirrors remain coherent.
- Scopes 17-28 remain In Progress until every unchecked DoD row is resolved by its owning execution or validation authority; Scope 29 retains its current Done header.
- Scenario/test-plan parity, declaration reachability, behavior obligations, traceability, artifact lint, scope context fit, regression quality, implementation reality, and repository selftest pass over the final authoritative scenario set.
- Scope 28 proves each audited implementation/test defect is discriminating; old pass counts and reports remain historical context only.
- Scope 29 proves all active public claims/links match executable behavior and `#brief`.
- X1 remains an external framework-control packet. It neither substitutes for Feature 008 remediation nor becomes a Research Lab implementation finding; terminal certification handles its framework verdict separately.
- `/bubbles.validate` alone reconciles certification scope mirrors and any terminal transition after the complete chain passes.

## Historical Feature Completion Gate - Preserved Evidence

Feature 008 had no separate feature-level report artifact. This section preserves the prior Scope 16 completion gate and evidence exactly as historical delivery context. Scope 16 was the last historical scope, was tagged `release:atomic`, and transitively depended on the fifteen original predecessors. It is not the active completion gate for Scopes 17-29.

### Two Traceability Levels, Deliberately Separated

A per-scope Build Quality Gate that demanded whole-feature traceability would make every scope unclosable until all sixteen shipped, which inverts scope isolation and forces big-bang delivery. The two levels are therefore split:

| Level | Command | Enforced at | Passes when |
|-------|---------|-------------|-------------|
| Scope-local | `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope` | Every scope's Build Quality Gate | No failure names that scope's own files, while that scope is the active scope in `state.json` |
| Whole-feature | `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes` | This gate, executed in Scope 16 | `RESULT: PASSED` across all 41 scenarios and all 16 scopes |

The scope-local mode is the guard's own `--current-scope` scope-universe mode. It derives its universe only from `state.json`, so a scope cannot widen or narrow its own slice.

### Whole-Feature Requirements (Scope 16 Only)

Relocated here from the per-scope gates; nothing is dropped.

- [x] `--all-scopes` traceability reports `RESULT: PASSED` with zero failures.

   **Evidence (executed 2026-08-19):**

   **Claim Source:** current-session execution

   - Command: `timeout 300 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes`
   - Exit: `0`
   - Result: `RESULT: PASSED (0 warnings)` across 41 scenarios and 16 scopes.

   ```text
   # Feature 008 whole-feature all-scopes result
   $ timeout 300 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes
   exit: 0
   lines: 359
   sha256: afc22aa3c44894071c2ef49aecda826fdc203abeb93c3347074efed5b80a2272
   --- bounded tail; sha256 above covers the complete 359-line output ---
   DoD fidelity: 41 scenarios checked, 41 mapped to DoD, 0 unmapped
   --- Traceability Summary ---
   Scenarios checked: 41
   Test rows checked: 132
   Scenario-to-row mappings: 41
   Concrete test file references: 41
   Report evidence references: 41
   DoD fidelity scenarios: 41 (mapped: 41, unmapped: 0)
   Edge confidence (IMP-015 Scope B): declared=74 inferred=1 ambiguous=7
   RESULT: PASSED (0 warnings)
   ```

   Verify: `bash .github/bubbles/scripts/evidence-capture.sh --verify afc22aa3c44894071c2ef49aecda826fdc203abeb93c3347074efed5b80a2272 -- timeout 300 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes`

- [x] Every `scenario-manifest.json` `linkedTest` path exists on disk, including `tests/portfolio-survival-brief.spec.mjs`, `tests/portfolio-survival-risk.spec.mjs`, `tests/portfolio-survival-paths.spec.mjs`, `tests/portfolio-survival-diversification.spec.mjs`, `tests/portfolio-survival-allocation.spec.mjs`, and `tests/portfolio-survival-mobile.spec.mjs`.

   **Evidence (executed 2026-08-19):**

   **Claim Source:** current-session execution

   - Command: `timeout 300 node --input-type=module -e '<manifest-scoped collectSpecTestPathReferences check>'` (exact command below)
   - Exit: `0`
   - Result: 77 manifest references resolved to 10 distinct files; `missing=0`.

   ```bash
   timeout 300 node --input-type=module -e 'import { statSync } from "node:fs"; import { resolve } from "node:path"; import { collectSpecTestPathReferences } from "./scripts/validate-spec-test-paths.mjs"; const root=process.cwd(); const artifact="specs/008-portfolio-survival-and-brief-lab/scenario-manifest.json"; const { references }=collectSpecTestPathReferences(root,"specs/008-portfolio-survival-and-brief-lab"); const refs=references.filter((ref)=>ref.artifact===artifact); const paths=[...new Set(refs.map((ref)=>ref.path))].sort(); let missing=0; console.log(`[feature-008-linked-test-paths] artifact=${artifact} references=${refs.length}`); for (const path of paths) { let exists=false; try { exists=statSync(resolve(root,path)).isFile(); } catch {} if (!exists) missing++; console.log(`${exists ? "OK" : "MISSING"} ${path}`); } console.log(`[feature-008-linked-test-paths] distinct=${paths.length} missing=${missing}`); if (refs.length===0 || missing>0) process.exit(1);'
   ```

   ```text
   [feature-008-linked-test-paths] artifact=specs/008-portfolio-survival-and-brief-lab/scenario-manifest.json references=77
   OK tests/portfolio-allocation.functional.mjs
   OK tests/portfolio-analytics.unit.mjs
   OK tests/portfolio-privacy.functional.mjs
   OK tests/portfolio-survival-allocation.spec.mjs
   OK tests/portfolio-survival-brief.spec.mjs
   OK tests/portfolio-survival-diversification.spec.mjs
   OK tests/portfolio-survival-foundation.spec.mjs
   OK tests/portfolio-survival-mobile.spec.mjs
   OK tests/portfolio-survival-paths.spec.mjs
   OK tests/portfolio-survival-risk.spec.mjs
   [feature-008-linked-test-paths] distinct=10 missing=0
   ```

- [x] Every one of the 41 `SCN-008-*` scenarios maps to a Test Plan row that references an existing concrete test file.

   **Evidence (executed 2026-08-19):**

   **Claim Source:** current-session execution

   - Command: `timeout 300 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes`
   - Exit: `0`
   - Result: 41 scenarios, 41 scenario-to-row mappings, and 41 concrete test file references.

   ```text
   # Feature 008 scenario-to-row concrete-file mappings
   $ timeout 300 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes
   exit: 0
   lines: 359
   sha256: b265dd3d99eb728833c52997ba89992e11a2cfdcd8ffcef7d9b568d0ad03c20b
   --- bounded tail; sha256 above covers the complete 359-line output ---
   DoD fidelity: 41 scenarios checked, 41 mapped to DoD, 0 unmapped
   --- Traceability Summary ---
   Scenarios checked: 41
   Test rows checked: 132
   Scenario-to-row mappings: 41
   Concrete test file references: 41
   Report evidence references: 41
   DoD fidelity scenarios: 41 (mapped: 41, unmapped: 0)
   Edge confidence (IMP-015 Scope B): declared=74 inferred=1 ambiguous=7
   RESULT: PASSED (0 warnings)
   ```

   Verify: `bash .github/bubbles/scripts/evidence-capture.sh --verify b265dd3d99eb728833c52997ba89992e11a2cfdcd8ffcef7d9b568d0ad03c20b -- timeout 300 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes`

- [x] Gate G068 Gherkin-to-DoD content fidelity reports zero unmapped scenarios across all 16 scopes.

   **Evidence (executed 2026-08-19):**

   **Claim Source:** current-session execution

   - Command: `timeout 300 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes`
   - Exit: `0`
   - Result: G068 checked 41 scenarios, mapped all 41 to DoD, and reported 0 unmapped.

   ```text
   # Feature 008 G068 all-scope content fidelity
   $ timeout 300 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes
   exit: 0
   lines: 359
   sha256: 7fdb3ff2fe2d56767d751bc5aaa66737577594511bdc6a6f5b1850449c08f6b0
   --- bounded tail; sha256 above covers the complete 359-line output ---
   scopes/15-walk-forward-research-dossier-and-claim-boundaries/scope.md scenario maps to DoD item: SCN-008-040 - A user clears all personal data after producing a walk-forward dossier
   scopes/16-integrated-route-accessibility-and-atomic-release/scope.md scenario maps to DoD item: SCN-008-036 - The user switches between Simple and Power or follows a brief deep link
   scopes/16-integrated-route-accessibility-and-atomic-release/scope.md scenario maps to DoD item: SCN-008-041 - A user clears all personal data from the complete six-tab route
   DoD fidelity: 41 scenarios checked, 41 mapped to DoD, 0 unmapped
   --- Traceability Summary ---
   Scenarios checked: 41
   Test rows checked: 132
   Scenario-to-row mappings: 41
   Concrete test file references: 41
   Report evidence references: 41
   DoD fidelity scenarios: 41 (mapped: 41, unmapped: 0)
   Edge confidence (IMP-015 Scope B): declared=74 inferred=1 ambiguous=7
   RESULT: PASSED (0 warnings)
   ```

   Verify: `bash .github/bubbles/scripts/evidence-capture.sh --verify 7fdb3ff2fe2d56767d751bc5aaa66737577594511bdc6a6f5b1850449c08f6b0 -- timeout 300 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes`

### Known Cross-Scope Blockers

These are recorded so no scope silently inherits them. None is closable by an implementing scope on its own. Resolved entries are kept with their resolution so a reader can tell a closed blocker from an open one.

1. **`certification.status` divergence — RESOLVED.** `state.json` top-level `status` and `certification.status` are both `in_progress`, so `artifact-lint.sh` passes and the resolver no longer refuses with `top-level status and certification.status disagree`.
2. **Scope 01 G068 fidelity — RESOLVED.** Scope 01's Scenario Behavioral Claims items now restate both Gherkin scenarios, and `--all-scopes` reports both Scope 01 scenarios as mapped. No G068 failure names Scope 01.
3. **Scope 01 is the head of a strictly linear chain — OPEN.** `certification.scopeProgress` links 16 ← 15 ← … ← 2 ← 1, so `--current-scope` refuses with exit 2 (`transitive prerequisite '1' of current scope is not done`) for every scope until Scope 01 is Done. This is the sequential gate working as designed, not a defect; it becomes a deadlock only if a Scope 01 DoD item is unresolvable inside Scope 01. One such item existed — the SCN-008-001 `portfolio analyses` conjunct — and is resolved by [Cross-Scope Conjunct Discharge](#cross-scope-conjunct-discharge). Any future Scope 01 item that names a surface Scope 01 does not ship recreates the deadlock and MUST be attributed the same way.
4. **SCN-008-002 `committed artifacts` sink — RESOLVED.** The Test Plan decision this entry demanded is made here, and it is the first of the two options the entry offered: the sink stays in Scope 01, and TP-01-04 is the row that scans for it. Delegation to Scope 16's TP-16-09 was considered and rejected — it would have moved a Scope 01 obligation onto a surface Scope 01 does not ship, recreating precisely the deadlock entry 3 warns against.

   The impossibility this entry described is gone. TP-01-04's probe is no longer built from `Date.now()`; it is a fixed constant, `COMMITTED_ARTIFACT_SENTINEL` (`tests/portfolio-survival-foundation.spec.mjs:385`) with its one legitimate origin declared at :386, so the value *can* appear in a tracked file and is therefore scannable. The run-unique suffix is retained on top of the constant, so per-run isolation on the four runtime sinks is unchanged. `trackedPathsContaining()` (`tests/portfolio-survival.support.mjs:25-30`) runs `git grep` over tracked files only, and the assertion is `found set === declared origins` (:445), never `found set is empty`, because a tree-wide scan would self-trigger on the declaration. Non-vacuity is proven rather than asserted: `commitTrackedLeak()` (:37-48) commits the probe to `briefs/current.json` in a disposable repo, the same scanner is pointed at it, and :452-:454 assert it reports that path and classifies it as a violation — so `committedArtifactViolations=0` is a real absence. The scan has already earned its keep by catching a genuine leak: the constant had been quoted in `report.md` prose, since redacted.

   Both narrower gaps close with it. `row` and `field` are asserted at :404-:406 against the rendered rejection text, and discriminatingly so — `safeErrorCopy()` emits those segments conditionally, so dropping either fails the assertion. Sink absence now covers all three persistence modes: TP-01-05 pushes the same fixed prefix through a rejection in `durable`, `session`, and `memory`, then one tracked-tree scan (:556) covers all three, with mode liveness proven by an `instanceof Storage` probe rather than merely labelled. Scope 01 is unblocked and is `Done`.

   **Do not quote the probe value in any tracked artifact.** Because the assertion is `found set === declared origins`, writing the literal into a tracked file — a spec, report, note, or fixture — adds an origin and fails TP-01-04. Refer to it by constant name, as this entry does. That is not hypothetical — it is the leak the scan already caught once.

5. **Scope 03 enumerates six personal nouns it cannot reach — OPEN, and forward-discharged.** Scope 03's full-personal-clear DoD line names thirteen nouns. Seven are reachable and verified there. Two — `interestSignals` and `actionOutcomes` — are swept vacuously because nothing writes them, and four — scenarios, allocations, dossiers, and UI state — have no workspace section, no storage key, and no declarable inventory category. Scope 03 is `foundation:true` at the head of the linear chain, so holding the line open until Scopes 09, 13, and 15 ship would recreate blocker 3's cycle. It is resolved the way blocker 3 prescribes, by attribution: see [Scope 03 Full-Personal-Clear Enumeration Discharge](#scope-03-full-personal-clear-enumeration-discharge). The six nouns are discharged to Scopes 06, 09, 13, 15, and 16, each with a named verifying row and a new DoD item in the receiving scope.

   **What stays open is narrower than the line, and it is Scope 03's own.** The discharge binds only if a later scope cannot add a personal category unnoticed. Workspace array sections auto-absorb, because `personalWorkspaceSections` derives itself from `createEmptyWorkspace`. Declared storage keys do not, because `policyDeclaredKeys` names five fields explicitly and the assertions pin the counts those same names produce. A seventh `policy.storage` key is therefore swept by nothing and reddens nothing. Scope 03 must make that helper derive from `policy.storage` before its line can be ticked. Until then the line is unchecked for a reason Scope 03 owns rather than one it must wait on.

