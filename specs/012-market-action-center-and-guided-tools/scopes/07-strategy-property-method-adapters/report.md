# Scope 07 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Scope 07 IN PROGRESS. **5 of 7** Scope-07 adapters delivered — three strategy adapters single-sourced
through `rlexperience-adapters/strategy-research.js`, and two place-based rental adapters single-sourced
through `rlexperience-adapters/property-research.js` (owner seam = the shared `rlrental.js` engine).

- **Batch 1 — `strategy-evolution/v1`** (`strategy-self-improvement-lab`). Seeded owner engine
  (`mulberry32`, `gauss`, `genSeries`, `sma`, `realizedVol`, `backtest`, `metrics`, `walkForward`) extracted;
  the owner page delegates. Owner-parity, per-parameter effects under common random numbers, and
  **SCN-012-002 seeded reproducibility** proven at unit level (7/7). A seed-ignore RED-bite proved teeth.
- **Batch 2 — `disclosure-decay/v1`** (`smart-money-flow-lab`). The disclosure-lag owner engine
  (`alphaDecay`, `dayGap`, `consensusScore`, `realisticEdgeFraction`) is extracted to the module; the owner
  page now delegates (no inline decay / consensus formula copy). All five declared parameters (`source-mix`,
  `lag-half-life`, `cluster-minimum`, `consensus-threshold`, `decay-floor`) provably move their declared output
  path with **genuine computed content** (not an echoed parameter), owner-parity is proven against the module
  `consensusScore` / `realisticEdgeFraction`, the model is deterministic over the frozen filing set, and the
  frozen evidence gap (single-filer / sub-threshold clusters) is preserved without zero-filling (TP-07-01
  now 12/12). A genuine page-delegation RED plus an `alphaDecay` age-ignore RED-bite proved the tests have teeth.
- **Batch 3 — `walk-forward-validation/v1`** (`strategy-validation-lab`, committed `cebbd719`). The real-data
  embargo walk-forward engine (`seriesFromCloses`, `walkForwardEmbargo`, `scorePass`, `allPass`, `buyHoldCurve`)
  is extracted to `strategy-research.js`; the owner page delegates (the Bailey–López de Prado deflated Sharpe
  stays RLVALID-owned, Feature 007, untouched). All seven declared parameters move their declared paths with
  genuine computed content, owner-parity is proven vs the module `walkForwardEmbargo`, the model is deterministic,
  and no-data instruments are preserved as null OOS, never zero-filled. (Delivered in a prior dispatch; green in
  the current 27/27 unit run and 931/0 selftest.)
- **Batch 4 — `str-scenario/palm-springs/v1`** (`palm-springs-rental-market-lab`, committed `6f66f002`). First
  place-based rental adapter in `property-research.js`; the shared owner engine `rlrental.js`
  (`RLRENTAL.computeRentalResult`) is the SINGLE cash-flow source, consumed by both the owner page (via
  `mountRoute`) and the Simple adapter (owner-parity, no formula copy). Eight declared parameters move their
  declared paths, and the undisclosed property economics (property tax + capital reserve) stay INCOMPLETE / null,
  never zero-filled. (Delivered in a prior dispatch; green in the current 27/27 unit run and 931/0 selftest.)
- **Batch 5 — `str-scenario/ocean-shores/v1`** (`ocean-shores-rental-market-lab`, THIS dispatch). Second
  place-based rental adapter registered through the SAME `property-research.js` shared compute
  (`computeStrScenarioSummary`) + `rlrental.js` owner engine — a 2-line registration (added to
  `STR_SCENARIO_TOOL_IDS` + `supportedAdapterIds`), no new formula. Five dedicated ocean-shores unit tests were
  added (registration + no forbidden authority, page single-source, owner-parity run, all EIGHT parameters move
  their declared path, gap preservation + determinism). Ocean Shores carries NO explicit `insurance` Simple input,
  so the disclosed insurance cost is the frozen owner `baseFixedInsuranceUsd`, and BOTH stress levers
  (storm/insurance + regulation) drive ONLY `summary.stress`. A genuine RED replay (registration stashed → 4 of 5
  ocean tests fail because the adapter is unregistered) proved the tests bite; the registration was restored to
  GREEN at 27/27.

