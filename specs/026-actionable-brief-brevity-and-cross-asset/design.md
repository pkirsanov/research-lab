# Feature 026 — Actionable Brief Brevity and Cross-Asset Coverage — Design

**Owner artifact:** design.md. **Upstream:** [spec.md](spec.md).
**Educational only — not investment advice.**

---

## Design Brief

**Current State.** The cockpit publishes four times a day through
[scripts/brief-refresh.mjs](../../scripts/brief-refresh.mjs) (Tier A) and
[scripts/brief-refresh-and-push.sh](../../scripts/brief-refresh-and-push.sh)
(Tier B). The committed payload carries 127,740 characters of narrative across
18 top-level keys, re-derived in this pass and matching the specification
exactly. Nothing on the publication path measures output size.
[scripts/validate-brief-payload.mjs](../../scripts/validate-brief-payload.mjs)
enforces a per-field contract and names no cross-asset field. The pipeline
computes ten cross-asset drivers on line 1288 of `brief-refresh.mjs` and
consumes them only as scoring input to four real-asset model calls on the lines
that follow. The only horizon it computes is `ret63`. The compact memory row
`brief-history-recent-row/v1` carries a single benchmark and no record of what
the run itself claimed. The decision list is structurally dead for reasons that
belong to [BUG-009](../_bugs/BUG-009-decision-attention-gate-result-producer-absent/),
whose remedy is an unmade owner decision.

**Target State.** One committed budget policy, one measurement function, one
fail-closed refusal on the publication path. A required four-leg cross-asset
block measured over five trading sessions from instruments the repository
already commits. A first-class dark state for any leg that cannot resolve. A
change-gated default view whose unchanged remainder is a counted line. A memory
row that carries the readings, the tracked states and the run's own claims. A
track-record line that publishes what the evaluator already computes.

**Patterns to Follow.**

- UMD module shape from [rlattention.js](../../rlattention.js) and
  [rlbrief.js](../../rlbrief.js). ES5-flavoured top-level `function`
  declarations inside a factory, a frozen API, `module.exports` under Node and a
  global in the browser. `extractFn` in
  [scripts/selftest.mjs](../../scripts/selftest.mjs) line 46 extracts by regex
  and brace matching, so an arrow-const helper is unreachable to the selftest.
- Node consumption of a UMD module through `createRequire`, exactly as
  [scripts/validate-brief-payload.mjs](../../scripts/validate-brief-payload.mjs)
  lines 17 and 18 already require `rlattention.js` and `rlagenda.js`. That is
  what lets one definition serve both the browser and the validator.
- Owning-tool function loading through `loadToolFunctions` in
  [scripts/brief-refresh.mjs](../../scripts/brief-refresh.mjs) line 943, which
  `buildRealAssetsToolRead` already uses to reach `realTrailingPct` and
  `realRatioTrailingPct` inside
  [real-assets-lab.html](../../real-assets-lab.html) lines 1032 and 1258.
- Error accumulation from `validateBriefPayload`. It pushes every violation into
  one `errors[]` and reports them together, which is what BS-026-007's "every
  violation is named, not just the first" already requires and already gets.
- Three-state publication geometry from the bond card, `notes/market-brief.md`
  §12c. One geometry, a token plus a word, a reason line, nothing substituted.
- Persistence testing through `consecutiveRun` and `isPersistentSignal` in
  [rlbrief.js](../../rlbrief.js) lines 144 and 151, which already implement the
  §6c gate and already carry selftest coverage.
- Compact projection from `compactRow` in
  [scripts/shard-brief-history.mjs](../../scripts/shard-brief-history.mjs) line
  44, extended additively rather than replaced.

**Patterns to Avoid.**

- Adding a content check to the `validateBriefPayload` **library** path that the
  currently committed payload fails. The file's own comment at lines 366 to 379
  records the measurement: doing that for `dataAsOf.labels` moved the node suite
  from 848 pass / 25 fail to 842 / 31, because six unrelated suites began
  reporting a payload-content problem instead of their own subject. This design
  gates the budget on the payload's declared contract version instead.
- A second trailing-return function. `realTrailingPct` exists, is selftested,
  and is already the source of every driver. P19 forbids a sibling.
- A second tracked-instrument list. [watchlist.json](../../watchlist.json)
  already declares twelve items and is already the brief's tracked set.
- A second minimum-sample constant. `scorecard-policy/v1.minResolvedSample` is
  already 20 in [market-brief.config.json](../../market-brief.config.json) and
  is already enforced by `build-scorecard.mjs`.
- Treating the absence of `market-brief.payload.json` from the `tier-a.yml`
  `git add` list as a defect. Tier A generates no narrative payload, so the
  omission is correct. See the Rejected Findings section.
- Selecting a BUG-009 remedy. Every surface here behaves correctly whether the
  attention feed ever produces an item or not.

**Resolved Decisions.**

- One new UMD module, `rlcockpit.js`, owns every pure function this feature
  adds. The name is free: no `rlcockpit.js` exists among the 44 root `rl*.js`
  modules.
- One new committed policy block, `output-budget/v1`, inside the existing
  `market-brief.config.json`. No new config file.
- Four required legs. Rates, dollar, energy, credit. Each is a slot that
  resolves to a reading or raises a dark state.
- Five trading sessions is the short horizon.
- The payload contract version becomes the budget's hard cutover.
- The tracked set is `watchlist.json`. The change vocabulary is closed and lives
  in `rlcockpit.js`.

**Open Questions.**

- Whether the owner ratifies the amended wording of FR-026-013 (D1).
- Whether the credit leg publishes a labelled proxy reading or stays dark (D2,
  recommendation recorded, owner ratification required).
- Whether the roll-up's `baseline` sub-count is acceptable as a refinement of
  the UX roll-up line (D4).

---

## Overview

The feature adds one capability to a surface that already exists. It adds no
route, no registered tool and no external provider.

Four things move onto the publication path. A measurement of default-visible
narrative, refused when it exceeds a declared cap. A four-leg cross-asset block
measured over a short horizon. A change-gated selection of which tracked
instruments earn narrative. A track-record line derived from evidence the
evaluator already produces.

One thing changes shape. The compact memory row grows from a single-benchmark
snapshot into a row that carries the run's readings, the tracked states and the
run's own claims, so the next run can detect change without refetching.

One thing changes only in rendering. Every supporting block collapses behind a
native `<details>`, and nothing negative is ever placed behind one.

All new pure logic lives in `rlcockpit.js`. The composer calls it during
allocation, the validator calls it during refusal, and the browser calls it
during rendering. That is one definition with three consumers, which is what
P19 asks for and what P18 requires before anything ships.

---

## Architecture

### Layers

| Layer | File | Responsibility |
| --- | --- | --- |
| Policy | [market-brief.config.json](../../market-brief.config.json) | `output-budget/v1`, `cross-asset/v1`, `change-vocabulary/v1`. Declared once, read by every consumer |
| Pure capability | `rlcockpit.js` (new) | Budget measurement, change detection, roll-up balance, leg resolution, dark-state construction |
| Composition | [scripts/brief-refresh.mjs](../../scripts/brief-refresh.mjs) | Builds the cross-asset readings and the tracked states, allocates against the budget, appends the memory row |
| Publication gate | [scripts/validate-brief-payload.mjs](../../scripts/validate-brief-payload.mjs) | Measures the composed run and refuses it |
| Memory projection | [scripts/shard-brief-history.mjs](../../scripts/shard-brief-history.mjs) | Projects the appended row into `brief-history-recent-row/v2` |
| Closed loop | [scripts/evaluate-recommendations.mjs](../../scripts/evaluate-recommendations.mjs), [scripts/build-scorecard.mjs](../../scripts/build-scorecard.mjs), [scripts/build-attention-scorecard.mjs](../../scripts/build-attention-scorecard.mjs) | Resolution, the cumulative record, the interruption record |
| Rendering | [market-brief.html](../../market-brief.html), [rlbrief.js](../../rlbrief.js) | Default view, disclosure drawers, tokens |

### Where each new obligation runs

```text
Tier A (.github/workflows/tier-a.yml, and the same steps inside brief-refresh-and-push.sh)
  brief-refresh.mjs
    buildCrossAssetReadings()        NEW  four legs, five sessions, committed bars only
    buildTrackedStates()             NEW  one state per watchlist item
    RLCOCKPIT.selectDefaultVisible() NEW  allocation and demotion, deterministic
    append brief-history.jsonl row   EXISTING line 2238, extended fields
  evaluate-recommendations.mjs       EXISTING, unchanged behaviour
  build-scorecard.mjs                EXISTING, gains resolvedThisRun
  build-attention-scorecard.mjs      MOVED onto the path, output unchanged in substance
  shard-brief-history.mjs            EXISTING, compactRow extended to v2

Tier B (scripts/brief-refresh-and-push.sh, the operator-hosted publisher)
  brief-narrative-parallel.mjs       EXISTING, gains the budget in its instruction
  build-attention-items.mjs          EXISTING, unchanged
  validate-brief-payload.mjs         EXISTING, gains the fail-closed budget refusal   <-- the gate
```

