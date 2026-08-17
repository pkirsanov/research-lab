# SCOPE-1: Ratio capability foundation

**Status:** In Progress
**Tags:** `foundation:true`, `tier:0.5`, `pure-module:true`
**Depends On:** —

## Objective

Ship the Tier 0.5 pure `RLRATIO` primitive and its declared pair registry so that every ratio-derived facet in the feature draws its level, trend, window-declared z-score, family grouping, and comparability verdict from one source. The primitive holds no regime vocabulary: it answers "is this pair comparable, and what does it read" and nothing about what regime that implies.

## Implementation Files

| File | Change |
|---|---|
| `./rlratio.js` | **New.** Tier 0.5 pure `RLRATIO` primitive — ratio math, window stats, family grouping, comparability/adjustment parity. |
| `./ratio-pairs.json` | **New.** `ratio-pair-registry/v1` — declared pairs with `pairId`, legs, `lookbackBars`, `semanticClass`, `ratioFamilyId`, refs. |

No other path is touched by this scope.

## Gherkin Scenarios

### BS-013-013: A named ratio pair reports level, trend, and a window-declared z-score

```gherkin
Scenario: A pair read carries its full measurement contract
  Given the ratio pair "gold/silver" is registered with a declared lookback window
  And the pair declares its direction convention
  When the researcher inspects the pair
  Then the read reports the current level, the trend over the declared window, and a z-score
  And the z-score names the exact window it was normalized over
  And the declared direction convention is displayed with the read
  And any proxy caveat attached to the pair is displayed with the read
```

### BS-013-014: Overlapping ratio pairs count as one evidence family

```gherkin
Scenario: Two semiconductor-versus-market pairs do not double-count as confirmation
  Given the ratio pair "SOXX/SPY" is available
  And the ratio pair "SMH/SPY" is available
  And both pairs are assigned to the same evidence family
  When the system computes the confirmation ratio for the composed regime
  Then the two pairs contribute one unit to the confirmation denominator
  And the surface states that the two pairs are one evidence family
  And the composed regime does not report two independent confirmations
```

### BS-013-015: A pair with mismatched adjustment or short history reports unavailable

```gherkin
Scenario: An incomparable pair refuses to emit a number
  Given one leg of a ratio pair uses total-return adjusted series
  And the other leg uses price-only series
  When the pair is computed
  Then the pair reports "unavailable" with the adjustment mismatch as the reason
  And no ratio level, trend, or z-score is emitted for that pair
  And the same "unavailable" outcome applies when either leg has less history than the declared lookback
```

### BS-013-016: An international pair honors session and FX alignment or reports not-comparable

```gherkin
Scenario: A cross-session pair without alignment is refused
  Given a ratio pair whose legs trade in different market sessions
  And the pair declares a required session and FX alignment rule
  When the alignment rule cannot be satisfied for the requested window
  Then the pair reports "not-comparable" with the failing alignment named
  And no ratio value is emitted from misaligned observations
  And when alignment is satisfied the pair emits its read with the alignment basis shown
```

## Implementation Plan

