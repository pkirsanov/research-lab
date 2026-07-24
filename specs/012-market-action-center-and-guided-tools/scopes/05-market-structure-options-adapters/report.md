# Scope 05 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

**Status: In Progress (partial delivery — 4 of 8 adapters delivered and verified across dispatches).**

Scope 05 requires eight market-structure/options Simple adapters at genuine
owner-parity across ~17k lines of eight distinct tool pages, an all-eight
registry-derived integration loop, a source-ownership functional suite, eight
persistent system-Chrome e2e regressions, and all-eight selftest canaries — with
the 712-test broad selftest kept green. That full surface is a multi-session
implementation effort; it is not honestly completable and verifiable in a single
session.

Four adapters are now delivered at genuine owner-parity across four dispatches.
Dispatch 1 delivered `simple-adapter/market-breadth/v1`; dispatch 2 delivered
`simple-adapter/conditional-volatility/v1`; dispatch 3 delivered
`simple-adapter/session-auction/v1` (the FIRST page-extraction adapter to carry
the full single-source page rewiring); dispatch 4 delivered
`simple-adapter/swing-transition/v1` (a second page-extraction adapter). Four
adapters now establish and prove the pattern:

- `rlexperience-adapters/market-structure.js` — the market-breadth adapter at
  faithful owner extraction. Its pure owner functions (`pctOverWindow`,
  `meanSampleSd`, `breadthReadCells`) are proven **byte/semantic identical** to
  the `market-heatmap-lab.html` inline `pctOver`/`meanSd`/`breadthRead` owner
  formula on a battery of canonical inputs (owner-parity lock). The adapter is
  pure compute over already-captured, frozen owner state; it performs **zero**
  fetch/providerFetch/credential/LLM/publisher/store calls and imports no
  cross-domain adapter (static scan: 0 hits).
- `tests/simple-model-adapters-market.unit.mjs` — six current-session tests, all
  passing (exit 0), driving the adapter through the **production** Scope 04
  runtime: register → prepare (ready owner run) → per-parameter recompute proving
  each of the five enabled parameters moves its declared output path → compute
  determinism → zero-authority sentinels.
- Adversarial RED/GREEN: neutralizing the `size-metric`→`summary.breadth` effect
  genuinely FAILS the parameter-effect test (RED, exit 1); byte-identical restore
  (sha256 `8c2c6dca…`) replays GREEN (exit 0). The test is non-tautological.
