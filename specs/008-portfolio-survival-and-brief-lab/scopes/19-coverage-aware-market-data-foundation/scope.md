# Scope 19: Coverage-Aware Market Data Foundation

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** In Progress
**Scope-Kind:** runtime-behavior
**Tags:** `foundation:true`, `remediation`, `shared-infrastructure`
**Depends On:** 18
**Entry Gate:** Every scope in `Depends On` must be Done.
**Finding:** F008-BAR-COVERAGE-001
**Requirements:** FR-020, FR-050, FR-083, FR-152; NFR-005, NFR-006, NFR-010, NFR-021.

## Outcome

Implement the additive `RLDATA.ensureBarCoverage` contract so requested dates are measured, missing dates are appended through approved existing sources, and five-year analytics cannot pass on a short cache.

## Gherkin Scenario And Ownership

### SCN-008-045: Requested daily coverage is measured and acquired honestly

```gherkin
Scenario: A five-year request starts from a short same-origin cache
  Given the merged cache contains fewer dates than the explicit requested start and end
  When ensureBarCoverage runs under same-origin-only and public-lookup-enabled policies
  Then it appends and de-duplicates eligible static dates before measuring coverage
  And same-origin-only returns retained partial rows with exact first and last dates
  And public lookup requests only the public symbol interval and range then appends missing dates
  And complete is returned only when actual dates meet the target-years contract and source checks
  And existing ensureBars callers retain their prior behavior
```

## Implementation Plan

1. Accept explicit requested start/end or target-years policy and validate it without route hardcoding.
2. Read merged cache, append the same-origin snapshot, de-duplicate by date, and measure actual date bounds.
3. When consent allows and coverage is short, call the existing RLDATA direct/proxy provider sequence with public symbol fields only and append missing dates.
4. Return complete/partial/stale/unavailable with exact dates, observed sessions, sources, adjustments, currency, and reasons.
5. Keep `ensureBars`, cache schema, provider credentials, and existing tool behavior backward compatible.

## Change Boundary

