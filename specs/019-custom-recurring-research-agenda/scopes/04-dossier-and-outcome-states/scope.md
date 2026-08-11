# Scope 4: Dossier And Honest Outcome States

## 04-dossier-and-outcome-states

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** provenance, named-absence, append-only, soft-failure, write-disjoint
Depends On: Scope 1 — the dossier contract · Scope 3 — the offline plan that selects a topic

**Primary Outcome:** A fifth write-disjoint lane, `research`, owning exactly the
key `researchAgenda` and spawned only when the offline plan selected at least one
topic, researches the selected topics through the existing allowlisted web
fetches. Each reviewed topic produces an immutable dated dossier whose every
finding carries an observation date, a source and a stated confidence, or it
produces one of the four honest outcomes — `updated`, `unchanged`, `stale`,
`unavailable` — each with the `reviewed` discriminator that separates "we looked
and found nothing" from "we did not look". A refreshed dossier references the
version it supersedes and never overwrites it. A failed lane costs its own topics
and nothing else.

## Requirement Coverage

- FR-019-024 — a researched topic produces a dossier carrying the topic
  identifier, the generation instant and the outcome state.
- FR-019-025 — every finding carries an observation date, a source and a stated
  confidence; a finding missing any of the three is not published (P1).
- FR-019-026 — the outcome comes from the closed vocabulary `updated`,
  `unchanged`, `stale`, `unavailable`, plus `paused` and `deferred` for topics
  that were not researched.
- FR-019-027 — `unchanged` is published when research completed and surfaced no
  new evidence; no finding is invented to justify the review.
- FR-019-028 — `stale` is published with the age of the newest evidence when that
  evidence predates the topic's declared freshness window.
- FR-019-029 — `unavailable` is published with a named reason when the worker
  failed or returned nothing usable, and no partial or inferred finding is
  published in its place (P2).
- FR-019-030 — a new dossier version references the version it supersedes and the
  superseded version remains readable (P21).
- FR-019-031 — a correction is a new entry referencing the old one, never an edit
  of the old one (P21).
- FR-019-037 — research runs only through the existing web-capable lanes and their
  committed `webAllow` allowlist; no new credential and no new endpoint (P9).
- NFR-019-002 — the agenda's contribution to publication time is bounded by the
  review budget.
- NFR-019-003 — a dossier body stays inside the committed
  `maxNormalizedObservationBytes` figure of 262144 from the `artifact-budget/v1`
  block in `market-brief.config.json`, and that budget is asserted by a test that
  can fail (P22).
- NFR-019-004 — the supersession guard and the soft-failure guard each carry an
  adversarial case that fails when the guard is removed.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-012 A dossier carries provenance
  Given a due topic researched successfully this generation
  When the dossier is written
  Then every finding carries an observation date, a source, and a stated confidence
  And the dossier carries the generation instant and the topic identifier
  And the outcome state is updated

Scenario: SCN-019-013 No new evidence is a real answer
  Given a due topic whose research surfaced no new evidence since its last dossier
  When the review completes
  Then the outcome state is unchanged
  And no new finding is invented to justify the review
  And the prior dossier remains the current one

Scenario: SCN-019-014 Old evidence is labelled, never presented as current
  Given a due topic whose newest available evidence predates its declared freshness window
  When the review completes
  Then the outcome state is stale
  And the published record names the age of the newest evidence
  And the findings are not presented as a current read

Scenario: SCN-019-015 A failed lane is a named absence
  Given a due topic whose research lane failed or returned nothing usable
  When the review completes
  Then the outcome state is unavailable with a named reason
  And no partial, inferred or placeholder finding is published for it
  And the remaining topics are unaffected

Scenario: SCN-019-016 History is append-only
  Given a topic with an existing dossier
  When a new review produces an updated dossier
  Then the new version references the version it supersedes
  And the superseded version is still readable
  And no prior finding is edited in place
