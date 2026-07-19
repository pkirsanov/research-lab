# Scopes: BUG-003 Bond Regime Simple/Power Model-Digest Divergence

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Ownership Status

**Workflow mode:** `bugfix-fastlane`  
**Implementation outcome:** `route_required`
**Implementation dispatch allowed:** `false`
**Independent test outcome:** `route_required`
**Next required owner:** `bubbles.test` for strict Feature 004 successor parsing, the direct collision canary, and a fresh BUG-003 independent acceptance replay
**Protected upstream scenario:** `SCN-003-011`  
**Blocking acceptance:** BUG-002 SCOPE-01 independent test

One delivery scope is sufficient. The defect is one local readiness lifecycle, the expected behavior is already protected by Feature 003, and no product or UX decision is open.

## Scope 1: SCOPE-01 Stable Bond Regime Ready Boundary

**Status:** In Progress
**Execution:** Implementation and focused independent checks complete; foreign broader canary and certification pending
**Depends On:** None  
**Scope-Kind:** bugfix  
**Tags:** foundation:true

### Gherkin Scenarios - SCOPE-01

```gherkin
Scenario: SCN-BUG003-001 Ready identifies one stable model across Simple and Power
  Given cached Bond Regime bars are painted and automatic external Treasury hydration is unresolved
  When the page reports its readiness state and the user switches from Simple to Power after Ready
  Then Ready is absent until automatic hydration has settled
  And Simple and Power expose the same shared decision digest
  And assumptions remain unchanged
  And the mode switch adds no request
```

This scenario repairs the timing precondition for protected `SCN-003-011`. It neither replaces nor invalidates the upstream scenario.

### UI Scenario Matrix - SCOPE-01

| Scenario | Preconditions | Steps | Expected | Test Type | Evidence target |
| --- | --- | --- | --- | --- | --- |
| Held automatic hydration | Shared bars cached; true external Treasury responses unresolved | Open page; inspect cached decision and status | Cached content is visible; status remains Refreshing; runtime refresh is active | Regression E2E adversarial | `report.md#bug-verification---after-fix` |
| Settled Simple/Power switch | Held Treasury responses released; Ready visible | Read Simple digest and assumptions; click Power; read Power digest | Digests equal; assumptions equal; mode switch adds zero request | Regression E2E protected | `report.md#bug-verification---after-fix` |
| Degraded settlement | Optional source returns unavailable through existing path | Await terminal lifecycle | Ready appears only after final degraded-state recompute; source rows remain truthful | Focused E2E file | `report.md#bug-verification---after-fix` |

### Implementation Plan - SCOPE-01

1. Capture just-in-time SHA-256 and path-scoped status for `bond-regime-lab.html` and `tests/bond-regime-lab.spec.mjs`. Compare with packet baselines and stop on concurrent drift.
2. Add the exact adversarial E2E title to the feature-specific test file without changing protected BS-011. Use a promise-held true external Treasury route, no timer, no internal interception, and no injected digest.
3. Run only the new exact adversarial title against current production and record scenario-first RED showing Ready while refresh remains active.
4. Repair `bond-regime-lab.html` so active-refresh renders cannot publish Ready, terminal hydration publishes Ready after clearing the active flag, and boot enters auto-hydration in the same JavaScript turn.
5. Run the adversarial title GREEN, then the unchanged protected BS-011 title GREEN.
6. Run the complete Bond Regime browser file, complete repository selftest, regression-quality/source-lock checks, and complete system-Chrome inventory.
7. Prove the change boundary with path-scoped hashes/status and update only BUG-003 evidence/execution state.
8. Route the green independent chain back to BUG-002 SCOPE-01 `bubbles.test`; BUG-002 validate/audit and Feature 006 replay remain owned by their existing chain.

### Change Boundary - SCOPE-01

