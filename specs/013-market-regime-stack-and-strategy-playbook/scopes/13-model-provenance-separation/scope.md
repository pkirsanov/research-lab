# SCOPE-13: Model provenance separation

**Status:** Not Started
**Tags:** `overlay:true`
**Depends On:** SCOPE-2, SCOPE-4
**Primary Outcome:** A model-derived claim is verified by reproducible inputs, lineage, version, and deterministic recomputation; only externally-observed facts require two independent origins, and the two classes are structurally distinguished.

## Objective

Close BS-013-029. The Brief view today applies a two-independent-origin requirement to every material claim, including model-derived ones such as `tactical equals risk-off` — a claim this system computes rather than observes. Two independent origins cannot verify a computed value, and no amount of agreement between origins makes a recomputation correct; conversely, an externally-observed fact genuinely does need corroboration. This scope classifies each claim, verifies model-derived claims by reproducible inputs plus lineage plus composer/model version plus deterministic recomputation, keeps the two-origin requirement for externally-observed facts only, and separates the two classes visually and structurally.

## Implementation Files

| File | Change |
|---|---|
| `./rlregime.js` | Add the claim classification (`model-derived` / `externally-observed`) to the composed payload, and emit for each model-derived claim its reproducible inputs, lineage, composer/model version, and the deterministic recomputation that reproduces the stated value. |
| `./market-regime-lab.html` | The Brief view labels the two claim classes distinctly, separates them visually and structurally, presents the recomputation evidence for a model-derived claim, and applies the two-independent-origin requirement only to externally-observed claims. |
| `scripts/brief-refresh.mjs` | The deterministic `DERIVED` owner-read adapter emits the same claim classification and the same recomputation evidence as the browser publication. |
| `scripts/selftest.mjs` | Extend the `rlregime` and `rlregime-compose` groups with the classification, recomputation, origin-requirement, and adversarial agreement-is-not-verification assertions. |

No path outside `design.md` → `## Implementation Boundary` is touched.

## Gherkin Scenarios

### BS-013-029: Model-derived claims are verified by recomputation, never by independent origins

```gherkin
Scenario: A model-derived claim is verified by lineage and deterministic recomputation
  Given the Brief view presents the model-derived claim "tactical equals risk-off"
  And the claim is classified as model-derived rather than externally observed
  When the reader requests verification of that claim
  Then the claim presents its reproducible inputs, its lineage, its composer/model version, and
    a deterministic recomputation that reproduces the stated value
  And the claim is not blocked for lacking two independent origins
  And the claim is not treated as verified merely because two origins agree with it
  And an externally-observed factual claim on the same surface still requires two independent
    origins
  And the two classes are labeled distinctly and are visually and structurally separated
```

## Implementation Plan

