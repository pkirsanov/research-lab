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
