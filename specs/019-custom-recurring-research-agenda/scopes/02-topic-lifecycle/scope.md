# Scope 2: Topic Lifecycle And Append-Only Ledger

## 02-topic-lifecycle

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** lifecycle, append-only, ledger, named-refusal, operator-owned
Depends On: Scope 1 — the topic contract, the `topicId` and the closed lifecycle vocabulary

**Primary Outcome:** A topic moves through `active`, `paused` and `retired` by
operator commit only, and every transition is a new dated row in
`research/agenda/history.jsonl` rather than an edit of anything already written. A
topic that has never been reviewed is due on the next generation. A paused topic
is skipped with its own published state, distinct from `unavailable`, and keeps
its history readable. A retired topic is never researched again and loses no prior
version. One invalid topic is refused by name without disabling the rest of the
agenda, and the operator's three real research sessions are expressible as three
committed topics.

## Requirement Coverage

- FR-019-010 — adding a topic requires nothing but a committed registry edit; no
  code change and no schema migration.
- FR-019-011 — a topic that has never been reviewed is due on the next generation.
- FR-019-012 — a `paused` topic is not researched, retains its history, and
  publishes an explicit paused state distinct from `unavailable`.
- FR-019-013 — a `retired` topic is not researched and has no prior dossier
  deleted or rewritten.
- FR-019-014 — every lifecycle change is a new dated event referencing the
  `topicId`, never an in-place rewrite of history (P21).
- FR-019-015 — an invalid topic is refused by name with its reason and does not
  prevent the remaining topics from being reviewed.
- FR-019-035 (lifecycle half) — the agent may not retire, pause or delete a topic;
  an agent-attempted transition is `RLAGENDA-LIFECYCLE`. The refinement half is
  scope 5.
- NFR-019-004 — the append-only guard carries an adversarial case that fails when
  the guard is removed.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-004 A newly declared topic enters the review cycle
  Given the operator commits a new topic with a declared question and a cadence
  When the next generation runs
  Then the topic is treated as due because it has never been reviewed
  And a first dossier is produced or a named outcome is recorded

Scenario: SCN-019-005 Pausing suspends review and preserves history
  Given a topic whose lifecycle state is paused
  When the generation reviews the agenda
  Then the topic is not researched
  And its existing dossier history remains readable
  And the published record states that it is paused rather than unavailable

Scenario: SCN-019-006 Retirement is append-only
  Given the operator retires a topic
  When the generation runs
  Then the topic is not researched
  And no prior dossier version is deleted or rewritten
  And the retirement is recorded as a new lifecycle event referencing the topic

Scenario: SCN-019-007 The operator's actual research history is expressible
  Given the operator declares a defense production and earnings-acceleration topic
  And a U.S.-Iran oil and Strait of Hormuz topic
  And a food, grains and fertilizer topic
  When the agenda is validated
  Then all three are accepted with their own declared questions, scope boundaries and cadences
