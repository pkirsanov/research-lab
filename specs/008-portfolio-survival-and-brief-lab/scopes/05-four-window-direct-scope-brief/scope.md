# Scope 05: Four-Window Direct-Scope Brief

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `brief:true`, `ui:true`

**Depends On:** Scope 04 - Public Evidence Barrier And Coverage

**Primary Outcome:** The actual route opens to Portfolio Brief and deterministically composes each existing ET window into truthful held, public-watchlist, completed-research, and inferred-relevance lanes, while insufficient history and no-material-change remain useful low-noise states.

## Requirement Coverage

- **Functional:** FR-039 through FR-044, FR-047 through FR-050, FR-056 through FR-061, and FR-064 through FR-067.
- **Non-functional:** NFR-003 through NFR-006, NFR-010 through NFR-013, NFR-018, and NFR-021 through NFR-023.
- **Cross-cutting:** no later observation in an earlier cutoff, no repeated-window confirmation inflation, no inferred ownership/preference, no duplicated specialist model, and no trade/advice presentation.

## Gherkin Scenarios

### SCN-008-006 - Four-window local composition

```gherkin
Scenario Outline: The Portfolio Brief uses the matching generic evidence window
  Given a fresh generic <window> evidence record exists
  And a valid local portfolio or direct research scope exists
  When the user opens the Portfolio Brief
  Then the brief identifies <window> and its evidence cutoff
  And portfolio-specific research actions use only evidence available by that cutoff
  And local composition time remains distinct from generic publication time

  Examples:
    | window |
    | pre-market |
    | morning |
    | pre-close |
    | after-hours |
```

### SCN-008-007 - Direct and inferred scope stay separate

```gherkin
Scenario: Held, watchlist, completed-research, and inferred-relevance subjects qualify for different reasons
  Given one ticker is in local holdings
  And one ticker is only in the public watchlist
  And one ticker appears only in eligible explicitly completed research action history
  And one domain appears only through relevance inferred from eligible explicitly completed research action history
  When the brief ranks research actions
  Then the held ticker, watchlist ticker, completed-research ticker, and inferred domain appear in the Held, Public watchlist, Completed research, and Inferred relevance lanes respectively
  And each item states the correct direct or behavior-derived scope source
  And no inferred ticker is presented as held
  And no held ticker is presented as proof of user interest or risk preference
```

### SCN-008-010 - Insufficient behavior history degrades honestly

```gherkin
Scenario: The browser has too little eligible action history
  Given no eligible events survive the visible evidence and decay policy
  When the Portfolio Brief composes
  Then behavior-derived interests are labeled insufficient
  And the brief uses holdings, public watchlist, current context, and generic evidence only
  And no fabricated preference, persona, or general-interest recommendation appears
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-006 four windows | 1440x1000 and 390x844; all four deterministic window fixtures | Select each window | Exact ID/time/cutoff/publication/composition fields; later evidence excluded; unavailable slot never substitutes another | e2e-ui |
| SCN-008-007 source lanes | Held, public-watchlist, completed ticker, inferred domain fixtures | Open Brief and inspect lane/source labels | Four separate lanes/chips; mixed sources enumerate each authority; ownership and inference never collapse | e2e-ui |
| SCN-008-010 insufficient history | Zero/one/expired eligible events | Open Brief and Power coverage accounting | Direct queue remains; inferred lane states insufficient and contains zero inferred rows | e2e-ui |
| Responsive queue | Long names, stale/no-action rows, narrow viewport, 130% text | Keyboard/touch through windows, lanes, rows | No body overflow/overlap/clipping; contained controls retain full labels; action order and source meaning are unchanged | e2e-ui |

No canvas is introduced in this brief-only scope. Canvas pixel/table parity begins with analytical tabs and is certified route-wide in Scope 16.

## Implementation Plan

1. Add Node/browser dual-runtime `rlportfoliobrief.js` with closed generic-window validation, public evidence identity de-duplication, direct scope projection, eligible-event reduction, interest-floor handling, action candidate construction, lexicographic rank tuple, queue accounting, and immutable local brief identity.
2. Consume exact `pre-market`, `morning`, `pre-close`, and `after-hours` identities/times from the mandatory public Market Brief config; retain generic cutoff, publication, retrieval/composition, and behavior cutoff as separate fields.
3. Build direct candidates from local holdings, ticker-only public watchlist, qualified current context, and eligible completed ticker research. Holdings never become interest; watchlist never becomes ownership; completed activity never becomes preference.
4. Apply mandatory visible queue policy, materiality marker, behavior floor/decay, repeated-evidence de-duplication, no-action accounting, stale/partial/unavailable truth, and current-cutoff eligibility without production fallback.
5. Render Portfolio Brief as the default `#brief` tab with Frozen Identity Band, exact window selector, separate flat scope lanes, source/freshness lines, bounded queue, no-action reasons, setup state, and the top edge of Risk X-Ray visible on desktop.
6. Implement desktop/tablet/mobile ordering, keyboard window/tab behavior, long-text wrapping, 44px controls, no body horizontal overflow, no nested cards, and source/state meaning independent of color.
7. Add deterministic four-window, direct-source, repeated-evidence, empty/no-material-change, stale/partial, and insufficient-history fixtures plus functional and real-route tests.

## Consumer Impact Sweep

