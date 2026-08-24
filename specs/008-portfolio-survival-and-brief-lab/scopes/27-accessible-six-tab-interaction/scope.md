# Scope 27: Accessible Six-Tab Interaction

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Done
**Scope-Kind:** runtime-behavior
**Tags:** `integration:accessibility`, `remediation`
**Depends On:** 26
**Entry Gate:** Every scope in `Depends On` must be Done.
**Finding:** F008-ACCESSIBILITY-001
**Requirements:** NFR-013 through NFR-016.

## Outcome

Complete the six-tab and modal interaction model for keyboard, screen reader, forced colors, reduced motion, zoom, text spacing, touch, and narrow-mobile users without changing analytical conclusions.

## Gherkin Scenario And Ownership

### SCN-008-053: Every workspace decision is equivalent under assistive interaction

```gherkin
Scenario: A keyboard and screen-reader user completes the portfolio workflow under accessibility preferences
  Given reduced motion forced colors 200 percent zoom and text-spacing overrides are active
  When the user uses the skip link navigates mode and workspace tabs with Arrow Home End Enter and Space opens and closes modal sheets and inspects every chart table and truth state
  Then focus order selection announcements labels errors and return targets are deterministic
  And modal focus is trapped only while open and returns to the invoker
  And every chart decision is available in an equivalent table without motion or color dependence
  And no text control focus ring tooltip sheet or status overlaps clips or causes body-level horizontal scrolling
```

## Implementation Plan

1. Add the skip link and complete roving tabindex/manual-activation behavior for mode and six workspace tabs with Arrow/Home/End/Enter/Space.
2. Implement modal/side-sheet semantics, initial focus, focus trap, Escape, inert background, and invoker restoration.
3. Add reduced-motion behavior for ranks/paths/charts/scroll and forced-colors/high-contrast token treatment with visible focus.
4. Verify screen-reader names, state announcements, captions/headers, equivalent tables, tooltip focus/tap, and no color-only meaning.
5. Ensure 200% zoom, text spacing, 44px targets, 390x844 mobile, contained scrollers, long labels, and no overlap/overflow.
6. Keep accessibility changes projection-only over Scope 26's immutable view model.

## Change Boundary

- **Allowed:** route HTML/CSS/controller accessibility regions, Feature 008 accessibility fixtures, `tests/portfolio-survival-mobile.spec.mjs`, a focused accessibility browser carrier, and route parse/selftest canaries.
- **Excluded:** analytics and ranking logic, personal schemas, generic publisher, provider credentials, unrelated shared navigation behavior, registry/docs, and framework-managed files.

## Shared Infrastructure Impact Sweep

| Protected surface | Consumers | Canary |
|---|---|---|
| Shared nav/data-status focus order | All tools | Existing shared-shell consumer matrix remains green. |
| Immutable workspace projections | Six tabs and both modes | A11y interaction changes no identity/value/conclusion. |
| Chart/table parity | Risk, paths, dependence, allocation | Every canvas state has an equivalent table and focus route. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Mode and six-tab controls | Roving focus, activation, announcements, and active panels remain deterministic. |
| Sheets, dialogs, tooltips, charts, and tables | Focus, semantics, equivalent content, and invoker restoration remain complete. |
| Desktop, mobile, zoomed, spaced, reduced-motion, and forced-color projections | Every projection preserves the same identity, values, states, and conclusions. |

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-053 tabs | Keyboard only | Arrow/Home/End, Enter/Space across mode and six tabs | Correct focus/selection/panel semantics | e2e-ui |
| SCN-008-053 modal | Keyboard/screen reader | Open/close Why shown, portfolio, privacy, BL sheets | Trap only while open; focus restored | e2e-ui |
| SCN-008-053 preferences | Reduced motion and forced colors | Run paths, change rank, inspect status | No animated dependence; visible non-color states | e2e-ui |
| SCN-008-053 layout | 390x844, 200% zoom, text spacing | Traverse all tabs/tables | No overlap, clipping, body overflow; 44px targets | e2e-ui |

## Test Plan

