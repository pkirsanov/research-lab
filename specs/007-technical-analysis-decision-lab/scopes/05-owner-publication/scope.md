# Scope 05: Existing-Owner Publication And Strict Adapters

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `publisher:true`, `shared-infrastructure:true`, `owner-adapter:true`

**Depends On:** Scope 01 - Capability Foundation And Shared Contracts; Scope 02 - Technique Engine And Evidence Independence; Scope 03 - Level Geometry And Setup Lifecycle; Scope 04 - Five-Gate Synthesis And Candidate Selection

**Primary Outcome:** Existing specialist pages publish only source-faithful, versioned results from their current compute paths; Feature 007 validates and consumes those results without private calls or formula duplication, and absent Feature 006 evidence remains explicitly unavailable without blocking Feature-007-owned techniques.

## Gherkin Scenarios

### SCN-007-015 / BS-015 - Option positioning is unavailable without a valid snapshot

```gherkin
Scenario: Missing option chain cannot become neutral gamma
  Given no current compatible option snapshot exists
  When the selected stock is analyzed
  Then the options module is UNAVAILABLE with the required source named
  And zero gamma, no wall, or neutral dealer positioning is not inferred
  And the price-based gates continue only if the SetupDefinition permits absent options
```

### SCN-007-016 / BS-016 - Dealer convention remains coherent

```gherkin
Scenario: One inherited convention governs every option-derived result
  Given a current option snapshot was computed under a declared dealer-sign convention
  When option levels contribute to the overview
  Then the flip, walls, net gamma scenario, and caveat use that same convention
  And the consumer does not silently re-sign the snapshot
```

### SCN-007-017 / BS-017 - Footprint and depth modules fail honestly

```gherkin
Scenario: OHLCV cannot satisfy microstructure requirements
  Given only bar OHLCV and an end-of-day option chain are available
  When footprint and liquidity-depth evidence are requested
  Then footprint states that tick-level bid/ask traded volume is required
  And depth states that time-stamped full order-book data is required
  And neither module emits a proxy result styled as the real feed
```

### SCN-007-024 / BS-024 - Stale or daily-only evidence remains useful and honest

```gherkin
Scenario: Intraday evidence is missing but daily structure is current
  Given weekly and daily bars are current
  And the tactical source is unavailable
  When the tool resolves
  Then daily swing models may produce a current WATCH or NO EDGE state
  And tactical trigger models remain UNAVAILABLE
  And the owner read preserves that limitation
```

## Existing Owner Integration Matrix

| Existing owner | Scope 05 treatment | Closed capability / truth contract |
| --- | --- | --- |
| `swing-structure-lab.html` | Add nested publication from its existing computed state | `swing-structure/v1`: source set, confirmed/provisional roles, levels, patterns, limitations |
| `intraday-tape-lab.html` | Add nested publication from its existing computed state | `intraday-auction/v1`: session, cutoff, VWAP/profile levels, opening state, proxy classification |
| `options-structure-lab.html` | Add nested publication from its existing computed state | `options-positioning/v1`: clocks, expirations, filters, assumptions, snapshot, frozen sign convention |
| `gamma-trading-lab.html` | Add nested publication from its existing computed state | `gamma-playbook/v1`: setup vocabulary, source snapshot, convention, option-volume proxy limits |
| `market-heatmap-lab.html` | Add nested publication from its existing computed state | `market-breadth/v1`: universe version, denominator, source/cutoff, breadth state, deep link |
| `sector-research-lab.html` | Add nested publication from its existing computed state | `relative-context/v1`: role, symbols, classification as-of, aligned timestamps, denominator, normalized results |
| `strategy-validation-lab.html` | Retain its existing generic tool read and Scope 01 `RLVALID` parity adapter; do not invent a nested Feature 007 passport | Existing strategy rule/UI/publication remain its authority; Feature 007 builds its own exact setup passports |
| Feature 006 adapter | Read only a real matching `tdc-tool-read/v1`; do not change Feature 006 or infer certification | Missing, stale, mismatched source/selection/cutoff, or invalid version becomes explicit unavailable Trend Dynamics evidence |

The first six rows are the six new nested `rl-ta-owner-read/v1` publishers defined by `design.md`. Strategy Validation is the seventh existing owner integration but is not misrepresented as a Feature 007 nested publisher. Feature 006 is a strict consumer adapter, not a delivery dependency.

## Implementation Plan

