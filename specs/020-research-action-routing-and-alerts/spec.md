# Feature 020 — Research Action Routing And Alerts

**Status:** planning
**Host surface:** the existing brief publication path — `payload.nextSession.actions`,
the decision-attention tier, and the red-alert candidate pipeline. **Not** a new
tier. **Not** a new view. **Not** a relaxation of any existing gate.
**Educational only — not investment advice.**

---

## Problem Statement

The operator's three deep-research sessions each produced things to *do*, and
none of them reached a surface where they could be acted on or later scored.

- The **defense manufacturers** session ranked names by production-expansion
  visibility and by three-, six- and twelve-month earnings acceleration versus
  consensus. That is a set of watch levels and confirmation checks. It stayed in
  a chat window.
- The **U.S.–Iran oil and Strait of Hormuz** session produced actor reaction
  functions, scenario probabilities and explicit confirmation rules. It was
  written to `notes/us-iran-oil-market-intervention-patterns.md`, where it is
  readable and *inert*. A confirmation rule that nothing evaluates is a note.
- The **food, grains and fertilizer** session produced expected move ranges,
  catalysts and invalidation levels — the exact three fields the brief's action
  contract requires — and none of them reached the action list.

Feature 019 gives those topics a durable, dated, append-only dossier. But a
dossier that produces an action item and keeps it inside the dossier has
produced a document, not a decision. **The routing is the product.**

Routing is not a matter of copying a string into an array, because every
destination in this repository is a refusing contract, and each refuses for a
different reason.

**The action list refuses on evaluability.**
`payload.nextSession.actions` is capped at
`config.thresholds.nextSessionMaxActions` (5). Each entry needs an action family
from `hold|trim|add|hedge|rotate`, plus `subject`, `rationale`, `horizon`,
`structuralAnchor`, `trigger`, `invalidation`, `confidence` and `deepLink`. Then
D16 applies: `loadInstrumentUniverse` in `scripts/recommendation-body.mjs`
builds the committed universe from `data/bars/*.json`, `data/options/*.json` and
the tickers in `watchlist.json`. A swing or tactical call naming an instrument
outside that universe resolves `no-instrument-in-committed-universe`, and
`scripts/validate-brief-payload.mjs` withholds it — `--drop-unscoreable` drops
the offending claim and publishes the rest. Invalidation must also carry a
direction-correct numeric price level, or the call resolves
`no-attributable-invalidation-level` and is withheld for the same reason.

**The attention tier refuses on privacy, deep-link, verb and duplication.**
`rlattention.js` implements `decision-attention/v1` and **refuses rather than
defaults**, from a closed thirteen-code `RLATTN-*` list declared at
`rlattention.js:159-171`. A subject outside the public
`watchlist.json` scope is `RLATTN-PRIVACY`. A `deepLink` that is not one of
`toolDeepLinkValues(payload)` — the deep links of tools that actually filed a
tool read in *that* generation — is `RLATTN-DEEPLINK`. A verb outside
`RESEARCH_VERBS` is `RLATTN-VERB`; execution verbs are forbidden. A subject
already published as an action is `RLATTN-OVERLAP`, because the reader must not
be told the same thing twice. Every refusal is recorded in
`payload.attentionExclusions[]` with its code, field and reason; built plus
excluded must equal declared; and an empty tier is a valid outcome that is never
padded.

**The red alert refuses on publication itself.**
`rlmarketaction.js` `composeRedAlertView` rejects `published === true` with
`RLMKT-GATE`: *"live Red Alert publication is a Feature 002 dependency-pending
gate (Scope 12), not a current capability."* `GATE.redAlertPublication` is
`"dependency-pending:feature-002"` and the projection must carry it unchanged.
But the **upstream primitives all exist and are usable today**: `anomaly-seed/v1`,
`clusterAnomalySeeds`, `buildQueryPlanInput`, `buildCandidate`,
`red-alert-policy/v1` (`scoreThreshold` 75, `visibleCap` 5, `minSeverity` 4,
`minIndependentOrigins` 2, `minOwnerEvidence` 1), the eight
`TRANSMISSION_CHANNELS` including `geopolitical-supply-chain` and
`commodities-energy`, `RESEARCH_VERBS`, append-only `LIFECYCLE_STATES` and
`TRANSITIONS`, `REJECTION_REASON_CLASSES`, `FORBIDDEN_ALARMIST_TERMS`, and
`RED_ALERT_EMPTY_STATEMENT`.

Usable is not the same as uniformly reachable, and this spec says where the two
diverge. **Seeding and candidacy are two capabilities with two different
admission conditions.** `validateAnomalySeed` requires at least one
`transmissionChannels` member drawn from the closed eight and refuses an unknown
channel outright (`rlmarketaction.js:896-899`), so a finding whose transmission
is genuinely something else — an earnings-revision path, for instance — cannot
be classified into the vocabulary and does not become a seed. `buildCandidate`
additionally refuses unless it is handed a frozen `web-evidence-bundle/v1`
carrying claims (`rlmarketaction.js:1016`), so a seed whose evidence never went
through the committed acquisition path stops at the seed stage.

