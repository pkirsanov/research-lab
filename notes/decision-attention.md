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
- `scripts/build-attention-items.mjs` — the publish-time build step. Calls the module's own `buildAttentionItem` once per candidate and records every refusal.
- `scripts/validate-brief-payload.mjs` — the publish gate. Delegates every attention rule to the module.
- `scripts/build-attention-scorecard.mjs` — reduces the outcome ledger into the interruption rate. Not on the automated path; see §10.
- `scripts/brief-narrative-parallel.mjs` — where the agent is told what **judgement** to author. It no longer authors an envelope; see §7.
- `scripts/reader-vocabulary.mjs` — the reader-legibility field lists.
- `market-brief.html` — the render surface.

---

## 0. TL;DR

Decision Attention is the **urgency** tier. It carries things that deserve the reader's attention
before the next session but do not clear the Red Alert bar. It lives inside the existing `brief`
view. Every item must be falsifiable, must land in a decision window, and must either name a
transmission channel or say plainly that it has none. Items in a terminal lifecycle state are
filtered out before ranking. One module owns every rule; the build step and the publish gate both
call that module rather than restating it. A candidate the module refuses is neither published nor
quietly dropped — it is recorded with its named reason, so published plus excluded always accounts
for every candidate declared.

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

**The author does not pick the window.** `scripts/build-attention-items.mjs` reads it off the
generation itself — the payload's own `window` — and merges it in *after* stripping the authored
keys, so a candidate that tried to author its own window loses it. The window a reader sees is
always the window the brief was generated for.

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

Three components sit on the path, in this order, and they run in this order in
`scripts/brief-refresh-and-push.sh`:

```
lane (judgement)  →  build-attention-items.mjs (observe + envelope)  →  validate-brief-payload.mjs (refusal)
```

The middle step has two halves, and the second one is where BUG-009 lived. `build-attention-items.mjs`
requires `rlattentiongate.js` and calls `attachObserved` to derive each candidate's **observed** half from
committed Tier-A state before composing the envelope. That producer's first commit is `8eec36f74`
(2026-08-19); the tier itself shipped in `4da32bb05` (2026-08-07). For everything in between, every
candidate reached the composer with no observation and was refused `RLATTN-PROVENANCE` — a fully wired path
that published nothing. See [`notes/market-brief.md`](market-brief.md) §10b.

### The lane authors judgement, not an envelope

Nine fields: `headline`, the falsifiability triple (`escalationTrigger`, `invalidation`, `expiry`),
the four judgement enums (`verb`, `horizon`, `severity`, `imminence`), and `rationale`. That list is
`AUTHORED_JUDGEMENT_KEYS` in the build step, and anything outside it is stripped before the composer
sees it, so a stray envelope field cannot ride along.

### The build step composes the envelope

`build-attention-items.mjs --recompose --write` calls `RLATTN.buildAttentionItem(gateResult, authored, ctx)`
once per candidate. The three arguments have three different origins and the step keeps them apart:

| Argument | Origin |
| --- | --- |
| `gateResult` | observed — the candidate's own market facts |
| `authored` | judgement — what the lane wrote, and nothing else |
| `ctx` | deterministic — committed watchlist scope, exchange calendar, window vocabulary, generation window |

`ctx` is single-sourced from `scripts/validate-brief-payload.mjs`, so the step that BUILDS an item and
the gate that REFUSES one cannot disagree about the scope, the calendar, or the vocabulary.

The composer answers `{ ok, item }`. What publishes is the envelope inside the result, never the wrapper.

The recompose is **additive or nothing**. Each surviving item keeps every field the composer does not
own — `title`, `what`, `why`, `structuralAnchor` and the rest belong to the older catalyst contract, and
the envelope is merged over the published item rather than replacing it. The step refuses to write if a
pre-existing top-level payload key would be lost.

### The publish gate re-checks every item

`scripts/validate-brief-payload.mjs` requires `rlattention.js` through `createRequire` and re-exports
the module's own predicate:

```js
export const validateAttentionItem = RLATTN.validateAttentionItem;
```

It then calls that predicate per item and pushes each violation as
`attention[i].<field> <CODE>: <message>`. It also enforces the card maximum and validates the shape of
every exclusion record.

**The gate restates no attention rule locally.** The headline ceiling, the falsifiability triple, the
window vocabulary, the transmission channels, and the provenance class all have exactly one definition.

This matters because two copies of a rule drift. The browser and the publish gate would then disagree
about what is publishable, and the disagreement would surface as a brief that validates locally and
renders wrong, or renders fine and fails to publish. Whichever way it broke, the debugging would start
in the wrong file. Identity re-export makes that class of bug impossible rather than unlikely.

If you need a new rule, put it in `rlattention.js`. Do not add a check to the gate.

### Nothing is silently dropped

A candidate the composer refuses is excluded from `attention[]` **and recorded** in
`attentionExclusions[]` with its `index`, its `subject`, the closed `RLATTN-*` `code`, the offending
`field`, and the composer's own `reason`. Published plus excluded equals the number of candidates
declared; `tests/attention-payload-contract.test.mjs` asserts that equality directly.

