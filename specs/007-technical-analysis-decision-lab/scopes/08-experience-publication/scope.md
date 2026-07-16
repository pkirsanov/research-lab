# Scope 08: Complete Experience Publication And Registration

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `ui:true`, `publisher:true`, `consumer-integration:true`, `shared-infrastructure:true`

**Depends On:** Scope 01 - Capability Foundation And Shared Contracts; Scope 02 - Technique Engine And Evidence Independence; Scope 03 - Level Geometry And Setup Lifecycle; Scope 04 - Five-Gate Synthesis And Candidate Selection; Scope 05 - Existing-Owner Publication And Strict Adapters; Scope 06 - Comparison And Optional Evidence; Scope 07 - Validation Cost Expectancy And Process

**Primary Outcome:** One complete immutable result drives the entire Simple, Power, mobile, accessible-table, export, deep-link, and owner-read experience; invalid edits, truth degradation, display changes, background tabs, and route registration cannot create a second conclusion, refetch loaded observations, leak sensitive state, or publish partial work.

## Gherkin Scenarios

### SCN-007-023 / BS-023 - Simple and Power cannot disagree

```gherkin
Scenario: Both modes project one immutable result
  Given a UnifiedRead has resolved for one stock and parameter identity
  When the user switches between Simple and Power
  Then direction, gate outcomes, setup state, trigger, invalidation, validation state, comparisons, and caveats remain identical
  And changing display mode causes no refetch or private recomputation
```

### SCN-007-029 / BS-029 - Invalid configuration preserves the last valid read

```gherkin
Scenario: A parameter combination violates a governed bound
  Given one current UnifiedRead exists for a valid configuration
  When the user enters an incompatible interval, threshold, or target rule
  Then the new configuration is rejected with observed, required, and corrective action
  And the last valid read remains visibly identified as the last valid result rather than recomputed under a fallback
  And correcting the input recomputes the requested identity without a source refetch
```

## Exact Pure Symbol Ownership

Scope 08 implements the final three exact page-local declarations: `tadBuildViewModel`, `tadBuildToolDecisionRead`, and `tadBuildExport`. Together with Scopes 01-07, this completes all 65 exact `tad*` declarations from `design.md`; Scope 01 separately implements the seven exact shared `RLVALID` declarations.

## UI Scenario Matrix

| Journey / state | Viewports and input | Required user-visible assertions | Persistent browser proof |
| --- | --- | --- | --- |
| Automatic cache-first first paint | 1440x1000 and 390x844; current, stale, daily-only, no usable cache | Shell/status first, cached result before delta, exact clocks/coverage, no zero/neutral substitute | SCN-007-023 plus truth-state matrix title |
| Simple five-gate decision | Desktop/mobile; keyboard and touch | Direction, regime, setup, five gates, trigger/invalidation/targets, gross/net R, support, contradiction, unavailable evidence, change condition | Complete Feature 007 suite |
| Evidence heatmap and level map | Desktop/mobile; arrows/Home/End/Enter/Escape/tap | Text/symbol state, row/column context, source/timeframe/lifecycle, accessible table, no color-only or depth-book label | Accessibility/background-canvas title |
| Specialist/candidate inspection | Desktop/mobile; disclosures and Power deep links | All nine specialists, selected/non-selected candidates, exact focus retention, same identity | SCN-007-023 |
| Power synchronized charts and audit | Visible and initially hidden/background tab | Primary/setup/trigger roles, synchronous nonblank pixels, cursor/table parity, source/vintage, formulas, validation, claims | Accessibility/background-canvas title |
| Invalid edit and recovery | Interval, threshold, target, comparison, cost errors | `aria-invalid`, observed/required/correction, last valid identity, zero refetch, corrected recompute | SCN-007-029 and truth-state matrix title |
| Truth-state recovery | loading, cached-refreshing, current, stale, degraded, unavailable, invalid, recomputing, failed, revised | Exact state word plus observed/required/action; prior truth aged, never upgraded; one polite announcement | Truth-state matrix title |
| Safe publication and export | Current/stale/degraded/unavailable/provisional/descriptive result; hostile labels | One strict read/deep link, omissions rather than substitutes, literal text, sanitized public ids, educational boundary | Publication/safe-text title |
| Registration and credentials | Index/shared navigation/data settings | Exact route/config/note order parity, no credential input, central settings link only | Registry/publication title and provider suite |

## Implementation Plan

