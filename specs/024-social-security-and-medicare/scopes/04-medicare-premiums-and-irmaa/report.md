# Scope 4 Execution Report — Medicare Premiums And The Income-Related Adjustment

This file is the evidence surface for scope 4. It was created during planning as a
structural template and is filled from execution only. Nothing here may be written
from expectation, inference or summary. Every anchor below holds raw, unfiltered
terminal output with its exit code, recorded in the session that produced it.

## Summary

This scope is **substantially delivered**. The engine, the contracts, the sourced
pack and the page surfaces were landed by an earlier interrupted dispatch. A
second dispatch verified the pack against its primary source, authored the
selftest group and the browser spec, and closed two positional-fragility
supersessions plus one orphaned marker. This third dispatch closed the remaining
verification and integration work.

Delivered and observed passing: `rltaxmedicare.js`, `tax-rules/medicare/2026.json`,
`LookbackMagi/v1`, `AdjustmentBracket/v1`, `PremiumRecord/v1`, the lookback-year
offset check, stage `CO-22`, three `includedInTotal: false` cost legs, the annual
Medicare cost, the removal of `'irmaa-bands'` from `unsupportedFeatures[]`, the
`medicare-and-irmaa` reason correction and its new pin, the `power-medicare`
section, the `lifetime-tax — medicare premiums and the income-related adjustment`
selftest group and `tests/lifetime-tax-medicare.spec.mjs` (5 browser rows).

**One real defect was found and fixed by this dispatch.** The page surfaced the
three premium legs on the export record only. It never pushed them into the
comparison table, the curve contributor table, or the headline as per-leg hosts,
so FR-024-028 and NFR-024-006 were unmet on three of the four surfaces the feature
names. The row builder was extracted from `renderLegVisibility` as a pure function
and now derives its premium rows by walking the legs the stage published; the
headline gained a per-leg host derived the same way. TP-04-18, TP-04-19 and the new
browser row TP-04-27 were each observed failing before the fix and passing after it,
on the identical commands.

Medicare premiums are **not** part of the federal tax total, and no premium had
leaked into it. TP-04-14 asserts that consequence directly against three fixtures
spanning the prior features' shapes.