```

## Implementation Files

### New

- `tests/fixtures/research-agenda/dossier-updated.json`
- `tests/fixtures/research-agenda/dossier-finding-missing-source.json`
- `tests/fixtures/research-agenda/dossier-stale-evidence.json`
- `tests/fixtures/research-agenda/dossier-over-byte-budget.json`
- `tests/fixtures/research-agenda/lane-fragment-incomplete.json`

### Modified

- `scripts/brief-narrative-parallel.mjs` — one lane descriptor, the `optional`
  branch in `loadFragment`, `agendaUnavailableFragment`, and the collector
  ordering that writes dossiers and ledger rows after the payload is accepted
- `rlagenda.js` — `validateDossier`, `supersedes`, `buildAgendaRead`
- `scripts/selftest.mjs` — one new assertion group
- `notes/research-agenda-lab.md` — the dossier contract and the outcome table

## Implementation Plan

1. Add one lane descriptor to `scripts/brief-narrative-parallel.mjs`:
   `{ id: 'research', keys: ['researchAgenda'], web: true, optional: true }`. It
   is a fifth lane rather than an extension of `signals` because
   `readCompleteFragment` accepts a fragment only when its key set matches the
   lane's declared keys exactly — so widening `signals` would make one failed
   topic invalidate `attention`, `recommendations` and `events` together, which is
   the opposite of SCN-019-015. It is not `coverage`, which declares `web: false`.
   It is not `core`, which owns `nextSession`.
2. Spawn the lane only when `plan.selected.length > 0`. When nothing is due the
   lane is not added to the pool at all and the collector composes the entire read
   itself, so the common case adds no pool wave and no tokens.
3. Pass the lane only the selected topics — for each, the `declaredQuestion`, the
   `scopeBoundary`, `freshnessWindowDays`, the prior dossier's findings and
   newest-evidence date, and the `because` of any fired trigger. No other topic
   enters the prompt.
4. Extend `loadFragment` with the `optional` branch: a lane error on an `optional`
   lane returns `agendaUnavailableFragment(plan, error)` instead of rethrowing.
   `core`, `signals`, `groups` and `coverage` carry no `optional` flag, so their
   fail-closed behaviour is byte-identical to today — this is an added branch, not
   a changed one.
5. Compose `agendaUnavailableFragment` from the same offline plan with every
   selected topic at `outcome: "unavailable"`, `reviewed: true` and a named
   `unavailableReason`. It fabricates no finding.
6. Implement `validateDossier(dossier, topic)` refusing `RLAGENDA-FINDING` for any
   finding missing `observedAt`, `source` or `confidence`. A refused finding is
   not published and never renders as a blank row.
7. Resolve `stale` when `newestEvidenceObservedAt` is older than the topic's
   `freshnessWindowDays`, and carry `newestEvidenceAgeDays` so the reader is told
   the age rather than shown an undated read.
8. Resolve `unchanged` with `reviewed: true` when research completed and surfaced
   nothing new, and keep the prior dossier as current. The pair
   `(outcome, reviewed)` — not the word alone — distinguishes this from the
   not-due case scope 3 produces.
9. Implement `supersedes(previousRef, nextDossier)` refusing `RLAGENDA-SUPERSEDE`
   when the new version does not reference its predecessor, and refusing any write
   whose target path already exists. Version files are immutable; a correction is
   a new ledger row referencing the old `findingId`.
10. Write dossier files at
    `research/agenda/<topicId>/<YYYY-MM-DDTHHMMSSZ>.dossier.json`, with the colons
    stripped from the instant because they are a hostile filename character on
    non-POSIX checkouts. Write them and the ledger rows in the collector **after**
    the payload is accepted, so a reverted narrative attempt leaves no orphan
    dossier claiming a generation that did not publish.
11. Refuse `RLAGENDA-BUDGET` for a dossier body over the committed
    `maxNormalizedObservationBytes` of 262144, reusing the figure from the
    `artifact-budget/v1` block rather than re-inventing one. The topic then
    resolves `unavailable` with that named reason.
12. Register a `research-agenda — dossier and outcomes` group in
    `scripts/selftest.mjs`, and record the contract and the outcome table in
    `notes/research-agenda-lab.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `scripts/brief-narrative-parallel.mjs` | One lane descriptor, one added `optional` branch, one collector write | Every scheduled generation of the entire brief | **Highest in the feature** — this file publishes the whole brief four times a day; a regression here loses the brief, not just the agenda | Run the four existing lanes with the research lane absent from the plan and assert the produced payload is byte-identical to the pre-change run, BEFORE the lane is ever spawned | Remove the lane descriptor and the `optional` branch; the four existing lanes are untouched by construction |
| `loadFragment` fail-closed behaviour | An `optional` branch added, no existing branch changed | The four existing lanes | High — if `optional` leaked onto an existing lane, a real failure would publish a degraded brief silently | Assert `core`, `signals`, `groups` and `coverage` carry no `optional` flag and still rethrow on error | Remove the branch |
| The protected-file byte check | Untouched — the collector write happens after it | The lane write-disjointness rule | Medium — a write placed before it would look like a lane violation and trigger the baseline restore | Assert the check's inputs are unchanged and no lane's declared key set widened | The check is not modified |
| `research/agenda/**` (new dossier files) | Written per reviewed topic | Scope 5's read, Feature 020's routing | High — an overwrite destroys the trajectory the whole feature exists to preserve | Attempt a second write at an existing version path and require `RLAGENDA-SUPERSEDE` | Delete the written versions; the ledger rows referencing them are appended, not edited |
| The `webAllow` allowlist | Read only — not extended | The two existing web lanes | Medium — a new host here would be a new data source, which is Non-Goal 3 | Assert the allowlist is byte-identical and holds its existing 15 hosts | It is never written |

