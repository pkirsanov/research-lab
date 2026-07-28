# SCOPE-6: Consumer migration + compatibility projection

**Status:** Not Started
**Tags:** `overlay:true`, `migration:true`, `duplicate-retirement:true`
**Depends On:** SCOPE-2, SCOPE-5

## Objective

Delete the duplicate and inline regime copies rather than preserving them. Every surviving consumer either reads the single published owner read or reads a declared compatibility projection. No consumer holds registry data, matches archetypes, or computes a confirmation ratio — that would recreate the second source of truth this feature exists to eliminate.

## Implementation Files

| File | Change |
|---|---|
| `rlg.js` | Legacy macro-regime vocabulary consumers read the projected value via `RLREGIME.projectCompatibility(…, 'macro-regime-legacy/v1')` instead of holding their own regime naming. |
| `rlexperience-adapters/market-structure.js` | Band vocabulary consumers read `market-structure-band-legacy/v1` through the projection; the adapter stops deriving its own band. |
| `intraday-tape-lab.html` | Consumes regime context via `RLREGIME.readPublishedContext` — no local recomposition. |
| `swing-structure-lab.html` | Publishes its facet, reads context, never recomposes. |
| `market-brief.html` | Renders the published composed read with its `k/m`, `absentFacetIds`, and `availability`; drops any local regime derivation. |

No other path is touched. `rlexperience.js` and `rljourney.js` remain protected and unmodified.

## Gherkin Scenarios

### BS-013-011: A consumer reads the published owner read and cannot recompute or upgrade it

```gherkin
Scenario: A consumer is refused a locally recomputed or freshened regime
  Given the published regime owner read is marked stale
  When a consumer surface renders the regime
  Then it renders the published read with its stale marker and original cutoff intact
  And it does not recompute any facet locally
  And it does not present the stale read as fresh or substitute a newer value
```

### BS-013-012: A migrated consumer renders the single published read

```gherkin
Scenario: An inline duplicate is replaced by consumption of the published read
  Given a tool previously computed its own inline copy of the canonical regime
  And that tool has been migrated to consume the published owner read
  When the tool renders its regime section
  Then it displays the single published read with the composer's cutoff and horizon
  And no second, locally computed regime value is rendered on that surface
  And the tool's genuinely tool-specific signal remains registered as its own facet
```

## Consumer Impact Sweep

This scope retires the duplicate regime derivations and replaces each with a read over the single published composer output, so every page that rendered a locally derived regime value is a consumer of the removal. The enumeration below names each retired derivation together with the first-party pages that read it. A stale-reference scan must return zero remaining first-party callers of a retired derivation and zero surfaces rendering a second, locally computed regime value.

| Retired derivation | Path | First-party readers of that derivation |
| --- | --- | --- |
| Local macro-regime classification | `rlg.js` `macroRegime()` | `intraday-tape-lab.html`, `market-brief.html` — both move to the `macro-regime-legacy/v1` projection read. |
| Local band derivation | `rlexperience-adapters/market-structure.js` `regimeBand(fg, trend, vix)` | `swing-structure-lab.html` — moves to the `market-structure-band-legacy/v1` projection read. |
| Inline in-page regime copy | the inline regime copy inside `intraday-tape-lab.html` | That page itself — the inline copy is removed and the page reads context through `RLREGIME.readPublishedContext`. |
| Legacy vocabulary consumers at large | `macro-regime-legacy/v1`, `market-structure-band-legacy/v1` projections | Every remaining reader of either legacy vocabulary resolves from one fingerprint, so the previously live cross-page disagreement resolves structurally rather than as a silent difference. |

Stale-reference scan surface: every navigation entry, every deep link, and every in-page redirect that targets a page whose regime read moved, plus every remaining first-party call site of `macroRegime()` or `regimeBand(` and every remaining inline regime derivation across `*.html`, `*.js`, `*.mjs`, and `notes/**`.

## Implementation Plan

