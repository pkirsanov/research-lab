# Scope 3: Per-Generation Review Policy

## 03-per-generation-review-policy

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** offline, determinism, budget, named-deferral, closed-vocabulary
Depends On: Scope 1 — the cadence and trigger fields · Scope 2 — the ledger that records the last review

**Primary Outcome:** `selectReviewPlan(registry, ledgerState, evidence, nowIso)`
decides, entirely offline from committed state, which topics are researched this
generation. Every `active` topic is evaluated every generation. A topic inside its
cadence is not due and keeps its most recent dossier. An elapsed cadence makes a
topic due. A declared material-change trigger, drawn from a closed four-kind
vocabulary whose every operand resolves from a committed artifact, makes a topic
due early and names itself in the published record. The number researched is
bounded by the declared `reviewBudget`, selection follows one declared
deterministic order, and every topic that does not fit publishes a named
`deferred` outcome with its reason. Nothing is silently dropped, and nothing here
needs the network.

## Requirement Coverage

- FR-019-016 — every generation evaluates every `active` topic for dueness;
  skipping the evaluation is not permitted even when nothing is due.
- FR-019-017 — a topic is due when its declared cadence has elapsed since its last
  recorded review.
- FR-019-018 — a topic may declare a material-change trigger expressed against
  evidence already available to the generation; a fired trigger makes the topic
  due regardless of cadence.
- FR-019-019 — when a trigger makes a topic due, the published record names the
  trigger.
- FR-019-020 — the number of topics researched in one generation is bounded by the
  explicit declared budget.
- FR-019-021 — over budget, selection follows a declared deterministic order and
  every deferred topic publishes a named deferred outcome with its reason; silent
  dropping is forbidden.
- FR-019-022 — the review policy requires no network access to decide dueness.
- FR-019-023 — a topic that is not due is not researched and its most recent
  dossier remains the current one.
- NFR-019-001 — the dueness decision is computable offline from committed state.
- NFR-019-002 — the agenda's contribution to publication time is bounded by the
  review budget, not by the number of declared topics.
- NFR-019-004 — the offline guard and the budget guard each carry an adversarial
  case that fails when the guard is removed.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-008 Cadence prevents pointless work
  Given a topic reviewed one generation ago with a weekly cadence
  And no material-change trigger has fired
  When the generation reviews the agenda
  Then the topic is not due
  And its most recent dossier remains the current one
  And the published outcome is unchanged rather than updated

Scenario: SCN-019-009 Time makes a topic due
  Given a topic whose declared cadence has elapsed since its last review
  When the generation reviews the agenda
  Then the topic is due
  And it is queued for research this generation

Scenario: SCN-019-010 A material change overrides the cadence
  Given a topic declaring a material-change trigger
  And the trigger's condition is observable in this generation's committed evidence
  When the generation reviews the agenda
  Then the topic is due even though its cadence has not elapsed
  And the published record names the trigger that made it due

Scenario: SCN-019-011 More due topics than the budget allows
  Given more topics are due than the declared per-generation review budget
  When the generation selects topics to research
  Then it researches up to the budget in a declared deterministic order
  And every deferred topic is published with a named deferred outcome and its reason
  And no deferred topic is silently dropped
