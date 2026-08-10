# Scope 6: One-Model Parity Guarantee

## 06-one-model-parity-guarantee

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** parity, differential, adversarial, coverage-window
Depends On: Scopes 1, 2, 3, 4, 5 — the whole headless path plus the parity line surface

**Primary Outcome:** One frozen set of curve rows, handed to the browser
composition and to the headless composition, produces **identical** curve level,
curve impulse, inflation state and duration posture — asserted as an equality
between two computed values, never against a literal. The comparison is proven
capable of failing: perturbing one row in the headless input alone makes the two
compositions differ. The two-calendar-year coverage window is proven load-bearing
rather than decorative, and unequal `coverageYears` render *Cannot be compared*
rather than a manufactured disagreement or a false agreement.

This is the highest-value test in the feature. It is what makes the Outcome
Contract's hard constraint — *one model, two compositions* — checkable rather
than asserted.

## Requirement Coverage

- FR-018-024 — the browser composition and the headless composition, given the
  same curve rows and the same configuration, produce identical curve level,
  curve impulse, inflation state and duration posture.
- FR-018-005 and design finding **D-1** — the retained window is a parity
  correctness requirement, because `classifyInflationState` at
  `bond-regime-lab.html:1697-1699` compares the **first and last** breakeven rows,
  so two compositions holding different windows can reach different
  `realYieldChangeBp`, `breakevenChangeBp` and therefore different
  `inflationState` and `durationPosture`.
- FR-018-029 — the parity line reports on a stated observation as-of, and refuses
  to compare across different ones.
- Routed item **R-3** — unequal `coverageYears` is the sixth named
  *Cannot be compared* reason, rendered like the other five and never as *Agree*.

## Gherkin Scenarios

```gherkin
Scenario: SCN-018-011 Both compositions reach the same classifications
  Given one frozen set of nominal and real curve rows and one fixed configuration
  When the browser composition and the headless composition each classify them
  Then the curve level, curve impulse, inflation state and duration posture are pairwise identical
  And each assertion is an equality between two computed values rather than a comparison to a literal

Scenario: SCN-018-012 Two calendar years of coverage keep the impulse window intact
  Given a run date early in a calendar year
  And an input carrying the current and prior calendar years
  When the curve impulse is classified
  Then it is not Unavailable
  And with the prior calendar year removed from the same input the curve impulse is Unavailable
  And the two-year window is therefore load-bearing rather than decorative

Scenario: SCN-018-036 The comparison is capable of failing
  Given one frozen set of curve rows handed to both compositions
  When exactly one row of the headless input is perturbed
  Then the two compositions no longer agree on at least one of the four compared fields
  And the parity assertion reports the disagreement rather than passing

Scenario: SCN-018-037 Unequal observation windows cannot be compared
  Given a headless artifact holding one pair of coverageYears
  And a browser composition holding a different pair
  When parity is evaluated
  Then the verdict is Cannot be compared with the differing-window reason named
  And the verdict is neither Agree nor Differ

Scenario: SCN-018-038 Silence is never agreement
  Given no published bond read is on file
  When the parity line renders
  Then it reads Cannot be compared with its reason
  And it does not render as Agree
  And it does not render as an empty line
```

## Implementation Files

### Modified

- `scripts/selftest.mjs`
- `bond-regime-lab.html`
- `rlbrief.js`
- `tests/bond-regime-lab.spec.mjs`
- `notes/bond-regime-lab.md`

## Implementation Plan

1. Build one frozen input set inside the selftest group: nominal and real rows
   over a fixed synthetic date range with fixed values, and a fixed
   `bond-regime-universe.json` clone. No wall clock, no network, no committed
   artifact.
2. Build the **browser composition**: load `computeBondLabViewModel` and its
   helpers from `bond-regime-lab.html` through `loadToolFunctions`, and hand it
   an observed snapshot assembled the way `mergedSnapshot` assembles one at
   `bond-regime-lab.html:2395-2404`.
