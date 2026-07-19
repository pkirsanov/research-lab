# Scope 03 Report: CPI Release Evidence

**Status:** Implementation Complete — the CPI released-report vertical (production adapter, tests, fixtures, live smoke, and the additive selftest group) is delivered in the working tree; DoD test-evidence items TP-03-01 through TP-03-11 are met by reproduced current-session evidence (TP-03-01/02/03 and TP-03-07/08/09 by controlled-mutation RED-before-GREEN, TP-03-04/05/06/10/11 executed GREEN). The Scope 03 surface is uncommitted (working tree); the parent verifies, stages, and commits it. Independent validation/certification is owned by bubbles.validate; this report records implement-phase delivery evidence only.

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 03 delivers the concrete BLS CPI evidence vertical on top of the UNCHANGED Scope 01 `rlsession.js::normalizeReleasedReport` primitive. The additive production block in `scripts/market-session-evidence.mjs` (`BLS_ADAPTER_VERSION = 'bls-cpi-report-adapter/v1'`) implements the exact reviewed BLS CPI schedule GET and no-key Public Data API v2 POST request/use policies, `parseBlsScheduleHtml` / `parseBlsApiResponse` fail-closed parsers, `buildReportSchedule`, `mapBlsCpiSnapshot` (headline MoM SA from `CUSR0000SA0`, headline YoY NSA from `CUUR0000SA0`, previous-period lineage), deterministic pre-release `selectConsensusArtifact`, and the `acquireReportEvidence` orchestrator that produces released-report evidence through the Scope 01 lifecycle. A schedule/elapsed clock never becomes an actual; a missing/late/invalid consensus never becomes a surprise; two disagreeing accepted sources become `disputed` with no synthesis; a changed accepted level appends one immutable revision. Scope 03 also adds the CPI scenarios to `tests/market-session-evidence.{unit,functional}.mjs`, the new scenario-specific regression suite `tests/released-report-evidence.e2e.mjs`, the `tests/fixtures/feature-002/market-session-evidence/report-fixture-builder.mjs` captured-byte builder, the read-only `--reports cpi --no-write` structural smoke in `scripts/market-session-evidence-live-check.mjs`, and the additive Scope 03 selftest group in `scripts/selftest.mjs`.

## Decision Record

1. Evidence-first: every DoD test-evidence item below cites a command re-run and observed in this session (Claim Source: executed). No historical output is relabeled, backdated, or fabricated.
2. **Controlled-mutation RED-before-GREEN for TP-03-01/02/03 (unit) and TP-03-07/08/09 (e2e).** These six rows validate the same three behaviors (SCN-002-019/023/024) through the same additive production paths. Because the Scope 03 production code is uncommitted in the working tree, a `git checkout` restore would revert the entire adapter; instead, each of the three behaviors was proven by a single surgical in-place mutation of `scripts/market-session-evidence.mjs` reversed by an exact inverse edit, with byte-identity confirmed by SHA-256 against a pre-mutation anchor rather than by `git checkout`. Each RED run exercised the unit and e2e test for that scenario together. The production file is byte-identical to its pre-RED working-tree state after all cycles (`8e5b82d6…c48`; audit below).
3. **TP-03-06 live-check `--reports cpi --no-write` was implemented in this run.** The prior run's working tree did not include this branch (`git status` showed `market-session-evidence-live-check.mjs` unmodified) even though scope.md implementation-plan step 7 and TP-03-06 declare it as part of the Scope 03 surface. Completing it was strictly required to meet the scope's DoD, so a bounded, additive, read-only branch was added: it probes the allowlisted BLS sources through a bounded no-write transport, reports present structural fields or a truthful unavailable state, makes no fixed numeric claim, and proves zero writes under `data/reports/cpi/**`. It is not a protected shared-infrastructure file.
4. Certification is not self-claimed. `spec.md`, `design.md`, `uservalidation.md`, and `state.json.certification.*` are unchanged; final certification remains bubbles.validate's responsibility.

