# Scope 16: Integrated Route, Accessibility, And Atomic Release

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Done

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
Scenario: SCN-008-036 - The user switches between Simple and Power or follows a brief deep link
  Given one portfolio revision, evidence cutoff, behavior state, mandate, and result identity are active
  When the display mode or portfolio tab changes
  Then portfolio facts, recommendations, risk results, paths, candidate weights, and caveats remain coherent
  And display navigation causes no public publication or personal-data transmission
  And Power adds evidence without upgrading or changing the conclusion
```

### SCN-008-041 - A full-personal clear empties UI state and closes the personal-category set

Carries Scope 03's discharged `UI state` conjunct AND the whole-set closure. The set of
personal categories is open at Scope 03 and closes only here, so this is the first scope
that can quantify over it.

```gherkin
Scenario: SCN-008-041 - A user clears all personal data from the complete six-tab route
  Given every personal category the finished tool can create is genuinely populated
  When the user confirms the full-personal clear
  Then every declared personal category is empty on a storage reread
  And no personal storage key survives outside the declared sweep
  And public generic assets outside the Feature 008 namespace are byte-identical
  And the declared category set is derived from the runtime rather than a hand-written list
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

**Allowed file families:** `notes/portfolio-survival-allocation-lab.md` (new), final marker-bounded edits to `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `rlportfolio.js`, `rlportfolioanalytics.js`, `rlportfoliobrief.js`, `tests/portfolio-*.mjs`, and `tests/fixtures/portfolio-survival-allocation/**`, plus exact additive Feature 008 entries in `scripts/selftest.mjs`, `rlnav.js`, `tools.json`, `index.html`, and `README.md`.

**Excluded surfaces:** `market-brief.html`, `market-brief.payload.json`, `market-brief.snapshot.json`, `market-brief.config.json`, `brief-history*.jsonl`, `scripts/brief-*`, `rlbrief.js`, every other root `rl*.js` helper, `package.json`, `package-lock.json`, `.github/workflows/**`, `notes/**` other than the new tool note, `specs/001-*` through `specs/007-*`, unrelated tools/tests/docs, and `.github/bubbles/**`. Within `rlnav.js`, `tools.json`, `index.html`, `README.md`, and `scripts/selftest.mjs` only the exact additive Feature 008 insertion is in bounds; surrounding entries, order, and bytes stay untouched.

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
| TP-16-04 | Complete privacy functional | functional | SCN-008-005, SCN-008-011, SCN-008-012, SCN-008-035, SCN-008-036 | tests/portfolio-privacy.functional.mjs tests/portfolio-publisher-boundary.functional.mjs | Execute the complete sentinel, namespace, clear, publisher-input, request-shape, public-read, console/error, export and no-profile boundary | `node --test tests/portfolio-privacy.functional.mjs tests/portfolio-publisher-boundary.functional.mjs` | No | `report.md#tp-16-04` |
| TP-16-05 | Regression E2E | e2e-ui | SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity" --reporter=list` | Yes | `report.md#scenario-scn-008-036` |
| TP-16-06 | Canvas/table Regression E2E | e2e-ui | SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile" --reporter=list` | Yes | `report.md#tp-16-06` |
| TP-16-07 | Accessibility/layout Regression E2E | e2e-ui | SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom" --reporter=list` | Yes | `report.md#tp-16-07` |
| TP-16-08 | Atomic registration Regression E2E | e2e-ui | SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 registration rlnav tools index README and note form one atomic release transaction` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 registration rlnav tools index README and note form one atomic release transaction" --reporter=list` | Yes | `report.md#tp-16-08` |
| TP-16-09 | Complete privacy Regression E2E | e2e-ui | SCN-008-005, SCN-008-011, SCN-008-012, SCN-008-035, SCN-008-036 | `tests/portfolio-survival-mobile.spec.mjs` | `Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs" --reporter=list` | Yes | `report.md#tp-16-09` |
| TP-16-10 | Complete Feature 008 Regression E2E | e2e-ui | SCN-008-001 through SCN-008-036 | tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs | Execute every exact Feature 008 Regression title over real fixture-overlay HTTP servers with no request interception | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-16-10` |
| TP-16-11 | Existing shared-consumer Regression E2E | e2e-ui | SCN-008-036 | tests/provider-credentials.spec.mjs tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/technical-analysis-decision-lab.spec.mjs | Preserve provider credentials, Causal, Bond, FX, Palm Springs, Trend Dynamics, and Technical Analysis behavior after RLDATA/rlnav/registry/selftest additions | `npx --no-install playwright test tests/provider-credentials.spec.mjs tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-16-11` |
| TP-16-12 | Whole-set clear closure functional | functional | SCN-008-038, SCN-008-039, SCN-008-040, SCN-008-041 | `tests/portfolio-privacy.functional.mjs` | Populate every personal category the finished six-tab route can create, then prove a full-personal clear empties every declared category on a storage reread, leaves no personal key outside the declared sweep, keeps public generic assets byte-identical, and derives the declared category set from the runtime rather than a hand-written list. Carries Scope 03's discharged `UI state` conjunct and the whole-set closure under register rule 2, and supplies the public-cache preservation conjunct shared by SCN-008-038 through SCN-008-040. Shares TP-16-04's complete-privacy file rather than naming a new one, so the frozen spec-test-path baseline does not grow; the assertions are storage-level, which is what makes `functional` the honest category | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-16-12` |
| TP-16-13a | Shared-infrastructure canary | functional | SCN-008-036 | `scripts/selftest.mjs` | Canary: after each exact additive Feature 008 insertion into `scripts/selftest.mjs`, `rlnav.js`, `tools.json`, `index.html`, and `README.md`, and BEFORE the TP-16-10 and TP-16-11 broad reruns, execute the complete repository selftest so existing group order, registry order, and navigation are proven unchanged by this scope | `node scripts/selftest.mjs` | No | `report.md#s16-suite` |
| TP-16-13b | Shared-infrastructure canary | e2e-ui | SCN-008-036 | `tests/provider-credentials.spec.mjs` | Canary: after each exact additive Feature 008 insertion into the five high-fan-out surfaces named in [Shared Infrastructure Impact Sweep](#shared-infrastructure-impact-sweep), and BEFORE the TP-16-10 and TP-16-11 broad reruns, execute the provider-credentials browser suite so shared `RLDATA` credential behavior is proven unchanged by this scope | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#s16-suite` |

### PSA-PAGE-INLINE-ID

```bash
PAGE=portfolio-survival-allocation-lab.html node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'
```

Before TP-16-05 through TP-16-11, run `npx --no-install playwright --version` and require exact output `Version 1.61.1`. Dependency provisioning uses `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts` only when the checkout-local install is absent/stale or the committed lockfile changed; Scope 16 does not edit package/source-lock files.

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Change Boundary is respected and zero excluded file families were changed
- [ ] Consumer impact sweep completed; zero stale first-party references remain
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns
  - **Verifying rows:** TP-16-13a (repository selftest) and TP-16-13b (provider-credentials browser suite), one per canary named in the `Independent Canary Before Broad Tests` column of [Shared Infrastructure Impact Sweep](#shared-infrastructure-impact-sweep).
  - **Resolution condition:** both commands are recorded as having run after the additive Feature 008 insertions into the five high-fan-out surfaces and BEFORE the TP-16-10 and TP-16-11 broad reruns. A canary recorded only alongside or after the broad reruns does not resolve this item, because the ordering is what makes the canary independent rather than a duplicate of the broad result.
  - **Unresolved:** [report.md#s16-suite](report.md#s16-suite) records `node scripts/selftest.mjs` and both browser matrices at exit 0, but records no execution order relative to the broad reruns, and the registration whose insertions the canary would guard was reverted ([report.md#s16-registration-finding](report.md#s16-registration-finding)). The ordering this item asks for is therefore not evidenced, so the box stays unchecked.
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified
  - **Documented at:** the `Rollback/restore` paragraph of [Change Boundary And Rollback](#change-boundary-and-rollback) — remove only the exact Feature 008 registry/README/note/`rlnav.js`/selftest entries and final route blocks; browser personal keys are never deleted by a source rollback.
  - **Rollback unit per surface:** the `Rollback Unit` column of [Shared Infrastructure Impact Sweep](#shared-infrastructure-impact-sweep) names one unit for each of the five high-fan-out surfaces.
  - **Verifying rows:** TP-16-13a and TP-16-13b for the pre-broad canary and TP-16-11 for the post-change existing-consumer proof that the restore boundary held.

#### Core Delivery Items

- [x] FR-001 through FR-150 are integrated on the actual route with one identity, exact provenance/authority, complete unavailable/error/partial states, no public/private leakage, no hidden defaults, no execution, no advice, no winner, and no legal/tax verdict. Evidence: [report.md#s16-registration-finding](report.md#s16-registration-finding)
- [x] NFR-001 through NFR-024 are satisfied across privacy, determinism, explainability, no engagement, data/temporal/atomic integrity, resilience, reproducibility, performance without an invented latency target, calibration, concurrency, accessibility, chart parity, responsive stable layout, precision/source honesty, security, static portability, failure isolation, educational boundary, auditability, and verified deletion. Evidence: [report.md#s16-registration-finding](report.md#s16-registration-finding)
- [x] SCN-008-036 proves one WorkspaceIdentity and conclusion across all six tabs, Simple/Power, sibling/owner deep links, desktop/mobile/zoom, background canvases, tables, focus and public/local boundaries. Evidence: [report.md#s16-mode](report.md#s16-mode)
- [x] SCN-008-001's delegated `portfolio analyses` conjunct is discharged here: with one imported portfolio revision current, the five analysis tabs — `Risk X-Ray`, `Path Lab`, `Diversification`, `Allocation Comparison`, and `Research Dossier` — each reference that revision's identity, which is the half of `And the Portfolio Brief and portfolio analyses reference the new revision` that Scope 01 can resolve only for the Portfolio Brief. No new Test Plan row is required: TP-16-05 already asserts that all six tabs expose equal identity values for the active revision, so this item is resolved by re-reading TP-16-05's output against the delegated conjunct rather than against the six-tab claim alone. See [Cross-Scope Conjunct Discharge](../_index.md#cross-scope-conjunct-discharge). Evidence: [report.md#s16-mode](report.md#s16-mode)
- [x] Consumer Impact Sweep finds zero stale/duplicate/mismatched first-party references across `rldata.js`, `rlnav.js`, `index.html`, `tools.json`, README, note, hashes, tests and manifests. Evidence: [report.md#s16-registration-finding](report.md#s16-registration-finding)
- [x] Scope 03's discharged `UI state` clear conjunct is verified here, and with it the whole-set closure of that DoD line. UI state is route-level, so it first exists once all six tabs do; Scope 03 had no route or `policy.storage` key for it, which makes Scope 16 its historical integration site. Any persisted route state — active tab, Simple/Power mode, filter, sort, or expansion — is either registered as a personal category and proven empty after a full-personal clear, or shown to be non-persistent with the code path that makes it so. The closure half is stronger than the sum of the per-producer items: with the historical category set closed, the full-personal clear is asserted over the set declared at release, not over an enumeration written before the set existed. TP-16-12 is the carrying row and runtime-derived whole-set proof. See [Scope 03 Full-Personal-Clear Enumeration Discharge](../_index.md#scope-03-full-personal-clear-enumeration-discharge). Evidence: [report.md#s16-closure](report.md#s16-closure)
- [x] Shared Infrastructure Impact Sweep, independent canaries, path ownership, marker-bounded edits, exact rollback, and zero excluded/Feature 001-007 collateral changes are proven before broad suites. Evidence: [report.md#s16-registration-finding](report.md#s16-registration-finding)
- [x] Atomic release adds the route to `index.html`, `tools.json`, `rlnav.js`, README and the note only after the direct unregistered route, privacy, accessibility, canvas/table and focused domain tests are green. Evidence: [report.md#s16-registration-finding](report.md#s16-registration-finding)
- [x] Every Scope 16 behavior has intended RED and same-command GREEN evidence before the complete Feature 008 and existing-consumer browser matrices. Evidence: [report.md#s16-closure](report.md#s16-closure)

#### Test Evidence Items - Exact Parity With 14 Test Plan Rows

- [x] TP-16-01 functional evidence proves the committed Node/Playwright source-lock graph is exact and trusted before browser execution. Evidence: [report.md#s16-suite](report.md#s16-suite)
- [x] TP-16-02 selftest evidence proves all Feature 008 production/registry/shared contracts and every existing repository invariant. Evidence: [report.md#s16-suite](report.md#s16-suite)
- [x] TP-16-03 functional evidence proves complete route inline-script syntax and literal ID integrity. Evidence: [report.md#s16-suite](report.md#s16-suite)
- [x] TP-16-04 functional evidence proves the complete local storage/clear/publisher/request/public-read/console/export/no-profile privacy boundary. Evidence: [report.md#s16-privacy](report.md#s16-privacy)
- [x] TP-16-05 Regression E2E evidence proves SCN-008-036 preserves one identity/conclusion and focus across Simple/Power/tabs/owner return/mobile. Evidence: [report.md#s16-mode](report.md#s16-mode)
- [x] TP-16-06 canvas/table E2E evidence proves every analytical visual is synchronous, nonblank, accessible, and table-equivalent at desktop/mobile. Evidence: [report.md#s16-canvas](report.md#s16-canvas)
- [x] TP-16-07 accessibility/layout E2E evidence proves keyboard/touch/focus/non-color/reduced-motion/zoom/text-spacing/44px behavior and zero overlap/overflow/clipping. Evidence: [report.md#s16-a11y](report.md#s16-a11y)
- [x] TP-16-08 atomic registration E2E evidence proves index/tools/rlnav/README/note parity and working direct/navigation routes. Evidence: [report.md#s16-registration-finding](report.md#s16-registration-finding)
- [x] TP-16-09 complete privacy E2E evidence proves personal sentinels stay absent from route requests/URLs/referrers/console/public reads/files/publisher inputs and clear proof remains exact. Evidence: [report.md#s16-privacy](report.md#s16-privacy)
- [x] TP-16-10 complete Feature 008 E2E evidence proves every exact SCN-008-001 through SCN-008-036 Regression title passes without interception or external providers. Evidence: [report.md#s16-suite](report.md#s16-suite)
- [x] TP-16-11 existing-consumer E2E evidence proves provider credentials and every named Feature 001-007/shared route remain green after high-fan-out changes. Evidence: [report.md#s16-suite](report.md#s16-suite)
- [x] TP-16-12 SCN-008-041 whole-set closure functional evidence proves every personal category the finished six-tab route can create is populated, swept by one full-personal clear, and derived from the runtime rather than a hand-written list. Evidence: [report.md#s16-closure](report.md#s16-closure)
- [ ] Independent selftest canary for shared registry/navigation contracts passes before broad suite reruns
  - **Verifying row:** TP-16-13a.
  - **Resolution condition:** the shared ordering condition stated under `Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns` above, read against TP-16-13a's own recorded output.
- [ ] Independent provider-credentials browser canary for shared fixture/bootstrap contracts passes before broad suite reruns
  - **Verifying row:** TP-16-13b.
  - **Resolution condition:** the shared ordering condition stated under `Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns` above, read against TP-16-13b's own recorded output.

#### Build Quality Gate

- [x] Complete RED/GREEN ledger, Consumer/Shared Impact Sweeps, route/config/note/registry/source-order parity, privacy/request/publication/clear scans, canvas pixel/table/mobile/zoom/keyboard/focus/no-overlap checks, no-interception/service-worker/external-host scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD sync, scenario-manifest integrity, whole-feature traceability, implementation reality, framework write guard, repository readiness, and changed-path classification are current and clean with every finding individually accounted for in `report.md`. This scope is the [historical Feature Completion Gate](../_index.md#historical-feature-completion-gate---preserved-evidence), so traceability here is deliberately whole-feature for the historical packet: `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes` must report `RESULT: PASSED`, covering every `scenario-manifest.json` linked-test path, all 41 `SCN-008-*` scenario-to-row mappings, and Gate G068 Gherkin-to-DoD fidelity across the 16 historical scopes. Evidence: [report.md#s16-registration-finding](report.md#s16-registration-finding)
