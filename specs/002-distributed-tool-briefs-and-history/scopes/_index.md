# Scopes Index: Distributed Tool Briefs and Recommendation History

Planning authority remains `spec.md` and `design.md`. This index is the sole active scope inventory. The legacy five-scope single-file plan is superseded by this ten-scope layout and is not executable.

## Execution Outline

### Phase Order

1. **Scope 01 - MarketSessionEvidence foundation (`foundation:true`):** implement the provider-neutral pure contract primitives, including generic released-report normalization and event-reaction joining, plus deterministic provenance, calendar/session classification, cutoff isolation, identities, aggregation, comparable-volume semantics, and fail-loud validation.
2. **Scope 02 - Yahoo extended-hours evidence:** acquire bounded `includePrePost=true` five-minute bars and publish official-versus-indicative price plus same-kind/same-completed-bucket volume evidence.
3. **Scope 03 - CPI release evidence:** map official BLS schedule/API and locked pre-release consensus into the Scope 01 report primitive, then own the concrete CPI lifecycle, previous/revision/dispute vertical and tests without reimplementing that primitive.
4. **Scope 04 - Event reaction and owner integration:** consume the Scope 01 reaction primitive in the concrete evidence pipeline and own declared owner-read wiring, interpretation validation, and canaries without reimplementing the join.
5. **Scope 05 - Registry-wide normalized reads:** freeze one truthful read outcome per runtime-discovered source, preserve the observed 23-participant/22-source snapshot as a canary, and prove added-source discovery without a second inventory.
6. **Scope 06 - Bounded authorship and recommendation lifecycle:** author or carry every source brief, enforce budgets/retries/privacy, and reduce deterministic recommendation observations, lifecycle events, merges, and conflicts.
7. **Scope 07 - Bounded history and legacy migration:** publish point-readable immutable objects, monthly streams, compact indexes, and parity-check all actual legacy rows (derived count) without inventing absent narratives.
8. **Scope 08 - Window-aware final aggregation:** consume only owner-published evidence refs after the source barrier and produce cutoff-specific pre-market, morning, pre-close, and after-hours synthesis under the low-noise gate.
9. **Scope 09 - Evidence-first atomic publication:** freeze evidence before reads/authorship, validate one complete publish set, advance pointers last, and preserve exact retry/rollback/dirty-worktree isolation.
10. **Scope 10 - Shared UI and Pages acceptance:** compose shared Simple/Power/history primitives on all registry pages and prove safe, accessible, responsive, selective static reads locally and on Pages.

### New Types and Signatures

- `SourceProvenance/v1`, `EvidenceReference/v1`, `CalendarSession/v1`, `SessionObservation/v1`, `SessionAggregate/v1`, `ComparableVolumeBaseline/v1`, `ReactionSegment/v1`, `ReleasedReportEvidence/v1`, `EventMarketReaction/v1`, `RequiredEvidence/v1`, and `MarketSessionEvidence/v1`.
- `BriefingRegistryEntry/v1`, `ToolModelRead/v1`, `ToolBrief/v1`, `Recommendation/v1`, `RecommendationEvent/v1`, `FinalBrief/v1`, `BriefRunManifest/v1`, and the current/history pointer and index contracts.
- Scope 01 owns the provider-neutral implementations of `loadCalendarSession`, `classifySessionObservation`, `aggregateSession`, `buildComparableVolumeBaseline(current, candidates, policy)`, `normalizeReleasedReport`, `joinEventMarketReaction`, and `buildMarketSessionEvidence(input)` in `rlsession.js`; `buildComparableVolumeBaseline` accepts `SessionAggregate/v1` or `ReactionSegment/v1`, `buildMarketSessionEvidence` validates the discriminated open-date/closed-date `RequiredEvidence/v1` branch, and Scopes 03 and 04 consume these unchanged entrypoints without redefining them.
- `canonicalize`, `fingerprint`, `validateRegistry`, read/brief/final validators, recommendation reducers, and grouping in `rlcontracts.js`.
- Provider transports remain concrete adapters in `scripts/market-session-evidence.mjs`; owner interpretation remains in registry-selected `ToolModelRead/v1` adapters.

### Validation Checkpoints

