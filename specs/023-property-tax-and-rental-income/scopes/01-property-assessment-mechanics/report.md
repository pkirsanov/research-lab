# Scope 1 Execution Report — Property Assessment Mechanics And Statutory Relief Regimes

This file is the evidence surface for scope 1. It was created during planning as a
structural template and is filled from execution only. Nothing here may be written
from expectation, inference or summary. Every anchor below holds raw, unfiltered
terminal output with its exit code.

## Summary

Scope 1 is executed. The declared half (`PropertyAssessment/v1`) and the sourced half
(`PropertyReliefRegime/v1`) are registered in `rltaxrules.js`, `rltaxproperty.js` owns
the settlement, stage `CO-15` in `rltax.js` delegates to it, `rltaxworkspace.js`
carries the property declarations and their privacy surface, and
`lifetime-tax-strategy-lab.html` renders the `power-property` section with origin
labelling plus the four leg surfaces `NFR-023-006` names. The browser row set
`TP-01-18` … `TP-01-22` ships as `tests/lifetime-tax-property.spec.mjs`.

What this dispatch added on top of the already-landed module, packs and page
section: the leg-visibility surfacing itself. The settled record now publishes its
declared leg set on the document, the Simple headline carries the property leg as
its own figure and declares which legs the federal total summed, Power carries a
per-leg composition table and a per-leg curve table, and the private export records
the settled leg identities. Two-directional set identity across all five published
sets is asserted in the browser against a household in which every one of the five
legs is non-zero and mutually distinct.

One DoD row is deliberately left open and its reason is stated with it: the
intended-RED half of the evidence contract could not be observed in this session
for the rows whose implementation predates it.

## Sourcing

`BI-1` (Florida) and `BI-2` (California) were closed by retrievals recorded in the
two shipped regime packs, each with its own `retrievedAt`, `retrievalOutcome`,
locator and a `retrievalNote` quoting the clause the figure was transcribed from.
No figure was retrieved in THIS dispatch, and none was added, changed or derived
here; the packs are unchanged. `TP-01-10b` re-verifies each transcription
digit-by-digit against the clause quoted in its own retrieval note, so a pack figure
that drifted from its own citation fails rather than passing as a cited fabrication.

Carried figures and their locators:

| Figure | Value | Source | Locator |
| --- | --- | --- | --- |
| Florida homestead exemption, first tier | 25000 | Constitution of the State of Florida, Article VII, Section 6 · <https://www.flsenate.gov/Laws/Constitution> · retrieved 2026-08-17T21:30:00.000Z | Article VII, Section 6, subparagraph (a)(1)a. |
| Florida assessment-increase ceiling | 0.03, basis `prior-assessed-value` | Constitution of the State of Florida, Article VII, Section 4 · same URL · same `retrievedAt` | Article VII, Section 4, subsection (d), paragraph (1), subparagraphs a. and b. |
| California ad valorem rate ceiling | 0.01 | California Constitution, Article XIII A, Section 1 · <https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=CONS&article=XIII+A> · retrieved 2026-08-17T21:30:00.000Z | Article XIII A, Section 1, subdivision (a) |
| California inflation ceiling and acquisition basis | 0.02, basis `acquisition-value` | California Constitution, Article XIII A, Section 2 · same URL · same `retrievedAt` | Article XIII A, Section 2, subdivisions (a) and (b) |

Four `AbsentFigure/v1` records ship in place of figures no retrieval established.
Each carries a code, a reason, a remediation and a `missingSource` pointer, and none
carries a numeric member beside the absence:

| Absent member | Why it is absent |
| --- | --- |
| Florida `exemption:homestead-second-tier` | Subparagraph (a)(2) requires the subparagraph (a)(1)b. amount to be adjusted annually for inflation; the adjusted amount for the declared year was not retrieved, and the unadjusted constitutional figure is not it |
| Florida `assessmentCap.capIndexRate` | Paragraph (d)(1) makes the cap the LOWER of three percent and the Consumer Price Index change; the index change was not retrieved, so the effective cap cannot be established from the three percent ceiling alone |
| California `exemption:homeowners-exemption` | Article XIII A carries no exemption of its own; the homeowners' exemption sits in Article XIII, Section 3(k), which was not retrieved |
| California `assessmentCap.capIndexRate` | Subdivision (b) makes two percent a ceiling on the adjustment, not the adjustment; the area's index figure for the declared year was not retrieved |

The consequence is visible on the route rather than hidden: both shipped regimes
carry their effective cap absent, so both settlements refuse
`RLTAX-THRESHOLD-UNAVAILABLE`, and the relief path is proven by fixture regimes
instead. `TP-01-18` observes exactly that refusal in the browser against the real
Florida pack.

## Test Evidence

### Session execution — the whole-repository suite

Rows `TP-01-01` … `TP-01-17` and `TP-01-24` are assertions inside this one run.
Every one is named in the run's own output.

```
$ node scripts/selftest.mjs

================================================
Research-Lab self-test: 2653 passed, 0 failed
================================================
selftest_exit=0
```

The pre-existing pass count did not fall: 2653 before this dispatch's changes and
2653 after them, with zero failures in both readings.

### Session execution — the browser rows

```
$ npx playwright test tests/lifetime-tax-property.spec.mjs --project=system-chrome --reporter=line

Running 5 tests using 1 worker
  5 passed (3.8s)
playwright_exit=0
```

```
$ npx playwright test tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-federal.spec.mjs tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-route.spec.mjs tests/lifetime-tax-property.spec.mjs --project=system-chrome --reporter=line

Running 21 tests using 6 workers
  21 passed (7.5s)
playwright_exit=0
```

The bundled chromium binary is absent from this environment, so every browser row
runs through the `system-chrome` project. That is an environment gap, not a defect,
and no row was skipped because of it.

### TP-01-01

The declared contract refuses a citation and the sourced contract requires one
with a locator.
Command: `node scripts/selftest.mjs`

### TP-01-02

A missing declaration and an unretrieved rule refuse under different codes,
distinguished by contract shape rather than message text.
Command: `node scripts/selftest.mjs`

### TP-01-03

An implementation returning zero for an undeclared assessed value is proven to
fail the refusal assertion.
Command: `node scripts/selftest.mjs`

### TP-01-04

An exemption applied to a rate and a cap applied to a tax amount are each refused
naming the incoherent pairing.
Command: `node scripts/selftest.mjs`

### TP-01-05

The exemption and the cap applied at their declared points produce the expected
taxable basis below, exactly at and above the cap boundary.
Command: `node scripts/selftest.mjs`

### TP-01-06

Two fixture regimes differing only in cap basis produce different taxable bases
from identical declarations.
Command: `node scripts/selftest.mjs`

### TP-01-07

An implementation branching on a regime name is proven to fail against the fixture
regimes, which carry no real regime name.
Command: `node scripts/selftest.mjs`

### TP-01-08

A declared rate below the ceiling is used unchanged; one above it is reduced to the
ceiling, and each records which side bound.
Command: `node scripts/selftest.mjs`

### TP-01-09

An implementation using the ceiling as the rate is proven to fail the
below-ceiling assertion.
Command: `node scripts/selftest.mjs`

### TP-01-10

Every value-bearing regime member resolves to exactly one retrieved source with a
locator, and every unretrieved member is an absent figure with a missing-source
pointer and no smuggled numeric member.
Command: `node scripts/selftest.mjs`

### TP-01-11

`computePropertyTax` accepts no federal or state income figure through any
parameter.
Command: `node scripts/selftest.mjs`

### TP-01-12

The settled record's declared leg set equals each of the four surfaces' leg sets in
both directions, on the all-non-zero fixture.
Command: `node scripts/selftest.mjs`

### TP-01-13

Removing the property leg from each of the four surfaces in turn fails the
leg-visibility identity, and the failure names the missing leg.
Command: `node scripts/selftest.mjs`

### TP-01-14

The refusal vocabulary member count equals its pre-feature value and every
pre-existing member retains its meaning and raising site.
Command: `node scripts/selftest.mjs`

### TP-01-15

No module holds a regime name, state name, county name, cap figure, ceiling figure
or authority name, and the detector fires on a module that does.
Command: `node scripts/selftest.mjs`

### TP-01-16

Each property declaration is inventoried, cleared, redacted, and absent from every
URL, request, referrer and console message.
Command: `node scripts/selftest.mjs`

### TP-01-17

The SUP-023-05 replacement derives the withheld-link and section counts from the
page and asserts two-directional identity.
Command: `node scripts/selftest.mjs`

### Scenario SCN-023-001

A missing declaration and an unretrieved rule refuse differently in the browser and
neither shows a zero.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero" --reporter=list`

```
  ✓   6 [system-chrome] › tests/lifetime-tax-property.spec.mjs:71:1 › Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero (1.8s)
```

