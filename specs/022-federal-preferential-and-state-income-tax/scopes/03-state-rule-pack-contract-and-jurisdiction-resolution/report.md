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

### The `BI-5` retrieval was attempted in this session and did not find the statement

**Claim Source:** executed. Disposition 1 above — perform the `BI-5` retrieval —
was attempted here rather than left as a suggestion, so the item is now open on a
*measured* negative rather than on an untried option. Five Florida Department of
Revenue pages were fetched at `retrievedAt` `2026-08-21T04:31:33Z`:

| Publisher | Title | URL | Outcome |
| --- | --- | --- | --- |
| Florida Department of Revenue | Taxes and Fees or Refunds | `https://floridarevenue.com/taxes/taxesfees/Pages/default.aspx` | retrieved; lists the administered taxes, Corporate Income among them, and states no absence |
| Florida Department of Revenue | General Tax Administration | `https://floridarevenue.com/taxes/Pages/default.aspx` | retrieved; a portal index, states no absence |
| Florida Department of Revenue | Florida Corporate Income Tax | `https://floridarevenue.com/taxes/taxesfees/Pages/corporate.aspx` | retrieved; scopes the corporate tax to corporations and states no absence for natural persons |
| Florida Department of Revenue | Florida Tax Incentives for Businesses | `https://floridarevenue.com/taxes/taxesfees/Pages/tax_incentives.aspx` | retrieved; enumerates CIT, FT, IPT, SUT and ST and states no absence |
| Florida Department of Revenue | Considering Business Opportunities in Florida? (GT-800029) | `https://floridarevenue.com/Forms_library/current/brochure/gt800029.pdf` | **not retrieved** — the fetch returned no extractable content |

None of the four pages that *were* retrieved states that Florida imposes no
individual income tax. They enumerate what the department administers, which is
the same administrative absence the pack already cites under `fl-dor-taxes`; a
second reading of the same kind of page does not become a statement of the fact.
The one document most likely to carry the sentence in plain words — the GT-800029
brochure — did not retrieve, so nothing may be asserted from it. **Recalling its
wording is exactly the move `BI-5` exists to forbid, and it is not made here.**

`BI-5` therefore stays open, and its routing is unchanged and now better
evidenced: branch one requires a retrieval that has been attempted and has not
succeeded, so the decidable path forward is branch two — ship
`imposesIndividualIncomeTax` as an `AbsentFigure/v1` with a `missingSource`, let
Florida resolve `RLTAX-THRESHOLD-UNAVAILABLE`, and keep proving the sourced-zero
path with the fixture pack that exists for this purpose. That is a pack edit that
moves `contentSha256` and re-aims assertions in Scopes 03, 04 and 05, so it
remains implementation-and-sourcing work owned outside this report.

**What would make the item decidable without that pack edit:** a single retrieved
Department of Revenue document whose text states the absence for natural persons.
Two candidates were not reachable through the fetch path used here and are named
so the next attempt starts from them rather than from scratch — the GT-800029
brochure above, and the department's own FAQ search restricted to the general-tax
category at `https://floridarevenue.com/faq/pages/faqsearch.aspx?keywords=&cat=4&subcat=0`.


## Test Evidence

### TP-03-01

Scenario SCN-022-008 — the vocabulary has exactly one declaration, all twelve
Feature 021 members retain their meaning and raising site, and exactly two members
were added.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

The row has four clauses. Three were already pinned by the assertion labelled
`TP-01-05`: the names parsed out of the module's own frozen declaration are
compared element for element against the live export, the live count is required
to equal the twelve named Feature 021 members plus the two named jurisdiction-axis
members with a fabricated third addition proven to fail, and every member is
required to construct a numeric-free refusal with a repurposed member proven to
fail.

The fourth clause — **raising site** — was asserted by nothing. A previous session
recorded that gap honestly rather than banking the row. It is now closed by an
appended assertion labelled `TP-03-01` in `scripts/selftest.mjs`, which pins, for
every member of the vocabulary, the exact set of modules that raise it across
Feature 021's four modules and this scope's new one. The scan strips the frozen
declaration block first, because a declaration is not a raise, and then counts
every remaining occurrence whatever idiom carries it — `unavailable(`, `refuse(`,
a `deferralCode:` member or a ternary arm — so the detector cannot be evaded by
changing the call shape.

Three clauses are additional to the pinned map and were written because the map
alone would not have caught them: the pinned key set must equal the live
vocabulary exactly, so a member added later cannot go unpinned; the one member
raised entirely outside the pinned set is asserted to be raised somewhere in the
tax modules, so it cannot be a member that is declared and never constructed; and
two deliberately wrong maps — one with a raising site removed, one with a raising
site added — are each required to be rejected against the same observation, so the
comparison is shown to be capable of failing.

**Intended RED.** A comment was planted at the head of the residency declaration
in `rltaxstate.js` carrying the text
`unavailable("RLTAX-PACK-EXPIRED", domain, reason, remediation)`. The mutation is
value-free by construction — it is a comment holding a code literal and four
parameter names, and it discloses no household member. It is also behaviourally
inert, which is what makes it the right probe here: it changes no result any other
assertion reads, so whatever falls is attributable to the new row alone. It stands
for the failure this row exists to catch, a raise appearing in a module that does
not own it. The pre-run guard confirmed the anchor matched exactly once and that
the planted text landed on line 57 before the suite was run.

