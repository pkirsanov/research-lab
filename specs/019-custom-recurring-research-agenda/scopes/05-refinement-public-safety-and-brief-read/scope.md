# Scope 5: Refinement, Public Safety And The Brief Read

## 05-refinement-public-safety-and-brief-read

**Status:** Not started
**Scope-Kind:** runtime-behavior + reader-surface
**Tags:** reachability, registration, public-scope, bounded-refinement, accessibility
Depends On: Scope 1 — the byte-stable declared question and the private-field list · Scope 4 — the dossiers the read projects

**Primary Outcome:** The agent may sharpen a topic inside the operator's declared
boundary, recorded as a dated attributed addition that leaves the declared
question byte-identical; a proposal outside the boundary is refused by name and
changes nothing. No dossier, registry entry or published record carries a
position, a size, a cost basis or a profit-or-loss figure. And the agenda read
reaches the brief through both halves that FR-019-038 requires and neither of
which substitutes for the other: a `payload.toolReads['research-agenda-lab']`
entry under a newly registered tool id, and an additive `researchAgenda` key on
`market-brief.page.json` rendered by an agenda section of the brief the reader
already opens.

## Requirement Coverage

- FR-019-032 — the agent may propose a refinement that narrows a topic or adds a
  sub-question inside the declared scope boundary.
- FR-019-033 — a refinement is recorded as an attributed, dated addition and the
  operator's declared question text remains byte-identical.
- FR-019-034 — a refinement whose subject falls outside the declared scope
  boundary is refused with a named reason.
- FR-019-035 (refinement half) — the agent may not retire, pause or delete a
  topic. The lifecycle half is scope 2.
- FR-019-036 — no dossier, registry entry or published record contains a position,
  a size, a cost basis or a profit-or-loss figure; subjects are public market
  objects and public tickers only (P13).
- FR-019-038 — each generation publishes an agenda read that reaches the brief,
  carrying every topic's identifier and outcome state. Filing into the tool-read
  channel is necessary but not sufficient; the page-artifact key and the rendering
  section are equally required.
- NFR-019-003 — every published artifact stays inside the committed
  `artifact-budget/v1` contract.
- NFR-019-004 — the refinement guard and the private-field guard each carry an
  adversarial case that fails when the guard is removed.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-017 A refinement narrows, it does not replace
  Given a topic whose declared question admits a narrower sub-question the evidence now supports
  When the agent proposes a refinement
  Then the refinement is recorded as an addition inside the declared question
  And the operator's declared question text is unchanged
  And the refinement is attributed to the agent and dated

Scenario: SCN-019-018 A refinement outside the boundary is refused
  Given a proposed refinement whose subject falls outside the topic's declared scope boundary
  When the refinement is validated
  Then it is refused with a named reason
  And the topic's declared question and scope boundary are unchanged

Scenario: SCN-019-019 Public scope only
  Given any dossier produced by this feature
  When it is inspected
  Then it contains no position, no size, no cost basis and no profit or loss figure
  And every subject it names is a public market object or a public ticker

Scenario: SCN-019-020 The research read reaches the brief
  Given a generation in which at least one topic was reviewed
  When the published payload and the brief page artifact are inspected
  Then the payload carries a research read for the agenda under its registered tool id, with each topic's outcome state
  And the brief page artifact carries the agenda material the reader-facing section renders
  And the read is visible on a brief surface the reader opens, rather than only present in the payload or confined to a dossier file