Observed in the browser: the missing declaration raises `RLTAX-INPUT-INCOMPLETE`
under a `property-assessment:` domain naming `assessedValue`; the unretrieved rule
raises `RLTAX-THRESHOLD-UNAVAILABLE` under a `property-regime:` domain. The domain
prefixes differ, so the separation survives any copy edit to either message. In
both states the panel carries no `[data-rl-value]` node, no relief row, no
declaration row and no `$0`.

### Scenario SCN-023-002

The exemption and the cap are applied at their declared points with reachable
citations.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations" --reporter=list`

```
  ✓  12 [system-chrome] › tests/lifetime-tax-property.spec.mjs:115:1 › Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations (1.1s)
```

Observed: five declaration rows, every one labelled `data-rl-origin="declared"`
and "your own input", with zero `sourced` cells among them. The cap row applies at
`assessed-value` and moves $400,000 to $309,000 bound; the exemption row moves
$309,000 to $284,000; each sourced cell carries its locator and is labelled
`data-rl-origin="sourced"`. The headline settles $5,680.

### Scenario SCN-023-003

An acquisition-value cap basis produces a different taxable basis and the rate
ceiling behaves as a ceiling.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-003 an acquisition-value cap basis produces a different taxable basis and the rate ceiling is a ceiling" --reporter=list`

```
  ✓  18 [system-chrome] › tests/lifetime-tax-property.spec.mjs:168:1 › Regression: SCN-023-003 an acquisition-value cap basis produces a different taxable basis and the rate ceiling is a ceiling (1.1s)
```

Observed: under an acquisition-value basis the cap row lands on $206,000 rather
than the $309,000 a prior-assessed-value basis produces from the identical
declarations, and the settlement is $3,620 rather than $5,680. Under the ceiling
regime a declared two percent is bound down to one percent and settles $2,060 —
not the $4,120 the declared rate would have produced — while a declared half
percent is used unchanged and settles $1,030, which an implementation using the
ceiling as the rate could not produce.

### TP-01-21

The property leg reaches the headline, the comparison, the curve and the export in
the browser.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export" --reporter=list`

```
  ✓  20 [system-chrome] › tests/lifetime-tax-property.spec.mjs:224:1 › Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export (567ms)
```

Observed against the all-non-zero fixture household — ordinary income $300,000, a
$120,000 long-term gain, $5,000 of other net investment income and a $400,000
Medicare wage basis, settling five legs whose figures are all non-zero and mutually
distinct ($68,134 · $18,000 · $4,750 · $1,800 · $5,680). The row asserts, in both
directions and by leg name, that the record's declared set equals the leg set of
the headline, the comparison table, the curve's leg contributors, the written
export file and the export's published attribute, and that each set has the same
size as the record. The distinctness and non-zero checks run first, so the identity
cannot be satisfied by a zero leg that an addition would balance either way.

### TP-01-22

The request ledger stays empty and no property declaration reaches a URL.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-001 the request ledger stays empty and no property declaration reaches a URL" --reporter=list`

```
  ✓  21 [system-chrome] › tests/lifetime-tax-property.spec.mjs:312:1 › Regression: SCN-023-001 the request ledger stays empty and no property declaration reaches a URL (496ms)
```

Observed: the ledger length after declaring an assessed value, an acquisition
value, a jurisdiction, a local rate and an exemption election equals the length at
first paint, so not one request follows the property settlement or the view switch.
Both regime packs were read before first paint and both appear in the ledger, and
every requested path is one the route itself declares. Neither sentinel figure, nor
the declared jurisdiction in plain or percent-encoded form, appears in any request
URL, any request body, any console message or the address bar, whose query string
is empty.

### TP-01-23

The cumulative browser suite over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`

```
Running 21 tests using 6 workers
...
  21 passed (6.9s)
tp0123_exit=0
```

All sixteen prior-feature rows and all five rows this scope adds pass in one run,
so this scope's page and engine changes leave every earlier scenario intact.

### TP-01-24

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-01-25

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

```
$ node scripts/validate-spec-test-paths.mjs
  STALE-BASELINE: 6 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/causal-rotation-adversarial.spec.mjs
      tests/causal-rotation-brief.spec.mjs
      tests/causal-rotation-consumers.spec.mjs
      tests/causal-rotation-delivery.spec.mjs
      tests/causal-rotation-pages.spec.mjs
      tests/causal-rotation-registry.spec.mjs
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
paths_exit=0
```

Zero new missing paths. `tests/lifetime-tax-property.spec.mjs` now exists at the
path this scope's Test Plan names, so the five browser rows resolve. The six stale
baseline entries are pre-existing and belong to another feature; the baseline file
is untouched by this scope.

### TP-01-26

The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/`
remains outside the public directories.
Command: `node scripts/build-pages-site.mjs --dry-run`

```
$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":9,"rootFiles":111,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
pages_exit=0
```

`tax-rules/` is absent from `directories`, so the regime packs stay outside the
public directories. `site-exclusions.json` was not touched by this scope; its only
working-tree diff is the pre-existing Feature 021 entry set.

## Supersession Ledger

Command: `node scripts/selftest.mjs`

All five entries this scope owns — SUP-023-05, SUP-023-06, SUP-023-07, SUP-023-08
and the in-flight SUP-023-10 — are delivered. `TP-01-17` is the standing check: it
asserts each marker sits in the file the per-file distribution places it in, and
that not one superseded literal survives anywhere in the tree. It passes inside the
2653-assertion run recorded above.

| Entry | Marker home | Superseded literal | Replacement shape | Superseded literal still present? |
| --- | --- | --- | --- | --- |
| SUP-023-05 | `scripts/selftest.mjs` | `powerLinkDetails.length === 9 && powerLinkSections.length === 9` | derive — two-directional identity between `POWER_SECTION_IDS` and the `power-*` sections the markup carries, plus a per-link count read off the link table | no |
| SUP-023-06 | `tests/lifetime-tax-route.spec.mjs` | `#powerLinkRows button[data-power-section]` `toHaveCount(9)` | derive — the count comes from `#powerLinkRows li`, every link must point at a declared section and every declared section must exist | no |
| SUP-023-07 | `tests/lifetime-tax-foundation.spec.mjs` | `#storageInventoryBody tr` `toHaveCount(3)` | derive — the count comes from the configuration's own declared key set, with two-directional key identity and a content assertion naming the housing declarations | no |
| SUP-023-08 | `tests/lifetime-tax-foundation.spec.mjs` | the same literal in the clear-action test | derive — the same key-derived count, plus the assertion that the clear action removes every inventoried key rather than a fixed three | no |
| SUP-023-10 | both browser specs | the `ALLOWED_ASSET_PATHS` filter | derive — the permitted asset set comes from the route's own script tags, configuration and packs | no |

**Reconstruction of the SUP-023-05 and SUP-023-06 intended-RED.** Their
intended-RED was observed in the dispatch that delivered them, not in this one, so
it is not claimed here as a session observation. What IS verified here is that the
superseded literal is false against the current tree, which is the same fact the
RED recorded:

```
SUP-023-05/06 reconstruction:
  withheld-detail link rows now: 11 (superseded literal pinned 9 -> now FALSE )
  declared POWER_SECTION_IDS: 9  rendered power-* sections: 9
```

Eleven withheld-detail rows against a pinned nine: the literal describes a page
that no longer exists, and the derived replacement absorbs the growth while still
failing on a link without a section or a section without a declaration.

**Reconstruction of the SUP-023-07 and SUP-023-08 intended-RED, and an honest
qualification.** The storage inventory is keyed by STORAGE KEY, not by workspace
member, and the configuration still declares exactly three keys:

```
SUP-023-07/08 reconstruction:
  declared storage keys: 3
  workspace declared fields: 24
  property declarations: propertyAssessedValue, propertyPriorAssessedValue,
    propertyAcquisitionValue, propertyLocalCombinedRate, mortgageInterestPaid,
    mortgageAcquisitionDebtBalance, propertyJurisdiction, mortgageAcquisitionDebtTier
```

So the superseded `toHaveCount(3)` is still numerically true. The strengthening
these two entries deliver is therefore NOT a changed count: it is the
two-directional key identity plus the content clauses asserting the inventory names
the housing declarations the workspace now carries. A stored key added without an
inventory entry fails the replacement and would have passed the literal. That is a
real strengthening, and stating it plainly is more useful than claiming a count
moved when it did not.

### SUP-023-10 — admitted in flight under ASC-8 (delivered)

SUP-023-05 through SUP-023-08 are delivered; the note that once stood here saying
they were not is superseded by the table above and by the passing `TP-01-17`.
SUP-023-10 was admitted and delivered because Scope 01's route change caused a
pre-existing assertion to fail for an ASC-1 cause the pre-populated ledger did not
name.

**Superseded clause, verbatim.** In `tests/lifetime-tax-foundation.spec.mjs` L246:

```js
const unexpected = paths.filter((path) => !ALLOWED_ASSET_PATHS.includes(path));
```

and in `tests/lifetime-tax-route.spec.mjs` L277:

```js
expect(paths.filter((entry) => !ALLOWED_ASSET_PATHS.includes(entry))).toEqual([]);
```