```

## Implementation Files

### New

- `tests/fixtures/research-agenda/plan-inside-cadence.json`
- `tests/fixtures/research-agenda/plan-cadence-elapsed.json`
- `tests/fixtures/research-agenda/plan-trigger-armed.json`
- `tests/fixtures/research-agenda/plan-over-budget.json`
- `tests/fixtures/research-agenda/evidence-snapshot.json` — the committed evidence
  bundle the four trigger evaluators read

### Modified

- `rlagenda.js` — `isDue`, `selectReviewPlan`, `TRIGGER_EVALUATORS`
- `scripts/selftest.mjs` — one new assertion group
- `notes/research-agenda-lab.md` — the review policy, the trigger table and the
  selection order

## Implementation Plan

1. Implement `isDue(topic, ledgerState, evidence, nowIso)` as a top-level
   `function` declaration returning `{ due, because }`. `nowIso` is a parameter,
   so no wall clock is read inside the rule and the same inputs always give the
   same verdict.
2. Order the branches so intent is unambiguous: never reviewed is due; a fired
   trigger is due with the trigger's own `because`; an elapsed cadence is due with
   a cadence `because`; otherwise not due. A `paused` or `retired` topic never
   reaches the dueness branches at all — its outcome comes from
   `lifecycleOutcome` in scope 2.
3. Freeze `TRIGGER_EVALUATORS` as a map from `kind` to a pure
   `(trigger, evidence) => { fired, because }` function, with exactly four
   entries and no open plugin surface. An unknown `kind`, or an operand no
   committed artifact can resolve, is `RLAGENDA-TRIGGER`.
4. Bind each evaluator to a committed source and to nothing else:
   `snapshot-name-move` reads `names[ticker]` from `market-brief.snapshot.json`;
   `regime-band-change` and `vix-level` read the `regimeBand` and `vix` members of
   the committed `brief-history.recent.jsonl` rows; `macro-event-within-days`
   reads `macroEvents[]` from `market-brief.config.json`. All four are files the
   generation already holds, which is what makes FR-019-018 compatible with
   NFR-019-001.
5. Implement `selectReviewPlan` returning `{ selected, deferred, notDue, paused,
   retired, refusals }`. Assert inside the function that the six arrays partition
   the declared topics exactly once each, so a topic cannot be counted twice or
   fall out of every bucket.
6. Sort the due set by the single declared order — trigger-fired first, then
   least-recently-reviewed, then declaration order, then `topicId` — and take at
   most `reviewBudget`. `topicId` is the final tiebreak precisely because it is
   total: without it the order would be underdetermined whenever two topics tie on
   the first three keys, and a plan that is only usually deterministic is not
   deterministic.
7. Give every unplaced due topic `outcome: "deferred"`, `reviewed: false` and a
   `deferredBecause` naming the budget and its position in line. Never drop one.
8. Publish `selectionOrder` verbatim in the plan, so the order the reader is told
   about and the order the code applied are the same string rather than two
   descriptions that can drift.
9. Register a `research-agenda — offline review policy` group in
   `scripts/selftest.mjs` that runs the whole plan with global `fetch` stubbed to
   throw, and that records the set of files the plan opens.
10. Record the policy, the four trigger kinds and the selection order in
    `notes/research-agenda-lab.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `selectReviewPlan` in `rlagenda.js` | The whole selection decision | Scope 4's lane spawn, scope 5's read | High — this function decides what costs tokens and wall clock; a rule that returns everything as due makes the feature's whole cost argument false | Run the plan against the over-budget fixture and assert `selected.length === reviewBudget` BEFORE any lane is wired in scope 4 | Remove the function; scope 4 has not consumed it yet |
| `TRIGGER_EVALUATORS` (frozen map) | Created with exactly four entries | Every future trigger kind | Medium — an open surface here would let a topic declare a trigger the offline plan cannot evaluate, silently reintroducing a network dependency | Assert an unknown `kind` is refused `RLAGENDA-TRIGGER` rather than ignored, and that the map has exactly four keys | Remove the map and the trigger branch of `isDue` |
| The committed evidence sources | Read only — `market-brief.snapshot.json`, `brief-history.recent.jsonl`, `market-brief.config.json` | The trigger evaluators | Medium — a write here would corrupt the brief's own state | Assert all three files are byte-identical after every plan run | They are never written; the diff proves it |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium — a group reading the live snapshot rather than a fixture would flake every generation | Every case drives a committed fixture with an injected `nowIso` | Remove the appended group |

## Change Boundary And Protected Paths

**Allowed:** `rlagenda.js` · `tests/fixtures/research-agenda/*` ·
`scripts/selftest.mjs` · `notes/research-agenda-lab.md`.

**Excluded (must remain byte-identical in this scope):**
`market-brief.snapshot.json` · `brief-history.recent.jsonl` ·
`market-brief.config.json` · `research-agenda.json` ·
`research/agenda/history.jsonl` · `scripts/brief-narrative-parallel.mjs` ·
`scripts/validate-brief-payload.mjs` · `scripts/build-attention-items.mjs` ·
`scripts/build-brief-page-artifacts.mjs` · `scripts/build-pages-site.mjs` ·
`tools.json` · `index.html` · `rlnav.js` · `README.md` · `site-exclusions.json` ·
`tool-experience.config.json` · `rlattention.js` · `rlmarketaction.js` ·
`rlbrief.js` · `market-brief.html` · `market-brief.payload.json` ·
`market-brief.page.json` · `watchlist.json`.

