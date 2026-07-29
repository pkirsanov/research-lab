# Scope 09: Committed validator and closed codes

**Status:** Not Started
**Depends On:** 01, 02, 03, 04, 05, 06, 07, 08
**Tags:** `overlay:true`, `routed:P-015-11`
**Design section:** `design.md` → `## D8 — Testing Strategy`
**Business Scenarios owned:** — (none; this scope renders nothing and adds no user-visible behaviour)
**UI rows owned:** — (none)
**Refusal codes owned:** `RTR-LOCAL-STATISTIC`, `RTR-REDUCER-FORK`, `RTR-CENTER-VIEW`, `RTR-ACTION-EMITTED`
(the four **source scans**), plus custody of the consolidated FR-020 register as a whole

**Primary Outcome:**
`scripts/validate-recommendation-track-record.mjs` exists as the committed FR-020 surface: one closed `RTR-*`
register, one adversarial `expectRejected` case per Hard Constraint, and four source scans that can only be
authored once the whole 015 surface exists. It carries a **named export** and an **argv-guarded `main()`**, so
there is exactly one implementation of every refusal with two entry points — standalone (`exit 0/1`) and imported
into the 952-assertion baseline, exactly as `scripts/selftest.mjs` imports `validateBriefPayload` at `#L18`
(verified this planning run). Every negative case fails **closed** with its exact code string; an acceptance is a
validator failure, not a pass. This scope depends on all eight preceding scopes because four of its codes are
scans over finished source — they cannot be written against code that does not exist yet.

**Boundary with the surrounding scopes.** Every scope from 01 to 08 proves its own codes under `node --test`
against fixtures. This scope does **not** re-prove them there; it consolidates the register, adds the four codes
no single earlier scope could own, and provides the second entry point. It writes no product source, renders
nothing, computes no statistic, and changes no contract.

**Scope boundary — one routed drift (P-015-11).** `design.md` → `## D8` declares the closed register at **16**
codes, adding `RTR-SESSION-PREDICATE` (declared in `D4` at `design.md#L1037`), and `design.md` → `## D11`
F-015-D8-01 states plainly that *"the consolidated 16-code table in D8 is the closed set"*. `scopes/_index.md`
records **15** and omits `RTR-SESSION-PREDICATE` from its `## Refusal-code ownership` table, and its scope-09
checkpoint reads *"all fifteen `expectRejected` cases"*. `scopes/_index.md` is stale against a design that has
moved. This scope implements the **16** design-declared codes — per the index's own design-boundary rule that
every error code is drawn from `design.md` `D1`–`D8` — and the discrepancy is **routed, not patched**: planning
does not edit `scopes/_index.md` mid-feature, and shipping a 15-code register would leave HC-5's
`early-close-session-skipped` case unenforced, which is precisely the defect routed as P-015-07.

---

## Business Scenarios owned

None. This scope owns no `BS-*` row and no `UI-*` row. Its obligations are **FR-020** in full, plus the
verification halves of `HC-1` … `HC-10`, `AC-003` and `AC-018`, all asserted by the Test Plan below rather than by
a Gherkin scenario. The ownership maps in `scopes/_index.md` record this scope as owning zero Business Scenarios
and zero UI rows; that is deliberate and is not an authoring omission.

---

## Implementation Plan

1. **Create `scripts/validate-recommendation-track-record.mjs` on the repo's committed validator shape.** The
   reference is `scripts/validate-market-action.mjs`, verified this planning run: `invariant(condition, message)`
   at `#L56`, the named export `validateMarketAction()` at `#L223`, `main()` at `#L232`, and the argv guard
   `if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();` at `#L249`. 015 mirrors all four.
2. **Add `expectRejected(name, code, fn)` — and note honestly that the precedent does not carry it.** The
   reference validator has `invariant` but no `expectRejected`; the helper is introduced by 015 per `design.md` →
   `## D8`. It asserts that `fn()` **fails closed with exactly `code`**. Its own failure mode is the dangerous one:
   a helper that passes when `fn()` *succeeds* would make all sixteen adversarial cases vacuous while every one of
   them reported green, so the helper is itself adversarially tested before it is trusted.
3. **Export `validateRecommendationTrackRecord()` returning the six-section object** — `authority`, `claims`,
   `resolver`, `scorecard`, `surface`, `adversarial` — so the baseline can import and assert section by section
   rather than on a single boolean.
4. **Keep import side-effect-free.** `main()` runs only under the argv guard. Importing the module must not set
   `process.exitCode`, print, or touch the filesystem, or the baseline's own exit status becomes a function of
   import order.