The broad selftest is green (**931 passed / 0 failed**). Remaining Scope-07 adapters: `location-suitability/v1`
(`waterfront-polo-lab`, this dispatch Task B) and the Market Action Center `market-action-triage/v1` triage model
(later dispatch). Feature status stays `not_started`; Scope 07 stays `in_progress`.

## Decision Record

## Completion Statement

No completion statement is authorized by planning.

## Code Diff Evidence

Batch 1 (`strategy-evolution/v1`) — only files inside the Scope-07 change boundary were touched:

- **NEW** `rlexperience-adapters/strategy-research.js` — UMD dual module (`RLSTRATEGY`). Single-source seeded
  owner engine (`mulberry32`, `gauss`, `genSeries`, `sma`, `realizedVol`, `backtest`, `metrics`, `walkForward`,
  byte-identical to the owner page) + the `strategy-evolution/v1` adapter (frozen owner scenario capture,
  bounded seeded one-variable search over the selected lever, explicit overfit-penalty discount, acceptance
  rule, six declared output paths). ZERO fetch/providerFetch/RLDATA/localStorage/import/Date.now/Math.random.
- **MOD** `strategy-self-improvement-lab.html` — loads `strategy-research.js` (non-deferred, before the inline
  script, mirroring the Scope-06 sector page). The 8 seeded-engine functions now delegate to `RLSTRATEGY.*`;
  the inline mulberry32 / genSeries-path / walkForward formulas are removed. `buyHoldCurve` stays page-only.
- **NEW** `tests/simple-model-adapters-strategy-property.unit.mjs` — TP-07-01 (7 tests).
- **MOD** `scripts/selftest.mjs` — new `strategy-self-improvement-lab.html` group (RLSTRATEGY primitive
  reproducibility + adapter determinism canary + page delegation + no-inline-copy).

Batch 2 (`disclosure-decay/v1`) — only files inside the Scope-07 change boundary were touched:

- **MOD** `rlexperience-adapters/strategy-research.js` — added the disclosure-lag owner primitives
  (`alphaDecay`, `dayGap`, `consensusScore`, `realisticEdgeFraction`, byte-identical to the owner page) + the
  `disclosure-decay/v1` adapter (frozen-filing-set capture, source-mix filter, per-ticker consensus clusters,
  lag-decay retention with an explicit decay floor, cluster-minimum gate, net directional consensus, five
  declared output paths). Registered by `smart-money-flow-lab` toolId; `supportedAdapterIds` now lists both
  adapters. Still ZERO fetch/providerFetch/RLDATA/localStorage/import/Date.now/Math.random (Date.parse only,
  a deterministic string parse).
- **MOD** `smart-money-flow-lab.html` — loads `strategy-research.js` (non-deferred, before the inline script,
  mirroring the strategy pages). `alphaDecay` / `dayGap` / `consensusScore` / `realisticEdgeFraction` now
  delegate to `RLSTRATEGY.*`; the inline decay / consensus formulas are removed. `aggregate` / `summary` /
  rendering are unchanged and still call the (now-delegating) owner functions.
- **MOD** `tests/simple-model-adapters-strategy-property.unit.mjs` — TP-07-01 grew from 7 to 12 tests
  (disclosure-decay module authority, page single-source, adapter runtime + owner parity, per-parameter
  genuine-effect, determinism + gap-preservation).
- **MOD** `scripts/selftest.mjs` — reconciled the `smart-money-flow-lab.html` group IN LOCKSTEP: it now
  requires the module (RLSTRATEGY) instead of `extractFn`-ing the inline formulas, asserts the owner primitives
  + a disclosure-decay determinism/effect canary + page delegation + no-inline-copy (net +6 assertions).
## Test Evidence

Execution agents append one current-session block per Test Plan row with Phase, exact Command, Exit Code, Claim Source, and raw output.

<a id="tp-07-01"></a>
### TP-07-01 unit — strategy-evolution/v1 (batch 1)

Phase: implement | Command: `node --test tests/simple-model-adapters-strategy-property.unit.mjs` | Exit Code: 0 | Claim Source: executed