The three evidence sources are on the excluded list for a reason that is not
stylistic: this scope's entire design is that they are read and never written, so
a diff touching any of them is by itself evidence the plan went the wrong way.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Owning module | `rlagenda.js` | Dueness and selection belong to the one owning module. |
| Plan fixtures | `tests/fixtures/research-agenda/*` | The registries, ledgers and evidence bundles the verdicts are proven against. |
| Project test harness | `scripts/selftest.mjs` | Where the offline group lives. |
| Tool notes | `notes/research-agenda-lab.md` | Where the policy and the selection order are recorded. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Committed evidence | `market-brief.snapshot.json`, `brief-history.recent.jsonl`, `market-brief.config.json` | Read-only inputs; owned by the existing brief pipeline |
| Registry and ledger content | `research-agenda.json`, `research/agenda/history.jsonl` | Scopes 1 and 2; this scope reads them |
| Lane, dossier and outcomes | `scripts/brief-narrative-parallel.mjs` | Scope 4 |
| Registration and the published read | `tools.json`, `index.html`, `rlnav.js`, `README.md`, `site-exclusions.json`, `tool-experience.config.json`, `scripts/validate-brief-payload.mjs`, `scripts/build-brief-page-artifacts.mjs`, `scripts/build-pages-site.mjs` | Scope 5 |

## Rollback

Remove `isDue`, `selectReviewPlan` and `TRIGGER_EVALUATORS` from `rlagenda.js`,
delete the five fixtures and remove the appended selftest group. Prove the restore
by running `node scripts/selftest.mjs` and recording exit 0 with unfiltered
output. Nothing downstream is affected, because no lane consumes the plan until
scope 4.

## Scenario-First RED/GREEN Contract

RED: author the four scenarios and the five fixtures first. Record the
inside-cadence fixture returning due before the cadence branch exists — that is
the "review everything every time" cost the policy removes. Record the over-budget
fixture researching four topics with `reviewBudget: 2` before the bound exists,
and record a deferred topic vanishing from the plan entirely before
`deferredBecause` exists — the silent drop FR-019-021 forbids.

GREEN: the inside-cadence fixture is not due with its prior dossier still current;
the elapsed fixture is due and selected; the trigger fixture is due with the
trigger's `because` carried verbatim; the over-budget fixture selects exactly
`reviewBudget` topics in the declared order with every remaining due topic
deferred and named; the six plan arrays partition the declared topics exactly
once; and the whole plan runs with `fetch` stubbed to throw.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Dueness | unit | SCN-019-008 | `scripts/selftest.mjs` | a topic reviewed one generation ago with a weekly cadence and no trigger fired is not due, appears in the plan's `notDue` array, keeps its most recent dossier reference as current, and publishes outcome `unchanged` with `reviewed: false` rather than `updated` | `node scripts/selftest.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Dueness | unit | SCN-019-009 | `scripts/selftest.mjs` | a topic whose declared cadence has elapsed since its last recorded review is due and is queued for research this generation, appearing in the plan's `selected` array with a cadence-elapsed `because` | `node scripts/selftest.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Boundary | unit | SCN-019-009 | `scripts/selftest.mjs` | the cadence edge is enforced from both sides — not due at exactly `reviewCadenceDays` elapsed and due at `reviewCadenceDays + 1` — so the window cannot be widened to infinity while every other case stays green | `node scripts/selftest.mjs` | No | `report.md#tp-03-03` |
| TP-03-04 | Trigger | unit | SCN-019-010 | `scripts/selftest.mjs` | a topic declaring a material-change trigger whose condition is observable in the committed evidence bundle is due even though its cadence has not elapsed, and the published record carries the trigger's own `because` sentence verbatim | `node scripts/selftest.mjs` | No | `report.md#tp-03-04` |
| TP-03-05 | Trigger | unit | SCN-019-010 | `scripts/selftest.mjs` | each of the four trigger kinds fires and does not fire against the committed evidence bundle, every operand resolves from `market-brief.snapshot.json`, `brief-history.recent.jsonl` or `market-brief.config.json`, and an unknown kind is refused `RLAGENDA-TRIGGER` rather than ignored | `node scripts/selftest.mjs` | No | `report.md#tp-03-05` |
| TP-03-06 | Budget | unit | SCN-019-011 | `scripts/selftest.mjs` | with four due topics and `reviewBudget: 2` exactly two topics are selected, in the declared order of trigger-fired first then least-recently-reviewed then declaration order then topicId, and the published `selectionOrder` string matches the order actually applied | `node scripts/selftest.mjs` | No | `report.md#tp-03-06` |
| TP-03-07 | Named deferral | unit | SCN-019-011 | `scripts/selftest.mjs` | every due topic that did not fit the budget is published with outcome `deferred`, `reviewed: false` and a `deferredBecause` naming the full review list and its position in line; no due topic is silently dropped | `node scripts/selftest.mjs` | No | `report.md#tp-03-07` |
| TP-03-08 | Adversarial | unit | SCN-019-011 | `scripts/selftest.mjs` | Regression: the partition assertion proves `selected + deferred + notDue + paused + retired + refusals` covers every declared topic exactly once, and a deliberately mutated planner that omits an unplaced topic is proven to fail it — the silent-drop guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-03-08` |
| TP-03-09 | Adversarial | unit | SCN-019-008 | `scripts/selftest.mjs` | Regression: the whole plan is computed with global `fetch` stubbed to throw and with the recorded opened-file set containing only committed repository paths, so a rule that reached the network would fail rather than pass quietly | `node scripts/selftest.mjs` | No | `report.md#tp-03-09` |
| TP-03-10 | Budget assertion | unit | SCN-019-011 | `scripts/selftest.mjs` | Regression: the count of topics the plan marks for research never exceeds `reviewBudget` for any fixture, including one with twelve declared topics, so the cost is bounded by the budget rather than by the number of declared topics | `node scripts/selftest.mjs` | No | `report.md#tp-03-10` |
| TP-03-11 | Determinism | unit | SCN-019-011 | `scripts/selftest.mjs` | Regression: the same registry, ledger, evidence bundle and injected `nowIso` produce a byte-identical plan across repeated evaluations, including the tie case where two topics share a last-review instant and are separated only by `topicId` | `node scripts/selftest.mjs` | No | `report.md#tp-03-11` |
| TP-03-12 | Coverage | unit | SCN-019-008 | `scripts/selftest.mjs` | every `active` topic in the registry appears in exactly one plan array on every run, including runs where nothing at all is due, so the evaluation is never skipped | `node scripts/selftest.mjs` | No | `report.md#tp-03-12` |

