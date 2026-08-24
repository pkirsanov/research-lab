# Scope 28: Spec-Driven Adversarial Test Replacement

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** In Progress
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

### Current Execution Checkpoint

- All six Test Plan rows have been executed on their exact commands and all six now pass. TP-28-01, TP-28-02, TP-28-04, TP-28-05, and TP-28-06 passed on a single execution; their receipts are in [report.md](report.md). TP-28-03 is established by the re-run recorded in the next bullet.
- TP-28-03 is now established. The earlier non-establishment had two distinct causes, and both are resolved.
  - Cause 1, the assertion: the previous red/green pair came from a fixed expect timeout in `runCommonPathScenario` that could expire while the path compute was still in flight, so a slow settle was indistinguishable from a wrong settle. This is fixed at source by `expectPathComputeCompleted` in `tests/portfolio-survival.support.mjs`, which polls until `data-compute-state` reaches a SETTLED value (`completed|cancelled|superseded|failed`) and only then asserts that the settled value is `completed`. A late settle now retries; a wrong settle still fails. The timeout was not merely raised to turn a red run green.
  - Cause 2, a working-tree corruption: the success branch at `portfolio-survival-allocation-lab.html:4418` had been left assigning `state.pathCompute.state = "failed"`. It has been reverted to `"completed"` and that line now matches `HEAD`; `git diff` reports no change at that line.
  - Re-run in this session, on the exact TP-28-03 command from the Test Plan row: exit code 0, `92 passed (2.2m)`, with zero failed, zero flaky, and zero skipped across all eight browser carriers.
  - [report.md#tp-28-03](report.md#tp-28-03) still carries the superseded pre-fix analysis and its `not established` verdict. `report.md` is owned by `bubbles.implement` and is not written by this scope; refreshing that section with the post-fix receipt is outstanding work for that owner.
- TP-28-04 is authored in `tests/portfolio-test-integrity.unit.mjs`, with test-owned in-memory substitution support in `tests/portfolio-defect-injector.cjs`. Both now execute; the new carrier is reachable through the `node --test tests/*.unit.mjs` command declared in `.specify/memory/agents.md`.
- The disposable Scope 27 mutation control named `tp-27-04-control.spec.mjs`, which lived in the repository `tests/` directory, has been REMOVED from the working tree, not merely labelled as disposable. It duplicated all three exact Scope 27 scenario titles and gated its mutation behind a `TP_27_04_CONTROL` environment variable, so an ordinary run passed the duplicated titles unconditionally. Its name matched the `**/*.spec.mjs` testMatch glob declared at `playwright.config.mjs:4`, so the matrix would have executed it. The file was never tracked in Git. No executable `TP_27_04_CONTROL` reference remains anywhere in the repository; the identifier survives only in this deletion record and in the corresponding [report.md](report.md) evidence section. This record spells the removed carrier as a bare basename rather than as a rooted path on purpose: `scripts/validate-spec-test-paths.mjs` derives live carrier references from contiguous `tests/`-rooted `.mjs` tokens, so a rooted spelling would re-register a deliberately deleted file as a live carrier and fail that guard. Do not "repair" this spelling back to a rooted path.
- The separate Scope 27 mutation control that REMAINS is the `Adversarial: SCN-008-053 reduced accessibility implementations fail closed` row at `tests/portfolio-survival-accessibility.spec.mjs:501`, which serves reduced HTML through Playwright route interception. That row is a disposable mutation control and is not live `e2e-ui` evidence, even though the file carries other rows that are. It is an in-file row rather than a duplicate carrier file, and it is unaffected by the removal above.
- The structured plan and manifest rows are PARTIALLY reconciled, not fully. In `test-plan.json`, TP-28-01, TP-28-02, TP-28-04, and TP-28-05 now read `testState: authored` with `status: done`. Two desynchronized rows remain: TP-28-03 and TP-28-06 both still read `testState: planned-not-authored` with `status: planned-not-executed` even though both have executed and passed. In `scenario-manifest.json`, the SCN-008-054 entry still reads `linkedTestContracts[0].planStatus: planned-not-authored` even though TP-28-04 is authored and done. Both files are owned by `bubbles.plan` and are not written by this scope's execution.

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

- [ ] SCN-008-054 and the complete authoritative scenario set have exact discriminating test ownership with no historical evidence used as current proof. → Blocked: `scenario-test-resolve.sh` exits 1 with 1 unresolved reference of 65; SCN-008-055 has no carrier title and is owned by Scope 29. Evidence: [report.md#linked-test-resolution](report.md#linked-test-resolution)
- [x] TP-28-01 declaration reachability passes with zero unresolved or zero-match titles. → Evidence: [report.md#tp-28-01](report.md#tp-28-01)
- [x] TP-28-02 aggregate Node behavior passes. → Evidence: [report.md#tp-28-02](report.md#tp-28-02)
- [x] TP-28-03 complete real-page Feature 008 matrix passes. → The exact Test Plan command re-run in this session exits 0 with `92 passed (2.2m)`, zero failed, zero flaky, and zero skipped. The earlier red/green pair is resolved at source by `expectPathComputeCompleted` (settle-then-assert, not a raised timeout) plus the revert of the `portfolio-survival-allocation-lab.html:4418` working-tree corruption. Evidence: [Current Execution Checkpoint](#current-execution-checkpoint); [report.md#tp-28-03](report.md#tp-28-03) still holds the superseded pre-fix analysis and is owned by `bubbles.implement`.
- [x] TP-28-04 adversarial mutation integrity proves every audited defect class is load-bearing. → Evidence: [report.md#tp-28-04](report.md#tp-28-04)
- [x] TP-28-05 regression-quality guard passes. → Evidence: [report.md#tp-28-05](report.md#tp-28-05)
- [x] TP-28-06 repository selftest passes. → Evidence: [report.md#tp-28-06](report.md#tp-28-06)
- [x] Shared Infrastructure Impact Sweep and test-only rollback proof are recorded. → Evidence: [report.md#shared-infrastructure-impact-sweep](report.md#shared-infrastructure-impact-sweep) and [report.md#test-only-rollback-proof](report.md#test-only-rollback-proof)
- [ ] Build Quality Gate passes with zero skips/warnings, synchronized plan/manifest rows, and no production-source edits in this scope. → Partially met: `git diff --check` exits 0, zero skips and zero warnings are recorded, and Scope 28 made no production-source edit — the only production diff in the working tree is the brief window-selector and refusal-naming work owned by BUG-001, which does not touch the path-compute lifecycle. Still blocked on synchronized plan/manifest rows, which are owned by `bubbles.plan`: `test-plan.json` rows TP-28-03 and TP-28-06 still read `testState: planned-not-authored` with `status: planned-not-executed` despite both having passed, and the `scenario-manifest.json` SCN-008-054 entry still reads `linkedTestContracts[0].planStatus: planned-not-authored` despite TP-28-04 being authored and done. Evidence: [report.md#build-quality-gate](report.md#build-quality-gate)
