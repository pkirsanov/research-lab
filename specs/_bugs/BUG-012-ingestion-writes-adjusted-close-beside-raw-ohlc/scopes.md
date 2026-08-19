# Scopes: BUG-012 — Coherent Bars, A Pinned Fixture, And A Failure That Can Speak

**Nothing in this file is implemented.** The packet was filed under an instruction to document and
not fix. Every Definition of Done item below is unticked because none has been done, and the remedy
for Scope 01 depends on a contract decision recorded as open in `design.md` §2.

Scope order is causal, not arbitrary. Scope 01 removes the defect. Scope 02 stops an unrelated
scheduled job from reintroducing a red. Scope 03 makes the next data break legible instead of
invisible. Scope 03 is independent of the other two and would have paid for itself already: it is
what turns a debugging session into a glance.

## Scope 1: 01-restore-ohlc-coherence-in-bars-ingestion

**Status:** [ ] Not Started
**Depends On:** none
**Owner:** unassigned — routing deferred with the contract decision in `design.md` §2

### Change Boundary

| Allowed | Forbidden |
|---|---|
| `scripts/fetch-bars.mjs` — the price-basis contract chosen per `design.md` §2 | `rlagenda.js` refusal rules, error codes, and field names (INV-012B-4) |
| A one-time coherence repair of existing rows under `data/bars/` | `playwright.config.mjs` — no global `timeout`, no `retries` |
| A committed coherence guard wired into `node scripts/selftest.mjs` | `tests/fixtures/research-agenda/reversal-ui.json` (Scope 02 owns it) |
| This packet's own artifacts | `research-agenda-lab.html` (Scope 03 owns the error path) |
| — | The `BUG-011` packet and its delivered change |

### Gherkin Scenarios

```gherkin
Feature: BUG-012 Bars ingestion emits coherent rows

  Scenario: SCN-012B-001 A written row cannot claim a low above its own close
    Given fetch-bars trimBars line 152 takes c from the adjusted-close series
    And line 155 takes o, h and l from the raw quote series
    When bars are ingested for any symbol
    Then every emitted row satisfies l <= min(o, c) and h >= max(o, c) and l <= h
    And no emitted row can violate those relations under any adjustment factor

  Scenario: SCN-012B-002 One row carries one price basis
    Given dividend adjustment scales historical prices downward
    When a row is written
    Then o, h, l and c are all raw or all adjusted on the same basis
    And an adjusted close never displaces c beside a raw low

  Scenario: SCN-012B-003 The existing corpus is repaired, not only future writes
    Given 245 of 293 files under data/bars carry at least one incoherent row
    And 71714 of 150161 rows satisfy l > min(o, c)
    When the corpus is scanned after the fix
    Then zero rows violate OHLC coherence
    And the COP row at 2026-08-13T13:30Z is coherent

  Scenario: SCN-012B-004 The validator is not weakened to accept bad bars
    Given rlagenda.js line 1718 refuses a bar whose low exceeds both open and close
    When the committed diff is reviewed
    Then that condition is byte-identical
    And the RLAGENDA-MODEL-INVALID code and currentBars field naming are unchanged
```

### Implementation Plan

1. Record the chosen price-basis contract — Option A or Option B from `design.md` §2 — in this
   packet, with the reason it was chosen over the other.
2. Apply it in `scripts/fetch-bars.mjs` so the four price fields of a written row share one basis.
3. Repair the existing corpus under `data/bars/` to the same contract, including the COP row the
   reversal fixture pins.
4. Add a coherence guard that fails on any row with `l > min(o, c)`, `h < max(o, c)` or `l > h`, and
   wire it into `node scripts/selftest.mjs` so the corpus cannot silently regress.
5. Change nothing in `rlagenda.js`.

### Test Plan

