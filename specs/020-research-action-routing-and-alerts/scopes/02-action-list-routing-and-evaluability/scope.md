# Scope 2: Action-List Routing And Born-Evaluable Emission

## 02-action-list-routing-and-evaluability

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** born-evaluable, cap, never-displace, determinism, structural-loophole
Depends On: Scope 1 — the finding contract and the injected adjudicator seam

**Primary Outcome:** A topic finding becomes a brief action only when it satisfies
the full existing action field contract **and**, for a swing or tactical horizon,
is born evaluable — its subject is in the committed instrument universe and its
invalidation carries a direction-correct numeric level. The check happens **before
emission**, so an unscoreable topic claim is never in the payload and the whole
brief is never at risk. Topic actions are composed by the collector, never
suggested to a lane in prose. They fill free slots only, never displace an
authored action, and the configured maximum is never exceeded. The structural
relabelling loophole is closed by two independent guards.

## Requirement Coverage

- FR-020-008 — a routed topic action satisfies the full existing action contract:
  an action family from the closed five, plus subject, rationale, horizon,
  structural anchor, trigger, invalidation, confidence and deep link.
- FR-020-009 — a swing or tactical topic call names at least one instrument present
  in the committed instrument universe.
- FR-020-010 — a swing or tactical topic call carries an invalidation with a
  direction-correct numeric price level.
- FR-020-011 — a swing or tactical call failing either is not emitted and produces
  a named exclusion carrying the evaluability reason the existing body builder
  resolves.
- FR-020-012 — the published action count never exceeds the configured maximum.
- FR-020-013 — over the cap, selection follows a declared deterministic order and
  every unplaced finding produces a named exclusion with a cap reason.
- FR-020-014 — routing never displaces an existing action; the published list after
  routing contains every action it contained before, unchanged and in its original
  relative order.
- FR-020-015 — a structural-horizon finding is not presented as a scored
  directional call and is not routed around the evaluability rule by relabelling
  its horizon.
- FR-020-016 — a topic-originated action carries its originating topic identifier
  so its outcome can be attributed later.
- FR-020-017 — routing never causes the publication gate to fail the whole brief;
  an unscoreable topic claim is withheld while the rest publishes.
- FR-020-038 — no destination value is modified, and every guard carries an
  adversarial case that fails when the guard is removed (P23).
- NFR-020-001 — the same findings and generation state produce the same selection.
- NFR-020-003 — the cap figure is asserted by a test that can actually fail (P22).

## Gherkin Scenarios

```gherkin
Scenario: SCN-020-003 A committed-universe subject with a real invalidation level publishes
  Given a topic finding naming an instrument present in the committed instrument universe
  And an invalidation carrying a direction-correct numeric price level
  When it is routed to the brief action list
  Then it publishes as an action with an action family, subject, rationale, horizon, structural anchor, trigger, invalidation, confidence and deep link
  And its evaluability resolves to machine-checkable rather than not-evaluable

Scenario: SCN-020-004 An out-of-universe swing call is withheld and named
  Given a topic finding whose only instrument is outside the committed instrument universe
  And the finding's horizon is swing or tactical
  When it is routed to the brief action list
  Then it is not emitted as an action
  And a named exclusion records the reason no-instrument-in-committed-universe
  And the rest of the brief still publishes

Scenario: SCN-020-005 An unfalsifiable call cannot inflate the hit rate
  Given a topic finding whose invalidation carries no attributable direction-correct price level
  And the finding's horizon is swing or tactical
  When it is routed to the brief action list
  Then it is not emitted as an action
  And a named exclusion records the missing invalidation level as the reason

Scenario: SCN-020-006 Topic actions fill free slots only
  Given the action list already carries actions and the configured maximum is five
  And more qualifying topic findings exist than remaining slots
  When routing selects actions
  Then the published action count does not exceed the configured maximum
  And every action present before routing is still present afterwards, unchanged and in its original order
  And every unplaced qualifying finding is recorded as a named exclusion with a cap reason
  And no topic finding is published by removing or overwriting an existing action

Scenario: SCN-020-007 Structural horizon is out of the evaluability rule's scope
  Given a topic finding whose horizon is structural
  When it is routed to the brief action list
  Then the swing and tactical evaluability rule does not apply to it
  And it is published only if it satisfies the full action contract on its own terms
  And it is not presented to the reader as a scored directional call
```

## Implementation Files

### New

