# Scope 01 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

Scope 01 implementation resumed from the existing dirty worktree. The production current-pointer loader, content-addressed static publication, exact unavailable-claim lineage, populated config-registry validation, and Scope-owned browser/unit/selftest surfaces were repaired. Scope status remains `Not Started`; no DoD checkbox, completed implementation phase, or certification field is claimed.

Exact raw SEC response capture remains blocked because the required non-secret `SEC_USER_AGENT` process input is unset. The retained extract remains explicitly incomplete, the page renders `Partial extract`, the production validator exits nonzero, and SCN-010-026 remains red at its exact-response assertion. A separate downstream framework-write guard also reports pre-existing drift in two `.github/bubbles/**` files; those files are outside this scope and were not modified.

## Decision Record

| Finding | Disposition | Current implementation truth |
| --- | --- | --- |
| SR010-001 | Addressed | The real page calls `loadCompanyPublication` with `data/company-fundamentals/companies/sec-cik-0000789019/current.json`, resolves a hash-bound manifest and eight immutable objects, and never loads `foundation-publication.js`. Browser tests use the real static server with no request interception. |
| SR010-002 | Unresolved, externally blocked | A strict production SEC Submissions byte parser and provenance contract now exist, but exact source bytes could not be captured because `SEC_USER_AGENT` is unset. The curated extract is still marked `completeResponse: false` and is not represented as positive real-source proof. |
| SR010-003 | Addressed | `claim-direction` has zero observation IDs. Its unavailable link resolves the required Company Facts source, FY2026 Q3 period, mapping, formula, consumers, rights, restatement/conflict state, and missing-capture reason without citing `obs-sec-issuer-name`. |
| SR010-004 | Addressed | Mapping, formula, archetype-definition, archetype-assignment, and peer-set item schemas and cross-references are validated. Tests cover one populated valid registry plus dangling source, mapping, company, and archetype references. |
| SR010-005 | Addressed | The global `playwright.config.mjs` `testMatch` hunk was removed. The explicit Scope 01 test file still executes with the existing config. |

## Completion Statement

Outcome is `blocked`, not complete. TP-01-03 and TP-01-05 are nonzero on the required exact SEC response proof, the framework write guard is nonzero on foreign managed-file drift, and the required before-addition selftest baseline cannot be recreated honestly after inheriting the partial implementation. Scope status and certification remain unchanged.

## Code Diff Evidence

Final implementation-owned paths are limited to the Scope 01 source/test surfaces, the marker-bounded Feature 010 selftest block, materialized `data/company-fundamentals/**`, this report, and implementation execution metadata in `state.json`. `playwright.config.mjs` has zero final diff. Protected bug and brief-atomicity paths were not modified, restored, staged, or used as evidence.

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `git status --short --untracked-files=all -- rlcompany.js company-fundamentals-lab.html company-fundamentals.config.json data/company-fundamentals scripts/validate-company-fundamentals.mjs scripts/selftest.mjs tests/company-fundamentals-contracts.unit.mjs tests/company-fundamentals-lab.spec.mjs tests/fixtures/company-fundamentals/source-qualified specs/010-company-fundamentals-and-brief-lab/state.json specs/010-company-fundamentals-and-brief-lab/scopes/01-contract-config-validator-publication-foundation/report.md playwright.config.mjs && git diff --check -- <same tracked Scope 01 paths>`
**Exit Code:** 0
**Output:**

```text
SCOPE01-CLASSIFICATION-BEGIN
CLASS=implementation-owned
 M scripts/selftest.mjs
 M specs/010-company-fundamentals-and-brief-lab/state.json
?? company-fundamentals-lab.html
?? company-fundamentals.config.json
?? data/company-fundamentals/companies/sec-cik-0000789019/current.json
?? data/company-fundamentals/objects/16519a02412b15f0980db5b813aea4ced0ba8776abc10a5fe75b08aa4dfbcc72.json
?? data/company-fundamentals/objects/6bafc1a2f1709c1bebfa4115539b95a4047e5529d0fda74aaac64699c79c2463.json
?? data/company-fundamentals/objects/79b7e5faa3b13c974404cffd76475b31734d6c8413a35ee0faaf1655e512d52e.json
?? data/company-fundamentals/objects/807d3fb2e683c5c7f522e1a1146a5f0201d1e66b4301defa555ab22205fecef5.json
?? data/company-fundamentals/objects/8837d794e3cc9786a4d60f0a18d86881e7aef8b21acc49be14414bbf9d1fad17.json
?? data/company-fundamentals/objects/93a09a9344ae9db2d12d4ea5cd1d06c4a5dacc7f275dc550ea7d0059eddbd62f.json
?? data/company-fundamentals/objects/9e9afe6ddf95cb5e792c193b0b99d345fe20268b2d62749e37656d02fd765073.json
?? data/company-fundamentals/objects/bfbf7a854297d41b88577076dfb45eea0c49279dd646855a3c1c19fcd57321fe.json
?? data/company-fundamentals/objects/f8c2c9c884db7674051890bed4f529ba5b2380c9ef73c5df937747d6e4101794.json
?? rlcompany.js
?? scripts/validate-company-fundamentals.mjs
?? tests/company-fundamentals-contracts.unit.mjs
?? tests/company-fundamentals-lab.spec.mjs
?? tests/fixtures/company-fundamentals/source-qualified/foundation-publication.js
?? tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json
SCOPE01_CLASSIFICATION_EXIT=0
SCOPE01-CLASSIFICATION-END
```

**Result:** PASS for path-scoped diff syntax and allowed-boundary classification. The config and incomplete source extract were inherited untracked inputs and were preserved.

## Test Evidence

### Independent Replay TP-01-01

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `node --test tests/company-fundamentals-contracts.unit.mjs`
**Exit Code:** 0
**Output:**

```text
✔ curated SEC extract remains explicitly incomplete and hash-stable
✔ production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields
✔ Scope 01 config declares every policy and fails loud on version or reference drift
✔ partial-source foundation publication validates and projects one coherent graph
✔ publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates
✔ source decimals remain reconstructable and evidence classes and states stay closed
✔ conflicted dependencies withhold only their reachable branch
✔ same-origin loader resolves a current pointer and canonical objects without credentials
✔ fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace
✔ SCN-010-026 missing facts withhold only dependency-reachable outputs
✔ SCN-010-029 material claims resolve the complete source and consumer chain
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
TP_01_01_FINAL_EXIT=0
```

**Result:** PASS.

### Independent Replay TP-01-02

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 current pointer selects the content-addressed production manifest
  ✓ Feature 010 partial SEC extract remains explicit and cannot masquerade as exact raw response bytes
  ✓ Feature 010 materialized publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  ✓ Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  ✓ Feature 010 validator executes production config graph projection and trace functions

================================================
Research-Lab self-test: 506 passed, 0 failed
================================================
TP_01_02_EXIT=0
```

**Result:** PASS for the final complete selftest. No current-session pre-addition baseline exists because the marker block predated this resumed invocation.

### Independent Replay TP-01-03

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable" --reporter=list`
**Exit Code:** 1
**Output:**

```text
TP-01-03-BEGIN
SCENARIO=SCN-010-026
TEST_FILE=tests/company-fundamentals-lab.spec.mjs
LIVE_SYSTEM=YES
REQUEST_INTERCEPTION=NONE

Running 1 test using 1 worker

  ✘  1 …g concepts remain unavailable while independent facts stay usable

Error: expect(locator).toHaveText(expected) failed
Locator: locator('[data-source-extract-completeness]')
Expected: "Exact SEC response bytes"
Received: "Partial extract"
Timeout: 5000ms
at ~/research-lab/tests/company-fundamentals-lab.spec.mjs:56:70

1 failed
TP_01_03_EXIT=1
TP-01-03-END
```

**Result:** FAIL. The direct page accepted the production pointer/object graph and reached the exact raw-response assertion; the retained source is truthfully incomplete.

### Independent Replay TP-01-04

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain" --reporter=list`
**Exit Code:** 0
**Output:**

```text
TP-01-04-BEGIN
SCENARIO=SCN-010-029
TEST_FILE=tests/company-fundamentals-lab.spec.mjs
LIVE_SYSTEM=YES
REQUEST_INTERCEPTION=NONE

Running 1 test using 1 worker

  ✓  1 … claim reaches its exact source transformation and consumer chain

  1 passed
TP_01_04_EXIT=0
TP-01-04-END
```

**Result:** PASS.

### Independent Replay TP-01-05

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 1
**Output:**

```text
Running 2 tests using 1 worker

  ✘  1 …g concepts remain unavailable while independent facts stay usable
  ✓  2 … claim reaches its exact source transformation and consumer chain

1) [system-chrome] › tests/company-fundamentals-lab.spec.mjs › Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable

Error: expect(locator).toHaveText(expected) failed
Locator: locator('[data-source-extract-completeness]')
Expected: "Exact SEC response bytes"
Received: "Partial extract"
Timeout: 5000ms
at ~/research-lab/tests/company-fundamentals-lab.spec.mjs:56:70

1 failed
1 passed
TP_01_05_EXIT=1
```

**Result:** FAIL solely on TP-01-03's exact raw-response requirement; TP-01-04 passes in the same cumulative run.

## Scenario Contract Evidence

### Scenario SCN-010-026

The required pre-repair RED was captured before the production loader edit: the browser request list contained the page scripts and `foundation-publication.js`, but not `/data/company-fundamentals/companies/sec-cik-0000789019/current.json`. After repair, the same test advances through accepted identity, dependency propagation, current-pointer presence, object-path presence, no fixture-script request, and then fails at exact SEC bytes. Identical-command GREEN does not exist, so the scenario and its DoD remain unchecked.

### Scenario SCN-010-029

The existing test first failed because its stale rights assertion expected the unrelated partial Submissions limitation. After source-requirement repair and assertion alignment, the identical Playwright command passes. It proves no `obs-sec-issuer-name` text, exact Company Facts source URL, FY2026 Q3, mapping, formula, both consumers, rights limitation, restatement/conflict states, missing-capture reason, panel focus, close behavior, and trigger focus return.

## Coverage Report

No percentage claim is made. The focused unit suite executes 11 tests and covers the closed config registries, parser boundaries, object/manifest hash validation, same-origin pointer loading, wrong-company rejection, dependency propagation, and both primary scenarios. The complete repository selftest executes 506 checks with zero failures. Browser scenario coverage is 1 passing and 1 externally blocked.

## Lint And Quality

### Production Validator

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `node scripts/validate-company-fundamentals.mjs`
**Exit Code:** 1
**Output:**

```text
[company-fundamentals] config: parsed
[company-fundamentals] config: contract valid
[company-fundamentals] config: canonical fingerprint calculated
[company-fundamentals] source extract: scope and identity explicit
[company-fundamentals] source extract: canonical hash valid
[company-fundamentals] current pointer: contract and content-addressed manifest path valid
[company-fundamentals] manifest: pointer hash and config fingerprint valid
[company-fundamentals] objects: 8 reachable immutable objects hash-valid
[company-fundamentals] source artifact: hash and rights bound
[company-fundamentals] publication: complete graph valid
[company-fundamentals] publication: canonical manifest hash valid
[company-fundamentals] accepted state: source identity and period preserved
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] source capture: BLOCKED exact raw SEC response bytes are not retained
[company-fundamentals] validation: BLOCKED
FOUNDATION_VALIDATOR_EXIT=1
```

**Result:** FAIL at the explicit source-capture gate after every local graph check passes.

### Artifact And Capability Gates

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Commands:** `bash .github/bubbles/scripts/artifact-lint.sh specs/010-company-fundamentals-and-brief-lab`; `bash .github/bubbles/scripts/capability-foundation-guard.sh specs/010-company-fundamentals-and-brief-lab`
**Exit Codes:** 0, 0
**Output:**

```text
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes/_index.md
✅ Per-scope layout contains 14 scope file(s)
✅ Every per-scope directory has a report.md file
✅ No forbidden sidecar artifacts present
✅ Top-level status matches certification.status
✅ Workflow mode 'full-delivery' allows status 'done'; current status is 'not_started'
=== Anti-Fabrication Evidence Checks ===
Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0
capability-foundation-guard: Gate G094 applies: triggerHits=201 concreteImplementationEntries=35
capability-foundation-guard: spec.md contains Domain Capability Model
capability-foundation-guard: design.md contains capability foundation split with sufficient variation axes
capability-foundation-guard: spec.md contains UI Primitives for multi-screen or reusable UI work
capability-foundation-guard: scopes include foundation:true and overlay Depends On foundation ordering
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
G094_EXIT=0
```

**Result:** PASS. Artifact lint also emitted inherited deprecation warnings for `scopeProgress`, `statusDiscipline`, and `scopeLayout`; no warning was repaired outside implementation ownership.

### Static And Editor Checks

Path-scoped `git diff --check`, incomplete-marker, high-confidence secret/PII, Playwright interception, and fail-loud fallback scans each exited 0 with zero findings. `playwright.config.mjs` diff exited 0 (no diff). VS Code diagnostics returned no errors for every touched source, test, config, validator, selftest, and materialized publication file.

### Framework Write Guard

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/cli.sh framework-write-guard`
**Exit Code:** 1
**Output:**

```text
ℹ️ Checking downstream framework-managed files against .github/bubbles/.checksums
ℹ️ Installed release manifest: version=7.20.0
ℹ️ Install provenance: mode=local-source sourceRef=main dirty=true
ℹ️ Supported profiles: foundation, delivery, production, assured
⚠️ Installed from a dirty local source checkout. This is not a clean published release install.
❌ Framework-managed file drift detected: bubbles/scripts/install-bubbles-hooks.sh
Expected: 86884efc58c9fe9f1e7953cd42e7239d60444e62348ecb796a18ad393df02119
Actual: e1ef1ba8e73f4ee03c3f033b9dc997f122e5b49337cda92d8e1902110c56c344
❌ Framework-managed file drift detected: bubbles/mcp/tools/query_tool_log.json
Expected: f10bbcd6b3ae01e9dd5ba9becd05e2a5cc2c43feb2c980c2060221d2e3732a2e
Actual: da6955e0958cd5240c48fb906793b1a2761fd09517d9efabf45c8efdd53bf121
Downstream repos must not directly author changes in framework-managed Bubbles files.
FRAMEWORK_WRITE_GUARD_EXIT=1
```

**Result:** FAIL on foreign framework-managed drift. Scope 01 made no `.github/bubbles/**` change.

### Required Policy, Traceability, And Containment Replay

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Commands:** `node scripts/validate-node-source-lock.mjs`; `bash .github/bubbles/scripts/env-pollution-scan.sh "$(pwd)"`; `bash .github/bubbles/scripts/macos-portability-guard.sh scripts/`; `bash .github/bubbles/scripts/artifact-lint.sh specs/010-company-fundamentals-and-brief-lab`; `bash .github/bubbles/scripts/traceability-guard.sh specs/010-company-fundamentals-and-brief-lab`; Scope 01 path-classification and pre-edit SHA-256 comparison command
**Exit Codes:** 0, 0, 0, 0, 0, 0
**Output (literal result lines from the complete captures):**

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
== macOS portability guard -- scanning 3 file(s) ==
ok   class-1 raw-timeout: none
ok   class-6 grep-pcre: none
ok   class-8 mapfile-readarray: none
ok   class-13 date-nanoseconds: none
PASS: the scanned surface is WSL+macOS portable.
Artifact lint PASSED.
✅ scenario-manifest.json covers 32 scenario contract(s)
✅ All linked tests from scenario-manifest.json exist
unknownPaths=0
FOREIGN_HASH PASS 8c4beaf38397cdc44210c0dd4b7dc76c5da11fcde135573aa2db5642484cc386 playwright.config.mjs
FOREIGN_HASH PASS b55a4f2b3929862cac37d8831d08137763f871d7f924635575a57eb0b418470b specs/_bugs/BUG-002-market-brief-session-date-drift/state.json
FOREIGN_HASH PASS 21904cbc6ba5043a97b199bc90d5abf52737379def89052277e73240bdfda569 specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
FOREIGN_HASH PASS fcfa318ee040063d22a8f26e10f9ba527bcc972a8dae4753cf5c95c947b8ddeb specs/_bugs/BUG-002-market-brief-session-date-drift/uservalidation.md
FOREIGN_HASH PASS dcd3690dfd7c2ad481068eb5725778de1e2b18a9e02e89b68764069ac33b9de3 specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json
FOREIGN_HASH PASS 65a8c742053adc532894290f1990c6ea8b670d58c455a45b502710f22e50b476 specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md
FOREIGN_HASH PASS 04ded71269640170ca8a4d0051e33dd1f155df9b827cc78c7795c14f228fbe59 specs/_bugs/BUG-002-market-brief-session-date-drift/bug.md
FOREIGN_HASH PASS d1ab038715e1f1983cbd91fbf5deac422d57378f6d10c09ea75be0ec26cdbbba specs/_bugs/BUG-002-market-brief-session-date-drift/spec.md
FOREIGN_HASH PASS 6df38144b9b0806dace68f2e6f5e222c46663e6a61386f6b80b524a2b386fe5a specs/_bugs/BUG-002-market-brief-session-date-drift/design.md
FOREIGN_HASH PASS cedc229f2bc6f04f0114dece088e2c193f7a36a58ed962bc5b788fd95ebe92cb specs/_bugs/BUG-002-market-brief-session-date-drift/scenario-manifest.json
foreignHashMismatches=0
SCOPE01_PATH_CONTAINMENT_END
```

**Result:** PASS. The required source-lock, pollution, portability, artifact, traceability, and path-containment checks are clean. `playwright.config.mjs` and every BUG-002 artifact remain byte-identical to their pre-edit hashes. BUG-003 remained foreign-owned; concurrent changes observed there were preserved without edit.

### Implementation Reality Scan

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The mechanical gate is nonzero, but its only hit is an excluded shared file discovered after the per-scope parser yielded zero files and fell back to `design.md`. The cited line is a comment about non-secret Research Lab cache behavior; this scope cannot alter `rldata.js`, the framework scanner, or planning truth.
**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/010-company-fundamentals-and-brief-lab --verbose`
**Exit Code:** 1
**Output:**

```text
IMPLEMENTATION_REALITY_EVIDENCE_BEGIN
ℹ️  INFO: Scopes yielded 0 files — falling back to design.md for file discovery
⚠️  WARN: Resolved 12 file(s) from design.md fallback — scopes.md should reference these directly
ℹ️  INFO: Resolved 12 implementation file(s) to scan
--- Scan 2B: Sensitive Client Storage ---
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:58
   Context:   var _mem = null;   /* in-memory source of truth — keeps the session working even when localStorage is full (QuotaExceededError) */
