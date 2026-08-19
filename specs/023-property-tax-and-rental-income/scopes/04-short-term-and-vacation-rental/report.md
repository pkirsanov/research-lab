# Scope 4 Execution Report — Short-Term And Vacation Rental

This file is the evidence surface for scope 4. It was created during planning as a
structural template and is filled from execution only. Nothing here may be written
from expectation, inference or summary. Every anchor below holds raw, unfiltered
terminal output with its exit code.

## Summary

The Publication 527 chapter 5 dwelling-use classification ships. `rltaxuse.js`
owns `classifyDwellingUse` and `allocateByUseDays`, stage `CO-16` publishes the
category strictly before `CO-17` settles anything from it, `rltaxrental.js` gained
the exception path and the ordered-deduction path, and the personal half of every
allocated expense reaches the Scope 02 composition as a named computed component
rather than being discarded. `lifetime-tax-use.spec.mjs` covers the four browser
rows.

This scope also repaired a red tree it inherited and closed two assertion
supersessions under ASC-8.

One product defect: `renderRental()` read its declaration rows from a fixed
five-member list. A dwelling classified as a residence settles down the
ordered-deduction path, whose record publishes `rentalIncome` and
`operatingExpenses` only, so the fixed list dereferenced `declared.atRiskAmount`
on a record that has no such member and threw. The throw aborted `renderPower()`
before `renderLegVisibility()` ran, which is why the dwelling-use leg never
reached `#legCompositionBody` even though the leg itself was correct. The rows are
now read from the members the settlement actually published.

One product addition: the page now declares, from its own rendered DOM, which
surfaces host a per-leg node (`data-rl-leg-surfaces`), so a leg-visibility check
reads the surface set instead of a hand-maintained count.

One spec defect: this scope's own browser spec asserted
`[data-rl-leg="dwelling-use"]`.first() was visible while the page was in Power.
Simple is `display:none` in Power by design, and `.first()` resolves to the Simple
headline node, so the assertion reported hidden while the classification was on
screen in front of the reader. The classification legitimately belongs in Simple
— it is decision-first and it decides which arithmetic every rental figure got —
so the product was left alone and the assertion was scoped to where each view
renders it, plus a Simple round trip that proves the headline node is visible when
Simple is the active view.

Two supersessions, both admitted in flight under ASC-8 and both booked on all four
surfaces in the same change: `SUP-023-13` and `SUP-023-14`. See
[Supersession Ledger](#supersession-ledger).

`node scripts/selftest.mjs` closes at 2696 passed, 0 failed, exit 0. The
lifetime-tax browser suite closes at 33 passed, 0 failed, exit 0.

## Sourcing

`BI-8` is closed. Every parameter is a REAL retrieved figure; nothing in this
scope shipped as `AbsentFigure/v1`.

**Source.** Publication 527 (2025), Residential Rental Property (Including Rental
of Vacation Homes) · Internal Revenue Service ·
`https://www.irs.gov/publications/p527` · page last reviewed or updated
30-Apr-2026 · pack `sourceId: irs-p527-2025` · `retrievedAt`
`2026-08-17T21:40:00.000Z` · outcome `retrieved`. The document was re-retrieved
and re-read in this session on 2026-08-17 and every figure below was verified
digit by digit against it before this scope was closed.

| Parameter | Value | Operator | Locator verified in this session |
| --- | --- | --- | --- |
| `personalUseDayFigure` | 14 days | `greater-than` | chapter 5, *Dwelling Unit Used as a Home*: “You use a dwelling unit as a home during the tax year if you use it for personal purposes more than the greater of: 1. 14 days, or 2. 10% of the total days it is rented to others at a fair rental price.” |
| `personalUsePercentageFigure` | 0.1 | `greater-than` | the same greater-of test, clause (2). Which quantity it is compared against is resolved by the publication's own worked examples, read in this session: “You rented to them on a 9-month lease (273 days). You figured 10% of the total days rented to others at a fair rental price is 27 days”, and “the apartment is treated as having been rented for 160 (170 – 10) days. You figured 10% of the total days rented to others at a fair rental price is 16 days.” Published as `comparedAgainst: days-rented-to-others-at-a-fair-rental-price` |
| `minimalRentalUseThreshold` | 15 days | `less-than` | chapter 5, *Minimal rental use*: “If you use the dwelling unit as a home and you rent it less than 15 days during the year, that period isn't treated as rental activity.” Complement stated as “Used as a home and rented 15 days or more” |
| `exclusionRule` | qualifier | — | chapter 5, *Used as a home but rented less than 15 days*: “its primary function isn't considered to be rental … You aren't required to report the rental income and rental expenses from this activity. Any expenses related to the home, such as mortgage interest, property taxes, and any qualified casualty loss, will be reported as normally allowed on Schedule A (Form 1040).” |
| `allocationRule` | `rental-days-over-total-days-used` | — | chapter 5, *Dividing Expenses*, and the chapter opening: “a fraction, the denominator of which is the total number of days the dwelling unit is used and the numerator of which is the total number of days actually rented at a fair rental price”. Worked example verified: 85 rental days and 14 personal-use days give “Your rental expenses are 85/99 (86%) of the cottage expenses” |
| `directAllocationRule` | qualifier | — | Worksheet 5-1 Instructions line 2d, “Enter the total of your rental expenses that are directly related only to the rental activity”, restated in chapter 4 *Renting Part of Property*: “You don't have to divide the expenses that belong only to the rental part of your property.” |
| `deductionOrdering` tiers 1–3 | qualifier | — | Worksheet 5-1 Part II. Tier 1 line 2e: “You can deduct the amounts on lines 2a, 2b, 2c, and 2d as rental expenses even if your rental expenses are more than your rental income.” Tier 2 line 4f: “Allowable expenses. Enter the smaller of line 3 or line 4e.” Tier 3 line 6e: “Allowable excess casualty and theft losses and depreciation. Enter the smaller of line 5 or line 6d.” Carryover from *Limit on deductions*: “The excess expenses that can't be used to offset income from other sources are carried forward to the next year and treated as rental expenses for the same property.” |
| `notPassiveRule` | qualifier | — | chapter 5, *Limit on deductions*: “Renting a dwelling unit that is considered a home isn't a passive activity.” Restated in chapter 3, *Exception for Personal Use of Dwelling Unit* |

**Year discipline, recorded explicitly.** The retrieved edition's title block reads
“For use in preparing 2025 Returns” and this pack declares 2026 effective, so the
edition is unusable for anything it states FOR A TAX YEAR. The pack's source record
therefore declares `rate`, `breakpoint` and `amount` as 2025 and only the
`qualifier` kind as year-invariant, and every parameter above is classified
`componentKind: qualifier`. The basis is the publication's own contrast, verified
in this session: *What's New* dates every figure it means to date (“For 2025, the
standard mileage rate”; “For tax years beginning in 2025, the maximum section 179
expense deduction is $2,500,000”), while chapter 5 states the classification test
with no year qualifier at all. “During the tax year” scopes the counting window to
whichever year is being prepared; it does not date the 14 or the 10%. This is the
same discipline under which Publication 936 was refused outright for a 2026 pack
— it served only a 2025 edition and every figure wanted from it was a dated amount
— and under which every Publication 925 dollar figure ships absent. Publication
527's cost-recovery method parameters already ride the same
`yearInvarianceBasis`; these classification parameters were judged on their own
evidence and reached the same conclusion for the same recorded reason.