```text
GUARD_ANCHOR_COUNT=1
GUARD_PROBE_PLANTED=1
GUARD_PLANTED_LINE=57:  /* PROBE moved raise: unavailable("RLTAX-PACK-EXPIRED", domain, reason, remediation)
RED_EXIT=1

================================================
Research-Lab self-test: 3098 passed, 2 failed
================================================
=== failing assertions ===
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-01: every member of the refusal vocabulary is raised from exactly the modules that own it across Feature 021's four modules and this scope's new one, a ra
```

Exactly one assertion fell, and it is the new one. The other failure,
`committed surface carries no personal identifier`, is pre-existing and belongs to
a concurrent session's spec directory; it is present in the GREEN run below with
the identical text and is not this scope's.

**Same-command GREEN.** The probe was reverted with `git checkout --` in the same
session, the leftover count was re-read as zero and the source tree was confirmed
to carry no dirty tax module, pack or test file, then the identical command was
re-run.

```text
REVERT_LEFTOVER=0
=== git status for source paths ===
 M tests/company-intelligence-lab.spec.mjs
?? tests/chaos-company-intelligence.spec.mjs
GREEN_EXIT=1

================================================
Research-Lab self-test: 3099 passed, 1 failed
================================================
=== failing assertions ===
  ✗ FAIL: committed surface carries no personal identifier
```

The two paths shown dirty are a concurrent session's company-intelligence spec
files, not this scope's; no `rltax*.js` module, no pack under `tax-rules/` and no
file this scope owns is modified. The pass count rose by one — the appended
assertion — and the failure count is unchanged at the one pre-existing failure.

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

**Claim Source:** executed.

**The label `TP-03-03` is reused by seven different assertions in the shared
suite**, belonging to seven different features. The row this scope owns is the one
asserting the ordered-array derivation; the others cover cadence rearming, segment
sourcing, depreciation and serialization and are not this scope's. The probe below
therefore pins its summary channel to the row's own wording rather than to the
label prefix, so the evidence cannot be satisfied by a namesake in another feature.
That hazard is not hypothetical — this program has already found an assertion that
read green while owned by nothing because its row id was reused.

**Intended RED.** A pack that imposes no individual income tax stops deriving an
empty ordered array and derives the full federal one instead. That is the defect
the clause exists to catch: a no-tax jurisdiction carrying priced stages it has no
authority to price. The mutation is value-free — it names a declared constant and
carries no rate, bracket or threshold.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-03: a pack imposing no individual income tax stops deriving an empty ordered array and derives the full federal one instead, so a no-tax jurisdiction would carry stages it has no authority to price
file:             rltaxrules.js
mutation:         if (isPlainObject(pack) && pack.imposesIndividualIncomeTax === false) return [];  ->  if (isPlainObject(pack) && pack.imposesIndividualIncomeTax === false) return CALCULATION_ORDER.slice();   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-03-03: the federal pack still derives the federal ordered array element for element, a preferentialPolicy none pack derives the array that omits both preferential stages and carries the
green-exit:       0
green-summary:      ✓ TP-03-03: the federal pack still derives the federal ordered array element for element, a preferentialPolicy none pack derives the array that omits both preferential stages and carries the two n
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

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

**Intended RED — the citation clause.** The row previously carried prose and a
passing run but no perturbation, so nothing showed it was read. The sourced zero
now cites its own domain string instead of the authority that establishes the
absence of the tax. The record still validates and still carries the literal zero,
so a value-only or shape-only assertion would stay green; what breaks is the one
thing the row is for — the citation leading back to a retrieved source. The
mutation is value-free and moves no figure.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-12: the sourced zero cites its own domain string instead of the authority that establishes the absence of the tax, so the record still validates but its citation no longer leads back to a retrieved source
file:             rltaxrules.js
mutation:         sourceRef: authority.sourceRef,  ->  sourceRef: domain,   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-03-12: the Florida pack validates against its own digest, resolves for the declared year, carries no rate table for any filing status, and produces a SourcedZero total with a rule statu
green-exit:       0
green-summary:      ✓ TP-03-12: the Florida pack validates against its own digest, resolves for the declared year, carries no rate table for any filing status, and produces a SourcedZero total with a rule status and
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

This probe strengthens the *mechanism* half of the row only. It does not touch the
disputed input: whether the jurisdiction genuinely imposes no individual income tax
remains `BI-5`, and is still open.

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

**Claim Source:** executed.

The row has two halves and each was probed separately, because a single mutation
that fell both would not have shown which half the assertion actually reads.

**Intended RED, the parameter half.** A third parameter named `federalResult` was
added to the `computeAnnualStateTax` signature in `rltaxstate.js`. The mutation is
value-free by construction — it is an identifier in a parameter list, it carries no
household member, and the parameter is never read, so the mutation is
behaviourally inert. That inertness is the point: the module still computes the
same settlement, and the only thing that changed is that a federal figure now has
a door to come through. The row fell on that alone.

```text
GUARD_A_SIGNATURE=421:  function computeAnnualStateTax(workspace, statePack, federalResult) {
RED_A_EXIT=1

================================================
Research-Lab self-test: 3098 passed, 2 failed
================================================
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-14: computeAnnualStateTax declares exactly the workspace and the state pack, no federal result reaches the module by name, and reconciliation leg L7
```

Exactly one assertion fell, and it is this row. Reverted with `git checkout --` in
the same invocation; `REVERT_A_LEFTOVER=0`.

