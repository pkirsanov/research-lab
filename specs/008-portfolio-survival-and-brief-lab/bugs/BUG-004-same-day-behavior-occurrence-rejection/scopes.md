# BUG-004 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.plan`

The projection repair is committed at `a59e38d71` and thirteen of fourteen
Definition of Done items now carry executed evidence. This planning invocation
added one faithful DoD item per Gherkin scenario (closing G068), restated the
containment item in the canonical change-boundary form, and enumerated the
excluded surfaces. Certification is still not claimed: `certification.*` is
owned by `bubbles.validate`, and the Build Quality Gate (G-4) remains
unchecked. See `report.md#remaining-open-2026-08-24-closeout` for the
originating gap list.

## Scope 1 - Preserve Occurrences Without Relevance Inflation

**Status:** In Progress
**Depends On:** Parent design reconciliation by `bubbles.design`.
**Dependency state:** Satisfied. The parent design was reconciled by
`a59e38d71` without changing SCN-008-044; see `report.md#design-reconciled`.

### Change Boundary

Allowed file families, by execution order and owning agent:

- Parent design prose — `specs/008-portfolio-survival-and-brief-lab/design.md`,
  owned by `bubbles.design`;
- Product source — `rlportfolio.js` and `rlportfoliobrief.js`, owned by
  `bubbles.implement`. These are the ONLY two product files in the boundary;
- Node test carriers — `tests/portfolio-foundation.unit.mjs`,
  `tests/portfolio-behavior-occurrence.unit.mjs`, and
  `tests/portfolio-brief.functional.mjs`, owned by `bubbles.test`;
- Browser test carrier — `tests/portfolio-survival-foundation.spec.mjs`, owned
  by `bubbles.test`;
- This bug packet's own artifacts — `bug.md`, `spec.md`, `design.md`,
  `scopes.md`, `report.md`, `uservalidation.md`, `scenario-manifest.json`,
  `state.json`, each owned by its declared agent.

`rlportfoliobrief.js` is inside the boundary because the relevance-scoring loop
lives there, so a storage-only dedupe confined to `rlportfolio.js` would still
let a repeat same-day occurrence buy unearned relevance — it inflated
`evidenceScore` from `1.6062` to `2.4094` and flipped `finalRankedOrder`
(`report.md:692`). The repair therefore has two halves: storage
(`rlportfolio.js:2294`, called at `2479`, exported at `4947`) and relevance
scoring (`rlportfoliobrief.js:331`, called at `408`, with
`portfolio.dedupeBehaviorEvents` applied at `461` directly above the
`bucket.score` accumulation). `git show --stat a59e38d71` lists exactly two
product source files — `rlportfolio.js` (18 lines) and `rlportfoliobrief.js`
(53 lines) — so the boundary is the delivered set and no wider.

Excluded surfaces (MUST remain untouched; collateral cleanup is opt-in, not
implicit):

- Every other tool source file at the repository root, including
  `rlbrief.js`, `rldata.js`, `rlapp.js`, `rlnav.js`, `rlchart.js`,
  `rlticker.js`, `rlg.js`, and every `*.html` tool page;
- `tools.json`, `index.html`, and the navigation registry — no tool is being
  added, removed, or re-registered by this repair;
- `scripts/selftest.mjs` and every other repository check script — the selftest
  is a carrier to be run, never a surface to be relaxed;
- The concurrent `BUG-003-behavior-dedup-contradicts-occurrence-model` packet
  and all of its artifacts;
- Every Playwright carrier other than
  `tests/portfolio-survival-foundation.spec.mjs`, including the seven other
  Feature 008 browser specs, which are run as regression and not edited;
- Every other `specs/` packet, including the parent feature's own `spec.md`,
  `scopes.md`, `report.md`, and `state.json`;
- Committed data snapshots under `data/` and every brief payload or history
  file.

