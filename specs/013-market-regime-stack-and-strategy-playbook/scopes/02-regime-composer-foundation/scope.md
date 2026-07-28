# SCOPE-2: Regime facet contract + composer foundation

**Status:** Not Started
**Tags:** `foundation:true`, `tier:2`, `pure-module:true`
**Depends On:** SCOPE-1

## Objective

Ship the Tier 2 sole composer `RLREGIME` and the closed archetype registry so the repository has exactly one place where a combined regime is named. The composer owns facet validation, horizon isolation, persistence, confirmation arithmetic, contradiction surfacing, archetype match-or-fingerprint semantics, sleeve-fit shape, the owner-read contract, the compatibility projection, and `readPublishedContext`. Nothing downstream may re-derive any of it.

## Implementation Files

| File | Change |
|---|---|
| `rlregime.js` | **New.** Tier 2 sole composer `RLREGIME` — facet validation, persistence, confirmation, contradictions, `composeRegime`, archetype match, sleeve fits, owner read, compatibility projection, `readPublishedContext`. |
| `regime-archetypes.json` | **New.** `regime-archetype-registry/v1` — fully-enumerated facet-value tuples plus the `sleeve-fit` and legacy-projection cells. No wildcards, no ranges. |

No other path is touched by this scope.

## Gherkin Scenarios

### BS-013-001: Combined regime composes from current facets and names an enumerated archetype

```gherkin
Scenario: An enumerated facet combination resolves to its defined archetype
  Given the trend-structure facet reads "risk-on" at the structural horizon
  And the credit facet reads "spreads-tightening" at the structural horizon
  And the breadth-participation facet reads "broadening" at the swing horizon
  And an archetype is enumerated for exactly that combination of facet values
  When the researcher opens the combined regime surface
  Then the composed regime displays that enumerated archetype by name
  And the archetype cites each contributing facet with its value and horizon
  And the confirmation ratio counts three available facets in its denominator
```

### BS-013-002: A non-enumerated combination renders as a fingerprint with no invented label

```gherkin
Scenario: An unmatched facet combination refuses to be named
  Given the current set of facet values matches no enumerated archetype definition
  When the researcher opens the combined regime surface
  Then the composed regime renders the ordered facet fingerprint
  And the archetype field reads "Mixed" or "Unresolved"
  And no nearest-neighbour, majority-vote, or approximate archetype name is displayed
  And the fingerprint remains individually readable facet by facet
```

### BS-013-004: A facet shorter than the requested horizon is excluded from that read

```gherkin
Scenario: A tactical facet cannot participate in a structural read
  Given the researcher requests the combined regime at the structural horizon
  And the volatility facet is declared at the tactical horizon
  When the system composes the structural read
  Then the tactical facet is excluded from that read
  And the exclusion is shown with the reason "horizon shorter than requested read"
  And the structural confirmation denominator does not count the excluded facet
```

### BS-013-006: A stale facet degrades to unavailable and shrinks the denominator

```gherkin
Scenario: An expired facet is removed from agreement rather than defaulted
  Given the credit facet's data cutoff is older than its declared freshness window
  And four other facets are fresh
  When the system composes the combined regime
  Then the credit facet is marked stale with its age and then reported unavailable
  And the confirmation denominator counts four facets, not five
  And the credit facet is not mapped to Neutral, zero, or any in-vocabulary value
```

### BS-013-007: A facet contradiction stays visible and is never averaged into the headline

```gherkin
Scenario: Disagreeing facets produce a displayed contradiction record
  Given the breadth-participation facet reads "narrowing"
  And the trend-structure facet reads "risk-on"
  And both facets are fresh
  When the system composes the combined regime
  Then a contradiction record names both facets, their values, and their horizons
  And the contradiction is displayed alongside the headline archetype
  And no average, precedence rule, or majority vote has collapsed the two values
```

### BS-013-008: A regime label does not flip until the persistence gate is met

```gherkin
Scenario: A one-print change stays a candidate transition
  Given the confirmed archetype has held for twelve consecutive observations
  And the persistence gate requires a minimum confirmed run length
  When a single new observation would imply a different archetype
  Then the transition is recorded with state "candidate"
  And the displayed archetype remains the previously confirmed one
  And the candidate transition is visible with its current run length
```

