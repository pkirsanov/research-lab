<!-- markdownlint-disable MD010 -->

# Report: 003 Bond Regime and Fixed-Income Scenario Lab

**Related artifacts:** [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

## Planning Baseline

This report is the execution-evidence destination for the five sequential scopes in [scopes.md](scopes.md). `bubbles.plan` reconciled the plan and authored the contracts; it did not implement or certify product behavior. Delivery agents append current, unfiltered command output under the matching evidence identifiers. Planned commands, test names, and expected outcomes are contracts, not proof.

## Summary

- Feature intent: separate credit appetite, duration, curve, inflation, and liquidity evidence, then compare seven generic bond sleeves under transparent rate, spread, inflation, carry, duration, and convexity assumptions.
- Scope order: pure credit foundation -> curve/inflation/duration foundation -> scenario foundation -> cache-first official/manual/unavailable adapters -> one-model Simple/Power delivery and integration.
- Scenario coverage: all 14 business scenarios from `spec.md` have stable `SCN-003-001` through `SCN-003-014` contracts and exact persistent browser-test titles.
- Change boundary: only the exact product, test, registry, glossary, notes, and planning paths named in `scopes.md` may change; unrelated dirty work remains untouched.
- Delivery status: Scopes 1-4 are Done. Scope 5 remains Blocked because the current `market-brief.payload.json::toolCoverage` omits the registered `bond-regime-lab` id; current-session S5-T13 therefore reports 342 passed and 1 failed. Certification remains untouched.

## Completion Statement

Implementation is nonterminal. The implementation-owned Bond Regime product, test, registry, notes, source-rights, and visual surfaces remain delivered, but Scope 5 cannot be marked Done while the current docs-owned Market Brief payload omits `bond-regime-lab` and the exact repository baseline is nonzero. This report records implementation evidence only and makes no validation, audit, or certification claim.

### Code Diff Evidence

**Phase:** implement
**Claim Source:** executed
**Command:** `git diff --check -- bond-regime-lab.html bond-regime-universe.json notes/bond-regime-lab.md tests/bond-regime-lab.spec.mjs tests/fixtures/bond-regime scripts/selftest.mjs scripts/fetch-bars.mjs rlg.js tools.json index.html rlnav.js README.md notes/README.md specs/003-bond-regime-and-scenario-lab && git status --short --untracked-files=all -- bond-regime-lab.html bond-regime-universe.json notes/bond-regime-lab.md tests/bond-regime-lab.spec.mjs tests/fixtures/bond-regime scripts/selftest.mjs scripts/fetch-bars.mjs rlg.js tools.json index.html rlnav.js README.md notes/README.md specs/003-bond-regime-and-scenario-lab`
**Exit Code:** 0
**Output:** `git diff --check` emitted no lines; the following full path-scoped status inventory was emitted:

```text
 M README.md
 M index.html
 M notes/README.md
 M rlg.js
 M rlnav.js
 M scripts/fetch-bars.mjs
 M scripts/selftest.mjs
 M tools.json
?? bond-regime-lab.html
?? bond-regime-universe.json
?? notes/bond-regime-lab.md
?? specs/003-bond-regime-and-scenario-lab/design.md
?? specs/003-bond-regime-and-scenario-lab/report.md
?? specs/003-bond-regime-and-scenario-lab/scenario-manifest.json
?? specs/003-bond-regime-and-scenario-lab/scopes.md
?? specs/003-bond-regime-and-scenario-lab/spec.md
?? specs/003-bond-regime-and-scenario-lab/state.json
?? specs/003-bond-regime-and-scenario-lab/test-plan.json
?? specs/003-bond-regime-and-scenario-lab/uservalidation.md
?? tests/bond-regime-lab.spec.mjs
?? tests/fixtures/bond-regime/metadata.json
?? tests/fixtures/bond-regime/nominal-missing-maturity.csv
?? tests/fixtures/bond-regime/nominal-valid.csv
?? tests/fixtures/bond-regime/real-valid.csv
```

**Result:** PASS. The exact S5-T15 path-scoped diff check is clean, the expected owned/shared paths remain visible, and no unrelated dirty path was modified by this run.

Implementation-owned product/test paths created or updated:

- `bond-regime-lab.html`
- `bond-regime-universe.json`
- `notes/bond-regime-lab.md`
- `tests/fixtures/bond-regime/**`
- additive hunks in `scripts/selftest.mjs`, `scripts/fetch-bars.mjs`, `rlg.js`, `tools.json`, `index.html`, `rlnav.js`, `README.md`, and `notes/README.md`

Execution-progress/evidence paths updated:

- `specs/003-bond-regime-and-scenario-lab/scopes.md`
- `specs/003-bond-regime-and-scenario-lab/report.md`
- `specs/003-bond-regime-and-scenario-lab/uservalidation.md`
- `specs/003-bond-regime-and-scenario-lab/scenario-manifest.json`
- `specs/003-bond-regime-and-scenario-lab/test-plan.json`
- permitted execution metadata in `specs/003-bond-regime-and-scenario-lab/state.json`

No excluded Market Brief payload/model path, shared `rldata.js`/`rlchart.js`/`rlapp.js`/`rlticker.js` behavior, certification field, or unrelated dirty path was modified by this implementation.

## Test Evidence

No product test command was executed as product-delivery proof by `bubbles.plan`. The exact planned commands, paths, titles, categories, and live-system requirements are synchronized between [scopes.md](scopes.md) and [test-plan.json](test-plan.json). Delivery evidence must record the actual command, full output, actual exit code, and `Claim Source` for each identifier.

### Planned Evidence Index

#### Scope 1 Evidence Destinations

##### S1-T01

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
bond-regime-lab.html — credit evidence foundation
 ✓ Bond Regime: common-date ratio alignment excludes unmatched legs
 ✓ Bond Regime: latest ratio date is the newest exact common UTC date
 ✓ Bond Regime: adjustment mismatch fails instead of mixing return definitions
 ✓ Bond Regime: aligned ratio rows stay finite
 ✓ Bond Regime: duration confound blocks ratio-only constructive credit
 ✓ Bond Regime: duration-driven strengthening with no independent improvement remains Mixed
 ✓ Bond Regime: aligned breadth plus current independent confirmation is constructive
 ✓ Bond Regime: spread level and momentum remain independent
 ✓ Bond Regime: one current independent family satisfies only one confirmation key
 ✓ Bond Regime: complete configuration validates
 ✓ Bond Regime: configuration rejects unknown nonfinite credential and stale-contract shapes
 ✓ Bond Regime: numeric boundary helpers are finite and unit safe
 ✓ Bond Regime: decision digest is stable across object key order
```

**Result:** PASS

##### S1-T02

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
bond-regime-lab.html — credit evidence foundation
 ✓ Bond Regime: duration confound blocks ratio-only constructive credit
 ✓ Bond Regime: duration-driven strengthening with no independent improvement remains Mixed
 ✓ Bond Regime: aligned breadth plus current independent confirmation is constructive
 ✓ Bond Regime: spread level and momentum remain independent
 ✓ Bond Regime: one current independent family satisfies only one confirmation key
 ✓ Bond Regime: complete configuration validates
 ✓ Bond Regime: configuration rejects unknown nonfinite credential and stale-contract shapes
 ✓ Bond Regime: numeric boundary helpers are finite and unit safe
 ✓ Bond Regime: decision digest is stable across object key order
Research-Lab self-test: 289 passed, 0 failed
```

**Result:** PASS

##### S1-T03

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
bond-regime-lab.html — credit evidence foundation
 ✓ Bond Regime: latest ratio date is the newest exact common UTC date
 ✓ Bond Regime: adjustment mismatch fails instead of mixing return definitions
 ✓ Bond Regime: aligned ratio rows stay finite
 ✓ Bond Regime: duration confound blocks ratio-only constructive credit
 ✓ Bond Regime: duration-driven strengthening with no independent improvement remains Mixed
 ✓ Bond Regime: aligned breadth plus current independent confirmation is constructive
 ✓ Bond Regime: spread level and momentum remain independent
 ✓ Bond Regime: one current independent family satisfies only one confirmation key
 ✓ Bond Regime: complete configuration validates
 ✓ Bond Regime: decision digest is stable across object key order
```

**Result:** PASS

##### S1-T04

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
bond-regime-lab.html — credit evidence foundation
 ✓ Bond Regime: common-date ratio alignment excludes unmatched legs
 ✓ Bond Regime: aligned ratio rows stay finite
 ✓ Bond Regime: duration confound blocks ratio-only constructive credit
 ✓ Bond Regime: duration-driven strengthening with no independent improvement remains Mixed
 ✓ Bond Regime: aligned breadth plus current independent confirmation is constructive
 ✓ Bond Regime: spread level and momentum remain independent
 ✓ Bond Regime: one current independent family satisfies only one confirmation key
 ✓ Bond Regime: complete configuration validates
 ✓ Bond Regime: configuration rejects unknown nonfinite credential and stale-contract shapes
 ✓ Bond Regime: numeric boundary helpers are finite and unit safe
```

**Result:** PASS

##### S1-T05

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
bond-regime-lab.html — credit evidence foundation
 ✓ Bond Regime: common-date ratio alignment excludes unmatched legs
 ✓ Bond Regime: adjustment mismatch fails instead of mixing return definitions
 ✓ Bond Regime: duration confound blocks ratio-only constructive credit
 ✓ Bond Regime: aligned breadth plus current independent confirmation is constructive
 ✓ Bond Regime: spread level and momentum remain independent
 ✓ Bond Regime: complete configuration validates
 ✓ Bond Regime: configuration rejects unknown nonfinite credential and stale-contract shapes
 ✓ Bond Regime: numeric boundary helpers are finite and unit safe
 ✓ Bond Regime: decision digest is stable across object key order
Research-Lab self-test: 289 passed, 0 failed
```

**Result:** PASS

##### S1-T06

**Phase:** implement
**Claim Source:** executed
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --grep "BS-001 duration-driven ratio improvement stays mixed" --reporter=list`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE1_BROWSER_BEGIN
TITLE=BS-001 duration-driven ratio improvement stays mixed
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
FIXTURE_BOUNDARY=observed-snapshot
Running 1 test using 1 worker
 ✓  1 tests/bond-regime-lab.spec.mjs › BS-001 duration-driven ratio improvement stays mixed (691ms)
 1 passed (2.6s)
EXIT=0
BOND_SCOPE1_BROWSER_END
```

**Result:** PASS

##### S1-T07

**Phase:** implement
**Claim Source:** executed
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --grep "BS-002 aligned ratios plus OAS confirmation are constructive" --reporter=list`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE1_BROWSER_BEGIN
TITLE=BS-002 aligned ratios plus OAS confirmation are constructive
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
FIXTURE_BOUNDARY=observed-snapshot
Running 1 test using 1 worker
 ✓  1 tests/bond-regime-lab.spec.mjs › BS-002 aligned ratios plus OAS confirmation are constructive (455ms)
 1 passed (1.6s)
EXIT=0
BOND_SCOPE1_BROWSER_END
```

**Result:** PASS

##### S1-T08

**Phase:** implement
**Claim Source:** executed
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --grep "BS-003 tight but widening keeps level and momentum separate" --reporter=list`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE1_BROWSER_BEGIN
TITLE=BS-003 tight but widening keeps level and momentum separate
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
FIXTURE_BOUNDARY=observed-snapshot
Running 1 test using 1 worker
 ✓  1 tests/bond-regime-lab.spec.mjs › BS-003 tight but widening keeps level and momentum separate (341ms)
 1 passed (1.1s)
EXIT=0
BOND_SCOPE1_BROWSER_END
```

**Result:** PASS

##### S1-T09

**Phase:** implement
**Claim Source:** executed
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --grep "BS-010 latest common date excludes unmatched leg" --reporter=list`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE1_BROWSER_BEGIN
TITLE=BS-010 latest common date excludes unmatched leg
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
FIXTURE_BOUNDARY=observed-snapshot
Running 1 test using 1 worker
 ✓  1 tests/bond-regime-lab.spec.mjs › BS-010 latest common date excludes unmatched leg (362ms)
 1 passed (1.3s)
EXIT=0
BOND_SCOPE1_BROWSER_END
```

**Result:** PASS

##### S1-T10

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
bond-regime-lab.html — credit evidence foundation
 ✓ Bond Regime: common-date ratio alignment excludes unmatched legs
 ✓ Bond Regime: latest ratio date is the newest exact common UTC date
 ✓ Bond Regime: adjustment mismatch fails instead of mixing return definitions
 ✓ Bond Regime: aligned ratio rows stay finite
 ✓ Bond Regime: duration confound blocks ratio-only constructive credit
 ✓ Bond Regime: duration-driven strengthening with no independent improvement remains Mixed
 ✓ Bond Regime: aligned breadth plus current independent confirmation is constructive
 ✓ Bond Regime: spread level and momentum remain independent
 ✓ Bond Regime: one current independent family satisfies only one confirmation key
 ✓ Bond Regime: complete configuration validates
 ✓ Bond Regime: configuration rejects unknown nonfinite credential and stale-contract shapes
 ✓ Bond Regime: numeric boundary helpers are finite and unit safe
 ✓ Bond Regime: decision digest is stable across object key order
================================================
Research-Lab self-test: 289 passed, 0 failed
================================================
```

**Result:** PASS

##### S1-T11

**Phase:** implement
**Claim Source:** executed
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --reporter=list`
**Exit Code:** 0
**Output:**

```text
Running 4 tests using 1 worker

 ✓  1 tests/bond-regime-lab.spec.mjs › BS-001 duration-driven ratio improvement stays mixed (2.6s)
 ✓  2 tests/bond-regime-lab.spec.mjs › BS-002 aligned ratios plus OAS confirmation are constructive (235ms)
 ✓  3 tests/bond-regime-lab.spec.mjs › BS-003 tight but widening keeps level and momentum separate (195ms)
 ✓  4 tests/bond-regime-lab.spec.mjs › BS-010 latest common date excludes unmatched leg (322ms)

 4 passed (12.5s)
Browser: installed system Google Chrome
Server: ephemeral same-origin HTTP
Test runtime: committed tests/playwright-runtime.mjs
Skipped tests: 0
```

**Result:** PASS

##### Scope 1 Build Quality

**Phase:** implement
**Claim Source:** executed
**Commands:** page syntax/ID assertion; structural source-rights scan; `git diff --check`; artifact lint; editor diagnostics
**Exit Code:** 0
**Output:**

```text
PASS inline scripts compile=1
PASS referenced DOM ids=16
PASS missing DOM ids=0
PASS skip link targets main
PASS tablist semantics present
PASS status live region present
PASS table headers have scope
PASS states use visible text
PASS mobile decision stack declared
PASS reduced-motion rule declared
PASS config credential-shaped keys=0
PASS restricted live observation URLs=0
PASS browser credential inputs=0
PASS OAS persistence=memory-only
PASS conditions persistence=memory-only
Artifact lint PASSED.
No errors found in the four changed product/test files.
```

**Result:** PASS

##### Scope 1 Command-Surface Finding

**Phase:** implement
**Claim Source:** executed
**Planned command:** `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --reporter=list`
**Exit Code:** 1 before test discovery
**Observed output:** `npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]`
**Disposition:** The repository has no local package manifest or lockfile. No dependency was installed and no planning artifact was rewritten. The committed suite was executed through the already-cached Playwright CLI and system Chrome, with 4/4 passing. The literal launcher remains a planning/environment command-surface finding for the owning planning or repository-readiness workflow.

#### Scope 2 Evidence Destinations

##### S2-T01

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S2-T01_BEGIN
bond-regime-lab.html — curve inflation and duration foundation
	✓ Bond Regime: curve impulse names Bull Steepener
	✓ Bond Regime: curve impulse names Bull Flattener
	✓ Bond Regime: curve impulse names Bear Steepener
	✓ Bond Regime: curve impulse names Bear Flattener
	✓ Bond Regime: bear steepening and inflation pressure shorten duration
	✓ Bond Regime: curve level cannot independently set duration posture
	✓ Bond Regime: breakeven uses exact common nominal and real dates
	✓ Bond Regime: breakeven is nominal minus real yield
	✓ Bond Regime: absent real rows remain unavailable
Research-Lab self-test: 298 passed, 0 failed
S2-T01_EXIT=0
S2-T01_END
```

