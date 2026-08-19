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
**Claim Source:** executed

The assertion pins the policy count at two, pins both policy ids, requires both
settlements to carry the identical `packRef.contentSha256` and the identical
resolved pack sha, requires the two settlements to agree on filing status and on
the untouched preferential income, and requires the nine-member `heldConstant`
list plus `isRecommendation === false` and the single-year result-kind statement.

Intended RED, probe A — a third policy `probe-partial-fill` was appended to the
`policies` tuple. That is the natural drift shape for this row: someone adds a
"half fill" option and the two-policy contract silently becomes a three-policy
menu:

```text
# PROBE-A RED: a third policy appended to the policies tuple in rltaxstrategy.js
$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-04-01: the comparison returns exactly two policies, both settled from the identical workspace against the identical resolved pack, with the held-constant list published
Research-Lab self-test: 3063 passed, 2 failed
```

TP-04-01 is the only new failure. The `committed surface carries no personal
identifier` row is a **pre-existing failure owned by a concurrent session** (it
is produced by that session's untracked `notes/us-israel-iran-*` files, outside
this scope's change boundary); it is present identically in the baseline, in
every RED and in every GREEN in this dispatch, so attribution here is by failure
name rather than by count.

Reverted immediately, then the identical command re-run for GREEN:

```text
$ git status --short rltaxstrategy.js
probeA_revert_dirty_lines=0

$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
Research-Lab self-test: 3064 passed, 1 failed
```

TP-04-01 is absent from the GREEN failure list, and the pass count returns to the
baseline 3064.

### TP-04-02

Scenario SCN-021-010 — the conversion amount equals the distance to the named
bracket edge, for every supported filing status and every bracket.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

**A recorded miss, and the strengthening it forced.** The first-draft assertion
built its 24 fixtures with `itemizedAmount: 0`. Under that fixture ordinary
TAXABLE income and declared ordinary income are the same number, so the row could
not distinguish the two. Probe B substituted
`edge.value - workspace.income.ordinary` for
`edge.value - baseline.ordinaryTaxableIncome.value` — measuring the fill from
declared income rather than from taxable income, which is the exact defect this
row exists to catch — and the suite stayed at the baseline
`3064 passed, 1 failed` with **no TP-04-02 failure**. That false GREEN is
recorded here rather than accepted.

The fixture was strengthened to a non-zero `itemizedAmount: 4000`, which
separates taxable income from declared income, plus a `taxableIsSeparated === 24`
clause so the fixture cannot silently degrade back to equality on some future
edit. No clause was removed or relaxed. The strengthened row is green on clean
source at `3064 passed, 1 failed`.

Probe B was then re-applied against the strengthened row:

```text
# PROBE-B RED: fill measured from declared ordinary income instead of ordinary TAXABLE income
$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-04-02: the conversion amount equals the distance from ordinary TAXABLE income (separated from declared income by a non-zero deduction on all 24 bounded bands) to the named pack edge, and an unbound…
Research-Lab self-test: 3063 passed, 2 failed
```

TP-04-02 is the only new failure. Reverted immediately, then the identical
command re-run for GREEN:

```text
$ git status --short rltaxstrategy.js
probeB_revert_dirty_lines=0

$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
Research-Lab self-test: 3064 passed, 1 failed
```

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
**Claim Source:** executed

The assertion drives three households against the same edge `b3`: one well above
it at 200000, one landing exactly on it at 105700, and the base household below
it. It requires the two full households to report `value === 0` with
`atOrAboveEdge === true` and explicitly `!isUnavailable(...)`, requires the
above-edge federal difference to be a valued zero rather than a refusal, and
requires the below-edge household to report a positive amount with
`atOrAboveEdge === false` — so a constant zero cannot satisfy the row either.

Intended RED, probe C — the at-or-above-edge clamp was removed
(`value: distance` in place of `value: atOrAboveEdge ? 0 : distance`), which is
the defect where a full bracket reports a *negative* conversion:

```text
# PROBE-C RED: at-or-above-edge clamp removed from fillToBracketConversion
$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-04-02: the conversion amount equals the distance from ordinary TAXABLE income (separated from declared income by a non-zero deduction on all 24 bounded bands) to the named pack edge, and an unbound…
  ✗ FAIL: TP-04-06: a household at or above the selected edge receives an explicitly labelled zero-amount conversion rather than a negative amount or an Unavailable
Research-Lab self-test: 3062 passed, 3 failed
```

TP-04-06 is the intended catch. TP-04-02 co-fails because its `expected` is
itself `Math.max(0, …)`, so it also refuses a negative amount — a second,
independent detector for the same defect rather than an unrelated break.

Reverted immediately, then the identical command re-run for GREEN:

```text
$ git status --short rltaxstrategy.js
probeC_revert_dirty_lines=0

$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
Research-Lab self-test: 3064 passed, 1 failed
```

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
**Claim Source:** executed

The assertion flattens the whole comparison record recursively, collects all 1092
member names at every depth, and requires none of them to contain `probability`,
`lifetimeTotal`, `breakEvenYear`, `rank`, `recommended`, `score`, `successRate`,
`accuracy` or `survival` as a case-insensitive substring. It also pins the
top-level key set to an exact ordered 13-member list, so a forbidden member
cannot be introduced at the top level even under a token the substring list has
not anticipated.

Intended RED, probe D — a `breakEvenYear: null` member was added to the returned
record. It carries no value and changes no arithmetic, so only a member-name
enumeration can see it, which is precisely the claim this row makes:

```text
# PROBE-D RED: breakEvenYear member added to the comparison record in rltaxstrategy.js
$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-04-10: enumerating all 1092 member names in the comparison record proves it carries no probability, lifetime total, break-even year, rank, score or accuracy member
  ✗ FAIL: TP-05-06: no page or strategy string claims a published error rate, a self-invalidation statistic, a track record, an accuracy figure or a plan success probability, and the educational not-tax-advice …
Research-Lab self-test: 3064 passed, 3 failed
```

Two independent detectors catch it: the Scope 04 member enumeration and the
Scope 05 cross-surface claim scan. A one-word member added to a frozen record is
not survivable in either place.

Reverted immediately, then the identical command re-run for GREEN:

```text
$ git status --short rltaxstrategy.js
probeD_revert_dirty_lines=0

$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
Research-Lab self-test: 3066 passed, 1 failed
```

The GREEN pass count is 3066 rather than the 3064 of the earlier GREENs because a
**concurrent session added two passing assertions of its own during this
dispatch**; `rltaxstrategy.js` is clean against `HEAD` across the whole probe, so
none of that movement is this scope's. It is a further reason attribution in this
report is by failure name rather than by count.

### TP-04-11

Scenario SCN-021-012 — declared outside-funds and declared withheld are
distinguishable, and an undeclared funding source yields an unavailable record
with no assumed default.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

The assertion settles the same household three ways. It requires the two declared
cases to report their own declaration and to differ from each other, requires the
undeclared case to be an `isUnavailable` record carrying
`TaxUnavailable/v1` and the `RLTAX-INPUT-INCOMPLETE` code, requires its
`whatWouldMakeItAvailable` to actually name `outside-funds` rather than being an
empty gesture, and requires the federal difference to be reported anyway — the
refusal is scoped to the funding field and does not suppress the arithmetic that
does not depend on it.

Intended RED, probe E — the refusal was replaced with a silent
`return "outside-funds";`. That is the assumed default the row exists to forbid,
and it is invisible in every rendered figure because the two cases produce the
same single-year federal difference:

```text
# PROBE-E RED: undeclared funding source silently defaulted to outside-funds
$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-04-11: declared outside-funds and declared withheld are distinguishable, and an undeclared funding source is a TaxUnavailable naming what would make it available rather than an assumed default
Research-Lab self-test: 3065 passed, 2 failed
```

TP-04-11 is the only new failure. Reverted immediately, then the identical
command re-run for GREEN:

```text
$ git status --short rltaxstrategy.js
probeE_revert_dirty_lines=0

$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
Research-Lab self-test: 3066 passed, 1 failed
```

### Scenario SCN-021-010

`Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack" --reporter=list`
**Claim Source:** executed

Environment gates first — these do not replace the row:
`node scripts/validate-node-source-lock.mjs` reported
`OK adversarial=16 unexpectedAcceptances=0` at exit 0, and
`npx --no-install playwright --version` reported `Version 1.61.1`.

Intended RED, probe F — the page's policy loop was started at `index = 1`, which
renders the converted policy but drops the no-conversion baseline. The comparison
record is untouched; only the rendered table loses a row, which is exactly the
"a rendering change quietly turns a comparison into a single figure" defect this
browser row guards:

```text
# PROBE-F RED: policy render loop started at index 1 in lifetime-tax-strategy-lab.html
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack" --reporter=list
  ✘  1 [system-chrome] › tests/lifetime-tax-conversion.spec.mjs:35:1 › Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack (6.0s)
    Error: expect(locator).toHaveCount(expected) failed
    Expected: 2
    Received: 1
        14 × locator resolved to 1 element
  1 failed
```

The failure is the intended contract assertion — the two-policy count — with the
observed value named, not a syntax error, a missing browser or an absent test
discovery.

Reverted immediately, then the identical command re-run for GREEN:

```text
$ git status --short lifetime-tax-strategy-lab.html
probeF_revert_dirty_lines=0

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack" --reporter=list
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/lifetime-tax-conversion.spec.mjs:35:1 › Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack (1.0s)
  1 passed (3.0s)
```

### Scenario SCN-021-011

`Regression: SCN-021-011 the conversion comparison discloses everything it did not model`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-011 the conversion comparison discloses everything it did not model" --reporter=list`
**Claim Source:** executed

Intended RED, probe G — the page's disclosure render loop was shortened by one
(`index < notModeled.length - 1`), so the last declared entry is silently not
rendered. The declaration in `RLTAXSTRATEGY` is untouched, which is what makes
this the right probe: the row's promise is that the RENDERED list matches the
DECLARED list, and a truncating render is the only way that promise breaks
without the module changing:

```text
# PROBE-G RED: disclosure render loop shortened by one in lifetime-tax-strategy-lab.html
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-011 the conversion comparison discloses everything it did not model" --reporter=list
  ✘  1 [system-chrome] › tests/lifetime-tax-conversion.spec.mjs:73:1 › Regression: SCN-021-011 the conversion comparison discloses everything it did not model (6.1s)
    Error: expect(locator).toHaveCount(expected) failed
    Expected: 8
    Received: 7
  1 failed
```

The expectation is derived from `conversionNotModeled()` rather than hand-counted,
so the `8` in the failure text is the declaration's own length — the row caught a
divergence between declaration and rendering, not a stale literal.

Reverted immediately, then the identical command re-run for GREEN:

```text
$ git status --short lifetime-tax-strategy-lab.html
probeG_revert_dirty_lines=0

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-011 the conversion comparison discloses everything it did not model" --reporter=list
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/lifetime-tax-conversion.spec.mjs:73:1 › Regression: SCN-021-011 the conversion comparison discloses everything it did not model (1.5s)
  1 passed (3.6s)
```

### Scenario SCN-021-012

`Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking" --reporter=list`
**Claim Source:** executed

Intended RED, probe H — the page's funding-source line was changed to print a
flat `outside-funds` whenever the record is unavailable. The record itself still
refuses correctly, so this is the rendering-layer half of the same defect probe E
proved at the module layer: a reader is told a funding source they never
declared, and nothing in the module can detect it:

```text
# PROBE-H RED: undeclared funding source rendered as an assumed outside-funds in lifetime-tax-strategy-lab.html
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking" --reporter=list
  ✘  1 [system-chrome] › tests/lifetime-tax-conversion.spec.mjs:154:1 › Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking (6.1s)
    Error: expect(locator).toContainText(expected) failed
    Expected substring: "RLTAX-INPUT-INCOMPLETE"
    Received string:    "Conversion tax funding source: outside-funds."
  1 failed
```

The received string is the invented default itself, so the row caught the exact
substitution rather than failing for an unrelated reason.

Reverted immediately, then the identical command re-run for GREEN:

```text
$ git status --short lifetime-tax-strategy-lab.html
probeH_revert_dirty_lines=0

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking" --reporter=list
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/lifetime-tax-conversion.spec.mjs:154:1 › Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking (929ms)
  1 passed (2.6s)
```

### TP-04-15

The cumulative Scope 01 through Scope 04 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-0" --reporter=list`
**Claim Source:** executed

Executed with the **cumulative feature selector** `--grep "SCN-02[1-4]"` rather
than the narrower `SCN-021-0` written into the Test Plan. The broader selector is
a superset: it runs every SCN-021 scenario the row names and additionally runs
the SCN-022, SCN-023 and SCN-024 scenarios that later scopes layered onto the
same route and the same modules. The bare `SCN-02` form was deliberately avoided
because it would also sweep a concurrent session's SCN-025 and SCN-026 suites and
make any failure unattributable.

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list
  ✓  66 [system-chrome] › tests/lifetime-tax-retirement-route.spec.mjs:340:1 › Regression: SCN-024-015 a focused control survives a mode switch without being detached and a subsequent click registers (807ms)
  ✓  67 [system-chrome] › tests/lifetime-tax-use.spec.mjs:231:1 › Regression: SCN-023-012 the under-threshold exception excludes the income and deducts no rental expense (960ms)
  ✓  68 [system-chrome] › tests/lifetime-tax-retirement-route.spec.mjs:370:1 › Regression: SCN-024-014 the request ledger stays empty with three new packs loaded and no retirement declaration reaches a URL (795ms)
  ✓  69 [system-chrome] › tests/lifetime-tax-use.spec.mjs:265:1 › Regression: SCN-023-013 mixed use allocates by declared days and the personal portion reaches the composition (845ms)
Error: worker-5 process did not exit within 300000ms after stop, force-killed it

  69 passed (5.4m)
  1 error was not a part of any test, see above for details
```

`69 passed` with **zero failed**. The reported error is a Playwright worker
teardown timeout after the run stopped — it is explicitly reported as "not a part
of any test", it names no assertion and no scenario, and every one of the 69
tests carries a `✓`. It is recorded verbatim here rather than filtered out,
because suppressing it would be the same class of omission this report exists to
prevent.

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
