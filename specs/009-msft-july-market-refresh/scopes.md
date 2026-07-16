# Scopes: 009 MSFT July Market Refresh

Planning sources: [spec.md](spec.md) and [design.md](design.md). Execution evidence belongs in [report.md](report.md); human acceptance belongs in [uservalidation.md](uservalidation.md).

## Execution Outline

### Phase Order

1. **Scope 1 - Cache-owned market truth:** add scenario-first red assertions, then implement production validators, daily technical derivation, immutable accepted state, and cache-first first paint.
2. **Scope 2 - Isolated degraded states:** extend the production reducers and browser state controls for quote-only, bars-only, stale, malformed, and resource-isolated outcomes.
3. **Scope 3 - Market/model interaction integrity:** preserve user inputs and selected P/E through quote acceptance, failed or out-of-order refresh outcomes, and spot-dependent repricing.
4. **Scope 4 - One-state user and export surfaces:** deliver Simple/Power parity, central-policy refresh behavior, responsive/a11y/canvas proof, and reconstructable CSV from one accepted state.
5. **Scope 5 - Static publication and direct consumers:** publish the committed-Base static-model read, reconcile the notes and exact MSFT registry records, and prove dirty-work containment with the full governed validation set.

Scopes execute strictly in numeric order. A scope cannot begin until every dependency is Done with its own evidence. The ordering gives each increment a production-visible outcome and keeps tests close to the behavior they protect.

### New Types And Signatures

- `MsftAcceptedStateV1` with immutable `fundamentalModel`, quote-owned, bar-owned, technical, scenario, valuation, market-status, evaluation, and display domains.
- `msftValidateQuoteEnvelope(raw, evaluationTime) -> QuoteCandidate | Rejection`.
- `msftValidateBarsEnvelope(raw, evaluationTime) -> BarsCandidate | Rejection`.
- `msftDeriveDailyTechnicals(rows) -> TechnicalRead`.
- `msftShouldAcceptQuote(current, candidate) -> boolean` and `msftShouldAcceptBars(current, candidate) -> boolean`.
- `msftReduceResourceOutcome(state, outcome) -> MsftAcceptedStateV1`.
- `msftBuildValuationRead(model, quote, probabilities, impliedMovePct) -> ValuationRead`.
- `msftBuildAcceptedState(domains, evaluationTime) -> MsftAcceptedStateV1`.
- `window.MsftJulyModel` public production controller for boot, accepted-state replacement, refresh, mode, export, publication, and read-only diagnostics.
- `buildMsftCsvRows(state, exportedAt) -> Array<[field, value]>` using `msft-july-market-refresh/v1`.
- `buildMsftStaticToolRead(baseModel, marketState) -> rl-tool-read/v1` with `msft-static-model-read/v1` metrics.
- No route, tool id, shared runtime API, provider abstraction, data schema, cache generator, or build command is introduced.

### Validation Checkpoints

- **Before any product source edit:** test-owned Feature 009 functional/browser assertions run and fail on missing production behavior; the failure is recorded in `report.md` as red evidence.
- **After Scope 1:** actual committed quote/bar caches hydrate through production validators; technical values are derived from cache rows; model date remains 2026-07-06.
- **After Scope 2:** public production reducers prove partial, stale, malformed, insufficient, and isolated failure behavior without request interception.
- **After Scope 3:** input snapshots and accepted source clocks prove quote changes cannot mutate model/user/bar state and older outcomes cannot win.
- **After Scope 4:** four viewport checks, keyboard/a11y checks, canvas pixels, CSV, central credential regression, and Simple/Power parity pass against the real page.
- **After Scope 5:** static-model publication, notes/registry parity, source-lock, full selftest, focused Playwright, credential canary, inline script/ID parsing, artifact lint, traceability, and containment checks complete before delivery validation.

## Overview

This plan implements the design as five small vertical outcomes. It deliberately keeps the existing 2026-07-06 fundamental model and all Q4/FY27 assumptions unchanged. Moving-market acceptance is source-relative: accepted quote value, provider time, and retrieval time must equal the parsed current `data/options/MSFT.json::{spot,asof,fetched}` fields, while accepted daily-bar cutoff, retrieval time, and row count must equal the parsed current `data/bars/MSFT.json::{asof,fetched,rows.length}` fields. Technical expected values must be derived from the parsed current `data/bars/MSFT.json::rows`. Earlier planning observations of quote `397.065` and a `2026-07-13` bar cutoff are retained only as historical planning provenance; they are not current acceptance constraints and must not block a valid cache refresh.

There is no new capability foundation. `RLDATA`, `RLAPP`, the existing page, the committed cache envelopes, and the `static-model` profile remain the owning contracts.

## Ownership Handoff

| Ownership | Authorized work | Forbidden inline assignment |
| --- | --- | --- |
| `bubbles.implement` | Product behavior in `msft-july-print-model.html`; surgical MSFT records in `tools.json` and `index.html` when their scope is ready | Must not author test files, notes, planning artifacts, or certification state |
| `bubbles.test` | One marker-bounded Feature 009 group in `scripts/selftest.mjs` and `tests/msft-july-market-refresh.spec.mjs`; red/green and browser evidence | Must not change production behavior, notes, registry metadata, or planning artifacts |
| `bubbles.docs` | `notes/msft-july-print-model.md` after behavior and publication contracts are green | Must not change page source, registries, tests, or planning artifacts |
| `bubbles.validate` / `bubbles.audit` | Governed validation, evidence interpretation, and any authorized terminal status/certification transition | No product, test, documentation, or plan repair inline; findings route to the owning specialist |
| `bubbles.plan` | This file, `scenario-manifest.json`, `test-plan.json`, initial `report.md`, and `uservalidation.md` | No source, test, notes, registry, or certification implementation |

The orchestrator dispatches each foreign-owned artifact change to its owner. A scope may coordinate those owners, but no specialist writes another owner's files.

## Global Change Boundary

### Allowed Product Surfaces

- `msft-july-print-model.html`, additive around the centralized credential changes already present.
- `notes/msft-july-print-model.md`.
- Only the existing `msft-july-print-model` records in `tools.json` and `index.html`.
- One additive group in `scripts/selftest.mjs` bounded by `FEATURE-009-MSFT-JULY-MARKET-REFRESH-BEGIN` and `FEATURE-009-MSFT-JULY-MARKET-REFRESH-END` markers.
- New `tests/msft-july-market-refresh.spec.mjs`.

### Excluded Surfaces

