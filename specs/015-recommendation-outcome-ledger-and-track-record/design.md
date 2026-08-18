# Design — Recommendation Outcome Ledger And Track Record

> **Authoring state: COMPLETE — remediated.** All eleven design sections are present — `## Architecture Overview`,
> `D1`–`D6` (claim contract, ledger extension, flat sentinel, resolver, scoring, owner read) authored in
> chunks 1–2, and `D7`–`D11` (UI components, testing strategy, alternatives, complexity, open questions)
> authored in chunk 3.
>
> **A remediation pass has since closed five findings raised by `bubbles.plan`**, which correctly refused to
> plan scopes 05–10 on an invalidated D1/D4 contract. `D1` now specifies a resolvable subject distinct from the
> prose `subject` (P-015-01), carries its own horizon vocabulary rather than a fabricated mapping (P-015-02),
> and treats `thesisFamily` as authored-or-not-evaluable (P-015-03). `D4`'s trading-session predicate is keyed
> on `regular !== null` rather than `dateState === "regular"`, closing a **one-session lookahead** the
> anti-lookahead machinery was itself producing (P-015-07, HC-5). `D6`'s registration surface now matches what
> `scripts/validate-tool-experience.mjs` actually enforces (P-015-04). Findings are collected in `## D11`; none
> blocks decomposition.

---

## Design Brief

**Current State.** The Market Action Center publishes ~5 recommendations per window, 4×/day. Every row lands
in `briefs/history/recommendations/2026-07.jsonl` — **verified this run: 165 rows, 83 distinct
`recommendationKey`s, 33 runs, event type `proposed` for all 165**. Nothing ever closes. The stated confidence
is a schema constant. `rlcontracts.js` already contains a full lifecycle reducer and a closed closure
vocabulary that the live publisher never calls; `rlvalidation.js` already contains seven scoring primitives
wired to nothing. The 289 committed symbol files under `data/bars/` and the committed
`data/calendars/xnys/calendar.json` are sufficient to resolve claims offline. The substrate exists; the loop is
open.

**Target State.** Close the loop with three additions and zero new statistics: a claim frozen at proposal time
(D1), a deterministic offline resolver that emits exactly one existing closure event per due claim (D4), and a
track-record tool that renders realised frequency with its Wilson interval through the existing primitives
(D5, D7). The Center gains no view — it consumes a published `rl-tool-read/v1` in the Brief view it already has
(D6).

**Patterns to Follow.**