```

## Implementation Files

### New

- `research-agenda-lab.html` — the registered owning tool page
- `tests/fixtures/research-agenda/refinement-inside-boundary.json`
- `tests/fixtures/research-agenda/refinement-outside-boundary.json`
- `tests/fixtures/research-agenda/topic-with-private-field.json`
- `tests/fixtures/research-agenda/read-reaches-brief.json`
- `research-agenda-lab.spec.mjs` — a new Playwright browser spec, matched by the
  committed `testMatch` of `**/*.spec.mjs` and run under `--project=system-chrome`
  (its directory is the repository's existing browser-spec directory; the literal
  path is omitted here because `scripts/validate-spec-test-paths.mjs` refuses a
  spec-artifact reference to a file that does not yet exist)

### Modified

- `rlagenda.js` — `admitRefinement`, `buildAgendaRead`, `buildAgendaToolRead`,
  `readerSentence`
- `tools.json` — a 25th entry for `research-agenda-lab`
- `index.html` — one `TOOLS` array entry
- `rlnav.js` — one `TOOLS` array entry, kept in sync with `index.html` and
  `tools.json` as that file's own header requires
- `README.md` — one row
- `notes/README.md` — one row, plus `notes/research-agenda-lab.md` as the tool's
  `notes` target
- `tool-experience.config.json` — the `experience` block naming an existing Simple
  model definition, an adapter already inside the module allowlist, and journey
  definitions that already exist
- `scripts/build-pages-site.mjs` — `'research'` added to `PUBLIC_DIRECTORIES`
- `scripts/build-brief-page-artifacts.mjs` — the additive `researchAgenda`
  projection into `market-brief.page.json`
- `scripts/validate-brief-payload.mjs` — acceptance of `payload.researchAgenda`
- `scripts/brief-narrative-parallel.mjs` — the collector merge of
  `payload.toolReads['research-agenda-lab']` after every fragment is assigned
- `market-brief.html` — the agenda section between `#nextSession` and
  `#decisionAttention`
- `rlbrief.js` — the agenda section renderer
- `rlapp.js`, `rlviews.js` — the additive `publicTargetIds` seam
- `scripts/selftest.mjs` — one new assertion group
- `notes/research-agenda-lab.md` — the reader vocabulary and the registration
  record

## Implementation Plan

1. Implement `admitRefinement(topic, proposal)` returning
   `{ admitted, code, reason }`. A proposal naming a subject, geography,
   instrument or horizon outside `scopeBoundary` is refused
   `RLAGENDA-REFINEMENT`, and so is any proposal whose application would change
   `declaredQuestion`. An admitted refinement is appended to the dossier's
   `refinements[]` with its date and `by: "agent"`.
2. Carry `declaredQuestionSha256` on every dossier as the byte-identity proof, and
   assert the hash of the registry's current `declaredQuestion` equals it before
   and after any refinement is applied.
3. Refuse `RLAGENDA-PRIVATE` for any of the four frozen private field names
   anywhere in a topic, a dossier or a read, and `RLAGENDA-SUBJECT` for a subject
   that is not a public market object or a public ticker.
4. Implement `buildAgendaRead(plan, dossiers)` producing `research-agenda-read/v1`
   with `registryState`, `declaredTopicCount`, `reviewBudget`, the verbatim
   `selectionOrder`, the per-topic rows and the `refusals[]`. Assert
   `topics.length + refusals.length === declaredTopicCount` in the published read
   itself, not only in the validator.
5. Implement `buildAgendaToolRead(read)` producing the `payload.toolReads` entry
   with `deepLink: "research-agenda-lab.html"`. Merge it in the collector **after**
   every fragment is assigned, because the `coverage` lane owns `toolReads` and
   replaces it wholesale during the fragment assign. This is a collector write, so
   no lane's key ownership widens.
6. Register the tool. Registration is atomic with the page it registers, because
   `scripts/build-pages-site.mjs` asserts every registered page exists and is not
   excluded, and that every unregistered root `.html` is listed in
   `site-exclusions.json`. Land in one change: the `tools.json` entry, the
   `index.html` and `rlnav.js` `TOOLS` rows, the `README.md` and `notes/README.md`
   rows, the `notes/research-agenda-lab.md` target, the `experience` block, and
   `research-agenda-lab.html` itself. `toolCoverage` in the payload and the
   snapshot follows automatically, because the `coverage` lane derives its list
   from `tools.json`.
7. Add `'research'` to the frozen `PUBLIC_DIRECTORIES` list in
   `scripts/build-pages-site.mjs`. Without it the dossier directory is committed
   but never published, and every per-finding link would land nowhere.
8. Settle design open question 1 by reading the closest existing adapter before
   authoring the `experience` block: reuse an existing `simpleModelDefinitionId`,
   an existing `simpleAdapterId` whose module is already inside the adapter module
   allowlist, and existing `journeyDefinitionIds`. Add an allowlist entry only if
   reading proves no existing adapter fits, and record which was true.
9. Add the additive `researchAgenda` key to `market-brief.page.json` through
   `scripts/build-brief-page-artifacts.mjs`. This is the half registration does
   not supply: the brief's evidence drawer renders the snapshot tool reads, and
   the page artifact carries no tool-read key, so a read published only into the
   payload is invisible to the reader.
10. Render the agenda section in `market-brief.html` and `rlbrief.js` as a peer
    `h2.sec` section between `#nextSession` and `#decisionAttention`, inside the
    existing `brief` view. No new tier, no new view, no second feed. The
    `declaredQuestion` is quoted verbatim as a quotation and never paraphrased.
11. Put every machine value on a `data-*` attribute and render only
    `readerSentence(row)` as visible text, following the shipped pattern in
    `market-brief.html` where a machine gate slug rides `data-mac-gate` while the
    visible words stay plain. A raw `updated` / `unchanged` / `stale` /
    `unavailable` token, any `RLAGENDA-` code and any `…/vN` contract slug are
    banned from reader prose; `scripts/reader-vocabulary.mjs` classes are
    publication-blocking and `scripts/validate-brief-payload.mjs` enforces them.
12. Extend the durable-link seam additively: a page sets `root.__rlPublicTargetIds`,
    `rlapp.js` copies it onto the registration as `publicTargetIds` filtered to
    the existing id pattern and defaulting to `[]`, and `rlviews.js` passes
    `registration.publicTargetIds || []`. Every other page sets nothing and keeps
    byte-identical behaviour. If the seam is descoped, the declared degraded mode
    applies: the link lands on the brief view without the topic expanded and the
    link text says so. A link that quietly does not arrive is not an option.
13. Register a `research-agenda — read reaches the brief` group in
    `scripts/selftest.mjs`, author the browser spec, and record the reader
    vocabulary and the registration in `notes/research-agenda-lab.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `tools.json` and the ten sibling registration surfaces | One 25th entry plus its page, nav rows, README rows, notes target and `experience` block | The Pages build, the payload's `toolCoverage`, the snapshot's `toolCoverage`, `market-brief.tools.page.json`, every attention deep-link resolution | **Highest in this scope** — registration is binary and atomic; a registered page that does not exist fails the site build outright, and a `toolCoverage` missing a registered id fails the publish gate | Run `node scripts/build-pages-site.mjs` and `node scripts/validate-brief-payload.mjs` in the same change that adds the entry, before anything else in the scope is wired | Revert all eleven surfaces together; a partial revert is itself a red build, which is the property that makes the atomicity self-enforcing |
| `PUBLIC_DIRECTORIES` in `scripts/build-pages-site.mjs` | `'research'` appended to a frozen allowlist | Every dossier link | Medium — omit it and the dossiers are committed but unreachable; add the wrong name and an unintended directory ships | Assert the built site contains a written dossier path and contains no directory outside the allowlist | Remove the entry |
| `scripts/build-brief-page-artifacts.mjs` | One additive projection | `market-brief.page.json` and the reader | Medium — the page artifact is what the reader actually paints from | Assert every pre-existing page-artifact key is byte-identical and only `researchAgenda` is added | Remove the projection |
| `market-brief.html` and `rlbrief.js` | One section and one renderer | Every reader of the brief | High — this is the page the whole product is | Assert `#nextSession` and `#decisionAttention` render byte-identically with the agenda section present and with it absent | Remove the section and the renderer |
| `rlapp.js` and `rlviews.js` | The additive `publicTargetIds` seam | All twenty-four existing pages | High — a regression in the shared view router breaks every tool page at once | Assert a page that sets nothing resolves the identical route it resolves today, across the existing pages, before the agenda page uses the seam | Remove the seam; the declared degraded mode covers the link |
| `scripts/validate-brief-payload.mjs` | One acceptance branch | Every publish | High — the gate is what stops a malformed brief shipping | Assert a payload with no `researchAgenda` key still passes exactly as today | Remove the branch |
| `scripts/brief-narrative-parallel.mjs` | One collector merge after the fragment assign | Every generation | Medium — placed before the assign it would be overwritten by the `coverage` lane's wholesale `toolReads` replacement | Assert the merged entry survives the assign and no lane's declared key set widened | Remove the merge |

## Change Boundary And Protected Paths

**Allowed:** `rlagenda.js` · `research-agenda-lab.html` ·
`research-agenda-lab.spec.mjs` · `tools.json` · `index.html` · `rlnav.js` ·
`README.md` · `notes/README.md` · `notes/research-agenda-lab.md` ·
`tool-experience.config.json` · `scripts/build-pages-site.mjs` ·
`scripts/build-brief-page-artifacts.mjs` · `scripts/validate-brief-payload.mjs` ·
`scripts/brief-narrative-parallel.mjs` · `market-brief.html` · `rlbrief.js` ·
`rlapp.js` · `rlviews.js` · `tests/fixtures/research-agenda/*` ·
`scripts/selftest.mjs`.

**Excluded (must remain byte-identical in this scope):**
`rlattention.js` · `rlmarketaction.js` · `scripts/build-attention-items.mjs` ·
`scripts/recommendation-body.mjs` · `scripts/evaluate-recommendations.mjs` ·
`scripts/brief-distributed-publish.mjs` · `watchlist.json` ·
`market-brief.config.json` · `research-agenda.json` ·
`research/agenda/history.jsonl` · `site-exclusions.json` ·
`scripts/reader-vocabulary.mjs` · `brief-history.jsonl` ·
`scripts/brief-refresh-scheduled.sh` · `scripts/brief-refresh-and-push.sh`.

`site-exclusions.json` is excluded because this page is registered rather than
excluded, and a diff there would mean registration went the wrong way.
`scripts/reader-vocabulary.mjs` is excluded because this scope must satisfy the
leak classes rather than widen them.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Owning module | `rlagenda.js` | Refinement admission and read composition belong to the one owning module. |
| Registration surfaces | `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md`, `notes/research-agenda-lab.md`, `tool-experience.config.json`, `research-agenda-lab.html`, `scripts/build-pages-site.mjs` | Registration is atomic; a partial registration is a red site build. |
| Publish path | `scripts/validate-brief-payload.mjs`, `scripts/build-brief-page-artifacts.mjs`, `scripts/brief-narrative-parallel.mjs` | The read must reach both the payload and the page artifact. |
| Reader surface | `market-brief.html`, `rlbrief.js`, `rlapp.js`, `rlviews.js` | The rendering half of FR-019-038 and the durable-link seam. |
| Reachability fixtures and specs | `tests/fixtures/research-agenda/*`, `research-agenda-lab.spec.mjs`, `scripts/selftest.mjs` | Where the reachability and refusal behaviour is proven. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Action list, attention tier, alert pipeline | `scripts/recommendation-body.mjs`, `rlattention.js`, `rlmarketaction.js`, `scripts/build-attention-items.mjs` | Feature 020 — this scope never writes `nextSession`, composes an attention item, or asserts alert state |
| Ledger and scorecard | `scripts/evaluate-recommendations.mjs`, `scripts/brief-distributed-publish.mjs` | Feature 020 |
| Registry and ledger content | `research-agenda.json`, `research/agenda/history.jsonl` | Scopes 1, 2 and 4; this scope reads them |
| Reader-vocabulary policy | `scripts/reader-vocabulary.mjs` | Satisfied here, never widened |

## Rollback

Revert all eleven registration surfaces together with `research-agenda-lab.html`;
remove the `'research'` entry from `PUBLIC_DIRECTORIES`, the page-artifact
projection, the publish-gate acceptance branch, the collector merge, the brief
section and its renderer, and the `publicTargetIds` seam; remove
`admitRefinement`, `buildAgendaRead`, `buildAgendaToolRead` and `readerSentence`
from `rlagenda.js`; delete the four fixtures and the browser spec; remove the
appended selftest group. Prove the restore by running
`node scripts/selftest.mjs`, `node scripts/validate-brief-payload.mjs`,
`node scripts/build-pages-site.mjs` and `node scripts/pii-scan.mjs`, recording
exit 0 for each with unfiltered output. A partial revert is a red site build by
construction, so the rollback is all-or-nothing and self-checking.

## Scenario-First RED/GREEN Contract

RED: author the four scenarios and the four fixtures first. Record the
outside-boundary refinement being applied before `RLAGENDA-REFINEMENT` exists —
the agent silently widening the operator's question. Record the private-field
topic reaching a committed public artifact before `RLAGENDA-PRIVATE` exists.
Record the read published only into `payload.toolReads` and prove the reader sees
nothing: the evidence drawer renders the snapshot tool reads and the page artifact
carries no tool-read key, so registration alone leaves the surface invisible. That
is the exact failure the page-artifact key removes.

GREEN: an inside-boundary refinement is recorded dated and attributed with the
declared question byte-identical; an outside-boundary proposal is refused by name
with the question and boundary unchanged; a private field anywhere is refused; the
payload carries the tool read under the registered id and the page artifact
carries `researchAgenda`; the browser spec observes each topic's state sentence
rendered on the brief page itself; and no contract code, enum token or contract
slug appears in visible reader text.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Refinement | unit | SCN-019-017 | `scripts/selftest.mjs` | a refinement narrowing inside the declared scope boundary is admitted, recorded as a dated addition attributed to the agent, and the operator's declared question text is byte-identical before and after, proven by comparing `declaredQuestionSha256` | `node scripts/selftest.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Refusal | unit | SCN-019-018 | `scripts/selftest.mjs` | a proposed refinement whose subject falls outside the topic's declared scope boundary is refused `RLAGENDA-REFINEMENT` with a named reason, and the topic's declared question and scope boundary are byte-identical afterwards | `node scripts/selftest.mjs` | No | `report.md#tp-05-02` |
| TP-05-03 | Adversarial | unit | SCN-019-017 | `scripts/selftest.mjs` | Regression: a refinement whose application would rewrite the declared question text is refused, and a mutated admitter without the byte-identity check is proven to rewrite the operator's words — the guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-05-03` |
| TP-05-04 | Refusal | unit | SCN-019-018 | `scripts/selftest.mjs` | an agent-attempted retire, pause or delete is refused; lifecycle transitions remain operator-owned and no refinement path can reach one | `node scripts/selftest.mjs` | No | `report.md#tp-05-04` |
| TP-05-05 | Privacy | unit | SCN-019-019 | `scripts/selftest.mjs` | any dossier produced by this feature is inspected and contains no position, no size, no cost basis and no profit or loss figure, and a constructed topic or dossier carrying one of the four private field names is refused `RLAGENDA-PRIVATE` with the field named | `node scripts/selftest.mjs` | No | `report.md#tp-05-05` |
| TP-05-06 | Privacy | unit | SCN-019-019 | `scripts/selftest.mjs` | every subject named by a committed dossier, registry entry or published read is a public market object or a public ticker, and a non-public subject is refused `RLAGENDA-SUBJECT` | `node scripts/selftest.mjs` | No | `report.md#tp-05-06` |
| TP-05-07 | Privacy | integration | SCN-019-019 | `scripts/pii-scan.mjs` | Regression: the repository-wide scan across `git ls-files` exits 0 with the registry, every written dossier, the ledger and the tool page committed | `node scripts/pii-scan.mjs` | No | `report.md#tp-05-07` |
| TP-05-08 | Reachability | integration | SCN-019-020 | `scripts/selftest.mjs` | in a generation where at least one topic was reviewed, the published payload carries a research read for the agenda under the registered tool id `research-agenda-lab`, and every declared topic's identifier and outcome state is present in it | `node scripts/selftest.mjs` | No | `report.md#tp-05-08` |
| TP-05-09 | Reachability | integration | SCN-019-020 | `scripts/selftest.mjs` | the brief page artifact carries the additive `researchAgenda` key holding the agenda material the reader-facing section renders, every pre-existing page-artifact key is byte-identical, and a payload carrying the tool read but no page key is asserted to leave the reader with nothing — filing into the tool-read channel alone does not satisfy reachability | `node scripts/selftest.mjs` | No | `report.md#tp-05-09` |
| TP-05-10 | Reachability | browser | SCN-019-020 | `research-agenda-lab.spec.mjs` | on the brief page the reader opens, the agenda section renders each topic's title, its verbatim declared question and its plain-words state sentence, so the read is visible on a brief surface rather than only present in the payload or confined to a dossier file | `npx playwright test --project=system-chrome` | Yes | `report.md#tp-05-10` |
| TP-05-11 | Reader vocabulary | integration | SCN-019-020 | `scripts/validate-brief-payload.mjs` | Regression: no `RLAGENDA-` code, no raw `updated` / `unchanged` / `stale` / `unavailable` enum token and no `…/vN` contract slug appears in visible reader text; each machine value rides a `data-*` attribute and the publication-blocking leak classes stay clean | `node scripts/validate-brief-payload.mjs` | No | `report.md#tp-05-11` |
| TP-05-12 | Registration | integration | SCN-019-020 | `scripts/build-pages-site.mjs` | the site build plans successfully with `research-agenda-lab` registered and `research-agenda-lab.html` present and not excluded, with `'research'` in `PUBLIC_DIRECTORIES` so a written dossier path is published, and with no unregistered root page lacking a deploy decision | `node scripts/build-pages-site.mjs` | No | `report.md#tp-05-12` |
| TP-05-13 | Registration | integration | SCN-019-020 | `scripts/validate-brief-payload.mjs` | `toolCoverage` in both the payload and the snapshot contains every registered id exactly once including the new one and no unregistered id, and the tool read's deep link is a member of the registry's own file values so it is publishable | `node scripts/validate-brief-payload.mjs` | No | `report.md#tp-05-13` |
| TP-05-14 | Balance | unit | SCN-019-020 | `scripts/selftest.mjs` | the published read asserts `topics.length + refusals.length === declaredTopicCount` in the read itself, so a topic cannot disappear between the registry and the reader | `node scripts/selftest.mjs` | No | `report.md#tp-05-14` |
| TP-05-15 | Shared seam | browser | SCN-019-020 | `research-agenda-lab.spec.mjs` | Regression: a page that sets no `__rlPublicTargetIds` resolves the identical route it resolves today, and a per-topic link either survives a reload or the link text states where it lands — a link that quietly does not arrive fails this row | `npx playwright test --project=system-chrome` | Yes | `report.md#tp-05-15` |
| TP-05-16 | Accessibility | browser | SCN-019-020 | `research-agenda-lab.spec.mjs` | every agenda row's state is carried by glyph, word and pill rather than colour alone; each row expander is a native details/summary operable with Tab, Enter and Space; the section reflows to a single column at 320px with no horizontal page scroll; and the review record renders as a real table | `npx playwright test --project=system-chrome` | Yes | `report.md#tp-05-16` |
| TP-05-17 | Path guard | unit | SCN-019-020 | `scripts/validate-spec-test-paths.mjs` | the spec-artifact test-path guard reports zero new missing paths after the browser spec is created, so every declared verification path resolves | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-05-17` |

### Definition of Done

- [ ] SCN-019-017 — a refinement narrowing inside the declared boundary is recorded as an addition inside the declared question, the operator's declared question text is unchanged, and the refinement is attributed to the agent and dated, proven by TP-05-01 and TP-05-03.
- [ ] SCN-019-018 — a proposed refinement whose subject falls outside the topic's declared scope boundary is refused with a named reason, and the topic's declared question and scope boundary are unchanged, proven by TP-05-02 and TP-05-04.
- [ ] SCN-019-019 — any dossier produced by this feature contains no position, no size, no cost basis and no profit or loss figure, and every subject it names is a public market object or a public ticker, proven by TP-05-05, TP-05-06 and TP-05-07.
- [ ] SCN-019-020 — the payload carries a research read for the agenda under its registered tool id with each topic's outcome state, the brief page artifact carries the agenda material the reader-facing section renders, and the read is visible on a brief surface the reader opens rather than only present in the payload or confined to a dossier file, proven by TP-05-08, TP-05-09 and TP-05-10.
- [ ] Both halves of FR-019-038 are asserted independently, and a payload carrying only the tool read is proven to leave the reader with nothing, proven by TP-05-09.
- [ ] Registration lands atomically: the `tools.json` entry, `research-agenda-lab.html`, the `index.html` and `rlnav.js` rows, the `README.md` and `notes/README.md` rows, the notes target and the `experience` block are all present in the same change, proven by TP-05-12 and TP-05-13.
- [ ] `'research'` is present in `PUBLIC_DIRECTORIES` and a written dossier path appears in the built site, proven by TP-05-12.
- [ ] The `experience` block names an existing Simple model definition, an adapter already inside the module allowlist and existing journey definitions — or records, with the file read, that no existing adapter fits and why an allowlist entry was added. Design open question 1 is settled by reading rather than guessing.
- [ ] The tool read is merged by the collector after every fragment is assigned, so the `coverage` lane's wholesale `toolReads` replacement does not drop it and no lane's declared key set widened.
- [ ] `market-brief.page.json` gains exactly one additive key and every pre-existing key is byte-identical, proven by TP-05-09.
- [ ] No `RLAGENDA-` code, raw outcome enum token or contract slug appears in visible reader text; machine values ride `data-*` attributes, proven by TP-05-11.
- [ ] The published read asserts its own balance, so a topic cannot disappear between the registry and the reader, proven by TP-05-14.
- [ ] A page setting no `__rlPublicTargetIds` resolves the identical route it resolves today, and a per-topic link either survives a reload or says where it lands, proven by TP-05-15.
- [ ] The agenda section is a peer section inside the existing `brief` view — no new tier, no new top-level view, no second feed — and is accessible per TP-05-16.
- [ ] `node scripts/selftest.mjs` exits 0 with the reachability group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/validate-brief-payload.mjs`, `node scripts/build-pages-site.mjs` and `node scripts/pii-scan.mjs` each exit 0, evidenced by unfiltered output.
- [ ] `npx playwright test --project=system-chrome` passes with the new spec included and zero skipped tests.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths, proven by TP-05-17.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] TP-05-01 executed with raw output recorded at `report.md#tp-05-01`.
- [ ] TP-05-02 executed with raw output recorded at `report.md#tp-05-02`.
- [ ] TP-05-03 executed with raw output recorded at `report.md#tp-05-03`.
- [ ] TP-05-04 executed with raw output recorded at `report.md#tp-05-04`.
- [ ] TP-05-05 executed with raw output recorded at `report.md#tp-05-05`.
- [ ] TP-05-06 executed with raw output recorded at `report.md#tp-05-06`.
- [ ] TP-05-07 executed with raw output recorded at `report.md#tp-05-07`.
- [ ] TP-05-08 executed with raw output recorded at `report.md#tp-05-08`.
- [ ] TP-05-09 executed with raw output recorded at `report.md#tp-05-09`.
- [ ] TP-05-10 executed with raw output recorded at `report.md#tp-05-10`.
- [ ] TP-05-11 executed with raw output recorded at `report.md#tp-05-11`.
- [ ] TP-05-12 executed with raw output recorded at `report.md#tp-05-12`.
- [ ] TP-05-13 executed with raw output recorded at `report.md#tp-05-13`.
- [ ] TP-05-14 executed with raw output recorded at `report.md#tp-05-14`.
- [ ] TP-05-15 executed with raw output recorded at `report.md#tp-05-15`.
- [ ] TP-05-16 executed with raw output recorded at `report.md#tp-05-16`.
- [ ] TP-05-17 executed with raw output recorded at `report.md#tp-05-17`.