```

## Implementation Files

### New

- `research/agenda/history.jsonl` — the append-only review and lifecycle ledger,
  seeded empty
- `tests/fixtures/research-agenda/ledger-empty.jsonl`
- `tests/fixtures/research-agenda/ledger-with-prior-reviews.jsonl`
- `tests/fixtures/research-agenda/registry-paused-and-retired.json`
- `tests/fixtures/research-agenda/registry-three-real-topics.json`

### Modified

- `rlagenda.js` — `readLedgerState`, `appendLedgerRow`, `lifecycleOutcome`
- `research-agenda.json` — the three real topics carry their final declared
  questions, scope boundaries and cadences
- `scripts/selftest.mjs` — one new assertion group
- `notes/research-agenda-lab.md` — the lifecycle and ledger contract

## Implementation Plan

1. Define `research-agenda-history-row/v1` in `rlagenda.js`: one JSON object per
   line carrying `topicId`, `generatedAt`, `window`, `lifecycleState`, `outcome`,
   `reviewed`, `dossierRef`, `supersedes`, `triggerBecause`, `refusalCode` and,
   for a lifecycle event, `event: "lifecycle"` with the previous and next states.
   The shape follows `brief-history.jsonl`, which is already one JSON object per
   line and already append-only.
2. Implement `readLedgerState(lines)` as a top-level `function` declaration
   returning, per `topicId`, the last recorded review instant, the current
   dossier reference and the recorded lifecycle history. It reads; it never
   writes.
3. Implement `appendLedgerRow(existingLines, row)` returning a new array with the
   row appended. It has no branch that rewrites, reorders or removes an existing
   line, and a call that would produce a shorter or reordered array refuses
   `RLAGENDA-SUPERSEDE` rather than proceeding.
4. Implement `lifecycleOutcome(topic, ledgerState)` returning the non-researched
   outcome for a topic that will not be researched: `paused` with
   `reviewed: false` for `lifecycleState: "paused"`, and `null` with
   `reviewed: false` for `retired`. Neither resolves to `unavailable`, because
   `unavailable` means the pipeline tried and failed, and neither of these tried.
5. Treat an absent `lastReviewedAt` as due inside `isDue`'s never-reviewed branch,
   so a newly committed topic enters the cycle on the next generation with no
   backfill and no migration.
6. Refuse an agent-attempted lifecycle transition with `RLAGENDA-LIFECYCLE`.
   Lifecycle is operator-owned and moves only by committed registry edit; the
   published surface therefore shows the state and its date and offers no control
   implying otherwise.
7. Write the three real topics into `research-agenda.json` with their own declared
   questions in the operator's words, their own scope boundaries and their own
   cadences. The defense topic's `scopeBoundary.instruments` names only public
   tickers the repository can resolve; the Hormuz and grains topics name their
   public benchmarks. No position, size, cost basis or P&L appears anywhere.
8. Register a `research-agenda — lifecycle and ledger` group in
   `scripts/selftest.mjs` driving the four fixtures.
9. Record the lifecycle rules, the ledger row shape and the append-only rule in
   `notes/research-agenda-lab.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `research/agenda/history.jsonl` (new committed ledger) | Created, seeded empty | Scopes 3, 4, 5 and every future generation | High — this is the only record of what was reviewed when; a writer that rewrites a line destroys history irrecoverably, because the file is the history | Run the append helper against the prior-reviews fixture and assert every pre-existing line is byte-identical afterwards, BEFORE any producer is wired | Delete the file and the two ledger fixtures; scope 3 has not consumed them yet |
| `rlagenda.js` | Three functions added; no existing branch changed | Scopes 3–5 | Medium — a lifecycle outcome that resolved to `unavailable` would make "you paused it" indistinguishable from "we failed", which is the exact P2 confusion the outcome vocabulary exists to prevent | Assert `paused` and `retired` never yield `unavailable` for any input | Remove the three functions |
| `research-agenda.json` | The three real topics written | The plan, the read, the reader | Medium — this file ships to Pages, so a private field is public immediately | `node scripts/pii-scan.mjs` plus a `RLAGENDA-PRIVATE` fixture | Revert to the scope 1 content |
| The `research/` directory | Created | The Pages build | Low in this scope, load-bearing later — `PUBLIC_DIRECTORIES` at `scripts/build-pages-site.mjs:13` is a frozen allowlist of `briefs`, `data`, `docs`, `notes`, `pictures`, `rlexperience-adapters` and `tests/fixtures`, and does not contain `research` | Assert `node scripts/build-pages-site.mjs` still exits 0 with the directory present and unpublished; adding `research` to the allowlist is scope 5's registration change | Delete the directory |

## Change Boundary And Protected Paths

**Allowed:** `rlagenda.js` · `research-agenda.json` ·
`research/agenda/history.jsonl` · `tests/fixtures/research-agenda/*` ·
`scripts/selftest.mjs` · `notes/research-agenda-lab.md`.

**Excluded (must remain byte-identical in this scope):**
`scripts/brief-narrative-parallel.mjs` · `scripts/validate-brief-payload.mjs` ·
`scripts/build-attention-items.mjs` · `scripts/build-brief-page-artifacts.mjs` ·
`scripts/build-pages-site.mjs` · `tools.json` · `index.html` · `rlnav.js` ·
`README.md` · `site-exclusions.json` · `tool-experience.config.json` ·
`rlattention.js` · `rlmarketaction.js` · `rlbrief.js` · `market-brief.html` ·
`market-brief.config.json` · `market-brief.payload.json` ·
`market-brief.page.json` · `market-brief.snapshot.json` · `brief-history.jsonl` ·
`watchlist.json`.

