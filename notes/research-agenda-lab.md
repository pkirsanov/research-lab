# Research Agenda Lab

## Purpose

The Research Agenda Lab is the owning reader for recurring public-market research. It shows the immutable current generation first, retains every missing or unavailable section, and keeps dated history separate. It does not turn a prior dossier into a current conclusion.

The initial agenda contains three public topics:

- Geopolitical supply shock, reviewed every brief generation.
- Defense earnings acceleration, reviewed on a seven-day cadence.
- Food, grains, and fertilizer, reviewed on a seven-day cadence.

The registry is [research-agenda.json](../research-agenda.json). The active generation pointer is [research/agenda/current.json](../research/agenda/current.json), and immutable review, dossier, generation, and append-only history artifacts live beneath `research/agenda/`.

## Current Truth

The current committed generation is dated 2026-08-13. Its geopolitical and defense reviews are unavailable because the optional research lane did not produce validated dossiers. The food-inputs topic was deferred by the cadence budget.

That state is intentional and visible:

- Simple shows the named current reason.
- No current scenario chart, transmission range, or proxy range is invented.
- The five assumption controls remain disabled because no published replay inputs exist.
- Power may show the August 10 geopolitical dossier only inside a dated historical band.
- The historical dossier never supplies the current posture or a current chart.

## One Compute Owner

`RLAGENDA.computeAgendaViewState(definition, review, leverState)` is the sole browser view-state owner. Simple and Power consume the same result. When a future validated review contains `modelOutputs.publishedInputs`, the function:

1. Recomputes scenario probabilities from published evidence impacts.
2. Recomputes unique physical flow by scenario.
3. Recomputes all declared transmission ranges.
4. Recomputes public proxy ranges against the retained calibration events.
5. Builds chart rows through `buildAgendaChartSeries`.
6. Compares the baseline recomputation with stored model output.

A baseline mismatch blocks honest chart use. User changes are marked `user-assumption`; they never edit evidence, history, or the published review.

## Controls

| Control | Range | Unit | Meaning |
| --- | ---: | --- | --- |
| Hormuz physical pass | 0 to 1 | normalized share | Assumed physical pass fraction at Hormuz. |
| Bab el-Mandeb physical pass | 0 to 1 | normalized share | Assumed physical pass fraction at Bab el-Mandeb. |
| Rerouted share | 0 to 1 | normalized share | Share eligible for the declared alternate-route capacity. |
| Inventory / policy response | -1 to 1 | decimal return | Additive policy and inventory response offset. |
| Demand offset | -1 to 1 | decimal return | Additive demand-side offset. |

Each slider has a keyboard-operable numeric input. Reset restores published values. Lever changes perform synchronous local compute and make no network request.

## Historical Dossier

The August 10 dossier is a historical seed, not a predecessor and not current evidence. Its source note is [us-iran-oil-market-intervention-patterns.md](us-iran-oil-market-intervention-patterns.md). The page displays its date, observed-through time, scenario rows, findings, causal paths, limitations, and public source ledger.

The historical scenario probabilities and oil ranges are dated analyst estimates. They are educational context, not a current forecast or investment advice.

## Topic Registry And Review Modes

[research-agenda.json](../research-agenda.json) is the static registry. Each topic declares:

- `topicId` — immutable key used in URL routing and artifact references.
- `reviewPolicy.mode` — one of two modes:
  - `every-generation`: attempted every brief generation regardless of elapsed time. The global policy caps concurrent every-generation topics (`maxActiveEveryGenerationTopics`).
  - `cadence`: selected when `cadenceDays` has elapsed since the last review. Cadence topics compete for a per-generation slot (`cadenceTopicReviewBudget`); extras are deferred by budget.
- `lifecycleState` — `active`, `paused`, or `retired`. Only active topics enter the generation plan.
- `scopeBoundary` — geographies, channels, horizons, and a `publicOnly` flag enforced at the artifact layer.

Cadence selection order when multiple topics are due: trigger-fired-first, then oldest-last-review, then declaration order, then topic ID.

## Generation Lifecycle And Outcome States

Each generation classifies every active topic in two passes.

**Plan topic states** (before research runs): `selected`, `not-due`, `paused`, `retired`, `deferred`, `refused`.

- `selected` — topic will be researched this generation.
- `not-due` — cadence has not elapsed; topic is skipped cleanly.
- `deferred` — cadence elapsed but the budget slot was taken by a higher-priority topic.
- `refused` — registry definition failed schema validation; topic is blocked from selection.