## Change Boundary And Protected Paths

**Allowed:** `scripts/brief-narrative-parallel.mjs` · `rlagenda.js` ·
`research/agenda/**` · `tests/fixtures/research-agenda/*` ·
`scripts/selftest.mjs` · `notes/research-agenda-lab.md`.

**Excluded (must remain byte-identical in this scope):**
`scripts/validate-brief-payload.mjs` · `scripts/build-attention-items.mjs` ·
`scripts/build-brief-page-artifacts.mjs` · `scripts/build-pages-site.mjs` ·
`tools.json` · `index.html` · `rlnav.js` · `README.md` · `site-exclusions.json` ·
`tool-experience.config.json` · `rlattention.js` · `rlmarketaction.js` ·
`rlbrief.js` · `market-brief.html` · `market-brief.config.json` ·
`market-brief.page.json` · `market-brief.snapshot.json` · `watchlist.json` ·
`brief-history.jsonl` · `scripts/brief-refresh-and-push.sh` ·
`scripts/brief-refresh-scheduled.sh` · `research-agenda.json`.

The `webAllow` list inside `scripts/brief-narrative-parallel.mjs` is inside an
allowed file but is itself excluded: this scope adds a lane, never a host.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Publisher lane wiring | `scripts/brief-narrative-parallel.mjs` | The lane descriptor, the `optional` branch and the collector write are the deliverable. |
| Owning module | `rlagenda.js` | Dossier validation and supersession belong to the one owning module. |
| Dossier store | `research/agenda/**` | The immutable dated versions and the ledger rows referencing them. |
| Dossier fixtures | `tests/fixtures/research-agenda/*` | The dossiers and lane fragments the outcomes are proven against. |
| Project test harness | `scripts/selftest.mjs` | Where the deterministic group lives. |
| Tool notes | `notes/research-agenda-lab.md` | Where the dossier contract is recorded. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Publish gate and page artifacts | `scripts/validate-brief-payload.mjs`, `scripts/build-brief-page-artifacts.mjs` | Scope 5 |
| Registration | `tools.json`, `index.html`, `rlnav.js`, `README.md`, `site-exclusions.json`, `tool-experience.config.json`, `scripts/build-pages-site.mjs` | Scope 5 |
| Scheduler shell path | `scripts/brief-refresh-scheduled.sh`, `scripts/brief-refresh-and-push.sh` | Unchanged by this feature; the lane is added inside the narrative stage the scheduler already invokes |
| Routing to actions, attention or alerts | `rlattention.js`, `rlmarketaction.js`, `scripts/build-attention-items.mjs` | Feature 020 |

## Rollback

Remove the lane descriptor, the `optional` branch and the collector write from
`scripts/brief-narrative-parallel.mjs`; remove `validateDossier`, `supersedes` and
`buildAgendaRead` from `rlagenda.js`; delete the written dossier versions and the
five fixtures; remove the appended selftest group. Prove the restore by running
`node scripts/selftest.mjs` and `node scripts/validate-brief-payload.mjs` and
recording exit 0 for both with unfiltered output, and by asserting the four
existing lanes produce a payload byte-identical to the pre-change run.

## Scenario-First RED/GREEN Contract

RED: author the five scenarios and the five fixtures first. Record the
missing-source fixture publishing a finding with a blank source before
`RLAGENDA-FINDING` exists — the P1 violation the refusal removes. Record the lane
error taking the whole narrative attempt down before the `optional` branch exists,
losing the entire brief over one topic. Record a second write at an existing
version path silently overwriting it before `RLAGENDA-SUPERSEDE` exists.