where `ALLOWED_ASSET_PATHS` is a hand-maintained literal of eight paths exported by
`tests/lifetime-tax.support.mjs`.

**ASC-1 cause.** FR-023-007 requires the property settlement to reach the route, so
this scope adds `rltaxproperty.js` to `lifetime-tax-strategy-lab.html`. The literal
no longer describes the route and both assertions failed on the new first-paint
request. This is a deliberate behaviour change named by this scope's requirement
coverage, not a broken implementation.

**Replacement, and why it is at least as strong (ASC-4).** The permitted set is now
derived by `declaredRouteAssets()` from the route's own `<script src>` tags plus the
configuration and packs that configuration names. The original protection — no
request may go anywhere the page did not declare — is preserved intact. It is
strictly stronger because a literal must be hand-edited to admit a new module, and
that edit is indistinguishable from one admitting a leak; a derived set admits only
what the page itself asks for and cannot rot into a false green as later scopes add
modules. `tests/lifetime-tax.support.mjs` is untouched and stays byte-identical.

**Intended-RED, observed before the replacement:**

```
  1) tests/lifetime-tax-route.spec.mjs:213 › Regression: SCN-021-015 …
    - Expected  - 1
    + Received  + 3
    + Array [ "/rltaxproperty.js", ]
  2) tests/lifetime-tax-foundation.spec.mjs:233 › Regression: SCN-021-003 …
    - Expected  - 1
    + Received  + 3
    + Array [ "/rltaxproperty.js", ]
  2 failed
  14 passed (6.1s)
playwright_exit=1
```

**GREEN, same command after the replacement:**

```
Running 16 tests using 5 workers
  16 passed (4.6s)
playwright_exit=0
```

**Adversarial evidence (ASC-5).** The replacement is proven non-vacuous by mutating
the page and re-deriving. A derivation that returned everything, or a constant,
would pass for any input:

```
SUP-023-10 derivation is page-derived, not a constant:
  real page  -> includes /rltaxproperty.js : true
  page minus the tag -> includes it        : false (must be false)
  real page rejects an undeclared asset    : true
  superseded literal fully contained       : true
  derived set size: 11 vs superseded literal size: 8
```

The three in-suite adversarial expectations pin the same properties: the derived set
contains the added module, contains every member of the superseded literal, and
rejects `/definitely-not-declared-by-this-route.js`.

**Ledger, ownership table and marker distribution updated in the same change:**
`spec.md` supersession ledger (row added, total reconciled to ten),
`scopes/_index.md` ownership table (Scope 01 count four → five, total nine → ten),
and `design.md` both marker tables.

### TP-01-06 intended-RED, reconstructed adversarially

The cap-basis branch already existed in `rltaxproperty.js` when this session began,
so a genuine before-implementation RED could **not** be observed for it and is not
claimed. Instead the assertion was proven non-vacuous by collapsing the branch in an
isolated copy of the module, leaving the working tree untouched:

```
MUTANT (no real cap-basis branch):
  prior      taxableBasis = 284000 value = 5680
  acquisition taxableBasis = 284000 value = 5680
  TP-01-06 core condition holds? false -> assertion FAILS (intended)
```

Against the real module the two regimes produce 284000 / 5680 and 181000 / 3620
from identical declarations.

### Probe 1 — same-command RED for TP-01-06, TP-01-07 and TP-01-20

The reconstruction above ran against an isolated copy, so it could not produce a
same-command failure. A later session repeated it as a real in-tree mutation, which
can. The single edit collapsed the cap-basis branch in `rltaxproperty.js` to the
state the Scenario-First Red/Green Contract names — the branch reading the declared
basis member was replaced by a fixed member, so two regimes differing only in
`capBasis` settle identically:

```js
-      var basisMember = CAP_BASIS_MEMBER[cap.capBasis];
+      var basisMember = "priorAssessedValue";
```

Nothing else changed. Same command as the green run:

```
$ node scripts/selftest.mjs

  ✗ FAIL: TP-01-06: two regimes differing ONLY in capBasis produce different taxable bases from identical declarations, and each record names the basis it applied
  ✗ FAIL: TP-01-07: neither the property engine nor the settlement engine names a regime, a state or a relief programme, the branch is on the declared cap basis, and the detector is proven live by firing on the pack that legitimately does name one
Research-Lab self-test: 3017 passed, 2 failed
```

The browser row for the same scenario fails under the same single edit, same
command:

```
$ npx --no-install playwright test tests/lifetime-tax-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=line

Running 5 tests using 1 worker
  1) [system-chrome] › tests/lifetime-tax-property.spec.mjs:167:1 › Regression: SCN-023-003 an acquisition-value cap basis produces a different taxable basis and the rate ceiling is a ceiling

    Error: expect(locator).toContainText(expected) failed

    Locator: locator('#propertyReliefBody tr').filter({ hasText: 'assessment-cap' }).first()
    Expected substring: "$206,000"
    Received string:    "assessment-capassessed-value$400,000$309,000yesFixture relief regime record — not an authority and not a transcription of one · fixture clause two"
    Timeout: 5000ms

      183 |     await expect(page.locator('#propertyCapBasisLine')).toContainText('acquisition-value');
      184 |     const capRow = page.locator('#propertyReliefBody tr').filter({ hasText: 'assessment-cap' }).first();
    > 185 |     await expect(capRow).toContainText('$206,000');
          |                          ^
      186 |     await expect(capRow).not.toContainText('$309,000');
      187 |     await expect(page.locator('[data-rl-value="propertyTax"]')).toHaveText('$3,620');

  1 failed
    [system-chrome] › tests/lifetime-tax-property.spec.mjs:167:1 › Regression: SCN-023-003 an acquisition-value cap basis produces a different taxable basis and the rate ceiling is a ceiling
  4 passed (31.2s)
RED_PW_EXIT=1
```

The mutation was reverted immediately and the revert was verified before any other
work resumed:

```
$ git diff --stat -- rltaxproperty.js
(no output)
```

**Evidence class.** This is a mutation-derived RED, not a
before-implementation RED. It proves the three assertions are load-bearing — each
fails when the behaviour it names is removed — which is what the reconstruction
above was reaching for and could not demonstrate through the real command. It does
not reconstruct the original authoring sequence, and it is not recorded as though
it did. Rows TP-01-06, TP-01-07 and TP-01-20 therefore carry same-command RED and
GREEN; the remaining rows do not, which is why the covering Definition of Done row
stays open.

### Probe 2 — same-command RED for TP-01-01

The declared/sourced split is enforced by one predicate call. Disabling it lets a
household's own input carry an authority's citation, which is the exact failure
TP-01-01 exists to catch:

```js
-      if (rules.carriesCitation(member)) {
+      if (false && rules.carriesCitation(member)) {
```

Nothing else changed. Same command, captured through the bounded evidence tool so
every line produced is covered by the hash:

```
# probe2-selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3415
sha256: 0bf8c8c74ba7401474c968f0619baf2f90c5e77f6bd6659e846ac4156b70d148
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-01: PropertyAssessment/v1 refuses any member carrying a sourceRef, and a regime figure whose sourceRef names no record is refused rather than displayed with an unreachable citation
--- omitted 3375 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3018 passed, 1 failed
```

Reverted immediately, revert verified before any other work resumed:

```
$ git diff --stat -- rltaxproperty.js rltax.js rltaxrules.js tax-rules lifetime-tax-strategy-lab.html tests
(no output)
```

Same evidence class as Probe 1: mutation-derived, not before-implementation.

### Probe 3 — same-command RED for TP-01-02

TP-01-02 asserts the two halves of the epistemology are separated by contract
shape rather than by wording. Collapsing the undeclared-member refusal onto the
unretrieved-rule code and domain removes exactly that separation while leaving
both messages untouched, so the row fails on shape and not on text:

```js
-    return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "property-assessment:" + member,
+    return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "property-regime:" + member,
```

Same command:

```
# probe3-selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3415
sha256: 92287f5450e67cc9a29e3d5a575ea092fb48c99b2d4cd0dccf862fca29bde0f4
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-02: a missing household declaration and an unretrieved statutory rule refuse with different codes AND different domain prefixes, so the two halves are separated by shape rather than by wording
--- omitted 3375 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3018 passed, 1 failed
```

Reverted immediately, revert verified:

```
$ git diff --stat -- rltaxproperty.js rltax.js rltaxrules.js tax-rules lifetime-tax-strategy-lab.html tests
(no output)
```

**Observation worth recording.** TP-01-03 stayed green under this mutation. It
asserts that an undeclared assessed value carries no numeric value and names the
member, and both remained true when only the code and domain changed. The two rows
are therefore genuinely independent rather than one assertion written twice, which
is what the pair was designed to establish.

### Probe 4 — same-command RED for TP-01-03

TP-01-03 is the adversarial row guarding against a plausible number standing in
for a refusal. Making the refused property leg carry a zero is precisely the
implementation it names:

```js
         available: false,
+        value: 0,
         refusal: settlement,
```

