# Scope 01: MarketSessionEvidence Foundation

**Status:** Not Started
**Depends On:** -
**Scope-Kind:** runtime-behavior
**Planning Tags:** `foundation:true`
**Requirements:** FR-092 through FR-097, FR-103 through FR-109, FR-132; NFR-003, NFR-016 through NFR-020, NFR-022

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Provide the reusable, provider-neutral `MarketSessionEvidence/v1` contract and pure calendar/session/report primitives that every concrete source adapter and owning model can depend on. Scope 01 is the sole implementation owner of the generic `rlsession.js::normalizeReleasedReport` and `rlsession.js::joinEventMarketReaction` functions; Scopes 03 and 04 consume these primitives through concrete vertical integrations rather than redefining them. The public `buildComparableVolumeBaseline(current, candidates, policy)` and `buildMarketSessionEvidence(input)` signatures remain unchanged while accepting the exact `ReactionSegment/v1` comparison contract and discriminated open-date/closed-date `RequiredEvidence/v1` input. The slice ends with foundation validation over committed contract inputs; it does not acquire Yahoo/BLS data, author a brief, or interpret an owning model.

### Gherkin Scenarios

#### SCN-002-016: Assign opening-boundary observations exactly once

```gherkin
Scenario: SCN-002-016 assigns observations around the regular open exactly once
  Given a versioned XNYS CalendarSession defines pre-market and regular half-open intervals in America/New_York
  And complete five-minute observations end at and begin at the official regular open
  When the observations are classified and aggregated at an immutable run cutoff
  Then each observation has exactly one trading date, session kind, completed bucket, source lineage, and cutoff
  And the observation ending at the open belongs only to pre-market while the observation beginning at the open belongs only to regular
  And no observation identity is counted in two aggregates
```

#### SCN-002-018: Compare volume only with exact like-for-like completed buckets

```gherkin
Scenario: SCN-002-018 qualifies comparable volume without treating missing volume as zero
  Given current cumulative volume is observed through a known completed bucket
  And prior candidates declare the same provider semantics, session kind, boundary signature, interval, adjustment basis, and completed bucket range
  When the comparable-volume baseline is built under the explicit policy
  Then it reports candidate, eligible, and missing counts, coverage, median, MAD, midrank percentile, relative volume, and qualification state
  And an observed numeric zero remains an eligible observed zero while an absent volume excludes that candidate
  And thin, mismatched, full-day, regular-session-total, or zero-dispersion evidence cannot create a confident anomaly claim
```

#### SCN-002-021: Validate a whole-graph closed-date bundle and refuse invalid closure proof

```gherkin
Scenario: SCN-002-021 validates a real closed-date evidence graph without inventing live evidence
  Given a committed versioned XNYS calendar explicitly proves a covered holiday closure and its next open trading row
  And an exact prior official regular close anchor and every due-report outcome are valid at the immutable cutoff
  When buildMarketSessionEvidence(input) constructs the whole evidence graph for the closed date
  Then requiredEvidence uses mode closed-date with the closure calendar ref, prior official close proof, and immutable next-open calendar ref
  And the benchmark aggregate and baseline are typed not-applicable with null refs and no current-date live aggregate or baseline appears in the graph
  And the bundle may be available and current only as a closed no-action publication with no persistence or confirmation credit
  When the civil date is uncovered or the closure, prior-close, next-open, version, source, or typed-absence proof is missing or invalid
  Then B002-CALENDAR or B002-INPUT-REJECTED refuses the graph
  And no current graph or pointer candidate is produced
  And explicit early-close and daylight-saving rows still retain their calendar-defined America/New_York and materialized UTC boundaries
```

#### SCN-002-022: Fail loud on invalid, stale, missing, or post-cutoff evidence

