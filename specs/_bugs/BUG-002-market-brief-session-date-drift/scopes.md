# Scopes: BUG-002 Market Brief Session-Date Drift

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Ownership Status

**Workflow mode:** `bugfix-fastlane`  
**Planning outcome:** `route_required`  
**Implementation dispatch allowed:** `true`  
**Implementation outcome:** `route_required`  
**Independent test outcome:** `route_required` with broad E2E rework  
**Next required owner:** `bubbles.implement`  
**Parent finding:** `F006-EXT-SELFTEST-MARKET-BRIEF-001`

One delivery scope is sufficient. The existing wrapper is the only publication implementation, the validator contract is already explicit, and no UI design decision is open.

## Scope 1: SCOPE-01 Atomic Market Brief Publication

**Status:** In Progress  
**Depends On:** None  
**Scope-Kind:** bugfix  
**Tags:** foundation:true

### Gherkin Scenarios - SCOPE-01

```gherkin
Scenario: SCN-BUG002-001 failed rollover retains the last coherent Market Brief pair
  Given a clean published snapshot payload and history all target July 15
  And an isolated Tier-A candidate advances nextSessionDate to July 16
  When Tier B fails or is skipped and no valid July 16 payload exists
  Then the wrapper retains the July 15 snapshot payload and published history bytes
  And independently refreshed raw data may commit without the rejected brief candidate
  And the unchanged payload validator and rendered page never observe mixed target dates
```

### Implementation Plan - SCOPE-01

1. Capture a just-in-time status, index-object, worktree-hash, and scoped-diff baseline for every authorized and protected path. Stop if any existing authorized path is dirty.
2. Add `tests/brief-refresh-atomicity.support.mjs` and `tests/brief-refresh-atomicity.test.mjs`; execute the exact target-date-rollover test against the original wrapper and retain its failing output before editing production.
3. Add `tests/market-brief-session-date-drift.spec.mjs` with the exact protected browser title and real ephemeral HTTP serving.
4. Repair `scripts/brief-refresh-and-push.sh` to validate the baseline pair, restore payload/config per attempt, validate retained Tier B against candidate Tier A, retain baseline snapshot/history on cross-date failure, preserve same-target data-only publication, and stage only the selected transaction.
5. Repair the current published data by restoring `market-brief.snapshot.json` and `brief-history.jsonl` from commit `751b85d72dea16e790cd4e1281f3ed155bd06e60`; keep `market-brief.payload.json` byte-identical.
6. Execute focused functional, contract, shell, browser, repository, broader E2E, regression-quality, portability, and diff-integrity checks.
7. Route complete evidence to independent test, validation, audit, and parent Feature 006 replay without changing Feature 006 artifacts in this scope.

### Change Boundary - SCOPE-01

| Class | Paths | Rule |
| --- | --- | --- |
| Existing production | `scripts/brief-refresh-and-push.sh` | Surgical transaction repair only |
| New tests | `tests/brief-refresh-atomicity.support.mjs`, `tests/brief-refresh-atomicity.test.mjs`, `tests/market-brief-session-date-drift.spec.mjs` | Isolated fixtures; no real checkout mutation or network |
| Current data repair | `market-brief.snapshot.json`, `brief-history.jsonl` | Exact prior coherent bytes only |
| Read-only contract | `market-brief.payload.json`, `market-brief.config.json`, `scripts/brief-refresh.mjs`, `scripts/validate-brief-payload.mjs`, `market-brief.html`, `rlbrief.js` | No edit |
| Protected dirty | `notes/market-brief.md`, `.github/prompts/market-brief-update.prompt.md`, `scripts/selftest.mjs`, untracked validator ownership, Feature 005, Feature 006, unrelated paths | No edit, stage, restore, clean, or normalization |
| Framework | `.github/bubbles/**`, `.github/agents/bubbles*`, `.github/prompts/bubbles*`, `.github/skills/bubbles-*`, `.github/instructions/bubbles-*` | Downstream read-only |

### Atomicity And Rollback Contract - SCOPE-01

- Baseline validation and clean-owned-path preflight occur before fetch or refresh.
- Every failed Tier-B attempt restores baseline payload and config.
- A valid same-target retained payload permits candidate Tier A and history to publish.
- A cross-target retained payload rejects candidate snapshot/history and retains baseline pair bytes.
- Raw `data/` changes remain independently eligible after rejected brief publication.
- A post-staging failure unstages only owned paths and restores only preflight-proven baseline bytes.
- No broad stash, reset, clean, checkout overwrite, stage-all, or whole-file rollback is permitted.

