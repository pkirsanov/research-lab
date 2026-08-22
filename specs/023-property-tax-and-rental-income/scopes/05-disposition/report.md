# Scope 5 Execution Report — Disposition

This file is the evidence surface for scope 5. It was created during planning as a
structural template and is filled from execution only. Nothing here may be written
from expectation, inference or summary. Every anchor below holds raw, unfiltered
terminal output with its exit code.

## Summary

The disposition delivery — `rltaxdisposition.js`, the `CO-19` leg composition in
`rltax.js`, the two `rltaxrules.js` sourcing gates, the federal pack's
`dispositionPolicy`, the `power-disposition` page section and the Simple headline
block — was authored in the implementation session. This completion session repaired
the four failing assertions in `tests/lifetime-tax-disposition.spec.mjs` and recorded
the evidence below.

All four failures were defects in the spec, not in the delivery. No product file was
changed in this session. The one file changed is this scope's own browser spec.

| Failure | Assertion | Root cause | Fixed |
| --- | --- | --- | --- |
| 1 | `disposition.spec.mjs:150` — no `[data-rl-unavailable]` in `#power-disposition` | The spec called `openLifetimeTax(page, site, { serve: absentRate })`. `lifetime-tax.support.mjs` takes two parameters; the third was silently discarded, so the fixture pack was never served and the page settled against the SHIPPED pack, which carries a real recapture rate and correctly does not refuse. The refusal branch was never reached. | Spec. Adopted the pattern every other refusal branch in this feature already uses — `startStaticServer({ overrides })` on its own ephemeral origin, opened in a `try`/`finally`. |
| 2 | `disposition.spec.mjs:190` — exclusion-line substring | `.replace(/[,$]/g, '')` was applied to the ACTUAL only. It stripped the sentence's own prose comma while the expected substring still carried one, so the two could never match. | Spec. Both sides now pass through one `withoutCurrencyPunctuation` normaliser. The product's wording is unchanged. |
| 3 | `disposition.spec.mjs:264` — leg not visible in `#simple` | The destructive census probe removes the leg from the FIRST declared surface. Document order makes that surface `headline`, whose host `#headlineBlock` sits inside `#simple`, and the page does not rebuild Simple on a mode switch. The test deleted the node it then asserted on. | Spec. The Simple assertions now run before the destructive probe, which is last and carries a comment saying why. Every assertion is retained. |
| 4 | `disposition.spec.mjs:305` — `location.hash` expected `''` | Writing the view-mode literal to the hash is declared behaviour, pinned by Feature 021 TP-05-06 (`tests/lifetime-tax-route.spec.mjs:333`, `expect(location.hash).toMatch(/^#(simple\|power)$/)`). The empty-hash assertion contradicted a pinned earlier assertion. | Spec. Replaced with the closed view-mode literal set PLUS a scan proving no declaration member name and no declared value reaches the hash — strictly stronger than either the removed assertion or the pinned route one. |

No supersession entry was required. Failure 4 removed an assertion that CONTRADICTED
a pinned earlier assertion rather than superseding one; the pinned Feature 021
assertion is untouched and still passes. The ledger therefore stays at fourteen
entries and no ASC-8 four-surface update was performed.

## Sourcing

The `BI-9` and `BI-10` retrievals were performed in the implementation session, not
in this one. This session performed NO primary-source retrieval and re-verified no
figure against a live authority. What follows is what the shipped pack records, read
from `tax-rules/federal/2026.json` in this session.

**BI-9 — the unrecaptured section 1250 gain maximum rate.**

- Figure: `dispositionPolicy.recaptureCategory.maximumRate = 0.25`, `categoryId = "unrecaptured-section-1250-gain"`, `componentKind = "rate"`.
- `sourceRef`: `irs-tc409` — *Topic no. 409, Capital gains and losses*, Internal Revenue Service, `https://www.irs.gov/taxtopics/tc409`, `publishedAt 2026-02-25`, `retrievedAt 2026-08-17T19:03:51.000Z`, `retrievalOutcome retrieved`.
- Locator: `Capital gains tax rates, the list introduced as There are a few other exceptions where capital gains may be taxed at rates greater than 20%, item 3: The portion of any unrecaptured section 1250 gain from selling section 1250 real property is taxed at a maximum 25% rate`.
- The record declares its `rate` kind `year-invariant` and its `breakpoint` and `amount` kinds `[2025]`, so a 2026 breakpoint citing this record refuses.

**BI-10 — the residence exclusion periods and amounts.**

- Figures: `ownershipTest` and `useTest` each `minimumMonths 24`, `lookbackYears 5`, `comparisonOperator at-least`, `componentKind qualifier`; `maximumAmounts.amounts` `single 250000`, `married-filing-jointly 500000`, `married-filing-separately 250000`, `componentKind amount`.
- `sourceRef`: `irs-p523-2025` — *Publication 523 (2025), Selling Your Home*, Internal Revenue Service, `https://www.irs.gov/publications/p523`, `publishedAt 2026-04-30`, `retrievedAt 2026-08-17T22:52:00.000Z`, `retrievalOutcome retrieved`.
- The record declares its `amount` and `qualifier` kinds `year-invariant` with a written basis, and its `rate` and `breakpoint` kinds the empty array.

**The shipped absence.** `maximumAmounts.amounts["head-of-household"]` ships as an
`AbsentFigure/v1` carrying `code RLTAX-THRESHOLD-UNAVAILABLE`, `domain
disposition:residenceExclusion:maximumAmounts:head-of-household`, a reason stating
that Publication 523's Worksheet 1 enumerates married-filing-jointly, single,
married-filing-separately and surviving-spouse and states nothing for head of
household, a remediation, and a `missingSource`. The single amount is not borrowed
for it. The refusal is exercised over the real route: `TP-05-23` selects
`head-of-household` and asserts `#power-disposition [data-rl-unavailable]` carries
`RLTAX-THRESHOLD-UNAVAILABLE` with zero exclusion-test rows, and `TP-05-13` asserts
the same in the unit suite.

**The absent-rate branch.** `TP-05-22` now serves a fixture pack whose
`recaptureCategory` is an `AbsentFigure/v1` and asserts the rendered refusal names
its own missing source (`missing source: Absent recapture-rate fixture pointer`),
that `#dispositionComponentsBody` has zero rows, and that neither disposition leg
appears anywhere — so the whole gain is not repriced under the preferential model in
the refusal's place.

### BI-9 and BI-10 disjunction — mechanically derived in this session

The DoD row asks that each figure `BI-9` and `BI-10` govern was **either** closed by
a retrieval recorded with its own `retrievedAt` and locator, **or** ships as an
`AbsentFigure/v1` whose component refuses. That disjunction is a completeness
property of the shipped pack, so this session derived it over every leaf of
`dispositionPolicy` rather than re-reading the prose above. Every leaf is
classified into exactly one branch and no leaf falls outside both.

Command, executed against `tax-rules/federal/2026.json` in this session:

```
$ node -e '<walk dispositionPolicy; classify each leaf as SOURCED or ABSENT;
            SOURCED requires sourceRecords[sourceRef] to resolve and to carry
            retrievedAt + retrievalOutcome="retrieved", and the member itself to
            carry a non-empty locator; ABSENT requires code + domain +
            missingSource + reason + remediation>'

{"path":"dispositionPolicy.recaptureCategory","kind":"SOURCED","sourceRef":"irs-tc409","recordFound":true,"retrievedAt":"2026-08-17T19:03:51.000Z","retrievalOutcome":"retrieved","hasLocator":true}
{"path":"dispositionPolicy.residenceExclusion.ownershipTest","kind":"SOURCED","sourceRef":"irs-p523-2025","recordFound":true,"retrievedAt":"2026-08-17T22:52:00.000Z","retrievalOutcome":"retrieved","hasLocator":true}
{"path":"dispositionPolicy.residenceExclusion.useTest","kind":"SOURCED","sourceRef":"irs-p523-2025","recordFound":true,"retrievedAt":"2026-08-17T22:52:00.000Z","retrievalOutcome":"retrieved","hasLocator":true}
{"path":"dispositionPolicy.residenceExclusion.maximumAmounts","kind":"SOURCED","sourceRef":"irs-p523-2025","recordFound":true,"retrievedAt":"2026-08-17T22:52:00.000Z","retrievalOutcome":"retrieved","hasLocator":true}
{"path":"dispositionPolicy.residenceExclusion.maximumAmounts.amounts.head-of-household","kind":"ABSENT","code":"RLTAX-THRESHOLD-UNAVAILABLE","domain":"disposition:residenceExclusion:maximumAmounts:head-of-household","hasMissingSource":true,"hasReason":true,"hasRemediation":true}
classified: 5 sourced: 4 absent: 1
INCOMPLETE: 0 []
DERIVATION_EXIT=0
```

**Non-vacuity — the derivation is proven able to fail.** The three probes below ran
against in-memory deep clones of the parsed pack, so `tax-rules/federal/2026.json`
was never written; `git status --short tax-rules/federal/2026.json` was empty before
and after.

```
A. shipped pack           -> INCOMPLETE = 0
B. locator removed        -> INCOMPLETE = 1 [{"path":"dispositionPolicy.recaptureCategory","kind":"SOURCED","ok":false}]
C. absent-figure gutted   -> INCOMPLETE = 1 [{"path":"dispositionPolicy.residenceExclusion.maximumAmounts.amounts.head-of-household","kind":"ABSENT","ok":false}]
D. absence replaced by a borrowed 250000 -> ABSENT count = 0
shipped-pack ABSENT count = 1
```

Probe B proves a sourced figure without its own locator is caught. Probe C proves a
hollow absence is caught. Probe D is the borrowing case the row exists to forbid:
substituting the single amount for the head-of-household absence drops the
`AbsentFigure/v1` count from 1 to 0, so the shipped pack's retained absence is a
positive fact rather than the default.

**Retrieval window.** Both `retrievedAt` values (`2026-08-17T19:03:51Z` and
`2026-08-17T22:52:00Z`) precede the authoring of the commit that introduced this
feature, `b9d92a3f1` at `2026-08-18T12:17:13-07:00`, which is consistent with the
retrievals having been performed while the implementation was in progress. This
session performed no new primary-source retrieval and re-verified no figure against
a live authority; it verified that every figure is recorded on one of the two
branches the row allows, and that neither branch can be satisfied vacuously.

**Both refusal branches green.** `node scripts/selftest.mjs` — `3011 passed, 0
failed`, exit `0`, covering `TP-05-07` and `TP-05-13`; the browser branches
`TP-05-22` and `TP-05-23` are recorded under
`#browser-rows--intended-red-observed-in-this-session`.

## Test Evidence

### Shared unit run

Every `node scripts/selftest.mjs` row below was satisfied by ONE execution of that
command in this completion session. Its identity is recorded once here and each row
quotes the assertion line that execution emitted.

Command: `node scripts/selftest.mjs`
Exit code: `0`
Summary line: `Research-Lab self-test: 2719 passed, 0 failed`
Bounded capture: 3079 lines, sha256
`b955fe1261120b92ae904b327b5a7b283c4d6c36dd471c524e2c2ba209bab5d3`
Re-verify:
`bash .github/bubbles/scripts/evidence-capture.sh --verify b955fe1261120b92ae904b327b5a7b283c4d6c36dd471c524e2c2ba209bab5d3 -- node scripts/selftest.mjs`

### TP-05-01

