# Scope 1: Routable Finding Contract And Injected Adjudication

## 01-routable-finding-contract

**Status:** Not started
**Scope-Kind:** capability-foundation
**Tags:** foundation, contract, injected-adjudication, closed-vocabulary, named-refusal
Depends On: none — this is the only root scope
Foundation: true

**Primary Outcome:** `rlrouting.js` exists as the single UMD module owning
`routable-finding/v1`, the closed destination vocabulary, the declared dispatch
order, the `research-routing/v1` decision record and the twelve `RLROUTE-*`
refusal codes. Destination eligibility is decided by **injected adjudicators**, so
the module holds no threshold it could shadow and no rule it could approximate; a
destination with no supplied adjudicator is refused by name rather than guessed
at. A finding missing any required member is refused rather than defaulted. Every
routable finding produces at least one recorded decision, and the record balances.
Nothing is routed into a live destination in this scope.

## Requirement Coverage

- FR-020-001 — a routable finding carries its subject, its claim, its evidence with
  observation date and source, its horizon, its originating topic identifier and
  the dossier version it came from.
- FR-020-002 — the routable-finding shape and the destination-eligibility dispatch
  are defined in exactly one module, read by every consumer (P19).
- FR-020-003 — a finding missing any required member is refused by name; no member
  is defaulted, inferred or synthesised.
- FR-020-004 — destination eligibility is decided by each destination's own
  existing contract, never re-implemented or approximated inside the routing
  module.
- FR-020-005 — a finding may be eligible for more than one destination, but the
  same subject is never surfaced twice in the same generation. The dispatch order
  is what makes the existing overlap refusal authoritative rather than
  order-dependent.
- FR-020-006 — the routing module does not mutate, weaken or shadow any
  destination contract's thresholds or vocabularies.
- FR-020-007 — every routing decision, positive or negative, is recorded with the
  destination it targeted and the outcome (P21).
- FR-020-021 (pre-check half) — a verb outside the existing research-verb
  vocabulary is refused `RLROUTE-VERB` before any submission. The composer-side
  refusal is scope 3.
- FR-020-038 (guard half) — every guard introduced here carries an adversarial case
  that fails when the guard is removed (P23).
- NFR-020-001 — routing is deterministic: the same findings and generation state
  produce the same decisions and the same refusal set.
- NFR-020-002 — no eligibility decision requires network access.

## Gherkin Scenarios

```gherkin
Scenario: SCN-020-001 The finding contract is destination-agnostic and complete
  Given a topic dossier finding emitted for routing
  When it is validated against the routable-finding contract
  Then it carries its subject, its claim, its evidence with date and source, and its horizon
  And it carries the originating topic identifier and dossier version
  And a finding missing any required member is refused by name rather than defaulted

Scenario: SCN-020-002 One definition per concept
  Given the routable-finding contract
  When the repository is inspected for its definition
  Then exactly one module defines the shape and the destination-eligibility rules
  And every consumer reads them from that module rather than re-declaring them
```

## Implementation Files

### New

- `rlrouting.js` — the single UMD owning module
- `tests/fixtures/research-routing/finding-complete.json`
- `tests/fixtures/research-routing/finding-missing-subject.json`
- `tests/fixtures/research-routing/finding-missing-evidence-source.json`
- `tests/fixtures/research-routing/finding-execution-verb.json`
- `tests/fixtures/research-routing/dossier-source.json` — a `research-dossier/v1`
  shaped fixture the projection reads

### Modified

- `scripts/selftest.mjs` — one new assertion group
- `notes/README.md` — the notes-index row for the routing note
- `notes/research-routing.md` — the contract, the dispatch order and the refusal
  table

## Implementation Plan

1. Author `rlrouting.js` as a UMD dual module at the repository root beside
   `rlattention.js`, `rlmarketaction.js` and `rlagenda.js`. Never ESM, no build
   step, loadable from `file://` (P10). Loaded in Node with
   `createRequire(import.meta.url)`, exactly as `scripts/build-attention-items.mjs`
   loads `rlattention.js`, so the collector, the publish gate and the browser hold
   the identical frozen object.
2. Freeze `CONTRACT_VERSION`, `RECORD_CONTRACT_VERSION`, `DESTINATIONS`,
   `DECISION_STATES` and `REFUSAL_CODES`. The twelve `RLROUTE-*` codes are the
   refusals **this feature itself** raises; none of them shadows, restates or
   replaces a destination's own code.
