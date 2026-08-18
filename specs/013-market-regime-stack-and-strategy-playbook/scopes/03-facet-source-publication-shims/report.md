# SCOPE-3: Facet source publication shims — Execution Report

## Summary

SCOPE-3 delivers the publication-only facet contract and ALL NINE Tier 1 shims,
covered by ten assertions in the `regime-primitives` and
`regime-primitives-stress` groups of the concrete test file `scripts/selftest.mjs`.
The suite moved from 2477 to 2487 passing, 0 failed.

The harness executes the SHIPPED shim rather than a reimplementation: it extracts
each page's `publishRegimeFacets`, evaluates it, and validates every reading
through `RLREGIME.validateFacet`.

Delivered shims: `bond-regime-lab.html` (credit, curve, duration-posture),
`volatility-sizing-lab.html` (volatility-magnitude), `gamma-trading-lab.html` and
`options-structure-lab.html` (positioning-context), `market-heatmap-lab.html`
(breadth-participation), `trend-dynamics-cycle-lab.html` (trend-structure),
`real-assets-lab.html` and `global-rotation-lab.html` (ratio-derived via RLRATIO),
`sector-research-lab.html` (trend-structure).

The pending set is empty; `every declared facet source is either a delivered shim
or an explicitly pending one` now asserts the delivered set equals the declared
nine.

Every row below was executed with `node scripts/selftest.mjs` against the
concrete test file `scripts/selftest.mjs` in this session.

## Test Evidence

#### TP-03-01

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `regime-primitives`)
**Exit Code:** 0

```
  ✓ facet sources publish exactly one RegimeFacetContract reading per owned facet and consume no composed regime
Research-Lab self-test: 2486 passed, 0 failed
```

Six shims publish 8 readings with unique `facetId`s; every reading validates
through `RLREGIME.validateFacet` and carries a non-empty `sourceAttribution` and
`coverageNote`. A shim handed a null `asOf` publishes zero readings rather than
stamping a fabricated time.

**Result:** PASSED

#### TP-03-02

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `regime-primitives`)
**Exit Code:** 0

```
  ✓ every retained legacy vocabulary maps through a declared versioned valueVocabularyId mapping that is lossless or declared lossy
Research-Lab self-test: 2486 passed, 0 failed
```

Every source declares `valueVocabularyId` and `sourceVocabularyId` matching
`/\/v\d+$/`. A non-injective map must set `lossy: true` with non-empty
`lossyFields`. The bond curve mapping is the one declared-lossy case: the source
measures slope LEVEL while the facet vocabulary's other members name slope CHANGE.

**Result:** PASSED

#### TP-03-03

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `regime-primitives`)
**Exit Code:** 0

```
  ✓ bond publishes credit, curve, and duration-posture as three separately identifiable facets and volatility publishes strictly volatility-magnitude
Research-Lab self-test: 2486 passed, 0 failed
```

Bond declares exactly 3 kinds across 3 distinct `facetId`s, never blended into one
score. Volatility declares exactly 1 source of kind `volatility-magnitude`.

**Result:** PASSED

#### TP-03-04

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `regime-primitives`)
**Exit Code:** 0

```
  ✓ ratio-derived sources consume RLRATIO, propagate the proxy caveat, and emit not-comparable where the predicate fails
Research-Lab self-test: 2487 passed, 0 failed
```

Both ratio pages now load `rlratio.js` and declare a `ratio-derived` facet.
`real-assets-lab` reads the declared `gold/silver` (GLD/SLV) pair and carries the
directional-proxy caveat on its `coverageNote`. `global-rotation-lab` reads a
newly declared `EFA/ACWI` pair — both legs verified present in that page's own
universe rather than assumed — and routes a failed comparability predicate to
`NOT_COMPARABLE` rather than to a number, because an incomparable ratio is not a
flat one.