5. **Implement the consolidated 16-code register as the FR-020 surface.** Each code is a frozen string constant,
   asserted verbatim; there is no seventeenth and no dynamically-constructed code. The register supersedes `D4`'s
   table, which remains correct as a resolver-scoped subset:

   | Code | Declared in | Owning scope |
   |---|---|---|
   | `RTR-PREDICATE-AMEND` | D4 | 01 |
   | `RTR-LEGACY-BACKFILL` | D8 | 02 |
   | `RTR-FLAT-ZERO` | D4 | 03 |
   | `RTR-LOOKAHEAD` | D4 | 04 |
   | `RTR-SESSION-PREDICATE` | D4 | 04 — **not in `scopes/_index.md`'s table (P-015-11)** |
   | `RTR-CALENDAR-COVERAGE` | D4 | 04 |
   | `RTR-CLOSURE-VOCAB` | D4 | 04 |
   | `RTR-NETWORK` | D4 | 04 |
   | `RTR-RESOLUTION-CONFLICT` | D4 | 04 |
   | `RTR-LEGACY-GROWTH` | D5 | 05 |
   | `RTR-COHORT-MIX` | D5 | 05 |
   | `RTR-RATE-BARE` | D6 | 06 |
   | `RTR-LOCAL-STATISTIC` | D8 | **09** |
   | `RTR-REDUCER-FORK` | D8 | **09** |
   | `RTR-CENTER-VIEW` | D8 | **09** |
   | `RTR-ACTION-EMITTED` | D8 | **09** |

6. **Implement `RTR-LOCAL-STATISTIC` as a source scan over 015-authored source (HC-1, FR-008).** It fires when an
   estimator, interval, mean or discount is computed outside `RLVALID` — a division producing a rate, a
   locally-summed mean, a hand-rolled interval, a local discount factor. The adversarial case computes
   `wins / total` inline instead of calling `rlvWilsonInterval`. This is the scan that makes scope 05's
   *"the point estimate is read from `interval.proportion` only"* checkable from outside scope 05.
7. **Implement `RTR-REDUCER-FORK` as a source scan (HC-2, FR-004).** It fires when a local re-implementation of the
   lifecycle reducer or its closure application is found. The adversarial case is a local `applyClosure()` that
   mutates entries instead of routing through `reduceRecommendationEvents`. Two lifecycle engines over one ledger
   surface as ledger corruption, not as a test failure — which is why this is a scan rather than a behavioural
   assertion.
8. **Implement `RTR-CENTER-VIEW` as a source scan (HC-3, FR-021, AC-011).** It fires when 015 source writes Center
   `viewOrder` / `views` / `viewState`, or declares a view id. The adversarial case declares view id
   `"track-record"` and appends it to `viewOrder`. HC-3 is held by **non-participation**, and this scan is what
   makes non-participation an asserted fact rather than an intention: `RLMKT-VIEW` never fires because 015 never
   approaches it, so its silence proves nothing on its own.
9. **Implement `RTR-ACTION-EMITTED` with both halves (HC-9, FR-016).** Half one: action vocabulary reaching the
   rendered surface. Half two — the **precondition** — any element matching `rlg.js`'s `GLOSSARY_SELECTOR` that
   lacks a `title`. The scan is written against the **committed fifteen-member** selector, `UNDERLINE_SELECTORS`
   at `rlg.js#L249` concatenated with `PLAIN_SELECTORS` at `#L250` and joined at `#L251` (verified this planning
   run), not the design's illustrative eight (**P-015-10**). The design's own note is the reason this case exists:
   the forbidden vocabulary is not in 015's copy at all — it arrives from a shared module, through an element 015
   forgot to label, and lands in `aria-label` rather than in visible text. Testing 015's own strings would pass
   while the rendered page failed.
10. **Implement the sixteen `expectRejected` cases, one per row of `design.md` → `## D8`.** Every case uses at
    least one input a permissive implementation would have accepted, so reverting the behaviour under test makes
    the case fail. "Some refusal occurred" is not coverage: each case names its exact code string.
11. **Carry `RTR-SESSION-PREDICATE` with both its committed companions.** `design.md#L1037` and `#L1836` declare it
    firing when the trading-session test is keyed on `dateState` rather than `regular !== null`, **or** the derived
    2026 session count is not **251**. The adversarial case fixes a `next-session` claim entered `2026-11-26` and
    asserts it resolves the genuine `2026-11-27` early-close session rather than `2026-11-30`; the companion case
    asserts the derived session count is 251, not 249. Both are arithmetic over the committed
    `data/calendars/xnys/calendar.json` (`regular` 249 + `early-close` 2), never a literal typed into a fixture.