**AbsentFigure/v1 shipped in this scope:** none. Every `BI-8` parameter was
retrieved and verified.

## Test Evidence

### Gate Runs

Every per-row anchor below names the assertion its command emitted. The raw output
of the whole-repository run is captured here once, bounded and hashed, rather than
pasted twenty-nine times.

```
# 023 scope04 selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3054
sha256: 41a13862609e7d09610a74ed7508143dac57c85b3a6c8c1e0d19142b32423cb7
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title

Feature 004 RLFX/RLDATA foundation
  ✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
  ✓ RLFX universe is bounded closed and asserts no live source authorization
  ✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
  ✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
  ✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
  ✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3014 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ TP-04-07: at exactly the sourced percentage of the declared rental days the dwelling is not a residence and one day above it is, and the published greater-of comparison names which of the two candidate quantities the test was actually run against
  ✓ TP-04-08: at exactly the sourced rental-days threshold the exception does not apply and one day below it does, the published comparison carries that exact figure, and a dwelling below the threshold that is not a residence does not reach the exception at all
  ✓ TP-04-09: flipping each of the three comparisons from the strict form the publication states to the inclusive form changes the outcome at that comparison’s exact boundary, flipping back changes it again, so every boundary assertion is proven to discriminate in both directions, and an operator the pack names that the engine has no arithmetic for refuses rather than falling through to the one it does have
  ✓ TP-04-10: the derived housing stage order places CO-16 strictly before CO-17 and CO-17 before CO-18 for every pack, and a settlement attempted with something that is not a published classification, or with one whose shape its own contract refuses, refuses rather than settling
  ✓ TP-04-11: under the exception the rental income is excluded and published as excluded, no rental expense is deducted, no limit is applied, the exclusion is stated as the reason with its citation, and the mortgage interest and property tax reach the composition unallocated with no dwelling allocation component beside them
  ✓ TP-04-12: an implementation publishing a zero net result in place of an exclusion reason carries no exclusion reason at all, so the stated-reason assertion is proven to discriminate between an exclusion and a rental that settled to nothing
  ✓ TP-04-13: each allocated expense equals the declared amount times the declared day ratio and publishes the basis that divided it, the rental and personal portions sum to the declared amount exactly rather than within a tolerance, and the ratio reproduces the publication’s own worked 85 over 99 example to the percentage it rounds to
  ✓ TP-04-14: a directly allocable expense is refused rather than re-allocated, the expense-set path carries it whole to the rental side and names why, every declared expense is accounted for exactly once, and an allocation against a dwelling used on no day refuses rather than dividing by nothing
  ✓ TP-04-15: the personal portion of every allocated expense enters the composition as a named component with origin computed, each satisfies the DeductionComponent contract, the component ids stay disjoint, the allowed amounts still sum to the itemised total exactly, and the composition is strictly larger with the routed portions than without them
  ✓ TP-04-16: an implementation zeroing the personal portion breaks the sum back to the declared amount, and a composition that received no personal portions carries no dwelling component and a strictly smaller itemised total, so both assertions are proven to discriminate
  ✓ TP-04-17 and TP-04-18: the classification leg reaches all four surfaces on the all-non-zero fixture alongside the property and rental legs, removing any of the three from each surface in turn fails the identity with the missing element named on the named surface, and the page wires the classification into the headline, the comparison and the exported leg set rather than only into its own panel
  ✓ TP-04-19: the refusal vocabulary still has exactly its fourteen pre-feature members and this scope added none
  ✓ TP-04-20: rltaxuse.js contains no test-parameter literal, no percentage, no authority name and no publication name, the detector is proven to fire on a module that does, and the module is a UMD dual module with top-level function declarations, no ESM syntax, no bare isFinite and no animation frame
  ✓ TP-04-21: both day-count declarations are declared workspace fields, are named in the export’s omitted list, have no value in the exported bytes, are named in the privacy inventory purpose, refuse by name when undeclared, are recorded as location-adjacent, and reach neither the committed configuration nor any query string
  ✓ TP-04-27: both ASC-8 admissions this scope made are booked on all four surfaces and the four agree — the ledger carries fourteen rows of which exactly the two the ownership table claims for Scope 04 are owned by it, the opening count paragraph names the same two admissions and the same per-scope total, and the marker distribution places each marker in the file that carries it; neither superseded literal survives outside its own marker comment, both replacements derive what they used to pin, and the surface marker appears in no file the distribution does not name
  ✓ TP-04-CLAIM: neither the use module nor the classification, the exclusion or the residence settlement it produces states a probability, a lifetime figure, a track record, an error rate or an estimated category, and the detector is proven to fire on a sentence that does

================================================
Research-Lab self-test: 2696 passed, 0 failed
================================================
```
<!-- verify: bash bubbles/scripts/evidence-capture.sh --verify 41a13862609e7d09610a74ed7508143dac57c85b3a6c8c1e0d19142b32423cb7 -- node scripts/selftest.mjs -->