The existing uncommitted candidate and test hunks are protected concurrent
work and are preserved rather than reverted. Every dirty path outside the
allowed families above is excluded.

### Gherkin Scenarios

```gherkin
Scenario: SCN-B004-OCCURRENCE-ADMISSION
  Given one stored occurrence for a valid semantic completion
  When the same semantic completion occurs at another instant on the same New York civil date
  Then the distinct occurrence is stored
  And an exact repeated occurrence is rejected

Scenario: SCN-B004-SEMANTIC-ANTI-INFLATION
  Given a baseline stream with distinct semantic completion identities
  And an augmented stream with additional occurrences of one existing semantic identity
  And every added occurrence is at or after that identity's retained earliest occurrence
  When score, floor eligibility, and canonical ordering are derived
  Then the augmented stream retains more audit occurrences
  And score, floor state, relevance band, supporting identities, and order equal the baseline
```

### Implementation Plan

1. `bubbles.design` reconciles the parent design sections named in
   `design.md#design-owner-packet`.
2. `bubbles.test` preserves the concurrent carrier and adds the missing
   baseline-versus-augmented score and order discriminators.
3. `bubbles.implement` preserves exact-occurrence admission and enforces
   semantic collapse before relevance accumulation.
4. `bubbles.test` reruns every exact row below without weakening assertions.
5. `bubbles.validate` owns evidence acceptance and any state transition.

### Test Plan

| Plan ID | Test Type | Category | Live system | Persistent file | Exact behavior | Command | Current status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-B004-001 | Unit regression | `unit` | No | `tests/portfolio-foundation.unit.mjs` | A distinct same-day occurrence is accepted and an exact occurrence is rejected. | `timeout 240 node --test --test-name-pattern='privacy inventory reports real category counts and carries no stored subject value' tests/portfolio-foundation.unit.mjs` | Parent diagnostics record red before and green after. Re-execution required. |
| TP-B004-002 | Unit adversarial regression | `unit` | No | `tests/portfolio-behavior-occurrence.unit.mjs` | Pin same-day admission, exact-repeat refusal, floor boundary, cap, and sensitivity to the superseded predicate. | `timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs` | Concurrent carrier exists. It was not executed here and omits score and order. |
| TP-B004-003 | Functional adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | Added same-semantic occurrences increase audit cardinality but cannot change score, floor, band, supporting identities, or order. | `timeout 240 node --test --test-name-pattern='Regression: BUG-004 same-semantic occurrences cannot inflate relevance' tests/portfolio-brief.functional.mjs` | Planned. It must fail before projection repair if inflation remains. |
| TP-B004-004 | Functional aggregate regression | `functional` | No | Scope 28 TP-28-02 carrier set | Exact TP-28-02 remains green after the focused repair. | `timeout 1140 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-analytics.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-bar-coverage.functional.mjs tests/portfolio-risk.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-dossier.functional.mjs tests/portfolio-workspace.functional.mjs tests/portfolio-test-integrity.unit.mjs` | Parent diagnostics record 239 of 239 after candidate. Re-execution required. |
| TP-B004-005 | Regression E2E | `e2e-ui` | Yes | `tests/portfolio-survival-foundation.spec.mjs` | The UI stores four occurrences, rejects an exact repeat, and proves a semantic repeat cannot change rank score, floor, or order. | `timeout 600 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio' --reporter=list` | Existing row passes in parent diagnostics but needs the anti-inflation discriminator. |
| TP-B004-006 | Broader Regression E2E | `e2e-ui` | Yes | Feature 008 Playwright carriers | The complete Feature 008 browser matrix remains green. | `timeout 1740 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Parent diagnostics record 93 of 93. Re-execution required. |
| TP-B004-007 | Repository regression | `functional` | No | `scripts/selftest.mjs` | All registered repository checks remain green. | `timeout 1800 node scripts/selftest.mjs` | Parent diagnostics record 3404 of 3404. Re-execution required. |

### Definition of Done

#### Declared Limit (read before accepting the anti-inflation items)

> **FR-B004-005a: the anti-inflation invariance is FORWARD-ONLY.**
> `dedupeBehaviorEvents` retains the EARLIEST occurrence of a semantic identity
> (`rlportfolio.js:2311`), so an added occurrence that is EARLIER than the
> retained representative REPLACES it and moves the very projections
> FR-B004-005 pins, while adding no semantic identity.
> Measured at `report.md#gaps-b004-x1-probe`: `distinctCompletionIdentities`
> holds at `2` while `evidenceScore` moves `1.6062` to `1.5698` and `signalId`
> and `supportingOccurrenceIds` change; in a civil-date-folding fixture
> `distinctNewYorkCivilDates` moves `2` to `1` and `floorSatisfied` `true` to
> `false`.
> Every DoD item below that cites anti-inflation evidence is therefore scoped
> to FORWARD occurrences ONLY. No item below verifies the backward direction,
> and none may be read as doing so.
> The direction is REACHABLE, not impossible: `buildBehaviorCandidate` has no
> monotonicity guard, the shipped lab clock is `new Date().toISOString()`, and
> `validateWorkspace` enforces only `eventId` uniqueness with no ordering
> invariant. This packet DECLARES the direction as an excluded limit rather
> than repairing it: every candidate repair changes the `evidenceScore`
> accumulation that `spec.md#out-of-scope` excludes from this packet's
> boundary, and changes stored `signalId` values, which is a stored-contract
> migration and not a bug fix. Repairing it here would breach the declared
> Change Boundary.
> The limit is dispositioned, not open-ended. It is routed as finding
> `HARDEN-B004-H6` (`report.md#harden-findings-2026-08-25`, with the matching
> row in `report.md` `## Discovered Issues`) to owner `bubbles.bug`, whose
> named deliverable is successor packet
> `BUG-006-earlier-occurrence-displaces-retained-representative`. That packet
> does NOT exist at this revision:
> `ls specs/008-portfolio-survival-and-brief-lab/bugs/` returns only
> `BUG-001-tier-a-publisher-stamps-run-time-into-asof`,
> `BUG-002-full-clear-tombstone-authority`,
> `BUG-004-same-day-behavior-occurrence-rejection`, and
> `BUG-005-stale-domain-interest-signal-crash`. The limit therefore stays
> declared and unclosed until `bubbles.bug` opens it.