### Test Plan - SCOPE-01

| ID | Type | Category | Scenario | File / exact test title | Required assertion | Exact command | Live |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Before-fix repository regression | integration | SCN-BUG002-001 | `scripts/selftest.mjs` - `current payload satisfies the executable brief contract` | Current bytes fail only because payload July 15 differs from snapshot July 16. | `node scripts/selftest.mjs` | No |
| TP-01-02 | Functional adversarial regression | functional | SCN-BUG002-001 | `tests/brief-refresh-atomicity.test.mjs` - `Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails` | RED on original wrapper; GREEN proves baseline snapshot/payload/history byte retention, no mixed commit, and validator pass. | `node --test tests/brief-refresh-atomicity.test.mjs` | No |
| TP-01-03 | Functional transaction matrix | functional | SCN-BUG002-001 | `tests/brief-refresh-atomicity.test.mjs` - same-target, matching-pair, retry-config, validation-failure, and raw-data-only cases | Every commit selection and rollback branch is explicit and deterministic. | `node --test tests/brief-refresh-atomicity.test.mjs` | No |
| TP-01-04 | Dirty-worktree adversarial | functional | SCN-BUG002-001 | `tests/brief-refresh-atomicity.test.mjs` - owned-dirty refusal and unrelated-dirty preservation | Owned dirt stops before mutation; unrelated bytes/index/status remain identical. | `node --test tests/brief-refresh-atomicity.test.mjs` | No |
| TP-01-05 | Regression E2E adversarial | e2e-ui | SCN-BUG002-001 | `tests/market-brief-session-date-drift.spec.mjs` - `Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot` | Real wrapper plus real page/renderer serves one coherent retained date, thesis, actions, and market context. | `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list` | Yes |
| TP-01-06 | Focused E2E file | e2e-ui | SCN-BUG002-001 | `tests/market-brief-session-date-drift.spec.mjs` - complete file | All Market Brief atomic-publication browser cases pass over real HTTP. | `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-01-07 | Executable pair contract | functional | SCN-BUG002-001 | `scripts/validate-brief-payload.mjs` - committed pair | Repaired current pair and selected fixture pairs satisfy the unchanged date invariant. | `node scripts/validate-brief-payload.mjs` | No |
| TP-01-08 | Complete repository canary | integration | SCN-BUG002-001 | `scripts/selftest.mjs` - complete inventory | All repository assertions pass and `F006-EXT-SELFTEST-MARKET-BRIEF-001` is absent. | `node scripts/selftest.mjs` | No |
| TP-01-09 | Shell portability/syntax | functional | SCN-BUG002-001 | `scripts/brief-refresh-and-push.sh` - Bash parse | Wrapper parses on the project macOS command surface and adds no GNU-only form. | `bash -n scripts/brief-refresh-and-push.sh` | No |
| TP-01-10 | Broader E2E regression | e2e-ui | SCN-BUG002-001 | Existing complete Playwright inventory | No existing browser behavior regresses after the focused file passes. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Test Taxonomy Applicability - SCOPE-01

| Category | Applicability | Reason |
| --- | --- | --- |
| unit | Not applicable | The defect is shell/Git publication orchestration, not a separable pure computation |
| functional | Required | Isolated Git fixtures exercise branch, staging, retry, and rollback behavior |
| integration | Required | The unchanged validator and complete repository selftest consume real current files |
| ui-unit | Not applicable | No component framework or UI component changes |
| e2e-api | Not applicable | Research Lab has no service API |
| e2e-ui | Required | The served action block must never expose a mixed pair |
| stress | Not applicable | No throughput or repetition SLA changes |
| load | Not applicable | No concurrency or capacity contract changes |

### Definition of Done - SCOPE-01

- [x] SCN-BUG002-001 failed rollover retains the last coherent Market Brief pair and never publishes or serves mixed target dates. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix) and [focused browser regression](report.md#focused-browser-regression).)
- [x] Root cause is confirmed against current bytes, wrapper control flow, renderer behavior, and Git provenance. (**Phase:** implement; **Evidence:** [initial focused verdict](report.md#initial-focused-current-bytes-verdict), [exact repair identity](report.md#exact-current-pair-repair-identity), and [root-cause decision](report.md#root-cause-decision).)
- [x] The exact functional adversarial regression fails before the wrapper fix. (**Phase:** implement; **Evidence:** [final immutable pre-fix RED and working-tree GREEN](report.md#final-immutable-pre-fix-red-and-working-tree-green).)
- [x] The wrapper validates baseline and selected pairs, restores payload/config per attempt, and selects same-target data-only, matching pair, or raw-data-only commit behavior correctly. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix).)
- [x] Current `market-brief.snapshot.json` and `brief-history.jsonl` are restored from the exact last coherent source while `market-brief.payload.json` remains byte-identical. (**Phase:** implement; **Evidence:** [exact current-pair repair identity](report.md#exact-current-pair-repair-identity).)
- [x] Atomic rollback leaves no rejected snapshot/history/payload/config bytes or owned staged paths after failure. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix).)
- [x] Dirty owned paths refuse before mutation and unrelated dirty bytes/index/status remain unchanged. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix) and [implementation integrity](report.md#implementation-integrity-and-dirty-boundary).)
- [x] Tests use isolated temporary Git/HTTP fixtures with no credential, external network, production monitoring, backup, release-train, or knb mutation. (**Phase:** implement; **Evidence:** [final fixture authenticity and isolation](report.md#final-fixture-authenticity-and-isolation).)
  > **Phase:** test  
  > **Claim Source:** executed  
  > **Evidence:** [Fixture Authenticity, Isolation, And Test Integrity](report.md#fixture-authenticity-isolation-and-test-integrity) and [Depth-1 Current-Session Corroboration](report.md#depth-1-current-session-corroboration) record OS-temporary Git repositories, local bare remotes, ephemeral loopback HTTP, zero interception/external requests, a green pollution scan, and clean fixture teardown.
- [x] `TP-01-02`, `TP-01-03`, and `TP-01-04` pass after the fix with no selective-run, pending-test, or silent-return bailout marker. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix).)
- [x] `TP-01-05` and `TP-01-06` pass through the checkout-local Playwright 1.61.1 runner and system Chrome. (**Phase:** implement; **Evidence:** [focused browser regression](report.md#focused-browser-regression).)
- [x] `TP-01-07`, `TP-01-08`, and `TP-01-09` pass on the repaired current bytes. (**Phase:** implement; **Evidence:** [current-pair contract and repository canary](report.md#current-pair-contract-and-repository-canary) and [implementation integrity](report.md#implementation-integrity-and-dirty-boundary).)
- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior (**Phase:** implement; **Evidence:** [focused browser regression](report.md#focused-browser-regression).)
- [x] Broader E2E regression suite passes (**Phase:** implement; **Evidence:** [final browser regression](report.md#final-browser-regression).)
  > **Phase:** test  
  > **Claim Source:** interpreted  
  > **Interpretation:** Earlier independent inventories passed `73/73`, but the latest exact reliability recheck failed `72/73`; the implementation-phase checkbox remains historical evidence and does not establish current test-phase completion.
  > **Uncertainty Declaration**
  > **What was attempted:** The exact TP-01-10 inventory was rerun, then its failing Feature 007 title was isolated.
  > **What was observed:** Complete inventory failed because `seriesEnvelope` was undefined; the isolated title passed `1/1`.
  > **Why this is uncertain:** The failure is order- or concurrency-sensitive and is not reproducible in isolation.
  > **What would resolve this:** `bubbles.implement` repairs or contains the shared-state ordering defect, then `bubbles.test` reruns the exact complete inventory.
- [x] Regression quality, source-lock, portability, artifact, freshness, traceability, G094, framework-write, diagnostics, and diff-integrity checks pass. (**Phase:** implement; **Evidence:** [final governance and containment matrix](report.md#final-governance-and-containment-matrix).)
  > **Phase:** test  
  > **Claim Source:** executed  
  > **Evidence:** [Test Quality And Governance Guards](report.md#test-quality-and-governance-guards), [Diagnostics](report.md#diagnostics), and [Depth-1 Current-Session Corroboration](report.md#depth-1-current-session-corroboration) record independent G003/G004/G005/G051/G079, regression-quality, source-lock, portability, pollution, artifact, freshness, traceability, implementation-reality, G094, framework-write, diagnostics, and containment results. Validate-owned certification remains separate.
- [ ] Independent `bubbles.test`, `bubbles.validate`, and `bubbles.audit` evidence accounts for every finding with no terminal claim written by implementation.

  > **Phase:** test  
  > **Claim Source:** executed  
  > **Evidence:** [Independent Test Finding Accounting](report.md#independent-test-finding-accounting) and [Depth-1 Current-Session Corroboration](report.md#depth-1-current-session-corroboration) account for every test-routed finding and resolve `TR-BUG-002-TEST` without a terminal claim.
  > **Uncertainty Declaration**
  > **What was attempted:** Independent functional, integration, E2E, portability, source-lock, isolation, artifact, traceability, framework, diagnostics, and dirty-boundary verification completed under `bubbles.test`.
  > **What was observed:** Focused BUG-002 evidence is green, but the exact complete browser inventory reliability recheck failed `72/73`; validate and audit have not executed.
  > **Why this is uncertain:** Independent test completion and the later certification owners remain outstanding.
  > **What would resolve this:** Complete `TR-BUG-002-IMPLEMENT-REWORK-01`, rerun independent test, then continue through regression and the remaining registered phases.
- [ ] BUG-002 is marked Fixed only after validate-owned certification, and the parent Feature 006 Scope 3 exact selftest row passes before resume.

  > **Uncertainty Declaration**  
  > **What was attempted:** The implementation owner ran the exact repository selftest on repaired current bytes.  
  > **What was observed:** `Research-Lab self-test: 497 passed, 0 failed`; BUG-002 top-level and certification statuses remain `in_progress`, and Feature 006 artifacts were not changed.  
  > **Why this is uncertain:** Only validate may certify BUG-002, and only the parent runner may record the Feature 006 Scope 3 replay.  
  > **What would resolve this:** Validate-owned certification succeeds after independent verification, then the active parent runner executes and records the exact Feature 006 Scope 3 selftest row.
  > **Uncertainty Declaration**
  > **What was attempted:** The repository selftest passed on implementation bytes; no BUG-002 certification field or Feature 006 artifact was changed.
  > **What was observed:** BUG-002 remains In Progress and the parent replay is absent.
  > **Why this is uncertain:** Validate-owned certification and parent-owned replay have not occurred.
  > **What would resolve this:** `bubbles.validate` certifies after independent evidence, followed by the Feature 006 owner's exact blocked-row replay.

> **Historical Planning Evidence Boundary**
> At packet creation every DoD item was unchecked because no implementation, new regression, independent test, validation, audit, or after-fix replay had occurred. [report.md](report.md) preserves that planning evidence and appends implementation evidence separately.
> **Implementation Evidence Boundary**
> Checked items above are implementation-phase claims backed by current-session raw output in [report.md](report.md#scope-01-implementation-resume). The immutable pre-fix replay is recorded, while independent test, validation, audit, certification, and parent replay remain unchecked. SCOPE-01 stays In Progress.
> **Independent Test Evidence Boundary**
> [report.md](report.md#independent-test-phase---2026-07-16) records independent RED/GREEN, full planned matrix, authenticity, integrity, and gate evidence; [the depth-1 corroboration](report.md#depth-1-current-session-corroboration) records this invocation's structured session. Regression, validation, audit, certification, and parent replay remain absent. SCOPE-01 stays In Progress.

## Structured Handoff

```yaml
packet: BUG-002-market-brief-session-date-drift
workflowMode: bugfix-fastlane
currentOwner: bubbles.test
outcome: route_required
nextRequiredOwner: bubbles.implement
scope: SCOPE-01
scopeStatus: in_progress
implementationEvidenceGreen: true
independentTestEvidenceGreen: false
addressedFindingIds:
  - F006-EXT-SELFTEST-MARKET-BRIEF-001
  - BUG002-WRAPPER-ATOMICITY
  - BUG002-REGRESSION-GAP
  - BUG002-DIRTY-BOUNDARY
  - BUG002-RED-EVIDENCE-GAP
  - BUG002-TEST-PROBE-FALSE-POSITIVE
unresolvedFindingIds:
  - BUG002-BROAD-E2E-INSTABILITY
  - BUG002-REGRESSION-GAP
  - BUG002-INDEPENDENT-VERIFICATION
  - BUG002-VALIDATE-CERTIFICATION
  - BUG002-AUDIT-CERTIFICATION
```