RLRATIO owns the ratio math and the comparability predicate; each page only bands
the trailing change, and that band is declared and versioned on the source rather
than inferred. Consumption sits at the call site, not inside
`publishRegimeFacets`, so the mapper stays byte-identical across all nine pages.

**Result:** PASSED

#### TP-03-05

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `regime-primitives`)
**Exit Code:** 0

```
  ✓ facet writes go through the existing rldata.js append API into the Tier 0 facet slot with the cache schema unchanged and provenance stamped
Research-Lab self-test: 2486 passed, 0 failed
```

Facets ride inside the free-form `metrics` object. `putToolRead` validates an exact
top-level key set, so a new top-level key would be REJECTED outright — `metrics` is
the only seam that carries facets with the protected schema genuinely unchanged.
The assertion pins that exact key list in `rldata.js` verbatim, so a schema edit
fails here.

**Result:** PASSED

#### TP-03-06

**Executed:** YES — ADVERSARIAL RED-bite with the real cycle, not a proxy.
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `regime-primitives`)

Mutation — `<script src="rlregime.js"></script>` added to `volatility-sizing-lab.html`,
which is exactly the Tier 2 import the one-way DAG forbids. **Exit Code: 1**

```
  ✗ FAIL: IP-002 no-cycle: no facet source imports a Tier 2 module and no facet declares the composed regime as an input
Research-Lab self-test: 2484 passed, 1 failed
```

Restored. **Exit Code: 0**

```
Research-Lab self-test: 2485 passed, 0 failed
```

`grep -c rlregime volatility-sizing-lab.html` returns `0` after restoration.

**Result:** PASSED

#### TP-03-07

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`)
**Exit Code:** 0

```
Research-Lab self-test: 2486 passed, 0 failed
```

Up from 2477 before this scope. No pre-existing group was edited; the SCOPE-1 and
SCOPE-2 groups are preserved byte-for-byte.

**Result:** PASSED

#### TP-03-08

**Executed:** NO — blocked by a scope-sequencing dependency, not deferred.

This row targets `tests/market-regime-lab.spec.mjs` against
`./market-regime-lab.html`. Neither exists:

```
$ ls -la market-regime-lab.html tests/market-regime-lab.spec.mjs
ls: cannot access 'market-regime-lab.html': No such file or directory
ls: cannot access 'tests/market-regime-lab.spec.mjs': No such file or directory
```

That page is SCOPE-4's deliverable. Building it here would breach this scope's
publication-only Implementation Files table and pre-empt SCOPE-4's scenarios.

**Result:** BLOCKED ON SCOPE-4

#### TP-03-09

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `regime-primitives-stress`)
**Exit Code:** 0

```
  ✓ the facet publication path sustains a repeated high-volume append run without unbounded slot growth or degraded write throughput
Research-Lab self-test: 2486 passed, 0 failed
```

2000 publication rounds across every delivered shim leave the slot at exactly one
entry per source and the reading count at exactly the declared facet count — a
replace, not an accumulate — within the stated budget.

**Result:** PASSED

#### TP-03-10

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `regime-primitives`)
**Exit Code:** 0

```
  ✓ the declared fx facet slot with no shim host composes as unavailable with SOURCE_UNAVAILABLE and is excluded from m