1. Add one marker-bounded publisher to each of the six named specialist pages at the point where its existing result is complete. Preserve the outer `rl-tool-read/v1`; nest `rl-ta-owner-read/v1` with capability version, owner/result/source ids, symbol/session, cutoff, truth, closed/provisional coverage, payload, and limitations.
2. Serialize only already-computed owner state. Do not call a private function from Feature 007, export a private page function, load another page's script, inspect an iframe, parse owner DOM, or reproduce the owner's detailed formula.
3. Validate exact outer/nested versions, capability discriminator, key closure, source-set id, result id, symbol, session, adjustment, decision cutoff, availability, truth, provisional coverage, payload, and limitations before admission.
4. Require owner cutoff at or before the Feature 007 decision cutoff and exact symbol/session/adjustment compatibility. Preserve stale, provisional, degraded, partial, failed, and unavailable states without upgrading them.
5. Enforce option eligibility: positioning evidence requires current compatible `options-positioning/v1` with snapshot clocks, expiration coverage, liquidity filters, rates/dividends/volatility assumptions, `signConventionId`, and `signApplied:true`. All sign-dependent outputs share that snapshot/convention.
6. Enforce microstructure eligibility: footprint requires tick volume-at-price with bid/ask or aggressor classification; depth requires timestamped full-book add/move/cancel/execute events; large-trade classification requires size/price/time/classification. OHLCV and option snapshots satisfy none of these contracts.
7. Implement the Feature 006 adapter in the Feature 007 page. Accept only a valid `tdc-tool-read/v1` whose symbol, selected source, cutoff, and selection match; otherwise emit exact unavailable evidence. Feature-007-owned trend methods still run from qualified observations and never claim Feature 006 dynamics/change semantics.
8. Preserve daily-only operation when tactical qualified series or Intraday owner evidence is absent. Daily-eligible setups can produce current `WATCH`/`NO EDGE`; tactical triggers remain unavailable and the limitation travels to every projection.
9. Add owner-schema, source/cutoff, no-private-call, no-re-sign, missing-as-unavailable, and legacy-publication canaries to the validator/selftest/browser suite. The real-page owner matrix opens each owner route over HTTP and inspects the actual RLDATA envelope.

## Shared Infrastructure Impact Sweep

| High-fan-out surface | Protected downstream contracts | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| Swing Structure | Existing verdict, weekly/daily state, levels, patterns, first paint, generic read | Existing selftest plus real owner-route receipt compared before/after | Exact nested-publisher marker only |
| Intraday Tape | Session/VWAP/profile/opening behavior, proxy labels, first paint, generic read | Existing selftest plus real owner-route receipt | Exact nested-publisher marker only |
| Options Structure | Snapshot, assumptions, sign toggle, levels, first paint, generic read | Option owner parity and convention canary | Exact nested-publisher marker only |
| Gamma Trading | Existing playbook/proxy/caveat, first paint, generic read | Gamma owner parity and convention canary | Exact nested-publisher marker only |
| Market Heatmap | Universe, denominator, treemap, breadth, first paint, generic read | Breadth owner parity and unchanged route canary | Exact nested-publisher marker only |
| Sector Research | Ratio/RRG/breadth/group outputs, denominator, first paint, generic read | Relative owner parity and aligned-time canary | Exact nested-publisher marker only |
| Strategy Validation | Scope 01 shared primitive parity, fixed rule/UI/publication | Existing output parity and real-page first-paint canary | Scope 01 adapter marker, unchanged in Scope 05 |
| `scripts/selftest.mjs` | Every existing group and prior Feature 007 scope | Full selftest; additions remain inside Scope 05 sub-marker | Scope 05 sub-marker only |

## Change Boundary And Rollback

**Allowed shared edits:** one exact nested-publisher block in each of the six publisher pages, plus Scope 05 sub-markers in Feature 007 page/validator/selftest/browser tests/fixtures. Each owner block is bounded by `/* ---------- Feature 007 owner read: <capability> ---------- */` and a matching end marker.

**Read-only integration:** Strategy Validation and Feature 006 source remain unchanged in Scope 05. Their contracts are consumed or canaried only.

**Explicitly excluded:** owner formulas, owner UI, owner fixture semantics, `rldata.js`, `rlvalidation.js`, shared shell/chart/ticker/glossary/navigation files, registries, Market Brief, packages/workflows, all Feature 005/006 files, and unrelated tests.

**Pre-edit discipline:** capture path-scoped status/diff and nearest result-publication context for every owner page. Any overlap with an unowned hunk blocks that owner edit; no broad page rewrite, reformat, or relocation is permitted.

**Rollback/restore:** remove each nested-publisher marker independently, remove Scope 05 Feature 007 hunks, rerun that owner's parity canary and full selftest, then rerun provider credentials and the cumulative Feature 007 suite. No owner result, local state, or unrelated dirty hunk is reset.

## Scenario-First TDD Contract

