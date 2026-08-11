# Scope 5: Scoring, Ledger Participation And Degraded Modes

## 05-scoring-ledger-and-degraded-modes

**Status:** Not started
**Scope-Kind:** runtime-behavior + reader-surface
**Tags:** no-privilege, append-only, withheld-rate, refusal-surface, never-truncated
Depends On: Scope 2 — the published topic actions the ledger scores · Scope 3 — the attention refusals the surface points at · Scope 4 — the gated candidates and the alert disclosure

**Primary Outcome:** A published topic-originated call enters the same
recommendation outcome ledger as every other call, on identical terms. Its origin
is recorded as additive members that change no scoring rule, threshold or
weighting, and that non-privilege is asserted rather than assumed. Ledger
corrections are new entries referencing the original. The degraded alert mode is
disclosed rather than hidden, and the qualifying candidate is still recorded. And
a finding refused by every destination is visible to the operator with each
refusing gate's own code and reason, in a never-truncated refusal surface rendered
inside the brief's existing evidence drawer — a payload key and a drawer section,
not a new tier, view or second feed.

## Requirement Coverage

- FR-020-033 — a published topic-originated call enters the same recommendation
  outcome ledger as every other call, with no origin-based exemption.
- FR-020-034 — a topic-originated ledger entry records its originating topic
  identifier and dossier version, and that origin changes no scoring rule,
  threshold or weighting.
- FR-020-035 — ledger corrections are new entries referencing the original; no
  entry is edited or removed (P21).
- FR-020-036 — while live Red Alert publication is unavailable, the surface states
  that publication is dependency-pending and that only local qualification is
  shown; the candidate is still recorded.
- FR-020-037 — a finding refused by every destination remains visible to the
  operator with each refusing gate's own code and reason.
- FR-020-038 — no threshold, cap, score, minimum or vocabulary belonging to any
  destination is modified, and every guard carries an adversarial case that fails
  when the guard is removed (P23).
- FR-020-007 — every routing decision, positive or negative, is recorded with its
  destination and outcome; the record is what the surface renders.
- NFR-020-003 — any budget figure introduced has a test that can actually fail
  (P22).
- NFR-020-004 — the exclusion ledger is cheap enough to publish in full every
  generation; a truncated exclusion ledger reintroduces the silent-discard failure
  this feature exists to remove.

## Gherkin Scenarios

```gherkin
Scenario: SCN-020-019 No exemption for research origin
  Given a published topic-originated action that later resolves
  When the outcome ledger is updated
  Then the call appears with its outcome alongside non-topic calls
  And its origin does not exempt it from the hit and miss counts

Scenario: SCN-020-020 Origin is recorded, not privileged
  Given a published topic-originated action
  When the ledger entry is inspected
  Then it records the originating topic identifier and dossier version
  And that origin field changes no scoring rule, threshold or weighting

Scenario: SCN-020-021 A correction is a new event
  Given a published topic-originated call whose recorded outcome is later corrected
  When the correction is applied
  Then it is a new entry referencing the original
  And the original entry is not edited or removed

Scenario: SCN-020-022 A missing capability is disclosed
  Given live Red Alert publication is unavailable
  And a topic-derived candidate cleared the local evidence bar
  When the reader views the alert surface
  Then the surface states that live publication is dependency-pending and that only local qualification is shown
  And the candidate is still recorded so it is not lost

Scenario: SCN-020-023 Research is distinguishable from silence
  Given a topic finding refused by every destination
  When the generation completes
  Then the operator can see that the finding existed and which gate refused it
  And the reasons carry each refusing gate's own code
  And the finding is not silently discarded
```

## Implementation Files

### New

- `tests/fixtures/research-routing/ledger-topic-originated.jsonl`
- `tests/fixtures/research-routing/ledger-correction.jsonl`
- `tests/fixtures/research-routing/routing-record-all-refused.json`
- `tests/fixtures/research-routing/routing-record-long-refusal-list.json`
- `research-routing.spec.mjs` — a new Playwright browser spec, matched by the
  committed `testMatch` of `**/*.spec.mjs` and run under `--project=system-chrome`
  (its directory is the repository's existing browser-spec directory; the literal
  path is omitted here because `scripts/validate-spec-test-paths.mjs` refuses a
  spec-artifact reference to a file that does not yet exist)

### Modified

- `rlrouting.js` — `buildRoutingRecord` finalisation, `readerSentence`,
  `RLROUTE-ORIGIN-PRIVILEGE`
- `scripts/recommendation-body.mjs` — two optional additive members on the existing
  body, with no version bump
