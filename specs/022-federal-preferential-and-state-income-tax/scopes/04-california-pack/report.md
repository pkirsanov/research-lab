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

#### A second attempt, in a later session — still not closed, for a stronger reason

The two failing URLs were retried and both returned HTTP 404 again:

- `https://www.ftb.ca.gov/forms/2025-California-Tax-Rates-and-Exemptions.html` — 404
- `https://www.ftb.ca.gov/file/personal/tax-calculator-tables-rates.html` — 404

A third candidate was tried and also failed:

- `https://www.ftb.ca.gov/forms/2026/2026-540-instructions.html` — 404

The Franchise Tax Board forms index at `https://www.ftb.ca.gov/forms/` was
reachable, and from it a rate schedule **was** retrieved in full, at
`https://www.ftb.ca.gov/forms/2025/2025-540-booklet.html`. So the earlier
"the page 404s" account is now incomplete, and the real obstacle is sharper.

**The retrieved schedule is for the wrong tax year, and no right-year schedule
exists to retrieve.** The pack declares `packId: california-individual-income-tax-2026`.
The booklet retrieved is titled *"2025 Instructions for Form 540"* and its
schedule section is titled *"2025 California Tax Rate Schedules"*, carrying
Schedules X, Y and Z. It is a prior-year publication, and its standard-deduction
chart states the same `$5,706` / `$11,412` figures the 2026 Form 540-ES
instructions already gave — which is the FTB carrying the prior year's figures
forward for estimation, not publishing a declared-year schedule.

The FTB says as much in its own words. The declared-year publication's worksheet
line 4 directs the reader to *"Figure your tax on the amount on line 3 using the
2025 tax table"*, and line 6a to *"Enter the exemption credit amount from the
2025 instructions for Form 540"*. A publication that tells the filer to use the
prior year's table is the authority stating that the declared year's table does
not yet exist.

Transcribing the 2025 bands into a pack that declares 2026 would be a figure
taken from a different tax year and relabelled — exactly the substitution
`BI-6` forbids when it requires that no figure be "recalled, derived from
another figure, or taken from a secondary site", and exactly what FR-022-007
forbids. It is not a retrieval of the declared year's figure, and no amount of
proximity makes it one. **The pack was left unmodified for the second time.**

The exemption credit amount was still not retrieved even for the prior year. The
2025 booklet's Line 32 section states only the AGI limitation thresholds and the
limitation worksheet; the credit amount itself is described as "the pre-printed
dollar amount" carried on the Form 540 PDF rather than stated in the
instructions text, so the HTML publication does not contain it.

**Conclusion, unchanged in outcome and firmer in reason.** `BI-6` is not closed
and its Definition of Done item stays open. The obstacle is not a broken link
that a later session might route around; it is that the declared year's rate
schedule and exemption credit are not published figures at the time of this
session. The correct next step is a planning decision about the pack's declared
year, not another retrieval attempt. That routing is recorded on the DoD row.

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

No ordinary rate table resolved for any filing status, so the pack carries **no
bracket edge at all**. The row is therefore not satisfied by covering a schedule
that does not exist; it is satisfied by proving the covered set is *closed over
whatever the pack actually carries*. An assertion was added that enumerates both
edge families — ordinary band edges and threshold-set keys — and pins the result
to exactly one carried edge, the surcharge threshold, covered immediately below,
exactly at and immediately above for all four filing statuses.

Two negative controls are built into the assertion rather than asserted about it.
The enumerator is run a second time against a clone carrying a two-band ordinary
schedule and must return exactly two more edges, which is what stops the closure
clause from being vacuously true while the pack carries nothing. The provenance
clause resolves the carried edge's `sourceRef` to a retrieved `SourceRecord/v1`
and is run a second time against a clone whose pointer names a section the pack
does not record, which must resolve to nothing.

