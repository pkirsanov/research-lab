# Scope 4: Headless Consumption Path

## 04-headless-consumption-path

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** consumption, injection-seam, refusal-preservation, selftest-reconciliation
Depends On: Scopes 1, 2, 3 — the contract, a written artifact, and the admission rule

**Primary Outcome:** `buildBondRegimeToolRead` resolves the committed artifact
when `deps.nominalCurve` is `undefined`, admits each family through
`admitCurveFamily`, and passes the result into the **existing, unwidened**
`nominalCurve` / `realCurve` seam of `bondRegimeOwnerState`. The unchanged
`computeBondLabViewModel` then classifies. The duration axis, the curve level,
the curve impulse and the inflation family resolve; the credit axis stays
`Indeterminate` and the published `state` stays `unavailable`. The committed
live-read assertions in `scripts/selftest.mjs` are reconciled to branch on the
admission verdict, so both branches assert and neither is a free pass.

## Requirement Coverage

- FR-018-022 — the artifact's families are supplied through the existing
  `nominalCurve` and `realCurve` parameters. No second injection route is added
  and the seam is not widened.
- FR-018-023 — no classifier, threshold, ratio, sleeve or scenario term is
  defined, duplicated or approximated. Classification stays the page's own
  functions loaded by `scripts/brief-refresh.mjs`.
- FR-018-025, FR-018-026 — curve level and curve impulse remain separate
  published records, and curve level alone produces no directional duration
  posture.
- FR-018-027 — breakeven rows are derived only on exact common dates, with no
  forward-fill, interpolation or nearest-date match.
- FR-018-028 — real yield and derived breakeven remain separate evidence
  families.
- FR-018-029 — `curveAsOf` carries a real date whenever the nominal family is
  consumed and `null` whenever it is not.
- FR-018-030 — an absent artifact supplies the existing `unavailableCurveFamily`
  shape and publishes the same named-absence form the brief publishes today.
- FR-018-031 — a stale artifact's rows are not consumed as current evidence.
- FR-018-033 — an artifact that fails validation has no row reach the model.
- FR-018-034 — no absence, staleness or validation failure publishes a zero, an
  empty-but-plausible family or a neutral filler value.
- FR-018-035 — the three-family refusal rule is unchanged.
- FR-018-038 — `curveAdmission` is added; no existing metric is renamed, retyped
  or removed.

## Gherkin Scenarios

```gherkin
Scenario: SCN-018-015 A missing artifact publishes today's named absence
  Given no published official curve artifact exists
  When the headless bond read is composed
  Then the curve, curve impulse and inflation families are Unavailable
  And the published read names the Treasury yield curve and the real-yield break-evens as gaps
  And no verdict, zero or neutral filler value is published in their place

Scenario: SCN-018-016 An artifact failing validation is not consumed
  Given a published artifact that fails its validation gate
  When the headless bond read is composed
  Then no row from that artifact reaches the model
  And the published read is the named-absence form with a reason naming the validation failure class
  And the reason contains no source URL fragment and no observed value

Scenario: SCN-018-017 The three-family refusal rule is unchanged
  Given both official curve families are published, fresh and valid
  And no independent credit-spread observation exists
  When the headless bond read is composed
  Then the duration posture is not Indeterminate
  And the credit regime is still Indeterminate
  And the published state is unavailable
  And the published read names the credit-spread gap alone and no longer names the curve

Scenario: SCN-018-013 Curve level alone still cannot set a duration posture
  Given the published curve level is Inverted
  And the curve impulse carries no directional change
  And the inflation state is Unavailable
  When the duration posture is classified
  Then it is not Shorten and not Extend on the level alone

Scenario: SCN-018-014 Breakeven exists only on exact common dates
  Given a nominal observation exists on a date with no matching real observation
  When breakeven rows are derived
  Then no breakeven row exists for that date
  And the breakeven row count equals the exact common-date count
  And no value is forward-filled, interpolated or matched to a nearby date

Scenario: SCN-018-029 A stale artifact withholds its rows and names its last good as-of
  Given the admission verdict for a family is stale
  When the headless bond read is composed
  Then no row from that family reaches the model
  And curveAsOf is null
  And curveAdmission carries the staleness verdict, its error code and lastGoodObservedAt

Scenario: SCN-018-030 The live read asserts an implication rather than a fixed outcome
  Given the committed artifact's admission verdict at the time the suite runs
  When the live bond read is asserted
  Then an admitted verdict asserts durationPosture is not Indeterminate and the curve gap is absent
  And a refused verdict asserts durationPosture is Indeterminate, the curve gap is named, and curveAdmission carries a non-empty reason and code
  And neither branch is a free pass

Scenario: SCN-018-031 The absent-curve adversarial case states the absence it means
  Given the adversarial case that exercises a bond read with no curve families
  When it is composed
  Then it passes explicit named absences for both curve families
  And it does not rely on the repository happening to hold no artifact
```