| Test Type | Category | File / Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Corpus coherence guard | `unit` | new guard under `scripts/` | Zero rows across all 293 bars files violate OHLC coherence | `node scripts/selftest.mjs` | No |
| Writer unit, adversarial | `unit` | `scripts/fetch-bars.mjs` coverage | A vendor payload whose adjusted close sits below the raw low cannot produce an incoherent row | `node scripts/selftest.mjs` | No |
| Validator invariance | `unit` | committed diff | `rlagenda.js` refusal condition, code, and field naming unchanged | `git --no-pager diff -- rlagenda.js` | No |
| Reversal regression | `e2e-ui` | `tests/tool-experience.spec.mjs`, `tests/contextual-tooltip.spec.mjs` | The six affected tests pass with the data corrected | `npx --no-install playwright test tests/tool-experience.spec.mjs tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Repository selftest | `unit` | `scripts/selftest.mjs` | No repository invariant broken, no assertion count reduction | `node scripts/selftest.mjs` | No |

**Adversarial note.** The decisive case is a vendor payload where the adjusted close falls **below**
the raw low — the exact condition COP hit. A writer test built only from payloads whose adjustment is
negligible would pass both before and after the change and prove nothing. The corpus guard is
likewise adversarial only if it is run against the **real** `data/bars/` corpus, where 71,714 rows
currently violate it; run against a synthetic clean sample it is tautological.

### Definition of Done — 3-Part Validation

- [ ] The chosen price-basis contract is recorded in this packet with the reason it was preferred over the alternative in `design.md` §2
- [ ] `scripts/fetch-bars.mjs` cannot emit a row violating `l <= min(o, c)`, `h >= max(o, c)`, `l <= h`, proven by an adversarial payload whose adjusted close falls below the raw low
- [ ] A scan of all 293 files under `data/bars/` reports zero incoherent rows, down from the reported 71,714
- [ ] The COP row at `2026-08-13T13:30Z` is coherent, and the reversal fixture's canonical replay returns `ok=true`
- [ ] A committed coherence guard fails on an incoherent row and runs inside `node scripts/selftest.mjs`
- [ ] `rlagenda.js` is unchanged: the line 1718 condition, the `RLAGENDA-MODEL-INVALID` code, and the `currentBars.<sym>` field naming are byte-identical
- [ ] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count
- [ ] Build Quality Gate: artifact lint passes, no absolute host path appears in any packet artifact, and no issue found during this scope was deferred

## Scope 2: 02-decouple-committed-fixture-from-mutable-bars

**Status:** [ ] Not Started
**Depends On:** 01
**Owner:** unassigned

### Change Boundary

| Allowed | Forbidden |
|---|---|
| `tests/fixtures/research-agenda/reversal-ui.json` and any committed input it gains | `scripts/fetch-bars.mjs` (Scope 01 owns it) |
| The fixture bar loader in `research-agenda-lab.html` if the chosen shape requires it | Any change to the six tests' assertions |
| This packet's own artifacts | `playwright.config.mjs` |
| — | Moving `attemptedAt` to skip the corrupted row — prohibited by `design.md` §5 |

### Gherkin Scenarios

```gherkin
Feature: BUG-012 A committed fixture yields a committed result

  Scenario: SCN-012B-005 A scheduled data refresh cannot turn a committed test red
    Given the reversal fixture pins attemptedAt at 2026-08-14T12:00:00.000Z
    And loadFixtureBars resolves that cutoff against mutable data/bars files
    When a scheduled refresh rewrites a row at or before that cutoff
    Then the outcome of the committed test is unchanged
    And any change to the fixture's resolved inputs requires a reviewed commit

  Scenario: SCN-012B-006 Drift is reported, never discovered by timeout
    Given the fixture may continue to read shared corpus data
    When the data behind the pinned cutoff no longer matches the fixture's expectation
    Then the test fails with a message naming the fixture, the symbol and the row
    And it does not hang
```

### Implementation Plan

1. Choose between the two shapes in `design.md` §3 — pin the fixture's bar inputs, or keep the shared
   read and add an explicit drift expectation — and record the choice.
2. Apply it so the fixture's resolved inputs are either committed or explicitly checked.
3. Leave every assertion in the six affected tests unchanged.

### Test Plan

| Test Type | Category | File / Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Fixture reproducibility | `unit` | fixture + loader | The fixture's resolved inputs are committed, or a drift expectation exists | `node scripts/selftest.mjs` | No |
| Drift, adversarial | `unit` | fixture drift check | A deliberately mutated bars row makes the check fail with a named message rather than hang | `node scripts/selftest.mjs` | No |
| Reversal regression | `e2e-ui` | the two affected spec files | The six tests pass and remain assertion-identical | `npx --no-install playwright test tests/tool-experience.spec.mjs tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

**Adversarial note.** The reproducibility item is only meaningful if the drift case is exercised by
**mutating a bars row on purpose** and observing a named failure. Asserting that the fixture passes
against today's corrected corpus proves reproducibility no more than the pre-cron green run did — it
was green for months before `643d74bfd` arrived.

### Definition of Done — 3-Part Validation

- [ ] The chosen decoupling shape is recorded in this packet with the reason it was preferred over the alternative in `design.md` §3
- [ ] The fixture's resolved inputs cannot change without a reviewed commit to the test surface
- [ ] A deliberate mutation of a bars row produces a failure naming fixture, symbol and row, and produces no hang, proven by executing that mutation
- [ ] `tests/fixtures/research-agenda/reversal-ui.json` `attemptedAt` is unchanged — the cutoff was not moved to skip the corrupted row
- [ ] Every assertion in the six affected tests is byte-identical
- [ ] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count
- [ ] Build Quality Gate: artifact lint passes, no absolute host path appears in any packet artifact, and no issue found during this scope was deferred

## Scope 3: 03-surface-boot-failure-instead-of-hanging

**Status:** [ ] Not Started
**Depends On:** none
**Owner:** unassigned

### Change Boundary

