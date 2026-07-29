# Scope 03 — Gamma Evidence And Behavioural Regime

**Status:** Not Started
**Depends On:** SCOPE-01, SCOPE-02
**Tags:** `foundation:true`
**Business scenarios owned:** BS-016-013, BS-016-023, BS-016-024, BS-016-025, BS-016-026

---

## Objective

Establish one producer of gamma evidence and one resolver of behavioural regime,
both inside the options-domain owner module.

Two facts verified on disk this pass make this a relocation rather than a new
capability: `grep -c 'bsmGamma'` returns `2` in `intraday-tape-lab.html` and `6`
in `gamma-trading-lab.html`, and `0` in `rlexperience-adapters/options.js`. The
Black-Scholes gamma model exists twice on two pages and nowhere in the module
that owns the options domain. `design.md` § Implementation Boundary directs the
model — `bsmGamma`, the `spot * 0.9 … spot * 1.1` band with `N = 60`, and the flip
search — to move into `RLOPTIONS`, which is what makes cross-surface agreement
structural rather than coincidental.

This scope produces C1 `gamma-evidence/v1` and C3 `behavioural-regime/v1`. It
consumes SCOPE-02's C2 result rather than re-deriving the cutoff, and it consumes
SCOPE-01's preserved as-of rather than substituting one.

---

## Implementation Files

Every path below is an authorized edit target in `design.md` §
Implementation Boundary. The nested `### Implementation Files` heading is the
exact anchor `implementation-reality-scan.sh` parses.

### Implementation Files

| Path | Boundary row | Nature of the edit in this scope |
|---|---|---|
| `rlexperience-adapters/options.js` | Owner modules — extended, bounded | Add `readGammaEvidence`, `resolveBehaviouralRegime` and `gammaEvidenceFingerprint`, and receive the gamma model moved in from the two pages. `gammaEnv`'s existing sign precedence at line 530 is preserved exactly, not replaced |
| `scripts/selftest.mjs` | Tests and documentation — "assertion groups for the new pure entry points on both owner modules" | Add the assertion groups for the three new entry points, including coverage-floor, hinge-proximity and unlocatable-flip cases |
| `tests/auction-gamma-playbook.spec.mjs` | Tests and documentation — **NEW file created by this feature** | Append this scope's own persistent regression case to the file SCOPE-01 creates, exactly as that scope's table anticipates when it records that later scopes extend the same file. This scope adds no other case and renders no lens |

Verified at line 530: `function gammaEnv(snap, sign)` returns `"unknown"` on a
missing snapshot and multiplies `snap.netGEX` by the caller-supplied `sign`. That
precedence is preserved, not rewritten.

---

## Consumer Impact Sweep

This scope relocates an interface. `design.md` § Module Contracts states the
inline `bsmGamma`, the band and the flip search move into `RLOPTIONS`. The
consumers of the relocated model are enumerated here so no site is left reading a
retired copy.

| Consumer surface | Current state, verified this pass | Disposition |
|---|---|---|
| `intraday-tape-lab.html` — inline `bsmGamma` and band | 2 occurrences of `bsmGamma`; `computeOptLevels` at lines 1283–1302 and the band at line 1293, flip search at lines 1296–1298 | Retired against `RLOPTIONS.readGammaEvidence` by SCOPE-06, which owns that page's delegation |
| `gamma-trading-lab.html` — inline `bsmGamma` and band | 6 occurrences of `bsmGamma`; the model at line 1053 and the identical band at line 1074 | Retired against `RLOPTIONS.readGammaEvidence` by SCOPE-09, which owns the cross-surface single-source proof |
| `options.js` internal callers of `gammaEnv` | `gammaEnv` at line 530 is the existing sign-precedence evaluator | Unchanged. `resolveBehaviouralRegime` delegates the sign question to it rather than replacing it |
| `computeGammaPlaybookSummary` (`options.js` line 562) | The dealer-flow consumer of the by-strike profile, vanna flip and OVI series | Unchanged. Axis 2 of `design.md` § Variation axes requires one evidence record with two projections, so this consumer keeps its projection rather than being narrowed to the lens's four fields |
| `rlexperience-adapters/market-structure.js` | Forbidden from importing another domain adapter module by its own header at line 15 | No edge is created. The regime reaches the auction module as inert data on frozen owner state, never by import |