3. Build the **headless composition**: write the same rows into a temporary
   artifact, run the real consumption path over it, and let
   `buildBondRegimeToolRead` reach its verdict. The headless side must go through
   resolution and admission, not around them, or the comparison proves nothing
   about the path that publishes.
4. Assert `curveState.state`, `curveImpulse.state`, `inflationState.state` and
   `durationPosture.state` are pairwise equal. Every assertion compares two
   computed values.
5. Add the coverage variation: repeat with a January run date and a
   two-calendar-year input, then again with the prior year removed, and assert
   the two-year case yields a `curveImpulse` that is not `"Unavailable"` while
   the one-year case does.
6. Add the perturbation adversarial: perturb one row in the headless input only
   and assert the compositions now differ. Without this, an assertion comparing
   two calls into the same loaded module would pass even if the headless path
   silently ignored its own input.
7. Add the D-1 window-equality case: two compositions holding different
   `coverageYears` yield *Cannot be compared* with the differing-window reason,
   never *Agree* and never *Differ*.
8. Render the parity line beneath the decision read in `bond-regime-lab.html` and
   mirrored on the brief card in `rlbrief.js`, with exactly three verdicts —
   *Agree*, *Differ*, *Cannot be compared* — each a shape plus a word, and with
   the compared-field count stated so a comparison that silently narrowed is
   visible.
9. Add the sixth *Cannot be compared* reason — the two compositions hold
   different observation windows — beside the five already named, settling routed
   item **R-3**. Render the absence of a comparison as *Cannot be compared* with
   its reason, never as an empty line and never as *Agree*.
10. Add the browser rows for the parity line to `tests/bond-regime-lab.spec.mjs`,
    driven from committed payload fixtures.
