# Scope 07 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Scope 07 IN PROGRESS. **6 of 7** Scope-07 adapters delivered — three strategy adapters single-sourced
through `rlexperience-adapters/strategy-research.js`; two place-based rental adapters (owner seam = the shared
`rlrental.js` engine) plus the Waterfront × Masters location screener (owner seam = the module's own geo
primitives) single-sourced through `rlexperience-adapters/property-research.js`.

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
- **Batch 6 — `location-suitability/v1`** (`waterfront-polo-lab`, THIS dispatch Task A). Third property owner seam,
  and a DIFFERENT single-source style: the great-circle distance / drive-time / nearest-club / market-filter owner
  primitives (`haversineMi`, `driveMinutesApprox`, `nearestClub`, `marketPasses`) live once, in
  `property-research.js` (RLPROPERTY), and BOTH the owning `waterfront-polo-lab.html` page (now delegating via thin
  `RLPROPERTY.*` wrappers — the inline formula bodies REMOVED) AND the `location-suitability/v1` Simple adapter
  consume them (owner-parity). Five dedicated location-suitability unit rows were added (module authority + geo
  primitives exposed + no forbidden authority; page single-source; adapter registers + owner-parity; all SEVEN
  parameters move their declared path; unverified-gap preservation + determinism). All seven declared parameters
  provably move their declared path — `budget` / `minimum-size` / `water-type` / `travel-limit` → `summary.shortlist`,
  `insurance-risk-ceiling` → `summary.risk`, `flood-verification` / `club-verification` → `summary.verification` —
  each engineered to toggle exactly one market with genuine owner-primitive content, and the two verification flags
  keep the shortlist + risk partitions unchanged. Unverified Masters-club seeds and estimated hazard rows are
  preserved as an explicit verification gap, never promoted to verified. The `scripts/selftest.mjs` waterfront group
  was reconciled IN LOCKSTEP — it now loads the single source (`createRequire` → RLPROPERTY) and asserts the page
  loads the module + delegates + carries no inline `var R = 3958.7613` / budget-fit rank table (+3 assertions). An
  isolated RED replay (page stashed to HEAD → only the page-single-source row bites) proved the test has teeth; the
  rewired page returned the unit file to 32/32 GREEN.

The broad selftest is green (**934 passed / 0 failed**). Remaining Scope-07 adapter: the Market Action Center
`market-action-triage/v1` in-Brief triage model (THIS dispatch Task B). Feature status stays `not_started`;
Scope 07 stays `in_progress`.

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

### TP-07-01 unit — location-suitability/v1 (batch 6, THIS dispatch Task A)

Phase: implement | Command: `node --test tests/simple-model-adapters-strategy-property.unit.mjs` | Exit Code: 0 | Claim Source: executed

GREEN — the five new location-suitability rows inside the full 32-test unit run (spec reporter, location rows shown):

```
ok 28 - TP-07-01 property-research module exposes the delivered location-suitability adapter and single-source geo primitives with no forbidden authority
ok 29 - TP-07-01 waterfront-polo-lab.html single-sources the geo / market-filter primitives from property-research.js (RLPROPERTY)
ok 30 - TP-07-01 location-suitability adapter registers through the production runtime and produces a ready owner-parity run
ok 31 - TP-07-01 each enabled location-suitability parameter changes its declared output path with genuine owner-computed content
ok 32 - TP-07-01 location-suitability preserves the unverified club-seed / estimated-hazard gap without promoting to verified, and is deterministic
# tests 32
# pass 32
# fail 0
UNIT_EXIT=0
```

What the five location-suitability rows prove:

- **Module authority + single-source geo primitives + registration by exact ID.** `property-research.js` lists
  `simple-adapter/location-suitability/v1` in `supportedAdapterIds` and exposes the four owner geo primitives
  (`haversineMi`, `driveMinutesApprox`, `nearestClub`, `marketPasses`) plus `computeLocationSuitabilitySummary`
  on its public API — the single source both the page and the adapter consume. The comment-stripped
  forbidden-authority scan over the whole module has zero executable hits.
- **Page single-sources the geo primitives (the anti-F-05-SS-OPTIONS step).** `waterfront-polo-lab.html` loads
  `rlexperience-adapters/property-research.js`, delegates `haversineMi` / `driveMinutesApprox` / `nearestClub` /
  `marketPasses` to `RLPROPERTY.*` via thin one-line wrappers, and carries NO inline copy of the great-circle
  Earth-radius constant (`var R = 3958.7613`) or the market-filter budget-fit rank table — the formula bodies were
  REMOVED so the page has ONE source (the module).
- **Adapter runs through the production runtime + owner parity.** A `prepare` over a frozen six-market geo universe
  yields a ready run whose shortlist row `nearestClubMi` and `driveMin` for market `m-a` each equal a DIRECT
  `RLPROPERTY.nearestClub` + `RLPROPERTY.driveMinutesApprox` call over the same owner facts — the adapter
  single-sources the geo primitives, not a re-derivation — and the shortlist is the deterministic drive-time-ordered
  `['m-f', 'm-a']` set.
- **All seven parameters move their declared path with genuine owner-primitive content.** `budget`, `minimum-size`,
  `water-type`, and `travel-limit` each move `summary.shortlist`; `insurance-risk-ceiling` moves `summary.risk`
  ONLY (shortlist + verification fingerprints unchanged); `flood-verification` and `club-verification` each move
  `summary.verification` ONLY (shortlist + risk fingerprints unchanged). Each change toggles exactly one market via
  the single-sourced owner primitives.
- **Gap-preserving + deterministic.** Two runs are byte-identical (no clock, no randomness). With flood + club
  evidence required (the defaults) the estimated-hazard market (`m-b`) and the seed-club market (`m-f`) stay
  UNVERIFIED — never promoted — and the shortlisted seed-club market still surfaces its `seed` confidence rather
  than being rewritten to `reported`.

### RED proof — location-suitability (page stashed → the single-source row bites)

Before committing, the rewired page was stashed (`git stash push -- waterfront-polo-lab.html`), reverting
`waterfront-polo-lab.html` to HEAD where it still defines the geo primitives inline (`var R = 3958.7613`, the
budget-fit rank table) and does NOT load `property-research.js`. Re-running the unit file FAILED exactly ONE row —
the page single-source assertion — while the four page-independent adapter rows (module authority, registration +
owner-parity, parameter effects, gap preservation) correctly still pass:

```
ok 28 - TP-07-01 property-research module exposes the delivered location-suitability adapter and single-source geo primitives with no forbidden authority
not ok 29 - TP-07-01 waterfront-polo-lab.html single-sources the geo / market-filter primitives from property-research.js (RLPROPERTY)
  failureType: 'testCodeFailure'   [AssertionError: waterfront page loads the property-research module]
ok 30 - TP-07-01 location-suitability adapter registers through the production runtime and produces a ready owner-parity run
ok 31 - TP-07-01 each enabled location-suitability parameter changes its declared output path with genuine owner-computed content
ok 32 - TP-07-01 location-suitability preserves the unverified club-seed / estimated-hazard gap without promoting to verified, and is deterministic
# tests 32
# pass 31
# fail 1
RED_EXIT=1
```

The rewired page was restored (`git stash pop`) — re-adding the `property-research.js` script tag + the four
`RLPROPERTY.*` delegators and removing the inline formula bodies — and the full unit file returned to **32/32
GREEN** (the block above). Transparency: during first authoring the adapter-registration row also flagged a
fixture-expectation error — my hand-computed shortlist drive-time order `['m-a','m-f']` was reversed; the genuine
single-sourced owner-primitive output is `['m-f','m-a']` because m-f sits fractionally closer to its club at
latitude 30 than m-a at 28.5 (longitude miles-per-degree shrinks with latitude). The test's expected order was
corrected to the genuine deterministic output — an expectation fix, not a relaxed assertion; the row still asserts
exactly the two correct markets in correct drive-time order. Node `--check` on the module + selftest + unit file
parses clean; the page's inline JS is a trivial delegator rewrite exercised GREEN by the adapter + selftest.

<a id="tp-07-11"></a>
### TP-07-11 broad selftest

Phase: implement | Command: `node scripts/selftest.mjs` | Exit Code: 0 | Claim Source: executed