1. **Claim classification.** Every material claim in the composed payload carries an explicit class: `model-derived` for a value this system computes, `externally-observed` for a fact this system reports from an outside source. The class is declared per claim, never inferred from wording.
2. **Model-derived verification bundle.** A model-derived claim emits its reproducible inputs, its lineage back to the producing facets, its composer/model version, and a deterministic recomputation that reproduces the stated value from those inputs.
3. **Origin requirement applies only outward.** The two-independent-origin requirement is enforced for `externally-observed` claims only. A model-derived claim is never blocked for lacking two origins, and origin agreement never marks a model-derived claim verified.
4. **Structural separation.** The Brief view renders the two classes under distinct labels in structurally separate regions, so a reader cannot mistake a computed conclusion for a corroborated observation.
5. **Headless parity.** The deterministic `DERIVED` adapter emits the same classification and the same recomputation evidence as the browser publication, so both publications carry identical verification for identical frozen inputs.
6. **Refusal shape.** A model-derived claim whose recomputation does not reproduce the stated value resolves to a typed unverified state carrying a reason code and a what-would-resolve statement, and is not rendered as verified. An externally-observed claim with fewer than two origins resolves the same way against its own requirement.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-13-01 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime` / `every material claim carries an explicit model-derived or externally-observed class that is declared and never inferred from wording` | The classification is declared per claim; an unclassified claim is refused rather than defaulted into either class. | `node scripts/selftest.mjs` | No |
| TP-13-02 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `a model-derived claim emits reproducible inputs, lineage, composer version, and a deterministic recomputation that reproduces the stated value` | **BS-013-029: A model-derived claim is verified by lineage and deterministic recomputation** — the `tactical equals risk-off` fixture emits the full verification bundle and the recomputation reproduces the stated value exactly. | `node scripts/selftest.mjs` | No |
| TP-13-03 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `a model-derived claim is not blocked for lacking two independent origins while an externally-observed claim still requires them` | The origin requirement is applied to `externally-observed` claims only: the model-derived fixture verifies with a single origin, and the externally-observed fixture with one origin resolves to an unverified state. | `node scripts/selftest.mjs` | No |
| TP-13-04 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `two agreeing origins do not mark a model-derived claim verified when its recomputation does not reproduce the stated value` | **ADVERSARIAL RED-bite** — a fixture supplies two independent origins agreeing with a model-derived claim whose recomputation reproduces a different value. The named test MUST resolve the claim to unverified; treating origin agreement as verification MUST fail it. | `node scripts/selftest.mjs` | No |
| TP-13-05 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-029 the Brief view labels and structurally separates model-derived and externally-observed claims` | Persistent scenario-specific regression coverage on the real page: the Brief view renders the two claim classes under distinct labels in structurally separate regions, presents the recomputation evidence for a model-derived claim, and shows no two-origin block on a model-derived claim. Collapsing the two classes into one region fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| TP-13-06 | Integration | `integration` | `scripts/selftest.mjs` group `rlregime` / `the headless DERIVED owner read emits the same claim classification and recomputation evidence as the browser publication` | Headless parity: for identical frozen inputs the `scripts/brief-refresh.mjs` `DERIVED` adapter and the browser publication emit an identical classification and an identical verification bundle per claim. | `node scripts/selftest.mjs` | No |

### Definition of Done

#### Core Items

- [ ] `[TP-13-01]` `[BS-013-029]` Every material claim carries a declared `model-derived` or `externally-observed` class; an unclassified claim is refused rather than defaulted.
- [ ] `[TP-13-02]` `[BS-013-029]` A model-derived claim emits its reproducible inputs, lineage, composer/model version, and a deterministic recomputation that reproduces the stated value.
- [ ] `[TP-13-03]` `[BS-013-029]` A model-derived claim is not blocked for lacking two independent origins, while an externally-observed claim with fewer than two origins resolves to unverified.
- [ ] `[TP-13-04]` `[BS-013-029]` The adversarial agreeing-origins fixture proves origin agreement never marks a model-derived claim verified when its recomputation reproduces a different value.
- [ ] `[TP-13-06]` `[BS-013-029]` The headless `DERIVED` owner read emits an identical classification and verification bundle to the browser publication for identical frozen inputs.
- [ ] `[BS-013-029]` A model-derived claim whose recomputation does not reproduce the stated value resolves to a typed unverified state carrying a reason code and a what-would-resolve statement, and is never rendered as verified.
- [ ] `[BS-013-029]` The delivery carries no default claim class, no fallback verification path, and no stub; no path outside `design.md` → `## Implementation Boundary` is modified.
- [ ] `[BS-013-029]` Recomputing the same model-derived claim twice over the same frozen inputs reproduces an identical value and an identical lineage.
- [ ] Every numeric guard in new code uses `Number.isFinite`; the global `isFinite` appears zero times in the composer, surface, adapter, and selftest-group code added by this scope.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-13-05]` `[BS-013-029]` the feature's real-page regression spec holds a permanently registered case asserting that the Brief view renders the two claim classes under distinct labels in structurally separate regions, presents the recomputation evidence for a model-derived claim, and shows no two-origin block on a model-derived claim.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