1. Build one presentation-safe `TadViewModelV1` from a frozen `TadUnifiedReadV1`. It contains semantic text, definitions, tables, chart models, control state, source/vintage lines, contextual explanations, and exact result identity but no calculation callback.
2. Implement the shared shell, `#modeSeg`, context rail, Data Truth Band, configuration-impact banner, Unified Verdict, five-gate rail, lifecycle, plan strip, evidence heatmap, confluence map, comparisons, all nine specialist rows, candidate disclosure, and owner-read preview.
3. Implement Power evidence charts/family records, models/configuration/timeline, comparison/options/microstructure context, validation/expectancy/process, and source/vintage/claim/publication audit from the same view model.
4. Render text/tables/status/controls first, apply mode visibility, synchronously draw every measurable visible canvas, call `RLCHART.attach` at the end of each draw, and publish only after all visual and nonvisual renderers succeed. Hidden canvases draw directly when their mode/section becomes measurable; correctness never depends on `requestAnimationFrame`.
5. Implement keyboard/touch contracts for mode, heatmap, level map, synchronized charts, disclosures, Power index, and explanations; exact focus retention/return; concise live regions; reduced motion; non-color state; 44px targets; 130 percent text; and equivalent structured data.
6. Implement wide/tablet/mobile stable geometry, one-column Simple below 600 CSS px, contained labeled Power table scrolling, explicit chart aspect ratios, legends outside plots, no body overflow, no overlap, no clipped dynamic text, and no hover-only meaning.
7. Implement invalid-request preservation, latest-valid recompute, cancellation, method failure, delta failure, stale/degraded/unavailable/revised states, and atomic publication. Mode, sort, disclosure, cursor, focus, and overlay changes are display-only and cause neither fetch nor `tadBuildUnifiedRead`.
8. Build strict `rl-tool-read/v1` with nested `tad-tool-decision-read/v1`; preserve truth/setup/direction/validation/provisional/caveats, omit invalid numeric fields, include educational-only marker and safe deep link, and never publish an incomplete/canceled/render-failed identity.
9. Build sanitized `tad-export/v1` with complete public result/audit identity and no credentials, auth/payment state, holdings, account data, private notes, raw secret-bearing headers, or executable markup.
10. Add `notes/technical-analysis-decision-lab.md` with methods, formulas, source/owner/session boundaries, setup/gate/validation/cost semantics, controls, fixture posture, limitations, accessibility, and exact validation commands.
11. Register one exact tool entry in `tools.json`, `index.html::TOOLS`, and `rlnav.js::TOOLS` in identical order with route, config, note, tags, and shared script order. No existing entry is reordered or reformatted.
12. Extend validator/selftest/browser coverage for all 65 page symbols, config/note/registry parity, one-model identity, safe text/deep links/export, synchronous/background canvas pixels, table parity, truth states, invalid recovery, mobile/keyboard layout, owner read, and central credentials.

## Consumer Impact Sweep

| Consumer / reference surface | Required change or proof | Stale-reference assertion |
| --- | --- | --- |
| `tools.json` | One `technical-analysis-decision-lab` entry with exact route/config/note/tags/order | Registry selftest equality and route existence |
| `index.html::TOOLS` | Matching entry and landing-page navigation | Registry selftest plus real browser navigation |
| `rlnav.js::TOOLS` | Matching shared-nav entry in identical order | Registry selftest plus real browser navigation |
| Shared script order | `rldata.js`, `rlapp.js`, `rlg.js`, `rlvalidation.js`, `rlchart.js`, `rlticker.js`, inline script, `rlnav.js` | Validator and browser source-order assertion |
| `notes/technical-analysis-decision-lab.md` | Exact route/config/method/control/test handoff | Validator resolves every referenced id/path/command |
| `RLDATA.toolReads` and Market Brief | One strict state-faithful owner read; generic registry-derived coverage only | Selftest/browser read identity and no duplicated Feature 007 formula or upgraded truth |
| Deep links/export | Allowlisted public ids/numbers/focus only | Safe-text/export unit and browser assertions |
| Tests/fixtures/planning manifests | Exact scenario ids/titles/files/evidence refs | Plan sync and traceability guard |

No API client, generated client, server route, redirect, or breadcrumb framework exists. The listed surfaces are the complete first-party consumer set for the new route.

## Shared Infrastructure Impact Sweep

