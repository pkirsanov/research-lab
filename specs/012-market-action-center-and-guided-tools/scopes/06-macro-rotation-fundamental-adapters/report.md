# Scope 06 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Feature 012 Scope 06 delivers eight macro/rotation/fundamental Simple adapters across two domain
modules. This dispatch delivered the FIRST macro-rotation adapter — `sector-rotation-transition/v1`
(`sector-research-lab`) — at genuine owner-parity, single-sourced from the start, and wired into the
registry loop, the source-ownership canaries, and the broad selftest.

- **Delivered + verified: 8 of 8** — `sector-rotation-transition/v1` (dispatch 1),
  `country-rotation/v1` (dispatch 2), `real-asset-driver/v1` (dispatch 3),
  `fixed-income-sleeve/v1` (dispatch 4), and `etf-ranking/v1` (dispatch 5) in `macro-rotation.js`,
  plus `ai-capex-portfolio/v1` (dispatch 6), `company-scenario-bridge/v1` (dispatch 7), and
  `msft-margin-eps/v1` (dispatch 8, this dispatch) in `fundamental-models.js`. `macro-rotation.js`
  `supportedAdapterIds` lists the five macro adapters and `fundamental-models.js` `supportedAdapterIds`
  now lists all three fundamental adapters (`ai-capex-portfolio/v1` + `company-scenario-bridge/v1` +
  `msft-margin-eps/v1`), so the registry loop drives the full delivered set of eight and no adapter
  remains absent.
- New module `rlexperience-adapters/macro-rotation.js` is the SINGLE OWNER SOURCE for the sector RRG
  normalization (`rollZ100`), the RRG quadrant (`rrgQuadrant`), the state label (`stateLabel`), the
  into/out classifier (`rotationCandidacy`), and the RRG kernel (`rrgReadout`). `sector-research-lab.html`
  now DELEGATES all four to the module and carries no inline copy (owner-parity).
- Every one of the adapter's 7 declared parameters provably moves its declared output path
  (`summary.transition` / `summary.rank` / `summary.relativeStrength` / `summary.vehicle`), and the
  declared paths are non-tautological (no raw parameter echo on the sub-path).
- Scope 05 is untouched: `rldata.js` is byte-unchanged, the Scope 05 adapter modules are unmodified,
  and a real Scope 05 breadth owner-run fingerprint is identical with and without Scope 06 sharing
  the runtime.

## Decision Record

- **Single-source-from-the-start (avoids the F-05-SS-OPTIONS class of finding).** The minimal pure owner
  primitives were extracted into `macro-rotation.js` and the page's inline copies were REMOVED and
  replaced with `RLMACROROTATION.*` delegations in the SAME change. No formula is duplicated.
- **Non-tautological declared paths.** `summary.shortLookback` / `benchmark` / weight values live at
  the summary ROOT; the declared sub-paths carry only genuine owner-derived values (RRG numbers, rank
  scores, benchmark-relative rsRatio, ETF-fit projection), so a parameter moves its path through real
  recompute, never an echo.
- **Frozen owner evidence only.** The adapter is pure compute over an already-loaded, deep-frozen owner
  snapshot; zero fetch/providerFetch/storage/LLM/publisher/store, imports no other domain adapter, and
  missing evidence (empty rs series) stays `unavailable` — never a substituted default.
- **Partial-but-real.** Scope stays `in_progress`. The remaining 7 adapters and the persistent E2E rows
  (TP-06-04..TP-06-11) land in later dispatches.

## Completion Statement

Scope 06 is NOT complete. 8 of 8 adapters are delivered and verified; the persistent per-tool E2E rows
(TP-06-04..TP-06-11) and independent `bubbles.test` verification remain. Scope `status` remains
`in_progress`; feature `status` remains `not_started`; `certifiedAt` remains null.

## Code Diff Evidence

Scope 06 files touched this dispatch (concurrent-session BUG-001/BUG-002/tool-experience-shell files
left untouched). `rldata.js` is byte-unchanged.

```text
 scripts/selftest.mjs                               |  77 ++++++--
 sector-research-lab.html                           |  40 ++--
 tests/simple-model-adapters.integration.mjs        | 201 +++++++++++++++++++++
 tests/simple-model-source-ownership.functional.mjs | 146 +++++++++++++++
 4 files changed, 424 insertions(+), 40 deletions(-)
?? tests/simple-model-adapters-macro-fundamental.unit.mjs   (new)
?? rlexperience-adapters/macro-rotation.js                  (new)
```

## Test Evidence

Phase: implement. Claim Source: executed (current session). Each block is raw `node --test` output.

<a id="tp-06-01"></a>
### TP-06-01 — Unit (`node --test tests/simple-model-adapters-macro-fundamental.unit.mjs`)

RED first (module absent) → 6 fail; GREEN after delivery → 6 pass. Exit Code: 0.

```text
ok 1 - TP-06-01 macro-rotation module exposes the delivered sector-rotation adapter with no forbidden authority
ok 2 - TP-06-01 macro-rotation owner primitives pin the single-source RRG/state/rotation formula
ok 3 - TP-06-01 sector-research-lab.html single-sources rollZ100/rrgQuadrant/stateLabel/rotationCandidacy from macro-rotation.js
ok 4 - TP-06-01 sector-rotation adapter registers through the production runtime and produces a ready owner run
ok 5 - TP-06-01 each enabled sector-rotation parameter changes its declared output path
ok 6 - TP-06-01 sector-rotation compute is deterministic for one compute identity
# tests 6
# pass 6
# fail 0
```

RED proof (before `rlexperience-adapters/macro-rotation.js` existed):

```text
not ok 1 - TP-06-01 macro-rotation module exposes the delivered sector-rotation adapter with no forbidden authority
    Cannot find module '../rlexperience-adapters/macro-rotation.js'
not ok 4 - TP-06-01 sector-rotation adapter registers through the production runtime and produces a ready owner run
    Cannot find module '../rlexperience-adapters/macro-rotation.js'
# tests 6
# pass 0
# fail 6
```

<a id="tp-06-02"></a>
### TP-06-02 — Adapter integration (`node --test --test-name-pattern="macro rotation and fundamental adapters" tests/simple-model-adapters.integration.mjs`)

Registry-derived loop over the delivered Scope-06 set (owner-parity + every declared parameter effect)
AND a real Scope-05 owner-run fingerprint proven unchanged when Scope 06 shares the runtime. Exit Code: 0.

```text
ok 1 - TP-06-02 macro rotation and fundamental adapters: registry-derived loop runs the delivered Scope-06 set at owner-parity with real parameter effects
ok 2 - TP-06-02 macro rotation and fundamental adapters: Scope 05 adapter set and a real Scope 05 owner-run fingerprint are unchanged when Scope 06 shares the runtime
# tests 2
# pass 2
# fail 0
```