Same command:

```
# probe4-selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3415
sha256: 1d168ce4f2148ddd91bbc94acbd68ed12df260728019c1096224b1d9bb32a8fb
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-03: an undeclared assessed value produces a refusal naming the member and carrying NO numeric value — an implementation returning 0 would fail this
--- omitted 3409 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3018 passed, 1 failed
```

Reverted immediately, revert verified:

```
$ git diff --stat -- rltaxproperty.js rltax.js rltaxrules.js tax-rules lifetime-tax-strategy-lab.html tests
(no output)
```

The row's own wording — *an implementation returning 0 would fail this* — is now
recorded as an observation rather than a prediction.

### Probe 5 — same-command RED for TP-01-04, and a discarded first attempt

The first attempt at this probe disabled the coherence check outright. It is
recorded here because it is instructive, not because it counts:

```js
-    if (figure.applicationPoint !== COHERENT_POINT[kind]) {
+    if (false && figure.applicationPoint !== COHERENT_POINT[kind]) {
```

```
# probe5-selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3398
sha256: 86f3ab2fbc9ab2c40be55342d511c95e737e92c8acd380e8e3d2e757767b6f64
--- failure-shaped lines from the omitted region ---
  ✗ FAIL (Feature 023 Scope 01 property group threw): Cannot read properties of undefined (reading 'code')
--- omitted 3392 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3001 passed, 1 failed
```

**This is not RED and is not claimed as RED.** With the pairing accepted, the
incoherent fixture settles instead of refusing, `refusal` is undefined and the
whole group throws before reaching the assertion. This scope's Scenario-First
Red/Green Contract rules that out in terms: *a syntax error, a missing browser or
an absent test does not satisfy RED*. A group that throws proves only that the
group stopped.

The probe was re-aimed to keep the group running and let the row itself fail. The
refusal is still raised at the same point and still names the same incoherent
pairing; only its code changes, so the assertion fails on the code it pins:

```js
     if (figure.applicationPoint !== COHERENT_POINT[kind]) {
-      refusals.push(rules.unavailable("RLTAX-PACK-INVALID", label + ":applicationPoint",
+      refusals.push(rules.unavailable("RLTAX-CONFIG-INVALID", label + ":applicationPoint",
```

```
# probe5b-selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3415
sha256: a2098daf6b356f865c3855ff52b47ac0c8980f6cc64ef8abf575d26ed3eb4fba
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-04: an exemption declaring the tax-rate application point and a cap declaring it are each refused RLTAX-PACK-INVALID naming the incoherent pairing
--- omitted 3409 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3018 passed, 1 failed
```

Reverted immediately, revert verified:

```
$ git diff --stat -- rltaxproperty.js rltax.js rltaxrules.js tax-rules lifetime-tax-strategy-lab.html tests
(no output)
```

### Probe 6 — same-command RED for TP-01-05

TP-01-05 pins three points around the cap ceiling and, decisively, that the
boundary itself is *not* bound. Widening the comparison by one character is the
smallest change that violates only that last clause:

```js
-      capBound = capCeilingValue < assessment.assessedValue;
+      capBound = capCeilingValue <= assessment.assessedValue;
```

Same command:

```
# probe6-selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3415
sha256: 14901441fef9e43d84c70bd905a996c477a06cb432f09b347838e916beb84ca4
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-05: below, exactly at and above the cap ceiling the capped assessment, the exemption-reduced taxable basis and the tax are each exact, and the boundary itself is not treated as bound
--- omitted 3409 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3018 passed, 1 failed
```

Reverted immediately, revert verified:

```
$ git diff --stat -- rltaxproperty.js rltax.js rltaxrules.js tax-rules lifetime-tax-strategy-lab.html tests
(no output)
```

The off-by-one at the boundary is caught by the row and by nothing else in the
group, so the at-cap case is carrying its own weight rather than riding on the
below and above cases.

## Intended-RED Completion Session

Probes 1 through 6 above left intended-RED recorded for TP-01-01 through TP-01-07
and TP-01-20 only. This session works the remaining Test Plan rows one at a time,
in the same shape: mutate the implementation so the row's assertion genuinely
fails, run the exact command the row names, revert, and re-run the same command.
Every probe is reverted and the revert verified before the next one opens, so no
two probes are ever live at once.

Note on the pass count. The concurrent session working Features 025 and 026 has
appended assertions to `scripts/selftest.mjs` during this session, so the totals
here read above the 3019 baseline. The figure that matters per row is the
one-failure delta between its RED and its GREEN, not the absolute total.

### Probe 7 — same-command RED and GREEN for TP-01-01, re-verified

Probe 2's mutation re-applied and re-run in this session, so TP-01-01 carries a
current-session RED *and* its paired same-command GREEN rather than a RED whose
green came from a suite-wide run:

```js
-      if (rules.carriesCitation(member)) {
+      if (false && rules.carriesCitation(member)) {
```

RED:

```
# TP-01-01 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3424
sha256: 437760734e390eb65264c4a84ac4baa57a62c2a7384cf596c13ab89a1089c27d
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-01: PropertyAssessment/v1 refuses any member carrying a sourceRef, and a regime figure whose sourceRef names no record is refused rather than displayed with an unreachable citation
--- omitted 3384 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3027 passed, 1 failed
```

Reverted, revert verified, then the same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
reverted-clean

# TP-01-01 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3424
sha256: 4c7b6d22f43bd25deb030057da38b17b37f0d0bd6580581aeeea549b9b2e23be
--- omitted 3384 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3028 passed, 0 failed
```

The two runs are the same command over the same tree modulo one predicate call,
and the delta is exactly one assertion.

### Probe 8 — same-command RED and GREEN for TP-01-08

TP-01-08 asserts the ceiling step states the *right* fact in three situations:
below the ceiling the declared rate is used unchanged and no bound is stated,
above it the ceiling binds and says so, and a regime with no ceiling says that
rather than passing silently. Forcing the bound flag on misstates the first case
while leaving the arithmetic untouched:

```js
-      ceilingBound = ceiling.rate < assessment.localCombinedRate;
+      ceilingBound = true;
```

RED:

```
# TP-01-08 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3424
sha256: 962bc8e8b4dac27c45fd2b907bfb3fa3f54810a21a79d91d498ca62aa29c5728
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-08: a declared rate below the ceiling is used unchanged with that fact stated, a rate above it is reduced to the ceiling with that fact stated, and a regime carrying no ceiling states that rather than passing silently
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3027 passed, 1 failed
```

Reverted, revert verified, same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
reverted-clean

# TP-01-08 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3424
sha256: 2152c08bd6fdbcb1ef0bd12355e1c38226ff85e5b2b0357a591c526412ba699a
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3028 passed, 0 failed
```

**Independence worth recording.** Exactly one assertion fell. TP-01-09, which
prices the below-ceiling case, stayed green because the mutation changed only the
*stated fact* and not `appliedRate`. The two rows are therefore separating the
narrative from the arithmetic rather than asserting the same thing twice.

### Probe 9 — same-command RED and GREEN for TP-01-09

TP-01-09 is the adversarial row naming its own defeating implementation: *an
implementation using the ceiling as the rate fails here*. That implementation was
written literally:

```js
-      appliedRate = Math.min(assessment.localCombinedRate, ceiling.rate);
+      appliedRate = ceiling.rate;
```

RED:

```
# TP-01-09 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3424
sha256: de114b69b13eb4a3c7f3c4910770be2c80c3b68c7cc1cfac33682a1301e5b554
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-08: a declared rate below the ceiling is used unchanged with that fact stated, a rate above it is reduced to the ceiling with that fact stated, and a regime carrying no ceiling states that rather than passing silently
  ✗ FAIL: TP-01-09: below the ceiling the tax is computed from the declared rate and is strictly less than the ceiling would produce — an implementation using the ceiling as the rate fails here
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3026 passed, 2 failed
```

Reverted, revert verified, same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
reverted-clean

# TP-01-09 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3424
sha256: 4eb3b53c42258c06842021f76c21346b70108f4441e41298d24d49a6849fb7af
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3028 passed, 0 failed
```

Two assertions fell rather than one, and that is the correct result rather than
an over-broad probe. Replacing the applied rate changes both the number
TP-01-09 prices and the number TP-01-08 reads back, so both rows see it. Read
together with Probe 8 the pair is a clean two-way discrimination: mutating only
the narrative fell TP-01-08 alone, mutating the rate fell both.

### Probe 10 — same-command RED and GREEN for TP-01-10

TP-01-10 reads the two shipped relief packs directly, so its only faithful
defeating implementation is a citation that does not resolve. The Florida
assessment cap's `sourceRef` was pointed at a record id that does not exist:

```json
-    "sourceRef": "fl-const-a7s4",
+    "sourceRef": "fl-const-a7s4-NOT-A-RECORD",
```

Checked before mutating: `tax-rules/property/FL/2026.json` carries **no**
`contentSha256` member, so this probe could not disturb a content digest. That
was verified rather than assumed, because a digest cascade from an abandoned pack
probe is a known prior failure in this repository.

RED — and the assertion names the exact faulting path rather than merely failing:

```
# TP-01-10 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3424
sha256: 4d8b8c27b7a4a7dc7c13d3c86b5aa892e6adb0a90135bdaa9bde8240e2604ccc
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-10: every valued member of both shipped relief regimes cites exactly one retrieved record with a locator, and every unretrieved member is an AbsentFigure with a missingSource pointer and no numeric member beside it: florida-homestead-and-assessment-limitation:assessmentCap:citation
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3027 passed, 1 failed
```

Reverted, revert verified over the whole `tax-rules/` tree rather than the one
file, same command again:

```
$ git checkout -- tax-rules/property/FL/2026.json && git status --short -- tax-rules
reverted-clean