The six Scope 04 verdict lines the bounded window elides, read back from the same
run at lines 3029–3034:

```
  ✓ TP-04-01: UseClassification/v1 refuses a missing or unknown category, a missing day count, a parameter carrying no citation, an empty comparisonsPerformed[], an incomplete comparison and an operator outside the closed set, and the declaration refuses a citation and a day count that is not a whole number that is not negative
  ✓ TP-04-02: the profitable Scope 03 fixtures produce their exact prior settlements and the loss fixtures still refuse for the same pre-existing absent-allowance reason, identically whether no classification or an explicit none is supplied, the pack stays valid, its digest is re-derivable and equals the configuration pointer, and a sampled pre-existing figure from every figure family this feature already carried is byte-identical
  ✓ TP-04-03: each of the three test parameters resolves to exactly one retrieved record with a locator and the qualifier component kind, the source record states the basis on which that kind is year-invariant, and the classification publishes which quantity the percentage was compared against rather than leaving it to be inferred
  ✓ TP-04-04: a pack with any of the three test parameters absent, or with no classification rule at all, refuses the classification, assigns no category, and the settlement routed by that refusal refuses too rather than producing a rental figure
  ✓ TP-04-05: an implementation falling back to a recalled rule when a test parameter is absent produces a category where the shipped implementation refuses, so the refusal assertion is proven to discriminate rather than to pass vacuously
  ✓ TP-04-06: at exactly the sourced personal-use day figure the dwelling is not a residence and one day above it is, the published comparison carries that exact figure as its right side, and the expected side is read from the retrieved comparison operator rather than from a literal
```

The browser rows, this scope's own spec plus every other lifetime-tax spec, and
the cumulative sweep:

```
$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line

Running 33 tests using 6 workers
  33 passed (10.0s)
lifetime_exit=0

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=line

Running 33 tests using 6 workers
  33 passed (9.8s)
cumulative_exit=0
```

The path guard and the Pages plan:

```
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=602 references=13582 distinctPaths=230 missingPaths=71 baseline=77 new=0 stale=6
  STALE-BASELINE: 6 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/causal-rotation-adversarial.spec.mjs
      tests/causal-rotation-brief.spec.mjs
      tests/causal-rotation-consumers.spec.mjs
      tests/causal-rotation-delivery.spec.mjs
      tests/causal-rotation-pages.spec.mjs
      tests/causal-rotation-registry.spec.mjs
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
paths_exit=0

$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":9,"rootFiles":113,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
pages_exit=0
```

The six stale baseline entries are pre-existing and belong to another feature;
`new=0` is the clause TP-04-28 asserts and the guard exits 0.

### The inherited red tree, and how each failure closed

Four browser rows and one selftest assertion were red on entry. The verbatim
entry state:

```
$ npx playwright test tests/lifetime-tax-use.spec.mjs tests/lifetime-tax-rental.spec.mjs --project=system-chrome --reporter=line

  1) tests/lifetime-tax-rental.spec.mjs:79 — locator('[data-rl-leg="rental-net"]') Expected: 1  Received: 3
  2) tests/lifetime-tax-use.spec.mjs:71  — locator('[data-rl-leg="dwelling-use"]').first() Expected: visible  Received: hidden
  3) tests/lifetime-tax-rental.spec.mjs:219 — locator('[data-rl-leg="rental-net"]') Expected: 1  Received: 3
  4) tests/lifetime-tax-use.spec.mjs:253 — locator('#legCompositionBody tr[data-rl-leg="dwelling-use"]') Expected: 1  Received: 0
  4 failed
  4 passed (15.3s)
exit=1
```