**Intended RED, the `L7` half.** The one term of the local identity that names the
state pack's own deduction had its sign flipped, so
`grossSupportedIncome - appliedDeduction` became
`grossSupportedIncome + appliedDeduction`. The mutation is value-free by
construction — it is a single arithmetic operator, and it introduces no figure.
It stands for exactly the defect `L7` exists to catch: a state taxable income that
does not derive from the state pack's own deduction.

```text
GUARD_B_TERM=343:      Math.abs(basis.stateTaxableIncome - Math.max(0, basis.grossSupportedIncome + result.applie
RED_B_EXIT=1

================================================
Research-Lab self-test: 3087 passed, 5 failed
================================================
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-03-14: computeAnnualStateTax declares exactly the workspace and the state pack, no federal result reaches the module by name, and reconciliation leg L7
  ✗ FAIL: TP-05-02 and TP-05-06: the combined total equals the sum of the two jurisdiction totals, includes a sourced zero as a real addend rather than skipping it,
  ✗ FAIL: TP-05-04 and TP-05-05: a state settlement whose taxable income was reduced by the federal total produces a serialised result the order-independence compari
  ✗ FAIL (Feature 022 Scope 05 combined group threw): Cannot read properties of undefined (reading 'every')
```

This probe is not isolated and was not expected to be. Breaking `L7` makes the
state settlement refuse rather than balance, so Scope 05's combined rows lose the
addend they consume and its group throws. That cascade is itself evidence that
`L7` is load-bearing rather than decorative. Reverted with `git checkout --` in
the same invocation; `REVERT_B_LEFTOVER=0`.

**Same-command GREEN.** With both probes reverted, a path-scoped status check over
the tax modules, the packs and the scripts directory printed nothing — no source
file left dirty — and the identical command was re-run.

```text
########## GREEN: same command, both probes reverted
GREEN_EXIT=1

================================================
Research-Lab self-test: 3099 passed, 1 failed
================================================
  ✗ FAIL: committed surface carries no personal identifier
```

The single remaining failure is pre-existing, belongs to a concurrent session's
spec directory and is not this scope's; the pass count returned to its full value
and no assertion was edited.

`L7`'s negative control is asserted inside the suite as well as by the source
probe above: the assertion labelled `TP-03-09` in the same group constructs a
settlement whose taxable income does not derive from its own applied deduction and
requires it to break `L7` and to refuse `RLTAX-RECONCILE` rather than balance.

### TP-03-15

Scenario SCN-022-007 — the residency members are inventoried, cleared and
redacted, each asserted independently.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

**Correction.** An earlier draft of this section stated that the row's clauses are
"asserted separately rather than as one conjunction". That is wrong, and re-reading
the assertion is what caught it: the row is a single `assert` whose condition is one
nine-term `&&` chain. The correction does not weaken the row — a conjunction still
makes every term load-bearing, because one false term fails the whole assert — but
it does change what the evidence has to show. A conjunction cannot tell you *which*
term fired, so each clause has to be perturbed on its own; the original claim would
have let one probe stand in for all of them. The clauses are: the stored entry names
residency in its purpose and is flagged as carrying household values; both members
appear in `declaredUnavailableDomains` when absent, so an undeclared residency is
recorded as unsupplied rather than silently treated as none; the clear action empties
the store; and the export sanitizer names both members in `omittedFields[]` while the
manifest carries no occurrence of the declared jurisdiction.

**Intended RED — the redaction clause, probed at the sanitizer.** The sanitizer
derives its omission set: anything not in the kept object is withheld *and named*.
Adding the residency to the kept object therefore does both halves of the defect
at once — the location signal reaches the exported file, and it stops being
listed as omitted. The mutation is value-free: it references a workspace member
and carries no jurisdiction literal.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-15 the export sanitizer keeps the declared residency instead of withholding it, so the location signal reaches the exported file and is no longer named as omitted
file:             rltaxworkspace.js
mutation:         selectedBracketId: workspace.selectedBracketId  ->  selectedBracketId: workspace.selectedBracketId, residencyJurisdiction: workspace.residencyJurisdiction   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:      Research-Lab self-test: 3176 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3177 passed, 0 failed
revert-verified:  yes (committed=6760587f2303516755ab6a5e14436050717f1227 restored=6760587f2303516755ab6a5e14436050717f1227)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Exactly one assertion fell, so the row is what fires rather than a bystander in a
wider cascade.

**The other two clauses of the Definition-of-Done item were probed separately,
because the row is one nine-clause conjunction and the probe above exercises only
its redaction clause.** A conjunction does make every clause load-bearing, but
only a clause that has been perturbed is *shown* to be read; the remaining two
were previously asserted and unproven. Both probes below pin the summary channel
to the assertion's own label, so the evidence names the row that fell rather than
leaving it to be inferred from a moved pass count.

**Intended RED — the inventory clause.** The privacy inventory stops flagging the
workspace entry as carrying household values. The residency declaration is still
stored, so this is the exact defect the clause exists to catch: private state held
but not disclosed as private. The mutation is value-free — a boolean.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-15 inventory clause: the privacy inventory stops flagging the workspace entry as carrying household values, so the residency declaration is stored but no longer inventoried as private
file:             rltaxworkspace.js
mutation:         carriesHouseholdValues[config.storage.workspaceKey] = true;  ->  carriesHouseholdValues[config.storage.workspaceKey] = false;   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-03-15: the residency declaration is named in the privacy inventory, recorded as an unsupplied domain when absent, removed by the clear action, and redacted out of the export manifest so
green-exit:       0
green-summary:      ✓ TP-03-15: the residency declaration is named in the privacy inventory, recorded as an unsupplied domain when absent, removed by the clear action, and redacted out of the export manifest so the l
revert-verified:  yes (committed=6760587f2303516755ab6a5e14436050717f1227 restored=6760587f2303516755ab6a5e14436050717f1227)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