# TP-01-10 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3424
sha256: 9891fb95fa36e73a4858e197f0138bfb0ab5bb1202230dd677d8ed43c7e8e0f0
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3028 passed, 0 failed
```

Exactly one assertion fell, and its message carried
`florida-homestead-and-assessment-limitation:assessmentCap:citation` — the
regime, the member and the fault class. A sourcing check that reported only a
boolean could not have produced that string.

### Probe 11 — same-command RED and GREEN for TP-01-11

TP-01-11 is a structural row: it pins both signatures so there is no parameter
through which an income figure could reach a property settlement. Opening exactly
such a parameter is its defeating implementation:

```js
-  function computePropertyTax(assessment, regime) {
+  function computePropertyTax(assessment, regime, householdIncome) {
```

The added parameter is never read, which is the point — the row refuses the
*possibility* rather than waiting for the misuse, so an unused third argument is
enough to fail it.

RED:

```
# TP-01-11 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3424
sha256: 592bd21c9642e06c7c362e4751da3c6aea59451d3542b01b28924108a43d2b19
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-11: computePropertyTax and the CO-15 stage each accept exactly the declared assessment and the sourced regime, no income figure reaches either, and the settled tax is the taxable basis times the applied rate and nothing else
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3027 passed, 1 failed
```

Reverted, revert verified, same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
reverted-clean

# TP-01-11 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3424
sha256: 11db83009210905f5783e3c6b953b019b904f1eb985fb6a3d34570e038fa940f
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3028 passed, 0 failed
```

Exactly one assertion fell. No arithmetic changed, so the row is genuinely
guarding the shape of the seam and not a computed figure.

### Probe 12 — same-command RED and GREEN for TP-01-12

TP-01-12 asserts two-directional identity between the record's declared leg set
and the four surfaces. Dropping the property leg from the record side breaks the
identity from the direction the row exists to guard — a leg rendered by every
surface that the record no longer declares:

```js
-    var declared = Array.isArray(recordLegIds) ? recordLegIds.slice().sort() : [];
+    var declared = Array.isArray(recordLegIds)
+      ? recordLegIds.filter(function (id) { return id !== "property-tax"; }).sort() : [];
```

RED:

```
# TP-01-12 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3424
sha256: 0ed5745d6a82e50acd1df6d829c71e7163ba7f163a1f6e54977ccda24d3efd1b
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-12: against a fixture in which every leg is non-zero and mutually distinct, the settled record’s declared leg set equals the leg set of the headline, the comparison, the curve contributors and the export in both directions, and a leg invented by a surface fails the identity from the …
  ✗ FAIL: TP-01-13: removing the property leg from each of the four surfaces in turn fails the identity, each failure names the missing leg rather than reporting a numeric mismatch, …
  ✗ FAIL: TP-03-16 and TP-03-17: the rental leg reaches all four surfaces on the all-non-zero fixture alongside the property leg, …
  ✗ FAIL: TP-04-17 and TP-04-18: the classification leg reaches all four surfaces on the all-non-zero fixture alongside the property and rental legs, …
  ✗ FAIL: TP-05-15: both disposition legs the engine produces reach the headline, the comparison, the curve and the export alongside every prior leg, …
  ✗ FAIL: TP-05-16: removing each disposition leg from each of the four surfaces in turn fails the identity with the missing leg named on the named surface, …
  ✗ FAIL: TP-01-12: against the all-non-zero fixture the settled record’s declared leg set … and the benefit leg is present in it carrying its own stage and its own identity from the pack
  ✗ FAIL: TP-02-16: against the all-non-zero fixture the settled record’s declared leg set … with the inclusion leg present in it, …
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3020 passed, 8 failed
```

Reverted, revert verified, same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
reverted-clean

# TP-01-12 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3424
sha256: 3c665a547cd20b101407616a79fef1c343feddd66ef9d95a309beb336685d217
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3028 passed, 0 failed
```

**Eight assertions fell, and the breadth is the finding, not a defect in the
probe.** `legVisibilityIdentity` is the single helper every scope's leg-visibility
row consumes, so Features 023 and 024 both see the mutation. That is worth
recording for its own sake: it demonstrates the leg-visibility contract is
genuinely one shared implementation rather than five parallel copies that could
drift apart, and it means any future regression in that helper is caught by six
independent rows rather than one.

### Probe 13 — same-command RED and GREEN for TP-01-13

TP-01-13 is the adversarial half of the pair. It exists to refuse a *degenerate
census* — an identity that reports an empty finding list for everything and so
passes while a leg silently disappears. That degenerate implementation was
written directly, by suppressing the missing-leg detector while leaving the
identity's structure intact:

```js
       for (index = 0; index < declared.length; index += 1) {
-        if (rendered.indexOf(declared[index]) < 0) missing.push(declared[index]);
+        if (false && rendered.indexOf(declared[index]) < 0) missing.push(declared[index]);
       }
```

RED:

```
# TP-01-13 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3424
sha256: e9a1508083214bc0c482c30e8f55701bbbb43d041e3e443cf68224ab4fdbe7dc
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-13: removing the property leg from each of the four surfaces in turn fails the identity, each failure names the missing leg rather than reporting a numeric mismatch, …
  ✗ FAIL: TP-02-14: removing the recomputed decision from each of the four surfaces in turn fails the identity and each failure names the missing element
  ✗ FAIL: TP-03-16 and TP-03-17: the rental leg reaches all four surfaces on the all-non-zero fixture alongside the property leg, …
  ✗ FAIL: TP-04-17 and TP-04-18: the classification leg reaches all four surfaces on the all-non-zero fixture alongside the property and rental legs, …
  ✗ FAIL: TP-05-16: removing each disposition leg from each of the four surfaces in turn fails the identity with the missing leg named on the named surface, …
  ✗ FAIL: TP-01-13: removing the benefit leg from each of the four surfaces in turn is proven to fail, …
  ✗ FAIL: TP-02-17: removing the inclusion leg from each of the four surfaces in turn is proven to fail, …
  ✗ FAIL: TP-04-19: removing each of the three premium legs from each of the four surfaces in turn fails the identity in all twelve cases with both the leg and the surface named, …
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3020 passed, 8 failed
```

Reverted, revert verified, same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
reverted-clean

# TP-01-13 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3424
sha256: ac381a0137375559daf0cf1a5119006cee63c4ae31d22b177c9cda9a2d0bbc18
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3028 passed, 0 failed
```

**The discrimination against Probe 12 is exact and is the point of the pair.**
Both probes fell eight assertions, but *not the same eight*. Probe 12 fell
TP-01-12 and left the invented-leg direction reporting; this probe leaves
TP-01-12 **green** — the identity still holds on the unmutated fixture, so a
reader looking only at TP-01-12 would see nothing wrong — and falls the eight
adversarial removal rows instead. That is precisely the failure mode TP-01-13 was
written to catch: an implementation that looks correct whenever nothing is
missing, and stays silent when something is.

### Probe 14 — same-command RED and GREEN for TP-01-14

TP-01-14 holds the refusal vocabulary closed: the member count stays at its
pre-feature value and every code the property surface raises is an existing
member. Inventing a property-specific code is the defeating implementation —
it is how a closed vocabulary quietly becomes an open one:

```js
-      refusals.push(rules.unavailable("RLTAX-CONFIG-INVALID", "assessment:exemptionElections",
+      refusals.push(rules.unavailable("RLTAX-PROPERTY-ELECTIONS-INVALID", "assessment:exemptionElections",
```

RED — the assertion names the invented code rather than reporting a count
mismatch:

```
# TP-01-14 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3424
sha256: 04115ee9d49e2778c6717e2251b202e5e521653150ca73899d2698a39b939e35
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-14: the refusal vocabulary member count is unchanged at its pre-feature value and every code the property surface raises is an existing member: RLTAX-PROPERTY-ELECTIONS-INVALID
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3027 passed, 1 failed
```

Reverted, revert verified, same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
reverted-clean

# TP-01-14 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3424
sha256: 32ebb80e55d861ceac9151d36b412a0d60c0f639923c939a7c6a90cdf351bce6
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3028 passed, 0 failed
```

Exactly one assertion fell, and it carried `RLTAX-PROPERTY-ELECTIONS-INVALID` in
its own message. The row therefore catches vocabulary growth by *name*, so a
future reader is told which code escaped rather than only that the count moved.

### Probe 15 — same-command RED and GREEN for TP-01-15

TP-01-15 keeps every statutory figure in a pack and none in a module. Planting
the Florida first-tier exemption amount in the engine is the exact shadowing the
row forbids — and it is planted as an unused variable, so the probe proves the
detector fires on *presence* rather than on use:

```js
   function legVisibilityIdentity(recordLegIds, surfaces) {
+    var fallbackExemptionAmount = 25000;
     var declared = Array.isArray(recordLegIds) ? recordLegIds.slice().sort() : [];
```

RED:

```
# TP-01-15 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3424
sha256: bb0fd2a33764492f244f6bcaf814ab7eed63e16cac552ae44ca473190b62cee5
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-15: neither engine module holds a cap rate, a ceiling rate or an exemption amount, and the detector is demonstrated to fire on the packs that legitimately carry them
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3027 passed, 1 failed
```

Reverted, revert verified, same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
reverted-clean

# TP-01-15 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3424
sha256: fd679c6b14de2af45bacc6b2800370bb1216d15143a4621ab5753640c829e1ff
--- omitted 3418 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3028 passed, 0 failed
```

Exactly one assertion fell. The planted figure was never read by any code path,
which is what makes this probe informative: the row refuses a statutory figure
*living* in a module, so a dormant constant waiting to become a fallback is
caught before it ever runs.

### Probe 16 — same-command RED and GREEN for TP-01-16

TP-01-16 requires that no property declaration survives an export. The sanitiser
works by allow-list: `kept` names what leaves, and everything else is pushed to
`omittedFields`. Adding one member to that allow-list is therefore the exact
privacy regression the row exists to catch, and it is the smallest possible
form of it — one line, no logic change:

```js
     deductionMode: workspace.deductionMode,
     itemizedAmount: workspace.itemizedAmount,
+    propertyAssessedValue: workspace.propertyAssessedValue,
     conversionFundingSource: workspace.conversionFundingSource,
```

RED:

```
# TP-01-16 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3437
sha256: a84c6988e64dd4b723c696f2d1d224e5acd9305f38a010824361d528689a0042
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-16: every property and mortgage declaration is a declared workspace member, is created undeclared, is named by the unavailable-domain report while it is undeclared, is omitted by the export sanitiser and listed in omittedFields, and neither the assessed value nor the declared jurisdi
--- omitted 3397 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3041 passed, 1 failed
```

Reverted, revert verified, same command again:

```
$ git checkout -- rltaxworkspace.js && git status --short -- rltaxworkspace.js
reverted-clean

# TP-01-16 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3437
sha256: d1b562e2e79d48aced9e6deaad83739db1b7e158e692d19360c5a7d072e014eb
--- omitted 3397 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3042 passed, 0 failed
```

Exactly one assertion fell, and the row caught the leak by *two* independent
conjuncts rather than one: the member vanished from `omittedFields`, and the
literal `407311` appeared in the exported workspace. A regression that renamed
the field instead of removing it would still be caught by the second.

### Probe 17 — same-command RED and GREEN for TP-01-17

TP-01-17 has two halves: each marker sits in the file the distribution names,
and not one superseded literal survives anywhere. The marker half was rejected
as a probe target because `SUP-023-10` appears four times in the foundation
spec, so falsifying it would need four coordinated edits and would no longer be
a minimal probe. The literal half takes one line.

The literal chosen is the one SUP-023-10 retired — the hand-maintained
`toHaveCount(3)` inventory count. It was planted inside a comment, which is the
strongest form of the probe: a superseded literal that is not even executed must
still fail the row, because a commented-out clause is exactly the "merely
commented out" case the assertion's own note calls out.

```js
     derived set admits only what the page itself asks for and rots into no false green. */
+  /* RED PROBE: storageInventoryBody tr')).toHaveCount(3) */
   const declaredAssets = declaredRouteAssets();
```

RED:

```
# TP-01-17 RED
$ node scripts/selftest.mjs
exit: 1
lines: 3437
sha256: 214456bd6edb5c1865869a688536d196f5d541653929d4a60ade233512aa9c31
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-01-17: every supersession this scope owns carries its marker in the file the per-file distribution places it in, each replacement derives its expected value from the artifact it describes, and not one superseded literal survives anywhere:
--- omitted 3397 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3041 passed, 1 failed
```

Reverted, revert verified, and the probe token proven absent:

```
$ git checkout -- tests/lifetime-tax-foundation.spec.mjs && git status --short -- tests/lifetime-tax-foundation.spec.mjs
reverted-clean
$ grep -c "RED PROBE" tests/lifetime-tax-foundation.spec.mjs
0

# TP-01-17 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3437
sha256: 639cec10f734cbaf4a4d587fe99680a753cbc6475cd33d58c52f071fbb5279c1
--- omitted 3397 line(s); sha256 above covers the full output ---
Research-Lab self-test: 3042 passed, 0 failed
```

The failure message's trailing list is empty, which is the informative part:
`missingMarkers23` was empty, so the row fell purely on the surviving literal
rather than on a missing marker. The two halves are independently sensitive.

## Browser And Gate Row Completion Session

Probes 1 through 17 left intended-RED recorded for `TP-01-01` … `TP-01-17` and
`TP-01-20`. This session works the remaining rows — the four browser rows
`TP-01-18`, `TP-01-19`, `TP-01-21`, `TP-01-22`, the cumulative row `TP-01-23`
and the three gate rows `TP-01-24` … `TP-01-26` — in the same shape as before:
mutate so the row's own assertion fails, run the exact command the row names,
revert inside the same shell invocation, and re-run that same command.

Every mutation in this session is value-free by construction — an identifier, a
comparison operator, one term of a local product, or a single allow-list member
— so a slipped revert could not have disclosed a household figure. No two probes
were ever live at once, and each revert was verified before the next opened.

### Probe 18 — same-command RED and GREEN for TP-01-18

`TP-01-18` pins that a missing household declaration and an unretrieved statutory
rule refuse *differently*, and that the separation is carried by contract shape
rather than by message text. The row states that explicitly: a different code and
a different domain prefix, so a copy edit to either message cannot collapse one
into the other.

The domain prefix is therefore the exact thing to falsify, and it takes one
identifier. Collapsing the assessment domain onto the regime domain leaves both
refusals raised, both codes intact and both messages unchanged — only the prefix
separation goes:

```js
   function undeclaredMember(member, regimeId) {
-    return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "property-assessment:" + member,
+    return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "property-regime:" + member,
```

RED:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero" --reporter=list

Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/lifetime-tax-property.spec.mjs:70:1 › Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero (914ms)

  1) [system-chrome] › tests/lifetime-tax-property.spec.mjs:70:1 › Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero

    Error: expect(received).toMatch(expected)

    Expected pattern: /^property-assessment:/
    Received string:  "property-regime:assessedValue"

    > 80 |   expect(declarationDomain).toMatch(/^property-assessment:/);
         |                             ^

  1 failed
RED_EXIT=1
```

Reverted inside the same shell invocation, revert verified, same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
revert_rc=0
STATUS_EMPTY_ABOVE

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero" --reporter=list

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-property.spec.mjs:70:1 › Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero (850ms)

  1 passed (1.9s)
GREEN_EXIT=0
```

The test failed *by name* rather than erroring out of the file, and it failed on
the prefix clause specifically — the code assertion on line 78 passed first, so
`RLTAX-INPUT-INCOMPLETE` was still raised and still named `assessedValue`. That
is the informative part: the row does not lean on the code alone. Had the two
refusals been separated only by their code, this mutation would have gone
undetected, and the row proves it would not.

### Probe 19 — same-command RED and GREEN for TP-01-19

`TP-01-19` pins that the cap and the exemption are each applied *at their own
declared point*, in order, and that each step publishes the figure it moved from
and the figure it moved to. The exemption step is the second of the two, so
neutralising it — while leaving the step, its application point and its citation
in place — is the smallest change that violates only that half of the row.

One term of a local difference is removed. The step still renders, still declares
`assessed-value`, still carries `before`; only the reduction goes:

```js
-    var taxableBasis = Math.max(0, cappedValue - exemptionTotal);
+    var taxableBasis = Math.max(0, cappedValue);
```

RED:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations" --reporter=list

Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/lifetime-tax-property.spec.mjs:114:1 › Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations (6.2s)

  1) [system-chrome] › tests/lifetime-tax-property.spec.mjs:114:1 › Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations

    Error: expect(locator).toContainText(expected) failed

    Locator: locator('#propertyReliefBody tr').filter({ hasText: 'exemptions' }).first()
    Expected substring: "$284,000"
    Received string:    "exemptionsassessed-value$309,000$309,000nothis regime carries no such rule, which is a stated fact rather than a silent pass"
    Timeout: 5000ms

      145 |     await expect(exemptionRow).toContainText('$309,000');
    > 146 |     await expect(exemptionRow).toContainText('$284,000');
          |                                ^
        at <repo>/tests/lifetime-tax-property.spec.mjs:146:32

  1 failed
RED_EXIT=1
```

Reverted inside the same shell invocation, revert verified, same command again:

```
$ git checkout -- rltaxproperty.js && git status --short -- rltaxproperty.js
revert_rc=0
STATUS_EMPTY_ABOVE

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations" --reporter=list

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-property.spec.mjs:114:1 › Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations (842ms)

  1 passed (2.1s)
GREEN_EXIT=0
```

The received string is the decisive part of this capture. The exemption row is
still present, still labelled `assessed-value`, and still reports a `before` of
`$309,000` — but its `after` now reads `$309,000` as well. A regression that
silently stopped applying an elected exemption would leave a relief table that
still *looks* complete, with the right number of rows and the right application
points, and the row catches it anyway because it pins the pair of figures each
step moved between rather than the step's presence. The cap clause on line 145
passed first, so the two steps are independently sensitive.

### Probe 21 — same-command RED and GREEN for TP-01-21

`TP-01-21` asserts two-directional set identity between the settled record and
each of four surfaces — headline, comparison, curve and export. The way it can
rot is a leg that settles and then quietly fails to reach one surface, so the
probe removes the property leg from exactly one surface and leaves the other
three intact. The export is chosen because it is the surface furthest from the
settlement and the one a reader is least likely to check by eye.

The mutation is an identifier-keyed filter, so no figure appears in it:

```js
-                var settledLegs = state.envelope ? state.envelope.legIds.slice() : [];
+                var settledLegs = state.envelope ? state.envelope.legIds.filter(function (legId) { return legId !== "property-tax"; }) : [];
```

RED:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export" --reporter=list

Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/lifetime-tax-property.spec.mjs:223:1 › Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export (986ms)

  1) [system-chrome] › tests/lifetime-tax-property.spec.mjs:223:1 › Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export

    Error: the leg property-tax is in the settled record and does not reach export

    expect(received).toContain(expected) // indexOf

    Expected value: "property-tax"
    Received array: ["additional-medicare-tax", "net-investment-income-tax", "ordinary", "preferential"]

      295 |       sortedRecord.forEach((legId) => {
      296 |         expect(rendered, `the leg ${legId} is in the settled record and does not reach ${surface}`)
    > 297 |           .toContain(legId);
          |            ^
        at forEach (<repo>/tests/lifetime-tax-property.spec.mjs:297:12)

  1 failed
RED_EXIT=1
```

Reverted inside the same shell invocation, revert verified, same command again:

```
$ git checkout -- lifetime-tax-strategy-lab.html && git status --short -- lifetime-tax-strategy-lab.html
revert_rc=0
STATUS_EMPTY_ABOVE

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export" --reporter=list

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-property.spec.mjs:223:1 › Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export (747ms)

  1 passed (1.9s)
GREEN_EXIT=0
```

The failure line is the row's own message rather than a bare matcher diff: *the
leg property-tax is in the settled record and does not reach export*. It names
the leg and the surface, which is what makes the row diagnostic rather than
merely red — a maintainer reading this failure is told which of the four
surfaces dropped the leg without opening the test. The headline, comparison and
curve surfaces were all checked and passed before the export surface was
reached, so the four are independently sensitive rather than sharing one lookup.

### Probe 22 — same-command RED and GREEN for TP-01-22

`TP-01-22` has two halves: no request follows the property settlement at all,
and no declaration reaches a URL, a body, a console message or the address bar.

The obvious probe for the second half — a request carrying a household figure in
its query string — was **deliberately not used**. Planting a real exfiltration in
the page, even briefly, is the one mutation whose slipped revert would be an
actual privacy defect rather than a broken test, and this scope's own probe
discipline requires every mutation to be value-free by construction. The probe
instead falsifies the *first* half with a request that carries nothing at all: a
re-read of a route asset the configuration already declares, with no query
string and no household data of any kind.

```js
   function renderProperty() {
+      window.fetch("tax-rules/property/FL/2026.json");
       var refusalHost = byId("propertyRefusal");
```

RED:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-001 the request ledger stays empty and no property declaration reaches a URL" --reporter=list

Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/lifetime-tax-property.spec.mjs:311:1 › Regression: SCN-023-001 the request ledger stays empty and no property declaration reaches a URL (926ms)

  1) [system-chrome] › tests/lifetime-tax-property.spec.mjs:311:1 › Regression: SCN-023-001 the request ledger stays empty and no property declaration reaches a URL

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 26
    Received: 40

    > 333 |   expect(ledger.length).toBe(afterFirstPaint);
          |                         ^
        at <repo>/tests/lifetime-tax-property.spec.mjs:333:25

  1 failed