```
✔ TP-07-01 strategy-research module exposes the delivered strategy-evolution adapter with no forbidden authority (3.039301ms)
✔ TP-07-01 strategy-research mulberry32/gauss/genSeries pin the single-source seeded path (SCN-012-002 core) (9.555704ms)
✔ TP-07-01 strategy-self-improvement-lab.html single-sources the seeded path + walk-forward engine from strategy-research.js (0.5262ms)
✔ TP-07-01 strategy-evolution adapter registers through the production runtime and produces a ready owner run (44.772416ms)
✔ TP-07-01 each enabled strategy-evolution parameter changes its declared output path (common random numbers) (183.986368ms)
✔ TP-07-01 SCN-012-002 the same inputs+params+evidence+seed run twice produce identical result identity + summary (67.789525ms)
✔ TP-07-01 SCN-012-002 changing the seed creates a distinct run and a distinct path (62.768623ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
UNIT_EXIT=0
```

### RED proof (genuine failure proving production behavior absent / wrong)

(a) **Single-source page RED (production behavior absent):** before the page rewire, the unit run was 6 pass /
1 fail — `TP-07-01 strategy-self-improvement-lab.html single-sources...` FAILED with `AssertionError: ssi page
loads strategy-research.js` (the page did not load or delegate to the module). After the delegating rewire it
passes (row 3 above).

(b) **SCN-012-002 seed-bite (production behavior wrong):** temporarily made `genSeries` ignore its seed
(`mulberry32(12345 >>> 0)`), then re-ran the suite. Two tests FAILED (`pass 5 / fail 2`, exit 1) because the
seeded path became identical for different seeds:

```
✖ TP-07-01 strategy-research mulberry32/gauss/genSeries pin the single-source seeded path (SCN-012-002 core)
  AssertionError [ERR_ASSERTION]: a different seed selects a distinct reproducible path
      at TestContext.<anonymous> (file://~/research-lab/tests/simple-model-adapters-strategy-property.unit.mjs:139:10)
    actual: 473.99359528090133, expected: 473.99359528090133, operator: 'notStrictEqual'
✖ TP-07-01 SCN-012-002 changing the seed creates a distinct run and a distinct path
  AssertionError [ERR_ASSERTION]: a new seed selects a distinct reproducible path
      at TestContext.<anonymous> (file://~/research-lab/tests/simple-model-adapters-strategy-property.unit.mjs:306:10)
    actual: '100:204.091444:206.242611:207.935178:305.549152', expected: '100:...:305.549152', operator: 'notStrictEqual'
REDBITE_EXIT=1
```

The seed-ignore edit was reverted byte-exact and the suite returned to 7/7 GREEN (the block above).

<a id="tp-07-01-disclosure"></a>
### TP-07-01 unit — disclosure-decay/v1 (batch 2)

Phase: implement | Command: `node --test --test-reporter=spec tests/simple-model-adapters-strategy-property.unit.mjs` | Exit Code: 0 | Claim Source: executed

```
✔ TP-07-01 strategy-research module exposes the delivered disclosure-decay adapter (owner-parity primitives) (1.067201ms)
✔ TP-07-01 smart-money-flow-lab.html single-sources the disclosure-lag/consensus engine from strategy-research.js (0.5965ms)
✔ TP-07-01 disclosure-decay adapter registers through the production runtime and produces a ready owner run (17.374513ms)
✔ TP-07-01 each enabled disclosure-decay parameter changes its declared output path with genuine computed content (75.526356ms)
✔ TP-07-01 disclosure-decay is deterministic and preserves the frozen evidence gap without zero-filling (28.502921ms)
ℹ tests 12
ℹ pass 12
ℹ fail 0
UNIT_EXIT=0
```

What the five disclosure-decay rows prove:

- **Module authority + owner-parity primitives.** The module exports `disclosure-decay/v1` in
  `supportedAdapterIds` and exposes `alphaDecay` / `dayGap` / `consensusScore` / `realisticEdgeFraction`. Their
  values match the closed-form owner formulas (`alphaDecay(H,H)=0.5`, `dayGap` = whole-day difference,
  `realisticEdgeFraction` = surviving fraction at the disclosure lag).
- **Page single-sources the engine.** `smart-money-flow-lab.html` loads `strategy-research.js` and each of the
  four owner functions delegates to `RLSTRATEGY.*` with no surviving inline decay / consensus formula.