The refusal belongs in `validate-brief-payload.mjs` because that is the only
step that stands between a composed run and a committed one, and because
`brief-refresh-and-push.sh` already treats its non-zero exit as a failed
publication attempt at lines 515, 517, 548, 581 and 689.

### Determinism

Every function this feature adds is a pure function of the composed run, the
previous memory row and the committed policy. None reads the wall clock. None
uses randomness. Ordering is by declared leg order and by the tracked set's own
committed order in `watchlist.json`. That is NFR-026-001, and it is what makes
the validator able to recompute the composer's claims in assertion D4.

---

## Capability Foundation

The proportionality triggers apply. There is more than one governed material
class, more than one disposition per item and more than one plausible consuming
surface. The capability is therefore modelled foundation-first.

### Foundation contracts

| Contract | Shape | Owner |
| --- | --- | --- |
| `output-budget/v1` | `{ headlineChars, decisionCardChars, totalDefaultVisibleChars, defaultVisibleFields[] }` | `market-brief.config.json` |
| `cross-asset/v1` | `{ horizonSessions, legs[] }` where a leg is `{ id, label, driver, ratioDenominator, provenance, deepLink, owningTool }` | `market-brief.config.json` |
| `change-vocabulary/v1` | `{ kinds[], precedence[], levels{}, flags[] }` | `market-brief.config.json` |
| `cross-asset-reading/v1` | one published leg result | `rlcockpit.js` |
| `dark-state/v1` | one published unresolved leg | `rlcockpit.js` |
| `budget-measurement/v1` | `{ total, byField[], disclosedTotal, caps, violations[] }` | `rlcockpit.js` |
| `brief-history-recent-row/v2` | the extended memory row | `scripts/shard-brief-history.mjs` |

### Foundation extension points

- **A material class** joins by declaring its measured field paths in
  `output-budget/v1.defaultVisibleFields`. It needs no code change.
- **A leg** joins by adding an entry to `cross-asset/v1.legs`. Its instrument
  must already be committed, and the resolver refuses a leg whose driver has no
  committed bars rather than fetching one.
- **A change kind** cannot join. The vocabulary is closed by FR-026-008, and the
  resolver refuses an unknown kind by name.
- **A consuming surface** joins by calling `RLCOCKPIT.measureDefaultVisible`
  with its own field list. Nothing in the measurement knows about the cockpit.

### Foundation-owned policies

1. Measurement counts characters of string values reached by declared paths.
   Nothing else is measured, and nothing measured is estimated.
2. A leg resolves or it darkens. There is no third outcome and no partial write.
3. A change kind is a pure function of two states. It never reads a narrative
   field.
4. The roll-up balances or the run is refused.
5. Absence is published, never omitted and never substituted.

### What the foundation refuses

- A `defaultVisibleFields` entry that resolves to no path in the payload. A
  silently unmeasured field would make the budget a fiction.
- A leg whose declared driver has no committed bars.
- A composer-asserted change kind the foundation cannot reproduce.
- A roll-up whose count plus narrative count does not equal the tracked size.
- Any caller asking for a truncated string. The foundation has no truncation
  function, so the ellipsis path cannot be written by accident.

### Variation Axes

| Axis | Values today | Why it is a real axis |
| --- | --- | --- |
| Material class | decision card, per-instrument line, cross-asset reading, dark state, roll-up line | Each has a different cap and a different demotion eligibility |
| Disposition | published, demoted to roll-up, demoted to held-back, disclosed, refused | The demotion ladder is ordered and per-class |
| Leg resolution basis | direct price (rates, dollar, energy), ratio (credit) | The credit leg needs two series and a different owning-tool link |
| Provenance class | Observed, Derived, Proxy | Two of the four legs are honestly proxies, so the class cannot be a constant |
| Prior-state availability | prior row present, prior row absent, instrument new | Baseline is a third state, not a synonym for unchanged |
| Consuming surface | the market cockpit today, any per-tool periodic read later | The measurement takes its field list as an argument |

---

## Concrete Implementations

### D1 — The FR-026-013 conflict, and how it is resolved

**Decision: the UX slot reading is ratified. FR-026-013 as literally worded is
unsatisfiable and must be amended by the analyst.**

The literal wording requires every published run to *carry* a rates, dollar and
energy reading. The Domain Capability Model requires that a required leg
"resolves to a Cross-Asset Reading OR raises a Dark State. It never does
neither, and it never does both." When a leg is dark it has no reading, so the
two cannot both hold.

The ratified reading is the slot reading. Every published run carries a
cross-asset **slot** for each required leg, and that slot resolves to exactly
one of a Cross-Asset Reading or a Dark State.

The literal wording must not be left standing. An unsatisfiable requirement
creates exactly one incentive: manufacture a reading so the run publishes. That
is fabrication, and the product principles forbid it explicitly. The analyst
owner should amend FR-026-013 to:

> Every published run MUST carry a cross-asset slot for the rates leg, the
> dollar or currency leg and the energy leg, and each slot MUST resolve to
> either a cross-asset reading or a dark state.

The scenario BS-026-011 needs the same amendment, since it asserts the run
"carries a rates reading" unconditionally. Until both are amended, an
implementer reading only the requirement text would be led toward a substituted
value, which FR-026-021 through FR-026-024 exist to prevent.

### D2 — The cross-asset contract

**Decision: four legs, five trading sessions, every driver already committed,
every figure carrying its own provenance class.**

#### Per-leg instrument choice

| Leg | Driver | Already fetched? | Source file that commits it | Provenance | Owning tool (deep link) |
| --- | --- | --- | --- | --- | --- |
| Rates | `TLT` | **Yes.** 517 committed daily rows, and already computed as `tlt63` in the line-1288 driver bundle | [data/bars/TLT.json](../../data/bars), [bond-regime-universe.json](../../bond-regime-universe.json) | `Observed` — TLT's own adjusted close | `bond-regime-lab.html` |
| Dollar | `DX-Y.NYB` | **Yes.** 518 committed daily rows | [data/bars/DX-Y.NYB.json](../../data/bars), [fx-regime-universe.json](../../fx-regime-universe.json) `broadDollarSeries[dxy-proxy]` | `Proxy` — the universe itself declares `quality: "indicative-proxy"` and the limitation "Liquid proxy is not an official broad-dollar index" | `fx-regime-relative-value-lab.html` |
| Energy | `USO` | **Yes.** 517 committed daily rows, and already listed in `track.realAssets` | [data/bars/USO.json](../../data/bars), [market-brief.config.json](../../market-brief.config.json) | `Observed` — USO's own adjusted close | `real-assets-lab.html` |
| Credit | `JNK / LQD` ratio | **Yes.** JNK 517 rows, LQD 517 rows, and the pair is already declared as `pairs[jnk-lqd]` | [data/bars](../../data/bars), [bond-regime-universe.json](../../bond-regime-universe.json) | `Proxy` — a relative-price ratio standing in for a credit spread | `bond-regime-lab.html#simple` |

**No leg is new.** No leg introduces a provider, a key or a fetch. Every driver
already has committed daily bars, and every one of them is already named by a
committed universe or by `market-brief.config.json`. The non-goal "no new
external paid data provider" is therefore not merely respected, it is not
approached.

`track.macroGauges` stays as it is. It is the volatility-gauge list and it feeds
the regime block. The cross-asset legs are declared in their own
`cross-asset/v1` block rather than smuggled into a list that means something
else.

#### The credit leg, and the honest reading of it

The specification's Open Question 5 assumes credit has no source and asks
whether it is permanently dark. That assumption does not survive reading the
committed bond tool read. `payload.toolReads['bond-regime-lab'].metrics`
currently carries `readablePairs: [{ pairId: "jnk-lqd", direction:
"strengthening", purity: "clean", asOf: "2026-08-17" }, ...]`, alongside
`creditRegime: "Indeterminate"`, `confirmationState: "unavailable"`,
`modelMissing: ["independent-credit-confirmation"]` and `evidenceGaps: ["an
independent credit-spread reading"]`.

Two different things are unavailable, and the specification conflates them:

- The **independent credit-spread reading** (OAS) is genuinely unavailable.
  `bond-regime-universe.json` `sourcePolicies.oas` declares
  `mode: "user-observation-or-unavailable"`, `persistence: "memory-only"`. No
  free public adapter exists and none is proposed here.
- The **credit-risk ratio** is available, is committed, is computed by the
  owning tool, and is already published in the payload.

