# BUG-014 Scopes

**Layout:** single-file
**Mode:** bugfix-fastlane
**TDD:** scenario-first

---

## Scope 1 — Tell both authoring lanes how to choose a confidence

**Status:** Done

### Implementation Files

- `scripts/build-attention-items.mjs` — `recommendationConfidenceContractInstruction()`
- `scripts/brief-narrative-parallel.mjs` — the `core` and `signals` lane wiring
- `scripts/selftest.mjs` — the eight pins and the adversarial three-branch check

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
| SCN-BUG014-GATE-HONOURS-FLOOR | **Regression E2E**, scenario-specific — `npx playwright test --project=system-chrome tests/attention-browser.spec.mjs` → `every next-session action the cockpit renders clears the committed confidence floor` |
| SCN-BUG014-FLOOR-ZERO-HONOURED | **Regression E2E**, scenario-specific — `npx playwright test --project=system-chrome tests/attention-browser.spec.mjs` → `a configured action floor of zero is honoured rather than swallowed by a falsy default` |
| SCN-BUG009-FIELD-ESCAPES | **Regression E2E**, scenario-specific — `npx playwright test --project=system-chrome tests/attention-browser.spec.mjs` → `a hostile payload string is rendered as text, not parsed as markup` |
| Broader E2E regression suite | `npx playwright test --project=system-chrome tests/attention-browser.spec.mjs` — the full decision-attention browser suite runs green alongside the new scenarios (`16 passed`) |

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
      Evidence: SUPERSEDED BY SCOPE 2, which moved the floor to 50 so the live config no
      longer has cap equal to floor. The scenario is still proven, on the fixture rather
      than on live config: passing pin `the confidence contract derives a DIFFERENT tactical
      clause for cap-below-floor, cap-above-floor and cap-equals-floor`, whose
      cap-equals-floor case asserts `exactly one admissible value`. The pin this item
      originally cited was deleted by Scope 2 and no longer exists in the suite.
- [x] The new pins are proven load-bearing by reverting the fix and observing a named
      failure, not merely by observing them pass.
      Evidence: `report.md` § Adversarial Check, exit 1 with one `✗`.
- [x] `node scripts/selftest.mjs` passes with no failures.
      Evidence: `report.md` § Validation Re-Derivation — 3241 passed / 0 failed at
      `0380cfdc2`, independently re-run by the validate phase.
- [x] `node scripts/validate-brief-payload.mjs` still passes.
      Evidence: `report.md` § Validator, exit 0.
- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior.
      Evidence: `tests/attention-browser.spec.mjs` — `every next-session action the cockpit
      renders clears the committed confidence floor`, proven falsifiable in `report.md`
      § Regression E2E.
- [x] Broader E2E regression suite passes.
      Evidence: `report.md` § Regression E2E — the full 16-test decision-attention browser
      suite, `16 passed`, re-run after the module byte-budget fix. The earlier `2 passed`
      transcript recorded only the two scenario-specific rows and did not evidence the
      broader suite; the validate phase caught that, and caught the suite being red at
      `009731726` on the module byte budget.
- [x] Scenario-specific regression E2E coverage persists in the suite for the runtime
      surface this scope touches.
      Evidence: `tests/attention-browser.spec.mjs` — `every next-session action the cockpit
      renders clears the committed confidence floor`; `report.md` § Regression E2E.
- [x] The broader E2E regression suite runs green with that scenario in it.
      Evidence: `report.md` § Regression E2E, `16 passed`.
- [x] No threshold value, gate function, or payload schema is modified. (FR-014-006)
      Evidence: `git diff --numstat` lists exactly three files, recorded in `report.md`.

---

## Scope 2 — Adjudicate the cap-to-floor collision

**Status:** Done

### Implementation Files

