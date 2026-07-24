# Scope 08: Journey Capability Runtime And All-Tool Definitions

## 08-journey-runtime-definitions

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation-overlay:true`, `local-state-critical:true`, `no-execution:true`

Depends On: 07-strategy-property-method-adapters

**Primary Outcome:** One shared Journey runtime validates every goal/step/mechanism, persists only non-sensitive local sessions through verified slots, restores/resumes/backtracks with dependency-aware stale state, builds typed complete/partial/refused non-executing packets, and exposes concrete definitions for all 22 ordinary tools plus four global Market Action Center goals.

## Requirement Coverage

- **Functional:** FR-043 through FR-055 and FR-099 through FR-104 definition/runtime foundations; portfolio-stress private execution remains gated to Scope 13.
- **Non-functional:** NFR-001 through NFR-005, NFR-007 through NFR-009, NFR-012 through NFR-015, and NFR-018.
- **Acceptance:** SCN-012-009, SCN-012-010, SCN-012-011, and SCN-012-032.

## Gherkin Scenarios

### SCN-012-009 - Journey resumes durable progress

```gherkin
Scenario: SCN-012-009 A user pauses a tool-specific journey and reloads
  Given durable local storage contains a valid current JourneySession
  When the user reopens Journey and selects the same goal
  Then prior context, completed steps, evidence, current branch, and next required step are restored
  And no click or page visit is misclassified as a completed step
```

### SCN-012-010 - Journey backtracking invalidates dependent steps

```gherkin
Scenario: SCN-012-010 A user changes an earlier journey assumption
  Given later completed steps depend on that assumption
  When the user backtracks and confirms a new value
  Then dependent later steps become stale with a reason
  And unrelated completed steps remain intact
  And the completion packet cannot use stale dependent conclusions
```

### SCN-012-011 - Journey completion never executes

```gherkin
Scenario: SCN-012-011 A user signs off a completed JourneyCompletionPacket
  Given all required steps and evidence are complete
  When the user records human signoff
  Then the packet records acceptance of the research process
  And no trade, order, holding change, rebalance, hedge, or external execution is triggered
```

### SCN-012-032 - Every current registry tool has explicit Journey goals

```gherkin
Scenario: SCN-012-032 The 23-entry experience registry is validated
  Given tools.json contains the current registered inventory
  When Feature 012 experience validation runs
  Then every ordinary tool has at least two concrete goals and a mechanism
  And market-brief maps to the four explicit global goals
  And there is no generic example-only or missing goal row
