# SCOPE-5: Registry registration + FR-051 count lockstep

**Status:** Not Started
**Tags:** `overlay:true`, `registry-coherence:true`
**Depends On:** SCOPE-4

## Objective

Register `market-regime-lab.html` across every registry in one coherent change and move the hard-asserted counts together with it. Registry registration is atomic by design: a tool present in `tools.json` but absent from the navigation array, or a count assertion that lags its registry, is an incoherent repository state, not a partially-complete one.

## Implementation Files

| File | Change |
|---|---|
| `tools.json` | Register the new tool. |
| `simple-models.json` | Register the tool's Simple model entry. |
| `journeys.json` | Register the tool's `noExecution` journeys. |
| `index.html` | Add the tool to the `TOOLS` array. |
| `rlnav.js` | Add the tool to the `TOOLS` array. |
| `notes/market-regime-lab.md` | **New.** Required per-tool handoff doc. |
| `scripts/selftest.mjs` | Update the hard-asserted registry counts. |

No other path is touched by this scope. `tool-experience.config.json` `adapterPolicy.moduleAllowlist` stays at its exact 7 entries because the tool composes via the root-level `rlregime.js` UMD and introduces no new adapter module.

## Gherkin Scenarios

### BS-013-023: A registry entry and its hard-asserted count are refused unless they move together

```gherkin
Scenario: Registry entries and asserted counts move in lockstep or the change is refused
  Given `scripts/validate-tool-experience.mjs` hard-asserts the ordinary-tool count, the Market Action Center goal count, the total goal count, and the journey-definition count
  And the registration surfaces for this feature are `tools.json`, `simple-models.json`, `journeys.json`, `tool-experience.config.json`, the `index.html` TOOLS array, and the `rlnav.js` TOOLS array
  When a change adds this surface to the registration surfaces without raising the asserted counts in the same change
  Then the registry validation refuses the change and names the asserted count that did not move
  And the half-registered surface is not reported as registered
  When a change raises an asserted count above the number of entries actually present across the registration surfaces
  Then the registry validation refuses the change and names the asserted count that overstates the entries
  And no absent entry is inferred, defaulted, or backfilled to satisfy the declared count
```

## Implementation Plan

