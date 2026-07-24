# Scope 02: Shared Four-View Shell

## 02-shared-four-view-shell

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** `foundation-overlay:true`, `shared-infrastructure:true`, `ui-critical:true`

Depends On: 01-contract-config-registry-foundation

**Primary Outcome:** Every registered route can resolve one shared exact four-view shell in shadow/canary mode, with correct ordinary versus Market Action Center labels, public hash/history/focus behavior, mobile geometry, legacy-control suppression, and honest dependency-pending panels, without fetching unrelated data or serializing private state.

## Requirement Coverage

- **Functional:** FR-004 through FR-008, FR-025 through FR-027 shell semantics, FR-046 through FR-047 route-safe local mode state, FR-066 through FR-067 shell identity, and FR-113 through FR-120 gate presentation.
- **Non-functional:** NFR-001 through NFR-004, NFR-008, NFR-012 through NFR-014, and NFR-018.
- **Acceptance:** SCN-012-028, SCN-012-029, and SCN-012-031. SCN-012-017 rename/route completion remains owned by Scope 09.

## Gherkin Scenarios

### SCN-012-028 - Feature 002 gate blocks dynamic Brief integration

```gherkin
Scenario: SCN-012-028 Feature 002 is not terminally certified
  Given Simple, Power, and Journey foundations are independently available
  When an ordinary tool opens Brief
  Then the tool states that certified dynamic brief publication is unavailable
  And it does not bypass the dependency with direct author browsing or fabricated current prose
```

### SCN-012-029 - Feature 008 gate blocks private Portfolio integration

```gherkin
Scenario: SCN-012-029 Required RLPORTFOLIO milestones are not certified
  Given public watchlist matrix projection is available
  When the user requests private save or private ticker scope
  Then the private integration remains unavailable with the exact dependency gate
  And no parallel private store is created
```

### SCN-012-031 - Mobile preserves all four ordinary modes