```gherkin
Scenario: SCN-002-022 rejects evidence that cannot be aligned truthfully
  Given observations include a naive timestamp, an impossible or ambiguous local time, an off-grid interval, a cross-session interval, and a bar ending after cutoff
  When foundation validation and session classification run
  Then each invalid observation returns a closed safe reason under B002-TIMESTAMP or B002-CALENDAR
  And stale, unavailable, misaligned, and disputed remain distinct from available and partial
  And no dependent aggregate, comparable anomaly, reaction, recommendation eligibility, or current publication is produced
```

### Implementation Plan

1. Add `rlcontracts.js` as a dual-runtime pure module exposing versioned canonical JSON, SHA-256 semantic and occurrence fingerprints, closed enum/path/finite-number validation, `SourceProvenance/v1`, and `EvidenceReference/v1` validation. Object-key order and set-like arrays normalize deterministically; rank/chronology arrays retain validated semantic order.
2. Add `rlsession.js` as a dual-runtime pure module implementing `loadCalendarSession`, `classifySessionObservation`, `aggregateSession`, `buildComparableVolumeBaseline`, the provider-neutral `normalizeReleasedReport` and `joinEventMarketReaction` primitives, `buildMarketSessionEvidence`, `ReactionSegment/v1`, the discriminated `RequiredEvidence/v1` union, and typed validators. These are the production pure entrypoints consumed by later scopes; the existing function signatures do not change, and provider transport, concrete BLS/CPI mapping, concrete reaction-pipeline wiring, filesystem writes, DOM work, narrative, and owner-model interpretation are excluded.
3. Implement explicit `America/New_York` calendar/session contracts with materialized local/UTC half-open intervals, normal and early-close boundary signatures, official-close identity, next-open lookup, DST round-trip checks, a whole-graph closed-date path requiring closure/prior-close/next-open proof plus typed not-applicable live aggregate/baseline fields, and hard refusal outside committed coverage or on invalid proof.
4. Implement cutoff-safe observation classification and aggregation with complete-bar semantics, one-session membership, source/observation/retrieval clocks, separate official regular-close anchors, indicative extended-hours fields, explicit adjustment state, coverage counters, and missing-versus-observed-zero volume.
5. Implement exact five-minute `ComparisonWindow/v1` alignment for both `SessionAggregate/v1` and `ReactionSegment/v1`, preserving a reaction segment's exact non-zero start/end buckets and source/boundary semantics without remapping it to bucket zero; implement the 20-candidate selection contract, explicit qualification thresholds, deterministic exclusions, median/MAD/midrank/rVol/robust-z formulas, zero-dispersion behavior, and aligned peer eligibility exactly as specified in `design.md`.
6. Preserve fail-loud states and error precedence without policy defaults or provider precedence. All policy values are required inputs; unknown contracts/enums, impossible assignments, duplicate disagreement, and incompatible semantics return closed safe errors.
7. Add deterministic foundation vectors that prove each pure production export, generic input/output/state/error semantics, and the path from contract validation through evidence bundle identity. The closed-date E2E vector must build a real graph containing closure calendar proof, prior official close, next-open ref, due-report outcomes, typed not-applicable current aggregate/baseline fields, and available closed/no-action semantics, then refuse uncovered and invalid proof mutations. The report and reaction vectors remain provider-neutral; concrete BLS/CPI mapping and cutoff-safe reaction integration are owned and tested in Scopes 03 and 04. No captured provider response is used in this scope; concrete external-boundary fixtures begin in Scopes 02 and 03.

### Change Boundary

**Allowed:** new `rlcontracts.js`, new `rlsession.js`, `tests/market-session-evidence.unit.mjs`, `tests/market-session-evidence.foundation.functional.mjs`, `tests/market-session-evidence.foundation.e2e.mjs`, additive Feature 002 rows in `tests/distributed-briefs.contract.mjs`, and exact committed calendar/normalized test vectors owned by this scope.

