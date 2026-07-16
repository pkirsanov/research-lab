# Report: BUG-001 Central Provider Credential Security

<!-- markdownlint-disable MD010 -->

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Active Planning Evidence Boundary

The active execution contract is the five-scope process-memory and erase-only plan in [scopes.md](scopes.md). All execution evidence below this planning boundary predates that contract and remains preserved as historical evidence. It must not be cited as proof of `SCN-BUG001-001` through `SCN-BUG001-011` until the exact reconciled test titles and commands execute in a later owned phase.

Implementation dispatch is allowed for SCOPE-01 because the active spec, design, scopes, scenario manifest, machine Test Plan, acceptance checklist, and execution routing now agree on current-document memory and erase-only cleanup. `state.json.certification.scopeProgress` remains stale and is routed to `bubbles.validate` for inventory reconciliation only; this planning section records no product, test, scanner, collision, canary, validation, audit, or certification result.

### Active Scope 01 Evidence

Evidence destination for current-document runtime ownership, lifecycle clearing, closed-provider behavior, scenario-first RED/GREEN, shared-bootstrap canaries, and protected-hunk checks.

### Active Scope 02 Evidence

Evidence destination for metadata-only legacy detection, zero value access, whole-container erase, memory-first clear-all, incomplete-erasure behavior, and non-secret `rlData` preservation.

### Active Scope 03 Evidence

Evidence destination for same-document collection/use, absence of credential-bearing DOM state, registry-wide consumer removal, zero browser bridges, and page/tab/window/context isolation.

### Active Scope 04 Evidence

Evidence destination for disabled production providers, exact-origin header transport, one-attempt failure behavior, zero fallback, and sentinel disclosure scans.

### Active Scope 05 Evidence

Evidence destination for one-to-one G028 accounting, canonical BUG-013 semantics, `F004-COLLISION-001`, complete dirty-hunk preservation, framework immutability, and provider/Bond/Causal/FX canaries.

## Summary

- Reconciled the partially landed central credential owner with the planned versioned `rlSessionProviderCredentialsV1` envelope, index-only mutation UX, explicit migration/scrub lifecycle, closed provider policy, and header-only request builder.
- Purged tool-local credential state and raw-key function signatures from every registered consumer, disabled unverified browser provider paths, bound Finnhub headers to its approved origin, and fixed one registry-sweep boot error in the MSFT page.
- Added and executed unit, functional, 12-case browser, 250-cycle stress, 8-context/18-page load, static registry, and full repository regression coverage while preserving the Bond Regime feature boundary and all unrelated dirty work.
- Kept framework-managed files, Bond Regime product/spec/test files, generated snapshots/history, universe files, project instructions, and managed docs untouched.

## Completion Statement

Bug closure is not claimed. Product behavior and BUG-001-targeted tests are green, but both scopes remain `In Progress` because current-session historical RED is unavailable for already-landed cases, the exact `npx --no-install` launcher cannot resolve, the broader cached browser corpus has three unrelated Causal Rotation browser-launch failures, G028 still blocks the required same-tab policy and scrub/cache lines, managed docs are not synchronized, and validate/audit have not certified the result.

## Discovery Provenance

**Phase:** bug-discovery  
**Claim Source:** interpreted  
**Interpretation:** The nine rows are the exact current source lines matched by the installed G028 sensitive-client-storage expressions at baseline revision `9d4020b4bd80516c49a3005f42edacedc169c3e9`. The earlier `bubbles.security` transcript was not available in the local session index, so this packet does not claim verbatim transcript provenance or a newly executed scanner result.

## G028 Finding Inventory

| ID | Source | Classification | Security meaning | Owner/disposition |
| --- | --- | --- | --- | --- |
| G028-01 | `rldata.js:50` | False positive | Non-secret cache comment contains `session` near `localStorage` | Bubbles scanner owner: distinguish cache comments from credential storage |
| G028-02 | `rldata.js:75` | False positive | Non-secret cache retry line contains `session` in a comment | Bubbles scanner owner: semantic match, preserve cache |
| G028-03 | `rldata.js:96` | Genuine | Silent durable import from `etfMomLab` credential fields | Product fix: consented migration and scrub |
| G028-04 | `rldata.js:98` | Genuine | Silent durable import from `sectorLab.apiKey` | Product fix: consented migration and scrub |
| G028-05 | `rldata.js:102` | False positive row | Delete-before-write scrub of `etfMomLab` is flagged even though output is sanitized | Bubbles scanner owner: recognize verified sanitation; product tests prove deletion |
| G028-06 | `rldata.js:106` | False positive row | Delete-before-write scrub of `sectorLab` is flagged | Bubbles scanner owner: recognize verified sanitation; product tests prove deletion |
| G028-07 | `rldata.js:111` | False positive row | Delete-before-write scrub of validation state is flagged | Bubbles scanner owner: recognize verified sanitation; product tests prove deletion |
| G028-08 | `rlapp.js:36` | Genuine | Direct durable central credential read | Product fix: status/read through central same-tab API |
| G028-09 | `rlapp.js:44` | Genuine | Direct durable central credential write | Product fix: index-only same-tab mutation |

### Additional Genuine Findings Outside The Nine Rows

| ID | Source | Finding | Disposition |
| --- | --- | --- | --- |
| SEC-BLIND-01 | `rldata.js` `KEY_STORE` reads/writes | Literal scanner misses the durable central store because the credential-shaped key is indirect | Product fix plus upstream adversarial scanner selftest |
| SEC-UI-01 | `rlapp.js` settings renderer | Stored values are placed back into password input values | Product fix and DOM sentinel regression |
| SEC-MIG-01 | `rlapp.js` boot plus `rldata.js` migration | Migration runs without user consent | Product fix and dismiss/accept/failure regressions |
| SEC-PROVIDER-01 | central `setKey` | Arbitrary non-empty provider IDs are accepted | Product fix with closed allowlist and prototype adversarial cases |
| SEC-CONSUMER-01 | registered tool pages | Inline helpers duplicate credential writes outside the index owner | Registry-derived consumer purge and stale-reference proof |
| SEC-TRANSPORT-01 | shared and inline provider fetchers | Credentials are placed in URL query parameters | Central request policy, header auth where verified, query fallback removal |
| SEC-TD-01 | Twelve Data request paths | Browser-key authorization is not verified | Keep browser credential use disabled until evidence is approved |
| SEC-TEST-01 | `scripts/selftest.mjs` | Tests currently require silent migration and durable key round trips | Capture pre-fix failure, then replace with the planned contract |

## Upstream Dependency

| ID | Conflict | Disposition | Blocking condition |
| --- | --- | --- | --- |
| DEP-G028-SESSION | G028 currently blocks any `sessionStorage` API-key storage while the product requirement mandates same-tab `sessionStorage` | Routed through `bubbles.design` to the canonical Bubbles source owner; no downstream patch or identifier obfuscation | Bug cannot be certified until policy and scanner semantics are reconciled or the framework owner returns a concrete block |
| DEP-G028-FALSE-POSITIVE | Five baseline rows are line-oriented false positives | Routed to the canonical Bubbles source owner with required selftests | Bug cannot claim zero G028 findings by deleting non-secret cache/scrub behavior |

## Bug Reproduction - Before Fix

**Phase:** bug-discovery  
**Claim Source:** not-run  
**Reason:** `bubbles.bug` created the artifact packet only. The workflow did not dispatch `bubbles.test`, and no source/test mutation was authorized.  
**Required proof:** Execute the exact regression titles in [scopes.md](scopes.md) against the baseline. Each targeted test must fail on the named security behavior before implementation.

## Planning-Phase Code Diff Boundary

No implementation-bearing delta belongs to this phase. The intended diff is limited to this new bug folder. Product and existing spec paths remain outside the bug-phase write set.

## Test Evidence

Implementation-owned execution evidence follows. `bubbles.test` has not independently replayed or certified these results.

## Implementation Evidence - SCOPE-01

### SCOPE-01 Current-Session RED Baseline

**Phase:** implement  
**Claim Source:** executed  
**Observed before the first implementation-owned edit:** `node --test tests/provider-credentials.unit.mjs` passed 3/3 and `node --test tests/provider-credentials.functional.mjs` passed 7/7 because the central lifecycle was already partially landed. The exact Playwright command could not resolve a local package, the full selftest failed one stale scalar-key assertion, and the planned stress/load files did not exist.

**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 1  
**Output:**

```text
rldata.js - shared toolReads round-trip + freshness
 PASS: toolReads persist and round-trip by tool id
 PASS: legacy detection reports redacted presence without silent activation
 PASS: explicit consent migrates allowlisted provider credentials into the same-tab store
 PASS: legacy durable key copies are scrubbed after verified migration
 PASS: central same-tab provider key updates round-trip
 FAIL: provider credential is session-only while non-secret rlData remains durable
 PASS: central owner exposes no bulk credential or silent migration API
 PASS: quota pruning preserves every hydrated symbol in the live session cache
 PASS: quota-compacted persistence does not shrink in-memory breadth coverage
================================================
Research-Lab self-test: 344 passed, 1 failed
================================================
```

```text
  PASS every registered tool loads the shared data-status shell
  PASS every registered tool loads RLDATA before RLAPP
  PASS the landing page consumes the central provider registry without duplicate storage ownership
  PASS tool pages expose no duplicate credential inputs
  FAIL registered tools expose no duplicate provider credential setter migration or durable storage access: sector-research-lab, etf-momentum-lab, strategy-validation-lab
  FAIL registered tools expose no credential-bearing provider URL transport: sector-research-lab, etf-momentum-lab, strategy-validation-lab
  PASS market brief refreshes its live layer automatically
  PASS options structure auto-loads its selected chain without optional cross-origin probes
 throw err;
 ^
Error: Cannot find module '<repo>/tests/provider-credentials.stress.mjs'
 code: 'MODULE_NOT_FOUND'
 requireStack: []
Node.js v26.4.0
node:internal/modules/cjs/loader:1572
 throw err;
 ^
Error: Cannot find module '<repo>/tests/provider-credentials.load.mjs'
 code: 'MODULE_NOT_FOUND'
 requireStack: []
Node.js v26.4.0
```

**Result:** FAIL. Both planned test implementations were absent.

**Uncertainty Declaration:** Current-session behavioral RED for every SCN-BUG001-001 through SCN-BUG001-006 case cannot be claimed. The partially landed product implementation made the unit and functional suites green before this invocation's first edit, and the exact Playwright failure was dependency resolution rather than a product assertion. Historical RED is not reconstructed or fabricated; the corresponding DoD item remains unchecked.

### SCOPE-01 Unit Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `node --test tests/provider-credentials.unit.mjs`  
**Exit Code:** 0  
**Output:**

```text
PASS unknown and prototype-shaped provider ids fail without mutation
PASS approved credentials share one versioned same-tab envelope
PASS verified header provider builds a secret-free URL and no query fallback
tests 3
suites 0
pass 3
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 75.385916
```

**Result:** PASS

### SCOPE-01 Functional Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `node --test tests/provider-credentials.functional.mjs`  
**Exit Code:** 0  
**Output:**

```text
PASS consent migration writes verifies scrubs and fails closed atomically
PASS clear all erases session and every known durable legacy location
PASS tool routes cannot migrate erase or clear provider credentials
PASS adversarial scrub failure clears staged session credentials and reports no values
PASS auth failure never retries with a credential query parameter
PASS adversarial credential-like query names and encoded sentinels never enter request URLs
PASS Twelve Data remains disabled without authorization evidence
tests 7
pass 7
fail 0
skipped 0
todo 0
```

**Result:** PASS

### SCOPE-01 Browser Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/provider-credentials.spec.mjs --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 12 tests using 1 worker
PASS Canary: real index loads RLDATA before RLAPP with one credential editor
PASS Regression BUG-001: only index can mutate provider credentials
PASS Regression BUG-001: same-tab navigation retains credentials and an independently opened tab starts empty
PASS Regression BUG-001: save blanks fields and exposes configured status only
PASS Regression BUG-001: legacy credentials require consent and successful migration scrubs every durable copy
PASS Regression BUG-001: unknown and prototype-shaped providers fail without mutation
PASS Regression BUG-001: clear all removes active and legacy credentials
PASS Regression BUG-001: sentinel credential never appears in DOM console errors URL or referrer
PASS Regression BUG-001: every registered tool has no credential editor or storage writer
PASS Regression BUG-001: Twelve Data browser credential calls remain disabled without authorization evidence
PASS Regression BUG-001: approved header auth never places credentials in URLs or retries with query auth
PASS Regression BUG-001: G028 inventory closes genuine rows without deleting noncredential rlData cache
12 passed (11.7s)
```

**Result:** PASS. This is additional evidence through an already-cached runner and existing system Chrome. The exact planned `npx --no-install` command remains an environment gap and is not claimed as passed.

### SCOPE-01 Stress Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `node tests/provider-credentials.stress.mjs`  
**Exit Code:** 0  
**Output:**

```text
BUG001_STRESS_BEGIN
CATEGORY=stress
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PRODUCTION_PAGE=index.html
PRODUCTION_OWNER=rldata.js+rlapp.js
CYCLES=250
RELOADS=10
SESSION_STORE_BOUNDED=true
RENDERED_SENTINELS=0
DIAGNOSTIC_SENTINELS=0
RESULT=PASS
BUG001_STRESS_END
```

**Result:** PASS

### SCOPE-01 Load Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `node tests/provider-credentials.load.mjs`  
**Exit Code:** 0  
**Output:**

```text
BUG001_LOAD_BEGIN
CATEGORY=load
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PARALLEL_CONTEXTS=8
PAGES_PER_CONTEXT=2
TOTAL_PAGES=16
PRIMARY_CONFIGURED=8
INDEPENDENT_CONFIGURED=0
DURABLE_CREDENTIAL_STORES=0
CROSS_TAB_TRANSFERS=0
RESULT=PASS
BUG001_LOAD_END
```

**Result:** PASS

### SCOPE-01 Repository And Regression-Quality Evidence

**Phase:** implement  
**Claim Source:** executed  
**Commands:** `node scripts/selftest.mjs`; `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/provider-credentials.unit.mjs tests/provider-credentials.functional.mjs tests/provider-credentials.spec.mjs tests/provider-credentials.stress.mjs tests/provider-credentials.load.mjs`  
**Exit Code:** 0 for both commands  
**Output:**

```text
PASS provider credential is session-only while non-secret rlData remains durable
PASS central owner exposes no bulk credential or silent migration API
PASS every registered tool loads the shared data-status shell
PASS every registered tool loads RLDATA before RLAPP
PASS the landing page consumes the central provider registry without duplicate storage ownership
PASS tool pages expose no duplicate credential inputs
PASS registered tools expose no duplicate provider credential setter migration or durable storage access
PASS registered tools expose no credential-bearing provider URL transport
Research-Lab self-test: 345 passed, 0 failed
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 5
Files with adversarial signals: 5
```

**Result:** PASS

## Implementation Evidence - SCOPE-02

### SCOPE-02 RED Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 1  
**Output:**

```text
rlapp.js - one key surface, all-page status, automatic stale-data refresh
	PASS every registered tool loads the shared data-status shell
	PASS every registered tool loads RLDATA before RLAPP
	PASS the landing page consumes the central provider registry without duplicate storage ownership
	PASS tool pages expose no duplicate credential inputs
	FAIL registered tools expose no duplicate provider credential setter migration or durable storage access: sector-research-lab, etf-momentum-lab, strategy-validation-lab
	FAIL registered tools expose no credential-bearing provider URL transport: sector-research-lab, etf-momentum-lab, strategy-validation-lab
	PASS market brief refreshes its live layer automatically
	PASS options structure auto-loads its selected chain without optional cross-origin probes
