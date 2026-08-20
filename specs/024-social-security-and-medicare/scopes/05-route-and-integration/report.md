# Scope 5 Execution Report — Route, Accessibility And Integration

This file is the evidence surface for scope 5. Every anchor below holds raw,
unfiltered terminal output with its exit code, recorded in the session that
produced it.

## Summary

This scope was picked up mid-flight. An interrupted dispatch had already written
the `lifetime-tax — retirement route and integration` selftest group, the
complete-settlement fixture, the census surfaces and most of the route work, and
had left **three of its own new assertions RED**: TP-05-04, TP-05-08 and TP-05-09.
The whole-repository suite stood at `2840 passed, 3 failed`.

The three reds were diagnosed and the **product** was changed to satisfy them. No
assertion was weakened, deleted, inverted or narrowed, and no supersession was
recorded, because none was needed.

| Red assertion | Diagnosis | Product change |
| --- | --- | --- |
| TP-05-04 | `composeSurfaceCensus` accepted `includedTotalLegIds` and never read it. It emitted `missing-leg` and `undeclared-leg` only, so a cost leg present on all four surfaces **and** summed into `totalFederalTax` produced no finding at all — the exact defect the clause exists to catch | Added the mis-summed pass to `CO-24`. It runs **outside** the per-surface loop, because a mis-summed leg is a fact about the total rather than about any one surface: it is reported once, names no surface, and states in words that a leg declared as a cost entered the federal tax total |
| TP-05-08 | `SIMPLE_FIELDS` carried twelve members and none of the three this feature owes. The two-directional identity held vacuously over the old set | Added `annualBenefit`, `taxableBenefitPortion` and `annualMedicareCost` to the closed list and gave each a render site through the Simple constructor. The annual Medicare cost was already rendered beside the headline and was converted from the general constructor to the Simple one, so it gained a field identity without gaining a second node |
| TP-05-09 | `power-rule-ledger` was a declared Power section with **no withheld-detail link**. The reverse direction of the identity — no declared section without a link — was genuinely false of the page | Added the missing link row. It is **appended** rather than inserted, because a prior feature's browser row follows a link by position and an inserted row silently retargets it; that regression was observed once and then fixed |

After the change the suite reads `2843 passed, 0 failed`. The pass count rose by
exactly the three assertions that were failing, and nothing else moved.

This scope additionally authored the missing browser file
`tests/lifetime-tax-retirement-route.spec.mjs` carrying TP-05-19 through TP-05-25.
The full `lifetime-tax-*` browser suite rose from 56 rows to 63 rows, all passing.

This scope retrieved nothing and authored no figure.

## Completion Statement