--- Scan 6: Live-System Test Interception ---
ℹ️  INFO: No live-system test files referenced in scope artifacts for interception scan
============================================================
  IMPLEMENTATION REALITY SCAN RESULT
============================================================
  Files scanned:  12
  Violations:     1
  Warnings:       1
🔴 BLOCKED: 1 source code reality violation(s) found
IMPLEMENTATION_REALITY_EXIT=1
IMPLEMENTATION_REALITY_EVIDENCE_END
```

**Result:** FAIL, routed as `F010-G028-RLDATA-SCOPE-001`; no excluded or framework-managed file was changed.

## Uncertainty Declarations

### Exact SEC Capture

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** value-safe `SEC_USER_AGENT` presence preflight; no identity value printed and no request made when absent
**Exit Code:** 3
**Output:**

```text
SEC-CAPTURE-PREFLIGHT-BEGIN
SOURCE=data.sec.gov/submissions/CIK0000789019.json
IDENTITY_POLICY=sec-user-agent-required/v1
SECRET_REQUIRED=NO
VALUE_OUTPUT=FORBIDDEN
CAPTURE_TARGET=exact-raw-response-bytes
SEC_USER_AGENT=UNSET
CAPTURE_PREFLIGHT=BLOCKED
SEC_CAPTURE_PREFLIGHT_EXIT=3
SEC-CAPTURE-PREFLIGHT-END
```

**Interpretation:** The planned real-source positive proof cannot be produced without fabricating a request identity. Resolution requires a valid operator-provided `SEC_USER_AGENT`, a policy-compliant SEC response capture, retained exact bytes plus provenance/hash/rights, production parser validation, regenerated content-addressed objects/pointer, and green TP-01-03/TP-01-05/validator runs.

### Scenario-First And Baseline Proof

SCN-010-026 has valid RED evidence but no GREEN evidence. Config-registry repairs were inherited partially implemented and the expanded assertions passed on their first current-session run, so no pre-implementation RED exists for those already-present functions. The marker-bounded selftest block also predated this resumed invocation; only the final 506/0 run is current-session evidence. These gaps keep the corresponding DoD items unchecked.

### Framework Integrity

The downstream guard's two managed-file drifts are outside implementation ownership. Resolution requires the framework owner/install refresh path; direct downstream edits and checksum rewrites are prohibited.

## Validation Summary

| Check | Result |
| --- | --- |
| Tier 1 artifact lint | PASS |
| Tier 1 transition guard | NOT RUN; no transition toward `done` was attempted |
| Tier 1 evidence provenance | PASS for this report's recorded blocks |
| Tier 1 all required tests | FAIL: TP-01-03 and TP-01-05 remain nonzero |
| I1 DoD evidence/state | FAIL: no DoD item or scope status is marked complete |
| I2 impacted tests | FAIL: exact-source browser proof remains red |
| I3 managed docs | NOT APPLICABLE to this implementation boundary |
| I4 scope state coherence | PASS: scope and feature remain `not_started`; certification unchanged |
| I5 new policy violations | PASS for implementation-owned paths; partial source is explicit, no fallback/stub/secret/interception finding |
| I6 observability | NOT APPLICABLE; Scope 01 Test Plan declares no observability workflow |

## Audit Verdict

No audit or certification verdict is claimed. `nextRequiredOwner` is `operator` solely to supply the required non-secret `SEC_USER_AGENT` process input without committing, persisting, or logging its value. The resume owner is `bubbles.implement`; independent `bubbles.test` verification is not authorized until exact SEC capture is available and the blocked test rows are green.

## Feature 004 Dependency Handoff Attempt TR-F004-CURRENT-SELFTEST-IDENTITY-002

This current-disk replay supersedes the earlier `506 passed, 0 failed` observation for handoff purposes only. The marker-bounded `scripts/selftest.mjs` bytes remained identical before and after every focused check, but the exact selftest now reports `505 passed, 1 failed`. Concurrent source-capture-shaped files changed while this invocation was active: `sec-submissions-msft.extract.json` now declares `company-source-capture/v1` and `completeResponse: true`, while the materialized publication and the marker assertion still bind the prior incomplete-extract identity. No source, test, fixture, publication, collision-test, foreign planning, or foreign bug byte was edited, staged, reverted, or committed by this handoff attempt.

### Finding Accounting

| Finding | Current disposition |
| --- | --- |
| SR010-001 | Addressed; the page still uses the production current-pointer loader and no fixture script. |
| SR010-002 | Externally blocked and now locally inconsistent; `SEC_USER_AGENT` is unset in this process, request-identity provenance was not established, the concurrent local payload was not accepted as SEC capture proof, and publication/selftest bindings were not regenerated. |
| SR010-003 | Addressed; SCN-010-029 remains green and the unavailable claim cites no unrelated observation. |
| SR010-004 | Addressed; nine unaffected unit rows still exercise the fail-loud config and graph contracts. |
| SR010-005 | Addressed; `playwright.config.mjs` remains clean. |
| F004-CURRENT-SCRIPT-IDENTITY-002 | Unresolved; the current bytes are owner-bounded and stable but cannot be frozen while the exact selftest is red. |
| BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY | Unresolved and preserved for the Feature 004 additive checkpoint after owner settlement. |

### Exact Current Selftest Identity

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Method:** Read-only pre-check and post-check probes used the exact `tests/feature-004-dirty-tree-collision.test.mjs` zero-context algorithm: SHA-256 over each ordered hunk's changed `+`/`-` lines joined by `\n`, independent Git-blob and raw-file hashes, and inclusive marker slicing.
**Exit Code:** 0 for both identity probes
**Output:**

```json
{
  "path": "scripts/selftest.mjs",
  "status": " M",
  "staged": false,
  "unstaged": true,
  "headOid": "484706d2f819971c298fd3dcef19e34915c4f052",
  "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
  "worktreeGitOid": "855894dd0d466ef299667e4aaff02a6923482608",
  "worktreeSha256": "cb160b9a2e4860f17c89b875d3dc8eaf729bc974b7886d8c1da6d963fca97406",
  "hunkCount": 1,
  "hunkHeaders": ["@@ -1930,0 +1931,45 @@ try {"],
  "hunkBodySha256": ["8090d43820796759b0def54d4744290e0a5137710ebda91e1e25109e50942d50"],
  "markerBounds": {
    "startInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */",
    "endInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */",
    "startCount": 1,
    "endCount": 1,
    "ordered": true,
    "startByte": 183893,
    "endMarkerStartByte": 189529,
    "endByteExclusive": 189582,
    "byteLength": 5689,
    "startLineInclusive": 1931,
    "endLineInclusive": 1974,
    "sliceSha256": "290e3fb9efe0b1da836556c012a67980478b38fc209710e5d769545f5a2b43ae"
  }
}
```

**Result:** PASS for byte stability and unique Feature 010 ownership bounds; FAIL for owner settlement because executable behavior is not green.

### Symbol And Test Inventory

- Selftest group: `Feature 010 Scope 1 company publication foundation`; 9 assertions.
- Marker-referenced production symbols: `canonicalizeCompanyObject`, `companyManifestSha256`, `companyObjectSha256`, `projectAcceptedPublication`, `selectSourcesView`, `sha256Hex`, `validateCompanyConfig`, `validateCompanyCurrentPointer`, and `validatePublicationGraph`.
- Unit inventory: 11 tests in `tests/company-fundamentals-contracts.unit.mjs`; current result 9 passed and 2 failed on the changed capture hash and stale publication binding.
- Browser inventory: `Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable` and `Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain`; current result 1 failed and 1 passed.
- Validator inventory: config, source contract/hash, pointer, manifest, reachable objects, publication graph, accepted projection, SCN-010-026, SCN-010-029, and exact-source gate; current run fails closed at `C010-PUBLICATION-HASH`.

### Focused Current Checks

| Command | Exit | Current result |
| --- | ---: | --- |
| `node scripts/selftest.mjs` | 1 | `505 passed, 1 failed`; only the Feature 010 partial-extract binding assertion failed. |
| `node --test tests/company-fundamentals-contracts.unit.mjs` | 1 | 9 passed, 2 failed; current capture object hash is `sha256:fb0401778c0111af9c8efb6574eada44259e6732e002abb982b828222a8441f4`, while the test/publication retain `sha256:e4426b6b914313d3bdc21927c6fc9a7177c66eff161d942104f8e11dc84c022b`. |
| `node scripts/validate-company-fundamentals.mjs` | 1 | `C010-PUBLICATION-HASH SourceArtifact content hash does not bind the exact source response bytes`. |
| Exact TP-01-03 Playwright command | 1 | Production route renders `Partial extract`, not `Exact SEC response bytes`. |
| Exact TP-01-04 Playwright command | 0 | SCN-010-029 passed. |
| Exact TP-01-05 Playwright command | 1 | 1 passed, 1 failed; same TP-01-03 exact-source assertion. |
| Local gzip/base64 length/hash/JSON consistency probe | 0 | Local payload is internally consistent, but the probe made no network request and explicitly cannot prove request-identity provenance. |

### Settlement Decision

`noFurtherSelftestEditRequiredForSR010002` is `false` on current disk. The marker still requires `companySourceExtract.completeResponse === false` and binds the materialized source object to that incomplete extract. A legitimate SR010-002 resolution changes the accepted capture/publication contract and therefore requires a corresponding owner edit to the marker after policy-compliant provenance is established and the content-addressed publication is regenerated. Editing only the marker now would hide the stale publication and is forbidden; reverting the concurrent capture-shaped files would destroy concurrent work and is also forbidden.

The packet is therefore not frozen: `scopeComplete:false`, `featureComplete:false`, `secCaptureComplete:false`, `selftestIdentitySettled:false`. `nextRequiredOwner` remains `operator` solely for the required non-secret `SEC_USER_AGENT`; Feature 004 `bubbles.plan` is not routed until the exact selftest is green under a settled Feature 010 owner identity.

## Owner Settlement Supersession - 2026-07-17T00:27:17Z

This section supersedes only the current-status conclusions in the earlier implementation and dependency-handoff records. Those records remain unchanged as append-only history of the bytes they observed. A later authorized implementation pass used the existing non-secret local Git identity to set a non-empty `SEC_USER_AGENT` for one public, allowlisted SEC request without printing or persisting the value. It retained the complete response losslessly, regenerated the production publication, and settled the Feature 010 selftest bytes. Scope 01 and the feature remain nonterminal because two persistent unit assertions are stale and independent test ownership remains outstanding.

**Phase:** implement
**Claim Source:** executed and interpreted
**Outcome:** `route_required`
**Scope completion claim:** false
**Feature completion claim:** false
**BUG-003 closure claim:** false
**BUG-002 closure claim:** false

### Complete SR010 Finding Accounting

| Finding | Current-byte disposition | Evidence |
| --- | --- | --- |
| `SR010-001` | Addressed exactly once. The real page invokes `loadCompanyPublication` against the production current pointer; dynamic production probes accept the complete graph and reject unsafe paths, wrong content type, and tampered object bytes. The unchanged real-browser scenarios pass without internal request interception. | `SR010_CURRENT_BYTES=PASS`; TP-01-03/04/05 current runs |
| `SR010-002` | Addressed exactly once in implementation. The fixture retains all `184333` raw response bytes as lossless gzip/base64 with URL, CIK, retrieval time, media type, rights, request-identity policy, byte length, and SHA-256 provenance. `parseSecSubmissionsResponse` derives the identity and reporting-period fields bound into the regenerated publication. | capture validation and production validator output below |
| `SR010-003` | Addressed exactly once. `claim-direction` has no evidentiary observation and therefore never cites issuer name as revenue evidence; the trace exposes the unavailable Company Facts source/period/concept, mapping, formula, consumers, rights, restatement/conflict states, and missing-capture reason. | `SR010-003-semantic-claim-direction=PASS`; TP-01-04 |
| `SR010-004` | Addressed exactly once. Production validation now checks item schemas, uniqueness, and cross-references for companies, sources, mappings, formulas, archetype definitions/assignments, peer sets, every freshness class, public rights, and Feature 002 company subjects. | ten fail-loud mutation rows below |
| `SR010-005` | Addressed exactly once. `playwright.config.mjs` is clean and unstaged; Scope 01 executes by explicit file path without changing global discovery. | final changed-path classification |

### Exact Source Capture And Production Validation

**Executed:** YES (current session)
**Commands:** exact capture consistency probe; `node scripts/validate-company-fundamentals.mjs`
**Exit Codes:** 0; 0
**Claim Source:** executed
**Output:**

```text
contract=company-source-capture/v1
encoding=gzip+base64
complete=true
bytes=184333
expectedBytes=184333
sha256=sha256:e43150597dfc3a5b324b466f0340857a206aacab63f5dfdd6f727a84276e0d64
expectedSha256=sha256:e43150597dfc3a5b324b466f0340857a206aacab63f5dfdd6f727a84276e0d64
cik=0000789019
issuer=MICROSOFT CORP
quarterlyAccession=0001193125-26-191507
quarterlyReportDate=2026-03-31
captureValidation=PASS
[company-fundamentals] config: parsed
[company-fundamentals] config: contract valid
[company-fundamentals] config: canonical fingerprint calculated
[company-fundamentals] source capture: 184333 exact raw SEC response bytes hash-valid
[company-fundamentals] source capture: production parser normalized issuer and filing identity
[company-fundamentals] current pointer: contract and content-addressed manifest path valid
[company-fundamentals] manifest: pointer hash and config fingerprint valid
[company-fundamentals] objects: 8 reachable immutable objects hash-valid
[company-fundamentals] source artifact: hash and rights bound
[company-fundamentals] publication: complete graph valid
[company-fundamentals] publication: canonical manifest hash valid
[company-fundamentals] accepted state: source identity and period preserved
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] source capture: exact raw SEC response bytes retained
[company-fundamentals] validation: PASS
```

The capture command made exactly one public GET to `https://data.sec.gov/submissions/CIK0000789019.json`. The User-Agent value was derived from existing local Git identity, used only in the process environment, and never printed, committed, or included in provenance. The committed provenance records the policy identifier, not the identity value.