- **Adapter runs through the production runtime + owner parity.** A `prepare` over the frozen filing set yields a
  ready owner run; the `BBB` cluster's naive conviction equals `sr.consensusScore(3, 460000, 6, 45)` and its
  retained fraction equals `sr.realisticEdgeFraction(avgLag, 45)` computed directly from the module — the adapter
  is single-sourcing the same owner math, not re-deriving it.
- **Every parameter moves its declared path with genuine computed content.** `source-mix` → `summary.conviction`
  (insider-only reshapes the qualified set to `{AAA,CCC}`), `lag-half-life` 90 → `summary.decayedConviction`
  (higher `totalDecayed`), `cluster-minimum` 2 → `summary.cluster` (admits the 2-filer `DDD`),
  `consensus-threshold` 0.7 → `summary.consensus` (flips `passes` false / band → `divided`), `decay-floor` 0.5 →
  `summary.decayedConviction` (lifts `BBB` to `retainedFloored = 0.5`, `floored = true`). None is an echoed
  parameter — each assertion checks recomputed downstream numbers.
- **Deterministic + gap-preserving.** Two runs over the frozen set are byte-identical, and the single-filer /
  sub-threshold clusters (`EEE`) are dropped from the qualified set rather than zero-filled — the frozen evidence
  gap survives.

### RED proof — disclosure-decay (genuine failure + age-ignore bite)

(a) **Page-delegation RED (production behavior absent):** before the `smart-money-flow-lab.html` rewire, the unit
run failed `TP-07-01 smart-money-flow-lab.html single-sources...` with `AssertionError: 'smart-money page loads
strategy-research.js'` (the page carried its own inline decay/consensus formulas and did not load the module).
After the delegating rewire it passes (row 2 above).

(b) **`alphaDecay` age-ignore bite (production behavior wrong):** temporarily made `alphaDecay` return `1`
(ignore age → no decay), then re-ran the suite. Three tests FAILED (`pass 9 / fail 3`, exit 1) because retained
conviction stopped depending on filing age / half-life:

```
not ok 8 - TP-07-01 strategy-research module exposes the delivered disclosure-decay adapter (owner-parity primitives)
    alphaDecay(H,H) = 0.5 (one half-life)
not ok 11 - TP-07-01 each enabled disclosure-decay parameter changes its declared output path with genuine computed content
  error: 'a longer lag half-life genuinely retains more surviving conviction'
not ok 12 - TP-07-01 disclosure-decay is deterministic and preserves the frozen evidence gap without zero-filling
# tests 12
# pass 9
# fail 3
BITE_UNIT_EXIT=1
```

The same bite drove the broad selftest to `906 passed, 6 failed`. The `alphaDecay` body was reverted byte-exact
and the suite returned to 12/12 GREEN.

<a id="tp-07-01-ocean"></a>
### TP-07-01 unit — str-scenario/ocean-shores/v1 (batch 5, THIS dispatch)

Phase: implement | Command: `node --test tests/simple-model-adapters-strategy-property.unit.mjs` | Exit Code: 0 | Claim Source: executed

GREEN — the five new ocean-shores rows inside the full 27-test unit run (spec reporter, ocean rows shown):

```
✔ TP-07-01 property-research module exposes the delivered str-scenario/ocean-shores adapter with no forbidden authority (1.017194ms)
✔ TP-07-01 ocean-shores-rental-market-lab.html single-sources the place-based cash flow from rlrental.js (RLRENTAL)
✔ TP-07-01 str-scenario/ocean-shores adapter registers through the production runtime and produces a ready owner-parity run (17.114794ms)
✔ TP-07-01 each enabled str-scenario/ocean-shores parameter changes its declared output path with genuine owner-computed content (67.464784ms)
✔ TP-07-01 str-scenario/ocean-shores preserves the undisclosed-economics gap without zero-filling and is deterministic (26.923834ms)
ℹ tests 27
ℹ pass 27
ℹ fail 0
UNIT_EXIT=0
```

What the five ocean-shores rows prove:

- **Module authority + registration by exact ID.** `property-research.js` lists `simple-adapter/str-scenario/ocean-shores/v1`
  in `supportedAdapterIds`, and the comment-stripped forbidden-authority scan over the whole module (both
  place-based adapters) has zero executable hits.