**Result:** PASS

##### S2-T02

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S2-T02_BEGIN
bond-regime-lab.html — curve inflation and duration foundation
	✓ Bond Regime: curve impulse names Bull Steepener
	✓ Bond Regime: curve impulse names Bull Flattener
	✓ Bond Regime: curve impulse names Bear Steepener
	✓ Bond Regime: curve impulse names Bear Flattener
	✓ Bond Regime: bear steepening and inflation pressure shorten duration
	✓ Bond Regime: curve level cannot independently set duration posture
	✓ Bond Regime: breakeven uses exact common nominal and real dates
	✓ Bond Regime: breakeven is nominal minus real yield
	✓ Bond Regime: absent real rows remain unavailable
Research-Lab self-test: 298 passed, 0 failed
S2-T02_EXIT=0
S2-T02_END
```

**Result:** PASS

##### S2-T03

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S2-T03_BEGIN
bond-regime-lab.html — curve inflation and duration foundation
	✓ Bond Regime: curve impulse names Bull Steepener
	✓ Bond Regime: curve impulse names Bull Flattener
	✓ Bond Regime: curve impulse names Bear Steepener
	✓ Bond Regime: curve impulse names Bear Flattener
	✓ Bond Regime: bear steepening and inflation pressure shorten duration
	✓ Bond Regime: curve level cannot independently set duration posture
	✓ Bond Regime: breakeven uses exact common nominal and real dates
	✓ Bond Regime: breakeven is nominal minus real yield
	✓ Bond Regime: absent real rows remain unavailable
Research-Lab self-test: 298 passed, 0 failed
S2-T03_EXIT=0
S2-T03_END
```

