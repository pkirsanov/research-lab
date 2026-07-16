# Scope 04: Event Reaction and Owner Integration

**Status:** Not Started
**Depends On:** 02, 03
**Scope-Kind:** runtime-behavior
**Requirements:** FR-092, FR-117 through FR-121, FR-126 through FR-130, FR-132; NFR-016 through NFR-024

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Join immutable report releases to cutoff-safe, field-complete `ReactionSegment/v1` values and publish shared evidence only through declared eligible owning reads. Each segment preserves its exact non-zero-based comparison window, source semantics, calendar boundary, cutoff, state, semantic identity, and occurrence identity while the public Scope 01 function signatures remain unchanged. The six initial owner consumers (the five current publishers plus the planned Intraday publisher) retain their formulas and produce typed supporting/contradicting/context/insufficient interpretations; every other source receives explicit applicability. Market Brief may consume those owner refs later but cannot interpret raw evidence as model output.

### Gherkin Scenarios

#### SCN-002-020: Publish field-complete cutoff-safe ReactionSegment v1 evidence without look-ahead

```gherkin
Scenario: SCN-002-020 preserves exact reaction segment membership semantics and identities
  Given a released report, one eligible pre-release baseline bar, source bars before at and after release, an explicit calendar boundary signature, and an immutable run cutoff
  When EventMarketReaction joins the report and observations
  Then the latest complete bar ending at or before release is the one-bar frozen pre-release window
  And a bar starting at release or straddling release is excluded because sub-bar ordering is unknown
  And each chronological ReactionSegment v1 starts at the first theoretical calendar-grid bucket strictly after release and ends at the last bucket completed by cutoff and session end
  And a missing first post-release row remains an explicit missing bucket rather than shifting the non-zero start bucket or remapping the comparison window to bucket zero
  And every segment records exact source ID, adapter version, price basis, adjustment state, session boundary signature, cutoff, coverage state, ordered semantic and occurrence observation refs, and source occurrence refs
  And semantic identity excludes run and retrieval occurrence while occurrence identity includes cutoff and occurrence refs and segmentId equals the occurrence identity
  And buildComparableVolumeBaseline uses the unchanged public signature and exactly the segment comparison window and compatible candidate semantics
  And later cutoffs or revisions create linked new segment and parent reaction occurrences without changing earlier bytes or identities
```

#### SCN-002-026: Preserve owning-model authority across heterogeneous tool profiles

```gherkin
Scenario: SCN-002-026 supplies shared evidence to eligible owners without recomputing their models
  Given the five current ToolModelRead publishers, the planned Intraday publisher, other live-market sources, and static local and off-theme sources are present
  When registry-selected owner adapters evaluate the frozen MarketSessionEvidence refs
  Then each eligible owner publishes its own supporting contradicting context insufficient or not-applicable interpretation with model version and exact refs
  And no foundation tool brief or final author creates or changes an owner interpretation
  And static synthetic private off-theme continuous-session or non-integrated evidence remains ineligible or explicitly not applicable
  And final consumption cannot count shared Yahoo or BLS provenance as independent confirmation
```

### Implementation Plan

1. Consume the Scope 01-owned `rlsession.js::joinEventMarketReaction` primitive from the concrete `scripts/market-session-evidence.mjs::acquireMarketSessionEvidence` pipeline using the exact one-bar pre-release baseline, strictly-post-release theoretical completed-bar grid, chronological pre-market/regular/after-hours `ReactionSegment/v1` values, non-zero-based `ComparisonWindow/v1`, source/adapter/price/adjustment semantics, calendar boundary signature, cutoff, coverage state, semantic/occurrence observation and source refs, and distinct semantic/occurrence identities. `buildComparableVolumeBaseline(current, candidates, policy)` consumes each segment through its unchanged signature and exact window. Scope 04 owns this call-site integration and its vertical proof, not a second join implementation.
2. Extend `ToolModelRead/v1` validation and `rldata.js` only with backward-compatible `evidenceCutoff`, bundle/evidence refs, applicability, and owner-produced `evidenceInterpretations`. Existing compact fields and browser/Node behavior remain valid; restricted local observations stay excluded.
3. Add or extract registry-selected owner adapters in `scripts/brief-refresh.mjs::freezeToolReads` for Sector Rotation, Global Rotation, Real Assets, Bond Regime, ETF Momentum, and Intraday Tape. Invoke the exact owner functions named in `design.md`; do not copy RRG, FX, asset, bond, momentum, VWAP/profile, or tape formulas into shared code.
4. For each owner, declare compatible symbols/session semantics and publish the interpretation through its ToolModelRead: tactical context for session evidence, CPI/reaction inputs for Bond Regime, and explicit `not-applicable` for non-XNYS instruments or unsupported profiles.
5. Emit one typed `evidenceApplicability` result for every remaining frozen source. `not-integrated` is explicit and does not remove its normal read/brief obligation in Scope 05.
6. Add owner-read/final validators that reject evidence refs not present in the frozen bundle, interpretations without owner adapter/model provenance, unsupported promotion, raw-evidence-originated actions, hidden provider/tool conflict, and shared-origin confirmation inflation.
7. Preserve owner/current compatibility and capture pre-change canaries for the five existing publisher projections, four existing headless reads, planned Intraday projection, Bond restricted-field absence, and existing `node scripts/selftest.mjs` groups.

