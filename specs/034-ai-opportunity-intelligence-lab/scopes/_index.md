# Feature 034 — AI Opportunity Intelligence Lab: scope index

Status: planning only. No product implementation or validation is claimed.
Source of truth: `spec.md` (FR-034-001–106, SCN-034-001–032) and `design.md`.
Scope kind: runtime-behavior throughout. Scope 1 is `foundation:true`.

## Execution Outline

### Phase Order

1. **Preserving universe foundation:** import the archive and establish stable company, exposure, security, membership, and immutable identity contracts.
2. **Evidence and critical-path dossier:** make outside-in source, cluster, milestone, and dependency records a reconstructable company assessment.
3. **Keyed refresh generation:** refresh selected identities through rights-qualified providers without shrinking the universe or masking failures.
4. **Scoped economic models:** compute local productivity, retained economics, demand/deflection, and conditional equity sensitivities.
5. **Earnings signal ladder:** separate operating, realization, and expectations conclusions; calendar, options, peer, and notification gates.
6. **Frozen event accountability:** retire completed events and score only pre-event eligible forecasts in their declared windows.
7. **One static research experience:** render Simple, Power, Brief, Journeys, exports, and coverage from one validated generation.
8. **Atomic regeneration and public integration:** connect scheduled/on-demand refresh to Brief publication, pointer-last current selection, owner read, registry, and Pages.

Every scope depends on the preceding scope. Scope N+1 starts only after Scope N is fully verified and accepted. Later scopes may extend the foundation but never retroactively rewrite its historical objects. Scope 8 touches protected Brief publication and registry surfaces; its canary, rollback, and consumer sweep are mandatory.

### New Types And Signatures

```text
ai-opportunity-archive/v1; ai-opportunity-universe/v1; ai-opportunity-evidence/v1
ai-opportunity-source-policy/v1; ai-opportunity-provider-request/v1; ai-opportunity-provider-result/v1
ai-opportunity-cluster/v1; ai-opportunity-dependency/v1; ai-opportunity-milestone/v1
ai-opportunity-bridge/v1; ai-opportunity-assessment/v1; ai-opportunity-event/v1
ai-opportunity-market/v1; ai-opportunity-forecast/v1; ai-opportunity-outcome/v1
ai-opportunity-signal/v1; ai-opportunity-routing/v1; ai-opportunity-generation/v1
ai-opportunity-brief/v1; ai-opportunity-publication/v1; ai-opportunity-current/v1
validateUniverse(records); validateEvidence(record); composeCriticalPath(gates, lag)
composeBridge(inputs, period); classifySignal(assessment, evidence, event)
freezeForecast(candidate, event); scoreOutcome(frozen, actuals, prices)
composeGeneration(predecessor, refreshResults); validatePublication(candidate)
```

`rlaiopportunity.js` owns pure, UMD, clock-free validation and formulas. `scripts/ai-opportunity-refresh.mjs` owns provider orchestration. No source provider writes conclusions or current pointers. The browser reads committed static records only.

### Validation Checkpoints

| After | Gate before next scope | Defect detected |
| --- | --- | --- |
| After Scope 01 | Archive byte/hash, 23/230/196/197 accounting, ten active ranks, unknown identity refusal | Lost or guessed seed identity |
| After Scope 02 | Cluster, contradiction, source clocks, proxy stage, workforce stage, dependency DAG E2E | Result-led or falsely corroborated dossier |
| After Scope 03 | Partial overlay, per-source failure, response-vs-row diff, retry collision E2E | Shrunk or deceptively refreshed universe |
| After Scope 04 | Formula/denominator, cohort timing, capture contracts, user-assumption E2E | Unsupported productivity or cash/stock claim |
| After Scope 05 | Alert ladder, three conclusions, event and options gates, destination refusal E2E | Research warning mislabeled forecast/alert |
| After Scope 06 | Frozen eligibility, event retirement, split-aware declared-window E2E | Hindsight hit or zero-error abstention |
| After Scope 07 | Real static-server four-view/browser E2E, accessibility, trace and export | Broken owner experience or mixed generations |
| After Scope 08 | Brief/owner-read/current-selector coherence, restoration E2E, Pages build, registry parity, shared-publication canary | Partial publication or unreachable public tool |

## Dependency Graph

| # | Scope directory | Primary outcome | SCN ownership | Depends On | Status |
| --- | --- | --- | --- | --- | --- |
| 01 | `01-preserving-universe-foundation` | Imported stable universe | 001–002 | none | Not Started |
| 02 | `02-evidence-critical-path-dossier` | Reconstructable outside-in dossier | 005–010, 027 | 01 | Not Started |
| 03 | `03-keyed-refresh-generation` | Honest partial refresh | 003–004, 027 | 02 | Not Started |
| 04 | `04-scoped-economic-models` | Evidence-bounded productivity and capture | 011–014, 028 | 03 | Not Started |
| 05 | `05-earnings-signals-and-market-gates` | Qualified pre-event watch | 015–020, 023–024 | 04 | Not Started |
| 06 | `06-frozen-event-accountability` | Honest completed-event evaluation | 021–022, 025–026 | 05 | Not Started |
| 07 | `07-static-owner-experience` | Simple, Power, Brief, Journeys | 017, 029–031 | 06 | Not Started |
| 08 | `08-atomic-regeneration-and-public-integration` | Scheduled/on-demand publication and reachability | 032; integration coverage 003–004, 018, 020, 031 | 07 | Not Started |

## Coverage And Boundaries

Scope-level FR ranges: 1 owns 001–016; 2 owns 017–034; 3 owns 023–026 and 083–089; 4 owns 046–057; 5 owns 035–045 and 058–082; 6 owns 072–073 and 092–096; 7 owns 097–106; 8 owns 083–091 and end-to-end publication of 065, 086, 100, 102, 105. Overlapping FRs denote integration coverage, not duplicated ownership. All 106 FRs and all 32 scenarios appear in the active plan.

External routing, email, push, and live Red Alert delivery remain destination-owned and unavailable unless admitted by Feature 020. Feature 028's unresolved mutable market-row policy is excluded. Feature 032 is not an implementation prerequisite; its unfinished company-specific public registration is independent work that overlaps shared registry and Pages surfaces. Scope 8 must re-read Feature 032 state and shared bytes, serialize overlapping edits, and rerun consumer canaries before changing those surfaces. No planning artifact may mark a test or DoD item complete before real execution evidence exists.

Planned tests use the repo's declared Node/Playwright commands in `.specify/memory/agents.md`. Every Test Plan row has one corresponding unchecked DoD test item. All E2E tests must exercise the real product boundary with committed production-format records; request interception may only stand in for third-party acquisition, never for owned graph, model, publication, or reader behavior.

Regression-label synchronization is row based: every explicit `Regression:` title must match across the owning scope Test Plan, `test-plan.json`, and the scenario manifest's `plannedTests`. The two generic regression DoD clauses in each scope are policy obligations, not Test Plan rows; their count must not be compared with the count of explicitly titled regression tests.

Each `SCN-034-001` through `SCN-034-032` has one distinct Gherkin block in its owning scope. Integration scopes may repeat a scenario only through an explicitly scenario-labeled Test Plan row; repeated coverage does not create a second scenario owner.