| Class | Paths | Rule |
| --- | --- | --- |
| Production | `bond-regime-lab.html` | Surgical boot/hydration/Ready lifecycle hunks only |
| Feature-specific tests | `tests/bond-regime-lab.spec.mjs` | Preserve BS-011 exactly; add only deterministic BUG-003 adversarial coverage |
| Bug artifacts | `specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/**` | Evidence and execution-state updates only |
| Feature 003 authority | `specs/003-bond-regime-and-scenario-lab/**` | Read-only; SCN-003-011 remains authoritative |
| Parent/blocker chain | `specs/006-trend-dynamics-cycle-lab/**`, `specs/_bugs/BUG-002-market-brief-session-date-drift/**` | Read-only |
| BUG-002 and Market Brief | Production, data, tests, prompts, runbook, page, renderer, and artifacts | No edit, stage, restore, clean, or normalization |
| Shared/product graph | Shared JavaScript, registries, navigation, package/lock/source files, Playwright config, Feature 005 | No edit |
| Framework and shared worktree | Framework-managed files and every unrelated dirty path | No edit; stop on collision |

### Shared Infrastructure Impact Sweep - SCOPE-01

None found - the permitted test edit is the existing feature-specific Bond Regime file and the permitted production edit is one self-contained HTML tool. No shared fixture, server, bootstrap, auth, session, storage, registry, or shared JavaScript contract changes.

### Test Plan - SCOPE-01

| ID | Type | Category | Scenario | File / exact test title | Required assertion | Exact command | Live |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Before-fix protected regression | e2e-ui | SCN-003-011 | `tests/bond-regime-lab.spec.mjs` - `BS-011 Simple and Power share one model digest` | Preserve independent RED: Simple `8a020d8b` must not differ from Power `40108ba6`; current exact green replays are recorded as timing-sensitive evidence, not closure. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "BS-011 Simple and Power share one model digest" --reporter=list` | Yes |
| TP-01-02 | Regression E2E adversarial | e2e-ui | SCN-BUG003-001 | `tests/bond-regime-lab.spec.mjs` - `Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison` | RED before production edit while Treasury is held; GREEN proves cached paint stays Refreshing until terminal recompute, then parity/assumptions/no-request. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison" --reporter=list` | Yes |
| TP-01-03 | Protected Regression E2E | e2e-ui | SCN-003-011 | Exact unchanged BS-011 title | Existing consumer test passes without added wait, retry, rename, skip, or weaker assertion. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "BS-011 Simple and Power share one model digest" --reporter=list` | Yes |
| TP-01-04 | Focused E2E file | e2e-ui | SCN-BUG003-001, SCN-003-011 | Complete `tests/bond-regime-lab.spec.mjs` | Every Bond scenario passes with zero required skip. | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-01-05 | Repository integration | integration | SCN-BUG003-001 | `scripts/selftest.mjs` - complete inventory | Inline production syntax/model contracts remain green. | `node scripts/selftest.mjs` | No |
| TP-01-06 | Regression quality | functional | SCN-BUG003-001 | `tests/bond-regime-lab.spec.mjs` | No silent return, skip, selective-only marker, tautological digest injection, or invalid bugfix test shape. | `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/bond-regime-lab.spec.mjs` | No |
| TP-01-07 | Node source lock | functional | dependency integrity | Current package graph | Existing Playwright resolves only through the locked trusted source contract; no package change exists. | `node scripts/validate-node-source-lock.mjs` | No |
| TP-01-08 | Broader E2E regression | e2e-ui | SCN-BUG003-001, SCN-003-011 | Complete system-Chrome inventory | Complete inventory is green before BUG-002 acceptance resumes. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-01-09 | Change-boundary integrity | functional | containment | Two allowed existing files plus BUG-003 packet | Only authorized paths differ from just-in-time baselines; every excluded path hash/status is unchanged. | `git status --short --untracked-files=all -- bond-regime-lab.html tests/bond-regime-lab.spec.mjs specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence && shasum -a 256 bond-regime-lab.html tests/bond-regime-lab.spec.mjs` | No |

### Test Taxonomy Applicability - SCOPE-01

| Category | Applicability | Reason |
| --- | --- | --- |
| unit | Not applicable | No pure model or digest algorithm changes |
| functional | Required | Regression-quality, source-lock, and change-boundary contracts must be checked |
| integration | Required | Complete selftest parses and exercises the real single-file production model |
| ui-unit | Not applicable | No component framework exists; real-page E2E is the correct boundary |
| e2e-api | Not applicable | Research Lab has no service API |
| e2e-ui | Required | The defect is a user-observable lifecycle race in the real page |
| stress | Not applicable | No repetition, latency, or throughput SLA changes |
| load | Not applicable | No concurrency or capacity contract changes |

### Definition of Done - SCOPE-01

**Literal Test Plan / test-related DoD parity:** the closed mapping is `TP-01-01 -> DOD-TP-01-01`, `TP-01-02 -> DOD-TP-01-02`, `TP-01-03 -> DOD-TP-01-03`, `TP-01-04 -> DOD-TP-01-04`, `TP-01-05 -> DOD-TP-01-05`, `TP-01-06 -> DOD-TP-01-06`, `TP-01-07 -> DOD-TP-01-07`, `TP-01-08 -> DOD-TP-01-08`, and `TP-01-09 -> DOD-TP-01-09`. Each Test Plan ID appears in exactly one test-related DoD checkbox below; the additional root-cause, implementation, downstream-routing, validation, and certification items do not satisfy or substitute for a Test Plan row.

**Test Evidence Parity Index - Exactly Nine Rows**

| Test Plan row | Exact checkbox | Evidence destination | Preserved truth |
| --- | --- | --- | --- |
| TP-01-01 | DOD-TP-01-01 | `report.md#bug-reproduction---before-fix` | Checked; independent historical RED remains interpreted, not re-executed by planning |
| TP-01-02 | DOD-TP-01-02 | `report.md#focused-green-and-protected-contract` | Checked; preserved RED plus current GREEN evidence |
| TP-01-03 | DOD-TP-01-03 | `report.md#focused-green-and-protected-contract` | Checked; exact protected title evidence |
| TP-01-04 | DOD-TP-01-04 | `report.md#focused-file-and-repository-matrix` | Checked; complete Bond file evidence |
| TP-01-05 | DOD-TP-01-05 | `report.md#focused-file-and-repository-matrix` | Checked; repository selftest evidence |
| TP-01-06 | DOD-TP-01-06 | `report.md#focused-file-and-repository-matrix` | Checked; regression-quality evidence |
| TP-01-07 | DOD-TP-01-07 | `report.md#focused-file-and-repository-matrix` | Checked; source-lock evidence |
| TP-01-08 | DOD-TP-01-08 | `report.md#independent-test-verification---2026-07-16` | Unchecked; browser inventory cannot replace the red direct Feature 004 canary |
| TP-01-09 | DOD-TP-01-09 | `report.md#boundary-and-governance` | Unchecked; fresh independent concurrent-worktree boundary remains required |

