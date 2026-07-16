# Scopes: BUG-003 Bond Regime Simple/Power Model-Digest Divergence

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Ownership Status

**Workflow mode:** `bugfix-fastlane`  
**Planning outcome:** `route_required`  
**Implementation dispatch allowed:** `true`  
**Next required owner:** `bubbles.implement`  
**Protected upstream scenario:** `SCN-003-011`  
**Blocking acceptance:** BUG-002 SCOPE-01 independent test

One delivery scope is sufficient. The defect is one local readiness lifecycle, the expected behavior is already protected by Feature 003, and no product or UX decision is open.

## Scope 1: SCOPE-01 Stable Bond Regime Ready Boundary

**Status:** Not Started  
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

- [ ] SCN-BUG003-001: while cached Bond Regime bars are painted and automatic external Treasury hydration is unresolved, Ready is absent; after hydration settles and the user switches from Simple to Power, both modes expose the same shared decision digest, assumptions remain unchanged, and the mode switch adds no request.
  > **Uncertainty Declaration**
  > **What was attempted:** The exact scenario, adversarial test title, and protected upstream mapping were planned one-to-one.
  > **What was observed:** Current production exposes Ready during active hydration and no repair exists.
  > **Why this is uncertain:** The complete behavioral claim has no post-repair execution evidence.
  > **What would resolve this:** Execute TP-01-02 RED before production editing and GREEN after repair, then independently replay TP-01-03.
- [ ] Root cause remains confirmed as premature Ready plus asynchronous same-path hydration, with all rejected classifications still false on final bytes.
  > **Uncertainty Declaration**
  > **What was attempted:** Current production/test inspection and a twelve-page mutation timeline.
  > **What was observed:** Both exact hashes occur sequentially through one runtime; no repaired bytes exist.
  > **Why this is uncertain:** Final implementation bytes may alter the lifecycle and require the classification check again.
  > **What would resolve this:** Re-run the timeline/classification probe after the production repair.
- [x] The exact TP-01-02 adversarial regression fails before the production edit.

  **Phase:** implement  
  **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison" --reporter=list`  
  **Exit Code:** 1  
  **Claim Source:** executed  
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
- [ ] The Ready/auto-hydration lifecycle repair is implemented without changing model, source, persistence, or mode-composition behavior.
  > **Uncertainty Declaration**
  > **What was attempted:** The exact three-hunk production design is recorded in design.md.
  > **What was observed:** Production remained untouched by this phase.
  > **Why this is uncertain:** No implementation exists to inspect.
  > **What would resolve this:** `bubbles.implement` applies the scoped repair and records the source diff.
- [ ] TP-01-02 passes after the repair and proves cached paint, truthful Refreshing, terminal Ready, digest parity, assumptions, and zero mode-switch requests.
  > **Uncertainty Declaration**
  > **What was attempted:** No after-repair test can run before implementation.
  > **What was observed:** Current production still emits intermediate Ready states.
  > **Why this is uncertain:** GREEN evidence is absent.
  > **What would resolve this:** Execute the exact TP-01-02 command after repair.
- [ ] The exact protected BS-011 title and assertions remain unchanged and TP-01-03 passes.
  > **Uncertainty Declaration**
  > **What was attempted:** Two exact current replays and one complete Bond replay passed, while independent RED is preserved.
  > **What was observed:** No post-repair bytes exist and current green is timing-sensitive.
  > **Why this is uncertain:** Current passes cannot prove the repaired lifecycle or test-byte identity.
  > **What would resolve this:** Prove byte-level protected-test preservation and execute TP-01-03 after repair.
- [ ] TP-01-04 complete Bond Regime file passes with zero required skip.
  > **Uncertainty Declaration**
  > **What was attempted:** Current pre-repair file passed 26 tests.
  > **What was observed:** That run precedes implementation.
  > **Why this is uncertain:** It cannot establish post-repair compatibility.
  > **What would resolve this:** Execute TP-01-04 on final bytes.
- [ ] TP-01-05, TP-01-06, and TP-01-07 pass on final bytes.
  > **Uncertainty Declaration**
  > **What was attempted:** Commands are resolved to existing repo surfaces.
  > **What was observed:** No implementation-phase execution exists.
  > **Why this is uncertain:** Final syntax, regression quality, and source integrity are untested.
  > **What would resolve this:** Execute all three commands after focused GREEN.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  > **Uncertainty Declaration**
  > **What was attempted:** Exact protected and adversarial titles are planned one-to-one against SCN-003-011 and SCN-BUG003-001.
  > **What was observed:** The new adversarial test is not present in this planning phase.
  > **Why this is uncertain:** Planned coverage is not executed coverage.
  > **What would resolve this:** Implement and independently run both exact titles.
- [ ] Broader E2E regression suite passes
  > **Uncertainty Declaration**
  > **What was attempted:** The complete system-Chrome command is fixed as TP-01-08.
  > **What was observed:** Independent acceptance reported 72 passed and 1 failed before repair.
  > **Why this is uncertain:** A post-repair complete inventory does not exist.
  > **What would resolve this:** Execute TP-01-08 after the complete Bond file is green.
- [ ] Change Boundary is respected and zero excluded file families were changed
  > **Uncertainty Declaration**
  > **What was attempted:** Pre-packet hashes/status were captured for the production and test anchors, and all excluded families are explicit.
  > **What was observed:** The bug phase added only this nine-artifact packet.
  > **Why this is uncertain:** Implementation has not started.
  > **What would resolve this:** Capture just-in-time pre-edit and final hashes/status and compare every excluded path family.
- [ ] Independent `bubbles.test` evidence verifies focused RED/GREEN, exact BS-011, complete Bond file, and complete system-Chrome inventory.
  > **Uncertainty Declaration**
  > **What was attempted:** The required independent sequence and commands are fixed in this packet.
  > **What was observed:** No independent post-repair phase exists.
  > **Why this is uncertain:** Implementation evidence cannot substitute for test ownership.
  > **What would resolve this:** `bubbles.test` executes TP-01-02 through TP-01-09 after implementation.
- [ ] BUG-002 SCOPE-01 returns to `bubbles.test`, BUG-002 validation/audit completes, and Feature 006 Scope 3 replays only after the complete inventory is green.
  > **Uncertainty Declaration**
  > **What was attempted:** The parent resume chain is explicit and no foreign state was changed.
  > **What was observed:** BUG-002 and Feature 006 remain outside this packet's write boundary.
  > **Why this is uncertain:** Their owning phases have not resumed.
  > **What would resolve this:** Complete BUG-003 independent verification, then follow the exact owner chain without mutating foreign artifacts here.

> **Planning Evidence Boundary**
> Every unchecked item is intentionally unresolved. This packet claims root-cause diagnosis and implementation-ready planning only; it claims no implementation, independent test, validation, audit, certification, or parent replay.

## Structured Handoff

```yaml
packet: BUG-003-bond-regime-simple-power-model-digest-divergence
workflowMode: bugfix-fastlane
currentOwner: bubbles.bug
outcome: route_required
nextRequiredOwner: bubbles.implement
scope: SCOPE-01
scopeStatus: not_started
addressedFindingIds:
  - BUG003-RCA-001
  - BUG003-PLANNING-001
unresolvedFindingIds:
  - BUG003-ASYNC-READY-RACE
  - BUG003-DETERMINISTIC-RED-GAP
  - BUG003-INDEPENDENT-VERIFICATION
  - BUG002-ACCEPTANCE-BLOCK
```
