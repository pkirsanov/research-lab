# Scope 04: Public Evidence Barrier And Coverage

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `shared-infrastructure:true`, `privacy-critical:true`, `consumer-integration:true`

**Depends On:** Scope 03 - Local Behavior, Privacy Inventory, And Clear

**Primary Outcome:** Public generic evidence and market-data acquisition remain portfolio-agnostic while the private route receives coverage-aware bars and honest partial/corrupt/session-only states; mechanical sentinels prove no personal value reaches public artifacts, tool reads, publisher subprocess inputs, requests, URLs, referrers, console, or remote endpoints.

## Requirement Coverage

- **Functional:** FR-020 through FR-026 and FR-083.
- **Non-functional:** NFR-001 through NFR-002, NFR-005 through NFR-006, NFR-008, NFR-010 through NFR-012, NFR-018 through NFR-021, and NFR-024.
- **Cross-cutting:** FR-005, FR-019, FR-023 through FR-025, FR-029 through FR-030, FR-035, and every public/private trust-zone constraint are rechecked with personal sentinels.

## Gherkin Scenarios

### SCN-008-005 - Generic publisher never receives personal context

```gherkin
Scenario: SCN-008-005 - A scheduled generic brief refresh occurs while local portfolio data exists
  Given the browser holds quantities, cost basis, P&L, cash needs, and behavior events
  When the public four-window publisher refreshes generic evidence
  Then none of those local fields is included in a publisher input or output
  And committed payload, snapshot, and history remain portfolio-agnostic
  And personalized composition occurs only after generic evidence reaches the local context
```

### SCN-008-035 - Partial data does not create synthetic completeness

