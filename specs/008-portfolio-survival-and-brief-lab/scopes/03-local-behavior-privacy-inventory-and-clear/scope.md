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

- [x] FR-019, FR-022 through FR-023, and FR-027 through FR-038 are fully implemented with closed provenance classes, relevance-only authority, safe inventory, separate verified clear operations, no cross-device/engagement/sensitive profiling, documented eligible events, visible versioned decay inputs, quarantine, and inert text.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` · **Exit Code:** 0

  15 of 15 ids carried. Scored on a substring-guarded scan that counts an id only when it
  sits inside the **message argument** of an `assert.*` call; a comment, a `test(...)`
  title, and a bare code identifier are all rejected. The guard matters here rather than
  theoretically: `FR-019` shows 41 raw occurrences but only 10 guarded, because 31 of them
  are the tail of `NFR-019`. `FR-023` shows 60 raw against 36 guarded.

  Eleven ids are carried by a literal id in the message. Four — **FR-030, FR-031, FR-032,
  FR-035** — are carried by an interpolated `${requirement}` message driven by the frozen
  `EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT` table whose keys are exactly those ids plus
  FR-033. That carriage is table-driven, not literal, and it is non-vacuous: the table
  length, each token list's non-emptiness, the attempted-versus-declared token count, and
  the union against the policy's excluded-field count are each asserted.

  Thinnest carriage in the item: FR-022 and FR-033 each rest on one literal message.
  Per-id table in [report.md](report.md#coverage-report).

  ```
  ✔ FR-019: a stored holding carries exactly one declared provenance class and each of the other five declared classes is refused as an invalid class (4.965597ms)
  ✔ FR-036: every behavior evidence-floor and decay input is a visible declared finite policy value and its version is stamped onto every event (2.561198ms)
  ✔ FR-037: a corrupt unrecognized or future-version behavior record is quarantined with an inspectable reason and no part of the workspace is interpreted (68.235556ms)
  ✔ FR-029: no read compose inventory or export path removes personal data, and the same bytes do clear when the clear is explicitly invoked (35.213177ms)
  ✔ FR-030 FR-031 FR-032 FR-033 FR-035: every excluded source named by each requirement is a declared token, is refused by name on both the build and the persistence path, and the refusal is selective (153.518001ms)
  ✔ FR-023: the module carries no egress sink, every byte it writes lands in the declared personal namespace, and the preview that declares it excludes personal values genuinely excludes them (52.210267ms)
  ✔ FR-027: the local privacy inventory reports each named personal group on its own surface, separates dismissed from completed, and keeps cached generic evidence out of the personal count (92.34584ms)
  ✔ FR-028: a behavior clear removes the eligible events and empties the derived-interest container while holdings mandate and cash needs survive, and the separately requested clears do remove them (55.30567ms)
  ✔ FR-034: an eligible behavior event is admitted only for a documented completed research action and retains category subject domain timestamp source surface and lifecycle state (14.227495ms)
  ✔ FR-038: an imported provider label carrying markup or a navigation scheme is retained as inert text with no navigation authority, and the recommendation token fields refuse it while still accepting a legitimate token (79.824371ms)
  ℹ tests 47
  ℹ pass 47
  ℹ fail 0
  ```

- [x] NFR-001, NFR-003 through NFR-004, NFR-008, NFR-019, and NFR-023 through NFR-024 are satisfied by local-only state, exact why/inventory evidence, no engagement objective, visible persistence failure, safe input, traceable clearing, and verified deletion.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` and `node --test tests/portfolio-privacy.functional.mjs` · **Exit Code:** 0 and 0

  7 of 7 ids carried, every one by a **literal** id inside an `assert.*` message. No id in
  this item depends on interpolation. The same substring guard was applied in the opposite
  direction, so none of these counts borrow from the FR ids they contain.

  Residual fact recorded rather than hidden: all nine **NFR-003** messages sit inside the
  one test whose own title ends "all hold on the mandate surface", which is Scope 02's
  surface. NFR-003 is genuinely carried by named assertions and this run did not move it
  onto the behavior, inventory, or clear surface; the explainability claim on this scope's
  own surface is carried under NFR-023 instead.

  Per-id table in [report.md](report.md#coverage-report).

  ```
  ✔ NFR-001: every personal noun the id names is stored in the declared local namespace and appears in none of the public projections the module emits, while the local-only projections that legitimately carry it prove the same search does find it (57.968678ms)
  ✔ NFR-004: no declared ranking input is an engagement metric, every click dwell and retention source is refused by name on the path that grows ranking evidence, and a research completion is still admitted and still counted (43.686384ms)
  ✔ NFR-008: a throwing store and a silently dropping store both surface an explicit write failure with no success state, capability loss is reported in words, and the same commit still succeeds unfaulted (31.638388ms)
  ✔ NFR-019: every declared credential field name and credential value shape is rejected without echoing the value, markup does not smuggle a credential past the guard, and an ordinary provider label is still imported (22.666092ms)
  ✔ NFR-023: a recommendation route cites the exact revision identity it used or names why it cannot, and a clear reports a per-category change that matches the inspected before and after inventory (68.312875ms)
  ✔ NFR-024: local deletion is certified only after an independent reread proves emptiness, a survivor or an unreadable key blocks the success state, and the raw namespace confirms it without trusting the report (2.460499ms)
  ℹ tests 47
  ℹ pass 47
  ℹ fail 0
  ✔ NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: provenance missing-state integrity atomic revisions latest-complete publication and the research boundary all hold on the mandate surface (161.662834ms)
  ℹ tests 11
  ℹ pass 11
  ℹ fail 0
  ```

- [ ] Full-personal clear mechanically verifies holdings, mandate/needs, events, interests, outcomes, scenarios, allocations, dossiers, quarantine, UI state, session fallback, and return context are empty while public generic assets remain.

  Unchecked — ruling recorded as decision D-03-08. The accounting below supersedes the earlier "9 of 13" note; the coverage genuinely improved, but not onto the four nouns that block this line.

  Two different thirteens meet here and must not be conflated. The clear sweeps **13 surfaces** — 5 derived workspace array sections, 2 workspace pointers, and 6 declared storage keys — and **11 of those 13 are proven non-empty before the clear**, which is a real result. But this DoD line enumerates **13 nouns**, and against its own enumeration the split is:

  - **Populated and swept (7):** holdings, mandate, needs, events, quarantine, session fallback, return context.
  - **Swept but vacuous, pinned (2):** interests, outcomes. No exported builder can write either one, so their emptiness assertion proves nothing on its own — but the limit is pinned by `the two personal sections the clear sweep cannot populate are pinned by their own distinct refusal`, which holds each to a *distinct* reason (`unsupported-contract-scope`, `workspace-hash-mismatch`) plus an untouched-spread control, and goes red the moment a write path appears. This pair is accepted as verified-by-construction.
  - **No runtime representation at all (4):** **scenarios, allocations, dossiers, UI state.** None is a workspace array section and none is a declared storage key, so the clear does not sweep them in any sense and no assertion observes them.

  The four are what keep this unchecked, and the "the derived sweep will absorb them later" defence only half holds. `personalWorkspaceSections` genuinely derives itself from the empty-workspace contract, so a future scenarios/allocations/dossiers **array** section is absorbed with no test edit. But both declared-key helpers name each policy field explicitly rather than iterating the storage section, so a future **UI-state storage key** would fall outside the sweep silently — no present coverage, no auto-absorption, and no pinning test. "Mechanically verifies" is not satisfied by a noun that has no surface and whose arrival nothing detects. Full reasoning in [report.md](report.md#coverage-report).

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

- [x] TP-03-03 functional evidence proves category-by-category verified deletion, preservation, and partial-failure truth against raw namespaced state.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-privacy.functional.mjs` · **Exit Code:** 0

  The row's earlier gap is closed at HEAD. The named file now calls `privacyInventory` (3),
  `clearFoundationStorage` (4), `buildBehaviorClearCandidate` (1), and
  `foundationPrivacyInventory` (1); the previous note recorded zero of the first three.
  All four clauses of this line are carried by named assertions in the named file:

  - **category-by-category** — six populated categories are proven on both axes by a
    per-category matrix compared against the runtime's own `clearedBy` declaration
    (`every populatable category must behave exactly as its clearedBy declaration and the
    all-personal verified-empty contract say`). The category list is read off the inventory,
    not written into the test, and an unclassifiable new token is refused.
  - **verified deletion** — the post-state is re-read by reopening the store from the
    persisted bytes, and the all-personal arm requires `verifiedEmpty` with an empty
    remaining-key list before its emptiness is accepted.
  - **preservation** — bystanders are held to their **exact prior record count**, not merely
    to being present (`the behavior clear must empty exactly the categories that declare it
    and leave every other category at its exact prior count`), plus the generic public caches
    byte-identical on both arms.
  - **partial-failure truth against raw namespaced state** — all six declared clear steps are
    faulted one at a time (`every declared clear step must have been faulted on its own, not
    a subset`); each refusal is checked for `P008-STORE-WRITE` / `foundation-clear-incomplete`,
    carries no success payload, and leaves exactly one surviving key, read back from the raw
    namespace.

  Anti-vacuity is per-category and per-step rather than global, and the preservation half is
  proven red-able by aiming the same checker at the whole-store clear, which must report all
  five destroyed bystanders. Clause map and residuals in [report.md](report.md#tp-03-03).

  ```
  ✔ FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state (62.76457ms)
  ✔ rolling a mandate back restores the pre-mandate portfolio state by identity, not by resemblance (50.958475ms)
  ✔ each declared privacy category is deleted by the clear that names it and survives the clear that does not, one category at a time (64.775069ms)
  ✔ every declared clear step is faulted on its own, the other steps still delete, and the retained bytes refuse a success result (2.295399ms)
  ℹ tests 13
  ℹ suites 0
  ℹ pass 13
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 847.010298
  ```

- [x] TP-03-04 Regression E2E evidence proves SCN-008-011 clears behavioral ranking and preserves portfolio, mandate, cash needs, cache, and watchlist.

  **Claim Source:** executed · **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs` · **Exit Code:** 0

  The row's declared `--grep` form selects exactly the test below; the executed command is that
  form's superset over the same file.

  ```
  Running 8 tests using 1 worker
    ✓  7 … clear behavior removes ranking influence and preserves portfolio (3.2s)
  [SCN-008-011] eligibleCompletionsBeforeClear=4
  [SCN-008-011] rankedSubjectsBeforeClear=2
  [SCN-008-011] previewOnlyChangedProjection=false
  [SCN-008-011] rankingSurvivedReload=true
  [SCN-008-011] duplicateSameDayCompletion=rejected
  [SCN-008-011] eligibleCompletionsAfterClear=0
  [SCN-008-011] interestSignalsAfterClear=0
  [SCN-008-011] portfolioPreserved=true
  [SCN-008-011] mandatePreserved=true
  [SCN-008-011] clearedSubjectScope=behaviorEvents,interestSignals,actionOutcomes,rankingRows
  [SCN-008-011] cashNeedsPreserved=true
  [SCN-008-011] publicCacheByteIdentical=true
  [SCN-008-011] foreignStorageKeys=rlData
  [SCN-008-011] remotePersonalRequests=0

    8 passed (23.4s)
  ```

  All seven clauses of the line are carried: `e2e-ui` regression (`:628`, no interception in the
  file); ranking cleared (`:712` exact empty influence text, `:713` zero rank rows, `:736` a
  bare-token sweep over the three stored behavior sections, `:739` the same over the rank rows'
  `dataset`, which `innerText` cannot see); portfolio preserved (`:744`–`:746`, `:750`, plus the
  **positive** `:759` holdings assertion); mandate preserved (`:747`, `:748`, `:751`, plus the
  positive `:763` constraints-in-declared-order assertion); cash needs preserved (`:774`–`:775`,
  on every dependent route, after the clear); cache preserved (`:782`, byte-identical, not
  field-wise); watchlist preserved (same `:782` — the watchlist is a member of the compared
  object, so byte-identity is strictly stronger than a per-field check — with `:783` pinning the
  foreign key set against both drops and additions).

  The preservation half is not a restatement of "this page never names that key": the public cache
  is written by the test and a clear that widened to a whole-store wipe destroys it. The cleared
  half is not vacuous either — the ranking is proven populated first and re-read after a full page
  reload, which separates a projection-derived surface from a draft-derived one. Clause map,
  provenance, and the two failures this row survived are in [report.md](report.md#tp-03-04).

- [x] TP-03-05 Regression E2E evidence proves SCN-008-012 stores no engagement/sensitive/cross-device profile and shows the exclusion contract.

  **Claim Source:** executed · **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs` · **Exit Code:** 0

  ```
  Running 8 tests using 1 worker
    ✓  8 …012 behavior evidence excludes engagement and sensitive profiling (5.6s)
  [SCN-008-012] legitimateCompletionsRecorded=2
  [SCN-008-012] excludedSourcesAttempted=33
  [SCN-008-012] excludedSourcesDeclared=33
  [SCN-008-012] excludedSourcesAccepted=0
  [SCN-008-012] observedActivityEvents=0
  [SCN-008-012] observedActivityGenerations=0
  [SCN-008-012] storedExcludedTokens=0
  [SCN-008-012] excludedTokenScope=behaviorEvents,interestSignals,actionOutcomes
  [SCN-008-012] excludedSourceCountShown=0
  [SCN-008-012] crossDeviceIdentifiers=0
  [SCN-008-012] hiddenProfileNamespaces=0
  [SCN-008-012] cookies=0
  [SCN-008-012] indexedDbStores=0
  [SCN-008-012] engagementCopyOutsideExclusionInventory=0
  [SCN-008-012] remotePersonalRequests=0

    8 passed (23.4s)
  ```

  All five clauses are carried: `e2e-ui` regression (`:777`); no engagement profile (pointer,
  scroll, tab, settings, and a real elapsed dwell are genuinely produced, then `:852` asserts the
  stored count did not move and `:853` that no generation was committed, with `:934` forbidding
  engagement wording where it would constitute an engagement objective); no sensitive profile
  (every declared excluded source attempted through the real UI and refused by name with
  `P008-SCHEMA-CORRUPT` / `forbidden-behavior-source`, the offered set equated to the policy's
  declared set at `:858` so the sweep cannot silently shrink, and `:909` quantifying over the
  stored shape with exact key-set equality so an unlisted key fails); no cross-device profile
  (`:945`–`:949` cookie, foreign namespace, session, IndexedDB, and service worker, plus `:956`
  origin scan); and the exclusion contract shown (`:917` exact `0` rather than a prefix, `:918`
  exact profile statement, `:920`–`:922` the rendered inventory naming every declared field).

  The claim is a negative, so an implementation recording nothing would satisfy every refusal.
  Two positive controls prevent that — one legitimate completion admitted before the refusal
  sweep and a second after it, both `eligible`. The scoped token sweep is separately proven
  non-vacuous by confirming the colliding declared holding fields genuinely exist in the imported
  holdings. Clause map in [report.md](report.md#tp-03-05).

- [ ] TP-03-06 broader E2E evidence proves the complete foundation/clear matrix passes with previous scope behavior intact.

  Unchecked. The row was executed this run with the Test Plan command and is green — `10 passed`,
  `0 failed`, exit `0`. The second clause is carried: Scopes 01 and 02 are certified `done` and
  all six rows attributable to them (`:87`, `:184`, `:260`, `:299`, `:403`, `:491`) passed in the
  same invocation, so no prior-scope behavior regressed.

  The first clause is not carried. The line asserts a **matrix**, which is three axes: the 6
  foundation scenarios the Test Plan row names; the 8 categories `rlportfolio.js:2227`–`:2234`
  declares × the 2 clear operations; and the 6 declared clear steps plus a control. Axis 1 is
  fully carried. Axis 3 is fully carried by `:1160`, which faults every declared step on its own,
  proves retention for the four durable-mode keys, and names the two session steps as
  refusal-only rather than folding them into a count. Axis 2's all-personal column is asserted
  cell by cell in the `:1124`–`:1132` loop against each category's own declaration.

  Axis 2's behavior column is where the clause fails. **Two cells have no assertion at all:**
  quarantine PRESERVED and session-fallback PRESERVED. The behavior-clear arm never stocks either
  — `populateQuarantine` runs only at `:1089`/`:1182`, and the arm runs in durable mode — and the
  one namespace guard it carries filters to keys outside `rlPortfolioWorkspaceV1.`, which
  structurally excludes `rlPortfolioWorkspaceV1.quarantine`, while reading `localStorage` only, so
  neither session key is visible either. A behavior clear that widened into those keys would pass
  the row unchanged. Three further cells are vacuous, including `interest-signals`, which the
  previous pass recorded as carried; a repository sweep shows no code path anywhere writes
  `interestSignals` or `actionOutcomes`, so both are structurally empty and neither emptying is
  proven. Cell-by-cell mapping is in [report.md](report.md#tp-03-06).

  Closing the two decisive cells needs only test-side changes inside this scope's declared allowed
  file: stock the quarantine key and run one session-mode arm, then assert both survive the
  behavior clear. The three vacuous cells cannot be closed that way — the two categories have no
  producer in the product at all — and stay pinned as core item 3 already rules. Not done on this
  pass, which was scoped to executing and adjudicating this one row with no new test code. One
  planning-owned observation is raised in the report: the UI Scenario Matrix requires a partial
  clear to offer a *scoped retry*, and no implementation or assertion for it exists.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, personal-category and raw-storage scans, full/partial-clear proof, forbidden-field/source and unsafe-text scans, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16.
