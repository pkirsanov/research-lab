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

## Regression Phase

Executed by `bubbles.regression` on 2026-07-28 against the working tree at `/home/redacted/research-lab`.
Repository binding preflight was committed before any repository-local read
(`PREFLIGHT_COMMITTED decision=rb:vscode-93b8cbfaa3b47932d280e44f81822c28:17 revision=17
repository=research-lab root=/home/redacted/research-lab`, `actionable: true`).

**Original verdict (2026-07-28 run — SUPERSEDED, retained as the historical record):
⚠️ REGRESSION_DETECTED — 1 unresolved regression (RG-05). This phase is NOT clean.**

**Current verdict (2026-07-29 re-verification): 🟢 REGRESSION_FREE — RG-05 / RG-F1 is RESOLVED.**
RG-05 was root-caused to a cross-spec change owned by feature 012 (Scope 15 registered
`__rlOwnerStateProvider["sector-research-lab"]` in commit `29888533`, which flips resolved `ownerModes`
from `["simple","power"]` to `["power"]` at `rlapp.js:297` and therefore hides `data-simple-target`
sections — including feature 002's brief mount at `sector-research-lab.html:3730`). It was filed as
`specs/012-market-action-center-and-guided-tools/bugs/BUG-003-shell-brief-panel-adoption-hides-feature-002-mount/`
and **fixed by the 012 workstream in commit `8206c89c` ("fix(012/BUG-003): reconcile TP-10-02 to the
shell Brief-view contract")**. Independently re-verified green in this session — isolated re-run exit `0`
(1 pass / 0 fail) and full owned suite exit `0` (**61 tests, 61 pass, 0 fail**, up from 60 pass / 1 fail),
with the `selftest.mjs` baseline unchanged at 952 passed / 0 failed. Fresh raw evidence is recorded below
under **§ RG-05 Resolution — RESOLVED and re-verified (2026-07-29)**.

This section records execution of the `regression` phase only. It does not certify any scope, does not
mark SCOPE-01/02/03 Done, and does not alter feature status. No test file, production `*-lab.html`,
`scripts/`, or `.github/` file was created or modified by this run or by the 2026-07-29 re-verification;
no test was edited by `bubbles.regression` to make it pass.

> **Reading order note.** Everything from `### Regression Findings Summary` through
> `### Regression Phase Uncertainty Declarations` below is the **verbatim 2026-07-28 record** and is
> preserved unedited, including the RG-05 failure output and the RG-F1 P0 routing row. Its RG-05/RG-F1
> conclusions were true at that time and are now superseded by `### RG-05 Resolution` at the end of this
> section. RG-F2 and RG-F3 remain OPEN and are **not** affected by the RG-05 fix.

### Regression Findings Summary

| ID | Check | Exit | Result |
|----|-------|------|--------|
| RG-01 | Baseline `node scripts/selftest.mjs` | 0 | 952 passed / 0 failed — baseline holds |
| RG-02 | `scripts/validate-brief-payload.mjs` | 0 | PASS |
| RG-03 | `scripts/validate-brief-cache.mjs` | 0 | PASS — 357 JSON cache files coherent |
| RG-04 | `scripts/validate-distributed-briefs.mjs --root .` (full) | **1** | compat-projection mismatch — **pre-existing, never-green, not gated** |
| RG-04b | `scripts/validate-distributed-briefs.mjs --root . --graph-only` (production-wired) | 0 | PASS |
| RG-05 | Full owned node suite (37 files) | **1** | 60 pass / **1 FAIL** — **UNRESOLVED REGRESSION** |
| RG-06 | Isolated re-run of the failing file | **1** | Reproduces deterministically — not contention |
| RG-07 | Remaining consumer suites (4 files) | 0 | 33 passed / 0 failed |
| RG-08 | Playwright `distributed-briefs.spec.mjs` re-verify | 0 | 13 passed / 0 failed |
| RG-09 | Coverage / disabled-test scan | 0 | No decrease; 0 unconditional skips |
| RG-10 | `regression-quality-guard.sh` (44 owned files) | 0 | 0 violations / 0 warnings |

### RG-01 — Baseline confirmation

**Command:** `node scripts/selftest.mjs`
**Exit Code:** `0`
**Result:** PASSED — 952 passed, 0 failed (identical to the `test` phase baseline — no coverage decrease)
**Claim Source:** executed

```text
Feature 012 Scope 09 Market Action Center PUBLIC projection + public portfolio matrix
  ✓ rlmarketaction.js owns zero forbidden fetch/providerFetch/storage-write/publisher/LLM capability
  ✓ SCN-012-022 public matrix labels every row `Public watchlist` with one explicit applicable/state cell per domain (never neutral by omission)
  ✓ the composed public matrix validates round-trip and matches the validator row count
  ✓ the public composer refuses a smuggled Feature 008 private field (RLMKT-PRIVACY) and never echoes the private value
  ✓ SCN-012-019 the Center composes exactly four views (brief/portfolio/red-alert/journey), three exact dependency-pending gates, and a truthful no-action Brief that fabricates no action/catalyst/confidence
  ✓ the market-action contract validator reports four views, three pending gates, and seven distinct closed RLMKT-* adversarial refusals

Feature 012 Scope 12 Dynamic Red Alert discovery/qualification/projection
  ✓ SCN-012-023 a dynamically corroborated, market-confirmed, high-severity candidate qualifies with every falsifiable field and an admission score (never a probability/confidence/crash-odds field), publication Feature-002 gated
  ✓ SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title
  ✓ SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic

================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
PIPE_STATUS=0
```

Re-confirmed unchanged at the END of the phase, proving this phase mutated no product surface:

**Command:** `node scripts/selftest.mjs` (post-phase re-run)
**Exit Code:** `0`
**Result:** PASSED — 952 passed, 0 failed
**Claim Source:** executed

```text
=== working tree after regression run (must match pre-run) ===
 M tests/simple-production-bridge.integration.mjs
 M tests/volatility-sizing-lab.spec.mjs
 M volatility-sizing-lab.html
?? specs/014-shared-cycle-and-seasonality-exchange/
?? specs/015-recommendation-outcome-ledger-and-track-record/
?? specs/016-auction-gamma-playbook/

=== confirm NO spec-002 owned test/script/html touched by me ===
 M tests/simple-production-bridge.integration.mjs
 M tests/volatility-sizing-lab.spec.mjs
 M volatility-sizing-lab.html
(empty above = no test/script/html/.github modification)

=== baseline re-confirm ===
Research-Lab self-test: 952 passed, 0 failed
SELFTEST_RECONFIRM_EXIT=0
```

The three modified files are a concurrent session's in-flight work that pre-existed this run and were
left untouched. The tree is byte-identical before and after the regression phase.

### RG-02 / RG-03 / RG-04 — Brief-pipeline consumer validators

**Command:** `node scripts/validate-brief-payload.mjs`
**Exit Code:** `0`
**Result:** PASSED
**Claim Source:** executed

```text
########## RC-01 validate-brief-payload ##########
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
EXIT_validate_brief_payload=0

########## RC-02 validate-distributed-briefs --root . ##########
{
  "ok": false,
  "mode": "full",
  "root": ".",
  "currentGraph": {
    "ok": true,
    "present": true,
    "runId": "dist-2026-07-28-morning-f8a065fe4171",
    "sources": 22
  },
  "historyGraph": {
    "ok": true,
    "present": true,
    "partitions": 26,
    "indexFingerprint": "sha256:49ea1f006cdc03f38ac66d34555c63cda20df985ac198c844c38945edebcaedc"
  },
  "compatibilityProjection": {
    "ok": false,
    "error": {
      "code": "B002-PUBLISH-SET",
      "reason": "compat-projection-run-mismatch",
      "detail": "market-brief.payload.json"
    }
  }
}
EXIT_validate_distributed_briefs=1

########## RC-03 validate-brief-cache ##########
[brief-cache] PASS: 357 JSON cache files parsed; indexes are coherent
EXIT_validate_brief_cache=0
```

`validateCurrentGraph` and `validateHistoryGraph` are both `ok: true` (22 sources, 26 partitions). Only
`validateCompatibilityProjection` fails. Root cause, established by direct inspection:

**Command:** `jq` comparison of pointer vs. the two root compatibility projections
**Exit Code:** `0`
**Result:** Both projections carry NO `runId`/`runFingerprint` field at all
**Claim Source:** executed

```text
=== briefs/current.json runId/runFingerprint ===
{
  "runId": "dist-2026-07-28-morning-f8a065fe4171",
  "runFingerprint": "sha256:f8a065fe41717d9c4ace68befffac7d41751e71b4d3bd835f2b643d58358fc8d",
  "generatedAt": "n/a"
}

=== market-brief.payload.json runId/runFingerprint ===
{
  "runId": "ABSENT",
  "runFingerprint": "ABSENT",
  "asOf": "2026-07-28T15:05:35.834Z"
}

=== market-brief.snapshot.json runId/runFingerprint ===
{
  "runId": "ABSENT",
  "runFingerprint": "ABSENT"
}
```

**Classification: PRE-EXISTING, NEVER-GREEN, NOT GATED — NOT a regression introduced by this spec.**
Traced across every commit that touched `briefs/current.json` back to the first publication of the
pointer: the payload has never carried a `runId`.

**Command:** git history trace of pointer `runId` vs payload `runId`
**Exit Code:** `0`
**Result:** payload `runId` = ABSENT at every revision since the pointer was first published (2026-07-19)
**Claim Source:** executed

```text
=== first commit that added briefs/current.json ===
5f0202c2 market-brief: Tier-A data-only refresh 2026-07-19 21:50 EDT (after-hours)

=== payload runId across history of briefs/current.json commits ===
c90dbfae 2026-07-21 06:39  pointer=dist-2026-07-21-pre-market-b8ea2baf4ab4    payload=ABSENT
81afd836 2026-07-20 22:39  pointer=dist-2026-07-21-pre-market-9f57939db7b4    payload=ABSENT
f5612a13 2026-07-20 16:50  pointer=dist-2026-07-20-after-hours-5cd53a332187   payload=ABSENT
f55eb5db 2026-07-20 13:56  pointer=dist-2026-07-20-pre-close-26586eecfe58     payload=ABSENT
16c27ac3 2026-07-20 11:55  pointer=dist-2026-07-20-morning-7dc07754ebc8       payload=ABSENT
979a70f1 2026-07-20 07:58  pointer=dist-2026-07-20-pre-market-791b304ad508    payload=ABSENT
55f8eacb 2026-07-20 04:24  pointer=dist-2026-07-20-pre-market-9d79094028fd    payload=ABSENT
5f0202c2 2026-07-19 18:50  pointer=dist-2026-07-19-after-hours-2116a85fb14a   payload=ABSENT
```

The only production wiring of this CLI is `scripts/brief-refresh-and-push.sh:360`, which invokes it with
`--graph-only` — a mode that *skips* the compatibility-projection check. Full mode has therefore never
been exercised against the real repository root by any gate.

**Command:** `node scripts/validate-distributed-briefs.mjs --root . --graph-only`
**Exit Code:** `0`
**Result:** PASSED — the production-wired invocation is green
**Claim Source:** executed

```text
=== production-wired invocation (brief-refresh-and-push.sh:360) ===
  if "$NODE_BIN" scripts/brief-distributed-publish.mjs --root . "${tool_bundle_args[@]}" \
    && "$NODE_BIN" scripts/validate-distributed-briefs.mjs --root . --graph-only; then
    DISTRIBUTED_OK=1
    echo "[brief-timer] distributed briefs/ graph generated + graph-validated — will ride the same commit"

########## RC-04 validate-distributed-briefs --root . --graph-only ##########
{
  "ok": true,
  "mode": "graph-only",
  "root": ".",
  "currentGraph": {
    "ok": true,
    "present": true,
    "runId": "dist-2026-07-28-morning-f8a065fe4171",
    "sources": 22
  },
  "historyGraph": {
    "ok": true,
    "present": true,
    "partitions": 26,
    "indexFingerprint": "sha256:49ea1f006cdc03f38ac66d34555c63cda20df985ac198c844c38945edebcaedc"
  },
  "compatibilityProjection": {
    "ok": true,
    "skipped": true,
    "reason": "graph-only"
  }
}
EXIT_graph_only=0
```

This remains a genuine latent contract gap against the Scope-09 evidence-first publication intent
(`validateCompatibilityProjection(root) -> payload/snapshot represent the same current run`), and is
recorded below as an open finding — but it is **not** a regression caused by this spec's implement or
test phases.

### RG-05 — UNRESOLVED REGRESSION: full owned node-runner suite

The `test` phase executed only 3 of the 37 node-runner `distributed-briefs*` files. This phase executed
**all 37**, which is where the regression surfaced.

**Command:** `node --test $(ls tests/distributed-briefs*.mjs | grep -v '\.spec\.mjs$')`
**Exit Code:** `1`
**Result:** **FAILED — 61 tests, 60 pass, 1 fail, 0 skipped, 0 todo**
**Claim Source:** executed

```text
✔ Regression: SCN-002-010 evidence then owners then all briefs then final then atomic publish commit and push (615.97447ms)
✔ Regression: SCN-002-011 every required-phase failure leaves prior current authority unchanged (1101.378534ms)
✔ Regression: SCN-002-012 duplicate and push-only retries reuse exact bytes and preserve dirty root (1268.073927ms)
✔ scheduler publishes one exact run through isolated worktree commit and temporary remote (737.582087ms)
distributed-briefs.scheduler.stress: PASS (concurrent duplicates + crash-resume within budgets)
✔ tests/distributed-briefs.scheduler.stress.mjs (1434.63981ms)
✔ SCN-002-010: run state permits only evidence freeze reads authors final publish commit and push order (1.2719ms)
✔ SCN-002-010: manifest inventory and pointer-last generation share one run identity (26.307082ms)
✖ static loader verifies coherent current objects and fetches history only after selection (17852.706812ms)
✔ tests/distributed-briefs.support.mjs (111.143424ms)
✔ Canary: enabled source pages render briefs and retain controls/RLDATA/credential lifecycle; the aggregator stays idle (38382.069355ms)
ℹ tests 61
ℹ suites 0
ℹ pass 60
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 44483.672321

✖ failing tests:

test at tests/distributed-briefs.static.integration.mjs:13:1
✖ static loader verifies coherent current objects and fetches history only after selection (17852.706812ms)
  page.waitForSelector: Timeout 15000ms exceeded.
  Call log:
    - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible
      32 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>
      at TestContext.<anonymous> (/home/redacted/research-lab/tests/distributed-briefs.static.integration.mjs:27:20) {
    name: 'TimeoutError',
  }
EXIT_all_distributed_briefs_node=1
```

The mount is present and settled (`data-rlbrief-ready="1"`, `data-rlbrief-state="ready"`) but **hidden**.

### RG-06 — Isolation: the failure is deterministic, not contention

The 37-file run launches many concurrent Chromium instances, so contention had to be excluded before
classifying. Re-run alone, the failure reproduces identically.

**Command:** `node --test tests/distributed-briefs.static.integration.mjs`
**Exit Code:** `1`
**Result:** **FAILED — 1 test, 0 pass, 1 fail. Identical error. Not a contention artifact.**
**Claim Source:** executed

```text
########## RC-06 ISOLATED re-run of the failing file ##########
✖ static loader verifies coherent current objects and fetches history only after selection (16302.737323ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 16419.828119

✖ failing tests:

test at tests/distributed-briefs.static.integration.mjs:13:1
✖ static loader verifies coherent current objects and fetches history only after selection (16302.737323ms)
  page.waitForSelector: Timeout 15000ms exceeded.
  Call log:
    - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible
      32 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>
      at TestContext.<anonymous> (/home/redacted/research-lab/tests/distributed-briefs.static.integration.mjs:27:20) {
    name: 'TimeoutError',
  }
EXIT_static_integration_isolated=1
```

### RG-05 root cause — cross-spec shell change with a PARTIAL spec-002 remediation

The failure is the **same root cause** this spec already diagnosed and fixed once — but the fix landed on
only one of the two affected test surfaces.

**Command:** `git log` on the rlviews shell commit and this spec's own remediation commit
**Exit Code:** `0`
**Result:** Spec-012 shell change hides the brief in the default view; spec-002's fix updated only the Playwright spec
**Claim Source:** executed

```text
=== rlviews shell commit 1b89bada ===
1b89bada 2026-07-27 00:35:44 +0000 test(BUG-003): independent re-verification — spec-012 experience-shell regression blocks; route_required

commit bd239938690c6ad8c3129c343e65f3c9316dbaeb
Date:   Mon Jul 27 07:30:39 2026 +0000
    fix(002): green Scope-10 shared-UI acceptance — brief mount reveal under four-view shell

    The rlviews 'brief lives only in Brief view' shell (present since 1b89bada) moves
    an ordinary tool's brief anchor into a data-rlexperience-panel="brief" placeholder
    that is hidden/display:none in the default 'simple' view. The Scope-10 mountReady
    helper waited for the mount VISIBLE in the boot view and never switched to Brief,
    so all 11 ordinary-tool acceptance tests timed out (0/13).

    - tests/distributed-briefs.spec.mjs: mountReady drives the REAL reveal contract
      (wait #rlviews shell ready -> click Brief-view tab -> assert visible)

 rlbrief.js                                         |  8 +++-
 .../10-shared-ui-and-pages-acceptance/report.md    | 49 ++++++++++++++++++++++
 tests/distributed-briefs.spec.mjs                  |  7 ++++
 3 files changed, 63 insertions(+), 1 deletion(-)
```

The remediation touched `tests/distributed-briefs.spec.mjs` only. `tests/distributed-briefs.static.integration.mjs`
(TP-10-02) was left on the pre-shell wait pattern:

**Command:** comparison of the reveal contract in the fixed vs. unfixed surface
**Exit Code:** `0`
**Result:** Playwright spec drives the shell reveal; the node integration still uses the naive wait at lines 27 and 81
**Claim Source:** executed

```text
=== does the FIXED playwright spec use the reveal contract? ===
19:async function mountReady(page, ctx, toolId) {
20-    await page.goto(harnessUrl(ctx.server.baseUrl, toolId), { waitUntil: 'load' });
21-    // The shared brief renders inside the shell's "Brief" view (feat(brief): brief lives only in Brief
22-    // view). Ordinary tools boot in their default "simple" view, so drive the real rlviews control to the
23-    // Brief view — exactly as every other shell regression does — before asserting the brief is visible.
24-    await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 20000 });
25-    await page.locator('#rlviews button[data-rlview-mode="brief"]').click();
26-    await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 20000 });
27-}

=== does the FAILING node integration use the reveal contract? ===
27:        await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
46:        await page.waitForSelector('[data-rlbrief-part="price"]', { timeout: 5000 });
54:        await page.waitForSelector('#rlbrief-hist-select', { timeout: 8000 });
61:        await page.waitForSelector('[data-rlbrief-part="history-timeline"]', { timeout: 8000 });
81:        await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
```

`tests/distributed-briefs.static.integration.mjs` contains **no** reference to `#rlviews`, the Brief-view
tab, or a `mountReady` helper. It waits for the mount to be visible in the boot (`simple`) view — exactly
the pattern commit `bd239938` documented as timing out under the four-view shell.

**Finding RG-05 (OPEN, UNRESOLVED):** `tests/distributed-briefs.static.integration.mjs` (TP-10-02,
Scope 10) fails deterministically at lines 27 and 81 because it was not migrated to the shell reveal
contract when `tests/distributed-briefs.spec.mjs` was. The regression originates from a cross-spec
change (spec-012 experience shell, `1b89bada`) and this spec's remediation covered only one of the two
affected surfaces. **Not repaired here** — `bubbles.regression` is diagnostic and MUST NOT edit a test to
make it pass. Routed to `bubbles.implement` (owner of `tests/distributed-briefs.static.integration.mjs`)
to apply the same reveal contract already proven in `tests/distributed-briefs.spec.mjs`.

**Why the `test` phase did not catch it:** that phase executed `distributed-briefs.contract.mjs`,
`distributed-briefs.support.mjs`, and `distributed-briefs.consumer-trace.mjs` only —
`distributed-briefs.static.integration.mjs` was never run.

### RG-07 — Remaining brief/tool-read consumer suites

**Command:** `node --test tests/market-session-evidence.foundation.e2e.mjs tests/market-session-evidence.foundation.functional.mjs tests/market-session-evidence.source.e2e.mjs tests/brief-refresh-atomicity.test.mjs`
**Exit Code:** `0`
**Result:** PASSED — 33 passed, 0 failed, 0 skipped, 0 todo
**Claim Source:** executed

```text
To /tmp/research-lab-bug002-Lf13uf/remote.git
 * [new branch]      main -> main
Switched to a new branch 'main'
To /tmp/research-lab-bug002-CcjT8d/remote.git
   0f3ee13..b9ec3ca  main -> main
From /tmp/research-lab-bug002-CcjT8d/remote
   b9ec3ca..38eaa84  main       -> origin/main
ℹ tests 33
ℹ suites 0
ℹ pass 33
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 28083.296986
EXIT_consumer_suites=0
```

(The git chatter is the atomicity suite driving isolated temporary repositories under `/tmp` — no
repository-local git state was touched.)

### RG-08 — e2e-ui baseline re-verified

**Command:** `npx playwright test tests/distributed-briefs.spec.mjs --project=system-chrome --reporter=list`
**Exit Code:** `0`
**Result:** PASSED — 13 passed, 0 failed (matches the `test` phase; no e2e-ui regression)
**Claim Source:** executed

```text
Running 13 tests using 1 worker

  ✓   1 …wer keep official close separate and disclose comparable volume (591ms)
  ✓   2 … the exact published pre-market thesis with owner read evidence (356ms)
  ✓   3 …inal never labels a partial regular print as the official close (382ms)
  ✓   4 …erve official close and label every post-close print indicative (447ms)
  ✓   5 … strips use explicit calendar boundaries and next valid session (604ms)
  ✓   6 …ming to released without stale actual or post-release consensus (694ms)
  ✓   7 …ay separate and revisions append without rewriting the original (704ms)
  ✓   8 … and history exclude look-ahead and retain immutable chronology (465ms)
  ✓   9 …ed unusual evidence remains context and consumes no action slot (400ms)
  ✓  10 …emains truthful and non-current failures cannot replace current (722ms)
  ✓  11 …fetches only the selected partition and opened evidence objects (452ms)
  ✓  12 …ory UI is accessible safe and stable at desktop mobile and zoom (521ms)
  ✓  13 …y source receives the shared mount with no page-specific branch (276ms)

  13 passed (8.4s)
EXIT_playwright_distributed_briefs=0
```

### RG-09 — Coverage decrease and disabled/skipped-test scan

**Command:** `grep -nE '\.skip\(|\.todo\(|\.only\(|test\.fixme|xit\(|xdescribe' tests/distributed-briefs*.mjs tests/market-session-evidence*.mjs tests/released-report-evidence*.mjs`
**Exit Code:** `0`
**Result:** No coverage decrease. Zero unconditional skip/only/todo/fixme. Two conditional environment guards, both of which actually EXECUTED this run.
**Claim Source:** executed

```text
=== skip/todo/only markers in spec-002 owned tests ===
tests/distributed-briefs.authorship.stress.mjs:103:  process.exit(failures ? 1 : 0);
tests/distributed-briefs.authorship.stress.mjs:106:main().catch((error) => { console.error('stress harness threw:', error); process.exit(1); });
tests/distributed-briefs.history.load.mjs:86:process.exit(failures ? 1 : 0);
tests/distributed-briefs.scheduler.stress.mjs:87:main().catch((error) => { console.error('distributed-briefs.scheduler.stress: FAIL', error); process.exit(1); });
tests/distributed-briefs.static.integration.mjs:15:    try { ({ chromium } = await loadPlaywright()); } catch (e) { t.skip('Playwright runtime unavailable'); return; }
tests/distributed-briefs.ui-canary.mjs:18:    try { ({ chromium } = await loadPlaywright()); } catch (e) { t.skip('Playwright runtime unavailable'); return; }

=== count of conditional Playwright-unavailable guards ===
tests/distributed-briefs.static.integration.mjs:1
tests/distributed-briefs.ui-canary.mjs:1
```

Coverage delta assessment:

- `selftest.mjs` total is **952 passed / 0 failed**, identical to the `test` phase baseline — no decrease.
- The 37-file node run reported `skipped 0` and `todo 0` — nothing was disabled to obtain green.
- The four `process.exit(...)` hits above are stress/load harness exit codes, not skip markers.
- The two `t.skip('Playwright runtime unavailable')` lines are conditional environment guards. In this
  run Playwright **was** available and both files genuinely executed (`static.integration` failed,
  `ui-canary` passed in 38.4s), so neither skipped. Flagged as a latent silent-pass vector: on a host
  without a Playwright runtime, both node-runner UI tests would skip and the suite would still report
  green. Advisory only; recorded as open finding RG-F3 (P2, owner `bubbles.plan`) in
  `### Regression Phase Open Findings` below. Its provenance — that these guards predate this spec's
  regression phase rather than being added by it, and the exact evidence that does and does not support
  that — is stated under `## Historical Notes` at the end of this report.

### RG-10 — Silent-pass / adversarial guard

**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --verbose tests/distributed-briefs.spec.mjs tests/distributed-briefs.static.integration.mjs tests/distributed-briefs.contract.mjs tests/distributed-briefs.consumer-trace.mjs tests/distributed-briefs.support.mjs`
**Exit Code:** `0`
**Result:** PASSED — 0 violations, 0 warnings across the 5 required regression surfaces
**Claim Source:** executed

```text
========================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /home/redacted/research-lab
  Timestamp: 2026-07-28T18:00:51Z
  Bugfix mode: false
========================================================

ℹ️  Scanning tests/distributed-briefs.spec.mjs
ℹ️  Scanning tests/distributed-briefs.static.integration.mjs
ℹ️  Scanning tests/distributed-briefs.contract.mjs
ℹ️  Scanning tests/distributed-briefs.consumer-trace.mjs
ℹ️  Scanning tests/distributed-briefs.support.mjs

========================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 5
========================================================
EXIT_regression_quality_guard=0
```

Extended to the complete owned surface:

**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh tests/distributed-briefs*.mjs tests/market-session-evidence*.mjs tests/released-report-evidence*.mjs`
**Exit Code:** `0`
**Result:** PASSED — 0 violations, 0 warnings across all 44 owned test files
**Claim Source:** executed

```text
ℹ️  Scanning tests/distributed-briefs.scheduler.integration.mjs
ℹ️  Scanning tests/distributed-briefs.scheduler.stress.mjs
ℹ️  Scanning tests/distributed-briefs.scheduler.unit.mjs
ℹ️  Scanning tests/distributed-briefs.spec.mjs
ℹ️  Scanning tests/distributed-briefs.static.integration.mjs
ℹ️  Scanning tests/distributed-briefs.support.mjs
ℹ️  Scanning tests/distributed-briefs.ui-canary.mjs
ℹ️  Scanning tests/market-session-evidence.foundation.e2e.mjs
ℹ️  Scanning tests/market-session-evidence.foundation.functional.mjs
ℹ️  Scanning tests/market-session-evidence.functional.mjs
ℹ️  Scanning tests/market-session-evidence.source.e2e.mjs
ℹ️  Scanning tests/market-session-evidence.unit.mjs
ℹ️  Scanning tests/released-report-evidence.e2e.mjs

========================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 44
========================================================
EXIT_regression_quality_guard_all=0
```

### Regression Phase Open Findings (routing required)

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| RG-F1 | **P0 — blocks a clean regression phase** | `tests/distributed-briefs.static.integration.mjs` (TP-10-02) fails deterministically: it waits for the brief mount to be visible in the boot `simple` view, but the spec-012 rlviews four-view shell (`1b89bada`) hides the brief outside the Brief view. Spec-002's own fix `bd239938` migrated only `tests/distributed-briefs.spec.mjs` to the reveal contract; this file was not migrated. | `bubbles.implement` |
| RG-F2 | P1 — latent contract gap, pre-existing | `node scripts/validate-distributed-briefs.mjs --root .` (full mode) exits 1 with `compat-projection-run-mismatch`: `market-brief.payload.json` / `market-brief.snapshot.json` carry no `runId`/`runFingerprint` and have never carried one since the pointer was first published (2026-07-19). Only `--graph-only` is production-wired, so full mode is ungated. Contradicts the Scope-09 evidence-first publication intent. | `bubbles.design` / `bubbles.plan` |
| RG-F3 | P2 — advisory, pre-existing | `distributed-briefs.static.integration.mjs` and `distributed-briefs.ui-canary.mjs` guard on `t.skip('Playwright runtime unavailable')`. On a host without Playwright both node-runner UI tests would silently skip and the suite would still report green. | `bubbles.plan` |

### Regression Phase Scope and Limits

| Dimension | Result |
|-----------|--------|
| Baseline | `selftest` 952/0 before and after — unchanged, no coverage decrease |
| Owned node-runner suites executed | 37 of 37 (`distributed-briefs*`, excluding the Playwright `.spec.mjs`) |
| Consumer suites executed | 4 (`market-session-evidence` foundation/source, `brief-refresh-atomicity`) |
| Pipeline validators executed | 4 invocations across 3 validator scripts |
| e2e-ui re-verified | `distributed-briefs.spec.mjs` 13/13 |
| Guard sweep | 44 files, 0 violations |
| **Genuine unresolved regressions** | **1 (RG-F1)** |
| Pre-existing non-regression findings | 2 (RG-F2, RG-F3) |
| Test files modified | **None** |
| Verdict | **⚠️ REGRESSION_DETECTED** |

### Regression Phase Uncertainty Declarations

- **Cross-spec attribution is evidence-based but not exhaustive.** RG-F1 is attributed to the interaction
  between spec-012's shell commit `1b89bada` and spec-002's partial remediation `bd239938`, based on the
  remediation commit message, the diff stat (which files it touched), and direct inspection of the two
  test surfaces. A full bisect across every intervening commit was **not** performed, so the exact first
  failing commit for this specific file is not pinned by execution evidence.
- **Historical green state for TP-10-02 is not proven by execution.** No prior recorded run of
  `tests/distributed-briefs.static.integration.mjs` was located in this spec's artifacts, so it is not
  established by evidence whether the file ever passed after `1b89bada`. It is currently failing
  deterministically; whether it is a *newly broken* or a *never-fixed* surface is asserted only from the
  commit record, not from a re-executed historical run.
- **RG-F2 is not gate-observable.** Because production wires only `--graph-only`, the full-mode failure is
  invisible to every existing gate. The claim that it has "never been green" rests on the git trace of the
  payload's absent `runId`, not on a recorded historical run of full mode.
- **Suites outside the owned surface were not run.** Specs 012-016 and unrelated tool suites were not
  executed beyond their inclusion in `selftest.mjs`; no claim is made about them.
- **Concurrent working-tree state.** All commands ran with another session's uncommitted modifications to
  `tests/simple-production-bridge.integration.mjs`, `tests/volatility-sizing-lab.spec.mjs`, and
  `volatility-sizing-lab.html` present. None of the failing or passing surfaces above import those files.
  No attempt was made to isolate or revert them.

**This phase does NOT claim completion.** RG-F1 is an open, unresolved regression in a surface this spec
owns. `dodComplete` and `certified` are recorded `false`. No scope was marked Done, SCOPE-01/02/03 are
unchanged, feature status remains `in_progress`, and `certification.*` was not written.

---

### RG-05 Resolution — RESOLVED and re-verified (2026-07-29)

> **Scope of this subsection.** Everything above this line is the verbatim 2026-07-28 record and was not
> edited. This subsection is purely additive and supersedes exactly three earlier statements:
> (1) the `RG-05` row of `### Regression Findings Summary` (`60 pass / 1 FAIL — UNRESOLVED REGRESSION`),
> (2) the `RG-F1` row of `### Regression Phase Open Findings (routing required)` (P0), and
> (3) the `Genuine unresolved regressions | 1 (RG-F1)` and `Verdict | ⚠️ REGRESSION_DETECTED` rows of
> `### Regression Phase Scope and Limits`, plus the immediately preceding
> "**This phase does NOT claim completion**" paragraph insofar as it rests on RG-F1.
> **RG-F2 and RG-F3 are NOT superseded — both remain OPEN** and still require routing.

Re-verified by `bubbles.regression` on 2026-07-29 against the working tree at `/home/redacted/research-lab`.
Repository binding preflight was committed before any repository-local read
(`PREFLIGHT_COMMITTED decision=rb:vscode-93b8cbfaa3b47932d280e44f81822c28:30 revision=30
repository=research-lab root=/home/redacted/research-lab`, `actionable: true`).

#### Root cause (confirmed) and ownership

The 2026-07-28 record attributed RG-05 to the interaction between the spec-012 rlviews shell commit
`1b89bada` and spec-002's partial remediation `bd239938`, and explicitly flagged that attribution as an
Uncertainty Declaration ("Cross-spec attribution is evidence-based but not exhaustive… a full bisect was
**not** performed"). That uncertainty has since been discharged, and the **precise** root cause is
narrower than the 2026-07-28 hypothesis:

Feature 012 Scope 15's Simple-adapter wiring registered `__rlOwnerStateProvider["sector-research-lab"]`
(commit `29888533 feat(012/scope-15): wire sector-research Simple adapter`). That provider flips the
resolved `ownerModes` for the tool from `["simple","power"]` to `["power"]` at `rlapp.js:297`, which
hides every `data-simple-target` section on the page. Feature 002's brief mount at
`sector-research-lab.html:3730` is exactly such a section — hence a mount that was present and settled
(`data-rlbrief-ready="1"`, `data-rlbrief-state="ready"`) but **hidden**, matching the observed
`page.waitForSelector … to be visible` timeout verbatim.

Because the defect originated in feature 012's adapter wiring, ownership routed to the 012 workstream and
was filed as
`specs/012-market-action-center-and-guided-tools/bugs/BUG-003-shell-brief-panel-adoption-hides-feature-002-mount/`.
`bubbles.regression` did **not** repair it (diagnostic agent; MUST NOT edit a test to make it pass) and
did not author or edit the BUG-003 packet in this session.

**Command:** `git log -1 --format='%H%n%s%n%ad' 8206c89c` + `git show --stat --format='' 8206c89c` + `git log -1 --format='%h %s' 29888533`
**Exit Code:** `0`
**Result:** Both commits confirmed present in history; `8206c89c` is the BUG-003 fix and touches only the BUG-003 packet plus the one previously-failing test file
**Claim Source:** executed

```text
=== fixing commit ===
8206c89c7247ba2d8e5652663ffdb06c19a83a57
fix(012/BUG-003): reconcile TP-10-02 to the shell Brief-view contract
Tue Jul 28 19:34:55 2026 +0000

=== files touched by 8206c89c ===
 .../bug.md                                         | 165 +++++++++++
 .../design.md                                      | 198 +++++++++++++
 .../report.md                                      | 318 +++++++++++++++++++++
 .../scopes.md                                      | 223 +++++++++++++++
 .../spec.md                                        |  90 ++++++
 .../state.json                                     | 137 +++++++++
 .../uservalidation.md                              |  13 +
 tests/distributed-briefs.static.integration.mjs    |  13 +
 8 files changed, 1157 insertions(+)

=== root-cause commit 29888533 ===
29888533 feat(012/scope-15): wire sector-research Simple adapter
```

The fix is additive only (`13 +`, zero deletions in
`tests/distributed-briefs.static.integration.mjs`): it migrates TP-10-02 onto the same real shell reveal
contract already proven in `tests/distributed-briefs.spec.mjs` — wait for `#rlviews[data-rlexperience-shell="ready"]`,
click the real `#rlviews button[data-rlview-mode="brief"]` control, then assert the mount visible. No
assertion was weakened, no wait was removed, and no skip/bailout was introduced.

**Command:** `grep -n 'rlviews\|rlview-mode\|data-rlbrief-mount' tests/distributed-briefs.static.integration.mjs`
**Exit Code:** `0`
**Result:** TP-10-02 now drives the real reveal control at lines 20–21 before both mount waits (lines 39, 94)
**Claim Source:** executed

```text
=== working tree ===
 M specs/002-distributed-tool-briefs-and-history/report.md
?? specs/014-shared-cycle-and-seasonality-exchange/
?? specs/015-recommendation-outcome-ledger-and-track-record/
?? specs/016-auction-gamma-playbook/

=== HEAD ===
02a2e7f2 (HEAD -> main) docs(BUG-003): record regression phase — REGRESSION_FREE
ab2fd212 fix(tests): eliminate driveSimple sampling race in adapter suite
4b587277 docs: record code-index DECLINE decision for research-lab

=== the reveal-contract fix now present in the previously-failing file ===
14:// view). Ordinary tools boot in their default "simple" view, so drive the real rlviews control to the
20:    await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 20000 });
21:    await page.locator('#rlviews button[data-rlview-mode="brief"]').click();
39:        await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
41:        const state = await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state');
94:        await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
95:        const st = await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state');
```

#### RV-01 — Isolated re-run of the previously-failing file (supersedes RG-06)

The 2026-07-28 record established this failure was deterministic in isolation, not contention. The same
isolated invocation now passes.

**Command:** `node --test tests/distributed-briefs.static.integration.mjs`
**Exit Code:** `0`
**Result:** **PASSED — 1 test, 1 pass, 0 fail, 0 skipped, 0 todo.** Was 0 pass / 1 fail on 2026-07-28.
**Claim Source:** executed

```text
########## RV-01 ISOLATED re-run of the previously-failing file ##########
HEAD=02a2e7f2  fixing-commit-present=yes
✔ static loader verifies coherent current objects and fetches history only after selection (2164.637393ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2272.633408
EXIT_static_integration_isolated_reverify=0
```

Note the `skipped 0`: the conditional `t.skip('Playwright runtime unavailable')` guard flagged as RG-F3
did **not** fire, so this is a genuine execution of the assertion body, not a silent environment skip.

#### RV-02 — Full owned node-runner suite (supersedes RG-05)

The identical 37-file invocation that produced the RG-05 failure now passes in full.

**Command:** `node --test $(ls tests/distributed-briefs*.mjs | grep -v '\.spec\.mjs$')`
**Exit Code:** `0`
**Result:** **PASSED — 61 tests, 61 pass, 0 fail, 0 skipped, 0 todo.** Was 60 pass / 1 fail on 2026-07-28 — the delta is exactly the one previously-failing test, with no test count lost.
**Claim Source:** executed

```text
✔ Regression: SCN-002-012 duplicate and push-only retries reuse exact bytes and preserve dirty root (872.482717ms)
✔ scheduler publishes one exact run through isolated worktree commit and temporary remote (752.776645ms)
distributed-briefs.scheduler.stress: PASS (concurrent duplicates + crash-resume within budgets)
✔ tests/distributed-briefs.scheduler.stress.mjs (1071.482283ms)
✔ SCN-002-010: run state permits only evidence freeze reads authors final publish commit and push order (2.107399ms)
✔ SCN-002-010: manifest inventory and pointer-last generation share one run identity (21.653386ms)
✔ static loader verifies coherent current objects and fetches history only after selection (4126.130639ms)
✔ tests/distributed-briefs.support.mjs (177.907682ms)
✔ Canary: enabled source pages render briefs and retain controls/RLDATA/credential lifecycle; the aggregator stays idle (43791.501097ms)
ℹ tests 61
ℹ suites 0
ℹ pass 61
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 49770.543474
EXIT_B=0
```

Test-count parity is the anti-regression check that matters here: the suite reports the **same 61 tests**
as the failing run, with `skipped 0` and `todo 0`. Green was not obtained by deleting, skipping, or
disabling the previously-failing test — the same test now emits `✔` (visible in the tail above, directly
above `tests/distributed-briefs.support.mjs`). The single recovered assertion is the RG-05 cross-feature
regression, filed as `BUG-003` at
`specs/012-market-action-center-and-guided-tools/bugs/BUG-003-shell-brief-panel-adoption-hides-feature-002-mount/`
and fixed by the feature-012 workstream in commit `8206c89c`; the recovery is therefore attributable to
that filed-and-fixed change, not to any coverage change made in this spec. Its disposition row is
`## Discovered Issues` (`2026-07-29`) at the end of this report.

#### RV-03 — Baseline re-confirmation (no coverage decrease)

**Command:** `node scripts/selftest.mjs`
**Exit Code:** `0`
**Result:** PASSED — 952 passed, 0 failed — byte-for-byte identical to both the `test` phase baseline (TPE-01) and the 2026-07-28 regression baseline (RG-01). No coverage decrease.
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
EXIT_C_PIPESTATUS=0
```

#### Re-verification finding table

| ID | Check | Exit | Result |
|----|-------|------|--------|
| RV-01 | Isolated `tests/distributed-briefs.static.integration.mjs` | `0` | 1 pass / 0 fail — **RG-06 superseded** |
| RV-02 | Full owned node suite (37 files) | `0` | **61 tests, 61 pass, 0 fail** — **RG-05 / RG-F1 RESOLVED** |
| RV-03 | Baseline `node scripts/selftest.mjs` | `0` | 952 passed / 0 failed — unchanged, no coverage decrease |

#### Updated open-findings state

| ID | Severity | State after 2026-07-29 re-verification |
|----|----------|-----------------------------------------|
| RG-F1 | ~~P0~~ | **CLOSED.** Root-caused to feature 012 Scope 15 (`29888533`), filed as feature-012 `BUG-003`, fixed by `8206c89c`, re-verified green by RV-01 + RV-02. |
| RG-F2 | P1 | **STILL OPEN.** `node scripts/validate-distributed-briefs.mjs --root .` full mode still exits 1 with `compat-projection-run-mismatch`; unchanged by this fix. Owner `bubbles.design` / `bubbles.plan`. |
| RG-F3 | P2 | **STILL OPEN.** The `t.skip('Playwright runtime unavailable')` guards remain a latent silent-pass vector on a host without a Playwright runtime; unchanged by this fix (both guards were dormant in RV-01/RV-02 — Playwright was available and the bodies genuinely executed). Owner `bubbles.plan`. |

#### Re-verification uncertainty declarations

- **Attribution to `29888533` was inherited, not independently bisected in this session.** This session
  confirmed by execution that `29888533` and `8206c89c` exist in history, that `8206c89c` is additive-only
  on the test surface, and that the previously-failing assertion now passes. It did **not** re-run a
  bisect to prove that `29888533` is the first commit at which the mount became hidden. That causal claim
  is carried from the BUG-003 packet and the commit record, not re-derived here by execution.
- **This subsection asserts nothing about the BUG-003 packet's own artifacts.** `specs/012-*` was read-only
  in this session (`git log`/`git show` metadata only); the packet is being edited concurrently by another
  session and its internal DoD/certification state is not evaluated or claimed here.
- **Only the RG-05 surface was re-run.** RG-02/RG-03/RG-04, RG-07, RG-08, RG-09, and RG-10 were **not**
  re-executed on 2026-07-29; their 2026-07-28 results stand as recorded. RG-F2's continued-open status is
  asserted from the absence of any intervening change to the validator or payload surfaces, not from a
  fresh full-mode validator run.
- **Concurrent working-tree state.** RV-01/RV-02/RV-03 ran with another session's untracked
  `specs/014-*`, `specs/015-*`, and `specs/016-*` directories present. None of the executed surfaces
  import them, and none were read or modified.

#### Post-re-verification tree integrity

The only tracked file this re-verification modified is
`specs/002-distributed-tool-briefs-and-history/report.md` (this section) plus
`specs/002-distributed-tool-briefs-and-history/state.json` (phase recording). No test file, no
`*-lab.html`, no `rlapp.js`, no `scripts/`, no `.github/`, and nothing under `specs/012-*`, `specs/013-*`,
`specs/014-*`, `specs/015-*`, or `specs/016-*` was created or modified by `bubbles.regression`.

**Resolved verdict: 🟢 REGRESSION_FREE for RG-05/RG-F1** — fixed by commit `8206c89c`
("fix(012/BUG-003): reconcile TP-10-02 to the shell Brief-view contract"), independently re-verified in
this session by RV-01 (exit `0`, 1/1) and RV-02 (exit `0`, **61/61**) with the RV-03 baseline unchanged at
952/0. RG-F2 (P1) and RG-F3 (P2) remain OPEN and still require routing, so this section does **not** claim
a clean bill of health for the whole feature.

**This subsection still does NOT claim completion.** `dodComplete` and `certified` are recorded `false`
for the `regression` phase. No scope was marked Done, SCOPE-01/02/03 are unchanged, feature status remains
`in_progress`, and `certification.*` was not written — certification remains owned by `bubbles.validate`.

---

## Historical Notes

Provenance record for the two findings whose supporting language is a statement of the repository's prior
state rather than a description of work this spec chose not to do. Both are still **OPEN** in
`### Regression Phase Open Findings` and `#### Updated open-findings state` above. Nothing in this section
closes, waives, re-dispositions, or claims a fix for either one.

### RG-F2 / RG-04 — full-mode `validate-distributed-briefs.mjs` compat-projection mismatch

`node scripts/validate-distributed-briefs.mjs --root .` exits `1` with
`B002-PUBLISH-SET / compat-projection-run-mismatch` because `market-brief.payload.json` and
`market-brief.snapshot.json` carry no `runId` / `runFingerprint` field while `briefs/current.json` does.
Per the recorded git trace, the payload has carried no `runId` since the pointer was first published on
2026-07-19, and production wires only `--graph-only`, so full mode is bound by no existing gate. The
mismatch is therefore historical: it is pre-existing and not introduced by this spec, and the 2026-07-28
regression phase is the first run that *recorded* it, not the change that *created* it.

**Truth boundary.** The "never green" characterisation rests on the git trace of the payload's absent
`runId`, not on a re-executed historical full-mode run — already declared verbatim in
`### Regression Phase Uncertainty Declarations` ("RG-F2 is not gate-observable"). This section restates
that provenance; it does not upgrade it to an executed claim. Full mode was also **not** re-run on
2026-07-29, so RG-F2's continued-open status is asserted from the absence of any intervening change to the
validator or payload surfaces.

**Still OPEN.** RG-F2 (P1), owner `bubbles.design` / `bubbles.plan`. Not fixed here.

### RG-F3 — conditional `t.skip('Playwright runtime unavailable')` environment guards

`tests/distributed-briefs.static.integration.mjs` and `tests/distributed-briefs.ui-canary.mjs` each open
their UI assertion with `t.skip('Playwright runtime unavailable')` on a runtime-load failure. On a host
without a Playwright runtime both node-runner UI tests would skip and the suite would still report green —
a latent silent-pass vector. Advisory, pre-existing, and not introduced by this spec.

**Truth boundary.** "Not introduced by this spec" is supported here by this report's own recorded fact that
**zero test files were modified** by either the 2026-07-28 regression phase
(`### Regression Phase Scope and Limits` → `Test files modified: **None**`) or the 2026-07-29
re-verification (`#### Post-re-verification tree integrity`). It is **not** supported by a `git blame` of
when the guards were first added; no such command was executed in either session.

**Observed dormant, never exercised.** In RG-09, RV-01, and RV-02 a Playwright runtime *was* available and
both bodies genuinely executed (`skipped 0` in every run), so neither guard fired. The silent-pass vector
is a property of a Playwright-less host, which this feature has never exercised on record.

**Still OPEN.** RG-F3 (P2), owner `bubbles.plan`. Not fixed here.

### Why RG-F2 and RG-F3 carry no `## Discovered Issues` row

Neither has a tracked artifact yet, so no honest disposition token applies to them: no bug/spec/ops
artifact exists on disk for either, and no transition packet naming an owner was emitted. Their recorded
state is the OPEN row in the finding tables above with a named owner. Creating those artifacts is a filing
action that this report-only edit did not perform, and it remains owed to `bubbles.design` /
`bubbles.plan`. Recording that honestly is preferred over writing a disposition token this session cannot
substantiate.

## Discovered Issues

| Observed | Description | Disposition | Reference |
|---|---|---|---|
| 2026-07-29 | RG-05 / RG-F1 — the Feature 002 brief mount was hidden by Feature 012 Scope 15's Simple-adapter wiring, so `tests/distributed-briefs.static.integration.mjs` (TP-10-02) failed deterministically in the full owned node-runner suite (60 pass / 1 fail, exit `1`). | bug-filed | `specs/012-market-action-center-and-guided-tools/bugs/BUG-003-shell-brief-panel-adoption-hides-feature-002-mount/` — filed against feature 012 and **resolved** by the feature-012 workstream in commit `8206c89c`; re-verified green in this session by RV-01 (isolated file, 1 pass / 0 fail, exit `0`) and RV-02 (full owned suite, 61 pass / 0 fail, exit `0`), with the RV-03 baseline unchanged at 952 / 0. |
