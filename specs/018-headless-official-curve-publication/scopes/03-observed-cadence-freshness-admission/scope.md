# Scope 3: Observed-Cadence Freshness Admission

## 03-observed-cadence-freshness-admission

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** freshness, admission, determinism, named-absence
Depends On: Scope 1 — the artifact contract, which declares `freshnessPolicy`

**Primary Outcome:** `admitCurveFamily(artifact, familyId, runDate)` derives each
family's freshness window from the family's **own** observed as-of progression
and returns `current`, `stale` or `undetermined`. No calendar file is read, and
`data/calendars/xnys/calendar.json` is never consulted. A weekend and a
bond-market holiday are absorbed structurally, because each already appears in the
data as a gap. A run with too little observed history to derive a cadence yields
`undetermined` — neither current nor stale — with its own named reason. The
verdict is recomputed at every read from `(artifact, runDate)`, so a committed
artifact self-reports as it ages without being rewritten.

## Requirement Coverage

- FR-018-016 — the artifact's own `freshnessPolicy` block supplies
  `cadenceWindowRows`, `minCadenceObservations` and `publicationLagDays`. No
  consumer hardcodes a window.
- FR-018-017 — freshness is evaluated against the publication cadence the data
  itself exhibits, not against elapsed wall-clock days alone.
- FR-018-018 — a weekend, and any non-publication date, produces no staleness
  verdict.
- FR-018-019 — the equity calendar at `data/calendars/xnys/calendar.json` is not
  reused, and `2026-10-12` and `2026-11-11` — the dates it marks `regular` while
  the bond market is closed — cannot produce a false staleness verdict, because
  the file is never read.
- FR-018-020 — insufficient observed history yields a named absence that defaults
  neither to current nor to stale. The requirement's intent is preserved exactly;
  its stated basis is an observation count rather than a coverage range.
- FR-018-021 — a stale family publishes a named reason and an error code, and its
  rows are not presented as a current observation.
- NFR *Determinism* — the verdict is a pure function of the artifact and the run
  date, with no wall clock read inside the rule.

## Gherkin Scenarios

```gherkin
Scenario: SCN-018-007 A weekend is not staleness
  Given the last official observation is the preceding Friday
  And the run date is a Sunday
  When freshness is evaluated
  Then the family is treated as current
  And no staleness reason is published

Scenario: SCN-018-008 A bond-market holiday is not staleness
  Given the run date is a date on which the US bond market is closed and Treasury publishes no curve
  And the equity calendar marks that date as a regular trading day
  When freshness is evaluated
  Then the family is treated as current
  And the equity calendar file is not read at any point during the evaluation

Scenario: SCN-018-009 A missed publication is staleness with a reason
  Given the run date is an expected publication date past the publication lag
  And the artifact's newest observation predates it beyond the derived window
  When freshness is evaluated
  Then the family is stale with a named reason and an error code
  And the reason names lastObserved, elapsedDays, windowDays and the observed-gap basis

Scenario: SCN-018-010 Too little observed history is a named absence
  Given the family carries fewer observed gaps than minCadenceObservations
  When freshness is evaluated
  Then the verdict is undetermined with BRL-CURVE-FRESHNESS-UNDERIVABLE
  And the verdict is neither current nor stale
  And the reason states the observation count rather than assuming a publication schedule

Scenario: SCN-018-027 The window is enforced at its exact edge from both sides
  Given a family whose derived windowDays is a known value
  When freshness is evaluated at elapsedDays equal to windowDays
  Then the verdict is current
  And when freshness is evaluated at windowDays plus one the verdict is stale

Scenario: SCN-018-028 A live publication stoppage still goes stale
  Given a row history whose trailing observed gaps are all bounded
  And elapsedDays far exceeds the widest of those gaps
  When freshness is evaluated
  Then the verdict is stale
  And the window is not widened by the outage it exists to detect
```

## Implementation Files

### New

- `tests/fixtures/official-curves/cadence-weekend.json`
- `tests/fixtures/official-curves/cadence-holiday-gap.json`
- `tests/fixtures/official-curves/cadence-short-history.json`
- `tests/fixtures/official-curves/cadence-stoppage.json`

