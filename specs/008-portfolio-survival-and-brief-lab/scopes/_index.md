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

### New Types And Signatures

- `PortfolioWorkspace/v1`, `PortfolioRevision/v1`, `MandateRevision/v1`, `BehaviorEvent/v1`, `InterestSignal/v1`, `ResearchAction/v1`, `ResearchDossier/v1`.
- `PortfolioBarSet/v1`, `GenericEvidenceWindow/v1`, `WorkspaceIdentity/v1`, `PortfolioAnalyticsResult/v1`, `ScenarioSpecification/v1`, `AllocationBasis/v1`, `ReturnContext/v1`.
- `RLPORTFOLIO.openWorkspace(...)`, `validateImport(...)`, `commitWorkspace(...)`, `recordCompletion(...)`, `clearBehavior(...)`, `clearAllPersonalData(...)`.
- `RLDATA.ensureBarCoverage(symbol, "1d", policy)` is additive; existing `ensureBars` and public cache contracts remain unchanged.
- `RLPORTFOLIO_BRIEF.composePortfolioBrief(...)` accepts validated generic evidence plus local direct/eligible behavior scope and emits only research actions.
- `RLPORTFOLIO_ANALYTICS` exposes the design-owned pure risk, path, dependence, hedge, allocation, sensitivity, and walk-forward functions.
- Public route: `portfolio-survival-allocation-lab.html` with fixed hashes `#brief`, `#risk-xray`, `#path-lab`, `#diversification`, `#allocation`, and `#dossier`.
- Mandatory configuration: `portfolio-survival-allocation.config.json`; missing, malformed, or unknown-version policy fails dependent computation visibly.

### Validation Checkpoints

- Every scope starts with its named narrow red command and ends with the identical focused green command plus its scenario-specific real-page regressions.
- Scopes 01-04 are tagged `foundation:true`; no brief or analytics overlay starts until Scope 04 is Done and the private/public boundary canaries pass.
- Storage, fixture, `rldata.js`, and `rlnav.js` changes run independent downstream canaries before broader `node scripts/selftest.mjs` validation.
- UI scopes use the actual route through the fixture-overlay HTTP server with no browser request interception, external provider, or service worker.
- Scopes 07-15 preserve design test-file boundaries so math, paths, dependence, allocation, and dossier failures remain independently attributable.
- Scope 16 runs route-wide desktop/mobile, canvas-pixel/table-parity, keyboard, no-overlap, request-ledger privacy, stale-reference, registry parity, and broad selftest checkpoints before registration is accepted.

## Dependency Graph

Scope pickup is sequential: a scope may move to `In Progress` only when every listed dependency is `Done`. The linearized DAG keeps red-green evidence focused and prevents an overlay from becoming the accidental foundation.

| # | Scope | Tags | Depends On | Stable Scenarios | Primary Surfaces | Status |
|---|-------|------|------------|------------------|------------------|--------|
| 01 | [Private Portfolio Import And Atomic Store](01-private-portfolio-import-and-atomic-store/scope.md) | `foundation:true` | - | SCN-008-001, SCN-008-002 | config, `rlportfolio.js`, setup route, fixtures | In Progress |
| 02 | [Mandate And Cash-Need Authority](02-mandate-and-cash-need-authority/scope.md) | `foundation:true` | 01 | SCN-008-003, SCN-008-004 | private contracts, mandate editor, route states | Not Started |
| 03 | [Local Behavior, Privacy Inventory, And Clear](03-local-behavior-privacy-inventory-and-clear/scope.md) | `foundation:true` | 02 | SCN-008-011, SCN-008-012 | private store, privacy UI, lifecycle fixtures | Not Started |
| 04 | [Public Evidence Barrier And Coverage](04-public-evidence-barrier-and-coverage/scope.md) | `foundation:true` | 03 | SCN-008-005, SCN-008-035 | `rldata.js`, generic evidence, privacy boundary, partial truth | Not Started |
| 05 | [Four-Window Direct-Scope Brief](05-four-window-direct-scope-brief/scope.md) | `overlay:brief` | 04 | SCN-008-006, SCN-008-007, SCN-008-010 | `rlportfoliobrief.js`, Brief tab, four-window fixtures | Not Started |
| 06 | [Explainable Research Action Lifecycle](06-explainable-research-action-lifecycle/scope.md) | `overlay:brief` | 05 | SCN-008-008, SCN-008-009, SCN-008-034 | brief composer, why-shown UI, action lifecycle | Not Started |
| 07 | [Return And Drawdown X-Ray](07-return-and-drawdown-x-ray/scope.md) | `overlay:risk` | 06 | SCN-008-013, SCN-008-014 | analytics, Risk X-Ray route, chart/table | Not Started |
| 08 | [Concentration CAPM And Risk Contribution](08-concentration-capm-and-risk-contribution/scope.md) | `overlay:risk` | 07 | SCN-008-015, SCN-008-016, SCN-008-017 | analytics, Risk X-Ray Simple/Power | Not Started |
| 09 | [Dependent Path Reproducibility](09-dependent-path-reproducibility/scope.md) | `overlay:paths` | 08 | SCN-008-018, SCN-008-019 | analytics, Path Lab, path chart/table | Not Started |
| 10 | [Dated Cash Needs And Survival States](10-dated-cash-needs-and-survival-states/scope.md) | `overlay:paths` | 09 | SCN-008-020, SCN-008-021 | analytics, Path Lab timeline and states | Not Started |
| 11 | [Stress Tail And Alternative Dependence](11-stress-tail-and-alternative-dependence/scope.md) | `overlay:diversification` | 10 | SCN-008-022, SCN-008-023, SCN-008-024 | analytics, Diversification matrix/table | Not Started |
| 12 | [Hedge Variant Research](12-hedge-variant-research/scope.md) | `overlay:diversification` | 11 | SCN-008-025 | analytics, hedge comparison UI | Not Started |
| 13 | [Six-Method Allocation Basis And Feasibility](13-six-method-allocation-basis-and-feasibility/scope.md) | `overlay:allocation` | 12 | SCN-008-026, SCN-008-027, SCN-008-029 | analytics, Allocation Comparison | Not Started |
| 14 | [Allocation Sensitivity And Explicit Black-Litterman](14-allocation-sensitivity-and-explicit-black-litterman/scope.md) | `overlay:allocation` | 13 | SCN-008-028, SCN-008-030 | analytics, sensitivity UI, BL editor | Not Started |
| 15 | [Walk-Forward Research Dossier And Claim Boundaries](15-walk-forward-research-dossier-and-claim-boundaries/scope.md) | `overlay:dossier` | 14 | SCN-008-031, SCN-008-032, SCN-008-033 | analytics, dossier store/UI, claim validators | Not Started |
| 16 | [Integrated Route Accessibility And Atomic Release](16-integrated-route-accessibility-and-atomic-release/scope.md) | `release:atomic` | 15 | SCN-008-036 | six-tab route, mobile/a11y, `rlnav.js`, registries, notes | Not Started |