- Shared runtime and credential owners: `rldata.js`, `rlapp.js`, `rlchart.js`, `rlticker.js`, and `rlnav.js`.
- Data and indexes under `data/`, including the MSFT option and bar cache inputs.
- Fetch and publication pipelines, including `scripts/fetch-options.mjs`, `scripts/fetch-bars.mjs`, `scripts/brief-refresh.mjs`, `rlbrief.js`, and `market-brief.*`.
- Every non-MSFT registry record, every unrelated `scripts/selftest.mjs` group, every unrelated test, and all other tools/notes/specs.
- Fundamental, consensus, Q4-actual, guidance, target-price, cost-cycle, and model-default facts. The model date remains `2026-07-06`; the scheduled Q4 print remains `2026-07-29` and is not delivered as an actual by Feature 009.
- Framework-managed `.github/bubbles/**`, `.github/agents/bubbles*`, `.github/skills/bubbles-*`, and `.github/instructions/bubbles-*`.

### Dirty-Work Containment Protocol

1. Before each owner edits an allowed dirty file, record `git status --short --` and the complete path-scoped `git diff --` for all five existing allowed files in `report.md` through governed evidence capture.
2. Review the initial diff and identify the centralized credential removal, provider settings, Bond Regime registry records, and Features 004-007/selftest groups as protected pre-existing hunks.
3. Make only additive or record-local Feature 009 edits. Never replace a whole dirty file, reorder registries, or reformat surrounding code.
4. After each scope, rerun the same status and path-scoped diff commands and inspect excluded paths with `git status --short --`.
5. At final containment, prove no credential input/storage/migration/token URL returned, no Bond Regime registry byte was changed by Feature 009, no unrelated selftest group changed, and no shared/data/brief path changed.
6. Rollback removes only Feature 009 hunks and its new browser file. It preserves all protected pre-existing work and leaves the presentation as `Static model - market context unavailable`, never a resurrected hard-coded current spot.

## Scope Summary

| # | Scope | Depends On | Scope-Kind | Surfaces | Scenario IDs | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Cache-owned market truth | None | vertical-feature | Page, functional tests, browser tests | SCN-009-001, SCN-009-002, SCN-009-005 | In Progress |
| 2 | Isolated degraded states | Scope 1 | vertical-feature | Page reducers, functional tests, browser tests | SCN-009-006, SCN-009-007, SCN-009-008 | Not Started |
| 3 | Market/model interaction integrity | Scope 2 | vertical-feature | Page state/valuation, functional tests, browser tests | SCN-009-003, SCN-009-004, SCN-009-010 | Not Started |
| 4 | One-state user and export surfaces | Scope 3 | vertical-feature | Page UI/CSV/central refresh, browser tests | SCN-009-009, SCN-009-011, SCN-009-012 | Not Started |
| 5 | Static publication and direct consumers | Scope 4 | vertical-feature | Page tool read, notes, exact registry records, tests | SCN-009-013, SCN-009-014 | Not Started |

## Scope 1: Cache-Owned Market Truth

Status: [~] In progress

Depends On: None

Scope-Kind: vertical-feature

### Outcome

The real page renders the unchanged model immediately, reads both actual same-origin MSFT envelopes without credentials, accepts each through production validators, and derives daily technicals only from daily rows with all source clocks distinct.

### Change Boundary

Allowed in this scope: the Feature 009 marker group in `scripts/selftest.mjs`, the new focused browser file, and validator/derivation/accepted-state/boot hunks in `msft-july-print-model.html`.

Excluded in this scope: notes, both registries, shared runtime files, data files, fetch/brief scripts, display redesign, CSV/tool-read publication, and every credential behavior beyond preserving the existing centralized removals.

### Gherkin Scenarios

#### SCN-009-001: Cache-First First View

```gherkin
Scenario: The production page opens from valid same-origin MSFT caches
  Given the static fundamental model is identified as of 2026-07-06
  And the committed MSFT quote and daily-bar cache envelopes are valid
  When the production page boots without a provider credential or Fetch action
  Then the static model paints before both cache reads settle
  And each market resource is independently accepted through production validators
  And no provider request occurs
  And the model cutoff remains 2026-07-06
```

#### SCN-009-002: Separate Market And Model Clocks

```gherkin
Scenario: The delayed quote and daily bars have different observation clocks
  Given the accepted quote carries its provider token and retrieval instant
  And the accepted daily bars carry their own cutoff and retrieval instant
  When the accepted state is assembled
  Then model as-of, quote provider as-of, quote retrieval, bar cutoff, bar retrieval, and evaluation time occupy separate fields
  And no page-wide live or ambiguous data_as_of value represents them
  And the timezone-less provider token is preserved verbatim
```

#### SCN-009-005: Daily Technicals Use Daily Rows Only

```gherkin
Scenario: A newer delayed quote differs from the latest daily close
  Given the committed daily cache has enough valid ordered rows
  And the accepted delayed quote has a different value
  When production daily technical derivation runs
  Then close, SMA20, SMA50, SMA200, High252, stack, and signed distances derive only from the daily rows
  And no synthetic row is added from the delayed quote
  And the technical cutoff remains the last eligible daily-bar date
```

### Ordered Implementation Plan

1. `bubbles.test` adds production-calling functional assertions and the focused browser first-paint scenario before any Feature 009 product-source change.
2. Run the focused Playwright file and `node scripts/selftest.mjs`; record the deterministic failures that show the current page lacks the required state/cache behavior. Do not weaken unrelated tests.
3. `bubbles.implement` replaces the hard-coded current spot with nullable quote state and adds the named top-level validators and daily-only derivation functions.
4. Add the immutable accepted-state builder and controller boot sequence: static null-safe paint, then exactly two parallel `no-store` same-origin reads with 9-second aborts.
5. Accept resources independently, retain exact quote/bar clocks, derive technicals from unrounded rows, and expose a read-only production diagnostic state for tests.
6. Integrate accepted quote/bars with existing RLDATA/RLAPP write/report APIs only after validation; shared-write failure cannot invalidate page truth.
7. Rerun the identical red commands to green, then perform the scope containment check before Scope 2 becomes eligible.

### Test Plan