- **Page single-sources the owner engine.** `ocean-shores-rental-market-lab.html` loads `rlrental.js` and consumes
  it through `RLRENTAL.mountRoute` with no inline copy of the revenue / cost / debt-service / cash-flow formula.
- **Adapter runs through the production runtime + owner parity.** A `prepare` over the frozen Ocean Shores place
  state yields a ready run whose headline `grossRevenueUsd`, `fixedRiskCostUsd`, `annualDebtServiceUsd`,
  `annualOperatingPreTaxCashFlowUsd`, and cumulative figure each equal a DIRECT `RLRENTAL.computeRentalResult`
  run over the same derived owner context + assumptions — the adapter single-sources the owner engine, not a
  re-derivation. The disclosed insurance cost is the frozen owner `baseFixedInsuranceUsd` (there is no `insurance`
  Simple input for Ocean Shores).
- **All eight parameters move their declared path with genuine owner-computed content.** `segment`, `adr`,
  `occupancy`, `financing-rate`, `operating-cost`, and `horizon` each move `summary.cashFlow`; `storm-insurance-stress`
  and `regulation-stress` each move `summary.stress` ONLY (both leave the base cash flow fingerprint unchanged and
  genuinely reshape the stress scenario). Each is a real `RLRENTAL` re-computation, never an echoed parameter.
- **Deterministic + gap-preserving.** Two runs over the frozen state are byte-identical, and the undisclosed
  property economics (property tax + capital reserve) stay INCOMPLETE with a NULL full bottom line and a
  `missingCostFieldIds` list — never zero-filled — while the disclosed-cost operating cash flow is a real owner
  number.

### RED proof — ocean-shores (registration stashed → the tests bite)

Before committing, the ocean registration edit was stashed (`git stash push -- rlexperience-adapters/property-research.js`),
reverting `property-research.js` to HEAD where `str-scenario/ocean-shores/v1` is absent from `STR_SCENARIO_TOOL_IDS`
and `supportedAdapterIds`. Re-running only the ocean rows FAILED 4 of 5 (`pass 1 / fail 4`, exit 1) — the four
registration-dependent rows fail precisely because the adapter is unregistered, while the registration-independent
page single-source row correctly still passes:

```
✖ TP-07-01 property-research module exposes the delivered str-scenario/ocean-shores adapter with no forbidden authority
  AssertionError [ERR_ASSERTION]: str-scenario/ocean-shores is a declared supported adapter
      at ~/research-lab/tests/simple-model-adapters-strategy-property.unit.mjs:1106:10
    actual: false, expected: true, operator: '=='
✔ TP-07-01 ocean-shores-rental-market-lab.html single-sources the place-based cash flow from rlrental.js (RLRENTAL)
✖ TP-07-01 str-scenario/ocean-shores adapter registers through the production runtime and produces a ready owner-parity run
  TypeError: Cannot read properties of undefined (reading 'ok')   [results['simple-adapter/str-scenario/ocean-shores/v1'] is undefined]
✖ TP-07-01 each enabled str-scenario/ocean-shores parameter changes its declared output path with genuine owner-computed content
  AssertionError [ERR_ASSERTION]: E012-SIMPLE-INPUT $   [runtime rejects the unregistered adapter]
✖ TP-07-01 str-scenario/ocean-shores preserves the undisclosed-economics gap without zero-filling and is deterministic
  AssertionError [ERR_ASSERTION]: E012-REGISTRY $.adapterId   [registry has no ocean-shores adapter]
ℹ tests 5
ℹ pass 1
ℹ fail 4
RED_EXIT=1
```

The registration was restored (`git stash pop`), re-adding ocean-shores to both arrays, and the full unit file
returned to **27/27 GREEN** (the block above). Node `--check` on the unit file parses clean.

<a id="tp-07-11"></a>
### TP-07-11 broad selftest

Phase: implement | Command: `node scripts/selftest.mjs` | Exit Code: 0 | Claim Source: executed

```
Research-Lab self-test: 931 passed, 0 failed
SELFTEST_EXIT=0
```