## Completion Statement

Scope 03 implementation is complete and its implement-phase DoD is met by reproduced current-session evidence. All DoD items (4 core outcomes, TP-03-01 through TP-03-11, build-quality gate) are checked in [scope.md](scope.md) with the executed evidence recorded below. The six rows validating SCN-002-019/023/024 (TP-03-01/02/03 unit and TP-03-07/08/09 e2e) carry fresh controlled-mutation RED-before-GREEN pairs; TP-03-04/05/06/10/11 carry executed GREEN output. The Scope 03 production/test/fixture/selftest surface is uncommitted in the working tree for the parent to stage and commit; the consumed Scope 01/foundation modules are unchanged. Independent certification and any `done` promotion are owned by bubbles.validate.

## Reproduced Delivery Validation (summary, Claim Source: executed)

| Command | Result | Exit |
| --- | --- | ---: |
| `node scripts/selftest.mjs` | `Research-Lab self-test: 589 passed, 0 failed` (was 572 pre-Scope-03; +17 additive Scope 03 checks) | 0 |
| `node --test tests/market-session-evidence.unit.mjs` | `tests 8  pass 8  fail 0` (CPI SCN-002-019/023/024 + Scope 01/02 unit) | 0 |
| `node --test tests/market-session-evidence.functional.mjs` | `tests 4  pass 4  fail 0` (CPI SCN-002-019 + consensus/disagreement mutations) | 0 |
| `node --test tests/released-report-evidence.e2e.mjs` | `tests 3  pass 3  fail 0` (SCN-002-019/023/024) | 0 |
| `node --test tests/released-report-evidence.e2e.mjs tests/market-session-evidence.foundation.e2e.mjs` | `tests 7  pass 7  fail 0` | 0 |
| `node scripts/market-session-evidence-live-check.mjs --reports cpi --no-write` | `report=cpi structural=unavailable reason=B002-REPORT-SCHEDULE:schedule-heading-missing (truthful unavailability)`, `report no-write verified: data/reports/cpi unchanged (absent)`, `[LIVE-CHECK] OK` | 0 |
| `node scripts/validate-node-source-lock.mjs` | `[node-source-lock] OK adversarial=16 unexpectedAcceptances=0` | 0 |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/002-distributed-tool-briefs-and-history` | `Artifact lint PASSED.` | 0 |
| `node scripts/validate-brief-cache.mjs` | `[brief-cache] PASS: 354 JSON cache files parsed …` | 0 |
| `node scripts/validate-brief-payload.mjs market-brief.payload.json` | `[brief-contract] PASS …` | 0 |

## Working-Tree Audit (Claim Source: executed)

`git rev-parse --short HEAD` = `e8328b7`. The Scope 03 surface is **uncommitted** (working tree) for the parent to stage/commit. `git status --porcelain` (Scope 03 code/test/fixture surface):

```text
 M scripts/market-session-evidence-live-check.mjs
 M scripts/market-session-evidence.mjs
 M scripts/selftest.mjs
 M tests/market-session-evidence.functional.mjs
 M tests/market-session-evidence.unit.mjs