Every Feature 022 preferential fixture produces its exact prior total before the
recapture category is registered, and every pre-existing federal pack figure is
byte-identical.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-01: every Feature 022 preferential fixture produces its exact prior preferential and total figures, settling identically with and without the registered recapture category so the registration is proven not to have reached inside the band walk, the pack stays valid, its digest is re-derivable and equals the configuration pointer, and a sampled pre-existing figure from every figure family this feature already carried is byte-identical
```

### TP-05-02

The gain-component contract refuses a pricing rule outside its closed set and a
recapture component carrying no maximum rate.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-02: GainComponent/v1 refuses a pricing rule outside the closed two-member set, refuses a component carrying no rule at all rather than defaulting one, refuses an own-maximum-rate component with no rate or no citation, the disposition refuses components that do not sum to the realised gain, and the declaration refuses a citation, a missing figure, a fractional month count and a property use outside the closed set
```

### TP-05-03

The two components sum to the total gain for every fixture, and the recapture
component is bounded by both the accumulated depreciation and the gain.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-03: the two components sum to the total gain for every fixture, the recapture component is bounded by both the cost recovery taken and the gain with the binding constraint named, the over-depreciated fixture is bounded by the gain rather than by the depreciation, and the default fixture reproduces Publication 523’s own worked $320,000 gain split into $20,000 of unrecaptured section 1250 gain and a $300,000 remainder
```

### TP-05-04

The recapture component's tax equals the sourced maximum rate applied to its amount,
and the remainder's tax equals the existing preferential model's result at that
stacking position.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-04: the recapture leg’s tax equals the sourced maximum rate read from the pack applied to its amount and carries that rate’s citation, and the remainder leg carries the gain remainder less whatever the exclusion removed, stacked on top of the household’s ordinary and existing preferential income rather than walked from zero
```

### TP-05-05

An implementation pricing the whole gain under one rule is proven to fail the
two-component assertion and to produce a different total.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-05: an implementation pricing the whole gain under one rule produces one component where the shipped implementation produces two with two distinct pricing rules, and prices the recapture portion at nothing where the shipped implementation prices it at the sourced maximum rate, so the two-component assertion is proven to discriminate
```

### TP-05-06

`rltaxdisposition.js` contains no stacking arithmetic and no rate literal, and the
scan fires on a module that duplicates the stacking.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-06: rltaxdisposition.js contains no band-walk arithmetic, no rate or amount literal and no authority name, the detector is proven to fire on a module that duplicates the stacking, the remainder is handed off to the single stackPreferentialIncome implementation in rltax.js, and the module is a UMD dual module
```

### TP-05-07

An absent recapture maximum rate refuses the recapture component without falling
back to the preferential model for the whole gain.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-07: a pack whose recapture maximum rate was not retrieved refuses the disposition entirely, produces no component and no leg, and in particular produces no leg carrying the whole gain priced under the preferential model in place of the refusal
```

### TP-05-08

Every remaining above-rate preferential category still refuses with its original
reason, on a fixture that exercises each refusal at least once.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-08: both remaining above-rate preferential categories still refuse with their original reason verbatim on a pack that exhibits each refusal, the recapture category has left the list rather than being renamed inside it, and the three disposition features this scope deliberately does not model are declared unsupported with a named successor rather than partially implemented
```

### TP-05-09

The ownership test and the use test each pass and fail exactly at their sourced
period figures, and each publishes the figure compared.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-09: the ownership test and the use test each pass at exactly the sourced period figure and fail one month below it, each publishes the figure compared and the lookback window it was measured over, the operator is the one the publication states, and a history failing one test still reports the other as passed
```

### TP-05-10

The exclusion amount equals the sourced amount for each filing status and the
excluded amount is bounded by the remainder component.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-10: the exclusion amount equals the sourced amount for each filing status the publication enumerates, it is applied to the remainder component, and the excluded amount is bounded by that component so a gain smaller than the limit excludes only the gain that exists rather than spilling onto the other component
```

### TP-05-11

An implementation applying the exclusion to the recapture component is proven to
fail.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-11: an implementation applying the exclusion to the recapture component reduces that component to nothing where the shipped implementation leaves it untouched at its full amount, so the exclusion-target assertion is proven to discriminate rather than to pass vacuously
```

### TP-05-12

An implementation evaluating the two tests as one combined condition is proven to
fail the named-failing-test assertion.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-12: an implementation evaluating both eligibility tests as one combined condition reaches the same verdict while naming no failing test, where the shipped implementation names exactly the one that failed and still publishes both outcomes, so the named-failing-test assertion is proven to discriminate
```

### TP-05-13

An absent exclusion amount or period figure refuses the exclusion and states the
refusal.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-13: a pack whose exclusion amount or period figure was not retrieved refuses the exclusion and excludes no gain, the head-of-household status refuses on the shipped pack because Publication 523 enumerates no amount for it, that absence is a real AbsentFigure naming the source that would supply it rather than a missing key or a zero, and the remainder leg carries the whole remainder unexcluded
```

### TP-05-14

The adjusted basis read here equals the figure Scope 03 published for every fixture
carrying cost recovery.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-14: for every fixture carrying cost recovery the adjusted basis this scope reads equals the figure the rental settlement published, the fixtures publish three distinct bases so the equality is not trivially true, a disposition with no rental settlement uses the declared basis and records that it did, and the disposition module never reaches into the rental engine to obtain either
```

### TP-05-15

Legs `L10` and `L11` appear in all four surfaces in both directions on the
all-non-zero fixture, and every prior leg still does.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-15: both disposition legs the engine produces reach the headline, the comparison, the curve and the export alongside every prior leg, the identity holds over the engine’s own leg set rather than a hand-maintained one, and the two ids are semantic — each names the pricing rule that produced it and the two rules differ
```

### TP-05-16

Removing each disposition leg from each of the four surfaces in turn fails the
leg-visibility identity with the missing leg named, and each omission changes the
headline by an amount unique to that leg.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-16: removing each disposition leg from each of the four surfaces in turn fails the identity with the missing leg named on the named surface, and the two legs carry distinct values so each omission moves the headline by an amount unique to that leg rather than by an amount either omission could have produced
```

### TP-05-17

The refusal vocabulary member count equals its pre-feature value, confirming this
feature added no code.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-17: the refusal vocabulary still has exactly its fourteen pre-feature members, and neither the rules module nor the disposition module names a disposition-specific code, so every condition this scope met folded into an existing member
```

### TP-05-18

The disposition declarations are inventoried, cleared, redacted, and absent from
every URL, request, referrer and console message.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-18: every disposition declaration is a declared workspace field, is named in the export’s omitted list, has no value in the exported bytes, refuses by name when undeclared, four of them are recorded as location-adjacent, and no disposition member reaches the committed configuration or any query string
```

### TP-05-21

The tool remains absent from every registry and from market-brief coverage.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-21: the lifetime tax lab and the disposition module remain absent from tools.json, the index, the navigation, both READMEs and market-brief coverage; registration is a later feature’s work and this scope performs none of it
```

### TP-05-PAGE

Page wiring: the section exists and is registered, the renderer returns early on both
the refusal and the loss shapes, every displayed value carries a contextual tooltip
and every disposition table carries an `aria-label`.
Command: `node scripts/selftest.mjs` · Exit code: `0`

```
  ✓ TP-05-PAGE: the page loads the disposition module, renders a Power section registered in the section list, carries one Simple field for the disposition total, returns early on both the refusal and the loss shapes rather than dereferencing members those shapes never publish, and gives every displayed disposition value a contextual tooltip and every disposition table an aria-label
```

### Browser rows — intended RED, observed in this session

The four browser rows were RED at the start of this session and GREEN after the spec
repairs. The RED was a defect in the spec's own assertions rather than an absent
implementation, which is why the repair is spec-side in all four cases. Verbatim,
from `npx playwright test tests/lifetime-tax-disposition.spec.mjs --project=system-chrome --reporter=line`,
exit code `1`:

```
Running 4 tests using 1 worker
  1) [system-chrome] › tests/lifetime-tax-disposition.spec.mjs:92:1 › Regression: SCN-023-014 the gain splits into two legs priced under different rules

    Error: expect(locator).toHaveAttribute(expected) failed

    Locator: locator('#power-disposition [data-rl-unavailable]').first()
    Expected: "RLTAX-THRESHOLD-UNAVAILABLE"
    Timeout: 5000ms
    Error: element(s) not found

  2) [system-chrome] › tests/lifetime-tax-disposition.spec.mjs:160:1 › Regression: SCN-023-015 the residence exclusion applies to the remainder only and names a failing test

    Error: expect(received).toContain(expected) // indexOf

    Expected substring: "disposition-recapture, which stays at 20000"
    Received string:    "both eligibility tests passed against the period figures the publication states The exclusion limit for your filing status is 250000 cited to irs-p523-2025. It removed 250000 from disposition-remainder and nothing at all from disposition-recapture which stays at 20000."

  3) [system-chrome] › tests/lifetime-tax-disposition.spec.mjs:218:1 › Regression: SCN-023-014 both disposition legs reach the headline, the comparison, the curve and the export

    Error: expect(locator).toBeVisible() failed

    Locator: locator('#simple [data-rl-leg="disposition-recapture"]')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

  4) [system-chrome] › tests/lifetime-tax-disposition.spec.mjs:271:1 › Regression: SCN-023-015 the request ledger stays empty and no disposition declaration reaches a URL

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: ""
    Received: "#power"

  4 failed
EXIT=1
```

Same command after the repairs, exit code `0`:

```
Running 4 tests using 1 worker
  4 passed (3.7s)
EXIT=0
```

### Scenario SCN-023-014

The gain splits into two legs priced under different rules.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-014 the gain splits into two legs priced under different rules" --reporter=list`
Exit code: `0`

```
Running 1 test using 1 worker

  ✓  1 …23-014 the gain splits into two legs priced under different rules (1.1s)

  1 passed (2.2s)
TP_05_22_EXIT=0
```

### Scenario SCN-023-015

The residence exclusion applies to the remainder only and names a failing test.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-015 the residence exclusion applies to the remainder only and names a failing test" --reporter=list`
Exit code: `0`

```
Running 1 test using 1 worker

  ✓  1 …exclusion applies to the remainder only and names a failing test (808ms)

  1 passed (1.8s)
TP_05_23_EXIT=0
```

### TP-05-24

Both disposition legs reach the headline, the comparison, the curve and the export in
the browser.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-014 both disposition legs reach the headline, the comparison, the curve and the export" --reporter=list`
Exit code: `0`

```
Running 1 test using 1 worker

  ✓  1 …egs reach the headline, the comparison, the curve and the export (748ms)

  1 passed (1.7s)
TP_05_24_EXIT=0
```

### TP-05-25

The request ledger stays empty and no disposition declaration reaches a URL.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-015 the request ledger stays empty and no disposition declaration reaches a URL" --reporter=list`
Exit code: `0`

```
Running 1 test using 1 worker

  ✓  1 … ledger stays empty and no disposition declaration reaches a URL (689ms)

  1 passed (1.6s)
TP_05_25_EXIT=0
```

### TP-05-26

The cumulative browser suite over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`
Exit code: `0`

Bounded capture: 42 lines, sha256
`1594dfbb7d809d6c856c9ac3b740b339af99686680479bfce07d0cbe093da3da`

```
Running 37 tests using 6 workers
…
  37 passed (12.2s)
