# Scope 03: Contextual Tooltip Foundation

## 03-contextual-tooltip-foundation

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** `foundation-overlay:true`, `shared-infrastructure:true`, `accessibility-critical:true`

Depends On: 02-shared-four-view-shell

**Primary Outcome:** One shared `ContextualTooltip/v1` validator and disclosure controller composes RLG definitions, RLTKR ticker identity/links, RLCHART geometry/point rails, DOM values, and table values into equivalent pointer, keyboard, touch, and adjacent-table interpretation without creating a second owner model or competing tooltip engine.

## Requirement Coverage

- **Functional:** FR-021 through FR-028.
- **Non-functional:** NFR-001 through NFR-003, NFR-007, NFR-011 through NFR-012, and NFR-016.
- **Acceptance:** SCN-012-003 and SCN-012-004.

## Gherkin Scenarios

### SCN-012-003 - Power explains the current value

```gherkin
Scenario: SCN-012-003 A user inspects a Power chart point by keyboard
  Given the point represents a current analytical value
  When the point receives keyboard focus
  Then the disclosure defines the measure and interprets the exact current value in context
  And it states basis, as-of, uncertainty, and limitation
  And equivalent content is available by pointer, touch, and adjacent table
```

### SCN-012-004 - Label repetition fails the tooltip contract

```gherkin
Scenario: SCN-012-004 A Power tooltip contains no contextual interpretation
  Given the tooltip only repeats the label and displayed number
  When experience validation runs
  Then the tool fails ContextualTooltip validation
  And the affected Power item is not accepted as complete
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-003 chart point | Representative real Power chart and same-data table loaded | Hover point, focus canvas/arrow to point, tap point, open table target | All paths show the same definition, exact displayed value/unit, current interpretation, basis, source/as-of/freshness, uncertainty, limitation, and links | e2e-ui |
| SCN-012-004 label-only item | DOM/table fixture uses production context validator with repeated label/value | Focus/tap item and run coverage validator | Exact `E012-CONTEXT-MISSING` state appears; item cannot count complete; other valid contexts remain usable | e2e-ui |
| Mobile long context | Narrow viewport, long valid disclosure | Tap context control, close with Escape/button | Bounded bottom sheet fits, traps focus only when modal, dismisses, and returns focus to exact trigger | e2e-ui |
| Canvas unavailable | Canvas disabled in browser capability fixture, no request interception | Open representative Power view | Same-data text/table becomes primary; conclusion remains available | e2e-ui |

## Implementation Files

### New

- `rlcontext.js`
- `tests/contextual-tooltip.unit.mjs`
- `tests/contextual-tooltip.functional.mjs`
- `tests/contextual-tooltip.spec.mjs`

### Modified

- `rlg.js`
- `rlticker.js`
- `rlchart.js`
- `market-heatmap-lab.html`
- `options-structure-lab.html`
- `company-fundamentals-lab.html`
- `scripts/selftest.mjs`

## Implementation Plan

1. Implement the exact deep-frozen `ContextualTooltip/v1` validator, canonical context fingerprint, safe text/link construction, truth-state precedence, and `E012-CONTEXT-MISSING` failures. The renderer never infers direction, thresholds, source truth, or interpretation.
2. Implement the sole `#rlcontext-disclosure` controller with hover/focus/touch equivalence, pinned state, Escape/outside dismissal, focus return, viewport placement, mobile modal sheet, reduced-motion behavior, and controlled announcements.
3. Reconcile RLG to supply definitions/aliases to RLCTX while retaining its public lookup API. Remove its private floating DOM only after representative parity canaries pass.
4. Reconcile RLTKR to keep ticker normalization, company/kind, and Yahoo-link ownership while composing a public-symbol-only contextual object. Touching the ticker follows the link; a separate context control opens disclosure.
5. Add the structured RLCHART attach overload with hit testing, ordered point IDs, keyboard point rail, identical context projection, `aria-activedescendant`, and same-data-table focus. Retain the old function overload only as migration compatibility and never count it complete.
6. Convert one representative DOM/treemap route, one options/canvas route, and one source-qualified table route. These are canaries for the shared engine, not a claim of registry-wide Power coverage.
7. Add source/DOM scans that reject `rlgtip`, `rltkrtip`, `rlcharttip`, page-local floating containers, native-title-only completion, and label-only interpretations.
8. Keep essential state, unit, source, uncertainty, trigger, and invalidation visible outside the disclosure.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| `rlg.js` | Existing glossary recognition and automatic decoration remain intact | Existing glossary aliases resolve the same definitions before/after delegation |
| `rlticker.js` | Every ticker remains a Yahoo link with company/kind and no private values | Static and dynamic ticker canaries compare href/text and scan URL/referrer/request ledgers |
| `rlchart.js` | Current function attach/hit-test behavior remains available during migration | Existing charts run through compatibility overload; structured canary verifies point order/table target independently |
| Representative HTML | Owner computations and data flow remain unchanged | Pre/post owner conclusion/value fingerprints match while only context projection changes |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** all other tool HTML files, `rldata.js`, `rlviews.js`, `rlapp.js`, `rlbrief.js`, model registries/adapters, Journey/market-action modules, provider logic, publication scripts, option producer/data, Feature 002/008/BUG-004, QF, package/source-lock files, and framework-managed files.

**No broad tooltip cleanup:** only the three named canary pages may lose duplicate page-local context code in this scope.

## Rollback

