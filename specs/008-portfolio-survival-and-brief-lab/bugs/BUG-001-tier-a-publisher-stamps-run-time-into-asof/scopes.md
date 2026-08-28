# BUG-001 Scopes

**Layout:** single-file
**Mode:** bugfix-fastlane
**TDD:** scenario-first

---

## Scope 1 — Bind `asOf` to the analyzed window, and make a refusal legible

**Status:** Done

### Implementation Files

- `scripts/brief-refresh.mjs` — Tier-A snapshot construction, `asOf` bound to the window cutoff
- `rlportfoliobrief.js` — the shared `windowCutoffAt()` helper and its export (additive only)
- `portfolio-survival-allocation-lab.html` — schedule-before-composition, named refusal,
  publication clock read from `snapshotRef.generatedAt`
- `scripts/brief-narrative-parallel.mjs` — payload inherits the published cutoff, no wall-clock fallback
- `scripts/validate-brief-payload.mjs` — cutoff derived through the shared helper
- `notes/market-brief.md` — the runbook sentence that documented the defect
- `market-brief.snapshot.json`, `market-brief.payload.json` — the two artifacts the defect had written
- `tests/portfolio-survival-brief.spec.mjs` — the adversarial regression row

### Scenarios

```gherkin
Scenario: SCN-B001-CUTOFF-STAMPED
  Given the morning window declares an 11:00 ET evidence cutoff
  When a Tier-A run executes at 11:37 ET and publishes that window
  Then the snapshot asOf is the 11:00 ET cutoff
  And the snapshot generatedAt is the 11:37 ET run instant

Scenario: SCN-B001-SHARED-CUTOFF-RULE
  Given the publisher and the consumer both need the cutoff of a declared window
  When each resolves it
  Then both call the same exported helper
  And neither restates the declared ET times as literals

Scenario: SCN-B001-LATE-PUBLICATION-REFUSED
  Given a publication whose asOf is later than the cutoff of the window it declares
  When the brief tab composes its evidence window
  Then composition is refused with P008-BRIEF-EVIDENCE / generic-evidence-cutoff-conflict
  And no lane, action, or identity is invented to fill the gap

Scenario: SCN-B001-SCHEDULE-SURVIVES-REFUSAL
  Given the public schedule has loaded and composition is then refused
  When the reader looks at the evidence-window selector
  Then it still offers every declared window
  And the refusal is named on screen rather than presented as an empty tab

Scenario: SCN-B001-PUBLICATION-CLOCK-DISTINCT
  Given asOf and generatedAt now carry different instants
  When the cockpit renders the publication clock
  Then it reads snapshotRef.generatedAt
  And it does not read payloadRef.asOf

Scenario: SCN-B001-NO-WALLCLOCK-FALLBACK
  Given a snapshot that carries no asOf
  When a lockstep consumer builds a payload from it
  Then it fails loudly
  And it does not substitute the run wall-clock
```

### Test Plan

Scenario-first ordering, proven in both directions.

**RED (before the fix).** `tests/portfolio-survival-brief.spec.mjs` reported
**3 passed / 14 failed**. The failure was not a weak assertion — the tab genuinely could
not compose, `#briefWindow` rendered zero options, and every row that needed the brief
surface failed against the real published artifacts.

**GREEN (after the fix).** The same suite reports **17 passed / 0 failed**, with the
adversarial regression row added alongside the fix.

**Non-tautology, asserted inside the test rather than claimed here.** The regression row
serves a fixture that is deliberately 37 minutes past its own window cutoff and asserts that
lateness *about its own fixture* before asserting anything about the page:

```js
const publishedLateAt = new Date(Date.parse(cutoffAt) + 37 * 60 * 1000).toISOString();
expect(publishedLateAt > cutoffAt,
  'NON-TAUTOLOGY GUARD: the fixture must publish strictly LATER than its own window cutoff, '
  + 'otherwise the publication validates and the refusal path under test never runs').toBe(true);
```

A fixture published *at* the cutoff would validate, the refusal path would never execute,
and every later assertion would pass vacuously. The guard fails if the fixture is ever
softened, and the row fails if the blank-tab behaviour returns.

**It proves the fix is not a relaxation.** The row asserts that the boundary still
**refuses** (`data-generic-window-state` = `unavailable`, named
`generic-evidence-cutoff-conflict`, zero lane items composed) *while* the schedule stays
fully populated (4 of 4 declared windows). Both halves of the contract are pinned in one
row, so neither can be traded for the other.