So a topic finding may legally become an anomaly seed **now** when it carries a
certified channel, and a scored candidate **now** when it also carries a frozen
evidence bundle, while live publication stays gated. That is the honest
position, and this spec takes it.

The consequence the operator must see stated plainly: **several of the three
real topics cannot produce a scoreable brief call today at all.** European
defense listings, Brent, urea and potash are not in the committed instrument
universe. A tactical or swing call naming them is withheld by the gate. The
routing this spec builds must therefore refuse loudly and by name in those
cases, rather than quietly producing nothing and letting the operator assume the
research was worthless.

---

## Outcome Contract

**Intent.** A finding produced by a recurring research topic reaches the reader
through whichever destination its evidence actually qualifies for — the brief
action list, the decision-attention tier, or the red-alert candidate pipeline —
and when it qualifies for none of them, the operator is told which gate refused
it and why, by name. Topic-originated calls that do publish participate in the
same scoring and ledger machinery as every other call, so they publish their own
error rate.

**Success signal.** In a generation where a topic dossier produced findings, the
published brief shows at least one of the following, and never a silent gap:
a topic-originated action in `nextSession.actions` carrying a committed-universe
instrument and a direction-correct invalidation level; a topic-originated
attention item that cleared every `decision-attention/v1` check; a topic-derived
anomaly seed and scored candidate recorded with its policy verdict; or, for each
finding that reached none of these, a named exclusion carrying the refusing
gate's own code and reason. Over subsequent windows, resolved topic-originated
calls appear in the recommendation outcome ledger with their hit and miss counts
alongside every other call.

**Hard constraints.**

- **No gate is relaxed, weakened, or bypassed.** The D16 evaluability rule, the
  five-action cap, every `RLATTN-*` refusal, the red-alert admission score of
  75, `minSeverity` 4, `minIndependentOrigins` 2, and `minOwnerEvidence` 1 all
  stand exactly as they are. A topic origin buys no exemption.
- **Live Red Alert publication is not attempted.** `published === true` is
  refused by `RLMKT-GATE` today. This feature routes to seeds and candidates and
  stops there. Faking, simulating, or locally overriding a published alert is
  forbidden.
- **A refusal is published, never swallowed.** Every finding that fails to reach
  a destination is recorded with the refusing gate's own code, field and reason,
  in the exclusions channel that destination already uses.
- **Nothing already published is displaced.** Routing may fill a free action
  slot; it may never remove, overwrite or reorder an action another lane already
  authored. Topic material that does not fit is withheld and named, never traded
  against the live tape.
- **Born evaluable or not published as a call.** A topic finding may become a
  swing or tactical action only if its instrument is in the committed universe
  and its invalidation carries a direction-correct numeric level. Otherwise it
  is not emitted as a call at all. *(P20)*
- **Research verbs only.** Attention and alert material uses `RESEARCH_VERBS` —
  `monitor`, `verify`, `investigate`, `scenario-test`, `review-hedge-research`,
  `trace-claims`. No execution verb, no direction instruction, no sizing.
- **Public scope only, tickers only, forever.** Subjects are bounded by the
  public `watchlist.json` scope and public market objects. No position, size,
  cost basis or P&L. *(P13)*
- **One owning module for the finding contract.** The routable-finding shape and
  its destination-eligibility rules are defined once. *(P19)*
- **No duplicate surfacing.** A subject already carried by an action must not
  also appear as an attention item; `RLATTN-OVERLAP` already enforces this and
  this feature must not work around it. *(P16)*
- **Append-only.** Routing decisions, exclusions and outcomes are appended, never
  rewritten. *(P21)*

**Failure condition.** The feature has failed, even with every test green, if
any of these is true: a gate threshold is lowered to let topic material through;
a topic-originated call publishes without a committed-universe instrument or
without a direction-correct invalidation level; a refusal happens with no named
exclusion recorded; a published Red Alert is produced by any path; an action
another lane authored disappears from the published action list; the closed
transmission-channel vocabulary is extended so a finding can be forced into it;
the same subject is surfaced twice; a topic-originated call is exempted from the
scorecard or the outcome ledger; or a topic finding is silently discarded so the
operator cannot tell research from silence.

---

## Goals

1. Define one routable-finding contract that a topic dossier emits and every
   destination consumes.
2. Route qualifying findings into `payload.nextSession.actions` under the full
   existing action contract and the D16 evaluability rule.
3. Route qualifying findings into the decision-attention tier under the full
   `decision-attention/v1` contract.
4. Route qualifying findings into the anomaly-seed and red-alert candidate
   pipeline, stopping short of the gated publication step.
5. Publish a named exclusion for every finding that reaches no destination,
   carrying the refusing gate's own code and reason.