**Excluded:** `tools.json`, source transport, Yahoo/BLS/NYSE acquisition, `rldata.js`, `rlapp.js`, `rlbrief.js`, owning tool formulas/pages, scheduler/publication, current/history artifacts, legacy history, author processes, docs outside the feature packet, other specs, package/dependency manifests, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

No route, path, identifier, UI target, or existing contract is removed in this scope. Before completion, search first-party imports/usages of `RLSESSION`, `RLCONTRACTS`, planned contract version strings, and B002 error codes to prove there is no accidental duplicate implementation or stale name. Later consumers remain blocked on their declared scope dependencies and may not copy these algorithms.

### Shared Infrastructure Impact Sweep

`rlcontracts.js` and `rlsession.js` become high-fan-out foundations. Their independent canary is the existing `node scripts/selftest.mjs` baseline plus a contract test that imports each dual-runtime namespace separately in Node and a browser-like global without going through a provider adapter, owner model, renderer, or scheduler. Rollback is a narrow removal of the two new modules and their scope-owned tests/vectors; because this scope changes no existing product consumer, rollback must restore the exact pre-scope repository selftest result and leave all excluded paths byte-identical.

### Owner-Routed Finding Disposition

| Finding | Planning Disposition | Required Owner Route |
| --- | --- | --- |
| `F002-S01-PLAN-002` | Scope 01, Scope 04, `scenario-manifest.json`, and `test-plan.json` retain stable IDs while adopting the resolved closed-date and reaction-segment contracts; no completion or certification claim follows. | None after plan parity checks pass. |
| `F002-S01-EVIDENCE-001` | Reconciled in planning only: the original interrupted implementation has no durable pre-implementation RED, and that historical gap is immutable. TP-01-01 through TP-01-10 now require a fresh current-certification RED-before-GREEN sequence using the exact unmodified test and the row-specific discriminator below; prior repair evidence is not relabeled or backdated. | Fresh narrow validation may execute the amended evidence contract. No completion, checkbox, status, phase-claim, or certification promotion follows from this planning change. |
| `F002-S01-PLAN-001` | The installed scanner enumerates canonical per-scope files but extracts implementation paths only from an exact `### Implementation Files` heading, while the canonical planner template requires `### Implementation Plan`. This is a framework parser defect, not a missing plan inventory; duplicate parser-shaped sections are not added. | Preserve the existing project-owned upstream parser proposal/routing and route this distinct extraction defect to `bubbles.framework`; do not edit `.github/bubbles/**`. |
| `F002-S01-TRACE-001` | The 14 absent concrete test files belong to Not Started Scopes 06-10 whose DAG dependencies are unsatisfied. Scope 01 scenario/test mappings pass, so the feature-wide traceability exit is not a Scope 01 implementation defect. No placeholder tests are permitted. | The declared Scope 06-10 implementation/test owners create those files only when each scope becomes DAG-eligible. |
| `F002-S01-STATE-001` | Deprecated `scopeProgress`, `statusDiscipline`, and `scopeLayout` warnings plus the grandfathered missing `createdAt` note remain visible. Planning does not hand-edit state or certification. | `bubbles.validate` or the state-transition owner performs any authorized mechanical migration and determines whether `createdAt` remains grandfathered. |
| `F002-S01-GATE-001` | The five `rldata.js` reality-scan findings remain owned by in-progress BUG-001. Scope 01 excludes `rldata.js`; this plan neither amends that bug nor changes the file. | BUG-001 workflow owner. |

### Test Plan

Captured normalized inputs in this scope are deterministic contract vectors, not external-source fixtures and not market evidence. Foundation tests verify that the generic report/reaction entrypoints export, validate, canonicalize, and fail according to their provider-neutral contracts; they do not claim concrete CPI mapping or owner-read integration. Tests execute production functions; replacing a production function with `return input` must make the corresponding assertion fail.

