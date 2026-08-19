# Scope 4 Execution Report — California Pack

This file is the evidence surface for scope 4. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

**Session of 2026-08-19 — four Definition of Done items closed, two left open.**

Closed: the `BI-7` calculation-order item, FR-022-027 absence discipline,
FR-022-022 preferential conformity, and FR-022-025 with FR-022-026 surcharge
identity. Left open: the `BI-6` retrieval item and the FR-022-023 with FR-022-024
deduction-and-credit item, each with its reason recorded against the item in
[scope.md](scope.md) and its evidence at [`#sourcing`](#sourcing).

The California pack ships with sixteen `AbsentFigure/v1` records and renders no
California dollar figure at all. That is this scope's intended outcome, not a
defect. The rate schedule for the declared year is recomputed annually by the
Franchise Tax Board under Revenue and Taxation Code section 17041 subdivision
(h), and the recomputed schedule was not retrieved, so the pack refuses rather
than indexing a statutory base or borrowing a federal shape.

Four value-free probes were applied and reverted inside the shell invocation that
applied them. Three landed on the pack and one on the state module. Every one was
guarded before and after the substitution, and every one left
`git status --short` on its target empty.

No module was modified. One assertion was appended to `scripts/selftest.mjs`; the
pass count rose from 3100 to 3101 and no existing assertion was edited.

## Sourcing

Holds, for `BI-6` and `BI-7`, one entry per figure: the authority title, the URL,
the retrieval timestamp recorded in the `SourceRecord/v1`, the locator, and the
verbatim outcome of the retrieval attempt. `BI-7` is recorded first, because an
unestablished calculation order refuses the whole pack and makes every figure
moot.

Five Franchise Tax Board URLs failed at specification time. Every one of those
figures must be retrieved here or ship absent. A figure recalled, derived from
another figure, or read off a secondary aggregator is a specification violation,
not a shortcut. Each failed retrieval is recorded with the same detail as a
successful one, together with the `AbsentFigure/v1` it produced and the leg that
now refuses.

### BI-7 — the calculation order, retrieved

**Claim Source:** executed. Three primary statutory authorities were opened in
this session and their operative text read back against the shipped pack member
by member. Each is the same authority the pack already cites, so this retrieval
re-establishes `BI-7` rather than resting on a record another session wrote.

| Authority | URL | `retrievedAt` in pack | What it establishes |
| --- | --- | --- | --- |
| California Revenue and Taxation Code section 17041, imposition of tax | `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=RTC&sectionNum=17041.` | `2026-08-17T20:52:00.000Z` | Subdivision (a)(1) imposes the tax on taxable income through a rate schedule, and subdivision (h) directs the Franchise Tax Board to recompute the brackets annually, which is why the printed subdivision (a)(1) dollar amounts are a pre-indexing base and not the declared year's schedule |
| California Revenue and Taxation Code section 17039, allowance of credits | `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=RTC&sectionNum=17039.` | `2026-08-17T20:52:00.000Z` | Subdivision (a) defines net tax as the tax imposed under section 17041 **less** the credits allowed by section 17054, placing the personal exemption credit after rate application and against tax rather than against income |
| California Revenue and Taxation Code section 17043, additional tax | `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=RTC&sectionNum=17043` | `2026-08-17T20:52:00.000Z` | Subdivision (a) imposes the additional tax; subdivision (c)(1) excludes section 17039, and (c)(2) and (c)(3) exclude filing-status recomputation and joint-return treatment |

Transcribed digit by digit from section 17043 subdivision (a): *"an additional
tax shall be imposed at the rate of 1 percent on that portion of a taxpayer's
taxable income in excess of one million dollars ($1,000,000)"*. The shipped
`ThresholdSet/v1` carries `rate: 0.01` and `thresholds.all: 1000000`. Subdivision
(c)(2) and (c)(3) exclude both the filing-status recomputation of section 17041
and the joint-return treatment of section 17045, which is the authority for
`varyByFilingStatus: false` and for the single `all` threshold key. Subdivision
(c)(1) excludes section 17039, which is the authority for keeping the surcharge
leg out of the credit's `appliesToLegs[]`. Nothing in this row is derived from a
federal figure, interpolated, or recalled.

**Order established, so the pack ships rather than refusing in full.** The
disjunctive branch of the Definition of Done item — a pack refusing in full — is
therefore not the branch taken and is not claimed.

### BI-6 — not closed

**Claim Source:** executed, outcome negative for two of the three figure groups.

`https://www.ftb.ca.gov/forms/2025-California-Tax-Rates-and-Exemptions.html`
returned HTTP 404 in this session.
`https://www.ftb.ca.gov/file/personal/tax-calculator-tables-rates.html` returned
HTTP 404 in this session. The Franchise Tax Board forms index at
`https://www.ftb.ca.gov/forms/` was reachable, and from it the 2026 Instructions
for Form 540-ES at
`https://www.ftb.ca.gov/forms/2026/2026-540-es-instructions.html` were retrieved
in full.

That publication states the standard deduction for the declared tax year and
states it verbatim as *"$5,706 single or married/RDP filing separately"* and
*"$11,412 married/RDP filing jointly, head of household, or qualifying surviving
spouse/RDP"*. It does **not** state the declared year's rate schedule — its
worksheet line 4 directs the reader to *"Figure your tax on the amount on line 3
using the 2025 tax table"* — and it does **not** state the exemption credit
amount — its worksheet line 6a directs the reader to *"Enter the exemption credit
amount from the 2025 instructions for Form 540"*.

`BI-6` covers the rate schedule bands, the standard deduction and the exemption
credit amounts together. Two of those three were not retrieved in this session,
so `BI-6` is **not closed** and its Definition of Done item stays open. The pack
was deliberately left unmodified: banking the one retrieved figure while the
other two stay absent would move the pack without closing the item, and the
retrieved deduction is recorded here so the next session can transcribe it into
the pack alongside the other two rather than re-retrieving it.

## Test Evidence

### TP-04-01

Scenario SCN-022-010 — the California pack validates through the unmodified Scope
03 contract, declares no preferential treatment, carries no preferential table,
and its ordered array matches the engine's derived array element for element.
Command: `node scripts/selftest.mjs`

### TP-04-02

Scenario SCN-022-010 — state tax is exact below, at and above every California
bracket edge the pack carries, for every filing status whose schedule resolved.
Command: `node scripts/selftest.mjs`

### TP-04-03

Scenario SCN-022-010 — a long-term gain and an equal amount of ordinary income
produce an identical California figure while the federal figures differ.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**What the assertion pins.** Two single California households are settled: one
holding ordinary income plus a long-term capital gain, the other holding the same
total entirely as ordinary income. The assertion pins six things at once, so that
no single accident can satisfy it. Both households pool the same supported-income
measure; neither state settlement publishes a preferential taxable-income measure
at all; the two California outcomes are byte-identical; the pack carries no
preferential rate table for any status; the same two households receive
**different** federal totals; and the federal divergence is traced to its cause —
the federal settlement carves the gain into a preferential measure and prices it
in a preferential band, while the ordinary-only household's preferential measure
and preferential tax are both zero.

The last clause is what keeps the row honest. California's identity today is an
identity of refusal, because the declared year's rate schedule was never
retrieved. An assertion that stopped at "both California outcomes match" would
pass on a pack that carved the gain out and then refused for an unrelated reason.
Pinning the pooled measure and the absent preferential member, and pinning the
federal side as a live numeric contrast, is what makes the row sensitive to the
behaviour it names rather than to the refusal.

**Intended RED.** The long-term-gain term was dropped from the state module's
local pooling sum, leaving it to add ordinary income and qualified dividends
only. The substitution removes one term of a local sum and carries no household
member and no tax figure. A pre-run guard counted one occurrence of the full sum
before the change, zero after it, and exactly one occurrence of the shortened sum
after it, so the substitution is proven to have landed on the intended text.

Two assertions fell. TP-04-03 is the named row for this item. Scope 03's TP-03-13
fell with it, which is the correct blast radius: it pins the same pooling
behaviour against the Florida-side fixture pack, so a change to the shared
pooling sum must drop both or the two rows would not be testing what they claim.

```
# TP-04-03 RED: the long-term-gain term dropped from the state pooling sum
$ node scripts/selftest.mjs
exit: 1
lines: 3504
sha256: 8a3be2631b37dcc3168bf1d3c89aef73fe440b7a510687f6078068808f71ecd6
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-03-13: a pack declaring preferentialPolicy none prices an equal amount of gain and ordinary income identically, carries no preferential rate table, and publishes no preferential taxable amount
  ✗ FAIL: TP-04-03: a California household holding a long-term gain and one holding the same amount as ordinary income pool that income into one supported-income measure, carry no preferential taxable-income measure at all and receive the identical California outcome, while the identical two househo
--- omitted 3498 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3099 passed, 2 failed
================================================
```

Reverted with `git checkout --` inside the same shell invocation that applied the
probe, before any other command ran; `git status --short rltaxstate.js` printed
nothing, so the module is byte-identical to its Scope 03 state.

**GREEN, same command.**

```
# TP-04-03 GREEN: same command, the long-term-gain term restored to the state pooling sum
$ node scripts/selftest.mjs
exit: 0
lines: 3504
sha256: 0deedbf996b2aec395cc5e276f2e625b4df84dd0d38256084209635471b863b6
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- omitted 3498 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3101 passed, 0 failed
================================================
```

The pre-existing pass count rose from 3100 to 3101 and no existing assertion was
edited: this row is the one appended assertion this session added.

### TP-04-04

Scenario SCN-022-011 — the California standard deduction resolves per filing
status from its own authority and is never derived from the federal deduction.
Command: `node scripts/selftest.mjs`

### TP-04-05

Scenario SCN-022-011 — the exemption credit is subtracted from the computed tax
after rate application, with the pre-credit and post-credit figures both
published.
Command: `node scripts/selftest.mjs`

### TP-04-06

Scenario SCN-022-011 — an implementation that subtracts the exemption credit from
income is proven to fail the application-point assertion.
Command: `node scripts/selftest.mjs`

### TP-04-07

Scenario SCN-022-012 — the surcharge is exact below, at and above the threshold,
and all four filing statuses cross at the identical value.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED.** The surcharge threshold set's `varyByFilingStatus` member was
flipped from the `false` literal to the `true` literal. The substitution is a
boolean literal and carries no household member and no tax figure. A pre-run
guard counted one `false` literal on that member before the change and zero after
it, so the substitution is proven to have landed on the intended text rather than
on the relief mechanism's own `varyByFilingStatus`, which is `true` in the
shipped pack.

Five assertions fell. TP-04-07 is the named row for this item. The second
TP-04-11 assertion fell with it, which is the demonstration that the refusing
total beside a still-resolving surcharge leg is load-bearing rather than
incidental. TP-04-01, TP-04-09 and TP-04-10 fell for the digest reason recorded
under TP-04-12.

```
# TP-04-07 RED: the surcharge set declares itself to vary by filing status
$ node scripts/selftest.mjs
exit: 1
lines: 3503
sha256: 84fa18d3eac3f404bf315e278eb97d47628a568c79a7324c516e269598a99c4e
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-04-01: the California pack validates through the unmodified Scope 03 contract, matches its own content digest, declares preferentialPolicy none, carries no preferential rate table and matches the engine-derived ordered array element for element
  ✗ FAIL: TP-04-11: the California total refuses because its ordinary schedule was not retrieved, carries no numeric member, and the surcharge leg still resolves beside it
  ✗ FAIL: TP-04-07: the surcharge is exact immediately below, exactly at and immediately above its declared threshold, all four filing statuses cross at the identical value, and the set declares itself applicable to the declared tax year
  ✗ FAIL: TP-04-09: the shipped pack names only the ordinary leg in its applied-legs list, the surcharge leg is declared and deliberately absent from it, and a mechanism naming a leg the pack does not declare is refused
  ✗ FAIL: TP-04-10: a pack that declares no preferential treatment while carrying a preferential rate table is refused, and the shipped pack is not
--- omitted 3497 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3095 passed, 5 failed
================================================
```

Reverted with `git checkout --` inside the same shell invocation that applied the
probe, before any other command ran; `git status --short tax-rules/state/CA/2026.json`
printed nothing.

**GREEN, same command.**

```
# TP-04-07 GREEN: same command, the surcharge set restored to a single threshold for every filing status
$ node scripts/selftest.mjs
exit: 0
lines: 3503
sha256: cc0a8f27a82f1921bc1b864c8c038d9d067691f2c674b919a4516a661bb98eaf
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- omitted 3497 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3100 passed, 0 failed
================================================
```

### TP-04-08 and TP-04-09 — the two in-test adversarial mutations

**Claim Source:** executed, under the same `node scripts/selftest.mjs` runs
recorded above.

Both rows carry their adversarial mutation inside the assertion rather than as a
source probe, which is what the Definition of Done asks for. TP-04-08 clones the
shipped pack, sets `varyByFilingStatus` to true and doubles the joint threshold,
and proves that two households with the identical taxable income then receive
different surcharges — a positive figure for the single household and zero for
the joint one — while the shipped pack gives them the same figure. TP-04-09
clones the pack twice: once naming both legs in `appliesToLegs[]`, once naming a
leg the pack does not declare, and proves the shipped pack names the ordinary leg
alone while the surcharge leg is declared and deliberately excluded. TP-04-09
also fell by name under both source probes recorded above.

### TP-04-08

Scenario SCN-022-012 — a pack that doubles the surcharge threshold for a joint
return is proven to fail the identical-threshold assertion.
Command: `node scripts/selftest.mjs`

### TP-04-09

Scenario SCN-022-012 — an implementation that applies the exemption credit to the
surcharge leg is proven to fail the `appliesToLegs[]` assertion.
Command: `node scripts/selftest.mjs`

### TP-04-10

Scenario SCN-022-010 — a pack that declares no preferential treatment while
carrying a preferential table is proven to be refused.
Command: `node scripts/selftest.mjs`

### TP-04-11

Scenario SCN-022-012 — every unretrieved California figure is an
`AbsentFigure/v1` with a `missingSource` pointer and no smuggled numeric member,
and its leg refuses while sibling legs still resolve.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED.** The `missingSource.locator` prose on the single
standard-deduction absent figure was emptied. The substitution deletes a
descriptive sentence and carries no household member and no tax figure. A pre-run
guard counted one occurrence of the anchor prose before the change, zero after
it, and exactly one empty `locator` member after it, so the substitution is
proven to have landed on the intended text.

The row under test fell by name. TP-04-01, TP-04-09 and TP-04-10 fell with it for
the structural reason recorded under TP-04-12: `contentSha256` digests every pack
member, and the two adversarial rows re-validate mutated clones of the shipped
pack.

The probe exercises the pointer clause of this row — that an absent figure must
carry a resolvable `missingSource` rather than a bare refusal code. The second
assertion carrying the same TP-04-11 label, which pins the refusing total against
the still-resolving surcharge leg, did not fall under this probe. It fell by name
under the separate probe recorded at TP-04-07 below, so both halves of this row
are demonstrated load-bearing rather than one half assumed from the other.

```
# TP-04-11 RED: one missingSource locator emptied on the single standard-deduction absent figure
$ node scripts/selftest.mjs
exit: 1
lines: 3503
sha256: 9e86615abb544939f461c9261483181b1207762aec1a49aaaeeb8a9d57ac9437
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-04-01: the California pack validates through the unmodified Scope 03 contract, matches its own content digest, declares preferentialPolicy none, carries no preferential rate table and matches the engine-derived ordered array element for element
  ✗ FAIL: TP-04-11: every California figure that was not retrieved ships as an AbsentFigure with a missingSource pointer, a named remediation and no smuggled numeric member
  ✗ FAIL: TP-04-09: the shipped pack names only the ordinary leg in its applied-legs list, the surcharge leg is declared and deliberately absent from it, and a mechanism naming a leg the pack does not declare is refused
  ✗ FAIL: TP-04-10: a pack that declares no preferential treatment while carrying a preferential rate table is refused, and the shipped pack is not
--- omitted 3497 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3096 passed, 4 failed
================================================
```

Reverted with `git checkout --` inside the same shell invocation that applied the
probe, before any other command ran; `git status --short tax-rules/state/CA/2026.json`
printed nothing.

**GREEN, same command.**

```
# TP-04-11 GREEN: same command, the missingSource locator restored
$ node scripts/selftest.mjs
exit: 0
lines: 3503
sha256: 1a5ea2ce51682939e25eb8dbb7f2cd3814006cae270b444c1f16745496ec5ef9
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- omitted 3497 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3100 passed, 0 failed
================================================
```

### TP-04-12

Scenario SCN-022-012 — a pack whose calculation order cannot be established is
refused in full and produces no partial California figure.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED.** The three `retrievalOutcome` members of the pack's source
records were flipped from the `retrieved` literal to the `attempted` literal. The
substitution is a status literal and carries no household member and no tax
figure. A pre-run guard counted three `retrieved` literals before the change and
three `attempted` literals after it, so the substitution is proven to have landed
on the intended text rather than somewhere else.

Four assertions fell rather than one, and that is itself the shape of the pack
contract: `contentSha256` is a digest over every pack member except itself, so
any probe against any member necessarily drops the digest row (TP-04-01) with the
row under test. TP-04-09 and TP-04-10 fell for the same reason — both re-validate
a mutated clone of the shipped pack against `validateRulePack`, which refuses a
pack whose source records no longer support its citations. The named row for this
item, TP-04-12, is in the list.

```
# TP-04-12 RED: the three order authorities recorded as attempted rather than retrieved
$ node scripts/selftest.mjs
exit: 1
lines: 3503
sha256: 52a41092b680da1e66d21ab3c77fd67dd9723f36ec2b97058a6df712fb716bd5
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-04-01: the California pack validates through the unmodified Scope 03 contract, matches its own content digest, declares preferentialPolicy none, carries no preferential rate table and matches the engine-derived ordered array element for element
  ✗ FAIL: TP-04-12: the three authorities that establish the calculation order were each retrieved, so the pack ships rather than refusing in full, and a pack whose declared order does not match the engine-derived order is refused
  ✗ FAIL: TP-04-09: the shipped pack names only the ordinary leg in its applied-legs list, the surcharge leg is declared and deliberately absent from it, and a mechanism naming a leg the pack does not declare is refused
  ✗ FAIL: TP-04-10: a pack that declares no preferential treatment while carrying a preferential rate table is refused, and the shipped pack is not
--- omitted 3497 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3096 passed, 4 failed
================================================
```

Reverted with `git checkout --` inside the same shell invocation that applied the
probe, before any other command ran; `git status --short tax-rules/state/CA/2026.json`
printed nothing.

**GREEN, same command.**

```
# TP-04-12 GREEN: same command, the retrieval outcomes restored
$ node scripts/selftest.mjs
exit: 0
lines: 3503
sha256: cdaefd1f7f746cc6ba82832e359923b35dfbdfa0c9df91d0e3bf8407a8b1a901
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- omitted 3497 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3100 passed, 0 failed
================================================
```

### TP-04-13

Scenario SCN-022-010 — every module file is byte-identical to its Scope 03 state,
proving California required no engine edit.
Command: `node scripts/selftest.mjs` plus a path-scoped status check

### TP-04-14

Scenario SCN-022-010 — `unsupportedFeatures[]` is non-empty and no result is
labelled a complete state tax.
Command: `node scripts/selftest.mjs`

### TP-04-15

Scenario SCN-022-010 — no module holds a California bracket, rate, deduction,
credit, threshold, state name or authority name, and the detector is proven to
fire on a module that does.
Command: `node scripts/selftest.mjs`

### Scenario SCN-022-010

`Regression: SCN-022-010 California taxes a long term gain in its ordinary schedule`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-010 California taxes a long term gain in its ordinary schedule" --reporter=list`

### Scenario SCN-022-011

`Regression: SCN-022-011 the exemption credit is applied after the rate and never to income`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-011 the exemption credit is applied after the rate and never to income" --reporter=list`

### Scenario SCN-022-012

`Regression: SCN-022-012 the surcharge threshold is identical for every filing status`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-012 the surcharge threshold is identical for every filing status" --reporter=list`

### TP-04-19

The cumulative Feature 021 and Feature 022 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list`

**Claim Source:** executed. This row is **not** closed by this run. The run is
recorded here as the no-new-failure check for the session of 2026-08-19, which
appended one unit assertion and changed no page, no module, no pack and no
browser spec. The row's own intended RED is still owed.

Sixty-nine tests ran, sixty-nine passed, none failed and none were skipped. The
non-zero exit comes from the known teardown fault in which workers are
force-killed after the run completes; Playwright reports it as
`errors were not a part of any test` and it is not a test failure.

The selector is the four-way alternation pinned to the owning spec numbers, not
the bare `SCN-02` prefix the planning template first carried, which would have
swept in scenarios owned by other features.

```
# cumulative browser suite for features 021-024 after the scope-04 session
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-02[1-4] --reporter=list
exit: 1
lines: 82
sha256: 7b912ecb838addc57a248282715fea9d16dd0e47e7cc902b01c4dd7d804d9416
--- first 6 ---

Running 69 tests using 6 workers

  ✓   2 [system-chrome] › tests/lifetime-tax-conversion.spec.mjs:35:1 › Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack (3.5s)
  ✓   6 [system-chrome] › tests/lifetime-tax-benefit.spec.mjs:65:1 › Regression: SCN-024-001 neither origin and both origins each refuse and neither shows a benefit amount (3.7s)
  ✓   3 [system-chrome] › tests/lifetime-tax-federal.spec.mjs:48:1 › Regression: SCN-021-004 federal tax is exact below at and above a bracket edge (4.0s)
--- omitted 70 line(s); sha256 above covers the full output ---
--- last 6 ---
Error: worker-2 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it

  69 passed (5.8m)
  7 errors were not a part of any test, see above for details
```

### TP-04-20

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-04-21

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-04-22

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical — including **every module file**, the federal pack and the
Florida pack. Any module edit that appeared necessary is recorded here as a
finding routed back to Scope 03, not applied in this scope.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
recommendation, track record, accuracy claim or error rate appears in this scope's
allowed paths, and that no California figure is presented as an estimate.

## Completion Statement

Filled at execution.