6. Make topic-originated calls participate in the scorecard and the outcome
   ledger on identical terms to every other call.

## Non-Goals

1. **No topic registry, lifecycle, dossier or review policy.** That is
   Feature 019. This spec consumes a finding; it does not produce one.
2. **No live Red Alert publication.** The capability does not exist; see
   *Dependencies*.
3. **No new gate, tier, view or destination.** Three destinations already exist.
4. **No relaxation of any threshold** to increase topic throughput.
5. **No expansion of the committed instrument universe.** Adding bars or options
   data for Brent, urea, potash or a European defense listing is separate work
   that this spec deliberately does not do.
6. **No private portfolio input.** `specs/008-portfolio-survival-and-brief-lab`
   owns the private queue; this routing is public-only.
7. **No new data source or credential.** *(P9)*

## Actors

| Actor | Role in this feature |
| --- | --- |
| Operator | Reads the routed actions, attention items and exclusions; owns the topics upstream |
| Routing module | Decides which destination a finding is eligible for, and records the refusal when none |
| Action contract | `scripts/validate-brief-payload.mjs` plus `scripts/recommendation-body.mjs`, which decide evaluability |
| Attention composer | `rlattention.js` (`decision-attention/v1`), which refuses with closed `RLATTN-*` codes |
| Alert pipeline | `rlmarketaction.js` seeds, clustering, candidate build and `red-alert-policy/v1` scoring |
| Outcome ledger | The recommendation outcome ledger and `market-brief.scorecard.json`, which publish the error rate |

## Domain Vocabulary

| Term | Meaning |
| --- | --- |
| **Routable finding** | A dossier finding shaped for destination eligibility: subject, claim, evidence, horizon, and the fields each destination requires |
| **Destination** | One of: brief action list, decision-attention tier, red-alert candidate pipeline |
| **Eligibility** | Whether a finding satisfies a destination's full contract, decided by that destination's own rules |
| **Named exclusion** | A published record of a refusal, carrying the refusing gate's code, field and reason |
| **Born evaluable** | A call whose instrument is in the committed universe and whose invalidation carries a direction-correct numeric level, so it can be scored later |
| **Degraded mode** | The behaviour when a destination's capability is missing — today, live Red Alert publication |

---

## Business Scenarios

Each scenario is independently testable and maps one-to-one onto a stable
`SCN-020-NNN` identifier recorded in `scenario-manifest.json`.

### Cluster 1 — The routable finding contract

#### BS-020-001: A finding carries what every destination needs to decide

```gherkin
Scenario: The finding contract is destination-agnostic and complete
  Given a topic dossier finding emitted for routing
  When it is validated against the routable-finding contract
  Then it carries its subject, its claim, its evidence with date and source, and its horizon
  And it carries the originating topic identifier and dossier version
  And a finding missing any required member is refused by name rather than defaulted
```

#### BS-020-002: The finding contract has exactly one owning module

```gherkin
Scenario: One definition per concept
  Given the routable-finding contract
  When the repository is inspected for its definition
  Then exactly one module defines the shape and the destination-eligibility rules
  And every consumer reads them from that module rather than re-declaring them
```

### Cluster 2 — Routing into the brief action list

#### BS-020-003: A qualifying finding becomes a scoreable action

```gherkin
Scenario: A committed-universe subject with a real invalidation level publishes
  Given a topic finding naming an instrument present in the committed instrument universe
  And an invalidation carrying a direction-correct numeric price level
  When it is routed to the brief action list
  Then it publishes as an action with an action family, subject, rationale, horizon, structural anchor, trigger, invalidation, confidence and deep link
  And its evaluability resolves to machine-checkable rather than not-evaluable
```

#### BS-020-004: A subject outside the committed universe is not published as a call

```gherkin
Scenario: An out-of-universe swing call is withheld and named
  Given a topic finding whose only instrument is outside the committed instrument universe
  And the finding's horizon is swing or tactical
  When it is routed to the brief action list
  Then it is not emitted as an action
  And a named exclusion records the reason no-instrument-in-committed-universe
  And the rest of the brief still publishes
```

#### BS-020-005: A call with no direction-correct invalidation level is withheld

```gherkin
Scenario: An unfalsifiable call cannot inflate the hit rate
  Given a topic finding whose invalidation carries no attributable direction-correct price level
  And the finding's horizon is swing or tactical
  When it is routed to the brief action list
  Then it is not emitted as an action
  And a named exclusion records the missing invalidation level as the reason
```

#### BS-020-006: The five-action cap is respected and nothing is displaced

```gherkin
Scenario: Topic actions fill free slots only
  Given the action list already carries actions and the configured maximum is five
  And more qualifying topic findings exist than remaining slots
  When routing selects actions
  Then the published action count does not exceed the configured maximum
  And every action present before routing is still present afterwards, unchanged and in its original order
  And every unplaced qualifying finding is recorded as a named exclusion with a cap reason
  And no topic finding is published by removing or overwriting an existing action
```