**Current topic states** (after research completes): `reviewed`, `unavailable`, `paused`, `retired`, `deferred`, `not-due`, `refused`.

- `reviewed` — research ran and produced a review record.
- `unavailable` — research was attempted but did not produce a validated dossier.

**Review outcomes** on a completed review record: `updated`, `unchanged`, `stale`, `unavailable`.

- `updated` — new validated dossier produced and linked.
- `unchanged` — prior dossier remains current; predecessor reference is retained.
- `stale` — review ran but result is stale relative to the generation.
- `unavailable` — review could not complete; no dossier reference is set.

Simple shows the named current reason for any non-reviewed topic. Power retains the full historical record. No state is invented or hidden.

## Evidence Weighting

Each evidence item carries a multiplicative weight:

`weight = confidence × provenance × role × corroboration × freshness × refuter`

- `confidence` — declared evidence confidence (0–1).
- `provenance` — `observed-fact` (full weight), `model-estimate` (discounted), `user-assumption` (discounted), `unavailable` (0).
- `role` — direct, indirect, conflicting, or refuting; role caps the maximum absolute impact.
- `corroboration` — increases when multiple independent sources support the same claim.
- `freshness` — decays with evidence age relative to the declared observation window.
- `refuter` — set to 0 when a refuting evidence record fires against this item.

Evidence with `weight === 0` is excluded from scenario probability computation. The exclusion reason is recorded as `fired-refuter`, `freshness`, or `quality-factor`. User lever changes recompute the same function without modifying evidence records.

## Simple/Power Split

The `#modeSeg` toggle switches between two views. URL hash encodes mode and topic: `#simple/<topicId>` and `#power/<topicId>`.

**Simple** (the `#simpleOnly` section, hidden in Power): the current-decision cockpit. Shows current topic state, named reason for any unavailable or deferred outcome, and the compact brief read. No chart or dossier workspace is shown.

**Power** (`.pw` sections, hidden in Simple): the full dossier workspace. Shows the scenario probability fan, transmission and proxy ranges, full evidence list with per-item weights and exclusion reasons, historical dossier in a dated band, and source ledger.

Both views call the same `RLAGENDA.computeAgendaViewState`; Simple surfaces the conclusion while Power exposes the model internals. A historical dossier in Power is never presented as current evidence.

## Public Safety And Feature 020

Every public artifact is recursively checked for private portfolio and credential fields. The feature accepts public tickers and public-market objects only. It stores no account, holding, quantity, cost basis, profit and loss, token, key, password, or secret.

The Feature 020 seam contains immutable topic, dossier, finding, evidence, source, trigger, and invalidation references. It contains no destination, eligibility, action family, attention envelope, anomaly seed, alert candidate, routing decision, or score.

## Reader Contract

- `#simple/<topicId>` opens the current-decision cockpit.
- `#power/<topicId>` opens the full dossier workspace and focuses the topic heading.
- A missing public target is normalized rather than reported as a successful deep link.
- The Market Brief carries a compact read and deep-links here for detail.
- All source and ticker links are native links with referrer suppression.

## Validation

```bash
node scripts/selftest.mjs
node --test tests/tool-experience-registry.functional.mjs
node scripts/validate-brief-payload.mjs
npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

## Next Run

1. Generate the next brief through the governed refresh path.
2. Confirm the every-generation geopolitical topic is selected.
3. Inspect acquisition and authoring outcome names without substituting prior history.
4. If a validated current model is published, confirm baseline parity before reading charts.
5. Review direct, indirect, conflicting, and refuting evidence separately.
6. Record refinements only when they preserve the declared question and scope boundary bytes.

## Known Limitations

**FINDING-RT-01 (Open, Low):** The `containsPrivateField` guard in `rlagenda.js` matches exact private field names via regex. Number-injected variants (`p0sition`) and underscore-split variants (`shares_owned`) are not matched by that pattern. An observation value labeled `p0sition` passes both `containsPrivateField` and `validatePublicResearchArtifact` (which splits on non-alphanumeric only, treating `0` as alphanumeric). The downstream `exactShape` check in `validatePublishedFinding` provides a second layer but applies only at the finding stage, not on raw trigger observation values. The guard is not claimed as exhaustive against obfuscated field names.

Educational research only. Not investment advice.