A refusal is therefore actionable rather than merely counted. Excluding a candidate is also a **correct
outcome, not a run failure** — the build step exits 0 when it refuses one, because the tier is a
ceiling and never a quota, so publishing six items instead of seven is right. A genuine build error
exits non-zero and fails the attempt.

### Hard cutover: no default, no soft fallback

There is no dual-shape acceptance window and no value substituted for a missing field. A `ctx` member
no committed artifact can supply is left **absent**, so the composer refuses the item by name rather
than composing something plausible. If every candidate is refused, `attention[]` is empty and the tier
renders its declared empty state — the brief still publishes.

`attentionExclusions` itself is validated **when present** rather than required. The key arrives with
the build step's payload cutover, and refusing every brief until then would have taken the live 4×/day
publication down for a key nothing wrote yet. Its *shape* is not optional: a `code` outside
`REFUSAL_CODES`, or a missing `field` or `reason`, fails the gate. A reason that names no real refusal
code reads as an explanation and explains nothing.

### A privacy refusal withholds the value it refused

`RLATTN-PRIVACY` is the one refusal whose own subject is the thing being protected. It is raised
*because* the candidate named something outside the public scope — a subject off the watchlist, or a
position field. Recording that name would publish, into a public repository and permanently into git
history, the exact value the guard had just refused. A guard that refuses a value and then discloses it
is worse than no guard.

So for that code alone the recorded `subject` becomes `[redacted: privacy refusal]` — in the payload
record **and** in the step's stdout, because stdout reaches CI logs and transcripts that cannot be
retracted. `index`, `code`, `field` and `reason` are untouched, so the refusal stays countable and
actionable; only the offending value goes.

The redaction is keyed on the **code**, not on one call site, because `rlattention.js` raises
`RLATTN-PRIVACY` from more than one place and both must withhold. Every other refusal still names its
subject: an `RLATTN-OVERLAP` refusal is about a public watchlist ticker, so withholding it would
protect nothing and would remove the operator's only handle on the refusal.

---

## 8. Why the build step exists — read this before touching the contract

**This is the most important operational warning in this document.**

The lane used to emit a `decision-attention/v1` envelope directly, guided by a prose instruction that
named every required field. That arrangement failed twice, in two different ways.

**First failure — the instruction lagged the contract.** The validator was tightened and the payload
was migrated; the authoring instruction was not updated in the same change. Within hours the 4×/day
cron republished the brief and re-emitted the pre-migration item shape. The scheduler does not know a
migration occurred. It runs the instruction it has. The window between a commit and the next cron run
is at most a few hours.

**Second failure — the instruction was correct and still did not hold.** With the instruction intact
and the publication gate armed, three consecutive cron publishes emitted **zero** conforming items. A
prose instruction to a language model is advisory. It is not a mechanical guarantee, and no amount of
editing the prose makes it one.

So the lane no longer emits the envelope at all. It authors judgement, and
`scripts/build-attention-items.mjs` constructs the envelope by calling the certified composer.
**Compliance became structural rather than advisory: the lane cannot emit a non-conforming envelope
when it no longer emits the envelope.**

What that changes about your edit:

| You are adding | Must the authoring instruction change? |
| --- | --- |
| a field the composer derives from `gateResult` or `ctx` | No. The build step already supplies it. |
| a field in `AUTHORED_JUDGEMENT_KEYS` | No. The instruction **renders** the key list from that array. |

That second row used to read "**yes**, in the same change", and it was the last piece of advisory
compliance left on the path. It cost two publishes: successive runs described the same nine fields in prose
and the author supplied a different subset each time, dropping `rationale` on one run and
`escalationTrigger` on the next. The key list is now rendered from `AUTHORED_JUDGEMENT_KEYS` by
`attentionAuthoredKeysInstruction()`, so the ask and the refusal move together and the sentence cannot lag
the array. Six other gate-enforced contracts are rendered the same way; see
[`notes/market-brief.md`](market-brief.md) §10b for the full set and the general rule.

The residual risk is narrower again, but it has not vanished: an item missing an authored judgement field is
still **refused rather than defaulted**, and rendering guarantees the author is *told* the key, not that a
language model supplies it. Migrate `market-brief.payload.json` in the same change as well.

**The one thing that must never be skipped:** the build step has to run on the publication path,
between the lane and the gate. Skipping it does **not** fail loudly — it silently republishes the
previous generation's attention set. That is why it lives in `scripts/brief-refresh-and-push.sh` and
not in an operator's memory.

---

## 9. How to add or change a field

Do these in order.

1. Decide whether the field is genuinely per-item. Anything constant belongs in config, not the item.
2. Add the check to `rlattention.js`, in the shared helper used by **both** `buildAttentionItem` and
   `validateAttentionItem`. Do not add it to one path only.
3. Pick an existing refusal code from `REFUSAL_CODES`, or add one there. The list is closed; keep it closed.
4. Add the field to the frozen item in `buildAttentionItem` and to `toViewModel`. `toViewModel` returns
   raw strings and booleans only — the caller escapes.
