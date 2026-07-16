# Scope 16: Integrated Route, Accessibility, And Atomic Release

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `release:atomic`, `ui:true`, `consumer-integration:true`, `shared-infrastructure:true`, `privacy-critical:true`

**Depends On:** Scope 15 - Walk-Forward Research Dossier And Claim Boundaries

**Primary Outcome:** One complete six-tab route preserves a single WorkspaceIdentity across Simple/Power, desktop/mobile, charts/tables, sibling/owner deep links, truth states, and privacy boundaries; only after that proof, one additive transaction registers the tool in every first-party inventory and publishes its exact methodology note.

## Requirement Coverage

- **Functional:** FR-038 through FR-039, FR-060, FR-066, and FR-141, plus integrated verification of FR-001 through FR-150.
- **Non-functional:** NFR-001 through NFR-024.
- **Release boundary:** registration in `index.html`, `tools.json`, `rlnav.js`, README, and `notes/portfolio-survival-allocation-lab.md` occurs together after the unregistered direct route and all focused suites are green.

## Gherkin Scenarios

### SCN-008-036 - One state feeds Simple and Power

```gherkin
Scenario: The user switches between Simple and Power or follows a brief deep link
  Given one portfolio revision, evidence cutoff, behavior state, mandate, and result identity are active
  When the display mode or portfolio tab changes
  Then portfolio facts, recommendations, risk results, paths, candidate weights, and caveats remain coherent
  And display navigation causes no public publication or personal-data transmission
  And Power adds evidence without upgrading or changing the conclusion
```

## UI Scenario Matrix

| Journey / State | Viewports / Inputs | Exact User-Visible Assertions | Test Type |
|-----------------|--------------------|-------------------------------|-----------|
| One identity across six tabs/modes | 1440x1000 and 390x844; all populated states | Same portfolio/evidence/behavior/mandate/result IDs, values, states, caveats and action identities; mode changes make zero request/compute change | e2e-ui |
| Sibling/owner deep-link return | Keyboard/touch, fixed hashes, same-browser session handoff, absent handoff | URL contains fixed route/hash only; return strip/fallback restores action/disclosure/focus; open alone writes no event | e2e-ui |
| Complete visual parity | Every chart/matrix/fan/contribution/weight view visible and initially hidden | Synchronous nonblank pixels, question/interpretation/source/description, keyboard/touch hit testing and equivalent adjacent tables | e2e-ui |
| Accessibility/responsive truth | 1440x1000, 760px, 390x844, 200% zoom, 130% text, high contrast, reduced motion | Landmark/tab order, tablists, focus, 44px targets, non-color state, no body overflow/overlap/clipping, contained Power scrollers | e2e-ui |
| Atomic registration | Registered landing/nav/direct routes plus note/README | Exact id/route/config/note/tags/order parity; no duplicate/stale entry; direct and nav route load the complete tool | e2e-ui |
| Complete privacy boundary | Personal sentinels across every input/result/action/export and publisher harness | Sentinels absent from requests/bodies/URLs/history/referrers/console/RLDATA/tool reads/public files/publisher subprocess; clear proof remains exact | e2e-ui |

## Implementation Plan

1. Finish one `computeWorkspace` and immutable `PortfolioWorkspaceViewModel/v1`; active/draft identities, compute token, last-valid view model, generic rebase, and all six projections obey latest-complete atomic publication.
2. Finish the shared shell, fixed six-tab hashes/order, mode segment, identity/truth bands, setup/privacy sheets, from-Brief return strip, fixed-route session handoff, browser Back/focus restoration, and one-compute Simple/Power rendering.
3. Make every canvas synchronous, DPR-correct, stable-dimensioned, nonblank when data exists, `RLCHART`-attached, keyboard/touch inspectable, source-qualified, and immediately table-equivalent; hidden/background activation draws only when measurable.
4. Close WCAG 2.2 AA keyboard/focus/contrast/non-color/44px/zoom/text-spacing/reduced-motion/live-region/dialog/error-summary contracts and desktop/tablet/narrow-mobile no-overlap/body-overflow requirements.
5. Add one strict marker-bounded `rlnav.js` `ReturnContext/v1` consumer that validates current destination/expiry, renders a local return strip, consumes/clears context, records no completion, and preserves every existing navigation entry/behavior.
6. Add `notes/portfolio-survival-allocation-lab.md` with exact methods, config, data/cutoff/privacy/behavior/analytics/solver/dossier/accessibility/fixture/validation/rollback contracts.
7. After every unregistered route/focused/privacy/accessibility test is green, add one exact additive tool entry in `tools.json`, `index.html`, and `rlnav.js`, plus the matching README tool/add-tool/check reference. Preserve existing order and bytes outside exact insertions.
8. Add marker-bounded Feature 008 groups to `scripts/selftest.mjs` for all production symbols/contracts, config/note/registry parity, route/script/ID/source order, RLDATA/rlnav legacy canaries, constant public read, and absent personal fields.
9. Run the full Feature 008 Node/functional/browser matrix, provider/Feature 001-007 shared-surface browser canaries, source lock, page integrity, privacy scans, governance checks, and changed-path review before any completion request.

