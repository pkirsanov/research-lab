# Report: 002 Distributed Tool Briefs and Recommendation History

**Related artifacts:** [scopes/_index.md](scopes/_index.md) | [uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

## Planning Baseline

This is the aggregate execution-evidence template for the ten sequential scopes in [scopes/_index.md](scopes/_index.md). Each scope owns its evidence in `scopes/<NN-name>/report.md`; this file summarizes only after those records exist. `bubbles.plan` authored contracts but did not implement, execute acceptance journeys, or certify product behavior. A planning path, title, expected result, fixture, or source-response sample is not delivery evidence.

## Summary

- Feature intent: use the frozen registry to give every source tool one truthful current brief/history contract; the current 23-entry canary is 22 sources, including Bond Regime, plus Market Brief as the non-recursive final participant. Runtime membership remains registry-derived while cutoff-safe market-session/report evidence stays outside owning-model authority.
- Scope order: MarketSessionEvidence foundation -> Yahoo extended-hours and CPI release adapters -> cutoff-safe reaction and owner integration -> registry reads -> bounded authorship/lifecycle -> append-only history/migration -> window-aware final aggregation -> evidence-first atomic publication -> shared UI/Pages acceptance.
- Shared-risk posture: changes to `rlcontracts.js`, `rlsession.js`, `RLDATA`, `RLAPP`, `tools.json`, owner-read adapters, scheduler ordering, history storage, and page mounts require independent canaries and rollback/restore proof.
- Evidence policy: committed normalized vectors and captured external responses prove contract behavior only. Live tests may prove current structure, bounded acquisition, provenance, freshness, cutoff eligibility, identity, atomicity, and UI behavior; none proves a fixed market value, recommendation correctness, or investment performance.
- Delivery status: no implementation or test execution is claimed by this planning packet.

## Decision Record

Planning fixed the following execution boundaries from [design.md](design.md): provider-neutral MarketSessionEvidence precedes concrete Yahoo/BLS adapters; exact calendar rows and immutable cutoffs govern session/report evidence; owners publish interpretations through ToolModelRead without foundation or author recomputation; registry membership is the only participant discovery mechanism; final authorship waits until read and brief outcome ID sets exactly equal the frozen registry's derived source ID set; unchanged briefs carry by reference; recommendation identity is deterministic and provenance-aware; `briefs/current.json` and `briefs/history-current.json` are the only mutable pointers; monthly JSONL is append-only; publication uses an isolated worktree with pointers advanced last; and compatibility projections remain complete.

Execution agents must append any implementation decision that changes file grouping while preserving these contracts, including the affected scope, alternatives considered, contract/version impact, rollback boundary, and evidence reference.

## Completion Statement

Planning reconciliation is complete. Product delivery is not claimed. All 122 test-related DoD items and every implementation DoD item remain unchecked, all ten scope statuses remain Not Started, user acceptance journeys are unexecuted, and `state.json` remains `not_started` with certification untouched.

## Code Diff Evidence

Planning-only paths created or updated by this invocation:

- `specs/002-distributed-tool-briefs-and-history/scopes/_index.md`
- `specs/002-distributed-tool-briefs-and-history/scopes/*/scope.md`
- `specs/002-distributed-tool-briefs-and-history/scopes/*/report.md`
- `specs/002-distributed-tool-briefs-and-history/report.md`
- `specs/002-distributed-tool-briefs-and-history/uservalidation.md`
- `specs/002-distributed-tool-briefs-and-history/scenario-manifest.json`
- `specs/002-distributed-tool-briefs-and-history/test-plan.json`
- plan-permitted execution metadata in `specs/002-distributed-tool-briefs-and-history/state.json`

No source, runtime, config, contract, test, docs, Spec 001, or unrelated product path is claimed by this planning phase.

## Test Evidence

No product implementation test, browser test, source smoke, migration, scheduler transaction, or Pages acceptance command has been executed by `bubbles.plan`. Exact commands, paths, titles, live-system classifications, and red-to-green contracts are defined in each scope and bound by ordered row hashes in [test-plan.json](test-plan.json). Delivery evidence must contain full unfiltered output, the actual exit code, and a `Claim Source` value for each command.

### Planned Test Inventory

The active plan contains 122 ordered test rows across ten scopes. The Markdown rows are authoritative; [test-plan.json](test-plan.json) stores each exact row's `TP-*` identifier, order, and SHA-256 contract. The previous five-scope rows remain only under `supersededScopes` with `doNotExecute: true`.

## Scenario Contract Evidence

No runtime scenario evidence exists. [scenario-manifest.json](scenario-manifest.json) registers SCN-002-001 through SCN-002-028 with exact persistent live regression identifiers and per-scope report anchors. Every scenario remains unlocked and not run.

| Scenario Range | Owning Scopes | Evidence Status |
| --- | --- | --- |
| SCN-002-016, SCN-002-018, SCN-002-021, SCN-002-022 | 01 | Not run |
| SCN-002-017, SCN-002-028 | 02 | Not run |
| SCN-002-019, SCN-002-023, SCN-002-024 | 03 | Not run |
| SCN-002-020, SCN-002-026 | 04 | Not run |
| SCN-002-001 through SCN-002-003 | 05 | Not run |
| SCN-002-004 through SCN-002-006 | 06 | Not run |
| SCN-002-007 through SCN-002-009 | 07 | Not run |
| SCN-002-025, SCN-002-027 | 08 | Not run |
| SCN-002-010 through SCN-002-012 | 09 | Not run |
| SCN-002-013 through SCN-002-015 and amendment UI regressions | 10 | Not run |

## Coverage Report

Planning maps all 28 stable scenario contracts to exact persistent live regression identifiers and assigns FR-001 through FR-132, NFR-001 through NFR-024, BS-002-001 through BS-002-030, and AC-001 through AC-033 across the ten-scope DAG. NFR-023 is assigned to Scopes 02, 03, 04, 05, 06, 08, and 10; NFR-024 is assigned to Scopes 03, 04, 05, 06, 08, and 10. Runtime coverage percentages and pass counts are unavailable until implementation tests execute.

## Lint and Quality

Planning governance command evidence is reported by the invoking plan agent. Product lint is not declared by the repository. Product behavior validation remains the exact Node and Playwright surfaces defined in [test-plan.json](test-plan.json).

## Uncertainty Declarations

- **Scopes 1-10:** Product behavior, planned test-file existence, and implementation command outcomes were not evaluated by `bubbles.plan`. Resolution requires sequential implementation and test ownership to create the planned surfaces, execute each exact command, and append raw evidence without weakening the scenarios.
- **Market proof:** No planned fixture or test result may be interpreted as evidence of investment performance or recommendation correctness. Resolution of a recommendation outcome uses only frozen terms and later source evidence under the implemented lifecycle contract.

## Spot-Check Recommendations

Independent validation should inspect opening-boundary assignment, holiday/early-close/DST rows, exact five-minute Yahoo request and no-write smoke, official-versus-indicative price separation, comparable-volume exclusions, CPI pre-release/released/revision/dispute lineage, release-aligned no-look-ahead reactions, owner authority, registry count/roles, exact four-worker call accounting, carry-forward, lifecycle/conflict groups, one monthly query, actual-corpus (derived row count) migration parity, every scheduler fault, dirty-root preservation, and all-page desktop/mobile/zoom rendering.

## Validation Summary

No product validation verdict exists. Planning validation results are supplied in the `bubbles.plan` result envelope and do not certify delivery.

## Audit Verdict

No audit verdict exists. `bubbles.audit` and `bubbles.validate` retain ownership of audit evidence and terminal certification.

## Test Phase Execution

Executed by `bubbles.test` on 2026-07-28 in a single session against the working tree at
`/home/redacted/research-lab`. Repository binding preflight was committed before any repository-local
read (`PREFLIGHT_COMMITTED decision=rb:vscode-93b8cbfaa3b47932d280e44f81822c28:16 revision=16
repository=research-lab root=/home/redacted/research-lab`, `actionable: true`).

No test file, production `*-lab.html`, `scripts/`, or `.github/` file was created or modified by this
run. Working-tree modifications to `tests/simple-production-bridge.integration.mjs`,
`tests/volatility-sizing-lab.spec.mjs`, and `volatility-sizing-lab.html` are a concurrent session's
in-flight work that pre-existed this run and were left untouched.

### TPE-01 — Repository baseline

**Command:** `node scripts/selftest.mjs`
**Exit Code:** `0`
**Result:** PASSED — 952 passed, 0 failed
**Claim Source:** executed

```text
Feature 012 Scope 10 Bounded WebEvidence Acquisition (fail-closed acquisition + validator)
  ✓ every committed web-evidence fixture (>= 11) evaluates deterministically against the REAL acquire() production transform
  ✓ web-evidence-acquire.mjs imports ONLY node:crypto and owns zero fetch/provider-key/repo-write/current-pointer/author-publication authority
  ✓ the web-evidence validator refuses twelve distinct closed adversarial mutations, each with an E012-* code
  ✓ SCN-012-006/007 single & syndicated origins leave a material claim uncorroborated while two DISTINCT origins corroborate; the safe bundle is frozen with no raw markup (SCN-012-037)

Feature 012 Scope 12 Dynamic Red Alert discovery/qualification/projection
  ✓ SCN-012-023 a dynamically corroborated, market-confirmed, high-severity candidate qualifies with every falsifiable field and an admission score (never a probability/confidence/crash-odds field), publication Feature-002 gated
  ✓ SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title
  ✓ SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic

================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
=== SELFTEST_EXIT=0 ===
```

### TPE-02 — Runner-mismatch failure (recorded honestly, NOT a product defect)

The requested step-2 command placed `tests/distributed-briefs.spec.mjs` under the `node --test`
runner. That file is a **Playwright** e2e-ui spec: it imports `{ test, expect }` from
`./playwright-runtime.mjs`, takes a `{ page }` fixture, and is matched by `playwright.config.mjs`
(`testMatch: '**/*.spec.mjs'`). Running it under `node --test` therefore aborts the worker before any
assertion executes. The failure is a **runner mismatch in the command**, not a defect in the product
or the test. The file is re-executed under its correct runner in TPE-04, where it passes 13/13.

No test file was edited to resolve this.

**Command:** `node --test tests/distributed-briefs.spec.mjs tests/distributed-briefs.contract.mjs tests/distributed-briefs.support.mjs tests/distributed-briefs.consumer-trace.mjs`
**Exit Code:** `1`
**Result:** FAILED — 8 passed, 1 failed (`tests/distributed-briefs.spec.mjs`, runner mismatch)
**Claim Source:** executed

```text
✔ compatibility consumers contain zero stale mutable-history count or unsafe-render assumptions (25.471362ms)
✔ RLCONTRACTS canonicalization and semantic/occurrence fingerprints are deterministic (7.635488ms)
✔ MarketSessionEvidence v1 contracts preserve provenance identities states and ownership boundaries (10.916183ms)
✔ SCN-002-026: only owner adapters may publish evidence interpretations or action eligibility (1.269098ms)
✔ SCN-002-001: registry derives 23 participants 22 sources and one non-recursive aggregator (4.861993ms)
✔ SCN-002-002: profile status applicability privacy and eligibility boundaries fail loud (9.742586ms)
✔ SCN-002-003: added-source mutation derives 24 participants and 23 sources generically (3.956094ms)
/home/redacted/research-lab/node_modules/playwright/lib/common/index.js:2257
      throw new Error([
            ^

Error: Playwright Test did not expect test() to be called here.
Most common reasons include:
- You are calling test() in a configuration file.
- You are calling test() in a file that is imported by the configuration file.
- You have two different versions of @playwright/test. This usually happens
  when one of the dependencies in your package.json depends on @playwright/test.
- You are calling test() from an async test.describe() block. Only sync ones are supported.
    at _TestTypeImpl._currentSuite (/home/redacted/research-lab/node_modules/playwright/lib/common/index.js:2257:13)
    at _TestTypeImpl._createTest (/home/redacted/research-lab/node_modules/playwright/lib/common/index.js:2271:24)
    at /home/redacted/research-lab/node_modules/playwright/lib/common/index.js:1220:12
    at file:///home/redacted/research-lab/tests/distributed-briefs.spec.mjs:33:1
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)

Node.js v22.22.0
✖ tests/distributed-briefs.spec.mjs (515.170926ms)
✔ tests/distributed-briefs.support.mjs (72.73629ms)
ℹ tests 9
ℹ pass 8
ℹ fail 1
=== DISTRIBUTED_BRIEFS_EXIT=1 ===
```

### TPE-03 — Spec node suites (correct runner)

**Command:** `node --test tests/distributed-briefs.contract.mjs tests/distributed-briefs.support.mjs tests/distributed-briefs.consumer-trace.mjs`
**Exit Code:** `0`
**Result:** PASSED — 8 passed, 0 failed
**Claim Source:** executed

```text
✔ compatibility consumers contain zero stale mutable-history count or unsafe-render assumptions (23.269573ms)
✔ RLCONTRACTS canonicalization and semantic/occurrence fingerprints are deterministic (7.666291ms)
✔ MarketSessionEvidence v1 contracts preserve provenance identities states and ownership boundaries (10.851087ms)
✔ SCN-002-026: only owner adapters may publish evidence interpretations or action eligibility (1.061599ms)
✔ SCN-002-001: registry derives 23 participants 22 sources and one non-recursive aggregator (4.887494ms)
✔ SCN-002-002: profile status applicability privacy and eligibility boundaries fail loud (8.98689ms)
✔ SCN-002-003: added-source mutation derives 24 participants and 23 sources generically (3.885795ms)
✔ tests/distributed-briefs.support.mjs (75.404212ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 152.630722
=== NODETEST_3_EXIT=0 ===
```

### TPE-04 — Scope 10 e2e-ui regression under the Playwright runner

Same file as the TPE-02 failure, executed under its declared runner. Live real-browser execution
(system-chrome, no request interception).

**Command:** `npx playwright test tests/distributed-briefs.spec.mjs --project=system-chrome --reporter=list`
**Exit Code:** `0`
**Result:** PASSED — 13 passed, 0 failed
**Claim Source:** executed

```text
Running 13 tests using 1 worker

  ✓   1 …wer keep official close separate and disclose comparable volume (651ms)
  ✓   2 … the exact published pre-market thesis with owner read evidence (308ms)
  ✓   3 …inal never labels a partial regular print as the official close (384ms)
  ✓   4 …erve official close and label every post-close print indicative (363ms)
  ✓   5 … strips use explicit calendar boundaries and next valid session (548ms)
  ✓   6 …ming to released without stale actual or post-release consensus (581ms)
  ✓   7 …ay separate and revisions append without rewriting the original (624ms)
  ✓   8 … and history exclude look-ahead and retain immutable chronology (402ms)
  ✓   9 …ed unusual evidence remains context and consumes no action slot (335ms)
  ✓  10 …emains truthful and non-current failures cannot replace current (698ms)
  ✓  11 …fetches only the selected partition and opened evidence objects (440ms)
  ✓  12 …ory UI is accessible safe and stable at desktop mobile and zoom (500ms)
  ✓  13 …y source receives the shared mount with no page-specific branch (236ms)

  13 passed (7.9s)
=== PLAYWRIGHT_EXIT=0 ===
```

### TPE-05 — Market-session and released-report evidence suites

**Command:** `node --test tests/market-session-evidence.unit.mjs tests/market-session-evidence.functional.mjs tests/released-report-evidence.e2e.mjs`
**Exit Code:** `0`
**Result:** PASSED — 16 passed, 0 failed
**Claim Source:** executed

```text
✔ SCN-002-017: captured Yahoo bytes normalize official and indicative session fields without missing-volume coercion (60.675784ms)
✔ SCN-002-028: Yahoo and NYSE fixture mutations enforce bounds retries provenance and source use (21.417495ms)
✔ SCN-002-019: captured BLS schedule and API bytes produce auditable CPI actual previous and nullable consensus (12.219196ms)
✔ Consensus lock source use unit basis and disagreement mutations fail loud (10.790398ms)
✔ SCN-002-016: opening-boundary bars belong to exactly one session and cutoff (44.199289ms)
✔ SCN-002-018: comparable volume uses exact completed buckets and preserves missing versus zero (1160.031199ms)
✔ SCN-002-021: committed XNYS rows resolve holidays early closes and DST (49.471688ms)
✔ SCN-002-022: invalid stale missing disputed and post-cutoff evidence fails loud (28.934793ms)
✔ SCN-002-028: source policy accepts only the exact NYSE and Yahoo request contracts (2.299699ms)
✔ SCN-002-019: CPI is upcoming before release and uses exact BLS transforms after release (17.435496ms)
✔ SCN-002-023: comparable source disagreement remains disputed with no synthesized value (4.746598ms)
✔ SCN-002-024: changed BLS levels append one revision identity and preserve prior bytes (17.729987ms)
✔ SCN-002-020: ReactionSegment v1 preserves exact non-zero window source boundary cutoff state and identities (100.393124ms)
✔ Regression: SCN-002-019 exposes upcoming then released CPI lineage without stale carry (42.757889ms)
✔ Regression: SCN-002-023 provider disagreement blocks a single CPI surprise and owner claim (5.637699ms)
✔ Regression: SCN-002-024 CPI revision appends while original release graph remains immutable (11.403797ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1527.286532
=== STEP3_EXIT=0 ===
```

### Test Phase Scope and Limits

| Item | Value |
|---|---|
| Suites executed | 5 commands (TPE-01 .. TPE-05) |
| Net product result | All executed suites green under their correct runners |
| Genuine product failures | **None** |
| Non-product failure | TPE-02 runner mismatch only; same file green in TPE-04 |
| Test files modified | **None** |

**This section records execution of the `test` phase only.** It does not certify any scope, does not
mark SCOPE-01/02/03 Done, and does not alter feature status. Scope-level DoD certification remains
owned by `bubbles.validate`.

### Test Phase Uncertainty Declarations

- **Partial test-surface coverage.** The five commands above are the surfaces named for this phase.
  The spec's `test-plan.json` declares ~34 distinct commands, and `tests/distributed-briefs*` contains
  38 files. The suites NOT executed in this run are unproven by this evidence and no claim is made
  about them.
- **`test-plan.json` filename drift (routing required, plan-owned).** Declared commands reference a
  `distributed-briefs-<topic>.test.mjs` naming convention (for example
  `node --test tests/distributed-briefs-contracts.test.mjs`,
  `node --test tests/distributed-briefs-consumer-trace.test.mjs`) that does not exist on disk; the
  actual files use `distributed-briefs.<topic>.mjs`. This is a planning-artifact inconsistency owned
  by `bubbles.plan`, not repaired here. `bubbles.test` does not edit `test-plan.json`.
- **Concurrent working-tree state.** TPE-01 ran with another session's uncommitted modifications to
  `tests/simple-production-bridge.integration.mjs`, `tests/volatility-sizing-lab.spec.mjs`, and
  `volatility-sizing-lab.html` present. The baseline passed 952/0 with those present; no attempt was
  made to isolate or revert them.