### Change Boundary

**Allowed:** additive evidence/ref fields in `rldata.js` and `ToolModelRead/v1`; read-only consumption of Scope 01's `rlsession.js::joinEventMarketReaction`; the concrete reaction call site in `scripts/market-session-evidence.mjs::acquireMarketSessionEvidence`; `scripts/brief-refresh.mjs::freezeToolReads` and exact owner adapter extraction/delegation; narrowly additive publication hooks in the six declared owner pages/functions; Scope 04 tests.

**Excluded:** owning formulas, broad page controls/layout, registry-wide metadata/adapters for remaining sources, author processes, recommendation reducer, final narrative, storage/history/pointers, scheduler Git publication, shared renderer, dependency files, other specs, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

Inventory every consumer of `RLDATA.putToolRead`, `RLDATA.toolReads`, the five browser publishers, four headless owner builders, Intraday Tape segmentation/read output, Bond Regime normalized read, final payload validation, deep links, docs, and tests. Search for stale assumptions that evidence values may appear without an owner interpretation, that current publishers total four, or that Intraday Tape can supply pre/post evidence through its old regular-only path.

### Shared Infrastructure Impact Sweep

`rldata.js`, owner helpers/pages, and `scripts/brief-refresh.mjs` are protected high-fan-out surfaces. An independent canary must import and exercise each pre-change owner projection without the new bundle, then with typed refs, and compare all existing semantic fields. It separately asserts provider credential state, browser-local privacy, source rights, and Bond restricted-field absence. Rollback is additive-field/adapter removal with exact owner-canary restoration; no formula, generated history, or root dirty state is rewritten.

### Test Plan

TP-04-01 through TP-04-02 consume the Scope 01 generic reaction primitive through direct and concrete-pipeline paths and assert the exact `ReactionSegment/v1` field, window, source, boundary, cutoff, state, and identity contract; TP-04-03 through TP-04-10 own ToolModelRead integration, six owner consumers, independent canaries, and complete evidence-to-owner regressions. Owner tests execute production owner functions and committed data. No internal owner/model mock is permitted. Captured provider bytes remain confined to Scopes 02-03 functional tests and cannot prove owner interpretation here.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-002-020 | `tests/market-session-evidence.unit.mjs` - `SCN-002-020: ReactionSegment v1 preserves exact non-zero window source boundary cutoff state and identities` | `node --test tests/market-session-evidence.unit.mjs` | No | Red: release-start, straddling, later, or missing-first bars shift membership or a segment omits exact source/boundary/cutoff/state/identity material; Green: the one-bar baseline, theoretical non-zero window, missing buckets, field contract, and semantic/occurrence identities pass. |
| Functional | functional | SCN-002-020 | `tests/event-market-reaction.functional.mjs` - `SCN-002-020: production reaction graph preserves field-complete segments exact comparables and revision lineage` | `node --test tests/event-market-reaction.functional.mjs` | No | Red: normalized report/bar mutations create look-ahead, bucket-zero remapping, source/boundary mismatch, or occurrence mutation; Green: every exact window, source semantic, boundary, cutoff, state, identity, later-cutoff, and revision mutation is accepted or rejected correctly. |
| Contract | functional | SCN-002-026 | `tests/distributed-briefs.contract.mjs` - `SCN-002-026: only owner adapters may publish evidence interpretations or action eligibility` | `node --test tests/distributed-briefs.contract.mjs` | No | Red: brief/final/raw evidence can invent owner meaning; Green: provenance and profile validators block it. |
| Integration | integration | SCN-002-026 | `tests/distributed-briefs-owner-reads.integration.mjs` - `six declared owners consume typed evidence refs through production model reads` | `node --test tests/distributed-briefs-owner-reads.integration.mjs` | Yes | Red: owners lack refs or shared layer copies formulas; Green: real owner outputs carry additive interpretations and unchanged model fields. |
| Canary | functional | SCN-002-026 | `tests/distributed-briefs-owner-canary.mjs` - `Canary: five current publisher reads and four headless reads preserve pre-evidence semantics` | `node --test tests/distributed-briefs-owner-canary.mjs` | No | Red: shared edits alter prior output; Green: exact semantic canary passes independently of new renderer/scheduler. |
| Canary | functional | SCN-002-026 | `tests/distributed-briefs-owner-canary.mjs` - `Canary: Bond Regime and browser credential boundaries exclude restricted and private fields` | `node --test tests/distributed-briefs-owner-canary.mjs` | No | Red: restricted/private data enters committed projection; Green: production read remains compact and safe. |
| Regression E2E | e2e-api | SCN-002-020 | `tests/event-market-reaction.e2e.mjs` - `Regression: SCN-002-020 publishes only field-complete cutoff-safe ReactionSegment v1 graphs` | `node --test tests/event-market-reaction.e2e.mjs` | Yes | Red: whole graph includes straddling/later bars, shifts a missing first bucket, remaps to bucket zero, omits source/boundary/cutoff/state/identity material, or rewrites prior identity; Green: immutable graph validation proves the exact segment and parent reaction contract. |
| Regression E2E | e2e-api | SCN-002-026 | `tests/distributed-briefs-owner-reads.e2e.mjs` - `Regression: SCN-002-026 final-eligible evidence exists only after an owning read publishes its interpretation` | `node --test tests/distributed-briefs-owner-reads.e2e.mjs` | Yes | Red: evidence alone supports recommendation; Green: real source/read graph requires owner interpretation and preserves profile boundaries. |
| Full Regression | e2e-api | SCN-002-020, SCN-002-026 | Complete evidence/report/reaction/owner E2E suite | `node --test tests/market-session-evidence.source.e2e.mjs tests/released-report-evidence.e2e.mjs tests/event-market-reaction.e2e.mjs tests/distributed-briefs-owner-reads.e2e.mjs` | Yes | Red: an upstream source/report behavior regresses; Green: the full production evidence-to-owner chain passes. |
| Baseline | functional | SCN-002-020, SCN-002-026 | Existing complete repository selftest | `node scripts/selftest.mjs` | Yes | Red: shared/owner changes regress product behavior; Green: unchanged baseline passes. |