Full integration file (3 Scope-05 + 2 Scope-06 tests) remains green:

```text
# tests 5
# pass 5
# fail 0
```

<a id="tp-06-03"></a>
### TP-06-03 — Source-qualified functional (`node --test --test-name-pattern="macro and fundamental source qualification" tests/simple-model-source-ownership.functional.mjs`)

Comment-stripped authority scan + live fetch/storage/xhr sentinel run + evidence-clock preservation +
no-default-substitution proof. Exit Code: 0.

```text
ok 1 - SCN-012-035 macro and fundamental source qualification: the macro-rotation module invokes no fetch, provider, storage, author, publication, or cross-domain path
ok 2 - SCN-012-035 macro and fundamental source qualification: the delivered sector-rotation adapter performs zero fetch/provider/storage at runtime
ok 3 - SCN-012-035 macro and fundamental source qualification: a sector with no relative-strength series stays unavailable — no default is substituted
# tests 3
# pass 3
# fail 0
```

Full functional file (6 Scope-05 + 3 Scope-06 tests) remains green:

```text
# tests 9
# pass 9
# fail 0
```

<a id="tp-06-12"></a>
### TP-06-12 — Broad regression selftest (`node scripts/selftest.mjs`)

Baseline before Scope 06 was 802 passed / 0 failed. After delivery it is 823 passed / 0 failed. Exit Code: 0.

```text
================================================
Research-Lab self-test: 823 passed, 0 failed
================================================
```

The pre-existing sector selftest (`sector-research-lab.html — Simple rotation action thresholds`) was
updated to inject `RLMACROROTATION` (mirroring how the Scope-05 selftests inject `RLMARKETSTRUCTURE`)
and strengthened with single-source + no-inline-copy assertions; the new Scope-06 completeness canary
drives the REAL production factory + api.

### TP-06-04..TP-06-11 — Persistent E2E (system-Chrome) — NOT RUN THIS DISPATCH

The `tests/simple-model-adapters-macro-fundamental.spec.mjs` persistent per-tool regressions land with
their adapters. Sector-rotation's TP-06-04 row is not yet executed. See Uncertainty Declarations.

## Adapter 2 of 8 — country-rotation/v1 (global-rotation-lab) — this dispatch

Phase: implement. Claim Source: executed (current session). RED-first → GREEN → selftest 0-failed →
parse-check → committed.

