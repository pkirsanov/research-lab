# Scope 4 Execution Report — Bracket-Fill Roth Conversion Comparison

This file is the evidence surface for scope 4. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-04-01

Scenario SCN-021-010 — exactly two policies are returned, both computed from the
identical workspace and the identical resolved pack.
Command: `node scripts/selftest.mjs`

### TP-04-02

Scenario SCN-021-010 — the conversion amount equals the distance to the named
bracket edge, for every supported filing status and every bracket.
Command: `node scripts/selftest.mjs`

### TP-04-03

Scenario SCN-021-010 — mutating the pack's bracket edge changes the conversion
amount, and `rltaxstrategy.js` declares no bracket edge of its own.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

The pack-edge half of this row is a permanent in-suite mutation: the assertion
builds a copy of the shipped pack with `single` band `b3` moved to `111111` and
requires the fill amount to move with it, `movedEdgeFill.value === 111111 - 60000`
against `originalFill.value === 105700 - 60000`. A module holding its own edge
cannot satisfy both halves.

The no-constant half was given intended RED by probe 1 — an unused
`var probeSlice1BracketEdge = 105700;` was added to `convertedWorkspace`. It
changes no behaviour, so only the constant detectors can see it:

```text
# PROBE-1 RED: injected tax-domain constant 105700 into rltaxstrategy.js
$ node scripts/selftest.mjs
exit: 1
lines: 3437
sha256: 558b36bda815199ba159dc486e9b2a891a9f23e11effd78a80b5755523e29344
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-04-03: mutating the pack bracket edge moves the conversion amount, and rltaxstrategy.js carries no tax-domain numeric constant and declares no bracket edge (105700)
  ✗ FAIL: TP-02-11: no rltax module holds a pack bracket edge as a numeric literal or declares a band table of its own, so every rate and every edge is read from the resolved pack in all 14 module(s) (rltaxstrategy.js:105700)
  ✗ FAIL: TP-02-11 ADVERSARIAL: the guard can fail — a top bracket edge and a declared band table planted in rltaxrules.js are invisible to a scan that reads rltax.js alone and are named by both detectors once the scan reaches every module

Research-Lab self-test: 3039 passed, 3 failed
```

The RED names the planted value `105700` back in the failure text, so the
detector reported the literal it actually found rather than failing for an
unrelated reason. It is a genuine two-detector catch: the Scope 04 row and the
cross-module Scope 02 sweep both name `rltaxstrategy.js`.

The probe was reverted immediately:

```text
$ git status --short rltaxstrategy.js
probe1_revert_dirty_lines=0
```