**Result:** PASS

##### S2-T04

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S2-T04_BEGIN
bond-regime-lab.html — curve inflation and duration foundation
	✓ Bond Regime: curve impulse names Bull Steepener
	✓ Bond Regime: curve impulse names Bull Flattener
	✓ Bond Regime: curve impulse names Bear Steepener
	✓ Bond Regime: curve impulse names Bear Flattener
	✓ Bond Regime: bear steepening and inflation pressure shorten duration
	✓ Bond Regime: curve level cannot independently set duration posture
	✓ Bond Regime: breakeven uses exact common nominal and real dates
	✓ Bond Regime: breakeven is nominal minus real yield
	✓ Bond Regime: absent real rows remain unavailable
Research-Lab self-test: 298 passed, 0 failed
S2-T04_EXIT=0
S2-T04_END
```

**Result:** PASS

##### S2-T05

**Phase:** implement
**Claim Source:** executed
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --grep "BS-004 bull steepener retains defensive credit context" --reporter=list`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE2_BROWSER_BEGIN
TITLE=BS-004 bull steepener retains defensive credit context
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
FIXTURE_BOUNDARY=observed-snapshot
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › BS-004 bull steepener retains defensive credit context (463ms)
	1 passed (1.8s)
EXIT=0
BOND_SCOPE2_BROWSER_END
```

**Result:** PASS

##### S2-T06

**Phase:** implement
**Claim Source:** executed
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --grep "BS-005 bear steepener penalizes long duration most" --reporter=list`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE2_BROWSER_BEGIN
TITLE=BS-005 bear steepener penalizes long duration most
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
FIXTURE_BOUNDARY=observed-snapshot
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › BS-005 bear steepener penalizes long duration most (294ms)
	1 passed (877ms)
EXIT=0
BOND_SCOPE2_BROWSER_END
```

**Result:** PASS

##### S2-T07

**Phase:** implement
**Claim Source:** executed
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --grep "Regression curve inversion alone leaves duration balanced or indeterminate" --reporter=list`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE2_BROWSER_BEGIN
TITLE=Regression curve inversion alone leaves duration balanced or indeterminate
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
FIXTURE_BOUNDARY=observed-snapshot
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › Regression curve inversion alone leaves duration balanced or indeterminate (310ms)
	1 passed (916ms)
EXIT=0
BOND_SCOPE2_BROWSER_END
```

**Result:** PASS

##### S2-T08

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S2-T08_BEGIN
bond-regime-lab.html — curve inflation and duration foundation
	✓ Bond Regime: curve impulse names Bull Steepener
	✓ Bond Regime: curve impulse names Bull Flattener
	✓ Bond Regime: curve impulse names Bear Steepener
	✓ Bond Regime: curve impulse names Bear Flattener
	✓ Bond Regime: bear steepening and inflation pressure shorten duration
	✓ Bond Regime: curve level cannot independently set duration posture
	✓ Bond Regime: breakeven uses exact common nominal and real dates
	✓ Bond Regime: breakeven is nominal minus real yield
	✓ Bond Regime: absent real rows remain unavailable
================================================
Research-Lab self-test: 298 passed, 0 failed
================================================
S2-T08_EXIT=0
S2-T08_END
```

**Result:** PASS

##### S2-T09

**Phase:** implement
**Claim Source:** executed
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --reporter=list`
**Exit Code:** 0
**Output:**

```text
S2-T09_BEGIN
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
SUITE=tests/bond-regime-lab.spec.mjs
Running 7 tests using 1 worker
	✓ BS-001 duration-driven ratio improvement stays mixed
	✓ BS-002 aligned ratios plus OAS confirmation are constructive
	✓ BS-003 tight but widening keeps level and momentum separate
	✓ BS-010 latest common date excludes unmatched leg
	✓ BS-004 bull steepener retains defensive credit context
	✓ BS-005 bear steepener penalizes long duration most
	✓ Regression curve inversion alone leaves duration balanced or indeterminate
	7 passed (2.3s)
S2-T09_EXIT=0
S2-T09_END
```

**Result:** PASS

##### Scope 2 Build Quality

**Phase:** implement
**Claim Source:** executed
**Command:** Scope 2 syntax/extraction assertion, `git diff --check`, and artifact lint
**Exit Code:** 0
**Output:**

```text
PASS Scope 2 inline JavaScript compiles
PASS classifyCurveState extractable
PASS classifyCurveImpulse extractable
PASS deriveBreakevenRows extractable
PASS classifyInflationState extractable
PASS classifyDurationPosture extractable
PASS curve level and impulse have separate DOM fields
PASS duration posture has context and invalidation fields
PASS rate effects have short and long rows
PASS no color-only state vocabulary
PASS no skipped-test markers in feature test file
Artifact lint PASSED.
```

**Result:** PASS

#### Scope 3 Evidence Destinations

##### S3-T01

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S3-T01_BEGIN
bond-regime-lab.html — sleeve scenario foundation
	✓ Bond Regime: scenario terms sum exactly for intermediate-treasury
	✓ Bond Regime: scenario terms sum exactly for investment-grade-corporate
	✓ Bond Regime: scenario terms sum exactly for high-yield-corporate
	✓ Bond Regime: Treasury spread is not applicable, never observed zero
	✓ Bond Regime: corporate sleeves expose finite spread terms
	✓ Bond Regime: TIPS maps nominal minus breakeven into real-yield shock
	✓ Bond Regime: zero-convexity break-even uses carry over duration
	✓ Bond Regime: invalid convexity discriminant is unavailable
	✓ Bond Regime: large finite shock retains arithmetic with reduced reliability
Research-Lab self-test: 315 passed, 0 failed
S3-T01_EXIT=0
S3-T01_END
```

**Result:** PASS

##### S3-T02

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S3-T02_BEGIN
bond-regime-lab.html — sleeve scenario foundation
	✓ Bond Regime: scenario terms sum exactly for intermediate-treasury
	✓ Bond Regime: scenario terms sum exactly for investment-grade-corporate
	✓ Bond Regime: scenario terms sum exactly for high-yield-corporate
	✓ Bond Regime: Treasury spread is not applicable, never observed zero
	✓ Bond Regime: corporate sleeves expose finite spread terms
	✓ Bond Regime: TIPS maps nominal minus breakeven into real-yield shock
	✓ Bond Regime: zero-convexity break-even uses carry over duration
	✓ Bond Regime: invalid convexity discriminant is unavailable
	✓ Bond Regime: nonfinite scenario input cannot retain a current result
Research-Lab self-test: 315 passed, 0 failed
S3-T02_EXIT=0
S3-T02_END
```

**Result:** PASS

##### S3-T03

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S3-T03_BEGIN
bond-regime-lab.html — sleeve scenario foundation
	✓ Bond Regime: TIPS maps nominal minus breakeven into real-yield shock
	✓ Bond Regime: zero-convexity break-even uses carry over duration
	✓ Bond Regime: invalid convexity discriminant is unavailable
	✓ Bond Regime: large finite shock retains arithmetic with reduced reliability
	✓ Bond Regime: large-shock warning names nonparallel curves
	✓ Bond Regime: large-shock warning names optionality
	✓ Bond Regime: large-shock warning names defaults
	✓ Bond Regime: large-shock warning names liquidity
	✓ Bond Regime: large-shock warning names tracking
	✓ Bond Regime: stale characteristic remains visible and unranked
Research-Lab self-test: 315 passed, 0 failed
S3-T03_EXIT=0
S3-T03_END
```

**Result:** PASS

##### S3-T04

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S3-T04_BEGIN
bond-regime-lab.html — sleeve scenario foundation
	✓ Bond Regime: large finite shock retains arithmetic with reduced reliability
	✓ Bond Regime: large-shock warning names nonparallel curves
	✓ Bond Regime: large-shock warning names optionality
	✓ Bond Regime: large-shock warning names defaults
	✓ Bond Regime: large-shock warning names liquidity
	✓ Bond Regime: large-shock warning names tracking
	✓ Bond Regime: stale characteristic remains visible and unranked
	✓ Bond Regime: stale sleeve receives no rank
	✓ Bond Regime: nonfinite scenario input cannot retain a current result
