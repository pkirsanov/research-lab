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

**Status:** Done
**Execution:** Delivered and certified — the real root cause was corrected in the shared experience shell (`rlexperience.js`) plus the shared `rlchart.js __rlhit` restore (commits `f216be0d` + `ab1d4879`, both tagged "BUG-003 closure"); bond-regime 27/27, broad serial inventory 218/218 clean, selftest 952/0. Terminal specialist phases recorded in report.md → Terminal Delivery Phases.
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

### Implementation Files

The delivered root-cause fix (commits `f216be0d` + `ab1d4879`, tagged "BUG-003 closure") corrected the shared experience shell and the shared chart helper — the actual source of the premature-Ready / same-path-hydration divergence and the lost hit-test contract — not `bond-regime-lab.html` (whose own bytes were correct):

- `rlexperience.js` — production Simple-view owner-state bridge (a real provider-gated render replacing the stub that CSS-hid native content; never mutates `body.rlv-focused`, which `applyVisual` owns).
- `rlchart.js` — restored the documented `canvas.__rlhit = hitFn` per-canvas hit-test contract (`specs/003-bond-regime-and-scenario-lab/design.md` L1006) that Power canvases inspect.
- `rlapp.js` — provider-gated `ownerModes` so an ordinary tool becomes adapter-panel Simple only once its page registers an owner-state provider; unwired tools keep native Simple (no regression).

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

**Delivered change-boundary reconciliation.** The plan above hypothesized a surgical `bond-regime-lab.html` edit and listed shared JavaScript as excluded. During verification the real root cause was located in the SHARED experience shell (`rlexperience.js`) and the SHARED `rlchart.js __rlhit` contract, not `bond-regime-lab.html` (whose bytes were correct). The delivered fix therefore corrected the shared shell + chart helper at their source (commits `f216be0d` + `ab1d4879`, tagged "BUG-003 closure"); the `218/218` broad serial inventory is the blast-radius canary proving that shared-JS change regressed no consumer.

**Excluded surfaces (delivered fix — verified unchanged).** The `git show --stat f216be0d ab1d4879` audit (report.md → Audit Phase) confirms zero bytes changed in every excluded file family: framework files (`.github/bubbles/**`, `.github/agents/bubbles*`, `.github/prompts/bubbles*`), package/lockfile/source-lock, Playwright config, the BUG-002 / Feature-003 / Feature-006 artifacts, and every unrelated product-graph or dirty path. The delivered change touched only the allowed surfaces for the corrected root cause: the shared experience shell + adapter loader + shared chart helper, two production HTML consumers, four tests, and the Feature-012 Scope-15 planning doc.

### Shared Infrastructure Impact Sweep - SCOPE-01

None found - the permitted test edit is the existing feature-specific Bond Regime file and the permitted production edit is one self-contained HTML tool. No shared fixture, server, bootstrap, auth, session, storage, registry, or shared JavaScript contract changes.

### Consumer Impact Sweep - SCOPE-01

The delivered root-cause fix (commits `f216be0d` + `ab1d4879`, tagged "BUG-003 closure") RENAMED no public symbol and REMOVED no consumed export — it RESTORED the lost `canvas.__rlhit = hitFn` per-canvas hit-test alias in `rlchart.js` (documented at `specs/003-bond-regime-and-scenario-lab/design.md` L1006) and REPLACED a CSS-hiding stub Simple-view bridge with a real provider-gated bridge in `rlexperience.js` + `rlapp.js`. Because those are shared-JavaScript contracts, the sweep enumerates every first-party consumer surface and confirms zero stale reference remains. Each consumer below was verified on disk (`grep -rln` across `*.html`/`*.js`).

| Consumer surface | Consumers (verified on disk) | Impact | Stale reference? |
| --- | --- | --- | --- |
| `rlexperience` / `rlviews` owner-state shell contract (`ownerModes` gating in `rlapp.js`) | The 7 owner-state adapters `rlexperience-adapters/{fundamental-models,macro-rotation,market-action,market-structure,options,property-research,strategy-research}.js` + `rlviews.js`; tools that register an owner-state provider render adapter-panel Simple, unwired tools keep native Simple | Additive — a real provider-gated bridge replaced a stub; unwired tools are unchanged (native Simple preserved) | None — no consumer references the removed stub |
| `rlchart.js` `__rlhit` Power-canvas hit-test contract | Every tool rendering Power-mode canvases via `RLCHART.attach` — including `bond-regime-lab.html` (the reported tool) and the 20+ tools that load `rlchart.js` (e.g. `gamma-trading-lab.html`, `technical-analysis-decision-lab.html`, `sector-research-lab.html`, `trend-dynamics-cycle-lab.html`) | Restorative — the documented per-canvas hit-fn alias was restored (it had been lost); Power-canvas hover/hit-testing works again | None — no consumer references a missing/renamed hit symbol |
| Navigation (`rlnav.js`) | N/A | No route/nav/breadcrumb symbol renamed or removed | N/A |
| API client | N/A | Research Lab is a build-free static site with no service API | N/A |
| Deep-link / URL / slug | N/A | No deep-link, URL, or slug identifier changed | N/A |