- `scripts/evaluate-recommendations.mjs` — topic-originated calls scored on
  identical terms
- `scripts/brief-distributed-publish.mjs` — the ledger entry carries the additive
  origin members
- `scripts/validate-brief-payload.mjs` — acceptance of the routing-record payload
  key
- `scripts/build-brief-page-artifacts.mjs` — the additive routing-record projection
  into the brief page artifact
- `market-brief.html`, `rlbrief.js` — the refusal surface inside the existing
  evidence drawer, and the alert-area degraded disclosure
- `scripts/selftest.mjs` — one new assertion group
- `notes/research-routing.md` — the ledger contract, the withholding rule and the
  reader vocabulary

## Implementation Plan

1. Add the origin as two **optional additive** members on the existing
   recommendation body — the originating topic identifier and the dossier
   reference — with no version bump, following that module's own stated rule that
   contracts are additive and prior rows stay readable.
2. Score a topic-originated call through the existing evaluation path with no
   branch keyed on origin. A published topic call enters the same ledger through
   the same publish path as every other call.
3. Assert non-privilege rather than assuming it. Refuse
   `RLROUTE-ORIGIN-PRIVILEGE` for any scoring input that varies with an origin
   field, and prove it concretely: score one call twice, once with the origin
   members present and once absent, and require byte-identical outcomes. Without
   this, a future weighting keyed on origin would pass unnoticed.
4. Apply a correction as a new entry referencing the original. Nothing is edited
   and nothing is removed.
5. Publish the single aggregate rate plus a per-topic **count** of resolved calls.
   Withhold a per-topic *rate* until that topic's sample clears the committed
   minimum resolved sample, whose own committed note says a rate over a handful of
   calls is noise dressed as evidence. Publishing a per-topic rate below that
   sample is how origin becomes a differential scoring rule by accident, and it
   would break the honest-measurement principle while appearing to honour the
   transparency one.
6. Finalise the routing record as one additive payload key, and add it to the brief
   page artifact projection. The page artifact carries no attention-exclusions key
   and no tool-reads key today, so without an additive key the refusal surface
   would be invisible to the reader — the record would exist and nobody would see
   it, which is the same failure as discarding it.
7. Render the refusal surface inside the brief's **existing** evidence drawer as a
   drawer section. Simple paint shows one count line; the detail is in the opened
   drawer. It is not a new tier, not a new view and not a second attention feed.
8. Never truncate the refusal list, at any viewport. A truncated refusal list
   reintroduces exactly the silent discard this feature exists to remove, and
   collapsing it away on the smallest screen would make a miss less prominent than a
   hit precisely where the screen is smallest.
9. Carry each refusing gate's **own** code in the record and render its plain-words
   sentence. Machine codes ride `data-*` attributes; no gate code, contract slug or
   dependency-pending marker appears in visible reader text, because those classes
   are publication-blocking.
10. Disclose the alert degraded mode every time: the surface says publication is
    unavailable in plain words, and the qualifying candidate is recorded so it is
    not lost.
11. Assert the finding-level balance at the payload boundary: every routable
    finding has at least one decision in the published record. A finding with no
    decision is a silent discard.
12. Register a `research-routing — ledger and refusal surface` group in
    `scripts/selftest.mjs`, author the browser spec, and record the ledger
    contract, the withholding rule and the reader vocabulary in
    `notes/research-routing.md`.

## Named Missing Capability In This Scope

**Live Red Alert publication.** The degraded behaviour is this scope's
deliverable, not a blocker: the surface states publication is unavailable every
time, the candidate that cleared the local bar is still recorded, and no path
fakes, simulates or locally overrides a published alert. SCN-020-022 is the
scenario that proves the disclosure is honest.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `scripts/evaluate-recommendations.mjs` | Topic calls scored with no origin branch | The published error rate, which is the product's core claim | **Highest in the feature** — a scoring input keyed on origin would make the published rate wrong in a way no test failure would reveal | Score one call twice, with and without the origin members, and require byte-identical outcomes, BEFORE any topic call is published | Remove the additive members; scoring reverts to the identical path |
| `scripts/recommendation-body.mjs` | Two optional additive members, no version bump | Every recommendation body ever written | High — a required member would invalidate every prior row | Assert a body without the members still validates and still scores identically | Remove the two members |
| `scripts/brief-distributed-publish.mjs` | The ledger entry carries the origin members | The append-only ledger | High — the ledger cannot be retro-corrected, so a wrong entry is permanent | Assert a correction appends and the original row is byte-identical afterwards | Remove the members from the entry |
| `market-brief.page.json` projection | One additive key | The reader | Medium — this is what the reader paints from | Assert every pre-existing page-artifact key is byte-identical and only the routing record is added | Remove the projection |
| `market-brief.html`, `rlbrief.js` | One drawer section and the alert disclosure | Every reader of the brief | High — this is the page the whole product is | Assert the action list, the attention tier and the evidence drawer render byte-identically with the refusal section present and absent | Remove the section |
| `scripts/validate-brief-payload.mjs` | One acceptance branch | Every publish | High — the gate is what stops a malformed brief shipping | Assert a payload with no routing record still passes exactly as today | Remove the branch |

