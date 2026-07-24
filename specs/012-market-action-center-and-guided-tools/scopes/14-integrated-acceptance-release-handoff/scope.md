# Scope 14: Integrated Acceptance, Migration, And Release Handoff

## 14-integrated-acceptance-release-handoff

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `integration:true`, `release-critical:true`, `consumer-trace:true`, `rollback-critical:true`

Depends On: 11-feature-002-authored-brief-integration, 12-dynamic-red-alert, 13-feature-008-private-portfolio-integration

**External Eligibility Gate:** BUG-004 must be terminally certified with current TP-09 no-interception system-Chrome evidence and TP-12 browser functional regression, plus current same-provider ordering/key-containment evidence. The current absent Linux Chrome channel and `in_progress` certification do not satisfy the gate. Scope 14 consumes that evidence; it does not edit or recertify BUG-004.

**Primary Outcome:** The complete 23-entry experience is cut over and verified as one static build-free product: exact four views, all owner adapters/goals/context, cited/public/private-safe projections, dynamic alerts, global journeys, source truth, no execution, mobile/accessibility/performance, atomic publication/migration/rollback, Pages verification, documentation alignment, and a contract-only QF portability handoff with no cross-repo source copy.

## Requirement Coverage

- **Functional:** final integration of FR-001 through FR-120.
- **Non-functional:** NFR-001 through NFR-018.
- **Acceptance:** SCN-012-012, SCN-012-013, SCN-012-026, and SCN-012-030, plus full regression execution for SCN-012-001 through SCN-012-037.

## Gherkin Scenarios

### SCN-012-012 - Keyed provider route falls back once to the same provider

```gherkin
Scenario: SCN-012-012 A reachable proxy cannot serve one keyed provider route
  Given BUG-004 is certified
  And that browser has a local key for the same registered provider
  When the keyless proxy provider route fails
  Then one direct CORS attempt to that provider's registered host follows
  And no other provider is attempted
  And the key appears only in the registered direct request
```

### SCN-012-013 - Keyed provider without local key fails closed

```gherkin
Scenario: SCN-012-013 A proxy provider route fails without a same-provider local key
  Given the proxy is reachable
  And that browser has no local key for the provider
  When the provider route fails
  Then no direct request is made
  And the user receives a sanitized unavailable state
```

### SCN-012-026 - Global next-session Journey completes

```gherkin
Scenario: SCN-012-026 A user selects Prepare the next session
  Given current Brief and owner evidence are available
  When the user completes the guided steps
  Then every current action and catalyst is accepted for research, refused, or blocked by named evidence
  And the completion packet records triggers, invalidations, gaps, and no-execution signoff
```

### SCN-012-030 - QF migration remains contract-only

