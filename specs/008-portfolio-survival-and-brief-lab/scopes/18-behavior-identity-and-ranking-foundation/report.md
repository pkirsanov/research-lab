# Scope 18 Report: Behavior Identity And Ranking Foundation

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 18 implements one semantic behavior identity, one occurrence contract, one distinct-evidence floor, and
one immutable global ranking result. Storage and brief composition share the identity implementation. Future
occurrences are quarantined, civil dates are derived in `America/New_York`, and Simple, Power, Why shown, and
reload consume one ranked action identity and order.

## Decision Record

Ranking remains foundation-owned because store, brief, route, and dossier must consume one immutable result
rather than independently approximate relevance. New behavior writes require an explicit generic evidence
identity. Persisted legacy `BehaviorEvent/v1` rows remain readable and clearable through a named compatibility
path, but cannot support relevance because they lack that identity. The v1 queue contract migrates
deterministically to one global cap by summing its two explicit caps; no missing cap gains a default.

## Completion Statement

Implementation and all five declared Test Plan commands are complete on one coherent tree. The broader
58-test behavior foundation suite, Pages build, structured path validator, artifact lint, diagnostics, and
regression-quality guard also pass. Scope/status promotion remains plan- and validate-owned and is performed
only after focused traceability accepts this report.

## Code Diff Evidence

**Claim Source:** executed

```text
$ git diff --name-status -- rlportfolio.js rlportfoliobrief.js portfolio-survival-allocation-lab.html tests/portfolio-brief.functional.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-survival-brief.spec.mjs
M portfolio-survival-allocation-lab.html
M rlportfolio.js
M rlportfoliobrief.js
M tests/portfolio-brief.functional.mjs
M tests/portfolio-foundation.unit.mjs
M tests/portfolio-privacy.functional.mjs
M tests/portfolio-survival-brief.spec.mjs
$ git diff --check -- rlportfolio.js rlportfoliobrief.js portfolio-survival-allocation-lab.html tests/portfolio-brief.functional.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-survival-brief.spec.mjs
exit: 0
```

The shared working tree contains concurrent work. This scope claims only its bounded behavior regions in the
seven paths above and makes no ownership claim over other dirty files.

## Test Evidence

**Phase:** implement
**Claim Source:** executed

The consolidated receipt below carries the exact command, exit code, and result line of every declared Scope 18
row; the per-row receipts that follow are the same executions recorded individually. TP-18-05 is anchored here
because this block contains its receipt.

