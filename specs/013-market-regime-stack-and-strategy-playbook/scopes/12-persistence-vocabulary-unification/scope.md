# SCOPE-12: Persistence vocabulary unification

**Status:** Not Started
**Tags:** `overlay:true`
**Depends On:** SCOPE-2, SCOPE-3
**Primary Outcome:** Exactly one declared closed persistence vocabulary binds every surface, contract, and published read, and an out-of-vocabulary value is refused rather than mapped.

## Objective

Close BS-013-028. At least three divergent persistence vocabularies coexist in the specification today — the `unavailable → computed → persistent` lifecycle wording, the `candidate` / `confirmed` / `fading` / `transitioned` transition set, and the `forming` / `persistent` / `fading` values in the `FacetRow` contract. A reader cannot tell whether `persistent` in one place means the same state as `confirmed` in another. This scope declares exactly one closed persistence vocabulary, binds every surface, contract, and published read to it, and refuses any value drawn from another vocabulary instead of silently mapping, aliasing, or coercing it.

## Implementation Files

| File | Change |
|---|---|
| `./rlregime.js` | Declare the single closed persistence vocabulary as the one enumerated member set. Bind the persistence gate, the transition record, the `FacetRow` contract, and the owner read to it. Refuse an out-of-vocabulary value with the declared reason rather than mapping it. |
| `./market-regime-lab.html` | Every rendered persistence state across the Simple, Power, Brief, and Journey views reads from the one vocabulary; no view carries a second persistence word set. |
| `sector-research-lab.html`, `market-heatmap-lab.html`, `bond-regime-lab.html`, `volatility-sizing-lab.html`, `gamma-trading-lab.html`, `options-structure-lab.html`, `real-assets-lab.html`, `global-rotation-lab.html`, `trend-dynamics-cycle-lab.html` | Publication-shim edit only, within the bound SCOPE-3 already authorizes: the published `RegimeFacetContract` reading carries a persistence value drawn from the one declared vocabulary through the declared versioned `valueVocabularyId` mapping. |
| `scripts/brief-refresh.mjs` | The deterministic `DERIVED` owner-read adapter emits persistence values from the one vocabulary, identically to the browser publication. |
| `scripts/selftest.mjs` | Extend the `rlregime` and `regime-primitives` groups with the closed-membership, refusal, and adversarial second-vocabulary assertions. |

No path outside `design.md` → `## Implementation Boundary` is touched.

## Gherkin Scenarios

### BS-013-028: Persistence is expressed in exactly one declared closed vocabulary

```gherkin
Scenario: A persistence value outside the single declared vocabulary is refused
  Given the specification declares exactly one closed persistence vocabulary
  And every surface, contract, and published read is bound to that one vocabulary
  When a facet, transition record, or published read carries a persistence value
  Then the value is a member of the declared closed vocabulary
  And a value drawn from any other persistence vocabulary is refused with the reason
    "persistence value outside the declared closed vocabulary"
  And the refused value is not silently mapped, aliased, or coerced into a member of the
    declared vocabulary
  And any second persistence vocabulary found in the specification or in any surface is
    reported as a vocabulary-divergence defect
```

## Consumer Impact Sweep

This scope replaces three divergent persistence word sets with one closed vocabulary, so every producer of a persistence value and every reader that binds to a persistence word is a consumer of the contract unified here. A stale-reference scan must return zero remaining first-party references to a persistence value outside the declared vocabulary.

| Consumer surface | Path | What the unified vocabulary changes for it |
| --- | --- | --- |
| Composer persistence gate | `./rlregime.js` | The gate's own state names become the declared vocabulary members rather than a locally chosen lifecycle word set. |
| Transition record | `./rlregime.js` transition record | Its `candidate` / `confirmed` / `fading` / `transitioned` word set stops being an independent vocabulary and binds to the one declared member set. |
| `FacetRow` contract | `./rlregime.js` `FacetRow` | Its `forming` / `persistent` / `fading` values stop being a third vocabulary and bind to the one declared member set. |
| Lab surface | `./market-regime-lab.html` | Every persistence label across the four views reads the one vocabulary; no view holds its own persistence words. |
| Tier 1 publication shims | the nine facet-source `*.html` hosts | Each published `RegimeFacetContract` reading carries a declared-vocabulary persistence value through the versioned `valueVocabularyId` mapping SCOPE-3 delivers. |
| Headless owner read | `scripts/brief-refresh.mjs` | The deterministic `DERIVED` adapter emits the same vocabulary as the browser publication, so the byte-identical claim survives. |
| Payload validator | `scripts/validate-brief-payload.mjs` | Asserts the published read's persistence value is a declared-vocabulary member. |
| Handoff doc | `notes/market-regime-lab.md` | Documents the one vocabulary and names no alternative persistence word set. |

Stale-reference scan surface: every persistence word occurrence across `*.html`, `*.js`, `*.mjs`, `notes/**`, and the registry JSON files, plus the specification's own persistence wording.

## Implementation Plan