1. **UMD wrapper.** Author `./rlratio.js` with the single shared IIFE shape stated once in `design.md` → `## Module Contracts`: deep-freeze the factory return before publication, prefer `module.exports` when present, otherwise assign `globalThis.RLRATIO`, and throw the named `RLRATIO_BROWSER_GLOBAL_UNAVAILABLE` when neither host exists. No silent no-op, no partial export.
2. **Pair registry.** Author `./ratio-pairs.json` as `ratio-pair-registry/v1`. Each entry declares `pairId`, both legs, `lookbackBars`, `semanticClass` drawn from the closed set (risk-appetite, breadth, style, credit, safety, global, dollar), `ratioFamilyId`, and its refs. Lookbacks are declared in bars, never in calendar days, so the declared window is exact.
3. **Ratio math and window stats.** Compute level and trend over the date intersection of both legs with as-of-safe truncation — no point may use a bar dated after the requested as-of. The z-score carries its declared window as a returned field so the consumer renders it as adjacent text rather than recovering it from a tooltip.
4. **Family grouping.** Implement `groupByFamily` so pairs sharing a `ratioFamilyId` collapse to a single evidence family. The collapse runs before any confirmation arithmetic downstream, which is what stops overlapping pairs from double-counting.
5. **Comparability and adjustment parity.** Implement the comparability predicate: a pair whose legs disagree on distribution adjustment, or whose intersected history is shorter than `lookbackBars`, returns `unavailable` with the specific reason. A cross-session or unaligned-FX pair returns `not-comparable` naming the session or FX misalignment. Neither state emits a level, trend, or z-score number.
6. **Caveat propagation.** A pair whose legs carry proxy or coverage caveats propagates those caveats on the returned reading rather than dropping them at the boundary.
7. **Typed failures.** Malformed contract input throws a typed `RLRATIO_*` error carrying `.code` and `.path`. Data absence never throws — it degrades to the typed `unavailable` / `not-comparable` states above.
8. **Null-safe arithmetic.** Every numeric guard uses `Number.isFinite`; the global `isFinite` is forbidden because it admits `null` and turns a missing leg into a thrown `.toFixed()`.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Unit | `unit` | `scripts/selftest.mjs` group `rlratio` / `RLRATIO ratioSeries returns level, trend, and a z-score carrying its declared window` | **BS-013-013: A named ratio pair reports level, trend, and a window-declared z-score** — a declared `pairId` returns level and trend over the as-of-safe date intersection of both legs, and the z-score carries its declared `lookbackBars` window as a returned field rather than an implicit one. | `node scripts/selftest.mjs` | No |
| TP-01-02 | Unit | `unit` | `scripts/selftest.mjs` group `rlratio` / `RLRATIO groupByFamily collapses same-ratioFamilyId pairs to confirmationWeight 1` | **BS-013-014: Overlapping ratio pairs count as one evidence family** — two pairs sharing a `ratioFamilyId` collapse into one evidence family contributing `confirmationWeight: 1`, and the collapse runs before any downstream confirmation arithmetic. | `node scripts/selftest.mjs` | No |
| TP-01-03 | Unit | `unit` | `scripts/selftest.mjs` group `rlratio` / `RLRATIO reports unavailable with a reason on adjustment mismatch or short intersected history` | **BS-013-015: A pair with mismatched adjustment or short history reports unavailable** — legs disagreeing on distribution adjustment, or an intersected history shorter than `lookbackBars`, return `unavailable` with the specific reason code and emit no level, trend, or z-score number. | `node scripts/selftest.mjs` | No |
| TP-01-04 | Unit | `unit` | `scripts/selftest.mjs` group `rlratio` / `RLRATIO reports not-comparable naming the session or FX misalignment` | **BS-013-016: An international pair honors session and FX alignment or reports not-comparable** — a cross-session or unaligned-FX pair returns `not-comparable` naming the misaligned session or FX leg, and emits no reading number. | `node scripts/selftest.mjs` | No |
| TP-01-05 | Functional | `functional` | `scripts/selftest.mjs` group `rlratio` / `RLRATIO throws typed RLRATIO_* errors, deep-freezes its export, and propagates leg caveats` | Contract-boundary behavior across the primitive: malformed input raises each declared `RLRATIO_*` code at its declared `.path`, the factory return is deep-frozen before publication, `RLRATIO_BROWSER_GLOBAL_UNAVAILABLE` is raised when neither host exists, and proxy/coverage caveats on a leg propagate onto the returned reading. | `node scripts/selftest.mjs` | No |
| TP-01-06 | Unit | `unit` | `scripts/selftest.mjs` group `rlratio` / `RLRATIO groupByFamily collapses same-ratioFamilyId pairs to confirmationWeight 1` | **ADVERSARIAL RED-bite** — collapse the `SOXX/SPY` + `SMH/SPY` shared-family grouping so `groupByFamily` returns per-pair weight and the confirmation weight becomes `2`. The named test `RLRATIO groupByFamily collapses same-ratioFamilyId pairs to confirmationWeight 1` MUST fail under that mutation and MUST pass against the delivered grouping. | `node scripts/selftest.mjs` | No |
| TP-01-07 | Load | `load` | `scripts/selftest.mjs` group `rlratio-scale` / `RLRATIO ratioSeries and windowStats stay within budget and deterministic at the largest declared lookbackBars` | Long synthetic bar histories at the largest declared `lookbackBars`: the date intersection and window statistics stay within the stated compute budget and return byte-identical output for identical frozen input. | `node scripts/selftest.mjs` | No |
| TP-01-08 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the additive `rlratio` and `rlratio-scale` groups | Broad-suite regression: the full selftest suite stays green with the new groups added, every pre-existing group is preserved byte-for-byte, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |
| TP-01-09 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-014 shared-family ratio pairs stay one evidence family and an incomparable pair emits no number` | Persistent scenario-specific regression coverage for this scope's ratio behavior: a permanently registered case in the feature's real-page regression spec re-asserts that `SOXX/SPY` and `SMH/SPY` collapse to one evidence family and that an `unavailable` or `not-comparable` pair emits no level, trend, or z-score number. A re-introduced family double-count or a fabricated reading fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

Verified 2026-08-17 by `node scripts/selftest.mjs`. The `rlratio` and `rlratio-scale`
groups are additive: the suite moved from 2457 to 2464 passing, 0 failed.

#### Core Items

- [x] `[TP-01-01]` `[BS-013-013]` A pair read carries its full measurement contract: the read reports the current level, the trend over the declared window, and a z-score that names the exact window it was normalized over, with the declared direction convention and any proxy caveat attached to the pair displayed alongside the read. → Evidence: `RLRATIO ratioSeries returns level, trend, and a z-score carrying its declared window` ✓. `windowStats` returns `windowRef` ON the reading (`{observations, startDate, endDate}`) rather than leaving it implicit, and refuses outright when the window is undeclared. `ratio-pairs.json` carries `directionConvention` and `provenanceCaveat` per pair.
- [x] `[TP-01-02]` `[BS-013-014]` Two semiconductor-versus-market pairs do not double-count as confirmation: `SOXX/SPY` and `SMH/SPY` contribute one unit to the confirmation denominator, the surface states that the two pairs are one evidence family, and the composed regime does not report two independent confirmations. → Evidence: `RLRATIO groupByFamily collapses same-ratioFamilyId pairs to confirmationWeight 1` ✓. Both pairs share `ratioFamilyId: semis-vs-market`; grouping returns 2 families from 3 readings with total weight 2, not 3, and exposes `memberPairIds` so the collapse is visible rather than silent.
- [x] `[TP-01-03]` `[BS-013-015]` An incomparable pair refuses to emit a number: a pair whose legs disagree on distribution adjustment reports `unavailable` naming the adjustment mismatch as the reason, no ratio level, trend, or z-score is emitted for that pair, and the same `unavailable` outcome applies when either leg has less history than the declared lookback. → Evidence: `RLRATIO reports unavailable with a reason on adjustment mismatch or short intersected history` ✓. Observed `ADJUSTMENT_MISMATCH` with `points.length === 0` and `trailingPct === null`, plus `INSUFFICIENT_HISTORY` and `NO_COMMON_DATES`.
- [x] `[TP-01-04]` `[BS-013-016]` A cross-session pair without alignment is refused: an unsatisfiable session or FX alignment rule reports `not-comparable` with the failing alignment named, no ratio value is emitted from misaligned observations, and a satisfied alignment emits the read with its alignment basis shown. → Evidence: `RLRATIO reports not-comparable naming the session or FX misalignment` ✓. Observed `SESSION_MISMATCH` and `CURRENCY_MISMATCH` with zero points, and the aligned control returning `comparable` / `available`.
- [x] `[TP-01-05]` Every declared `RLRATIO_*` typed error is raised at its declared `.path`, the export is deep-frozen, `RLRATIO_BROWSER_GLOBAL_UNAVAILABLE` is raised when neither host exists, and leg caveats propagate onto the reading. → Evidence: `RLRATIO throws typed RLRATIO_* errors, deep-freezes its export, and propagates leg caveats` ✓. Observed `RLRATIO_SCHEMA_INVALID` at `$.rowsA`, `$.windowRef` and `$.readings[0].ratioFamilyId`, `RLRATIO_DECISION_TIME_INVALID`, `RLRATIO_CONTRACT_VERSION`; `Object.isFrozen` true for the export, the series and its points array; the leg caveat survives onto `trailingChange`. The UMD wrapper throws `RLRATIO_BROWSER_GLOBAL_UNAVAILABLE` when neither `module.exports` nor `globalThis` exists.
- [x] `[TP-01-06]` The adversarial `SOXX/SPY` + `SMH/SPY` family-collapse mutation makes the named family-weight assertion fail before the delivered grouping and pass after it. → Evidence: RED-bite executed. Mutating `confirmationWeight: 1` to `family.memberPairIds.length` produced `✗ FAIL: RLRATIO groupByFamily collapses same-ratioFamilyId pairs to confirmationWeight 1` and `2463 passed, 1 failed`, exit 1. Restoring the delivered grouping returned `2464 passed, 0 failed`, exit 0. The assertion discriminates rather than passing by construction.
- [x] `[TP-01-07]` `[BS-013-013]` Long synthetic histories at the largest declared `lookbackBars` stay within the stated compute budget and return byte-identical output for identical frozen input. → Evidence: `RLRATIO ratioSeries and windowStats stay within budget and deterministic at the largest declared lookbackBars` ✓. 3000-bar legs at `lookbackBars: 252` (the largest the registry declares) complete under the 2000 ms budget and produce `JSON.stringify` equality across two runs for both the series and its window statistics.
- [x] `[TP-01-08]` The complete selftest suite stays green with the additive `rlratio` and `rlratio-scale` groups, every pre-existing group preserved and no decreased passing count. → Evidence: `node scripts/selftest.mjs` → `2464 passed, 0 failed`, exit 0. The count rose by exactly the 7 assertions added; no pre-existing group was edited.
- [x] `[BS-013-015]` `[BS-013-016]` Data absence resolves to a typed `unavailable` / `not-comparable` state carrying a reason code and a what-would-resolve statement; no zero, dash, blank, or neutral value stands in for a missing reading. → Evidence: every degraded path returns `availability: 'unavailable'` or `comparability: 'not-comparable'` with one closed reason code from `UNAVAILABLE_REASONS` / `NOT_COMPARABLE_REASONS`, `points: []`, and `trailingPct: null`. Data absence never throws; only malformed CONTRACT input throws.
- [x] `[BS-013-013]` `./rlratio.js` and `./ratio-pairs.json` carry no default value, no fallback path, and no stub: every declared pair states `pairId`, both legs, `lookbackBars` in bars, `semanticClass`, `ratioFamilyId`, and its refs explicitly. → Evidence: `ratio-pairs.json validates as ratio-pair-registry/v1 and rlratio.js carries no global isFinite, ambient clock, or stub` ✓. All 6 pairs validate through `validatePairRegistry`, every `lookbackBars` is an integer ≥ 2 declared in BARS, and no `TODO`/`FIXME`/`STUB` marker appears in either file.
- [x] `[BS-013-013]` Every numeric guard in new code uses `Number.isFinite`; the global `isFinite` appears zero times in `./rlratio.js`. → Evidence: the same assertion greps the delivered source for a bare `isFinite(` and requires zero matches; observed 0. `Date.now()` is likewise absent from the module.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-01-09]` the feature's real-page regression spec holds a permanently registered case asserting that `SOXX/SPY` and `SMH/SPY` collapse to one evidence family and that an `unavailable` or `not-comparable` pair emits no level, trend, or z-score number. → BLOCKED BY SCOPE SEQUENCING, not by this work. TP-01-09 targets `tests/market-regime-lab.spec.mjs`, a real-page spec against `market-regime-lab.html`. That page is scope 04's deliverable, and this scope's Implementation Files table states "No other path is touched by this scope". Writing the page here to satisfy this item would breach this scope's own boundary. The behaviour it asserts IS covered at the unit tier today by TP-01-02 and TP-01-03.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count. → HALF SATISFIED. The selftest half is green: `2464 passed, 0 failed`, up from 2457, no pre-existing group edited. The real-page half depends on the same scope-04 page as the item above and cannot run until it exists.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered. → PARTIALLY SATISFIED and honestly held open. PASS: `artifact-lint.sh` exit 0; selftest `2464 passed, 0 failed` with no decreased count; `validate-node-source-lock.mjs` exit 0; `build-pages-site.mjs` exit 0 with 28 registered pages; zero warnings from the delivered surfaces. NOT PASS: `traceability-guard.sh` reports `RESULT: FAILED (8 failures, 0 warnings)` for this spec directory, because the other 13 scopes of feature 013 are unbuilt and their scenarios have no tests yet. This gate asks for the whole spec directory to be clean, which cannot be true until the remaining scopes land; it is not a defect in this scope's delivery.
