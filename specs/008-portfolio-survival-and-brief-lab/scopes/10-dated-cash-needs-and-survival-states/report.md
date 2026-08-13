# Scope 10 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 10 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-10-01

### TP-10-02

### TP-10-03

### TP-10-04

### TP-10-05

## Scenario Contract Evidence

### Scenario SCN-008-020

### Scenario SCN-008-021

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

## Scope 10 Execution <a id="scope-10-execution"></a>

Three refusals carry this scope. Each one is a place where a plausible-looking
number would have been easy to produce and wrong to show.

**A need is never moved.** `scheduleCashFlows` resolves each need to the first
modeled session **on or after** its stated date. A Saturday need lands on the
following Monday, never on the preceding Friday — funding a need before it is
owed would flatter the result by dodging whatever the market did in between. A
date beyond the modeled horizon is reported `out-of-horizon` rather than clamped
to the last session, because clamping silently reprices the need into a market
it never faced.

**A need is never quietly shrunk.** A withdrawal larger than available capital is
recorded as a partial fill carrying its funded fraction, with the request kept at
full size in the record. The shortfall is the finding; hiding it behind a
reduced-but-satisfied number would erase it.

**Survival is never invented.** `computeSurvival` reports a probability only when
the user supplied floor, horizon, currency and starting value, and names the
exact missing field otherwise. A default 4% rule would look like an answer while
being nobody's actual plan.

**A limitation stated rather than implied.** Modeled sessions are business days
projected forward from the last observation. Exchange holidays are not modeled,
and the on-screen calendar note says so. Projecting a calendar the tool does not
hold, silently, would let a reader believe a need landed on a real trading day.

### TP-10-01 <a id="tp-10-01"></a>

**Command:** `node --test tests/portfolio-analytics.unit.mjs`

**Exit Code:** 0

**Output:**

```text
$ node --test tests/portfolio-analytics.unit.mjs
# pass 48
# fail 0
```

Nine Scope 10 rows in `tests/portfolio-analytics.unit.mjs` cover exact-key flow
validation, weekend and exact-date landing, out-of-horizon reporting, total
ordering, collision capital, partial fills, currency refusal, the complete
survival-definition requirement, and mid-path breach detection.

The collision arithmetic is calculated independently in the test rather than read
back from the engine: on the path `[1000, 950, 900, 800, …, 1100]` an end-of-step
withdrawal of 200 at session 3 leaves exactly 600, and 600 compounding 800 → 1100
gives exactly 825. The test also asserts the terminal is **below** the
no-withdrawal terminal minus the withdrawal, which is the sequence-risk claim
itself rather than a proxy for it.

The survival row is deliberately adversarial about *where* a breach occurs: one
fixture path dips to 700 and recovers to 1200. A terminal-only implementation
would score it a success. The test requires it counted as a failure.

**Non-vacuity, proven twice.**

Shifting every need one session forward:

```text
not ok 41 - TP-10-01 a need lands on the first modeled session on or after its date and is never moved
not ok 43 - TP-10-01 a withdrawal during a drawdown records collision capital and sequence effect
not ok 44 - TP-10-01 the same need at a different date changes the outcome, proving timing is honoured
# pass 45
# fail 3
```

Smuggling in a default floor of 4% of starting value:

```text
not ok 47 - TP-10-01 survival is unavailable with a reason when the definition is incomplete
# pass 47
# fail 1
```

Both breaks were reverted and both returned to `# pass 48 # fail 0` under the
same command.

### TP-10-02 <a id="scenario-scn-008-020"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-020 dated cash need records before and after collision capital" --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-paths.spec.mjs:262:1 › Regression: SCN-008-020 dated cash need records before and after collision capital (1.4s)

  1 passed (3.8s)
```

The row reads the modeled date **out of the rendered timeline** and asserts it is
lexically on or after the stated date, so a surface that pulled a need earlier
fails here regardless of what the engine did. Capital before, applied-of-
requested, capital after, and funded percentage are each asserted as separate
rendered figures — not one opaque "impact" number that could hide which part
moved.

### TP-10-03 <a id="scenario-scn-008-021"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-021 missing survival definition renders distributions without probability" --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-paths.spec.mjs:302:1 › Regression: SCN-008-021 missing survival definition renders distributions without probability (1.3s)

  1 passed (3.8s)
```

The row proves both halves of the scenario: the wealth and drawdown
distributions stay fully rendered, **and** the survival band refuses while naming
`floorValue`. It then scans the whole survival band for a leaked percentage or a
`4%`/`0.04` literal, so a default smuggled in as display-only copy would still
fail. Supplying the floor — and only that — flips the band to `ok`.