#### BS-020-007: A structural-horizon finding is not treated as a scoreable call

```gherkin
Scenario: Structural horizon is out of the evaluability rule's scope
  Given a topic finding whose horizon is structural
  When it is routed to the brief action list
  Then the swing and tactical evaluability rule does not apply to it
  And it is published only if it satisfies the full action contract on its own terms
  And it is not presented to the reader as a scored directional call
```

### Cluster 3 — Routing into the decision-attention tier

#### BS-020-008: A qualifying finding becomes an attention item

```gherkin
Scenario: A public subject with a live tool deep link publishes
  Given a topic finding whose subject is inside the public watchlist scope
  And whose deep link is a tool that filed a tool read in this generation
  And whose verb is a research verb
  When it is routed to the attention tier
  Then it publishes as an attention item
```

#### BS-020-009: A subject outside the public scope is refused as a privacy violation

```gherkin
Scenario: RLATTN-PRIVACY is honoured, not worked around
  Given a topic finding whose subject is outside the public watchlist scope
  When it is routed to the attention tier
  Then it is refused with the privacy code
  And the refusal is recorded in the attention exclusions channel with its code, field and reason
  And no attempt is made to substitute a different subject to force publication
```

#### BS-020-010: A deep link to a tool that filed no read this generation is refused

```gherkin
Scenario: RLATTN-DEEPLINK is honoured
  Given a topic finding whose deep link is not among this generation's tool-read deep links
  When it is routed to the attention tier
  Then it is refused with the deep-link code
  And the refusal is recorded with its code, field and reason
```

#### BS-020-011: An execution verb is refused

```gherkin
Scenario: RLATTN-VERB is honoured
  Given a topic finding carrying a verb outside the research-verb vocabulary
  When it is routed to the attention tier
  Then it is refused with the verb code
  And the refusal is recorded with its code, field and reason
```

#### BS-020-012: A subject already published as an action is not surfaced twice

```gherkin
Scenario: RLATTN-OVERLAP is honoured
  Given a topic finding whose subject is already published in the action list this generation
  When it is routed to the attention tier
  Then it is refused with the overlap code
  And the reader is not told the same thing twice
```

#### BS-020-013: The exclusion ledger balances

```gherkin
Scenario: Built plus excluded equals declared
  Given a generation in which topic findings were routed to the attention tier
  When the published payload is inspected
  Then the number of built attention items plus the number of recorded exclusions equals the number declared
  And an empty attention tier is accepted as a valid outcome rather than padded
```

### Cluster 4 — Anomaly seeds and red-alert candidacy under the publication gate

#### BS-020-014: A topic finding becomes an anomaly seed

```gherkin
Scenario: A finding whose transmission maps to a certified channel enters the alert pipeline
  Given a topic finding carrying owner evidence and a transmission that maps to a certified channel
  When it is routed to the alert pipeline
  Then it is recorded as an anomaly seed under the seed contract
  And the seed names its transmission channel from the existing closed channel vocabulary
  And no frozen evidence bundle is required for the seed to be recorded
```

#### BS-020-015: A seed is clustered and scored against the existing policy

```gherkin
Scenario: The admission bar is applied unchanged
  Given topic-derived anomaly seeds
  When they are clustered and built into a candidate
  Then the candidate is scored against the existing red-alert policy
  And a candidate below the configured admission score is rejected with a reason from the existing rejection vocabulary
  And no threshold is lowered because the origin is a research topic
```

#### BS-020-016: Live publication is never attempted

```gherkin
Scenario: The publication gate is respected
  Given a topic-derived candidate that would clear every evidence bar
  When the alert view is composed
  Then the projection reports the publication state as the existing dependency-pending gate
  And no path sets published to true
  And the reader is told the qualification is local and nothing went live
```

#### BS-020-017: Alarmist language is refused

```gherkin
Scenario: The forbidden-term vocabulary is honoured
  Given a topic finding whose text contains a term in the forbidden alarmist vocabulary
  When it is routed to the alert pipeline
  Then it is refused with a named reason
  And no alarmist term reaches any published surface
```

#### BS-020-018: An empty alert window states the exact empty copy

```gherkin
Scenario: Nothing qualified this window
  Given no topic-derived candidate cleared the evidence bar this window
  When the alert view is composed
  Then the empty statement is the exact committed empty-state copy
  And no weak candidate is promoted to avoid an empty section
```

### Cluster 5 — Scoring, ledger participation, and degraded modes

#### BS-020-019: A topic-originated call is scored like every other call

```gherkin
Scenario: No exemption for research origin
  Given a published topic-originated action that later resolves
  When the outcome ledger is updated
  Then the call appears with its outcome alongside non-topic calls
  And its origin does not exempt it from the hit and miss counts
```

#### BS-020-020: A topic-originated call carries its origin without special treatment