| Consumer / reference surface | Required behavior | Verification |
|------------------------------|-------------------|--------------|
| Existing Market Brief public files/config | Read-only exact window/cutoff inputs; zero write/import from local composer | Publisher boundary functional suite and path-scoped diff |
| Existing owner tools | Fixed public route/hash only; no specialist formula duplicated | `tools.json` route validation and browser request/deep-link ledger |
| Local privacy inventory | Behavior floor, event counts, direct/inferred source and queue suppression remain inspectable | Functional composition/inventory parity |
| Route hashes | `#brief` is public; no subject, ticker, portfolio id, amount, parameter, or inference appears | Browser history/location/referrer assertions |

## Change Boundary And Rollback

**Allowed new file:** `rlportfoliobrief.js`.

**Allowed edits:** `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs`, `tests/portfolio-survival.support.mjs`, and Scope 05 fixture entries.

**Explicitly excluded:** `rldata.js`, `rlnav.js`, `rlbrief.js`, all generic Market Brief artifacts/scripts/schedule, analytics engine, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove `rlportfoliobrief.js` and Scope 05 marker-bounded route/config/test/fixture additions. The four-scope foundation route remains directly usable for setup/privacy, and every public generic artifact stays byte-identical.

## Scenario-First Red/Green Contract

Add every window/source/floor/ranking and browser assertion before composer/render behavior. Run exact row commands through the tool log with `SCOPE-05` and red/green tags. RED must identify cutoff leakage, source conflation, inferred filler, repeated-evidence inflation, or responsive failure; a static fixture echo without production composition is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-05-01 | Brief composition functional | functional | SCN-008-006, SCN-008-007, SCN-008-010 | `tests/portfolio-brief.functional.mjs` | Validate all four windows, cutoff exclusion, identity de-duplication, direct source lanes, mixed-source labels, materiality ordering, no-action accounting, and behavior floor/decay through production functions | `node --test tests/portfolio-brief.functional.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Regression E2E | e2e-ui | SCN-008-006 | `tests/portfolio-survival-brief.spec.mjs` | `Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time" --reporter=list` | Yes | `report.md#scenario-scn-008-006` |
| TP-05-03 | Regression E2E | e2e-ui | SCN-008-007 | `tests/portfolio-survival-brief.spec.mjs` | `Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history" --reporter=list` | Yes | `report.md#scenario-scn-008-007` |
| TP-05-04 | Regression E2E | e2e-ui | SCN-008-010 | `tests/portfolio-survival-brief.spec.mjs` | `Regression: SCN-008-010 insufficient completed history produces zero inferred actions` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-010 insufficient completed history produces zero inferred actions" --reporter=list` | Yes | `report.md#scenario-scn-008-010` |
| TP-05-05 | Responsive Regression E2E | e2e-ui | SCN-008-006, SCN-008-007, SCN-008-010 | `tests/portfolio-survival-brief.spec.mjs` | `Regression: Feature 008 four-window brief preserves source lanes at desktop mobile and zoom without overlap` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 four-window brief preserves source lanes at desktop mobile and zoom without overlap" --reporter=list` | Yes | `report.md#tp-05-05` |
| TP-05-06 | Broader Regression E2E | e2e-ui | SCN-008-006, SCN-008-007, SCN-008-010 | `tests/portfolio-survival-brief.spec.mjs` | Execute the complete cumulative Feature 008 Brief browser suite over the real fixture-overlay server | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-05-06` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-039 through FR-044, FR-047 through FR-050, FR-056 through FR-061, and FR-064 through FR-067 are fully implemented with default Brief, exact windows/clocks, separate direct/inferred sources, insufficient/stale/no-action truth, bounded visible queue, owner links, and one complete brief identity.
- [ ] NFR-003 through NFR-006, NFR-010 through NFR-013, NFR-018, and NFR-021 through NFR-023 are satisfied by explainable source/cutoff identity, no engagement objective, missing-state integrity, cache-first local composition, explicit calibration, latest-complete publication, keyboard operation, source transparency, failure isolation, and auditability.
- [ ] Every public generic input remains read-only, every owner deep link is fixed-route and no-referrer, and no local subject/value appears in URL/history/referrer/request or public tool read.
- [ ] Desktop/mobile/zoom behavior has no body overflow, overlap, clipped dynamic text, hidden source meaning, hover-only requirement, or speculative filler.
- [ ] Every Scope 05 behavior has intended RED and same-command GREEN evidence before the broader browser row.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-05-01 functional evidence proves four-window cutoff integrity, direct/inferred separation, de-duplication, ranking, no-action accounting, and insufficient history.
- [ ] TP-05-02 Regression E2E evidence proves SCN-008-006 renders all exact ET windows with separate cutoff/publication/composition times and no later evidence.
- [ ] TP-05-03 Regression E2E evidence proves SCN-008-007 preserves held/watch/completed/inferred labels and authority boundaries, and that raw view/open/click history cannot populate Completed research or Inferred relevance.
- [ ] TP-05-04 Regression E2E evidence proves SCN-008-010 retains direct value while rendering zero inferred items and an explicit insufficient-history state.
- [ ] TP-05-05 responsive E2E evidence proves source lanes, controls, long text, and no-action states remain usable without overlap at desktop/mobile/zoom.
- [ ] TP-05-06 broader E2E evidence proves the complete cumulative Brief suite passes after all focused rows.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, consumer/cutoff/source-lane review, mobile/zoom/keyboard/no-overlap checks, public/private sentinel scan, no-interception/service-worker/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and traceability are current and clean with every finding individually accounted for in `report.md`.
