# Scope 05 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

**Status: In Progress (partial delivery — 2 of 8 adapters delivered and verified across dispatches).**

Scope 05 requires eight market-structure/options Simple adapters at genuine
owner-parity across ~17k lines of eight distinct tool pages, an all-eight
registry-derived integration loop, a source-ownership functional suite, eight
persistent system-Chrome e2e regressions, and all-eight selftest canaries — with
the 712-test broad selftest kept green. That full surface is a multi-session
implementation effort; it is not honestly completable and verifiable in a single
session.

Two adapters are now delivered at genuine owner-parity. The first dispatch
delivered `simple-adapter/market-breadth/v1`; this dispatch delivered
`simple-adapter/conditional-volatility/v1`. Both establish and prove the
pattern:

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
- Broad selftest remains **712 passed / 0 failed** (no regression from either
  added adapter — `rlvol.js`, the vol page, and `scripts/selftest.mjs` are all
  byte-unchanged).

Honest gaps (keep scope In Progress): the other six adapters
(`session-auction`, `swing-transition`, `technical-five-gate`,
`options-anomaly`, `options-surface`, `dealer-gamma-playbook`) are not yet
extracted/registered; `rlexperience-adapters/options.js` is not created;
single-source page rewiring (Power consuming the module) is not yet done for
market-heatmap — and it is coupled to `scripts/selftest.mjs` lines 808–870,
which currently extract and test the page's INLINE owner functions, so that
group must be reconciled in lockstep (this coupling does NOT apply to
conditional-volatility, whose owner seam is already a module); the all-eight
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

No completion statement is authorized. Scope 05 remains In Progress: 1 of 8
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

### tp-05-02 … tp-05-12

**Status:** OPEN — not delivered this session. TP-05-02 (all-eight integration loop), TP-05-03 (source-ownership functional), TP-05-04..11 (eight system-Chrome e2e regressions), and TP-05-12 (all-eight selftest canaries) require the remaining seven adapters and the single-source page rewiring, which are not yet implemented.

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