## Consumer Impact Sweep

| Consumer / Surface | Required Change Or Proof | Stale-Reference / Regression Check |
|--------------------|--------------------------|------------------------------------|
| `rldata.js` | Scope 04 additive coverage/public-read block only; no final mutation | Full selftest, provider-credentials suite, constant read and personal-field absence |
| `rlnav.js` | One tool registry entry plus one generic strict return-context block | Registry/order parity, all existing routes, fixed destination/expiry/focus/consume behavior, no event write |
| `index.html` | One matching tool entry and working landing navigation | Registry parity, route/config/note existence, actual click/navigation |
| `tools.json` | One exact id/title/route/config/note/tags/order entry | JSON parse, unique id/route, parity with index/rlnav/README/note |
| `README.md` | One truthful inventory/add-tool/check reference after runtime proof exists | Selftest parity and stale-route/name scan |
| `notes/portfolio-survival-allocation-lab.md` | Exact implemented method/privacy/config/test/rollback contract | Referenced paths/ids/commands resolve; no delivery claim exceeds evidence |
| Route hashes/deep links | Six fixed hashes and owner fixed handoff only | History/location/referrer/request sentinel scan; Back/focus restore |
| Tests/manifests/plans | Exact SCN/TP titles, files, evidence anchors and counts | Test-plan/DoD sync, scenario-manifest integrity, traceability guard |

No API client, generated client, server route, authentication redirect, breadcrumb framework, scheduler, or service worker exists. The table above is the complete first-party consumer set for the new route and shared changes.

## Shared Infrastructure Impact Sweep

| High-Fan-Out Surface | Protected Behavior | Independent Canary Before Broad Tests | Rollback Unit |
|----------------------|--------------------|----------------------------------------|---------------|
| `rldata.js` | Existing cache, source, credential, request, tool-read and caller behavior | Complete selftest plus provider-credentials browser suite | Exact Scope 04 marker only |
| `rlnav.js` | Existing tool order, nav drawer, current-tool indication, Escape/focus, no duplicate id | Registry selftest plus representative existing route navigation | Exact Feature 008 entry and return-context marker only |
| `index.html` / `tools.json` / README | Existing entries/order/links/rendering and truthful inventory | Registry parity, route existence, landing navigation, stale-reference scan | Exact Feature 008 additive rows only |
| `scripts/selftest.mjs` | Every existing group/order/summary/exit and concurrent Feature 001-007 markers | Full selftest before/after exact Feature 008 marker | Exact Feature 008 group only |
| Fixture/server support | Production files unchanged, deterministic overlay, request ledger, clean shutdown | Every focused suite plus no-interception/service-worker/external-host scan | Scope-owned support/fixture blocks only |

## Change Boundary And Rollback

**Allowed new file:** `notes/portfolio-survival-allocation-lab.md`.

**Allowed edits:** final marker-bounded route/config/modules/tests/fixtures; exact additive Feature 008 blocks/entries in `scripts/selftest.mjs`, `rlnav.js`, `tools.json`, `index.html`, and README.