RED_EXIT=1
```

Reverted inside the same shell invocation, revert verified, the probe token
proven absent, same command again:

```
$ git checkout -- lifetime-tax-strategy-lab.html && git status --short -- lifetime-tax-strategy-lab.html
revert_rc=0
STATUS_EMPTY_ABOVE
probe_token_remaining=0

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-001 the request ledger stays empty and no property declaration reaches a URL" --reporter=list

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-property.spec.mjs:311:1 › Regression: SCN-023-001 the request ledger stays empty and no property declaration reaches a URL (777ms)

  1 passed (1.8s)
GREEN_EXIT=0
```

Twenty-six requests before the mutation, forty after. That gap is the useful
result, and it is stronger than the leak probe would have been. Every added
request went to a path the configuration *permits*, so the allow-list clause on
line 337 would have passed and the sentinel scans on line 348 would have passed
too — the row falls purely on the count. A regression that started polling a
perfectly innocuous declared asset after every keystroke would leak nothing and
still be caught, which is the property a privacy row needs: it pins silence, not
merely the absence of a known-bad string.

### Probe 24 — same-command RED and GREEN for TP-01-24

`TP-01-24` is the repository gate: the whole suite stays green **and** the
pre-existing pass count does not fall. A gate row is falsified by any real
regression reaching the suite, so the probe is a value-free arithmetic mutation —
one term of a local difference dropped, so the elected exemptions stop reducing
the taxable basis:

```js
-    var taxableBasis = Math.max(0, cappedValue - exemptionTotal);
+    var taxableBasis = Math.max(0, cappedValue);
```

The dropped term is a running local total, not a figure, so a slipped revert
could not have disclosed a household value. The mutation was verified to have
landed before the run:

```
new=1 old=0
```

RED — the row's exact command:

```
$ node scripts/selftest.mjs

  ✗ FAIL: TP-01-05: below, exactly at and above the cap ceiling the capped assessment, the exemption-reduced taxable basis and the tax are each exact, and the boundary itself is not treated as bound
  ✗ FAIL: TP-01-06: two regimes differing ONLY in capBasis produce different taxable bases from identical declarations, and each record names the basis it applied
  ✗ FAIL: TP-01-11b: the property marginal context states explicitly that the leg does not move with income, and a refused settlement produces an unavailable context carrying the refusal code rather than a zero contribution
