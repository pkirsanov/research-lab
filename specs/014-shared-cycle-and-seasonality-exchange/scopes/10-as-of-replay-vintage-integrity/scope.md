# Scope 10: As-of replay vintage integrity

**Status:** Not Started
**Depends On:** Scope 9 (`09-published-exchange-end-to-end`)
**Tags:** `overlay:true`, `blocked-on-006-scope-5`

**Primary Outcome:**
The EP-2 catalog-source binding is extended to Feature 006's real as-of replay so vintage resolution runs
point-in-time against genuinely revised input rows rather than against a truncation of later rows. A **real**
revision-contaminated cycle history — one whose input history was assembled by truncating later rows while at least
one row was revised after the requested decision-time cutoff — resolves `unresolved-at-cutoff` and is **refused at
publication rather than approximated**. No envelope carrying the hindsight-smoothed history exists afterwards, no
earlier vintage is substituted to reach a positive reading, and any previously admitted envelope for that publisher
identity is left byte-identical. Feature 006's own surfaces remain Protected Surfaces and are read, never modified.

**Blocking condition (binding).** This scope is `blocked-on-006-scope-5`. It is **not schedulable** until Feature 006
Scope 5 delivers real revision/vintage replay. Fixtures prove the contract; they can never satisfy this scope,
because a synthetic revision history cannot demonstrate that real revised rows are detected — and a fixture-backed
pass reported here would be fabricated evidence.

---

## Business Scenarios owned

### BS-014-006: A revision-contaminated cycle history is refused at publication

```gherkin
Scenario: Hindsight-smoothed inputs cannot become as-of-safe shared evidence
  Given A2 holds a cycle evidence record whose input history was assembled by truncating later rows rather than by resolving each row to the value available at the decision time
  And at least one input row was revised after the requested decision-time cutoff
  When A2 attempts to resolve the as-of vintage for the record
  Then the vintage resolves to unresolved-at-cutoff
  And the publication is refused rather than approximated
  And no envelope carrying the hindsight-smoothed history exists
```

---

## Implementation Plan

1. **Extend the EP-2 catalog-source binding in `shared-cycle-exchange-universe.json`** to resolve records through
   Feature 006's real as-of replay, so each input row is resolved to the value available at the decision time rather
   than to its latest value. The binding remains declarative configuration; 014 authors no catalog entry.
2. **Bind real replay into the vintage resolver in `rlcycx.js`** at the seam Scope 1 established, so
   `cyc-vintage-unresolved-at-cutoff` — a code owned by Scope 1 per the `_index.md` refusal-code ownership map — now
   fires on real post-cutoff revisions and not only on the fixture family. This scope adds no new refusal code and
   changes no existing code's meaning; it supplies the real input that reaches an already-owned code.
3. **Keep the refusal inert.** The refusal path writes nothing: no envelope, no partial record, no truncated-history
   record, and no substituted earlier vintage. Any envelope previously admitted for that publisher identity is left
   untouched, per foundation-owned behaviour 8 (whole-or-nothing admission and refusal inertness).
4. **Report replay availability in `scripts/validate-shared-cycle-exchange.mjs`** so the validator states whether
   vintage resolution ran against real as-of replay or against fixture history, and reports the two distinguishably.
5. **Extend `tests/shared-cycle-exchange.support.mjs`** with the real-replay harness: it refuses to run when 006
   as-of replay is unavailable and reports that refusal as a skip-with-reason that is never reported as a pass.
6. **Extend `tests/shared-cycle-exchange.functional.mjs`, `tests/shared-cycle-exchange.integration.mjs`, and
   `tests/shared-cycle-exchange.spec.mjs`** with the revision-contamination refusal, the refusal-inertness assertion,
   and the Power-surface rendering of `unresolved-at-cutoff`.
7. **Record the replay binding in `notes/shared-cycle-exchange.md`** — which 006 replay surface is consulted and what
   distinguishes a truncation-assembled history from a point-in-time resolved one.
8. **Touch no Feature 006 file.** `trend-dynamics-cycle-lab.html`, `trend-dynamics-cycle-universe.json`, and
   `scripts/validate-trend-dynamics-cycle.mjs` are Protected Surfaces per `design.md` → *Protected Surfaces*.

---

### Test Plan

Every row runs against **real** Feature 006 as-of replay over a **real** revision-contaminated history. No row is
satisfiable by a fixture. Each negative row asserts the exact `refusalCode` string plus its companion field — the
contaminating row identity and the requested cutoff — rather than asserting only that "a refusal occurred". The
Playwright row contains no early-exit bailout: every required assertion is a direct `expect(locator).toBeVisible()`
or a direct count assertion with no escape path.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Functional | T-10-F1 | `functional` | BS-014-006 | `tests/shared-cycle-exchange.functional.mjs` | A real input history containing a row revised **after** the requested cutoff resolves `unresolved-at-cutoff` and refuses publication with the exact code `cyc-vintage-unresolved-at-cutoff` naming the contaminating row and the cutoff. The history is constructed so that a naive truncation test — drop rows dated after the cutoff — passes it cleanly; only real revision awareness detects the contamination, which is exactly what makes the row adversarial. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Integration | T-10-I1 | `integration` | BS-014-006 | `tests/shared-cycle-exchange.integration.mjs` | The refusal is inert and complete: after the refused publication, a store scan finds **zero** envelopes for that publisher identity carrying the hindsight-smoothed history, no partial or truncated-history record exists, and a previously admitted envelope for the same publisher identity is asserted byte-identical. An earlier admitted vintage of the same evidence is genuinely present in the store, and the row asserts it was not substituted and not returned. | `node --test tests/shared-cycle-exchange.integration.mjs` | No |
| Functional | T-10-F2 | `functional` | BS-014-006 | `tests/shared-cycle-exchange.functional.mjs` | A real history whose rows were resolved point-in-time — the uncontaminated control published from the same replay source in the same run — resolves its vintage successfully and is admitted. Without this control, a resolver that refused every real history would pass T-10-F1 while being entirely broken. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| E2E UI | T-10-P1 | `e2e-ui` | BS-014-006 | `tests/shared-cycle-exchange.spec.mjs` | On the Power publication control, the vintage renders as `unresolved-at-cutoff` and the refusal renders with its named reason and a resolve line, asserted by direct `expect(locator).toBeVisible()`. A DOM-wide query for any approximate, force-publish, publish-anyway, or use-earlier-vintage affordance returns a count of **zero**, and none exists in a `hidden` or `disabled` form; the row asserts the earlier admitted vintage present in the same run appears nowhere on the control. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| Tool validator | T-10-V1 | tool validator | BS-014-006 | `scripts/validate-shared-cycle-exchange.mjs` | The validator states whether vintage resolution ran against real 006 as-of replay or against fixture history and reports the two distinguishably, so fixture history can never be presented as replay evidence for this scope. | `node scripts/validate-shared-cycle-exchange.mjs` | No |