## Change Boundary And Protected Paths

**Allowed:** `rlrouting.js` · `scripts/recommendation-body.mjs` ·
`scripts/evaluate-recommendations.mjs` · `scripts/brief-distributed-publish.mjs` ·
`scripts/validate-brief-payload.mjs` · `scripts/build-brief-page-artifacts.mjs` ·
`market-brief.html` · `rlbrief.js` · `research-routing.spec.mjs` ·
`tests/fixtures/research-routing/*` · `scripts/selftest.mjs` ·
`notes/research-routing.md`.

**Excluded (must remain byte-identical in this scope):**
`rlattention.js` · `rlmarketaction.js` · `rlagenda.js` ·
`scripts/build-attention-items.mjs` · `scripts/brief-narrative-parallel.mjs` ·
`scripts/build-pages-site.mjs` · `scripts/web-evidence-acquire.mjs` ·
`scripts/reader-vocabulary.mjs` · `market-brief.config.json` · `watchlist.json` ·
`data/bars/**` · `data/options/**` · `tools.json` · `index.html` · `rlnav.js` ·
`site-exclusions.json`.

`market-brief.config.json` is excluded because it carries the committed minimum
resolved sample as well as every destination threshold; a diff there would mean
either a threshold moved or the withholding rule was loosened.
`scripts/reader-vocabulary.mjs` is excluded because this scope must satisfy the
leak classes rather than widen them.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Owning module | `rlrouting.js` | Record finalisation, the reader sentences and the non-privilege refusal. |
| Ledger and scoring path | `scripts/recommendation-body.mjs`, `scripts/evaluate-recommendations.mjs`, `scripts/brief-distributed-publish.mjs` | Additive origin attribution on identical scoring terms. |
| Publish and page path | `scripts/validate-brief-payload.mjs`, `scripts/build-brief-page-artifacts.mjs` | The routing record must reach both the payload and the page artifact. |
| Reader surface | `market-brief.html`, `rlbrief.js` | The refusal surface and the alert degraded disclosure, inside the existing drawer. |
| Ledger and surface fixtures and specs | `tests/fixtures/research-routing/*`, `research-routing.spec.mjs`, `scripts/selftest.mjs` | Where ledger participation and the refusal surface are proven. |
| Notes | `notes/research-routing.md` | Where the ledger contract and the withholding rule are recorded. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Destination contracts | `rlattention.js`, `rlmarketaction.js`, `scripts/build-attention-items.mjs` | Their own modules; no threshold or vocabulary moves |
| Committed policy and universe | `market-brief.config.json`, `watchlist.json`, `data/bars/**`, `data/options/**` | Unchanged; the minimum resolved sample and every destination threshold stay where they are |
| Reader-vocabulary policy | `scripts/reader-vocabulary.mjs` | Satisfied here, never widened |
| Upstream finding source | `rlagenda.js` | Feature 019 |
| Collector composition | `scripts/brief-narrative-parallel.mjs` | Scopes 2–4 |

## Rollback

Remove the two additive members from `scripts/recommendation-body.mjs` and the
ledger entry, revert the scoring path, the publish-gate acceptance branch, the
page-artifact projection, the drawer section and the alert disclosure; remove the
record finalisation, the reader sentences and the non-privilege refusal from
`rlrouting.js`; delete the four fixtures and the browser spec; remove the appended
selftest group. Prove the restore by running `node scripts/selftest.mjs`,
`node scripts/validate-brief-payload.mjs`, `node scripts/pii-scan.mjs` and
`npx playwright test --project=system-chrome`, recording exit 0 for each with
unfiltered output.

## Scenario-First RED/GREEN Contract

