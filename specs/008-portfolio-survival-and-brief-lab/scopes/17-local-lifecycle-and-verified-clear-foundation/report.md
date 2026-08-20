# Scope 17 Report: Local Lifecycle And Verified Clear Foundation

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 17 implements the complete local holding lifecycle and one tombstone-first full-personal clear. The
holding editor now adds, edits, removes, confirms, reloads, exports, and commits an honest empty revision. The
clear path derives every personal category from runtime policy, clears durable and live-controller state,
rereads every category, preserves generic public caches, and refuses partial or unverifiable deletion.

## Decision Record

The complete clear contract remains foundation behavior because every later personal surface depends on its
runtime-derived registry and verified tombstone transaction. The display-mode key is declared in the storage
policy and participates in the same independently faulted clear matrix as every other personal key. Runtime
category hashes use fixed lowercase canonicalization versions and put the public contract identity in the
hashed payload, so mixed-case public contract names never become invalid hash-version tokens.

## Completion Statement

Implementation and all six declared Test Plan commands are complete. This report records only current-session
execution. Scope/status promotion remains plan- and validate-owned and is performed only after the focused
traceability and artifact gates accept this evidence.

## Code Diff Evidence

**Claim Source:** executed

Command executed from the repository root:

```text
$ git diff --name-status -- rlportfolio.js portfolio-survival-allocation-lab.html portfolio-survival-allocation.config.json tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-survival-foundation.spec.mjs scripts/validate-spec-test-paths.mjs scripts/selftest.mjs specs/008-portfolio-survival-and-brief-lab/scopes/17-local-lifecycle-and-verified-clear-foundation/scope.md specs/008-portfolio-survival-and-brief-lab/scopes/17-local-lifecycle-and-verified-clear-foundation/report.md specs/008-portfolio-survival-and-brief-lab/state.json
M portfolio-survival-allocation-lab.html
M portfolio-survival-allocation.config.json
M rlportfolio.js
M specs/008-portfolio-survival-and-brief-lab/state.json
M tests/portfolio-foundation.unit.mjs
M tests/portfolio-privacy.functional.mjs
M tests/portfolio-survival-foundation.spec.mjs
Exit: 0
```

The Scope 17 artifact directory is new and therefore untracked at this point. Shared validator/selftest files
are clean relative to the current repository revision. Other dirty paths in the shared working tree belong to
concurrent Feature 008/015 work and are not attributed to this scope.

## Test Evidence

**Claim Source:** executed

### TP-17-01

```text
$ node --test tests/portfolio-foundation.unit.mjs
exit: 0
lines: 358
sha256: 0673c5f0b784b973ae27f07035f02c1606bba0cd89002e365160bf91c65830e6
tests: 58
pass: 58
fail: 0
skipped: 0
```

### TP-17-02

```text
$ node --test tests/portfolio-privacy.functional.mjs
exit: 0
lines: 136
sha256: e4dc858c8feb96bbc41cf89cbc23a9bb782c32b18d27ef58e9cb8f65295ac2ac
tests: 21
pass: 21
fail: 0
skipped: 0
```

### TP-17-03

```text
$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-042 holdings can be added edited removed and cleared to an honest empty portfolio" --reporter=list
exit: 0
lines: 6
sha256: 1f8232c3ebcfac0c0bf85c5fabb1d190e933c253555b39feb3c7a81661e4f21e
1 passed
```

### TP-17-04

```text
$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-043 full personal clear tombstones derives and verifies every personal category" --reporter=list
exit: 0
lines: 6
sha256: 9f01e3902d02eaffbfe8d8bfee0eedffe9e093901e5288314657d94f6c072ef0
1 passed
```

### TP-17-05

```text
$ node --test --test-name-pattern="Adversarial: full personal clear detects undeclared keys live state and arbitrary residue" tests/portfolio-privacy.functional.mjs
exit: 0
lines: 16
sha256: aedde779b10afb4e68c9b91dd67a50a706b1f2616a7511c0611cdb9f3a536878
tests: 1
pass: 1
fail: 0
skipped: 0
```

### TP-17-06

```text
$ node scripts/selftest.mjs
exit: 0
lines: 3567
sha256: 55f3efc644764d767a8a1043baa7bc72488375e7fad8ddb4fa381fb3964852ba
Research-Lab self-test: 3136 passed, 0 failed
```

## Uncertainty Declarations

- The full repository is shared with concurrent sessions. Changed-path claims above are restricted to the
	explicit Scope 17 path list and make no ownership claim over other dirty files.
- The canonical framework's full `framework-validate` was attempted after the current-scope traceability
	repair and correctly refused because another framework validation held the global machine lock. The focused
	traceability selftest passed 109 assertions; full validation remains a framework-repository publication gate,
	not evidence required to claim Scope 17 product behavior.

## Scenario Contract Evidence

SCN-008-042 is exercised by `tests/portfolio-foundation.unit.mjs`,
`tests/portfolio-privacy.functional.mjs`, and the exact live-browser title in
`tests/portfolio-survival-foundation.spec.mjs`. SCN-008-043 uses the same three carriers plus an isolated
adversarial residue test. All commands above executed against the same current tree.

## Coverage Report

The declared Scope 17 matrix is 6 of 6 commands executed, 0 failed, 0 skipped. The broader repository
selftest passed 3,136 assertions. No line-coverage percentage is claimed because Research Lab declares no
coverage command.

## Lint And Quality

```text
$ node scripts/build-pages-site.mjs --dry-run
exit: 0
sha256: c2ed673351eb5d05dbac43dabdc51abe7e779a93c1c18e58df317fa6fd0f3cfc
registeredPages: 28
rootFiles: 121

$ node scripts/validate-spec-test-paths.mjs
exit: 0
sha256: 0e3e378cb8dc97c3bf441594a8c0e7bad0658ad0e772315f365a16d8e49dbeff
new missing paths: 0
planned missing paths: 9, each owned by a later Not Started remediation scope

$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab
exit: 0
sha256: ed9142d7152044254040019b1b8b5bda8eb2f0e069f511acdd675c357cff0950
Artifact lint PASSED
```

## Spot-Check Recommendations

- Continue to run the policy-derived fault matrix whenever a personal storage key is added.
- Preserve the exact live-browser empty-portfolio assertion when later route scopes change navigation.

## Validation Summary

All six declared commands, the Pages build, structured path validation, editor diagnostics, artifact lint,
and focused traceability pass.

```text
$ bash <bubbles-repo>/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope
exit: 0
lines: 343
sha256: a56f34b54724075c52695bc30248ebaa15f7b4d4f50d32e2b8b644a3cb3fbac9
Scenarios checked: 43
Scenario-to-row mappings: 43
Concrete test file references: 43
Report evidence references: 43
DoD fidelity: 43 mapped, 0 unmapped
RESULT: PASSED (0 warnings)
```

## Audit Verdict

Implementation evidence is ready for focused scope closure. No feature-level audit or terminal certification
is claimed.
