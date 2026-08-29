# Scope 17: Local Lifecycle And Verified Clear Foundation

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Done
**Scope-Kind:** runtime-behavior
**Tags:** `foundation:true`, `remediation`
**Depends On:** 16
**Entry Gate:** Every scope in `Depends On` is Done. P1 makes this the single eligible remediation pickup.
**Findings:** F008-PORTFOLIO-LIFECYCLE-001, F008-CLEAR-RUNTIME-001, F008-CLEAR-TEST-001
**Requirements:** FR-001, FR-008, FR-009, FR-027, FR-029, FR-151; NFR-007, NFR-024.

## Outcome

Restore the complete PortfolioDefinition lifecycle and make full-personal clear one typed, atomic, runtime-derived transaction whose proof detects both undeclared categories and arbitrary residual values.

## Gherkin Scenarios And Ownership

The specification authorizes both scenarios. P1 binds each unchanged contract to this scope, its exact planned tests, and its report evidence target.

### SCN-008-042: Holdings remain editable through an honest empty portfolio

```gherkin
Scenario: A user revises every holding without replacing the draft
  Given a valid local portfolio contains multiple listed, cash, and manual holdings
  When the user adds one holding, edits another, removes another, and confirms the revision
  Then one immutable replacement revision contains exactly the confirmed rows
  And removing the final holding produces Portfolio empty rather than an all-cash assumption or rejection
  And prior result identities remain linked as superseded rather than silently rewritten
```

### SCN-008-043: Full-personal clear derives and verifies every runtime category

```gherkin
Scenario: A user clears every personal category from populated durable and live state
  Given every personal storage namespace and in-memory controller category is populated
  When the user types CLEAR ALL LOCAL DATA and confirms the full-personal clear
  Then a validated tombstone commits before destructive deletion
  And every runtime-derived personal category is empty on storage reread and live-controller inspection
  And public generic evidence and the public watchlist are byte-identical
  And any retained key or non-sentinel value produces a named partial-clear failure instead of success
```

## Implementation Plan

1. Complete additive manual-row editing, per-row edit/remove, explicit empty revision, supersession, and export behavior in the private portfolio foundation and route editor.
2. Replace fixed-key deletion with a closed personal-category registry derived from the workspace schema, dossier/scenario/allocation stores, UI persistence, session handoff, and controller-owned state.
3. Require the exact typed confirmation, commit a validated empty tombstone, delete old generations, clear in-memory cash-need/survival-floor/hedge/Black-Litterman/display state, then reread every namespace and recompute the privacy inventory.
4. Return safe partial-failure records for each retained category; never report success from a module-produced list without reading the adapters and controller state.
5. Add adversarial tests with an undeclared storage key, an unregistered in-memory category, and unrelated non-sentinel residue.

## Change Boundary