GREEN: the updated fixture yields every finding with a date, a source and a
confidence; the missing-source fixture publishes zero findings and refuses by
name; the no-new-evidence case yields `unchanged` with `reviewed: true`, zero new
findings and the prior dossier still current; the stale fixture yields `stale`
with a numeric evidence age; the incomplete lane fragment yields `unavailable`
with a named reason for its own topics only, and the other four lanes' keys are
byte-identical; the second write at an existing path is refused; and the
over-budget dossier is refused with the committed 262144-byte figure.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Provenance | unit | SCN-019-012 | `scripts/selftest.mjs` | a due topic researched successfully produces a dossier in which every finding carries an observation date, a source and a stated confidence, and the dossier itself carries the topic identifier, the generation instant and outcome `updated` | `node scripts/selftest.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Provenance | unit | SCN-019-012 | `scripts/selftest.mjs` | Regression: a finding missing `observedAt`, or missing `source`, or missing `confidence` is refused `RLAGENDA-FINDING` with the offending field named and is not published — it never renders as a blank row, and a mutated validator without the refusal is proven to publish it | `node scripts/selftest.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Honest outcome | unit | SCN-019-013 | `scripts/selftest.mjs` | research that completed and surfaced no new evidence yields outcome `unchanged` with `reviewed: true`, publishes exactly zero new findings so nothing is invented to justify the review, and leaves the prior dossier as the current one | `node scripts/selftest.mjs` | No | `report.md#tp-04-03` |
| TP-04-04 | Discriminator | unit | SCN-019-013 | `scripts/selftest.mjs` | Regression: `unchanged` with `reviewed: true` and `unchanged` with `reviewed: false` are asserted distinguishable, and a read row carrying `unchanged` with no `reviewed` member is refused — "we looked and found nothing" cannot collapse into "we did not look" | `node scripts/selftest.mjs` | No | `report.md#tp-04-04` |
| TP-04-05 | Honest outcome | unit | SCN-019-014 | `scripts/selftest.mjs` | a topic whose newest available evidence predates its declared freshness window yields outcome `stale`, the record names the age of the newest evidence as a number of days, and the findings carry the age sentence rather than being presented as a current read | `node scripts/selftest.mjs` | No | `report.md#tp-04-05` |
| TP-04-06 | Boundary | unit | SCN-019-014 | `scripts/selftest.mjs` | the freshness edge is enforced from both sides — not stale at exactly `freshnessWindowDays` and stale at `freshnessWindowDays + 1` — so the window cannot be widened while every other case stays green | `node scripts/selftest.mjs` | No | `report.md#tp-04-06` |
| TP-04-07 | Named absence | integration | SCN-019-015 | `scripts/selftest.mjs` | a research lane that exits non-zero after writing nothing yields outcome `unavailable` with a named reason for its selected topics, publishes zero partial, inferred or placeholder findings, and the generation still completes | `node scripts/selftest.mjs` | No | `report.md#tp-04-07` |
| TP-04-08 | Adversarial | integration | SCN-019-015 | `scripts/selftest.mjs` | Regression: with the research lane forced to fail, the `nextSession`, `attention`, `recommendations`, `events`, `groups`, `watchlistNotes`, `toolReads`, `toolCoverage` and `experimental` keys are byte-identical to a run without the lane; and with the `optional` flag removed the same failure is proven to fail the whole attempt — the soft-failure guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-04-08` |
| TP-04-09 | Append-only | unit | SCN-019-016 | `scripts/selftest.mjs` | a new review of a topic with an existing dossier writes a new dated version referencing the version it supersedes, the superseded version file is still present and byte-identical, and no prior finding is edited in place | `node scripts/selftest.mjs` | No | `report.md#tp-04-09` |
| TP-04-10 | Adversarial | unit | SCN-019-016 | `scripts/selftest.mjs` | Regression: a write targeting an existing version path is refused `RLAGENDA-SUPERSEDE`, a new version omitting its `supersedes` reference is refused by the same code, and a mutated writer without the guard is proven to overwrite a prior version | `node scripts/selftest.mjs` | No | `report.md#tp-04-10` |
| TP-04-11 | Correction | unit | SCN-019-016 | `scripts/selftest.mjs` | a correction to a published finding is a new ledger entry referencing the original `findingId`, and the original entry is present and unedited afterwards | `node scripts/selftest.mjs` | No | `report.md#tp-04-11` |
| TP-04-12 | Budget assertion | unit | SCN-019-012 | `scripts/selftest.mjs` | Regression: a dossier body one byte over the committed `maxNormalizedObservationBytes` of 262144 is refused `RLAGENDA-BUDGET` and the topic resolves `unavailable`, while a body at exactly the limit is accepted — the byte budget is asserted at its edge and can fail | `node scripts/selftest.mjs` | No | `report.md#tp-04-12` |
| TP-04-13 | Lane cost | integration | SCN-019-013 | `scripts/selftest.mjs` | with the offline plan selecting zero topics the research lane is not added to the pool at all, and with it selecting topics the lane input carries only the selected topics and no other topic's declared question | `node scripts/selftest.mjs` | No | `report.md#tp-04-13` |
| TP-04-14 | Source policy | unit | SCN-019-012 | `scripts/selftest.mjs` | the committed `webAllow` allowlist is byte-identical after this scope and still holds its existing hosts, so research adds no new data source, no new credential and no new licensed endpoint | `node scripts/selftest.mjs` | No | `report.md#tp-04-14` |
| TP-04-15 | Publish gate | integration | SCN-019-015 | `scripts/validate-brief-payload.mjs` | the publication gate accepts a payload carrying a `researchAgenda` read in which one topic is `unavailable` with a named reason, and the rest of the brief publishes unaffected | `node scripts/validate-brief-payload.mjs` | No | `report.md#tp-04-15` |

