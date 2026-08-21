# BUG-014 Specification

## Problem Statement

The `confidence` field on a published recommendation is inert. It is authored as the
same number on every item in every run, while two consumers depend on it varying: one
ranks by it and one gates on it. A reader shown a "ranked" action slate is shown an
authoring order, and an operator who moves a confidence threshold gets either the whole
slate or none of it.

## Requirements

### FR-014-001 — The authoring lanes state how to choose a confidence

Every lane that authors a `confidence` MUST receive an instruction that states what the
number means, that it gates, that it ranks, and that it must vary across items.

### FR-014-002 — The stated bands are rendered from the enforced bands

The instruction MUST derive `minimumActionConfidence`, `minimumAttentionConfidence` and
`tacticalConfidenceCap` from `market-brief.config.json`. It MUST NOT restate them as
literals, so the bands the author is given and the bands the gate enforces cannot drift.

### FR-014-003 — The tactical clause follows the cap-to-floor relationship

The cap and the floor are independent config values. The instruction MUST derive its
tactical clause from their relationship:

| Relationship | Required clause |
|---|---|
| cap < floor | a tactical read cannot become an action at all |
| cap = floor | a tactical action has exactly one admissible value |
| cap > floor | a tactical item may occupy the band floor..cap |

### FR-014-004 — No second hand-typed copy survives

The previously hand-typed tactical-cap sentence MUST be removed rather than left beside
the rendered contract, because two copies is the drift this packet closes.

### FR-014-005 — Both authoring lanes receive it

The `core` lane (which owns `nextSession` actions) and the `signals` lane (which owns
`recommendations`) MUST both render the contract. A contract rendered to one lane leaves
the other anchoring exactly as before.

### FR-014-006 — The threshold collision is stated, not silently changed

The packet MUST record that `tacticalConfidenceCap` equals `minimumActionConfidence` in
committed config, and MUST NOT alter either value. Threshold placement is a product
tradeoff owned by the operator.

## Scenarios

```gherkin
Scenario: SCN-BUG014-BANDS-RENDERED
  Given market-brief.config.json declares the three confidence thresholds
  When the confidence contract is rendered
  Then it states each of those three enforced values
  And it holds no literal copy of them independent of config

Scenario: SCN-BUG014-RANKING-STATED
  Given surviving actions are sorted by confidence and then sliced
  When the confidence contract is rendered
  Then it tells the author the number ranks
  And it tells the author to vary it across items

Scenario: SCN-BUG014-TACTICAL-RELATIONSHIP
  Given the tactical cap and the action floor are independent values
  When the cap is below, equal to, and above the floor in turn
  Then the contract derives a different tactical clause for each case

Scenario: SCN-BUG014-BOTH-LANES
  Given the core lane authors nextSession actions and the signals lane authors recommendations
  When the lane source is inspected
  Then both lanes interpolate the confidence contract
  And the hand-typed tactical-cap sentence is absent

Scenario: SCN-BUG014-COLLISION-DISCLOSED
  Given committed config sets the tactical cap equal to the action floor
  When the contract is rendered against that config
  Then it states plainly that a tactical action has exactly one admissible value
  And neither threshold is modified by this packet
```

## Out Of Scope

Changing any threshold value. Changing `nextSessionActions` or `actionableAttention`.
Backfilling the confidence of already-published recommendations.
