# Scope 3: Attention-Tier Routing And The Exclusion Ledger

## 03-attention-tier-routing-and-exclusions

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** existing-composer, closed-refusals, balancing, no-padding, by-reference
Depends On: Scope 1 — the finding contract and the adjudicator seam · Scope 2 — the published actions the overlap refusal reads

**Primary Outcome:** A topic finding reaches the decision-attention tier only
through the existing build step and composer — never a parallel path. Every
refusal is the composer's own, recorded by the composer in its own exclusions
channel with its own code, field and reason; the routing record points at the
index rather than copying it, because that channel's code member is validated
against the composer's frozen list and an action-side reason placed there would
fail the publish gate and take the whole brief down. Built plus excluded equals
declared. An empty tier stays empty.

## Requirement Coverage

- FR-020-018 — a topic finding routed to the attention tier is composed through the
  existing composer, not a parallel path.
- FR-020-019 — a subject outside the public watchlist scope is refused, and the
  refusal recorded with the composer's own privacy code.
- FR-020-020 — a deep link that is not among the current generation's tool deep
  links is refused, and the refusal recorded with the composer's own deep-link
  code.
- FR-020-021 — a verb outside the research-verb vocabulary is refused, and the
  refusal recorded with the composer's own verb code.
- FR-020-022 — a subject already published as an action is refused as an overlap;
  routing does not rename or re-key the subject to evade the check.
- FR-020-023 — every attention refusal is appended to the attention exclusions
  channel with its code, field and reason.
- FR-020-024 — built items plus recorded exclusions equals declared.
- FR-020-025 — an empty attention tier is a valid outcome; no weak item is
  published to avoid emptiness.
- FR-020-005 — the same subject is never surfaced twice in the same generation, and
  this scope adds no second duplicate check and no way around the existing one.
- FR-020-038 — no destination value is modified, and every guard carries an
  adversarial case that fails when the guard is removed (P23).

## Gherkin Scenarios

```gherkin
Scenario: SCN-020-008 A public subject with a live tool deep link publishes
  Given a topic finding whose subject is inside the public watchlist scope
  And whose deep link is a tool that filed a tool read in this generation
  And whose verb is a research verb
  When it is routed to the attention tier
  Then it publishes as an attention item

Scenario: SCN-020-009 RLATTN-PRIVACY is honoured, not worked around
  Given a topic finding whose subject is outside the public watchlist scope
  When it is routed to the attention tier
  Then it is refused with the privacy code
  And the refusal is recorded in the attention exclusions channel with its code, field and reason
  And no attempt is made to substitute a different subject to force publication

Scenario: SCN-020-010 RLATTN-DEEPLINK is honoured
  Given a topic finding whose deep link is not among this generation's tool-read deep links
  When it is routed to the attention tier
  Then it is refused with the deep-link code
  And the refusal is recorded with its code, field and reason

Scenario: SCN-020-011 RLATTN-VERB is honoured
  Given a topic finding carrying a verb outside the research-verb vocabulary
  When it is routed to the attention tier
  Then it is refused with the verb code
  And the refusal is recorded with its code, field and reason

Scenario: SCN-020-012 RLATTN-OVERLAP is honoured
  Given a topic finding whose subject is already published in the action list this generation
  When it is routed to the attention tier
  Then it is refused with the overlap code
  And the reader is not told the same thing twice

Scenario: SCN-020-013 Built plus excluded equals declared
  Given a generation in which topic findings were routed to the attention tier
  When the published payload is inspected
  Then the number of built attention items plus the number of recorded exclusions equals the number declared
  And an empty attention tier is accepted as a valid outcome rather than padded
```

## Implementation Files

### New

- `tests/fixtures/research-routing/attention-public-subject.json`
- `tests/fixtures/research-routing/attention-private-subject.json`
- `tests/fixtures/research-routing/attention-unresolvable-deeplink.json`
- `tests/fixtures/research-routing/attention-overlapping-subject.json`
- `tests/fixtures/research-routing/attention-empty-tier.json`

### Modified

- `rlrouting.js` — the attention-decision branch and the exclusion-index pointer
- `scripts/build-attention-items.mjs` — accepts topic-originated candidates in the
  shape the step already composes from, with no change to any refusal
- `scripts/selftest.mjs` — one new assertion group
- `notes/research-routing.md` — the attention submission shape and the
  by-reference rule

## Implementation Plan

1. Submit through `scripts/build-attention-items.mjs` and therefore through the
   existing composer. The routing module supplies a candidate in the shape that
   step already accepts — an observed gate result plus the authored judgement keys
   — and authors no envelope field and no decision window. There is no parallel
   composition path and none is added.