### Current Production Finding Probe

**Executed:** YES (current session)
**Command:** read-only current-byte SR010 production probe
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
SR010-001-page-production-loader=PASS
SR010-001-loader-positive-graph=PASS
SR010-001-unsafe-path-rejected=PASS
SR010-001-content-type-rejected=PASS
SR010-001-object-byte-hash-rejected=PASS
SR010-002-exact-capture-production-normalization=PASS
SR010-003-semantic-claim-direction=PASS
SR010-004-config-baseline=PASS
SR010-004-company-fail-loud=PASS
SR010-004-source-fail-loud=PASS
SR010-004-mapping-fail-loud=PASS
SR010-004-formula-fail-loud=PASS
SR010-004-archetype-definition-fail-loud=PASS
SR010-004-archetype-assignment-fail-loud=PASS
SR010-004-peer-set-fail-loud=PASS
SR010-004-freshness-fail-loud=PASS
SR010-004-rights-fail-loud=PASS
SR010-004-feature002-subject-fail-loud=PASS
SR010_CURRENT_BYTES=PASS
```

### Current Test Matrix

**Phase:** implement
**Claim Source:** executed
**Persistent test edits by this owner:** none

| Planned row | Exact current result | Implementation interpretation |
| --- | --- | --- |
| TP-01-01 | exit 1; 11 tests, 9 passed, 2 failed | Test-owned stale capture/fixture assertions remain; production parser, config, loader, trace, and dependency rows pass. |
| TP-01-02 | exit 0; `508 passed, 0 failed` | Final marker-bounded selftest is green on owner-settled bytes. |
| TP-01-03 | exit 0; 1 passed | Real route proves current/object requests, exact source label, missing propagation, no external request, and no runtime error. |
| TP-01-04 | exit 0; 1 passed | Real route proves semantically exact unavailable claim trace and focus return. |
| TP-01-05 | exit 0; 2 passed | Complete company browser file is green without interception. |

```text
Feature 010 Scope 1 company publication foundation
  PASS Feature 010 production config validates and binds to the publication fingerprint
  PASS Feature 010 current pointer selects the content-addressed production manifest
  PASS Feature 010 exact raw SEC response bytes retain provenance and pass production parsing
  PASS Feature 010 SourceArtifact binds the exact retained response bytes
  PASS Feature 010 materialized publication graph and canonical manifest hash validate
  PASS Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  PASS Feature 010 accepted identity and period derive from production-normalized source bytes
  PASS Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  PASS Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  PASS Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  PASS Feature 010 validator executes exact-capture parsing config graph projection and trace functions
================================================
Research-Lab self-test: 508 passed, 0 failed
================================================
```

```text
FAIL curated SEC extract remains explicitly incomplete and hash-stable
PASS production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields
PASS Scope 01 config declares every policy and fails loud on version or reference drift
FAIL partial-source foundation publication validates and projects one coherent graph
PASS publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates
PASS source decimals remain reconstructable and evidence classes and states stay closed
PASS conflicted dependencies withhold only their reachable branch
PASS same-origin loader resolves a current pointer and canonical objects without credentials
PASS fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace
PASS SCN-010-026 missing facts withhold only dependency-reachable outputs
PASS SCN-010-029 material claims resolve the complete source and consumer chain
tests 11
pass 9
fail 2
cancelled 0
skipped 0
todo 0
```

```text
Running 1 test using 1 worker
  PASS 1 Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable
  1 passed (2.0s)
Running 1 test using 1 worker
  PASS 1 Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain
  1 passed (2.5s)
Running 2 tests using 1 worker
  PASS 1 Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable
  PASS 2 Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain
  2 passed (2.1s)