TP-01-09 is the whole-graph closed-date regression. It must construct actual referenced calendar/anchor/next-open/report objects and validate their hashes and cross-references; empty arrays, self-asserted summaries, or shape-only fixture echoes do not satisfy it.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-002-016 | `tests/market-session-evidence.unit.mjs` - `SCN-002-016: opening-boundary bars belong to exactly one session and cutoff` | `node --test tests/market-session-evidence.unit.mjs` | No | Current-certification failure discriminator group TP-01-01/07: in an isolated disposable tree, change only `classifySessionObservation` membership lower-bound evaluation from `start.epoch >= intervalStart` to `end.epoch >= intervalStart`; the 13:25-13:30 bar becomes both pre-market and regular, and this unmodified exact title must fail on ambiguous/non-unique assignment. Restore and byte-verify the candidate, then record the exact test GREEN. |
| Unit | unit | SCN-002-018 | `tests/market-session-evidence.unit.mjs` - `SCN-002-018: comparable volume uses exact completed buckets and preserves missing versus zero` | `node --test tests/market-session-evidence.unit.mjs` | No | Current-certification failure discriminator: in an isolated disposable tree, change only `candidateExclusion` so `volume: null` is admitted and JavaScript summation coerces it to zero; the unmodified exact title must fail its eligible/missing counts and missing-versus-observed-zero assertions. Restore and byte-verify the candidate, then record the exact test GREEN. Durable `comparability` and `baseline-validation` repair tags prove only that this exact command is fail-sensitive. |
| Unit | unit | SCN-002-021 | `tests/market-session-evidence.unit.mjs` - `SCN-002-021: committed XNYS rows resolve holidays early closes and DST` | `node --test tests/market-session-evidence.unit.mjs` | No | Current-certification failure discriminator: in an isolated disposable tree, change only `localWallAt` to format `America/New_York` as fixed `Etc/GMT+5`; the committed spring-DST row must fail timezone round-trip validation under this unmodified exact title. Restore and byte-verify the candidate, then record the exact test GREEN. The durable `calendar-validation` repair tags prove only command fail sensitivity. |
| Unit | unit | SCN-002-022 | `tests/market-session-evidence.unit.mjs` - `SCN-002-022: invalid stale missing disputed and post-cutoff evidence fails loud` | `node --test tests/market-session-evidence.unit.mjs` | No | Current-certification failure discriminator group TP-01-04/10: in an isolated disposable tree, replace only the implicit-end branch in `classifySessionObservation` so it floors `start.epoch` to the prior five-minute boundary, replaces `start.value` with that floored ISO timestamp, and derives `end` from the floored start instead of the parsed start. No cutoff, grid, duration, membership, or output validator is bypassed. Under the unchanged assertion order, the naive and impossible-local-time cases still reject, then the 13:31 bar is silently coerced to 13:30-13:35 and accepted; this unmodified exact title must fail first with `AssertionError [ERR_ASSERTION]: interval-off-grid` and actual `true` versus expected `false`. Restore and byte-verify the candidate, then record the exact test GREEN. Durable SCN-002-022 repair tags prove only command fail sensitivity. |
| Contract | functional | SCN-002-016, SCN-002-018, SCN-002-021, SCN-002-022 | `tests/distributed-briefs.contract.mjs` - `MarketSessionEvidence v1 contracts preserve provenance identities states and ownership boundaries` | `node --test tests/distributed-briefs.contract.mjs` | No | Current-certification failure discriminator: in an isolated disposable tree, bypass only the `hasOnlyFields(value, SOURCE_PROVENANCE_FIELDS)` rejection in `validateSourceProvenance`; `hiddenWinner` is accepted and this unmodified exact title must fail its unknown-field ownership assertion. Restore and byte-verify the candidate, then record the exact test GREEN. Durable `contract`/`source-integrity` repair tags prove only command fail sensitivity. |
| Functional | functional | SCN-002-016, SCN-002-018, SCN-002-021, SCN-002-022 | `tests/market-session-evidence.foundation.functional.mjs` - `Foundation pipeline builds one deterministic cutoff-safe evidence bundle from normalized inputs` | `node --test tests/market-session-evidence.foundation.functional.mjs` | No | Current-certification failure discriminator: in an isolated disposable tree, remove only `segment.semanticFingerprint = contracts.semanticFingerprint(...)` from `buildReactionSegment`; this unmodified exact title must fail on the missing `ReactionSegment/v1` identity. Restore and byte-verify the candidate, then record the exact test GREEN. The report's reaction-segment repair RED proves discriminator viability only. |
| Regression E2E | e2e-api | SCN-002-016 | `tests/market-session-evidence.foundation.e2e.mjs` - `Regression: SCN-002-016 freezes opening-boundary observations once across the production evidence graph` | `node --test tests/market-session-evidence.foundation.e2e.mjs` | Yes | Current-certification failure discriminator group TP-01-01/07: apply the same isolated `start.epoch` to `end.epoch` membership mutation declared for TP-01-01; this unmodified exact title must fail before a graph can freeze the opening-boundary observation twice or ambiguously. Restore and byte-verify the candidate, then record the exact test GREEN. |
| Regression E2E | e2e-api | SCN-002-018 | `tests/market-session-evidence.foundation.e2e.mjs` - `Regression: SCN-002-018 publishes only exact-bucket qualified volume context` | `node --test tests/market-session-evidence.foundation.e2e.mjs` | Yes | Current-certification failure discriminator: in an isolated disposable tree, change only the aggregate comparison window from `endBucketInclusive: current.latestCompletedBucket` to `current.latestCompletedBucket + 1`; the exact 0-47 candidates become mismatched and this unmodified exact title must fail its qualified exact-window publication assertions. Restore and byte-verify the candidate, then record the exact test GREEN. |
| Regression E2E | e2e-api | SCN-002-021 | `tests/market-session-evidence.foundation.e2e.mjs` - `Regression: SCN-002-021 validates a whole-graph closed-date bundle and refuses invalid closure proof` | `node --test tests/market-session-evidence.foundation.e2e.mjs` | Yes | Current-certification failure discriminator: in an isolated disposable tree, change only the closed branch of `requiredEvidenceInputResult` to validate `null` instead of `input.closedDateProof`; this unmodified exact title must fail before constructing its closure/prior-close/next-open graph. Restore and byte-verify the candidate, then record the exact test GREEN. The report's closed-date whole-graph repair RED proves only that absence of closed-date support is discriminated. |
| Regression E2E | e2e-api | SCN-002-022 | `tests/market-session-evidence.foundation.e2e.mjs` - `Regression: SCN-002-022 invalid temporal evidence cannot produce a current graph` | `node --test tests/market-session-evidence.foundation.e2e.mjs` | Yes | Current-certification failure discriminator group TP-01-04/10: apply the same single isolated implicit-end flooring mutation declared for TP-01-04. The unchanged 13:58 input is coerced to an accepted 13:55-14:00 observation without disabling any validator, so this unmodified exact title must fail its first `invalid.ok === false` assertion with actual `true` versus expected `false`, directly proving that invalid temporal evidence crossed the closed fail-loud boundary before any current graph could be admitted. Restore and byte-verify the candidate, then record the exact test GREEN. |
| Baseline | functional | SCN-002-016, SCN-002-018, SCN-002-021, SCN-002-022 | `scripts/selftest.mjs` - existing complete repository baseline | `node scripts/selftest.mjs` | Yes | Red: shared additions regress an existing repository invariant; Green: the unchanged baseline passes after the new modules and tests. |

