# Feature 008 Boundary Attribution Registry

This registry is planning authority for exact Feature 008 scope attribution.
It is independent of generated or implementation-owned manifest data.
A validator must parse this registry before reading any manifest-derived cache.
The registry resolves attributed production, configuration, DOM, test, support, fixture, validator, canary, command-registry, and planning identities.

## Closed Registry Contract

Every scope section contains one Markdown table with these columns in this exact order:

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|

- `Path` is one normalized, repository-relative POSIX file path. Absolute paths, empty paths, directory paths, globs, backslashes, `.` segments, `..` segments, URLs, and generated path expansion are invalid.
- `Identity Kind` is exactly one of `whole-file`, `exported-symbol`, `local-symbol`, `marker`, `marker-pair`, `hunk`, `test-title`, `config-key`, or `dom-id`.
- `Identity` is the exact structural identity in the current target bytes. `whole-file` uses `—`. A `dom-id` is the exact `id` value without a leading `#`. A `config-key` is the exact key or dotted key path. A `test-title` is the complete executable test title. Symbol and hunk identities include the stable declaration or hunk anchor needed to distinguish the target from every other construct in the file.
- A `marker-pair` identity uses exactly `[`_start JSON string_`,`_end JSON string_`]`. Both JSON strings must decode successfully, each marker must resolve exactly once, and the start marker must precede the end marker. The attributed identity is the inclusive byte span from the start marker through the end marker.
- `Role` is exactly one of `production`, `config`, `dom`, `test`, `support`, `fixture`, `validator`, `canary`, `command-registry`, or `planning`.
- `Ownership Mode` is exactly `exclusive` or `ordered-evolution`. An `exclusive` row uses `—` for both `Chain ID` and `Ordered Scope IDs`. An `ordered-evolution` row uses a non-empty stable chain ID and a comma-separated sequence of at least two zero-padded scope IDs, with no spaces or duplicates, in dependency order.
- A literal pipe inside a cell is encoded as `\|`. The parser splits the Markdown row first and then unescapes `\|` exactly once. An unescaped extra pipe, a dangling escape, an HTML entity used in place of a pipe, or any row with other than seven decoded cells fails closed.
- `—` is the only non-applicable sentinel. Blank cells, `N/A`, `none`, and inferred values are invalid.

Each row must resolve structurally and exactly once in the current bytes of its declared path. Zero matches, multiple matches, a path-only match for a non-`whole-file` identity, duplicate rows, overlapping rows without one identical ordered-evolution declaration, or a row derived only from an allowed path fails closed. Different identities in one file remain different ownership tuples.

The verifier checks containment twice. Lexical normalization must remain under the repository root before filesystem access. Physical resolution of every path component and the final regular file must also remain under that root. A missing path, directory target, broken link, symlink escape, special file, or lexical and physical target mismatch fails closed.

The parser reads this file directly by the exact `## Scope NN` heading and exact table header. It must not read a claim manifest, generated cache, allowed-family list, report path list, or implementation inventory to discover, expand, repair, or default registry rows. A manifest may supply authoring candidates only; it has no parsing or verification authority. Unknown headings inside the registry body, duplicate scope headings, duplicate tables, prose rows treated as data, unknown enum values, malformed marker pairs, undeclared cross-scope overlap, incomplete evolution chains, and any parser ambiguity fail closed before attribution succeeds.

For consumer claims, this registry exhaustively attributes the participating identities but does not infer which test observes which consumer. The owning scope plan declares each exact producer-to-consumer-to-test causal binding; generated or implementation-owned manifest data cannot select or override that carrier.