2. Let the composer resolve the deep link itself. It resolves an item's link from
   the item's **first figure's** source id, looked up in the generation's tool
   reads, and refuses when that resolves nothing. Routing never authors a deep
   link, because an authored link is exactly how a finding could appear to have an
   owning source it does not have.
3. Record every refusal **by reference**. The composer writes the refusal into the
   attention exclusions channel with its own code, field and reason; the routing
   record carries the destination, the finding identifier and the index into that
   channel. It copies nothing. This is not a style choice: the publish gate
   validates that channel's code member against the composer's own frozen
   thirteen-code list, so an action-side reason placed there fails the gate and
   takes the whole payload down.
4. Withhold the subject in a refusal record wherever the composer's own rule
   withholds it, so a privacy refusal does not republish the value it just
   withheld. No other code withholds its subject.
5. Leave the composer's own balancing assertion — built plus excluded equals
   declared — exactly where it is. This scope asserts that it still holds with
   topic-originated candidates present; it does not add a second copy of it.
6. Never rename or re-key a subject. The existing overlap refusal is authoritative
   and this scope adds no second duplicate check and no way around it. Because the
   action list is composed first, the overlap check reads published truth rather
   than an evaluation-order artefact.
7. Leave an empty tier empty. The composer's own empty statement is the outcome; no
   weak item is published to avoid emptiness.
8. Register a `research-routing — attention submission` group in
   `scripts/selftest.mjs`, and record the submission shape and the by-reference
   rule in `notes/research-routing.md`.

## Named Missing Capability In This Scope

**A registered research surface filing a tool read.** The composer resolves an
attention item's link from its first figure's source id in the generation's tool
reads, so a web-sourced geopolitical or commodity finding that owns no tool read
resolves nothing and is refused on the deep-link code — every time, not
occasionally. While that capability is absent, this scope's deliverable is the
**refusal path**: every topic attention submission refuses on the deep-link code
and every refusal is recorded with the composer's own code, field and reason. The
action list and the alert pipeline are unaffected. The scope is executable and
completable either way; SCN-020-010 is the scenario that proves the refusal is
honest, and SCN-020-008 is proven against a fixture whose figure carries a source
id that resolves in the fixture generation.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `scripts/build-attention-items.mjs` | Accepts topic-originated candidates; no refusal changed | The published attention tier on every generation | High — this step's own header records three consecutive publishes emitting zero conforming items under an intact prose instruction and an armed gate; it is the file where advisory assumptions have already failed measurably | Run the step with zero topic candidates and assert the produced tier and exclusions are byte-identical to the pre-change run, BEFORE any topic candidate is submitted | Remove the acceptance; the existing authoring path is untouched by construction |
| `payload.attentionExclusions[]` | Written only by the composer, as today | The publish gate, the reader | **Highest in this scope** — the gate validates this array's code against the composer's frozen list, so a single action-side reason here fails the whole payload and the brief does not publish | Assert every recorded exclusion code is a member of the composer's own frozen list, and that no `RLROUTE-` code appears in the array at all | Nothing is written here by this feature; the pointer is removed with the branch |
| The composer's balancing assertion | Unchanged; asserted to still hold | The publish gate | Medium — a second copy of the assertion would drift from the original | Assert exactly one balancing assertion exists for the attention tier | The assertion is not modified |
| `rlattention.js` | Not modified | Everything attention | High — modifying a refusal to admit topic material is the failure condition the spec names first | Assert the file is byte-identical after this scope | It is never written |
| `rlrouting.js` | One decision branch and the index pointer added | Scopes 4–5 | Low | Assert the module still holds no destination threshold or vocabulary | Remove the branch |

## Change Boundary And Protected Paths

**Allowed:** `rlrouting.js` · `scripts/build-attention-items.mjs` ·
`tests/fixtures/research-routing/*.json` · `scripts/selftest.mjs` ·
`notes/research-routing.md`.

**Excluded (must remain byte-identical in this scope):**
`rlattention.js` · `rlmarketaction.js` · `rlagenda.js` ·
`scripts/recommendation-body.mjs` · `scripts/validate-brief-payload.mjs` ·
`scripts/brief-narrative-parallel.mjs` · `scripts/build-brief-page-artifacts.mjs` ·
`scripts/build-pages-site.mjs` · `scripts/evaluate-recommendations.mjs` ·
`scripts/brief-distributed-publish.mjs` · `market-brief.config.json` ·
`market-brief.page.json` · `market-brief.snapshot.json` · `market-brief.html` ·
`rlbrief.js` · `watchlist.json` · `tools.json` · `index.html` · `rlnav.js` ·
`site-exclusions.json`.