**Recommendation: the credit leg resolves to a `Proxy` reading built from the
JNK/LQD ratio, and it carries an explicit `confirmation: { state: "absent",
detail: "no independent credit-spread reading is on file" }`.** The withheld
conclusion is stated in the same words the dark card would have used: the brief
is not stating whether credit is confirming or contradicting the equity trend.

That is more honest than a dark state, not less. A dark card would say nothing
was measured. Something was measured; what is missing is the confirmation that
would let the brief conclude from it. Publishing the measurement and naming the
missing confirmation says both true things. Publishing a dark card would say one
false thing.

This changes the specification's own worked example. The mobile wireframe draws
`○ Credit — Dark`. Under this design that row reads `● Credit JNK/LQD +0.4% 5s
Proxy →` with an unconfirmed marker. The UX owner should re-draw that row, or
the owner should reject this recommendation and accept a permanently dark credit
leg. Either is defensible. Removing credit from the required set is not, and
this design does not propose it.

The `confirmation` field name is not invented. `marketConfirmation: { state:
"present|absent|partial", detail }` already exists in the `decision-attention/v1`
envelope in `notes/market-brief.md` §9. The same vocabulary is reused.

#### The short horizon

**Decision: five trading sessions.**

| Candidate | Why it was not chosen |
| --- | --- |
| 3 sessions | One missing close costs a third of the window. It also fires on a gap-and-fill that reverses inside the week, which is the false positive §6c exists to suppress |
| **5 sessions** | **Chosen.** It spans a full trading week, so a Monday-anchored and a Friday-anchored run measure comparable windows. It contains the two to three consecutive snapshots the §5 persistence gate requires. Every declared driver holds 517 or more committed rows, so the window is never short for data reasons |
| 10 sessions | A "third straight session" build is diluted to noise inside a two-week window, which is the exact move UC-026-003 exists to catch |

Five is strictly shorter than the existing 63-session horizon, so FR-026-014 and
BS-026-012 are satisfied by construction rather than by assertion.

#### Where the short horizon is computed, and what it reuses

In a new exported function `buildCrossAssetReadings()` in
`scripts/brief-refresh.mjs`, placed beside `buildRealAssetsToolRead()` and using
the identical mechanism:

```text
loadToolFunctions('real-assets-lab.html', ['realTrailingPct', 'realRatioTrailingPct'])
  realTrailingPct(bars.TLT, 5)          rates
  realTrailingPct(bars['DX-Y.NYB'], 5)  dollar
  realTrailingPct(bars.USO, 5)          energy
  realRatioTrailingPct(bars.JNK, bars.LQD, 5)   credit
```

**No second return function is written.** `realTrailingPct` at
[real-assets-lab.html](../../real-assets-lab.html) line 1032 and
`realRatioTrailingPct` at line 1258 are the owning tool's own functions, already
loaded by `buildRealAssetsToolRead`, already the source of `ret63` and the
entire line-1288 driver bundle, and already selftested. This feature calls them
with a lookback of 5 instead of 63. That is P19 honoured literally: the metric
keeps one definition and gains a second horizon.

I checked for an existing short-horizon helper before proposing this.
`grep` for `realTrailingPct` across the repository's `*.js` files returns
nothing, because it lives inside an HTML tool file; the only callers are
`brief-refresh.mjs` line 1285 and the real-assets page itself. No sibling
5-session function exists anywhere.

The same call also publishes the existing 63-session value, so each reading
carries both horizons and FR-026-018 is satisfied: the already-computed driver
is published rather than discarded.

#### `asOf` semantics

Each leg carries its own `asOf`, taken from `latestIso(bars[symbol])`, the
helper `brief-refresh.mjs` already uses for every tool read. It is the ISO
timestamp of the **last committed close actually used**, never the run time.
The ratio leg carries the later of its two series' `asOf` values and refuses if
the two differ by more than one session, because a stale denominator would
manufacture a ratio move out of a calendar gap.

`sessions` is the count of closes actually spanned, not the requested 5. When
fewer than 5 are available the leg publishes with the real count and the
`◐ Partial` token, which is exactly the UX vocabulary's stated meaning. With
fewer than 2 closes no change can be measured and the leg raises a dark state.

#### Never zero, never neutral

`realTrailingPct` returns a non-finite value when it cannot compute. The
resolver tests with `Number.isFinite` and raises a dark state on failure. It
never coerces, never defaults to 0, never carries the previous run's value
forward and never substitutes a neighbouring instrument. That is the
substitution-refusal sentence the dark card publishes, made mechanical.

#### The standing research instruction (FR-026-019)

`market-brief.config.json` `macroEvents` carries a 2026-07-14 entry instructing
a re-verification of crude, transit and insurance each run. It is bound to the
energy leg. On every run the energy leg publishes either a reading, which
honours the crude half, or a dark state naming why crude could not be read. The
transit and insurance halves have no committed source; the design does not
pretend otherwise. The standing instruction gains a declared
`boundTo: "energy"` field and an `unresolvedAspects: ["transit", "insurance"]`
field, and the run publishes those aspects as named unresolved items in the
standing-research block. An instruction with no mechanical consequence becomes
an instruction with exactly one.

### D3 — Budget enforcement mechanics

**Decision: measure declared string paths on the composed payload, allocate by
demoting whole items, refuse in the validator, and never truncate.**

The three cap values come from the UX derivation and are not re-derived here:
headline 140, per decision card 300, total default-visible 3,000.

#### What is measured

`output-budget/v1.defaultVisibleFields` is a committed list of JSON paths. The
measurement sums `String.length` over every string value the list reaches. It
counts every character including spaces and punctuation. It counts no key, no
number, no boolean and no null. It counts no field outside the list.

| Path | Material class | Cap that applies |
| --- | --- | --- |
| `headline` | headline | 140, per item |
| `attention[].headline` | decision card summary | 300, per card, summed with the card's other measured fields |
| `attention[].what` | decision card | 300, per card |
| `attention[].escalationTrigger` | decision card | 300, per card |
| `attention[].invalidation` | decision card | 300, per card |
| `crossAsset.legs[].label` | cross-asset reading | total only |
| `crossAsset.legs[].withheld` | cross-asset reading | total only |
| `crossAsset.dark[].reason` | dark state | total only, and outside the demotion ladder |
| `crossAsset.dark[].withheld` | dark state | total only, and outside the demotion ladder |
| `crossAsset.dark[].substitutionRefusal` | dark state | total only, and outside the demotion ladder |
| `changed[].line` | changed line | total only |
| `rollUp.line` | roll-up | total only |
| `trackRecord.line` | track record | total only, and outside the demotion ladder |

Everything else in the payload is disclosed narrative. `backdrop`,
`watchlistNotes`, `toolReads`, `toolCoverage`, `events`, `groups`,
`nextSession.thesis`, `psychology`, `researchAgenda`, `experimental` and
`regime.note` are measured as one separate `disclosedTotal` and are subject to
no cap. That is FR-026-004 and BS-026-004 exactly: collapsing is not deleting,
and the two figures are reported side by side so neither can masquerade as the
other.

The list is what makes the number checkable. A reviewer runs
`node scripts/validate-brief-payload.mjs market-brief.payload.json`, reads the
per-field table the validator prints on every run, and adds the column. The
total in the table is the total the cap is compared against. There is no
weighting, no normalisation and no rounding.

#### Where measurement happens

`RLCOCKPIT.measureDefaultVisible(payload, budgetPolicy)` in `rlcockpit.js`,
returning `budget-measurement/v1`. It is a pure function with no I/O. Two
consumers call it. The composer calls it during allocation. The validator calls
it during refusal. There is exactly one implementation, so a run cannot be
allocated against one measurement and refused against another.

#### Where refusal happens

Inside `validateBriefPayload` in
[scripts/validate-brief-payload.mjs](../../scripts/validate-brief-payload.mjs),
pushing into the existing `errors[]`.

The check runs when, and only when, the payload declares
`contractVersion: "market-brief-payload/v2"`. That is a hard per-payload
cutover, not an advisory mode and not a flag:

- A v2 payload is measured and refused. There is no code path in which a v2
  payload exceeds a cap and still validates.
- A v1 payload has no budget fields to measure and is not refused for lacking
  them, which is what keeps the currently committed 127,740-character payload
  from failing six unrelated node suites the moment this lands. The file's own
  comment at lines 366 to 379 records what happens when that precaution is
  skipped.
- The composer always stamps v2. A selftest assertion requires that the string
  `market-brief-payload/v2` is the only contract version `brief-refresh.mjs`
  writes, so the v1 branch becomes unreachable from production the moment the
  composer ships. Emitting a v1-stamped payload from the composer fails the
  selftest, which is the adversarial case NFR-026-004 requires.