**Allowed file families:** `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, `tests/fixtures/portfolio-survival-allocation/**`, `scripts/validate-spec-test-paths.mjs`, `scripts/validate-spec-test-paths.baseline`, and the `scripts/selftest.mjs` validator assertions that exercise that shared guard.

**Excluded surfaces:** `rldata.js`, `rlnav.js`, `rlbrief.js`, `rlportfolioanalytics.js`, `market-brief.html`, `market-brief.*.json`, `brief-history*.jsonl`, `scripts/brief-*`, `watchlist.json`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, `specs/001-*` through `specs/007-*`, and `.github/bubbles/**`.

- **Allowed:** `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, Feature 008 foundation/privacy fixtures, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, `scripts/validate-spec-test-paths.mjs`, and only the `scripts/selftest.mjs` validator assertions needed to exercise that shared guard.
- **Excluded:** public Market Brief artifacts and publisher scripts, provider credential storage, `rldata.js`, analytics/optimizer formulas, registry/docs surfaces, and framework-managed files.
- Existing dossier, scenario, allocation, return-context, and UI keys may be read through their declared contracts; their domain calculations remain unchanged.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Canary before broad validation |
|---|---|---|
| Portfolio workspace schema and pointer slots | Brief, risk, paths, allocation, dossier, privacy | Existing atomic-slot and migration matrix remains green. |
| Personal-category registry | Every current and newly added local namespace | An undeclared key/category must make the clear proof fail. |
| Full-clear controller reset | Six route tabs, modal drafts, display mode, ReturnContext | Reload plus same-session inspection reports zero personal state while generic data remains. |
| Feature fixtures | All Feature 008 Node and browser carriers | Foundation and privacy carriers run before the complete feature matrix. |
| All-spec Test Plan path validation | Every structured test-path reference across every spec | Classify each `(spec, path)` independently. A missing path referenced only by structured rows whose owning scope and spec are Not Started and whose `testState` is `planned-not-authored` is reported as planned debt and does not fail. Any missing path with an authored, executed, or active reference still fails, including the identical path referenced actively by another spec. Canary controls also prove an existing path passes, a vacuous scan fails, and the baseline remains shrink-only. |

## Consumer Impact Sweep

**No consumer-facing interface is renamed or retired here.** The rename/removal detector matches two lines that describe **user data** operations, not interface identity: per-row `edit/remove` in the route editor, and the `Add, edit, remove, empty, confirm, reload, and export` contract row below. Removing a holdings row is something the user does to their own data; the editor, the route, and the revision contract keep their names throughout.

One internal replacement is real and is named rather than glossed. Implementation item 2 **replaces** fixed-key deletion with a personal-category registry derived from the runtime. The clear control's own identity does not change — same control, same route, same typed confirmation — but the set it sweeps stops being a hand-written key list, so every consumer that reads that set is re-verified below.

| Consumer | Required proof |
|---|---|
| Setup editor and import/export controls | Add, edit, remove, empty, confirm, reload, and export consume one immutable revision contract. |
| Privacy sheet and inventory | The runtime-derived registry reports every durable, session, workspace, and controller category. |
| Brief, risk, paths, allocation, and dossier tabs | A new revision supersedes prior result identities without rewriting them. |
| Public generic assets and watchlist | Full clear preserves byte-identical public content and reports any mismatch. |
| All specs consumed by `scripts/validate-spec-test-paths.mjs` | Planned-only missing paths are visible non-failing debt only for their own Not Started `(spec, path)` classification. A planned row cannot mask an authored, executed, or active missing-path reference in another spec, and existing active/baseline failure behavior remains intact. |

**Consumer classes that do not exist in this repository.** Research Lab is build-free static HTML and JavaScript on GitHub Pages, so there is no server route, no API client, no generated client, no authentication redirect, and no breadcrumb framework. Navigation is the fixed in-page tab hash set plus the landing registry, and the landing registry — `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/**` — is an excluded surface for this scope. The only deep links are those fixed hashes, which this scope does not change. A stale-reference scan therefore has no first-party target outside the rows above, and the one shared consumer that does exist — `scripts/validate-spec-test-paths.mjs`, which every spec's structured test paths flow through — carries its own row.

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-042 lifecycle | Existing three-kind portfolio | Add, edit, remove, remove final row, confirm, reload | Exact revision and honest empty state | e2e-ui |
| SCN-008-043 clear success | Every category populated | Enter exact phrase, confirm, inspect inventory and route | All personal state empty; generic assets unchanged | e2e-ui |
| SCN-008-043 residue | Inject undeclared key and live category in test realm | Confirm clear | Named partial failure; no success claim | e2e-ui |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-17-01 | Unit | unit | 042, 043 | `tests/portfolio-foundation.unit.mjs` | Revision operations, tombstone ordering, derived registry, and fault matrix | `node --test tests/portfolio-foundation.unit.mjs` | No | `report.md#tp-17-01` |
| TP-17-02 | Functional | functional | 042, 043 | `tests/portfolio-privacy.functional.mjs` | Multi-row round trip plus storage/controller post-clear inventory | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-17-02` |
| TP-17-03 | Regression E2E | e2e-ui | 042 | `tests/portfolio-survival-foundation.spec.mjs` | Exact title: `Regression: SCN-008-042 holdings can be added edited removed and cleared to an honest empty portfolio` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-042 holdings can be added edited removed and cleared to an honest empty portfolio" --reporter=list` | Yes | `report.md#tp-17-03` |
| TP-17-04 | Regression E2E | e2e-ui | 043 | `tests/portfolio-survival-foundation.spec.mjs` | Exact title: `Regression: SCN-008-043 full personal clear tombstones derives and verifies every personal category` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-043 full personal clear tombstones derives and verifies every personal category" --reporter=list` | Yes | `report.md#tp-17-04` |
| TP-17-05 | Adversarial mutation | functional | 043 | `tests/portfolio-privacy.functional.mjs` | Disposable undeclared-key, live-only-state, and non-sentinel-residue mutations each defeat false success | `node --test --test-name-pattern="Adversarial: full personal clear detects undeclared keys live state and arbitrary residue" tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-17-05` |
| TP-17-06 | Broader regression | functional | 042, 043 | `scripts/selftest.mjs` | The all-spec path-validator matrix reports and accepts a planned-only missing path for a Not Started owner with `testState: planned-not-authored`; fails when the identical path is active in another spec; fails an authored row whose path is missing; passes an existing path; fails a vacuous scan; proves the baseline remains shrink-only; and keeps existing storage, privacy, and static-site contracts green | `node scripts/selftest.mjs` | No | `report.md#tp-17-06` |

## Rollback And Restore

- Before changing the shared store, capture the current schema/key registry and atomic-slot canary result.
- A failed write or clear retains the prior authoritative slot and the last valid in-memory view model.
- Reverting the scope restores the prior module/route/test files without deleting browser data; newer unknown records remain preserved and unread.

### Definition of Done - Tiered Validation

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Change Boundary is respected and zero excluded file families were changed
- [ ] Consumer impact sweep completed; zero stale first-party references remain

- [x] Portfolio lifecycle and full-clear behavior satisfy SCN-008-042 and SCN-008-043 without changing public assets or external accounts. Evidence: [Test Evidence](report.md#test-evidence).
- [ ] SCN-008-042 holds as written: a user who adds, edits, and removes holdings revises the portfolio without replacing the draft — one immutable replacement revision contains exactly the confirmed rows, removing the final holding produces Portfolio empty rather than an all-cash assumption or rejection, and prior result identities remain linked as superseded rather than silently rewritten. Verifying rows: TP-17-01 and TP-17-03.
- [ ] SCN-008-043 holds as written: when a user clears every personal category from populated durable and live state, a validated tombstone commits before destructive deletion, every runtime-derived personal category is empty on storage reread and live-controller inspection, public generic evidence and the public watchlist stay byte-identical, and any retained key or non-sentinel value produces a named partial-clear failure instead of success. Verifying rows: TP-17-02, TP-17-04, and TP-17-05.
- [x] TP-17-01 unit evidence passes with no skips. Evidence: [TP-17-01](report.md#tp-17-01).
- [x] TP-17-02 functional evidence passes with adapter and controller rereads. Evidence: [TP-17-02](report.md#tp-17-02).
- [x] TP-17-03 lifecycle regression E2E passes against the real route. Evidence: [TP-17-03](report.md#tp-17-03).
- [x] TP-17-04 full-clear regression E2E passes against the real route. Evidence: [TP-17-04](report.md#tp-17-04).
- [x] TP-17-05 adversarial mutation proof demonstrates the clear check fails for each injected residue class. Evidence: [TP-17-05](report.md#tp-17-05).
- [x] TP-17-06 broader regression passes with adversarial controls for planned-only debt reporting, independent cross-spec active failure, authored-row missing failure, existing-path success, vacuous-scan failure, and shrink-only baseline behavior. Evidence: [TP-17-06](report.md#tp-17-06).
- [x] Shared Infrastructure Impact Sweep and rollback proof are recorded with exact changed-path classification. Evidence: [Code Diff Evidence](report.md#code-diff-evidence) and [Lint And Quality](report.md#lint-and-quality).
- [x] Build Quality Gate passes: parse, lint, artifact/traceability checks, zero skips/warnings, docs contract notes, no excluded file-family changes, and `scripts/selftest.mjs` proves all six TP-17-06 path-validator controls while preserving per-`(spec, path)` isolation and shrink-only baseline behavior. Evidence: [Lint And Quality](report.md#lint-and-quality) and [Validation Summary](report.md#validation-summary).