- **After 01:** pure contract/calendar/session vectors, deterministic identity checks, a real whole-graph closed-date bundle with closure/prior-close/next-open proof and typed not-applicable live evidence, invalid-proof refusal, and the existing repository selftest baseline must pass before a provider adapter starts.
- **After 02 and 03:** captured external-response contract tests, source-use/security checks, and the read-only no-write source smoke must distinguish current evidence from truthful unavailability.
- **After 04:** exact non-zero-based `ReactionSegment/v1` comparison-window, source, boundary, cutoff, state, semantic-identity, and occurrence-identity checks plus independent canaries must prove the six declared owner consumers retain model ownership and publish only typed evidence interpretations.
- **After 05:** derived registry coverage must prove the observed 23/22 canary and a valid 24/23 mutation without literal runtime counts.
- **After 06 through 08:** authorship, lifecycle, history, and final aggregation each run scenario-specific persistent regressions before the next consumer starts.
- **After 09:** real temporary Git worktree/remote tests must prove one coherent pointer graph or no movement, including every injected phase failure and dirty-root preservation.
- **After 10:** browser E2E runs at 390x844 and 1440x1000 plus 130% text zoom, then the complete Feature 002 and repository regression commands run before handoff.

## Dependency Graph

| # | Scope | Depends On | Primary Surfaces | Status |
| --- | --- | --- | --- | --- |
| 01 | [MarketSessionEvidence foundation](01-market-session-evidence-foundation/scope.md) | - | `rlcontracts.js`, `rlsession.js`, contract vectors | Done |
| 02 | [Yahoo extended-hours evidence](02-yahoo-extended-hours-evidence/scope.md) | 01 | calendar projection, Yahoo adapter, session snapshots | Done |
| 03 | [CPI release evidence](03-cpi-release-evidence/scope.md) | 01 | BLS adapters, consensus artifacts, report evidence | Done |
| 04 | [Event reaction and owner integration](04-event-reaction-and-owner-integration/scope.md) | 02, 03 | reaction joins, six eligible owner reads, owner canaries | Done |
| 05 | [Registry-wide normalized reads](05-registry-wide-normalized-reads/scope.md) | 04 | `tools.json`, `rldata.js`, read adapters, registry canaries | Done |
| 06 | [Bounded authorship and recommendation lifecycle](06-bounded-authorship-and-recommendation-lifecycle/scope.md) | 05 | author boundary, budgets, validators, lifecycle reducer | Done |
| 07 | [Bounded history and legacy migration](07-bounded-history-and-legacy-migration/scope.md) | 06 | `briefs/**`, indexes, monthly JSONL, migration | Done |
| 08 | [Window-aware final aggregation](08-window-aware-final-aggregation/scope.md) | 06, 07 | final compaction/validation, window policy, low-noise gate | Done |
| 09 | [Evidence-first atomic publication](09-evidence-first-atomic-publication/scope.md) | 08 | scheduler, isolated worktree, exact Git inventory, pointers | Done |
| 10 | [Shared UI and Pages acceptance](10-shared-ui-and-pages-acceptance/scope.md) | 09 | `rlbrief.js`, `rlapp.js`, registered pages, static browser | Done |

## Pickup Rule

An implementation agent selects the lowest-numbered `Not Started` scope whose dependencies are all `Done`. Scope 02 is selected before Scope 03 when both become eligible. No scope may begin from this index until its own `scope.md`, Test Plan, report scaffold, scenario-manifest entries, and `test-plan.json` rows are synchronized.

## Global Change Boundary

Allowed implementation families are exactly those named in `design.md` under `## Change Boundary and Consumer Impact`, plus Feature 002 test files and generated artifacts declared by a validated run manifest. Excluded surfaces include all Spec 001/Causal Rotation artifacts, other specs, owning model formulas, unrelated HTML styling or navigation, package/dependency manifests, credential/private browser/portfolio data, deployment/monitoring/backup/knb surfaces, and every unrelated dirty or untracked path.

No scope may reset, restore, stash, clean, stage, reformat, or commit unrelated work. Collateral cleanup requires a new plan-owner reconciliation before execution.

## Shared Infrastructure Controls

Changes to `rlapp.js`, `rldata.js`, `rlbrief.js`, `tools.json`, `scripts/brief-refresh.mjs`, the static test server, or shared browser harness are protected. Each touching scope must capture the declared independent canary before broad regressions, preserve an explicit rollback/restore path, and prove the canary does not validate itself through the changed helper.

The current 23 registry entries and 22 source tools are dated canary expectations only. Runtime behavior must derive counts and IDs from the frozen registry, and the added-source mutation must prove 24/23 behavior without a page, scheduler, prompt, or validator list edit.