`watchlist.json` is excluded for a reason that is not stylistic: adding a subject
to it to make a privacy refusal go away would be working around the refusal rather
than honouring it, which SCN-020-009 forbids in as many words. `rlattention.js` is
excluded because a topic origin buys no exemption from any of its thirteen codes.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Owning module | `rlrouting.js` | The attention decision branch and the exclusion-index pointer. |
| Attention build step | `scripts/build-attention-items.mjs` | The only legitimate submission path; it accepts a candidate, it does not gain a refusal. |
| Attention fixtures | `tests/fixtures/research-routing/*.json` | The findings the refusals are proven against. |
| Project test harness | `scripts/selftest.mjs` | Where the deterministic group lives. |
| Notes | `notes/research-routing.md` | Where the submission shape and the by-reference rule are recorded. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Attention contract | `rlattention.js` | Its own module; consumed, never modified |
| Public scope | `watchlist.json` | Widening it to dodge a privacy refusal is forbidden by SCN-020-009 |
| Action destination | `scripts/recommendation-body.mjs`, `scripts/brief-narrative-parallel.mjs` | Scope 2 |
| Alert destination | `rlmarketaction.js` | Scope 4 |
| Ledger, scorecard and the refusal surface | `scripts/evaluate-recommendations.mjs`, `scripts/brief-distributed-publish.mjs`, `scripts/build-brief-page-artifacts.mjs`, `market-brief.html`, `rlbrief.js` | Scope 5 |

## Rollback

Remove the acceptance of topic candidates from
`scripts/build-attention-items.mjs` and the attention decision branch from
`rlrouting.js`; delete the five fixtures; remove the appended selftest group. Prove
the restore by running `node scripts/selftest.mjs` and
`node scripts/validate-brief-payload.mjs` and recording exit 0 for both with
unfiltered output, and by asserting the attention tier and its exclusions are
byte-identical to the pre-change run.

## Scenario-First RED/GREEN Contract

RED: author the six scenarios and the five fixtures first. Record an action-side
evaluability reason written into the attention exclusions channel and prove the
publish gate rejects the entire payload — that is the mechanical reason refusals
are recorded by reference rather than copied. Record a private subject publishing
because the routing module approximated the scope check itself instead of calling
the composer.

GREEN: the public-subject fixture publishes as an attention item; the private,
unresolvable-deep-link, execution-verb and overlapping fixtures each refuse with
the composer's own code, field and reason, recorded in the composer's own channel
with the routing record pointing at the index; the balance holds; the empty-tier
fixture publishes zero items and is not padded; and no routing code appears in the
attention exclusions array at all.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Composition | integration | SCN-020-008 | `scripts/selftest.mjs` | a topic finding whose subject is inside the public watchlist scope, whose deep link resolves to a tool that filed a tool read in this generation, and whose verb is a research verb publishes as an attention item through the existing build step and composer | `node scripts/selftest.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | No parallel path | integration | SCN-020-008 | `scripts/selftest.mjs` | Regression: every published topic attention item passed through the existing composer, and the repository contains no second composition path for an attention item | `node scripts/selftest.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Refusal | integration | SCN-020-009 | `scripts/selftest.mjs` | a topic finding whose subject is outside the public watchlist scope is refused with the composer's own privacy code, the refusal is recorded in the attention exclusions channel with its code, field and reason, and no substitute subject is attempted to force publication | `node scripts/selftest.mjs` | No | `report.md#tp-03-03` |
| TP-03-04 | Withholding | integration | SCN-020-009 | `scripts/selftest.mjs` | a privacy refusal record does not republish the subject the refusal just withheld, following the composer's own withholding rule, and no other code withholds its subject | `node scripts/selftest.mjs` | No | `report.md#tp-03-04` |
| TP-03-05 | Refusal | integration | SCN-020-010 | `scripts/selftest.mjs` | a topic finding whose deep link is not among this generation's tool-read deep links is refused with the composer's own deep-link code and the refusal is recorded with its code, field and reason | `node scripts/selftest.mjs` | No | `report.md#tp-03-05` |
| TP-03-06 | Refusal | integration | SCN-020-010 | `scripts/selftest.mjs` | the deep link is resolved by the composer from the item's first figure's source id and is never authored by routing, so a finding cannot appear to have an owning source it does not have | `node scripts/selftest.mjs` | No | `report.md#tp-03-06` |
| TP-03-07 | Refusal | integration | SCN-020-011 | `scripts/selftest.mjs` | a topic finding carrying a verb outside the research-verb vocabulary is refused with the composer's own verb code and the refusal is recorded with its code, field and reason | `node scripts/selftest.mjs` | No | `report.md#tp-03-07` |
| TP-03-08 | Refusal | integration | SCN-020-012 | `scripts/selftest.mjs` | a topic finding whose subject is already published in the action list this generation is refused with the composer's own overlap code, so the reader is not told the same thing twice | `node scripts/selftest.mjs` | No | `report.md#tp-03-08` |
| TP-03-09 | Adversarial | integration | SCN-020-012 | `scripts/selftest.mjs` | Regression: renaming or re-keying a subject to evade the overlap check is proven not to publish, and no second duplicate check exists that could disagree with the composer's own | `node scripts/selftest.mjs` | No | `report.md#tp-03-09` |
| TP-03-10 | Balance | integration | SCN-020-013 | `scripts/selftest.mjs` | with topic findings routed to the attention tier, the number of built attention items plus the number of recorded exclusions equals the number declared, and exactly one balancing assertion exists for the tier | `node scripts/selftest.mjs` | No | `report.md#tp-03-10` |
| TP-03-11 | No padding | integration | SCN-020-013 | `scripts/selftest.mjs` | an empty attention tier is accepted as a valid outcome and carries the composer's own empty statement rather than a weak item published to avoid emptiness | `node scripts/selftest.mjs` | No | `report.md#tp-03-11` |
| TP-03-12 | Adversarial | integration | SCN-020-013 | `scripts/validate-brief-payload.mjs` | Regression: an action-side evaluability reason written into the attention exclusions channel is proven to fail the publish gate and reject the whole payload — which is the mechanical reason routing refusals are recorded by reference into a separate key rather than copied into that channel | `node scripts/validate-brief-payload.mjs` | No | `report.md#tp-03-12` |
| TP-03-13 | By reference | unit | SCN-020-013 | `scripts/selftest.mjs` | the routing record carries the destination, the finding identifier and the index into the attention exclusions channel, and copies no code, field or reason from it; no routing code appears in the attention exclusions array | `node scripts/selftest.mjs` | No | `report.md#tp-03-13` |
| TP-03-14 | No mutation | unit | SCN-020-008 | `scripts/selftest.mjs` | Regression: the attention contract module and the public watchlist scope are byte-identical after this scope, so no refusal was weakened and no subject was added to make a privacy refusal go away | `node scripts/selftest.mjs` | No | `report.md#tp-03-14` |

