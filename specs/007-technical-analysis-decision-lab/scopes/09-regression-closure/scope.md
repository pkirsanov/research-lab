# Scope 09: Protected Regression And Governance Closure

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `validation-hardening:true`, `regression:true`

**Depends On:** Scope 01 - Capability Foundation And Shared Contracts; Scope 02 - Technique Engine And Evidence Independence; Scope 03 - Level Geometry And Setup Lifecycle; Scope 04 - Five-Gate Synthesis And Candidate Selection; Scope 05 - Existing-Owner Publication And Strict Adapters; Scope 06 - Comparison And Optional Evidence; Scope 07 - Validation Cost Expectancy And Process; Scope 08 - Complete Experience Publication And Registration

**Primary Outcome:** The complete Feature 007 and shared-consumer matrix executes against production functions and real HTTP pages, every discovered finding is individually closed or owner-routed, and delivery evidence remains coherent without changing certification or terminal status directly.

## Gherkin Scenario

### SCN-007-032 - Complete protected matrix remains executable

```gherkin
Scenario: Complete Feature 007 and shared-consumer matrix remains executable
  Given Scopes 01 through 08 are complete with their exact scenario and contract tests
  When the repository selftests, validators, page integrity checks, system-Chrome suites, and governance guards execute from the repository root
  Then every SCN-007-001 through SCN-007-031 behavior has a persistent non-silent assertion and current evidence
  And shared data, owner, validation, credential, registry, canvas, and prior-feature canaries retain their accepted behavior
  And every discovered finding is fixed and the affected checks are rerun before completion
```

## Protected Regression Matrix

| Coverage slice | Required proof |
| --- | --- |
| All 31 business scenarios | Exact `Regression: SCN-007-*` titles in `tests/technical-analysis-decision-lab.spec.mjs`, focused evidence refs, and complete-file pass |
| Complete pure kernel | `node scripts/selftest.mjs` extracts all 65 `tad*` and seven `RLVALID` declarations and retains every existing group |
| Committed config/universe | Feature validator checks exact keys, ids, references, claims, symbols, setup predicates, session policies, owner capabilities, and parse parity |
| Shared data/credentials | Provider-credential browser suite plus RLDATA legacy/additive canaries |
| Existing owner pages | Scope 05 real-page owner matrix and Strategy Validation parity |
| Feature 006 optional adapter | Trend Dynamics suite retains accepted behavior; absence/mismatch remains unavailable in Feature 007 |
| Feature 005 dirty work | Palm Springs suite outcome is compared as Feature 005-owned evidence and never repaired by Feature 007 |
| Other shared-data/browser consumers | Causal, Bond, and FX system-Chrome suites run because `rldata.js`, registries, and shared navigation are high-fan-out surfaces |
| Market Brief registry consumer | Existing Brief validator remains green with registry-derived coverage and no duplicated Feature 007 calculations |
| Live-test integrity | No internal request interception/fulfillment, service worker substitution, silent return, skipped/only title, or fixture-as-live claim |

## Implementation And Validation Plan

1. Freeze a pre-Scope-09 command/title/outcome inventory for every Test Plan row below, preserving any unrelated current failure signature under its owning feature rather than relabeling it.
2. Review the Feature 007 browser file for exact titles, direct user-visible assertions, no conditional bailout, no internal interception/fulfillment, real ephemeral HTTP server ownership, and explicit fixture provenance.
3. Execute the source-lock validator and require the checkout-local runner to print exactly `Version 1.61.1`. Run `npm ci` only when the checkout-local install is absent/stale or the committed lockfile changed, using the exact command in `.specify/memory/agents.md`.
4. Execute the full selftest, Feature 007 validator, page inline/ID check, every focused title needed to discriminate a failure, and the complete Feature 007 browser file.
5. Execute provider credentials, Trend Dynamics, Palm Springs, Causal Rotation, Bond Regime, and FX Regime browser suites because shared data/owner/registry/navigation changes can affect those first-party consumers. Do not run unrelated browser files without a changed-contract reason.
6. Execute Brief and Causal validators as shared registry/data contract canaries. Compare title inventories, pass/fail/skip counts, and stable failure signatures with the frozen inventory.
7. Repair only the owning Feature 007 marker/hunk when an owned check fails; rerun the narrow failing command, the nearest independent shared canary, then the full Feature 007 suite.
8. Run artifact lint, artifact freshness, G094, traceability, focused plan sync, no-deferral/fabrication scans, framework write guard, repository readiness, editor diagnostics, and `git diff --check`.
9. Account for every finding. A product/test/docs/governance issue outside the allowed Feature 007 boundary is preserved verbatim in a `route_required` packet with owner and evidence; it is not silently removed from the ledger.
10. Record current raw evidence in this scope's `report.md` under the phase that executed it. Only `bubbles.validate` may write certification or request a terminal state transition.

