# SCOPE-10: Independent evidence family coverage

**Status:** Not Started
**Tags:** `overlay:true`
**Depends On:** SCOPE-1, SCOPE-2
**Primary Outcome:** Facets sharing an underlying input or mechanism collapse to one evidence family in the confirmation denominator, and a read below the declared minimum independent-family coverage renders `Unresolved`.

## Objective

Close BS-013-026. SCOPE-1 collapses overlapping *ratio pairs* into one evidence family, but the confirmation denominator SCOPE-2 delivers still counts every facet separately — so a sentiment facet from a Fear & Greed score, a volatility facet from VIX, and an equity-trend facet from SPY can inflate an "n of n" confirmation even when two of them ride the same underlying input or the same mechanism. This scope extends family collapse from ratio pairs to a declared independent-origin map covering all facets, names each counted family in the displayed ratio, and refuses to display a confirmation ratio at all for a read below the declared minimum independent-family coverage.

## Implementation Files

| File | Change |
|---|---|
| `./rlratio.js` | Generalize the existing `groupByFamily` collapse so it accepts the declared independent-origin map, not only ratio-pair family ids. The primitive stays pure and holds no regime vocabulary. |
| `./rlregime.js` | Declare the independent-origin map and the minimum independent-family coverage floor. Count confirmation over collapsed families rather than facets, and render `Unresolved` below the floor. |
| `./ratio-pairs.json` | Ratio pairs continue to declare `ratioFamilyId`; the entries are read as one input to the independent-origin map rather than as the whole map. |
| `./market-regime-lab.html` | The displayed confirmation ratio names each counted family, and no `n of n` ratio is displayed for a read below the minimum coverage. |
| `scripts/selftest.mjs` | Extend the `rlratio` and `rlregime-compose` groups with the family-collapse, coverage-floor, and adversarial correlated-input assertions. |

No path outside `design.md` → `## Implementation Boundary` is touched.

## Gherkin Scenarios

### BS-013-026: Correlated facets collapse to one evidence family and thin coverage renders Unresolved

```gherkin
Scenario: Facets sharing an underlying input cannot inflate the confirmation denominator
  Given the sentiment facet is derived from a Fear & Greed score
  And the volatility facet is derived from VIX
  And the equity-trend facet is derived from SPY
  And the declared independent-origin map assigns two of those facets to the same underlying
    input or the same mechanism
  When the system counts confirmation for the combined regime
  Then those two facets collapse to one evidence family in the denominator
  And the displayed ratio names each counted family rather than each counted facet
  And when the number of independent evidence families is below the declared minimum coverage
    for that read, the archetype renders "Unresolved"
  And no "n of n" confirmation is displayed for a read below that minimum coverage
```

## Implementation Plan