**Change boundary.** This scope adds to `options.js` only. It does not edit either
page; both page retirements are owned by the scopes named above, so the relocated
model and its two retirements each land under a boundary that names them. No
existing exported behaviour of `RLOPTIONS` changes shape.

---

## Gherkin Scenarios

### BS-016-013: The regime carries its own falsifier, distinct from the expectation's

```gherkin
Scenario: A user asks what would indicate the behavioural regime itself has changed
  Given a playbook cell has been asserted with a stated behavioural regime
  When the user reads the cell's basis
  Then the cell states the observation that would indicate the regime itself has changed
  And that regime-level observation is stated distinctly from the falsifier of the individual expectation
  And the user can tell which of the two a given observation would trigger
```

### BS-016-023: Thin snapshot coverage bounds confidence and is named in the cell's own basis

```gherkin
Scenario: A gamma snapshot has few contracts carrying usable implied volatility and open interest
  Given a behavioural regime is derived from a snapshot whose usable contract coverage is thin
  When the user reads the resulting playbook cell
  Then the cell's stated confidence is bounded by that coverage quality
  And the coverage limitation is named in the cell's own basis rather than only in a general disclosure
  And the cell does not present with the confidence of a comparable well-covered cell
```

### BS-016-024: Coverage too thin to support any regime yields a reduced read

```gherkin
Scenario: A gamma snapshot has too few usable contracts to support a behavioural regime
  Given the usable contract coverage falls below what a behavioural regime requires
  When the user requests the playbook read
  Then the gamma half is presented as unavailable with coverage named as the reason
  And no behavioural regime is asserted
  And an auction-only reduced read is issued
```

### BS-016-025: Hinge proximity refuses a suppressive or amplifying claim

```gherkin
Scenario: Price sits close enough to the gamma flip that the modelled sign is unstable
  Given the modelled net-gamma sign would read as one regime at the current price
  And price sits close enough to the gamma flip that modest movement would invert that sign
  When the user reads the behavioural regime
  Then the regime is presented as hinge-proximate
  And the read does not present the regime as suppressive and does not present it as amplifying
  And the read names the flip distance that makes the sign unstable
  And any expectation stated under this regime is presented as two-sided rather than directional
```

### BS-016-026: A flip outside the sampled band is stated as not locatable

```gherkin
Scenario: The modelled net-gamma profile changes sign outside the band sampled around spot
  Given the gamma flip is located by sampling the modelled profile across a band spanning ten percent either side of spot
  And no sign change occurs within that band
  When the user reads the gamma flip element
  Then the flip is presented as not locatable within the modelled band
  And the read states that the search was bounded to that band rather than implying no flip exists
  And no flip distance is presented
  And no behavioural regime is claimed on the basis of a flip distance
```

---

## Implementation Plan

**1. Move the gamma model in, unchanged in behaviour.**
`bsmGamma`, the `spot * 0.9 … spot * 1.1` band with `N = 60`, and the flip search
land in `options.js`. This is a relocation of an identical computation, which is
the precondition for two surfaces agreeing by construction.

**2. Add `readGammaEvidence(chainSource, opts) -> GammaEvidenceV1`.**
`chainSource` is an already-fetched, already-parsed snapshot. The function does
not fetch — the rule at `options.js` lines 16–18 is a constraint, not a
preference. `opts` carries `{ sourceKind, riskFreeRate, dividendYield, coverageFloor }`
so the rate and dividend the page supplies are the values the record discloses,
rather than a module-internal constant that would make FR-016-033's disclosure a
restatement of the module.