?? tests/fixtures/feature-002/market-session-evidence/report-fixture-builder.mjs
?? tests/released-report-evidence.e2e.mjs
```

Working-tree SHA-256 of the Scope 03 surface:

| File | SHA-256 |
| --- | --- |
| `scripts/market-session-evidence.mjs` | `8e5b82d65fbe25649d8ed2f9e30d0dc8252082df583866cf307a0d9fbc234c48` (byte-identical before and after all six RED mutation cycles) |
| `scripts/market-session-evidence-live-check.mjs` | `e3963716c096645ca8208739d7aede3661053d8d15e587fde7cf215f81aa4332` |
| `scripts/selftest.mjs` | `48f84c8ad4ebb68c2118d360f9f4944eecaa35bff5a7cf06bc56b6d01ad58555` |
| `tests/market-session-evidence.unit.mjs` | `9ee28b4d290a3b52d8627dcbe52132b85edcb2cbe972aae9140688ac6bfb734c` |
| `tests/market-session-evidence.functional.mjs` | `a5ce39b90ffc18d5233db9c7d2639ae131224481bb683a238051b0904f517514` |
| `tests/released-report-evidence.e2e.mjs` | `ce54372716f03c4c07a4925012dacf5bb9dc61ea136fb98a2f0f4d0caf0757f7` |
| `tests/fixtures/feature-002/market-session-evidence/report-fixture-builder.mjs` | `51af8b8621d9e3fa93266283d32605d1b2c3c98badd4fa29bb110ddbed98635a` |

The consumed Scope 01 foundation (`rlsession.js`, `rlcontracts.js`) and all excluded surfaces are unchanged (not in the status above).

## Test Evidence (one block per Test Plan row)

**Phase:** implement · **Agent:** bubbles.implement

Controlled production mutations (each reversed by an exact inverse edit; the file is byte-identical to `8e5b82d6…c48` after every cycle):

- **SCN-002-019** — `mapBlsCpiSnapshot`: `const previousPeriod = shiftReportPeriod(reportPeriod, 1);` → `… , 2);` (previous-period lineage broken).
- **SCN-002-023** — `acquireReportEvidence`: `const fetchCount = 1 + (options.additionalApiFetches || 0);` → `const fetchCount = 1;` (second disagreeing source dropped).
- **SCN-002-024** — `acquireReportEvidence`: `normalizeReleasedReport(…, options.previousEvidence || null, cutoffAt)` → `normalizeReleasedReport(…, null, cutoffAt)` (revision lineage dropped).

### TP-03-01 (unit SCN-002-019) + TP-03-07 (e2e SCN-002-019)

#### RED — `node --test --test-name-pattern="SCN-002-019" tests/market-session-evidence.unit.mjs tests/released-report-evidence.e2e.mjs` — Exit 1 — Claim Source: executed

```text
✖ SCN-002-019: CPI is upcoming before release and uses exact BLS transforms after release
  AssertionError: 0 !== 2  (tests/market-session-evidence.unit.mjs:475  previous.length)
✖ Regression: SCN-002-019 exposes upcoming then released CPI lineage without stale carry
  TypeError: Cannot read properties of undefined (reading 'period')  (tests/released-report-evidence.e2e.mjs:110)
ℹ tests 2  ℹ pass 0  ℹ fail 2
```

Restore: exact inverse edit (`, 2)` → `, 1)`); `shasum -a 256 scripts/market-session-evidence.mjs` = `8e5b82d6…c48` (anchor).

#### GREEN — `node --test tests/market-session-evidence.unit.mjs` (unit) and `node --test tests/released-report-evidence.e2e.mjs` (e2e) — Exit 0 — Claim Source: executed

```text
✔ SCN-002-019: CPI is upcoming before release and uses exact BLS transforms after release
✔ Regression: SCN-002-019 exposes upcoming then released CPI lineage without stale carry
```

### TP-03-02 (unit SCN-002-023) + TP-03-08 (e2e SCN-002-023)

#### RED — `node --test --test-name-pattern="SCN-002-023" tests/market-session-evidence.unit.mjs tests/released-report-evidence.e2e.mjs` — Exit 1 — Claim Source: executed

```text
✖ SCN-002-023: comparable source disagreement remains disputed with no synthesized value
  AssertionError: 'released' !== 'disputed'  (tests/market-session-evidence.unit.mjs:533)
✖ Regression: SCN-002-023 provider disagreement blocks a single CPI surprise and owner claim
  AssertionError: 'released' !== 'disputed'  (tests/released-report-evidence.e2e.mjs:151)