Research-Lab self-test: 315 passed, 0 failed
S3-T04_EXIT=0
S3-T04_END
```

**Result:** PASS

##### S3-T05

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `BS-006 six month mixed shock decomposes every sleeve`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE3_BROWSER_BEGIN
TITLE=BS-006 six month mixed shock decomposes every sleeve
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
CONTROL_PATH=synchronous-input-render
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › BS-006 six month mixed shock decomposes every sleeve (1.8s)
	1 passed (5.1s)
EXIT=0
BOND_SCOPE3_BROWSER_END
```

**Result:** PASS

##### S3-T06

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `BS-007 oversized shock preserves estimate and lowers reliability`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE3_BROWSER_BEGIN
TITLE=BS-007 oversized shock preserves estimate and lowers reliability
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
CONTROL_PATH=synchronous-input-render
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › BS-007 oversized shock preserves estimate and lowers reliability (800ms)
	1 passed (1.8s)
EXIT=0
BOND_SCOPE3_BROWSER_END
```

**Result:** PASS

##### S3-T07

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `BS-008 stale characteristic remains visible and unranked`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE3_BROWSER_BEGIN
TITLE=BS-008 stale characteristic remains visible and unranked
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
CONTROL_PATH=synchronous-input-render
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › BS-008 stale characteristic remains visible and unranked (600ms)
	1 passed (2.1s)
EXIT=0
BOND_SCOPE3_BROWSER_END
```

**Result:** PASS

##### S3-T08

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `Scenario controls reject nonfinite input and persist only allowlisted assumptions`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE3_BROWSER_BEGIN
TITLE=Scenario controls reject nonfinite input and persist only allowlisted assumptions
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
CONTROL_PATH=synchronous-input-render
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › Scenario controls reject nonfinite input and persist only allowlisted assumptions (632ms)
	1 passed (1.6s)
EXIT=0
BOND_SCOPE3_BROWSER_END
```

**Result:** PASS

##### S3-T09

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S3-T09_BEGIN
bond-regime-lab.html — sleeve scenario foundation
	✓ Bond Regime: scenario terms sum exactly for intermediate-treasury
	✓ Bond Regime: scenario terms sum exactly for investment-grade-corporate
	✓ Bond Regime: scenario terms sum exactly for high-yield-corporate
	✓ Bond Regime: TIPS maps nominal minus breakeven into real-yield shock
	✓ Bond Regime: zero-convexity break-even uses carry over duration
	✓ Bond Regime: invalid convexity discriminant is unavailable
	✓ Bond Regime: large finite shock retains arithmetic with reduced reliability
	✓ Bond Regime: stale characteristic remains visible and unranked
	✓ Bond Regime: nonfinite scenario input cannot retain a current result
================================================
Research-Lab self-test: 315 passed, 0 failed
================================================
S3-T09_EXIT=0
S3-T09_END
```

**Result:** PASS

##### S3-T10

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, complete `tests/bond-regime-lab.spec.mjs`
**Exit Code:** 0
**Output:**

```text
S3-T10_BEGIN
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
SUITE=tests/bond-regime-lab.spec.mjs
Running 11 tests using 1 worker
	✓ BS-001 duration-driven ratio improvement stays mixed
	✓ BS-002 aligned ratios plus OAS confirmation are constructive
	✓ BS-003 tight but widening keeps level and momentum separate
	✓ BS-010 latest common date excludes unmatched leg
	✓ BS-004 bull steepener retains defensive credit context
	✓ BS-005 bear steepener penalizes long duration most
	✓ Regression curve inversion alone leaves duration balanced or indeterminate
	✓ BS-006 six month mixed shock decomposes every sleeve
	✓ BS-007 oversized shock preserves estimate and lowers reliability
	✓ BS-008 stale characteristic remains visible and unranked
	✓ Scenario controls reject nonfinite input and persist only allowlisted assumptions
	11 passed (4.8s)
S3-T10_EXIT=0
S3-T10_END
```

**Result:** PASS

##### Scope 3 Build Quality

**Phase:** implement
**Claim Source:** executed
**Command:** Scope 3 syntax/extraction assertion, `git diff --check`, and artifact lint
**Exit Code:** 0
**Output:**

```text
PASS Scope 3 inline JavaScript compiles
PASS extractable scenarioShockForSleeve
PASS extractable calculateScenarioResult
PASS extractable solveBreakEvenShock
PASS extractable classifyReliability
PASS extractable rankScenarioResults
PASS extractable selectResearchExpression
PASS extractable buildDecisionRead
PASS extractable buildBondToolRead
PASS seven scenario rows use one result renderer
PASS signed-bp controls are labeled
PASS invalid input has alert state
PASS persistence object is explicit allowlist
PASS no requestAnimationFrame in scenario path
PASS no skipped-test marker in feature test file
Artifact lint PASSED.
```

**Result:** PASS

#### Scope 4 Evidence Destinations

##### S4-T01

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S4-T01_BEGIN
bond-regime-lab.html — observation adapter contracts
	✓ Bond Regime: official nominal Treasury fixture requires all configured maturities
	✓ Bond Regime: nominal parser emits the closed maturity shape
	✓ Bond Regime: missing nominal maturity rejects the whole family
	✓ Bond Regime: official real Treasury fixture requires all configured maturities
	✓ Bond Regime: real parser emits the closed maturity shape
	✓ Bond Regime: official real fixture derives only aligned breakevens
	✓ Bond Regime: valid restricted observation normalizes memory-only
	✓ Bond Regime: stale manual observation is unavailable without numeric substitute
	✓ Bond Regime: manual source URL must be HTTP or HTTPS
Research-Lab self-test: 334 passed, 0 failed
S4-T01_EXIT=0
S4-T01_END
```

**Result:** PASS

##### S4-T02

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S4-T02_BEGIN
bond-regime-lab.html — observation adapter contracts
	✓ Bond Regime: official nominal Treasury fixture requires all configured maturities
	✓ Bond Regime: nominal parser emits the closed maturity shape
	✓ Bond Regime: missing nominal maturity rejects the whole family
	✓ Bond Regime: official real Treasury fixture requires all configured maturities
	✓ Bond Regime: real parser emits the closed maturity shape
	✓ Bond Regime: official real fixture derives only aligned breakevens
	✓ Bond Regime: valid restricted observation normalizes memory-only
	✓ Bond Regime: stale manual observation is unavailable without numeric substitute
	✓ Bond Regime: manual source URL must be HTTP or HTTPS
Research-Lab self-test: 334 passed, 0 failed
S4-T02_EXIT=0
S4-T02_END
```

**Result:** PASS

##### S4-T03

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S4-T03_BEGIN
bond-regime-lab.html — observation adapter contracts
	✓ Bond Regime: valid restricted observation normalizes memory-only
	✓ Bond Regime: stale manual observation is unavailable without numeric substitute
	✓ Bond Regime: manual source URL must be HTTP or HTTPS
	✓ Bond Regime: source policy rejects credentials and restricted live endpoints
	✓ Bond Regime: restricted families cannot use persistent storage
	✓ Canary: Bond Regime snapshot inventory includes SGOV
	✓ Canary: Bond Regime snapshot inventory includes SHY
	✓ Canary: Bond Regime snapshot inventory includes IEF
	✓ Canary: Bond Regime snapshot inventory includes TLT
	✓ Canary: Bond Regime snapshot inventory includes TIP
Research-Lab self-test: 334 passed, 0 failed
S4-T03_EXIT=0
S4-T03_END
```

**Result:** PASS

##### S4-T04

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `Live smoke returns a valid adjusted pair and official nominal headers or explicit unavailable source state`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE4_BROWSER_BEGIN
TITLE=Live smoke returns a valid adjusted pair and official nominal headers or explicit unavailable source state
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
ADAPTER_PATH=production-cache-and-source-boundaries
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › Live smoke returns a valid adjusted pair and official nominal headers or explicit unavailable source state (6.0s)
	1 passed (10.1s)
EXIT=0
BOND_SCOPE4_BROWSER_END
```

**Result:** PASS. The test accepts either structurally valid live nominal data or the production `BRL-CURVE-NOMINAL-UNAVAILABLE` state; it does not turn an outage into a source-success claim.

##### S4-T05

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `BS-009 optional macro outage leaves truthful partial read`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE4_BROWSER_BEGIN
TITLE=BS-009 optional macro outage leaves truthful partial read
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
ADAPTER_PATH=production-cache-and-source-boundaries
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › BS-009 optional macro outage leaves truthful partial read (391ms)
	1 passed (1.1s)
EXIT=0
BOND_SCOPE4_BROWSER_END
```

**Result:** PASS

##### S4-T06

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `BS-013 restricted observation remains memory only`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE4_BROWSER_BEGIN
TITLE=BS-013 restricted observation remains memory only
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
ADAPTER_PATH=production-cache-and-source-boundaries
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › BS-013 restricted observation remains memory only (325ms)
	1 passed (960ms)
EXIT=0
BOND_SCOPE4_BROWSER_END
```

**Result:** PASS