================================================
Research-Lab self-test: 343 passed, 2 failed
================================================
```

**Result:** FAIL. The registry-derived inventory named all current offenders before the product purge.

**Command:** `node --test tests/provider-credentials.unit.mjs`  
**Exit Code:** 1  
**Output:**

```text
PASS unknown and prototype-shaped provider ids fail without mutation
PASS approved credentials share one versioned same-tab envelope
FAIL verified header provider builds a secret-free URL and no query fallback
tests 3
pass 2
fail 1
cancelled 0
skipped 0
todo 0
AssertionError: https://example.com was accepted instead of provider-origin-forbidden
```

**Result:** FAIL. The central builder attached the approved header to an unapproved origin.

**Command:** `node --test tests/provider-credentials.functional.mjs`  
**Exit Code:** 1  
**Output:**

```text
PASS consent migration writes verifies scrubs and fails closed atomically
PASS clear all erases session and every known durable legacy location
PASS tool routes cannot migrate erase or clear provider credentials
PASS adversarial scrub failure clears staged session credentials and reports no values
PASS auth failure never retries with a credential query parameter
FAIL adversarial credential-like query names and encoded sentinels never enter request URLs
PASS Twelve Data remains disabled without authorization evidence
tests 7
pass 6
fail 1
skipped 0
todo 0
```

**Result:** FAIL. Mixed-case credential-like query names were not normalized before validation.

### SCOPE-02 Targeted Green Evidence

**Phase:** implement  
**Claim Source:** executed  
**Commands:** `node --test tests/provider-credentials.unit.mjs`; `node --test tests/provider-credentials.functional.mjs`; `node scripts/selftest.mjs`  
**Exit Code:** 0 for all commands  
**Output:**

```text
PASS unknown and prototype-shaped provider ids fail without mutation
PASS approved credentials share one versioned same-tab envelope
PASS verified header provider builds a secret-free URL and no query fallback
unit tests: 3 passed, 0 failed
PASS consent migration writes verifies scrubs and fails closed atomically
PASS clear all erases session and every known durable legacy location
PASS auth failure never retries with a credential query parameter
PASS adversarial credential-like query names and encoded sentinels never enter request URLs
PASS Twelve Data remains disabled without authorization evidence
functional tests: 7 passed, 0 failed
PASS registered tools expose no duplicate provider credential setter migration or durable storage access
PASS registered tools expose no credential-bearing provider URL transport
Research-Lab self-test: 345 passed, 0 failed
```

**Result:** PASS

### SCOPE-02 Browser Stress And Load Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/provider-credentials.spec.mjs --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 12 tests using 1 worker
PASS only index can mutate provider credentials
PASS same-tab navigation retains credentials and an independently opened tab starts empty
PASS save blanks fields and exposes configured status only
PASS legacy credentials require consent and successful migration scrubs every durable copy
PASS unknown and prototype-shaped providers fail without mutation
PASS clear all removes active and legacy credentials
PASS sentinel credential never appears in DOM console errors URL or referrer
PASS every registered tool has no credential editor or storage writer
PASS Twelve Data browser credential calls remain disabled without authorization evidence
PASS approved header auth never places credentials in URLs or retries with query auth
PASS G028 inventory closes genuine rows without deleting noncredential rlData cache
12 passed (12.9s)
```

**Result:** PASS through the existing cached runner and system Chrome.

**Commands:** `node tests/provider-credentials.stress.mjs`; `node tests/provider-credentials.load.mjs`  
**Exit Code:** 0 for both commands  
**Output:**

```text
BUG001_STRESS_BEGIN
CYCLES=250
RELOADS=10
NAVIGATION_CYCLES=25
PROVIDER_FAILURE_CASES=50
RENDERED_SENTINELS=0
DIAGNOSTIC_SENTINELS=0
RESULT=PASS
BUG001_STRESS_END
BUG001_LOAD_BEGIN
PARALLEL_CONTEXTS=8
REGISTERED_PAGES=18
REGISTRY_SOURCE_OFFENDERS=0
REGISTRY_RUNTIME_ERRORS=0
UNVERIFIED_PROVIDER_REQUESTS=0
CROSS_TAB_TRANSFERS=0
RESULT=PASS
BUG001_LOAD_END
```

**Result:** PASS

### SCOPE-02 G028 Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `bash .github/bubbles/scripts/cli.sh scan specs/_bugs/BUG-001-central-provider-credential-security`  
**Exit Code:** 1  
**Output:**

```text
INFO: Resolved 7 implementation file(s) to scan
--- Scan 2B: Sensitive Client Storage ---
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:174
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:66
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:108
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
Files scanned: 7
Violations: 5
Warnings: 1
BLOCKED: 5 source code reality violation(s) found
```

**Result:** FAIL / upstream route required. Current line 66 is a non-secret cache comment, line 108 is the required versioned same-tab storage surface, line 174 is explicit redacted legacy detection, and line 203 is verified legacy scrub reported twice by two patterns. No downstream scanner edit, bypass, identifier obfuscation, or deletion of valid cache/scrub behavior was attempted.

### SCOPE-02 Broad Regression And Command Surface

**Phase:** implement  
**Claim Source:** executed  
**Command:** `npx --no-install playwright test --reporter=list`  
**Exit Code:** 1  
**Output:**

```text
npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]
npm error A complete log of this run can be found in the npm cache log directory
```

**Result:** NOT EXECUTED. No package was installed and no pass is claimed.

**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test --reporter=list`  
**Exit Code:** 1  
**Output:**

```text
Running 42 tests using 3 workers
PASS all 12 BUG-001 browser tests
PASS all 27 Bond Regime browser tests
FAIL Causal Rotation: Evidence available after a decision is excluded from that decision
FAIL Causal Rotation: One announcement drives price options and ETF activity
FAIL Causal Rotation: Decision-critical valuation and timing inputs are stale or unavailable
Failure for each: bundled Chromium executable does not exist in the Playwright cache
39 passed
3 failed
total duration 20.4s
```

**Result:** PARTIAL. The unrelated Causal Rotation spec lacks the system-Chrome launch selection already used by the BUG-001 and Bond Regime specs. It was not edited in this bug scope.

### SCOPE-02 Change Boundary And Existing Checks

**Phase:** implement  
**Claim Source:** executed  
**Commands:** path-scoped `git diff --check`; `node scripts/validate-brief-payload.mjs`; `node scripts/validate-causal-rotation.mjs`; `node scripts/session-review.mjs --selftest`; bugfix regression-quality guard  
**Exit Code:** 0 for all commands  
**Output:**

```text
BUG001_BOUNDARY_BEGIN
TOUCHED_DIFF_CHECK=PASS
TOUCHED_PRODUCT_FILES=5
BOND_REGIME_EDIT_CALLS=0
FRAMEWORK_EDIT_CALLS=0
GENERATED_SNAPSHOT_EDIT_CALLS=0
UNIVERSE_EDIT_CALLS=0
RESULT=PASS
brief-contract result: PASS
causal-contract checks passed: 39
causal-contract checks failed: 0
session-review self-test: 59 passed, 0 failed
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 5
Files with adversarial signals: 5
BUG001_BOUNDARY_END
```

**Result:** PASS. The protected Bond Regime paths remain in their pre-existing untracked state and were never targeted by a file edit.

### Code Diff Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `git status --short -- rldata.js etf-momentum-lab.html sector-research-lab.html strategy-validation-lab.html msft-july-print-model.html scripts/selftest.mjs tests/provider-credentials.support.mjs tests/provider-credentials.unit.mjs tests/provider-credentials.functional.mjs tests/provider-credentials.spec.mjs tests/provider-credentials.stress.mjs tests/provider-credentials.load.mjs specs/_bugs/BUG-001-central-provider-credential-security/report.md specs/_bugs/BUG-001-central-provider-credential-security/scopes.md`  
**Exit Code:** 0  
**Output:**

```text
$ git status --short -- rldata.js etf-momentum-lab.html sector-research-lab.html strategy-validation-lab.html msft-july-print-model.html scripts/selftest.mjs tests/provider-credentials.support.mjs tests/provider-credentials.unit.mjs tests/provider-credentials.functional.mjs tests/provider-credentials.spec.mjs tests/provider-credentials.stress.mjs tests/provider-credentials.load.mjs specs/_bugs/BUG-001-central-provider-credential-security/report.md specs/_bugs/BUG-001-central-provider-credential-security/scopes.md
 M etf-momentum-lab.html
 M msft-july-print-model.html
 M rldata.js
 M scripts/selftest.mjs
 M sector-research-lab.html
 M strategy-validation-lab.html
?? specs/_bugs/BUG-001-central-provider-credential-security/report.md
?? specs/_bugs/BUG-001-central-provider-credential-security/scopes.md
?? tests/provider-credentials.functional.mjs
?? tests/provider-credentials.load.mjs
?? tests/provider-credentials.spec.mjs
?? tests/provider-credentials.stress.mjs
?? tests/provider-credentials.support.mjs
?? tests/provider-credentials.unit.mjs
```

**Interpretation:** These paths contain a combined dirty delta: some product/test hunks were present before this invocation and were preserved. This invocation changed only the credential-path portions described in SCOPE-01/SCOPE-02 plus execution evidence. It did not edit `rlapp.js` or `index.html`, whose partial central lifecycle had already landed, and it did not target any Bond Regime, framework-managed, generated snapshot/history, universe, managed-doc, or project-instruction file.

## Requirement-Mechanism Justifications

Mechanism-Justification: Content-Security-Policy — [spec.md](spec.md) identifies CSP as residual defense in depth, not as the delivery mechanism for this bug. The two planned scopes implement the required containment through the versioned same-tab envelope, index-only mutation, explicit migration and verified scrub, closed provider allowlist, approved-origin header transport, query rejection, no-referrer requests, registry-wide consumer purge, and sentinel non-disclosure tests. No CSP claim is made.

### Final State Guard Evidence

**Phase:** implement  
**Claim Source:** executed  
**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-001-central-provider-credential-security`  
**Exit Code:** 1  
**Output:**

```text
Resolved scopes: total=2, Done=0, In Progress=2
BLOCK: all scopes must be Done
BLOCK: required specialist phases are not certified
BLOCK: planning parser reports .mjs test-file and scenario-specific DoD gaps
PASS: all 20 checked DoD items have evidence blocks
PASS: artifact lint passes
PASS: artifact freshness guard passes
PASS: implementation delta evidence has git-backed runtime paths (G053)
PASS: requirement-mechanism correspondence is disclosed (G097)
BLOCK: implementation reality scan reports 5 G028 rows
BLOCK: capability foundation guard reports 4 planning findings
TRANSITION BLOCKED: 48 failures, 3 warnings
failedGateIds: G060,G061,G022,G028,G001,G068,G085,G094
verdict: FAIL
```

**Result:** FAIL as required. `state.json` was not changed. G053 and G097 pass; planning, framework-policy, specialist-phase, independent-test, audit, and certification findings remain owner-routed.

## Finding Closure Summary

### Addressed Findings

| Finding | Disposition | Evidence |
| --- | --- | --- |
| G028-03, G028-04 | Silent durable legacy import replaced by redacted detection, explicit consent, verified same-tab write, and verified scrub | Functional/browser migration regressions |
| G028-08, G028-09, SEC-BLIND-01 | RLAPP durable fallback and durable central credential store absent; versioned same-tab owner is authoritative | Unit/selftest/browser storage canaries |
| SEC-UI-01, SEC-MIG-01, SEC-PROVIDER-01 | Blank-after-save/status-only UX, explicit migration, and closed prototype-safe provider policy pass | Unit/functional/browser suites |
| SEC-CONSUMER-01, SEC-TRANSPORT-01, SEC-TD-01 | All 18 registered pages have zero local credential owner residue or unverified provider requests; query/raw-key paths removed | Registry selftest, browser sweep, load test |
| SEC-TEST-01 | Stale scalar-session assertion replaced with the planned versioned envelope assertion; five committed test surfaces cover all scenarios | Full selftest and regression-quality guard |
| SEC-ORIGIN-01 | Header transport now rejects origins outside the closed Finnhub origin list | Unit/browser regressions |
| SEC-QUERY-CASE-01 | Credential-like query names are normalized case-insensitively and rejected | Functional/stress regressions |
| SEC-MSFT-BOOT-01 | Stale `liveKey` boot reference replaced with central status consumption | 18-page load and MSFT syntax check |
| G053, G097 | Code diff evidence and honest CSP residual-boundary disclosure recorded | This report |

### Unresolved Findings And Owner Routes

| Finding | Current fact | Required owner |
| --- | --- | --- |
| G028-01, G028-02, G028-05, G028-06, G028-07, DEP-G028-FALSE-POSITIVE | Installed matcher flags non-secret cache wording and required legacy detect/scrub operations | Canonical Bubbles framework owner |
| DEP-G028-SESSION | Installed matcher blocks the required `rlSessionProviderCredentialsV1` same-tab policy | Canonical Bubbles framework owner |
| RED-PROVENANCE-01 | Already-landed cases were green before this invocation; complete historical RED cannot be claimed | `bubbles.validate` must retain the uncertainty; no synthetic evidence is authorized |
| ENV-PLAYWRIGHT-EXACT | `npx --no-install` cannot resolve a local Playwright package | Repository-readiness / test command-surface owner |
| ENV-CAUSAL-BROWSER | Three unrelated Causal Rotation tests do not select existing system Chrome | Causal Rotation test owner |
| PLAN-G001/G061/G068/G069/G094 | State guard reports test-path parsing, scenario/DoD fidelity, consumer/boundary planning, and capability-foundation gaps despite traceability passing | `bubbles.plan`, `bubbles.design`, and `bubbles.analyst` according to artifact ownership |
| DOC-SYNC-01 | Managed docs and project instructions were not edited in implementation phase | `bubbles.docs` |
| PHASE/CERTIFICATION | Independent test, regression, security, validate, audit, and final certification records are absent | Workflow owners in `state.json.routing.sequence` |

## Scenario Evidence Registry

### Scenario SCN-BUG001-001

Evidence status: passed through the current-session cached browser matrix and 18-page registry load. Only the index page renders or calls credential mutation surfaces.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: only index can mutate provider credentials`.

### Scenario SCN-BUG001-002

Evidence status: passed through the browser matrix and 8-context load; same-tab continuity and independent-tab emptiness were observed.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: same-tab navigation retains credentials and an independently opened tab starts empty`.

### Scenario SCN-BUG001-003

Evidence status: passed through the browser matrix and 250-cycle stress run; fields remained blank after save/remount and only status was rendered.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: save blanks fields and exposes configured status only`.

### Scenario SCN-BUG001-004

Evidence status: passed through functional and browser regressions covering detection, consented migration, verified scrub, erase-only, and partial failure.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: legacy credentials require consent and successful migration scrubs every durable copy`.

### Scenario SCN-BUG001-005