### BS-013-009: Historical regime series are as-of-safe and a hindsight-smoothed label is refused

```gherkin
Scenario: A historical label is computed only from data available at its own timestamp
  Given the auditor requests the regime series for a past date
  And later observations exist after that date
  When the system builds the historical series
  Then each historical label uses only observations at or before its own as-of stamp
  And a label produced by smoothing across later observations is rejected
  And the rejection states that the label was not as-of-safe
```

## Consumer Impact Sweep

This scope makes `RLREGIME` the sole composer and moves regime naming out of every place that previously derived it, so every first-party reader of a regime value becomes a consumer of the contract published here. The enumeration below is the complete first-party consumer set bound by that contract; SCOPE-6 executes the projection-reader migration against this same enumeration. A stale-reference scan must return zero remaining first-party references to a locally derived regime name once the migration lands.

| Consumer surface | Path | What the composed contract changes for it |
| --- | --- | --- |
| Tool-page owner read | `market-regime-lab.html` | Renders the composed verdict read through `RLREGIME.readPublishedContext` and names no regime itself. |
| Headless derived read | `scripts/brief-refresh.mjs` | Consumes the composed owner read as a `DERIVED` adapter instead of re-deriving a regime label. |
| Legacy macro-regime projection reader | `rlg.js` `macroRegime()` | Reads `RLREGIME.projectCompatibility(…, 'macro-regime-legacy/v1')`; its local classification stops being an authority. |
| Legacy band projection reader | `rlexperience-adapters/market-structure.js` `regimeBand()` | Reads `market-structure-band-legacy/v1` from the same fingerprint instead of deriving its own band. |
| Shared navigation and landing inventory | `rlnav.js` `TOOLS` array, `index.html` `TOOLS` array | The navigation entries and landing-page deep link targets that route a reader to a regime surface must continue to resolve unchanged. |
| Handoff documentation | `notes/market-regime-lab.md` | Names the composer as the single regime-naming authority so no doc points a reader at a retired derivation. |

Stale-reference scan surface: every navigation entry, every landing-page deep link, and every in-page redirect that targets a regime read, plus every remaining textual reference to a locally computed regime name across `*.html`, `*.js`, `*.mjs`, `notes/**`, and the registry JSON files.

## Implementation Plan

