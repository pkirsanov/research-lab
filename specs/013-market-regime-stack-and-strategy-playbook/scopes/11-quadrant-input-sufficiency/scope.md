# SCOPE-11: Quadrant input sufficiency

**Status:** Not Started
**Tags:** `overlay:true`
**Depends On:** SCOPE-4
**Primary Outcome:** A growth or inflation axis name is rendered only when inputs capable of identifying that axis are present; sentiment and stress proxies alone render as a sentiment/stress state or `Unresolved`.

## Objective

Close BS-013-027. BS-013-005 fixes the quadrant's inputs to a Fear & Greed score and VIX and constrains only the `market-implied` label — it does not constrain the axis *names*. A Fear & Greed score and VIX cannot identify a growth axis or an inflation axis, so naming those axes from those inputs asserts an identification the inputs do not support. This scope declares the axis-identification requirement, makes axis naming conditional on it, and renders a sentiment/stress state or `Unresolved` whenever the requirement is unmet — with input attribution naming the actual inputs explicitly.

## Implementation Files

| File | Change |
|---|---|
| `./rlregime.js` | Declare the axis-identification requirement per axis and the predicate deciding whether a growth or inflation axis name is permitted for the available input set. Emit the axis-permission decision and its input attribution in the composed payload. |
| `./market-regime-lab.html` | The quadrant renders a growth or inflation axis name only when the predicate permits it; otherwise it renders a sentiment/stress state, or `Unresolved` when even that is unsupported. Input attribution is rendered explicitly on the quadrant. |
| `./regime-archetypes.json` | The enumerated cells carry the axis identity each tuple asserts, so a cell naming a growth or inflation axis is only reachable when the predicate permits that axis. |
| `scripts/selftest.mjs` | Extend the `rlregime-compose` group with the axis-permission, attribution, and adversarial proxy-only assertions. |

No path outside `design.md` → `## Implementation Boundary` is touched.

## Gherkin Scenarios

### BS-013-027: A growth or inflation axis name requires inputs capable of identifying that axis

```gherkin
Scenario: Sentiment and stress proxies cannot carry a growth-inflation axis name
  Given the quadrant's only available inputs are a Fear & Greed score and VIX
  And the declared axis-identification requirement for a growth axis or an inflation axis names
    inputs such as real yields, breakevens, curve shape, commodities, or cyclical-versus-
    defensive relationships
  When the quadrant is rendered on any surface
  Then it does not use a growth axis name or an inflation axis name
  And it renders as a sentiment/stress state, or as "Unresolved" when even that is unsupported
  And its input attribution names the Fear & Greed score and VIX explicitly
  And when the axis-identifying inputs are present, the growth or inflation axis name is
    permitted and each axis cites the specific inputs that identified it
```

## Implementation Plan