- `tests/fixtures/research-routing/action-in-universe.json`
- `tests/fixtures/research-routing/action-out-of-universe.json`
- `tests/fixtures/research-routing/action-no-invalidation-level.json`
- `tests/fixtures/research-routing/action-over-cap.json`
- `tests/fixtures/research-routing/action-structural-relabelled.json`
- `tests/fixtures/research-routing/payload-preexisting-actions.json`

### Modified

- `rlrouting.js` — `selectForCap`, the action-decision branch, `RLROUTE-CAP`,
  `RLROUTE-DISPLACE`, `RLROUTE-HORIZON`, `RLROUTE-STRUCTURAL-SCORED`
- `scripts/brief-narrative-parallel.mjs` — the collector composition step that
  builds candidate topic actions and appends them to the action list after every
  fragment is assigned
- `scripts/selftest.mjs` — one new assertion group
- `notes/research-routing.md` — the emission order and the two structural guards

## Implementation Plan

1. Compose topic actions **in the collector**, after every fragment is assigned —
   never by asking a lane to adopt them. The repository has already measured the
   cost of the advisory approach: the attention build step's own header records
   three consecutive cron publishes emitting zero conforming items while a prose
   instruction naming every required field was intact and the gate was armed. The
   fix that worked was structural. This is a collector write, so no lane's declared
   key set widens.
2. Compute `remainingSlots` as the configured maximum minus the current action
   count, reading the figure from the committed config rather than restating it.
3. Order the routable findings by the single declared order — evidence recency,
   then severity, then originating topic identifier, then finding identifier — and
   build each candidate under the full action field contract with the originating
   topic identifier attached.
4. Run the injected action adjudicator, which is the existing recommendation body
   builder plus the existing action field contract. For a swing or tactical
   candidate, emit only when evaluability resolves machine-checkable. Otherwise
   record a refusal carrying the **exact** reason the body builder resolved — one
   of its three real values — never a paraphrase and never a generic message.
5. Because the refusal happens before emission, the drop-unscoreable path never has
   to drop a topic action: an unscoreable topic claim was never in the payload, so
   the whole-brief publication is never at risk from routing.
6. Append while `remainingSlots > 0`; every further qualifying finding is
   `RLROUTE-CAP` with a reason naming the limit and its position in line.
7. Assert never-displace as an invariant rather than recording a displacement:
   refuse `RLROUTE-DISPLACE` and stop if the post-routing action list is not a
   superset of the pre-routing one, in the original relative order. An invariant
   that is asserted cannot be forgotten; a record that is written can be written
   wrongly. The record channel exists so a future policy permitting displacement
   could not be silent, but no current path produces one.
8. Close the structural loophole with two independent guards. The scored-horizon
   set is exactly tactical and swing, and the unscoreable-action scan returns early
   for any other horizon, so a topic call could otherwise dodge evaluability
   entirely by carrying a structural label.
   - **`RLROUTE-HORIZON`** — the emitted action's horizon must equal the
     originating dossier finding's horizon. The dossier version file is immutable,
     so the comparison is against a value that cannot be edited to match after the
     fact.
   - **`RLROUTE-STRUCTURAL-SCORED`** — a structural topic action is refused when
     its own prose resolves both a trigger level and a direction-correct
     invalidation level, that is, when it would have been machine-checkable had it
     been labelled swing. A structural read carrying a full scored directional
     level pair is a tactical call wearing a structural label.
   Both are kept because they fail on different mutations. A guard only one
   adversarial case can reach is a guard with one blind spot.
9. Render a structural topic action on its own terms, with no scored-call framing
   and no trigger-and-invalidation theatre.