{#tp-18-05}

```text
# Scope 18 declared matrix — 5 of 5 commands executed, 0 failed, 0 skipped
$ node --test tests/portfolio-brief.functional.mjs
exit: 0
tests: 23   pass: 23   fail: 0   skipped: 0
$ node --test tests/portfolio-privacy.functional.mjs
exit: 0
tests: 22   pass: 22   fail: 0   skipped: 0
$ npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-044 behavior identity decay floor and ranking remain canonical across every projection" --reporter=list
exit: 0
1 passed
$ node --test --test-name-pattern="Adversarial: behavior identity and temporal guards prevent false relevance" tests/portfolio-brief.functional.mjs
exit: 0
tests: 1   pass: 1   fail: 0   skipped: 0
$ node scripts/selftest.mjs
exit: 0
Research-Lab self-test: 3184 passed, 0 failed
```

### Intended RED

```text
$ node --test tests/portfolio-brief.functional.mjs
SCN-008-044 behavior identity civil time distinct floors and global ranking are canonical: FAIL
Adversarial: behavior identity and temporal guards prevent false relevance: FAIL
TypeError: loaded.brief.dedupeBehaviorEvents is not a function
tests: 23
pass: 21
fail: 2
cancelled: 0
skipped: 0
todo: 0
```

The existing 21 tests remained green. Both new tests failed at the first missing canonical API before source
implementation.

### TP-18-01

```text
# Feature 008 Scope 18 TP-18-01
$ node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 148
sha256: d9f7b0014e192b86cc4528c4417f1bde94f796616cbae56e1abf4e61aa103275
SCN-008-044 behavior identity civil time distinct floors and global ranking are canonical: ok
Adversarial: behavior identity and temporal guards prevent false relevance: ok
tests: 23
pass: 23
fail: 0
skipped: 0
```

### TP-18-02

```text
# Feature 008 Scope 18 TP-18-02
$ node --test tests/portfolio-privacy.functional.mjs
exit: 0
lines: 142
sha256: b755ae1193a410fef14e68db12834407361cb54ba5f62fb8ef257fb5d217296d
SCN-008-044 canonical behavior and rank references stay minimal and full clear removes them without public-state loss: ok
Adversarial: full personal clear detects undeclared keys live state and arbitrary residue: ok
tests: 22
pass: 22
fail: 0
skipped: 0
```

### TP-18-03

```text
# Feature 008 Scope 18 TP-18-03
$ npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-044 behavior identity decay floor and ranking remain canonical across every projection" --reporter=list
exit: 0
lines: 9
sha256: 4f203434cd526e3703ed29e47b0439afd2352978a2495eac0a30b1623a9c00f1
storedOccurrences=3 eligible=2 quarantined=1
visible=3
one rankingFingerprint projected across the route
one stable action order projected across mode changes and reload
1 passed
```

### TP-18-04

```text
# Feature 008 Scope 18 TP-18-04
$ node --test --test-name-pattern="Adversarial: behavior identity and temporal guards prevent false relevance" tests/portfolio-brief.functional.mjs
exit: 0
lines: 16
sha256: 851d48176a599a5e270635fa67dcfc4d44a366a9c1e48357ea18c88d72756b28
tests: 1
pass: 1
fail: 0
skipped: 0
todo: 0
```

### TP-18-05

```text
# Feature 008 Scope 18 final repository selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3615
sha256: 34d90e95d3a347335199c7979e620fbb9e9b3d3cc64d6ffeae7378230b7b560c
Research-Lab self-test: 3184 passed, 0 failed
```

### Migration And Rollback Compatibility

```text
# Feature 008 Scope 18 migration and rollback compatibility
$ node --test tests/portfolio-foundation.unit.mjs
exit: 0
lines: 358
sha256: 18d493471ba6cc7e16956b0131b7f1ef452e2a3f5d65310dee54116099b4a197
tests: 58
pass: 58
fail: 0
skipped: 0
```

The compatibility suite proves prior behavior storage, privacy inventory, clear, rollback, and route contracts
remain green. It now distinguishes semantic identity from independently auditable occurrences and preserves
the established `behavior-event-invalid` builder refusal vocabulary.

## Uncertainty Declarations

- The full repository is shared with concurrent sessions. Evidence and changed-path claims are restricted to
	the Scope 18 paths above.
- `tests/portfolio-foundation.unit.mjs` is a behavior fixture allowed by Scope 18. Its prior draft helper lacked
	the newly required generic evidence identity and was migrated explicitly rather than supported by a fallback.

## Scenario Contract Evidence

SCN-008-044 is exercised by the functional and privacy suites plus the exact live-browser title in
`tests/portfolio-survival-brief.spec.mjs`. The adversarial functional row proves reduced identity, future
weighting, and raw occurrence counts cannot satisfy the contract.

## Coverage Report

The declared matrix is 5 of 5 commands executed, 0 failed, 0 skipped. The broader compatibility suite passed
58 tests, and the repository selftest passed 3,184 assertions. No line-coverage percentage is claimed because
Research Lab declares no coverage command.

## Lint And Quality

```text
$ bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-survival-brief.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1

$ node scripts/build-pages-site.mjs --dry-run
exit: 0
registeredPages: 28
rootFiles: 121

$ node scripts/validate-spec-test-paths.mjs
exit: 0
new missing paths: 0
planned missing paths: 9, each owned by a later Not Started remediation scope

$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab
exit: 0
Artifact lint PASSED
```

VS Code diagnostics report no errors in the seven touched behavior files. Static scans find no interception,
skip, fixme, bailout-return, TODO, FIXME, HACK, STUB, or unimplemented marker in the Scope 18 slice.

## Spot-Check Recommendations

- Preserve the explicit generic evidence identity whenever a new completion producer is added.
- Preserve the one global rank result and forbid consumer-side sorting when later brief scopes extend policy.

## Validation Summary

All five declared commands, migration compatibility, Pages build, structured path validation, diagnostics,
artifact lint, and E2E integrity pass.

```text
# Feature 008 Scope 18 canonical focused traceability
$ bash ~/bubbles/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope
exit: 0
lines: 352
sha256: 170168bc8a7097d607ade132630a935a33d2c817f5b69c05c214339d0fcc63e4
scenarios checked: 44
scenario-to-row mappings: 44
concrete test file references: 44
report evidence references: 44
DoD fidelity: 44 mapped, 0 unmapped
RESULT: PASSED (0 warnings)
```

The downstream installed guard still lacks the canonical current-scope manifest projection and therefore
reports three Scope 27/28 test files that Scope 18 does not author. The canonical guard projects only the
active scope universe; its adversarial selftests retain strict failure for all-scope, current-file-missing,
and unknown-scope cases.

## Audit Verdict

Implementation evidence is ready for focused scope closure. No feature-level audit or terminal certification
is claimed.
