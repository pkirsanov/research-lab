# Scope 10: Registration, notes and regression closure

**Status:** Not Started
**Depends On:** 06, 09
**Tags:** `closure:true`, `counted-registry`, `routed:P-015-04`, `routed:P-015-12`
**Design section:** `design.md` → `## D6 — Owner Read And Center Consumption` (`### Registration Surface (FR-019, AC-016)`)
**Business Scenarios owned:** — (none)
**UI rows owned:** UI-35 (**1 row**)
**Refusal codes owned:** — (none of its own; it consumes `scripts/validate-tool-experience.mjs`'s existing
`E012-*` register and proves `RLMKT-VIEW` is never reached)

**Primary Outcome:**
015 becomes a **registered** tool: the owner read scope 06 has been publishing since it landed is finally looked up
by id and rendered inside the Center's existing Brief view, and the Center still composes **exactly four** views
with no `RLMKT-VIEW` refusal (UI-35, HC-3, FR-021). Registration is not bookkeeping — `RLBRIEF.renderToolReads`
iterates the `tools` argument and looks each read up **by tool id** (`rlbrief.js#L689`), so a read whose tool is
absent from `tools.json` lands in neither the `available` nor the `missing` bucket and is invisible. This scope is
last, isolated and serialised because it mutates **seven** surfaces at once and trips four hardcoded count
assertions that fail the whole repo check unless they move in the same change. It closes the feature by re-running
the entire 015 test surface plus both committed validators in one pass.

**Boundary with the surrounding scopes.** Scope 06 proved FR-018 contract compliance standalone — `putToolRead`
writes and returns regardless of registration — and deliberately claimed **no** Center-visible evidence, recording
the unregistered case honestly in `T-06-I2`. This scope is what makes that deferral honest rather than convenient:
it flips the same read from invisible to rendered and asserts the flip. Scope 09 must be green first, because
registering a tool whose validator does not yet pass would put a live nav entry in front of an unverified surface.

**Scope boundary — no literal count survives planning (HC-4).** Every count this scope asserts is **re-read from
the then-current registries at execution time**. The repo publishes on a schedule and concurrent specs register
their own tools; a total recorded during planning is stale before it is executed. What this scope fixes is 015's
own **delta** — one tool, one simple-model definition, exactly two journey goals with their two steps — and every
expected total is that delta applied to a freshly-read base.

**Two routed advisories.** `spec.md` → FR-019 names only `tools.json`, the `index.html` `TOOLS` array, the
`rlnav.js` `TOOLS` array and `notes/<id>.md`; the real surface is larger and is cross-asserted as one packet
(**P-015-04**). And `design.md` → `## D6` states the `rlnav.js` mirror is maintained by *"four subsequent
`TOOLS.push(…)` blocks"*, while three `TOOLS.push(` call sites are present (`rlnav.js#L72`, `#L75`, `#L79`,
verified this planning run) — a citation drift that does not change the append **convention** this scope follows
(**P-015-12**). Both are routed; `spec.md` and `design.md` are not edited here.

---

## Business Scenarios owned

None. This scope owns no `BS-*` row. It owns exactly one UI row — **UI-35** — reassigned here from scope 06 by the
F-015-D6-01 resolution recorded in `scopes/_index.md`, because registration is what makes the read visible at all
and therefore what makes UI-35 assertable. Its remaining obligations are **FR-019** and **AC-016**, plus the
verification halves of **HC-3**, **FR-018** and **FR-021**, all asserted by the Test Plan below.

---

## Implementation Plan

1. **Treat registration as one packet, not seven edits.** `scripts/validate-tool-experience.mjs` cross-asserts the
   tool registry, the simple-model registry and the journey registry together
   (`sameValues` at `#L140`, `#L141`, `#L142`, verified this planning run), so a partial registration fails the
   build rather than shipping a half-registered tool. All seven surfaces move in **one** change:

   | # | Surface | 015's delta |
   |---|---|---|
   | 1 | `tools.json` → `tools[]` | one entry: `{ id, title, nav, file, notes, status, updated, blurb, tags, briefing, experience }` |
   | 2 | `tools.json` → `experience` | `tool-experience/v1`; `kind: "ordinary"`, `viewSetId: "ordinary-four-view/v1"`, `viewIds: ["simple","power","brief","journey"]` |
   | 3 | `tools.json` → `briefing` | `role: "source"`, feeding scope 06's owner read |
   | 4 | `simple-models.json` → `definitions[]` | **exactly one** definition — mandatory, not optional |
   | 5 | `journeys.json` → `definitions[]` + `steps[]` | **exactly two** goals with their matching steps |
   | 6 | `index.html` → `TOOLS` | one appended entry |
   | 7 | `rlnav.js` → `TOOLS` | one appended entry via the `TOOLS.push(…)` convention |
   | 8 | `notes/recommendation-track-record-lab.md` | the handoff doc the repo convention requires |
   | 9 | `scripts/validate-tool-experience.mjs` | the four literal count assertions, bumped |