1. **Independent-origin map.** Declare, in the composer, a map from facet id to `evidenceFamilyId` keyed by underlying input and by mechanism. Two facets sharing either an underlying input or a mechanism carry the same `evidenceFamilyId`. The map is fully enumerated — no wildcard, no heuristic, no inference at runtime.
2. **Collapse before counting.** Confirmation counting resolves every contributing facet to its `evidenceFamilyId` first, then counts distinct families. The denominator is a family count, never a facet count.
3. **Primitive reuse.** `RLRATIO.groupByFamily` is generalized to accept the declared map so the ratio-pair collapse SCOPE-1 delivers and the facet collapse delivered here run through one implementation rather than two.
4. **Minimum coverage floor.** Declare a minimum independent-family coverage per read. Below the floor the archetype renders `Unresolved` and the confirmation ratio is suppressed entirely — no `n of n` string is produced for that read.
5. **Named families in the display.** The rendered ratio names each counted family, so a reader can see which distinct origins were counted rather than a bare count.
6. **Refusal shape.** A read below the floor resolves to `Unresolved` carrying a reason code and a what-would-resolve statement naming the missing independent families. No zero, dash, blank, or neutral confirmation value is produced in its place.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-10-01 | Unit | `unit` | `scripts/selftest.mjs` group `rlratio` / `groupByFamily collapses facets sharing an underlying input or mechanism through the declared independent-origin map` | The generalized primitive collapses two facets carrying the same `evidenceFamilyId` into one family and leaves genuinely independent facets separate, using the same implementation as the SCOPE-1 ratio-pair collapse. | `node scripts/selftest.mjs` | No |
| TP-10-02 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `the confirmation denominator counts distinct evidence families and never counts facets` | **BS-013-026: Correlated facets collapse to one evidence family** — the sentiment (Fear & Greed), volatility (VIX), and equity-trend (SPY) fixture, with two facets mapped to the same underlying input, produces a denominator of distinct families rather than three. | `node scripts/selftest.mjs` | No |
| TP-10-03 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime-compose` / `the displayed confirmation ratio names each counted family rather than each counted facet` | The produced confirmation payload carries the named family ids that were counted, so the rendered ratio can name each family instead of emitting a bare count. | `node scripts/selftest.mjs` | No |
| TP-10-04 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `a read below the declared minimum independent-family coverage renders Unresolved and suppresses the n of n ratio` | **ADVERSARIAL RED-bite** — a fixture whose three facets collapse to one family sits below the declared floor. The archetype MUST render `Unresolved`, the confirmation payload MUST carry no `n of n` string, and removing the coverage floor MUST fail this named test. | `node scripts/selftest.mjs` | No |
| TP-10-05 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-026 the rendered confirmation names counted families and thin coverage renders Unresolved` | Persistent scenario-specific regression coverage on the real page: the rendered confirmation names its counted families, and a below-floor read renders `Unresolved` with no `n of n` ratio anywhere in the rendered text. A reintroduced facet-count denominator fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| TP-10-06 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the extended `rlratio` and `rlregime-compose` groups | Broad-suite regression: the full selftest suite stays green with the generalized collapse and the coverage floor added, the SCOPE-1 ratio-pair family assertions still pass unchanged, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |

### Definition of Done

#### Core Items

- [ ] `[TP-10-01]` `[BS-013-026]` `groupByFamily` collapses facets sharing an underlying input or mechanism through the declared independent-origin map and leaves genuinely independent facets separate.
- [ ] `[TP-10-02]` `[BS-013-026]` The confirmation denominator counts distinct evidence families; the Fear & Greed / VIX / SPY fixture with two facets on one underlying input produces fewer families than facets.
- [ ] `[TP-10-03]` `[BS-013-026]` The confirmation payload names each counted family so the displayed ratio names families rather than facets.
- [ ] `[TP-10-04]` `[BS-013-026]` The adversarial below-floor fixture renders `Unresolved` and suppresses the `n of n` ratio entirely; removing the coverage floor fails the named test.
- [ ] `[TP-10-06]` The complete selftest suite stays green with the generalized collapse and coverage floor, the SCOPE-1 ratio-pair family assertions unchanged and no decreased passing count.
- [ ] `[BS-013-026]` A read below the minimum coverage resolves to `Unresolved` carrying a reason code and a what-would-resolve statement naming the missing independent families; no zero, dash, blank, or neutral confirmation value is produced in its place.
- [ ] `[BS-013-026]` The independent-origin map is fully enumerated with no wildcard, no runtime inference, no default family assignment, and no stub; no path outside `design.md` → `## Implementation Boundary` is modified.
- [ ] `[BS-013-026]` Counting confirmation twice over the same frozen facet set produces an identical family set and an identical denominator.
- [ ] Every numeric guard in new code uses `Number.isFinite`; the global `isFinite` appears zero times in the primitive, composer, and selftest-group code added by this scope.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-10-05]` `[BS-013-026]` the feature's real-page regression spec holds a permanently registered case asserting that the rendered confirmation names each counted evidence family and that a read below the declared minimum independent-family coverage renders `Unresolved` with no `n of n` ratio anywhere in the rendered text.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