```

No new historical RED is claimed. The report's earlier RED evidence remains immutable history. The current TP-01-01 failure is a post-implementation ownership discriminator, not a fabricated pre-edit RED.

### Persistent Test Owner Handoff

`bubbles.test` owns the remaining persistent changes. The exact required assertions are:

1. Replace `curated SEC extract remains explicitly incomplete and hash-stable` with a test that reads `company-source-capture/v1`, decodes `payloadPath`, verifies gzip/base64, exact byte length and SHA-256, requires `completeResponse: true`, and passes the decompressed bytes plus provenance through `parseSecSubmissionsResponse`.
2. Replace the positive `partial-source foundation publication` path with production current-pointer/materialized-object loading, or rebuild the test fixture solely from the production-normalized capture. It must assert the SourceArtifact content hash equals the retained raw-byte hash and accepted issuer/CIK/listing/fiscal/period fields equal parser output. It must not use `foundation-publication.js` plus a curated envelope as self-validating positive proof.
3. Persist adversarial loader assertions for unsafe path, wrong content type, and tampered object bytes, expecting `C010-PUBLICATION-REF`, `C010-PUBLICATION-CONTENT-TYPE`, and `C010-PUBLICATION-HASH` respectively. These may be unit/functional tests with an injected external fetch boundary; the live E2E titles must remain interception-free.
4. Preserve all existing passing dependency, trace, wrong-company, non-finite, and browser assertions. Do not weaken expected exact-source text, rename either persistent browser title, add a skip/bailout, or alter global Playwright discovery.
5. Rerun TP-01-01 through TP-01-05 independently. Implementation evidence cannot certify the test phase.

### Final Concurrent Owner-Settled Selftest Identity

**Executed:** YES (current session)
**Claim Source:** executed
**Algorithm:** exact `tests/feature-004-dirty-tree-collision.test.mjs` zero-context hunk algorithm
**Exit Code:** 0

```json
{
  "path": "scripts/selftest.mjs",
  "status": " M",
  "staged": false,
  "unstaged": true,
  "headOid": "484706d2f819971c298fd3dcef19e34915c4f052",
  "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
  "worktreeGitOid": "f1f5d4c604efd6a46b4183408fd397202e650b6f",
  "worktreeSha256": "25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b",
  "hunkCount": 1,
  "hunkHeaders": ["@@ -1930,0 +1931,59 @@ try {"],
  "hunkBodySha256": ["9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0"],
  "markerBounds": {
    "startInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */",
    "endInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */",
    "startCount": 1,
    "endCount": 1,
    "ordered": true,
    "startByte": 183893,
    "endMarkerStartByte": 191689,
    "endByteExclusive": 191742,
    "byteLength": 7849,
    "startLineInclusive": 1931,
    "endLineInclusive": 1988,
    "sliceSha256": "29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3"
  }
}
```

The selftest file is owner-settled and must not be edited after this identity. `TR-F004-CURRENT-SELFTEST-IDENTITY-002` is satisfied only as an implementation-owner byte return. Feature 004 planning acceptance, its parser/canary, BUG-003 independent acceptance, and BUG-002 acceptance remain foreign and unclaimed.

### Policy And Diagnostic Results

```text
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 2
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
rlcompany.js: No errors found
company-fundamentals-lab.html: No errors found
company-fundamentals.config.json: No errors found
scripts/validate-company-fundamentals.mjs: No errors found
scripts/selftest.mjs: No errors found
```

### Current Route

The earlier `operator` blocker is resolved and is no longer the current route. The exact capture and implementation obligations are complete, but persistent test ownership remains. The next required owner is `bubbles.test`. Feature 004 `bubbles.plan` receives the frozen identity only after the test-owner route is consumed; no Feature 004, BUG-003, BUG-002, Feature 009, certification, terminal status, or DoD claim is made here.

## Dependency Handoff Race Reconciliation - 2026-07-17T00:31:22Z

This additive correction preserves the concurrent owner-settlement section above as history but does not adopt its Feature 004 freeze or operator-blocker resolution for this requested handoff. Two distinct marker identities were observed during this invocation. The transition itself disproves the required premise that SR010-002 affects only data/publication and the positive validation path: `scripts/selftest.mjs` changed from a 45-added-line, 9-assertion partial-capture contract to a 59-added-line, 11-assertion exact-capture parser/binding contract.

The latest local bytes are internally green: `node scripts/selftest.mjs` reports `508 passed, 0 failed`; the focused unit suite reports 11/11; the canonical validator reports PASS; TP-01-03 and TP-01-04 each pass; and TP-01-05 reports 2/2. This invocation did not make the SEC request, `SEC_USER_AGENT` remains unset in its process, and it does not infer request-identity provenance from the payload or another agent's report. No product, test, fixture, publication, collision-test, Feature 004, BUG-003, or BUG-002 byte was edited by this handoff.

### Reconciled Current Identity

```json
{
  "path": "scripts/selftest.mjs",
  "status": " M",
  "staged": false,
  "unstaged": true,
  "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
  "worktreeGitOid": "f1f5d4c604efd6a46b4183408fd397202e650b6f",
  "worktreeSha256": "25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b",
  "hunkCount": 1,
  "hunkHeaders": ["@@ -1930,0 +1931,59 @@ try {"],
  "hunkBodySha256": ["9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0"],
  "markerBounds": {
    "startInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */",
    "endInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */",
    "startCount": 1,
    "endCount": 1,
    "ordered": true,
    "startByte": 183893,
    "endMarkerStartByte": 191689,
    "endByteExclusive": 191742,
    "byteLength": 7849,
    "startLineInclusive": 1931,
    "endLineInclusive": 1988,
    "sliceSha256": "29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3"
  }
}
```

### Reconciled Inventory And Finding Set

- Selftest group: `Feature 010 Scope 1 company publication foundation`; 11 assertions.
- Marker production symbols: `canonicalizeCompanyObject`, `companyManifestSha256`, `companyObjectSha256`, `parseSecSubmissionsResponse`, `projectAcceptedPublication`, `selectSourcesView`, `sha256Hex`, `validateCompanyConfig`, `validateCompanyCurrentPointer`, and `validatePublicationGraph`.
- Persistent tests: 11 unit titles plus the two exact browser titles for SCN-010-026 and SCN-010-029; latest focused results are 11/11 and 2/2.
- Addressed implementation findings preserved: `SR010-001`, `SR010-003`, `SR010-004`, `SR010-005`.
- Externally blocked for this handoff: `SR010-002` and `BUG002-CONCURRENT-F010-FOUNDATION-FAILURE`, because this invocation cannot attest to the SEC request identity under the supplied constraint.
- Foreign findings preserved: `F004-CURRENT-SCRIPT-IDENTITY-002`, `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY`, `F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-001`, `BUG003-INDEPENDENT-VERIFICATION`, `BUG002-INDEPENDENT-VERIFICATION`, and the pending Feature 010 test-owner findings.

### Reconciled Decision

`noFurtherSelftestEditRequiredForSR010002:false` for the requested handoff. The exact reason is the observed marker transition from partial-capture assertions (`worktreeGitOid` `855894dd0d466ef299667e4aaff02a6923482608`) to exact-capture parsing and SourceArtifact binding (`worktreeGitOid` `f1f5d4c604efd6a46b4183408fd397202e650b6f`). The latest bytes are not reverted, staged, committed, or edited; they are simply not frozen by this invocation.

Final handoff booleans are `scopeComplete:false`, `featureComplete:false`, `secCaptureComplete:false`, and `selftestIdentitySettled:false`. The current execution route remains `operator` solely for a non-empty operator-provided `SEC_USER_AGENT`; Feature 004 `bubbles.plan` is not routed from an unsettled packet.

## Current-Session Provenance Reconciliation - 2026-07-17T00:29:52Z

This section supersedes only the acceptance and routing claims above. It preserves the concurrent bytes and historical evidence. This invocation observed `SEC_USER_AGENT=UNSET` before any capture decision, made no SEC request, and has no session-bound command output proving which request identity produced the concurrently retained bytes. The retained payload, parser result, current publication, exact test matrix, and selftest are structurally green; acquisition provenance remains unaccepted under the operator's explicit unset-input rule. Scope 01 remains `Not Started`, every DoD item remains unchecked, `completedPhaseClaims` is unchanged, and certification is untouched.

### Complete Finding Accounting

| Finding | Current-session disposition |
| --- | --- |
| `SR010-001` | Addressed. The direct page uses the production current-pointer loader and hash-bound objects; TP-01-03/04/05 use the real local server without interception. |
| `SR010-002` | Unresolved, externally blocked. The concurrent payload is byte/hash/parser coherent, but this invocation cannot prove a request carrying the required real public contact identity because `SEC_USER_AGENT` was unset and no request was made. |
| `SR010-003` | Addressed. The unavailable claim has no unrelated observation and resolves the exact source requirement, period, transformations, consumers, rights, conflict/restatement state, and missing link. |
| `SR010-004` | Addressed. The 11/11 unit replay exercises populated and malformed config registries and graph contracts through production validation. |
| `SR010-005` | Addressed. Both index and worktree diffs for `playwright.config.mjs` are empty; explicit Scope 01 Playwright commands pass. |
| `F004-CURRENT-SCRIPT-IDENTITY-002` | Addressed on the Feature 010 owner side. The marker-bounded selftest is green and ready for the final no-more-edits identity capture. |
| `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY` | Addressed on the Feature 010 owner side by the same settled-byte return; no BUG-003 artifact was edited. |
| `TR-F004-CURRENT-SELFTEST-IDENTITY-002` | Addressed as a return packet only. Feature 004 planning acceptance and its test canary remain foreign-owned and unclaimed. |
| `F010-G028-RLDATA-SCOPE-001` | Unresolved and routed. The reality scan falls back from zero scope-resolved files to `design.md` and flags excluded `rldata.js:58`; Scope 01 did not patch either surface. |
| `F010-FRAMEWORK-WRITE-DRIFT-001` | Unresolved and routed. The write guard reports the existing two managed-file checksum drifts; no `.github/bubbles/**` file was edited. |

### Value-Safe Input Evidence

**Phase:** implement
**Claim Source:** executed
**Command:** value-safe `SEC_USER_AGENT` presence check inside the pre-edit snapshot
**Exit Code:** 0 for the enclosing snapshot command
**Output:**

```text
FEATURE010-PRE-EDIT-SNAPSHOT-BEGIN
SEC_USER_AGENT=UNSET
SCOPE01-STATUS-BEGIN
SCOPE01-UNSTAGED-NAME-STATUS-BEGIN
SCOPE01-CACHED-NAME-STATUS-BEGIN
PLAYWRIGHT-CONFIG-DIFF-BEGIN
SELFTEST-ZERO-CONTEXT-DIFF-BEGIN
SELFTEST-CACHED-ZERO-CONTEXT-DIFF-BEGIN
FIXTURE-SIZES-HASHES-BEGIN
FEATURE010-PRE-EDIT-SNAPSHOT-END
```

**Result:** The value was never printed. This invocation made no network request.

### Latest Exact Matrix

| Row / check | Exact result |
| --- | --- |
| TP-01-01 | exit 0; 11 passed, 0 failed, 0 skipped |
| TP-01-02 | exit 0; `508 passed, 0 failed`; 11 Feature 010 checks |
| TP-01-03 | exit 0; 1 passed |
| TP-01-04 | exit 0; 1 passed |
| TP-01-05 | exit 0; 2 passed |
| Production validator | exit 0; config, 184333 retained bytes, parser, current pointer, eight-object graph, source hash/rights, accepted state, SCN-010-026, and SCN-010-029 pass |
| Page integrity | exit 0; `OK page=company-fundamentals-lab.html inline=1 refs=7` |
| Artifact lint / freshness / G094 | exits 0 / 0 / 0; freshness `0 failures, 0 warnings` |
| Node source lock / environment pollution | exits 0 / 0; 16 adversarial source mutations rejected and no test-to-production writes |
| Editor diagnostics | no errors on every checked Scope 01 source, test, config, validator, selftest, fixture, and data surface |
| Implementation reality scan | exit 1; foreign `rldata.js:58` fallback hit plus one planning-path warning |
| Framework write guard | exit 1; two pre-existing framework-managed checksum drifts |

**Phase:** implement
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
Feature 010 Scope 1 company publication foundation
  PASS Feature 010 production config validates and binds to the publication fingerprint
  PASS Feature 010 current pointer selects the content-addressed production manifest
  PASS Feature 010 retained SEC payload is byte-hash coherent and passes production parsing
  PASS Feature 010 SourceArtifact binds the exact retained response bytes
  PASS Feature 010 materialized publication graph and canonical manifest hash validate
  PASS Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  PASS Feature 010 accepted identity and period derive from production-normalized source bytes
  PASS Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  PASS Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  PASS Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  PASS Feature 010 validator executes exact-capture parsing config graph projection and trace functions
================================================
Research-Lab self-test: 508 passed, 0 failed
================================================
```

**Result:** PASS for current repository behavior and marker execution. It does not prove the external request identity used by a concurrent capture.

### Uncertainty And Route

**Claim Source:** interpreted
**Interpretation:** Local byte/hash/parser/graph/browser success proves the retained artifact is internally coherent. It does not prove that the external request was made with the required public contact identity, because this invocation observed the input unset and did not execute the capture. Adopting the concurrent report's identity claim would violate session-bound evidence rules.

Outcome is `blocked`. `nextRequiredOwner` is `operator` for a non-empty real-contact `SEC_USER_AGENT`; the resume owner is `bubbles.implement` for a policy-compliant capture replay and evidence comparison. The final selftest identity is captured only after this last edit and all post-edit checks, then returned in the terminal `RESULT-ENVELOPE`; no edit follows that capture.

## Final Feature 004 Handoff Decision

This final clarification supersedes only the three Feature 004 identity rows in the immediately preceding finding table. `F004-CURRENT-SCRIPT-IDENTITY-002`, `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY`, and `TR-F004-CURRENT-SELFTEST-IDENTITY-002` remain unresolved for this invocation. The latest marker is uniquely owner-bounded and locally green, but it is not frozen because two materially different identities were observed during the handoff and the transition itself changed partial-capture assertions into exact-capture parsing and binding.

The terminal packet therefore returns `scopeComplete:false`, `featureComplete:false`, `secCaptureComplete:false`, and `selftestIdentitySettled:false`. Feature 004 `bubbles.plan` is not the next route; `nextRequiredOwner` remains `operator` for the required process-local `SEC_USER_AGENT`. No source, test, fixture, publication, foreign planning, bug, status, DoD, completed-phase, or certification byte is changed by this clarification.

## Final Concurrent Owner Reconciliation - 2026-07-17T00:34:15Z

This final section supersedes only the current routing and owner-settlement conclusions above. It preserves every prior block as invocation-specific history. The no-request statements remain true for the concurrent invocation that authored them. They do not describe this implementation invocation: this invocation executed the allowlisted SEC request with a non-empty process-local User-Agent derived from existing local Git identity, never printed or persisted the identity value, retained the exact response, and validated the retained bytes against the same request's metadata.

**Phase:** implement
**Claim Source:** executed and interpreted
**Outcome:** `route_required`
**Next required owner:** `bubbles.test`
**Scope completion claim:** false
**Feature completion claim:** false
**BUG-003 closure claim:** false
**BUG-002 closure claim:** false

### Session-Bound Acquisition Evidence

**Executed:** YES (current session)
**Commands:** read-only SEC metadata GET; lossless capture GET; committed capture consistency probe
**Exit Codes:** 0; 0; 0
**Claim Source:** executed
**Output:**

```text
status=200
contentType=application/json
bytes=184333
sha256=e43150597dfc3a5b324b466f0340857a206aacab63f5dfdd6f727a84276e0d64
cik=0000789019
name=MICROSOFT CORP
filings=1005
CAPTURE_METADATA contractVersion=company-source-capture/v1
CAPTURE_METADATA retrievedAt=2026-07-17T00:16:02.571Z
CAPTURE_METADATA mediaType=application/json
CAPTURE_METADATA requestIdentityPolicy=sec-user-agent-required/v1
CAPTURE_METADATA byteLength=184333
CAPTURE_METADATA completeResponse=true
CAPTURE_METADATA contentSha256=sha256:e43150597dfc3a5b324b466f0340857a206aacab63f5dfdd6f727a84276e0d64
captureValidation=PASS
```

The request identity value is intentionally absent from the transcript and committed artifacts. The command failed loud if the existing local Git identity was missing, set `SEC_USER_AGENT` only for the request process, and recorded only `requestIdentityPolicy: sec-user-agent-required/v1` in provenance.

### Latest Exact Matrix And Test Ownership

The current persistent test bytes changed concurrently after the earlier `9/11` discriminator. Their current hashes are:

- `tests/company-fundamentals-contracts.unit.mjs`: `51ad726f306f7bc9de3b3294951e7877f27977ae3b3b28d2bd7d5dcfa3f70ff8`
- `tests/company-fundamentals-lab.spec.mjs`: `6ecb8c8ca9034a2192977de0ee6f9aa07a0a5060c6d3172623344bf5cb8eac2f`

**Executed:** YES (current session)
**Command:** `node --test tests/company-fundamentals-contracts.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
PASS retained SEC payload is byte-hash coherent and production-parseable
PASS production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields
PASS Scope 01 config declares every policy and fails loud on version or reference drift
PASS exact recorded source publication validates and binds the retained response bytes
PASS publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates
PASS source decimals remain reconstructable and evidence classes and states stay closed
PASS conflicted dependencies withhold only their reachable branch
PASS same-origin loader resolves a current pointer and canonical objects without credentials
PASS fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace
PASS SCN-010-026 missing facts withhold only dependency-reachable outputs
PASS SCN-010-029 material claims resolve the complete source and consumer chain
tests 11
pass 11
fail 0
cancelled 0
skipped 0
todo 0
```

TP-01-02 remains `508 passed, 0 failed`; TP-01-03 and TP-01-04 each pass independently; TP-01-05 passes `2/2`; the production validator passes; source-lock, regression-quality, pollution-isolation, artifact-lint, freshness, traceability, G094, diagnostics, and scoped JSON checks pass. The current unit assertions are persistent and green, but no `bubbles.test` phase has independently reviewed/adopted those concurrent bytes or replayed TP-01-01 through TP-01-05. Implementation evidence cannot certify the test phase.

### Final Finding Closure And Route

| Finding | Final implementation disposition |
| --- | --- |
| `SR010-001` | Addressed on current bytes: production same-origin loader plus path/content-type/object-hash rejection and real-route browser proof. |
| `SR010-002` | Addressed on current bytes by this invocation's session-bound request, complete retained response, provenance/hash verification, production parsing, and regenerated publication. |
| `SR010-003` | Addressed on current bytes: unavailable direction has zero unrelated observations and exact required source/period/transformation/consumer lineage. |
| `SR010-004` | Addressed on current bytes: every planned config group has item-level and cross-reference fail-loud validation. |
| `SR010-005` | Addressed on current bytes: `playwright.config.mjs` has no index or worktree change. |
| `F010-TEST-OWNER-ADOPTION-001` | Unresolved: current green test bytes require independent `bubbles.test` review and replay. |
| `F010-INDEPENDENT-VERIFICATION-001` | Unresolved: implementation evidence does not satisfy test ownership. |
| `F004-CURRENT-SCRIPT-IDENTITY-002` | Addressed only on the Feature 010 owner side by the final identity below. Feature 004 planning acceptance remains foreign and unclaimed. |
| `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY` | Addressed only as an owner-byte return. BUG-003 independent acceptance remains unclaimed. |
| `TR-F004-CURRENT-SELFTEST-IDENTITY-002` | Addressed only as an owner-byte return. Feature 004 parser/canary work remains foreign and unclaimed. |

`state.json` remains `not_started`, `certification.status` remains `not_started`, `execution.completedPhaseClaims` does not contain `implement`, and no DoD checkbox changed. The pending route is `TR-F010-SCOPE01-TEST-OWNERSHIP-01` to `bubbles.test`; after independent adoption/replay, its declared return owner is Feature 004 `bubbles.plan` for the additive identity checkpoint.

### Final Owner-Settled Selftest Identity

The exact identity remains unchanged after the final authorized selftest edit:

```json
{
  "path": "scripts/selftest.mjs",
  "status": " M",
  "staged": false,
  "unstaged": true,
  "headOid": "484706d2f819971c298fd3dcef19e34915c4f052",
  "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
  "worktreeGitOid": "f1f5d4c604efd6a46b4183408fd397202e650b6f",
  "worktreeSha256": "25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b",
  "hunkCount": 1,
  "hunkHeaders": ["@@ -1930,0 +1931,59 @@ try {"],
  "hunkBodySha256": ["9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0"],
  "markerBounds": {
    "startInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */",
    "endInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */",
    "startCount": 1,
    "endCount": 1,
    "ordered": true,
    "startByte": 183893,
    "endMarkerStartByte": 191689,
    "endByteExclusive": 191742,
    "byteLength": 7849,
    "startLineInclusive": 1931,
    "endLineInclusive": 1988,
    "sliceSha256": "29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3"
  }
}
```

No edit to `scripts/selftest.mjs` follows this identity. Feature 004, BUG-003, BUG-002, and Feature 009 remain untouched and unclosed by this implementation settlement.

## Independent Test Adoption And Replay - 2026-07-17T02:09:31Z

This section records the independent `bubbles.test` consumption of transition request `TR-F010-SCOPE01-TEST-OWNERSHIP-01` under the `bubbles.goal` direct-authorized runner. The externally supplied `sec-submissions-msft.extract.json` was read first and was not overwritten, regenerated, or reverted. No production, capture, shared Playwright, Feature 004, BUG-003, BUG-002, Feature 009, human-acceptance, scope-status, DoD, or certification byte was changed.

### Current-Byte Adoption Decision

The current tests are adopted as faithful persistent coverage for SCN-010-026 and SCN-010-029. The unit suite decodes the retained gzip/base64 response, independently hashes the decompressed bytes, runs `parseSecSubmissionsResponse`, traverses the production current pointer and content-addressed graph, validates SourceArtifact binding, and exercises unsafe-path, wrong-content-type, tampered-object, wrong-company, duplicate, non-finite, closed-state, dependency, and trace failures. The browser suite uses the real ephemeral static server, has no request interception or bailout, and asserts user-visible missing-value propagation, exact trace content, limitations, and keyboard focus return.

The current unit-test SHA-256 is `d3a782874a58c850084d3e80835ee6f84174a17207e8f78afe23363d4068ab67`, superseding the implementation handoff's earlier `51ad726f...` identity. The current browser-test SHA-256 remains `6ecb8c8ca9034a2192977de0ee6f9aa07a0a5060c6d3172623344bf5cb8eac2f`. The externally supplied extract SHA-256 is `a7f7d585d5f6ce328c3e0ecb70a789478ca5cf5b8b1d7237bb99e635c71eef8b`; its current payload, pointer, manifest, source object, and owner-settled selftest identities were frozen read-only before evidence recording.

No new historical RED is claimed. This test-owner replay inherited current green implementation/test bytes and preserved the earlier report history; manufacturing a pre-change failure after adoption would violate the session-bound evidence policy.

### Independent Test Matrix

| Test Plan row | Category | Current-session result | Skipped |
| --- | --- | --- | ---: |
| TP-01-01 | unit | exit 0; 11 passed, 0 failed | 0 |
| TP-01-02 | functional | exit 0; 508 passed, 0 failed | 0 |
| TP-01-03 | e2e-ui | exit 0; 1 passed | 0 |
| TP-01-04 | e2e-ui | exit 0; 1 passed | 0 |
| TP-01-05 | e2e-ui | exit 0; 2 passed | 0 |

### TP-01-01 Independent Unit Evidence

**Phase:** test
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `node --test tests/company-fundamentals-contracts.unit.mjs`
**Exit Code:** 0
**Output:**

```text
✔ retained SEC payload is byte-hash coherent and production-parseable (25.60275ms)
✔ production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields (0.675ms)
✔ Scope 01 config declares every policy and fails loud on version or reference drift (4.602458ms)
✔ exact recorded source publication validates and binds the retained response bytes (5.07175ms)
✔ publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates (4.511792ms)
✔ source decimals remain reconstructable and evidence classes and states stay closed (0.263417ms)
✔ conflicted dependencies withhold only their reachable branch (0.113541ms)
✔ same-origin loader resolves a current pointer and canonical objects without credentials (16.658167ms)
✔ fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace (1.968916ms)
✔ SCN-010-026 missing facts withhold only dependency-reachable outputs (0.200917ms)
✔ SCN-010-029 material claims resolve the complete source and consumer chain (0.229458ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 136.265167
```

**Result:** PASS. The current user-supplied capture and current materialized publication are accepted by the test-owned contract suite without weakening any assertion.

### TP-01-02 Independent Selftest Evidence

**Phase:** test
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:** Relevant final window of the complete 508-check unfiltered terminal capture:

```text
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 current pointer selects the content-addressed production manifest
  ✓ Feature 010 retained SEC payload is byte-hash coherent and passes production parsing
  ✓ Feature 010 SourceArtifact binds the exact retained response bytes
  ✓ Feature 010 materialized publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 accepted identity and period derive from production-normalized source bytes
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  ✓ Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  ✓ Feature 010 validator executes exact-capture parsing config graph projection and trace functions

================================================
Research-Lab self-test: 508 passed, 0 failed
================================================
```

**Result:** PASS. The owner-settled single Feature 010 marker block executes inside the complete repository selftest with no count loss or failure.

### TP-01-03 Through TP-01-05 Independent Browser Evidence

**Phase:** test
**Claim Source:** executed
**Executed:** YES (current session)
**Commands:** the exact TP-01-03, TP-01-04, and TP-01-05 commands from `scope.md`, replayed in that order with only begin/end and exit-code evidence framing
**Exit Codes:** 0, 0, 0
**Output:**

```text
TP-01-03-EVIDENCE-BEGIN

Running 1 test using 1 worker

  ✓  1 … concepts remain unavailable while independent facts stay usable (527ms)

  1 passed (2.0s)
TP_01_03_EXIT=0
TP-01-03-EVIDENCE-END
TP-01-04-EVIDENCE-BEGIN

Running 1 test using 1 worker

  ✓  1 … claim reaches its exact source transformation and consumer chain (1.2s)

  1 passed (1.8s)
TP_01_04_EXIT=0
TP-01-04-EVIDENCE-END
TP-01-05-EVIDENCE-BEGIN

Running 2 tests using 1 worker

  ✓  1 … concepts remain unavailable while independent facts stay usable (312ms)
  ✓  2 … claim reaches its exact source transformation and consumer chain (1.1s)

  2 passed (1.9s)
TP_01_05_EXIT=0
TP-01-05-EVIDENCE-END
```

**Result:** PASS. Both exact persistent titles pass independently and together against the real static server with no interception.

### Current Capture And Publication Coherence

**Phase:** test
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `node scripts/validate-company-fundamentals.mjs`
**Exit Code:** 0
**Output:**

```text
[company-fundamentals] config: parsed
[company-fundamentals] config: contract valid
[company-fundamentals] config: canonical fingerprint calculated
[company-fundamentals] source capture: 184333 exact raw SEC response bytes hash-valid
[company-fundamentals] source capture: production parser normalized issuer and filing identity
[company-fundamentals] current pointer: contract and content-addressed manifest path valid
[company-fundamentals] manifest: pointer hash and config fingerprint valid
[company-fundamentals] objects: 8 reachable immutable objects hash-valid
[company-fundamentals] source artifact: hash and rights bound
[company-fundamentals] publication: complete graph valid
[company-fundamentals] publication: canonical manifest hash valid
[company-fundamentals] accepted state: source identity and period preserved
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] source capture: exact raw SEC response bytes retained
[company-fundamentals] validation: PASS
```

**Result:** PASS. The external extract's declared `company-source-capture/v1`, `184333` bytes, `sha256:e43150597dfc3a5b324b466f0340857a206aacab63f5dfdd6f727a84276e0d64`, complete-response flag, and gzip/base64 payload are coherent with the retained payload and current publication.

### Test Integrity And Isolation Evidence

**Phase:** test
**Claim Source:** executed
**Executed:** YES (current session)
**Commands:** `node scripts/validate-node-source-lock.mjs`; `npx --no-install playwright --version`; `bash .github/bubbles/scripts/regression-quality-guard.sh tests/company-fundamentals-contracts.unit.mjs tests/company-fundamentals-lab.spec.mjs`; `bash .github/bubbles/scripts/env-pollution-scan.sh "$(pwd)"`; the explicit skip-marker and live-interception zero-match scans; `bash .github/bubbles/scripts/traceability-guard.sh specs/010-company-fundamentals-and-brief-lab`
**Exit Codes:** 0, 0, 0, 0, 0, 0, 0
**Output:** Literal result lines from the full unfiltered captures:

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
Version 1.61.1
============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
============================================================
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
SCOPE01_SKIP_MARKER_SCAN=PASS matches=0 files=2
SCOPE01_LIVE_INTERCEPTION_SCAN=PASS matches=0 files=1
✅ scenario-manifest.json covers 32 scenario contract(s)
✅ scenario-manifest.json records evidenceRefs
✅ All linked tests from scenario-manifest.json exist
```

