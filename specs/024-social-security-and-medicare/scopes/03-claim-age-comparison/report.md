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
and the request-ledger row, whose persistent title was
`Regression: SCN-024-009 the request ledger stays empty and no declared claim age reaches a URL`
at the time of this run and is now
`Regression: SCN-024-009 every request is a declared same-origin GET and no declared claim age reaches a URL`
(renamed 2026-08-22, F-REG-02 — see [TP-03-24](#tp-03-24)),
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

**Renamed 2026-08-22 (F-REG-02), and narrowed rather than restated.** This row's
persistent title was
`Regression: SCN-024-009 the request ledger stays empty and no declared claim age reaches a URL`
until this date. The ledger is never empty — the route issues same-origin
document reads and `<script src>` module loads at boot, and this very row then
requires the mortality pack to be among them. This row also holds **no**
`expect(ledger.length).toBe(afterFirstPaint)` and **no**
`expect(afterFirstPaint).toBeGreaterThan(0)`, so it cannot carry the
"does not grow after first paint" wording used on SCN-022-013 either. The title
now names what the body proves:
`requested.forEach((path) => expect(permitted).toContain(path))` — every request
is a same-origin read of a path the configuration declares — together with
`expect(entry.postData).toBe('')` and `expect(entry.method).toBe('GET')`, and the
absence of any declared claim age or mortality column from every URL. Adversarial
cases: a read of an undeclared path fails the membership loop; a non-GET request
or any request body fails the method and body pins; a declared claim age reaching
a URL fails the value scan. That this row does not constrain ledger growth is a
planning gap and is routed. The captured evidence below was recorded under the
superseded title and is left exactly as executed.

Green, in the same run — `Regression: SCN-024-009 the request ledger stays empty
and no declared claim age reaches a URL`, one of the 51 tests that passed. The
mortality pack is now fetched from disk by the route, and it is admitted by
`declaredRouteAssets()`, which derives every permitted pack path from
`config.rules` via `declaredPackPaths()`; `mortalityPackPaths` in
`lifetime-tax-strategy.config.json` is that declaration. An undeclared pack path
would still fail this row.

Fresh capture under the new persistent title, recorded 2026-08-22 after the
rename, proving the row's `--grep` still selects its own test — selected 1,
passed 1:

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-009 every request is a declared same-origin GET and no declared claim age reaches a URL" --reporter=line
exit: 0
lines: 5
sha256: be78e2eebdbbd2cfa14377a1b37fecbe327f4f1809d147d50f70fcc2f892291b

Running 1 test using 1 worker

[1/1] [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:201:1 › Regression: SCN-024-009 every request is a declared same-origin GET and no declared claim age reaches a URL
  1 passed (4.7s)
```

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

## Intended RED Evidence, Per Test Plan Row

**Method, stated before the evidence so it can be judged.** Every row below was
made to fail *on purpose* by applying one mutation that the row exists to catch,
running that row's own Test Plan command against the mutated tree, and reverting
the mutation inside the same shell command that ran it. Nothing was left behind:
each probe ends with `git checkout -- <path>` and a `git status --short` that
shows only the files a concurrent session owns. The GREEN half of each row is the
identical command against the reverted tree, recorded under
[Test Evidence](#test-evidence) above and re-run at the end of this section.

`git status --short` before the first probe showed the worktree clean of every
path this scope owns, at commit `33b663f20`, so any modification a probe
introduced is attributable to that probe.

**Baseline for every probe below.** `node scripts/selftest.mjs` at
`33b663f20` reports **2868 passed, 1 failed**. The one failure is
`no tests/*.mjs path named by a spec artifact is missing outside the frozen
baseline`, referenced from `specs/026-*` and owned by a concurrent session. It is
present in every capture below, before and after each mutation, and is not this
scope's. A probe's RED is therefore the delta *above* that one failure.

**Assertion independence.** `assert()` in `scripts/selftest.mjs` records a pass
or a failure and does not throw, so one mutation can turn several rows red at
once. Where that happened it is named on the row rather than hidden, and the row's
own named assertion is quoted from the capture.

### RED TP-03-01

**Mutation:** `rltaxrules.js` — the closed-shape refusal in
`validateMortalityPolicy` was deleted, so a member outside `MORTALITY_POLICY_KEYS`
is silently accepted:

```diff
-    refuseMembersOutsideShape(policy, MORTALITY_POLICY_KEYS, "RLTAX-PACK-INVALID", label, refusals);
+    /* RED PROBE TP-03-01 — closed-shape refusal removed. */
     var columns = Array.isArray(policy.columns) ? policy.columns : [];
```

This is exactly what the row exists to catch: with the refusal gone,
`deathProbabilityByAge` and `numberOfSurvivors` validate clean and a probability
enters a tool that states it publishes none.

```
# RED TP-03-01
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: b6a2e23ab55bf1565c6dcbb78ea73735a4a4be13ef23aad39c01baf6ffb12d3f
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-01: the mortality policy refuses a probability-bearing and a survivorship-count member with RLTAX-PACK-INVALID naming the member, and accepts the shipped life-expectancy column whose own member name is never matched by a substring rule
  ✗ FAIL: TP-03-02: a fixture pack carrying a probability column beside its life-expectancy column is refused and produces no comparison, and the identical pack without that column resolves, so the refusal is caused by the column rather than by a blanket rejection
  ✗ FAIL: TP-03-CLAIM: neither the module, the mortality pack, the comparison record, the refusal nor the claim-age panel states a probability, a plan success figure, a track record, an error rate or a break-even, the detector is proven to fire on a sentence that does, and the record states its weak
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2865 passed, 4 failed
================================================
```

**Collateral, disclosed.** TP-03-02 and TP-03-CLAIM also went red, because both
read the same refusal. That is a property of the refusal being load-bearing in
three places, not of the probe being imprecise; TP-03-02 gets its own independent
probe below.

**Revert:** `git checkout -- rltaxrules.js` → exit 0.
`git status --short` afterwards listed only `market-brief.config.json`,
`notes/market-brief.md`, `scripts/selftest.mjs` and
`scripts/validate-brief-payload.mjs` — all owned by the concurrent session — plus
that session's untracked files. No path this scope owns was modified.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → exit 1
(the one concurrent-session failure), **2868 passed, 1 failed**, with
`✓ TP-03-01` present. Recorded at [TP-03-01](#tp-03-01) and re-confirmed in the
[closing run](#closing-verification-run).

### RED TP-03-02

**Mutation:** `rltaxclaimage.js` — the early return that stops a comparison being
built from a pack refused `RLTAX-PACK-INVALID` was deleted, so the arithmetic
proceeds over a pack that was rejected:

```diff
-    if (rules.isUnavailable(basis) && basis.code === "RLTAX-PACK-INVALID") return basis;
+    /* RED PROBE TP-03-02 — the invalid-pack early return removed, so the arithmetic proceeds. */
     var perAge = [];
```

The refusal is still *recorded* — `basisRefusal` is still non-null — and the
comparison runs anyway. That is precisely the failure mode the row's wording
names: "refused **and produces no comparison**", not merely refused somewhere
while the arithmetic proceeds.

```
# RED TP-03-02
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: adaea75f65189f5cbee6bf0eb17d045d80cec2cd23e663c4763e494ac1598a01
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-02: a fixture pack carrying a probability column beside its life-expectancy column is refused and produces no comparison, and the identical pack without that column resolves, so the refusal is caused by the column rather than by a blanket rejection
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

This probe is **isolated**: exactly one row above the concurrent-session baseline
went red, so TP-03-02 is proven to fail on its own claim and not as collateral of
TP-03-01's probe.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; `git status --short`
showed no scope-owned path modified other than this `report.md`.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-02` present. Recorded at [TP-03-02](#tp-03-02).

### RED TP-03-03

**Mutation:** `rltaxclaimage.js` — a non-deterministic member was added to the
comparison record, which is the shape a clock read or a random source takes when
one gets into an otherwise pure module:

```diff
     var comparison = Object.freeze({
       contractVersion: COMPARISON_CONTRACT,
+      /* RED PROBE TP-03-03 — a non-deterministic member. */
+      runNonce: Math.random(),
       claimAges: Object.freeze(claimAges.slice()),
```

```
# RED TP-03-03
$ node scripts/selftest.mjs
exit: 1
lines: 3227
sha256: ae02e230c63d4c7237689a3fa5eaf6545897001e4c2d1ac2b81b5ac69c461f1b
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-03: two runs over identical declarations produce byte-identical serialized records, a third run after an unrelated settlement produces the same bytes again, and the module reads no clock and no random source
  ✗ FAIL: TP-03-04: an exhaustive enumeration of every member name in the comparison record, at every depth, finds no probability, rank, score, success, survival, recommendation, discount-rate or appreciation member; the enumeration is proven non-vacuous by visiting more members than the record’s to
  ✗ FAIL: TP-03-07: against a fixture pack with deliberately non-standard life-expectancy figures, each claim age’s cumulative total equals the adjusted annual benefit times the whole-year count from that claim age to the life-expectancy age, asserted at three claim ages
  ✗ FAIL (Feature 024 Scope 03 claim-age group threw): Cannot read properties of undefined (reading 'filter')
--- omitted 3187 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2850 passed, 5 failed
================================================
```

**Collateral, disclosed, and what it proves.** This probe is the loudest of the
set, and the noise is itself a finding worth recording rather than trimming away:
`validateClaimAgeComparison` in `rltaxrules.js` refuses a member outside the
declared `ClaimAgeComparison/v1` shape, so `runNonce` did not merely make the
record vary — it made the record a **refusal**. Every later row in the group that
reads `settled26.perAge` therefore lost its record and the group threw at the
first `.filter` on it. The closed record shape and the determinism assertion are
independent defences and this probe tripped both at once. TP-03-03's own named
assertion is quoted red above, which is what this row required; TP-03-04 and
TP-03-07 each get their own isolated probe below.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0. A `git status --short`
scoped to this scope's owned and adjacent paths — `rltaxclaimage.js`,
`rltaxrules.js`, `rltax.js`, `rltaxworkspace.js`,
`lifetime-tax-strategy-lab.html`, `tax-rules/`, `tests/` — listed only the two
untracked `tests/company-intelligence*` files the concurrent session owns.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-03` present. Recorded at [TP-03-03](#tp-03-03).

### RED TP-03-04

**Mutation:** `rltaxclaimage.js` — a forbidden member was planted on every
`perAge[]` entry, one level *below* the record's top-level shape check:

```diff
       perAge.push(Object.freeze({
         claimAge: claimAge,
+        /* RED PROBE TP-03-04 — a forbidden member nested below the top-level shape check. */
+        rankWithinDeclaration: index,
         adjustedAnnualBenefit: settlement.value,
```

The placement is the point. `validateClaimAgeComparison` calls
`refuseMembersOutsideShape` on the **record** only; it never shape-checks a
`perAge[]` entry. A ranking member planted there therefore passes the contract
cleanly, and the only thing standing between it and the export is this row's
exhaustive at-every-depth enumeration. The probe proves the enumeration reaches
depth rather than restating the top-level shape check.

```
# RED TP-03-04
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: a6dbe84ab13a2839d704b608b8bf3671dabe7f47d4879090a496630a576e0226
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-04: an exhaustive enumeration of every member name in the comparison record, at every depth, finds no probability, rank, score, success, survival, recommendation, discount-rate or appreciation member; the enumeration is proven non-vacuous by visiting more members than the record’s to
  ✗ FAIL: TP-03-14: an implementation sorting by cumulative total is proven to produce a different order and fail, and one marking the largest total is proven to be caught by the forbidden-member enumeration the real record passes
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2866 passed, 3 failed
================================================
```

**Collateral, disclosed.** TP-03-14 went red on its own third clause —
`enumerateMembers26(unsorted26, []).every((name) => !forbiddenMembers26.test(name))`
— which is the clause asserting the *real* record carries no marking member. That
is a genuine, on-claim RED for TP-03-14's marking half; TP-03-14 nonetheless gets
its own independent probe below for its sorting half.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; the scoped
`git status --short` over `rltaxclaimage.js`, `rltaxrules.js`, `rltax.js`,
`rltaxworkspace.js`, `lifetime-tax-strategy-lab.html` and `tax-rules/` printed
nothing at exit 0 — no tracked path this scope owns was left modified.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-04` present. Recorded at [TP-03-04](#tp-03-04).

### RED TP-03-05

**Mutation:** `rltaxclaimage.js` — a forbidden claim token was planted as
**code** rather than as prose, so it survives the comment stripper the assertion
runs before scanning:

```diff
   var POLICY_CONTRACT = "MortalityPolicy/v1";
+  var RED_PROBE_TP_03_05 = "the break-even age you are likely to reach";
```

This is the exact leak the file-set extension exists to catch, and it is the one
a listing-only extension would miss. The row does not merely assert that
`rltaxclaimage.js` appears in `scannedFiles26`; it asserts the scan **fires** on
a token in that file's stripped code. A string literal is the hiding place a
comment-stripping scan would otherwise create, which is why the plant is a
literal rather than a comment.

```
# RED TP-03-05
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 2ad6184a4111ed070cfa7af887f460d0e2782534a3fef0a7c9892fb1c477fc9d
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-05: the claim scans now include rltaxclaimage.js and the mortality pack, proven by planting a forbidden token in a copy of each and asserting it is caught, every pre-existing scanned file still passes the raw scan unchanged, and every raw hit in the new module is comment-borne prose 
  ✗ FAIL: TP-03-CLAIM: neither the module, the mortality pack, the comparison record, the refusal nor the claim-age panel states a probability, a plan success figure, a track record, an error rate or a break-even, the detector is proven to fire on a sentence that does, and the record states its weak
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2866 passed, 3 failed
================================================
```

**Collateral, disclosed.** TP-03-CLAIM went red on the same planted literal,
which is correct — it scans the same stripped code for the same tokens. Two
independent detectors caught one leak.

**Relationship to the RED already on record.** The
[ASC-9 section](#the-two-red-assertions-this-session-fixed-and-which-side-was-changed)
records a *naturally occurring* TP-03-05 RED at 2784 / 2, found during
implementation. This probe is the deliberate confirmation that the detector is
still load-bearing at `33b663f20`, on a token planted where the stripper cannot
excuse it.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; the scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-05` present. Recorded at [TP-03-05](#tp-03-05).

### RED TP-03-06

**Excluded-path disclosure, stated before the evidence.** This row's entire claim
is a property *of* `tests/lifetime-tax-conversion.spec.mjs`, which this scope's
[Change Boundary](#change-boundary) lists as must-remain-byte-identical. There is
no way to prove the row can fail without touching that file: a probe applied
anywhere else would be testing something the row does not assert. The mutation was
therefore applied to that excluded file, reverted inside the same shell command
that ran the test, and the revert was verified two ways — a scoped
`git status --short` and a `git diff --stat` against `33b663f20`, both empty at
exit 0. The file is byte-identical to its committed state.

**Mutation:** `tests/lifetime-tax-conversion.spec.mjs` — one of this scope's own
identifiers reaching into the pre-existing conversion check:

```diff
 const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
+/* RED PROBE TP-03-06 — Scope 03's enumerateMembers26 identifier reaching into this file. */
 const conversionRequire = createRequire(import.meta.url);
```

This is the shape the row exists to catch: an implementer who "reuses" the
conversion record's enumeration by extending it rather than adding a separate one
leaves exactly this trace.

```
# RED TP-03-06
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 5be98e7f08ba06b545656ab8ef683b525f489bf479f1b8fbb130891af9be78a6
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-06: the conversion comparison record’s own forbidden-member check is byte-untouched by this scope and carries none of this scope’s identifiers, proving an enumeration was added rather than an existing one extended
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

Isolated: exactly one row above the concurrent-session baseline.

**Revert and byte-identity proof:**

```
$ git checkout -- tests/lifetime-tax-conversion.spec.mjs
REVERT_EXIT=0
$ git status --short -- tests/lifetime-tax-conversion.spec.mjs rltaxclaimage.js rltaxrules.js rltax.js rltaxworkspace.js lifetime-tax-strategy-lab.html tax-rules
SCOPE_PATHS_STATUS_EXIT=0
$ git --no-pager diff --stat 33b663f20 -- tests/lifetime-tax-conversion.spec.mjs
EXCLUDED_DIFF_EXIT=0
```

Both status and diff printed no lines before their exit-code echo; the empty
region is the result, not a truncation.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-06` present. Recorded at [TP-03-06](#tp-03-06).

### RED TP-03-07

**A first probe that did NOT go red, recorded because it is a finding.** The
first mutation tried was `Math.floor(terminalAge)` → `Math.ceil(terminalAge)`,
which looks like a plausible whole-year defect. It produced **2868 passed, 1
failed** — the untouched baseline — under
sha256 `fcd9ffcbd4b3187b254bf7765ada6ea5ab873d47ee3e2dc2460b7fa56bedb0ca`. The
reason is that the fixture pack's life-expectancy figures are whole numbers, so
`terminalAge` is an integer and `ceil` and `floor` agree exactly. That is not a
weakness in TP-03-07 — the row asserts a product over a whole-year count, and a
rounding direction that cannot change an integer has not changed the behaviour
the row is about. It is recorded here rather than discarded because a reader
comparing probe counts would otherwise find an unexplained gap, and because it
documents a real property of the fixture: **the fixture cannot exercise
fractional-year rounding, and no row in this scope claims that it does.**

**Mutation that did go red:** `rltaxclaimage.js` — an off-by-one that counts the
claim year twice:

```diff
     var terminalAge = claimAge + remainingYears;
-    var wholeYears = Math.floor(terminalAge) - claimAge;
+    /* RED PROBE TP-03-07 — off-by-one: the claim year counted twice. */
+    var wholeYears = Math.floor(terminalAge) - claimAge + 1;
```

```
# RED TP-03-07 (off-by-one)
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 06cc1bc196e4d93641eb589105c29ca37f8e865a58a73ba36364b51b1cf08b8f
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-07: against a fixture pack with deliberately non-standard life-expectancy figures, each claim age’s cumulative total equals the adjusted annual benefit times the whole-year count from that claim age to the life-expectancy age, asserted at three claim ages
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

Isolated: exactly one row above the concurrent-session baseline. The row pins the
count at all three claim ages — 30, 25 and 22 — so a uniform off-by-one cannot
slip past by matching at one age and not another.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-07` present. Recorded at [TP-03-07](#tp-03-07).

### RED TP-03-08

**Mutation:** `rltaxclaimage.js` — a 3% discount rate applied to the sum, which
is the single most likely way an implementer turns a count of declared dollars
into a present value nobody asked for:

```diff
     var terminalAge = claimAge + remainingYears;
     var wholeYears = Math.floor(terminalAge) - claimAge;
+    /* RED PROBE TP-03-08 — a discount rate applied to the sum. */
+    var discountFactor = (1 - Math.pow(1.03, -wholeYears)) / 0.03;
...
-      cumulativeTotal: adjustedAnnualBenefit * wholeYears
+      cumulativeTotal: Math.round(adjustedAnnualBenefit * discountFactor)
```

```
# RED TP-03-08
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 318d25379cc4fc02577b9a9cb43953ed6fe0c74e8806bd5ff1dfb64f45ac86d0
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-07: against a fixture pack with deliberately non-standard life-expectancy figures, each claim age’s cumulative total equals the adjusted annual benefit times the whole-year count from that claim age to the life-expectancy age, asserted at three claim ages
  ✗ FAIL: TP-03-08: an implementation using a recalled life-expectancy figure is proven to produce a different total against the non-standard fixture, one applying a discount or growth rate is proven to differ, and no discount, growth, inflation or interpolation term exists anywhere in the module
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2866 passed, 3 failed
================================================
```

**Collateral, disclosed, and load-bearing.** TP-03-07 also went red, and the pair
is the point: TP-03-07 catches the *arithmetic* changing and TP-03-08 catches the
*term* appearing. This probe trips both because it does both — it introduces
`Math.pow`, the word `discount`, and a different total. Either detector alone
would have caught it; the row's value is that the term scan also catches a
discount applied under a name that produces a coincidentally-equal total.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-08` present. Recorded at [TP-03-08](#tp-03-08).

### RED TP-03-09

**Mutation:** `rltaxclaimage.js` — the never-meet branch made to report a bound
and claim the sums met, instead of withholding:

```diff
     if (!(laterAnnual > earlierAnnual)) {
       return Object.freeze({
         earlierClaimAge: earlierClaimAge,
         laterClaimAge: laterClaimAge,
-        equalityAge: null,
-        sumsMeet: false,
-        withheldReason: "The later claim age's annual amount is not larger ..."
+        /* RED PROBE TP-03-09 — a bound reported in place of an equality that does not exist. */
+        equalityAge: laterClaimAge,
+        sumsMeet: true,
+        withheldReason: null
       });
     }
```

This is the exact substitution the row's own comment forbids: "reporting a bound
in place of an equality would answer a question that has no answer". The bound
chosen is `laterClaimAge`, a real number the reader would have no way to
distinguish from a computed equality age.

```
# RED TP-03-09
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 6c4fef976962e21a62f2a978dbd1bf23ab3b02ff4c9d9cc65f1ad0d11c2aae67
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-09: the equality age is the age at which the two cumulative totals are equal and is published with both claim ages named, the equality is verified to hold from both sides, and a pair whose totals never cross withholds the figure rather than reporting a bound
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

Isolated: exactly one row above the concurrent-session baseline.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-09` present. Recorded at [TP-03-09](#tp-03-09).

### RED TP-03-10

**Mutation:** `lifetime-tax-strategy-lab.html` — the page made to restate the
record's selects-nothing sentence as its own copy instead of rendering it from
the record:

```diff
                 byId("claimAgeResultKindLine").textContent = comparison.resultKindStatement;
-                byId("claimAgeSelectsNothingLine").textContent = comparison.selectsNothingStatement;
+                /* RED PROBE TP-03-10 — the page restating the record's words as its own copy. */
+                byId("claimAgeSelectsNothingLine").textContent = "This comparison selects nothing. …";
```

The mutation is deliberately *visually identical* — the page still shows the same
sentence to the reader. What changes is that the sentence no longer travels with
the record. An export would arrive without its framing, which is the whole reason
the row insists the statements are record members rather than page copy. A
screenshot-based check could never catch this; the row catches it two ways, by
requiring the render to read `comparison.selectsNothingStatement` and by
requiring the page source *not* to contain the statement text.

```
# RED TP-03-10
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 05afb6579b4945a7c57bab514303bc5e10a986b6f0516f936a039d3544c32dcc
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-10: resultKindStatement and selectsNothingStatement are members of the record rather than page copy, are non-empty, survive a serialization round trip into the export, and the page renders them from the record rather than restating them
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

Isolated: exactly one row above the concurrent-session baseline.

**Revert:** `git checkout -- lifetime-tax-strategy-lab.html` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-10` present. Recorded at [TP-03-10](#tp-03-10).

### RED TP-03-11

**Mutation:** `rltaxclaimage.js` — a 20-year default horizon substituted for the
absent life-expectancy figure, so the total is manufactured instead of withheld:

```diff
         var remaining = remainingYearsAt(basis, claimAge);
         if (rules.isUnavailable(remaining)) {
-          withheld = remaining;
+          /* RED PROBE TP-03-11 — a default horizon substituted for the absent figure. */
+          totalRecord = cumulativeBenefitTotal(settlement.value, claimAge, 20);
         } else {
```

```
# RED TP-03-11
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 7413948b6ecaf55b02d1da7f1c139b7135d79a6dc1d48473eb580e5787caea96
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-11: an absent life-expectancy figure withholds the cumulative total, the whole-year count and the equality age, the per-age adjusted benefit still resolves, and no default horizon and no zero is substituted
  ✗ FAIL: TP-03-12: an implementation substituting a default horizon for an absent life-expectancy figure is proven to fail this scope’s own withholding assertion, and no default-horizon constant exists in the module for one to reach for
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2866 passed, 3 failed
================================================
```

**Collateral that is not collateral.** TP-03-12 went red on the same probe, and
that is the row working as designed rather than noise: TP-03-12's first clause is
literally "an implementation substituting a default horizon … is proven to fail
this scope's own withholding assertion". This probe *is* that implementation, so
its failure is TP-03-12's own on-claim RED. TP-03-12's second clause — the
named-constant scan — gets its own separate probe immediately below, because a
substitution written inline (as here) does not exercise it.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-11` present. Recorded at [TP-03-11](#tp-03-11).

### RED TP-03-12

TP-03-12 already has an on-claim RED from the
[TP-03-11 probe](#red-tp-03-11) — that probe *is* the substituting implementation
the row's first clause says is proven to fail. This second probe exercises the
row's other clause, the named-constant scan, which an inline substitution does not
reach.

**Mutation:** `rltaxclaimage.js` — a named horizon constant declared at module
scope, which is the artefact the scan exists to find even when nothing yet uses
it:

```diff
   var MONTHS_PER_YEAR = 12;
+  /* RED PROBE TP-03-12 — a named horizon constant a substitution could reach for. */
+  var DEFAULT_HORIZON = 20;
```

The constant is deliberately **unused**. That is the case the scan is for: the
behaviour is still correct, every withholding assertion still passes, and only the
scan notices that the module now carries a horizon for some future edit to reach
for. A behaviour-only row would have stayed green here.

```
# RED TP-03-12
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: e169e7d50c4896a32053e4eca0d96511451566483c91cce10b37060e62f15080
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-12: an implementation substituting a default horizon for an absent life-expectancy figure is proven to fail this scope’s own withholding assertion, and no default-horizon constant exists in the module for one to reach for
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

Isolated: exactly one row above the concurrent-session baseline, and notably
TP-03-11 stayed **green** — confirming the two clauses are independent and that
this probe hit the scan rather than the behaviour.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-12` present. Recorded at [TP-03-12](#tp-03-12).

### RED TP-03-13

**A first probe that went red on the wrong line, recorded because it is a
finding about the design.** The obvious mutation — an in-place
`perAge.sort((l, r) => l.cumulativeTotal - r.cumulativeTotal)` before the record
is frozen — produced **2854 passed, 4 failed** under sha256
`c78daa2c3d643e3d526e55ca79fe861eb4c700678857a9f37fd20f4c14049ac6`, and the
group **threw** rather than reaching TP-03-13's own assertion. The cause is
worth recording: `validateClaimAgeComparison` in `rltaxrules.js` already refuses
a `perAge[]` whose entries do not match `claimAges[]` positionally, so a real
sort turns the record into a refusal, and every later row that reads
`settled26.perAge` lost its record and threw at the first `.filter`.

That means the declared-order guarantee has **two independent defences and the
contract fires first**. It also means the order half of TP-03-13 cannot be
observed failing on its own line while the contract stands — an honest limit,
stated rather than papered over. The order half is nonetheless proven live: the
contract refusal above is exactly a sorted `perAge[]` being rejected.

**Mutation that put TP-03-13's own line red:** a sort *present in the module* that
leaves `perAge` order intact, so the contract stays satisfied and only this row's
sort scan fires:

```diff
     var parityAges = [];
+    /* RED PROBE TP-03-13 — a sort present in the module, leaving perAge order intact. */
+    var largestFirst = perAge.slice().sort(function (left, right) {
+      return right.cumulativeTotal - left.cumulativeTotal;
+    });
+    if (largestFirst.length < 0) return null;
```

This is the more valuable of the two probes, because it is the case the contract
**cannot** catch: a ranking that exists in the module and has not been wired into
the output yet. `!/\.sort\(/.test(claimAgeSource26)` is the only thing standing
between that and a later edit reading `largestFirst`.

```
# RED TP-03-13 (sort present, order intact)
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 8a572f54a100625c5d4bc69561382436b8db29c8eb8ada4aa891b4d75a5e3ac6
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-13: perAge[] appears in declared order for a declaration whose order is not ascending by cumulative total, the two orders are proven to differ, and no sort exists in the module or in the claim-age renderer
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

Isolated: exactly one row above the concurrent-session baseline, and the record
itself stayed valid — confirming the scan caught what the contract could not.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-13` present. Recorded at [TP-03-13](#tp-03-13).

### RED TP-03-14

**Mutation:** `rltaxclaimage.js` — the largest cumulative total marked as the
best outcome, which is the row's own wording made real:

```diff
     var parityAges = [];
+    /* RED PROBE TP-03-14 — the largest cumulative total marked as the best outcome. */
+    var largest = null;
+    for (index = 0; index < perAge.length; index += 1) {
+      if (largest === null || perAge[index].cumulativeTotal > largest.cumulativeTotal) {
+        largest = perAge[index];
+      }
+    }
+    for (index = 0; index < perAge.length; index += 1) {
+      perAge[index] = Object.freeze(Object.assign({}, perAge[index],
+        { isBestOutcome: perAge[index] === largest }));
+    }
```

The marking preserves declared order exactly — the record still passes
`validateClaimAgeComparison`, so the positional contract stays green. The only
thing that catches it is the forbidden-member enumeration. This closes the gap
the [TP-03-13 probe](#red-tp-03-13) opened: a ranking that does not reorder
anything is invisible to the order contract and visible only here.

```
# RED TP-03-14
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 567f101a6b18ff16d733039d18964ee742de02864d4787ac5f055564987759fa
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-04: an exhaustive enumeration of every member name in the comparison record, at every depth, finds no probability, rank, score, success, survival, recommendation, discount-rate or appreciation member; the enumeration is proven non-vacuous by visiting more members than the record’s to
  ✗ FAIL: TP-03-14: an implementation sorting by cumulative total is proven to produce a different order and fail, and one marking the largest total is proven to be caught by the forbidden-member enumeration the real record passes
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2866 passed, 3 failed
================================================
```

**Collateral, disclosed.** TP-03-04 went red on the same marking member, as it
should — the two rows share the enumeration, TP-03-04 asserting it is exhaustive
and TP-03-14 asserting it catches this specific adversarial shape. TP-03-04 has
its own independent probe above.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-14` present. Recorded at [TP-03-14](#tp-03-14).

### RED TP-03-15

**This probe found a real defect. TP-03-15 was structurally unfalsifiable, and
this session fixed it.** The finding is recorded first because it is the most
important thing in this section.

**How it surfaced.** The mutation was applied to `tax-rules/mortality/2026.json`
— the retrieved record's `retrievedAt` malformed so it can no longer match the
row's own `/^\d{4}-\d{2}-\d{2}$/`:

```diff
       "url": "https://www.ssa.gov/oact/STATS/table4c6.html",
-      "retrievedAt": "2026-08-18",
+      "retrievedAt": "sometime in 2026",
       "editionYear": 2023,
```

That directly violates a clause the row states in its own message. The run came
back **2868 passed, 1 failed** — the untouched baseline — under sha256
`c6b75901b8ef1fca0c247eecaf5250300f6e11e81fbb2bb253d48b1d312eed42`. TP-03-15
stayed green while the thing it asserts was false.

**Root cause.** `&&` binds tighter than `||` in JavaScript, and the assertion's
last two clauses were written unparenthesised:

```js
    && shippedBasis26.unlabelledColumns === MORTALITY26.mortalityPolicy.columnLabels
      || JSON.stringify(shippedBasis26.unlabelledColumns) === JSON.stringify(absentLabels26),
```

So the expression parsed as `(every clause above) || (that deep equality)`. The
deep equality is **unconditionally true** — `resolveMortalityBasis` assigns
`unlabelledColumns: policy.columnLabels`, the same object — so the right operand
alone satisfied the assertion and every clause to its left became decorative. The
row could not fail for any pack content whatsoever: a missing locator, a wrong
table year, a non-SSA URL, a numeric member smuggled onto the absence, or the
malformed `retrievedAt` above.

**The fix, and why it is a strengthening rather than a supersession.** The two
clauses were parenthesised into the one clause the surrounding comment already
described:

```diff
-    && shippedBasis26.unlabelledColumns === MORTALITY26.mortalityPolicy.columnLabels
-      || JSON.stringify(shippedBasis26.unlabelledColumns) === JSON.stringify(absentLabels26),
+    && (shippedBasis26.unlabelledColumns === MORTALITY26.mortalityPolicy.columnLabels
+      || JSON.stringify(shippedBasis26.unlabelledColumns) === JSON.stringify(absentLabels26)),
```

No clause was removed, no token was un-forbidden, no tolerance was widened and no
assertion was deleted. The identity-or-deep-equality disjunction the author wrote
is preserved exactly; it is merely scoped to itself instead of swallowing the
whole conjunction. The change can only cause **more** refusals, never fewer,
which is the same test the two claim-scan file-set extensions were judged under
in [Supersession Ledger](#supersession-ledger). It therefore needs no `SUP-024-NN`
marker and no ledger row, and this scope still owns no supersession.

**The strengthening does not cost a pass.** On the clean tree with the
parentheses in place, `node scripts/selftest.mjs` → **2868 passed, 1 failed**,
sha256 `ec1aace90510f67fad2ff70c406374b5ed5eb7b78823c876bc47d2af26784097` —
identical to the baseline. TP-03-15 was passing before and passes now; what
changed is that it can now fail.

**RED, same mutation, against the strengthened assertion:**

```
# RED TP-03-15 (against the strengthened assertion)
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: a96af403d59b31fe5f39516a39dc3318c99ce71f60ff04dea747dbc8e2cdeb30
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-15: the mortality pack’s life-expectancy columns each resolve to exactly one retrieved SSA source with a locator, a retrievedAt and the table’s own year of 2023, and the column identity this retrieval could not establish ships as a value-free AbsentFigure with a missingSource pointer
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

Isolated: exactly one row above the concurrent-session baseline.

**Pack revert and byte-identity proof.** The mortality pack is a sourced
artefact, so its restoration is proven rather than asserted:

```
$ git checkout -- tax-rules/mortality/2026.json
REVERT_EXIT=0
$ git status --short -- tax-rules
TAXRULES_STATUS_EXIT=0
$ git --no-pager diff --stat 33b663f20 -- tax-rules
TAXRULES_DIFF_EXIT=0
```

Both printed no lines before their exit-code echo. Every pack under `tax-rules/`
— including `tax-rules/federal/**`, which no probe in this section ever touched —
is byte-identical to `33b663f20`. No sourced figure was edited by any probe; the
only field a probe ever changed in a pack was this retrieval timestamp, and it is
restored.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-15` present.

### RED TP-03-16

**Mutation:** `rltaxclaimage.js` — a life-expectancy figure from the published
table transcribed into the module, which is exactly the shadow copy the row
forbids:

```diff
   var MONTHS_PER_YEAR = 12;
+  /* RED PROBE TP-03-16 — a table figure transcribed into the module. */
+  var REMAINING_AT_SIXTY_TWO = 20.29;
```

Like the [TP-03-12 constant probe](#red-tp-03-12) this plant is **unused**, and
for the same reason: the harm of a shadowed figure is not that it is read today
but that a figure which moves becomes a code edit instead of a pack edit. Every
arithmetic assertion in the scope stays green here; only the shadow scan notices.

```
# RED TP-03-16
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: b52e495eb968f29c7a6685aa129b69d548a63b08a3e99a06c4d501162f7b2145
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-16: no module holds a life-expectancy figure, an exact age from the table or an authority name, and the detector is proven to fire on a module that does
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

Isolated: exactly one row above the concurrent-session baseline.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-16` present. Recorded at [TP-03-16](#tp-03-16).

### RED TP-03-17

**Mutation:** `rltaxworkspace.js` — the declared claim-age set removed from
`WORKSPACE_FIELDS`, the inventory that drives clearing, redaction and the export
sanitizer:

```diff
-    "benefitStatementPrimaryInsuranceAmount", "claimAgeComparisonAges",
+    "benefitStatementPrimaryInsuranceAmount",
+    /* RED PROBE TP-03-17 — the declared claim-age set dropped from the inventory. */
```

A claim age discloses an intention, so an uninventoried one is a household value
that clearing does not clear and the sanitizer does not strip.

```
# RED TP-03-17
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 23281fe49ae1bb9718d4fd4a00f25429d424823cda7c9a82f6e5a545c5f796f4
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-01-08: clearing private data removes exactly the three declared keys, leaves a portfolio-prefixed key untouched, and a foreign key write is refused
  ✗ FAIL: TP-05-08: the written storage key set is unchanged from Scope 01, clear-all removes exactly those three keys while leaving a portfolio-prefixed key standing, and the page itself writes only the display-mode key directly
  ✗ FAIL: TP-03-15: the workspace refuses a malformed residency jurisdiction and an unknown residency pattern, and an empty workspace declares neither rather than defaulting either
  ✗ FAIL: TP-03-17: the declared claim-age set and the declared mortality column are inventoried workspace members that start empty and null, the declared storage key count is asserted unchanged in the same assertion, and the module performs no storage, network, DOM or console access
  ✗ FAIL: TP-04-21: the lookback declaration and the year it belongs to are inventoried workspace members that start undeclared, are named by the unavailable-domain report while undeclared, are omitted by the export sanitizer and named in omittedFields, the declared amount reaches storage and is the
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2863 passed, 6 failed
================================================
```

**Collateral, disclosed, and the most informative in the set.** Four rows from
*other features* went red — `TP-01-08`, `TP-05-08`, a different feature's
`TP-03-15`, and `TP-04-21`. They are not this scope's rows and their IDs collide
with this scope's numbering only by coincidence; they belong to the privacy
inventory that Features 021-024 share. Their failure is the point: the workspace
inventory is a genuinely shared surface, and dropping one member from it is
detected by every feature that depends on it, not only by the feature that added
it. That is the [Shared Infrastructure Impact Sweep](#change-boundary) row for
`rltaxworkspace.js` demonstrated rather than asserted.

**Revert:** `git checkout -- rltaxworkspace.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-17` present, and all four neighbouring rows green
again. Recorded at [TP-03-17](#tp-03-17).

### RED TP-03-18

**Mutation:** `rltaxclaimage.js` — the bare `isFinite` global substituted for
`Number.isFinite` in the whole-age guard:

```diff
   function isWholeAge(candidate) {
-    return Number.isFinite(candidate) && Math.floor(candidate) === candidate && candidate > 0;
+    /* RED PROBE TP-03-18 — the bare global instead of Number.isFinite. */
+    return isFinite(candidate) && Math.floor(candidate) === candidate && candidate > 0;
   }
```

The bare global coerces its argument, so `isFinite("62")` is `true` where
`Number.isFinite("62")` is `false`. Every existing test still passes on the
numeric inputs the fixtures use — the defect only shows on a string, which is
why the row asserts the *form* rather than waiting for a value to expose it.

```
# RED TP-03-18
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: fc7ceb0f963cc9c7046f07397d2b7d5d8151a50ca5e7f8a8f572467210624f8f
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-18: the new module is UMD rather than ESM, every pure analytic function is a top-level declaration the selftest extractor lifts, Number.isFinite is used rather than the bare global, and no drawing in this scope is wrapped in requestAnimationFrame
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2867 passed, 2 failed
================================================
```

Isolated: exactly one row above the concurrent-session baseline — confirming that
no behavioural assertion in the scope would have caught this on its own.

**Revert:** `git checkout -- rltaxclaimage.js` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-18` present. Recorded at [TP-03-18](#tp-03-18).

### RED TP-03-19

**Mutation:** `lifetime-tax-strategy-lab.html` — the mortality-column control
removed from `DECLARATION_INPUTS`, the one list the boot wiring reads to bind
controls through the declaration-signature no-op guard:

```diff
-                "inputClaimAgeComparisonAges", "inputMortalityColumn"];
+                "inputClaimAgeComparisonAges"];
```

An unregistered control still works — the user can still change the column — but
it no longer routes through the guard, so a re-render with an unchanged signature
would perform a DOM replacement it should have skipped.

```
# RED TP-03-19
$ node scripts/selftest.mjs
exit: 1
lines: 3241
sha256: 65d065e76f938f71f40f51f90ccbe270ef006200f391f51d1b4bf716c1f8ba16
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-03-19: the claim-age renderer reads only members the stage publishes on both its available and unavailable shapes, is wired into renderPower, routes its two new controls through the declaration-signature no-op guard, and renders every displayed figure through the tooltip-bearing constru
  ✗ FAIL: TP-05-12: the edit path returns before collecting, persisting or rendering when the declaration signature is unchanged, both event bindings route through that guarded handler from the one registered control list, every control this feature added is registered by membership, and the signatu
--- omitted 3201 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 2866 passed, 3 failed
================================================
```

**Collateral, disclosed.** Scope 05's `TP-05-12` went red on the same removal.
That is the shared control-list invariant working: Scope 05 asserts that *every*
control the feature added is registered by membership, so it catches a
deregistration in any scope, not only its own. This also re-confirms the
`SUP-024-12` supersession recorded in the group — the replacement membership
check catches a **removed** id, which is exactly the property the superseded
end-anchored regex was replaced to preserve.

**Revert:** `git checkout -- lifetime-tax-strategy-lab.html` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** `node scripts/selftest.mjs` → **2868
passed, 1 failed**, `✓ TP-03-19` present. Recorded at [TP-03-19](#tp-03-19).

### RED TP-03-20

The five browser rows below were each probed with their **own** Test Plan command
— the exact `--grep` on the row's persistent title — rather than with the
cumulative run, so each row's RED is attributable to that row alone.

**Mutation:** `lifetime-tax-strategy-lab.html` — a survival probability rendered
into every claim-age row:

```diff
                     row.appendChild(totalCell);
+                    /* RED PROBE TP-03-20 — a survival probability rendered on the panel. */
+                    row.appendChild(text("td", "survival probability at this age: 0.83"));
                     body.appendChild(row);
```

This is the leak the row exists to catch and the one the pack refusal cannot: the
mortality pack still carries only its remaining-years column, so `TP-03-01` and
`TP-03-02` stay green. The probability is invented *at the render layer*, and the
panel scan is the only thing that sees it.

```
# RED TP-03-20
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome --grep "Regression: SCN-024-007 the claim-age panel renders identically across two loads and shows no probability column" --reporter=list
exit: 1
lines: 52
sha256: c2ebc9ed053a1cb8e08fa91d61097a6658ec1173876ef0de8277eed56e7b1b2a
--- output ---

Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:59:1 › Regression: SCN-024-007 the claim-age panel renders identically across two loads and shows no probability column (1.0s)

    Error: expect(received).not.toMatch(expected)

    Expected pattern: not /probability|survivor|hazard|chance of|odds/i
    Received string:      "The claim ages you asked to compare
    …
    CLAIM AGE   ANNUAL BENEFIT  REMAINING YEARS THE TABLE STATES        WHOLE YEARS COUNTED     TOTAL OVER THOSE YEARS
    70  $35,712 14.66   14      $499,968        survival probability at this age: 0.83
    62  $20,160 20.29   20      $403,200        survival probability at this age: 0.83
    67  $28,800 16.71   16      $460,800        survival probability at this age: 0.83
    …"

      86 |      can therefore not show one. */
      87 |   const panelText = await page.locator('#power-claim-age').innerText();
    > 88 |   expect(panelText).not.toMatch(/probability|survivor|hazard|chance of|odds/i);
         |                         ^
        at file://<repo>/tests/lifetime-tax-claim-age.spec.mjs:88:25

  1 failed
    [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:59:1 › Regression: SCN-024-007 the claim-age panel renders identically across two loads and shows no probability column 
```

The `…` marks elide the middle of the received panel text, which the capture
block reproduced in full; the sha256 above covers the untruncated output. The
absolute checkout path in the trailing `at` frame is written `file://<repo>/`
here so this committed artefact carries no user path; nothing else in the message,
the frame or the exit code is altered.

**Revert:** `git checkout -- lifetime-tax-strategy-lab.html` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** exit 0, `1 passed`. Recorded at
[TP-03-20](#tp-03-20) and re-confirmed in the
[closing verification run](#closing-verification-run).

### RED TP-03-21

**Mutation:** `lifetime-tax-strategy-lab.html` — the earlier claim age no longer
named on the equality row:

```diff
                     var pairRow = document.createElement("tr");
-                    pairRow.appendChild(text("td", String(pair.earlierClaimAge)));
+                    /* RED PROBE TP-03-21 — the earlier claim age no longer named on the row. */
+                    pairRow.appendChild(text("td", ""));
                     pairRow.appendChild(text("td", String(pair.laterClaimAge)));
```

The equality age `78.67` is still computed and still rendered — only the label
naming which pair it belongs to is gone. That is the precise harm the row's
wording targets: "published with both claim ages named", so no reader has to
infer which pair a figure describes.

```
# RED TP-03-21
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome --grep "Regression: SCN-024-008 the cumulative totals and the equality age are shown with both claim ages named and the record's own arithmetic statement" --reporter=list
exit: 1
lines: 25
sha256: 506850d75dc754caad1442f86a2ecf1c303df4238930ac9ae3ebe25bd9cb872d
--- output ---

Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:97:1 › Regression: SCN-024-008 the cumulative totals and the equality age are shown with both claim ages named and the record's own arithmetic statement (919ms)

    TypeError: Cannot read properties of undefined (reading '2')

      118 |     })));
      119 |   const crossing = parity.filter((cells) => cells[0] === '62' && cells[1] === '67')[0];
    > 120 |   expect(crossing[2]).toBe('78.67');
          |                  ^
      121 |
      122 |   /* A pair whose sums never meet withholds the figure rather than reporting a bound. */
      123 |   const nonCrossing = parity.filter((cells) => cells[0] === '70' && cells[1] === '62')[0];
        at file://<repo>/tests/lifetime-tax-claim-age.spec.mjs:120:18

  1 failed
    [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:97:1 › Regression: SCN-024-008 the cumulative totals and the equality age are shown with both claim ages named and the record's own arithmetic statement 
```

The failure surfaces as a `TypeError` rather than a value mismatch, because the
row locates the pair *by* its two named ages before reading the figure. That is
the assertion being stricter than a value check, not weaker: an equality age that
cannot be attributed to a pair is unreadable, and the row cannot even reach it.
The absolute checkout path in the `at` frame is written `file://<repo>/` here;
the message, the frame and the exit code are otherwise unaltered.

**Revert:** `git checkout -- lifetime-tax-strategy-lab.html` → exit 0; scoped
`git status --short` printed nothing at exit 0.

**GREEN, same command, reverted tree:** exit 0, `1 passed`. Recorded at
[TP-03-21](#tp-03-21).

### RED TP-03-22

**Mutation:** `lifetime-tax-strategy-lab.html` — the named refusal for a claim
age the table carries no row for was replaced by a fabricated zero total:

```diff
                     if (entry.withheld) {
                         var withheldCell = document.createElement("td");
                         withheldCell.setAttribute("colspan", "3");
-                        withheldCell.appendChild(unavailableNode(entry.withheld,
-                            "Remaining years and the total over them"));
+                        /* RED PROBE TP-03-22 — the named refusal replaced by a fabricated zero total. */
+                        withheldCell.appendChild(text("span", dollars(0)));
                         row.appendChild(withheldCell);
```

This is the exact harm the row exists to catch. The settlement is untouched:
`rltaxclaimage.js` still withholds the figure and still emits
`RLTAX-THRESHOLD-UNAVAILABLE`, so TP-03-11 and TP-03-12 stay green. The invention
happens at the render layer, where a reader is told the total over the remaining
years is `$0` rather than that the table carries no row for age 75 — a withheld
figure presented as a settled one.

```
# RED TP-03-22
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome --grep "Regression: SCN-024-008 an absent life-expectancy figure withholds the totals and the equality age while the per-age benefits still render" --reporter=list
exit: 1
--- output ---

Running 1 test using 1 worker

  ✘  1 …tals and the equality age while the per-age benefits still render (5.8s)


  1) [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:144:1 › Regression: SCN-024-008 an absent life-expectancy figure withholds the totals and the equality age while the per-age benefits still render 

    Error: expect(locator).toHaveAttribute(expected) failed

    Locator: locator('#claimAgeBody tr[data-rl-claim-age="75"] [data-rl-unavailable]')
    Expected: "RLTAX-THRESHOLD-UNAVAILABLE"
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toHaveAttribute" with timeout 5000ms
      - waiting for locator('#claimAgeBody tr[data-rl-claim-age="75"] [data-rl-unavailable]')


      161 |     .toHaveText('$35,712');
      162 |   const withheld = page.locator('#claimAgeBody tr[data-rl-claim-age="75"] [data-rl-unavailable]');
    > 163 |   await expect(withheld).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
          |                          ^
      164 |   await expect(withheld).toContainText('no adjacent row stands in for it');
      165 |
      166 |   /* Neither a total nor an equality age is invented for it. */
        at file://<repo>/tests/lifetime-tax-claim-age.spec.mjs:163:26

    Error Context: test-results/tests-lifetime-tax-claim-a-93b57-r-age-benefits-still-render-system-chrome/error-context.md

    Error Context: test-results/tests-lifetime-tax-claim-a-93b57-r-age-benefits-still-render-system-chrome/error-context.md

  1 failed
    [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:144:1 › Regression: SCN-024-008 an absent life-expectancy figure withholds the totals and the equality age while the per-age benefits still render 
```

The row fails on the *named* refusal rather than on the `$0` string, which is the
stricter of its two assertions: the panel must not merely avoid printing a zero,
it must say by code and in words which figure it is withholding and why. The
absolute checkout path in the trailing `at` frame is written `file://<repo>/`
here so this committed artefact carries no user path; the message, the frame and
the exit code are otherwise unaltered.

**Revert:** `git checkout -- lifetime-tax-strategy-lab.html` → exit 0.
`git status --short` afterwards listed `market-brief.config.json`,
`notes/market-brief.md`, `scripts/brief-narrative-parallel.mjs`,
`scripts/selftest.mjs` and `scripts/validate-brief-payload.mjs` — all owned by the
concurrent session — plus that session's untracked files. No path this scope owns
was modified.

**GREEN, same command, reverted tree:** exit 0, `1 passed (1.7s)`. Recorded at
[TP-03-22](#tp-03-22).

### RED TP-03-23

**Mutation:** `lifetime-tax-strategy-lab.html` — the declared order replaced by a
sort on cumulative total. The first attempt sorted `comparison.perAge` in place;
the settlement record is frozen, so that threw and emptied the table, producing a
crash-shaped failure rather than the intended one. That attempt was reverted and
replaced by a sort over a copy, which reorders the rows exactly as a renderer that
ranked by outcome would:

```diff
                 var index = 0;
+                /* RED PROBE TP-03-23 — the declared order replaced by a sort on cumulative total. */
+                var probeOrdered = comparison.perAge.slice().sort(function (a, b) {
+                    return (a.cumulativeTotal || 0) - (b.cumulativeTotal || 0);
+                });
-                for (index = 0; index < comparison.perAge.length; index += 1) {
-                    var entry = comparison.perAge[index];
+                for (index = 0; index < probeOrdered.length; index += 1) {
+                    var entry = probeOrdered[index];
```

The declared order is 70, 62, 67, chosen so that neither ascending nor descending
by any figure reproduces it. A renderer that sorted by cumulative total therefore
cannot pass by coincidence.

```
# RED TP-03-23
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome --grep "Regression: SCN-024-009 the claim ages render in declared order with nothing marked best, optimal, recommended or preferred" --reporter=list
exit: 1
--- output ---
    Error: expect(received).toEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Array [
    -   "70",
        "62",
        "67",
    +   "70",
      ]

      187 |   const order = await page.locator('#claimAgeBody tr')
      188 |     .evaluateAll((rows) => rows.map((row) => row.getAttribute('data-rl-claim-age')));
    > 189 |   expect(order).toEqual(['70', '62', '67']);
          |                 ^
        at file://<repo>/tests/lifetime-tax-claim-age.spec.mjs:189:17

  1 failed
    [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:179:1 › Regression: SCN-024-009 the claim ages render in declared order with nothing marked best, optimal, recommended or preferred
```

The diff shows `70` moving from first to last — the exact signature of an
ascending sort by cumulative total, which is the harm FR-024-019 forbids.

**Revert:** `git checkout -- lifetime-tax-strategy-lab.html` → exit 0.
`git status --short -- rltax*.js tax-rules/ lifetime-tax-strategy-lab.html`
printed nothing.

**GREEN, same command, reverted tree:** exit 0, `1 passed (1.6s)`. Recorded at
[TP-03-23](#tp-03-23).

### RED TP-03-24

**Mutation:** `lifetime-tax-strategy-lab.html` — the declared claim ages leaked
into a request URL from the claim-age renderer. The pack fetch at boot happens
before any age is declared, so a leak there would carry nothing; the probe is
placed where the declared values are actually in hand, which is the shape a real
telemetry or cache-busting leak would take:

```diff
             function renderClaimAge() {
                 var refusalHost = byId("claimAgeRefusal");
                 var columnAbsenceHost = byId("claimAgeColumnAbsence");
                 var body = byId("claimAgeBody");
                 var parityBody = byId("claimAgeParityBody");
+                /* RED PROBE TP-03-24 — the declared claim ages leaked into a request URL. */
+                if (state.workspace && state.workspace.claimAgeComparisonAges) {
+                    window.fetch("/tax-rules/mortality/2026.json?claimAge="
+                        + String(state.workspace.claimAgeComparisonAges), { cache: "no-store" });
+                }
```

The leaked path is one the permitted set already contains, so the path-membership
assertion stays green and the row is forced to catch the leak on the query string
alone — which is the stricter claim: a household value must not reach a URL even
when the URL itself is permitted.

```
# RED TP-03-24
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome --grep "Regression: SCN-024-009 the request ledger stays empty and no declared claim age reaches a URL" --reporter=list
exit: 1
--- output ---
    Error: expect(received).not.toContain(expected) // indexOf

    Expected substring: not "70,"
    Received string:        "… http://127.0.0.1:65527/tax-rules/mortality/2026.json?claimAge=70,62,67 http://127.0.0.1:65527/tax-rules/mortality/2026.json?claimAge=70,62,67 http://127.0.0.1:65527/tax-rules/mortality/2026.json?claimAge=70,62,67"

      217 |   /* No declared claim age, and no declared column, reaches any URL, query string or body. */
      218 |   const urls = ledger.map((entry) => entry.url).join(' ');
    > 219 |   expect(urls).not.toContain('70,');
          |                    ^
      220 |   expect(urls).not.toContain('claimAge');
        at file://<repo>/tests/lifetime-tax-claim-age.spec.mjs:219:20

  1 failed
    [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:201:1 › Regression: SCN-024-009 the request ledger stays empty and no declared claim age reaches a URL
```

The received string is elided at its head here, where it lists the twenty
permitted asset and pack requests that were already green; the three leaking
entries are reproduced verbatim. The row fails on the declared ages themselves
appearing in the query string, which is precisely NFR-024-003.

**Revert:** `git checkout -- lifetime-tax-strategy-lab.html` → exit 0.
`git status --short -- rltax*.js tax-rules/ lifetime-tax-strategy-lab.html`
printed nothing.

**GREEN, same command, reverted tree:** exit 0, `1 passed (1.7s)`. Recorded at
[TP-03-24](#tp-03-24).

## Intended RED Evidence for the Four Gate Rows, TP-03-25 … TP-03-28

**Why these four were recorded in a later session, and against a moved baseline.**
The twenty-four rows above were probed at `33b663f20`, where
`node scripts/selftest.mjs` reported 2868 passed / 1 failed. The four rows in this
section were probed later, at `9af68427b`, where the same command reports
**3037 passed, 4 failed**. The rise in both numbers is a concurrent session's
Feature 026 landing between the two sittings; the four failures are
`Regression: SCN-026-CANARY-01`, `-02`, `-04` and `TP-026-5.1`, all owned by that
session and all present identically before and after every mutation below. A
probe's RED is the delta *above* those four, exactly as the earlier probes took
their delta above the single failure standing at `33b663f20`.

**Baselines captured before the first mutation of this sitting**, each with the
row's own Test Plan command and each bounded through
`.github/bubbles/scripts/evidence-capture.sh` so the recorded sha256 covers every
line the command produced:

```
# BASELINE selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3442
sha256: 2643a40b47f495674d5986133afac70bbfc8165aff24a087a3f0691c30d3018e
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: Regression: SCN-026-CANARY-01 every pre-existing selftest assertion stays green after the Feature 026 budget append, the fetch budget is unchanged, the committed unstamped payload still validates clean, and the site build accounts for rlcockpit.js without an exclusion
  ✗ FAIL: Regression: SCN-026-CANARY-02 the Scope 1 budget group and every pre-existing assertion stay green after the cross-asset append
  ✗ FAIL: Regression: SCN-026-CANARY-04 the Scope 1 through Scope 3 groups and every pre-existing assertion stay green after the renderer append, and rlcockpit.js is still a frozen UMD module with no browser-only global and no bare isFinite
  ✗ FAIL: TP-026-5.1 every published claim is recorded with the observation that would resolve it, or the row declares no claims — never a claim with no resolving observation
--- omitted 3402 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 3037 passed, 4 failed
================================================
```

```
# BASELINE validate-spec-test-paths
$ node scripts/validate-spec-test-paths.mjs
exit: 0
lines: 8
sha256: ae1242d932083bb6706dd021bdd11bdaa3e5cd32fc301d4a7e87a8b8d3426330
--- output ---
[spec-test-paths] scanned=670 references=14669 distinctPaths=242 missingPaths=66 baseline=71 new=0 stale=5
  STALE-BASELINE: 5 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/recommendation-track-record.canary.mjs
      tests/recommendation-track-record.e2e.mjs
      tests/recommendation-track-record.functional.mjs
      tests/recommendation-track-record.support.mjs
      tests/recommendation-track-record.unit.mjs
[spec-test-paths] OK — no new missing test path(s) (5 stale baseline entries to remove)
```

```
# BASELINE build-pages-site dry-run
$ node scripts/build-pages-site.mjs --dry-run
exit: 0
lines: 1
sha256: 9cdf3c15bbbde3a4b43e5a670057f36d1f777cf01e564553e1ae7fdb8cdc8dcf
--- output ---
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/389a899499094a4f484a06ecc8903aa584524c3cf83b902f403a8d00f5a62cbe","omittedOrphanIndexes":143}
```

**Mutation hygiene applied to every probe in this section.** Each probe applies
one mutation, runs the row's own command, reverts inside the same shell
invocation, prints `git status --short` scoped to the mutated path to prove the
revert landed, and only then re-runs the identical command for GREEN. No probe
was ever left in flight while another began, and this report was written after
each probe rather than batched at the end.

### RED TP-03-27

**Row:** the path guard — zero new missing spec-referenced test paths.
**Command:** `node scripts/validate-spec-test-paths.mjs`.

**Mutation:** this scope's own `scope.md` was made to name a test file that does
not exist, which is precisely the regression the guard was written for. The
guard's own header records the hazard: Playwright silently ignores a file
argument that does not exist as long as one other argument resolves, so a stale
path keeps reporting success while covering strictly less than it claims.

```diff
-    `tests/lifetime-tax-claim-age.spec.mjs`; framework-managed resolved to
+    `<repo>/tests/lifetime-tax-claim-age-renamed.spec.mjs`; framework-managed resolved to
```

**One deliberate departure from verbatim, and why.** The mutated line as actually
applied read the same path with `-renamed` inserted before `.spec.mjs` and with no
prefix. It is
reproduced above and in the capture below with a leading `<repo>/` because the
guard derives its references from `specs/**` by matching a repo-root-relative
`tests/….mjs` token, and this report lives under `specs/**`. Writing the raw token
here would make the evidence itself a real reference to a file that does not
exist — the guard caught exactly that on the first draft of this section,
reporting `new=1` from `report.md`. The `<repo>/` prefix defeats the guard's
lookbehind, which excludes a preceding `/`, and is the same convention the
Playwright captures above already use for `file://<repo>/tests/…`. The mutation
as run carried no prefix; only its transcription here does.

```
# RED TP-03-27
$ node scripts/validate-spec-test-paths.mjs
RED_EXIT=1
--- output ---
[spec-test-paths] scanned=670 references=14669 distinctPaths=243 missingPaths=67 baseline=71 new=1 stale=5
  NEW-MISSING <repo>/tests/lifetime-tax-claim-age-renamed.spec.mjs (1 reference site(s))
      referenced at specs/024-social-security-and-medicare/scopes/03-claim-age-comparison/scope.md:384
  STALE-BASELINE: 5 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/recommendation-track-record.canary.mjs
      tests/recommendation-track-record.e2e.mjs
      tests/recommendation-track-record.functional.mjs
      tests/recommendation-track-record.support.mjs
      tests/recommendation-track-record.unit.mjs
[spec-test-paths] FAIL — 1 new referenced path(s) do not exist
```

The guard names the introduced path, the referencing artifact and the line, and
`distinctPaths` rises 242 → 243 while `new` rises 0 → 1. The five stale baseline
entries are identical either side of the mutation, so they are not the cause.

**Revert:** `git checkout -- specs/024-social-security-and-medicare/scopes/03-claim-age-comparison/scope.md`
→ `REVERT_EXIT=0`; the following `git status --short` scoped to that path printed
nothing.

**GREEN, same command, reverted tree:**

```
# GREEN TP-03-27
$ node scripts/validate-spec-test-paths.mjs
GREEN_EXIT=0
--- output ---
[spec-test-paths] scanned=670 references=14669 distinctPaths=242 missingPaths=66 baseline=71 new=0 stale=5
  STALE-BASELINE: 5 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/recommendation-track-record.canary.mjs
      tests/recommendation-track-record.e2e.mjs
      tests/recommendation-track-record.functional.mjs
      tests/recommendation-track-record.support.mjs
      tests/recommendation-track-record.unit.mjs
[spec-test-paths] OK — no new missing test path(s) (5 stale baseline entries to remove)
```

Byte-identical to the baseline capture above, `new=0`, exit 0.

### RED TP-03-28

**Row:** the deploy gate — the Pages plan succeeds, `site-exclusions.json` is
unchanged, and `tax-rules/` remains outside the public directories.
**Command:** `node scripts/build-pages-site.mjs --dry-run`.

The row makes two separable claims, so it carries two probes. Recording one would
have left the other unproven.

#### Probe A — `tax-rules/` remains outside the public directories

**Mutation:** the public-directory allowlist was relaxed to publish the tax packs:

```diff
-const PUBLIC_DIRECTORIES = Object.freeze(['briefs', 'data', 'docs', 'notes', 'pictures', 'research', 'rlexperience-adapters', 'tests/fixtures']);
+const PUBLIC_DIRECTORIES = Object.freeze(['briefs', 'data', 'docs', 'notes', 'pictures', 'research', 'rlexperience-adapters', 'tests/fixtures', 'tax-rules']);
```

```
# RED TP-03-28 probe A
$ node scripts/build-pages-site.mjs --dry-run
RED_EXIT=0
--- output ---
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tax-rules","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/389a899499094a4f484a06ecc8903aa584524c3cf83b902f403a8d00f5a62cbe","omittedOrphanIndexes":143}
```

**Stated honestly: this half is observed on the output, not on the exit code.**
The mutated run still exits 0. What goes red is the row's stated expectation —
`"tax-rules"` now appears inside `directories`, between `rlexperience-adapters`
and `tests/fixtures`, where the green run has nothing. The mortality pack this
scope introduced under `tax-rules/mortality/` would ship to the public site. The
row is therefore falsifiable and was falsified, but by reading the plan the
command publishes rather than by a non-zero exit; a reader who checked only the
exit code would not catch this, and that limitation is recorded rather than
papered over.

**Revert:** `git checkout -- scripts/build-pages-site.mjs` → `REVERT_EXIT=0`; the
following `git status --short` scoped to that path printed nothing.

**GREEN, same command, reverted tree:**

```
# GREEN TP-03-28 probe A
$ node scripts/build-pages-site.mjs --dry-run
GREEN_EXIT=0
--- output ---
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/389a899499094a4f484a06ecc8903aa584524c3cf83b902f403a8d00f5a62cbe","omittedOrphanIndexes":143}
```

`tax-rules` is absent, and the line is byte-identical to the baseline capture,
including the `sha256` recorded there.

#### Probe B — the plan succeeds, and refuses an undecided page

**Mutation:** a root HTML page carrying this scope's own name was added with
neither a registration nor an exclusion — the exact shape of shipping a tool page
without a deploy decision:

```
$ printf '<!doctype html>…' > lifetime-tax-claim-age-probe.html
-rw-r--r--@ 1 pkirsanov  staff  75 Aug 19 08:34 lifetime-tax-claim-age-probe.html
```

```
# RED TP-03-28 probe B
$ node scripts/build-pages-site.mjs --dry-run
RED_EXIT=1
--- output ---
Error: unregistered root page lacks a deploy decision: lifetime-tax-claim-age-probe.html
    at assert (file://<repo>/scripts/build-pages-site.mjs:24:25)
    at planPagesSite (file://<repo>/scripts/build-pages-site.mjs:49:3)
    at buildPagesSite (file://<repo>/scripts/build-pages-site.mjs:83:16)
```

This half is a true non-zero exit. It also demonstrates why this scope's page was
never registered: the gate does not permit a root page to exist without an
explicit decision, so an unregistered page is refused rather than silently
published.

**Revert:** `rm -f lifetime-tax-claim-age-probe.html` → `REVERT_EXIT=0`; the
following `git status --short` on that path printed nothing and `ls` reported
`No such file or directory`. The probe file was untracked, so removal — not
`git checkout` — is the correct revert, and its absence is proven directly rather
than inferred from a clean status.

**GREEN, same command, reverted tree:** `GREEN_EXIT=0`, output byte-identical to
probe A's green line and to the baseline capture. `site-exclusions.json` was not
written by either probe: `excludedPaths` reads 12 in the baseline, in both RED
captures where the plan got that far, and in both GREEN captures.

### RED TP-03-26

**Row:** the repo gate — the whole-repository suite stays green and the
pre-existing pass count does not fall.
**Command:** `node scripts/selftest.mjs`.

**Mutation:** `rltaxclaimage.js` — the terminal age dropped its claim-age term, so
the horizon is read as an absolute age rather than as a span measured from the
claim age:

```diff
-    var terminalAge = claimAge + remainingYears;
+    var terminalAge = remainingYears; /* RED PROBE TP-03-26 */
```

This is a different mutation from every probe above: TP-03-07's probe moved the
rounding of the whole-year count, while this one corrupts the quantity being
rounded. At a claim age of 67 with a 19.2-year remaining-years figure the terminal
age becomes 19.2 rather than 86.2, and `wholeYears` goes deeply negative, so every
cumulative total this scope publishes is wrong.

```
# RED TP-03-26
$ node scripts/selftest.mjs
exit: 1
lines: 3446
sha256: 56f9ae21689739ac7a9627e538fafd4379c349d7008a475bfbb9698d33161ce6
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-03-07: against a fixture pack with deliberately non-standard life-expectancy figures, each claim age’s cumulative total equals the adjusted annual benefit times the whole-year count from that claim age to the life-expectancy age, asserted at three claim ages
  ✗ FAIL: Regression: SCN-026-CANARY-01 …
  ✗ FAIL: Regression: SCN-026-CANARY-02 …
  ✗ FAIL: Regression: SCN-026-CANARY-04 …
--- omitted 3406 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 3037 passed, 5 failed
================================================
```

**Revert:** `git checkout -- rltaxclaimage.js` → `REVERT_EXIT=0`. Two independent
confirmations followed in the same shell invocation: `git status --short` scoped
to that path printed nothing, and `grep -c 'RED PROBE' rltaxclaimage.js` printed
`0`, so the probe marker is provably gone from the file rather than merely
assumed gone. The marker count is checked because an earlier dispatch in this
scope left an abandoned `/* RED PROBE TP-03-25 */` mutation in
`lifetime-tax-strategy-lab.html`; the grep is the cheap check that would have
caught it.

```
# GREEN TP-03-26
$ node scripts/selftest.mjs
exit: 1
lines: 3437
sha256: 0bea7a1bdfbcaaffc3d54af6d2dc39f7a50b6a3a6cd4dca4e1e44b21d73e6960
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: Regression: SCN-026-CANARY-01 …
  ✗ FAIL: Regression: SCN-026-CANARY-02 …
  ✗ FAIL: Regression: SCN-026-CANARY-04 …
--- omitted 3397 line(s); sha256 above covers the full output ---

================================================
Research-Lab self-test: 3039 passed, 3 failed
================================================
```

**How to read these two counts, stated plainly rather than left to look tidier
than it is.** RED reports 3037 / 5 and GREEN reports 3039 / 3. The naive reading —
"the fix restored two passes and removed two failures" — is wrong, and the
difference is not all attributable to the mutation. A concurrent session was
editing `scripts/selftest.mjs` and the Feature 026 sources throughout this
sitting, and its own counts moved underneath both captures; `TP-026-5.1` is
failing in the baseline capture and passing in both captures here, which no
mutation of `rltaxclaimage.js` could cause.

The sound comparison is therefore not the totals but the named assertion:
`TP-03-07` appears as `✗ FAIL` in the RED capture and does not appear in the
GREEN capture's failure set at all. That single row is caused by this mutation and
by nothing else, and it is the one this scope owns. The totals are recorded
because the row is stated in terms of them, and the confound is recorded because
reporting the totals without it would overstate what the probe proves.

**The gate's own claim still holds at GREEN.** Every remaining failure is a
`Regression: SCN-026-CANARY-*` row owned by the concurrent session's Feature 026.
No assertion carrying a `TP-03-` or `SCN-024-` identifier is failing, and the pass
count did not fall from the baseline's 3037 — it rose to 3039.

### TP-03-25 — not probed in the prior sitting (superseded by Probe 29 below)

**Superseded.** This section is the prior sitting's honest record of why it
stopped. The row was probed and closed in a later sitting; read
[Probe 29](#probe-29--same-command-red-and-green-for-tp-03-25) for this row's
actual RED and GREEN. The two blocking reasons named below were both resolved
there: the row's command now returns a verdict, and its selector is the
four-feature-pinned `SCN-02[1-4]` rather than the substring `SCN-02` that swept
in the concurrent session's files. The text is kept unedited so the reasoning
that produced the stop stays inspectable.

**Row:** the broader browser regression — the cumulative browser suite over the
real route.
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`.

**Claim Source: not-run.** This row has GREEN recorded at
[TP-03-25](#tp-03-25) from an earlier session and has **no** RED. It is the one
row of the twenty-eight that remains unproven, and it is recorded as unproven
rather than closed with a plausible-looking narrative.

**Why it was not probed in this sitting, stated so the next session does not
repeat the attempt blindly.** Two independent reasons, either of which alone was
sufficient to stop:

1. **The suite did not return a verdict.** The row's own command selects 74
   tests. Two separate runs in this sitting reached `[74/74]` — every test
   dispatched — and then produced no summary line and no exit code before the
   attempt was abandoned. Without a trustworthy GREEN baseline there is nothing
   for a RED to be a delta against, and a RED capture taken against an unknown
   baseline would be evidence-shaped rather than evidence.

2. **The grep is not isolated from a concurrent session.** `--grep "SCN-02"` is a
   substring match, so it selects `SCN-025-*` and `SCN-026-*` alongside this
   scope's `SCN-024-*`. A concurrent session was editing
   `tests/company-intelligence-lab.spec.mjs`, `rlcompanyintel.js` and
   `company-intelligence-lab.html` throughout this sitting, all of which sit
   inside that selection. A failure appearing under a mutation could therefore
   have come from the mutation or from the other session's in-flight edit, and
   the two are not separable from the run output.

**What was deliberately NOT done, and why that is the correct outcome.** No
mutation was applied for this row. An earlier dispatch did apply one — a
`/* RED PROBE TP-03-25 */` edit to `lifetime-tax-strategy-lab.html` — and died
before reverting it, leaving a silent product degradation in the working tree
that a human had to find and revert. Starting a fresh mutation on top of a suite
that was not returning a verdict risked exactly that failure again. Stopping with
the row honestly open is a better outcome than a second abandoned probe.

**What the next session needs.** A verdict-returning invocation of the row's
command, run when the `SCN-025`/`SCN-026` files are not being concurrently
edited — or a narrower selection that still satisfies the row's intent. This
scope's own five browser tests do return a verdict and are green, which bounds
the risk but does not discharge the row:

```
$ npx --no-install playwright test tests/lifetime-tax-claim-age.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=line
Running 5 tests using 1 worker
  5 passed (5.0s)
CLAIMAGE_SUITE_EXIT=0
```

That is a different command from the row's, so it is recorded here as context for
the next session, **not** as this row's evidence.

### Probe 29 — same-command RED and GREEN for TP-03-25

**Claim Source: executed.** Both captures below are real runs of TP-03-25's own
declared command in this session, one under a single mutation and one on the
restored tree.

**What blocked the prior sitting, and why it no longer blocks.** The prior
sitting stopped for two reasons. The first was that the row's command returned no
verdict; it now does, twice, with a summary line and an exit code in both
directions. The second was that the substring selector `--grep "SCN-02"` swept in
`SCN-025-*` and `SCN-026-*`, which a concurrent session was editing, so a failure
could not be attributed. The row's selector is now the character-class
alternation `SCN-02[1-4]`, pinned to the four owning features, and the failing
tests below both carry `SCN-024-008` — a scenario this scope owns. Neither
ambiguity survives.

**The mutation, chosen to be value-free by construction.** One rounding
identifier in `rltaxclaimage.js`. It carries no household figure, no threshold and
no rate; it is a code literal, so a slipped revert could disclose nothing:

```js
-    var wholeYears = Math.floor(terminalAge) - claimAge;
+    var wholeYears = Math.ceil(terminalAge) - claimAge;
```

The whole-year count is the count from the claim age to the whole part of the age
the claim age and the remaining years sum to. Rounding that terminal age up rather
than down grants each comparison one benefit year it was not sourced for, which is
exactly the arithmetic TP-03-25's cumulative selection must not let pass.

**Pre-run guard, written so a zero count is a value to test and not an exit
status to chain on.** The counts were captured into variables first and compared
with an explicit `if`, because `grep -c` exits non-zero on a zero count and would
otherwise have short-circuited an `&&` chain and skipped the probe run entirely:

```
$ ceil_n=$(grep -c 'Math\.ceil(terminalAge)' rltaxclaimage.js)
$ floor_n=$(grep -c 'Math\.floor(terminalAge)' rltaxclaimage.js)
$ echo "GUARD ceil_n=$ceil_n floor_n=$floor_n"
GUARD ceil_n=1 floor_n=0

$ git diff -- rltaxclaimage.js
diff --git a/rltaxclaimage.js b/rltaxclaimage.js
index 2075b2bc1..c419d77e9 100644
--- a/rltaxclaimage.js
+++ b/rltaxclaimage.js
@@ -206,7 +206,7 @@
     var terminalAge = claimAge + remainingYears;
-    var wholeYears = Math.floor(terminalAge) - claimAge;
+    var wholeYears = Math.ceil(terminalAge) - claimAge;
     return Object.freeze({
```

The guard proves the substitution landed on the intended single site and nowhere
else. Had it read anything but `1` and `0` the run would have been aborted and the
tree restored without a capture.

**RED — the row's exact declared command:**

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list

Running 77 tests using 6 workers
  ✘  10 … both claim ages named and the record's own arithmetic statement (1.4s)
  ✘  15 …als and the equality age while the per-age benefits still render (1.5s)

  1) [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:97:1 › Regression: SCN-024-008 the cumulative totals and the equality age are shown with both claim ages named and the record's own arithmetic statement

    Error: expect(received).toEqual(expected) // deep equality

      Array [
        "70",
        "$35,712",
        "14.66",
    -   "14",
    -   "$499,968",
    +   "15",
    +   "$535,680",
      ]

    > 108 |   expect(grid[0]).toEqual(['70', '$35,712', '14.66', '14', '$499,968']);

  2) [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:144:1 › Regression: SCN-024-008 an absent life-expectancy figure withholds the totals and the equality age while the per-age benefits still render

    Error: expect(received).toEqual(expected) // deep equality

      Array [
        "67",
        "$28,800",
        "16.71",
    -   "16",
    -   "$460,800",
    +   "17",
    +   "$489,600",
      ]

    > 157 |   expect(grid[0]).toEqual(['67', '$28,800', '16.71', '16', '$460,800']);

  2 failed
    [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:97:1 › Regression: SCN-024-008 …
    [system-chrome] › tests/lifetime-tax-claim-age.spec.mjs:144:1 › Regression: SCN-024-008 …
  75 passed (5.4m)
RED_EXIT=1
```

The failure is specific rather than merely present. Both assertions name the exact
cell that moved — `14` became `15`, `16` became `17` — and the derived totals moved
with them. A test that only checked the grid's shape or its row count would have
stayed green under this mutation; these did not.

**Revert, issued inside the same shell invocation that applied the mutation.** No
`trap … EXIT` was relied on, because that does not fire in this persistent shell;
`INT`/`TERM` traps were set only as an abnormal-termination net:

```
$ git checkout -- rltaxclaimage.js
REVERT_EXIT=0
$ git status --short -- rltaxclaimage.js
SCOPED_STATUS_ABOVE
$ floor_back=$(grep -c 'Math\.floor(terminalAge)' rltaxclaimage.js); echo "floor_restored=$floor_back"
floor_restored=1
```

The scoped status printed nothing between the command and its sentinel, so the
module was byte-identical to `HEAD` before the green run started.

**GREEN — the same command on the restored tree:**

```
$ floor_n=$(grep -c 'Math\.floor(terminalAge)' rltaxclaimage.js); echo "PRE-GREEN GUARD floor_n=$floor_n"
PRE-GREEN GUARD floor_n=1
$ git status --short -- rltaxclaimage.js
SCOPED_STATUS_ABOVE

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list

Running 77 tests using 6 workers
  ✓   1 … tax compete inside one cap and the disallowed amounts are shown (3.5s)
  …
  ✓  77 … declared days and the personal portion reaches the composition (825ms)
Error: worker-5 process did not exit within 300000ms after stop, force-killed it
Error: worker-4 process did not exit within 300000ms after stop, force-killed it
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
Error: worker-2 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
Error: worker-3 process did not exit within 300000ms after stop, force-killed it
Error: worker-3 process did not exit within 300000ms after stop, force-killed it

  77 passed (5.5m)
  7 errors were not a part of any test, see above for details
GREEN_EXIT=1
```

**On the non-zero GREEN exit code, stated rather than smoothed over.** The run
reports `77 passed` and zero failed — the row's own claim, met in full. The
non-zero exit comes from seven `worker-N process did not exit … force-killed it`
lines, which Playwright itself classifies as `errors … not a part of any test`.
This is a teardown fault in the runner's worker shutdown, already known on this
suite, and it appears in the RED capture too, where it did not prevent the two
real failures from being reported. It is recorded here because reporting `77
passed` beside a non-zero exit without explaining the gap would look like a
suppressed failure.

**Delta, which is what the probe actually proves.** RED: `2 failed, 75 passed`.
GREEN: `0 failed, 77 passed`. The two rows that moved are the two the mutation
touches, both `SCN-024-008`, both owned by this scope. No other test in the
77-test selection changed state in either direction, so the delta is attributable
to the mutation and to nothing else — which is precisely the attribution the prior
sitting could not obtain under the substring selector.

**Probe hygiene.** One mutation, one path, applied and reverted inside a single
shell invocation, verified by a scoped `git status --short` that printed nothing
and by a restored-count check. No probe file was created and none needed removing.



Run after the last probe of this sitting was reverted, to prove the tree the
probes left behind is the tree the GREEN captures describe.

| Command | Result |
|---|---|
| `node scripts/selftest.mjs` | `3042 passed, 0 failed` |
| `node scripts/validate-spec-test-paths.mjs` | exit 0, `new=0`, `stale=0` |
| `node scripts/build-pages-site.mjs --dry-run` | exit 0, `directories` free of `tax-rules`, `excludedPaths` 12 |
| `npx … tests/lifetime-tax-claim-age.spec.mjs … --project=system-chrome` | `5 passed (5.0s)`, exit 0 |
| `grep -rn 'RED PROBE' --include='*.js' --include='*.html' --include='*.json' --include='*.mjs' .` | exit 1 — zero matches anywhere in the product tree |

**On the moving totals, so the numbers in this section reconcile.** The sitting
opened at `3037 passed, 4 failed`, the TP-03-26 GREEN capture read
`3039 passed, 3 failed`, and this closing run reads `3042 passed, 0 failed`. The
rise and the vanishing failures are the concurrent session landing its Feature 026
fixes underneath, not an effect of anything in this scope. What this scope is
accountable for holds at every one of those three points: no assertion carrying a
`TP-03-` or `SCN-024-` identifier failed in any of them, and the pass count never
fell below the 3037 the sitting opened at. The path guard also settled to
`stale=0` when the concurrent session pruned its five stale baseline entries.

**Probe-hygiene ledger for this sitting.** Four mutations were applied across
three rows, each reverted inside the same shell invocation that applied it, each
followed by a scoped `git status --short` that printed nothing:

| Row | Mutated path | Revert | Confirmed by |
|---|---|---|---|
| TP-03-27 | `specs/024-…/03-claim-age-comparison/scope.md` | `git checkout --` | scoped `git status --short` empty |
| TP-03-28 A | `scripts/build-pages-site.mjs` | `git checkout --` | scoped `git status --short` empty |
| TP-03-28 B | `lifetime-tax-claim-age-probe.html` (untracked) | `rm -f` | `ls` → `No such file or directory` |
| TP-03-26 | `rltaxclaimage.js` | `git checkout --` | scoped `git status --short` empty **and** `grep -c 'RED PROBE'` → `0` |
| TP-03-25 | *(none applied)* | n/a | no mutation to revert |

**One defect this sitting introduced and fixed.** Writing the TP-03-27 evidence
put the literal token `tests/…-renamed.spec.mjs` into this report, and because
this report lives under `specs/**` the path guard correctly counted it as a real
new missing reference — `new=1`, `referenced at … report.md`. The guard caught
the recording of the probe, not the probe. It is fixed by the `<repo>/` prefix
convention documented under [RED TP-03-27](#red-tp-03-27), and
`node scripts/validate-spec-test-paths.mjs` is back to `new=0`. It is recorded
here because a reader comparing the RED capture's `distinctPaths=243` against a
later run would otherwise find an unexplained discrepancy.

## TP-03-29 authored — the ledger-growth constraint `SCN-024-009` lacked (2026-08-22)

`TP-03-29` was opened as `GAP, NOT AUTHORED` because `TP-03-24` placed no bound
on ledger growth after first paint and carried no non-empty pin. Its
`requested.forEach((path) => expect(permitted).toContain(path))` therefore passes
vacuously against a route that read nothing — the guard-that-cannot-fail class —
and passes equally against a route that issued fresh requests once the claim-age
comparison was declared, because a ledger that grew still satisfies a
membership sweep.

Both are now constrained in the same run. `afterFirstPaint` is captured
immediately after `openLifetimeTax`, pinned greater than zero, and the ledger is
asserted equal to it after the comparison is declared, settled and switched to
Power. The row also adopts the shared `sameOriginPaths` helper described under
`TP-01-18` in the Scope 01 report, so a declared pathname served from an origin
the route never declared is refused before the permitted-set sweep sees it.

### Intended RED and same-command GREEN — arm A, the non-empty pin

Zeroing the capture is exactly the state a boot that issued no request produces.

```
$ bash scripts/red-green-probe.sh \
    --file tests/lifetime-tax-claim-age.spec.mjs \
    --find 'const afterFirstPaint = ledger.length;' \
    --replace 'const afterFirstPaint = ledger.length * 0;' \
    --label 'TP-03-29 arm A, non-empty pin: a boot that read nothing must fail this row; without the pin requested.forEach((path) => expect(permitted).toContain(path)) passes vacuously over an empty ledger' \
    --bound 300 \
    --summary-match 'expect\(afterFirstPaint\)\.toBeGreaterThan|1 passed' \
    -- npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-024-009 every request is a declared same-origin GET" --reporter=line
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-29 arm A, non-empty pin: a boot that read nothing must fail this row; without the pin requested.forEach((path) => expect(permitted).toContain(path)) passes vacuously over an empty ledger
file:             tests/lifetime-tax-claim-age.spec.mjs
mutation:         const afterFirstPaint = ledger.length;  ->  const afterFirstPaint = ledger.length * 0;   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-024-009\ every\ request\ is\ a\ declared\ same-origin\ GET --reporter=line
red-exit:         1
red-summary:          > 209 |   expect(afterFirstPaint).toBeGreaterThan(0);
green-exit:       0
green-summary:      1 passed (3.7s)
summary-compared:     > 209 |   expect(afterFirstPaint).toBeGreaterThan(0);  vs    1 passed (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=0e82d9f4a4bbf1d5c91f279f88fb42b1efb2c95b restored=0e82d9f4a4bbf1d5c91f279f88fb42b1efb2c95b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
ARM_A_EXIT=0
```

### Intended RED and same-command GREEN — arm B, the growth constraint

Subtracting one from the capture is the arithmetic image of a single request
issued after first paint: the pin still holds, and the equality does not. Probing
it this way rather than by planting a real fetch keeps the mutation inside the
committed test file the harness can hash-verify on revert.

```
$ bash scripts/red-green-probe.sh \
    --file tests/lifetime-tax-claim-age.spec.mjs \
    --find 'const afterFirstPaint = ledger.length;' \
    --replace 'const afterFirstPaint = ledger.length - 1;' \
    --label 'TP-03-29 arm B, ledger growth: a single request issued after first paint must fail this row; the permitted-set sweep cannot detect it because a ledger that grew still satisfies the sweep' \
    --bound 300 \
    --summary-match 'expect\(ledger\.length\)\.toBe|1 passed' \
    -- npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-024-009 every request is a declared same-origin GET" --reporter=line
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-29 arm B, ledger growth: a single request issued after first paint must fail this row; the permitted-set sweep cannot detect it because a ledger that grew still satisfies the sweep
file:             tests/lifetime-tax-claim-age.spec.mjs
mutation:         const afterFirstPaint = ledger.length;  ->  const afterFirstPaint = ledger.length - 1;   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-024-009\ every\ request\ is\ a\ declared\ same-origin\ GET --reporter=line
red-exit:         1
red-summary:          > 219 |   expect(ledger.length).toBe(afterFirstPaint);
green-exit:       0
green-summary:      1 passed (2.5s)
summary-compared:     > 219 |   expect(ledger.length).toBe(afterFirstPaint);  vs    1 passed (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=0e82d9f4a4bbf1d5c91f279f88fb42b1efb2c95b restored=0e82d9f4a4bbf1d5c91f279f88fb42b1efb2c95b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
ARM_B_EXIT=0
```

Two arms are recorded rather than one because the row makes two separable claims
and a single mutation cannot fail both: arm A's mutation stops at the pin and
never reaches the equality, and arm B's mutation satisfies the pin. Each RED
names its own assertion by file line, so neither is a collateral failure.

**Claim Source:** executed. Both blocks are verbatim harness output from this
session, each with its revert hash-verified against the committed blob.