1. **`rlg.js` macro-regime reader.** Replace the local classification in `macroRegime()` with a thin read over `RLREGIME.projectCompatibility(…, 'macro-regime-legacy/v1')`. It carries its declared-lossy field list and a deprecation date and stops classifying entirely.
2. **`rlexperience-adapters/market-structure.js` band reader.** Replace the local `regimeBand(fg, trend, vix)` derivation with a read over `market-structure-band-legacy/v1`. The adapter stops deriving its own band.
3. **Resolve the live divergence.** With both legacy vocabularies now projecting from one fingerprint, the previously-live disagreement between the two band derivations resolves structurally. Any residual mapping loss surfaces as a declared contradiction rather than as a silent difference between two pages.
4. **`intraday-tape-lab.html`.** Delete the inline third regime copy. The tool delegates to the published composed read the same way it already delegates its other structure primitives — a read path, not a recomposition path.
5. **`swing-structure-lab.html`.** Publish its facet through the SCOPE-3 publication contract and read context through `RLREGIME.readPublishedContext`. It never recomposes.
6. **`market-brief.html`.** Render the published composed read with its `k/m`, `absentFacetIds`, and `availability` carried through verbatim. Drop every local regime derivation; a stale published read renders its staleness rather than triggering a local recompute or an upgrade.
7. **Projection-not-recomposition invariant.** Assert per migrated consumer that it holds no registry data, performs no archetype match, and computes no confirmation ratio. Each shim is a dated deprecation surface, and the projection is schedulable before or with migration, never after it.
8. **Single-read rendering.** On each migrated page, exactly one regime read renders and its label matches the published owner read verbatim. The legacy locally-computed band no longer renders anywhere on the page and no second divergent vocabulary appears.
9. **Stale-reference sweep.** Enumerate and clear every remaining first-party reference to the retired local derivations across pages, docs, notes, and registry metadata so no caller resolves to a deleted path.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-06-01 | E2E UI | `e2e-ui` | `tests/market-regime-consumer-migration.spec.mjs` / `intraday-tape-lab renders exactly one regime read matching the published owner read verbatim` | **BS-013-012: A migrated consumer renders the single published read** — `intraday-tape-lab.html` renders exactly one regime read whose label matches the published owner read verbatim; the retired inline third copy renders nowhere on the page and no second divergent vocabulary appears. | `npx --no-install playwright test tests/market-regime-consumer-migration.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-06-02 | E2E UI | `e2e-ui` | `tests/market-regime-consumer-migration.spec.mjs` / `swing-structure-lab publishes its facet and reads context without recomposing` | **BS-013-012: A migrated consumer renders the single published read** — `swing-structure-lab.html` publishes its facet through the SCOPE-3 publication contract, reads context through `RLREGIME.readPublishedContext`, and renders exactly one regime read; no locally recomposed verdict renders. | `npx --no-install playwright test tests/market-regime-consumer-migration.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-06-03 | E2E UI | `e2e-ui` | `tests/market-regime-consumer-migration.spec.mjs` / `market-brief renders the published composed read carrying k/m, absentFacetIds, and availability verbatim` | **BS-013-012: A migrated consumer renders the single published read** — `market-brief.html` renders the published composed read with its `k/m`, `absentFacetIds`, and `availability` carried through verbatim; a stale published read renders its staleness rather than triggering a local recompute or an upgrade. | `npx --no-install playwright test tests/market-regime-consumer-migration.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-06-04 | Integration | `integration` | `scripts/selftest.mjs` group `regime-primitives` / `zero inline regime copies remain in any migrated consumer` | **Duplicate retirement** — a repository-wide scan proves zero inline regime copies survive: the inline third copy formerly at `intraday-tape-lab.html:1772` is deleted rather than commented out or guarded, and no migrated consumer file contains a local regime classification block. | `node scripts/selftest.mjs` | No |
| TP-06-05 | Integration | `integration` | `scripts/selftest.mjs` group `rlregime-projection` / `a migrated consumer holds no registry data, performs no archetype match, and computes no confirmation ratio` | **BS-013-011: A consumer reads the published owner read and cannot recompute or upgrade it** — each migrated consumer is asserted to hold no registry data, run no archetype match, and compute no confirmation ratio; the read path exposes no recomposition or upgrade entry point. | `node scripts/selftest.mjs` | No |
| TP-06-06 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime-projection` / `macro-regime-legacy/v1 and market-structure-band-legacy/v1 both project from one fingerprint and are lossless or declared lossy` | Both retained legacy vocabularies still project correctly: `rlg.js` reads `macro-regime-legacy/v1` and `rlexperience-adapters/market-structure.js` reads `market-structure-band-legacy/v1`, each carrying its declared-lossy field list and deprecation date, and both resolving from the same fingerprint so the previously-live band divergence resolves structurally. | `node scripts/selftest.mjs` | No |
| TP-06-07 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime-projection` / `a compatibility projection is never re-composed back into a facet` | **BS-013-011: A consumer reads the published owner read and cannot recompute or upgrade it** — a projected legacy value offered back as a `RegimeFacetContract` input is rejected with its typed schema error; the projection is a terminal read surface and cannot re-enter composition as a facet. | `node scripts/selftest.mjs` | No |
| TP-06-08 | E2E UI | `e2e-ui` | `tests/market-regime-consumer-migration.spec.mjs` / `intraday-tape-lab renders exactly one regime read matching the published owner read verbatim` | **ADVERSARIAL RED-bite** — reintroduce an inline regime copy into `intraday-tape-lab.html` so a second locally-derived regime label renders beside the published read. The named test `intraday-tape-lab renders exactly one regime read matching the published owner read verbatim` MUST fail under that mutation and MUST pass against the delivered migration. | `npx --no-install playwright test tests/market-regime-consumer-migration.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-06-09 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the migration and projection assertions this scope adds | Broad-suite regression: the full selftest suite stays green after the duplicate retirement, every pre-existing group (including the SCOPE-1 through SCOPE-5 groups) is preserved byte-for-byte, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |
| TP-06-10 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-011 and BS-013-012 migrated consumers render the one published read and cannot recompute it` | Persistent scenario-specific regression coverage for this scope's migration behavior: a permanently registered case in the feature's real-page regression spec re-asserts that every migrated consumer renders the single published owner read or its declared legacy projection, and that no consumer recomputes or upgrades the regime locally. A re-introduced inline regime copy fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Items

- [ ] `[TP-06-01]` `[BS-013-012]` `intraday-tape-lab.html` renders exactly one regime read whose label matches the published owner read verbatim.
- [ ] `[TP-06-02]` `[BS-013-012]` `swing-structure-lab.html` publishes its facet and reads context without recomposing, rendering exactly one regime read.
- [ ] `[TP-06-03]` `[BS-013-012]` `market-brief.html` renders the published composed read with `k/m`, `absentFacetIds`, and `availability` carried through verbatim.
- [ ] `[TP-06-04]` A repository-wide scan proves zero inline regime copies remain and the inline copy formerly at `intraday-tape-lab.html:1772` is deleted rather than guarded.
- [ ] `[TP-06-05]` `[BS-013-011]` Each migrated consumer holds no registry data, runs no archetype match, and computes no confirmation ratio.
- [ ] `[TP-06-06]` `macro-regime-legacy/v1` and `market-structure-band-legacy/v1` both project from one fingerprint, each carrying its declared-lossy field list and deprecation date.
- [ ] `[TP-06-07]` `[BS-013-011]` A compatibility projection offered back as a facet input is rejected with its typed schema error and cannot re-enter composition.
- [ ] `[TP-06-08]` The adversarial reintroduced inline regime copy makes the named single-read assertion fail before the delivered migration and pass after it.
- [ ] `[TP-06-09]` The complete selftest suite stays green after the duplicate retirement, every pre-existing group preserved and no decreased passing count.
- [ ] `[BS-013-011]` A consumer is refused a locally recomputed or freshened regime: the stale published read renders with its stale marker and original cutoff intact, no facet is recomputed locally, and the stale read is never presented as fresh.
- [ ] `[BS-013-012]` An inline duplicate is replaced by consumption of the published read: the migrated tool displays the single published read with the composer's cutoff and horizon, no second locally computed regime value is rendered, and the tool's genuinely tool-specific signal remains registered as its own facet.
- [ ] `[BS-013-011]` A stale published read renders its staleness with a reason and a what-would-resolve statement; no consumer substitutes a recompute, an upgrade, a zero, a dash, or a neutral value for it.
- [ ] Zero first-party references to the retired local regime derivations remain across pages, docs, notes, and registry metadata; no caller resolves to a deleted path.
- [ ] `rlexperience.js` and `rljourney.js` are byte-for-byte unmodified, and no path outside this scope's Implementation Files table is touched.
- [ ] Consumer impact sweep is completed for every retired derivation and reader enumerated in this scope's `## Consumer Impact Sweep` section, and zero stale first-party references remain — no remaining first-party call site of `macroRegime()` or `regimeBand(`, no remaining inline regime derivation, and every navigation entry, deep link, and in-page redirect targeting a migrated surface still resolves.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-06-10]` the feature's real-page regression spec holds a permanently registered case asserting that every migrated consumer renders the single published owner read or its declared legacy projection and that no consumer recomputes or upgrades the regime locally.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
