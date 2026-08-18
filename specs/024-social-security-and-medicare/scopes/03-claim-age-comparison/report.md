# Scope 3 Execution Report — Claim-Age Comparison

This file is the evidence surface for scope 3. Every anchor below holds output
from a command that was actually run, with its exit code. Where output exceeded
40 lines it was recorded through `bash .github/bubbles/scripts/evidence-capture.sh`,
which carries the command, the exit code, the line count and a sha256 over every
line the command produced, so the record is re-derivable with `--verify`.

## Summary

Delivery exists and the suite is green. `rltaxclaimage.js`, the mortality pack
`tax-rules/mortality/2026.json`, the non-standard fixture pack,
`MortalityBasis/v1` with its probability-member refusal, `ClaimAgeComparison/v1`,
stage `CO-23`, the declared claim-age set, the `power-claim-age` section and
`tests/lifetime-tax-claim-age.spec.mjs` are all present, and the two claim-scan
file-set extensions in `scripts/selftest.mjs` add files and remove nothing.

**Execution spanned two sessions and this report distinguishes them.** An earlier
dispatch authored the module, the packs, the page section, the browser spec and
the selftest group, and was interrupted with two of this scope's own assertions
red. That earlier session's intended-RED evidence was not recorded and was not
observed by the session writing this report; the Test Plan row that requires it
is therefore left unchecked in [scope.md](scope.md#definition-of-done) rather
than claimed. This session diagnosed the two red assertions clause by clause,
fixed them, re-retrieved the primary source and verified every transcribed figure
against it digit by digit, and ran every gate below.

## Completion Statement

This scope is **Done with concerns**. Sixteen of the eighteen Definition of Done
rows are checked and were observed to be satisfied. Two are left unchecked with
their reasons stated both in [scope.md](scope.md#definition-of-done) and here:

1. **Excluded-path byte-identity.** The whole lifetime-tax tree — including the
   excluded `tax-rules/federal/**`, `rltaxsocialsecurity.js`, `rltaxinclusion.js`
   and the sibling spec folders — is untracked in git, so no committed baseline
   exists to compare against and byte-identity cannot be established by
   observation. What *was* observed is recorded under
   [Change Boundary](#change-boundary): every excluded **tracked** path is
   unmodified except `site-exclusions.json`, whose working-tree diff predates
   this scope and contains no claim-age or mortality entry. That is weaker than
   the row's claim, so the row stays unchecked.
2. **Intended RED for every Test Plan row.** The named intended-RED assertion —
   a fixture pack carrying a probability-bearing member is refused
   `RLTAX-PACK-INVALID` and produces no comparison — was not observed failing by
   this session, because the refusal already existed when this session began. A
   RED that was not observed is not recorded as one.

## Sourcing

`BI-9` is **closed with a real retrieval performed in this session.** No figure
in this scope is recalled, interpolated or derived.

| Field | Value |
| --- | --- |
| Title | Actuarial Life Table |
| URL | `https://www.ssa.gov/oact/STATS/table4c6.html` |
| `retrievedAt` | 2026-08-18 |
| `retrievalOutcome` | retrieved |
| `documentKind` | departmental-publication |
| `editionYear` | 2023 |
| Table locator | Caption above the table: *Period Life Table, 2023, as used in the 2026 Trustees Report* |

**Edition year judged per component kind.** The publication dates itself twice in
its own words, and both quotations were read in this session:

- Introductory paragraph: *"Here we present the 2023 period life table for the
  Social Security area population, as used in the 2026 Trustees Report (TR)."*
- Caption: *"Period Life Table, 2023, as used in the 2026 Trustees Report"*

The table therefore carries the **2023** mortality experience, which is not the
declared workspace year of 2026, and the pack says so rather than silently
treating a 2023 table as a 2026 figure.

**`BI-8` invariance contrast, quoted from the document.** The same page states
*"This life table is available for certain other years."* That is the in-document
evidence that the figure is not year-invariant, so the pack makes no invariance
claim: it carries the table's own year, publishes the publication's dating on
both sides, and leaves the mismatch visible. This quotation is carried in
`mortalityPolicy.tableYearBasis.quotedYearScoping`.

### Transcription, verified digit by digit against the page read in this session

Each retrieved row has the shape `| age | q | l | e1 | q | l | e2 |`. The pack's
two columns are located at the **fourth** and **seventh** cells of each row,
exactly as their `locator` members state. All eighteen figures were compared
character by character against the retrieved text:

| Age | Retrieved row (verbatim) | Pack column 1 | Pack column 2 |
| --- | --- | --- | --- |
| 62 | `62 \| 0.013196 \| 82,563 \| 20.29 \| 0.008220 \| 89,767 \| 23.08` | 20.29 ✓ | 23.08 ✓ |
| 63 | `63 \| 0.014229 \| 81,473 \| 19.56 \| 0.008881 \| 89,029 \| 22.27` | 19.56 ✓ | 22.27 ✓ |
| 64 | `64 \| 0.015316 \| 80,314 \| 18.83 \| 0.009514 \| 88,238 \| 21.46` | 18.83 ✓ | 21.46 ✓ |
| 65 | `65 \| 0.016455 \| 79,084 \| 18.12 \| 0.010188 \| 87,399 \| 20.66` | 18.12 ✓ | 20.66 ✓ |
| 66 | `66 \| 0.017574 \| 77,783 \| 17.41 \| 0.010880 \| 86,508 \| 19.87` | 17.41 ✓ | 19.87 ✓ |
| 67 | `67 \| 0.018735 \| 76,416 \| 16.71 \| 0.011659 \| 85,567 \| 19.08` | 16.71 ✓ | 19.08 ✓ |
| 68 | `68 \| 0.019981 \| 74,984 \| 16.02 \| 0.012543 \| 84,569 \| 18.30` | 16.02 ✓ | 18.30 ✓ |
| 69 | `69 \| 0.021366 \| 73,486 \| 15.34 \| 0.013581 \| 83,509 \| 17.53` | 15.34 ✓ | 17.53 ✓ |
| 70 | `70 \| 0.022903 \| 71,916 \| 14.66 \| 0.014769 \| 82,374 \| 16.76` | 14.66 ✓ | 16.76 ✓ |

Eighteen figures retrieved, eighteen verified, **zero** shipped as
`AbsentFigure/v1`. The pack's own figure count was read back from the file:

```
$ node -e '<claim-boundary scan over allowed paths>'
exit: 0
sha256: 9bb49877d79610b710b5375da2443bc56b7ea4bee67a777f0209af3a438e0cb4
MORTALITY_FIGURE_COUNT=18
```

**The probability and survivorship columns were NOT transcribed.** The retrieved
table carries them — its footnotes read *"a Probability of dying within one
year."* and *"b Number of survivors out of 100,000 born alive."* — and the pack
carries neither. Had either been transcribed, `MortalityPolicy/v1` would have
refused the pack by name; TP-03-01 proves that refusal fires on exactly those two
member shapes.

### The one `AbsentFigure/v1` in this scope

`mortalityPolicy.columnLabels` ships as an `AbsentFigure/v1`, and the retrieval
performed in this session confirms it is genuinely absent rather than merely
unrecorded: the retrieval returned every data row of the table and returned the
**header cells empty**, so which population subgroup each of the two published
life-expectancy columns describes was never read. The two columns are therefore
carried under the only identity this retrieval established for them, their
position in each published row, and the absence travels inside the basis with:

- `code`: `RLTAX-THRESHOLD-UNAVAILABLE`
- `reason`: the header row was returned empty, so the column identity was never read
- `whatWouldMakeItAvailable`: retrieve the header row and name each column by its heading
- `missingSource`: title, URL, `documentKind` and the locator of the header row

No numeric member is smuggled alongside it. TP-03-15 asserts that shape.

## ASC-9 Naming Decision

**Response taken: (1) make the claim genuinely weaker.** Not (2) supersede, and
emphatically not the inadmissible third option of choosing a synonym.

The delivered member is `cumulativeParityAge`, publishing `equalityAge`,
`sumsMeet`, `earlierClaimAge`, `laterClaimAge` and `withheldReason`. The
delivered `resultKindStatement`, verbatim from `rltaxclaimage.js`:

> Each figure here is a declared annual amount multiplied by a whole number of
> years, and each pairing reports the age at which two such products are equal.
> Every one is arithmetic over an amount this settlement computed from your own
> declarations and a remaining-years figure transcribed from a published table.
> The claim made here is exactly that and no more: two declared sums are equal at
> that age. It is not a forecast and not a prediction of what will happen to you,
> and it states no chance that any particular thing happens.

**The reasoning connecting the name to the response.** A break-even claim, of the
kind the repository's five detectors forbid, asserts that a choice becomes
advantageous past a point — it carries an implicit survival assumption and an
implicit recommendation. This scope's output carries neither. It solves a linear
equality between two sums, each of which is a declared annual amount multiplied
by a whole-year count read from a published table. Both inputs are declared, the
solution is exact arithmetic, no discount rate, growth rate, inflation adjustment
or partial-year interpolation exists in the module, and the record states in its
own words that it selects nothing. That is a strictly weaker claim, not the same
claim under another word.

`equalityAge` is not a synonym for a break-even age; it names a different and
smaller thing. The test of that is behavioural rather than lexical, and TP-03-09
applies it: the published age is asserted to satisfy the equality **from both
sides**, and a pair whose sums never meet returns `sumsMeet: false` with the
figure withheld rather than a bound reported as though it were an answer. A
break-even implementation would have reported a bound there.

Having made the claim weaker, this scope then **extended** the two claim scans to
cover its own module and its own pack rather than carving an exception out of
them. See [Supersession Ledger](#supersession-ledger).

### The two red assertions this session fixed, and which side was changed

Both were this scope's own assertions and neither was weakened.

**TP-03-05 — failing clause:** `scannedFiles26.every((entry) => !claimScan26.test(entry.text))`,
which scanned the **raw** source of `rltaxclaimage.js`. The single hit was the
word *probability* at one place only: the block comment above the
`RLTAX-PACK-INVALID` branch of `composeClaimAgeComparison`, which records which
member shape the pack refusal rejects.

**Which side changed: the assertion, and only in the direction the assertion's own
design already specified.** The module comment was **not** reworded, because
rewording it would be exactly the ASC-9-inadmissible dodge — the same claim
passing the same scan under a different word — and because FR-024-015 cannot be
documented without naming what it refuses. This is the identical carve-out
TP-03-CLAIM already makes in writing for the pack-invalid refusal payload: *"a
scan over that refusal would fire on the very act of refusing and would push an
implementation toward a refusal that hides what it rejected."* The block comment
sitting directly above TP-03-05 already stated that a source scan *"must read the
code, not the prose about the code"* and already built `stripComments26` for that
purpose — TP-03-08 used it and TP-03-05 did not. The fix closed that gap, and it
is a net strengthening:

- Both **pre-existing** scanned files, `rltaxsocialsecurity.js` and
  `rltaxinclusion.js`, are now asserted against the **raw** scan as well, so
  nothing they were covered by before was relaxed.
- The new module is asserted at code level, plus a derived clause proving every
  raw hit **disappears** under comment stripping — which is what proves the hit
  is prose and that nothing is hiding in a string literal.
- The planted-token proof now plants the token as **code**
  (`var note = "the break-even age is likely to be reached";`) rather than as a
  comment, so it proves the scan reaches the text the stripper *keeps* rather
  than only the text it removes. The old form planted inside a comment and would
  have passed against a scanner that read nothing at all.

**TP-03-CLAIM — two failing clauses.** The first was `!claimScan26.test(claimAgeSource26)`,
the same raw-source hit, fixed the same way by scanning `claimAgeCode26`. The
second was `/not a forecast/i.test(settled26.resultKindStatement)`: the record
read *"None of it is a forecast"*, which is semantically identical and does not
match the pinned phrase.

**Which side changed: the product.** The record's own statement was rewritten to
say the weaker claim positively and to disclaim explicitly — *"The claim made
here is exactly that and no more: two declared sums are equal at that age. It is
not a forecast and not a prediction of what will happen to you"* — and the
assertion was strengthened to require the positive form `/two declared sums are
equal/i` alongside `/equal/i` and `/not a forecast/i`. The detector was not
narrowed and no clause was removed. `tests/lifetime-tax-claim-age.spec.mjs` was
updated in the same change so the browser row asserts the delivered text.

## Supersession Ledger

This scope owns **no** ledger entry, and that is a finding rather than an
omission. The break-even neighbourhood — five forbidden-token detectors, the
conversion record's forbidden-member enumeration and the per-feature claim scans —
was examined during planning and cleared under RD-5, and the reasoning is
recorded in [`spec.md`](../../spec.md#assertions-considered-and-not-superseded).
Delivery did not disturb that finding: no member name, attribute value or string
this scope ships is caught by any of those detectors.

The two claim-scan file-set extensions are **strengthenings, not supersessions**.
They add `rltaxclaimage.js` and `tax-rules/mortality/2026.json` to scanned sets
and remove no token, no clause and no assertion. This session's TP-03-05 revision
is also a strengthening for the same reason: it added a raw-scan clause for the
pre-existing files, added a derived comment-confinement clause and moved the
planted token into code. Nothing was deleted and no file left a scanned set.

No `SUP-024-NN` marker naming Scope 03 exists in `spec.md`, none exists in
`rltaxclaimage.js`, and the scope index records `| 03 | none | 0 |`.
TP-03-SUPERSESSION asserts all three, and it passes.

No ASC-8 in-flight admission was made.

## Change Boundary

Files this session created or modified — three:

| Path | Change |
| --- | --- |
| `rltaxclaimage.js` | `RESULT_KIND_STATEMENT` restated positively |
| `scripts/selftest.mjs` | TP-03-05 and TP-03-CLAIM source scans strengthened |
| `tests/lifetime-tax-claim-age.spec.mjs` | browser row asserts the delivered statement |

Working-tree status over the excluded **tracked** paths:

```
$ git status --short -- rlportfolio.js rlportfolioanalytics.js \
    portfolio-survival-allocation.config.json specs/008-portfolio-survival-and-brief-lab \
    tools.json index.html rlnav.js README.md notes/README.md market-brief.payload.json \
    briefs data watchlist.json site-exclusions.json scripts/build-pages-site.mjs
 M site-exclusions.json
exit: 0
```

`rlportfolio.js`, `rlportfolioanalytics.js`, `portfolio-survival-allocation.config.json`,
`specs/008-portfolio-survival-and-brief-lab/**`, `tools.json`, `index.html`,
`rlnav.js`, `README.md`, `notes/README.md`, `market-brief.*`, `briefs/**`,
`data/**`, `watchlist.json` and `scripts/build-pages-site.mjs` are all unmodified.

`site-exclusions.json` carries a working-tree diff, and it is **not this scope's**.
Its eight added entries are Feature 021's unregistered-route exclusions —
`rltaxrules.js`, `rltaxworkspace.js`, `rltax.js`, `rltaxstrategy.js`,
`rltaxstate.js`, `rltaxcombined.js`, `lifetime-tax-strategy-lab.html` and
`lifetime-tax-strategy.config.json`. No claim-age and no mortality entry appears
in it, so this scope added nothing to it.

**The unverifiable remainder, stated rather than glossed.** `tax-rules/federal/**`,
`rltaxsocialsecurity.js`, `rltaxinclusion.js`, the other `tests/lifetime-tax-*.spec.mjs`
files and the sibling spec folders are **untracked**, so there is no committed
baseline and byte-identity cannot be observed. The corresponding DoD row is left
unchecked for that reason. What can be said is narrower and is said instead: the
three files this session touched are listed above, and `tax-rules/federal/**` is
not among them.

## Claim Boundary

Scan over this scope's allowed paths, with comments stripped from JavaScript so
the scan reads code rather than prose about code:

```
$ node -e '<claim-boundary scan over allowed paths>'
exit: 0
sha256: 9bb49877d79610b710b5375da2443bc56b7ea4bee67a777f0209af3a438e0cb4
ALLOWED_PATH rltaxclaimage.js codeHits=0
ALLOWED_PATH tax-rules/mortality/2026.json codeHits=0
ALLOWED_PATH tax-rules/fixtures/mortality-nonstandard-2999.json codeHits=0
ALLOWED_PATH tests/lifetime-tax-claim-age.spec.mjs codeHits=8 ["probability","best","optimal","recommended","preferred"]
ALLOWED_PATH power-claim-age section codeHits=0
MORTALITY_FIGURE_COUNT=18
```

Every **product** surface is clean: the module's code, both packs and the
`power-claim-age` section carry no probability, plan-success, future-year, track-
record, error-rate or break-even token, and describe no claim age as optimal,
recommended, best or preferred.

The eight hits in the browser spec are the **absence assertions themselves**, and
each was read to confirm it:

```
$ grep -n "probability\|optimal\|recommended\|preferred\|best" tests/lifetime-tax-claim-age.spec.mjs
59:test('Regression: SCN-024-007 the claim-age panel renders identically across two loads and shows no probability column', async ({ page }) => {
84:  /* No probability, survivorship or hazard figure appears anywhere on the panel. The published
88:  expect(panelText).not.toMatch(/probability|survivor|hazard|chance of|odds/i);
179:test('Regression: SCN-024-009 the claim ages render in declared order with nothing marked best, optimal, recommended or preferred', async ({ page }) => {
193:  expect(panelText).not.toMatch(/\bbest\b|\boptimal\b|recommend|preferred|you should|winner|highest total/i);
```

Two test titles and two `not.toMatch` assertions. A test file is not an output,
and a test that asserts a word never reaches the panel must name the word.

## Scenario Evidence

### Scenario SCN-024-007

Green. `tests/lifetime-tax-claim-age.spec.mjs:59` —
`Regression: SCN-024-007 the claim-age panel renders identically across two loads and shows no probability column`
passed in the run recorded at [TP-03-25](#tp-03-25) (`✓ 1 … (2.0s)`). Unit
evidence for determinism is [TP-03-03](#tp-03-03), for the probability refusal
[TP-03-01](#tp-03-01) and [TP-03-02](#tp-03-02), and for the member enumeration
[TP-03-04](#tp-03-04).

### Scenario SCN-024-008

Green. `tests/lifetime-tax-claim-age.spec.mjs:97` —
`Regression: SCN-024-008 the cumulative totals and the equality age are shown with both claim ages named and the record's own arithmetic statement`
passed (`✓ 8 … (1.2s)`), and `:144` —
`Regression: SCN-024-008 an absent life-expectancy figure withholds the totals and the equality age while the per-age benefits still render`
passed (`✓ 12 … (1.2s)`). Unit evidence is [TP-03-07](#tp-03-07),
[TP-03-09](#tp-03-09) and [TP-03-11](#tp-03-11).

### Scenario SCN-024-009

Green. `tests/lifetime-tax-claim-age.spec.mjs:179` —
`Regression: SCN-024-009 the claim ages render in declared order with nothing marked best, optimal, recommended or preferred`
and the request-ledger row `Regression: SCN-024-009 the request ledger stays empty and no declared claim age reaches a URL`
both passed among the 51 tests recorded at [TP-03-25](#tp-03-25). Unit evidence
is [TP-03-13](#tp-03-13) and [TP-03-14](#tp-03-14).

## Test Evidence

The unit rows TP-03-01 through TP-03-19, plus TP-03-CLAIM, TP-03-SUPERSESSION and
TP-03-REGISTRATION, are assertions inside the one
`lifetime-tax — claim age comparison` group in `scripts/selftest.mjs` and all run
under the single command below. That run is the shared evidence for every unit
row; each row's own section names the assertion line that appeared in it.

```
# selftest-after-claim-fixes
$ node scripts/selftest.mjs
exit: 0
lines: 3152
sha256: 690ad6af7da2731e363d92280fffd9244ccca6e1c0e3f033293162d0cfa59597
...
  ✓ TP-03-CLAIM: neither the module, the mortality pack, the comparison record, the refusal nor the claim-age panel states a probability, a plan success figure, a track record, an error rate or a break-even, the detector is proven to fire on a sentence that does, and the record states its weaker equality claim positively rather than by word avoidance
  ✓ TP-03-SUPERSESSION: this scope carries no supersession marker and the scope index records none for it, and the two claim-scan file-set extensions are strengthenings that add files and remove nothing
  ✓ TP-03-REGISTRATION: the claim-age module and the lifetime tax lab remain absent from tools.json, the index, the navigation and both READMEs

================================================
Research-Lab self-test: 2786 passed, 0 failed
================================================
```

**Intended RED, stated honestly.** The scenario-first contract for this scope
names one intended-RED assertion: a fixture pack carrying a probability-bearing
member must be refused `RLTAX-PACK-INVALID` and produce no comparison. That RED
was **not observed by this session**, because the refusal already existed when
this session began. The RED this session *did* observe is different and narrower:
the two red assertions recorded under
[the ASC-9 naming decision](#the-two-red-assertions-this-session-fixed-and-which-side-was-changed),
which failed under `node scripts/selftest.mjs` at 2784 passed / 2 failed before
the fix and pass at 2786 / 0 after it, under the identical command. No
intended-RED claim is made for any other row.

### TP-03-01

Green. `✓ TP-03-01: the mortality policy refuses a probability-bearing and a
survivorship-count member with RLTAX-PACK-INVALID naming the member, and accepts
the shipped life-expectancy column whose own member name is never matched by a
substring rule` — in the run above, exit 0.

### TP-03-02

Green. `✓ TP-03-02: a fixture pack carrying a probability column beside its
life-expectancy column is refused and produces no comparison, and the identical
pack without that column resolves, so the refusal is caused by the column rather
than by a blanket rejection` — same run, exit 0.

### TP-03-03

Green. `✓ TP-03-03: two runs over identical declarations produce byte-identical
serialized records, a third run after an unrelated settlement produces the same
bytes again, and the module reads no clock and no random source` — same run,
exit 0.

### TP-03-04

Green. `✓ TP-03-04: an exhaustive enumeration of every member name in the
comparison record, at every depth, finds no probability, rank, score, success,
survival, recommendation, discount-rate or appreciation member; the enumeration
is proven non-vacuous by visiting more members than the record's top level and by
catching a planted member in a nested fixture` — same run, exit 0.

### TP-03-05

Green **after this session's fix**, which is recorded in full under
[the ASC-9 naming decision](#the-two-red-assertions-this-session-fixed-and-which-side-was-changed).

Before: `✗ FAIL: TP-03-05` at 2784 passed / 2 failed. Failing clause:
`scannedFiles26.every((entry) => !claimScan26.test(entry.text))` over the raw
source of `rltaxclaimage.js`.

After: `✓ TP-03-05: the claim scans now include rltaxclaimage.js and the mortality
pack, proven by planting a forbidden token in a copy of each and asserting it is
caught, every pre-existing scanned file still passes the raw scan unchanged, and
every raw hit in the new module is comment-borne prose naming the member its pack
refusal rejects rather than a term surviving in its code` — exit 0, 2786 passed.

### TP-03-06

Green. `✓ TP-03-06: the conversion comparison record's own forbidden-member check
is byte-untouched by this scope and carries none of this scope's identifiers,
proving an enumeration was added rather than an existing one extended` — same
run, exit 0.

### TP-03-07

Green. `✓ TP-03-07: against a fixture pack with deliberately non-standard
life-expectancy figures, each claim age's cumulative total equals the adjusted
annual benefit times the whole-year count from that claim age to the
life-expectancy age, asserted at three claim ages` — same run, exit 0.

### TP-03-08

Green. `✓ TP-03-08: an implementation using a recalled life-expectancy figure is
proven to produce a different total against the non-standard fixture, one
applying a discount or growth rate is proven to differ, and no discount, growth,
inflation or interpolation term exists anywhere in the module` — same run,
exit 0. This is the row that makes the [Sourcing](#sourcing) retrieval
load-bearing: the fixture's figures are round numbers no published table carries,
so an implementation reaching for a recalled table fails it.

### TP-03-09

Green. `✓ TP-03-09: the equality age is the age at which the two cumulative
totals are equal and is published with both claim ages named, the equality is
verified to hold from both sides, and a pair whose totals never cross withholds
the figure rather than reporting a bound` — same run, exit 0.

### TP-03-10

Green. `✓ TP-03-10: resultKindStatement and selectsNothingStatement are members
of the record rather than page copy, are non-empty, survive a serialization round
trip into the export, and the page renders them from the record rather than
restating them` — same run, exit 0. This row covers the statement text this
session rewrote.

### TP-03-11

Green. `✓ TP-03-11: an absent life-expectancy figure withholds the cumulative
total, the whole-year count and the equality age, the per-age adjusted benefit
still resolves, and no default horizon and no zero is substituted` — same run,
exit 0.

### TP-03-12

Green. `✓ TP-03-12: an implementation substituting a default horizon for an
absent life-expectancy figure is proven to fail this scope's own withholding
assertion, and no default-horizon constant exists in the module for one to reach
for` — same run, exit 0.

### TP-03-13

Green. `✓ TP-03-13: perAge[] appears in declared order for a declaration whose
order is not ascending by cumulative total, the two orders are proven to differ,
and no sort exists in the module or in the claim-age renderer` — same run,
exit 0.

### TP-03-14

Green. `✓ TP-03-14: an implementation sorting by cumulative total is proven to
produce a different order and fail, and one marking the largest total is proven
to be caught by the forbidden-member enumeration the real record passes` — same
run, exit 0.

### TP-03-15

Green. `✓ TP-03-15: the mortality pack's life-expectancy columns each resolve to
exactly one retrieved SSA source with a locator, a retrievedAt and the table's
own year of 2023, and the column identity this retrieval could not establish
ships as a value-free AbsentFigure with a missingSource pointer that reaches the
basis` — same run, exit 0. The retrieval it checks is the one recorded under
[Sourcing](#sourcing), performed in this session.

### TP-03-16

Green. `✓ TP-03-16: no module holds a life-expectancy figure, an exact age from
the table or an authority name, and the detector is proven to fire on a module
that does` — same run, exit 0.

### TP-03-17

Green. `✓ TP-03-17: the declared claim-age set and the declared mortality column
are inventoried workspace members that start empty and null, the declared storage
key count is asserted unchanged in the same assertion, and the module performs no
storage, network, DOM or console access` — same run, exit 0.

### TP-03-18

Green. `✓ TP-03-18: the new module is UMD rather than ESM, every pure analytic
function is a top-level declaration the selftest extractor lifts,
Number.isFinite is used rather than the bare global, and no drawing in this scope
is wrapped in requestAnimationFrame` — same run, exit 0.

### TP-03-19

Green. `✓ TP-03-19: the claim-age renderer reads only members the stage publishes
on both its available and unavailable shapes, is wired into renderPower, routes
its two new controls through the declaration-signature no-op guard, and renders
every displayed figure through the tooltip-bearing constructor` — same run,
exit 0.

### TP-03-20

Green, within the cumulative browser run recorded at [TP-03-25](#tp-03-25):
`✓ 1 [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:59:1 › Regression:
SCN-024-007 the claim-age panel renders identically across two loads and shows no
probability column (2.0s)`. The `--grep "SCN-02"` run is a superset of this row's
own `--grep` and selected it by the same persistent title.

### TP-03-21

Green, in the same run: `✓ 8 [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:97:1 ›
Regression: SCN-024-008 the cumulative totals and the equality age are shown with
both claim ages named and the record's own arithmetic statement (1.2s)`.

### TP-03-22

Green, in the same run: `✓ 12 [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:144:1 ›
Regression: SCN-024-008 an absent life-expectancy figure withholds the totals and
the equality age while the per-age benefits still render (1.2s)`.

### TP-03-23

Green, in the same run — `Regression: SCN-024-009 the claim ages render in
declared order with nothing marked best, optimal, recommended or preferred`, one
of the 51 tests that passed with zero failures.

### TP-03-24

Green, in the same run — `Regression: SCN-024-009 the request ledger stays empty
and no declared claim age reaches a URL`, one of the 51 tests that passed. The
mortality pack is now fetched from disk by the route, and it is admitted by
`declaredRouteAssets()`, which derives every permitted pack path from
`config.rules` via `declaredPackPaths()`; `mortalityPackPaths` in
`lifetime-tax-strategy.config.json` is that declaration. An undeclared pack path
would still fail this row.

### TP-03-25

Green. The cumulative browser suite over the real route, exactly as the Test Plan
names it:

```
# tp-03-25-broader-browser-regression
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome --grep SCN-02 --reporter=list
exit: 0
lines: 56
sha256: 2802c4f055dc7335c06aac8129073edef55383ffe421de6c0ef437dfb79a5fa4

Running 51 tests using 6 workers
...
  51 passed (16.6s)
```

The whole-directory form requested for validation was run separately and agrees:

```
# playwright-lifetime-tax
$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line
exit: 0
lines: 55
sha256: 0effa769fccb3c4b1603454251d2c5c0d389ef9e6e5c40e4c227ff9d8949e590
  51 passed (16.2s)
```

### TP-03-26

Green. `node scripts/selftest.mjs`, exit 0, **2786 passed, 0 failed**. The pass
count did not fall: it rose by two, which is exactly the two assertions this
session repaired, and no assertion was removed.

### TP-03-27

Green.

```
$ node scripts/validate-spec-test-paths.mjs
PATHS_EXIT=0
```

Zero new missing spec-referenced test paths.

### TP-03-28

Green.

```
$ node scripts/build-pages-site.mjs --dry-run
PAGES_EXIT=0
```

The Pages plan succeeds. `site-exclusions.json` was not changed by this scope —
see [Change Boundary](#change-boundary) — and `tax-rules/` remains outside the
public directories.

Artifact lint over the feature, run in the same session:

```
$ bash .github/bubbles/scripts/artifact-lint.sh specs/024-social-security-and-medicare
ARTIFACT_LINT_EXIT=0
```