There is no `--allow-over-budget`, no `--budget-advisory`, no
`--skip-budget` and no environment variable. The existing CLI flag set stays at
`--enforce-d16`, `--drop-unscoreable`, `--drop-ineligible-causal`,
`--defer-page-parity` and `--require-narrative-fields`, and the budget responds
to none of them.

#### The exact failure output

One line per violation, in the existing `errors[]` style, all of them reported
together:

```text
outputBudget: headline is 168 characters, over the declared cap of 140
outputBudget: attention[2] is 341 characters, over the declared per-card cap of 300
outputBudget: default-visible narrative is 3412 characters, over the declared total cap of 3000
outputBudget: measured over 13 declared fields; disclosed narrative was 41208 characters and is not capped
```

The validator exits non-zero. `brief-refresh-and-push.sh` treats that as a
failed attempt, restores the baseline and retries the lane; after
`NARRATIVE_ATTEMPTS` it degrades to a data-only publication or refuses the run
outright under `REQUIRE_COMPLETE_RUN`. **No part of an over-budget run
publishes**, which is FR-026-003.

#### Allocation, demotion and refusal are three different things

1. **Allocation** happens in the composer, before validation.
   `RLCOCKPIT.selectDefaultVisible` demotes whole items in the declared order:
   changed-instrument lines fold into the roll-up count first, then decision
   cards below the lowest published rank move into the existing held-back list.
   Both are existing published forms and both keep the item counted and named.
2. **Nothing negative is ever demoted.** Dark cards, the track-record line,
   resolved misses and invalidations are excluded from the ladder by class, not
   by a runtime check that could be reordered. The worst-case irreducible core
   is 140 + 4 dark cards at 180 + 90 + 140 + one card at 300 = 1,390
   characters, comfortably under 3,000, so refusal always signals authoring
   bloat and never a busy market.
3. **Refusal** happens in the validator, after allocation. There is no
   truncation function anywhere in `rlcockpit.js`, so an ellipsis cannot be
   introduced by a caller. A cut sentence is not brevity; it is a lie with a
   shorter character count.

### D4 — Delta-only publishing

**Decision: the change kind is a pure function of two memory rows and a closed
level and flag declaration. It never reads a narrative field.**

#### The predicate

`RLCOCKPIT.changeKind(prev, cur, policy)` returns exactly one of
`levelCrossed`, `stateFlipped`, `flagRaised`, `flagCleared`, `baseline` or
`null`.

| Kind | Predicate |
| --- | --- |
| `levelCrossed` | For some declared level `L`, `sign(prev.px - prev.levels[L]) !== sign(cur.px - cur.levels[L])`, both sides finite and non-zero. Declared levels are the `thresholds.maWindows` values 20, 50 and 200, plus the 52-week high and low the bench block already carries |
| `stateFlipped` | `prev.maStack !== cur.maStack`, or `prev.rrgState !== cur.rrgState`. Both are existing declared state tokens with existing producers |
| `flagRaised` | A declared boolean is `true` now and `false` in the prior row |
| `flagCleared` | A declared boolean is `false` now and `true` in the prior row |
| `baseline` | No prior row, or the prior row does not carry this instrument. §5's existing "baseline (no prior run)" rule |
| `null` | None of the above. The instrument goes into the roll-up |

**Declared flags**, the closed list in `change-vocabulary/v1.flags`:

| Flag | Producer that already exists |
| --- | --- |
| `callOpen` | `foldLedger` in `evaluate-recommendations.mjs`, which already yields the open key set per instrument and already runs before publication |
| `gammaFlipProximity` | `flipProximityPct` in `rlbrief.js` line 55 against `thresholds.gammaFlipProximityPct` |
| `persistenceGateMet` | `isPersistentSignal` in `rlbrief.js` line 151 against `thresholds.persistenceSnapshots` |
| `earningsWithinWindow` | `nearTermEvents` in `rlbrief.js` line 91 against the committed `events[]` |

**A call opening or closing is expressed inside this vocabulary**, per the UX
rule. Opening is `flagRaised` on `callOpen`. Closing is `flagCleared` on
`callOpen`. The vocabulary stays closed and FR-026-008 is not widened.

**Precedence**, when more than one predicate fires:
`levelCrossed` > `stateFlipped` > `flagRaised` > `flagCleared`. Declared in
`change-vocabulary/v1.precedence`, so the single-kind-per-instrument rule the UX
layer requires is deterministic rather than incidental.

**`baseline` is not `unchanged`.** This refines the UX roll-up line and the
refinement is deliberate. Telling a reader that an instrument is unchanged when
the brief has never seen it before is a false statement about the past. The
roll-up line therefore reads `= 11 unchanged` when every member has a prior
state, and `= 10 unchanged · 1 first seen` when one does not. FR-026-012's
balance becomes `narrative + unchanged + baseline === trackedSet.length`. The UX
owner should confirm this refinement.

#### The roll-up record

```json
{
  "rollUp": {
    "line": "= 11 unchanged",
    "count": 11,
    "baselineCount": 0,
    "members": [ { "symbol": "MSFT", "state": "bull-stack" } ]
  }
}
```

The `members` list is the drawer body. It carries a symbol and a state token and
nothing else. No rationale, no paragraph, no restated position. That is
assertion D3 of the UX layer made structural: an unchanged instrument's symbol
cannot appear in a default-visible string, because the only place it appears is
the drawer body, which is disclosed.

#### Where the prior state comes from

**The last row of `brief-history.recent.jsonl`.** That is the change-detection
surface `notes/market-brief.md` §5 already describes, and specifically the
compact projection §5's "read the last 2 to 3 snapshots before calling anything a
change" instruction depends on. The design reuses it rather than adding a
second memory.

Two §5 rules carry through unchanged and must be honoured by the implementation:

- **The distinct-market-bar rule.** Repeated weekend and holiday runs over the
  same completed close are not additional evidence. The row already carries
  `marketClosed` and `nextSessionDate`, and each cross-asset leg now carries its
  own `asOf`, so the detector compares against the most recent row whose leg
  `asOf` differs from the current one. Four runs over one Friday close produce
  one comparison, not four.
- **The persistence gate.** §6c requires a micro-delta to persist across two to
  three consecutive snapshots before it becomes a change. The gate reads the
  last `thresholds.persistenceSnapshots` rows, which is already 3, and calls
  `isPersistentSignal` from `rlbrief.js`. No second implementation.

#### The four validator assertions

The UX layer's D1 to D4 assertions are adopted verbatim as validator checks.
Assertion D4 is the load-bearing one: the validator recomputes `changeKind`
itself from the two memory rows and refuses a composer-asserted change it cannot
reproduce. Because `changeKind` reads no narrative field, the adversarial case
holds — replace every string on an unchanged instrument and the kind stays
`null`.

### D5 — Run-specific memory

**Decision: `brief-history-recent-row/v2`, additive, with every v1 key kept at
its existing path and meaning.**

#### The added fields

```json
{
  "contractVersion": "brief-history-recent-row/v2",

  "ts": "…", "window": "…", "marketClosed": false, "nextSessionDate": "…",
  "regimeBand": null, "regimeScore": null, "vix": null, "fearGreed": null,
  "bench": { "px": null, "maStack": null, "ma200Dist": null,
             "pctFrom52wHigh": null, "mom126": null, "mom252": null },

  "crossAsset": {
    "rates":  { "driver": "TLT", "changePct": -1.8, "sessions": 5, "long63Pct": -4.1,
                "provenance": "Observed", "state": "resolved", "asOf": "2026-08-17" },
    "dollar": { "driver": "DX-Y.NYB", "changePct": 1.1, "sessions": 5, "long63Pct": 2.4,
                "provenance": "Proxy", "state": "resolved", "asOf": "2026-08-17" },
    "energy": { "driver": "USO", "changePct": 0.4, "sessions": 5, "long63Pct": -6.2,
                "provenance": "Observed", "state": "resolved", "asOf": "2026-08-17" },
    "credit": { "driver": "JNK/LQD", "changePct": 0.4, "sessions": 5, "long63Pct": 1.1,
                "provenance": "Proxy", "state": "resolved", "asOf": "2026-08-17",
                "confirmation": "absent" }
  },

  "tracked": {
    "MSFT": { "px": 512.4, "maStack": "bull-stack", "ma200Dist": 8.1,
              "rrgState": "Leading",
              "flags": { "callOpen": true, "gammaFlipProximity": false,
                         "persistenceGateMet": false, "earningsWithinWindow": false } }
  },

  "claims": {
    "openedThisRun": ["rec:…"],
    "resolvedThisRun": [ { "key": "rec:…", "outcome": "invalidated" } ],
    "openCount": 109
  },

  "dark": [ { "leg": "credit", "reason": "…" } ]
}
```