```gherkin
Scenario: SCN-012-031 An ordinary tool is used at a narrow mobile viewport
  When the user traverses Simple, Power, Brief, and Journey by touch and keyboard
  Then all labels, controls, contextual explanations, progress, and conclusions fit without overlap or body-level horizontal scrolling
  And no mode is removed or renamed for mobile
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-028 Brief gate | Feature 002 predicate false; ordinary route loaded | Select Brief by pointer, keyboard, direct hash, and Back/Forward | Brief tab remains selected; exact dependency, observed state, withheld capability, preserved capability, and gate appear; zero author request occurs | e2e-ui |
| SCN-012-029 private Portfolio gate | Feature 008 predicate false; Center shell fixture has public matrix capability | Select Portfolio and request private scope | Public view remains usable; exact private gate appears; no alternate storage key/write appears | e2e-ui |
| SCN-012-031 narrow ordinary shell | 320 CSS px and 200% zoom | Traverse tabs, hash targets, Back/Forward, and first controls by touch/keyboard | Four full labels remain available; dock does not cover focus/content; body has no horizontal overflow | e2e-ui |
| Market Action Center shell canary | `market-brief` registry identity | Resolve shell before rename content cutover | Exact Brief/Portfolio/Red Alert/Journey view set resolves; title remains under Scope 09 ownership | functional/e2e-ui |

## Implementation Files

### Modified

- `rlviews.js`
- `rlapp.js`
- `rlexperience.js`
- `tool-experience.config.json`
- `scripts/selftest.mjs`

### New

- `tests/tool-experience-shell.unit.mjs`
- `tests/tool-experience-shell.functional.mjs`
- `tests/tool-experience-mobile.spec.mjs`

### Existing Test Extension

- `tests/tool-experience.spec.mjs`

## Implementation Plan

1. Replace mode auto-detection with registry-resolved exact view sets while preserving compatibility APIs during shadow/canary rollout. No page contains a mode list and no shared module branches on tool ID.
2. Extend `rlapp.js` through its existing declarative Brief mount to load/validate the experience once, inject Simple/Journey hosts, and register the shell. Preserve script order `rldata.js -> rlapp.js -> rlnav.js` and existing first paint.
3. Implement canonical hashes, valid public target parsing, invalid-target cleanup, one-entry user history, Back/Forward restore without fetch, local mode-only persistence, and the UX-specified focus rules.
4. Implement one accessible tablist, exact roving tabindex/keyboard behavior, desktop top placement, narrow safe-area dock, reduced motion, stable dimensions, and full-label handling at 320 CSS px and 200% zoom.
5. Add compatibility bridges for existing Power controls. The old control must be absent from layout, accessibility tree, and tab order after per-route cutover; the bridge may not fetch/recompute on a view-only transition.
6. Render dependency-pending panels from Scope 01 predicates. A blocked view remains selectable and names dependency, observed state, withheld/preserved capability, and mechanical gate; it offers no bypass.
7. Add a no-private-route-state validator: hashes/history/title/referrer/local mode state may contain only public mode and stable public target IDs.
8. Keep visible all-route cutover behind the design's complete-adapter/context gates. This scope proves shell behavior and canaries; it does not assert all 22 Simple/Power experiences complete.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| `rlapp.js` bootstrap | Every page still loads data status, Brief mount, owner read, and navigation in order | All-23-page boot canary checks one mount, one status control, no exception, and unchanged public owner-read availability |
| `rlviews.js` | Existing Simple/Power/Brief behavior remains recoverable until route cutover | Current representative market, local-model, static-model, and off-theme pages preserve prior selected content in compatibility mode |
| Hash/history/focus | Existing public deep links and Back/Forward do not fetch or lose focus | Real-browser request ledger and focus trace across ordinary and Center view sets |
| Provider and private state | Mode changes never read keys or serialize private values | Provider credential canary plus sentinel scan of URL, title, history, referrer, storage, DOM, console, and request ledger |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** all ordinary tool HTML files, `market-brief.html`, `rldata.js`, `rlbrief.js`, tooltip helpers, domain adapters, model formulas, Journey store/runtime, publisher scripts, Feature 002/008/BUG-004 surfaces, option owner/data, package/source-lock files, and framework-managed files.

**Collateral rule:** no page-local cleanup, styling sweep, source refactor, or tooltip conversion is bundled into the shell change.

## Rollback

Restore the previous `rlviews.js` and additive `rlapp.js` bootstrap paths from the pre-scope bytes, remove the Scope 02 tests/config additions, and leave valid Scope 01 registries untouched. The rollback canary must prove prior controls reappear and work without deleting mode/local/portfolio/Journey storage or changing source data.

## Scenario-First RED/GREEN Contract

Create the unit/functional reducer assertions and all three exact E2E titles before shell edits. Valid RED means the old shell lacks Journey/exact specialization/gate/mobile behavior. Missing Chrome, an HTTP server failure, or selector absence caused by test setup is not valid RED. After each minimal high-fan-out edit, run TP-02-01 or TP-02-02 immediately before any further source read/edit.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-02-01 | Unit | unit | SCN-012-028, SCN-012-029, SCN-012-031 | `tests/tool-experience-shell.unit.mjs` | Resolve exact view sets, mode/history transitions, invalid targets, focus policy, local-mode record, and dependency projection without DOM or fetch | `node --test tests/tool-experience-shell.unit.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Functional shared canary | functional | SCN-012-028, SCN-012-029 | `tests/tool-experience-shell.functional.mjs` | Execute all-23 bootstrap, compatibility-control suppression, provider/owner-read preservation, one-shell ownership, and zero private serialization | `node --test tests/tool-experience-shell.functional.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Regression E2E | e2e-ui | SCN-012-028 | `tests/tool-experience.spec.mjs` | `Regression: SCN-012-028 uncertified Feature 002 exposes exact Brief gate and no author request` | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-028 uncertified Feature 002 exposes exact Brief gate and no author request" --reporter=list` | Yes | `report.md#scenario-scn-012-028` |
| TP-02-04 | Regression E2E | e2e-ui | SCN-012-029 | `tests/tool-experience.spec.mjs` | `Regression: SCN-012-029 uncertified Feature 008 preserves public Portfolio and creates no private store` | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-029 uncertified Feature 008 preserves public Portfolio and creates no private store" --reporter=list` | Yes | `report.md#scenario-scn-012-029` |
| TP-02-05 | Regression E2E | e2e-ui | SCN-012-031 | `tests/tool-experience-mobile.spec.mjs` | `Regression: SCN-012-031 narrow ordinary shell preserves four full modes focus and geometry` | `npx --no-install playwright test tests/tool-experience-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-031 narrow ordinary shell preserves four full modes focus and geometry" --reporter=list` | Yes | `report.md#scenario-scn-012-031` |
| TP-02-06 | Broader shell E2E | e2e-ui | SCN-012-028, SCN-012-029, SCN-012-031 | `tests/tool-experience.spec.mjs`, `tests/tool-experience-mobile.spec.mjs` | Run full shell suites over ordinary and Center view sets with no request interception | `npx --no-install playwright test tests/tool-experience.spec.mjs tests/tool-experience-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-02-06` |
| TP-02-07 | Broad regression | unit | SCN-012-031 | `scripts/selftest.mjs` | Preserve all existing registry/data/status/model checks and add exact shell/duplicate-control canaries | `node scripts/selftest.mjs` | No | `report.md#tp-02-07` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] One registry-driven shell owns the exact ordinary and Center view sets, public hash/history/focus/mobile state, and dependency gates without a tool-ID switch or page-local mode list. → Evidence: [TP-02-01](report.md#tp-02-01), [TP-02-02](report.md#tp-02-02), and [scenario contract evidence](report.md#scenario-contract-evidence).
- [x] Shared-bootstrap blast-radius canaries prove current pages, status, owner reads, provider boundary, first paint, and compatibility rollback remain intact. → Evidence: [TP-02-02](report.md#tp-02-02), [Focused Compatibility Rollback Canary](report.md#focused-compatibility-rollback-canary), [Final Affected Functional Replay](report.md#final-affected-functional-replay), and [Complete Allowed And Protected Hash Proof](report.md#complete-allowed-and-protected-hash-proof).
- [x] No mode change fetches/recomputes unrelated data, writes private state, encodes private context, or offers a dependency bypass. → Evidence: [TP-02-02](report.md#tp-02-02), [SCN-012-028](report.md#scn-012-028), and [SCN-012-029](report.md#scn-012-029).

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [x] TP-02-01 unit evidence proves exact view-set and state-transition semantics. → Evidence: [report.md](report.md#tp-02-01).
- [x] TP-02-02 functional evidence proves all-page boot, compatibility, provider, owner-read, one-control, and private-state canaries. → Evidence: [report.md](report.md#tp-02-02).
- [x] TP-02-03 E2E evidence proves SCN-012-028 exact Feature 002 gate and zero author request. → Evidence: [report.md](report.md#tp-02-03).
- [x] TP-02-04 E2E evidence proves SCN-012-029 public preservation and no parallel private store. → Evidence: [report.md](report.md#tp-02-04).
- [x] TP-02-05 E2E evidence proves SCN-012-031 mobile/zoom/keyboard/touch geometry and complete labels. → Evidence: [report.md](report.md#tp-02-05).
- [x] TP-02-06 broader E2E evidence proves ordinary and Center shell regressions together without interception. → Evidence: [report.md](report.md#tp-02-06).
- [x] TP-02-07 broad selftest evidence proves no existing build-free behavior regressed. → Evidence: [report.md](report.md#tp-02-07).

#### Build Quality Gate

- [x] Scenario RED/GREEN, system-Chrome identity, no-interception/service-worker scan, 23-page boot canary, provider and owner-read canaries, private-sentinel scan, focus/geometry checks, protected-path diff, editor diagnostics, `git diff --check`, source-lock, artifact lint, and broad selftest are current and clean. → Evidence: [TP-02-01 RED](report.md#tp-02-01-red), [Final Browser And Broad Regression Replay](report.md#final-browser-and-broad-regression-replay), [Current Browser Boundary And Quality Reruns](report.md#current-browser-boundary-and-quality-reruns), [Complete Allowed And Protected Hash Proof](report.md#complete-allowed-and-protected-hash-proof), and [G060 And Final Artifact Checks](report.md#g060-and-final-artifact-checks).
