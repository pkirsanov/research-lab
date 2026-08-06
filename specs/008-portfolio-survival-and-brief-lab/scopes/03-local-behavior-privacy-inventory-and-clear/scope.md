# Scope 03: Local Behavior, Privacy Inventory, And Clear

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** In Progress

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `privacy-critical:true`, `shared-infrastructure:true`

**Depends On:** Scope 02 - Mandate And Cash-Need Authority

**Primary Outcome:** A user can inspect the exact local personal-data categories and eligible completed-research evidence, prove that engagement/settings/sensitive inputs never become behavior evidence, clear behavioral influence without deleting explicit portfolio facts, and clear all personal data only after category-by-category verification.

## Requirement Coverage

- **Functional:** FR-019, FR-022 through FR-023, and FR-027 through FR-038.
- **Non-functional:** NFR-001, NFR-003 through NFR-004, NFR-008, NFR-019, and NFR-023 through NFR-024.
- **Cross-cutting:** behavior never supplies mandate, expected return, Black-Litterman view, confidence, survival floor, exposure materiality, execution authority, or sensitive-trait inference.

## Gherkin Scenarios

### SCN-008-011 - Clear behavior history removes its influence

```gherkin
Scenario: A user clears local behavior history
  Given behavior-derived items currently affect brief ranking
  When the user confirms Clear behavior history
  Then eligible events and derived InterestSignals are removed locally
  And the next composition contains no behavior-derived ranking influence
  And holdings, mandate, cash needs, and public watchlist remain unless separately cleared
```

### SCN-008-012 - No engagement or sensitive profiling

```gherkin
Scenario: The local ranking model evaluates user activity
  Given pointer movement, dwell time, scroll depth, settings, and sensitive-trait fields exist or can be observed
  When eligible behavior evidence is selected
  Then those sources are excluded
  And only named completed research-action categories may contribute
  And no cross-device identifier or hidden profile is created
  And ranking optimizes research relevance rather than engagement
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|----------|---------------|------------|----------------------|-----------|
| SCN-008-011 behavior clear | Portfolio, mandate, events, interests, outcomes, and public cache exist | Open Local Privacy, inspect categories, confirm behavior clear | Events/interests/outcomes verify empty; held/mandate/cash-need hashes and public cache/watchlist remain unchanged; brief recomposes immediately | e2e-ui |
| SCN-008-012 profiling exclusion | UI receives clicks, pointer/dwell/scroll, settings, parameter and sensitive test inputs | Exercise every public lifecycle operation and inspect inventory | Only closed completed-research records exist; excluded-source counts remain zero; no hidden score, trait, cross-device ID, or engagement copy appears | e2e-ui |
| Clear all personal data | All personal categories and generic public assets exist | Type exact confirmation, clear, inspect post-clear inventory | Every personal namespace/category verifies empty; generic cache/watchlist remain; any retained category blocks success and offers a scoped retry | e2e-ui |

## Implementation Plan

1. Extend `rlportfolio.js` with closed `BehaviorEvent/v1`, `InterestSignal/v1`, action-outcome lifecycle, safe quarantine, semantic de-duplication, explicit completion eligibility, and category/subject/domain/horizon-only records.
2. Reject raw text, clicks, opens, pointer/dwell/scroll, mode/tab/window/filter/sort/settings/parameters, quantities, costs, P&L, goals, cash amounts, credentials, traits, and cross-device/account identifiers from every behavior operation.
3. Implement `privacyInventory` as safe category counts/states only, separating holdings/revisions, mandate/needs, events, interests, action outcomes, scenarios/allocations/dossiers, quarantine, UI state, and public generic cache.
4. Implement `clearBehavior` as one atomic workspace generation with events, signals, and completed/dismissed outcomes empty while portfolio/mandate/cash needs/scenarios/public data remain unchanged.
5. Implement `clearAllPersonalData` as verified tombstone, namespace deletion, reread, and post-clear inventory. Partial deletion names only safe category/reason and cannot emit a success state.
6. Add Local Privacy sheet, separate confirmation flows, typed `CLEAR ALL LOCAL DATA`, session-only consequences, excluded-source inventory, clear-history access wherever behavioral ranking will appear, and post-clear proof.
7. Add deterministic behavior/clear fault fixtures and production-module tests. A completion preview exposes the exact minimal event and future relevance effect; no event is automatic or preselected.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad tests |
|-------------------|---------------------|-----------------------------------------|
| Private workspace slots | Portfolio/mandate revisions, generation, semantic hash, last-valid slot, session fallback | Scope 01/02 import and mandate round trips rerun before behavior composition tests |
| Privacy inventory | Counts and safe states never expose personal values or become a second data source | Independent functional sentinel scan reads raw storage keys and compares only category hashes/counts |
| Clear operations | Behavior-only and full-personal operations have distinct affected/preserved sets | Fault injection at tombstone/delete/reread steps plus post-clear inventory assertions |

## Change Boundary And Rollback

**Allowed files:** `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, and Scope 03 fixture entries.