10. Register a `research-routing — action emission` group in
    `scripts/selftest.mjs`, and record the emission order and both guards in
    `notes/research-routing.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `scripts/brief-narrative-parallel.mjs` | One collector composition step after the fragment assign | Every scheduled generation of the entire brief | **Highest in this scope** — this file publishes the whole brief; a step that throws loses the brief rather than the routing | Run the collector with zero routable findings and assert the produced payload is byte-identical to the pre-change run, BEFORE any topic action is composed | Remove the composition step; the four lanes are untouched by construction |
| `payload.nextSession.actions[]` | Topic actions appended into free slots only | The reader, the outcome ledger, the scorecard | **Highest in the feature** — an authored action disappearing is invisible in a diff of a generated file and permanent in the append-only ledger | Assert the post-routing list is a superset of the pre-routing list in original order, on every run, and refuse rather than record a violation | Remove the append; pre-existing actions are never mutated |
| The action field contract and the evaluability rule | Consumed through an injected adjudicator; not modified | Every action in the brief | High — re-implementing the rule to predict an outcome, even "for the UI", is exactly FR-020-004 | Assert the two source files are byte-identical after this scope | They are never written |
| The configured action maximum | Read, never restated | The cap assertion | Medium — a restated literal diverges the first time the config changes | Assert the cap enforced equals the committed figure, with the figure read at run time | The read is removed with the step |
| `rlrouting.js` | Four codes and one selection function added | Scopes 3–5 | Medium | Assert the module still holds no destination threshold | Remove the additions |

## Change Boundary And Protected Paths

**Allowed:** `rlrouting.js` · `scripts/brief-narrative-parallel.mjs` ·
`tests/fixtures/research-routing/*.json` · `scripts/selftest.mjs` ·
`notes/research-routing.md`.

**Excluded (must remain byte-identical in this scope):**
`scripts/recommendation-body.mjs` · `scripts/validate-brief-payload.mjs` ·
`rlattention.js` · `rlmarketaction.js` · `rlagenda.js` ·
`scripts/build-attention-items.mjs` · `scripts/build-brief-page-artifacts.mjs` ·
`scripts/build-pages-site.mjs` · `scripts/evaluate-recommendations.mjs` ·
`scripts/brief-distributed-publish.mjs` · `market-brief.config.json` ·
`market-brief.page.json` · `market-brief.snapshot.json` · `market-brief.html` ·
`rlbrief.js` · `watchlist.json` · `data/bars/**` · `data/options/**` ·
`tools.json` · `index.html` · `rlnav.js` · `site-exclusions.json`.

`data/bars/**`, `data/options/**` and `watchlist.json` are excluded for a reason
that is not stylistic: they are the committed instrument universe, and expanding it
to make a topic finding scoreable is explicitly a non-goal. A diff there is by
itself evidence the scope took the forbidden shortcut.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Owning module | `rlrouting.js` | Selection, the cap and the two structural guards belong to the one owning module. |
| Collector composition | `scripts/brief-narrative-parallel.mjs` | Where topic actions are composed deterministically rather than requested in prose. |
| Action fixtures | `tests/fixtures/research-routing/*.json` | The findings and payloads the emission rules are proven against. |
| Project test harness | `scripts/selftest.mjs` | Where the deterministic group lives. |
| Notes | `notes/research-routing.md` | Where the emission order and the guards are recorded. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Committed instrument universe | `data/bars/**`, `data/options/**`, `watchlist.json` | Expanding it is Non-Goal 5 |
| Evaluability rule and publish gate | `scripts/recommendation-body.mjs`, `scripts/validate-brief-payload.mjs` | Their own contracts; consumed, never modified |
| Attention destination | `rlattention.js`, `scripts/build-attention-items.mjs` | Scope 3 |
| Alert destination | `rlmarketaction.js` | Scope 4 |
| Ledger, scorecard and the refusal surface | `scripts/evaluate-recommendations.mjs`, `scripts/brief-distributed-publish.mjs`, `scripts/build-brief-page-artifacts.mjs`, `market-brief.html`, `rlbrief.js` | Scope 5 |

## Rollback

Remove the collector composition step from `scripts/brief-narrative-parallel.mjs`
and the four codes and selection function from `rlrouting.js`; delete the six
fixtures; remove the appended selftest group. Prove the restore by running
`node scripts/selftest.mjs` and `node scripts/validate-brief-payload.mjs` and
recording exit 0 for both with unfiltered output, and by asserting the collector
produces a payload byte-identical to the pre-change run.

## Scenario-First RED/GREEN Contract

RED: author the five scenarios and the six fixtures first. Record the
out-of-universe swing finding publishing as an action before the born-evaluable
check exists — an unfalsifiable call that reaches the append-only ledger and can
never be retro-scored. Record the over-cap fixture publishing six actions with a
maximum of five. Record a pre-existing authored action disappearing when a topic
action is appended. Record the relabelled fixture publishing as structural and
escaping the evaluability scan entirely.

GREEN: the in-universe fixture publishes with every contract field and resolves
machine-checkable; the out-of-universe and missing-level fixtures emit nothing and
record the body builder's own reason; the over-cap fixture publishes exactly the
maximum with every pre-existing action intact in its original order and every
unplaced finding named; the relabelled fixture is refused by both guards; and a
genuine structural finding publishes on its own terms without scored-call framing.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Emission | unit | SCN-020-003 | `scripts/selftest.mjs` | a topic finding naming an instrument present in the committed instrument universe with a direction-correct numeric invalidation level publishes as an action carrying an action family, subject, rationale, horizon, structural anchor, trigger, invalidation, confidence and deep link, and its evaluability resolves machine-checkable rather than not-evaluable | `node scripts/selftest.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Attribution | unit | SCN-020-003 | `scripts/selftest.mjs` | a published topic-originated action carries its originating topic identifier so its outcome can be attributed later, and the identifier is present on the action itself rather than only in the decision record | `node scripts/selftest.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Born evaluable | unit | SCN-020-004 | `scripts/selftest.mjs` | a swing or tactical topic finding whose only instrument is outside the committed instrument universe is not emitted as an action, and a named exclusion records the exact out-of-universe reason the existing body builder resolved | `node scripts/selftest.mjs` | No | `report.md#tp-02-03` |
| TP-02-04 | Born evaluable | unit | SCN-020-005 | `scripts/selftest.mjs` | a swing or tactical topic finding whose invalidation carries no attributable direction-correct price level is not emitted as an action, and a named exclusion records the missing invalidation level as the reason | `node scripts/selftest.mjs` | No | `report.md#tp-02-04` |
| TP-02-05 | Born evaluable | unit | SCN-020-005 | `scripts/selftest.mjs` | all three evaluability reasons the existing body builder resolves are carried verbatim into the decision record, so the middle reason cannot fall through to a generic message | `node scripts/selftest.mjs` | No | `report.md#tp-02-05` |
| TP-02-06 | Adversarial | unit | SCN-020-004 | `scripts/selftest.mjs` | Regression: with the born-evaluable check removed, the out-of-universe swing finding is proven to reach the payload and depend on a post-hoc drop — the check-before-emission guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-02-06` |
| TP-02-07 | Publish safety | integration | SCN-020-004 | `scripts/validate-brief-payload.mjs` | routing does not cause the publication gate to fail the whole brief: with an unscoreable topic claim withheld before emission, the gate accepts the payload and the rest of the brief still publishes | `node scripts/validate-brief-payload.mjs` | No | `report.md#tp-02-07` |
| TP-02-08 | Cap assertion | unit | SCN-020-006 | `scripts/selftest.mjs` | Regression: with six qualifying findings and the configured maximum of five actions and zero occupied slots, exactly five publish and the sixth is recorded `RLROUTE-CAP`; the enforced limit is read from the committed configuration rather than restated, and a mutated selector without the bound is proven to exceed it | `node scripts/selftest.mjs` | No | `report.md#tp-02-08` |
| TP-02-09 | Never displace | unit | SCN-020-006 | `scripts/selftest.mjs` | every action present before routing is present afterwards, unchanged and in its original relative order, and the published action count does not exceed the configured maximum | `node scripts/selftest.mjs` | No | `report.md#tp-02-09` |
| TP-02-10 | Adversarial | unit | SCN-020-006 | `scripts/selftest.mjs` | Regression: a routing pass that would remove or overwrite a pre-existing non-topic action is refused `RLROUTE-DISPLACE` and stops, and a mutated pass without the invariant is proven to drop an authored action with no record — no topic finding is ever published by removing or overwriting an existing action | `node scripts/selftest.mjs` | No | `report.md#tp-02-10` |
| TP-02-11 | Named exclusion | unit | SCN-020-006 | `scripts/selftest.mjs` | every unplaced qualifying finding is recorded as a named exclusion with a cap reason naming the limit and its position in line; none is silently dropped | `node scripts/selftest.mjs` | No | `report.md#tp-02-11` |
| TP-02-12 | Structural | unit | SCN-020-007 | `scripts/selftest.mjs` | a genuine structural-horizon finding is not subjected to the swing and tactical evaluability rule, publishes only if it satisfies the full action contract on its own terms, and is rendered without scored-call framing so it is not presented to the reader as a scored directional call | `node scripts/selftest.mjs` | No | `report.md#tp-02-12` |
| TP-02-13 | Adversarial | unit | SCN-020-007 | `scripts/selftest.mjs` | Regression: a swing dossier finding emitted as a structural action is refused `RLROUTE-HORIZON` against the immutable dossier value, and removing that guard is proven to let the call escape the evaluability scan entirely and reach the append-only ledger unscoreable | `node scripts/selftest.mjs` | No | `report.md#tp-02-13` |
| TP-02-14 | Adversarial | unit | SCN-020-007 | `scripts/selftest.mjs` | Regression: a structural action whose own prose resolves both a trigger level and a direction-correct invalidation level is refused `RLROUTE-STRUCTURAL-SCORED`, and removing that guard is proven to publish a scored directional call under a structural label; the two guards fail on different mutations | `node scripts/selftest.mjs` | No | `report.md#tp-02-14` |
| TP-02-15 | Determinism | unit | SCN-020-006 | `scripts/selftest.mjs` | Regression: the same findings and generation state produce a byte-identical selection and exclusion set across repeated runs, including the tie case separated only by finding identifier | `node scripts/selftest.mjs` | No | `report.md#tp-02-15` |
| TP-02-16 | No mutation | unit | SCN-020-003 | `scripts/selftest.mjs` | Regression: no threshold, cap, score, minimum or vocabulary belonging to any destination is modified by this scope; the committed configuration, the evaluability rule and the committed instrument universe are byte-identical | `node scripts/selftest.mjs` | No | `report.md#tp-02-16` |

### Definition of Done

- [ ] SCN-020-003 — a topic finding naming a committed-universe instrument with a direction-correct numeric invalidation level publishes as an action carrying every required contract field, and its evaluability resolves machine-checkable rather than not-evaluable, proven by TP-02-01 and TP-02-02.
- [ ] SCN-020-004 — a swing or tactical finding whose only instrument is outside the committed instrument universe is not emitted as an action, a named exclusion records the out-of-universe reason, and the rest of the brief still publishes, proven by TP-02-03, TP-02-06 and TP-02-07.
- [ ] SCN-020-005 — a swing or tactical finding whose invalidation carries no attributable direction-correct price level is not emitted as an action and a named exclusion records the missing invalidation level as the reason, proven by TP-02-04 and TP-02-05.
- [ ] SCN-020-006 — the published action count does not exceed the configured maximum, every action present before routing is still present afterwards unchanged and in its original order, every unplaced qualifying finding is recorded as a named exclusion with a cap reason, and no topic finding is published by removing or overwriting an existing action, proven by TP-02-08, TP-02-09, TP-02-10 and TP-02-11.
- [ ] SCN-020-007 — the swing and tactical evaluability rule does not apply to a structural-horizon finding, it publishes only if it satisfies the full action contract on its own terms, and it is not presented to the reader as a scored directional call, proven by TP-02-12.
- [ ] Both structural guards exist and fail on different mutations, proven by TP-02-13 and TP-02-14.
- [ ] Topic actions are composed by the collector after the fragment assign, never requested from a lane in prose, and no lane's declared key set widened.
- [ ] The born-evaluable check happens before emission, so the drop-unscoreable path never has to drop a topic action and the whole brief is never at risk (FR-020-017), proven by TP-02-06 and TP-02-07.
- [ ] The cap figure is read from the committed configuration rather than restated, and the assertion is proven able to fail (NFR-020-003, P22), proven by TP-02-08.
- [ ] Never-displace is an asserted invariant that refuses and stops, not a recorded event (FR-020-014), proven by TP-02-10.
- [ ] Selection is deterministic under the single declared order with the finding identifier as the total final tiebreak (NFR-020-001), proven by TP-02-15.
- [ ] `data/bars/**`, `data/options/**` and `watchlist.json` are byte-identical at the end of this scope — the committed instrument universe was not expanded to make a finding scoreable, proven by TP-02-16 and by `git diff --name-only`.
- [ ] `scripts/recommendation-body.mjs` and `scripts/validate-brief-payload.mjs` are byte-identical; the evaluability rule was consumed, never re-implemented (FR-020-004, FR-020-006), proven by TP-02-16.
- [ ] `node scripts/selftest.mjs` exits 0 with the action-emission group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/validate-brief-payload.mjs` exits 0, proven by TP-02-07.
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
- [ ] TP-02-12 executed with raw output recorded at `report.md#tp-02-12`.
- [ ] TP-02-13 executed with raw output recorded at `report.md#tp-02-13`.
- [ ] TP-02-14 executed with raw output recorded at `report.md#tp-02-14`.
- [ ] TP-02-15 executed with raw output recorded at `report.md#tp-02-15`.
- [ ] TP-02-16 executed with raw output recorded at `report.md#tp-02-16`.