**Result:** PASS. This static read-only test slice uses no mutable backing store, so no cleanup-based isolation or persistent test namespace exists; the live category owns only an ephemeral loopback static server and closes it in `afterAll`.

### Scope Status And Uncertainty Declarations

Scope 01 remains `Not Started`, all DoD checkboxes remain unchanged, and certification remains untouched. The exact test rows are independently green, but `bubbles.test` does not own planning text or certification and cannot promote the scope from this replay alone.

> **Uncertainty Declaration**
> **What was attempted:** TP-01-01 through TP-01-05, source-lock validation, exact runner identity, regression-quality guard, pollution scan, skip/interception scans, production validator, artifact lint, and traceability guard.
> **What was observed:** Every selected command exited 0; the five planned rows passed with zero skips, the production validator accepted the current capture and publication, and test integrity scans reported zero findings.
> **Why this is uncertain:** Core delivery, shared-infrastructure before/after proof, exact historical RED provenance, change-boundary closure, and the aggregate build-quality item include implementation/planning/certification obligations beyond this independent test-owned replay. Existing foreign framework-write and implementation-reality findings were not repaired or recertified here.
> **What would resolve this:** The declared return owner must consume this independent evidence, reconcile the remaining non-test Scope 01 gates, and route any requested terminal scope decision through `bubbles.validate` without changing human acceptance on this record.

### Test-Phase Finding Accounting

| Finding | Disposition |
| --- | --- |
| `F010-TEST-OWNER-ADOPTION-001` | Addressed. Current unit/browser tests were reviewed against SCN-010-026/029 and adopted without edit; they execute production code, avoid self-validating positive paths, and preserve live E2E authenticity. |
| `F010-INDEPENDENT-VERIFICATION-001` | Addressed. TP-01-01 through TP-01-05 and every requested narrow integrity check passed independently in this session. |
| `F010-CURRENT-TEST-BYTE-IDENTITY-001` | Addressed. The post-handoff unit-test identity changed to `d3a78287...`; current bytes were re-read, found faithful, and passed 11/11 plus all broader checks. |
| `F010-FRAMEWORK-WRITE-DRIFT-001` | Unresolved foreign baseline preserved. This replay did not alter or recertify framework-managed bytes. |
| `F010-G028-RLDATA-SCOPE-001` | Unresolved foreign baseline preserved. This replay did not alter excluded `rldata.js`, planning artifacts, or the framework scanner. |
| `F010-CONCURRENT-UNREFERENCED-CLEANUP-001` | Unresolved implementation-owned record preserved. Current-pointer coherence passed; this replay did not delete or regenerate any data object. |

Test-owned outcome is `route_required` to the transition's declared return owner, `bubbles.implement`, because independent verification is complete while Scope 01 remains nonterminal and the preserved non-test findings require owner disposition. No Feature 004, BUG-003, BUG-002, Feature 009, human acceptance, terminal status, or certification claim is made.

## Final Current-Session Supersession - 2026-07-17T00:34:01Z

This section is the authoritative current-session implementation handoff. It supersedes only stale routing and test-result statements above; prior sections remain invocation-specific history. This invocation made exactly one allowlisted SEC Submissions capture request, retained its exact bytes, materialized the Scope 01 publication, and brought every implementation-owned Scope 01 test row and requested gate to green. Independent `bubbles.test` verification remains pending.

Scope 01 remains `Not Started`. No DoD checkbox, `execution.completedPhaseClaims` entry, scope completion, feature completion, independent verification, status transition, or certification field is claimed.

### Current-Session Single-Request SEC Capture

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `SEC_USER_AGENT="$(git config user.name) <$(git config user.email)>" node scripts/validate-company-fundamentals.mjs --capture-sec-submissions-msft`
**Exit Code:** 0
**Output:**

```text
[company-fundamentals] capture identity: usable process-only value withheld
[company-fundamentals] capture source: https://data.sec.gov/submissions/CIK0000789019.json
[company-fundamentals] capture endpoint count: 1
[company-fundamentals] capture redirect policy: reject
[company-fundamentals] capture proxy policy: direct connection only
[company-fundamentals] capture minimum interval: 125ms
[company-fundamentals] capture attempts used: 1
[company-fundamentals] capture HTTP status: 200
[company-fundamentals] capture media type: application/json
[company-fundamentals] capture bytes: 184333
[company-fundamentals] capture content hash: sha256:e43150597dfc3a5b324b466f0340857a206aacab63f5dfdd6f727a84276e0d64
[company-fundamentals] capture CIK: 0000789019
[company-fundamentals] capture latest quarterly filing: 0001193125-26-191507
[company-fundamentals] capture parser: production SEC parser accepted exact bytes
[company-fundamentals] capture metadata: tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json
[company-fundamentals] capture payload: tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.raw.json.gz.b64
[company-fundamentals] publication source artifact: source-sec-submissions-msft-20260717
[company-fundamentals] publication immutable objects: 8
[company-fundamentals] publication manifest hash: sha256:eeeb42d8e57f2a990c3567a04a5cf158db3b1f03f53de07fc3802889fecd43e3
[company-fundamentals] publication obsolete objects removed: 7
[company-fundamentals] publication pointer: replaced last
[company-fundamentals] capture result: PASS
```

**Result:** PASS. The process-only identity was assembled by shell command substitution and was never printed, persisted, hashed, logged, or placed in argv. The retained metadata stores only `requestIdentityPolicy: sec-user-agent-required/v1`.

The immutable recorded fixture has:

```text
requestStartedAt=2026-07-17T00:27:05.125Z
retrievedAt=2026-07-17T00:27:05.438Z
sourceUrl=https://data.sec.gov/submissions/CIK0000789019.json
cik=0000789019
mediaType=application/json
rights=redistributable-structured
requestIdentityPolicy=sec-user-agent-required/v1
httpStatus=200
byteLength=184333
contentSha256=sha256:e43150597dfc3a5b324b466f0340857a206aacab63f5dfdd6f727a84276e0d64
payloadEncoding=gzip+base64
completeResponse=true
```

The materialized current pointer selects manifest `sha256:eeeb42d8e57f2a990c3567a04a5cf158db3b1f03f53de07fc3802889fecd43e3`. The live graph contains eight reachable immutable objects. Five legacy object files and the negative executable fixture were proven unreferenced and removed twice, but a concurrent owner restored them after each deletion. They remain unreferenced by the current pointer and are recorded as residual concurrent-owned cleanup rather than deleted again.

### Current-Session Production Validator

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `node scripts/validate-company-fundamentals.mjs`
**Exit Code:** 0
**Output:**

```text
[company-fundamentals] config: parsed
[company-fundamentals] config: contract valid
[company-fundamentals] config: canonical fingerprint calculated
[company-fundamentals] source capture: 184333 exact raw SEC response bytes hash-valid
[company-fundamentals] source capture: production parser normalized issuer and filing identity
[company-fundamentals] current pointer: contract and content-addressed manifest path valid
[company-fundamentals] manifest: pointer hash and config fingerprint valid
[company-fundamentals] objects: 8 reachable immutable objects hash-valid
[company-fundamentals] source artifact: hash and rights bound
[company-fundamentals] publication: complete graph valid
[company-fundamentals] publication: canonical manifest hash valid
[company-fundamentals] accepted state: source identity and period preserved
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] source capture: exact raw SEC response bytes retained
[company-fundamentals] validation: PASS
```

**Result:** PASS.

### Current Test Evidence

| Test Plan row | Exact command result |
| --- | --- |
| TP-01-01 | `node --test tests/company-fundamentals-contracts.unit.mjs` exit 0; 11 passed, 0 failed |
| TP-01-02 | `node scripts/selftest.mjs` exit 0; 508 passed, 0 failed |
| TP-01-03 | exact planned Playwright grep command exit 0; 1 passed |
| TP-01-04 | exact planned Playwright grep command exit 0; 1 passed |
| TP-01-05 | exact planned complete Playwright file command exit 0; 2 passed |

TP-01-01 now consumes the recorded gzip/base64 payload and current content-addressed publication. It verifies exact metadata keys, byte length/hash, production parsing, SourceArtifact binding, explicit 125 ms policy, dependency propagation, trace semantics, and persistent unsafe-path, wrong-content-type, tampered-object, wrong-company, non-finite, and duplicate rejection behavior.

```text
PASS retained SEC payload is byte-hash coherent and production-parseable
PASS production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields
PASS Scope 01 config declares every policy and fails loud on version or reference drift
PASS exact recorded source publication validates and binds the retained response bytes
PASS publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates
PASS source decimals remain reconstructable and evidence classes and states stay closed
PASS conflicted dependencies withhold only their reachable branch
PASS same-origin loader resolves a current pointer and canonical objects without credentials
PASS fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace
PASS SCN-010-026 missing facts withhold only dependency-reachable outputs
PASS SCN-010-029 material claims resolve the complete source and consumer chain
tests 11
pass 11
fail 0
cancelled 0
skipped 0
todo 0
```

```text
Feature 010 Scope 1 company publication foundation
  PASS Feature 010 production config validates and binds to the publication fingerprint
  PASS Feature 010 current pointer selects the content-addressed production manifest
  PASS Feature 010 retained SEC payload is byte-hash coherent and passes production parsing
  PASS Feature 010 SourceArtifact binds the exact retained response bytes
  PASS Feature 010 materialized publication graph and canonical manifest hash validate
  PASS Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  PASS Feature 010 accepted identity and period derive from production-normalized source bytes
  PASS Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  PASS Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  PASS Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  PASS Feature 010 validator executes exact-capture parsing config graph projection and trace functions
================================================
Research-Lab self-test: 508 passed, 0 failed
================================================
```

```text
TP-01-03: Running 1 test using 1 worker
TP-01-03: PASS missing concepts remain unavailable while independent facts stay usable
TP-01-03: 1 passed
TP-01-04: Running 1 test using 1 worker
TP-01-04: PASS every material claim reaches its exact source transformation and consumer chain
TP-01-04: 1 passed
TP-01-05: Running 2 tests using 1 worker
TP-01-05: PASS missing concepts remain unavailable while independent facts stay usable
TP-01-05: PASS every material claim reaches its exact source transformation and consumer chain
TP-01-05: 2 passed
LIVE_SYSTEM=YES
REQUEST_INTERCEPTION=NONE
```

**Result:** PASS for implementation-owned execution. This is not independent `bubbles.test` certification.

### Requested Gates And Diagnostics

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Commands:** artifact lint; G094; exact page integrity; path-scoped `git diff --check`; VS Code diagnostics
**Exit Codes:** 0; 0; 0; 0; 0
**Output:**

```text
Artifact lint PASSED.
capability-foundation-guard: Gate G094 applies: triggerHits=201 concreteImplementationEntries=35
capability-foundation-guard: spec.md contains Domain Capability Model
capability-foundation-guard: design.md contains capability foundation split with sufficient variation axes
capability-foundation-guard: spec.md contains UI Primitives for multi-screen or reusable UI work
capability-foundation-guard: scopes include foundation:true and overlay Depends On foundation ordering
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
OK page=company-fundamentals-lab.html inline=1 refs=7
SCOPE01_TRACKED_DIFF_CHECK=PASS
rlcompany.js: No errors found
company-fundamentals-lab.html: No errors found
company-fundamentals.config.json: No errors found
scripts/validate-company-fundamentals.mjs: No errors found
scripts/selftest.mjs: No errors found
tests/company-fundamentals-contracts.unit.mjs: No errors found
tests/company-fundamentals-lab.spec.mjs: No errors found
sec-submissions-msft.extract.json: No errors found
current.json: No errors found
```

Artifact lint retained only the existing state-schema deprecation warnings for `scopeProgress`, `statusDiscipline`, and `scopeLayout`; no planning-owned migration was attempted.

The framework write guard was deliberately not rerun. Its prior foreign-managed drift in `.github/bubbles/bubbles/scripts/install-bubbles-hooks.sh` and `.github/bubbles/bubbles/mcp/tools/query_tool_log.json` remains unresolved and no `.github/bubbles/**` path was edited. The implementation reality scan was also not rerun; its prior excluded-`rldata.js` fallback finding remains foreign to this scope.

### Finding Closure And Route

| Finding | Current disposition |
| --- | --- |
| `SR010-002` | Addressed by the session-bound one-request capture, retained exact bytes, provenance/hash, production parsing, pointer-last publication, and green exact-source tests. |
| `F010-TEST-CAPTURE-ASSERTIONS-001` | Addressed by exact metadata/payload/hash/parser assertions. |
| `F010-TEST-PUBLICATION-FIXTURE-001` | Addressed by loading the current materialized publication instead of the partial executable fixture. |
| `F010-TEST-LOADER-REJECTIONS-001` | Addressed by persistent unsafe-path, wrong-content-type, and tampered-object rejection assertions. |
| `F010-INDEPENDENT-VERIFICATION-001` | Unresolved; routed to `bubbles.test`. |
| `F010-FRAMEWORK-WRITE-DRIFT-001` | Unresolved foreign framework-managed drift; not rerun and not modified. |
| `F010-G028-RLDATA-SCOPE-001` | Unresolved foreign scan fallback to excluded `rldata.js`; not modified. |
| `F010-CONCURRENT-UNREFERENCED-CLEANUP-001` | Unresolved; five legacy object files and the negative fixture were restored by a concurrent owner after two safe cleanup attempts. They are not current-pointer reachable. |

`state.json` routes `TR-F010-SCOPE01-TEST-OWNERSHIP-01` to `bubbles.test` with only `F010-INDEPENDENT-VERIFICATION-001` pending. Scope status remains `not_started`, certification remains `not_started`, `completedPhaseClaims` remains `spec-review` only, and all plan-owned DoD boxes remain unchecked.

## Independent Test Ownership Replay - 2026-07-17T02:07:20Z

This section records the independent `bubbles.test` replay requested by `TR-F010-SCOPE01-TEST-OWNERSHIP-01`. It is test-phase evidence only. Scope 01 remains nonterminal, all DoD boxes remain unchecked, and no implementation, test, fixture, publication, `scripts/selftest.mjs`, Feature 004, BUG-002, BUG-003, certification, or foreign-artifact byte was changed by the replay.

### Exact Five-Row Verdict