### Modified

- `scripts/brief-refresh.mjs`
- `scripts/selftest.mjs`
- `notes/bond-regime-lab.md`

## Implementation Plan

1. Implement `admitCurveFamily(artifact, familyId, runDate)` in
   `scripts/brief-refresh.mjs`, taking the run date as a parameter so no wall
   clock is read inside the rule.
2. Compute `lastObserved` as the newest row date and `elapsedDays` as whole
   calendar days from `lastObserved` to the run date, both in UTC.
3. Compute `observedGaps` as the calendar-day gaps between consecutive row dates
   over the trailing `cadenceWindowRows` rows, and `maxObservedGapDays` as their
   maximum.
4. Compute `windowDays = maxObservedGapDays + publicationLagDays`, reading all
   three policy values from the artifact's own `freshnessPolicy` block.
5. Return `undetermined` with `BRL-CURVE-FRESHNESS-UNDERIVABLE` when
   `observedGaps.length < minCadenceObservations`; `current` when
   `elapsedDays <= windowDays`; `stale` with `BRL-CURVE-FAMILY-STALE` otherwise.
6. Attach the additive `admission` block — `verdict`, `errorCode`,
   `lastGoodObservedAt`, `elapsedDays`, `windowDays`, `basis` — to whatever the
   rule returns, so a renderer can distinguish stale from absent without the
   model carrying a reader concern.
7. Keep the two vocabularies separate: uppercase `BRL-*` codes in the family
   record's `errorCode`, lowercase-hyphen reasons in `diagnostics`. Neither leaks
   into the other's field.
8. Read no calendar file. Assert this positively rather than trusting the absence
   of an import: the offline group records the exact set of files the evaluation
   opens and asserts `data/calendars/xnys/calendar.json` is not among them.
9. Register a `bond-regime — observed-cadence freshness admission` group in
   `scripts/selftest.mjs` driving the rule against the four cadence fixtures with
   injected run dates.