**Sixteen of eighteen** Definition of Done rows in
[scope.md](scope.md#definition-of-done) are checked. Two are not, and each carries
its reason in `scope.md` and again here:

1. **Excluded-path byte-identity is unverifiable.** The entire lifetime-tax tree
   is untracked in this repository — `git status --short` reports every
   `rltax*.js`, every `tax-rules/` file and every `tests/lifetime-tax-*.spec.mjs`
   as `??` — so git cannot compare any of them against a committed baseline. What
   *is* observable is recorded under [Change Boundary](#change-boundary): every
   excluded path's modification time predates this session's first edit. That is
   real evidence of non-modification and it is weaker than byte-identity, so the
   row stays unchecked rather than being checked against a claim git cannot
   support.
2. **Intended RED was not observed for every Test Plan row.** A genuine RED was
   observed and recorded for TP-05-04, TP-05-08 and TP-05-09 — including the
   scope's own named intended-RED assertion, TP-05-04 — and for two clauses of
   TP-05-22 during authoring. TP-05-01 through TP-05-03, TP-05-05 through TP-05-07
   and TP-05-10 through TP-05-18 were already GREEN when this session began, so no
   intended RED was observed for them **in this session**. Retro-fitting one by
   breaking a passing assertion and repairing it would manufacture evidence rather
   than record it.

## Sourcing

Not applicable, and that is itself the evidence. This scope closed no blocking
implementation input, retrieved no primary source and authored no figure. The
mtime record under [Change Boundary](#change-boundary) shows every file under
`tax-rules/` and `rltaxrules.js` untouched by this session.

One consequence of that discipline is visible on the page and is worth stating
plainly: the shipped medicare pack carries **no standard Part D premium**, so the
aggregate annual Medicare cost is an `AbsentFigure/v1` and renders as a whole
refusal rather than as an understated total. TP-05-22 asserts the Simple field is
declared and that the card renders **either** the figure **or** a complete refusal,
because asserting the figure visible unconditionally would be asserting a number
the pack does not have.

## Supersession Ledger

This scope delivered **no** ledger entry, and that is the planned outcome rather
than an omission. Every count it grew had already been converted to a derived form
by a predecessor, and each absorbed this feature's growth without an edit:

| Growth this scope caused | Derived identity that absorbed it | Evidence |
| --- | --- | --- |
| Three Simple fields added, twelve to fifteen | SUP-023-04, both directions | TP-05-08 passing, and the Feature 021 group's `simpleFields.length === renderedSimpleFieldIds.length + 1` still holds at fifteen and fourteen |
| One withheld-detail link added, eighteen to nineteen | SUP-023-05 and SUP-023-06 | TP-05-09 passing, and `tests/lifetime-tax-route.spec.mjs` still green |
| Four Power sections asserted linked | SUP-023-06, both directions | TP-05-09 passing |
| Leg surface census extended with the cost clause | SUP-023-13 | TP-05-02, TP-05-03 and TP-05-04 passing |
| One pack family in the request allow-list | SUP-023-10 as replaced by SUP-024-09 | TP-05-25 passing |

Feature-end marker check, all four surfaces asserted equal by TP-05-18 and observed
passing: the distinct `SUP-024-NN` markers in the repository, the ledger's rows,
the total the ledger's opening paragraph states, the sum of the ownership column in
[`scopes/_index.md`](../_index.md) and the per-file marker distribution count in
[`design.md`](../../design.md) are all **twelve**, with `| 05 | none | 0 |`
recorded in the ownership table.

No ASC-8 in-flight admission was made.

## Change Boundary

Files created or modified by **this session**, all inside the scope's allowed set:

| Path | Allowed as | Change |
| --- | --- | --- |
| `rltax.js` | Allowed modified | The `CO-24` mis-summed pass |
| `lifetime-tax-strategy-lab.html` | Allowed modified | Three Simple fields, their render sites, the `simpleDecisionSummary` container, one appended withheld-detail link |
| `tests/lifetime-tax-retirement-route.spec.mjs` | Allowed new | TP-05-19 through TP-05-25 |

`scripts/selftest.mjs` was **not** modified by this session; the scope's group was
already present from the interrupted dispatch. No prior-feature test file was
opened for editing.

```text
$ date '+now=%Y-%m-%d %H:%M:%S'
now=2026-08-18 12:03:29
$ ls -lt <the allowed and excluded path sets>
-rw-r--r--@ 1 pkirsanov  staff   283820 Aug 18 11:55 lifetime-tax-strategy-lab.html
-rw-r--r--@ 1 pkirsanov  staff   103635 Aug 18 11:44 rltax.js
-rw-r--r--@ 1 pkirsanov  staff  1701555 Aug 18 11:39 scripts/selftest.mjs
-rw-r--r--@ 1 pkirsanov  staff     3986 Aug 18 10:51 site-exclusions.json
-rw-r--r--@ 1 pkirsanov  staff   198465 Aug 18 10:11 rltaxrules.js
-rw-r--r--@ 1 pkirsanov  staff    48110 Aug 18 09:51 rltaxworkspace.js
-rw-r--r--@ 1 pkirsanov  staff    25751 Aug 18 09:50 rltaxmedicare.js
-rw-r--r--@ 1 pkirsanov  staff    21157 Aug 18 09:50 tax-rules/medicare/2026.json
-rw-r--r--@ 1 pkirsanov  staff    18154 Aug 18 09:50 rltaxstrategy.js
-rw-r--r--@ 1 pkirsanov  staff   101749 Aug 18 09:49 tax-rules/federal/2026.json
-rw-r--r--@ 1 pkirsanov  staff    11466 Aug 18 09:30 tests/lifetime-tax-medicare.spec.mjs
-rw-r--r--@ 1 pkirsanov  staff    23133 Aug 18 08:56 tests/lifetime-tax-route.spec.mjs
-rw-r--r--@ 1 pkirsanov  staff     5855 Aug 18 08:24 tax-rules/mortality/2026.json
-rw-r--r--@ 1 pkirsanov  staff    15432 Aug 18 08:24 tests/lifetime-tax-inclusion.spec.mjs
-rw-r--r--@ 1 pkirsanov  staff    27978 Aug 18 08:24 rltaxinclusion.js
-rw-r--r--@ 1 pkirsanov  staff    19893 Aug 18 08:24 rltaxclaimage.js
-rw-r--r--@ 1 pkirsanov  staff    28868 Aug 18 01:18 tax-rules/benefit/2026.json
-rw-r--r--@ 1 pkirsanov  staff    18644 Aug 18 01:18 tests/lifetime-tax-benefit.spec.mjs
-rw-r--r--@ 1 pkirsanov  staff     5027 Aug 18 01:18 tests/lifetime-tax.support.mjs
-rw-r--r--@ 1 pkirsanov  staff    39934 Aug 18 00:49 rltaxsocialsecurity.js
-rw-r--r--@ 1 pkirsanov  staff    16205 Aug 17 23:27 rltaxdisposition.js
-rw-r--r--@ 1 pkirsanov  staff    19184 Aug 17 22:22 rltaxuse.js
-rw-r--r--@ 1 pkirsanov  staff    43723 Aug 17 22:09 rltaxrental.js
-rw-r--r--@ 1 pkirsanov  staff    28566 Aug 17 21:06 rltaxproperty.js
-rw-r--r--@ 1 pkirsanov  staff    31434 Aug 17 18:26 rltaxstate.js
-rw-r--r--@ 1 pkirsanov  staff    37059 Aug 17 18:26 rltaxcombined.js
-rw-r--r--@ 1 pkirsanov  staff    11189 Aug 17 10:07 notes/README.md
-rw-r--r--@ 1 pkirsanov  staff    26300 Aug 17 10:07 README.md
-rw-r--r--@ 1 pkirsanov  staff    82280 Aug 17 06:34 tools.json
-rw-r--r--@ 1 pkirsanov  staff    21092 Aug 17 06:34 rlnav.js
-rw-r--r--@ 1 pkirsanov  staff    50087 Aug 17 06:34 index.html
```

This session's first edit landed at **11:44**. Every excluded path above carries an
mtime of **11:39 or earlier**, including every file under `tax-rules/`,
`rltaxrules.js`, every prior-feature `tests/lifetime-tax-*.spec.mjs`,
`tests/lifetime-tax.support.mjs`, `tools.json`, `index.html`, `rlnav.js`,
`README.md` and `notes/README.md`.

`site-exclusions.json` shows as modified in `git status` and carries an mtime of
10:51, before this session. Its diff adds the Feature 021 through 023 module
exclusions and the concurrent session's Feature 025 entries; it carries no entry
from this scope, which creates no root HTML. TP-05-REGISTRATION asserts it still
holds **exactly one** `lifetime-tax-strategy-lab.html` decision, and that assertion
passes.

## Claim Boundary

```text
$ grep -nEi '(probability|monte carlo|plan success|success rate|likely to|expected return|track record|error rate|accuracy rate|optimal|recommended|best choice|best option|best age|best strategy)' tests/lifetime-tax-retirement-route.spec.mjs
scan_new_spec_exit=1
$ grep -nEi '(probability|monte carlo|plan success|success rate|track record|error rate|accuracy rate|optimal|recommended|best choice|best option|best age|best strategy)' lifetime-tax-strategy-lab.html
scan_route_exit=1
```

Exit 1 with no output is grep's no-match result, so neither this scope's new
browser file nor the route states a probability, a plan success figure, a track
record or an error rate, and neither describes anything as optimal, recommended or
best. TP-05-CLAIM asserts the same over the census records, the export, the
contribution record and the Simple renderer's code, and passes with its detector
proven to fire on a sentence that does state such a claim.

## Findings Raised And Not Fixed Here

Two things were observed that this scope does not own. Neither was patched, and
neither is hidden.

1. **The interim leg-render identities cannot be converted.** `renderSimple` draws
   the benefit and the taxable portion into `#headlineBlock` through the general
   value constructor under `benefit-headline` and `inclusion-headline`. The in-file
   comment says those ids were interim and that the Simple field set was a later
   scope's to grow — this scope. They were **not** renamed, because
   `tests/lifetime-tax-benefit.spec.mjs` and `tests/lifetime-tax-inclusion.spec.mjs`
   pin them by selector and are excluded paths, and the rename would need a
   supersession this scope is forbidden to own: TP-05-18 pins the ledger at twelve
   rows and pins `| 05 | none | 0 |`. The three Simple fields were therefore added
   as their own decision-level render sites in `simpleDecisionSummary`, which
   repeats the benefit and the taxable portion once under their decision
   identities. That duplication is the cost of the constraint and is recorded
   rather than argued away.
2. **A pre-existing route assertion is fixture-dependent.**
   `tests/lifetime-tax-route.spec.mjs` asserts that every `#simple [data-rl-value]`
   is a member of the declared Simple field list. That holds only because its
   household declares no benefit and no sale; on a retirement household the
   leg-identity figures are drawn into `#simple` through the general constructor
   and are not Simple fields, so the assertion is false of the product it
   describes. This was discovered by writing the same clause into TP-05-22 and
   watching it fail. TP-05-22 now asserts the accurate two-part invariant instead —
   every figure in Simple is **either** a declared Simple field **or** a figure of a
   leg the settled record declares — with both halves proven non-vacuous. The prior
   file was not opened.

## Scenario Evidence

### Scenario SCN-024-013

Every leg this feature adds reaches all four surfaces. Unit side: TP-05-01 through
TP-05-07 under `node scripts/selftest.mjs`, all passing. Browser side: the census
row and the cost-separation row in
[TP-05-19 … TP-05-25](#tp-05-19--tp-05-25), both passing over the real route with a
complete retirement household.

### Scenario SCN-024-014

The included portion reaches taxable income and the export omits every
declaration. Unit side: TP-05-13 through TP-05-16, all passing. Browser side: the
export row and the privacy row in [TP-05-19 … TP-05-25](#tp-05-19--tp-05-25), both
passing. The export row reads the file the browser actually downloaded and asserts
each of the five declarations independently, by name and by declared value.

### Scenario SCN-024-015

Simple stays decision-level and every unavailable item is reachable. Unit side:
TP-05-08 through TP-05-12, all passing. Browser side: the Simple-discipline row,
the accessibility sweep and the focus-safety row in
[TP-05-19 … TP-05-25](#tp-05-19--tp-05-25), all passing.

## Test Evidence

### Intended RED

The state this session inherited. `node scripts/selftest.mjs`:

```text
  ✗ FAIL: TP-05-04: a premium leg present on all four surfaces and summed into totalFederalTax is reported as a mis-summed leg naming it and naming no surface, distinguishably by kind from the missing-leg report of the same leg on one surface, for every declared cost leg, while a leg that legitimately enters the total is not reported
  ✗ FAIL: TP-05-08: the derived Simple field identity holds in both directions with the three new fields present — every id drawn through the Simple constructor is admitted by the closed list and every member of the closed list has a render site — both directions are proven able to fail, and no Simple field name matches a band, curve, ledger, trace, reconciliation, per-age or average pattern
  ✗ FAIL: TP-05-09: the derived withheld-detail link identity holds in both directions with the four new Power sections present — no link exists without a declared section, no declared section exists without a link, and every declared section is a real element on the page
Research-Lab self-test: 2840 passed, 3 failed
```

This is the scope's **named intended-RED assertion** observed failing on the report
shape: before the cost clause existed the census reported the mis-summed case not
at all. TP-05-09's failure was localised to a single named cause by running the
assertion's own derivation directly:

```text
linkRowsBlock found: true
sections without link: [ 'power-rule-ledger' ]
links without section: []
sections not element: []
```

### Same-command GREEN

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 2843 passed, 0 failed
```

### TP-05-01 … TP-05-18, TP-05-CLAIM, TP-05-REGISTRATION

All twenty assertions of the `lifetime-tax — retirement route and integration`
group, from the run above. Command: `node scripts/selftest.mjs`, exit 0.

```text
lifetime-tax — retirement route and integration
  ✓ TP-05-01: the complete-settlement fixture carries every leg the federal pack, the benefit pack, the inclusion poli
  ✓ TP-05-02: over the complete fixture the record’s declared leg set equals the leg set of the headline, the comparis
  ✓ TP-05-03: removing each declared leg from each of the four surfaces in turn produces exactly one missing-leg findi
  ✓ TP-05-04: a premium leg present on all four surfaces and summed into totalFederalTax is reported as a mis-summed l
  ✓ TP-05-05: the Simple renderer reads settlement.totalFederalTax and reads none of the four single leg members anywh
  ✓ TP-05-06: a renderer reading ordinaryTax, preferentialTax, netInvestmentIncomeTax or additionalMedicareTax in plac
  ✓ TP-05-07: the three premium legs reach the settled leg record with includedInTotal false, the federal total is byt
  ✓ TP-05-08: the derived Simple field identity holds in both directions with the three new fields present — every id
  ✓ TP-05-09: the derived withheld-detail link identity holds in both directions with the four new Power sections pres
  ✓ TP-05-10: every family renderer returns early on the refusal shape before reading a member only the available shap
  ✓ TP-05-11: the one unavailable constructor renders the code, the domain, the reason and the remediation on a focusa
  ✓ TP-05-12: the edit path returns before collecting, persisting or rendering when the declaration signature is uncha
  ✓ TP-05-13: the export omits the statement amount, the earnings record, the birth year, the claim age set and the lo
  ✓ TP-05-14: admitting each of the five retirement declarations into the sanitizer’s kept set in turn is caught by na
  ✓ TP-05-15: the included amount is published as a named contributor to ordinary taxable income under the leg identit
  ✓ TP-05-16: no retirement declaration this feature added appears in any console call, any location write or any hist
  ✓ TP-05-17: at feature end the refusal vocabulary still carries exactly its fourteen pre-feature members in both dir
  ✓ TP-05-18: the distinct SUP-024-NN markers in the repository equal the ledger’s twelve entries, the row count equal
  ✓ TP-05-CLAIM: neither the census, the export, the contribution record nor the Simple renderer’s code states a proba
  ✓ TP-05-REGISTRATION: the lifetime tax lab and its modules remain absent from tools.json, the index, the navigation
```

Each line is trimmed at 118 columns for terminal width only; the full statements
are the assertion messages in `scripts/selftest.mjs`.

### TP-05-19 … TP-05-25

The seven browser rows this scope authored, run as one file.

```text
$ npx playwright test tests/lifetime-tax-retirement-route.spec.mjs --project=system-chrome --reporter=line

Running 7 tests using 1 worker
  7 passed (6.1s)
```

Two genuine REDs were observed while authoring TP-05-22, and both were resolved by
correcting the assertion to describe the product accurately rather than by
weakening it:

```text
    Error: expect(received).toContain(expected) // indexOf
    Expected value: "benefit-headline"
    Received array: ["packIdentity", "headlineFederalTax", "conversionAmount", "federalTaxDifference", "effectiveMarginalRateAtEdge", "strongestTradeoff", "resultKind", "deductionSideChosen", "propertyTax", "rentalNet", …]
      > 207 |   rendered.forEach((field) => expect(declared).toContain(field));
```

```text
    Error: expect(locator).toBeVisible() failed
    Locator: locator('#simple [data-rl-value="annualMedicareCost"]')
    Expected: visible
    Error: element(s) not found
```

The first is the fixture-dependent invariant recorded under
[Findings](#findings-raised-and-not-fixed-here). The second is the pack's own
`AbsentFigure/v1` for the standard Part D premium: the aggregate annual cost is
legitimately withheld, so the row now asserts a figure **or** a whole refusal.

A third RED was observed and fixed in the product rather than in a test. Inserting
the new withheld-detail link at the head of `POWER_LINK_ROWS` retargeted
`tests/lifetime-tax-route.spec.mjs`'s positional `links.nth(3).click()` from
`power-bracket-detail` to `power-settlement`:

```text
  1) [system-chrome] › tests/lifetime-tax-route.spec.mjs:37:1 › Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail
```

The link was moved to the end of the list and the prior row went green again:

```text
$ npx playwright test tests/lifetime-tax-route.spec.mjs tests/lifetime-tax-benefit.spec.mjs tests/lifetime-tax-inclusion.spec.mjs tests/lifetime-tax-medicare.spec.mjs --project=system-chrome --reporter=line

Running 18 tests using 4 workers
  18 passed (6.5s)
```

### TP-05-26

The cumulative browser suite over the real route, every scenario of Features 021
through 024.

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=line

Running 66 tests using 6 workers
  66 passed (20.4s)
EXIT=0
```

And the whole `lifetime-tax-*` browser tree, which is the set the scope's excluded
list protects:

```text
$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line

Running 63 tests using 6 workers
  63 passed (42.7s)
EXIT=0
```

Fifty-six of those rows are prior features' and were not opened; the seven new ones
are this scope's.

### TP-05-27

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 2843 passed, 0 failed
```

The pre-existing pass count did not fall. It rose from 2840 to 2843, which is
exactly the three assertions that were failing when this session began.

### TP-05-28

```text
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=625 references=13952 distinctPaths=238 missingPaths=71 baseline=77 new=0 stale=6
  STALE-BASELINE: 6 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/causal-rotation-adversarial.spec.mjs
      tests/causal-rotation-brief.spec.mjs
      tests/causal-rotation-consumers.spec.mjs
      tests/causal-rotation-delivery.spec.mjs
      tests/causal-rotation-pages.spec.mjs
      tests/causal-rotation-registry.spec.mjs
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
validate_exit=0
```

`new=0`, which is the row's claim. The six stale entries name
`tests/causal-rotation-*` and belong to another feature's baseline;
`scripts/validate-spec-test-paths.baseline` is an excluded path for this scope and
was not edited to clear them.

### TP-05-29

```text
$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":118,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
build_exit=0
```

`tax-rules/` is absent from the emitted `directories` list, so it remains outside
the public directories. `site-exclusions.json` was not edited by this session and
still carries exactly one `lifetime-tax-strategy-lab.html` decision, asserted by
TP-05-REGISTRATION.

## Intended-RED Mutation Probes

Method, as in scope 04. A row's intended RED is produced by planting one
value-free defect in the surface the row asserts against, running the row's own
command, reverting explicitly inside the same shell invocation, and running the
same command again. Every mutation below is a path literal, so a slipped revert
could disclose no household value.

### Probe 5-A — a spec-referenced test path pointed at a file that does not exist

TP-05-28's command is `node scripts/validate-spec-test-paths.mjs`. The scope's
single clean `tests/….mjs` reference token, at `scope.md:388`, was renamed to a
sibling that does not exist.

```
$ node scripts/validate-spec-test-paths.mjs
GUARD_ON_LINE_388=1
      ... and 1 further reference site(s)
[spec-test-paths] FAIL — 2 new referenced path(s) do not exist
GREEN_EXIT=1
POST_MUTATION_SITES=1
      referenced at specs/027-company-scoped-owner-deep-links/design.md:648
      referenced at specs/027-company-scoped-owner-deep-links/design.md:660
      referenced at specs/027-company-scoped-owner-deep-links/design.md:661
      ... and 1 further reference site(s)
[spec-test-paths] FAIL — 3 new referenced path(s) do not exist
RED_EXIT=1
$ git checkout -- <scope.md>
DIRTY_AFTER_REVERT=0 MUTATION_LEFT=0
      ... and 1 further reference site(s)
[spec-test-paths] FAIL — 2 new referenced path(s) do not exist
GREEN2_EXIT=1
```

**The mutation is shown to be detected — the count moves 2 → 3 → 2 — but this is
NOT a satisfied row, and it is recorded as unsatisfied.** The row's claim is
`new=0`. The command currently reports `FAIL — 2 new referenced path(s) do not
exist` on the UNMUTATED tree, so its GREEN does not presently exist to be paired
with the RED. A demonstrated sensitivity without a GREEN does not meet this
scope's own evidence bar, and TP-05-28 therefore remains outstanding.

**Whose failure the two paths are — corrected after the fact.** This section
first recorded that both new paths belonged to a concurrent session's
`specs/027-company-scoped-owner-deep-links/design.md`. That was wrong, and the
correction matters because it moved a failure from "not mine" to "half mine".
Only one of the two is spec 027's. The other was self-inflicted by this very
session: scope 04's Probe 16 write-up quoted its planted `tests/….mjs` filename
verbatim, and the guard scans committed spec artifacts for exactly that token, so
the evidence block became a live reference to a file that does not exist. It has
since been elided to a placeholder in that report, which removes this session's
contribution to the count. The remaining new path is spec 027's and is not this
feature's to resolve. The earlier TP-05-28 record above captured `new=0` before
either reference existed; it is not withdrawn, but the honest present state is
the failing one shown here, and TP-05-28 is owed a re-run once spec 027 resolves
its own references.


### Probe 5-B — an excluded configuration dropped from the Pages exclusion list, which the gate did not detect

TP-05-29's command is `node scripts/build-pages-site.mjs --dry-run`. The
`lifetime-tax-strategy.config.json` entry — the exclusion that keeps this
feature's configuration out of the public site — was deleted from
`site-exclusions.json`.

```
$ node scripts/build-pages-site.mjs --dry-run
PRE_SHA=f3c437749395f2549166ded7a55942aa611670bb4d8262bc2e7e57efa79e1260
GUARD_MATCHES=1
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,…}
GREEN_EXIT=0
POST_MUTATION_ENTRY_LEFT=0 STILL_VALID_JSON=yes
RED_EXIT=0
$ cp <snapshot> site-exclusions.json
POST_SHA=f3c437749395f2549166ded7a55942aa611670bb4d8262bc2e7e57efa79e1260
BYTES_ROUND_TRIPPED=yes
GREEN2_EXIT=0
```

**No RED. Recorded as a miss, and as a finding.** Removing the configuration's
exclusion entry did not make the gate refuse. Scope 04's Probe 17 shows the same
gate DOES refuse when the corresponding `.html` route entry is removed, so the
refusal is specific to unregistered root HTML and does not extend to a non-HTML
asset that an exclusion entry names. The practical consequence is that the Pages
gate would not by itself stop this feature's configuration document from being
published; only the HTML entry is load-bearing.

This is not a defect introduced here and it is not silently repaired — changing
the gate's refusal surface is outside this scope's allowed paths, and
`site-exclusions.json` was restored byte-for-byte, verified by SHA-256. It is
recorded so the next session inherits the observation rather than rediscovering
it. TP-05-29 remains without an intended RED.

### Artifact lint

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/024-social-security-and-medicare
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes/_index.md
✅ Per-scope layout contains 5 scope file(s)
✅ Every per-scope directory has a report.md file
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes/05-route-and-integration/scope.md
✅ All DoD bullet items use checkbox syntax in scopes/05-route-and-integration/scope.md
✅ All checked DoD items in scopes/05-route-and-integration/scope.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes/05-route-and-integration/scope.md
✅ No unfilled evidence template placeholders in scopes/05-route-and-integration/report.md
Artifact lint PASSED.
artifact_lint_exit=0
```

Trimmed to the scope-5 lines and the verdict; the run emitted the same shape for
every one of the five scopes and printed no failure.

### Repository state

```text
$ git status --short
 M scripts/selftest.mjs
 M site-exclusions.json
?? company-intelligence-lab.html
?? company-intelligence.config.json
?? lifetime-tax-strategy-lab.html
?? lifetime-tax-strategy.config.json
?? notes/company-intelligence-lab.md
?? notes/lifetime-tax-strategy-lab.md
?? rlcompanyintel.js
?? rltax.js
?? rltaxclaimage.js
?? rltaxcombined.js
?? rltaxdisposition.js
?? rltaxinclusion.js
?? rltaxmedicare.js
?? rltaxproperty.js
?? rltaxrental.js
?? rltaxrules.js
?? rltaxsocialsecurity.js
?? rltaxstate.js
?? rltaxstrategy.js
?? rltaxuse.js
?? rltaxworkspace.js
?? specs/021-lifetime-tax-strategy-lab/
?? specs/022-federal-preferential-and-state-income-tax/
?? specs/023-property-tax-and-rental-income/
?? specs/024-social-security-and-medicare/
?? specs/025-company-multi-horizon-intelligence-lab/
?? tax-rules/
?? tests/company-intelligence-lab.spec.mjs
?? tests/company-intelligence.unit.mjs
?? tests/lifetime-tax-benefit.spec.mjs
?? tests/lifetime-tax-claim-age.spec.mjs
?? tests/lifetime-tax-conversion.spec.mjs
?? tests/lifetime-tax-deduction.spec.mjs
?? tests/lifetime-tax-disposition.spec.mjs
?? tests/lifetime-tax-federal.spec.mjs
?? tests/lifetime-tax-foundation.spec.mjs
?? tests/lifetime-tax-inclusion.spec.mjs
?? tests/lifetime-tax-marginal.spec.mjs
?? tests/lifetime-tax-medicare.spec.mjs
?? tests/lifetime-tax-property.spec.mjs
?? tests/lifetime-tax-rental.spec.mjs
?? tests/lifetime-tax-retirement-route.spec.mjs
?? tests/lifetime-tax-route.spec.mjs
?? tests/lifetime-tax-use.spec.mjs
?? tests/lifetime-tax.support.mjs
```

The untracked state of the whole lifetime-tax tree is why the excluded-path
byte-identity row stays unchecked. The `specs/025-*`, `company-intelligence*` and
`tests/company-intelligence*` entries belong to a concurrent session; they were
neither modified nor edited here.

## Harness Pass — Three Rows Closed, One Miss Found And One Assertion Strengthened

Every probe below ran through `scripts/red-green-probe.sh`, which arms its revert
before mutating and proves the revert by comparing the working blob hash against
the committed one. The blocks are the harness's own output, pasted unedited.

### `TP-05-28` — path guard, and the missing GREEN is now present

The earlier probe 5-A drove this command red but could not pair it with a GREEN,
because the command then failed on the unmutated tree over a concurrent session's
unresolvable references. Those have since been reconciled: the command now reports
`new=0` unmutated, so the row has both halves.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-28 path guard: a spec-referenced path that does not resolve to a file must be reported as newly missing
file:             scripts/validate-spec-test-paths.mjs
mutation:         statSync(resolve(root, path)).isFile()  ->  statSync(resolve(root, path)).isDirectory()   (1 occurrence(s))
command:          node scripts/validate-spec-test-paths.mjs
red-exit:         1
red-summary:      [spec-test-paths] FAIL — 183 new referenced path(s) do not exist
green-exit:       0
green-summary:    [spec-test-paths] OK — no new missing test path(s)
revert-verified:  yes (committed=bb6eee2b6ac1a1ea53d61f01463eeace6c70e630 restored=bb6eee2b6ac1a1ea53d61f01463eeace6c70e630)
discriminating:   yes (red-exit 1 != green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### `TP-05-29` — deploy gate, and why probe 5-B missed

Probe 5-B removed this feature's **configuration** entry from the exclusion list
and the gate did not refuse. That result is correct and the diagnosis is now
available: the deploy gate's unaccounted-page check covers root `.html` pages
only, so removing a non-page artifact's exclusion leaves nothing for it to catch.
The decision that the gate does enforce belongs to the route page. Moving that
entry to a different existing file leaves the list valid and non-stale while
leaving the route with no deploy decision at all, and the gate refuses by name.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-29 deploy gate: the route this feature extends losing its deploy decision must refuse the Pages plan
file:             site-exclusions.json
mutation:         "path": "lifetime-tax-strategy-lab.html",  ->  "path": "index.html",   (1 occurrence(s))
command:          node scripts/build-pages-site.mjs --dry-run
red-exit:         1
red-summary:      Error: unregistered root page lacks a deploy decision: lifetime-tax-strategy-lab.html
green-exit:       0
green-summary:    {"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":128,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","
revert-verified:  yes (committed=29c6fe08a58d97c1f119abdd38706cf02f675d60 restored=29c6fe08a58d97c1f119abdd38706cf02f675d60)
discriminating:   yes (red-exit 1 != green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### `TP-05-20` — the Medicare cost separation

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-20 SCN-024-013: dropping the not-part-of-the-total qualifier from the Medicare cost label must fail the cost-separation scenario
file:             lifetime-tax-strategy-lab.html
mutation:         "Annual Medicare cost, which is not part of the federal tax total"  ->  "Annual Medicare cost"   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-024-013\ the\ annual\ Medicare\ cost\ renders\ beside\ the\ headline\ and\ is\ labelled\ not\ part\ of\ the\ federal\ tax\ total --reporter=list
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (6.9s)
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (red-exit 1 != green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### `TP-05-19` — a miss, an additive strengthening, and a still-open row

The row's own title says the headline shows **the total**. The probe replaced the
headline's source with a single leg — the exact defect the surrounding code
comment calls "the one direction this tool must never err in" — and the scenario
passed anyway:

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-19 SCN-024-013: a headline reading a single leg instead of the federal total must fail the leg-census scenario
file:             lifetime-tax-strategy-lab.html
mutation:         var total = envelope.settlement.totalFederalTax;  ->  var total = envelope.settlement.ordinaryTax;   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-024-013\ every\ declared\ leg\ reaches\ the\ headline\,\ the\ comparison\,\ the\ curve\ and\ the\ export\ and\ the\ headline\ shows\ the\ total --reporter=list
red-exit:         0
red-summary:        1 passed (4.7s)
green-exit:       0
green-summary:      1 passed (5.6s)
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   NO (red-exit 0 == green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome (both exited 0).
```

Every clause of the scenario reads a **label** or a **leg set**: that the
`headlineFederalTax` field is visible, that no single-leg identifier is drawn as a
Simple value, and that the headline's declared leg list has more than one member.
A headline that keeps the label and the leg list while drawing one leg's amount
satisfies all three. The figure itself was never read.

**Strengthened, additively.** The scenario now also reads the rendered headline
figure and compares it against the sum of the amounts the comparison table
republishes for exactly the legs the headline says it summed. Nothing was
weakened, skipped or removed, no timeout was raised, and the scenario passes on
the unmutated tree:

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-013 every declared leg reaches the headline, the comparison, the curve and the export and the headline shows the total" --reporter=list
exit=0
  ✓  1 [system-chrome] › <repo>/tests/lifetime-tax-retirement-route … the headline shows the total (1.4s)
  1 passed (3.7s)
```

**And it still does not discriminate.** Re-running the identical probe against the
strengthened assertion:

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-19 SCN-024-013: a headline reading a single leg instead of the federal total must fail the leg-census scenario (re-run against the strengthened assertion)
file:             lifetime-tax-strategy-lab.html
mutation:         var total = envelope.settlement.totalFederalTax;  ->  var total = envelope.settlement.ordinaryTax;   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-024-013\ every\ declared\ leg\ reaches\ the\ headline\,\ the\ comparison\,\ the\ curve\ and\ the\ export\ and\ the\ headline\ shows\ the\ total --reporter=list
red-exit:         0
red-summary:        1 passed (4.1s)
green-exit:       0
green-summary:      1 passed (2.9s)
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   NO (red-exit 0 == green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The remaining obstacle is the **fixture**, not the assertion. `TP-05-01` requires
the unit-level complete-settlement fixture to make every declared leg non-zero and
mutually distinct precisely so a census over it cannot pass by coincidence. The
browser household this scenario declares carries no such guarantee: if every leg
other than the ordinary one settles to zero, the sum of the named legs equals the
ordinary leg, and substituting one for the other is not observable from the page
at all. The strengthening is kept because it closes the label-only gap and is a
real improvement; the row is **left open** rather than ticked on a probe that did
not discriminate.

**What would make it decidable:** a browser fixture for `SCN-024-013` whose
preferential, net-investment-income and additional-Medicare legs are each non-zero
and mutually distinct, mirroring the guarantee `TP-05-01` already imposes on the
unit fixture. Authoring that household is a change to the scenario's declared
inputs and belongs to `bubbles.plan`, not to a test pass; it is recorded here as
the blocking condition rather than worked around.

### Effect on the DoD row

The row requires an observed intended RED on **every** one of `TP-05-01` through
`TP-05-29`. Three more rows now have one — `TP-05-20`, `TP-05-28` and `TP-05-29`,
the last two correcting probes previously recorded as a missing GREEN and a miss.
`TP-05-19` was probed and did not discriminate, and the reason is a fixture the
scenario declares rather than an assertion this pass may repair. The row therefore
stays unticked. Still owed an observed intended RED: `TP-05-01` through
`TP-05-03`, `TP-05-05` through `TP-05-07`, `TP-05-10` through `TP-05-19`, and
`TP-05-21` through `TP-05-27`.

## Closing Pass — An Aimed Intended RED For Every Remaining Row

Every probe below runs through `scripts/red-green-probe.sh`, which arms its revert
before mutating and proves the revert by comparing the working blob hash against
the committed one. Each mutation is aimed at the behaviour **its own row names**;
where a mutation also reddens a neighbouring row, that is recorded rather than
claimed.

**How to read the unit blocks.** The command is `node scripts/selftest.mjs`, which
exits non-zero if any assertion in the whole repository suite fails, so `green-exit
0` is itself the statement that the suite is fully green — the recorded
`3172 passed, 0 failed` line. Each block's `--summary-match` is set to the row's
own assertion label, so `red-summary` names the assertion that fired rather than
the run's last line; `green-summary` has no such line to match and therefore falls
back to the run's last non-blank line, which is the suite's closing separator.

### `TP-05-01` — fixture integrity

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-01 fixture integrity: a premium the pack stops declaring as a cost must break the complete-settlement fixture, because a census over a fixture that counts a cost as tax can pass by coincidence
file:             tax-rules/medicare/2026.json
mutation:         "figureRef": "standardPremiums.part-b",
        "includedInTotal": false  ->  "figureRef": "standardPremiums.part-b",
        "includedInTotal": true   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-01: the complete-settlement fixture carries every leg the federal pack, the benefit pack, the inclusion policy, the medicare policy, the disposition module and the engine declare, ev
green-exit:       0
green-summary:    ================================================
revert-verified:  yes (committed=576c5438a6a9af67059f232ed2d2432ed1046883 restored=576c5438a6a9af67059f232ed2d2432ed1046883)
discriminating:   yes (red-exit 1 != green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The same mutation run with `--summary-match 'self-test:'` reports the suite-level
effect, which is what makes the aim visible as a bounded one rather than a
whole-suite break: `red-summary: Research-Lab self-test: 3165 passed, 7 failed`
against `green-summary: Research-Lab self-test: 3172 passed, 0 failed`.

### `TP-05-02` — leg census, both directions

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-02 leg census: a census that silently stops recording the curve as one of the four surfaces it compared must fail the both-directions surface identity
file:             rltax.js
mutation:         surfaces.push(surfaceName);  ->  if (surfaceName !== "curve") surfaces.push(surfaceName);   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-02: over the complete fixture the record’s declared leg set equals the leg set of the headline, the comparison, the curve contributors and the export in both directions, across all
green-exit:       0
green-summary:    ================================================
revert-verified:  yes (committed=3206e1516e43338b5cfe79103fd989670a0cc269 restored=3206e1516e43338b5cfe79103fd989670a0cc269)
discriminating:   yes (red-exit 1 != green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The mutation drops the curve from the surface record while leaving every finding
intact, so the census still reports `clean`. That is precisely the defect this row
exists to catch: a surface silently stops being censused and nothing else changes.

### `TP-05-03` — adversarial, the drop direction

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-03 adversarial: a census that stops noticing a declared leg missing from a surface must fail the per-leg per-surface drop probe
file:             rltax.js
mutation:         if (rendered.indexOf(declaredIds[index]) < 0) {  ->  if (rendered.indexOf(declaredIds[index]) < -1) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-03: removing each declared leg from each of the four surfaces in turn produces exactly one missing-leg finding naming both the leg and the surface, and rendering a leg the record doe
green-exit:       0
green-summary:    ================================================
revert-verified:  yes (committed=3206e1516e43338b5cfe79103fd989670a0cc269 restored=3206e1516e43338b5cfe79103fd989670a0cc269)
discriminating:   yes (red-exit 1 != green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

`indexOf` never returns a value below `-1`, so the guard becomes unreachable and no
missing-leg finding is ever raised. `TP-05-04` also reddens under this mutation,
which is expected — it asserts on the same missing-leg report — and it already
carries its own aimed RED.

### `TP-05-05` — headline source

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-05 headline source: sourcing the Simple headline from the ordinary leg instead of the total is the Feature 022 understatement defect and must fail
file:             lifetime-tax-strategy-lab.html
mutation:         var total = envelope.settlement.totalFederalTax;  ->  var total = envelope.settlement.ordinaryTax;   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-05: the Simple renderer reads settlement.totalFederalTax and reads none of the four single leg members anywhere in its code, the comment naming the forbidden leg is proven to be pros
green-exit:       0
green-summary:    ================================================
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (red-exit 1 != green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

This is the identical substitution that `TP-05-19` could not detect in the browser.
The unit row detects it, which is what makes the browser row's miss a fixture
question rather than a claim that nothing observes the defect at all.

### `TP-05-06` — adversarial, one per leg

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-06 adversarial: a renderer that keeps the total but also reads a single leg — here the net investment income surtax — must be caught one per leg
file:             lifetime-tax-strategy-lab.html
mutation:         var total = envelope.settlement.totalFederalTax;  ->  var total = envelope.settlement.totalFederalTax; var probeSurtaxRead = envelope.settlement.netInvestmentIncomeTax;   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-06: a renderer reading ordinaryTax, preferentialTax, netInvestmentIncomeTax or additionalMedicareTax in place of the total is caught one per leg, and the unmutated renderer passes th
green-exit:       0
green-summary:    ================================================
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (red-exit 1 != green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Deliberately a different defect shape from `TP-05-05`: the headline still reads the
total, so the substitution detector's subject is untouched and what fails is the
clause proving the detector is not detecting itself — a renderer that reads a
single leg **in addition to** the total.
