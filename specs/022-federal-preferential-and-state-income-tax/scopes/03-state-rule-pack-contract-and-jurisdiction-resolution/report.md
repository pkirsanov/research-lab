# Scope 3 Execution Report — State Rule-Pack Contract, Jurisdiction Resolution, And Florida

This file is the evidence surface for scope 3. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

This session was a bounded evidence pass over the first six Definition-of-Done
items. It wrote no implementation and added no assertion; the modules, packs,
fixtures and suite groups were already in place, and what was missing was proof
that the assertions guarding them are sensitive to the behaviour they name.

**Four items closed:** FR-022-015 (the jurisdiction pattern and the no-shadow
scan), FR-022-016 through FR-022-018 (refusal separation), FR-022-019 (the
sourced-zero contract) and FR-022-020 with FR-022-021 (preferential policy and
relief application points). Each rests on at least one intended-RED mutation with
a same-command GREEN.

**Two items left open, each with a recorded reason:**

| Item | Why it is open |
| --- | --- |
| The refusal vocabulary retains every Feature 021 member's meaning and **raising site** | Nothing in the suite pins a raising site. Declaration count, membership and the two additions are covered; the raising-site clause is not. See [TP-03-01](#tp-03-01). |
| `BI-5` | The Florida pack asserts `imposesIndividualIncomeTax: false` from two authorities that state a prohibition and an administrative absence, neither of which states the fact. The spec's own finding F-8 names this as the step not to take by derivation. See [Sourcing](#sourcing). |

**Three coverage holes were found by mutations that missed**, and each is
reported rather than repaired, because a mutation that changes nothing is
evidence about the suite:

1. The rule requiring a pack that *does* impose a tax to carry a null
   `noTaxAuthority` is exercised by no assertion. See [TP-03-05](#tp-03-05).
2. TP-03-13 is insensitive to the validator that forbids a no-preferential pack
   from carrying a preferential rate table; that clause is covered only by a
   Scope 04 row. See [TP-03-13](#tp-03-13).
3. The raising-site clause above.

**Mutation hygiene.** Every mutation was applied and reverted inside a single
shell invocation under an `EXIT`/`INT`/`TERM` trap armed before the run, with a
pre-run guard that aborted rather than proceed on a partially applied change —
which it did once, correctly. Every mutation was chosen so that a slipped revert
could not disclose a household value: they move a code literal, a regular-expression
character class, a comment, or one term of a local sum. No probe touched a URL, a
request or any transport. After every probe `git status --short` over the module
under mutation printed nothing, and no `rl-*probe*` file was created at any point.

**A note on the pass count.** The suite file is shared with a concurrent session
that appended an assertion and committed mid-run, moving the baseline from
`3091 passed, 1 failed` to `3092 passed, 1 failed` and the output from 3501 to
3502 lines. The stable quantity across this session is the failure count: it is
1 in every unmutated run, both before and after, and the single failure —
`committed surface carries no personal identifier` — is pre-existing, raised by
`home-path` findings in the concurrent session's own report under `specs/025-*`,
and was present in the baseline taken before this session changed anything. This
session introduced no new failure.


## Sourcing

**Claim Source:** interpreted. The two source records below were read from the
shipped pack; the retrievals they record were performed in an earlier session,
not in this one. **`BI-5` is NOT closed and its Definition-of-Done item is left
open.** The finding below is routed rather than fixed here, because changing what
a pack asserts about an authority is not this agent's artifact.

### What the pack carries

The Florida pack (`tax-rules/state/FL/<year>.json`) carries two
`SourceRecord/v1` entries, each with a title, a URL, a publisher, a document
kind, a `retrievedAt` and a `retrievalOutcome` of `retrieved`:

| `sourceId` | Title | Publisher | URL | `retrievedAt` |
| --- | --- | --- | --- | --- |
| `fl-const-a7s5` | Constitution of the State of Florida, Article VII, Section 5, Estate, inheritance and income taxes | The Florida Senate | `https://www.flsenate.gov/Laws/Constitution#A7S05` | `2026-08-17T20:41:00.000Z` |
| `fl-dor-taxes` | Taxes and Fees or Refunds | Florida Department of Revenue | `https://floridarevenue.com/taxes/taxesfees/Pages/default.aspx` | `2026-08-17T20:41:00.000Z` |

`noTaxAuthority.sourceRef` is `fl-const-a7s5` and its locator is `Article VII,
Section 5, Estate, inheritance and income taxes, subsection (a), NATURAL
PERSONS`. Both retrieval notes are candid: the first records that the section
states a **prohibition** and "does not state a rate of zero"; the second records
that the departmental index lists Corporate Income and no individual income tax,
and that this is "an absence of an administered tax rather than a rate".

### Why this does not close `BI-5`

`BI-5` in [spec.md](../../spec.md) names its required input as **a Florida
Department of Revenue statement of the absence**, and its declared fallback as
`imposesIndividualIncomeTax` **absent**, with Florida resolving
`RLTAX-THRESHOLD-UNAVAILABLE` rather than a sourced zero. The spec's own finding
F-8 settles the question directly: the retrieved department list and the
retrieved constitutional section together are the ceiling and the administrative
absence, "Neither states the rate is zero. That last step is `BI-5` and is not
taken here."

The shipped pack takes that last step anyway. It sets
`imposesIndividualIncomeTax` to the boolean `false`, and its own
`noTaxAuthority.reason` states the basis in the open: "Two retrieved authorities
together establish that no individual income tax reaches this household, and
neither of them states a rate." Two authorities that jointly *establish* a
conclusion neither one states is an inference from retrieved sources, which is
what FR-022-007 forbids and what the `BI-5` fallback exists to prevent. The pack
is unusually honest about its own reasoning, and that honesty is what makes the
divergence legible; it does not convert the inference into a retrieval.

So neither branch of the Definition-of-Done item holds. Branch one requires a
retrieval that states the absence, and no such record is in the pack. Branch two
requires `imposesIndividualIncomeTax` to ship as an `AbsentFigure/v1` with
Florida resolving `RLTAX-THRESHOLD-UNAVAILABLE`; it ships as a boolean `false`
and Florida resolves a sourced zero.

### Consequence and routing

This is a live consequence, not a paperwork gap. Every downstream assertion that
proves the sourced-zero path — TP-03-12 here, and the Scope 04 and Scope 05 rows
that consume a Florida settlement — currently rests on a jurisdiction whose
no-tax status is derived rather than stated. The fixture pack
`tax-rules/fixtures/state-contract-no-preferential-<year>.json` exists precisely
so the contract can be proven without a real jurisdiction, which is the route the
plan's step 10 reserved for exactly this outcome.

Two dispositions are available and both belong to another owner:

1. Perform the `BI-5` retrieval and record it with its own `retrievedAt`. If a
   Department of Revenue page states the absence, the current posture becomes
   sourced and the item closes on branch one.
2. Ship `imposesIndividualIncomeTax` as an `AbsentFigure/v1` with a code, a
   reason, a remediation and a `missingSource`, let Florida resolve
   `RLTAX-THRESHOLD-UNAVAILABLE`, and prove the sourced-zero path with the
   fixture pack. This is the fallback the spec already declared.

Either disposition changes the pack's `contentSha256` and therefore touches
assertions in this scope and in Scopes 04 and 05. It is implementation and
sourcing work, so it is routed rather than taken here.


## Test Evidence

### TP-03-01

Scenario SCN-022-008 — the vocabulary has exactly one declaration, all twelve
Feature 021 members retain their meaning and raising site, and exactly two members
were added.
Command: `node scripts/selftest.mjs`

**Claim Source:** not-run. **This row is NOT satisfied and its Definition-of-Done
item is left open.**

**Uncertainty Declaration.** The behaviour this row names is only partly asserted
today, and the gap is a real coverage hole rather than a wording difference.

| Clause of TP-03-01 | Asserted today | Where |
| --- | --- | --- |
| exactly one declaration in the repository | yes — the names parsed out of the module's own frozen declaration are compared element for element against the live export | the assertion labelled `TP-01-05` |
| exactly two members were added | yes — the live count is required to equal the twelve named Feature 021 members plus the two named jurisdiction-axis members, and a fabricated third addition is proven to fail | the assertion labelled `TP-01-05` |
| all twelve Feature 021 members retain their exact **meaning** | partly — membership and numeric-free construction are pinned, and a repurposed member is proven to fail | the assertion labelled `TP-01-05` |
| all twelve retain their exact **raising site** | **no** | nothing in `scripts/selftest.mjs` pins a raising site; a repository search for the phrase finds only a Feature 024 row asserting that scope added none |

A code could therefore be moved from the module that raises it today to a
different module, or cease to be raised at all, and the suite would stay green.
Closing this row requires an appended assertion that pins, for each of the twelve
members, the site that constructs it, together with a mutation proving the new
assertion falls when a raise is moved or removed. That assertion was not written
in this session, so the row is recorded as an open gap rather than banked as a
GREEN it did not earn.

### TP-03-02

Scenario SCN-022-008 — the widened jurisdiction grammar accepts the federal and
well-formed state forms and refuses a malformed code, a lowercase code, a
three-letter code and a path-traversal attempt.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED.** The grammar in `rltaxrules.js` was widened from
`state:[A-Z]{2}` to `state:[A-Za-z]{2}`, a value-free change that discloses no
household member. The named assertion is the one that fell, and the pass count
fell by exactly one.

```
# TP-03-02 RED: jurisdiction pattern widened to accept a lowercase postal code
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: 28482139e99eeb5f80fd6b25be41c51c6dfc1524a979385182d79c44a1f38a13
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-02: the jurisdiction grammar accepts federal and a well-formed state code and refuses a lowercase code, a three-letter code, a one-letter code, a bare prefix and a path-traversal attempt
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3090 passed, 2 failed
================================================
```

The mutation was reverted inside the same shell invocation under an
`EXIT`/`INT`/`TERM` trap; `git status --short rltaxrules.js` printed nothing.

**GREEN, same command.**

```
# TP-03-02 GREEN: same command, pattern restored
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: ed33a157c7dcee1408a3d2456cf459d02ca6a828e6cd891d915c903636bac671
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3091 passed, 1 failed
================================================
```

The single remaining failure, `committed surface carries no personal
identifier`, is pre-existing and is raised by `home-path` findings in a
concurrent session's report under `specs/025-*`. It is present in the baseline
run taken before any change in this session and is not owned by this scope.

### TP-03-03

Scenario SCN-022-007 — the federal pack still derives the federal ordered array
element for element and every Feature 021 fixture value is unchanged.
Command: `node scripts/selftest.mjs`

### TP-03-04

Scenario SCN-022-009 — `SourcedZero/v1` validates only with the literal zero and a
complete citation; a non-zero value, an absent citation and a missing locator are
each refused.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED.** The locator clause was deleted from the validator's citation
test, leaving it to require only a `sourceRef`. The change carries no household
member. The named assertion fell alone.

```
# TP-03-04 RED: the locator requirement dropped from the sourced-zero validator
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: 2893c188a1649985190bf910b5a62302f0b15d194243f64b0c7e276a5b5b5fc8
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-04: a sourced zero validates only with the literal zero, a sourceRef and a locator, and a non-zero value, a missing citation and a missing locator are each refused
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3090 passed, 2 failed
================================================
```

Reverted inside the same shell invocation under a trap;
`git status --short rltaxrules.js` printed nothing.

**GREEN, same command.**

```
# TP-03-04 GREEN: same command, the locator requirement restored
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: 1c415b18b107aab607cb946c80550bbb81e39a0bbad25b6e8825b1156553c824
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3091 passed, 1 failed
================================================
```

### TP-03-05

Scenario SCN-022-009 — a pack declaring no individual income tax must carry an
authority, an empty leg set and no rate table, and a pack that declares no tax
while carrying a rate table is refused.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed. **Two earlier mutations missed and are recorded
below rather than discarded.**

**First attempt — a miss.** The first mutation disabled the neighbouring rule
that requires a pack which *does* impose a tax to carry a null `noTaxAuthority`.
The suite did not go red. That rule is the mirror image of the one this row
tests, and disabling it changed nothing, which means **no assertion in the suite
exercises it**. That is a second, independent coverage hole, distinct from the
one recorded under TP-03-01, and it is reported rather than quietly repaired.

**Second attempt — aborted before it ran.** The retry addressed the correct rules
but anchored one substitution to a line holding a refusal message rather than the
predicate. The pre-run guard counted the applied mutations, refused to proceed,
and the trap restored the file, so no run and no evidence were produced from a
half-applied mutation.

**Intended RED, third attempt.** Both no-tax coherence predicates — the empty
leg-set rule and the absent rate-table rule — were disabled by pattern rather
than by line number, with a guard requiring exactly two applied substitutions.
Neither carries a household member.

```
# TP-03-05 RED: the no-tax leg-set and rate-table coherence rules disabled
$ node scripts/selftest.mjs
exit: 1
lines: 3502
sha256: 2ff0988160805c47c28b90312a78f4f7513748f601b1ef70ad538eb7de289128
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-05: a pack declaring no individual income tax is refused when it carries a rate table, when it declares a tax leg and when it names no establishing authority, and no sourced zero can be built from a pack that imposes a tax
--- omitted 3496 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3091 passed, 2 failed
================================================
```

Reverted inside the same shell invocation under a trap; the mutation marker count
returned to zero and `git status --short rltaxrules.js` printed nothing.

**GREEN, same command.**

```
# TP-03-05 GREEN: same command, both coherence rules restored
$ node scripts/selftest.mjs
exit: 1
lines: 3502
sha256: d4312cd4ba7f35c09c97c6f68bed036114d0ac08ee0d456987aa067fa1c7f0db
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3496 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3092 passed, 1 failed
================================================
```

The pass count is 3092 here and 3091 in the TP-03-04 pair above. The suite file is
shared and a concurrent session appended an assertion to it between the two runs;
the output line count moved from 3501 to 3502 at the same moment. A re-baseline
taken immediately before this probe already read `3092 passed, 1 failed`
(sha256 `7018c9a921b9bad24`), so the probe introduced no new failure. The failure
count is the stable quantity across this session and it never rose above the
pre-existing one except while a mutation was live.

### TP-03-06

Scenario SCN-022-008 — `ReliefMechanism/v1` refuses a credit applied before rate
application, a deduction applied after it, and an `appliesToLegs[]` naming an
undeclared leg.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED.** The rule requiring a mechanism's `kind` and its
`applicationPoint` to cohere was disabled, so a credit could be declared before
rate application and a deduction after it. The change carries no household
member. TP-03-06 fell, and so did the Scope 04 row that pins an exemption credit
to a point after both the rate stage and the leg sum — the correct blast radius
for a shared coherence rule.

```
# TP-03-06 RED: the relief kind and application-point coherence rule disabled
$ node scripts/selftest.mjs
exit: 1
lines: 3502
sha256: 12f68ce8959bffb4ef519ffd28a8cf1794b7c440878f54dd95efb5336097f7c2
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-06: a credit applied before rate application, a deduction applied after it, an appliesToLegs naming an undeclared leg and an empty applied-legs list are each refused, while both coherent pairings validate
  ✗ FAIL: TP-04-05 and TP-04-06: the exemption credit is declared a credit applied after rate application, the declared order places that stage after both the rate stage and the leg sum, and moving it before the rate or turning it into a deduction from income is each refused
--- omitted 3496 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3090 passed, 3 failed
================================================
```

Reverted inside the same shell invocation before the next mutation was applied;
the marker count returned to zero and `git status --short rltaxrules.js` printed
nothing.

**GREEN, same command.**

```
# TP-03-06 and TP-03-13 GREEN: same command, both rules restored
$ node scripts/selftest.mjs
exit: 1
lines: 3502
sha256: 3d542212a4f017bc39b0accbd2bd9688e6911fdd5ad0d46d5d20ca4b9750abc8
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3496 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3092 passed, 1 failed
================================================
```

### TP-03-07

Scenario SCN-022-007 — an undeclared residency jurisdiction is
`RLTAX-INPUT-INCOMPLETE` naming the member, and the federal settlement still
resolves in full beside it.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed. Recorded with TP-03-11 below, which the same mutation
felled.

### TP-03-08

Scenario SCN-022-008 — the unshipped-state refusal and the three unsupported
residency patterns carry four distinct reasons and remediations.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED — this is the scope's named intended-RED assertion.** The single
raise of the residency-pattern refusal in the state module was rerouted through
`RLTAX-JURISDICTION-UNSUPPORTED`, which is exactly the confusion the requirement
forbids. The change is value-free: it moves one code literal and carries no
household member.

```
# TP-03-08 and TP-03-09 RED: the residency-pattern refusal rerouted through the jurisdiction code
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: b8db7a6a49b11fcf0e84b4580a9fff03c864d7db6699446613ff029238900f0a
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-08 and TP-03-09: an unshipped state refuses RLTAX-JURISDICTION-UNSUPPORTED while three residency patterns each refuse RLTAX-RESIDENCY-UNSUPPORTED with four distinct reasons, and a part-year resident of a fully shipped state is proven not to be routed through the jurisdiction code
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3090 passed, 2 failed
================================================
```

Reverted inside the same shell invocation under a trap;
`git status --short rltaxstate.js` printed nothing.

**GREEN, same command.**

```
# TP-03-08 and TP-03-09 GREEN: same command, the residency code restored
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: e656f40b0c53c3ac186f4f448658347e012f2d0eb409e5eca4412cf8d66dc23e
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3091 passed, 1 failed
================================================
```

### TP-03-09

Scenario SCN-022-008 — an implementation that routes an unsupported residency
pattern through the jurisdiction code is proven to fail the refusal-separation
assertion.
Command: `node scripts/selftest.mjs`

### TP-03-10

Scenario SCN-022-009 — an implementation that returns a bare zero instead of a
`SourcedZero/v1` is proven to fail the contract-version discriminator assertion.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED.** The discriminator was rewritten to branch on `value === 0`
instead of on the contract version — precisely the mistake FR-022-019 exists to
forbid, and the one a reviewer would most plausibly make. It carries no household
member. TP-03-10 and TP-03-11 fell together, which is the correct blast radius:
both rest on the discriminator telling a sourced zero apart from a bare zero that
holds the same value.

```
# TP-03-10 RED: the sourced-zero discriminator branching on the value instead of the contract version
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: 2c1ed1bffc62ef1b1868cffdcc0551416d24a732a2fd38cf08a61e045665b76a
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-10: an implementation returning a bare zero record is proven to fail the contract-version discriminator that a sourced zero passes, while both carry the same value
  ✗ FAIL: TP-03-11: an implementation that answered an undeclared residency with a zero is proven to fail both the refusal assertion and the sourced-zero discriminator
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3089 passed, 3 failed
================================================
```

Reverted inside the same shell invocation before the next mutation was applied;
`git status --short rltaxrules.js` printed nothing. The same-command GREEN is the
block recorded under TP-03-05 above, taken after every mutation in that
invocation had been reverted.

### TP-03-11

Scenario SCN-022-007 — an implementation that treats an undeclared residency as no
state tax is proven to fail.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED.** The undeclared-residency raise was swapped from
`RLTAX-INPUT-INCOMPLETE` to the jurisdiction code, a value-free one-literal
change. Both TP-03-07 and TP-03-11 fell together, which shows each pins the
specific code rather than merely observing that some refusal was returned. The
substituted-zero control lives inside TP-03-11 itself: the assertion builds the
bare zero an incorrect implementation would return and proves it satisfies
neither the refusal predicate nor the sourced-zero discriminator.

```
# TP-03-07 and TP-03-11 RED: an undeclared residency answered with the jurisdiction code instead of its own
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: 6120d93463cb20a3e23ceb25d10dcb712e57160b1ab236f55b80dfe9ad6c9a00
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-07: an undeclared residency jurisdiction and an undeclared residency pattern are each RLTAX-INPUT-INCOMPLETE naming the member, and neither record carries a numeric value
  ✗ FAIL: TP-03-11: an implementation that answered an undeclared residency with a zero is proven to fail both the refusal assertion and the sourced-zero discriminator
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3089 passed, 3 failed
================================================
```

Reverted inside the same shell invocation under a trap;
`git status --short rltaxstate.js` printed nothing.

**GREEN, same command.**

```
# TP-03-07 and TP-03-11 GREEN: same command, the incomplete-input code restored
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: 17d6d2e19f2ddcb6d7bfffcade9eccafd2bc4ebbe7200d3b381de54ed15ee85d
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3091 passed, 1 failed
================================================
```

### TP-03-12

Scenario SCN-022-009 — the Florida pack validates, resolves for the declared year,
produces a sourced-zero total with a rule status and a citation, and carries no
rate table for any filing status.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed for the mechanism; **the underlying figure is disputed
under `BI-5`.**

The row passes in every run recorded in this file, and the mechanism it proves is
sound: the pack matches its own content digest, resolves for the declared year,
carries an `AbsentFigure/v1` in place of every deduction and rate table, declares
an empty leg set, and returns a total that satisfies the sourced-zero
discriminator with a closed-enum rule status and a reachable citation. The
adversarial companion under TP-03-05 shows the surrounding coherence rules are
load-bearing rather than decorative.

What this row does **not** establish is that the jurisdiction it names genuinely
imposes no individual income tax. That claim rests on the pack's
`imposesIndividualIncomeTax` member, which the [sourcing](#sourcing) section
records as derived from two authorities that state a prohibition and an
administrative absence and neither of which states the fact. The contract is
proven; the input it is fed is contested and routed. The fixture pack proves the
same path without depending on any real jurisdiction, which is why it exists.

### TP-03-13

Scenario SCN-022-008 — a pack declaring no preferential treatment prices pooled
preferential income in its ordinary schedule and omits the two preferential stages
from its ordered array.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**A first mutation missed, and the miss is informative.** Disabling the validator
rule that forbids a `preferentialPolicy: "none"` pack from carrying a
preferential rate table did **not** fell this row. The Scope 04 row that pins the
same rule fell instead. The reason is that this row reads the fixture pack's
contents directly rather than routing the question through validation, so the
validator is not its lever. The row is therefore insensitive to that rule, and the
rule is covered elsewhere rather than here.

```
# TP-03-13 RED: the no-preferential-table rule disabled for a preferentialPolicy none pack
$ node scripts/selftest.mjs
exit: 1
lines: 3502
sha256: d0e456824a3f56bf81e7aad4a457cece2a03495da7ac90abd52bbe4c46496c10
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-04-10: a pack that declares no preferential treatment while carrying a preferential rate table is refused, and the shipped pack is not
--- omitted 3496 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3091 passed, 2 failed
================================================
```

The mutation was reverted inside the same shell invocation; the marker count
returned to zero and `git status --short rltaxrules.js` printed nothing. The
substantive claim this row makes — that a pack declaring no preferential
treatment prices an equal amount of gain and ordinary income identically — is
exercised by the pooling path in the state module, not by the validator, and the
mutation that reaches it is recorded below.

**Intended RED, second attempt.** The pooled base in the state module was narrowed
to drop long-term capital gain, so a `preferentialPolicy: "none"` pack stops
pooling every supported kind into its ordinary schedule. The change is arithmetic
inside one module: it discloses nothing, and a slipped revert would understate a
figure rather than reveal one. This time the named row fell, and it fell alone.

```
# TP-03-13 RED: a preferentialPolicy none pack no longer pools long-term gain into its ordinary schedule
$ node scripts/selftest.mjs
exit: 1
lines: 3502
sha256: e57fb7583f85ad43704f8b68c9e67942e25bbbfb9c6e413490680e9a16efa042
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-13: a pack declaring preferentialPolicy none prices an equal amount of gain and ordinary income identically, carries no preferential rate table, and publishes no preferential taxable amount
--- omitted 3496 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3091 passed, 2 failed
================================================
```

Reverted inside the same shell invocation under a trap; the pooled line returned
to its three-term form and `git status --short rltaxstate.js` printed nothing.

**GREEN, same command.**

```
# TP-03-13 GREEN: same command, the pool restored
$ node scripts/selftest.mjs
exit: 1
lines: 3502
sha256: 61949264b5712558a5cfdf82c50f96dcacfbd2f81be7cd246dbde50a09aa7499
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3496 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3092 passed, 1 failed
================================================
```

The two mutations together locate the row precisely: it is insensitive to the
validator that polices the pack's declaration and sensitive to the engine path
that honours it. Both halves of FR-022-020 are therefore covered, but by
different rows, and this row is the engine half.


### TP-03-14

Scenario SCN-022-009 — `computeAnnualStateTax` accepts no federal figure through
any parameter, and reconciliation leg `L7` holds for every fixture.
Command: `node scripts/selftest.mjs`

### TP-03-15

Scenario SCN-022-007 — the residency members are inventoried, cleared and
redacted, each asserted independently.
Command: `node scripts/selftest.mjs`

### TP-03-16

Scenario SCN-022-008 — no module holds a state name, postal code, bracket, rate,
edge, threshold or authority name, and the detector is proven to fire on a module
that does.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Intended RED.** A single comment carrying a state name was planted at the top
of the state module. The planted token is a jurisdiction name, not a household
value, so a slipped revert could disclose nothing. The detector named the module
and the token it found, and the Scope 04 sibling detector fired on the same
plant, which shows both scans read the module rather than a cached list.

```
# TP-03-16 RED: a state name planted in the state module
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: b1fb415e2d3d9fdf30eee3642097eeb5b279d8947fd4947b3244b75500d7fc33
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-16: no engine module holds a state name, a postal code or an authority name, and the detector is proven to fire on a string that does (rltaxstate.js:California)
  ✗ FAIL: TP-04-13 and TP-04-15: no engine module holds a California bracket, rate, threshold, statutory section number, state name or postal code, so the Scope 03 contract carried California without an engine edit (rltaxstate.js:California)
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3089 passed, 3 failed
================================================
```

The plant was reverted inside the same shell invocation under a trap;
`git status --short rltaxstate.js` printed nothing.

**GREEN, same command.**

```
# TP-03-16 GREEN: same command, planted name removed
$ node scripts/selftest.mjs
exit: 1
lines: 3501
sha256: 82ae0a38b98c13132e4a86866506aa2a5b30358a08a9f27ef461291c2d005b07
--- first 3 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3495 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3091 passed, 1 failed
================================================
```

### Scenario SCN-022-007

`Regression: SCN-022-007 an undeclared residency refuses by name and never shows a zero`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-007 an undeclared residency refuses by name and never shows a zero" --reporter=list`

### Scenario SCN-022-008

`Regression: SCN-022-008 an unshipped state and an unsupported residency pattern refuse differently`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-008 an unshipped state and an unsupported residency pattern refuse differently" --reporter=list`

### Scenario SCN-022-009

`Regression: SCN-022-009 a no-tax state renders a sourced zero distinct from a refusal`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-009 a no-tax state renders a sourced zero distinct from a refusal" --reporter=list`

### TP-03-20

The cumulative Feature 021 and Feature 022 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list`

**Claim Source:** executed. Recorded here as the state of the cumulative suite at
the end of this evidence pass; this session added no browser test, so this is a
regression check rather than a row this session earned.

The selector is pinned to the four owning feature numbers, `SCN-021` through
`SCN-024`, so a scenario owned by any other feature can neither satisfy nor break
it. **69 passed, zero failed, zero skipped.**

```
# TP-03-20 cumulative browser suite for features 021-024
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-02[1-4] --reporter=list
exit: 1
lines: 78
sha256: 04a87e73f5d6c8b995d1a3327a99c6a06afae0556f0b96c2f476cb4b3e0ad638
--- first 6 ---

Running 69 tests using 6 workers

  ✓   5 [system-chrome] › tests/lifetime-tax-conversion.spec.mjs:35:1 › Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack (1.8s)
  ✓   1 [system-chrome] › tests/lifetime-tax-federal.spec.mjs:48:1 › Regression: SCN-021-004 federal tax is exact below at and above a bracket edge (1.9s)
  ✓   2 [system-chrome] › tests/lifetime-tax-benefit.spec.mjs:65:1 › Regression: SCN-024-001 neither origin and both origins each refuse and neither shows a benefit amount (1.9s)
--- omitted 66 line(s); sha256 above covers the full output ---
--- last 6 ---
Error: worker-2 process did not exit within 300000ms after stop, force-killed it
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
Error: worker-0 process did not exit within 300000ms after stop, force-killed it

  69 passed (5.4m)
  3 errors were not a part of any test, see above for details
```

The non-zero exit is a **teardown fault, not a test failure**. The runner's own
summary states `69 passed` and `3 errors were not a part of any test`; every one
of the three is a worker process that did not exit within the stop timeout and
was force-killed after all assertions had already reported. The row's substance —
zero failed and zero skipped over the whole cumulative family — holds. The exit
code is recorded as it came back rather than presented as a zero.

**This row does not close a Definition-of-Done item in this session.** The three
browser rows this scope owns (TP-03-17, TP-03-18, TP-03-19) name a spec file that
does not yet exist, and TP-03-21 names a privacy row in the same absent file. The
69 passing scenarios are the inherited suite, not this scope's browser coverage.


### TP-03-21

`Regression: SCN-022-007 the request ledger stays empty and no household value reaches a URL`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-007 the request ledger stays empty and no household value reaches a URL" --reporter=list`

### TP-03-22

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-03-23

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-03-24

The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/`
remains outside the public directories.
Command: `node scripts/build-pages-site.mjs --dry-run`

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical, including `tax-rules/federal/**`, `rltaxstrategy.js`,
`site-exclusions.json` and Feature 021's spec directory.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
recommendation, track record, accuracy claim or error rate appears in this scope's
allowed paths, and that no state figure is presented as an estimate or an average.

## Completion Statement

Filled at execution.