- `market-brief.config.json` — `thresholds.minimumActionConfidence`, 55 to 50
- `market-brief.config.page.json` — regenerated derived artifact
- `scripts/selftest.mjs` — the cap-above-floor invariant and the live-band assertion

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
| SCN-BUG014-GATE-HONOURS-FLOOR | **Regression E2E**, scenario-specific — `npx playwright test --project=system-chrome tests/attention-browser.spec.mjs` → `every next-session action the cockpit renders clears the committed confidence floor` |
| Broader E2E regression suite | `npx playwright test --project=system-chrome tests/attention-browser.spec.mjs` — the full decision-attention browser suite runs green alongside the new scenario |

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
- [x] SCN-BUG014-GATE-HONOURS-FLOOR carries scenario-specific regression E2E coverage that
      persists in the suite rather than being run once by hand.
      Evidence: `tests/attention-browser.spec.mjs` — `every next-session action the cockpit
      renders clears the committed confidence floor`; `report.md` § Regression E2E.
- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior.
      Evidence: same scenario, proven falsifiable at floor 60 in `report.md` § Regression E2E.
- [x] Broader E2E regression suite passes.
      Evidence: `report.md` § Regression E2E — `2 passed`.
- [x] The broader E2E regression suite runs green with the new scenario in it.
      Evidence: `report.md` § Regression E2E, full `tests/attention-browser.spec.mjs` run.
- [x] The new E2E scenario is proven falsifiable rather than tautological.
      Evidence: `report.md` § Regression E2E — with the floor temporarily at 60 it fails
      naming 7 rendered actions beneath it, and passes again once restored.

**Evidence:** `report.md` § Threshold Decision.

---

## Scope 3 — Bound the hidden detail, and name the narrative keys

**Status:** Done

Added 2026-08-22 after the audit found two shipped mechanisms with no requirement,
scenario or Definition of Done anywhere in the three packets. The code was delivered and
covered by the suite; what was missing was the record. Documenting scope after the fact is
worse than documenting it first, and better than leaving delivered behaviour unrecorded.

### Test Plan

```gherkin
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

| Scenario | Where proven |
| --- | --- |
| SCN-BUG014-DETAIL-BOUNDED | `scripts/selftest.mjs` — detail-cap off-by-one and visible-field partition |
| SCN-BUG014-KEYS-NAMED | `scripts/selftest.mjs` — backdrop clause and lane import/interpolation |

### Definition of Done

- [x] SCN-BUG014-DETAIL-BOUNDED: the declared detail field is absent from
      `defaultVisibleFields`, a value one character over `detailFieldChars` is refused by
      its own path, and a value exactly at the cap is admitted. (FR-014-008)
      Evidence: passing pins `every declared detail field is absent from defaultVisibleFields`
      and `the detail cap refuses a rationale one character over and admits one exactly at
      the cap`.
- [x] The cap sits above the observed maximum so nothing already authored breaches it, and
      the lane is told it. (FR-014-008)
      Evidence: `market-brief.config.json` `rationaleDecisionNote` records max 575 against a
      cap of 700; passing pin `the detail budget is stated to the author with the enforced
      cap`.
- [x] SCN-BUG014-KEYS-NAMED: the instruction names the literal keys from the declared list
      and calls out the one pair whose name differs. (FR-014-009)
      Evidence: passing pin `the backdrop clause names every declared backdrop key and calls
      out the one pair that does NOT share a name across the two blocks`.
- [x] The lane both imports AND interpolates it, so neither half can rot. (FR-014-009)
      Evidence: passing pin `the core lane imports AND interpolates the backdrop key
      contract`.
- [x] Both pins are proven load-bearing rather than assumed.
      Evidence: `report.md` § Independent Audit — dropping the interpolation and truncating
      the derivation each fail by name, and each passes again when restored.
- [x] `node scripts/selftest.mjs` passes with no failures.
      Evidence: `report.md` § Validation Re-Derivation — 3242 passed / 0 failed.
- [x] Scenario-specific E2E regression coverage persists for the runtime surface this scope
      touches, and the broader suite runs green with it.
      Evidence: `report.md` § Regression E2E — `16 passed`, full
      `tests/attention-browser.spec.mjs` run. `git show --stat` in § Code Diff Evidence.

**Evidence:** `report.md` § Independent Audit.
