# Decision Attention — Agent Handoff

> **Tier:** Decision Attention · **Module:** [`rlattention.js`](../rlattention.js)
>
> **This is the handoff doc for the next agent or operator working on the Decision Attention tier.**
> It records what the tier is, the rules that are ratified rather than inferred, and the one change
> pattern that will break the brief if you get it wrong. Read §8 before you touch the validator.
>
> **Educational only — NOT investment advice.** Attention items are research prompts. The tier uses
> research verbs only and never emits an execution command.

Companion files:

- [`notes/market-brief.md`](market-brief.md) — the 4×/day brief runbook. Decision Attention renders inside that brief.
- `rlattention.js` — the one composer and validator for this tier. Browser global `RLATTN`; UMD, so Node tests get the same object.
- `rlmarketaction.js` — the certified alert engine. Owns the lifecycle vocabulary, the transmission channels, the research verbs, and Red Alert.
- `scripts/validate-brief-payload.mjs` — the publish gate. Delegates every attention rule to the module.
- `scripts/brief-narrative-parallel.mjs` — where the agent is told what to author into `attention`.
- `scripts/reader-vocabulary.mjs` — the reader-legibility field lists.
- `market-brief.html` — the render surface.

---

## 0. TL;DR

Decision Attention is the **urgency** tier. It carries things that deserve the reader's attention
before the next session but do not clear the Red Alert bar. It lives inside the existing `brief`
view. Every item must be falsifiable, must land in a decision window, and must either name a
transmission channel or say plainly that it has none. Items in a terminal lifecycle state are
filtered out before ranking. One module owns every rule; the publish gate calls that module rather
than restating it.

---

## 1. What the tier is, and what it is not

Decision Attention answers "what should I look at before the next window opens?"

Red Alert answers a different question: "is this severe enough to interrupt everything?"

These are two axes, not two levels of one axis. Urgency is not weak severity.

| | Decision Attention | Red Alert |
| --- | --- | --- |
| Axis | urgency | severity |
| Contract | its own, versioned independently | its own, versioned independently |
| Owner | `rlattention.js` | `rlmarketaction.js` |
| Admission | field rules per item | seven hard gates plus a score threshold |
| Ceiling | 7 cards | policy `visibleCap` |
| Rank input | imminence, channel, window | admission score |

Red Alert keeps its seven hard admission gates: two independent current origin groups, owner market
evidence, a minimum severity, complete falsifiable fields, no unresolved source conflict, cutoff and
staleness compatibility, and the admission score threshold. Those gates and the numeric thresholds in
`market-brief.config.json` are untouched by this feature. `tests/red-alert.security.mjs` asserts that
the config block and the engine's embedded default policy are equal, so any drift fails a test rather
than shipping.

**Lowering the Red Alert bar was considered and rejected.** It was the smaller change on paper: widen
the gates, let urgent-but-not-severe items through, ship one tier instead of two. It was rejected
because Red Alert is trustworthy exactly because it is hard to enter. A reader who has learned that a
Red Alert means "drop what you are doing" will keep that reflex only while the gate stays expensive.
Diluting a certified severity gate to carry urgency would have spent that trust to save a module.
Do not revisit this by widening the gates. If Decision Attention needs to be louder, change
Decision Attention.

---

## 2. Where it lives

Inside the existing `brief` view of `market-brief.html`. There is **no fifth view**.

The four view ids stay exactly:

```
['brief', 'portfolio', 'red-alert', 'journey']
```

They are declared once as `CENTER_VIEW_IDS` in `rlmarketaction.js`. The count and the exact ids are
asserted by `tests/attention-payload-contract.test.mjs` and again by `scripts/selftest.mjs`
(`viewCount === 4`). Adding a view is therefore a test-visible act, not an accident.

Render hosts inside the brief view:

| Element | Holds |
| --- | --- |
| `#decisionAttention` | the ranked attention cards |
| `#attentionRecord` | how the decision list has actually turned out |
| `#attention` | the legacy feed, still rendered by `RLBRIEF` from the same payload |

`market-brief.html` loads `rlattention.js` with `defer` and renders through `RLATTN.selectAttentionItems`.
The page decides layout. It does not decide admission, ranking, or suppression.

---

## 3. The item shape

Field names below are exactly as the module emits them. Read `rlattention.js` if you need the checks.

### The falsifiability triple

| Field | Rule |
| --- | --- |
| `escalationTrigger` | non-empty. What would make this a bigger deal. |
| `invalidation` | non-empty. What would make this wrong. |
| `expiry` | a resolvable ISO instant. When this stops being a live claim. |

All three are required. Missing any one is refused as an incomplete falsifiability triple.

