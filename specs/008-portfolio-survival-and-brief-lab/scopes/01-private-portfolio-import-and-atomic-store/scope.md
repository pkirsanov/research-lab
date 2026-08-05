# Scope 01: Private Portfolio Import And Atomic Store

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** In Progress

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `shared-infrastructure:true`, `privacy-critical:true`

**Depends On:** None

**Overlay Dependency Contract:** Every remaining Feature 008 scope depends directly or transitively on this private-context foundation.

**Primary Outcome:** A user can import or manually enter a portfolio through the real unregistered route, inspect a redacted atomic preview, confirm one immutable local revision, reload it from verified storage, and receive an explicit session-only state when durable storage is unavailable.

## Requirement Coverage

- **Functional:** FR-001 through FR-010 and FR-017 through FR-018.
- **Non-functional:** NFR-001 through NFR-003, NFR-007 through NFR-008, NFR-012, and NFR-019 through NFR-020.
- **Policies:** mandatory configuration, local-only personal state, no credential import, no execution, atomic replacement, no hidden values, inert imported text, and deterministic revision identity.

## Gherkin Scenarios

### SCN-008-001 - Valid local portfolio import

```gherkin
Scenario: A user imports a valid portfolio without credentials
  Given the import contains recognized holding fields and no secret or account-identity field
  When the user reviews and confirms the import preview
  Then one new local portfolio revision becomes current
  And holdings, quantities, optional cost fields, and derived values remain local-only
  And the Portfolio Brief and portfolio analyses reference the new revision
```

### SCN-008-002 - Invalid import is atomic

```gherkin
Scenario: A malformed or secret-bearing import cannot partially replace the portfolio
  Given a current valid portfolio exists
  And a new import contains malformed rows, credential-shaped fields, or unresolved required identities
  When import validation runs
  Then the requested revision is rejected with row and field reasons
  And the prior portfolio remains current and unchanged
  And no rejected value enters storage, logs, URLs, telemetry, or committed artifacts
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|----------|---------------|------------|----------------------|-----------|
| SCN-008-001 valid import | No portfolio or one existing revision; durable storage available | Open route, choose local fixture file, inspect preview, confirm, reload | Accepted/normalized/duplicate states are explicit; one revision becomes current; no login, broker, account, or upload path exists | e2e-ui |
| SCN-008-002 rejected import | Existing current revision; malformed and secret-bearing rows | Select file, inspect safe row/field errors, attempt confirmation | Confirm stays disabled, rejected value is never echoed, and `Current portfolio unchanged` retains the prior identity | e2e-ui |
| Session-only persistence | Local storage blocked by fixture capability | Enter a valid draft, acknowledge session-only mode, confirm | The route states that closing the tab loses personal state and never claims a durable save | e2e-ui |

## Implementation Plan

1. Add mandatory `portfolio-survival-allocation.config.json` with closed v1 storage, import, behavior, analytics, solver, calibration, queue, and display policy. Missing, malformed, unknown-version, unknown-key, or non-finite policy blocks dependent compute while privacy inspect/clear remains reachable.
2. Add Node/browser dual-runtime `rlportfolio.js` with exact `PortfolioWorkspace/v1`, `PortfolioRevision/v1`, `HoldingEntry/v1`, `PortfolioError/v1`, canonical identity, closed unknown-field rejection, and value-safe errors through `RLCONTRACTS`.
3. Implement CSV/JSON import and manual drafts, duplicate-choice preview, explicit row removal, manual-alternative requirements, credential/account/payment/auth field rejection, inert labels, and no write before a fully valid confirmation.
4. Implement two validated durable slots plus generation compare-and-swap pointer, post-write reread/hash verification, last-known-good retention, closed migration map, sanitized quarantine metadata, sessionStorage fallback, and memory-only state.
5. Add the unregistered `portfolio-survival-allocation-lab.html` setup shell with Portfolio Brief as the selected workspace tab, local-only boundary, import/manual editor, atomic preview, write-failure/session-only truth states, and current-revision strip.
6. Add deterministic real-format import/storage fixtures under `tests/fixtures/portfolio-survival-allocation/`, production-module unit/functional tests, and the real ephemeral-server browser support without external providers, service workers, or request interception.
7. Keep every calibration value in mandatory config and expose its version through the setup/privacy surface; production code contains no policy fallback.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad tests |
|-------------------|---------------------|-----------------------------------------|
| `rlcontracts.js` consumption | Existing canonicalization/hash exports and browser/CommonJS behavior remain unchanged | `tests/portfolio-foundation.unit.mjs` imports the existing namespace directly and `node scripts/selftest.mjs` remains unchanged until a later owned additive block |
| Browser storage | Existing `RLDATA` public cache and credential capability keys are never read, rewritten, migrated, pruned, or cleared | Functional key inventory proves all writes stay under exact `rlPortfolio*`/`rlReturnContextV1` namespaces |
| Fixture/server harness | Production HTML/JS is served unchanged; only public fixture paths overlay repository reads | Browser request ledger plus server canary proves no `page.route`, `context.route`, service worker, or external host request |

## Change Boundary And Rollback

**Allowed new files:** `portfolio-survival-allocation.config.json`, `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, `tests/portfolio-survival.support.mjs`, and `tests/fixtures/portfolio-survival-allocation/**` entries owned by Scopes 01-04.

