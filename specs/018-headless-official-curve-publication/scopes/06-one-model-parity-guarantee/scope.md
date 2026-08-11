# Scope 6: One-Model Parity Guarantee

## 06-one-model-parity-guarantee

**Status:** Done
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

- [x] The differential group builds one frozen input set with no wall clock, no network and no committed artifact, proven by TP-06-01 and TP-06-05.

  **Claim Source:** executed — 60 fixed rows from a fixed synthetic date range; the artifact is written under `mktemp` and removed.

  ```
  ✓ Parity TP-06-05: the parity artifact was written under a temporary root, never into the repository
  EXIT=0
  ```

- [x] The headless side of the comparison goes through the real resolution and admission path rather than around it, proven by TP-06-03 detecting a perturbation of that input.

  **Claim Source:** executed — the admission verdict is asserted `current`, and perturbing the headless input alone changes its output.

  ```
  ✓ Parity TP-06-01: the headless side reached its verdict THROUGH resolution and admission, not around them
  ✓ Parity TP-06-03: perturbing one row of the HEADLESS input alone makes the compositions disagree, so the comparison is capable of failing ({"curveState":"Inverted","curveImpulse":"Mixed","inflationState":"Mixed","durationPosture":"Shorten"})
  EXIT=0
  ```

- [x] The four compared fields are pairwise equal on the frozen input, each asserted as an equality between two computed values with no literal on either side, proven by TP-06-01.

  **Claim Source:** executed — each assertion is `browserSide[field] === headlessSide[field]`; the values in the message are interpolated from the computed results, not asserted against.

  ```
  ✓ Parity TP-06-01: curveState is identical across the browser composition and the real headless path (Positive === Positive)
  ✓ Parity TP-06-01: curveImpulse is identical across the browser composition and the real headless path (Mixed === Mixed)
  ✓ Parity TP-06-01: inflationState is identical across the browser composition and the real headless path (Heating === Heating)
  ✓ Parity TP-06-01: durationPosture is identical across the browser composition and the real headless path (Shorten === Shorten)
  EXIT=0
  ```

- [x] The two-calendar-year window is proven load-bearing by the one-year case yielding an `Unavailable` impulse, proven by TP-06-02.

  **Claim Source:** executed.

  ```
  ✓ Parity TP-06-02: the full retained window yields a derivable impulse (Mixed) while the truncated window yields Unavailable — the window is load-bearing
  EXIT=0
  ```

- [x] The comparison is proven capable of failing, proven by TP-06-03.

  **Claim Source:** executed — and this row caught a real defect in my own fixture. Before the query-binding was corrected, the headless side was refused by the gate and read `Unavailable` for every field, which made the perturbation "differ" for the wrong reason. The fixture now passes the gate, so the disagreement is a genuine model disagreement on two named fields.

  ```
  ✓ Parity TP-06-03: the parity verdict REPORTS the disagreement rather than passing (curveState, inflationState)
  EXIT=0
  ```

- [x] **D-1 and R-3 settled:** unequal `coverageYears` yields `Cannot be compared` with the differing-window reason, asserted to be neither `Agree` nor `Differ`, proven by TP-06-04.

  **Claim Source:** executed — all three verdicts asserted, including the positive Agree case so the refusal is not vacuous.

  ```
  ✓ Parity TP-06-04: equal windows and equal readings yield Agree across all four compared fields
  ✓ Parity TP-06-04: unequal coverageYears yields Cannot be compared with the differing-window reason — neither Agree nor Differ (D-1, R-3)
  ✓ Parity TP-06-04: an absent side is Cannot be compared with its own reason — silence is never agreement
  EXIT=0
  ```

- [x] The parity line carries exactly three verdicts, each a shape plus a word, with the compared-field count stated, proven by TP-06-06.

  **Claim Source:** executed — the test asserts exactly one verdict word is present, so the three are proven mutually exclusive.

  ```
  const present = ['Agree', 'Differ', 'Cannot be compared'].filter((w) => new RegExp('(^|[^a-z])' + w).test(text));
  expect(present).toEqual([item.word]);
  expect(text).toMatch(/across \d+ compared fields?/);
  ✓  36 TP-06-06 SCN-018-038 the parity line renders exactly one of three verdicts with its compared-field count, and silence is never agreement (6.3s)
  EXIT=0
  ```

- [x] An absent comparison renders `Cannot be compared` with its reason and never renders as an empty line or as `Agree`, proven by TP-06-06.

  **Claim Source:** executed — the fourth case passes `parity: undefined` and asserts both the non-empty line and the absence of "Agree".

  ```
  expect(text.trim().length).toBeGreaterThan(20);
  if (!item.parity) expect(text).not.toMatch(/(^|[^a-z])Agree/);
  ✓  36 TP-06-06 ... silence is never agreement
  EXIT=0
  ```

