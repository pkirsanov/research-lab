# SCOPE-1: Ratio capability foundation — Execution Report

## Summary

SCOPE-1 delivers `./rlratio.js` and `./ratio-pairs.json`, covered by seven
assertions across the `rlratio` and `rlratio-scale` groups in the concrete test
file `scripts/selftest.mjs`. The suite moved from 2457 to 2464 passing, 0 failed.
TP-01-01 through TP-01-08 executed and passed. TP-01-09 is blocked by a
scope-sequencing dependency recorded under its own heading below.

Every row below was executed with `node scripts/selftest.mjs` against the
concrete test file `scripts/selftest.mjs`.

## Test Evidence

#### TP-01-01

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlratio`)
**Exit Code:** 0

```
  ✓ RLRATIO ratioSeries returns level, trend, and a z-score carrying its declared window
Research-Lab self-test: 2464 passed, 0 failed
```

`windowStats` returns `windowRef` on the reading as
`{observations, startDate, endDate}` rather than leaving the normalization window
implicit, and refuses outright when the window is undeclared. `ratio-pairs.json`
carries `directionConvention` and `provenanceCaveat` per pair.

**Result:** PASSED

#### TP-01-02

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlratio`)
**Exit Code:** 0

```
  ✓ RLRATIO groupByFamily collapses same-ratioFamilyId pairs to confirmationWeight 1
Research-Lab self-test: 2464 passed, 0 failed
```

`SOXX/SPY` and `SMH/SPY` share `ratioFamilyId: semis-vs-market`. Grouping returns
2 families from 3 readings with total weight 2, not 3, and exposes
`memberPairIds` so the collapse is visible rather than silent.

**Result:** PASSED

#### TP-01-03

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlratio`)
**Exit Code:** 0

```
  ✓ RLRATIO reports unavailable with a reason on adjustment mismatch or short intersected history
Research-Lab self-test: 2464 passed, 0 failed
```

Observed `ADJUSTMENT_MISMATCH` with `points.length === 0` and
`trailingPct === null`, plus `INSUFFICIENT_HISTORY` and `NO_COMMON_DATES`.

**Result:** PASSED

#### TP-01-04

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlratio`)
**Exit Code:** 0

```
  ✓ RLRATIO reports not-comparable naming the session or FX misalignment
Research-Lab self-test: 2464 passed, 0 failed
```

Observed `SESSION_MISMATCH` and `CURRENCY_MISMATCH` with zero points, and the
aligned control returning `comparable` / `available` — so the assertion
discriminates rather than passing on any input.

**Result:** PASSED

#### TP-01-05

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlratio`)
**Exit Code:** 0

```
  ✓ RLRATIO throws typed RLRATIO_* errors, deep-freezes its export, and propagates leg caveats
Research-Lab self-test: 2464 passed, 0 failed
```

Observed `RLRATIO_SCHEMA_INVALID` at `$.rowsA`, `$.windowRef` and
`$.readings[0].ratioFamilyId`, plus `RLRATIO_DECISION_TIME_INVALID` and
`RLRATIO_CONTRACT_VERSION`. `Object.isFrozen` is true for the export, the series,
and its points array; the leg caveat survives onto `trailingChange`. The UMD
wrapper throws `RLRATIO_BROWSER_GLOBAL_UNAVAILABLE` when neither `module.exports`
nor `globalThis` exists.

**Result:** PASSED

#### TP-01-06

**Executed:** YES — ADVERSARIAL RED-bite, verified discriminating.
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlratio`)

Mutation — `confirmationWeight: 1` replaced with `family.memberPairIds.length`,
so a same-family pair would double-count. **Exit Code: 1**

```
  ✗ FAIL: RLRATIO groupByFamily collapses same-ratioFamilyId pairs to confirmationWeight 1
Research-Lab self-test: 2463 passed, 1 failed
```

Restored source. **Exit Code: 0**

```
Research-Lab self-test: 2464 passed, 0 failed
```

**Result:** PASSED — the assertion fails under the mutation and passes against the
delivered grouping, so it discriminates rather than passing by construction.

#### TP-01-07

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlratio-scale`)
**Exit Code:** 0

```
  ✓ RLRATIO ratioSeries and windowStats stay within budget and deterministic at the largest declared lookbackBars
Research-Lab self-test: 2464 passed, 0 failed
```

3000-bar legs at `lookbackBars: 252` — the largest the registry declares —
complete under the stated 2000 ms budget and produce `JSON.stringify` equality
across two runs for both the series and its window statistics.

**Result:** PASSED

#### TP-01-08

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`)
**Exit Code:** 0

```
Research-Lab self-test: 2464 passed, 0 failed
```

The count rose from 2457 by exactly the seven assertions added across the additive
`rlratio` and `rlratio-scale` groups. No pre-existing group was edited.

**Result:** PASSED

#### TP-01-09

**Executed:** NO — blocked by a scope-sequencing dependency, not deferred.

This row targets `tests/market-regime-lab.spec.mjs` against
`./market-regime-lab.html`. Neither exists:

```
$ ls -la market-regime-lab.html tests/market-regime-lab.spec.mjs
ls: cannot access 'market-regime-lab.html': No such file or directory
ls: cannot access 'tests/market-regime-lab.spec.mjs': No such file or directory
```

`./market-regime-lab.html` is SCOPE-4's deliverable
(`scopes/04-market-regime-lab-surface/`). This scope's Implementation Files table
names only `./rlratio.js` and `./ratio-pairs.json` and states that no other path
is touched, so building the page here to satisfy this row would breach the scope
boundary. The row is held open with its owner named rather than closed against a
page that does not exist.

**Result:** BLOCKED ON SCOPE-4

## Completion Statement

SCOPE-1 is **In Progress**, not Done.

Delivered and evidenced: `./rlratio.js` and `./ratio-pairs.json`, covered by seven
assertions across the `rlratio` and `rlratio-scale` groups in
`scripts/selftest.mjs`. TP-01-01 through TP-01-08 executed and passed, including
the TP-01-06 adversarial RED-bite where the named family-weight assertion was
verified to fail under its mutation and pass against the delivered grouping.

Three Definition of Done items are held open with their blockers named:

1. **TP-01-09** — requires `./market-regime-lab.html`, which is SCOPE-4's
   deliverable and outside this scope's two-file Implementation Files table.
2. **The broader E2E regression item** — its selftest half is green, but its second
   half names the feature's real-page Playwright spec, which does not yet exist.
3. **Build Quality Gate** — `traceability-guard.sh` is written against the whole
   spec directory and cannot go clean while scopes 03-14 are unbuilt.

No item above was closed by weakening a test, and no blocked item was recorded as
passing.