## Implementation Files

### New

- `tests/fixtures/official-curves/invalid-for-consumption.json`
- `tests/fixtures/official-curves/stale-for-consumption.json`

### Modified

- `scripts/owner-state.mjs`
- `scripts/brief-refresh.mjs`
- `scripts/selftest.mjs`
- `notes/bond-regime-lab.md`

## Implementation Plan

1. Promote `unavailableCurveFamily` in `scripts/owner-state.mjs` from
   module-private to an export, with its shape and its `retrievedAt: null` rule
   untouched, so the artifact reader and the tests construct the canonical named
   absence rather than a second hand-written one.
2. Add `officialCurveArtifact(root)` to `scripts/owner-state.mjs`: read and
   JSON-parse `data/curves/us-treasury/curve.json`, return `null` when absent or
   unparsable. It assembles inputs only — no classification, no freshness
   verdict — preserving the boundary stated at `scripts/owner-state.mjs:419-420`.
3. Leave `bondRegimeOwnerState` itself unchanged. The seam is used as-is.
4. In `buildBondRegimeToolRead`, resolve each family only when
   `deps.nominalCurve` / `deps.realCurve` is `undefined`, mirroring the
   precedence `bondRegimeOwnerState` already uses. The explicit-`deps` branch is
   untouched, so every injection-based adversarial case in the suite keeps its
   exact current semantics.
5. Apply a read-time contract check before admission: an artifact that fails the
   gate's shape checks resolves to
   `unavailableCurveFamily(policy, 'BRL-CURVE-ARTIFACT-INVALID')` and no row from
   it reaches the model, independently of whether the gate was run in that
   process.
6. Route every non-`current` admission verdict to
   `unavailableCurveFamily(policy, code)` extended with the additive `admission`
   block, so a withheld family is a named absence rather than a family carrying
   rows the model might classify.
7. Surface the admission block as an additive `curveAdmission` metric on the tool
   read. Rename, retype and remove nothing else.
8. Leave `evidenceGaps` computed where it already is, at
   `scripts/brief-refresh.mjs:1554-1558`, from the model's own states. The gap
   list narrows by itself when the families resolve; no gap string is edited.
9. Reconcile the committed live-read assertions in `scripts/selftest.mjs`:
   replace the fixed both-axes-unresolved assertion at `:5638-5648` and the
   consequence-clause assertion at `:5697-5698` with a branch on the artifact's
   own admission verdict, where the admitted branch asserts
   `durationPosture !== 'Indeterminate'`, the curve gap absent and `curveState` a
   member of the model's curve-state vocabulary rather than a literal, and the
   refused branch asserts `durationPosture === 'Indeterminate'`, the curve gap
   named, and `curveAdmission` carrying a non-empty reason and code.
10. Change ADVERSARIAL 3 at `scripts/selftest.mjs:5686` to pass explicit named
    absences for both curve families instead of relying on the repository
    happening to hold no artifact. ADVERSARIAL 1, 2 and 4 pass explicit families
    or an explicit `snapshot: null` and are **unchanged**.
11. Update the block comment at `scripts/selftest.mjs:5615-5622` so its statement
    that the repository commits only the credit price ratio matches the tree
    after the artifact lands. The force of the block — driving one builder with
    families explicitly present and explicitly absent — is preserved exactly.
12. Register a `bond-regime — headless curve consumption` group in
    `scripts/selftest.mjs` for the absent, invalid, stale and fresh cases.
13. Record the resolution precedence, the read-time contract check and the
    reconciliation in `notes/bond-regime-lab.md`.

## The Committed Assertion This Scope Must Satisfy

`scripts/selftest.mjs:5670-5682` — the block labelled ADVERSARIAL 2 — already
encodes the expected post-feature outcome and is committed to this repository
today:

```js
assert(bondCurveOnly.state === 'unavailable' && !bondCurveOnly.metrics.evidenceGaps.includes('the Treasury yield curve')
  && bondCurveOnly.metrics.evidenceGaps.includes('an independent credit-spread reading') && !/Treasury yield curve/.test(bondCurveOnly.read), ...);
assert(/so the credit call cannot be made/.test(bondCurveOnly.read) && !/duration call/.test(bondCurveOnly.read)
  && bondCurveOnly.metrics.durationPosture !== 'Indeterminate', ...);
```

**This scope satisfies that assertion; it does not modify it and it does not
contradict it.** TP-04-03 runs it unmodified against a real acquired artifact
rather than against a hand-built fixture, which is the difference this feature
makes: the same expectation, now reachable from committed evidence. Published
`state` stays `unavailable`, `durationPosture` resolves, and `evidenceGaps`
narrows to the credit gap alone. Any implementation that leaves `state` reading
`ready`, or that empties `evidenceGaps`, has broken the refusal rather than
supplied evidence to it.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `scripts/owner-state.mjs` | Two additive exports; `bondRegimeOwnerState` unchanged | Every server-side tool read | High — a changed seam breaks every adversarial case that proves the refusal is computed | Run `node scripts/selftest.mjs` with only the two exports added and require exit 0 with ADVERSARIAL 1-4 green | Revert the two exports; `bondRegimeOwnerState` was never edited |
| `buildBondRegimeToolRead` | Resolution added on the `undefined` branch only | The published payload and the suite's live read | High — resolving on the explicit branch would silently override every injected fixture | Assert an explicit `deps.nominalCurve` still wins over a present artifact | Remove the resolution branch; the `undefined` case returns to a named absence |
| `scripts/selftest.mjs` live bond assertions | Fixed outcome replaced with a verdict branch | The whole-repo gate | High — a wrong reconciliation either flakes as the artifact ages or stops asserting | Run the suite twice with the artifact's admission verdict forced to each value and require both branches to assert | Restore the prior fixed assertions together with the resolution branch |
| `market-brief.payload.json` `toolReads` | `curveAdmission` added; four existing fields change value | The brief card renderer, the first-load budget | Medium — a renamed metric breaks a renderer with no other source | Parse the payload with the existing renderer before and after | Remove `curveAdmission`; no other key was touched |

## Change Boundary And Protected Paths

**Allowed:** `scripts/owner-state.mjs` · `scripts/brief-refresh.mjs` ·
`scripts/selftest.mjs` · `tests/fixtures/official-curves/*` ·
`market-brief.payload.json` · `notes/bond-regime-lab.md`.

**Excluded (must remain byte-identical in this scope):** `bond-regime-lab.html` ·
`bond-regime-universe.json` · `rlcontracts.js` ·
`scripts/validate-official-curves.mjs` · `scripts/acquire-official-curves.mjs` ·
`market-brief.html` · `rlbrief.js` · `data/calendars/xnys/calendar.json` — plus
every file a concurrent session holds: `market-brief.config.json` ·
`market-brief.config.page.json` · `market-brief.page.json` ·
`market-brief.experimental.json` · `scripts/build-attention-items.mjs` ·
`tests/attention-payload-contract.test.mjs` · `notes/README.md`.

`bond-regime-lab.html` is excluded because the entire feature rests on the model
being unchanged. A diff naming it is by itself evidence that a classifier was
edited to make a read resolve.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| -------- | --------- | ----------------------------- |
| Consumption seam | `scripts/owner-state.mjs` | The two additive exports FR-018-022 needs, and nothing more. |
| Read composition | `scripts/brief-refresh.mjs` | Where resolution and the read-time contract check belong. |
| Project test harness | `scripts/selftest.mjs` | Where the reconciliation and the consumption group live. |
| Consumption fixtures | `tests/fixtures/official-curves/*` | The committed inputs the withholding cases are proven against. |
| Published payload | `market-brief.payload.json` | The artifact whose bond entry changes value and gains one additive metric. |
| Tool notes | `notes/bond-regime-lab.md` | Where the precedence rules belong beside the tool. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --------- | --------- | ------- |
| The model itself | `bond-regime-lab.html` | Unchanged by this feature — that is the point of FR-018-023 |
| Artifact contract and gate | `rlcontracts.js`, `scripts/validate-official-curves.mjs` | Scope 1 |
| Acquisition | `scripts/acquire-official-curves.mjs` | Scope 2 |
| Renderers | `market-brief.html`, `rlbrief.js` | Scope 5 |
| Equity calendar | `data/calendars/xnys/calendar.json` | Never read by this feature |
| Concurrently held brief artifacts | `market-brief.config.json`, `market-brief.config.page.json`, `market-brief.page.json`, `market-brief.experimental.json`, `scripts/build-attention-items.mjs`, `tests/attention-payload-contract.test.mjs`, `notes/README.md` | A concurrent session |