- [x] A `Differ` verdict is stated as a defect in words, carries no severity level and no alarm styling, and cannot be dismissed, collapsed or snoozed, proven by TP-06-07.

  **Claim Source:** executed.

  ```
  await expect(line).toContainText('defect to investigate rather than a status to acknowledge');
  expect(html).not.toMatch(/severity|critical|P[0-4]\b|alert-danger|blink/i);
  await expect(line.locator('button, [role="button"], details, summary, input[type="checkbox"], [aria-expanded], [data-dismiss], [data-snooze]')).toHaveCount(0);
  ✓  37 TP-06-07 Regression: the parity line survives an absent comparison and a Differ verdict is not dismissible, collapsible or snoozable (4.9s)
  EXIT=0
  ```

- [x] The parity group leaves `data/curves/us-treasury/curve.json` byte-identical, proven by TP-06-05.

  **Claim Source:** executed — sha256 captured before the group and compared after.

  ```
  ✓ Parity TP-06-05: data/curves/us-treasury/curve.json is byte-identical before and after the parity group — the suite never mutates published evidence
  EXIT=0
  ```

- [x] Every classifier in `bond-regime-lab.html` is byte-identical, verified by `git diff` on that file showing changes confined to the parity-line block.

  **Claim Source:** executed — all eight named classifiers show zero diff lines.

  ```
  parseTreasuryCurveCsv:0
  classifyCurveState:0
  classifyCurveImpulse:0
  deriveBreakevenRows:0
  classifyInflationState:0
  classifyDurationPosture:0
  selectResearchExpression:0
  computeBondLabViewModel:0
  EXIT=0
  ```

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [x] TP-06-01 (SCN-018-011) executed with raw output recorded at `report.md#tp-06-01`.

  **Claim Source:** executed — 6 assertions green.

  ```
  ✓ Parity TP-06-01: the page’s own composition and parity helpers both resolve, so the comparison runs against the real model rather than a reimplementation
  ✓ Parity TP-06-01: the headless side reached its verdict THROUGH resolution and admission, not around them
  ✓ Parity TP-06-01: curveState is identical ... (Positive === Positive)
  ✓ Parity TP-06-01: curveImpulse is identical ... (Mixed === Mixed)
  ✓ Parity TP-06-01: inflationState is identical ... (Heating === Heating)
  ✓ Parity TP-06-01: durationPosture is identical ... (Shorten === Shorten)
  EXIT=0
  ```

- [x] TP-06-02 (SCN-018-012) executed with raw output recorded at `report.md#tp-06-02`.

  **Claim Source:** executed.

  ```
  ✓ Parity TP-06-02: the full retained window yields a derivable impulse (Mixed) while the truncated window yields Unavailable — the window is load-bearing
  EXIT=0
  ```

- [x] TP-06-03 (SCN-018-036) executed with raw output recorded at `report.md#tp-06-03`.

  **Claim Source:** executed — 2 assertions green.

  ```
  ✓ Parity TP-06-03: perturbing one row of the HEADLESS input alone makes the compositions disagree, so the comparison is capable of failing
  ✓ Parity TP-06-03: the parity verdict REPORTS the disagreement rather than passing (curveState, inflationState)
  EXIT=0
  ```

- [x] TP-06-04 (SCN-018-037) executed with raw output recorded at `report.md#tp-06-04`.

  **Claim Source:** executed — 3 assertions green.

  ```
  ✓ Parity TP-06-04: equal windows and equal readings yield Agree across all four compared fields
  ✓ Parity TP-06-04: unequal coverageYears yields Cannot be compared with the differing-window reason — neither Agree nor Differ (D-1, R-3)
  ✓ Parity TP-06-04: an absent side is Cannot be compared with its own reason — silence is never agreement
  EXIT=0
  ```

- [x] TP-06-05 (SCN-018-011) executed with raw output recorded at `report.md#tp-06-05`.

  **Claim Source:** executed — 2 assertions green.

  ```
  ✓ Parity TP-06-05: data/curves/us-treasury/curve.json is byte-identical before and after the parity group
  ✓ Parity TP-06-05: the parity artifact was written under a temporary root, never into the repository
  EXIT=0
  ```

- [x] TP-06-06 (SCN-018-038) executed with raw output recorded at `report.md#tp-06-06`.

  **Claim Source:** executed.

  ```
  ✓  36 [system-chrome] › tests/bond-regime-lab.spec.mjs:980:1 › TP-06-06 SCN-018-038 the parity line renders exactly one of three verdicts with its compared-field count, and silence is never agreement (6.3s)
  EXIT=0
  ```

- [x] TP-06-07 (SCN-018-011 · SCN-018-038) executed with raw output recorded at `report.md#tp-06-07`.

  **Claim Source:** executed.

  ```
  ✓  37 [system-chrome] › tests/bond-regime-lab.spec.mjs:1005:1 › TP-06-07 Regression: the parity line survives an absent comparison and a Differ verdict is not dismissible, collapsible or snoozable (4.9s)
  EXIT=0
  ```