| Scenario | Where proven |
|---|---|
| SCN-B001-CUTOFF-STAMPED | `market-brief.snapshot.json` — `asOf` `15:00:00.000Z` against `generatedAt` `15:37:31.147Z`; `report.md` § Published Clocks Now Differ |
| SCN-B001-SHARED-CUTOFF-RULE | `scripts/brief-refresh.mjs:2637` and `scripts/validate-brief-payload.mjs` both call `RLPORTFOLIOBRIEF.windowCutoffAt`; `report.md` § One Cutoff Rule |
| SCN-B001-LATE-PUBLICATION-REFUSED | **Regression E2E**, scenario-specific — `tests/portfolio-survival-brief.spec.mjs:902` |
| SCN-B001-SCHEDULE-SURVIVES-REFUSAL | **Regression E2E**, same row — `options=4` while `state=unavailable` |
| SCN-B001-PUBLICATION-CLOCK-DISTINCT | `portfolio-survival-allocation-lab.html:8110`; `report.md` § The Second Clock |
| SCN-B001-NO-WALLCLOCK-FALLBACK | `scripts/brief-narrative-parallel.mjs` throws on absent `asOf`; `report.md` § No Wall-Clock Fallback |
| Broader regression suite | `node scripts/selftest.mjs` — 3314 passed, 0 failed; `node --test tests/portfolio-publisher-boundary.functional.mjs` — 0 failed; `node scripts/validate-brief-payload.mjs` — PASS |

### Definition of Done

- [x] SCN-B001-CUTOFF-STAMPED: the Tier-A publisher sets `asOf` to the analyzed window's
      evidence cutoff and leaves `generatedAt` as the run instant. (FR-B001-001, FR-B001-002)
      Evidence: `report.md` § The Publisher Fix — `scripts/brief-refresh.mjs:2637-2639`
      reads `RLPORTFOLIOBRIEF.windowCutoffAt(cfg.windows, window, snap.ts)` and throws when
      the window has no resolvable cutoff; `report.md` § Published Clocks Now Differ.
- [x] SCN-B001-SHARED-CUTOFF-RULE: publisher and consumer resolve the cutoff through one
      exported helper, with no second implementation and no literal ET times. (FR-B001-003)
      Evidence: `report.md` § One Cutoff Rule — `grep -n 'windowCutoffAt' rlportfoliobrief.js`
      returns the definition at 171 and the export at 1040; both `brief-refresh.mjs` and
      `validate-brief-payload.mjs` call it.
- [x] The consumer boundary is not weakened. (FR-B001-004)
      Evidence: `report.md` § The Boundary Is Provably Untouched — `git diff --numstat
      rlportfoliobrief.js` reports `16  0`. Zero deletions means the refusal condition
      cannot have been edited; it moved from line 217 to line 232 only because 15 additive
      lines were inserted above it.
- [x] SCN-B001-LATE-PUBLICATION-REFUSED: a publication later than its declared window cutoff
      is refused by name, and nothing is invented to fill the gap. (FR-B001-004)
      Evidence: `report.md` § Regression E2E — `[BUG-001] window=morning
      cutoffAt=2026-08-23T15:00:00.000Z publishedLateAt=2026-08-23T15:37:00.000Z`;
      `state=unavailable named=generic-evidence-cutoff-conflict`; `#briefLanes li` count 0.
- [x] SCN-B001-SCHEDULE-SURVIVES-REFUSAL: a refused evidence window leaves the public
      schedule fully populated. (FR-B001-005)
      Evidence: `report.md` § Regression E2E — `options=4`, and the row additionally asserts
      the option values equal the declared window ids in order.
- [x] SCN-B001-PUBLICATION-CLOCK-DISTINCT: the cockpit reads the publication clock from
      `snapshotRef.generatedAt`. (FR-B001-007)
      Evidence: `report.md` § The Second Clock — `portfolio-survival-allocation-lab.html:8110`.
- [x] SCN-B001-NO-WALLCLOCK-FALLBACK: a lockstep consumer inherits the published cutoff and
      fails loudly rather than substituting a run clock. (FR-B001-009)
      Evidence: `report.md` § No Wall-Clock Fallback — the
      `snapshot.asOf || snapshot.generatedAt || new Date().toISOString()` chain is replaced
      by an explicit throw.
- [x] A refusal names itself on screen, structurally and in reader-visible copy. (FR-B001-006)
      Evidence: `report.md` § Regression E2E — `data-generic-window-error` equals
      `P008-BRIEF-EVIDENCE/generic-evidence-cutoff-conflict`, and `#briefStates` contains
      "does not satisfy the generic evidence contract".
- [x] The runbook no longer documents the defect as intended behaviour. (FR-B001-008)
      Evidence: `report.md` § The Runbook Correction — the one-line replacement at
      `notes/market-brief.md:645`.