**Allowed existing-file edit:** none in Scope 01.

**Explicitly excluded:** `rldata.js`, `rlnav.js`, `rlapp.js`, `rlbrief.js`, every generic Market Brief artifact/script/schedule, all registries/docs, package/source-lock files, Feature 001-007 source/tests/specs, unrelated tools, and framework-managed files.

**Dirty-work discipline:** capture path-scoped status and zero-context diffs before each allowed path. Existing user hunks remain byte-identical; no formatter or broad rewrite runs.

**Rollback/restore:** remove only Scope 01 new files and fixture entries. Browser storage rollback never deletes a user's personal keys automatically. A direct version-safety test proves incompatible newer records remain untouched, and the pre-scope repository selftest result remains the shared baseline.

## Scenario-First Red/Green Contract

Before production behavior, add the named unit/functional assertion and persistent browser title, then run the exact row command through `.github/bubbles/scripts/tool-log.sh` with `BUBBLES_SPEC=008-portfolio-survival-and-brief-lab`, `BUBBLES_SCOPE=SCOPE-01`, the `TP-*` tag, and `red`. RED is valid only when the intended contract assertion fails. After the smallest owned implementation, rerun the identical command with `green`. Syntax errors, missing Chrome, server startup errors, absent test discovery, or a different failing assertion do not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-01-01 | Unit | unit | SCN-008-001, SCN-008-002 | `tests/portfolio-foundation.unit.mjs` | Execute closed config/workspace/revision/holding/error validation, canonical identities, import normalization, duplicate policy, secret-shape mutation set, slot faults, generation conflicts, migration refusal, and session/memory states against production functions | `node --test tests/portfolio-foundation.unit.mjs` | No | `report.md#tp-01-01` |
| TP-01-02 | Functional | functional | SCN-008-001, SCN-008-002 | `tests/portfolio-privacy.functional.mjs` | Round-trip a real-format valid import through preview, atomic commit, reload, write faults, redacted invalid rows, namespace inventory, and inert hostile labels without touching public state | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-01-02` |
| TP-01-03 | Regression E2E | e2e-ui | SCN-008-001 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-001 valid local portfolio import creates one current revision` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-001 valid local portfolio import creates one current revision" --reporter=list` | Yes | `report.md#scenario-scn-008-001` |
| TP-01-04 | Regression E2E | e2e-ui | SCN-008-002 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted" --reporter=list` | Yes | `report.md#scenario-scn-008-002` |
| TP-01-05 | Persistence Regression E2E | e2e-ui | SCN-008-001, SCN-008-002 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes" --reporter=list` | Yes | `report.md#tp-01-05` |
| TP-01-06 | Broader Regression E2E | e2e-ui | SCN-008-001, SCN-008-002 | `tests/portfolio-survival-foundation.spec.mjs` | Execute the complete cumulative Feature 008 foundation browser suite over the real fixture-overlay HTTP server | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-01-06` |

Before any browser row, run `node scripts/validate-node-source-lock.mjs` and `npx --no-install playwright --version`; the latter must print exactly `Version 1.61.1`. These environment/source gates do not replace Test Plan rows.

### Definition of Done

#### Core Delivery Items

- [x] FR-001 through FR-010 and FR-017 through FR-018 are fully implemented: manual/file input, complete preview, explicit duplicate handling, atomic revision, manual valuation contract, local export warning, ticker-only public watchlist boundary, and zero order/external-account behavior.
  - **Phase:** implement
  - **Command:** `node --test tests/portfolio-foundation.unit.mjs` plus `node --test tests/portfolio-privacy.functional.mjs`
  - **Exit Code:** 0 / 0
  - **Claim Source:** executed
  - **Evidence:** [TP-01-01 and TP-01-02 raw RED/GREEN output](report.md#tp-01-01) and [static boundary output](report.md#static-boundary-and-dom-integrity).
- [x] NFR-001 through NFR-003, NFR-007 through NFR-008, NFR-012, and NFR-019 through NFR-020 are satisfied by deterministic identities, visible persistence states, inert input, static-site portability, and local-only data.
  - **Phase:** implement
  - **Command:** `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [TP-01-06 cumulative real-page output](report.md#tp-01-06), including direct same-origin request and storage-state assertions.
- [x] Mandatory configuration owns every storage/import/calibration value; missing or invalid config fails visibly and no production fallback supplies a policy value.
  - **Phase:** implement
  - **Command:** `node --test tests/portfolio-foundation.unit.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [TP-01-01 closed policy, unknown-version/key, non-finite, and config-independent privacy recovery output](report.md#tp-01-01).
- [x] The shared-infrastructure sweep, independent storage/server canaries, exact namespace inventory, session-only warning, and rollback/restore proof are complete.
  - **Phase:** implement
  - **Command:** `node scripts/selftest.mjs`, `node --test tests/portfolio-foundation.unit.mjs`, `node --test tests/portfolio-privacy.functional.mjs`, and `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
  - **Exit Code:** 0 / 0 / 0 / 0
  - **Claim Source:** executed
  - **Evidence:** [current-session re-verification](report.md#current-session-re-verification).
  - **Raw output:**

    ```text
    Research-Lab self-test: 1218 passed, 0 failed
    SELFTEST_EXIT=0
    ✔ slot and pointer faults preserve the last-known-good revision (35.950036ms)
    ✔ post-write slot corruption is detected before pointer publication (11.744616ms)
    ✔ future records remain untouched and durable session memory states are explicit (3.303048ms)
    ℹ tests 16   ℹ pass 16   ℹ fail 0            TP_01_01_EXIT=0
    ✔ secret-bearing import is redacted and cannot mutate any storage namespace (9.395654ms)
    ✔ hostile manual labels remain inert data and namespace writes stay closed (6.710296ms)
    ℹ tests 5    ℹ pass 5    ℹ fail 0            TP_01_02_EXIT=0
    [SCN-008-001] localKeys=rlPortfolioWorkspaceV1.pointer,rlPortfolioWorkspaceV1.slotA
    [SCN-008-001] remoteRequests=0
    [SCN-008-002] requestSentinel=false
    [TP-01-05] sessionWarning=true
    [TP-01-05] falseDurableClaim=false
    [TP-01-05] priorRevisionPreserved=true
    [TP-01-05] externalProviders=0
      3 passed (6.9s)                            TP_01_06_EXIT=0
    interception scan (page.route|context.route|msw|nock|cy.intercept) -> 0 matches
    external-host scan (https?://[a-zA-Z])                            -> 0 matches
    rlData|rlProviderConfig|rlApiKeys in rlportfolio.js               -> 0 matches
    git diff --check over Scope 01 paths                              -> DIFF_CHECK_EXIT=0
    ```

    The recorded resolution condition for this item was an exit-0 repository selftest; the Market Brief invariant is green and the suite reports 1218 passed, 0 failed. The three sweep canaries, the closed `rlPortfolio*`/`rlReturnContextV1` namespace inventory, the session-only warning, and the last-known-good rollback behavior are each independently proven above.
- [x] Every Scope 01 Test Plan behavior has intended RED and same-command GREEN evidence before the broader browser row.
  - **Phase:** implement
  - **Command:** exact TP-01-01 through TP-01-05 focused commands, followed by TP-01-06
  - **Exit Code:** intended RED 1; focused GREEN 0; cumulative GREEN 0
  - **Claim Source:** executed
  - **Evidence:** [per-row current-session RED/GREEN transcripts](report.md#test-evidence), recorded before the [TP-01-06 cumulative run](report.md#tp-01-06).

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [x] TP-01-01 unit evidence proves the closed contracts, identities, import, secret rejection, atomic slots, faults, migration, and fallback-state behavior.
  - **Phase:** implement
  - **Command:** `node --test tests/portfolio-foundation.unit.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [TP-01-01 raw output: 16 tests passed, 0 failed](report.md#tp-01-01).
- [x] TP-01-02 functional evidence proves valid/invalid import round trips, redaction, namespace isolation, inert text, and last-valid preservation through production modules.
  - **Phase:** implement
  - **Command:** `node --test tests/portfolio-privacy.functional.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [TP-01-02 raw output: 5 tests passed, 0 failed](report.md#tp-01-02).
- [x] TP-01-03 Regression E2E evidence proves SCN-008-001 previews, confirms, reloads, and displays exactly one current local revision with zero remote request.
  - **Phase:** implement
  - **Command:** `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-001 valid local portfolio import creates one current revision" --reporter=list`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [SCN-008-001 raw browser output](report.md#tp-01-03).
- [x] TP-01-04 Regression E2E evidence proves SCN-008-002 disables confirmation, redacts the rejected value, and preserves the prior portfolio and request ledger.
  - **Phase:** implement
  - **Command:** `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted" --reporter=list`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [SCN-008-002 raw browser output](report.md#tp-01-04).
- [x] TP-01-05 persistence E2E evidence proves durable, session-only, and memory-only modes preserve truthful state and never report an unverified save.
  - **Phase:** implement
  - **Command:** `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes" --reporter=list`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [TP-01-05 raw persistence-mode output](report.md#tp-01-05).
- [x] TP-01-06 broader E2E evidence proves the complete cumulative foundation suite passes after every focused row.
  - **Phase:** implement
  - **Command:** `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [TP-01-06 raw cumulative output: 3 tests passed](report.md#tp-01-06).

#### Scenario Behavioral Claims

These items restate each Gherkin scenario's own behavioral claim, unweakened. They stay unchecked until the claim as written is independently confirmed against the named Test Plan rows and recorded in `report.md`; the existing Test Evidence items above record that the rows ran, not that these claims were re-read against the Gherkin.

- [x] SCN-008-001 holds exactly as written: when a user imports a valid portfolio without credentials — an import carrying recognized holding fields and no secret or account-identity field — and reviews and confirms the import preview, one new local portfolio revision becomes current, its holdings, quantities, optional cost fields, and derived values remain local-only, and the Portfolio Brief and portfolio analyses reference the new revision.
  - **Phase:** implement
  - **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [SCN-008-001 Resolution - Current-Session Re-Verification](report.md#scn-008-001-resolution---current-session-re-verification), whose clause ledger cites the carrying assertion for each Scope 01 clause by file and line.
  - **Phase note:** planned for `validate`, resolved in `implement` because the recorded resolution is re-execution plus clause re-reading, which is execution work. The phase field records what actually ran; nothing here writes `certification.*`, so validate re-confirmation is unaffected.
  - **Verifying rows:** TP-01-03 (`Regression: SCN-008-001 valid local portfolio import creates one current revision`) and TP-01-05 (`Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes`) for the local-only durable, session-only, and memory-only revision states.
  - **Clause attribution:** the scenario's final `And` is a conjunction over two surface families, and no single scope renders both. Scope 01 owns and resolves three clauses plus one conjunct: one new current revision, local-only retention of every holding/quantity/cost/derived value, and the **Portfolio Brief** referencing that revision. The **portfolio analyses** conjunct is discharged by Scope 16 under SCN-008-036, whose `Given` fixes one active portfolio revision and whose expected assertion is that *all six tabs* expose equal identity values, verified by TP-16-05. Composition is what preserves the claim: Scope 01 proves that confirming a valid import is what makes a revision current, and Scope 16 proves every analysis tab renders the current revision's identity, so together they entail `the Portfolio Brief and portfolio analyses reference the new revision` as written. The Gherkin is unchanged and no clause is dropped — see [Cross-Scope Conjunct Discharge](../_index.md#cross-scope-conjunct-discharge).
  - **Resolution condition:** each Scope 01 clause named above is separately confirmed against the row output. A row that merely exits 0 does not resolve this item. The delegated `portfolio analyses` conjunct is NOT resolvable here and MUST NOT be claimed here; asserting it from Scope 01 evidence would be a false claim, because the analysis surfaces do not exist on the route yet.
  > **Resolution** (supersedes the prior Uncertainty Declaration; both blockers it named are discharged)
  > **Blocker 1 - stale run: RESOLVED.** The named rows were re-executed in the resolving session via the command above, exit code 0, 6 passed / 0 failed, at repository HEAD `1ae48dd5eca4cb5fc69faf7fca62d24ebd907a51`. The suite is 6 rows rather than the previously recorded 3 because Scope 02 added the three SCN-008-003/SCN-008-004 mandate rows; TP-01-03, TP-01-04, and TP-01-05 are all inside it and all passed.
  > **Blocker 2 - empty-workspace-only instantiation: RESOLVED.** TP-01-03 now commits a real second import over an existing revision through the same `importValid()` review-and-confirm helper the first import uses (`tests/portfolio-survival-foundation.spec.mjs:310`), and asserts `generation` 2 (:328), `revisionCount` 2 (:329), a distinct revision id (:331), the prior revision retained in order (:332), `supersedes` `[null, revisionId]` (:333), and `activeSlot` `slotB` (:335), with the new revision still current after reload (:346-348). The row is discriminating, not tautological: a no-op second import fails :312 and :328.
  > **Clause re-read, not exit-code inference.** All three Scope 01 clauses were re-read against this run and each is carried by a named assertion. `one new current revision` — :328-:335 plus :346-:348. `local-only retention of every holding/quantity/cost/derived value` — :336-:339 and :352-:355, which span both imports because `requestStart` is captured at :285; the `derived values` sub-clause is carried structurally, since :352-:355 leave no egress channel open rather than enumerating values. `the Portfolio Brief references the new revision` — :286 establishes the Brief surface and :342-:344 show the Brief's own `#currentRevision` line adopting the new id and name and dropping the superseded id.
  > **Transcript caveat, recorded so this tick is auditable.** The `[SCN-008-001]` console lines in the transcript print the pre-second-import captures (:359-:363), so they read `generation=1`, `revisions=1`, and `localKeys` ending at `slotA` while the row asserts 2, 2, and a set including `slotB`. The assertions are what carry the claim and a green row means every one held; the diagnostics merely lag. Filed as `F008-IMPL-009` for `bubbles.test`, not patched here.
  > **Delegated conjunct - NOT claimed here.** `portfolio analyses reference the new revision` is verified by Scope 16 TP-16-05 under SCN-008-036 per [Cross-Scope Conjunct Discharge](../_index.md#cross-scope-conjunct-discharge). The five analysis tabs still render `disabled` on this route, so asserting it from Scope 01 evidence would be false. This item's text is unchanged; the conjunct is delegated with its verifying scope and row named, not deleted. Evidence: [SCN-008-001 Resolution - Current-Session Re-Verification](report.md#scn-008-001-resolution---current-session-re-verification).
- [x] SCN-008-002 holds exactly as written: a malformed or secret-bearing import cannot partially replace the portfolio — given a current valid portfolio exists, an import carrying malformed rows, credential-shaped fields, or unresolved required identities is rejected with row and field reasons, the prior portfolio remains current and unchanged, and no rejected value enters storage, logs, URLs, telemetry, or committed artifacts.
  - **Phase:** implement
  - **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence:** [SCN-008-002 Resolution - Current-Session Re-Verification](report.md#scn-008-002-resolution---current-session-re-verification), whose clause ledger cites the carrying assertion for every clause by file and line.
  - **Phase note:** planned for `validate`, resolved in `implement` because the recorded resolution is re-execution plus clause re-reading against source, which is execution work. The phase field records what actually ran; nothing here writes `certification.*`, so validate re-confirmation is unaffected.
  - **Verifying rows:** TP-01-04 (`Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted`) and TP-01-05 (`Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes`) for last-known-good preservation across persistence modes.
  - **Resolution condition:** the atomicity claim is what must be shown — no partial replacement in any persistence mode, the prior revision identity unchanged after rejection, and the rejected value absent from every named sink. Evidence that an import was validated or that confirmation was disabled is weaker than this claim and does not resolve it.
  > **Resolution** (supersedes the prior Uncertainty Declaration; the blocking gap and both narrower gaps it named are discharged)
  > **Re-executed in this session.** Both named rows ran via the command above at repository HEAD `393219e296bb0e7ed97221ab9717637e1b62175d`, exit code 0, 6 passed / 0 failed. TP-01-04 is test 5 and TP-01-05 is test 6 of that run. The suite is 6 rows rather than the previously recorded 3 because Scope 02 added the three SCN-008-003/SCN-008-004 mandate rows.
  > **Blocking gap - `committed artifacts` had zero coverage: RESOLVED.** The probe is now a fixed scannable constant, `COMMITTED_ARTIFACT_SENTINEL` (`tests/portfolio-survival-foundation.spec.mjs:385`), with its one legitimate home declared at :386 — a `Date.now()` value could never appear in a committed file, so that change is what made the sink testable at all. `trackedPathsContaining()` (`tests/portfolio-survival.support.mjs:25-30`) runs `git grep` over TRACKED files only, so untracked scratch and ignored build output can neither mask nor manufacture a hit. The assertion is `found set === declared origins` (:445), never `found set is empty`, because a bare tree-wide scan would self-trigger on the declaration. Non-vacuity is proven, not asserted: `commitTrackedLeak()` (`tests/portfolio-survival.support.mjs:37-48`) builds a disposable repo that HAS committed the probe to `briefs/current.json`, the same scanner is pointed at it (:452), and :453-:454 assert it reports that path and classifies it as a violation. The causal half is closed too — :434-:435 show no shared-cache entry for `scripts/brief-distributed-publish.mjs` to harvest into tracked `briefs/`, and no storage key outside the private namespace. Output: `committedArtifactProbe=fixed-scannable`, `committedArtifactViolations=0`, `scannerAdversarialDetection=briefs/current.json`.
  > **Narrower gap (a) - `row and field` asserted only at error-code level: RESOLVED.** :404 asserts `/row \d+/` and :405 asserts `/field \S+/` against the rendered `#importErrors li` text, with :406 requiring those segments to name the location without echoing the value. Verified discriminating rather than merely present: `safeErrorCopy()` (`portfolio-survival-allocation-lab.html:1198-1204`) pushes `"row " + error.row` and `"field " + error.field` conditionally, so dropping either — the exact regression this gap described — fails :404 or :405.
  > **Narrower gap (b) - sink absence proven in durable mode only: RESOLVED.** TP-01-05 now scans every sink per mode inside its `durable`/`session`/`memory` loop (:533 localStorage, :534 sessionStorage, :535 URL, :536 page echo, :537 logs, :538 telemetry, :539 shared cache, :540 namespace) plus one tracked-tree scan covering all three (:556). The modes are proven genuinely different, not merely labelled: :531-:532 assert store liveness via an `instanceof Storage` probe, and the output carries the discrimination (`local-live:session-live`, `local-blocked:session-live`, `local-blocked:session-blocked`). Non-vacuity established: in `memory` both stores are blocked so the claim is carried by :531-:532 (no store exists to leak into); in `session` the live `sessionStorage` holds the committed revision, proven by the post-reload identity poll at :546-:547; and the probe provably reaches the page in every mode because the parse path is storage-independent — `validateImport(fileKind, bytes, current, policy)` (`rlportfolio.js:725`) is pure over its arguments and `setDraftResult()` (`portfolio-survival-allocation-lab.html:1279-1291`) writes only `state.draft` and the DOM. Output: `sinkScanModes=durable,session,memory`.
  > **Clause re-read, not exit-code inference.** Every clause was re-read against this run and each is carried by a named assertion, recorded line by line in [the clause ledger](report.md#scn-008-002-clause-ledger---re-read-against-current-session-output). The two clauses whose scans could have been vacuous were each shown non-vacuous by separate means. Neither "an import was validated" nor "confirmation was disabled" is used to carry any clause, per this item's resolution condition.
  > **Recorded weakness, not a blocker.** TP-01-05 never asserts that the invalid preview rendered in each mode; its only post-`setInputFiles` check is `#confirmImport` disabled (:500), which cannot carry that because `resetPreview()` already nulls `state.draft` after the prior confirm. No clause is left unproven — the parse path is storage-independent and TP-01-04 asserts the render directly — but the row reads stronger than it is. Filed as `F008-IMPL-010` for `bubbles.test`; adding a per-mode render assertion is a Test Plan change and is planning-owned, so it is not made here. Evidence: [SCN-008-002 Resolution - Current-Session Re-Verification](report.md#scn-008-002-resolution---current-session-re-verification).

#### Build Quality Gate

- [ ] Focused RED/GREEN records, fixture provenance, namespace and hostile-input scans, no-interception/service-worker/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16.
  > **Uncertainty Declaration**
  > **What was attempted:** every named Scope 01 check, re-executed in the current session: repository selftest, source lock, runner version, TP-01-01, TP-01-02, TP-01-06, implementation reality (G028/G029), G094, traceability, artifact lint, `git diff --check`, and the interception/namespace static scans.
  > **What was observed:** the repository selftest is now exit 0 with 1218 passed and 0 failed, and implementation reality is now exit 0 with 0 violations, so `F008-IMPL-001` and `F008-IMPL-002` are resolved. Five findings remain non-green: `F008-IMPL-003` G094 exit 1; `F008-IMPL-004` traceability exit 1; `F008-IMPL-006` planning-owned MD060 style; `F008-IMPL-007` artifact lint exit 1 on the `status` versus `certification.status` mismatch; and `F008-IMPL-008` Gate G068 reporting that neither Scope 01 Gherkin scenario maps to a faithful DoD item.
  > **Traceability failure decomposition (`--all-scopes`, 96 failures):** the 96 are three classes, not one, and `F008-IMPL-004` is only the first of them. 28 are `scenario-manifest.json` references to six linked test files that do not exist (`portfolio-survival-brief`, `-risk`, `-paths`, `-diversification`, `-allocation`, `-mobile`, all `.spec.mjs`), owned by Scopes 02-16. 34 are per-scope scenarios spanning Scopes 02-16 with no traceable Test Plan row, or mapped to a row that references no existing concrete test file. 34 are Gate G068 Gherkin-to-DoD content fidelity: 33 per-scenario failures plus 1 feature-level aggregate, and 2 of the 33 name Scope 01 itself, which is `F008-IMPL-008`. Attribution note: the `ℹ️ DoD fidelity: 36 scenarios checked, 3 mapped to DoD, 33 unmapped` line is informational, but the `❌ DoD content fidelity gap: 33 Gherkin scenario(s) have no matching DoD item` line immediately following it is a real failure, so the 33 is a genuine failure count and not a misread of an informational line.
  > **Why this is uncertain:** this grouped gate names G094, scope-local traceability, artifact lint, and editor diagnostics explicitly and requires them clean at the same time, so a completion claim would be false.
  > **Effect of the scope-local narrowing:** this item now requires `--current-scope` rather than `--all-scopes`, so the 28 manifest failures, the 34 per-scope Test Plan failures, the 31 G068 failures naming Scopes 02-16, and the 1 feature-level aggregate no longer block Scope 01. The narrowing does not by itself turn this item green. `--current-scope` currently refuses with exit 2 (`scope-universe-resolver: top-level status and certification.status disagree`), which is the same validate-owned state as `F008-IMPL-007`, and once that resolves, Scope 01's own 2 G068 failures still stand.
  > **What would resolve this:** G094 needs the literal word `foundation` on a `Depends On` line in a foreign scope file, and this scope declares `Allowed existing-file edit: none`. `F008-IMPL-007` needs a `certification.status` write, which is validate-owned, and that same write is what unblocks `--current-scope`. `F008-IMPL-006` and `F008-IMPL-008` need planning-owned Markdown and DoD item text, and rewriting DoD text is the exact condition Gate G068 exists to detect. Whole-feature traceability is no longer this scope's obligation; it is enforced once at the [Feature Completion Gate](../_index.md#feature-completion-gate). Route to `bubbles.plan` and `bubbles.validate`, then rerun the same checks.