#### Migration and compatibility

`brief-history.recent.jsonl` holds 30 rows today, all stamped
`brief-history-recent-row/v1`. `brief-history.jsonl` holds 194 rows and is the
append-only source.

`shard-brief-history.mjs` regenerates the entire recent file from the source on
every run: `planShards` takes `rows.slice(-recentCount).map(compactRow)` and
`runShard` writes the whole file. That is what makes the migration a non-event.

- **Every v1 key stays at its path with its meaning.** A reader that never heard
  of v2 reads exactly what it read before. Nothing is renamed, moved or
  retyped.
- **Historic source rows carry none of the new fields.** `compactRow` projects
  them as `null`, never as `{}` and never as `0`. A `null` `crossAsset` is not a
  reading of zero; the change detector treats it as absent prior state and
  returns `baseline`, which is §5's existing rule and not a new one.
- **The 194-row source file is untouched.** New appended rows carry the new
  fields; the 194 existing rows do not. That is the additive rule of FR-026-040
  and P21, and it means the migration writes no row twice.
- **Readers key on `contractVersion` and accept `v1|v2`.** The one reader that
  must change is the change detector, which is new anyway.
- **`artifact-budget/v1` is respected.** The current recent file is 30 rows of
  roughly 300 bytes. The v2 row adds four legs, twelve tracked instruments and a
  claims block, which measures at roughly 1.6 KB per row and 48 KB across the
  30-row window. `maxNormalizedObservationBytes` is 262,144, so the window fits
  with a wide margin. If the tracked set grows past roughly 100 instruments the
  plan owner must revisit the window size rather than the budget, per P22.

#### How the §6c persistence gate consumes it

The gate's job is to distinguish a multi-session build from a single-slice
wiggle. Before this change it could not run on cross-asset drivers at all,
because no driver was persisted.

The consumption is a three-step read with no new maths:

1. Take the last `thresholds.persistenceSnapshots` rows, which is 3.
2. Drop any row whose leg `asOf` equals a later row's leg `asOf`, per the
   distinct-market-bar rule. Four weekend runs over one close collapse to one
   observation.
3. Pass the remaining `crossAsset[leg].changePct` values to `consecutiveRun` and
   `isPersistentSignal` in `rlbrief.js`. A leg whose sign agrees across the
   surviving rows has persisted; a leg that flips has not.

A leg that clears the gate earns the headline's "built for a third straight
session" language. A leg that does not is published with its measured value and
no build language. That is what FR-026-039 asks for, and it is reached by
feeding existing selftested helpers new inputs.

### D6 — The closed loop

**Decision: the specification's diagnosis is wrong, and the design corrects it
rather than building against it.**

#### The actual diagnosis, with the code evidence

The specification states that "109 open calls against three resolved ones" shows
resolution is manual and the backlog is structural. Both halves are false, and
the falsity was established by executing the shipped code against the committed
ledger rather than by reading the artifact's surface.

**Finding 1 — resolution already runs on the publication path, twice.**
`.github/workflows/tier-a.yml` runs `node scripts/evaluate-recommendations.mjs`
in the step "Evaluate elapsed recommendations" on every window, and
`scripts/brief-refresh-and-push.sh` line 412 runs it again in the operator-hosted
path. FR-026-032 is therefore already satisfied by the code that ships today.

**Finding 2 — the ledger is not 109 open against 3 resolved. It is 109 open
against 135 resolved and 304 closed.** Folding the committed ledger through the
evaluator's own exported `foldLedger` over
`briefs/history/recommendations/2026-07.jsonl` and `2026-08.jsonl`:

```text
total rows: 1288
rows by eventType: proposed 764, body-restored 220, not-evaluable 152,
                   invalidated 53, satisfied 82, expired 17
ledger keys total: 413
keys already closed: 304
keys OPEN with a durable body: 109
keys OPEN with NO durable body: 0
```

The committed `market-brief.scorecard.json` agrees and publishes it:
`windows.all` carries `closed: 304, resolved: 135, satisfied: 82,
invalidated: 53, expired: 17, notEvaluable: 152, hitRate: 0.6074,
insufficientSample: false`.

**The "3" is a policy-capped display, not a total.**
`scorecard-policy/v1.recentMissCount` is 3, and `build-scorecard.mjs` builds
`recentMisses` with `.slice(0, policy.recentMissCount)`. The specification's
Honest Findings section spotted half of this — it corrected `recentMisses` from
a scalar to an array of three — and then still read the three as the resolved
total. The three are the three most recent **misses**, published in full by
design because "a scorecard that hides its misses is marketing".

**Finding 3 — every one of the 109 open calls is legitimately open.** Replaying
the evaluator's own exported `judge` against each open body at the current
`asOf`:

```text
verdicts for the 109 open keys, computed now: STILL-OPEN (judge returned null) 109
horizon swing       count 55  windowSessions 10  elapsed min/median/max 0 / 2 / 9
horizon structural  count 39  windowSessions 40  elapsed min/median/max 0 / 3 / 9
horizon tactical    count 15  windowSessions 3   elapsed min/median/max 0 / 1 / 2
open keys whose levels name no instrument at all: 0
```

Every call has elapsed fewer sessions than its own published horizon window and
has breached no level. `judge` returns `null` for exactly that case, and the
function's own comment says so: "A call still inside its horizon with nothing
breached emits NOTHING. Silence means open." The 109 is a bounded working set,
not an unbounded backlog. The bound is the arrival rate multiplied by the mean
time to close, and `HORIZON_SESSIONS.structural` of 40 sessions is the term that
sets it.

**What this means for the design.** FR-026-032 needs no new producer. The
remaining work is smaller and different from what the specification assumed.

#### What actually goes on the publication path

| # | Change | Why |
| --- | --- | --- |
| 1 | `build-scorecard.mjs` gains `resolvedThisRun` | FR-026-035 requires the count resolved *that run*. The scorecard publishes only cumulative totals and `openCalls` today. Every outcome row already carries `runId`, so the count is a filter over rows the evaluator just appended, with no new evidence |
| 2 | The track-record line renders in the default view, never collapsible | FR-026-029 and FR-026-035. The numbers exist; nothing puts them in front of the reader at the top |
| 3 | `notEvaluableShare` renders beside the hit rate | It is 152 of 304, which is 50.0 percent. Publishing a 60.7 percent hit rate without it would be the selective reporting `build-scorecard.mjs`'s own header calls "the one unrecoverable failure for this product" |
| 4 | `build-attention-scorecard.mjs` moves onto the publication path | It is genuinely manual. It appears in neither `tier-a.yml` nor `brief-refresh-and-push.sh`, and `notes/decision-attention.md` line 19 and `notes/market-brief.md` §10a both say so. `market-brief.attention-scorecard.json` is stamped `2026-08-07T12:00:00Z` |
| 5 | A producer-existence assertion for the evaluator | BUG-009 §5's lesson. A selftest asserts that a production caller of `evaluate-recommendations.mjs` exists on both publication entry points, so the current correct behaviour cannot silently regress |

**Point 4 must not be oversold.** `market-brief.attention-outcomes.jsonl` is 0
bytes, and it is 0 bytes because the attention feed produces no items, which is
BUG-009 and is not this feature's to fix. Wiring the builder onto the path makes
`generatedAt` honest and changes nothing else. Its published output stays
`closedSample: 0` against `minClosedSample: 20`, `rate: null`, and the statement
"The closed sample is too small to report an interruption rate." **That
withholding is correct and must survive.** A rate below the declared minimum
sample stays withheld with the sample size shown, per P5 and FR-026-035, rather
than being published as a flattering number. If BUG-009 is never remedied, this
surface publishes an honest zero-sample statement forever, and that is the
designed outcome rather than a failure of this feature.

### D7 — The minimum closed sample

**Decision: 20, ratified as a discovered committed value, not chosen by
analogy.**

The UX layer proposed 20 "by analogy with `attention-scorecard`'s
`overall.minClosedSample`", and flagged it as a proposal rather than a
discovered fact. The flag was the right instinct and the premise is wrong.

`market-brief.config.json` already declares
`scorecard-policy/v1: { minResolvedSample: 20, recentMissCount: 3,
windowDays: [30, 90] }`. `build-scorecard.mjs` `loadPolicy` reads it, `summarize`
enforces it, and the committed `market-brief.scorecard.json` publishes it inside
its own `policy` block. The recommendation ledger's minimum is therefore
established, committed, enforced and published today.

Open Question 7's premise — "the recommendation ledger's own minimum is not
established by this analysis" — is answered by the configuration. The value is
ratified as it stands. FR-026-035 reads it from
`scorecard-policy/v1.minResolvedSample` and declares no second constant, which
is P19.