| Test Plan ID | Type | Scenario IDs | Owner | File | Behavior And Assertions | Exact Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-009-S1-01 | functional | SCN-009-001, SCN-009-002, SCN-009-005 | `bubbles.test` | `scripts/selftest.mjs` | Marker-bounded assertions extract and call production validators/derivers. They compare accepted quote fields with parsed current `data/options/MSFT.json::{spot,asof,fetched}`, compare accepted bar cutoff/retrieval/row count with parsed current `data/bars/MSFT.json::{asof,fetched,rows.length}`, independently derive technical expected values from `data/bars/MSFT.json::rows`, and never copy production algorithms or embed moving-market canaries as expected constants. The row explicitly proves the cache-first first view, separate market/model clocks, and the scenario `A newer delayed quote differs from the latest daily close`, with daily technicals using daily rows only. | `node scripts/selftest.mjs` | No |
| TP-009-S1-02 | e2e-ui regression | SCN-009-001, SCN-009-002, SCN-009-005 | `bubbles.test` | `tests/msft-july-market-refresh.spec.mjs` | `Regression: SCN-009-001/002/005 cache-first market truth` opens the real page through the committed static server/config, observes static-first then cache acceptance, compares quote fields with parsed current `data/options/MSFT.json`, compares bar cutoff/row count and derived technical state with parsed current `data/bars/MSFT.json` rows, checks separate clocks, and records zero provider requests without request interception. | `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"` | Yes |

### Definition of Done

#### Tier 1: Behavioral Completion