2. **Add the `simple-models.json` definition, because omitting it fails the build.**
   `invariant(sameValues(toolIds, modelToolIds), 'each registry tool must own exactly one simple-model definition')`
   at `#L140` means registering in `tools.json` without a matching definition is not a partial success — it is a
   red check. `spec.md` → FR-019 does not name this surface at all (**P-015-04**).
3. **Register exactly two journey goals, and decide the number rather than discover it.** The per-row rule at
   `#L501` requires every ordinary tool to reference **at least two** goals, and `#L499` requires the Center to
   reference **exactly four**. Registering a third goal would move `totalGoals` and `definitionCount` by three
   instead of two — and because those are **literal** assertions, the number in the validator and the number in
   `journeys.json` must be decided together, not discovered at test time.
4. **Give both goals `noExecution: true`.** A definition with `noExecution: false` is rejected as
   `E012-JOURNEY-DEFINITION`, which is exactly consistent with HC-9: the track-record surface measures, it never
   acts. A journey that ended in an action would re-introduce, through the journey registry, the advice the whole
   feature exists not to give.
5. **Bump the four literal count assertions in the same change, to recomputed values.**
   `validateJourneyRegistryCoverage` drives the real `rljourney.js` runtime against the real registries and then
   asserts four literals — `ordinaryTools` (`#L493`), `centerGoals` (`#L494`), `totalGoals` (`#L495`) and
   `definitionCount` (`#L496`), all verified this planning run. 015 adds **one** ordinary tool, **zero** Center
   goals and **two** journey goals, so each literal becomes its **freshly re-read base plus 015's delta**. No total
   recorded during planning is used as the expected value.
6. **Append; never edit the literal array.** `rlnav.js` carries the comment *"order mirrors index.html's TOOLS
   array"* (`#L43`) and its literal array opens at `#L45`; later tools were added through `TOOLS.push(…)` blocks
   after it (`#L72`, `#L75`, `#L79`). Editing the literal would break the mirror for the pushed entries, so 015 is
   appended last in `rlnav.js` and appended last in `index.html` (**P-015-12** notes the design's block count is
   cited as four; the convention is unaffected).
7. **Point `notes` at the handoff doc and omit `data` rather than fake it.** `notes/recommendation-track-record-lab.md`
   documents the claim → ledger → resolver → scorer → surface chain, the derived-count rule, and the two routed
   blocks. `tools.json` `data` has no 015 counterpart — the tool's inputs are committed repository artifacts, not
   a config file — so the field is **omitted**, never pointed at a placeholder path that resolves to nothing.
8. **Stay inside the `journeysMaxBytes` budget.** `tool-experience.config.json` sets it to 1 048 576 and the check
   runs at `scripts/validate-tool-experience.mjs#L100`. Two definitions plus two steps must fit; the assertion is
   re-read at execution time rather than assumed from a planning-time measurement.
9. **Assert the flip that makes scope 06's deferral honest.** Scope 06's `T-06-I2` proved the read is **invisible**
   while the tool is absent from the `tools` argument. This scope asserts the same read, unchanged, is now looked
   up by id at `rlbrief.js#L689` and rendered — with its rate, range and count all inside the `read` string, since
   `metrics` is still never rendered. The pair is the evidence that the ordering was a decision, not a gap.
10. **Hold HC-3 by non-participation, and prove it at the moment of maximum risk.** `CENTER_VIEW_IDS` is frozen at
    four (`rlmarketaction.js#L77`) and `RLMKT-VIEW` refuses a fifth at five checkpoints. Registration is the only
    point in the feature where 015 touches a Center-adjacent registry, so UI-35 is asserted **here**: exactly four
    views, the read legible inside the existing Brief view, no fifth view control, and no `RLMKT-VIEW` refusal
    anywhere in the run.