One consequence is worth stating because it will look like a bug. `resolved` is
135, which is above 20, so the recommendation hit rate **publishes** at 60.7
percent. The attention interruption rate has `closedSample: 0` against its own
`minClosedSample: 20`, so it **withholds**. Two rates, two samples, two
different published outcomes, one policy shape. The default view must render
both without implying that the withheld one is a zero.

### D8 — Scope decomposition

Five scopes, in dependency order. The seam the specification names, between the
publication contract and the closed loop, is honoured: SCOPE-05 depends only on
SCOPE-01 and can be deferred as a sibling feature without stranding the rest.

| Scope | Name | FRs | Depends on | BUG-009 exposure |
| --- | --- | --- | --- | --- |
| SCOPE-01 | Budget policy, measurement and fail-closed refusal | FR-026-001 to FR-026-006, NFR-026-003, NFR-026-004, NFR-026-007 | — | None |
| SCOPE-02 | Cross-asset legs, required-leg set and dark state | FR-026-013 to FR-026-024, and FR-026-019 | SCOPE-01 for the payload version stamp | None |
| SCOPE-03 | Memory row v2, change vocabulary, delta-only publishing and roll-up | FR-026-007 to FR-026-012, FR-026-036 to FR-026-040, NFR-026-001 | SCOPE-02 for the readings it persists | None |
| SCOPE-04 | Disclosure-first rendering | FR-026-025 to FR-026-030, NFR-026-002, NFR-026-005, NFR-026-006, NFR-026-008 | SCOPE-01, SCOPE-02, SCOPE-03 for the fields it renders | **Partial. See below** |
| SCOPE-05 | Closed loop on the publication path | FR-026-031 to FR-026-035, NFR-026-009, NFR-026-010 | SCOPE-01 | **Partial. See below** |

**SCOPE-04's BUG-009 exposure.** The decision surface is the attention list, and
that list publishes nothing on any live run. Three consequences for planning:

- The **unreachable** empty statement is the only decision-surface state
  testable against live committed data, and it is the state a live run actually
  produces. It should be the primary scenario, not an edge case.
- The **quiet** statement and the **ranked cards** state are testable only from
  a fixture payload. That is legitimate, and the Test Plan must say so rather
  than implying live coverage.
- The per-decision-card cap of 300 characters has no live subject. Its
  adversarial test must use a fixture card, and NFR-026-004's "fails when the
  guard is removed" case must be written against that fixture.

**SCOPE-05's BUG-009 exposure.** The attention interruption rate cannot reach a
non-null value while the outcome ledger is 0 bytes. The scope can and must test
that the builder runs on the path, that `generatedAt` advances, and that the
rate stays withheld at `closedSample: 0`. It cannot test a published
interruption rate. The recommendation half of SCOPE-05 has no such constraint:
135 resolved calls exist and the hit rate publishes.

**Sequencing recommendation.** SCOPE-01 through SCOPE-03 form the publication
contract and deliver the owner's stated complaint. SCOPE-04 is the reader-facing
payoff and should follow immediately. SCOPE-05 is separable; if the plan owner
needs to stay inside five scopes with room to spare, SCOPE-05 is the honest
split point, exactly as the specification's Change Magnitude Decision proposes.

---

## Data Model

### `cross-asset-reading/v1`

| Field | Type | Rule |
| --- | --- | --- |
| `leg` | `"rates" \| "dollar" \| "energy" \| "credit"` | From the committed leg set. An unknown id is refused |
| `driver` | string | The committed ticker, or `"NUM/DEN"` for a ratio leg |
| `changePct` | finite number | `realTrailingPct(bars, sessions)`. Non-finite raises a dark state |
| `sessions` | integer ≥ 2 | Closes actually spanned. Below the declared 5 the leg is `partial` |
| `long63Pct` | finite number or null | The existing 63-session value, published rather than discarded |
| `provenance` | `"Observed" \| "Derived" \| "Proxy"` | Declared per leg in `cross-asset/v1`, never inferred at runtime |
| `state` | `"resolved" \| "partial"` | `partial` when `sessions` is below the declared horizon |
| `confirmation` | `{ state, detail }` or null | Credit only today. Reuses the `marketConfirmation` vocabulary from §9 |
| `asOf` | ISO date | `latestIso` of the last committed close used. Never the run time |
| `deepLink` | string | The owning tool. The brief links; it does not recompute |
| `withheld` | string or null | Present when `confirmation.state` is `absent`. Names the conclusion not being drawn |

### `dark-state/v1`

| Field | Type | Rule |
| --- | --- | --- |
| `leg` | leg id | The leg that failed to resolve |
| `reason` | string | Why. Non-empty, or the card is refused |
| `withheld` | string | The conclusion the brief is not drawing. Non-empty, or the card is refused |
| `substitutionRefusal` | string | The explicit statement that nothing was substituted. Non-empty, or the card is refused |

All three sentences render or the card is refused, per the UX primitive rule. A
dark card is never inside a `<details>`, never demoted and never counted toward
a cap that could push it out.

### `budget-measurement/v1`

| Field | Type | Rule |
| --- | --- | --- |
| `total` | integer | Sum of `String.length` over the declared default-visible paths |
| `byField` | array of `{ path, chars }` | The reviewer's re-derivation table. Sums to `total` |
| `disclosedTotal` | integer | Everything else. Reported, never capped |
| `caps` | `{ headline, decisionCard, total }` | Copied from the policy, so the output records what it was measured against |
| `violations` | array of `{ path, measured, cap }` | Empty on a passing run |

### `output-budget/v1`, in `market-brief.config.json`

```json
{
  "output-budget/v1": {
    "contractVersion": "output-budget/v1",
    "policyId": "output-budget/v1",
    "headlineChars": 140,
    "decisionCardChars": 300,
    "totalDefaultVisibleChars": 3000,
    "defaultVisibleFields": [ "headline", "attention[].headline", "…" ],
    "note": "Caps OUTPUT. artifact-budget/v1 caps FETCH. Neither may be raised inside a change that would otherwise fail against it."
  }
}
```

The `note` records the distinction the specification's Current Capability Map
row 2 identifies: `artifact-budget/v1` caps input at 48 symbols and 200 bars per
symbol per trading date and never caps prose. This block caps output. Neither
replaces the other, and NFR-026-010 is satisfied because the fetch budget is
untouched.

---

## API/Contracts

### `rlcockpit.js` — the functions this feature adds

Every one is a top-level `function` declaration inside the UMD factory, so
`extractFn` can reach it. Every one is pure.

| Function | Signature | Selftest group |
| --- | --- | --- |
| `measureDefaultVisible` | `(payload, budgetPolicy) -> budget-measurement/v1` | `rlcockpit.js — output budget` |
| `budgetViolations` | `(measurement, budgetPolicy) -> [{ path, measured, cap }]` | `rlcockpit.js — output budget` |
| `selectDefaultVisible` | `(composed, budgetPolicy) -> { published, demoted, heldBack }` | `rlcockpit.js — allocation and demotion` |
| `changeKind` | `(prevState, curState, vocabulary) -> kind \| null` | `rlcockpit.js — change vocabulary` |
| `rollUpFrom` | `(trackedStates, kinds) -> rollUp` | `rlcockpit.js — change vocabulary` |
| `rollUpBalances` | `(narrativeCount, rollUp, trackedSize) -> boolean` | `rlcockpit.js — change vocabulary` |
| `resolveLeg` | `(legPolicy, bars, sessions) -> cross-asset-reading/v1 \| dark-state/v1` | `rlcockpit.js — cross-asset legs` |
| `darkState` | `(leg, reason, withheld) -> dark-state/v1` | `rlcockpit.js — cross-asset legs` |
| `legTokenLabel` | `(reading) -> "● Resolved" \| "◐ Partial" \| "○ Dark"` | `rlcockpit.js — reader tokens` |
| `changeTokenLabel` | `(kind) -> token string` | `rlcockpit.js — reader tokens` |

Ten functions, four selftest groups. Every group carries at least one
adversarial case that fails when its guard is removed, per NFR-026-004.

**What I checked before proposing each.** `grep` across the repository for
`crossAsset`, `defaultVisible`, `rollUp`, `changeKind`, `requiredLeg` and
`darkState` returns no match in any research-lab product file. The 44 root
`rl*.js` modules contain no `rlcockpit.js` and no `rldelta.js`. The nearest
existing neighbours are `rlbrief.js`, which owns rendering helpers and the
persistence primitives this design reuses rather than reimplements, and
`rlattention.js`, which owns the decision-attention composer and is untouched.

### Consumers, and why each is required