### Definition of Done

- [ ] SCN-019-012 — a due topic researched successfully produces a dossier whose every finding carries an observation date, a source and a stated confidence, and which carries the generation instant, the topic identifier and outcome `updated`, proven by TP-04-01 and TP-04-02.
- [ ] SCN-019-013 — research that surfaced no new evidence yields outcome `unchanged`, invents no new finding to justify the review, and leaves the prior dossier as the current one, proven by TP-04-03 and TP-04-04.
- [ ] SCN-019-014 — a topic whose newest available evidence predates its declared freshness window yields outcome `stale`, the published record names the age of the newest evidence, and the findings are not presented as a current read, proven by TP-04-05 and TP-04-06.
- [ ] SCN-019-015 — a due topic whose research lane failed or returned nothing usable yields outcome `unavailable` with a named reason, publishes no partial, inferred or placeholder finding, and leaves the remaining topics unaffected, proven by TP-04-07, TP-04-08 and TP-04-15.
- [ ] SCN-019-016 — a new review of a topic with an existing dossier produces a version referencing the version it supersedes, the superseded version is still readable, and no prior finding is edited in place, proven by TP-04-09, TP-04-10 and TP-04-11.
- [ ] The `research` lane declares exactly `keys: ['researchAgenda']`, and no existing lane's declared key set widened, so write-disjointness is preserved, proven by TP-04-08.
- [ ] `core`, `signals`, `groups` and `coverage` carry no `optional` flag and still rethrow on error; only the research lane degrades, proven by TP-04-08.
- [ ] The lane is not added to the pool when the offline plan selects zero topics, and the lane input carries only the selected topics (NFR-019-002), proven by TP-04-13.
- [ ] The outcome vocabulary is closed at `updated`, `unchanged`, `stale`, `unavailable`, `paused` and `deferred`, and every published row carries the `reviewed` discriminator, proven by TP-04-04.
- [ ] The committed `maxNormalizedObservationBytes` figure of 262144 from the `artifact-budget/v1` block is reused rather than re-invented, and is asserted at its exact edge from both sides (NFR-019-003, P22), proven by TP-04-12.
- [ ] The `webAllow` allowlist is byte-identical; research adds no credential and no endpoint (FR-019-037), proven by TP-04-14.
- [ ] Dossier files and ledger rows are written only after the payload is accepted, so a reverted narrative attempt leaves no orphan dossier, evidenced by the collector ordering and by TP-04-08.
- [ ] `node scripts/selftest.mjs` exits 0 with the dossier group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/validate-brief-payload.mjs` exits 0, proven by TP-04-15.
- [ ] `node scripts/pii-scan.mjs` exits 0 across `git ls-files` with the written dossiers committed.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] TP-04-01 executed with raw output recorded at `report.md#tp-04-01`.
- [ ] TP-04-02 executed with raw output recorded at `report.md#tp-04-02`.
- [ ] TP-04-03 executed with raw output recorded at `report.md#tp-04-03`.
- [ ] TP-04-04 executed with raw output recorded at `report.md#tp-04-04`.
- [ ] TP-04-05 executed with raw output recorded at `report.md#tp-04-05`.
- [ ] TP-04-06 executed with raw output recorded at `report.md#tp-04-06`.
- [ ] TP-04-07 executed with raw output recorded at `report.md#tp-04-07`.
- [ ] TP-04-08 executed with raw output recorded at `report.md#tp-04-08`.
- [ ] TP-04-09 executed with raw output recorded at `report.md#tp-04-09`.
- [ ] TP-04-10 executed with raw output recorded at `report.md#tp-04-10`.
- [ ] TP-04-11 executed with raw output recorded at `report.md#tp-04-11`.
- [ ] TP-04-12 executed with raw output recorded at `report.md#tp-04-12`.
- [ ] TP-04-13 executed with raw output recorded at `report.md#tp-04-13`.
- [ ] TP-04-14 executed with raw output recorded at `report.md#tp-04-14`.
- [ ] TP-04-15 executed with raw output recorded at `report.md#tp-04-15`.