| High-fan-out surface | Protected behavior | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `tools.json` | Existing ids, order, routes, data paths, tags | Full selftest registry parity and route-existence checks | Exact Feature 007 object only |
| `index.html` | Existing registry array, landing page, central data settings, safe rendering | Registry parity plus provider-credentials suite and real navigation | Exact Feature 007 entry only |
| `rlnav.js` | Existing order, shared navigation behavior, no duplicate id | Registry parity plus route navigation | Exact Feature 007 entry only |
| `scripts/selftest.mjs` | Every existing group, Feature 005/006 markers, totals/exit | Full selftest before browser matrix | Scope 08 sub-marker only |
| Feature page/note/publication | All Scope 01-07 contracts/results and owner truth | Complete focused/cumulative Feature 007 suite before broad existing suites | Scope 08 page/note/test blocks |

## Change Boundary And Rollback

**Allowed new file:** `notes/technical-analysis-decision-lab.md`.

**Allowed edits:** Feature 007 page/config/validator/selftest/browser fixtures; exact additive Feature 007 entries in `tools.json`, `index.html`, and `rlnav.js`.

**Marker-bounded page edit:** Scope 08 rendering/publication lives between `/* ---------- Feature 007 Scope 08: experience and publication ---------- */` and its matching end marker. Selftest additions use the matching sub-marker.

**Explicitly excluded:** owner pages/publishers, `rldata.js`, `rlvalidation.js`, Strategy Validation, other shared runtime helpers, Market Brief payload/config/calculations, README indexes not named by design, package/workflow files, Feature 005/006 paths, and unrelated tests.

**Pre-edit discipline:** capture path-scoped status/diff and insertion context for all three registries and `scripts/selftest.mjs`. Any overlap with an unowned hunk blocks that insertion; no broad rewrite/reorder/reformat is permitted.

**Rollback/restore:** remove the three exact registry entries, note, Scope 08 page/test/config/validator/selftest hunks, and no other byte. Rerun registry/provider/owner canaries and every prior Feature 007 focused row. The unregistered route may remain as a complete direct URL only during the rollback verification window; no registry points at an incomplete route.

## Scenario-First TDD Contract

Write each unit/validator/page/browser assertion before its renderer, registration, or publication behavior. Capture intended RED and identical-command GREEN. Every visible behavior has a literal `Regression:` title, including accessibility, background canvas, truth recovery, safe text, and registry publication.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-08-01 | Unit | unit | SCN-007-023, 029 | `scripts/selftest.mjs` | Execute view-model/tool-read/export builders; prove all 65 page symbols exist once, one-result identity, display-only exclusions, truth precedence, omission, safe text/deep links/export, registry parity, and unchanged shared reads | `node scripts/selftest.mjs` | No | `report.md#tp-08-01` |
| TP-08-02 | Contract validator | functional | SCN-007-023, 029 | `scripts/validate-technical-analysis-decision.mjs` | Validate complete page/config/note/registry/scripts/symbols/owner/export/fixture references and config/universe JSON parse/parity | `node scripts/validate-technical-analysis-decision.mjs` | No | `report.md#tp-08-02` |
| TP-08-03 | Page integrity | functional | SCN-007-023 | `technical-analysis-decision-lab.html` | Parse every inline script and require every literal `getElementById` target to exist | Exact `TAD-PAGE-INLINE-ID` command from Scope 01 | No | `report.md#tp-08-03` |
| TP-08-04 | Regression E2E | e2e-ui | SCN-007-023 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-023 Simple and Power preserve one result with zero display-mode requests` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-023 Simple and Power preserve one result with zero display-mode requests" --reporter=list` | Yes | `report.md#scenario-scn-007-023` |
| TP-08-05 | Regression E2E | e2e-ui | SCN-007-029 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-029 invalid configuration preserves last valid identity and corrects without refetch` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-029 invalid configuration preserves last valid identity and corrects without refetch" --reporter=list` | Yes | `report.md#scenario-scn-007-029` |
| TP-08-06 | Accessibility/canvas Regression E2E | e2e-ui | SCN-007-023 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-023 mobile keyboard tables and background-tab canvases remain equivalent` asserts 1440x1000 and 390x844, 130 percent text, no overlap/overflow, focus/touch/non-color states, synchronous nonblank pixels, and table parity | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-023 mobile keyboard tables and background-tab canvases remain equivalent" --reporter=list` | Yes | `report.md#tp-08-06` |
| TP-08-07 | Truth-state Regression E2E | e2e-ui | SCN-007-029 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-029 truth recovery preserves last valid identity across source and method failures` asserts loading/current/stale/degraded/unavailable/invalid/recomputing/failed/revised observed-required-action semantics | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-029 truth recovery preserves last valid identity across source and method failures" --reporter=list` | Yes | `report.md#tp-08-07` |
| TP-08-08 | Registry/publication Regression E2E | e2e-ui | SCN-007-023 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-023 registration navigation and state-faithful owner publication stay in parity` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-023 registration navigation and state-faithful owner publication stay in parity" --reporter=list` | Yes | `report.md#tp-08-08` |
| TP-08-09 | Safe-text/export Regression E2E | e2e-ui | SCN-007-023 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-023 imported labels stay text and sanitized export omits sensitive state` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-023 imported labels stay text and sanitized export omits sensitive state" --reporter=list` | Yes | `report.md#tp-08-09` |
| TP-08-10 | Credential boundary canary | e2e-ui | SCN-007-023 | `tests/provider-credentials.spec.mjs` | Existing central settings and credential ownership remains green with the registered Feature 007 route | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-08-10` |
| TP-08-11 | Broader Regression E2E | e2e-ui | SCN-007-023, 029 | `tests/technical-analysis-decision-lab.spec.mjs` | Execute the complete cumulative Feature 007 browser suite after every focused Scope 08 title | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-08-11` |