| Consumer | Calls | Why it must be this consumer |
| --- | --- | --- |
| `scripts/brief-refresh.mjs` | `resolveLeg`, `changeKind`, `rollUpFrom`, `selectDefaultVisible` | Composition is where allocation belongs. Demotion before measurement means a busy market is never refused |
| `scripts/validate-brief-payload.mjs` | `measureDefaultVisible`, `budgetViolations`, `changeKind`, `rollUpBalances` | Refusal is where the gate is. Recomputing `changeKind` here is what makes assertion D4 real |
| `rlbrief.js` via `market-brief.html` | `legTokenLabel`, `changeTokenLabel` | The reader tokens have one definition. A renderer-local copy would drift |
| `scripts/shard-brief-history.mjs` | none | `compactRow` projects fields; it computes nothing |

Every function has a production consumer inside the increment that introduces
it. That is P18, and BUG-009 is the standing example of what happens when it is
not enforced.

### Refusal codes

The validator uses its existing `errors[]` string mechanism rather than a new
code namespace, because `validateBriefPayload` accumulates and reports strings
and every existing check does the same. Introducing a parallel code system for
one feature would be a second definition of "how this validator reports a
refusal". Each budget message is prefixed `outputBudget:`, each leg message
`crossAsset:` and each delta message `delta:`, so a reader can group them.

---

## UI/UX

The UI contract is owned by [spec.md](spec.md) `## UI Wireframes` and
`## User Flows`. This section records only what the design adds or changes.

### Adopted without change

The three closed status vocabularies, the eight UI primitives, the screen
inventory and its default states, the disclosure interaction contract, the focus
order, the three empty and dark statements, the no-CSS-reordering rule, and the
persistence asymmetry between the Power mode and individual drawers.

### Changed by this design, with the reason

| UX element | Change | Reason |
| --- | --- | --- |
| Credit row in the wireframe, drawn as `○ Credit — Dark` | Becomes a `Proxy` reading with an absent-confirmation marker | D2. The JNK/LQD ratio is committed and the owning tool already publishes it. Only the independent spread reading is unavailable |
| Dollar row, drawn as `Observed` | Becomes `Proxy` | `fx-regime-universe.json` declares `DX-Y.NYB` as `quality: "indicative-proxy"` with a stated limitation. Publishing it as Observed would misstate provenance, which P1 forbids |
| Roll-up line `= 11 unchanged` | Gains a `· N first seen` clause when a tracked instrument has no prior state | D4. Calling a never-before-seen instrument unchanged is a false statement about the past |

The UX owner should ratify all three, or reject them and the design will follow.
None of the three changes a layout, a control, a focus order or an
accessibility rule.

### Escaping

Every authored string reaches the DOM through the existing `esc` helper in
[rlbrief.js](../../rlbrief.js) line 1049. No new sink is introduced. Model text
is data at every sink, which is NFR-026-005 and P8.

### Charts

None. The cross-asset strip is a table of measured values, so no canvas, no
`role="img"` pairing and no parallel data table are required.

---

## Security/Compliance

- **Tickers only.** Every artifact this feature touches carries a symbol, a
  percentage change, a session count and a state token. No position size, cost
  basis, profit figure or credential enters any of them. `watchlist.json` already
  carries the standing note about this and the design adds no field that could
  hold one.
- **No credential surface.** Every driver reads from `data/bars/`, which is
  committed. No new fetch, no new provider, no new key.
- **No framework vocabulary in reader copy.** Contract identifiers, refusal
  codes, spec numbers and digests stay in the payload's machine fields and never
  reach a rendered string. `scripts/reader-vocabulary.mjs` already enforces this
  and the new default-visible fields join its checked set, which is NFR-026-008.
- **Append-only memory.** Memory rows and outcome rows are appended. A
  correction is a new row referencing the original. No row is edited, which is
  P21 and FR-026-040.

---

## Observability

The design adds no telemetry service. What it adds is published evidence a
reader and a maintainer can act on.

| Signal | Where it is published | Who reads it |
| --- | --- | --- |
| `budget-measurement/v1` per run | The payload, and the validator's per-field table | A-5, to judge whether the caps are right without changing them |
| `disclosedTotal` per run | The payload, beside `total` | A-5, to see whether narrative moved behind disclosure rather than shrinking |
| Per-leg `state` and `asOf` | The payload's cross-asset block and the memory row | A-1 and A-3 |
| `resolvedThisRun` and `openCount` | The scorecard and the track-record line | A-1 and A-5 |
| `notEvaluableShare` | The scorecard, rendered beside the hit rate | A-1 |
| Refusal reason strings | The validator's non-zero exit output and the wrapper's log | A-5 |

UC-026-008's "judge whether the budget is right" depends on the first two rows
existing on every run, including the runs that passed. A measurement published
only on failure would leave a maintainer with no evidence base and only an
incident.

---

## Testing Strategy

Canonical commands, from [.specify/memory/agents.md](../../.specify/memory/agents.md).
No command is invented here.

```bash
node scripts/selftest.mjs
node scripts/validate-brief-payload.mjs
node scripts/validate-brief-payload.mjs market-brief.payload.json
```

Browser evidence, when SCOPE-04 needs it, uses the committed runner and project:

```bash
npx --no-install playwright test tests/market-brief-cockpit.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

The plan owner has since fixed the spec file name to
`tests/market-brief-cockpit.spec.mjs`, which matches the existing
`market-brief-*.spec.mjs` convention already used by
`market-brief-freshness.spec.mjs`, `market-brief-scorecard.spec.mjs` and
`market-brief-session-date-drift.spec.mjs`. That file does not exist today, so
SCOPE-04 creates it. None of the existing brief-adjacent suites covers the
cockpit.

### Scenario coverage

| Cluster | Scenarios | Where tested |
| --- | --- | --- |
| 1 — Enforced output budget | BS-026-001 to BS-026-005 | `selftest.mjs` group `rlcockpit.js — output budget`, plus a validator-level fixture proving no part publishes |
| 2 — Delta-only publishing | BS-026-006 to BS-026-010 | `selftest.mjs` group `rlcockpit.js — change vocabulary` |
| 3 — Cross-asset coverage | BS-026-011 to BS-026-016 | `selftest.mjs` group `rlcockpit.js — cross-asset legs`, over committed bars |
| 4 — Explicit blindness | BS-026-017 to BS-026-020 | `selftest.mjs` for construction and refusal, Playwright for position and non-collapsibility |
| 5 — Progressive disclosure | BS-026-021 to BS-026-024 | Playwright only. Keyboard, `file://` origin, and the negative-not-hidden assertion |
| 6 — Closed loop | BS-026-025 to BS-026-028 | `selftest.mjs` over the committed ledger and scorecard |
| 7 — Run-specific memory | BS-026-029 to BS-026-031 | `selftest.mjs` group over `compactRow` and the append path |

### Adversarial and budget tests

Each of these fails when its guard is removed. That is NFR-026-004, and a guard
without one is not a guard, per P23.

| Guard | Adversarial case |
| --- | --- |
| The change detector ignores narrative | Replace every narrative string on an unchanged instrument, leave every state field identical. `changeKind` must stay `null` and the instrument must stay in the roll-up. If the detector reads any narrative field this turns green when it should stay red |
| The budget is fail-closed | A fixture payload one character over the total cap must be refused, and a second assertion must prove no partial artifact was written |
| The budget cannot be raised to pass | A test asserts the three cap values against literals, so a change that edits the policy to rescue a failing run fails this test instead |
| The roll-up balances | A fixture that drops one instrument from both the narrative list and the roll-up must be refused, not silently accepted |
| Assertion D4 has teeth | A fixture whose composer claims `levelCrossed` on an instrument whose two states show no crossing must be refused |
| A leg never substitutes | A fixture whose driver bars are truncated to one row must raise a dark state, and must not emit `changePct: 0` |
| The dark card is complete | A fixture dark card missing any of reason, withheld or substitutionRefusal must be refused |
| The composer cannot regress to v1 | A selftest asserts `brief-refresh.mjs` writes only `market-brief-payload/v2`, so the un-refused v1 path cannot be reached from production |
| The evaluator stays on the path | A selftest asserts a production caller of `evaluate-recommendations.mjs` exists in both `tier-a.yml` and `brief-refresh-and-push.sh`. This is the producer-existence shape BUG-009 §5 identifies as the only assertion that would have caught its own defect |

---

## Delivery Increments

### Increment A — SCOPE-01 and SCOPE-02

**Files created.** `rlcockpit.js`.

**Files modified.** `market-brief.config.json` gains `output-budget/v1` and
`cross-asset/v1`. `scripts/brief-refresh.mjs` gains `buildCrossAssetReadings`.
`scripts/validate-brief-payload.mjs` gains the budget and cross-asset checks
behind the v2 contract version. `scripts/selftest.mjs` gains two groups.

**Satisfied in full.** FR-026-001 to FR-026-006, FR-026-013 to FR-026-024,
NFR-026-003, NFR-026-004, NFR-026-007, NFR-026-010.