| Pattern | Reference (verified this run) |
|---|---|
| Simple/Power via `#modeSeg` + `body.power`, mode persisted, one compute → both views | [sector-research-lab.html#L1196](../../sector-research-lab.html#L1196), `applyMode()` [#L3123](../../sector-research-lab.html#L3123), click handler [#L3373](../../sector-research-lab.html#L3373) |
| **Structured** chart adapter (the non-deprecated `RLCHART.attach` path) | `validateStructuredAdapter` [rlchart.js#L98](../../rlchart.js#L98); the repo's only implementation is [market-heatmap-lab.html#L641](../../market-heatmap-lab.html#L641) |
| Committed validator with closed codes: `invariant()`, `expectRejected(name, code, fn)`, exported validator + `main()` guarded by an argv identity check | [scripts/validate-market-action.mjs](../../scripts/validate-market-action.mjs) |
| Validator importable **into** the build-free baseline | `scripts/selftest.mjs` imports `validateBriefPayload` at [#L18](../../scripts/selftest.mjs#L18) |
| Owner read → existing Brief view, no new Center view | D6; `RLDATA.putToolRead` |
| `rlcontext.js` loaded ahead of `rldata.js` when a structured chart is used | [market-heatmap-lab.html#L411-L418](../../market-heatmap-lab.html#L411) |

**Patterns to Avoid.**

| Anti-pattern present in the repo | Why 015 must not copy it |
|---|---|
| `RLCHART.attach(canvas, hitFn)` — the **legacy closure** form | `attachLegacy` [rlchart.js#L351](../../rlchart.js#L351) stamps `data-rlchart-migration-required="true"` on the canvas. A brand-new tool would ship flagged debt on day one. FR-017's wording names this form; D7 selects the structured adapter instead (F-015-D8-02). |
| Letting `rlg.js` auto-decorate an unlabelled control | `decorate()` [rlg.js#L234](../../rlg.js#L234) claims any element matching `GLOSSARY_SELECTOR` [#L251](../../rlg.js#L251) and writes an `aria-label` [#L243](../../rlg.js#L243). The shared glossary is options/tape-flavoured — `G["horizon"]` [#L63](../../rlg.js#L63) defines horizon as a *holding timeframe* that "selects the primary target … and the resulting R:R", which is wrong for a measurement surface and imports action vocabulary (F-015-D7-03). |
| Any locally-computed rate, interval, mean, or discount | HC-1. Seven primitives exist ([rlvalidation.js#L157-L162](../../rlvalidation.js#L157)); an eighth is a contract violation, not a convenience. |
| Global `isFinite` before `.toFixed()` | `rlvSummarizeOutcomes` returns `averageWin`/`averageLoss` as `null` for a cohort with no wins/losses; `isFinite(null) === true` and the first paint throws. Repo house rule; UI-11 asserts the `—` render. |
| A literal `160` (or `165`) legacy count anywhere | The count grows every publish window until the claim contract activates (F-015-D5-02). It is derived, then frozen once at activation. |
| `dateState === "regular"` as the trading-session test | **Verified this run:** the committed calendar's two `early-close` rows (2026-11-27, 2026-12-24) carry genuine 09:30–13:00 `regular` blocks. The `dateState` filter counts 249 sessions where there are **251**, stepping a `next-session` claim entered 2026-11-26 to 2026-11-30 and admitting an extra session of price movement — a silent HC-5 lookahead produced by the anti-lookahead machinery itself. The test is `regular !== null` (D4). |
| Parsing a symbol out of `action.subject` | **Verified this run:** all 5 live subjects are multi-clause prose, none is a `data/bars/` key, one names no instrument, and one names 11 tickers across *add*, *trim* and *avoid* roles — harvesting would score the funding leg as the position. `resolvesTo` is authored; absence is `not-evaluable` (D1). |
| Mapping `structural`/`swing`/`tactical` onto `intraday`/`next-session`/`…` | The vocabularies share **zero** members and are different kinds of thing. `swing → next-session` resolves every swing claim systematically early. The claim carries its own horizon; the band is recorded non-authoritatively (D1). |
| `thesisFamily = actionFamily` as a stand-in | It collapses a reducer key term, merging distinct theses onto one entry and silently shrinking the denominator. Authored or `not-evaluable` (D1). |
| Registering a tool by editing `tools.json` and the nav arrays only | `scripts/validate-tool-experience.mjs` cross-asserts three registries and carries **four literal count assertions**; a partial registration leaves the tree red (D6, F-015-D6-02). |

**Resolved Decisions.** `Z_SCORE = 1.96`; `MIN_COHORT_RESOLVED = 20`; `ANNUALIZATION = 252` (D5). Rate
denominator is defined on the **outcome-class** axis (`win`/`loss`), not the closure-event axis (D5, UXQ-3).
Resolved-flat is a distinct `outcomeClass` withheld from the array fed to `rlvSummarizeOutcomes` (D3, UXQ-7).
Zero resolved outcomes maps to `availability: "current"` (D6, UXQ-4). Withdrawal bounds route through two
`rlvWilsonInterval` calls (D5, UXQ-5). `confidence` is reserved for a claim's stated number; the interval is a
`range` (D6, UXQ-6). 015 binds to the **publisher** recommendation key, not `deriveRecommendationKeys`
(Architecture Overview). Charts use the **structured** adapter (D7). All seven UX open questions are closed.

**Resolved this remediation pass.** A single additive, key-neutral authored block
(`action.claim`, contract `brief-action-claim-input/v1`, D1) supplies the four machine fields the payload does
not carry — `resolvesTo`, horizon mechanics, `thesisFamily`, and the predicate. Each absence has its own
`not-evaluable` reason code; nothing is inferred from prose. The trading-session predicate is `regular !== null`
over `tradingDate`, giving **251** sessions in 2026 (D4). The reducer bridge's two missing terms are supplied
(`originToolId` = `market-brief`, `thesisFamily` authored), reducing F-015-D4-01 to a consent call. Registration
is a six-file atomic change including `simple-models.json`, `journeys.json`, and four literal count assertions
in the validator (D6).

**Open Questions.** Findings needing a scoping decision rather than a design inference: the reduced consent-only
reducer bridge (F-015-D4-01), authored-block activation sequencing (F-015-D1-01), non-self-enforcing idempotence
(F-015-D4-02), the P7-vs-Interaction-Model lever discrepancy (F-015-D5-01), the moving legacy count
(F-015-D5-02), `metrics` not being rendered by the Center (F-015-D6-01), the six-file atomic registration and
its four literal count assertions (F-015-D6-02), plus F-015-D7-01..04 and F-015-D8-01..02. Full statements in
`## D11`.

---

## Architecture Overview

The capability is a three-stage loop. Each stage has exactly one owner, and **015 adds no new
statistic anywhere in it.**

```
     ┌── Stage 1: FREEZE ──────────┐   ┌── Stage 2: RESOLVE ─────────┐   ┌── Stage 3: SCORE ───────┐
     │ at proposal time            │   │ at horizon expiry           │   │ on every render         │
     │                             │   │                             │   │                         │
     │ recommendationKey minted    │──▶│ claim + committed bars       │──▶│ signed outcomes         │
     │ claim object written        │   │ → signed outcome            │   │ → RLVALID primitives    │
     │ predicate frozen (HC-6)     │   │ → one CLOSE_EVENT_TYPES evt │   │ → rate + interval (HC-8)│
     └─────────────────────────────┘   └─────────────────────────────┘   └─────────────────────────┘
        publisher (Feature 002)            resolver (Feature 015)            scorer (Feature 015)
                                        via reduceRecommendationEvents      via RLVALID (Feature 007)
```

### Module Ownership

| Stage | Module | Owner | 015's relationship |
|---|---|---|---|
| 1 — Freeze | [scripts/brief-distributed-publish.mjs#L402-L408](../../scripts/brief-distributed-publish.mjs#L402) — mints the stable `recommendationKey` and the `proposed` event | Feature 002 | **Read-only.** 015 mints its claim object against the key this code already produces; it does not change key derivation. |
| 1 — Freeze | Claim object under `briefs/objects/` | **Feature 015** | New, content-addressed, append-only. See D1. |
| 1 — Freeze | `brief-recommendation-history-row/v1` | Feature 002 | **One consent-gated additive field.** See D2. |
| 2 — Resolve | `CLOSE_EVENT_TYPES` [rlcontracts.js#L720](../../rlcontracts.js#L720) | Feature 002 | **Reused unchanged.** Closure vocabulary is consumed, never extended locally (HC-2, P6). |
| 2 — Resolve | `reduceRecommendationEvents` [rlcontracts.js#L1134](../../rlcontracts.js#L1134) | Feature 002 | **Reused unchanged.** Closures enter through the existing `run.closures` path documented in the contract comment at [rlcontracts.js#L1127](../../rlcontracts.js#L1127); the reducer is never forked. |
| 2 — Resolve | Resolver + resolution objects | **Feature 015** | New. Converts a frozen claim + committed bars into a signed outcome and one closure event. |
| 3 — Score | `RLVALID` [rlvalidation.js](../../rlvalidation.js) | Feature 007 | **Read-only. MUST NOT be modified.** Every displayed number traces to one of its seven primitives (HC-1, BP-015-004). |
| 3 — Score | Scorecard assembly + track-record tool | **Feature 015** | New. Selects cohorts, calls primitives, renders rate + interval + sample count. |

### Statistic Sourcing (HC-1 — consume, never re-implement)

| Displayed quantity | Sole source | Line |
|---|---|---|
| Hit rate, average win, average loss, mean, distribution quartiles | `rlvSummarizeOutcomes` | [rlvalidation.js#L134](../../rlvalidation.js#L134) |
| Uncertainty interval around the hit rate (HC-8) | `rlvWilsonInterval` | [rlvalidation.js#L112](../../rlvalidation.js#L112) |
| Outcome distribution at arbitrary probabilities | `rlvQuantiles` | [rlvalidation.js#L122](../../rlvalidation.js#L122) |
| Multiplicity discount across claim families (P8) | `rlvAdjustBenjaminiHochberg` / `rlvAdjustHolm` | [rlvalidation.js#L63](../../rlvalidation.js#L63) |
| Trial-count-aware performance discount (P8) | `rlvDeflatedSharpe` | [rlvalidation.js#L87](../../rlvalidation.js#L87) |

015 defines **no** estimator, **no** hand-rolled interval, and **no** private correlation discount. Where
the loop needs a number the seven primitives do not provide, the design's answer is to not display that
number — not to write an eighth primitive.

### Two Identity Systems — Which One 015 Binds To

The repository contains two independent recommendation-identity derivations, and 015 must bind to the
one that actually appears in the ledger rows:

- `deriveRecommendationKeys` [rlcontracts.js#L1034](../../rlcontracts.js#L1034) hashes
  `{ originToolId, thesisFamily, subjects, actionFamily, horizon }` into `origin-recommendation-key/v1`.
- The distributed publisher [scripts/brief-distributed-publish.mjs#L405](../../scripts/brief-distributed-publish.mjs#L405)
  hashes only `{ subject, family }` into `brief-distributed-reckey/v1`, and that is the value written to
  the row's `recommendationKey`.

**015 binds to the publisher key**, because that is the identifier present in the 160 existing rows and in
every row the live publisher emits. The consequence — that this key omits `horizon` — is a real constraint
and is handled explicitly in D1.

### Reading Order (authoring complete)

The three stages above map one-to-one onto the design sections, and every section is now written. The two
capability sections that precede `D1` frame those stages as a reusable foundation; they add no stage. Nothing
in this document is a placeholder or a forward reference to unwritten work.

| Stage | Sections | Status |
|---|---|---|
| 0 — Capability | `Capability Foundation`, `Concrete Implementations` | Authored, remediation pass |
| 1 — Freeze | `D1` (claim contract), `D2` (ledger row extension) | Authored, chunk 1 |
| 2 — Resolve | `D3` (flat sentinel), `D4` (resolver) | Authored, chunks 1–2 |
| 3 — Score | `D5` (cohorts + scoring), `D6` (owner read + Center) | Authored, chunk 2 |
| Surface | `D7` (UI components) | Authored, chunk 3 |
| Assurance | `D8` (testing strategy) | Authored, chunk 3 |
| Rationale | `D9` (alternatives), `D10` (complexity), `D11` (open questions) | Authored, chunk 3 |

---

## Capability Foundation

### What The Foundation Actually Is

015 ships one concrete track-record surface, but the thing it establishes underneath that surface is a
**closed measurement loop for dated, falsifiable claims**. The Market Action Center recommendation is the
loop's first claim producer, not its subject. The loop is neutral with respect to the three things that
would otherwise make it Center-specific:

- **Which tool proposed the claim.** The producer is identified by an `originToolId` drawn from `tools.json`
  (`market-brief` for CI-1), never assumed and never hardcoded into the resolver or the scorer.
- **What the claim is about.** The subject is an authored `resolvesTo` list of committed series keys (D1),
  never parsed out of the proposing tool's prose — a discipline forced by the live payload, where all five
  subjects are multi-clause English and none is a `data/bars/` key.
- **Which surface renders the result.** The scorecard leaves the tool as an `rl-tool-read/v1` object (D6),
  the publication contract the Center's Brief view already consumes, so no consumer needs a bespoke
  integration and the Center gains no view (HC-3).

Remove those three and what remains — freeze a predicate before its outcome is observable, resolve it exactly
once against committed data at a stated fence, aggregate the signed outcomes with their uncertainty — is the
shape *any* Research Lab tool would need to score *any* dated claim it makes. That is the foundation, and it
is why `D1`–`D6` are written as versioned contracts rather than as Center features. It is also the design-side
counterpart of `spec.md`'s `## Domain Capability Model`: P1–P9 name the primitives, and this section names the
seam they are reachable through.

**The statistics are explicitly NOT part of this foundation.** `rlvalidation.js` (`RLVALID`, Feature 007) is
the repository's statistics foundation and it already exists, with its own seven primitives, its own closed
`RLV-*` failure codes, and its own owner. 015 **consumes it read-only** (HC-1, BP-015-004, RL-006): no fork,
no wrapper that re-derives a statistic, no eighth primitive, no private estimator. The foundation described
here is the *measurement loop that routes into* `RLVALID` — claim freezing, resolution, cohort construction,
and honest presentation. Where the loop needs a number the seven primitives do not provide, the foundation's
answer is to not display that number rather than to write the eighth (D9).

### Foundation Contract

| Contract | What it guarantees | Consumers |
|---|---|---|
| `brief-recommendation-claim/v1` — the frozen claim object, content-addressed at `briefs/objects/claims/<claimHash>.json` (D1) | Subject, direction, thesis family, predicate, horizon and magnitude are immutable once written: `claimHash` covers all of them, so an amendment yields a *different* claim rather than a mutated one (HC-6, BP-015-001). Provenance (`proposalRunId`, `proposalEventId`, `proposedAt`) sits deliberately outside the hash, which is what makes an identical re-proposal a byte-identical no-op write (BP-015-005). | Resolver (D4); scorer (D5); any future claim producer |
| `brief-action-claim-input/v1` — the authored input block on the producing surface (D1) | The single, key-neutral seam a producer fills in to make its claim resolvable. It is additive and hashes into no existing key, so adopting it migrates nothing. Absence is never an error and never an inference: each missing field maps to its own closed `not-evaluable` reason code (BP-015-006). | Claim minter; every producer |
| Resolution object at `briefs/objects/resolutions/<hex>.json` plus exactly one `CLOSE_EVENT_TYPES` event (D4) | A due claim resolves exactly once, reading only observations dated at or before `horizon.resolutionDate` (HC-5), and enters the ledger through the unmodified `reduceRecommendationEvents` path rather than a fork (HC-2). The claim stays immutable because the resolution is a separate object, not a write-back. | Ledger; scorer; `claimRef` on the extended row (D2) |
| The scorecard — cohort → zero-free directional array → `RLVALID` → rate + interval + sample count (D3, D5) | Every displayed number traces to exactly one named `RLVALID` primitive (HC-1); a resolved-flat outcome is never absorbed into "unresolved" (HC-7); no rate is ever rendered without its interval and its sample count (HC-8). | Tool surface (D7); owner read (D6) |
| `rl-tool-read/v1` owner read (D6) | The scorecard leaves the tool as one already-supported publication object carrying `read`, `asOf` and `deepLink`, derived from the same frozen scorecard the page rendered, so the published sentence cannot drift from the surface that produced it. | Center Brief view; `RLDATA` tool-read cache |

### Extension Points

- **Author a `brief-action-claim-input/v1` block.** A producer supplies `resolvesTo` (committed
  `data/bars/<SYM>.json` keys), `weighting`, `thesisFamily`, `horizonKind` — plus `horizonSessions` when the
  kind is `multi-session` — `predicate`, and `flatBand`. That is the entire obligation, and every field is
  authored at proposal time or the claim is honestly `not-evaluable`.
- **Expose a stable proposal identity.** A producer must mint a recommendation key that is semantically
  stable across runs, and an `originToolId` that exists in `tools.json`. 015 binds to the *publisher* key
  (Architecture Overview) because that is the identity actually present in the 165 committed rows; a second
  producer supplies its own equivalent rather than reusing this one. Positional fallbacks such as
  `action-${index}` are refused at mint time (`non-semantic-subject`, D1) rather than turned into a
  resolvable-looking claim whose subject means nothing.
- **Nothing else.** A producer does not implement a statistic, a closure vocabulary, an interval, a resolver,
  a cohort algebra, a sign convention, or a refusal code. Those are foundation-owned, immediately below.

### Foundation-Owned Behavior

Identical for every implementation and not re-decidable per producer:

- **Freeze before observe.** D1's hashing rules are the mechanism; amendment is structurally impossible, not
  merely discouraged (HC-6, BP-015-001).
- **The as-of fence.** `horizon.resolutionDate` bounds every read, and "a session" is `regular !== null` over
  the committed XNYS calendar — never `dateState === "regular"`, which counts 249 of 251 sessions and admits
  a silent one-session lookahead out of the anti-lookahead machinery itself (D4, HC-5).
- **The closure vocabulary is borrowed, never extended.** Closures are members of `CLOSE_EVENT_TYPES` and
  enter through `reduceRecommendationEvents` unchanged (HC-2, P6).
- **Two orthogonal axes.** Lifecycle (`satisfied` / `invalidated` / `expired` / `withdrawn` / `unresolved` /
  `not-evaluable`) and outcome class (`win` / `loss` / resolved-flat / none) are separate axes; the rate
  denominator is defined on the outcome axis only (D5, D10 row 4).
- **The zero-free array convention.** Resolved-flat is classified upstream and withheld from the array the
  primitives see, because an exact `0` is silently absorbed into `unresolved` by `rlvSummarizeOutcomes`
  (D3, HC-7).
- **One statistic owner, with declared constants.** Every number routes through `RLVALID` using
  `Z_SCORE = 1.96`, `MIN_COHORT_RESOLVED = 20` and `ANNUALIZATION = 252` (D5) — module constants, never
  literals at a call site, and never per-producer choices.
- **Honest states are first class.** `not-evaluable` with a reason code, the insufficient-sample branch below
  `MIN_COHORT_RESOLVED`, and the permanent *derived* unresolvable-legacy count are rendered rather than
  hidden, imputed, or back-filled (BP-015-002, BP-015-003, BP-015-006, HC-4).
- **One closed refusal register.** Every foundation invariant carries an `RTR-*` code with an adversarial
  rejection case (D8, FR-020). Implementations consume the register; they do not invent local codes.
- **Idempotence.** Re-running over the same ledger and the same committed bars is byte-identical and appends
  no duplicate closure (BP-015-005), enforced at the due-set gate — which is where the invariant lives,
  because the reducer does not self-enforce it (F-015-D4-02).

---

## Concrete Implementations

Exactly **one** implementation is in scope for 015. The other two are recorded because they are what make the
seam above a real extension point rather than a single feature described in general language — each was
checked against a surface that already exists in this repository. **Neither is built, planned, scoped, or
committed to by 015, and nothing here implies otherwise.**

| # | Implementation | Producer surface | Subject kind | Predicate / horizon | Resolution source | Status |
|---|---|---|---|---|---|---|
| CI-1 | **Market Action Center recommendation claim** | `payload.nextSession.actions[]` via `scripts/brief-distributed-publish.mjs` (Feature 002); `originToolId` = `market-brief` | `instrument`, `basket`, `sector`, `aggregate` — all four exercised by the live payload's prose subjects | authored `predicate` over an authored `horizon.kind`; `authoredBand` recorded but non-authoritative | committed `data/bars/<SYM>.json`, fenced by `data/calendars/xnys/calendar.json` | **IN SCOPE for 015.** The only implementation this feature ships. `D1`–`D8` specify it end to end |
| CI-2 | Tool-brief read claim | any registered tool's Simple-view read, already published as `rl-tool-read/v1` and cached by `RLDATA` | `instrument`, `sector`, `aggregate` | would require an authored predicate; a tool read today carries a one-line narrative and no falsifiable predicate | same committed bars | **FUTURE — not built.** Listed because it is the cheapest proof the seam is producer-neutral: it needs only an `originToolId` and an authored block, neither of which is Center-specific |
| CI-3 | Cycle / seasonality claim | Feature 006 (Trend Dynamics and Cycle Lab) and Feature 014 (Shared Cycle And Seasonality Exchange) | `sector`, `aggregate` | naturally `multi-session` or `event-bound`; a seasonal window is a horizon, not a threshold | same committed bars | **FUTURE — not built.** Listed as an axis probe: a seasonality claim varies horizon kind and cohort dimension while holding subject kind, magnitude unit and resolution source fixed |

**Why CI-2 and CI-3 are recorded rather than omitted.** A foundation with one implementation is
indistinguishable from a feature that happens to use interface vocabulary. The two future rows are not a
roadmap and carry no commitment; their only job here is to name the axes along which a second producer would
actually differ, which is what forces the seam to be a contract rather than a coincidence. Both are
deliberately drawn from surfaces that already exist — a published tool read, and two shipped cycle features —
so neither is a hypothetical. The honest limitation is stated plainly: CI-2 and CI-3 have **not** been
validated end to end, and until a second producer authors a `brief-action-claim-input/v1` block the seam is
designed-and-argued, not exercised.

### Variation Axes

The vocabularies below are already closed in `D1` and `D5`. This table does not introduce new options; it
states which axis each closed vocabulary is, and which side of the seam owns it.

| Axis | Closed options, and where the vocabulary is declared | Owned by the foundation? |
|---|---|---|
| Claim subject kind | `instrument` \| `basket` \| `sector` \| `aggregate` — D1 `subject.kind`, spec P1 | No — authored per claim |
| Subject weighting | `equal` \| `primary-only` — D1 `subject.weighting` | No — authored per claim, but the *freeze* is foundation-owned: resolving a basket `equal` vs `primary-only` are different measurements, so the choice cannot be made at scoring time |
| Predicate kind | `threshold` \| `relative` \| `directional` \| `spread`, with comparator `gte` \| `lte` \| `gt` \| `lt` \| `crosses-above` \| `crosses-below` — D1 `predicate`, spec P3 | No — authored per claim |
| Horizon kind | `intraday` \| `next-session` \| `multi-session` \| `event-bound` — D1 `horizon.kind`, spec P4 | Split — the option is authored per claim; the fence *semantics* (`resolutionDate`, session counting on `regular !== null`) are foundation-owned |
| Magnitude unit | `percent-return` for CI-1; a claim declares the unit every one of its outcomes is expressed in — D1 `magnitude.unit`, spec P5 | No — declared per claim, and never re-expressed after proposal |
| Sign convention | `direction-adjusted` — D1 `magnitude.signConvention` | **Yes.** It is the adapter between the action vocabulary (`ACTION_DIRECTION`) and `rlvSummarizeOutcomes`' unmodified `value > 0` win test. A producer choosing its own convention would score every correct bearish call as a loss |
| Flat band | `magnitude.flatBand`, frozen at proposal — D1, D3 | Split — the value is authored per claim; that it must be frozen *before* the outcome is visible is foundation-owned, or HC-7 becomes vacuous |
| Resolution data source | committed `data/bars/<SYM>.json` daily bars, fenced by `data/calendars/xnys/calendar.json` — D4 | No for *which* series a claim resolves against; **yes** for the constraint that the source is committed, offline, and deterministic — the resolver has no network path |
| Cohort dimension | scope / owning tool, stated confidence, horizon, claim family, evaluation window — the five closed levers in D5 | **Yes.** The cohort algebra and `RTR-COHORT-MIX` are foundation-owned; a producer contributes *values* along these dimensions, not new dimensions. Whether `actionFamily` becomes a sixth is an open scoping call (F-015-D5-01), not a producer's choice |
| Statistic set | the seven `RLVALID` primitives — `rlvalidation.js`, Feature 007 | **Yes, and closed.** HC-1 forbids an eighth. This is the one axis with exactly one permitted option, which is the point of BP-015-004 |

Two of these axes are load-bearing enough that getting them wrong would be undetectable downstream. The sign
convention is silent: a producer that inverted it would publish a plausible-looking track record in which
every correct hedge counted against it. The horizon fence is silent in the widening direction: a producer that
derived its own fence — the `swing → next-session` mapping D10 row 10 rejects — would resolve claims early and
score theses before they had run, and no statistic computed afterwards can detect it. Both are therefore
foundation-owned rather than authored, and both carry an adversarial `RTR-*` rejection case in D8.

---

## D1 — Frozen Claim Contract

### Purpose

Satisfies **HC-6** (predicate frozen at proposal time) and **P2 / P3 / P4 / P5** by persisting, at the
moment of proposal, a machine-checkable statement of what would make the recommendation right and what
would make it wrong. Nothing about resolution is decided after the outcome is observable.

### Contract: `brief-recommendation-claim/v1`

```jsonc
{
  "contractVersion": "brief-recommendation-claim/v1",

  // ── Binding ────────────────────────────────────────────────────────────────
  "recommendationKey": "sha256:…",   // the publisher key from brief-distributed-publish.mjs#L405
  "proposalRunId":     "dist-2026-07-28-open-…",  // provenance only; NOT hashed (see Hashing Rules)
  "proposalEventId":   "sha256:…",   // the `proposed` event from brief-distributed-publish.mjs#L406
  "proposedAt":        "2026-07-28T13:30:00.000Z", // provenance only; NOT hashed
  "citedToolId":       "sector-research-lab",     // provenance only; NOT hashed. The tool whose detail
                                                  // the action cites, resolved at mint from the authored
                                                  // `deepLink` through `tools.json` `file` → `id`.
                                                  // Unresolvable ⇒ null, never a mint refusal. NOT the
                                                  // producer — see "`citedToolId` Is Not `originToolId`".

  // ── P1 Claim Subject ───────────────────────────────────────────────────────
  // `prose` is the key-bearing string and is UNUSABLE as a series lookup (see
  // "The Authored Subject Is Prose" below). `resolvesTo` is the machine field.
  "subject": {
    "kind":       "basket",          // instrument | basket | sector | aggregate
    "prose":      "Stretched tech / semis beta (QQQ/VGT, SOXX) into any bounce ahead of the 7/28-29 FOMC + MSFT print",
    "resolvesTo": ["QQQ", "VGT", "SOXX"],  // authored machine field; [] ⇒ not-evaluable, never inferred
    "seriesRefs": ["bars/QQQ/1d", "bars/VGT/1d", "bars/SOXX/1d"],
    "weighting":  "equal"            // equal | primary-only; frozen, never chosen at resolution time
  },

  // ── Direction ──────────────────────────────────────────────────────────────
  "actionFamily": "trim",            // one of MARKET_ACTIONS (rlcontracts.js#L708)
  "direction":    -1,                // +1 | -1 | 0, taken from ACTION_DIRECTION (rlcontracts.js#L714)
  "thesisFamily": "growth-extension-derate",  // authored, top-level, HASHED — a per-claim term of both
                                             // derived reducer keys. Absent ⇒ not-evaluable
                                             // (`no-authored-thesis-family`). See D4 key bridge and the
                                             // 2026-08-18 reconciliation.

  // ── P3 Resolution Predicate (immutable after write) ────────────────────────
  "predicate": {
    "kind":       "threshold",       // threshold | relative | directional | spread
    "basis":      "close",           // which committed field the predicate reads
    "comparator": "gte",             // gte | lte | gt | lt | crosses-above | crosses-below
    "value":      1.0,               // in `magnitude.unit`
    "reference":  null               // benchmark series for `relative` / `spread`; null otherwise
  },

  // ── P4 Horizon ─────────────────────────────────────────────────────────────
  // 015-owned resolution mechanics. `authoredBand` is the payload's own
  // classification, recorded for cohorting/display only — it NEVER derives
  // `sessions` or `resolutionDate` (see "Two Horizon Vocabularies" below).
  "horizon": {
    "kind":           "multi-session", // intraday | next-session | multi-session | event-bound
    "sessions":       3,               // authored; required when kind === "multi-session"
    "authoredBand":   "swing",         // structural | swing | tactical — payload label, non-authoritative
    "resolutionDate": "2026-07-31",    // the last date whose bars may be read (HC-5)
    "eventRef":       null             // set only when kind === "event-bound"; resolutionDate is then null
  },

  // ── P5 Outcome-Magnitude Definition ────────────────────────────────────────
  "magnitude": {
    "unit":       "percent-return",   // the unit every outcome for this claim is expressed in
    "entryBasis": "close",            // the observation the outcome is measured from
    "entryDate":  "2026-07-28",       // frozen at proposal; never re-anchored
    "signConvention": "direction-adjusted", // outcome is multiplied by `direction` so + always means "the claim was right"
    "flatBand":   0.0                 // |outcome| ≤ flatBand ⇒ resolved-flat; see D3
  },

  // ── Integrity ──────────────────────────────────────────────────────────────
  "claimHash": "sha256:…"
}
```

### The Authored Subject Is Prose — `resolvesTo` Is The Only Machine Field

**Verified against the live payload this run.** The publisher derives its key from
`payload.nextSession.actions` ([scripts/brief-distributed-publish.mjs#L400-L401](../../scripts/brief-distributed-publish.mjs#L400)),
reading `action.subject` verbatim at [#L403](../../scripts/brief-distributed-publish.mjs#L403). That surface
carries **5 actions**, and every one of their `subject` values is multi-clause English prose, not a symbol:

| # | `action.action` | `action.subject` (verbatim, live `market-brief.payload.json`) | Symbols recoverable? |
|---|---|---|---|
| 0 | `hold` | "SPY / SPMO longer-term structural core — do NOT add index beta while the SPY 50-day is overhead and unreclaimed and SPMO has just lost its 50-day stack" | SPY, SPMO — but only by parsing prose |
| 1 | `trim` | "Stretched tech / semis beta (QQQ/VGT, SOXX) into any bounce ahead of the 7/28-29 FOMC + MSFT print" | QQQ, VGT, SOXX — inside parentheses |
| 2 | `rotate` | "Into the deepened, defensive-tilted Leading 'into' cluster (XLP/XLB/XLRE/XLU/XLV/XLI) vs now-Peaking XLE/XLF and lagging XLK/XLC/XLY" | 11 tickers across three *opposed* roles |
| 3 | `hold` | "MSFT — firming right to its 50-day but still bear-stacked; hold, don't chase, into the 7/29 print" | MSFT |
| 4 | `hedge` | "Carry the small defined-risk hedge into the 7/29 two-way FOMC tail — VIX 18.25 keeps convexity cheap, but eased vol makes it insurance, not a vol-momentum bet" | **none** — no instrument named |

Three properties of that table are load-bearing:

1. **No `subject` value is a `data/bars/` key.** The bars tree is 289 files named `<SYMBOL>.json`
   (**verified**: `data/bars/SPY.json` … 289 entries). No prose string indexes it.
2. **Action 2 names eleven tickers in three opposed roles** — add (`XLP/XLB/XLRE/XLU/XLV/XLI`), trim
   (`XLE/XLF`), and lagging-not-traded (`XLK/XLC/XLY`). A parser that harvested tickers would score the
   *funding* leg and the *avoid* leg as though the claim were long them. That is not a lossy extraction; it is
   an inverted one.
3. **Action 4 names no instrument at all.** `VIX` is quoted as a level, and `data/bars/VIX.json` does not exist
   (**verified absent**). There is nothing to parse even in principle.

**D1's earlier positional-fallback guard does not catch any of this.** That guard fires only when
`typeof action.subject !== 'string'`, producing `action-${index}`
([#L403](../../scripts/brief-distributed-publish.mjs#L403)). All five live subjects *are* strings, so the guard
passes all five while none is resolvable. The guard tests the wrong property — presence, not resolvability.

**Design decision.** `subject.prose` retains the key-bearing string verbatim (it must, or `recommendationKey`
cannot be reproduced). Resolution reads **only** `subject.resolvesTo`, an authored array of `data/bars/`
symbols. The minter performs **no** parsing, no ticker regex, no NER, and no lookup table. When `resolvesTo` is
absent or empty the claim is minted `not-evaluable`, reason **`no-authored-subject`**, and is excluded from
every rate denominator (D5) while remaining visibly counted in the coverage line (BP-015-006). Inferring a
symbol from prose would be exactly the silent scoring lie the positional-fallback guard was written to prevent.

### Two Horizon Vocabularies — No Mapping Is Declared, Because None Is Total

**Verified against the live payload this run.** `nextSession.actions[].horizon` carries
`{ structural: 1, swing: 3, tactical: 1 }` across the 5 live actions; the parallel `recommendations[]` surface
carries `{ structural: 1, swing: 6 }` across 7 entries. D1's `horizon.kind` vocabulary is
`intraday | next-session | multi-session | event-bound`. **The two vocabularies share zero members.**

They are also not the same *kind* of thing, which is why no total mapping can be written honestly:

| | Payload band | D1 `horizon.kind` |
|---|---|---|
| What it expresses | conviction / holding timeframe, qualitative | resolution mechanics |
| Determines | nothing machine-readable | which bar the resolver may read (HC-5 fence) |
| Cardinality | 3 open-ended bands | 4 closed mechanics |
| Session count | **absent** | required (`sessions`, or derived from `kind`) |

A `swing` action may be intended to resolve in three sessions or in fifteen; the payload does not say. Writing
`swing → next-session` would invent a fence and produce a *systematically early* resolution on every swing
claim — a silent HC-5 violation in the widening direction, since every claim would be scored before its thesis
had run.

**Design decision — explicitly the second option.** The claim contract carries **its own** horizon, independent
of the payload's classification. `horizon.kind` and `horizon.sessions` are authored machine fields;
`horizon.authoredBand` records the payload's `action.horizon` string **verbatim** and is used only for cohort
labelling and display (D5 lever, D7 chip). `authoredBand` **never** participates in deriving `sessions` or
`resolutionDate`. A claim whose authored horizon fields are absent is minted `not-evaluable`, reason
**`no-authored-horizon`** — the resolver does not guess a fence.

`authoredBand` is nonetheless part of `claimHash`: it is a frozen semantic label, and HC-6 requires that
changing it yields a different claim rather than mutating an existing one.

### `thesisFamily` Has No Live Source — It Is Authored Or The Claim Is Not Evaluable

**Verified against the live payload this run.** A full recursive walk of `market-brief.payload.json` finds
**zero** occurrences of `thesisFamily` and **zero** of `actionFamily`. The authored action carries exactly
`{ action, subject, rationale, horizon, structuralAnchor, trigger, invalidation, confidence, deepLink }`
(**verified union across all 5 actions**). Nothing in that set yields a thesis grouping.

`deriveRecommendationKeys` ([rlcontracts.js#L1040](../../rlcontracts.js#L1040)) derives
`origin-recommendation-key/v1` over `{ originToolId, thesisFamily, subjects, actionFamily, horizon }`
([#L1041-L1047](../../rlcontracts.js#L1041)) **and** `aggregation-key/v1` over
`{ thesisFamily, subjects, actionFamily, horizon }` ([#L1049-L1055](../../rlcontracts.js#L1049)), so
`thesisFamily` is a **key term of both derived identities**, not a decoration. The aggregation key is the
axis the track record groups on. The foundation also hard-rejects a record that omits it:
`normalizeRecommendation` fails `recommendation-thesis-required` on a non-string `thesisFamily`
([#L1074](../../rlcontracts.js#L1074)) (**verified this run**).

**Why the tempting shortcut is a corruption, not an approximation.** Setting `thesisFamily = actionFamily`
collapses the term set: two claims that share an action family, a subject set and a horizon would then derive
the **same** `originRecommendationKey` regardless of thesis. Live actions 0 and 3 are both `hold`; live
recommendations 2 and 3 are both `trim` on `swing`. Under that shortcut, distinct theses land on one reducer
entry, and `reduceRecommendationEvents` would treat the second proposal as a re-proposal of the first — merging
two independent calls into one grouped entry and destroying the very grouping the track record is measuring.
The corruption is silent: the reducer would report a coherent index, and the resulting hit rate would be
computed over a denominator that had quietly lost calls.

**Design decision.** `thesisFamily` is an **authored, required** field of the claim input block, minted onto
the claim as a **top-level, hashed** field. It is not derived, not defaulted, and not inferred from prose.
When it is absent the claim **cannot be routed through `reduceRecommendationEvents` at all** — HC-2 forbids
015 from closing outside that path — so the claim is minted `not-evaluable`, reason
**`no-authored-thesis-family`**, and no closure event is emitted. Its hash participation is not a separate
choice: it follows from the reducer-key containment invariant recorded under *Hashing Rules*, because
`thesisFamily` is the one term of `origin-recommendation-key/v1` that varies per claim and is not already
carried by `subject` / `actionFamily` / `horizon`.

**The honest consequence, stated plainly.** No action in the live payload carries this field today. Until the
authoring surface supplies the claim input block, **every** claim mints `not-evaluable` and the track record
correctly reports zero resolved outcomes. That is HC-4 holding exactly as written — the record starts at zero —
rather than a defect. It also means FR-018/FR-019 ship a tool whose first honest verdict is the
insufficient-sample branch (D5, HC-8), which D7 already renders as a first-class state.

### `citedToolId` Is Not `originToolId` — The Citation And The Producer Are Different Things

**Verified this run.** `tools.json` carries `experience.kind === "market-action-center"` exactly **once**
(`tools.json#L50`), on the tool whose `id` is `market-brief` (`#L7`) and whose `file` is
`market-brief.html` (`#L15`). Every claim this feature mints originates from that one producer, so
`originToolId` is a **pipeline constant**, not a per-claim field — the ruling already recorded in D4.

The authored action separately carries `deepLink` (**verified this run**: 68 `deepLink` values across the
live payload, naming `sector-research-lab.html`, `gamma-trading-lab.html`, `etf-momentum-lab.html`,
`swing-structure-lab.html`, `msft-july-print-model.html` and others). That field answers a different
question. The producer's own registry blurb states the intent verbatim — each item deep-links *"the tool
that owns the detail"*. A `deepLink` is a **citation to supporting analysis**, not an attribution of
authorship.

**Design decision.** The claim records `citedToolId`, resolved at mint from the authored `deepLink`
through the `tools.json` `file` → `id` map. It is **provenance, excluded from `claimHash`**, and it is
**not** `originToolId`.

- **Why excluded.** A citation does not change what the claim asserts, so it fails D1's content test.
  Hashing it would be actively harmful: a byte-identical call re-proposed with a different supporting
  citation would mint a *second* claim, adding a duplicate to the very denominator the track record
  measures. Corrupting the denominator to keep a hyperlink fresh is the wrong trade.
- **Why no mint refusal.** An absent or unmatched `deepLink` sets `citedToolId: null` and the row renders
  without a deep link. It does **not** refuse the mint. Dropping a resolvable call from the record because
  a display affordance is missing would shrink the denominator over a navigation detail — a measurement
  error in the direction that flatters, since the excluded call might have been a miss.
- **Consequence, stated plainly.** Because `citedToolId` is unhashed, a byte-identical re-proposal reuses
  the first-minted object and keeps the *first* citation. That is a bounded and honest outcome: a
  byte-identical re-proposal is the same call, and pointing at the analysis that originally sourced it is
  defensible provenance rather than a false claim.

### The Authored Claim Input Block

The three fields above (`resolvesTo`, horizon mechanics, `thesisFamily`) share one source: a single additive
block on the authored action, minted into the claim and never inferred.

```jsonc
// payload.nextSession.actions[n].claim  — contract `brief-action-claim-input/v1`
{
  "contractVersion": "brief-action-claim-input/v1",
  "resolvesTo":      ["QQQ", "VGT", "SOXX"],   // data/bars/<SYM>.json keys
  "weighting":       "equal",                   // equal | primary-only
  "thesisFamily":    "growth-extension-derate",
  "horizonKind":     "multi-session",           // intraday | next-session | multi-session | event-bound
  "horizonSessions": 3,                         // required iff horizonKind === "multi-session"
  "predicate":       { "kind": "directional", "basis": "close", "comparator": "gt", "value": 0.0, "reference": null },
  "flatBand":        0.25                       // percent-return; frozen here, see D3/HC-7
}
```

**This block is key-neutral, which is what makes it safe to add.** The publisher reads exactly two fields off
the action — `action.subject` ([#L403](../../scripts/brief-distributed-publish.mjs#L403)) and `action.action`
([#L404](../../scripts/brief-distributed-publish.mjs#L404)) — and hashes only those two into
`recommendationKey` ([#L405](../../scripts/brief-distributed-publish.mjs#L405)). Adding `action.claim`
therefore changes **no** existing key, invalidates **no** committed row, and requires **no** migration of the
165 rows already in `briefs/history/recommendations/2026-07.jsonl`. `rlbrief.js` maps actions through
`normalizeRecommendation` ([rlbrief.js#L671](../../rlbrief.js#L671)), a field-selecting mapper rather than a
closed-key validator, so an unknown key is ignored rather than rejected.

**Ownership.** The authored payload is Feature 002's surface. This block is an **additive, optional** field on
an existing object — the same consent shape as D2's ledger-row extension, and it is subject to the same Feature
002 consent gate recorded there. Absence is not an error; absence is `not-evaluable`.

**Every absence has its own reason code.** `no-authored-subject`, `no-authored-horizon`,
`no-authored-thesis-family`, and `no-authored-predicate` are distinct members of the closed `not-evaluable`
reason set (D4), so the coverage line can show *which* field is missing rather than a single opaque bucket.

### Field Semantics That Are Load-Bearing

- **`direction` + `signConvention: "direction-adjusted"`** is what lets a `trim`/`hedge` claim
  (`ACTION_DIRECTION` = `-1`, [rlcontracts.js#L714](../../rlcontracts.js#L714)) produce a **positive**
  outcome when it was right. Without this, `rlvSummarizeOutcomes`' `value > 0` win test
  ([rlvalidation.js#L136](../../rlvalidation.js#L136)) would score every correct bearish call as a loss.
  The sign convention is therefore not cosmetic — it is the adapter between the action vocabulary and the
  unmodified primitive.
- **`horizon.resolutionDate` is the lookahead fence (HC-5).** The resolver may read observations dated at
  or before this date and no others. It is frozen here, at proposal, precisely so it cannot be widened
  after the fact.
- **`magnitude.flatBand` is frozen here, not chosen at scoring time.** On real price data an exactly-zero
  return has measure zero, so without a proposal-time band the resolved-flat class would never fire and
  HC-7 would be vacuous. Freezing the band at proposal keeps HC-6 intact — the boundary between
  "resolved-flat" and "small win" cannot be tuned once the outcome is visible.
- **`subject.resolvesTo: []`** is the honest path to `not-evaluable` (P6, BP-015-006): a claim whose
  authored subject names no committed series is recorded as such at proposal time rather than failing opaquely
  at resolution. The same applies to an absent `horizon.kind` and an absent `thesisFamily` — each carries its
  own reason code so the coverage line names the missing field rather than reporting one opaque bucket.
- **`subject.weighting` is frozen at proposal, not chosen at scoring time.** A basket claim resolved
  `equal`-weighted and the same claim resolved `primary-only` are different measurements. Leaving the choice to
  the resolver would let the weighting be picked after the outcome is visible, which is precisely the HC-6
  failure the claim object exists to prevent.
- **`horizon.authoredBand` is hashed but non-authoritative.** It is hashed because HC-6 requires a frozen
  semantic label to be immutable; it is non-authoritative because no total mapping exists between it and
  `horizon.kind` (see "Two Horizon Vocabularies" above). The resolver never reads it.

### Relationship To The Existing Publisher Key

The publisher builds its stable key at
[scripts/brief-distributed-publish.mjs#L405](../../scripts/brief-distributed-publish.mjs#L405):

```js
const recommendationKey = stableSha({ contractVersion: 'brief-distributed-reckey/v1', subject, family });
```

Two properties of that line drive this design:

1. **The key hashes only `{ subject, family }` — `horizon` is absent.** Two claims on the same subject and
   action family but different horizons therefore collide on `recommendationKey`. The claim object
   resolves this by carrying `horizon` itself and by including it in `claimHash`: `recommendationKey` is
   **one-to-many** with `claimHash`. The ledger row's `claimRef` (D2) names *which* claim a given event
   belongs to, so a same-key/different-horizon pair remains individually resolvable without touching the
   publisher's key derivation.
2. **`subject` and `family` have positional fallbacks** — `action-${index}`
   ([#L403](../../scripts/brief-distributed-publish.mjs#L403)) and `'note'`
   ([#L404](../../scripts/brief-distributed-publish.mjs#L404)) — when the authored action is malformed. A
   key derived from a positional fallback is not semantically stable across runs. **The claim minter must
   refuse to mint a claim for such an action** and record it as `not-evaluable` with the reason
   `non-semantic-subject`. Minting a claim on `action-3` would create a resolvable-looking claim whose
   subject means nothing, which is a silent scoring lie.

   **This guard is necessary but not sufficient, and the live payload proves it.** It fires only on
   `typeof action.subject !== 'string'`. All 5 live subjects are strings and all 5 pass it, yet none is a
   `data/bars/` key — see "The Authored Subject Is Prose" above. `non-semantic-subject` therefore covers the
   *malformed* case only; the *prose* case is covered by `no-authored-subject` on an absent `resolvesTo`. Both
   codes are required, because they detect different failures.

3. **The key hashes the prose, so the prose must be retained.** Since `recommendationKey` is
   `stableSha({ contractVersion, subject, family })` over the verbatim prose string, `subject.prose` is kept in
   the claim exactly as authored. A claim that normalised, trimmed, or symbol-extracted that string could no
   longer reproduce the key it binds to, and would silently orphan itself from the ledger row.

### Hashing Rules

```
claimHash = stableSha({
  contractVersion: "brief-recommendation-claim/v1",
  recommendationKey,
  subject,          // { kind, prose, resolvesTo, seriesRefs, weighting }
  actionFamily,
  direction,
  thesisFamily,     // authored; a per-claim term of BOTH derived reducer keys (D4 bridge)
  predicate,        // whole object
  horizon,          // whole object, incl. sessions and authoredBand
  magnitude         // whole object
})
```

**The complete unhashed set is exactly four fields:** `proposalRunId`, `proposalEventId`, `proposedAt`,
`citedToolId`. Every other field of `brief-recommendation-claim/v1` is hashed. There is no fifth
category and no unhashed block; see the 2026-08-18 reconciliation for the block that was withdrawn.

- **Content-only.** The four unhashed fields are recorded on the object but **excluded from the hash**.
  This mirrors the existing convention where `observationFingerprint`
  ([rlcontracts.js#L1056](../../rlcontracts.js#L1056)) hashes terms while `lifecycleEventId`
  ([rlcontracts.js#L1109](../../rlcontracts.js#L1109)) is the thing that carries `runId`. Identical terms
  re-proposed in a later run therefore reuse the identical claim object, which is what makes re-running
  idempotent (BP-015-005).
- **The reducer-key containment invariant.** Every term of `origin-recommendation-key/v1` that varies per
  claim is inside `claimHash`. The foundation derives that key over
  `{ originToolId, thesisFamily, subjects, actionFamily, horizon }`
  ([rlcontracts.js#L1041-L1047](../../rlcontracts.js#L1041)); `subjects`, `actionFamily` and `horizon` are
  hashed here as `subject` / `actionFamily` / `horizon`, `thesisFamily` is hashed here, and `originToolId`
  is a pipeline constant that does not vary per claim (D4). The invariant is what makes `claimHash` a
  *refinement* of `originRecommendationKey`: one claim object can only ever derive one reducer key. Move
  any varying term out of the hash and the containment breaks — two claims that belong to different
  reducer entries collide on one content address, and the store has no way to hold both.
- **Every hashed field is frozen (HC-6).** Any change to subject, direction, thesis, predicate, horizon,
  or magnitude yields a *different* `claimHash` — i.e. a different claim — rather than mutating an existing
  one. Amendment is structurally impossible, not merely discouraged.
- **Content-addressed write.** Because the filename is the hash, re-minting an identical claim is a
  byte-identical no-op write. A write that would change the bytes at an existing path is a contract
  violation and must abort, not overwrite.

### Storage Location

```
briefs/objects/claims/<claimHash-hex>.json
```

This follows the layout already in use under `briefs/objects/` — content-addressed, bare lowercase
sha256 hex filename, `.json` extension, one object per file (as in the existing
`briefs/objects/evidence/bundles/<hex>.json` tree). Claim objects are **append-only**: never rewritten,
never deleted, never garbage-collected, because a deleted claim would silently remove a call from the
denominator.

The resolver's output is stored as a **separate** object, `briefs/objects/resolutions/<hex>.json`, rather
than being folded back into the claim. This keeps the claim immutable by construction and keeps the
Feature 002 row change to a single field (D2).

---

## D2 — Additive Ledger Row Extension

### Current Contract (Feature 002-owned)

`brief-recommendation-history-row/v1` has exactly seven fields:

| Field | Role |
|---|---|
| `canonicalMonth` | partition key |
| `contractVersion` | `"brief-recommendation-history-row/v1"` |
| `eventId` | unique per (run, key, index) — [brief-distributed-publish.mjs#L406](../../scripts/brief-distributed-publish.mjs#L406) |
| `eventType` | lifecycle transition |
| `occurredAt` | event timestamp |
| `recommendationKey` | stable across runs — [brief-distributed-publish.mjs#L405](../../scripts/brief-distributed-publish.mjs#L405) |
| `runId` | producing run |

There is no slot for a claim, an outcome, or a resolution.

### The Extension

**Exactly one new optional field: `claimRef`.**

```jsonc
{
  "canonicalMonth":    "2026-07",
  "claimRef":          "sha256:…",   // NEW — optional; the claimHash from D1
  "contractVersion":   "brief-recommendation-history-row/v2",
  "eventId":           "sha256:…",
  "eventType":         "proposed",
  "occurredAt":        "2026-07-28T13:30:00.000Z",
  "recommendationKey": "sha256:…",
  "runId":             "dist-2026-07-28-open-…"
}
```

- **Type: opaque string**, not a nested object. A bare `sha256:…` string matches how `stableSha` outputs
  are already threaded through the publisher and minimises the canonicalisation surface a schema change
  introduces.
- **Deliberately one field, not three.** The outcome value, outcome class, and closure reason all live in
  the 015-owned `briefs/objects/resolutions/<hex>.json` object, reachable via `claimRef` + `eventId`. The
  ledger row gains a *pointer*, not a payload. When you must ask another feature's owner to change their
  contract, the correct ask is the smallest one that works.

### Why This Is Additive And Safe

| Compatibility property | Why it holds |
|---|---|
| **Existing rows stay valid** | `claimRef` is optional. The 160 pre-existing rows are simply absent the field. They are **not** null-filled, back-filled, or estimated — absence *is* the `unresolvable-legacy` marker required by HC-4 / BP-015-002. |
| **`eventId` is unchanged** | `eventId` is hashed from its own object at [brief-distributed-publish.mjs#L406](../../scripts/brief-distributed-publish.mjs#L406) (`{ contractVersion, runFingerprint, recommendationKey, index }`) — it is **not** a hash of the row. Adding a row field therefore cannot perturb any existing event identifier. |
| **`recommendationKey` is unchanged** | Derived at [#L405](../../scripts/brief-distributed-publish.mjs#L405) from `{ subject, family }` only. Untouched. |
| **Canonical ordering is stable** | Keys canonicalise sorted, so `claimRef` lands deterministically between `canonicalMonth` and `contractVersion`. No consumer that reads by key name is affected. |
| **Unaware consumers keep working** | A reader that projects the seven known fields ignores `claimRef` entirely. Nothing 015 adds is required to read a row. |

### Why `v2` Rather Than An In-Place `v1` Addition

The codebase's established validation idiom is a **closed field list**: `RECOMMENDATION_FIELDS`
([rlcontracts.js#L727](../../rlcontracts.js#L727)) is checked by `hasOnlyFields`, and an unrecognised key
returns an `"unknown-field"` failure. If the row validator follows that same idiom — and the surrounding
code strongly suggests it does — then emitting `claimRef` on a row still stamped
`brief-recommendation-history-row/v1` would be **rejected as an unknown field**, not silently accepted.

Therefore:

- New rows carrying `claimRef` declare `brief-recommendation-history-row/v2`.
- **v2 is a strict superset of v1**: same seven fields, same semantics, plus one optional field.
- **Readers MUST accept both** `v1` and `v2`. v1 is not deprecated and is never rewritten.
- No migration runs. No historical row is touched.

### ⚠️ Ownership — Feature 002 Consent Required

`brief-recommendation-history-row/v1` is **owned by Feature 002 (Distributed Tool Briefs And History)**.
Feature 015 does **not** own this contract and **MUST NOT** modify it unilaterally.

This design specifies the change; it does not authorise it. Landing D2 requires:

1. A routed handoff to the **Feature 002 owner** proposing the `v2` superset and the single optional
   `claimRef` field.
2. Explicit 002-owner consent recorded before any scope that emits a `v2` row is implemented.
3. The 002-owned validator's field list and version acceptance updated **by 002**, not by 015.

If consent is withheld, the fallback is a fully 015-owned side-index
(`claimRef` keyed by `eventId` in an 015-owned object) that leaves the row contract untouched at the cost
of a second lookup. That fallback is strictly worse for consumers but requires no other owner's contract
change, and is recorded here so the handoff is a genuine decision rather than a demand.

---

## D3 — Resolved-Flat Sentinel (HC-7)

### The Defect Being Designed Around

`rlvSummarizeOutcomes` at [rlvalidation.js#L134](../../rlvalidation.js#L134) classifies outcomes with two
strict tests and derives the third class by subtraction:

```js
var wins   = outcomes.filter(function (value) { return value > 0; });   // L136
var losses = outcomes.filter(function (value) { return value < 0; });   // L137
var unresolved = outcomes.length - wins.length - losses.length;         // L138
```

An outcome of exactly `0` is neither `> 0` nor `< 0`, so it falls through into `unresolved`. A claim that
**was** resolved, against committed data, to a flat result is reported as though it was never resolved at
all. That is the HC-7 violation.

Two further behaviours of the primitive constrain any fix:

- **Every element must be a finite number.** The guard on the line immediately following
  [#L134](../../rlvalidation.js#L134) rejects the array outright (`RLV-OUTCOME-VALUES`) if any element is
  non-finite. `null`, `undefined`, and `NaN` are therefore **not** available as sentinels.
- **`winRate` divides by the full input length**, not by the resolved count:
  `winRate: wins.length / outcomes.length` ([rlvalidation.js#L147](../../rlvalidation.js#L147)). Whatever
  goes into the array *is* the denominator of the published rate.

### Constraint

`rlvalidation.js` is **Feature 007-owned and MUST NOT be modified.** The module additionally freezes its
own export surface and deep-freezes every result, so there is no monkey-patch seam even if one were
wanted. The fix must live entirely on the resolver/scorer side and must feed the primitive **unmodified**.

### The Convention: Classify Upstream, Feed A Zero-Free Array

The resolver assigns every claim exactly one `outcomeClass` at resolution time, and the scorer decides —
per class — whether that claim contributes a *number* to the primitive or a *count* to the surrounding
report.

| `outcomeClass` | Closure event (`CLOSE_EVENT_TYPES`, [rlcontracts.js#L720](../../rlcontracts.js#L720)) | `outcomeValue` stored | Fed to `rlvSummarizeOutcomes`? |
|---|---|---|---|
| `win` | `satisfied` | signed, `> flatBand` | **Yes** — contributes a positive number |
| `loss` | `invalidated` | signed, `< -flatBand` | **Yes** — contributes a negative number |
| `resolved-flat` | `satisfied` or `invalidated` per predicate | exact value, `abs ≤ flatBand` | **No** — contributes a *count* |
| `unresolved` | `unresolved` or `expired` | `null` | **No** — contributes a *count* |
| `not-evaluable` | `not-evaluable` | `null` | **No** — contributes a *count* |
| `unresolvable-legacy` | *(no closure — pre-existing row, no claim)* | absent | **No** — contributes a *count* (HC-4) |

The rules that make this work:

1. **The resolver never emits a bare `0` into the scoring array.** HC-7 is satisfied at the source: a
   flat result is recorded as `outcomeClass: "resolved-flat"` with its true numeric value preserved in
   the 015-owned resolution object, and is withheld from the array handed to the primitive.
2. **No sign is fabricated.** Nudging a flat outcome to `+ε` or `-ε` to make it land in `wins` or
   `losses` would manufacture a directional result the data does not support. That is explicitly
   rejected. The value is kept exact; only its *routing* differs.
3. **The array fed to `rlvSummarizeOutcomes` contains only `win` and `loss` outcomes** — every element
   finite and strictly non-zero. The primitive runs on legal input, unmodified, and its internal
   `unresolved` becomes structurally `0`.
4. **The primitive's `unresolved` field is therefore never displayed.** Under this convention it is
   always `0` by construction, so surfacing it would read as "0 unresolved" while genuinely unresolved
   claims exist — a lie. 015 renders its **own** resolver-side counts for `resolved-flat`, `unresolved`,
   `not-evaluable`, and `unresolvable-legacy`. This is the one field of the primitive's result that the
   scorer must consume and discard.

### Denominator Contract

Because `winRate` divides by the fed array's length
([rlvalidation.js#L147](../../rlvalidation.js#L147)), the fed array's composition *is* the published
denominator, and it must be labelled as such:

```
resolvedDirectional = wins + losses          ← the array length, and the rate denominator
displayed rate      = wins / resolvedDirectional
```

- The rate is labelled **"directional hit rate"**, never a bare "hit rate", and always renders its
  denominator alongside it (HC-8).
- The interval comes from `rlvWilsonInterval(wins, resolvedDirectional, z)`
  ([rlvalidation.js#L112](../../rlvalidation.js#L112)), called with **the same `total` that is
  displayed**. That primitive requires integer counts with `total ≥ 1` and `wins ≤ total`, which this
  denominator satisfies by construction.
- The non-directional classes are rendered **beside** the rate, never folded into it and never dropped:
  `resolved-flat: n`, `unresolved: n`, `not-evaluable: n`, `unresolvable-legacy: 160`. Every proposed
  call is visible in exactly one bucket, so the buckets sum to the total call count. This is what makes
  HC-4 and BP-015-006 checkable by inspection rather than by trust.

### Empty-Cohort Guard

`rlvSummarizeOutcomes` **fails on an empty array** — the same guard that rejects non-finite values also
rejects `!outcomes.length`, returning `RLV-OUTCOME-VALUES`. A cohort in which every claim resolved flat,
unresolved, or not-evaluable therefore produces a zero-length directional array and **must not be passed
to the primitive at all.**

The scorer checks `resolvedDirectional` before calling:

- `resolvedDirectional === 0` → render the explicit **insufficient-sample** state (BP-015-003) with the
  class counts. No rate, no interval, no call into `RLVALID`.
- `0 < resolvedDirectional < minimumCohortSize` → call the primitives, but render the interval and the
  insufficient-sample state **instead of** a headline probability (BP-015-003, HC-8).
- `resolvedDirectional ≥ minimumCohortSize` → render rate + interval + sample count.

This turns the primitive's failure mode into a designed, honest UI state rather than an error path.

### Why Not The Alternatives

| Alternative | Rejected because |
|---|---|
| Modify `rlvSummarizeOutcomes` to add a `flat` class | `rlvalidation.js` is Feature 007-owned and MUST NOT be modified. |
| Wrap `RLVALID` in an 015 shim that re-derives the counts | Re-deriving `wins`/`losses`/`winRate` outside the primitive re-implements a statistic — a direct HC-1 / BP-015-004 violation. |
| Feed `null` / `NaN` for flat outcomes | The finiteness guard immediately after [rlvalidation.js#L134](../../rlvalidation.js#L134) rejects the whole array. |
| Nudge flat outcomes to `±ε` | Fabricates a direction the data does not support; the resulting win/loss counts would be untrue. |
| Add a new closure event type such as `flat` | `CLOSE_EVENT_TYPES` ([rlcontracts.js#L720](../../rlcontracts.js#L720)) is closed and 002-owned; HC-2 and P6 forbid local extension. `resolved-flat` is a *classification of the outcome*, carried in the 015-owned resolution object, while the closure event itself stays inside the existing vocabulary. |

---

## D4 — Deterministic Outcome Resolver

### Purpose

Satisfies **FR-003 / FR-004 / FR-005 / FR-006 / FR-007**, **HC-5**, **HC-10**, **UC-002**, **UC-005** and
**BS-002 / BS-003 / BS-007 / BS-009 / BS-010**. Converts a frozen claim (D1) plus committed observations into
one signed outcome and exactly one closure event drawn from the existing vocabulary.

### Where It Runs

```
scripts/brief-resolve-outcomes.mjs        ← Node, offline, no network, no credential
```

This joins the existing `scripts/brief-*.mjs` family (`brief-author.mjs`, `brief-distributed-publish.mjs`,
`brief-publication.mjs`, `brief-refresh.mjs`, `migrate-brief-history.mjs`), so the resolver is an ordinary
member of an established script surface rather than a new execution model.

**HC-10 is enforced structurally, not by convention.** The resolver's entire input set is committed repository
state — `briefs/objects/claims/`, `briefs/history/recommendations/*.jsonl`, `data/bars/*.json` (**289 committed
symbol files, verified**), and `data/calendars/xnys/calendar.json`. It performs no `fetch`, opens no socket,
reads no provider key, and never consults `RLDATA`'s browser fetch path (`rldata.js` explicitly scopes those to
"browser only; Node callers use `scripts/brief-refresh.mjs`", [rldata.js#L470](../../rldata.js#L470)). A
committed assertion in `scripts/selftest.mjs` must prove the absence of network/credential surface, in the same
idiom the repo already uses for `rlvalid-node-safe-no-dom-storage-network`. A violation is
**`RTR-NETWORK`**.

### Input Set Selection — Which Claims Are Due

The resolver's due set is computed from the 015-owned reduction state, **not** by scanning the ledger for
timestamps:

```
due(asOfDate) = { entry ∈ index.entries :
                    entry.state === "active"                       ← idempotence gate, see below
                  ∧ entry has a claimRef                           ← legacy rows have none (D2)
                  ∧ claim(entry).horizon.resolutionDate ≤ asOfDate }
```

`index` is a `recommendation-index/v1` produced by `reduceRecommendationEvents`
([rlcontracts.js#L1134](../../rlcontracts.js#L1134)); `entry.state` is set to `"closed"` by the reducer's own
closure path ([rlcontracts.js#L1281](../../rlcontracts.js#L1281)).

#### Horizon expiry is calendar arithmetic, never date arithmetic

`resolutionDate` is frozen at proposal (D1), but the value written there is computed from the committed
exchange calendar `data/calendars/xnys/calendar.json` — contract `xnys-calendar/v1`, `calendarId: "XNYS"`,
`timeZone: "America/New_York"`, `coverageStart: "2026-01-01"`, `coverageEnd: "2026-12-31"`, with 365
`rows[]` each carrying `{ tradingDate, dateState, closureCode, closureLabel, preMarket, regular, afterHours }`
(**verified**).

##### The session predicate — `regular !== null`, never `dateState === "regular"`

This is the single most consequential line in D4, and the obvious form of it is wrong.

**Verified against the committed calendar this run.** The 365 rows distribute as
`{ regular: 249, weekend: 104, holiday: 10, early-close: 2 }` by `dateState`. But the count of rows carrying a
**non-null `regular` block** is **251** — the 249 plus **both** `early-close` rows:

| `tradingDate` | `dateState` | `regular.startLocal` | `regular.endLocal` | Trading session? |
|---|---|---|---|---|
| 2026-11-27 | `early-close` | `09:30:00-05:00` | `13:00:00-05:00` | **Yes** — 3.5h regular session |
| 2026-12-24 | `early-close` | `09:30:00-05:00` | `13:00:00-05:00` | **Yes** — 3.5h regular session |

Both rows have `closureCode: null` and `closureLabel: null`. They are ordinary trading days that close early —
the day after Thanksgiving and Christmas Eve. Bars exist for them. **A predicate keyed on
`dateState === "regular"` counts 249 sessions and skips both.**

**That undercount is a lookahead, and it is produced by the anti-lookahead machinery itself.** A
`next-session` claim entered on 2026-11-26 would step to the first row with `dateState === "regular"` —
2026-11-30 — instead of 2026-11-27. Its `resolutionDate` is then one session *later* than the claim's terms
say, so the fence `sessionDate(row.t) ≤ resolutionDate` admits an extra session of price movement into a
predicate frozen over a shorter window. The claim is scored on information its author never had. That is a
direct **HC-5** violation, and it is silent: no code fires, no bar is missing, and the resolver reports a clean
outcome. The same defect shifts `multi-session` claims spanning either date by one session, and expires
`intraday` claims entered on either date as `not-evaluable` for want of a session that plainly exists.

**Correct predicate.** A row is a trading session **iff it carries a non-null `regular` block**:

```js
const isSession = (row) => row.regular !== null && row.regular !== undefined;
const sessionsAsc = calendar.rows
  .filter(isSession)
  .sort((a, b) => a.tradingDate < b.tradingDate ? -1 : 1);   // 251 sessions in 2026, verified
```

`dateState` is **never** the session test. It is retained only as descriptive metadata and as the source of the
`earlyClose` provenance flag below. Weekend and holiday rows are excluded automatically and correctly, because
**every** row with `dateState` of `weekend` or `holiday` has `regular === null` (**verified**: the 251 non-null
rows partition exactly as `{ regular: 249, early-close: 2 }`, with zero weekend or holiday rows among them).

**The date field is `tradingDate`, not `date`.** Verified on the row key set
`{ tradingDate, dateState, closureCode, closureLabel, preMarket, regular, afterHours }`. A resolver reading
`row.date` gets `undefined` on every row, which would sort the session array arbitrarily and produce a
non-deterministic fence — an HC-10 failure as well as an HC-5 one. The validator asserts the key's presence
rather than trusting it.

| `horizon.kind` | `resolutionDate` derivation (over `sessionsAsc`) |
|---|---|
| `intraday` | the `entryDate` session itself; `entryDate` must satisfy `isSession` |
| `next-session` | the first subsequent `tradingDate` in `sessionsAsc` |
| `multi-session` | the *n*-th subsequent entry in `sessionsAsc`; *n* is `horizon.sessions`, frozen in the claim |
| `event-bound` | `resolutionDate` is `null`; the `eventRef` date supplies the fence at resolution time |

Adding calendar days would resolve a Friday `next-session` claim on a Saturday and silently mark it
`not-evaluable` for want of a bar. Counting sessions cannot make that mistake — **provided the session test is
`regular !== null`**.

**Early-close sessions are flagged, not excluded.** When `entryDate` or `resolutionDate` falls on a row with
`dateState === "early-close"`, the resolution object records `provenance.earlyCloseSessions: [<tradingDate>…]`.
A shortened session has a genuine regular close and resolves normally; the flag exists so a reader can see that
an outcome rests on a 3.5-hour session, in exactly the idiom already used for `reconstructedSessions`.

**Adversarial test obligation (`RTR-SESSION-PREDICATE`).** A committed case fixes a `next-session` claim with
`entryDate: "2026-11-26"` and asserts `resolutionDate === "2026-11-27"`. Under the `dateState === "regular"`
predicate this test yields `"2026-11-30"` and **fails**; under `regular !== null` it passes. A second case
asserts the derived session count for 2026 is **251**, which fails at 249 under the broken predicate. Neither
case is tautological: both discriminate the two predicates on committed data, and both would have caught this
defect before it shipped.


**Coverage is finite and must be checked.** A `resolutionDate` beyond `coverageEnd` cannot be derived, and
guessing one is fabrication. The resolver refuses with **`RTR-CALENDAR-COVERAGE`** and the claim closes
`not-evaluable`, reason `calendar-coverage-exhausted`. The calendar is a committed artifact with a finite
window; treating it as infinite is the kind of assumption that fails once, quietly, at a year boundary.

### As-Of Read Discipline (HC-5 — No Lookahead)

Committed daily bars carry rows shaped `{ t, o, h, l, c, v }` where `t` is the **regular-session open in epoch
milliseconds**. Verified on `data/bars/SPY.json` (502 rows, `asof: "2026-07-27"`):

```
1785159000000  →  2026-07-27T13:30:00Z  →  session date 2026-07-27
1784899800000  →  2026-07-24T13:30:00Z  →  session date 2026-07-24
```

Because the regular open is `13:30Z` (EDT) or `14:30Z` (EST) — both inside the same UTC calendar day as the ET
session — the session date is the UTC calendar date of `t`. That coincidence is load-bearing, so it is asserted
rather than assumed: the resolver cross-checks each derived session date against
`calendar.rows[].regular.startUtc` and refuses on mismatch.

**The fence:**

```
readable(claim) = { row ∈ bars.rows : sessionDate(row.t) ≤ claim.horizon.resolutionDate }
```

The resolver slices the bar array to `readable(claim)` **once, before** predicate evaluation, and the predicate
evaluator is handed only that slice. Lookahead is prevented by the shape of the data the evaluator can see, not
by a rule the evaluator is asked to obey. Any attempt to consult a row outside the slice is
**`RTR-LOOKAHEAD`** (AC-004, BS-007).

**Not-yet-resolvable is a skip, not a refusal.** If `bars.asof < claim.horizon.resolutionDate` the outcome is
simply not observable yet: the claim stays `active`, no event is appended, and no code fires. Conflating "the
future has not happened" with "you tried to read the future" would make `RTR-LOOKAHEAD` fire on every routine
run and train everyone to ignore it.

**Data-quality gates.** Each bars file carries `reconstructedSessions`, `thinObservedSessions`, and
`zeroObservedSessions` (**verified** — `SPY.json` lists `reconstructedSessions: ["2026-07-24"]`). If the
`entryDate` or `resolutionDate` session appears in `zeroObservedSessions`, the claim closes `not-evaluable`,
reason `zero-observed-session`. A `reconstructedSessions` or `thinObservedSessions` hit does **not** block
resolution but is recorded verbatim in the resolution object's `provenance`, so a reader can see that an outcome
rests on a repaired bar.

### Predicate Evaluation Model

Each `predicate.kind` from D1 evaluates against the fenced slice. `basisAt(date)` reads
`predicate.basis` (`close` → `c`, and `h`/`l` for path comparators) from the row whose session date is `date`.
A required session missing from the slice is `unresolved`, reason `session-absent` — never an interpolation.

| `predicate.kind` | Evaluated quantity | Satisfied when |
|---|---|---|
| `threshold` | `q = ret(subject, entryDate → resolutionDate)` | `cmp(q, predicate.value)` |
| `relative` | `q = ret(subject) − ret(predicate.reference)` over the same window | `cmp(q, predicate.value)` |
| `directional` | `q = direction × ret(subject)` | `q > magnitude.flatBand` |
| `spread` | `q = ret(subject.leg) − ret(reference.leg)`, both over the same window | `cmp(q, predicate.value)` |

where `ret(x) = (basisAt(resolutionDate) / basisAt(entryDate) − 1) × 100` in `percent-return`, and `cmp` is
`predicate.comparator`.

- **Point comparators** (`gte`, `lte`, `gt`, `lt`) evaluate once, at `resolutionDate`.
- **Path comparators** (`crosses-above`, `crosses-below`) evaluate over every session in
  `[entryDate, resolutionDate]` using `h` and `l`. They are path-dependent, so they require the **complete**
  intervening session set. A gap closes the claim `unresolved`, reason `path-incomplete`. A path predicate
  evaluated over a partial path is a different predicate, and silently doing that would break HC-6.
- `predicate.reference` is `null` for `threshold` and `directional`; a `relative` or `spread` claim whose
  reference series is absent from `data/bars/` closes `not-evaluable`, reason `no-committed-reference`.

### Outcome Magnitude

```
outcomeValue = direction × ret(subject)          // magnitude.unit, magnitude.signConvention (D1)
```

`direction` comes from `ACTION_DIRECTION` ([rlcontracts.js#L714](../../rlcontracts.js#L714) —
`add: 1, rotate: 1, trim: −1, hedge: −1, hold: 0`), frozen into the claim at proposal. Multiplying by it is what
makes a correct `trim` or `hedge` produce a **positive** number, which is the only reason
`rlvSummarizeOutcomes`' `value > 0` win test ([rlvalidation.js#L136](../../rlvalidation.js#L136)) is meaningful
for bearish claims.

**`direction === 0` (`hold`) has no signed outcome.** A `hold` claim closes `not-evaluable`, reason
`neutral-direction-no-magnitude`. Assigning it a sign would invent a direction the action family explicitly
declines to take.

Values are stored **unrounded**, as IEEE-754 doubles, with rounding applied only at render. Identical inputs
therefore produce identical bits, which is what NFR *Determinism* actually requires.

### Closure-Event Selection

Two independent axes are recorded, and **conflating them is the mistake this section exists to prevent**:

- The **closure event** is decided solely by the frozen predicate. It is drawn from `CLOSE_EVENT_TYPES`
  ([rlcontracts.js#L720](../../rlcontracts.js#L720)) and nothing else (HC-2, P6).
- The **`outcomeClass`** is decided solely by `outcomeValue` against `magnitude.flatBand` (D3).

| Condition at `resolutionDate` | Closure event | `outcomeClass` | Reason code |
|---|---|---|---|
| Predicate satisfied | `satisfied` | `win` \| `loss` \| `resolved-flat` by magnitude | `predicate-satisfied` |
| Invalidation condition met first | `invalidated` | `win` \| `loss` \| `resolved-flat` by magnitude | `predicate-invalidated` |
| Horizon reached, neither satisfied nor invalidated | `expired` | `unresolved` | `horizon-elapsed` |
| Required session absent / path incomplete | `unresolved` | `unresolved` | `session-absent` \| `path-incomplete` |
| No committed series, no reference, no calendar coverage, zero-observed session, `hold` | `not-evaluable` | `not-evaluable` | see reasons above |
| Author withdrew the claim | `withdrawn` | *(no outcome)* | **never resolver-emitted** |

Three consequences worth stating plainly:

1. **A `satisfied` claim can carry a negative `outcomeValue`.** The predicate can be met while the
   direction-adjusted magnitude is negative — a threshold clearing on the resolution session after an adverse
   path, for instance. Recording both axes preserves that fact; collapsing them would quietly overwrite one of
   them. This is also why D3's `resolved-flat` row reads "`satisfied` or `invalidated` per predicate": the
   closure event is not derivable from the outcome class.
2. **`withdrawn` is never emitted by the resolver.** Withdrawal is an authoring act, and a resolver that could
   withdraw a claim could withdraw the ones it was about to score badly. It closes claims; it does not retract
   them.
3. **`not-evaluable` closes at the first resolver pass after minting**, not at horizon expiry. When the subject
   has no committed series the answer is already known, and parking a known-unscoreable claim in the "open,
   awaiting horizon" pipeline until its horizon passes would misrepresent the pipeline. `subject.seriesRef`
   being `null` at mint (D1) is the primary trigger; a subject absent from the 289 committed files is the
   secondary one (`no-committed-series`, BS-010, BP-015-006).

### Routing Through The Existing Reducer (HC-2)

Closures enter through `run.closures`, the path the reducer's own contract comment documents at
[rlcontracts.js#L1127-L1133](../../rlcontracts.js#L1127). Four verified behaviours of that block
([rlcontracts.js#L1264-L1283](../../rlcontracts.js#L1264)) constrain the resolver:

| Verified reducer behaviour | Line | Resolver obligation |
|---|---|---|
| `run.closures` must be an array, else `recommendation-closures-invalid` | [#L1265](../../rlcontracts.js#L1265) | Always pass an array, empty when nothing is due |
| Closures are sorted by `originRecommendationKey` before processing | [#L1266](../../rlcontracts.js#L1266) | Ordering is the reducer's job; the resolver must not depend on its own input order |
| `!CLOSE_EVENT_TYPES[closure.eventType]` → `recommendation-closure-type-invalid` | [#L1273](../../rlcontracts.js#L1273) | The 015 mapping table above is the only source of `eventType`; a local extension is **`RTR-CLOSURE-VOCAB`** |
| `presentKeys[key]` → `recommendation-closure-still-active` | [#L1276](../../rlcontracts.js#L1276) | **A key re-proposed in the same run cannot be closed in that run.** The resolver therefore calls the reducer with `current: []` — it is a closing pass, never a proposing pass |

The reducer re-emits the claim's **original frozen terms** on the closure event
([#L1277](../../rlcontracts.js#L1277) passes `closureEntry.terms`), which is HC-6 holding at the lifecycle
layer as well as at the claim layer.

#### The key-space bridge (a real gap, named rather than papered over)

The reducer keys entries by `originRecommendationKey` — `fingerprint("origin-recommendation-key", { originToolId, thesisFamily, subjects, actionFamily, horizon })`
([rlcontracts.js#L1034-L1041](../../rlcontracts.js#L1034)). The ledger rows carry the **publisher** key,
`stableSha({ contractVersion: 'brief-distributed-reckey/v1', subject, family })`
([scripts/brief-distributed-publish.mjs#L405](../../scripts/brief-distributed-publish.mjs#L405)), which D1
binds to. **These are different hashes over different term sets, and the live publisher never calls the reducer,
so no `recommendation-index/v1` exists today.**

The resolver therefore constructs the reduction state itself, and the bridge is **derived, never authored** —
`originRecommendationKey` is computed by calling `deriveRecommendationKeys` on terms reconstructed from the
claim, exactly as the foundation intends ("Authors never own identity", [#L1031](../../rlcontracts.js#L1031)).
The derived key is recorded in the 015-owned resolution object as `lifecycleBinding.originRecommendationKey`.
It is **not** added to D1's `claimHash` term list, so D1 stays frozen and byte-stable.

This bridge needs `originToolId` and `thesisFamily`. **Both are now resolved in D1, and neither is invented
here.**

- **`originToolId`** is a constant for this pipeline: every ledger row originates from the Market Action
  Center, whose registry id is `market-brief` (**verified**: `tools.json` → the sole tool with
  `experience.kind === "market-action-center"` has `id: "market-brief"`). It is a fixed literal in the
  resolver, not a per-claim field, and the validator asserts it against the registry rather than hard-coding a
  second copy of the string.
- **`thesisFamily`** is an **authored, hashed** field of the claim (D1). It is not derived from `actionFamily`,
  because that collapse would merge distinct theses onto one reducer entry and silently shrink the denominator
  — the full argument is in D1 § "`thesisFamily` Has No Live Source". When it is absent the claim mints
  `not-evaluable` (`no-authored-thesis-family`) and **no** closure event is emitted, so the reducer is never
  called with a fabricated key.

What remains for planning is narrower than the original finding: `thesisFamily` is a new authored field on a
Feature 002 surface, so the **consent gate** — not the derivation — is the open item. It is carried as
**F-015-D4-01 (reduced)** in D11 alongside D2's identical consent shape.

### Idempotence (FR-006 / BP-015-005 / BS-009 / AC-003)

The obvious mechanism — dedupe by event hash — **does not work here, and the code says so.**
`lifecycleEventId` hashes `runId` along with the event terms
([rlcontracts.js#L1103-L1111](../../rlcontracts.js#L1103)), so the same closure emitted on Tuesday and again on
Wednesday produces two *different* `eventId`s. The reducer's `seenEvent` dedup
([#L1298-L1305](../../rlcontracts.js#L1298)) is **within-run only**. And the closure block checks for an absent
entry and a still-active entry but **does not check whether the entry is already closed** — verified by reading
[#L1273-L1281](../../rlcontracts.js#L1273). Left to itself, a second resolver pass would append a second,
differently-identified closure to an already-closed claim.

Idempotence is therefore enforced **upstream of the reducer, by state**, in three layers:

1. **The due-set gate is the mechanism.** `due()` admits only `entry.state === "active"`. The reducer sets
   `state = "closed"` on closure ([#L1280](../../rlcontracts.js#L1280)), so a resolved claim can never re-enter
   the due set. On a second pass over an unchanged ledger, `run.closures` is empty and **zero events are
   emitted**. This is not a check bolted on afterwards; it is the same predicate that selects the work.
2. **The oracle is `indexFingerprint`.** The reducer computes
   `fingerprint("recommendation-index", { contractVersion, entries })`
   ([#L1313-L1316](../../rlcontracts.js#L1313)) — over the entries **only**, excluding `runId` and
   `canonicalMonth`. Two passes over identical inputs must therefore produce a **byte-identical**
   `indexFingerprint`. That is the machine-checkable assertion BP-015-005 needs, and it costs nothing to compute
   because the reducer already returns it.
3. **Content-addressed resolution objects are the backstop.** Each resolution is written to
   `briefs/objects/resolutions/<resolutionHash-hex>.json`, mirroring the existing content-addressed layout
   (`briefs/objects/evidence/bundles/<hex>.json`, `briefs/objects/reads/<toolId>/<hex>.json` — both verified on
   disk). Re-resolving an unchanged claim recomputes the identical hash and writes identical bytes. A write that
   would change the bytes at an existing path aborts with **`RTR-RESOLUTION-CONFLICT`** and never overwrites.

```
resolutionHash = stableSha({
  contractVersion: "brief-recommendation-resolution/v1",
  claimHash, resolutionDate, closureEventType, outcomeClass, outcomeValue, reasonCode, provenance
})
```

`runId` and wall-clock timestamps are **excluded** from `resolutionHash`, for the same reason D1 excludes them
from `claimHash`: identity is content, provenance is metadata.

### `not-evaluable` Is Honest, Not Silent (BP-015-006)

Every `not-evaluable` closure carries a machine-readable `reasonCode` from a closed set —
`no-committed-series`, `no-committed-reference`, `non-semantic-subject` (D1's positional-fallback guard),
`no-authored-subject`, `no-authored-horizon`, `no-authored-thesis-family`, `no-authored-predicate` (D1's four
authored-claim-input absences), `neutral-direction-no-magnitude`, `zero-observed-session`,
`calendar-coverage-exhausted` — plus a human-readable sentence rendered in the Power ledger. The claim is
excluded from rate denominators (D5) and **remains visibly counted** in the coverage line. RL-005 predicts this
class will be large for hedge and options structures; the live payload confirms it — action 4
("Carry the small defined-risk hedge…") names no instrument at all and resolves `no-authored-subject` even once
the claim input block ships. The design's answer is to make that visible, not to shrink it.

**Until the authored claim input block ships, the honest reason code for every live action is
`no-authored-thesis-family`** (evaluated first, since it blocks the reducer route entirely). The coverage line
will therefore read 5-of-5 not-evaluable on the current payload. That is the correct rendering of a loop whose
authoring half has not yet landed — not a defect to be tuned away.

### Closed Error Codes (FR-020)

015 owns the `RTR-*` namespace. These are refusals of the resolver and its validator, distinct from the
002-owned `recommendation-*` reducer failures and the 007-owned `RLV-*` primitive failures, neither of which 015
may emit.

| Code | Fires when | Guards |
|---|---|---|
| `RTR-LOOKAHEAD` | An observation dated after `horizon.resolutionDate` is consulted | HC-5, FR-003, AC-004 |
| `RTR-SESSION-PREDICATE` | The trading-session test is keyed on `dateState` rather than `regular !== null`, or the derived 2026 session count is not 251 | HC-5, HC-10, FR-003 |
| `RTR-PREDICATE-AMEND` | A write would change a frozen claim's predicate/horizon/magnitude | HC-6, FR-022, AC-010 |
| `RTR-RESOLUTION-CONFLICT` | A content-addressed write would change existing bytes | FR-006, BP-015-005 |
| `RTR-CLOSURE-VOCAB` | A closure event outside `CLOSE_EVENT_TYPES` is constructed | HC-2, FR-004 |
| `RTR-FLAT-ZERO` | A bare `0` reaches the array passed to `rlvSummarizeOutcomes` | HC-7, FR-005 |
| `RTR-CALENDAR-COVERAGE` | A resolution date falls outside the committed calendar window | HC-5, HC-10 |
| `RTR-NETWORK` | Network or provider-credential surface is reachable from the resolver | HC-10, FR-007 |

---

## D5 — Cohort And Scoring Model

### Purpose

Satisfies **FR-008 / FR-009 / FR-010 / FR-011**, **HC-1 / HC-4 / HC-8**, **P7 / P8 / P9**,
**BP-015-003 / BP-015-004**, and **BS-005 / BS-006 / BS-011**. Turns resolved outcomes into the track record
without introducing a single new statistic.

### Declared Constants (resolving UXQ-1 and UXQ-2)

Both were flagged by `bubbles.ux` as undeclared and blocking. They are declared here, once, as module constants —
never as literals at a call site.

| Constant | Value | Why |
|---|---|---|
| `Z_SCORE` | `1.96` | `rlvWilsonInterval` takes `zScore` as a **required** argument and fails `RLV-WILSON-Z` on a non-positive value ([rlvalidation.js#L112-L113](../../rlvalidation.js#L112)). Every wireframe says "95% range"; `1.96` is that. It is a fixed constant, not a lever — a level selector would let a reader narrow the range by choosing a weaker guarantee. |
| `MIN_COHORT_RESOLVED` | `20` | The insufficient-state copy renders a countdown ("17 to go") that cannot be written without a target. `20` is the figure the wireframes already use illustratively; adopting it makes the rendered countdown true rather than decorative. |
| `ANNUALIZATION` | `252` | `rlvDeflatedSharpe` requires a positive finite `annualization` ([rlvalidation.js#L89](../../rlvalidation.js#L89)). Outcomes are session-scale; 252 regular sessions is the matching period count. |

### Cohort Definition (P7)

A cohort is a **conjunction of five closed levers** over the resolved set. The lever set is closed: a lever may
only change *which resolved claims are in the cohort*, never what counts as a win.

| Lever | Control id | Domain | Source of the value |
|---|---|---|---|
| Scope | `select#leverCohort` | `all` \| one owning tool | `claim.originToolId` via the resolution object's `lifecycleBinding` |
| Stated confidence | `select#leverBucket` | `all` \| each declared bucket | the claim's `statedConfidence` (UXQ-6 naming) |
| Horizon | `select#leverHorizon` | `all` \| `intraday` \| `next-session` \| `multi-session` \| `event-bound` | `claim.horizon.kind` (P4) |
| Claim family | `select#leverFamily` | `all` \| each family present | `claim.thesisFamily` |
| Evaluation window | `select#leverWindow` | since record start \| trailing 30 \| trailing 90 sessions | resolution date, counted in `regular` calendar sessions |

**A cohort is never silently mixed (P7).** Every rendered rate carries its cohort label and its sample count in
the same block; a rate rendered without both is **`RTR-COHORT-MIX`**.

> **Finding F-015-D5-01 (routed to `bubbles.plan`).** P7 names the cohort levers as *"all claims, or claims
> sharing a confidence bucket, **action type**, horizon, or owning tool"*, while the spec's Interaction And
> Steering Model declares five levers in which **claim family** appears and **action type** does not. The two
> lists are not the same set. This design adopts the Interaction model's five, because those carry the DOM ids
> the UI Scenario Matrix asserts against (UI-06, UI-07, UI-31). Whether `actionFamily`
> ([rlcontracts.js#L708](../../rlcontracts.js#L708) — `hold`, `trim`, `add`, `hedge`, `rotate`) becomes a sixth
> lever is a scoping decision, not a design inference, and is not guessed at here.

### Exact Mapping To `RLVALID` (HC-1 — consume only)

For a cohort, in this order. Every step names its sole owner.

**Step 1 — build the directional array (015-owned routing, no statistic).**

```
directional = [ r.outcomeValue
                for r in cohort
                if r.outcomeClass ∈ { "win", "loss" } ]
              sorted by (resolutionDate, claimHash)      ← deterministic order
resolvedDirectional = directional.length
```

Per D3 this array is finite and strictly non-zero by construction. Selecting and ordering elements is
**routing**, not estimation — no number is computed here.

**Step 2 — branch before calling anything.** Both primitives refuse an empty input
(`RLV-OUTCOME-VALUES` at [rlvalidation.js#L135](../../rlvalidation.js#L135); `total < 1` →
`RLV-WILSON-COUNTS` at [#L113](../../rlvalidation.js#L113)). The empty branch is taken *before* any primitive
call — the honest empty state is structurally forced by the primitives' own guards, not chosen.

**Step 3 — call the primitives.**

| Call | Yields | Rendered as |
|---|---|---|
| `rlvSummarizeOutcomes(directional)` [#L134](../../rlvalidation.js#L134) | `wins`, `losses`, `winRate`, `averageWin`, `averageLoss`, `mean`, `quantiles` | win/loss counts, "Average win", "Average loss", "Expected value per call" (= `mean`), quartile line |
| `rlvWilsonInterval(summary.wins, resolvedDirectional, Z_SCORE)` [#L112](../../rlvalidation.js#L112) | `proportion`, `lower`, `upper` | the **range** (dominant element) with the point estimate inside it |
| `rlvQuantiles(values, probabilities)` [#L122](../../rlvalidation.js#L122) | arbitrary-probability quantiles | only if a probability outside `[0.25, 0.5, 0.75]` is ever displayed |
| `rlvDeflatedSharpe(curve, trialCount, ANNUALIZATION)` [#L87](../../rlvalidation.js#L87) | `psr`, `dsr`, `srAnn`, `nTrials`, `n` | the multiplicity panel's raw and discounted figures |

Three precise consequences of reading the primitive source:

- **`rlvSummarizeOutcomes` already calls `rlvQuantiles` internally** at `[0.25, 0.5, 0.75]` and returns the
  result as `quantiles` ([rlvalidation.js#L150-L151](../../rlvalidation.js#L150)). The p25 / median / p75 line
  in the Power distribution panel therefore requires **no** separate `rlvQuantiles` call. Making one would be
  redundant, not wrong — but the redundancy is exactly where a second, subtly-different number gets born.
- **`summary.winRate` and `interval.proportion` are the same quantity** — `wins / total` at
  [#L147](../../rlvalidation.js#L147) and `wins / total` at [#L116](../../rlvalidation.js#L116). The renderer
  reads the point estimate from **`interval.proportion` only**, so the point and the range provably come from
  one call and cannot drift apart across a refactor.
- **The distribution histogram is counting, not estimating.** The wireframe's buckets
  (`≤−3%, −2%, −1%, flat, +1%, +2%, +3%, >+3%`) are declared bin edges. Tallying members into declared bins is
  not a statistic and needs no primitive; the `flat` column is populated from `outcomeClass === "resolved-flat"`,
  which is the whole reason D3's sentinel exists.

**Where BH / Holm apply: nowhere, and that is the design decision.**
`rlvAdjustBenjaminiHochberg` ([#L63](../../rlvalidation.js#L63)) and `rlvAdjustHolm`
([#L76](../../rlvalidation.js#L76)) both take a **vector of p-values** and fail `RLV-BH-PVALUES` /
`RLV-HOLM-PVALUES` on anything else. 015 produces no p-values. Manufacturing one per cohort — from a binomial
test, say — would be **inventing an estimator**, a direct HC-1 / BP-015-004 violation, and it would arrive
dressed as a correction for overfitting. The multiplicity discount is carried by `rlvDeflatedSharpe` alone.
`rlvBuildPurgedFolds` ([#L45](../../rlvalidation.js#L45)) is likewise **not used**: 015 fits and selects
nothing, so there is no train/test boundary to purge or embargo. Two of the seven primitives being unused is a
correct outcome; wiring them in to look thorough would be the failure.

**Deflated-Sharpe input construction and its guards.** The primitive requires an `equityCurve` of **at least 20
finite, strictly positive** observations yielding **at least 8** returns, and an integer `trialCount ≥ 1`
([#L88-L94](../../rlvalidation.js#L88)). The curve is built as a cumulative product over the cohort's outcomes
ordered by resolution date:

```
curve[0] = 1 ;  curve[i] = curve[i−1] × (1 + directional[i−1] / 100)
```

The panel renders `—` with a stated reason, and the primitive is **not called**, when
`resolvedDirectional < 20` or any `1 + outcome/100 ≤ 0`. Per **RL-007**, both figures are labelled *directional
evidence of overfitting, not a significance test*, with the stated reason that recommendation outcomes are not
an equity curve.

### The Denominator Contract

D3 established that `winRate` divides by the fed array's length
([rlvalidation.js#L147](../../rlvalidation.js#L147)), so the fed array's composition **is** the published
denominator. D5 fixes that composition and resolves **UXQ-3**:

```
denominator = resolvedDirectional = |{ outcomeClass ∈ { win, loss } }|
```

**The denominator is defined by `outcomeClass`, not by closure event — and the distinction is not cosmetic.**
The analyst's illustrative wireframe reads *"Rate denominator = satisfied + invalidated (42)"*, but D4 established
that a `resolved-flat` outcome also closes `satisfied` or `invalidated`. Defining the denominator by closure
event would therefore pull flat outcomes back into the rate and silently undo HC-7. The denominator note the UI
must render (UI-15) accordingly names **outcome classes**, not closure events.

| Class | In the rate denominator? | Counted and visible? |
|---|---|---|
| `win`, `loss` | **Yes** | Yes |
| `resolved-flat` | No | Yes — its own column and its own ledger label |
| `unresolved` (incl. `expired`) | No | Yes |
| `not-evaluable` | No | Yes, with its reason (BP-015-006) |
| `withdrawn` | No | Yes, with arithmetic bounds (below) |
| `unresolvable-legacy` | No | Yes, permanently (HC-4) |
| open (unresolved horizon) | No | Yes, in the coverage line |

**Excluded is not the same as hidden.** The partition is asserted, not asserted-to:

```
resolvedDirectional + flat + unresolved + notEvaluable + withdrawn + open + unresolvableLegacy
    === totalProposed
```

A failure of this identity means a claim fell out of the accounting, which is precisely how a denominator gets
quietly flattered. It is a committed assertion, not a comment.

**Withdrawal bounds (resolving UXQ-5, RL-008).** Both extremes route through the **same** primitive with
different counts — no new estimator:

```
pessimistic = rlvWilsonInterval(wins,             resolvedDirectional + withdrawn, Z_SCORE).proportion
optimistic  = rlvWilsonInterval(wins + withdrawn, resolvedDirectional + withdrawn, Z_SCORE).proportion
```

Both satisfy the primitive's integer-count guard (`wins ≤ total`, `total ≥ 1`,
[#L113](../../rlvalidation.js#L113)). They are rendered as **static labelled bounds** — never as a lever, never
promoted into the headline (UI-16, UI-17).

### Sufficiency Branch (HC-8, BP-015-003, FR-009, FR-010)

| `resolvedDirectional` | State | Rendered |
|---|---|---|
| `0` | `empty` | "No resolved calls yet", open pipeline, coverage line. **No primitive is called.** No rate, no range. |
| `1 … 19` | `insufficient` | "Not enough data yet", observed wins over total, **the range is still drawn** (wider, visibly so), countdown to `MIN_COHORT_RESOLVED`. **No rate is claimed.** |
| `≥ 20` | `sufficient` | Range as the dominant element with the point estimate inside it, sample count, range width. |

Suppressing the range in the `insufficient` state would teach a reader that a missing range means "not
applicable" rather than "very uncertain" — the opposite of the intended lesson. A rate rendered without both its
range and its count, in any state, is **`RTR-RATE-BARE`**.

### Multiplicity Context (P8, BS-011, RL-007)

| Quantity | Source | Verified today |
|---|---|---|
| `familyCount` | distinct `recommendationKey` values among all proposed rows in the evaluation window | **83** |
| `trialCount` | `familyCount` — the size of the selection surface | **83** |
| resolved trials | `resolvedDirectional` — displayed beside, never substituted | 0 (no closures exist yet) |

`trialCount` is the **selection surface**, not the resolved count. Feeding `rlvDeflatedSharpe` the number of
resolved trials instead of the number of families tried would understate the discount — which is the direction of
error that flatters the record. Both numbers are displayed and labelled so the choice is inspectable.

The session cohort-view counter (UI-23) counts distinct lever combinations viewed in the current session. It is
deliberately **not persisted** and blocks nothing; it exists so the count of "looks taken" is in front of the
reader while they read a number they arrived at by looking several times.

### HC-4 — The Permanent Unresolvable-Legacy Count

> **Finding F-015-D5-02 (routed to `bubbles.plan`) — the legacy count is a moving target and must not be
> hardcoded.** The spec states 160 rows / 78 keys / 32 runs. Re-counted from
> `briefs/history/recommendations/2026-07.jsonl` during this design run: **165 rows, 83 distinct
> `recommendationKey` values, 33 distinct `runId` values, `eventType` distribution `{proposed: 165}`,
> `contractVersion` distribution `{brief-recommendation-history-row/v1: 165}`.** The publisher appends on every
> window, so the figure grows roughly five rows per run until the claim contract activates. **`160` is a
> snapshot, not a constant**, and shipping it as a literal would put a stale number on a surface whose entire
> purpose is not putting stale numbers on surfaces.

The count is therefore **derived** and **asserted**, never authored:

- **Derived:** `unresolvableLegacy = |{ ledger rows with no claimRef }|`. This is self-describing — a legacy row
  is exactly a row written before D2's `v2`, and absence of `claimRef` *is* the marker (D2, BP-015-002).
- **Asserted:** at contract activation the resolver writes one committed object,
  `briefs/history/record-start.json`, carrying
  `{ recordStartDate, unresolvableLegacyRowCount, unresolvableLegacyKeyCount, lastLegacyEventId }`. It is
  written **once** and never updated.
- **Guarded:** after activation the derived count must equal the asserted count. Growth means the publisher
  emitted a claimless row after the contract went live — a regression that would silently expand the
  unscoreable bucket — and it refuses with **`RTR-LEGACY-GROWTH`**.

`recordStartDate` is the date the claim contract activated. It is displayed in **every** state, including
`empty` and `insufficient`, with no dismiss control (UI-12, UI-13). No cohort lever can alter it, because no
selection over resolved claims can change how many unresolved-by-construction rows exist.

---

## D6 — Owner Read And Center Consumption

### Purpose

Satisfies **FR-014 / FR-018 / FR-019 / FR-021**, **HC-3**, **AC-011 / AC-012 / AC-016**, and **UI-35**. Gets the
track record in front of a Center reader **without adding a Center view**.

### The `rl-tool-read/v1` Owner Read

`RLDATA.putToolRead(id, obj)` ([rldata.js#L433](../../rldata.js#L433), exported at
[#L624](../../rldata.js#L624)) validates the `rl-tool-read/v1` branch against an **exact nine-key set**
([#L437](../../rldata.js#L437)):

```
["asOf", "availability", "computedAt", "contractVersion", "deepLink", "freshUntil", "id", "metrics", "read"]
```

| Field | 015 value | Validator constraint |
|---|---|---|
| `contractVersion` | `"rl-tool-read/v1"` | selects this branch, [#L436](../../rldata.js#L436) |
| `id` | `"recommendation-track-record-lab"` | must equal the `id` argument, [#L437](../../rldata.js#L437) |
| `availability` | `current` \| `stale` \| `unavailable` | closed enum, [#L439](../../rldata.js#L439) |
| `asOf` | latest resolution date, ISO; `null` when zero resolved | `null` or parseable, [#L440](../../rldata.js#L440) |
| `computedAt` | ISO instant of the scorer run | required, parseable, [#L441](../../rldata.js#L441) |
| `freshUntil` | next due resolution date, ISO; `null` when none | `null` or parseable, [#L442](../../rldata.js#L442) |
| `read` | the honesty-carrying sentence — see below | non-empty string, [#L443](../../rldata.js#L443) |
| `metrics` | plain object, machine-readable mirror | object, non-array, [#L443](../../rldata.js#L443) |
| `deepLink` | `"recommendation-track-record-lab.html"` | non-empty string, [#L443](../../rldata.js#L443) |

**Resolving UXQ-4 — zero resolved outcomes maps to `availability: "current"`.** A track record with no closures
is *computed and correct*; it is early, not broken. Reporting it `unavailable` would tell the Center the tool has
failed while it is working exactly as designed — and would additionally force `asOf` and `freshUntil` to `null`
([#L444](../../rldata.js#L444)), discarding the "first resolves on …" date the honest empty state needs.
`unavailable` is reserved for the one case that earns it: the committed ledger could not be read at all.

**A rejected read fails silently, so it must be checked.** Every failing branch of the validator
`return null` — a wrong key set, a bad enum, a non-object `metrics`. The tool must test the return value of
`putToolRead` and, on `null`, report `error` to the shared status control rather than assuming publication
succeeded. A silent `null` that nobody checks is how a tool comes to believe it is publishing when it is not.

#### The `read` string carries the HC-8 obligation — this is the load-bearing finding

The Center's renderer, `RLBRIEF.renderToolReads` ([rlbrief.js#L683](../../rlbrief.js#L683)), consumes **only
three fields** of the read — verified line by line:

| Line | Behaviour |
|---|---|
| [#L688](../../rlbrief.js#L688) | skips `tool.id === "market-brief"` |
| [#L689](../../rlbrief.js#L689) | `localReads[tool.id] \|\| snapshotReads[tool.id]` — browser cache wins over snapshot |
| [#L690](../../rlbrief.js#L690) | a read is `available` **only if `read.read` is truthy** |
| [#L694](../../rlbrief.js#L694) | `href = value.deepLink \|\| tool.file` |
| [#L695](../../rlbrief.js#L695) | `value.asOf` → relative age, else `"as-of unknown"` |
| [#L696](../../rlbrief.js#L696) | renders `esc(value.read)` inside a `data-tkr-auto` row |

**`metrics` is never rendered by the Center.** Therefore, on the Center surface, HC-8 can only be satisfied if
the rate, its range, and its sample count are all present **inside the `read` string itself**. Publishing a bare
rate in `read` and the range in `metrics` would satisfy the contract validator and violate the Outcome Contract
— the Center reader would see a naked percentage. The `read` string is generated from a fixed template per
sufficiency state, and a `read` containing a percentage without an adjacent range and count is
**`RTR-RATE-BARE`**:

| State | `read` template |
|---|---|
| `sufficient` | `Directional hit rate {p}% (range {lo}–{hi}%, n = {n}). {legacy} pre-contract calls are unscoreable. Measurement only — not advice.` |
| `insufficient` | `Not enough data yet — {n} resolved calls, range {lo}–{hi}%. No rate claimed. {legacy} pre-contract calls are unscoreable. Measurement only — not advice.` |
| `empty` | `No resolved calls yet — {open} open, first resolves {date}. Record begins {recordStart}. {legacy} pre-contract calls are unscoreable. Measurement only — not advice.` |

Two properties fall out of the renderer for free: `esc()` at [#L696](../../rlbrief.js#L696) means the string is
plain text with no markup surface, and `data-tkr-auto` on the row means any ticker inside it is auto-linked by
`rlticker.js`, satisfying **FR-015** on the Center surface with no change to Center code.

**`metrics` is the machine-readable mirror, never the sole carrier of an obligation.** Per **UXQ-6**, the word
`confidence` is reserved for a claim's *stated* number and never used for the interval:

```jsonc
{
  "resolvedDirectional": 0, "wins": 0, "losses": 0,
  "pointEstimate": null, "rangeLow": null, "rangeHigh": null, "zScore": 1.96,
  "sufficiency": "empty", "minCohortResolved": 20,
  "flatCount": 0, "unresolvedCount": 0, "notEvaluableCount": 0,
  "withdrawnCount": 0, "openCount": 7,
  "unresolvableLegacyCount": 165, "recordStartDate": "2026-08-04",
  "familyCount": 83, "trialCount": 83,
  "statedConfidenceBuckets": []
}
```

### Center Consumption — No Fifth View (HC-3, FR-021)

The path is entirely existing code:

```
015 tool  ──RLDATA.putToolRead()──▶  rlData.toolReads["recommendation-track-record-lab"]
                                              │
market-brief.html#L815  localToolReads() ─────┘   (→ RLDATA.toolRead(), rldata.js#L624)
market-brief.html#L827  RLBRIEF.renderToolReads(el("toolReads"), TOOLS.tools, SNAP.toolReads, localToolReads())
market-brief.html#L715  <div class="body" id="toolReads">      ← inside the EXISTING Brief view
```

**Registration is a hard prerequisite for FR-018, not bookkeeping.** `renderToolReads` iterates the `tools`
argument — `TOOLS.tools` from `tools.json` ([market-brief.html#L827](../../market-brief.html#L827)) — and looks
the read up **by tool id** ([rlbrief.js#L689](../../rlbrief.js#L689)). A read whose tool is absent from
`tools.json` is never looked up: it lands in neither `available` nor `missing` and is **invisible**. FR-019
registration is therefore what makes FR-018 function at all, which fixes the scope ordering: register before
publishing, or the publish is a no-op nobody notices.

**HC-3 holds by non-participation.** `CENTER_VIEW_IDS` is frozen at
[rlmarketaction.js#L77](../../rlmarketaction.js#L77) as `["brief", "portfolio", "red-alert", "journey"]`, and
`RLMKT-VIEW` (registered in the closed code list at [#L97](../../rlmarketaction.js#L97)) refuses a fifth at five
separate checkpoints — `activeView` [#L589](../../rlmarketaction.js#L589), `viewOrder` length
[#L626](../../rlmarketaction.js#L626), `viewOrder` element order [#L629](../../rlmarketaction.js#L629), `views`
key set [#L634](../../rlmarketaction.js#L634), and `viewState.activeView`
[#L637](../../rlmarketaction.js#L637). 015 writes **no** Center state, declares **no** view id, and touches
**none** of `viewOrder` / `views` / `viewState`. It publishes a tool read like every other source tool, and the
Brief view renders it. `RLMKT-VIEW` is never reached because 015 never approaches it (UI-35, AC-011).

**015 does not enter the Tier-A recommendation stream.** The committed object store already holds per-tool owner
reads at `briefs/objects/reads/<toolId>/<hex>.json` (**verified: 260 objects across 22 tool directories**), but
those are `tool-model-read/v1` — a richer contract validated by `validateToolModelRead`
([rldata.js#L378](../../rldata.js#L378)) that carries `recommendationEligibility`
([#L422](../../rldata.js#L422)). A track record is a **measurement**, and a measurement surface that could
declare itself an eligible recommendation source would be emitting exactly the advice HC-9 forbids. 015
publishes the compact `rl-tool-read/v1` per FR-018 and stays out of the eligibility path entirely.

### Shared-Shell Load Order (FR-014)

FR-014 requires `rldata.js` → `rlapp.js` → `rlnav.js`. The Center itself demonstrates the pattern at
[market-brief.html#L873](../../market-brief.html#L873) / [#L878](../../market-brief.html#L878) /
[#L879](../../market-brief.html#L879). The 015 page order (all `defer`, so execution order is document order):

```html
<script src="rlg.js" defer></script>          <!-- glossary: "what it is" half of FR-016 -->
<script src="rldata.js" defer></script>       <!-- FR-014: first -->
<script src="rlvalidation.js" defer></script> <!-- RLVALID; dependency-free, must precede the model -->
<script src="rlticker.js" defer></script>     <!-- FR-015 -->
<script src="rlchart.js" defer></script>      <!-- FR-017 -->
<script src="rlapp.js" defer></script>        <!-- FR-014: after rldata.js -->
<script src="rlnav.js" defer></script>        <!-- FR-014: last -->
```

`rlvalidation.js` is placed after `rldata.js` and before the inline model because it is self-contained and
freezes its own export surface — it has no ordering dependency of its own, but the model has one on it.

**Status reporting.** Every resource reports through `RLAPP.report(resource, state, detail)`
([rlapp.js#L73](../../rlapp.js#L73)) using the shell's existing state vocabulary — `fresh`, `stale`,
`refreshing`, `error`, `missing` (verified at [rlapp.js#L48-L49](../../rlapp.js#L48) and in the state-dot CSS at
[#L101](../../rlapp.js#L101)). Reported resources: `ledger:recommendations`, `claims`, `resolutions`, and
`bars:<SYM>` for each series a rendered cohort depends on. **A cached read reports `stale`, never `fresh`**
(UI-30). A `putToolRead` returning `null` reports `error`.

### Registration Surface (FR-019, AC-016)

Registration is **not** four files. `scripts/validate-tool-experience.mjs` treats the tool registry, the
simple-model registry and the journey registry as one packet and cross-asserts them
([#L60-L92](../../scripts/validate-tool-experience.mjs#L60)), so a partial registration fails the build rather
than shipping a half-registered tool. The complete surface, **verified this run**:

| # | Surface | Entry | Verified shape / current count |
|---|---|---|---|
| 1 | `tools.json` | `tools[]` element | `{ id, title, nav, file, notes, data, status, updated, blurb, tags, briefing, experience }` — **23 tools today** (1 `market-action-center` + 22 `ordinary`) |
| 2 | `tools.json` → `experience` | `tool-experience/v1` block | `{ contractVersion, kind, viewSetId, viewIds, simpleModelDefinitionId, simpleAdapterId, simpleAdapterModule, powerAdapterId, briefPolicyId, journeyDefinitionIds, contextPolicyId, matrixDomains, publicAliases }` — for 015: `kind: "ordinary"`, `viewSetId: "ordinary-four-view/v1"`, `viewIds: ["simple","power","brief","journey"]` |
| 3 | `tools.json` → `briefing` | briefing policy block | `{ role, profile, readAdapter, readContractVersion, freshnessPolicy, recommendationPolicy, budgetPolicy }` — 015 is `role: "source"`, feeding D6's owner read |
| 4 | `simple-models.json` | `definitions[]` element | **23 definitions today, exactly one per tool.** `{ contractVersion, definitionId, modelId, modelVersion, toolId, researchQuestion, parameterDefinitions, inputRequirements, resultSchemaId, scenarioDefinitions, seedPolicy, sensitivityPolicy, calibrationPolicy, performancePolicy, provenancePolicy, deepLinkTargets, limitations, adapterId, adapterModule, definitionFingerprint } |
| 5 | `journeys.json` | `definitions[]` + `steps[]` | **48 definitions / 48 steps today.** Definition is `journey-definition/v1`: `{ contractVersion, definitionId, definitionVersion, toolId, goalId, title, outcomeDescription, mechanism, prerequisiteRules, contextSchema, stepIds, evidencePolicy, backtrackPolicy, staleEvidencePolicy, completionPolicy, packetPolicy, privacyClass, noExecution, accessibility, limitations, definitionFingerprint }` |
| 6 | `index.html` | `TOOLS` array, [#L477](../../index.html#L477) | `{ id, title, icon, accent, file, … }` — **23 entries** |
| 7 | `rlnav.js` | `TOOLS` literal [#L45](../../rlnav.js#L45) **plus** the `TOOLS.push(…)` calls that follow | literal array is **19 entries**; four subsequent `TOOLS.push(…)` blocks add 4 more — **23 total**, matching `tools.json` |
| 8 | `notes/` | `notes/recommendation-track-record-lab.md` | handoff doc, per the repo convention |

#### The four hardcoded count assertions 015 must bump

`validateJourneyRegistryCoverage` drives the real `rljourney.js` runtime against the real registries and then
asserts four **literal** counts ([#L491-L496](../../scripts/validate-tool-experience.mjs#L491)). Adding a 24th
tool breaks all four unless they are updated in the same change:

| Assertion | Line | Today | After 015 | Why |
|---|---|---|---|---|
| `completeness.value.ordinaryTools === 22` | [#L493](../../scripts/validate-tool-experience.mjs#L493) | 22 | **23** | 015 is a 23rd ordinary tool |
| `completeness.value.centerGoals === 4` | [#L494](../../scripts/validate-tool-experience.mjs#L494) | 4 | **4** (unchanged) | 015 is not the Center |
| `completeness.value.totalGoals === 48` | [#L495](../../scripts/validate-tool-experience.mjs#L495) | 48 | **50** | 015 contributes exactly 2 goals |
| `completeness.value.definitionCount === 48` | [#L496](../../scripts/validate-tool-experience.mjs#L496) | 48 | **50** | one definition per goal |

The per-row rule at [#L499-L501](../../scripts/validate-tool-experience.mjs#L499) requires the Center to
reference **exactly four** goals and every ordinary tool **at least two**. The current distribution is
`{ 4: 1, 2: 22 }` (**verified**), so 015 registering the minimum two goals takes `totalGoals` to
`4 + 23×2 = 50`. Registering a third goal would make it 51 — the assertion is a literal, so the count in the
validator and the count in `journeys.json` must be decided together, not discovered at test time.

#### The cross-registry invariants that make partial registration fail

| Invariant | Line | Consequence for 015 |
|---|---|---|
| `sameValues(toolIds, modelToolIds)` — *each registry tool must own exactly one simple-model definition* | [#L145](../../scripts/validate-tool-experience.mjs#L145) | Registering in `tools.json` **without** adding a `simple-models.json` definition fails. This is not optional for 015. |
| `sameValues(journeyDefinitionIds, referencedJourneyIds)` | [#L146](../../scripts/validate-tool-experience.mjs#L146) | Every id in `experience.journeyDefinitionIds` must exist in `journeys.json`, and vice versa — no orphan on either side |
| `sameValues(journeyStepIds, referencedStepIds)` | [#L147](../../scripts/validate-tool-experience.mjs#L147) | Each new definition's `stepIds` must have matching `steps[]` entries |
| `requireUnique(…)` on tool / model / journey / step ids | [#L124-L130](../../scripts/validate-tool-experience.mjs#L124) | 015's ids must not collide |
| `summary.*Count` equality against the registries | [#L138-#L142](../../scripts/validate-tool-experience.mjs#L138) | The production summary is recomputed from the registries, so counts cannot drift |
| `journeysMaxBytes` budget (1 048 576) | [#L100](../../scripts/validate-tool-experience.mjs#L100), `tool-experience.config.json` | Two more definitions plus two steps must stay inside the budget |

Registry paths are not hardcoded in the validator — it reads
`config.registries.simpleModelRegistryPath` and `config.registries.journeyRegistryPath` from
`tool-experience.config.json` ([#L69-L70](../../scripts/validate-tool-experience.mjs#L69)), which resolve to
`simple-models.json` and `journeys.json` (**verified**).

#### Ordering and placement

`rlnav.js` carries the comment *"order mirrors index.html's TOOLS array"*
([rlnav.js#L43](../../rlnav.js#L43)). That mirror is maintained by **appending**: the last four tools were each
added through a `TOOLS.push(…)` call after the literal array rather than by editing it, so 015 follows the same
convention — appended last in `rlnav.js`, appended last in `index.html`. Editing the 19-entry literal would
break the mirror for the four pushed entries.

The `tools.json` `notes` field must point at the `notes/` file, and `data` has no 015 counterpart — the tool's
inputs are committed repository artifacts, not a config file — so it is omitted rather than pointed at a
placeholder. 015's two journey goals must satisfy `noExecution: true` and `mechanism` drawn from the accepted
set; a definition with `noExecution: false` is rejected as `E012-JOURNEY-DEFINITION`
([#L475](../../scripts/validate-tool-experience.mjs#L475)), which is consistent with HC-9 — the track-record
surface measures, it never acts.


### FR-021 — The Persisted Cache Schema Is Not Touched

The `rldata.js` persisted cache schema is **protected by Feature 013** and must not change (AC-012).

| Obligation | How it holds |
|---|---|
| No new top-level cache key | 015 writes only through `putToolRead`, into the **existing** `d.toolReads[id]` slot ([rldata.js#L445](../../rldata.js#L445)) |
| No new field on an existing record | `rl-tool-read/v1` is an existing contract with a **closed** nine-key set ([#L437](../../rldata.js#L437)); adding a field would be rejected by the validator, not merely discouraged |
| No aliasing of cache internals | `putToolRead` deep-copies via `JSON.parse(JSON.stringify(src))` ([#L445](../../rldata.js#L445)) — 015 cannot hold a live reference into the cache |
| Resolver/scorer state stays out of the cache | Claims, resolutions and `record-start.json` are **committed repository artifacts** under `briefs/`, never `localStorage` |
| UI state stays out of the cache | Mode and levers persist under the separate `localStorage` key `rlTrackRecordLab` as `{ mode, cohort, bucket, horizon, family, window }` — not part of `rlData` |
| No derived statistic is persisted anywhere | Rates, ranges, counts and bounds recompute from the ledger on every load, so a stale cache can never surface a number the current ledger does not support |

---

## D7 — UI Component Design

### Purpose

Satisfies **FR-012 / FR-013 / FR-015 / FR-016 / FR-017**, **HC-8 / HC-9**, **NFR Accessibility**,
**NFR Performance**, **AC-013 / AC-014 / AC-015**, and every row of the spec's UI Scenario Matrix
(UI-01 … UI-35). Decomposes `recommendation-track-record-lab.html` into components and pins the DOM contract
the matrix asserts against, so the `e2e-ui` assertions are satisfiable by construction rather than by
retrofit.

### The Single-File Shape And Load Order

One self-contained HTML, no build step, GitHub-Pages deployable (NFR Portability). The script order **amends
D6's list with `rlcontext.js`** — see F-015-D7-02:

```html
<script src="rlcontext.js" defer></script>    <!-- RLCTX.validateContext — hard prerequisite of the structured chart adapter -->
<script src="rlg.js" defer></script>          <!-- glossary: the "what it is" half of FR-016 -->
<script src="rldata.js" defer></script>       <!-- FR-014: first of the required trio -->
<script src="rlvalidation.js" defer></script> <!-- RLVALID; dependency-free, must precede the inline model -->
<script src="rlticker.js" defer></script>     <!-- FR-015 -->
<script src="rlchart.js" defer></script>      <!-- FR-017 -->
<script src="rlapp.js" defer></script>        <!-- FR-014: after rldata.js -->
<script src="rlnav.js" defer></script>        <!-- FR-014: last -->
```

`rlcontext.js` is not optional. `validateStructuredAdapter` returns
`fail("RLCTX validator unavailable", "$.contextFor")` when `root.RLCTX.validateContext` is absent
([rlchart.js#L98](../../rlchart.js#L98)), and it is called **synchronously** inside `attachStructured`
([#L317-L318](../../rlchart.js#L317)). `rlg.js` does lazily load `rlcontext.js`
([rlg.js#L229](../../rlg.js#L229)), but that load is asynchronous and demand-driven — it cannot be relied on to
have completed by the time a chart attaches. The precedent is explicit: the repo's only structured-chart tool
loads `rlcontext.js` at [market-heatmap-lab.html#L412](../../market-heatmap-lab.html#L412), two lines ahead of
`rldata.js` at [#L414](../../market-heatmap-lab.html#L414). FR-014's ordering constraint is on the
`rldata → rlapp → rlnav` trio only, so placing `rlcontext.js` first does not violate it.

### One Compute → Both Views

The controlling invariant of the surface. A **single** `compute()` produces one frozen `scorecard`; three
consumers render it and none of them recomputes anything.

```
  MODEL  (loaded once, then immutable for the session)
    ├── ledgerRows        briefs/history/recommendations/*.jsonl
    ├── claims            briefs/objects/claims/<hex>.json          (D1)
    ├── resolutions       briefs/objects/resolutions/<hex>.json     (D4)
    ├── recordStart       briefs/history/record-start.json          (D5)
    └── bars              rlData bars, per subject actually rendered
                  │
   state ─────────┤   { mode, cohort, bucket, horizon, family, window }
   (localStorage) │
                  ▼
             compute(MODEL, state) ──▶  scorecard   (deep-frozen, single source)
                  │                          │
       ┌──────────┼──────────────────────────┼──────────────────┐
       ▼          ▼                          ▼                  ▼
  renderSimple  renderPower           buildOwnerRead      buildMetrics
  (verdict,     (calibration,         (the `read`         (the machine
   levers,       distribution,         string — D6)        mirror — D6)
   coverage)     multiplicity,
                 raw ledger)
```

**Why this shape and not two pipelines.** D6's finding F-015-D6-01 established that the Center renders only
`read` / `asOf` / `deepLink`, so HC-8 on the Center surface can only be met inside the `read` string. If the
`read` string were assembled from a second traversal of the ledger it could drift from the page — the Center
would quote a rate the tool no longer shows. Deriving `buildOwnerRead(scorecard)` from the **same frozen
object** that produced `#pointEstimate`, `#rangeLow`, `#rangeHigh` and `#sampleCount` makes that class of
disagreement unrepresentable. The owner read is a third rendering, not a second computation.

**The frozen `scorecard`.** Every field is either a count 015 owns or a value returned verbatim by an
`RLVALID` primitive. No field is a locally-derived statistic.

| Field | Type | Source |
|---|---|---|
| `cohortLabel` | string | the five lever values, rendered (P7 — a rate always names its cohort) |
| `sufficiency` | `empty` \| `insufficient` \| `sufficient` | branch on `resolvedDirectional` vs `MIN_COHORT_RESOLVED` (D5) |
| `resolvedDirectional`, `wins`, `losses` | integer | 015 routing — counting, not estimating |
| `summary` | object \| `null` | `rlvSummarizeOutcomes` verbatim ([rlvalidation.js#L134](../../rlvalidation.js#L134)); `null` in the `empty` branch |
| `interval` | object \| `null` | `rlvWilsonInterval(wins, resolvedDirectional, Z_SCORE)` verbatim ([#L112](../../rlvalidation.js#L112)) |
| `distribution` | object \| `null` | `rlvQuantiles` verbatim ([#L122](../../rlvalidation.js#L122)) + 015-owned bucket counts |
| `closureMix` | object | counts per `CLOSE_EVENT_TYPES` member (D4) |
| `withdrawnBounds` | object \| `null` | two `rlvWilsonInterval` calls at both arithmetic extremes (D5, UXQ-5) |
| `coverage` | object | scored / open / expired / withdrawn / not-evaluable / unresolvable-legacy + `recordStartDate` |
| `calibration` | array | one row per **declared** bucket, including zero-count buckets (UI-21) |
| `multiplicity` | object | `familyCount`, `trialCount`, raw and `rlvDeflatedSharpe`-discounted figures (D5) |

`compute()` is pure and synchronous. It performs no I/O, so a lever change costs one function call over data
already in memory — which is what makes UI-06's *"no new network request is recorded"* assertion structurally
true rather than merely observed, and what puts the full-recompute NFR (< 2s) comfortably in reach.

### Component Tree

```
recommendation-track-record-lab.html
│
├── header
│   ├── h1  "Recommendation Track Record"
│   ├── #noAdviceNotice          "A measurement surface. Nothing here is advice."   [UI-33, UI-32]
│   └── #modeSeg                 role="tablist", button[data-mode=simple|power]     [UI-31]
│
├── #levers                      (Simple-visible, Power-visible)
│   ├── select#leverCohort  · select#leverBucket · select#leverHorizon
│   └── select#leverFamily  · select#leverWindow                                    [UI-06, UI-07]
│
├── SIMPLE ─────────────────────────────────────────────────────────────────────
│   ├── #blockRight   "WERE WE RIGHT?"                                             [UI-09]
│   │   ├── #verdictState        headline: rate | "Not enough data yet" | "No resolved calls yet"
│   │   ├── #verdictBody         sufficiency copy                                  [UI-08]
│   │   ├── #rangeBand           the 0–100% axis — the LARGEST element             [UI-02, UI-32]
│   │   │   ├── #rangeLow · #rangeHigh
│   │   │   └── #pointEstimate   a tick INSIDE #rangeBand, never beside it
│   │   ├── #sampleCount         "42 resolved calls · 95% range · width 29 points"
│   │   ├── #precisionRead       "rules out …" / "cannot yet …"                    [UI-04]
│   │   └── #precisionToGo       width-scaling arithmetic + [how?] tooltip         [UI-05]
│   ├── #blockSep                "different question" separator + tooltip          [UI-09, UI-10]
│   ├── #blockPaid    "DID IT PAY?"  → #avgWin · #avgLoss · #expectedValue         [UI-11]
│   ├── #closureMix              per-closure counts + #denominatorNote             [UI-15, UI-19]
│   │   └── #withdrawnBound      two labelled arithmetic extremes, static text     [UI-16, UI-17]
│   └── #openClaims              open-pipeline table (empty state only)            [UI-01]
│
├── POWER  (.panel.pw) ─────────────────────────────────────────────────────────
│   ├── #calibTable              one row per declared bucket, zero rows included   [UI-20, UI-21]
│   ├── #distChart               canvas + table[data-chart-fallback]#distTable     [UI-24, UI-25]
│   ├── #multiplicity            family/trial counts, raw vs discounted            [UI-22]
│   │   └── #cohortsViewed       session-only distinct-lever-combination counter   [UI-23]
│   └── #ledgerTable             claim ref · subject · closure · outcome · dates   [UI-26, UI-34]
│
└── FOOTER (both views, every state) ───────────────────────────────────────────
    └── #coverageLine            counts + record start + #legacyWhy expansion      [UI-12, UI-13, UI-14, UI-18]
```

Power-only panels carry `class="panel pw"` and are hidden by a `body:not(.power) .pw { display:none }` rule —
the same mechanism `applyMode()` drives at
[sector-research-lab.html#L3123](../../sector-research-lab.html#L3123). `#coverageLine` and `#noAdviceNotice`
sit **outside** both view containers, which is how UI-12 ("present in all of: empty, insufficient, sufficient,
Power") and UI-33 hold without per-state duplication.

### The Three Verdict States Are One Branch, Taken Before Any Primitive Runs

Both primitives refuse an empty input — `rlvSummarizeOutcomes` fails `RLV-OUTCOME-VALUES`
([rlvalidation.js#L135](../../rlvalidation.js#L135)) and `rlvWilsonInterval` fails `RLV-WILSON-COUNTS` for
`total < 1` ([#L113](../../rlvalidation.js#L113)). The empty state is therefore **structurally forced**, and
`compute()` takes the branch before requesting a statistic:

| `sufficiency` | Condition | `#verdictState` | Rate rendered? | Range rendered? | Primitives called |
|---|---|---|---|---|---|
| `empty` | `resolvedDirectional === 0` | `No resolved calls yet` | No — zero `[data-rate]` (UI-01) | No | **None** |
| `insufficient` | `1 ≤ n < MIN_COHORT_RESOLVED` | `Not enough data yet` | No — zero `[data-rate]` (UI-07) | **Yes** | both |
| `sufficient` | `n ≥ MIN_COHORT_RESOLVED` | the rate | Yes | Yes | both |

The `insufficient` row is the load-bearing one: the range is **still drawn**, wider. Suppressing it would teach
a reader that a missing range means "not applicable" rather than "very uncertain" — which is the exact
misreading BP-015-003 exists to prevent.

**HC-8 is enforced at the DOM level, not by copy review.** Every rate is emitted by one helper that writes a
`[data-rate]` element only as a sibling of a `[data-range]` and a `[data-n]` in the same block. There is no
second code path that can print a percentage. UI-03 asserts exactly this sibling relationship, and the
validator's `RTR-RATE-BARE` scan (D6) is the same rule applied to the generated `read` string.

### Canvas: The Structured Adapter, Not The Legacy Closure

`RLCHART.attach(canvas, adapterOrHitFn)` ([rlchart.js#L365](../../rlchart.js#L365)) dispatches on argument
type. A **function** routes to `attachLegacy` ([#L351](../../rlchart.js#L351)), which stamps
`data-rlchart-migration-required="true"` on the canvas. An **object** routes to `attachStructured`
([#L317](../../rlchart.js#L317)). 015 passes the object.

`validateStructuredAdapter` ([#L98](../../rlchart.js#L98)) enforces an **exact five-key set** —
`contextFor`, `hitTest`, `orderedPointIds`, `seriesOrder`, `tableTargetFor` — plus three invariants that turn
three separate obligations into one contract:

| Adapter invariant | Requirement it discharges |
|---|---|
| `hitTest` is a function, called per pointer position | **FR-017** — hover hit-testing. This *is* the hit-test closure FR-017 asks for; it is carried on the adapter rather than passed bare. |
| `contextFor(pointId)` must pass `RLCTX.validateContext` ([rlcontext.js#L706](../../rlcontext.js#L706)) — a `contextual-tooltip/v1` object carrying `definition`, `interpretation.text`, `uncertainty`, `limitation` | **FR-016** — "what it is" *and* "what the current reading means", made structural. A context without an interpretation does not validate. |
| `contextFor(pointId).links.sameDataTable` must equal `"#" + tableTargetFor(pointId)`, and the fragment must match `^#[A-Za-z][A-Za-z0-9:._-]*$` ([rlcontext.js#L182](../../rlcontext.js#L182)) | **NFR Accessibility** — the chart-to-table binding is a *contract*, not a convention. A chart point that has no same-data table row cannot attach. |

The distribution chart's `orderedPointIds` are the outcome buckets (`le-3`, `neg-2`, `neg-1`, `flat`, `pos-1`,
`pos-2`, `pos-3`, `gt-3`), which are stable strings satisfying the `^[A-Za-z0-9:._-]+$` point-id rule, and
`tableTargetFor("flat")` returns the id of the **resolved-flat row** in `#distTable`. This is where HC-7
becomes visible to a human: the sentinel exists so that column, and its table row, can exist.

**One convention 015 introduces.** UI-25 asserts `table[data-chart-fallback]`. That attribute has **zero
occurrences anywhere in the repository** — verified this run across `*.html`, `*.js` and `*.mjs`. The repo's
actual mechanism is the id-based `tableTargetFor` binding above. 015 therefore carries **both**: the
`tableTargetFor` id (which the adapter validator enforces) and `data-chart-fallback` on the same `<table>`
(which UI-25 asserts). See F-015-D7-01.

**Draw discipline.** A hidden canvas does not render. Chart draws are guarded by the active mode, redrawn on
`resize`, and `attach()` is called at the **end** of each draw so the adapter closes over the scales and data
just committed to the bitmap.

### Tickers — And Why `rlg.js` Must Be Pre-empted

**FR-015** is satisfied two ways, both already built. Explicit values go through `RLTKR.tag(ticker, opts)`
([rlticker.js#L112](../../rlticker.js#L112), exported [#L122](../../rlticker.js#L122)). Containers that emit
symbols inside prose — the ledger's Subject column, the closure-mix copy — carry `data-tkr-auto`, and
`rlticker.js` bounded-auto-scans them ([#L194](../../rlticker.js#L194), [#L218](../../rlticker.js#L218)) and
re-scans on DOM mutation via its `MutationObserver` ([#L252](../../rlticker.js#L252)). No bare ticker can
survive either path.

**FR-016 and HC-9 are the same lock.** `rlg.js` `scan()` ([#L252](../../rlg.js#L252)) auto-decorates every
element matching `GLOSSARY_SELECTOR` ([#L251](../../rlg.js#L251)) — which includes `th`, `label`,
`.panel label`, `.badge`, `.pill`, `.k`, `.kpi .k` and `.panel h2`, i.e. essentially every label on this
surface. `decorate()` ([#L234](../../rlg.js#L234)) keys on the element's text and writes the glossary
definition into `aria-label` ([#L243](../../rlg.js#L243)).

That is a live hazard here, not a theoretical one:

- 015 renders a `Horizon` lever label. `G["horizon"]` exists at [rlg.js#L63](../../rlg.js#L63) and reads
  *"Your holding timeframe — scalp / intraday vs hold-into-expiration (swing / position). — In context: A
  Simple-cockpit lever — it selects the primary **target** (near vs far) and the resulting **R:R**."* That
  contradicts P4 (horizon is the claim's decision window) and imports trading vocabulary onto a
  measurement-only surface.
- The glossary contains **9 occurrences** of UI-33's forbidden tokens — verified this run at
  [rlg.js#L12](../../rlg.js#L12) (`call` → "right to BUY"), [#L13](../../rlg.js#L13) (`put` → "right to
  SELL"), [#L58](../../rlg.js#L58) (`pin` → "sell strength and buy weakness"), [#L59](../../rlg.js#L59)
  (`waterfall` → "sell into weakness"), [#L65](../../rlg.js#L65) (`net delta` → "buy/sell-pressure proxy") and
  the alias keys at [#L98](../../rlg.js#L98). The other five shared-shell modules are clean: `rlticker.js`,
  `rlchart.js`, `rlcontext.js`, `rlapp.js` and `rlnav.js` each contain **zero** occurrences.

**The escape hatch is already in the code and is exactly FR-016.** `decorate()` returns early at
[rlg.js#L241](../../rlg.js#L241): `if (elm.getAttribute("title")) return;`. An element that already carries a
`title` is never claimed. So if 015 satisfies FR-016 **exhaustively** — an explicit contextual `title` on every
`label`, `th`, `.badge`, `.pill`, `.k` and `.panel h2` — then `rlg.js` cannot decorate anything on the page,
and the collision is structurally impossible. FR-016 compliance is not adjacent to HC-9 here; it is the
mechanism that delivers it. The inverse is the residual risk and is what the validator scans for: *any element
matching `GLOSSARY_SELECTOR` without a `title` is an element the shared glossary may claim* → `RTR-ACTION-EMITTED`
(D8).

Note the direction of the leak: `decorate()` writes `aria-label`, not visible text. UI-33's assertion reads
page *text* and would not catch it, though a screen-reader user would hear it. See F-015-D7-04.

### Auto-Hydration (FR-013) And Status (FR-014)

No fetch, load, or run control exists anywhere in the surface — UI-29 asserts zero
`button[data-action="fetch"]`. The boot sequence is cache-first, delta-only:

1. Restore `state` from `localStorage.rlTrackRecordLab` and apply `body.power` **before** first paint, so no
   flash of the wrong view occurs (UI-31).
2. Read committed artifacts and the shared cache; paint immediately from whatever is present — including the
   honest `empty` state, which is a *correct* first paint, not a loading placeholder.
3. Refresh only the delta: bars for subjects in the currently rendered cohort that are missing or stale. Then
   re-render.

Every resource reports through `RLAPP.report(resource, state, detail)`
([rlapp.js#L73](../../rlapp.js#L73), exported [#L606](../../rlapp.js#L606)) using the shell's existing
vocabulary — `refreshing`, `error`, `missing`, `stale`, `ready`/`fresh`
([rlapp.js#L47-L52](../../rlapp.js#L47)). Reported resources: `ledger:recommendations`, `claims`,
`resolutions`, `bars:<SYM>`. **A cached read reports `stale`, never `fresh`** (UI-30). A `putToolRead`
returning `null` reports `error` (D6).

**Null-safety is a first-paint requirement, not a polish item.** `rlvSummarizeOutcomes` returns
`averageWin: null` for a cohort with no wins and `averageLoss: null` for one with no losses. Every such value
is guarded with `Number.isFinite` — never the global `isFinite`, which passes `null` and throws on
`.toFixed()`. UI-11 asserts `#avgLoss` renders `—` with an explanatory tooltip **and** that `#blockRight` still
paints and the console stays clean: one unguarded `null` would halt `render()` and freeze the tool.

### Accessibility

| Obligation | Mechanism |
|---|---|
| Every chart has an equivalent table | Contractual via `tableTargetFor` / `links.sameDataTable`, plus `data-chart-fallback` for UI-25 |
| Charts are keyboard reachable | `attachStructured` sets `canvas.tabIndex = 0`, `data-rlchart-mode="structured"` and an `aria-activedescendant` point rail ([rlchart.js#L317](../../rlchart.js#L317)) — free with the structured path, absent from the legacy one |
| Every value is described | Explicit `title` on every `[data-kpi]`, longer than its label (UI-28) |
| Narrow reflow ≤ 520px | Levers stack; `#rangeBand` keeps its full 0–100% axis so width stays honest at small size; `#coverageLine` and `#noAdviceNotice` never collapse behind a "show more" (UI-32) |
| Absence is named | Every `—` carries a tooltip stating what is missing and why |

### Steering, Persistence, And The Session Counter

Lever changes call `render()` against in-memory `MODEL` only. Persisted to `localStorage.rlTrackRecordLab` as
`{ mode, cohort, bucket, horizon, family, window }` — the D6 shape, deliberately outside `rlData` so FR-021
holds. **No derived statistic is ever persisted**, so a stale cache cannot surface a number the current ledger
does not support.

`#cohortsViewed` counts **distinct** lever tuples viewed this session (a `Set` over the serialized tuple) and
is deliberately **not** persisted — it is a within-session reading aid that puts the cost of cohort-shopping in
front of the reader while they read (UI-23). Nothing is blocked; the count is informational, which is the only
honest thing it can be.

---

## D8 — Testing Strategy

### The Repo's Real Surfaces — No New Runner

015 introduces **no** test framework. Three surfaces already exist and all three are used as-is.

| Surface | Command | Role for 015 |
|---|---|---|
| Build-free baseline | `node scripts/selftest.mjs` | Pure-logic invariants: predicate evaluation, sentinel routing, cohort filtering, sufficiency branch, `read`-string templates. **Verified this run: `952 passed, 0 failed`, exit 0.** |
| Committed contract validator | `node scripts/validate-recommendation-track-record.mjs` | The FR-020 surface: closed `RTR-*` codes, adversarial refusals, source scans. New file, existing pattern. |
| Playwright | `npx playwright test --project=system-chrome tests/recommendation-track-record-lab.spec.mjs` | Live-DOM behaviour: the UI Scenario Matrix. |

`playwright.config.mjs` declares `testMatch: '**/*.spec.mjs'` and two projects, `system-chrome` (chromium via
the system Chrome channel) and `chromium` (bundled). `package.json` pins `playwright` `1.61.1` and
`engines.node >= 20`, and declares **no** `scripts` block — Playwright is invoked directly, as the existing
specs are. Non-spec companions follow the repo's established suffix taxonomy (`.unit.mjs`, `.functional.mjs`,
`.integration.mjs`, `.e2e.mjs`) and run under plain `node`.

### The Validator: `scripts/validate-recommendation-track-record.mjs`

Modelled directly on `scripts/validate-market-action.mjs`, which is the repo's reference shape:

```js
function invariant(condition, message) { if (!condition) throw new Error(message); }
function expectRejected(name, code, fn) { /* asserts fn() fails closed with exactly `code` */ }

export function validateRecommendationTrackRecord() {
  return { authority: …, claims: …, resolver: …, scorecard: …, surface: …, adversarial: … };
}

function main() { /* prints one line per section, sets process.exitCode = 1 on failure */ }
if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
```

The named export exists so the validator is **importable into the baseline**, exactly as `selftest.mjs`
imports `validateBriefPayload` at [scripts/selftest.mjs#L18](../../scripts/selftest.mjs#L18). That gives one
implementation of every refusal with two entry points: standalone (exit 0/1) and inside the 952-assertion
baseline.

### The Closed `RTR-*` Register (FR-020), Consolidated

D4's error-code table is scoped to the resolver and is **not** the whole register — D5 and D6 each added codes
after it. This table is the complete FR-020 surface and supersedes D4's as the closed set (F-015-D8-01). Five
codes are newly declared here to close the per-Hard-Constraint coverage gap; they are marked **new**.
`RTR-SESSION-PREDICATE` is declared in D4 and listed here for completeness, taking the closed set to **16**.

| Code | Declared in | Fires when |
|---|---|---|
| `RTR-LOCAL-STATISTIC` | **new (D8)** | A source scan finds an estimator, interval, mean or discount computed outside `RLVALID` |
| `RTR-REDUCER-FORK` | **new (D8)** | A source scan finds a local re-implementation of the lifecycle reducer or closure application |
| `RTR-CLOSURE-VOCAB` | D4 | A closure event outside `CLOSE_EVENT_TYPES` is constructed |
| `RTR-CENTER-VIEW` | **new (D8)** | 015 source writes Center `viewOrder` / `views` / `viewState`, or declares a view id |
| `RTR-LEGACY-BACKFILL` | **new (D8)** | A resolution is written against a ledger row that carries no `claimRef` |
| `RTR-LEGACY-GROWTH` | D5 | The asserted unresolvable-legacy count drifts from the derived count |
| `RTR-LOOKAHEAD` | D4 | An observation dated after `horizon.resolutionDate` is consulted |
| `RTR-SESSION-PREDICATE` | D4 | The trading-session test is keyed on `dateState` instead of `regular !== null`, or the derived 2026 session count is not 251 |
| `RTR-CALENDAR-COVERAGE` | D4 | A resolution date falls outside the committed calendar window |
| `RTR-PREDICATE-AMEND` | D4 | A write would change a frozen claim's predicate / horizon / magnitude |
| `RTR-FLAT-ZERO` | D4 | A bare `0` reaches the array passed to `rlvSummarizeOutcomes` |
| `RTR-RATE-BARE` | D6 | A rate is emitted without its range and count — in the DOM or in the `read` string |
| `RTR-COHORT-MIX` | D5 | A rate is rendered without its cohort label and sample count |
| `RTR-ACTION-EMITTED` | **new (D8)** | Action vocabulary reaches the rendered surface, **or** an element matching `rlg.js`'s `GLOSSARY_SELECTOR` lacks a `title` (the precondition for it) |
| `RTR-NETWORK` | D4 | Network or provider-credential surface is reachable from the resolver |
| `RTR-RESOLUTION-CONFLICT` | D4 | A content-addressed write would change existing bytes |

### One Adversarial Rejection Case Per Hard Constraint

Every case is a `expectRejected(name, code, fn)` in the validator. Each **must** fail closed with exactly the
named code; an acceptance is a validator failure, not a pass.

| HC | Case name | Code | What the adversarial input does |
|---|---|---|---|
| HC-1 | `local-statistic-reimplemented` | `RTR-LOCAL-STATISTIC` | Scorecard module computes `wins / total` inline instead of calling `rlvWilsonInterval` |
| HC-2 | `closure-type-invented` | `RTR-CLOSURE-VOCAB` | Resolver constructs closure event `"partially-satisfied"` — outside `CLOSE_EVENT_TYPES` |
| HC-2 | `reducer-forked` | `RTR-REDUCER-FORK` | A local `applyClosure()` mutates entries instead of routing through `reduceRecommendationEvents` |
| HC-3 | `center-view-written` | `RTR-CENTER-VIEW` | 015 module declares view id `"track-record"` and appends it to `viewOrder` |
| HC-4 | `legacy-row-backfilled` | `RTR-LEGACY-BACKFILL` | A resolution is written for a pre-contract row (no `claimRef`), with an imputed predicate |
| HC-4 | `legacy-count-hardcoded` | `RTR-LEGACY-GROWTH` | Asserted legacy count is `160` while the derived count over the committed ledger is 165 |
| HC-5 | `bar-dated-after-resolution-consulted` | `RTR-LOOKAHEAD` | Predicate evaluated against a bar dated `resolutionDate + 1` |
| HC-5 | `early-close-session-skipped` | `RTR-SESSION-PREDICATE` | Session test keyed on `dateState === "regular"`; a `next-session` claim entered 2026-11-26 resolves 2026-11-30 instead of the genuine 2026-11-27 early-close session — a one-session lookahead. Companion case asserts the derived 2026 session count is **251**, not 249 |
| HC-5 | `resolution-outside-committed-calendar` | `RTR-CALENDAR-COVERAGE` | Horizon expiry lands beyond the last session in `data/calendars/xnys/calendar.json` |
| HC-6 | `frozen-predicate-amended` | `RTR-PREDICATE-AMEND` | A second write changes `predicate.value` on an existing `claimHash` |
| HC-7 | `bare-zero-in-outcome-array` | `RTR-FLAT-ZERO` | A resolved-flat outcome is passed as literal `0` into the `rlvSummarizeOutcomes` array |
| HC-8 | `rate-without-range-or-count` | `RTR-RATE-BARE` | `read` string is `"Directional hit rate 57%."` with the range and `n` moved to `metrics` |
| HC-8 | `cohort-rate-without-label` | `RTR-COHORT-MIX` | A rate is rendered for a filtered cohort with no cohort label in the block |
| HC-9 | `action-token-in-rendered-copy` | `RTR-ACTION-EMITTED` | A `<label>Horizon</label>` is emitted **without** a `title`, letting `rlg.js` `decorate()` write the trading-vocabulary `aria-label` from `G["horizon"]` |
| HC-10 | `network-surface-reachable` | `RTR-NETWORK` | Resolver module references `fetch(` / `providerFetch(` / `rlProviderConfig` |
| HC-10 | `content-addressed-write-changes-bytes` | `RTR-RESOLUTION-CONFLICT` | A second resolution for the same `claimHash` produces different bytes at the same path |

The HC-9 case is worth naming explicitly because it is the one that would otherwise be missed: the forbidden
vocabulary is not in 015's copy at all. It arrives from a shared module, through an element 015 forgot to
label. Testing 015's own strings would pass while the rendered page failed.

### Determinism Proof (NFR Determinism, HC-10, AC-003)

A repeat-run assertion, not an inspection. Given an identical ledger and identical committed bars:

| Layer | Assertion | Why it is byte-exact |
|---|---|---|
| Resolution objects | Pass 2 writes identical bytes at identical paths | `resolutionHash` excludes `runId` and wall-clock (D4); content addressing makes the path a function of the bytes |
| Reducer | `indexFingerprint` from pass 1 `===` pass 2 | The fingerprint covers `{ contractVersion, entries }` only, excluding `runId` and `canonicalMonth` (D4) |
| Scorecard | `JSON.stringify(scorecard)` identical across two `compute()` calls | `compute()` is pure; primitive outputs are deterministic given identical integer counts |
| Owner read | `read` string and `metrics` object identical | Both are pure functions of the frozen scorecard (D7); `computedAt` is provenance and is excluded from the comparison |

Run under `node scripts/selftest.mjs` (pure layers) and in the validator (object-store layers). The comparison
is string equality on serialized output — there is no tolerance window, because there is no float path that
could justify one.

### Idempotence Proof (FR-006, BP-015-005, BS-009, AC-003) — Covering F-015-D4-02

D4 established the uncomfortable fact this proof must be built around: **the reducer does not self-enforce
idempotence.** `lifecycleEventId` hashes `runId`, so the same closure on two days yields two different
`eventId`s and the within-run `seenEvent` dedup never sees a duplicate; and the closure block does not reject
an entry that is already closed. The **due-set gate — `entry.state === "active"` — is the only guard.**

A test that only re-ran the resolver and observed "nothing happened" would be true but uninformative: it would
not distinguish "the gate held" from "the reducer protected us". Two cases are needed, and the second is the
adversarial one.

| # | Case | Assertion | What it proves |
|---|---|---|---|
| 1 | `resolver-second-pass-is-a-noop` | Pass 2 over an unchanged ledger yields `run.closures.length === 0`, zero appended events, and an `indexFingerprint` byte-identical to pass 1 | The gate holds today |
| 2 | `reducer-accepts-double-closure-when-gate-bypassed` | Feed `reduceRecommendationEvents` a second closure for an **already-closed** entry, bypassing the due-set gate, and assert the reducer **accepts** it and the fingerprint **changes** | The guard's location. The reducer is permissive by design; case 1 is therefore load-bearing and not incidental |

Case 2 is deliberately an *acceptance* assertion, which makes the pair non-tautological: it fails if someone
"hardens" the reducer without telling the resolver, and case 1 fails the moment the due-set predicate is
loosened from `state === "active"`. Together they pin the invariant to the place it actually lives. The scope's
DoD carries both; neither alone is sufficient evidence for FR-006.

### Coverage Map

| Requirement | Surface | Named artefact |
|---|---|---|
| FR-001, FR-002, FR-022 | selftest + validator | claim contract round-trip; `RTR-PREDICATE-AMEND` |
| FR-003, FR-005, FR-007 | validator | `RTR-LOOKAHEAD`, `RTR-FLAT-ZERO`, `RTR-NETWORK` |
| FR-004 | selftest + validator | closure routed through `reduceRecommendationEvents`; `RTR-CLOSURE-VOCAB`, `RTR-REDUCER-FORK` |
| FR-006 | selftest + validator | the two-case idempotence pair above |
| FR-008 | validator source scan | `RTR-LOCAL-STATISTIC` |
| FR-009, FR-010, FR-011 | selftest + Playwright | sufficiency branch unit cases; UI-01..UI-03, UI-07, UI-12 |
| FR-012, FR-013 | Playwright | UI-29, UI-31 |
| FR-014 | Playwright + validator | UI-30; script-order assertion over the page source |
| FR-015, FR-016, FR-017 | Playwright + validator | UI-24, UI-27, UI-28; `RTR-ACTION-EMITTED` title-coverage scan |
| FR-018, FR-019 | validator + Playwright | `putToolRead` accepts the read (non-`null`); registration present in all three surfaces; UI-35 |
| FR-020 | validator | the 16-code register above |
| FR-021 | validator | cache-schema byte-comparison before/after a full render |
| AC-018 | baseline | `node scripts/selftest.mjs` reports `952 + N passed, 0 failed`; **no pre-existing assertion count decreases** |

AC-018 is stated as an arithmetic assertion on purpose. "Selftest still passes" is satisfiable by deleting an
assertion; "952 + N passed" is not.

---

## D9 — Alternatives Considered

**A fifth Market Action Center view.** The obvious placement for a track record is a Center tab beside Brief,
Portfolio, Red-Alert and Journey. Rejected: `CENTER_VIEW_IDS` is frozen at four and `RLMKT-VIEW` refuses a
fifth at five independent checkpoints (D6), so this is not a design preference but a hard refusal owned by
Feature 012. HC-3 encodes it. The chosen path — publish an `rl-tool-read/v1` that the existing Brief view
already renders — reaches the same reader through code that already runs, and cost 015 nothing in Center
surface area. The price is F-015-D6-01: the Center renders only `read`, so the whole HC-8 obligation has to
fit in one sentence. That is a real constraint, and D7's single-scorecard shape is the answer to it.

**Re-implementing the statistics locally.** A Wilson interval is nine lines; writing it inline would have
avoided a load-order dependency and a validation surface. Rejected under HC-1, and the reason is not
stylistic. Seven primitives already exist with their own closed `RLV-*` failure codes and their own owner
(Feature 007). A local copy would be a second implementation that drifts silently — same name, different
edge-case behaviour — and every number on the surface would lose its single traceable owner, which is exactly
what BP-015-004 exists to prevent. Where the loop needs a number the seven do not provide, the answer is to
not display that number rather than to write an eighth.

**Back-filling the anonymous legacy history.** 165 rows across 83 keys currently show as unscoreable, which is
an unflattering thing to publish. Rejected under HC-4 — and not as a policy choice, because it is **not
possible**. The publisher hashes `{ subject, family }` into a one-way SHA-256 and the preimage was never
persisted anywhere in the repository. There is no archive and no reconstruction path. What was actually
available was *estimation*: infer plausible claims and score them. That is the more dangerous option, because
an imputed track record is indistinguishable from a measured one once it is on screen. The design makes the
count permanent, derived, and explained (D5), and the copy never implies future recovery.

**Forking `reduceRecommendationEvents`.** The reducer's `runId`-hashed event ids make idempotence awkward
(F-015-D4-02), and a 015-owned reducer could have hashed content instead and enforced closed-entry rejection
directly. Rejected under HC-2. A fork means two lifecycle engines with divergent state semantics over the same
ledger, and the divergence would surface as ledger corruption rather than as a test failure. The reducer is
Feature 002's; the correct response to its behaviour is to enforce the invariant upstream where 015 does have
authority — the due-set gate — and to name the gap rather than route around it. Any change to the reducer
itself is a packet to 002, not a local patch.

**A `null` or `NaN` unresolved sentinel.** The natural encoding for "resolved, but flat" is a distinguishable
non-number. Rejected on a mechanical ground: `rlvSummarizeOutcomes` rejects the **entire array** with
`RLV-OUTCOME-VALUES` if any element is non-finite ([rlvalidation.js#L135](../../rlvalidation.js#L135)), and
`rlvQuantiles` does the same with `RLV-QUANTILE-VALUES` ([#L123](../../rlvalidation.js#L123)). One flat
outcome would take down the whole cohort's statistics. A signed epsilon was also rejected — it is a lie that
survives arithmetic, silently biasing `averageWin`. D3's convention classifies upstream and feeds a zero-free
array: the flat outcome keeps its exact value and its own `outcomeClass`, and is simply not a member of the
array the primitives see.

**Manufacturing p-values to use BH/Holm.** `rlvAdjustBenjaminiHochberg` and `rlvAdjustHolm`
([rlvalidation.js#L63](../../rlvalidation.js#L63), [#L76](../../rlvalidation.js#L76)) are the repo's
multiplicity corrections and would have given the multiplicity panel a familiar, authoritative-looking output.
Both require genuine per-family p-values, which recommendation outcomes do not produce — a per-family p-value
would have to be synthesised from a binomial test 015 is not permitted to write (HC-1) against a null nobody
declared. Rejected in D5 as fabrication wearing a primitive's name. The panel uses `rlvDeflatedSharpe` with an
explicit trial count instead, labelled directional evidence of overfitting rather than a significance test —
which is precisely what RL-007 says it is, and what UI-22 asserts the copy must say.

---

## D10 — Complexity Tracking

Deviations from the simplest viable approach. Each row states the simpler alternative that was considered and
why it was rejected. Nothing here is complexity for its own sake; each item is forced by a verified property of
code 015 does not own.

| # | Deviation | Simpler alternative | Why rejected | Irreducible because |
|---|---|---|---|---|
| 1 | **The reducer key bridge** (F-015-D4-01, reduced) — the claim binds to the publisher key while the reducer keys on `originRecommendationKey` | Bind 015 to `deriveRecommendationKeys` and key everything consistently | That key appears in **zero** ledger rows. All 165 committed rows carry the publisher key. Binding to the unused derivation would produce a track record that matches nothing that was ever published | Two independent identity derivations already exist in shipped code. 015 cannot delete either; it must bridge them. The bridge's two missing terms are now supplied — `originToolId` is the constant `market-brief`, `thesisFamily` is authored (D1) — so what remains is a Feature 002 consent call, not a derivation |
| 2 | **Idempotence enforced upstream, not at the write** (F-015-D4-02) | Dedupe closures by `eventId` inside the reducer path | `lifecycleEventId` hashes `runId`, so the same logical closure on two days has two different ids; the reducer's dedup is within-run only and its closure block does not reject an already-closed entry | Changing that is a Feature 002 change (HC-2). The only place 015 has authority is the due-set gate — so the invariant lives there, and the test suite must prove *where* it lives, not merely that it holds |
| 3 | **Calendar-session horizon arithmetic keyed on `regular !== null`** | Add N calendar days to the proposal date; or, having reached for the calendar, filter on the obvious `dateState === "regular"` | Day arithmetic resolves a Friday `next-session` claim on a Saturday. But the *subtler* failure is the obvious calendar filter: `dateState === "regular"` counts 249 of the calendar's **251** sessions, skipping the two `early-close` rows (2026-11-27, 2026-12-24) that carry genuine 09:30–13:00 `regular` blocks — producing a silent one-session **lookahead** out of the machinery built to prevent one | Sessions are the unit the predicate is written in, and "is a session" is a property of the `regular` block, not of the `dateState` label. `data/calendars/xnys/calendar.json` is committed precisely so this is deterministic and offline; running off its end is a real refusal (`RTR-CALENDAR-COVERAGE`), and the 251-vs-249 discrimination is a committed adversarial case (`RTR-SESSION-PREDICATE`) |
| 4 | **Closure event and outcome class are two axes, not one** | One enum: `satisfied` / `invalidated` / `expired` / `withdrawn` / `flat` / `not-evaluable` | The two axes are genuinely orthogonal. `satisfied` is a *lifecycle* fact from `CLOSE_EVENT_TYPES` (002-owned, unextendable); `win`/`loss`/`flat`/`none` is an *outcome* fact 015 owns. Collapsing them would force `flat` into the 002 vocabulary — forbidden — or force the denominator to be defined on the lifecycle axis, which is exactly the arithmetic-by-accident UXQ-3 caught | The denominator is defined on the outcome axis (`win` ∪ `loss`); the ledger and closure-mix render the lifecycle axis. Both must be visible (UI-15, UI-19), so both must exist |
| 5 | **Zero-free array convention** (D3) | Pass every resolved outcome, zeros included | `rlvSummarizeOutcomes` derives `unresolved = count − wins − losses` with wins `> 0` and losses `< 0`, so an exact zero is silently absorbed into `unresolved` — a resolved measurement reported as a missing one (HC-7) | The primitive is Feature 007's and is not modified here (RL-006). Classifying upstream is the only compliant route |
| 6 | **One compute, three renderings** | Let the tool render, and assemble the Center read separately | A second traversal can disagree with the page, and the Center quotes what the tool no longer shows | F-015-D6-01: the Center renders only `read`, so that one string carries the entire HC-8 obligation. Deriving it from the same frozen scorecard makes disagreement unrepresentable |
| 7 | **Structured chart adapter over the legacy closure** | `RLCHART.attach(canvas, hitFn)` — one line, used by every chart tool but one | The legacy path stamps `data-rlchart-migration-required="true"`; a new tool would ship pre-flagged debt | The structured path costs a full `contextual-tooltip/v1` per point, but it makes FR-016 and the a11y table *contractual* rather than reviewable. The exact five-key adapter shape is enforced, so partial adoption is not possible |
| 8 | **Exhaustive `title` coverage to pre-empt `rlg.js`** | Let the shared glossary decorate labels, as other tools do | The glossary is options/tape vocabulary; `G["horizon"]` is wrong for this surface and the glossary carries 9 occurrences of UI-33's forbidden tokens | `decorate()` bails only when a `title` already exists. Exhaustive FR-016 coverage is therefore the *mechanism* for HC-9, not an independent nicety — and any gap re-opens the hole |
| 9 | **A new authored claim input block** (`brief-action-claim-input/v1`, D1) carrying `resolvesTo`, horizon mechanics, `thesisFamily` and the predicate | Derive all four from the authored action already present | Verified on the live payload: all 5 `subject` values are multi-clause prose and none is a `data/bars/` key; one names no instrument at all; one names 11 tickers in three *opposed* roles, so harvesting would score the funding leg as if it were the position. The payload's `horizon` band shares zero members with the resolution vocabulary, and `thesisFamily` appears **nowhere** in the payload | The publisher hashes only `{ subject, family }` ([#L405](../../scripts/brief-distributed-publish.mjs#L405)), so the block is key-neutral and needs no migration of the 165 committed rows. Every alternative is an inference over prose, which is non-deterministic (HC-10) and silently wrong (HC-5/HC-6) rather than merely imprecise |
| 10 | **Two horizon vocabularies kept side by side** — `horizon.kind`/`sessions` authored, `horizon.authoredBand` recorded verbatim | Declare a mapping table `structural→…`, `swing→…`, `tactical→…` | The two vocabularies are different *kinds* of thing: the band is a qualitative conviction label with no session count; `kind` determines the HC-5 read fence. `swing → next-session` would resolve every swing claim systematically early, scoring theses before they had run — a lookahead in the widening direction that no downstream statistic can detect | A total mapping cannot be written from information the payload does not contain. Carrying both — one authoritative, one labelled non-authoritative — keeps the band available for cohorting (D5 lever, D7 chip) without letting it derive a fence |

**Complexity NOT taken on.** No new statistic, no new closure vocabulary, no new Center view, no new cache key,
no new persisted contract on the `rldata.js` schema, no new provider surface, no new test runner, and no
network path anywhere in the resolver.

---

## D11 — Open Questions For Planning

Every unresolved item, with what it blocks. None blocks scope decomposition; each blocks a specific decision
inside a scope, and each is a scoping or ownership call rather than a design inference — which is why it is
named here instead of guessed at.

All seven UX open questions (UXQ-1 … UXQ-7) are **closed**: five in D5/D6, UXQ-3 in D5, UXQ-7 in D3.

| # | Finding | Raised in | Blocks | What is needed |
|---|---|---|---|---|
| **F-015-D4-01** | **Key-space bridge — reduced to a consent call.** The reducer keys entries by `originRecommendationKey` over `{ originToolId, thesisFamily, subjects, actionFamily, horizon }`; D1 binds to the publisher key over `{ subject, family }`. Both missing terms are now supplied by design: `originToolId` is the constant `market-brief` (verified as the sole `market-action-center` id in `tools.json`), and `thesisFamily` is an authored, hashed claim field (D1). | D4 | Nothing structurally — the resolver can route once the authored block exists | **Feature 002 consent** for the additive `action.claim` block on `payload.nextSession.actions[]`, which is the same consent shape as D2's ledger-row field. The block is key-neutral (the publisher hashes only `{ subject, family }`), so no migration of the 165 committed rows is implied |
| **F-015-D1-01** | **The authored claim input block gates activation.** No live action carries `claim`, so on today's payload every claim mints `not-evaluable` (`no-authored-thesis-family`) and the track record correctly reports zero resolved outcomes. | D1 | Scope sequencing and the first-release verdict copy | A decision on whether the authoring change lands inside 015's scope set or is sequenced as a Feature 002 change ahead of it. Either way the tool ships showing the insufficient-sample branch first — that is HC-4 holding, not a defect, and D7 already renders it as a first-class state |
| **F-015-D4-02** | **Reducer idempotence is not self-enforcing.** `lifecycleEventId` hashes `runId`; the closure block does not reject an already-closed entry. FR-006 rests entirely on the resolver's `state === "active"` due-set gate. | D4 | The resolver scope's DoD | The two-case idempotence pair in D8 must be a named DoD item, not an implied one. Case 2 (reducer accepts a double closure when the gate is bypassed) is the non-tautological half |
| **F-015-D5-01** | **Lever-set discrepancy.** P7 names *action type* as a cohort lever; the Interaction And Steering Model names *claim family* and omits action type. The two lists differ. | D5 | The scorer/tool scope's lever inventory and its `localStorage` shape | A decision on whether `actionFamily` becomes a sixth lever. D5/D7 adopt the Interaction model's five because those carry the DOM ids UI-06 / UI-07 / UI-31 assert against; adding a sixth changes the persisted state shape |
| **F-015-D5-02** | **The legacy count is a moving target.** Spec says 160 rows / 78 keys / 32 runs. Re-verified this run: **165 rows / 83 keys / 33 runs**, all `proposed`, all `v1`. It grows every publish window until the claim contract activates. | D5 | The scorer scope, and the copy in every verdict state | The count must be derived (`rows without claimRef`) and frozen once at activation into `briefs/history/record-start.json`, guarded by `RTR-LEGACY-GROWTH`. A literal `160` must not ship. Confirm the activation-window sequencing |
| **F-015-D6-01** | **`metrics` is not rendered by the Center.** `RLBRIEF.renderToolReads` consumes only `read`, `asOf` and `deepLink`. HC-8 on the Center surface is satisfiable **only** through the `read` string, and `tools.json` registration gates whether the read is looked up at all. | D6 | Scope ordering | FR-019 (registration) must land **before** FR-018 (publish), or the publish is a no-op nobody notices. D7's single-scorecard shape addresses the HC-8 half; the ordering is a plan decision |
| **F-015-D6-02** | **Registration is a six-file atomic change, not a nav entry.** `scripts/validate-tool-experience.mjs` cross-asserts `tools.json` × `simple-models.json` × `journeys.json` and carries **four literal count assertions** ([#L493-#L496](../../scripts/validate-tool-experience.mjs#L493)) that a 24th tool breaks: `ordinaryTools 22→23`, `totalGoals 48→50`, `definitionCount 48→50` (`centerGoals` stays 4). `sameValues(toolIds, modelToolIds)` ([#L145](../../scripts/validate-tool-experience.mjs#L145)) additionally makes a simple-model definition mandatory. | D6 | The registration scope's DoD and its file list | Confirm the registration scope covers all six files **plus** the validator's literal counts in one change, and confirm 015 registers exactly **two** journey goals (a third makes the totals 51, and the assertion is a literal). Splitting registration across scopes leaves the tree red between them |
| **F-015-D7-01** | **`data-chart-fallback` has no repo precedent.** UI-25 asserts `table[data-chart-fallback]`; the attribute has **zero occurrences** anywhere in the repository. The repo's actual chart-to-table mechanism is the structured adapter's `tableTargetFor` / `links.sameDataTable` binding. | D7 | The tool scope's chart DoD | D7 carries both (id binding *and* the attribute). Confirm that introducing `data-chart-fallback` as a new repo-wide convention is intended, or amend UI-25 to assert the existing `sameDataTable` binding instead |
| **F-015-D7-02** | **`rlcontext.js` must join the load order.** D6's script list omits it, but `validateStructuredAdapter` hard-requires `root.RLCTX.validateContext` synchronously at attach time. `rlg.js`'s lazy loader is not a substitute. | D7 | The tool scope's page scaffold | Accept D7's amended order (precedent: `market-heatmap-lab.html#L411-L418`). This is an addition to D6's list, not a contradiction of FR-014 |
| **F-015-D7-03** | **`rlg.js` glossary pre-emption.** `decorate()` claims any `GLOSSARY_SELECTOR` element lacking a `title` and writes a glossary definition into `aria-label`. `G["horizon"]` collides with 015's `Horizon` lever and injects trading vocabulary ("target", "R:R") onto a measurement surface; the glossary carries 9 occurrences of UI-33's forbidden tokens. | D7 | The tool scope's FR-016 and HC-9 DoD items | These are **one** DoD item, not two. Exhaustive `title` coverage is the mechanism that delivers HC-9. The `RTR-ACTION-EMITTED` scan must include the "element without a `title`" precondition, not only the token match |
| **F-015-D7-04** | **UI-33's assertion has a gap.** It checks page *text*; `rlg.js` writes into `aria-label`. Action vocabulary injected that way would be heard by a screen-reader user and missed by the assertion as written. | D7 | The `e2e-ui` assertion for UI-33 | Widen the assertion to cover `aria-label` and `title` in addition to text content. This is an assertion amendment inside the scope, not a spec change |
| **F-015-D8-01** | **D4's error-code table is not the complete FR-020 register.** D5 and D6 each declared codes after it; D8 adds five more to close per-Hard-Constraint coverage, and D4 adds `RTR-SESSION-PREDICATE`. The consolidated 16-code table in D8 is the closed set. | D8 | The validator scope | Treat D8's table as the FR-020 surface. D4's table remains correct for the resolver but is a subset |
| **F-015-D8-02** | **FR-017 names the deprecated attach form.** Its wording ("register a hit-test closure via `RLCHART.attach`") describes `attachLegacy`, which stamps `data-rlchart-migration-required="true"`. D7 selects the structured adapter, whose `hitTest` member satisfies FR-017's intent. | D8 | Nothing structurally — but the DoD wording | Confirm the structured adapter satisfies FR-017 as written, or route a spec amendment to `bubbles.analyst`. Design will not amend `spec.md` |

**Not open, recorded for completeness.** RL-009 (concurrent-feature coupling) is a real sequencing risk, not a
design question: 015 extends 002's row contract (D2, consent-gated) and consumes 012's surface (D6,
read-only). Both dependencies are named in their own sections with the consent path stated. Plan owns the
sequencing.

---

## RESULT-ENVELOPE

**chunk 3 of 3 complete — DESIGN AUTHORING IS COMPLETE.**

- **Outcome:** `completed_owned`
- **Artifact modified:** `specs/015-recommendation-outcome-ledger-and-track-record/design.md` — now **complete**, 11 sections, ready for `bubbles.plan`.
- **Sections authored this run (6):**
  1. `## Design Brief` (required alignment checkpoint, deferred from chunk 2)
  2. `## D7 — UI Component Design`
  3. `## D8 — Testing Strategy`
  4. `## D9 — Alternatives Considered`
  5. `## D10 — Complexity Tracking`
  6. `## D11 — Open Questions For Planning`
- **Also updated:** the authoring-state banner (chunk 2 of 3 → **COMPLETE**), a `### Reading Order (authoring complete)` subsection appended to `## Architecture Overview` so the document no longer reads as mid-flight, and this envelope. `D1`–`D6` were **not** rewritten, restated, or edited — they are referenced by name only.
- **Document shape (verified after edit):** `Design Brief` L11 · `Architecture Overview` L64 · `D1` L139 · `D2` L290 · `D3` L377 · `D4` L492 · `D5` L774 · `D6` L992 · `D7` L1171 · `D8` L1453 · `D9` L1602 · `D10` L1656 · `D11` L1679 · `RESULT-ENVELOPE` L1708.
- **Files modified:** `design.md` and `state.json` (`executionHistory` append) only. **No** source file, test, script, `tools.json`, `index.html`, `rlnav.js`, `spec.md`, `scopes/`, `report.md`, `uservalidation.md`, or any other spec's artifact was touched. **G073 source-edit lockout respected.** Concurrent sessions on specs 002, 012, 013, 014 and 016 were not approached.
- **Verifications performed this run (read-only, all citations traced to them):**
  - `node scripts/selftest.mjs` → **`952 passed, 0 failed`, exit 0** — the D8 baseline is measured, not assumed.
  - `briefs/history/recommendations/2026-07.jsonl` → **165 rows / 83 distinct keys / 33 runs, all `proposed`** — F-015-D5-02 re-confirmed, unchanged from chunk 2.
  - `data/bars/` → **289 symbol files**; `data/calendars/xnys/calendar.json` present with a reviewed source file.
  - `rlchart.js` → `attach` L365 dispatch; `attachLegacy` L351 stamps `data-rlchart-migration-required="true"`; `validateStructuredAdapter` L98 enforces the exact five-key adapter and the `links.sameDataTable === "#" + tableTargetFor(...)` invariant.
  - `data-chart-fallback` → **zero occurrences repo-wide** across `*.html` / `*.js` / `*.mjs` (basis of F-015-D7-01).
  - `rlg.js` → `decorate` L234, `title` bail L241, `aria-label` write L243, `GLOSSARY_SELECTOR` L251; `G["horizon"]` L63; **9 occurrences** of UI-33's forbidden tokens (L12, L13, L58, L59, L65, L98). `rlticker.js` / `rlchart.js` / `rlcontext.js` / `rlapp.js` / `rlnav.js` → **zero** occurrences each (basis of F-015-D7-03 / F-015-D7-04).
  - `market-heatmap-lab.html` L411–L418 (load order with `rlcontext.js` first) and L641 (`sameDataTable`) — the repo's only structured-chart precedent.
  - `sector-research-lab.html` L1196 / L3123 / L3373 — the Simple/Power reference implementation.
  - `playwright.config.mjs` (`testMatch: '**/*.spec.mjs'`, projects `system-chrome` + `chromium`), `package.json` (playwright `1.61.1`, node `>=20`, **no** `scripts` block), and `scripts/validate-market-action.mjs` — the D8 surfaces, none invented.
- **Findings routed to `bubbles.plan` (11 total — 5 carried forward, 6 raised this run):**
  - **F-015-D4-01 — key-space bridge** *(carried; D4)*. Reducer keys on `originRecommendationKey`; D1 binds to the publisher key, which does not hash `originToolId` / `thesisFamily`. **Blocks:** the resolver scope's route into `reduceRecommendationEvents`. Chunk 3 did **not** revisit D1 — the bridge remains a scoping/ownership decision, possibly requiring Feature 002 consent.
  - **F-015-D4-02 — reducer idempotence is not self-enforcing** *(carried; D4)*. The due-set gate is the only guard. **Blocks:** the resolver scope's DoD. D8 now specifies the **two-case** proof, whose second case asserts the reducer *accepts* a double closure when the gate is bypassed — the non-tautological half that pins the invariant to its actual location.
  - **F-015-D5-01 — lever-set discrepancy** *(carried; D5)*. P7 says *action type*; the Interaction Model says *claim family*. **Blocks:** the tool scope's lever inventory and its persisted `localStorage` shape.
  - **F-015-D5-02 — the legacy count is a moving target** *(carried; D5)*. 165 / 83 / 33 this run vs the spec's 160 / 78 / 32. **Blocks:** verdict copy in every state. A literal `160` must not ship.
  - **F-015-D6-01 — `metrics` is not rendered by the Center** *(carried; D6)*. **Blocks:** scope ordering — FR-019 must land before FR-018. **Addressed structurally in D7:** `buildOwnerRead(scorecard)` is a third rendering of the same frozen scorecard that produced `#pointEstimate` / `#rangeLow` / `#rangeHigh` / `#sampleCount`, so the Center read cannot drift from the page and the HC-8 obligation is met inside the `read` string.
  - **F-015-D7-01 — `data-chart-fallback` has no repo precedent** *(new; D7)*. UI-25 asserts it; it appears nowhere. **Blocks:** the chart DoD. D7 carries both the contractual `tableTargetFor` id binding and the asserted attribute; plan must confirm the new convention or amend UI-25.
  - **F-015-D7-02 — `rlcontext.js` must join the load order** *(new; D7)*. `validateStructuredAdapter` requires `RLCTX.validateContext` synchronously; `rlg.js`'s lazy loader is not a substitute. **Blocks:** the page scaffold. This is an **addition** to D6's script list, not a contradiction of FR-014.
  - **F-015-D7-03 — `rlg.js` glossary pre-emption** *(new; D7)*. `decorate()` claims any `GLOSSARY_SELECTOR` element lacking a `title`; `G["horizon"]` injects trading vocabulary onto a measurement surface. **Blocks:** FR-016 and HC-9 DoD framing — they are **one** item, because exhaustive `title` coverage is the mechanism that delivers HC-9.
  - **F-015-D7-04 — UI-33's assertion has a gap** *(new; D7)*. It reads page *text*; `rlg.js` writes `aria-label`. **Blocks:** the UI-33 `e2e-ui` assertion, which must be widened to `aria-label` and `title`.
  - **F-015-D8-01 — D4's error-code table is not the complete FR-020 register** *(new; D8)*. D8 consolidates **15** codes and declares five new ones (`RTR-LOCAL-STATISTIC`, `RTR-REDUCER-FORK`, `RTR-CENTER-VIEW`, `RTR-LEGACY-BACKFILL`, `RTR-ACTION-EMITTED`) to give every Hard Constraint HC-1…HC-10 at least one adversarial refusal. **Blocks:** the validator scope. D8's table is the FR-020 surface; D4's remains correct as a resolver-scoped subset.
  - **F-015-D8-02 — FR-017 names the deprecated attach form** *(new; D8)*. Its wording describes `attachLegacy`, which stamps `data-rlchart-migration-required="true"`. **Blocks:** DoD wording only. Design did **not** amend `spec.md` (analyst-owned); plan decides whether to confirm the structured adapter satisfies FR-017 or route an amendment.
- **UX open questions:** all seven closed (UXQ-1 / UXQ-2 / UXQ-4 / UXQ-5 / UXQ-6 in D5–D6, UXQ-3 in D5, UXQ-7 in D3). **None remain open.**
- **Nothing deferred.** No section, obligation, or question is left for a later chunk. Design authoring on spec 015 is finished.
- **Repository resolution (echoed from this run's preflight):**
  - `sessionId`: `vscode-809ebe73e214a29c7507f9aafbc29f02`
  - `decisionId`: `rb:vscode-809ebe73e214a29c7507f9aafbc29f02:14`
  - `controlRevision`: `14`
  - `controlPathDigest`: `sha256:ac914639d8b0bc4baf7e778f36a8af67d1170bf7682d52340eec305f1494c345`
  - `authority`: `explicit-repository-root`
  - `transition`: `confirmed`
  - `scopeKind`: `command` · `scopeId`: `null` · `targetKind`: `repository-root`
  - `pathVisibility`: `local` · `actionable`: `true`
  - `repositoryRoot`: `/home/redacted/research-lab` · `repositoryAlias`: `research-lab`

## Routed Design Decisions — Recorded 2026-08-13 (P-015-01, P-015-02, P-015-03, P-015-07)

The four Blocking routed findings that gated scopes 02 and 04 are hereby **RESOLVED as design
decisions**. Each ruling below was already reasoned in the D-sections above; what was missing was a
recorded owner decision. This section records them, and re-verifies each against the payload and
calendar **as they stand today** rather than relying on the earlier verification, because the payload
has turned over since (`recommendations` now carries 4 entries where the D-section observed 7, and the
action horizon histogram has changed).

Command and output for the re-verification are recorded in `report.md` under
`## Routed Finding Re-Verification — 2026-08-13`.

### The Feature 002 co-consent question, answered by not needing it

P-015-01 and P-015-03 were routed for Feature 002 co-consent because the obvious fix is to make the
publisher emit two new fields. **That is not the decision taken.** Every ruling below is implementable
entirely inside Feature 015 and mutates no Feature 002 contract, schema, or output. Feature 015 reads
what the publisher actually emits and refuses honestly where an authored field is absent.

This is the long-term-correct shape for three reasons. It removes a cross-feature blocking dependency
rather than deepening one. It keeps the measurement surface honest on day one instead of waiting for an
upstream change. And if Feature 002 later chooses to author `subject.resolvesTo` or `thesisFamily`, the
claims begin resolving with **no** change to Feature 015 — the refusal path simply stops firing. Co-consent
is therefore satisfied in the strongest available way: by requiring nothing of the other owner.

### P-015-01 — Authored subject is prose. Resolution reads only `subject.resolvesTo`. RESOLVED.

**Re-verified today.** `nextSession.actions` carries 5 actions. **Zero** of their `subject` values is a
key in `data/bars/` (293 symbols). All five are prose of 207 to 494 characters. `resolvesTo` is absent
from all five. `data/bars/VIX.json` remains absent.

**Decision.** `subject.prose` retains the key-bearing string verbatim, because `recommendationKey` is
derived from it and cannot otherwise be reproduced. Resolution reads **only** `subject.resolvesTo`, an
authored array of `data/bars/` symbols. The minter performs no parsing, no ticker regex, no NER, and no
lookup table. Absent or empty `resolvesTo` mints the claim `not-evaluable` with reason
`no-authored-subject`, excluded from every rate denominator but still visibly counted in the coverage
line.

**Why not parse.** Parsing is not a lossy extraction here, it is an inverting one. The live rotate
action names a leader to buy and names the funding and lagging legs in the same sentence; a ticker
harvester would score the funded-from and the explicitly-not-traded legs as though the claim were long
them. A separate live action names no instrument at all. A parser cannot be wrong-but-close on these —
it is wrong in the opposite direction, and silently.

### P-015-02 — The claim carries its own horizon. The authored band is recorded, non-authoritative. RESOLVED.

**Re-verified today.** The live action horizon vocabulary is `structural | swing | tactical`. D1's
`horizon.kind` vocabulary is `intraday | next-session | multi-session | event-bound`. The two still
share **zero** members.

**Decision.** No mapping is declared, because no honest total mapping exists — the two vocabularies are
not the same kind of thing. A holding *band* expresses intent; a horizon *kind* expresses a resolvable
fence. `horizon.kind` is authored per claim alongside `sessions` when the kind is `multi-session`. The
payload band is preserved as `horizon.authoredBand` and is explicitly **non-authoritative**: it is
displayed and stored, never used to resolve.

**Why not map.** The tempting `swing -> next-session` row resolves every swing claim systematically
early, and a systematic early resolution is not noise — it is a directional bias in the track record,
scoring claims against a fence their author never set. A measurement surface that mis-scores in a
consistent direction is worse than one that declines to score.

### P-015-03 — `thesisFamily` is authored-or-not-evaluable. No value is invented. RESOLVED.

**Re-verified today.** `thesisFamily` is absent from all 5 `nextSession.actions` and from all 4
`recommendations` entries. It has no live source.

**Decision.** The field stays declared on `lifecycleTerms` with its refusal path. When absent, the
reducer bridge mints `not-evaluable` with reason `no-authored-thesis-family` rather than assigning a
default, deriving one from direction or horizon, or collapsing to a catch-all bucket. Scope 04
implements the refusal path now; the bridge activates unchanged if a value is ever authored.

**Why not default.** A default would flatten genuinely distinct theses onto one reducer key, and the
reducer key is what the track record aggregates. Every rate computed over that key would then be an
average across theses that were never the same claim — a number that looks like a measurement and is
not one.

### P-015-07 — The trading-session test is `regular !== null`. RESOLVED.

**Re-verified today** against `data/calendars/xnys/calendar.json`, 365 rows: `regular` 249,
`early-close` 2, `holiday` 10, `weekend` 104. A non-null `regular` block is present on **exactly** the
249 regular plus 2 early-close rows and on **none** of the 10 holidays or 104 weekends. Both
early-close rows, `2026-11-27` and `2026-12-24`, carry genuine 09:30 to 13:00 sessions.

**Decision.** The session predicate is `row.regular !== null`, selecting 251 sessions. The
`dateState === "regular"` form is rejected.

**Why this is a correctness fix and not a preference.** `dateState === "regular"` counts 249 sessions
where there are 251, so a `next-session` claim entered 2026-11-26 steps to 2026-11-30 and is resolved
against an extra session of price movement it never claimed. That is a lookahead — manufactured by the
anti-lookahead machinery itself, which is the failure mode hardest to notice from the outside because
the guard reports success while producing the defect. The predicate is also exact rather than merely
better: it partitions the committed calendar with no residue.

### Consequence

All four findings are resolved and no longer gate implementation. Scope 02 may bind the live publisher
surface, and scope 04 may implement the reducer bridge and the session predicate, each on the ruling
recorded above. Both scopes retain their obligation to record the decision they implemented in their
own `report.md`. Feature 002 artifacts remain untouched.

---

## Claim-Identity Reconciliation — Recorded 2026-08-18

**What this supersedes, precisely.** Exactly one sentence: the clause in `### P-015-03` above reading
*"The field stays declared on `lifecycleTerms` with its refusal path."* Nothing else in P-015-03 is
disturbed — its substantive ruling (`thesisFamily` is authored-or-not-evaluable, no value is invented, no
default, no derivation from direction or horizon, reason code `no-authored-thesis-family`) stands exactly
as written and is **reinforced** below. P-015-01, P-015-02 and P-015-07 are untouched and are re-confirmed
against D1 at the end of this section. The 2026-08-13 record above is preserved verbatim as history.

### Why a reconciliation was needed

`ca512cb2` (2026-08-13) appended the decision section above in a **single hunk**, `@@ -2232,0 +2233,100 @@`
(**verified this run**). It never revised `## D1`. That left the frozen claim contract asserting one thing
and the newer decision record importing another:

| Surface | What it said about `thesisFamily` |
|---|---|
| `## D1` → *Contract* | top-level field of `brief-recommendation-claim/v1` |
| `## D1` → *Hashing Rules* | a term of `claimHash` |
| `## D4` → reducer bridge | *"an **authored, hashed** field of the claim (D1)"* |
| `## D11` → F-015-D4-01 (reduced) | *"`thesisFamily` is an authored, **hashed** claim field (D1)"* |
| `### P-015-03` (appended 2026-08-13) | *"declared on `lifecycleTerms`"* |

Three design surfaces state *hashed* in those words and a fourth places the field top-level among the
hashed terms; one clause says otherwise. That clause did not originate as a design
ruling. It imported a **plan-side placement** recorded in `scopes/_index.md` → *Resolution of `design.md`
→ `## D11` open questions* → **F-015-D4-01**, which invented an *unhashed* `lifecycleTerms` block holding
`{ originToolId, thesisFamily }` and justified it as *"the `claimHash` term list is therefore unchanged and
D1 needs no revisit."*

**That justification is false on its own terms.** D1's `claimHash` term list already contained
`thesisFamily`, so moving the field into an unhashed block changes the term list — the exact revisit the
placement claimed to avoid. And at `dc2c7453`, immediately before this reconciliation, the word
`lifecycleTerms` occurred **exactly once** in this entire design document — the superseded clause itself
(**verified this run**) — and was defined **nowhere** in it, while plan-owned scope files consumed it as
though it were a settled contract. A block that is referenced but never defined violates P19 (one
definition per concept) and cannot be implemented from design.

### Ruling 1 — `thesisFamily` is top-level and hashed. The `lifecycleTerms` block is WITHDRAWN.

`thesisFamily` remains where `## D1` → *Contract* already places it: top level, under `── Direction ──`,
beside `actionFamily` and `direction`, and inside `claimHash`. This is not chosen because that text is
older or newer. It is chosen because the alternative fails structurally, in three independent ways.

**1. It breaks the reducer-key containment invariant.** The foundation derives `origin-recommendation-key/v1`
over `{ originToolId, thesisFamily, subjects, actionFamily, horizon }`
([rlcontracts.js#L1041-L1047](../../rlcontracts.js#L1041), **verified this run**). `originToolId` is a
pipeline constant (D4) and does not vary; `subjects` / `actionFamily` / `horizon` are already hashed.
`thesisFamily` is therefore the **only** varying reducer-key term the exclusion would move outside
`claimHash` — and moving it means a single claim object can correspond to two different reducer entries.
The store cannot represent that. `claimHash` must be a refinement of `originRecommendationKey`, and the
exclusion is precisely the edit that breaks the refinement.

**2. Both concrete outcomes of the resulting collision are defects, and one is silent.** Two claims
identical in every hashed term but differing in thesis resolve to the same content address
`briefs/objects/claims/<claimHash-hex>.json`. Then either:

- the second write changes the bytes at an existing path, which D1 → *Storage Location* rules **must abort,
  not overwrite**, and which `scopes/01-frozen-claim-contract/scope.md` step 7 maps to
  `RTR-PREDICATE-AMEND` — so a legitimate second thesis is refused under a predicate-amendment code and the
  call is lost from the record; **or**
- the *"reuse the identical claim object"* rule in *Hashing Rules* applies, the second claim silently
  inherits the first claim's thesis, the bridge derives one `originRecommendationKey` for both, and two
  independent calls merge into one reducer entry.

The second branch is the dangerous one. It produces no error, no refusal code, and no coverage-line entry,
because a thesis *was* authored — it simply was not the one recorded.

**3. P-015-03's own rationale forbids it.** P-015-03 rejects a default because it *"would flatten genuinely
distinct theses onto one reducer key,"* producing *"an average across theses that were never the same
claim — a number that looks like a measurement and is not one."* Excluding `thesisFamily` from `claimHash`
produces that identical flattening one layer lower, at claim identity, where the `not-evaluable` refusal
path cannot see it. Reading P-015-03 as requiring the exclusion would make the ruling defeat its own
stated purpose.

**The category test also lands on `hashed`.** D1 excludes `proposalRunId`, `proposalEventId` and
`proposedAt` — every one answering *how did this claim get here*. `thesisFamily` answers *what does this
claim assert*. D1's own `authoredBand` precedent settles the criterion explicitly: `authoredBand` is
*"hashed but non-authoritative … hashed because HC-6 requires a frozen semantic label to be immutable"*
even though *"the resolver never reads it."* So "the resolver does not read it" is **not** grounds for
exclusion. `thesisFamily` is a frozen semantic label that the bridge *does* read, and the foundation
hard-rejects a record without it (`recommendation-thesis-required`,
[rlcontracts.js#L1074](../../rlcontracts.js#L1074), **verified this run**).

**`lifecycleTerms` is withdrawn rather than redefined.** Its two proposed members do not share a category:
`thesisFamily` is hashed claim identity (above) and `originToolId` is not a claim field at all (Ruling 2).
No coherent block contains exactly those two under one hash rule, and retaining the name while inverting
its hash semantics would leave scope-01 tests reading as though they still asserted what they were written
to assert. The concept is removed from this feature.

### Ruling 2 — `originToolId` lives in the resolver as a pipeline constant, not on the claim.

This restates D4 without amending it: `originToolId` is the constant `market-brief` — **verified this run**,
`tools.json` carries `experience.kind === "market-action-center"` exactly once (`#L50`), on the tool with
`id: "market-brief"` (`#L7`). It is a fixed literal in the resolver asserted against the registry, and the
derived key is recorded on the **015-owned resolution object** as
`lifecycleBinding.originRecommendationKey` — never in `claimHash`.

The per-action `deepLink` is a **citation**, not an attribution of authorship, and it is carried by the new
unhashed `citedToolId` field defined in D1 → *`citedToolId` Is Not `originToolId`*. Any consumer that needs
"which tool owns the detail behind this row" reads `citedToolId`; any consumer that needs "which tool
produced this record" uses the `originToolId` constant.

### D1's standing after this reconciliation

```
claimHash terms (9)   : contractVersion, recommendationKey, subject, actionFamily,
                        direction, thesisFamily, predicate, horizon, magnitude
unhashed fields (4)   : proposalRunId, proposalEventId, proposedAt, citedToolId
not a claim field     : originToolId (resolver constant, D4)
withdrawn             : lifecycleTerms
```

### Re-confirmation against the other three 2026-08-13 rulings

| Ruling | D1 as it now stands | Verdict |
|---|---|---|
| **P-015-01** — authored subject is prose; `resolvesTo` is the only machine field | `subject` is `{ kind, prose, resolvesTo, seriesRefs, weighting }`; `prose` retained verbatim so `recommendationKey` stays reproducible; resolution reads only `resolvesTo`; absent/empty ⇒ `no-authored-subject` | **Consistent — unchanged by this reconciliation.** The whole `subject` object is hashed, so `prose` is frozen alongside its machine field. |
| **P-015-02** — claim carries its own horizon; `authoredBand` recorded, non-authoritative, hashed | `horizon` is `{ kind, sessions, authoredBand, resolutionDate, eventRef }`; *Hashing Rules* hashes the whole object *"incl. sessions and authoredBand"*; `authoredBand` never derives `sessions` or `resolutionDate`; absent ⇒ `no-authored-horizon` | **Consistent — unchanged.** |
| **P-015-07** — session predicate is `regular !== null` | D1 declares no session predicate; it freezes `horizon.resolutionDate` as the HC-5 fence and `horizon.sessions` as the count. The predicate that steps sessions is D4-owned and reads `regular !== null` | **Consistent — no overlap, therefore no contradiction.** |

### Feature 002 remains untouched

The 2026-08-13 co-consent disposition holds unchanged: every ruling here is implementable entirely inside
Feature 015. `thesisFamily` stays in the already-proposed additive `action.claim` block and this
reconciliation adds nothing to that ask. `citedToolId` derives from `deepLink`, an authored field the
payload **already carries** (**verified this run**: 68 `deepLink` values present). No Feature 002 contract,
schema, or output is mutated, and no new Feature 002 ask is created.

### Routed to `bubbles.plan` — stale plan-owned statements

Design does not edit plan-owned files. The following statements in `scopes/` now contradict D1 and must be
refreshed by their owner. Each is a **factual contradiction with the design contract**, not a preference.

| # | File | Location | Stale statement | Required after this reconciliation |
|---|---|---|---|---|
| R1 | `scopes/01-frozen-claim-contract/scope.md` | step 1 | `subject` (`kind`, `id`, `seriesRef`) | `subject` (`kind`, `prose`, `resolvesTo`, `seriesRefs`, `weighting`) — P-015-01 |
| R2 | `scopes/01-frozen-claim-contract/scope.md` | step 1 | `horizon` (`kind`, `resolutionDate`, `eventRef`) | add `sessions` and `authoredBand` — P-015-02 |
| R3 | `scopes/01-frozen-claim-contract/scope.md` | step 1 | top-level field list omits `thesisFamily` and `citedToolId` | both are contract fields; `thesisFamily` hashed, `citedToolId` unhashed |
| R4 | `scopes/01-frozen-claim-contract/scope.md` | step 2 | *"Add the `lifecycleTerms` provenance block — `{ originToolId, thesisFamily }` … excluded from `claimHash`"* | **Withdrawn.** `thesisFamily` is top-level and hashed; `originToolId` is not a claim field; `citedToolId` replaces the deep-link source |
| R5 | `scopes/01-frozen-claim-contract/scope.md` | step 5 | `claimHash` over `{ contractVersion, recommendationKey, subject, actionFamily, direction, predicate, horizon, magnitude }` | insert `thesisFamily`; unhashed set is the four fields named above |
| R6 | `scopes/01-frozen-claim-contract/scope.md` | step 8 | four mint-refusal codes only (`non-semantic-subject`, `no-committed-series`, `unresolvable-owning-tool`, `neutral-direction-no-magnitude`) | add `no-authored-subject`, `no-authored-horizon`, `no-authored-thesis-family`, `no-authored-predicate` (D1: *"Every absence has its own reason code"*); retire or re-scope `unresolvable-owning-tool`, which no longer refuses a mint |
| R7 | `scopes/01-frozen-claim-contract/scope.md` | step 8 | `no-committed-series` bound to `subject.seriesRef` (singular) and to *"289 committed `data/bars/*.json`"* | field is `seriesRefs` (plural). The count is **293 today** (**verified this run**) — and per F-015-D5-02 no count literal may ship; derive it |
| R8 | `scopes/01-frozen-claim-contract/scope.md` | DoD lines re `lifecycleTerms` | *"`lifecycleTerms` is recorded on the object and excluded from `claimHash`"*; *"`thesisFamily` is declared on `lifecycleTerms`"*; *"its value source remains open pending routed finding P-015-03"* | P-015-03 is **RESOLVED**; restate against the hashed top-level field |
| R9 | `scopes/01-frozen-claim-contract/scope.md` | `T-01-U1`, `T-01-F2` | both assert that mutating `lifecycleTerms` leaves `claimHash` byte-identical | As written these **certify the collision** this reconciliation removes, and `T-01-U1` also contradicts step 7's `RTR-PREDICATE-AMEND` abort. Rewrite against `citedToolId` and the three provenance fields |
| R10 | `scopes/_index.md` | scope-01 row (owned surface) | *"the unhashed `lifecycleTerms` provenance block"* | replace with the unhashed `citedToolId` provenance field |
| R11 | `scopes/_index.md` | F-015-D4-01 disposition | *"`claimHash` term list is therefore unchanged and D1 needs no revisit"*; `originToolId` *"derived at mint from the authored action's `deepLink`"* | Both superseded. D1 **was** revisited here; `originToolId` is the `market-brief` constant (D4) and `deepLink` resolves `citedToolId` |
| R12 | `scopes/04-deterministic-outcome-resolver/scope.md` | reducer-bridge step | terms *"assembled from the claim's `lifecycleTerms`"* | assemble from the hashed `thesisFamily` / `subject` / `actionFamily` / `horizon` plus the `originToolId` constant |
| R13 | `scopes/08-power-view-and-charts/scope.md` | deep-link items | deep links derived from `lifecycleTerms.originToolId` | derive from `citedToolId`; handle `citedToolId === null` as "no deep link", not as an error |

No scope file was modified by this reconciliation.