11. **Close the feature with one regression pass.** Every 015 test file (`unit`, `functional`, `integration`,
    `e2e`, `stress`), the `e2e-ui` spec, `node scripts/validate-recommendation-track-record.mjs`,
    `node scripts/validate-tool-experience.mjs` and `node scripts/selftest.mjs` all run green **in one pass**,
    after registration rather than before it. Running them only before registration would leave the seven-surface
    change unproven against the surface it modifies.
12. **Extend `tests/recommendation-track-record.unit.mjs`, `.functional.mjs`, `.integration.mjs` and
    `tests/recommendation-track-record-lab.spec.mjs`** with this scope's named cases, plus registry fixtures under
    `tests/fixtures/recommendation-track-record/registry/**` carrying a deliberately **partial** registration
    (tools-only, journey-orphan, step-orphan, `noExecution: false`) so each cross-registry invariant is proven to
    bite. Existing files are extended, never rewritten.

---

## Test Plan

Every count assertion below is computed from a **freshly re-read** registry at execution time plus 015's declared
delta; no row carries a repo total as a literal. `T-10-I1` is the row that proves serialisation is necessary — it
asserts a partial registration **fails**, so "register the easy files first and finish later" is not a reachable
state.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-10-U1 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | The `tools.json` entry carries the required key set plus a `tool-experience/v1` `experience` block (`kind: "ordinary"`, `viewSetId: "ordinary-four-view/v1"`, `viewIds: ["simple","power","brief","journey"]`) and a `briefing` block with `role: "source"`; the tool id is unique across the registry per `requireUnique` (`scripts/validate-tool-experience.mjs#L128`). | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-10-u1` |
| T-10-U2 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | 015 owns **exactly one** `simple-models.json` definition and `sameValues(toolIds, modelToolIds)` (`#L140`) holds. The adversarial half registers in `tools.json` **without** the definition and asserts the check fails with *"each registry tool must own exactly one simple-model definition"* — the surface `spec.md` → FR-019 omits entirely (P-015-04). | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-10-u2` |
| T-10-U3 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | 015 contributes **exactly two** journey definitions with their matching `steps[]`, both carrying `noExecution: true`; `sameValues(journeyDefinitionIds, referencedJourneyIds)` (`#L141`) and `sameValues(journeyStepIds, referencedStepIds)` (`#L142`) both hold; and a definition flipped to `noExecution: false` is rejected as `E012-JOURNEY-DEFINITION`, which is HC-9 holding inside the journey registry. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-10-u3` |
| T-10-F1 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | The four literal assertions at `#L493`–`#L496` are each set to the value **recomputed from the then-current registries at execution time** plus 015's delta (`+1` ordinary tool, `+0` Center goals, `+2` total goals, `+2` definitions). The adversarial half leaves one literal stale and asserts that assertion fails, so a forgotten bump cannot ship. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-10-f1` |
| T-10-F2 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | The per-row rule holds after registration: the Center still references **exactly four** goals (`#L499`) and **every** ordinary tool including 015 references **at least two** (`#L501`). The adversarial half registers 015 with a single goal and asserts `#L501` fails. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-10-f2` |
| T-10-F3 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | 015 is **appended** in both mirrors — added after the `rlnav.js` literal array (`#L45`) via the `TOOLS.push(…)` convention rather than edited into it, and appended last in `index.html` — and the entry count re-read from each mirror equals the count re-read from `tools.json`. Editing the literal array is asserted to break the mirror for the previously-pushed entries. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-10-f3` |
| T-10-F4 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | `notes/recommendation-track-record-lab.md` exists and `tools.json` `notes` resolves to it; the `data` field is **absent** rather than set to a placeholder path, asserted by proving no `data` value is present that fails to resolve to a committed file. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-10-f4` |
| T-10-F5 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | The `journeysMaxBytes` budget (`tool-experience.config.json`, checked at `#L100`) is still satisfied after the two new definitions and two new steps, measured against the **then-current** registry size rather than a planning-time figure. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-10-f5` |
| T-10-F6 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | **The flip that makes scope 06's deferral honest.** The same published read that `T-06-I2` proved invisible is now looked up by id at `rlbrief.js#L689` and lands in the `available` bucket; its rendered text carries the rate **with** its range and count, because `metrics` is still never rendered. Reverting the `tools.json` entry restores the invisible case, so the pair brackets the behaviour. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-10-f6` |
| T-10-I1 | Integration | `integration` | — | `tests/recommendation-track-record.integration.mjs` | **Registration is one packet.** `node scripts/validate-tool-experience.mjs` is green against the fully-registered registries; and four **partial** registrations — tools-only, journey-orphan, step-orphan, and a `simple-models.json` omission — each fail with their own named message, proving serialisation is required rather than merely tidy. | `node scripts/validate-tool-experience.mjs` | No | `report.md#t-10-i1` |
| T-10-I2 | Integration | `integration` | — | `tests/recommendation-track-record.integration.mjs` | **Regression closure.** The whole 015 surface runs green **in one pass after registration**: every `node --test` file, the Playwright spec, `node scripts/validate-recommendation-track-record.mjs` and `node scripts/validate-tool-experience.mjs`. Running the suite only before the seven-surface change would leave that change unproven. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-10-i2` |
| T-10-E1 | E2E UI | `e2e-ui` | UI-35 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-35:** with 015 registered, the Market Action Center shows **exactly four** views, the track-record read is legible inside the **existing Brief view** with its rate, range and count in the same string, **no** fifth view control exists, and **no** `RLMKT-VIEW` refusal occurs anywhere in the run; `CENTER_VIEW_IDS` still has four members (`rlmarketaction.js#L77`) and `rlmarketaction.js` is byte-unmodified. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-10-e1` |
| T-10-R1 | Regression E2E | `e2e-ui` | UI-35 | `tests/recommendation-track-record-lab.spec.mjs` | **Persistent scenario regression for the registered surface.** A standing browser pass re-asserts, after the seven-surface registration, that the Center still composes **exactly four** views with no fifth view control and no `RLMKT-VIEW` refusal anywhere in the run, that the track-record read is still looked up by id and legible inside the existing Brief view with its rate, range and count in one string, and that every other registered tool's read still renders alongside it. Unlike `T-10-E1`, which proves the registration flip once, this row is the standing guard that a later registry change — by 015 or by a concurrent spec — cannot silently un-register 015 or push the Center to a fifth view. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-10-r1` |
| T-10-R2 | Regression E2E | `e2e-ui` | UI-35 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite — the closure row.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green **after** registration, with no pre-existing test removed, skipped, or newly failing. Because registration mutates seven shared surfaces including the `index.html` and `rlnav.js` mirrors and the journey registry, this is the row that proves the whole repo's browser and node surface survived the change — running the suite only before the seven-surface change would leave exactly that change unproven. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-10-r2` |
| T-10-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after registration, the notes doc, the registry fixtures and the test cases land, at `baseline + N passed, 0 failed`, where `baseline` is the total captured immediately before this scope's first change and recorded in `report.md`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-10-s1` |