**Non-vacuity.** Substituting `r.startingValue * 0.04` for the absent floor turned
this row RED and left the other eight GREEN:

```text
  ✘  7 [system-chrome] › Regression: SCN-008-021 missing survival definition renders distributions without probability (6.4s)
    Error: expect(locator).toHaveAttribute(expected) failed
  1 failed
  8 passed (20.6s)
```

Reverted, back to GREEN.

### TP-10-04 <a id="tp-10-04"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity" --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-paths.spec.mjs:338:1 › Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity (1.9s)

  1 passed (4.6s)
```

Needs are entered **out of chronological order on purpose** — the later one
first — so a timeline that merely echoed entry order would fail. The row also
asserts each timeline row is a unique link target, that the fan canvas stays
painted above 200 coloured pixels at both 1440×1000 and 390×844 with the
timeline present, and that there is no body overflow at either geometry or at
130% text.

A fifth row, `Regression: Feature 008 an incomplete cash need is refused rather
than partly assumed`, covers the entry-side refusal: an amount with no date and
no label produces the three-field refusal, zero timeline rows, and
`cashNeedCount: 0` — no need is part-created from today's date or an empty label.

### TP-10-05 <a id="tp-10-05"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 9 tests using 1 worker

  ✓  1 [system-chrome] › Regression: SCN-008-018 identical stationary bootstrap specification reproduces paths (1.7s)
  ✓  2 [system-chrome] › Regression: SCN-008-019 parameter uncertainty is separate from path randomness (824ms)
  ✓  3 [system-chrome] › Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear (1.7s)
  ✓  4 [system-chrome] › Regression: Feature 008 dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom (1.3s)
  ✓  5 [system-chrome] › Regression: Feature 008 Path Lab refuses rather than generating a path without evidence (670ms)
  ✓  6 [system-chrome] › Regression: SCN-008-020 dated cash need records before and after collision capital (977ms)
  ✓  7 [system-chrome] › Regression: SCN-008-021 missing survival definition renders distributions without probability (839ms)
  ✓  8 [system-chrome] › Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity (1.2s)
  ✓  9 [system-chrome] › Regression: Feature 008 an incomplete cash need is refused rather than partly assumed (906ms)

  9 passed (13.4s)
```

## Scope-Local Traceability <a id="scope-10-traceability"></a>

**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

**Exit Code:** 1

**Output:**

```text
✅ scopes/10-dated-cash-needs-and-survival-states/scope.md scenario mapped to Test Plan row: SCN-008-020 - A dated cash need lands during an early drawdown
✅ scopes/10-dated-cash-needs-and-survival-states/scope.md scenario maps to concrete test file: tests/portfolio-analytics.unit.mjs
✅ scopes/10-dated-cash-needs-and-survival-states/scope.md scenario mapped to Test Plan row: SCN-008-021 - The user runs paths without a floor or goal horizon
✅ scopes/10-dated-cash-needs-and-survival-states/scope.md scenario maps to DoD item: SCN-008-020 - A dated cash need lands during an early drawdown
✅ scopes/10-dated-cash-needs-and-survival-states/scope.md scenario maps to DoD item: SCN-008-021 - The user runs paths without a floor or goal horizon
RESULT: FAILED (15 failures, 0 warnings)
```

The gate for this scope is "zero failure naming this scope's own files"; the
whole-feature `--all-scopes` run is deferred to Scope 16 by the Feature
Completion Gate. All 15 remaining failures name test files belonging to scopes
10-16 that have not been built yet (`portfolio-survival-diversification.spec.mjs`,
`portfolio-survival-allocation.spec.mjs`, `portfolio-survival-mobile.spec.mjs`,
`portfolio-allocation.functional.mjs`).

An earlier run of this same command reported **17** failures, the extra two being
`report is missing evidence reference for concrete test file:
tests/portfolio-analytics.unit.mjs` against this scope. That was correct: the
report had no Scope 10 evidence yet. Writing this section resolved both. The
guard caught a real omission rather than a formatting quibble.

## Final Scope 10 Baseline <a id="scope-10-baseline"></a>

**Command:** `node scripts/selftest.mjs` and the node and browser suites

**Exit Code:** 0

**Output:**

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 1640 passed, 0 failed
$ node --test tests/portfolio-analytics.unit.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-brief.functional.mjs tests/portfolio-publisher-boundary.functional.mjs
# pass 146
# fail 0
$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome
  46 passed (51.8s)
$ git diff --check
(clean)
```