- [x] DOD-TP-01-01 / TP-01-01 preserves the independently observed before-fix protected BS-011 mismatch, while current exact green replays remain timing-sensitive evidence rather than closure.

  **Phase:** bug-discovery
  **Command:** exact TP-01-01 command from the Test Plan
  **Exit Code:** 1
  **Claim Source:** interpreted
  **Interpretation:** The raw failure was executed by the independent `bubbles.test` caller and preserved without being relabeled as planning-owned execution.
  **Evidence:** `report.md#bug-reproduction---before-fix`; the protected title observed Simple `8a020d8b` and Power `40108ba6`, while later exact green replays established scheduling sensitivity.
- [ ] Root cause remains confirmed as premature Ready plus asynchronous same-path hydration, with all rejected classifications still false on final bytes.
  > **Uncertainty Declaration**
  > **What was attempted:** Current source inspection, commit/hash provenance, TP-01-02, protected BS-011, and the complete Bond file.
  > **What was observed:** Final committed bytes carry the planned lifecycle and all current behavior checks pass.
  > **Why this is uncertain:** This implementation owner did not rerun the packet's twelve-page mutation/classification probe on final bytes.
  > **What would resolve this:** Independent test/validation replays the classification diagnostic or explicitly accepts the source-plus-adversarial evidence boundary.