```gherkin
Scenario: SCN-008-035 - One holding has stale prices and another lacks factor history
  Given other holdings and generic evidence are current
  When portfolio analyses compose
  Then valid current results remain visible
  And stale-price and missing-factor impacts are named per result
  And no missing value is treated as zero, unchanged, or average
  And affected allocation/path confidence is reduced or unavailable by explicit policy
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|----------|---------------|------------|----------------------|-----------|
| SCN-008-005 local/public barrier | Local personal sentinels coexist with public fixtures | Load route, select same-origin-only policy, read generic evidence, inspect requests/tool read/console/location | Public resources and the constant privacy-boundary tool read contain no sentinel; local composition retains only local fingerprint references | e2e-ui |
| SCN-008-035 partial truth | Stale holding, missing factor, corrupt/future slot, blocked localStorage fixtures | Open each affected tab/state | Independently valid rows remain; affected rows state stale/missing/quarantined/session-only; no zero/average/current substitute appears | e2e-ui |
| Coverage-aware acquisition | Same-origin bars are shorter than mandatory target history | Request coverage with lookup disabled, then inspect state | Actual first/last dates and partial reason appear; no external request or false five-year complete state occurs | e2e-ui |

## Implementation Plan

1. Add `RLDATA.ensureBarCoverage(symbol, "1d", policy)` as one marker-bounded additive API. It measures actual dates, appends/deduplicates same-origin rows, preserves source/adjustment/currency metadata, and returns complete/partial/stale/unavailable without changing existing `ensureBars` behavior or keys.
2. Enforce explicit `same-origin-only` versus `allow-public-symbol-lookup` workspace policy. Public lookup may send only symbol, interval, and range through the existing RLDATA sequence; missing same-origin coverage never triggers a hidden request.
3. Add generic evidence adapter validation for existing Market Brief config/snapshot/payload/history, public watchlist, tools registry, and qualified owner reads. It reads all generic artifacts without writing them and never imports or receives a personal workspace.
4. Limit the public `rl-tool-read/v1` to the constant local-only/privacy-boundary unavailable record designed in `design.md`; no holding symbol sourced solely from private state, count, conclusion, identity, or behavior subject enters RLDATA.
5. Implement source-qualified exact-date bar envelopes, stale/partial/adjustment/currency reasons, current-token publication, and corrupt/future personal-slot handling needed by SCN-008-035; analytics beyond truth-state projection remains in later scopes.
6. Add publisher-boundary functional tests that inspect owned public-file inventory and execute a disposable publisher-input/subprocess harness with sentinel environment/argv/browser state. The test proves the generic publisher receives no personal field without mutating tracked public artifacts.
7. Add request-ledger, URL/history/referrer, console, RLDATA tool-read, public-file, storage, and publisher-subprocess sentinel checks using deterministic offline fixtures. No external provider is contacted.

## Consumer Impact Sweep

| Consumer | Required compatibility proof | Stale-reference / leakage assertion |
|----------|------------------------------|-------------------------------------|
| Existing `RLDATA.ensureBars` callers | Identical return/cache/request behavior outside the additive method | Existing selftest and provider-credential browser suite remain green |
| `RLDATA.toolReads`, `rlapp.js`, Market Brief | Constant privacy-boundary read only; no personalized conclusion | Raw tool-read inspection and generic page canary contain zero sentinel |
| Generic publisher scripts and public artifacts | Read-only boundary subject; no import/key/argv/env flow from `rlportfolio.js` | Functional owned-file/subprocess-input scan and unchanged path inventory |
| New route and analytics overlays | Receive only source-qualified public bar/generic envelopes plus local fingerprints | Request ledger permits same-origin public fixture paths only |

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contracts to preserve | Independent canary before broad tests |
|-------------------|----------------------------------|-----------------------------------------|
| `rldata.js` | cache load/save/pruning, bars/options/macro/events/tool reads, credentials, request dedupe, source tags, existing `ensureBars` | Complete `node scripts/selftest.mjs`, direct legacy/additive unit assertions, and `tests/provider-credentials.spec.mjs` |
| Public fixture overlay/server | Production HTML/JS unchanged, deterministic public resources, no intercept/service worker/external source | Request-ledger functional canary and full foundation browser suite |
| Publisher/public artifacts | Existing four-window files, wrapper inventory, scheduler, and generic-only subprocess inputs | `tests/portfolio-publisher-boundary.functional.mjs` in disposable fixture space plus git diff inventory |
| Private storage corruption handling | Last-valid pointer, no downgrade, sanitized quarantine, session-only truth | Scope 01/03 storage and clear functional suites |

## Change Boundary And Rollback

**Allowed new files:** `tests/portfolio-publisher-boundary.functional.mjs` and Scope 04 fixture entries.

**Allowed edits:** one exact marker-bounded Feature 008 block in `rldata.js`; `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, `tests/portfolio-survival.support.mjs`, and one marker-bounded Feature 008 selftest canary block in `scripts/selftest.mjs`.

**Explicitly excluded:** `market-brief.html`, `market-brief.payload.json`, `market-brief.snapshot.json`, `brief-history.jsonl`, `market-brief.config.json`, `scripts/brief-refresh.mjs`, `scripts/brief-refresh-and-push.sh`, scheduler files, `rlbrief.js`, registries/docs, package/source-lock files, Feature 001-007 hunks, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove only exact Feature 008 markers and Scope 04 new tests/fixtures. Rerun legacy RLDATA, provider-credential, publisher-inventory, storage, and complete selftest canaries. Generic files remain byte-identical, and local personal keys are never deleted by source rollback.

## Scenario-First Red/Green Contract