A complete C1 record is returned on every path. An unusable chain returns
`availability: { state: "unavailable", reason }` and never `null`, because a
`null` carries no reason and NFR-016-005 requires one.

**3. State the band, and represent an unfound flip as unfound.**
`searchBand` on the record states the ten-percent bounds and the sample count.
`flipLocatable: false` is the only representation of an unfound flip. The record
never carries `flip: 0`, never carries the band edge, and never carries an
interpolated guess, so FR-016-028 is enforced by the record's shape rather than by
review. No regime is claimed on a flip distance that does not exist.

**4. Count coverage with the predicate the model already applies.**
`coverage.usableContracts` counts contracts passing the exclusion already applied
inside `gammaAt` — strike present, `iv > 0`, `openInterest > 0`. Using the same
predicate that decides what enters the model to decide what is counted keeps the
ratio from drifting from the model it describes. `coverageFloor` is a declared
input; below it the regime resolves unavailable with coverage named as the cause.

**5. Add `resolveBehaviouralRegime(gammaEvidence, cutoffRead, opts) -> BehaviouralRegimeV1`.**
Pure over its three arguments. It consumes SCOPE-02's C2 result rather than
re-deriving it, which is what gives the cutoff exactly one evaluator. `opts`
carries `{ hingeBandPct, dealerSign }`; `dealerSign` preserves `gammaEnv`'s
existing signature shape so the sign convention stays a caller-declared input.

Sign precedence is delegated to the existing `gammaEnv` order — `spot >= flip`
first, raw `netGEX` sign second, `unknown` third. Changing it here would make two
surfaces disagree on identical evidence, which is the outcome BS-016-036 exists to
prevent.

**6. Resolve hinge proximity ahead of a directional claim.**
When price sits inside `hingeBandPct` of the flip, the regime resolves
hinge-proximate and states the flip distance that makes the sign unstable. The
record carries neither the suppressive nor the amplifying value in that case, so a
downstream consumer cannot recover a directional claim the resolver refused.

**7. Carry the regime's own falsifier on the regime record.**
C3 states the observation that would indicate the regime itself has changed. It is
a field on the regime record, distinct from any expectation-level falsifier, so
the two remain separable at the point a user reads them. SCOPE-05 renders both
side by side; this scope is where the regime-level observation originates.

**8. Bound confidence by coverage on the regime record.**
The confidence the regime supports is bounded by coverage quality and names
coverage as the bounding input. `design.md` § What may never be inferred or
defaulted forbids averaging confidence across primitives or taking it from the
strongest.

**9. Add `gammaEvidenceFingerprint(gammaEvidence) -> string`.**
A digest over the fields that determine the regime, so cross-surface
reconciliation can answer without either surface re-deriving the other's numbers.
SCOPE-09 consumes it.

**Boundary held.** No fetch, no credential, no import of another domain adapter
module. `gammaEnv` at line 530 keeps its precedence. `computeGammaPlaybookSummary`
at line 562 keeps its projection. A chain without `asof` yields `asOf: null` with
a reason naming the omission; the module never substitutes the retrieval time, the
calendar date or the current time.

---

## Test Plan

This scope's Implementation Files are `rlexperience-adapters/options.js`,
`scripts/selftest.mjs` and `tests/auction-gamma-playbook.spec.mjs`. It adds three
pure entry points and edits no page, so every unit row runs
`node scripts/selftest.mjs`. The one browser row asserts those entry points
executing inside a real page from the real module file, the technique
`tests/simple-model-adapters-market.spec.mjs` already applies to this module for
`gamma-trading-lab.html` and `options-structure-lab.html`. The cross-surface
browser proof that consumes `gammaEvidenceFingerprint` across both pages at once
belongs to SCOPE-09, whose Implementation Files include the surfaces it asserts
against.

