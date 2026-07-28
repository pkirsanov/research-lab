# SCOPE-3: Facet source publication shims

**Status:** Not Started
**Tags:** `overlay:true`, `tier:1`
**Depends On:** SCOPE-2

## Objective

Turn each Tier 1 owner tool into a publication-only facet source. A shim reads its tool's already-computed frozen model output, maps it into a `RegimeFacetContract` reading through an explicit declared vocabulary mapping, stamps `asOf`, `sourceAttribution`, and `coverageNote`, and writes it into the Tier 0 shared-cache facet slot. A shim fetches nothing new and imports no Tier 2 module, so the dependency direction stays one-way and the no-cycle rule is provable.

## Implementation Files

| File | Change |
|---|---|
| `rlratio.js` | Consumed as delivered by SCOPE-1 for the ratio-derived facet sources (credit-quality pulse, real-assets, global-rotation, FX dollar pairs). |
| `rlregime.js` | The `RegimeFacetContract` publish-side shape is consumed as delivered by SCOPE-2; this scope adds the no-cycle lint assertion path. |
| `ratio-pairs.json` | Ratio pairs declared by a facet source are registered here alongside the SCOPE-1 entries. |
| `scripts/selftest.mjs` | Add the `regime-primitives` group covering facet publication shape and the IP-002 no-cycle assertion. |

No path outside `design.md` → `## Implementation Boundary` is touched. Protected surfaces — including the `rldata.js` cache schema — are consumed through the existing append API and are not modified.

## Gherkin Scenarios

### BS-013-010: A facet source publishes its facet and never consumes the composed regime

```gherkin
Scenario: A facet source's model computation contains no read of the composed regime
  Given the breadth-participation facet source computes its own facet value
  When the facet source's model computation path is inspected
  Then it reads only its own inputs and publishes its facet value
  And it performs no read of the composed regime inside that computation
  And any such compute-side read is reported as a facet DAG cycle defect
```

## Implementation Plan

1. **Publication-only contract.** Each shim reads its owner tool's frozen model output, performs no new fetching, and writes exactly one `RegimeFacetContract` reading per facet it owns, stamped with `asOf`, `sourceAttribution`, and `coverageNote`.
2. **Explicit vocabulary mapping.** Every retained legacy vocabulary maps into the facet vocabulary through a declared, versioned mapping keyed by `valueVocabularyId` — lossless, or lossy with the loss declared. A silent re-label is a defect.
3. **Per-source facets.**
   - **sector** — breadth-participation and trend-structure facets from the existing sector model.
   - **heatmap** — breadth-participation facet over the constituent grid.
   - **bond** — three separately identifiable facets, `credit`, `curve`, and `duration-posture`, never blended into one score, because inflationary and disinflationary risk-off imply opposite bond consequences. Consumes `RLRATIO` for its credit-quality pulse pair.
   - **volatility** — publishes strictly `kind: 'volatility-magnitude'`, typed so the composer rejects it wherever a directional regime is expected.
   - **options / gamma** — volatility-magnitude and positioning-context facets.
   - **real-assets** — `ratio-derived` facets over `RLRATIO` pairs carrying the proxy caveat.
   - **global-rotation** — `ratio-derived` facets for international pairs, emitting `not-comparable` where the pair fails the comparability predicate.
   - **fx** — `ratio-derived` dollar facets via the FX source plus `RLRATIO`.
   - **trend-dynamics** — trend-structure facet with an explicit declared mapping from its existing vocabulary.