1. **`tools.json`.** Register the tool with its id, title, description, and the metadata the landing page and navigation consume.
2. **`simple-models.json`.** Register the Simple model entry so the tool's Simple view is a declared model rather than an inline page concern.
3. **`journeys.json`.** Register the tool's journeys with `noExecution: true`, matching the ordered steps the Journey view renders.
4. **`index.html` `TOOLS` array.** Add the tool so it appears on the landing page inventory.
5. **`rlnav.js` `TOOLS` array.** Add the tool so the shared navigation resolves it on every page.
6. **`notes/market-regime-lab.md`.** Author the per-tool handoff doc covering what the tool owns, the facets it composes, the owner read it publishes, and the registries it participates in.
7. **FR-051 count lockstep.** Update the exact-count assertions in the same change: 22 ordinary tools, 4 Market Action Center goals, 48 total goals, 48 journey definitions. Update the hard-asserted registry counts in `scripts/selftest.mjs` in the same commit so no intermediate state exists where a registry and its assertion disagree.
8. **Adapter allowlist untouched.** Verify the `adapterPolicy.moduleAllowlist` remains at exactly 7 entries. Widening it is a contract change escalated to the config owner, never absorbed here as an implementation detail.
9. **Tool-read publication.** Register the tool's Simple-view read into the shared `toolReads[<id>]` cache slot with `id`, `asOf`, a one-line read, `metrics`, and `deepLink`, so brief coverage is derived from the registry rather than hand-maintained.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Integration | `integration` | `scripts/validate-tool-experience.mjs` — registry validation over `tools.json`, `simple-models.json`, `journeys.json`, and `tool-experience.config.json` | **FR-051 count lockstep** — the tool-experience validator passes against the updated registries with the exact asserted counts of 22 ordinary tools, 4 Market Action Center goals, 48 total goals, and 48 journey definitions, so no registry and its assertion disagree. | `node scripts/validate-tool-experience.mjs` | No |
| TP-05-02 | Integration | `integration` | `scripts/selftest.mjs` group `regime-primitives` / `market-regime-lab is registered coherently across tools.json, simple-models.json, journeys.json, the index.html TOOLS array, the rlnav.js TOOLS array, and notes/market-regime-lab.md` | **Atomic registry registration** — the tool resolves in every registration surface in the same change: `tools.json`, `simple-models.json`, `journeys.json` (with `noExecution: true`), the `index.html` `TOOLS` array, the `rlnav.js` `TOOLS` array, and the required `notes/market-regime-lab.md` handoff doc. A tool present in one surface and absent from another is asserted to be a failure, not a partial state. | `node scripts/selftest.mjs` | No |
| TP-05-03 | Unit | `unit` | `scripts/selftest.mjs` group `regime-primitives` / `tool-experience.config.json adapterPolicy.moduleAllowlist holds exactly its 7 entries` | The `adapterPolicy.moduleAllowlist` in `tool-experience.config.json` holds exactly 7 entries after registration, proving the tool composes via the root-level `rlregime.js` UMD and introduces no new adapter module. | `node scripts/selftest.mjs` | No |
| TP-05-04 | Functional | `functional` | `scripts/selftest.mjs` — hard-asserted registry count assertions | The hard-asserted registry counts inside `scripts/selftest.mjs` are moved in the same change as the registries themselves and re-derive the same 22 / 4 / 48 / 48 values directly from the registry files rather than from a hand-maintained constant. | `node scripts/selftest.mjs` | No |
| TP-05-05 | Integration | `integration` | `scripts/selftest.mjs` group `regime-primitives` / `market-regime-lab publishes its Simple-view read into the shared toolReads slot with id, asOf, read, metrics, and deepLink` | The tool's Simple-view read is written into the shared `toolReads[<id>]` cache slot carrying `id`, `asOf`, a one-line `read`, `metrics`, and `deepLink`, so brief coverage of this tool is derived from the registry rather than hand-maintained. | `node scripts/selftest.mjs` | No |
| TP-05-06 | Integration | `integration` | `scripts/validate-tool-experience.mjs` — registry lockstep assertion | **BS-013-023: A registry entry and its hard-asserted count are refused unless they move together** — **ADVERSARIAL RED-bite** — register the tool in `tools.json` alone while leaving `journeys.json` and the asserted counts at their prior values. `node scripts/validate-tool-experience.mjs` MUST fail under that half-applied registration naming the asserted count that did not move, MUST NOT report the half-registered surface as registered, and MUST pass against the delivered coherent change. | `node scripts/validate-tool-experience.mjs` | No |
| TP-05-07 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the registry-coherence assertions this scope adds | Broad-suite regression: the full selftest suite stays green with the moved registry counts, every pre-existing group (including the SCOPE-1 through SCOPE-4 groups) is preserved byte-for-byte, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |
| TP-05-08 | Integration | `integration` | `scripts/validate-tool-experience.mjs` — overstated-count assertion | **BS-013-023: A registry entry and its hard-asserted count are refused unless they move together** — **ADVERSARIAL RED-bite, overstated-count direction** — raise an asserted count above the number of entries actually present across the registration surfaces. `node scripts/validate-tool-experience.mjs` MUST fail naming the asserted count that overstates the entries, MUST NOT infer, default, or backfill an absent entry to satisfy the declared count, and MUST pass against the delivered counts. | `node scripts/validate-tool-experience.mjs` | No |

### Definition of Done

#### Core Items

- [ ] `[TP-05-01]` The tool-experience validator passes against the updated registries with the exact 22 ordinary tools, 4 Market Action Center goals, 48 total goals, and 48 journey definitions.
- [ ] `[TP-05-02]` `market-regime-lab.html` resolves in `tools.json`, `simple-models.json`, `journeys.json`, the `index.html` `TOOLS` array, the `rlnav.js` `TOOLS` array, and `notes/market-regime-lab.md` from the same change.
- [ ] `[TP-05-03]` `tool-experience.config.json` `adapterPolicy.moduleAllowlist` holds exactly its 7 entries with no new adapter module introduced.
- [ ] `[TP-05-04]` The hard-asserted registry counts in `scripts/selftest.mjs` move together with the registries and re-derive their values from the registry files.
- [ ] `[TP-05-05]` The tool's Simple-view read is published into the shared `toolReads[<id>]` slot with `id`, `asOf`, `read`, `metrics`, and `deepLink`.
- [ ] `[TP-05-06]` `[BS-013-023]` A change that adds this surface to the registration surfaces without raising the asserted counts in the same change is refused by the registry validation, which names the asserted count that did not move, and the half-registered surface is not reported as registered.
- [ ] `[TP-05-07]` The complete selftest suite stays green with the moved counts, every pre-existing group preserved and no decreased passing count.
- [ ] `[TP-05-08]` `[BS-013-023]` A change that raises an asserted count above the number of entries actually present across the registration surfaces is refused by the registry validation, which names the asserted count that overstates the entries, and no absent entry is inferred, defaulted, or backfilled to satisfy the declared count.
- [ ] `notes/market-regime-lab.md` states what the tool owns, the facets it composes, the owner read it publishes, and the registries it participates in — no placeholder section and no default text.
- [ ] No registration surface carries a default value, a fallback entry, or a stub row: every registry entry states its id, title, description, and the metadata its consumer reads explicitly.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