3. Implement `validateRoutableFinding(finding)` as a top-level `function`
   declaration. A missing `subject`, `claim`, `evidence[].observedAt`,
   `evidence[].source`, `horizon`, `originTopicId` or `originDossierRef` is
   `RLROUTE-INCOMPLETE` with the field named. No branch supplies a default.
4. Implement `fromDossierFinding(dossier, finding)` projecting a dossier finding
   into a routable finding. `horizon` is **copied**, never re-chosen — it is the
   anchor the horizon-fidelity guard in scope 2 compares against, and it is only
   trustworthy because the dossier version file it comes from is immutable.
5. Read the research-verb vocabulary from the existing alert module's own frozen
   list rather than restating it, and refuse `RLROUTE-VERB` before any submission.
   Anchor to the owning list and refuse to compose if the anchor disappears,
   following the pattern the attention build step already uses for its own code
   anchor — a literal copy would silently diverge the first time the owning list
   changed.
6. Implement `routeFinding(finding, adjudicators, context)` returning an array of
   decisions. Dispatch in the declared order action → attention → alert. Action is
   first because a subject already carried by an action is an overlap refusal at
   the attention tier, so deciding attention first would make that refusal depend
   on evaluation order rather than on published truth. Alert is last because it is
   the only destination whose terminal state is *gated* rather than published.
7. Refuse `RLROUTE-ADJUDICATOR` when the module is asked to route a destination for
   which no adjudicator was supplied. This is the property that makes FR-020-004
   structural: there is no code path in which the module could decide eligibility
   itself, because it holds no destination rule to decide with.
8. Implement `buildRoutingRecord(decisions, declaredCount)` producing
   `research-routing/v1`, and assert inside it that every routable finding has at
   least one decision and that the count of distinct decided finding identifiers
   equals `declaredFindingCount`. A finding with no decision is the silent discard
   this feature exists to remove.
9. Publish `selectionOrder` verbatim in the record so the order the reader is told
   about and the order the code applied are one string rather than two descriptions
   that can drift.
