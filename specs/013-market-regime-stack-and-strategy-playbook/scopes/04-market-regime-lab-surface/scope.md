# SCOPE-4: Market Regime Lab surface

**Status:** Not Started
**Tags:** `overlay:true`, `ui:true`
**Depends On:** SCOPE-2, SCOPE-3

## Objective

Ship `./market-regime-lab.html` — the owning tool of the composer and the only surface that renders the full fingerprint. It carries the four Feature-012 views (Simple as the persisted default, Power, Brief, Journey) over a single compute pass, composes the 12 declared UI primitives once each, and gives every degraded state a designed rendering so nothing ever renders as a confident-looking blank or a zero.

## Implementation Files

| File | Change |
|---|---|
| `./market-regime-lab.html` | **New.** Single-file surface: Simple / Power / Brief / Journey views composing the 12 primitives once each. |

`./rlratio.js`, `./rlregime.js`, `./ratio-pairs.json`, and `./regime-archetypes.json` are consumed as delivered by SCOPE-1 and SCOPE-2. Registry registration is SCOPE-5. No protected surface is modified: `rlexperience.js`, `rljourney.js`, `rlcontracts.js`, the `rldata.js` cache schema, `data/**`, and `watchlist.json` are consumed as delivered.

## Gherkin Scenarios

### BS-013-003: An intraday facet changes tactical context without moving the structural quadrant

```gherkin
Scenario: A tactical dealer/auction facet is scoped to the tactical horizon only
  Given the structural quadrant is composed from structural-horizon facets
  And the intraday dealer/auction facet is declared at the tactical horizon
  When the tactical facet flips from "balanced-auction" to "trend-day"
  Then the tactical context section reflects the new tactical value
  And the structural quadrant value is unchanged
  And no structural facet has been recomputed or re-ranked by the tactical change
```

### BS-013-005: The growth-inflation quadrant renders as market-implied, never as a macro regime

```gherkin
Scenario: A sentiment-derived quadrant is labeled by its actual inputs
  Given the growth-inflation quadrant's only inputs are a Fear & Greed score and VIX
  When the quadrant is rendered on any surface
  Then it is labeled "market-implied"
  And it is not labeled a macro growth regime, an inflation regime, or an economic regime
  And its input attribution names the Fear & Greed score and VIX explicitly
```

### BS-013-017: Sleeve output ranks relative research fit and emits nothing else

```gherkin
Scenario: A sleeve ranking carries no weight, allocation, exposure, or direction
  Given the composed regime is available
  When the sleeve comparison is produced
  Then each sleeve carries an ordinal relative research-fit position and a rationale
  And each rationale names the specific facets that produced that position
  And no weight, allocation, exposure target, position size, or directional instruction appears in the output
```

### BS-013-018: Inflationary and disinflationary risk-off produce different bond sub-type fit

```gherkin
Scenario: Bond sub-type fit differs by the inflation character of the risk-off state
  Given a composed regime whose credit and curve facets indicate disinflationary risk-off
  When the bond sub-type fit is derived
  Then the resulting bond sub-type fit is recorded with its driving facets
  And given instead a composed regime indicating inflationary risk-off
  Then the bond sub-type fit differs from the disinflationary case
  And long nominal duration is not automatically favored in the inflationary case
```

### BS-013-019: Commodity sub-types stay separate rather than moving as one block

```gherkin
Scenario: Gold and industrial/energy commodities are ranked as distinct sub-types
  Given the composed regime is available
  When the commodity sleeve fit is produced
  Then gold appears as its own sub-type with its own rank and rationale
  And industrial/energy commodities appear as a separate sub-type with their own rank and rationale
  And the two sub-types are permitted to hold different relative positions in the same read
```

### BS-013-020: No clear relative advantage produces an explicit no-advantage state

```gherkin
Scenario: An indistinct regime refuses to force a sleeve ordering
  Given the composed regime resolves to "Mixed" with an active contradiction
  And no sleeve's rationale is distinguishable from another's on the available facets
  When the sleeve comparison is produced
  Then the result is an explicit "no relative advantage" state
  And no arbitrary or tie-broken ordering of sleeves is displayed
  And the reason names the facets that were indistinguishable
```

## Implementation Plan