```gherkin
Scenario: Origin is recorded, not privileged
  Given a published topic-originated action
  When the ledger entry is inspected
  Then it records the originating topic identifier and dossier version
  And that origin field changes no scoring rule, threshold or weighting
```

#### BS-020-021: Ledger history is append-only

```gherkin
Scenario: A correction is a new event
  Given a published topic-originated call whose recorded outcome is later corrected
  When the correction is applied
  Then it is a new entry referencing the original
  And the original entry is not edited or removed
```

#### BS-020-022: The degraded alert mode is stated, not hidden

```gherkin
Scenario: A missing capability is disclosed
  Given live Red Alert publication is unavailable
  And a topic-derived candidate cleared the local evidence bar
  When the reader views the alert surface
  Then the surface states that live publication is dependency-pending and that only local qualification is shown
  And the candidate is still recorded so it is not lost
```

#### BS-020-023: A finding that reaches no destination is still visible to the operator

```gherkin
Scenario: Research is distinguishable from silence
  Given a topic finding refused by every destination
  When the generation completes
  Then the operator can see that the finding existed and which gate refused it
  And the reasons carry each refusing gate's own code
  And the finding is not silently discarded
```

### Cluster 4 (continued) — the two honest alert-lane non-outcomes

These two were added when `spec.md` assumption 4 was closed. They belong to
scope 4 and carry the next free identifiers rather than displacing any existing
scenario number.

#### BS-020-024: A finding that maps to no certified channel produces no seed

```gherkin
Scenario: An unmappable transmission is a named outcome, not a forced fit
  Given a topic finding whose transmission matches none of the certified channels
  When it is routed to the alert pipeline
  Then no anomaly seed is emitted for it
  And the outcome is recorded by name as a finding with no certified transmission channel
  And the closed channel vocabulary is not extended and no channel is approximated to admit it
  And its eligibility for the action list and the attention tier is unaffected
```

#### BS-020-025: A seed with no frozen evidence bundle stops at the seed stage

```gherkin
Scenario: Seeding and candidacy have different preconditions, stated honestly
  Given a topic-derived anomaly seed whose evidence did not come through the committed acquisition path
  When candidate assembly is attempted
  Then no candidate is assembled
  And the seed remains recorded rather than being discarded
  And the outcome is recorded by name as a missing frozen evidence bundle
  And the seed is not promoted to a candidate by substituting or synthesising a bundle
```

---

## Requirements

Thirty-eight functional requirements across five intended scopes, inside the
P25 cap of roughly forty requirements and five scopes.

### The routable-finding contract

- **FR-020-001** A routable finding MUST carry its subject, its claim, its
  evidence with observation date and source, its horizon, its originating topic
  identifier, and the dossier version it came from.
- **FR-020-002** The routable-finding shape and its destination-eligibility
  rules MUST be defined in exactly one module, read by every consumer. *(P19)*
- **FR-020-003** A finding missing any required member MUST be refused by name;
  no member may be defaulted, inferred or synthesised.
- **FR-020-004** Destination eligibility MUST be decided by each destination's
  own existing contract, never re-implemented or approximated inside the routing
  module.
- **FR-020-005** A finding MAY be eligible for more than one destination, but
  MUST NOT be surfaced twice for the same subject in the same generation.
- **FR-020-006** The routing module MUST NOT mutate, weaken or shadow any
  destination contract's thresholds or vocabularies.
- **FR-020-007** Every routing decision, positive or negative, MUST be recorded
  with the destination it targeted and the outcome. *(P21)*

### Routing into the brief action list

- **FR-020-008** A topic finding routed to the action list MUST satisfy the full
  existing action contract: an action family from `hold|trim|add|hedge|rotate`,
  plus subject, rationale, horizon, structural anchor, trigger, invalidation,
  confidence and deep link.
- **FR-020-009** A swing or tactical topic call MUST name at least one
  instrument present in the committed instrument universe derived from
  `data/bars/*.json`, `data/options/*.json` and `watchlist.json`.
- **FR-020-010** A swing or tactical topic call MUST carry an invalidation with
  a direction-correct numeric price level.
- **FR-020-011** A swing or tactical topic call failing FR-020-009 or
  FR-020-010 MUST NOT be emitted as an action, and MUST produce a named
  exclusion carrying the evaluability reason the existing body builder resolves.
- **FR-020-012** The published action count MUST NOT exceed
  `config.thresholds.nextSessionMaxActions`.
- **FR-020-013** When qualifying findings exceed the remaining action slots,
  selection MUST follow a declared deterministic order and every unplaced
  finding MUST produce a named exclusion with a cap reason.
- **FR-020-014** Routing MUST NOT displace an existing action. The published
  action list after routing MUST contain every action it contained before
  routing, unchanged and in its original relative order; a topic action may only
  occupy a slot that was free. A qualifying topic finding with no free slot is
  not published at all — it is recorded as a named cap exclusion under
  FR-020-013 and remains readable in its dossier. Removing, overwriting or
  reordering an existing action is forbidden, not merely recorded.