Evidence status: passed through unit, functional, and browser adversarial checks.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: unknown and prototype-shaped providers fail without mutation`.

### Scenario SCN-BUG001-006

Evidence status: passed through functional, browser, and stress checks.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: clear all removes active and legacy credentials`.

### Scenario SCN-BUG001-007

Evidence status: passed through browser and stress checks with zero rendered or diagnostic sentinel traces.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: sentinel credential never appears in DOM console errors URL or referrer`.

### Scenario SCN-BUG001-008

Evidence status: passed through the registry-derived selftest, browser sweep, and 18-page load with zero source offenders or runtime errors.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: every registered tool has no credential editor or storage writer`.

### Scenario SCN-BUG001-009

Evidence status: passed through functional, browser, stress, and load checks with zero Twelve Data requests.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: Twelve Data browser credential calls remain disabled without authorization evidence`.

### Scenario SCN-BUG001-010

Evidence status: passed through unit, functional, browser, and stress checks, including origin binding and mixed-case query-name rejection.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: approved header auth never places credentials in URLs or retries with query auth`.

### Scenario SCN-BUG001-011

Evidence status: product behavior and non-secret cache canaries pass; canonical G028 remains blocked on five upstream matcher/policy rows documented above.
Planned regression: `tests/provider-credentials.spec.mjs` - `Regression BUG-001: G028 inventory closes genuine rows without deleting noncredential rlData cache`.

## Uncertainty Declarations

### Security Transcript Provenance

- **What was attempted:** Local session-store search by repository, security-agent metadata, `rlApiKeys`, Twelve Data, credential, `sessionStorage`, and `localStorage` terms; workspace debug-log search for the same identifiers.
- **What was observed:** The prior `bubbles.security` transcript was not indexed under recoverable repository or agent metadata.
- **Why this is uncertain:** Finding text cannot be asserted as a verbatim copy of the original security response.
- **What resolves it:** Execute the installed scanner through the approved workflow and compare its raw nine-row output to this baseline ledger before any source edit.

### Provider Authorization

- **What was attempted:** Current source and repository docs were inspected for an approved browser-use authorization record.
- **What was observed:** No authoritative provider record was found for Twelve Data or for the exact auth transports used by the other keyed browser adapters.
- **Why this is uncertain:** Absence of a local record is not evidence that a provider forbids or permits the use.
- **What resolves it:** `bubbles.design` and `bubbles.security` cite official provider documentation or contract evidence and freeze each provider policy. Twelve Data remains disabled while unresolved.

## Ownership Routing

| Order | Owner | Required action | Exit condition |
| --- | --- | --- | --- |
| 1 | `bubbles.implement` | Consume `scopes.md`, `scenario-manifest.json`, and `test-plan.json`; create the missing regression files; capture pre-fix failures; implement SCOPE-01 before SCOPE-02; preserve all nine G028 dispositions | One-to-one addressed/unresolved ledger with current-session red/green evidence and no unrelated dirty-tree changes |
| 2 | `bubbles.test` | Run targeted, broader, stress/load, regression-quality, and no-bailout checks | Real raw output and zero required skips |
| 3 | `bubbles.validate` / `bubbles.audit` / `bubbles.docs` | Certify behavior, policy compatibility, evidence, and published truth | Current guard/lint/audit evidence and validate-owned state only |

## Discovered Issues

| Observed | Description | Disposition | Reference |
| --- | --- | --- | --- |
| 2026-07-13 | Product requirement for same-tab provider credentials conflicts with installed G028 blanket client-storage policy | routed | `state.json` `routing.blockedDependencies[0]` |
| 2026-07-13 | Project instructions and active historical design text still mandate durable `localStorage.rlApiKeys` | bug-filed | `specs/_bugs/BUG-001-central-provider-credential-security/bug.md` |
| 2026-07-13 | Browser authorization and safe transport are unverified for Twelve Data | bug-filed | `specs/_bugs/BUG-001-central-provider-credential-security/spec.md#output-and-transport-safety` |
| 2026-07-14 | Header builder accepted an arbitrary origin and mixed-case credential query names | addressed | `tests/provider-credentials.unit.mjs`, `tests/provider-credentials.functional.mjs`, `rldata.js` |
| 2026-07-14 | Full registry load found stale `liveKey` boot access in the MSFT page | addressed | `tests/provider-credentials.load.mjs`, `msft-july-print-model.html` |
| 2026-07-14 | Exact Playwright command cannot resolve a local package; cached full corpus has three unrelated Causal launch failures | routed | `tests/playwright-runtime.mjs`, Causal Rotation test owner / repository-readiness owner |
| 2026-07-14 | Managed docs and project instructions may still describe durable or enabled browser credential paths | routed | `bubbles.docs`; implementation phase did not edit managed docs/instructions |

## Validation Summary

Artifact lint and traceability pass. Targeted unit, functional, browser, stress, load, static registry, full selftest, declared repository validators, diagnostics, and change-boundary checks pass. G028, exact/broad Playwright, planning, phase-record, and certification gates remain blocked as recorded above. The packet remains `in_progress`; SCOPE-01 and SCOPE-02 remain `In Progress` with only evidenced DoD items checked.

## Audit Verdict

No audit attempt exists. `bubbles.audit` has not been invoked, and `bubbles.validate` has not certified any state.

## Implementation Reconciliation - 2026-07-14

### Execution Status

SCOPE-01 was reconciled before SCOPE-02. Product and test changes now implement
the central same-tab credential envelope, index-only mutation, explicit
migration and scrub behavior, registered-tool consumer purge, and provider
transport policy. Neither scope is marked Done because the exact planned
Playwright suite has not executed and the isolated downstream G028 scan remains
blocking. Certification fields remain unchanged.

### Scenario-First RED Observation

**Phase:** implement
**Command:** `node --test tests/provider-credentials.unit.mjs`
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** The command ran before the `rldata.js` envelope change and
the terminal output directly reported that the new envelope assertion failed.
The raw TAP capture was observed in-session but was not retained as a standalone
terminal resource after concurrent terminal output interleaved. The observed
mismatch was:

```text
Expected one session entry:
rlSessionProviderCredentialsV1
  v: 1
  credentials.finnhub: BUG001-ENVELOPE-FH
  credentials.fred: BUG001-ENVELOPE-FRED
Observed three session entries:
marketProvider:credentialSchema
marketProvider:finnhub:apiKey
marketProvider:fred:apiKey
Result: approved credentials share one versioned same-tab envelope failed
Exit code: 1
```

This interpreted block records the observed RED discriminator but is not used
to close any DoD checkbox. The persistent regression remains in
`tests/provider-credentials.unit.mjs`.

### Focused GREEN Evidence

**Phase:** implement
**Command:** `node --test tests/provider-credentials.unit.mjs; node --test tests/provider-credentials.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
unknown and prototype-shaped provider ids fail without mutation
approved credentials share one versioned same-tab envelope
verified header provider builds a secret-free URL and no query fallback
tests 3
pass 3
fail 0
skipped 0
BUG001_UNIT_EXIT=0
consent migration writes verifies scrubs and fails closed atomically
clear all erases session and every known durable legacy location
tool routes cannot migrate erase or clear provider credentials
adversarial scrub failure clears staged session credentials and reports no values
auth failure never retries with a credential query parameter
adversarial credential-like query names and encoded sentinels never enter request URLs
Twelve Data remains disabled without authorization evidence
tests 7
pass 7
fail 0
skipped 0
BUG001_FUNCTIONAL_EXIT=0
```

### Stress Evidence

**Phase:** implement
**Command:** `node tests/provider-credentials.stress.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG001_STRESS_BEGIN
CATEGORY=stress
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PRODUCTION_PAGE=index.html
PRODUCTION_OWNER=rldata.js+rlapp.js
CYCLES=250
RELOADS=10
SESSION_STORE_BOUNDED=true
RENDERED_SENTINELS=0
DIAGNOSTIC_SENTINELS=0
RESULT=PASS
BUG001_STRESS_END
BUG001_STRESS_EXIT=0
```

### Load Evidence

**Phase:** implement
**Command:** `node tests/provider-credentials.load.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG001_LOAD_BEGIN
CATEGORY=load
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PARALLEL_CONTEXTS=8
PAGES_PER_CONTEXT=2
TOTAL_PAGES=16
PRIMARY_CONFIGURED=8
INDEPENDENT_CONFIGURED=0
DURABLE_CREDENTIAL_STORES=0
CROSS_TAB_TRANSFERS=0
RESULT=PASS
BUG001_LOAD_END
BUG001_LOAD_EXIT=0
```

### Broad Regression Evidence

**Phase:** implement
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
rldata.js - shared toolReads round-trip + freshness
provider credential is session-only while non-secret rlData remains durable
central owner exposes no bulk credential or silent migration API
tool registry - tools.json == index == nav; Tier-A adapters registered
rlapp.js - one key surface, all-page status, automatic stale-data refresh
the landing page consumes the central provider registry without duplicate storage ownership
tool pages expose no duplicate credential inputs
registered tools expose no duplicate provider credential setter migration or durable storage access
registered tools expose no credential-bearing provider URL transport
market brief - registry-wide coverage + action-only payload contract
current payload satisfies the executable brief contract
Research-Lab self-test: 345 passed, 0 failed
RESEARCH_LAB_SELFTEST_EXIT=0
```

### Exact Playwright Entrypoint

**Phase:** implement
**Command:** `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list`
**Exit Code:** 1
**Claim Source:** executed

```text
npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]
npm error A complete log of this run can be found in:
/Users/pkirsanov/.npm/_logs/2026-07-14T13_41_23_852Z-debug-0.log
BUG001_E2E_EXIT=1
```

The command stopped during dependency resolution, before any scenario test ran.
The separately executed stress/load scripts use their committed cached-runtime
loader and do not substitute for the exact Playwright test-runner evidence.

### Regression Quality Evidence

**Phase:** implement
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/provider-credentials.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG001_REGRESSION_QUALITY_BEGIN
BUBBLES REGRESSION QUALITY GUARD
Repo: /Users/pkirsanov/Projects/research-lab
Bugfix mode: true
Scanning tests/provider-credentials.spec.mjs
Adversarial signal detected in tests/provider-credentials.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
BUG001_REGRESSION_QUALITY_EXIT=0
BUG001_REGRESSION_QUALITY_END
```

### Downstream G028 Evidence

**Phase:** implement
**Command:** `bash .github/bubbles/scripts/cli.sh scan specs/_bugs/BUG-001-central-provider-credential-security`
**Exit Code:** 1
**Claim Source:** executed

```text
BUG001_G028_BEGIN
INFO: Scopes yielded 0 files - falling back to design.md for file discovery
WARN: Resolved 7 file(s) from design.md fallback
INFO: Resolved 7 implementation file(s) to scan
Scan 2B: Sensitive Client Storage
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:174
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:66
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:108
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
Files scanned: 7
Violations: 5
Warnings: 1
BLOCKED: 5 source code reality violation(s) found
BUG001_G028_EXIT=1
BUG001_G028_END
```

The product contract intentionally requires same-tab session storage, so these
findings cannot be closed by deleting the behavior, disguising the key, or
patching the installed downstream scanner. They remain a canonical framework
classification dependency.

### One-To-One Finding Disposition

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** Dispositions below reconcile each planning-era finding with
the current product changes and executed tests. Scanner-policy findings remain
open because no valid downstream G028 verdict was produced.

| Finding | Disposition | Evidence |
| --- | --- | --- |
| G028-01 | Unresolved framework classification | Non-secret cache comment must remain; current scan still blocks the credential implementation |
| G028-02 | Unresolved framework classification | Non-secret cache retry behavior passes the broad selftest; current scan still blocks |
| G028-03 | Addressed in product | Explicit consent migration and durable scrub pass functional tests |
| G028-04 | Addressed in product | Explicit consent migration and durable scrub pass functional tests |
| G028-05 | Unresolved framework classification; product sanitation retained | Scrub verification passes functional tests |
| G028-06 | Unresolved framework classification; product sanitation retained | Scrub verification passes functional tests |
| G028-07 | Unresolved framework classification; product sanitation retained | Scrub verification passes functional tests |
| G028-08 | Addressed in product | Index reads configured status through the central API; registry selftest passes |
| G028-09 | Addressed in product | Index-only mutation and tool-route rejection pass functional tests |
| SEC-BLIND-01 | Product side addressed; framework scanner semantics unresolved | One versioned envelope regression passes; isolated G028 scan exits 1 with five storage findings |
| SEC-UI-01 | Addressed in product | Stress run reports `RENDERED_SENTINELS=0` across 250 cycles |
| SEC-MIG-01 | Addressed in product | Consent, verify, scrub, erase, and failure rollback cases pass |
| SEC-PROVIDER-01 | Addressed in product | Unknown and prototype-shaped provider IDs fail without mutation |
| SEC-CONSUMER-01 | Addressed in product | Registry-derived selftests report no duplicate editors, writers, or migrations |
| SEC-TRANSPORT-01 | Addressed in product | Header request and adversarial URL tests pass; registered URL transport sweep passes |
| SEC-TD-01 | Addressed in product | Twelve Data browser credential path returns disabled and emits no request |
| SEC-TEST-01 | Addressed in product | Canonical selftest now enforces session-only credentials and passes 345/345 |
| DEP-G028-SESSION | Blocking framework dependency | Installed scanner exits 1 while the product contract requires same-tab session storage |
| DEP-G028-FALSE-POSITIVE | Unresolved framework dependency | Baseline classifications and current five-row scan require canonical scanner-owner resolution |

### Change Boundary Observation

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The current status inventory shows the credential slice and
the protected Market Brief, Bond Regime, and causal-rotation families are all
dirty in the shared worktree. No pre-edit byte hash was captured for the
protected files in this session, so status output cannot prove byte preservation
or attribute concurrent edits. This implementation did not intentionally edit
those protected families, and no commit, push, reset, checkout, stash, clean, or
dependency installation command was executed.

### Implementation Uncertainty Declarations

#### Browser Scenario Replay

- **What was attempted:** The exact planned Playwright command above.
- **What was observed:** Dependency resolution stopped with missing `playwright@1.61.1`; zero scenario tests ran.
- **Why this is uncertain:** SCN-BUG001-001 through SCN-BUG001-011 lack exact-runner browser evidence even though focused, stress, load, and static regression checks pass.
- **What resolves it:** Execute the same committed command in an environment where its locked runtime is already available, without installing or substituting another runner in this worktree.

#### Downstream G028 Policy Blocker

- **What was attempted:** After the concurrent framework process exited, the installed downstream `scan` command was invoked with explicit begin, exit, and end sentinels.
- **What was observed:** The scan resolved seven implementation files, reported five `SENSITIVE_CLIENT_STORAGE` violations in `rldata.js`, and exited 1.
- **Why this blocks certification:** The current scanner rejects the required same-tab credential store; product-side regex evasion or deletion would violate the active bug contract.
- **What resolves it:** The canonical framework owner ships and the downstream installation consumes classification semantics that distinguish this approved provider-credential envelope from forbidden auth, session, and payment secret storage.

## Detailed Implementation Reconciliation - 2026-07-14

This section records the current `bubbles.implement` execution window. The
planning-era sections above remain the record of the bug-discovery phase; they
do not describe the implementation state reached in this window. No scope
status, DoD checkbox, execution phase claim, certification field, or top-level
status was promoted.

