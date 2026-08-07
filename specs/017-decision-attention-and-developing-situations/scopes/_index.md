# Scopes Index — Decision Attention And Developing Situations

Feature directory: `specs/017-decision-attention-and-developing-situations`
Repository: `research-lab` (root `~/research-lab`)

Decision Attention is a first-class tier **inside the existing Brief view** of
`market-brief.html`. It names unusual developments — an earnings print far
outside its implied move, a supply disruption, a tightening geopolitical
situation, funding stress building for a third session — that could change a
decision today or in the next session. It does **not** lower the Red Alert bar
and it adds **no fifth view**.

## Scope Ordering Rationale

The capability module lands first because the item contract, the lifecycle
superset and the ranking are the single definition point that the validator, the
renderer and the reducer all consume; building any consumer before it would
duplicate the contract. The publication path is enforced next so no unvalidated
item can ever reach the page, then the Brief tier renders what the validator has
already proven publishable. The outcome record follows the render because it
measures what readers actually saw, and the legacy feed reconciliation runs last
because full-suite acceptance can only judge view identity, Red Alert
byte-identity and the performance budgets once every earlier surface exists.

Scope 6 was added after the first five, once three consecutive cron publishes
proved that an authoring instruction alone does not make the lane comply. It
routes the lane through the certified composer at publish time. It sits after the
module, the validator and the tier because it consumes all three: the composer it
calls is Scope 1's, the gate its output must satisfy is Scope 2's, and the empty
state its all-excluded case must render is Scope 3's.

## Scope Inventory

| # | Scope | Artifact | Depends On | Status |
|---|---|---|---|---|
| 1 | Attention Capability Module And Item Contract | [`01-attention-capability-module/scope.md`](01-attention-capability-module/scope.md) | none | Not Started |
| 2 | Publication-Path Enforcement | [`02-publication-path-enforcement/scope.md`](02-publication-path-enforcement/scope.md) | 1 | Not Started |
| 3 | Brief Tier Render | [`03-brief-tier-render/scope.md`](03-brief-tier-render/scope.md) | 1, 2 | Not Started |
| 4 | Outcome Record And Interruption Rate | [`04-outcome-record-and-interruption-rate/scope.md`](04-outcome-record-and-interruption-rate/scope.md) | 1, 3 | Not Started |
| 5 | Legacy Feed Reconciliation And Acceptance | [`05-legacy-feed-reconciliation-and-acceptance/scope.md`](05-legacy-feed-reconciliation-and-acceptance/scope.md) | 2, 3, 4 | Not Started |
| 6 | Authoring Lane Composer Routing | [`06-authoring-lane-composer-routing/scope.md`](06-authoring-lane-composer-routing/scope.md) | 1, 2, 3 | Not Started |

---

## Execution Outline

### Phase Order

1. **Attention Capability Module And Item Contract** — build `rlattention.js`, the
   frozen vocabularies, the 11-state lifecycle superset with its load-time drift
   assertion, decision-window resolution against the exchange calendar, item
   validation, and deterministic ranking. Nothing renders yet.
2. **Publication-Path Enforcement** — replace the length-cap-only attention check
   in `scripts/validate-brief-payload.mjs` with the full field predicate, at the
   rigour already applied to actions, and add the attention payload keys
   additively.
3. **Brief Tier Render** — add the `#decisionAttention` section above `#attention`
   in `market-brief.html`, covering populated, empty, expanded-item, degraded and
   narrow projections, with tooltips everywhere and escaping at every sink.
4. **Outcome Record And Interruption Rate** — append-only
   `market-brief.attention-outcomes.jsonl`, the
   `scripts/build-attention-scorecard.mjs` reducer, and the `#attentionRecord`
   block below `#scorecard`, disjoint from the recommendation scorecard.
5. **Legacy Feed Reconciliation And Acceptance** — resolve H-4 and H-5, then run
   full-suite acceptance across legibility, view identity, Red Alert
   byte-identity, performance budgets and the project selftest.