RED: author the five scenarios and the four fixtures first. Record a scoring
weight keyed on the origin field before `RLROUTE-ORIGIN-PRIVILEGE` exists — the
differential rule that no test failure would reveal. Record a per-topic rate
publishing over four resolved calls before the withholding rule exists. Record the
long-refusal-list fixture truncating on the smallest viewport, which is the silent
discard reappearing exactly where a miss should be most visible. Record a routing
record published only into the payload and prove the reader sees nothing.

GREEN: a topic call scores identically with and without its origin members; a
correction appends with the original byte-identical; the per-topic rate is
withheld below the committed sample and the count is shown instead; the alert
surface says publication is unavailable and the candidate is recorded; every
refused finding is visible with its refusing gate's own code; the refusal list is
complete at every viewport; and no gate code or contract slug appears in visible
text.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Ledger | integration | SCN-020-019 | `scripts/selftest.mjs` | a published topic-originated action that later resolves appears in the outcome ledger with its outcome alongside non-topic calls, and its origin does not exempt it from the hit and miss counts | `node scripts/selftest.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Ledger | integration | SCN-020-019 | `scripts/selftest.mjs` | topic-originated calls enter the same ledger through the same publish path as every other call, with no origin-conditional branch anywhere in the scoring path | `node scripts/selftest.mjs` | No | `report.md#tp-05-02` |
| TP-05-03 | Attribution | unit | SCN-020-020 | `scripts/selftest.mjs` | a published topic-originated action's ledger entry records the originating topic identifier and the dossier version, added as optional members with no contract version bump so prior rows stay readable | `node scripts/selftest.mjs` | No | `report.md#tp-05-03` |
| TP-05-04 | Adversarial | unit | SCN-020-020 | `scripts/selftest.mjs` | Regression: scoring one call twice, once with the origin members present and once absent, yields byte-identical outcomes; a scoring input that varies with an origin field is refused `RLROUTE-ORIGIN-PRIVILEGE`, and a mutated pass with a weighting keyed on origin is proven to change the outcome — the non-privilege guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-05-04` |
| TP-05-05 | Append-only | unit | SCN-020-021 | `scripts/selftest.mjs` | a correction to a recorded outcome is a new entry referencing the original, and the original entry is present, byte-identical and neither edited nor removed afterwards | `node scripts/selftest.mjs` | No | `report.md#tp-05-05` |
| TP-05-06 | Withholding | unit | SCN-020-020 | `scripts/selftest.mjs` | Regression: the scorecard publishes the single aggregate rate plus a per-topic count of resolved calls, and a per-topic rate is withheld until that topic's sample clears the committed minimum — asserted at the exact edge, withheld one below and published at the threshold | `node scripts/selftest.mjs` | No | `report.md#tp-05-06` |
| TP-05-07 | Disclosure | unit | SCN-020-022 | `scripts/selftest.mjs` | with live Red Alert publication unavailable and a topic-derived candidate having cleared the local evidence bar, the surface states that live publication is dependency-pending and only local qualification is shown, and the candidate is still recorded so it is not lost | `node scripts/selftest.mjs` | No | `report.md#tp-05-07` |
| TP-05-08 | Disclosure | browser | SCN-020-022 | `research-routing.spec.mjs` | the reader sees the words saying nothing was published, on every render of the alert area, while the machine gate slug stays on a data attribute and never appears in visible text | `npx playwright test --project=system-chrome` | Yes | `report.md#tp-05-08` |
| TP-05-09 | Refusal surface | integration | SCN-020-023 | `scripts/selftest.mjs` | a topic finding refused by every destination is present in the published routing record with one decision per destination attempted, so the operator can see that the finding existed and which gate refused it | `node scripts/selftest.mjs` | No | `report.md#tp-05-09` |
| TP-05-10 | Own codes | integration | SCN-020-023 | `scripts/selftest.mjs` | each recorded reason carries the refusing gate's own code — the body builder's evaluability reason for an action refusal and the attention composer's own code for an attention refusal — rather than a routing-side restatement | `node scripts/selftest.mjs` | No | `report.md#tp-05-10` |
| TP-05-11 | Adversarial | integration | SCN-020-023 | `scripts/selftest.mjs` | Regression: every routable finding has at least one decision in the published record, and a mutated pass that omits a finding is proven to publish a record that looks complete while the finding was silently discarded | `node scripts/selftest.mjs` | No | `report.md#tp-05-11` |
| TP-05-12 | Reachability | integration | SCN-020-023 | `scripts/selftest.mjs` | the routing record reaches the brief page artifact as one additive key, every pre-existing page-artifact key is byte-identical, and a record published only into the payload is asserted to leave the reader with nothing | `node scripts/selftest.mjs` | No | `report.md#tp-05-12` |
| TP-05-13 | Never truncated | browser | SCN-020-023 | `research-routing.spec.mjs` | Regression: with a long refusal list every refused finding is rendered at desktop and at 320px, the list is neither truncated nor collapsed away on the smallest viewport, and each entry carries its plain-words reason | `npx playwright test --project=system-chrome` | Yes | `report.md#tp-05-13` |
| TP-05-14 | Surface boundary | browser | SCN-020-023 | `research-routing.spec.mjs` | the refusal surface renders inside the brief's existing evidence drawer as a drawer section, not as a new tier, a new view or a second attention feed, and the action list and attention tier render byte-identically with it present and absent | `npx playwright test --project=system-chrome` | Yes | `report.md#tp-05-14` |
| TP-05-15 | Reader vocabulary | integration | SCN-020-022 | `scripts/validate-brief-payload.mjs` | Regression: no gate code, no contract slug and no dependency-pending marker appears in visible reader text; each machine value rides a data attribute and the publication-blocking leak classes stay clean | `node scripts/validate-brief-payload.mjs` | No | `report.md#tp-05-15` |
| TP-05-16 | No mutation | unit | SCN-020-019 | `scripts/selftest.mjs` | Regression: no threshold, cap, score, minimum or vocabulary belonging to any destination is modified by this feature — every committed policy value, the public scope and the committed instrument universe are byte-identical | `node scripts/selftest.mjs` | No | `report.md#tp-05-16` |
| TP-05-17 | Privacy | integration | SCN-020-023 | `scripts/pii-scan.mjs` | the repository-wide scan across tracked files exits 0 with the routing record and its fixtures committed; subjects are public tickers and public market objects only | `node scripts/pii-scan.mjs` | No | `report.md#tp-05-17` |
| TP-05-18 | Path guard | unit | SCN-020-023 | `scripts/validate-spec-test-paths.mjs` | the spec-artifact test-path guard reports zero new missing paths after the browser spec is created | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-05-18` |

### Definition of Done

- [ ] SCN-020-019 — a published topic-originated action that later resolves appears in the outcome ledger with its outcome alongside non-topic calls, and its origin does not exempt it from the hit and miss counts, proven by TP-05-01 and TP-05-02.
- [ ] SCN-020-020 — the ledger entry records the originating topic identifier and dossier version, and that origin field changes no scoring rule, threshold or weighting, proven by TP-05-03, TP-05-04 and TP-05-06.
- [ ] SCN-020-021 — a correction is a new entry referencing the original and the original entry is not edited or removed, proven by TP-05-05.
- [ ] SCN-020-022 — with live Red Alert publication unavailable, the surface states that live publication is dependency-pending and only local qualification is shown, and the candidate is still recorded so it is not lost, proven by TP-05-07 and TP-05-08.
- [ ] SCN-020-023 — a finding refused by every destination is visible to the operator with each refusing gate's own code and reason, and is not silently discarded, proven by TP-05-09, TP-05-10, TP-05-11 and TP-05-12.
- [ ] Origin attribution is two optional additive members with no contract version bump, so prior rows stay readable, proven by TP-05-03.
- [ ] Origin non-privilege is asserted concretely by scoring one call twice, and the guard is proven able to fail, proven by TP-05-04.
- [ ] The per-topic rate is withheld below the committed minimum resolved sample and the count is published instead, asserted at the exact edge from both sides (NFR-020-003, P22), proven by TP-05-06.
- [ ] The refusal surface is a payload key plus a section inside the brief's existing evidence drawer — not a new tier, a new view or a second feed, proven by TP-05-14.
- [ ] The refusal list is never truncated and is never collapsed away at 320px (NFR-020-004), proven by TP-05-13.
- [ ] Each recorded reason carries the refusing gate's own code rather than a routing-side restatement, proven by TP-05-10.
- [ ] No gate code, contract slug or dependency-pending marker appears in visible reader text, proven by TP-05-15.
- [ ] No threshold, cap, score, minimum or vocabulary belonging to any destination was modified by this feature (FR-020-038), proven by TP-05-16 and by `git diff --name-only`.
- [ ] `node scripts/selftest.mjs` exits 0 with the ledger and refusal-surface group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/validate-brief-payload.mjs` and `node scripts/pii-scan.mjs` each exit 0, evidenced by unfiltered output.
- [ ] `npx playwright test --project=system-chrome` passes with the new spec included and zero skipped tests.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths, proven by TP-05-18.
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
- [ ] TP-05-18 executed with raw output recorded at `report.md#tp-05-18`.