- **`simple-adapter/conditional-volatility/v1` (dispatch 2)** — the vol owner
  seam already lives ONLY in `rlvol.js`, and `volatility-sizing-lab.html` already
  consumes `RLVOL.buildVolDecisionRead` in its Power path. So this adapter is
  **single-sourced by construction**: it consumes the SAME `rlvol` formula via
  dependency injection (`deps.rlvol`), re-implements no formula, and needs **no
  owner-page edit and no `scripts/selftest.mjs` reconciliation** (a genuinely
  different, cleaner case than market-heatmap's inline formula). It is pure
  compute over frozen owner state; zero fetch/providerFetch/credential/LLM/
  publisher/store; imports no cross-domain adapter (module-wide static scan: 0
  hits). All seven declared parameters (estimator, window, target-volatility,
  multiplier-cap, volatility-floor, notional, horizon) move their declared output
  path through real `rlvol` recompute (the GARCH estimator converges and differs
  from EWMA, proving a real estimator effect — not an echoed field). Owner-parity
  is asserted directly against `rlvol.buildVolDecisionRead` (forecast value,
  estimator, regime band, regime window observations, sizing multiplier, sizing
  cap, worked-example exposure, and term horizon length all identical).
- Adversarial RED/GREEN (conditional-volatility): neutralizing the
  `window`→`summary.regime` override genuinely FAILS the parameter-effect test
  (RED, exit 1, `window must change summary.regime`); byte-identical restore
  (sha256 `45878fe7…`) replays GREEN (exit 0). Non-tautological.
- **`simple-adapter/session-auction/v1` (dispatch 3)** — the FIRST page-extraction
  adapter delivered with FULL single-source page rewiring. The intraday session
  formula (`computeSession` VWAP + σ bands + session volume-profile POC/VAH/VAL +
  opening range; `sessionType`; `controlRead`; `adherence`) is extracted VERBATIM
  from `intraday-tape-lab.html` into `market-structure.js` (single owner source).
  The page's Power path now **delegates** to `RLMARKETSTRUCTURE.computeSession /
  sessionType / controlRead / adherence` (the inline formula bodies are removed —
  proven by the no-inline-copy assertions), so Simple and Power share ONE formula.
  All five declared parameters move their declared derived path through real owner
  compute — `opening-range`→`summary.sessionType` (OR levels reshape), `vwap-band`
  and `profile-window`→`summary.levels` (σ band + composite N-session profile),
  `control-threshold`→`summary.control` (score-vs-threshold state flip), and
  `gamma-context`→`summary.sessionType` (same-cutoff walls participate or not) —
  with NO echoed raw param inside any declared path (non-tautological). Owner-parity
  is asserted directly against `computeSession`/`sessionType`/`controlRead`
  (`ownerType`, `orHigh/orLow`, `vwap`, `sd`, session POC/VAH/VAL, control
  score/label all identical). It is pure compute over frozen owner state; zero
  fetch/providerFetch/RLDATA/credential/LLM/publisher/store; imports no cross-domain
  adapter (module-wide static scan: 0 hits).
- Selftest reconciliation (session-auction): because the owner functions
  (`computeSession`/`sessionType`/`controlRead`/`adherence`) were NOT
  selftest-extracted, delegating them broke no existing group; a new
  `Feature 012 Scope 05` canary group was ADDED that (a) pins the single-sourced
  owner functions to canonical golden fingerprints and (b) proves the page loads
  the module + delegates the three reads + carries no inline copy.
- Adversarial RED/GREEN (session-auction): neutralizing the
  `gamma-context`→`summary.sessionType` effect genuinely FAILS the parameter-effect
  test (RED, exit 1, `gamma-context must change summary.sessionType`);
  byte-identical restore (sha256 `bf614a44…`) replays GREEN (exit 0).
  Non-tautological.
- **`simple-adapter/swing-transition/v1` (dispatch 4)** — a second page-extraction
  adapter delivered with FULL single-source page rewiring. The swing owner formula
  (MA stack `smaArr`, MA-alignment swing state `alignment`, pivot/structure pattern
  `pivots`/`structure`, OBV/accumulation `accumDist`, and the macro regime band
  `regimeBand`) is extracted VERBATIM into `market-structure.js` (single owner
  source). `swing-structure-lab.html`'s Power path now **delegates** to
  `RLMARKETSTRUCTURE.smaArr/alignment/pivots/structure/accumDist/regimeBand` (the
  inline formula bodies are removed — proven by the no-inline-copy assertions), so
  Simple and Power share ONE formula. All eight declared parameters move their
  declared derived path through real owner compute — `fast/medium/slow-ma`→
  `summary.swingState` (MA stack reshapes alignment), `breakout-tolerance`→
  `summary.transition` (extension-vs-tolerance state flip), `volume-confirmation`
  and `obv-confirmation`→`summary.confirmation` (volume/OBV gate), `pattern-
  threshold`→`summary.pattern` (evidence-vs-threshold flip), and `regime-window`→
  `summary.regime` (window return + observations) — with NO echoed raw param inside
  any declared path (non-tautological; echoed params live under `summary.params`).
  Owner-parity is asserted directly against `smaArr`/`alignment`/`structure`/
  `accumDist`/`regimeBand` (swing-state label/trend, structure pattern/stage, OBV
  label/score, regime band/note all identical). Pure compute over frozen owner
  state; zero fetch/providerFetch/RLDATA/credential/LLM/publisher/store; imports no
  cross-domain adapter (module-wide static scan: 0 hits).
- Selftest reconciliation (swing-transition): because the owner functions were NOT
  previously selftest-extracted, delegating them broke no existing group; a new
  `Feature 012 Scope 05 swing-transition` canary group was ADDED that (a) pins the
  single-sourced owner functions to canonical golden fingerprints and (b) proves
  the page loads the module + delegates the six reads + carries no inline copy.
- Adversarial RED/GREEN (swing-transition): neutralizing the
  `obv-confirmation`→`summary.confirmation` effect (forcing `obvConf` to a constant
  `true`) genuinely FAILS the parameter-effect test (RED, exit 1, `obv-confirmation
  must change summary.confirmation`); byte-identical restore (sha256 `338b5aa4…`)
  replays GREEN (exit 0). Non-tautological.
- Broad selftest remains **735 passed / 0 failed** (was 712 → 724 with the
  session-auction canaries → 735 with the 11 swing-transition canary assertions;
  the swing page rewire regresses nothing — `rlvol.js`, `rldata.js`,
  `scripts/fetch-options.mjs`, and `data/options` are all byte-unchanged).

Honest gaps (keep scope In Progress): the other four adapters
(`technical-five-gate`, `options-anomaly`, `options-surface`,
`dealer-gamma-playbook`) are not yet extracted/registered;
`rlexperience-adapters/options.js` is not created;
single-source page rewiring (Power consuming the module) is not yet done for
market-heatmap — and it is coupled to `scripts/selftest.mjs` lines 808–870, which
currently extract and test the page's INLINE owner functions, so that
group must be reconciled in lockstep (this coupling does NOT apply to
conditional-volatility, whose owner seam is already a module, and both
session-auction AND swing-transition HAVE now completed their rewiring because
their owner functions were not selftest-extracted — a decoupled, lower-risk
case); the all-eight
integration loop (TP-05-02), source-ownership functional (TP-05-03), the eight
e2e regressions (TP-05-04..11), and the all-eight selftest canaries (TP-05-12)
are not delivered.

## Decision Record

- Adapter owner data reaches `compute` via a closure `Map` keyed by the Scope 04
  `evidenceIdentity`: `captureEvidence` reduces + freezes the already-loaded
  owner snapshot and stashes it under its evidence identity; `compute` retrieves
  it by `input.evidenceIdentity`. Deterministic because identity fully derives
  from the frozen owner state + parameters + policy.
- The market-structure adapter module is the intended SINGLE owner source; the
  owning page's Power path must consume it for true single-source parity. This
  session PROVES faithful extraction (module == page inline, canonical inputs)
  but does not yet rewire the page, because the rewire is coupled to a
  `scripts/selftest.mjs` heatmap group that extracts the page's inline functions
  and would break without a coordinated reconciliation. Recorded as an explicit
  Uncertainty Declaration rather than rushed.
- No owner-page, `rldata.js`, `scripts/fetch-options.mjs`, or `data/options`
  bytes were changed (zero-edit proof below).

## Completion Statement

No completion statement is authorized. Scope 05 remains In Progress: 4 of 8
adapters delivered and verified; the DoD test-evidence items (TP-05-01..12) are
NOT satisfied because they require all eight adapters, the integration loop, the
source-ownership suite, the eight e2e regressions, and the all-eight canaries.

## Code Diff Evidence

## Test Evidence

Execution agents append one current-session block per Test Plan row with Phase, exact Command, Exit Code, Claim Source, and raw output.

### tp-05-01

**Phase:** implement · **Claim Source:** executed · **Status:** PARTIAL — market-breadth only (1 of 8 adapters). The TP-05-01 DoD item requires all eight definition/adapter contracts and remains OPEN.

**Command:** `node --test tests/simple-model-adapters-market.unit.mjs`
**Exit Code:** 0

```
✔ TP-05-01 market-structure module exposes only the market-breadth adapter with no forbidden authority (3.044384ms)
✔ TP-05-01 owner functions are byte/semantic parity with the market-heatmap-lab.html inline formula (1.392893ms)
✔ TP-05-01 market-breadth adapter registers through the production runtime and produces a ready owner run (24.678471ms)
✔ TP-05-01 each enabled market-breadth parameter changes its declared output path (57.679597ms)
✔ TP-05-01 market-breadth compute is deterministic for one compute identity (23.216878ms)
✔ TP-05-01 market-breadth adapter performs zero fetch provider storage author or publication calls (19.738596ms)
ℹ tests 6
ℹ pass 6
ℹ fail 0
ℹ duration_ms 228.191802
UNIT_EXIT=0
```

### owner-parity-fingerprint

**Phase:** implement · **Claim Source:** executed. Proof that the extracted owner functions are byte/semantic identical to the market-heatmap-lab.html inline formula is the passing test `TP-05-01 owner functions are byte/semantic parity …` above: it extracts the page's live `pctOver`/`meanSd`/`breadthRead` via balanced-brace parsing, evals them, and asserts equality to `market-structure.js` `pctOverWindow`/`meanSampleSd`/`breadthReadCells` across five bar batches × three windows, five number batches, and four cell batches.

### redgreen-replay

**Phase:** implement · **Claim Source:** executed.

```
=== SHA before RED bite ===
8c2c6dca9266f9d1272abc86d6b306c1f869fcd82a5a6306269a4ed954057caa  rlexperience-adapters/market-structure.js
===== RED BITE: size-metric effect neutralized (expect FAIL) =====
✖ TP-05-01 each enabled market-breadth parameter changes its declared output path
  AssertionError [ERR_ASSERTION]: size-metric must change summary.breadth
  false !== true
RED_EXIT=1
===== RESTORE GREEN =====
8c2c6dca9266f9d1272abc86d6b306c1f869fcd82a5a6306269a4ed954057caa  rlexperience-adapters/market-structure.js
===== GREEN REPLAY (expect PASS) =====
✔ TP-05-01 each enabled market-breadth parameter changes its declared output path (76.524948ms)
GREEN_EXIT=0
```

### forbidden-authority-scan

**Phase:** implement · **Claim Source:** executed. `market-structure.js` (comments stripped) contains zero authority calls.

```
ok  fetch(
ok  providerFetch(
ok  RLDATA
ok  localStorage
ok  sessionStorage
ok  XMLHttpRequest
ok  dynamic import(
ok  cross-domain adapter import
FORBIDDEN_HITS=0
```

### rldata-zero-edit + no-new-options-producer

**Phase:** implement · **Claim Source:** executed. `rldata.js`, `scripts/fetch-options.mjs`, and `data/options/**` are byte-unchanged; no new options producer/path introduced. (Pre-existing dirty BUG-001 report/state bytes are unrelated and preserved untouched.)

```
===== GIT INVENTORY (what changed this session) =====
 M .../scopes/05-market-structure-options-adapters/scope.md
?? rlexperience-adapters/
?? tests/simple-model-adapters-market.unit.mjs
(plus unrelated pre-existing dirty: BUG-001 report.md + state.json)

rldata.js diff lines: 0 | fetch-options.mjs diff lines: 0 | data/options diff lines: 0
(none — no new options producer or data path introduced)
```

### broad-selftest

**Phase:** implement · **Claim Source:** executed. The added module + test regress nothing.

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0

```
================================================
Research-Lab self-test: 712 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### tp-05-01-conditional-volatility

**Phase:** implement · **Claim Source:** executed · **Status:** DELIVERED — `simple-adapter/conditional-volatility/v1` (adapter 2 of 8). TP-05-01 as a DoD item still requires all eight definition/adapter contracts and remains OPEN.

**Command:** `node --test tests/simple-model-adapters-market.unit.mjs`
**Exit Code:** 0

```
ok 1 - TP-05-01 market-structure module exposes the delivered market-structure adapters with no forbidden authority
ok 2 - TP-05-01 owner functions are byte/semantic parity with the market-heatmap-lab.html inline formula
ok 3 - TP-05-01 market-breadth adapter registers through the production runtime and produces a ready owner run
ok 4 - TP-05-01 each enabled market-breadth parameter changes its declared output path
ok 5 - TP-05-01 market-breadth compute is deterministic for one compute identity
ok 6 - TP-05-01 market-breadth adapter performs zero fetch provider storage author or publication calls
ok 7 - TP-05-01 conditional-volatility adapter registers and is single-sourced from rlvol.buildVolDecisionRead
ok 8 - TP-05-01 each enabled conditional-volatility parameter changes its declared output path
ok 9 - TP-05-01 conditional-volatility compute is deterministic for one compute identity
ok 10 - TP-05-01 conditional-volatility adapter performs zero fetch provider storage author or publication calls
ok 11 - TP-05-01 volatility-sizing-lab.html single-sources the vol formula from rlvol.js with no inline copy
# tests 11
# pass 11
# fail 0
UNIT_EXIT=0
```

### owner-parity-conditional-volatility

**Phase:** implement · **Claim Source:** executed. The single-source owner-parity proof for conditional-volatility is the passing test `TP-05-01 conditional-volatility adapter registers and is single-sourced from rlvol.buildVolDecisionRead` (test 7 above): it reconstructs the exact `rlvol` input via `market-structure.js` `buildVolatilityInput(owner, defaults)`, computes the decision DIRECTLY with `rlvol.buildVolDecisionRead(...)` (the same function `volatility-sizing-lab.html` calls in its Power path), and asserts the adapter summary reflects those exact owner facts — `forecast.value`, `diagnostics.estimatorResolved`, `regime.band`, `regime.windowRef.observations`, `sizing.multiplier`, `sizing.cap`, `sizing.workedExample.conditionalExposure`, and `term.points.length` all identical. Test 11 independently proves the vol page consumes `RLVOL.buildVolDecisionRead` and reimplements no inline `ewmaVar`/`garch11Fit`/`sizingMultiplier`/`regimeBand` — so the owner formula has exactly ONE source (`rlvol.js`) shared by both Power and Simple, with no page edit required.

### redgreen-replay-conditional-volatility

**Phase:** implement · **Claim Source:** executed.

```
=== SHA before RED bite ===
45878fe7f03f80938b623bba38584fd453105bc1b6cf990338e17e306b251969  rlexperience-adapters/market-structure.js
===== RED BITE: window override neutralized (expect FAIL) =====
not ok 1 - TP-05-01 each enabled conditional-volatility parameter changes its declared output path
    window must change summary.regime
# pass 0
# fail 1
RED_EXIT=1
===== SHA after restore (must match 45878fe7…) =====
45878fe7f03f80938b623bba38584fd453105bc1b6cf990338e17e306b251969  rlexperience-adapters/market-structure.js
===== GREEN REPLAY (expect PASS) =====
# tests 11
# pass 11
# fail 0
GREEN_EXIT=0
```

### forbidden-authority-scan-conditional-volatility

**Phase:** implement · **Claim Source:** executed. `market-structure.js` (now including the conditional-volatility adapter, comments stripped) contains zero authority calls. The adapter reaches the `rlvol` engine only through the injected `deps.rlvol` factory argument — never a `require`, a global, a fetch, or a dynamic import.

```
ok  fetch(
ok  providerFetch(
ok  RLDATA
ok  localStorage
ok  sessionStorage
ok  XMLHttpRequest
ok  dynamic import(
ok  cross-domain adapter import
FORBIDDEN_HITS=0
```

### rldata-zero-edit-2 + no-new-options-producer-2

**Phase:** implement · **Claim Source:** executed. `rldata.js`, `scripts/fetch-options.mjs`, `data/options/**`, `rlexperience.js` (Scope 04 core), `scripts/selftest.mjs`, `volatility-sizing-lab.html`, and `simple-models.json` are all byte-unchanged this dispatch; no new options producer/path introduced. (Pre-existing dirty BUG-001 report/state bytes and `tests/tool-experience-shell.functional.mjs` are unrelated and preserved untouched.)

```
rldata.js                        diff-lines=0
rlexperience.js                  diff-lines=0
scripts/selftest.mjs             diff-lines=0
volatility-sizing-lab.html       diff-lines=0
scripts/fetch-options.mjs        diff-lines=0
simple-models.json               diff-lines=0
fetch-options.mjs diff lines: 0 | data/options diff lines: 0
(none — no new options producer or data path introduced)
```

### tp-05-01-session-auction

**Phase:** implement · **Claim Source:** executed · **Status:** DELIVERED — `simple-adapter/session-auction/v1` (adapter 3 of 8), the first page-extraction adapter with full single-source rewiring. TP-05-01 as a DoD item still requires all eight definition/adapter contracts and remains OPEN.

**Command:** `node --test tests/simple-model-adapters-market.unit.mjs`
**Exit Code:** 0

```
✔ TP-05-01 market-structure module exposes the delivered market-structure adapters with no forbidden authority (4.70001ms)
✔ TP-05-01 owner functions are byte/semantic parity with the market-heatmap-lab.html inline formula (1.473503ms)
✔ TP-05-01 market-breadth adapter registers through the production runtime and produces a ready owner run (24.516554ms)
✔ TP-05-01 each enabled market-breadth parameter changes its declared output path (57.426726ms)
✔ TP-05-01 market-breadth compute is deterministic for one compute identity (24.926855ms)
✔ TP-05-01 market-breadth adapter performs zero fetch provider storage author or publication calls (21.033846ms)
✔ TP-05-01 conditional-volatility adapter registers and is single-sourced from rlvol.buildVolDecisionRead (26.146358ms)
✔ TP-05-01 each enabled conditional-volatility parameter changes its declared output path (92.471011ms)
✔ TP-05-01 conditional-volatility compute is deterministic for one compute identity (28.053064ms)
✔ TP-05-01 conditional-volatility adapter performs zero fetch provider storage author or publication calls (26.739861ms)
✔ TP-05-01 volatility-sizing-lab.html single-sources the vol formula from rlvol.js with no inline copy (1.122803ms)
✔ TP-05-01 session-auction adapter registers and reflects intraday-tape-lab owner facts (single-sourced computeSession/sessionType/controlRead) (22.462651ms)
✔ TP-05-01 each enabled session-auction parameter changes its declared output path (52.00612ms)
✔ TP-05-01 session-auction compute is deterministic for one compute identity (34.346778ms)
✔ TP-05-01 session-auction adapter performs zero fetch provider storage author or publication calls (30.081869ms)
✔ TP-05-01 intraday-tape-lab.html single-sources the session formula from market-structure.js with no inline copy (1.377803ms)
ℹ tests 16
ℹ pass 16
ℹ fail 0
UNIT_EXIT=0
```

### owner-parity-session-auction

**Phase:** implement · **Claim Source:** executed. The single-source owner-parity proof is the passing test `TP-05-01 session-auction adapter registers and reflects intraday-tape-lab owner facts …` (test 12 above): it prepares the adapter through the production Scope 04 runtime on a frozen owner snapshot, then computes the owner facts DIRECTLY with `market-structure.js` `computeSession(todayBars, 30, 5)` / `sessionType(t)` / `controlRead(t, gap)` — the SAME functions `intraday-tape-lab.html` now calls in its Power path — and asserts the adapter summary reflects those exact facts: `summary.sessionType.ownerType === sessionType(t).type`, `summary.sessionType.orHigh/orLow === t.orHi/t.orLo`, `summary.levels.vwap === t.vwap`, `summary.levels.sd === t.sd`, `summary.levels.sessionPoc/Vah/Val === t.poc/t.vah/t.val`, `summary.control.score === controlRead(t, gap).score`, and `summary.control.label === controlRead(t, gap).label`. The `Feature 012 Scope 05` selftest canary independently pins those single-sourced owner functions to a canonical golden fingerprint (input→output stable pre/post extraction):

```
Feature 012 Scope 05 session-auction single-source owner parity (intraday-tape-lab)
  ✓ computeSession opening-range + session stats stable on the canonical session
  ✓ computeSession VWAP + sigma stable on the canonical session
  ✓ computeSession volume-profile POC/VAH/VAL stable on the canonical session
  ✓ sessionType classifies the rising canonical session as a trend-up day
  ✓ controlRead score + label stable on the canonical session
  ✓ adherence stable on the canonical session
  ✓ computeSession value-area + range invariants hold
  ✓ controlRead score bounded in [0,1]
  ✓ session-auction adapter id registered in the market-structure module
```

Canonical golden values (6-bar ascending session, orMin=10, ivMin=5): `orHi=102, orLo=99.5, vwap=102.7888888888889, sd=1.631253399787687, poc=102.23295454545455, vah=105.26136363636364, val=102.1590909090909, sessionType='Trend day · up', controlRead.score=0.9016666666666666 (Retail-driven), adherence=0.16666666666666666`.

### single-source-rewiring-session-auction

**Phase:** implement · **Claim Source:** executed. `intraday-tape-lab.html` now loads `rlexperience-adapters/market-structure.js` and its Power-path `computeSession`/`adherence`/`controlRead`/`sessionType` are one-line delegators to `RLMARKETSTRUCTURE.*` — the inline formula bodies are removed (ONE source of truth). The selftest reconciliation added a `Feature 012 Scope 05` canary group (the owner functions were NOT selftest-extracted, so no existing group broke); the broad selftest grew from 712 to 724 with 0 failed. The page single-source is proven by the passing `TP-05-01 intraday-tape-lab.html single-sources the session formula from market-structure.js with no inline copy` (loads the module; delegates the three reads; carries no inline `cumPV2 += b.v * tp * tp`, `held above VWAP, closing near the highs`, or `low VWAP adherence` formula) AND the three page assertions in the selftest canary:

```
  ✓ intraday-tape-lab.html loads the market-structure module
  ✓ intraday-tape-lab.html delegates computeSession/sessionType/controlRead to the single source
  ✓ intraday-tape-lab.html carries no inline copy of the single-sourced session formula

================================================
Research-Lab self-test: 724 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### redgreen-replay-session-auction

**Phase:** implement · **Claim Source:** executed. Adversarial proof that the per-parameter-effect test is non-tautological: neutralizing the `gamma-context`→`summary.sessionType` effect (forcing `sessionGammaTag` to return null) makes the effect test genuinely FAIL; byte-identical restore replays GREEN.

```
===== RED BITE: gamma-context effect neutralized (expect FAIL) =====
✖ TP-05-01 each enabled session-auction parameter changes its declared output path
  AssertionError [ERR_ASSERTION]: gamma-context must change summary.sessionType
  false !== true
RED_EXIT=1
===== SHA after restore (must match bf614a44…) =====
bf614a44bbd81cfae7874ec8a8432bcdf84252ca291db58420324b11c9b2239b  rlexperience-adapters/market-structure.js
===== GREEN REPLAY (expect PASS) =====
✔ TP-05-01 each enabled session-auction parameter changes its declared output path (67.879621ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
GREEN_EXIT=0
```

### forbidden-authority-scan-session-auction

**Phase:** implement · **Claim Source:** executed. `market-structure.js` (now including the session-auction adapter + the extracted owner functions, comments stripped) contains zero authority calls. The adapter is pure compute over the frozen owner session snapshot handed to it by `captureEvidence`.

```
ok  fetch(
ok  providerFetch(
ok  RLDATA
ok  localStorage
ok  sessionStorage
ok  XMLHttpRequest
ok  dynamic import(
ok  cross-domain adapter import
FORBIDDEN_HITS=0
```

### rldata-zero-edit-3 + no-new-options-producer-3

**Phase:** implement · **Claim Source:** executed. `rldata.js`, `scripts/fetch-options.mjs`, `rlexperience.js` (Scope 04 core), and `data/options/**` are all byte-unchanged this dispatch (`git diff --numstat` prints nothing for them); no new options producer/path introduced. This dispatch's slice is exactly `intraday-tape-lab.html`, `rlexperience-adapters/market-structure.js`, `scripts/selftest.mjs`, `tests/simple-model-adapters-market.unit.mjs`. (Pre-existing dirty BUG-001 `report.md`/`state.json` and `tests/tool-experience-shell.functional.mjs` are a concurrent session and are preserved untouched.)

```
=== GIT INVENTORY (working tree) ===
 M intraday-tape-lab.html
 M rlexperience-adapters/market-structure.js
 M scripts/selftest.mjs
 M specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/report.md
 M specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/state.json
 M tests/simple-model-adapters-market.unit.mjs
 M tests/tool-experience-shell.functional.mjs

=== protected-surface numstat (rldata.js / fetch-options.mjs / rlexperience.js / data/options) ===
(empty — all four surfaces byte-unchanged)
=== no new options producer ===
(empty — no new/changed options producer or data path)
```

### tp-05-01-swing-transition

**Phase:** implement · **Claim Source:** executed · **Status:** DELIVERED — `simple-adapter/swing-transition/v1` (adapter 4 of 8), a second page-extraction adapter with full single-source rewiring. TP-05-01 as a DoD item still requires all eight definition/adapter contracts and remains OPEN.

**Command:** `node --test tests/simple-model-adapters-market.unit.mjs`
**Exit Code:** 0

```
✔ TP-05-01 market-structure module exposes the delivered market-structure adapters with no forbidden authority (6.368952ms)
✔ TP-05-01 owner functions are byte/semantic parity with the market-heatmap-lab.html inline formula (1.747943ms)
✔ TP-05-01 market-breadth adapter registers through the production runtime and produces a ready owner run (29.439489ms)
✔ TP-05-01 each enabled market-breadth parameter changes its declared output path (63.221221ms)
✔ TP-05-01 market-breadth compute is deterministic for one compute identity (26.837945ms)
✔ TP-05-01 market-breadth adapter performs zero fetch provider storage author or publication calls (21.948333ms)
✔ TP-05-01 conditional-volatility adapter registers and is single-sourced from rlvol.buildVolDecisionRead (28.229359ms)
✔ TP-05-01 each enabled conditional-volatility parameter changes its declared output path (96.503771ms)
✔ TP-05-01 conditional-volatility compute is deterministic for one compute identity (27.435314ms)
✔ TP-05-01 conditional-volatility adapter performs zero fetch provider storage author or publication calls (24.987088ms)
✔ TP-05-01 volatility-sizing-lab.html single-sources the vol formula from rlvol.js with no inline copy (1.521893ms)
✔ TP-05-01 session-auction adapter registers and reflects intraday-tape-lab owner facts (single-sourced computeSession/sessionType/controlRead) (22.970439ms)
✔ TP-05-01 each enabled session-auction parameter changes its declared output path (58.836223ms)
✔ TP-05-01 session-auction compute is deterministic for one compute identity (35.734902ms)
✔ TP-05-01 session-auction adapter performs zero fetch provider storage author or publication calls (30.271258ms)
✔ TP-05-01 intraday-tape-lab.html single-sources the session formula from market-structure.js with no inline copy (2.054173ms)
✔ TP-05-01 swing-structure-lab.html single-sources the swing formula from market-structure.js with no inline copy (1.730942ms)
✔ TP-05-01 swing-transition adapter registers and reflects swing-structure-lab owner facts (single-sourced smaArr/alignment/structure/accumDist/regimeBand) (22.95042ms)
✔ TP-05-01 each enabled swing-transition parameter changes its declared output path (56.828225ms)
✔ TP-05-01 swing-transition compute is deterministic for one compute identity (24.920088ms)
✔ TP-05-01 swing-transition adapter performs zero fetch provider storage author or publication calls (23.760157ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 737.351574
UNIT_EXIT=0
```

### owner-parity-swing-transition

**Phase:** implement · **Claim Source:** executed. The single-source owner-parity proof is the passing test `TP-05-01 swing-transition adapter registers and reflects swing-structure-lab owner facts …` (test 18 above): it prepares the adapter through the production Scope 04 runtime on a frozen owner snapshot, then computes owner facts DIRECTLY with `market-structure.js` `smaArr`/`alignment`/`structure`/`accumDist`/`regimeBand` — the SAME functions `swing-structure-lab.html` now calls in its Power path — and asserts the adapter summary reflects those exact facts (swing-state label/trend, structure pattern/stage, OBV label/score, regime band/note all identical). The `Feature 012 Scope 05 swing-transition` selftest canary independently pins those single-sourced owner functions to canonical golden fingerprints:

```
Feature 012 Scope 05 swing-transition single-source owner parity (swing-structure-lab)
  ✓ smaArr trailing mean stable on the canonical swing bars
  ✓ alignment classifies the tangled canonical MA stack
  ✓ pivots detect the canonical swing high/low structure
  ✓ structure classifies the canonical double-bottom pattern
  ✓ accumDist OBV/accumulation stable on the canonical swing bars
  ✓ regimeBand maps fear/greed + trend to the owner regime bands
  ✓ swing owner functions preserve their structural invariants
  ✓ swing-transition adapter id registered in the market-structure module
  ✓ swing-structure-lab.html loads the market-structure module
  ✓ swing-structure-lab.html delegates smaArr/alignment/pivots/structure/accumDist/regimeBand to the single source
  ✓ swing-structure-lab.html carries no inline copy of the single-sourced swing formula
```

### single-source-rewiring-swing-transition

**Phase:** implement · **Claim Source:** executed. `swing-structure-lab.html` now loads `rlexperience-adapters/market-structure.js` and its Power-path `smaArr`/`alignment`/`pivots`/`structure`/`accumDist`/`regimeBand` delegate to `RLMARKETSTRUCTURE.*` — the inline formula bodies are removed (ONE source of truth). Proven by the passing `TP-05-01 swing-structure-lab.html single-sources the swing formula from market-structure.js with no inline copy` (loads the module; delegates the six reads; carries no inline `s -= bars[i - n].c`, `p > a && a > b && b > c`, `obvSeries.push(obv)`, `extreme greed without an intact uptrend`, or neckline structure formula) AND the three page assertions in the selftest canary above. The broad selftest grew 712 → 724 (session-auction) → 735 (swing-transition) with 0 failed:

```
Research-Lab self-test: 735 passed, 0 failed
```

### redgreen-replay-swing-transition

**Phase:** implement · **Claim Source:** executed. Adversarial proof the per-parameter-effect test is non-tautological: neutralizing the `obv-confirmation`→`summary.confirmation` effect (forcing `obvConf` to a constant `true` so the `false` case cannot flip the confirmation gate) makes the effect test genuinely FAIL; byte-identical restore replays GREEN.

```
=== SHA before RED bite ===
338b5aa4837450ee26a1f0ab8828c80b9a042a2592fb297457828e08f57ae12a  rlexperience-adapters/market-structure.js
===== RED BITE: obv-confirmation effect neutralized (obvConf=true constant; expect FAIL) =====
not ok 1 - TP-05-01 each enabled swing-transition parameter changes its declared output path
    obv-confirmation must change summary.confirmation
  name: 'AssertionError'
# pass 0
# fail 1
RED_EXIT=1
===== SHA after restore (must match 338b5aa4…) =====
338b5aa4837450ee26a1f0ab8828c80b9a042a2592fb297457828e08f57ae12a  rlexperience-adapters/market-structure.js
===== GREEN REPLAY (expect PASS) =====
# pass 1
# fail 0
GREEN_EXIT=0
=== working tree clean vs HEAD? ===
(empty stat — byte-identical to HEAD)
```

### forbidden-authority-scan-swing-transition

**Phase:** implement · **Claim Source:** executed. `market-structure.js` (all four adapters incl. swing-transition + the extracted owner functions, comments stripped) contains zero executable authority calls.

```
ok   fetch(
ok   providerFetch(
ok   RLDATA
ok   localStorage
ok   sessionStorage
ok   XMLHttpRequest
ok   dynamic import(
ok   cross-domain adapter import
FORBIDDEN_HITS=0
```

### rldata-zero-edit-4 + no-new-options-producer-4

**Phase:** implement · **Claim Source:** executed. The swing-transition delivery (commit `f1b5f633`) touched ONLY `market-structure.js`, `scripts/selftest.mjs`, `swing-structure-lab.html`, and the unit test; `rldata.js`, `scripts/fetch-options.mjs`, and `data/options/**` are absent from the commit and byte-unchanged in the working tree. No new options producer/path introduced.

```
=== swing commit f1b5f633 --stat ===
 rlexperience-adapters/market-structure.js   | 450 +++++++++++++++++++++++++++-
 scripts/selftest.mjs                        |  44 +++
 swing-structure-lab.html                    |  63 +---
 tests/simple-model-adapters-market.unit.mjs | 242 ++++++++++++++-
 4 files changed, 745 insertions(+), 54 deletions(-)

=== protected-surface presence in swing commit (expect none) ===
(none — rldata.js / fetch-options.mjs / data/options NOT in swing commit)

=== working tree numstat for protected surfaces (expect empty) ===
(empty — rldata.js / scripts/fetch-options.mjs / data/options byte-unchanged)
```

### tp-05-02 … tp-05-12

**Status:** OPEN — not delivered this session. TP-05-02 (all-eight integration loop), TP-05-03 (source-ownership functional), TP-05-04..11 (eight system-Chrome e2e regressions), and TP-05-12 (all-eight selftest canaries) require the remaining four adapters and the market-heatmap single-source page rewiring, which are not yet fully implemented.

## Uncertainty Declarations

- **Conditional-volatility single-source owner-parity is COMPLETE, not deferred.**
  Unlike market-heatmap (whose owner formula is inline in the page and must be
  extracted + rewired), the volatility owner formula already lives ONLY in
  `rlvol.js`, and `volatility-sizing-lab.html` already consumes
  `RLVOL.buildVolDecisionRead`. The adapter consumes the same function via
  injection, so there is genuinely ONE formula source and NO page edit / selftest
  reconciliation is owed. `Claim Source: executed` for every conditional-volatility
  claim. The only in-model dependency worth naming: the `estimator` parameter's
  effect on `summary.forecast` requires the optional GARCH(1,1) lightweight
  optimizer to converge to a value that differs from EWMA — this is VERIFIED
  in-session by the passing per-parameter test (test 8) on the heteroskedastic
  fixture, not assumed.
- **Single-source owner-parity for market-heatmap is PROVEN-BUT-NOT-YET-WIRED.**
  `market-structure.js` owner functions are proven byte-identical to the page's
  inline formula (parity lock test passes), but the page's Power path still uses
  its own inline copy. True single-source (Power consuming the module) is not
  done this session. It is coupled to `scripts/selftest.mjs` lines 808–870, which
  extract and test the page's inline `pctOver`/`meanSd`/`breadthRead`; delegating
  those to `RLMARKETSTRUCTURE` would break that selftest group unless the group
  is reconciled in the same change. Deferring the rewire avoids breaking the
  712-test green baseline under time pressure. `Claim Source: interpreted` for
  the single-source claim; `executed` for the byte-parity claim.
- The market-breadth `simple-models.json` definition carries a Scope-01
  placeholder `limitations` string; it was intentionally left byte-unchanged this
  session (the adapter satisfies the existing definition and changing it is not
  required for the delivered slice).

## Scenario Contract Evidence

### SCN-012-001

### SCN-012-014

### SCN-012-015

### SCN-012-016

## Coverage Report

## Lint/Quality

## Spot-Check Recommendations

## Validation Summary

## Audit Verdict