#### Current-Certification RED-before-GREEN Protocol

For TP-01-01 through TP-01-10, the evidence producer must open a fresh, uniquely identified certification window after this amended plan exists. Within that same window, each row requires all of the following in order:

Window `SCOPE01-CERT-20260715T182751Z` remains an incomplete prior attempt: TP-01-01/07, TP-01-02, and TP-01-03 produced restored RED-before-GREEN records, but TP-01-04 reached the unchanged `interval-off-grid` validator rather than the declared accepted-observation discriminator, and the protocol stopped before the remaining rows. The same-window protocol declares no carry-forward exception, so none of that window's rows transfer into certification. The next execution must open a new uniquely identified window and rerun TP-01-01 through TP-01-11 in order from the start.

1. Record the candidate source and exact unmodified test-file hashes, the selected row-specific discriminator, and the disposable-tree identity.
2. Apply only the declared production-code mutation in the disposable tree; changing the test, fixture expectation, test title, or command is forbidden. A missing-module/import failure, syntax failure, harness failure, proxy assertion, or self-validating fixture does not satisfy any row.
3. Run the row's exact command and capture a nonzero RED whose raw output names the exact planned test title and fails on the declared behavioral discriminator. A coherent mutation may cover multiple rows only when the raw output independently names each affected exact title; each TP item keeps its own evidence reference.
4. Remove the disposable mutation, prove the certification candidate's tracked source and test bytes match the recorded pre-RED hashes, and retain no mutation in the candidate tree.
5. Run the row's exact command against the restored certification candidate and capture exit-zero GREEN whose raw output names the exact planned test title. The RED record must precede this GREEN record in the same report and durable tool-log window for G036 and G060; both blocks must use honest G072 claim-source labels.