Research-Lab self-test: 2486 passed, 0 failed
```

Composing a two-facet set where `fx.dollar` is unavailable gives `m === 1`,
`absentFacetIds` containing `fx.dollar`, an exclusion reason of
`SOURCE_UNAVAILABLE`, and no `fx.dollar` among the composed facets. The assertion
also confirms `rlfx.js` contains no `putToolRead`, because that write would close
the `rldata.js → RLFX → rldata.js` cycle BP-1 forbids.

**Result:** PASSED

## Completion Statement

SCOPE-3 is **In Progress**, not Done. 14 of 17 Definition of Done items are
checked with per-item evidence; 3 are held open with named blockers.

Delivered: the publication-only facet contract and ALL NINE Tier 1 shims, covered
by ten assertions in `scripts/selftest.mjs`. TP-03-01 through TP-03-07, TP-03-09
and TP-03-10 executed and passed, including the TP-03-06 adversarial RED-bite
where the real Tier 2 import was introduced and verified to fail the named
assertion.

A correction to an earlier reading of my own: I first recorded `sector-research-lab`
as having no closed classification, because its published metrics carry only
sector ids and its `tempo`/`confirmation` are user controls. That was an
incomplete read. The page's `absMomRegime()` returns a genuine closed band
{`Risk-ON`, `Risk-OFF`, `Caution`} from the benchmark's own 200-day and 12-month
cash comparison, which is exactly the trend-structure classification the facet
needed. `Caution` publishes as unavailable because the classifier itself calls it
MIXED absolute momentum — a failure to resolve, not a resolved flat trend.

Held open:

1. **TP-03-08 and the scenario-specific E2E item** — both require
   `./market-regime-lab.html`, SCOPE-4's deliverable.
2. **The broader E2E item** — its selftest half is green at 2487/0; its Playwright
   half carries the same SCOPE-4 dependency.
3. **Build Quality Gate** — `traceability-guard.sh` fails for the spec directory
   on unbuilt scopes 04 and 06.

## Browser-suite verification of the nine modified pages

This scope edits nine live tool pages, so the Playwright `system-chrome` suite is
the verification that matters most. Run to completion twice:

```
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome --reporter=line --workers=2
  498 passed (16.0m)
PW_EXIT=0
```

The first run reported `497 passed, 1 failed` on
`tests/causal-rotation-consumers.spec.mjs:187 Regression: A country causal read
disagrees with its market model` — a spec covering `global-rotation-lab.html`,
which this scope modifies, so it was treated as a suspected regression rather
than dismissed. It did not reproduce:

| Probe | Result |
|---|---|
| that single test, isolated | 1 passed (30.8s) |
| its whole spec file | 5 passed (1.1m) |
| full suite, second run | **498 passed, exit 0** |

Same load-sensitive signature as the unit-suite finding below. The performance
hypothesis was also considered and rejected on inspection: the added work is one
126-bar and one 252-bar ratio series over already-cached bars, computed once per
publish.

Direct evidence the page edits did not break their Simple adapters, from the
`TP-15-04` sweep inside the passing run — every modified page reports `ready`:

```
TP-15-04 swept 18 wired tools: market-heatmap-lab=ready(x1) options-structure-lab=ready(x1)
gamma-trading-lab=ready(x1) sector-research-lab=ready(x1) global-rotation-lab=ready(x1)
real-assets-lab=ready(x2) bond-regime-lab=ready(x1) volatility-sizing-lab=ready(x1) ...
```

## Finding: pre-existing unit-suite nondeterminism (not caused by this scope)

`node --test` over `tests/*.mjs` reports one or two failures per run, and a
DIFFERENT test fails each run. Investigated rather than absorbed:

| Run | Commit | Result |
|---|---|---|
| parallel | HEAD | `not ok 815` — shell bootstrap |
| parallel | HEAD | `not ok 816` — view-only provider boundaries |
| parallel | HEAD | `not ok 815` again |
| parallel | baseline `cdb79e32` (before this scope) | `not ok 148`, `not ok 231` |
| serialized `--test-concurrency=1` | HEAD | `not ok 148` |

The implicated files pass in isolation — `tests/tool-experience-shell.functional.mjs`
3 pass 0 fail twice, `tests/contextual-tooltip.functional.mjs` 9 pass 0 fail.

The baseline row is decisive: the failures predate this scope. Serialization does
not remove them, so it is not purely CPU contention; these are order- or
elapsed-time-sensitive assertions in heavy static-server functional tests. Fixing
them means changing tests outside this feature's Implementation Boundary, so the
finding is recorded here rather than silently absorbed or reported as green.