| Allowed | Forbidden |
|---|---|
| The `.catch` at `research-agenda-lab.html` lines 1059-1062 and the `__researchAgendaDebug` surface | Any change to `getViewState()`'s value on a successful boot (INV-012B-9) |
| A regression test asserting the failure is observable | `scripts/fetch-bars.mjs`, `data/bars/**` |
| This packet's own artifacts | `playwright.config.mjs` — no global `timeout`, no `retries` |
| — | `rlagenda.js` |

### Gherkin Scenarios

```gherkin
Feature: BUG-012 A boot failure reports itself instead of hanging

  Scenario: SCN-012B-007 A failed reversal boot resolves the readiness observer
    Given the catch at research-agenda-lab.html lines 1059-1062 writes two DOM strings
    And it never assigns state.view
    And getViewState returns null while state.view is unset
    When the reversal boot path throws
    Then getViewState returns a non-null value marking the state as failed
    And a caller waiting on readiness stops waiting

  Scenario: SCN-012B-008 The reason the page already computed reaches the observer
    Given the page computes fixture canonical model failed RLAGENDA-MODEL-INVALID
    And it writes that text into currentReason
    When a caller reads the debug surface after a failed boot
    Then the same refusal reason is retrievable there
    And it is not available only as DOM text

  Scenario: SCN-012B-009 The successful path is untouched
    Given three tests boot the agenda without the reversal fixture and pass today
    When the error path change is applied
    Then every value getViewState returns on a successful boot is unchanged
    And those three tests remain passing without modification
```

### Implementation Plan

1. Have the boot `.catch` record a failed state that `__researchAgendaDebug` can expose, carrying the
   refusal reason it already computes.
2. Leave the successful path's `state.view` shape and `getViewState()` return value untouched.
3. Add a regression test that drives a failing reversal boot and asserts the observer resolves with
   the reason, rather than waiting.

### Test Plan

| Test Type | Category | File / Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Failed-boot observability, adversarial | `e2e-ui` | new regression in `tests/tool-experience.spec.mjs` | A deliberately broken reversal input resolves the observer with the refusal reason and does not hang | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Success-path invariance | `e2e-ui` | the three non-fixture agenda tests at lines 364, 458, 713 | Successful boots are unchanged | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Bounded failure | `e2e-ui` | the new regression | The failing boot reports within the test's own budget, with no CLI timeout override | same as above | Yes |
| Repository selftest | `unit` | `scripts/selftest.mjs` | No repository invariant broken | `node scripts/selftest.mjs` | No |

**Adversarial note.** This scope's regression must be driven by an **input that actually fails**, not
by the corrected corpus. After Scope 01 lands, the reversal boot succeeds, so a test that merely boots
it exercises none of the error path. The regression must inject a failing input deliberately — that
is the only form in which it would fail if the `.catch` regressed to leaving `state.view` unset.

### Definition of Done — 3-Part Validation

- [ ] A failed reversal boot causes `getViewState()` to return a non-null value marking the failure, proven by a deliberately injected failing input
- [ ] The refusal reason the page computes is retrievable through `__researchAgendaDebug` and not only as DOM text
- [ ] The failing boot reports within the test's own budget, with no CLI timeout override and no global `timeout` in `playwright.config.mjs`
- [ ] Every value `getViewState()` returns on a successful boot is unchanged, and the three non-fixture agenda tests pass unmodified
- [ ] The new regression fails if the `.catch` is reverted to leaving `state.view` unset, proven by executing that reversion
- [ ] `rlagenda.js` and `scripts/fetch-bars.mjs` are unchanged by this scope
- [ ] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count
- [ ] Build Quality Gate: artifact lint passes, no absolute host path appears in any packet artifact, and no issue found during this scope was deferred

## Cross-Scope Definition of Done

- [ ] All six tests pass — `tests/tool-experience.spec.mjs` lines 442, 485, 566, 605, 639 and `tests/contextual-tooltip.spec.mjs` line 115 — in the full committed suite
- [ ] The fix introduces no `retries`, no `.skip`/`.fixme`, no deleted or weakened assertion, and no global `timeout` in `playwright.config.mjs`
- [ ] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh` on this packet exits 0

```gherkin
Feature: BUG-012 The red is removed by correcting data, never by waiting longer

  Scenario: SCN-012B-010 No shortcut turns the red green
    Given a 240000 ms budget was applied and the same six tests still failed
    And the awaited condition is unreachable rather than slow
    When the committed diff is reviewed
    Then playwright.config.mjs declares no global timeout and no retries
    And no test is marked skip or fixme
    And no assertion is deleted or weakened

  Scenario: SCN-012B-011 The suite still tests everything it tested before
    Given node scripts/selftest.mjs reported 2490 passed and 0 failed before the fix
    When the selftest is run after the fix
    Then it reports 0 failed
    And the assertion count is not below the pre-fix count
```