Research-Lab self-test: 3103 passed, 3 failed
RED_EXIT=1
```

Reverted inside the same shell invocation, revert verified before anything else
ran:

```
$ git checkout -- rltaxproperty.js
revert_rc=0
$ git status --short -- rltaxproperty.js
STATUS_EMPTY_ABOVE
```

GREEN — same command, clean tree:

```
$ git status --short -- rltaxproperty.js
PRE_GREEN_STATUS_EMPTY_ABOVE

$ node scripts/selftest.mjs
Research-Lab self-test: 3106 passed, 0 failed
GREEN_EXIT=0
```

Both halves of the row moved and the row is sensitive to each. The suite went
from green to failing, and the pass count fell 3106 → 3103 rather than merely
holding while failures appeared — so the row would catch a regression that
deleted assertions as well as one that broke them. The three failures are
themselves informative: a single dropped term reached the known-value row, the
cap-basis row and the marginal-context row, which is the blast radius a
repository gate exists to surface.

### Probe 25 — same-command RED and GREEN for TP-01-25

`TP-01-25` pins that no spec artifact in this feature names a test file that does
not exist. The falsifying mutation is therefore a single identifier inside one
Test Plan reference — no figure, no threshold, no code path:

```md
- - `<repo>/tests/lifetime-tax-route.spec.mjs` — SUP-023-06 only.
+ - `<repo>/tests/lifetime-tax-routeprobe.spec.mjs` — SUP-023-06 only.
```

The two paths above carry a `<repo>/` prefix that the live scope artifact did
not: the mutation itself used the bare form. The prefix is the repository's
established way of quoting a path inside evidence without the path-guard
re-parsing the quotation as a live reference — the same guard this row proves.
Without it, this evidence block would itself report the probe's deliberately
absent file as a new missing path.

The scope's second reference to the same file, at line 178, was left intact, so
the guard had to catch the one broken site among fourteen thousand references
rather than notice a file dropping out of the tree entirely. Landing verified
before the run — `old=1` is the surviving untouched reference:

```
new=1 old=1
```

RED — the row's exact command:

```
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=678 references=14977 distinctPaths=247 missingPaths=68 baseline=67 new=1 stale=0
  NEW-MISSING <repo>/tests/lifetime-tax-routeprobe.spec.mjs (1 reference site(s))
      referenced at specs/023-property-tax-and-rental-income/scopes/01-property-assessment-mechanics/scope.md:104