Restore the pre-scope RLG/RLTKR/RLCHART implementations and the three page hunks, remove `rlcontext.js` and Scope 03 tests, and run the independent legacy glossary/ticker/chart/page canaries. Keep Scope 01/02 foundation artifacts untouched. Rollback must not alter owner model outputs, source data, or ticker identity.

## Scenario-First RED/GREEN Contract

Create TP-03-01 through TP-03-04 before the shared renderer edits. RED must identify missing current interpretation/access method or a label-only validation acceptance. After the first shared module edit, immediately run TP-03-01; after each provider adapter edit, run TP-03-02 before touching another provider.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-03-01 | Unit | unit | SCN-012-003, SCN-012-004 | `tests/contextual-tooltip.unit.mjs` | Validate exact fields, safe links/text, truth precedence, fingerprint, missing/label-only interpretation, unavailable values, and no inferred direction | `node --test tests/contextual-tooltip.unit.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Functional provider canary | functional | SCN-012-003, SCN-012-004 | `tests/contextual-tooltip.functional.mjs` | Compose RLG, RLTKR, RLCHART, DOM, and table contexts through one engine; reject duplicate engines and prove owner-value parity | `node --test tests/contextual-tooltip.functional.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Regression E2E | e2e-ui | SCN-012-003 | `tests/contextual-tooltip.spec.mjs` | `Regression: SCN-012-003 Power chart context is equivalent by pointer keyboard touch and table` | `npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-003 Power chart context is equivalent by pointer keyboard touch and table" --reporter=list` | Yes | `report.md#scenario-scn-012-003` |
| TP-03-04 | Adversarial Regression E2E | e2e-ui | SCN-012-004 | `tests/contextual-tooltip.spec.mjs` | `Regression: SCN-012-004 label-only context fails the exact Power item without hiding valid peers` | `npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-004 label-only context fails the exact Power item without hiding valid peers" --reporter=list` | Yes | `report.md#scenario-scn-012-004` |
| TP-03-05 | Mobile/canvas Regression E2E | e2e-ui | SCN-012-003 | `tests/contextual-tooltip.spec.mjs` | `Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas` | `npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas" --reporter=list` | Yes | `report.md#tp-03-05` |
| TP-03-06 | Broad regression | unit | SCN-012-003, SCN-012-004 | `scripts/selftest.mjs` | Preserve all existing glossary/ticker/chart/tool assertions and add one-engine/context completeness canaries | `node scripts/selftest.mjs` | No | `report.md#tp-03-06` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] RLCTX is the sole shared disclosure owner and every valid context carries definition, exact value/unit, current interpretation, basis, truth, uncertainty, limitation, and accessible relationships. Evidence: [TP-03-01](report.md#tp-03-01), [TP-03-02](report.md#tp-03-02), and [SCN-012-003](report.md#scn-012-003).
- [x] RLG, RLTKR, RLCHART, DOM, and table canaries preserve their owner responsibilities and computations while delegating disclosure behavior. Evidence: [TP-03-02](report.md#tp-03-02), [Duplicate Engine Scan](report.md#duplicate-engine-scan), and [Protected-Byte Replay](report.md#protected-byte-replay).
- [x] Pointer, keyboard, touch, mobile, canvas-failure, dismissal, focus-return, and same-data-table behavior are equivalent and no required meaning is hover-only. Evidence: [TP-03-03](report.md#tp-03-03), [TP-03-05](report.md#tp-03-05), and [Current System-Chrome Browser Matrix](report.md#current-system-chrome-browser-matrix).
- [x] The shared-infrastructure rollback restores prior canary behavior without changing owner models, ticker links, or source truth. Evidence: [Focused Legacy Rollback And Exact Restore](report.md#focused-legacy-rollback-and-exact-restore).

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [x] TP-03-01 unit evidence proves complete context validation and adversarial label-only rejection. Evidence: [TP-03-01](report.md#tp-03-01).
- [x] TP-03-02 functional evidence proves one-engine provider composition, duplicate-engine rejection, and owner-value parity. Evidence: [TP-03-02](report.md#tp-03-02).
- [x] TP-03-03 E2E evidence proves SCN-012-003 pointer/keyboard/touch/table equivalence. Evidence: [TP-03-03](report.md#tp-03-03) and [SCN-012-003](report.md#scn-012-003).
- [x] TP-03-04 adversarial E2E evidence proves SCN-012-004 exact-item failure for label repetition. Evidence: [TP-03-04](report.md#tp-03-04) and [SCN-012-004](report.md#scn-012-004).
- [x] TP-03-05 E2E evidence proves mobile fit/focus and non-canvas fallback. Evidence: [TP-03-05](report.md#tp-03-05).
- [x] TP-03-06 broad selftest evidence proves existing glossary/ticker/chart/tool behavior remains green. Evidence: [TP-03-06](report.md#tp-03-06).

#### Build Quality Gate

- [x] Scenario RED/GREEN, exact system-Chrome identity, no-interception scan, duplicate-tooltip source/DOM scan, ticker privacy scan, representative owner-output parity, accessibility/focus checks, protected-path diff, editor diagnostics, `git diff --check`, source-lock, artifact lint, and broad selftest are current and clean. Evidence: [Current Isolated Scope 03 Process Proofs](report.md#current-isolated-scope-03-process-proofs), [Current Static Quality Scans](report.md#current-static-quality-scans), [Current Broad Regression And Source Lock](report.md#current-broad-regression-and-source-lock), [Current Changed-Path And Protected-Boundary Review](report.md#current-changed-path-and-protected-boundary-review), and [Editor Diagnostics](report.md#editor-diagnostics).