**Adversarial fixture rule for this scope.** The behaviour being replaced is
`sessionGammaTag` (`market-structure.js` lines 959–967), which reads only
`gamma.callWall` and `gamma.putWall` — discarding the net-gamma sign and the flip
distance entirely. A fixture whose two cases differ in their walls would be
separated by that old wall-position-only logic just as well as by the new
resolver, and so proves nothing. Every row marked **adversarial** below therefore
holds `callWall` and `putWall` **identical across both cases** and varies only a
field the old path never read. Under the old behaviour both cases collapse to one
value and the assertion fails; only a resolver that actually reads net-gamma sign
and flip distance can separate them.

| ID | Test Type | Category | File / Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|
| TP-03-01 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 03 gamma evidence and behavioural regime (options)` | `readGammaEvidence` returns a complete C1 record on every path; an unusable chain returns `availability: { state: "unavailable", reason }` and never `null`, because a `null` carries no reason | `node scripts/selftest.mjs` | No |
| TP-03-02 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 03 gamma evidence and behavioural regime (options)` | `coverage.usableContracts` counts contracts with the same predicate `gammaAt` already applies — strike present, `iv > 0`, `openInterest > 0` — so the ratio cannot drift from the model it describes | `node scripts/selftest.mjs` | No |
| TP-03-03 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 03 gamma evidence and behavioural regime (options)` | A thin-but-usable snapshot bounds the resolved regime's stated confidence by coverage quality and names coverage as the bounding input on the record itself, not only in a general disclosure | `node scripts/selftest.mjs` | No |
| TP-03-04 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 03 gamma evidence and behavioural regime (options)` | Coverage below the supplied `coverageFloor` resolves the regime unavailable with coverage named as the cause, and no regime value is populated on that record | `node scripts/selftest.mjs` | No |
| TP-03-05 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 03 gamma evidence and behavioural regime (options)` | Adversarial input: a modelled profile with no sign change anywhere in `spot * 0.9 … spot * 1.1` at `N = 60`. The record returns `flipLocatable: false` with `searchBand` stating the bounds and the sample count, and carries no flip distance — not `flip: 0`, not the band edge, not an interpolated value. Any of those substitutes fails the assertion | `node scripts/selftest.mjs` | No |
| TP-03-06 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 03 gamma evidence and behavioural regime (options)` | Adversarial input: two snapshots with **identical** `callWall` and `putWall`, differing only in flip distance — one inside `hingeBandPct`, one outside. The wall-position-only logic returns one value for both; `resolveBehaviouralRegime` returns hinge-proximate for the first and a stable regime for the second | `node scripts/selftest.mjs` | No |
| TP-03-07 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 03 gamma evidence and behavioural regime (options)` | Adversarial input: two snapshots with **identical** `callWall` and `putWall` and opposite `netGEX` sign. The wall-position-only logic returns one value for both; `resolveBehaviouralRegime` returns suppressive against one and amplifying against the other, following `gammaEnv`'s existing precedence at line 530 unchanged. The hinge-proximate record carries neither the suppressive nor the amplifying value, so no downstream consumer can recover a directional claim the resolver refused | `node scripts/selftest.mjs` | No |
| TP-03-08 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 03 gamma evidence and behavioural regime (options)` | The C3 record carries the observation that would indicate the regime itself has changed as its own field, populated independently of any expectation-level falsifier, so the two stay separable wherever they are read together | `node scripts/selftest.mjs` | No |
| TP-03-09 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 03 gamma evidence and behavioural regime (options)` | `gammaEvidenceFingerprint` over an `unavailable` C1 record differs from the fingerprint of any record carrying a resolved regime, so an absent gamma half can never report as agreeing with a present one | `node scripts/selftest.mjs` | No |
| TP-03-10 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-024 an unavailable gamma record never fingerprints as a resolved one` | The persistent regression case for the availability contract this scope introduces, asserted on the real `gamma-trading-lab.html` page with the real `rlexperience-adapters/options.js` file injected — the same real-module-into-real-page technique `tests/simple-model-adapters-market.spec.mjs` already applies to this module — and with no `page.route`, no `context.route` and no request interception: `readGammaEvidence` over a chain whose contracts are all unusable returns an `availability.state` of `"unavailable"` carrying a reason rather than `null`, and `gammaEvidenceFingerprint` over that record differs from the fingerprint of a record carrying a resolved regime. A build that returns a bare `null` on the unusable path, or that fingerprints the two alike, fails this case in the browser | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BS-016-024 an unavailable gamma record never fingerprints as a resolved one" --reporter=list` | Yes |