##### S4-T07

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `Cache-first refresh preserves successful families when one source fails`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE4_BROWSER_BEGIN
TITLE=Cache-first refresh preserves successful families when one source fails
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
ADAPTER_PATH=production-cache-and-source-boundaries
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › Cache-first refresh preserves successful families when one source fails (311ms)
	1 passed (885ms)
EXIT=0
BOND_SCOPE4_BROWSER_END
```

**Result:** PASS

##### S4-T08

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S4-T08_BEGIN
	✓ Canary: Bond Regime snapshot inventory includes SGOV
	✓ Canary: Bond Regime snapshot inventory includes SHY
	✓ Canary: Bond Regime snapshot inventory includes IEF
	✓ Canary: Bond Regime snapshot inventory includes TLT
	✓ Canary: Bond Regime snapshot inventory includes TIP
	✓ Canary: Bond Regime snapshot inventory includes LQD
	✓ Canary: Bond Regime snapshot inventory includes HYG
	✓ Canary: Bond Regime snapshot inventory includes JNK
	✓ shared canary: RLDATA cache and toolReads contracts remain unchanged
	✓ shared canary: RLAPP resource states remain unchanged without causal registration
Research-Lab self-test: 334 passed, 0 failed
S4-T08_EXIT=0
S4-T08_END
```

**Result:** PASS

##### S4-T09

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `No browser credential restricted endpoint or raw observation persistence path exists`
**Exit Code:** 0
**Output:**

```text
BOND_SCOPE4_BROWSER_BEGIN
TITLE=No browser credential restricted endpoint or raw observation persistence path exists
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
ADAPTER_PATH=production-cache-and-source-boundaries
Running 1 test using 1 worker
	✓  1 tests/bond-regime-lab.spec.mjs › No browser credential restricted endpoint or raw observation persistence path exists (330ms)
	1 passed (996ms)
EXIT=0
BOND_SCOPE4_BROWSER_END
```

**Result:** PASS

##### S4-T10

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
S4-T10_BEGIN
bond-regime-lab.html — observation adapter contracts
	✓ Bond Regime: official nominal Treasury fixture requires all configured maturities
	✓ Bond Regime: official real Treasury fixture requires all configured maturities
	✓ Bond Regime: official real fixture derives only aligned breakevens
	✓ Bond Regime: source policy rejects credentials and restricted live endpoints
	✓ Bond Regime: restricted families cannot use persistent storage
	✓ Canary: Bond Regime snapshot inventory includes SGOV
	✓ Canary: Bond Regime snapshot inventory includes SHY
	✓ Canary: Bond Regime snapshot inventory includes IEF
	✓ Canary: Bond Regime snapshot inventory includes TLT
	✓ Canary: Bond Regime snapshot inventory includes TIP
	✓ Canary: Bond Regime snapshot inventory includes LQD
	✓ Canary: Bond Regime snapshot inventory includes HYG
	✓ Canary: Bond Regime snapshot inventory includes JNK
================================================
Research-Lab self-test: 334 passed, 0 failed
================================================
S4-T10_EXIT=0
S4-T10_END
```

**Result:** PASS

##### S4-T11

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, complete `tests/bond-regime-lab.spec.mjs`
**Exit Code:** 0
**Output:**

```text
S4-T11-RERUN_BEGIN
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
SUITE=tests/bond-regime-lab.spec.mjs
Running 16 tests using 1 worker
	✓ BS-001 duration-driven ratio improvement stays mixed
	✓ BS-002 aligned ratios plus OAS confirmation are constructive
	✓ BS-003 tight but widening keeps level and momentum separate
	✓ BS-010 latest common date excludes unmatched leg
	✓ BS-004 bull steepener retains defensive credit context
	✓ BS-005 bear steepener penalizes long duration most
	✓ Regression curve inversion alone leaves duration balanced or indeterminate
	✓ BS-006 six month mixed shock decomposes every sleeve
	✓ BS-007 oversized shock preserves estimate and lowers reliability
	✓ BS-008 stale characteristic remains visible and unranked
	✓ Scenario controls reject nonfinite input and persist only allowlisted assumptions
	✓ Live smoke returns a valid adjusted pair and official nominal headers or explicit unavailable source state
	✓ BS-009 optional macro outage leaves truthful partial read
	✓ BS-013 restricted observation remains memory only
	✓ Cache-first refresh preserves successful families when one source fails
	✓ No browser credential restricted endpoint or raw observation persistence path exists
	16 passed (12.6s)
S4-T11-RERUN_EXIT=0
S4-T11-RERUN_END
```

**Result:** PASS

##### Scope 4 Build Quality

**Phase:** implement
**Claim Source:** executed
**Command:** parser/rights/storage/shared-contract assertion, `git diff --check`, and artifact lint
**Exit Code:** 0
**Output:**

```text
PASS strict nominal parser present
PASS strict real parser present
PASS manual normalizer present
PASS cache-first bar reader present
PASS bounded bar hydrator present
PASS official Treasury loader present
PASS only missing or stale bars refresh
PASS restricted endpoint scan clean
PASS browser credential input scan clean
PASS manual observation persistence is memory-only
PASS fixture metadata says synthetic-values-only
PASS restricted fixture observations absent
PASS collector reads bond-regime-universe.json
PASS collector rollback is one additive universe hunk
PASS shared provider/cache schema unchanged
Artifact lint PASSED.
```

**Result:** PASS

##### Scope 4 Repaired Failures

**Phase:** implement
**Claim Source:** executed

- The first focused `BS-009` run failed because concurrent boot and explicit refresh calls did not share a promise; `hydrate` now sequences explicit refreshes after the active operation, and the rerun passed.
- The first family-isolation run expected `Unavailable`, but the design requires a validated failed-refresh cache to remain `Stale`; the test was reconciled to the planning contract, all proxy variants were intercepted, and the rerun passed in 1.1 seconds.
- The first cumulative 16-test run had 11 setup failures because legacy scenario helpers did not seed the newly required adapter boundaries; all scenario tests now enter through the full shared cache and official Treasury fixtures, and the rerun passed 16/16.

#### Scope 5 Evidence Destinations

##### S5-T01

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1 (repository-level consumer failure; Bond Regime assertions passed)
**Output:**

```text
	✓ Bond Regime: Indeterminate observed axis publishes no preferred expression
	✓ Bond Regime: normalized read nulls indeterminate action and result
	✓ Bond Regime: normalized read omits restricted values and source URLs
	✓ Bond Regime: normalized read keeps owner deep link and observed state
	✓ Bond Regime: official nominal Treasury fixture requires all configured maturities
	✓ Bond Regime: official real Treasury fixture requires all configured maturities
	✓ Bond Regime: source policy rejects credentials and restricted live endpoints
	✓ Bond Regime: restricted families cannot use persistent storage
market brief — registry-wide coverage + action-only payload contract
	✗ FAIL: current payload satisfies the executable brief contract: toolCoverage missing registered tools: bond-regime-lab
Research-Lab self-test: 342 passed, 1 failed
S5-T13_EXIT=1
```

**Result:** PASS for S5-T01's Bond Regime normalized-read contract; repository baseline is separately failed under S5-T13.

##### S5-T02

**Phase:** implement
**Claim Source:** executed
**Command:** planned `PAGE=bond-regime-lab.html node -e ...` check
**Exit Code:** 0
**Output:**

```text
S5-T02_BEGIN
PAGE=bond-regime-lab.html
CHECK=inline-script-dom-id-json
PASS inline scripts=1
PASS DOM ids=64
PASS references=70
PASS missing refs=0
PASS config JSON
PASS Simple panel
PASS Power panel
PASS three canvases
PASS shared workbench
PASS source table
S5-T02_EXIT=0
S5-T02_END
```

**Result:** PASS

##### S5-T03

**Phase:** implement
**Claim Source:** executed
**Command:** registry parity and file-existence assertion
**Exit Code:** 0
**Output:**

```text
S5-T03_BEGIN
CHECK=registry-parity-docs
PASS registry count=18
PASS index count=18
PASS nav count=18
PASS exact order
PASS bond id
PASS HTML
PASS config
PASS notes
PASS README
PASS notes index
S5-T03_EXIT=0
S5-T03_END
```

**Result:** PASS

##### S5-T04

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `BS-011 Simple and Power share one model digest`
**Exit Code:** 0
**Output:**

```text
SCOPE5_FOCUSED_BROWSER_BEGIN
TITLE=BS-011 Simple and Power share one model digest
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
Running 1 test using 1 worker
	✓ BS-011 Simple and Power share one model digest
	1 passed (2.3s)
EXIT=0
SCOPE5_FOCUSED_BROWSER_END
```

**Result:** PASS

##### S5-T05

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `BS-012 lever change recomputes without fetch or observed mutation`
**Exit Code:** 0
**Output:**

```text
SCOPE5_FOCUSED_BROWSER_BEGIN
TITLE=BS-012 lever change recomputes without fetch or observed mutation
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
Running 1 test using 1 worker
	✓ BS-012 lever change recomputes without fetch or observed mutation
	1 passed (1.0s)
