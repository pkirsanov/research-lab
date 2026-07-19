# Scope 03: CPI Release Evidence

**Status:** Implemented — DoD met (TP-03-01..11 all passed; see [report.md](report.md)); implementation complete in the working tree, pending independent validation/certification (bubbles.validate).
**Depends On:** 01
**Scope-Kind:** runtime-behavior
**Requirements:** FR-110 through FR-116, FR-121, FR-126, FR-129, FR-131 through FR-132; NFR-016, NFR-019 through NFR-024

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Produce a concrete CPI evidence vertical that separates an official release schedule, official BLS index values, a separately sourced and pre-release-locked consensus artifact, previous-period lineage, comparable-unit surprises, source disagreement, and append-only revisions. A schedule or elapsed clock never becomes an actual, and a missing/late/invalid consensus never becomes a surprise.

### Gherkin Scenarios

#### SCN-002-019: Move CPI from upcoming to released using exact official and consensus lineage

```gherkin
Scenario: SCN-002-019 consumes CPI actual consensus previous and release lineage only when proven by cutoff
  Given the official BLS schedule identifies the target report period and release time
  And an optional comparable consensus artifact was hash-locked by an authoritative pre-release run
  When a run cutoff is before the release
  Then CPI remains upcoming with no actual or surprise
  When a later bounded run retrieves the exact target-period official BLS series after release
  Then the released evidence preserves actual, nullable consensus, previous, report period, release time, unit, seasonal basis, transform, source, retrieval time, freshness, and comparable signed surprise
  And an older period, post-release consensus, invalid lock, or mismatched unit or basis cannot fill the current fields
```

#### SCN-002-023: Preserve source disagreement without averaging or hidden precedence

```gherkin
Scenario: SCN-002-023 keeps disagreeing CPI source records visible and blocks synthesis
  Given two accepted source records disagree on the same metric, period, unit, basis, value, or release timestamp
  When report evidence is reconciled
  Then the report state is disputed and every source record retains its own provenance and clocks
  And the resolved actual, consensus, surprise, and dependent owning-model claim remain absent
  And no average, silent winner, stale carry, or user-side choose-winner control is produced
```

#### SCN-002-024: Append a CPI revision without rewriting the original release

```gherkin
Scenario: SCN-002-024 appends a sourced CPI revision with immutable prior evidence
  Given original released evidence and its associated run references are already accepted
  When a later accepted BLS snapshot changes the target or previous-period index level
  Then revisionNumber increments and one new revision identity links to the original evidence
  And original raw levels, transformed values, brief references, timestamps, and hashes remain byte-identical
  And an identical repeat snapshot creates no duplicate revision event
```

### Implementation Plan

1. Extend `market-brief.config.json` with exact `bls-cpi-schedule`, `bls-public-api-v2`, and `manual-consensus-artifact` request/use policies. Permit only the documented BLS CPI schedule GET and no-key Public Data API v2 POST body with `CUSR0000SA0` and `CUUR0000SA0`; no series, origin, key, calculation, or retention override comes from environment input.
2. Implement `scripts/market-session-evidence.mjs::{fetchBlsCpiSchedule,fetchBlsCpiSource}` with exact heading/row parsing, target-period response validation, bounded body/retry/time policy, accepted-byte hashes, safe diagnostics, and no raw-body persistence.
3. Map accepted BLS schedule/API and consensus records inside `scripts/market-session-evidence.mjs::acquireMarketSessionEvidence`, then consume the Scope 01-owned `rlsession.js::normalizeReleasedReport` primitive to produce headline MoM SA from `CUSR0000SA0`, headline YoY NSA from `CUUR0000SA0`, same-metric previous values, percentage units/bases, percentage-point surprise, and preserved raw index levels. Scope 03 owns this concrete CPI mapping and vertical call site, not a second implementation of the generic normalizer. Time and schedule alone cannot advance beyond `upcoming`.
4. Implement `ReportConsensusArtifact/v1` validation with exact report/period/metric/value/unit/basis/transform, reviewed HTTPS citation, source-published/captured times before release, content hash, authoritative `preReleaseLockRef`, lock run/manifest identity, and deterministic selection. An empty source list is valid and yields `consensus-unavailable`.
5. Implement source-role disagreement and state precedence. Comparable disagreement produces `disputed`, preserves each source record, nulls the resolved value/surprise, and requires a versioned policy change rather than averaging or hidden precedence.
6. Implement immutable release/revision identities, idempotent repeats, `supersedesEvidenceRef`, and report lifecycle history inputs. A changed accepted target/previous level appends one revision object/event; it never mutates an existing object.
7. Extend `scripts/market-session-evidence-live-check.mjs --reports cpi --no-write` to call the actual allowlisted BLS/NYSE surfaces read-only and assert structural/current-or-truthful-unavailable behavior, source identity, no secret fields, and zero repository writes. It makes no fixed numerical assertion.