An earlier run of the same mutation with the summary channel pinned to the suite
total instead of the label read `3173 passed, 4 failed` against
`3177 passed, 0 failed`. That form proved four assertions fell but not *which*,
so it was re-run in the form above; the cascade is recorded here rather than
dropped, and the three siblings are Feature 021's own privacy rows reading the
same inventory.

**Intended RED — the clear clause.** The clear action still reports every declared
key in `removedKeys[]` but removes none, so a stored residency declaration
survives a clear while the return value claims otherwise. This is the failure a
`removedKeys[]`-only assertion would miss entirely; the row reads the store.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-15 clear clause: the clear action still reports every declared key as removed but no longer removes any, so the stored residency declaration survives a clear
file:             rltaxworkspace.js
mutation:         storage.removeItem(keys[index]);  ->  void keys[index];   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-03-15: the residency declaration is named in the privacy inventory, recorded as an unsupplied domain when absent, removed by the clear action, and redacted out of the export manifest so
green-exit:       0
green-summary:      ✓ TP-03-15: the residency declaration is named in the privacy inventory, recorded as an unsupplied domain when absent, removed by the clear action, and redacted out of the export manifest so the l
revert-verified:  yes (committed=6760587f2303516755ab6a5e14436050717f1227 restored=6760587f2303516755ab6a5e14436050717f1227)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

**The ledger half of the item was re-confirmed live rather than cited from an
earlier pass.** The browser row that carries it was re-run in this session and
passed in `1.1s`, and the two clauses it must hold were re-read in the file: the
request count after declaring a residency equals the count at first paint, so the
declaration issues no request at all, and both pack paths appear in the ledger the
run actually produced.

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "the residency declaration reaches no URL, no request, no console message and no export" --reporter=list

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-state.spec.mjs:219:1 › Regression: the residency declaration reaches no URL, no request, no console message and no export (1.1s)

  1 passed (4.3s)
```

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

### Browser rows — the substance was probed under the titles that exist

**Claim Source:** executed.

The three titles above do not exist, which is Finding F-03-A recorded under
TP-03-21. **They were not authored to make the rows resolve.** Their substance is
already carried by `tests/lifetime-tax-state.spec.mjs` under different titles, so
writing four new tests under the Test Plan's wording would have produced duplicate
coverage whose only purpose was to satisfy a document. That is the failure mode the
row census exists to catch, not a way of closing it. What was missing was not
coverage but *evidence that the existing coverage can fail*, and that is what the
two probes below add.

**Intended RED — the refusal-separation row, carrying the substance of TP-03-17 and
TP-03-18.** The unmodelled residency pattern is rerouted through the jurisdiction
code, collapsing three distinct refusal codes into two. A row that merely checked
"a refusal appeared" would stay green; this one does not, so it reads the codes
apart rather than counting them.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-17 and TP-03-18 substance: the unmodelled residency pattern is rerouted through the jurisdiction code, collapsing three distinct refusal codes into two so the browser row can no longer tell an unshipped state from an unsupported residency pattern
file:             rltaxstate.js
mutation:         rules.unavailable("RLTAX-RESIDENCY-UNSUPPORTED"  ->  rules.unavailable("RLTAX-JURISDICTION-UNSUPPORTED"   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep an\ unshipped\ state\,\ an\ undeclared\ residency\ and\ an\ unmodelled\ residency\ pattern\ refuse\ under\ three\ different\ codes\ and\ none\ of\ them\ shows\ a\ zero --reporter=list
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (1.8s)
revert-verified:  yes (committed=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d restored=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

**Intended RED — the sourced-zero row, carrying the substance of TP-03-19.** The
no-tax branch is inverted, so a jurisdiction that imposes no individual income tax
no longer takes the sourced-zero path at all and its authority-carrying zero is
replaced by the ordinary-schedule outcome. This is precisely the "sourced zero
distinct from a refusal" distinction the row names.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-19 substance: the no-tax branch is inverted, so a jurisdiction that imposes no individual income tax no longer takes the sourced-zero path and its authority-carrying zero is replaced by the ordinary-schedule outcome
file:             rltaxstate.js
mutation:         if (statePack.imposesIndividualIncomeTax === false) {  ->  if (statePack.imposesIndividualIncomeTax === true) {   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep a\ jurisdiction\ that\ levies\ no\ individual\ income\ tax\ renders\ its\ sourced\ zero\ with\ the\ authority\ that\ establishes\ it\,\ and\ never\ enters\ the\ federal\ total --reporter=list
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (2.1s)
revert-verified:  yes (committed=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d restored=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

These probes do **not** close TP-03-17, TP-03-18 or TP-03-19. A Test Plan row is
satisfied by the command it names, and the command each of these names still
selects zero tests. They make the retarget a documentation change rather than a
test-writing one: when planning points those rows at
`tests/lifetime-tax-state.spec.mjs` and its real titles, the RED/GREEN evidence is
already recorded above.

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

#### TP-03-20 re-taken after the F-03-B rename — selection floor, then perturbation

**Claim Source:** executed.

The paragraph above is superseded on the point it could not settle. It recorded a
green cumulative run and no perturbation, and the census later found the stronger
reason it proved nothing: the `--grep "SCN-02[1-4]"` selection contained no test
carrying `SCN-022-007`, `-008` or `-009`, the three scenarios this row claims,
because `tests/lifetime-tax-state.spec.mjs` omitted its scenario token. The
routed rename landed in `8e882bfc1`. Both halves the row now asks for follow.

**The selection floor, asserted before a single test executed.** The `--list`
invocation runs first, and its output must name at least one title carrying each
of the three scenarios this scope owns:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --list
  [system-chrome] › tests/lifetime-tax-state.spec.mjs:51:1 › Regression: SCN-022-009 a jurisdiction that levies no individual income tax renders its sourced zero with the authority that establishes it, and never enters the federal total
  [system-chrome] › tests/lifetime-tax-state.spec.mjs:156:1 › Regression: SCN-022-007 / SCN-022-008 an unshipped state, an undeclared residency and an unmodelled residency pattern refuse under three different codes and none of them shows a zero
  [system-chrome] › tests/lifetime-tax-state.spec.mjs:219:1 › Regression: SCN-022-007 the residency declaration reaches no URL, no request, no console message and no export
Total: 80 tests in 19 files

floor SCN-022-007: 2 title(s) in the listing
floor SCN-022-008: 1 title(s) in the listing
floor SCN-022-009: 1 title(s) in the listing
```