Not delivered: TP-04-29 as its own `--grep "SCN-02"` command. Two Definition of
Done rows stay `[ ]` with their reasons stated in
[scope.md](scope.md#definition-of-done).

## Completion Statement

This scope is **not complete**. Seventeen of the nineteen Definition of Done rows
are checked, each against raw output of the exact command the Test Plan names. The
remaining two stay `[ ]` and carry their reason in `scope.md`:

- **Every excluded path byte-identical.** `tests/lifetime-tax-route.spec.mjs` is on
  the excluded list and was modified by the second dispatch to deliver SUP-024-11.
  That is a ledgered ASC-8 admission, not an undeclared edit, but the row as written
  is false. Correcting it is a planning-artifact change owned by `bubbles.plan`.
- **Per-row intended RED for every Test Plan row.** Five rows carry an observed
  RED from this session on the identical command that later shows green. The rest
  do not, and TP-04-29 was not run as its own command.

The repository gates were all observed green at the end of this session:

```
$ node scripts/selftest.mjs
Research-Lab self-test: 2812 passed, 0 failed
SELFTEST_EXIT=0

$ npx --no-install playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line
  56 passed (17.8s)
PW_EXIT=0

$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":9,"rootFiles":118,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
PAGES_EXIT=0

$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=620 references=13710 distinctPaths=235 missingPaths=71 baseline=77 new=0 stale=6
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
PATHS_EXIT=0
```

The pre-existing pass count did not fall. The suite stood at `2786 passed, 0 failed`
before the second dispatch, `2805 passed, 0 failed` before this one, and
`2812 passed, 0 failed` at the end of it. The browser suite rose from 55 to 56
passing rows. No pre-existing assertion was removed or weakened outside the
ledgered supersessions; every change to an existing assertion in this session added
clauses to it.


## Sourcing

`BI-10` and `BI-11` were closed against a primary source **retrieved in this
session**, and every transcribed figure was verified digit by digit against the
retrieved page.

| Field | Value |
| --- | --- |
| Source title | Premiums: Rules for Higher-Income Beneficiaries |
| URL | `https://www.ssa.gov/benefits/medicare/medicare-premiums.html` |
| Publisher | Social Security Administration |
| `documentKind` | departmental-publication |
| `retrievalOutcome` | retrieved |
| `retrievedAt` | 2026-08-18T10:26:45.000Z |
| Edition evidence | The page dates its own figures: the table heading reads `Monthly Medicare Premiums for 2026`, the first data cell reads `2026 standard premium = $202.90`, and the lookback paragraph opens `To determine your 2026 income-related monthly adjustment amounts`. No figure is carried across an edition year and no `yearInvarianceBasis` is claimed for any of them. |

**Verified digit by digit — individual return** (locator: `Monthly Medicare
Premiums for 2026`, first table). Every boundary, Part B adjustment and Part D
adjustment below was read off the retrieved page and compared against the pack:

| Row | MAGI range as the page states it | Part B | Part D |
| --- | --- | --- | --- |
| 0 | less than or equal to $109,000 | 2026 standard premium = $202.90 | Your plan premium |
| 1 | above $109,000 up to $137,000 | Standard premium + $81.20 | Your plan premium + $14.50 |
| 2 | above $137,000 up to $171,000 | Standard premium + $202.90 | Your plan premium + $37.50 |
| 3 | above $171,000 up to $205,000 | Standard premium + $324.60 | Your plan premium + $60.40 |
| 4 | above $205,000 and less than $500,000 | Standard premium + $446.30 | Your plan premium + $83.30 |
| 5 | equal to or above $500,000 | Standard premium + $487.00 | Your plan premium + $91.00 |

**Joint return**, same table, second income column: `$218,000 or less`, `above
$218,000 up to $274,000`, `above $274,000 up to $342,000`, `above $342,000 up to
$410,000`, `above $410,000 and less than $750,000`, `equal to or above $750,000`,
carrying the same six Part B and Part D amounts. All twelve boundaries and all ten
adjustment amounts match the pack exactly.

**Married filing separately**, second table: `less than or equal to $109,000`;
`above $109,000 and less than $391,000` → `+$446.30` / `+$83.30`; `equal to or
above $391,000` → `+$487.90` / `+$91.00`. Note the top-bracket Part B amount is
**$487.90** in this table and **$487.00** in the first, a genuine difference
between the two tables on the same page. The pack carries both, unreconciled,
because reconciling them would be substituting a judgement for the publication.

**Declared lookback offset — recorded by name.** The page states: `To determine
your 2026 income-related monthly adjustment amounts, we use your most recent
federal tax return the IRS provides to us. Generally, this information is from a
tax return filed in 2025 for tax year 2024.` Premium year 2026 minus tax year 2024
is an offset of **2 years**, transcribed with that quotation as its
`quotedOffsetBasis`. The offset is a pack member, never a module constant, proven
by TP-04-05.

### `AbsentFigure/v1` — what is NOT sourced

**The standard Part D premium.** It ships as an `AbsentFigure/v1` with code
`RLTAX-THRESHOLD-UNAVAILABLE`, domain `medicare-standard-premium:part-d`, a reason,
a remediation and a `missingSource` pointer, and with **no numeric member beside
it** that could be read as a zero. The reason is that neither retrieved publication
states one: the Social Security page prints the words `Your plan premium` in the
Part D column of every row rather than a figure, and the Medicare.gov costs page
states `Varies by plan. You may have to pay more, depending on your income.` The
Part D base beneficiary premium the adjustment is legally tied to is published by
the Centers for Medicare & Medicaid Services and was not retrieved.

The consequence is recorded rather than worked around: on the shipped pack the
Part D premium leg refuses and the annual Medicare cost is **withheld entirely**
rather than totalled over the two parts that did resolve. That is the behaviour
TP-04-09 asserts, and it is why the Simple view carries a Medicare refusal — the
refusal that displaced the positional probe SUP-024-11 replaces.

**Filing statuses.** Every status the pack maps carries a quoted basis from the
page. A status the publication does not enumerate refuses in its own words that an
adjacent status's amounts are not borrowed for it, asserted by TP-04-08.

**IRMAA is modelled as a genuine step function.** `resolveAdjustmentBracket`
selects the last bracket whose sourced lower-bound comparison holds, using the
pack's own `boundaryOperator` per row. Nothing is interpolated, averaged or
smoothed across a boundary. TP-04-06 asserts placement below, exactly at and above
each boundary of a fixture whose two rows carry **opposite** operators, so one
recalled convention cannot satisfy both.

## Reason Correction

**Delivered.** The `medicare-and-irmaa` entry in `rltaxstrategy.js` keeps its `id`,
its `label` and its `deferralCode`; only the `reason` differs.

- **Before:** the reason stated that the pack declares no band.
- **After:** `The pack now declares the adjustment bands, but IRMAA uses a two-year
  income lookback and this model computes no future year, so the premium a
  conversion made this year would change lands two premium years away and is not
  priced here.`

The entry stays because a conversion's effect on the adjustment genuinely does land
two premium years later and this feature computes no future year. Only the clause
that became false was corrected.

**Verified.** TP-04-16 pins the corrected reason against the pack's declared
brackets. A predicate reads the shipped pack's own bracket sets and requires at
least two brackets carrying a numeric lower bound in every set; the corrected
reason is asserted to claim exactly that, and to no longer claim the opposite. The
pin is proven capable of failing: the same predicate over a pack whose bracket sets
are emptied returns false. The entry's id, label and deferral code are asserted
unchanged, and the disclosure's membership and count of eight are asserted in the
same row. Evidence: [TP-04-16](#tp-04-16).

## Supersession Ledger

**SUP-024-06** and **SUP-024-07** carry their markers in `scripts/selftest.mjs` and
their ledger rows in [`spec.md`](../../spec.md#supersession-ledger). Both were
delivered by the earlier dispatch. This session re-derived both causes
independently in TP-04-22's second arm rather than taking them on trust from the
sites that carry them, and proved SUP-024-07's replacement fires on both sides of
the move. The derivation and its result are recorded at [TP-04-22](#tp-04-22).

Three entries were reconciled or admitted in this session, each with all four count
surfaces moved in the same change.

### SUP-024-10 — an orphaned marker, closed

A `SUP-024-10` marker existed in `scripts/selftest.mjs` with **no ledger row**. That
is an incomplete ASC-8 admission rather than a permitted one: the marker moved but
the four count surfaces did not. The row was written and the counts corrected in
the same change as the two entries below. Superseded clause: the `surgicalRemoval`
pair's clause naming `'irmaa-bands'` as an id the shipped pack still carries as not
modelled.

### SUP-024-11 — the routed finding

- **Superseded, verbatim:** `await unavailable.first().focus(); await
  expect(unavailable.first()).toBeFocused();` in `tests/lifetime-tax-route.spec.mjs`.
- **Cause:** this scope renders an unavailable annual Medicare cost into
  `#annualMedicareCostCard`, which sits inside `<section id="simple">`. That node
  becomes first in **document** order. The spec reaches this clause with Power
  open, so `.first()` resolved to a node hidden in the active view, `focus()` was a
  silent no-op and `toBeFocused()` failed.
- **Product decision:** the Simple-view Medicare refusal **stays**. An unavailable
  Medicare cost is decision-level information a Simple user must see, not a
  drill-down detail. Nothing was deleted, hidden or demoted to satisfy the probe.
- **Replacement, shape=strengthen:** a view-aware sweep. Every **visible**
  unavailable node is swept in Power and then in Simple; each must carry its code,
  its domain, its reason and its remediation, and each is **focused and read back**
  rather than inspected for a `tabindex` attribute. A non-zero visible count is
  asserted in each view, so a sweep over an empty set cannot pass.
- **Order-independence:** the replacement never names a position. It assumes
  nothing about which node is first.
- **Adversarial case, executed.** Rendering the unavailable node `inert` while
  leaving its `tabindex="0"` in place passes the retained attribute clause — which
  only reads the attribute — and fails the replacement by name:

```
    Error: Power visible unavailable node 0 (RLTAX-INPUT-INCOMPLETE) is keyboard focusable
    expect(locator).toBeFocused() failed
      - Power visible unavailable node 0 (RLTAX-INPUT-INCOMPLETE) is keyboard focusable with timeout 5000ms
    > 240 |       await expect(node, `${where} is keyboard focusable`).toBeFocused();
  1 failed
PW_EXIT=1
```

  The mutation was reverted and the row observed green:

```
$ npx playwright test tests/lifetime-tax-route.spec.mjs --project=system-chrome --reporter=line
  4 passed (3.5s)
PW_EXIT=0
```

### SUP-024-12 — latent positional fragility in the selftest

- **Superseded, verbatim:** `/"inputClaimAgeComparisonAges", "inputMortalityColumn"\]/`
  in TP-03-19. The trailing `]` required that pair to **terminate**
  `DECLARATION_INPUTS`, so it asserted an ordering nobody intended and broke the
  first time a control was appended.
- **Replacement, shape=derive:** extract the `DECLARATION_INPUTS` block and assert
  each watched id is present within it by membership — the form its own sibling
  TP-01-19 already uses. It still requires **every** watched id to be registered.
- **Adversarial case A, executed — a removed watched id must fail.** Removing
  `"inputMortalityColumn"` from the list:

```
  ✗ FAIL: TP-03-19: the claim-age renderer reads only members the stage publishes on both its available and unavailable shapes, is wired into renderPower, routes its two new controls through the declaration-signature no-op guard, and renders every displayed figure through the tooltip-bearing constructor
Research-Lab self-test: 2785 passed, 1 failed
SELFTEST_EXIT=1
```

- **Adversarial case B, executed — an appended control must still pass.** Appending
  a further id after the pair, which is the exact break the superseded anchor
  suffered:

```
  ✓ TP-03-19: the claim-age renderer reads only members the stage publishes on both its available and unavailable shapes, is wired into renderPower, routes its two new controls through the declaration-signature no-op guard, and renders every displayed figure through the tooltip-bearing constructor
Research-Lab self-test: 2786 passed, 0 failed
SELFTEST_EXIT=0
--- would the SUPERSEDED regex still match after an append?
0
```

  The superseded regex matched the page **zero** times in that state and would
  therefore have failed. Both mutations were reverted.

### Counts, after this session

Twelve ledger rows, twelve distinct markers in the tree, the two sets equal in both
directions, asserted mechanically by TP-04-22:

```
--- ledger row count
12
--- distinct markers in tree
SUP-024-01 SUP-024-02 SUP-024-03 SUP-024-04 SUP-024-05 SUP-024-06 SUP-024-07 SUP-024-08 SUP-024-09 SUP-024-10 SUP-024-11 SUP-024-12
```

Two determinations remain findings rather than entries: the `medicare-and-irmaa`
entry is corrected rather than superseded, and the `L4` reconciliation identity is
unchanged and is not superseded — its exclusion clause simply becomes non-vacuous,
which TP-04-12 asserts rather than assumes.


No ASC-8 in-flight admission has been made. If one is made, it is recorded here at
the moment of admission, together with the same-change updates to all four
surfaces.

## Change Boundary

This session opened three files, all of them on the allowed list:
`lifetime-tax-strategy-lab.html`, `scripts/selftest.mjs` and this scope's own new
`tests/lifetime-tax-medicare.spec.mjs`. Every other path was left untouched, which
the modification times record:

```
=== excluded prior tax-computing modules, packs and registration surfaces
2026-08-14T13:30 rlportfolio.js
2026-08-14T13:30 rlportfolioanalytics.js
2026-08-18T00:49 rltaxsocialsecurity.js
2026-08-18T08:24 rltaxinclusion.js
2026-08-18T08:24 rltaxclaimage.js
2026-08-17T18:26 rltaxstate.js
2026-08-17T18:26 rltaxcombined.js
2026-08-17T21:06 rltaxproperty.js
2026-08-17T22:09 rltaxrental.js
2026-08-17T22:22 rltaxuse.js
2026-08-17T23:27 rltaxdisposition.js
2026-08-17T06:34 tools.json
2026-08-17T06:34 index.html
2026-08-17T06:34 rlnav.js
2026-08-17T10:07 README.md
2026-08-17T10:07 notes/README.md
2026-08-18T00:09 site-exclusions.json
2026-08-14T15:14 scripts/build-pages-site.mjs

=== files this session opened
2026-08-18T09:20 lifetime-tax-strategy-lab.html
2026-08-18T09:18 scripts/selftest.mjs
2026-08-18T09:20 tests/lifetime-tax-medicare.spec.mjs

=== every other lifetime-tax browser spec
2026-08-18T01:18 tests/lifetime-tax-benefit.spec.mjs
2026-08-18T08:24 tests/lifetime-tax-claim-age.spec.mjs
2026-08-17T21:06 tests/lifetime-tax-conversion.spec.mjs
2026-08-17T21:23 tests/lifetime-tax-deduction.spec.mjs
2026-08-17T23:27 tests/lifetime-tax-disposition.spec.mjs
2026-08-17T18:26 tests/lifetime-tax-federal.spec.mjs
2026-08-18T01:18 tests/lifetime-tax-foundation.spec.mjs
2026-08-18T08:24 tests/lifetime-tax-inclusion.spec.mjs
2026-08-18T08:24 tests/lifetime-tax-marginal.spec.mjs
2026-08-18T01:18 tests/lifetime-tax-property.spec.mjs
2026-08-17T22:34 tests/lifetime-tax-rental.spec.mjs
2026-08-18T08:56 tests/lifetime-tax-route.spec.mjs
2026-08-17T22:34 tests/lifetime-tax-use.spec.mjs
2026-08-18T01:18 tests/lifetime-tax.support.mjs

=== session start was after 09:00; now
2026-08-18T09:23
```

No prior tax-computing module, no prior pack family, no registration surface and
no Feature 008 artifact was opened. Pricing a premium touched nothing that
computes a tax, and TP-04-14 asserts that consequence directly rather than
inferring it from the file list: with no lookback declared, three fixtures
spanning the prior features' shapes reproduce their exact prior leg sets, their
exact prior totals and every other settled member byte for byte.

**The row as written is still false, and stays `[ ]`.**
`tests/lifetime-tax-route.spec.mjs` is named on the excluded list and was
modified at `08:56`, by the earlier dispatch, to deliver SUP-024-11. That is a
ledgered ASC-8 admission recorded across all four surfaces, not an undeclared
edit — but the row claims every excluded path is byte-identical, and that claim
does not hold. Correcting the row, or moving that file off the excluded list with
its admission named, is a planning-artifact change owned by `bubbles.plan`. This
session did not make it.

`rltaxstrategy.js` is the one prior-feature module this scope opens, for exactly
one string. Its diff is recorded in [Reason Correction](#reason-correction) and is
asserted to touch nothing else in the file. It was not opened in this session.

## Claim Boundary

Green. `TP-04-CLAIM` runs over the composed premium legs, the annual cost and the
shipped refusal. None states a probability, a plan success figure, a future-year
premium or bracket, a track record or an error rate, and no premium is presented
as an estimate or a typical amount. The detector is proven to fire on the sentence
`our estimate of the typical premium`, and the pack is asserted to declare no
`effectiveTaxYears` entry beyond the year it was retrieved for. The row is green in
the `2812 passed, 0 failed` run.

## Scenario Evidence

### Scenario SCN-024-010

Not executed. Holds the browser row output for TP-04-24 and the unit evidence for
the structural independence and the lookback-year check.

### Scenario SCN-024-011

Not executed. Holds the browser row output for TP-04-25 and the unit evidence for
the exact bracket boundaries and the two part adjustments.

### Scenario SCN-024-012

Not executed. Holds the browser row output for TP-04-26 and the unit evidence for
the cost legs, the `L4` vacuity repair and the exclusion from `totalFederalTax`.

## Test Evidence

Every row below records the exact command named for it in
[scope.md](scope.md#test-plan), its exit code and its raw result. Where an
intended-RED was observed in this session it is recorded above the green from the
identical command. Where it was not, the row says so rather than implying one.

### Session commands, verbatim

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 2812 passed, 0 failed
================================================
exit=0
```

```
$ npx --no-install playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line
  56 passed (17.8s)
exit=0
```

```
$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":9,"rootFiles":118,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
exit=0
```

```
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=620 references=13710 distinctPaths=235 missingPaths=71 baseline=77 new=0 stale=6
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
exit=0
```

The pre-existing pass count did not fall. It rose from `2805 passed, 0 failed` at
session start to `2812 passed, 0 failed`, and the browser suite rose from 55 to
56 passing rows.

### The three intended-RED runs, verbatim

**RED 1 — the newly authored total-level rows, before the settlement-level
clauses were correct.** Same command, `node scripts/selftest.mjs`:

```
================================================
Research-Lab self-test: 2809 passed, 3 failed
================================================
  ✗ FAIL: TP-04-13: flipping each premium leg to includedInTotal true in turn is carried through …
  ✗ FAIL: TP-04-19: removing each of the three premium legs from each of the four surfaces in turn …
  ✗ FAIL: TP-04-22 (second arm): SUP-024-06’s superseded clause is re-derived here …
exit=1
```

The diagnostic showed `identityState: "not-evaluable"` for all three flips. The
cause was real and is recorded in [Change Boundary](#change-boundary): when the
reconciliation breaks, `computeAnnualFederalTax` replaces `totalFederalTax` with
the refusal, so a re-derived reconciliation reads that refusal back and reports
the identity as merely not-evaluable — hiding the break it exists to expose. The
assertion now reads the reconciliation the settlement itself published, which is
a stronger claim: each flip breaks `L4` **and** drives the settlement to refuse
its own total.

**RED 2 — the leg-visibility rows, with the premium rows withheld from the
comparison and curve surfaces.** Same command, `node scripts/selftest.mjs`:

```
================================================
Research-Lab self-test: 2810 passed, 2 failed
================================================
  ✗ FAIL: TP-04-18: against the all-non-zero fixture the settled record’s declared leg set equals …
  ✗ FAIL: TP-04-19: removing each of the three premium legs from each of the four surfaces in turn …
exit=1
```

**RED 3 — the browser leg-visibility row, same withholding.** Same command that
later shows green:

```
$ npx --no-install playwright test tests/lifetime-tax-medicare.spec.mjs --project=system-chrome --grep "all three premium legs reach the headline, the comparison, the curve and the export" --reporter=line

    Error: leg medicare-part-b-premium missing from the comparison surface
    expect(received).toContain(expected) // indexOf
    Expected value: "medicare-part-b-premium"
    Received array: ["ordinary", "preferential", "net-investment-income-tax", "additional-medicare-tax"]
  1 failed
exit=1
```

The failure names the leg and the surface, which is exactly what the row exists
to produce. Restoring the row builder returns `5 passed`, exit 0, on the
identical command.

### Per-row results

| Row | Command | Result | Intended RED recorded |
| --- | --- | --- | --- |
| TP-04-01 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-02 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-03 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-04 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-05 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-06 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-07 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-08 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-09 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-10 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-11 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-12 | `node scripts/selftest.mjs` | green, strengthened this session | partial — the settlement-level clause was added in RED 1's run and passed on first execution |
| TP-04-13 | `node scripts/selftest.mjs` | green, strengthened this session | **yes — RED 1** |
| TP-04-14 | `node scripts/selftest.mjs` | green, authored this session | no — passed on first execution |
| TP-04-15 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-16 | `node scripts/selftest.mjs` | green, authored this session | no — passed on first execution |
| TP-04-17 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-18 | `node scripts/selftest.mjs` | green, authored this session | **yes — RED 2** |
| TP-04-19 | `node scripts/selftest.mjs` | green, authored this session | **yes — RED 1 and RED 2** |
| TP-04-20 | `node scripts/selftest.mjs` | green | no — delivered by an earlier dispatch |
| TP-04-21 | `node scripts/selftest.mjs` | green, authored this session | no — passed on first execution |
| TP-04-22 | `node scripts/selftest.mjs` | green, second arm authored this session | **yes — RED 1** |
| TP-04-23 | `node scripts/selftest.mjs` | green, second arm authored this session | no — passed on first execution |
| TP-04-24 | the scope.md grep command | green within the 56-row browser suite | no — delivered by an earlier dispatch |
| TP-04-25 | the scope.md grep command | green within the 56-row browser suite | no — delivered by an earlier dispatch |
| TP-04-26 | the scope.md grep command | green within the 56-row browser suite | no — delivered by an earlier dispatch |
| TP-04-27 | the scope.md grep command | green, authored this session | **yes — RED 3** |
| TP-04-28 | the scope.md grep command | green within the 56-row browser suite | no — delivered by an earlier dispatch |
| TP-04-29 | `npx … --grep "SCN-02"` | **not run as its own command.** The cumulative `tests/lifetime-tax-*.spec.mjs` run over the same route is green at 56 passed, which covers the same rows but is not the command the row names. |
| TP-04-30 | `node scripts/selftest.mjs` | green, `2812 passed, 0 failed`, no fall in pass count | not applicable — a gate row |
| TP-04-31 | `node scripts/validate-spec-test-paths.mjs` | green, `new=0` | not applicable — a gate row |
| TP-04-32 | `node scripts/build-pages-site.mjs --dry-run` | green, exit 0, `site-exclusions.json` not opened this session | not applicable — a gate row |

### TP-04-12

Green. The clause the DoD row named — `totalFederalTax` differs from the sum
over every declared leg by exactly the annual Medicare cost — is now asserted
against a real settlement rather than against the medicare leg set alone. The
settlement is built twice from the identical workspace and the identical federal
pack, once with no lookback declared and once with the three premium legs handed
in. The published leg set carries four included legs and three excluded ones; the
included legs sum to `totalFederalTax`; every declared leg sums to that total plus
exactly the annual Medicare cost; and reconciliation identity `L4` still holds
with three legs present that it must exclude.

### TP-04-13

Green, after RED 1. Each premium leg is flipped to `includedInTotal: true` in
turn and carried through a real settlement. Each flip puts exactly the flipped
leg into the published included set under its own name, breaks `L4`, and drives
the settlement to refuse its own total with `RLTAX-RECONCILE`. The unflipped
settlement holds and publishes a finite total, so the break is caused by the flip
and by nothing else.

### TP-04-14

Green. Three fixtures spanning the Features 021 through 023 shapes — ordinary
only, preferential-bearing, and wage-and-surtax bearing — are each settled with
no lookback declared and again with the premium legs handed in. For every fixture
the federal portion of the leg set is byte-identical, every other settled member
is byte-identical, the total is unchanged, exactly three legs are appended and
none of them enters the total. The three fixtures settle to three distinct
totals, so the identity is not one figure agreeing with itself. The
preferential-bearing fixture reproduces the exact figures Scope 02 pins for the
identical workspace: gross `135000`, ordinary taxable `103900`, preferential
taxable `15000`, total taxable `118900`.

Medicare premiums are not part of the federal tax total. No premium had leaked
into it; the defect this row would have caught was not present.

### TP-04-15

Green. Unchanged from the earlier dispatch.

### TP-04-16

Green. The `medicare-and-irmaa` entry keeps its id, its label and its deferral
code; only the reason differs, and the before and after text is recorded in
[Reason Correction](#reason-correction). The new clause this row adds is the pin:
a predicate reads the shipped pack's own bracket sets and requires at least two
brackets carrying a numeric lower bound in every set, and the corrected reason is
asserted to claim exactly that. The pin is proven capable of failing — the same
predicate over a pack whose bracket sets are emptied returns false, so a reason
claiming the bands are declared would contradict the pack it names. The
disclosure's membership and count of eight are asserted unchanged.

### TP-04-18

Green, after RED 2. The two surface builders are extracted from the page with the
selftest's own function extractor and evaluated here, so the sets compared are the
ones the page produces rather than a restatement that could only agree with
itself. The record set, the headline set, the comparison set and the curve set
are identical in both directions with all three premium legs present. The record
carries four federal legs beside them, so the identity is not three ids agreeing
with themselves. Every surface derives its premium rows by walking the legs the
stage published; no premium leg id appears as a literal anywhere on the page.

### TP-04-19

Green, after RED 1 and RED 2. Each of the three premium legs is removed from each
of the four surfaces in turn. All twelve cases fail the identity, and each failure
names both the leg and the surface. The unmutated identity holds. A leg present on
every surface but summed into the tax total is reported by the name of the leg that
entered the total and by the settlement refusing its own total, rather than as an
unexplained numeric mismatch.

### TP-04-21

Green. Both lookback members are declared workspace fields that start `null`, are
named by the unavailable-domain report while undeclared, are omitted by the export
sanitizer and listed in `omittedFields`, and never appear in the exported bytes.
The declared amount `187654` genuinely reaches storage — asserted before the clear
— and the clear action then removes all three declared keys. The storage inventory
names the pair in its own words. The declared storage key count of three is
asserted unchanged in the same assertion. Neither member reaches any URL, query
string or committed configuration, and the module performs no storage, network,
DOM or console access.

### TP-04-22

Green, after RED 1. The first arm — twelve markers and twelve ledger rows, equal
as sets in both directions — is unchanged. The second arm, authored this session,
re-derives both supersessions rather than taking them on trust from the sites that
carry them:

- **SUP-024-06.** Its superseded clause is restated and applied to the tree as it
  stands: `'irmaa-bands'` is no longer a member of the not-carried set, so the
  clause is now **false**. Its replacement holds — the id is absent from the
  not-carried set and present as a medicare policy whose every leg is
  `includedInTotal: false`.
- **SUP-024-07.** Its superseded probe is restated: filter the id out of both
  lists and assert it is then accounted for in neither. The filter is proven to be
  a **no-op** — the list length is unchanged — and the probe still passes. It has
  become vacuous, which is worse than a failure because nothing reports it.
- **The replacement fires on both sides of the move.** Arm one: `payroll-tax`, an
  id chosen from the pack at run time because the shipped pack still carries it
  only on the unsupported side, is deleted from both lists and is then accounted
  for nowhere. Arm two: the genuinely modelled id is accounted for nowhere once
  the medicare policy that received it is stripped, even though the same
  unsupported-side filter is a no-op against it.

Both markers are present with their superseded clause recorded verbatim beside
them, each pointing at the ledger row that admitted it.

### TP-04-23

Green. The first arm is unchanged. The second arm, authored this session, removes
each of the eleven medicare pack members in turn and composes the stage again. No
removal throws. Every removal yields a shape the renderer's early return handles:
a refusal carrying only the members read before that return, or an available shape
publishing every member the renderer reads. At least one removal genuinely produces
the refusal shape, so the arm is not vacuous. The member set checked is read off
the renderer's own body rather than listed, so a member a later edit adds is
covered without editing the check.

### TP-04-27

Green, after RED 3. The four surfaces are read from the rendered DOM: the headline
block's federal leg attribute plus its per-leg hosts, the comparison table body,
the curve contributor table body, and the exported record attribute. The identity
is asserted in both directions, surface by surface, and each failure message names
the leg and the surface.

The expectation is derived from what actually settled rather than from the pack's
leg count. The shipped pack's Part D standard premium was never retrieved, so that
leg refuses and surfaces nothing. That is the correct behaviour, and deriving the
expectation from the settled set is what keeps the row honest about it.

### TP-04-24, TP-04-25, TP-04-26, TP-04-28

Green within the 56-row browser suite. Unchanged from the earlier dispatch.

### TP-04-29

Not run as its own command. The cumulative `tests/lifetime-tax-*.spec.mjs` run
over the same route is green at 56 passed, which exercises the same rows, but it
is not the `--grep "SCN-02"` command the row names.

### TP-04-30, TP-04-31, TP-04-32

Green. The verbatim output of all three is recorded under
[Session commands](#session-commands-verbatim) above.

### TP-04-01 through TP-04-11, TP-04-17, TP-04-20

Green in the `2812 passed, 0 failed` run. Each was delivered by an earlier
dispatch and this session did not re-derive its individual intended-RED, so no
per-row RED is claimed for any of them.

