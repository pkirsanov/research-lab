# Scope 3: Effective Marginal Rate Curve

## 03-effective-marginal-rate-curve

Planning authority: the [scope index](../_index.md). Execution evidence belongs
in [report.md](report.md).

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** `engine:federal`, `derived-from-scope-02`, `cliff-preserving`
**Depends On:** 01, 02
**Foundation:** false

**Primary Outcome:** a household that has one reconciled annual federal result
receives a per-year curve of what the next dollar actually costs — one curve for
the next dollar of ordinary income and one for the next dollar of realized
long-term gain. Every point that moves is attributed to a named threshold with
its rule-pack source. A cliff renders as a step. Every threshold this slice does
not carry is listed as an unavailable contributor with its code, so the curve is
labeled incomplete by construction rather than presented as the whole picture.

## Why This Scope Exists

A statutory bracket does not describe what a household pays on the next dollar.
The source note calls the effective marginal rate the single most
decision-relevant output in the tool, and calls a conversion recommendation that
cites only a statutory bracket incomplete. Scope 4 is exactly that
recommendation, so this curve must exist before it.

The honest complication is that most of the thresholds that make the effective
rate diverge from the statutory rate are **not in this slice**. Taxable Social
Security benefits, IRMAA bands, the premium tax credit, net investment income
tax and every state boundary are deferred. A curve that silently omits them
would be a statutory bracket wearing a better name. That is why
`unavailableContributors[]` is a required, populated member here and not an
edge case: in slice 1 it is the larger half of the answer.

## Requirement Coverage

Provisional anchors pending `spec.md` (see the [scope index](../_index.md)).

- **PRA-021-019** — a per-year curve for ordinary income and for realized long-term gain, never a single rate.
- **PRA-021-020** — every contributing threshold named with its rule-pack source.
- **PRA-021-021** — a cliff renders as a step; smoothing is forbidden.
- **PRA-021-022** — an unsupported threshold is an `unavailableContributor`, never an omission.
- **PRA-021-023** — the curve is derived from the Scope 02 result and re-declares no rate, edge or table.
- **PRA-021-024** — a text-equivalent table carries every point, every threshold name and every unavailable contributor.

Inherited and re-asserted: **PRA-021-004** (rule status on every result) and
**PRA-021-005** (`Unavailable` rather than a number).

## Gherkin Scenarios

