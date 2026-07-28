# SCOPE-9: Contradiction comparand semantics

**Status:** Not Started
**Tags:** `overlay:true`
**Depends On:** SCOPE-2
**Primary Outcome:** A contradiction is recorded only between matched comparands, a mismatch is reported as divergence, and no lane silently wins the headline archetype.

## Objective

Close BS-013-025. Today the composer can record a contradiction between two facets that are not comparable — different facet kind, different horizon class, different as-of cutoff — and surface language asserts that the headline "reflects the structural lane", which is precedence-based resolution that BP-6 forbids. This scope makes the comparand-matching predicate explicit: a contradiction record is emitted only when subject, facet kind, horizon class, and as-of cutoff all match; every other disagreement is typed as a divergence carrying its mismatch reason; and the headline archetype adopts no facet value by lane precedence.

## Implementation Files

| File | Change |
|---|---|
| `./rlregime.js` | Add the comparand-matching predicate that gates contradiction records on matched subject, facet kind, horizon class, and as-of cutoff. Emit a typed divergence record with its mismatch reason for every unmatched disagreement. Remove any lane-precedence path from headline archetype selection. |
| `./market-regime-lab.html` | Render divergence and contradiction as two distinct, separately labeled states, and carry no statement that the headline reflects the structural lane or any other lane. |
| `scripts/selftest.mjs` | Extend the `rlregime-compose` group with the comparand-matching assertions, the divergence-reason assertion, and the adversarial no-precedence assertion. |

No path outside `design.md` → `## Implementation Boundary` is touched.

## Gherkin Scenarios

### BS-013-025: A contradiction requires matched comparands and no lane silently wins the headline

```gherkin
Scenario: Mismatched facets report as divergence, not as a contradiction
  Given the trend-structure facet reads "risk-on" at the structural horizon
  And the dealer/auction facet reads "trend-day" at the tactical horizon
  And the two facets differ in facet kind and in horizon class
  When the system composes the combined regime
  Then the pair is reported as a divergence with the reason "different facet kind and horizon"
  And it is not recorded as a contradiction
  And a contradiction record is emitted only when subject, facet kind, horizon class, and
    as-of cutoff all match between the two facets
  And the headline archetype does not adopt either facet's value by lane precedence
  And any surface stating that the headline reflects the structural lane is reported as a
    precedence rule that violates BP-6
```

## Consumer Impact Sweep

This scope replaces a single undifferentiated contradiction concept with a gated contradiction record plus a typed divergence record, and it removes the lane-precedence path from headline archetype selection together with every surface statement that the headline reflects the structural lane. Every producer of a disagreement record, and every first-party reader that binds to the published disagreement shape or to the headline archetype, is a consumer of the contract changed here. A stale-reference scan must return zero remaining first-party references to lane precedence and zero readers still binding to contradiction as the only disagreement state.

| Consumer surface | Path | What the comparand-gated contract changes for it |
| --- | --- | --- |
| Composer disagreement contract | `./rlregime.js` `composeRegime` | The single contradiction concept is replaced by a comparand-gated contradiction record plus a typed divergence record, so a reader binding only to the contradiction list must also read the divergence list. |
| Headline archetype selection | `./rlregime.js` headline resolution | The lane-precedence path is removed; headline selection reads the enumerated archetype registry alone and the composer carries no lane, tier, or horizon ordering. |
| Archetype registry | `./regime-archetypes.json` | Becomes the sole origin of headline resolution once precedence is gone; no registry entry may encode a lane rank. |
| Lab surface disagreement labels | `./market-regime-lab.html` | Divergence and contradiction render as two separately labeled states, and no view retains the statement that the headline reflects the structural lane. |
| Per-tool published read | `./rlregime.js` owner read written into the Tier 0 shared cache | The published read carries the divergence record alongside the contradiction record, so every downstream reader of that cache entry sees both states. |
| Headless owner read | `scripts/brief-refresh.mjs` | The deterministic `DERIVED` adapter emits the same gated contradiction and typed divergence records as the browser publication, and its per-tool deep link must keep resolving. |
| Per-tool read overlay | `rlbrief.js`, `market-brief.html` | Both surface the owning tool's published read on each render, so the disagreement shape they display changes with this contract. |
| Payload validator | `scripts/validate-brief-payload.mjs` | Asserts the published read's shape, so it must accept the divergence record rather than a contradiction list alone. |
| Distributed publisher | `scripts/brief-distributed-publish.mjs` | Resolves a per-tool deep link from the registry for the published read, so that deep link must keep resolving unchanged. |
| Registry, navigation, and landing inventory | `tools.json`, `rlnav.js` `TOOLS`, `index.html` `TOOLS` | The navigation entries and landing-page deep link targets keyed by the lab's tool id must continue to resolve with no dead entry and no silent redirect. |
| Handoff doc | `notes/market-regime-lab.md` | Documents divergence and contradiction as two distinct states and carries no lane-precedence claim. |

Stale-reference scan surface: every navigation entry in `rlnav.js` `TOOLS` and `index.html` `TOOLS`, every landing-page deep link, every per-tool deep link emitted by the headless readers, every in-page redirect, plus every remaining textual reference to lane precedence or to contradiction as the only disagreement state across `*.html`, `*.js`, `*.mjs`, `notes/**`, and the registry JSON files.

## Implementation Plan