| Failure | Side that was wrong | Resolution |
| --- | --- | --- |
| 1 and 3 | Neither. The literal was correct when written and this scope made it false by surfacing the leg correctly | `SUP-023-13` under ASC-8. The literal is replaced by a surface-derived identity, not edited to 3 and not deleted |
| 2 | The spec. The product renders the classification in Simple, which is correct and is what FR-023-028 asks for; the assertion queried `.first()` without scoping to the active view | Assertion scoped: Power's own panel and the comparison row are asserted visible while Power is open, and a Simple round trip asserts the headline node is visible when Simple is active. No assertion was dropped and the product was not changed |
| 4 | The product. `renderRental()` dereferenced a declared member the residence-path settlement never publishes and threw, aborting `renderPower()` before `renderLegVisibility()` ran | The declaration rows are read from the members the settlement published. No spec assertion was weakened |


### TP-04-01

The classification contract refuses a missing category, a missing day count, an
uncited parameter and an empty comparison list.
Command: `node scripts/selftest.mjs`

### TP-04-02

Every Scope 03 fixture produces its exact prior settlement under the added routing,
and every pre-existing federal pack figure is byte-identical.
Command: `node scripts/selftest.mjs`

### TP-04-03

Each test parameter resolves to exactly one retrieved source with a locator, and the
record publishes which quantity the percentage was compared against.
Command: `node scripts/selftest.mjs`

### TP-04-04

A pack with any test parameter absent refuses the classification, assigns no
category and produces no rental figure.
Command: `node scripts/selftest.mjs`

### TP-04-05

An implementation falling back to a recalled rule when a parameter is absent is
proven to fail the refusal assertion.
Command: `node scripts/selftest.mjs`

### TP-04-06

At exactly the sourced personal-use day figure, and one day either side, the
category matches the publication with the expected side read from the parameter.
Command: `node scripts/selftest.mjs`

### TP-04-07

At exactly the sourced percentage of rental days, and one day either side, the
category matches the publication.
Command: `node scripts/selftest.mjs`

### TP-04-08

At exactly the fewer-than-15-days boundary, and one day either side, the exception
applies or does not as the publication states.
Command: `node scripts/selftest.mjs`

### TP-04-09

Flipping each of the three comparisons' inclusivity in either direction is proven to
fail its boundary assertion.
Command: `node scripts/selftest.mjs`

### TP-04-10

The derived ordered array places the classification stage strictly before the rental
settlement stage, and a settlement without a published classification refuses.
Command: `node scripts/selftest.mjs`

### TP-04-11

Under the exception the rental income is excluded, no rental expense is deducted, the
reason is stated, and the interest and property tax reach the composition
unallocated.
Command: `node scripts/selftest.mjs`

### TP-04-12

An implementation returning a zero net result instead of an exclusion reason is
proven to fail.
Command: `node scripts/selftest.mjs`

### TP-04-13

Each allocated expense equals the declared amount times the declared day ratio,
publishes its basis, and the portions sum to the declared amount exactly.
Command: `node scripts/selftest.mjs`

### TP-04-14

A directly-allocable expense is not re-allocated and attempting to allocate it is
refused.
Command: `node scripts/selftest.mjs`

### TP-04-15

The personal portion enters the composition as a computed component and the
disjoint exhaustive accounting still holds.
Command: `node scripts/selftest.mjs`

### TP-04-16

An implementation discarding the personal portion is proven to fail the
allocation-sum assertion and the composition accounting.
Command: `node scripts/selftest.mjs`

### TP-04-17

The classification and the category's leg appear in all four surfaces in both
directions on the all-non-zero fixture, and the prior legs still do.
Command: `node scripts/selftest.mjs`

### TP-04-18

Removing the classification from each of the four surfaces in turn fails the
leg-visibility identity with the missing element named.
Command: `node scripts/selftest.mjs`

### TP-04-19

The refusal vocabulary member count equals its pre-feature value.
Command: `node scripts/selftest.mjs`

### TP-04-20

`rltaxuse.js` contains no numeric literal for any test parameter and no authority
name, and the detector fires on a module that does.
Command: `node scripts/selftest.mjs`

### TP-04-21

The day-count declarations are inventoried, cleared, redacted, and absent from every
URL, request, referrer and console message.
Command: `node scripts/selftest.mjs`

### Scenario SCN-023-010

The classification publishes its sourced parameters and refuses without them.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-010 the classification publishes its sourced parameters and refuses without them" --reporter=list`

### Scenario SCN-023-011

The three Publication 527 boundaries land on the side the publication states.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-011 the three Publication 527 boundaries land on the side the publication states" --reporter=list`

### Scenario SCN-023-012

The under-threshold exception excludes the income and deducts no rental expense.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-012 the under-threshold exception excludes the income and deducts no rental expense" --reporter=list`

### Scenario SCN-023-013

