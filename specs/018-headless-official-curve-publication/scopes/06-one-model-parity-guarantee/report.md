# Scope 6 Execution Report — One-Model Parity Guarantee

This file is the evidence surface for scope 6. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

The one-model guarantee is now checkable rather than asserted. One frozen input
set — 60 fixed rows, no clock, no network — is handed to the page's own
`computeBondLabViewModel` and to the REAL headless consumption path, and all four
compared fields come back pairwise equal:

```
curveState      Positive === Positive
curveImpulse    Mixed    === Mixed
inflationState  Heating  === Heating
durationPosture Shorten  === Shorten
```

Every assertion is an equality between two computed values; the values in the
messages are interpolated from the results, never asserted against.

The comparison is proven capable of failing: perturbing one row of the headless
input alone produces a genuine two-field disagreement (`curveState`,
`inflationState`). The two-calendar-year window is proven load-bearing. Unequal
`coverageYears` yields *Cannot be compared* with its reason — settling **D-1** and
routed item **R-3** — and an absent side is *Cannot be compared*, never *Agree*.

Suite: **1509 passed, 0 failed**. Browser gate: **38 passed**. All eight
classifiers in `bond-regime-lab.html` are byte-identical.

## Test Evidence

### TP-06-01

Scenario SCN-018-011 — one frozen input set yields pairwise-equal `curveState`,
`curveImpulse`, `inflationState` and `durationPosture` across the browser
composition and the real headless consumption path.
Command: `node scripts/selftest.mjs`

### TP-06-02

Scenario SCN-018-012 — the two-calendar-year input yields a non-`Unavailable`
impulse on a January run date while the one-year input yields `Unavailable`.
Command: `node scripts/selftest.mjs`

### TP-06-03

Scenario SCN-018-036 — perturbing one row of the headless input alone makes the
compositions disagree, proving the comparison can fail.
Command: `node scripts/selftest.mjs`

### TP-06-04

Scenario SCN-018-037 — unequal `coverageYears` yields `Cannot be compared` with
the differing-window reason, asserted to be neither `Agree` nor `Differ`.
Command: `node scripts/selftest.mjs`

### TP-06-05

Scenario SCN-018-011 — the parity group writes only under a temporary root and
leaves `data/curves/us-treasury/curve.json` byte-identical.
Command: `node scripts/selftest.mjs`

### TP-06-06

Scenario SCN-018-038 — the parity line renders exactly one of three verdicts with
its compared-field count, and an absent comparison renders `Cannot be compared`
with its reason.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### TP-06-07

Scenarios SCN-018-011, SCN-018-038 — the page still renders when the comparison
cannot run, every existing bond-tool row still passes, and a `Differ` verdict is
not dismissible.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

## Build Quality Gate Evidence

### selftest

Command: `node scripts/selftest.mjs`

### browser gate

Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### feature gate

Command: `node scripts/validate-official-curves.mjs`

### publication gate

Command: `node scripts/validate-brief-payload.mjs`

### spec-test-path guard

Command: `node scripts/validate-spec-test-paths.mjs`

### change boundary

Command: `git diff --name-only`

## Findings Raised

**TP-06-03 caught a real defect in my own fixture — which is exactly what that row
exists for.** The first version of the parity group built a temp artifact whose
`requestDescriptor.query` omitted the `type` binding. The Scope-1 gate correctly
refused it, so the headless side read `Unavailable` on all four fields — and the
perturbation assertion PASSED, because two `Unavailable` sets do differ from the
browser's real readings.

That is a vacuous pass. It would have held even if the headless path ignored its
input entirely, which is the precise failure mode this scope exists to rule out.
The fixture now derives its query type from the declared policy's own URL
template, the gate accepts it, and the perturbation produces a real model
disagreement on two named fields.

```
gate (before): ["source-id-to-query-binding-invalid at artifact.families.nominal.provenance[0].requestDescriptor.query.type — us-treasury-nominal requires type=daily_treasury_yield_curve, found none", ...]
headless (before): {"curveState":"Unavailable","curveImpulse":"Unavailable","inflationState":"Unavailable","durationPosture":"Indeterminate"}
headless (after):  {"curveState":"Inverted","curveImpulse":"Mixed","inflationState":"Mixed","durationPosture":"Shorten"}
```

**An extracted function cannot see a page-scope `var`.** `bondParityVerdict`
initially referenced a `BOND_PARITY_FIELDS` declared beside it at page scope, and
threw `BOND_PARITY_FIELDS is not defined` when the selftest extracted it through
`loadToolFunctions`. The field list now lives inside the function body. This was
observed as a failure and fixed, not anticipated as a precaution.

**The parity group needs the model's full dependency set.** Loading
`computeBondLabViewModel` alone throws `computeCreditView is not defined`; the
group now requests the same helper array `scripts/brief-refresh.mjs` declares, so
the tested composition is the shipped one rather than a partially-wired copy.

## Completion Statement

All 7 test-plan rows executed with raw output recorded above and inline against
every DoD item in `scope.md`. The selftest is 1509 passed / 0 failed, the browser
gate is 38 passed / 0 skipped, and the feature gate, publication gate and
spec-test-path guard all exit 0.

The parity group writes only under a temporary root and asserts the committed
artifact is byte-identical afterwards, so the suite never mutates published
evidence. Every classifier named on the excluded list is byte-identical.

One defect in my own test fixture was found by the very row designed to find it,
and is recorded above rather than quietly corrected.