## Scope 03

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolio.js | local-symbol | `var BEHAVIOR_EVENT_VERSION = "BehaviorEvent/v1";` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function privacyInventory(workspace, storageAdapters, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function clearAllPersonalData(request)` | production | ordered-evolution | scope-03-17-clear-all-personal-data-evolution | 03,17 |
| portfolio-survival-allocation-lab.html | dom-id | `privacyPanel` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function renderPrivacyCategories()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("clearBehavior").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.contractVersion` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.forbiddenEventFields` | config | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `privacy inventory reports real category counts and carries no stored subject value` | test | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity` | test | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | test-title | `behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline` | test | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | test-title | `Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio` | test | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | test-title | `Regression: SCN-008-012 behavior evidence excludes engagement and sensitive profiling` | test | exclusive | — | — |

## Scope 04

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rldata.js | marker | `Feature 008 Scope 04/19: coverage-aware bar reads` | production | ordered-evolution | coverage-04-19 | 04,19 |
| rldata.js | hunk | `function ensureBarCoverage(sym, interval, target, sourcePolicy)` | production | ordered-evolution | coverage-04-19 | 04,19 |
| rldata.js | hunk | `function barAlignmentStates(symbols, interval, policy)` | production | exclusive | — | — |
| rlportfolio.js | marker-pair | `["/* ---------- Feature 008 Scope 04: public tool-read barrier ----------","/* ---------- End Feature 008 Scope 04 ---------- */"]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `holdingTruth` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `truthSummary` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `truthRows` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `Feature 008 Scope 04: render what each holding's evidence supports.` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function holdingEvidence(holdings)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `function renderHoldingTruth()` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `analytics.targetHistoryCalendarYears` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `display.localNetworkPolicy` | config | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `SCN-008-005 TP-04-01: bar coverage is measured from actual dates and same-origin-only never issues a request` | test | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `SCN-008-035 TP-04-01: absent coverage is unavailable and no missing value is substituted` | test | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `SCN-008-005 TP-04-01: ensureBarCoverage is additive — legacy bars behaviour and cache keys are unchanged` | test | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `SCN-008-035 TP-04-01: the truth-state projection names each impact and never substitutes a missing value` | test | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `SCN-008-035 TP-04-01: an unknown evidence state is refused rather than defaulted to current` | test | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `SCN-008-035 TP-04-01: undeclared alignment properties report undeclared and are never assumed` | test | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `SCN-008-035 TP-04-01: a mismatched trading calendar is measured against a real basis and named per date` | test | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | test-title | `SCN-008-005 TP-04-02: no publisher script imports the personal module or names a personal storage key` | test | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | test-title | `SCN-008-005 TP-04-02: the personal-key scan is non-vacuous — it detects a real committed leak` | test | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | test-title | `SCN-008-005 TP-04-02: a publisher subprocess given sentinel env and argv emits no personal value` | test | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | test-title | `SCN-008-005 TP-04-02: the publisher boundary run mutates no tracked public artifact` | test | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | test-title | `Regression: SCN-008-005 TP-04-05 personal state coexists with the shared cache and the only published read is the constant privacy boundary` | test | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | test-title | `Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth` | test | exclusive | — | — |
| scripts/selftest.mjs | marker | `Feature 008 Scope 04 shared-consumer canary` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 04 TP-04-04: every legacy RLDATA consumer method survives the additive block` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 04 TP-04-04: the additive ensureBarCoverage method is present` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 04 TP-04-04: the additive barAlignmentStates method is present` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 04 TP-04-04: coverage reports the actual observed span` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 04 TP-04-04: a coverage read leaves the rows legacy callers see byte-identical` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 04 TP-04-04: the canary reached the network zero times (recorder, not an omitted binding)` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 04 TP-04-04: RLDATA accepts the constant privacy-boundary read as the tool\u2019s only publication` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 04 TP-04-04: the shared public cache carries no holding, conclusion, or personal storage name` | canary | exclusive | — | — |

## Scope 08

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolioanalytics.js | marker | `Scope 08 concentration` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function computeConcentration(holdings, lens)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function riskContributions(symbols, weights, covariance, options)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `Scope 08 diagnostics` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `analytics.minimumCapmObservations` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `analytics.covarianceShrinkageLambda` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `analytics.riskReconciliationTolerance` | config | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-08-01 concentration reports missing exposure rather than bucketing it` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-08-01 risk contributions reconcile to total risk within tolerance` | test | exclusive | — | — |
| tests/portfolio-survival-risk.spec.mjs | test-title | `Regression: SCN-008-015 concentration lenses expose overlap and missing look through` | test | exclusive | — | — |

## Scope 09

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolioanalytics.js | marker | `Scope 09 dependent paths` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function mulberry32(seed)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function stationaryBootstrapIndices(sampleSize, drawCount, meanBlock, random)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function parameterGrid(range, drawCount)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function runScenario(spec, sampleReturns, options)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `Scope 09 Path Lab` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function drawPathFan(canvas, result)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function appendPathLab(panel)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var candidate = api.buildScenarioCandidate(` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `calibration.stationaryBootstrapMeanBlockSessions` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `calibration.pathCount` | config | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-09-01 the same specification reproduces byte-identical results` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-09-01 ADVERSARIAL changing seed or block policy creates a distinct identity and result` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-09-01 no Math.random, ambient clock, or hidden seed reaches the path engine` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-09-01 stationary bootstrap preserves blocks and wraps cyclically` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-09-01 path randomness and parameter uncertainty are reported separately` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-09-01 ADVERSARIAL IID is labelled a simplification, never an equal alternative` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-09-01 the scenario contract is exact and refuses incomplete or contradictory specs` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-09-01 the parameter grid is deterministic and stratified` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-09-01 fan bands come from the same streams as the terminals and widen with horizon` | test | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | test-title | `Regression: SCN-008-018 identical stationary bootstrap specification reproduces paths` | test | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | test-title | `Regression: SCN-008-019 parameter uncertainty is separate from path randomness` | test | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | test-title | `Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear` | test | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | test-title | `Regression: Feature 008 dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom` | test | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | test-title | `Regression: Feature 008 Path Lab refuses rather than generating a path without evidence` | test | exclusive | — | — |
| rlportfolio.js | hunk | `"allocations", "dossiers", "scenarios", "semanticFingerprint", "updatedAt"` | production | exclusive | — | — |
| rlportfolio.js | hunk | `scenarios: value.scenarios,` | production | exclusive | — | — |
| rlportfolio.js | hunk | `scenarios: [],` | production | exclusive | — | — |
| rlportfolio.js | hunk | `!Array.isArray(value.scenarios)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function buildScenarioCandidate(identity, label, summary, currentWorkspace, now, policy)` | production | exclusive | — | — |
| rlportfolio.js | hunk | `category("scenarios", workspace.scenarios.length, "all-personal")` | production | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | marker | Scope 09 declared `scenarios` | test | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | hunk | `api.buildScenarioCandidate(` | test | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | marker | Scope 09 gave `scenarios` a real write path | test | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | hunk | `api.buildScenarioCandidate(` | test | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | hunk | `'quarantine', 'scenarios', 'session-fallback'` | test | exclusive | — | — |

## Scope 16

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| portfolio-survival-allocation-lab.html | marker | `data-tool-id="portfolio-survival-allocation-lab"` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `workspaceTabBrief` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `modeSeg` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `{ hash: "brief", tab: "workspaceTabBrief" },` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("briefIdentity").setAttribute("data-policy-version", String(identity.behaviorPolicyVersion));` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("behaviorPolicyInputs").setAttribute("data-policy-version", String(behaviorPolicy.contractVersion));` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `setText("policyVersion", state.policy.display.policyLabel + " · validated");` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `contractVersion` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `display.defaultWorkspaceHash` | config | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_VIEW_MODEL_VERSION = "PortfolioWorkspaceViewModel/v1";` | production | ordered-evolution | workspace-16-26 | 16,26 |
| rlportfolio.js | exported-symbol | `function computeWorkspace(context, evidence, policy)` | production | ordered-evolution | workspace-16-26 | 16,26 |
| scripts/selftest.mjs | marker | `the released portfolio route is published rather than excluded` | canary | exclusive | — | — |
| rlnav.js | hunk | `{ label: "Portfolio Survival", full: "Portfolio Survival & Allocation Lab", icon: "🧭", file: "portfolio-survival-allocation-lab.html", group: "Strategy & Validation" },` | command-registry | exclusive | — | — |
| tools.json | hunk | `"id": "portfolio-survival-allocation-lab",` | command-registry | exclusive | — | — |
| index.html | hunk | `id: 'portfolio-survival-allocation-lab',` | command-registry | exclusive | — | — |
| README.md | hunk | ``[`🧭 Portfolio Survival & Allocation Lab`](portfolio-survival-allocation-lab.html)`` | command-registry | exclusive | — | — |
| notes/portfolio-survival-allocation-lab.md | whole-file | — | planning | exclusive | — | — |
| simple-models.json | hunk | `"definitionId": "simple-model/portfolio-survival/v1",` | config | exclusive | — | — |
| journeys.json | hunk | `"goalId": "mandate-survival-review",` | config | exclusive | — | — |
| journeys.json | hunk | `"goalId": "allocation-stability-review",` | config | exclusive | — | — |
| rlexperience-adapters/portfolio-research.js | whole-file | — | production | exclusive | — | — |
| tool-experience.config.json | hunk | `"rlexperience-adapters/portfolio-research.js",` | config | exclusive | — | — |
| scripts/validate-tool-experience.mjs | hunk | `{ path: '../rlexperience-adapters/portfolio-research.js', factory: 'registerPortfolioResearchAdapters', deps: () => undefined }` | validator | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | test-title | `Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity` | test | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | test-title | `Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile` | test | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | test-title | `Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom` | test | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | test-title | `Regression: SCN-008-036 registration rlnav tools index README and note form one atomic release transaction` | test | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | test-title | `Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs` | test | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | test-title | `TP-16-12 SCN-008-041 every personal category the finished route can create is swept by one full-personal clear` | test | exclusive | — | — |

## Scope 17

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolio.js | local-symbol | `var PORTFOLIO_DRAFT_VERSION = "PortfolioDraft/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_IDENTITY_VERSION = "WorkspaceIdentity/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var PERSONAL_CATEGORY_REGISTRY_VERSION = "PersonalCategoryRegistry/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var CLEAR_TOMBSTONE_VERSION = "ClearTombstone/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var FULL_CLEAR_RESULT_VERSION = "FullClearResult/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var PORTFOLIO_DRAFT_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var HOLDING_EDITABLE_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function validatePortfolioDraft(value, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function createPortfolioDraft(currentWorkspace, now, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function addHoldingRow(draft, row, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function editHoldingRow(draft, holdingId, patch, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function removeHoldingRow(draft, holdingId, policy)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function revisionFromPortfolioDraft(draft, now, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function buildEmptyPortfolioRevision(draft, now, policy)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function workspaceIdentityProjection(workspace, activeRevision)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function createEmptyControllerPersonalState()` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function derivePersonalCategoryRegistry(request)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function validateClearTombstone(value, policy)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function buildClearTombstone(registry, expectedGeneration, now, policy)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function commitClearTombstone(storageAdapters, tombstone, expectedGeneration, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function clearAllPersonalData(request)` | production | ordered-evolution | scope-03-17-clear-all-personal-data-evolution | 03,17 |
| rlportfolio.js | exported-symbol | `function confirmPortfolioDraft(store, draft, expectedGeneration, now)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `fullClearConfirmation` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `emergencyClear` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `holdingEditorHeading` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `beginHoldingEdit` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `holdingEditorPanel` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `holdingEditorRows` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `holdingEditorEmpty` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `addHoldingRow` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `applyHoldingEdit` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `confirmHoldingRevision` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `cancelHoldingRevision` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `holdingEditorResult` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `CLEAR ALL LOCAL DATA` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function clearControllerAdapter()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function renderHoldingEditor()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("beginHoldingEdit").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("addHoldingRow").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("holdingEditorRows").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("applyHoldingEdit").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("confirmHoldingRevision").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("cancelHoldingRevision").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("emergencyClear").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `Full personal data cleared · every durable and live category verified empty` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `storage.displayModeKey` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `storage.returnContextKey` | config | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `SCN-008-042 immutable PortfolioDraft lifecycle preserves stable holdings and commits an honest empty revision` | test | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence` | test | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | local-symbol | `function scope17ClearFixture(api, policy, options = {})` | fixture | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | test-title | `SCN-008-042 and SCN-008-043 multi-row revision and full clear round trip through fresh adapters and controller inspection` | test | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | test-title | `Adversarial: full personal clear detects undeclared keys live state and arbitrary residue` | test | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | test-title | `Regression: SCN-008-042 holdings can be added edited removed and cleared to an honest empty portfolio` | test | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | test-title | `Regression: SCN-008-043 full personal clear tombstones derives and verifies every personal category` | test | exclusive | — | — |
| scripts/validate-spec-test-paths.mjs | exported-symbol | `function collectStructuredTestPathStates(root = ROOT, specsDir = SPECS_DIR)` | validator | exclusive | — | — |
| scripts/validate-spec-test-paths.mjs | local-symbol | `function isPlannedOnlyGroup(rows)` | validator | exclusive | — | — |
| scripts/selftest.mjs | marker | `TP-17-06 planned-only missing paths are reported but do not fail while the owning scope is Not Started` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `TP-17-06 an existing referenced path passes without a baseline entry` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `TP-17-06 a planned row cannot mask the identical path referenced actively by another spec` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `TP-17-06 an authored row with a missing path fails even when its owning scope is Not Started` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `TP-17-06 a scan with zero references still fails instead of becoming vacuously green` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `TP-17-06 the frozen baseline still ratchets known active debt without accepting a new path` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `TP-17-06 a paid-down baseline entry is reported stale so the baseline can only shrink` | canary | exclusive | — | — |

## Scope 18

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolio.js | local-symbol | `var BEHAVIOR_EVENT_IDENTITY_VERSION = "BehaviorEventIdentity/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var BEHAVIOR_OCCURRENCE_VERSION = "BehaviorOccurrence/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var LEGACY_BEHAVIOR_EVENT_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var BEHAVIOR_EVENT_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var BEHAVIOR_EVENT_DRAFT_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | marker | `Retained only for persisted BehaviorEvent/v1 rows written before Scope 18.` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function legacyBehaviorDedupePayload(event)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function legacyBehaviorIdentityPayload(event)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function behaviorIdentityPayload(event)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function canonicalBehaviorIdentity(event, policy)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function newYorkCivilDate(occurredAt)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function buildBehaviorOccurrence(eventIdentity, occurredAt)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function readLegacyBehaviorEventV1(value, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function validateBehaviorEvent(value, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function buildBehaviorEvent(draft, options, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function dedupeBehaviorEvents(events, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function buildBehaviorCandidate(draft, currentWorkspace, options, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function deriveInterestSignals(workspace, now, policy)` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function dedupeBehaviorEvents(input)` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function deriveInterestSignals(input)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var RANK_PRIORITY = Object.freeze({` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function rankValue(dimension, value)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function compareRankedActions(left, right)` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function rankResearchActions(input)` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function composePortfolioBrief(input, policy)` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function whyShown(actionId, rankResult, genericWindow)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `behaviorRankingFingerprint: state.behaviorRankResult ? state.behaviorRankResult.rankingFingerprint : null,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var deduped = window.RLPORTFOLIOBRIEF.dedupeBehaviorEvents({` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function rankCandidate(item, value)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var interestResult = window.RLPORTFOLIOBRIEF.deriveInterestSignals({` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var ranked = window.RLPORTFOLIOBRIEF.rankResearchActions({` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var composed = window.RLPORTFOLIOBRIEF.composePortfolioBrief(Object.assign({}, compositionInput, {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var whyResult = window.RLPORTFOLIOBRIEF.whyShown(actionId, ranked.value, state.genericWindow);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function behaviorRanking()` | production | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | marker | `Scope 18 TP-18-01/04: canonical behavior identity and rank` | test | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | local-symbol | `function canonicalBehaviorRecord(policy, overrides = {})` | fixture | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | local-symbol | `function canonicalAction(overrides = {})` | fixture | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | test-title | `SCN-008-044 behavior identity civil time distinct floors and global ranking are canonical` | test | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | test-title | `Adversarial: behavior identity and temporal guards prevent false relevance` | canary | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | test-title | `semantic de-duplication collapses repeated meaning while retaining distinct occurrences` | test | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | test-title | `SCN-008-044 TP-18-02 canonical behavior and rank references stay minimal and full clear removes them without public-state loss` | test | exclusive | — | — |
| tests/portfolio-survival-brief.spec.mjs | test-title | `Regression: SCN-008-044 behavior identity decay floor and ranking remain canonical across every projection` | test | exclusive | — | — |

## Scope 19

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rldata.js | local-symbol | `function yahooCoverageSnapshot(j)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function pagesBarSnapshot(sym)` | production | exclusive | — | — |
| rldata.js | hunk | `return pagesBarSnapshot(sym).then(function (snapshot) { return snapshot ? snapshot.rows : null; });` | production | exclusive | — | — |
| rldata.js | marker | `Feature 008 Scope 04/19: coverage-aware bar reads` | production | ordered-evolution | coverage-04-19 | 04,19 |
| rldata.js | local-symbol | `function measureBarCoverageLegacy(sym, interval, policy)` | production | exclusive | — | — |
| rldata.js | local-symbol | `var COVERAGE_TARGET_FIELDS = [` | production | exclusive | — | — |
| rldata.js | local-symbol | `var COVERAGE_SOURCE_FIELDS = [` | production | exclusive | — | — |
| rldata.js | local-symbol | `function coverageExactFields(value, fields)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function coverageDate(value)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function subtractCalendarYears(date, years)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function coverageValidation(target, sourcePolicy)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function coverageRowSignature(row, transform)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function coverageSource(sourceId, rows, currency, transform, corporateActionState)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function addCoverageRows(state, source)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function appendAbsentCoverageRows(sym, interval, source, disputed)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function coverageUnavailable(sym, interval, target, sourcePolicy, reasons)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function coverageResult(sym, interval, target, sourcePolicy, state, requestState)` | production | exclusive | — | — |
| rldata.js | local-symbol | `function acquireBarCoverage(sym, interval, target, sourcePolicy)` | production | exclusive | — | — |
| rldata.js | hunk | `function ensureBarCoverage(sym, interval, target, sourcePolicy)` | production | ordered-evolution | coverage-04-19 | 04,19 |
| scripts/selftest.mjs | marker | `Scope 19 TP-19-01: the exact four-argument coverage contract is Promise-based` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 19 TP-19-01: actual cached dates, not requested labels or row count, determine partial coverage` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 19 TP-19-01: same-origin-only attempts only the explicit static snapshot and never a provider` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 19 TP-19-01: an inconsistent target fails before cache mutation or request` | canary | exclusive | — | — |
| scripts/selftest.mjs | marker | `Scope 19 TP-19-01: ensureBars name, Promise behavior, arguments and cached rows remain compatible` | canary | exclusive | — | — |
| tests/portfolio-bar-coverage.functional.mjs | whole-file | — | test | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | local-symbol | `const SCOPE19_MSFT_SNAPSHOT = JSON.parse(readFileSync(resolve(ROOT, 'data/bars/MSFT.json'), 'utf8'));` | fixture | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | local-symbol | `const SCOPE19_MSFT_DATES = SCOPE19_MSFT_SNAPSHOT.rows` | fixture | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | local-symbol | `function subtractCalendarYears(date, years)` | fixture | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | test-title | `Regression: SCN-008-045 five year coverage measures dates appends allowed sources and preserves partial truth` | test | exclusive | — | — |

## Scope 20

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfoliobrief.js | hunk | `root.RLPORTFOLIOBRIEF = api;` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `if (typeof module === "object" && module && typeof module.exports === "object") module.exports = api;` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function contractErr(code, reason, field, row, recoverable)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var GENERIC_WINDOW_FIELDS = [` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var SNAPSHOT_REF_FIELDS = [` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var PAYLOAD_REF_FIELDS = [` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var HISTORY_REF_FIELDS = [` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var WATCHLIST_REF_FIELDS = [` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var OWNER_READ_REF_FIELDS = [` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var GENERIC_STATES = [` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var HASH_RE = /^sha256:[a-f0-9]{64}$/;` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function exactFields(value, fields)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function stringArray(value)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function civilParts(instant, timezone)` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function newYorkCivilCutoff(date, time)` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function windowCutoffAt(windows, windowId, instant)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function validSnapshotRef(value)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function validPayloadRef(value)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function validHistoryRef(value)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function validWatchlistRef(value)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `function validOwnerReadRef(value, cutoffAt)` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function validateGenericWindow(input, policy, clock)` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function buildActionCandidates(input, policy)` | production | exclusive | — | — |
| rlportfoliobrief.js | local-symbol | `var LIFECYCLE_STATES = Object.freeze({` | production | exclusive | — | — |
| rlportfoliobrief.js | exported-symbol | `function reduceResearchActionLifecycle(actions, transition, now)` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `if (entry.observedAt <= cutoffAt && !historyByEvidence[entry.evidenceFingerprint]) historyByEvidence[entry.evidenceFingerprint] = clone(entry);` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `var publisherIdentity = canonicalFingerprint("portfolio-generic-publisher", "portfolio-generic-publisher/v1", {` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `historyIdentities: selectedHistoryRefs.map(function (entry) { return entry.evidenceFingerprint; })` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `var genericEvidenceIdentity = canonicalFingerprint("portfolio-generic-evidence", "portfolio-generic-evidence/v1", {` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `function rankResearchActions(input)` | production | exclusive | — | — |
| rlportfoliobrief.js | marker-pair | `["var queue = input.policy.queue;","return contractErr(\"P008-CONFIG\", \"visible-action-cap-missing\", \"policy.queue\", null, false);\n    }"]` | production | exclusive | — | — |
| rlportfoliobrief.js | marker-pair | `["var policyFingerprint = canonicalFingerprint(\"portfolio-behavior-rank-policy\", \"portfolio-behavior-rank-policy/v1\", {","rankingFingerprint: rankingFingerprint\n    }));"]` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `function composePortfolioBrief(input, policy)` | production | exclusive | — | — |
| rlportfoliobrief.js | marker-pair | `["if (input.genericWindow !== undefined &&","return contractErr(\"P008-BRIEF-EVIDENCE\", \"generic-window-rank-identity-mismatch\", \"genericWindow\", null, false);\n    }"]` | production | exclusive | — | — |
| rlportfoliobrief.js | marker-pair | `["legacy.value.behaviorRankResult = input.behaviorRankResult;","legacy.value.suppressedActions = input.behaviorRankResult.suppressedActions;"]` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `function whyShown(actionId, rankResult, genericWindow)` | production | exclusive | — | — |
| rlportfoliobrief.js | marker | `contractVersion: "BehaviorWhyShown/v1",` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `newYorkCivilCutoff: newYorkCivilCutoff,` | production | exclusive | — | — |
| rlportfoliobrief.js | hunk | `windowCutoffAt: windowCutoffAt,` | production | exclusive | — | — |
| rlportfoliobrief.js | marker | `validateGenericWindow: validateGenericWindow,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<script src="rlportfoliobrief.js"></script>` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `portfolioBrief` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `briefWindow` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `briefTimes` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `briefStates` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `briefIdentity` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `briefLanes` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `briefClearConfirmation` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `briefClearHistory` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `briefLifecycleResult` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `briefNoAction` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker-pair | `["publicWatchlist: [],","genericEvidenceSourceCount: 0,"]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker-pair | `["genericEvidenceState: state.genericWindow ? state.genericWindow.state :","visibleActionCap: state.behaviorRankResult ? state.behaviorRankResult.visibleActionCap : null,"]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function briefWatchlist()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function briefCompletions(behaviorCutoffAt)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function briefEvidence(subjects, completions)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function renderBrief()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function publicArtifactFingerprint(sourceKind, value)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function newYorkCivilDate(instant)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function newYorkCivilCutoff(date, time)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function publicIds(rows, kind, preferredFields)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function ownerProjection(artifact, cutoffAt)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function buildGenericWindow(artifacts)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function fetchPublicArtifact(path, parseJson)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function renderBriefWindowOptions(windows)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function loadBriefWindows()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker-pair | `["var candidateCapacity = subjects.length + completions.length + holdings.length + watchlist.length + 1;","compositionPolicy.queue.generalInterestActionCap = candidateCapacity;"]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var candidateBrief = window.RLPORTFOLIOBRIEF.composeBrief(compositionInput);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `genericWindowIdentity: state.genericWindow.genericEvidenceIdentity,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `genericWindow: state.genericWindow` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `why.setAttribute("data-generic-evidence-identity", state.genericWindow.genericEvidenceIdentity);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var validated = window.RLPORTFOLIOBRIEF.validateGenericWindow(input, state.policy, { now: input.composedAt });` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker-pair | `["fetchPublicArtifact(\"market-brief.config.json\", true),","fetchPublicArtifact(\"market-brief.owner-reads.json\", true)"]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker-pair | `["var projection = buildGenericWindow(artifacts);","state.genericEvidenceSourceCount = 5;"]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker-pair | `["state.genericWindow = state.lastValidGenericWindow;","state.genericWindow ? \"preserved-last-valid\" : \"unavailable\""]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `loadBriefWindows();` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("briefTimes").setAttribute("data-generic-window-state", state.genericWindow.state);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("briefIdentity").setAttribute("data-generic-window-identity", state.genericWindow.genericEvidenceIdentity);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `row.setAttribute("data-global-rank", String(rankAction.rankReason.globalRank));` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("briefClearHistory").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("briefWindow").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("briefLanes").addEventListener` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.minimumDistinctCompletions` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.minimumDistinctUtcDates` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.halfLifeDays` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.maximumEvidenceAgeDays` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.mediumScore` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.highScore` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.recentSupportDays` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `behavior.maxBehaviorEvents` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `queue.contractVersion` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `queue.directActionCap` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `queue.generalInterestActionCap` | config | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | local-symbol | `function genericWindow(overrides = {})` | fixture | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | test-title | `SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time` | test | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | test-title | `SCN-008-046 action candidates enforce generic freshness and one lifecycle reducer` | test | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | test-title | `SCN-008-046 every public boundary emits a closed value-safe PortfolioError` | test | exclusive | — | — |
| tests/portfolio-brief.functional.mjs | test-title | `Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract` | canary | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | local-symbol | `function digest(value)` | support | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | local-symbol | `function newYorkCivilLabel(instantMs)` | fixture | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | local-symbol | `function input(overrides = {})` | fixture | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | test-title | `SCN-008-046 all five public artifacts contribute independently to one local generic evidence identity` | test | exclusive | — | — |
| tests/portfolio-survival-brief.spec.mjs | local-symbol | `const BRIEF_SNAPSHOT = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.snapshot.json'), 'utf8'));` | fixture | exclusive | — | — |
| tests/portfolio-survival-brief.spec.mjs | local-symbol | `const WINDOW_IDS = WINDOWS.map((entry) => entry.id);` | fixture | exclusive | — | — |
| tests/portfolio-survival-brief.spec.mjs | test-title | `Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time` | test | exclusive | — | — |
| tests/portfolio-survival-brief.spec.mjs | test-title | `Regression: SCN-008-009 TP-06-04 settings parameters and window changes leave event interest and action identity unchanged` | test | exclusive | — | — |
| tests/portfolio-survival-brief.spec.mjs | test-title | `Regression: SCN-008-046 generic evidence DST policy complete API and global queue remain coherent` | test | exclusive | — | — |
| scripts/selftest.mjs | marker-pair | `["/* ---------- Portfolio brief: owner routing is part of one atomic public-evidence load ----------","} catch (e) { failures++; console.log('  ✗ FAIL (portfolio owner routing group threw): ' + e.message); }"]` | canary | exclusive | — | — |

## Scope 21

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolioanalytics.js | hunk | `contractVersion: "AssetMetricEligibility/v1"` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "RiskDiagnosticSet/v1", state: projectionState, available: false,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `riskStructuredDiagnostics` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function appendRiskXRay(panel)` | production | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-21-01 SCN-008-047 emits complete per-metric eligibility and diagnostic contracts` | test | exclusive | — | — |
| tests/portfolio-risk.functional.mjs | whole-file | `—` | test | exclusive | — | — |
| tests/portfolio-survival-risk.spec.mjs | test-title | `Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth` | test | exclusive | — | — |

## Scope 22

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_KEYS = [` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_EVIDENCE_KEYS = [` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_METHOD_KEYS = [` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_BLOCK_KEYS = ["family", "meanBlockSessions", "wrapPolicy"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_REGIME_KEYS = [` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_FAT_TAIL_KEYS = ["state", "innovationFamily", "tailParameters"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_AVAILABILITY_KEYS = ["state", "reason"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_HORIZON_KEYS = ["startDate", "endDate", "stepFrequency", "stepCount"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_PARAMETER_POLICY_KEYS = ["drawCount", "ranges", "distributions", "gridIdentity"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_PARAMETER_RANGE_KEYS = ["parameter", "low", "high"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_PARAMETER_DISTRIBUTION_KEYS = ["parameter", "family", "parameters"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_REBALANCE_KEYS = ["family", "frequency"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_COST_KEYS = ["currency", "recurringFraction", "timing"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_FLOW_KEYS = ["localId", "amount", "currency", "date", "timing", "label"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_CASH_NEED_KEYS = SCENARIO_FLOW_KEYS.concat(["priority", "treatment"]);` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_SURVIVAL_KEYS = [` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var SCENARIO_UNCERTAINTY_KEYS = ["intervalMethod", "quantiles", "separatePathAndParameter"];` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function validateScenarioFlowRecords(records, keys, requireCashNeedFields)` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `spec.contractVersion !== "ScenarioSpecification/v1"` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function validateScenarioSpecification(spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function canonicalScenarioValue(value)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function scenarioIdentity(spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function scenarioMethodState(spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioComputeFailure(code, details)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioBudget(spec, options)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioParameterRange(spec, parameter)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioParameterValues(spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioSessionDates(spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioPathSeed(spec, pathIndex)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioPathIndices(spec, sampleSize, pathIndex)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioBasePath(spec, sampleReturns, pathIndex, drift)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function firstScenarioSessionOnOrAfter(date, sessionDates)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioScheduledEvents(spec, sessionDates)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioEventRank(event)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function sortScenarioEvents(events)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioCostEvent(spec, session, modeledDate)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioMetrics(values, events, survivalDefinition)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function applyScenarioFlows(spec, baseValues, sessionDates)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scenarioRandomPathId(spec, pathIndex)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function buildScenarioWorkItem(spec, sampleReturns, parameterValues, parameterIndex, pathIndex)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function tokenFailure(token)` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `token.contractVersion !== "ComputeToken/v1"` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function runScenarioChunk(spec, token, cursor, context)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function distributionRecord(values, intervalMethod)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function sequenceExamples(records)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function distributionSource(records, spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function parameterMarginalRecords(work, spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "ScenarioDistributionSet/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function buildScenarioDistributionSet(spec, identity, conditional, parameterMarginal, combined)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function validateDistributionRecord(record)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function validateDistributionSource(source, spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function validateScenarioDistributionSet(set, spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function fanBandsFromPaths(paths, stepCount)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function assembleScenarioResult(spec, work)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function validateScenarioResult(result, spec)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function createScenarioComputeController(options)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function runCompleteScenario(spec, sampleReturns, options)` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `runScenario: runCompleteScenario,` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function runScenarioJob(spec, sampleReturns, options)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `pathComputeOrdinal: 0,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `pathScenario: {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function pathScenarioCashNeeds(startingValue)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `contractVersion: "ScenarioSpecification/v1",` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `workspaceIdentity: "workspace:compute\|portfolio=" + revision.semanticFingerprint +` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function pathScenarioSpecification(seedOverride)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function ensurePathComputeController(workspaceIdentity)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function startPathScenario(prepared)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `result: previous.result` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `window.RLPORTFOLIOANALYTICS.runScenarioJob(spec, prepared.sampleReturns, {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function cancelPathScenario()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var result = state.pathCompute.result;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `pathRunScenario` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `pathCancelScenario` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `pathComputeStatus` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (state.route === "path-lab" && prepared.available &&` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `pathMethodAvailability` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `pathDistributionSet` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var coveredPathCount = needs.length ? r.paths.filter(function (path) {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `cashNeedPathCoverage` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (state.pathCompute.scenarioIdentity \|\| state.pathCompute.tokenId \|\| state.pathCompute.result) {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `state.pathComputeController = null;` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `calibration.scenarioChunkSize` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `calibration.scenarioMaximumWorkUnits` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `calibration.scenarioStartingValue` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `calibration.scenarioDriftRange` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `calibration.scenarioRecurringCostFraction` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `calibration.scenarioCostTiming` | config | exclusive | — | — |
| rlportfolio.js | hunk | `scenarioInputs: []` | production | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `const copyScenario = (value) => JSON.parse(JSON.stringify(value));` | support | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `function scope22Scenario(overrides = {})` | fixture | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `function atPath(target, path)` | support | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-22-01 complete ScenarioSpecification/v1 uses exact keys at every nested boundary` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-22-01 every ScenarioSpecification identity field changes the scenario identity` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-22-01 full requested path count runs deterministically and budget overflow refuses without truncation` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-22-01 deterministic chunks stop at exact boundaries and tokens cancel or supersede without publication` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-22-01 all paths apply costs contributions withdrawals and CashNeeds in exact tie order` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-22-01 ScenarioDistributionSet/v1 is complete and keeps path parameter and combined uncertainty separate` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-22-01 regime and fat-tail method state is structured as calibrated or explicitly unavailable` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `Adversarial: reduced ScenarioSpecification and median only survival cannot pass` | canary | exclusive | — | — |
| tests/portfolio-paths.functional.mjs | whole-file | — | test | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | hunk | `expect(afterClear.pathScenario.computeState, 'the in-memory compute controller is personal scenario state').toBe('idle');` | canary | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | hunk | `expect(afterClear.pathScenario.scenarioIdentity, 'no completed scenario identity survives the full clear').toBeNull();` | canary | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | test-title | `Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path` | test | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | test-title | `Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view` | test | exclusive | — | — |

## Scope 23

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolioanalytics.js | marker | `Scope 23 - complete dependence, appraisal, and hedge contracts` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function computeHedgeVariant(input)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var DEPENDENCE_SAMPLE_INPUT_KEYS = [` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var DEPENDENCE_SAMPLE_KEYS = [` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var HEDGE_COST_INPUT_KEYS = [` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var HEDGE_COST_OUTPUT_KEYS = [` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23ExactKeys(value, keys)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23Date(value)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function stableRecordFingerprint(value)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23Unavailable(reason, details)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function buildDependenceSample(input)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function validDependenceSample(sample)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23SamplesDisjoint(first, second)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23SamePair(first, second)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function validBlockBootstrapPolicy(policy)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23BootstrapIndices(length, policy, draw)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23Quantile(values, probability)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23BootstrapInterval(estimate, sample, policy, estimator)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23DependenceEstimate(sample, intervalPolicy)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function computeStressDependence(request)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function qualifiedForbesRigobonAdjustment(input)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23SetIntersection(first, second)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23SetUnion(first, second)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23DrawdownDates(returns, dates, threshold)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23RecoveryDates(returns, dates, drawdownThreshold, recoveryThreshold)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23OverlapEstimate(first, second)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function computeDependenceOverlaps(request)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function overlapContract(version, first, second, policy)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function computeAppraisalSensitivity(request)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23Ols(sample)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function fitHedgeRegression(request)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23Effectiveness(sample, beta, ratio)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23PathEffectiveness(input, beta, ratio)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23CostResult(variant, exposureValue)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function computeHedgeComparison(input)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function validateDiversificationProjection(value)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function scope23ProjectionRefusal(reason, lastValid)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function computeDiversificationProjection(request)` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `return qualifiedForbesRigobonAdjustment(input);` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `input.contractVersion !== "DependenceSample/v1"` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "BlockBootstrapInterval/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "DependenceEstimate/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "DependenceEvidenceSet/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "ForbesRigobonAdjustment/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `var downside = overlapContract("DownsideOverlap/v1", downsideA, downsideB,` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "DependenceOverlapSet/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "EmpiricalTailDependence/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `drawdown: overlapContract("DrawdownOverlap/v1", drawdownA, drawdownB,` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `recovery: overlapContract("RecoveryOverlap/v1", recoveryA, recoveryB,` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `var desmoothed = desmoothReturns(request.observedSample.a, rho);` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "AppraisalSensitivity/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "HedgeRegression/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `scenarioSpecificationContractVersion: "ScenarioSpecification/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "HedgeVariant/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "HedgeComparison/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "DiversificationProjectionRefusal/v1",` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `contractVersion: "DiversificationProjection/v1",` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope23Quantile(values, probability)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope23IntervalPolicy(policy)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope23DependenceSamples()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function build(id, kind, selected, rule)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope23AppraisalEvidence(samples)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope23ProxySample(samples, proxySymbol)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope23HedgeEvidence(samples)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function regressionSubset(id, definitionKind, memberDates)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope23EvidenceModel()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function appendScope23Dependence(band, evidence)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function appendScope23Overlaps(band, evidence)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function appendScope23Appraisal(band, appraisal)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function appendDiversification(panel)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function appendHedgeVariants(band, scope23)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dependenceMatrix` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeVariants` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dependenceEvidenceSet` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `stressDependenceTable` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dependenceOverlapTable` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `appraisalSensitivity` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeRatios` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeHorizon` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeCommission` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeSpread` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeSlippage` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeTurnover` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeRebalanceCost` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeLiquidityCost` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeFinancing` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeComparison` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeRegression` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `hedgeScenarioBasis` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var scope23 = scope23EvidenceModel();` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `appendScope23Dependence(band, scope23);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `appendScope23Overlaps(band, scope23);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `appendScope23Appraisal(band, scope23.appraisal);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `appendHedgeVariants(band, scope23);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var refreshedScope23 = scope23EvidenceModel();` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var comparison = refreshedScope23.hedge;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `section.dataset.contractVersion = "DependenceEvidenceSet/v1";` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `section.dataset.contractVersion = "AppraisalSensitivity/v1";` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `comparisonSection.dataset.contractVersion = "HedgeComparison/v1";` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `regressionNode.dataset.contractVersion = "HedgeRegression/v1";` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `tr.dataset.scenarioIdentity = comparison.scenarioBasis.scenarioIdentity \|\| "unavailable";` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `tr.dataset.pathIds = comparison.scenarioBasis.pathIds.join("\|");` | production | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `const SCOPE_23_INTERVAL = Object.freeze({` | fixture | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `function scope23Sample({ id, dates, target, proxy, kind = 'named-date-set', searched = 1 })` | fixture | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `const SCOPE_23_NORMAL = Object.freeze({` | fixture | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `const SCOPE_23_STRESS = Object.freeze({` | fixture | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `function completeScope23Samples()` | fixture | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `function scope23RegressionSample()` | fixture | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `function scope23HedgeComparison()` | fixture | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | local-symbol | `function scope23CompleteProjection()` | fixture | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-23-01 DependenceSample/v1 freezes exact members, provenance, selection, and cutoff` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-23-01 stress estimates retain distinct samples and block-bootstrap intervals` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-23-01 Forbes-Rigobon adjustment enforces orientation, alignment, minimums, and eligibility` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-23-01 tail, downside, drawdown, and recovery overlaps remain distinct contracts` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-23-01 AppraisalSensitivity/v1 keeps complete quality evidence and every rho grid point` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-23-01 HedgeRegression/v1 recovers known coefficient and residual variance from aligned returns` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-23-01 HedgeComparison/v1 keeps explicit variants, full costs, residuals, and common paths` | test | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `Adversarial: reduced diversification and hedge shortcuts cannot satisfy the contract` | canary | exclusive | — | — |
| tests/portfolio-diversification.functional.mjs | local-symbol | `const intervalPolicy = Object.freeze({` | fixture | exclusive | — | — |
| tests/portfolio-diversification.functional.mjs | local-symbol | `function scenarioSpecification()` | fixture | exclusive | — | — |
| tests/portfolio-diversification.functional.mjs | local-symbol | `function sample(input)` | fixture | exclusive | — | — |
| tests/portfolio-diversification.functional.mjs | local-symbol | `function request()` | fixture | exclusive | — | — |
| tests/portfolio-diversification.functional.mjs | test-title | `TP-23-02 complete diversification projection survives JSON round trip with exact contracts` | test | exclusive | — | — |
| tests/portfolio-diversification.functional.mjs | test-title | `TP-23-02 reduced or incomplete recompute refuses publication and preserves the last valid projection` | test | exclusive | — | — |
| tests/portfolio-survival-diversification.spec.mjs | local-symbol | `async function seedScope23Evidence(page, name)` | fixture | exclusive | — | — |
| tests/portfolio-survival-diversification.spec.mjs | local-symbol | `async function runCommonPathScenario(page)` | support | exclusive | — | — |
| tests/portfolio-survival-diversification.spec.mjs | test-title | `Regression: SCN-008-049 stress dependence appraisal and hedge effectiveness retain distinct qualified evidence` | test | exclusive | — | — |
| tests/portfolio-survival-diversification.spec.mjs | test-title | `Regression: SCN-008-049 hedge variants reuse the selected survival scenario and path identities` | test | exclusive | — | — |

## Scope 24

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolioanalytics.js | marker | `Scope 24 - complete constrained allocation and explicit views` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function solveEqualRiskContribution(basis, riskBudget, solverPolicy)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function solveBlackLittermanAllocation(basis, blackLittermanInput, solverPolicy)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `contractVersion: "AllocationBasis/v1"` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `allocationResearchInputs` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `analytics.allocationSensitivityAxes` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `analytics.blackLittermanTau` | config | exclusive | — | — |
| tests/portfolio-analytics.unit.mjs | test-title | `TP-24-01 six real methods consume one complete basis and expose solver diagnostics` | test | exclusive | — | — |
| tests/portfolio-allocation.functional.mjs | test-title | `TP-24-02 six complete candidates retain one basis costs paths survival and no winner` | test | exclusive | — | — |
| tests/portfolio-survival-allocation.spec.mjs | test-title | `Regression: SCN-008-050 six real allocation methods enforce one complete basis and explicit views` | test | exclusive | — | — |
| tests/portfolio-survival-allocation.spec.mjs | test-title | `Regression: SCN-008-050 infeasible constraints remain visible and explicit BL posterior changes allocation` | test | exclusive | — | — |
| tests/fixtures/portfolio-survival-allocation/mandate-allocation-infeasible.json | whole-file | — | fixture | exclusive | — | — |
| tests/fixtures/portfolio-survival-allocation/scope-24-allocation-basis.json | whole-file | — | fixture | exclusive | — | — |

## Scope 25

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolioanalytics.js | local-symbol | `var DECISION_FOLD_VERSION = "DecisionFold/v1";` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var DECISION_FOLD_REQUEST_VERSION = "decision-fold-request/v1";` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var DECISION_INTERVAL_VERSION = "decision-interval/v1";` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var DECISION_OBSERVATION_VERSION = "decision-observation/v1";` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var DECISION_COSTS_VERSION = "decision-costs/v1";` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var TRIAL_LEDGER_VERSION = "TrialLedger/v1";` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var TRIAL_LEDGER_ENTRY_VERSION = "TrialLedgerEntry/v1";` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var HASH_RE = /^sha256:[a-f0-9]{64}$/;` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var DECISION_RESULT_STATES = Object.freeze([` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `var TRIAL_KINDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function isTimestamp(value)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function validDecisionInterval(value)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function validDecisionObservation(value)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function completeDecisionCosts(value)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function compoundedReturn(observations)` | production | exclusive | — | — |
| rlportfolioanalytics.js | local-symbol | `function decisionResult(state, value, observationIds, reason)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function evaluateDecisionFold(request)` | production | exclusive | — | — |
| rlportfolioanalytics.js | exported-symbol | `function buildTrialLedger(trials)` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `evaluateDecisionFold: evaluateDecisionFold,` | production | exclusive | — | — |
| rlportfolioanalytics.js | hunk | `buildTrialLedger: buildTrialLedger,` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var DOSSIER_COLLECTION_VERSION = "ResearchDossierCollection/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var DOSSIER_POINTER_VERSION = "portfolio-dossier-pointer/v1";` | production | exclusive | — | — |
| rlportfolio.js | hunk | `"contractVersion", "displayModeKey", "dossierContractVersion", "dossierNamespace", "dossierPointerContractVersion",` | production | exclusive | — | — |
| rlportfolio.js | hunk | `"dossierPointerKey", "dossierQuarantineKey", "dossierSlotKeys", "migrationVersions", "pointerContractVersion",` | production | exclusive | — | — |
| rlportfolio.js | hunk | `"rlPortfolioDossiersV1.pointer",` | production | exclusive | — | — |
| rlportfolio.js | hunk | `    "rlPortfolioDossiersV1.slotA",` | production | exclusive | — | — |
| rlportfolio.js | hunk | `"rlPortfolioDossiersV1.slotB",` | production | exclusive | — | — |
| rlportfolio.js | hunk | `    "rlPortfolioDossiersV1.quarantine"` | production | exclusive | — | — |
| rlportfolio.js | hunk | `storage.dossierContractVersion !== DOSSIER_COLLECTION_VERSION \|\|` | production | exclusive | — | — |
| rlportfolio.js | hunk | `storage.dossierPointerContractVersion !== DOSSIER_POINTER_VERSION \|\|` | production | exclusive | — | — |
| rlportfolio.js | hunk | `storage.dossierNamespace !== "rlPortfolioDossiersV1" \|\| storage.dossierPointerKey !== "rlPortfolioDossiersV1.pointer" \|\|` | production | exclusive | — | — |
| rlportfolio.js | hunk | `!exactStringSet(storage.dossierSlotKeys, ["rlPortfolioDossiersV1.slotA", "rlPortfolioDossiersV1.slotB"]) \|\|` | production | exclusive | — | — |
| rlportfolio.js | hunk | `storage.dossierQuarantineKey !== "rlPortfolioDossiersV1.quarantine" \|\|` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var RESEARCH_DOSSIER_VERSION = "ResearchDossier/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var DOSSIER_RECORD_VERSION = "DossierRecord/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var DOSSIER_CORRECTION_VERSION = "CorrectionRecord/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var DOSSIER_RECORD_TYPES = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var DOSSIER_EXPORT_FIELDS = Object.freeze(["header", "records", "corrections", "provenance"]);` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var RESEARCH_DOSSIER_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var DOSSIER_RECORD_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var DOSSIER_COLLECTION_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var DOSSIER_POINTER_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function dossierFailure(reason, field, recoverable)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function dossierRecordPayload(record)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function buildDossierRecord(dossierId, sequence, previousRecordHash, recordType, payloadIdentity, payload, createdAt)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function validateDossierRecord(record, dossierId, sequence, previousRecordHash, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function validateResearchDossier(value, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function createResearchDossier(request, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function appendDossierRecord(value, request, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function appendDossierCorrection(value, request, policy)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function dossierCollectionPayload(value)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function withDossierCollectionHashes(value)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function validateDossierCollection(value, policy)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function createEmptyDossierCollection(now)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function validateDossierPointer(value, policy)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function dossierSlotKey(policy, activeSlot)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function dossierPrefixPreserved(previous, next)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function createDossierStore(storageAdapters, policy)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function openDossiers(now)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function commitDossier(dossier, expectedGeneration, now)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function selectedDossierExport(selection, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function previewDossierExport(selection, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function exportDossierPrivate(selection, policy)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function clearDossierStorage(storageAdapters, policy)` | production | exclusive | — | — |
| rlportfolio.js | marker-pair | `["createResearchDossier: createResearchDossier,","clearDossierStorage: clearDossierStorage,"]` | production | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `storage.dossierContractVersion` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `storage.dossierPointerContractVersion` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `storage.dossierNamespace` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `storage.dossierPointerKey` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `storage.dossierSlotKeys` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `storage.dossierQuarantineKey` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `analytics.dossierPurgeObservations` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `analytics.dossierEmbargoObservations` | config | exclusive | — | — |
| portfolio-survival-allocation.config.json | config-key | `analytics.dossierTurnoverFraction` | config | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `Scope 15/25 Research Dossier` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope25Identity(label, value)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope25SavedDossier(workspaceIdentity)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope25TrialLedger(probe)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope25DecisionFold(probe)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope25BuildDossier(probe)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope25AppendCell(row, field, text, header)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function scope25Percent(result)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function appendScope25Audit(band, projection)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function selectedExportFields()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierDecisionTable` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierSourceVintageTable` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierCostTable` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierResultTable` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierTrialTable` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierTrialDisclosure` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierAuditLimitations` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierAuditHead` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierRecordTable` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `saveResearchDossier` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierSaveStatus` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierCorrectionReason` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `appendDossierCorrection` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `previewDossierExport` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierExportPreview` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierExportAcknowledgement` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `downloadDossierExport` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `dossierAuditUnavailable` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `dossierStore: null,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `dossierOpened: null,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `dossierStatus: "Dossier not saved locally.",` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `dossierAudit: {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `return window.RLPORTFOLIOANALYTICS.evaluateDecisionFold({` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `return window.RLPORTFOLIOANALYTICS.buildTrialLedger(trials);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var built = api.createResearchDossier({` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `built = api.appendDossierRecord(built.value.dossier, {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `input.id = "dossierExport" + entry[0];` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `save.addEventListener("click", function () {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `correctionButton.addEventListener("click", function () {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var corrected = api.appendDossierCorrection(current, {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `invalidationEffect: "supersedes-for-current-reading",` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `previewButton.addEventListener("click", function () {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var preview = api.previewDossierExport({ dossier: dossier, fields: fields }, state.policy);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `exportAck.addEventListener("change", function () {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `download.addEventListener("click", function () {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var exported = api.exportDossierPrivate({` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `destination: "browser-download",` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `contractVersion: "DossierExportReceipt/v1",` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var scope25 = scope25BuildDossier(probe);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (scope25.state === "ok") appendScope25Audit(band, scope25);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var dossierOpened = state.dossierStore.openDossiers(now());` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var dossierReopened = state.dossierStore.openDossiers(now());` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `scope25AppendCell(decisionRow, "training", fold.trainingStart + " → " + fold.trainingEnd);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `scope25AppendCell(decisionRow, "decision-cutoff", fold.decisionCutoff);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `scope25AppendCell(decisionRow, "embargo", fold.embargo.startDate + " → " + fold.embargo.endDate);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `scope25AppendCell(decisionRow, "rebalance", fold.rebalanceDate);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `scope25AppendCell(decisionRow, "application", fold.applicationStart + " → " + fold.applicationEnd);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `[["in-sample", fold.results.inSample], ["out-of-sample", fold.results.outOfSample],` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `["stress", fold.results.stress], ["gross", fold.results.gross], ["net", fold.results.net]]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `row.dataset.trialIdentity = entry.trialIdentity;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `disclosure.textContent = projection.ledger.entries.length + " distinct tried variants · " +` | production | exclusive | — | — |
| tests/portfolio-allocation.functional.mjs | test-title | `TP-25-01 decision-time folds preserve clocks costs states and exact tried variants` | test | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | marker | `Feature 008 Scope 25 - decision-time dossier composition and durable local audit.` | test | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | whole-file | — | test | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | local-symbol | `const CREATED_AT = '2026-08-23T12:00:00.000Z';` | fixture | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | local-symbol | `const CORRECTED_AT = '2026-08-23T12:05:00.000Z';` | fixture | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | local-symbol | `const EXPORTED_AT = '2026-08-23T12:10:00.000Z';` | fixture | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | hunk | `const HASH = (character) =>` | fixture | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | local-symbol | `function decisionFold()` | fixture | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | local-symbol | `function append(apiResult, request)` | support | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | test-title | `TP-25-02 dossier reload corrections private export and clear preserve an immutable hash chain` | test | exclusive | — | — |
| tests/portfolio-dossier.functional.mjs | test-title | `Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract` | canary | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | hunk | `'contractVersion', 'dossierContractVersion', 'dossierNamespace', 'dossierPointerContractVersion',` | canary | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | hunk | `const localPrefixes = [storage.workspaceNamespace + '.', storage.dossierNamespace + '.'];` | support | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | hunk | `local: declared.filter((key) => localPrefixes.some((prefix) => key.startsWith(prefix))).sort(),` | support | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | hunk | `session: declared.filter((key) => !localPrefixes.some((prefix) => key.startsWith(prefix))).sort()` | support | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | hunk | `'the policy-derived local surface is both pointers, both slot pairs, both quarantines, and display mode'` | canary | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | hunk | `.replace(/(["'])history\1/g, '$1historical-axis$1')` | support | exclusive | — | — |
| tests/portfolio-foundation.unit.mjs | hunk | `.replace(/\b(?!window\b\|globalThis\b)([A-Za-z_$][\w$]*)\.history\b/g, '$1.historicalAxis')` | support | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | hunk | `policy.storage.dossierPointerKey,` | support | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | hunk | `...policy.storage.dossierSlotKeys,` | support | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | hunk | `policy.storage.dossierQuarantineKey` | support | exclusive | — | — |
| tests/portfolio-survival-allocation.spec.mjs | hunk | `page.on('pageerror', (error) => errors.push(error.stack \|\| String(error)));` | support | exclusive | — | — |
| tests/portfolio-survival-allocation.spec.mjs | test-title | `Regression: SCN-008-051 dossier preserves decision time costs trials corrections reload and private export` | test | exclusive | — | — |

## Scope 26

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| rlportfolio.js | marker | `Feature 008 Scope 26: ReturnContext/v1 session handoff` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var RETURN_CONTEXT_VERSION = "ReturnContext/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var RETURN_CONTEXT_KEY = "rlReturnContextV1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var RETURN_CONTEXT_FIELDS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var RETURN_CONTEXT_SOURCE_ROUTE = "portfolio-survival-allocation-lab.html";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var RETURN_CONTEXT_DESTINATION_HASH = "#portfolio-brief-handoff";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var RETURN_CONTEXT_SOURCE_HASHES = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var ROUTE_FILE_PATTERN = /^[a-z0-9][a-z0-9-]*\.html$/;` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var HASH_PATTERN_STRICT = /^#[a-z0-9][a-z0-9-]*$/;` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var SAFE_TOKEN_PATTERN = /^[a-z0-9][a-z0-9._:-]{0,127}$/i;` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function returnContextFailure(reason, field)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function returnContextStorage(options)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function validateReturnContext(value, options)` | production | exclusive | — | — |
| rlportfolio.js | hunk | `disclosureId: value.disclosureId,` | production | exclusive | — | — |
| rlportfolio.js | hunk | `focusRestoreId: value.focusRestoreId,` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function writeReturnContext(value, options)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function consumeReturnContext(currentFile, nowInstant, options)` | production | exclusive | — | — |
| rlportfolio.js | hunk | `if (raw === null \|\| raw === undefined) return returnContextFailure("no-context-present", "storage");` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function discard()` | production | exclusive | — | — |
| rlportfolio.js | marker | `Feature 008 Scope 26: one orchestration compute` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_VIEW_MODEL_VERSION = "PortfolioWorkspaceViewModel/v1";` | production | ordered-evolution | workspace-16-26 | 16,26 |
| rlportfolio.js | local-symbol | `var WORKSPACE_CONTROLLER_VERSION = "WorkspaceComputeController/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_REBASE_PREVIEW_VERSION = "PortfolioWorkspaceRebasePreview/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_PRESENTATION_VERSION = "PortfolioWorkspacePresentation/v1";` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_SIBLING_PROJECTIONS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_IDENTITY_INPUTS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_MODES = Object.freeze(["simple", "power"]);` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_TABS = Object.freeze([` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `var WORKSPACE_TAB_PROJECTIONS = Object.freeze({` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function workspaceComputeFailure(reason, field)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function computeWorkspace(context, evidence, policy)` | production | ordered-evolution | workspace-16-26 | 16,26 |
| rlportfolio.js | local-symbol | `function workspaceIdentityFingerprint(identityInputs)` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function createWorkspaceComputeController(options)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function snapshot()` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function issue(identity, issuedAt)` | production | exclusive | — | — |
| rlportfolio.js | hunk | `tokenId: contracts.fingerprint("workspace-compute-token", {` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function retokenized(token, nextState)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function cancel(tokenId)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function publish(tokenId, viewModel)` | production | exclusive | — | — |
| rlportfolio.js | hunk | `if (currentToken.tokenId !== tokenId) return supersededRefusal("token-superseded", "tokenId");` | production | exclusive | — | — |
| rlportfolio.js | hunk | `lastValidViewModel = viewModel;` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function supersededRefusal(reason, field)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function previewRebase(nextIdentityInputs, currentIdentityInputs)` | production | exclusive | — | — |
| rlportfolio.js | local-symbol | `function acceptRebase(tokenId, viewModel)` | production | exclusive | — | — |
| rlportfolio.js | hunk | `var missing = WORKSPACE_SIBLING_PROJECTIONS.filter(function (name) {` | production | exclusive | — | — |
| rlportfolio.js | exported-symbol | `function selectWorkspacePresentation(viewModel, presentation)` | production | exclusive | — | — |
| rlportfolio.js | hunk | `recomputed: false,` | production | exclusive | — | — |
| rlportfolio.js | hunk | `acquired: false` | production | exclusive | — | — |
| rlnav.js | marker | `generic strict ReturnContext/v1 strip (Feature 008 Scope 26)` | production | exclusive | — | — |
| rlnav.js | local-symbol | `function rlReturnStrip()` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var KEY = "rlReturnContextV1";` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var VERSION = "ReturnContext/v1";` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var FIELDS = [` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var SOURCE_ROUTE = "portfolio-survival-allocation-lab.html";` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var SOURCE_HASHES = ["#brief", "#risk-xray", "#path-lab", "#diversification", "#allocation", "#dossier"];` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var DESTINATION_HASH = "#portfolio-brief-handoff";` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var ROUTE_FILE = /^[a-z0-9][a-z0-9-]*\.html$/;` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var SAFE_TOKEN = /^[a-z0-9][a-z0-9._:-]{0,127}$/i;` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var TOKEN_FIELDS = ["contextId", "actionId", "disclosureId", "focusRestoreId", "ownerToolId",` | production | exclusive | — | — |
| rlnav.js | local-symbol | `var INSTANT_FIELDS = ["minimumOwnerCutoff", "createdAt", "expiresAt"];` | production | exclusive | — | — |
| rlnav.js | local-symbol | `function refuse(reason, field)` | production | exclusive | — | — |
| rlnav.js | local-symbol | `function plainObject(value)` | production | exclusive | — | — |
| rlnav.js | exported-symbol | `function validate(value)` | production | exclusive | — | — |
| rlnav.js | exported-symbol | `function consume(storage, currentFile, nowInstant)` | production | exclusive | — | — |
| rlnav.js | hunk | `if (raw === null \|\| raw === undefined) return refuse("no-context-present", "storage");` | production | exclusive | — | — |
| rlnav.js | local-symbol | `function discard()` | production | exclusive | — | — |
| rlnav.js | local-symbol | `function injectCSS(doc)` | production | exclusive | — | — |
| rlnav.js | local-symbol | `function renderStrip(doc, context)` | production | exclusive | — | — |
| rlnav.js | hunk | `strip.id = "rlreturn-strip";` | production | exclusive | — | — |
| rlnav.js | hunk | `strip.setAttribute("aria-label", "Return to Portfolio Brief");` | production | exclusive | — | — |
| rlnav.js | hunk | `strip.setAttribute("data-return-context", "active");` | production | exclusive | — | — |
| rlnav.js | hunk | `strip.setAttribute("data-action-id", context.actionId);` | production | exclusive | — | — |
| rlnav.js | hunk | `strip.setAttribute("data-focus-restore-id", context.focusRestoreId);` | production | exclusive | — | — |
| rlnav.js | hunk | `label.textContent = "From Portfolio Brief";` | production | exclusive | — | — |
| rlnav.js | hunk | `owner.setAttribute("data-owner-read-state", "awaiting-owner-read");` | production | exclusive | — | — |
| rlnav.js | hunk | `back.href = context.sourceRoute + context.sourceHash;` | production | exclusive | — | — |
| rlnav.js | hunk | `back.rel = "noreferrer";` | production | exclusive | — | — |
| rlnav.js | hunk | `root.history.back();` | production | exclusive | — | — |
| rlnav.js | local-symbol | `function currentFileName()` | production | exclusive | — | — |
| rlnav.js | local-symbol | `function boot()` | production | exclusive | — | — |
| rlnav.js | hunk | `var result = consume(storage, currentFileName(), new Date().toISOString());` | production | exclusive | — | — |
| rlnav.js | hunk | `if (!result.ok) return;` | production | exclusive | — | — |
| rlnav.js | hunk | `renderStrip(document, result.value);` | production | exclusive | — | — |
| rlnav.js | hunk | `root.RLNAVRETURN = { KEY: KEY, FIELDS: FIELDS, VERSION: VERSION, consume: consume, validate: validate };` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `workspaceCompute` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `Scope 26. The published workspace, named on screen.` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker-pair | `["data-last-refusal=\"none\" data-rebase-state=\"idle\"","data-rebase-changed-inputs=\"\">No workspace computed yet.</div>"]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (actionId) row.id = "action-row-" + actionId;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker-pair | `["link.setAttribute(\"data-owner-handoff\", item.owner.toolId);","link.setAttribute(\"data-owner-focus\", \"action-row-\" + actionId);"]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (actionId) why.id = "why-" + actionId;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `runWorkspaceCompute();` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `Scope 26: one orchestration compute for the whole route` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var workspaceController = api.createWorkspaceComputeController({ activeIdentity: null });` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var workspaceComputeCount = 0;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var workspacePresentationCount = 0;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var workspaceMode = "simple";` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function workspaceIdentityInputs()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function workspaceIdentityToken()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function workspaceProjectors(workspaceIdentity)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function runWorkspaceCompute()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var issued = workspaceController.issue(identity, now());` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var built = api.computeWorkspace({` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var published = rebaseRequired` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `: workspaceController.publish(issued.value.tokenId, built.value);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function presentWorkspace()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var shown = api.selectWorkspacePresentation(active, { mode: workspaceMode, tab: state.route });` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function renderWorkspaceCompute(refusalCode)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `node.setAttribute("data-draft-identity", snapshot.draftIdentity \|\| "none");` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `Scope 26: owner handoff, return restore, and the review gate` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var OWNER_HANDOFF_TTL_MS = 30 * 60 * 1000;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var RETURN_FOCUS_STATE = "portfolioReturnFocus";` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function safeHandoffToken(value, fallback)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function ownerDestinations()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function writeOwnerHandoff(link)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `sourceHash: "#" + state.route,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `destinationRoute: destination,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `destinationHash: api.RETURN_CONTEXT_DESTINATION_HASH,` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `disclosureId: safeHandoffToken(link.getAttribute("data-owner-disclosure"), "disclosure-unknown"),` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `focusRestoreId: safeHandoffToken(link.getAttribute("data-owner-focus"), "focus-unknown"),` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `ownerToolId: safeHandoffToken(link.getAttribute("data-owner-handoff"), "owner-unknown"),` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `return api.writeReturnContext(context, {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var link = event.target.closest ? event.target.closest("a[data-owner-handoff]") : null;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker-pair | `["historyState[RETURN_FOCUS_STATE] = {","window.history.replaceState(historyState, \"\", window.location.href);"]` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function restoreReturnFocus()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function discardPending()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `delete nextState[RETURN_FOCUS_STATE];` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `window.history.replaceState(nextState, "", window.location.href);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var row = document.getElementById(pending.focusRestoreId);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `var disclosure = document.getElementById(pending.disclosureId);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (disclosure && disclosure.tagName === "DETAILS") disclosure.open = true;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `row.setAttribute("data-return-focus", "restored");` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `workspaceMode = power ? "power" : "simple";` | production | exclusive | — | — |
| tests/portfolio-workspace.functional.mjs | whole-file | — | test | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | local-symbol | `function returnContextFixture(overrides = {})` | fixture | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | local-symbol | `function returnContextSession(policy)` | support | exclusive | — | — |
| tests/portfolio-privacy.functional.mjs | test-title | `TP-26-02 the ReturnContext handoff writes consumes and refuses under a strict closed contract` | test | exclusive | — | — |
| tests/portfolio-survival-brief.spec.mjs | test-title | `Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace` | test | exclusive | — | — |
| tests/portfolio-survival-brief.spec.mjs | marker-pair | `["await expect(compute, 'initial publication must not masquerade as an accepted rebase')",".toHaveAttribute('data-rebase-state', 'idle');"]` | canary | exclusive | — | — |
| tests/portfolio-survival-brief.spec.mjs | marker-pair | `["const acceptedRebase = await compute.evaluate((node) => ({","changedInputs: expect.stringMatching(/\\bportfolio\\b/)\n  });"]` | canary | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `const BRIEF_CONFIG = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.config.json'), 'utf8'));` | fixture | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `const BRIEF_SNAPSHOT = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.snapshot.json'), 'utf8'));` | fixture | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `const OWNER_WINDOW = BRIEF_CONFIG.windows.find((entry) => entry.id === BRIEF_SNAPSHOT.window);` | fixture | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `const OWNER_EVIDENCE_DAY = new Date(Date.parse(` | fixture | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `async function seedOwnerEvidence(page)` | fixture | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | test-title | `Regression: SCN-008-052 owning tool consumes ReturnContext and restores Portfolio Brief focus` | test | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function acceptedIdentitySnapshot(inputs)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function setWorkspaceRebaseState(nextState, changedIdentityInputs)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function workspaceProjection(slot, workspaceIdentity, present)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `rebasePreview = workspaceController.previewRebase(` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `? workspaceController.acceptRebase(issued.value.tokenId, built.value)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `node.setAttribute("data-rebase-state", workspaceRebaseState);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `node.setAttribute("data-rebase-changed-inputs", workspaceRebaseChangedInputs.join(","));` | production | exclusive | — | — |

## Scope 27

| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| portfolio-survival-allocation-lab.html | marker | `/* ------------------------------------------------------------ Scope 27` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `.skip-link {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `transform: translateY(-200%);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `[data-sheet-inert] {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `.sheet-close {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `.route-states>li {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `@media (prefers-reduced-motion: reduce) {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `@media (forced-colors: active) {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `border-bottom: 5px solid Highlight;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `skipToWorkspace` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<button id="modeSimple" type="button" aria-pressed="true" tabindex="0">Simple</button>` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<button id="modePower" type="button" aria-pressed="false" tabindex="-1">Power</button>` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `Scope 27. Manual-activation tablist: exactly one tab is in the page tab order,` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<button id="workspaceTabBrief" type="button" role="tab" aria-selected="true"` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<button id="workspaceTabRiskXray" type="button" role="tab" aria-selected="false"` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<button id="workspaceTabPathLab" type="button" role="tab" aria-selected="false"` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<button id="workspaceTabDiversification" type="button" role="tab" aria-selected="false"` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<button id="workspaceTabAllocation" type="button" role="tab" aria-selected="false"` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<button id="workspaceTabDossier" type="button" role="tab" aria-selected="false"` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<section id="privacyPanel" class="band" role="dialog" aria-modal="true" aria-labelledby="privacyHeading"` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | dom-id | `closePrivacy` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<h2 id="privacyHeading" tabindex="-1">Local privacy</h2>` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<section id="briefWorkspace" class="brief" role="tabpanel" tabindex="0"` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `<section id="routeStates" class="brief" role="tabpanel" tabindex="0"` | dom | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var TAB_IDS = Object.freeze(ROUTE_TABS.map(function (route) { return route.tab; }));` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var MODE_BUTTON_IDS = Object.freeze(["modeSimple", "modePower"]);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `/* ---------- Scope 27: accessibility controller ----------` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), ' +` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function setRovingTabindex(ids, activeId)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function visibleFocusables(root)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function motionPreferenceMatcher(query)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var reducedMotionQuery = motionPreferenceMatcher("(prefers-reduced-motion: reduce)");` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var forcedColorsQuery = motionPreferenceMatcher("(forced-colors: active)");` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function prefersReducedMotion()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function syncPreferenceProjection()` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `body.setAttribute("data-reduced-motion", prefersReducedMotion() ? "reduce" : "no-preference");` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `body.setAttribute("data-forced-colors",` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function revealWithinScroller(node)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function syncTabAccessibility(hash)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (skip) skip.setAttribute("href", hash === "brief" ? "#briefWorkspace" : "#routeStates");` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function rovingKeydown(ids, includeVertical)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | marker | `/* ---------- Scope 27: modal sheet semantics ---------- */` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `var openSheetRecord = null;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function markBackgroundInert(sheet)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function releaseBackgroundInert(marked)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function openSheet(sheetId, invokerId, initialFocusId)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function closeSheet(restoreFocus)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (restoreFocus !== false) invoker.focus();` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | local-symbol | `function sheetIsOpen(sheetId)` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (event.key === "Escape" \|\| event.key === "Esc") {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (event.key !== "Tab") return;` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `reducedMotionQuery.addEventListener("change", syncPreferenceProjection);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `forcedColorsQuery.addEventListener("change", syncPreferenceProjection);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `syncTabAccessibility(hash);` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `document.querySelector("nav.tablist").addEventListener("keydown", rovingKeydown(TAB_IDS, true));` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("modeSeg").addEventListener("keydown", rovingKeydown(MODE_BUTTON_IDS, false));` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `setRovingTabindex(MODE_BUTTON_IDS, power ? "modePower" : "modeSimple");` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `if (sheetIsOpen("privacyPanel")) {` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `openSheet("privacyPanel", "openPrivacy", "privacyHeading");` | production | exclusive | — | — |
| portfolio-survival-allocation-lab.html | hunk | `byId("closePrivacy").addEventListener("click", function () {` | production | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | local-symbol | `let server;` | support | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | hunk | `test.beforeAll(async () => {` | support | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | hunk | `test.afterAll(async () => {` | support | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | local-symbol | `const LAB_FILE = 'portfolio-survival-allocation-lab.html';` | fixture | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | local-symbol | `const TABS = [` | fixture | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | local-symbol | `const MODES = ['modeSimple', 'modePower'];` | fixture | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | local-symbol | `async function openLab(page, hash = 'brief')` | support | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | local-symbol | `async function importValid(page, name)` | support | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | local-symbol | `const activeId = (page) => page.evaluate(() => (document.activeElement ? document.activeElement.id : ''));` | support | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | local-symbol | `const rovingOf = (page, ids) => page.evaluate(` | support | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | local-symbol | `async function collectDecision(page)` | support | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | test-title | `Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete` | test | exclusive | — | — |
| tests/portfolio-survival-accessibility.spec.mjs | test-title | `Regression: SCN-008-053 reduced motion forced colors contrast and text spacing preserve every decision` | test | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `const TEXT_SPACING_OVERRIDE = ` | fixture | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `const LAYOUTS = [` | fixture | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `const LONG_LABEL = ` | fixture | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `async function probeLayout(page, where)` | support | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | local-symbol | `function assertLayoutHolds(reading, context)` | support | exclusive | — | — |
| tests/portfolio-survival-mobile.spec.mjs | test-title | `Regression: SCN-008-053 zoom mobile and long content have no overlap clipping or body overflow` | test | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `let server;` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | hunk | `test.beforeAll(async () => {` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | hunk | `test.afterAll(async () => {` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `const LAB_FILE = 'portfolio-survival-allocation-lab.html';` | fixture | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `const LAB_SOURCE = readFileSync(resolve(ROOT, LAB_FILE), 'utf8');` | fixture | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `const MUTATION_FILE = '.scn-008-053-reduced-lab.html';` | fixture | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `const MUTATION_PATH = resolve(ROOT, MUTATION_FILE);` | fixture | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `const TABS = [` | fixture | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `let stagedLabFile = null;` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `async function openLab(page, hash = 'brief')` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `const activeId = (page) => page.evaluate(() => (document.activeElement ? document.activeElement.id : ''));` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `const rovingOf = (page, ids) => page.evaluate(` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `function mutate(source, find, replaceWith, label)` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `async function serveReducedLab(page, mutatedHtml)` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | local-symbol | `async function expectServedMutation(page, marker, label)` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | hunk | `rmSync(MUTATION_PATH, { force: true });` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | hunk | `writeFileSync(MUTATION_PATH, mutatedHtml, 'utf8');` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | hunk | `stagedLabFile = MUTATION_FILE;` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | hunk | `await page.goto('about:blank');` | support | exclusive | — | — |
| tests/portfolio-accessibility-mutation.spec.mjs | test-title | `Adversarial: SCN-008-053 reduced accessibility implementations fail closed` | canary | exclusive | — | — |

## Scope 28

<!-- Scope 28 boundary attribution start -->
| Path | Identity Kind | Identity | Role | Ownership Mode | Chain ID | Ordered Scope IDs |
|---|---|---|---|---|---|---|
| .specify/memory/agents.md | hunk | `node --test tests/*.unit.mjs` | command-registry | exclusive | — | — |
| scripts/spec008-scope-claims.json | whole-file | — | config | exclusive | — | — |
| scripts/verify-spec008-scope-claims.mjs | whole-file | — | validator | exclusive | — | — |
| specs/008-portfolio-survival-and-brief-lab/scopes/_boundary-attribution.md | marker-pair | `["\u003c!-- Scope 28 boundary attribution start --\u003e","\u003c!-- Scope 28 boundary attribution end --\u003e"]` | planning | exclusive | — | — |
| specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement/report.md | whole-file | — | planning | exclusive | — | — |
| specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement/scope.md | whole-file | — | planning | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | marker | `Feature 008 Scope 28 / SCN-008-054 — audited-defect representation preload.` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | local-symbol | `function required(name)` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | local-symbol | `const MODULE_REL = required("RL_DEFECT_MODULE");` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | local-symbol | `const TARGET = path.resolve(ROOT, MODULE_REL);` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | local-symbol | `const FIND = Buffer.from(required("RL_DEFECT_FIND_B64"), "base64").toString("utf8");` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | local-symbol | `const REPLACE = Buffer.from(required("RL_DEFECT_REPLACE_B64"), "base64").toString("utf8");` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | local-symbol | `const MARKER = required("RL_DEFECT_MARKER");` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | local-symbol | `function represent(source, via)` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | local-symbol | `const originalCompile = Module.prototype._compile;` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | hunk | `Module.prototype._compile = function (content, filename) {` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | local-symbol | `const originalReadFileSync = fs.readFileSync;` | support | exclusive | — | — |
| tests/portfolio-defect-injector.cjs | hunk | `fs.readFileSync = function (file, options) {` | support | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | hunk | `const evidenceFloorMs = Math.max(Date.parse(snapshot.asOf), Date.parse(payload.asOf));` | fixture | exclusive | — | — |
| tests/portfolio-publisher-boundary.functional.mjs | hunk | `const { tradingDate, civilTime } = newYorkCivilLabel(cutoffMs);` | fixture | exclusive | — | — |
| tests/portfolio-survival-diversification.spec.mjs | hunk | `import { FIXTURE_ROOT, expectPathComputeCompleted, startPortfolioServer } from './portfolio-survival.support.mjs';` | support | exclusive | — | — |
| tests/portfolio-survival-diversification.spec.mjs | hunk | `await expectPathComputeCompleted(panel);` | test | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | hunk | `expect(Object.keys(entry.occurrence).sort(),` | canary | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | local-symbol | `const FULL_CLEAR_VERIFIED = 'Full personal data cleared · every durable and live category verified empty';` | support | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | local-symbol | `async function retainedAuditRecord(page)` | support | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | local-symbol | `async function confirmFullPersonalClear(page)` | support | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | hunk | `const noOpArms = [];` | canary | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | hunk | `const auditPairProven = [];` | canary | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | hunk | `const personalBeforeRefusal = await page.evaluate(() => ({` | canary | exclusive | — | — |
| tests/portfolio-survival-foundation.spec.mjs | test-title | `Regression: SCN-008-054 the audited lifecycle defect stays repaired at the consumer surface` | test | exclusive | — | — |
| tests/portfolio-survival-paths.spec.mjs | hunk | `import { FIXTURE_ROOT, expectPathComputeCompleted, startPortfolioServer } from './portfolio-survival.support.mjs';` | support | exclusive | — | — |
| tests/portfolio-survival.support.mjs | exported-symbol | `export async function startPortfolioServer({ overrides = {} } = {})` | support | exclusive | — | — |
| tests/portfolio-survival.support.mjs | local-symbol | `const PATH_COMPUTE_SETTLED = /^(completed\|cancelled\|superseded\|failed)$/;` | support | exclusive | — | — |
| tests/portfolio-survival.support.mjs | local-symbol | `const PATH_COMPUTE_SETTLE_TIMEOUT_MS = 30_000;` | support | exclusive | — | — |
| tests/portfolio-survival.support.mjs | local-symbol | `function playwrightExpect()` | support | exclusive | — | — |
| tests/portfolio-survival.support.mjs | exported-symbol | `export async function expectPathComputeCompleted(scope)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | marker | `tests/portfolio-test-integrity.unit.mjs — Feature 008 Scope 28, TP-28-04.` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const INJECTOR = join(ROOT, "tests", "portfolio-defect-injector.cjs");` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const LEDGER = "specs/008-portfolio-survival-and-brief-lab/scopes/_index.md";` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const ROUTE = "portfolio-survival-allocation-lab.html";` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const SCOPE_CLAIMS_MODULE_URL = new URL("../scripts/verify-spec008-scope-claims.mjs", import.meta.url);` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const SCOPE_CLAIMS_MANIFEST = join(ROOT, "scripts", "spec008-scope-claims.json");` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const SCOPE_CLAIMS_SCHEMA = "spec008-scope-claims/v2";` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const FEATURE_ROOT = "specs/008-portfolio-survival-and-brief-lab";` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const SYNTHETIC_REPOSITORY_ROOT = ROOT;` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const COMMIT_ALIAS_ORIGIN = "6c84913a";` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const BOUNDARY_ROW_SUFFIX = "attribution covers every claimed path and marker, hunk, or whole-file ownership declaration";` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const CONSUMER_ROW = "Consumer impact sweep completed; zero stale first-party references remain";` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const BOUNDARY_SCOPE_IDS = [3, 4, 8, 9, ...Array.from({ length: 13 }, (_, index) => index + 16)].map(scopeId);` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const CONSUMER_SCOPE_IDS = [` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const SCOPE_ARTIFACTS = Object.freeze({` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const REMEDIATION_SCOPES = { first: 17, last: 28 };` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const CASES = [` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const ACCESSIBILITY_AFFORDANCES = [` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function escapeForNamePattern(title)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function sha256(relPath)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function scopeId(value)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function compareScopeClaimPair(left, right)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function canonicalScopeClaimPairs()` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function boundaryRow(id)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function definitionOfDoneSection(id)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function canonicalObject(value)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function descriptorOrder(left, right)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function normalizedDescriptors(descriptors)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function inventorySha256(descriptors)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function encodedDescriptor(descriptor)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function decodedDescriptor(value)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function addFixtureText(records, path, text)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function setFixtureText(records, path, text)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function boundaryDescriptors(id)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function sourceTable(section, descriptor)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function addDescriptorRecord(records, descriptor)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function edgeSurface(pathFamily, path, identityKind, identity)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function boundaryEdgePolicy(id)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function addBoundarySemanticRecords(records, id)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function ownershipFor(id, descriptor)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function createBoundaryEntry(records, scopeParts, id, artifact)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function commitOrigin()` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function consumerAliases(records, scopeParts, id, artifact, scanSurfaces)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function createConsumerEntry(records, scopeParts, id, artifact)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function makeRecordReader(fixture, commitReader)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function syntheticCommitReader(commit, path)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function createScopeClaimsFixture()` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function fixtureSignature(fixture)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function scopeClaimEntry(fixture, kind, id)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function fixtureRecord(fixture, path)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function removeFixtureToken(fixture, path, token)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function appendFixtureToken(fixture, path, token)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `async function loadScopeClaimsVerifier()` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function verifyFixture(verifier, fixture)` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function expectedResultOrder()` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function assertExactScopeClaimsResult(result)` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function markdownSection(markdown, section)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function derivePairsFromSyntheticAuthority(fixture)` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function deriveDescriptorsFromSyntheticAuthority(fixture, entry)` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function assertSyntheticV2Authority(fixture)` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function reorderNormalizedCollections(fixture)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function assertDeterministicSyntheticScopeClaims(verifier)` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function captureScopeClaimsRefusal(verifier, fixture)` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function firstBoundaryEntry(fixture, id = "03")` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function firstConsumerEntry(fixture, id = "03")` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function declaredAliasEntry(fixture)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function noneAliasEntry(fixture)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function replaceBoundaryDescriptor(fixture, entry, current, replacement, ownership)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function updateEvolutionChains(fixture, orderedScopeIds)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function mutateConsumerSource(fixture, id, mutate)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function mutateTestSource(fixture, id, mutate)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function canonicalGitReader(commit, path)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function diskRecordReader(fixture, commitReader = canonicalGitReader)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function createCanonicalManifestFixture()` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function materializeFixtureRecords(fixture, repositoryRoot)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function createPhysicalScopeClaimsFixture()` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function physicalFixtureSignature(fixture)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function replacePhysicalPathWithSymlink(fixture, path, target)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function canonicalBoundary(fixture)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function canonicalConsumer(fixture)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function canonicalDeclaredAliasConsumer(fixture)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function hostileFactory(kind)` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `const SCOPE_CLAIMS_V2_HOSTILE_CASES = [` | fixture | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function runScopeClaimsHostileCase(verifier, refusalEnum, hostileCase)` | validator | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | local-symbol | `function assertScopeClaimsAdversarialContract(verifier)` | support | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | test-title | `TP-28-02: Spec 008 scope-claims verifier emits the closed deterministic 41-item inventory` | test | exclusive | — | — |
| tests/portfolio-test-integrity.unit.mjs | test-title | `Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing` | canary | exclusive | — | — |
<!-- Scope 28 boundary attribution end -->
<!-- registry-eof -->