## Shared Infrastructure Impact Sweep

| Protected surface | Independent canary | Failure ownership rule | Restore contract |
| --- | --- | --- | --- |
| `rldata.js` | Full selftest, provider suite, Feature 007 owner matrix, Trend/Palm/Causal/Bond/FX suites | Only Feature 007 marker defects are owned here | Reverse exact Feature 007 block, retain all foreign hunks |
| `rlvalidation.js` / Strategy Validation | Full selftest, Strategy Validation real-page canary, Feature 007 validation tests | Shared helper defects inside Feature 007-owned file are owned; strategy-specific changes are prohibited | Restore last green helper bytes and adapter marker |
| Six owner publisher pages | Scope 05 owner matrix plus cumulative suite | Only nested Feature 007 marker defects are owned | Reverse one owner marker at a time and rerun its canary |
| `scripts/selftest.mjs` | Full existing test inventory and marker audit | Only Feature 007 marker defects are owned | Reverse exact Feature 007 sub-hunk |
| Registries/navigation | Registry equality, provider suite, real route navigation, Brief validator | Only exact Feature 007 entries are owned | Remove exact entries without reordering other tools |
| Feature 005/006 paths | Their own validators/browser suites | Foreign-owned outcomes remain attributed and visible | No Feature 007 edit action |

## Change Boundary And Rollback

**Allowed repair files:** Feature 007 page/config/note/validator/test/fixtures; `rlvalidation.js`; exact Feature 007 markers in `rldata.js`, Strategy Validation, six owner pages, and `scripts/selftest.mjs`; exact Feature 007 registry entries.

**Explicitly excluded:** weakening or deleting a planned assertion; changing an existing suite to match broken behavior; edits to Feature 005/006 source/tests/specs; broad shared-file rewrites; packages/workflows; Market Brief calculations/payload; unrelated pages/tests/docs; certification fields; and terminal status.

**Path-scoped repair rule:** inspect only the failing path, its exact marker, and nearest owning contract before an edit. Preserve all unrelated dirty work and never stage, commit, reset, clean, reformat, or rewrite a shared file.

**Rollback/restore:** reverse only the defect-causing Feature 007 marker or file hunk, rerun its focused test and independent canary, then rerun the full Feature 007 suite. A failed shared repair returns to the last green marker bytes without changing any foreign hunk.

## Scenario-First TDD Contract