Write every owner schema/cutoff/convention/absence assertion and browser title before adding a publisher or adapter. Capture intended RED, apply one marker block, and rerun the same command to GREEN before touching the next owner. Every changed visible behavior has a literal `Regression:` title.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Unit | unit | SCN-007-015, 016, 017, 024 | `scripts/selftest.mjs` | Validate all six nested owner schemas, outer/nested truth, source/cutoff compatibility, option convention, no-neutral absence, microstructure requirements, Strategy Validation parity, and Feature 006 unavailable adapter | `node scripts/selftest.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Contract validator | functional | SCN-007-015, 016, 017, 024 | `scripts/validate-technical-analysis-decision.mjs` | Validate exact owner markers/capabilities/keys, no private-call or DOM-scrape references, Feature 006 read-only adapter, and six-publisher plus Strategy Validation integration inventory | `node scripts/validate-technical-analysis-decision.mjs` | No | `report.md#tp-05-02` |
| TP-05-03 | Regression E2E | e2e-ui | SCN-007-015 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-015 missing option snapshot stays unavailable and never becomes neutral gamma` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-015 missing option snapshot stays unavailable and never becomes neutral gamma" --reporter=list` | Yes | `report.md#scenario-scn-007-015` |
| TP-05-04 | Regression E2E | e2e-ui | SCN-007-016 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-016 option flip walls and GEX preserve one inherited convention` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-016 option flip walls and GEX preserve one inherited convention" --reporter=list` | Yes | `report.md#scenario-scn-007-016` |
| TP-05-05 | Regression E2E | e2e-ui | SCN-007-017 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-017 OHLCV leaves footprint depth and large-trade modules unavailable` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-017 OHLCV leaves footprint depth and large-trade modules unavailable" --reporter=list` | Yes | `report.md#scenario-scn-007-017` |
| TP-05-06 | Regression E2E | e2e-ui | SCN-007-024 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-024 daily-only read stays useful while tactical evidence remains unavailable` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-024 daily-only read stays useful while tactical evidence remains unavailable" --reporter=list` | Yes | `report.md#scenario-scn-007-024` |
| TP-05-07 | Owner matrix canary | e2e-ui | SCN-007-015, 016, 024 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: Feature 007 owner integrations preserve source cutoffs limitations and existing reads` opens all seven existing owners, verifies six nested payloads and Strategy Validation parity, and proves absent Feature 006 remains unavailable | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 007 owner integrations preserve source cutoffs limitations and existing reads" --reporter=list` | Yes | `report.md#tp-05-07` |
| TP-05-08 | Credential boundary canary | e2e-ui | SCN-007-024 | `tests/provider-credentials.spec.mjs` | Existing central credential/settings boundary remains green after all owner publishers and Feature 007 adapters | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-05-08` |
| TP-05-09 | Broader Regression E2E | e2e-ui | SCN-007-015, 016, 017, 024 | `tests/technical-analysis-decision-lab.spec.mjs` | Execute the complete cumulative Feature 007 browser suite after every owner/adaptor focused title | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-05-09` |

### Definition of Done

#### Core Delivery Items

- [ ] Six owner pages publish exact nested `rl-ta-owner-read/v1` capability payloads from existing complete compute state with source/cutoff/truth/limitations intact and zero formula or UI change.
- [ ] Strategy Validation retains its existing rule, UI, generic publication, and Scope 01 shared-primitive parity; no Feature 007 validation passport is attributed to its fixed strategy.
- [ ] Feature 006 remains a read-only optional adapter: exact compatible evidence is consumed, every absent/mismatched state is unavailable, and no completion/certification claim is inferred.
- [ ] Option convention and snapshot coherence, missing-as-unavailable behavior, exact footprint/depth/large-trade requirements, and daily-only eligibility are enforced across all projections.
- [ ] Every owner Shared Infrastructure Impact Sweep, marker boundary, pre-edit ownership record, independent canary, and exact rollback is complete with zero excluded or Feature 005/006 edits.
- [ ] Every Scope 05 Test Plan row has intended RED and same-command GREEN evidence, with one owner completed and canaried before the next owner edit.

#### Test Evidence Items - Exact Parity With 9 Test Plan Rows

- [ ] TP-05-01 unit evidence proves all owner schemas, source/cutoff rules, option/microstructure states, Strategy Validation parity, and Feature 006 absence handling.
- [ ] TP-05-02 functional evidence proves exact marker/capability inventory and zero private-call/DOM-scrape contract drift.
- [ ] TP-05-03 Regression E2E evidence proves SCN-007-015 missing chain remains unavailable rather than neutral gamma.
- [ ] TP-05-04 Regression E2E evidence proves SCN-007-016 preserves one snapshot and dealer-sign convention for every derived result.
- [ ] TP-05-05 Regression E2E evidence proves SCN-007-017 exact tick/book requirements and no OHLCV proxy styling.
- [ ] TP-05-06 Regression E2E evidence proves SCN-007-024 retains a useful daily read and unavailable tactical state.
- [ ] TP-05-07 real-page owner-matrix evidence proves all seven existing integrations, six nested payloads, unchanged generic reads, and honest Feature 006 absence.
- [ ] TP-05-08 provider-credential browser evidence proves central credential ownership remains unchanged.
- [ ] TP-05-09 broader E2E evidence proves the cumulative Feature 007 suite passes after every focused owner/adaptor row.

#### Build Quality Gate

- [ ] Per-owner RED/GREEN records, path/hunk ownership, shared canaries, option convention audit, no-private-call/DOM-scrape/interception scan, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, plan sync, traceability, framework write guard, and provider boundary are current and clean with every finding accounted for.
