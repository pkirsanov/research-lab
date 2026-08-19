# Scope 05: Cohort and scoring model

**Status:** Not Started
**Depends On:** 02, 03, 04
**Tags:** `overlay:true`
**Design section:** `design.md` → `## D5 — Cohort And Scoring Model`
**Business Scenarios owned:** BS-005
**UI rows owned:** — (no rendered surface in this scope; scope 07 renders the model's output)
**Refusal codes owned:** `RTR-LEGACY-GROWTH`, `RTR-COHORT-MIX`

**Primary Outcome:**
The scoring model turns resolved outcomes into a track record **without introducing a single new statistic**. Three
module constants (`Z_SCORE`, `MIN_COHORT_RESOLVED`, `ANNUALIZATION`) are declared once and never appear as literals
at a call site. A cohort is a conjunction of **five closed levers** that may change *which* resolved claims are in
the set and may never change *what counts as a win*. Every displayed quantity is either a count 015 owns or a value
returned verbatim by a named `RLVALID` primitive — HC-1 holds because there is no code path that computes an
estimator, an interval, a mean, or a discount locally. The denominator is fixed by **`outcomeClass`, not closure
event**, which is what keeps HC-7 from being silently undone by a `resolved-flat` outcome that closed `satisfied`.
The empty branch is taken **before** any primitive call, so the honest empty state is structurally forced by the
primitives' own guards rather than chosen. The unresolvable-legacy count is **derived** from ledger rows lacking a
`claimRef`, asserted once into `briefs/history/record-start.json`, and guarded by `RTR-LEGACY-GROWTH` — no literal
ships anywhere.

**Boundary with the surrounding scopes.** Scope 03 owns the zero-free directional array and the `outcomeClass`
vocabulary; this scope **consumes** that array and never constructs its own from raw outcome values. Scope 07 owns
`compute(MODEL, state)`, the frozen `scorecard`, and every rendered element; this scope owns the *model* those
render against — the lever semantics, the primitive call sequence, the denominator, the sufficiency rule, the
bounds, and the multiplicity inputs. Nothing in this scope touches the DOM.

---

## Business Scenarios owned

### BS-005: Legacy anonymous rows are never back-filled

```gherkin
Scenario: Legacy anonymous rows are never back-filled (SCN-015-005)
  Given a ledger of pre-contract rows carrying only a one-way recommendation key
  When the track record is computed
  Then those rows are counted from the ledger at render time and reported as an explicit unresolvable-legacy count with an explanation
  And that count is never read from a hardcoded literal, because the population grows with every window until the contract lands
  And no outcome is imputed, estimated, or inferred for any of them
  And the track record's start date is stated plainly
```

---

## Implementation Plan

1. **Declare the three constants once, as frozen module constants** — `Z_SCORE = 1.96`, `MIN_COHORT_RESOLVED = 20`,
   `ANNUALIZATION = 252` (`design.md` → `## D5` → *Declared Constants*). Each is passed by name; none is written as
   a literal at a call site. `rlvWilsonInterval` takes `zScore` as a **required** argument and refuses a
   non-positive value with `RLV-WILSON-Z` (`rlvalidation.js#L114`, verified this planning run), so the constant is
   load-bearing rather than decorative. `Z_SCORE` is deliberately **not** a lever: a 90/95/99 selector would let a
   reader narrow the range by choosing a weaker guarantee.
2. **Implement the five-lever cohort model as a closed conjunction** — `leverCohort` (owning tool, from the
   resolution object's `lifecycleBinding`), `leverBucket` (the claim's stated confidence), `leverHorizon`
   (`claim.horizon.kind`), `leverFamily`, `leverWindow`. The lever set is closed: **a lever may only change which
   resolved claims are in the cohort, never what counts as a win.** Per the resolution of finding F-015-D5-01
   (`scopes/_index.md` → `## Resolution of design.md → ## D11 open questions`), `leverFamily` binds to
   `claim.actionFamily` — P7's *action type* and the Interaction Model's *claim family* name the same axis on live
   data — and **no sixth lever is added**.
3. **Build the directional array by routing, not by estimating.**
   `directional = [ r.outcomeValue for r in cohort if r.outcomeClass ∈ { win, loss } ]`, ordered by
   `(resolutionDate, claimHash)` so the array is deterministic and the NFR Determinism byte-identity claim is
   reachable. Selecting and ordering elements computes no number. **HC-7 is inherited, not re-derived:** the array
   is scope 03's zero-free array, every element finite and strictly non-zero *by construction*. This scope never
   constructs a directional array from raw values and **never passes a bare `0`** — `rlvSummarizeOutcomes` derives
   `unresolved = count − wins − losses` (`rlvalidation.js#L138`, verified) with wins `> 0` (`#L136`) and losses
   `< 0` (`#L137`), so an exact zero would be absorbed into `unresolved` and reported as a claim that was never
   resolved at all. A `resolved-flat` outcome contributes a **count** to this scope's own tallies and a **number**
   to nothing.
4. **Branch before calling anything.** Both primitives refuse an empty input — `rlvSummarizeOutcomes` fails
   `RLV-OUTCOME-VALUES` on `!outcomes.length` (`rlvalidation.js#L135`, verified) and `rlvWilsonInterval` fails
   `RLV-WILSON-COUNTS` for `total < 1` (`#L113`, verified). The `empty` branch is therefore taken **before** any
   primitive call; the honest empty state is structurally forced by the primitives' own guards, not chosen by copy.
5. **Call the primitives, and read the point estimate from exactly one of them.**
   `rlvSummarizeOutcomes(directional)` (`#L134`) yields `wins`, `losses`, `winRate`, `averageWin`, `averageLoss`,
   `mean`, `quantiles`; `rlvWilsonInterval(summary.wins, resolvedDirectional, Z_SCORE)` (`#L112`) yields
   `{ proportion, lower, upper, wins, total, zScore }` (return shape verified at `#L119`).
   **`summary.winRate` (`#L147`) and `interval.proportion` (`#L115`) are the same quantity** — both are
   `wins / total`. The model exposes the point estimate from **`interval.proportion` only**, so the point and the
   range provably originate in one call and cannot drift apart across a refactor. `summary.winRate` is read by
   nothing.
6. **Take the quantiles from the summary; make no second `rlvQuantiles` call.** `rlvSummarizeOutcomes` already
   calls `rlvQuantiles(outcomes, [0.25, 0.5, 0.75])` internally (`rlvalidation.js#L140`, verified) and returns the
   result as `quantiles` (`#L151`). A separate call for the same probabilities would be redundant rather than
   wrong — and redundancy is exactly where a second, subtly-different number gets born. `rlvQuantiles` is called
   directly **only** if a probability outside `[0.25, 0.5, 0.75]` is ever displayed.
7. **Treat the distribution histogram as counting, not estimating.** The bucket edges
   (`≤−3%`, `−2%`, `−1%`, `flat`, `+1%`, `+2%`, `+3%`, `>+3%`) are declared bin edges; tallying members into
   declared bins is not a statistic and needs no primitive. The `flat` column is populated from
   `outcomeClass === "resolved-flat"`, which is the whole reason scope 03's sentinel exists.
8. **Leave three primitives deliberately unused, and assert that they are.**
   `rlvAdjustBenjaminiHochberg` (`#L63`) and `rlvAdjustHolm` (`#L76`) both take a **vector of p-values**; 015
   produces none. Manufacturing one per cohort — from a binomial test, say — would be inventing an estimator, a
   direct HC-1 violation arriving dressed as a correction for overfitting. `rlvBuildPurgedFolds` (`#L45`) is
   likewise unused: 015 fits and selects nothing, so there is no train/test boundary to purge or embargo. Two of
   the seven primitives being unused is a correct outcome; wiring them in to look thorough would be the failure.
9. **Build the deflated-Sharpe input with its guards in front of it, not behind it.** The curve is a cumulative
   product over the cohort's outcomes ordered by resolution date —
   `curve[0] = 1; curve[i] = curve[i−1] × (1 + directional[i−1] / 100)`. The primitive requires **≥ 20 finite,
   strictly positive** observations (`RLV-DSR-CURVE`, `#L88`), an integer `trialCount ≥ 1` (`RLV-DSR-TRIALS`,
   `#L89`), a positive finite `annualization` (`RLV-DSR-ANNUALIZATION`, `#L90`) and **≥ 8** derived returns
   (`RLV-DSR-RETURNS`, `#L93`) — all verified this planning run. When `resolvedDirectional < 20` **or** any
   `1 + outcome/100 ≤ 0`, the panel renders `—` with a stated reason and **the primitive is not called**. Per
   RL-007 both figures are labelled *directional evidence of overfitting, not a significance test*, with the stated
   reason that recommendation outcomes are not an equity curve.
10. **Fix the denominator by `outcomeClass`, never by closure event.**
    `denominator = resolvedDirectional = |{ outcomeClass ∈ { win, loss } }|`. Scope 03 established that `winRate`
    divides by the fed array's length (`rlvalidation.js#L147`), so the fed array's composition **is** the published
    denominator. The distinction from closure event is not cosmetic: scope 04 established that a `resolved-flat`
    outcome also closes `satisfied` or `invalidated`, so a closure-event denominator would pull flat outcomes back
    into the rate and silently undo HC-7. `resolved-flat`, `unresolved`, `not-evaluable`, `withdrawn`, open, and
    `unresolvable-legacy` are each **excluded from the rate and visibly counted** — excluded is not hidden.
11. **Re-assert the partition at cohort scope.**
    `resolvedDirectional + flat + unresolved + notEvaluable + withdrawn + open + unresolvableLegacy === totalProposed`
    is a committed assertion, not a comment. Scope 03 asserts it over the resolution store; this scope asserts it
    over **each computed cohort**, because a lever that drops a class from the accounting is precisely how a
    denominator gets quietly flattered.
12. **Compute the withdrawal bounds through the same primitive at both arithmetic extremes.**
    `pessimistic = rlvWilsonInterval(wins, resolvedDirectional + withdrawn, Z_SCORE).proportion` and
    `optimistic = rlvWilsonInterval(wins + withdrawn, resolvedDirectional + withdrawn, Z_SCORE).proportion`. Only
    `.proportion` is read; `.lower` / `.upper` are deliberately **not** read, because a bound is an arithmetic
    extreme and not an interval, and rendering an interval around a bound would invite it to be read as an
    estimate. The primitive is called rather than dividing locally so the integer-count guard runs and no division
    appears in 015 source.
    **Planning-added guard (see routed finding P-015-08).** `design.md` → `## D5` asserts *"Both satisfy the
    primitive's integer-count guard (`wins ≤ total`, `total ≥ 1`)"*. Verified at `rlvalidation.js#L113`, that is
    false at one boundary: when `resolvedDirectional === 0` **and** `withdrawn === 0`, `total === 0` and the
    primitive refuses `RLV-WILSON-COUNTS`. The bounds are therefore computed **only** when
    `resolvedDirectional + withdrawn ≥ 1`, and are `null` otherwise — reached by the `empty` branch in practice,
    but gated explicitly rather than relied upon.
13. **Implement the three-state sufficiency rule** — `empty` at `resolvedDirectional === 0` (no primitive called,
    no rate, no range); `insufficient` at `1 … MIN_COHORT_RESOLVED − 1` (no rate claimed, **the range is still
    computed and still drawn**, wider, with a countdown to the minimum); `sufficient` at `≥ MIN_COHORT_RESOLVED`.
    Suppressing the range in the `insufficient` state would teach a reader that a missing range means "not
    applicable" rather than "very uncertain" — the opposite of the intended lesson, and the exact misreading
    BP-015-003 exists to prevent.
14. **Implement `RTR-COHORT-MIX`.** Every rate this model emits carries its **cohort label** and its **sample
    count** in the same block. A rate produced without both refuses with the exact code. This is the model-side
    half of HC-8; scope 06 applies `RTR-RATE-BARE` to the generated `read` string and scope 07 applies it at the
    DOM level through a single rate-emitting helper.
15. **Derive the unresolvable-legacy count; never author it (HC-4).**
    `unresolvableLegacy = |{ ledger rows with no claimRef }|`, computed at render time. This is self-describing —
    a legacy row is exactly a row written before scope 02's `v2`, and absence of `claimRef` *is* the marker. The
    live ledger row shape was verified this planning run to be a seven-key `brief-recommendation-history-row/v1`
    object with no `claimRef` field at all, so the predicate is a presence test and not a value comparison.
    **No count is carried into this scope, any fixture, any test name, or any DoD item as a literal** — the
    population grows with every published window, and a baked-in constant on a surface whose entire purpose is not
    putting stale numbers on surfaces is itself the violation HC-4 names.
16. **Assert the count once, at activation, and guard it thereafter.** The resolver writes one committed object,
    `briefs/history/record-start.json`, carrying
    `{ recordStartDate, unresolvableLegacyRowCount, unresolvableLegacyKeyCount, lastLegacyEventId }`. It is written
    **once** and never updated. After activation the derived count must equal the asserted count; growth means the
    publisher emitted a claimless row after the contract went live — a regression that would silently expand the
    unscoreable bucket — and it refuses with **`RTR-LEGACY-GROWTH`**. `recordStartDate` is displayed in **every**
    state including `empty` and `insufficient`, and **no cohort lever can alter it**, because no selection over
    resolved claims can change how many unresolved-by-construction rows exist.
17. **Derive the multiplicity inputs, and keep the two counts distinct.** `familyCount` is the number of distinct
    `recommendationKey` values among proposed rows in the evaluation window; `trialCount = familyCount` — the size
    of the **selection surface**, not the resolved count. Feeding `rlvDeflatedSharpe` the number of resolved trials
    would understate the discount, which is the direction of error that flatters the record. Both numbers are
    exposed and labelled so the choice is inspectable. **Windowing is by proposal date** (see routed finding
    P-015-09): a family that was tried but has not resolved is still a trial, and windowing the selection surface
    by resolution date would silently drop exactly those.
18. **Use `Number.isFinite` exclusively.** `rlvSummarizeOutcomes` returns `averageWin: null` for a cohort with no
    wins and `averageLoss: null` for one with no losses (`rlvalidation.js#L148`, `#L149`, verified), and the global
    `isFinite(null) === true` would pass the guard and throw on `.toFixed()`.
19. **Extend the fixture substrate** at `tests/fixtures/recommendation-track-record/cohorts/**` with resolution sets
    covering each sufficiency boundary, each excluded class, a lever tuple that empties the cohort, a
    closure-event-vs-outcome-class divergence, a withdrawn-bearing cohort, a cohort whose curve contains a
    `1 + outcome/100 ≤ 0` observation, and a ledger slice whose claimless-row count differs from the asserted one.
    Every fixture carries explicit dates and no fixture reads a clock.
20. **Extend `tests/recommendation-track-record.unit.mjs`, `.functional.mjs` and `.integration.mjs`** with this
    scope's named cases. Existing files are extended, never rewritten.

---

## Change Boundary

`design.md` → `## D5` asks for one property that is dangerously easy to satisfy by editing the wrong thing: the point
estimate and its range must *"provably originate in one call and cannot drift apart across a refactor"*. That
property is obtained here by **authoring** the model to read `interval.proportion` only — never by editing an
existing call site, and never by consolidating some rate helper that already exists elsewhere in the repo. This
scope is additive model work layered over `RLVALID`, and the boundary below is what keeps it that way.

**Allowed file families** — the only families this scope may create or modify:

| Family | Nature of the change |
|---|---|
| The 015-owned cohort and scoring model module | New file. The three constants, the five-lever conjunction, the primitive call sequence, the denominator, the sufficiency rule, the withdrawal bounds and the multiplicity inputs. |
| `briefs/history/record-start.json` | New file, written exactly once at activation and never updated thereafter. |
| `tests/recommendation-track-record.unit.mjs`, `.functional.mjs`, `.integration.mjs`, `.e2e.mjs` | **Extended** with this scope's named cases. Existing cases are neither edited nor reordered. |
| `tests/fixtures/recommendation-track-record/cohorts/**` | New inputs, one rule violated per negative input, explicit dates on every input, no clock read. |
| `specs/015-recommendation-outcome-ledger-and-track-record/scopes/05-cohort-and-scoring-model/**` and this scope's sections of `report.md` | The planning and evidence artifacts this scope owns. |

**Excluded surfaces** — byte-untouched, no exceptions. A change any of these appears to need is routed to its owner,
never made here:

| Surface | Why it is out of bounds |
|---|---|
| `rlvalidation.js` | **Feature 007-owned, consumed READ-ONLY.** `spec.md` HC-1 forbids re-implementing, forking, or shadowing any statistic. The module freezes its export surface and deep-freezes every result, so there is no monkey-patch seam even if one were wanted: no wrapper that recomputes, no local estimator, no local interval, no local mean, no local discount. A needed change is a routed packet to Feature 007. |
| `rlcontracts.js` | **Feature 002-owned, consumed READ-ONLY.** `reduceRecommendationEvents` and `CLOSE_EVENT_TYPES` are read to report the closure mix; the reducer is never forked and the closure vocabulary is never extended. |
| The persisted `rldata.js` cache schema | **Feature 013-protected (FR-021, AC-012).** This scope persists nothing: no derived statistic reaches any cache and no key is created. Rates, ranges, counts and bounds recompute from the ledger on every load. |
| The Market Action Center four-view composition | **Feature 012-owned (`RLMKT-VIEW`).** No `viewOrder`, `views` or `viewState` write and no view id declaration. HC-3 holds by non-participation. |
| `scripts/selftest.mjs` and the three committed sibling validators | The baseline and its validators belong to the repo. This scope adds no import and edits no assertion; wiring a validator in is scope 09's single named change. |
| `scripts/brief-resolve-outcomes.mjs`, `briefs/objects/**`, every committed `briefs/history/**/*.jsonl` byte | Scopes 01, 02 and 04. This scope reads resolution objects and ledger rows; it evaluates no predicate and emits no closure. |
| `recommendation-track-record-lab.html`, `compute()`, `renderSimple`, `renderPower` | Scopes 07 and 08. This scope owns the model, not the page: it writes no DOM and creates no HTML file. |
| `buildOwnerRead`, `buildMetrics`, `RLDATA.putToolRead` | Scope 06. This scope produces the scorecard inputs and publishes none of them. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json`, `simple-models.json` | Counted registries — scope 10 only. |
| Every other `scopes/NN-*/` directory and every other `specs/**` directory | Owned by sibling scopes and by concurrent sessions. |

**Collateral cleanup is opt-in, never implicit.** `T-05-I1` traces every numeric field the model exposes, which
means it will read code this scope does not own. A duplicate rate path, an unused primitive, or a stale guard found
in a **non-015** file is recorded and routed — it is not corrected inside this change. Bundling an unrelated
correction in here would make `T-05-R2`'s claim that *every other `rlvalidation.js` consumer is unaffected*
unprovable, because the change set would no longer have a single purpose to reason about.

---

## Test Plan

Every negative row asserts the **exact** refusal string plus its companion field, and every row uses at least one
input a permissive implementation would have accepted. `T-05-F2` and `T-05-F4` are the rows that fail if the
denominator is ever re-keyed to closure event or the legacy count is ever frozen into source.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-05-U1 | Unit | `unit` | BS-005 | `tests/recommendation-track-record.unit.mjs` | `Z_SCORE`, `MIN_COHORT_RESOLVED` and `ANNUALIZATION` are frozen module constants passed by name, and a source scan finds **zero** occurrences of `1.96`, `20` or `252` as a literal argument at any `RLVALID` call site. An implementation that inlines the z-score fails this row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-05-u1` |
| T-05-U2 | Unit | `unit` | BS-005 | `tests/recommendation-track-record.unit.mjs` | The five-lever conjunction selects the correct subset for every lever tuple over a mixed fixture, `leverFamily` binds to `claim.actionFamily`, and **no sixth lever exists**. The win test is asserted **invariant across every lever tuple** — a lever may change cohort membership and may never change what counts as a win. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-05-u2` |
| T-05-U3 | Unit | `unit` | BS-005 | `tests/recommendation-track-record.unit.mjs` | The directional array is scope 03's zero-free array consumed verbatim: every element is finite and strictly non-zero, the ordering is `(resolutionDate, claimHash)`, and a `resolved-flat` outcome contributes a count and **never a number**. Injecting a bare `0` fires `RTR-FLAT-ZERO` with its exact code, proving HC-7 is inherited rather than re-derived. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-05-u3` |
| T-05-U4 | Unit | `unit` | BS-005 | `tests/recommendation-track-record.unit.mjs` | The point estimate is sourced from `interval.proportion` **only**: the model exposes exactly one point-estimate field, it is `=== interval.proportion`, and a source scan finds **zero** reads of `summary.winRate` anywhere on the model's output path. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-05-u4` |
| T-05-U5 | Unit | `unit` | BS-005 | `tests/recommendation-track-record.unit.mjs` | Quantiles are read from `summary.quantiles` (`rlvalidation.js#L151`) and a source scan finds **zero** direct `rlvQuantiles` calls in the scorer, since `rlvSummarizeOutcomes` already calls it internally at `[0.25, 0.5, 0.75]` (`#L140`). A second call for the same probabilities fails the row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-05-u5` |
| T-05-U6 | Unit | `unit` | BS-005 | `tests/recommendation-track-record.unit.mjs` | `rlvAdjustBenjaminiHochberg`, `rlvAdjustHolm` and `rlvBuildPurgedFolds` are **never called**, and no p-value is constructed anywhere in 015 source — asserted by a source scan for `pValue`/`p_value`/`pvalues` plus a call-site scan for the three primitive names. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-05-u6` |
| T-05-U7 | Unit | `unit` | BS-005, BS-006 | `tests/recommendation-track-record.unit.mjs` | The sufficiency rule is exact at all four boundaries: `n = 0` → `empty`, `n = 1` → `insufficient`, `n = MIN_COHORT_RESOLVED − 1` → `insufficient`, `n = MIN_COHORT_RESOLVED` → `sufficient`. An off-by-one at the minimum fails the row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-05-u7` |
| T-05-F1 | Functional | `functional` | BS-005, BS-006 | `tests/recommendation-track-record.functional.mjs` | The `empty` branch is taken **before** any primitive call, asserted by proving both primitives *would have refused* the empty input — `rlvSummarizeOutcomes` returning `RLV-OUTCOME-VALUES` and `rlvWilsonInterval` returning `RLV-WILSON-COUNTS` — while the model itself called neither. In the `insufficient` state the range **is** computed and non-`null`. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f1` |
| T-05-F2 | Functional | `functional` | BS-005 | `tests/recommendation-track-record.functional.mjs` | The denominator is keyed by `outcomeClass`, never by closure event, on a fixture built so the two disagree: a `resolved-flat` outcome that closed `satisfied` is **excluded** from `resolvedDirectional`. A closure-event-keyed implementation produces a larger denominator and fails the row, which is HC-7 being silently undone. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f2` |
| T-05-F3 | Functional | `functional` | BS-005 | `tests/recommendation-track-record.functional.mjs` | The partition identity holds **per cohort** across every lever tuple, and deliberately dropping one excluded class from a cohort's accounting makes the assertion fail — so the identity is load-bearing rather than decorative. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f3` |
| T-05-F4 | Functional | `functional` | BS-005 | `tests/recommendation-track-record.functional.mjs` | The unresolvable-legacy count is **derived** by counting rows lacking a `claimRef`: growing the fixture ledger by one claimless row changes the reported count, and a source scan finds **no numeric literal** used as the count anywhere in 015-authored source. A hardcoded figure fails both halves. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f4` |
| T-05-F5 | Functional | `functional` | BS-005 | `tests/recommendation-track-record.functional.mjs` | `RTR-LEGACY-GROWTH` fires with its exact code when the derived count exceeds the count asserted in `briefs/history/record-start.json`; `record-start.json` is written **exactly once** and a second activation attempt does not update it; and no outcome is imputed, estimated, or inferred for any legacy row on any path. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f5` |
| T-05-F6 | Functional | `functional` | BS-005 | `tests/recommendation-track-record.functional.mjs` | `recordStartDate` is present in **every** sufficiency state including `empty` and `insufficient`, and is **unchanged by every one of the five levers** across the full lever cross-product — no selection over resolved claims can alter how many unresolved-by-construction rows exist. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f6` |
| T-05-F7 | Functional | `functional` | BS-005, BS-006 | `tests/recommendation-track-record.functional.mjs` | `RTR-COHORT-MIX` fires with its exact code when a rate is produced without its cohort label **or** without its sample count — both single-omission cases asserted separately, so an implementation that carries only one of the two fails. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f7` |
| T-05-F8 | Functional | `functional` | BS-005 | `tests/recommendation-track-record.functional.mjs` | Withdrawal bounds route through `rlvWilsonInterval` at both arithmetic extremes reading `.proportion` only; `pessimistic ≤ pointEstimate ≤ optimistic` holds; `.lower`/`.upper` are never read for a bound; and **the bounds are `null` when `resolvedDirectional + withdrawn === 0`** rather than calling the primitive and taking `RLV-WILSON-COUNTS` (routed finding P-015-08). | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f8` |
| T-05-F9 | Functional | `functional` | BS-005 | `tests/recommendation-track-record.functional.mjs` | The deflated-Sharpe guards run **in front of** the call: with `resolvedDirectional < 20`, or with any observation making `1 + outcome/100 ≤ 0`, the panel value is `—` with a stated reason and the primitive is **not called**; when it is called the curve satisfies `RLV-DSR-CURVE` (≥ 20 finite positive) and yields `RLV-DSR-RETURNS`-satisfying (≥ 8) returns. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f9` |
| T-05-F10 | Functional | `functional` | BS-005, BS-011 | `tests/recommendation-track-record.functional.mjs` | `trialCount === familyCount` (the selection surface) and **not** `resolvedDirectional`; both counts are exposed separately; the window is applied by **proposal** date so a tried-but-unresolved family still counts as a trial; and substituting the resolved count is asserted to produce a **smaller** discount, proving the choice is the conservative one. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-05-f10` |
| T-05-I1 | Integration | `integration` | BS-005, BS-006 | `tests/recommendation-track-record.integration.mjs` | Over a fixture resolution store and ledger slice, **every numeric field the model exposes** is enumerated and traced field-by-field to either a named `RLVALID` primitive result or an 015-owned count — the HC-1 obligation asserted exhaustively rather than by sampling. An unaccounted-for numeric field fails the row. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-05-i1` |
| T-05-I2 | Integration | `integration` | BS-005 | `tests/recommendation-track-record.integration.mjs` | Determinism: the same resolution store and ledger slice produce a **byte-identical** serialized model output across repeat runs and across two different insertion orders of the same resolution set, proving the `(resolutionDate, claimHash)` ordering is what makes NFR Determinism reachable. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-05-i2` |
| T-05-R1 | Regression E2E | `e2e` | BS-005 (SCN-015-005) | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for SCN-015-005.** A full scoring pass over a fixture ledger carrying both claim-bearing and legacy claimless rows re-asserts end to end that no legacy row is ever back-filled: the unresolvable-legacy count is derived by counting rows lacking a `claimRef` and moves when the fixture grows, `RTR-LEGACY-GROWTH` fires when the derived count exceeds the count asserted in `record-start.json`, `recordStartDate` survives every lever tuple unchanged, and no outcome is imputed on any path. The row is permanent, so a later scope that estimates or infers a legacy outcome to grow the denominator fails here. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-05-r1` |
| T-05-R2 | Regression E2E | `e2e` | BS-005 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the constants, the cohort model and the write-once `briefs/history/record-start.json` land, with no pre-existing test removed, skipped, or newly failing — the proof that consuming `rlvalidation.js` read-only left every other primitive consumer in the repo unaffected. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-05-r2` |
| T-05-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the constants, the cohort model, the fixtures and the test cases land, at `baseline + N passed, 0 failed`, where `baseline` is the total captured immediately before this scope's first change and recorded in `report.md`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-05-s1` |

**Test Plan rows: 22.**

---

### Definition of Done

#### Core items

- [ ] `Z_SCORE`, `MIN_COHORT_RESOLVED` and `ANNUALIZATION` are frozen module constants declared once; no literal `1.96`, `20` or `252` appears as an argument at any `RLVALID` call site.
- [ ] The cohort is a closed conjunction of exactly five levers; `leverFamily` binds to `claim.actionFamily` per the F-015-D5-01 resolution; no sixth lever is added.
- [ ] A lever changes only **which** resolved claims are in the cohort; the win test is invariant across every lever tuple.
- [ ] The directional array is scope 03's zero-free array consumed verbatim, ordered by `(resolutionDate, claimHash)`; this scope constructs no array of its own and **never passes a bare `0`** to `rlvSummarizeOutcomes` (HC-7).
- [ ] The `empty` branch is taken **before** any primitive call; neither `rlvSummarizeOutcomes` nor `rlvWilsonInterval` is invoked on an empty cohort.
- [ ] The point estimate is read from `interval.proportion` only; `summary.winRate` is read by nothing.
- [ ] Quantiles are read from `summary.quantiles`; no direct `rlvQuantiles` call is made for `[0.25, 0.5, 0.75]`.
- [ ] `rlvAdjustBenjaminiHochberg`, `rlvAdjustHolm` and `rlvBuildPurgedFolds` are never called and no p-value is constructed anywhere in 015 source.
- [ ] The deflated-Sharpe guards run in front of the call: `resolvedDirectional < 20` or any `1 + outcome/100 ≤ 0` renders `—` with a stated reason and does not call the primitive; both figures are labelled directional evidence of overfitting, not a significance test (RL-007).
- [ ] `denominator = resolvedDirectional = |{ outcomeClass ∈ { win, loss } }|`, keyed by `outcomeClass` and never by closure event; every excluded class is visibly counted.
- [ ] The partition identity is asserted **per cohort** across every lever tuple, not only over the resolution store.
- [ ] Withdrawal bounds route through `rlvWilsonInterval` at both arithmetic extremes reading `.proportion` only, are rendered as static labelled bounds and never as a lever, and are `null` when `resolvedDirectional + withdrawn === 0` (routed finding P-015-08).
- [ ] The three-state sufficiency rule is implemented with the range **still computed** in the `insufficient` state.
- [ ] `RTR-COHORT-MIX` is implemented and refuses a rate produced without its cohort label or without its sample count.
- [ ] The unresolvable-legacy count is **derived** from ledger rows lacking a `claimRef` at render time; **no numeric literal for it appears in any 015-authored source, fixture, test name, or DoD item** (HC-4).
- [ ] `briefs/history/record-start.json` is written exactly once at activation and never updated; `RTR-LEGACY-GROWTH` fires when the derived count exceeds the asserted one.
- [ ] `recordStartDate` is present in every sufficiency state and is unalterable by every lever.
- [ ] No outcome is imputed, estimated, or inferred for any legacy row on any path.
- [ ] `trialCount === familyCount` (the selection surface), windowed by proposal date; the resolved count is displayed beside it and never substituted for it.
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code.
- [ ] No new statistic, estimator, interval, mean, or discount is written in this scope; `rlvalidation.js` is consumed read-only and is byte-unmodified.
- [ ] This scope renders nothing: it writes no DOM, imports no shared-shell UI module, and does not create `recommendation-track-record-lab.html`.
- [ ] Change Boundary is respected and zero excluded file families were changed — `rlvalidation.js`, `rlcontracts.js`, the persisted `rldata.js` cache schema, the Center four-view composition, `scripts/selftest.mjs`, the three committed sibling validators, `scripts/brief-resolve-outcomes.mjs`, every committed `briefs/**` and `data/**` byte, and every counted registry are byte-identical at the end of the scope, verified by `git status --porcelain` diffed against the allowed-family list with the raw output recorded in `report.md`; any finding in a non-015 file is routed rather than corrected here.

#### Test items

- [ ] [T-05-U1] The three constants are module-level and no literal appears at an `RLVALID` call site → evidence recorded in `report.md#t-05-u1`.
- [ ] [T-05-U2] The five-lever conjunction selects correctly and the win test is invariant across every lever tuple → evidence recorded in `report.md#t-05-u2`.
- [ ] [T-05-U3] The directional array is zero-free and consumed verbatim; a bare `0` fires `RTR-FLAT-ZERO` → evidence recorded in `report.md#t-05-u3`.
- [ ] [T-05-U4] The point estimate comes from `interval.proportion` only and `summary.winRate` is read by nothing → evidence recorded in `report.md#t-05-u4`.
- [ ] [T-05-U5] Quantiles come from `summary.quantiles` with zero direct `rlvQuantiles` calls → evidence recorded in `report.md#t-05-u5`.
- [ ] [T-05-U6] The three unused primitives are never called and no p-value is constructed → evidence recorded in `report.md#t-05-u6`.
- [ ] [T-05-U7] The sufficiency rule is exact at `n = 0`, `1`, `MIN − 1` and `MIN` → evidence recorded in `report.md#t-05-u7`.
- [ ] [T-05-F1] The empty branch precedes any primitive call, proven by showing both primitives would have refused → evidence recorded in `report.md#t-05-f1`.
- [ ] [T-05-F2] The denominator is keyed by `outcomeClass` on a fixture where closure event and class disagree → evidence recorded in `report.md#t-05-f2`.
- [ ] [T-05-F3] The partition identity holds per cohort and fails when a class is dropped → evidence recorded in `report.md#t-05-f3`.
- [ ] [T-05-F4] The legacy count is derived and no literal appears in source → evidence recorded in `report.md#t-05-f4`. — proves SCN-015-005
- [ ] [T-05-F5] `RTR-LEGACY-GROWTH` fires on drift and `record-start.json` is write-once → evidence recorded in `report.md#t-05-f5`.
- [ ] [T-05-F6] `recordStartDate` is present in every state and unchanged by every lever → evidence recorded in `report.md#t-05-f6`.
- [ ] [T-05-F7] `RTR-COHORT-MIX` fires for a missing cohort label and for a missing sample count, asserted separately → evidence recorded in `report.md#t-05-f7`.
- [ ] [T-05-F8] Withdrawal bounds use `.proportion` only, bracket the point estimate, and are `null` at the zero-total boundary → evidence recorded in `report.md#t-05-f8`.
- [ ] [T-05-F9] The deflated-Sharpe guards precede the call and the curve satisfies the primitive's own guards when it is called → evidence recorded in `report.md#t-05-f9`.
- [ ] [T-05-F10] `trialCount === familyCount`, windowed by proposal date, with the resolved count displayed beside it → evidence recorded in `report.md#t-05-f10`.
- [ ] [T-05-I1] Every numeric field traces exhaustively to a named `RLVALID` primitive or an 015-owned count → evidence recorded in `report.md#t-05-i1`.
- [ ] [T-05-I2] Model output is byte-identical across repeat runs and across two insertion orders → evidence recorded in `report.md#t-05-i2`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-05-R1] the derived legacy count, `RTR-LEGACY-GROWTH`, the lever-invariant `recordStartDate`, and the no-imputation rule all re-assert end to end over a mixed fixture ledger → evidence recorded in `report.md#t-05-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-05-R2] the committed Node E2E files and the whole committed Playwright spec suite are green, proving every other `rlvalidation.js` primitive consumer is unaffected → evidence recorded in `report.md#t-05-r2`.
- [ ] [T-05-S1] `node scripts/selftest.mjs` reports `baseline + N passed, 0 failed` against the scope-start baseline captured in `report.md`, with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-05-s1`.

**Test-related DoD items: 22. Test Plan rows: 22. Parity confirmed.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `rlvalidation.js` and `rlcontracts.js` byte-unmodified; no committed `briefs/history/**/*.jsonl` byte modified; `spec.md`, `design.md` and `scopes/_index.md` unmodified by this scope; no other scope directory and no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlvalidation.js` | **Feature 007-owned, consume-only.** The module freezes its own export surface and deep-freezes every result, so there is no monkey-patch seam even if one were wanted. All seven primitives are consumed unchanged; three are deliberately unused. A needed change is a routed packet to Feature 007, never a local patch. |
| `rlcontracts.js` reducer and `CLOSE_EVENT_TYPES` | **Feature 002-owned, consume-only.** This scope reads closure events to report the closure mix and never emits one, never forks `reduceRecommendationEvents`, and never extends the closure vocabulary. Note the boundary the denominator draws: the closure event is read for **display**, and the denominator is keyed by `outcomeClass` instead. |
| The persisted `rldata.js` cache schema | **Feature 013-protected (FR-021, AC-012).** This scope persists nothing. No derived statistic is written to any cache; rates, ranges, counts and bounds recompute from the ledger on every load. |
| The Market Action Center four-view composition | **Feature 012-owned (`RLMKT-VIEW`).** This scope writes no Center `viewOrder`, `views`, or `viewState`, and declares no view id. HC-3 holds by non-participation. |
| `scripts/brief-resolve-outcomes.mjs` | Scope 04. This scope consumes resolution objects; it never evaluates a predicate, selects a due set, or emits a closure. |
| `briefs/objects/claims/**`, `briefs/objects/resolutions/**` | Append-only, scope 01- and scope 04-owned. This scope **reads** them; it never writes, amends, or deletes one. |
| Any committed `briefs/history/**/*.jsonl` byte | The ledger is append-only and is scope 02's surface. The legacy count is derived by **reading** it. |
| `recommendation-track-record-lab.html`, `renderSimple`, `renderPower`, `compute()` | Scopes 07 and 08. This scope owns the model, not the page. It writes no DOM and creates no HTML file. |
| `buildOwnerRead`, `buildMetrics`, `RLDATA.putToolRead` | Scope 06. This scope produces the scorecard inputs; it does not publish them. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json`, `simple-models.json` | Counted registries. Scope 10 only. |
| `scripts/validate-recommendation-track-record.mjs` | The consolidated validator is scope 09; this scope's two codes are proven by `node --test`. |
| Any other `scopes/NN-*/` directory in this feature | Each scope owns its own directory. This scope writes only `scopes/05-cohort-and-scoring-model/`. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