#### Core Items

- [x] `SCN-B004-OCCURRENCE-ADMISSION` holds: given one stored occurrence for a
  valid semantic completion, the same semantic completion at another instant on
  the same New York civil date is stored as a distinct occurrence, and an exact
  repeated occurrence is rejected.
      Evidence: `report.md#tp-b004-002` — Exit Code 0, `tests 5`, `pass 5`,
      `fail 0`, `skipped 0`. Both halves of the scenario's Then clause are
      separate green rows in that one run: "a later same-civil-day completion is
      a distinct occurrence under one semantic identity" (admission) and "an
      exact occurrence repeat is still refused as a duplicate" (rejection). The
      pair is discriminating rather than vacuous because the fifth row in the
      same file reinstates the superseded content-plus-civil-day predicate and
      requires the accepted-occurrence assertion to turn red. The earlier
      4-pass/1-fail red receipt for the same file against the pre-repair
      projection is preserved at
      `report.md#post-edit-focused-bug-004-carrier`, so the green is a genuine
      transition. Live-stack confirmation of the same admission claim is at
      `report.md#g2-same-civil-day-browser`, where the browser row reports
      `anchorCivilDate` equal to `repeatCivilDate=2026-05-05` and
      `eligibleOccurrencesBefore=4` moving to `eligibleOccurrencesAfter=5`,
      proving the second same-civil-date occurrence was stored and not
      collapsed.