## Rollback

Revert the two additive exports in `scripts/owner-state.mjs`, remove the
resolution branch and the read-time contract check from
`scripts/brief-refresh.mjs`, restore the prior fixed live-read assertions and the
prior ADVERSARIAL 3 form in `scripts/selftest.mjs`, and remove `curveAdmission`
from `market-brief.payload.json`. Prove the restore by running
`node scripts/selftest.mjs` and recording exit 0, and by running
`node scripts/validate-brief-payload.mjs` and recording exit 0.

The resolution branch and the live-read reconciliation must be reverted together.
Reverting the resolution alone leaves the suite branching on an admission verdict
nothing produces; reverting the reconciliation alone leaves a fixed
both-axes-unresolved assertion against a read that now resolves the duration
axis. A revert touching only one is itself a broken state.

## Scenario-First RED/GREEN Contract

RED: author the eight scenarios first. Record the absent-artifact case passing
before any resolution exists — it is today's behaviour and it must survive — and
record the stale and invalid cases admitting rows before the withholding branches
are written. Record the live-read assertion failing against a real artifact
before it is reconciled; that failure is the reconciliation's justification.

GREEN: the absent case publishes the named-absence form unchanged; the invalid
case admits zero rows and names the failure class with no URL fragment; the stale
case admits zero rows with `curveAsOf` null and a populated `curveAdmission`; the
fresh case resolves the duration axis, leaves the credit axis `Indeterminate`,
keeps `state` at `unavailable` and narrows `evidenceGaps` to the credit gap
alone; and the reconciled live assertion asserts in both of its branches.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Named absence | functional | SCN-018-015 | `scripts/selftest.mjs` | with no artifact on file the three curve families read `Unavailable`, both curve gaps are named, and no zero, empty-but-plausible family or neutral filler value is published in their place | `node scripts/selftest.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Refusal | functional | SCN-018-016 | `scripts/selftest.mjs` | a gate-failing artifact admits exactly zero rows to the model, the read is the named-absence form, and the reason names the validation failure class while containing no source URL fragment and no observed value | `node scripts/selftest.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Refusal preservation | functional | SCN-018-017 | `scripts/selftest.mjs` | with both curve families fresh and valid and no credit-spread observation, `durationPosture` is not `Indeterminate`, `creditRegime` IS `Indeterminate`, published `state` is `unavailable`, and `evidenceGaps` is the credit gap alone — the ADVERSARIAL 2 shape committed at `scripts/selftest.mjs:5670-5682`, run unmodified against a real acquired artifact | `node scripts/selftest.mjs` | No | `report.md#tp-04-03` |
| TP-04-04 | Withholding | functional | SCN-018-029 | `scripts/selftest.mjs` | a stale-admission artifact admits zero rows, `curveAsOf` is `null`, and `curveAdmission` carries the staleness verdict, `BRL-CURVE-FAMILY-STALE` and `lastGoodObservedAt` | `node scripts/selftest.mjs` | No | `report.md#tp-04-04` |
| TP-04-05 | Separation | functional | SCN-018-013 | `scripts/selftest.mjs` | an inverted curve level with no directional impulse and an unavailable inflation state yields a duration posture that is neither `Shorten` nor `Extend`, asserted against the model's posture vocabulary rather than a literal | `node scripts/selftest.mjs` | No | `report.md#tp-04-05` |
| TP-04-06 | Derivation | functional | SCN-018-014 | `scripts/selftest.mjs` | a nominal date with no matching real date produces no breakeven row, and the breakeven row count equals the exact common-date count — no forward-fill, no interpolation, no nearest-date match | `node scripts/selftest.mjs` | No | `report.md#tp-04-06` |
| TP-04-07 | Reconciliation | functional | SCN-018-030 | `scripts/selftest.mjs` | the live bond read branches on the committed artifact's own admission verdict, and BOTH branches assert: admitted asserts a resolved duration axis and an absent curve gap, refused asserts `Indeterminate` with the curve gap named and a non-empty `curveAdmission` reason and code | `node scripts/selftest.mjs` | No | `report.md#tp-04-07` |
| TP-04-08 | Adversarial | functional | SCN-018-031 | `scripts/selftest.mjs` | the absent-curve adversarial case passes explicit named absences for both families instead of relying on the repository holding no artifact, and ADVERSARIAL 1, 2 and 4 are byte-identical to their committed form | `node scripts/selftest.mjs` | No | `report.md#tp-04-08` |
| TP-04-09 | Precedence | unit | SCN-018-030 | `scripts/selftest.mjs` | an explicit `deps.nominalCurve` still wins over a present committed artifact, so every injection-based adversarial case keeps its exact current semantics and the seam is proven unwidened | `node scripts/selftest.mjs` | No | `report.md#tp-04-09` |
| TP-04-10 | Compatibility | integration | SCN-018-017 | `scripts/validate-brief-payload.mjs` | Regression: the payload carrying the changed bond entry and the added `curveAdmission` metric passes the publication gate with exit 0, and every pre-existing `toolReads` key retains its name and type | `node scripts/validate-brief-payload.mjs` | Yes | `report.md#tp-04-10` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] `unavailableCurveFamily` is exported from `scripts/owner-state.mjs` with its shape and its `retrievedAt: null` rule untouched, proven by TP-04-01 constructing the absence through the export.
- [ ] `officialCurveArtifact(root)` reads and parses the committed artifact, returns `null` when absent or unparsable, and computes no classification and no freshness verdict, proven by TP-04-01 and TP-04-02.
- [ ] `bondRegimeOwnerState` is byte-identical, verified by `git diff` on `scripts/owner-state.mjs` showing only the two additive exports.
- [ ] Resolution happens only on the `undefined` branch, and an explicit `deps` value still wins, proven by TP-04-09.
- [ ] A read-time contract check keeps every row of a gate-failing artifact away from the model even when the gate was not run in that process, proven by TP-04-02.
- [ ] Every non-`current` admission verdict resolves to a named absence carrying the additive `admission` block, proven by TP-04-04.
- [ ] `curveAdmission` is added to the published metrics and no existing metric is renamed, retyped or removed, proven by TP-04-10.
- [ ] `evidenceGaps` is still computed from the model's own states at its existing site, with no gap string edited, proven by TP-04-03 showing the list narrow by itself.
- [ ] **The committed assertion at `scripts/selftest.mjs:5670-5682` passes unmodified against a real acquired artifact**, proven by TP-04-03.
- [ ] The live-read assertions branch on the admission verdict and both branches assert, proven by TP-04-07.
- [ ] ADVERSARIAL 3 states its absence explicitly, and ADVERSARIAL 1, 2 and 4 are byte-identical to their committed form, proven by TP-04-08.
- [ ] The block comment at `scripts/selftest.mjs:5615-5622` states what is true of the tree after the artifact lands, verified by reading the committed text against the committed artifact.
- [ ] `bond-regime-lab.html` and `bond-regime-universe.json` are byte-identical at the end of this scope, verified by `git diff --name-only` naming neither file.