Create each coverage, boundary, partial-state, sentinel, and real-page assertion first. Run the exact command through the tool log with `SCOPE-04` and red/green tags. A valid RED names a leakage, false coverage, synthetic value, compatibility regression, or missing truth state; a test that merely searches its own sentinel fixture without exercising production/public boundaries is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-04-01 | Unit | unit | SCN-008-005, SCN-008-035 | `tests/portfolio-foundation.unit.mjs` | Execute `ensureBarCoverage` complete/partial/stale/unavailable/public-lookup policies, actual-date measurement, source/adjustment/currency reasons, unknown policy rejection, corrupt/ahead-of-clock workspace handling, and constant public-read projection | `node --test tests/portfolio-foundation.unit.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Publisher boundary functional | functional | SCN-008-005 | `tests/portfolio-publisher-boundary.functional.mjs` | Exercise disposable public-file and publisher subprocess input/output boundaries and prove sentinels are absent from argv, environment projection, owned files, generated generic artifacts, and public read inventory | `node --test tests/portfolio-publisher-boundary.functional.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Privacy boundary functional | functional | SCN-008-005, SCN-008-035 | `tests/portfolio-privacy.functional.mjs` | Exercise local/public composition and assert personal sentinels absent from storage outside private namespaces, requests, URLs, referrers, console, public files, RLDATA/tool reads, and sanitized errors | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-04-03` |
| TP-04-04 | Shared consumer canary | functional | SCN-008-005, SCN-008-035 | `scripts/selftest.mjs` | Preserve every existing RLDATA/cache/registry/tool-read/credential invariant and add independent actual-coverage/public-read canaries | `node scripts/selftest.mjs` | No | `report.md#tp-04-04` |
| TP-04-05 | Regression E2E | e2e-ui | SCN-008-005 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-005 TP-04-05 personal state coexists with the shared cache and the only published read is the constant privacy boundary`; proves the shared cache, same-origin request ledger, and address bar remain sentinel-free while TP-04-02 separately owns publisher subprocess, argv, and file boundaries | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-005 TP-04-05 personal state coexists with the shared cache and the only published read is the constant privacy boundary" --reporter=list` | Yes | `report.md#scenario-scn-008-005` |
| TP-04-06 | Regression E2E | e2e-ui | SCN-008-035 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth" --reporter=list` | Yes | `report.md#scenario-scn-008-035` |
| TP-04-07 | Shared boundary Regression E2E | e2e-ui | SCN-008-005, SCN-008-035 | `tests/provider-credentials.spec.mjs` | Existing central credentials, public RLDATA cache, settings ownership, and same-origin source policy remain unchanged after coverage support | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-04-07` |
| TP-04-08 | Broader Regression E2E | e2e-ui | SCN-008-001 through SCN-008-005, SCN-008-011, SCN-008-012, SCN-008-035 | `tests/portfolio-survival-foundation.spec.mjs` | Execute the complete cumulative foundation browser suite after shared coverage and privacy-boundary checks are green | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-04-08` |

### Definition of Done

#### Core Delivery Items