- [x] `SCN-B004-SEMANTIC-ANTI-INFLATION` holds: given a baseline stream and an
  augmented stream that adds FORWARD occurrences of one existing semantic
  identity, the augmented stream retains more audit occurrences while score,
  floor state, relevance band, supporting identities, and canonical order equal
  the baseline. Scoped by the Declared Limit above: an added occurrence earlier
  than the retained representative is NOT covered by this item.
      Evidence: `report.md#tp-b004-003-red-green` — the discriminating pair was
      executed in this packet. RED at the pre-repair parent `a59e38d71^` in an
      isolated detached worktree: Exit Code 1, `pass 0`, `fail 1`, failing on
      "the fixture must append genuinely new evidence, not collapse into a
      duplicate", capture sha256
      `e674e8548b8313eb39d8489bf9742c69d7386bbe65eae1228c979f9d242d8661`. GREEN
      at `HEAD`: Exit Code 0, `tests 1`, `pass 1`, `fail 0`, capture sha256
      `2bbd09ecfae14c6bd87e9e7e11d7bcd3caa7f1802237c0d477b0c2bdb423d3b2`. The
      invariance itself is asserted field-by-field at `report.md#tp-b004-002`:
      a full `deepEqual` over `evidenceScore`, `semanticScore`,
      `floorEligibility` (`distinctCompletionIdentities`,
      `distinctNewYorkCivilDates`, `floorSatisfied`, `relevanceBand`),
      `supportingSemanticIdentities`, `semanticEvidenceContribution`,
      `signalIdentity`, `candidateActionIdentities`, `rankIdentity`, and
      `finalRankedOrder`, with three `notEqual`/`notDeepEqual` controls proving
      a genuinely distinct third-date completion still moves all three, so the
      equality is not asserted on a dead projection. The exact inflation this
      scenario forbids is recorded pre-repair at `report.md:692`:
      `evidenceScore` `1.6062` to `2.4094`, `finalRankedOrder` flipping from
      `comparison-research, equity-research` to `equity-research,
      comparison-research`.

- [x] Parent design separates exact-occurrence storage from semantic relevance
  de-duplication without changing SCN-008-044.
      Evidence: `report.md#design-reconciled` — `git log` shows the parent
      `design.md` reconciled by `a59e38d71`; lines 1153/1155 now state that
      storage rejects only an exact repeated `occurrenceId` while semantic
      derivation groups by `eventIdentity`. A `git show a59e38d71` diff scan for
      `SCN-008-044` returns a match count of `0`, so the scenario text was not
      altered to accommodate the repair. Closes finding `BUG-004-F1`.
- [x] `buildBehaviorCandidate()` rejects only an exact occurrence and preserves
  both distinct audit occurrences.
      Evidence: `report.md#tp-b004-002` — Exit Code 0, 5 of 5. The row "a later
      same-civil-day completion is a distinct occurrence under one semantic
      identity" is green alongside "an exact occurrence repeat is still refused
      as a duplicate", and the mutation row that reinstates the superseded
      content-plus-civil-day predicate turns the accepted-occurrence assertion
      red, so the pair is discriminating rather than vacuous.
- [x] Semantic repetitions at or after the retained representative cannot change
  score, floor eligibility, relevance band, supporting identities, or canonical
  ordering. Scoped by the Declared Limit above: an EARLIER repetition displaces
  the retained representative and does change them; that direction is routed to
  `BUG-006-earlier-occurrence-displaces-retained-representative` (not yet
  opened).
      Evidence: `report.md#tp-b004-002` — the invariance row asserts a full
      `deepEqual` over `evidenceScore`, `semanticScore`, `floorEligibility`
      (including `relevanceBand` and `floorSatisfied`),
      `supportingSemanticIdentities`, `semanticEvidenceContribution`,
      `signalIdentity`, `candidateActionIdentities`, `rankIdentity`, and
      `finalRankedOrder`, with three `notEqual`/`notDeepEqual` controls proving
      a genuinely distinct third-date completion still moves all three.