**`Total: 80 tests in 19 files` is the recorded count and must not fall between
runs.** It was 77 tests in 18 files before the rename, and the three tests and the
one file the rename added are exactly the ones whose absence made this row
unfallable. A later spec dropping its token now shows as shrinkage against 80
rather than as a smaller green run.

**Intended RED, then same-command GREEN.** The adversarial case the row names is
the collapse of `SCN-022-008`'s separation: an unsupported residency pattern is
routed through `RLTAX-JURISDICTION-UNSUPPORTED`, so the code that distinguishes an
unshipped state from an unmodelled residency pattern becomes the same code. Before
the rename this mutation could not have moved the row, because the test that
asserts the separation was not in the selection.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-20 perturbation: collapsing SCN-022-008 refusal separation fells the cumulative family suite
file:             rltaxstate.js
mutation:         rules.unavailable("RLTAX-RESIDENCY-UNSUPPORTED", "residency:pattern:" + declared,  ->  rules.unavailable("RLTAX-JURISDICTION-UNSUPPORTED", "residency:pattern:" + declared,   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-02\[1-4\] --reporter=list
red-exit:         1
red-summary:        79 passed (47.1s)
green-exit:       0
green-summary:      80 passed (49.2s)
summary-compared:   79 passed (<elapsed>)  vs    80 passed (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d restored=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The GREEN run is `80 passed`, zero failed and zero skipped, over the whole
cumulative family — and it is the same command as the RED run, not a narrowed one.
The RED run loses exactly one test, the refusal-separation test this scope owns.
The mutation was reverted under the harness trap and the revert was hash-verified.

The earlier run's non-zero exit came from a worker teardown fault; this run exits
0 on its own, so no exit-code interpretation is needed here.


### TP-03-21

`Regression: SCN-022-007 the request ledger stays empty and no household value reaches a URL`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-007 the request ledger stays empty and no household value reaches a URL" --reporter=list`

**Claim Source:** executed, but **against a different title than this row names** —
that divergence is a finding and is recorded rather than papered over.

**Finding F-03-A — this row's target does not resolve.** The Test Plan names the
file `lifetime-tax-state-contract.spec.mjs` and the title above. Neither exists:
a whole-tree search for the title returns nothing, and no file of that name is in
`tests/`. The command as written selects zero tests, and a Playwright run that
selects zero tests is not a green row — it is an unresolved reference reporting
success. The same divergence applies to TP-03-17, TP-03-18 and TP-03-19.

**What does exist, and covers the behaviour.** `tests/lifetime-tax-state.spec.mjs`
carries `Regression: the residency declaration reaches no URL, no request, no
console message and no export`, which asserts the row's substance: the ledger
length after declaring a residency equals the length at first paint, so declaring
where the household lives issues no request at all; every request the route ever
made is same-origin and is a member of the page's own declared asset set; the
declared jurisdiction appears in no URL, query string, hash, request body or
console message, in either literal or percent-encoded form; and the export omits
both residency members while naming them in `omittedFields[]`.

**One clause of the Definition-of-Done item was NOT asserted, and was added
rather than assumed.** The item reads *"the request ledger stays empty with two
pack files now loaded from disk"*. The existing test proved the state pack was
*permitted*, which is true even of a route that never fetched it. Two lines were
appended — a purely additive change, seven insertions and zero deletions — that
require both pack files to appear in the ledger the run actually produced:

```js
  expect(paths).toContain('/tax-rules/federal/2026.json');
  expect(paths).toContain('/tax-rules/state/CA/2026.json');
```

**Intended RED against the strengthened row.** The declared state pack path stops
naming the file the route reads, so the second pack never reaches the ledger. The
mutation is value-free — a path string — and carries no rate, threshold or
household amount.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-21 the declared state pack path stops naming the file the route reads, so only one pack file reaches the ledger and the second declared read is gone
file:             lifetime-tax-strategy.config.json
mutation:         "state:CA": "tax-rules/state/CA/2026.json"  ->  "state:CA": "tax-rules/state/CA/2026.retired.json"   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep the\ residency\ declaration\ reaches\ no\ URL\,\ no\ request\,\ no\ console\ message\ and\ no\ export --reporter=list
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (2.0s)
revert-verified:  yes (committed=0c62867fd6285d2bbad4b9ea983893d1433ea80f restored=0c62867fd6285d2bbad4b9ea983893d1433ea80f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

**Routing.** The behaviour is delivered and now probed, so the *Definition-of-Done
item* about the residency state is closed on this evidence. The *Test Plan row*
still names a file and a title that do not resolve, which is a planning-artifact
defect owned by `bubbles.plan`: either retarget TP-03-17 … TP-03-21 at
`tests/lifetime-tax-state.spec.mjs` and its real titles, or require the four named
titles to be authored. Until that is settled the row-census item stays open, and
it does.

### TP-03-22

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed.

```text
Research-Lab self-test: 3177 passed, 0 failed
selftest_exit=0
```

The pre-existing count was 3176. It rose by exactly one — this scope's appended
claim-boundary assertion — and no failure appeared.

**No existing assertion was edited, and that is derived rather than asserted.**
The only channel that can falsify it is the deletion set of the change, so the
change was measured against the committed tree before it was banked:

```text
 scripts/selftest.mjs | 49 +++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 49 insertions(+)
deletions in the diff: 0
```

Forty-nine insertions, zero deletions, one hunk. An insertion cannot relax an
assertion that is still present, so a pure-insertion diff settles the clause
without anyone having to vouch for it.

**Intended RED — a real defect in this scope's own module must drop the count.**
The state module stops attaching to the browser global, which removes the UMD
half of the dual module while leaving `module.exports` intact, so the defect is
invisible to a `require`-based caller and visible only to the assertion that
pins the contract. That is the right shape for this row: a defect that broke
everything would prove only that the suite runs.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-22 the state module stops attaching to the browser global, so the UMD half of the dual module is gone and the repository pass count must fall
file:             rltaxstate.js
mutation:           root.RLTAXSTATE = api;  ->    root.RLTAXSTATEAPI = api;   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:      Research-Lab self-test: 3176 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3177 passed, 0 failed
revert-verified:  yes (committed=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d restored=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The count falls by exactly one and the suite refuses. The mutation is value-free:
it renames an identifier and carries no rate, threshold or household amount.

### TP-03-23

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

**Claim Source:** executed.

```text
[spec-test-paths] scanned=686 references=15471 distinctPaths=250 missingPaths=67 baseline=67 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
paths_exit=0
```

`new=0` is the clause. `missingPaths=67` equals `baseline=67`, so every missing
path is one the frozen baseline already tolerates and this scope introduced none.

**Intended RED — the probe deliberately writes no new path.** The obvious way to
red a "zero new missing paths" row is to make a spec name a file that does not
exist, but the harness block would then carry that invented path into this
report, the guard would scan it here, and the row would be permanently red. The
probe instead comments out an entry the baseline already tolerates: the count of
missing paths is unchanged while the tolerated set shrinks by one, so the same
path is reported as new. The path in the block below is a real baseline entry, so
pasting it changes nothing.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-23 a tolerated missing test path leaves the frozen baseline, so it must be reported as new
file:             scripts/validate-spec-test-paths.baseline
mutation:         tests/auction-gamma-playbook.spec.mjs  ->  # tests/auction-gamma-playbook.spec.mjs   (1 occurrence(s))
command:          node scripts/validate-spec-test-paths.mjs
red-exit:         1
red-summary:      [spec-test-paths] FAIL — 1 new referenced path(s) do not exist
green-exit:       0
green-summary:    [spec-test-paths] OK — no new missing test path(s)
revert-verified:  yes (committed=972f0de1d9ab47e0f584287138399e51187629dc restored=972f0de1d9ab47e0f584287138399e51187629dc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### TP-03-24

The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/`
remains outside the public directories.
Command: `node scripts/build-pages-site.mjs --dry-run`

**Claim Source:** executed.

```text
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":128,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/…","omittedOrphanIndexes":145}
pages_exit=0
```

The `directories` array is the published set, and `tax-rules` is not a member.
That is the clause read off the plan's own output rather than off an intention:
the state packs and the contract fixture this scope adds are reachable to the
engine at runtime and are not published as site content.

**Intended RED — the probe reds on the register, not on the plan's arithmetic.**
The row pairs "the plan succeeds" with "`site-exclusions.json` is unchanged", so
the mutation takes this route out of the exclusions register. The build refuses
with a stale-exclusion error rather than quietly producing a plan with one fewer
excluded path, which is the stronger of the two failures it could have shown.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-03-24 this route leaves the exclusions register, so the Pages plan meets an unregistered root page
file:             site-exclusions.json
mutation:         "path": "lifetime-tax-strategy-lab.html",  ->  "path": "lifetime-tax-strategy-lab.html.retired",   (1 occurrence(s))
command:          node scripts/build-pages-site.mjs --dry-run
red-exit:         1
red-summary:      Error: site exclusion is stale: lifetime-tax-strategy-lab.html.retired
green-exit:       0
green-summary:    {"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":128,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","
revert-verified:  yes (committed=29c6fe08a58d97c1f119abdd38706cf02f675d60 restored=29c6fe08a58d97c1f119abdd38706cf02f675d60)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

## Change Boundary

**Claim Source:** interpreted. **This section does not close its Definition-of-Done
row, which is left open.**

The row asks for byte-identity across the excluded list. The federal half holds
and the Feature 021 half does not, so the row cannot be ticked as written.

A path-scoped name-only diff was taken from the commit that created the lab
through `HEAD` over every excluded path. These are unchanged and the check is
therefore satisfied for them: `tax-rules/federal/**`, `rltaxstrategy.js`,
`rlportfolio.js`, `rlportfolioanalytics.js`,
`portfolio-survival-allocation.config.json`, `specs/008-*`, `tools.json`,
`index.html`, `rlnav.js`, `README.md`, `notes/README.md`, `watchlist.json` and
`scripts/build-pages-site.mjs`. **The federal pack is byte-identical**, which is
the half of the row that carries the argument: opening the jurisdiction axis
required no federal pack edit, so the axis is a seam.

These excluded paths did change in the same range, and none of the changes belong
to this scope:

| Changed excluded path | Owning commit | Whose work |
| --- | --- | --- |
| `specs/021-*/scopes/01…05/{scope,report}.md` | `5920d9ede` | Feature 021's own scopes closing their own coverage |
| `tests/lifetime-tax-preferential.spec.mjs` | `5920d9ede`, `76252f69f` | Feature 021 and Feature 022 Scope 01, which own that file |
| `tests/lifetime-tax-surtax.spec.mjs` | `e71772915`, `76252f69f` | Feature 022 Scope 02, which owns that file |
| `site-exclusions.json`, `scripts/validate-spec-test-paths.baseline` | outside this scope's commits | other sessions |

None of this scope's own commits — `2eb880a36`, `e2a1993ca`, `7b1b4ea17`,
`518042cf4`, `b3428ad9e`, `8e56bbad2`, `828b3e927`, `e224e77b2` — touches any
excluded path. That was re-verified per commit rather than carried forward: the
only files any of them names outside this scope's own directory are
`scripts/selftest.mjs`, which this scope is required to append to, and one sibling
scope's `scope.md`. Neither `tax-rules/federal/**` nor either `specs/021-*`
directory appears in any of them.

**The second reading of the row was tested and is not available.** "A and B are
byte-identical" would normally compare A against B, which would make the row a
hash comparison between the federal pack and a copy of it held in Feature 021's
spec directory. There is no such copy: that directory holds fourteen Markdown
files and two JSON files, and both JSON files are Bubbles artifacts —
`state.json` and `scenario-manifest.json` — not tax packs. So the row can only
mean "each is unchanged", which is how it is read here.

**Verified state of each half.** `tax-rules/federal/2026.json` has been touched by
exactly one commit in the repository's whole history, `b9d92a3f1`, the commit that
created the lab. It is byte-identical, and that is the half carrying the argument:
opening the jurisdiction axis required no federal pack edit, so the axis is a seam.
`specs/021-lifetime-tax-strategy-lab/` has nine commits after that one, every one
of them Feature 021 closing its own Definition-of-Done items. It is not
byte-identical and could not be, because Feature 021 was still being worked while
this scope ran.

The honest reading is that the row's blanket wording is wrong rather than that the
boundary was breached: `specs/021-*` and the inherited lifetime-tax spec files are
edited by the scopes that own them, and freezing them for the lifetime of this
scope was never achievable.

**Decidable by:** narrowing the excluded list to what *this scope* must not touch
— on the evidence above, `tax-rules/federal/**` alone would be satisfied today —
or restating the row as "no commit of this scope modifies an excluded path", which
is true and is proven per commit above. Both are edits to planning wording and are
owned by `bubbles.plan`, not claims this report may make on its own. The row
therefore stays open.

### The corrected frozen-pack row, executed

**Claim Source:** executed. The paragraphs above are superseded on their verdict:
`bubbles.plan` corrected the row's wording on 2026-08-21 to drop the Feature 021
clause that was never this scope's to hold, and the corrected row is executed here.

**The read-only half, re-taken at the head of this evidence pass.**

```
$ git log --oneline b9d92a3f1..HEAD -- tax-rules/federal/     -> 0 commit(s)
$ git log --follow --oneline -- tax-rules/federal/2026.json   -> 1 commit(s) in the whole history
$ git status --porcelain -- tax-rules/federal/                -> 0 line(s)
```

**Negative control — the comparator is alive, not the tree merely quiet.** The
identical two checks against `scripts/selftest.mjs`, a path this scope legitimately
appends to, must report movement, and do:

```
$ git log --oneline b9d92a3f1..HEAD -- scripts/selftest.mjs   -> 50 commit(s)
$ git status --porcelain -- scripts/selftest.mjs              -> 0 line(s)
```

An all-frozen result across every path checked would have meant the comparator was
dead. It reports 0 for the federal pack and 50 for the control under the same two
commands, so the 0 is a fact about the pack rather than about the check.

**The adversarial case the corrected row must fail.** One bracket edge moved by a
single dollar in `tax-rules/federal/2026.json` — the row's own named perturbation —
must make the frozen assertion fall. Run through the trap-protected harness so the
revert cannot be stranded:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            Scope 03 frozen-pack row: one bracket edge fells the frozen claim
file:             tax-rules/federal/2026.json
mutation:         "lowerInclusive": 24800  ->  "lowerInclusive": 24801   (1 occurrence(s))
command:          sh -c P=$(git status --porcelain -- tax-rules/federal/); N=$(printf %s "$P" | grep -c .); C=$(git log --oneline b9d92a3f1..HEAD -- tax-rules/federal/ | grep -c .); echo "porcelain-lines=$N commits-after-b9d92a3f1=$C"; printf %s "$P"; [ "$N" -eq 0 ] && [ "$C" -eq 0 ]
red-exit:         1
red-summary:      porcelain-lines=1 commits-after-b9d92a3f1=0
green-exit:       0
green-summary:    porcelain-lines=0 commits-after-b9d92a3f1=0
summary-compared: porcelain-lines=1 commits-after-b9d92a3f1=0  vs  porcelain-lines=0 commits-after-b9d92a3f1=0   (elapsed time normalised out)
revert-verified:  yes (committed=28c096427fc9e5b56d3be4854473dfcccb5f3425 restored=28c096427fc9e5b56d3be4854473dfcccb5f3425)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The mutation makes `git status --porcelain -- tax-rules/federal/` report one line
and the frozen check exit 1; reverted, the same command exits 0 with zero lines,
and the revert is hash-verified against the committed blob. The claim is therefore
falsifiable by exactly the edit the row names, which is what the superseded
byte-identity wording could not offer: its true half was unfalsifiable prose and
its false half could never pass.

**The per-commit half** is already recorded above and was re-checked per commit:
none of this scope's commits names a path on the excluded list.

## Claim Boundary

**Claim Source:** executed. **This section closes its Definition-of-Done row.**

An earlier pass left this row open for a sound reason: the output surface did not
exist. `lifetime-tax-strategy-lab.html` carried no residency input, no state panel
and no `StateStageLedger`, so there was no rendered state figure to check. That is
no longer true — the page declares `inputResidencyJurisdiction` and
`inputResidencyPattern`, loads `rltaxstate.js`, and renders a `power-state` band
with a stage table, a pack identity line and an authority line. The row is
therefore decidable now, and it is decided by a persistent assertion rather than
by a one-off scan someone has to remember to repeat.

**What was pinning it before: nothing.** Feature 021's equivalent check scans five
*federal* files — `rltax.js`, `rltaxrules.js`, `rltaxworkspace.js`, the federal
pack and the configuration — and stops there. Every surface this scope added was
outside it. A green suite therefore said nothing at all about this row, which is
the shape of miss this program has found repeatedly.

**What is pinned now.** One appended assertion scans the four surfaces this scope
ships state text from: the module, the Florida pack, the contract fixture pack,
and the static `power-state` band sliced out of the page between its own opening
`div` and the `power-combined` band that follows it.

The row has two clauses and they are not the same shape, so the assertion carries
two rules:

1. **Claim tokens must not appear at all** — `probabilit`, `likelihood`,
   `success rate`, `accuracy`, `track record`, `error rate`, `win rate`,
   `break-even`, `lifetime total`, `expected value` and their compact spellings.
2. **`average` and `estimate` are permitted only where the same line negates
   them.** They legitimately occur twice: the module's refusal text promises *"no
   average, national default or zero is substituted"*, and the band's own
   paragraph says a jurisdiction with no pack *"says so instead of substituting an
   average"*. Both are the right behaviour. A bare occurrence — a figure offered
   *as* an estimate — is the defect, so the rule requires a negator on the line.

The assertion also refuses an empty band slice, because a slice that failed to
match would leave the page silently unscanned while both rules passed over
nothing — the exact failure mode the check exists to prevent.

**Intended RED, rule 1, reverted and hash-verified by the harness.**

```
=== RED/GREEN PROBE EVIDENCE ===
label:            Scope 03 claim boundary: the state module gains a track-record claim in its own header comment
file:             rltaxstate.js
mutation:          * UMD dual module: attaches to the global AND sets module.exports. Never ESM.  ->   * UMD dual module: attaches to the global AND sets module.exports. Never ESM. It publishes a track record.   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:      Research-Lab self-test: 3176 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3177 passed, 0 failed
revert-verified:  yes (committed=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d restored=c88a3ecde15ddb929a5fc67a7ab2f02197e99c0d)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

**Intended RED, rule 2, on the page rather than the module** — because a rule
proven only against the module would leave the band slice unproven, and an
unproven slice is indistinguishable from an empty one:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            Scope 03 claim boundary: the Power state band heading presents the state settlement as an estimate
file:             lifetime-tax-strategy-lab.html
mutation:         <h3>The state settlement, and the jurisdiction that produced it</h3>  ->  <h3>The state settlement, an estimate, and the jurisdiction that produced it</h3>   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:      Research-Lab self-test: 3176 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3177 passed, 0 failed
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Both mutations are value-free: one adds an English phrase to a header comment,
the other adds two words to a heading. Neither carries a rate, a threshold, a
jurisdiction figure or a household amount. In each case exactly one assertion
fell — `3176 passed, 1 failed` against `3177 passed, 0 failed` — so each rule is
shown to be the thing that fires, not a bystander in a wider cascade.

**What this row does not claim.** The scan covers every surface state text is
*written in*. It does not walk the rendered DOM, so a figure composed at runtime
from members that individually carry no forbidden token would not be caught here.
That case belongs to the browser row, and the browser rows for this scope are
open for a separate reason recorded under the Test Plan census.

## Completion Statement

Filled at execution.
