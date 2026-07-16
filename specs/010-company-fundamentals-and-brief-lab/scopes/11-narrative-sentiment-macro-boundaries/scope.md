# Scope 11: Narrative, Sentiment, And Macro Boundaries

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `evidence-boundary:true`, `market-context:true`, `ui:true`

**Depends On:** Scope 10 - Material-Change Adaptive Brief

**Primary Outcome:** News, rumor, sentiment, macro, and market observations remain independently sourced and dated, cannot create reported facts or accepted assumptions, and affect company research only through an explicit mechanism while fundamental/sentiment disagreement remains visible.

## Requirement Coverage

- **Functional:** FR-010-073 through FR-010-076 and FR-010-081.
- **Non-functional:** independent evidence clocks contribute to NFR-010-014, completed in Scope 12.
- **Primary scenarios:** SCN-010-019, SCN-010-020, and SCN-010-021.

## Gherkin Scenarios

### SCN-010-019 - Rumor Boundary

```gherkin
Scenario: Unverified high-attention news cannot modify the model
  Given a news observation has no authoritative confirmation and may affect event risk
  When the brief and scenario reducers process it
  Then the item remains news with unverified limitation and evidence needed
  And the accepted facts, assumptions, and scenario revision are byte-equivalent to their pre-evaluation state
```

### SCN-010-020 - Sentiment Divergence

```gherkin
Scenario: Positive sentiment does not erase deteriorating fundamentals
  Given a current sentiment observation is positive and a separately sourced reported trend is deteriorating
  When selectBriefView renders the current thesis
  Then both evidence classes, windows, sources, and divergent directions are present
  And confidence is constrained without changing the reported fundamental direction
```

### SCN-010-021 - Company-Specific Macro Mechanism

```gherkin
Scenario: Macro evidence enters only through a linked exposure
  Given a macro observation changes and an accepted company mechanism links it to financing, demand, valuation, or operating economics
  When the change ranker evaluates relevance
  Then the brief cites that mechanism and affected driver or risk
  And the same macro observation is context-only or excluded for a company with no evidenced mechanism
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-019 | Unverified news has source/window and no authoritative confirmation | Inspect change, evidence need, scenario fingerprint | Item remains News/unverified; facts/assumptions/revision unchanged; evidence needed is explicit | e2e-ui |
| SCN-010-020 | Positive sentiment and deteriorating reported trend have different clocks | Open Simple/Brief thesis and truth strip | Both classes/windows/sources/directions remain; confidence is constrained; fundamental direction is unchanged | e2e-ui |
| SCN-010-021 | Macro observation and one evidenced company mechanism exist | Compare a linked company with an unlinked company | Linked brief names mechanism/driver/risk; unlinked item is context-only/excluded | e2e-ui |

## Implementation Plan

1. Complete production evidence-class validators for news, sentiment, market, macro, estimate, management claim, and reported fact with independent source/window/clock/freshness/rights requirements.
2. Enforce reducers and projections so news/rumor/sentiment/price moves cannot create or modify reported facts, accepted assumptions, scenario revisions, archetype assignments, or statement freshness.
3. Implement sentiment fields for channel, observation window, coverage, method/source, direction, intensity, limitations, and divergence. Sparse/biased/unknown coverage constrains or excludes interpretation.
4. Implement explicit company-mechanism links for financing, demand, valuation, operating economics, catalyst, risk, or peer channels. Generic macro/sector narrative without such a link remains context-only or excluded.
5. Preserve separate statement/model/brief/market/news/sentiment clocks in selectors, source ledger, brief, export-ready state, and sanitized diagnostics.
6. Extend Brief/Simple/Sources rendering for evidence-class labels, divergence, confidence constraints, mechanism links, and exact evidence-needed text without color-only or hover-only meaning.

## Change Boundary And Rollback

**Allowed:** narrative/sentiment/market/macro class validation, mechanism policy, brief selectors/renderers, accepted market-context fields, and scope-owned tests.

**Excluded:** browser/provider enablement, social/news scraping, financial-fact mutation, automatic assumptions, generic market brief content, personalized signals, trading/advice, and registry/Feature 002.

**Rollback:** reverse only Scope 11 evidence-policy/rendering/test hunks and select prior validated brief/publication refs. Accepted facts, scenarios, and prior evidence records remain immutable.

## Scenario-First Red/Green Contract

Author byte-fingerprint non-mutation, divergence/clock, sparse coverage, and linked/unlinked mechanism assertions first. Tests call production classifiers/reducers; injected news or sentiment text is input only and cannot supply the expected conclusion.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-11-01 | Unit | unit | SCN-010-019, SCN-010-020, SCN-010-021 | `tests/company-fundamentals-context.unit.mjs` | Production class/clock/coverage/divergence/mechanism logic and pre/post accepted-state fingerprints | `node --test tests/company-fundamentals-context.unit.mjs` | No |
| TP-11-02 | Brief functional | functional | SCN-010-019, SCN-010-020, SCN-010-021 | `tests/company-fundamentals-brief.functional.mjs` | Full structured brief input preserves weak-evidence classes, clocks, mechanisms, and non-mutation boundary | `node --test tests/company-fundamentals-brief.functional.mjs` | No |
| TP-11-03 | Regression E2E | e2e-ui | SCN-010-019 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-019 unverified news cannot change facts assumptions or scenario revision` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-019 unverified news cannot change facts assumptions or scenario revision" --reporter=list` | Yes |
| TP-11-04 | Regression E2E | e2e-ui | SCN-010-020 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-020 sentiment divergence preserves both clocks and fundamental direction` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-020 sentiment divergence preserves both clocks and fundamental direction" --reporter=list` | Yes |
| TP-11-05 | Regression E2E | e2e-ui | SCN-010-021 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-021 macro context enters only through an evidenced company mechanism` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-021 macro context enters only through an evidenced company mechanism" --reporter=list` | Yes |
| TP-11-06 | Broader Regression E2E | e2e-ui | SCN-010-019, SCN-010-020, SCN-010-021 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 11 | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-073 through FR-010-076 and FR-010-081 are implemented with immutable evidence classes, independent clocks, explicit mechanisms, and no fact/scenario freshness upgrade.
- [ ] SCN-010-019, SCN-010-020, and SCN-010-021 prove rumor containment, divergence, confidence constraints, and linked/unlinked company mechanism behavior.
- [ ] Accepted fact/assumption/scenario fingerprints remain byte-equivalent across weak-evidence evaluation unless an explicit user decision changes a revision.
- [ ] Scenario-specific E2E regression coverage exists for every Scope 11 user-visible behavior and the broader E2E suite passes.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 11 behavior.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-11-01 unit evidence proves class, clock, coverage, divergence, mechanism, and non-mutation production logic.
- [ ] TP-11-02 functional evidence proves full brief construction preserves weak-evidence boundaries.
- [ ] TP-11-03 Regression E2E evidence proves SCN-010-019.
- [ ] TP-11-04 Regression E2E evidence proves SCN-010-020.
- [ ] TP-11-05 Regression E2E evidence proves SCN-010-021.
- [ ] TP-11-06 broader E2E evidence proves cumulative behavior through Scope 11.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, pre/post state hashes, class/clock/freshness matrix, linked/unlinked mechanism matrix, sparse-sentiment and price-freshness checks, no-advice/no-auto-apply scans, accessible divergence/trace parity, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, G094 capability check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