- [x] DOD-TP-01-02 / TP-01-02 preserves scenario-first RED before the production edit and passes GREEN after the repair, proving SCN-BUG003-001 cached paint, truthful Refreshing, terminal Ready, digest parity, assumptions, and zero mode-switch requests.

  **Phase:** implement  
  **Command:** exact TP-01-02 command from the Test Plan
  **Exit Codes:** 1 before repair; 0 on repaired current bytes
  **Claim Source:** interpreted
  **Interpretation:** The RED output is preserved historical executed evidence; the GREEN output is current executed evidence. This planning reconciliation reran neither and does not relabel either phase.
  **Output:**

  ```text
  Running 1 test using 1 worker

    ✘  1 [system-chrome] › Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison (820ms)

    Error: Premature Ready while automatic hydration remains active: Ready - observed credit evidence computed from the current snapshot

    expect(received).not.toContain(expected) // indexOf

    Expected substring: not "Ready"
    Received string:        "Ready - observed credit evidence computed from the current snapshot"

      343 |     expect(heldState.digest).toMatch(/^[0-9a-f]{8}$/);
      344 |     expect(heldState.refreshActive).toBe(true);
    > 345 |     expect(heldState.status, `Premature Ready while automatic hydration remains active: ${heldState.status}`).not.toContain('Ready');
      346 |     expect(heldState.status).toContain('Refreshing');

    1 failed
      [system-chrome] › Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison
  ```

  **GREEN Evidence:** `report.md#focused-green-and-protected-contract`; the current reconciliation rerun reported `1 passed (1.1s)` after exercising the held true Treasury boundary, terminal Ready, digest parity, unchanged assumptions, and zero mode-switch requests.

- [x] The Ready/auto-hydration lifecycle repair is implemented without changing model, source, persistence, or mode-composition behavior.

  **Phase:** implement
  **Command:** `git --no-pager log -1 --format='%H%n%an%n%ad%n%s' --date=iso-strict -- bond-regime-lab.html tests/bond-regime-lab.spec.mjs` plus current source inspection
  **Exit Code:** 0
  **Claim Source:** executed and interpreted
  **Evidence:** `report.md#adopted-implementation`; commit `943972e295b8fa93a19795e46015e5ae780b0350` contains the planned Ready/active, terminal-clear, and same-turn boot lifecycle. No source/test edit occurred in this invocation.
- [x] DOD-TP-01-03 / TP-01-03 preserves the exact protected BS-011 title and assertions and provides persistent SCN-003-011 E2E coverage on repaired bytes.

  **Phase:** implement
  **Command:** exact TP-01-03 command from the Test Plan
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#focused-green-and-protected-contract`; the protected block remains adjacent to the new regression and the current reconciliation rerun reported `1 passed (1.0s)`.
- [x] DOD-TP-01-04 / TP-01-04 complete Bond Regime file passes with zero required skip.

  **Phase:** implement
  **Command:** exact TP-01-04 command from the Test Plan
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#focused-file-and-repository-matrix`; all 27 tests passed in the current reconciliation rerun (`13.4s`).
- [x] DOD-TP-01-05 / TP-01-05 repository selftest passes on final bytes.

  **Phase:** implement
  **Command:** `node scripts/selftest.mjs`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#focused-file-and-repository-matrix`; 497 selftests passed.
- [x] DOD-TP-01-06 / TP-01-06 regression-quality guard passes on the feature-specific Bond Regime test file.

  **Phase:** implement
  **Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/bond-regime-lab.spec.mjs`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#focused-file-and-repository-matrix`; the regression guard found zero violations and zero warnings.
- [x] DOD-TP-01-07 / TP-01-07 Node source-lock validation passes without a package-graph change.

  **Phase:** implement
  **Command:** `node scripts/validate-node-source-lock.mjs`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#focused-file-and-repository-matrix`; source lock passed while rejecting 16 adversarial mutations.
- [ ] DOD-TP-01-08 / TP-01-08 broader E2E regression acceptance is clean before BUG-002 resumes
  > **Uncertainty Declaration**
  > **What was attempted:** Independent `bubbles.test` executed exact TP-01-08 and the mandatory direct Feature 004 collision canary on current bytes.
  > **What was observed:** TP-01-08 exited 0 with 76 browser tests passed and natural process completion. The Feature 004 Node canary exited 1 with one pass and two fail-closed identity failures.
  > **Why this is uncertain:** The Playwright browser inventory does not collect `.test.mjs`, so its green exit cannot establish that the separately required Feature 004 guard is clean.
  > **What would resolve this:** Feature 004 `bubbles.plan` records the current additive identities, Feature 004 `bubbles.test` reruns its direct canary green without weakening it, and BUG-003 independent acceptance is replayed.