- Batch 1: 895 (Scope-06 baseline) → 906 = +11, exactly the new `strategy-self-improvement-lab.html` selftest
  group's assertion count.
- Batch 2: 906 → 912 = +6, exactly the reconciled `smart-money-flow-lab.html` selftest group's net delta.
- Batches 3–5 (walk-forward-validation, palm-springs, ocean-shores): 912 → **931** = +19, from the
  `strategy-validation-lab.html` reconciled group and the two place-based rental selftest groups delivered in the
  prior dispatches. Ocean-shores (batch 5, this dispatch) added no selftest group — it reuses the same
  `rlrental.js` place-based engine + `property-research.js` shared compute as palm-springs, so it required only a
  2-line registration + its dedicated unit rows. Zero regressions in any other group.

### Forbidden-authority + protected-path integrity (batch 1)

- Comment-stripped EXECUTABLE forbidden-authority scan on `rlexperience-adapters/strategy-research.js`:
  `EXECUTABLE_FORBIDDEN_HITS=0` (no fetch/providerFetch/RLDATA/localStorage/sessionStorage/indexedDB/
  XMLHttpRequest/dynamic-import/writeFileSync/Date.now/Math.random/data-options/data-bars/cross-domain-adapter).
- `git diff --name-only HEAD` shows the protected Scope 04/05/06 modules (`rlexperience.js`, `macro-rotation.js`,
  `fundamental-models.js`, `market-structure.js`, `options.js`), `rldata.js`, `data/options/**`, and
  `scripts/fetch-options.mjs` are NOT modified (grep for them returned no match).
- Read-only inline-script parse check of the rewired page: `PAGE_INLINE_PARSE=OK`.
- Working tree touched only: `rlexperience-adapters/strategy-research.js` (new),
  `tests/simple-model-adapters-strategy-property.unit.mjs` (new), `strategy-self-improvement-lab.html` (M),
  `scripts/selftest.mjs` (M). Concurrent-session dirt (`bugs/BUG-001-.../scenario-manifest.json`) preserved,
  not staged.

### Forbidden-authority + protected-path integrity (batch 2)

- Comment-stripped EXECUTABLE forbidden-authority scan on `rlexperience-adapters/strategy-research.js` (both
  adapters now in one module): `EXECUTABLE_FORBIDDEN_HITS=0` (no fetch/providerFetch/RLDATA/localStorage/
  sessionStorage/indexedDB/XMLHttpRequest/dynamic-import/writeFileSync/Date.now/Math.random/data-options/
  data-bars/cross-domain-adapter). The disclosure engine parses filing dates with `Date.parse` only — a
  deterministic string→epoch parse, not a clock read.
- `git diff --stat` of the protected Scope 04/05/06 modules (`rlexperience.js`, `macro-rotation.js`,
  `fundamental-models.js`, `market-structure.js`, `options.js`), `rldata.js`, `data/options/**`,
  `scripts/fetch-options.mjs`, and `strategy-self-improvement-lab.html` (batch-1 owner page) is EMPTY — none
  modified by batch 2.
- `git status --short` working tree: `rlexperience-adapters/strategy-research.js` (M),
  `smart-money-flow-lab.html` (M), `tests/simple-model-adapters-strategy-property.unit.mjs` (M),
  `scripts/selftest.mjs` (M), plus the untouched concurrent-session `bugs/BUG-001-.../scenario-manifest.json`
  (M) — preserved, not staged.

### Forbidden-authority + protected-path integrity (batch 5 — ocean-shores)

- Comment-stripped EXECUTABLE forbidden-authority scan on `rlexperience-adapters/property-research.js` (both
  place-based adapters in one module): `EXECUTABLE_FORBIDDEN_HITS=0` (no fetch/providerFetch/RLDATA/localStorage/
  sessionStorage/indexedDB/XMLHttpRequest/dynamic-import/require/writeFileSync/Date.now/Math.random/data-options/
  data-bars/cross-domain-adapter). The place-based scenario is a pure function of the frozen owner place state +
  the Simple parameters, computed only by the injected `rlrental.js` engine.