### Implemented Surfaces

- `rldata.js`: one versioned same-tab credential envelope, closed-provider
  parsing, index-only set/migrate/erase/clear mutations, transactional legacy
  scrub verification, and central provider request policy.
- `index.html` and `rlapp.js`: the landing page remains the sole credential
  editor and renders status rather than stored values.
- `ai-capex-strategy-lab.html`, `etf-momentum-lab.html`,
  `options-structure-lab.html`, `sector-research-lab.html`, and
  `strategy-validation-lab.html`: local credential controls, durable writers,
  migration helpers, and credential-bearing query construction were removed.
  Finnhub uses the central header policy; unverified browser-key paths fail
  closed.
- `tests/provider-credentials.*.mjs` and `scripts/selftest.mjs`: focused
  lifecycle, consumer, transport, browser, stress, load, and registry-derived
  regressions cover the changed behavior.

### Scenario-First RED Evidence

**Phase:** implement  
**Command:** `node --test tests/provider-credentials.unit.mjs`  
**Exit Code:** 1  
**Claim Source:** interpreted  
**Interpretation:** A current-session execution of the newly added test
`approved credentials share one versioned same-tab envelope` failed before the
production edit. The observed assertion showed three actual session entries -
`marketProvider:credentialSchema`, `marketProvider:finnhub:apiKey`, and
`marketProvider:fred:apiKey` - instead of the expected sole
`rlSessionProviderCredentialsV1` envelope. The terminal output was observed in
this session but was not retained as a standalone raw-output artifact, so this
block is not used to check any DoD item.

### Detailed Focused GREEN Evidence

**Phase:** implement  
**Command:** `node --test tests/provider-credentials.unit.mjs; node --test tests/provider-credentials.functional.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
ok 1 - unknown and prototype-shaped provider ids fail without mutation
ok 2 - approved credentials share one versioned same-tab envelope
ok 3 - verified header provider builds a secret-free URL and no query fallback
# tests 3
# pass 3
# fail 0
# skipped 0
BUG001_UNIT_EXIT=0
ok 1 - consent migration writes verifies scrubs and fails closed atomically
ok 2 - clear all erases session and every known durable legacy location
ok 3 - tool routes cannot migrate erase or clear provider credentials
ok 4 - adversarial scrub failure clears staged session credentials and reports no values
ok 5 - auth failure never retries with a credential query parameter
ok 6 - adversarial credential-like query names and encoded sentinels never enter request URLs
ok 7 - Twelve Data remains disabled without authorization evidence
# tests 7
# pass 7
# fail 0
# skipped 0
BUG001_FUNCTIONAL_EXIT=0
```

### Stress And Load Evidence

**Phase:** implement  
**Command:** `node tests/provider-credentials.stress.mjs; node tests/provider-credentials.load.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUG001_STRESS_BEGIN
CATEGORY=stress
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PRODUCTION_PAGE=index.html
PRODUCTION_OWNER=rldata.js+rlapp.js
CYCLES=250
RELOADS=10
SESSION_STORE_BOUNDED=true
RENDERED_SENTINELS=0
DIAGNOSTIC_SENTINELS=0
RESULT=PASS
BUG001_STRESS_END
BUG001_STRESS_EXIT=0
BUG001_LOAD_BEGIN
CATEGORY=load
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PARALLEL_CONTEXTS=8
PAGES_PER_CONTEXT=2
TOTAL_PAGES=16
PRIMARY_CONFIGURED=8
INDEPENDENT_CONFIGURED=0
DURABLE_CREDENTIAL_STORES=0
CROSS_TAB_TRANSFERS=0
RESULT=PASS
BUG001_LOAD_END
BUG001_LOAD_EXIT=0
```

### Detailed Broad Regression Evidence

**Phase:** implement  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Evidence Window:** Credential/registry assertions and final summary from the
full 345-check output.

```text
rldata.js - shared toolReads round-trip + freshness
  PASS legacy detection reports redacted presence without silent activation
  PASS explicit consent migrates allowlisted provider credentials into the same-tab store
  PASS legacy durable key copies are scrubbed after verified migration
  PASS central same-tab provider key updates round-trip
  PASS provider credential is session-only while non-secret rlData remains durable
  PASS central owner exposes no bulk credential or silent migration API
rlapp.js - one key surface, all-page status, automatic stale-data refresh
  PASS the landing page consumes the central provider registry without duplicate storage ownership
  PASS tool pages expose no duplicate credential inputs
  PASS registered tools expose no duplicate provider credential setter migration or durable storage access
  PASS registered tools expose no credential-bearing provider URL transport
market brief - registry-wide coverage + action-only payload contract
  PASS current payload satisfies the executable brief contract
================================================
Research-Lab self-test: 345 passed, 0 failed
================================================
RESEARCH_LAB_SELFTEST_EXIT=0
```

### Browser E2E Uncertainty

**Phase:** implement  
**Command:** `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list`  
**Exit Code:** 1  
**Claim Source:** not-run  
**Reason:** The command failed during runner resolution before any scenario was
collected or executed.

```text
npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]
npm error A complete log of this run can be found in:
/Users/pkirsanov/.npm/_logs/2026-07-14T13_41_23_852Z-debug-0.log
BUG001_E2E_EXIT=1
```

The global Playwright 1.40.0 executable was not substituted for the required
project command. SCN-BUG001-001 through SCN-BUG001-011 therefore have no
current-session browser-run verdict from `tests/provider-credentials.spec.mjs`.

### Observed G028 Blocker

**Phase:** implement  
**Claim Source:** executed  
**Command:** `bash .github/bubbles/scripts/cli.sh scan specs/_bugs/BUG-001-central-provider-credential-security`  
**Exit Code:** 1  
**Result:** The isolated invocation resolved seven implementation files and
reported five `SENSITIVE_CLIENT_STORAGE` violations in `rldata.js`. The full
raw window is recorded under `### Downstream G028 Evidence` above. The product
implementation does not delete the valid non-secret `localStorage.rlData`
cache, weaken verified scrub behavior, disguise identifiers, or patch the
installed downstream scanner.

### Change Boundary Evidence

**Phase:** implement  
**Command:** `git status --short -- <credential slice> <protected families>`  
**Exit Code:** 0  
**Claim Source:** interpreted  
**Interpretation:** Every manual edit in this execution window targeted the
credential slice listed under Implemented Surfaces or this report. Protected
Market Brief, Bond Regime, causal-rotation, distributed-brief, and installed
framework paths were never targets of an edit operation. Those paths were
already being changed concurrently, and no pre-edit byte hash was captured for
the Research Lab protected set, so current dirty status cannot prove their byte
identity or author attribution. No stronger preservation claim is made.

### Detailed One-To-One Finding Disposition

| Finding | Current disposition | Evidence or remaining owner |
| --- | --- | --- |
| G028-01 | Upstream open | Valid non-secret cache retained; isolated downstream scan exits 1 |
| G028-02 | Upstream open | Valid non-secret cache retained; isolated downstream scan exits 1 |
| G028-03 | Product addressed | Consented migration and complete durable scrub pass focused functional tests |
| G028-04 | Product addressed | Consented migration and complete durable scrub pass focused functional tests |
| G028-05 | Upstream open | Sanitizing delete-before-write behavior retained and functionally verified |
| G028-06 | Upstream open | Sanitizing delete-before-write behavior retained and functionally verified |
| G028-07 | Upstream open | Sanitizing delete-before-write behavior retained and functionally verified |
| G028-08 | Product addressed | Landing page reads status through central API; registry selftest passes |
| G028-09 | Product addressed | Landing page writes through index-only same-tab API; focused tests pass |
| SEC-BLIND-01 | Product addressed, upstream open | Indirect central store is covered by exact envelope tests; isolated scan still blocks on five rows |
| SEC-UI-01 | Product addressed | Save/remount fields blank; stress run reports zero rendered sentinels |
| SEC-MIG-01 | Product addressed | Dismiss/consent/transaction/scrub/failure behaviors have focused tests |
| SEC-PROVIDER-01 | Product addressed | Closed allowlist and prototype-shaped IDs pass adversarial unit coverage |
| SEC-CONSUMER-01 | Product addressed | Five tool consumers purged; registry-derived selftest passes |
| SEC-TRANSPORT-01 | Product addressed | Finnhub header policy and zero query fallback pass focused tests |
| SEC-TD-01 | Product addressed | Twelve Data browser credential transport remains fail-closed |
| SEC-TEST-01 | Product addressed | Credential assertions were replaced; canonical selftest is 345/345 |
| DEP-G028-SESSION | Upstream open | Final policy/scanner compatibility requires the canonical Bubbles owner |
| DEP-G028-FALSE-POSITIVE | Upstream open | Five semantic false-positive rows require the canonical Bubbles owner |
| IMPL-ENVELOPE-01 | Addressed in this window | Failing per-provider layout replaced by one versioned envelope; unit GREEN |
| IMPL-INDEX-01 | Addressed in this window | Tool-route set/migrate/erase/clear mutations fail closed; functional GREEN |
| IMPL-VERIFY-01 | Addressed in this window | Migration envelope verification is semantic and insertion-order independent |
| IMPL-CONSUMER-01 | Addressed in this window | Five registered tool pages no longer own credential editing or URL auth |

### Required Test-Owner Packet

The next required owner is `bubbles.test`. The test phase must preserve the
finding ledger above and resolve these items without weakening the planned
browser scenarios:

1. Execute the exact Playwright 1.61.1 command for
   `tests/provider-credentials.spec.mjs` and account for all eleven named
   scenarios with zero skips. The cached-runner result above is supplemental
   and does not replace the exact project command.
2. Run the broader project-declared Playwright regression command.
3. Re-run stress, load, focused Node suites, touched-page canaries, and the
   canonical selftest if browser-test changes are required.
4. Preserve the isolated G028 exit-1 result until the canonical scanner upgrade
   is installed; preserve the five classification rows and the session-envelope
   policy conflict without regex evasion.
5. Preserve the protected dirty-work families and report attribution limits
   honestly when concurrent writers prevent byte-level proof.

Project-owned credential documentation remains inconsistent with the delivered
same-tab contract and belongs to `bubbles.docs` after the test phase has a
complete browser verdict. Certification remains exclusively owned by
`bubbles.validate`.

## Independent Test Verification 2026-07-14

### SCOPE-01 Test Verdict

`NOT_TESTED`. Nine scenarios have current semantic passing evidence. SCN-BUG001-004
has a current product failure because the planned legacy-dismiss action is absent.
SCN-BUG001-011 remains blocked by the five installed G028 findings and the
same-tab `sessionStorage` policy conflict. The exact planned Playwright commands
also stop before test collection because no local Playwright package is installed.
No package installation, product-code change, framework edit, or certification
change was performed by `bubbles.test`.

Historical complete RED evidence remains unavailable for behavior that had
already landed before this verification. No historical failure is reconstructed
or claimed by this section.

### Test-Owned Integrity Repairs

- The unknown-provider unit and browser regressions now begin with a populated
  approved-provider envelope and prove rogue calls preserve it.
- The tool-route functional regression now covers `setKey` as well as migrate,
  erase, and clear operations.
- The header-auth browser regression now executes production `providerFetch`
  through one simulated external-provider 401, verifies exactly one attempt,
  and verifies header-only/no-referrer transport with no query retry.
- The non-secret cache canary now reloads the real page before asserting the
  persisted `rlData` round trip.
- The sentinel regression now includes the production unknown-provider error
  result in its disclosure scan.
- The planned legacy-dismiss branch is now a direct browser assertion. It fails
  against current production and remains strict for `bubbles.implement`.

### Final Unit Evidence

**Phase:** test  
**Command:** `node --test tests/provider-credentials.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
✔ unknown and prototype-shaped provider ids fail without mutation (1.712292ms)
✔ approved credentials share one versioned same-tab envelope (0.154833ms)
✔ verified header provider builds a secret-free URL and no query fallback (0.27725ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 51.604791
```

**Result:** PASS

### Final Functional Evidence

**Phase:** test  
**Command:** `node --test tests/provider-credentials.functional.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
✔ consent migration writes verifies scrubs and fails closed atomically (1.566959ms)
✔ clear all erases session and every known durable legacy location (0.2465ms)
✔ tool routes cannot migrate erase or clear provider credentials (0.56575ms)
✔ adversarial scrub failure clears staged session credentials and reports no values (0.310458ms)
✔ auth failure never retries with a credential query parameter (0.333208ms)
✔ adversarial credential-like query names and encoded sentinels never enter request URLs (0.259917ms)
✔ Twelve Data remains disabled without authorization evidence (0.187833ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 60.1395
```

**Result:** PASS

### Exact Planned Browser Entrypoints

**Phase:** test  
**Command:** `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list`  
**Exit Code:** 1  
**Claim Source:** executed

```text
BUG001_EXACT_TARGET_BEGIN
COMMAND=npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list
INSTALL_ALLOWED=false
SUPPLEMENTARY_RUNNER=false
npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]
npm error A complete log of this run can be found in the npm cache log directory
EXIT_CODE=1
RUNNER_RESOLUTION=missing-local-package
SCENARIOS_EXECUTED=0
RESULT=ENVIRONMENT_GAP
BUG001_EXACT_TARGET_END
```

**Result:** ENVIRONMENT GAP. The command was attempted without installing
packages and executed zero scenarios.

**Phase:** test  
**Command:** `npx --no-install playwright test --reporter=list`  
**Exit Code:** 1  
**Claim Source:** executed

```text
BUG001_EXACT_BROAD_BEGIN
COMMAND=npx --no-install playwright test --reporter=list
INSTALL_ALLOWED=false
SUPPLEMENTARY_RUNNER=false
npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]
npm error A complete log of this run can be found in the npm cache log directory
EXIT_CODE=1
RUNNER_RESOLUTION=missing-local-package
SCENARIOS_EXECUTED=0
RESULT=ENVIRONMENT_GAP
BUG001_EXACT_BROAD_END
```

**Result:** ENVIRONMENT GAP. The broader exact command also executed zero
scenarios.

### Supplementary Real-Browser Evidence

**Phase:** test  
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/provider-credentials.spec.mjs --reporter=list`  
**Exit Code:** 1  
**Claim Source:** executed

```text
Running 12 tests using 1 worker
PASS Canary: real index loads RLDATA before RLAPP with one credential editor
PASS Regression BUG-001: only index can mutate provider credentials
PASS Regression BUG-001: same-tab navigation retains credentials and an independently opened tab starts empty
PASS Regression BUG-001: save blanks fields and exposes configured status only
FAIL Regression BUG-001: legacy credentials require consent and successful migration scrubs every durable copy
PASS Regression BUG-001: unknown and prototype-shaped providers fail without mutation
PASS Regression BUG-001: clear all removes active and legacy credentials
PASS Regression BUG-001: sentinel credential never appears in DOM console errors URL or referrer
PASS Regression BUG-001: every registered tool has no credential editor or storage writer
PASS Regression BUG-001: Twelve Data browser credential calls remain disabled without authorization evidence
PASS Regression BUG-001: approved header auth never places credentials in URLs or retries with query auth
PASS Regression BUG-001: G028 inventory closes genuine rows without deleting noncredential rlData cache
Locator: getByRole('button', { name: /dismiss|not now|keep inactive/i })
Error: element(s) not found
1 failed
11 passed (15.3s)
```

**Result:** FAIL. This supplementary command used the already-cached Playwright
runtime, the real ephemeral same-origin HTTP server, and system Chrome. It found
a product defect rather than a runner defect: no planned legacy-dismiss action
exists.

**Phase:** test  
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test --reporter=list`  
**Exit Code:** 1  
**Claim Source:** executed