12. **Assert every Hard Constraint has at least one case.** The sixteen cases map onto `HC-1` … `HC-10`
    exhaustively; an HC with zero adversarial cases is itself a validator failure. This is the check that keeps the
    register from drifting into "the codes we happened to write" as later scopes add behaviour.
13. **Implement the four-layer determinism proof (NFR Determinism, HC-10, AC-003).** Resolution-object bytes,
    reducer `indexFingerprint`, `JSON.stringify(scorecard)`, and the `read` string plus `metrics` object are each
    compared across two runs by **string equality**, with `computedAt` excluded as provenance. There is no
    tolerance window because there is no float path that could justify one.
14. **Wire the validator into the baseline as a second entry point, not a second implementation.** `selftest.mjs`
    imports the named export exactly as it imports `validateBriefPayload` (`scripts/selftest.mjs#L18`). Per AC-018
    the baseline then reports `952 + N passed, 0 failed` with **no pre-existing assertion count decreasing** —
    stated as arithmetic because *"selftest still passes"* is satisfiable by deleting an assertion.
15. **Introduce no new test framework.** Three surfaces already exist and all three are used as-is: the build-free
    baseline, this validator, and Playwright (`playwright.config.mjs` declares `testMatch: '**/*.spec.mjs'` and the
    `system-chrome` project with `channel: 'chrome'`, both verified this planning run).
16. **Extend the fixture substrate** at `tests/fixtures/recommendation-track-record/adversarial/**` with one input
    per `expectRejected` case, each violating exactly **one** rule so a case cannot pass for the wrong reason, plus
    a clean control input per case that must be **accepted**. Every fixture carries explicit dates and no fixture
    reads a clock.
17. **Extend `tests/recommendation-track-record.unit.mjs`, `.functional.mjs` and `.integration.mjs`** with this
    scope's named cases. Existing files are extended, never rewritten.

---

## Shared Infrastructure Impact Sweep

This scope makes exactly one edit outside its own files, and it lands on the repo's shared harness:
`scripts/selftest.mjs` gains a single import of the new validator's named export, exactly as it already imports
`validateBriefPayload` at `#L18`. That one line is the entire blast radius, and it is a large one — the build-free
baseline is the surface every other scope's `T-NN-S1` row, and every other feature's regression claim, is measured
against. This scope also extends the substrate scope 01 created: the support module, the fixture root, and the three
test files that scopes 02 – 08 have already appended to.

**Downstream contract surfaces**

| Downstream contract | What depends on it | What breaks if it changes silently |
|---|---|---|
| Import side-effect freedom of the new validator — `main()` runs only under the argv guard, and importing sets no `process.exitCode`, prints nothing and opens no file | The baseline's own exit status, and therefore every validator result reported alongside it | An import-time side effect makes the baseline's outcome a function of import **ordering**. It presents as some unrelated validator regressing, which is the most expensive kind of false signal this repo can emit. |
| The `952 passed, 0 failed` baseline arithmetic (verified this planning run) | AC-018, and every `T-NN-S1` row across scopes 01 – 10 | The baseline may grow additively to `952 + N`; it may not shrink, and no pre-existing group's count may fall. A new import that throws at load takes the baseline to zero rather than to 952 — a failure a broad rerun reports late and confusingly. |
| Pre-existing group lines and their ordering in the baseline output | Any reader, human or gate, that attributes a regression to a named group | Inserting a group that renumbers or relabels a pre-existing one makes every historical baseline record unreadable against the current one. |
| The support module and the fixture conventions established in scope 01 | Scopes 02 – 08, which have already appended to the same three test files | This scope extends that same substrate; a signature or convention change here lands inside eight already-green scopes without any of them being opened. |
| Sibling validator co-tenancy — `validate-brief-payload.mjs`, `validate-market-action.mjs`, `validate-tool-experience.mjs` | The repo's existing validation surface | The new validator is a peer, not a supervisor. The three are read for their shape and asserted byte-unchanged and still exiting `0`. |
| The scan root of the four source scans | Every file those scans read | A scan root wider than the 015 surface turns a feature gate into a repo-wide blocker that refuses on another feature's legitimate code. The scans are bounded to 015-authored source, and the bound itself is asserted. |

**Canary before broad reruns.** `T-09-C1` captures the baseline's exact per-group line set and totals **before** the
import lands, re-runs after it, and asserts the pre-existing lines are byte-identical with only additive lines
appearing. It also imports the validator in isolation and asserts `process.exitCode` is untouched, stdout is empty
and no file is opened. It runs in seconds and **before** `T-09-R1` and `T-09-R2`, so an import side effect is named
at the import rather than discovered at the end of a full browser suite.