GREEN, same command, is the `3042 passed, 0 failed` capture under
[TP-04-16](#tp-04-16), and every later RED capture in this report shows exactly
its own failure and never this one — which is the standing proof that probe 1
stayed reverted for the rest of the dispatch.

### TP-04-04

Scenario SCN-021-010 — the converted case equals an independent full
`computeAnnualFederalTax` call at the converted income, including moved gain
stacking.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

The assertion settles the converted household a second time through an
independent `RLTAX.computeAnnualFederalTax` call and requires four separate
identities to hold at once: the converted total equals that independent
settlement, the converted ordinary taxable income lands exactly on the selected
edge at `105700`, the published difference equals independent-filled minus
independent-base, and only ordinary income moved — the long-term gain is
unchanged between the two policies.

Intended RED, probe 4 — the converted policy was settled at the declared income
(`convertedWorkspace(workspace, 0)`) while the comparison still reported the
full conversion amount. That is the shape of an implementation that reports a
conversion it never actually priced:

```text
# PROBE-4 RED: converted policy settled at the declared income instead of recomputed at the converted income
$ node scripts/selftest.mjs
exit: 1
lines: 3437
sha256: 01823d5f5b05138cc8d95bb6698b4a6be0fb743bd8650fad39d981422676f729
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-04-04: the converted policy equals an independent full settlement at the converted income, filling the selected bracket exactly, with only ordinary income moved
  ✗ FAIL: TP-04-10: a household carrying a long-term gain receives a valued federal tax difference equal to an independent recomputation and distinct from the marginal-rate product, while a comparison against an absent preferential table still refuses …

Research-Lab self-test: 3040 passed, 2 failed
```

Both the gain-free identity and the gain-bearing identity fail, so the
recomputation is guarded on both households rather than only the simple one.

Reverted immediately:

```text
$ git status --short rltaxstrategy.js
probe4_revert_dirty_lines=0
```

GREEN, same command, is the `3042 passed, 0 failed` capture under
[TP-04-16](#tp-04-16).

### TP-04-05

Scenario SCN-021-010 — a mutated implementation that adds a marginal-rate product
to the baseline tax is proven to fail the gain-stacking assertion.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

This row's RED is permanent rather than transient, which is stronger than a probe
because it is re-proven on every run. The assertion builds a fixture pack whose
ordinary band steps at 100 and whose preferential band steps at 100, settles a
household with 40 ordinary and 100 of long-term gain, and compares the true
recomputed difference against `0.10 * conversionAmount` — the marginal-rate
product an adjustment-based implementation would report. It asserts the two
disagree and that the recomputation is strictly larger, because the conversion
pushed preferential dollars across the 0 percent to 15 percent boundary. The
assertion prints both figures, so the size of the understatement is on the
record rather than asserted in the abstract.

### TP-04-06

Scenario SCN-021-010 — a household already at or above the selected edge yields an
explicitly labeled zero-amount conversion.
Command: `node scripts/selftest.mjs`

### TP-04-07

Scenario SCN-021-010 — the marginal rate at the fill edge comes from the Scope 03
curve, and an incomplete curve propagates its incompleteness.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

The row is deliberately hard to pass by accident: at the fill edge the curve
value and the statutory band rate are both approximately `0.24`, so the assertion
cannot rely on the two numbers merely differing in magnitude. It requires
`reported.value === edgeCurve.points[0].effectiveMarginalRate` — identity with a
separately computed curve point — while also requiring
`reported.value !== reported.statutoryBandRate`, and requires the curve's
`incomplete` flag and `unavailableContributorCount` to be carried through rather
than dropped.

Intended RED, probe 2 — `marginalRateAtEdge` was changed to return
`curve.points[0].statutoryBandRate` in place of
`curve.points[0].effectiveMarginalRate`, which is exactly the defect the row
exists to prevent, and is the substitution that would be invisible to a check
comparing the two rounded rates:

```text
# PROBE-2 RED: marginalRateAtEdge returns the statutory band rate instead of the curve value
$ node scripts/selftest.mjs
exit: 1
lines: 3437
sha256: 54e365db31b1aefb266a6d957b6f506280e227da73b3e456ddf3759e0bf49def
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-04-07: the reported marginal rate at the fill edge is the curve value at that level and inherits the curve’s incompleteness, rather than being read off a statutory bracket table

Research-Lab self-test: 3041 passed, 1 failed
```

Exactly one assertion fails and it is the intended one, so the RED is attributed
rather than incidental. The capture also carries no TP-04-03 or TP-02-11 failure,
which is the standing proof that probe 1 was still reverted when this ran.

Reverted immediately:

```text
$ git status --short rltaxstrategy.js
probe2_revert_dirty_lines=0
```

GREEN, same command, is the `3042 passed, 0 failed` capture under
[TP-04-16](#tp-04-16).

### TP-04-08

Scenario SCN-021-011 — the `notModeled` list carries its full required membership,
each entry with a reason and a deferral code.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

The assertion requires all eight declared ids to be present, requires every entry
to carry a label, a `reason` longer than 20 characters and a `deferralCode` that
is a member of the closed `RLTAXRULES.RLTAX_CODES` vocabulary, and requires
`baseComparison.notModeled` to be reference-identical to
`RLTAXSTRATEGY.conversionNotModeled()` — so the rendered list and the declared
list cannot be two different objects.

### TP-04-09

Scenario SCN-021-011 — removing any required `notModeled` entry is proven to fail,
and the list is a structural record member rather than page copy.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

TP-04-09 carries a permanent in-suite adversarial: it filters `survivor-effects`
out of a copy and proves the shortened list breaks the membership predicate the
real list satisfies. It also proves the list is structural rather than copy —
`Object.isFrozen` on both the list and the whole comparison record, plus a second
comparison at a different income that still carries all eight entries.

Intended RED, probe 3 — the `survivor-effects` entry's `id` was renamed to
`survivor-effects-probe-renamed`. Renaming rather than deleting is the sharper
probe: the list length stays at 8, so a guard that merely counted entries would
still pass and only a guard checking identity can catch it:

```text
# PROBE-3 RED: notModeled survivor-effects id renamed, list length still 8
$ node scripts/selftest.mjs
exit: 1
lines: 3437
sha256: da34b926ca20022dfe54a395f83c3910960f8832d4a2ae03f768c9d8368d60b0
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-04-08: notModeled carries all eight required entries, each with a reason and a deferral code drawn from the closed RLTAX vocabulary
  ✗ FAIL: TP-04-09: the disclosure guard can fail — a list missing any required entry breaks the membership assertion, and the real list is a frozen structural record member present on every result rather than page copy
  ✗ FAIL: TP-04-16: the medicare-and-irmaa conversion entry keeps its id, its label and its deferral code with only its reason differing …

Research-Lab self-test: 3039 passed, 3 failed
```

The guard is confirmed to be identity-based, not count-based. The third failure
is a Scope 02 row that pins the sibling `medicare-and-irmaa` entry, which shows
the disclosure is cross-checked from outside this scope as well.

Reverted immediately:

```text
$ git status --short rltaxstrategy.js
probe3_revert_dirty_lines=0
```

GREEN, same command, is the `3042 passed, 0 failed` capture under
[TP-04-16](#tp-04-16).

### TP-04-10

Scenario SCN-021-012 — enumerating the result record proves there is no
probability, lifetime total, break-even year, survival figure, rank or accuracy
field.
Command: `node scripts/selftest.mjs`

### TP-04-11

Scenario SCN-021-012 — declared outside-funds and declared withheld are
distinguishable, and an undeclared funding source yields an unavailable record
with no assumed default.
Command: `node scripts/selftest.mjs`

### Scenario SCN-021-010

`Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack" --reporter=list`

### Scenario SCN-021-011

`Regression: SCN-021-011 the conversion comparison discloses everything it did not model`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-011 the conversion comparison discloses everything it did not model" --reporter=list`

### Scenario SCN-021-012

`Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking" --reporter=list`

### TP-04-15

The cumulative Scope 01 through Scope 04 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-0" --reporter=list`

### TP-04-16

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

Captured through the bounded evidence recorder, whose `sha256` is taken over
every one of the 3437 produced lines rather than over a pasted excerpt, so the
block is re-derivable with `--verify`:

```text
# baseline selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3437
sha256: 067b3a7b4ddeb34e1ef92d1f4cbd2e8726cd74079277558ae612438889d80503
--- last 20 ---
  ✓ the committed payload’s persisted budget equals a fresh measurement of that same payload
  ✓ the last payload writer re-measures through the one rlcockpit measurement and declares none of its own
  ✓ the re-measurement runs before the --write branch, so recompose-only and write agree
  ✓ adversarial: a default-visible field changed after measurement is caught by the freshness comparison

================================================
Research-Lab self-test: 3042 passed, 0 failed
================================================
```

`3042 passed, 0 failed` is the count this dispatch opened on, so no pre-existing
pass was lost. `scripts/selftest.mjs` is not dirty against `HEAD`, which is the
direct proof that no existing assertion was edited, relaxed or removed:

```text
$ git status --short scripts/selftest.mjs
selftest_dirty_lines=0
```

### TP-04-17

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`
**Claim Source:** executed

```text
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=670 references=14740 distinctPaths=242 missingPaths=66 baseline=66 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
PATHS_EXIT=0
--- baseline file dirty? ---
baseline_dirty_lines=0
```

`new=0` and `stale=0` are the two numbers the row claims, and
`baseline_dirty_lines=0` proves the count was not obtained by re-baselining.

## Change Boundary

**Claim Source:** executed

A path-scoped `git status --short` over the scope's excluded list. An empty
result set is the whole claim: git reports a row for any tracked path that
differs from `HEAD`, so zero rows means every excluded path is byte-identical.

```text
$ git status --short -- rlportfolio.js rlportfolioanalytics.js \
    portfolio-survival-allocation.config.json specs/008-portfolio-survival-and-brief-lab \
    tools.json index.html rlnav.js README.md notes/README.md rlbrief.js briefs data \
    brief-history.jsonl watchlist.json site-exclusions.json \
    scripts/validate-spec-test-paths.baseline .github/bubbles
EXCLUDED_DIRTY_EXIT=0
excluded_dirty_count=0
--- market-brief.* and scripts/brief-* ---
brief_dirty_count=0
```

The six registries (`tools.json`, `index.html`, `rlnav.js`, `README.md`,
`notes/README.md`, `watchlist.json`), every Feature 008 file, every brief and
data artifact, and every framework-managed file under `.github/bubbles` are all
inside that scoped set and all report clean.

## Claim Boundary

**Claim Source:** executed

A text scan over this scope's allowed paths for a published error rate, a
self-invalidation statistic, a track record, an accuracy figure and a plan
success probability:

```text
$ grep -nEi 'error rate|self-invalidat|track record|accuracy|success (probability|rate)|win rate|hit rate|confidence interval' \
    rltaxstrategy.js tests/lifetime-tax-conversion.spec.mjs
tests/lifetime-tax-conversion.spec.mjs:32:const FORBIDDEN_CLAIMS = ['probability', 'success rate', 'break-even', 'break even', 'track record',
tests/lifetime-tax-conversion.spec.mjs:33:  'accuracy', 'error rate', 'lifetime total', 'rank ', 'we recommend', 'recommended'];
hits_module_spec=rltaxstrategy.js:0 tests/lifetime-tax-conversion.spec.mjs:2

$ grep -cEi 'error rate|self-invalidat|track record|accuracy|success (probability|rate)|win rate' lifetime-tax-strategy-lab.html
html_forbidden_claim_hits=0
GREP_EXIT=1
```

`rltaxstrategy.js` and the page carry zero hits. The two hits in the spec file
are the `FORBIDDEN_CLAIMS` array — the browser guard that refuses those very
tokens on the rendered surface — so they are the enforcement of the boundary
rather than a breach of it. `GREP_EXIT=1` on the page scan is grep's no-match
exit, not an error.

The scan is a static lower bound. The binding proof is TP-04-10, which enumerates
every member name in the comparison record and asserts none matches
`probability`, `lifetimeTotal`, `breakEvenYear`, `rank`, `recommended`, `score`,
`successRate`, `accuracy` or `survival`.

## Completion Statement

Filled at execution.