No stress or load row is planned because there is no numeric responsiveness SLA. TP-08-06 and TP-08-07 validate interaction availability, synchronous canvas correctness, progress/cancellation state, and atomic result preservation without inventing a timing threshold.

### Definition of Done

#### Core Delivery Items

- [ ] Every specified Simple, Power, mobile, truth-recovery, audit, chart/table, control, explanation, focus, live-region, reduced-motion, and educational/privacy surface renders from one view model and one immutable result.
- [ ] Mode/focus/sort/disclosure/cursor/overlay changes are display-only with zero fetch/private recompute; invalid or canceled requests preserve the labeled prior result and cannot publish.
- [ ] All canvases draw synchronously when measurable, remain nonblank in foreground/background-tab activation, attach pointer/touch behavior, and match accessible tables across desktop/mobile.
- [ ] ToolDecisionRead, export, deep links, imported text, source URLs, local preferences, and lifecycle storage are exact-versioned, sanitized, source/truth faithful, and free of credentials/auth/payment/account/position state.
- [ ] Route/config/note/owner identity is atomic and order-equal across all registries/navigation; Consumer Impact Sweep finds zero stale first-party references.
- [ ] Every high-fan-out registry/selftest/page change has marker/additive boundaries, independent canaries, exact rollback, and zero excluded or Feature 005/006 edits.
- [ ] Every Scope 08 Test Plan row has intended RED and same-command GREEN evidence.

#### Test Evidence Items - Exact Parity With 11 Test Plan Rows

- [ ] TP-08-01 unit evidence proves complete symbol, view-model, one-result, owner-read, export, safe-text, identity, and registry invariants.
- [ ] TP-08-02 functional evidence proves complete page/config/note/registry/source and universe JSON parity.
- [ ] TP-08-03 functional evidence proves inline script syntax and literal ID integrity.
- [ ] TP-08-04 Regression E2E evidence proves SCN-007-023 identical Simple/Power result and zero display-mode requests.
- [ ] TP-08-05 Regression E2E evidence proves SCN-007-029 invalid edit preservation and correction without refetch.
- [ ] TP-08-06 Regression E2E evidence proves mobile/desktop keyboard/touch/table/layout/background-canvas equivalence.
- [ ] TP-08-07 Regression E2E evidence proves the complete truth/error/recovery vocabulary preserves last-valid identity without neutral substitutes.
- [ ] TP-08-08 Regression E2E evidence proves registry/navigation and state-faithful owner publication parity.
- [ ] TP-08-09 Regression E2E evidence proves hostile imported labels remain text and export omits sensitive state.
- [ ] TP-08-10 provider-credential browser evidence proves central settings ownership remains unchanged.
- [ ] TP-08-11 broader E2E evidence proves the cumulative Feature 007 suite passes after every focused Scope 08 row.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, UI matrix, Consumer/Shared Impact Sweeps, registry/source-order parity, safe-text/export/privacy review, viewport/focus/canvas pixel checks, marker diffs, no-interception/silent-pass scan, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, plan sync, traceability, framework write guard, and repository readiness are current and clean with every finding accounted for.