1. **Comparand tuple.** Define the comparand tuple as `(subject, facetKind, horizonClass, asOfCutoff)`. Two facet readings are comparable only when all four members are equal. The tuple is read from the `RegimeFacetContract` fields SCOPE-2 already delivers; no new facet field is introduced.
2. **Contradiction gate.** `composeRegime` emits a contradiction record only for a pair whose comparand tuples are equal and whose values conflict. A pair that fails the comparability predicate can never reach the contradiction path.
3. **Divergence record.** Every disagreement between non-comparable readings emits a typed divergence record naming which comparand members differed, so `different facet kind and horizon` is a produced reason string rather than prose written on a surface.
4. **No lane precedence.** Headline archetype selection reads the enumerated archetype registry only. Any code path that would adopt a facet value because of its lane, tier, or horizon rank is removed, and the composer carries no lane ordering.
5. **Surface language.** The lab surface labels divergence and contradiction distinctly and states neither that the headline reflects the structural lane nor any equivalent precedence claim. A retained precedence statement is reported as a BP-6 violation rather than rendered.
6. **Refusal shape.** A pair that cannot be classified resolves to a typed state carrying a reason code and a what-would-resolve statement. No blank, dash, zero, or neutral disagreement value is produced.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-09-01 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime-compose` / `two facets differing in facet kind or horizon class report as divergence and never as a contradiction` | **BS-013-025: A contradiction requires matched comparands** — a trend-structure structural-horizon reading and a dealer/auction tactical-horizon reading compose to a divergence record, and the contradiction list stays empty for that pair. | `node scripts/selftest.mjs` | No |
| TP-09-02 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime-compose` / `the divergence record names which comparand members differed` | The emitted divergence carries the reason `different facet kind and horizon` derived from the comparand tuple rather than from surface prose, and a pair differing only in as-of cutoff names that member instead. | `node scripts/selftest.mjs` | No |
| TP-09-03 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `a contradiction record is emitted only when subject, facet kind, horizon class, and as-of cutoff all match` | Positive path: two readings sharing all four comparand members with conflicting values produce exactly one contradiction record; changing any single member moves the same pair to the divergence path. | `node scripts/selftest.mjs` | No |
| TP-09-04 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `the headline archetype adopts no facet value by lane precedence` | **ADVERSARIAL RED-bite** — a fixture supplies a structural-lane facet and a tactical-lane facet whose values disagree, then asserts the headline archetype resolves from the enumerated registry alone. Reintroducing any lane, tier, or horizon precedence ordering into headline selection MUST fail this named test. | `node scripts/selftest.mjs` | No |
| TP-09-05 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-025 divergence and contradiction render distinctly and no surface claims structural-lane precedence` | Persistent scenario-specific regression coverage on the real page: divergence and contradiction render as two separately labeled states, and the rendered text contains no statement that the headline reflects the structural lane or any other lane. A reintroduced precedence claim fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| TP-09-06 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the extended `rlregime-compose` group | Broad-suite regression: the full selftest suite stays green with the comparand assertions added, every pre-existing group is preserved byte-for-byte, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |

### Definition of Done

#### Core Items

- [ ] `[TP-09-01]` `[TP-09-02]` `[BS-013-025]` Mismatched facets report as divergence, not as a contradiction: two facets differing in facet kind and in horizon class report as a divergence carrying the reason `different facet kind and horizon`, the pair is never recorded as a contradiction, and any surface stating that the headline reflects the structural lane is reported as a precedence rule that violates BP-6.
- [ ] `[TP-09-01]` `[BS-013-025]` A trend-structure reading at the structural horizon and a dealer/auction reading at the tactical horizon compose to a divergence record and are not recorded as a contradiction.
- [ ] `[TP-09-02]` `[BS-013-025]` The divergence record carries the reason `different facet kind and horizon` produced from the comparand tuple, and a cutoff-only mismatch names the as-of cutoff member instead.
- [ ] `[TP-09-03]` `[BS-013-025]` A contradiction record is emitted only when subject, facet kind, horizon class, and as-of cutoff all match; changing any one member moves the pair to the divergence path.
- [ ] `[TP-09-04]` `[BS-013-025]` The adversarial disagreeing-lane fixture proves the headline archetype adopts no facet value by lane precedence and resolves from the enumerated registry alone.
- [ ] `[TP-09-06]` The complete selftest suite stays green with the extended `rlregime-compose` group, every pre-existing group preserved and no decreased passing count.
- [ ] `[BS-013-025]` A pair that cannot be classified resolves to a typed state carrying a reason code and a what-would-resolve statement; no blank, dash, zero, or neutral disagreement value is produced in its place.
- [ ] `[BS-013-025]` The composer holds no lane ordering, no default winner, no fallback precedence path, and no stub; no path outside `design.md` → `## Implementation Boundary` is modified.
- [ ] `[BS-013-025]` Composing the same frozen facet set twice produces identical divergence and contradiction records in identical order.
- [ ] Every numeric guard in new code uses `Number.isFinite`; the global `isFinite` appears zero times in the composer and selftest-group code added by this scope.
- [ ] Consumer impact sweep is completed for every consumer surface enumerated in this scope's `## Consumer Impact Sweep` section, and zero stale first-party references remain to lane precedence or to contradiction as the only disagreement state across navigation entries, landing-page deep links, per-tool deep links, in-page redirects, `*.html`, `*.js`, `*.mjs`, `notes/**`, and the registry JSON files.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-09-05]` `[BS-013-025]` the feature's real-page regression spec holds a permanently registered case asserting that divergence and contradiction render as two separately labeled states and that the rendered text carries no statement that the headline reflects the structural lane or any other lane.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