**Rollback and restore.** The single import block in `scripts/selftest.mjs` is independently reversible: discarding
that one file returns the baseline to exactly `952 passed, 0 failed` while the new validator stays fully usable
through its standalone entry point. That independence is the property that makes the harness edit safe to back out
without unwinding the rest of the scope, and `T-09-C2` rehearses it in a **disposable detached worktree** rather
than asserting it on paper — the live tree, which concurrent sessions share, is never touched.

---

## Change Boundary

The four source scans read repo-wide source, which makes this the scope most exposed to opportunistic correction: a
scan that surfaces a real problem in a file this scope does not own creates immediate pressure to fix it right here.
That is exactly the mixed-purpose sweep the boundary forbids.

**Allowed file families** — the only families this scope may create or modify:

| Family | Nature of the change |
|---|---|
| `scripts/validate-recommendation-track-record.mjs` | New file. The consolidated register, the sixteen adversarial cases, the four source scans, the named export and the argv-guarded `main()`. |
| `scripts/selftest.mjs` | **One import block and its call, and nothing else in the file.** No pre-existing assertion is edited, reordered, renumbered, or dropped. |
| `tests/recommendation-track-record.unit.mjs`, `.functional.mjs`, `.integration.mjs`, `.e2e.mjs`, `.canary.mjs` | **Extended** with this scope's named cases. Existing cases are neither edited nor reordered. |
| `tests/fixtures/recommendation-track-record/adversarial/**` | New inputs, one rule violated per negative input, each with a clean control that must be accepted. |
| `specs/015-recommendation-outcome-ledger-and-track-record/scopes/09-committed-validator-and-closed-codes/**` and this scope's sections of `report.md` | The planning and evidence artifacts this scope owns. |

**Excluded surfaces** — byte-untouched, no exceptions:

| Surface | Why it is out of bounds |
|---|---|
| Every pre-existing assertion in `scripts/selftest.mjs` | AC-018 forbids any pre-existing count falling. The file is opened for exactly one import and one call. |
| `scripts/validate-brief-payload.mjs`, `scripts/validate-market-action.mjs`, `scripts/validate-tool-experience.mjs` | The shape precedent. A validator that patched the surface it validates would prove nothing at all. |
| `rlvalidation.js`, `rlcontracts.js`, `rlg.js`, `rlchart.js`, `rlcontext.js`, `rlticker.js`, `rldata.js`, `rlbrief.js`, `rlmarketaction.js`, `rlapp.js`, `rlnav.js` | Features 002, 007, 012, 013 and the shared shell. `RTR-LOCAL-STATISTIC`, `RTR-REDUCER-FORK` and `RTR-CENTER-VIEW` scan **for** violations; they never author a correction. |
| Any file a scan flags that is **not** 015-authored | A genuine finding outside 015 is recorded and routed to its owning feature. Correcting it here would leave this change set with two purposes and no way to review either. |
| The product source of scopes 01 – 08 | A scan failure is fixed in the owning scope, never worked around here. This scope writes no product source, renders nothing, computes no statistic, and alters no contract. |
| `briefs/objects/**`, `briefs/history/**`, `data/bars/**`, `data/calendars/**` | Committed read-only substrate. The 251-session figure is **derived** from the committed calendar, never written into it. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json`, `simple-models.json` | Counted registries — scope 10 only. |
| `spec.md`, `design.md`, `scopes/_index.md` | The P-015-11 drift is routed, not patched. Planning does not edit `scopes/_index.md` mid-feature. |
| Every other `scopes/NN-*/` directory and every other `specs/**` directory | Owned by sibling scopes and by concurrent sessions. |

**Collateral cleanup is opt-in, never implicit.** The four scans will surface findings; the disposition of a finding
outside 015 is a routed packet, not an edit. Bundling one in would defeat `T-09-C2`'s restore rehearsal, whose whole
value rests on the shared-harness edit being a single reversible line.

---

## Test Plan

Every negative row asserts the **exact** refusal string. Rows `T-09-U2` and `T-09-F8` are the meta-rows: the first
proves the assertion helper cannot pass on acceptance, the second proves the register cannot silently shrink.
Without them, a green validator would be evidence of nothing.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-09-U1 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | Module shape: `validateRecommendationTrackRecord` is a **named export** returning the six-section object (`authority`, `claims`, `resolver`, `scorecard`, `surface`, `adversarial`); `main()` runs **only** under the argv guard; and importing the module sets no `process.exitCode`, prints nothing, and touches no file. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-09-u1` |
| T-09-U2 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | **The helper is adversarially tested before it is trusted.** `expectRejected(name, code, fn)` fails when `fn()` **accepts**, fails when `fn()` rejects with a *different* code, and passes only on the exact code. A helper that passed on acceptance would make all sixteen cases vacuous while reporting green. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-09-u2` |
| T-09-U3 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | The register is closed and complete: exactly **16** codes, each string asserted verbatim, no seventeenth, none dynamically constructed, and each mapped to exactly one owning scope. `RTR-SESSION-PREDICATE` is asserted **present**, since its omission is the P-015-11 drift this row exists to catch. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-09-u3` |
| T-09-F1 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | `RTR-LOCAL-STATISTIC` fires with its exact code on a scorecard module computing `wins / total` inline instead of calling `rlvWilsonInterval`, and the clean 015 surface is asserted to trigger it **nowhere** — the outside-scope-05 proof of HC-1. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-09-f1` |
| T-09-F2 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | `RTR-REDUCER-FORK` fires with its exact code on a local `applyClosure()` that mutates entries instead of routing through `reduceRecommendationEvents`, and the clean surface triggers it nowhere; `rlcontracts.js` is asserted byte-unmodified. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-09-f2` |
| T-09-F3 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | `RTR-CENTER-VIEW` fires with its exact code when 015 source declares view id `"track-record"` and appends it to `viewOrder`; the clean surface writes no `viewOrder`/`views`/`viewState`; `rlmarketaction.js` is byte-unmodified and `CENTER_VIEW_IDS` still has exactly four members (`#L77`). | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-09-f3` |
| T-09-F4 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | `RTR-ACTION-EMITTED` fires on **both** halves, asserted separately: action vocabulary in the rendered surface, **and** a `<label>Horizon</label>` emitted **without** a `title`, which would let `rlg.js` `decorate()` write the trading-vocabulary `aria-label` from `G["horizon"]`. The scan runs over the **committed fifteen-member** `GLOSSARY_SELECTOR` (`rlg.js#L249`–`#L251`), so a `.flag` or `.chart .cc` element without a `title` is caught (P-015-10). | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-09-f4` |
| T-09-F5 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | All **16** `expectRejected` cases from `design.md` → `## D8` fail closed with exactly their named code, enumerated one per row of that table, and each case's clean control input is **accepted** — so a case cannot pass because the validator rejects everything. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-09-f5` |
| T-09-F6 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | `RTR-SESSION-PREDICATE` fires with its exact code when the session test is keyed on `dateState === "regular"`: a `next-session` claim entered `2026-11-26` must resolve the genuine `2026-11-27` early-close session, **not** `2026-11-30`. The companion case asserts the derived 2026 session count is **251**, computed from the committed calendar rather than typed into the fixture. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-09-f6` |
| T-09-F7 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | The four-layer determinism proof holds by **string equality** with no tolerance window: resolution-object bytes, reducer `indexFingerprint`, `JSON.stringify(scorecard)`, and the `read` string plus `metrics` object are each identical across two runs, with `computedAt` excluded as provenance. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-09-f7` |
| T-09-F8 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | **Coverage cannot silently shrink.** Every Hard Constraint `HC-1` … `HC-10` has ≥ 1 adversarial case, asserted by mapping all sixteen cases onto the ten constraints exhaustively; removing any case leaves its HC uncovered and fails the row. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-09-f8` |
| T-09-I1 | Integration | `integration` | — | `tests/recommendation-track-record.integration.mjs` | The validator runs **standalone**: `node scripts/validate-recommendation-track-record.mjs` exits `0` on the clean surface, prints one line per section, and exits `1` with a non-empty diagnostic when any section fails — the `_index.md` checkpoint for this scope. | `node scripts/validate-recommendation-track-record.mjs` | No | `report.md#t-09-i1` |
| T-09-I2 | Integration | `integration` | — | `tests/recommendation-track-record.integration.mjs` | **One implementation, two entry points.** The baseline imports the named export exactly as `scripts/selftest.mjs#L18` imports `validateBriefPayload`; the standalone run and the imported run assert the **same** six sections; and no refusal is implemented twice. A second copy of any code string fails the row. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-09-i2` |
| T-09-C1 | Fixture Canary | `unit` | — | `tests/recommendation-track-record.canary.mjs` | **Canary: the shared-harness contract, asserted at the import rather than at the end of a browser suite.** The baseline's exact per-group line set and totals are captured **before** the `scripts/selftest.mjs` import lands and re-captured after it: pre-existing group lines are byte-identical, only additive lines appear, and the totals read `952 + N passed, 0 failed` with `N ≥ 0` and no pre-existing group count falling. The validator is additionally imported in isolation and asserted to leave `process.exitCode` untouched, print nothing, and open no file. Runs in seconds and **before** `T-09-R1` / `T-09-R2`. | `node --test tests/recommendation-track-record.canary.mjs` | No | `report.md#t-09-c1` |
| T-09-C2 | Fixture Canary | `functional` | — | `tests/recommendation-track-record.canary.mjs` | **Canary: the harness back-out is rehearsed in a disposable worktree, never on the live tree.** A detached `git worktree` is created at the pre-import commit; `node scripts/selftest.mjs` is run inside it and asserted at **952 passed, 0 failed** with its group lines byte-identical to the pre-existing lines of the post-import run; `node scripts/validate-recommendation-track-record.mjs` is asserted to still exit `0` standalone **without** the import, proving the two entry points are independently reversible; the three committed sibling validators each still exit `0`; `git status --porcelain` in the live tree contains no entry outside this scope's allowed file families; and the worktree is torn down on exit, success or failure. | `node --test tests/recommendation-track-record.canary.mjs` | No | `report.md#t-09-c2` |
| T-09-R1 | Regression E2E | `e2e` | — | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for the closed-code register.** A standing pass runs the committed validator end to end over the whole 015 surface and re-asserts that the register still carries exactly the 16 verbatim codes with `RTR-SESSION-PREDICATE` present, that every one of the 16 `expectRejected` cases still fails closed with its exact code while its clean control is still accepted, that the four source scans still fire on their injected violations and nowhere on the clean surface, and that every `HC-1` … `HC-10` still has at least one adversarial case. The row is permanent, so a later scope that adds a seventeenth code, drops a case, or leaves a Hard Constraint uncovered fails here rather than shrinking coverage silently. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-09-r1` |
| T-09-R2 | Regression E2E | `e2e` | — | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the validator is added and imported as a second entry point into `scripts/selftest.mjs`, with no pre-existing test removed, skipped, or newly failing — the proof that the new import is side-effect-free in practice and not only by unit assertion. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-09-r2` |
| T-09-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the validator, the fixtures and the test cases land, at `952 + N passed, 0 failed`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-09-s1` |

**Test Plan rows: 18.**

---

### Definition of Done

#### Core items

- [ ] `scripts/validate-recommendation-track-record.mjs` exists, follows the `scripts/validate-market-action.mjs` shape (`invariant` `#L56`, named export `#L223`, `main()` `#L232`, argv guard `#L249`), and introduces no test framework.
- [ ] `validateRecommendationTrackRecord()` is a named export returning the six-section object; `main()` runs only under the argv guard and importing the module has **zero** side effects.
- [ ] `expectRejected(name, code, fn)` asserts the exact code and **fails on acceptance**; it is itself adversarially tested before any case relies on it.
- [ ] The consolidated register carries exactly **16** codes as frozen string constants, each mapped to exactly one owning scope, with no seventeenth and none dynamically constructed.
- [ ] **Routed finding P-015-11 is recorded.** `design.md` → `## D8` and `## D11` F-015-D8-01 declare 16 codes including `RTR-SESSION-PREDICATE`; `scopes/_index.md` records 15 and omits it. This scope implements the design-declared 16 per the index's own design-boundary rule and records the routed decision in `report.md`; `scopes/_index.md` is **not** edited here.
- [ ] `RTR-LOCAL-STATISTIC` is implemented as a source scan over 015-authored source and fires on an estimator, interval, mean or discount computed outside `RLVALID`.
- [ ] `RTR-REDUCER-FORK` is implemented as a source scan and fires on a local re-implementation of the lifecycle reducer or its closure application.
- [ ] `RTR-CENTER-VIEW` is implemented as a source scan and fires on any Center `viewOrder` / `views` / `viewState` write or view-id declaration.
- [ ] `RTR-ACTION-EMITTED` is implemented with **both** halves — action vocabulary on the rendered surface, and the precondition that any element matching the **committed fifteen-member** `GLOSSARY_SELECTOR` lacks a `title` (P-015-10).
- [ ] All 16 `expectRejected` cases from `design.md` → `## D8` are implemented; each fails closed with its exact code, and each carries a clean control input that is **accepted**.
- [ ] `RTR-SESSION-PREDICATE` carries both committed companions: the `2026-11-26` → `2026-11-27` early-close case, and the derived-2026-session-count-is-251 case, both computed from the committed calendar rather than typed as literals.
- [ ] Every Hard Constraint `HC-1` … `HC-10` has at least one adversarial case; an uncovered constraint is a validator failure.
- [ ] The four-layer determinism proof is implemented as string equality with `computedAt` excluded and **no** tolerance window.
- [ ] The validator is imported into `scripts/selftest.mjs` as a second entry point; no refusal is implemented twice and no code string appears in two places.
- [ ] Every fixture violates exactly **one** rule, so no case can pass for the wrong reason.
- [ ] This scope writes no product source, renders nothing, computes no statistic, changes no contract, and modifies no earlier scope's surface.
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code.
- [ ] No numeric literal for the unresolvable-legacy count appears anywhere in this scope's source or fixtures; the `legacy-count-hardcoded` case derives both figures from the ledger (HC-4).
- [ ] Change Boundary is respected and zero excluded file families were changed — `scripts/selftest.mjs` carries exactly one added import block and one call with every pre-existing assertion byte-identical; the three committed sibling validators, all eleven feature-owned and shared-shell modules, the committed substrate under `briefs/` and `data/`, the counted registries, `spec.md`, `design.md` and `scopes/_index.md` are all byte-unchanged, verified by `git status --porcelain` diffed against the allowed-family list with the raw output recorded in `report.md`; every scan finding outside 015 is routed rather than corrected here.

#### Test items

- [ ] T-09-U1 passes: the named export, argv-guarded `main()` and side-effect-free import all hold → evidence recorded in `report.md#t-09-u1`.
- [ ] T-09-U2 passes: `expectRejected` fails on acceptance and on a wrong code, and passes only on the exact code → evidence recorded in `report.md#t-09-u2`.
- [ ] T-09-U3 passes: the register is exactly 16 verbatim codes, one owner each, with `RTR-SESSION-PREDICATE` present → evidence recorded in `report.md#t-09-u3`.
- [ ] T-09-F1 passes: `RTR-LOCAL-STATISTIC` fires on an inline `wins / total` and nowhere on the clean surface → evidence recorded in `report.md#t-09-f1`.
- [ ] T-09-F2 passes: `RTR-REDUCER-FORK` fires on a local `applyClosure()` and `rlcontracts.js` is byte-unmodified → evidence recorded in `report.md#t-09-f2`.
- [ ] T-09-F3 passes: `RTR-CENTER-VIEW` fires on a declared view id and `CENTER_VIEW_IDS` still has four members → evidence recorded in `report.md#t-09-f3`.
- [ ] T-09-F4 passes: `RTR-ACTION-EMITTED` fires on both halves over the committed fifteen-member selector → evidence recorded in `report.md#t-09-f4`.
- [ ] T-09-F5 passes: all 16 adversarial cases fail closed with their exact codes and every clean control is accepted → evidence recorded in `report.md#t-09-f5`.
- [ ] T-09-F6 passes: `RTR-SESSION-PREDICATE` fires on the `dateState`-keyed predicate and the derived session count is 251 → evidence recorded in `report.md#t-09-f6`.
- [ ] T-09-F7 passes: all four determinism layers are byte-identical across runs with no tolerance window → evidence recorded in `report.md#t-09-f7`.
- [ ] T-09-F8 passes: every `HC-1` … `HC-10` has ≥ 1 case and removing one leaves its HC uncovered → evidence recorded in `report.md#t-09-f8`.
- [ ] T-09-I1 passes: `node scripts/validate-recommendation-track-record.mjs` exits 0 standalone and 1 with a diagnostic on failure → evidence recorded in `report.md#t-09-i1`.
- [ ] T-09-I2 passes: the standalone and imported entry points assert the same six sections from one implementation → evidence recorded in `report.md#t-09-i2`.
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns — [T-09-C1] the pre-import and post-import baseline group lines are byte-identical, only additive lines appear, the totals read `952 + N passed, 0 failed` with no pre-existing group count falling, and the validator imported in isolation leaves `process.exitCode` untouched, prints nothing and opens no file, all asserted **before** `T-09-R1` and `T-09-R2` run → evidence recorded in `report.md#t-09-c1`.
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified — [T-09-C2] the pre-import state is reconstructed in a disposable detached worktree, the baseline there is asserted at `952 passed, 0 failed` with byte-identical group lines, the new validator is proven to still exit `0` standalone without the import, the three sibling validators each still exit `0`, the live tree carries no entry outside the allowed file families, and the worktree is torn down on exit whether the rehearsal succeeded or failed → evidence recorded in `report.md#t-09-c2`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-09-R1] the exactly-16 register, all 16 fail-closed cases with their accepted clean controls, the four source scans, and full `HC-1` … `HC-10` coverage all re-assert as a standing guard → evidence recorded in `report.md#t-09-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-09-R2] the committed Node E2E files and the whole committed Playwright spec suite are green after the validator is imported into `scripts/selftest.mjs`, proving the new import is side-effect-free in practice → evidence recorded in `report.md#t-09-r2`.
- [ ] T-09-S1 passes: `node scripts/selftest.mjs` reports `952 + N passed, 0 failed` with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-09-s1`.

**Test-related DoD items: 18. Test Plan rows: 18. Parity confirmed.**

**The `_index.md` checkpoint for this scope is satisfied by T-09-I1 and T-09-F5 together** — the validator exits 0
standalone, and every `expectRejected` case fails closed with exactly its named code. The checkpoint's *"fifteen"*
is the P-015-11 drift; its **substance** is honoured against the design-declared sixteen.

#### Build Quality Gate

- [ ] Zero warnings across `node --test`, `node scripts/validate-recommendation-track-record.mjs` and `node scripts/selftest.mjs`; zero issues deferred, skipped, or worked around; every adversarial case verified to fail when the behaviour it guards is reverted; `rlvalidation.js`, `rlcontracts.js`, `rldata.js`, `rlbrief.js`, `rlmarketaction.js`, `rlg.js`, `rlchart.js`, `rlcontext.js`, `rlticker.js`, `rlapp.js` and `rlnav.js` all byte-unmodified; `scripts/validate-market-action.mjs` and `scripts/validate-tool-experience.mjs` byte-unmodified; `spec.md`, `design.md` and `scopes/_index.md` unmodified by this scope; no other scope directory and no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlvalidation.js` | **Feature 007-owned, consume-only.** `RTR-LOCAL-STATISTIC` scans **for** local statistics; it does not add one. The module is read for its primitive names and is never modified, forked, or shimmed — a validator that patched the thing it validates would prove nothing. |
| `rlcontracts.js` reducer and `CLOSE_EVENT_TYPES` | **Feature 002-owned, consume-only.** `RTR-REDUCER-FORK` scans for a local re-implementation; the real reducer is read and driven, never edited or extended. |
| The persisted `rldata.js` cache schema | **Feature 013-protected (FR-021, AC-012).** The FR-021 case performs a **byte-comparison** of the cache before and after a full render; it writes nothing to the cache and creates no key. |
| The Market Action Center four-view composition | **Feature 012-owned (`RLMKT-VIEW`).** `RTR-CENTER-VIEW` proves 015 never approaches it. This scope writes no `viewOrder`, `views` or `viewState` and declares no view id — including inside its own adversarial fixture, which is an in-memory construct and never a write to Center source. |
| `rlg.js` | Shared-shell module, consume-only. `RTR-ACTION-EMITTED` asserts the **precondition** that lets `decorate()` claim an element; the fix is always an added `title` on the 015 surface, never an edit to the glossary, a suppression of `scan()`, or a shadowing of the module. |
| `scripts/validate-market-action.mjs`, `scripts/validate-brief-payload.mjs`, `scripts/validate-tool-experience.mjs` | Existing committed validators. They are the **shape precedent** and are read, not modified. `scripts/selftest.mjs` is extended by a single import and its existing assertions are neither edited nor removed — AC-018 forbids any pre-existing count decreasing. |
| `recommendation-track-record-lab.html`, `compute()`, `renderSimple`, `renderPower` | Scopes 07 and 08. The validator **scans** the rendered surface and the authored source; it never edits either, and a scan failure is fixed in the owning scope, not worked around here. |
| `scripts/brief-resolve-outcomes.mjs`, the scope-05 model, `buildOwnerRead` / `buildMetrics` | Scopes 04, 05 and 06. Each proves its own codes under `node --test`; this scope consolidates the register and adds the four codes no single earlier scope could own. |
| `briefs/objects/**`, `briefs/history/**`, `data/bars/**`, `data/calendars/**` | Committed read-only substrate. Adversarial inputs are fixtures under `tests/fixtures/`; any read of a committed file asserts its bytes unchanged. The 251-session figure is **derived** from the committed calendar, never written into it. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json`, `simple-models.json` | Counted registries. Scope 10 only. |
| Any other `scopes/NN-*/` directory in this feature | Each scope owns its own directory. This scope writes only `scopes/09-committed-validator-and-closed-codes/`. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