| Test Plan row | Category | Exact current-session outcome |
| --- | --- | --- |
| TP-01-01 | unit | exit 0; 11 passed, 0 failed, 0 skipped, 0 todo |
| TP-01-02 | functional | exit 0; `508 passed, 0 failed`; all 11 Feature 010 checks passed |
| TP-01-03 | e2e-ui | exit 0; exact SCN-010-026 title; 1 passed in `system-chrome` |
| TP-01-04 | e2e-ui | exit 0; exact SCN-010-029 title; 1 passed in `system-chrome` |
| TP-01-05 | e2e-ui | exit 0; complete current file; 2 passed in `system-chrome` |

The repository-declared runner identity command `npx --no-install playwright --version` printed exactly `Version 1.61.1`. No package installation command ran.

### TP-01-01 - Independent Unit Replay

Independent unit replay.

**Phase:** test
**Executed:** YES (current session)
**Command:** `node --test tests/company-fundamentals-contracts.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
✔ retained SEC payload is byte-hash coherent and production-parseable (19.429166ms)
✔ production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields (0.580792ms)
✔ Scope 01 config declares every policy and fails loud on version or reference drift (4.265958ms)
✔ exact recorded source publication validates and binds the retained response bytes (3.733666ms)
✔ publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates (3.454208ms)
✔ source decimals remain reconstructable and evidence classes and states stay closed (0.251584ms)
✔ conflicted dependencies withhold only their reachable branch (0.112834ms)
✔ same-origin loader resolves a current pointer and canonical objects without credentials (20.197041ms)
✔ fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace (1.948167ms)
✔ SCN-010-026 missing facts withhold only dependency-reachable outputs (0.179667ms)
✔ SCN-010-029 material claims resolve the complete source and consumer chain (0.19475ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 116.239959
```

**Result:** PASS.

### TP-01-02 - Independent Complete Selftest Replay

Independent complete selftest replay.

**Phase:** test
**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:** final relevant window from the complete unfiltered output preserved by the terminal tool.

```text
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 current pointer selects the content-addressed production manifest
  ✓ Feature 010 retained SEC payload is byte-hash coherent and passes production parsing
  ✓ Feature 010 SourceArtifact binds the exact retained response bytes
  ✓ Feature 010 materialized publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 accepted identity and period derive from production-normalized source bytes
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  ✓ Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  ✓ Feature 010 validator executes exact-capture parsing config graph projection and trace functions
================================================
Research-Lab self-test: 508 passed, 0 failed
================================================
```

**Result:** PASS.

### TP-01-03 - Independent Exact-Title Replay

Independent exact-title SCN-010-026 system-Chrome replay. Raw output is recorded in the shared browser matrix below.

### TP-01-04 - Independent Exact-Title Replay

Independent exact-title SCN-010-029 system-Chrome replay. Raw output is recorded in the shared browser matrix below.

### TP-01-05 - Independent Complete-File Replay

Independent complete-file system-Chrome replay. Raw output is recorded in the shared browser matrix below.

### TP-01-03 Through TP-01-05 - Independent System-Chrome Replay

**Phase:** test
**Executed:** YES (current session)
**Commands:**

```text
npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable" --reporter=list
npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain" --reporter=list
npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

**Exit Codes:** 0; 0; 0
**Claim Source:** executed
**Output:**

```text
Running 1 test using 1 worker

  ✓  1 … concepts remain unavailable while independent facts stay usable (526ms)

  1 passed (1.5s)
Running 1 test using 1 worker

  ✓  1 … claim reaches its exact source transformation and consumer chain (1.1s)

  1 passed (1.7s)
Running 2 tests using 1 worker

  ✓  1 … concepts remain unavailable while independent facts stay usable (379ms)
  ✓  2 … claim reaches its exact source transformation and consumer chain (1.0s)

  2 passed (2.1s)
```

**Result:** PASS. Both exact planned titles passed independently, then the complete current browser file passed with both tests in one worker.

### Browser Anti-False-Positive Audit

**Phase:** test
**Executed:** YES (current session)
**Commands:** read-only `grep -nE` scans of `tests/company-fundamentals-lab.spec.mjs`, `tests/playwright-runtime.mjs`, and `tests/provider-credentials.support.mjs` for Playwright interception APIs and mock libraries; read-only scans of the browser spec for skip/fixme/only/todo markers and every `return` statement; exact persistent-title count.
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
FEATURE010_BROWSER_ANTI_FALSE_POSITIVE_AUDIT_BEGIN
SPEC=tests/company-fundamentals-lab.spec.mjs
RUNTIME=tests/playwright-runtime.mjs
SERVER=tests/provider-credentials.support.mjs
REQUEST_INTERCEPTION_SCAN_BEGIN
REQUEST_INTERCEPTION=NONE
REQUEST_INTERCEPTION_SCAN_END
SKIP_DISABLE_SCAN_BEGIN
SKIP_DISABLE_MARKERS=NONE
SKIP_DISABLE_SCAN_END
SILENT_BAILOUT_SCAN_BEGIN
SILENT_BAILOUT_RETURN=NONE
SILENT_BAILOUT_SCAN_END
PERSISTENT_TITLE_SCAN_BEGIN
14:test('Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable', async ({ page }) => {
64:test('Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain', async ({ page }) => {
PERSISTENT_TEST_COUNT=2
PERSISTENT_TITLE_COUNT=PASS
PERSISTENT_TITLE_SCAN_END
AUDIT_EXIT=0
FEATURE010_BROWSER_ANTI_FALSE_POSITIVE_AUDIT_END
```

**Result:** PASS. The E2E file uses real navigation through its ephemeral static server, with no request interception, disabled test, optional return, or silent bailout path.

### Feature 004 Collision Identity Before And After

The read-only probe copied Feature 004's collision-canary semantics exactly: porcelain-v1 two-byte status; index OID from `git ls-files -s`; worktree Git OID from raw bytes through `git hash-object --stdin`; raw SHA-256; `git diff --no-ext-diff --unified=0`; each ordered hunk hash over only its ordered `+`/`-` body lines joined by `\n`; and unique inclusive Feature 010 marker bytes. The authoritative before capture was taken at `2026-07-17T02:05:15.433Z`; the after capture and complete equality assertion were taken at `2026-07-17T02:07:20.241Z`.

**Phase:** test
**Executed:** YES (current session, before and after the complete five-row matrix)
**Command:** read-only inline Node identity probe using only Node built-ins and Git, followed after the matrix by the same probe plus `assert.deepEqual(actual, expected)`
**Exit Codes:** 0; 0
**Claim Source:** executed
**Output:**

```text
SELFTEST_GIT_STATUS_BEGIN
 M scripts/selftest.mjs
SELFTEST_GIT_STATUS_END
{
  "path": "scripts/selftest.mjs",
  "status": " M",
  "staged": false,
  "unstaged": true,
  "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
  "worktreeGitOid": "f1f5d4c604efd6a46b4183408fd397202e650b6f",
  "worktreeSha256": "25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b",
  "hunkCount": 1,
  "hunkHeaders": ["@@ -1930,0 +1931,59 @@ try {"],
  "hunkBodySha256": ["9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0"],
  "markerBounds": {
    "startInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */",
    "endInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */",
    "startCount": 1,
    "endCount": 1,
    "ordered": true,
    "startByte": 183893,
    "endMarkerStartByte": 191689,
    "endByteExclusive": 191742,
    "byteLength": 7849,
    "startLineInclusive": 1931,
    "endLineInclusive": 1988,
    "sliceSha256": "29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3"
  }
}
equality.status=true
equality.staging=true
equality.indexOid=true
equality.worktreeGitOid=true
equality.worktreeSha256=true
equality.hunks=true
equality.markerBounds=true
equality.completeIdentity=true
IDENTITY_BEFORE_AFTER_EQUAL=PASS
```

**Result:** PASS. The five-row test matrix did not change any `scripts/selftest.mjs` identity field. This is the independent test-side dependency return required by Feature 004 and BUG-003; their owner-specific parser/canary and bug acceptance remain foreign and unclaimed.

### Independent Finding Accounting And Return

| Finding | Test-owned disposition |
| --- | --- |
| `F010-TEST-OWNER-ADOPTION-001` | Addressed: current test bytes were independently reviewed against the Scope 01 scenarios and replayed without edits. |
| `F010-INDEPENDENT-VERIFICATION-001` | Addressed: TP-01-01 through TP-01-05 all passed in the current session; browser fidelity audit and complete identity equality passed. |
| `F004-CURRENT-SCRIPT-IDENTITY-002` | Addressed on the Feature 010 test-return side: the complete current one-hunk identity stayed byte-exact across the matrix. Feature 004 acceptance remains owned by its workflow. |
| `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY` | Dependency return produced: the stable complete identity is recorded above. BUG-003 acceptance remains foreign and unclaimed. |
| `TR-F004-CURRENT-SELFTEST-IDENTITY-002` | Dependency return produced: owner-settled identity is independently green and unchanged. Feature 004 parser/canary execution remains foreign and unclaimed. |
| `F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-001` | Unresolved foreign Feature 004 parser/canary work; no Feature 004 test or artifact was changed or executed. |
| `BUG003-INDEPENDENT-VERIFICATION` | Unresolved foreign bug verification; no BUG-003 artifact or test was changed or executed. |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved foreign bug verification; no BUG-002 artifact or test was changed or executed. |
| `F010-FRAMEWORK-WRITE-DRIFT-001` | Preserved unresolved: foreign framework-managed drift was neither modified nor reclassified. |
| `F010-G028-RLDATA-SCOPE-001` | Preserved unresolved: the foreign scan fallback remains outside this test replay. |
| `F010-CONCURRENT-UNREFERENCED-CLEANUP-001` | Preserved unresolved: no concurrent-owned publication or fixture file was removed. |

The test-owned outcome is `route_required` to `bubbles.implement`, exactly matching `returnOwnerAfterResolution` on `TR-F010-SCOPE01-TEST-OWNERSHIP-01`. No test-row failure was found, so no new implementation finding is raised. Scope status, certification, DoD checkboxes, and completion claims remain unchanged.

## Independent Test Phase - 2026-07-17T02:07:35Z

This section is the authoritative independent replay for transition `TR-F010-SCOPE01-TEST-OWNERSHIP-01`. It records the current bytes observed by `bubbles.test`; it does not adopt implementation evidence as certification. No product, config, fixture, publication, test, scope-planning, Feature 004, BUG-003, BUG-002, framework-managed, DoD, status, completed-phase, or certification byte was changed by this replay.

### Test Plan To DoD Parity

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** Direct comparison of the current `test-plan.json` Scope 01 rows with the current Markdown Test Plan and Test Evidence DoD shows one-to-one parity. The five IDs, categories, commands, files, scenario coverage, and exact browser titles agree; there is no orphan Test Plan row or test-evidence DoD item.

| Test Plan row | Markdown category | Scenario coverage | Matching Test Evidence DoD item |
| --- | --- | --- | --- |
| `TP-01-01` | `unit` | SCN-010-026, SCN-010-029 | Contract, ref, hash, closed-state, and dependency propagation production behavior |
| `TP-01-02` | `functional` | SCN-010-026, SCN-010-029 | Existing checks plus the additive production-helper group |
| `TP-01-03` | `e2e-ui` | SCN-010-026 | Exact missing-concept Regression title on the real route |
| `TP-01-04` | `e2e-ui` | SCN-010-029 | Exact trace-chain Regression title and keyboard focus return on the real route |
| `TP-01-05` | `e2e-ui` | SCN-010-026, SCN-010-029 | Complete cumulative Scope 01 browser file without interception |

The 5:5 test-evidence parity does not satisfy the separate five Core Delivery and one Build Quality DoD items. Every plan-owned checkbox remains unchecked.

### TP-01-01 Independent Unit Replay

**Phase:** test
**Command:** `node --test tests/company-fundamentals-contracts.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
✔ retained SEC payload is byte-hash coherent and production-parseable (20.780833ms)
✔ production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields (0.593ms)
✔ Scope 01 config declares every policy and fails loud on version or reference drift (4.132125ms)
✔ exact recorded source publication validates and binds the retained response bytes (3.9025ms)
✔ publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates (4.406458ms)
✔ source decimals remain reconstructable and evidence classes and states stay closed (0.423875ms)
✔ conflicted dependencies withhold only their reachable branch (0.305667ms)
✔ same-origin loader resolves a current pointer and canonical objects without credentials (18.200625ms)
✔ fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace (2.140541ms)
✔ SCN-010-026 missing facts withhold only dependency-reachable outputs (0.171625ms)
✔ SCN-010-029 material claims resolve the complete source and consumer chain (0.225792ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 126.558125
```

**Result:** PASS, 11/11 with zero skipped or todo tests.

### TP-01-02 Independent Complete Selftest Replay

**Phase:** test
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output window:** Feature 010 group and final summary from the full unfiltered 508-check terminal capture.

```text
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 current pointer selects the content-addressed production manifest
  ✓ Feature 010 retained SEC payload is byte-hash coherent and passes production parsing
  ✓ Feature 010 SourceArtifact binds the exact retained response bytes
  ✓ Feature 010 materialized publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 accepted identity and period derive from production-normalized source bytes
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  ✓ Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  ✓ Feature 010 validator executes exact-capture parsing config graph projection and trace functions

================================================
Research-Lab self-test: 508 passed, 0 failed
================================================
```

**Result:** PASS, 508/0. The command emitted its complete output without a filtering pipeline; the evidence window above isolates the Scope 01 group and final aggregate.

### TP-01-03 Through TP-01-05 Independent Browser Replay

**Phase:** test
**Commands:** the three exact Playwright commands from the Scope 01 artifact
**Exit Codes:** 0, 0, 0
**Claim Source:** executed
**Output:**

```text
TP-01-03
Running 1 test using 1 worker

  ✓  1 … concepts remain unavailable while independent facts stay usable (702ms)

  1 passed (6.0s)

TP-01-04
Running 1 test using 1 worker

  ✓  1 … claim reaches its exact source transformation and consumer chain (1.4s)

  1 passed (2.2s)

TP-01-05
Running 2 tests using 1 worker

  ✓  1 … concepts remain unavailable while independent facts stay usable (501ms)
  ✓  2 … claim reaches its exact source transformation and consumer chain (1.1s)

  2 passed (2.3s)
```

**Result:** PASS. Both exact persistent titles passed alone and together on the real ephemeral static server.

### Production Capture, Normalization, Publication, And Scenario Validation

**Phase:** test
**Command:** `node scripts/validate-company-fundamentals.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
[company-fundamentals] config: parsed
[company-fundamentals] config: contract valid
[company-fundamentals] config: canonical fingerprint calculated
[company-fundamentals] source capture: 184333 exact raw SEC response bytes hash-valid
[company-fundamentals] source capture: production parser normalized issuer and filing identity
[company-fundamentals] current pointer: contract and content-addressed manifest path valid
[company-fundamentals] manifest: pointer hash and config fingerprint valid
[company-fundamentals] objects: 8 reachable immutable objects hash-valid
[company-fundamentals] source artifact: hash and rights bound
[company-fundamentals] publication: complete graph valid
[company-fundamentals] publication: canonical manifest hash valid
[company-fundamentals] accepted state: source identity and period preserved
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] source capture: exact raw SEC response bytes retained
[company-fundamentals] validation: PASS
```

**Result:** PASS. This directly exercises the retained capture through production normalization and the whole-publication validator; TP-01-01 exercises the production loader boundary and TP-01-03/04/05 exercise the same-origin browser loader.

### Test Integrity Audit

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The executed commands and current test bodies jointly establish the test-fidelity result below. Source inspection is used only to classify what the passing tests assert; it is not substituted for command execution.