SCN-007-032 is authored before the protected-matrix browser assertion. Capture the focused title failing while any required title/receipt is absent, complete the matrix without weakening existing assertions, then rerun the same command to GREEN. Existing scenario RED/GREEN evidence remains immutable and is not reconstructed.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-09-01 | Source-lock contract | functional | SCN-007-032 | `scripts/validate-node-source-lock.mjs` | Existing exact package, single registry, lock integrity, lifecycle-script, and no-browser-download policy remains valid | `node scripts/validate-node-source-lock.mjs` | No | `report.md#tp-09-01` |
| TP-09-02 | Runner identity | functional | SCN-007-032 | Checkout-local Playwright | Resolve without install and print exactly `Version 1.61.1` | `npx --no-install playwright --version` | No | `report.md#tp-09-02` |
| TP-09-03 | Broad production helper suite | unit | SCN-007-001 through 032 | `scripts/selftest.mjs` | Execute every existing group plus all 65 Feature 007 page symbols, seven shared validation symbols, owner/registry/data canaries, and exact pass/fail totals | `node scripts/selftest.mjs` | No | `report.md#tp-09-03` |
| TP-09-04 | Complete feature validator | functional | SCN-007-001 through 032 | `scripts/validate-technical-analysis-decision.mjs` | Validate production config/page/note/fixtures/owners/registries/symbols/claims/sessions/setups/comparisons/validation/publication and exact rejection inventory | `node scripts/validate-technical-analysis-decision.mjs` | No | `report.md#tp-09-04` |
| TP-09-05 | Page integrity | functional | SCN-007-023 | `technical-analysis-decision-lab.html` | Parse every inline script and require every literal ID reference | Exact `TAD-PAGE-INLINE-ID` command from Scope 01 | No | `report.md#tp-09-05` |
| TP-09-06 | Protected-matrix Regression E2E | e2e-ui | SCN-007-032 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-032 complete Feature 007 protected matrix remains executable` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-032 complete Feature 007 protected matrix remains executable" --reporter=list` | Yes | `report.md#scenario-scn-007-032` |
| TP-09-07 | Complete Feature 007 Regression E2E | e2e-ui | SCN-007-001 through 032 | `tests/technical-analysis-decision-lab.spec.mjs` | Execute every exact Feature 007 Regression title over the real ephemeral static server | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-09-07` |
| TP-09-08 | Credential/browser regression | e2e-ui | SCN-007-023 | `tests/provider-credentials.spec.mjs` | Central credentials, settings ownership, route shell, and no local credential input remain green | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-09-08` |
| TP-09-09 | Feature 006 browser regression | e2e-ui | SCN-007-024 | `tests/trend-dynamics-cycle-lab.spec.mjs` | Trend Dynamics owner behavior and accepted title inventory remain unchanged while Feature 007 treats absence/mismatch honestly | `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-09-09` |
| TP-09-10 | Feature 005 browser regression | e2e-ui | SCN-007-032 | `tests/palm-springs-rental-market-lab.spec.mjs` | Palm Springs dirty-work title inventory retains its owner-attributed outcome | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-09-10` |
| TP-09-11 | Causal browser regression | e2e-ui | SCN-007-032 | `tests/causal-rotation-lab.spec.mjs` | Existing evidence-time/source-cluster behavior remains green after shared data and registry changes | `npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-09-11` |
| TP-09-12 | Bond browser regression | e2e-ui | SCN-007-032 | `tests/bond-regime-lab.spec.mjs` | Existing source, decision, owner-read, responsive, and canvas behavior remains green | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-09-12` |
| TP-09-13 | FX browser regression | e2e-ui | SCN-007-032 | `tests/fx-regime-relative-value-lab.spec.mjs` | Existing source-envelope, decision, consumer, responsive, and canvas behavior remains green | `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-09-13` |
| TP-09-14 | Market Brief contract regression | functional | SCN-007-023 | `scripts/validate-brief-payload.mjs` | Existing registry-derived coverage remains valid and contains no duplicated Feature 007 calculation or upgraded truth | `node scripts/validate-brief-payload.mjs` | No | `report.md#tp-09-14` |
| TP-09-15 | Causal contract regression | functional | SCN-007-032 | `scripts/validate-causal-rotation.mjs` | Existing causal source/time/ledger contracts remain green after shared data changes | `node scripts/validate-causal-rotation.mjs` | No | `report.md#tp-09-15` |
| TP-09-16 | Live-test integrity scan | functional | SCN-007-032 | `tests/technical-analysis-decision-lab.spec.mjs` | Reject request interception/fulfillment, service-worker substitution, skip/only, silent-pass returns, and fixture-as-live wording | Exact `TAD-LIVE-TEST-INTEGRITY` command below | No | `report.md#tp-09-16` |

### TAD-LIVE-TEST-INTEGRITY

```bash
node -e 'const fs=require("node:fs");const p="tests/technical-analysis-decision-lab.spec.mjs";const s=fs.readFileSync(p,"utf8");const patterns=[/page\.route/,/context\.route/,/route\s*\(/,/fulfill\s*\(/,/serviceWorker/i,/test\.(skip|only)/,/return\s*;[^\n]*(missing|unavailable|login)/i,/(fixture|analytic)[^\n]*(live market|live source|current market)/i];const hits=patterns.flatMap(re=>[...s.matchAll(new RegExp(re.source,re.flags.includes("g")?re.flags:re.flags+"g"))].map(m=>re+" @ "+m.index));console.log("[tad-live-test-integrity] file="+p);console.log("[tad-live-test-integrity] patterns="+patterns.length);console.log("[tad-live-test-integrity] findings="+hits.length);hits.forEach(hit=>console.log("[tad-live-test-integrity] "+hit));console.log("[tad-live-test-integrity] result="+(hits.length?"FAIL":"PASS"));if(hits.length)process.exitCode=1'
```