```

The same 37 tests also pass under the whole-file form
`npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line`,
exit code `0`, `37 passed (12.1s)`. Before the repairs that form reported
`33 passed, 4 failed`, exit code `1`.

### TP-05-27

The whole-repository suite.
Command: `node scripts/selftest.mjs`
Exit code: `0`

```
================================================
Research-Lab self-test: 2719 passed, 0 failed
================================================
```

The pass count did not fall: the count stated in the completion request before this
session's changes was 2719 passed, 0 failed, and it is 2719 passed, 0 failed after
them. This session added no unit assertion; it repaired four browser assertions.

### TP-05-28

Zero new missing spec-referenced test paths.
Command: `node scripts/validate-spec-test-paths.mjs`
Exit code: `0`

```
[spec-test-paths] scanned=602 references=13616 distinctPaths=231 missingPaths=71 baseline=77 new=0 stale=6
  STALE-BASELINE: 6 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/causal-rotation-adversarial.spec.mjs
      tests/causal-rotation-brief.spec.mjs
      tests/causal-rotation-consumers.spec.mjs
      tests/causal-rotation-delivery.spec.mjs
      tests/causal-rotation-pages.spec.mjs
      tests/causal-rotation-registry.spec.mjs
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
SPEC_TEST_PATHS_EXIT=0
```

`new=0` is the row's assertion. The six stale entries are pre-existing and belong to
the causal-rotation feature; `scripts/validate-spec-test-paths.baseline` is on this
scope's excluded list and was not edited.

### TP-05-29

The Pages plan succeeds and `tax-rules/` remains outside the public directories.
Command: `node scripts/build-pages-site.mjs --dry-run`
Exit code: `0`

```
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":9,"rootFiles":114,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
PAGES_EXIT=0
```

`directories` carries no `tax-rules` entry and no new root HTML page was registered
(`registeredPages` is 28, and `lifetime-tax-strategy-lab.html` is one of the nine
`excludedPaths`).

## Per-Row Intended-RED Probes

The GREEN half of every `node scripts/selftest.mjs` row is the shared clean run
recorded under [Shared unit run](#shared-unit-run). The RED half is recorded here,
one probe per row. Each probe is **mutation-derived rather than
before-implementation**, and is recorded as such: it removes the behaviour its row
names, runs the command the row names, then reverts explicitly inside the same
process and verifies the revert before the next probe opens. No two probes are
ever live at once.

**Probe discipline.** Every mutation is value-free by construction — a boolean
term, an identifier swap, an arithmetic term, or one added code literal — so a
slipped revert could not have disclosed a household figure. Each probe refuses to
start if its file is already dirty, refuses to apply unless its search text occurs
**exactly once**, and prints `dirty`, `mutation_left` and `original_restored`
after reverting.

**Reading the counts.** The repository baseline in this session is
`3113 passed, 1 failed`; the one standing failure is the spec-test-path guard
reporting `1 new` missing path from a concurrent session's untracked
`specs/027-*` work, and it appears in every capture below. A probe's own RED is
the assertion named beyond that standing one.

### Probe 1 — RED for TP-05-04 and TP-05-05

`rltaxdisposition.js`, in `gainComponent`: the recapture component's tax stops
being the sourced rate applied to its amount.

```diff
-      component.tax = amount * rule.maximumRate;
+      component.tax = amount;
```

```text
PROBE A2  expect=TP-05-04   file=rltaxdisposition.js
  cmd=node scripts/selftest.mjs
  guard_matches=1
  applied=1
  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3111 passed, 3 failed
  RED_FAIL=✗ FAIL: TP-05-04: the recapture leg’s tax equals the sourced maximum rate read from the pack applied to its amount and carries that rate’s citation …
  RED_FAIL=✗ FAIL: TP-05-05: an implementation pricing the whole gain under one rule produces one component where the shipped implementation produces two …
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

TP-05-05 falls with it and that is the honest reading: TP-05-05's adversarial
comparison is *against* the shipped pricing, so removing the shipped rate removes
the thing the comparison discriminates from. Both rows are named, so both carry
RED from this probe.

### Probe 2 — RED for TP-05-07

`rltaxdisposition.js`, in `computeDisposition`: the unresolved-rate refusal stops
being returned whole, which is exactly the fallback the row forbids.

```diff
-    if (rules.isUnavailable(recaptureRule)) return recaptureRule;
+    if (false && rules.isUnavailable(recaptureRule)) return recaptureRule;
```

```text
PROBE A3  expect=TP-05-07   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3112 passed, 2 failed
  RED_FAIL=✗ FAIL: TP-05-07: a pack whose recapture maximum rate was not retrieved refuses the disposition entirely, produces no component and no leg, and in particular produces no leg carrying the whole gain priced under the preferential model in place of the refusal
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

Exactly one assertion beyond the standing failure, and it is this row's.

### Probe 3 — RED for TP-05-10

`rltaxdisposition.js`, in `applyResidenceExclusion`: the exclusion stops being
bounded by the component it may be applied to.

```diff
-    var excluded = eligible ? Math.min(rule.maximumAmount, excludable) : 0;
+    var excluded = eligible ? rule.maximumAmount : 0;
```

```text
PROBE A5  expect=TP-05-10   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3112 passed, 2 failed
  RED_FAIL=✗ FAIL: TP-05-10: the exclusion amount equals the sourced amount for each filing status the publication enumerates, it is applied to the remainder component, and the excluded amount is bounded by that component so a gain smaller than the l…
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

### Probe 4 — RED for TP-05-14, and a cross-scope confirmation

`rltaxrental.js`, in `computeCostRecovery`: the published adjusted basis stops
being the declared basis less the accumulated recovery.

```diff
-      adjustedBasis: activity.depreciableBasis - accumulated,
+      adjustedBasis: activity.depreciableBasis,
```

```text
PROBE A6  expect=TP-05-14   file=rltaxrental.js   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3111 passed, 3 failed
  RED_FAIL=✗ FAIL: TP-03-15: the adjusted basis equals the declared basis less the accumulated recovery at every point of the period including its final year, and the settlement republishes the same figure the cost-recovery record carries
  RED_FAIL=✗ FAIL: TP-05-14: for every fixture carrying cost recovery the adjusted basis this scope reads equals the figure the rental settlement published, the fixtures publish three distinct bases so the equality is not trivially true …
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

The pair is informative rather than over-broad: TP-05-14 asserts this scope reads
the *same* figure Scope 03 publishes, so the producer's own row falling alongside
the consumer's is the coupling the row exists to pin.

### Probe 5 — RED for TP-05-09

`rltaxdisposition.js`, in `evaluateTest`: the required period shifts by one month,
so the sourced boundary is no longer the boundary the tests are decided at.

```diff
-    var required = figure.minimumMonths;
+    var required = figure.minimumMonths - 1;
```

```text
PROBE B2  expect=TP-05-09   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3111 passed, 3 failed
  RED_FAIL=✗ FAIL: TP-05-09: the ownership test and the use test each pass at exactly the sourced period figure and fail one month below it, each publishes the figure compared and the lookback window it was measured over, the oper…
  RED_FAIL=✗ FAIL: TP-05-12: an implementation evaluating both eligibility tests as one combined condition reaches the same verdict while naming no failing test …
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

**A discarded first attempt is recorded rather than hidden.** The first aim at
this row flipped the `greater-than` branch's comparison to the `at-least` form.
It produced no RED at all, because the shipped pack declares the `at-least`
operator, so that branch never runs and the mutation was inert. An inert mutation
is not a weak assertion and it is not a RED; it was discarded and the probe
re-aimed at the figure both branches read.

### Probe 6 — RED for TP-05-11

`rltaxdisposition.js`, in `applyResidenceExclusion`: the component-selection test
is swapped, so the exclusion lands on the recapture component — the exact error
the row exists to forbid.

```diff
-      if (disposition.components[index].pricingRule === "preferential-stacking") {
+      if (disposition.components[index].pricingRule === "own-maximum-rate") {
```

```text
PROBE B3  expect=TP-05-11   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3111 passed, 3 failed
  RED_FAIL=✗ FAIL: TP-05-10: the exclusion amount equals the sourced amount for each filing status the publication enumerates, it is applied to the remainder component …
  RED_FAIL=✗ FAIL: TP-05-11: an implementation applying the exclusion to the recapture component reduces that component to nothing where the shipped implementation leaves it untouched at its full amount, so the exclusion-target as…
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

**The discrimination against Probe 3 is the point of the pair.** Probe 3 removed
the *bound* and fell TP-05-10 alone; this probe moves the *target* and fells
TP-05-11 as well. Neither probe can be mistaken for the other by its failure set.

### Probe 7 — RED for TP-05-12

`rltaxdisposition.js`, in `applyResidenceExclusion`: the failing test stops being
named as itself.

```diff
-    if (!use.passed) failed.push(use.testId);
+    if (!use.passed) failed.push(ownership.testId);
```

```text
PROBE B4  expect=TP-05-12   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3111 passed, 3 failed
  RED_FAIL=✗ FAIL: TP-05-09: the ownership test and the use test each pass at exactly the sourced period figure and fail one month below it …
  RED_FAIL=✗ FAIL: TP-05-12: an implementation evaluating both eligibility tests as one combined condition reaches the same verdict while naming no failing test, where the shipped implementation names exactly the one that failed a…
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

### Probe 8 — RED for TP-05-02

`rltaxrules.js`, in `validateGainComponent`: the closed pricing-rule set stops
being enforced.

```diff
-    if (GAIN_PRICING_RULES.indexOf(component.pricingRule) < 0) {
+    if (false && GAIN_PRICING_RULES.indexOf(component.pricingRule) < 0) {
```

```text
PROBE B6  expect=TP-05-02   file=rltaxrules.js   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3112 passed, 2 failed
  RED_FAIL=✗ FAIL: TP-05-02: GainComponent/v1 refuses a pricing rule outside the closed two-member set, refuses a component carrying no rule at all rather than defaulting one, refuses an own-maximum-rate component with no rate or …
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

### Probe 9 — RED for TP-05-17

`rltaxrules.js`: one member is added to the single refusal-vocabulary
declaration. The added name is deliberately neutral rather than
disposition-shaped, so the probe tests the **count** clause the row states and
not the separate no-disposition-code clause.

```diff
     "RLTAX-RECONCILE": true,
+    "RLTAX-PROBE-EXTRA": true,
     "RLTAX-SCOPE-DEFERRED": true,
```

```text
PROBE B7  expect=TP-05-17   file=rltaxrules.js   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3103 passed, 11 failed
  RED_FAIL=✗ FAIL: TP-05-17: the refusal vocabulary still has exactly its fourteen pre-feature members, and neither the rules module nor the disposition module names a disposition-specific code …
  RED_FAIL=✗ FAIL: TP-05-17: at feature end the refusal vocabulary still carries exactly its fourteen pre-feature members in both directions, each still raised in the one module that declares them, no second vocabulary was introdu…
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

**This probe is deliberately broad, and its breadth is the finding.** Ten rows
across Features 021 to 024 fell together — `TP-01-05`, `TP-01-14` twice,
`TP-02-13`, `TP-02-15`, `TP-03-01`, `TP-03-18`, `TP-04-19` and both `TP-05-17`
assertions. That is the vocabulary invariant doing what it was written to do: it
is asserted once per scope on purpose, so a single added code cannot slip past
any of them.

### Probe 10 — RED for TP-05-06

`rltaxdisposition.js`: one unused rate-shaped literal is planted at module scope.
It is unused on purpose — the row forbids the module *holding* a rate, not using
one, so an unused declaration is the strongest form of the probe.