- [x] Change Boundary is respected and zero excluded file families were changed
  — every pre-existing dirty path is also preserved.
  Historical evidence (preserved verbatim; it records the boundary before
  this planning reconciliation):
  Evidence: OPEN, routed to `bubbles.plan`; see
  `report.md#remaining-open-2026-08-24-closeout` finding G-3. The dirty-path
  half holds: the five paths dirty at entry were this bug folder's
  `report.md`, `scopes.md`, and `state.json` plus the two concurrent test
  carriers, and this agent modified only its own artifacts, leaving both
  test carriers and every product source file untouched. The boundary half
  does not hold. `git show --stat a59e38d71` lists `rlportfoliobrief.js`
  (53 lines) and the Change Boundary above authorizes only `rlportfolio.js`
  for `bubbles.implement`. That file is core to the fix rather than
  incidental to it — `rlportfoliobrief.js:461` is where the per-occurrence
  scoring loop was replaced by `portfolio.dedupeBehaviorEvents(...)` — so
  the correct resolution is to widen the boundary to include it. This agent
  did not make that edit: amending the boundary that governs its own
  excursion, in the same pass that checks this box, would record
  `bubbles.implement` clearing itself. Widening the boundary is
  `bubbles.plan` planning content.
      Evidence: `bubbles.plan` widened the Change Boundary above in this
      invocation, so both halves now hold. Boundary half: `git show --stat
      a59e38d71` lists exactly two product source files — `rlportfolio.js` (18
      lines) and `rlportfoliobrief.js` (53 lines) — and the boundary now
      authorizes both for `bubbles.implement` and nothing further. The inclusion
      is intrinsic rather than permissive: a `dedupeBehaviorEvents` scan of
      `rlportfoliobrief.js` returns lines `331`, `408`, `461`, and `1072`, and
      line 461 sits inside the relevance-scoring loop, so a repair confined to
      `rlportfolio.js` would have left the inflation recorded at
      `report.md:692` (`evidenceScore` `1.6062` to `2.4094`, with
      `finalRankedOrder` flipped) in place. Dirty-path half: `git status
      --porcelain` at `1d6a13744` reports exactly five modified paths — this bug
      folder's `report.md`, `scopes.md`, and `state.json`, plus
      `tests/portfolio-brief.functional.mjs` and
      `tests/portfolio-survival-foundation.spec.mjs`, both already authorized
      for `bubbles.test`. No path outside the declared boundary is dirty, and no
      pre-existing dirty path was reverted. Closes finding `BUG-004-G3`.
      Excluded-surface half: the Change Boundary above now enumerates the
      excluded surfaces explicitly — every other root tool source and `*.html`
      page, `tools.json`/`index.html`/the navigation registry,
      `scripts/selftest.mjs` and the other check scripts, the concurrent
      `BUG-003` packet, the seven non-owned Feature 008 Playwright carriers,
      every other `specs/` packet including the parent feature's own artifacts,
      and committed `data/` snapshots. The `git show --stat a59e38d71` file list
      above intersects that excluded set at zero paths, so no excluded family
      was changed.
- [x] `TP-B004-001` focused unit regression passes with current-session
  evidence in `report.md#tp-b004-001`.
      Evidence: `report.md#closeout-lanes-2026-08-24` — the exact planned
      `--test-name-pattern` command re-executed this session, Exit Code 0,
      `tests 1`, `pass 1`, `fail 0`, capture sha256
      `df8204bed3669296a177652a151568df8eb816187d22009fb5c57cb176709bf9`.