EXIT=0
SCOPE5_FOCUSED_BROWSER_END
```

**Result:** PASS

##### S5-T06

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `BS-014 partial data is keyboard and text equivalent`
**Exit Code:** 0
**Output:**

```text
SCOPE5_FOCUSED_BROWSER_BEGIN
TITLE=BS-014 partial data is keyboard and text equivalent
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
Running 1 test using 1 worker
	✓ BS-014 partial data is keyboard and text equivalent
	1 passed (918ms)
EXIT=0
SCOPE5_FOCUSED_BROWSER_END
```

**Result:** PASS

##### S5-T07

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `Registered Bond Regime tool publishes one owner read without restricted payload`
**Exit Code:** 0
**Output:**

```text
SCOPE5_FOCUSED_BROWSER_BEGIN
TITLE=Registered Bond Regime tool publishes one owner read without restricted payload
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
Running 1 test using 1 worker
	✓ Registered Bond Regime tool publishes one owner read without restricted payload
	1 passed (874ms)
EXIT=0
SCOPE5_FOCUSED_BROWSER_END
```

**Result:** PASS

##### S5-T08

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `Power canvases are nonblank synchronous and text equivalent on desktop and mobile`
**Exit Code:** 0
**Output:**

```text
SCOPE5_FOCUSED_BROWSER_BEGIN
TITLE=Power canvases are nonblank synchronous and text equivalent on desktop and mobile
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
Running 1 test using 1 worker
	✓ Power canvases are nonblank synchronous and text equivalent on desktop and mobile
	1 passed (1.6s)
EXIT=0
SCOPE5_FOCUSED_BROWSER_END
```

**Result:** PASS

##### S5-T09

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `Fresh partial stale error and large-shock layouts contain text without overlap`
**Exit Code:** 0
**Output:**

```text
SCOPE5_FOCUSED_BROWSER_BEGIN
TITLE=Fresh partial stale error and large-shock layouts contain text without overlap
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
Running 1 test using 1 worker
	✓ Fresh partial stale error and large-shock layouts contain text without overlap
	1 passed (2.3s)
EXIT=0
SCOPE5_FOCUSED_BROWSER_END
```

**Result:** PASS. Ten screenshots were captured: fresh, partial, stale, invalid-input, and large-shock Power states at 1440x1000 and 390x844. Representative desktop/mobile images were visually inspected in-session.

##### S5-T10

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, complete `tests/bond-regime-lab.spec.mjs`
**Exit Code:** 0
**Output:**

```text
FINAL_BOND_BROWSER_BEGIN
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
SUITE=tests/bond-regime-lab.spec.mjs
Running 26 tests using 1 worker
	✓ SCN-003-001 through SCN-003-014 persistent browser regressions
	✓ public/cache adapter and restricted-storage regressions
	✓ Simple/Power parity and no-fetch lever regressions
	✓ synchronous canvas pixels and text-equivalent tables
	✓ fresh/partial/stale/error/large-shock desktop/mobile layouts
	✓ registered owner read and live-page diagnostics
	✓ keyboard, focus, noncolor states and 130% text containment
	26 passed (14.5s)
FINAL_BOND_BROWSER_EXIT=0
FINAL_BOND_BROWSER_END
```

**Result:** PASS

##### S5-T11

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `Live page loads production config cache and reachable public sources without uncaught errors`
**Exit Code:** 0
**Output:**

```text
SCOPE5_FOCUSED_BROWSER_BEGIN
TITLE=Live page loads production config cache and reachable public sources without uncaught errors
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
Running 1 test using 1 worker
	✓ Live page loads production config cache and reachable public sources without uncaught errors
	1 passed (1.1s)
EXIT=0
SCOPE5_FOCUSED_BROWSER_END
```

**Result:** PASS

##### S5-T12

**Phase:** implement
**Claim Source:** executed
**Command:** cached Playwright CLI, grep `Both modes expose landmarks names focus and noncolor states at 390 and 1440 widths`
**Exit Code:** 0
**Output:**

```text
SCOPE5_FOCUSED_BROWSER_BEGIN
TITLE=Both modes expose landmarks names focus and noncolor states at 390 and 1440 widths
RUNNER=cached-playwright-cli
BROWSER=system-google-chrome
SERVER=ephemeral-same-origin-http
PAGE=bond-regime-lab.html
CONFIG=bond-regime-universe.json
Running 1 test using 1 worker
	✓ Both modes expose landmarks names focus and noncolor states at 390 and 1440 widths
	1 passed (1.0s)
EXIT=0
SCOPE5_FOCUSED_BROWSER_END
```

**Result:** PASS

##### S5-T13

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Output:** Relevant current-session windows from the preserved full output:

```text
bond-regime-lab.html — observation adapter contracts
	✓ Bond Regime: source policy rejects credentials and restricted live endpoints
	✓ Bond Regime: restricted families cannot use persistent storage
rlbrief.js — §6c structural frame + anti-reactivity (MA stack, horizon cap, persistence gate)
	✓ capConfidence: tactical 68 capped to 55
	✓ capConfidence: structural read is NOT capped
	✓ persistence gate: a 3-read same-direction decline IS a persistent signal
	✓ renderBackdrop accepts generated scalar narrative fields without aborting later sections
tool registry — tools.json == index == nav; Tier-A adapters registered
	✓ landing registry matches tools.json order
	✓ navigation registry matches tools.json order
market brief — registry-wide coverage + action-only payload contract
	✗ FAIL: current payload satisfies the executable brief contract: toolCoverage missing registered tools: bond-regime-lab
	✓ contract rejects omission of a registered tool
	✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
================================================
Research-Lab self-test: 342 passed, 1 failed
================================================
```

**Result:** FAIL. The exact registries and existing Market Brief structural math pass, but current payload coverage omits the registered Bond Regime tool. `market-brief.payload.json` is excluded from implementation ownership and was not edited by this run.

##### S5-T14

**Phase:** implement
**Claim Source:** executed
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/003-bond-regime-and-scenario-lab 'SCN-003-.*' && bash .github/bubbles/scripts/traceability-guard.sh specs/003-bond-regime-and-scenario-lab && bash .github/bubbles/scripts/state-transition-guard.sh specs/003-bond-regime-and-scenario-lab`
**Exit Code:** 1
**Output:**

```text
Artifact lint PASSED.
============================================================
	BUBBLES TRACEABILITY GUARD
	Feature: /Users/pkirsanov/Projects/research-lab/specs/003-bond-regime-and-scenario-lab
	Timestamp: 2026-07-14T12:50:54Z
============================================================

--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 14 scenario contract(s)
✅ scenario-manifest.json records evidenceRefs
✅ All linked tests from scenario-manifest.json exist

ℹ️  Checking traceability for Scope 1: Credit Evidence Foundation
```

**Result:** FAIL. Artifact lint passes, but the exact chain stops in traceability before the state-transition component. The installed guard splits the single-file plan into scope sections, then searches only for `### Test Plan`; the current valid headings are `### Scope N Test Plan`, and `set -e` exits on the empty pipeline. The installed framework script is read-only in this downstream repository.

#### Scope 5 Current-Session Reconciliation

**Phase:** implement
**Claim Source:** executed

The exact planned browser command, `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --reporter=list`, exited 1 because no local Playwright package is installed and `--no-install` correctly refused package acquisition. The repository-supported cached runner was then executed without installing dependencies.

**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/bond-regime-lab.spec.mjs --reporter=json`
**Exit Code:** 0
**Output:** Exact current-session source-rights and final-statistics records from the preserved raw JSON reporter output:

```text
				{
					"title": "No browser credential restricted endpoint or raw observation
 persistence path exists",
					"ok": true,
					"tags": [],
					"tests": [
						{
							"timeout": 30000,
							"annotations": [],
							"expectedStatus": "passed",
							"projectId": "",
							"projectName": "",
							"results": [
								{
									"workerIndex": 0,
									"parallelIndex": 0,
									"status": "passed",
									"duration": 210,
									"errors": [],
									"stdout": [],
									"stderr": [],
									"retry": 0,
									"startTime": "2026-07-14T13:02:17.456Z",
									"annotations": [],
									"attachments": []
								}
							],
							"status": "expected"
						}
					],
					"id": "da48a4d5394891e58305-f1beffcc5e500009d185",
					"file": "tests/bond-regime-lab.spec.mjs",
					"line": 306,
					"column": 1
				},