```
Research-Lab self-test: 934 passed, 0 failed
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
- Batch 6 (location-suitability): 931 → **934** = +3, exactly the three new single-source wiring assertions added to
  the reconciled `waterfront-polo-lab.html` selftest group when it was converted from `extractFn`/`build` on the
  page to a `createRequire` load of the single source (RLPROPERTY): the page loads the module, delegates the four
  geo primitives, and carries no inline `var R = 3958.7613` / budget-fit rank table. The 13 pre-existing geo
  assertions moved from `env.*` (page-extracted) to `RLP.*` (module) with no count change. Zero regressions in any
  other group.

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

### Forbidden-authority + protected-path integrity (batch 6 — location-suitability)

- Comment-stripped EXECUTABLE forbidden-authority scan on `rlexperience-adapters/property-research.js` (all three
  property adapters + the four geo primitives in one module): `EXECUTABLE_FORBIDDEN_AUTHORITY_TOKENS=0` (no
  fetch/providerFetch/RLDATA/localStorage/sessionStorage/indexedDB/XMLHttpRequest/dynamic-import/require/
  writeFileSync/Date.now/Math.random/data-options/data-bars/cross-domain-adapter). The geo primitives are pure math
  (`Math.sin/cos/asin/sqrt/PI/min` + `Math.round/pow`); the 4 raw comment mentions of `RLDATA`/`fetch` are doc prose
  naming what the module avoids, not executable calls.
- `git diff --numstat` of the protected surfaces is EMPTY (zero diff) for ALL of: `rlrental.js`,
  `rlexperience-adapters/strategy-research.js`, `rldata.js`, `rlexperience.js`, the Scope 04/05/06 modules
  (`market-structure.js`, `options.js`, `macro-rotation.js`, `fundamental-models.js`), `simple-models.json`,
  `tests/simple-model-adapters.integration.mjs`, and `data/options/**` — none modified by batch 6.
- The registry-derived integration loop stayed **5/5 green** (`INTEGRATION_EXIT=0`) — the property-research /
  waterfront / selftest edits did not regress any Scope-05/06 adapter.
- `git status --short` working tree for the location batch: only `waterfront-polo-lab.html` (M, script tag + four
  `RLPROPERTY.*` delegators, inline formula bodies removed — net -deletions), `scripts/selftest.mjs` (M, reconciled
  waterfront group), and `tests/simple-model-adapters-strategy-property.unit.mjs` (M, the five location rows), plus
  the already-dirty `rlexperience-adapters/property-research.js` (the location-suitability module implementation from
  the prior partial dispatch, PRESERVED + now single-sourced by the page) and the untouched concurrent-session
  `bugs/BUG-001-.../scenario-manifest.json` (M) — preserved, not staged into the location commit's scope.

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
not drive the path.

**E2E delivered (TP-07-03, F-07-E2E-01 CLOSED, this session — live system-Chrome).** The browser row `Regression:
strategy self-improvement Simple repeats one seed and separates parameter sensitivity from path randomness` drives
the REAL `strategy-evolution/v1` adapter through the REAL production runtime on the REAL
`strategy-self-improvement-lab.html` page and proves SCN-012-002 at the browser level: (1) two fresh `prepare` runs
at the SAME seed → identical `computeIdentity` + identical `fingerprint(summary)` + identical `path.pathIdentity`
(reproducible); (2) a two-control change (`goal→cagr`, `search-budget→6`) under the SAME seed →
`sensitivity.sharedRandomness.mode = common-random-numbers`, `changedParameters = ['goal','search-budget']`,
`path.pathIdentity` UNCHANGED, and a visible rendered-DOM text difference (sensitivity SEPARATE from path
randomness); (3) a NEW seed (`base.seed + 1`) → `mode = path-separated`, `seedChanged = true`,
`changedParameters = []`, a distinct `path.pathIdentity`, and a distinct `computeIdentity` (a labeled path change,
not a sensitivity). Command + full raw output:

```text
$ npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: strategy self-improvement Simple repeats one seed and separates parameter sensitivity from path randomness" --reporter=list

Running 1 test using 1 worker

  ✓  1 …ne seed and separates parameter sensitivity from path randomness (795ms)

  1 passed (2.5s)
TP0703_EXIT=0
```

Live-stack authentic: real `page.goto` + real page core (`globalThis.RLEXPERIENCE` via the page's rlapp.js) + real
adapter UMD (`rlexperience-adapters/strategy-research.js`, RLSTRATEGY) + real `createSimpleRuntime` /
`registerStrategyResearchAdapters` + real `renderSimpleProjection` into the real `[data-rlexperience-panel="simple"]`
host; the frozen owner scenario is a deterministic fixture, NOT an intercepted network response. Full 7-row spec +
no-interception scan in the F-07-E2E-01 section below (`#f-07-e2e-01`).

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

**E2E delivered (TP-07-04 … TP-07-09, F-07-E2E-01 CLOSED, this session).** The six remaining owner tools plus the
in-Brief Center triage each pass a persistent system-Chrome regression proving the REAL adapter's parameter-sensitive
Simple read with the tool's evidence truth preserved. See the F-07-E2E-01 section below (`#tp-07-04` … `#tp-07-09`).

## Coverage Report

## Lint/Quality

## Spot-Check Recommendations

## Validation Summary

## Audit Verdict

## Independent Verification (bubbles.test)

Independent re-verification of Scope 07 at HEAD `48658598` (full-delivery; recorded implement evidence NOT
trusted — every claim below was reproduced from scratch this session). **Outcome: route_required — Scope 07 stays
`in_progress`.** The 6 ordinary + 1 internal-Center adapter MODULES are genuinely sound and single-sourced, but
THREE Test-Plan rows required by the scope's own DoD are undelivered/under-delivered, so the SCN-012-036
registry-completion headline is NOT proven and the scope cannot go `done`. No `done` is fabricated.

### What is genuinely GREEN (reproduced in-session)

#### TP-07-01 unit — `node --test tests/simple-model-adapters-strategy-property.unit.mjs` | Exit 0 | Claim Source: executed

All 7 adapters (6 ordinary + market-action-triage) covered, incl. SCN-012-002 seeded reproducibility:

```
✔ TP-07-01 strategy-research module exposes the delivered strategy-evolution adapter with no forbidden authority
✔ TP-07-01 SCN-012-002 the same inputs+params+evidence+seed run twice produce identical result identity + summary
✔ TP-07-01 SCN-012-002 changing the seed creates a distinct run and a distinct path
✔ TP-07-01 disclosure-decay adapter registers through the production runtime and produces a ready owner run
✔ TP-07-01 walk-forward-validation adapter registers through the production runtime and produces a ready owner run
✔ TP-07-01 str-scenario/palm-springs adapter registers through the production runtime and produces a ready owner-parity run
✔ TP-07-01 str-scenario/ocean-shores adapter registers through the production runtime and produces a ready owner-parity run
✔ TP-07-01 location-suitability adapter registers through the production runtime and produces a ready owner-parity run
✔ TP-07-01 market-action module exposes the delivered market-action-triage adapter with no forbidden authority
✔ TP-07-01 rlbrief.js single-sources its window/action-gating from market-action.js (Brief-payload-parity, behaviour-preserving)
✔ TP-07-01 market-action-triage adapter registers through the production runtime and produces a ready owner-parity triage
✔ TP-07-01 market-action-triage is an in-Brief-only model (no top-level Simple/Power) and is deterministic
ℹ tests 38
ℹ pass 38
ℹ fail 0
UNIT_EXIT=0
```

#### TP-07-11 broad selftest — `node scripts/selftest.mjs` | Exit 0 | Claim Source: executed

```
================================================
Research-Lab self-test: 934 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

(The batch-7 market-action extraction added NO new selftest group — the count is unchanged from batch 6. The
`action-only payload contract` canary that guards registry-wide Brief coverage lives inside this selftest and is
part of the 934-passed set.)

#### Single-Source Audit (F-05-SS-OPTIONS lesson) — all 7 owner surfaces + Brief, Claim Source: executed

Each owner page/Brief loads its module, references the module global, and carries NO inline duplicate of the
single-sourced formula:

| Owner surface | Module loaded | Global refs | Inline-formula in page | Verdict |
|---|---|---|---|---|
| `strategy-self-improvement-lab.html` | strategy-research.js (1) | RLSTRATEGY (17) | `0x6D2B79F5` = 0 | single-sourced |
| `strategy-validation-lab.html` | strategy-research.js (1) | RLSTRATEGY (7) | `0x6D2B79F5` = 0 | single-sourced |
| `smart-money-flow-lab.html` | strategy-research.js (1) | RLSTRATEGY (8) | (decay/consensus removed) | single-sourced |
| `waterfront-polo-lab.html` | property-research.js (1) | RLPROPERTY (10) | `3958.7613` = 0 | single-sourced |
| `palm-springs-rental-market-lab.html` | rlrental.js (1) | RLRENTAL (1) | (shared engine, no copy) | single-sourced |
| `ocean-shores-rental-market-lab.html` | rlrental.js (1) | RLRENTAL (1) | (shared engine, no copy) | single-sourced |
| `market-brief.html` → `rlbrief.js` | market-action.js (L871) then rlbrief.js (L872) | RLMARKETACTION (14 in rlbrief.js) | (window/gating delegated) | single-sourced |

`3958.7613` present only in `property-research.js` (1); `0x6D2B79F5` present only in `strategy-research.js` (1)
— the single sources. `rlbrief.js` delegates every window/action-gating primitive to `root.RLMARKETACTION.*`
(normalizeRecommendation / nextSessionActions / actionableAttention / …) with "Single-sourced in
market-action.js; the Brief delegates" prose.

#### BRIEF PAYLOAD PARITY (critical) — Claim Source: executed

- Legacy Brief payload validator `node scripts/validate-brief-payload.mjs` → Exit 0:
  `[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session
  actions are valid`.
- The `action-only payload contract` canary is inside `scripts/selftest.mjs` (934/0, above).
- `market-brief.html` loads `market-action.js` (module) BEFORE `rlbrief.js` (consumer); the Brief route/payload
  is behaviour-preserving. No new authored provenance label was introduced (protected-paths + validator both
  clean). The market-action extraction did NOT change the current Brief payload behaviour.

#### Forbidden-authority (comment-stripped EXECUTABLE) — Claim Source: executed

```
rlexperience-adapters/strategy-research.js     EXECUTABLE_FORBIDDEN_HITS=0
rlexperience-adapters/property-research.js     EXECUTABLE_FORBIDDEN_HITS=0
rlexperience-adapters/market-action.js         EXECUTABLE_FORBIDDEN_HITS=0
```

(no fetch/providerFetch/RLDATA/localStorage/sessionStorage/indexedDB/XMLHttpRequest/writeFileSync/Date.now/
Math.random/dynamic-import/data-options/data-bars — comments/doc-prose only.)

#### Protected paths byte-unchanged vs HEAD — Claim Source: executed

`git diff --numstat HEAD --` on `rldata.js`, `rlexperience.js`, `data/options`, `rlexperience-adapters/macro-rotation.js`,
`fundamental-models.js`, `market-structure.js`, `options.js`, `rlrental.js`, `scripts/fetch-options.mjs` → **empty
(zero diff), exit 0**. Scope 04/05/06 modules + the shared rental engine are untouched.

#### Owner-parity RED-bite — market-action-triage (not previously bitten) — Claim Source: executed

Neutralized the `capConfidence` owner primitive in `market-action.js` (`return (horizon === "tactical" && c > k)
? k : c;` → `return c;` — never cap). The literal Brief-parity assertion bit:

```
not ok 34 - TP-07-01 rlbrief.js single-sources its window/action-gating from market-action.js (Brief-payload-parity, behaviour-preserving)
    capConfidence: tactical 68 capped to 55 (parity)
  name: 'AssertionError'
# tests 38
# pass 37
# fail 1
RED_UNIT_EXIT=1
```

Restored via `git checkout HEAD -- rlexperience-adapters/market-action.js`; sha256 =
`d3cfdb9077da5faa9f198b51c15a790822aeef801f1011006e18eacc0e98d339` (identical to baseline); re-run GREEN (exit
0); `git status --short` shows only the preserved concurrent `BUG-001 scenario-manifest.json` dirt. Tree
byte-clean. (Note: the adapter's own owner-parity assertions are correctly self-sourced — both adapter and test
call `ma.capConfidence` — so a neutralization is caught by the LITERAL module-parity assertion, exactly the
anti-self-validating design.)

### BLOCKING GAPS (routed to bubbles.implement — the SCN-012-036 + E2E completion package)

The task premise ("all 7 committed; independently verify + finalize done") does NOT hold: the batch-7
(market-action) commit added the adapter + unit rows but left three DoD-required rows undelivered, and left
`report.md` (Summary still "6 of 7") and `state.json` (`nextRequiredTarget` still "Task B delivers the FINAL
adapter … then bubbles.test … TP-07-02 full 22+Center integration + TP-07-03..10 E2E + TP-07-10 validator")
stale. The plan-of-record itself lists these as remaining.

#### F-07-E2E-01 — E2E spec file MISSING (7 undelivered rows) — BLOCKING

`tests/simple-model-adapters-strategy-property.spec.mjs` (named under scope.md → Implementation Files → New, and
the file for TP-07-03..TP-07-09) **does not exist**. A repo-wide grep for the 7 exact scope.md test titles
returns nothing (`GREP_TITLES_EXIT=1`). This is the identical pattern to Scope 06's F-06-E2E-01 (which was routed
to bubbles.implement, authored as `tests/simple-model-adapters-macro-fundamental.spec.mjs`, then re-verified).
Under full-delivery, sibling Scopes 05 and 06 both ran ALL their per-tool E2E rows in-scope before `done`.
→ **Route:** bubbles.implement authors + runs the 7 persistent system-Chrome regressions TP-07-03 (SCN-012-002
seeded strategy), TP-07-04 (strategy-validation), TP-07-05 (smart-money decay), TP-07-06 (waterfront/polo),
TP-07-07 (Palm Springs), TP-07-08 (Ocean Shores), TP-07-09 (Center triage inside Brief), mirroring the delivered
Scope-05/06 specs (real page.goto + real adapter UMD + real createSimpleRuntime + real renderer + real DOM host;
no request interception).

#### F-07-REGLOOP-01 — TP-07-02 integration loop covers 16, NOT 22+Center — BLOCKING

`node --test tests/simple-model-adapters.integration.mjs` → 5/5 exit 0, but the file contains only per-scope
blocks `TP-05-02` (market-structure + options = 8) and `TP-06-02` (macro-rotation + fundamental = 8) = **16
adapters**. There is NO `TP-07-02` block registering the 7 Scope-07 adapters, and no single all-22+Center loop.
scope.md TP-07-02 requires the loop to prove "all 22 ordinary adapters plus Center triage, every enabled
parameter effect/owner parity … and no generic fallback." → **Route:** bubbles.implement adds the genuine
Scope-07 owner-parity/parameter-effect integration block (or refactors to a single registry-derived 22+Center
loop) with real per-adapter owner fixtures.

#### F-07-VALIDATOR-01 — TP-07-10 `--require-simple-adapters` is a no-op (registeredAdapters=0) — BLOCKING

`node scripts/validate-tool-experience.mjs --require-simple-adapters` → exit 0 and confirms
`registry=PASS tools=23 ordinary=22 marketAction=1` (22+1 registry DEFINITIONS exist), but the runtime line is
`simpleRuntime=PASS truthStates=6 registeredAdapters=0 toolIdBranches=0 authorityOwned=0`. The validator NEVER
calls any `register*Adapters` (no `registerStrategyResearch`/`registerPropertyResearch`/`registerMarketAction`/
`registerMarketStructure`/`registerMacroRotation` in the script), and the string `--require-simple-adapters`
does not appear in the validator at all — the flag is effectively ignored and the release gate passes with ZERO
registered owner adapters. So TP-07-10's DoD claim ("validator evidence proves SCN-012-036 complete Simple
inventory with no generic/unresolved adapter") is NOT enforced. → **Route:** bubbles.implement wires
`--require-simple-adapters` to register the 6 ordinary owner-adapter modules + the Center model and assert 22
ordinary owner adapters + 1 in-Brief Center resolve with no generic fallback / no unresolved definition.

### SCN-012-036 registry-completion verdict

**Registry has 22 ordinary + 1 marketAction DEFINITIONS (validator `registry=PASS tools=23 ordinary=22
marketAction=1`), and each of the 6 Scope-07 ordinary adapters + the Center adapter individually registers and
runs at owner-parity (TP-07-01 38/38). BUT the "22 ordinary tools resolve exactly one actual owner adapter, no
generic fallback" HEADLINE is proven by NEITHER of the two mechanisms the scope assigns to it: the integration
loop proves only 16 (F-07-REGLOOP-01) and the validator reports registeredAdapters=0 (F-07-VALIDATOR-01).
SCN-012-036 is therefore NOT yet proven at the registry-wide level.**

### DoD reconciliation (this session): 5 / 16 `[x]`

Checked (genuinely reproduced): Core-1 (adapters execute real owner logic, single-sourced, forbidden-authority
0, RED-bite teeth), Core-2 (SCN-012-002 deterministic seed identity — unit-proven; its E2E row TP-07-03 is in the
F-07-E2E-01 gap), Core-4 (Scope 05/06 fingerprints + legacy Brief provenance unchanged), TP-07-01 (unit 38/38),
TP-07-11 (selftest 934/0). Left `[ ]` (routed): Core-3 (validator accounts for 22+Center → F-07-VALIDATOR-01),
TP-07-02 (→ F-07-REGLOOP-01), TP-07-03..TP-07-09 (→ F-07-E2E-01), TP-07-10 (→ F-07-VALIDATOR-01), and the Build
Quality Gate (names per-tool E2E / no-interception scan / all-tool registry loop / registry validator — all in
the routed gaps).

---

## Finding Closure (bubbles.implement) — SCN-012-036 + E2E package

Dispatch to close the three bubbles.test-routed BLOCKING findings (F-07-VALIDATOR-01, F-07-REGLOOP-01,
F-07-E2E-01) at HEAD `fb38d87e`. Every command below was executed in THIS session; blocks are raw terminal
output. Adapter COMPUTE logic, owner pages, Scope 04/05/06 modules, `rldata.js`, `rlexperience.js`, and
`data/options` were NOT changed — only `scripts/validate-tool-experience.mjs`,
`tests/simple-model-adapters.integration.mjs`, and the new `tests/simple-model-adapters-strategy-property.spec.mjs`.

<a id="tp-07-10"></a>
### F-07-VALIDATOR-01 CLOSED — TP-07-10 `--require-simple-adapters` now enforces the 22+1 owner-adapter registry | Claim Source: executed

**Root defect (as routed):** the validator's `main()` never read argv, never called any `register*Adapters`, and
the string `--require-simple-adapters` did not appear in the script — so the flag was a pure NO-OP: the release
gate passed with ZERO registered owner adapters.

**Fix:** added `validateSimpleAdapterRegistry(packet)` — behind the `--require-simple-adapters` flag it builds ONE
production runtime over the ACTUAL model registry, loads + registers the six ordinary owner modules
(`market-structure.js` `{rlvol}`, `options.js`, `macro-rotation.js`, `fundamental-models.js`, `strategy-research.js`,
`property-research.js` `{rental}`) plus the internal Center model (`market-action.js`), then runs the production
registry loop: every one of the 22 ordinary registry tools MUST resolve exactly one registered owner adapter via
`runtime.adapterStatus(definitionId).registered === true`, the single Center triage MUST resolve, and the runtime
diagnostic MUST show `registeredAdapterCount === 23`, `toolIdBranchCount === 0`, zero authority. The runtime
structurally rejects any undeclared adapterId and any duplicate registration, so a generic fallback cannot register.

**BEFORE (NO-OP — flag ignored, registeredAdapters=0, exit 0):**

```text
$ node scripts/validate-tool-experience.mjs --require-simple-adapters
[tool-experience] artifact=config bytes=6007 budget=65536 result=PASS
[tool-experience] artifact=models bytes=94130 budget=524288 result=PASS
[tool-experience] artifact=journeys bytes=117489 budget=1048576 result=PASS
[tool-experience] registry=PASS tools=23 ordinary=22 marketAction=1
[tool-experience] definitions=PASS simpleModels=23 journeys=48 steps=48
[tool-experience] simpleRuntime=PASS truthStates=6 registeredAdapters=0 toolIdBranches=0 authorityOwned=0 occurrenceIdentityStable=true cutoffIdentityChanged=true
...
[tool-experience] OK adversarial=13 unexpectedAcceptances=0
VALIDATOR_BEFORE_EXIT=0
```

There is NO `simpleAdapterRegistry=` line and `registeredAdapters=0` — the flag did nothing.

**AFTER (flag now registers + enforces — 22 ordinary + 1 Center resolve, exit 0):**

```text
$ node scripts/validate-tool-experience.mjs --require-simple-adapters
[tool-experience] artifact=config bytes=6007 budget=65536 result=PASS
[tool-experience] artifact=models bytes=94130 budget=524288 result=PASS
[tool-experience] artifact=journeys bytes=117489 budget=1048576 result=PASS
[tool-experience] registry=PASS tools=23 ordinary=22 marketAction=1
[tool-experience] definitions=PASS simpleModels=23 journeys=48 steps=48
[tool-experience] simpleRuntime=PASS truthStates=6 registeredAdapters=0 toolIdBranches=0 authorityOwned=0 occurrenceIdentityStable=true cutoffIdentityChanged=true
[tool-experience] simpleAdapterRegistry=PASS ordinaryAdapters=22 centerAdapters=1 registeredAdapters=23 toolIdBranches=0 authorityOwned=0
[tool-experience] ids=PASS toolIds=market-brief,market-heatmap-lab,...,technical-analysis-decision-lab
[tool-experience] scaling=PASS addedTool=feature-012-scaling-probe tools=24 models=24 journeys=50 steps=50
[tool-experience] adversarial=missing-experience result=REJECTED code=E012-REGISTRY
... (13 adversarial rejections) ...
[tool-experience] shadow=PASS shadowOnly=true integrationClaims=0
[tool-experience] OK adversarial=13 unexpectedAcceptances=0
VALIDATOR_AFTER_EXIT=0
```

`registeredAdapters=0` on the `simpleRuntime` line is the UNCHANGED ships-with-zero-adapters production-core
invariant (a SEPARATE runtime); the NEW `simpleAdapterRegistry=PASS ... registeredAdapters=23` line is the wired
enforcement. Backward-compat: `node scripts/validate-tool-experience.mjs` (no flag) → exit 0, no
`simpleAdapterRegistry` line (`VALIDATOR_NOFLAG_EXIT=0`).

**GENUINE-BITE proof (the gate is NOT a new NO-OP).** A throwaway in-session script (never committed, outside the
repo tree) exercised the REAL production runtime + REAL owner modules + REAL `adapterStatus`, registering only 6
of 7 modules (property-research OMITTED). The resolution loop correctly reported the 3 property tools unresolved
and exited non-zero:

```text
$ node /tmp/adversarial-registry-bite.mjs
registeredAdapterCount=20 (expected 23 when all 7 modules register; 20 here with property-research omitted)
unresolvedOrdinaryTools=["waterfront-polo-lab","palm-springs-rental-market-lab","ocean-shores-rental-market-lab"]
ADVERSARIAL BITE: 3 ordinary tools have NO registered owner adapter -> gate would exit non-zero
ADVERSARIAL_BITE_EXIT=1
```

**Regression:** `node scripts/selftest.mjs` → `934 passed, 0 failed` `SELFTEST_EXIT=0` (validator edit is
gated + additive; no baseline drift). Boundary: only `scripts/validate-tool-experience.mjs` changed; no adapter
compute, no owner page, no protected path touched.

**F-07-VALIDATOR-01: CLOSED.** SCN-012-036 registry-completion is now genuinely enforced by the release gate.

<a id="tp-07-02"></a>
### F-07-REGLOOP-01 CLOSED — TP-07-02 integration loop now covers all 22 ordinary + Center (was 16) | Claim Source: executed

**Root defect (as routed):** `tests/simple-model-adapters.integration.mjs` held only the per-scope blocks
`TP-05-02` (market-structure + options = 8) and `TP-06-02` (macro-rotation + fundamental = 8) = **16 adapters**;
there was NO `TP-07-02` block and no all-22+Center loop.

**Fix:** added a genuine `TP-07-02` Scope-07 block mirroring the proven Scope-05/06 blocks — the seven Scope-07
owner fixtures (copied verbatim from the Scope-07 unit suite) + the three helpers (`palmOwnerRun`, `oceanOwnerRun`,
`locationOwnerNearest`) + `makeScope7Descriptors` + `registerScope7`, driven through the SAME generic
registry-derived exerciser (`exerciseScope6Adapter`: owner-parity single-source check + a per-declared-parameter
recompute proving each declared `affectsOutputPaths`). Three new tests: (1) the registry-derived Scope-07 loop
runs all seven (six ordinary + the in-Brief Center) at owner-parity with real parameter effects, (2) an
SCN-012-036 completeness test that registers ALL seven modules alongside the four Scope-05/06 modules in ONE
runtime and asserts every one of the 22 ordinary registry tools resolves exactly one registered owner adapter via
`runtime.adapterStatus(definitionId).registered`, the one Center resolves, and the diagnostic shows
`registeredAdapterCount === 23`, `toolIdBranchCount === 0`, zero authority (no generic fallback), and (3) a
Scope-05/06 stability test proving the Scope-05 breadth owner-run fingerprint is byte-identical when Scope 06 +
Scope 07 share the runtime.

**Command + full raw output:**

```text
$ node --test tests/simple-model-adapters.integration.mjs
✔ TP-05-02 market structure and options adapters: registry-derived loop runs all eight at owner-parity with real parameter effects (365.652341ms)
✔ TP-05-02 market structure and options adapters: a missing definition removes exactly that adapter from the production registry loop (23.536861ms)
✔ TP-05-02 market structure and options adapters: adding a valid definition registers exactly that adapter through the production loop (79.653405ms)
✔ TP-06-02 macro rotation and fundamental adapters: registry-derived loop runs the delivered Scope-06 set at owner-parity with real parameter effects (375.830782ms)
✔ TP-06-02 macro rotation and fundamental adapters: Scope 05 adapter set and a real Scope 05 owner-run fingerprint are unchanged when Scope 06 shares the runtime (26.412971ms)
✔ TP-07-02 strategy/property/method + Center adapters: registry-derived loop runs all seven Scope-07 (six ordinary + in-Brief Center) at owner-parity with real parameter effects (436.072767ms)
✔ TP-07-02 SCN-012-036 completeness: all 22 ordinary adapters plus the in-Brief Center triage register in ONE runtime and every ordinary registry tool resolves exactly one owner adapter with no generic fallback (41.11411ms)
✔ TP-07-02 Scope 05 and Scope 06 adapter sets and a real Scope-05 owner-run fingerprint are unchanged when Scope 07 shares the runtime (30.490782ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ duration_ms 1483.81509
INTEGRATION_EXIT=0
```

Coverage: **16 → 23** (8 Scope-05 + 8 Scope-06 + 7 Scope-07, plus the all-22+Center completeness loop over the
full registry). Every Scope-07 adapter runs at genuine owner-parity (single-sourced from its owner engine) with a
real per-parameter output effect; the completeness test proves the 22-ordinary + 1-Center inventory resolves with
zero generic fallback. Boundary: only `tests/simple-model-adapters.integration.mjs` changed; no production code,
no owner fixture re-derivation (verbatim copies), no adapter compute touched.

**F-07-REGLOOP-01: CLOSED.**

<a id="f-07-e2e-01"></a>
### F-07-E2E-01 CLOSED — the 7 persistent per-tool system-Chrome E2E rows TP-07-03..TP-07-09 authored + green | Claim Source: executed

**Root gap (as routed):** the E2E spec `tests/simple-model-adapters-strategy-property.spec.mjs` (holding the seven
rows TP-07-03..TP-07-09) did not exist — the identical pattern to Scope 06's F-06-E2E-01. Under full-delivery,
sibling Scopes 05 and 06 both ran ALL their per-tool E2E rows in-scope before `done`.

**Fix:** authored the spec mirroring the delivered Scope-05/06 specs EXACTLY — real `page.goto` to the REAL owner
page, inject the REAL production adapter UMD (`strategy-research.js` / `property-research.js` / `market-action.js`,
+ `rlrental.js` for the two place-based scenarios), register into the REAL production runtime
(`globalThis.RLEXPERIENCE.createSimpleRuntime` + the module's real `register*Adapters`), drive the REAL
`renderSimpleProjection` into the REAL `[data-rlexperience-panel="simple"]` host, and assert the specified behavior
against the rendered DOM + the real owner-run summary. Owner data = frozen deterministic fixtures byte-faithful to
the TP-07-01 unit fixtures (NOT interception). All seven pages are shell-opt-out for the shared Simple UI (like the
Scope-06 msft page); each row drives the REAL adapter through the page's own already-loaded production core,
mounting the Simple host the shell omits. ZERO `page.route` / `context.route` / `intercept` / `routeFromHAR` /
`msw` / `nock` / `fulfill` anywhere (the no-interception scan below is empty of executable hits).

**Full 7-row spec — one invocation:**

```text
$ npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 7 tests using 1 worker

  ✓  1 …one seed and separates parameter sensitivity from path randomness (2.7s)
  ✓  2 …alidation Simple controls recompute owner out-of-sample evidence (742ms)
  ✓  3 …smart-money Simple controls recompute owner disclosure-lag decay (512ms)
  ✓  4 …ols recompute owner suitability with unverified evidence visible (431ms)
  ✓  5 …ple controls recompute owner cash-flow without zero-filling gaps (452ms)
  ✓  6 …ols recompute owner seasonal cash-flow without zero-filling gaps (489ms)
  ✓  7 … controls recompute bounded action or no-action inside Brief only (2.3s)

  7 passed (13.7s)
FULLSPEC_EXIT=0
```

**Per-row (each with its exact scope.md `--grep`, `--project=system-chrome --reporter=list`):**

| Row | Adapter | Exit | Result |
|---|---|---|---|
| TP-07-03 | `strategy-evolution/v1` | 0 | 1 passed |
| TP-07-04 | `walk-forward-validation/v1` | 0 | 1 passed |
| TP-07-05 | `disclosure-decay/v1` | 0 | 1 passed |
| TP-07-06 | `location-suitability/v1` | 0 | 1 passed |
| TP-07-07 | `str-scenario/palm-springs/v1` | 0 | 1 passed |
| TP-07-08 | `str-scenario/ocean-shores/v1` | 0 | 1 passed |
| TP-07-09 | `market-action-triage/v1` | 0 | 1 passed |

TP-07-03 raw output + the browser-level SCN-012-002 proof (same-seed reproducible / common-random sensitivity /
new-seed path change) is recorded at `#scenario-scn-012-002` above.

<a id="tp-07-04"></a>
##### TP-07-04 :: strategy-validation-lab (simple-adapter/walk-forward-validation/v1) #####

```text
Running 1 test using 1 worker

  ✓  1 …alidation Simple controls recompute owner out-of-sample evidence (644ms)

  1 passed (2.1s)
TP0704_EXIT=0
```

Command: `... --grep "Regression: strategy validation Simple controls recompute owner out-of-sample evidence" ...` — controls `cost→80` + `folds→8` recompute the owner out-of-sample evidence (net OOS Sharpe / per-fold structure); `changedParameters=['cost','folds']`, both renders are a ready owner run, and the rendered Simple text moves.

<a id="tp-07-05"></a>
##### TP-07-05 :: smart-money-flow-lab (simple-adapter/disclosure-decay/v1) #####

```text
Running 1 test using 1 worker

  ✓  1 …smart-money Simple controls recompute owner disclosure-lag decay (570ms)

  1 passed (2.2s)
TP0705_EXIT=0
```

Command: `... --grep "Regression: smart-money Simple controls recompute owner disclosure-lag decay" ...` — controls `lag-half-life→90` (surviving decayed conviction) + `cluster-minimum→2` (admits the 2-filer cluster); `changedParameters=['cluster-minimum','lag-half-life']`, the rendered owner read moves.

<a id="tp-07-06"></a>
##### TP-07-06 :: waterfront-polo-lab (simple-adapter/location-suitability/v1) #####

```text
Running 1 test using 1 worker

  ✓  1 …ols recompute owner suitability with unverified evidence visible (643ms)

  1 passed (2.4s)
TP0706_EXIT=0
```

Command: `... --grep "Regression: waterfront polo Simple controls recompute owner suitability with unverified evidence visible" ...` — controls `travel-limit→70` + `budget→2500000` recompute the owner shortlist; the test ALSO asserts the owner run keeps the unverified-evidence truth visible: `verification.floodRequired=true`, `verification.clubRequired=true`, `verification.unverifiedIds` includes the estimated-hazard market `m-b` AND the seed-club market `m-f`, and the shortlisted seed-club market `m-f` still surfaces `nearestClubConfidence='seed'` (never promoted to `reported`).

<a id="tp-07-07"></a>
##### TP-07-07 :: palm-springs-rental-market-lab (simple-adapter/str-scenario/palm-springs/v1) #####

```text
Running 1 test using 1 worker

  ✓  1 …ple controls recompute owner cash-flow without zero-filling gaps (574ms)

  1 passed (2.1s)
TP0707_EXIT=0
```

Command: `... --grep "Regression: Palm Springs Simple controls recompute owner cash-flow without zero-filling gaps" ...` — real `rlrental.js` (RLRENTAL) injected as `deps.rental`; controls `adr→1500` + `occupancy→72` recompute the owner cash flow; the test ALSO asserts the undisclosed-economics gap is preserved WITHOUT zero-filling: `cashFlow.fullEconomicsState='INCOMPLETE'`, `cashFlow.fullPreTaxCashFlowUsd=null`, `cashFlow.missingCostFieldIds` includes `property-tax` + `capital-reserve`, while the disclosed-cost `annualOperatingPreTaxCashFlowUsd` is a real owner number.

<a id="tp-07-08"></a>
##### TP-07-08 :: ocean-shores-rental-market-lab (simple-adapter/str-scenario/ocean-shores/v1) #####

```text
Running 1 test using 1 worker

  ✓  1 …ols recompute owner seasonal cash-flow without zero-filling gaps (565ms)

  1 passed (2.0s)
TP0708_EXIT=0
```

Command: `... --grep "Regression: Ocean Shores Simple controls recompute owner seasonal cash-flow without zero-filling gaps" ...` — real `rlrental.js` (RLRENTAL) injected as `deps.rental`; controls `adr→1400` + `occupancy→70` recompute the seasonal owner cash flow; the same undisclosed-economics gap is preserved WITHOUT zero-filling (`fullEconomicsState='INCOMPLETE'`, `fullPreTaxCashFlowUsd=null`, `missingCostFieldIds` includes `property-tax` + `capital-reserve`).

<a id="tp-07-09"></a>
##### TP-07-09 :: market-brief (simple-adapter/market-action-triage/v1) — Center in-Brief only #####

```text
Running 1 test using 1 worker

  ✓  1 … controls recompute bounded action or no-action inside Brief only (2.8s)

  1 passed (4.3s)
TP0709_EXIT=0
```

Command: `... --grep "Regression: Market Action triage controls recompute bounded action or no-action inside Brief only" ...` — real `market-action.js` (RLMARKETACTION) on the REAL `market-brief.html`; controls `evidence-threshold→0.95` + `catalyst-horizon→30` recompute a BOUNDED triage — the default frozen window triages to `actionState.state='action'` and the tighter evidence threshold flips it to `'no-action'` (both bounded ∈ {action, no-action}). INSIDE the Brief only: the Market Action Center page exposes NO top-level Simple tab (`nativeSimpleTabs=0`) and NO shared Simple panel (`nativeSimplePanel=false`) — the triage is an in-Brief model, not a fifth/top-level Simple view.

<a id="no-interception-scan-07"></a>
##### No-interception scan (new spec) — live-stack authentic #####

```text
$ grep -nE 'page\.route|context\.route|\.intercept|routeFromHAR|msw|nock|fulfill\(' tests/simple-model-adapters-strategy-property.spec.mjs
28: * page.route / context.route / intercept / routeFromHAR / msw / nock / fulfill anywhere — the owner
GREP_EXIT=0
```

The single match is line 28 — a header doc-comment asserting the ABSENCE of interception (identical to the
Scope-05/06 specs). ZERO executable interception hits; every row is real `page.goto` + real production core + real
adapter UMD + real runtime + real `renderSimpleProjection` + a frozen owner fixture (never an intercepted network
response).

**Broad selftest unchanged:** `node scripts/selftest.mjs` → `934 passed, 0 failed` (`SELFTEST_EXIT=0`). **Artifact
lint:** `bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools` →
`Artifact lint PASSED` (`ARTIFACTLINT_EXIT=0`).

**Change boundary:** only `tests/simple-model-adapters-strategy-property.spec.mjs` (new), this `report.md`, the
scope `scope.md` DoD checkboxes, and `state.json` (execution pointer) changed. No adapter module, owner page,
`rlexperience.js`, `rldata.js`, `simple-models.json`, `scripts/selftest.mjs`, or any other scope was touched; the
concurrent-session dirty file `bugs/BUG-001-.../scenario-manifest.json` was preserved (not staged / reverted).

**F-07-E2E-01: CLOSED.** Scope 07 stays `in_progress`; `bubbles.test` independently re-verifies TP-07-03..09 and
finalizes the DoD and status.

## Independent Verification (bubbles.test) — Finalization

Final mechanical finalization at HEAD `56f4672d` (full-delivery; recorded evidence re-confirmed from scratch this
session, not trusted). The three previously-routed BLOCKING findings are all **CLOSED** (committed `dd53e4b5`
F-07-VALIDATOR-01, `e3ddaec2` F-07-REGLOOP-01, `56f4672d` F-07-E2E-01) and every green signal was reproduced
in-session. **Outcome: ✅ TESTED — Scope 07 `done`, `substate: independently_verified`.** No `done` fabricated;
feature `status` stays `not_started`, `certifiedAt` null, `certification.status` untouched.

### Re-confirmed signals (this session, full output)

```text
repo-binding-preflight.sh                                    PREFLIGHT_EXIT=0
node scripts/validate-tool-experience.mjs --require-simple-adapters
  simpleAdapterRegistry=PASS ordinaryAdapters=22 centerAdapters=1 registeredAdapters=23
  adversarial=13 REJECTED unexpectedAcceptances=0            VALIDATOR_EXIT=0
node --test tests/simple-model-adapters.integration.mjs
  8 pass / 0 fail (incl TP-07-02 SCN-012-036 completeness: all 22 ordinary + Center resolve, no generic fallback)
                                                            INTEGRATION_EXIT=0
npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --project=system-chrome
  7 passed                                                  PLAYWRIGHT_EXIT=0
node scripts/selftest.mjs      Research-Lab self-test: 934 passed, 0 failed     SELFTEST_EXIT=0
git diff --check                                            GIT_DIFF_CHECK_EXIT=0
bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools
  Artifact lint PASSED                                      ARTIFACT_LINT_EXIT=0
```

### Single-source (all 7 owner surfaces + Brief) — genuinely wired

Every Scope-07 page loads its module AND its adapter global is active. The dispatch spot-confirm grep reported a
`0` for three pages; each is a **false negative from a module-name / registration-pattern mismatch**, reconciled
to ground truth (direct source + the live 7/7 e2e + the validator's `registeredAdapters=23`):

| Page | Module loaded | Adapter global | Wired? |
|---|---|---|---|
| strategy-self-improvement-lab | strategy-research.js | RLSTRATEGY (page refs) | yes |
| strategy-validation-lab | strategy-research.js | RLSTRATEGY (page refs) | yes |
| smart-money-flow-lab | strategy-research.js | RLSTRATEGY (page refs) | yes |
| waterfront-polo-lab | property-research.js | RLPROPERTY (page refs) | yes |
| palm-springs-rental-market-lab | **rlrental.js** (L886) | **RLRENTAL.mountRoute** (L892) | yes — grep looked for the wrong module name |
| ocean-shores-rental-market-lab | **rlrental.js** (L877) | **RLRENTAL.mountRoute** (L883) | yes — grep looked for the wrong module name |
| market-brief → market-action | **rlexperience-adapters/market-action.js** (L871, `defer`) | **RLMARKETACTION set BY the UMD module** (`globalThis.RLMARKETACTION`, market-action.js L51), mounted at `data-rlbrief-mount` (L876) | yes — the global is set by the self-registering module, never textually in the page |

### Integrity

Verification was **read-only** — no neutralize-and-restore bite was performed this session, so nothing needed
restoring. `git status --short` shows ONLY the preserved concurrent `bugs/BUG-001-.../scenario-manifest.json`
dirty. DoD reconciled **16 / 16 `[x]`**.