**Execution Reconciliation:** These rows remain planning-owned definitions. Their execution proof is not authored or restated here: each row links to the test-owned report, and its [post-merge validation](report.md#post-merge-validation---2026-08-23) records merged-tree coverage for the SCN-008-053 browser carrier and repository selftest. The eight checked DoD items below resolve to those report anchors, so this planning artifact retains the scope-level `Done` mirror without making a planner execution or feature-certification claim. TP-27-04 uses Playwright interception for disposable document mutations, so it remains a non-live `functional` carrier rather than `e2e-ui`. TP-27-05 reuses the pre-existing shared selftest carrier and is not a Scope 27-authored scenario test.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Authoring Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| TP-27-01 | Regression E2E | e2e-ui | 053 | `tests/portfolio-survival-accessibility.spec.mjs` | Exact title: `Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete` | `npx --no-install playwright test tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete" --reporter=list` | Yes | Authored | `report.md#tp-27-01` |
| TP-27-02 | Preferences E2E | e2e-ui | 053 | `tests/portfolio-survival-accessibility.spec.mjs` | Exact title: `Regression: SCN-008-053 reduced motion forced colors contrast and text spacing preserve every decision` | `npx --no-install playwright test tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-053 reduced motion forced colors contrast and text spacing preserve every decision" --reporter=list` | Yes | Authored | `report.md#tp-27-02` |
| TP-27-03 | Responsive E2E | e2e-ui | 053 | `tests/portfolio-survival-mobile.spec.mjs` | Exact title: `Regression: SCN-008-053 zoom mobile and long content have no overlap clipping or body overflow` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-053 zoom mobile and long content have no overlap clipping or body overflow" --reporter=list` | Yes | Authored | `report.md#tp-27-03` |
| TP-27-04 | Adversarial mutation | functional | 053 | `tests/portfolio-survival-accessibility.spec.mjs` | Disposable keyboard, skip-link, focus, motion, and color-only mutations each fail | `npx --no-install playwright test tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Adversarial: SCN-008-053 reduced accessibility implementations fail closed" --reporter=list` | No | Authored | `report.md#tp-27-04` |
| TP-27-05 | Broader regression | functional | 053 | `scripts/selftest.mjs` | Shared route, registry, and static-site invariants remain green | `node scripts/selftest.mjs` | No | Existing shared carrier | `report.md#tp-27-05` |

## Rollback And Restore

- Keep the semantic DOM and table content available throughout styling changes.
- A failed modal/tab transition restores the invoking focus target and last selected panel without recompute.
- Revert Feature 008 projection files/tests only; no analytical or personal state migration is needed.

### Definition of Done - Tiered Validation

- [x] SCN-008-053 is implemented across keyboard, screen reader, preferences, zoom, touch, desktop, and mobile without changing conclusions. Evidence: [scenario contract](report.md#scenario-contract-evidence), and the no-conclusion-change half is proven by the control-verified [projection-only proof](report.md#projection-only-proof) — 166 analytics-token matches in the file, 0 across all 399 added lines.
- [x] TP-27-01 keyboard/screen-reader real-page regression passes. Evidence: [TP-27-01](report.md#tp-27-01).
- [x] TP-27-02 reduced-motion/forced-colors/contrast/text-spacing real-page regression passes. Evidence: [TP-27-02](report.md#tp-27-02).
- [x] TP-27-03 responsive/zoom/no-overlap real-page regression passes. Evidence: [TP-27-03](report.md#tp-27-03).
- [x] TP-27-04 adversarial mutation carrier fails each reduced accessibility implementation. Evidence: [TP-27-04](report.md#tp-27-04) and the [non-tautology audit](report.md#non-tautology-audit-of-the-mutation-carrier) of its drifted-anchor, no-op-replacement, and same-document-navigation guards.
- [x] TP-27-05 broader regression passes. Evidence: [TP-27-05](report.md#tp-27-05) and the test-owned [merged repository selftest](report.md#merged-repository-selftest).
- [x] Shared Infrastructure Impact Sweep and projection-only rollback proof are recorded. Evidence: [shared infrastructure impact sweep](report.md#shared-infrastructure-impact-sweep) and [rollback proof](report.md#rollback-proof--projection-only).
- [x] Build Quality Gate passes with zero skips/warnings and no excluded-file changes. Evidence: [build quality gate](report.md#build-quality-gate--current-session-2026-08-23).