```gherkin
Scenario: SCN-021-007 The next dollar is priced as a curve, not as a single rate
  Given a household with a reconciled annual federal result for the declared tax year
  When the effective marginal rate curve is computed for ordinary income and for realized long-term gain
  Then two ordered curves are returned, each with more than one point across the swept range
  And each curve point states the marginal cost of the next dollar at that level of additional income
  And each segment names every threshold that contributes to its rate, with the rule-pack source of each
  And no single scalar rate is offered as a substitute for either curve

Scenario: SCN-021-008 A cliff renders as a step and is never smoothed
  Given the resolved pack declares a threshold whose crossing changes the marginal cost discontinuously
  When the curve is computed across that threshold
  Then the point immediately below and the point immediately at the threshold carry different marginal rates with no interpolated point between them
  And the segment is flagged as a cliff rather than as a phase-in
  And no averaging, smoothing, or gradient fill appears between the two sides

Scenario: SCN-021-009 A threshold this slice does not carry is named unavailable, not omitted
  Given the federal pack lists taxable Social Security benefits, IRMAA bands, the premium tax credit, and net investment income tax among its unsupported features
  When the curve is computed
  Then each of those thresholds appears as an unavailable contributor carrying its own code and the reason it is unavailable
  And the curve is labeled incomplete, naming the count of unavailable contributors
  And no unavailable contributor is rendered as a zero contribution, an omission, or a footnote outside the curve contract
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-021-007 curve | Valid workspace, reconciled Scope 02 result | Open the marginal-rate panel | Two curves plus a text-equivalent table; every segment lists its named thresholds and their sources | e2e-ui |
| SCN-021-008 cliff | Pack declares a discontinuous threshold | Sweep additional income across that threshold | Two adjacent rows with different rates and no interpolated row; the segment is labeled a cliff | e2e-ui |
| SCN-021-009 incomplete | Valid workspace | Open the curve's completeness disclosure | Every unavailable contributor listed by name, code and reason; the curve carries an incomplete label with the count | e2e-ui |
| Text equivalent | Valid workspace | Navigate the chart by keyboard only | The text-equivalent table exposes every point and every threshold name without requiring the chart | e2e-ui |

## Implementation Files

### New

- Fixture files for a monotonic segment, a phase-in segment, a declared cliff,
  and a case whose unavailable-contributor list is non-empty.

### Modified

- `rltax.js` — one added function, `computeEffectiveMarginalCurve(...)`, plus
  its curve-record constructor. The module gains no new threshold, rate or
  table; it gains a finite-difference sweep over the function Scope 02 already
  owns.
- `lifetime-tax-strategy-lab.html` — the curve panel and its text-equivalent
  table. The Simple/Power split is completed in Scope 05.
- `scripts/selftest.mjs` — one appended assertion group.
- The Playwright specs from Scopes 01 and 02, extended with this scope's
  persistent titles in a new spec file.

## Implementation Plan

1. Add `computeEffectiveMarginalCurve(workspace, pack, kind, sweep)` to
   `rltax.js` as a top-level `function` declaration. `kind` is drawn from a
   closed pair, `ordinary` and `long-term-gain`. The function calls
   `computeAnnualFederalTax(...)` and takes a finite difference. It does not
   re-derive tax from bracket data, because a second derivation is a second
   definition and would drift the moment a pack value moves.
2. Fix the sweep as a declared contract rather than a magic constant: the step
   size, the swept range and the probe increment come from
   `lifetime-tax-strategy.config.json`, which Scope 01 made mandatory. A missing
   or malformed sweep policy is `RLTAX-CONFIG-INVALID`, not a fallback.
3. Attribute each segment. For every step of the sweep, record which pack
   thresholds the probe dollar crossed, and carry each threshold's name and its
   `sourceRecords[]` reference into `contributingThresholds[]`. A segment whose
   rate changes with no attributable threshold is a defect and is refused
   `RLTAX-THRESHOLD-UNAVAILABLE` rather than displayed as an unexplained move.
4. Preserve cliffs structurally. Where the pack declares a discontinuity, the
   curve emits the point immediately below and the point at the threshold as two
   adjacent points with different rates and no synthesized point between them.
   The record carries `cliff: true` for that segment. There is no code path that
   averages, interpolates or fills across a declared discontinuity, because the
   step is precisely the quantity a user steers around.
5. Populate `unavailableContributors[]` from the resolved pack's
   `unsupportedFeatures[]`, filtered to the entries that would have moved a
   marginal rate had they been supported: taxable Social Security benefits,
   IRMAA bands, the premium tax credit, net investment income tax, the
   additional Medicare tax, and every state boundary. Each entry carries its
   code and its reason. This list is populated in slice 1 by design, and an
   empty list here is itself a defect.
6. Label the curve incomplete whenever `unavailableContributors[]` is non-empty,
   and publish the count. The label is a field on the record, not page copy, so
   it cannot be dropped by a rendering change.
7. Emit the text-equivalent table from the same record the chart reads. One
   source, two renderings. A table assembled separately from the chart is a
   second definition of the curve and would let the two disagree.
8. Append a `lifetime-tax — effective marginal rate curve` group to
   `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary before broad tests | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltax.js` | One function added | Scopes 04, 05 | **High** — a curve that re-derives tax from bracket data instead of calling Scope 02 silently forks the definition, and the fork is invisible until a pack value changes | Assert the curve's every rate is reproducible by calling `computeAnnualFederalTax` twice and differencing, and that `rltax.js` still holds no tax-domain numeric constant | Remove the added function; Scope 02 is untouched |
| `lifetime-tax-strategy.config.json` | Sweep policy members added | Scopes 04, 05 | Medium — a config member with a silent default reintroduces a magic constant | Assert a removed sweep policy yields `RLTAX-CONFIG-INVALID` and no computed curve | Remove the added members |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the appended group |
| `lifetime-tax-strategy-lab.html` | Curve panel added | Scope 05 | Low — same-feature page | CSP meta stays byte-identical | Revert the panel |
| Scope 01 and Scope 02 modules | Read only | Scopes 04, 05 | Medium — a rule resolved outside Scope 01 breaks the `Unavailable` guarantee | Assert the curve reaches pack data only through `resolveRulePack` | Not applicable |

## Change Boundary And Protected Paths

**Allowed new:** this scope's fixture files · a new Playwright spec named
`lifetime-tax-marginal.spec.mjs` in the repository test directory.

**Allowed modified:** `rltax.js` · `lifetime-tax-strategy.config.json` ·
`lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs` (append-only).

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `tools.json` · `index.html` ·
`rlnav.js` · `README.md` · `notes/README.md` · `market-brief.*` · `rlbrief.js` ·
`briefs/**` · `data/**` · `brief-history.jsonl` · every script under
`scripts/brief-*` · `watchlist.json` · `site-exclusions.json` (its entry is
already correct from Scope 01) · `scripts/validate-spec-test-paths.baseline` ·
every framework-managed file under `.github/bubbles/`,
`.github/agents/bubbles*`, `.github/prompts/bubbles.*`,
`.github/instructions/bubbles-*` and `.github/skills/bubbles-*`.

**Dirty-work discipline:** capture a path-scoped `git status` and a zero-context
diff before each allowed path. No formatter and no broad rewrite runs.

**Rollback:** remove the added function and config members, revert the panel and
the appended selftest group, delete the new spec and fixtures.

## Scenario-First Red/Green Contract

Add the named curve assertion or the persistent browser title first and run the
exact command. RED is valid only when the intended contract assertion fails. A
syntax error, a missing browser, an absent test discovery or a different failing
assertion does not satisfy RED. After the smallest owned implementation, rerun
the identical command for GREEN.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Contract | unit | SCN-021-007 | `scripts/selftest.mjs` | The curve returns an ordered multi-point series for `ordinary` and a second for `long-term-gain`; no API returns a scalar effective rate | `node scripts/selftest.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Known value | unit | SCN-021-007 | `scripts/selftest.mjs` | Each curve rate equals the difference of two `computeAnnualFederalTax` calls at the probe boundary, to full internal precision, for every fixture | `node scripts/selftest.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Attribution | unit | SCN-021-007 | `scripts/selftest.mjs` | Every segment whose rate differs from its predecessor names at least one contributing threshold and carries that threshold's `sourceRecords[]` reference | `node scripts/selftest.mjs` | No | `report.md#tp-03-03` |
| TP-03-04 | Adversarial | unit | SCN-021-007 | `scripts/selftest.mjs` | Regression: a mutated implementation that changes a rate with no attributable threshold is proven to be refused `RLTAX-THRESHOLD-UNAVAILABLE` rather than displayed | `node scripts/selftest.mjs` | No | `report.md#tp-03-04` |
| TP-03-05 | Cliff preservation | unit | SCN-021-008 | `scripts/selftest.mjs` | Across a declared discontinuity the curve emits two adjacent points with different rates, no interpolated point between them, and `cliff: true` on the segment | `node scripts/selftest.mjs` | No | `report.md#tp-03-05` |
| TP-03-06 | Adversarial | unit | SCN-021-008 | `scripts/selftest.mjs` | Regression: a mutated implementation that interpolates or averages across a declared cliff is proven to fail the step assertion — the guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-03-06` |
| TP-03-07 | Incompleteness | unit | SCN-021-009 | `scripts/selftest.mjs` | `unavailableContributors[]` is non-empty for the slice-1 pack, names taxable Social Security benefits, IRMAA bands, the premium tax credit and net investment income tax with codes and reasons, and the curve carries an incomplete label with the count | `node scripts/selftest.mjs` | No | `report.md#tp-03-07` |
| TP-03-08 | Adversarial | unit | SCN-021-009 | `scripts/selftest.mjs` | Regression: an empty `unavailableContributors[]` for the slice-1 pack is proven to fail, and a contributor rendered as a zero contribution is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-03-08` |
| TP-03-09 | No-shadow | unit | SCN-021-007 | `scripts/selftest.mjs` | Regression: `rltax.js` still holds no tax-domain numeric constant and no bracket table after this scope; the curve reaches pack data only through Scope 01's resolver | `node scripts/selftest.mjs` | No | `report.md#tp-03-09` |
| TP-03-10 | Config | unit | SCN-021-007 | `scripts/selftest.mjs` | A missing or malformed sweep policy yields `RLTAX-CONFIG-INVALID` and no curve; no sweep constant is hard-coded in `rltax.js` | `node scripts/selftest.mjs` | No | `report.md#tp-03-10` |
| TP-03-11 | Single-source rendering | unit | SCN-021-007 | `scripts/selftest.mjs` | The text-equivalent table and the chart read the identical curve record; a table assembled from a second derivation is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-03-11` |
| TP-03-12 | Regression E2E | e2e-ui | SCN-021-007 | `lifetime-tax-marginal.spec.mjs` | `Regression: SCN-021-007 the next dollar is priced as a curve with named thresholds` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-007 the next dollar is priced as a curve with named thresholds" --reporter=list` | Yes | `report.md#scenario-scn-021-007` |
| TP-03-13 | Regression E2E | e2e-ui | SCN-021-008 | `lifetime-tax-marginal.spec.mjs` | `Regression: SCN-021-008 a cliff renders as a step and is never smoothed` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-008 a cliff renders as a step and is never smoothed" --reporter=list` | Yes | `report.md#scenario-scn-021-008` |
| TP-03-14 | Regression E2E | e2e-ui | SCN-021-009 | `lifetime-tax-marginal.spec.mjs` | `Regression: SCN-021-009 unsupported thresholds are named unavailable contributors and the curve is labeled incomplete` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-009 unsupported thresholds are named unavailable contributors and the curve is labeled incomplete" --reporter=list` | Yes | `report.md#scenario-scn-021-009` |
| TP-03-15 | Broader Regression E2E | e2e-ui | SCN-021-001 … -009 | `lifetime-tax-foundation.spec.mjs`, `lifetime-tax-federal.spec.mjs`, `lifetime-tax-marginal.spec.mjs` | Execute the cumulative Scope 01 through Scope 03 browser suites over the real route with no request interception, no service worker and no external provider | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-00" --reporter=list` | Yes | `report.md#tp-03-15` |
| TP-03-16 | Repo gate | unit | SCN-021-007 … -009 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-03-16` |
| TP-03-17 | Path guard | unit | SCN-021-007 … -009 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-03-17` |

Before any browser row, run `node scripts/validate-node-source-lock.mjs` and
`npx --no-install playwright --version`. These environment gates do not replace a
Test Plan row.

### Definition of Done

- [x] PRA-021-019 through PRA-021-024 are implemented: two curves rather than a
      rate, named thresholds with sources, cliffs preserved as steps, a
      populated unavailable-contributor list, derivation from Scope 02, and a
      text-equivalent table.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-01` through `report.md#tp-03-11`
  - **Claim Source:** executed · **Result:** all 15 assertions in the Scope 03 group pass at `3042 passed, 0 failed`, exit 0. Two ordered curves with no `averageRate` and no scalar rate (TP-03-01), 6 moved segments each naming a threshold whose `sourceRef` resolves (TP-03-03), 5 pack-derived band edges each rendering as a probe-width step with no interpolated point (TP-03-05), the contributor set equal to the pack's `movesMarginalRate` entries in both directions (TP-03-07), and the text-equivalent rows emitted from the identical record the chart reads (TP-03-11).

- [x] Every curve rate is proven equal to a difference of two Scope 02 results,
      to full internal precision. No rate is derived from bracket data inside
      the curve implementation.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-02`, `report.md#tp-03-09`
  - **Claim Source:** executed · **Result:** 198 sampled points each equal to a forward difference of two full `computeAnnualFederalTax` settlements to full internal precision (TP-03-02), and the no-shadow detector reports an empty offender list with no band table declared in `rltax.js` (TP-03-09). Substituting the average rate `here / level` for the forward difference is proven to break TP-03-01 and both curve browser rows.

- [x] The cliff adversarial case proves the guard can fail: an interpolating
      implementation is demonstrated to break the step assertion.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-06`
  - **Claim Source:** executed · **Result:** TP-03-06 constructs a curve carrying an averaged point between the crossing pair and proves it breaks the no-interpolated-point assertion the real curve satisfies. The RED is permanent rather than transient: the interpolating implementation is built and refuted on every run.

- [x] `unavailableContributors[]` is non-empty for the slice-1 pack and names
      every deferred threshold that would have moved a marginal rate. An empty
      list is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-07`, `report.md#tp-03-08`
  - **Claim Source:** executed · **Result:** TP-03-08's permanent assertion builds a pack declaring no marginal-rate-moving absence and proves the empty list fails. A transient probe confirmed it end to end: making the contributor loop unreachable turned TP-03-07 (both assertions), TP-03-08 and the SCN-021-009 browser row red at `3038 passed, 4 failed`; the probe was reverted and all four returned green.

- [x] The sweep policy is read from configuration and a missing policy is
      refused `RLTAX-CONFIG-INVALID`. No sweep constant is hard-coded.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-10`
  - **Claim Source:** executed · **Result:** TP-03-10 refuses a missing, a negative, an over-budget and an unknown-kind sweep member with `RLTAX-CONFIG-INVALID` and no curve, and asserts in the same row that no sweep constant is declared in the engine.

- [x] Every Test Plan row has intended RED evidence and same-command GREEN
      evidence, recorded before the cumulative browser row.
  - **Phase:** implement · **Command:** the exact TP-03-01 through TP-03-14 commands · **Evidence:** `report.md#test-evidence`
  - **Claim Source:** executed · **Result:** all rows carry RED and same-command GREEN, recorded before TP-03-15. Two reversible probes supplied the RED — the average-rate substitution (TP-03-01, SCN-021-007, SCN-021-008) and the emptied contributor list (TP-03-07, TP-03-08, SCN-021-009). Six rows (TP-03-04, -05, -06, -07, -08, -11) are permanent guard-can-fail assertions whose RED is encoded in the assertion. Each probe was reverted before the next began; `git status --short rltax.js` is empty.

- [x] No output in this scope states a probability, a lifetime figure, a
      recommendation, a track record or an error rate.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
  - **Claim Source:** executed · **Result:** the claim scan is a permanent selftest assertion covering `rltax.js`, which owns the curve, and it passes. Its can-fail proof plants a forbidden token in a copy of each scanned file and asserts it is caught.

- [x] Feature 008 files, the six registries and every brief or data artifact are
      byte-identical.
  - **Phase:** implement · **Command:** a path-scoped `git status` over the excluded list · **Evidence:** `report.md#change-boundary`
  - **Claim Source:** executed · **Result:** the path-scoped `git status --short` returns no rows for any excluded path, and returns no rows for `rltax.js` after every probe. The only files this dispatch modified are this scope's `report.md` and `scope.md`.

- [x] `node scripts/selftest.mjs` is green with no fall in pass count and no
      existing assertion edited, relaxed or removed, and
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths
      with the baseline file unmodified.
  - **Phase:** implement · **Command:** both commands · **Evidence:** `report.md#tp-03-16`, `report.md#tp-03-17`
  - **Claim Source:** executed · **Result:** `Research-Lab self-test: 3042 passed, 0 failed`, identical to the count at the start of this dispatch and after every probe revert; `new=0 stale=0 baseline=66` at exit 0 from the path guard with the baseline file unmodified.
