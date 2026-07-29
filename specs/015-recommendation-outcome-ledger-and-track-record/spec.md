# Feature: 015 Recommendation Outcome Ledger And Track Record

## Problem

The Market Action Center publishes actionable recommendations four times a day and has done so for weeks. It has
never once been told whether any of them were right.

This is not a reporting gap. It is a **structural** one: the system that publishes recommendations cannot, even in
principle, resolve them — and the history it has already written cannot be scored retroactively at all.

### The confidence number is a schema constant, not a probability

`market-brief.config.json` declares `minimumActionConfidence: 55` and `tacticalConfidenceCap: 55`, and
[scripts/validate-brief-payload.mjs](../../scripts/validate-brief-payload.mjs) enforces both — a floor at
[#L75](../../scripts/validate-brief-payload.mjs#L75) and the tactical ceiling in the same contract. A tactical
action is therefore mathematically pinned to **exactly 55**. Every confidence value in the live
`market-brief.payload.json` falls in the band `[55, 62]`.

That number is presented to a reader as a probability. It is not one. It has never been compared against a single
realised outcome. No frequency, no interval, no reference class, no scoring rule. It is a constant that the schema
requires to be present.

### The recommendation ledger is cryptographically anonymous

Feature 002 built a real content-addressed history. It works, and it is being written to:
`briefs/history/recommendations/2026-07.jsonl` held **165 rows across 83 distinct recommendation keys and 33
runs** when recounted on 2026-07-28 (earliest run `dist-2026-07-19-after-hours-…`, latest
`dist-2026-07-28-pre-market-…`).

That figure is a **point-in-time observation, not a constant.** The scheduler publishes four times a day, so every
one of those counts grows with every window until the frozen-claim contract lands. It is cited here as recountable
evidence of scale; the authoritative value is whatever the ledger holds when it is read. No downstream artifact —
spec, design, scope, test, or rendered surface — may carry this number forward as a literal.

Every one of those rows has this exact shape (`brief-recommendation-history-row/v1`):

| Field | Example |
|---|---|
| `canonicalMonth` | `2026-07` |
| `contractVersion` | `brief-recommendation-history-row/v1` |
| `eventId` | `sha256:f2c4693b…` |
| `eventType` | `proposed` |
| `occurredAt` | `2026-07-20T01:50:58.434Z` |
| `recommendationKey` | `sha256:097a3427…` |
| `runId` | `dist-2026-07-19-after-hours-2116a85fb14a` |

There is no subject. No instrument. No direction. No horizon. No trigger. No invalidation. No confidence.

The key itself is a one-way hash. The live publisher builds it at
[scripts/brief-distributed-publish.mjs#L405](../../scripts/brief-distributed-publish.mjs#L405):

```js
const recommendationKey = stableSha({ contractVersion: 'brief-distributed-reckey/v1', subject, family });
```

…and its preimage is persisted **nowhere**. Verified against the whole object store, recounted 2026-07-28. The
object counts below grow with every window exactly as the ledger does; the **zeros** are the load-bearing part and
are invariant:

- `briefs/objects/tool-briefs/` — **255 objects (sharded layout), 0 with a non-empty `recommendations[]` array**.
- `briefs/objects/final-briefs/` — 33 objects; top-level keys are `asOf`, `bench`, `contractVersion`,
  `derivation`, `marketClosed`, `narrativeRef`, `nextSessionDate`, `regime`, `runId`, `sourceSummary`, `thesis`,
  `window`. There is no `recommendations` key at all.
- A repository-wide scan for a persisted `"subject"` field across all **581** objects in `briefs/objects/`
  returns **0 objects**.

The recommendation *content* exists in exactly one place — `market-brief.payload.json`, the current pointer, which
is overwritten on every run. Once the next window publishes, the claim is gone and only its hash survives.

**Consequence: every row already written is permanently unresolvable.** Not "hard to resolve" — unresolvable. You
cannot score `sha256:097a3427…` because nothing in the repository records what it claimed. Any track record this
feature produces necessarily starts at zero on the day the claim contract lands. Back-filling it would be
fabrication.

### Every event is `proposed`; nothing ever closes

The ledger's `eventType` distribution is a single bucket — every row is `proposed` and not one is a closure
(recounted 2026-07-28: `{'proposed': 165}` across all 165 rows). The *shape* of that distribution is the
invariant; the magnitude is a point-in-time count that keeps growing until the contract lands.

This is not a limitation of the lifecycle engine — the engine is complete. `rlcontracts.js` already defines the
full closed vocabulary at [#L720](../../rlcontracts.js#L720):

```js
var CLOSE_EVENT_TYPES = Object.freeze({
  withdrawn: true, expired: true, satisfied: true,
  invalidated: true, unresolved: true, "not-evaluable": true
});
```

…and `reduceRecommendationEvents` ([#L1134](../../rlcontracts.js#L1134)) implements the full
proposed / reaffirmed / modified / superseded / conflicted / closure transition set, with
`deriveRecommendationKeys` at [#L1034](../../rlcontracts.js#L1034) and `groupRecommendations` at
[#L1325](../../rlcontracts.js#L1325).

The live publisher bypasses all of it. It hardcodes `eventType: 'proposed'` at
[scripts/brief-distributed-publish.mjs#L407](../../scripts/brief-distributed-publish.mjs#L407) and never calls the
reducer. A complete, tested lifecycle engine sits beside a ledger that only ever appends one event type.

### The evaluation statistics already exist and are wired to nothing

This is the part that makes the feature cheap. `rlvalidation.js` (`RLVALID`, Feature 007) exports exactly seven
frozen, Node-safe, deterministic primitives:

| Primitive | Line | What it gives this feature |
|---|---|---|
| `rlvBuildPurgedFolds` | [#L45](../../rlvalidation.js#L45) | Embargoed evaluation windows — leakage control |
| `rlvAdjustBenjaminiHochberg` | [#L63](../../rlvalidation.js#L63) | Discovery-rate correction |
| `rlvAdjustHolm` | [#L76](../../rlvalidation.js#L76) | Family-wise error correction |
| `rlvDeflatedSharpe` | [#L87](../../rlvalidation.js#L87) | Multiple-testing discount (Bailey–López de Prado) |
| `rlvWilsonInterval` | [#L112](../../rlvalidation.js#L112) | **Interval on a hit rate** — the honest probability claim |
| `rlvQuantiles` | [#L122](../../rlvalidation.js#L122) | Outcome distribution shape |
| `rlvSummarizeOutcomes` | [#L134](../../rlvalidation.js#L134) | **`winRate`, `averageWin`, `averageLoss`, `mean`** |

`rlvSummarizeOutcomes` alone yields the hit rate, the payoff asymmetry, and the expected value per call. Combined
with `rlvWilsonInterval` it yields a calibrated rate *with stated uncertainty*. That is the entire scorecard.

It is Node-safe and deterministic by proof, not assertion — `scripts/validate-technical-analysis-decision.mjs`
asserts `rlvalid-node-safe-no-dom-storage-network` and `rlvalid-100-repeat-byte-determinism`, and
`scripts/selftest.mjs` extracts all seven declarations.

**And no brief script references it.** A grep for `RLVALID|rlvalidation` across `scripts/brief-*.mjs` and
`scripts/validate-brief-*.mjs` returns zero matches.

### The resolution substrate is already committed

`data/bars/` holds **289 committed symbol files**; `data/options/` holds 23 snapshots; `data/calendars/` and
`data/company-fundamentals/` are present. Outcomes for equity and ETF claims are computable offline, deterministically,
from data already in the repository. No new provider, no new fetch path, no new credential.

### What this feature is, and is not

**015 is the measurement layer for recommendations. It is not a new recommender, and it is not a new Market Action
Center view.**

Adding a fifth top-level view is structurally impossible and correctly so: the Center composes exactly four views
(`brief`, `portfolio`, `red-alert`, `journey`) and its contract validator refuses a fifth with the closed code
`RLMKT-VIEW`. 015 therefore ships as a **separate registered tool** and feeds the Center's existing Brief view
through the shared cache, exactly like every other source tool.

Three things are missing, and this feature owns all three:

1. **A resolvable claim** — the recommendation must persist what it actually claimed, in a machine-checkable form,
   at proposal time.
2. **A deterministic resolver** — at horizon expiry, read committed bars and emit a signed numeric outcome plus a
   closure event drawn from the *existing* `CLOSE_EVENT_TYPES` vocabulary through the *existing* reducer.
3. **A track-record surface** — a registered tool that runs `RLVALID` over the resolved ledger and shows hit rate
   with interval, payoff asymmetry, expected value, calibration by confidence bucket, and a multiplicity discount.

### Boundary against concurrent features

| Feature | Status | Boundary |
|---|---|---|
| 002 Distributed tool briefs and history | `blocked` | Owns the content-addressed graph, the ledger writer, and `reduceRecommendationEvents`. 015 **extends the row and adds a claim object**; it must not fork the reducer, the vocabulary, or the object-store layout. |
| 007 Technical analysis decision lab | — | Owns `rlvalidation.js`. 015 **consumes** all seven primitives and must not re-implement, fork, or shadow any statistic. |
| 012 Market Action Center | `blocked` | Owns the four-view Center and `rlmarketaction.js`. 015 must not add a view, must not write Center state, and must not alter the four-view composition. |
| 013 Market regime stack | `blocked` | Owns the sole regime composer and declares the `rldata.js` persisted cache schema protected. 015 must not compose a regime and must not alter the persisted cache shape. |

## Outcome Contract

**Intent:** Every recommendation the Market Action Center publishes carries, at proposal time, a machine-checkable
statement of what would make it right and what would make it wrong; is automatically resolved against committed
price data when its horizon expires; and accumulates into a public track record where any displayed probability is
backed by a realised frequency and its uncertainty interval — so that "high probability" becomes an earned claim
instead of a schema constant.

**Success Signal:** For a recommendation proposed in window *W* with horizon *H*, a claim object persists its
subject, direction, predicate, horizon, and outcome-magnitude definition; at *W + H* a deterministic resolver reads
only bars dated at or before the resolution date and emits exactly one closure event from `CLOSE_EVENT_TYPES`
together with a signed numeric outcome; that outcome flows through the existing `reduceRecommendationEvents`
without forking it; and the track-record tool renders a hit rate **with its Wilson interval**, an average win and
average loss, an expected value per call, and an explicit sample count — recomputing byte-identically from the
same ledger on every run.

**Hard Constraints:**

- **HC-1 — Statistics are consumed, never re-implemented.** All scoring uses the seven `RLVALID` primitives. 015
  introduces no new estimator, no hand-rolled interval, and no private correlation discount.
- **HC-2 — The lifecycle engine is reused, never forked.** Closure events are drawn from the existing
  `CLOSE_EVENT_TYPES` ([rlcontracts.js#L720](../../rlcontracts.js#L720)) and applied through the existing
  `reduceRecommendationEvents` ([#L1134](../../rlcontracts.js#L1134)).
- **HC-3 — No fifth Center view.** 015 registers as its own tool. It must not add, rename, or reorder a Market
  Action Center view, and must not trip `RLMKT-VIEW`.
- **HC-4 — The track record starts at zero.** Every ledger row written before the claim contract lands is
  unresolvable by construction. They must be reported as an explicit unresolvable-history count that is
  **computed by counting the ledger at render time**, never a hardcoded literal — a baked-in constant on the
  surface is itself a violation of this constraint, because the population grows with every published window
  until the contract lands, so a frozen number silently becomes a false one. That count must never be
  back-filled, estimated, imputed, or silently excluded from the denominator without being shown.
- **HC-5 — No lookahead.** Resolution reads only observations dated at or before the resolution date. A claim
  resolved with data unavailable at resolution time is a contract violation, not a rounding error.
- **HC-6 — The predicate is frozen at proposal time.** A claim's resolution rule is authored when the claim is
  made and is immutable thereafter. Scoring against a predicate written or amended after the outcome is known is
  hindsight and is forbidden.
- **HC-7 — Zero is not unresolved.** `rlvSummarizeOutcomes` derives `unresolved = count − wins − losses` where
  wins are `> 0` and losses are `< 0` ([rlvalidation.js#L134](../../rlvalidation.js#L134)), so an exactly-zero
  outcome is silently counted as unresolved. The resolver must never emit a bare `0` for a resolved-flat outcome;
  resolved-flat and unresolved must be distinguishable in the record.
- **HC-8 — No point probability without its interval.** A displayed rate must always carry its interval and its
  sample count. A hit rate rendered alone is not publishable.
- **HC-9 — Descriptive only.** No execution, no order placement, no position sizing, no allocation, no advice. A
  track record is a measurement, never a recommendation to act.
- **HC-10 — Offline and deterministic.** Resolution and scoring run from committed data with no network call and
  no provider credential, and produce byte-identical output for identical input.

**Failure Condition:** The feature has failed — even with every test green — if any of the following is true: a
hit rate is displayed without its interval or sample count; the unresolvable pre-existing history is back-filled,
imputed, or dropped from view; a claim is scored against a predicate authored after its outcome was observable;
resolution consumes an observation dated after the resolution date; a resolved-flat outcome is reported as
unresolved; a small sample is presented as a calibrated probability without its width being visible; the tool
emits an action, a size, or an allocation; or a statistic is computed anywhere other than through `RLVALID`.

## Domain Capability Model

The capability is a closed measurement loop: a **claim** is frozen at proposal time, a **resolver** converts it to
a signed outcome at horizon expiry, and a **scorer** aggregates outcomes into a track record with stated
uncertainty. Every primitive below is neutral with respect to which tool proposed the claim, which instrument it
names, and which surface renders the result.

### Domain Primitives

| # | Primitive | Definition | State / Vocabulary | Invariant |
|---|---|---|---|---|
| P1 | **Claim Subject** | The entity a recommendation is about: an instrument, a basket, a sector, or a market aggregate. | `instrument`, `basket`, `sector`, `aggregate` | A subject is always explicit and always resolvable to a data series or explicitly marked `not-evaluable`. |
| P2 | **Resolvable Claim** | The frozen, machine-checkable statement of a recommendation: subject, direction, predicate, horizon, and outcome-magnitude definition. | Frozen at proposal; immutable | A claim is inseparable from the recommendation key it hashes to. A claim without a predicate is not publishable. |
| P3 | **Resolution Predicate** | The boolean condition, evaluable from committed observations, that determines whether the claim was satisfied or invalidated. | `threshold`, `relative`, `directional`, `spread` | Authored at proposal time. Immutable. Evaluable without human judgement. |
| P4 | **Horizon** | The decision window over which the predicate is evaluated, and the date at which the claim expires if unresolved. | `intraday`, `next-session`, `multi-session`, `event-bound` | Every claim has exactly one horizon. An event-bound horizon resolves at the event, not at a fixed date. |
| P5 | **Outcome** | The signed numeric result of resolving a claim, in the magnitude unit the claim declared. | `> 0` win, `< 0` loss, resolved-flat sentinel, or unresolved | Never a bare `0` for resolved-flat (HC-7). Always carries the closure event that produced it. |
| P6 | **Closure Event** | The lifecycle transition that ends a claim, drawn from the existing closed vocabulary. | `satisfied`, `invalidated`, `expired`, `withdrawn`, `unresolved`, `not-evaluable` | Drawn from `CLOSE_EVENT_TYPES` only. Never invented, never extended locally. |
| P7 | **Evaluation Cohort** | The grouping over which a rate is computed: all claims, or claims sharing a confidence bucket, action type, horizon, or owning tool. | Declared per scorecard | A cohort is never silently mixed. A rate always names its cohort and its sample count. |
| P8 | **Multiplicity Context** | How many distinct claim families were proposed over the evaluation period, used to discount an apparent edge. | `familyCount`, `trialCount` | Travels with any performance statistic. A discounted statistic never omits its trial count. |
| P9 | **Track Record** | The aggregate scorecard for a cohort: hit rate with interval, average win, average loss, expected value, distribution, and multiplicity discount. | Recomputed, never stored as truth | Every displayed rate carries its interval and sample count (HC-8). |

### Business Policies

- **BP-015-001 — Freeze before observe.** A claim's predicate, horizon, and magnitude definition are written at
  proposal time and hashed with the claim. Post-hoc authoring or amendment invalidates the claim for scoring.
- **BP-015-002 — Unresolvable history is shown, not hidden.** Every anonymous pre-contract row is reported in a
  first-class `unresolvable-legacy` count with an explanation, permanently. That count is derived by counting
  those rows at render time, never asserted as a literal.
- **BP-015-003 — Small samples are shown as small.** Below a declared minimum cohort size, the tool renders the
  interval and an explicit insufficient-sample state instead of a headline probability.
- **BP-015-004 — One statistic owner.** Every number in the track record traces to a named `RLVALID` primitive.
- **BP-015-005 — Resolution is idempotent.** Re-running the resolver over the same ledger and the same committed
  bars produces byte-identical outcomes and appends no duplicate closure event.
- **BP-015-006 — Not-evaluable is honest, not silent.** A claim whose subject has no committed series resolves to
  `not-evaluable` with a stated reason and is excluded from rate denominators while remaining visibly counted.

## Capability Inventory

| Capability | Exists today | Owner | 015 relationship |
|---|---|---|---|
| Content-addressed history graph | Yes | Feature 002 | Extend row; add claim object |
| Recommendation lifecycle reducer | Yes, unused by live publisher | Feature 002 (`rlcontracts.js#L1134`) | Consume unchanged |
| Closed closure vocabulary | Yes, unused | Feature 002 (`rlcontracts.js#L720`) | Consume unchanged |
| Purged/embargoed folds | Yes | Feature 007 (`rlvalidation.js#L45`) | Consume |
| Multiplicity corrections (BH, Holm) | Yes | Feature 007 (`#L63`, `#L76`) | Consume |
| Deflated Sharpe | Yes | Feature 007 (`#L87`) | Consume |
| Wilson interval | Yes | Feature 007 (`#L112`) | Consume |
| Outcome summary (rate, win/loss, mean) | Yes | Feature 007 (`#L134`) | Consume |
| Committed daily bars (289 symbols) | Yes | `data/bars/` | Consume read-only |
| **Resolvable claim contract** | **No** | — | **015 owns** |
| **Deterministic outcome resolver** | **No** | — | **015 owns** |
| **Track-record surface** | **No** | — | **015 owns** |

## Actors And Personas

| Actor | Description | Key Goals | Boundary |
|---|---|---|---|
| **Reader (self-directed researcher)** | Opens the Center, sees a recommendation with a confidence number, and needs to know whether that number has ever meant anything. | Judge whether to weight a recommendation; see the honest sample size. | Never receives advice, sizing, or execution. |
| **Brief Author (Tier-B agent lane)** | The scheduled narrative lane that proposes recommendations 4×/day. | Emit a claim that is resolvable; be scored honestly. | Must not author or amend a predicate after outcome is observable. |
| **Resolver (deterministic Tier-A job)** | The offline job that closes expired claims against committed bars. | Resolve every due claim exactly once; refuse when data is absent. | No network, no judgement, no provider credential. |
| **Track-Record Maintainer (repo owner)** | Reviews whether the system's stated confidence tracks realised frequency. | Detect miscalibration and overfitting; retire families that do not work. | Reads the record; does not edit outcomes. |

## Use Cases

### UC-001: Propose a resolvable recommendation

- **Actor:** Brief Author
- **Preconditions:** A recommendation is being composed for window *W*; its subject has a committed series or is
  explicitly marked non-evaluable.
- **Main Flow:**
  1. Author states subject, direction, and confidence.
  2. Author states the resolution predicate (P3) and the horizon (P4).
  3. Author states the outcome-magnitude definition.
  4. The claim is frozen, hashed, and persisted as a claim object; the ledger row references it.
- **Alternative Flows:** If no predicate can be stated, the recommendation is published as commentary and is
  explicitly excluded from scoring — visibly, not silently.
- **Postconditions:** The ledger row carries a `claimRef` resolvable to the frozen claim.

### UC-002: Resolve a due claim

- **Actor:** Resolver
- **Preconditions:** A claim's horizon has expired; committed bars cover the resolution date.
- **Main Flow:**
  1. Load all open claims whose horizon has expired.
  2. For each, read only observations dated at or before the resolution date.
  3. Evaluate the frozen predicate; compute the signed outcome magnitude.
  4. Emit exactly one closure event from `CLOSE_EVENT_TYPES` through `reduceRecommendationEvents`.
  5. Append the closure and the outcome to the ledger.
- **Alternative Flows:** Missing series → `not-evaluable` with reason. Ambiguous/insufficient data →
  `unresolved`. Superseded by a later claim on the same key → the reducer's existing supersession path.
- **Postconditions:** Every due claim has exactly one closure event; re-running appends nothing.

### UC-003: Read the track record

- **Actor:** Reader
- **Preconditions:** At least one resolved outcome exists.
- **Main Flow:**
  1. Open the tool; it auto-hydrates from the cache and the committed ledger.
  2. Simple view shows one verdict: realised hit rate with interval, sample count, expected value, and whether
     the sample is sufficient.
  3. Reader steers cohort levers (confidence bucket, action type, horizon, owning tool) and the verdict recomputes
     live.
- **Alternative Flows:** Zero resolved outcomes → honest empty state naming the unresolvable-legacy count and the
  date the record began.
- **Postconditions:** No number is displayed without its interval and sample count.

### UC-004: Detect miscalibration

- **Actor:** Track-Record Maintainer
- **Preconditions:** Resolved outcomes span more than one confidence bucket.
- **Main Flow:**
  1. Open Power view; read the calibration table — stated confidence vs realised frequency per bucket, each with
     its Wilson interval and count.
  2. Read the multiplicity panel — family count, trial count, and the discounted statistic.
  3. Identify buckets whose realised frequency lies outside the stated confidence interval.
- **Postconditions:** Miscalibration is visible with its uncertainty; no automated action is taken.

### UC-005: Refuse to score an unresolvable claim

- **Actor:** Resolver
- **Preconditions:** A ledger row exists with no `claimRef` (legacy) or a claim whose subject has no series.
- **Main Flow:**
  1. Detect absence of a frozen claim or of a committed series.
  2. Classify as `unresolvable-legacy` or `not-evaluable` with an explicit reason.
  3. Exclude from rate denominators; include in the visible counts.
- **Postconditions:** The reader sees the excluded count and why; nothing is imputed.

## Business Scenarios

### BS-001: A claim is proposed with a frozen predicate
```
Given a recommendation for a named subject with a stated direction and confidence
When it is published in window W
Then a claim object persists its subject, direction, predicate, horizon, and magnitude definition
And the ledger row references that claim by hash
And the predicate is immutable thereafter
```

### BS-002: A satisfied claim resolves to a positive outcome
```
Given an open claim whose horizon expired and whose predicate evaluates true on committed bars
When the resolver runs
Then exactly one "satisfied" closure event is appended through reduceRecommendationEvents
And a positive signed outcome is recorded in the claim's declared magnitude unit
```

### BS-003: An invalidated claim resolves to a negative outcome
```
Given an open claim whose invalidation condition was met before its horizon expired
When the resolver runs
Then exactly one "invalidated" closure event is appended
And a negative signed outcome is recorded
```

### BS-004: A resolved-flat outcome is not reported as unresolved
```
Given a claim that resolved with exactly zero magnitude
When the outcome is recorded and summarised
Then it is distinguishable from an unresolved claim
And it is not silently absorbed into the unresolved count by rlvSummarizeOutcomes
```

### BS-005: Legacy anonymous rows are never back-filled
```
Given a ledger of pre-contract rows carrying only a one-way recommendation key
When the track record is computed
Then those rows are counted from the ledger at render time and reported as an explicit unresolvable-legacy count with an explanation
And that count is never read from a hardcoded literal, because the population grows with every window until the contract lands
And no outcome is imputed, estimated, or inferred for any of them
And the track record's start date is stated plainly
```

### BS-006: A hit rate is never shown without its interval
```
Given a cohort with at least one resolved outcome
When a hit rate is rendered
Then its Wilson interval and its sample count are rendered with it
And a cohort below the declared minimum size renders an explicit insufficient-sample state
```

### BS-007: Resolution never reads the future
```
Given a claim whose resolution date is D
When the resolver evaluates its predicate
Then only observations dated at or before D are consulted
And a resolution attempted with data unavailable at D is refused
```

### BS-008: A predicate amended after the fact is refused
```
Given a frozen claim whose outcome is already observable
When an amended predicate is submitted for that claim
Then the amendment is refused
And the original frozen predicate remains the scoring basis
```

### BS-009: Re-running the resolver changes nothing
```
Given a ledger in which every due claim has been resolved
When the resolver runs again over the same committed bars
Then no duplicate closure event is appended
And the resulting track record is byte-identical
```

### BS-010: A claim with no committed series is not-evaluable
```
Given a claim whose subject has no series under data/bars/
When the resolver runs
Then the claim closes as "not-evaluable" with a stated reason
And it is excluded from rate denominators while remaining visibly counted
```

### BS-011: An apparent edge is discounted for multiplicity
```
Given a cohort spanning many distinct claim families over the evaluation period
When a performance statistic is displayed
Then the family count and trial count are displayed with it
And the multiple-testing-discounted statistic is shown alongside the raw one
```

### BS-012: The tool emits no action
```
Given any state of the track record
When the tool renders
Then it emits no order, no position size, no allocation, and no recommendation to act
And it states that it is a measurement surface, educational only
```

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 | A recommendation MUST persist a frozen claim object carrying subject, direction, predicate, horizon, and outcome-magnitude definition. |
| FR-002 | The ledger row contract MUST carry a resolvable reference to the frozen claim, additively, without breaking existing consumers of `brief-recommendation-history-row/v1`. |
| FR-003 | The resolver MUST evaluate only observations dated at or before the resolution date. |
| FR-004 | The resolver MUST emit exactly one closure event per claim, drawn from `CLOSE_EVENT_TYPES`, applied through `reduceRecommendationEvents`. |
| FR-005 | The resolver MUST distinguish resolved-flat from unresolved, and MUST NOT emit a bare `0` magnitude for resolved-flat. |
| FR-006 | The resolver MUST be idempotent: re-running appends no duplicate closure and changes no outcome. |
| FR-007 | The resolver MUST run offline from committed data with no network access and no provider credential. |
| FR-008 | All scoring statistics MUST be computed through `RLVALID` primitives; no statistic may be re-implemented locally. |
| FR-009 | Every displayed rate MUST carry its Wilson interval and its sample count. |
| FR-010 | A cohort below the declared minimum size MUST render an explicit insufficient-sample state rather than a headline probability. |
| FR-011 | The unresolvable-legacy count MUST be displayed permanently with an explanation and the track-record start date. |
| FR-012 | The tool MUST provide a Simple view (one verdict plus steerable cohort levers) and a Power view (calibration table, distribution, multiplicity panel, raw ledger), toggled by `#modeSeg` with the mode persisted. |
| FR-013 | The tool MUST auto-hydrate on load: cache-first paint, then delta-only refresh. It MUST NOT require a manual fetch click. |
| FR-014 | The tool MUST load `rldata.js`, then `rlapp.js`, then `rlnav.js`, and MUST report its data status through the shared status control. |
| FR-015 | Every ticker MUST be rendered through `RLTKR.tag` or an auto-linked container; no bare ticker may be printed. |
| FR-016 | Every term, KPI, badge, and value MUST carry a contextual tooltip stating both what it is and what the current reading means. |
| FR-017 | Every canvas chart MUST register a hit-test closure via `RLCHART.attach` and provide hover tooltips. |
| FR-018 | The tool MUST publish an `rl-tool-read/v1` owner read to the shared cache so the Market Action Center's existing Brief view can consume the track record without a new Center view. |
| FR-019 | The tool MUST be registered in `tools.json`, the `index.html` `TOOLS` array, and the `rlnav.js` `TOOLS` array, with a `notes/<id>.md` handoff document. |
| FR-020 | A committed validator MUST reject, with closed error codes, every contract violation named in the Hard Constraints. |
| FR-021 | The feature MUST NOT add, rename, or reorder a Market Action Center view, and MUST NOT alter the persisted `rldata.js` cache schema. |
| FR-022 | An amendment to a frozen predicate MUST be refused with a closed error code. |

## Non-Functional Requirements

| Dimension | Requirement |
|---|---|
| **Determinism** | Identical ledger plus identical committed bars produce byte-identical outcomes and byte-identical rendered statistics. |
| **Offline** | Resolution and scoring require no network, no provider key, and no proxy. |
| **Performance** | Simple-view first paint from cache under 1s on the committed ledger; full recompute of all cohorts under 2s. |
| **Accessibility** | Every chart has an equivalent Power-view table; tooltips are reachable; contrast meets the shared shell standard. |
| **Portability** | Single self-contained HTML file, no build step, GitHub-Pages deployable. |
| **Honesty** | No number without provenance; no rate without interval and count; no imputation anywhere. |
| **Privacy** | The tool reads only committed repository data and the shared cache. It records no positions, no sizes, and no P&L. |

## UI Scenario Matrix

Every row maps a user-visible scenario to the business scenarios and acceptance criteria it exercises, the actor,
the entry point, the precondition that puts the surface in that state, the user action, the observable outcome, the
surface it appears on, and the assertion an `e2e-ui` test makes. **View** is one of `Simple` (decision-first
cockpit, the default), `Power` (drill-in), or `Both`. Rows cover every declared state — sufficient, insufficient,
empty, resolved-flat, not-evaluable, withdrawn, unresolvable-legacy — plus the shell obligations (auto-hydrate,
mode persistence, tooltips, ticker linking, chart hover, a11y fallback, narrow reflow) and the no-action guarantee.

The single entry point for every Reader/Maintainer row is `recommendation-track-record-lab.html`; the `Entry point`
column names the control within it.

| # | Scenario | BS / AC id(s) | Actor | Entry point | Precondition | User action | Expected user-visible outcome | View | `e2e-ui` assertion |
|---|---|---|---|---|---|---|---|---|---|
| UI-01 | Honest empty state, zero resolved | BS-005, AC-008 | Reader | Page load | Claim contract live; ≥1 open claim; zero closures | Open the page | Headline reads `No resolved calls yet`; the count of open claims, the record start date, and the next due resolution date are shown; **no** rate, **no** range, **no** expected value anywhere; the unscoreable pre-contract count is present | Simple | `#verdictState` has text `No resolved calls yet`; page contains zero elements matching `[data-rate]`; `#coverageLine` contains the pre-contract count |
| UI-02 | Sufficient sample first paint | BS-006, AC-006, AC-013 | Reader | Page load | Resolved cohort at or above the declared minimum | Open the page | Range is rendered as the dominant element with the point estimate marked inside it; sample count and range width shown; expected value shown in a separate block | Simple | `#rangeLow`, `#rangeHigh`, `#pointEstimate`, `#sampleCount` all non-empty; computed font-size of `#rangeBand` label ≥ that of `#pointEstimate` |
| UI-03 | Rate never renders bare | BS-006, AC-006 | Reader | Any cohort with ≥1 resolved outcome | Read the headline | Every rendered rate is accompanied, in the same block, by its range and its sample count | Simple | for each `[data-rate]`, a sibling `[data-range]` and `[data-n]` exist and are non-empty |
| UI-04 | Interval is given a job | BS-006, RL-002 | Reader | Verdict block | Sufficient cohort | Read the precision line | Copy states what the sample **already rules out** and what it **cannot yet distinguish**, plus the additional resolved count that would halve the range | Simple | `#precisionRead` matches `/rules out/` and `/cannot yet/`; `#precisionToGo` non-empty |
| UI-05 | Distance-to-precision is labelled arithmetic | RL-002 | Reader | Precision line | Sufficient cohort | Hover `[how?]` | Tooltip states the figure is width-scaling arithmetic assuming the observed rate holds, and is not a forecast or a schedule | Both | tooltip text of `#precisionToGo` matches `/arithmetic/` and `/not a (forecast\|prediction)/` |
| UI-06 | Cohort steering recomputes live | UC-003, AC-014 | Reader | Cohort levers | ≥1 resolved outcome | Change the stated-confidence lever | Verdict, range, sample count, coverage line and closure mix all update in the same frame; the shared data-status control reports no new fetch | Simple | after `select#leverBucket` change, `#sampleCount` text differs and no new network request is recorded |
| UI-07 | Steering into a sparse cohort | BS-006, AC-007 | Reader | Cohort levers | Selected cohort below the declared minimum | Select a sparse bucket | Headline switches to `Not enough data yet`; observed wins over total is shown; the range is **still** rendered; no rate is claimed; the remaining count to reach the minimum is shown | Simple | `#verdictState` text is `Not enough data yet`; `[data-rate]` absent; `#rangeLow`/`#rangeHigh` present |
| UI-08 | Insufficient copy states both extremes | BS-006, RL-002 | Reader | Insufficient verdict | Sparse cohort | Read the body copy | Copy names that the range is consistent with the cohort being useless **and** with it being excellent | Simple | `#verdictBody` matches `/useless/` and `/excellent/` |
| UI-09 | Forecast quality and economic value are separated | RL-003 | Reader | Verdict area | Sufficient cohort | Read both blocks | `Were we right?` and `Did it pay?` are distinct blocks with an explicit separator; no combined score exists anywhere | Simple | `#blockRight` and `#blockPaid` are separate elements; separator `#blockSep` present; zero elements match `[data-composite-score]` |
| UI-10 | Non-implication is stated, not implied | RL-003 | Reader | Separator | Sufficient cohort | Hover the separator | Tooltip states that being right often and being paid well are different questions and neither follows from the other | Both | tooltip of `#blockSep` matches `/not the same/` and `/does not follow/` |
| UI-11 | Null payoff renders as an em dash | NFR Honesty | Reader | `Did it pay?` block | Cohort with wins but zero losses | Open that cohort | Average loss renders `—` with a tooltip explaining no loss has been recorded in this cohort; nothing crashes; the rest of the paint completes | Simple | `#avgLoss` text is `—`; `#blockRight` still rendered; zero console errors |
| UI-12 | Legacy disclosure is permanent | BS-005, AC-008, BP-015-002 | Reader | Coverage line | Any state | Load in any cohort, any view, any mode | The pre-contract unscoreable count and the record start date are present on every state including empty and insufficient | Both | `#coverageLine` present and contains the pre-contract count in all of: empty, insufficient, sufficient, Power |
| UI-13 | Legacy disclosure cannot be dismissed | BP-015-002 | Reader | Coverage line | Any state | Attempt to dismiss, collapse, or filter it away | No close, hide, dismiss or snooze control exists; no lever removes it; reload restores it identically | Both | `#coverageLine` contains no `button[data-dismiss]`, no `[aria-label*="close" i]`; still present after reload |
| UI-14 | Legacy explanation on demand | BS-005, RL-001 | Reader | `[why? ▾]` in coverage line | Any state | Expand it | Explains one-way hashing of `{subject, family}`, that the preimage was never persisted, and that scoring them was impossible then and is impossible now — no promise of future back-fill | Both | expanded `#legacyWhy` matches `/one-way/` and `/never (stored\|persisted)/`; does **not** match `/(will\|can) be (back-?filled\|recovered)/` |
| UI-15 | Denominator composition is visible | HC-8, BP-015-006 | Reader | Closure-mix panel | ≥1 closure | Read the closure mix | The panel states which closure types are inside the rate denominator and which are outside, with counts for each | Both | `#denominatorNote` non-empty and names each closure type present in `#closureMix` |
| UI-16 | Withdrawn survivorship is boundable | RL-008 | Reader | Closure-mix panel | ≥1 `withdrawn` closure | Read the withdrawn line | Both arithmetic extremes are shown — the rate if every withdrawn call had failed and if every one had worked — explicitly labelled bounds, not estimates | Both | `#withdrawnBound` contains two distinct percentages and matches `/bounds?, not (an )?estimates?/` |
| UI-17 | Withdrawn bound is not a steerable what-if | RL-008, BP-015-002 | Reader | Closure-mix panel | ≥1 `withdrawn` closure | Look for a control that applies the bound | No lever, toggle or checkbox promotes a bound into the headline rate | Both | no `input`/`select` within `#closureMix` mutates `#pointEstimate` |
| UI-18 | Not-evaluable is counted and explained | BS-010, BP-015-006 | Reader | Coverage line | ≥1 `not-evaluable` closure | Read the coverage line | The not-evaluable count is visible, excluded from the denominator, and its stated reason is reachable | Both | `#coverageLine` contains the not-evaluable count; hovering it yields a tooltip matching `/excluded from the rate/` |
| UI-19 | Resolved-flat is distinguishable from unresolved | BS-004, HC-7, AC-005 | Maintainer | Power ledger + closure mix | ≥1 resolved-flat outcome | Read the ledger row and the mix | Resolved-flat appears as its own labelled outcome, never merged into unresolved and never displayed as a bare `0` | Power | ledger row shows label `Resolved flat`; `#closureMix` lists resolved-flat separately from unresolved |
| UI-20 | Calibration drill | UC-004, BS-006 | Maintainer | Power → calibration table | Resolved outcomes span >1 stated-confidence bucket | Read the table | Each row shows stated confidence, realised rate, range, count, and an in-band / out-of-band / too-few verdict | Power | every `tbody tr` in `#calibTable` has non-empty range and count cells |
| UI-21 | Empty calibration bucket renders, never omitted | HC-8 | Maintainer | Power → calibration table | A declared bucket has zero resolved outcomes | Read the table | The bucket appears with `—` for realised and range and `n = 0`; the row is not dropped | Power | `#calibTable` row count equals the declared bucket count; the zero row shows `—` |
| UI-22 | Multiplicity panel | BS-011, AC-006 | Maintainer | Power → multiplicity | ≥1 resolved outcome | Read the panel | Family count and trial count are shown with the discounted statistic beside the raw one, labelled directional evidence rather than a significance test | Power | `#multiplicity` contains family count, trial count, both statistics, and matches `/directional/` and `/not a (significance )?test/` |
| UI-23 | Session cohort-shopping is counted | BS-011, RL-007 | Maintainer | Power → multiplicity | Reader has changed levers ≥2 times | Steer several cohorts, then open Power | The panel shows how many distinct cohorts were viewed this session and states that keeping the best of many looks is how a false edge is manufactured | Power | `#cohortsViewed` increments per distinct lever combination; copy matches `/best of/` |
| UI-24 | Distribution chart hover | AC-015, FR-017 | Maintainer | Power → distribution canvas | ≥1 resolved outcome | Hover a bar | Floating tooltip gives the bucket, its count, and what the reading means in context | Power | `mousemove` over the canvas yields a visible `RLCHART` tooltip containing the bucket label and count |
| UI-25 | Every chart has a table equivalent | NFR Accessibility | Maintainer | Power | ≥1 canvas rendered | Read the panel below each chart | A table carrying the same values as the chart is present and reachable by keyboard | Power | for each `canvas`, a following `table[data-chart-fallback]` exists with ≥1 row |
| UI-26 | Raw ledger audit | UC-005 | Maintainer | Power → ledger table | ≥1 closure | Open the ledger | Each row shows the claim reference, closure event, resolution date, signed outcome, and the cohort tags it contributed to | Power | each `#ledgerTable tbody tr` has non-empty claim-ref, event, date and outcome cells |
| UI-27 | Tickers are linked, never bare | FR-015, AC-015 | Reader | Any surface naming an instrument | ≥1 claim on a named instrument | Read any panel | Every instrument symbol is a link with a tooltip carrying its name and kind | Both | every text node matching a known symbol sits inside `a.tkr[href]` with a non-empty `title` |
| UI-28 | Every value carries a contextual tooltip | FR-016, AC-015 | Reader | Any surface | Any state | Hover any KPI, badge or value | Tooltip states both what the item is and what the current reading means | Both | every `[data-kpi]` has a non-empty `title`/`data-tip` whose text exceeds the label text |
| UI-29 | Auto-hydrate, no fetch click | FR-013, AC-013 | Reader | Page load | Cache populated or empty | Open the page | A meaningful state paints without any user action; there is no fetch/load/run button anywhere | Simple | within first paint `#verdictState` is non-empty; zero elements match `button[data-action="fetch"]` |
| UI-30 | Shared data-status reporting | FR-014 | Reader | Data-status control | Any state | Open the status control | The ledger and bars resources are listed with an honest state; a cached read is never labelled live | Both | status panel lists the ledger resource with one of `fresh`/`stale`/`refreshing`/`missing`/`error` |
| UI-31 | Mode toggle and persistence | FR-012, AC-014 | Reader | `#modeSeg` | Any state | Switch to Power, reload | `body` carries the `power` class; after reload Power is still active and levers are restored | Both | after reload `document.body.classList.contains('power')` is true and lever values match |
| UI-32 | Narrow reflow keeps the honesty furniture | NFR Accessibility | Reader | Page load at ≤520px | Any state | Load on a narrow viewport | Range, sample count, coverage line and the no-advice notice all remain visible; levers stack; nothing is truncated behind an ellipsis | Simple | at 520px width, `#rangeBand`, `#sampleCount`, `#coverageLine`, `#noAdviceNotice` all `toBeVisible()` |
| UI-33 | No action is emitted | BS-012, HC-9 | Reader | Any surface | Any state | Read the whole page | No order, size, allocation, target, stop, or directive appears; the measurement-surface notice is present | Both | page text does not match `/\b(buy\|sell\|allocate\|position size\|target price\|stop loss)\b/i`; `#noAdviceNotice` visible |
| UI-34 | Deep link out to the owning tool | UC-003 | Reader | Ledger row / cohort chip | Claim carries an owning tool | Follow the owning-tool link | Navigates to that tool; the track-record page state is preserved on return | Power | `a[data-owner-tool][href$=".html"]` present; back-navigation restores mode and levers |
| UI-35 | Center still composes exactly four views | HC-3, AC-011, FR-018 | Reader | Market Action Center | Track record published to the shared cache | Open the Center | The track record is legible inside the existing Brief view; the Center still shows exactly four views and no `RLMKT-VIEW` refusal occurs | Both | Center view count is 4; Brief view contains the track-record read; no fifth view control exists |

## Competitive Landscape

| Capability | Research Lab today | Typical retail platform | Forecasting platforms (Brier-scored) | Gap 015 closes |
|---|---|---|---|---|
| Publishes recommendations | Yes, 4×/day | Yes | Yes | — |
| States a confidence number | Yes, pinned to 55 | Rarely | Yes | Makes it earned |
| Resolves claims automatically | **No** | No | Yes | **Owned by 015** |
| Publishes a track record | **No** | Almost never | Yes, prominently | **Owned by 015** |
| Shows uncertainty on the rate | **No** | No | Sometimes | **Owned by 015** |
| Discounts for multiple testing | Available, unused | No | Rarely | **Owned by 015** |
| Admits unscoreable history | — | No | Rarely | **Owned by 015** |

The differentiating position is not "we publish calls." Everyone publishes calls. It is **"every call we publish is
automatically scored, and the score is shown with its uncertainty — including the part of our history we admit we
can never score."** Publicly admitting an unresolvable history is a trust asset, not a liability, and essentially
no retail-facing surface does it.

## Improvement Proposals

### IP-001: Resolvable claim contract ⭐ Competitive Edge
- **Impact:** High — nothing downstream is possible without it
- **Effort:** M
- **Advantage:** Converts a write-only ledger into a measurable one
- **Scenarios:** BS-001, BS-008

### IP-002: Deterministic offline resolver ⭐ Competitive Edge
- **Impact:** High
- **Effort:** M
- **Advantage:** Uses 289 committed symbol files; no new provider surface, no new credential
- **Scenarios:** BS-002, BS-003, BS-007, BS-009, BS-010

### IP-003: Track-record tool over `RLVALID`
- **Impact:** High
- **Effort:** M — statistics already exist; this is presentation plus cohorting
- **Advantage:** Turns confidence into a measured frequency with an interval
- **Scenarios:** BS-006, BS-011, BS-012

### IP-004: Calibration-aware confidence in the Brief
- **Impact:** High
- **Effort:** S once IP-001..003 land
- **Advantage:** Lets the 55-pin be replaced by a bucket-realised rate, unblocking the schema constant
- **Scenarios:** BS-006
- **Note:** Depends on a sufficient sample. Must not ship before BP-015-003 is enforced.

### IP-005: Retire chronically-wrong claim families
- **Impact:** Medium
- **Effort:** S
- **Advantage:** Uses the multiplicity panel to prune families that do not survive discounting
- **Scenarios:** BS-011

## Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-001 | A published recommendation persists a frozen claim resolvable by hash from its ledger row. |
| AC-002 | A due claim receives exactly one closure event from `CLOSE_EVENT_TYPES` via `reduceRecommendationEvents`. |
| AC-003 | Re-running the resolver produces byte-identical output and appends no duplicate closure. |
| AC-004 | Resolution consulting any observation dated after the resolution date is refused with a closed code. |
| AC-005 | A resolved-flat outcome is distinguishable from unresolved in both the record and the summary. |
| AC-006 | Every rendered rate carries a Wilson interval and a sample count. |
| AC-007 | A cohort below the minimum size renders an explicit insufficient-sample state. |
| AC-008 | The unresolvable-legacy count is computed from the ledger at render time — never a hardcoded literal — and is displayed with an explanation and the record start date. |
| AC-009 | Every displayed statistic traces to a named `RLVALID` primitive; no local re-implementation exists. |
| AC-010 | An attempt to amend a frozen predicate is refused with a closed code. |
| AC-011 | The Market Action Center still composes exactly four views; `RLMKT-VIEW` is not tripped. |
| AC-012 | The persisted `rldata.js` cache schema is byte-unchanged. |
| AC-013 | The tool auto-hydrates on load with no manual fetch click. |
| AC-014 | Simple and Power views are present, toggled by `#modeSeg`, with mode persisted. |
| AC-015 | Every ticker is linked; every value carries a contextual tooltip; every canvas has hover tooltips. |
| AC-016 | The tool is registered in `tools.json`, `index.html`, and `rlnav.js`, with `notes/` documentation. |
| AC-017 | The resolver and scorer run with no network access and no provider credential. |
| AC-018 | `node scripts/selftest.mjs` passes with the additive group and no pre-existing assertion regressed. |

## Known Risks And Honest Limitations

| ID | Risk / Limitation | Honest statement |
|---|---|---|
| RL-001 | **The past is gone.** | Every row written before the claim contract lands cannot be scored, ever — recounted 2026-07-28 at 165 rows across 83 keys, and still growing at four windows a day, so the final size is whatever the ledger holds on contract day. The track record begins that day. This is permanent, must be stated on the surface, and the figure must be counted there rather than quoted from here. |
| RL-002 | **Small samples for a long time.** | At roughly five actions per window, a statistically meaningful per-bucket calibration takes months. Wilson intervals will be wide and must be shown wide. Displaying a confident-looking rate early would be the single easiest way to make this feature dishonest. |
| RL-003 | **Calibration is not profitability.** | A well-calibrated forecast can still lose money if payoff is asymmetric against it; a poorly-calibrated one can make money. This is why `averageWin`/`averageLoss` and expected value are first-class, not decorations. Forecast quality and economic value are reported as separate dimensions and must never be conflated. |
| RL-004 | **Predicate quality bounds everything.** | A vague or trivially-satisfiable predicate produces a meaningless track record. Garbage predicates yield garbage calibration, and no statistic can detect that. Predicate review is a human responsibility this feature does not automate. |
| RL-005 | **Hedges and options claims resolve poorly from daily bars.** | A "carry a defined-risk hedge" claim has no clean daily-bar resolution. Such claims will frequently close `not-evaluable`. That is honest, but it means whole categories of recommendation stay unscored. |
| RL-006 | **`rlvSummarizeOutcomes` zero-handling.** | The primitive derives `unresolved` by subtraction, so exactly-zero is absorbed into unresolved. HC-7 forces a sentinel convention on the resolver side; the shared primitive is Feature 007's and is not modified here. |
| RL-007 | **Multiplicity discount is approximate.** | `rlvDeflatedSharpe` expects an equity curve and a trial count. Recommendation outcomes are not a clean equity curve. The discount is directional evidence of overfitting, not a precise significance test, and must be labelled as such. |
| RL-008 | **No survivorship correction.** | Claims withdrawn before resolution are recorded as `withdrawn`. If withdrawal correlates with anticipated failure, the visible rate is optimistic. The withdrawn count must be displayed so a reader can judge this. |
| RL-009 | **Concurrent-feature coupling.** | Features 002, 012, and 013 are all `blocked`. 015 extends 002's row contract and consumes 012's surface. Sequencing is a real dependency risk and is named here rather than discovered later. |
| RL-010 | **Scoring does not validate the recommender.** | A track record measures the published claims. It does not establish that the underlying models generalise, and it must never be presented as validation of any model or strategy. |

## Downstream Owner Handoffs

| Owner | Handoff |
|---|---|
| `bubbles.design` | Design the frozen-claim object shape and its hash relationship to the existing `recommendationKey`; design the additive ledger-row extension so existing `brief-recommendation-history-row/v1` consumers do not break; design the resolver's predicate evaluation model and the resolved-flat sentinel; design the cohort model and the Simple/Power view decomposition. Must resolve HC-4 (start-at-zero presentation) and HC-7 (zero sentinel) explicitly. |
| `bubbles.plan` | Decompose into scopes with a hard ordering: claim contract → resolver → scorer/tool → Center consumption. Each scope needs a committed validator with closed error codes and an adversarial case per Hard Constraint. |
| `bubbles.ux` | Wireframe the Simple verdict (rate + interval + count + sufficiency), the insufficient-sample state, the honest empty state, and the permanent unresolvable-legacy disclosure. The hardest UX problem is making a wide interval feel informative rather than broken. |
| `bubbles.implement` | Consume `RLVALID` and `reduceRecommendationEvents` unchanged. No new statistic. No new Center view. No cache-schema change. |
| Feature 002 owner | Row-contract extension and claim-object placement in the object store require 002's consent; 015 must not fork the graph layout. |
| Feature 007 owner | `rlvalidation.js` is consumed read-only. Any need to change a primitive routes to 007, never patched locally. |
| Feature 012 owner | The Center consumes the track record through the existing Brief view and shared cache only. |

## UI Wireframes

All copy below is the **actual text a reader sees**, not a placeholder. Illustrative counts are carried
consistently across every frame: 42 resolved (24 satisfied, 18 invalidated), 6 expired, 3 withdrawn, 9
not-evaluable, 7 open, and 78 distinct claim families. Those figures are the analyst's illustrative sample, not a
measurement — the real surface renders whatever the ledger holds, including nothing.

The unscoreable pre-contract slot is deliberately written as **`<N>`** rather than a digit. It is the one count in
these frames that must be **computed from the ledger at render time** (HC-4, AC-008): its population grows with
every published window until the contract lands, so any literal shipped there becomes false on the next publish.
`<N>` marks a render-time substitution, not a number to copy forward. For scale only, and recountable rather than
quotable, it stood at 165 when measured on 2026-07-28.

**Layout law for every frame:** the range is the largest element and the point estimate is rendered *inside* it.
A percentage is never the biggest thing on the screen. This is the structural answer to RL-002 — a reader cannot
read the point without reading the width, because the width is the object and the point is a tick mark on it.

### Simple view — sufficient sample (default state)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Recommendation Track Record                        [ Simple │ Power ]     │
│  A measurement surface. Nothing here is advice.                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Cohort  [ all calls ▾ ]   Stated confidence [ all ▾ ]   Horizon [ all ▾ ] │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  WERE WE RIGHT?                                    all calls         │  │
│  │                                                                      │  │
│  │  Between  42%  and  71%  of these calls worked.                      │  │
│  │                                                                      │  │
│  │  ├───────────────────────█████████████████████────────────────────┤  │  │
│  │  0%           25%       42%     ▲57%      71%       75%      100%   │  │
│  │                                  best estimate                       │  │
│  │                                                                      │  │
│  │  42 resolved calls · 95% range · width 29 points                     │  │
│  │                                                                      │  │
│  │  This sample already rules out a hit rate above 71%.                 │  │
│  │  It cannot yet tell 50% from 60%.                                    │  │
│  │  About 126 more resolved calls would halve this range.     [how?]    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ────────────────────────  different question  ─────────────────────────   │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  DID IT PAY?                                       same 42 calls     │  │
│  │                                                                      │  │
│  │    Average win   +1.8%          Average loss   −1.1%                 │  │
│  │    Expected value per call      +0.35%                               │  │
│  │                                                                      │  │
│  │  Being right often and being paid well are different things.         │  │
│  │  A 40% hit rate with large wins can still pay; a 70% hit rate        │  │
│  │  with large losses does not. Neither block above follows from        │  │
│  │  the other.                                                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  How the 42 closed                                                         │
│  ████████████████████████│██████████████████                               │
│  satisfied 24            │ invalidated 18                                  │
│                                                                            │
│  Rate denominator = satisfied + invalidated (42). Expired, withdrawn and   │
│  not-evaluable sit outside it and are counted below.            [why?]     │
│                                                                            │
│  3 calls were withdrawn before they could resolve. Had every one of them   │
│  failed the rate reads 53%; had every one worked, 60%. Those are           │
│  arithmetic bounds on what withdrawal could be hiding — not estimates,     │
│  and neither replaces the 57% above.                                       │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  Coverage of every call ever published                                     │
│  ▓▓▓▓▓▓░░░░▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  Scored 42 · Open 7 · Expired 6 · Withdrawn 3 · Could not be scored 9 ·    │
│  Unscoreable, pre-contract <N>                                             │
│                                                                            │
│  Record begins 2026-08-04. The <N> earlier calls were stored as one-way    │
│  hashes with no claim text, so they could not be scored then and cannot    │
│  be scored now.                                                 [why? ▾]   │
└────────────────────────────────────────────────────────────────────────────┘
```

The coverage line is not a banner and has no dismiss control. It is the denominator ledger for the number the
reader came for, so it cannot be tuned out without losing the sample count. It also self-attenuates honestly: as
`Scored` grows, `<N>` freezes at whatever the ledger held on contract day and shrinks in relative weight without
ever being hidden.

### Simple view — insufficient sample (steered into a sparse cohort)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Cohort  [ all calls ▾ ]  Stated confidence [ 56–60 ▾ ]  Horizon [ all ▾ ] │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  NOT ENOUGH DATA YET                        stated confidence 56–60  │  │
│  │                                                                      │  │
│  │  3 resolved calls. 2 of them worked.                                 │  │
│  │                                                                      │  │
│  │  ├─────────█████████████████████████████████████████████████──────┤  │  │
│  │  0%      21%                                            94%    100%  │  │
│  │                                                                      │  │
│  │  The range runs 21% to 94%. That is consistent with this cohort      │  │
│  │  being useless and with it being excellent. No rate is claimed.      │  │
│  │                                                                      │  │
│  │  A rate is shown from 20 resolved calls. 17 to go.                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ────────────────────────  different question  ─────────────────────────   │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  DID IT PAY?                                       same 3 calls      │  │
│  │    Average win   +2.1%          Average loss   −0.9%                 │  │
│  │    Expected value per call      +1.10%                               │  │
│  │  From 3 calls this is a description of three events, not a rate      │  │
│  │  of return you can expect.                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  Coverage · Scored 3 in this cohort · 42 across all cohorts ·              │
│  Unscoreable, pre-contract <N>                                  [why? ▾]   │
└────────────────────────────────────────────────────────────────────────────┘
```

The range is still drawn — wider, and visibly so. Suppressing it here would teach the reader that a missing range
means "not applicable" rather than "very uncertain". The threshold copy converts the state from a dead end into a
countdown. `20` is illustrative; the minimum cohort size is a declared constant `bubbles.design` must pin (see
Downstream Owner Handoffs).

### Simple view — honest empty state (zero resolved)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Recommendation Track Record                        [ Simple │ Power ]     │
│  A measurement surface. Nothing here is advice.                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  NO RESOLVED CALLS YET                                               │  │
│  │                                                                      │  │
│  │  The claim contract went live on 2026-08-04. Since then 7 calls      │  │
│  │  have been published carrying a resolvable claim. None has reached   │  │
│  │  its horizon. The first resolves on 2026-08-06.                      │  │
│  │                                                                      │  │
│  │  There is no rate to show and no range to show. Nothing is being     │  │
│  │  withheld or rounded — the measurement has not happened yet.         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  Open claims awaiting their horizon                                        │
│  ┌────────────────────┬──────────────┬────────────┬────────────────────┐   │
│  │ Subject            │ Horizon      │ Resolves   │ Stated confidence  │   │
│  ├────────────────────┼──────────────┼────────────┼────────────────────┤   │
│  │ XLE                │ next-session │ 2026-08-06 │ 55                 │   │
│  │ IWM                │ multi-session│ 2026-08-11 │ 55                 │   │
│  │ …5 more                                                             │   │
│  └────────────────────┴──────────────┴────────────┴────────────────────┘   │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  Coverage of every call ever published                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  Scored 0 · Open 7 · Unscoreable, pre-contract <N>                         │
│                                                                            │
│  Record begins 2026-08-04. The <N> earlier calls were stored as one-way    │
│  hashes with no claim text, so they could not be scored then and cannot    │
│  be scored now.                                                 [why? ▾]   │
└────────────────────────────────────────────────────────────────────────────┘
```

This state is **structurally forced, not chosen**: `rlvSummarizeOutcomes` rejects an empty array with
`RLV-OUTCOME-VALUES` ([rlvalidation.js#L134](../../rlvalidation.js#L134)) and `rlvWilsonInterval` requires
`total >= 1` ([#L112](../../rlvalidation.js#L112)). There is no statistic to render because the primitives refuse
to produce one. The surface shows the open pipeline so that "empty" reads as *early*, not *broken*.

### The `[why? ▾]` legacy expansion (available from every state)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Why <N> calls can never be scored                                  [ × ]  │
│                                                                            │
│  Between 2026-07 and the claim contract going live, every published        │
│  recommendation was recorded in the ledger as a one-way SHA-256 hash of    │
│  its subject and family. The hash was written; the subject and family      │
│  themselves were never stored anywhere in the repository.                  │
│                                                                            │
│  A hash cannot be reversed. There is no archive, no backup and no          │
│  reconstruction path — the claim text those <N> rows refer to does not     │
│  exist. They could not have been scored at the time and they cannot be     │
│  scored now.                                                               │
│                                                                            │
│  We could estimate what they probably claimed. We will not. An imputed     │
│  track record is a fabricated one, and it would be indistinguishable       │
│  from a measured one once it is on the screen.                             │
│                                                                            │
│  This notice is permanent. It does not expire and cannot be dismissed.     │
└────────────────────────────────────────────────────────────────────────────┘
```

The `[ × ]` closes the expansion only. The one-line coverage disclosure underneath it has no close control at all.

### Power view — calibration table

```
  Stated confidence vs realised frequency        every row: range and count
  ┌──────────┬────────┬──────────┬───────────────┬─────┬────────────────────┐
  │ Bucket   │ Stated │ Realised │ 95% range     │  n  │ Reading            │
  ├──────────┼────────┼──────────┼───────────────┼─────┼────────────────────┤
  │ 55       │  55%   │   57%    │  42% –  71%   │ 42  │ stated is in range │
  │ 56–60    │  58%   │    —     │  21% –  94%   │  3  │ too few to read    │
  │ 61–65    │  62%   │    —     │      —        │  0  │ no resolved calls  │
  │ 66–70    │  68%   │    —     │      —        │  0  │ no resolved calls  │
  └──────────┴────────┴──────────┴───────────────┴─────┴────────────────────┘

  Every declared bucket has a row, including the empty ones. A bucket is
  never dropped for having no data — an absent row reads as "excluded",
  which is a different and false claim.

  "Stated is in range" means the stated confidence falls inside the realised
  range. It does not mean the stated confidence is correct; at n = 42 the
  range is wide enough to contain most plausible values.
```

The `Realised` cell is blank for any bucket below the minimum cohort size — the range and the count carry the
information instead. This is HC-8 enforced at the cell level: a realised percentage never appears anywhere the
range and count are not both present beside it.

### Power view — outcome distribution (canvas, hover-enabled)

```
  Outcome distribution                              42 resolved outcomes
                                                                          
   12 ┤                    ███                                            
   10 ┤                    ███ ███                                        
    8 ┤              ███   ███ ███                                        
    6 ┤        ███   ███   ███ ███   ███                                  
    4 ┤  ███   ███   ███   ███ ███   ███   ███                            
    2 ┤  ███   ███   ███   ███ ███   ███   ███   ███                      
    0 ┴──────────────────────────────────────────────────────────────     
      ≤−3%  −2%   −1%   flat  +1%  +2%   +3%   >+3%                       
                          ▲ resolved flat is its own column               
                                                                          
      ┌─────────────────────────────────────────┐                         
      │ Outcome bucket  −1%                     │  ← RLCHART hover        
      │ Calls           8                       │                         
      │ Share           19% of resolved         │                         
      │ Small losses are the most common single │                         
      │ result in this cohort.                  │                         
      └─────────────────────────────────────────┘                         

  Quartiles   p25 −1.1%   ·   median +0.4%   ·   p75 +1.9%

  Table equivalent (same values, keyboard reachable)
  ┌────────────┬───────┬────────┐
  │ Bucket     │ Calls │ Share  │
  ├────────────┼───────┼────────┤
  │ ≤ −3%      │   4   │  10%   │
  │ −2%        │   6   │  14%   │
  │ −1%        │   8   │  19%   │
  │ resolved   │   2   │   5%   │
  │ flat       │       │        │
  │ +1%        │  10   │  24%   │
  │ +2%        │   7   │  17%   │
  │ +3%        │   3   │   7%   │
  │ > +3%      │   2   │   5%   │
  └────────────┴───────┴────────┘
```

`resolved flat` is a first-class column, never merged into a zero bin next to unresolved. This is where HC-7
becomes visible to a human: the resolver's sentinel exists so this column can exist.

### Power view — multiplicity

```
  Multiplicity                                                              
                                                                            
    Distinct claim families proposed      78                                
    Resolved trials                       42                                
                                                                            
    Raw statistic                         0.42                              
    After multiple-testing discount       0.11                              
                                                                            
  Proposing 78 different families and reporting the best of them will        
  produce an impressive-looking result even from noise. The discounted       
  figure is what survives that correction.                                   
                                                                            
  This is directional evidence of overfitting. It is not a significance      
  test. rlvDeflatedSharpe expects an equity curve; recommendation outcomes   
  are not one, so treat the gap between the two figures as a warning sign    
  rather than a measurement.                                                 
                                                                            
  ─────────────────────────────────────────────────────────────────────      
  Cohorts you have viewed this session   6                                   
  Trying many cohorts and keeping the most flattering one is the same        
  mistake, made by hand. This counter is not saved and nothing is blocked;   
  it is here so the count is in front of you while you read.                 
```

### Power view — raw ledger

```
  Resolved ledger                                     42 rows · newest first
  ┌────────────┬────────────┬─────────────┬─────────┬────────┬────────────┐
  │ Claim      │ Subject    │ Closure     │ Outcome │ Stated │ Resolved   │
  ├────────────┼────────────┼─────────────┼─────────┼────────┼────────────┤
  │ sha256:4f… │ XLE        │ satisfied   │  +2.1%  │  55    │ 2026-08-06 │
  │ sha256:9c… │ IWM        │ invalidated │  −1.4%  │  55    │ 2026-08-06 │
  │ sha256:22… │ TLT        │ resolved    │   flat  │  55    │ 2026-08-05 │
  │            │            │ flat        │         │        │            │
  │ sha256:e1… │ SPY hedge  │ not-        │    —    │  58    │ 2026-08-05 │
  │            │            │ evaluable   │         │        │            │
  │ sha256:77… │ XLF        │ withdrawn   │    —    │  55    │ 2026-08-04 │
  └────────────┴────────────┴─────────────┴─────────┴────────┴────────────┘

  Row 4 · not-evaluable — "defined-risk hedge structure; no single daily
  series resolves this claim". Excluded from the rate. Still counted here.

  Row 5 · withdrawn — closed before its horizon. Excluded from the rate.
  Counted in the withdrawal bounds shown in Simple.

  Subjects link to the tool that proposed them.
```

Every subject cell renders through `RLTKR.tag`, so `XLE` is a link carrying its name and kind — never bare text
([rlticker.js#L112](../../rlticker.js#L112)).

### Narrow reflow (≤ 520px)

```
┌──────────────────────────────┐
│ Track Record  [Simple│Power] │
│ Measurement only. Not advice.│
├──────────────────────────────┤
│ Cohort   [ all calls      ▾ ]│
│ Conf.    [ all            ▾ ]│
│ Horizon  [ all            ▾ ]│
│                              │
│ ┌──────────────────────────┐ │
│ │ WERE WE RIGHT?           │ │
│ │                          │ │
│ │ Between 42% and 71% of   │ │
│ │ these calls worked.      │ │
│ │                          │ │
│ │ ├────███████████──────┤  │ │
│ │ 0%  42%  ▲57%  71% 100%  │ │
│ │                          │ │
│ │ 42 resolved calls        │ │
│ │ 95% range · width 29 pts │ │
│ │                          │ │
│ │ Rules out above 71%.     │ │
│ │ Cannot tell 50% from 60%.│ │
│ │ ~126 more halves this.   │ │
│ └──────────────────────────┘ │
│                              │
│ ──── different question ──── │
│                              │
│ ┌──────────────────────────┐ │
│ │ DID IT PAY?              │ │
│ │ Avg win        +1.8%     │ │
│ │ Avg loss       −1.1%     │ │
│ │ EV per call    +0.35%    │ │
│ │ Being right and being    │ │
│ │ paid are different.      │ │
│ └──────────────────────────┘ │
│                              │
│ Coverage                     │
│ Scored 42 · Open 7           │
│ Not scoreable 9              │
│ Pre-contract <N>  [why? ▾]   │
│                              │
│ Record begins 2026-08-04.    │
└──────────────────────────────┘
```

Levers stack, the range keeps its full 0–100% axis so the width stays honest at small size, and the coverage line
and the no-advice notice both survive the reflow. Nothing that carries an uncertainty or an exclusion is allowed
to collapse behind a "show more" control.

## Interaction And Steering Model

The Simple view is a decision-first cockpit with a small set of levers that re-slice the *same* resolved ledger.
Every lever recomputes through one `render()` call against data already in memory. No lever fetches, and no lever
changes what is counted as a win — a lever may only change **which resolved calls are in the cohort**.

This mirrors the repo's established pattern: `#modeSeg` with `role="tablist"` and `data-mode` buttons
([sector-research-lab.html#L1196](../../sector-research-lab.html#L1196)), `document.body.classList.toggle('power', …)`
([#L3124](../../sector-research-lab.html#L3124)), a click handler that sets state, saves, and re-renders
([#L3373](../../sector-research-lab.html#L3373)), and `localStorage` persistence of the mode alongside the other
lever values ([intraday-tape-lab.html#L1379](../../intraday-tape-lab.html#L1379)).

### Simple-view levers

| Lever | Control | Values | What it changes | Recompute |
|---|---|---|---|---|
| **Cohort scope** | `select#leverCohort` | all calls · one owning tool | Restricts the resolved set to claims proposed by one tool | Live, in-memory |
| **Stated confidence** | `select#leverBucket` | all · each declared bucket | Restricts to claims whose stated confidence falls in the bucket | Live, in-memory |
| **Horizon** | `select#leverHorizon` | all · intraday · next-session · multi-session · event-bound | Restricts by the claim's declared horizon (P4) | Live, in-memory |
| **Claim family** | `select#leverFamily` | all · each family present | Restricts to one claim family | Live, in-memory |
| **Evaluation window** | `select#leverWindow` | since record start · trailing 30 / 90 sessions | Restricts by resolution date | Live, in-memory |

Every lever change re-derives, in this order: the cohort's outcome array → `rlvSummarizeOutcomes` →
`rlvWilsonInterval` on `(wins, total, z)` → the sufficiency branch → the render. When the cohort is empty the
primitives are **not called at all**; the empty branch is taken before any statistic is requested, because both
primitives refuse an empty input.

Changing a lever updates, in the same frame: the verdict state and its copy, the range and point marker, the
sample count and range width, the precision read, the payoff block, the closure mix, the withdrawal bounds, and
the cohort-scoped portion of the coverage line. The pre-contract unscoreable count and the record start date do
**not** change, because no cohort selection can alter them.

### Rejected levers, and why

| Rejected | Reason |
|---|---|
| "Count withdrawn as losses / wins" toggle | Would promote an arithmetic bound into a headline rate. The bound is shown as static text precisely so it can never become the number a reader quotes. |
| "Include legacy at estimated rate" | Imputation. Forbidden by HC-4 and BP-015-002. |
| "Hide not-evaluable" | Hiding an exclusion changes the meaning of the denominator without changing the denominator. Forbidden by BP-015-006. |
| Confidence-level selector (90% / 95% / 99%) | Lets a reader narrow the range by choosing a weaker guarantee. The level is a fixed declared constant. |
| Position size, allocation, or any target | HC-9. The tool has no such control at any level. |
| Dismiss / snooze on the coverage line | BP-015-002 requires it permanently. |

### Persistence

Persisted to `localStorage` under `rlTrackRecordLab` as
`{ mode, cohort, bucket, horizon, family, window }` — the same shape and mechanism the reference tools use. Mode is
restored silently on boot before first paint so the reader never sees a flash of the wrong view.

No derived statistic is ever persisted. Rates, ranges, counts and bounds are recomputed from the ledger on every
load, so a stale cache can never surface a number that the current ledger does not support. The session
cohort-view counter shown in the multiplicity panel is deliberately **not** persisted — it is a within-session
reading aid, not a record.

### Auto-hydration and status reporting

The tool paints on load with no user action, per FR-013: read the shared cache first and paint immediately from
whatever is there, then refresh only the missing or stale delta and re-render. There is no fetch, load, or run
button anywhere in the surface.

Every resource the page depends on reports through the shared status control via `RLAPP.report(resource, state, detail)`
([rlapp.js#L73](../../rlapp.js#L73)) using the shell's existing state vocabulary — `fresh`, `stale`, `refreshing`,
`missing`, `error` ([rlapp.js#L68-L72](../../rlapp.js#L68)). A cached read is reported `stale`, never `fresh`.
Script order is `rldata.js` → `rlapp.js` → `rlnav.js` per FR-014.

### Charts

Each canvas registers a hit-test closure at the end of its draw function via `RLCHART.attach(canvas, hitFn)`
returning `RLCHART.tip(title, rows, note)` ([rlchart.js#L365](../../rlchart.js#L365),
[#L41](../../rlchart.js#L41)). The `note` argument is the contextual half of FR-016 — it carries what the hovered
value *means*, not just what it is. Every canvas is followed by a table carrying the same values for keyboard and
screen-reader access.

### Deep links out

| From | To | Behaviour |
|---|---|---|
| Ledger `Subject` cell | Yahoo Finance, via `RLTKR.tag` | Standard repo ticker link with name-and-kind tooltip |
| Ledger `Claim` cell | The owning tool's page | Opens the tool that proposed the claim; returning restores mode and levers from `localStorage` |
| Coverage `[why? ▾]` | In-page expansion | Never navigates away; the disclosure is not a link to a doc a reader will not open |
| Owner read | `market-brief` cockpit's existing Brief view | Published as `rl-tool-read/v1` to the shared cache per FR-018; the Center consumes it in place and gains no new view |

### Null-safety at first paint

`rlvSummarizeOutcomes` returns `averageWin: null` when a cohort has no wins and `averageLoss: null` when it has no
losses ([rlvalidation.js#L134](../../rlvalidation.js#L134)). Every such value is guarded with `Number.isFinite`
— never the global `isFinite`, which passes `null` through and throws on `.toFixed()` — and renders `—` with a
tooltip naming why it is absent. A half-populated cache must never be able to halt the first paint.

## Honest-State Vocabulary

This is the anti-fabrication surface. The words below are the complete user-facing vocabulary for outcome and
sufficiency states. They are chosen so that a reader who reads only the label still cannot come away believing
more than the data supports.

**One terminology decision the implementation must not undo.** The spec uses "confidence" for two unrelated
things: the *stated confidence* attached to a claim (the pinned `55`) and the *confidence interval* around a
realised rate. Displaying both as "confidence" is actively misleading. In all user-facing copy the interval is
called a **range** and the word *confidence* is reserved exclusively for the claim's stated number. "95%" appears
only as a qualifier on the word range.

### State labels

| Internal state | User-facing label | Shown when | Tooltip copy | Never say |
|---|---|---|---|---|
| `sufficient` | *(no badge — the rate is simply shown)* | Cohort at or above the declared minimum resolved count | "Based on 42 resolved calls. The range is the 95% Wilson interval — the band of hit rates consistent with what we have actually observed." | "proven", "validated", "accurate", "reliable", "significant" |
| `insufficient` | **Not enough data yet** | Cohort has ≥1 resolved call but below the declared minimum | "Too few resolved calls to state a rate. The range is shown instead, and it is wide enough to include outcomes that would mean opposite things." | "preliminary rate", "early signal", "trending toward", "so far so good" |
| `empty` | **No resolved calls yet** | Cohort has zero resolved calls | "No call in this cohort has reached its horizon. There is nothing to measure yet — this is not a rate of zero." | "0%", "no edge", "n/a", "—" as a substitute for a rate |
| `open` | **Open — awaiting horizon** | Claim published, horizon not reached | "This call has been published with a resolvable claim and is waiting for its horizon date. It has no outcome yet." | "pending success", "on track", "winning", "currently up" |
| `satisfied` | **Satisfied** | Predicate evaluated true at resolution | "The frozen predicate was met on committed price data at the resolution date." | "correct call", "we called it" |
| `invalidated` | **Invalidated** | Invalidation condition met | "The claim's own invalidation condition was met before the horizon expired." | "wrong", "failed badly", "stopped out" |
| `expired` | **Expired unresolved** | Horizon reached, predicate neither satisfied nor invalidated | "The horizon passed without the predicate being met or invalidated. It sits outside the rate denominator; the panel states which closures are inside it." | counting it silently as a loss, or silently as a win |
| `resolved-flat` | **Resolved flat** | Claim resolved with zero magnitude | "This call resolved with no movement in its declared magnitude unit. It is a real, measured outcome — it is not a missing one, and it is not an unresolved one." | "0", "unresolved", "no result", blank |
| `withdrawn` | **Withdrawn before resolution** | Claim closed by withdrawal | "This call was withdrawn before its horizon. It has no outcome and is outside the rate. If withdrawal tends to happen when a call is going badly, the visible rate is flattered — the bounds in the verdict panel show by how much." | "cancelled", "n/a", or omitting it from view |
| `not-evaluable` | **Could not be scored** | No committed series can resolve the claim | "There is no committed daily series that resolves this claim — hedge and options structures often have none. It is excluded from the rate and counted separately. This is a limit of the data, not a judgement about the call." | "failed", "invalid", "unresolved", or dropping it from the counts |
| `unresolvable-legacy` | **Unscoreable, pre-contract** | Ledger row predates the claim contract | "Published before claims were stored. Recorded only as a one-way hash, with the claim text never persisted anywhere, so it could not be scored then and cannot be scored now. It will never move out of this bucket." | "legacy", "old data", "excluded", "archived", or any wording implying future recovery |

### Vocabulary rules

1. **Every rate label carries three parts or none.** A percentage, its range, and its count travel together in one
   block. If any one is unavailable, the rate is not rendered at all.
2. **"Range", never "confidence interval", in headline copy.** *Confidence* means the claim's stated number.
3. **No superlatives, no trend verbs.** Never "improving", "strong", "excellent", "weak", "on track". A track
   record with 42 points has no trend, and a label that implies one manufactures information.
4. **No composite score.** There is no single number combining hit rate with payoff. RL-003 makes them different
   questions, and a composite would let a reader stop before understanding either.
5. **Absence is named, never blank.** Every `—` carries a tooltip saying what is missing and why. A bare dash
   invites the reader to supply their own explanation.
6. **No forward-looking words.** "Expected value" is retained because it is the standard name for the realised
   per-call mean, but its tooltip states plainly that it describes what happened, not what will happen.
7. **Nothing implies future back-fill.** Copy about the pre-contract legacy rows never says "not yet scored",
   "pending", or "unavailable" — only that scoring them is impossible.
8. **No imperative mood anywhere.** The surface has no sentence telling the reader to do anything with an
   instrument. HC-9 is enforced at the level of grammar, not just of controls.

### Open Questions For `bubbles.design`

These are gaps and one internal inconsistency found while wireframing. Each blocks a concrete rendering decision,
so each is named here rather than guessed at. None is resolvable by the UX phase.

| # | Question | Why it blocks rendering | Evidence |
|---|---|---|---|
| UXQ-1 | **The z-score is never declared.** | `rlvWilsonInterval(wins, total, zScore)` takes `zScore` as a required argument and fails `RLV-WILSON-Z` on a non-positive value. The wireframes say "95% range", which implies `z = 1.96`, but the spec never states it. It must be a declared constant, not a literal at a call site. | [rlvalidation.js#L112](../../rlvalidation.js#L112) |
| UXQ-2 | **The minimum cohort size is never declared.** | BP-015-003 and FR-010 both require "the declared minimum size" and AC-007 tests against it, but no section declares a number. The insufficient-state copy renders a countdown ("17 to go") that cannot be written without it. `20` is used illustratively in the wireframes and is not a UX decision. | spec.md BP-015-003, FR-010, AC-007 |
| UXQ-3 | **The rate denominator's composition is undeclared, and the illustrative figures already assume one.** | The analyst wireframe shows `satisfied 24 · invalidated 18 · expired 6 · withdrawn 3` with a rate of 57% at `n = 42`. `24 / 42 = 57.1%`, so the figures silently exclude `expired` and `withdrawn` from the denominator. That may well be right, but it is a scoring decision made by arithmetic rather than by declaration — and `expired` plausibly carries a real signed magnitude. The UI surfaces the composition explicitly (UI-15) precisely so the choice cannot hide, but design must **make** the choice. | spec.md `## UI Wireframes` illustrative counts; `CLOSE_EVENT_TYPES` at [rlcontracts.js#L720](../../rlcontracts.js#L720) |
| UXQ-4 | **Zero resolved outcomes must map to an `rl-tool-read/v1` availability value.** | The contract validator accepts exactly `current`, `stale`, `unavailable`, and rejects the read outright if `availability === "unavailable"` while `asOf` or `freshUntil` is non-null. A track record with zero resolved calls is **computed and current** — reporting it `unavailable` would tell the Center the tool is broken when it is working correctly and honestly empty. Design must state this mapping. | [rldata.js#L436-L450](../../rldata.js#L436) |
| UXQ-5 | **The withdrawal bounds need a declared RLVALID route.** | BP-015-004 requires every number to trace to a named primitive. Computing `24/45` and `27/45` inline would be a local statistic. The compliant route is `rlvWilsonInterval(wins, total + withdrawn, z).proportion` evaluated at both extremes — same primitive, different counts, no new estimator. Design should confirm this rather than leave it to implementation. | [rlvalidation.js#L112](../../rlvalidation.js#L112); spec.md BP-015-004, RL-008 |
| UXQ-6 | **"Confidence" is overloaded and the collision will reach the contract.** | The spec uses the word for both a claim's stated confidence and the interval around a realised rate. UX resolves this in copy by calling the interval a *range*. If the claim object and the tool-read `metrics` keys reintroduce `confidence` for both meanings, the ambiguity returns through the data layer. Field naming should keep them distinct. | spec.md `## Honest-State Vocabulary`; `market-brief.config.json` `minimumActionConfidence` |
| UXQ-7 | **`resolved-flat` needs a magnitude representation the UI can render.** | HC-7 forbids a bare `0`, and the distribution chart and ledger both give resolved-flat its own visible slot. Whether the sentinel is a distinct field, a non-numeric marker, or a signed epsilon changes how the column is keyed and sorted. | spec.md HC-7, BS-004, AC-005 |

---

**Educational only — not investment advice.** This tool measures published claims. It does not recommend action,
size a position, or validate any model.
