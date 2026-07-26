# Scope 07 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Scope 07 IN PROGRESS. **2 of 7** Scope-07 adapters delivered, both single-sourced through
`rlexperience-adapters/strategy-research.js`.

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

The broad selftest is green (**912 passed / 0 failed**, +6 vs the batch-1 baseline of 906 — exactly the
reconciled `smart-money-flow-lab.html` selftest group's net assertion delta). Remaining Scope-07 adapters:
`walk-forward-validation/v1` (same module, this dispatch if solid), then the property-research trio + the
Market Action Center triage model (later dispatches). Feature status stays `not_started`; Scope 07 stays
`in_progress`.

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

<a id="tp-07-11"></a>
### TP-07-11 broad selftest

Phase: implement | Command: `node scripts/selftest.mjs` | Exit Code: 0 | Claim Source: executed

```
Research-Lab self-test: 912 passed, 0 failed
SELFTEST_EXIT=0
```

- Batch 1: 895 (Scope-06 baseline) → 906 = +11, exactly the new `strategy-self-improvement-lab.html` selftest
  group's assertion count.
- Batch 2: 906 → **912 = +6**, exactly the reconciled `smart-money-flow-lab.html` selftest group's net delta
  (the old `extractFn`-based group was replaced IN LOCKSTEP with a module-require group that asserts the owner
  primitives + a disclosure-decay determinism/effect canary + page delegation + no-inline-copy). Zero regressions
  in any other group; the full selftest re-parses both rewired owner pages' inline scripts with 0 failures.

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