---

### Definition of Done

- [ ] `[TP-03-01]` `[BS-016-024]` `readGammaEvidence` returns a complete record with a named availability state on every input, including an unusable chain, so a caller never has to interpret a bare absence.
- [ ] `[TP-03-02]` `[BS-016-023]` Usable-contract coverage is counted with the same exclusion the gamma model applies, so the coverage figure describes the contracts that actually entered the model.
- [ ] `[TP-03-03]` `[BS-016-023]` A gamma snapshot has few contracts carrying usable implied volatility and open interest: the regime derived from that snapshot yields a stated confidence bounded by the coverage quality, its own basis names the coverage limitation rather than leaving it to a general disclosure, and it does not present with the confidence of a comparable well-covered record.
- [ ] `[TP-03-04]` `[BS-016-024]` A gamma snapshot has too few usable contracts to support a behavioural regime: coverage below the declared floor resolves the gamma half as unavailable with coverage named as the reason, and no behavioural regime value is populated on that record.
- [ ] `[TP-03-05]` `[BS-016-026]` The modelled net-gamma profile changes sign outside the band sampled around spot: the flip is presented as not locatable within the modelled band, the record states that the search was bounded to that ten-percent band rather than implying no flip exists, no flip distance is presented, and `flip: 0`, a band edge and an interpolated value are each never substituted, so no regime is claimed on a flip distance that does not exist.
- [ ] `[TP-03-06]` `[BS-016-025]` Price sits close enough to the gamma flip that the modelled sign is unstable: two snapshots identical in both walls but differing in flip distance resolve to hinge-proximate and to a stable regime respectively, and the hinge-proximate record names the flip distance that makes the sign unstable.
- [ ] `[TP-03-07]` `[BS-016-025]` Two snapshots identical in both walls but opposite in net-gamma sign resolve to opposite regimes under `gammaEnv`'s unchanged precedence, and the hinge-proximate record carries neither the suppressive nor the amplifying value.
- [ ] `[TP-03-08]` `[BS-016-013]` The regime record states the observation that would indicate the regime itself has changed, as a field distinct from any expectation-level falsifier.
- [ ] `[TP-03-09]` `[BS-016-024]` The fingerprint of an unavailable gamma record is distinguishable from that of a resolved one, so an absent half cannot be reconciled as agreement.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-03-10]` `tests/auction-gamma-playbook.spec.mjs` carries `Regression: BS-016-024 an unavailable gamma record never fingerprints as a resolved one`, which drives the real `gamma-trading-lab.html` page with the real `rlexperience-adapters/options.js` file injected and no request interception, and fails if `readGammaEvidence` returns a bare `null` on the all-unusable path or if `gammaEvidenceFingerprint` renders an unavailable record and a resolved one alike.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the real-page Playwright regression spec that already injects this module, `tests/simple-model-adapters-market.spec.mjs`, both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.

### Build Quality Gate

- [ ] `node scripts/selftest.mjs` completes with zero failing assertions and zero warnings.
- [ ] `node scripts/validate-tool-experience.mjs` completes clean; no registry count moves, because this scope registers nothing.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/016-auction-gamma-playbook` exits 0.
- [ ] `notes/intraday-tape-lab.md` states that the gamma model and the behavioural regime resolve inside the options owner module, matching the behaviour this scope shipped.
- [ ] Only the paths in this scope's Implementation Files table were modified; neither page is edited here, and `gammaEnv` at line 530 and `computeGammaPlaybookSummary` at line 562 are behaviourally unchanged.