- **FR-020-015** A structural-horizon finding MUST NOT be presented to the
  reader as a scored directional call, and MUST NOT be routed around the
  evaluability rule by relabelling its horizon.
- **FR-020-016** A topic-originated action MUST carry its originating topic
  identifier so its outcome can be attributed later.
- **FR-020-017** Routing MUST NOT cause the publication gate to fail the whole
  brief; an unscoreable topic claim is withheld while the rest of the brief
  publishes.

### Routing into the decision-attention tier

- **FR-020-018** A topic finding routed to the attention tier MUST be composed
  through the existing `decision-attention/v1` composer, not a parallel path.
- **FR-020-019** A subject outside the public `watchlist.json` scope MUST be
  refused, and the refusal recorded with the composer's own privacy code.
- **FR-020-020** A deep link that is not among the current generation's tool
  deep links MUST be refused, and the refusal recorded with the composer's own
  deep-link code.
- **FR-020-021** A verb outside the research-verb vocabulary MUST be refused,
  and the refusal recorded with the composer's own verb code.
- **FR-020-022** A subject already published as an action MUST be refused as an
  overlap; routing MUST NOT rename or re-key the subject to evade the check.
- **FR-020-023** Every attention refusal MUST be appended to the attention
  exclusions channel with its code, field and reason.
- **FR-020-024** The count of built attention items plus recorded exclusions
  MUST equal the count declared.
- **FR-020-025** An empty attention tier MUST be accepted as a valid outcome; no
  weak item may be published to avoid emptiness.

### Anomaly seeds and red-alert candidacy

- **FR-020-026** Seed emission and candidate assembly MUST be treated as two
  distinct capabilities with two distinct preconditions, and no surface, record
  or copy may present them as equally available. A topic finding that carries at
  least one owner evidence reference and a transmission that maps to a certified
  channel MUST be expressible as an anomaly seed under the existing seed
  contract, and seed emission MUST NOT require a frozen web evidence bundle.
- **FR-020-027** A topic-derived seed MUST declare at least one transmission
  channel drawn from the existing closed vocabulary, which already includes
  `geopolitical-supply-chain` and `commodities-energy`. The vocabulary MUST NOT
  be extended, and no channel may be approximated or stretched to admit a
  finding. A finding whose transmission maps to none of the certified channels
  MUST NOT be emitted as a seed; the outcome MUST be recorded by name as a
  finding with no certified transmission channel, and its eligibility for the
  action list and the attention tier MUST be unaffected.
- **FR-020-028** Candidate assembly MUST go through the existing clustering and
  candidate-build path, which refuses without a frozen `web-evidence-bundle/v1`
  carrying claims. A seed whose evidence did not come through the committed
  acquisition path MUST stop at the seed stage: no candidate is assembled, the
  seed remains recorded rather than discarded, the outcome is recorded by name
  as a missing frozen evidence bundle, and no bundle may be substituted or
  synthesised to promote it.
- **FR-020-029** A topic-derived candidate MUST be scored against the existing
  red-alert policy with its admission score, minimum severity, minimum
  independent origins and minimum owner evidence unchanged.
- **FR-020-030** A rejected candidate MUST carry a reason from the existing
  closed rejection-reason vocabulary.
- **FR-020-031** No path introduced by this feature may set the alert projection
  to published; the projection MUST carry the existing dependency-pending
  publication state unchanged.
- **FR-020-032** Text carrying a term from the forbidden alarmist vocabulary
  MUST be refused before it reaches any published surface.

### Scoring, ledger participation, and degraded modes

- **FR-020-033** A published topic-originated call MUST enter the same
  recommendation outcome ledger as every other call, with no origin-based
  exemption.
- **FR-020-034** A topic-originated ledger entry MUST record its originating
  topic identifier and dossier version, and that origin MUST change no scoring
  rule, threshold or weighting.
- **FR-020-035** Ledger corrections MUST be new entries referencing the
  original; no entry may be edited or removed. *(P21)*
- **FR-020-036** While live Red Alert publication is unavailable, the surface
  MUST state that publication is dependency-pending and that only local
  qualification is shown; the candidate MUST still be recorded.
- **FR-020-037** A finding refused by every destination MUST remain visible to
  the operator with each refusing gate's own code and reason.
- **FR-020-038** No threshold, cap, score, minimum or vocabulary belonging to
  any destination may be modified by this feature. Every guard introduced here
  MUST carry an adversarial case that fails when the guard is removed. *(P23)*

## Non-Functional Requirements

- **NFR-020-001** Routing MUST be deterministic: the same findings and the same
  generation state MUST produce the same routing decisions and the same
  exclusion set.
- **NFR-020-002** Routing MUST NOT require network access; every eligibility
  decision is computable from the generation's committed state.
- **NFR-020-003** Any budget figure this feature introduces MUST have a test
  that can actually fail. *(P22)*