1. **UMD wrapper.** Author `rlregime.js` with the same single IIFE shape as SCOPE-1, throwing the named `RLREGIME_BROWSER_GLOBAL_UNAVAILABLE` when neither host exists, and deep-freezing the API before publication.
2. **`RegimeFacetContract` and `FacetHorizonClass`.** Define the facet shape and the closed horizon enum (`structural`, `swing`, `tactical`). A facet's declared class is immutable at declaration. Enforce the isolation rule: a tactical facet may never move a structural value or a structural persistence counter.
3. **Typed closed vocabularies.** Validate each facet against its `kind`-keyed closed vocabulary (sentiment-stress, trend-structure, breadth-participation, credit, curve, duration-posture, volatility-magnitude, ratio-derived), each versioned by `valueVocabularyId`. Reject a `volatility-magnitude` facet wherever a directional regime is expected, because that model is magnitude-only with zero direction.
4. **Horizon eligibility.** A facet whose history is shorter than the requested horizon is excluded from that read and from both the numerator and the denominator of that horizon lane, with the shortfall stated on the returned reading.
5. **Staleness degradation.** A facet past its cutoff returns `unavailable` with a reason and what-would-resolve, and the confirmation denominator shrinks to match. No zero, dash, blank, or `Neutral` substitutes for the missing facet, and the shrink is carried as returned data (`k/m`, `absentFacetIds`) so the surface can render it inline.
6. **Contradiction surfacing.** Two facets disagreeing across horizons produce a first-class contradiction record naming both facets, both values, and both horizons. The headline verdict carries no averaged value, no majority resolution, and no confidence number standing in for the conflict.
7. **Persistence gate.** A sub-threshold move leaves the composed label unchanged and marks the moving facet `forming`. The label flips only when the persistence gate is met, so no transient flicker is ever emitted.
8. **`composeRegime` and archetype match.** Match the current facet tuple against `regime-archetypes.json`. On a match, emit the enumerated archetype name. On no match, emit the deterministic fingerprint plus the literal `Mixed` or `Unresolved` with the specific unresolved facet pair named. Nearest-neighbour, majority-vote, and generated names are forbidden paths, not fallbacks.
9. **Registry authoring.** Author `regime-archetypes.json` as `regime-archetype-registry/v1` with fully-enumerated facet-value tuples — no wildcards and no ranges — plus the `sleeve-fit` cells (dividend, bond, commodity, equity, cash-barbell with sub-type separation preserved) and the legacy-projection cells for `macro-regime-legacy/v1` and `market-structure-band-legacy/v1`.
10. **As-of-safe history.** Every historical point carries its own as-of cutoff and is composed only from bars available at that cutoff. A hindsight-smoothing request returns an explicit refusal with its reason instead of a smoothed line or a silently re-labelled series.
11. **Sleeve-fit shape.** Emit ordinal relative rank, `rationaleFacetIds`, and an invalidation condition. Enforce the forbidden-output vocabulary (weight, allocation, exposure, target, position size, buy/sell/hold) at the contract boundary and emit the explicit no-advantage state rather than a forced `1..n` ordering.
12. **Owner read, projection, and published-context read.** Define `RegimeOwnerReadContract` including `k/m`, `absentFacetIds`, `availability`, and the `evidenceFamilyId` double-count guard that consumes SCOPE-1's family collapse. Implement `projectCompatibility` as a read-only lossless-or-declared-lossy projection, and `readPublishedContext` as the read-only consumer entry point that exposes no recomposition path.
13. **Typed failures and null safety.** Malformed contract input throws a typed `RLREGIME_*` error carrying `.code` and `.path`; data absence degrades to a typed state and never throws. All numeric guards use `Number.isFinite`.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `RLREGIME composeRegime names the enumerated archetype on an exact facet tuple match` | **BS-013-001: Combined regime composes from current facets and names an enumerated archetype** — a facet tuple with an exact entry in `regime-archetypes.json` composes to that enumerated archetype name together with its `k/m` confirmation denominator. | `node scripts/selftest.mjs` | No |
| TP-02-02 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `RLREGIME composeRegime emits a fingerprint plus Mixed or Unresolved and never an invented label` | **BS-013-002: A non-enumerated combination renders as a fingerprint with no invented label** — an unmatched tuple emits the deterministic `fingerprintId` plus the literal `Mixed` or `Unresolved` with `unresolvedFacetPair` named; nearest-neighbour, majority-vote, and generated names are absent. | `node scripts/selftest.mjs` | No |
| TP-02-03 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `RLREGIME excludes a facet shorter than the requested horizon from both numerator and denominator` | **BS-013-004: A facet shorter than the requested horizon is excluded from that read** — the short facet is excluded from that horizon lane's `k` and `m`, appears in `excludedFacetIds`, and its shortfall is stated on the returned reading. | `node scripts/selftest.mjs` | No |
| TP-02-04 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `RLREGIME degrades a stale facet to unavailable and shrinks the denominator with absentFacetIds` | **BS-013-006: A stale facet degrades to unavailable and shrinks the denominator** — a facet past its cutoff returns `unavailable` with a reason and what-would-resolve, `m` shrinks to match with populated `absentFacetIds`, `m === 0` produces `unavailable` rather than `0`, and no zero, dash, blank, or `Neutral` substitutes for it. | `node scripts/selftest.mjs` | No |
| TP-02-05 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `RLREGIME surfaces a cross-horizon facet contradiction as a first-class record and never averages it` | **BS-013-007: A facet contradiction stays visible and is never averaged into the headline** — the contradiction record names both facets, both values, and both horizons, and the headline verdict carries no averaged value, no majority resolution, and no confidence number standing in for the conflict. | `node scripts/selftest.mjs` | No |
| TP-02-06 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `RLREGIME holds the composed label and marks the facet forming until the persistence gate is met` | **BS-013-008: A regime label does not flip until the persistence gate is met** — a sub-threshold move leaves the composed label unchanged and marks the moving facet `forming`; the label flips only once the gate is met, so no transient flicker is emitted. | `node scripts/selftest.mjs` | No |
| TP-02-07 | Integration | `integration` | `scripts/selftest.mjs` group `rlregime-history` / `RLREGIME history is as-of-safe per point and refuses a hindsight-smoothed series` | **BS-013-009: Historical regime series are as-of-safe and a hindsight-smoothed label is refused** — every historical point composes only from bars available at its own `observedAsOf`/`retrievedAt` cutoff, and a hindsight-smoothing request returns an explicit typed refusal with its reason instead of a smoothed or silently re-labelled series. | `node scripts/selftest.mjs` | No |
| TP-02-08 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime` / `RLREGIME validates facets against their kind-keyed closed vocabulary and rejects volatility-magnitude where a direction is expected` | Contract-surface behavior of the facet layer: each `kind`-keyed closed vocabulary is enforced against its `valueVocabularyId`, `FacetHorizonClass` is immutable at declaration, a tactical facet cannot move a structural value or a structural persistence counter, and a `volatility-magnitude` facet is rejected wherever a directional regime is expected. | `node scripts/selftest.mjs` | No |
| TP-02-09 | Integration | `integration` | `scripts/selftest.mjs` group `rlregime-projection` / `RLREGIME projectCompatibility is read-only lossless-or-declared-lossy and readPublishedContext exposes no recomposition path` | The compatibility projection reproduces `macro-regime-legacy/v1` and `market-structure-band-legacy/v1` cells without mutating the source read and declares any lossy cell; `readPublishedContext` returns `isRecomputation: false`, holds no registry, and raises `RLREGIME_SCHEMA_INVALID` at `publishedRegime` when handed a raw facet array. | `node scripts/selftest.mjs` | No |
| TP-02-10 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `RLREGIME sleeveFits are ordinal-only with rationale and invalidation and reject the forbidden-output vocabulary` | Sleeve-fit shape and determinism: rows carry ordinal relative rank, `rationaleFacetIds`, and an invalidation condition; the forbidden-output tokens (weight, allocation, exposure, target, position size, buy/sell/hold) are rejected at the contract boundary; a flat input emits the explicit no-advantage state instead of a forced `1..n` ordering; and identical frozen input at an identical `decisionTime` yields byte-identical output and `fingerprintId`. | `node scripts/selftest.mjs` | No |
| TP-02-11 | Functional | `functional` | `scripts/selftest.mjs` groups `rlregime-compose` and `rlregime` / `RLREGIME holds the composed label and marks the facet forming until the persistence gate is met` and `RLREGIME readPublishedContext refuses a raw facet array with RLREGIME_SCHEMA_INVALID at publishedRegime` | **ADVERSARIAL RED-bite** — two mutations, each of which MUST fail a named assertion: (a) neutralize the hysteresis gate so a sub-threshold move flips the composed label immediately, which MUST fail `RLREGIME holds the composed label and marks the facet forming until the persistence gate is met`; (b) let a facet source path reach `composeRegime` by allowing `readPublishedContext` to accept a raw facet array and recompute, which MUST fail `RLREGIME readPublishedContext refuses a raw facet array with RLREGIME_SCHEMA_INVALID at publishedRegime`. Both named assertions MUST pass against the delivered composer. | `node scripts/selftest.mjs` | No |
| TP-02-12 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the additive `rlregime`, `rlregime-compose`, `rlregime-history`, and `rlregime-projection` groups | Broad-suite regression: the full selftest suite stays green with the new composer groups added, every pre-existing group (including SCOPE-1's `rlratio` groups) is preserved byte-for-byte, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |
| TP-02-13 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `RLREGIME records a one-print archetype change as a candidate transition and holds the displayed label` | **BS-013-008: A one-print change stays a candidate transition** — after the confirmed archetype has held for twelve consecutive observations, a single new observation implying a different archetype is recorded with state `candidate`, the displayed archetype remains the previously confirmed one, and the candidate transition is visible with its current run length. | `node scripts/selftest.mjs` | No |
| TP-02-14 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-002 and BS-013-008 non-enumerated combinations stay fingerprints and labels hold the persistence gate` | Persistent scenario-specific regression coverage for this scope's composer behavior: a permanently registered case in the feature's real-page regression spec re-asserts that a non-enumerated facet tuple renders as a fingerprint with no invented archetype label and that a regime label does not flip until the persistence gate is met. A re-introduced invented label or a premature flip fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Items