```text
Running 42 tests using 3 workers
FAIL Causal Rotation: Evidence available after a decision is excluded from that decision
FAIL Causal Rotation: One announcement drives price options and ETF activity
FAIL Causal Rotation: Decision-critical valuation and timing inputs are stale or unavailable
FAIL BUG-001: legacy credentials require consent and successful migration scrubs every durable copy
PASS remaining 11 BUG-001 browser cases
PASS all 27 Bond Regime browser cases
Causal failure: bundled chromium_headless_shell executable does not exist
BUG-001 failure: legacy dismiss button element not found
4 failed
38 passed (27.9s)
```

**Result:** FAIL. One failure belongs to BUG-001. The other three are unrelated
Causal Rotation browser-launch prerequisite failures; no Causal or Bond files
were modified.

### Final Stress Evidence

**Phase:** test  
**Command:** `node tests/provider-credentials.stress.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUG001_STRESS_BEGIN
CATEGORY=stress
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PRODUCTION_PAGE=index.html
PRODUCTION_OWNER=rldata.js+rlapp.js
CYCLES=250
RELOADS=10
NAVIGATION_CYCLES=25
PROVIDER_FAILURE_CASES=50
SESSION_STORE_BOUNDED=true
RENDERED_SENTINELS=0
DIAGNOSTIC_SENTINELS=0
RESULT=PASS
BUG001_STRESS_END
```

**Result:** PASS

### Final Load Evidence

**Phase:** test  
**Command:** `node tests/provider-credentials.load.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUG001_LOAD_BEGIN
CATEGORY=load
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PARALLEL_CONTEXTS=8
PAGES_PER_CONTEXT=2
TOTAL_PAGES=16
REGISTERED_PAGES=18
REGISTRY_SOURCE_OFFENDERS=0
REGISTRY_RUNTIME_ERRORS=0
UNVERIFIED_PROVIDER_REQUESTS=0
PRIMARY_CONFIGURED=8
INDEPENDENT_CONFIGURED=0
DURABLE_CREDENTIAL_STORES=0
CROSS_TAB_TRANSFERS=0
RESULT=PASS
BUG001_LOAD_END
```

**Result:** PASS

### Final Static Security And Full Selftest Evidence

**Phase:** test  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
rldata.js - shared toolReads round-trip + freshness
  PASS legacy detection reports redacted presence without silent activation
  PASS explicit consent migrates allowlisted provider credentials into the same-tab store
  PASS legacy durable key copies are scrubbed after verified migration
  PASS central same-tab provider key updates round-trip
  PASS provider credential is session-only while non-secret rlData remains durable
  PASS central owner exposes no bulk credential or silent migration API
rlapp.js - one key surface, all-page status, automatic stale-data refresh
  PASS every registered tool loads RLDATA before RLAPP
  PASS the landing page consumes the central provider registry without duplicate storage ownership
  PASS tool pages expose no duplicate credential inputs
  PASS registered tools expose no duplicate provider credential setter migration or durable storage access
  PASS registered tools expose no credential-bearing provider URL transport
================================================
Research-Lab self-test: 345 passed, 0 failed
================================================
```

**Result:** PASS

### Final Regression And Integrity Evidence

**Phase:** test  
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/provider-credentials.unit.mjs tests/provider-credentials.functional.mjs tests/provider-credentials.spec.mjs tests/provider-credentials.stress.mjs tests/provider-credentials.load.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUBBLES REGRESSION QUALITY GUARD
Bugfix mode: true
Scanning tests/provider-credentials.unit.mjs
Adversarial signal detected in tests/provider-credentials.unit.mjs
Scanning tests/provider-credentials.functional.mjs
Adversarial signal detected in tests/provider-credentials.functional.mjs
Scanning tests/provider-credentials.spec.mjs
Adversarial signal detected in tests/provider-credentials.spec.mjs
Scanning tests/provider-credentials.stress.mjs
Adversarial signal detected in tests/provider-credentials.stress.mjs
Scanning tests/provider-credentials.load.mjs
Adversarial signal detected in tests/provider-credentials.load.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 5
Files with adversarial signals: 5
```

**Result:** PASS

**Phase:** test  
**Command:** final BUG-001 skip/mock/writer/query source scan  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUG001_INTEGRITY_SCAN_BEGIN
SKIP_MARKERS=0
INTERNAL_LIVE_MOCKS=0
DUPLICATE_TOOL_WRITERS=0
CREDENTIAL_QUERY_URLS=0
LIVE_RUNTIME=ephemeral-same-origin-http
BROWSER=system-chrome
REGISTERED_PAGES=18
EXTERNAL_401_BOUNDARY_SIMULATION=1
PRODUCTION_CREDENTIAL_CORE_MOCKED=false
RESULT=PASS
BUG001_INTEGRITY_SCAN_END
```

**Result:** PASS. The one fetch substitution simulates only the true external
Finnhub 401 boundary. Production `RLDATA`, `RLAPP`, browser storage, DOM, static
server, navigation, and provider-policy code remain real and unmocked.

### Current G028 Evidence

**Phase:** test  
**Command:** `bash .github/bubbles/scripts/cli.sh scan specs/_bugs/BUG-001-central-provider-credential-security`  
**Exit Code:** 1  
**Claim Source:** executed

```text
INFO: Scopes yielded 0 files - falling back to design.md for file discovery
WARN: Resolved 7 file(s) from design.md fallback - scopes.md should reference these directly
INFO: Resolved 7 implementation file(s) to scan
--- Scan 2B: Sensitive Client Storage ---
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:174
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:66
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:108
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
Files scanned: 7
Violations: 5
Warnings: 1
BLOCKED: 5 source code reality violation(s) found
```

**Result:** FAIL. Findings are preserved exactly. No downstream framework script,
identifier, cache behavior, or scrub behavior was changed to evade the scan.

### Semantic Scenario Audit

| Scenario | Semantic test path | Current result |
| --- | --- | --- |
| SCN-BUG001-001 | Real index/tool registry browser sweep plus tool-route set/migrate/erase/clear rejection | PASS |
| SCN-BUG001-002 | Same-tab reload/navigation plus independent page and 8-context load isolation | PASS |
| SCN-BUG001-003 | Save/remount blank-field browser assertions plus 250-cycle stress | PASS |
| SCN-BUG001-004 | No silent activation, consented migration, scrub rollback, and explicit dismiss branch | FAIL - dismiss action absent |
| SCN-BUG001-005 | Populated-envelope preservation under unknown/prototype-shaped IDs | PASS |
| SCN-BUG001-006 | Functional/browser clear plus repeated stress clear | PASS |
| SCN-BUG001-007 | DOM/input/error-result/console/page-error/request-URL/referrer sentinel scan | PASS |
| SCN-BUG001-008 | Registry-derived static scan, all-page real browser sweep, and concurrent load | PASS |
| SCN-BUG001-009 | Production disabled-provider result with zero Twelve Data request | PASS |
| SCN-BUG001-010 | Production request builder/fetch, approved header/origin, one external 401 attempt, and zero query retry | PASS |
| SCN-BUG001-011 | Persisted non-secret cache reload plus installed G028 | BLOCKED - cache passes, G028 fails |

The test data paths are not self-validating: storage assertions cross production
validation and serialization; cache assertions cross a full page reload; request
assertions cross production policy and error mapping; browser assertions cross
real DOM/navigation/storage boundaries. Reintroducing durable credential storage,
rogue-ID mutation, query auth/retry, tool-local writers, tab crossover, rendered
secrets, or cache deletion would fail at least one current adversarial assertion.

### Independent Finding Accounting

| Finding | Disposition | Owner |
| --- | --- | --- |
| TEST-BASELINE-01 | Addressed: unknown-provider tests now preserve a populated approved envelope | `bubbles.test` |
| TEST-TOOL-MUTATION-01 | Addressed: tool-route functional test now includes `setKey` | `bubbles.test` |
| TEST-NO-RETRY-01 | Addressed: browser test now executes production auth-failure mapping and proves one attempt | `bubbles.test` |
| TEST-CACHE-ROUNDTRIP-01 | Addressed: cache canary now reloads before reading | `bubbles.test` |
| TEST-ERROR-SURFACE-01 | Addressed: safe rejection result is included in sentinel disclosure assertions | `bubbles.test` |
| TEST-RUN-CWD-01 | Addressed: one cached broad invocation ran from QuantitativeFinance, was rejected as evidence, left no `test-results` status there, and was rerun from Research Lab | `bubbles.test` |
| TEST-RESULTS-ATTRIBUTION-01 | Observed: Research Lab has untracked Playwright screenshots/error contexts after the required broader run; pre-run per-file attribution is unavailable, so they were preserved and no source-input claim is made | `bubbles.test` |
| PRODUCT-LEGACY-DISMISS-01 | Unresolved: no user action dismisses the redacted legacy notice while leaving credentials inactive and durable copies untouched | `bubbles.implement` |
| G028-CURRENT-01 through G028-CURRENT-05 | Unresolved: exact five installed scanner findings above | canonical Bubbles framework owner |
| DEP-G028-SESSION | Unresolved: framework policy conflicts with the ratified same-tab provider credential contract | canonical Bubbles framework owner |
| PLAN-SCAN-DISCOVERY-01 | Unresolved: reality scan cannot discover implementation files from `scopes.md` and falls back to design | `bubbles.plan` |
| FRAMEWORK-TRACE-AMBIGUITY-01 | Unresolved: traceability passes but labels 9 scenario-to-row edges ambiguous and reports the unit file for unrelated UI scenarios | canonical Bubbles framework owner |
| ENV-PLAYWRIGHT-LOCAL-01 | Unresolved: both exact `npx --no-install` commands lack a local package and execute zero tests | `bubbles.devops` |
| ENV-CAUSAL-BROWSER-01 | Unresolved outside BUG-001: three Causal Rotation tests require a missing bundled Chromium instead of the available system Chrome | `bubbles.test` for `specs/001-causal-rotation-intelligence` |
| DOC-CREDENTIAL-TRUTH-01 | Unresolved: current command/policy documentation still describes durable `localStorage.rlApiKeys` | `bubbles.docs` |
| RED-PROVENANCE-01 | Honest historical gap retained; no synthetic complete RED proof is authorized | `bubbles.validate` |

No scope, DoD checkbox, state execution claim, certification field, or top-level
status is promoted by this test evidence.

### Final Guard And Change-Boundary Evidence

**Phase:** test  
**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-001-central-provider-credential-security`  
**Exit Code:** 1  
**Claim Source:** executed

```text
DoD items total: 31 (checked: 20, unchecked: 11)
Resolved scopes: total=2, Done=0, In Progress=2
BLOCK: 8 specialist phases missing
BLOCK: 12 of 13 test files from Test Plan DO NOT EXIST
Reported missing path: tests/provider-credentials.spec
BLOCK: 2 scenario-specific regression E2E planning requirements missing
BLOCK: 1 consumer-trace planning requirement missing
BLOCK: 1 change-boundary containment requirement missing
BLOCK: implementation reality scan found 5 source code violations
BLOCK: 11 Gherkin scenarios have no matching DoD item
BLOCK: framework dogfood evidence contract failed
BLOCK: capability foundation guard failed
TRANSITION BLOCKED: 48 failure(s), 3 warning(s)
failedGateIds: [G060,G061,G022,G028,G001,G068,G085,G094]
blockingCode: DELIVERY_COMPLETION_FAILED
exitStatus: 1
verdict: FAIL
```

**Result:** FAIL as required. The packet remains `in_progress` and no status
write was attempted. Two results are internally inconsistent with the dedicated
guard: `traceability-guard.sh` finds all `.mjs` files and passes 11 scenario / 29
row mappings, while this guard truncates the path to
`tests/provider-credentials.spec` and fails all 11 G068 mappings.

**Phase:** test  
**Command:** final BUG-001 path-scoped status and `git diff --check` boundary command  
**Exit Code:** 0  
**Claim Source:** interpreted  
**Interpretation:** The status output proves the current path classifications,
and the edit-tool audit proves this invocation targeted only the five test-owned
files listed below. Protected files were already dirty/untracked, so status alone
does not prove byte identity or author attribution; no stronger claim is made.

```text
BUG001_CHANGE_BOUNDARY_BEGIN
TEST_OWNED_PATHS
?? specs/_bugs/BUG-001-central-provider-credential-security/report.md
?? specs/_bugs/BUG-001-central-provider-credential-security/scenario-manifest.json
?? tests/provider-credentials.functional.mjs
?? tests/provider-credentials.spec.mjs
?? tests/provider-credentials.unit.mjs
STATE_PATH
?? specs/_bugs/BUG-001-central-provider-credential-security/state.json
PROTECTED_BOND_PATHS
?? bond-regime-lab.html
?? bond-regime-universe.json
?? notes/bond-regime-lab.md
?? specs/003-bond-regime-and-scenario-lab/
?? tests/bond-regime-lab.spec.mjs
?? tests/fixtures/bond-regime/
PROTECTED_DATA_AND_UNIVERSES
?? bond-regime-universe.json
?? causal-rotation-ledger.jsonl
DIFF_CHECK_EXIT=0
FRAMEWORK_EDIT_CALLS_THIS_RUN=0
BOND_EDIT_CALLS_THIS_RUN=0
GENERATED_DATA_EDIT_CALLS_THIS_RUN=0
UNIVERSE_EDIT_CALLS_THIS_RUN=0
STATE_EDIT_CALLS_THIS_RUN=0
BUG001_CHANGE_BOUNDARY_END
```

**Result:** PASS with the attribution limitation above. No Bond Regime,
generated-data, universe, market-formula, downstream-framework, or `state.json`
file was an edit target in this verification.

Additional guard findings are owner-routed as follows:

| Finding | Exact current fact | Owner |
| --- | --- | --- |
| FRAMEWORK-MJS-PARSER-01 | State guard truncates `.spec.mjs` to `.spec` and reports 12 existing tests missing | canonical Bubbles framework owner |
| FRAMEWORK-G068-DIVERGENCE-01 | State guard fails all 11 G068 mappings while traceability passes all 11 | canonical Bubbles framework owner |
| FRAMEWORK-PLAN-MATCHER-01 | State guard misses explicit scenario-E2E, consumer-sweep, and allowed/excluded boundary text present in `scopes.md` | canonical Bubbles framework owner |
| PLAN-CAPABILITY-G094-01 | Capability-foundation sections/tags required by the installed guard are absent | `bubbles.analyst`, then `bubbles.design`, then `bubbles.plan` |
| PROJECT-DOGFOOD-G085-01 | Project has no numeric spec currently recorded top-level `done` | `bubbles.validate` / workflow owner |
| REPORT-EVIDENCE-WARN-01 | State guard warns that 19 pre-existing report evidence blocks lack terminal-output signals | `bubbles.implement`, then `bubbles.audit` |
| STATE-SCHEMA-WARN-01 | Artifact lint warns on deprecated `scopeProgress`, `statusDiscipline`, and `scopeLayout` fields | `bubbles.validate` |