**Explicitly excluded:** `rldata.js`, `rlnav.js`, `rlbrief.js`, generic Market Brief artifacts/scripts/scheduler, analytics formulas, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove only Scope 03 marker-bounded behavior/privacy/UI/test additions. Reopen Scope 02 state and prove portfolio/mandate hashes and storage generation are preserved. A source rollback does not clear browser data; shipped clear controls own explicit local deletion.

## Scenario-First Red/Green Contract

Write every closed-event, clear, inventory, UI, and sentinel assertion before production behavior. Execute each exact command through the Bubbles tool log with `SCOPE-03` and red/green tags. A valid RED proves forbidden persistence, retained influence, false clear success, or missing user-visible state; a self-authored fixture echo is not valid proof.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-03-01 | Unit | unit | SCN-008-011, SCN-008-012 | `tests/portfolio-foundation.unit.mjs` | Execute the closed event vocabulary, forbidden-field mutation set, de-duplication, exact lifecycle transitions, privacy inventory projection, atomic behavior clear, tombstone/full clear, and deletion-failure states | `node --test tests/portfolio-foundation.unit.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Functional | functional | SCN-008-011, SCN-008-012 | `tests/portfolio-brief.functional.mjs` | Derive only relevance consumers from eligible completions, prove clicks/settings/dismissal/automatic invalidation create no event or negative preference, and prove behavior clear removes rank influence on immediate recomposition | `node --test tests/portfolio-brief.functional.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Privacy clear functional | functional | SCN-008-011, SCN-008-012 | `tests/portfolio-privacy.functional.mjs` | Inspect raw namespaced state with sentinels, fault every clear step, verify requested categories empty, preserve explicit/public categories, and reject success on retained bytes | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-03-03` |
| TP-03-04 | Regression E2E | e2e-ui | SCN-008-011 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio" --reporter=list` | Yes | `report.md#scenario-scn-008-011` |
| TP-03-05 | Regression E2E | e2e-ui | SCN-008-012 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-012 behavior evidence excludes engagement and sensitive profiling` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-012 behavior evidence excludes engagement and sensitive profiling" --reporter=list` | Yes | `report.md#scenario-scn-008-012` |
| TP-03-06 | Broader Regression E2E | e2e-ui | SCN-008-001 through SCN-008-004, SCN-008-011, SCN-008-012 | `tests/portfolio-survival-foundation.spec.mjs` | Execute the cumulative foundation route, including behavior-only clear, full-personal clear, partial deletion failure, and prior import/mandate preservation | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-03-06` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-019, FR-022 through FR-023, and FR-027 through FR-038 are fully implemented with closed provenance classes, relevance-only authority, safe inventory, separate verified clear operations, no cross-device/engagement/sensitive profiling, documented eligible events, visible versioned decay inputs, quarantine, and inert text.

  Unchecked — 9 of 15 ids carried. **Uncovered: FR-019** (no assertion enumerates the six provenance classes), **FR-023** (no local-only, remote, or network assertion), **FR-036** (zero decay, half-life, or sensitivity assertions), **FR-037** (quarantine covers workspace shapes, not behavior records). **Partial: FR-029** (confirmation half is `e2e-ui`), **FR-038** (no markup or navigation assertion). Carried: FR-022, FR-027, FR-028, FR-030, FR-031, FR-032, FR-033, FR-034, FR-035. Per-id table in [report.md](report.md#coverage-report).

- [ ] NFR-001, NFR-003 through NFR-004, NFR-008, NFR-019, and NFR-023 through NFR-024 are satisfied by local-only state, exact why/inventory evidence, no engagement objective, visible persistence failure, safe input, traceable clearing, and verified deletion.

  Unchecked — 3 of 7 ids carried. **Uncovered: NFR-001** (no public-surface, remote, or network assertion). **Partial: NFR-003** (named only on the mandate surface, which is Scope 02), **NFR-019** (credential half only; markup half absent), **NFR-023** (clearing-inspection half only; recommendation tracing has no carrier). Carried: NFR-004, NFR-008, NFR-024. Per-id table in [report.md](report.md#coverage-report).

- [ ] Full-personal clear mechanically verifies holdings, mandate/needs, events, interests, outcomes, scenarios, allocations, dossiers, quarantine, UI state, session fallback, and return context are empty while public generic assets remain.

  Unchecked — 9 of 13 sections verified. **Unverified: scenarios, allocations, dossiers, UI state.** The first three are not array sections of the workspace contract yet and the fourth has no declared storage key, so the clear has nothing to verify for them today. The sweep is derived rather than hardcoded and will absorb them when later scopes add them. See [report.md](report.md#coverage-report) and decision D-03-03.

- [ ] Shared Infrastructure Impact Sweep, independent storage/inventory/clear canaries, and exact rollback/restore proof pass without altering Scope 01/02 facts.

  Unchecked. The Scope 01 and 02 re-run and the raw-namespace and clear-fault canaries are carried by the executed suites. The **exact rollback and restore proof** for this scope's own marker-bounded additions is a source-rollback procedure that no executed command demonstrates.

- [ ] Every Scope 03 behavior has intended RED and same-command GREEN evidence before the broader browser row.

  Unchecked — **0 of 14 behaviors have an intended RED.** All 14 have committed same-command GREEN. No RED record existed before this run and this run was barred from injecting defects. Behavior-by-behavior table in [report.md](report.md#coverage-report).

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [x] TP-03-01 unit evidence proves the event/lifecycle/inventory/clear contracts and every forbidden field/source mutation.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` · **Exit Code:** 0

  ```
  ✔ unknown legacy workspace shapes refuse migration and quarantine metadata is value-safe (1.147599ms)
  ✔ foundation privacy inventory and verified clear remain available without policy config (0.831799ms)
  ✔ behavior event vocabulary is closed to the declared categories lifecycle states and draft fields (14.746685ms)
  ✔ every declared excluded behavior source is rejected by name in any casing or separator form at any depth (12.994488ms)
  ✔ semantic de-duplication collapses same-day repeats to the earliest occurrence without shrinking distinct evidence (10.262991ms)
  ✔ action outcome commands map to exactly one lifecycle state and reject mismatched or unknown transitions (7.271293ms)
  ✔ privacy inventory reports real category counts and carries no stored subject value (31.69227ms)
  ✔ behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity (36.937764ms)
  ✔ verified foundation clear reports empty only after reread and a remove fault cannot report success (1.093199ms)
  ✔ verified clear covers every policy-declared personal key and leaves the raw namespace holding none of them (0.719199ms)
  ✔ full-personal clear empties every declared personal section and leaves generic public assets byte-identical (40.82846ms)
  ℹ tests 31
  ℹ pass 31
  ℹ fail 0
  ℹ duration_ms 484.106032
  ```

  Full 31-test output and the per-element row assessment are in [report.md](report.md#tp-03-01). Every element the row declares has a named carrying assertion. The forbidden-source sweep iterates the full declared token list under `every declared token must have been exercised, not merely iterated over`, plus a control proving the refusal is caused by the token rather than by the extra field.

- [x] TP-03-02 functional evidence proves only eligible completions affect relevance and behavior clear removes that influence immediately.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-brief.functional.mjs` · **Exit Code:** 0

  ```
  ✔ only an eligible completion becomes behavior evidence and no excluded source can create or grow one (119.978086ms)
  ✔ route recomposition is invariant to behavior evidence and states that behavior contributes none (28.730573ms)
  ✔ behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline (56.258246ms)
  ✔ dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference (15.908785ms)
  ℹ tests 4
  ℹ suites 0
  ℹ pass 4
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 313.481503
  ```

  Anti-vacuity is genuine rather than incidental: the clear arm re-reads from committed bytes first (`the evidence must genuinely be on disk before the clear is meaningful`) and the invariance arm proves the projection can differ (`the projection must be able to differ, or invariance proves nothing`). Row assessment in [report.md](report.md#tp-03-02).

- [ ] TP-03-03 functional evidence proves category-by-category verified deletion, preservation, and partial-failure truth against raw namespaced state.

  Unchecked. The suite is green (11 pass, 0 fail, exit 0) but does not carry the row: `tests/portfolio-privacy.functional.mjs` contains zero `privacyInventory`, zero `clearFoundationStorage`, and zero `buildBehaviorClearCandidate` calls. Its only clear is `buildMandateClearCandidate`, which is Scope 02 rollback. Four of the row's five declared behaviors are absent from the named file. Test Plan ownership belongs to `bubbles.plan`. See [report.md](report.md#tp-03-03).

- [ ] TP-03-04 Regression E2E evidence proves SCN-008-011 clears behavioral ranking and preserves portfolio, mandate, cash needs, cache, and watchlist.

  Unchecked. Not executed this run.

- [ ] TP-03-05 Regression E2E evidence proves SCN-008-012 stores no engagement/sensitive/cross-device profile and shows the exclusion contract.

  Unchecked. Not executed this run.

- [ ] TP-03-06 broader E2E evidence proves the complete foundation/clear matrix passes with previous scope behavior intact.

  Unchecked. Not executed this run.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, personal-category and raw-storage scans, full/partial-clear proof, forbidden-field/source and unsafe-text scans, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16.
