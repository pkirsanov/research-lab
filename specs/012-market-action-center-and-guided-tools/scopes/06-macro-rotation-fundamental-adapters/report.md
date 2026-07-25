# Scope 06 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Feature 012 Scope 06 delivers eight macro/rotation/fundamental Simple adapters across two domain
modules. This dispatch delivered the FIRST macro-rotation adapter — `sector-rotation-transition/v1`
(`sector-research-lab`) — at genuine owner-parity, single-sourced from the start, and wired into the
registry loop, the source-ownership canaries, and the broad selftest.

- **Delivered + verified: 2 of 8** — `sector-rotation-transition/v1` (dispatch 1) and
  `country-rotation/v1` (dispatch 2, this dispatch).
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

Scope 06 is NOT complete. 2 of 8 adapters are delivered and verified. Scope `status` remains
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