- **NFR-020-004** The exclusion ledger MUST be cheap enough to publish in full
  every generation, since a truncated exclusion ledger reintroduces exactly the
  silent-discard failure this feature exists to remove.

---

## Admission Test Justification

> **Does this improve decision quality, or the measurement of decision quality?**

**Both, and this spec is the half that does the measuring.**

Decision quality: three research sessions produced action items, watch levels
and confirmation rules, and none of them reached a surface where the operator
would encounter them at decision time. Research the reader has to remember to
re-read is research that does not change decisions. Routing it to the action
list, the attention tier, and the alert pipeline is the difference between a
document and a decision.

Measurement: this is the stronger justification. §0 of the product principles
says the product is *"the only market brief that publishes its own error rate."*
A topic-originated call that publishes without entering the outcome ledger would
be a claim the product makes and never scores — precisely the drift the
admission test exists to prevent. FR-020-033 through FR-020-035 make topic calls
scored on identical terms, and FR-020-011 refuses to publish a call that could
never be scored at all rather than emitting an unfalsifiable one. Both directions
of that rule improve the measurement of decision quality.

**On the corollary.** §1 says a surface may pass only if its read reaches the
brief. This feature adds no new surface — it routes into three surfaces the
brief already publishes, and its exclusion records publish there too. There is
no path in this spec by which material is produced and never reaches the brief.

## Product Principle Alignment

| Principle | How this spec honours it |
| --- | --- |
| **P1 — provenance on every figure** | FR-020-001: every finding carries observation date and source before it can be routed |
| **P2 — missing renders as missing** | FR-020-011, FR-020-037: a refused finding is a named exclusion, never an omission and never a placeholder |
| **P9 — works with nothing** | NFR-020-002: eligibility is computable from committed state; no new credential or endpoint |
| **P13 — tickers only, forever** | FR-020-019: public watchlist scope only; no position, size or P&L anywhere |
| **P16 — deep-link, never duplicate** | FR-020-020, FR-020-022: the deep link must be a live tool read, and a subject is never surfaced twice |
| **P17 — reachable or removed** | Every routed output lands in a surface the brief already publishes |
| **P18 — wired or not shipped** | The routing module's consumer is the production generation path, not a test |
| **P19 — one definition per concept** | FR-020-002, FR-020-004: one owning module; destination rules are consumed, never re-implemented |
| **P20 — every claim is scoreable** | FR-020-009 through FR-020-011: born evaluable or not published as a call |
| **P21 — additive, append-only** | FR-020-007, FR-020-035 |
| **P22 — budgets are assertions** | NFR-020-003 |
| **P23 — a guard that cannot fail is not a guard** | FR-020-038 |
| **P24 — superseding closes the superseded** | Ledger corrections reference the original rather than replacing it (FR-020-035) |
| **P25 — capped, never status-blocked** | 38 FRs, 5 intended scopes; the Red Alert dependency is expressed as the named missing capability "live Red Alert publication", never as a spec status |

## Dependencies — Named Missing Capabilities

Per P25, this spec blocks on capabilities, never on another spec's status.

| Missing capability | Why it matters here | Degraded behaviour while absent |
| --- | --- | --- |
| **Live Red Alert publication** | `rlmarketaction.js` refuses `published === true` with `RLMKT-GATE` and `GATE.redAlertPublication` is a dependency-pending gate | FR-020-031 and FR-020-036: seeds and scored candidates are produced and recorded, the surface states publication is dependency-pending, and nothing is faked. This is a fully specified degraded mode, not a block |
| **A routable topic finding** | This spec consumes findings; it does not produce them | Feature 019 supplies the dossier and its findings. Until findings exist, the routing module has nothing to route and the exclusion ledger is legitimately empty |
| **A frozen web-evidence bundle for a finding** | `buildCandidate` refuses without a frozen `web-evidence-bundle/v1` carrying claims, so a seed whose evidence never went through the committed acquisition path cannot be assembled into a candidate | FR-020-028: the finding stops at the seed stage, the seed stays recorded, and the missing bundle is named. Seeding itself is unaffected |
| **Committed market data for the topics' instruments** | European defense listings, Brent, urea and potash are not in the committed instrument universe | FR-020-011: those findings cannot become swing or tactical calls and are published as named exclusions carrying `no-instrument-in-committed-universe`. Expanding the universe is explicitly Non-Goal 5 |

This spec has no dependency on the *status* of Feature 002, Feature 008, or
Feature 019. It depends on the three capabilities above, each of which is named,
real, and has a specified degraded behaviour.

## What Is Not Possible Today — Stated Honestly

1. **Several of the operator's own topics cannot produce a scoreable call.**
   The committed instrument universe is built from `data/bars/*.json`,
   `data/options/*.json` and `watchlist.json`. Brent, urea, potash and European
   defense listings are not in it. A swing or tactical call naming them resolves
   `no-instrument-in-committed-universe` and is withheld by
   `scripts/validate-brief-payload.mjs`. This spec does not fix that; it makes
   the refusal loud and named so the operator can decide whether to bring the
   instrument into the universe.