```

```text
	"errors": [],
	"stats": {
		"startTime": "2026-07-14T13:02:05.102Z",
		"duration": 16855.243,
		"expected": 26,
		"skipped": 0,
		"unexpected": 0,
		"flaky": 0
	}
}
```

**Result:** PASS as supplemental current browser evidence. It proves the current Bond Regime browser/source-rights slice through the existing cached runner, but it does not convert the nonzero exact `npx --no-install` command into a pass.

The planned state guard was also executed independently because the exact S5-T14 chain could not reach it.

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/003-bond-regime-and-scenario-lab`
**Exit Code:** 1
**Output:**

```text
--- Check 4: DoD Completion (Zero Unchecked) ---
ℹ️  INFO: DoD items total: 80 (checked: 76, unchecked: 4)
🔴 BLOCK: Resolved scope artifacts have 4 UNCHECKED DoD items — ALL must be [x] for 'done'
--- Check 8: Test File Existence ---
🔴 BLOCK: Test Plan references non-existent file: tests/bond-regime-lab.spec
🔴 BLOCK: 30 of 31 test files from Test Plan DO NOT EXIST
--- Check 13B: Implementation Delta Evidence (Gate G053) ---
✅ PASS: Implementation delta evidence recorded with git-backed proof and non-artifact file paths (Gate G053)
--- Check 16: Implementation Reality Scan (Gate G028) ---
🔴 BLOCK: Implementation reality scan found 5 source code violation(s) — STUB/FAKE DATA DETECTED (Gate G028)
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:174
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:66
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:108
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
🔴 TRANSITION BLOCKED: 53 failure(s), 7 warning(s)
failedGateIds: [G060,G022,G028,G085]
failedChecks: [Check-4-completion,Check-5-all-done,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
STATE_TRANSITION_EXIT=1
```

**Result:** FAIL. The two implementation-owned guard-shape findings are resolved: canonical status and git-backed implementation-delta evidence now pass. The remaining set includes open Scope 5 evidence, planning/parser false paths that truncate `.spec.mjs` to `.spec`, Scope 4 consumer/stress planning checks, missing full-delivery specialist phases, certification completed-scope parity, excluded shared `rldata.js` storage-pattern findings, and the framework dogfood prerequisite. This implementation run does not mutate those foreign-owned surfaces.

##### S5-T15

**Phase:** implement
**Claim Source:** executed
**Command:** exact planned `git diff --check` and path-scoped `git status --short --untracked-files=all`
**Exit Code:** 0
**Output:**

```text
FINAL_CHANGE_INTEGRITY_BEGIN
DIFF_CHECK_EXIT=0
 M README.md
 M index.html
 M notes/README.md
 M rlg.js
 M rlnav.js
 M scripts/fetch-bars.mjs
 M scripts/selftest.mjs
 M tools.json
?? bond-regime-lab.html
?? bond-regime-universe.json
?? notes/bond-regime-lab.md
?? tests/bond-regime-lab.spec.mjs
?? tests/fixtures/bond-regime/metadata.json
?? tests/fixtures/bond-regime/nominal-missing-maturity.csv
?? tests/fixtures/bond-regime/nominal-valid.csv
?? tests/fixtures/bond-regime/real-valid.csv
STATUS_EXIT=0
FINAL_CHANGE_INTEGRITY_END
```

**Result:** PASS. Existing user changes in shared files and the untracked planning packet remain preserved.

##### Scope 5 Security And Rights

**Phase:** implement
**Claim Source:** executed
**Exit Code:** 0
**Output:**

```text
FINAL_SECURITY_SCAN_BEGIN
PASS restricted endpoint count=0
PASS credential input count=0
PASS committed restricted observation count=0
PASS manual observations memory-only
PASS normalized read excludes raw manual values
PASS normalized read excludes manual source URLs
PASS localStorage allowlist has eleven fields
PASS account/holding/tax/brokerage collection count=0
PASS order/execution path count=0
PASS official Treasury nominal path present
PASS official Treasury real path present
PASS fixture policy synthetic-values-only
SECURITY_SCAN_EXIT=0
FINAL_SECURITY_SCAN_END
```

**Result:** PASS

##### Scope 5 Blocking Finding

**Phase:** implement
**Claim Source:** executed

Current `market-brief.payload.json::toolCoverage` is missing `bond-regime-lab`, causing S5-T13 to fail at 342/1 after the docs evidence recorded a prior 343/0 snapshot. The current file contains 17 coverage rows for an 18-tool registry, so that historical docs evidence has been superseded by a subsequent payload refresh. The payload is outside this feature's implementation boundary. Scope 5 remains Blocked, its open DoD items remain unchecked with uncertainty declarations, and certification remains untouched.

## Scenario Contract Evidence

### Scenario SCN-003-001

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-001 duration-driven ratio improvement stays mixed`
No product execution output exists in this planning report.

### Scenario SCN-003-002

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-002 aligned ratios plus OAS confirmation are constructive`
No product execution output exists in this planning report.

### Scenario SCN-003-003

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-003 tight but widening keeps level and momentum separate`
No product execution output exists in this planning report.

### Scenario SCN-003-004

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-004 bull steepener retains defensive credit context`
No product execution output exists in this planning report.

### Scenario SCN-003-005

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-005 bear steepener penalizes long duration most`
No product execution output exists in this planning report.

### Scenario SCN-003-006

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-006 six month mixed shock decomposes every sleeve`
No product execution output exists in this planning report.

### Scenario SCN-003-007

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-007 oversized shock preserves estimate and lowers reliability`
No product execution output exists in this planning report.

### Scenario SCN-003-008

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-008 stale characteristic remains visible and unranked`
No product execution output exists in this planning report.

### Scenario SCN-003-009

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-009 optional macro outage leaves truthful partial read`
No product execution output exists in this planning report.

### Scenario SCN-003-010

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-010 latest common date excludes unmatched leg`
No product execution output exists in this planning report.

### Scenario SCN-003-011

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-011 Simple and Power share one model digest`
No product execution output exists in this planning report.

### Scenario SCN-003-012

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-012 lever change recomputes without fetch or observed mutation`
No product execution output exists in this planning report.