[spec-test-paths] FAIL — 1 new referenced path(s) do not exist
RED_EXIT=1
```

Reverted inside the same shell invocation, revert verified:

```
$ git checkout -- specs/023-property-tax-and-rental-income/scopes/01-property-assessment-mechanics/scope.md
revert_rc=0
$ git status --short -- .../scope.md
STATUS_EMPTY_ABOVE
```

GREEN — same command, clean tree:

```
$ git status --short -- .../scope.md
PRE_GREEN_STATUS_EMPTY_ABOVE

$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=678 references=14977 distinctPaths=246 missingPaths=67 baseline=67 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
GREEN_EXIT=0
```

The row is sensitive on the axis it claims. `baseline=67` is identical across
both directions, so the RED came from the scan and not from a baseline edit, and
the counters move exactly one step each — `distinctPaths` 246 → 247,
`missingPaths` 67 → 68, `new` 0 → 1. The guard also named the referencing
artifact and line, which is what makes the row actionable rather than merely
red. The six stale baseline entries recorded earlier in this report are now
`stale=0`; that cleanup belongs to another feature and no baseline file was
touched by this probe.

### Probe 26 — same-command RED and GREEN for TP-01-26

`TP-01-26` has three conjuncts: the Pages plan succeeds, `site-exclusions.json`
is unchanged, and `tax-rules/` remains outside the public directories. The third
is the one this scope owns, and it is not enforced by an exclusion entry —
`site-exclusions.json` carries no `tax-rules` line at all. The regime packs stay
private because the publisher works from a closed allow-list, so the falsifying
mutation is one added member of that list:

```js
- const PUBLIC_DIRECTORIES = Object.freeze([… 'rlexperience-adapters', 'tests/fixtures']);
+ const PUBLIC_DIRECTORIES = Object.freeze([… 'rlexperience-adapters', 'tax-rules', 'tests/fixtures']);
```

A directory name is an identifier, not a figure, so a slipped revert could not
have disclosed a household value — though it would have published the regime
packs, which is why the revert was issued in the same invocation and verified
before anything else ran. Landing verified first:

```
new=1 old=0
```

RED — the row's exact command:

```
$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":128,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tax-rules","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/004902309400a815a8ac1da2877422310e381d5c20748f711cbd0233e959a67a","omittedOrphanIndexes":144}
RED_EXIT=0
```

Reverted inside the same shell invocation, revert verified:

```
$ git checkout -- scripts/build-pages-site.mjs
revert_rc=0
$ git status --short -- scripts/build-pages-site.mjs
STATUS_EMPTY_ABOVE
```

GREEN — same command, clean tree:

```
$ git status --short -- scripts/build-pages-site.mjs
PRE_GREEN_STATUS_EMPTY_ABOVE

$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":128,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/004902309400a815a8ac1da2877422310e381d5c20748f711cbd0233e959a67a","omittedOrphanIndexes":144}
GREEN_EXIT=0
```

**The exit code did not move, and that is the honest reading of this probe.**
`tax-rules` enters and leaves the published `directories` array between the two
runs — the row's third conjunct is genuinely falsified and genuinely restored by
the same command — but both runs exit 0. The mutation publishes the regime packs
*successfully*; a publisher has no reason to refuse a directory it was told to
publish. So this row's third conjunct is enforced by reading the `directories`
array, not by the process exit status, and the RED above proves the observation
is sensitive rather than proving the command is.

**Finding — the deploy gate's privacy conjunct is not exit-code enforced.** A
grep of `scripts/selftest.mjs` for an assertion pinning `tax-rules` out of the
published set returns nothing, so no automated check would fail if a future
change added the regime packs to `PUBLIC_DIRECTORIES`. The dry-run output would
show it and CI would stay green. This is a gap in the gate, not in the evidence
above; it is recorded here rather than fixed, because `scripts/build-pages-site.mjs`
sits outside this scope's change boundary and the fix belongs to whoever owns the
publisher.

## Change Boundary

Command: a path-scoped status check over the excluded list.

```
$ git status --porcelain -- rlportfolio.js rlportfolioanalytics.js \
    portfolio-survival-allocation.config.json specs/008-portfolio-survival-and-brief-lab \
    tools.json index.html rlnav.js README.md notes/README.md market-brief.js briefs data \
    watchlist.json scripts/build-pages-site.mjs scripts/validate-spec-test-paths.baseline \
    rltaxstrategy.js rltaxstate.js rltaxcombined.js tax-rules/federal tax-rules/state \
    tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-federal.spec.mjs \
    tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax.support.mjs
?? rltaxcombined.js
?? rltaxstate.js
?? rltaxstrategy.js
?? tax-rules/federal/
?? tax-rules/state/
?? tests/lifetime-tax-conversion.spec.mjs
?? tests/lifetime-tax-federal.spec.mjs
?? tests/lifetime-tax-marginal.spec.mjs
?? tests/lifetime-tax.support.mjs
```

Every entry is `??`, the untracked state these files have carried since Feature 021
and 022 landed in this working tree. Not one is `M`. `rlportfolio.js`,
`rlportfolioanalytics.js`, `portfolio-survival-allocation.config.json`,
`specs/008-portfolio-survival-and-brief-lab`, `tools.json`, `index.html`,
`rlnav.js`, `README.md`, `notes/README.md`, `briefs`, `data`, `watchlist.json`,
`scripts/build-pages-site.mjs` and `scripts/validate-spec-test-paths.baseline` do
not appear at all, which is the status check's way of reporting them unchanged.

Both income-tax pack families are among the untouched entries, which is the point
the boundary exists to prove: opening the housing axis required no edit to
`tax-rules/federal/**` or `tax-rules/state/**`, so the axis is a seam.

The whole working tree carries exactly two tracked modifications:

```
$ git status --short
 M scripts/selftest.mjs
 M site-exclusions.json
```

`scripts/selftest.mjs` is an allowed modified path for this scope.
`site-exclusions.json` is EXCLUDED and was not opened by this scope; its 32-line
insertion diff is the pre-existing Feature 021 entry set that already stood in this
working tree before this dispatch began.

## Claim Boundary

Command: `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths.

The standing in-suite check is `TP-01-CLAIM`, which scans `rltaxproperty.js` and
both regime packs and proves its own detector live by firing on a sentence that
does make the claim. It passes inside the run recorded above. The same scan was run
directly over this scope's allowed paths including the new browser spec:

```
$ grep -rniE "probability|probable|likely to|appreciation|expected return|break-even|track record|error rate|accuracy rate|typical rate|estimated value|our estimate" \
    rltaxproperty.js tax-rules/property tests/lifetime-tax-property.spec.mjs
grep_exit=1 (1 = no match, clean)

$ printf 'this figure is our estimate\n' | grep -niE "our estimate"
1:this figure is our estimate
detector_exit=0

$ grep -nE "estimate" lifetime-tax-strategy-lab.html
(no output)
```

No output states a probability, an appreciation assumption, a lifetime figure, a
break-even year, a ranking, a recommendation, a track record or an error rate, and
no property figure is presented as an estimate or a typical rate. The refusal copy
goes the other way: it says a typical value, average or estimate is NOT substituted.

## Completion Statement

Scope 1 is complete against twelve of its thirteen Definition of Done rows. Every
requirement in its coverage — FR-023-001 through FR-023-007 and the inherited
non-functional set — is implemented and asserted, the four shipped-and-absent
sourcing outcomes are recorded with their locators and remediations, the property
leg reaches all four surfaces under a two-directional identity on an all-non-zero
fixture, and all five supersessions this scope owns are delivered with no
superseded literal surviving.

The thirteenth row — "every Test Plan row has intended RED and same-command GREEN
evidence recorded" — is left unchecked. GREEN is recorded for every row from
TP-01-01 to TP-01-26. Intended RED was observed in this session only for the rows
this dispatch implemented; for the rows whose implementation predates it, a
before-implementation RED cannot honestly be claimed now, and two reconstructions
are recorded above in its place rather than a claim. Closing that row requires
re-deriving the missing RED evidence, which is a separate piece of work.

Gates observed in this session, all green: `node scripts/selftest.mjs` exit 0 with
2653 passed and 0 failed; the six-file browser suite exit 0 with 21 passed;
`node scripts/build-pages-site.mjs --dry-run` exit 0;
`bash .github/bubbles/scripts/artifact-lint.sh specs/023-property-tax-and-rental-income`
exit 0; `node scripts/validate-spec-test-paths.mjs` exit 0.