They exist because **an attention item with no invalidation is an unfalsifiable claim, and an
unfalsifiable claim cannot be acted on or scored.** A reader cannot decide what to do with a warning
that no observation could ever retire. The interruption rate in §6 cannot score it either: an item
that can never be wrong will never close as `expired-without-effect`, so a tier full of them would
report a flattering rate that means nothing. The triple is what makes the tier auditable against
reality instead of against its own confidence.

### The decision window

`decisionWindow` is one of `pre-market`, `morning`, `pre-close`, `after-hours` — the same four windows
the brief publishes on. It is resolved, not stored raw. `resolveDecisionWindow` takes the window id, a
trading date, an observed session calendar, and a window vocabulary of `{ anchor, offsetMinutes }`
where `anchor` is `open` or `close`. It emits `windowBoundaryUtc`, `windowTradingDate`, and
`windowResolvedFrom`.

A non-trading date, or a boundary that has already elapsed, rolls forward to the next observed session
and reports `windowResolvedFrom: "next-session-open"`. A window never resolves into the past. There is
no clock inside the module; every instant is passed in, so the same inputs always produce the same
item.

`horizon` is declared separately and is not the window. The window is when the reader should look. The
horizon is how long the effect is expected to run.

### The transmission path

`transmissionPath` is a list of channels drawn from the certified `TRANSMISSION_CHANNELS` vocabulary
read from `rlmarketaction.js`. A channel outside that vocabulary is refused as an unrecognised
channel. You cannot invent a channel here. If the vocabulary is missing one, add it upstream where
the alert engine can see it too.

`transmissionAbsenceNote` carries the explicit statement of an absent channel. See §4.

The path exists so the tier says **how** an effect would reach the reader's holdings, not just that
something happened. It is also a rank input, which is why an unmapped item cannot outrank a mapped one
on volume alone.

### The provenance class

`figures` is a list. Every figure carries `label`, `value`, and `provenance` with a non-empty
`sourceId` and an ISO `asOf`. A figure with no source and no as-of instant does not render; it is
refused as an unattributed figure. There is no unattributed number on this tier.

`observedAt`, `severity`, and `imminence` are also provenance-class checks: an observation carries the
instant it was observed, and both vocabularies are closed.

### The market confirmation

`marketConfirmation.state` is `present`, `absent`, or `partial`.

- `present` requires `marketConfirmation.detail` naming the observed instrument evidence.
- `absent` or `partial` requires `marketConfirmationNote` saying so.

Exactly one of the two text fields is required per item, decided by the state. This is deliberate:
**absence is a value.** An unconfirmed item must read as unconfirmed. It must never render as blank
and be mistaken for neutral or for confirmed-but-quiet.

### Privacy

`size`, `quantity`, `costBasis`, and `pnl` are scanned for recursively and refused as position
disclosure. The subject must also sit inside the public watchlist scope, and must not already be
published as an action — a subject surfaced twice is refused as a duplicate surface. This repo is
public and the watchlist is tickers only.

### Closed vocabularies

| Vocabulary | Values |
| --- | --- |
| `DECISION_WINDOWS` | `pre-market`, `morning`, `pre-close`, `after-hours` |
| imminence (rank order) | `imminent`, `developing`, `latent` |
| severity | `mild`, `moderate`, `severe` |
| confirmation state | `present`, `absent`, `partial` |
| eligible gate disposition | `attention`, `context`, `no-action` |
| `TERMINAL_OUTCOME_CLASSES` | `escalated`, `confirmed`, `resolved`, `expired-without-effect` |
| `REFUSAL_CODES` | 12 closed refusal codes, enumerated in the module |

Only a non-committal gate disposition may become an attention item. A gate result that already
committed to an action belongs to the action path, not here.

---

## 4. The imminence-conditional transmission rule

**State this one carefully, because it looks like an inconsistency and is not.**

An empty `transmissionPath` is treated differently depending on `imminence`:

| `imminence` | `transmissionPath` empty | `transmissionAbsenceNote` |
| --- | --- | --- |
| `imminent` | allowed | **required** — refuses without it |
| `developing` | allowed | optional |
| `latent` | allowed | optional |

An item whose imminence is `imminent` with an empty path **must state that absence explicitly**. An
effect asserted to be arriving right now, with no identified channel, is an unfalsifiable claim. The
reader is being told the water is rising and not being told where it is coming in. Forcing the author
to write the absence down turns a silent gap into a stated one.

An item whose imminence is `developing` may carry an empty path with no absence marker. The channel is
genuinely not yet known. Saying so is honest but optional, because nothing is being asserted as
already in motion.

