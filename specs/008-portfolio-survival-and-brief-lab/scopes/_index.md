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
| 01 | [Private Portfolio Import And Atomic Store](01-private-portfolio-import-and-atomic-store/scope.md) | `foundation:true` | - | SCN-008-001, SCN-008-002 | config, `rlportfolio.js`, setup route, fixtures | Done |
| 02 | [Mandate And Cash-Need Authority](02-mandate-and-cash-need-authority/scope.md) | `foundation:true` | 01 | SCN-008-003, SCN-008-004 | private contracts, mandate editor, route states | Done |
| 03 | [Local Behavior, Privacy Inventory, And Clear](03-local-behavior-privacy-inventory-and-clear/scope.md) | `foundation:true` | 02 | SCN-008-011, SCN-008-012 | private store, privacy UI, lifecycle fixtures | Done |
| 04 | [Public Evidence Barrier And Coverage](04-public-evidence-barrier-and-coverage/scope.md) | `foundation:true` | 03 | SCN-008-005, SCN-008-035 | `rldata.js`, generic evidence, privacy boundary, partial truth | Done |
| 05 | [Four-Window Direct-Scope Brief](05-four-window-direct-scope-brief/scope.md) | `overlay:brief` | 04 | SCN-008-006, SCN-008-007, SCN-008-010 | `rlportfoliobrief.js`, Brief tab, four-window fixtures | Done |
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
| interests (`interestSignals`) | Swept, but vacuously: `validateWorkspace` refuses any workspace with `interestSignals.length > 0` as `unsupported-contract-scope`, so no record can exist at this contract version | **Scope 06**, SCN-008-037 / TP-06-08 | Scope 06 implementation item 1 adds `deriveInterestSignals` in `rlportfoliobrief.js`, the first and only producer. TP-06-08 runs `tests/portfolio-privacy.functional.mjs`, the file carrying Scope 03's clear proof. |
| outcomes (`actionOutcomes`) | Swept, but vacuously: the schema validates entries, yet no exported builder can hash one into a workspace | **Scope 06**, SCN-008-037 / TP-06-08 | Scope 06 owns completion and dismissal (FR-045 through FR-046, FR-051 through FR-055), which is what produces an action outcome. |
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

## Shared Change Boundaries

- Allowed Feature 008 families are the new route/config/modules, `tests/fixtures/portfolio-survival-allocation/**`, design-named Feature 008 test files, additive `rldata.js`/`rlnav.js` changes, and the four release registration surfaces named in Scope 16.
- Existing generic Market Brief payloads, snapshots, history, config, HTML, publisher scripts, and scheduler are read-only consumers or boundary-test subjects; they are not personalized or rewritten.
- Existing Feature 001-007 artifacts, tests, tools, and concurrent dirty work remain untouched except for additive shared-module canaries explicitly named by a scope.
- No scope introduces a project CLI, package, remote portfolio service, external provider dependency, service worker, trade execution path, personalized-advice output, or hidden configuration value.
- The fixture overlay is deterministic and offline. Production HTML/JS is served unchanged, and Playwright request interception is prohibited.

## Release Transaction

The route remains directly testable and unregistered through Scopes 01-15. Scope 16 adds `index.html`, `tools.json`, `rlnav.js`, `README.md`, and `notes/portfolio-survival-allocation-lab.md` only after the route, tests, privacy boundary, mobile/accessibility behavior, and canvas/table parity satisfy their focused gates. Registry rollback removes that additive transaction without touching generic Market Brief artifacts or browser personal keys.

## Feature Completion Gate

Feature 008 has no separate feature-level report artifact. This section is the feature-level completion gate, and **Scope 16 is its execution site** because Scope 16 is the last scope, is tagged `release:atomic`, and transitively depends on all fifteen predecessors.

### Two Traceability Levels, Deliberately Separated

A per-scope Build Quality Gate that demanded whole-feature traceability would make every scope unclosable until all sixteen shipped, which inverts scope isolation and forces big-bang delivery. The two levels are therefore split:

| Level | Command | Enforced at | Passes when |
|-------|---------|-------------|-------------|
| Scope-local | `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope` | Every scope's Build Quality Gate | No failure names that scope's own files, while that scope is the active scope in `state.json` |
| Whole-feature | `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes` | This gate, executed in Scope 16 | `RESULT: PASSED` across all 36 scenarios and all 16 scopes |

The scope-local mode is the guard's own `--current-scope` scope-universe mode. It derives its universe only from `state.json`, so a scope cannot widen or narrow its own slice.

### Whole-Feature Requirements (Scope 16 Only)

Relocated here from the per-scope gates; nothing is dropped.

- [ ] `--all-scopes` traceability reports `RESULT: PASSED` with zero failures.
- [ ] Every `scenario-manifest.json` `linkedTest` path exists on disk, including `tests/portfolio-survival-brief.spec.mjs`, `tests/portfolio-survival-risk.spec.mjs`, `tests/portfolio-survival-paths.spec.mjs`, `tests/portfolio-survival-diversification.spec.mjs`, `tests/portfolio-survival-allocation.spec.mjs`, and `tests/portfolio-survival-mobile.spec.mjs`.
- [ ] Every one of the 36 `SCN-008-*` scenarios maps to a Test Plan row that references an existing concrete test file.
- [ ] Gate G068 Gherkin-to-DoD content fidelity reports zero unmapped scenarios across all 16 scopes.

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