11. Record the parity contract, its four compared fields and the six
    non-comparable reasons in `notes/bond-regime-lab.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `loadToolFunctions` helper set | `computeBondLabViewModel` and its helpers loaded by a parity caller | The existing helper array in `scripts/brief-refresh.mjs` | Medium — a name that fails to resolve throws at load for every tool read | Assert every requested helper resolves to a function before any comparison runs | Revert the added helper names |
| Temporary artifact directory | The parity group writes and reads a temporary artifact | The committed `data/curves/us-treasury/curve.json` | High — writing into the committed path would make the suite mutate published evidence | Assert the committed artifact's bytes are unchanged after the parity group runs | The group writes only under a temporary root; nothing to restore |
| `bond-regime-lab.html` parity line | New rendered block | The tool page | Medium — a comparison that cannot run must not blank the page | Render with no published read available and assert the *Cannot be compared* form appears | Remove the block |
| `rlbrief.js` parity line | New rendered block on the bond card | The Brief view | Medium — a throw in the block empties the card | Render each of the three verdicts from committed fixtures | Remove the block |

## Change Boundary And Protected Paths

**Allowed:** `scripts/selftest.mjs` · `bond-regime-lab.html` (the parity-line
block and its rendering only) · `rlbrief.js` (the parity-line block only) ·
`tests/bond-regime-lab.spec.mjs` · `notes/bond-regime-lab.md`.

**Excluded (must remain byte-identical in this scope):** every classifier in
`bond-regime-lab.html` — `parseTreasuryCurveCsv`, `classifyCurveState`,
`classifyCurveImpulse`, `deriveBreakevenRows`, `classifyInflationState`,
`classifyDurationPosture`, `selectResearchExpression`, `computeBondLabViewModel` —
plus `bond-regime-universe.json` · `rlcontracts.js` ·
`scripts/owner-state.mjs` · `scripts/brief-refresh.mjs` ·
`scripts/acquire-official-curves.mjs` · `scripts/validate-official-curves.mjs` ·
`data/curves/us-treasury/curve.json` · `market-brief.html` — plus every file a
concurrent session holds: `market-brief.config.json` ·
`market-brief.config.page.json` · `market-brief.page.json` ·
`market-brief.payload.json` · `market-brief.experimental.json` ·
`scripts/build-attention-items.mjs` · `tests/attention-payload-contract.test.mjs` ·
`notes/README.md`.

The classifiers and the committed artifact are both excluded for the same reason:
a parity scope that could edit either could manufacture agreement instead of
measuring it.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| -------- | --------- | ----------------------------- |
| Project test harness | `scripts/selftest.mjs` | Where the differential group lives. |
| Parity line | the parity block in `bond-regime-lab.html` and in `rlbrief.js` | The rendered form of the guarantee. |
| Bond browser spec | `tests/bond-regime-lab.spec.mjs` | The existing browser gate for this tool. |
| Tool notes | `notes/bond-regime-lab.md` | Where the parity contract belongs. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --------- | --------- | ------- |
| The model | every classifier in `bond-regime-lab.html` | Unchanged by this feature |
| Contract, gate, acquisition, admission, consumption | `rlcontracts.js`, `scripts/validate-official-curves.mjs`, `scripts/acquire-official-curves.mjs`, `scripts/brief-refresh.mjs`, `scripts/owner-state.mjs` | Scopes 1-4 |
| Committed artifact | `data/curves/us-treasury/curve.json` | Scope 2 writes it; this scope reads a temporary one |
| Brief card body | `market-brief.html` | Scope 5 |
| Concurrently held brief artifacts | `market-brief.config.json`, `market-brief.config.page.json`, `market-brief.page.json`, `market-brief.payload.json`, `market-brief.experimental.json`, `scripts/build-attention-items.mjs`, `tests/attention-payload-contract.test.mjs`, `notes/README.md` | A concurrent session |

## Rollback

Remove the parity group from `scripts/selftest.mjs`, remove the parity-line block
from `bond-regime-lab.html` and `rlbrief.js`, and remove the appended rows from
`tests/bond-regime-lab.spec.mjs`. Prove the restore by running
`node scripts/selftest.mjs` and recording exit 0, and by running
`npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`
and recording a green run.

## Scenario-First RED/GREEN Contract

RED: author the five scenarios first. Record the differential comparison passing
while the headless side is fed a hard-coded result rather than its own input —
that is precisely the failure mode the perturbation case exists to catch, and it
must be observed once before it is closed. Record the one-year coverage input
producing the same impulse as the two-year input before the window requirement is
enforced.

GREEN: the four compared fields are pairwise equal on the frozen input; the
two-year case yields a non-`Unavailable` impulse while the one-year case yields
`Unavailable`; the perturbed input makes the compositions differ and the
assertion reports it; unequal `coverageYears` yields *Cannot be compared* with
the differing-window reason; and an absent published read renders
*Cannot be compared* rather than an empty line or *Agree*.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-06-01 | Differential | integration | SCN-018-011 | `scripts/selftest.mjs` | one frozen input set handed to the browser composition and to the real headless consumption path yields pairwise-equal `curveState`, `curveImpulse`, `inflationState` and `durationPosture` — the one-model guarantee, asserted as an equality between two computed values with no literal on either side | `node scripts/selftest.mjs` | No | `report.md#tp-06-01` |
| TP-06-02 | Coverage | integration | SCN-018-012 | `scripts/selftest.mjs` | with a January run date the two-calendar-year input yields a `curveImpulse` that is not `Unavailable` while the same input with the prior year removed yields `Unavailable`, proving the retained window is load-bearing | `node scripts/selftest.mjs` | No | `report.md#tp-06-02` |
| TP-06-03 | Adversarial | integration | SCN-018-036 | `scripts/selftest.mjs` | perturbing exactly one row of the headless input alone makes the two compositions disagree on at least one compared field, so a parity assertion that compared two calls into the same module could not pass silently | `node scripts/selftest.mjs` | No | `report.md#tp-06-03` |
| TP-06-04 | Window equality | integration | SCN-018-037 | `scripts/selftest.mjs` | two compositions holding different `coverageYears` yield `Cannot be compared` with the differing-window reason, and the verdict is asserted to be neither `Agree` nor `Differ` — design finding D-1 and routed item R-3 | `node scripts/selftest.mjs` | No | `report.md#tp-06-04` |
| TP-06-05 | Isolation | unit | SCN-018-011 | `scripts/selftest.mjs` | the parity group writes only under a temporary root, and `data/curves/us-treasury/curve.json` is byte-identical before and after the group runs | `node scripts/selftest.mjs` | No | `report.md#tp-06-05` |
| TP-06-06 | Render | e2e-ui | SCN-018-038 | `tests/bond-regime-lab.spec.mjs` | the parity line renders exactly one of `Agree`, `Differ` or `Cannot be compared` as a shape plus a word, states the compared-field count, and renders `Cannot be compared` with its reason when no published read is on file — never an empty line and never `Agree` | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-06-06` |
| TP-06-07 | Regression E2E | e2e-ui | SCN-018-011 · SCN-018-038 | `tests/bond-regime-lab.spec.mjs` | Regression: the parity line and the whole bond page still render when the comparison cannot run, every existing bond-tool browser row still passes, and a `Differ` verdict is not dismissible, collapsible or snoozable | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-06-07` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] The differential group builds one frozen input set with no wall clock, no network and no committed artifact, proven by TP-06-01 and TP-06-05.
- [ ] The headless side of the comparison goes through the real resolution and admission path rather than around it, proven by TP-06-03 detecting a perturbation of that input.
- [ ] The four compared fields are pairwise equal on the frozen input, each asserted as an equality between two computed values with no literal on either side, proven by TP-06-01.
- [ ] The two-calendar-year window is proven load-bearing by the one-year case yielding an `Unavailable` impulse, proven by TP-06-02.
- [ ] The comparison is proven capable of failing, proven by TP-06-03.
- [ ] **D-1 and R-3 settled:** unequal `coverageYears` yields `Cannot be compared` with the differing-window reason, asserted to be neither `Agree` nor `Differ`, proven by TP-06-04.
- [ ] The parity line carries exactly three verdicts, each a shape plus a word, with the compared-field count stated, proven by TP-06-06.
- [ ] An absent comparison renders `Cannot be compared` with its reason and never renders as an empty line or as `Agree`, proven by TP-06-06.
- [ ] A `Differ` verdict is stated as a defect in words, carries no severity level and no alarm styling, and cannot be dismissed, collapsed or snoozed, proven by TP-06-07.
- [ ] The parity group leaves `data/curves/us-treasury/curve.json` byte-identical, proven by TP-06-05.
- [ ] Every classifier in `bond-regime-lab.html` is byte-identical, verified by `git diff` on that file showing changes confined to the parity-line block.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-06-01 executed with raw output recorded at `report.md#tp-06-01`.
- [ ] TP-06-02 executed with raw output recorded at `report.md#tp-06-02`.
- [ ] TP-06-03 executed with raw output recorded at `report.md#tp-06-03`.
- [ ] TP-06-04 executed with raw output recorded at `report.md#tp-06-04`.
- [ ] TP-06-05 executed with raw output recorded at `report.md#tp-06-05`.
- [ ] TP-06-06 executed with raw output recorded at `report.md#tp-06-06`.
- [ ] TP-06-07 executed with raw output recorded at `report.md#tp-06-07`.

#### Build Quality Gate

- [ ] `node scripts/selftest.mjs` exits 0 on the working tree with the parity group registered and zero skipped assertions.
- [ ] `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` exits 0 with zero skipped tests.
- [ ] `node scripts/validate-official-curves.mjs` exits 0 against the committed artifact, unchanged by this scope.
- [ ] `node scripts/validate-brief-payload.mjs` exits 0 against the committed payload.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] Zero warnings emitted by any command run for this scope, evidenced by unfiltered output of every command above.