Intended RED planted the tempting defect for a closure row: an enumerator that
walks only the ordinary schedules and silently forgets the threshold family, so
coverage reads complete because the carried set came back empty. The substitution
is value-free — one expression replaced by an empty array literal — and its
anchor was counted before and after substitution.

```text
anchor_count_before=1
anchor_after=0 probe_after=1
=== RED RUN ===
  ✗ FAIL: TP-04-02: the boundary set is closed over every edge the California pack actually carries — no ordinary schedule resolved so it contributes none, the enumerator is proven able to find band edges on a clone that carries one, the single carried edge is the surcharge threshold and it is covered immediately below, exactly at and immediately above for all four filing statuses, and that edge names the source edition it was transcribed from and the tax year it is declared for through a pointer proven able to dangle
Research-Lab self-test: 3103 passed, 1 failed
=== EXPLICIT REVERT ===
leftover_probe=0 anchor_restored=1
(empty status above means clean)
=== GREEN RUN (same command) ===
Research-Lab self-test: 3104 passed, 0 failed
```

TP-04-02 fell alone and by name. The revert ran inside the same shell invocation
that applied the probe, the leftover count was re-read as zero and the path-scoped
status check came back empty before the GREEN run.

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
status from its own authority, is applied to California taxable income, and is
never derived from the federal deduction.
Command: `node scripts/selftest.mjs`

**This row carries no assertion, and that is recorded rather than papered over.**
A deduction that does not resolve cannot be asserted to resolve per filing status,
so there is nothing here to assert until `BI-6` closes.

The absence was confirmed by census rather than by memory. Grepping the suite for
`TP-04-04` returns thirteen passing lines, and **not one of them belongs to this
scope** — they are other features reusing the row id:

```text
=== TP-04-04 assertions naming California / a state deduction ===
CA_TP0404_END
```

Zero hits mention California, a state deduction or a standard deduction. The
thirteen cover RLDATA publication boundaries, coverage spans, pack test
parameters, bar-alignment methods and a network canary.

The reason no deduction resolves is decidable from the pack, and every filing
status is absent, not merely some:

```text
standardDeductions per status:
   single -> AbsentFigure/v1
   married-filing-jointly -> AbsentFigure/v1
   married-filing-separately -> AbsentFigure/v1
   head-of-household -> AbsentFigure/v1
```

The exemption credit is in the same state. The pack carries one
`ReliefMechanism/v1`, `personal-exemption-credit`, and its per-status `amounts`
are each an `AbsentFigure/v1` naming `RLTAX-THRESHOLD-UNAVAILABLE` with a
`missingSource` pointing at the unretrieved Franchise Tax Board publication. So
no pre-credit and post-credit pair can be published side by side either.

What *is* proven is the application point, which is a structural claim rather
than a numeric one and does not need a resolved amount. The mechanism declares
`kind: "credit-against-tax"` and `applicationPoint: "after-rate-application"`
with `appliesToLegs: ["state-ordinary"]`, and the combined TP-04-05 and TP-04-06
assertion passes by name:

```text
  ✓ TP-04-05 and TP-04-06: the exemption credit is declared a credit applied after rate application, the declared order places that stage after both the rate stage and the leg sum, and moving it before the rate
```

The DoD row this anchors asks for both the deduction and the published figure
pair, so it stays open. It must not be closed by narrowing it to the application
point alone, which is the one part already green.

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

