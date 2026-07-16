# Scope 06: Explainable Research Action Lifecycle

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `brief:true`, `ui:true`, `privacy-critical:true`

**Depends On:** Scope 05 - Four-Window Direct-Scope Brief

**Primary Outcome:** Every behavior-derived or mixed research action explains exactly why it appears, settings and passive activity remain non-evidence, lifecycle changes are explicit and bounded, and the route exposes only non-executing research verbs and fixed owning-surface links.

## Requirement Coverage

- **Functional:** FR-045 through FR-046, FR-051 through FR-055, and FR-062 through FR-063.
- **Non-functional:** NFR-003 through NFR-004, NFR-011 through NFR-013, NFR-019, and NFR-022 through NFR-023.
- **Cross-cutting:** FR-022, FR-031 through FR-038, FR-047, FR-053, FR-058 through FR-060, and FR-066 remain binding.

## Gherkin Scenarios

### SCN-008-008 - Every behavior-derived item explains why it appears

```gherkin
Scenario: A behavior-derived general research action is shown
  Given eligible completed actions support a non-sensitive domain interest
  When a general research action is ranked from that interest
  Then it shows why shown, event categories, relevance confidence, horizon, recency, decay, freshness, trigger, and completion or invalidation condition
  And it links to the owning research surface
  And it is labeled as a relevance inference rather than a personal constraint or market fact
```

### SCN-008-009 - Settings never become inferred interests

```gherkin
Scenario: A user changes risk, horizon, shock, or display controls
  Given the user has no eligible behavior history for the affected domain
  When settings and parameter values change
  Then no InterestSignal is created or strengthened from those fields
  And no risk tolerance, loss capacity, goal, tax status, or preferred asset is inferred
  And calculation changes remain attributable to explicit user input only
```

### SCN-008-034 - Recommendations remain non-executing

```gherkin
Scenario: A held position has concentration and catalyst risk
  Given fresh generic evidence and local exposure identify the research issue
  When the Portfolio Brief authors an action
  Then the action says review concentration, inspect catalyst risk, or run a scenario
  And it includes condition, invalidation or completion, confidence, freshness, and deep link
  And it contains no buy, sell, order, trade size, or automatic rebalance instruction
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-008 Why Shown | Inferred and mixed actions at current/fading states | Open disclosure, inspect evidence, open/return from owner | Event categories, separate confidences, recency/decay/expiry, horizon, cutoff/freshness, trigger, conditions, owner and rank reason all render | e2e-ui |
| SCN-008-009 excluded activity | Empty eligible history; mode/settings/parameter/pointer/dwell/scroll actions | Exercise controls and inspect privacy/brief identities | Behavior/event/interest/action identities remain byte-equal; only explicit calculation identity may change | e2e-ui |
| SCN-008-034 closed actions | Direct concentration/catalyst evidence | Inspect every visible action and available command | Only Review/Inspect/Run/Compare/Revisit/Refresh/Open and lifecycle verbs exist; no order/size/apply/rebalance control or advice copy exists | e2e-ui |
| Mobile disclosure/lifecycle | 390x844, long subject/source/conditions, keyboard/touch | Open/close Why Shown, complete/dismiss, return focus | Bottom sheet does not cover content or clip text; focus restores; no swipe/unlabeled destructive action; no body overflow | e2e-ui |

No analytical canvas is added in this scope. Responsive pixel/box checks prove the disclosure and action rows; chart pixel/table parity begins in Scope 07 and closes route-wide in Scope 16.

## Implementation Plan

1. Complete deterministic `deriveInterestSignals`, `whyShown`, action candidate/rank projection, de-duplication, and lifecycle reduction in `rlportfoliobrief.js` using visible config-owned floor, half-life, maximum age, confidence vocabulary, queue cap, and stable ties.
2. Ensure every inferred/mixed action includes supporting event IDs/categories/surfaces, distinct dates, latest support, score/band/sensitivity/expiry, separate relevance and market/model confidence, horizon, evidence cutoff/state, rank tuple/reason, trigger, completion, invalidation/stale, fixed owner route/hash, and clear-history effect.
3. Map attributed generic trade-style evidence to closed local research actions without copying a personalized trade command or newly authoring market narrative.
4. Implement explicit completion preview/confirmation, exact de-duplication, Not now, Already reviewed, No longer material, Restore, automatic stale/invalidation, and immediate recomposition. Click/open/dismiss/automatic state creates no preference or negative evidence.
5. Render Why Shown and lifecycle inspector on desktop/mobile with safe definition-list content, separate confidence semantics, focus return, Escape, 44px controls, and visible clear-history access.
6. Implement fixed sibling hashes and session-only owner handoff; no private subject/value appears in the URL. Opening alone records nothing, and owner return enables completion only after a current qualified owner read plus explicit confirmation.
7. Add exact closed-verb/advice/execution scans, settings/passive-activity mutation matrices, hostile text/route tests, and real-browser request/history/focus assertions.

## Consumer Impact Sweep

| Consumer / reference surface | Required behavior | Verification |
|------------------------------|-------------------|--------------|
| Sibling tab hashes | Fixed public section only; session record carries local action/focus | History/location/request ledger and return-focus E2E |
| Existing owner routes | Allowlisted `tools.json` route plus fixed `#portfolio-brief-handoff`; no owner model rewrite | Route allowlist unit and actual owner navigation E2E |
| `rlnav.js` | No edit in this scope; return strip remains unavailable until final shared integration | Route-local return fallback to `#brief` is tested without claiming shared strip behavior |
| Privacy inventory | Completion/dismissal/clear effects and excluded sources match stored minimal records | Functional inventory/composition parity |
| Generic Market Brief copy | Attributed evidence may display; local command uses closed research verb | Functional and UI forbidden-language scan |