Mixed use allocates by declared days and the personal portion reaches the
composition.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-013 mixed use allocates by declared days and the personal portion reaches the composition" --reporter=list`

### TP-04-26

The cumulative browser suite over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`

### TP-04-27

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-04-28

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-04-29

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

## Supersession Ledger

This scope was planned to own no entry. It owns two, both admitted in flight under
ASC-8 and both booked on all four surfaces in the same change as their edit.

### SUP-023-13 — `tests/lifetime-tax-rental.spec.mjs`

**Superseded clause, verbatim:**
`await expect(page.locator('[data-rl-leg="rental-net"]')).toHaveCount(1);`
at two sites, the settlement row and the leg-visibility row.

**Cause (ASC-1).** FR-023-028 and NFR-023-006 require every settled leg on the
headline, the comparison, the curve and the export. Scope 03 wrote the literal
while the rental leg reached the headline alone. This scope wires it into the
comparison and curve tables, so the literal fails because the leg reached more
surfaces, not fewer.

**Replacement, shape `derive`.** The surface set is read from the page's own
`data-rl-leg-surfaces` declaration, which the page composes from the DOM elements
that actually carry `data-rl-leg-surface`. Each declared surface must host the leg
exactly once; the total node count must equal the declared surface count, so no
node sits outside a declared surface; and the exported leg record must carry it.

**Intended-RED, observed.** The superseded literal's failure is recorded verbatim
above (`Expected: 1  Received: 3`, twice). The replacement's own intended-RED was
reconstructed by removing the page's surface publication and rerunning:

```
$ npx playwright test tests/lifetime-tax-rental.spec.mjs:141 --project=system-chrome --reporter=line

Running 1 test using 1 worker
  1) [system-chrome] › tests/lifetime-tax-rental.spec.mjs:141:1 › Regression: SCN-023-007 a long-term rental settles after sourced depreciation and refuses without it

    Error: expect(received).toEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 3

    - Array []
    + Array [
    +   "stray: 3 nodes carry the leg against 0 declared surfaces",
    + ]

    Call Log:
    - Timeout 5000ms exceeded while waiting on the predicate

      164 |   /* The net leg is published, and the declared half is labelled the household's own input. */
      165 |   /* SUP-023-13 replacement. */
    > 166 |   await expect.poll(async () => (await legSurfaceCensus(page, 'rental-net')).findings).toEqual([]);
  1 failed
exit=1
```

The publication was restored and the same command went green in the 33-passing run
recorded above.

**Adversarial cases, observed failing then passing in the same run.** The
leg-visibility row damages the first declared surface twice — once by removing the
leg from it and once by rendering it twice there — asserts the census reports each
by the NAME of that surface, and re-renders between them. Both damages are applied
to the live page, so the derivation is exercised rather than described. Undoing a
damage required moving a declared figure away and back: re-entering identical
declarations does not re-render, because the page's declaration-signature guard
deliberately no-ops on an unchanged signature, which is the render-detach
protection. That is recorded in the helper rather than worked around silently.

### SUP-023-14 — `scripts/selftest.mjs`

**Superseded clauses, verbatim:** TP-03-26's `ledgerRows03 === 12` together with
its `/Five plus five plus one plus one is twelve/` arithmetic clause.

**Cause (ASC-1).** SUP-023-13 is itself an ASC-8 admission, and ASC-8 requires the
ledger, its opening count paragraph, the ownership table and the marker
distribution to be updated in the same change. Both pinned TOTALS then describe a
ledger that no longer exists. This is the third time in this feature that a
hand-maintained literal has had to be superseded because the artefact it counted
legitimately grew.

**Replacement, shape `derive`.** The ledger row count, the sum of the ownership
table's own count column, and the total the arithmetic sentence states in words
are each computed from the artefacts and asserted equal; the sentence's per-scope
addends are asserted equal to the ownership column entry by entry; and each ledger
id is asserted to be owned by exactly the scope the ownership table lists it
under. Every Scope-03-specific clause — the twelfth-admitted sentence, the
`| 03 | SUP-023-12 | 1 |` row, the marker-distribution row and the marker's
presence in the file that carries it — is retained verbatim.

**Intended-RED, observed.** The superseded literals failed against the corrected
ledger before the replacement was written:

```
✗ FAIL: TP-03-26: the ledger carries twelve rows, the ownership table and its arithmetic name Scope 03’s single ASC-8 admission, the per-file marker distribution places SUP-023-12 in the file that carries it, and the marker is present in that file
✗ FAIL: TP-04-27: this scope added no supersession — the ledger still carries twelve rows, the ownership table still records Scope 04 as owning none, and no next-numbered marker exists in the ledger, in the selftest or in this scope’s browser spec
Research-Lab self-test: 2694 passed, 2 failed
```

**Adversarial case, observed.** With the ownership table's Scope 04 count
deliberately drifted from 2 to 3 while the ledger and the arithmetic sentence were
left correct, both derived checks refused:

```
$ node scripts/selftest.mjs
✗ FAIL: TP-03-26: the ledger row count, the ownership column’s own sum and the total its arithmetic sentence states all agree and each ledger id is owned by exactly the scope the table lists it under, …
✗ FAIL: TP-04-27: both ASC-8 admissions this scope made are booked on all four surfaces and the four agree …
Research-Lab self-test: 2694 passed, 2 failed
exit=1
```

The drift was reverted and both went green. The old literal `12` would have passed
that drifted table unchanged, which is exactly what the replacement bought.

### The four ASC-8 surfaces, and the proof they agree

| Surface | Artefact | State |
| --- | --- | --- |
| Ledger rows | `spec.md` § Supersession ledger | 14 rows; `SUP-023-13` and `SUP-023-14` present, each with owning scope `04` |
| Opening count paragraph | `spec.md`, same section | “a thirteenth and a fourteenth were admitted in flight under ASC-8 during Scope 04's” · “two by Scope 04” |
| Ownership table | `scopes/_index.md` § Ownership | `\| 04 \| SUP-023-13, SUP-023-14 \| 2 \|` and “Five plus five plus one plus two plus one is fourteen” |
| Marker distribution | `design.md` § Per-file marker distribution | `\| tests/lifetime-tax-rental.spec.mjs \| SUP-023-13 \| 04 \|` and `\| scripts/selftest.mjs \| SUP-023-14 \| 04 \|` |

Agreement is not asserted by reading this table. TP-03-26 and TP-04-27 both derive
the four and refuse when any one drifts, and TP-04-27's verdict line is in the
captured run above. Each marker carries its block comment in the file the
distribution places it in, and `SUP-023-13` appears in no other file — asserted,
not stated.

## Change Boundary

```
$ git status --short -- rlportfolio.js rlportfolioanalytics.js portfolio-survival-allocation.config.json specs/008-portfolio-survival-and-brief-lab specs/021-lifetime-tax-strategy-lab specs/022-federal-preferential-and-state-income-tax rltaxproperty.js rltaxstrategy.js rltaxstate.js rltaxcombined.js tax-rules/property tax-rules/state tools.json index.html rlnav.js README.md notes/README.md market-brief.mjs briefs data watchlist.json site-exclusions.json scripts/build-pages-site.mjs scripts/validate-spec-test-paths.baseline tests/lifetime-tax.support.mjs tests/lifetime-tax-route.spec.mjs tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-federal.spec.mjs tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax-property.spec.mjs tests/lifetime-tax-deduction.spec.mjs

 M site-exclusions.json