#### Test Evidence Items - Exact Parity With 10 Test Plan Rows

- [ ] TP-04-01 executed with raw output recorded at `report.md#tp-04-01`.
- [ ] TP-04-02 executed with raw output recorded at `report.md#tp-04-02`.
- [ ] TP-04-03 executed with raw output recorded at `report.md#tp-04-03`.
- [ ] TP-04-04 executed with raw output recorded at `report.md#tp-04-04`.
- [ ] TP-04-05 executed with raw output recorded at `report.md#tp-04-05`.
- [ ] TP-04-06 executed with raw output recorded at `report.md#tp-04-06`.
- [ ] TP-04-07 executed with raw output recorded at `report.md#tp-04-07`.
- [ ] TP-04-08 executed with raw output recorded at `report.md#tp-04-08`.
- [ ] TP-04-09 executed with raw output recorded at `report.md#tp-04-09`.
- [ ] TP-04-10 executed with raw output recorded at `report.md#tp-04-10`.

#### Build Quality Gate

- [ ] `node scripts/selftest.mjs` exits 0 on the working tree with the consumption group registered and zero skipped assertions.
- [ ] `node scripts/validate-brief-payload.mjs` exits 0 against the committed payload.
- [ ] `node scripts/validate-official-curves.mjs` exits 0 against the committed artifact.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] Zero warnings emitted by any command run for this scope, evidenced by unfiltered output of every command above.
- [ ] The first-load budget assertion in `scripts/selftest.mjs` passes with the changed tool-read entry, and the measured total is recorded verbatim against the committed `briefFirstLoadMaxBytes`.