`brief-history.jsonl` is on the excluded list because this scope copies its
*shape* and must not touch its *contents*; a diff there would mean the agenda
ledger was written into the brief's history file.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Owning module | `rlagenda.js` | The lifecycle and ledger functions belong to the one owning module. |
| Registry artifact | `research-agenda.json` | The three real topics are the operator's declarations. |
| Agenda ledger | `research/agenda/history.jsonl` | The deliverable of this scope. |
| Lifecycle fixtures | `tests/fixtures/research-agenda/*` | The registries and ledgers the behaviour is proven against. |
| Project test harness | `scripts/selftest.mjs` | Where the deterministic group lives. |
| Tool notes | `notes/research-agenda-lab.md` | Where the lifecycle contract is recorded. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Dueness and selection | the `isDue` cadence and trigger branches | Scope 3 |
| Lane, dossier writes and outcomes | `scripts/brief-narrative-parallel.mjs` | Scope 4 |
| Registration and the published read | `tools.json`, `index.html`, `rlnav.js`, `README.md`, `site-exclusions.json`, `tool-experience.config.json`, `scripts/validate-brief-payload.mjs`, `scripts/build-brief-page-artifacts.mjs`, `scripts/build-pages-site.mjs` | Scope 5 |
| Routing to actions, attention or alerts | `rlattention.js`, `rlmarketaction.js`, `scripts/build-attention-items.mjs` | Feature 020 |

## Rollback

Remove the three functions from `rlagenda.js`, delete
`research/agenda/history.jsonl` and the four fixtures, revert
`research-agenda.json` to its scope 1 content, and remove the appended selftest
group. Prove the restore by running `node scripts/selftest.mjs` and recording exit
0 with unfiltered output. Nothing downstream is affected, because scope 3 has not
consumed the ledger at the point this scope closes.

## Scenario-First RED/GREEN Contract

RED: author the four scenarios and the four fixtures first. Record the
paused-and-retired fixture resolving `unavailable` before `lifecycleOutcome`
exists — that is the "your choice looks like our failure" defect. Record the
append helper rewriting a line before the append-only refusal exists, with the
prior-reviews fixture proving the loss.

GREEN: a never-reviewed topic is due; a paused topic is not researched, publishes
`paused` with `reviewed: false`, and its prior dossier reference is still
resolvable; a retired topic is not researched and every prior version reference in
the ledger still resolves; a lifecycle transition appends a row and leaves every
pre-existing line byte-identical; and the three real topics validate with zero
refusals.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Lifecycle | unit | SCN-019-004 | `scripts/selftest.mjs` | a newly committed topic with a declared question and a cadence, absent from the ledger entirely, is treated as due because it has never been reviewed, and the plan places it in the selected or deferred set rather than in not-due | `node scripts/selftest.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Lifecycle | unit | SCN-019-004 | `scripts/selftest.mjs` | adding a topic requires only a registry edit: the same module version accepts a registry with one extra topic and produces a first outcome for it with no code change and no migration step | `node scripts/selftest.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Lifecycle | unit | SCN-019-005 | `scripts/selftest.mjs` | a paused topic is not researched, is published with outcome `paused` and `reviewed: false`, is asserted to be distinct from `unavailable`, and its existing dossier reference from the prior-reviews ledger remains readable | `node scripts/selftest.mjs` | No | `report.md#tp-02-03` |
| TP-02-04 | Lifecycle | unit | SCN-019-006 | `scripts/selftest.mjs` | a retired topic is not researched, and every prior dossier version referenced by the ledger is still present and byte-identical after the generation completes — nothing is deleted and nothing is rewritten | `node scripts/selftest.mjs` | No | `report.md#tp-02-04` |
| TP-02-05 | Append-only | unit | SCN-019-006 | `scripts/selftest.mjs` | a retirement appends a new dated `event: "lifecycle"` row referencing the topic identifier and carrying the previous and next states, and every pre-existing ledger line is byte-identical afterwards | `node scripts/selftest.mjs` | No | `report.md#tp-02-05` |
| TP-02-06 | Adversarial | unit | SCN-019-006 | `scripts/selftest.mjs` | Regression: an append call that would shorten, reorder or overwrite an existing ledger line is refused `RLAGENDA-SUPERSEDE`, and a deliberately mutated helper without the refusal is proven to destroy a prior line — the append-only guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-02-06` |
| TP-02-07 | Refusal | unit | SCN-019-007 | `scripts/selftest.mjs` | an agent-attempted lifecycle transition is refused `RLAGENDA-LIFECYCLE` with the field `lifecycleState`, so a topic can be paused or retired only by a committed operator edit | `node scripts/selftest.mjs` | No | `report.md#tp-02-07` |
| TP-02-08 | Contract | unit | SCN-019-007 | `scripts/selftest.mjs` | the committed registry's defense production and earnings-acceleration topic, U.S.-Iran oil and Strait of Hormuz topic, and food grains and fertilizer topic are all accepted, each with its own non-empty declared question, its own scope boundary and its own cadence — three distinct questions, not one shared one | `node scripts/selftest.mjs` | No | `report.md#tp-02-08` |
| TP-02-09 | Refusal | unit | SCN-019-007 | `scripts/selftest.mjs` | Regression: with one topic invalid, the remaining topics are still reviewed and the balance `accepted + refusals === declared` holds against the three-real-topics fixture extended by one malformed entry | `node scripts/selftest.mjs` | No | `report.md#tp-02-09` |
| TP-02-10 | Privacy | unit | SCN-019-007 | `scripts/selftest.mjs` | no committed topic, ledger row or fixture contains `size`, `quantity`, `costBasis` or `pnl`, and a constructed topic carrying one is refused `RLAGENDA-PRIVATE` with the offending field named | `node scripts/selftest.mjs` | No | `report.md#tp-02-10` |
| TP-02-11 | Publication safety | unit | SCN-019-005 | `scripts/build-pages-site.mjs` | the Pages build still plans successfully with the new `research/` directory present and absent from the frozen `PUBLIC_DIRECTORIES` allowlist, so the ledger is committed but not yet published and no publication rule changed in this scope | `node scripts/build-pages-site.mjs` | No | `report.md#tp-02-11` |