10. Record the rule, its `windowDays` derivation and the reason it reads no
    calendar in `notes/bond-regime-lab.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `scripts/brief-refresh.mjs` | One pure function added; no existing branch changed | Scope 4's consumption path, and every scheduled publication run once wired | High — a rule that returns `current` too readily publishes out-of-window rows as evidence | Run the rule against the stoppage fixture BEFORE wiring it into any read, and require `stale` | Remove the function; nothing calls it until scope 4 |
| `scripts/selftest.mjs` | One new group appended | The whole-repo gate | Medium — a clock-reading group would flake as the committed fixtures age | Every case injects its run date; assert the rule reads no wall clock | Remove the appended group |
| The `admission` block shape | Consumed by scope 4's metrics and scope 5's renderer | Published `curveAdmission` metric | Medium — a renamed field breaks a renderer that has no other source for the reason | Fix the six field names here and assert them, so scope 5 codes against a settled shape | Revert the block; scope 4 has not consumed it yet |

## Change Boundary And Protected Paths

**Allowed:** `scripts/brief-refresh.mjs` (the `admitCurveFamily` function only) ·
`scripts/selftest.mjs` · `tests/fixtures/official-curves/cadence-*.json` ·
`notes/bond-regime-lab.md`.

**Excluded (must remain byte-identical in this scope):**
`data/calendars/xnys/calendar.json` · `scripts/validate-brief-cache.mjs` ·
`bond-regime-lab.html` · `bond-regime-universe.json` · `rlcontracts.js` ·
`scripts/owner-state.mjs` · `scripts/acquire-official-curves.mjs` ·
`scripts/validate-official-curves.mjs` · `market-brief.payload.json` ·
`market-brief.html` · `rlbrief.js` — plus every file a concurrent session holds:
`market-brief.config.json` · `market-brief.config.page.json` ·
`market-brief.page.json` · `market-brief.experimental.json` ·
`scripts/build-attention-items.mjs` · `tests/attention-payload-contract.test.mjs` ·
`notes/README.md`.

The equity calendar is on the excluded list for a reason that is not stylistic:
this scope's whole design is that the file is never consulted, so a diff touching
it is by itself evidence the rule went the wrong way.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| -------- | --------- | ----------------------------- |
| Admission rule | `scripts/brief-refresh.mjs` | The deliverable, and nothing else in that file. |
| Cadence fixtures | `tests/fixtures/official-curves/cadence-*.json` | The committed histories the verdicts are proven against. |
| Project test harness | `scripts/selftest.mjs` | Where the offline freshness group lives. |
| Tool notes | `notes/bond-regime-lab.md` | Where the rule's derivation belongs beside the tool. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --------- | --------- | ------- |
| Equity calendar and its helper | `data/calendars/xnys/calendar.json`, `scripts/validate-brief-cache.mjs` | Neither is read by this feature — that is the design, not an omission |
| Artifact contract and gate | `rlcontracts.js`, `scripts/validate-official-curves.mjs` | Scope 1 |
| Acquisition | `scripts/acquire-official-curves.mjs` | Scope 2 |
| Consumption seam | `scripts/owner-state.mjs` | Scope 4 |
| Renderers | `market-brief.html`, `rlbrief.js`, `bond-regime-lab.html` | Scope 5 |
| Concurrently held brief artifacts | `market-brief.config.json`, `market-brief.config.page.json`, `market-brief.page.json`, `market-brief.experimental.json`, `scripts/build-attention-items.mjs`, `tests/attention-payload-contract.test.mjs`, `notes/README.md` | A concurrent session |

## Rollback

Remove `admitCurveFamily` from `scripts/brief-refresh.mjs`, remove the appended
selftest group and delete the four cadence fixtures. Prove the restore by running
`node scripts/selftest.mjs` and recording exit 0. Nothing downstream is affected,
because scope 4 has not yet wired the rule into a read at the point this scope
closes.

## Scenario-First RED/GREEN Contract

RED: author the six scenarios first. Record the weekend fixture returning `stale`
against a naive elapsed-days rule, and record the short-history fixture returning
`current` before the `undetermined` branch exists — both are the exact defects an
observed-cadence rule removes.

GREEN: the weekend and holiday fixtures return `current` with no staleness
reason; the holiday case additionally records the opened-file set and proves
`data/calendars/xnys/calendar.json` is absent from it; the stale fixture returns
`stale` with `lastObserved`, `elapsedDays`, `windowDays` and a non-empty basis;
the short-history fixture returns `undetermined` and is asserted to be neither
`current` nor `stale`; the boundary is proven at `windowDays` and at
`windowDays + 1`; and the stoppage fixture returns `stale`.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Freshness | unit | SCN-018-007 | `scripts/selftest.mjs` | a Friday `lastObserved` with an injected Sunday run date over a history whose gaps include weekends returns verdict `current` with no staleness reason and a null `errorCode` | `node scripts/selftest.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Freshness | unit | SCN-018-008 | `scripts/selftest.mjs` | a history containing a bond-holiday gap, evaluated on the day after such a holiday, returns `current` — AND the recorded opened-file set for the evaluation does not contain `data/calendars/xnys/calendar.json`, so a rule that were right while reading the wrong file would still fail | `node scripts/selftest.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Freshness | unit | SCN-018-009 | `scripts/selftest.mjs` | a run date past the derived window returns `stale` with `BRL-CURVE-FAMILY-STALE`, and the admission block carries `lastGoodObservedAt`, `elapsedDays`, `windowDays` and a non-empty observed-gap basis | `node scripts/selftest.mjs` | No | `report.md#tp-03-03` |
| TP-03-04 | Named absence | unit | SCN-018-010 | `scripts/selftest.mjs` | fewer observed gaps than `minCadenceObservations` returns `undetermined` with `BRL-CURVE-FRESHNESS-UNDERIVABLE`, asserted to be neither `current` nor `stale`, with a reason stating the observation count | `node scripts/selftest.mjs` | No | `report.md#tp-03-04` |
| TP-03-05 | Boundary | unit | SCN-018-027 | `scripts/selftest.mjs` | the window is enforced at its exact edge from both sides — `current` at `elapsedDays === windowDays` and `stale` at `windowDays + 1` — so the window cannot be widened to infinity while every other case stays green | `node scripts/selftest.mjs` | No | `report.md#tp-03-05` |
| TP-03-06 | Adversarial | unit | SCN-018-028 | `scripts/selftest.mjs` | a bounded trailing gap history with a far larger `elapsedDays` returns `stale`, proving the rule cannot be widened by the publication outage it exists to detect | `node scripts/selftest.mjs` | No | `report.md#tp-03-06` |
| TP-03-07 | Determinism | unit | SCN-018-027 | `scripts/selftest.mjs` | Regression: the same artifact and the same injected run date return the identical verdict, error code and admission block across repeated evaluations, and the rule reads no wall clock | `node scripts/selftest.mjs` | No | `report.md#tp-03-07` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] `admitCurveFamily(artifact, familyId, runDate)` exists in `scripts/brief-refresh.mjs`, takes the run date as a parameter and reads no wall clock, proven by TP-03-07.
- [ ] `cadenceWindowRows`, `minCadenceObservations` and `publicationLagDays` are read from the artifact's own `freshnessPolicy` block, and no window value is hardcoded in the rule, proven by TP-03-05 varying the policy and observing the boundary move with it.
- [ ] `windowDays` equals `maxObservedGapDays + publicationLagDays` over the trailing `cadenceWindowRows` rows, proven by TP-03-05.
- [ ] A weekend run returns `current` with no staleness reason, proven by TP-03-01.
- [ ] A bond-holiday run returns `current`, and `data/calendars/xnys/calendar.json` is proven unread during the evaluation, proven by TP-03-02.
- [ ] A missed publication returns `stale` with `BRL-CURVE-FAMILY-STALE` and a reason naming `lastObserved`, `elapsedDays`, `windowDays` and the observed-gap basis, proven by TP-03-03.
- [ ] Insufficient observed history returns `undetermined` with `BRL-CURVE-FRESHNESS-UNDERIVABLE`, asserted to be neither `current` nor `stale`, proven by TP-03-04.
- [ ] The exact window edge is enforced from both sides, proven by TP-03-05.
- [ ] A live publication stoppage returns `stale`, proven by TP-03-06.
- [ ] The `admission` block carries exactly `verdict`, `errorCode`, `lastGoodObservedAt`, `elapsedDays`, `windowDays` and `basis`, so scope 5 codes against a settled shape, proven by TP-03-03.
- [ ] Uppercase `BRL-*` codes appear only in `errorCode` and lowercase-hyphen reasons only in `diagnostics`, with neither vocabulary in the other's field, proven by TP-03-04.
- [ ] `data/calendars/xnys/calendar.json` and `scripts/validate-brief-cache.mjs` are byte-identical at the end of this scope, verified by `git diff --name-only` naming neither file.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-03-01 executed with raw output recorded at `report.md#tp-03-01`.
- [ ] TP-03-02 executed with raw output recorded at `report.md#tp-03-02`.
- [ ] TP-03-03 executed with raw output recorded at `report.md#tp-03-03`.
- [ ] TP-03-04 executed with raw output recorded at `report.md#tp-03-04`.
- [ ] TP-03-05 executed with raw output recorded at `report.md#tp-03-05`.
- [ ] TP-03-06 executed with raw output recorded at `report.md#tp-03-06`.
- [ ] TP-03-07 executed with raw output recorded at `report.md#tp-03-07`.

#### Build Quality Gate

- [ ] `node scripts/selftest.mjs` exits 0 on the working tree with the freshness group registered and zero skipped assertions.
- [ ] `node scripts/validate-official-curves.mjs` exits 0 against the artifact written by scope 2, unchanged by this scope.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] Zero warnings emitted by any command run for this scope, evidenced by unfiltered output of every command above.
- [ ] The measured `maxObservedGapDays` and the resulting `windowDays` over the artifact scope 2 wrote are recorded verbatim, settling the design's unmeasured gap magnitude with an observation.