10. Register a `research-routing — finding contract and dispatch` group in
    `scripts/selftest.mjs`, and record the contract, the dispatch order and the
    refusal table in `notes/research-routing.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `rlrouting.js` (new root module) | Created | Scopes 2–5, the publish gate, the browser | High — a second copy of any destination's threshold or vocabulary anywhere in this module permanently breaks FR-020-006, and the breakage is invisible until a threshold moves | Scan the module for any numeric threshold, cap or vocabulary belonging to a destination and assert there are none, BEFORE any adjudicator is wired | Delete the file; nothing consumes it until scope 2 |
| The adjudicator seam | Created | All three destinations | High — an adjudicator that is imported rather than injected reintroduces exactly the coupling FR-020-004 forbids | Assert a route request with no adjudicator refuses by name rather than returning any eligibility verdict | Remove the seam |
| The research-verb anchor | Read from the owning module's frozen list | Scope 3's submissions | Medium — a literal copy diverges silently the first time the owning list changes | Assert the anchor resolves against the owning list at load, and that composition refuses if it disappears | Remove the pre-check; the composer still refuses on its own code |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Every case drives a committed fixture | Remove the appended group |
| `notes/README.md` | One index row | The notes index | Low | The row points at a file created in this scope | Revert the row |

## Change Boundary And Protected Paths

**Allowed:** `rlrouting.js` · `tests/fixtures/research-routing/*.json` ·
`scripts/selftest.mjs` · `notes/research-routing.md` · `notes/README.md`.

**Excluded (must remain byte-identical in this scope):**
`rlattention.js` · `rlmarketaction.js` · `rlagenda.js` ·
`scripts/build-attention-items.mjs` · `scripts/recommendation-body.mjs` ·
`scripts/validate-brief-payload.mjs` · `scripts/brief-narrative-parallel.mjs` ·
`scripts/build-brief-page-artifacts.mjs` · `scripts/build-pages-site.mjs` ·
`scripts/evaluate-recommendations.mjs` · `scripts/brief-distributed-publish.mjs` ·
`market-brief.config.json` · `market-brief.payload.json` ·
`market-brief.page.json` · `market-brief.snapshot.json` · `market-brief.html` ·
`rlbrief.js` · `watchlist.json` · `tools.json` · `index.html` · `rlnav.js` ·
`site-exclusions.json`.

The three destination modules are on the excluded list for a reason that is not
stylistic: this scope's entire design is that they are called and never changed, so
a diff touching any of them is by itself evidence the module took a rule it does
not own.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Owning module | `rlrouting.js` | The deliverable. |
| Routing fixtures | `tests/fixtures/research-routing/*.json` | The findings the contract and the refusals are proven against. `tests/fixtures` is already in the frozen `PUBLIC_DIRECTORIES` list at `scripts/build-pages-site.mjs:13`, so no publication rule changes. |
| Project test harness | `scripts/selftest.mjs` | Where the deterministic group lives. |
| Notes | `notes/research-routing.md`, `notes/README.md` | Where the contract and the dispatch order are recorded. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Action destination | `scripts/recommendation-body.mjs`, `scripts/validate-brief-payload.mjs` | Their own contracts; called through an injected adjudicator in scope 2 |
| Attention destination | `rlattention.js`, `scripts/build-attention-items.mjs` | Their own contracts; called in scope 3 |
| Alert destination | `rlmarketaction.js` | Its own contract; called in scope 4 |
| Upstream finding source | `rlagenda.js` | Feature 019 — this feature consumes a finding and never redefines one |
| Publish and page path | `scripts/brief-narrative-parallel.mjs`, `scripts/build-brief-page-artifacts.mjs` | Scopes 2–5 |

## Rollback

Delete `rlrouting.js`, the five fixtures and `notes/research-routing.md`; remove
the appended selftest group and the `notes/README.md` row. Prove the restore by
running `node scripts/selftest.mjs` and recording exit 0 with unfiltered output.
Nothing downstream is affected, because no adjudicator is wired until scope 2.

## Scenario-First RED/GREEN Contract

RED: author the two scenarios and the five fixtures first. Record the
missing-subject fixture routing successfully before `RLROUTE-INCOMPLETE` exists —
the defaulted-member defect the refusal removes. Record a route request with no
adjudicator returning an eligibility verdict of its own before
`RLROUTE-ADJUDICATOR` exists; that is the approximation FR-020-004 forbids, and it
is the failure that looks most like success.

GREEN: the complete fixture validates and produces one decision per attempted
destination; each incomplete fixture is refused with the offending field named and
zero defaulted members; a route request with a missing adjudicator refuses by name
and returns no verdict; the execution-verb fixture is refused before any
submission; the record balances; and the whole dispatch runs with global `fetch`
stubbed to throw.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Contract | unit | SCN-020-001 | `scripts/selftest.mjs` | a complete topic dossier finding emitted for routing validates and carries its subject, its claim, its evidence with observation date and source, its horizon, its originating topic identifier and its dossier version | `node scripts/selftest.mjs` | No | `report.md#tp-01-01` |
| TP-01-02 | Refusal | unit | SCN-020-001 | `scripts/selftest.mjs` | a finding missing any required member — subject, claim, evidence observation date, evidence source, horizon, originating topic identifier or dossier version — is refused `RLROUTE-INCOMPLETE` by name with the offending field, and no member is defaulted, inferred or synthesised | `node scripts/selftest.mjs` | No | `report.md#tp-01-02` |
| TP-01-03 | Adversarial | unit | SCN-020-001 | `scripts/selftest.mjs` | Regression: a mutated validator that supplies a default for a missing member is proven to route an incomplete finding — the refusal guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-01-03` |
| TP-01-04 | Projection | unit | SCN-020-001 | `scripts/selftest.mjs` | the projection from a dossier finding copies `horizon` verbatim rather than re-choosing it, so the value the horizon-fidelity guard compares against comes from the immutable dossier version | `node scripts/selftest.mjs` | No | `report.md#tp-01-04` |
| TP-01-05 | Single-definition | unit | SCN-020-002 | `scripts/selftest.mjs` | exactly one module defines the routable-finding shape and the destination-eligibility dispatch; the repository is scanned for a second declaration of the contract version, the destination vocabulary, the decision states or the refusal codes and exactly one of each exists | `node scripts/selftest.mjs` | No | `report.md#tp-01-05` |
| TP-01-06 | Injected adjudication | unit | SCN-020-002 | `scripts/selftest.mjs` | every consumer reads eligibility from the destination's own contract rather than re-declaring it: a route request for a destination with no supplied adjudicator is refused `RLROUTE-ADJUDICATOR` and returns no eligibility verdict of its own | `node scripts/selftest.mjs` | No | `report.md#tp-01-06` |
| TP-01-07 | No-shadow | unit | SCN-020-002 | `scripts/selftest.mjs` | Regression: the module source contains no numeric threshold, cap, score, minimum or vocabulary belonging to any destination, so there is nothing it could shadow or weaken | `node scripts/selftest.mjs` | No | `report.md#tp-01-07` |
| TP-01-08 | Dispatch | unit | SCN-020-001 | `scripts/selftest.mjs` | the declared dispatch order is action then attention then alert, the published `selectionOrder` string matches the order actually applied, and a finding eligible for more than one destination still yields one decision per destination attempted | `node scripts/selftest.mjs` | No | `report.md#tp-01-08` |
| TP-01-09 | Verb pre-check | unit | SCN-020-001 | `scripts/selftest.mjs` | a finding carrying a verb outside the existing research-verb vocabulary is refused `RLROUTE-VERB` before any submission, and the vocabulary is read from the owning module's frozen list rather than restated as a literal | `node scripts/selftest.mjs` | No | `report.md#tp-01-09` |
| TP-01-10 | Balance | unit | SCN-020-001 | `scripts/selftest.mjs` | Regression: every routable finding has at least one recorded decision and the count of distinct decided finding identifiers equals the declared finding count; a mutated recorder that drops a finding is proven to fail the assertion | `node scripts/selftest.mjs` | No | `report.md#tp-01-10` |
| TP-01-11 | Determinism | unit | SCN-020-001 | `scripts/selftest.mjs` | Regression: the same findings and the same generation state produce a byte-identical decision record across repeated runs, and the whole dispatch runs with global `fetch` stubbed to throw | `node scripts/selftest.mjs` | No | `report.md#tp-01-11` |
| TP-01-12 | Path guard | unit | SCN-020-002 | `scripts/validate-spec-test-paths.mjs` | the spec-artifact test-path guard reports zero new missing paths for this scope's artifacts | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-01-12` |

### Definition of Done

- [ ] SCN-020-001 — a topic dossier finding emitted for routing carries its subject, its claim, its evidence with date and source, its horizon, its originating topic identifier and its dossier version, and a finding missing any required member is refused by name rather than defaulted, proven by TP-01-01, TP-01-02 and TP-01-03.
- [ ] SCN-020-002 — exactly one module defines the routable-finding shape and the destination-eligibility rules, and every consumer reads them from that module rather than re-declaring them, proven by TP-01-05, TP-01-06 and TP-01-07.
- [ ] `rlrouting.js` is UMD, loadable from `file://`, requires no build step, and is loaded in Node through `createRequire` so all consumers hold the identical frozen object.
- [ ] Every public function in `rlrouting.js` is authored as a top-level `function name(...)` declaration, so `extractFn` in `scripts/selftest.mjs:46` can extract it for headless testing.
- [ ] Adjudicators are injected: a destination with no supplied adjudicator is refused `RLROUTE-ADJUDICATOR` and the module returns no eligibility verdict of its own (FR-020-004), proven by TP-01-06.
- [ ] The module holds no threshold, cap, score, minimum or vocabulary belonging to any destination (FR-020-006), proven by TP-01-07.
- [ ] The twelve `RLROUTE-*` codes are members of one frozen array and none of them shadows, restates or replaces a destination's own code.
- [ ] `horizon` is copied from the immutable dossier finding rather than re-chosen, proven by TP-01-04.
- [ ] The declared dispatch order is action then attention then alert, and the published order string is the order applied (FR-020-005), proven by TP-01-08.
- [ ] A verb outside the research-verb vocabulary is refused before any submission, with the vocabulary anchored to the owning module's frozen list rather than restated (FR-020-021), proven by TP-01-09.
- [ ] Every routing decision, positive or negative, is recorded with its destination and outcome, and the record balances (FR-020-007), proven by TP-01-10.
- [ ] Routing is deterministic and requires no network access (NFR-020-001, NFR-020-002), proven by TP-01-11.
- [ ] `node scripts/selftest.mjs` exits 0 with the new group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths, proven by TP-01-12.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] TP-01-01 executed with raw output recorded at `report.md#tp-01-01`.
- [ ] TP-01-02 executed with raw output recorded at `report.md#tp-01-02`.
- [ ] TP-01-03 executed with raw output recorded at `report.md#tp-01-03`.
- [ ] TP-01-04 executed with raw output recorded at `report.md#tp-01-04`.
- [ ] TP-01-05 executed with raw output recorded at `report.md#tp-01-05`.
- [ ] TP-01-06 executed with raw output recorded at `report.md#tp-01-06`.
- [ ] TP-01-07 executed with raw output recorded at `report.md#tp-01-07`.
- [ ] TP-01-08 executed with raw output recorded at `report.md#tp-01-08`.
- [ ] TP-01-09 executed with raw output recorded at `report.md#tp-01-09`.
- [ ] TP-01-10 executed with raw output recorded at `report.md#tp-01-10`.
- [ ] TP-01-11 executed with raw output recorded at `report.md#tp-01-11`.
- [ ] TP-01-12 executed with raw output recorded at `report.md#tp-01-12`.