- [ ] DOD-TP-01-09 / TP-01-09 Change Boundary is respected and zero excluded file families were changed
  > **Uncertainty Declaration**
  > **What was attempted:** TP-01-09 captured path-scoped status and SHA-256 values, compared both anchors with commit `943972e295b8fa93a19795e46015e5ae780b0350`, and checked the BUG-003 paths for staged changes.
  > **What was observed:** Both anchor diffs and the cached diff exited 0; hashes remain `af96efaddf1c4fce9b8e79f9ef988f5226081c0f08a375f85eb403a324a69111` and `b010a103a2b65f820ba7106f5c73127d6cf3f1ec4495a8d1d7cad3a8908989ed`. Unrelated Feature 010 and BUG-002 helper changes remain present and untouched.
  > **Why this is uncertain:** A concurrent dirty worktree cannot support the absolute claim that zero excluded families changed globally, even though this implementation changed none of them.
  > **What would resolve this:** `bubbles.test` captures a fresh independent boundary baseline after concurrent owners disposition their paths.
- [ ] BUG-002 SCOPE-01 returns to `bubbles.test`, BUG-002 validation/audit completes, and Feature 006 Scope 3 replays only after the complete inventory is green.
  > **Uncertainty Declaration**
  > **What was attempted:** The parent resume chain is explicit and no foreign state was changed.
  > **What was observed:** BUG-002 and Feature 006 remain outside this packet's write boundary.
  > **Why this is uncertain:** Their owning phases have not resumed.
  > **What would resolve this:** Complete BUG-003 independent verification, then follow the exact owner chain without mutating foreign artifacts here.

> **Implementation Evidence Boundary**
> Checked implementation items have current-session evidence. Unchecked root-cause replay, broad regression, containment, independent test, downstream acceptance, validation, audit, certification, and parent replay remain unresolved and are not claimed.

## Structured Handoff

```yaml
packet: BUG-003-bond-regime-simple-power-model-digest-divergence
workflowMode: bugfix-fastlane
currentOwner: bubbles.plan
outcome: route_required
nextRequiredOwner: bubbles.test
nextRequiredTarget: Feature 004 direct collision parser/canary, then fresh BUG-003 independent acceptance
scope: SCOPE-01
scopeStatus: in_progress
addressedFindingIds:
  - BUG003-RCA-001
  - BUG003-PLANNING-001
  - BUG003-DESIGN-READY-HARNESS-001
  - BUG003-ASYNC-READY-RACE
  - BUG003-DETERMINISTIC-RED-GAP
  - TR-BUG-003-IMPLEMENT
  - BUG003-FOREIGN-F004-UNTRACKED-BOUNDARY
  - BUG003-PLAN-DOD-PARITY
  - BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY
  - F004-CURRENT-SCRIPT-IDENTITY-003
  - TR-BUG-003-F004-PLAN
unresolvedFindingIds:
  - F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-002
  - TR-BUG-003-TEST
  - BUG003-INDEPENDENT-VERIFICATION
  - BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION
  - BUG003-G028-ZERO-FILES-RESOLVED
  - BUG003-EVIDENCE-BRIDGE-CROSS-SPEC-MATCH
  - BUG003-ENV-DOCTOR-NONEXECUTABLE
  - BUG003-ENV-DOCTOR-INSTALL-HOOK-DRIFT
  - BUG003-ENV-DOCTOR-QUERY-TOOL-LOG-DRIFT
  - BUG003-ENV-OBSERVABILITY-UNDECLARED
  - BUG002-ACCEPTANCE-BLOCK
  - BUG002-INDEPENDENT-VERIFICATION
  - BUG002-BROAD-E2E-INSTABILITY
  - BUG002-REGRESSION-PHASE
  - BUG002-VALIDATE-CERTIFICATION
  - BUG002-AUDIT-CERTIFICATION
  - F006-FW-CHECK8-MJS-001
  - F006-FW-G085-001
  - F006-EXT-SELFTEST-MARKET-BRIEF-001
```