6. **Authoring Lane Composer Routing** — add `scripts/build-attention-items.mjs`
   as a publish-time step, shrink the `attention` authoring instruction to the
   `authored` argument of `buildAttentionItem`, and record every refused
   candidate in `attentionExclusions[]` so no declared candidate can silently
   vanish.

### New Types And Signatures

`rlattention.js` — UMD, global `RLATTN`, Node-loadable, no build step, exactly
16 frozen members:

```text
RLATTN.VERSION                      string
RLATTN.CERTIFIED_LIFECYCLE_STATES   frozen 9  (referenced from rlmarketaction.js)
RLATTN.LIFECYCLE_STATES             frozen 11 (certified 9 + escalated + superseded)
RLATTN.TERMINAL_STATES              frozen    (includes escalated, superseded)
RLATTN.LIFECYCLE_TRANSITIONS        frozen    (certified edges preserved verbatim)
RLATTN.TRANSMISSION_CHANNELS        frozen 8
RLATTN.RESEARCH_VERBS               frozen 6
RLATTN.DECISION_WINDOWS             frozen 4  (market-brief-config-page/v1)
RLATTN.URGENCY_LEVELS               frozen    (independent axis)
RLATTN.SEVERITY_LEVELS              frozen    (independent axis)
RLATTN.LIMITS                       frozen    { headlineMaxChars: 120,
                                                attentionMaxCards: 7,
                                                minClosedSample: 20 }
RLATTN.assertLifecycleIdentity()    -> void | throws RLATTN-LIFECYCLE-DRIFT
RLATTN.resolveDecisionWindow(w, d)  -> { window, sessionOpenIso } | throws
RLATTN.validateAttentionItem(item)  -> { ok, refusals[] }
RLATTN.applyLifecycleTransition(…)  -> nextState | throws RLATTN-LIFECYCLE
RLATTN.rankAttentionItems(items)    -> ordered array (total order, no clock)
```

Refusal codes surfaced by the module: `RLATTN-LIFECYCLE-DRIFT`,
`RLATTN-LIFECYCLE`, `RLATTN-HEADLINE`, `RLATTN-FALSIFIABILITY`,
`RLATTN-TRIGGER`, `RLATTN-EXPIRY`, `RLATTN-WINDOW`, `RLATTN-DISPOSITION`,
`RLATTN-SUBJECT-OVERLAP`, `RLATTN-PRIVACY`, `RLATTN-TRANSMISSION`,
`RLATTN-CONFIRMATION`, `RLATTN-PROVENANCE`, `RLATTN-VERB`.

Payload keys added additively to `market-brief.payload.json`:
`decisionAttention.items[]`, `decisionAttention.generatedForSessionIso`,
`decisionAttention.emptyState`, `attentionRecord.summary`.

Data artefacts: `market-brief.attention-outcomes.jsonl` (append-only) reduced by
`scripts/build-attention-scorecard.mjs` into
`market-brief.attention-scorecard.json`, carrying `warrantedShare` and
`expiredWithoutEffectShare`. This record is **disjoint** from
`market-brief.scorecard.json` — never summed, never merged.

### Validation Checkpoints

| After scope | Gate that must pass before the next scope starts |
|---|---|
| 1 | `node --test tests/rlattention.test.mjs` green for all 25 module scenarios; module loads in Node with 16 frozen members |
| 2 | `node scripts/validate-brief-payload.mjs` refuses the two adversarial fixtures with a named field and a non-zero exit; validator/browser predicate parity proven on one fixture |
| 3 | Browser tier renders from committed data with no key and no proxy; legibility clean on the tier |
| 4 | `node scripts/build-attention-scorecard.mjs` produces the record; `market-brief.scorecard.json` byte-identical before and after a full attention generation |
| 5 | `node scripts/selftest.mjs` exits 0 with the new module registered; view ids and Red Alert gates byte-identical |
| 6 | `node scripts/validate-brief-payload.mjs` exits 0 against a payload the authoring lane produced THROUGH the build step; published plus excluded equals declared on a mixed generation; an all-refused generation still publishes |