## Independent Test Replay After Legacy Dismissal Fix - 2026-07-14

### Replay Verdict

**Phase:** test  
**Claim Source:** executed

`NOT_TESTED` remains the aggregate verdict because the selected matrix is not
fully green. The BUG-001 behavior matrix is green: unit 3/3, functional 7/7,
cached-runtime browser E2E 12/12, stress PASS, load PASS, regression-quality
PASS, zero skip markers, and zero internal live-test interceptions. The exact
targeted and broad `npx --no-install` entrypoints still stop before test
collection because Playwright is not installed locally. The full project
selftest now fails two unrelated Market Brief groups while parsing the already
modified protected `market-brief.payload.json`, the broad browser corpus still
has three unrelated Causal Rotation browser-launch failures, and G028 still
reports five blocking rows in `rldata.js`.

The earlier independent-test section remains a truthful record of the missing
legacy-dismiss action at that time. This replay supersedes only that current
product result: the strengthened dismissal assertion now passes and proves the
same-tab store remains empty while durable legacy copies remain untouched.
Historical complete RED evidence for behavior that landed before this test
phase remains unavailable. No scope, DoD checkbox, execution claim,
certification field, or top-level status is promoted here.

### Current Unit Evidence

**Phase:** test  
**Command:** `node --test tests/provider-credentials.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
✔ unknown and prototype-shaped provider ids fail without mutation (6.005375ms)
✔ approved credentials share one versioned same-tab envelope (1.035125ms)
✔ verified header provider builds a secret-free URL and no query fallback (1.238292ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 69.048041
```

**Result:** PASS.

### Current Functional Evidence

**Phase:** test  
**Command:** `node --test tests/provider-credentials.functional.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
✔ consent migration writes verifies scrubs and fails closed atomically (1.569375ms)
✔ clear all erases session and every known durable legacy location (0.252875ms)
✔ tool routes cannot migrate erase or clear provider credentials (0.821333ms)
✔ adversarial scrub failure clears staged session credentials and reports no values (0.645125ms)
✔ auth failure never retries with a credential query parameter (0.416375ms)
✔ adversarial credential-like query names and encoded sentinels never enter request URLs (0.321292ms)
✔ Twelve Data remains disabled without authorization evidence (0.325791ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 84.429625
```

**Result:** PASS.

### Exact Playwright Command Gaps

**Phase:** test  
**Command:** `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list`  
**Exit Code:** 1  
**Claim Source:** executed

The npm home-path log line is omitted from this output window under the
evidence PII policy; all other diagnostic lines are preserved.

```text
BUG001_EXACT_TARGET_BEGIN
COMMAND=npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list
INSTALL_ALLOWED=false
PACKAGE_INSTALL_PERFORMED=false
npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]
EXIT_CODE=1
RUNNER_RESOLUTION=missing-local-package
SCENARIOS_EXECUTED=0
RESULT=ENVIRONMENT_GAP
BUG001_EXACT_TARGET_END
```

**Result:** ENVIRONMENT GAP. Zero scenario tests executed; this is not a pass.

**Phase:** test  
**Command:** `npx --no-install playwright test --reporter=list`  
**Exit Code:** 1  
**Claim Source:** executed

```text
BUG001_EXACT_BROAD_BEGIN
COMMAND=npx --no-install playwright test --reporter=list
INSTALL_ALLOWED=false
PACKAGE_INSTALL_PERFORMED=false
npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]
EXIT_CODE=1
RUNNER_RESOLUTION=missing-local-package
SCENARIOS_EXECUTED=0
RESULT=ENVIRONMENT_GAP
BUG001_EXACT_BROAD_END
```

**Result:** ENVIRONMENT GAP. Zero broad tests executed; this is not a pass.

### Current Real-Browser E2E Evidence

**Phase:** test  
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test tests/provider-credentials.spec.mjs --reporter=list`  
**Exit Code:** 0  
**Claim Source:** executed

```text
Running 12 tests using 1 worker
  ✓   1 …real index loads RLDATA before RLAPP with one credential editor (713ms)
  ✓   2 … Regression BUG-001: only index can mutate provider credentials (314ms)
  ✓   3 …etains credentials and an independently opened tab starts empty (965ms)
  ✓   4 … BUG-001: save blanks fields and exposes configured status only (378ms)
  ✓   5 …uire consent and successful migration scrubs every durable copy (709ms)
  ✓   6 …1: unknown and prototype-shaped providers fail without mutation (273ms)
  ✓   7 …ession BUG-001: clear all removes active and legacy credentials (354ms)
  ✓   8 … credential never appears in DOM console errors URL or referrer (385ms)
  ✓   9 …every registered tool has no credential editor or storage writer (4.5s)
  ✓  10 …credential calls remain disabled without authorization evidence (268ms)
  ✓  11 …uth never places credentials in URLs or retries with query auth (239ms)
  ✓  12 …closes genuine rows without deleting noncredential rlData cache (416ms)
12 passed (12.5s)
```

**Result:** PASS through the already verified cached Playwright runtime and
system Chrome. The exact local-package command above remains a separate failed
prerequisite.

The migration test's dismissal branch directly asserted all of these current
conditions after selecting `Keep inactive`:

```text
legacy notice hidden after dismissal
RLDATA.hasKey('finnhub') = false
same-tab credential store remains empty
localStorage.rlApiKeys remains present
etfMomLab.apiKey remains present
no migration action executed
no erase action executed
durable central copy untouched
durable tool copy untouched
result = PASS inside the 12-case browser run
```

**Claim Source:** interpreted  
**Interpretation:** The lines above describe the assertions executed by the
passing browser test; the direct runner evidence is the 12/12 block immediately
above. They are not represented as separately emitted terminal lines.

### Current Stress Evidence

**Phase:** test  
**Command:** `node tests/provider-credentials.stress.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUG001_STRESS_BEGIN
CATEGORY=stress
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PRODUCTION_PAGE=index.html
PRODUCTION_OWNER=rldata.js+rlapp.js
CYCLES=250
RELOADS=10
NAVIGATION_CYCLES=25
PROVIDER_FAILURE_CASES=50
SESSION_STORE_BOUNDED=true
RENDERED_SENTINELS=0
DIAGNOSTIC_SENTINELS=0
RESULT=PASS
BUG001_STRESS_END
```

**Result:** PASS.

### Current Load Evidence

**Phase:** test  
**Command:** `node tests/provider-credentials.load.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUG001_LOAD_BEGIN
CATEGORY=load
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PARALLEL_CONTEXTS=8
PAGES_PER_CONTEXT=2
TOTAL_PAGES=16
REGISTERED_PAGES=18
REGISTRY_SOURCE_OFFENDERS=0
REGISTRY_RUNTIME_ERRORS=0
UNVERIFIED_PROVIDER_REQUESTS=0
PRIMARY_CONFIGURED=8
INDEPENDENT_CONFIGURED=0
DURABLE_CREDENTIAL_STORES=0
CROSS_TAB_TRANSFERS=0
RESULT=PASS
BUG001_LOAD_END
```

**Result:** PASS.

### Current Full Selftest Evidence

**Phase:** test  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 1  
**Claim Source:** executed

Relevant window from the full 21 KB terminal output:

```text
rldata.js — shared toolReads round-trip + freshness
  ✓ legacy detection reports redacted presence without silent activation
  ✓ explicit consent migrates allowlisted provider credentials into the same-tab store
  ✓ legacy durable key copies are scrubbed after verified migration
  ✓ central same-tab provider key updates round-trip
  ✓ provider credential is session-only while non-secret rlData remains durable
  ✓ central owner exposes no bulk credential or silent migration API
rlapp.js — one key surface, all-page status, automatic stale-data refresh
  ✓ every registered tool loads RLDATA before RLAPP
  ✓ the landing page consumes the central provider registry without duplicate storage ownership
  ✓ tool pages expose no duplicate credential inputs
  ✓ registered tools expose no duplicate provider credential setter migration or durable storage access
  ✓ registered tools expose no credential-bearing provider URL transport
market brief — registry-wide coverage + action-only payload contract
  ✗ FAIL (brief payload contract group threw): Expected ',' or '}' after property value in JSON at position 76744 (line 1224 column 33)
================================================
Research-Lab self-test: 336 passed, 2 failed
================================================
```

**Result:** FAIL. Both failures are Market Brief payload parse failures. A
path-scoped status check reported `M market-brief.payload.json`, and a read of
the reported location showed a malformed object fragment after the
`real-assets-lab` entry. That generated market-data file is a protected,
unrelated surface and was not edited.

### Current Regression Quality Evidence

**Phase:** test  
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/provider-credentials.unit.mjs tests/provider-credentials.functional.mjs tests/provider-credentials.spec.mjs tests/provider-credentials.stress.mjs tests/provider-credentials.load.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-14T15:47:12Z
  Bugfix mode: true
============================================================
ℹ️  Scanning tests/provider-credentials.unit.mjs
✅ Adversarial signal detected in tests/provider-credentials.unit.mjs
ℹ️  Scanning tests/provider-credentials.functional.mjs
✅ Adversarial signal detected in tests/provider-credentials.functional.mjs
ℹ️  Scanning tests/provider-credentials.spec.mjs
✅ Adversarial signal detected in tests/provider-credentials.spec.mjs
ℹ️  Scanning tests/provider-credentials.stress.mjs
✅ Adversarial signal detected in tests/provider-credentials.stress.mjs
ℹ️  Scanning tests/provider-credentials.load.mjs
✅ Adversarial signal detected in tests/provider-credentials.load.mjs
============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 5
  Files with adversarial signals: 5
============================================================
```

**Result:** PASS.

### Current Test Integrity Evidence

**Phase:** test  
**Command:** BUG-001 skip-marker and live-interception scans recorded in this execution  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUG001_SKIP_SCAN_BEGIN
FILES_SCANNED=5
SKIP_MARKERS=0
RESULT=PASS
BUG001_SKIP_SCAN_END
BUG001_LIVE_MOCK_SCAN_BEGIN
LIVE_FILES_SCANNED=3
INTERNAL_LIVE_MOCKS=0
209:    const originalFetch = window.fetch;
210:    window.fetch = async (url, options) => {
226:      window.fetch = originalFetch;
EXTERNAL_401_BOUNDARY_SUBSTITUTIONS=1
PRODUCTION_CREDENTIAL_CORE_MOCKED=false
RESULT=PASS
BUG001_LIVE_MOCK_SCAN_END
```

**Result:** PASS. The one `window.fetch` substitution simulates only the true
external Finnhub 401 boundary. Production `RLDATA`, `RLAPP`, storage, DOM,
static HTTP server, navigation, request construction, and auth-failure mapping
execute unchanged. The sole searched `return;` is the static server's 404
response path, not a scenario bailout.

**Claim Source:** interpreted  
**Interpretation:** Manual assertion tracing across the five BUG-001 test files
found no self-validating required test. Assertions cross production provider
validation and serialization, transactional migration/scrub, full page reload,
real DOM and browser storage, request-policy mapping, registry page loads, and
tab/context isolation. Replacing those production paths with identity or
hardcoded-return behavior would fail the current assertions.

### Current G028 Security Evidence

**Phase:** test  
**Command:** `bash .github/bubbles/scripts/cli.sh scan specs/_bugs/BUG-001-central-provider-credential-security`  
**Exit Code:** 1  
**Claim Source:** executed

```text
ℹ️  INFO: Scopes yielded 0 files — falling back to design.md for file discovery
⚠️  WARN: Resolved 7 file(s) from design.md fallback — scopes.md should reference these directly
ℹ️  INFO: Resolved 7 implementation file(s) to scan
--- Scan 1: Gateway/Backend Stub Patterns ---
--- Scan 1B: Handler / Endpoint Execution Depth ---
--- Scan 1C: Endpoint Not-Implemented / Placeholder Responses ---
--- Scan 1D: External Integration Authenticity ---
--- Scan 2: Frontend Hardcoded Data Patterns ---
--- Scan 2B: Sensitive Client Storage ---
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:174
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:66
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:108
🔴 VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
--- Scan 3: Frontend API Call Absence ---
--- Scan 4: Prohibited Simulation Helpers in Production ---
--- Scan 5: Default/Fallback Value Patterns ---
--- Scan 6: Live-System Test Interception ---
ℹ️  INFO: No live-system test files referenced in scope artifacts for interception scan
--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---
--- Scan 8: Silent Decode Failure Detection (Gate G048) ---
============================================================
  IMPLEMENTATION REALITY SCAN RESULT
============================================================
  Files scanned:  7
  Violations:     5
  Warnings:       1
🔴 BLOCKED: 5 source code reality violation(s) found
```

**Result:** FAIL. The five findings are preserved. No downstream framework
file, credential identifier, non-secret cache behavior, required same-tab
envelope, or verified legacy scrub behavior was changed to evade this gate.

### Current Broad Browser Evidence

**Phase:** test  
**Command:** `node "$HOME/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/cli.js" test --reporter=list`  
**Exit Code:** 1  
**Claim Source:** executed

Relevant raw failure/summary window; the home path is normalized to `~` under
the evidence PII policy:

```text
Running 42 tests using 3 workers
1) tests/causal-rotation-lab.spec.mjs:44:1 › Regression: Evidence available after a decision is excluded from that decision
Error: browserType.launch: Executable doesn't exist at
~/Library/Caches/ms-playwright/chromium_headless_shell-1232/chrome-headless-shell-mac-arm64/chrome-headless-shell
2) tests/causal-rotation-lab.spec.mjs:57:1 › Regression: One announcement drives price options and ETF activity
Error: browserType.launch: Executable doesn't exist at
~/Library/Caches/ms-playwright/chromium_headless_shell-1232/chrome-headless-shell-mac-arm64/chrome-headless-shell
3) tests/causal-rotation-lab.spec.mjs:67:1 › Regression: Decision-critical valuation and timing inputs are stale or unavailable
Error: browserType.launch: Executable doesn't exist at
~/Library/Caches/ms-playwright/chromium_headless_shell-1232/chrome-headless-shell-mac-arm64/chrome-headless-shell
3 failed
  tests/causal-rotation-lab.spec.mjs:44:1 › Regression: Evidence available after a decision is excluded from that decision
  tests/causal-rotation-lab.spec.mjs:57:1 › Regression: One announcement drives price options and ETF activity
  tests/causal-rotation-lab.spec.mjs:67:1 › Regression: Decision-critical valuation and timing inputs are stale or unavailable
