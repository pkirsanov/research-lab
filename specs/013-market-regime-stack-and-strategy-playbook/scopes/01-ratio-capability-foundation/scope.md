# SCOPE-1: Ratio capability foundation

**Status:** Not Started
**Tags:** `foundation:true`, `tier:0.5`, `pure-module:true`
**Depends On:** —

## Objective

Ship the Tier 0.5 pure `RLRATIO` primitive and its declared pair registry so that every ratio-derived facet in the feature draws its level, trend, window-declared z-score, family grouping, and comparability verdict from one source. The primitive holds no regime vocabulary: it answers "is this pair comparable, and what does it read" and nothing about what regime that implies.

## Implementation Files

| File | Change |
|---|---|
| `rlratio.js` | **New.** Tier 0.5 pure `RLRATIO` primitive — ratio math, window stats, family grouping, comparability/adjustment parity. |
| `ratio-pairs.json` | **New.** `ratio-pair-registry/v1` — declared pairs with `pairId`, legs, `lookbackBars`, `semanticClass`, `ratioFamilyId`, refs. |

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

1. **UMD wrapper.** Author `rlratio.js` with the single shared IIFE shape stated once in `design.md` → `## Module Contracts`: deep-freeze the factory return before publication, prefer `module.exports` when present, otherwise assign `globalThis.RLRATIO`, and throw the named `RLRATIO_BROWSER_GLOBAL_UNAVAILABLE` when neither host exists. No silent no-op, no partial export.
2. **Pair registry.** Author `ratio-pairs.json` as `ratio-pair-registry/v1`. Each entry declares `pairId`, both legs, `lookbackBars`, `semanticClass` drawn from the closed set (risk-appetite, breadth, style, credit, safety, global, dollar), `ratioFamilyId`, and its refs. Lookbacks are declared in bars, never in calendar days, so the declared window is exact.
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

### Definition of Done

#### Core Items

- [ ] `[TP-01-01]` `[BS-013-013]` A pair read carries its full measurement contract: the read reports the current level, the trend over the declared window, and a z-score that names the exact window it was normalized over, with the declared direction convention and any proxy caveat attached to the pair displayed alongside the read.
- [ ] `[TP-01-02]` `[BS-013-014]` Two semiconductor-versus-market pairs do not double-count as confirmation: `SOXX/SPY` and `SMH/SPY` contribute one unit to the confirmation denominator, the surface states that the two pairs are one evidence family, and the composed regime does not report two independent confirmations.
- [ ] `[TP-01-03]` `[BS-013-015]` An incomparable pair refuses to emit a number: a pair whose legs disagree on distribution adjustment reports `unavailable` naming the adjustment mismatch as the reason, no ratio level, trend, or z-score is emitted for that pair, and the same `unavailable` outcome applies when either leg has less history than the declared lookback.
- [ ] `[TP-01-04]` `[BS-013-016]` A cross-session pair without alignment is refused: an unsatisfiable session or FX alignment rule reports `not-comparable` with the failing alignment named, no ratio value is emitted from misaligned observations, and a satisfied alignment emits the read with its alignment basis shown.
- [ ] `[TP-01-05]` Every declared `RLRATIO_*` typed error is raised at its declared `.path`, the export is deep-frozen, `RLRATIO_BROWSER_GLOBAL_UNAVAILABLE` is raised when neither host exists, and leg caveats propagate onto the reading.
- [ ] `[TP-01-06]` The adversarial `SOXX/SPY` + `SMH/SPY` family-collapse mutation makes the named family-weight assertion fail before the delivered grouping and pass after it.
- [ ] `[TP-01-07]` `[BS-013-013]` Long synthetic histories at the largest declared `lookbackBars` stay within the stated compute budget and return byte-identical output for identical frozen input.
- [ ] `[TP-01-08]` The complete selftest suite stays green with the additive `rlratio` and `rlratio-scale` groups, every pre-existing group preserved and no decreased passing count.
- [ ] `[BS-013-015]` `[BS-013-016]` Data absence resolves to a typed `unavailable` / `not-comparable` state carrying a reason code and a what-would-resolve statement; no zero, dash, blank, or neutral value stands in for a missing reading.
- [ ] `[BS-013-013]` `rlratio.js` and `ratio-pairs.json` carry no default value, no fallback path, and no stub: every declared pair states `pairId`, both legs, `lookbackBars` in bars, `semanticClass`, `ratioFamilyId`, and its refs explicitly.
- [ ] `[BS-013-013]` Every numeric guard in new code uses `Number.isFinite`; the global `isFinite` appears zero times in `rlratio.js`.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