**Allowed file families:** the additive coverage-API block in `rldata.js`, `portfolio-survival-allocation.config.json`, `tests/portfolio-bar-coverage.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, `tests/portfolio-survival-risk.spec.mjs`, the coverage fixtures under `tests/fixtures/portfolio-survival-allocation/**`, and the Feature 008 canary block in `scripts/selftest.mjs`.

**Excluded surfaces:** the existing `ensureBars` body and provider-credential schema/UI inside `rldata.js`, `data/bars/**` public snapshots, `rlportfolioanalytics.js`, the personal-storage regions of `rlportfolio.js`, `rlnav.js`, `rlbrief.js`, `market-brief.html`, `market-brief.*.json`, `scripts/brief-*`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, `specs/001-*` through `specs/007-*`, and `.github/bubbles/**`.

- **Allowed:** additive `rldata.js` coverage API, `portfolio-survival-allocation.config.json`, Feature 008 coverage fixtures, `scripts/selftest.mjs`, a focused coverage functional carrier, and Feature 008 foundation/risk browser tests.
- **Excluded:** provider credential schemas/UI, existing `ensureBars` semantics, public bar files, analytics formulas, personal storage, publisher artifacts, and registry/docs.

## Shared Infrastructure Impact Sweep

| Protected surface | Blast radius | Independent canary |
|---|---|---|
| `rldata.js` cache merge and source sequence | Every registered market-data tool | Repository selftest plus existing provider-credential browser matrix. |
| Same-origin bar snapshots | All tools consuming `data/bars` | Existing static cache consumers receive byte-compatible rows. |
| Provider request shape | Proxy/local-key trust boundary | Request ledger contains public symbol/interval/range only. |
| Coverage result | Risk, paths, dependence, allocation | Short, exact-boundary, stale, and complete fixtures discriminate states. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Existing `ensureBars` callers | Name, arguments, Promise behavior, cache shape, and provider authority remain compatible. |
| Provider credentials and data settings | Consent and public-only request fields remain controlled by the existing capability path. |
| Risk, paths, dependence, hedge, and allocation | Every consumer receives exact bounds, source identities, disputes, and partial state. |

The shared consumer surface is the `RLDATA` API client in `rldata.js`: the additive `ensureBarCoverage` entry point sits beside the existing `ensureBars` export, and the central provider-access deep link `index.html#data-settings` that `rlapp.js` renders still targets the same settings panel. The sweep is a stale-reference scan over `RLDATA.` call sites confirming every existing caller still resolves against the unchanged `ensureBars` signature.

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-19-01 | Unit | unit | 045 | `scripts/selftest.mjs` | Cache/static append, date measurement, de-duplication, and ensureBars compatibility canaries | `node scripts/selftest.mjs` | No | `report.md#tp-19-01` |
| TP-19-02 | Functional | functional | 045 | `tests/portfolio-bar-coverage.functional.mjs` | Same-origin-only partial and approved lookup append over real-format fixtures | `node --test tests/portfolio-bar-coverage.functional.mjs` | No | `report.md#tp-19-02` |
| TP-19-03 | Regression E2E | e2e-ui | 045 | `tests/portfolio-survival-foundation.spec.mjs` | Exact title: `Regression: SCN-008-045 five year coverage measures dates appends allowed sources and preserves partial truth` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-045 five year coverage measures dates appends allowed sources and preserves partial truth" --reporter=list` | Yes | `report.md#tp-19-03` |
| TP-19-04 | Adversarial mutation | functional | 045 | `tests/portfolio-bar-coverage.functional.mjs` | Disposable row-count, range-label, and target-years mutations cannot return complete | `node --test --test-name-pattern="Adversarial: requested range labels and row counts cannot fake date coverage" tests/portfolio-bar-coverage.functional.mjs` | No | `report.md#tp-19-04` |
| TP-19-05 | Existing-consumer canary | e2e-ui | 045 | `tests/provider-credentials.spec.mjs` | Existing provider/local-key paths and request authority remain intact | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-19-05` |

## Rollback And Restore

- The API is additive; rollback removes only `ensureBarCoverage` and its tests after confirming no consumer outside Feature 008 adopted it.
- Cache writes remain append/de-duplicate operations, so a failed acquisition preserves prior rows and source metadata.
- Existing provider and `ensureBars` canaries must pass both before and after rollback.

### Definition of Done - Tiered Validation

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Scope-19 attribution covers every claimed path and marker, hunk, or whole-file ownership declaration, with no unauthorized excluded coupling. It makes no isolated-commit claim and no claim about unrelated co-committed paths. → **Resolution condition:** the Scope 19 `boundary` result from the Feature 008 verifier passes, its attributed path set is complete, and an independent audit accepts the result.
- [ ] Consumer impact sweep completed; zero stale first-party references remain → **Resolution condition:** the Scope 19 `consumer` result from the Feature 008 verifier proves non-vacuous matches for every declared canonical identifier, source surface, consumer class, and test carrier, with zero forbidden stale aliases. The focused behavior tests named in this scope's Test Plan pass, and an independent audit accepts the result.

- [x] SCN-008-045 behavior: a five-year request that starts from a short same-origin cache appends and de-duplicates eligible static dates before coverage is measured, returns retained partial rows with exact first and last dates under same-origin-only, requests only the public symbol interval and range when public lookup is enabled, and reports `complete` only when actual dates satisfy the target-years and source checks, while existing `ensureBars` callers keep their prior behavior. → Evidence: [TP-19-02](report.md#tp-19-02) — six rows covering same-origin append with retained partial truth, qualified public lookup, conflict exclusion, false-completeness rejection, legacy `ensureBars` compatibility, and fail-before-mutation validation; [TP-19-03](report.md#tp-19-03) — live page requests `2021-08-20..2026-08-20`, measures actual `2024-07-25..2026-08-20` over 520 rows, reports `state: partial`, and issues only the same-origin `/data/bars/MSFT.json`; [TP-19-04](report.md#tp-19-04) — 1,300 rows and five-year request labels still cannot return `complete` while both required bounds are absent
- [x] SCN-008-045 is implemented with explicit date/consent/source semantics and no personal request fields. → Evidence: [Scenario Contract Evidence](report.md#scenario-contract-evidence)
- [x] TP-19-01 shared unit/selftest canaries pass. → Evidence: [TP-19-01](report.md#tp-19-01)
- [x] TP-19-02 functional acquisition/coverage proof passes. → Evidence: [TP-19-02](report.md#tp-19-02)
- [x] TP-19-03 real-page regression passes. → Evidence: [TP-19-03](report.md#tp-19-03)
- [x] TP-19-04 adversarial mutation proof rejects short-cache false completeness. → Evidence: [TP-19-04](report.md#tp-19-04)
- [x] TP-19-05 existing-consumer browser canary passes. → Evidence: [TP-19-05](report.md#tp-19-05)
- [x] Shared Infrastructure Impact Sweep and additive rollback proof are recorded. → Evidence: [Summary](report.md#summary), [Code Diff Evidence](report.md#code-diff-evidence), [TP-19-05](report.md#tp-19-05)
- [x] Build Quality Gate passes with zero skips/warnings and no excluded-file changes. → Evidence: [Lint And Quality](report.md#lint-and-quality), [Validation Summary](report.md#validation-summary), [Code Diff Evidence](report.md#code-diff-evidence)