ℹ tests 2  ℹ pass 0  ℹ fail 2
```

Restore: exact inverse edit; SHA-256 = anchor.

#### GREEN — Exit 0 — Claim Source: executed

```text
✔ SCN-002-023: comparable source disagreement remains disputed with no synthesized value
✔ Regression: SCN-002-023 provider disagreement blocks a single CPI surprise and owner claim
```

### TP-03-03 (unit SCN-002-024) + TP-03-09 (e2e SCN-002-024)

#### RED — `node --test --test-name-pattern="SCN-002-024" tests/market-session-evidence.unit.mjs tests/released-report-evidence.e2e.mjs` — Exit 1 — Claim Source: executed

```text
✖ SCN-002-024: changed BLS levels append one revision identity and preserve prior bytes
  AssertionError: 'released' !== 'revised'  (tests/market-session-evidence.unit.mjs:565)
✖ Regression: SCN-002-024 CPI revision appends while original release graph remains immutable
  AssertionError: 'released' !== 'revised'  (tests/released-report-evidence.e2e.mjs:197)
ℹ tests 2  ℹ pass 0  ℹ fail 2
```

Restore: exact inverse edit; SHA-256 = anchor.

#### GREEN — Exit 0 — Claim Source: executed

```text
✔ SCN-002-024: changed BLS levels append one revision identity and preserve prior bytes
✔ Regression: SCN-002-024 CPI revision appends while original release graph remains immutable
```

### TP-03-04 — Functional captured BLS schedule/API normalization (SCN-002-019) — Exit 0 — Claim Source: executed

`node --test tests/market-session-evidence.functional.mjs`

```text
✔ SCN-002-019: captured BLS schedule and API bytes produce auditable CPI actual previous and nullable consensus
ℹ tests 4  ℹ pass 4  ℹ fail 0
```

### TP-03-05 — Functional consensus lock / source use / basis / disagreement mutations — Exit 0 — Claim Source: executed

`node --test tests/market-session-evidence.functional.mjs`

```text
✔ Consensus lock source use unit basis and disagreement mutations fail loud
```

### TP-03-06 — Integration live no-write BLS CPI structural smoke — Exit 0 — Claim Source: executed

`node scripts/market-session-evidence-live-check.mjs --reports cpi --no-write` (real BLS probe; the live page's heading differs from the reviewed fixture, so the parser fail-closes → truthful unavailability, no fixed numeric claim, zero writes)

```text
[LIVE-CHECK] mode=read-only no-write=true nowUtc=2026-07-19T07:08:49.997Z nyDate=2026-07-19 nyWall=03:08 symbols=SPY
[LIVE-CHECK] report=cpi structural=unavailable reason=B002-REPORT-SCHEDULE:schedule-heading-missing (truthful unavailability)
[LIVE-CHECK] report no-write verified: data/reports/cpi unchanged (absent)
[LIVE-CHECK] OK
```

### TP-03-07 / TP-03-08 / TP-03-09 — Scenario-specific E2E regression — Exit 0 — Claim Source: executed

`node --test tests/released-report-evidence.e2e.mjs` (RED discriminators recorded above with TP-03-01/02/03)

```text
✔ Regression: SCN-002-019 exposes upcoming then released CPI lineage without stale carry
✔ Regression: SCN-002-023 provider disagreement blocks a single CPI surprise and owner claim
✔ Regression: SCN-002-024 CPI revision appends while original release graph remains immutable
ℹ tests 3  ℹ pass 3  ℹ fail 0
```

### TP-03-10 — Broader E2E regression (report + foundation) — Exit 0 — Claim Source: executed

`node --test tests/released-report-evidence.e2e.mjs tests/market-session-evidence.foundation.e2e.mjs`

```text
✔ Regression: SCN-002-016 freezes opening-boundary observations once across the production evidence graph
✔ Regression: SCN-002-018 publishes only exact-bucket qualified volume context
✔ Regression: SCN-002-021 validates a whole-graph closed-date bundle and refuses invalid closure proof
✔ Regression: SCN-002-022 invalid temporal evidence cannot produce a current graph
✔ Regression: SCN-002-019 exposes upcoming then released CPI lineage without stale carry
✔ Regression: SCN-002-023 provider disagreement blocks a single CPI surprise and owner claim
✔ Regression: SCN-002-024 CPI revision appends while original release graph remains immutable
ℹ tests 7  ℹ pass 7  ℹ fail 0
```

### TP-03-11 — Baseline complete-repository selftest — Exit 0 — Claim Source: executed

`node scripts/selftest.mjs`

```text
Feature 002 Scope 03 market-session-evidence BLS CPI report adapter
  ✓ … loadSourcePolicies resolves the committed CPI report config and the two allowlisted BLS sources
  ✓ … buildBlsScheduleRequest / buildBlsApiRequest emit the exact allowlisted request contracts
  ✓ … parseBlsScheduleHtml resolves the June 2026 08:30 ET release to the exact 12:30Z instant (+ 2 fail-closed)
  ✓ … parseBlsApiResponse parses the exact committed CPI index levels (+ 2 fail-closed)
  ✓ … buildReportSchedule / mapBlsCpiSnapshot exact MoM SA + YoY NSA transforms with previous lineage
  ✓ … selectConsensusArtifact deterministic selection + consensus-unavailable
  ✓ … acquireReportEvidence upcoming / released (one MoM percentage-point surprise) / disputed
  ✓ … released-report-evidence graph revalidates through the Scope 01 validateReleasedReportEvidence primitive