- `git diff --stat HEAD` of the protected surfaces — `rlrental.js` (the shared owner engine, CONSUMED not edited),
  `rlexperience-adapters/strategy-research.js` (the Scope-07 strategy module), the Scope 04/05/06 modules
  (`rlexperience.js`, `market-structure.js`, `options.js`, `macro-rotation.js`, `fundamental-models.js`),
  `rldata.js`, and `data/options/**` — is EMPTY (none modified by batch 5; zero diff).
- `git status --short` working tree for the ocean batch: only `rlexperience-adapters/property-research.js` (M, the
  2-line ocean registration) and `tests/simple-model-adapters-strategy-property.unit.mjs` (M, the five ocean rows),
  plus the untouched concurrent-session `bugs/BUG-001-.../scenario-manifest.json` (M) — preserved, not staged. No
  `scripts/selftest.mjs` change for batch 5 (ocean reuses the palm-springs place-based `rlrental.js` engine +
  `property-research.js` shared compute, so it needs no new selftest group).

## Uncertainty Declarations

## Scenario Contract Evidence

<a id="scenario-scn-012-002"></a>
### SCN-012-002

Proven at unit level for `strategy-evolution/v1` (batch 1) via the production Scope-04 runtime:

- **Same inputs run twice → identical result identity + output summary.** Two independent `prepare` runs with
  identical owner scenario + parameters + evidence identity + seed produce identical `computeIdentity`, identical
  `fingerprint(summary)`, and identical `path.pathIdentity`. (The Scope-04 core enforces per-compute-identity
  determinism — `E012-SIMPLE-NONDETERMINISTIC` — and the seeded path is a pure function of the single-sourced
  `genSeries(seed, ...)`.)
- **Changing the seed creates a distinct run.** A `recompute` with a new seed yields a distinct `computeIdentity`,
  `sensitivity.sharedRandomness.mode = path-separated`, `sensitivity.seedChanged = true`, `changedParameters = []`
  (the seed is path randomness, not a sensitivity parameter), and a distinct `path.pathIdentity`.
- **Parameter sensitivity remains separate from path randomness.** Each non-seed parameter recompute keeps the
  same seed (`mode = common-random-numbers`), moves ONLY its declared output path (`outputChanged = true` on the
  exact declared `resultPaths`), and leaves `path.pathIdentity` unchanged — asserted for goal → `summary.goalScore`,
  variable → `summary.candidate`, search-budget → `summary.search`, overfit-penalty → `summary.acceptance`,
  acceptance-threshold → `summary.acceptance`, walk-forward-folds → `summary.outOfSample`.

The RED-bite above (genSeries ignoring the seed) proved the seed-distinct half genuinely fails when the seed does
not drive the path. E2E (TP-07-03, `#scenario-scn-012-002` at the browser level) is a later full-scope-completion
row, not part of this implement batch.

### SCN-012-036

Proven at unit level for `disclosure-decay/v1` (batch 2) via the production Scope-04 runtime — the disclosure
adapter is the SCN-012-036 ("disclosure lag decay reshapes conviction") owner surface:

- **Lag decay genuinely erodes conviction.** For each ticker the naive consensus (`consensusScore`) is haircut by
  `realisticEdgeFraction(avgLag, halfLife)` = the surviving alpha fraction at the disclosure lag; a longer
  `lag-half-life` retains more (`summary.decayedConviction.totalDecayed` rises), and the `decay-floor` clamps the
  retained fraction up from below (`retainedFloored`, `floored = true`). The `alphaDecay` age-ignore RED-bite
  above proved this half genuinely fails when decay is removed.
- **Consensus is a net directional vote over qualified clusters.** `cluster-minimum` gates which tickers qualify
  (distinct-filer count), `consensus-threshold` decides `passes` / band from the buy-fraction of qualified
  clusters, and `source-mix` reshapes the qualifying universe (institutional-only vs blended). Each moves ONLY
  its declared `summary.*` path with recomputed content.
- **The frozen evidence gap is preserved.** Single-filer / sub-threshold clusters are dropped from the qualified
  set, never zero-filled, so the model never fabricates consensus it does not have.

E2E (TP-07-04, `#scenario-scn-012-036` at the browser level) is a later full-scope-completion row, not part of
this implement batch.

## Coverage Report

## Lint/Quality

## Spot-Check Recommendations

## Validation Summary

## Audit Verdict
