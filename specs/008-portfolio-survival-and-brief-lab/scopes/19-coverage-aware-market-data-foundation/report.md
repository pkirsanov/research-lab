# Scope 19 Report: Coverage-Aware Market Data Foundation

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 19 implements an additive Promise-based `ensureBarCoverage` contract over the existing shared RLDATA
cache. It appends same-origin dates, optionally requests one public Yahoo symbol range, rejects conflicting
same-date rows, measures actual bounds, and refuses completeness until currency, transform, corporate-action,
freshness, and requested-bound requirements all hold. The original synchronous three-argument measurement
and existing `ensureBars` Promise remain compatible.

**Shared Infrastructure Impact Sweep.** The only shared-foundation file touched is `rldata.js`; the remaining
changed paths are `scripts/selftest.mjs` and the two test carriers, per the `git status --short` output under
[Code Diff Evidence](#code-diff-evidence). No provider credential UI/schema, public bar file, analytics
formula, personal storage, publisher artifact, registry, or documentation file was changed.

**Additive rollback proof.** The change is additive rather than a replacement, so removing it restores the
prior contract with no migration:

```text
$ node --test tests/portfolio-bar-coverage.functional.mjs   # Intended RED, pre-implementation
legacy ensureBars and three-argument coverage retain cache and Promise compatibility: PASS

$ npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
tests: 8
pass: 8
fail: 0

$ node scripts/selftest.mjs
exit: 0
Research-Lab self-test: 3189 passed, 0 failed
```

The legacy compatibility row passed *before* the source change existed, which is what proves the new contract
is additive: the pre-existing synchronous three-argument call and the existing `ensureBars` Promise were
already satisfied by the old implementation. The unchanged 8/8 provider credential matrix and the 3,189-assertion
selftest confirm no shared consumer regressed after the change landed.

## Decision Record

Coverage acquisition remains a protected shared-data foundation, so compatibility and credential-boundary
canaries precede portfolio analytics. A static snapshot may extend dates but cannot infer qualification from
the mere presence of an adjusted-close column. Identical qualified provider rows may add explicitly supplied
metadata; conflicting rows make their date disputed and unavailable for coverage.

## Completion Statement

Implementation and all five declared Test Plan commands are complete on one coherent tree. The Pages build,
structured path validator, artifact lint, diagnostics, and regression-quality guard pass. Scope/status
promotion remains plan- and validate-owned and occurs only after focused traceability accepts this report.

## Code Diff Evidence

**Claim Source:** executed

```text
$ git status --short -- rldata.js scripts/selftest.mjs tests/portfolio-bar-coverage.functional.mjs tests/portfolio-survival-foundation.spec.mjs portfolio-survival-allocation.config.json
 M portfolio-survival-allocation.config.json
 M rldata.js
 M scripts/selftest.mjs
 M tests/portfolio-survival-foundation.spec.mjs
?? tests/portfolio-bar-coverage.functional.mjs
$ git diff --check -- rldata.js scripts/selftest.mjs tests/portfolio-bar-coverage.functional.mjs tests/portfolio-survival-foundation.spec.mjs portfolio-survival-allocation.config.json
exit: 0
```

Scope 19 changed `rldata.js`, `scripts/selftest.mjs`, the new functional carrier, and the appended foundation
browser row. `portfolio-survival-allocation.config.json` was already dirty before Scope 19 began and is not
attributed to this scope. No provider credential UI/schema, public bar file, analytics formula, personal
storage, publisher artifact, registry, or documentation file was changed by this scope.

## Test Evidence

**Claim Source:** executed

### Intended RED

```text
$ node --test tests/portfolio-bar-coverage.functional.mjs
SCN-008-045 same-origin append measures actual bounds and preserves partial truth without lookup: FAIL
SCN-008-045 approved public lookup requests only public range fields and completes qualified coverage: FAIL
SCN-008-045 conflicting same-date rows are disputed and cannot satisfy a requested bound: FAIL
Adversarial: requested range labels and row counts cannot fake date coverage: FAIL
legacy ensureBars and three-argument coverage retain cache and Promise compatibility: PASS
invalid target or source policy fails before cache mutation or any request: FAIL
tests: 6
pass: 1
fail: 5
```

The legacy compatibility control passed before source implementation. The five new behavior rows failed on
the synchronous measurement-only API, absent acquisition, absent dispute handling, and absent exact target
validation.

### TP-19-01

**Claim Source:** executed

```text
# Feature 008 Scope 19 final repository selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3640
sha256: c6291782133c541d95a2472278321d45fec6a3403e61f8c035b608b39eb6a251
Research-Lab self-test: 3189 passed, 0 failed
```

The shared unit/selftest canary is the whole-repository suite, so it is the row that would fail first if the
additive `ensureBarCoverage` contract had disturbed any existing shared-cache consumer. It reports 3,189
assertions passing with 0 failed, 0 skipped, and 0 todo. The recorded line count and digest identify the exact
captured run.

### TP-19-02

```text
# Feature 008 Scope 19 TP-19-02
$ node --test tests/portfolio-bar-coverage.functional.mjs
exit: 0
lines: 46
sha256: 9182ffc6ce9cbbefc21a880f0a8b779912576987f832a793eb7b4c8f442c59d4
tests: 6
pass: 6
fail: 0
skipped: 0
```

The six rows prove same-origin append with retained partial truth, qualified public lookup, conflict
exclusion, false-completeness rejection, legacy compatibility, and fail-before-mutation validation.

### TP-19-03

```text
# Feature 008 Scope 19 TP-19-03
$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-045 five year coverage measures dates appends allowed sources and preserves partial truth" --reporter=list
exit: 0
lines: 9
sha256: fa73173699131ef23f00e450f8038287669e0162dbbb733d5de11edec94a6266
requested: 2021-08-20..2026-08-20
actual: 2024-07-25..2026-08-20
rows: 520
state: partial
requests: /data/bars/MSFT.json
1 passed
```

The live page reads the real committed MSFT snapshot. It does not claim five years from a two-year file and
does not issue a provider request under same-origin-only policy.

### TP-19-04

```text
# Feature 008 Scope 19 TP-19-04
$ node --test --test-name-pattern="Adversarial: requested range labels and row counts cannot fake date coverage" tests/portfolio-bar-coverage.functional.mjs
exit: 0
lines: 16
sha256: 22219d24e7986b18f9698dadebcb535cca9fe8c5f9924a0e690af8c270244e82
tests: 1
pass: 1
fail: 0
skipped: 0
```

The adversarial fixture carries 1,300 distinct rows and requested five-year labels while both required bounds
remain absent. It cannot return `complete`.

### TP-19-05

```text
# Feature 008 Scope 19 TP-19-05
$ npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 13
sha256: de5321447c34ee4c5512e4da15d6e89a78a1a0763e10e39403b92d1b6947b1b1
tests: 8
pass: 8
fail: 0
```

The complete provider matrix preserves Tier 1 proxy, Tier 2 local keys, fail-closed unknown providers, browser
clear, legacy cleanup, inaccessible-storage handling, and cancellation behavior.

## Uncertainty Declarations

- The full repository is shared with concurrent sessions. Evidence and changed-path claims are restricted to
	the four Scope 19 paths named above.
- Current committed bar snapshots do not declare currency, transform, or corporate-action qualification.
	They therefore improve date coverage but remain honestly partial. A qualified Yahoo response can establish
	those fields because it carries currency and an adjusted-close series.

## Scenario Contract Evidence

SCN-008-045 is exercised by the real-runtime functional carrier, repository selftest, exact live-page title,
and the unchanged provider credential matrix. The adversarial row proves requested labels and large row counts
cannot substitute for actual date bounds.

The carriers that execute the scenario, with the exit codes recorded under [Test Evidence](#test-evidence):

```text
$ node --test tests/portfolio-bar-coverage.functional.mjs                       # TP-19-02
exit: 0   tests: 6   pass: 6   fail: 0   skipped: 0

$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-045 five year coverage measures dates appends allowed sources and preserves partial truth" --reporter=list
exit: 0   1 passed
requested: 2021-08-20..2026-08-20
actual: 2024-07-25..2026-08-20
rows: 520   state: partial   requests: /data/bars/MSFT.json

$ node --test --test-name-pattern="Adversarial: requested range labels and row counts cannot fake date coverage" tests/portfolio-bar-coverage.functional.mjs   # TP-19-04
exit: 0   tests: 1   pass: 1   fail: 0   skipped: 0
```

The date/consent/source semantics are explicit in the live row: the requested five-year bound is *not* claimed,
the measured actual bound stops at the real snapshot edge, and the state is reported `partial` rather than
`complete`. The only request issued is the same-origin `/data/bars/MSFT.json`, so no personal request field and
no provider credential is involved under same-origin-only policy.

## Coverage Report

The declared matrix is 5 of 5 commands executed, 0 failed, 0 skipped. The repository selftest passed 3,189
assertions. No line-coverage percentage is claimed because Research Lab declares no coverage command.

## Lint And Quality

```text
$ bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-survival-foundation.spec.mjs tests/provider-credentials.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 2

$ node scripts/build-pages-site.mjs --dry-run
exit: 0
registeredPages: 28
rootFiles: 121

$ node scripts/validate-spec-test-paths.mjs
exit: 0
new missing paths: 0
planned missing paths: 8, each owned by a later Not Started remediation scope

$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab
exit: 0
Artifact lint PASSED
```

VS Code diagnostics report no errors in the Scope 19 source/test/scope files. Static interception matches in
the browser carrier are explanatory comments stating that interception is absent; no executable interception,
skip, fixme, or bailout branch exists.

## Spot-Check Recommendations

- Preserve exact target validation and public-only request serialization when adding another provider.
- Keep static metadata declarative; never infer qualification from column presence.

## Validation Summary

All five declared commands, Pages build, structured path validation, diagnostics, artifact lint, and E2E
integrity pass.

```text
# Feature 008 Scope 19 canonical focused traceability
$ bash ~/bubbles/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope
exit: 0
lines: 361
sha256: 2f88a73df5fec3c0cc3f173b2bc2e46112faccd712fa4033c542687d876acfd0
scenarios checked: 45
scenario-to-row mappings: 45
concrete test file references: 45
report evidence references: 45
DoD fidelity: 45 mapped, 0 unmapped
RESULT: PASSED (0 warnings)
```

## Audit Verdict

Implementation evidence is ready for focused scope closure. No feature-level audit or terminal certification
is claimed.