================================================
Research-Lab self-test: 589 passed, 0 failed
================================================
```

## Scenario Contract Evidence

- **SCN-002-019** — a schedule/elapsed clock never advances beyond `upcoming`; after release the graph preserves actual (exact MoM SA `100·(320/319−1)` and YoY NSA `100·(323/315−1)`), nullable consensus, previous-period lineage (`2026-05`), unit/seasonal-basis/transform, report period, release time, retrieval time, freshness, and the comparable signed percentage-point surprise; an ineligible post-release consensus yields `consensus-unavailable` with no surprise. Proven by `SCN-002-019` (unit TP-03-01, functional TP-03-04) and `Regression: SCN-002-019 …` (e2e TP-03-07), re-validated through the Scope 01 `validateReleasedReportEvidence` primitive; RED discriminator recorded.
- **SCN-002-023** — two accepted source records that disagree on the same comparable metric drive the report state to `disputed`, preserve each record's own provenance and value, and null the resolved actual, surprise, and dependent owning-model claim with no average or silent winner. Proven by `SCN-002-023` (unit TP-03-02, functional TP-03-05) and `Regression: SCN-002-023 …` (e2e TP-03-08); RED discriminator recorded.
- **SCN-002-024** — a later accepted snapshot that changes the target level increments `revisionNumber` and links one new revision identity to the immutable original (byte-identical original graph, `supersedesEvidenceRef.fingerprint` = original `semanticFingerprint`); an identical repeat snapshot creates no duplicate revision. Proven by `SCN-002-024` (unit TP-03-03) and `Regression: SCN-002-024 …` (e2e TP-03-09); RED discriminator recorded.

## Consumer and Shared Infrastructure Sweep

- **Consumer Impact Sweep (Claim Source: executed):** `grep -rnE "(from |require\().*market-session-evidence" --include='*.mjs' --include='*.js' scripts tests` shows the only importers of the adapter MODULE are the additive Scope 02/03 surfaces — `scripts/market-session-evidence-live-check.mjs`, `tests/released-report-evidence.e2e.mjs`, `tests/market-session-evidence.{source.e2e,unit,functional}.mjs` — plus the additive dynamic `await import('./market-session-evidence.mjs')` in the Scope 02/03 selftest groups. No first-party narrative/config/daily-bar consumer (`scripts/brief-refresh.mjs`, `scripts/fetch-bars.mjs`, Bond Regime inflation inputs, Market Brief event notes) imports or is repointed by the additive CPI adapter, so no existing `schedule == released`, prior-period-as-current, unitless-consensus, mutable-revision, or surprise-without-comparable-basis assumption is changed.
- **Shared Infrastructure Impact Sweep (Claim Source: executed):** the independent canaries `node scripts/selftest.mjs` (589/0), `node scripts/validate-brief-cache.mjs` (PASS, 354 files), and `node scripts/validate-brief-payload.mjs market-brief.payload.json` (PASS) all pass with the additive CPI vertical in place, confirming pre-existing macro/Bond/Market-Brief behavior is unchanged when no released-report ref is supplied. The dual-runtime canary (`node -e` requiring `rlsession.js` + `rlcontracts.js`) shows both consumed foundations load frozen with the report primitives (`normalizeReleasedReport`, `validateReleasedReportEvidence`, `semanticFingerprint`, `validateSourceProvenance`) present.
- **Rollback (Claim Source: interpreted):** the change is additive-only (CPI block in `market-session-evidence.mjs`, new `--reports` branch in the live-check, new tests/fixtures, additive selftest group; no config or generated report projection was written — `data/reports/cpi` is `absent`). Narrow rollback is removal of those additive files/blocks, which restores the previous daily-only/session-only path; the green baseline canaries confirm that path already runs independently of the CPI additions, and no committed accepted-evidence/history object is mutated.

## Uncertainty Declarations

- The **original** pre-implementation RED for the Scope 03 unit rows (from the prior build run that authored the unit/functional tests) was not recorded and is not claimed, relabeled, or backdated. It is replaced by the fresh current-session controlled-mutation RED-before-GREEN pairs recorded above for the six rows (TP-03-01/02/03 unit and TP-03-07/08/09 e2e) whose DoD requires a recorded red stage / RED→GREEN contract. TP-03-04/05/06/10/11 are executed-GREEN rows with no red-stage clause.
- TP-03-06 asserts structural validity **or** truthful unavailability against the live BLS source; on this run the live page did not carry the reviewed fixture heading, so the parser fail-closed and the smoke reported truthful unavailability (an accepted Green outcome) with zero writes. No fixed CPI numeric value is claimed by the live smoke; the exact-value contract is proven by the captured-byte functional/unit/e2e rows instead.

## Coverage Report

Business-logic coverage for the CPI vertical is exercised by the unit (SCN-002-019/023/024) + functional (SCN-002-019 + consensus/disagreement mutations) + e2e (SCN-002-019/023/024) suites plus the additive Scope 03 selftest group (17 checks inside the 589-total baseline) and the live no-write structural smoke. No coverage instrumentation tool is configured in this build-free repository; scenario coverage is the coverage contract.

## Lint and Quality

`node scripts/validate-node-source-lock.mjs` = PASS (manifest/npmrc/lockfile/graph PASS, 16 adversarial supply-chain cases REJECTED, 0 unexpected acceptances, exit 0). `bash .github/bubbles/scripts/artifact-lint.sh specs/002-distributed-tool-briefs-and-history` = `Artifact lint PASSED.` (exit 0). `node scripts/selftest.mjs` = 589 passed / 0 failed (exit 0), no warning. The declared Change Boundary is respected — only the Scope 03 code/test/fixture/selftest surface plus this scope's owned `report.md`/`scope.md`/`_index.md`/`state.json` are modified; every unrelated dirty or untracked path is unchanged and unstaged.

## Validation Summary

Delivery evidence reproduced and recorded (executed). Independent certification is owned by bubbles.validate; `state.json.certification.*` is unchanged and `certified` is false on the implement claim.

## Audit Verdict

Not audited (bubbles.audit owns audit). This report records implement-phase delivery evidence only.
