# Scope 15: Walk-Forward Research Dossier And Claim Boundaries

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** In Progress

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `dossier:true`, `ui:true`, `auditability:true`

**Depends On:** Scope 14 - Allocation Sensitivity And Explicit Black-Litterman

**Primary Outcome:** Every result can be reconstructed from an append-oriented local dossier that separates in-sample, walk-forward/out-of-sample, stress, gross/net, costs, trial selection, efficiency-hypothesis scope, and tax/legal boundaries without future-superiority or substantially-identical verdicts.

## Requirement Coverage

- **Functional:** FR-142 through FR-150.
- **Non-functional:** NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-009, NFR-011, NFR-017 through NFR-018, and NFR-021 through NFR-023.
- **Cross-cutting:** every source, transformation, policy, scenario, allocation, hedge, sensitivity, cost, trial, correction, invalidation, and private export remains identity-bound and local.

## Gherkin Scenarios

### SCN-008-031 - Walk-forward and costs limit backtest claims

```gherkin
Scenario: SCN-008-031 - An allocation rule looks attractive in the selected historical sample
  Given transaction costs, rebalance timing, walk-forward splits, and trial count are available
  When the dossier evaluates the candidate
  Then in-sample, walk-forward, and cost-adjusted results remain separate
  And selection-bias and survivorship limitations are visible
  And no historical result is described as proof of future superiority
```

### SCN-008-032 - Market-efficiency claims stay empirical

```gherkin
Scenario: SCN-008-032 - Research evidence appears to contradict one market-efficiency form
  Given the dossier identifies the information set, sample, test, and costs
  When the conclusion is written
  Then it is limited to the tested weak, semi-strong, or strong-form proposition
  And alternative explanations and data-snooping risk are visible
  And the product does not state that all market-efficiency hypotheses are false
```

### SCN-008-033 - Correlation cannot adjudicate substantially identical

```gherkin
Scenario: SCN-008-033 - Two securities have very high historical correlation
  Given the user opens an analytical replacement comparison
  When tax-related evidence is displayed
  Then correlation, holdings overlap, issuer or index facts, and tracking evidence remain research inputs
  And no numeric threshold labels the securities substantially identical or not substantially identical
  And professional tax review is the explicit next boundary
```

### SCN-008-040 - A full-personal clear empties stored dossiers

Carries Scope 03's discharged `dossiers` conjunct. Scope 15 is the first scope that
persists a dossier.