4. **No-cycle lint.** Add the IP-002 assertion that no facet source imports a Tier 2 module and that no facet declares the composed regime as an input. A fixture containing a source-side cycle resolves to an explicit lint-failure state rather than a value.
5. **Provenance.** Each published facet carries the producing source and the composer version it targets, so a downstream provenance line can name the producing facet source without ever naming the composed regime as a facet input.
6. **Shared-cache write path.** Writes go through the existing `rldata.js` append API into the Tier 0 facet slot. The cache schema itself is protected and is not changed.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Functional | `functional` | `scripts/selftest.mjs` group `regime-primitives` / `facet sources publish exactly one RegimeFacetContract reading per owned facet and consume no composed regime` | **BS-013-010: A facet source publishes its facet and never consumes the composed regime** — each shim reads its owner tool's frozen model output, performs no new fetching, and writes exactly one `RegimeFacetContract` reading per owned facet stamped with `asOf`, `sourceAttribution`, and `coverageNote`. | `node scripts/selftest.mjs` | No |
| TP-03-02 | Unit | `unit` | `scripts/selftest.mjs` group `regime-primitives` / `every retained legacy vocabulary maps through a declared versioned valueVocabularyId mapping that is lossless or declared lossy` | Each retained legacy vocabulary maps into the facet vocabulary through a declared, versioned mapping keyed by `valueVocabularyId`; a mapping that is lossy declares its loss, and an undeclared silent re-label is rejected at the boundary. | `node scripts/selftest.mjs` | No |
| TP-03-03 | Unit | `unit` | `scripts/selftest.mjs` group `regime-primitives` / `bond publishes credit, curve, and duration-posture as three separately identifiable facets and volatility publishes strictly volatility-magnitude` | Per-source facet typing: the bond source publishes `credit`, `curve`, and `duration-posture` as three separately identifiable facets never blended into one score, and the volatility source publishes strictly `kind: 'volatility-magnitude'` so the composer rejects it wherever a directional regime is expected. | `node scripts/selftest.mjs` | No |
| TP-03-04 | Functional | `functional` | `scripts/selftest.mjs` group `regime-primitives` / `ratio-derived sources consume RLRATIO, propagate the proxy caveat, and emit not-comparable where the predicate fails` | The credit-quality-pulse, real-assets, global-rotation, and FX dollar sources read their readings from `RLRATIO` over pairs declared in `ratio-pairs.json`, real-assets propagates the proxy caveat onto its published facet, and global-rotation emits `not-comparable` where a pair fails the comparability predicate. | `node scripts/selftest.mjs` | No |
| TP-03-05 | Integration | `integration` | `scripts/selftest.mjs` group `regime-primitives` / `facet writes go through the existing rldata.js append API into the Tier 0 facet slot with the cache schema unchanged and provenance stamped` | Publication reaches the Tier 0 shared-cache facet slot through the existing `rldata.js` append API with the protected cache schema unchanged, and each published facet carries the producing source and the targeted composer version so a provenance line can name the source without naming the composed regime as an input. | `node scripts/selftest.mjs` | No |
| TP-03-06 | Functional | `functional` | `scripts/selftest.mjs` group `regime-primitives` / `IP-002 no-cycle: no facet source imports a Tier 2 module and no facet declares the composed regime as an input` | **ADVERSARIAL RED-bite** — introduce a source-side cycle fixture in which a shim imports `rlregime.js` and declares the composed regime as a facet input. The named test `IP-002 no-cycle: no facet source imports a Tier 2 module and no facet declares the composed regime as an input` MUST fail under that fixture, resolving to an explicit lint-failure state rather than a value, and MUST pass against the delivered one-way shims. | `node scripts/selftest.mjs` | No |
| TP-03-07 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the additive `regime-primitives` group | Broad-suite regression: the full selftest suite stays green with the `regime-primitives` group added, every pre-existing group (including the SCOPE-1 and SCOPE-2 groups) is preserved byte-for-byte, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |

### Definition of Done

#### Core Items

- [ ] `[TP-03-01]` `[BS-013-010]` A facet source's model computation contains no read of the composed regime: the breadth-participation shim reads only its own inputs and publishes its facet value as exactly one `RegimeFacetContract` reading per owned facet from its tool's frozen model output, stamped with `asOf`, `sourceAttribution`, and `coverageNote`, fetching nothing new, and any such compute-side read of the composed regime is reported as a facet DAG cycle defect.
- [ ] `[TP-03-02]` `[BS-013-010]` Every retained legacy vocabulary maps through a declared, versioned `valueVocabularyId` mapping that is lossless or declares its loss; an undeclared silent re-label is rejected.
- [ ] `[TP-03-03]` `[BS-013-010]` The bond source publishes `credit`, `curve`, and `duration-posture` as three separately identifiable facets, and the volatility source publishes strictly `volatility-magnitude`.
- [ ] `[TP-03-04]` `[BS-013-010]` Ratio-derived sources read through `RLRATIO`, propagate the proxy caveat, and emit `not-comparable` where the comparability predicate fails.
- [ ] `[TP-03-05]` `[BS-013-010]` Facet writes reach the Tier 0 slot through the existing `rldata.js` append API with the protected cache schema unchanged, and each facet carries its producing source and targeted composer version.
- [ ] `[TP-03-06]` The adversarial source-side cycle fixture makes the named IP-002 no-cycle assertion fail before the delivered one-way shims and pass after them.
- [ ] `[TP-03-07]` The complete selftest suite stays green with the additive `regime-primitives` group, every pre-existing group preserved and no decreased passing count.
- [ ] `[BS-013-010]` A source whose reading cannot be published resolves to a typed `unavailable` / `not-comparable` state carrying a reason code and a what-would-resolve statement; no zero, dash, blank, or neutral value is published in its place.
- [ ] `[BS-013-010]` The shims carry no default value, no fallback path, and no stub: no shim imports a Tier 2 module, no shim declares the composed regime as a facet input, and no path outside `design.md` → `## Implementation Boundary` is modified.
- [ ] `[BS-013-010]` Publishing the same frozen model output twice produces identical facet readings and an identical facet identity.
- [ ] `[BS-013-010]` Every numeric guard in new code uses `Number.isFinite`; the global `isFinite` appears zero times in the shim and selftest-group code added by this scope.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