### Definition of Done - Tiered Validation

Core outcomes:

- [ ] EventMarketReaction implements the immutable one-bar pre-release baseline and field-complete `ReactionSegment/v1` values with strict post-release/cutoff membership, theoretical exact non-zero comparison windows, explicit missing buckets, source/adapter/price/adjustment semantics, boundary signatures, coverage states, ordered semantic/occurrence/source refs, semantic and occurrence identities, exact segment comparables, linked later-cutoff/revision occurrences, and typed parent failure states.
- [ ] The six declared owner consumers publish only additive typed evidence interpretations through their actual owning functions; all other profiles/sources receive explicit applicability and no shared layer recomputes a model.
- [ ] Shared Yahoo/BLS provenance, source disagreement, owner conflict, restricted local evidence, and non-XNYS/continuous-session boundaries cannot inflate confirmation or create an action.
- [ ] Consumer and Shared Infrastructure Impact Sweeps, independent owner canaries, rollback, and the declared Change Boundary are complete with unrelated dirty paths unchanged and unstaged.

Test evidence items, one per Test Plan row:

- [ ] [TP-04-01] Unit evidence passes for the exact `ReactionSegment/v1` baseline, non-zero window, source, boundary, cutoff, state, coverage, ordered refs, and semantic/occurrence identities after its recorded red stage.
- [ ] [TP-04-02] Functional evidence passes for field-complete reaction segments, exact non-zero comparables, source/boundary mutations, later-cutoff occurrences, and revision lineage after its recorded red stage.
- [ ] [TP-04-03] Contract evidence passes for owner-only evidence interpretation and action eligibility after its recorded red stage.
- [ ] [TP-04-04] Integration evidence passes for all six production owner reads with typed refs.
- [ ] [TP-04-05] Independent canary evidence passes for five browser publishers and four headless reads before broad execution.
- [ ] [TP-04-06] Independent privacy/source-rights canary evidence passes for Bond Regime and credentials.
- [ ] [TP-04-07] Scenario-specific E2E evidence passes for `Regression: SCN-002-020 publishes only field-complete cutoff-safe ReactionSegment v1 graphs` with every exact window/source/boundary/cutoff/state/identity behavior asserted.
- [ ] [TP-04-08] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-026 pass with the exact title.
- [ ] [TP-04-09] Broader E2E regression suite passes for the complete evidence-to-owner chain.
- [ ] [TP-04-10] Baseline functional evidence passes for `node scripts/selftest.mjs` after focused checks are green.

Build quality gate:

- [ ] Exact Node checks, privacy/source-use and internal-mock scans, owner semantic diffs, consumer search, artifact validation, diff isolation, and full output are recorded in this scope report with zero warning or undeclared mutation.