```gherkin
Scenario: SCN-008-040 - A user clears all personal data after producing a walk-forward dossier
  Given at least one dossier is genuinely persisted
  When the user confirms the full-personal clear
  Then the dossier section is empty on a storage reread
  And public generic assets outside the Feature 008 namespace are byte-identical
  And the emptiness is read back off the storage adapters rather than the module's own report
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-031 validation/cost ledger | Explicit folds, availability, embargo, rebalance, full/missing costs, trials | Select candidate/variant and inspect validation/cost rows | In-sample/OOS/stress/not-evaluated and gross/net/cost/trial/survivorship/selection remain separate; no future-proof claim | e2e-ui |
| SCN-008-032 efficiency claim | Valid and missing-field claim fixtures | Inspect claim record | Form, information set, sample, test, costs, alternatives and data-snooping appear; incomplete claim is invalid; no all-forms-false copy | e2e-ui |
| SCN-008-033 tax boundary | High correlation/overlap/tracking facts | Open analytical replacement comparison | Economic facts remain separate; no yes/no or safe-harbor threshold; professional-review boundary adjacent | e2e-ui |
| Dossier responsive/a11y | Desktop/mobile/130% text/long sources/corrections | Navigate index, filters, ledgers, correction links, private export preview | Complete table/disclosure parity, contained scroll, focus/labels, no overlap/body overflow/clipping; no canvas is introduced | e2e-ui |

## Implementation Plan

1. Add exact decision-time `walkForwardAllocation` with explicit rebalance dates, prior-only estimation windows, data availability cutoffs, embargo/purge, later-return application, candidate identity, and no look-ahead.
2. Add explicit commission, spread, slippage, turnover/rebalance, financing/carry, and timing records. Gross and net remain separate; any required missing cost produces gross-only, never zero cost.
3. Count every method, parameter, sample window, stress definition, de-smoothing value, hedge ratio, view, cost, and sensitivity inspected as an identity-bearing trial; preserve failures/infeasibility and selection/survivorship/look-ahead limitations.
4. Add `ResearchDossier/v1` projection for sources/vintages, transforms, assumptions, constraints, methods, scenarios, candidates, trials, costs, validation, claims, caveats, invalidations, and append/supersede corrections without rewriting prior records.
5. Add closed efficiency-claim validator requiring one named form, information set, sample, test, costs, alternatives, trial/data-snooping record, and limited conclusion.
6. Add educational replacement comparison with correlation, overlap, issuer/index/tracking facts and explicit IRS facts-and-circumstances/professional-review boundary. No metric, combination, or threshold yields a substantially-identical verdict or tax advice.
7. Render dossier index, reproducibility ledger, validation/cost/trial rows, claim boundaries, corrections, source links, truth states, and private export preview from local records. Filters/search change display only.
8. Add independent walk-forward availability/cost arithmetic, missing-net, trial-count, claim-schema mutation, forbidden tax/efficiency/future-proof copy, append-only correction, mobile table/disclosure, and private-export tests.

## Change Boundary And Rollback

**Allowed files:** `rlportfolioanalytics.js`, `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-allocation.functional.mjs`, `tests/portfolio-survival-allocation.spec.mjs`, and Scope 15 fixture entries.

**Explicitly excluded:** public/generic storage, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, registries/docs, package/source-lock files, external tax/legal service, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 15 exact walk-forward/dossier/claim/route/test/fixture blocks. Scope 14 comparisons remain complete but validation/cost/tax/efficiency claims show not evaluated/unavailable; prior local records are not deleted or rewritten by source rollback.

## Consumer Impact Sweep

**This scope renames nothing.** The rename/removal detector matches the rollback sentence directly above, where `remove` falls within 160 characters of `route`. That sentence describes reverting this scope's own additive blocks, not retiring a route any consumer holds. Scope 15 fills the existing Research Dossier route regions and appends dossier records; no route hash, config key, exported symbol, storage key, or persistent test title that existed before this scope is renamed, deleted, moved, or deprecated. The rollback path is explicitly non-destructive to already-written local records.

| Consumer surface this scope touches | Why it is touched | Regression check |
|---|---|---|
| Research Dossier route regions | Walk-forward, stress, gross-versus-net, and claim-boundary displays are added to the existing tab | The scope's focused browser rows drive the real route and its equivalent tables |
| Append-oriented local dossier records | New records are appended; prior records are never rewritten in place | SCN-008-040 asserts a full-personal clear empties stored dossiers, and rollback leaves prior records intact |
| Scope 14 comparison displays | They gain validation, cost, tax, and efficiency claim labels; without this scope those claims read not evaluated or unavailable rather than silently absent | The rollback statement above is proven by rerunning the Scope 14 carriers |
| Scope 09 path identities and Scope 13 allocation basis | Read-only inputs for reconstruction; identities are cited, never redefined | Every result must be reconstructable from the recorded identity |

**Consumer classes that do not exist in this repository.** Research Lab is build-free static HTML and JavaScript on GitHub Pages, so there is no server route, no API client, no generated client, no authentication redirect, and no breadcrumb framework. Navigation is the fixed in-page tab hash set plus the landing registry, and the landing registry — `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/**` — is an excluded surface here; Feature 008 is registered once, in Scope 16. The only deep links are those fixed hashes, which this scope does not change. A stale-reference scan therefore has no first-party target outside the rows above.

## Scenario-First Red/Green Contract

Author decision-time availability, cost/trial, append-only, claim-boundary, forbidden-copy, responsive table, and persistent browser assertions first. Run exact commands through the tool log with `SCOPE-15` and red/green tags. RED must identify look-ahead, cost substitution, trial omission, history rewrite, overclaim, tax verdict, or UI defect; dossier fixture echoes without production projection are invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-15-01 | Analytics/claim unit | unit | SCN-008-031, SCN-008-032, SCN-008-033 | `tests/portfolio-analytics.unit.mjs` | Execute decision-time folds/embargo/rebalances, independent gross/net cost arithmetic, trial identities/counts, missing-net states, efficiency claim exact-key mutations, tax evidence projection, forbidden verdicts, and append/supersede correction identity | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-15-01` |
| TP-15-02 | Dossier functional | functional | SCN-008-031, SCN-008-032, SCN-008-033 | `tests/portfolio-allocation.functional.mjs` | Project production risk/path/hedge/allocation results into local dossiers, preserve in-sample/OOS/stress/not-evaluated and gross/net/trial/source limits, validate claims, append corrections, and preview private export | `node --test tests/portfolio-allocation.functional.mjs` | No | `report.md#tp-15-02` |
| TP-15-03 | Regression E2E | e2e-ui | SCN-008-031 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: SCN-008-031 dossier separates in sample walk forward costs and trials` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-031 dossier separates in sample walk forward costs and trials" --reporter=list` | Yes | `report.md#scenario-scn-008-031` |
| TP-15-04 | Regression E2E | e2e-ui | SCN-008-032 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: SCN-008-032 efficiency claim is scoped to one tested information set` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-032 efficiency claim is scoped to one tested information set" --reporter=list` | Yes | `report.md#scenario-scn-008-032` |
| TP-15-05 | Regression E2E | e2e-ui | SCN-008-033 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: SCN-008-033 correlation never emits a substantially identical verdict` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-033 correlation never emits a substantially identical verdict" --reporter=list` | Yes | `report.md#scenario-scn-008-033` |
| TP-15-06 | Responsive/a11y Regression E2E | e2e-ui | SCN-008-031, SCN-008-032, SCN-008-033 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: Feature 008 dossier ledgers claims corrections and private export remain accessible without mobile overlap` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 dossier ledgers claims corrections and private export remain accessible without mobile overlap" --reporter=list` | Yes | `report.md#tp-15-06` |
| TP-15-07 | Broader Regression E2E | e2e-ui | SCN-008-026 through SCN-008-033 | `tests/portfolio-survival-allocation.spec.mjs` | Execute the complete cumulative Feature 008 Allocation and Dossier browser suite after every Scope 15 focused row | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-15-07` |
| TP-15-08 | Discharged clear conjunct functional | functional | SCN-008-040 | `tests/portfolio-allocation.functional.mjs` | Persist at least one dossier, then prove a full-personal clear leaves the dossier section empty on a storage reread while public generic assets stay byte-identical. Carries Scope 03's discharged `dossiers` conjunct under register rule 2. Shares TP-15-02's file rather than naming a new one, so the frozen spec-test-path baseline does not grow | `node --test tests/portfolio-allocation.functional.mjs` | No | `report.md#tp-15-08` |

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Consumer impact sweep completed; zero stale first-party references remain → **Resolution condition:** the Scope 15 `consumer` result from the Feature 008 verifier proves non-vacuous matches for every declared canonical identifier, source surface, consumer class, and test carrier, with zero forbidden stale aliases. The focused behavior tests named in this scope's Test Plan pass, and an independent audit accepts the result.

#### Core Delivery Items

- [x] FR-142 through FR-150 are fully implemented with frozen data/transforms/assumptions/constraints/variants/trials/costs/invalidation, separate in-sample/OOS/stress/not-evaluated, decision-time walk-forward, complete gross/net cost rules, all-trial disclosure, backtest limitations, scoped efficiency claims, educational tax boundary, and no metric-based substantially-identical verdict. Evidence: [report.md#s15-separation](report.md#s15-separation)
- [x] NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-009, NFR-011, NFR-017 through NFR-018, and NFR-021 through NFR-023 are satisfied by deterministic explainable dossiers, missing/cutoff integrity, local reproducibility, visible calibration/trials, precision/source honesty, failure isolation, research-only boundaries, and exact recommendation/claim traceability. Evidence: [report.md#s15-functional](report.md#s15-functional)
- [x] Dossier records append/supersede and retain prior sources/claims/corrections; missing costs/validation remain gross-only/not-evaluated and no copy claims future superiority, all efficiency forms false, legal/tax determination, filing action, or transaction advice. Evidence: [report.md#s15-functional](report.md#s15-functional)
- [x] Desktop/mobile/zoom dossier tables/disclosures, filters, corrections, long sources, focus and private export preview are complete with no overlap/body overflow/clipping or hidden claim boundary. Evidence: [report.md#s15-e2e-a11y](report.md#s15-e2e-a11y)
- [x] SCN-008-040: Scope 03's discharged `dossiers` clear conjunct is verified here, because the `ResearchDossier/v1` projection and its append-oriented store are the first persisted dossier records in the feature. A dossier that appends and supersedes without rewriting prior records is durable personal data by construction, so it is registered in the privacy inventory, swept by the full-personal clear, and proven empty on reread — including superseded and corrected records, which an append-only store must not leave behind — with the generic public cache byte-identical. TP-15-08 is the carrying row. At Scope 03 the noun had no workspace section, no `policy.storage` key, and no declarable inventory category, so nothing there could observe it. See [Scope 03 Full-Personal-Clear Enumeration Discharge](../_index.md#scope-03-full-personal-clear-enumeration-discharge). Evidence: [report.md#s15-functional](report.md#s15-functional)
- [x] Every Scope 15 behavior has intended RED and same-command GREEN evidence before the broader browser row. Evidence: [report.md#s15-e2e-033](report.md#s15-e2e-033)

#### Test Evidence Items - Exact Parity With 8 Test Plan Rows

- [x] TP-15-01 unit evidence proves walk-forward availability, costs, trials, claims, tax boundary, correction identity, and adversarial forbidden outputs. Evidence: [report.md#s15-separation](report.md#s15-separation)
- [x] TP-15-02 functional evidence proves complete production dossier projection, validation/cost/trial/source separation, append corrections, and private export preview. Evidence: [report.md#s15-functional](report.md#s15-functional)
- [x] TP-15-03 Regression E2E evidence proves SCN-008-031 separates in-sample/OOS/gross/net/cost/trial/limitation records and makes no future-proof claim. Evidence: [report.md#s15-e2e-031](report.md#s15-e2e-031)
- [x] TP-15-04 Regression E2E evidence proves SCN-008-032 validates one scoped efficiency proposition with alternatives/data-snooping and rejects incomplete claims. Evidence: [report.md#s15-e2e-032](report.md#s15-e2e-032)
- [x] TP-15-05 Regression E2E evidence proves SCN-008-033 renders economic facts and the professional boundary without any yes/no/safe-harbor verdict. Evidence: [report.md#s15-e2e-033](report.md#s15-e2e-033)
- [x] TP-15-06 responsive/a11y E2E evidence proves complete dossier ledgers/corrections/export at desktop/mobile/zoom with keyboard/touch operation and no overlap. Evidence: [report.md#s15-e2e-a11y](report.md#s15-e2e-a11y)
- [x] TP-15-07 broader E2E evidence proves the complete cumulative Allocation/Dossier suite passes after every focused row. Evidence: [report.md#s15-e2e-broad](report.md#s15-e2e-broad)
- [x] TP-15-08 discharged-conjunct functional evidence proves a persisted `ResearchDossier/v1` record with an appended correction is removed by the full-personal clear, discharging Scope 03's `dossiers` conjunct against real stored state rather than an assumed shape. Evidence: [report.md#s15-functional](report.md#s15-functional)

#### Build Quality Gate

- [x] Focused RED/GREEN records, decision-time/cost/trial arithmetic review, append-only/source/config parity, efficiency/tax/future-proof/execution scan, private-export/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16. Evidence: [report.md#s15-boundary](report.md#s15-boundary)