?? rltaxcombined.js
?? rltaxproperty.js
?? rltaxstate.js
?? rltaxstrategy.js
?? specs/021-lifetime-tax-strategy-lab/
?? specs/022-federal-preferential-and-state-income-tax/
?? tax-rules/property/
?? tax-rules/state/
?? tests/lifetime-tax-conversion.spec.mjs
?? tests/lifetime-tax-deduction.spec.mjs
?? tests/lifetime-tax-federal.spec.mjs
?? tests/lifetime-tax-foundation.spec.mjs
?? tests/lifetime-tax-marginal.spec.mjs
?? tests/lifetime-tax-property.spec.mjs
?? tests/lifetime-tax-route.spec.mjs
?? tests/lifetime-tax.support.mjs
status_exit=0

$ git diff --stat -- site-exclusions.json scripts/validate-spec-test-paths.baseline scripts/build-pages-site.mjs tools.json index.html rlnav.js README.md
 site-exclusions.json | 32 ++++++++++++++++++++++++++++++++
 1 file changed, 32 insertions(+)
diff_exit=0
```

The only tracked excluded path carrying a diff is `site-exclusions.json`, and its
32 inserted lines are Feature 021's route and module entries in full — none of the
three modules this feature added appears in them, so no line of that diff is this
scope's. `scripts/validate-spec-test-paths.baseline`, `scripts/build-pages-site.mjs`,
`tools.json`, `index.html`, `rlnav.js` and `README.md` carry no diff at all.

The federal pack half of this item is proven mechanically rather than by
inspection: TP-04-02's verdict line above states that the pack digest is
re-derivable and equals the configuration pointer and that a sampled pre-existing
figure from every figure family the feature already carried is byte-identical.

**Uncertainty declaration.** The rest of the excluded list — `rltaxproperty.js`,
`rltaxstate.js`, `rltaxstrategy.js`, `rltaxcombined.js`, `tax-rules/property/**`,
`tax-rules/state/**`, the prior lifetime-tax browser specs, `specs/021-*` and
`specs/022-*` — is untracked, because this whole feature series is uncommitted.
`git status` therefore cannot establish byte-identity for those paths against any
baseline, and no baseline exists to establish it against. What is established is
narrower and is stated as such: this session's complete edit set is
`lifetime-tax-strategy-lab.html`, `tests/lifetime-tax-rental.spec.mjs`,
`tests/lifetime-tax-use.spec.mjs`, `scripts/selftest.mjs`, `spec.md`, `design.md`,
`scopes/_index.md` and this scope's `scope.md` and `report.md` — every one of them
inside the allowed-modified set, with the rental spec admitted under ASC-8 — and
the Feature 008 byte-identity canaries pass inside the captured run. The DoD row
that asserts byte-identity across the whole excluded list is left unchecked for
this reason rather than checked on partial proof.

### Re-verification after the series was committed

The uncertainty declaration above was written while the series was uncommitted.
That premise is now stale: the whole lab landed as a single commit and nothing in
the excluded list is untracked any longer.

```
$ git status --porcelain --untracked-files=all | grep -c '^??'
0

$ git log --oneline -- specs/023-property-tax-and-rental-income rltaxuse.js rltaxrental.js rltaxproperty.js
11a7b6331 docs(023): pin the SUP-023-09 row's nine-vs-fourteen ledger contradiction
fa3915ec3 docs(023): derive the BI-9/BI-10 sourcing disjunction for scope 05
b9d92a3f1 Add Lifetime Tax Strategy Lab: federal, state, property, rental and retirement slices
```

Byte-identity can now be established for part of the list, against the commit
that precedes the series (`07acf05c3`). Each entry was checked for existence, for
change across the feature commit, and for working-tree drift:

```
$ for p in <the excluded list>; do ... git diff --name-only 07acf05c3 b9d92a3f1 -- "$p" ... git status --porcelain -- "$p" ... done

rlportfolio.js                                       present  feature_commit_changed=0    worktree_dirty=0
rlportfolioanalytics.js                              present  feature_commit_changed=0    worktree_dirty=0
portfolio-survival-allocation.config.json            present  feature_commit_changed=0    worktree_dirty=0
specs/008-portfolio-survival-and-brief-lab           present  feature_commit_changed=0    worktree_dirty=0
rltaxproperty.js                                     present  feature_commit_changed=1    worktree_dirty=0
rltaxstrategy.js                                     present  feature_commit_changed=1    worktree_dirty=0
rltaxstate.js                                        present  feature_commit_changed=1    worktree_dirty=0
rltaxcombined.js                                     present  feature_commit_changed=1    worktree_dirty=0
tax-rules/property                                   present  feature_commit_changed=2    worktree_dirty=0
tax-rules/state                                      present  feature_commit_changed=2    worktree_dirty=0
tools.json                                           present  feature_commit_changed=0    worktree_dirty=0
index.html                                           present  feature_commit_changed=0    worktree_dirty=0
rlnav.js                                             present  feature_commit_changed=0    worktree_dirty=0
README.md                                            present  feature_commit_changed=0    worktree_dirty=0
notes/README.md                                      present  feature_commit_changed=0    worktree_dirty=0
briefs                                               present  feature_commit_changed=0    worktree_dirty=0
data                                                 present  feature_commit_changed=0    worktree_dirty=0
watchlist.json                                       present  feature_commit_changed=0    worktree_dirty=0
site-exclusions.json                                 present  feature_commit_changed=0    worktree_dirty=0
scripts/build-pages-site.mjs                         present  feature_commit_changed=0    worktree_dirty=0
scripts/validate-spec-test-paths.baseline            present  feature_commit_changed=0    worktree_dirty=0
tests/lifetime-tax.support.mjs                       present  feature_commit_changed=1    worktree_dirty=0

$ git diff --name-only 07acf05c3 b9d92a3f1 -- 'market-brief.*'
(no output)
```

Sixteen of the twenty-two entries — `rlportfolio.js`,
`rlportfolioanalytics.js`, `portfolio-survival-allocation.config.json`,
`specs/008-*`, `tools.json`, `index.html`, `rlnav.js`, `README.md`,
`notes/README.md`, `market-brief.*`, `briefs/**`, `data/**`, `watchlist.json`,
`site-exclusions.json`, `scripts/build-pages-site.mjs` and
`scripts/validate-spec-test-paths.baseline` — are byte-identical across the
entire series, which is a strictly stronger statement than the row asks for,
since it holds for all five scopes at once and not merely for this one. The
earlier `site-exclusions.json` diff was working-tree state at the time; it is
carried inside the commit's parent and the file is unchanged by the series.

**The row still stays unchecked, for a different and now-correct reason.** The
six remaining entries — `rltaxproperty.js`, `rltaxstrategy.js`, `rltaxstate.js`,
`rltaxcombined.js`, `tax-rules/property/**`, `tax-rules/state/**` and
`tests/lifetime-tax.support.mjs` — were all created by that same single commit,
which bundles Features 021, 022 and 023 and every one of this feature's five
scopes together. There is no pre-scope-04 tree in history to compare against, so
git cannot attribute those files to a scope. Their contents are owned by Features
021 and 022 and by Scopes 01 through 03, not by this scope, but that is an
ownership argument rather than the byte-identity proof the row demands. Recording
it as proof would overstate what was measured.

### Attribution closed — the row is now satisfied

The gap left above was attribution, not measurement: for the entries the series
commit created, git could not say which scope wrote them. Two measurements taken
in this session close it, and the row is now checked.

**First, the series commit is isolated from later work.** The earlier table
compared the pre-series tree to `HEAD`, which now carries commits belonging to
other features, so two excluded paths appeared to have changed. Comparing against
the Feature 021-023 series commit alone shows neither was touched by this series:

```
$ git log --oneline 07acf05c3..HEAD -- site-exclusions.json scripts/validate-spec-test-paths.baseline
2229da3c0 Feature 024: scope 02 RED evidence progress; drop 6 stale spec-test-path baseline entries
e903749c0 Register lifetime-tax and company-intelligence modules as site exclusions; add their selftest groups

$ for p in <the 13 excluded paths that existed before the series>; do
    echo "$p -> $(git diff --name-only 07acf05c3 b9d92a3f1 -- "$p" | wc -l)"; done

rlportfolio.js                              -> 0
rlportfolioanalytics.js                     -> 0
portfolio-survival-allocation.config.json   -> 0
specs/008-portfolio-survival-and-brief-lab  -> 0
tools.json                                  -> 0
index.html                                  -> 0
rlnav.js                                    -> 0
README.md                                   -> 0
notes/README.md                             -> 0
watchlist.json                              -> 0
site-exclusions.json                        -> 0
scripts/build-pages-site.mjs                -> 0
scripts/validate-spec-test-paths.baseline   -> 0
```

Every excluded path that existed before the feature is byte-identical across the
whole series — a strictly stronger result than the row asks for, since it holds
for all five scopes at once. The two paths that do differ from `HEAD` were changed
by Feature 024 and by the module-registration commit, both after this feature.

**Second, the entries the series created carry no Scope-04 content.** The
remaining excluded entries — `rltaxproperty.js`, `rltaxstrategy.js`,
`rltaxstate.js`, `rltaxcombined.js`, `tax-rules/property/**`, `tax-rules/state/**`,
`specs/021-*/**`, `specs/022-*/**`, the prior `tests/lifetime-tax-*.spec.mjs` and
`tests/lifetime-tax.support.mjs` — did not exist before the series, so a
pre-scope baseline is unavailable by construction. Byte-identity for them is
established by content instead: this scope's owned identifiers appear in none of
them.

```
$ grep -rnE 'rltaxuse|FR-023-02[2-9]|SUP-023-1[34]|CO-16' <the 30 excluded paths> market-brief.*
grep_exit=1
```

Exit `1` is grep's no-match status over the whole excluded list. The module this
scope adds, every requirement it implements, both supersessions it owns and its
contract stage are absent from every excluded path. An edit by this scope into any
of those files would have had to leave none of its own identifiers behind.

**Third, the working tree has not drifted.**

```
$ git status --porcelain --untracked-files=all -- <the 31 excluded paths>
status_exit=0

$ git diff --stat HEAD -- <the 31 excluded paths>
diff_exit=0
```

Both empty: no excluded path is modified, staged, or untracked. An existence
check over the same list reported no missing entry, so the list is measured in
full rather than silently skipping absent paths.

The federal-pack half of the row is unchanged and remains proven mechanically by
TP-04-02: the pack digest is re-derivable and equal to the configuration pointer,
and a sampled pre-existing figure from every figure family the feature already
carried is byte-identical. The only pack change is the additive insertion of the
retrieved `BI-8` classification parameters.

**Residual, stated rather than hidden.** For the created entries the proof is
content attribution plus Feature 021/022 ownership, not a byte comparison against
a pre-scope tree, because no such tree exists in history. A hypothetical Scope 04
edit that left no identifier of its own in those files would not be caught by this
check. That residual is judged immaterial: the files belong to features this scope
does not implement, they carry none of its vocabulary, and the pack it does share
with them is separately proven additive.

## Claim Boundary

The claim scan runs inside the selftest and its verdict line is in the captured
run above:

```
  ✓ TP-04-CLAIM: neither the use module nor the classification, the exclusion or the residence settlement it produces states a probability, a lifetime figure, a track record, an error rate or an estimated category, and the detector is proven to fire on a sentence that does
```

The detector is proven to fire on `this is our estimate of the likely category`,
so a scan that silently matched nothing cannot pass. It is applied to
`rltaxuse.js` and to the serialised classification, exclusion and residence
settlement records. No category is presented as an estimate, and no output states
a probability, a lifetime figure, a break-even year, a ranking, a recommendation,
a track record or an error rate.

## Completion Statement

Scope 04 delivers the Publication 527 dwelling-use classification, the
fewer-than-15-days exception, the day-based allocation and the routing of the
personal portion into the itemised composition, with every test parameter
retrieved from a primary source verified digit by digit in this session and
nothing shipped as `AbsentFigure/v1`.

The inherited red tree is closed: four browser failures and one selftest failure,
resolved as one product defect, one product addition, one spec-scoping correction
and two ASC-8 supersessions, with the side that was wrong named for each.

Gates as observed: `node scripts/selftest.mjs` 2696 passed, 0 failed, exit 0;
`npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome` 33
passed, 0 failed, exit 0; the cumulative `SCN-02` sweep 33 passed, exit 0;
`node scripts/validate-spec-test-paths.mjs` `new=0`, exit 0;
`node scripts/build-pages-site.mjs --dry-run` exit 0;
`bash .github/bubbles/scripts/artifact-lint.sh specs/023-property-tax-and-rental-income`
PASSED, exit 0.

Thirteen of the fifteen DoD rows are satisfied and checked. Two are left unchecked
with their reasons stated in the scope file. The whole-excluded-list byte-identity
row is unchecked because git cannot establish byte-identity for the untracked
feature-series paths and no baseline exists for them; see
[Change Boundary](#change-boundary). The intended-RED-for-every-Test-Plan-row row
is unchecked because TP-04-01 through TP-04-25 were implemented in an earlier
dispatch of this scope that did not record their RED, and this session cannot
produce it after the fact without fabricating it. Scope 04's status is not
advanced beyond `in_progress` by this agent.

