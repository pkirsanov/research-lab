# Scope 09: Accessible Simple And Detailed Research Workspace

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `ui:true`, `accessibility:true`, `responsive:true`

**Depends On:** Scope 08 - Accepted Browser State And Proposal Decisions

**Primary Outcome:** The complete persistent shell, Simple cockpit, and six Detailed workspaces project one accepted company/evidence/model state, remain keyboard and assistive-technology operable at 320/768/1440 widths, and provide synchronous nonblank chart/table parity without view-triggered fetch or recomputation.

## Requirement Coverage

- **Functional:** FR-010-088 through FR-010-092.
- **Non-functional:** NFR-010-001 through NFR-010-008.
- **Primary scenarios:** SCN-010-015 and SCN-010-032.

## Gherkin Scenarios

### SCN-010-015 - Simple Detailed Parity

```gherkin
Scenario: Display mode changes presentation only
  Given one CompanyAcceptedState/v1 has a fixed publication, scenario, brief, coverage, and market observation
  When the user switches Simple to Detailed and across all six tabs
  Then no company publication request is initiated by the mode/tab actions
  And every shared value, classification, cutoff, conflict, proposal, and limitation matches the Simple selector
```

### SCN-010-032 - Accessible Narrow Workspace

```gherkin
Scenario: A keyboard user completes the research flow at 320 CSS pixels
  Given the real page loads a source-qualified company publication in system Chrome at 320 CSS pixels
  When the user selects a company, switches modes/tabs, edits a draft, reviews a proposal, and traces a claim using the keyboard
  Then focus order, names, roles, selected states, error descriptions, live summaries, and focus return are correct
  And chart-equivalent tables expose the same values and the document body has no horizontal overflow or color-only state
```

## UI Scenario Matrix

| Journey | Viewports / inputs | Exact user-visible assertions | Test Type |
| --- | --- | --- | --- |
| SCN-010-015 one-state parity | 1440x1000 and 390x844; Simple plus all six Detailed tabs | Same publication/generation/company/scenario/brief/market IDs, values, classes, cutoffs, conflicts, proposals, limitations; zero mode/tab network activity | e2e-ui |
| SCN-010-032 keyboard journey | 320 CSS pixels, keyboard only, source-qualified publication | Combobox, mode/tablists, draft/proposal/trace flow, focus return, names/roles/states/errors/live summaries all correct | e2e-ui |
| Chart/table/layout parity | 1440, 768, 320 widths; 200% zoom; 130% text; reduced motion | Visible canvases draw synchronously/nonblank; adjacent table has identical values; no body overflow/overlap/clipping/color-only state | e2e-ui |
| Scoped degradation | complete/partial/stale/conflicted/unclassified/blocking states | Truth strip retains five clocks/states; valid bands remain; only dependent outputs are unavailable | e2e-ui |

## Implementation Plan

1. Complete the persistent company selector, visible `Simple`/`Detailed` tablist, action bar, five-row truth strip, scoped degradation banner, and one polite live region over accepted-state selectors.
2. Complete Simple bands in the UX-specified order: adaptive brief, direction/drivers, resilience, material changes, active scenario, proposals, catalysts/risks/watch. No nested cards, composite score, marketing hero, or feature-explainer prose.
3. Complete six sibling Detailed tabs: Statements, Resilience, Model, Brief, Sources, and Peers. Each renderer consumes selectors only; mode/tab/focus changes cause no source fetch or alternate computation.
4. Implement bounded company/mode/tab/ref query parsing and same-company deep-link focus/return. Query values never carry facts, assumptions, credentials, source URLs, or code.
5. Implement the ARIA combobox/listbox, tablist semantics, Home/End/Arrow/Enter/Space behavior, visible focus, scoped alert/status behavior, concise recomputation/hydration announcements, and source/proposal focus return.
6. Implement stable responsive dimensions, wrapping, contained table/tab scrollers, no body-level horizontal overflow, 44px controls, non-color state/symbol text, and table-first mobile composition.
7. Draw canvases synchronously only when their Detailed tab is visible/measurable; use debounced resize only. Every chart has ARIA label/fallback text, nonblank pixel proof, keyboard/touch hit testing, and an equivalent table/summary from the same selector.
8. Add the exact inline-script/DOM-ID integrity command from design and sanitized `RLCompanyDiagnostics` assertions for request/generation/hash/cutoff/scenario/mode/tab/coverage identity.

## Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| Shared `rlg.js`, `rlchart.js`, `rlticker.js`, `rlnav.js` consumers | Existing globals, canvas hit testing, ticker links, navigation behavior | Load representative existing tools before/after; Scope 09 consumes without modifying shared files | Scope-owned page integration only |
| `scripts/selftest.mjs` | Existing group count/order/summary | Baseline and complete selftest before/after exact Feature 010 UI contract group | Exact Feature 010 marker only |
| Playwright static server/runtime | Existing test isolation and shutdown | Existing representative browser suite plus no-interception scan | Scope-owned test entries only |

## Change Boundary And Rollback

**Allowed:** `company-fundamentals-lab.html`, page-local styles/controller/renderers, exact Feature 010 selftest group, route tests, and scope-owned support.

**Excluded:** edits to shared UI/data scripts, registry/navigation inventories, Market Brief, source/provider policies, package/lock/source registry files, unrelated tools/tests, and framework-managed files.

**Rollback:** reverse the Scope 09 page-local UI and exact selftest/test hunks. Earlier foundation route behavior remains available; public objects/local scenario data are not rewritten or deleted.

## Scenario-First Red/Green Contract

Author mode/tab network-ledger, shared-value identity, keyboard/focus, ARIA, pixel/table, overflow/overlap, zoom/text/reduced-motion, and degradation assertions first. Hidden canvases are activated before pixel checks; tests use the real static server and no request interception.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-09-01 | Complete production selftest | functional | SCN-010-015, SCN-010-032 | `scripts/selftest.mjs` | Existing checks plus Feature 010 selector/DOM/registry-independent UI contracts and shared consumer canaries | `node scripts/selftest.mjs` | No |
| TP-09-02 | Page integrity | functional | SCN-010-015, SCN-010-032 | `company-fundamentals-lab.html` | Parse every inline script and require every literal `getElementById` target to exist using the exact design command | `PAGE=company-fundamentals-lab.html node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'` | No |
| TP-09-03 | Regression E2E | e2e-ui | SCN-010-015 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-015 Simple Detailed and six tabs share one state without refetch or reinterpretation` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-015 Simple Detailed and six tabs share one state without refetch or reinterpretation" --reporter=list` | Yes |
| TP-09-04 | Regression E2E | e2e-ui | SCN-010-032 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-032 keyboard research flow is accessible at 320 pixels without body overflow` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-032 keyboard research flow is accessible at 320 pixels without body overflow" --reporter=list` | Yes |
| TP-09-05 | Canvas/table Regression E2E | e2e-ui | SCN-010-032 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-032 every visible canvas is synchronous nonblank and equivalent to its accessible table` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-032 every visible canvas is synchronous nonblank and equivalent to its accessible table" --reporter=list` | Yes |
| TP-09-06 | Broader Regression E2E | e2e-ui | SCN-010-015, SCN-010-032 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 09 at desktop, tablet, mobile, zoom, and reduced motion | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-088 through FR-010-092 and NFR-010-001 through NFR-010-008 are implemented across the persistent shell, Simple, six Detailed workspaces, and scoped degradation states.
- [ ] SCN-010-015 and SCN-010-032 prove one-state parity, zero view-triggered requests, complete keyboard/focus/ARIA behavior, chart/table equivalence, and responsive stability.
- [ ] Shared Infrastructure Impact Sweep proves existing shared UI/data/navigation consumers remain green without shared-file mutation.
- [ ] Change Boundary is respected and zero excluded file families are changed.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 09 behavior.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-09-01 selftest evidence proves production selectors/UI contracts and preserves every existing repository check.
- [ ] TP-09-02 functional evidence proves inline-script syntax and literal DOM-ID integrity.
- [ ] TP-09-03 Regression E2E evidence proves SCN-010-015.
- [ ] TP-09-04 Regression E2E evidence proves SCN-010-032 keyboard/responsive behavior.
- [ ] TP-09-05 canvas/table E2E evidence proves synchronous nonblank accessible visual parity.
- [ ] TP-09-06 broader E2E evidence proves cumulative UI behavior at all required widths and accessibility settings.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, request/compute/state identity ledger, page integrity, no-interception/external-host scan, keyboard/focus/ARIA/live-region matrix, pixel/table/value parity, 320/768/1440/zoom/text/reduced-motion no-overlap checks, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, G094 capability check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