1. **Shared shell load order.** Load `rldata.js` → `rlapp.js` → `rlnav.js`, with `rlg.js`, `rlchart.js`, `rlticker.js`, and `rlcontext.js` in their dependency order, then `rlratio.js` and `rlregime.js`.
2. **Four views through the standard control.** Ship Simple, Power, Brief, and Journey behind the standard `#rlviews` control, with Simple as the persisted default and a blank-proof fallback.
3. **Compute once.** All four views read one composed `CombinedRegime` plus one ordered sleeve-fit list. A horizon-selector or lever change recomputes through a single `render()` call and never refetches.
4. **Cache-first auto-hydrate.** First paint reads the `rlData` cache before any network work, then fetches only the missing/stale delta and re-renders. No Fetch/Refresh click is a precondition for content, and no empty shell or persistent bare loading state survives into the first paint. All first-paint numeric guards use `Number.isFinite`.
5. **Horizon lane separation.** Structural, swing, and tactical lanes are structurally separated in the layout so a tactical flip cannot read as a structural change: the tactical lane text changes while the structural lane verdict text and its confirmation count render identically, and no tactical reading appears inside, above, or as a modifier of the structural lane.
6. **Growth-inflation quadrant.** The literal `market-implied` qualifier renders inline on the quadrant label itself, not in a footnote, caption, or tooltip. No wording presenting the quadrant as an observed macro regime is rendered.
7. **Sleeve-fit list.** Each row renders an ordinal relative rank, a rationale naming the specific driving facets, and an invalidation condition. No weight, allocation, exposure, position size, target, or direction renders as text, as a number, or as a bar length. Bond sub-types reorder visibly between inflationary and disinflationary risk-off and stay individually named; energy, metals, and agriculture render as separate rows rather than one merged commodities row. A flat fixture renders the explicit no-advantage state in place of the list, with no forced ranking and no empty region.
8. **Designed degraded states.** Author the rendering for `unavailable` facets (reason plus what-would-resolve), the shrunken confirmation denominator rendered inline, a fully-`unavailable` owner read, `not-comparable` international pairs, and the no-advantage sleeve state. Contradictions render as first-class disagreement blocks, never as resolved verdicts or dismissible warnings.
9. **The 12 primitives, once each.** Author `RegimeVerdictHeader`, `FacetRow`, `HorizonLane`, `ConfirmationDenominator`, `ContradictionCallout`, `RatioPairRow`, `SleeveFitRow`, `DataTruthBand`, `ProvenanceLine`, `UnavailableDetail`, `ContextualTooltip`, and `TickerLink` each as a single named render function used by at least two views. A per-screen copy of any primitive is a defect.
10. **Adjacent declared windows.** Every z-score and window-relative percentile renders its declared window as visible adjacent text with the direction convention on the same row, so the value stays readable with tooltips suppressed.
11. **Canvas rendering.** Power canvases draw synchronously from `render()` because animation frames do not fire in hidden tabs; redraw on resize and on view activation, never draw while a view is inactive, and register the `RLCHART.attach` hit-test closure in the same pass so every chart carries a hover tooltip.
12. **Tooltips and ticker links.** Every term, KPI, badge, chart, axis, and value carries a two-part contextual tooltip stating what it is and what the current reading means. Every ticker renders through the shared ticker helper; a bare ticker is a defect.
13. **Mobile Simple.** At a 375px viewport the three lanes stack in the fixed structural → swing → tactical order with lane labels and per-lane counts preserved, the confirmation denominator and its shrink clause render as wrapped text lines rather than a ring or gauge, and the body gains no horizontal scroll.
14. **Journey and Brief view frames.** The Journey view is `noExecution: true` with a completion packet carrying an inseparable no-execution disclaimer. The Brief view renders the owner-read verdict block read-only, with the corroborated-cited body and the explicit refusal state authored as two distinct rendered states.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | E2E UI | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `UX-M-03 tactical facet change leaves the structural lane visually unchanged` | **BS-013-003: An intraday facet changes tactical context without moving the structural quadrant** — matrix row **UX-M-03**: flipping an intraday/tactical facet changes the tactical lane text while the structural lane verdict text and its lane confirmation count render identically, and no tactical reading appears inside, above, or as a modifier of the structural lane. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-02 | E2E UI | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `UX-M-06 growth-inflation quadrant carries the literal market-implied qualifier inline` | **BS-013-005: The growth-inflation quadrant renders as market-implied, never as a macro regime** — matrix row **UX-M-06**: the literal `market-implied` qualifier renders inline on the quadrant label itself rather than in a footnote, caption, or tooltip, and no wording presenting the quadrant as an observed macro regime is rendered. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-03 | E2E UI | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `UX-M-09 sleeve row shows rank, rationale, and invalidation and carries no allocation token` | **BS-013-017: Sleeve output ranks relative research fit and emits nothing else** — matrix row **UX-M-09**: each sleeve row renders an ordinal relative rank, a rationale naming the driving facets, and an invalidation condition; no weight, allocation, exposure, position size, target, or direction renders as text, as a number, or as a bar length. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-04 | E2E UI | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `UX-M-10 inflationary versus disinflationary risk-off reorder bond sub-types visibly` | **BS-013-018: Inflationary and disinflationary risk-off produce different bond sub-type fit** — matrix row **UX-M-10**: the bond sub-type rows reorder visibly between the inflationary and disinflationary risk-off fixtures and stay individually named rather than collapsing into one bond row. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-05 | E2E UI | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `UX-M-24 commodity sub-types render as separate rows and never as one merged block` | **BS-013-019: Commodity sub-types stay separate rather than moving as one block** — matrix row **UX-M-24**: energy, metals, and agriculture render as separate individually-named sleeve rows rather than one merged commodities row. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-06 | E2E UI | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `UX-M-11 a flat fixture renders the explicit no-advantage state with no forced ranking` | **BS-013-020: No clear relative advantage produces an explicit no-advantage state** — matrix row **UX-M-11**: a flat fixture renders the explicit no-advantage state in place of the sleeve list, with no forced `1..n` ordering and no empty region. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-07 | E2E UI | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `UX-M-16 mobile Simple stacks the three lanes at 375px and the body gains no horizontal scroll` | Matrix row **UX-M-16**: at a 375px viewport all four views (Simple, Power, Brief, Journey) render with the three lanes stacked in the fixed structural → swing → tactical order, lane labels and per-lane counts preserved, the confirmation denominator and its shrink clause rendered as wrapped text lines rather than a ring or gauge, and the document body gains no horizontal scroll. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-08 | UI Unit | `ui-unit` | `scripts/selftest.mjs` group `regime-primitives` / `each of the 12 regime primitives renders a typed degraded state with a reason and is composed by at least two views` | Each of `RegimeVerdictHeader`, `FacetRow`, `HorizonLane`, `ConfirmationDenominator`, `ContradictionCallout`, `RatioPairRow`, `SleeveFitRow`, `DataTruthBand`, `ProvenanceLine`, `UnavailableDetail`, `ContextualTooltip`, and `TickerLink` given an `unavailable` / `not-comparable` / `Mixed` / `Unresolved` input produces the typed rendering with a reason and a total reason → resolution mapping — never a zero, dash, neutral, or empty cell — and each primitive is a single named render function composed by at least two views. | `node scripts/selftest.mjs` | No |
| TP-04-09 | Stress | `stress` | `tests/market-regime-lab.stress.spec.mjs` / `market-regime-lab holds one compute per render under rapid lever and view churn` | Rapid lever and view toggling across the maximum declared pair set and facet set: one compute per `render()` holds under churn, a view switch triggers no refetch, no unhandled rejection or frozen paint occurs, and canvas redraw stays correct across resize and hidden → visible transitions. | `npx --no-install playwright test tests/market-regime-lab.stress.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-10 | E2E UI | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `UX-M-02 non-enumerated combination shows a fingerprint and never an invented archetype name` | **ADVERSARIAL RED-bite** — let a non-enumerated facet combination render an archetype name in the verdict header (nearest-neighbour, majority-vote, or generated). The named test `UX-M-02 non-enumerated combination shows a fingerprint and never an invented archetype name` MUST fail under that mutation and MUST pass against the delivered surface, which renders the fingerprint string plus the literal `Mixed` or `Unresolved` with the unresolved facet pair named. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-11 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the `regime-primitives` group extended by this scope | Broad-suite regression: the full selftest suite stays green with the surface's primitive assertions added, every pre-existing group (including the SCOPE-1, SCOPE-2, and SCOPE-3 groups) is preserved byte-for-byte, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |
| TP-04-12 | E2E UI | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `UX-M-06b a sentiment-derived quadrant is labeled by its actual inputs` | **BS-013-005: A sentiment-derived quadrant is labeled by its actual inputs** — the growth-inflation quadrant whose only inputs are a Fear & Greed score and VIX is labeled `market-implied`, is not labeled a macro growth regime, an inflation regime, or an economic regime, and its rendered input attribution names the Fear & Greed score and VIX explicitly on every surface that renders the quadrant. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-04-13 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-005 and BS-013-020 the quadrant renders market-implied and no relative advantage renders an explicit no-advantage state` | Persistent scenario-specific regression coverage for this scope's surface behavior: a permanently registered case in the feature's real-page regression spec re-asserts that the growth-inflation quadrant renders as market-implied rather than as a macro regime, and that an absent relative advantage renders the explicit no-advantage state instead of a ranked sleeve list. A re-introduced macro-regime label or a fabricated ranking fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Items