**Imminence is the discriminator, not the emptiness of the path on its own.** Do not "simplify" this
into "an empty path always requires a note" — that would make the routine developing case noisy for no
gain. Do not simplify it the other way into "an empty path is always fine" — that is the exact hole
the rule closes. This shape was **ratified, not inferred**. It is one condition in
`checkTransmission(path, absenceNote, imminence)`. Leave it as three arguments.

---

## 5. Terminal-state suppression

Items in a terminal lifecycle state are filtered out of selection.

The lifecycle is the nine certified states read from `rlmarketaction.js` at load time, plus two
append-only terminals this module adds: `escalated` and `superseded`. The certified edges are
preserved verbatim. The new edges all terminate — nothing travels back upstream into the certified
graph. A live item can be escalated off this tier, and any open item can be closed by a named
successor. Closing as `superseded` must name that successor or it is refused as an invalid close.

If a certified state disappears upstream, the module refuses at load with a lifecycle-drift error
rather than running against a vocabulary the alert engine no longer shares.

**Terminal states are derived, not listed.** `TERMINAL_STATES` is computed as every state whose
transition list is empty. That currently resolves to `rejected`, `invalidated`, `resolved`, `stale`,
`escalated`, and `superseded`. The consequence matters: if you later add an outbound edge from one of
those states, it stops being terminal automatically and starts appearing on the tier again. That is
the intended behaviour. Do not add a hand-maintained terminal list next to the derived one.

Enforcement sits in `isLiveAttentionItem`, which treats an unrecognised state as **not** live. An
item whose state the module does not know is never assumed publishable.

The rule is applied at both the module level and the published surface. `selectAttentionItems` filters
terminal items **before ranking and before the cap**, and `market-brief.html` obtains its rendered feed
only through that function. The surface therefore cannot render a terminal item, because it has no
path to the list that bypasses the filter.

One consequence to keep straight: `suppressed` is a **cap-overflow set, not a rejection set**. A
terminal item is absent from `published` and absent from `suppressed`, because it left the tier rather
than being held back by the ceiling. Do not report `suppressed` as "everything we did not show".

Note the honest gap: `scripts/validate-brief-payload.mjs` does not independently re-check terminal
state. It validates fields. Suppression is a selection rule, and selection happens at render.

---

## 6. Ranking, the cap, and the record

The rank key is, in order: imminence, then whether a channel is identified, then the decision window,
then the first channel, then subject, headline, and id as a deterministic tiebreak.

**Severity is deliberately not part of the rank key.** A severe claim with no identified channel ranks
below a moderate one whose effect is already arriving. Loudness does not buy queue position on an
urgency tier. Ranking is a pure total order and is byte-identical under any input permutation.

The cap is 7 cards (`attentionMaxCards`). The headline ceiling is 120 characters. An empty published
list renders the explicit statement "Nothing requires attention in this window." rather than an empty
box.

`deriveOutcomeRecord` turns a closed item into an `attention-outcome/v1` record. `computeInterruptionRate`
reports the share of closed items that turned out to matter, and refuses to report a rate at all below
`minClosedSample` (20 closed items). Below that it says the sample is too small. It never reports a
flattering zero.

---

## 7. The publication path

`scripts/validate-brief-payload.mjs` requires `rlattention.js` through `createRequire` and re-exports
the module's own predicate:

```js
export const validateAttentionItem = RLATTN.validateAttentionItem;
```

It then calls that predicate per item and pushes each violation as
`attention[i].<field> <CODE>: <message>`. It also enforces the card maximum.

**The gate restates no attention rule locally.** The headline ceiling, the falsifiability triple, the
window vocabulary, the transmission channels, and the provenance class all have exactly one definition.

This matters because two copies of a rule drift. The browser and the publish gate would then disagree
about what is publishable, and the disagreement would surface as a brief that validates locally and
renders wrong, or renders fine and fails to publish. Whichever way it broke, the debugging would start
in the wrong file. Identity re-export makes that class of bug impossible rather than unlikely.

If you need a new rule, put it in `rlattention.js`. Do not add a check to the gate.

---

## 8. The atomic three-part change — read this before touching the validator

**This is the most important operational warning in this document.**

Three things must move in the same change:

1. the predicate in `rlattention.js`,
2. the migration of `market-brief.payload.json` to the new shape,
3. the `attention` authoring instruction in `scripts/brief-narrative-parallel.mjs`.

Miss the third and the brief cannot publish.

The authoring instruction is the string that tells the agent what to write into `attention` on every
run. It sits in the parallel narrative task that declares `keys: ['attention', 'recommendations', 'events']`.
As written today it names the card cap and asks for ranked items. It does **not** name this tier's
required fields. Anything the instruction does not name is not reliably authored, and anything not
authored fails the gate.