**Explicitly excluded:** all generic Market Brief payload/snapshot/history/config/HTML/publisher/scheduler files; `rlbrief.js`; unrelated shared helpers; package/source-lock/workflow/Pages files; Feature 001-007 source/test/spec/report hunks; unrelated tools/tests/docs; and framework-managed files.

**Pre-edit discipline:** capture `git status --short` and `git diff --unified=0` for every allowed shared path. If an insertion overlaps user work, mark Scope 16 Blocked; do not reorder, reformat, rewrite, or relocate surrounding content.

**Rollback/restore:** remove only the exact Feature 008 registry/README/note/rlnav/selftest entries and final route blocks. Rerun registry, navigation, provider, RLDATA, fixture/server, all prior Feature 008, and Feature 001-007 canaries. Browser personal keys remain inert/local and are never silently deleted by source rollback.

## Scenario-First Red/Green Contract

Author identity, accessibility, pixel/table, deep-link, privacy, registry, stale-reference, and broad-canary assertions before integration/registration. Run every row through the tool log with `SCOPE-16` and red/green tags. RED must identify the intended route/shared/release defect; missing runner/Chrome/server, unrelated failure, or weakened assertion is invalid. Registration edits occur only after the direct unregistered route rows are green.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-16-01 | Source-lock validator | functional | SCN-008-036 | `scripts/validate-node-source-lock.mjs` | Validate the exact Playwright 1.61.1 package/lock/single-registry/integrity graph before browser evidence | `node scripts/validate-node-source-lock.mjs` | No | `report.md#tp-16-01` |
| TP-16-02 | Complete production/selftest | functional | SCN-008-001 through SCN-008-036 | `scripts/selftest.mjs` | Execute every existing group plus all Feature 008 production contracts/symbols, config/note/registry/source-order/route/shared canaries, and personal-field/public-read absence | `node scripts/selftest.mjs` | No | `report.md#tp-16-02` |
| TP-16-03 | Page integrity | functional | SCN-008-036 | `portfolio-survival-allocation-lab.html` | Parse every inline script and require every literal `getElementById` target to exist | Exact `PSA-PAGE-INLINE-ID` command below | No | `report.md#tp-16-03` |
| TP-16-04 | Complete privacy functional | functional | SCN-008-005, SCN-008-011, SCN-008-012, SCN-008-035, SCN-008-036 | `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-publisher-boundary.functional.mjs` | Execute the complete sentinel, namespace, clear, publisher-input, request-shape, public-read, console/error, export and no-profile boundary | `node --test tests/portfolio-privacy.functional.mjs tests/portfolio-publisher-boundary.functional.mjs` | No | `report.md#tp-16-04` |
| TP-16-05 | Regression E2E | e2e-ui | SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity" --reporter=list` | Yes | `report.md#scenario-scn-008-036` |
| TP-16-06 | Canvas/table Regression E2E | e2e-ui | SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile" --reporter=list` | Yes | `report.md#tp-16-06` |
| TP-16-07 | Accessibility/layout Regression E2E | e2e-ui | SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom" --reporter=list` | Yes | `report.md#tp-16-07` |
| TP-16-08 | Atomic registration Regression E2E | e2e-ui | SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 registration rlnav tools index README and note form one atomic release transaction` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 registration rlnav tools index README and note form one atomic release transaction" --reporter=list` | Yes | `report.md#tp-16-08` |
| TP-16-09 | Complete privacy Regression E2E | e2e-ui | SCN-008-005, SCN-008-011, SCN-008-012, SCN-008-035, SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs" --reporter=list` | Yes | `report.md#tp-16-09` |
| TP-16-10 | Complete Feature 008 Regression E2E | e2e-ui | SCN-008-001 through SCN-008-036 | Seven design-owned Feature 008 Playwright files | Execute every exact Feature 008 Regression title over real fixture-overlay HTTP servers with no request interception | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-16-10` |
| TP-16-11 | Existing shared-consumer Regression E2E | e2e-ui | SCN-008-036 | Existing Feature 001-007/shared browser suites | Preserve provider credentials, Causal, Bond, FX, Palm Springs, Trend Dynamics, and Technical Analysis behavior after RLDATA/rlnav/registry/selftest additions | `npx --no-install playwright test tests/provider-credentials.spec.mjs tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-16-11` |

### PSA-PAGE-INLINE-ID

```bash
PAGE=portfolio-survival-allocation-lab.html node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'
```

Before TP-16-05 through TP-16-11, run `npx --no-install playwright --version` and require exact output `Version 1.61.1`. Dependency provisioning uses `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts` only when the checkout-local install is absent/stale or the committed lockfile changed; Scope 16 does not edit package/source-lock files.

### Definition of Done

#### Core Delivery Items

- [ ] FR-001 through FR-150 are integrated on the actual route with one identity, exact provenance/authority, complete unavailable/error/partial states, no public/private leakage, no hidden defaults, no execution, no advice, no winner, and no legal/tax verdict.
- [ ] NFR-001 through NFR-024 are satisfied across privacy, determinism, explainability, no engagement, data/temporal/atomic integrity, resilience, reproducibility, performance without an invented latency target, calibration, concurrency, accessibility, chart parity, responsive stable layout, precision/source honesty, security, static portability, failure isolation, educational boundary, auditability, and verified deletion.
- [ ] SCN-008-036 proves one WorkspaceIdentity and conclusion across all six tabs, Simple/Power, sibling/owner deep links, desktop/mobile/zoom, background canvases, tables, focus and public/local boundaries.
- [ ] Consumer Impact Sweep finds zero stale/duplicate/mismatched first-party references across `rldata.js`, `rlnav.js`, `index.html`, `tools.json`, README, note, hashes, tests and manifests.
- [ ] Shared Infrastructure Impact Sweep, independent canaries, path ownership, marker-bounded edits, exact rollback, and zero excluded/Feature 001-007 collateral changes are proven before broad suites.
- [ ] Atomic release adds the route to `index.html`, `tools.json`, `rlnav.js`, README and the note only after the direct unregistered route, privacy, accessibility, canvas/table and focused domain tests are green.
- [ ] Every Scope 16 behavior has intended RED and same-command GREEN evidence before the complete Feature 008 and existing-consumer browser matrices.

#### Test Evidence Items - Exact Parity With 11 Test Plan Rows

- [ ] TP-16-01 functional evidence proves the committed Node/Playwright source-lock graph is exact and trusted before browser execution.
- [ ] TP-16-02 selftest evidence proves all Feature 008 production/registry/shared contracts and every existing repository invariant.
- [ ] TP-16-03 functional evidence proves complete route inline-script syntax and literal ID integrity.
- [ ] TP-16-04 functional evidence proves the complete local storage/clear/publisher/request/public-read/console/export/no-profile privacy boundary.
- [ ] TP-16-05 Regression E2E evidence proves SCN-008-036 preserves one identity/conclusion and focus across Simple/Power/tabs/owner return/mobile.
- [ ] TP-16-06 canvas/table E2E evidence proves every analytical visual is synchronous, nonblank, accessible, and table-equivalent at desktop/mobile.
- [ ] TP-16-07 accessibility/layout E2E evidence proves keyboard/touch/focus/non-color/reduced-motion/zoom/text-spacing/44px behavior and zero overlap/overflow/clipping.
- [ ] TP-16-08 atomic registration E2E evidence proves index/tools/rlnav/README/note parity and working direct/navigation routes.
- [ ] TP-16-09 complete privacy E2E evidence proves personal sentinels stay absent from route requests/URLs/referrers/console/public reads/files/publisher inputs and clear proof remains exact.
- [ ] TP-16-10 complete Feature 008 E2E evidence proves every exact SCN-008-001 through SCN-008-036 Regression title passes without interception or external providers.
- [ ] TP-16-11 existing-consumer E2E evidence proves provider credentials and every named Feature 001-007/shared route remain green after high-fan-out changes.

#### Build Quality Gate

- [ ] Complete RED/GREEN ledger, Consumer/Shared Impact Sweeps, route/config/note/registry/source-order parity, privacy/request/publication/clear scans, canvas pixel/table/mobile/zoom/keyboard/focus/no-overlap checks, no-interception/service-worker/external-host scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD sync, scenario-manifest integrity, traceability, implementation reality, framework write guard, repository readiness, and changed-path classification are current and clean with every finding individually accounted for in `report.md`.