**Test Plan rows: 15.** UI rows covered: UI-35 — **1 of 1 owned row**, none deferred.

---

### Definition of Done

#### Core items

- [ ] All seven registration surfaces are mutated in **one** change: `tools.json` (entry + `experience` + `briefing`), `simple-models.json`, `journeys.json` (`definitions[]` + `steps[]`), `index.html` `TOOLS`, `rlnav.js` `TOOLS`, `scripts/validate-tool-experience.mjs` (the four literals) and `notes/recommendation-track-record-lab.md`.
- [ ] The `tools.json` `experience` block is `tool-experience/v1` with `kind: "ordinary"`, `viewSetId: "ordinary-four-view/v1"` and `viewIds: ["simple","power","brief","journey"]`; the `briefing` block carries `role: "source"`.
- [ ] 015 owns **exactly one** `simple-models.json` definition, so `sameValues(toolIds, modelToolIds)` (`#L140`) holds; registering without it is proven to fail.
- [ ] 015 contributes **exactly two** journey goals with their matching `steps[]`; both carry `noExecution: true`, and a `noExecution: false` definition is proven to be rejected as `E012-JOURNEY-DEFINITION` (HC-9).
- [ ] The four literal count assertions at `#L493`–`#L496` are bumped **in the same change** to values recomputed from the **then-current** registries plus 015's delta; **no repo total recorded during planning is used as an expected value** (HC-4).
- [ ] The per-row rule still holds after registration: the Center references exactly four goals (`#L499`) and every ordinary tool references at least two (`#L501`).
- [ ] 015 is **appended** in both mirrors — via the `TOOLS.push(…)` convention after the `rlnav.js` literal array (`#L45`) and last in `index.html` — and the literal array is not edited.
- [ ] `notes/recommendation-track-record-lab.md` exists, `tools.json` `notes` resolves to it, and `data` is **omitted** rather than pointed at a placeholder.
- [ ] The `journeysMaxBytes` budget is still satisfied, measured against the then-current registry size.
- [ ] `node scripts/validate-tool-experience.mjs` is green against the fully-registered registries, and each of the four partial registrations is proven to fail with its own named message.
- [ ] The read scope 06 published — unchanged — is now looked up by id at `rlbrief.js#L689` and rendered, with its rate, range and count all inside the `read` string because `metrics` is still never rendered.
- [ ] **UI-35 holds:** the Center composes exactly four views, the read is legible inside the existing Brief view, no fifth view control exists, and no `RLMKT-VIEW` refusal occurs; `rlmarketaction.js` is byte-unmodified and `CENTER_VIEW_IDS` still has four members.
- [ ] **Routed finding P-015-04 is recorded.** `spec.md` → FR-019 names four surfaces; the real cross-asserted packet is larger. This scope registers against the complete `design.md` → `## D6` surface and records the routed decision in `report.md`; `spec.md` is not edited.
- [ ] **Routed finding P-015-12 is recorded.** `design.md` → `## D6` cites four `TOOLS.push(…)` blocks where three call sites are present; the append **convention** is followed regardless and the count is re-read rather than asserted from the design's figure.
- [ ] The full 015 test surface plus both committed validators run green **in one pass after registration**, not only before it.
- [ ] No product behaviour is changed by this scope: no page markup, no model, no statistic, no contract, no refusal code. It is registration, documentation and closure only.