```

## All-Tool Goal And Mechanism Inventory

| Registry ID | Goal 1 / Mechanism | Goal 2 / Mechanism | Additional Global Goals / Gating |
|---|---|---|---|
| `market-brief` | Prepare the next session / wizard | Triage actions needed now / decision tree | Investigate a latent risk / checklist+tree; Stress portfolio against alerts / scenario lab, private step gated to Scope 13 |
| `market-heatmap-lab` | Decide whether a move is broad or narrow / checklist | Investigate one sector outlier and confirmation / decision tree | - |
| `options-flow-feed-lab` | Triage unusual contracts for research / wizard | Test catalyst-linked positioning versus noise / decision tree | - |
| `intraday-tape-lab` | Classify session and control regime / wizard | Define level, trigger, and invalidation / scenario lab | - |
| `swing-structure-lab` | Determine trend versus range/reversal / decision tree | Test support/resistance thesis and invalidation / scenario lab | - |
| `options-structure-lab` | Map option-implied support/resistance / wizard | Stress wall/flip behavior across spot/IV/expiry / scenario lab | - |
| `gamma-trading-lab` | Evaluate gamma-flip waterfall setup / decision tree | Prepare OPEX/expiration research plan / checklist | - |
| `sector-research-lab` | Identify credible sector transition / decision tree | Select and justify ETF vehicle / wizard | - |
| `global-rotation-lab` | Compare two country opportunities with FX / wizard | Test local move under currency/risk penalties / scenario lab | - |
| `real-assets-lab` | Build one asset driver thesis / wizard | Stress USD/rate/risk reversal / scenario lab | - |
| `bond-regime-lab` | Classify credit/duration/inflation regime / checklist | Compare two sleeves under rate/spread scenarios / scenario lab | - |
| `ai-capex-strategy-lab` | Identify primary/second-order beneficiaries / wizard | Build and stress AI-capex barbell / scenario lab | - |
| `msft-july-print-model` | Prepare earnings scenario tree / wizard | Find the operating assumption driving valuation risk / scenario lab | - |
| `company-fundamentals-lab` | Audit evidence sufficiency / checklist | Create or revise source-linked company scenario / wizard | - |
| `etf-momentum-lab` | Select ETF for stated factor objective / wizard | Test ranking robustness across horizons/risk penalties / scenario lab | - |
| `strategy-self-improvement-lab` | Improve one variable without data snooping / wizard | Explain candidate out-of-sample failure / checklist | - |
| `strategy-validation-lab` | Decide whether edge survives validation / decision tree | Compare two variants on one frozen basis / scenario lab | - |
| `smart-money-flow-lab` | Evaluate whether cluster retains research value / wizard | Compare disclosure lag classes / scenario lab | - |
| `waterfront-polo-lab` | Shortlist markets satisfying property/polo constraints / wizard | Verify commute and hazard evidence for finalist / checklist | - |
| `volatility-sizing-lab` | Set and explain conditional risk throttle / wizard | Investigate estimator disagreement/suppression / decision tree | - |
| `palm-springs-rental-market-lab` | Evaluate acquisition scenario / wizard | Stress luxury demand, financing, regulation, insurance / scenario lab | - |
| `ocean-shores-rental-market-lab` | Evaluate large-luxury scenario / wizard | Stress seasonality, weather, insurance, financing / scenario lab | - |
| `technical-analysis-decision-lab` | Qualify or refuse setup through five gates / wizard | Investigate conflicting model families and invalidation / decision tree | - |

Each goal has concrete prerequisites, steps/branches, evidence slots, completion predicates, stale policy, accessible labels, limitations, and `noExecution:true`; the table is an inventory, not a substitute for full definitions in `journeys.json`.

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-009 durable resume | Valid session saved to inactive verified slot | Complete evidence-backed steps, pause, reload, Resume | Context, branch, completed evidence, current step, and next requirement restore; visits/clicks alone remain incomplete | e2e-ui |
| Session-only start | Local storage disabled by browser capability, not request interception | Select goal, acknowledge warning, progress | `Session only` is visible before start; no reload/durable claim appears; safe export remains | e2e-ui |
| SCN-012-010 backtrack | Branching goal with unrelated and dependent completed steps | Backtrack, replace earlier assumption, confirm | Transitive dependents become stale with reasons; unrelated steps remain complete; packet excludes stale outcomes | e2e-ui |
| SCN-012-011 signoff | Completion predicate evaluated complete | Check review and Record review | Packet review state changes locally; request, publication, portfolio, and execution ledgers remain byte-identical | e2e-ui |
| SCN-012-032 registry goals | Actual 23-entry registries | Open each Journey chooser through registry loop | Two concrete rows per ordinary tool and four exact Center goals; mechanism/outcome/prerequisites present; no generic example | functional/e2e-ui |

## Implementation Files

### New

- `rljourney.js`
- `tests/journey.unit.mjs`
- `tests/journey-definitions.functional.mjs`
- `tests/journey-storage.functional.mjs`
- `tests/journey.spec.mjs`
- `tests/journey-mobile.spec.mjs`

### Modified

- `journeys.json`
- `rlexperience.js`
- `rlapp.js`
- `tool-experience.config.json`
- `scripts/validate-tool-experience.mjs`
- `scripts/selftest.mjs`

## Implementation Plan

1. Complete all definition/step records from the inventory with closed mechanisms, prerequisites, context schemas, dependency DAGs, evidence slots, completion predicates, branch rules, stale/backtrack policies, privacy classes, accessibility, limitations, and no execution.
2. Implement exact definition/step/session/packet validators, canonical fingerprints, dependency graph validation, and safe errors. Config cannot contain executable JavaScript.
3. Implement wizard, checklist, decision-tree, scenario-lab, and declared composition reducers through one `JourneyMechanismAdapter/v1` contract. Scenario lab calls the owning Simple adapter over frozen evidence; it does not copy formulas.
4. Implement verified `pointer/slotA/slotB` local session writes with byte/hash reread, explicit limits, safe retention/expiry, forbidden-field rejection, and last-valid preservation. Unknown/newer records remain untouched.
5. Detect durable storage before a journey begins. If unavailable, require explicit session-only acknowledgment and never claim persistence.
6. Implement evidence-based step completion, pause/resume/abandon/clear/safe export, backtrack preview, transitive dependent stale marking, evidence refresh, audit events, and packet exclusion of stale conclusions.
7. Build typed complete/partial/refused packets with intent/context/outcomes/evidence/provenance/quality/assumptions/conflicts/unresolved/trace/disclaimer/signoff and `noExecution:true`. Review mutates only local review state.
8. Implement public-reference handoff through short-lived validated sessionStorage; URLs carry only mode and stable public goal/target IDs, never session answers or private refs.
9. Render goal chooser/progress/evidence/backtrack/packet through shared shell/context with mobile ordered layout, focus restoration, dialogs starting on Cancel, and stable geometry.
10. Keep private portfolio-stress prerequisites dependency-pending until Scope 13; definitions may resolve, but no Feature 008 data is read here.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| `rlapp.js` | Existing page boot/status/Brief mount remains unchanged when Journey is unopened | All-23 boot canary and zero eager Journey storage writes |
| Browser storage | RLDATA credentials/cache, tool histories, Feature 008 keys, and unrelated storage remain untouched | Before/after full key/value hash inventory around start/resume/clear/signoff tests |
| Simple adapters | Scenario lab consumes frozen owner run and never changes baseline/evidence | Scope 05-07 adapter fingerprints and request ledgers remain unchanged |
| Hash/history/focus | Only public goal/target IDs travel; local/private context remains local | URL/referrer/title/history sentinel scan and focus-return browser test |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** all tool HTML/owner formulas, `rldata.js`, `rlviews.js`, RLCTX providers, Brief/WebEvidence/publication/market-action/private-portfolio source, Feature 002/008/BUG-004, option owner/data, QF, package/source-lock files, and framework-managed files.

**Storage boundary:** no auth/token/account/holding/quantity/cost/P&L/payment/secret/free-form sensitive field may enter `RLJOURNEY`. Portfolio stress stores only an opaque local revision reference after Scope 13 activation.

## Rollback

Unregister Journey runtime/bootstrap, restore Scope 08 `rlapp.js`/experience/config/definition hunks, and leave v1 local slots inert and untouched. Older code rejects newer versions rather than downgrading; the shipped clear/export control remains the only user-data deletion path. Re-run all prior shell/Simple/owner canaries.

## Scenario-First RED/GREEN Contract

Write reducer/storage/definition tests and the four exact scenario browser titles before implementation. RED must fail an explicit contract outcome, not merely absence of a selector or test harness. Storage corruption tests must preserve and compare a real last-valid session produced by production code rather than assert fixture echoes.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-08-01 | Unit | unit | SCN-012-009, SCN-012-010, SCN-012-011 | `tests/journey.unit.mjs` | Validate definitions/steps/DAGs/reducers/transitions/stale dependencies/completion packets/no-execution and closed errors | `node --test tests/journey.unit.mjs` | No | `report.md#tp-08-01` |
| TP-08-02 | Registry definitions functional | functional | SCN-012-032 | `tests/journey-definitions.functional.mjs` | Registry-derived validation of 22 ordinary tools with at least two concrete goals plus four exact Center goals, mechanisms, evidence, and no generic examples | `node --test tests/journey-definitions.functional.mjs` | No | `report.md#scenario-scn-012-032` |
| TP-08-03 | Storage/privacy functional | functional | SCN-012-009, SCN-012-010, SCN-012-011 | `tests/journey-storage.functional.mjs` | Round-trip verified slots, corruption/future-version/limits, session-only mode, clear/export, forbidden fields, and zero unrelated key mutation | `node --test tests/journey-storage.functional.mjs` | No | `report.md#tp-08-03` |
| TP-08-04 | Regression E2E | e2e-ui | SCN-012-009 | `tests/journey.spec.mjs` | `Regression: SCN-012-009 Journey reload restores evidence-complete progress and never completes visits` | `npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-009 Journey reload restores evidence-complete progress and never completes visits" --reporter=list` | Yes | `report.md#scenario-scn-012-009` |
| TP-08-05 | Regression E2E | e2e-ui | SCN-012-010 | `tests/journey.spec.mjs` | `Regression: SCN-012-010 backtracking stales only dependent steps and excludes stale packet outcomes` | `npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-010 backtracking stales only dependent steps and excludes stale packet outcomes" --reporter=list` | Yes | `report.md#scenario-scn-012-010` |
| TP-08-06 | Regression E2E | e2e-ui | SCN-012-011 | `tests/journey.spec.mjs` | `Regression: SCN-012-011 human review changes only local packet state and triggers no execution` | `npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-011 human review changes only local packet state and triggers no execution" --reporter=list` | Yes | `report.md#scenario-scn-012-011` |
| TP-08-07 | Regression E2E | e2e-ui | SCN-012-032 | `tests/journey.spec.mjs` | `Regression: SCN-012-032 every registered tool exposes concrete goals through one Journey shell` | `npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-032 every registered tool exposes concrete goals through one Journey shell" --reporter=list` | Yes | `report.md#scenario-scn-012-032` |
| TP-08-08 | Mechanism Regression E2E | e2e-ui | SCN-012-009, SCN-012-010 | `tests/journey.spec.mjs` | `Regression: wizard checklist decision tree and scenario lab share evidence completion backtrack and packet rules` | `npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: wizard checklist decision tree and scenario lab share evidence completion backtrack and packet rules" --reporter=list` | Yes | `report.md#tp-08-08` |
| TP-08-09 | Mobile/accessibility E2E | e2e-ui | SCN-012-009, SCN-012-010, SCN-012-011 | `tests/journey-mobile.spec.mjs` | `Regression: Journey mobile progress evidence backtrack dialogs and packet fit and restore focus` | `npx --no-install playwright test tests/journey-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-08-09` |
| TP-08-10 | Broad regression | unit | SCN-012-009, SCN-012-010, SCN-012-011, SCN-012-032 | `scripts/selftest.mjs` | Preserve shell/Simple/context/owner/source invariants and add Journey definition/storage/no-execution canaries | `node scripts/selftest.mjs` | No | `report.md#tp-08-10` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] One shared runtime implements every mechanism, evidence-completion rule, local storage state, resume/backtrack/stale lifecycle, typed packet, safe export, and no-execution invariant.
- [ ] All 23 registry entries resolve concrete goals exactly as inventoried; every ordinary tool has at least two and Market Action Center has exactly four.
- [ ] Durable/session-only truth, forbidden-field privacy, public-only deep links, focus/mobile/accessibility, and rollback behavior are complete without touching private portfolio or publication owners.