39 passed (19.7s)
```

**Result:** FAIL. BUG-001 and Bond Regime are green in the broad run. The three
failures belong to the unrelated Causal Rotation file, which does not select
the available system Chrome executable. No Causal Rotation or Bond Regime file
was edited.

### Current Scenario Result Matrix

| Scenario | Current semantic result | Evidence |
| --- | --- | --- |
| SCN-BUG001-001 | PASS | Real index canary and registry-wide browser sweep |
| SCN-BUG001-002 | PASS | Same-tab reload/navigation plus independent-tab and 8-context isolation |
| SCN-BUG001-003 | PASS | Blank-on-save/remount browser assertions and 250-cycle stress |
| SCN-BUG001-004 | PASS | Dismiss keeps session empty and durable legacy copies untouched; consented migration still verifies and scrubs |
| SCN-BUG001-005 | PASS | Populated-envelope unknown/prototype rejection in unit and browser paths |
| SCN-BUG001-006 | PASS | Functional/browser clear plus repeated stress clear |
| SCN-BUG001-007 | PASS | DOM, console, page-error, request URL, document URL, and referrer sentinel scan |
| SCN-BUG001-008 | PASS | Registry source/runtime sweep and concurrent registered-page load |
| SCN-BUG001-009 | PASS | Disabled result with zero Twelve Data requests |
| SCN-BUG001-010 | PASS | Approved-origin header auth, one external 401, and zero query retry |
| SCN-BUG001-011 | BLOCKED | Product/cache regression passes; installed G028 exits 1 with five rows |

### Current Finding Accounting

| Finding | Disposition | Owner |
| --- | --- | --- |
| PRODUCT-LEGACY-DISMISS-01 | Addressed: `.settings-dismiss` / `Keep inactive` passes and preserves inactive session plus durable legacy copies | `bubbles.implement` evidence replayed by `bubbles.test` |
| TEST-CURRENT-MATRIX-01 | Addressed: unit, functional, 12-case E2E, stress, load, and regression-quality checks pass with zero skips | `bubbles.test` |
| TEST-LIVE-INTEGRITY-01 | Addressed: no internal interception; sole fetch substitution is the external Finnhub 401 boundary | `bubbles.test` |
| TEST-SELF-VALIDATION-01 | Addressed by assertion-path audit: required assertions depend on production processing and real browser boundaries | `bubbles.test` |
| ENV-PLAYWRIGHT-LOCAL-01 | Unresolved: exact targeted and broad commands lack local `playwright@1.61.1` and execute zero scenarios | `bubbles.devops` |
| G028-CURRENT-01 through G028-CURRENT-05 | Unresolved: installed scanner reports the exact five rows above | canonical Bubbles framework owner |
| DEP-G028-SESSION | Unresolved: installed policy rejects the required same-tab provider credential envelope | canonical Bubbles framework owner |
| DATA-MARKET-BRIEF-PARSE-01 | Unresolved, unrelated: modified generated payload is malformed at line 1224 and blocks two full-selftest groups | Market Brief data owner |
| ENV-CAUSAL-BROWSER-01 | Unresolved, unrelated: three Causal Rotation tests require a missing bundled Chromium | owner of `specs/001-causal-rotation-intelligence` |
| RED-PROVENANCE-01 | Honest historical gap retained: complete pre-fix RED does not exist for already-landed behavior | `bubbles.validate` must preserve the uncertainty |
| PLAN-SCAN-DISCOVERY-01 | Unresolved: G028 discovers zero files from scopes and falls back to seven design-derived files | `bubbles.plan` |

### Current Change Boundary

This replay edited only this appended `bubbles.test` report section. It did not
edit product code, test code, `state.json`, `scopes.md`, `test-plan.json`,
`uservalidation.md`, Bond Regime files, Causal Rotation files, generated market
data, unrelated specs, universe files, project instructions, or
framework-managed `.github` assets. Existing dirty and untracked paths were
preserved.

## SCOPE-01 Current-Document Runtime Foundation - 2026-07-15

### Current Outcome

**Phase:** implement  
**Claim Source:** executed

SCOPE-01 implementation and its seven exact scenario rows executed. Unit,
functional, and provider Playwright commands are green. The scope remains
`In Progress`, not `Done`, because the repository selftest, implementation
reality scan, Feature 004 collision check, and complete dirty-hunk proof remain
nonzero or uncertain. SCOPE-02 through SCOPE-05 were not started.

Files changed by this invocation: `rldata.js`, `rlapp.js`, `index.html`,
`tests/provider-credentials.support.mjs`,
`tests/provider-credentials.unit.mjs`,
`tests/provider-credentials.functional.mjs`,
`tests/provider-credentials.spec.mjs`, and this appended report section.

No edit call targeted `scripts/selftest.mjs`, Feature 004 artifacts,
framework-managed paths, dependency manifests, generated payload/history/bar
files, stress/load suites, later-scope product work, or unrelated files.

### Just-In-Time Baseline

**Phase:** implement  
**Command:** target-scoped `git status`, `git ls-files -s`, `shasum -a 256`, unstaged diff, and staged diff baseline  
**Exit Code:** 0  
**Claim Source:** executed

```text
SCOPE01_TARGET_STATUS
 M index.html
 M rldata.js
 M scripts/selftest.mjs
?? rlapp.js
?? tests/provider-credentials.functional.mjs
?? tests/provider-credentials.spec.mjs
?? tests/provider-credentials.support.mjs
?? tests/provider-credentials.unit.mjs
SCOPE01_TARGET_INDEX_OIDS
100644 72ee07530fa313393d40515697b8ceae634f1e9f 0 index.html
100644 0af20c4f4b701c235beaad1025512ec7e4270d9b 0 rldata.js
100644 03a285cfa21b2f2e1b22b539ac0452094029c110 0 scripts/selftest.mjs
SCOPE01_TARGET_WORKTREE_SHA256
e58056dcca125e388494081a6f50fb40bd0337221d799bf5575c032fe05c7963 rldata.js
e23fc3b4c3d88717d41dce43186ef544514cf96985f9ebb905a3d955014e0c8f rlapp.js
0b54f99e66d010c038c408cdfd4e28538d2b9c164ddf7a0dd79e32520753b436 index.html
16165ba89bf79d68a3e7acb7b15558034ce90287ad9ffc338a06b801f41a6f0c scripts/selftest.mjs
9490da8e372d7d8f7c00a38dae5cf88e52e9f3eb0f7d86e7756e617c2f661755 tests/provider-credentials.support.mjs
9578dc5d328c0ba9ecd4563ab72c3568c0f73ec5e61c4456b716da228f84719c tests/provider-credentials.unit.mjs
cb7c62d089cd97b467b2586ae5dfed19214ea25c9b46be3a0e48030187e85d12 tests/provider-credentials.functional.mjs
d7c32ce9de444cbcc274c24000114cf5fac4d06958278554cc3db9eb22fb3987 tests/provider-credentials.spec.mjs
TARGET_STAGED_HUNKS
STAGED_EXIT=0
```

The full diff was captured, but terminal wrapping removed parseable hunk
boundaries from the retained artifact. Distinct pre-edit hunk-body hashes were
therefore not retained as standalone values.

> **Uncertainty Declaration**
> **What was attempted:** The preserved baseline resource was searched for
> byte-stable `diff --git` and `@@` boundaries after execution.
> **What was observed:** Index OIDs, worktree hashes, and the full rendered diff
> remain, but parseable hunk boundaries do not.
> **Why this is uncertain:** Distinct pre-edit hunk-body hashes cannot be
> reconstructed without guessing.
> **What would resolve this:** An authoritative pre-edit snapshot or an explicit
> owner-approved replacement baseline.

### Scenario-First RED

**Phase:** implement  
**Commands:** `node --test tests/provider-credentials.unit.mjs`; `node --test tests/provider-credentials.functional.mjs`; `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`  
**Exit Code:** 1 for each command  
**Claim Source:** executed

```text
UNIT RED
✖ SCN-BUG001-001 current-document runtime has no serialized store or raw credential API
✖ SCN-BUG001-005 unknown and prototype-shaped providers preserve runtime and prototypes
tests 2
pass 0
fail 2
AssertionError: key must not be public
TypeError: api.providerPolicies is not a function
FUNCTIONAL RED
✖ SCN-BUG001-002 every lifecycle signal clears current-document memory
tests 1
pass 0
fail 1
TypeError: realm.api.authorizeCredential is not a function
BROWSER RED
Running 4 tests using 1 worker
✘ real index loads shared status and erase controls with no credential editor
✘ one shared current-document capability owns every credential surface
✘ every lifecycle and document boundary starts unconfigured
✘ unknown and prototype-shaped providers fail without mutation
expected credential inputs: 0
received credential inputs: 4
4 failed
```

### Final GREEN Replay

**Phase:** implement  
**Commands:** `node --test tests/provider-credentials.unit.mjs`; `node --test tests/provider-credentials.functional.mjs`; `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`  
**Exit Code:** 0 for each command  
**Claim Source:** executed

```text
BUG001_SCOPE01_FINAL_REPLAY_BEGIN
UNIT_COMMAND_BEGIN
✔ SCN-BUG001-001 current-document runtime has no serialized store or raw credential API
✔ SCN-BUG001-005 unknown and prototype-shaped providers preserve runtime and prototypes
tests 2
pass 2
fail 0
skipped 0
UNIT_EXIT=0
FUNCTIONAL_COMMAND_BEGIN
✔ SCN-BUG001-002 every lifecycle signal clears current-document memory
tests 1
pass 1
fail 0
skipped 0
FUNCTIONAL_EXIT=0
PLAYWRIGHT_COMMAND_BEGIN
Running 4 tests using 1 worker
✓ real index loads shared status and erase controls with no credential editor
✓ one shared current-document capability owns every credential surface
✓ every lifecycle and document boundary starts unconfigured
✓ unknown and prototype-shaped providers fail without mutation
4 passed (10.1s)
PLAYWRIGHT_EXIT=0
BUG001_SCOPE01_FINAL_REPLAY_END
```

### Quality And Governance Evidence

**Phase:** implement  
**Claim Source:** executed

```text
regression-quality-guard.sh --bugfix: PASS, 0 violations, 0 warnings
active test files scanned: 3
active files with adversarial signals: 3
LIVE_INTERCEPT_OR_SKIP_MATCHES=0
INCOMPLETE_MARKER_MATCHES=0
artifact-lint.sh: PASS, 3 pre-existing state-schema warnings
artifact-freshness-guard.sh: PASS, 0 failures, 0 warnings
capability-foundation-guard.sh: PASS Gate G094
traceability-guard.sh: PASS, 11 scenarios mapped, 6 ambiguous edges
downstream-framework-write-guard.sh: PASS managed-file integrity
downstream framework provenance: WARN dirty local source install
edited-file diagnostics: 0 errors
git diff --check edited paths: exit 0
```

### Required Nonzero Commands

#### Repository Selftest

**Phase:** implement  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 1  
**Claim Source:** executed

```text
Feature 004 RLFX/RLDATA foundation
✓ RLDATA source envelopes preserve approved rights and clocks
✓ RLDATA schema-one bars and legacy tool reads remain compatible
rldata.js - shared toolReads round-trip + freshness
✓ toolReads persist and round-trip by tool id
✗ api.detectLegacyCredentials is not a function
rlapp.js - one key surface, all-page status, automatic stale-data refresh
✓ every registered tool loads RLDATA before RLAPP
✗ stale central provider registry assertion failed
Feature 006 Trend Dynamics deterministic capability foundation
✗ function not found: tdcRollingOlsHac
Feature 007 Technical Analysis Decision capability foundation
✗ technical-analysis-decision-lab.html does not exist
Research-Lab self-test: 378 passed, 4 failed
```

Two failures are protected stale BUG-001 assertions; two are unrelated
concurrent Feature 006/007 failures. The collision-constrained selftest was not
edited.

#### Implementation Reality

**Phase:** implement  
**Command:** `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-001-central-provider-credential-security`  
**Exit Code:** 1  
**Claim Source:** executed

```text
INFO: Scopes yielded 0 files - falling back to design.md
WARN: Resolved 15 files from design.md fallback
INFO: Resolved 15 implementation files to scan
Scan 2B: Sensitive Client Storage
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:58
IMPLEMENTATION REALITY SCAN RESULT
Files scanned: 15
Violations: 1
Warnings: 1
BLOCKED: 1 source code reality violation found
```

Line 58 is the protected non-secret `_mem` cache comment.
`DEP-BUG013-SEMANTIC-CLASSIFIER` remains canonical-framework-owned; no
downstream matcher edit or identifier obfuscation was attempted.

#### Feature 004 Collision And Concurrent Drift

**Phase:** implement  
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 1 before and after implementation  
**Claim Source:** executed

```text
PRE-EDIT
✖ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 preserves the untracked validator prefix and volatile config boundary
missing distinct selftest hunk:
ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc
POST-EDIT
✖ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 preserves the untracked validator prefix and volatile config boundary
missing distinct rldata.js hunks:
e8864cffc8ed788d0c462d63967bb0cf8c3cf0187b42c2a56fb1fec122e439b6
685fef4c9a52fe92c9aeb613b0c8f145681ef5dbc15dcb3d81ca17eca913283c
11621f8ac37c1e4d65a59b0578af9e475c201fc9d5b1beb8771760dcdbfa5908
a37cdc31bec1b491768bf7376067665d15596fec966309203b515ffc73880f43
SELFTEST_PRE_EDIT_SHA256=16165ba89bf79d68a3e7acb7b15558034ce90287ad9ffc338a06b801f41a6f0c
SELFTEST_OBSERVED_POST_SHA256=6e2a517396c100681b9be415fa9f65892661282ef7c9c5e4adda929e368f1282
COLLISION_EXIT=1
```

No edit call in this invocation targeted `scripts/selftest.mjs`; its SHA change
is concurrent drift. No collision baseline, Feature 004 report, or collision
test was rewritten.

### Finding Closure Accounting

| Finding | Disposition | Owner |
| --- | --- | --- |
| `BUG001-SCOPE01-RUNTIME` | Addressed: closure-private null-prototype runtime, no serialized/raw API, production policies disabled | `bubbles.implement` |
| `BUG001-SCOPE01-LIFECYCLE` | Addressed: route/history/pagehide/bfcache/reload/navigation/realm matrix passes | `bubbles.implement` |
| `BUG001-SCOPE01-CLOSED-LOOKUP` | Addressed: rogue provider and operation IDs fail closed without mutation | `bubbles.implement` |
| `BUG001-SCOPE01-INDEX` | Addressed: status and current-document clear only; zero credential editor | `bubbles.implement` |
| `BUG001-SCOPE01-EXACT-TESTS` | Addressed: S1-T01 through S1-T07 pass through exact commands | `bubbles.implement` |
| `DEP-BUG013-SEMANTIC-CLASSIFIER` | Unresolved: non-secret cache comment remains a G028 hit | canonical BUG-013 owner |
| `F004-COLLISION-001` | Unresolved: original hash plus four current `rldata.js` identities are not distinct | Feature 004 owner |
| `BUG001-PREEDIT-HUNK-HASH-UNCERTAINTY` | Unresolved: distinct hunk hashes were not retained as standalone pre-edit values | owning workflow decision |
| `BUG001-CONCURRENT-SELFTEST-DRIFT` | Unresolved: protected selftest changed concurrently without an edit call here | selftest/concurrent owner |
| `BUG001-PROTECTED-SELFTEST-STALE` | Unresolved: two selftest assertions encode superseded migration/editor behavior | selftest and collision owners |
| `REPO-SELFTEST-F006` | Unresolved unrelated missing `tdcRollingOlsHac` | Feature 006 owner |
| `REPO-SELFTEST-F007` | Unresolved unrelated missing Technical Analysis page | Feature 007 owner |

No later-scope finding, scope completion, phase completion, bug closure,
validation, audit, or certification is claimed.

### State Transition Guard And State Write

**Phase:** implement  
**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-001-central-provider-credential-security`  
**Exit Code:** 1  
**Claim Source:** executed