### Change Boundary

**Allowed:** CPI/report/consensus policy blocks in `market-brief.config.json`; read-only consumption of the Scope 01-owned `rlsession.js::normalizeReleasedReport`; concrete BLS/report acquisition, mapping, and `acquireMarketSessionEvidence` call-site work in `scripts/market-session-evidence.mjs`; `ReportConsensusArtifact/v1`; bounded generated `data/reports/cpi/**`; Scope 03 fixtures/tests.

**Excluded:** Yahoo/calendar/session price-volume implementation, event-to-market reaction joins, owner model formulas/reads, registry metadata, authorship/final aggregation, history/pointers/publication, UI, macro-event prose as a data source, dependency files, other specs, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

Inventory `market-brief.config.json::macroEvents`, `RLDATA.putMacro`/`putEvents`, Bond Regime inflation inputs, Market Brief event notes, validators, docs, and tests. Additive released evidence must not reinterpret existing schedule prose as an actual. Search first-party narrative, config, generated artifacts, and UI assumptions for stale use of `schedule == released`, prior-period-as-current, unitless consensus, mutable revision, or surprise without comparable basis.

### Shared Infrastructure Impact Sweep

The CPI evidence contract is shared by Bond Regime, final aggregation, history, and UI. Independent canaries prove existing macro/event and Bond Regime owner outputs remain unchanged when no released evidence ref is supplied. Rollback removes only the additive CPI adapter/policy and generated report projection while retaining immutable accepted evidence/history objects and restoring pre-scope macro consumers byte-for-byte.

### Test Plan