### Definition of Done

- [ ] SCN-019-008 — a topic reviewed one generation ago with a weekly cadence and no trigger fired is not due, its most recent dossier remains the current one, and the published outcome is unchanged rather than updated, proven by TP-03-01.
- [ ] SCN-019-009 — a topic whose declared cadence has elapsed since its last review is due and is queued for research this generation, proven by TP-03-02 and TP-03-03.
- [ ] SCN-019-010 — a topic declaring a material-change trigger observable in this generation's committed evidence is due even though its cadence has not elapsed, and the published record names the trigger that made it due, proven by TP-03-04 and TP-03-05.
- [ ] SCN-019-011 — with more topics due than the budget allows, the generation researches up to the budget in a declared deterministic order, every deferred topic is published with a named deferred outcome and its reason, and no deferred topic is silently dropped, proven by TP-03-06, TP-03-07 and TP-03-08.
- [ ] Every `active` topic is evaluated for dueness on every generation, including generations where nothing is due (FR-019-016), proven by TP-03-12.
- [ ] `TRIGGER_EVALUATORS` is a frozen map with exactly four entries, every operand resolves from a committed artifact, and an unknown kind is refused `RLAGENDA-TRIGGER` (FR-019-018), proven by TP-03-05.
- [ ] The whole dueness and selection decision runs with global `fetch` stubbed to throw and opens only committed repository paths (FR-019-022, NFR-019-001), proven by TP-03-09.
- [ ] The number of topics marked for research never exceeds `reviewBudget`, and the bound holds against a twelve-topic registry so cost scales with the budget rather than the topic count (FR-019-020, NFR-019-002), proven by TP-03-10.
- [ ] The published `selectionOrder` string is the order the code actually applied, and `topicId` is the total final tiebreak, proven by TP-03-06 and TP-03-11.
- [ ] `market-brief.snapshot.json`, `brief-history.recent.jsonl` and `market-brief.config.json` are byte-identical at the end of this scope, verified by `git diff --name-only` naming none of them.
- [ ] `node scripts/selftest.mjs` exits 0 with the offline review-policy group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] TP-03-01 executed with raw output recorded at `report.md#tp-03-01`.
- [ ] TP-03-02 executed with raw output recorded at `report.md#tp-03-02`.
- [ ] TP-03-03 executed with raw output recorded at `report.md#tp-03-03`.
- [ ] TP-03-04 executed with raw output recorded at `report.md#tp-03-04`.
- [ ] TP-03-05 executed with raw output recorded at `report.md#tp-03-05`.
- [ ] TP-03-06 executed with raw output recorded at `report.md#tp-03-06`.
- [ ] TP-03-07 executed with raw output recorded at `report.md#tp-03-07`.
- [ ] TP-03-08 executed with raw output recorded at `report.md#tp-03-08`.
- [ ] TP-03-09 executed with raw output recorded at `report.md#tp-03-09`.
- [ ] TP-03-10 executed with raw output recorded at `report.md#tp-03-10`.
- [ ] TP-03-11 executed with raw output recorded at `report.md#tp-03-11`.
- [ ] TP-03-12 executed with raw output recorded at `report.md#tp-03-12`.