**This is not theoretical. It happened during delivery.** The validator was tightened and the payload
was migrated. The authoring instruction was not updated in the same change. Within hours the 4×/day
cron republished the brief and re-emitted the pre-migration item shape — exactly as predicted. The
scheduler does not know a migration occurred. It runs the instruction it has.

So the failure mode is specific and repeatable: tighten the validator, and the next scheduled run
authors the old shape, the gate rejects it, and the brief stops publishing until someone notices. The
window between your commit and the next cron run is at most a few hours.

Treat the three edits as one commit. If you cannot land all three, land none.

---

## 9. How to add or change a field

Do these in order.

1. Decide whether the field is genuinely per-item. Anything constant belongs in config, not the item.
2. Add the check to `rlattention.js`, in the shared helper used by **both** `buildAttentionItem` and
   `validateAttentionItem`. Do not add it to one path only.
3. Pick an existing refusal code from `REFUSAL_CODES`, or add one there. The list is closed; keep it closed.
4. Add the field to the frozen item in `buildAttentionItem` and to `toViewModel`. `toViewModel` returns
   raw strings and booleans only — the caller escapes.
5. Update the `attention` authoring instruction in `scripts/brief-narrative-parallel.mjs` **in the same
   change**. See §8.
6. Migrate `market-brief.payload.json` **in the same change**.
7. Add the field pattern to `scripts/reader-vocabulary.mjs`. Put it in `BRIEF_NARRATIVE_FIELDS_REQUIRED`
   unless it is genuinely intermittent. Move a pattern to the optional list only because it is
   intermittently emitted, never to silence a red required pattern.
8. Extend the tests: the module unit tests, the payload contract test, and the browser spec.
9. Run the publish gate and the selftest before committing.

Do not add the check to `scripts/validate-brief-payload.mjs`. It delegates by design (§7).

---

## 10. Known open items

Two things are true today and are not yet fixed. Both are cosmetic-to-moderate, neither blocks publish.

**The rank rationale can render a vacuous self-comparison.** `rankRationale(higher, lower)` builds its
sentence from each item's subject label. When two adjacent ranked items share a subject, the output
reads like "QQQ is placed above QQQ because its effect is already arriving and a transmission channel
is identified, while for QQQ its effect is still developing and no transmission channel is identified."
Every clause is literally true and the sentence is useless to a reader. The comparison needs a
discriminator other than the subject when the subjects match — the headline is the obvious candidate,
since it is already part of the tiebreak. Not yet done.

**Two conditionally-present confirmation fields are declared REQUIRED.**
`attention.[].marketConfirmation.detail` and `attention.[].marketConfirmationNote` both sit in
`BRIEF_NARRATIVE_FIELDS_REQUIRED` in `scripts/reader-vocabulary.mjs`. By the rule in §3, exactly one of
them is present on any given item and the other is legitimately absent, decided by
`marketConfirmation.state`. They belong on the optional list, but that list is pinned pattern-and-producer
by an assertion in `scripts/selftest.mjs`, so they cannot simply be moved. The consequence: a future
healthy publish could turn them red for the wrong reason. The real fix is a conditional class in the
vocabulary — "required when state is X" — rather than moving them and weakening the pin.

---

## 11. Verification status

Recorded at delivery, all green:

| Check | Result |
| --- | --- |
| `tests/rlattention.test.mjs` | 25/25 |
| `tests/attention-payload-contract.test.mjs` | 15/15 |
| `tests/attention-browser.spec.mjs` (`--project=system-chrome`) | 6/6 |
| `node scripts/selftest.mjs` | 1251 passed, 0 failed |
| `node scripts/validate-brief-payload.mjs` | exit 0 |
| `node scripts/audit-reader-legibility.mjs` | 0 leaks across 23 pages |

`rlattention.js` exports 16 frozen members: `CONTRACT_VERSION`, `ATTENTION_LIFECYCLE_STATES`,
`ATTENTION_LIFECYCLE_TRANSITIONS`, `DECISION_WINDOWS`, `TERMINAL_OUTCOME_CLASSES`, `REFUSAL_CODES`,
`resolveDecisionWindow`, `buildAttentionItem`, `validateAttentionItem`, `rankAttentionItems`,
`selectAttentionItems`, `rankRationale`, `applyAttentionLifecycleEvent`, `deriveOutcomeRecord`,
`computeInterruptionRate`, `toViewModel`.

Re-run all six before any change to the tier. The browser spec needs the `system-chrome` project.