Each command block must record `Phase`, exact `Command`, actual `Exit Code`, `Claim Source`, and raw output. `executed` is valid only when the output directly names the exact title and declared assertion failure or acceptance; otherwise use `interpreted` with an `Interpretation` line and keep the TP item unchecked until validation accepts the mapping.

No Scope 01 row selects baseline replay: the exact current tests and production modules are untracked in the recorded pre-scope repository snapshot, so an old-tree run would reduce to a missing-module/import failure rather than the detailed behavior. A baseline replay would become admissible only if a selected tree contains the exact current unmodified test and exercises the old implementation to the declared assertion; it must be labeled `current isolated baseline replay`, never `historical`, `pre-implementation execution`, or proof of what ran during the interrupted original implementation.

### Definition of Done - Tiered Validation

Core outcomes:

- [ ] `rlcontracts.js` and `rlsession.js` implement the exact foundation signatures and ownership boundaries from `design.md`, preserving the public `buildComparableVolumeBaseline(current, candidates, policy)` and `buildMarketSessionEvidence(input)` signatures with no transport, filesystem, DOM, author, or owning-model logic.
- [ ] Deterministic semantic/occurrence identities include the specified contract/policy/source/calendar/cutoff material and exclude only the explicitly volatile fields.
- [ ] Calendar/session aggregation, official-versus-indicative separation, exact-bucket comparability, missing-versus-zero semantics, robust statistics, state precedence, and fail-loud error behavior satisfy SCN-002-016, SCN-002-018, SCN-002-021, and SCN-002-022, including a real whole-graph closed-date bundle with closure/prior-close/next-open proof, typed not-applicable live aggregate/baseline fields, available closed/no-action semantics, and refusal of uncovered or invalid proof.
- [ ] Consumer and Shared Infrastructure Impact Sweeps are complete; independent dual-runtime/selftest canaries pass and the narrow rollback restores the pre-scope baseline with excluded paths unchanged.
- [ ] The declared Change Boundary is respected, with zero changes to source adapters, existing shared/UI/scheduler/model surfaces, other specs, dependency manifests, or unrelated dirty/untracked paths.

Test evidence items, one per Test Plan row:

- [ ] [TP-01-01] Unit evidence records the declared shared TP-01-01/07 half-open membership controlled-mutation RED before GREEN for `SCN-002-016: opening-boundary bars belong to exactly one session and cutoff` in one fresh current-certification window.
- [ ] [TP-01-02] Unit evidence records the declared comparable-volume eligibility controlled-mutation RED before GREEN for `SCN-002-018: comparable volume uses exact completed buckets and preserves missing versus zero` in one fresh current-certification window.
- [ ] [TP-01-03] Unit evidence records the declared committed-calendar controlled-mutation RED before GREEN for `SCN-002-021: committed XNYS rows resolve holidays early closes and DST` in one fresh current-certification window.
- [ ] [TP-01-04] Unit evidence records the declared shared TP-01-04/10 implicit-end grid-flooring controlled-mutation RED before GREEN for `SCN-002-022: invalid stale missing disputed and post-cutoff evidence fails loud` in one fresh current-certification window.
- [ ] [TP-01-05] Contract evidence records the declared closed-field/ownership controlled-mutation RED before GREEN for `MarketSessionEvidence v1 contracts preserve provenance identities states and ownership boundaries` in one fresh current-certification window.
- [ ] [TP-01-06] Functional evidence records the declared `ReactionSegment/v1` fingerprint repair-discriminator RED before GREEN for `Foundation pipeline builds one deterministic cutoff-safe evidence bundle from normalized inputs` in one fresh current-certification window; prior repair records are not relabeled as this execution.
- [ ] [TP-01-07] Scenario-specific E2E evidence records the declared shared TP-01-01/07 half-open membership controlled-mutation RED before GREEN for `Regression: SCN-002-016 freezes opening-boundary observations once across the production evidence graph` in one fresh current-certification window.
- [ ] [TP-01-08] Scenario-specific E2E evidence records the declared thin/mismatched baseline-qualification controlled-mutation RED before GREEN for `Regression: SCN-002-018 publishes only exact-bucket qualified volume context` in one fresh current-certification window.
- [ ] [TP-01-09] Scenario-specific E2E evidence records the declared closed-date repair-discriminator RED before GREEN for `Regression: SCN-002-021 validates a whole-graph closed-date bundle and refuses invalid closure proof` in one fresh current-certification window; prior repair records are not relabeled as this execution.
- [ ] [TP-01-10] Scenario-specific E2E evidence records the declared shared TP-01-04/10 implicit-end grid-flooring controlled-mutation RED before GREEN for `Regression: SCN-002-022 invalid temporal evidence cannot produce a current graph` in one fresh current-certification window.
- [ ] [TP-01-11] Baseline regression evidence passes for the complete existing `node scripts/selftest.mjs` command after focused checks are green.

Original historical gap and amended certification boundary for TP-01-01 through TP-01-10:

> **Uncertainty Declaration**
> **What was attempted:** The original implementation dispatch was started but ended before durable pre-implementation test logging; the scope report and durable tool log were inspected for an earlier failing run.
> **What was observed:** No durable failing execution recorded before the interrupted original implementation exists for TP-01-01 through TP-01-10. Current green executions and repair-specific RED/GREEN records occurred after that implementation and remain honestly labeled repair evidence; they are not substituted for or relabeled as the missing historical event.
> **Why this is uncertain:** The original historical gap cannot be repaired. The amended plan therefore creates a distinct, prospective current-certification contract without asserting anything about what ran before the interrupted implementation.
> **What would resolve this:** Execute each amended TP-01-01 through TP-01-10 discriminator and its corresponding GREEN in the ordered fresh-window protocol above, preserve the original historical-gap statement, and submit those new records to narrow validation. This planning edit alone supplies no execution evidence and permits no checkbox, status, phase-claim, or certification change.

Build quality gate:

- [ ] JSON/static contract parsing, exact Node checks, artifact lint, capability-foundation validation, scenario/test-plan synchronization, source/security scans applicable to this boundary, diff checks, and full command output are recorded in `report.md`; no warning, skip, fabricated evidence, or unrelated file change is accepted.