- [x] FR-020 through FR-026 and FR-083 are fully implemented with exact fact provenance/clocks/transforms/freshness, model identity, local-only personal state, publisher isolation, zero writeback, and explicit alignment/corporate-action/currency/missing-bar states.

  FR-020 provenance and FR-083 alignment are carried by `barAlignmentStates` (`rldata.js`); freshness is `ensureBarCoverage` + the declared `HOLDING_PRICE_MAX_AGE_H = 96` (D-04-C). FR-023 through FR-026 are proven by TP-04-02/03/05. Evidence: [TP-04-01](report.md#tp-04-01), [D-04-D](report.md#decision-record).

  ```
  ok 55 - SCN-008-035 TP-04-01: undeclared alignment properties report undeclared and are never assumed
  ok 56 - SCN-008-035 TP-04-01: a mismatched trading calendar is measured against a real basis and named per date
  1..56
  # tests 56
  # suites 0
  # pass 56
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  ```

  Intended RED, same command:

  ```
  not ok 55 - SCN-008-035 TP-04-01: undeclared alignment properties report undeclared and are never assumed
    error: 'api.barAlignmentStates is not a function'
  not ok 56 - SCN-008-035 TP-04-01: a mismatched trading calendar is measured against a real basis and named per date
    error: 'api.barAlignmentStates is not a function'
  # tests 56
  # pass 54
  # fail 2
  ```
- [x] NFR-001 through NFR-002, NFR-005 through NFR-006, NFR-008, NFR-010 through NFR-012, NFR-018 through NFR-021, and NFR-024 are satisfied by deterministic coverage, cutoff integrity, cache-first partial truth, latest-token publication, transparent sources, inert input, build-free execution, failure isolation, and verified local deletion.

  Determinism and cache-first partial truth are proven by the unit rows; build-free execution and portability by the browser suite running the page from a static server with no bundler. Evidence: [TP-04-01](report.md#tp-04-01), [TP-04-08](report.md#tp-04-08).

  ```
    ✓   6 … Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes (2.5s)
    ✓   7 … Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio (2.8s)
    ✓   8 … Regression: SCN-008-012 behavior evidence excludes engagement and sensitive profiling (9.1s)
    ✓   9 … Regression: TP-03-06 full-personal clear empties every declared category and leaves the generic public cache byte-identical (3.8s)
    ✓  10 … Regression: TP-03-06 every declared foundation clear step refuses success on its own and retains only its own key (16.9s)
    ✓  11 … Regression: SCN-008-005 TP-04-05 personal state coexists with the shared cache and the only published read is the constant privacy boundary (1.5s)
    ✓  12 … Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth (1.5s)
    12 passed (46.0s)
  ```
- [x] Mechanical sentinel validation proves personal data absent from committed/public files, publisher argv/environment/input/output, requests/bodies/URLs/referrers, console, remote endpoints, RLDATA/tool reads, generic cache, and every non-private storage key.

  Evidence: [TP-04-02](report.md#tp-04-02), [TP-04-03](report.md#tp-04-03), [SCN-008-005](report.md#scenario-scn-008-005).

  ```
  1..4
  # tests 4
  # suites 0
  # pass 4
  # fail 0
  1..16
  # tests 16
  # suites 0
  # pass 16
  # fail 0
  [TP-04-05] localPortfolioRevisions=1
  [TP-04-05] sentinelsInPublicCache=0
  [TP-04-05] offOriginRequests=0
  ```

  The revision count is asserted non-zero at the same moment as the sentinel counts, so the zeros are the absence of a leak rather than the absence of data to leak.
- [x] `rldata.js`, fixture/server, publisher, storage, and selftest Shared Infrastructure Impact Sweeps, independent canaries, marker boundaries, and exact rollback/restore proof are complete with zero excluded edits.

  Evidence: [TP-04-04](report.md#tp-04-04), [Code Diff Evidence](report.md#code-diff-evidence).

  ```
  Feature 008 Scope 04 shared-consumer canary
    ✓ Scope 04 TP-04-04: every legacy RLDATA consumer method survives the additive block (missing: )
    ✓ Scope 04 TP-04-04: the additive ensureBarCoverage method is present
    ✓ Scope 04 TP-04-04: the additive barAlignmentStates method is present
    ✓ Scope 04 TP-04-04: coverage reports the actual observed span
    ✓ Scope 04 TP-04-04: a coverage read leaves the rows legacy callers see byte-identical
    ✓ Scope 04 TP-04-04: the canary reached the network zero times (recorder, not an omitted binding)
    ✓ Scope 04 TP-04-04: RLDATA accepts the constant privacy-boundary read as the tool’s only publication
    ✓ Scope 04 TP-04-04: the shared public cache carries no holding, conclusion, or personal storage name

  Research-Lab self-test: 1586 passed, 0 failed
  ```

  Rollback proof: two probes were injected and reverted with residue verified absent — `grep -n "PROBE" rlportfolio.js` → no match (exit 1), `grep -n "RED PROBE" rldata.js` → no match (exit 1).
- [x] Every Scope 04 behavior has intended RED and same-command GREEN evidence before broader browser validation.

  Three intended REDs were observed and recorded in [report.md](report.md#tp-04-01) and [SCN-008-035](report.md#scenario-scn-008-035).

  ```
  not ok 53 - SCN-008-035 TP-04-01: the truth-state projection names each impact and never substitutes a missing value
  not ok 54 - SCN-008-035 TP-04-01: an unknown evidence state is refused rather than defaulted to current
  # tests 54
  # pass 52
  # fail 2

  not ok 55 - SCN-008-035 TP-04-01: undeclared alignment properties report undeclared and are never assumed
    error: 'api.barAlignmentStates is not a function'
  not ok 56 - SCN-008-035 TP-04-01: a mismatched trading calendar is measured against a real basis and named per date
    error: 'api.barAlignmentStates is not a function'
  # tests 56
  # pass 54
  # fail 2

      Error: BND must be excluded, not valued
    1 failed
  ```

  The third is the TP-04-06 non-vacuity probe: forcing every holding to be included fails the row.

#### Test Evidence Items - Exact Parity With 8 Test Plan Rows

- [x] TP-04-01 unit evidence proves actual-date coverage, explicit network policy, source states, corrupt/future handling, and constant privacy-boundary read behavior.

  `node --test tests/portfolio-foundation.unit.mjs` → exit 0. Evidence: [TP-04-01](report.md#tp-04-01).

  ```
  ok 54 - SCN-008-035 TP-04-01: an unknown evidence state is refused rather than defaulted to current
  ok 55 - SCN-008-035 TP-04-01: undeclared alignment properties report undeclared and are never assumed
  ok 56 - SCN-008-035 TP-04-01: a mismatched trading calendar is measured against a real basis and named per date
    ---
    duration_ms: 1.138605
    type: 'test'
    ...
  1..56
  # tests 56
  # suites 0
  # pass 56
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  ```
- [x] TP-04-02 functional evidence proves the generic publisher's disposable subprocess/file boundary receives and emits no personal sentinel.

  `node --test tests/portfolio-publisher-boundary.functional.mjs` → exit 0. Evidence: [TP-04-02](report.md#tp-04-02).

  ```
    duration_ms: 68.348401
    type: 'test'
    ...
  1..4
  # tests 4
  # suites 0
  # pass 4
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 2594.986224
  ```
- [x] TP-04-03 functional evidence proves personal sentinels are absent from every public, request, URL, referrer, console, RLDATA, storage, and error surface.

  `node --test tests/portfolio-privacy.functional.mjs` → exit 0. Evidence: [TP-04-03](report.md#tp-04-03).

  ```
    duration_ms: 15.766835
    type: 'test'
    ...
  1..16
  # tests 16
  # suites 0
  # pass 16
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 1918.862205
  ```
- [x] TP-04-04 selftest evidence proves additive coverage/public-read behavior and every existing shared invariant.

  `node scripts/selftest.mjs` → exit 0. Evidence: [TP-04-04](report.md#tp-04-04).

  ```
  Feature 008 Scope 04 shared-consumer canary
    ✓ Scope 04 TP-04-04: every legacy RLDATA consumer method survives the additive block (missing: )
    ✓ Scope 04 TP-04-04: the additive ensureBarCoverage method is present
    ✓ Scope 04 TP-04-04: the additive barAlignmentStates method is present
    ✓ Scope 04 TP-04-04: coverage reports the actual observed span
    ✓ Scope 04 TP-04-04: a coverage read leaves the rows legacy callers see byte-identical
    ✓ Scope 04 TP-04-04: the canary reached the network zero times (recorder, not an omitted binding)
    ✓ Scope 04 TP-04-04: RLDATA accepts the constant privacy-boundary read as the tool’s only publication
    ✓ Scope 04 TP-04-04: the shared public cache carries no holding, conclusion, or personal storage name

  ================================================
  Research-Lab self-test: 1586 passed, 0 failed
  ================================================
  ```
- [x] TP-04-05 Regression E2E evidence proves SCN-008-005 preserves the generic publisher/local composition barrier in the real browser/server path.

  Declared `--grep` command → exit 0. Evidence: [SCN-008-005](report.md#scenario-scn-008-005).

  ```
  Running 1 test using 1 worker

  [TP-04-05] localPortfolioRevisions=1
  [TP-04-05] sentinelsInPublicCache=0
  [TP-04-05] offOriginRequests=0
    ✓  1 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:1314:1 › Regression: SCN-008-005 TP-04-05 personal state coexists with the shared cache and the only published read is the constant privacy boundary (1.5s)

    1 passed
  ```
- [x] TP-04-06 Regression E2E evidence proves SCN-008-035 preserves independently valid truth across stale, missing, corrupt, future, and session-only states.

  Declared `--grep` command → exit 0. Evidence: [SCN-008-035](report.md#scenario-scn-008-035).

  ```
  Running 1 test using 1 worker

  [TP-04-06] phaseA excluded=2 substituted=0
  [TP-04-06] phaseB valued=1 missingBesideValid=BND
  [TP-04-06] phaseC staleNamed=MSFT lastObservation=2026-04-30
  [TP-04-06] phaseD quarantined=true syntheticRows=0 rows=0
  [TP-04-06] phaseE sessionOnly rows=0 unavailableStated=true
    ✓  1 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:1396:1 › Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth (1.5s)

    1 passed (4.2s)
  ```

  Non-vacuity proven — forcing every holding to be valued fails the row with `Error: BND must be excluded, not valued`.
- [x] TP-04-07 existing-browser canary evidence proves shared data and central credential/settings boundaries remain unchanged.

  Declared command → exit 0. Evidence: [TP-04-07](report.md#tp-04-07).

  ```
  Running 8 tests using 1 worker

    ✓  1 … editor renders both tiers with the two-tier API and providers start unconfigured (550ms)
    ✓  2 … Tier-2: a local key set through the editor is stored only in this browser and never leaked (410ms)
    ✓  3 … Tier-1: a reachable proxy flips the active tier, and force-local overrides it (516ms)
    ✓  4 … unknown/prototype-shaped providers fail closed, and "clear all" wipes this browser (313ms)
    ✓  5 … Regression BUG-001: legacy cleanup erases pre-BUG-002 containers and preserves current provider access (539ms)
    ✓  6 … Regression BUG-001: incomplete legacy cleanup is explicit and does not alter BUG-002 configuration (454ms)
    ✓  7 … Regression BUG-001: inaccessible legacy storage is unavailable, never falsely clear (286ms)
    ✓  8 … Regression BUG-001: cancelling destructive cleanup preserves the legacy container (484ms)

    8 passed (5.7s)
  ```
- [x] TP-04-08 broader E2E evidence proves the complete cumulative foundation suite passes after every focused/shared row.

  Declared command → exit 0. Evidence: [TP-04-08](report.md#tp-04-08).

  ```
    ✓   1 … Regression: SCN-008-003 explicit mandate alone supplies every hard constraint (1.6s)
    ✓   2 … Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable (1.3s)
    ✓   3 … Regression: SCN-008-003 conflicting mandate stays visibly infeasible with no constraint relaxed (727ms)
    ✓   4 … Regression: SCN-008-001 valid local portfolio import creates one current revision (1.0s)
    ✓   5 … Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted (870ms)
    ✓   6 … Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes (2.5s)
    ✓   7 … Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio (2.8s)
    ✓   8 … Regression: SCN-008-012 behavior evidence excludes engagement and sensitive profiling (9.1s)
    ✓   9 … Regression: TP-03-06 full-personal clear empties every declared category and leaves the generic public cache byte-identical (3.8s)
    ✓  10 … Regression: TP-03-06 every declared foundation clear step refuses success on its own and retains only its own key (16.9s)
    ✓  11 … Regression: SCN-008-005 TP-04-05 personal state coexists with the shared cache and the only published read is the constant privacy boundary (1.5s)
    ✓  12 … Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth (1.5s)
    12 passed (46.0s)
  ```

#### Build Quality Gate

- [x] Focused RED/GREEN records, Consumer/Shared Impact Sweeps, marker and rollback diffs, personal-sentinel and public-owned-file scans, no-interception/service-worker/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, scope-local traceability, and framework write guard are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16.

  ```
  artifact-lint exit=0
  freshness exit=0
  write-guard exit=0
  gate-catalog exit=0
  WHITESPACE-CLEAN
  probe-residue-exit=1        # grep -n "PROBE" rlportfolio.js  -> no match
  probe-residue-exit=1        # grep -n "RED PROBE" rldata.js   -> no match
  0                           # traceability failures naming 04-public-* files
  scope04-failures-above
  Research-Lab self-test: 1586 passed, 0 failed
  # tests 56 / # pass 56 / # fail 0
  12 passed (46.0s)           # TP-04-08
  8 passed (5.7s)             # TP-04-07
  ```

  No-interception scan: every match in the two browser specs is either an assertion that **zero**
  service workers are registered or a comment recording that no `page.route`/`context.route`/`msw`/
  `nock` is used. There is no request interception in any live-category row, so the `e2e-ui`
  classification is earned rather than asserted.

  Test Plan/DoD parity: 8 Test Plan rows, 8 Test Evidence DoD items.