- [ ] `[TP-04-01]` `[BS-013-003]` `[UX-M-03]` A tactical dealer/auction facet is scoped to the tactical horizon only: when the tactical facet flips from `balanced-auction` to `trend-day` the tactical context section reflects the new tactical value, the structural quadrant value is unchanged with its lane verdict text and confirmation count rendering identically, and no structural facet has been recomputed or re-ranked by the tactical change.
- [ ] `[TP-04-02]` `[BS-013-005]` `[UX-M-06]` The literal `market-implied` qualifier renders inline on the growth-inflation quadrant label, with no observed-macro-regime wording anywhere.
- [ ] `[TP-04-03]` `[BS-013-017]` `[UX-M-09]` Each sleeve row renders ordinal rank, facet-naming rationale, and an invalidation condition, and no allocation, weight, exposure, target, position-size, or direction token renders as text, number, or bar length.
- [ ] `[TP-04-04]` `[BS-013-018]` `[UX-M-10]` Bond sub-type fit differs by the inflation character of the risk-off state: the disinflationary risk-off bond sub-type fit is recorded with its driving facets, the inflationary risk-off bond sub-type fit differs from the disinflationary case, long nominal duration is not automatically favored in the inflationary case, and the bond sub-type rows reorder visibly while staying individually named.
- [ ] `[TP-04-05]` `[BS-013-019]` `[UX-M-24]` Gold and industrial/energy commodities are ranked as distinct sub-types: gold appears as its own sub-type with its own rank and rationale, industrial/energy commodities appear as a separate sub-type with their own rank and rationale, the two sub-types are permitted to hold different relative positions in the same read, and energy, metals, and agriculture render as separate individually-named rows rather than one merged commodities row.
- [ ] `[TP-04-06]` `[BS-013-020]` `[UX-M-11]` An indistinct regime refuses to force a sleeve ordering: a composed regime resolving to `Mixed` with an active contradiction and no sleeve rationale distinguishable from another's produces an explicit `no relative advantage` state, no arbitrary or tie-broken ordering of sleeves is displayed, the reason names the facets that were indistinguishable, and no empty region is rendered.
- [ ] `[TP-04-07]` `[UX-M-16]` All four views (Simple, Power, Brief, Journey) render at a 375px viewport with the three lanes stacked structural → swing → tactical, labels and per-lane counts preserved, and the document body gains no horizontal scroll.
- [ ] `[TP-04-08]` Each of the 12 named primitives is authored once, composed by at least two views, and renders a typed degraded state carrying a reason with a total reason → resolution mapping.
- [ ] `[TP-04-09]` Rapid lever and view churn holds one compute per `render()`, triggers no refetch on view switch, produces no unhandled rejection or frozen paint, and keeps canvas redraw correct across resize and hidden → visible transitions.
- [ ] `[TP-04-10]` The adversarial invented-archetype-name mutation makes the named `UX-M-02` assertion fail before the delivered surface and pass after it.
- [ ] `[TP-04-11]` The complete selftest suite stays green with the surface's primitive assertions added, every pre-existing group preserved and no decreased passing count.
- [ ] `[TP-04-12]` `[BS-013-005]` `[UX-M-06]` A sentiment-derived quadrant is labeled by its actual inputs: the growth-inflation quadrant whose only inputs are a Fear & Greed score and VIX is labeled `market-implied`, is not labeled a macro growth regime, an inflation regime, or an economic regime, and its input attribution names the Fear & Greed score and VIX explicitly.
- [ ] `[BS-013-003]` `[BS-013-005]` First paint is cache-first and auto-hydrating: the `rlData` cache is read before any network work, no Fetch/Refresh control is a precondition for content, and no empty shell or bare loading state survives into the first painted frame.
- [ ] `[BS-013-017]` `[BS-013-020]` Every degraded state has a designed rendering — `unavailable` facets show reason plus what-would-resolve, the shrunken confirmation denominator renders inline, a fully-`unavailable` owner read and `not-comparable` international pairs render their typed states, and contradictions render as first-class disagreement blocks that are never resolved verdicts or dismissible warnings.
- [ ] `[BS-013-005]` `./market-regime-lab.html` carries no default value, no fallback path, and no stub: no protected surface is modified, no request interception appears in any live-stack spec, and no silent-pass bailout appears inside a required scenario.
- [ ] `[BS-013-001]` Identical frozen cache input at an identical `decisionTime` renders identical text in all four views across repeated loads.
- [ ] `[BS-013-003]` Every numeric guard in new code uses `Number.isFinite`; the global `isFinite` appears zero times in `./market-regime-lab.html`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-04-13]` the feature's real-page regression spec holds a permanently registered case asserting that the growth-inflation quadrant renders as market-implied rather than as a macro regime and that an absent relative advantage renders the explicit no-advantage state.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