```diff
   var RECAPTURE_COMPONENT_ID = "disposition-recapture";
+  var probeUnusedRate = 0.25;
```

```text
PROBE B8  expect=TP-05-06   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3112 passed, 2 failed
  RED_FAIL=✗ FAIL: TP-05-06: rltaxdisposition.js contains no band-walk arithmetic, no rate or amount literal and no authority name, the detector is proven to fire on a module that duplicates the stacking, the remainder is handed o…
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

### Probe 11 — RED for TP-05-03

`rltaxdisposition.js`, in `splitGain`: the two `boundBy` strings are swapped, so
the record names the constraint that did **not** bind.

```diff
       boundBy: recaptureAmount === gain && accumulatedCostRecovery > gain
-        ? "the total gain"
-        : "the cost recovery taken",
+        ? "the cost recovery taken"
+        : "the total gain",
```

```text
PROBE C1  expect=TP-05-03   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3112 passed, 2 failed
  RED_FAIL=✗ FAIL: TP-05-03: the two components sum to the total gain for every fixture, the recapture component is bounded by both the cost recovery taken and the gain with the binding constraint nam…
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

**A discarded first attempt is recorded rather than hidden.** The first aim
replaced the whole `Math.max(0, Math.min(...))` bound. It made the disposition
group *throw* rather than fail its row, which is an over-broad probe and not a
RED for this row: a group that never reaches its assertion has not shown that
assertion to discriminate. It was discarded and the probe re-aimed at the single
clause the row names.

### Probe 12 — RED for TP-05-15

`rltaxdisposition.js`: the recapture component's id is changed, so the leg the
engine produces is no longer the leg the surfaces are checked for.

```diff
-  var RECAPTURE_COMPONENT_ID = "disposition-recapture";
+  var RECAPTURE_COMPONENT_ID = "disposition-recapture-probe";
```

```text
PROBE D1  expect=TP-05-15   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3107 passed, 4 failed
  RED_FAIL=✗ FAIL: TP-05-15: both disposition legs the engine produces reach the headline, the comparison, the curve and the export alongside every prior leg, the identity holds over the engine’s own…
  RED_FAIL=✗ FAIL: TP-05-11: an implementation applying the exclusion to the recapture component reduces that component to nothing …
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

**A discarded first attempt is recorded rather than hidden.** The first aim
removed the recapture leg from the published `legs` array outright. The
disposition group threw on the missing leg before reaching the row, so it was
discarded for the same reason as Probe 11's first attempt.

### Probe 13 — RED for TP-05-16

`rltaxproperty.js`, in the leg-visibility identity: a finding stops carrying the
legs it found missing, so an omission is no longer *named*.

```diff
-          missingFromSurface: Object.freeze(missing),
+          missingFromSurface: Object.freeze([]),
```

```text
PROBE C3  expect=TP-05-16   file=rltaxproperty.js   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3105 passed, 9 failed
  RED_FAIL=✗ FAIL: TP-05-16: removing each disposition leg from each of the four surfaces in turn fails the identity with the missing leg named on the named surface, and the two legs carry distinct va…
  RED_FAIL=✗ FAIL: TP-01-13: removing the property leg from each of the four surfaces in turn fails the identity, each failure names the missing leg rather than reporting a numeric mismatch …
  RED_FAIL=✗ FAIL: TP-03-16 and TP-03-17: the rental leg reaches all four surfaces on the all-non-zero fixture alongside the property leg …
  RED_FAIL=✗ FAIL: TP-04-17 and TP-04-18: the classification leg reaches all four surfaces on the all-non-zero fixture alongside the property and rental legs …
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

**The breadth is the finding, not a defect in the probe.**
`legVisibilityIdentity` is the single helper every scope's leg-visibility row
consumes, so nine rows across Features 021 to 024 fall together. A per-scope copy
of that helper would have let this mutation pass eight of them; one shared helper
is what makes it impossible.

### Probe 14 — RED for TP-05-18

`rltaxworkspace.js`, in the export sanitiser: a withheld member stops being
listed in `omittedFields`, which is the "dropped without being listed" failure
the surrounding comment names.

```diff
-      if (!Object.prototype.hasOwnProperty.call(kept, keys[index])) omitted.push(keys[index]);
+      if (false && !Object.prototype.hasOwnProperty.call(kept, keys[index])) omitted.push(keys[index]);
```

```text
PROBE C5  expect=TP-05-18   file=rltaxworkspace.js   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3103 passed, 11 failed
  RED_FAIL=✗ FAIL: TP-05-18: every disposition declaration is a declared workspace field, is named in the export’s omitted list, has no value in the exported bytes, refuses by name when undeclared, fo…
  RED_FAIL=✗ FAIL: TP-03-20: every rental declaration is a declared workspace field, is named in the export’s omitted list …
  RED_FAIL=✗ FAIL: TP-04-21: both day-count declarations are declared workspace fields, are named in the export’s omitted list …
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

The mutation is a boolean term rather than a data edit, so no household value
existed in the tree even while it was applied. Eleven privacy rows across the
four features fall together for the same shared-sanitiser reason as Probe 13.

### Probe 15 — RED for TP-05-08

`rltax.js`, in `unsupportedFeatureNotices`: the entries that move the marginal
rate stop being surfaced, which is exactly the set the row's two remaining
above-rate categories live in.

```diff
       var entry = pack.unsupportedFeatures[index];
