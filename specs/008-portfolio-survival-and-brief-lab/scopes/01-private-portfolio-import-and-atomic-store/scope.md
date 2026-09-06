# Scope 01: Private Portfolio Import And Atomic Store

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Done

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
Scenario: SCN-008-001 - A user imports a valid portfolio without credentials
  Given the import contains recognized holding fields and no secret or account-identity field
  When the user reviews and confirms the import preview
  Then one new local portfolio revision becomes current
  And holdings, quantities, optional cost fields, and derived values remain local-only
  And the Portfolio Brief and portfolio analyses reference the new revision
```

### SCN-008-002 - Invalid import is atomic

```gherkin
Scenario: SCN-008-002 - A malformed or secret-bearing import cannot partially replace the portfolio
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

**Allowed file families:** `portfolio-survival-allocation.config.json`, `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, `tests/portfolio-survival.support.mjs`, `tests/fixtures/portfolio-survival-allocation/**`.

**Excluded surfaces:** `rldata.js`, `rlnav.js`, `rlapp.js`, `rlbrief.js`, `market-brief.html`, `market-brief.*.json`, `brief-history*.jsonl`, `scripts/brief-*`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, every other root `rl*.js` module, `specs/001-*` through `specs/007-*`, and `.github/bubbles/**`.

**Allowed new files:** `portfolio-survival-allocation.config.json`, `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, `tests/portfolio-survival.support.mjs`, and `tests/fixtures/portfolio-survival-allocation/**` entries owned by Scopes 01-04.

**Allowed existing-file edit:** none in Scope 01.

**Explicitly excluded:** `rldata.js`, `rlnav.js`, `rlapp.js`, `rlbrief.js`, every generic Market Brief artifact/script/schedule, all registries/docs, package/source-lock files, Feature 001-007 source/tests/specs, unrelated tools, and framework-managed files.

**Dirty-work discipline:** capture path-scoped status and zero-context diffs before each allowed path. Existing user hunks remain byte-identical; no formatter or broad rewrite runs.

**Rollback/restore:** remove only Scope 01 new files and fixture entries. Browser storage rollback never deletes a user's personal keys automatically. A direct version-safety test proves incompatible newer records remain untouched, and the pre-scope repository selftest result remains the shared baseline.

### Historical Attribution And Coupling Contract

Scope 01 uses path-and-hunk attribution because commit `db06c29650ba351770297acefa658f51cbc4ff00` also contains repository bootstrap content. Commit-wide cleanliness cannot prove this scope boundary.

The historical partition is closed:

- Scope 01 attribution contains the 12 exact paths below.
- The declared excluded set contains 426 co-committed paths.
- The remaining non-attributable set contains 515 co-committed paths.
- The partition accounts for all 953 changed paths: $12 + 426 + 515 = 953$.

The 941 non-attributable paths are co-committed repository context. They cannot serve as Scope 01 implementation evidence. This scope does not claim that those paths were unchanged in the commit.

| Scope 01-attributable path | Historical status | Required attribution |
| --- | --- | --- |
| `portfolio-survival-allocation.config.json` | `A` | Mandatory policy contract |
| `rlportfolio.js` | `A` | Portfolio import and atomic storage runtime |
| `portfolio-survival-allocation-lab.html` | `A` | Unregistered setup and Portfolio Brief route |
| `tests/portfolio-foundation.unit.mjs` | `A` | Production-contract unit carrier |
| `tests/portfolio-privacy.functional.mjs` | `A` | Privacy and atomicity functional carrier |
| `tests/portfolio-survival-foundation.spec.mjs` | `A` | Real-page browser carrier |
| `tests/portfolio-survival.support.mjs` | `A` | Scope browser and storage support |
| `tests/fixtures/portfolio-survival-allocation/valid-portfolio.csv` | `A` | Valid import fixture |
| `tests/fixtures/portfolio-survival-allocation/invalid-secret-portfolio.csv` | `A` | Secret-bearing rejection fixture |
| `tests/fixtures/portfolio-survival-allocation/removable-invalid-portfolio.csv` | `A` | Row-removal fixture |
| `tests/fixtures/portfolio-survival-allocation/manual-alternative.json` | `A` | Manual-asset fixture |
| `tests/fixtures/portfolio-survival-allocation/provenance.json` | `A` | Fixture provenance |

Every added hunk in those paths must map to the attribution shown above. Any unmapped hunk blocks the boundary item. No path outside this ledger is attributable to Scope 01.

The coupling boundary distinguishes mutation from declared read-only use. `rlcontracts.js` is the sole shared production dependency and remains mutation-excluded. TP-01-07 protects its existing contract. Node built-ins, `playwright-runtime.mjs`, and Scope 01 support files are test-only dependencies.

Every other excluded surface must have zero import, script-load, fetch, filesystem-write, browser-storage-write, generated-artifact, or process edge from Scope 01. The test server's `/` to `index.html` branch is not a Scope 01 edge. The browser carrier opens the lab route directly.

The execution owner must run the following immutable-history checks. The resulting report evidence must use `Claim Source: interpreted` because hunk attribution requires review.

```bash
timeout 120 bash .github/bubbles/scripts/evidence-capture.sh \
  --label "Spec 008 Scope 01 historical commit inventory" -- \
  git diff-tree --no-commit-id --name-status -r db06c29650ba351770297acefa658f51cbc4ff00

timeout 30 git diff-tree --no-commit-id --name-status -r \
  db06c29650ba351770297acefa658f51cbc4ff00 -- \
  portfolio-survival-allocation.config.json \
  rlportfolio.js \
  portfolio-survival-allocation-lab.html \
  tests/portfolio-foundation.unit.mjs \
  tests/portfolio-privacy.functional.mjs \
  tests/portfolio-survival-foundation.spec.mjs \
  tests/portfolio-survival.support.mjs \
  tests/fixtures/portfolio-survival-allocation/valid-portfolio.csv \
  tests/fixtures/portfolio-survival-allocation/invalid-secret-portfolio.csv \
  tests/fixtures/portfolio-survival-allocation/removable-invalid-portfolio.csv \
  tests/fixtures/portfolio-survival-allocation/manual-alternative.json \
  tests/fixtures/portfolio-survival-allocation/provenance.json

timeout 120 bash .github/bubbles/scripts/evidence-capture.sh \
  --label "Spec 008 Scope 01 explicitly excluded historical paths" -- \
  git diff-tree --no-commit-id --name-only -r \
  db06c29650ba351770297acefa658f51cbc4ff00 -- \
  rldata.js rlnav.js rlapp.js rlbrief.js market-brief.html \
  ':(top,glob)market-brief.*.json' ':(top,glob)brief-history*.jsonl' \
  ':(top,glob)scripts/brief-*' tools.json index.html README.md \
  ':(top,glob)notes/**' package.json package-lock.json \
  ':(top,glob)rl*.js' ':(exclude,top)rlportfolio.js' \
  ':(top,glob)specs/001-*/**' ':(top,glob)specs/002-*/**' \
  ':(top,glob)specs/003-*/**' ':(top,glob)specs/004-*/**' \
  ':(top,glob)specs/005-*/**' ':(top,glob)specs/006-*/**' \
  ':(top,glob)specs/007-*/**' ':(top,glob).github/bubbles/**'

timeout 30 git grep -nE \
  '(^[[:space:]]*import[[:space:]]|require\(|<script[^>]+src=|fetch\()' \
  db06c29650ba351770297acefa658f51cbc4ff00 -- \
  rlportfolio.js portfolio-survival-allocation-lab.html \
  tests/portfolio-foundation.unit.mjs \
  tests/portfolio-privacy.functional.mjs \
  tests/portfolio-survival-foundation.spec.mjs \
  tests/portfolio-survival.support.mjs
```

The first capture must report 953 lines and SHA-256 `a7dbf196fa576cbc448401228c4efa2ff6c5b98ea29fd547f1125a6a69969fbf`. The second command must report exactly the 12 `A` entries in the ledger. The excluded capture must report 426 lines. Its immutable output hash is `703931fe90db2eefb7c1d0bb5ad673d641ba50d49dc905068369f5c994be0847`.

The import/load inventory must contain only the declared production and test dependencies above. Run the following no-match checks separately. Each command must print its explicit pass sentinel.

```bash
if timeout 30 git grep -nE \
  '(^|[^[:alnum:]_])(rldata\.js|rlnav\.js|rlapp\.js|rlbrief\.js|market-brief([^[:alnum:]_]|$)|brief-history|tools\.json|index\.html|package(-lock)?\.json|notes/|scripts/brief-)' \
  db06c29650ba351770297acefa658f51cbc4ff00 -- \
  portfolio-survival-allocation.config.json rlportfolio.js \
  portfolio-survival-allocation-lab.html
then
  printf 'SCOPE01_PRODUCTION_EXCLUDED_EDGE=FAIL\n'
  exit 1
else
  result=$?
  if [[ "$result" -ne 1 ]]; then exit "$result"; fi
  printf 'SCOPE01_PRODUCTION_EXCLUDED_EDGE=PASS\n'
fi

if timeout 30 git grep -nE \
  '(writeFile|appendFile|createWriteStream|renameSync|copyFile|unlink|rmSync|mkdirSync|spawnSync|execFile|execSync|child_process)' \
  db06c29650ba351770297acefa658f51cbc4ff00 -- \
  portfolio-survival-allocation.config.json rlportfolio.js \
  portfolio-survival-allocation-lab.html \
  tests/portfolio-foundation.unit.mjs \
  tests/portfolio-privacy.functional.mjs \
  tests/portfolio-survival-foundation.spec.mjs \
  tests/portfolio-survival.support.mjs
then
  printf 'SCOPE01_FILESYSTEM_WRITE_EDGE=FAIL\n'
  exit 1
else
  result=$?
  if [[ "$result" -ne 1 ]]; then exit "$result"; fi
  printf 'SCOPE01_FILESYSTEM_WRITE_EDGE=PASS\n'
fi
```

Run TP-01-01, TP-01-02, TP-01-06, and TP-01-07 after the history checks. Their evidence must prove closed browser-storage namespaces, zero excluded-surface mutation, and the declared shared read contract.

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
| TP-01-07 | Shared-infrastructure canary | functional | SCN-008-001, SCN-008-002 | `scripts/selftest.mjs` and `tests/portfolio-foundation.unit.mjs` | Canary: run the repository selftest and the direct `RLCONTRACTS` namespace import ahead of the TP-01-06 broad rerun, so the shared `rlcontracts.js` canonicalization/hash exports and the closed `rlPortfolio*`/`rlReturnContextV1` storage namespaces are proven unchanged by this scope before any broad suite result is read | `node scripts/selftest.mjs` then `node --test tests/portfolio-foundation.unit.mjs` | No | `report.md#current-session-re-verification` |

Before any browser row, run `node scripts/validate-node-source-lock.mjs` and `npx --no-install playwright --version`; the latter must print exactly `Version 1.61.1`. These environment/source gates do not replace Test Plan rows.

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Re-verified 2026-08-29 (session-bound).** The 17 passing rows include the per-scenario regressions TP-01-03 (`Regression: SCN-008-001 valid local portfolio import creates one current revision`) and TP-01-04 (`Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted`), plus the SCN-008-054 consumer-surface regression which printed `[SCN-008-054] consumerSurface rowsBefore=2 rowsAfter=1` — a value assertion, not a smoke check.
  - **Evidence:** [report.md#tp-01-03](report.md#tp-01-03), [report.md#tp-01-04](report.md#tp-01-04), and the TP-01-06 run recorded below.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound), not inherited from the prior window:**

    ```text
    $ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs \
        --config=playwright.config.mjs --project=system-chrome --reporter=line

    [17/17] [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:2179:1 ›
      Regression: SCN-008-054 the audited lifecycle defect stays repaired at the consumer surface
    [SCN-008-054] consumerSurface rowsBefore=2 rowsAfter=1

      17 passed (1.1m)
    TP0106_EXIT=0
    ```

  - **Evidence:** [report.md#tp-01-06](report.md#tp-01-06).
- [x] Scope 01 attribution covers all 12 implementation-bearing files without attributing unrelated root-commit paths or claiming isolated commit history.
  - **Allowed-path accounting:** Account for all 12 unique files in [Code Diff Evidence](report.md#code-diff-evidence). Confirm each file is allowed by [Change Boundary And Rollback](#change-boundary-and-rollback). Map every added hunk to its declared Scope 01 purpose. Missing, duplicate, disallowed, or unmapped entries fail this item.
  - **Non-vacuous coupling inventory:** Produce an inventory that names all 12 files. Trace their imports, script loads, fetches, runtime writes, generated-artifact writes, browser-storage writes, and public consumers. No edge may reach an excluded surface. Permit only read-only contracts documented in [Historical Attribution And Coupling Contract](#historical-attribution-and-coupling-contract). Empty output, an unmatched pathspec, or a partial 12-file result fails this item.
  - **Root-commit partition:** Commit `db06c29650ba351770297acefa658f51cbc4ff00` changes 953 paths. Attribute only the 12 ledger files to Scope 01. The other 941 paths are unrelated repository context. They are not Scope 01-attributable and cannot serve as Scope 01 evidence.
  - **Claim limit:** Do not claim isolated commit history for Scope 01. Evidence may establish only path, hunk, dependency, runtime-write, and public-consumer attribution.
  - **Required execution before `[x]`:** `bubbles.implement` or `bubbles.test` must execute these existing commands:
    - `node --test tests/portfolio-foundation.unit.mjs`
    - `node --test tests/portfolio-privacy.functional.mjs`
    - `node scripts/selftest.mjs`
  - Run the immutable-history and coupling inventory commands exactly as written in [Historical Attribution And Coupling Contract](#historical-attribution-and-coupling-contract). Record current-session commands, exit codes, and non-empty outputs in [report.md](report.md).
  > **Resolution** (supersedes the prior Uncertainty Declaration)
  > [Independent test re-verification](report.md#scope-01-attribution-contract---independent-test-re-verification-binding-revision-36) and [implement re-execution](report.md#scope-01-historical-attribution-and-coupling-contract---implement-re-execution-2026-08-30) each establish the closed $12 + 426 + 515 = 953$ partition, exact 25-edge inventory, both negative sentinels, coherent 61/24/17/3435 results, and the no-isolated-history claim limit. The supplied current-session `/bubbles.audit` result independently returned `completed_diagnostic` / `PASS` with zero unresolved findings and accepted the one-to-one purpose ledger for all 12 whole-file additions.
- [x] Rollback or restore path for shared infrastructure changes is documented and verified
  - **Documented at:** the `Rollback/restore` paragraph of [Change Boundary And Rollback](#change-boundary-and-rollback) — remove only Scope 01 new files and fixture entries, never a user personal storage key.
  - **Verifying rows:** TP-01-01 for the incompatible-newer-record safety path and TP-01-05 for last-known-good retention across durable, session-only, and memory-only modes.
  - **Re-verified 2026-08-29:** both rows are inside the 17-passing TP-01-06 run above, so the documented path is backed by executing rows rather than by prose alone.

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

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

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
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns
  - **Re-verified 2026-08-29, and run BEFORE the TP-01-06 broad suite rather than after — the ordering is the whole point of this row, since a canary read after a broad pass proves nothing about what the broad pass was standing on:**

    ```text
    $ node scripts/selftest.mjs
    Research-Lab self-test: 3433 passed, 0 failed
    SELFTEST_EXIT=0

    $ node --test tests/portfolio-foundation.unit.mjs
    # pass 61
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 1692.62294
    UNIT_EXIT=0
    ```

  - Confirms the shared `rlcontracts.js` canonicalization/hash exports and the closed `rlPortfolio*` / `rlReturnContextV1` storage namespaces were unchanged before the broad result was read.
  - **Verifying row:** TP-01-07.
  - **Resolution condition:** the TP-01-07 command pair is recorded as having run BEFORE the TP-01-06 cumulative browser row in the same session, and its output is read against the three canaries named in [Shared Infrastructure Impact Sweep](#shared-infrastructure-impact-sweep) — the unchanged shared `rlcontracts.js` namespace, the closed `rlPortfolio*`/`rlReturnContextV1` key inventory, and the zero-interception request ledger. A canary recorded only after the broad rerun does not resolve this item, because ordering is the whole content of the claim.

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

- [x] Focused RED/GREEN records, fixture provenance, namespace and hostile-input scans, no-interception/service-worker/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16.
  - **Phase:** implement
  - **Command:** the twelve named checks, each re-executed this session; scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope` run with `execution.currentScope` = 1
  - **Exit Code:** 0 for eleven checks; traceability exits 1 on foreign-owned failures with 0 naming this scope's own files
  - **Claim Source:** executed
  - **Evidence:** [Build Quality Gate Closeout - Current-Session Re-Verification](report.md#build-quality-gate-closeout---current-session-re-verification), which records each check's raw output and the mechanical failure classification.
  > **Resolution** (supersedes the prior Uncertainty Declaration; all five findings it named are discharged)
  > **Every named check re-executed this session.** Eleven of the twelve exit 0: repository selftest (1220 passed, 0 failed), source lock (`OK adversarial=16 unexpectedAcceptances=0`), runner version (exactly `Version 1.61.1`), TP-01-01 (22/22), TP-01-02 (7/7), TP-01-06 (6/6), implementation reality G028/G029 (0 violations), G094, artifact lint, `git diff --check` over this scope's paths, and plan sync (`new=0 stale=0`). Editor diagnostics are clean across all nine Scope 01 files and all five spec-008 planning artifacts. The twelfth, scope-local traceability, is judged by this item's own written standard — zero failure naming this scope's own files — not by its process exit code.
  > **`F008-IMPL-003` - G094 exit 1: RESOLVED.** The prior record attributed G094 to `inter-spec-dependency-guard.sh`, which in fact owns G089. G094 (`capability_foundation_gate`) is owned by `.github/bubbles/scripts/capability-foundation-guard.sh`, and that guard was run directly: `PASS Gate G094 - capability foundation requirements satisfied`, exit 0. It reports `scopes include foundation:true and overlay Depends On foundation ordering` — the exact condition the prior declaration recorded as blocking and as requiring a foreign-scope edit. No foreign scope file was edited by this agent; the ordering was already satisfied. `G089` is separately PASS at exit 0.
  > **`F008-IMPL-004` - scope-local traceability: REQUIREMENT MET.** The guard was run with `execution.currentScope` = 1 so Scope 01 is the active scope, and it reports `FAILED (32 failures, 0 warnings)`. Mechanical classification of all 32, not a reading of the summary line: 0 name `scopes/01-private-portfolio-import-and-atomic-store`, 0 name any Scope 01 test or source file (`portfolio-survival-foundation.spec.mjs`, `portfolio-foundation.unit.mjs`, `portfolio-privacy.functional.mjs`, `portfolio-survival.support.mjs`, `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`); 28 are `scenario-manifest.json` references to later-scope suites that do not exist yet, 3 name `scopes/02-mandate-and-cash-need-authority`, and 1 is the feature-level G068 aggregate over that Scope 02 scenario. 28 + 3 + 1 = 32, so the classification is exhaustive. Every Scope 01 line in the run is a pass: both scenarios map to a Test Plan row, both map to a concrete test file, and both have report evidence. The residual 32 are foreign-owned and are enforced once at the [Feature Completion Gate](../_index.md#feature-completion-gate) in Scope 16, per this item's own text.
  > **`F008-IMPL-006` - planning-owned MD060 style: RESOLVED.** A repository-wide search finds zero `MD060` occurrences outside this scope file's own historical record, and editor diagnostics return no errors for `spec.md`, `design.md`, `scopes/_index.md`, `uservalidation.md`, `scenario-manifest.json`, this `scope.md`, and this scope's `report.md`. The diagnostic is gone; no planning-owned edit was needed from this agent.
  > **`F008-IMPL-007` - artifact lint state coherence: RESOLVED.** Artifact lint exits 0 and reports `✅ Top-level status matches certification.status`. Both read `in_progress`. This agent wrote no `certification.*` field; the coherence was restored by its owner. This also clears the `--current-scope` exit-2 refusal the prior declaration recorded, which is why the guard now evaluates scopes instead of aborting.
  > **`F008-IMPL-008` - G068 names Scope 01: RESOLVED.** Fresh G068 output maps both Scope 01 scenarios to DoD items: `A user imports a valid portfolio without credentials` and `A malformed or secret-bearing import cannot partially replace the portfolio`. The prior record of two Scope 01 G068 failures no longer reproduces. No DoD item text was reworded to achieve this — the Gherkin and the DoD text are byte-identical to the prior revision, and only checkbox state and this evidence block changed, which is the precise condition Gate G068 exists to detect.
  > **Interception scan reads two hits; both are absence assertions.** `serviceWorker` matches at `tests/portfolio-survival-foundation.spec.mjs:355` and `:544` are `expect(...!navigator.serviceWorker.controller && registrations.length === 0).toBe(true)` — they assert no worker is registered. A scan restricted to true interception primitives (`page.route(`, `context.route(`, `routeFromHAR`, `msw`, `nock`, `cy.intercept`, `setupServer`, `wiremock`) returns zero matches across all four Scope 01 test files.
  > **Closure confirmed.** `F008-IMPL-009` and `F008-IMPL-010` were resolved rather than left open. `-009` no longer reproduces: the TP-01-03 diagnostics now separate the earlier `firstImport.*` snapshot from the unprefixed final committed state. `-010` was a real silent-pass risk — a disabled `#confirmImport` proves nothing about *why* it is disabled, so a mode where the preview never rendered would still have passed — and TP-01-05 now asserts the rendered rejection per persistence mode before checking the button. `F008-IMPL-001`, `-002`, and `-005` were already resolved. `F008-IMPL-011` is the sole remaining open finding and is upstream-only: it needs a patch to `.github/bubbles/`, framework-managed surface this repo forbids patching locally.
  > **Not judged on this scope's files:** `git diff --check` reports trailing whitespace in `specs/_bugs/BUG-002-market-brief-session-date-drift/`, which a concurrent session owns. Restricted to this scope's paths the check exits 0. Those files were neither edited nor staged here.