#### Test items

- [ ] T-10-U1 passes: the `tools.json` entry, `experience` and `briefing` blocks are well-formed and the id is unique → evidence recorded in `report.md#t-10-u1`.
- [ ] T-10-U2 passes: exactly one simple-model definition exists and omitting it fails `sameValues(toolIds, modelToolIds)` → evidence recorded in `report.md#t-10-u2`.
- [ ] T-10-U3 passes: exactly two journey goals with matching steps, both `noExecution: true`, and `noExecution: false` is rejected → evidence recorded in `report.md#t-10-u3`.
- [ ] T-10-F1 passes: all four literals are recomputed-and-bumped and a stale literal is proven to fail → evidence recorded in `report.md#t-10-f1`.
- [ ] T-10-F2 passes: the Center keeps exactly four goals and every ordinary tool keeps at least two → evidence recorded in `report.md#t-10-f2`.
- [ ] T-10-F3 passes: both mirrors are appended, not edited, and their re-read counts agree with `tools.json` → evidence recorded in `report.md#t-10-f3`.
- [ ] T-10-F4 passes: the notes doc exists and resolves, and `data` is absent rather than a placeholder → evidence recorded in `report.md#t-10-f4`.
- [ ] T-10-F5 passes: the `journeysMaxBytes` budget still holds against the then-current registry size → evidence recorded in `report.md#t-10-f5`.
- [ ] T-10-F6 passes: the previously-invisible read is now looked up and rendered with HC-8 met inside `read` → evidence recorded in `report.md#t-10-f6`.
- [ ] T-10-I1 passes: `node scripts/validate-tool-experience.mjs` is green and all four partial registrations fail → evidence recorded in `report.md#t-10-i1`.
- [ ] T-10-I2 passes: the whole 015 surface plus both validators are green in one pass after registration → evidence recorded in `report.md#t-10-i2`.
- [ ] T-10-E1 passes: UI-35 — four views, read legible in the Brief view, no fifth view control, no `RLMKT-VIEW` refusal → evidence recorded in `report.md#t-10-e1`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-10-R1] the four-view Center with no fifth control and no `RLMKT-VIEW` refusal, the by-id lookup of the track-record read inside the existing Brief view, and every other registered tool's read still rendering all re-assert as a standing guard → evidence recorded in `report.md#t-10-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-10-R2] the committed Node E2E files and the whole committed Playwright spec suite are green **after** registration, proving the seven-surface change left the whole repo's browser and node surface intact → evidence recorded in `report.md#t-10-r2`.
- [ ] T-10-S1 passes: `node scripts/selftest.mjs` reports `baseline + N passed, 0 failed` against the scope-start baseline captured in `report.md`, with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-10-s1`.

**Test-related DoD items: 15. Test Plan rows: 15. Parity confirmed.**

**T-10-F6 and scope 06's `T-06-I2` are a deliberate pair.** One proves the read is invisible while unregistered;
the other proves the same read becomes visible when registered. Neither alone would show that the deferred
ordering recorded in F-015-D6-01 was a decision rather than an oversight.

#### Build Quality Gate

- [ ] Zero warnings across `node --test`, the Playwright run, `node scripts/validate-recommendation-track-record.mjs`, `node scripts/validate-tool-experience.mjs` and `node scripts/selftest.mjs`; zero console errors in the Center or on the 015 page; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `rlmarketaction.js`, `rlbrief.js`, `rldata.js`, `rlvalidation.js`, `rlcontracts.js`, `rlg.js`, `rlchart.js`, `rlcontext.js`, `rlticker.js`, `rlapp.js` byte-unmodified; `rlnav.js` modified **only** by an appended `TOOLS` entry; `scripts/validate-tool-experience.mjs` modified **only** by the four literal count assertions; `spec.md`, `design.md` and `scopes/_index.md` unmodified by this scope; no other scope directory and no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlvalidation.js` | **Feature 007-owned, consume-only.** This scope computes no statistic and displays none. Registration changes no number. |
| `rlcontracts.js` reducer and `CLOSE_EVENT_TYPES` | **Feature 002-owned, consume-only.** No closure is emitted, the reducer is never forked, and the closure vocabulary is never extended. Registration touches no lifecycle surface. |
| The persisted `rldata.js` cache schema | **Feature 013-protected (FR-021, AC-012).** This scope writes nothing to the cache. It changes only whether the **existing** `d.toolReads[id]` slot scope 06 already populates is looked up by the Center's renderer. |
| The Market Action Center four-view composition | **Feature 012-owned (`RLMKT-VIEW`).** This is the scope with the most opportunity to breach HC-3 and it does not: no Center `viewOrder`, `views` or `viewState` write, no view-id declaration, no fifth view control. `CENTER_VIEW_IDS` stays frozen at four and `rlmarketaction.js` stays byte-unmodified. |
| `rlbrief.js` `renderToolReads` | **Feature 012-owned, consume-only.** The renderer is **driven** to prove the by-id lookup now succeeds; it is never modified. FR-015 on the Center row is satisfied by the renderer's existing `data-tkr-auto`, with no change to Center code. |
| `recommendation-track-record-lab.html`, `compute()`, `renderSimple`, `renderPower`, the adapter | Scopes 07 and 08. Registration changes no markup, no panel, no lever and no chart. If the page needs a change to register cleanly, that is a routed packet to the owning scope, never an edit made here. |
| `scripts/validate-recommendation-track-record.mjs` | Scope 09. This scope **runs** the validator as a closure gate; it does not add, remove, or weaken a code. A validator failure surfaced here is fixed in the owning scope. |
| `scripts/brief-resolve-outcomes.mjs`, the scope-05 model, `buildOwnerRead` / `buildMetrics` | Scopes 04, 05 and 06. The read published here is scope 06's, unchanged — not re-authored, not re-templated, not extended with a field. |
| `briefs/objects/**`, `briefs/history/**`, `data/bars/**`, `data/calendars/**` | Committed read-only substrate. Registration appends no ledger row and writes no committed artifact. |
| `scripts/validate-tool-experience.mjs` **beyond** the four literal count assertions | The validator's logic, its `E012-*` register, its cross-registry invariants and its budget check are Feature 012-owned. Only the four literals at `#L493`–`#L496` move, and only because adding a tool is exactly what they are written to notice. Loosening an invariant to make registration pass would defeat the check that protects every other tool. |
| `simple-models.json` definitions belonging to other tools | Only 015's own definition is added. No other tool's definition, fingerprint, or adapter binding is touched. |
| `journeys.json` definitions and steps belonging to other tools | Only 015's own two definitions and their steps are added. No existing goal is re-pointed, renumbered, or removed to make room. |
| Any other `scopes/NN-*/` directory in this feature | Each scope owns its own directory. This scope writes only `scopes/10-registration-notes-and-regression-closure/`. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. Their registrations may land between planning and execution, which is exactly why every count here is re-read rather than recorded. |

---

*Educational research context only — not investment advice.*