5. If — and only if — the field is authored judgement, add it to `AUTHORED_JUDGEMENT_KEYS` in
   `scripts/build-attention-items.mjs`. That is the whole edit: the authoring instruction in
   `scripts/brief-narrative-parallel.mjs` renders its key list from that array and needs no change. A field
   the composer derives from `gateResult` or `ctx` needs neither. See §8.
6. Migrate `market-brief.payload.json` **in the same change**. `build-attention-items.mjs --recompose
   --write` re-composes the committed items through the composer and is the intended way to do it.
7. Add the field pattern to `scripts/reader-vocabulary.mjs`. Put it in `BRIEF_NARRATIVE_FIELDS_REQUIRED`
   unless it is genuinely intermittent. Move a pattern to the optional list only because it is
   intermittently emitted, never to silence a red required pattern.
8. Extend the tests: the module unit tests, the payload contract test, and the browser spec.
9. Run the publish gate and the selftest before committing.

Do not add the check to `scripts/validate-brief-payload.mjs`. It delegates by design (§7).

---

## 10. Known open items

Two items recorded here at delivery are now **closed**. They are named so a future reader does not go
looking for a defect that is no longer there:

- **The vacuous rank rationale is fixed.** `rankRationale` now detects a shared subject. When the two
  reasons also match it states the fact once and says the item below stands on the same footing;
  when they differ it distinguishes "a second `<subject>` item". Sharing a subject stayed valid, so
  the repair went into the sentence and not into a uniqueness rule.
- **The two conditionally-present confirmation fields are fixed.**
  `attention.[].marketConfirmation.detail` and `attention.[].marketConfirmationNote` now sit in
  `BRIEF_NARRATIVE_FIELDS_OPTIONAL` in `scripts/reader-vocabulary.mjs`, each proven against
  `rlattention.js` as its producer rather than against the assembling script, which never names them.
  The leak gate still checks both identically; only the proof of realness moved.

One item is open, and it is operational rather than cosmetic.

**The outcome ledger is empty, and no closure step appends to it.**
`market-brief.attention-outcomes.jsonl` currently holds zero lines, and the only callers of
`appendOutcomeRecord` are the CLI and the tests. The scorecard *producer* is no longer the gap —
`scripts/build-attention-scorecard.mjs` now runs on both publication paths (Feature 026 Scope 5), so the
record is current rather than frozen. What is still missing is anything that records a **closure**. The
consequence is honest but inert: the committed
`market-brief.attention-scorecard.json` reports a null rate and states that the closed sample is too
small, and it will keep saying exactly that until closures are recorded. That is
`computeInterruptionRate` refusing to publish a number below `minClosedSample` (20), which is the
designed behaviour and not a bug — but it means the tier can interrupt the reader four times a day and
cannot yet answer for how often it was right. Closing this needs a closure step on the publication
path. It does not need a change to the rate maths.

---

## 11. Verification status

Re-verified 2026-08-08:

| Check | Result |
| --- | --- |
| `node --test tests/rlattention.test.mjs` | 27/27 |
| `node --test tests/attention-payload-contract.test.mjs` | 27/27 |
| `node scripts/selftest.mjs` | 1273 passed, 0 failed |
| `node scripts/validate-brief-payload.mjs market-brief.payload.json` | exit 0 |
| `node scripts/audit-reader-legibility.mjs` | 0 leaks across 23 pages |
| `tests/attention-browser.spec.mjs` (`--project=system-chrome`) | **not re-run in this pass** — needs the `system-chrome` project |

The payload committed at 2026-08-08 carried 3 published items and 2 recorded exclusions, both
`RLATTN-OVERLAP`. Those were composed before the gate producer existed; see §7. The payload committed at
2026-08-20T18:58Z carries 1 published item.

`rlattention.js` exports 19 frozen members: `CONTRACT_VERSION`, `ATTENTION_LIFECYCLE_STATES`,
`ATTENTION_LIFECYCLE_TRANSITIONS`, `DECISION_WINDOWS`, `isIsoInstant`, `RESEARCH_VERBS`, `LIMITS`,
`TERMINAL_OUTCOME_CLASSES`, `REFUSAL_CODES`, `resolveDecisionWindow`, `buildAttentionItem`,
`validateAttentionItem`, `rankAttentionItems`, `selectAttentionItems`, `rankRationale`,
`applyAttentionLifecycleEvent`, `deriveOutcomeRecord`, `computeInterruptionRate`, `toViewModel`.
`isIsoInstant`, `RESEARCH_VERBS` and `LIMITS` were added after 2026-08-08 so the authoring instruction could
be rendered from the values the gate refuses on rather than restating them. `rlattentiongate.js` exports 12:
`CONTRACT`, `SEVERITIES`, `SUBJECT_RESOLUTION_FIELDS`, `resolvePolicy`, `resolveSubject`,
`observableSubjects`, `severityFor`, `imminenceFor`, `confirmationFor`, `dispositionFor`, `observeGate`,
`attachObserved`.

Re-run all six before any change to the tier. The browser spec needs the `system-chrome` project.