### Scope Table

| # | Scope | Depends On | Surfaces | Test Plan rows | Design tests |
|---|---|---|---|---|---|
| 1 | Attention Capability Module And Item Contract | none | module | 25 | T-01 … T-24 + amendment 1 |
| 2 | Publication-Path Enforcement | 1 | validator, payload | 3 | T-32, T-33, T-43 |
| 3 | Brief Tier Render | 1, 2 | Brief view | 5 | T-34, T-35, T-36, T-37, T-41 |
| 4 | Outcome Record And Interruption Rate | 1, 3 | ledger, reducer, record block | 7 | T-25 … T-31 |
| 5 | Legacy Feed Reconciliation And Acceptance | 2, 3, 4 | page, suite | 5 | T-38, T-39, T-40, T-42, T-44 |
| 6 | Authoring Lane Composer Routing | 1, 2, 3 | build step, lane, payload | 7 | none — F-017-06 postdates the design test table |

Total Test Plan rows: **53**. Scenario id range: **SCN-017-001 … SCN-017-053**.
`test-plan.json` and `scenario-manifest.json` are authoritative for both. The
scope-2 row above still reads 3 and has read 3 since that scope's own amendment
added TP-02-04 and SCN-017-045; correcting it belongs to the scope-2 owner, so
the column sum is one short of the total until then.

---

## Plan Amendments

Each entry records a scope-structure decision taken after the initial plan. The
entries are append-only and are numbered independently of the scopes.

### Amendment 1 — Scope 1 owns the terminal-state selection filter

**Raised by:** the Scope 4 execution session, which reported SCN-017-033
(escalation produces one live surface rather than two) RED with no fix available
from any path Scope 4 is allowed to touch.

**Decision:** Scope 1 owns the fix. Scope 4's allowed paths are unchanged and
`rlattention.js` stays excluded from Scope 4.

**Reasoning.** The defect is that `selectAttentionItems` has no terminal-state
filter, so an item escalated to Red Alert is still published as a live attention
item. That function lives in `rlattention.js`, which is Scope 1's deliverable, and
the rule it must apply is `TERMINAL_STATES`, which Scope 1 already defines and
derives from the transition table. Scope 1 is `In Progress`, not closed, so this
is an incomplete requirement rather than a regression against delivered
behaviour; it belongs in Scope 1's Definition of Done, not in a bug folder.

Widening Scope 4's allowed paths was rejected. Scope 1 carries
`foundation:true`, and letting a downstream consumer scope edit the capability
foundation whenever one of its tests goes red is exactly the layering that tag
exists to prevent. Scope 4 lists `rlattention.js` as excluded deliberately;
turning that into a one-off exception would set the precedent that any consumer
may reach back into the foundation, and the blast radius — Scope 1's 24 passing
module tests — would sit with someone other than their owner. It would also
misrecord the archaeology: a later reader would conclude the escalation duplicate
lived in the outcome-record scope, when it lived in the selection function.

The cost is that Scope 4's TP-04-01 cannot go green until Scope 1's amendment
lands. That is not a new coupling. Scope 4 already declares `Depends On: 1`, so a
defect surfacing in 4 and being fixed in 1 is the declared dependency working as
intended.

**Recorded as:** SCN-017-046 and TP-01-25 in
`01-attention-capability-module/scope.md`, one Core Delivery DoD item, one Test
Evidence DoD item, implementation plan step 13, and a cross-scope note in
`04-outcome-record-and-interruption-rate/scope.md`. Every new checkbox is
unticked.