## Change Boundary And Rollback

**Allowed files:** `rlportfoliobrief.js`, `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs`, and Scope 06 fixture entries.

**Explicitly excluded:** `rldata.js`, `rlnav.js`, `rlbrief.js`, generic Market Brief artifacts/scripts/scheduler, analytics engine, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 06 marker-bounded composer/store/UI/test additions. Scope 05 direct/four-window Brief remains deterministic; existing events stay valid minimal records but no removed derived action is presented.

## Scenario-First Red/Green Contract

Author complete why-shown, forbidden mutation, lifecycle, owner-handoff, and closed-vocabulary assertions first. Run every row through the tool log with `SCOPE-06` and red/green tags. RED must identify a missing field, unauthorized inference/event, unsafe command, private URL/request, or responsive/focus defect; text-search alone cannot replace production composer and real-page assertions.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-06-01 | Brief lifecycle functional | functional | SCN-008-008, SCN-008-009, SCN-008-034 | `tests/portfolio-brief.functional.mjs` | Execute complete why-shown projection, decay sensitivity, rank tuple, repeated-evidence de-duplication, generic-action mapping, lifecycle transitions, fixed owner routes, and closed research vocabulary through production functions | `node --test tests/portfolio-brief.functional.mjs` | No | `report.md#tp-06-01` |
| TP-06-02 | Privacy mutation functional | functional | SCN-008-009, SCN-008-034 | `tests/portfolio-privacy.functional.mjs` | Exercise mode/settings/parameters/pointer/dwell/scroll/click/open/dismiss/automatic invalidation and prove no event, interest, trait, mandate, BL view, expected return, confidence, or execution field changes | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-06-02` |
| TP-06-03 | Regression E2E | e2e-ui | SCN-008-008 | `tests/portfolio-survival-brief.spec.mjs` | `Regression: SCN-008-008 inferred action exposes complete why shown provenance` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-008 inferred action exposes complete why shown provenance" --reporter=list` | Yes | `report.md#scenario-scn-008-008` |
| TP-06-04 | Regression E2E | e2e-ui | SCN-008-009 | `tests/portfolio-survival-brief.spec.mjs` | `Regression: SCN-008-009 settings parameters scroll and dwell create no interest signal` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-009 settings parameters scroll and dwell create no interest signal" --reporter=list` | Yes | `report.md#scenario-scn-008-009` |
| TP-06-05 | Regression E2E | e2e-ui | SCN-008-034 | `tests/portfolio-survival-brief.spec.mjs` | `Regression: SCN-008-034 every visible recommendation remains non executing research` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-034 every visible recommendation remains non executing research" --reporter=list` | Yes | `report.md#scenario-scn-008-034` |
| TP-06-06 | Responsive lifecycle Regression E2E | e2e-ui | SCN-008-008, SCN-008-009, SCN-008-034 | `tests/portfolio-survival-brief.spec.mjs` | `Regression: Feature 008 why shown lifecycle and return focus remain accessible without mobile overlap` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 why shown lifecycle and return focus remain accessible without mobile overlap" --reporter=list` | Yes | `report.md#tp-06-06` |
| TP-06-07 | Broader Regression E2E | e2e-ui | SCN-008-006 through SCN-008-010, SCN-008-034 | `tests/portfolio-survival-brief.spec.mjs` | Execute the complete cumulative Feature 008 Brief browser suite after lifecycle and why-shown rows | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-06-07` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-045 through FR-046, FR-051 through FR-055, and FR-062 through FR-063 are fully implemented with complete why-shown, separate confidence, attributed generic evidence, closed research actions, completion/stale/invalidation, no preference inference, visible clear control, and immediate recomposition.
- [ ] NFR-003 through NFR-004, NFR-011 through NFR-013, NFR-019, and NFR-022 through NFR-023 are satisfied by visible calibration/sensitivity, deterministic latest identity, keyboard/focus operation, inert text/routes, adjacent educational boundary, and exact recommendation traceability.
- [ ] Closed-vocabulary and DOM/source scans find no buy/sell/order/execute/rebalance/size/target-position/suitable/recommended-for-you control or personalized-advice claim.
- [ ] Consumer Impact Sweep proves fixed sibling/owner routing, zero private URL/referrer/request content, no generic copy mutation, and no action event from open/click/display changes.
- [ ] Every Scope 06 behavior has intended RED and same-command GREEN evidence before the broader browser row.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-06-01 functional evidence proves complete why-shown, deterministic decay/ranking, lifecycle, owner routes, and closed research vocabulary.
- [ ] TP-06-02 functional evidence proves settings/passive activity/lifecycle changes cannot create profiling, mandate, BL, expected-return, confidence, or execution state.
- [ ] TP-06-03 Regression E2E evidence proves SCN-008-008 exposes every required why-shown field and separate confidence semantics.
- [ ] TP-06-04 Regression E2E evidence proves SCN-008-009 leaves event/interest/action identity unchanged across settings, parameters, mode, scroll, and dwell.
- [ ] TP-06-05 Regression E2E evidence proves SCN-008-034 exposes only non-executing research commands, conditions, confidence, freshness, and safe links.
- [ ] TP-06-06 responsive E2E evidence proves Why Shown, lifecycle, keyboard/touch, focus return, long text, and mobile geometry have no overlap or hidden meaning.
- [ ] TP-06-07 broader E2E evidence proves the complete Brief suite passes after all focused lifecycle rows.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, closed-vocabulary and forbidden-inference scans, Consumer Impact Sweep, private URL/request/referrer sentinel proof, mobile/zoom/focus/no-overlap checks, no-interception/service-worker/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and traceability are current and clean with every finding individually accounted for in `report.md`.
