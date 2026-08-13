# Scope 09 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 09 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-09-01

### TP-09-02

### TP-09-03

### TP-09-04

### TP-09-05

## Scenario Contract Evidence

### Scenario SCN-008-018

### Scenario SCN-008-019

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

## TP-09-01 through TP-09-05 — 2026-08-13 (PARTIAL SCOPE DELIVERY)

**Status: PARTIAL. TP-09-01 through TP-09-05 are delivered and green. TP-09-06 is BLOCKED on a
Change Boundary contradiction recorded below.** The scope stays `Not Started` and is not promoted.

**Command:** `node --test tests/portfolio-analytics.unit.mjs`
**Exit Code:** 0
**Output:**

```text
$ node --test tests/portfolio-analytics.unit.mjs
# tests 38
# pass 38
# fail 0
```

**Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Output:**

```text
Running 4 tests using 1 worker
  ✓  SCN-008-018 an identical specification reproduces an identical scenario identity (2.2s)
  ✓  SCN-008-019 path randomness and parameter uncertainty stay separately labelled (1.2s)
  ✓  Feature 008 Path Lab table stays equivalent and stable at desktop mobile and zoom (1.1s)
  ✓  Feature 008 Path Lab refuses rather than generating a path without evidence (890ms)
  4 passed (10.5s)
```

### What was built

`mulberry32`, stationary-bootstrap index generation, a deterministic stratified parameter grid,
`ScenarioSpecification/v1` exact-key validation, scenario identity, and `runScenario` in
`rlportfolioanalytics.js`; the Path Lab surface on the `path-lab` route. Every budget reads from the
existing `calibration` config block — no new config keys were required.

### Five refusals carry the scope

**Determinism is structural, not conventional.** `Math.random` and any ambient clock are absent from
the module, and a source scan enforces it. A path result that cannot be reproduced from its recorded
identity is not evidence about a portfolio; it is one sample nobody can check.

**Blocks wrap cyclically.** Truncating at the end of the sample instead would quietly under-sample
the tail of the history and bias every path toward the early record. Asserted behaviourally rather
than by inspection: over 50% consecutive continuation, plus a proven `9 -> 0` wrap.

**Three distributions stay separate.** Path randomness at the central assumption, across-parameter
dispersion of the median, and the combined distribution are three labelled results. A single blended
band lets a reader mistake assumption risk for market risk. A browser row asserts the rendered
randomness and combined figures actually differ, so showing one band twice would fail.

**Common random streams are drawn once and reused at every parameter node**, so a node-to-node
difference is attributable to the parameter rather than to resampling noise.

**IID is a declared simplification**, labelled as discarding the serial dependence that produces
clustered drawdowns — never offered as an equal alternative.

The scenario contract is exact-key: a field the engine ignores would let two different-looking
scenarios collide on one identity, which is the silent collision the identity exists to prevent.

### A vacuity I caught in my own guard

The determinism scan initially matched this module's own comment prose explaining the prohibition,
failing on the documentation rather than on any executable call. Fixed by stripping comments first,
then proven still live by injecting a real `Math.random` call into `iidIndices` — 38/0 became 37/1 —
and restoring. A guard that only ever reads its own explanation proves nothing.

### Non-vacuity (RED / GREEN, same command)

Making the seed non-reproducible by adding `performance.now()`:

```text
=== RED: seed made non-reproducible ===
  ✘  SCN-008-018 an identical specification reproduces an identical scenario identity (1.6s)
  ✓  SCN-008-019 ...
  1 failed  3 passed
```

Restored: `4 passed (10.5s)`.

### Repo baseline

```text
$ node --test tests/portfolio-analytics.unit.mjs
# pass 38  # fail 0
$ node --test tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-brief.functional.mjs tests/portfolio-publisher-boundary.functional.mjs
# pass 98  # fail 0
$ node scripts/selftest.mjs
1640 passed, 0 failed
$ npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome
  41 passed (59.4s)
$ git diff --check
(clean)
```

### Routed finding F-09-PERSISTENCE-BOUNDARY — TP-09-06 is blocked

**TP-09-06 requires a persisted scenario.** SCN-008-038 carries Scope 03's discharged `scenarios`
conjunct, and the scope text states plainly that "Scope 09 is the first scope that persists a
scenario, so it is the first that can assert this without vacuity."

**The Change Boundary forbids the file that owns persistence.** It excludes "private storage/brief
behavior except read-only inputs" and does not list `rlportfolio.js`. The workspace schema
(`createEmptyWorkspace`) has no `scenarios` field, and the full-personal clear is **key-list** based
(`FOUNDATION_LOCAL_KEYS`), not prefix based.

**Why I did not work around it.** Writing a scenarios key from the page alone — which the boundary
does permit — would produce a personal artifact that **survives a full-personal clear**, because the
clear only removes keys on its declared list. That is precisely the privacy failure SCN-008-038
exists to detect. Shipping it would have satisfied "a scenario is persisted" while creating the
defect the test is meant to catch.

This is the same shape as `F-08-CONFIG-BOUNDARY`, resolved in Scope 08: the boundary was written
before the contradiction was visible. The resolution is a boundary amendment permitting the
`scenarios` additions to the workspace schema, the clear key list, and the privacy inventory —
authored as a deliberate change with its own tests, not smuggled in through the page.

**Nothing is claimed for TP-09-06.** No scenario is persisted, so the Path Lab currently recomputes
its scenario on each render and stores nothing personal. That state is honest and privacy-safe; it is
simply not the state the scope asks for.

### Not delivered in this pass

- **TP-09-06** discharged clear conjunct (blocked, above).
- The path fan canvas with `RLCHART` structured attach. The Path Lab renders its distributions as
  labelled rows and an equivalent table; no fan is drawn, so no canvas parity is claimed.
- Progress, cancel, and compute-token staleness handling. The current scenario is small enough to run
  synchronously; the production 2000 x 21 grid is not attempted in the tab.
- Regime and fat-tail methods remain explicitly unavailable, as the implementation plan requires.