- [x] `TP-B004-002` occurrence unit carrier passes without weakened mutation,
  floor, cap, or exact-repeat assertions in `report.md#tp-b004-002`.
      Evidence: `report.md#closeout-lanes-2026-08-24` — re-executed this
      session, Exit Code 0, `tests 5`, `pass 5`, `fail 0`, `skipped 0`, capture
      sha256
      `47bae6e9aaac8bd2de42b03ef3995c394c55e2e20a1f3e3dbec5b7078f68b287`. All
      four required assertion classes are present and green in that one run:
      exact-repeat refusal, declared-cap bound, floor and relevance invariance,
      and the superseded-predicate mutation row. The earlier 4-pass/1-fail red
      receipt for the same file is preserved at
      `report.md#post-edit-focused-bug-004-carrier`.
- [x] `TP-B004-003` adversarial functional regression fails before projection
  repair and passes after repair in `report.md#tp-b004-003`.
      Evidence: `report.md#tp-b004-003-red-green` — both halves were executed in
      this session. The row now exists at
      `tests/portfolio-brief.functional.mjs:1331`. RED: the focused command run
      against the pre-repair parent `a59e38d71^` inside an isolated detached
      worktree, so the working tree was never mutated — Exit Code 1, `pass 0`,
      `fail 1`, failing on `the fixture must append genuinely new evidence, not
      collapse into a duplicate`, which is the second same-day occurrence being
      refused as a duplicate and therefore BUG-004 itself; capture sha256
      `e674e8548b8313eb39d8489bf9742c69d7386bbe65eae1228c979f9d242d8661`. GREEN:
      the same focused command at `HEAD` — Exit Code 0, `tests 1`, `pass 1`,
      `fail 0`; capture sha256
      `2bbd09ecfae14c6bd87e9e7e11d7bcd3caa7f1802237c0d477b0c2bdb423d3b2`. The row
      fails without the repair and passes with it, so it is discriminating and
      not tautological. Closes finding `BUG-004-G1`.
- [x] `TP-B004-004` exact functional aggregate passes in
  `report.md#tp-b004-004`.
      Evidence: `report.md#closeout-lanes-2026-08-24` — the exact 13-file Test
      Plan command re-executed this session, Exit Code 0, `tests 240`,
      `pass 240`, `fail 0`, `skipped 0`, capture sha256
      `8dfa2e0982642722694bf638644ad295856e48b63a88f63144c9fdf5f8ba0623`. The
      count is 240 rather than the parent Scope 28 receipt of 239 because this
      aggregate includes `tests/portfolio-brief.functional.mjs`, which gained
      exactly one row — the new `TP-B004-003`. No lane was weakened or dropped.
- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
      Evidence: `report.md#g2-same-civil-day-browser` — the previously missing
      carrier now exists at `tests/portfolio-survival-foundation.spec.mjs:1022`
      and passes standalone, Exit Code 0, `1 passed (6.1s)`, capture sha256
      `7d6183f223b4855d42cea3160b10222457433ca5a90af465740721f1ed99db7c`. Its
      emitted diagnostics carry the discrimination rather than asserting it in
      prose: `anchorCivilDate` equals `repeatCivilDate=2026-05-05`, so unlike
      `TP-B004-005` it does not cross a UTC boundary;
      `eligibleOccurrencesBefore=4` moves to `eligibleOccurrencesAfter=5`,
      proving the occurrence was stored rather than passing a vacuous
      invariance; and the two paired controls at lines 1163 and 1182 report
      `controlAFlippedFloor=true` and `controlBMovedFingerprint=true`, proving
      both held-invariant projections are capable of moving. A bailout scan over
      the body (lines 1022-1205) returns zero matches for `return;`, `try {`,
      `catch`, or `if (!`, and the file contains no interception call, so the row
      is live-stack. Closes finding `BUG-004-G2`.
- [x] Broader E2E regression suite passes
      Evidence: `report.md#closeout-lanes-2026-08-24` — the exact 8-file matrix,
      `--project=system-chrome`, re-executed this session, Exit Code 0,
      `94 passed (2.0m)`, zero failed, zero flaky, zero skipped, capture sha256
      `4e0ca06fe2ff158080e7cf46f3c21afeeaa520984d5e3ee374d4a434f1406350`. The
      count is 94 rather than the earlier 93 because the new same-civil-day row
      that closes G-2 now runs inside the matrix. The exact `TP-B004-005`
      `SCN-008-011` row also ran standalone and is green at Exit Code 0,
      `1 passed (6.2s)`, capture sha256
      `c3ec5a0c50a976fc815452569cdd153a0d5e63efbfd0342ffdef789198a3471c`.