2. **No topic finding can become a live Red Alert.** `published === true` is
   refused today. Seeds and scored candidates are the ceiling.
3. **A geopolitical or commodity topic may have no publishable attention
   subject at all.** The attention composer refuses a subject outside the public
   `watchlist.json` scope with its privacy code. A Strait-of-Hormuz finding may
   legitimately reach the attention tier only if it can be expressed against a
   public watchlist subject. When it cannot, the correct outcome is a named
   exclusion, not a workaround.
4. **A structural-horizon finding sits outside the evaluability rule.** The
   swing-and-tactical rule does not reach it, which means it is neither withheld
   nor automatically scoreable. FR-020-015 forbids using that as a loophole by
   relabelling a tactical call as structural.
5. **Routing cannot make weak research strong.** Every threshold stays where it
   is. If a topic's evidence does not clear a bar, the honest published result is
   an exclusion, and this spec treats that as success rather than failure.
6. **A finding whose transmission is not one of the certified eight cannot
   become an alert seed — ever, by design.** The channels are classification
   labels, `validateAnomalySeed` refuses an unknown channel
   (`rlmarketaction.js:896-899`), and the attention composer refuses an invented
   channel for the same reason (`rlattention.js:427-433`). The operator's
   defense-manufacturer topic is the concrete case: a supply-chain constraint is
   `geopolitical-supply-chain` and an input-cost move is `commodities-energy`,
   but an earnings-acceleration-versus-consensus transmission is neither. Such a
   finding produces no seed. It may still publish as an action or an attention
   item, and the no-channel outcome is named rather than papered over
   (FR-020-027). This is not a gap to close by adding a ninth channel.
7. **A finding with no frozen evidence bundle cannot become a scored
   candidate.** `buildCandidate` refuses without a frozen
   `web-evidence-bundle/v1` carrying claims (`rlmarketaction.js:1016`). Seeding
   is available without one; candidacy is not. The seed is still recorded and
   the missing bundle is named (FR-020-028).

## Intended Scope Decomposition

Five scopes, authored by `bubbles.plan`. Recorded here as intent only.

| # | Scope | Covers |
| --- | --- | --- |
| 1 | `01-routable-finding-contract` | FR-020-001..007 — the single owning module, the finding shape, destination-agnostic eligibility dispatch |
| 2 | `02-action-list-routing-and-evaluability` | FR-020-008..017 — the action contract, D16 born-evaluable, the cap, deterministic selection, named withholding |
| 3 | `03-attention-tier-routing-and-exclusions` | FR-020-018..025 — composition through the existing composer, every `RLATTN-*` refusal, the balancing exclusion ledger |
| 4 | `04-anomaly-seed-and-alert-candidacy` | FR-020-026..032 — seeds, clustering, candidate scoring under the unchanged policy, the publication gate |
| 5 | `05-scoring-ledger-and-degraded-modes` | FR-020-033..038 — ledger participation, origin attribution without privilege, append-only corrections, degraded-mode disclosure |

## Assumptions And Open Questions

1. **Resolved in design — where the cross-destination exclusion record lives.**
   The attention tier keeps `payload.attentionExclusions[]`, whose `code` is
   validated against `RLATTN.REFUSAL_CODES`, so an action-side reason cannot
   join it without failing the publish gate. Design places routing refusals in a
   new payload key rendered inside the existing evidence drawer — a key, not a
   new tier, view or feed, so Non-Goal 3 holds. FR-020-037 remains the
   requirement.
2. **Resolved in design — deterministic selection order under the action cap.**
   Evidence recency, then severity, then originating topic identifier, then
   finding identifier. FR-020-013 remains the requirement; NFR-020-001 is the
   assertion that it does not drift.
3. **Resolved in design — whether a topic finding may originate an action.** It
   may, but the write happens in the collector rather than inside a lane, so no
   lane's key ownership widens and the write-disjointness rule is untouched.
4. **Closed — the eight channels do not cover every topic, and that is
   correct.** `geopolitical-supply-chain` covers Hormuz and `commodities-energy`
   covers oil and fertilizer, as assumed. The assumption that the eight are
   *sufficient for all three topics* does not hold: a defense earnings
   acceleration finding has no certified channel. The vocabulary is certified
   upstream and a channel cannot be invented, so the resolution is the named
   no-seed outcome in FR-020-027, not a ninth channel.
5. **Open — attribution of a topic-originated call in the scorecard's
   presentation.** FR-020-034 requires origin to change no scoring rule.
   Whether the reader sees a per-topic error rate broken out, or only the single
   aggregate rate, is a presentation decision that must not become a
   differential scoring rule by accident.

---

*Educational models — not investment advice. Every figure in these tools is a
hypothetical output from editable assumptions, not a forecast. Do your own due
diligence and size positions yourself.*