#### Test Evidence Items - Exact Parity With 10 Test Plan Rows

- [ ] TP-08-01 unit evidence proves definition/reducer/stale/packet/no-execution contracts.
- [ ] TP-08-02 functional evidence proves SCN-012-032 all-tool goal/mechanism completeness.
- [ ] TP-08-03 functional evidence proves verified storage, session-only, privacy, clear/export, and last-valid behavior.
- [ ] TP-08-04 E2E evidence proves SCN-012-009 durable resume and no visit-only completion.
- [ ] TP-08-05 E2E evidence proves SCN-012-010 dependency-aware backtracking and packet exclusion.
- [ ] TP-08-06 E2E evidence proves SCN-012-011 review-only signoff and zero execution.
- [ ] TP-08-07 E2E evidence proves SCN-012-032 concrete goal inventory in the real shell.
- [ ] TP-08-08 E2E evidence proves all four mechanisms use the common contract.
- [ ] TP-08-09 E2E evidence proves narrow/mobile/focus/dialog/progress/packet accessibility.
- [ ] TP-08-10 broad selftest evidence proves the existing Research Lab baseline remains green.

#### Build Quality Gate

- [ ] Scenario RED/GREEN, exact system-Chrome identity, no-interception/service-worker scan, storage fault/forbidden-field/key inventory, URL/referrer/private sentinel scan, all-tool goal validator, mechanism and no-execution source/DOM scan, accessibility/mobile checks, protected-path diff, editor diagnostics, `git diff --check`, source-lock, artifact lint, and broad selftest are current and clean.