- [ ] `[TP-02-01]` `[BS-013-001]` A matched facet tuple composes to its enumerated archetype name together with its `k/m` confirmation denominator.
- [ ] `[TP-02-02]` `[BS-013-002]` An unmatched tuple emits the deterministic fingerprint plus the literal `Mixed` or `Unresolved` with the unresolved facet pair named, and no nearest-neighbour, majority-vote, or generated name.
- [ ] `[TP-02-03]` `[BS-013-004]` A facet shorter than the requested horizon is excluded from that lane's numerator and denominator with its shortfall stated on the reading.
- [ ] `[TP-02-04]` `[BS-013-006]` An expired facet is removed from agreement rather than defaulted: a credit facet whose cutoff is older than its declared freshness window is marked stale with its age and then reported `unavailable`, the confirmation denominator counts four facets rather than five with populated `absentFacetIds`, `m === 0` produces `unavailable` rather than `0`, and the credit facet is not mapped to Neutral, zero, or any in-vocabulary value.
- [ ] `[TP-02-05]` `[BS-013-007]` A cross-horizon contradiction is a first-class record naming both facets, values, and horizons, and the headline carries no averaged, majority-resolved, or confidence-substituted value.
- [ ] `[TP-02-06]` `[BS-013-008]` A sub-threshold move leaves the composed label unchanged and marks the moving facet `forming`; the label flips only when the persistence gate is met.
- [ ] `[TP-02-07]` `[BS-013-009]` A historical label is computed only from data available at its own timestamp: each historical label uses only observations at or before its own as-of stamp, a label produced by smoothing across later observations is rejected, and the rejection states that the label was not as-of-safe.
- [ ] `[TP-02-08]` `[BS-013-004]` Closed `kind`-keyed vocabularies are enforced by `valueVocabularyId`, horizon class is immutable at declaration, tactical facets cannot move structural state, and `volatility-magnitude` is rejected wherever a directional regime is expected.
- [ ] `[TP-02-09]` `[BS-013-001]` `projectCompatibility` is a read-only lossless-or-declared-lossy projection and `readPublishedContext` exposes no recomposition path.
- [ ] `[TP-02-10]` `[BS-013-001]` Sleeve fits emit ordinal rank, `rationaleFacetIds`, and an invalidation condition only; the forbidden-output vocabulary is rejected at the contract boundary and a flat input emits the explicit no-advantage state.
- [ ] `[TP-02-11]` The adversarial hysteresis-gate and `readPublishedContext`-recomputation mutations each make their named assertion fail before the delivered composer and pass after it.
- [ ] `[TP-02-12]` The complete selftest suite stays green with the additive composer groups, every pre-existing group preserved and no decreased passing count.
- [ ] `[TP-02-13]` `[BS-013-008]` A one-print change stays a candidate transition: when the confirmed archetype has held for twelve consecutive observations and a single new observation would imply a different archetype, the transition is recorded with state `candidate`, the displayed archetype remains the previously confirmed one, and the candidate transition is visible with its current run length.
- [ ] `[BS-013-006]` Every degraded state is typed and carries a reason code plus a what-would-resolve statement; no zero, dash, blank, or `Neutral` value stands in for a missing facet.
- [ ] `[BS-013-002]` `rlregime.js` and `regime-archetypes.json` carry no default value, no fallback path, and no stub: the archetype registry is fully enumerated with no wildcards and no ranges, and unmatched tuples resolve through the declared fingerprint path.
- [ ] `[BS-013-001]` Identical frozen input at an identical `decisionTime` produces byte-identical composed output and an identical `fingerprintId`.
- [ ] `[BS-013-001]` Every numeric guard in new code uses `Number.isFinite`; the global `isFinite` appears zero times in `rlregime.js`.
- [ ] Consumer impact sweep is completed for every consumer surface enumerated in this scope's `## Consumer Impact Sweep` section, and zero stale first-party references remain to a locally derived regime name across navigation entries, landing-page deep links, in-page redirects, `*.html`, `*.js`, `*.mjs`, `notes/**`, and the registry JSON files.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-02-14]` the feature's real-page regression spec holds a permanently registered case asserting that a non-enumerated facet tuple renders as a fingerprint with no invented archetype label and that a regime label does not flip until the persistence gate is met.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