Captured BLS schedule/API bytes and consensus citations are external-boundary fixtures classified `functional`; they prove parser/contract behavior, not current live values. TP-03-01 through TP-03-03 exercise the Scope 01 generic normalizer with CPI-shaped inputs, TP-03-04 through TP-03-06 own the concrete BLS acquisition/mapping/call-site behavior, and TP-03-07 through TP-03-10 prove the complete CPI vertical without redefining the pure function. Live categories use production validators over committed accepted evidence or the actual no-write source smoke.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-002-019 | `tests/market-session-evidence.unit.mjs` - `SCN-002-019: CPI is upcoming before release and uses exact BLS transforms after release` | `node --test tests/market-session-evidence.unit.mjs` | No | Red: schedule/clock or stale period can produce actual; Green: exact target period, formulas, units, and lifecycle gates pass. |
| Unit | unit | SCN-002-023 | `tests/market-session-evidence.unit.mjs` - `SCN-002-023: comparable source disagreement remains disputed with no synthesized value` | `node --test tests/market-session-evidence.unit.mjs` | No | Red: precedence/average creates a value; Green: every source remains and resolved fields are null. |
| Unit | unit | SCN-002-024 | `tests/market-session-evidence.unit.mjs` - `SCN-002-024: changed BLS levels append one revision identity and preserve prior bytes` | `node --test tests/market-session-evidence.unit.mjs` | No | Red: revision mutates prior evidence or duplicates; Green: immutable linkage and idempotent identity assertions pass. |
| Functional | functional | SCN-002-019 | `tests/market-session-evidence.functional.mjs` - `SCN-002-019: captured BLS schedule and API bytes produce auditable CPI actual previous and nullable consensus` | `node --test tests/market-session-evidence.functional.mjs` | No | Red: parser trusts wrong series/period/shape; Green: production adapter transforms exact official bytes and preserves lineage. |
| Functional | functional | SCN-002-019, SCN-002-023 | `tests/market-session-evidence.functional.mjs` - `Consensus lock source use unit basis and disagreement mutations fail loud` | `node --test tests/market-session-evidence.functional.mjs` | No | Red: late/backdated/mismatched/unreviewed consensus leaks; Green: each mutation yields a safe unavailable/disputed reason. |
| Integration | integration | SCN-002-019 | `scripts/market-session-evidence-live-check.mjs` - read-only BLS CPI structural smoke | `node scripts/market-session-evidence-live-check.mjs --reports cpi --no-write` | Yes | Red: actual source path violates contract or writes; Green: actual source yields valid structure or truthful unavailability with unchanged tree. |
| Regression E2E | e2e-api | SCN-002-019 | `tests/released-report-evidence.e2e.mjs` - `Regression: SCN-002-019 exposes upcoming then released CPI lineage without stale carry` | `node --test tests/released-report-evidence.e2e.mjs` | Yes | Red: a pointer-ready report graph leaks actual/surprise before proof; Green: committed official evidence graph preserves every field and cutoff. |
| Regression E2E | e2e-api | SCN-002-023 | `tests/released-report-evidence.e2e.mjs` - `Regression: SCN-002-023 provider disagreement blocks a single CPI surprise and owner claim` | `node --test tests/released-report-evidence.e2e.mjs` | Yes | Red: final graph resolves/averages disputed values; Green: graph remains disputed with separate records and no dependent claim. |
| Regression E2E | e2e-api | SCN-002-024 | `tests/released-report-evidence.e2e.mjs` - `Regression: SCN-002-024 CPI revision appends while original release graph remains immutable` | `node --test tests/released-report-evidence.e2e.mjs` | Yes | Red: later graph rewrites original; Green: hashes/refs prove append-only revision identity. |
| Full Regression | e2e-api | SCN-002-019, SCN-002-023, SCN-002-024 | Complete report-evidence scenario suite | `node --test tests/released-report-evidence.e2e.mjs tests/market-session-evidence.foundation.e2e.mjs` | Yes | Red: report work regresses foundation or another report scenario; Green: both persistent suites pass together. |
| Baseline | functional | SCN-002-019, SCN-002-023, SCN-002-024 | Existing complete repository selftest | `node scripts/selftest.mjs` | Yes | Red: shared report additions change existing model/macro behavior; Green: unchanged baseline passes. |

### Definition of Done - Tiered Validation

Core outcomes:

- [x] The exact BLS schedule/API and consensus source/use policies, CPI transformations, release lifecycle, nullable pre-release-locked consensus, previous lineage, dispute state, and append-only revision identity implement `design.md` without schedule inference, stale carry, or hidden conversion. — Evidence: [report.md](report.md#test-evidence-one-block-per-test-plan-row) (TP-03-01..05 unit/functional GREEN); the vertical consumes the unchanged Scope 01 `normalizeReleasedReport`, and `scripts/market-session-evidence.mjs` is byte-identical (sha256 `8e5b82d6…c48`).
- [x] SCN-002-019, SCN-002-023, and SCN-002-024 preserve what was knowable at each cutoff and keep every source/value/time/basis/revision distinction auditable. — Evidence: [report.md](report.md#scenario-contract-evidence) (unit TP-03-01/02/03 + e2e TP-03-07/08/09 GREEN, controlled-mutation RED discriminators recorded).
- [x] Consumer and Shared Infrastructure Impact Sweeps are complete; existing macro/Bond outputs remain compatible without refs, independent canaries pass, and narrow rollback is proven. — Evidence: [report.md](report.md#consumer-and-shared-infrastructure-sweep); additive adapter (no repointed consumer), `node scripts/selftest.mjs` = 589/0 + brief-cache (354) + brief-payload canaries pass.
- [x] The declared Change Boundary is respected and every unrelated dirty or untracked path remains unchanged and unstaged. — Evidence: [report.md](report.md#working-tree-audit); Scope 03 surface uncommitted in the working tree, consumed Scope 01/foundation modules unchanged, no unrelated path touched.

Test evidence items, one per Test Plan row:

- [x] [TP-03-01] Unit evidence passes for CPI upcoming/released transforms after its recorded red stage. — Evidence: [report.md](report.md#tp-03-01-unit-scn-002-019--tp-03-07-e2e-scn-002-019); RED `previous.length` 0!==2, GREEN `node --test tests/market-session-evidence.unit.mjs` 8/8 exit 0.
- [x] [TP-03-02] Unit evidence passes for disputed source preservation after its recorded red stage. — Evidence: [report.md](report.md#tp-03-02-unit-scn-002-023--tp-03-08-e2e-scn-002-023); RED `released`!==`disputed`, GREEN 8/8 exit 0.
- [x] [TP-03-03] Unit evidence passes for append-only revision identity after its recorded red stage. — Evidence: [report.md](report.md#tp-03-03-unit-scn-002-024--tp-03-09-e2e-scn-002-024); RED `released`!==`revised`, GREEN 8/8 exit 0.
- [x] [TP-03-04] Functional evidence passes for captured BLS schedule/API normalization; fixtures remain external contract inputs only. — Evidence: [report.md](report.md#tp-03-04--functional-captured-bls-scheduleapi-normalization-scn-002-019--exit-0--claim-source-executed); `node --test tests/market-session-evidence.functional.mjs` 4/4 exit 0.
- [x] [TP-03-05] Functional evidence passes for consensus lock, source use, basis, and disagreement mutations. — Evidence: [report.md](report.md#tp-03-05--functional-consensus-lock--source-use--basis--disagreement-mutations--exit-0--claim-source-executed); functional 4/4 exit 0.
- [x] [TP-03-06] Integration evidence passes for the live no-write BLS CPI structural smoke without fixed-value claims. — Evidence: [report.md](report.md#tp-03-06--integration-live-no-write-bls-cpi-structural-smoke--exit-0--claim-source-executed); `--reports cpi --no-write` truthful unavailability, `data/reports/cpi` unchanged, exit 0.
- [x] [TP-03-07] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-019 pass with the exact title. — Evidence: [report.md](report.md#tp-03-07--tp-03-08--tp-03-09--scenario-specific-e2e-regression--exit-0--claim-source-executed); `Regression: SCN-002-019 exposes upcoming then released CPI lineage without stale carry` GREEN (RED recorded under TP-03-01).
- [x] [TP-03-08] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-023 pass with the exact title. — Evidence: [report.md](report.md#tp-03-07--tp-03-08--tp-03-09--scenario-specific-e2e-regression--exit-0--claim-source-executed); `Regression: SCN-002-023 provider disagreement blocks a single CPI surprise and owner claim` GREEN (RED recorded under TP-03-02).
- [x] [TP-03-09] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-024 pass with the exact title. — Evidence: [report.md](report.md#tp-03-07--tp-03-08--tp-03-09--scenario-specific-e2e-regression--exit-0--claim-source-executed); `Regression: SCN-002-024 CPI revision appends while original release graph remains immutable` GREEN (RED recorded under TP-03-03).
- [x] [TP-03-10] Broader E2E regression suite passes for the report and foundation graph. — Evidence: [report.md](report.md#tp-03-10--broader-e2e-regression-report--foundation--exit-0--claim-source-executed); `node --test tests/released-report-evidence.e2e.mjs tests/market-session-evidence.foundation.e2e.mjs` 7/7 exit 0.
- [x] [TP-03-11] Baseline functional evidence passes for `node scripts/selftest.mjs` after focused checks are green. — Evidence: `Research-Lab self-test: 589 passed, 0 failed`, exit 0 (was 572 pre-Scope-03; +17 additive checks).

Build quality gate:

- [x] Exact Node checks, source-use/security/privacy validation, skip/interception/self-validation scans, diff isolation, and full output are recorded in this scope report with zero warning or undeclared mutation. — Evidence: [report.md](report.md#lint-and-quality); `node scripts/validate-node-source-lock.mjs` PASS (16 adversarial rejected, 0 unexpected), artifact-lint PASSED, selftest 589/0 with no warning, no skip/mock introduced.