**Owner seam + single-source.** `global-rotation-lab.html` already carried clean pure owner seams
(`globalTrailingPct`/`globalAnnualVol`/`globalMaxDrawdown`/`globalTrendState`/`globalFxConfirm`/
`globalCountryScore`/`globalMomentumScore`/`globalRiskQuality`) that are extracted STANDALONE by two
out-of-boundary consumers I MUST NOT touch — the pre-existing `global-rotation-lab.html` selftest
canary and `scripts/brief-refresh.mjs`. Delegating any of those eight would break those standalone
extractions. The correlation/diversification owner seam `globalPairCorrelation` is extracted by
NEITHER (verified repo-wide), so it is the safe single-source target: it was moved verbatim into
`rlexperience-adapters/macro-rotation.js` and the page's inline copy was REMOVED and replaced with
`RLMACROROTATION.globalPairCorrelation`. The adapter reuses that single source for the diversification
component; the other queue inputs are FROZEN owner facts (rel21/rel63/rel126, FX score, realized
volatility, local-close age) the page already computes and hands over, so nothing else is duplicated.
`countryHorizonMomentum` is a new module helper (the queue's horizon-weighted momentum question,
distinct from the page's fixed-weight leaderboard momentum).

### TP-06-01 country — Unit (`node --test --test-name-pattern="country-rotation|globalPairCorrelation|countryHorizonMomentum|global-rotation-lab" tests/simple-model-adapters-macro-fundamental.unit.mjs`)

RED first (module absent → `E012-REGISTRY $.adapterId`, page not delegating) → 7 fail; GREEN after
delivery → 7 pass. Exit Code: 0.

```text
ok 1 - TP-06-01 macro-rotation module exposes the country-rotation adapter with single-sourced correlation + horizon momentum
ok 2 - TP-06-01 globalPairCorrelation single-source pins Pearson correlation over aligned daily returns
ok 3 - TP-06-01 countryHorizonMomentum blends the three horizon relatives under explicit weights
ok 4 - TP-06-01 global-rotation-lab.html single-sources globalPairCorrelation from macro-rotation.js
ok 5 - TP-06-01 country-rotation adapter registers through the production runtime and produces a ready owner run
ok 6 - TP-06-01 each enabled country-rotation parameter changes its declared output path
ok 7 - TP-06-01 country-rotation compute is deterministic for one compute identity
# tests 7
# pass 7
# fail 0
```

RED proof (before `country-rotation` existed in the module):

```text
not ok 5 - TP-06-01 country-rotation adapter registers through the production runtime and produces a ready owner run
    E012-REGISTRY $.adapterId
# tests 7
# pass 0
# fail 7
```

### TP-06-02 country — Adapter integration (`node --test --test-name-pattern="macro rotation and fundamental adapters" tests/simple-model-adapters.integration.mjs`)

The registry-derived loop now iterates the delivered set {sector-rotation, country-rotation}, drives
country-rotation at owner-parity (each queue entry momentum == `mr.countryHorizonMomentum(rel21,
rel63, rel126, weights)`), proves every one of its 7 declared parameters moves its declared path
(`summary.queue` for the six weight/penalty controls, `summary.freshness` for `local-close-max-age`,
read from the definition's `affectsOutputPaths`), AND proves the Scope-05 breadth owner-run
fingerprint is unchanged. Exit Code: 0.

```text
ok 1 - TP-06-02 macro rotation and fundamental adapters: registry-derived loop runs the delivered Scope-06 set at owner-parity with real parameter effects
ok 2 - TP-06-02 macro rotation and fundamental adapters: Scope 05 adapter set and a real Scope 05 owner-run fingerprint are unchanged when Scope 06 shares the runtime
# tests 2
# pass 2
# fail 0
```

Full integration file (3 Scope-05 + 2 Scope-06 tests) remains green:

```text
# tests 5
# pass 5
# fail 0
```

### TP-06-03 country — Source-qualified functional (`node --test --test-name-pattern="macro and fundamental source qualification" tests/simple-model-source-ownership.functional.mjs`)

The whole `macro-rotation.js` module (now including the country code) passes the comment-stripped
forbidden-authority scan; the country adapter runs zero fetch/storage/xhr against live sentinels,
preserves the frozen owner `asOf` evidence clock, keeps the frozen local-close age verbatim, and keeps
a no-relative-momentum country `unavailable` (excluded from the priced queue, honest `stale` freshness,
`['observed-fact','model-estimate']` provenance) — no default substitution. Exit Code: 0.

```text
ok 1 - SCN-012-035 macro and fundamental source qualification: the macro-rotation module invokes no fetch, provider, storage, author, publication, or cross-domain path
ok 2 - SCN-012-035 macro and fundamental source qualification: the delivered sector-rotation adapter performs zero fetch/provider/storage at runtime
ok 3 - SCN-012-035 macro and fundamental source qualification: a sector with no relative-strength series stays unavailable — no default is substituted
ok 4 - SCN-012-035 macro and fundamental source qualification: the delivered country-rotation adapter performs zero fetch/provider/storage and preserves the frozen local-close clock
ok 5 - SCN-012-035 macro and fundamental source qualification: a country with no relative-momentum stays unavailable — no default is substituted
# tests 5
# pass 5
# fail 0
```

Full functional file (6 Scope-05 + 5 Scope-06 tests) remains green:

```text
# tests 11
# pass 11
# fail 0
```

### TP-06-12 country — Broad regression selftest (`node scripts/selftest.mjs`)

Baseline before this dispatch was 823 passed / 0 failed (dispatch-1 sector). After country-rotation it
is 836 passed / 0 failed (+13: the new country completeness canary + strengthened Scope-06 coverage).
The pre-existing `global-rotation-lab.html` owner canary and `scripts/brief-refresh.mjs` are UNCHANGED
and green (they extract the eight page owner functions standalone — none of which were delegated).
Exit Code: 0.

```text
================================================
Research-Lab self-test: 836 passed, 0 failed
================================================
```

### Single-source-page proof + forbidden-authority + rldata zero-edit (country)

```text
page delegations (RLMACROROTATION.globalPairCorrelation)       = 3   (>=1 required; incl. load-comment)
inline correlation copies left on the page                     = 0   (former inline body removed)
EXECUTABLE_FORBIDDEN_HITS (comment-stripped macro-rotation.js)  = 0   (authoritative: TP-06-03 test 1)
rldata.js changed-file count                                    = 0   (byte-unchanged)
```

### Scope-05-fingerprints-unchanged (country dispatch)

TP-06-02 test 2 (unchanged) still registers the Scope-05 breadth adapter alone and again alongside a
Scope-06 adapter in one runtime and asserts the breadth owner-run summary fingerprint is byte-identical.
The module's Scope-05 siblings (`market-structure.js`, `options.js`) and `rldata.js` were not touched
this dispatch.

## Owner-Parity + Single-Source Evidence

### Owner-parity fingerprint (module primitives are the single source)

`rrgReadout` builds `rsRatioArr` via `rollZ100`; the standalone `rollZ100` last value equals
`rrgReadout.rsRatio` on the same canonical input — proving the kernel single-sources the primitive. The
adapter's `summary.transition.sectors[].{quad,rsRatio,rsMom}` equal `mr.rrgReadout(sector.rs.SPY, short,
long)` (asserted in TP-06-01 test 4 and TP-06-02 test 1).

```text
rrgReadout.last     = 199
rrgReadout.rsRatio  = 101.35899261431466
rrgReadout.rsMom    = 99.1541525879584
rrgReadout.quad     = W
stateLabel(quad,acc)= {"t":"Weakening ↓","c":"st-weak","early":0}
rrgQuadrant(101,99) = W
rollZ100 last (>100)= 101.358993   (== rrgReadout.rsRatio; rollZ100 is the single source)
supportedAdapterIds = ["simple-adapter/sector-rotation-transition/v1"]
```

### Single-source-page proof (page loads module + delegates + no inline dupe)

Asserted by TP-06-01 test 3 and the broad selftest sector group. The page loads
`rlexperience-adapters/macro-rotation.js`, delegates `RLMACROROTATION.rollZ100 / .rrgQuadrant /
.stateLabel / .rotationCandidacy`, and carries no inline `out[i] = sd ? 100 + (a[i] - m) / sd : 100`,
no inline `rsRatio >= 100 ? (rsMom >= 100 ? 'L' : 'W')`, and no inline `'Peaking ⚠', c: 'st-peak'`.

### Comment-stripped forbidden-authority (0 executable)

```text
EXECUTABLE_FORBIDDEN_HITS = 0
```

### rldata.js zero-edit

```text
rldata.js diff bytes = 0
rldata.js status: (unchanged)
```

### Scope-05-fingerprints-unchanged proof

TP-06-02 test 2 registers the Scope-05 breadth adapter alone and again alongside the Scope-06
sector-rotation adapter in one runtime, and asserts the breadth owner-run summary fingerprint is
byte-identical — proving Scope 06 does not perturb Scope 05. Scope-05 `supportedAdapterIds` (5 + 3 = 8)
are asserted unchanged.

## Uncertainty Declarations

- **UD-06-01 (E2E TP-06-04 not run):** The persistent system-Chrome E2E for sector-rotation was not
  executed this dispatch. Playwright 1.61.1 is installed, but the full 8-tool spec file and its per-tool
  render assertions land with the remaining adapters. The adapter's parameter-sensitivity and
  owner-parity are proven exhaustively by TP-06-01/TP-06-02 (real production runtime, zero interception).
- **UD-06-02 (6 of 8 adapters pending):** real-asset-driver, fixed-income-sleeve, etf-ranking
  (macro-rotation.js) and ai-capex-portfolio, msft-margin-eps, company-scenario-bridge
  (fundamental-models.js — file not yet created) are undelivered. `supportedAdapterIds` honestly lists
  only the two delivered adapters, so the registry loop drives only the delivered set.

## Scenario Contract Evidence

### SCN-012-035

- **"Every macro rotation and fundamental Simple adapter runs against its owning model"** — sector-rotation
  runs the real owner RRG formula single-sourced from `sector-research-lab.html` (TP-06-01, selftest).
- **"changes every enabled parameter … recomputes at least one declared owner output"** — all 7 declared
  parameters move their declared output path via the production runtime (TP-06-01 test 5, TP-06-02 test 1).
- **"observed facts … source clocks, gaps, and uncertainty remain distinct"** — evidence cutoff preserved
  from the frozen owner asOf; partial coverage surfaces `['observed-fact','model-estimate']`; an
  empty-evidence sector stays `unavailable` (TP-06-03).
- **"no adapter copies a formula, fetches a source, or substitutes missing evidence"** — comment-stripped
  authority scan 0 hits; live sentinel run 0 fetch/storage/xhr; page carries no inline formula copy.

## Coverage Report

Delivered adapter surface (`sector-rotation-transition/v1`): owner primitives, RRG kernel, summary
compute, evidence build, adapter contract, and all 7 parameter sensitivity paths are exercised by
TP-06-01 (6) + TP-06-02 (2) + TP-06-03 (3) + the broad selftest sector + completeness canaries.
Remaining 7 adapters: not yet covered (undelivered).

## Lint/Quality

- `node --check` clean on `rlexperience-adapters/macro-rotation.js`, `scripts/selftest.mjs`, and all
  edited `.mjs` test files (parse-verified after every edit).
- `git diff --check` clean (no whitespace errors) on all Scope 06 files. Exit Code: 0.
- Editor diagnostics: No errors found on the new module and all edited test files.

## Adapter 6 of 8 — ai-capex-portfolio/v1 (ai-capex-strategy-lab) — this dispatch

Phase: implement. Claim Source: executed (current session). This dispatch completed the cut-off
`ai-capex-portfolio/v1` delivery by reconciling the broad selftest to the new single source and
verifying the full green tree.

**Owner seam + single-source.** `rlexperience-adapters/fundamental-models.js` is the new SINGLE OWNER
SOURCE for the lognormal distribution/risk primitives (`erf`, `normCdf`, `invNorm`, `bandStats`,
`cvarOf`); `ai-capex-strategy-lab.html` DELEGATES all five to `RLFUNDAMENTALS.*` through thin one-line
delegators and carries no inline copy, so the Power page and the registered
`simple-adapter/ai-capex-portfolio/v1` share exactly one formula. The adapter's
beneficiary/objective/correlation-ceiling projection is adapter normalization over a FROZEN owner
snapshot (no fetch / providerFetch / storage / LLM / publisher / store; imports no other domain
adapter; missing per-horizon facts stay unpriced, never defaulted). Comment-stripped executable
forbidden-authority hits in `fundamental-models.js` = 0; `rldata.js` and `rlexperience.js` are
byte-unchanged (0 diff).

**Selftest single-source reconciliation (the cut-off item completed this dispatch).** The broad selftest
group `ai-capex-strategy-lab.html — CVaR expected shortfall` previously `extractFn`'d `invNorm`/`cvarOf`
straight out of the page; because the page now delegates to `RLFUNDAMENTALS`, the extracted code threw
`RLFUNDAMENTALS is not defined` (879 passed / 1 failed). The group was reconciled to load the module via
`createRequire` (mirroring the `RLMACROROTATION` / `RLMARKETSTRUCTURE` module-backed groups) and test
`cvarOf` against the single source, plus a single-source hook asserting the page references
`RLFUNDAMENTALS.invNorm(` / `RLFUNDAMENTALS.cvarOf(`. Every original invariant is preserved verbatim
(CVaR negativity, −100% bound, vol-monotonicity). The `shrinkage covariance` group was intentionally
left unchanged: its `alignReturns` / `ledoitWolf` are page-owned Power-only helpers the adapter never
consumes and are NOT single-sourced, so that group correctly still extracts and tests them from the
page (it was already green).

### TP-06-12 ai-capex — Broad regression selftest (`node scripts/selftest.mjs`)

Was 879 passed / 1 failed; after reconciliation it is 883 passed / 0 failed (the CVaR group's four
assertions now run and pass, −1 failure). `node --check scripts/selftest.mjs` exit 0. Exit Code: 0.

```text
================================================
Research-Lab self-test: 883 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### TP-06-01/02/03 ai-capex — delivered-set unit / integration / functional (green)

The delivered-set suites (which now include the ai-capex-portfolio adapter and the
`fundamental-models.js` comment-stripped forbidden-authority scan) are green in-session:

```text
tests/simple-model-adapters-macro-fundamental.unit.mjs   # tests 38  # pass 38  # fail 0
tests/simple-model-adapters.integration.mjs              # tests 5   # pass 5   # fail 0
tests/simple-model-source-ownership.functional.mjs       # tests 17  # pass 17  # fail 0
```

**Running total: 6 of 8.** Scope stays `in_progress`. Next required: `msft-margin-eps/v1` then
`company-scenario-bridge/v1` (both `fundamental-models.js`), then the persistent E2E rows
TP-06-04..TP-06-11.

## Adapter 7 of 8 — company-scenario-bridge/v1 (company-fundamentals-lab) — this dispatch

Phase: implement. Claim Source: executed (current session). RED-first (missing coverage) → GREEN →
unit/integration/functional/selftest 0-failed → parse-check → committed.

**Scope of this dispatch.** The `company-scenario-bridge/v1` ADAPTER, its `company-fundamentals-lab.html`
page single-source (`RLFUNDAMENTALS.projectCompanyScenario`), and the broad-selftest bounded-scenario
group were delivered by the PRIOR dispatch, which was truncated before adding the adapter's DEDICATED
TEST COVERAGE. This dispatch completes 7 of 8 by adding (a) the dedicated unit block (7 tests) and (b)
the registry-derived integration DESCRIPTOR the prior dispatch also omitted. The adapter/page/selftest
are unchanged in behavior (staged verbatim as the delivered 7/8 unit) — no adapter re-implementation and
no test weakening.

**Discovered-and-fixed (broken tree from the prior truncated dispatch).** The prior dispatch added
`simple-adapter/company-scenario-bridge/v1` to `fundamental-models.js` `supportedAdapterIds` but did
NOT add the company owner descriptor to the registry-derived integration loop, so
`tests/simple-model-adapters.integration.mjs` TP-06-02 was RED
(`descriptor present for delivered Scope-06 member company-fundamentals-lab`, 4/5). Adding the
`company-fundamentals-lab` descriptor + owner fixture (owner-parity + all 5 declared parameter effects,
identical in shape to the other six delivered members) restores the loop to green — the delivered
adapter is now covered exactly like its siblings. No test was weakened to pass.

**Owner seam + single-source (delivered prior; verified here).** `rlexperience-adapters/fundamental-models.js`
is the SINGLE OWNER SOURCE for the bounded company scenario projection (`projectCompanyScenario`), the
gap-preserving reported-base marshaller (`companyReportedBase`), the frozen-clock lineage
(`companyScenarioLineage`), and the evidence-gap ledger (`companyGapLedger`).
`company-fundamentals-lab.html` DELEGATES the projection to `RLFUNDAMENTALS.projectCompanyScenario` and
carries no inline projection copy. The adapter is pure compute over a FROZEN owner snapshot (zero
fetch / providerFetch / storage / LLM / publisher / store; imports no other domain adapter). A gapped
reported field stays honestly `null` / `unavailable` / `partial`, and a required gap either withholds
(`refuse`) or refuses the run at the evidence boundary — never a fabricated default.

### TP-06-01 company — Unit (`node --test --test-name-pattern="company" tests/simple-model-adapters-macro-fundamental.unit.mjs`)

The dedicated block adds 7 tests (file 38 → 45). RED baseline: the file carried ZERO
company-scenario-bridge coverage (38/38, all for the prior 7 adapters). GREEN after this dispatch. Exit Code: 0.

```text
ok 1 - TP-06-01 fundamental-models module exposes the company-scenario-bridge adapter with single-sourced projection + lineage + gap primitives
ok 2 - TP-06-01 projectCompanyScenario/companyScenarioLineage/companyGapLedger single-source pin the bounded scenario + gap-preservation formula
ok 3 - TP-06-01 company-fundamentals-lab.html single-sources projectCompanyScenario from fundamental-models.js
ok 4 - TP-06-01 company-scenario-bridge adapter registers through the production runtime and produces a ready owner run at parity
ok 5 - TP-06-01 each enabled company-scenario-bridge parameter changes its declared output path
ok 6 - TP-06-01 company-scenario-bridge preserves source gaps as honest partial/unavailable through the live adapter (no fabricated default)
ok 7 - TP-06-01 company-scenario-bridge compute is deterministic for one compute identity
# tests 7
# pass 7
# fail 0
```

The 7 assertions: (1) the module lists `simple-adapter/company-scenario-bridge/v1` in
`supportedAdapterIds` and exports the four single-source primitives; (2) `projectCompanyScenario`
reproduces the bounded revenue/operating-income/valuation nodes, `companyScenarioLineage` ages over the
frozen clocks (within→stale, missing-clock→unavailable), and `companyGapLedger` refuses a required gap
only under `refuse`; (3) the owner page delegates the projection and carries no inline copy; (4) the
adapter REGISTERS through the production runtime and its Simple read is owner-parity —
`summary.{scenario,lineage,gaps,reported}` deep-equal the single-source primitives run on the frozen
owner facts; (5) each of the 5 declared parameters (`accepted-state`, `growth-assumption`,
`margin-change`, `evidence-gap-policy`, `lineage-cutoff`) moves exactly its declared output path
(`summary.state` / `summary.scenario` / `summary.gaps` / `summary.lineage`), non-tautologically; (6)
GAP PRESERVATION through the live adapter — a non-required reported gap yields an honest `partial`
scenario with the gapped node `null` (no fabricated default, `unavailable` provenance class), and a
required reported gap makes the owner evidence `unavailable` so the runtime HONESTLY REFUSES the run
(`E012-SIMPLE-INPUT` / "evidence state does not permit a new run") rather than fabricating output; (7)
determinism for one compute identity.

### TP-06-02 company — Adapter integration (`node --test tests/simple-model-adapters.integration.mjs`)

The registry-derived loop now iterates the delivered set of SEVEN (sector, country, real-asset, bond,
etf, ai-capex, company) and drives company-scenario-bridge at owner-parity (`summary.scenario` ==
`fm.projectCompanyScenario(owner.reported, …)`, lineage/gaps single-sourced) and proves every one of
its 5 declared parameters moves its `affectsOutputPaths` path. Exit Code: 0.

```text
ok 4 - TP-06-02 macro rotation and fundamental adapters: registry-derived loop runs the delivered Scope-06 set at owner-parity with real parameter effects
ok 5 - TP-06-02 macro rotation and fundamental adapters: Scope 05 adapter set and a real Scope 05 owner-run fingerprint are unchanged when Scope 06 shares the runtime
# tests 5
# pass 5
# fail 0
```

### TP-06-01/02/03 company — delivered-set unit / integration / functional (green)

```text
tests/simple-model-adapters-macro-fundamental.unit.mjs   # tests 45  # pass 45  # fail 0
tests/simple-model-adapters.integration.mjs              # tests 5   # pass 5   # fail 0
tests/simple-model-source-ownership.functional.mjs       # tests 17  # pass 17  # fail 0
```

### TP-06-12 company — Broad regression selftest (`node scripts/selftest.mjs`)

Baseline before this dispatch was 883 passed / 0 failed (dispatch-6 ai-capex, after the CVaR
reconciliation). The company adapter's broad group was delivered by the prior dispatch; the full tree is
889 passed / 0 failed. `node --check` clean on both edited `.mjs` test files. Exit Code: 0.

```text
================================================
Research-Lab self-test: 889 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### Boundary + concurrent-session isolation (company)

`rldata.js` and `rlexperience.js` are byte-unchanged (0 diff). Only the two `.mjs` test files were
edited this dispatch (unit block + integration descriptor); the delivered `fundamental-models.js`,
`company-fundamentals-lab.html`, and `scripts/selftest.mjs` are the prior dispatch's uncommitted 7/8
delivery, staged together. The concurrent-session files (`msft-july-print-model.html`, `tools.json`,
`notes/msft-july-print-model.md`, BUG-001/BUG-002, `tool-experience-shell.functional.mjs`) are NOT
staged, reverted, or touched.

**Running total: 7 of 8.** Scope stays `in_progress`. Next required: `msft-margin-eps/v1`
(`fundamental-models.js`), then the persistent E2E rows TP-06-04..TP-06-11.

## Adapter 8 of 8 — msft-margin-eps/v1 (msft-july-print-model) — this dispatch

Phase: implement. Claim Source: executed (current session). RED-first (genuine failure) → GREEN →
unit + selftest 0-failed → parse-check → byte-parity → invariants clean → committed. This dispatch
delivers the FINAL adapter, completing `fundamental-models.js` at 3 of 3 and Scope 06 at 8 of 8.

**Owner seam + single-source-from-the-start.** The reported-period FY26→FY27 margin/EPS/valuation
bridge is `calculateAnnual` in `msft-july-print-model.html`. The pure reconciled bridge arithmetic
(OI26 → gross-profit walk → OI27 → OM27 → NI/EPS → implied price) was EXTRACTED into
`rlexperience-adapters/fundamental-models.js` as the SINGLE-SOURCE `msftAnnualBridge(inputs)`, and the
page's `calculateAnnual` was rewired in the SAME change to read the DOM into the decimal bridge inputs
and DELEGATE to `RLFUNDAMENTALS.msftAnnualBridge` — the inline OI27/NI/EPS formula was REMOVED, so the
bridge lives in exactly one place. The registered `simple-adapter/msft-margin-eps/v1` consumes the same
`msftAnnualBridge`, so Power and Simple share one formula. The adapter is pure compute over a FROZEN
owner snapshot (`ownerState.bridge` base facts + `depreciationBase` + `anchors`); the seven Simple
params (`depreciation-growth`, `mix-shift`, `fx-impact`, `memory-cost-impact`, `capex-phase`,
`earnings-anchor`, `valuation-multiple`) project onto the scenario bridge inputs, and every value is a
frozen owner fact or a bounded user assumption — zero fetch/providerFetch/storage/LLM/publisher/store,
no owner-state mutation, no cross-domain adapter import.

**Concurrent-session caution honored.** `msft-july-print-model.html` is a SHARED surface carrying
Feature-009/010 options-implied earnings-move brief-card + market-refresh features. This dispatch
touched ONLY the `calculateAnnual` bridge region (+ one adjacent module-load `<script>` tag); the
brief-card / refresh-button / market-refresh / valuation-read features were NOT modified, reverted, or
interfered with. The concurrent-session dirty file
(`specs/.../BUG-001-options-flow-shell-startup-starvation/scenario-manifest.json`) was NOT staged,
reverted, or touched.

### RED proof (before the module additions + page delegation existed)

`node --test --test-name-pattern="msft" tests/simple-model-adapters-macro-fundamental.unit.mjs` → 6 fail.

```text
✖ TP-06-01 fundamental-models module exposes the msft-margin-eps adapter ...  AssertionError: msft-margin-eps/v1 is a declared supported adapter (actual false)
✖ TP-06-01 msftAnnualBridge single-source pins the reported-period ...        TypeError: fm.msftAnnualBridge is not a function
✖ TP-06-01 msft-july-print-model.html single-sources the FY26->FY27 bridge ... AssertionError: msft page loads fundamental-models.js
✖ TP-06-01 msft-margin-eps adapter registers through the production runtime ...
✖ TP-06-01 each enabled msft-margin-eps parameter changes its declared ...
✖ TP-06-01 msft-margin-eps compute is deterministic for one compute identity
# tests 6  # pass 0  # fail 6
```

### TP-06-01 msft — Unit (`node --test --test-name-pattern="msft" tests/simple-model-adapters-macro-fundamental.unit.mjs`)

GREEN after delivery. The dedicated block adds 6 tests (file 45 → 51). Exit Code: 0.

```text
✔ TP-06-01 fundamental-models module exposes the msft-margin-eps adapter with the single-source margin/EPS/valuation bridge
✔ TP-06-01 msftAnnualBridge single-source pins the reported-period margin/EPS/valuation bridge formula
✔ TP-06-01 msft-july-print-model.html single-sources the FY26->FY27 bridge from fundamental-models.js
✔ TP-06-01 msft-margin-eps adapter registers through the production runtime and produces a ready owner run at parity
✔ TP-06-01 each enabled msft-margin-eps parameter changes its declared output path
✔ TP-06-01 msft-margin-eps compute is deterministic for one compute identity
ℹ tests 6  ℹ pass 6  ℹ fail 0
```

### Owner-parity byte/semantic fingerprint (PRE == POST; single-source extraction preserved output exactly)

Before the edit, an INDEPENDENT transcription of the current inline `calculateAnnual` arithmetic on the
page's `PRESETS.base` decimals produced a sha256; after the extraction, the module's `msftAnnualBridge`
on the IDENTICAL inputs produced the same sha256 — proving the single-sourced bridge is byte-identical
to the former inline formula (Power output unchanged).

```text
PRE_SHA256 =6ccefa13cc8193598d7d69c1bf3dafcae5efda3e3c8966d29dacf588d2ee588c
POST_SHA256=6ccefa13cc8193598d7d69c1bf3dafcae5efda3e3c8966d29dacf588d2ee588c
PARITY=IDENTICAL
{"revFY26":329.5,"om26":0.466,"oi":2,"tax":0.19,"sh":7.45,"pe":22,"OI26":153.547,"GP_price":14.086124999999997,"GP_vol":22.83435,"GP_fx":-3.1302499999999998,"GP_churn":3.706875,"dOpex":5.930999999999999,"dDep":22,"OI27":155.69935,"totalGrowthPct":0.12499999999999999,"RevFY27":370.6875,"OM27":0.42002859551509025,"EPS26":16.911821476510067,"EPS27":17.145835369127518,"implied":377.2083781208054}
```

The unit test ALSO proves adapter-level owner-parity: `summary.margin.om27`/`.oi27`,
`summary.eps.eps27`/`.eps26`, and `summary.valuation.impliedPrice` deep-equal
`msftAnnualBridge(computeMsftBridgeInputs(owner, base))` run directly on the frozen owner facts — not a
re-implementation. The 7 declared parameters each move their declared path (depreciation-growth /
mix-shift / memory-cost-impact / capex-phase → `summary.margin`; fx-impact / earnings-anchor →
`summary.eps`; valuation-multiple → `summary.valuation`), non-tautologically.

### Single-source-page proof + selftest reconciliation (msft)

Page single-source (asserted by unit test 3 + the new selftest group + a direct scan):

```text
has_module_load (<script src="rlexperience-adapters/fundamental-models.js">) = true
delegates_bridge (RLFUNDAMENTALS.msftAnnualBridge())                          = true
inline_bridge_formula_present (OI26 + GP_price + ... - dDep - dOpex)          = false
page inline-script syntax check: script_blocks_total=11 inline_compiled=5 syntax_errors=0  (no truncated tree)
```

Selftest reconciliation: NO pre-existing selftest group extracted+eval'd `calculateAnnual` (grep 0
matches), so no existing group needed reconciling to the module. A NEW single-source group
`msft-july-print-model.html — margin/EPS/valuation bridge` was ADDED (mirroring the ai-capex/company
`RLFUNDAMENTALS` groups): it asserts the page loads the module + delegates + carries no inline bridge,
that `msft-margin-eps/v1` is a declared supported adapter, and that `msftAnnualBridge` reproduces the
zero-growth identity (OI27 40 / OM27 0.40 / EPS27 40 / implied 400) and the depreciation+price bite.

### Comment-stripped forbidden-authority (0 executable) + protected-path zero-diff

```text
FORBIDDEN_EXECUTABLE_HITS (comment-stripped fundamental-models.js)            = 0
rldata.js / rlexperience.js / scripts/fetch-options.mjs / data/options  diff  = 0 (byte-unchanged)
```

### TP-06-12 msft — Broad regression selftest (`node scripts/selftest.mjs`)

Baseline before this dispatch was 889 passed / 0 failed (dispatch-7 company). After the msft delivery +
the new msft single-source group it is 895 passed / 0 failed (+6 = the msft group's six assertions).
`node --check scripts/selftest.mjs` exit 0. Exit Code: 0.

```text
================================================
Research-Lab self-test: 895 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### Delivered-set unit (all 8) — green

```text
tests/simple-model-adapters-macro-fundamental.unit.mjs   # tests 51  # pass 51  # fail 0
```

**Running total: 8 of 8.** `fundamental-models.js` `supportedAdapterIds` now lists
`ai-capex-portfolio/v1` + `company-scenario-bridge/v1` + `msft-margin-eps/v1`. Scope stays
`in_progress` (independent `bubbles.test` verification + DoD finalization + the persistent E2E rows
TP-06-04..TP-06-11 remain). The all-8 registry-integration (TP-06-02), source-ownership (TP-06-03),
and per-tool E2E (TP-06-04..11) rows are addressed in the follow-up within this scope.

## Spot-Check Recommendations

- Open `sector-research-lab.html` Simple view, change the tempo (RS lookback / momentum span) and the
  benchmark, and confirm the rotate-into / rotate-out verdict recomputes (the Power path now runs the
  same `RLMACROROTATION` primitives).
- Confirm `git diff rldata.js` is empty and `git diff --stat sector-research-lab.html` shows only the
  four delegation swaps.

## Validation Summary

Not authorized by this agent. Delivered adapter awaits `bubbles.validate` on scope completion.

## Audit Verdict

Not authorized by this agent.

## Independent Verification (bubbles.test)

Phase: test. Claim Source: executed (current session, HEAD `9c990e27`). Recorded implement-phase
evidence was NOT trusted; every suite below was reproduced from scratch this session with full
unfiltered output, no redirection, no `--no-verify`.

**Verdict — node-level surface GREEN and independently re-verified, but Scope 06 is NOT
finalization-ready.** The eight persistent per-tool E2E rows (TP-06-04..TP-06-11) are UNDELIVERED: the
spec file `tests/simple-model-adapters-macro-fundamental.spec.mjs` DOES NOT EXIST and was never
authored or run (consistent with UD-06-01 and `state.json execution.nextRequiredTarget`). Sibling Scope
05 ran all eight of its E2E rows (`TP-05-04..11 e2e 8/8`) IN-scope before it went `done`, so under
`full-delivery` the eight E2E rows are REQUIRED for Scope-06 `done`. Scope status therefore remains
`in_progress`; routed to `bubbles.implement` to author + run the E2E rows, after which `bubbles.test`
re-verifies TP-06-04..11 and finalizes the DoD.

<a id="iv-tp-06-01"></a>
### Re-run 1 — TP-06-01 unit (`node --test tests/simple-model-adapters-macro-fundamental.unit.mjs`) → 51/51, exit 0

```text
✔ TP-06-01 macro-rotation module exposes the delivered sector-rotation adapter with no forbidden authority (5.526199ms)
✔ TP-06-01 macro-rotation owner primitives pin the single-source RRG/state/rotation formula (1.9298ms)
✔ TP-06-01 sector-research-lab.html single-sources rollZ100/rrgQuadrant/stateLabel/rotationCandidacy from macro-rotation.js (0.6372ms)
✔ TP-06-01 sector-rotation adapter registers through the production runtime and produces a ready owner run (38.424995ms)
✔ TP-06-01 each enabled sector-rotation parameter changes its declared output path (152.33478ms)
✔ TP-06-01 country-rotation adapter registers through the production runtime and produces a ready owner run (20.083197ms)
✔ TP-06-01 real-asset-driver adapter registers through the production runtime and produces a ready owner run (13.013998ms)
✔ TP-06-01 fixed-income-sleeve adapter registers through the production runtime and produces a ready owner run at parity (20.282402ms)
✔ TP-06-01 etf-ranking adapter registers through the production runtime and produces a ready owner run at parity (14.547302ms)
✔ TP-06-01 ai-capex-portfolio adapter registers through the production runtime and produces a ready owner run (14.492402ms)
✔ TP-06-01 company-scenario-bridge adapter registers through the production runtime and produces a ready owner run at parity (12.662502ms)
✔ TP-06-01 msft-margin-eps adapter registers through the production runtime and produces a ready owner run at parity (12.161902ms)
ℹ tests 51
ℹ suites 0
ℹ pass 51
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1074.278317
UNIT_EXIT=0
```

<a id="iv-tp-06-02"></a>
### Re-run 2 — TP-06-02 integration (`node --test tests/simple-model-adapters.integration.mjs`) → 5/5, exit 0

Registry-derived loop over the delivered Scope-06 set at owner-parity + real parameter effects, plus
the Scope-05 owner-run fingerprint proven unchanged when Scope 06 shares the runtime.

```text
✔ TP-05-02 market structure and options adapters: registry-derived loop runs all eight at owner-parity with real parameter effects (350.330599ms)
✔ TP-05-02 market structure and options adapters: a missing definition removes exactly that adapter from the production registry loop (17.641797ms)
✔ TP-05-02 market structure and options adapters: adding a valid definition registers exactly that adapter through the production loop (75.512479ms)
✔ TP-06-02 macro rotation and fundamental adapters: registry-derived loop runs the delivered Scope-06 set at owner-parity with real parameter effects (382.058294ms)
✔ TP-06-02 macro rotation and fundamental adapters: Scope 05 adapter set and a real Scope 05 owner-run fingerprint are unchanged when Scope 06 shares the runtime (27.392392ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 954.456753
INTEGRATION_EXIT=0
```

<a id="iv-tp-06-03"></a>
### Re-run 3 — TP-06-03 source-ownership functional (`node --test tests/simple-model-source-ownership.functional.mjs`) → 18/18, exit 0

Both Scope-06 modules pass the comment-stripped forbidden-authority scan; every delivered adapter runs
zero fetch/provider/storage against live sentinels, preserves frozen owner clocks, and keeps
missing-evidence entries `unavailable` (no default substitution).

```text
✔ SCN-012-035 macro and fundamental source qualification: the macro-rotation module invokes no fetch, provider, storage, author, publication, or cross-domain path (1.6308ms)
✔ SCN-012-035 macro and fundamental source qualification: the fundamental-models module invokes no fetch, provider, storage, author, publication, or cross-domain path (0.9833ms)
✔ SCN-012-035 macro and fundamental source qualification: the delivered sector-rotation adapter performs zero fetch/provider/storage at runtime (38.188803ms)
✔ SCN-012-035 macro and fundamental source qualification: a sector with no relative-strength series stays unavailable — no default is substituted (21.787002ms)
✔ SCN-012-035 macro and fundamental source qualification: the delivered country-rotation adapter performs zero fetch/provider/storage and preserves the frozen local-close clock (27.243902ms)
✔ SCN-012-035 macro and fundamental source qualification: the delivered real-asset-driver adapter performs zero fetch/provider/storage and preserves the frozen owner clock (20.647902ms)
✔ SCN-012-035 macro and fundamental source qualification: the delivered fixed-income-sleeve adapter performs zero fetch/provider/storage and preserves the frozen owner clock (23.192102ms)
✔ SCN-012-035 macro and fundamental source qualification: the delivered etf-ranking adapter performs zero fetch/provider/storage and preserves the frozen owner clock (22.397401ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 393.927129
FUNCTIONAL_EXIT=0
```

<a id="iv-tp-06-12"></a>
### Re-run 4 — TP-06-12 broad selftest (`node scripts/selftest.mjs`) → 895 passed / 0 failed, exit 0

Full unfiltered 895-line per-test output was produced this session; the terminal banner is reproduced
below (the complete output stream was captured intact, no truncation).

```text
  ✓ Feature 009 refresh failure with no prior accepted quote reports refresh-failed with a null spot and never resurrects a value
================================================
Research-Lab self-test: 895 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### 8-page single-source audit (module-load + global-ref; file greps)

Every owner page loads its shared module (load ≥ 1) AND references the shared global (ref ≥ 1); no page
carries an inline formula copy (authoritatively pinned by the TP-06-01 `single-sources … from …`
assertions). No F-05-SS-OPTIONS verbatim-copy defect.

```text
PAGE                             MODULE                 load     ref
sector-research-lab.html         macro-rotation.js      1        8
global-rotation-lab.html         macro-rotation.js      1        3
real-assets-lab.html             macro-rotation.js      1        3
bond-regime-lab.html             macro-rotation.js      1        3
etf-momentum-lab.html            macro-rotation.js      2        6
ai-capex-strategy-lab.html       fundamental-models.js  2        9
company-fundamentals-lab.html    fundamental-models.js  3        4
msft-july-print-model.html       fundamental-models.js  3        3
```

### Forbidden-authority (0 executable) + supportedAdapterIds + protected-path byte-diff

Raw token grep on both modules returns only comment lines (13, 15) and a string-literal error message
(`throw new Error("..._REQUIRES_RLEXPERIENCE_API")`) — i.e. 0 EXECUTABLE forbidden-authority
(authoritative: TP-06-03 tests 1–2). `supportedAdapterIds` = 5 (macro) + 3 (fundamental) = 8. Protected
paths (`rldata.js`, `rlexperience.js`, `scripts/fetch-options.mjs`, `market-structure.js`, `options.js`,
`data/options`) are byte-unchanged vs HEAD.

```text
--- rlexperience-adapters/macro-rotation.js ---
13: * NEVER fetch, providerFetch, read local credentials, call an LLM, a public   (comment)
15: *   import another domain adapter module. Data acquisition (RLDATA cache reads) (comment)
1881:      throw new Error("RLMACROROTATION_REQUIRES_RLEXPERIENCE_API");           (string literal)
--- rlexperience-adapters/fundamental-models.js ---
13: * NEVER fetch, providerFetch, read local credentials, call an LLM, a public   (comment)
15: *   import another domain adapter module. Data acquisition (RLDATA cache reads) (comment)
1278:      throw new Error("RLFUNDAMENTALS_REQUIRES_RLEXPERIENCE_API");            (string literal)

macro-rotation.js supportedAdapterIds     = sector-rotation-transition/v1, country-rotation/v1, real-asset-driver/v1, fixed-income-sleeve/v1, etf-ranking/v1
fundamental-models.js supportedAdapterIds = ai-capex-portfolio/v1, company-scenario-bridge/v1, msft-margin-eps/v1
protected-path diff --stat HEAD           = (empty — byte-unchanged)
```

### Owner-parity RED-bite spot-check (`sleeveTotalReturn` convexity)

Pre-bite `sha256(macro-rotation.js) = c2e07d81cbf94e6b46105e790436925db884263da2708518c6edeff18fa59532`.
The convexity term was temporarily doubled (`… * combinedShock * combinedShock * 2`) via the IDE edit
tool; the single-source pin test FAILED (RED, exit 1), proving the parity assertion has teeth. The
module was then restored from HEAD (byte-identical sha256), and the same test PASSED (GREEN, exit 0).
The tree is byte-clean — no residual bite.

```text
# RED (convexity doubled)
✖ TP-06-01 sleeveTotalReturn single-source pins the owner carry+rate+spread+convexity decomposition (4.7487ms)
  AssertionError [ERR_ASSERTION]: convexity term byte-parity
  + actual - expected
  + 0.000096
  - 0.000048
      at ~/research-lab/tests/simple-model-adapters-macro-fundamental.unit.mjs:697:10
# tests 1  # pass 0  # fail 1
RED_BITE_EXIT=1

# RESTORE + GREEN
post-restore sha256 = c2e07d81cbf94e6b46105e790436925db884263da2708518c6edeff18fa59532   (== pre-bite)
diff --stat HEAD -- macro-rotation.js = (empty — byte-identical)
✔ TP-06-01 sleeveTotalReturn single-source pins the owner carry+rate+spread+convexity decomposition (4.109801ms)
# tests 1  # pass 1  # fail 0
GREEN_EXIT=0
```

### E2E gap (BLOCKING for Scope-06 `done`) — routed to bubbles.implement

- TP-06-04..TP-06-11 are eight persistent per-tool system-Chrome E2E regressions
  (`tests/simple-model-adapters-macro-fundamental.spec.mjs`), one per owner tool, each asserting a
  visible parameter, baseline/current, owner-sensitivity, provenance, uncertainty, limitation, and the
  Simple-vs-Power distinction.
- The spec file **does not exist** in `tests/` (only Scope-05's `simple-model-adapters-market.spec.mjs`
  is present) and no spec references the Scope-06 adapter regressions. The rows were never authored or
  run.
- Scope-06 DoD "Test Evidence Items — Exact Parity With 12 Test Plan Rows" therefore has 8 of 12 items
  genuinely unsatisfied; they remain `[ ]`. The "Build Quality Gate" item (which names per-tool
  RED/GREEN, exact system-Chrome identity, no-interception scan, and per-tool E2E) is likewise not fully
  satisfied and remains `[ ]`.
- **Route:** `bubbles.implement` authors + runs the eight E2E rows (mirroring the delivered Scope-05
  spec), then `bubbles.test` independently re-verifies TP-06-04..11 and finalizes the Scope-06 DoD and
  status. Scope 06 stays `in_progress`; feature `status` stays `not_started`; `certifiedAt` stays null.
