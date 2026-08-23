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

**SUPERSEDED 2026-08-22 by FR-014-007. The original text is kept below because a requirement
that was shipped against should be visible, not quietly rewritten.**

> The packet MUST record that `tacticalConfidenceCap` equals `minimumActionConfidence` in
> committed config, and MUST NOT alter either value. Threshold placement is a product
> tradeoff owned by the operator.

### FR-014-007 — The threshold collision is adjudicated on delegated authority

The operator delegated the decision on 2026-08-20 ("i approve your judgement on fixes, go
ahead and pick solution for long term"). FR-014-006 assumed the packet could only *state*
the collision. It could not: the publish validator refuses an action below
`minimumActionConfidence` and a tactical action above `tacticalConfidenceCap`, both were
55, so a tactical action had exactly ONE admissible value — and a tactical action published
on all 34 measured runs. The degeneracy was continuous, not theoretical.

`tacticalConfidenceCap` MUST remain 55, because `notes/market-brief.md` states that
ceiling twice as anti-reactivity doctrine. `minimumActionConfidence` MUST sit strictly
below it, so a tactical action has a band rather than a point. The committed value is 50.
The change MUST exclude nothing already published; the lowest confidence ever published
across all measured runs is 55, so it does not.

A configuration where the cap does not sit strictly above the floor MUST be refused by the
suite, so neither the degenerate arrangement nor the unsatisfiable one can land silently.

### FR-014-008 — A hidden detail field is bounded, not unmeasured

Added 2026-08-22, on the same delegated authority, after an audit found the mechanism
shipped with no requirement of its own.

`attention[].rationale` sits behind the card and MUST stay out of `defaultVisibleFields`:
the brief's stated shape is a short card whose detail opens on demand. Folding it in was
measured and rejected — the live card was 194 against a 300 cap and its rationale 575, so
folding would have refused the only item the feed was publishing.

Being hidden MUST NOT mean being unbounded. A declared detail field MUST carry its own cap
(`detailFieldChars`), measured by the single output-budget owner and never folded into the
per-card or total budget. The cap MUST sit above the observed maximum so nothing already
authored breaches it, and the lane MUST be told the cap, because a budget breach discards
the whole narrative.

### FR-014-009 — The lane is told the narrative KEYS, not a description of them

Added 2026-08-22, same authority and same reason.

Any instruction that asks the lane to author a named block MUST render the literal keys
from the same declared list the publication gate judges against. Prose that describes
fields without naming keys is not sufficient: the core lane was told to "name the ...
structural trend", and because most `regime`/`backdrop` pairs share a name, one run in
twelve invented `backdrop.structuralTrend` — a third structural narrative beside two
already-populated declared homes, read by no renderer.

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
  Given a configuration whose tactical cap equals the action floor
  When the contract is rendered against that configuration
  Then it states plainly that a tactical action has exactly one admissible value

Scenario: SCN-BUG014-BAND-EXISTS
  Given the publish validator refuses an action below the floor and a tactical action above the cap
  When the committed thresholds are read
  Then the tactical cap is strictly greater than the action floor
  And a tactical action is not forced onto a single admissible value

Scenario: SCN-BUG014-DETAIL-BOUNDED
  Given a detail field declared behind the card rather than on it
  When the output budget is measured
  Then the field is absent from the visible-field list
  And a value one character over the detail cap is refused by its own path
  And a value exactly at the cap is admitted

Scenario: SCN-BUG014-KEYS-NAMED
  Given a lane instruction that asks for a named narrative block
  When that instruction is rendered
  Then it names the literal keys taken from the declared list the gate judges against
  And it calls out the one pair whose name differs across the two blocks
```

**SCN-BUG014-COLLISION-DISCLOSED was amended 2026-08-22.** It previously ended with "And
neither threshold is modified by this packet", and asserted its Given against *committed*
config. FR-014-007 supersedes that: the floor moved to 50, so the cap-equals-floor case is
now proven on a fixture through the `thresholdsOverride` seam rather than on live config,
and SCN-BUG014-BAND-EXISTS asserts what live config must now satisfy. Both run.

## Out Of Scope

Changing `nextSessionActions` or `actionableAttention`. Backfilling the confidence of
already-published recommendations.

**Amended 2026-08-22.** This section previously read "Changing any threshold value", which
FR-014-007 supersedes for `minimumActionConfidence` only. `tacticalConfidenceCap`,
`minimumAttentionConfidence`, `attentionMaxCards` and `nextSessionMaxActions` remain out of
scope and are unchanged.