1. **One declared vocabulary.** Declare exactly one closed persistence member set in the composer. The declaration is enumerated; membership is decided by exact match against it and by nothing else.
2. **Bind every producer.** The persistence gate, the transition record, the `FacetRow` contract, the published owner read, and the headless `DERIVED` adapter all read their state names from that one declaration rather than holding local word sets.
3. **Refuse, never map.** A value outside the declaration is refused with the reason `persistence value outside the declared closed vocabulary`. There is no alias table, no coercion, no nearest-member match, and no default member.
4. **Shim mapping.** A facet source retaining a legacy persistence word maps it through the declared versioned `valueVocabularyId` mapping SCOPE-3 delivers — lossless, or lossy with the loss declared. A silent re-label is a defect.
5. **Divergence detection.** A second persistence vocabulary appearing in the specification or in any surface is reported as a vocabulary-divergence defect rather than tolerated.
6. **Refusal shape.** A refused persistence value resolves to a typed state carrying its reason code and a what-would-resolve statement. No blank, dash, or neutral persistence value is produced in its place.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-12-01 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime` / `exactly one closed persistence vocabulary is declared and membership is decided by exact match` | The declaration is a single enumerated member set; membership is exact-match only, with no alias table, no nearest-member match, and no default member. | `node scripts/selftest.mjs` | No |
| TP-12-02 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime` / `a persistence value outside the declared vocabulary is refused and is not mapped, aliased, or coerced` | **BS-013-028: A persistence value outside the single declared vocabulary is refused** — an out-of-vocabulary value is refused with the reason `persistence value outside the declared closed vocabulary`, and the refused value never appears mapped into a declared member. | `node scripts/selftest.mjs` | No |
| TP-12-03 | Integration | `integration` | `scripts/selftest.mjs` group `regime-primitives` / `the persistence gate, transition record, FacetRow contract, and published owner read all draw from the one declaration` | Every producer resolves its persistence state names from the single declaration rather than a local word set, so the gate, the transition record, the `FacetRow` contract, and the published read agree member-for-member. | `node scripts/selftest.mjs` | No |
| TP-12-04 | Functional | `functional` | `scripts/selftest.mjs` group `regime-primitives` / `a second persistence vocabulary in any surface is reported as a vocabulary-divergence defect` | **ADVERSARIAL RED-bite** — a fixture reintroduces a `candidate` / `confirmed` / `fading` / `transitioned` word set alongside the declaration. The named test MUST fail under that fixture and MUST pass against the unified delivery. | `node scripts/selftest.mjs` | No |
| TP-12-05 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-028 every rendered persistence state is a declared-vocabulary member across all four views` | Persistent scenario-specific regression coverage on the real page: every persistence label rendered across the Simple, Power, Brief, and Journey views is a member of the one declared vocabulary, and no second persistence word set appears in the rendered text. A reintroduced alternative word fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| TP-12-06 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the extended `rlregime` and `regime-primitives` groups | Broad-suite regression: the full selftest suite stays green with the unified vocabulary bound across every producer, the SCOPE-2 persistence-gate assertions and the SCOPE-3 vocabulary-mapping assertions still pass, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |

### Definition of Done

#### Core Items

- [ ] `[TP-12-01]` `[BS-013-028]` Exactly one closed persistence vocabulary is declared and membership is decided by exact match, with no alias table, nearest-member match, or default member.
- [ ] `[TP-12-02]` `[BS-013-028]` An out-of-vocabulary persistence value is refused with the reason `persistence value outside the declared closed vocabulary` and is never mapped, aliased, or coerced into a declared member.
- [ ] `[TP-12-03]` `[BS-013-028]` The persistence gate, transition record, `FacetRow` contract, and published owner read all draw their state names from the one declaration and agree member-for-member.
- [ ] `[TP-12-04]` `[BS-013-028]` The adversarial second-vocabulary fixture is reported as a vocabulary-divergence defect and fails the named test before the unified delivery and passes after it.
- [ ] `[TP-12-06]` The complete selftest suite stays green with the unified vocabulary, the SCOPE-2 persistence-gate and SCOPE-3 vocabulary-mapping assertions preserved and no decreased passing count.
- [ ] `[BS-013-028]` A refused persistence value resolves to a typed state carrying a reason code and a what-would-resolve statement; no blank, dash, or neutral persistence value is produced in its place.
- [ ] `[BS-013-028]` The delivery carries no alias table, no coercion path, no default member, and no stub; no path outside `design.md` → `## Implementation Boundary` is modified.
- [ ] `[BS-013-028]` Publishing the same frozen facet set twice produces identical persistence values in the browser publication and in the headless `DERIVED` owner read.
- [ ] Consumer impact sweep is completed for every consumer surface enumerated in this scope's `## Consumer Impact Sweep` section, and zero stale first-party references to an out-of-vocabulary persistence value remain across `*.html`, `*.js`, `*.mjs`, `notes/**`, and the registry JSON files.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-12-05]` `[BS-013-028]` the feature's real-page regression spec holds a permanently registered case asserting that every persistence label rendered across the Simple, Power, Brief, and Journey views is a member of the one declared vocabulary and that no second persistence word set appears in the rendered text.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