```text
DoD items total: 59 (checked: 10, unchecked: 49)
Resolved scopes: total=5, Done=0, In Progress=1, Not Started=4, Blocked=0
BLOCK: required implement/test/regression/simplify/stabilize/security/validate/audit phase records missing
BLOCK: bootstrap phase claim lacks specialist or parent-expanded provenance
BLOCK: Test Plan .mjs paths are truncated and reported missing
BLOCK: implementation reality scan found 1 violation at rldata.js:58
BLOCK: framework dogfood evidence contract failed
PASS: all 10 checked DoD items have evidence blocks
PASS: artifact lint
PASS: artifact freshness
PASS: implementation delta evidence G053
PASS: zero deferral language G040
PASS: Gherkin/DoD fidelity G068
PASS: capability foundation G094
TRANSITION BLOCKED: 73 failures, 2 warnings
failedGateIds: G060,G061,G022,G028,G085
blockingCode: DELIVERY_COMPLETION_FAILED
exitStatus: 1
verdict: FAIL
```

**Result:** FAIL. `state.json` was not edited. In particular, no
`execution.completedPhaseClaims`, `certification.*`, scope-completion inventory,
or terminal status was written after this refusal.

## Independent SCOPE-01 Test Phase - 2026-07-15

### Scope And Substance

**Phase:** test  
**Claim Source:** interpreted  
**Interpretation:** The exact SCOPE-01 commands from `test-plan.json` and
`scopes.md` executed against current production paths. The unit and functional
loaders read and evaluate `rldata.js`; the browser suite serves and opens the
real `index.html`, observes live `RLDATA`/`RLAPP`, reads `rldata.js` and
`rlapp.js` for producer ownership, and derives tool coverage from `tools.json`.
The tests therefore validate production processing and browser behavior rather
than fixture identity. SCOPE-02 through SCOPE-05 were not started.

| Test Plan IDs | Category | Exit | Total | Passed | Failed | Skipped |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| S1-T01, S1-T02 | unit | 0 | 2 | 2 | 0 | 0 |
| S1-T03 | functional | 0 | 1 | 1 | 0 | 0 |
| S1-T04 through S1-T07 | e2e-ui | 0 | 4 | 4 | 0 | 0 |

### Exact Unit Evidence

**Phase:** test  
**Command:** `node --test tests/provider-credentials.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
✔ SCN-BUG001-001 current-document runtime has no serialized store or raw credential API (1.736417ms)
✔ SCN-BUG001-005 unknown and prototype-shaped providers preserve runtime and prototypes (0.733584ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 49.368709
[tool-log] recorded exit=0 duration=101ms
```

### Exact Functional Evidence

**Phase:** test  
**Command:** `node --test tests/provider-credentials.functional.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
✔ SCN-BUG001-002 every lifecycle signal clears current-document memory (3.013334ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 82.458375
[tool-log] recorded exit=0 duration=141ms
```

### Exact Live Browser Evidence

**Phase:** test  
**Command:** `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`  
**Exit Code:** 0  
**Claim Source:** executed

```text
Running 4 tests using 1 worker

  ✓  1 [system-chrome] › tests/provider-credentials.spec.mjs:51:3 › Canary BUG-001: real index loads shared status and erase controls with no credential editor (947ms)
  ✓  2 [system-chrome] › tests/provider-credentials.spec.mjs:71:3 › Regression BUG-001: one shared current-document capability owns every credential surface (6.5s)
  ✓  3 [system-chrome] › tests/provider-credentials.spec.mjs:105:3 › Regression BUG-001: every lifecycle and document boundary starts unconfigured (2.0s)
  ✓  4 [system-chrome] › tests/provider-credentials.spec.mjs:177:3 › Regression BUG-001: unknown and prototype-shaped providers fail without mutation (135ms)

  4 passed (14.0s)
[tool-log] recorded exit=0 duration=14958ms
```

### Broad Selftest Reconciliation

The first current-tree execution reported `454 passed, 3 failed`. Each failure
was classified independently:

| Finding | Classification | Disposition |
| --- | --- | --- |
| `api.detectLegacyCredentials is not a function` | Stale BUG-001 assertion expected the removed legacy-value API | Fixed in the test-owned `scripts/selftest.mjs` block with memory-only/no-migration assertions |
| Landing-page central-registry assertion | Stale BUG-001 assertion expected the former credential-editor copy | Fixed in the test-owned `scripts/selftest.mjs` block with status-only/current-document assertions |
| `RLVALID is required for Strategy Validation statistics` | Feature 007 concurrent bootstrap failure | Current rerun is green; routed to the Feature 007 owner through `specs/007-technical-analysis-decision-lab/` if it recurs |

The anticipated Feature 006 `tdcRollingOlsHac` and Feature 007 missing-page
failures named in earlier implementation evidence were not present in this
baseline. Trend Dynamics and the Technical Analysis foundation both executed
green in the captured run.

The selftest assertion edit was surgical. Immediately before editing, the
tracked index OID was `03a285cfa21b2f2e1b22b539ac0452094029c110`, the
worktree Git object was `6b89f5f03fbd7bf5f104ddc8db7e6013c0e04338`, and the
worktree SHA-256 was
`98b2358f7ef90158b05d68699e82f05a203f9c6da4f3bc4c17a62a79ee38ad8d`.
Only the obsolete BUG-001 migration/session block and landing-page assertion
were replaced. One additional Feature 007 assertion landed concurrently after
the first green rerun. The stable controlling selftest SHA-256 is
`ce25a4dc92faf185234a255940771d8410f0d92ae85bb14c18bf56f2ec54beb5`.

**Phase:** test  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Evidence Window:** Current BUG-001 assertions plus the final summary from the
full unfiltered 32 KB output.

```text
rldata.js — shared toolReads round-trip + freshness
  ✓ toolReads persist and round-trip by tool id
  ✓ toolReads retain structured metrics and deep link
  ✓ toolReads expose as-of freshness
  ✓ toolReads reject an empty id
  ✓ provider registry is frozen and every production provider is disabled
  ✓ legacy credential value detection and migration APIs are absent
  ✓ provider credentials have no client store while non-secret rlData remains durable
  ✓ central owner exposes no raw bulk or migration credential API
rlapp.js — one key surface, all-page status, automatic stale-data refresh
  ✓ every registered tool loads the shared data-status shell
  ✓ every registered tool loads RLDATA before RLAPP
  ✓ the landing page exposes status-only current-document provider policy without a credential editor
  ✓ tool pages expose no duplicate credential inputs
  ✓ registered tools expose no duplicate provider credential setter migration or durable storage access
  ✓ registered tools expose no credential-bearing provider URL transport
================================================
Research-Lab self-test: 467 passed, 0 failed
================================================
[tool-log] recorded exit=0 duration=1121ms
```

### Regression Integrity And Test-Fidelity Audit

**Phase:** test  
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/provider-credentials.support.mjs tests/provider-credentials.unit.mjs tests/provider-credentials.functional.mjs tests/provider-credentials.spec.mjs tests/provider-credentials.stress.mjs tests/provider-credentials.load.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUBBLES REGRESSION QUALITY GUARD
Bugfix mode: true
Scanning tests/provider-credentials.support.mjs
Adversarial signal detected in tests/provider-credentials.support.mjs
Scanning tests/provider-credentials.unit.mjs
Adversarial signal detected in tests/provider-credentials.unit.mjs
Scanning tests/provider-credentials.functional.mjs
Adversarial signal detected in tests/provider-credentials.functional.mjs
Scanning tests/provider-credentials.spec.mjs
Adversarial signal detected in tests/provider-credentials.spec.mjs
Scanning tests/provider-credentials.stress.mjs
Adversarial signal detected in tests/provider-credentials.stress.mjs
Scanning tests/provider-credentials.load.mjs
Adversarial signal detected in tests/provider-credentials.load.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 6
Files with adversarial signals: 6
```

Separate scans over the six provider files returned no matches for
skip/only/todo/pending markers, internal mocks or request interception, or
conditional early-return bailout patterns. A final seven-file scan that also
included `scripts/selftest.mjs` found two lexical matches: `process.exit(...)`
matched the naive `xit(` expression, and a pure SMA helper's invalid-window
`return null` matched the generic early-return expression. Neither hit disables
a test or exits a required scenario. Assertion tracing found no self-validating
SCOPE-01 test: runtime-state assertions cross production validation and
lifecycle hooks, while browser assertions cross the real static server, DOM,
navigation, storage, and realm boundaries.

### Feature 004 Collision Evidence

**Phase:** test  
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 1  
**Claim Source:** executed

```text
✖ Feature 004 preserves every pre-existing dirty hunk (34.506834ms)
✔ Feature 004 preserves the untracked validator prefix and volatile config boundary (7.134584ms)
ℹ tests 2
ℹ suites 0
ℹ pass 1
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 86.463833
AssertionError [ERR_ASSERTION]: rldata.js preserves every recorded hunk body as a distinct hunk
missing=e8864cffc8ed788d0c462d63967bb0cf8c3cf0187b42c2a56fb1fec122e439b6
missing=685fef4c9a52fe92c9aeb613b0c8f145681ef5dbc15dcb3d81ca17eca913283c
missing=11621f8ac37c1e4d65a59b0578af9e475c201fc9d5b1beb8771760dcdbfa5908
missing=a37cdc31bec1b491768bf7376067665d15596fec966309203b515ffc73880f43
[tool-log] recorded exit=1 duration=128ms
```

The collision test itself and Feature 004 baseline were not changed. Feature
004's report records that all eleven `rldata.js` baseline hashes once passed;
the current guard now reports four missing distinct hashes. During this test
phase the `rldata.js` SHA-256 changed from
`10c53c146acb34c9b31cad392bdff1b3dfc724f6d857851f5087fe64c897dc9d`
to `d7c233c03482ccdd493e5aca60deb9f528a338ba43f093e84685f80a406abd91`
without a test-phase edit to that path. Its index OID remains
`0af20c4f4b701c235beaad1025512ec7e4270d9b`. The exact original
user/concurrent bytes are therefore not fully proved preserved, and the
baseline requires Feature 004 owner reconciliation. The collision guard is not
weakened or rewritten.

### G028 And Canonical BUG-013 Evidence

**Phase:** test  
**Command:** `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-001-central-provider-credential-security --verbose`  
**Exit Code:** 1  
**Claim Source:** interpreted  
**Interpretation:** The installed scanner directly reports one row. Source and
spec comparison classifies it as the protected non-secret `rlData` cache comment,
not a credential read or write.

```text
INFO: Resolved 15 implementation file(s) to scan
--- Scan 2B: Sensitive Client Storage ---
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:58
Context: var _mem = null; /* in-memory source of truth — keeps the session working even when localStorage is full */
--- Scan 5: Default/Fallback Value Patterns ---
--- Scan 6: Live-System Test Interception ---
INFO: No live-system test files referenced in scope artifacts for interception scan
IMPLEMENTATION REALITY SCAN RESULT
Files scanned: 15
Violations: 1
Warnings: 1
BLOCKED: 1 source code reality violation(s) found
[tool-log] recorded exit=1 duration=2040ms
```

Feature 004 emits the identical row and no second finding. The current canonical
Bubbles source scanner clears BUG-001 with zero violations:

```text
INFO: Resolved 15 implementation file(s) to scan
--- Scan 2B: Sensitive Client Storage ---
--- Scan 3: Frontend API Call Absence ---
--- Scan 4: Prohibited Simulation Helpers in Production ---
--- Scan 5: Default/Fallback Value Patterns ---
--- Scan 6: Live-System Test Interception ---
INFO: No live-system test files referenced in scope artifacts for interception scan
IMPLEMENTATION REALITY SCAN RESULT
Files scanned: 15
Violations: 0
Warnings: 1
PASSED with 1 warning(s) — manual review advised
[tool-log] recorded exit=0 duration=1448ms
```

Canonical BUG-013 is still `blocked`: its `state.json` has zero completed scopes
and zero certified phases and routes to `bubbles.implement`. Its focused semantic
classifier implementation is green and produces the zero-violation comparison
above, but it has not reached validate-owned certification or been propagated to
Research Lab's installed framework. No downstream framework edit or refresh was
performed here.

### Governance And Boundary Results

| Command | Exit | Current result |
| --- | ---: | --- |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-001-central-provider-credential-security` | 0 | PASS; three deprecated state-field warnings |
| `bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/_bugs/BUG-001-central-provider-credential-security` | 0 | PASS; zero warnings |
| `bash .github/bubbles/scripts/traceability-guard.sh specs/_bugs/BUG-001-central-provider-credential-security` | 0 | PASS; 11 scenarios, 40 rows, 11 concrete files, 11 evidence mappings, 11/11 DoD mappings |
| `bash .github/bubbles/scripts/capability-foundation-guard.sh specs/_bugs/BUG-001-central-provider-credential-security` | 0 | PASS Gate G094 |
| `bash .github/bubbles/scripts/cli.sh framework-write-guard` | 0 | Managed files match installed snapshot; dirty-source install warning |
| Path-scoped `git diff --check` | 0 | PASS |

The first and final boundary inventories show `rlapp.js`, `index.html`, all six
provider test surfaces, the collision test, `scopes.md`, and `state.json`
byte-identical across this test phase. `rldata.js` changed concurrently as
recorded above. `scripts/selftest.mjs` changed once concurrently before the
surgical edit and then changed only in the two BUG-001 test-owned assertion
hunks. This report is the only other test-owned edit.

### DoD And Phase Disposition

The three SCOPE-01 scenario items and S1-T01 through S1-T07 were already checked
and are directly supported by the exact final runs above. No checkbox text or
state was changed. The shared-bootstrap/inverse-hunk item and grouped Build
Quality Gate remain unchecked because the collision guard and installed reality
scan are non-green. No `state.json.execution.*` update is mechanically justified,
and no `certification.*` field was touched.

### Finding Accounting

| Finding | Disposition | Owner/reference |
| --- | --- | --- |
| `BUG001-SELFTEST-LEGACY-API` | Addressed by the surgical memory-only/no-migration selftest assertion | `bubbles.test`; final selftest 467/467 |
| `BUG001-SELFTEST-EDITOR-COPY` | Addressed by the surgical status-only/current-document landing assertion | `bubbles.test`; final selftest 467/467 |
| `FEATURE007-RLVALID-BOOTSTRAP` | Current rerun green after concurrent owner work | Feature 007 owner; `specs/007-technical-analysis-decision-lab/` |
| `F004-COLLISION-RLDATA` | Routed: four baseline `rldata.js` hunk identities are no longer distinct | Feature 004 owner; `specs/004-fx-regime-relative-value-lab/` |
| `DEP-BUG013-SEMANTIC-CLASSIFIER` | Routed: canonical source clears the row, but BUG-013 remains blocked and unpropagated | Canonical BUG-013 owner; `improvements/BUG-013-g028-sensitive-client-storage-classification/` |

### Test Verdict

SCOPE-01 runtime behavior is proven by all seven exact Test Plan rows and the
green 467-check repository selftest. SCOPE-01 as a complete scope is not fully
test-proven because collision preservation and the installed G028 completion
gate are unresolved. The scope remains `In Progress`; no later scope has been
started and no terminal result is claimed.

<!-- markdownlint-restore MD010 -->
