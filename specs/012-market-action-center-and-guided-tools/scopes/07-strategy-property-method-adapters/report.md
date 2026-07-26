# Scope 07 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Scope 07 IN PROGRESS. Batch 1 delivered adapter 1 of 7 Scope-07 adapters: `strategy-evolution/v1`
(`strategy-self-improvement-lab`), single-sourced through the new `rlexperience-adapters/strategy-research.js`.
The seeded owner engine (`mulberry32`, `gauss`, `genSeries`, `sma`, `realizedVol`, `backtest`, `metrics`,
`walkForward`) is extracted to the module; the owner page now delegates (no inline PRNG / path / walk-forward
copy). Owner-parity, per-parameter effects under common random numbers, and the **SCN-012-002 seeded
reproducibility** scenario are proven at unit level (TP-07-01 7/7); the broad selftest is green (906 passed /
0 failed, +11 vs the Scope-06 baseline of 895). A genuine RED-bite (seed-ignore) proved the reproducibility
tests have teeth. Remaining Scope-07 adapters: `walk-forward-validation/v1` + `disclosure-decay/v1` (same
module, later batches this dispatch), then the property-research trio + the Market Action Center triage model
(later dispatches). Feature status stays `not_started`; Scope 07 stays `in_progress`.

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

<a id="tp-07-11"></a>
### TP-07-11 broad selftest

Phase: implement | Command: `node scripts/selftest.mjs` | Exit Code: 0 | Claim Source: executed

```
Research-Lab self-test: 906 passed, 0 failed
SELFTEST_EXIT=0
```

895 (Scope-06 baseline) → 906 = +11, exactly the new `strategy-self-improvement-lab.html` selftest group's
assertion count. The full selftest also re-parses the rewired owner page's inline script (via the group's
module require + page-delegation asserts) with zero regressions.

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

## Coverage Report

## Lint/Quality

## Spot-Check Recommendations

## Validation Summary

## Audit Verdict