### Definition of Done

- [ ] SCN-020-008 — a topic finding whose subject is inside the public watchlist scope, whose deep link is a tool that filed a tool read in this generation, and whose verb is a research verb publishes as an attention item, proven by TP-03-01 and TP-03-02.
- [ ] SCN-020-009 — a subject outside the public watchlist scope is refused with the privacy code, the refusal is recorded in the attention exclusions channel with its code, field and reason, and no attempt is made to substitute a different subject to force publication, proven by TP-03-03 and TP-03-04.
- [ ] SCN-020-010 — a deep link that is not among this generation's tool-read deep links is refused with the deep-link code and the refusal is recorded with its code, field and reason, proven by TP-03-05 and TP-03-06.
- [ ] SCN-020-011 — a verb outside the research-verb vocabulary is refused with the verb code and the refusal is recorded with its code, field and reason, proven by TP-03-07.
- [ ] SCN-020-012 — a subject already published in the action list this generation is refused with the overlap code and the reader is not told the same thing twice, proven by TP-03-08 and TP-03-09.
- [ ] SCN-020-013 — built attention items plus recorded exclusions equals the number declared, and an empty attention tier is accepted as a valid outcome rather than padded, proven by TP-03-10 and TP-03-11.
- [ ] Composition goes through the existing build step and composer only; no parallel path exists (FR-020-018), proven by TP-03-02.
- [ ] The deep link is composer-resolved and never authored by routing (FR-020-020), proven by TP-03-06.
- [ ] Refusals are recorded by reference: the routing record points at the exclusion index and copies nothing, and no routing code appears in the attention exclusions array (FR-020-023), proven by TP-03-13.
- [ ] An action-side reason in the attention exclusions channel is proven to fail the publish gate, which is why the separate key exists, proven by TP-03-12.
- [ ] `rlattention.js` and `watchlist.json` are byte-identical at the end of this scope; no refusal was weakened and the public scope was not widened to dodge a refusal (FR-020-038), proven by TP-03-14.
- [ ] The composer's own balancing assertion is unchanged and no second copy of it exists, proven by TP-03-10.
- [ ] `node scripts/selftest.mjs` exits 0 with the attention group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/validate-brief-payload.mjs` exits 0, proven by TP-03-12.
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
- [ ] TP-03-13 executed with raw output recorded at `report.md#tp-03-13`.
- [ ] TP-03-14 executed with raw output recorded at `report.md#tp-03-14`.