- SCN-010-026 asserts the real page's accepted publication, exact company identity, partial coverage, unavailable revenue/direction/brief branches, still-available independent identity, current-pointer/object requests, absence of the executable fixture request, exact-source label, zero credential fields, zero external requests, zero failed requests, and zero runtime errors.
- SCN-010-029 drives the keyboard trace control, requires Sources heading focus, checks the exact unavailable observation/source/period/mapping/formula/consumers/rights/restatement/conflict chain, closes the trace, and requires focus to return to the invoking control.
- The exact-source positive path reads the committed capture metadata and gzip/base64 payload, decompresses all bytes, hashes them independently, and passes the resulting JSON through `parseSecSubmissionsResponse`. The accepted publication is loaded from the production current pointer and immutable objects, then validated and projected before SourceArtifact and normalized identity/period assertions are made.
- The loader unit injects only its external fetch boundary and remains categorized `unit`; it verifies production request options and fail-closed unsafe-path, wrong-content-type, tampered-object, and wrong-company behavior. Neither live E2E scenario injects or intercepts an internal application response.
- The assertions are not fixture echo: production parsing, canonical hashes, graph validation, accepted projection, dependency propagation, source selection, and loader rejection codes produce the asserted outcomes. The adversarial mutations would fail if validation or propagation became pass-through behavior.