- [x] `TP-B004-007` registered repository selftest passes in
  `report.md#tp-b004-007`.
      Evidence: `report.md#pii-redaction-2026-08-24` — `node
      scripts/selftest.mjs` re-executed after the PII redaction, Exit Code 0,
      `Research-Lab self-test: 3406 passed, 0 failed`, capture sha256
      `d564c6ca67f5aa25c0f4ff1f126cbff36c2e2a9d68fdb06e342842178be43ab6`. The
      previously failing check `committed surface carries no personal
      identifier` is green and the failed count is 0, with no allowlist entry
      added and no scanner rule relaxed.

#### Build Quality Gate

- [ ] Artifact lint, diff checks, test integrity, and validate-owned
  certification are clean with zero warnings and zero unchecked test
  obligations.
      Evidence: PARTIAL, see `report.md#validate-phase-2026-08-25`. Three of
      four clauses hold on current-session receipts: `git diff --check` Exit
      Code `0`; test integrity via `node scripts/selftest.mjs` Exit Code `0` at
      `3408 passed, 0 failed`, the 3 declared carriers at `59 passed, 0 failed`,
      and `regression-quality-guard.sh --bugfix` at `0 violation(s),
      0 warning(s)` across 8 carriers with adversarial signals detected in all
      8; and "zero unchecked test obligations" is satisfied now that
      `TP-B004-003` and the same-civil-day browser row both exist and pass.
      The artifact-lint clause does NOT hold and the earlier `Exit Code 0`
      receipt does not survive promotion. A terminal write was attempted and
      reverted in this invocation, which measured the cause: artifact lint is
      status-conditional and returns Exit Code `0` while `status` is
      `in_progress` but Exit Code `1` with 39 issues the moment `status` is
      `done`, all 39 being short evidence blocks or blocks lacking
      terminal-output signals in `report.md`. The fourth clause, validate-owned
      certification, therefore also stays FALSE: the transition guard exits `1`
      at `failureCount 5`. Remediating the 39 `report.md` evidence blocks is
      neither validate-owned content nor inside this packet's Change Boundary.

Thirteen of fourteen Definition of Done items are checked with executed
evidence. `TP-B004-003` (G-1) and the scenario-specific E2E item (G-2) closed in
the preceding `bubbles.implement` invocation, the first on a RED-to-GREEN pair
and the second on live paired controls. An earlier `bubbles.plan` invocation
closed three plan-owned gaps: both Gherkin scenarios now have a faithful DoD item
that cites the scenario id and resolves to executed evidence already filed in
`report.md` (G068); the containment item is restated in the canonical
`Change Boundary is respected and zero excluded file families were changed`
form; and the Change Boundary now enumerates allowed file families and excluded
surfaces separately. No new evidence was manufactured here — every citation
points at a receipt that already existed. One item remains unchecked: the Build
Quality Gate (G-4). The scope is therefore not Done.

A terminal certification write was attempted and reverted in the
`bubbles.validate` invocation of 2026-08-25. It cleared six of the nine
pre-write guard failures — the unchecked DoD item, the In Progress scope, both
`G022` missing-validate-phase blocks and both `G027` empty-`completedScopes`
blocks — but the guard still refused at `failureCount 5`, so every terminal
field was restored. Three blockers survive: `Check 43` receipt STALE and receipt
CLONE (`VAL-B004-V1`, parent-owned), `Gate G084`, and the newly measured
status-conditional artifact-lint failure described in the Build Quality Gate
item above. Top-level and certification status stay `in_progress`.