**Test Plan rows: 5.**

---

### Definition of Done

#### Core items

- [ ] **This scope is `blocked-on-006-scope-5` and is NOT schedulable until Feature 006 Scope 5 delivers real revision and vintage replay.** Feature 006 Scope 5 is `Not Started` and Feature 006's own state is `not_started`. Until that changes, this scope may not be started, may not be marked In Progress, and may not be marked Done.
- [ ] **Fixtures prove the contract but can never satisfy this scope.** Every row in this Test Plan requires real revision-contaminated history replayed through Feature 006's real as-of replay. A synthetic revision history cannot demonstrate that real revised rows are detected, a fixture-backed pass reported as real replay evidence is fabricated evidence, and a fixture-backed run is recorded as a skip-with-reason, never as a pass.
- [ ] The EP-2 catalog-source binding in `shared-cycle-exchange-universe.json` resolves records through Feature 006's real as-of replay, and 014 authors no catalog entry and extends no domain or type.
- [ ] Vintage resolution is point-in-time and revision-aware: a history assembled by truncating later rows while carrying a post-cutoff revision resolves `unresolved-at-cutoff`.
- [ ] The publication is refused rather than approximated, and no envelope carrying the hindsight-smoothed history exists afterwards.
- [ ] No earlier vintage is substituted to reach a positive reading, including when an earlier admitted vintage of the same evidence is present in the store.
- [ ] The refusal is inert: it writes no envelope and no partial record, and leaves any previously admitted envelope for that publisher identity byte-identical.
- [ ] An uncontaminated point-in-time-resolved control history from the same real replay source publishes successfully, proving the resolver refuses contamination rather than refusing everything.
- [ ] This scope adds no new refusal code and changes no existing code's meaning: `cyc-vintage-unresolved-at-cutoff` remains owned by Scope 1 per the `_index.md` refusal-code ownership map, and this scope supplies the real input that reaches it.
- [ ] `scripts/validate-shared-cycle-exchange.mjs` reports real as-of replay distinguishably from fixture history.
- [ ] No Feature 006 file is modified — `trend-dynamics-cycle-lab.html`, `trend-dynamics-cycle-universe.json`, and `scripts/validate-trend-dynamics-cycle.mjs` are read only, per `design.md` → *Protected Surfaces* (HC-1).
- [ ] Every file this scope touches — `rlcycx.js`, `shared-cycle-exchange-universe.json`, `scripts/validate-shared-cycle-exchange.mjs`, `notes/shared-cycle-exchange.md`, `tests/shared-cycle-exchange.support.mjs`, `tests/shared-cycle-exchange.functional.mjs`, `tests/shared-cycle-exchange.integration.mjs`, `tests/shared-cycle-exchange.spec.mjs` — is listed in `design.md` → `### Files 014 MAY CREATE` or `### Files 014 MAY MODIFY`, and no Protected Surface is opened as a change target.
- [ ] **Feature 013 interaction:** this scope opens no file Feature 013 owns. It does not reopen `rldata.js`, does not touch `rlratio.js`, `ratio-pairs.json`, `rlregime.js`, `regime-archetypes.json`, or `market-regime-lab.html`, does not touch 013's regime owner-read adapter in `scripts/brief-refresh.mjs`, and touches none of the five counted registries, so `node scripts/validate-tool-experience.mjs` stays green against the unchanged counts.

#### Test items

- [ ] T-10-F1 passes on real 006 as-of replay: a real post-cutoff revision that survives a naive truncation test resolves `unresolved-at-cutoff` and refuses with the exact code naming the contaminating row and the cutoff → evidence recorded in `report.md`.
- [ ] T-10-I1 passes on real 006 as-of replay: zero envelopes and zero partial records exist after the refusal, the prior admitted envelope is byte-identical, and the genuinely present earlier vintage was not substituted → evidence recorded in `report.md`.
- [ ] T-10-F2 passes on real 006 as-of replay: the uncontaminated point-in-time control history publishes successfully from the same replay source → evidence recorded in `report.md`.
- [ ] T-10-P1 passes on real 006 as-of replay: the Power control renders `unresolved-at-cutoff` with a named reason and a resolve line, exposes zero approximate, force-publish, or use-earlier-vintage affordances by DOM count, and shows no earlier vintage → evidence recorded in `report.md`.
- [ ] T-10-V1 passes on real 006 as-of replay: the validator reports real replay and fixture history distinguishably → evidence recorded in `report.md`.

**Test-related DoD items: 5. Test Plan rows: 5. Parity confirmed.**

---

*Educational research context only — not investment advice.*