- [x] Scenario-specific adversarial regression coverage exists and is non-tautological.
      Evidence: `tests/portfolio-survival-brief.spec.mjs:902`, with the in-test
      NON-TAUTOLOGY GUARD quoted in § Test Plan above and in `report.md` § Regression E2E.
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior exist and
      bind to all six of this bug's scenarios. Re-verified against the committed tree in the
      planning turn rather than restated from the fix turn:
      `tests/portfolio-survival-brief.spec.mjs:1039` — `Regression: BUG-001 a publication
      later than its declared window cutoff is refused by name and never empties the
      schedule` — carries SCN-B001-LATE-PUBLICATION-REFUSED, SCN-B001-SCHEDULE-SURVIVES-REFUSAL
      and SCN-B001-NO-WALLCLOCK-FALLBACK, and still holds the NON-TAUTOLOGY GUARD quoted in
      § Test Plan. `tests/portfolio-survival-brief.spec.mjs:90` — `Regression: SCN-008-006 all
      four exact ET windows preserve cutoff and composition time` — carries
      SCN-B001-CUTOFF-STAMPED, SCN-B001-SHARED-CUTOFF-RULE and SCN-B001-PUBLICATION-CLOCK-DISTINCT.
      `tests/portfolio-brief.functional.mjs:549` and `:1561` carry the two functional bindings.
      All six rows in `scenario-manifest.json` are `regressionRequired: true` and Gate G057
      confirms every binding resolves to a real file and title. Line numbers drifted after the
      fix turn — the row cited as `:902` in the item above now sits at `:1039`, and the
      `rlportfoliobrief.js` export cited as `:1040` now sits at `:1134`. The test *titles* are
      the stable identity, and they are what `scenario-manifest.json` binds.
- [ ] Broader E2E regression suite passes on the current tree. UNCHECKED, and deliberately so:
      the recorded run in `report.md` § Test Evidence — `tests/portfolio-survival-brief.spec.mjs`
      17 passed / 0 failed, `node --test tests/portfolio-publisher-boundary.functional.mjs`
      exit 0, `node scripts/validate-brief-payload.mjs` PASS, `node scripts/selftest.mjs` 3314
      passed / 0 failed — is tagged `executed (fix turn)` and predates edits to the very files
      it measures. `tests/portfolio-survival-brief.spec.mjs` was modified after that run, and
      `tests/portfolio-brief.functional.mjs` and `rlportfoliobrief.js` carry uncommitted edits
      owned by other work in the same checkout, so a run now would measure a tree that is not
      this packet's delivery. Re-running
      `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs
      --config=playwright.config.mjs --project=system-chrome --reporter=list`,
      `node --test tests/portfolio-brief.functional.mjs` and `node scripts/selftest.mjs`
      against a clean tree is what closes this item. No pass is claimed until that run exists.
- [x] The brief suite passes. Evidence: `report.md` § Test Evidence — 3 passed / 14 failed
      before, **17 passed / 0 failed** after.
- [x] The publisher-boundary functional suite passes. Evidence: `report.md` § Test Evidence —
      `node --test tests/portfolio-publisher-boundary.functional.mjs`, exit 0, 0 failed.
- [x] The payload validator passes. Evidence: `report.md` § Test Evidence —
      `node scripts/validate-brief-payload.mjs`, exit 0, PASS.
- [x] The broader repository suite passes. Evidence: `report.md` § Test Evidence —
      `node scripts/selftest.mjs`, exit 0, 3314 passed / 0 failed.
- [x] The working tree is clean of whitespace damage. Evidence: `report.md` § Test Evidence —
      `git diff --check`, exit 0.
- [x] The defect is established as pre-existing rather than introduced by Scopes 25/26/27.
      Evidence: `bug.md` § Provenance — `rlnav.js` reverted to `744ac6a54^` and
      `portfolio-survival-allocation-lab.html` reverted to `0972ddd75^`, each still failing,
      both restored clean afterwards.
- [x] No contract version, schema field, or threshold changed.
      Evidence: `design.md` § Blast Radius — the per-file `git diff --numstat` table.

---

## Non-Goals

Neither item below is undone work from this bug. `spec.md` states the whole requirement set —
FR-B001-001 through FR-B001-009 — and it governs the two clocks, the shared cutoff rule, the
consumer boundary, the schedule transaction, the on-screen refusal identity, the publication
clock, the runbook sentence, and lockstep inheritance. No requirement asks for either item,
so nothing this packet committed to is left unfinished by naming them here.

**Surfacing how late a publication was is an owner decision, not unfinished work.** The fix
makes an 11:37 publication of the 11:00 window honest: it declares 11:00 evidence and
discloses an 11:37 publication instant. Turning that difference into an operational staleness
signal is a new capability with no governing FR, and `design.md` § Open Question For The Owner
records it as Q1 with the explicit finding that *"Nothing here is blocked on the answer."* It
is routed to the owner for a decision, which is where a product question without a requirement
belongs.

**Scope 28's test-integrity work is another packet's, and is named only to keep the diff
readable.** `tests/portfolio-publisher-boundary.functional.mjs`,
`tests/portfolio-survival.support.mjs`, `tests/portfolio-defect-injector.cjs`,
`tests/portfolio-test-integrity.unit.mjs` and `.specify/memory/agents.md` are owned by
`specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement`
and were modified in the same working tree while this bug was fixed. Listing them is an
ownership statement so this bug's footprint is not misread from the diff; none of it is a
commitment this packet made.