+      if (entry.movesMarginalRate === true) continue;
       notices.push(Object.freeze({
```

```text
PROBE D2  expect=TP-05-08   file=rltax.js   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3110 passed, 4 failed
  RED_FAIL=✗ FAIL: TP-05-08: both remaining above-rate preferential categories still refuse with their original reason verbatim on a pack that exhibits each refusal, the recapture category has left th…
  RED_FAIL=✗ FAIL: TP-02-10: the surfaced notice id set equals the pack’s unsupportedFeatures id set in both directions …
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

**A discarded first attempt is recorded rather than hidden.** The first aim
started the notice loop one entry late. It fell `TP-02-10` and left `TP-05-08`
green, which is the correct result rather than a weak assertion: the dropped
entry was not one of the two above-rate categories this row is about. Dropping a
row the probe did not name is not RED for the row it did, so the probe was
re-aimed at the `movesMarginalRate` set.

### Probe 16 — RED for TP-05-19 and TP-05-20

The scope index's ownership table, in this feature's own artifacts: Scope 05's
declared entry count is moved off the number of entries the row actually lists.

```diff
-| 05 | SUP-023-09 | 1 |
+| 05 | SUP-023-09 | 2 |
```

```text
PROBE D3  expect=TP-05-19   file=specs/023-…/scopes/_index.md   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3111 passed, 3 failed
  RED_FAIL=✗ FAIL: TP-05-19 and TP-05-20: the ledger row count, the ownership column’s own sum and the total its arithmetic sentence states all agree, Scope 05 owns exactly the one entry the table lis…
  RED_FAIL=✗ FAIL: TP-03-26: the ledger row count, the ownership column’s own sum and the total its arithmetic sentence states all agree …
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

The mutation is one digit in a governance table, so it could disclose nothing at
all, and the pair falling together is the cross-check working: Scope 03's row
audits the same table from the other end.

### Probe 17 — RED for TP-05-21

`rlnav.js`: one comment naming the route is planted. It is a comment rather than
a navigation entry on purpose — the row forbids the route *appearing* in the
registration surfaces, and a comment proves the detector reads the file rather
than only its parsed structure. Nothing was registered: no nav item, no tool
record, no link.

```diff
 (function () {
+  /* probe token: lifetime-tax-strategy-lab */
```

```text
PROBE D4  expect=TP-05-21   file=rlnav.js   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3105 passed, 9 failed
  RED_FAIL=✗ FAIL: TP-05-21: the lifetime tax lab and the disposition module remain absent from tools.json, the index, the navigation, both READMEs and market-brief coverage; registration is a later f…
  RED_FAIL=✗ FAIL: TP-05-REGISTRATION: the lifetime tax lab and its modules remain absent from tools.json, the index, the navigation and both READMEs, and site-exclusions.json still carries exactly th…
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

Nine no-registration rows across the four features fall together, and each names
`rlnav.js` as the file it found the token in — so the failure is attributable to
the surface rather than merely to the feature.

### Probe 18 — RED for TP-05-01

<a id="tp-05-01"></a>

TP-05-01 is the compatibility row: registering a category inside the preferential
family must not reach into the band walk, so the same Feature 022 fixtures must
settle identically with the disposition policy present and with it removed. The
mutation adds **one term to that local sum** in the settlement engine, conditioned
on the policy being present — the smallest possible leak of the registration into
the walk. The added term is the literal `1`, so the mutation carries no figure of
any kind and a slipped revert could not have disclosed a household value.

```diff
-      preferentialTaxRecord = valued(preferentialWalk.tax, rules.ruleStatusFor(pack, preferentialTable), {
+      preferentialTaxRecord = valued(preferentialWalk.tax + (pack.dispositionPolicy ? 1 : 0), rules.ruleStatusFor(pack, preferentialTable), {
```

```text
PROBE 18  expect=TP-05-01   module=RLTAX (settlement engine)   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3108 passed, 6 failed
  RED_SHA256=d99aaf7f34e503f03aa980f68c071e6db0167d921651ae52932cf3d8c056acc3
  RED_FAIL=✗ FAIL: TP-05-01: every Feature 022 preferential fixture produces its exact prior preferential and total figures, settling identically with and without the registered recapture category so the registration is proven not to have reached inside the band walk, the pack stays valid, its digest is re-d…
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

The RED was captured through `evidence-capture.sh`, so the recorded exit code and
the SHA-256 over all 3526 output lines were produced by the run rather than by
hand, and the block is re-checkable with `--verify` against the same mutation.

Six failures stand where one stood. The standing one is the foreign
spec-test-path guard described in the preamble; of the five new ones, TP-05-01 is
this row's own. The other four — a California pooling row and three preferential
breakpoint rows — are the same one-cent-per-settlement leak observed from other
surfaces, which is the point: a term that reached the band walk is visible to
every assertion that prices a preferential band, and TP-05-01 names the
registration as the cause.

### Probe 19 — RED for TP-05-13

<a id="tp-05-13"></a>

TP-05-13 requires that an absent exclusion amount **or** an absent period figure
refuses the exclusion, excludes no gain, and states the refusal under
`RLTAX-THRESHOLD-UNAVAILABLE`. The mutation disables the period half of that gate
by conjoining a **boolean literal** to its refusal condition, leaving the amount
half intact — so the probe discriminates the two halves rather than knocking out
the whole rule. The mutation is a boolean term and carries no figure.

```diff
-      if (isUnavailable(resolvedTest)) return resolvedTest;
+      if (false && isUnavailable(resolvedTest)) return resolvedTest;
```

```text
PROBE 19  expect=TP-05-13   module=RLTAXRULES (residence-exclusion gate)   cmd=node scripts/selftest.mjs
  guard_matches=1  applied=1  RED_EXIT=1
  RED_SUMMARY=Research-Lab self-test: 3112 passed, 2 failed
  RED_SHA256=cc9bf7b26907e9b8eff8e22597be84363c204fb93ece997c2cf805860299cba7
  RED_FAIL=✗ FAIL: TP-05-13: a pack whose exclusion amount or period figure was not retrieved refuses the exclusion and excludes no gain, the head-of-household status refuses on the shipped pack because Publication 523 enumerates no amount for it, that absence is a real AbsentFigure naming the source that wo…
  REVERTED dirty=0 mutation_left=0 original_restored=1
```

Two failures stand where one stood, and the second is exactly this row. The
discrimination is the point: disabling only the period half still refuses on the
amount half, so a gate that covered one of the two figures and not the other
would have passed a weaker assertion — this one names the period figure and
fails. The capture ran through `evidence-capture.sh`, so the exit code and the
SHA-256 over all 3526 lines were produced by the run and are re-checkable with
`--verify`.

### The browser rows and the cumulative suite — probes 20 to 24

Probes 1 to 19 close `TP-05-01` through `TP-05-21`, every one of which names
`node scripts/selftest.mjs`. The five rows below name **browser** commands
instead, and each is a distinct Playwright invocation, so each needs its own
mutation-derived RED under **its own** command rather than an inherited one.

The discipline of the earlier probes is unchanged and is restated because these
mutations touch shipped modules: every mutation is **value-free by construction**
— a rule identifier drawn from a closed set, a component id, a member *name*, or
the literal `1` — so a slipped revert could not have disclosed a household
figure. Each probe records the file's SHA-256 before the mutation, re-reads it
after `git checkout --` in the **same shell invocation**, and prints
`REVERT_VERIFIED`. No probe was held open across a tool call, and
`git status --short` was clean over the module set after each one.

The earlier browser RED recorded under
`report.md#browser-rows--intended-red-observed-in-this-session` was a defect in
the spec's own assertions rather than a mutation-derived RED. It is retained as
history; the probes below are what close the rows.

### Probe 20 — RED for TP-05-22

<a id="tp-05-22-red"></a>

`TP-05-22` rests on the claim that the two components are priced under
**different** rules. The mutation makes the remainder claim the recapture's rule
at construction, so both components carry `own-maximum-rate` and the assertion
that sorts the two rendered rules has one value to sort. The mutated token is a
rule identifier from the module's own closed set, so it carries no figure.

```diff
-        split.remainderAmount, "preferential-stacking", recaptureRule)
+        split.remainderAmount, "own-maximum-rate", recaptureRule)
```

```text
PROBE 20  expect=TP-05-22   file=rltaxdisposition.js:166   guard_matches=1  applied=1
  cmd=npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome
      --grep "Regression: SCN-023-014 the gain splits into two legs priced under different rules"
      --reporter=list
  BEFORE_SHA=6406bf7fdc3ccfc0be5175603b7098870dff0912db8dd4133066662a570a6110
  RED_EXIT=1   RED_LINES=37
  RED_SHA256=e3e7d28678f5f763b52b4766cff40d4c4c99fe7672c4f08b3c594b3c431d0aca
  RED_FAIL=✘ 1 [system-chrome] › …lifetime-tax-disposition…:103:1 › Regression: SCN-023-014 the gain
           splits into two legs priced under different rules (6.2s)  →  1 failed
  REVERT_VERIFIED=yes
  GREEN_EXIT=0  GREEN_LINES=6
  GREEN_SHA256=04b75aef52cd0b58e7d6d63db62b0fc9ee7ff9366489c116af22747c5ce808b9
  GREEN=✓ 1 passed (2.8s)
```

The RED is the row's own scenario and no other, which is the discrimination:
collapsing the two rules does not disturb the leg census or the exclusion, so a
reader can attribute the failure to the pricing claim rather than to the module
having stopped working generally.

### Probe 21 — RED for TP-05-23

<a id="tp-05-23-red"></a>

`TP-05-23` owns the interaction the module's own header calls the thing most
tools get wrong: the residence exclusion applies to the **remainder only**, and
the recapture component is republished unchanged. The exclusion picks its target
by matching the remainder's pricing rule. The mutation inverts that match, so the
exclusion is applied to the recapture component and the remainder is republished
instead — precisely the error the row forbids. Again the mutated token is a rule
identifier, not a figure.

```diff
-      if (disposition.components[index].pricingRule === "preferential-stacking") {
+      if (disposition.components[index].pricingRule === "own-maximum-rate") {
```

```text
PROBE 21  expect=TP-05-23   file=rltaxdisposition.js:239   guard_matches=1  applied=1
  cmd=npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome
      --grep "Regression: SCN-023-015 the residence exclusion applies to the remainder only and
             names a failing test" --reporter=list
  BEFORE_SHA=6406bf7fdc3ccfc0be5175603b7098870dff0912db8dd4133066662a570a6110
  RED_EXIT=1   RED_LINES=28
  RED_SHA256=2e046aa67fb7fb87a38946ae4ed1a4c1ca7b8aa8c95532a936c903836d9fd8d5
  RED_FAIL=✘ 1 [system-chrome] › …lifetime-tax-disposition…:187:1 › Regression: SCN-023-015 the
           residence exclusion applies to the remainder only and names a failing test (1.1s)
  REVERT_VERIFIED=yes
  GREEN_EXIT=0  GREEN_LINES=6
  GREEN_SHA256=9fa1d10ccc29e55e5b100b92de9b2daed672c6e947953e0b08e14842e0ded75a
  GREEN=✓ 1 passed (2.0s)
```

**This probe is the one that matters most in the set.** The row's assertion is
not that an exclusion happened but that it happened to the *right* component, and
a swap is the only mutation that leaves every amount well-formed while making the
answer wrong. An assertion that had only checked "an exclusion was applied" would
have survived this mutation; this one does not.

### Probe 22 — RED for TP-05-24

<a id="tp-05-24-red"></a>

`TP-05-24` is the census row: each leg reaches every declared surface exactly
once and appears once in the exported leg record. The mutation renames the
remainder component id, so the leg the census looks for is present under a name
no surface declares. The mutated value is an identifier, not a figure. It is the
sibling of Probe 12, which renamed the *recapture* id against the selftest row —
the two cannot be confused by their failure sets.

```diff
-  var REMAINDER_COMPONENT_ID = "disposition-remainder";
+  var REMAINDER_COMPONENT_ID = "disposition-remainder-probe";
```

```text
PROBE 22  expect=TP-05-24   file=rltaxdisposition.js:53   guard_matches=1  applied=1
  cmd=npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome
      --grep "Regression: SCN-023-014 both disposition legs reach the headline, the comparison,
             the curve and the export" --reporter=list
  BEFORE_SHA=6406bf7fdc3ccfc0be5175603b7098870dff0912db8dd4133066662a570a6110
  RED_EXIT=1   RED_LINES=36
  RED_SHA256=0dd23ad238019de0a6509e81cbd3cd1b78d4f015ebc17dbb75629fbc5e516202
  RED_FAIL=✘ 1 [system-chrome] › …lifetime-tax-disposition…:251:1 › Regression: SCN-023-014 both
           disposition legs reach the headline, the comparison, the curve and the export (779ms)
  REVERT_VERIFIED=yes
  GREEN_EXIT=0  GREEN_LINES=6
  GREEN_SHA256=4fb3575ced8648388067f6e8bd36e0469fd715f1b4db3c44dede6cf32b56bf1d
  GREEN=✓ 1 passed (2.0s)
```

The row already carries its own in-test discrimination — it deletes a rendered
node last and requires the census to name the damaged surface — so this probe
proves the complementary half: the census also fires when the leg never reaches
the surfaces under the name they declare.

### Probe 23 — RED for TP-05-25

<a id="tp-05-25-red"></a>

`TP-05-25` is the privacy row. It reads every request URL, the address bar, the
referrer and every console message, and requires that no declaration **member
name** and no declared figure appears in any of them. The mutation emits a single
console message carrying one member name — `saleProceeds`, the *name* of the
field and never its value — from module load. Nothing about a household is
emitted, and that is the point of choosing the name half of the assertion: the
probe proves the console channel is really read without putting a figure anywhere
near a mutation that could survive a slipped revert.

```diff
-  var EXCLUSION_CONTRACT = "ResidenceExclusionOutcome/v1";
+  var EXCLUSION_CONTRACT = "ResidenceExclusionOutcome/v1"; if (typeof console !== "undefined") console.log("saleProceeds");
```

```text
PROBE 23  expect=TP-05-25   file=rltaxdisposition.js:46   guard_matches=1  applied=1
  cmd=npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome
      --grep "Regression: SCN-023-015 the request ledger stays empty and no disposition
             declaration reaches a URL" --reporter=list
  BEFORE_SHA=6406bf7fdc3ccfc0be5175603b7098870dff0912db8dd4133066662a570a6110
  RED_EXIT=1   RED_LINES=28
  RED_SHA256=72b8a1485d9d85736026461d5cc0e2439531954a1e18442f8dea80e0d0c83f1d
  RED_FAIL=✘ 1 [system-chrome] › …lifetime-tax-disposition…:307:1 › Regression: SCN-023-015 the
           request ledger stays empty and no disposition declaration reaches a URL (1.1s)
  REVERT_VERIFIED=yes
  GREEN_EXIT=0  GREEN_LINES=6
  GREEN_SHA256=909d45e9a0b26825a5a97b3d7a4cde8736ff5df28ee19fb366cc441706f78435
  GREEN=✓ 1 passed (2.2s)
```

**The console channel was the weakest of the four the row watches**, because it
is the one a reader is least likely to think of as an exfiltration path, and it
is the one this probe chose for that reason. The request-URL, hash and referrer
halves are watched by the same loop over the same member-name list, so a probe
that reached any one of the four proves the list is applied rather than declared.

### Probe 24 — RED for TP-05-26, the cumulative suite

<a id="tp-05-26-red"></a>

`TP-05-26` does not claim that this scope's own scenarios pass — the four probes
above already prove those. It claims something only a cumulative run can claim:
that **every** scenario owned by features 021 through 024 still passes over the
real route, "not a convenient subset". A mutation inside this scope's own module
would therefore be the wrong probe for it, because a suite that had silently
narrowed to Feature 023 would still have gone red.

The mutation is placed instead in the **Feature 022 settlement engine**, outside
this scope's owned files, and is conditioned on the disposition policy being
present — the smallest possible leak of this feature's registration into the
preferential band walk. The added term is the literal `1`, so it carries no
figure of any kind.

```diff
-      preferentialTaxRecord = valued(preferentialWalk.tax, rules.ruleStatusFor(pack, preferentialTable), {
+      preferentialTaxRecord = valued(preferentialWalk.tax + (pack.dispositionPolicy ? 1 : 0), rules.ruleStatusFor(pack, preferentialTable), {
```

```text
PROBE 24  expect=TP-05-26   file=rltax.js:677   guard_matches=1  applied=1
  cmd=npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome
      --grep "SCN-02[1-4]" --reporter=list
  BEFORE_SHA=6854d22ac8daf1acc54b2852383dc2ad4036c5c4fc6361eeafaebd101a136acd
  RED_EXIT=1   RED_LINES=187   RED_TOTALS=77 selected, 73 passed, 4 failed (1.3m)
  RED_SHA256=373526b6a090ab47b008f89c6b133e6ece957258effd25f9e83e0d2636b94183
  RED_FAIL=… lifetime-tax-federal …:77:1 › Regression: SCN-021-005 long term gains stack on
           ordinary income
  RED_FAIL=… lifetime-tax-federal …:190:1 › Regression: SCN-021-006 deduction selection is
           explicit and the annual result reconciles
  RED_FAIL=… lifetime-tax-preferential …:202:1 › Regression: SCN-022-002 a household with
           preferential income receives a valued federal total
  REVERTED_IN_SAME_INVOCATION=yes   REVERT_VERIFIED=yes
```

**The RED lands in Features 021 and 022, and that is the whole point of the
probe.** Not one of the four failures is a Feature 023 scenario. A cumulative row
whose grep had drifted to this feature's own scenarios would have stayed green
under this mutation; this one did not, so the alternation `SCN-02[1-4]` is proven
to reach the earlier features rather than merely to be written down as reaching
them. The RED run also finished in 1.3m against the GREEN run's 5.5m, because a
failing worker stops early — the two runs are not comparable on duration.

```text
PROBE 24 GREEN   observation 1
  GREEN_EXIT=1  GREEN_LINES=85  TOTALS=77 selected, 77 passed, 0 failed, 0 skipped (5.6m)
  GREEN_SHA256=6426c411ca61832402c80f586e9a3d4631122a2725b920bbaa54853dfc31ccc3
  TRAILER=Error: worker-3 process did not exit within 300000ms after stop, force-killed it
  TRAILER=2 errors were not a part of any test, see above for details

PROBE 24 GREEN   observation 2, unmutated tree, same command
  GREEN_EXIT=1  GREEN_LINES=85  TOTALS=77 selected, 77 passed, 0 failed, 0 skipped (5.5m)
  GREEN_SHA256=c27a2de33300813bdffef8b13ca8f888a04e497fbea63a54796d740a7e4cc387
  TRAILER=Error: worker-5 process did not exit within 300000ms after stop, force-killed it
  TRAILER=Error: worker-4 process did not exit within 300000ms after stop, force-killed it
  TRAILER=2 errors were not a part of any test, see above for details
```

**A finding, recorded rather than smoothed over: the cumulative GREEN exits 1
while every scenario in it passes.** The row's stated claim is "zero failed and
zero skipped", and both observations meet it exactly — 77 selected, 77 passed,
nothing failed, nothing skipped. The non-zero exit comes from a trailer the
harness itself labels "not a part of any test": two worker processes did not exit
within the 300s shutdown budget and were force-killed. It reproduced on a clean,
sha-verified tree with different worker ids each time, which is what distinguishes
a harness-shutdown condition from a test outcome — a failing assertion does not
move between workers.

The second observation exists **only** because the first one's exit code was
ambiguous. It is recorded rather than discarded, because discarding the first and
reporting the second would have presented a re-run as a single clean result.

This is not repaired here. The teardown budget lives in the Playwright
configuration, which is outside this scope's allowed paths, and the row it would
affect is not this scope's to change. It is left as an inherited observation: a
later session reading a non-zero exit from this command should check the
pass/fail/skip totals before concluding a scenario broke.

## Supersession Ledger

**No entry was added in this session.** The ledger stands at fourteen entries.

Failure 4 removed `expect(location.hash).toBe('')`. That assertion was NOT a pinned
earlier assertion being superseded — it was introduced by this scope's own new spec
and it CONTRADICTED a pinned one. Feature 021 TP-05-06 already pins the route's URL
contract at `tests/lifetime-tax-route.spec.mjs:333`:

```
  expect(location.hash).toMatch(/^#(simple|power)$/);
```

The replacement in this scope's spec restates that same closed set and adds a scan
proving no declaration member name and no declared value reaches the hash, so it is
strictly stronger than both the assertion it replaces and the route assertion that
owns the contract. Nothing outside this scope's own spec file changed, so no ledger
row, no `_index.md` count paragraph, no ownership-table cell and no `design.md`
marker distribution required an ASC-8 update.

**SUP-023-09 marker check (TP-05-19 and TP-05-20).** Green in the shared unit run,
exit code `0`:

```
  ✓ TP-05-19 and TP-05-20: the ledger row count, the ownership column’s own sum and the total its arithmetic sentence states all agree, Scope 05 owns exactly the one entry the table lists for it, the per-file marker distribution places that marker in the file that carries it and the file carries it, the superseded literal does not survive outside its own marker comment, the replacement derives both the carried category and the retained set from the pack, and the marker appears in no file the distribution does not name
```

The superseded clause verbatim, its re-resolved location and its intended-RED capture
belong to the implementation session and are not recorded here. This session did not
observe that RED and does not claim it. See the corresponding unchecked Definition of
Done row.

**Nine-versus-fourteen, re-measured.** The DoD row requires the marker check to
confirm the repository's markers equal *the nine ledger entries*. Re-run in a later
session, the repository still contradicts that number:

```
$ grep -rhoE 'SUP-023-[0-9]{2}' specs/023-property-tax-and-rental-income/ | sort -u
SUP-023-01 SUP-023-02 SUP-023-03 SUP-023-04 SUP-023-05 SUP-023-06 SUP-023-07
SUP-023-08 SUP-023-09 SUP-023-10 SUP-023-11 SUP-023-12 SUP-023-13 SUP-023-14
COUNT=14
```

Nine was the planning prediction; SUP-023-10 through SUP-023-14 were admitted in
flight under ASC-8 by Scopes 02, 03 and 04. The row cannot be ticked without
asserting an equality against nine that the tree contradicts, and its stated count
cannot be edited here because the DoD text is planning-owned. The disposition is
unchanged: the row stays open and the count correction routes to `bubbles.plan`.

The ledger table itself was counted in this session too, so the contradiction does
not rest on the marker scan alone — the table carries the same fourteen rows the
markers do, which rules out a stray marker inflating the id count:

```
$ grep -cE '^\| SUP-023-[0-9]{2} \|' specs/023-property-tax-and-rental-income/spec.md
14
```

### Verification of the corrected ledger-derived identity row

`bubbles.plan` replaced the stale literal *nine* with an identity whose expected
count is derived from three independent artefact sources, and replaced the
unrecoverable intended-RED with an adversarial probe. Both halves were executed
in this session by an out-of-tree read-only probe. Verbatim output:

```
--- DERIVED COUNT, three independent sources ---
  source 1  ledger row count              = 14
  source 2  ownership count-column sum    = 14   (addends 5+5+1+2+1)
  source 3  arithmetic sentence in words  = 14   ("Five plus five plus one plus two plus one is fourteen")
  sentence addends match column entry-by-entry = true
  ALL THREE AGREE = true  -> expected count = 14

--- REPOSITORY MARKER SCAN (spec dir excluded) ---
  distinct ids in tree = 14
    SUP-023-01  ->  scripts/selftest.mjs
    SUP-023-02  ->  scripts/selftest.mjs, tests/lifetime-tax-conversion.spec.mjs
    SUP-023-03  ->  scripts/selftest.mjs, tests/lifetime-tax-conversion.spec.mjs
    SUP-023-04  ->  scripts/selftest.mjs
    SUP-023-05  ->  scripts/selftest.mjs
    SUP-023-06  ->  scripts/selftest.mjs, tests/lifetime-tax-route.spec.mjs
    SUP-023-07  ->  scripts/selftest.mjs, tests/lifetime-tax-foundation.spec.mjs
    SUP-023-08  ->  scripts/selftest.mjs, tests/lifetime-tax-foundation.spec.mjs
    SUP-023-09  ->  scripts/selftest.mjs
    SUP-023-10  ->  scripts/selftest.mjs, tests/lifetime-tax-benefit.spec.mjs, tests/lifetime-tax-claim-age.spec.mjs, tests/lifetime-tax-foundation.spec.mjs, tests/lifetime-tax-medicare.spec.mjs, tests/lifetime-tax-property.spec.mjs, tests/lifetime-tax-retirement-route.spec.mjs, tests/lifetime-tax-route.spec.mjs, tests/lifetime-tax.support.mjs
    SUP-023-11  ->  scripts/selftest.mjs
    SUP-023-12  ->  scripts/selftest.mjs
    SUP-023-13  ->  tests/lifetime-tax-rental.spec.mjs
    SUP-023-14  ->  scripts/selftest.mjs

--- BIDIRECTIONAL IDENTITY (baseline) ---
  ok=true  set equality holds in both directions
```

The expected count is never read as a literal: it exists only because the three
sources agree, so the next ASC-8 admission moves all three together and the row
survives without a planning edit — which is what `SUP-023-14` traded the pinned
totals for.

**Adversarial probe — the identity is proven able to fail.** Recomputed twice
against a deliberately corrupted marker set. Both recomputations fail, and each
names the id that broke it:

```
--- ADVERSARIAL PROBE 1: a marker id REMOVED from the tree ---
  removed SUP-023-12 -> ok=false  BROKEN BY: SUP-023-12 (in ledger, absent from tree)
  PROBE 1 BEHAVED CORRECTLY = true

--- ADVERSARIAL PROBE 2: a marker id RENAMED in the tree ---
  renamed SUP-023-09 -> SUP-023-99 : ok=false  BROKEN BY: SUP-023-09 (in ledger, absent from tree); SUP-023-99 (in tree, absent from ledger)
  PROBE 2 BEHAVED CORRECTLY = true

PROBE_VERDICT=ALL_CLAUSES_HOLD
PROBE_EXIT=0
```

The rename probe is the stronger of the two because it holds the set *size*
constant at fourteen — a check that compared only counts would pass it. This one
fails, and names both the id that disappeared and the id that appeared, so a
degenerate implementation that reported nothing could not produce this output.

**SUP-023-09's own booking.** Its marker sits in `scripts/selftest.mjs`, the file
`design.md` names for it, with the superseded clause
`noticeIds.includes('unrecaptured-section-1250-gain')` quoted verbatim at its own
site and surviving in no live code:

```
$ node -e '<comment-stripped survival check over scripts/selftest.mjs>'
  present inside marker comment = true
  survives in live code        = false
  design.md places it in selftest.mjs = true
NODE_EXIT=0
```

Every conjunct of the corrected row holds, so the row is checked. The probe ran
read-only and left no artefact in the tree.

## Change Boundary

Path-scoped status over this scope's excluded list, run in this session:

```
$ git status --short -- data watchlist.json site-exclusions.json \
    scripts/build-pages-site.mjs scripts/validate-spec-test-paths.baseline \
    tests/lifetime-tax-{conversion,deduction,federal,foundation,marginal,property,rental,route,use}.spec.mjs \
    tests/lifetime-tax.support.mjs \
    rltaxrental.js rltaxuse.js rltaxproperty.js rltaxstate.js rltaxcombined.js \
    rltaxstrategy.js rltaxworkspace.js .github .specify tools.json index.html \
    rlnav.js README.md notes/README.md briefs rlportfolio.js rlportfolioanalytics.js \
    specs/008-portfolio-survival-and-brief-lab specs/021-lifetime-tax-strategy-lab \
    specs/022-federal-preferential-and-state-income-tax
 M site-exclusions.json
?? rltaxcombined.js
?? rltaxproperty.js
?? rltaxrental.js
?? rltaxstate.js
?? rltaxstrategy.js
?? rltaxuse.js
?? rltaxworkspace.js
?? specs/021-lifetime-tax-strategy-lab/
?? specs/022-federal-preferential-and-state-income-tax/
?? tests/lifetime-tax-conversion.spec.mjs
?? tests/lifetime-tax-deduction.spec.mjs
?? tests/lifetime-tax-federal.spec.mjs
?? tests/lifetime-tax-foundation.spec.mjs
?? tests/lifetime-tax-marginal.spec.mjs
?? tests/lifetime-tax-property.spec.mjs
?? tests/lifetime-tax-rental.spec.mjs
?? tests/lifetime-tax-route.spec.mjs
?? tests/lifetime-tax-use.spec.mjs
?? tests/lifetime-tax.support.mjs
```

What this establishes:

- `data/**`, `watchlist.json`, `scripts/build-pages-site.mjs`,
  `scripts/validate-spec-test-paths.baseline`, `tools.json`, `index.html`,
  `rlnav.js`, `README.md`, `notes/README.md`, `briefs/`, `rlportfolio.js`,
  `rlportfolioanalytics.js`, `specs/008-portfolio-survival-and-brief-lab/`,
  `.github/` and `.specify/` do not appear at all, so each is byte-identical to
  `HEAD`.
- `site-exclusions.json` is the only excluded path that differs from `HEAD`. Its
  whole diff is the eight Feature 021 entries (`rltaxrules.js`, `rltaxworkspace.js`,
  `rltax.js`, `rltaxstrategy.js`, `rltaxstate.js`, `rltaxcombined.js`,
  `lifetime-tax-strategy-lab.html`, `lifetime-tax-strategy.config.json`). It carries
  zero Feature 023 entries:

```
$ grep -c 'rltaxproperty\|rltaxrental\|rltaxuse\|rltaxdisposition' site-exclusions.json
0
```

- Every remaining excluded path is untracked, because the whole Feature 021 to 023
  delivery is uncommitted. Byte-identity for an untracked path has no committed
  baseline to measure against in this session. That is the reason the corresponding
  Definition of Done row is left unchecked rather than claimed.

The only file this session changed outside this scope's own artifacts is
`tests/lifetime-tax-disposition.spec.mjs`, which is this scope's own spec and is
explicitly not on the excluded list. `rltaxrental.js` was not opened for editing.

### Re-verification after the series was committed

The untracked premise above is stale. The series is now committed and the working
tree carries no untracked file at all, so the excluded list can be measured
against the commit that precedes the series (`07acf05c3`) rather than against
nothing. Each entry was checked for existence, for change across the series
commit, and for working-tree drift:

```
$ for p in <the excluded list>; do ... git diff --name-only 07acf05c3 b9d92a3f1 -- "$p" ... git status --porcelain -- "$p" ... done

data                                                     present  changed_by_series=0    worktree_dirty=0
watchlist.json                                           present  changed_by_series=0    worktree_dirty=0
site-exclusions.json                                     present  changed_by_series=0    worktree_dirty=0
scripts/build-pages-site.mjs                             present  changed_by_series=0    worktree_dirty=0
scripts/validate-spec-test-paths.baseline                present  changed_by_series=0    worktree_dirty=0
tests/lifetime-tax-conversion.spec.mjs                   present  changed_by_series=1    worktree_dirty=0
tests/lifetime-tax-deduction.spec.mjs                    present  changed_by_series=1    worktree_dirty=0
tests/lifetime-tax-federal.spec.mjs                      present  changed_by_series=1    worktree_dirty=0
tests/lifetime-tax-foundation.spec.mjs                   present  changed_by_series=1    worktree_dirty=0
tests/lifetime-tax-marginal.spec.mjs                     present  changed_by_series=1    worktree_dirty=0
tests/lifetime-tax-property.spec.mjs                     present  changed_by_series=1    worktree_dirty=0
tests/lifetime-tax-rental.spec.mjs                       present  changed_by_series=1    worktree_dirty=0
tests/lifetime-tax-route.spec.mjs                        present  changed_by_series=1    worktree_dirty=0
tests/lifetime-tax-use.spec.mjs                          present  changed_by_series=1    worktree_dirty=0
tests/lifetime-tax.support.mjs                           present  changed_by_series=1    worktree_dirty=0
rltaxrental.js                                           present  changed_by_series=1    worktree_dirty=0
rltaxuse.js                                              present  changed_by_series=1    worktree_dirty=0
rltaxproperty.js                                         present  changed_by_series=1    worktree_dirty=0
rltaxstate.js                                            present  changed_by_series=1    worktree_dirty=0
rltaxcombined.js                                         present  changed_by_series=1    worktree_dirty=0
rltaxstrategy.js                                         present  changed_by_series=1    worktree_dirty=0
rltaxworkspace.js                                        present  changed_by_series=1    worktree_dirty=0
tools.json                                               present  changed_by_series=0    worktree_dirty=0
index.html                                               present  changed_by_series=0    worktree_dirty=0
rlnav.js                                                 present  changed_by_series=0    worktree_dirty=0
README.md                                                present  changed_by_series=0    worktree_dirty=0
notes/README.md                                          present  changed_by_series=0    worktree_dirty=0
briefs                                                   present  changed_by_series=0    worktree_dirty=0
rlportfolio.js                                           present  changed_by_series=0    worktree_dirty=0
rlportfolioanalytics.js                                  present  changed_by_series=0    worktree_dirty=0
specs/008-portfolio-survival-and-brief-lab               present  changed_by_series=0    worktree_dirty=0
specs/021-lifetime-tax-strategy-lab                      present  changed_by_series=16   worktree_dirty=0
specs/022-federal-preferential-and-state-income-tax      present  changed_by_series=16   worktree_dirty=0
```

`site-exclusions.json` is now settled rather than open: it did not change across
the series commit at all, and it still carries none of this feature's modules.

```
$ grep -c 'rltaxproperty\|rltaxrental\|rltaxuse\|rltaxdisposition' site-exclusions.json
0
GREP_EXIT=1
```

Fifteen entries are therefore byte-identical across the whole series, which is
stronger than the row asks, because it holds for all five scopes at once.

**The row still stays unchecked, and specifically the `rltaxrental.js` conjunct
it names.** Every remaining entry, `rltaxrental.js` among them, was created by the
single commit `b9d92a3f1`, which bundles Features 021, 022 and 023 and all five of
this feature's scopes. No pre-Scope-05 tree exists in history, so git cannot
attribute those files to a scope, and byte-identity for them is not measurable at
the granularity the row demands.

What is measurable, and passes, is the property that conjunct exists to protect.
`TP-05-14` asserts the disposition reads a *published* basis rather than reaching
into the rental engine, and it is green in the shared unit run:

```
  ✓ TP-05-14: for every fixture carrying cost recovery the adjusted basis this scope reads equals the figure the rental settlement published, the fixtures publish t…
```

That is a behavioural proof of the row's purpose, not the byte-identity proof of
its wording, so it is recorded here and the row is left open rather than closed on
a substituted measurement.

### Attribution closed — the row is now satisfied

The obstacle above was attribution: git could not say which scope wrote the files
the series commit created. Four measurements taken in this session close it, and
the row is now checked.

**One: the list is measured in full, and the working tree has not drifted.** All
thirty-five declared excluded entries exist, so nothing is silently skipped, and
none of them is modified, staged or untracked:

```
$ for p in <the 35 excluded paths>; do [ -e "$p" ] || echo "MISSING: $p"; done
(no output — every declared excluded path exists)

$ git status --porcelain --untracked-files=all -- <the 35 excluded paths>
status_exit=0

$ git diff --stat HEAD -- <the 35 excluded paths>
diff_exit=0
```

**Two: every excluded path that pre-dates the feature is unchanged by the feature.**
Comparing the pre-series tree to the series commit alone — rather than to `HEAD`,
which now carries later features' commits — each pre-existing entry reports zero
changed files:

```
$ for p in <the 13 pre-existing excluded paths>; do
    echo "$p -> $(git diff --name-only 07acf05c3 b9d92a3f1 -- "$p" | wc -l)"; done

rlportfolio.js  rlportfolioanalytics.js  portfolio-survival-allocation.config.json
specs/008-portfolio-survival-and-brief-lab  tools.json  index.html  rlnav.js
README.md  notes/README.md  watchlist.json  site-exclusions.json  briefs  data
scripts/build-pages-site.mjs  scripts/validate-spec-test-paths.baseline
… every one -> 0
```

**Three: the entries the series created carry none of this scope's artefacts.**
For those, a pre-scope baseline does not exist by construction, so identity is
established by content, measured on the series commit itself:

```
$ git grep -nE 'rltaxdisposition|SUP-023-09|residenceExclusion' b9d92a3f1 -- \
    rltaxproperty.js rltaxuse.js rltaxrental.js rltaxstrategy.js rltaxstate.js \
    rltaxcombined.js tax-rules/property tax-rules/state tests/lifetime-tax.support.mjs
gitgrep_exit=1

$ git grep -nE 'SUP-023-|rltaxdisposition|rltaxuse|rltaxrental' b9d92a3f1 -- \
    specs/021-lifetime-tax-strategy-lab specs/022-federal-preferential-and-state-income-tax
gitgrep_exit=1
```

Exit `1` is git-grep's no-match status. As this scope left the tree, its module,
its supersession and its exclusion routine appear in none of the excluded modules,
neither retrieved pack, the shared browser support module, nor either prior
feature's spec directory.

**Four: the `rltaxrental.js` conjunct is proven directly, at the dependency level.**
The row names that file because the disposition must read a published basis rather
than reach into the rental engine. The engine's own dependency list settles it:

```
$ grep -nE 'rltaxrental|RLTAXRENTAL|require\(' rltaxdisposition.js
40:    rules = require("./rltaxrules");
```

`rltaxrules` is the shared contract module, and it is the only thing the
disposition engine requires. The rental engine is not imported, not referenced and
not named anywhere in the file. The coupling the row was written to forbid is
absent by construction rather than by convention, which is a stronger result than
byte-identity would have given. `TP-05-14`, quoted above, remains the behavioural
half: the basis this scope reads equals the figure the rental settlement published,
for every fixture carrying cost recovery.

**A later drift exists, and it is not this scope's.** At `HEAD`, one excluded path
does carry Feature 023 references — the Feature 022 Scope 01 report cites
`SUP-023-09` and describes the recapture category's relocation. That text was not
written by this scope:

```
$ git log --oneline -- specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion/report.md
906866405 docs(022): record executed DoD evidence for scope 01 (11/16)
b9d92a3f1 Add Lifetime Tax Strategy Lab: federal, state, property, rental and retirement slices

$ git show b9d92a3f1:specs/022-…/scopes/01-federal-preferential-rate-completion/report.md | grep -c 'SUP-023-09'
0
```

Zero occurrences as this scope left it. The references arrived later, in Feature
022's own documentation commit `906866405`, which post-dates the series. The
remaining Feature 023 mentions in `specs/021-*` and `specs/022-*` are forward
deferrals naming Feature 023 as the successor for Social Security, Medicare, IRMAA
and the premium tax credit — capabilities this feature does not carry — so they
pre-date it rather than leak from it.

## Claim Boundary

The executable claim scan, green in the shared unit run, exit code `0`:

```
  ✓ TP-05-CLAIM: neither the disposition module nor the settlement, the exclusion outcome or the loss record it produces states a probability, an appreciation assumption, a lifetime figure, a future year, a track record or an error rate, and the detector is proven to fire on a sentence that does
```

`TP-05-CLAIM` scans the module and the records it emits. The Definition of Done row
also requires a text scan over this scope's allowed paths, which includes the page
prose. That scan was run in this session with the same detector, extended to the
rendered surfaces and the pack:

```
clean  rltaxdisposition.js
clean  lifetime-tax-strategy-lab.html #power-disposition section
clean  lifetime-tax-strategy-lab.html Simple disposition block
clean  tests/lifetime-tax-disposition.spec.mjs
clean  tax-rules/federal/2026.json dispositionPolicy
detector self-check on a sentence that does state one: true
scanned=5 hits=0
CLAIM_SCAN_EXIT=0
```

The detector self-check is what keeps the zero from being vacuous: the same regular
expression that reported five clean targets fires on
`this is our estimate of the likely appreciation`.

## Completion Statement

The four failing browser assertions are repaired and the whole lifetime-tax browser
suite is green at 37 passed, 0 failed, exit code `0`. The repository suite is green at
2719 passed, 0 failed, exit code `0`. The Pages dry run, the artifact lint and the
spec-test-path guard all exit `0`.

Twelve of this scope's sixteen Definition of Done rows are checked against commands
executed in this session. Four are left unchecked, each with its reason stated in
place: the `BI-9` and `BI-10` retrieval row, because this session performed no
primary-source retrieval; the `SUP-023-09` row, because its intended-RED capture
belongs to the implementation session and is not recorded; the excluded-path
byte-identity row, because the tree is uncommitted and the untracked excluded paths
have no baseline; and the whole-Test-Plan intended-RED row, because RED was observed
in this session for the four browser rows only.

This scope is NOT self-certified. Certification is `bubbles.validate`'s to make.

---

## Audit — arithmetic and refusal integrity (2026-08-22)

Read-only audit of refusal integrity across Features 021-024. Two findings
belong to this scope. Neither was fixed here.

### F-AUDIT-02 — the shipped `AbsentFigure` is malformed, and five assertions pin it that way

The head-of-household residence-exclusion absence in
[tax-rules/federal/2026.json](../../../../tax-rules/federal/2026.json#L1146)
violates the `AbsentFigure/v1` contract in two places at once.

It names its remediation member `remediation`. The contract member is
`whatWouldMakeItAvailable`, and that is the name
[`absentFigureRefusal`](../../../../rltaxrules.js#L761) reads and
[`validateAbsentFigure`](../../../../rltaxrules.js#L1029) requires. Its
`missingSource` is a bare string; the contract requires an object carrying
`title`, `url` and `locator`.

The refusal a head-of-household seller actually receives:

```
contractVersion:          TaxUnavailable/v1
code:                     RLTAX-THRESHOLD-UNAVAILABLE
domain:                   disposition:residenceExclusion:head-of-household
reason:                   Publication 523's Worksheet 1 enumerates a maximum
                          exclusion for married filing jointly, for single and
                          married filing separately, and for a surviving spouse.
                          It states none for head of household ...
whatWouldMakeItAvailable: retrieve the authority named by the pack's
                          missingSource pointer
```

That last line is the constructor's generic fallback, reached because the
authored text sits under the wrong key. It instructs the reader to follow a
pointer that, being a string rather than the contracted object, does not exist.
The refusal is circular and non-actionable. Both the authored remediation
sentence and the authored source description are silently discarded. A
well-formed sibling in the same pack — the SALT cap's `reductionRate` — renders
correctly, naming its publication and appending `(missing source: ...)`, which
is the contrast that makes this a defect rather than a house style.

The pack validator does not catch it. `validateAbsentFigure` is invoked at six
sites in `rltaxrules.js`; none walks
`dispositionPolicy.residenceExclusion.maximumAmounts.amounts.*`.
`resolveRulePack` returns `ok: true` with zero refusals on the shipped pack, and
`isAbsentFigure` tests `contractVersion` alone, so the malformed record passes
every predicate it meets.

The assertions are worse than absent — they hold the defect in place.
`TP-05-13` at [scripts/selftest.mjs](../../../../scripts/selftest.mjs#L18724)
asserts `typeof headOfHouseholdFigure05.missingSource === 'string'`, and its
message calls the result "a real AbsentFigure naming the source that would
supply it". Proven with `scripts/red-green-probe.sh`: replacing the string with
a contract-correct `{title, url, locator}` object turns **5** assertions RED
(3185 passed, 5 failed against a 3190/0 baseline); the file was reverted and
hash-verified inside the probe.

```
label:            F-AUDIT-02: does any assertion accept a CONTRACT-CORRECT missingSource object?
file:             tax-rules/federal/2026.json
red-summary:      Research-Lab self-test: 3185 passed, 5 failed
green-summary:    Research-Lab self-test: 3190 passed, 0 failed
revert-verified:  yes (committed=28c096427fc9e5b56d3be4854473dfcccb5f3425 restored=28c096427fc9e5b56d3be4854473dfcccb5f3425)
discriminating:   yes (exit 1 != 0)
```

The correct contract check does exist and is aimed at the wrong pack.
`TP-01-11` requires every `AbsentFigure` to hold a `missingSource` object with a
`url`, but it walks the **benefit** pack, whose own comment records that it
"currently carries none". The one pack that does carry an absence is checked by
`TP-05-13`, which pins the wrong shape. The census runs against zero candidates
in the place it is correct and against a malformed candidate in the place it is
not.

Routed, not fixed. Renaming the key is mechanical, but `missingSource` needs a
`url` and a `locator` that were never retrieved, and inventing either would be
the substitution this program exists to prevent. The fix also requires
regenerating `contentSha256`, correcting `TP-05-13` without weakening it, and a
decision about whether `validateAbsentFigure` should reach nested `amounts`
maps.

### F-AUDIT-05 — the exclusion refusal is coerced to zero and the leg still publishes `available: true`

[rltax.js](../../../../rltax.js#L1698):

```js
/* The exclusion reduces the REMAINDER only. When it refused, nothing is excluded and the
   refusal travels with the leg rather than silently becoming a zero exclusion. */
var excluded = rules.isUnavailable(exclusion) ? 0 : exclusion.excludedAmount;
var taxableRemainder = remainderComponent.amount - excluded;
```

The comment denies exactly what the line does. A refused exclusion becomes the
number `0`, that zero enters `taxableRemainder`, and the remainder leg is then
published `available: true` with a confident dollar figure computed from an
input that refused. `settledLegIds` admits it as available, so it reaches the
headline, the comparison, the curve and the export as a settled leg.

Measured on the shipped pack, a $500,000 gain on a principal residence held and
used 120 months, $90,000 ordinary income:

| filing status | exclusion | taxable remainder | rendered disposition tax |
| --- | --- | --- | --- |
| `single` | applied, $250,000 | $250,000 | $37,500 |
| `head-of-household` | **refused** | $500,000 | **$74,947.50** |

The $74,947.50 is rendered as an ordinary figure in the components table, which
[`renderDisposition`](../../../../lifetime-tax-strategy-lab.html#L3570) builds
before it reaches the exclusion guard further down the same function.

Mitigating, and the reason this sits below F-AUDIT-02: the refusal is not lost.
It is rendered in `#power-disposition`, a browser assertion checks that it
appears, and `TP-05-13` explicitly asserts the remainder leg "carries the whole
remainder unexcluded" — so the behaviour is deliberate and reviewed, and it errs
toward overstating tax rather than understating it. What is defective is the
labelling: a leg whose input refused is marked `available: true` and its figure
carries no qualification at the point of display, and the code comment states
the opposite of the code.

Routed, not fixed. Whether the leg should refuse, or should publish with a
carried qualification, is a contract decision; only the comment is unambiguously
wrong, and correcting it alone would leave the shape it misdescribes in place.

### This audit changed no source

`node scripts/selftest.mjs` — 3190 passed, 0 failed, before and after. Two
red-green probes were run; each reverted its file inside the invocation and
verified the restored blob hash against the committed one.

---

## F-AUDIT-05 corrected, F-AUDIT-02 bounded (2026-08-22)

Commit `99c5ae81747c3eedf2f7f51b665250da4758c704`.

### F-AUDIT-05 — the comment now states what its line does

The behaviour is unchanged and deliberately so. A refused exclusion still
becomes `0`, the remainder leg still publishes `available: true`, and
`TP-05-13` still pins the whole remainder unexcluded. Whether the leg should
instead refuse, or publish carrying the refusal as a qualification, is the
contract decision the audit routed and it is NOT decided here.

What was unambiguously wrong was the comment, which claimed the opposite of its
own line: that the "refusal travels with the leg rather than silently becoming a
zero exclusion". A comment that contradicts its line is worse than no comment —
it tells the next reader the qualification is already handled, which is exactly
how a reviewer stops looking. The comment now states the coercion, says the
refusal does not travel onto the leg, records why the shape is deliberate, and
names this finding as the open question.

The guard pins the AGREEMENT rather than the prose: the comment may claim the
refusal travels only if the remainder leg actually carries it. That keeps the
sentence available to whoever eventually makes the leg carry the refusal, and
unavailable to anyone who merely reasserts it.

```
label:            F-AUDIT-05 the false comment cannot return while the leg does not carry the refusal
file:             rltax.js
mutation:         does NOT travel onto this leg  ->  refusal travels with the leg rather than silently becoming a zero exclusion, and so does travel onto this leg   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=07b7e1626e479af3a6d74a9ca1f5a703d2399e06 restored=07b7e1626e479af3a6d74a9ca1f5a703d2399e06)
discriminating:   yes (exit 1 != 0)
```

### F-AUDIT-02 — still open, no longer unbounded

The malformed record is NOT fixed. A conforming `missingSource` needs a `title`,
a `url` and a `locator` for an authority that was never retrieved, and the
record's own `reason` states that the retrieval established no primary source
enumerating the head-of-household limit. Naming a URL for a document whose
identity is unknown — including reusing Publication 523's URL, which states
nothing for that status — would be the substitution this program exists to
prevent. It stays routed until a retrieval session supplies it.

What is fixed is that the defect was uncounted. Two facts made it so, and both
were established by reading, not assumed:

* `validateAbsentFigure` is invoked at six sites in `rltaxrules.js` and none
  walks `dispositionPolicy.residenceExclusion.maximumAmounts.amounts.*`, so the
  record never meets the validator that would reject it.
* `TP-01-11`, the one assertion that checks the `AbsentFigure` contract shape,
  walks the BENEFIT pack — which carries no `AbsentFigure` at all. Its census
  runs against zero candidates, so it passes unconditionally.

The new group runs the same contract check against the pack that does carry
absences. It found seven `AbsentFigure` records and exactly one non-conformant,
naming both of its breaches:

```
(found 7, non-conformant 1 [disposition:residenceExclusion:maximumAmounts:head-of-household: whatWouldMakeItAvailable+missingSource-not-an-object], planted-census 2)
```

Two design choices are load-bearing. The census asserts it REACHED the nested
per-filing-status amounts map, by requiring that the head-of-household domain is
among the records it found — a walker that stopped at the pack's top-level
members would report zero non-conformant and read green while proving nothing.
And the bound is `<= 1` rather than `=== 1`, so that repairing the record makes
this group greener rather than redder; a guard that goes RED when the defect it
describes is repaired is a guard that argues against its own fix.

```
label:            F-AUDIT-02 a second malformed AbsentFigure is counted, not absorbed
file:             tax-rules/federal/2026.json
mutation:         "comparisonOperator": "at-least",  ->  "contractVersion": "AbsentFigure/v1", "domain": "planted:second-malformed-record", … "missingSource": "planted as a bare string", "comparisonOperator": "at-least",   (2 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=28c096427fc9e5b56d3be4854473dfcccb5f3425 restored=28c096427fc9e5b56d3be4854473dfcccb5f3425)
discriminating:   yes (exit 1 != 0)
```

Neither `TP-05-13` nor `TP-01-11` was edited. `TP-05-13` still asserts
`typeof missingSource === 'string'` and therefore still holds the malformed
shape in place; that assertion is owned by the scope that wrote it and correcting
it belongs with the pack repair, since changing it alone would turn the tree RED
against a record this session cannot honestly fix.

`node scripts/selftest.mjs` — 3194 passed, 0 failed after both changes.

