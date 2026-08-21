# BUG-014 Scopes

**Layout:** single-file
**Mode:** bugfix-fastlane
**TDD:** scenario-first

---

## Scope 1 — Tell both authoring lanes how to choose a confidence

**Status:** Done

### Test Plan

Scenario-first ordering, proven in both directions.

**RED (failing proof, before the fix):** with the contract absent the lane carried the
hand-typed sentence `Keep tactical confidence at or below the configured cap.` and
rendered no contract. Every pin below failed, because
`recommendationConfidenceContractInstruction` did not exist and the lane interpolated
nothing.

**GREEN (after the fix):** `node scripts/selftest.mjs` reports `3200 passed, 0 failed`.

**RED re-proved after GREEN:** the core-lane interpolation was removed from the fixed
source and the suite re-run, producing exit 1 and exactly one `✗` naming the pin. The
wiring was restored and the suite returned to `3200 passed, 0 failed`. A pin that cannot
fail is decoration, so the ordering is demonstrated rather than asserted.

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

| Scenario | Where proven |
|---|---|
| SCN-BUG014-BANDS-RENDERED | `scripts/selftest.mjs`, three assertions, one per threshold |
| SCN-BUG014-RANKING-STATED | `scripts/selftest.mjs`, ranks-and-varies assertion |
| SCN-BUG014-TACTICAL-RELATIONSHIP | `scripts/selftest.mjs`, three-branch override assertion |
| SCN-BUG014-BOTH-LANES | `scripts/selftest.mjs`, core-region and `laneRenders` assertion |
| SCN-BUG014-COLLISION-DISCLOSED | `scripts/selftest.mjs`, live-config clause assertion |

### Definition of Done

- [x] `recommendationConfidenceContractInstruction()` exists in
      `scripts/build-attention-items.mjs` and renders without throwing.
      Evidence: `report.md` § Rendered Output.
- [x] SCN-BUG014-BANDS-RENDERED: when the confidence contract is rendered it states each
      of the three enforced threshold values declared in `market-brief.config.json`, and
      it holds no literal copy of them independent of config. (FR-014-002)
      Evidence: three passing pins named in `report.md` § Test Evidence.
- [x] SCN-BUG014-RANKING-STATED: given surviving actions are sorted by confidence and
      then sliced, the rendered contract tells the author the number ranks, and tells the
      author to vary it across items. (FR-014-001)
      Evidence: passing pin `the confidence contract tells the author the number ranks, and to vary it`.
- [x] SCN-BUG014-TACTICAL-RELATIONSHIP: given the tactical cap and the action floor are
      independent values, when the cap is below, equal to, and above the floor in turn,
      the contract derives a different tactical clause for each case. (FR-014-003)
      Evidence: passing pin `derives a DIFFERENT tactical clause`, exercised through the
      `thresholdsOverride` seam.
- [x] SCN-BUG014-BOTH-LANES: given the core lane authors nextSession actions and the
      signals lane authors recommendations, when the lane source is inspected both lanes
      interpolate the confidence contract, and the hand-typed tactical-cap sentence is
      absent. (FR-014-005, FR-014-004)
      Evidence: passing pins `both the core and signals lanes render the confidence contract`
      and `the hand-typed tactical-cap sentence is gone`; `grep -c` returns 0 in
      `report.md` § No Second Copy.
- [x] SCN-BUG014-COLLISION-DISCLOSED: given committed config sets the tactical cap equal
      to the action floor, when the contract is rendered against that config it states
      plainly that a tactical action has exactly one admissible value, and neither
      threshold is modified by this packet. (FR-014-006)
      Evidence: passing pin `live config has the tactical cap equal to the action floor`.
- [x] The new pins are proven load-bearing by reverting the fix and observing a named
      failure, not merely by observing them pass.
      Evidence: `report.md` § Adversarial Check, exit 1 with one `✗`.
- [x] `node scripts/selftest.mjs` passes with no failures.
      Evidence: `report.md` § Test Evidence, 3200 passed / 0 failed.
- [x] `node scripts/validate-brief-payload.mjs` still passes.
      Evidence: `report.md` § Validator, exit 0.
- [x] No threshold value, gate function, or payload schema is modified. (FR-014-006)
      Evidence: `git diff --numstat` lists exactly three files, recorded in `report.md`.

---

## Scope 2 — Adjudicate the cap-to-floor collision

**Status:** Done

Decided 2026-08-20 on delegated authority, against measurement rather than preference.
`tacticalConfidenceCap` stays at 55 and `minimumActionConfidence` moves to 50.

The cap is doctrine: `notes/market-brief.md` states the ≤ 55 tactical ceiling twice as the
anti-reactivity rule, so raising it to open a band would weaken the constraint the cap
exists to impose. The floor is a tunable noise bar with no such standing. Moving the floor
is also **non-destructive**: the lowest confidence ever published across 34 runs is 55, so
nothing already authored falls outside the new band and nothing new is forced in — it only
gives a tactical action somewhere to stand.

Leaving the collision was seriously considered once structural actions turned out to vary.
It was rejected because tactical actions publish on **every single run** and each is forced
to one legal value, so the degeneracy is continuous rather than theoretical.

### Test Plan

```gherkin
Scenario: SCN-BUG014-BAND-EXISTS
  Given the publish validator refuses an action below the floor and a tactical action above the cap
  When the committed thresholds are read
  Then the tactical cap is strictly greater than the action floor
  And a tactical action is not forced onto a single admissible value

Scenario: SCN-BUG014-CONTRACT-FOLLOWS-CONFIG
  Given the confidence contract derives its tactical clause from the threshold relationship
  When the floor moves below the cap
  Then the rendered contract states the resulting band
  And no code change is required for it to do so
```

| Scenario | Where proven |
| --- | --- |
| SCN-BUG014-BAND-EXISTS | `scripts/selftest.mjs` — cap-above-floor invariant |
| SCN-BUG014-CONTRACT-FOLLOWS-CONFIG | `scripts/selftest.mjs` — live-band assertion |

### Definition of Done

- [x] SCN-BUG014-BAND-EXISTS: the committed `tacticalConfidenceCap` is strictly greater
      than `minimumActionConfidence`, so a tactical action is not forced onto a single
      admissible value. (FR-014-006)
      Evidence: passing pin `the tactical cap leaves a band above the action floor`.
- [x] SCN-BUG014-CONTRACT-FOLLOWS-CONFIG: the rendered contract states the new band with
      no code change, proving the relationship was derived rather than hard-coded.
      Evidence: passing pin `live config gives tactical a real band`; the contract renders
      "may only occupy 50 to 55".
- [x] The change excludes nothing already published.
      Evidence: lowest action confidence across 34 committed runs is 55, in `report.md`
      § Threshold Decision.
- [x] The derived page config is regenerated and the whole suite is green.
      Evidence: `report.md` § Test Evidence, 3212 passed / 0 failed, validator exit 0.

**Evidence:** `report.md` § Threshold Decision.