- [x] SCN-009-001, SCN-009-002, and SCN-009-005 are implemented through the real page and one accepted-state model; the model cutoff is still 2026-07-06.
  > **Phase:** test
  > **Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence:** [Current-Session Scope 1 Revalidation After Cache-Relative Plan Repair](report.md#current-session-scope-1-revalidation-after-cache-relative-plan-repair)
  >
  > ```text
  >   ✓  1 …:46:1 › Regression: SCN-009-001/002/005 cache-first market truth (929ms)
  > [SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
  > [SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
  > [SCN-009-002] modelAsOf=2026-07-06
  > [SCN-009-002] quoteProviderAsOf=2026-07-15T15:59:59 quoteRetrievedAt=2026-07-15T21:00:20.694Z
  > [SCN-009-002] barsCutoff=2026-07-15 barsRetrievedAt=2026-07-15T21:01:38.963Z
  > [SCN-009-002] uniqueClocks=6 data_as_of=absent
  > [SCN-009-005] dailyRows=501 quote=395.4 dailyClose=395.6300048828125
  > [SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly
  >   1 passed (3.7s)
  > ```
  >
- [x] The accepted quote value, provider time, and retrieval time equal the parsed current `data/options/MSFT.json::{spot,asof,fetched}` fields; the accepted daily-bar cutoff, retrieval time, and row count equal the parsed current `data/bars/MSFT.json::{asof,fetched,rows.length}` fields; and every technical expected value derives from the parsed current `data/bars/MSFT.json::rows` rather than a frozen market literal.
  > **Phase:** test
  > **Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence:** [Current-Session Scope 1 Revalidation After Cache-Relative Plan Repair](report.md#current-session-scope-1-revalidation-after-cache-relative-plan-repair)
  > **Interpretation:** The test parsed both current cache files, compared the accepted production-controller fields with those parsed envelopes, and independently derived every technical expected value from the parsed daily rows. The numeric observations below came from the current cache contents and are not embedded expected constants.
  >
  > ```text
  >   ✓  1 …:46:1 › Regression: SCN-009-001/002/005 cache-first market truth (929ms)
  > [SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
  > [SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
  > [SCN-009-001] quoteReportKeys=label,providerAsOf,retrievedAt,sharedWrite,sourceId
  > [SCN-009-001] barsReportKeys=cutoff,label,retrievedAt,rowCount,sharedWrite,sourceId
  > [SCN-009-002] modelAsOf=2026-07-06
  > [SCN-009-002] quoteProviderAsOf=2026-07-15T15:59:59 quoteRetrievedAt=2026-07-15T21:00:20.694Z
  > [SCN-009-002] barsCutoff=2026-07-15 barsRetrievedAt=2026-07-15T21:01:38.963Z
  > [SCN-009-002] uniqueClocks=6 data_as_of=absent
  > [SCN-009-005] dailyRows=501 quote=395.4 dailyClose=395.6300048828125
  > [SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly
  >   1 passed (3.7s)
  > ```
  >
- [x] Quote acceptance changes quote-owned fields only; technical calculations use accepted daily rows only and expose unsupported metrics as unavailable.
  > **Phase:** test
  > **Command:** `node scripts/selftest.mjs`
  > **Exit Code:** 1
  > **Claim Source:** interpreted
  > **Interpretation:** The named Feature 009 assertions directly pass the full behavioral conjunction. The command's one failure is the separately accounted Market Brief date mismatch, so this behavior item is supported while TP-009-S1-01 remains unchecked.
  > **Evidence:** [Current-Session Scope 1 Revalidation After Cache-Relative Plan Repair](report.md#current-session-scope-1-revalidation-after-cache-relative-plan-repair)
  >
  > ```text
  >   ✓ Feature 009 daily close and SMA20/SMA50/SMA200 equal independent test math over actual daily rows
  >   ✓ Feature 009 High252 stack and signed distances equal independent test math over actual daily rows
  >   ✓ Feature 009 delayed quote differs from and never contaminates the last daily close
  >   ✓ Feature 009 short daily history exposes every unsupported technical as unavailable with a closed reason
  >   ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of
  >   ✓ Feature 009 accepted state preserves the model cutoff and daily-only technical ownership
  >   ✓ Feature 009 accepted state is deeply immutable across market truth branches
  >   ✓ Feature 009 production-validated quote replacement changes quote-owned fields only
  > ================================================
  > Research-Lab self-test: 496 passed, 1 failed
  > ================================================
  > ```

#### Tier 2: Test Plan Parity

- [ ] TP-009-S1-01 passes after its pre-source red run, with production-function and actual-cache evidence recorded in `report.md`.
  > **Uncertainty Declaration**
  > **What was attempted:** `node scripts/selftest.mjs` was executed unchanged from the repository root in the current test invocation.
  > **What was observed:** All twelve Feature 009 Scope 1 assertions passed against extracted production functions and parsed current caches; the exact command exited 1 with `496 passed, 1 failed` because `nextSession.sessionDate` did not match `snapshot.nextSessionDate` in the separate Market Brief group.
  > **Why this is uncertain:** The Test Plan item requires the command to pass, not merely its Feature 009 subgroup.
  > **What would resolve this:** `bubbles.implement` completes `specs/_bugs/BUG-002-market-brief-session-date-drift`, then `bubbles.test` reruns this unchanged exact command and records exit 0.
  > **Evidence:** [TP-009-S1-01 Exact Functional Command](report.md#tp-009-s1-01-exact-functional-command)
- [x] TP-009-S1-02 passes after its pre-source red run, with real-page/no-interception evidence recorded in `report.md`.
  > **Phase:** test
  > **Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"`
  > **Exit Code:** 0
  > **Claim Source:** executed
  > **Evidence:** [TP-009-S1-02 Exact Focused Browser Command](report.md#tp-009-s1-02-exact-focused-browser-command)
  >
  > ```text
  > Running 1 test using 1 worker
  >
  >   ✓  1 …:46:1 › Regression: SCN-009-001/002/005 cache-first market truth (929ms)
  > [SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
  > [SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
  > [SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
  > [SCN-009-002] modelAsOf=2026-07-06
  > [SCN-009-002] uniqueClocks=6 data_as_of=absent
  > [SCN-009-005] dailyRows=501 quote=395.4 dailyClose=395.6300048828125
  > [SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly
  >
  >   1 passed (3.7s)
  > ```

#### Tier 3: Quality And Boundary

- [x] First paint is null-safe, no provider call occurs on boot, expected resource failures use closed reason codes, and accepted shared writes/reporting contain no raw option chain or credential.
  > **Phase:** test
  > **Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"`
  > **Exit Code:** 0
  > **Claim Source:** interpreted
  > **Interpretation:** The browser run directly executes null-safe first paint, zero provider requests, forced shared write/report exceptions, and exact sanitized report-key assertions. The linked Feature 009 functional evidence directly passes every closed validator failure class; its command remains nonzero only for the separately accounted Market Brief baseline. The linked source audit independently reports zero credential resurrection findings.
  > **Evidence:** [Current-session browser, functional, and integrity evidence](report.md#current-session-scope-1-revalidation-after-cache-relative-plan-repair)
  >
  > ```text
  > [SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
  > [SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
  > [SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
  > [SCN-009-001] quoteReportKeys=label,providerAsOf,retrievedAt,sharedWrite,sourceId
  > [SCN-009-001] barsReportKeys=cutoff,label,retrievedAt,rowCount,sharedWrite,sourceId
  > [SCN-009-002] modelAsOf=2026-07-06
  > [SCN-009-002] quoteProviderAsOf=2026-07-15T15:59:59 quoteRetrievedAt=2026-07-15T21:00:20.694Z
  > [SCN-009-002] barsCutoff=2026-07-15 barsRetrievedAt=2026-07-15T21:01:38.963Z
  > [SCN-009-002] uniqueClocks=6 data_as_of=absent
  > [SCN-009-005] dailyRows=501 quote=395.4 dailyClose=395.6300048828125
  > [SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly
  >   1 passed (3.7s)
  > ```
  >
- [ ] Pre/post path-scoped diff evidence proves only this scope's allowed Feature 009 hunks changed and protected credential/shared/registry/selftest work remains intact.
  > **Uncertainty Declaration**
  > **What was attempted:** Before evidence edits, the current full dirty-file list, focused diff statistics, complete production-page diff, and both current test files were inspected; post-edit validation was limited to Scope 1 evidence surfaces.
  > **What was observed:** The repository was already broadly dirty, `msft-july-print-model.html` and `scripts/selftest.mjs` already contained large mixed diffs, and the Feature 009 spec/test paths were inherited as untracked content. This invocation edited only `report.md` and Scope 1 execution evidence in `scopes.md`; it did not edit production, tests, cache data, notes, registries, shared runtime, framework files, or certification state.
  > **Why this is uncertain:** No parent-provided pre-session byte manifest identifies every inherited Feature 009 byte inside the mixed dirty files, so cross-agent containment cannot be certified from Git state alone.
  > **What would resolve this:** The active top-level `bubbles.goal` runner reconciles its pre-session byte manifest, or routes the same reconciliation to `bubbles.audit`, and records the containment verdict.
  > **Evidence:** [Current-Session Scope 1 DoD Assessment](report.md#current-session-scope-1-dod-assessment)
- [x] Scope status remains not started or in progress until every item above has command-backed evidence; no source completion or certification claim is inferred from planning.
  > **Phase:** test
  > **Command:** `node -e 'const fs=require("node:fs"),text=fs.readFileSync("specs/009-msft-july-market-refresh/scopes.md","utf8"),state=JSON.parse(fs.readFileSync("specs/009-msft-july-market-refresh/state.json","utf8")),scope=text.slice(text.indexOf("## Scope 1:"),text.indexOf("## Scope 2:")),unchecked=(scope.match(/^- \[ \]/gm)||[]).length,ok=/Status: \[~\] In progress/.test(scope)&&unchecked===2&&state.status!=="done"&&state.certification?.status!=="done"&&!(state.certification?.completedScopes||[]).includes("01-cache-owned-market-truth");console.log("FEATURE009_FINAL_STATE_BEGIN");console.log("SCOPE_STATUS=in_progress");console.log("UNCHECKED_DOD_ITEMS="+unchecked);console.log("STATE_STATUS="+state.status);console.log("CERTIFICATION_STATUS="+(state.certification?.status||"unset"));console.log("CERTIFIED_SCOPE1=no");console.log("TOP_LEVEL_DONE=no");console.log("SCOPE_DONE=no");console.log("CERTIFICATION_MUTATED=no");console.log("RESULT="+(ok?"PASS":"FAIL"));console.log("FEATURE009_FINAL_STATE_END");if(!ok)process.exit(1);'`
  > **Exit Code:** 0
  > **Claim Source:** executed
  >
  > ```text
  > FEATURE009_FINAL_STATE_BEGIN
  > SCOPE_STATUS=in_progress
  > UNCHECKED_DOD_ITEMS=2
  > STATE_STATUS=not_started
  > CERTIFICATION_STATUS=not_started
  > CERTIFIED_SCOPE1=no
  > TOP_LEVEL_DONE=no
  > SCOPE_DONE=no
  > CERTIFICATION_MUTATED=no
  > RESULT=PASS
  > FEATURE009_FINAL_STATE_END
  > ```

## Scope 2: Isolated Degraded States

Status: [ ] Not started | [~] In progress | [x] Done | [!] Blocked

Depends On: Scope 1

Scope-Kind: vertical-feature

### Outcome

The production reducers preserve every independently valid model/market domain when quote or bars are missing, stale, malformed, insufficient, wrong-symbol, future-dated, or out of order.

### Change Boundary

Allowed in this scope: additive reducer/state/status hunks in `msft-july-print-model.html`, the same Feature 009 selftest group, and the same focused browser file.

Excluded in this scope: shared/data/fetch/brief files, user-mode redesign, CSV/tool-read schema, notes, registries, and any synthetic fallback value or hidden input repair.

### Gherkin Scenarios

#### SCN-009-006: Quote Missing Produces Bars-Only Truth

```gherkin
Scenario: The quote resource fails while daily bars are valid
  Given the static model can render
  And the accepted daily bars support technical calculations
  When the quote outcome is missing or rejected
  Then market status is partial
  And quote-owned and spot-dependent fields are unavailable
  And daily technicals retain their own cutoff
  And no old hard-coded spot is presented as current
```

#### SCN-009-007: Bars Missing Produces Quote-Only Truth

```gherkin
Scenario: The daily-bar resource fails while the quote is valid
  Given the accepted quote has valid value and timestamps
  When the bars outcome is missing or rejected
  Then market status is partial
  And spot-dependent model comparisons remain available
  And every unsupported daily technical field is unavailable with a scoped reason
  And no default trend or moving average is inserted
```

#### SCN-009-008: Stale And Malformed Inputs Stay Isolated

```gherkin
Scenario: One resource is stale and another is malformed or unordered
  Given the quote is valid but older than quote policy
  And the bars candidate has invalid symbol, metadata, rows, ordering, or cutoff
  When production validators and reducers process both outcomes
  Then the quote remains visible with stale status and original clocks
  And the bars candidate is rejected with its stable reason code
  And the model and independently valid state remain visible without neutral substitutes or a crash
```

### Ordered Implementation Plan

1. `bubbles.test` extends the existing Feature 009 production-function group and public-controller browser coverage for the three degraded-state scenarios; run the focused cases red before product-source changes.
2. `bubbles.implement` completes stable rejection codes, source-specific staleness, aggregate market state, per-metric insufficient-history results, and failure receipts.
3. Ensure resource failures never clear an accepted peer domain and stale values retain original clocks/limitations.
4. Expose a public production outcome replacement operation for deterministic browser scenarios; do not add a test-only renderer or request interception.
5. Render explicit loading, partial, stale, unavailable, and rejected state text while the static model stays usable.
6. Rerun the exact focused cases, then the combined Feature 009 browser file and selftest group, followed by scope containment.

### Test Plan

| Test Plan ID | Type | Scenario IDs | Owner | File | Behavior And Assertions | Exact Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-009-S2-01 | functional | SCN-009-006, SCN-009-007, SCN-009-008 | `bubbles.test` | `scripts/selftest.mjs` | Production validators reject wrong symbol, empty arrays, invalid/future clocks, non-positive spot, invalid/duplicate/out-of-order rows, and cutoff mismatch; stale classification uses an injected clock and insufficient windows null only unsupported metrics. The row explicitly proves quote missing produces bars-only truth, the scenario `The daily-bar resource fails while the quote is valid`, bars missing produces quote-only truth, and stale or malformed inputs stay isolated. | `node scripts/selftest.mjs` | No |
| TP-009-S2-02 | e2e-ui regression | SCN-009-006, SCN-009-007, SCN-009-008 | `bubbles.test` | `tests/msft-july-market-refresh.spec.mjs` | `Regression: SCN-009-006/007/008 degraded resources stay isolated` drives public production reducers for quote-only, bars-only, both-missing, stale, malformed, and insufficient states without network interception and asserts no crash or fallback. | `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-006/007/008 degraded resources stay isolated"` | Yes |

### Definition of Done

#### Tier 1: Behavioral Completion

- [ ] SCN-009-006, SCN-009-007, and SCN-009-008 are implemented with closed per-resource outcomes and honest aggregate state.
- [ ] Missing/rejected/stale quote and bars outcomes preserve all independent truth, never repair data silently, and never expose the old spot or technical defaults as current.
- [ ] Public production reducers, not test-only state or copied logic, drive deterministic degraded browser states.

#### Tier 2: Test Plan Parity

- [ ] TP-009-S2-01 passes after its pre-source red run, with adversarial production-validator evidence recorded in `report.md`.
- [ ] TP-009-S2-02 passes after its pre-source red run, with real-page degraded-state evidence recorded in `report.md`.

#### Tier 3: Quality And Boundary

- [ ] Error bodies and untrusted strings never enter HTML; visible reasons come from the closed safe-copy map and every missing numeric value renders `Unavailable` rather than zero/NaN/Infinity.
- [ ] Pre/post containment proves no shared/data/fetch/brief/registry/notes change and no unrelated selftest/browser test edit.
- [ ] Scope status advances only through evidence-backed workflow transitions.

## Scope 3: Market/Model Interaction Integrity

Status: [ ] Not started | [~] In progress | [x] Done | [!] Blocked

Depends On: Scope 2

Scope-Kind: vertical-feature

### Outcome

Accepted, failed, and out-of-order quote outcomes update only quote-owned market fields and spot-dependent comparisons while every model input, user edit, selected P/E, bar technical, and fundamental clock remains stable.

### Change Boundary

Allowed in this scope: valuation, monotonic acceptance, scenario-state, and public controller hunks in `msft-july-print-model.html`, plus additive assertions in the two Feature 009 test surfaces.

Excluded in this scope: model formulas/defaults, `autoImpliedMove` ownership transfer to market data, UI layout, CSV/tool read, central credential implementation, notes/registries, and shared/data/brief code.

### Gherkin Scenarios

#### SCN-009-003: Spot Reprices The Existing Scenario Only

```gherkin
Scenario: A positive quote is accepted with positive modeled FY27E EPS
  Given every active scenario input is snapshotted before quote acceptance
  When production acceptance commits a valid delayed spot
  Then spot over modeled FY27E EPS and scenario price versus spot recompute
  And every scenario input remains byte-equivalent
  And selected scenario P/E remains the user's value
  And the market multiple is labeled model-relative rather than consensus forward P/E
```

#### SCN-009-004: User Edits Survive Market Outcomes

```gherkin
Scenario: A user edits Q4 and FY27 assumptions before a market outcome
  Given the user changed Q4 revenue, FY27 depreciation, and selected P/E
  When quote acceptance, rejection, or refresh failure settles
  Then the exact edited values remain selected and persisted
  And only quote-owned state and spot-dependent projections may differ
  And model date and daily technical state remain unchanged
```

#### SCN-009-010: Failed And Out-Of-Order Attempts Preserve Accepted Truth

```gherkin
Scenario: A newer quote is accepted before an older request settles
  Given request sequence 2 has produced an accepted quote
  When request sequence 1 completes with an older candidate
  And a subsequent request fails
  Then request sequence 2 remains accepted
  And failure is recorded without clearing the accepted quote
  And bars, model inputs, selected P/E, and the 2026-07-06 model cutoff remain unchanged
```

### Ordered Implementation Plan

1. `bubbles.test` adds production-calling valuation and monotonic reducer assertions plus browser user-edit preservation; run focused scenarios red before source work.
2. `bubbles.implement` adds `msftBuildValuationRead` with finite positive guards and explicit reason codes; selected scenario P/E stays independent from spot/EPS.
3. Remove the existing market-cache write into user-owned `impMove`; market reducers must not assign any scenario input element.
4. Implement request sequence and observation/retrieval ordering for quote and bars, including failure receipts that preserve accepted values.
5. Snapshot the complete user input set before and after each market action and expose the same state to browser diagnostics.
6. Rerun identical focused red commands to green and prove model outputs remain deterministic for equal inputs across market outcomes.
7. Complete scope containment before Scope 4.

### Test Plan

| Test Plan ID | Type | Scenario IDs | Owner | File | Behavior And Assertions | Exact Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-009-S3-01 | functional | SCN-009-003, SCN-009-004, SCN-009-010 | `bubbles.test` | `scripts/selftest.mjs` | Production valuation handles missing/invalid spot and non-positive EPS; accepted quote changes spot projections only; reducers preserve complete input objects, selected P/E, model date, bars, and newest accepted sequence. | `node scripts/selftest.mjs` | No |
| TP-009-S3-02 | e2e-ui regression | SCN-009-003, SCN-009-004, SCN-009-010 | `bubbles.test` | `tests/msft-july-market-refresh.spec.mjs` | `Regression: SCN-009-003/004/010 market outcomes preserve the scenario` edits real controls, drives production outcomes, and compares controls/model/bar state before/after accepted, failed, and late-old quote attempts. | `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-003/004/010 market outcomes preserve the scenario"` | Yes |

### Definition of Done

#### Tier 1: Behavioral Completion

- [ ] SCN-009-003, SCN-009-004, and SCN-009-010 are implemented through production acceptance/valuation paths.
- [ ] Spot changes only quote-owned fields and spot-dependent projections; model inputs, selected P/E, implied move, model cutoff, and bar technicals retain their owners.
- [ ] Older responses cannot replace a newer accepted observation and failed attempts preserve the last accepted truth.

#### Tier 2: Test Plan Parity

- [ ] TP-009-S3-01 passes after its pre-source red run, with production reducer/valuation evidence recorded in `report.md`.
- [ ] TP-009-S3-02 passes after its pre-source red run, with real-control round-trip evidence recorded in `report.md`.

#### Tier 3: Quality And Boundary

- [ ] Equal scenario inputs and accepted market state produce deterministic outputs; no market action writes a DOM scenario control or persists raw market payloads.
- [ ] Pre/post containment proves model formulas/defaults, excluded files, protected credential work, and unrelated tests remain unchanged.
- [ ] Scope status advances only through evidence-backed workflow transitions.

## Scope 4: One-State User And Export Surfaces

Status: [ ] Not started | [~] In progress | [x] Done | [!] Blocked

Depends On: Scope 3

Scope-Kind: vertical-feature

### Outcome

Simple, Power, optional central-policy refresh, and CSV expose one accepted model/market truth with responsive, accessible, nonblank, reconstructable behavior.

### Change Boundary

Allowed in this scope: DOM/CSS/render/mode/canvas/refresh-refusal/CSV hunks in `msft-july-print-model.html` and additive coverage in the focused browser/selftest surfaces.

Excluded in this scope: a page-local credential, direct provider URL/fetch, shared policy/runtime edits, cache/data/fetch/brief files, notes/registries, model formula changes, and static tool-read publication.

### Gherkin Scenarios

#### SCN-009-009: Central Optional Refresh Preserves Cache Truth

```gherkin
Scenario: The user requests Finnhub refresh under current central policy
  Given the cache-first view is already useful
  And central policy reports Finnhub disabled or unconfigured
  When the user activates Refresh quote
  Then no direct provider request or page-local credential operation occurs
  And the cache-backed accepted state remains visible
  And the scoped status explains the central reason
  And an unconfigured credential links to index.html#data-settings
```

#### SCN-009-011: Simple And Power Share One Truth

```gherkin
Scenario: The user switches display mode after hydration and edits
  Given one accepted state drives all projections
  When the user changes Simple to Power and back by keyboard and pointer
  Then both modes show the same spot, technical conclusion, valuation, and clocks
  And no request or scenario mutation occurs
  And Power canvases redraw nonblank with adjacent textual or tabular equivalents
```

#### SCN-009-012: CSV Reconstructs Complete Or Partial State

```gherkin
Scenario: The user exports the currently displayed accepted state
  Given the page is complete or partially hydrated
  When CSV is generated from one state snapshot
  Then schema version is msft-july-market-refresh/v1
  And model, quote, bars, evaluation, export, scenario, and output fields are separate
  And unavailable values are empty while status and reason fields remain present
  And no ambiguous data_as_of or old static market fallback exists
```

### Ordered Implementation Plan

1. `bubbles.test` adds Simple/Power, central credential, viewport, accessibility, canvas, and CSV browser/functional assertions and runs the focused cases red.
2. `bubbles.implement` adds the single mode tablist, persistent Simple default, shared truth strip, compact Simple projection, complete Power provenance/technicals, and one common render state without duplicating controls.
3. Draw charts only after Power becomes visible and on bounded resize; pair every canvas with complete DOM text/table evidence.
4. Implement central-policy refresh using only current `RLDATA.credentialStatus` / `useCredential` and `RLAPP.report`; disabled/unconfigured/failure paths retain cache truth and no local compatibility transport is added.
5. Replace the ambiguous export with deterministic `msft-july-market-refresh/v1` rows from one accepted-state snapshot and a distinct export timestamp.
6. Validate at 1440x1000, 768x1024, 390x844, and 320x800: no body overflow/overlap, wrapped clocks, keyboard tabs, hidden/inert inactive mode, focus stability, accessible equivalents, and nonblank canvas pixels.
7. Run the dedicated credential regression and prove no `#fhKey`, `msftFhKey`, credential migration/store, direct token URL, or secret-bearing output exists.
8. Rerun focused cases to green and complete scope containment.

### Test Plan

| Test Plan ID | Type | Scenario IDs | Owner | File | Behavior And Assertions | Exact Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-009-S4-01 | functional | SCN-009-012 | `bubbles.test` | `scripts/selftest.mjs` | Production CSV rows have exact deterministic schema/field inventory, raw finite values, empty unavailable values with statuses/reasons, and no `data_as_of`, static fallback, credential, or raw payload. | `node scripts/selftest.mjs` | No |
| TP-009-S4-02 | e2e-ui regression | SCN-009-009, SCN-009-011, SCN-009-012 | `bubbles.test` | `tests/msft-july-market-refresh.spec.mjs` | `Regression: SCN-009-009/011/012 one state drives modes refresh and export` checks central disabled/unconfigured behavior, mode parity/no requests, CSV/download parity, user input persistence, and focus stability on the real page. | `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-009/011/012 one state drives modes refresh and export"` | Yes |
| TP-009-S4-03 | e2e-ui regression | SCN-009-011 | `bubbles.test` | `tests/msft-july-market-refresh.spec.mjs` | `Regression: SCN-009-011 viewport accessibility and canvas matrix` runs 1440x1000, 768x1024, 390x844, and 320x800 checks for body/text/control overflow, tab semantics/keyboard, hidden/inert state, labels/equivalents, and positive nonblank Power canvas pixels; screenshots cover complete Simple/Power and partial desktop/mobile states. | `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-011 viewport accessibility and canvas matrix"` | Yes |
| TP-009-S4-04 | e2e-ui canary | SCN-009-009 | `bubbles.test` | `tests/provider-credentials.spec.mjs` | Existing credential regression remains green and proves the MSFT route uses central settings without page-local storage/migration or a tokenized URL. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Tier 1: Behavioral Completion

- [ ] SCN-009-009, SCN-009-011, and SCN-009-012 are implemented from one accepted state and one control set.
- [ ] Central disabled/unconfigured/failure behavior keeps cache truth and links settings without a local credential or transport.
- [ ] Simple is the first-use default; Power adds provenance/derivations without refetch or mutation; CSV reconstructs the visible complete/partial state with separate clocks.

#### Tier 2: Test Plan Parity

- [ ] TP-009-S4-01 passes after its pre-source red run, with production CSV evidence recorded in `report.md`.
- [ ] TP-009-S4-02 passes after its pre-source red run, with real-page one-state/refresh/export evidence recorded in `report.md`.
- [ ] TP-009-S4-03 passes after its pre-source red run, with viewport/a11y/canvas pixel and screenshot evidence recorded in `report.md`.
- [ ] TP-009-S4-04 passes, with the existing credential canary evidence recorded in `report.md`.

#### Tier 3: Quality And Boundary

- [ ] Visible status and dates are understandable without color/hover; focus is stable; inactive mode leaves layout/a11y trees; no body overflow exists at any required viewport.
- [ ] No credential value enters DOM, URL, logs, CSV, storage, status, notes, or diagnostics; source strings render safely.
- [ ] Pre/post containment proves only allowed page/test hunks changed and every shared/data/brief/registry/notes/protected hunk remains intact.
- [ ] Scope status advances only through evidence-backed workflow transitions.

## Scope 5: Static Publication And Direct Consumers

Status: [ ] Not started | [~] In progress | [x] Done | [!] Blocked

Depends On: Scope 4

Scope-Kind: vertical-feature

### Outcome

The committed-Base `static-model` tool read, notes, page labels/export, and exact MSFT registry records publish one two-clock truth while every unrelated dirty hunk and excluded path remains unchanged.

### Change Boundary

Allowed in this scope: static tool-read publication hunk in `msft-july-print-model.html`; the exact existing MSFT records in `tools.json` and `index.html`; `notes/msft-july-print-model.md`; additive test assertions inside Feature 009's two test surfaces.

Excluded in this scope: active user scenario data in the shared tool read; current consensus, refreshed fundamentals, FY26 Q4 actuals, target prices, cost-cycle revalidation; non-MSFT registry records; shared/data/fetch/brief files; unrelated selftests/tests; route/id/path/profile changes.

### Gherkin Scenarios

#### SCN-009-013: Static-Model Tool Read Retains Its Boundary

```gherkin
Scenario: The page publishes a normalized read with newer market context
  Given the user may have edited active scenario controls
  When the production static tool-read builder publishes through RLDATA
  Then it uses committed Base assumptions and accepted source-qualified market evidence
  And activeUserScenarioIncluded, recommendationEligible, and marketAggregationEligible are false
  And model as-of remains 2026-07-06
  And no FY26 Q4 actual, current consensus, credential, raw option contract, or raw bar row is published
```

#### SCN-009-014: Direct Consumers And Dirty Work Stay Synchronized

```gherkin
Scenario: Feature 009 metadata and notes are published in a dirty worktree
  Given unrelated provider settings, Bond Regime registry additions, centralized credential removal, and selftests already exist
  When the delivered MSFT page, notes, and registry metadata are reconciled
  Then only the existing MSFT records and marker-bounded Feature 009 test group differ for this feature
  And tool id, page path, notes path, navigation identity, and static-model profile remain stable
  And page labels, CSV, normalized read, notes, and registry descriptions express the same model and market cutoffs
  And protected unrelated hunks remain byte-equivalent
```

### Ordered Implementation Plan

1. `bubbles.test` adds red production tool-read/schema/static-boundary assertions and direct-consumer parity/containment checks before publication source edits.
2. `bubbles.implement` adds the strict `rl-tool-read/v1` projection from committed Base assumptions plus accepted market evidence, with false eligibility flags and no raw/private/user-owned content.
3. Rerun tool-read tests green before publication metadata changes.
4. `bubbles.docs` reconciles `notes/msft-july-print-model.md`: model analysis stays 2026-07-06, Q4 stays a scenario with scheduled 2026-07-29 print, quote/bar clocks are separate, and contradictory current/no-price claims are removed without revalidating fundamentals.
5. `bubbles.implement` updates only the existing MSFT records in `tools.json` and `index.html`, preserving title/id/paths/status/profile and every unrelated record/hunk.
6. `bubbles.test` runs direct-consumer parity and stable-link assertions, full selftest, focused browser suite, credential canary, source lock, Playwright identity, and page inline-script/ID parser.
7. Run pre/post containment over all allowed files and verify excluded-path status is unchanged; inspect the complete dirty diff rather than a truncated summary.
8. Run Bubbles artifact lint and traceability checks. Route any product, test, docs, compliance, or audit finding to its owning specialist; do not repair foreign artifacts inline.
9. Route the complete evidence set through `bubbles.validate` and `bubbles.audit`; only those governed phases may interpret completion or authorize state/certification transitions.

### Test Plan

| Test Plan ID | Type | Scenario IDs | Owner | File | Behavior And Assertions | Exact Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-009-S5-01 | functional | SCN-009-013, SCN-009-014 | `bubbles.test` | `scripts/selftest.mjs` | Production tool-read builder passes strict envelope/static-model checks, uses committed Base not active controls, carries separate market provenance, and consumer scans prove stable identities plus exact MSFT-only registry parity. | `node scripts/selftest.mjs` | No |
| TP-009-S5-02 | e2e-ui regression | SCN-009-013, SCN-009-014 | `bubbles.test` | `tests/msft-july-market-refresh.spec.mjs` | `Regression: SCN-009-013/014 static publication and direct consumers` verifies actual RLDATA tool-read content, page/CSV labels, stable deep link/profile, and exact visible direct-consumer truth on the real page. | `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-013/014 static publication and direct consumers"` | Yes |
| TP-009-S5-03 | e2e-ui regression | SCN-009-001 through SCN-009-014 | `bubbles.test` | `tests/msft-july-market-refresh.spec.mjs` | Full focused Feature 009 browser regression covers all fourteen scenario contracts without fourteen duplicate tests. | `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-009-S5-04 | source-lock canary | SCN-009-001, SCN-009-011 | `bubbles.test` | `scripts/validate-node-source-lock.mjs` | Node/Playwright dependency resolution remains locked to committed repository sources. | `node scripts/validate-node-source-lock.mjs` | No |
| TP-009-S5-05 | runner identity canary | SCN-009-011 | `bubbles.test` | `package-lock.json`, `playwright.config.mjs` | Checkout-local Playwright reports exactly `Version 1.61.1` before browser evidence is accepted. | `npx --no-install playwright --version` | No |
| TP-009-S5-06 | e2e-ui canary | SCN-009-009 | `bubbles.test` | `tests/provider-credentials.spec.mjs` | Full existing credential regression stays green after publication changes. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Tier 1: Behavioral Completion

- [ ] SCN-009-013 and SCN-009-014 are implemented across the real static tool read and direct consumers without changing static-model eligibility or stable identities.
- [ ] Notes retain model date `2026-07-06`, scheduled print `2026-07-29`, and unchanged fundamental/consensus status while identifying `data/options/MSFT.json::{spot,asof,fetched}` and `data/bars/MSFT.json::{asof,fetched,rows.length}` as separate source-owned evidence; publication acceptance compares those claims with the parsed current cache files rather than frozen market literals.
- [ ] Only the exact MSFT records in both registries change; all page/CSV/read/notes/registry active claims express one two-clock truth.

#### Tier 2: Test Plan Parity

- [ ] TP-009-S5-01 passes after its pre-source red run, with functional publication/consumer evidence recorded in `report.md`.
- [ ] TP-009-S5-02 passes after its pre-source red run, with real-page publication evidence recorded in `report.md`.
- [ ] TP-009-S5-03 passes and maps all fourteen scenario contracts to specific regression titles in `scenario-manifest.json` and `test-plan.json`.
- [ ] TP-009-S5-04 passes with complete source-lock output recorded in `report.md`.
- [ ] TP-009-S5-05 prints exactly `Version 1.61.1` and the identity output is recorded in `report.md`.
- [ ] TP-009-S5-06 passes with credential-boundary evidence recorded in `report.md`.

#### Tier 3: Quality, Publication, And Boundary

- [ ] The governed per-page inline script/ID parser succeeds for every Feature 009 inline function block and every `getElementById` target.
- [ ] Full pre/post status and path-scoped diff evidence proves no shared/data/brief/fetch/non-MSFT/unrelated-test hunk changed, all protected dirty work survived, and rollback remains hunk-scoped.
- [ ] `bash .github/bubbles/scripts/cli.sh doctor`, artifact lint, and traceability checks for `specs/009-msft-july-market-refresh` pass with truthful output in `report.md`.
- [ ] No skip/only/todo marker exists in changed tests; live e2e rows use the real static server and no request interception or copied production algorithm.
- [ ] Human acceptance items remain for the user in `uservalidation.md`; an agent does not certify them automatically.
- [ ] Delivery state and certification remain unchanged until the governed validate/audit transition chain accepts all evidence.

## Scenario Coverage Matrix

| Scenario ID | Scope | Functional Coverage | E2E-UI Regression Coverage |
| --- | --- | --- | --- |
| SCN-009-001 | 1 | TP-009-S1-01 | TP-009-S1-02, TP-009-S5-03 |
| SCN-009-002 | 1 | TP-009-S1-01 | TP-009-S1-02, TP-009-S5-03 |
| SCN-009-003 | 3 | TP-009-S3-01 | TP-009-S3-02, TP-009-S5-03 |
| SCN-009-004 | 3 | TP-009-S3-01 | TP-009-S3-02, TP-009-S5-03 |
| SCN-009-005 | 1 | TP-009-S1-01 | TP-009-S1-02, TP-009-S5-03 |
| SCN-009-006 | 2 | TP-009-S2-01 | TP-009-S2-02, TP-009-S5-03 |
| SCN-009-007 | 2 | TP-009-S2-01 | TP-009-S2-02, TP-009-S5-03 |
| SCN-009-008 | 2 | TP-009-S2-01 | TP-009-S2-02, TP-009-S5-03 |
| SCN-009-009 | 4 | TP-009-S4-04 | TP-009-S4-02, TP-009-S4-04, TP-009-S5-03, TP-009-S5-06 |
| SCN-009-010 | 3 | TP-009-S3-01 | TP-009-S3-02, TP-009-S5-03 |
| SCN-009-011 | 4 | TP-009-S5-04, TP-009-S5-05 | TP-009-S4-02, TP-009-S4-03, TP-009-S5-03 |
| SCN-009-012 | 4 | TP-009-S4-01 | TP-009-S4-02, TP-009-S5-03 |
| SCN-009-013 | 5 | TP-009-S5-01 | TP-009-S5-02, TP-009-S5-03 |
| SCN-009-014 | 5 | TP-009-S5-01 | TP-009-S5-02, TP-009-S5-03 |

## Repository Command Registry

All commands run from `/Users/pkirsanov/Projects/research-lab`. This repository is build-free and has no `research-lab.sh`.

```bash
node scripts/validate-node-source-lock.mjs
npx --no-install playwright --version
node scripts/selftest.mjs
npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
bash .github/bubbles/scripts/cli.sh doctor
bash .github/bubbles/scripts/artifact-lint.sh specs/009-msft-july-market-refresh
bash .github/bubbles/scripts/traceability-guard.sh specs/009-msft-july-market-refresh
```

The browser runner identity must be exactly `Version 1.61.1`. The exact per-page inline script/ID command is resolved from `.specify/memory/agents.md` and must be recorded here before implementation begins; no alternate parser command satisfies that row.

## Planning Quality Review

- The plan is vertical: each scope delivers a visible or published user/system outcome across production and its matching tests; there are no three consecutive single-layer scopes.
- All fourteen behavior scenarios have stable IDs and both functional and e2e-ui coverage without fourteen duplicate test cases.
- Every Test Plan row has exactly one matching unchecked test-related DoD item in its owning scope.
- Scenario-first red evidence is the first executable action in every source-bearing scope, and the identical focused command must turn green after implementation.
- No scope authorizes refreshed fundamentals, current consensus, FY26 Q4 actuals, target prices, a new provider, or a model date after 2026-07-06.