No stress/load row is present because Feature 007 has no numeric latency, throughput, or concurrency SLA. The real-page matrix still validates progress, cancellation, navigation availability, synchronous canvas correctness, and atomic publication without making a time-bound claim.

### Definition of Done

#### Core Delivery Items

- [ ] Every SCN-007-001 through SCN-007-032 contract has an exact persistent title, non-silent assertion, test-plan entry, scenario-manifest entry, and evidence anchor; all 31 business scenarios retain exact Gherkin hashes.
- [ ] Complete formula, contract, source/vintage, owner, setup/gate, comparison, validation/cost, lifecycle, truth-state, accessibility/mobile/background-canvas, one-model, publication, registry, and privacy matrices have current evidence.
- [ ] Shared data, validation, owner, selftest, credential, navigation, Market Brief, Feature 005/006, Causal, Bond, and FX canaries retain their frozen title/outcome inventory or have an owner-attributed blocking finding.
- [ ] Live browser tests use real HTTP pages and no interception, fulfillment, service-worker substitution, internal mock, silent pass, or fixture-as-live claim.
- [ ] Every discovered finding is fixed and revalidated inside the allowed boundary or preserved verbatim in an owner-targeted result; no finding disappears from accounting.
- [ ] Change Boundary is respected with zero unexplained Feature 007 hunks outside allowed files/markers and zero Feature 005/006 or unrelated dirty edits.
- [ ] Scope/report/state/scenario/test-plan artifacts agree; top-level status, completed scopes, completed phase claims, policy snapshot, and certification remain unchanged by implementation/testing agents except through their authorized workflow owners.
- [ ] SCN-007-032 has intended RED and same-command GREEN evidence; all earlier RED/GREEN records remain intact.

#### Test Evidence Items - Exact Parity With 16 Test Plan Rows

- [ ] TP-09-01 functional evidence proves the committed Node source-lock contract remains valid.
- [ ] TP-09-02 functional evidence proves the checkout-local runner reports exactly `Version 1.61.1`.
- [ ] TP-09-03 unit evidence proves the full repository selftest and all 65+7 Feature 007 symbols/canaries pass.
- [ ] TP-09-04 functional evidence proves the complete Feature 007 validator and rejection inventory pass.
- [ ] TP-09-05 functional evidence proves page inline-script syntax and ID integrity.
- [ ] TP-09-06 Regression E2E evidence proves SCN-007-032 protects the complete required title/receipt matrix.
- [ ] TP-09-07 broader E2E evidence proves every Feature 007 persistent browser regression passes over real HTTP.
- [ ] TP-09-08 provider-credential browser evidence proves central credential/settings ownership remains green.
- [ ] TP-09-09 Feature 006 browser evidence retains its accepted owner-attributed behavior and title inventory.
- [ ] TP-09-10 Feature 005 browser evidence retains its owner-attributed dirty-work outcome without Feature 007 edits.
- [ ] TP-09-11 Causal browser evidence remains green after shared data and registry changes.
- [ ] TP-09-12 Bond browser evidence remains green for source, decision, owner-read, responsive, and canvas behavior.
- [ ] TP-09-13 FX browser evidence remains green for source, decision, consumer, responsive, and canvas behavior.
- [ ] TP-09-14 functional evidence proves Market Brief registry-derived coverage remains valid without duplicated Feature 007 authority.
- [ ] TP-09-15 functional evidence proves Causal source/time/ledger contracts remain green.
- [ ] TP-09-16 functional evidence proves zero interception, fulfillment, service-worker substitution, skip/only, silent-pass, or fixture-as-live pattern.

#### Build Quality Gate

- [ ] All focused and broad commands, RED/GREEN records, title/outcome comparison, changed-path and marker classification, finding ledger, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, plan sync, traceability, no-deferral/fabrication scans, framework write guard, Bubbles doctor, and repository readiness are current and clean for owned work; terminal status and certification remain owned by `bubbles.validate`.