**Semantic rule settled by this amendment — `suppressed`.** The exclusion runs
before ranking and before the `attentionMaxCards` slice, so a terminal item is
absent from `suppressed` as well as from `published`. `suppressed` means "live,
qualified, and held back by the ceiling" — it is a cap-overflow set, not a
rejection set. An item that stood down was not held back by anything; it left the
tier. `capApplied` therefore reports only live items displaced by the cap, and a
generation whose every candidate is terminal yields `published: []`,
`suppressed: []`, `capApplied: false` and the existing empty statement. That is
the empty-tier success state Scope 1 already sanctions, and it is never padded.

### Amendment 2 — Scope 6 routes the authoring lane through the certified composer

**Raised by:** finding F-017-06, recorded in `design.md`. Three consecutive cron
publishes — `348c9f88` (pre-market), `d2f85159` (after-hours) and `1412f3e0` —
each emitted zero `decision-attention/v1` markers while enforcement was fully
intact: `grep -c validateAttentionItem scripts/validate-brief-payload.mjs` = 3,
and the authoring instruction still named every required field. The gate works
and the instruction exists; compliance is nonetheless zero, and
`node scripts/validate-brief-payload.mjs` exits 1 so the brief cannot publish.

**Decision:** a new Scope 6 owns the routing. It depends on 1, 2 and 3.

**Reasoning.** `rlattention.js` already exposes the correct separation in
`buildAttentionItem(gateResult, authored, ctx)` — observed gate result,
human-authored judgement, deterministic context. The lane asks the model for that
composer's OUTPUT instead of for its `authored` argument, which makes a prose
author responsible for schema serialization: closed vocabularies, ISO instants,
lifecycle enums, provenance arrays, window resolution. A prose instruction is
advisory, not enforcing. So the lane authors only `authored`; a publish-time
build step supplies `gateResult` and `ctx`; the composer builds each envelope or
refuses that candidate with a named `RLATTN-*` code; a refused candidate is
excluded and its reason recorded; and an all-refused generation publishes an
empty set and the tier's declared empty state.

Extending Scope 2 was rejected. Scope 2 is `In Progress` with its own evidence
already recorded against the assumption F-017-06 supersedes, and folding a
supersession into a scope whose report already narrates the superseded position
would make the archaeology unreadable. A separate scope keeps the decision, its
executed evidence and its consequences in one place.

**Why the empty set is not the banned soft fallback.** The prohibition is on
substituting a DEFAULT for a MISSING value. Nothing is defaulted — every
published field is observed, derived from a committed contract, or authored.
Exclusion happens BEFORE the payload is formed, so FR-037 still holds exactly as
written: a payload carrying any refused item is still refused whole, because a
refused item never reaches the payload. This is fail-loud at ITEM granularity
rather than PAYLOAD granularity, and the hard-cutover posture is untouched.

**Consequence for Scope 2, owed to the planning owner.** Step 7 of Scope 6
shrinks the `attention` authoring instruction, removing the decision window, the
transmission path and the provenance class from the ask. Scope 2's SCN-017-045
and TP-02-04 assert that the instruction NAMES those three, so executing Scope 6
as written turns SCN-017-045 RED. That is the ratified consequence of F-017-06,
which states the instruction "does not grow to cover the full field set — it
SHRINKS to the `authored` argument". Scope 6 does not edit Scope 2; narrowing
another scope's scenario from inside this one would hide the supersession in a
diff rather than record it. Reconciling SCN-017-045 — narrowing it to the fields
the instruction still asks for, or retiring it in favour of SCN-017-053 — is owed
before Scope 6 is executed.

**Recorded as:** SCN-017-047 through SCN-017-053 and TP-06-01 through TP-06-07 in
`06-authoring-lane-composer-routing/scope.md`, registered in `test-plan.json` and
`scenario-manifest.json`, with the scope added to `state.json` `scopeProgress` as
`not_started`. Every checkbox in the new scope is unticked.