Green. The path-scoped half of this row is the object-hash derivation recorded in
full under [Change Boundary](#change-boundary): all five engine modules compare
IDENTICAL at the creation commit, at `HEAD` and in the working tree, with a live
negative control, and no commit since the route was created has touched a module
or either protected pack. The suite half ran green in the same session at
`3106 passed, 0 failed`.

### TP-04-14

Scenario SCN-022-010 — `unsupportedFeatures[]` is non-empty and no result is
labelled a complete state tax.
Command: `node scripts/selftest.mjs`

**A recorded miss.** The first probe flipped the settlement's completeness label
from `false` to `true` at the resolving return and the suite stayed green at
`3104 passed, 0 failed`. The pre-existing clause reads that label on exactly one
settlement — California's — and California refuses, so it never reaches the
return that was mutated. The clause was therefore satisfied by a code path the
probe did not touch. That is the miss: a presence-only read of one settlement
cannot see a build that labels a *resolving* state tax complete.

The strengthening reads the label on all three returns the state module has — the
refusing California settlement, a sourced-zero settlement over the Florida pack,
and a settlement over the fixture pack that resolves to a finite figure — so a
flip at any one of them is visible. It also stops listing the owed boundary ids
by hand: the requirement is derived from the pack's own absent figures, and the
derivation is proven able to fail against a boundary that drops one of them.

Intended RED then re-planted the identical value-free boolean flip:

```text
anchor_count_before=1
probe_true=1 remaining_false=2
=== RED RUN A (resolving return labelled complete) ===
  ✗ FAIL: TP-04-14: every return the state module has — the refusing California settlement, a sourced-zero settlement and a settlement that resolves to a finite figure — reports the state tax as not complete, and the coverage boundary is required to name each absent-figure family the pack itself carries rather than a hand-listed set, with the requirement proven able to fail on a boundary that drops one of them
Research-Lab self-test: 3104 passed, 1 failed
=== EXPLICIT REVERT A ===
leftover_true=0 restored_false=3
(empty status above means clean)
=== GREEN RUN (same command) ===
Research-Lab self-test: 3105 passed, 0 failed
```

The mutation is a single boolean literal, so no household value could have been
disclosed by a slipped revert. The revert ran inside the applying invocation, the
leftover count was re-read as zero and the path-scoped status came back empty.

#### Re-derived in a later session, without a probe

The DoD row this section anchors asks for a state of the pack and of the module,
so both clauses were re-derived directly rather than inherited from the run above.

`unsupportedFeatures[]` is present, is an array, and carries eight entries — and
the three that matter most are the unretrieved figure groups themselves, so the
coverage boundary names the `BI-6` gap rather than hiding it:

```text
=== unsupportedFeatures[] in the California pack ===
present: true
length: 8
  1 ca-rate-schedule-for-declared-year
  2 ca-standard-deduction-for-declared-year
  3 ca-exemption-credit-amounts
  4 ca-itemized-deduction
  5 ca-alternative-minimum-tax
  6 ca-credits-other-than-exemption
  7 ca-part-year-and-nonresident-apportionment
  8 ca-local-taxes
NODE_EXIT=0
```

The completeness clause is decided on the value the module emits rather than on
prose. `completeStateTax` occurs at exactly three sites in `rltaxstate.js` — which
is the whole set of returns the module has, the same three the strengthened
assertion above reads — and every one is the literal `false`. Across the entire
tracked tree there is no assignment of any other value:

```text
=== the completeness label the state module emits, every occurrence ===
481:        completeStateTax: false
516:        completeStateTax: false
589:        completeStateTax: false
=== is it ever assigned anything but false, anywhere in the tracked tree? ===
   3 completeStateTax: false
```

Both TP-04-14 assertions this scope owns pass by name in the same session:

```text
  ✓ TP-04-14: the California coverage boundary names every provision the pack does not carry, including each unretrieved figure, and no result is labelled a complete state tax
  ✓ TP-04-14: every return the state module has — the refusing California settlement, a sourced-zero settlement and a settlement that resolves to a finite figure — reports the state tax as not complete, and the coverage boundary is required to name each absent
Research-Lab self-test: 3106 passed, 0 failed
```

Recorded so a later reader is not misled: grepping the suite for `TP-04-14`
returns two further passing lines that belong to Features 023 and 024, which reuse
the row id in their own scopes. They are unrelated to this row and were not
counted toward it.

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

**Claim Source:** executed, session of 2026-08-19. The count entered this session
at `3103 passed, 0 failed` and leaves it at `3105 passed, 0 failed`: two
assertions were appended and none was edited. The change to the file is
append-only, which is decidable rather than asserted — the diff over this
session's commits reports `90` insertions and `0` deletions, and a count of
removed lines in that same diff returns zero.

```text
=== 1. selftest ===
selftest_exit=0
Research-Lab self-test: 3105 passed, 0 failed
=== selftest.mjs change shape this session (78c21a0e3..HEAD) ===
90      0       scripts/selftest.mjs
=== deletions in that diff (expect none) ===
0
```

### TP-04-21

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

**Claim Source:** executed. This gate caught a defect introduced by this session
and is recorded rather than hidden. The first draft of the Claim Boundary section
above named `<repo>/tests/lifetime-tax-california.spec.mjs` as a bare path, which
the guard correctly read as a live reference to a file that does not exist and
reported as `new=1`; the whole-repository suite fell with it at
`3104 passed, 1 failed`. The reference was rewritten under the `<repo>/` prefix
convention and both returned to green.

```text
=== 2. spec-test-path guard ===
[spec-test-paths] scanned=678 references=14960 distinctPaths=246 missingPaths=67 baseline=67 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
pathguard_exit=0
```

The frozen baseline is unchanged: a path-scoped diff over this session's commits
for `scripts/validate-spec-test-paths.baseline` and `site-exclusions.json`
returns nothing.

### TP-04-22

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

**Claim Source:** executed.

```text
=== 3. pages site dry run ===
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":128,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/004902309400a815a8ac1da2877422310e381d5c20748f711cbd0233e959a67a","omittedOrphanIndexes":144}
pages_exit=0
```

`tax-rules/` does not appear among the published directories, so the packs stay
outside the public site.

## Change Boundary

The path-scoped proof that every excluded path is byte-identical — every module
file, the federal pack and the Florida pack.
Command: a blob-hash comparison plus a path-scoped `git log` and `git status`

**What the derivation covers, stated plainly.** The row asks for identity against
"its Scope 03 state". Scope 03 has no distinct end commit to diff against: the
whole lifetime-tax route — every engine module, the federal pack, the Florida
pack, the California pack and the page — arrived in the single feature-family
creation commit `b9d92a3f1`, and every commit since is evidence and test work.
The window used here is therefore **creation commit → `HEAD` → working tree**,
which strictly contains the Scope 03 → Scope 04 window. Identity across the wider
window implies identity across the narrower one, so this is a stronger claim than
the row asks for, not a substitute for it.

The comparison is by object hash rather than by a `git status` that could be
satisfied by a file merely being committed:

```text
=== blob identity: creation commit vs HEAD vs working tree ===
rltaxrules.js      206d8d81d7be  IDENTICAL
rltax.js           3206e1516e43  IDENTICAL
rltaxstate.js      c88a3ecde15d  IDENTICAL
rltaxworkspace.js  6760587f2303  IDENTICAL
rltaxstrategy.js   f4dbb4a9c8dc  IDENTICAL
=== negative control: a file that DID change proves the comparator is live ===
scripts/selftest.mjs DIFFERS as expected — comparator is live
```

Each module is compared at three points — the creation commit, `HEAD`, and the
working tree via `git hash-object` — so a change that was made and then committed,
or made and left uncommitted, is equally visible. The comparator carries its own
negative control: run against `scripts/selftest.mjs`, which every scope appends
to, it reports `DIFFERS`. A comparator that reported `IDENTICAL` for everything
would be indistinguishable from a broken one.

The history agrees, over both the modules and the two packs this scope may not
touch:

```text
=== commits AFTER the creation commit b9d92a3f1 touching any engine module ===
ENGINE_COMMITS_END
=== commits AFTER b9d92a3f1 touching the federal pack or the Florida pack ===
PACK_COMMITS_END
=== working-tree dirt on the modules and those packs ===
MODULE_DIRT_END
```

All three queries returned nothing. No commit in the repository's history has
touched `rltaxrules.js`, `rltax.js`, `rltaxstate.js`, `rltaxworkspace.js`,
`rltaxstrategy.js`, `tax-rules/federal/` or `tax-rules/state/FL/` since the route
was created, and none of them is dirty now.

This scope's own commits confirm it from the other direction. Their entire
non-spec footprint is one file, on the allowed-modified list, and appended to:

```text
=== scope 04 own commits: full non-spec footprint ===
--- 2df769eaa ---
--- 302258e8c ---
scripts/selftest.mjs
--- c3a8ca13f ---
--- 8678ac6e7 ---
--- 3b45bb09e ---
--- ffa6e9610 ---
SCOPE04_NONSPEC_FOOTPRINT_END
=== 302258e8c append-only check on scripts/selftest.mjs ===
24      0       scripts/selftest.mjs
```

Twenty-four insertions and zero deletions, which is the append-only claim decided
rather than asserted.

**No finding to route.** The row's second sentence asks that any edit which
appeared necessary be recorded as a finding returned to Scope 03. No module edit
was made and none was needed, so there is no such finding. That is the scope's
structural claim holding: the Scope 03 contract carried California without an
engine edit.

## Claim Boundary

**Claim Source:** executed. **Outcome: the row holds and is ticked.**

Scanned this scope's two output paths — the California pack, whose label and
reason strings are surfaced verbatim as notices, and the page that renders them.
`scripts/selftest.mjs` is a gate rather than an output surface and
`<repo>/tests/lifetime-tax-california.spec.mjs` does not exist, so neither is
scanned.

Each detector is proven live on a planted sentence **before** the scan is
trusted, and the run aborts rather than reporting an absence if any detector is
dead. That guard fired on the first attempt: the lifetime-figure detector did not
match its own planted sentence, so its silence would have been a dead scan rather
than a real absence. It was widened and re-proven.

```text
--- every detector proven live BEFORE the scan is trusted ---
  fires on planted probability = true
  fires on planted lifetimeFigure = true
  fires on planted trackRecord = true
  fires on planted errorRate = true
  fires on planted estimate = true
  dead detector count = 0
  silent on a clean sentence = true
--- scan ---
HIT estimate | tax-rules/state/CA/2026.json:73
     { "id": "ca-part-year-and-nonresident-apportionment", ... "reason": "Section 17041(b), (d) and (i) define a separate computation for a non-resident or part-year resident. This pack models single full-year residency only, and any other declared pattern refuses under its own code rather than being approximated.", "code": "RLTAX-RESIDENCY-UNSUPPORTED", ...
total hits across this scope output paths = 1
```

The probability, lifetime-figure, track-record and error-rate detectors each
returned **zero** hits while each fired on its planted sentence, so their silence
is a real absence.

The single estimate hit is the **opposite** of a violation: it is the pack's own
statement that an unsupported residency pattern *refuses rather than being
approximated*. A substring detector cannot separate an asserted estimate from a
disclaimed one, so every mention was re-run through a classifier proven live on
both forms:

```text
--- the classifier is proven live on both forms ---
  asserted form  -> ASSERTED
  disclaimed form-> DISCLAIMER
--- every mention across this scope output paths, classified ---
  tax-rules/state/CA/2026.json | DISCLAIMER | This pack models single full-year residency only, and any other declared pattern refuses under its own code rather than being approximated.
=== asserted-estimate count across this scope output paths = 0 ===
```

No California figure is presented as an estimate. The California total does not
render as a figure at all: its ordinary schedule was never retrieved, so the
settlement refuses under `RLTAX-THRESHOLD-UNAVAILABLE` and the surface carries a
refusal rather than a numeral, which is pinned independently at
`report.md#tp-04-11`.

## Completion Statement

Filled at execution.