### Definition of Done

- [ ] SCN-019-004 — a newly committed topic with a declared question and a cadence is treated as due because it has never been reviewed, and a first dossier is produced or a named outcome is recorded, proven by TP-02-01 and TP-02-02.
- [ ] SCN-019-005 — a paused topic is not researched, its existing dossier history remains readable, and the published record states that it is paused rather than unavailable, proven by TP-02-03.
- [ ] SCN-019-006 — a retired topic is not researched, no prior dossier version is deleted or rewritten, and the retirement is recorded as a new lifecycle event referencing the topic, proven by TP-02-04 and TP-02-05.
- [ ] SCN-019-007 — the defense production and earnings-acceleration topic, the U.S.-Iran oil and Strait of Hormuz topic, and the food grains and fertilizer topic are all accepted with their own declared questions, scope boundaries and cadences, proven by TP-02-08.
- [ ] `research/agenda/history.jsonl` exists as a committed append-only ledger, one JSON object per line, following the `brief-history.jsonl` shape, and `brief-history.jsonl` itself is byte-identical at the end of this scope.
- [ ] `appendLedgerRow` has no branch that rewrites, reorders or removes an existing line, and the append-only guard is proven able to fail, proven by TP-02-06.
- [ ] Adding a topic requires only a committed registry edit — no code change and no schema migration (FR-019-010), proven by TP-02-02.
- [ ] An agent-attempted lifecycle transition is refused `RLAGENDA-LIFECYCLE`; lifecycle is operator-owned (FR-019-035), proven by TP-02-07.
- [ ] One invalid topic is refused by name and does not prevent the remaining topics from being reviewed, with the balance holding, proven by TP-02-09.
- [ ] No committed artifact this scope writes contains a position, a size, a cost basis or a profit-or-loss figure, proven by TP-02-10 and by `node scripts/pii-scan.mjs` exiting 0.
- [ ] `node scripts/selftest.mjs` exits 0 with the lifecycle group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/build-pages-site.mjs` exits 0 with the new `research/` directory present and not yet in `PUBLIC_DIRECTORIES`, proven by TP-02-11.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] TP-02-01 executed with raw output recorded at `report.md#tp-02-01`.
- [ ] TP-02-02 executed with raw output recorded at `report.md#tp-02-02`.
- [ ] TP-02-03 executed with raw output recorded at `report.md#tp-02-03`.
- [ ] TP-02-04 executed with raw output recorded at `report.md#tp-02-04`.
- [ ] TP-02-05 executed with raw output recorded at `report.md#tp-02-05`.
- [ ] TP-02-06 executed with raw output recorded at `report.md#tp-02-06`.
- [ ] TP-02-07 executed with raw output recorded at `report.md#tp-02-07`.
- [ ] TP-02-08 executed with raw output recorded at `report.md#tp-02-08`.
- [ ] TP-02-09 executed with raw output recorded at `report.md#tp-02-09`.
- [ ] TP-02-10 executed with raw output recorded at `report.md#tp-02-10`.
- [ ] TP-02-11 executed with raw output recorded at `report.md#tp-02-11`.