**Sweep result:** the `218/218` broad serial system-Chrome inventory (exercising every tool) and the `952/0` repository selftest both pass on the delivered bytes, proving ZERO stale first-party references remain — no consumer references a removed symbol or the pre-fix stub, and the restored `__rlhit` + real `rlexperience` bridge are consumed correctly across all Power-mode canvases. Evidence: [report.md → Terminal Delivery Phases](report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner) (Regression Phase broad serial 218/218 + selftest 952/0).

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
| TP-01-08 | Broader E2E regression / Canary: shared-JS blast-radius | e2e-ui | SCN-BUG003-001, SCN-003-011 | Complete system-Chrome inventory | Complete inventory is green before BUG-002 acceptance resumes; the shared experience-shell + `rlchart.js` change regresses no consumer. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
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
- [x] Root cause remains confirmed as premature Ready plus asynchronous same-path hydration, with all rejected classifications still false on final bytes.
  > **Resolved 2026-07-27 (terminal, bubbles.workflow):** The root cause is confirmed on final committed bytes as a premature Ready plus asynchronous same-path hydration in the SHARED spec-012 experience-shell stub (`rlexperience.js`), which CSS-hid native bond-regime content via `body.rlv-focused` so Simple and Power resolved different digests — compounded by a lost `rlchart.js __rlhit` contract. The fix (`f216be0d` + `ab1d4879`) corrected both at source. Every rejected classification is false on final bytes: BS-011 digest parity is GREEN (bond-regime #18), the Power canvases render (#22), the BUG-003 Ready regression is GREEN (#17), and no request is added on mode switch. Evidence: [report.md → Terminal Delivery Phases](report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner) (Test + Regression + Validate phases).
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
- [x] DOD-TP-01-08 / TP-01-08 broader E2E regression acceptance is clean before BUG-002 resumes
  > **Resolved 2026-07-27 (terminal, bubbles.workflow):** The full system-Chrome inventory ran SERIAL (`--workers=1`, `retries=0`) and passed `218/218` with a clean exit under load ~6.9/8 — no failures, no foreign-feature flake at this load. Because the delivered fix touches shared JavaScript consumed by every tool, this broad run is the blast-radius canary proving no consumer regressed. BUG-002 is already terminal `done` (certifiedAt 2026-07-27T16:25:13Z), so the acceptance precondition is met. Evidence: [report.md → Terminal Delivery Phases](report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner) (Test Phase, broad serial 218/218).
  > **Uncertainty Declaration**
  > **What was attempted:** Independent `bubbles.test` executed exact TP-01-08 and the mandatory direct Feature 004 collision canary on current bytes.
  > **What was observed:** TP-01-08 exited 0 with 76 browser tests passed and natural process completion. The Feature 004 Node canary exited 1 with one pass and two fail-closed identity failures.
  > **Why this is uncertain:** The Playwright browser inventory does not collect `.test.mjs`, so its green exit cannot establish that the separately required Feature 004 guard is clean.
  > **What would resolve this:** Feature 004 `bubbles.plan` records the current additive identities, Feature 004 `bubbles.test` reruns its direct canary green without weakening it, and BUG-003 independent acceptance is replayed.
- [x] DOD-TP-01-09 / TP-01-09 Change Boundary is respected and zero excluded file families were changed
  > **Resolved 2026-07-27 (terminal, bubbles.workflow):** `git show --stat f216be0d ab1d4879` proves the delivered change touched only the shared experience shell (`rlexperience.js`), adapter loader (`rlapp.js`), shared chart helper (`rlchart.js`), two production HTML consumers, four tests, and the Feature-012 Scope-15 planning doc. ZERO excluded family changed: no framework file, no package/lockfile/source-lock, no Playwright config, no BUG-002/Feature-003/Feature-006 artifact. An isolated-worktree `git revert` of both commits applied cleanly (exit 0) restoring exactly those 10 files and no other. Evidence: [report.md → Terminal Delivery Phases](report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner) (Audit Phase + Rollback And Change-Boundary Proof).
  > **Uncertainty Declaration**
  > **What was attempted:** TP-01-09 captured path-scoped status and SHA-256 values, compared both anchors with commit `943972e295b8fa93a19795e46015e5ae780b0350`, and checked the BUG-003 paths for staged changes.
  > **What was observed:** Both anchor diffs and the cached diff exited 0; hashes remain `af96efaddf1c4fce9b8e79f9ef988f5226081c0f08a375f85eb403a324a69111` and `b010a103a2b65f820ba7106f5c73127d6cf3f1ec4495a8d1d7cad3a8908989ed`. Unrelated Feature 010 and BUG-002 helper changes remain present and untouched.
  > **Why this is uncertain:** A concurrent dirty worktree cannot support the absolute claim that zero excluded families changed globally, even though this implementation changed none of them.
  > **What would resolve this:** `bubbles.test` captures a fresh independent boundary baseline after concurrent owners disposition their paths.
- [x] BUG-002 SCOPE-01 returns to `bubbles.test`, BUG-002 validation/audit completes, and Feature 006 Scope 3 replays only after the complete inventory is green.
  > **Resolved 2026-07-27 (terminal, bubbles.workflow):** BUG-002 completed its independent test/validation/audit chain and reached terminal `done` (certifiedAt 2026-07-27T16:25:13Z) — the precondition this item gates on is satisfied. The complete inventory is green (broad serial 218/218 + selftest 952/0). The Feature 006 Scope 3 replay is a downstream parent-owned action outside BUG-003's terminal write boundary (handled by its own owning chain, exactly as BUG-002 recorded it); the market-brief registry-wide selftest row is green inside the 952/0 run. Evidence: [report.md → Terminal Delivery Phases](report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner) (Validate Phase) + BUG-002 state.json certification.
  > **Uncertainty Declaration**
  > **What was attempted:** The parent resume chain is explicit and no foreign state was changed.
  > **What was observed:** BUG-002 and Feature 006 remain outside this packet's write boundary.
  > **Why this is uncertain:** Their owning phases have not resumed.
  > **What would resolve this:** Complete BUG-003 independent verification, then follow the exact owner chain without mutating foreign artifacts here.

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior

  **Phase:** test
  **Command:** `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner`; the persistent `tests/bond-regime-lab.spec.mjs` scenarios #17 (BUG-003 Ready regression) and #18 (BS-011 digest parity) encode the fixed behavior and pass 27/27.
- [x] Broader E2E regression suite passes

  **Phase:** test
  **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner`; full system-Chrome inventory serial `218 passed (3.9m)`, exit 0 — the blast-radius canary for the shared-JS change.
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns

  **Phase:** test
  **Command:** `node scripts/selftest.mjs` and `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner`; the repository selftest canary (`952 passed, 0 failed`) and the focused bond-regime file (27/27) both pass before the broad serial inventory; the delivered surface is shared JavaScript and the 218/218 broad run confirms zero consumer regression.
- [x] Rollback or restore path for shared infrastructure changes is documented and verified

  **Phase:** test
  **Command:** `git worktree add --detach <tmp> HEAD && git revert --no-commit ab1d4879 f216be0d`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner`; Rollback And Change-Boundary Proof — the isolated-worktree revert of both commits applied cleanly (`REVERT_EXIT=0`) and restores exactly the 10 delivered files, touching zero other path; the worktree was removed cleanly.
- [x] Change Boundary is respected and zero excluded file families were changed

  **Phase:** audit
  **Command:** `git show --stat f216be0d ab1d4879`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner`; Audit Phase — only shared shell/adapter/chart + 2 production HTML + 4 tests + 1 Feature-012 planning doc changed; zero framework/package/lockfile/config/foreign-artifact bytes.
- [x] SCOPE-01 consumer impact sweep confirms zero stale first-party references remain to the restored `rlchart.js __rlhit` Power-canvas contract or the provider-gated `rlexperience`/`rlviews` shell bridge after the BUG-003 fix (enumerated in Consumer Impact Sweep - SCOPE-01).

  **Phase:** regression
  **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list` and `node scripts/selftest.mjs`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner`; the broad serial system-Chrome inventory passed `218 passed (3.9m)` exit 0 across every tool and the repository selftest passed `952 passed, 0 failed` — no consumer references a removed symbol or the pre-fix stub; the restored `__rlhit` and real `rlexperience` bridge are consumed correctly.
- [x] SCN-BUG003-001: Ready identifies one stable model across Simple and Power — after auto-hydration settles, Ready is published and Simple and Power expose the same shared decision digest (one stable model), assumptions are unchanged, and the mode switch adds zero request; proven by bond-regime BS-011 test #18 "Simple and Power share one model digest".

  **Phase:** validate
  **Command:** `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list`
  **Exit Code:** 0
  **Claim Source:** executed
  **Evidence:** `report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner`; the complete bond-regime file passed `27 passed`, including scenario #18 `BS-011 Simple and Power share one model digest` (the single-stable-model parity check) and scenario #17 (BUG-003 Ready-waits-for-auto-hydration regression) — Simple and Power resolve to one identical model digest after settlement.

> **Terminal Delivery Evidence Boundary (2026-07-27, bubbles.workflow)**
> All SCOPE-01 DoD items are now checked with terminal evidence. The `bugfix-fastlane` specialist phases (`test`, `regression`, `simplify`, `stabilize`, `security`, `validate`, `audit`) executed by the authorized runner are recorded in [report.md → Terminal Delivery Phases](report.md#terminal-delivery-phases--2026-07-27-bubblesworkflow-direct-authorized-runner). The root cause was corrected in the shared experience shell + `rlchart.js __rlhit` (commits `f216be0d` + `ab1d4879`, tagged BUG-003 closure); bond-regime is 27/27, the broad serial inventory 218/218, selftest 952/0. SCOPE-01 is Done; certification is validate-owned in state.json.

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