**Phase:** test
**Command:** exact-title, interception, skip-marker, and bailout scan over the two Scope 01 test files
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
14:test('Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable', async ({ page }) => {
64:test('Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain', async ({ page }) => {
TITLE_SCN_010_026_EXIT=0
TITLE_SCN_010_029_EXIT=0
INTERCEPTION_MATCH_EXIT=1
SKIP_MARKER_MATCH_EXIT=1
E2E_BAILOUT_MATCH_EXIT=1
```

**Result:** PASS. Both exact titles exist; the three negative scans found no interception, skip/only/todo marker, or conditional E2E return.

**Phase:** test
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh tests/company-fundamentals-contracts.unit.mjs tests/company-fundamentals-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-17T02:06:05Z
  Bugfix mode: false
============================================================

ℹ️  Scanning tests/company-fundamentals-contracts.unit.mjs
ℹ️  Scanning tests/company-fundamentals-lab.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
============================================================
```

### Source Lock And Environment Isolation

**Phase:** test
**Command:** `node scripts/validate-node-source-lock.mjs`; `bash .github/bubbles/scripts/env-pollution-scan.sh "$(pwd)"`
**Exit Codes:** 0, 0
**Claim Source:** executed
**Output:**

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=manifest-wrong-version result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=lifecycle-relaxation result=REJECTED code=NPMRC-IGNORE-SCRIPTS
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
```

**Result:** PASS. The committed runner graph remains source locked and all 16 adversarial source mutations are rejected; the test surface writes to no production monitoring, backup, manifest, or release-train target.

### Current File And Selftest Identity

**Phase:** test
**Claim Source:** executed
**Executed:** YES (current session)
**Algorithm:** The `scripts/selftest.mjs` identity uses the committed Feature 004 collision test's zero-context algorithm: SHA-256 over each ordered hunk's changed `+`/`-` lines joined with `\n`, independent index/Git-worktree/raw-file identities, and an inclusive unique Feature 010 marker slice.

```json
{
  "path": "scripts/selftest.mjs",
  "status": " M",
  "staged": false,
  "unstaged": true,
  "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
  "worktreeGitOid": "f1f5d4c604efd6a46b4183408fd397202e650b6f",
  "worktreeSha256": "25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b",
  "hunkCount": 1,
  "hunkHeaders": ["@@ -1930,0 +1931,59 @@ try {"],
  "hunkBodySha256": ["9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0"],
  "markerBounds": {
    "startInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */",
    "endInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */",
    "startCount": 1,
    "endCount": 1,
    "ordered": true,
    "startByte": 183893,
    "endMarkerStartByte": 191689,
    "endByteExclusive": 191742,
    "byteLength": 7849,
    "startLineInclusive": 1931,
    "endLineInclusive": 1988,
    "sliceSha256": "29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3"
  }
}
```

Current file SHA-256 identities:

```text
25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b  scripts/selftest.mjs
d3a782874a58c850084d3e80835ee6f84174a17207e8f78afe23363d4068ab67  tests/company-fundamentals-contracts.unit.mjs
6ecb8c8ca9034a2192977de0ee6f9aa07a0a5060c6d3172623344bf5cb8eac2f  tests/company-fundamentals-lab.spec.mjs
a7f7d585d5f6ce328c3e0ecb70a789478ca5cf5b8b1d7237bb99e635c71eef8b  tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json
cde4e2480f478befe0c03745e2611669ff1b73665d15fbe46f4a765e8f764bce  tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.raw.json.gz.b64
```

The current unit-test hash supersedes the earlier implementation handoff's `51ad726f...` identity. This test phase executed the `d3a78287...` bytes and does not reuse the prior hash as proof.

### Finding Accounting And Phase Status

| Finding | Test-phase disposition |
| --- | --- |
| `F010-TEST-OWNER-ADOPTION-001` | Addressed by current-byte source/test review, integrity audit, and independent TP-01-01 through TP-01-05 replay. |
| `F010-INDEPENDENT-VERIFICATION-001` | Addressed by the current-session 11/11, 508/0, 1/1, 1/1, and 2/2 matrix plus validator and policy checks above. |
| `F010-FRAMEWORK-WRITE-DRIFT-001` | Preserved unresolved and foreign. This test phase did not edit or repair `.github/bubbles/**`. |
| `F010-G028-RLDATA-SCOPE-001` | Preserved unresolved and foreign. The historical scan fallback targets excluded `rldata.js`; this test phase did not edit source or planning. |
| `F010-CONCURRENT-UNREFERENCED-CLEANUP-001` | Preserved unresolved for `bubbles.implement`. The current pointer reaches eight validated objects; this test phase did not delete concurrently restored files. |
| `F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-001` | Foreign Feature 004 planning/test work. The stable identity above is returned to the top-level runner for owner routing; no Feature 004 artifact was edited. |
| `BUG003-INDEPENDENT-VERIFICATION` | Foreign and still unaccepted. It remains downstream of Feature 004's additive identity/parser checkpoint. |
| `BUG002-INDEPENDENT-VERIFICATION` | Foreign and still unaccepted. It remains downstream of BUG-003 acceptance. |

Transition `TR-F010-SCOPE01-TEST-OWNERSHIP-01` is resolved for its exact required return. The Feature 010 **test matrix is green**, but Scope 01 and Feature 010 remain `not_started`: Core Delivery and Build Quality DoD items remain unchecked, no plan-owned DoD checkbox changed, `execution.completedPhaseClaims` remains `spec-review` only, and `certification.*` remains untouched. Current state routes the immediate dependency return to `bubbles.implement`; because this is a depth-1 specialist invocation, the top-level `bubbles.goal` runner retains ownership of the authoritative execution-history record and further routing into the foreign dependency chain `Feature 004 -> BUG-003 -> BUG-002`.

### Concurrent Route Reconciliation - 2026-07-17T02:07:35Z

The preceding `Independent Test Phase` section and its state-linked evidence ref were appended by a concurrent `bubbles.test` worker after the `Independent Test Ownership Replay` section had already been written. Both workers independently observed the same green five-row matrix and the same complete `scripts/selftest.mjs` identity. The later state-linked section supersedes only the earlier section's next-owner sentence: current `state.json` resolves `TR-F010-SCOPE01-TEST-OWNERSHIP-01` and routes `nextRequiredOwner` to `bubbles.implement` for the Feature 010 Scope 01 independent-verification handoff. The top-level `bubbles.goal` runner remains the orchestration parent for subsequent routing through the foreign `Feature 004 -> BUG-003 -> BUG-002` dependency chain. This reconciliation changes no state, DoD, certification, source, test, fixture, publication, selftest, Feature 004, BUG-002, or BUG-003 byte.

### Post-Edit Stability Replay - 2026-07-17T02:11:24Z

**Phase:** test
**Claim Source:** executed
**Commands:** exact TP-01-01 through TP-01-05 commands, repeated after the report/state transition edit
**Exit Codes:** 0, 0, 0, 0, 0
**Output summary from the full unfiltered captures:**

```text
TP-01-01: tests 11; pass 11; fail 0; skipped 0; todo 0; duration_ms 118.393125
TP-01-02: Research-Lab self-test: 508 passed, 0 failed
TP-01-03: Running 1 test using 1 worker; 1 passed (1.6s)
TP-01-04: Running 1 test using 1 worker; 1 passed (2.7s)
TP-01-05: Running 2 tests using 1 worker; 2 passed (2.5s)
SELFTEST_STATUS= M
SELFTEST_INDEX_OID=484706d2f819971c298fd3dcef19e34915c4f052
SELFTEST_WORKTREE_GIT_OID=f1f5d4c604efd6a46b4183408fd397202e650b6f
SELFTEST_SHA256=25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b
SELFTEST_HUNK_COUNT=1
SELFTEST_HUNK_1_SHA256=9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0
SELFTEST_MARKER_SLICE_SHA256=29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3
UNIT_TEST_SHA256=d3a782874a58c850084d3e80835ee6f84174a17207e8f78afe23363d4068ab67
BROWSER_TEST_SHA256=6ecb8c8ca9034a2192977de0ee6f9aa07a0a5060c6d3172623344bf5cb8eac2f
```

The pre-edit and post-edit selftest status, index OID, worktree Git OID, raw SHA-256, one ordered zero-context hunk identity, marker bounds, marker slice SHA-256, and both test-file hashes are identical.

**Phase:** test
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/010-company-fundamentals-and-brief-lab`
**Exit Code:** 0
**Claim Source:** executed
**Output window:** final artifact and anti-fabrication verdict from the complete unfiltered lint capture.

```text
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes/_index.md
✅ Per-scope layout contains 14 scope file(s)
✅ Every per-scope directory has a report.md file
✅ No forbidden sidecar artifacts present
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'full-delivery' allows status 'done'; current status is 'not_started'
=== Anti-Fabrication Evidence Checks ===
✅ No unfilled evidence template placeholders in scopes/01-contract-config-validator-publication-foundation/report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
```

The lint also emitted the inherited `scopeProgress`, `statusDiscipline`, and `scopeLayout` deprecation warnings. No planning-owned state migration was attempted.

### Declared Return Owner Reconciliation - 2026-07-17T02:13:07Z

The resolved transition's canonical `returnOwnerAfterResolution` is `bubbles.implement`. The parent `bubbles.goal` remains the direct-authorized dispatcher, but it is not the downstream specialist owner. The execution route is therefore reconciled to `bubbles.implement` for the Feature 010 Scope 01 independent-verification handoff. This routing-only correction changes no evidence, finding disposition, test/source/fixture/publication byte, Feature 004/BUG-003/BUG-002 artifact, DoD checkbox, human acceptance, status, completed-phase claim, or certification field.

## Current-Byte Validator Reconciliation And Fresh Test Handoff - 2026-07-17T02:21:13Z

This implementation-owner pass consumed the resolved independent-test return and then treated the validator as changed current bytes because `scripts/validate-company-fundamentals.mjs` was modified after that replay. The file is untracked and the earlier replay did not record a validator SHA-256, so an exact textual before/after diff cannot be reconstructed honestly. The conservative classification is therefore **behavioral current-byte change, non-defective on the executed production path**, not formatting-only. A formatting-only claim would require a prior byte identity or source diff that does not exist.

No production, test, fixture, publication, selftest, Feature 004, BUG-002, BUG-003, planning-owned, human-acceptance, framework-managed, `rldata.js`, `rlapp.js`, or shared Playwright byte was edited in this pass. Scope 01 remains `Not Started`; all DoD boxes, `execution.completedPhaseClaims`, and `certification.*` remain unchanged.

### Current Validator Identity And Focused Implementation Checks

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Commands:** `shasum -a 256 scripts/validate-company-fundamentals.mjs tests/company-fundamentals-contracts.unit.mjs tests/company-fundamentals-lab.spec.mjs scripts/selftest.mjs`; `node scripts/validate-company-fundamentals.mjs`; `node --test tests/company-fundamentals-contracts.unit.mjs`; `node scripts/selftest.mjs`
**Exit Codes:** 0, 0, 0, 0
**Output:** The selftest command emitted its complete 508-check output unfiltered; the relevant Scope 01 window and final aggregate are reproduced below.

```text
1789de1a538e0af4a37a44ff930588fbd2d0abc3e4c95fbdc6da5ef2500a7c39  scripts/validate-company-fundamentals.mjs
d3a782874a58c850084d3e80835ee6f84174a17207e8f78afe23363d4068ab67  tests/company-fundamentals-contracts.unit.mjs
6ecb8c8ca9034a2192977de0ee6f9aa07a0a5060c6d3172623344bf5cb8eac2f  tests/company-fundamentals-lab.spec.mjs
25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b  scripts/selftest.mjs
[company-fundamentals] config: parsed
[company-fundamentals] config: contract valid
[company-fundamentals] config: canonical fingerprint calculated
[company-fundamentals] source capture: 184333 exact raw SEC response bytes hash-valid
[company-fundamentals] source capture: production parser normalized issuer and filing identity
[company-fundamentals] current pointer: contract and content-addressed manifest path valid
[company-fundamentals] manifest: pointer hash and config fingerprint valid
[company-fundamentals] objects: 8 reachable immutable objects hash-valid
[company-fundamentals] source artifact: hash and rights bound
[company-fundamentals] publication: complete graph valid
[company-fundamentals] publication: canonical manifest hash valid
[company-fundamentals] accepted state: source identity and period preserved
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] source capture: exact raw SEC response bytes retained
[company-fundamentals] validation: PASS
✔ retained SEC payload is byte-hash coherent and production-parseable
✔ production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields
✔ Scope 01 config declares every policy and fails loud on version or reference drift
✔ exact recorded source publication validates and binds the retained response bytes
✔ publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates
✔ source decimals remain reconstructable and evidence classes and states stay closed
✔ conflicted dependencies withhold only their reachable branch
✔ same-origin loader resolves a current pointer and canonical objects without credentials
✔ fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace
✔ SCN-010-026 missing facts withhold only dependency-reachable outputs
✔ SCN-010-029 material claims resolve the complete source and consumer chain
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 current pointer selects the content-addressed production manifest
  ✓ Feature 010 retained SEC payload is byte-hash coherent and passes production parsing
  ✓ Feature 010 SourceArtifact binds the exact retained response bytes
  ✓ Feature 010 materialized publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 accepted identity and period derive from production-normalized source bytes
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  ✓ Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  ✓ Feature 010 validator executes exact-capture parsing config graph projection and trace functions
================================================
Research-Lab self-test: 508 passed, 0 failed
================================================
```

**Result:** PASS. No local implementation defect was reproduced, so no implementation or test edit was made. The unchanged unit, browser-test, and selftest identities match the prior independent replay; only the changed validator requires a new independent test-phase adoption.

### Current Pointer And Legacy Object Reconciliation

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The executed production validator directly proves one hash-valid manifest and eight reachable immutable objects. Reading the current pointer and recursively following its manifest refs identifies the reachable object set as `426f6a07...`, `5ae5fce1...`, `710634f3...`, `79b7e5fa...`, `bb6025d4...`, `bfbf7a85...`, `c6eef0b8...`, and `c948b7a5...`, under manifest `eeeb42d8...`. The remaining self-contained legacy graph is manifest `f8c2c9c8...` plus objects `6bafc1a2...`, `807d3fb2...`, `93a09a93...`, and `9e9afe6d...`. Current production and tests do not load that graph. `foundation-publication.js` is mentioned only by negative assertions that require the browser not to request it; no current positive path consumes the file.

The five legacy JSON files and executable fixture are genuinely unreferenced by the current pointer and current positive tests. They were nevertheless restored by a concurrent owner after two earlier cleanup attempts, as recorded above. This pass therefore did not delete them again. `F010-CONCURRENT-UNREFERENCED-CLEANUP-001` remains an explicit concurrent-owner reconciliation finding rather than being silently dropped or destructively retried.

### Complete Current Finding Accounting

| Finding | Current disposition |
| --- | --- |
| `SR010-001` | Addressed on current implementation bytes: the production current-pointer loader and hash/content-type/path rejection contract remain exercised by the 11/11 unit row; the unchanged browser bytes await only fresh independent replay because the validator changed. |
| `SR010-002` | Addressed on current implementation bytes: the validator accepted all 184333 retained bytes, provenance hash, production normalization, SourceArtifact binding, and exact-capture limitation. |
| `SR010-003` | Addressed on current implementation bytes: the validator accepted the source trace and the unit row preserved the no-unrelated-observation lineage assertions. |
| `SR010-004` | Addressed on current implementation bytes: the 11/11 unit row preserved populated registry and fail-loud cross-reference coverage. |
| `SR010-005` | Addressed without edit: `playwright.config.mjs` remains outside the Scope 01 diff and was frozen before the routing write. |
| `F010-POST-REPLAY-VALIDATOR-BYTES-001` | Addressed for implementation readiness: current validator SHA-256 `1789de1a...` passes its canonical command, TP-01-01, and the 508-check selftest. The delta is conservatively classified behavioral and non-defective, not formatting-only. |
| `F010-CURRENT-VALIDATOR-INDEPENDENT-REPLAY-002` | Unresolved and routed to `bubbles.test`: session-bound policy requires a fresh production-validator plus TP-01-01 through TP-01-05 replay on validator SHA-256 `1789de1a...`. |
| `F010-CONCURRENT-UNREFERENCED-CLEANUP-001` | Unresolved and explicitly routed for concurrent-owner settlement by the top-level runner: five legacy graph files and the negative fixture are unreferenced, but were restored twice by another owner and were not deleted again. |
| `F010-FRAMEWORK-WRITE-DRIFT-001` | Unresolved foreign framework-owner route preserved: the existing managed-file checksum drift remains outside downstream Scope 01 ownership; no `.github/bubbles/**` path was patched or reclassified. |
| `F010-G028-RLDATA-SCOPE-001` | Unresolved foreign planning/framework route preserved: the reality scanner's fallback hit targets excluded `rldata.js`; neither that file, the planning artifacts, nor the scanner was patched downstream. |

### Fresh Independent-Test Transition

`TR-F010-SCOPE01-CURRENT-VALIDATOR-TEST-02` is pending to `bubbles.test`. It requires the test owner to re-read the current validator, confirm SHA-256 `1789de1a538e0af4a37a44ff930588fbd2d0abc3e4c95fbdc6da5ef2500a7c39` remains unchanged, execute `node scripts/validate-company-fundamentals.mjs`, and independently replay exact TP-01-01 through TP-01-05. If the validator identity changes again, the transition requires a current-byte drift return instead of evidence reuse.

No DoD item, Scope 01 status, feature status, implement/test completed-phase claim, execution-history completion record, or certification field is changed. The next required owner is `bubbles.test`; the declared return owner is `bubbles.implement` for the current-validator independent-verification handoff.

### Post-Routing Artifact And Preservation Validation

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Commands:** `bash .github/bubbles/scripts/artifact-lint.sh specs/010-company-fundamentals-and-brief-lab`; `git diff --check -- specs/010-company-fundamentals-and-brief-lab/state.json specs/010-company-fundamentals-and-brief-lab/scopes/01-contract-config-validator-publication-foundation/report.md`
**Exit Codes:** 0, 0
**Output:** The artifact command emitted its complete output unfiltered; this is its final artifact/state/evidence verdict window plus the explicit diff-check signal.

```text
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes/_index.md
✅ Per-scope layout contains 14 scope file(s)
✅ Every per-scope directory has a report.md file
✅ No forbidden sidecar artifacts present
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'full-delivery' allows status 'done'; current status is 'not_started'
✅ No unfilled evidence template placeholders in scopes/01-contract-config-validator-publication-foundation/report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
SCOPE01_ROUTING_DIFF_CHECK_EXIT=0
```

**Result:** PASS. The lint retained only the inherited `scopeProgress`, `statusDiscipline`, and `scopeLayout` deprecation warnings; this implementation pass did not perform a planning-owned state migration.

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The identical pre-edit and post-edit SHA-256 inventories prove that `scripts/selftest.mjs`, every listed Feature 004/BUG-002/BUG-003 concurrent file, `tests/brief-refresh-atomicity.support.mjs`, `rldata.js`, `rlapp.js`, `playwright.config.mjs`, and every explicitly protected Feature 010 planning/human artifact remained byte-identical. The post-edit inventory also reconfirmed validator SHA-256 `1789de1a538e0af4a37a44ff930588fbd2d0abc3e4c95fbdc6da5ef2500a7c39`. VS Code diagnostics reported `No errors found` for both edited files.

## Current-Validator Independent Replay - 2026-07-17T02:30:09Z

This section records `bubbles.test` consumption of `TR-F010-SCOPE01-CURRENT-VALIDATOR-TEST-02` under the top-level `bubbles.goal` direct-authorized `full-delivery` runner. The retained capture was used as input; no SEC request, package installation, source edit, test edit, fixture rewrite, publication mutation, staging, commit, revert, deletion, or foreign-artifact normalization occurred.

Scope 01 and Feature 010 remain `not_started`. Every DoD checkbox, `execution.completedPhaseClaims`, and `certification.*` field remains unchanged. The test-owned outcome is `route_required` to the transition's declared return owner, `bubbles.implement`.

### Mandatory Current-Byte Identity

**Phase:** test
**Claim Source:** executed
**Executed:** YES (current session)
**Commands:** pre-execution `shasum -a 256 scripts/validate-company-fundamentals.mjs tests/company-fundamentals-contracts.unit.mjs tests/company-fundamentals-lab.spec.mjs scripts/selftest.mjs`; post-replay SHA-256 comparison against all four dispatch identities
**Exit Codes:** 0, 0
**Output:**

```text
1789de1a538e0af4a37a44ff930588fbd2d0abc3e4c95fbdc6da5ef2500a7c39  scripts/validate-company-fundamentals.mjs
d3a782874a58c850084d3e80835ee6f84174a17207e8f78afe23363d4068ab67  tests/company-fundamentals-contracts.unit.mjs
6ecb8c8ca9034a2192977de0ee6f9aa07a0a5060c6d3172623344bf5cb8eac2f  tests/company-fundamentals-lab.spec.mjs
25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b  scripts/selftest.mjs
SCOPE01-POST-REPLAY-HASH-BEGIN
1789de1a538e0af4a37a44ff930588fbd2d0abc3e4c95fbdc6da5ef2500a7c39  scripts/validate-company-fundamentals.mjs
d3a782874a58c850084d3e80835ee6f84174a17207e8f78afe23363d4068ab67  tests/company-fundamentals-contracts.unit.mjs
6ecb8c8ca9034a2192977de0ee6f9aa07a0a5060c6d3172623344bf5cb8eac2f  tests/company-fundamentals-lab.spec.mjs
25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b  scripts/selftest.mjs
VALIDATOR_SHA256_STABLE=PASS
UNIT_SHA256_STABLE=PASS
BROWSER_SHA256_STABLE=PASS
SELFTEST_SHA256_STABLE=PASS
SCOPE01_POST_REPLAY_HASH_EXIT=0
SCOPE01-POST-REPLAY-HASH-END
```

**Result:** PASS. The validator matched the mandatory precondition before any test execution, and validator/unit/browser/selftest bytes remained identical through the complete replay.

### Current Production Validator

**Phase:** test
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `node scripts/validate-company-fundamentals.mjs`
**Exit Code:** 0
**Output:**

```text
[company-fundamentals] config: parsed
[company-fundamentals] config: contract valid
[company-fundamentals] config: canonical fingerprint calculated
[company-fundamentals] source capture: 184333 exact raw SEC response bytes hash-valid
[company-fundamentals] source capture: production parser normalized issuer and filing identity
[company-fundamentals] current pointer: contract and content-addressed manifest path valid
[company-fundamentals] manifest: pointer hash and config fingerprint valid
[company-fundamentals] objects: 8 reachable immutable objects hash-valid
[company-fundamentals] source artifact: hash and rights bound
[company-fundamentals] publication: complete graph valid
[company-fundamentals] publication: canonical manifest hash valid
[company-fundamentals] accepted state: source identity and period preserved
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] source capture: exact raw SEC response bytes retained
[company-fundamentals] validation: PASS
```

**Result:** PASS. Current validator SHA-256 `1789de1a...` executes the retained capture, production normalization, current pointer, eight-object graph, accepted state, and both planned scenarios successfully.

### Exact Five-Row Test Matrix

| Test Plan row | Category | Exact current-session outcome | Skipped |
| --- | --- | --- | ---: |
| TP-01-01 | unit | exit 0; 11 passed, 0 failed, 0 todo | 0 |
| TP-01-02 | functional | exit 0; 508 passed, 0 failed | 0 |
| TP-01-03 | e2e-ui | exit 0; exact SCN-010-026 title; 1 passed | 0 |
| TP-01-04 | e2e-ui | exit 0; exact SCN-010-029 title; 1 passed | 0 |
| TP-01-05 | e2e-ui | exit 0; complete selected file; 2 passed | 0 |

The current machine `test-plan.json` and Scope 01 Markdown table contain the same five IDs, categories, files, commands, scenario mappings, and two exact browser titles. The five test-evidence DoD items remain unchecked because this replay does not own planning checkbox truth.

### TP-01-01 Unit Replay

**Phase:** test
**Claim Source:** executed
**Command:** `node --test tests/company-fundamentals-contracts.unit.mjs`
**Exit Code:** 0
**Output:**

```text
✔ retained SEC payload is byte-hash coherent and production-parseable (16.685666ms)
✔ production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields (0.536041ms)
✔ Scope 01 config declares every policy and fails loud on version or reference drift (3.578709ms)
✔ exact recorded source publication validates and binds the retained response bytes (3.626625ms)
✔ publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates (2.943958ms)
✔ source decimals remain reconstructable and evidence classes and states stay closed (0.219958ms)
✔ conflicted dependencies withhold only their reachable branch (0.116458ms)
✔ same-origin loader resolves a current pointer and canonical objects without credentials (15.65525ms)
✔ fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace (2.239375ms)
✔ SCN-010-026 missing facts withhold only dependency-reachable outputs (0.175792ms)
✔ SCN-010-029 material claims resolve the complete source and consumer chain (0.221041ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 97.21675
```

**Result:** PASS, 11/11 with zero skipped or todo tests.

### TP-01-02 Complete Selftest Replay

**Phase:** test
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output window:** Scope 01 group and aggregate from the complete unfiltered 508-check terminal capture.

```text
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 current pointer selects the content-addressed production manifest
  ✓ Feature 010 retained SEC payload is byte-hash coherent and passes production parsing
  ✓ Feature 010 SourceArtifact binds the exact retained response bytes
  ✓ Feature 010 materialized publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 accepted identity and period derive from production-normalized source bytes
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  ✓ Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  ✓ Feature 010 validator executes exact-capture parsing config graph projection and trace functions

================================================
Research-Lab self-test: 508 passed, 0 failed
================================================
```

**Result:** PASS. The complete repository command ran unfiltered; the final aggregate is 508/0.

### TP-01-03 Through TP-01-05 Browser Replay

**Phase:** test
**Claim Source:** executed
**Commands:** the three exact current Scope 01 Playwright commands, in TP-01-03, TP-01-04, TP-01-05 order
**Exit Codes:** 0, 0, 0
**Output:**

```text
Running 1 test using 1 worker

  ✓  1 … concepts remain unavailable while independent facts stay usable (503ms)

  1 passed (1.5s)

Running 1 test using 1 worker

  ✓  1 … claim reaches its exact source transformation and consumer chain (1.2s)

  1 passed (1.8s)

Running 2 tests using 1 worker

  ✓  1 … concepts remain unavailable while independent facts stay usable (293ms)
  ✓  2 … claim reaches its exact source transformation and consumer chain (1.0s)

  2 passed (1.9s)
```

**Result:** PASS. Both exact persistent titles passed independently and together on the real ephemeral static server.

### Test Integrity, Source Lock, And Isolation

**Phase:** test
**Claim Source:** executed
**Commands:** `npx --no-install playwright --version`; regression-quality guard; environment-pollution scan; Node source-lock validator; skip/bailout/title scan; live-interception/server scan; Feature 010 traceability guard
**Exit Codes:** 0 for every command
**Output:**

```text
Version 1.61.1
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-17T02:28:33Z
  Bugfix mode: false
============================================================
ℹ️  Scanning tests/company-fundamentals-contracts.unit.mjs
ℹ️  Scanning tests/company-fundamentals-lab.spec.mjs
============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
============================================================
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
SCOPE01_SKIP_MARKER_SCAN=PASS matches=0 files=2
SCOPE01_E2E_BAILOUT_SCAN=PASS matches=0 files=1
SCOPE01_TITLE_SCN_010_026_COUNT=1
SCOPE01_TITLE_SCN_010_029_COUNT=1
SCOPE01_EXACT_TITLE_SCAN=PASS
SCOPE01_SKIP_BAILOUT_SCAN_EXIT=0
SCOPE01_LIVE_INTERCEPTION_SCAN=PASS matches=0 files=3
SCOPE01_EPHEMERAL_STATIC_SERVER=PASS bind=127.0.0.1 port=0
SCOPE01_LIVE_SERVER_START=PASS
SCOPE01_LIVE_SERVER_CLOSE=PASS
SCOPE01_LIVE_INTERCEPTION_SCAN_EXIT=0
✅ scenario-manifest.json covers 32 scenario contract(s)
✅ scenario-manifest.json records evidenceRefs
✅ All linked tests from scenario-manifest.json exist
```

**Result:** PASS. The selected live test uses checkout-local Playwright 1.61.1, a real loopback server bound to ephemeral port 0, and no request interception, skip marker, or bailout return.

**Phase:** test
**Claim Source:** executed
**Command:** `node scripts/validate-node-source-lock.mjs`
**Exit Code:** 0
**Output:**

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=manifest-wrong-version result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=lifecycle-relaxation result=REJECTED code=NPMRC-IGNORE-SCRIPTS
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

**Result:** PASS. The actual dependency graph is source locked and all 16 adversarial source mutations were rejected without package installation.

### Mock And Self-Validation Audit

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The executed runs above establish behavior; current source review classifies their fidelity. The selected unit file has 11 real production-logic tests. Its fetch function is an external boundary used only in the unit category and verifies request options plus unsafe-path, wrong-content-type, tampered-object, and wrong-company rejection. The two live browser tests use no interception, navigate the real route, observe current-pointer and immutable-object requests, assert user-visible dependency and trace outcomes, and fail on runtime, response, external-request, or focus-return defects. Assertions depend on production parsing, hashing, graph validation, projection, propagation, rendering, and trace selection; replacing those paths with an identity or hard-coded return would not satisfy the matrix.

- Tests audited: 13 (11 unit, 2 e2e-ui).
- Live files scanned for interception: 3 (spec, runtime import, static-server support).
- Mock reclassifications: none.
- Self-validating required tests found: 0.
- Silent-pass or proxy required tests found: 0.
- Live-category gaps created: none.

### Finding Accounting And Route

| Finding | Test-owned disposition |
| --- | --- |
| `F010-CURRENT-VALIDATOR-INDEPENDENT-REPLAY-002` | Addressed. Current validator SHA-256 `1789de1a...` matched before execution, all required commands passed, and all four required identities remained stable afterward. |
| New implementation defect | None reproduced. No source or test edit was authorized or made. |
| `F010-CONCURRENT-UNREFERENCED-CLEANUP-001` | Preserved unresolved for `bubbles.implement`; this replay did not delete or rewrite concurrent publication/fixture bytes. |
| `F010-FRAMEWORK-WRITE-DRIFT-001` | Preserved unresolved and foreign; no framework-managed path was edited or recertified. |
| `F010-G028-RLDATA-SCOPE-001` | Preserved unresolved and foreign; no excluded shared source, planning artifact, or scanner was edited. |

Transition `TR-F010-SCOPE01-CURRENT-VALIDATOR-TEST-02` is resolved only for its exact requested return. The execution route returns to `bubbles.implement` for the Feature 010 Scope 01 current-validator independent-verification handoff. Scope 01 status, all DoD checkbox states, completed phase claims, certification, Feature 004, BUG-002, BUG-003, shared Playwright, framework-managed, planning-owned, and human-acceptance bytes remain unclaimed and untouched by this test replay.