**Satisfied partially.** FR-026-019. The crude half of the standing instruction
resolves through the energy leg. The transit and insurance halves publish as
named unresolved aspects, because no committed source covers them.

**Not satisfied.** Everything in SCOPE-03 through SCOPE-05. The default view is
not yet re-scoped, so the budget measures a payload whose rendering has not
changed. That is deliberate: the measurement must be trustworthy before the
rendering depends on it.

### Increment B — SCOPE-03

Adds `change-vocabulary/v1`, extends `compactRow` to v2, extends the appended
`brief-history.jsonl` row, and adds the four delta assertions to the validator.
Satisfies FR-026-007 to FR-026-012 and FR-026-036 to FR-026-040 in full.

### Increment C — SCOPE-04

Re-scopes the cockpit's default rendering to disclosure-first, adds the
dark-leg banner, the cross-asset strip, the changed list, the roll-up and the
track-record line, and creates the browser suite. Satisfies FR-026-025 to
FR-026-030.

### Increment D — SCOPE-05

Adds `resolvedThisRun` to the scorecard, renders the track record, and moves
`build-attention-scorecard.mjs` onto the publication path. Satisfies FR-026-031
to FR-026-035. Separable, and the declared split seam.

### Registration

No registration change. The feature adds no root page and no registered tool, so
`tools.json`, `index.html` and `rlnav.js` are untouched and the registry parity
assertion in `scripts/selftest.mjs` is unaffected. `rlcockpit.js` is a root file
with a production consumer from its first commit, so it needs no
`site-exclusions.json` entry either. P17's registry-or-exclusion control does not
apply, exactly as the specification's Release Train section states.

---

## Complexity Tracking

| Deviation | Simpler alternative considered | Why the simpler option was rejected |
| --- | --- | --- |
| A new UMD module rather than adding to `rlbrief.js` | Put the ten functions into `rlbrief.js` | `rlbrief.js` is already large and is a browser rendering module. The validator would then require a rendering module to refuse a run. A separate module keeps the pure capability importable by Node without pulling rendering in |
| A contract-version gate on the budget check | Always run the budget check in `validateBriefPayload` | The committed payload is 127,740 characters and would fail immediately. The file's own comment records that doing this for one field moved the node suite from 848 pass / 25 fail to 842 / 31, because six unrelated suites started reporting a payload-content problem. The gate is a bounded migration, not an escape hatch: the composer always stamps v2 and a selftest proves it |
| Four legs rather than the three FR-026-013 names | Publish rates, dollar and energy only | FR-026-020 puts credit in the required-leg set. Publishing three legs and darkening the fourth silently would be the quiet drop that policy 4 forbids |
| A `baseline` change kind distinct from `null` | Treat a first-seen instrument as unchanged | Calling an instrument unchanged when no prior state exists is a false statement about the past, and §5 already has a "baseline (no prior run)" rule to reuse |
| Publishing the credit leg as a labelled `Proxy` | Leave credit permanently dark, as the specification assumes | The JNK/LQD ratio is committed, the owning tool computes it, and the payload already publishes it. Darkening a leg whose measurement exists would misreport what the brief can see |
| Per-leg `asOf` rather than one block `asOf` | One timestamp for the whole cross-asset block | The four legs draw on different series with different last closes. One timestamp would misstate three of them, and the distinct-market-bar rule needs per-leg dates to dedupe weekend runs |
| Reusing `realTrailingPct` at a 5-session lookback | Write a short-horizon function in `rlcockpit.js` | P19 forbids a second definition of a metric. The existing function already takes a lookback argument |

---

## Risks & Open Questions

### Risks

| Risk | Effect | Mitigation |
| --- | --- | --- |
| The v1 to v2 contract gate is read as an advisory mode | A later change adds a flag that keeps a v2 payload publishing over budget | The selftest asserts the composer only ever stamps v2, and the CLI flag set is asserted against a literal list |
| The lane cannot author inside 3,000 characters | Every run is refused and the brief stops publishing | The wrapper already degrades to a data-only publication after `NARRATIVE_ATTEMPTS`, so a refused narrative costs the narrative and not the brief. The lane's instruction gains the caps, so the author knows the budget before writing |
| The credit-leg recommendation is rejected by the owner | The wireframe's dark-credit example stands and the design's leg table changes | The change is one policy entry and one provenance value. `resolveLeg` already produces both outcomes |
| The tracked set grows and the v2 memory row outgrows the recent window | The first-load budget suffers | `artifact-budget/v1` bounds it, and the plan owner adjusts the window size rather than the budget, per P22 |
| Assertion D4 duplicates composition logic in the validator | Two implementations drift | Both call the same `RLCOCKPIT.changeKind`. The validator supplies its own inputs, not its own function |
| BUG-009 is remedied during this feature's delivery | The decision surface changes state mid-delivery | Every surface here already handles a populated feed and an unreachable one. The three empty statements are distinct and the ranked-cards path is fixture-tested |

### Open questions carried from the specification

1. **OQ-1, rewiring the attention path.** Not absorbed. This design selects no
   BUG-009 remedy and works either way. Owner decision, routed to
   [BUG-009](../_bugs/BUG-009-decision-attention-gate-result-producer-absent/) §4.
2. **OQ-2, the three cap values.** Closed. 140, 300, 3,000, derived in the UX
   layer and adopted here unchanged.
3. **OQ-3, the short horizon.** Closed. Five trading sessions, with the
   three-and ten-session alternatives rejected on stated grounds.
4. **OQ-4, the instrument per leg.** Closed. TLT, DX-Y.NYB, USO, JNK/LQD, all
   committed, with provenance per leg.
5. **OQ-5, what resolves credit.** Closed with a recommendation requiring owner
   ratification. The ratio resolves it as a labelled proxy; the independent
   spread reading stays unavailable and is named as an absent confirmation.
6. **OQ-6, where the memory row grows.** Closed. The existing recent file
   absorbs it. Measured at roughly 1.6 KB per row and 48 KB across the 30-row
   window against a 262,144-byte contract limit.
7. **OQ-7, the minimum closed sample.** Closed. 20 is already committed in
   `scorecard-policy/v1` and already enforced. Discovered, not chosen.
8. **OQ-8, the roll-up's disclosure.** Closed in the UX layer. The membership
   list sits in the roll-up's own drawer and is outside the default-visible
   budget.

### New questions this design raises

9. **Does the owner ratify the amended FR-026-013 wording?** Until the analyst
   amends it, the requirement as written cannot be satisfied on a dark run.
   Owner: `bubbles.analyst`.
10. **Does the owner accept a `Proxy` credit leg over a permanently dark one?**
    Owner: the product owner, with `bubbles.ux` re-drawing the wireframe row if
    accepted.
11. **Does the UX owner accept the `· N first seen` roll-up clause?** Owner:
    `bubbles.ux`.
12. **Should the dollar leg publish `DX-Y.NYB` or `UUP`?** Both are committed and
    both are declared proxies in `fx-regime-universe.json`. `DX-Y.NYB` is the
    index and is recommended; `UUP` is the one the existing driver bundle
    computes as `uup63`. Owner: `bubbles.plan`, at SCOPE-02.
13. **Does the transit and insurance half of the standing instruction warrant a
    permanent unresolved statement, or should the instruction be narrowed to
    crude?** An instruction whose two-thirds can never resolve will publish two
    unresolved aspects forever. Owner: the product owner.

---

## Rejected Findings

Recorded so a later reader does not re-open them.

**The `tier-a.yml` `git add` omission of `market-brief.payload.json` is not a
defect.** `BUG-009` design.md §6 records it as `DISC-009-004`, a "secondary
finding" that "the scheduled job cannot publish the payload". Tier A does not
generate a narrative payload. `tier-a.yml`'s own header states that the written
Tier-B narrative "deliberately stays operator-hosted" and that when Tier B is
absent the cockpit renders an explicit "narrative not refreshed this window"
state. A workflow that does not produce a file correctly does not stage it.
Adding `market-brief.payload.json` to that `git add` list would stage whatever
the previous run left on disk, which is the opposite of the intended honesty.
This design does not act on `DISC-009-004`, and the BUG-009 owner should
withdraw or restate it.

**"109 open against 3 resolved" is not the ledger's state.** The ledger holds
413 keys, 304 closed, 135 resolved, and publishes a 60.7 percent hit rate. The
three are `recentMisses`, capped by `scorecard-policy/v1.recentMissCount`. The
diagnosis and its evidence are in D6.

**"Resolution is manual, so the backlog is structural" is false for the
recommendation ledger.** The evaluator runs on both publication paths and
resolves what has elapsed. It is true for the *attention* scorecard, whose
builder is genuinely off the path, and D6 separates the two.

**Educational research only. Not investment advice.**