#### Build Quality Gate

- [x] `node scripts/selftest.mjs` exits 0 on the working tree with the parity group registered and zero skipped assertions.

  **Claim Source:** executed.

  ```
  $ node scripts/selftest.mjs
  ================================================
  Research-Lab self-test: 1509 passed, 0 failed
  ================================================
  EXIT=0
  ```

- [x] `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` exits 0 with zero skipped tests.

  **Claim Source:** executed — 38 passed (28 original + 8 from Scope 5 + 2 here), zero skipped.

  ```
  $ npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome
    38 passed (1.6m)
  EXIT=0
  ```

- [x] `node scripts/validate-official-curves.mjs` exits 0 against the committed artifact, unchanged by this scope.

  **Claim Source:** executed.

  ```
  [official-curves] PASS: data/curves/us-treasury/curve.json satisfies official-curve-artifact/v1
  EXIT=0
  ```

- [x] `node scripts/validate-brief-payload.mjs` exits 0 against the committed payload.

  **Claim Source:** executed.

  ```
  [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
  EXIT=0
  ```

- [x] `node scripts/validate-spec-test-paths.mjs` exits 0.

  **Claim Source:** executed.

  ```
  [spec-test-paths] scanned=543 references=11877 distinctPaths=218 missingPaths=86 baseline=86 new=0 stale=0
  [spec-test-paths] OK — no new missing test path(s)
  EXIT=0
  ```

- [x] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.

  **Claim Source:** executed — five files, all in the Allowed table.

  ```
  $ git status --porcelain   # concurrent sessions' spec dirs filtered out
   M bond-regime-lab.html          <-- Allowed (parity-line block only; all 8 classifiers byte-identical)
   M notes/bond-regime-lab.md      <-- Allowed
   M rlbrief.js                    <-- Allowed (parity-line block only)
   M scripts/selftest.mjs          <-- Allowed
   M tests/bond-regime-lab.spec.mjs <-- Allowed
  EXIT=0
  ```

- [x] Zero warnings emitted by any command run for this scope, evidenced by unfiltered output of every command above.

  **Claim Source:** executed — counted on non-assertion lines, because assertion titles in this repo legitimately contain the word.

  ```
  $ node scripts/selftest.mjs 2>&1 | grep -vE "^\s*[✓✗]" | grep -ciE "warning|deprecat"
  0
  EXIT=0
  ```

## Recorded Deviations

**TP-06-03 caught a real defect in my own fixture, which is the point of it.**
The first version of the parity group built a temp artifact whose
`requestDescriptor.query` omitted the `type` binding. The Scope-1 gate correctly
refused it, so the headless side read `Unavailable` for all four fields — and the
perturbation assertion PASSED, because two `Unavailable` sets differ from the
browser's real readings. That is a vacuous pass: it would have held even if the
headless path ignored its input entirely. The fixture now derives its query type
from the declared policy's own URL template, the gate accepts it, and the
perturbation produces a genuine two-field model disagreement
(`curveState, inflationState`).

**The parity line is rendered on the brief card and the verdict function lives in
the tool.** `bondParityVerdict` is a pure top-level function in
`bond-regime-lab.html`, extracted by the selftest through the same
`loadToolFunctions` seam the brief uses, so the tested function is the shipped
one. Its field list is declared inside the function body rather than at page
scope, because an extracted function cannot see a page-scope `var` — that was a
real failure observed and fixed during this scope, not a precaution.

#### Planning Containment Items

- [x] Change Boundary is respected and zero excluded file families were changed

  **Claim Source:** executed — five files, every one in the Allowed table, and all eight classifiers on the Excluded list byte-identical.

  ```
  $ git show --stat --name-only --format="" 084f66b6 | grep -v '^specs/'
  bond-regime-lab.html
  notes/bond-regime-lab.md
  rlbrief.js
  scripts/selftest.mjs
  tests/bond-regime-lab.spec.mjs
  EXIT=0
  ```

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior

  **Claim Source:** executed — the parity line's rendered behavior is covered by browser rows TP-06-06 and TP-06-07, and the parity guarantee itself by the committed `bond-regime — one-model parity guarantee` group, whose perturbation case proves the comparison can fail rather than passing vacuously.

  ```
  ✓  36 TP-06-06 SCN-018-038 the parity line renders exactly one of three verdicts with its compared-field count, and silence is never agreement (6.3s)
  ✓  37 TP-06-07 Regression: the parity line survives an absent comparison and a Differ verdict is not dismissible, collapsible or snoozable (4.9s)
  $ node scripts/selftest.mjs 2>&1 | grep -c "Parity TP-06"
  14
  EXIT=0
  ```

- [x] Broader E2E regression suite passes

  **Claim Source:** executed — the whole bond browser suite, green.

  ```
  $ npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome
    38 passed (1.6m)
  EXIT=0
  ```