### Scenario SCN-003-013

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-013 restricted observation remains memory only`
No product execution output exists in this planning report.

### Scenario SCN-003-014

**Phase:** plan
**Claim Source:** not-run
**Planned live test:** `tests/bond-regime-lab.spec.mjs` - `BS-014 partial data is keyboard and text equivalent`
No product execution output exists in this planning report.

## Coverage Report

The active plan has five sequential scopes, 14 stable business scenarios, and 56 Test Plan rows distributed as 11, 9, 10, 11, and 15 rows. Every business scenario maps to an exact persistent live browser title; pure helpers and adapters have focused unit/functional canaries; final delivery includes desktop/mobile accessibility, synchronous canvas pixels, text containment, overlap, source-rights, registry, JSON, Markdown, governance, and complete repository regression checks.

Runtime coverage percentages and pass counts do not exist until the product tests execute.

## Lint And Quality

Planning-governance command evidence is recorded only after actual execution. Research Lab declares no project lint, format, build, or typecheck command. The authoritative product baseline is `node scripts/selftest.mjs`; browser delivery uses `npx --no-install playwright` through the committed test runtime.

## Uncertainty Declarations

- **Scopes 1-5:** Product behavior, planned product-test files, and delivery command outcomes were not evaluated as delivered behavior by `bubbles.plan`. Resolution requires the delivery workflow to create the owned source/test surfaces, execute each exact command, and append current evidence without weakening scenarios.
- **External sources:** Live Treasury and market-data availability cannot be inferred from deterministic fixtures. Delivery must record live structural smoke separately and preserve explicit Unavailable behavior when a source is unreachable.
- **Market claims:** No fixture, modeled estimate, or passing test is evidence of investment performance, forecast accuracy, or recommendation correctness.

## Spot-Check Recommendations

Independent validation should inspect one duration-confounded ratio, one fully confirmed constructive case, tight-but-widening spreads, each curve-impulse quadrant, Treasury/corporate/TIPS contribution applicability, convexity break-even roots, stale characteristic exclusion, cache-first failed refresh, restricted observation storage, Simple/Power digest parity, zero-request lever changes, all three Power canvases at both viewports, contained Power tables, and every registry/deep-link/tool-read consumer.

## Planning Validation Log

No planning validation result is pre-recorded here. The invoking planning agent must add only commands actually executed in the current session, with their real exit status and observed outcome.

## Validation Summary

No product validation verdict exists. Planning checks validate artifact structure and the pre-implementation handoff only; they do not certify runtime delivery.

## Audit Verdict

No delivery audit verdict exists. Certification remains exclusively owned by `bubbles.validate` and `bubbles.audit` under the configured workflow.

## Documentation Publication Evidence

### Managed-Coverage Drift Resolution

**Phase:** docs
**Claim Source:** interpreted
**Interpretation:** The registered product surface and normalized-read implementation were already synchronized, but the explicitly targeted Market Brief payload omitted the new registry participant. The correction is coverage-only because the committed payload contains no current Bond Regime tool read and `scripts/brief-refresh.mjs` contains no deterministic Bond Regime Tier-A adapter.

| Doc Or Coverage Surface | Drift | Implementation Truth | Resolution |
| --- | --- | --- | --- |
| `market-brief.payload.json::toolCoverage` | The registered `bond-regime-lab` entry was absent. | `tools.json` registers the live tool; `bond-regime-lab.html::buildBondToolRead` publishes derived regime, posture, confidence, scenario, result, conflict, confirmation, date, and indeterminate fields while excluding raw restricted observations and source URLs. | Added one registry-ordered `browser-or-agent-read` row that states the normalized contract and explicitly makes no live recommendation or market-confirmation claim. |

No generated market narrative, action, recommendation, model value, timestamp, or implementation logic was changed.

### Payload Contract Validation

**Phase:** docs
**Claim Source:** executed
**Command:** `node scripts/validate-brief-payload.mjs` followed by read-only `jq` coverage-state checks
**Exit Code:** 0
**Output:**

```text
PAYLOAD_VALIDATION_BEGIN
COMMAND=node scripts/validate-brief-payload.mjs
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
VALIDATOR_EXIT=0
REGISTERED_TOOL_COUNT=18
PAYLOAD_COVERAGE_COUNT=18
BOND_COVERAGE_COUNT=1
BOND_COVERAGE_STATUS=browser-or-agent-read
BOND_TOOL_READ_PRESENT=false
PAYLOAD_VALIDATION_END
```

**Result:** PASS. Registry and payload coverage cardinality match, exactly one Bond Regime coverage row exists, and the payload truthfully carries no current Bond Regime tool read.

### Registry And Managed-Docs Consistency

**Phase:** docs
**Claim Source:** executed
**Command:** read-only checks across `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md`, `notes/bond-regime-lab.md`, `bond-regime-lab.html`, and `market-brief.payload.json`
**Exit Code:** 0
**Output:**

```text
PASS tools.json registers the shipped tool contract
PASS index.html registers bond-regime-lab
PASS rlnav.js links bond-regime-lab.html
PASS managed README links the shipped tool
PASS managed README links the tool notes
PASS notes index registers the tool note
PASS tool note documents normalized read restrictions
PASS shipped read points to the Simple owner surface
PASS payload coverage ids exactly match registry order
PASS payload has one coverage-only Bond Regime row
PASS payload makes no current Bond Regime tool-read claim
DOCS_REGISTRY_CONSISTENCY_END
```

**Result:** PASS. No additional implementation-to-doc drift was found in the targeted feature surfaces.

### Repository Baseline After Publication

**Phase:** docs
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:** Relevant windows from the preserved 438-line full output are reproduced verbatim.

```text
market brief — registry-wide coverage + action-only payload contract
	✓ current payload satisfies the executable brief contract
	✓ contract rejects omission of a registered tool
	✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
	✓ contract rejects watch-only or incomplete next-session output
	✓ contract rejects a missing visible brief section
	✓ contract rejects an incomplete structural backdrop
	✓ contract rejects a missing generation timestamp

================================================
Research-Lab self-test: 343 passed, 0 failed
================================================
```

**Result:** PASS. The exact repository baseline now accepts the managed coverage entry with zero failures.

### DOCS-001 Current-Session Remediation (2026-07-14)

**Phase:** docs
**Claim Source:** interpreted
**Interpretation:** The current payload had again lost the registered Bond Regime coverage row after the earlier docs evidence was recorded. This run restored exactly one registry-ordered, coverage-only row. The payload validator and the Market Brief contract group now pass, but the complete repository selftest is still nonzero because three shared provider-credential assertions fail independently of DOCS-001. This section supersedes the earlier 343/0 baseline claim for the current disk state.

| Finding | Current-Session Observation | Disposition |
| --- | --- | --- |
| `DOCS-001` | `market-brief.payload.json::toolCoverage` omitted `bond-regime-lab`. | Addressed by one `browser-or-agent-read` row after `real-assets-lab` and before `ai-capex-strategy-lab`; no tool read, recommendation, action, narrative, math, timestamp, or Bond Regime conclusion changed. |
| `SELFTEST-001` | `provider credential is session-only while non-secret rlData remains durable` fails. | Unresolved; route to `bubbles.implement` because it concerns shared credential storage behavior. |
| `SELFTEST-002` | `registered tools expose no duplicate provider credential setter migration or durable storage access` fails. | Unresolved; route to `bubbles.implement` because it concerns registered product pages. |
| `SELFTEST-003` | `registered tools expose no credential-bearing provider URL transport` fails. | Unresolved; route to `bubbles.implement` because it concerns registered product pages. |

#### Exact Payload Validation

**Phase:** docs
**Claim Source:** executed
**Command:** `node scripts/validate-brief-payload.mjs market-brief.payload.json; validator_exit=$?; printf 'PAYLOAD_VALIDATOR_EXIT=%s\n' "$validator_exit"; exit "$validator_exit"`
**Exit Code:** 0
**Output:**

```text
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
PAYLOAD_VALIDATOR_EXIT=0
```

**Result:** PASS. The current payload satisfies the executable registry-coverage and visible-section contract.

#### Exact Repository Selftest

**Phase:** docs
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs; selftest_exit=$?; printf 'SELFTEST_EXIT=%s\n' "$selftest_exit"; exit "$selftest_exit"`
**Exit Code:** 1
**Output:** Relevant current-session windows from the preserved full output are reproduced verbatim.

```text
rldata.js — shared toolReads round-trip + freshness
	✓ legacy detection reports redacted presence without silent activation
	✓ explicit consent migrates allowlisted provider credentials into the same-tab store
	✓ legacy durable key copies are scrubbed after verified migration
	✓ central same-tab provider key updates round-trip
	✗ FAIL: provider credential is session-only while non-secret rlData remains durable
	✓ central owner exposes no bulk credential or silent migration API

rlapp.js — one key surface, all-page status, automatic stale-data refresh
	✓ every registered tool loads the shared data-status shell
	✓ every registered tool loads RLDATA before RLAPP
	✓ the landing page consumes the central provider registry without duplicate storage ownership
	✓ tool pages expose no duplicate credential inputs
	✗ FAIL: registered tools expose no duplicate provider credential setter migration or durable storage access
	✗ FAIL: registered tools expose no credential-bearing provider URL transport

market brief — registry-wide coverage + action-only payload contract
	✓ current payload satisfies the executable brief contract
	✓ contract rejects omission of a registered tool
	✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
	✓ contract rejects watch-only or incomplete next-session output
	✓ contract rejects a missing visible brief section
	✓ contract rejects an incomplete structural backdrop
	✓ contract rejects a missing generation timestamp

================================================
Research-Lab self-test: 342 passed, 3 failed
================================================
SELFTEST_EXIT=1
```

**Result:** FAIL. DOCS-001 is no longer the failing contract. The complete baseline remains blocked by `SELFTEST-001` through `SELFTEST-003`, so Scope 5 and certification remain nonterminal.

#### Focused Artifact Lint

**Phase:** docs
**Claim Source:** executed
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/003-bond-regime-and-scenario-lab 'SCN-003-.*'`
**Exit Code:** 0
**Output:**

```text
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ uservalidation checklist has checked-by-default entries
✅ All checklist bullet items use checkbox syntax
✅ Detected state.json status: not_started
✅ Detected state.json workflowMode: full-delivery
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
⚠️  state.json uses deprecated field 'scopeProgress' — see scope-workflow.md state.json canonical schema v2
⚠️  state.json uses deprecated field 'statusDiscipline' — see scope-workflow.md state.json canonical schema v2
⚠️  state.json uses deprecated field 'scopeLayout' — see scope-workflow.md state.json canonical schema v2
ℹ️  Workflow mode 'full-delivery' allows status 'done'; current status is 'not_started'
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
```

**Result:** PASS with three existing state-schema deprecation warnings; no blocking artifact finding was emitted.

#### Path Integrity And Diagnostics

**Phase:** docs
**Claim Source:** executed
**Command:** path-scoped `git diff --check`, `git status --short --untracked-files=all`, and editor diagnostics for the three permitted remediation files
**Exit Code:** 0
**Output:**

```text
DOCS001_DIFF_CHECK_BEGIN
DOCS001_DIFF_CHECK_EXIT=0
DOCS001_PATH_STATUS_BEGIN
 M market-brief.payload.json
?? specs/003-bond-regime-and-scenario-lab/report.md
?? specs/003-bond-regime-and-scenario-lab/state.json
DOCS001_PATH_STATUS_EXIT=0
DOCS001_DIFF_CHECK_END
market-brief.payload.json: No errors found
report.md: No errors found
state.json: No errors found
```

**Result:** PASS. The remediation remains confined to the payload, docs evidence, and permitted execution metadata; editor diagnostics report no errors.
