# Scope 28: Spec-Driven Adversarial Test Replacement

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Not Started
**Scope-Kind:** runtime-behavior
**Tags:** `test-integrity`, `remediation`
**Depends On:** 27
**Entry Gate:** Every scope in `Depends On` must be Done.
**Finding:** F008-TEST-INTEGRITY-001
**Requirements:** NFR-025.

## Outcome

Replace reduced and proxy assertions with exact spec-driven, persistent, adversarial proofs for every repaired behavior while retaining prior tests/reports as historical baseline only.

## Gherkin Scenario And Ownership

### SCN-008-054: Protected tests detect every audited defect class

```gherkin
Scenario: A repaired Feature 008 behavior is challenged by its original reduced implementation
  Given the complete authoritative scenario set and one adversarial case for every audited defect class
  When focused Node and real-page browser carriers execute production code
  Then every required title is discovered and reaches its assertions
  And each adversarial case fails when the audited defect is represented in an isolated test fixture or disposable copy
  And the repaired implementation passes the identical behavioral command
  And no file-wrapper success proxy optional assertion interception bailout or historical receipt substitutes for behavior proof
```

## Implementation Plan

1. Inventory SCN-008-001 through SCN-008-055 against each exact Test Plan title, file, assertion, and adversarial discriminator.
2. Replace file-wrapper, hardcoded-category, sentinel-only, existence-only, and reduced-implementation assertions with production-code behavior checks.
3. Add reachability checks proving every planned `test()`/Node title is discovered and executed; no zero-match selector may pass.
4. Add hostile fixtures or disposable copies for each finding without mutating shipped source in the shared working tree.
5. Run focused RED-equivalent discriminators and identical behavior commands on the repaired tree, then the full Node, Feature 008 browser, existing-consumer, and selftest matrices.
6. Keep old report evidence and tests in Git history; current certification may cite only the new exact rows and current execution receipts.

## Change Boundary

- **Allowed:** Feature 008 test files, Feature 008 fixtures/support server, test declaration/reachability validators, `scripts/selftest.mjs` Feature 008 canaries, and plan/report evidence for Scope 28.
- **Excluded:** production source, public/docs surfaces, unrelated Feature 001-007 tests except named read-only consumer execution, framework-managed receipt code, and certification fields.

## Shared Infrastructure Impact Sweep

| Protected surface | Blast radius | Independent canary |
|---|---|---|
| Fixture-overlay server/request ledger | All Feature 008 browser suites | Production HTML/JS unchanged; no interception/external host/service worker. |
| Test title discovery | Structured plan and scenario receipts | Every exact planned title resolves to one executed test. |
| Shared selftest | Entire repository | Feature additions cannot weaken existing invariants or budgets. |
| Existing-consumer browser matrix | Shared `rldata.js`/`rlnav.js` consumers | Named routes remain green after repaired shared behavior. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| All 55 scenario contracts | Each resolves to its planned persistent carrier, exact title where applicable, and current evidence target. |
| Feature 008 Node and browser carriers | Every required declaration executes real production behavior with no zero-match success. |
| Existing shared-data and navigation consumers | Shared repairs preserve current consumer behavior under the named browser matrix. |
| Historical reports and receipts | They remain unchanged history and never substitute for current remediation proof. |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-28-01 | Test declaration reachability | functional | 001-055 | `scripts/validate-test-file-reachability.mjs` | Every structured Feature 008 title reaches an executable declaration | `node scripts/validate-test-file-reachability.mjs` | No | `report.md#tp-28-01` |
| TP-28-02 | Aggregate Node behavior | unit/functional | 001-055 | Feature 008 Node carriers | All production helpers and module compositions execute exact assertions | `node --test tests/portfolio-foundation.unit.mjs tests/portfolio-analytics.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-bar-coverage.functional.mjs tests/portfolio-risk.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-dossier.functional.mjs tests/portfolio-workspace.functional.mjs tests/portfolio-test-integrity.unit.mjs` | No | `report.md#tp-28-02` |
| TP-28-03 | Complete Feature E2E | e2e-ui | 001-055 | All Feature 008 browser carriers | Every exact scenario regression executes the real route with no interception/provider | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-28-03` |
| TP-28-04 | Adversarial mutation integrity | unit | 054 | `tests/portfolio-test-integrity.unit.mjs` | Exact title: `Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing` | `node --test --test-name-pattern="Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing" tests/portfolio-test-integrity.unit.mjs` | No | `report.md#tp-28-04` |
| TP-28-05 | Regression quality | functional | 054 | All Feature 008 E2E files | Zero bailout, interception, optional-required, zero-match, or tautological patterns | `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs` | No | `report.md#tp-28-05` |
| TP-28-06 | Repository regression | functional | 001-055 | `scripts/selftest.mjs` | Full repository selftest remains green without weakening budgets | `node scripts/selftest.mjs` | No | `report.md#tp-28-06` |

## Rollback And Restore

- Add adversarial fixtures in test-owned copies; never edit and restore shipped production source to prove sensitivity.
- Keep each old test until its stronger exact replacement runs red-equivalent and green; then remove only redundant reduced assertions while preserving historical reports and Git history.
- A failing broad matrix reverts the test-only batch or repairs the discovered product defect; it never weakens expected behavior.

### Definition of Done - Tiered Validation

- [ ] SCN-008-054 and the complete authoritative scenario set have exact discriminating test ownership with no historical evidence used as current proof.
- [ ] TP-28-01 declaration reachability passes with zero unresolved or zero-match titles.
- [ ] TP-28-02 aggregate Node behavior passes.
- [ ] TP-28-03 complete real-page Feature 008 matrix passes.
- [ ] TP-28-04 adversarial mutation integrity proves every audited defect class is load-bearing.
- [ ] TP-28-05 regression-quality guard passes.
- [ ] TP-28-06 repository selftest passes.
- [ ] Shared Infrastructure Impact Sweep and test-only rollback proof are recorded.
- [ ] Build Quality Gate passes with zero skips/warnings, synchronized plan/manifest rows, and no production-source edits in this scope.