```gherkin
Scenario: SCN-012-030 A later authenticated private adapter is proposed
  Given Research Lab portable contracts are stable
  When the platform owner evaluates QF integration
  Then the adapter maps contract semantics through QF-owned auth, storage, and services
  And no Research Lab DOM/storage/fetch source is copied
  And no QF service implementation is inserted into the static site
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-012 accepted source state | BUG-004 certified evidence and integrated source consumer | Trigger the already-certified same-provider path, then inspect Simple/Power/Brief/Journey source strips | Consumer states exact source/order/fallback/freshness without key/cross-provider disclosure; authoritative transport proof remains BUG-004 functional tests | functional + e2e-ui |
| SCN-012-013 no key | Proxy route failure and no matching local key | Open affected tool after source refusal | Sanitized unavailable state propagates through all views; zero direct/other-provider request or fabricated result | functional + e2e-ui |
| SCN-012-026 prepare session | Qualified current public generation | Run all guided steps, classify every action/catalyst, sign off | Packet lists accepted/refused/blocked evidence, triggers, invalidations, gaps, typed outcome, review-only signoff, no external effect | e2e-ui |
| SCN-012-030 portability | Stable portable contracts and no approved remote provider | Inspect contract export/refusal | Runtime-neutral packet maps fields conceptually; Research Lab remains local/static; no QF/auth/network source exists | functional |
| Full desktop/mobile | Current all-gates generation and local private fixture | Traverse all 23 routes/modes, Center views, tooltips, Journeys, matrix, alerts at desktop/320px/200% zoom | Exact labels, truthful states, no overlap/body overflow/covered focus, all tickers contextual, no execution/private leak | e2e-ui |

## Implementation Files

### New Validation And Acceptance Files

- `scripts/validate-feature-012.mjs`
- `tests/feature-012.acceptance.unit.mjs`
- `tests/feature-012.privacy-security.functional.mjs`
- `tests/feature-012.qf-portability.contract.mjs`
- `tests/feature-012.rollback.integration.mjs`
- `tests/feature-012.consumer-trace.mjs`
- `tests/feature-012.acceptance.spec.mjs`
- `tests/feature-012.mobile-accessibility.spec.mjs`
- `tests/feature-012.performance.spec.mjs`

### Final Reconciliation Files - Edit Only If Acceptance Exposes A Contract Gap

- `tool-experience.config.json`
- `simple-models.json`
- `journeys.json`
- `tools.json`
- `rlexperience.js`
- `rlviews.js`
- `rlapp.js`
- `rlcontext.js`
- `rljourney.js`
- `rlmarketaction.js`
- `rlbrief.js`
- `market-brief.html`
- `market-brief.config.json`
- `scripts/web-evidence-acquire.mjs`
- `scripts/brief-author.mjs`
- `scripts/brief-publication.mjs`
- `scripts/brief-refresh.mjs`
- `scripts/validate-tool-experience.mjs`
- `scripts/validate-web-evidence.mjs`
- `scripts/validate-market-action.mjs`
- `scripts/selftest.mjs`

### Deployment Verification - `bubbles.devops` Ownership

- `.github/workflows/pages.yml`

### Managed Documentation Handoff - `bubbles.docs` Ownership

- `README.md`
- `.github/copilot-instructions.md`
- `notes/shared-data-layer.md`
- `notes/market-brief.md`
- `notes/market-heatmap-lab.md`
- `notes/options-flow-feed-lab.md`
- `notes/intraday-tape-lab.md`
- `notes/swing-structure-lab.md`
- `notes/options-structure-lab.md`
- `notes/gamma-trading-lab.md`
- `notes/sector-research-lab.md`
- `notes/global-rotation-lab.md`
- `notes/real-assets-lab.md`
- `notes/bond-regime-lab.md`
- `notes/ai-capex-strategy-lab.md`
- `notes/msft-july-print-model.md`
- `notes/company-fundamentals-lab.md`
- `notes/etf-momentum-lab.md`
- `notes/strategy-self-improvement-lab.md`
- `notes/strategy-validation-lab.md`
- `notes/smart-money-flow-lab.md`
- `notes/waterfront-polo-lab.md`
- `notes/volatility-sizing-lab.md`
- `notes/place-based-rental-market-research.md`
- `notes/technical-analysis-decision-lab.md`

No QF repository file is in the change boundary.

## Implementation Plan

1. Mechanically prove all numbered and external predicates, current source-lock/runner identity, and one complete accepted Feature 002 generation before cutover. A false/regressed predicate blocks only the corresponding claim and prevents final release.
2. Add the aggregate validator over registry/config/definitions/adapters/context/goals/publication/matrix/alerts/private barrier/source predicates/versions/budgets/no-execution and all 37 scenario contracts.
3. Execute BUG-004's authoritative functional rows for same-provider and no-key behavior and consume its current TP-09/TP-12 evidence. Add only Feature 012 consumer-visible source-state E2E; do not reclassify intercepted transport as live E2E.
4. Complete the controlled migration: contract shadow -> adapter shadow -> context shadow -> shell cutover -> Center rename -> Feature 002 v2 generation -> Feature 008 private lane. Each stage has a versioned config gate and rollback checkpoint; no partial all-tool cutover is public.
5. Suppress every legacy ordinary mode control only after all 22 adapters, contexts, Brief states, Journey goals, hash/focus, and no-duplicate canaries pass. No fifth mode survives.
6. Validate every route and all four Center views across current/partial/stale/unavailable/disputed/rejected/dependency/empty states, with ticker links/context, source truth, and zero execution.
7. Run full public/private/security inventories: provider keys, private ticker/holding/quantity/cost/P&L/mandate/Journey answers, hostile web content, authored HTML, URLs/referrers/requests/logs/DOM/storage/public tree/publisher/telemetry.
8. Prove performance budgets under real static browser operation: first paint, view switch, standard/heavy recompute, context open, registry parse, matrix size, Journey store limits, visible alert cap, and publication cap. Capture p95 from complete runs; partial runs cannot satisfy.
9. Prove mobile, 200% zoom, keyboard, touch, reduced-motion, focus return, canvas fallback, stable geometry, no body overflow, and no covered controls across representative and registry-loop routes.
10. Prove rollback: shell config restoration, previous Feature 002 pointer selection with refs/hashes, context compatibility, inert Journey slots, private adapter unregistration, and no data/history deletion.
11. Update Pages `verify` through devops ownership to run source lock, exact runner identity, core selftest, Feature 012 validators, and the complete no-interception acceptance browser suite before root-artifact deployment. No application build/bundle/runtime is added.
12. Route managed documentation to `bubbles.docs` after implementation reality is verified. Every tool note documents its exact Simple question/parameters, Power context, Brief domain/state, Journey goals, source/limitations, and no-execution boundary; Market Brief docs use Market Action Center while preserving route/history terminology.
13. Validate QF portability only through runtime-neutral contracts and a refusal/negotiation fixture. Document consent/access/deletion/audit/version requirements; do not copy/import/edit either product's source.

## Shared Infrastructure And Consumer Impact Sweep

| Surface | Required final proof |
|---|---|
| All 23 registry routes | One exact four-view set, no duplicate/legacy visible control, correct default/hash/history/focus, owner/evidence identity preserved |
| Source/data owners | BUG-004 certified keyed path, Yahoo separate keyless chain, daily snapshot truth, unchanged options producer/path |
| RLG/RLTKR/RLCHART/RLCTX | One context engine, all analytical items covered, every ticker linked/contextual, chart keyboard/touch/table parity |
| Feature 002 publication | One complete v2 generation, v1 compatibility, pointer last, prior pointer byte-identical on failure, rollback/history append-only |
| Feature 008 storage | Sole private owner, opaque adapter only, public/private separation, clear/privacy/no-mutation intact |
| Browser storage/hash/referrer | No sensitive/private source; Journey namespace closed; mode/target public only |
| Market Action rename | Route/ID/nav/deep links/payload/scripts/workflows/prompts/docs/tests classified; zero stale visible first-party name/route |
| QF boundary | Zero cross-repo imports/copies/edits; portable contract fields/version/refusal only |

## Change Boundary And Protected Paths

**Allowed:** files listed under Implementation Files, partitioned by owning specialist. Final reconciliation edits require a failing acceptance assertion that points to that exact file; broad cleanup is forbidden.

**Always excluded:** `rldata.js` production edits (Feature 012 consumes BUG-004/source owner), `scripts/fetch-options.mjs`, `data/options/**`, all Feature 002/008/BUG-004 specs/design/scopes/state/certification/evidence, all QF files, package/lockfile/`.npmrc` unless a separately planned source-lock change is approved, unrelated tools/data/history, and framework-managed files.

## Rollback

1. Unregister Feature 008/QF provider adapters; leave owning data untouched.
2. Select and verify the prior Feature 002 manifest/pointer; append rollback history; regenerate compatibility projection; never reauthor/delete objects.
3. Disable shell cutover through committed versioned config and restore tested compatibility controls/context renderer without rewriting local mode/Journey/private/provider state.
4. Keep newer local slots inert/version-rejected until user clears through shipped controls.
5. Re-run route/registry/source/payload/public-private/browser/selftest baselines and prove no history/data/credential/private loss.

## Scenario-First RED/GREEN Contract

Create aggregate source-consumer, next-session Journey, QF boundary, privacy, migration, rollback, mobile, and performance assertions before final cutover/reconciliation. Existing already-green scope tests are regressions, not retroactive RED. New behavior requires intended RED and identical-command GREEN. A missing external predicate/browser is a blocker, never RED.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-14-01 | External dependency gate | functional | SCN-012-012, SCN-012-013 | `scripts/validate-feature-012.mjs` | Prove BUG-004 terminal certification, current TP-09/TP-12, same-provider/key containment, and all Feature 012 numbered/external prerequisites | `node scripts/validate-feature-012.mjs --require-all-dependencies` | No | `report.md#tp-14-01` |
| TP-14-02 | Authoritative source functional | functional | SCN-012-012 | `tests/provider-credentials.functional.mjs` | Reuse BUG-004 exact proxy HTTP failure, same-provider one-attempt, no-cross-provider/key-containment production-path proof | `node --test --test-name-pattern="Regression BUG-004: proxy HTTP failure falls back once to same-provider local key|Regression BUG-004: fallback never crosses provider or retries" tests/provider-credentials.functional.mjs` | No | `report.md#scenario-scn-012-012` |
| TP-14-03 | Authoritative fail-closed functional | functional | SCN-012-013 | `tests/provider-credentials.functional.mjs` | Reuse BUG-004 exact no-same-provider-key zero-direct sanitized-unavailable proof | `node --test --test-name-pattern="Regression BUG-004: no same-provider key fails closed without disclosure" tests/provider-credentials.functional.mjs` | No | `report.md#scenario-scn-012-013` |
| TP-14-04 | Source consumer Regression E2E | e2e-ui | SCN-012-012, SCN-012-013 | `tests/feature-012.acceptance.spec.mjs` | `Regression: certified keyed source truth propagates to all modes without key or cross-provider disclosure` | `npx --no-install playwright test tests/feature-012.acceptance.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: certified keyed source truth propagates to all modes without key or cross-provider disclosure" --reporter=list` | Yes | `report.md#tp-14-04` |
| TP-14-05 | Global Journey Regression E2E | e2e-ui | SCN-012-026 | `tests/feature-012.acceptance.spec.mjs` | `Regression: SCN-012-026 prepare-session Journey classifies every action and catalyst in a non-executing packet` | `npx --no-install playwright test tests/feature-012.acceptance.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-026 prepare-session Journey classifies every action and catalyst in a non-executing packet" --reporter=list` | Yes | `report.md#scenario-scn-012-026` |
| TP-14-06 | QF portability contract | functional | SCN-012-030 | `tests/feature-012.qf-portability.contract.mjs` | Validate runtime-neutral field/version/refusal/consent/access/deletion/audit/no-execution semantics and zero Research Lab/QF source import/copy | `node --test tests/feature-012.qf-portability.contract.mjs` | No | `report.md#scenario-scn-012-030` |
| TP-14-07 | Aggregate contract/unit | unit | SCN-012-001 through SCN-012-037 | `tests/feature-012.acceptance.unit.mjs` | Validate complete registry/config/adapter/context/Journey/evidence/Brief/matrix/alert/Center/source/version/no-execution graph | `node --test tests/feature-012.acceptance.unit.mjs` | No | `report.md#tp-14-07` |
| TP-14-08 | Privacy/security functional | functional | SCN-012-005, SCN-012-011, SCN-012-020, SCN-012-021, SCN-012-027 | `tests/feature-012.privacy-security.functional.mjs` | Scan production transformations and all forbidden surfaces for keys/private/hostile/execution sentinels and prove safe refusal | `node --test tests/feature-012.privacy-security.functional.mjs` | No | `report.md#tp-14-08` |
| TP-14-09 | Consumer trace | functional | SCN-012-017, SCN-012-030, SCN-012-032 | `tests/feature-012.consumer-trace.mjs` | Trace all 23 routes, rename consumers, docs, deep links, definitions, goals, tests, public/private owners, and zero QF copy/stale refs | `node --test tests/feature-012.consumer-trace.mjs` | No | `report.md#tp-14-09` |
| TP-14-10 | Full acceptance E2E | e2e-ui | SCN-012-001 through SCN-012-037 | `tests/feature-012.acceptance.spec.mjs` | Registry-derived real-page suite traverses every route/mode and Center view, proving all scenario-visible states with no interception | `npx --no-install playwright test tests/feature-012.acceptance.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-14-10` |
| TP-14-11 | Mobile/accessibility E2E | e2e-ui | SCN-012-003, SCN-012-009, SCN-012-017, SCN-012-021, SCN-012-023, SCN-012-031 | `tests/feature-012.mobile-accessibility.spec.mjs` | Desktop/tablet/320px/200%-zoom keyboard/touch/reduced-motion/focus/canvas/table/no-overflow coverage across representative/all-view surfaces | `npx --no-install playwright test tests/feature-012.mobile-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-14-11` |
| TP-14-12 | Browser performance stress | stress | SCN-012-001, SCN-012-003, SCN-012-017 | `tests/feature-012.performance.spec.mjs` | Measure complete repeated first-paint/view/recompute/context p95 runs against configured budgets; no partial sample passes | `npx --no-install playwright test tests/feature-012.performance.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Stress: Feature 012 interactive p95 budgets" --reporter=list` | Yes | `report.md#tp-14-12` |
| TP-14-13 | Browser capacity load | load | SCN-012-021, SCN-012-023, SCN-012-032 | `tests/feature-012.performance.spec.mjs` | Exercise max matrix rows/cells, Journey sessions, visible alerts, registry/config bytes, and public generation caps without silent truncation | `npx --no-install playwright test tests/feature-012.performance.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Load: Feature 012 configured capacity budgets" --reporter=list` | Yes | `report.md#tp-14-13` |
| TP-14-14 | Migration/rollback integration | integration | SCN-012-017, SCN-012-020, SCN-012-021 | `tests/feature-012.rollback.integration.mjs` | Execute staged cutover and reverse rollback, verify prior pointer/controls/renderer, inert local slots, adapter unregister, append-only history, and no data loss | `node --test tests/feature-012.rollback.integration.mjs` | No | `report.md#tp-14-14` |
| TP-14-15 | Source lock and validators | functional | SCN-012-001 through SCN-012-037 | committed validators | Prove source lock, registry, WebEvidence, Market Action, payload, and aggregate contract acceptance | `node scripts/validate-node-source-lock.mjs && node scripts/validate-tool-experience.mjs --require-complete && node scripts/validate-web-evidence.mjs && node scripts/validate-market-action.mjs && node scripts/validate-brief-payload.mjs && node scripts/validate-feature-012.mjs` | No | `report.md#tp-14-15` |
| TP-14-16 | Broad build-free regression | unit | SCN-012-001 through SCN-012-037 | `scripts/selftest.mjs` | Complete existing and Feature 012 production helper/invariant suite | `node scripts/selftest.mjs` | No | `report.md#tp-14-16` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] All numbered and external gates are mechanically true; all 23 experiences, exact view sets, adapters, contexts, Briefs, Journeys, matrix, alerts, source states, and dependency states are fully integrated without a bypass.
- [ ] SCN-012-012/013 source behavior uses BUG-004's authoritative classification/evidence and propagates truthful sanitized states through Feature 012 without editing source ownership.
- [ ] SCN-012-026 global Journey and every other acceptance scenario produce provenance-complete non-executing outcomes under current/partial/stale/unavailable/disputed/rejected/empty states.
- [ ] Mobile/accessibility/performance/capacity/privacy/security/source-lock/publication/migration/rollback/Pages and consumer-trace requirements are complete.
- [ ] Managed docs are updated by `bubbles.docs`; Pages verification by `bubbles.devops`; QF portability remains contract-only with zero cross-repo source edits.

#### Test Evidence Items - Exact Parity With 16 Test Plan Rows

- [ ] TP-14-01 dependency evidence proves all external and numbered prerequisites.
- [ ] TP-14-02 functional evidence proves SCN-012-012 authoritative same-provider one-attempt/key containment.
- [ ] TP-14-03 functional evidence proves SCN-012-013 zero-direct sanitized fail-closed behavior.
- [ ] TP-14-04 E2E evidence proves source truth propagation through all modes without claiming live external transport.
- [ ] TP-14-05 E2E evidence proves SCN-012-026 complete next-session packet and no execution.
- [ ] TP-14-06 contract evidence proves SCN-012-030 QF semantic mapping/refusal and no source copy.
- [ ] TP-14-07 unit evidence proves the complete Feature 012 contract graph.
- [ ] TP-14-08 functional evidence proves private/key/hostile/execution sentinel absence and safe refusal.
- [ ] TP-14-09 consumer-trace evidence proves all routes/rename/docs/deep-links/goals/owners and zero stale/QF-copy references.
- [ ] TP-14-10 full E2E evidence proves all scenario-visible behavior across every route/mode with no interception.
- [ ] TP-14-11 E2E evidence proves mobile/zoom/keyboard/touch/focus/canvas/accessibility geometry.
- [ ] TP-14-12 stress evidence proves complete p95 interactive budgets.
- [ ] TP-14-13 load evidence proves configured registry/matrix/Journey/alert/publication capacities without truncation.
- [ ] TP-14-14 integration evidence proves staged migration and complete no-data-loss rollback.
- [ ] TP-14-15 validator evidence proves source-lock and every committed contract/public payload graph.
- [ ] TP-14-16 broad selftest evidence proves the existing Research Lab baseline remains green.

#### Build Quality Gate

- [ ] Scenario-specific RED/GREEN for new Scope 14 behavior; exact Playwright 1.61.1/system-Chrome identity; no-interception/service-worker scan; full unit/functional/integration/E2E/stress/load runs; dependency/certification checks; privacy/security/no-execution scans; all-23 consumer/goal/context coverage; source-owner and generated-artifact inventory; mobile/accessibility/performance evidence; migration/rollback; Pages verification; docs alignment; protected-path diff; editor diagnostics; `git diff --check`; source-lock; validators; artifact lint; traceability; capability-foundation guard; state diagnostics; and broad selftest are current and clean with every finding accounted for.