## Requirements and Business-Scenario Traceability

The pre-amendment contracts SCN-002-001 through SCN-002-015 remain stable IDs but move to Scopes 05 through 10 after the foundation, provider, report, and owner-read prerequisites. The amendment-specific contracts SCN-002-016 through SCN-002-028 fill the new foundation and vertical source/reaction/final slices.

| Outcome Slice | Requirements | Business Scenarios | Acceptance Criteria | Planned Scenarios | Primary Scopes |
| --- | --- | --- | --- | --- | --- |
| Shared source, calendar, and cutoff truth | FR-092 through FR-097 | BS-002-019, BS-002-024, BS-002-025 | AC-021, AC-026, AC-027 | SCN-002-016, SCN-002-021, SCN-002-022 | 01 |
| Extended-hours price and reviewed source contract | FR-098 through FR-102, FR-131 | BS-002-020, BS-002-025 | AC-022, AC-027, AC-033 | SCN-002-017, SCN-002-028 | 02 |
| Comparable extended-hours volume | FR-103 through FR-109 | BS-002-021, BS-002-025 | AC-023, AC-027 | SCN-002-018, SCN-002-017 | 01, 02 |
| Released-report lifecycle, surprise, disagreement, and revision | FR-110 through FR-116 | BS-002-022, BS-002-026, BS-002-027 | AC-024, AC-028, AC-029 | SCN-002-019, SCN-002-023, SCN-002-024 | 03 |
| Release-aligned reaction and owner authority | FR-117 through FR-121, FR-127 through FR-129 | BS-002-023, BS-002-026, BS-002-027, BS-002-029 | AC-025, AC-028, AC-029, AC-031 | SCN-002-020, SCN-002-026 | 04 |
| Registry-derived truthful source coverage | FR-001 through FR-010, FR-064 through FR-065, FR-071, FR-074 through FR-075, FR-087 through FR-090 | BS-002-001 through BS-002-005, BS-002-018, BS-002-029 | AC-001 through AC-005, AC-018, AC-031 | SCN-002-001 through SCN-002-003 | 05 |
| Bounded authorship and recommendation lifecycle | FR-004 through FR-008, FR-012, FR-018, FR-020 through FR-042, FR-056 through FR-058, FR-064 through FR-077 | BS-002-001 through BS-002-009, BS-002-015, BS-002-016 | AC-001 through AC-009, AC-015, AC-016 | SCN-002-004 through SCN-002-006 | 06 |
| Current pointers, append-only history, and legacy parity | FR-037 through FR-054, FR-059 | BS-002-006 through BS-002-009, BS-002-013 through BS-002-015 | AC-006 through AC-009, AC-013 through AC-015 | SCN-002-007 through SCN-002-009 | 07 |
| Window relevance, cutoff-safe final synthesis, and low-noise gate | FR-122 through FR-130 | BS-002-028 through BS-002-030 | AC-030 through AC-032 | SCN-002-025, SCN-002-027 | 08 |
| Ordered atomic publication and prior-state preservation | FR-011 through FR-019, FR-024 through FR-028, FR-054 through FR-063, FR-067 through FR-070, FR-077, FR-132 | BS-002-005, BS-002-006, BS-002-009 through BS-002-012, BS-002-016, BS-002-017, BS-002-025 | AC-005, AC-006, AC-009 through AC-012, AC-016, AC-017, AC-019, AC-020, AC-027, AC-033 | SCN-002-010 through SCN-002-012 | 09 |
| Shared Simple, Power, focused history, accessibility, and Pages | FR-010, FR-024 through FR-028, FR-043 through FR-049, FR-073, FR-076, FR-078 through FR-091, FR-098 through FR-132 | BS-002-001 through BS-002-030 | AC-001 through AC-033 | SCN-002-013 through SCN-002-015 plus UI regressions for SCN-002-017 through SCN-002-025 and SCN-002-027 | 10 |

### Non-Functional Requirement Assignment

| Requirement | Analyst-Owned Meaning | Assigned Active Scopes |
| --- | --- | --- |
| NFR-023 | Low-noise continuity | 02, 03, 04, 05, 06, 08, 10 |
| NFR-024 | Educational boundary | 03, 04, 05, 06, 08, 10 |

All FR-001 through FR-132, NFR-001 through NFR-024, BS-002-001 through BS-002-030, and AC-001 through AC-033 are assigned. No active scope changes Spec 001 or depends on its completion.