## Stable Scenario Distribution

Every stable Feature 008 scenario has exactly one owning scope. The manifest supplies the exact Gherkin contract, persistent test title, assertion list, and evidence target.

| Scope | Scenario Count | Scenario IDs |
|-------|----------------|--------------|
| 01 | 2 | SCN-008-001 through SCN-008-002 |
| 02 | 2 | SCN-008-003 through SCN-008-004 |
| 03 | 2 | SCN-008-011 through SCN-008-012 |
| 04 | 2 | SCN-008-005, SCN-008-035 |
| 05 | 3 | SCN-008-006, SCN-008-007, SCN-008-010 |
| 06 | 3 | SCN-008-008, SCN-008-009, SCN-008-034 |
| 07 | 2 | SCN-008-013 through SCN-008-014 |
| 08 | 3 | SCN-008-015 through SCN-008-017 |
| 09 | 2 | SCN-008-018 through SCN-008-019 |
| 10 | 2 | SCN-008-020 through SCN-008-021 |
| 11 | 3 | SCN-008-022 through SCN-008-024 |
| 12 | 1 | SCN-008-025 |
| 13 | 3 | SCN-008-026, SCN-008-027, SCN-008-029 |
| 14 | 2 | SCN-008-028, SCN-008-030 |
| 15 | 3 | SCN-008-031 through SCN-008-033 |
| 16 | 1 | SCN-008-036 |
| **Total** | **36** | **SCN-008-001 through SCN-008-036** |

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

## Shared Change Boundaries

- Allowed Feature 008 families are the new route/config/modules, `tests/fixtures/portfolio-survival-allocation/**`, design-named Feature 008 test files, additive `rldata.js`/`rlnav.js` changes, and the four release registration surfaces named in Scope 16.
- Existing generic Market Brief payloads, snapshots, history, config, HTML, publisher scripts, and scheduler are read-only consumers or boundary-test subjects; they are not personalized or rewritten.
- Existing Feature 001-007 artifacts, tests, tools, and concurrent dirty work remain untouched except for additive shared-module canaries explicitly named by a scope.
- No scope introduces a project CLI, package, remote portfolio service, external provider dependency, service worker, trade execution path, personalized-advice output, or hidden configuration value.
- The fixture overlay is deterministic and offline. Production HTML/JS is served unchanged, and Playwright request interception is prohibited.

## Release Transaction

The route remains directly testable and unregistered through Scopes 01-15. Scope 16 adds `index.html`, `tools.json`, `rlnav.js`, `README.md`, and `notes/portfolio-survival-allocation-lab.md` only after the route, tests, privacy boundary, mobile/accessibility behavior, and canvas/table parity satisfy their focused gates. Registry rollback removes that additive transaction without touching generic Market Brief artifacts or browser personal keys.