1. **Axis-identification requirement.** Declare, per axis, the enumerated input classes capable of identifying it — real yields, breakevens, curve shape, commodities, and cyclical-versus-defensive relationships for the growth and inflation axes. The declaration is fully enumerated; no input is inferred at runtime as axis-identifying.
2. **Permission predicate.** For the available input set, the composer decides per axis whether an axis name is permitted. The decision is emitted in the composed payload with the inputs that satisfied it, so the surface renders a decision rather than making one.
3. **Proxy-only fallback state.** When only sentiment and stress proxies are available, the quadrant renders a sentiment/stress state with no growth or inflation axis name anywhere in its labels, axis titles, or legend.
4. **Unresolved state.** When even a sentiment/stress state is unsupported, the quadrant renders `Unresolved` carrying a reason code and a what-would-resolve statement naming the missing axis-identifying inputs.
5. **Explicit input attribution.** Every quadrant render names its actual inputs — for the proxy-only case, the Fear & Greed score and VIX explicitly — rather than a generic "market-implied" attribution.
6. **Permitted path.** When axis-identifying inputs are present, the growth or inflation axis name is permitted and each axis cites the specific inputs that identified it, so the permitted and refused paths are both exercised rather than only the refusal.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-11-01 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime-compose` / `the axis-identification requirement is fully enumerated and no input is inferred as axis-identifying at runtime` | The declared requirement enumerates the input classes capable of identifying the growth and inflation axes, and an undeclared input never satisfies an axis regardless of its value. | `node scripts/selftest.mjs` | No |
| TP-11-02 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `a Fear and Greed plus VIX input set does not permit a growth axis name or an inflation axis name` | **BS-013-027: A growth or inflation axis name requires identifying inputs** — the proxy-only fixture produces an axis-permission decision of refused for both axes and a sentiment/stress state instead. | `node scripts/selftest.mjs` | No |
| TP-11-03 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `when the axis-identifying inputs are present each permitted axis cites the specific inputs that identified it` | Positive path: a fixture supplying real yields, breakevens, and curve shape permits the axis names and emits, per axis, the specific inputs that satisfied the requirement. | `node scripts/selftest.mjs` | No |
| TP-11-04 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime-compose` / `a quadrant with neither axis-identifying inputs nor supportable proxies resolves to Unresolved with a reason code` | The unsupported fixture resolves to `Unresolved` carrying a reason code and a what-would-resolve statement naming the missing axis-identifying inputs, never a blank or neutral quadrant. | `node scripts/selftest.mjs` | No |
| TP-11-05 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-027 the proxy-only quadrant renders no growth or inflation axis name and attributes Fear and Greed plus VIX explicitly` | **ADVERSARIAL RED-bite**, persistent and named — on the real page with a proxy-only input set, the rendered quadrant text MUST contain no growth axis name and no inflation axis name anywhere in its labels, axis titles, or legend, and MUST name the Fear & Greed score and VIX explicitly. Reintroducing a growth/inflation axis label under proxy-only inputs fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| TP-11-06 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the extended `rlregime-compose` group | Broad-suite regression: the full selftest suite stays green with the axis-permission predicate added, the SCOPE-4 quadrant assertions for BS-013-005 still pass unchanged, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |

### Definition of Done

#### Core Items

- [ ] `[TP-11-02]` `[TP-11-05]` `[BS-013-027]` Sentiment and stress proxies cannot carry a growth-inflation axis name: when the quadrant's only available inputs are a Fear & Greed score and VIX, it uses no growth axis name and no inflation axis name anywhere in its labels, axis titles, or legend, it renders as a sentiment/stress state or as `Unresolved` when even that is unsupported, and its input attribution names the Fear & Greed score and VIX explicitly.
- [ ] `[TP-11-01]` `[BS-013-027]` The axis-identification requirement is fully enumerated per axis and an undeclared input never satisfies an axis at runtime.
- [ ] `[TP-11-02]` `[BS-013-027]` A Fear & Greed plus VIX input set refuses both axis names and produces a sentiment/stress state instead.
- [ ] `[TP-11-03]` `[BS-013-027]` When axis-identifying inputs are present the axis name is permitted and each axis cites the specific inputs that identified it.
- [ ] `[TP-11-04]` `[BS-013-027]` A quadrant with neither axis-identifying inputs nor supportable proxies resolves to `Unresolved` carrying a reason code and a what-would-resolve statement naming the missing inputs.
- [ ] `[TP-11-06]` The complete selftest suite stays green with the axis-permission predicate, the SCOPE-4 BS-013-005 quadrant assertions unchanged and no decreased passing count.
- [ ] `[BS-013-027]` The quadrant carries no default axis name, no fallback axis label, and no stub; no path outside `design.md` → `## Implementation Boundary` is modified.
- [ ] `[BS-013-027]` Rendering the same frozen input set twice produces an identical axis-permission decision and identical input attribution.
- [ ] `[BS-013-027]` Every quadrant render names its actual inputs rather than a generic attribution, in both the permitted and the refused path.
- [ ] Every numeric guard in new code uses `Number.isFinite`; the global `isFinite` appears zero times in the composer, surface, and selftest-group code added by this scope.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-11-05]` `[BS-013-027]` the feature's real-page regression spec holds a permanently registered case asserting that a proxy-only quadrant render contains no growth axis name and no inflation axis name anywhere in its labels, axis titles, or legend, and names the Fear & Greed score and VIX explicitly.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
