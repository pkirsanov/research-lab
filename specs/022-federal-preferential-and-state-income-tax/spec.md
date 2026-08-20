# Feature: 022 Federal Preferential Completion And State Income Tax (Slice 2)

Feature directory: `specs/022-federal-preferential-and-state-income-tax`
Repository: `research-lab`
Specification owner: `bubbles.analyst`
Design owner: `bubbles.design` — [`design.md`](design.md)
Planning owner: `bubbles.plan` — [`scopes/_index.md`](scopes/_index.md)
Direct predecessor: [`specs/021-lifetime-tax-strategy-lab`](../021-lifetime-tax-strategy-lab/spec.md)

This specification is the direct successor to Feature 021. It resolves the single
largest coverage hole Feature 021 shipped with — the federal preferential rate
table, absent for all four filing statuses — adds the two federal threshold-driven
surtaxes Feature 021 named as unsupported, and opens the jurisdiction axis with a
generic state rule-pack contract plus two deliberately maximally different state
packs.

It inherits Feature 021's contracts, its closed refusal vocabulary, its
`AbsentFigure/v1` discipline and its privacy boundary without weakening any of
them. Where it extends a closed set it does so additively and says so by name.

---

## Problem Statement

Feature 021 shipped an honest tool with a hole in the middle of it. A household
with any long-term capital gain or any qualified dividend — which is most
households doing Roth conversion planning at all — receives
`RLTAX-THRESHOLD-UNAVAILABLE` on `totalFederalTax`, because the preferential rate
table is an `AbsentFigure/v1` for every filing status. The refusal is correct. It
is also the whole answer for the population the tool was built for.

The cause is precise and worth stating exactly, because it is the shape of the
problem this feature exists to solve generally. Rev. Proc. 2025-32 §4.03 states
the *maximum zero rate amount* and the *maximum 15-percent rate amount* for each
filing status. It never states the rate that applies above that maximum. Feature
021's implementer read the section, could not find the rate, and — correctly —
refused rather than recalling it. The pack records that refusal verbatim.

The figure is missing from that document because it is not an inflation-adjusted
figure at all. The 20-percent rate is statutory. An annual inflation Revenue
Procedure has no reason to restate a rate the statute fixes. **The breakpoint and
the rate that applies above it come from two different primary authorities, and
that is correct rather than a workaround.** A rule pack whose provenance model
can only attach one source to one table cannot express that, so it must either
refuse a figure it could honestly carry, or fabricate one. Feature 021's model
forced the first. This feature fixes the model.

The same shape recurs immediately and repeatedly:

- The net investment income tax rate and its thresholds are stated together by
  one authority, but whether those thresholds move with inflation is a property
  of the statute, not of the page that states them.
- California's mental-health-services surcharge rate and threshold are fixed by
  an initiative statute, while its bracket schedule is indexed annually by a
  different publisher on a different cadence.
- Florida's answer is a real zero with a constitutional basis, which is a
  different object from a missing key that happens to render as zero.

Two failure modes still matter more than accuracy, because a user cannot detect
either:

1. **A plausible number in place of a refusal.** A tool that shows a "typical
   state effective rate" has substituted an average for a calculation.
2. **A sourced zero and an unsourced blank rendered identically.** Florida's zero
   is an answer. An unretrieved California bracket is not. If they render the
   same way the tool has destroyed the only distinction it exists to preserve.

---

## Outcome Contract

**Intent.** A household that supplies a filing status, one declared tax year, its
supported income amounts, a deduction mode, its residency state, and the two new
basis declarations, learns four things Feature 021 could not tell it: what its
federal tax actually is when it holds preferential income, what the two federal
threshold surtaxes add, what its state income tax is under a named and dated
state pack, and what the next dollar costs across both jurisdictions at once.
Everything the tool cannot compute is still named, not omitted.

**Success signal.** For the declared tax year, an independent reader can take the
displayed combined result, the displayed reconciliation identity, and the
displayed per-component source records, and re-derive every figure from the cited
primary sources without consulting this repository — including the cases where a
single rate table's breakpoint and rate cite two different authorities. A state
with no individual income tax renders a sourced zero that is visibly distinct
from any refusal. The combined marginal curve names every contributing threshold
with the jurisdiction that owns it.

**Hard constraints.**

- Every rate, bracket, threshold, deduction, credit and exemption in any pack is
  transcribed from a primary source that was actually retrieved, cited inline
  with source title, URL and `retrievedAt`. No figure comes from memory, from a
  secondary site, from interpolation, or from derivation.
- A single rate table may carry **per-component provenance**: a breakpoint citing
  one authority and a rate citing another. This is a first-class contract feature,
  not an escape hatch, and every component resolves to exactly one cited source.
- Whatever a retrieval genuinely fails to establish ships as an
  `AbsentFigure/v1`. That discipline is not weakened to improve coverage.
- Exactly two jurisdictions ship state packs: California and Florida. Every other
  state renders `Unavailable`.
- One declared tax year, and both resolved packs must agree on it.
- Every result field carries a rule status from the closed enum
  `enacted-current-law` · `enacted-scheduled-law` · `user-hypothetical-law` ·
  `unavailable`.
- No probability of any kind. No market simulation. No lifetime projection. No
  break-even year. No ranking. No recommendation.
- No published error rate, self-invalidation statistic, track record or accuracy
  figure anywhere in spec text, scope text or user-facing copy.
- Local-only. Zero network requests at runtime. No household value in any URL,
  query string, hash, request, referrer, console message or committed artifact.
- Educational only. Not tax advice. Does not prepare or file a return.

**Failure condition.** The feature fails — even with every test green — if a user
can read a state figure and be unable to tell whether it is a computed result, a
sourced zero, or a refusal; or if any single figure in any pack cannot be traced
to the one primary source that establishes that specific component.

---

## Resolved Decisions

Four decisions were routed to this specification. Each is resolved below against
sources retrieved in this authoring session, and each retrieval outcome —
including the failures — is recorded.

### RD-1: Per-component provenance is the resolution to the preferential gap

**Decision.** A rate table carries a table-level default citation and an explicit
per-component citation list. Any component whose authority differs from the table
default declares its own `{ sourceRef, locator }`. The federal preferential table
therefore ships with its breakpoints citing Rev. Proc. 2025-32 §4.03 and its
top-band rate citing an IRS authority that states the rate.

**Primary source retrieved in this session**

| Field | Value |
| --- | --- |
| Source title | *Topic no. 409, Capital gains and losses* |
| Source URL | `https://www.irs.gov/taxtopics/tc409` |
| Publisher | Internal Revenue Service |
| Page last reviewed or updated | 25-Feb-2026 |
| Retrieved | 2026-08-17, in this authoring session |
| Retrieval outcome | **Retrieved successfully.** Content read directly. |

The retrieved page states, under *Capital gains tax rates*, that a capital gains
rate of 20 percent applies to the extent that taxable income exceeds the
thresholds set for the 15-percent capital gain rate. It states the 0-percent and
15-percent threshold amounts **for taxable years beginning in 2025**, explicitly
labelled as such.

**Why this establishes the rate and not the breakpoints.** The retrieved page's
own year label is doing the work. Its dollar amounts are tax-year-2025 amounts
and are therefore unusable in a tax-year-2026 pack. Its statement of the rate
carries no year qualifier, which is consistent with the rate being statutory
rather than indexed. The pack therefore takes the top-band rate from this source
and every dollar breakpoint from Rev. Proc. 2025-32 §4.03, which Feature 021's
implementer already retrieved and transcribed for the ordinary schedule.

The 0-percent and 15-percent band rates are established by Rev. Proc. 2025-32
§4.03 itself: that section names its two amounts the *maximum zero rate amount*
and the *maximum 15-percent rate amount*, and those names state the rates. Only
the rate above the maximum 15-percent amount is absent from it. The split is
therefore exact, and it is recorded per band rather than asserted in prose.

**A coverage boundary this retrieval also establishes.** The same page states
three categories taxed above 20 percent: section 1202 qualified small business
stock at a maximum 28 percent, collectibles at a maximum 28 percent, and
unrecaptured section 1250 gain at a maximum 25 percent. The pack's preferential
table is correct only for adjusted net capital gain containing none of these.
That is a named unsupported feature, recorded in `BI-3`, not a silent assumption.

### RD-2: California and Florida were selected deliberately as maximally different regimes

**Decision.** The two shipped state packs are California and Florida, and the
pairing is the point.

**Rationale.** A single state pack does not demonstrate a state rule-pack
contract; it demonstrates one state's arithmetic wearing a contract's clothes.
The contract is only proven when two packs that share almost no structure both
resolve through it without a jurisdiction-named branch anywhere in an engine.

| Axis | California | Florida |
| --- | --- | --- |
| Imposes an individual income tax | Yes | No |
| Bracket count | Many | Not applicable |
| Preferential treatment of long-term gain and qualified dividend | None — taxed as ordinary income | Not applicable |
| Standard deduction | Own amount, indexed, differs by status | Not applicable |
| Exemption relief | Credits applied **after** rate application | Not applicable |
| Surcharge above a high threshold | Yes, and the threshold does not vary by filing status | No |
| Correct result for a resident with income | A computed figure | A **sourced zero** |

Florida is the cheapest possible proof that the architecture handles a genuinely
different regime rather than being California with parameters, and it is the only
one of the two that exercises the sourced-zero path. It is deliberately **not**
deferred: a one-state architecture is not an architecture. California is the hard
case that proves the contract survives contact with a regime whose ordering,
relief mechanism and preferential treatment all differ from the federal model.

Neither state was selected because a household lives there. The tool holds no
identifier and this specification names no household.

### RD-3: Both federal surtaxes ship together, and both require a new declared basis

**Decision.** The net investment income tax and the additional Medicare tax ship
in one scope, because they are the same shape — a rate applied to an excess over
a filing-status threshold — and because their *differences* are what a household
needs to see. Each requires a workspace declaration Feature 021 does not carry,
and an undeclared basis is `RLTAX-INPUT-INCOMPLETE`, never an assumed zero.

**Primary sources retrieved in this session**

| Field | Net investment income tax | Additional Medicare tax |
| --- | --- | --- |
| Source title | *Topic no. 559, Net investment income tax* | *Topic no. 560, Additional Medicare tax* |
| Source URL | `https://www.irs.gov/taxtopics/tc559` | `https://www.irs.gov/taxtopics/tc560` |
| Publisher | Internal Revenue Service | Internal Revenue Service |
| Page last reviewed or updated | 02-Apr-2026 | 01-Jun-2026 |
| Retrieved | 2026-08-17, in this authoring session | 2026-08-17, in this authoring session |
| Retrieval outcome | **Retrieved successfully.** | **Retrieved successfully.** |

What the retrieved pages establish, and the differences that matter:

| Property | Net investment income tax | Additional Medicare tax |
| --- | --- | --- |
| Rate | 3.8 percent | 0.9 percent |
| Applied to | The **lesser** of net investment income, or the excess of modified adjusted gross income over the threshold | The excess of Medicare wages, self-employment income and railroad retirement compensation over the threshold |
| Married filing jointly threshold | 250,000 | 250,000 |
| Married filing separately threshold | 125,000 | 125,000 |
| Single threshold | 200,000 | 200,000 |
| Head of household threshold | 200,000 | 200,000, as one of "all other taxpayers" |
| Tax-exempt state or municipal bond interest | Explicitly **not** net investment income | Not applicable |
| A Roth conversion | Raises modified adjusted gross income, so it can raise this tax | Is not Medicare wages, so it does **not** raise this tax |

The last row is the single most decision-relevant fact this feature adds, and it
is a required scenario rather than a note.

**What the topic pages do not establish.** Neither topic page states that its
threshold amounts apply to tax year 2026, and neither states whether the
thresholds are inflation-adjusted. Topic 409 by contrast labels its amounts with
an explicit tax year. That contrast is evidence, not a citation. On the strength
of the topic pages alone, the applicability of these thresholds to the declared
tax year was recorded as `BI-4`, a blocking implementation input.

**`BI-4` is now closed by a year-labelled authority.**

| Field | Value |
| --- | --- |
| Source title | *Publication 505 (2026), Tax Withholding and Estimated Tax* — "For use in 2026" |
| Source URL | `https://www.irs.gov/publications/p505` |
| Publisher | Internal Revenue Service |
| Retrieved | 2026-08-17, by the implementation dispatch that refused to proceed on the assertion contradiction |
| Retrieval outcome | **Retrieved successfully.** |

This publication carries an explicit year label in its own title, which is the
exact property the two topic pages lack. The retrieval established three things
at once. It states both surtax rates. It states all filing-status thresholds for
both surtaxes. And in Worksheet 2-7 it independently confirms the tax-year-2026
preferential breakpoints and the 20-percent rate, which cross-checks `BI-1` and
`BI-3` against a second authority.

`BI-4` is therefore closed as a **planning** blocker: the question "does a
year-labelled authority for these thresholds exist" is answered, and Publication
505 is an accepted primary authority for both surtax threshold sets. The
[Sourcing Directive](#sourcing-directive) is not relaxed by this closure. The
implementer still opens the publication, transcribes each threshold directly from
it, and records its own `SourceRecord/v2` with its own `retrievedAt`. A threshold
the implementer cannot read for the declared year still ships as an
`AbsentFigure/v1` and its leg still refuses.

The Worksheet 2-7 confirmation is a cross-check under Sourcing Directive rule 5,
not a promotion. It may be recorded in a `retrievalNote` as evidence that a
transcription is correct. It does not become the `sourceRef` of a breakpoint,
which stays with Rev. Proc. 2025-32 §4.03.

### RD-4: Florida ships in Scope 3 alongside the generic contract

**Decision.** Florida ships in the same scope as the state pack contract, not in
the California scope.

**Rationale.** A contract validated only by the pack it was shaped around is not
validated. Florida is small enough to land beside the contract and different
enough to falsify a contract that quietly assumed brackets exist. Shipping it in
Scope 3 means the contract is proven against a second regime **before** California
is written, which is the only ordering under which California cannot silently
become the definition.

**Primary sources retrieved in this session**

| Field | Value |
| --- | --- |
| Source title | *The Florida Constitution*, Article VII, Section 5(a), Estate, inheritance and income taxes |
| Source URL | `https://www.flsenate.gov/Laws/Constitution` |
| Publisher | The Florida Senate |
| Retrieved | 2026-08-17, in this authoring session |
| Retrieval outcome | **Retrieved successfully.** |

The retrieved text of Article VII, Section 5(a) reads, in relevant part, that no
tax upon the income of natural persons who are residents or citizens of the state
shall be levied by the state, or under its authority, in excess of the aggregate
of amounts which may be allowed to be credited upon or deducted from any similar
tax levied by the United States or any state.

| Field | Value |
| --- | --- |
| Source title | *Taxes and Fees or Refunds* |
| Source URL | `https://floridarevenue.com/taxes/taxesfees/Pages/default.aspx` |
| Publisher | Florida Department of Revenue |
| Retrieved | 2026-08-17, in this authoring session |
| Retrieval outcome | **Retrieved successfully.** |

The retrieved page lists every tax and fee the department administers. The list
contains a corporate income tax and does not contain any individual or personal
income tax.

**What these two retrievals do and do not establish.** Together they establish
the constitutional ceiling and the administrative absence. They do **not** state,
in terms, that the rate of Florida individual income tax is zero for the declared
tax year. Reaching that from Article VII, Section 5(a) alone requires knowing the
current value of the federal credit the section refers to, and that value was not
retrieved. Deriving it would be exactly the derivation this feature forbids.

The Florida pack's `imposesIndividualIncomeTax: false` assertion therefore rests
on `BI-5`, a blocking implementation input requiring one further retrieval that
states the absence directly. If that retrieval fails, the assertion ships as an
`AbsentFigure/v1` and Florida resolves `RLTAX-THRESHOLD-UNAVAILABLE`. Holding the
discipline where the answer looks obvious is the point of having the discipline.

### RD-5: California's structural facts are sourced; its dollar figures are not yet

**Decision.** The California pack's *structure* is fixed by this specification
from a retrieved statutory source. Every California dollar figure is a blocking
implementation input.

**Primary source retrieved in this session**

| Field | Value |
| --- | --- |
| Source title | California Revenue and Taxation Code, Division 2, Part 10, Chapter 2, Section 17043 |
| Source URL | `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=RTC&sectionNum=17043` |
| Publisher | California Legislative Information |
| Retrieved | 2026-08-17, in this authoring session |
| Retrieval outcome | **Retrieved successfully.** |

The retrieved section states that for each taxable year beginning on or after
January 1, 2005, in addition to any other taxes imposed by that part, an
additional tax is imposed at the rate of 1 percent on that portion of a
taxpayer's taxable income in excess of one million dollars. It further states
that three provisions do **not** apply to this tax: Section 17039 relating to the
allowance of credits, Section 17041 relating to filing status and recomputation
of the income tax brackets, and Section 17045 relating to joint returns.

Three structural consequences follow directly from the retrieved text, and each
is a required known-value boundary case:

1. The surcharge threshold is one million dollars of taxable income and does
   **not** vary by filing status, because bracket recomputation by filing status
   is excluded.
2. The threshold is **not** doubled for a joint return, because the joint-return
   provision is excluded.
3. Credits are **not** allowed against the surcharge, because the credit
   provision is excluded. A pack that applies its exemption credits to the
   surcharge is wrong, and that is an adversarial test rather than a review note.

**Retrieval failures recorded.** Five distinct California Franchise Tax Board
URLs were attempted in this session for the rate schedules, standard deduction
and exemption credit amounts. All five failed — two returned a content-extraction
failure and three returned HTTP 404. No California dollar figure is asserted
anywhere in this specification or in `design.md`. Every one of them is `BI-6`.

---

## Sourcing Directive

This section is normative and binds every pack in this feature and every pack
that follows it.

1. **Retrieved or absent.** A figure enters a pack only from a primary source the
   pack author retrieved directly, with the retrieval recorded in a
   `SourceRecord/v2` whose `retrievalOutcome` is `retrieved`. There is no third
   state. A figure that cannot be retrieved is an `AbsentFigure/v1`.
2. **No derivation.** A figure is never computed, interpolated, extrapolated,
   inferred from an adjacent figure, carried from another year, recalled, or read
   off a secondary aggregator. A summary release may aid discovery and may be a
   `missingSource` pointer; it may never be the `sourceRef` of a figure.
3. **Per-component citation.** Where the components of a single figure-bearing
   object come from different authorities, each component cites its own. This is
   the normal case, not the exception, and the validator enforces that every
   component resolves to exactly one retrieved source.
4. **The locator is part of the citation.** A `sourceRef` without a `locator`
   naming the section, table or heading is not a citation. A reader must be able
   to open the named document and land on the figure.
5. **Cross-checking is not sourcing.** Agreement between a summary and a detail
   authority may be recorded in a `retrievalNote` as evidence that a
   transcription is correct. It never promotes the summary to a source.
6. **A sourced zero is a figure.** A jurisdiction that imposes no tax carries a
   valued record with a citation, not an absent one and not a missing key.
7. **This specification is not a transcription source.** Figures reproduced in
   this document exist for source-traceability only. This document, a memory, and
   a secondary site are equally unacceptable as a pack value source.

---

## Assertion Supersession Contract

This section is normative. It binds every scope of this feature, and it is written
to be inherited verbatim by Features 023, 024, 025 and 026, each of which meets
this situation the first time it changes behaviour an earlier feature pinned.

### The contradiction it resolves

Feature 021 is green, and its assertions pin the behaviour it shipped. That
behaviour includes the **absence** of the federal preferential rate tables: the
selftest asserts all four tables are value-free `AbsentFigure` records, that a
household holding a long-term gain is refused on its total, and that the gain
curve refuses. Scope 01 of this feature exists to remove that absence.

Read as an absolute, "never edit a pre-existing assertion" forbids the work this
feature was approved to do. Read correctly, it never forbade it. The prohibition
that matters is on **weakening a test so broken code passes**. It is not a
prohibition on a later, approved scope deliberately changing product behaviour
that an earlier assertion pinned. This section separates the two cases
mechanically so no implementer has to judge the difference under pressure.

### The distinction

| | Weakening — always forbidden | Supersession — permitted under the rules below |
| --- | --- | --- |
| What changed first | The implementation broke | An approved scope deliberately changed the behaviour |
| Why the assertion is touched | It is in the way | It pins a fact that is no longer the fact |
| What replaces it | Something looser, or nothing | A named replacement that is at least as strong |
| The original protection | Lost | Preserved in the new world |
| Who is served | The implementer's schedule | The reader's ability to trust the tool |
| Discoverable afterwards | Only by reading the diff | By reading the ledger below |

A red suite is evidence of one of these two situations. It is never, by itself,
evidence of which one.

### Admission rules

| ID | Rule |
| --- | --- |
| ASC-1 | **Cause.** An assertion may be superseded only when an approved scope of this feature deliberately changes the behaviour it pinned, and only when that scope's requirement coverage names the `FR-022-*` or `NFR-022-*` requirement mandating the change. Convenience, difficulty, a red suite, a deadline and a large diff are never sufficient cause. An assertion that fails for any other reason is a defect in the change, and the change is fixed. |
| ASC-2 | **Individual naming.** Every superseded assertion is named individually in the ledger below before the change is made: the file, the approximate line, the exact clause it asserted, the `SCN-022-*` scenario and the scope that change it, and why the change is deliberate. A group, a file, a test suite and a "related assertions" phrase are not names. A supersession discovered during implementation and absent from the ledger stops the scope and returns to planning. |
| ASC-3 | **Same-change replacement.** Every superseded assertion is replaced in the same change by a named assertion that preserves the original protection in the new world. Deletion without a named replacement is forbidden. A replacement deferred to a later scope is a deletion. |
| ASC-4 | **At least as strong, and derived.** The replacement asserts everything the original asserted that is still true, plus the rule the new behaviour introduces. Where the original was a brittle literal, the replacement derives its expected value from the artifact it describes — the pack, the settled record, the rendered page — so it cannot rot into a false green. A merely equal replacement is accepted only where the original clause was already derived. |
| ASC-5 | **Adversarial case.** Every replacement carries at least one adversarial case that fails if the new behaviour regresses to the old defect, and at least one that fails on a fabricated figure. A guard nobody has seen fail is not a guard. |
| ASC-6 | **Ledger.** The ledger below is the audit surface. Each entry records what protection was traded for what, and an auditor reads it without reading the diff. Each delivered replacement carries a `SUP-022-NN` marker beside it in the source, so the ledger and the code are greppable against each other. |
| ASC-7 | **No vacuous branch.** Where a replacement splits an assertion into a branch for the new behaviour and a retained branch for the old, the retained branch runs against a fixture the implementer controls, never against a pack state that may be empty. An `every()` over an empty set passes and proves nothing, so the replacement also asserts the retained branch was exercised at least once. |

### What this contract does not permit

- Relaxing a sourcing rule. An unretrieved figure still ships as an
  `AbsentFigure/v1` and its leg still refuses. No entry in this ledger touches the
  [Sourcing Directive](#sourcing-directive), and none ever may.
- Loosening a tolerance, widening a numeric range, converting an equality to an
  inequality, or replacing a value assertion with a truthiness check.
- Deleting an adversarial case, a determinism assertion, a privacy assertion, a
  zero-network assertion, or a Feature 008 byte-identity canary. None of these
  pins behaviour any scope of this feature changes, so none is ever eligible.
- Removing a Playwright test, renaming a persistent test title, or changing a
  `--grep` selector. Titles are the browser-row contract and stay byte-identical.
- Superseding an assertion belonging to a feature this feature does not extend.
- Changing the pre-existing selftest pass count downward. A supersession replaces
  assertions one for one or upward, never downward.

### Supersession ledger

Twenty-two pre-existing assertions are superseded, each by a named stronger
replacement. **Twelve are owned by Scope 01, nine by Scope 02 and one by Scope
03.** Scopes 04 and 05 own none. Exactly two entries — SUP-022-04 and SUP-022-09
— are amended by
Scope 02 after Scope 01 delivers them, and each amendment is named in its entry.
No other entry needs a later edit, because every replacement derives its expected
value from the artifact it describes and therefore absorbs the growth a later
scope introduces.

The total is stated in three places and the three must agree: this paragraph, the
`Owning scope` column below, and step 4 of `design.md`'s
[marker check](design.md#the-marker-check). A disagreement between them is a
planning defect and stops the scope that finds it.

**How this ledger reached twenty-two.** SUP-022-01 … SUP-022-09 were admitted when
this contract was written. SUP-022-10 … SUP-022-13 were admitted after an
implementation dispatch stopped on four assertions the first ledger did not reach
— the stop the contract exists to produce. SUP-022-14 … SUP-022-19 were admitted
by the planning sweep that followed, which read every shipped-pack assertion in
the Feature 021 Scope 02, 03, 04 and 05 selftest groups and every literal count in
all five Feature 021 Playwright specs. SUP-022-20 and SUP-022-21 were admitted by
the browser-completion pass, which ran the five Feature 021 Playwright specs
against the delivered engine and found two more assertions the sweep had cleared
or not reached — one of them already edited in the source with a marker and no
ledger row, which is exactly the drift ASC-6 exists to surface. SUP-022-22 was
admitted by the Scope 03 implementation dispatch, which stopped on the
refusal-vocabulary count the moment the two jurisdiction-axis members were added.
The
[assertions considered and not superseded](#assertions-considered-and-not-superseded)
table below records what that sweep examined and cleared, so a later reader can
tell a cleared assertion from an unexamined one.

**The `Disposition` column is the marker check's tolerance, read at run time.**
Every row carries exactly one of three dispositions, and the marker check derives
its expectation from this column instead of pinning a literal list of ids:

| Disposition | Meaning | What the marker check asserts |
| --- | --- | --- |
| `marker required` | The replacement is this feature's to deliver | The id **must** appear as a marker in one of the scanned files. A row that goes unmarked fails. |
| `marker forbidden — <reason>` | Every clause the row named was displaced by another feature before this one reached it | The id **must not** appear as a marker anywhere. Attaching one would attribute a single replacement to two features, which is the double-count the marker discipline exists to prevent. |
| `marker pending — <reason>` | The row is real, deliverable work that has not landed yet | The id **may** be absent or present. Its later delivery therefore shrinks the tolerated gap without falsifying the check. |

A `marker forbidden` or `marker pending` disposition is only valid when it carries
a reason after the em dash, so the column cannot be used to silence a failure by
writing a bare token. The tolerated set may never cover the whole ledger: a
disposition column that dispositioned every row away fails rather than passing
vacuously. This is why the tolerance is a column and not a literal — the previous
form compared the unmarked set with the fixed pair `SUP-022-18` and `SUP-022-19`,
which turned red the moment either was legitimately delivered, so genuine work
could not land without editing an assertion a different scope owns.

| ID | Target | Owning scope | Amending scope | Disposition | Protection traded for |
| --- | --- | --- | --- | --- | --- |
| SUP-022-01 | `scripts/selftest.mjs` ~L11244 — `citedFigures.length === 8` | 01 | — | marker required | A pack-derived count plus full `ComponentSource` validity on every figure and every override |
| SUP-022-02 | `scripts/selftest.mjs` ~L11461 — four preferential tables are value-free `AbsentFigure` | 01 | — | marker required | Present tables prove split-authority provenance; absent tables keep the original clause verbatim |
| SUP-022-03 | `scripts/selftest.mjs` ~L11461 — `requiredUnsupportedIds` contains both surtax ids | 02 | — | marker required | A disjoint, exhaustive accounting between `unsupportedFeatures[]` and `taxLegs[]` |
| SUP-022-04 | `scripts/selftest.mjs` ~L11861 — `noticeIds.length === 18` | 01 | 02 | marker required | Two-directional set identity between surfaced notices and pack entries |
| SUP-022-05 | `scripts/selftest.mjs` ~L11781 — shipped pack plus a gain household refuses the total, `L4` not-evaluable | 01 | — | marker required | A valued, reconciling total for resolved statuses; the refusal rule moves onto a permanent fixture |
| SUP-022-06 | `scripts/selftest.mjs` ~L12156 — gain curve and dividend curve both refuse | 01 | — | marker required | Exact crossings at every carried breakpoint plus gain/dividend curve identity; refusal retained on a fixture |
| SUP-022-07 | `tests/lifetime-tax-federal.spec.mjs` L57-81 — gain-stacking expectations assume refusal | 01 | — | marker required | A quantitative stacking assertion derived from the pack, plus an explicit empty-state rule |
| SUP-022-08 | `tests/lifetime-tax-marginal.spec.mjs` L96 — `Unavailable contributors: 14` and gain-curve refusal | 02 | — | marker required | Label/list agreement, pack-derived set identity, and positive proof the surtax moved rather than vanished |
| SUP-022-09 | `tests/lifetime-tax-foundation.spec.mjs` L60-71 — contributor count 14 and absent-figure count 4 | 01 | 02 | marker required | Both counts derived from the pack; per-node quality clauses retained untouched |
| SUP-022-10 | `scripts/selftest.mjs` ~L12070 (TP-03-07) — `unavailableContributors.length === 14` on the **shipped** curve pack, plus `requiredContributors` asserting the investment-income surtax is present | 02 | — | marker required | Pack-derived two-directional contributor-set identity plus the engine-side moved-versus-deleted proof |
| SUP-022-11 | `scripts/selftest.mjs` ~L12416 (Feature 021 Scope 04 group) — `gainBearingComparison.federalTaxDifference` refuses with no `value` | 01 | — | marker required | A valued difference equal to an independent recomputation; the refusal moves onto the absent-table fixture |
| SUP-022-12 | `tests/lifetime-tax-foundation.spec.mjs` L66-73 (SCN-021-002) — the gain household renders a visible refusal and zero valued-headline nodes | 01 | — | marker required | A valued headline that moves by the pack-implied amount; the refusal clauses retained verbatim on an absent-table branch |
| SUP-022-13 | `tests/lifetime-tax-marginal.spec.mjs` L121 (SCN-021-009) — `#gainCurveBlock [data-rl-unavailable]` contains `RLTAX-THRESHOLD-UNAVAILABLE` | 01 | — | marker required | A rendered gain curve exact at every carried breakpoint and identical to the dividend curve; the refusal retained on a substituted absent-table pack |
| SUP-022-14 | `scripts/selftest.mjs` ~L11803 (TP-02-05) — `legIds === 'L1,L2,L3,L4,L5'` and the five-leg `holds` claim | 02 | — | marker required | Ordered leg-set identity against the engine's own declaration, plus the `L6` exclusion clause |
| SUP-022-15 | `tests/lifetime-tax-federal.spec.mjs` L108-111 (SCN-021-006) — `#reconciliationBody tr` `toHaveCount(5)` and the literal-bounded `holds` loop | 02 | — | marker required | A record-derived row count and a loop bounded by the rendered rows |
| SUP-022-16 | `tests/lifetime-tax-route.spec.mjs` L80 (SCN-021-013) — `#reconciliationBody tr` `toHaveCount(5)` | 02 | — | marker required | The same record-derived row count, in the file that owns this rendering |
| SUP-022-17 | `tests/lifetime-tax-route.spec.mjs` L82 (SCN-021-013) — `#sourceRecordList li` `toHaveCount(2)` | 01 | — | marker required | A pack-derived count, two-directional title identity, and the referrer guard extended from the first link to every link |
| SUP-022-18 | `scripts/selftest.mjs` ~L12450 (TP-05-01) — `simpleFields.length === 7`, `powerLinkDetails.length === 9`, `powerLinkSections.length === 9` | 02 | — | marker forbidden — every clause it named was displaced by SUP-023-04 and SUP-023-05 before this feature reached it; row retained, never delivered | Cross-artifact identity between the closed Simple list and the rendered Simple markup; every Simple-stays-decision-level clause retained verbatim |
| SUP-022-19 | `tests/lifetime-tax-route.spec.mjs` L54-62 (SCN-021-013) — withheld-detail links `toHaveCount(9)` and the positional `links.nth(3)` focus expectation | 02 | — | marker pending — narrowed by SUP-023-06 to the declared-target clause alone, which is real work Scope 02 still owes | Two-directional link/section identity and a selection by declared target instead of by ordinal |
| SUP-022-20 | `scripts/selftest.mjs` ~L12327 (TP-03-05) — the ordinary curve's step-level list and the probe-WIDTH step selector | 02 | — | marker required | A pack-derived declared-edge set, a step selector keyed on the segment's own step-ness, and a labelling honesty clause over every probe-width segment |
| SUP-022-21 | `tests/lifetime-tax-federal.spec.mjs` L132 (SCN-021-005) — `#power-rule-ledger` `toContainText('preferentialRateTables')` | 01 | — | marker required | The Power panel names the preferential schedule as a carried rule and renders its split authority, instead of an internal member name a reader never sees |
| SUP-022-22 | `scripts/selftest.mjs` ~L11379 (TP-01-05) — `Object.keys(RLTAXRULES.RLTAX_CODES).length === 12` | 03 | — | marker required | A count derived from the module's own declaration, all twelve Feature 021 members named and asserted present, and the two added members named and asserted to be exactly the jurisdiction-axis pair |

#### SUP-022-22 — the refusal-vocabulary count stops being a literal

**Superseded.** `Object.keys(RLTAXRULES.RLTAX_CODES).length === 12`, the first
clause of `TP-01-05`. Every other clause of that assertion is retained verbatim.

**Cause.** `SCN-022-008`, Scope 03, under `FR-022-016`, `FR-022-017` and
`FR-022-018`. Those requirements need a refusal for an unsupported residency
**pattern** that is not the jurisdiction code, and `FR-022-034` needs a refusal
for a disagreement between two individually valid packs that is not the
single-pack year code. `design.md`'s
[closed refusal enum](design.md#the-closed-rltax-refusal-enum) states fourteen
members for exactly that reason. The literal twelve therefore becomes false the
moment the jurisdiction axis exists, and it becomes false whatever the
implementation does.

**Why this entry was admitted during implementation.** Scope 03's planning text
declares that it owns no supersession, and its Shared Infrastructure Impact Sweep
instead asks for an assertion that the twelve Feature 021 members retain their
meaning. Both statements are compatible with a count that must change, and the
planning sweep did not reach `TP-01-05`. The scope stopped on the failing
assertion rather than editing it silently, which is the stop `ASC-2` exists to
produce, and this entry is the result. It is flagged for audit.

**Replacement.** The count is derived by parsing the `RLTAX_CODES` declaration
out of `rltaxrules.js` and asserting the parsed key set equals the live key set,
so the assertion describes the artifact rather than a number a reader must trust.
All twelve Feature 021 members are then named individually and asserted present,
the two added members are named individually and asserted present, and the live
set is asserted to contain nothing outside those two named lists. The frozen-map
clause, the numeric-free-construction clause, the unknown-code clause and the
four-member `RuleStatus` clause are all retained verbatim.

**Adversarial cases.** A vocabulary with a Feature 021 member removed is shown to
fail the twelve-member clause, and a vocabulary with a fabricated fifteenth
member is shown to fail the closed-set clause. The guard is therefore one that
has been seen to fail.

#### SUP-022-01 — the cited-figure count stops being a literal

**Superseded.** `citedFigures.length === 8`, in the assertion that all eight
present figures — four standard deductions and four ordinary rate tables — cite
the retrieved revenue procedure with a locator and none cites the newsroom
summary.

**Cause.** `SCN-022-002`, Scope 01, under `FR-022-004`. The four preferential
tables become present figures, so the literal becomes twelve for a fully retrieved
pack and fewer for any status that stays absent. The number was never the point.

**Replacement.** Derive the expected count from the pack: count the members of
`standardDeductions`, `ordinaryRateTables` and `preferentialRateTables` across the
supported filing statuses that are not `AbsentFigure`, and assert the collected
list length equals that derived count. Then assert, for every cited figure **and
for every `componentSources[]` override on it**, that `effectiveSourceFor`
resolves to a `SourceRecord` whose `retrievalOutcome` is `retrieved`, whose
`documentKind` is not `newsroom-release`, whose `url` is a non-empty absolute URL,
whose `retrievedAt` parses as an ISO-8601 instant that is not in the future, and
whose effective `locator` is non-empty. Keep the newsroom exclusion as a positive
assertion that the summary record is cited by zero figures and zero overrides.

**Why it is stronger.** The original checked one literal count and one hardcoded
`sourceRef` string on figure defaults only. The replacement checks every figure
and every component override, and it checks the retrieval outcome, the document
kind, the URL, the timestamp validity and the locator. It also stops rotting,
because the count now comes from the pack that the assertion describes.

**Adversarial cases.** A pack whose preferential top-band override cites a
`not-retrieved` record must fail. A pack whose override carries an empty or
future-dated `retrievedAt` must fail. A pack that adds a present figure carrying
no citation at all must fail the derived-count identity — this is the
fabricated-figure case, and it is exactly what the old literal could not see.

#### SUP-022-02 — absence proven per status instead of asserted for all four

**Superseded.** The clause asserting that all four `preferentialRateTables[status]`
members are `AbsentFigure` with code `RLTAX-THRESHOLD-UNAVAILABLE`, a non-empty
reason, a `missingSource.title`, and no `value`, `rate` or `bands` member.

**Cause.** `SCN-022-001` and `SCN-022-002`, Scope 01, under `FR-022-001` through
`FR-022-004`. This is the entire purpose of the scope.

**Replacement.** Partition the four statuses by what the implementer's retrieval
actually established, and assert both branches.

For every status whose table is present: `contractVersion` is `RateTable/v2`;
every band edge's effective citation resolves to the revenue-procedure record with
a locator naming its section; the top band's rate carries an explicit
`componentSources[]` override whose `sourceRef` is a **different** `sourceId` from
the breakpoint source and whose record is retrieved and non-newsroom; no band
silently inherits the other band's override, proven by asserting that
`effectiveSourceFor` reports `inherited` for exactly the components carrying no
override and `overridden` for exactly those that do; and **for every component,
the pack's declared tax year is contained in the years that component's effective
source record declares for that component's kind** — so a 2025-labelled authority
can never supply a 2026 breakpoint even while it legitimately supplies a rate the
same document states without a year qualifier.

The containment clause is evaluated **per component kind**, not against one flat
year list on the source record. That refinement is not cosmetic: with a single
whole-record year list, either the legitimate `band:b3:rate` override fails
containment or `TP-01-07`'s breakpoint-substitution adversarial case can never
fire, and the two cannot both hold. The mechanical rule — the closed component-kind
set, the `SourceRecord/v2` map, the `year-invariant` value and the cited basis it
requires — is fixed in
[`design.md`](design.md#per-component-kind-year-containment).

For every status whose table is absent: retain the original clause **verbatim** —
value-free `AbsentFigure`, `RLTAX-THRESHOLD-UNAVAILABLE`, non-empty reason,
`missingSource.title`, no `value`, no `rate`, no `bands`.

Per ASC-7, the absent branch also runs against the provenance fixture pack, so it
is exercised at least once even if every shipped status resolves.

**Why it is stronger.** The original protection was that absence is never faked.
That clause survives unchanged for every absent status and is made permanent by
the fixture. On top of it, the present branch proves the split-authority rule this
feature exists to introduce, which the original could not express at all.

**Adversarial cases.** A present table carrying a `value` smuggled beside its
bands must fail. A top-band rate that inherits the breakpoint citation must fail
the distinct-authority clause. Breakpoints overridden to the rate authority must
fail the tax-year containment clause. A table shipping with a `rate` and no
`bands` must fail both branches.

#### SUP-022-03 — unsupported features accounted for instead of listed

**Superseded.** The membership of `net-investment-income-tax` and
`additional-medicare-tax` in the literal `requiredUnsupportedIds` array.

**Cause.** `SCN-022-004` and `SCN-022-005`, Scope 02, under `FR-022-009` and
`FR-022-011`. Both become computed legs. A pack that computes a tax and still
names it unsupported is a different defect, so the two ids must leave that list.

**Replacement.** Derive the requirement from the pack rather than pinning an
array. Assert the `unsupportedFeatures[]` id set and the declared `taxLegs[]` id
set are **disjoint** — nothing is both computed and named unsupported. Assert
every id in Feature 021's original eighteen-member list is now in exactly one of
the two sets, so no id may disappear from both. Assert every `unsupportedFeatures[]`
entry carries a non-empty reason and a named successor feature. Assert every
marginal-contributor id resolves into exactly one of the two sets.

**Why it is stronger.** The original pinned membership of a literal list, so a
feature quietly dropped from the pack with no successor still passed as long as
the named eighteen stayed. The replacement makes disappearance impossible: every
id is accounted for on one side or the other, and the sides may not overlap.

**Adversarial cases.** Deleting `premium-tax-credit` from `unsupportedFeatures[]`
without adding a leg must fail the accounting assertion. Listing
`net-investment-income-tax` in both sets must fail disjointness. Declaring a leg
that computes nothing must fail the computed-leg clause.

#### SUP-022-04 — notice surfacing proven by set identity instead of a count

**Superseded.** The `noticeIds.length === 18` clause. The sibling clause
`noticeIds.length === settlePack.unsupportedFeatures.length` is **not** superseded;
it was already derived and it survives untouched.

**Cause.** Scope 01 adds three preferential categories under `FR-022-006`, and
Scope 02 removes the two surtax ids under `FR-022-009` and `FR-022-011`. Scope 01
owns the entry and Scope 02 amends the named spot checks.

**Replacement.** Delete only the literal. Assert the surfaced notice id set equals
the pack's `unsupportedFeatures[]` id set exactly, in **both** directions, so
neither a surfaced notice with no pack entry nor a pack entry with no surfaced
notice can pass. Assert every notice carries the reason and the successor from its
pack entry verbatim. Retain the three existing named spot checks; Scope 01 adds
the three preferential category ids and Scope 02 removes the two surtax ids, each
named in this entry.

**Why it is stronger.** A count only ever detected a count change. Two-directional
set identity additionally detects a substitution that a count hides — one notice
dropped and another added in the same change.

**Adversarial cases.** Surfacing eighteen notices for a nineteen-entry pack must
fail. Swapping one notice id for another while holding the count constant must
fail set identity, which the literal could not detect. Surfacing a notice whose
reason text differs from the pack entry must fail the verbatim clause.

#### SUP-022-05 — the missing-leg rule moves onto a permanent fixture

**Superseded.** The clause asserting that, for the shipped pack, a household with
a long-term gain receives `RLTAX-THRESHOLD-UNAVAILABLE` on `preferentialTax`,
`totalFederalTax` and `averageRate`, with reconciliation leg `L4` in state
`not-evaluable`.

**Cause.** `SCN-022-002`, Scope 01, under `FR-022-004` and `FR-022-005`. That
household is the one this feature exists to answer.

**Replacement.** Split by pack capability rather than delete. For a status whose
preferential table resolved: `totalFederalTax` is a valued record carrying a rule
status, `L4` is in state `holds`, `reconciliation.balanced` is true, and the total
equals ordinary tax plus preferential tax within the pack's declared tolerance.
Retain the **entire** original refusal assertion, clause for clause, against a
fixture pack whose preferential table is absent.

**Why it is stronger.** The original proved the missing-leg rule against a pack
state that was about to disappear, so it would have been silently lost. Moving it
onto a fixture makes it permanent: it keeps proving "an unavailable leg refuses
the total by name rather than treating the missing leg as zero" for every future
feature, including after every status resolves. The valued branch is new coverage
added on top of a protection that was preserved rather than traded.

**Adversarial cases.** Treating an absent preferential leg as zero and returning a
total must fail the fixture branch. Returning a total while `L4` breaks must fail
the reconciliation clause. Returning a plausible total for the absent-table
fixture — the fabricated-figure regression — must fail.

#### SUP-022-06 — the curve refusal retained on a fixture, exactness added on the pack

**Superseded.** The clause asserting that, for the shipped pack, the qualified
dividend curve and the long-term gain curve both refuse
`RLTAX-THRESHOLD-UNAVAILABLE` and carry neither a `points` nor a `value` member.

**Cause.** `SCN-022-002`, Scope 01, under `FR-022-004` and `FR-022-005`. Both
curves become computable once the preferential table is present.

**Replacement.** For the shipped pack: both curves are records carrying `points`;
every point carries an effective marginal rate; every preferential breakpoint the
pack carries appears as an exact crossing pair rather than a grid position; and
the gain curve and the dividend curve are identical for identical amounts, which
proves `FR-022-005`'s pooling rule on the curve rather than only on the total.
Retain the original refusal assertion **verbatim** against the absent-table
fixture pack, including the two `hasOwnProperty` clauses that prove a refusal
never smuggles a shape.

**Why it is stronger.** The original proved a refusal. The replacement proves the
refusal still holds where it belongs, and additionally proves the computed curve
is exact at every carried breakpoint and identical across the two pooled kinds.

**Adversarial cases.** Dropping the preferential leg from the curve and returning
a curve anyway must fail the exact-crossing assertion. Pricing dividends
differently from gains must fail the identity. Returning a curve for the
absent-table fixture must fail the retained refusal.

#### SUP-022-07 — the stacking regression asserts stacking instead of refusal

**Superseded.** In `Regression: SCN-021-005 long term gains stack on ordinary
income`: the expectations that a visible `RLTAX-THRESHOLD-UNAVAILABLE` refusal
appears for the gain household and for the dividend household, and that zero
`[data-rl-value="headlineFederalTax"]` nodes exist.

**Cause.** `SCN-022-002`, Scope 01, under `FR-022-004` and `FR-022-005`. The route
now renders a valued headline for exactly that household.

**Replacement.** Keep the test title byte-identical, so the persistent-title
`--grep` contract and the spec-test-path baseline are untouched. Replace the
refusal expectations with the behaviour the scenario was always named for.
Assert the headline is a valued figure. Assert that raising the gain across a
carried preferential breakpoint moves the headline by the amount the pack's own
table implies, so the test proves the gain **stacks** rather than merely that a
number appeared. Assert the qualified-dividend household produces a headline
identical to the gain household of the same amount. Retain the Power-panel clauses
that prove the rule ledger names `preferentialRateTables` and that the
absent-figure inventory renders its `missingSource`, re-pointed at whatever
remains absent. If every status resolved, assert the inventory is empty **and**
that the empty state renders an explicit "no absent figures" record rather than a
blank region.

**Why it is stronger.** The original asserted that a refusal appeared. The
replacement asserts a quantitative stacking relationship derived from the pack,
which is a strictly stronger claim about the same scenario. It also closes a hole
the original never covered: a blank region and a sourced empty state were
indistinguishable, which is the feature's own central failure mode.

**Adversarial cases.** Pricing the gain at the ordinary rate moves the headline by
the wrong amount and must fail. Rendering an empty absent-figure region with no
record must fail the explicit-empty-state assertion. Fabricating a headline while
the pack table is absent must fail, because SUP-022-05's fixture branch still
refuses.

#### SUP-022-08 — contributor list proven by accounting instead of a literal count

**Superseded.** In `Regression: SCN-021-009 unsupported thresholds are named
unavailable contributors and the curve is labeled incomplete`: the
`Unavailable contributors: 14` text expectation, the `toHaveCount(14)`
expectation, and the presence of `marginal-contributor:net-investment-income-tax`
in the rendered domain list.

**Cause.** `SCN-022-004` and `SCN-022-006`, Scope 02, under `FR-022-009`. The net
investment income tax becomes a computed leg, so it stops being an unavailable
contributor and the count falls.

**Replacement.** Stop asserting a literal. Assert that the rendered label count
equals the number of rendered contributor nodes, so the label can never disagree
with the list. Assert the set of rendered contributor domains equals the pack's
declared unavailable-contributor set exactly, in both directions. Assert every
rendered contributor carries a code, a reason and a remediation. Assert
`net-investment-income-tax` is **absent** from the contributor list **and present
as a computed leg** — the positive proof that Scope 02 moved it rather than merely
deleting it. Assert `taxable-social-security-benefits`, `irmaa-bands` and
`premium-tax-credit` are still present, so the removal is proven surgical.

**Why it is stronger.** The moved-versus-deleted clause is protection the original
could not express. The original would have passed if the contributor had been
deleted from the page and never computed anywhere, which is precisely the
convenient regression this feature must not permit.

**Adversarial cases.** Removing `net-investment-income-tax` from the contributor
list without adding the computed leg must fail. Rendering a label of one count
beside a list of another must fail. Dropping `irmaa-bands` must fail the surgical
clause.

#### SUP-022-09 — both foundation counts derived, quality clauses untouched

**Superseded.** The rendered unavailable-contributor count of 14 and the rendered
absent-figure count of 4.

**Cause.** Scope 01 changes the absent-figure count under `FR-022-004`; Scope 02
changes the contributor count under `FR-022-009`. Scope 01 owns the entry and
Scope 02 amends it.

**Replacement.** Derive both counts from the shipped pack. Assert the rendered
absent-figure count equals the number of `AbsentFigure` members the pack actually
carries, and assert the rendered contributor count equals the pack's declared
unavailable-contributor count. Retain both quality clauses **unchanged**: every
rendered node carries an `RLTAX-` code, and every rendered node carries
"What would make it available:". Add the empty-state rule: when either count is
zero, the region renders an explicit record stating so and never a blank.

**Why it is stronger.** The counts stop rotting, the per-node quality clauses
survive untouched, and the empty-state rule closes the blank-versus-zero hole that
a literal count of four never had to consider.

**Adversarial cases.** Rendering four absent figures for a pack carrying three
must fail. Rendering a blank region for a zero count must fail. Dropping the
remediation text must fail the retained clause.

#### SUP-022-10 — the shipped curve's contributor count follows the pack

**Superseded.** In `TP-03-07`: `shippedOrdinaryCurve.unavailableContributors.length
=== 14`, and the `requiredContributors` membership clause asserting that
`marginal-contributor:net-investment-income-tax` is present in the rendered domain
list. The assertion message naming fourteen is superseded with them.

**Why SUP-022-08 does not reach it.** SUP-022-08 supersedes the same *claim* about
the same *tax*, but its `Target` names `tests/lifetime-tax-marginal.spec.mjs L96`
— a browser expectation over the rendered page. This clause lives in
`scripts/selftest.mjs` and asserts over `shippedOrdinaryCurve`, computed from
`curvePack`, the **shipped** federal pack read at ~L11889, which the sibling
`curveFixturePack` never replaces. ASC-2 requires a file, a line and a clause; a
different file at a different line is a different assertion, and "the related one
in the selftest" is exactly the phrase ASC-2 refuses to accept as a name.

**Cause.** `SCN-022-004`, Scope 02, under `FR-022-009`. The net investment income
tax becomes a computed leg and therefore leaves `unsupportedFeatures[]` under
SUP-022-03, so the pack-derived contributor list falls to thirteen.

**Replacement.** Shape `derive`. Stop asserting a literal count and stop asserting
membership of a hand-written array. Assert that the curve's contributor id set
equals the set of the shipped pack's `unsupportedFeatures[]` entries whose
`movesMarginalRate` is `true`, in **both** directions, so neither a surfaced
contributor with no pack entry nor a pack entry with no surfaced contributor can
pass. Retain `incomplete === true` and `unavailableContributorCount ===
unavailableContributors.length` and the four per-record quality clauses —
`TaxUnavailable/v1`, a code drawn from `RLTAX_CODES`, a non-empty reason, a
non-empty remediation — **verbatim**. Replace the `requiredContributors` array with
two named clauses: `taxable-social-security-benefits`, `irmaa-bands` and
`premium-tax-credit` are still present, which proves the removal was surgical; and
`net-investment-income-tax` is **absent from the contributor set and present in
`taxLegs[]` as a declared leg whose figure resolves**, which is the engine-side
twin of SUP-022-08's browser-side moved-versus-deleted proof.

**Why it is stronger.** The original could not distinguish a contributor that
became computable from a contributor that was deleted, and a count could not see a
substitution at constant length. Two-directional set identity plus the
moved-versus-deleted clause closes both, and the count now follows the pack rather
than rotting.

**Adversarial cases.** Removing the id from `unsupportedFeatures[]` without
declaring the computed leg must fail. Adding a `movesMarginalRate: true` entry the
curve never surfaces must fail the pack-to-curve direction. Surfacing a
contributor with no pack entry must fail the curve-to-pack direction. Swapping one
contributor for another at constant count must fail set identity.

#### SUP-022-11 — the conversion comparison's preferential refusal moves onto a fixture

**Superseded.** In the closing assertion of the Feature 021 Scope 04 conversion
group: `RLTAXRULES.isUnavailable(gainBearingComparison.federalTaxDifference)`,
`codeOf(gainBearingComparison.federalTaxDifference) ===
'RLTAX-THRESHOLD-UNAVAILABLE'`, the non-empty `whatWouldMakeItAvailable` clause,
and `!hasOwnProperty(gainBearingComparison.federalTaxDifference, 'value')`.

**Why SUP-022-05 does not reach it.** SUP-022-05 is scoped to `~L11781` in the
Feature 021 Scope 02 settlement group and to a different record produced by a
different function: `computeAnnualFederalTax`'s `preferentialTax`,
`totalFederalTax` and `averageRate`, plus reconciliation leg `L4`. This clause is
in the Scope 04 conversion group and asserts over
`ConversionComparison/v1.federalTaxDifference`, produced by
`compareConversionPolicies` from `strategyPack` — the **shipped** pack read at
~L12170, which `strategyFixturePack` is never substituted for in this assertion.

**Cause.** `SCN-022-002`, Scope 01, under `FR-022-004` and `FR-022-005`. Once the
preferential table resolves, a gain-bearing household's conversion difference is
computable, and a comparison that still refused it would be the defect.

**Replacement.** Shape `relocate`. For the shipped pack: `federalTaxDifference` is
a valued record carrying a rule status; it equals the difference between two
independent full settlements at the converted and unconverted income, which is the
identity `TP-04-04` already asserts for the gain-free household and which is now
asserted for the gain-bearing one; and it differs from the marginal-rate product,
which proves the comparison still sees the preferential dollars the conversion
pushed across a band. Retain the **entire** original refusal clause, both
`hasOwnProperty` clauses included, against a comparison run over the
absent-preferential-table fixture pack SUP-022-05 introduces, so the "a comparison
never quietly drops the preferential leg" rule becomes permanent instead of
disappearing with the absence that happened to produce it. Retain the sibling
clauses in the same assertion — `notModeled.length === 8`, the extractability
count, the no-ESM, no-global-`isFinite`, `module.exports` and global-attach clauses
— **untouched**; none pins behaviour any scope of this feature changes.

**Why it is stronger.** The original proved one refusal against a pack state about
to disappear, so it would have been lost. Relocating it makes it permanent, and
the recomputation identity is new coverage of the case the original could not
reach at all.

**Adversarial cases.** A comparison returning a difference for the absent-table
fixture must fail the retained branch. A comparison that prices the converted gain
at the ordinary rate must fail the recomputation identity. A comparison that
reports the marginal-rate product must fail the difference clause.

#### SUP-022-12 — the route's gain household gets a headline instead of a refusal

**Superseded.** In `Regression: SCN-021-002 unsupported year jurisdiction and
income kind each refuse without substitution`, for the household declaring
ordinary income and a long-term capital gain: the visible
`#headlineBlock [data-rl-unavailable]` node, its `RLTAX-THRESHOLD-UNAVAILABLE`
text, its `What would make it available:` text, the zero count of
`[data-rl-value="headlineFederalTax"]` nodes, and the clause asserting
`#headlineBlock` does not read `$0`.

**Why SUP-022-09 does not reach it.** SUP-022-09's line span overlaps this test's,
but its superseded clause is stated as the rendered contributor count of fourteen
and the rendered absent-figure count of four. Both live at L55 and L59, inside the
**previous** test, `Regression: SCN-021-001`. SUP-022-09 names no clause in
SCN-021-002, and under ASC-2 an overlapping line range is not a name.

**Cause.** `SCN-022-002`, Scope 01, under `FR-022-004` and `FR-022-005`.

**Replacement.** Shape `partition`. The test title stays byte-identical. For a
filing status whose preferential table resolved: `[data-rl-value="headlineFederalTax"]`
is visible and carries a currency figure, and raising the declared gain across a
carried preferential breakpoint moves that headline by the amount the pack's own
table implies — so the branch proves the gain is priced rather than merely that a
numeral appeared. Retain the original refusal clauses **verbatim** — visible
refusal node, code text, remediation text, zero valued-headline nodes and the
not-`$0` clause — for a filing status whose table stayed absent and, per ASC-7, for
the configuration-substituted absent-table pack this same test already stands a
static server up for in its wrong-year and wrong-jurisdiction blocks. Assert the
retained branch was exercised at least once. Leave the wrong-year and
wrong-jurisdiction blocks themselves untouched; they pin nothing this feature
changes.

**Why it is stronger.** The original asserted that a refusal appeared. The
replacement asserts a quantitative pricing relationship on the live route, and it
keeps the "a missing leg is never rendered as `$0`" clause permanently exercised
against a fixture rather than incidentally true of the shipped pack.

**Adversarial cases.** A page that renders `$0` where the table is absent must
fail the retained branch. A page that renders a headline while the pack table is
absent must fail. A page that prices the gain at the ordinary rate must fail the
movement clause.

#### SUP-022-13 — the rendered gain curve replaces the rendered gain refusal

**Superseded.** In `Regression: SCN-021-009 unsupported thresholds are named
unavailable contributors and the curve is labeled incomplete`: the closing
expectation that `#gainCurveBlock [data-rl-unavailable]` contains
`RLTAX-THRESHOLD-UNAVAILABLE`.

**Why SUP-022-08 does not reach it.** SUP-022-08 names exactly three expectations
in this same test — the `Unavailable contributors: 14` label text, the
`toHaveCount(14)` on the contributor list, and the presence of
`marginal-contributor:net-investment-income-tax` in the rendered domain list. This
expectation is none of them, it is broken by a different scope for a different
reason, and ASC-2 forbids a "related assertions" phrase from standing as its name.

**Cause.** `SCN-022-002`, Scope 01, under `FR-022-004` and `FR-022-005`. The
long-term gain curve becomes computable in Scope 01, which is **before** Scope 02
touches this file for SUP-022-08. The expectation therefore breaks inside Scope
01's change and, under ASC-3, must be replaced inside that same change. Scope 01's
Change Boundary is widened by name to permit exactly this clause; see
[Change-boundary resolution](design.md#change-boundary-consequence).

**Replacement.** Shape `relocate`. The test title stays byte-identical. For the
shipped pack, `#gainCurveBlock` renders a curve whose text-equivalent table
carries ordered levels, more than one distinct effective marginal rate, and an
exact crossing pair at every preferential breakpoint the pack carries; and that
curve is identical to the qualified-dividend curve for the same amount, which
proves `FR-022-005`'s pooling rule on the rendered route rather than only in the
engine. Retain the original refusal expectation **verbatim** against the
configuration-substituted absent-preferential-table pack, so the "the gain curve
refuses rather than silently dropping the preferential leg" rule survives
permanently.

**Why it is stronger.** The original proved a refusal that was about to stop being
true and would have been deleted. The relocation keeps it provable forever and
adds exactness at every carried breakpoint plus the pooling identity, neither of
which the original could express.

**Adversarial cases.** A gain curve that omits the preferential leg and renders
anyway must fail the exact-crossing clause. A dividend curve priced differently
from the gain curve must fail the identity. A curve rendered for the absent-table
pack must fail the retained refusal.

#### SUP-022-14 — the reconciliation leg list is derived instead of spelled

**Superseded.** In `TP-02-05`: `legIds === 'L1,L2,L3,L4,L5'`, and the
five-leg reading of `balancedSettled.reconciliation.legs.every((leg) => leg.state
=== 'holds')`.

**Cause.** `SCN-022-004`, Scope 02, under `FR-022-010`.
[`design.md`](design.md#co-9-reconciliation-extended) adds reconciliation leg `L6`
to the federal settlement, so a settled federal result publishes six legs and a
string literal spelling five stops being true.

**Replacement.** Shape `derive`. Assert the published leg-id list equals the
engine's own declared federal reconciliation leg set, **in order and in both
directions**, rather than comparing a joined string to a literal. Assert every
published leg holds for a settled result, iterating the published legs rather than
a fixed five. Retain the tolerance clause, the deliberately-unbalanced verdict, the
`RLTAX-RECONCILE` code and the `L4` `breaks` clause **verbatim**. Add the `L6`
clause `SCN-022-004` requires: the net investment income base excludes
`taxExemptInterestRecorded` and excludes the declared wage basis unless that amount
was also declared as net investment income.

**Why it is stronger.** A string literal detects only a change in that literal.
Ordered, two-directional identity against the engine's declaration additionally
detects a leg silently dropped, renamed or reordered while the count holds — which
is precisely how a reconciliation surface degrades unnoticed.

**Adversarial cases.** Dropping `L2` while adding `L6` must fail the ordered
identity, which a length check could not see. An `L6` that passes while tax-exempt
interest sits in the investment-income base must fail. A settled result publishing
a leg in state `not-evaluable` must fail the all-legs-hold clause.

#### SUP-022-15 — the rendered reconciliation rows follow the record

**Superseded.** In `Regression: SCN-021-006 deduction selection is explicit and the
annual result reconciles`: `await expect(legs).toHaveCount(5)` on
`#reconciliationBody tr`, and the `for (index = 0; index < 5; index += 1)` loop
whose bound is the same literal.

**Cause.** Identical to SUP-022-14 — `SCN-022-004`, Scope 02, `FR-022-010`. This
is a separate entry rather than a clause of SUP-022-14 because ASC-2 names a file
and a line, and this is a different file asserting over the rendered page rather
than over the engine record.

**Replacement.** Shape `derive`. The test title stays byte-identical. Assert the
rendered reconciliation row count equals the number of legs the settled record
published, read from the page's own envelope rather than from a literal, and
assert every rendered row reads `holds` by iterating the rendered rows rather than
counting to a fixed bound. Retain every other clause in the test **verbatim**,
including the applied-deduction stage row, both known-value headline expectations,
the undeclared-mode refusal, the truth-state transitions and both
rounding-disclosure clauses.

**Why it is stronger.** The count follows the record, and a loop bounded by the
rendered rows can no longer pass while silently skipping a row the page added —
which the literal-bounded loop would have done the moment a sixth leg appeared.

**Adversarial cases.** A page rendering five rows for a six-leg record must fail.
A page rendering a sixth row whose state is anything other than `holds` for a
settled result must fail. A page rendering a row the record does not publish must
fail.

#### SUP-022-16 — the same rendered leg count, in the route spec that owns it

**Superseded.** In `Regression: SCN-021-013 Simple opens first with a decision
level answer and Power holds the detail`: `await expect(page.locator('#reconciliationBody
tr')).toHaveCount(5)`.

**Cause.** Identical to SUP-022-14 and SUP-022-15 — `SCN-022-004`, Scope 02,
`FR-022-010`. It is a third entry because it is a third file, and ASC-2 does not
permit one entry to stand for an assertion in a file it does not name.

**Replacement.** Shape `derive`. The test title stays byte-identical. Derive the
expected row count from the settled record exactly as SUP-022-15 does, in the file
that owns this rendering. Retain every sibling clause in the assertion block
**verbatim**, including the pack-derived feature-ledger count two lines above it,
the `#bracketDetailBody tr` count, the curve-row lower bound, and the headline
identity across the two view modes.

**Why it is stronger.** The same reason as SUP-022-15, applied to the route spec
that renders the Power panel. It also brings this line into agreement with the
pack-derived technique the surrounding assertions in the same test already use.

**Adversarial cases.** As SUP-022-15.

#### SUP-022-17 — the rendered source records follow the pack

**Superseded.** In `Regression: SCN-021-013`: `await
expect(page.locator('#sourceRecordList li')).toHaveCount(2)`.

**Cause.** `SCN-022-001`, Scope 01, under `FR-022-001` and `FR-022-002`. Scope 01
adds the rate authority as a third `SourceRecord` in the federal pack, which is
the whole mechanism the split-authority contract exists to introduce. Scope 02
adds the surtax authority as a fourth.

**Replacement.** Shape `derive`. The test title stays byte-identical. Assert the
rendered source-record count equals `pack.sourceRecords.length`, read from
`tax-rules/federal/2026.json` — the identical technique this same test already
uses two lines earlier for the feature ledger, so the replacement is a
consistency repair as well as a strengthening. Assert the rendered record titles
equal the pack's record titles as a set, in **both** directions. Retain the
`rel="noreferrer noopener"` clause **verbatim** and widen it from `.first()` to
every rendered link, so a source record added by a later scope cannot arrive
without the referrer guard the privacy boundary depends on.

**Why it is stronger.** The count follows the pack instead of rotting; set
identity detects a record substituted at constant count, which a length cannot;
and the referrer guard now covers every link rather than whichever one happens to
render first.

**Amending scope: none.** The replacement is pack-derived, so Scope 02's fourth
source record needs no second edit to this line.

**Adversarial cases.** A page rendering two records for a four-record pack must
fail. A record swapped for another at constant count must fail set identity. A
link rendered without `rel="noreferrer noopener"` must fail the widened clause.

#### SUP-022-18 — Simple's closed field set is proven against Simple's own markup

**Superseded.** In `TP-05-01`: `simpleFields.length === 7`,
`powerLinkDetails.length === 9` and `powerLinkSections.length === 9`.

**Cause.** `SCN-022-004`, `SCN-022-005` and `SCN-022-006`, Scope 02, under
`FR-022-009`, `FR-022-011` and `FR-022-014`.
[`design.md`](design.md#component-tree) places `SurtaxSummaryLines` and
`ConversionAsymmetryLine` in Simple, because each surtax figure and the conversion
asymmetry are decision-level answers rather than detail. The closed decision set
therefore grows, and each newly withheld detail links to the Power section that
owns it.

**Replacement.** Shape `derive`. Assert that `SIMPLE_FIELDS` equals the set of
`data-rl-value` field ids the Simple markup actually renders, in **both**
directions, so the closed list and the markup can never disagree. Assert
`powerLinkDetails.length === powerLinkSections.length`, so a detail can never be
withheld without naming the section that owns it. Retain **every** quality clause
in the assertion verbatim: the four named field spot checks, the
`band|curve|ledger|trace|reconcil|average` field-id token exclusion, the
no-`<canvas>`, no-`power-`, no-`curveTextEquivalent`, no-`bracketDetail` and
no-`ruleLedger` Simple-markup clauses, the clause requiring every linked section
to be a declared Power section, and the `SIMPLE_FIELDS.indexOf(fieldId) < 0`
renderer-enforcement clause. Add the two new field ids as named spot checks.

**Why it is stronger.** Three lengths detected only their own change. Cross-artifact
identity between the closed list and the rendered markup detects a field rendered
in Simple that the list does not carry, and a listed field Simple never renders —
neither of which any length could see. Every clause that keeps Simple a
decision-level view survives untouched, so Simple cannot acquire a chart, a table
or a rule trace under cover of this entry. That retention is load-bearing: it is
why `design.md`'s component tree places the combined curve chart and its text
equivalent in **Power**, not Simple.

**Amending scope: none.** Scope 03's `StateStatusChip` and Scope 05's
`CombinedTotalLine` are absorbed by the derived form, so neither scope edits this
assertion and both remain supersession-free.

**Adversarial cases.** Rendering a `data-rl-value` field in Simple that
`SIMPLE_FIELDS` does not carry must fail. Listing a field Simple never renders must
fail. Adding a `<canvas>`, a `<table>`, or a field whose id carries a forbidden
token to Simple must fail the retained clauses. Withholding a detail whose link
names no Power section must fail the agreement clause.

#### SUP-022-19 — the withheld-detail links are selected by target, not by ordinal

**Superseded.** In `Regression: SCN-021-013`: `await
expect(links).toHaveCount(9)` on `#powerLinkRows button[data-power-section]`, and
the positional `links.nth(3).click()` whose expectation is that
`#power-bracket-detail` receives focus.

**Cause.** Identical to SUP-022-18 — Scope 02, `FR-022-009`, `FR-022-011` and
`FR-022-014`. The positional selector is superseded together with the count and
not left standing, because inserting a withheld detail moves the ordinal of every
link after it: the click would silently open a different section and the focus
expectation would fail for a reason that looks nothing like its cause.

**Replacement.** Shape `derive`. The test title stays byte-identical. Assert the
rendered link count equals the number of withheld details the page declares, read
from the page's own `data-rl-power-sections` attribute and the links' own targets
rather than from a literal. Retain the existing clause that every targeted section
is a declared Power section **verbatim**, and add its converse, so a declared
section reachable from no link and a link naming no declared section both fail.
Replace the positional click with a selection by declared target — the link whose
`data-power-section` is `power-bracket-detail` — and retain both focus
expectations unchanged, so the navigation contract is proven without depending on
an ordinal this feature moves.

**Why it is stronger.** The navigation claim stops depending on the order of an
authored list, and two-directional link/section identity detects an orphaned
section and an orphaned link, neither of which a count could see.

**Amending scope: none.**

**Adversarial cases.** A withheld detail whose link targets a section that does
not exist must fail. A Power section reachable from no withheld-detail link must
fail. Renaming the bracket-detail target so it is unreachable must fail the focus
clause, which the ordinal selector would have hidden by opening a neighbouring
section instead.

#### SUP-022-20 — the ordinary curve's step list follows the pack, and the step selector stops being a width

**Superseded.** In `TP-03-05`: the known-value step-level list for the shipped
ordinary curve, and the selector that treated every probe-WIDTH segment as a step.

**Cause.** `SCN-022-004` and `SCN-022-006`, Scope 02, under `FR-022-009`. The two
surtax threshold sets become declared pack thresholds, so the curve now emits a
probe-width segment at a declared threshold-set edge as well as at every band
edge. On the curve fixture both surtax bases are declared zero, so that segment
moves no rate — and a selector keyed on WIDTH therefore counts a flat segment as a
step, which is a false positive the original list could not express.

**Why the cleared-assertion obligation is discharged rather than ignored.** The
[assertions considered and not superseded](#assertions-considered-and-not-superseded)
table cleared `TP-03-05` on the reasoning that a zero-based surtax introduces no
new crossing. That reasoning holds for CROSSINGS and is confirmed: no new rate
step appears. It does not hold for SEGMENTS, and the obligation attached to that
row required the finding to return to planning rather than be edited by an
implementer. It is returned here, and the row is amended to record it.

**Replacement.** Shape `derive`. Derive the expected edge set from the pack —
each ordinary band's lower edge carried up by the pack's own standard deduction,
kept when the sweep reaches it — instead of spelling six levels. Select steps by
`segmentKind === 'rate-step'` rather than by width. Assert two-directional
identity between the derived edge set and the rendered step levels, allowing a
rendered step only where the pack attributes a non-band threshold to it. Add a
labelling-honesty clause over EVERY probe-width segment: it either steps with a
named pack threshold and carries `cliff: true`, or it is `flat`, carries
`cliff: false`, names no threshold, and its two endpoint rates genuinely agree
within the pack's own reconciliation tolerance.

**Why it is stronger.** A literal list detects only a change in that list. The
derived set detects a band edge that moves in the pack, and the honesty clause
detects a segment mislabelled in either direction — a real step reported flat, or
a flat run reported as a cliff — neither of which a level list could see. The
tolerance is read from the pack, so the audit and the engine cannot disagree about
what counts as a move.

**Adversarial cases.** Moving a declared band edge in the pack must move the level
the curve steps at, and the unmodified curve must NOT step at the fabricated
level. A probe-width segment that moved no rate must be labelled flat and must not
be counted as a step — the shipped curve carries at least one, which is what
proves the superseded width selector would have miscounted. A curve that
interpolates across a crossing pair must still fail the adjacent-point clause.

#### SUP-022-21 — the rule ledger proves the rule, not the member name

**Superseded.** In `Regression: SCN-021-005 long term gains stack on ordinary
income`: `await expect(page.locator('#power-rule-ledger')).toContainText('preferentialRateTables')`.

**Why SUP-022-07 does not reach it.** SUP-022-07 names three expectations in this
same test — the visible refusal for the gain household, the visible refusal for
the dividend household, and the zero count of `[data-rl-value="headlineFederalTax"]`
nodes — and explicitly RETAINS this clause, "re-pointed at whatever remains
absent". Retention is not supersession, and ASC-2 refuses an entry that names
neither this file's line nor this clause. The retained clause nevertheless stops
being satisfiable, so it needs an entry of its own.

**Cause.** `SCN-022-002`, Scope 01, under `FR-022-004`. The string was only ever
satisfied by the absent-figure inventory, which renders the GROUP NAME of each
table the pack does not carry. Scope 01 resolves all four preferential tables, the
inventory empties, and the last occurrence of the member name in that panel
disappears. Re-pointing it "at whatever remains absent" is impossible when nothing
remains absent, and pointing it at the pack's raw member name in some other panel
would assert an internal identifier no reader sees.

**Replacement.** Shape `derive`. The test title stays byte-identical. Assert the
Power feature ledger renders the pack's own preferential-schedule feature label
with coverage `supported`, so the panel names the RULE rather than the member.
Assert the rendered `calculationOrder` row equals the pack's declared calculation
order exactly, so the stage that prices the preferential leg is provably in the
declared order. Assert split-authority provenance, which is the point Scope 01
exists to make: the table's default `sourceRef` and its `componentSources[]`
override cite DIFFERENT source records, every cited record is `retrieved` and is
not a `newsroom-release`, and the Power source list renders both titles. Retain
the sibling empty-state clause on the absent-figure inventory unchanged.

**Why it is stronger.** The original passed on the presence of a pack member name
that happened to be printed because a figure was missing — it was, in effect, an
assertion that the feature had NOT shipped. The replacement asserts that the
feature has shipped, that the panel names it in the reader's language, that the
declared calculation order carries its stage, and that its two authorities are
both retrieved, both non-newsroom and both rendered. That is provenance, which is
the property the clause was standing in for.

**Adversarial cases.** A pack whose preferential table cites its top-band rate to
the same record as its breakpoints must fail the distinct-authority clause. A pack
citing a `newsroom-release` or a `not-retrieved` record must fail. A page that
renders the preferential feature as `not supported`, or that drops the
preferential stage from the rendered calculation order, must fail. A page that
renders one of the two authorities but not the other must fail the source-list
clause.

### Assertions considered and not superseded

The sweep that admitted SUP-022-14 … SUP-022-19 also examined the literals below
and cleared each. They are recorded so a later reader can tell a **cleared**
assertion from an **unexamined** one, and so the obligation attached to each is
explicit rather than assumed. If any obligation below turns out to be false during
implementation, the scope stops and returns the finding to planning; it does not
edit the assertion.

| Assertion | Why it survives | Binding obligation |
| --- | --- | --- |
| `tests/lifetime-tax-route.spec.mjs` L79 — `#bracketDetailBody tr` `toHaveCount(7)` | The panel renders the ordinary rate table's bands for the declared status, and no scope changes the ordinary schedule | If Scope 01's preferential rendering or `ComponentSourceLedger` causes this panel to grow, that is a finding returned to planning, not an edit |
| `scripts/selftest.mjs` `TP-04-01` — `baseComparison.heldConstant.length === 9` | `rltaxstrategy.js` is excluded from every scope's Change Boundary, so the published held-constant list cannot grow | If the conversion comparison must publish the two new basis declarations or the residency as held constant, `rltaxstrategy.js` needs an edit and that is a finding, not an in-scope change |
| `tests/lifetime-tax-conversion.spec.mjs` L58, L69 — `notModeled` `toHaveCount(8)` | The conversion comparison stays federal-only and models no state settlement, so `state-tax` and `medicare-and-irmaa` remain unmodeled | Scope 05 must not extend the conversion comparison to the combined settlement; the combined panel is its own surface |
| `tests/lifetime-tax-foundation.spec.mjs` L84, L149 and `tests/lifetime-tax-route.spec.mjs` — `#storageInventoryBody tr` `toHaveCount(3)` | The inventory enumerates declared **storage keys**, and every new household value lives inside the existing namespace under the privacy boundary's no-new-key rule | A new storage key would break this and is already forbidden by the privacy boundary |
| `tests/lifetime-tax-route.spec.mjs` L229 and `scripts/selftest.mjs` — `neverCollected` five members | The new household values are collected under the privacy boundary, not never-collected | The never-collected list is a privacy assertion and is never eligible for supersession |
| `scripts/selftest.mjs` `TP-05-01` and route spec L150-153 — three written storage keys | Same as the storage inventory | Same |
| `tests/lifetime-tax-route.spec.mjs` L47-48 — zero `<canvas>` and zero `<table>` in Simple | `design.md` places the combined curve chart and its text-equivalent table in **Power** | Every Simple surface any scope adds renders as a value field; a chart or a table in Simple is a finding, not a supersession |
| `scripts/selftest.mjs` `TP-03-05` — the ordinary curve's step-level list | **Amended.** The crossing reasoning held — with both surtax bases declared zero on the curve fixture, no new rate STEP enters the ordinary curve. The segment reasoning did not: a probe-width segment is now emitted at a declared threshold-set edge that moves no rate. The obligation below was discharged as written | The finding was returned to planning rather than edited by an implementer, and is admitted as **SUP-022-20** |
| `tests/lifetime-tax-marginal.spec.mjs` L83 — the rendered step-level list | Same as `TP-03-05`, on the route | Same |
| `tests/lifetime-tax-route.spec.mjs` L71-77 — the feature-ledger row count | Already pack-derived, so it absorbs every pack change this feature makes | None |
| `scripts/selftest.mjs` `TP-02-10` — `noticeIds.length === settlePack.unsupportedFeatures.length` | Already derived; only its literal sibling is superseded, under SUP-022-04 | None |

### Relationship to Feature 021

Feature 021 is not being corrected. Every assertion in this ledger was right when
it was written and describes behaviour Feature 021 genuinely shipped. This feature
supersedes those assertions because it changes that behaviour on purpose, under
requirements a reader can check.

The `Supersedes` direction is recorded here, in the successor, because the
successor is the artifact that knows what it changed. Whether the reciprocal
`Superseded-By` note is added to Feature 021's own specification is decided by one
test and no other: the note is added only if
`bash .github/bubbles/scripts/artifact-lint.sh specs/021-lifetime-tax-strategy-lab`
stays at exit 0 and the repository suite stays green with it in place. A completed
predecessor is never damaged to carry a cross-reference the successor already
carries.

---

## Scope Of This Feature

Federal preferential rate completion, two federal threshold surtaxes, a generic
state rule-pack contract with residency resolution and refusal semantics, two
state packs chosen as maximally different regimes, and a combined federal plus
state settlement with a combined marginal rate curve — delivered across five
scopes and fifteen scenarios `SCN-022-001` … `SCN-022-015`.

---

## Goals

1. Give a household with preferential income a real federal total, with the
   breakpoint and the rate each traceable to the authority that establishes it.
2. Make the two federal threshold surtaxes visible, including the fact that a
   Roth conversion moves one of them and not the other.
3. Make the jurisdiction axis a pack seam rather than a code branch, and prove it
   with two regimes that share almost no structure.
4. Make a sourced zero visibly different from a refusal and from a blank.
5. Price the next dollar across both jurisdictions at once, with every
   contributing threshold named and tagged with the jurisdiction that owns it.
6. Extend the closed refusal vocabulary only where a genuinely new condition
   exists, and never by repurposing an existing code's meaning.

---

## Non-Goals

Each is a deliberate exclusion, not an oversight, and none is a candidate for
late scope growth.

**Product non-goals**

1. Prepare, file or transmit a return, an extension or an estimated payment.
2. Give tax advice, recommend an action, rank policies or name a preferred one.
3. Emit any probability — success, shortfall, survival or confidence-as-frequency.
4. Emit a lifetime total, a break-even year, a multi-year projection or a maximum
   sustainable spending figure.
5. Claim a published error rate, a self-invalidation statistic, a track record or
   an accuracy figure. Feature 021 rejected this claim; the rejection stands.
6. Execute, schedule or record a conversion, trade, withdrawal or benefit claim.

**Coverage non-goals**

7. Any state other than California and Florida. Every other state is
   `RLTAX-JURISDICTION-UNSUPPORTED`.
8. Any local or municipal income tax, any property tax, any sales tax.
9. Part-year residency, multi-state residency, non-resident source income, and
   the credit for taxes paid to another state. These are
   `RLTAX-RESIDENCY-UNSUPPORTED`.
10. Any preferential-income category taxed above 20 percent: section 1202
    qualified small business stock, collectibles, and unrecaptured section 1250
    gain.
11. Capital loss limitation and carryforward, the alternative minimum tax, the
    qualified business income deduction, payroll tax, self-employment tax as a
    deduction, and every credit other than the California exemption credits.
12. Taxable Social Security benefits, Medicare premiums, IRMAA bands and the
    premium tax credit. These remain Feature 023.
13. The federal itemized deduction for state and local income tax paid. See
    [Cross-Jurisdiction Coupling](#cross-jurisdiction-coupling).
14. Any market simulation, any multi-year ledger, any required minimum
    distribution.

**Structural non-goals**

15. Modify `rlportfolio.js`, `rlportfolioanalytics.js`,
    `portfolio-survival-allocation.config.json`, or anything under
    `specs/008-portfolio-survival-and-brief-lab/`.
16. Create any new root HTML file. This feature extends
    `lifetime-tax-strategy-lab.html` and therefore adds no `site-exclusions.json`
    entry.
17. Register the tool in `tools.json`, `index.html`, `rlnav.js`, `README.md`,
    `notes/README.md` or market-brief coverage. Registration is Feature 026.
18. Touch `briefs/`, `data/`, `market-brief.*` or any scheduled-publication
    artifact.
19. Weaken any existing assertion in `scripts/selftest.mjs` or in any Feature 021
    Playwright spec. New assertion groups are appended. One narrow exception
    exists and it is named, audited and bounded: an assertion that pins behaviour
    an approved scope of this feature deliberately changes is superseded under the
    [Assertion Supersession Contract](#assertion-supersession-contract), which
    requires a named, stronger replacement in the same change. An assertion
    touched for any other reason is a defect in the change, not a supersession.

---

## Deferral Register — Recorded, Not Omitted

Feature 021's register named "a later feature" for every deferred capability
because no successor existed. This feature names the successors. A reader must be
able to see what the tool cannot do without inferring it from silence.

| Deferred capability | Why it is deferred from slice 2 | Named successor |
| --- | --- | --- |
| Taxable Social Security benefits | The taxable-benefit computation is its own threshold model with its own rule pack, and it interacts with both surtaxes added here | Feature 023 |
| Section 1202 qualified small business stock, collectibles, and unrecaptured section 1250 gain | Each is a distinct rate ceiling above the pack's top preferential rate, with its own qualifying, holding-period and basis rules and its own authority. None was retrieved here, and the three-band preferential table cannot express them. Named in `unsupportedFeatures[]` by Scope 01 rather than folded into a carried band | Feature 023 |
| Medicare premiums and IRMAA bands | IRMAA is a cliff whose band table is a dated rule pack this slice does not carry, and it is driven by a two-year-prior income measure this workspace does not hold | Feature 023 |
| Premium tax credit before Medicare | The eligibility boundary has moved by legislation and the pack year is unresolved | Feature 023 |
| Every state other than California and Florida | Each is a distinct pack with a distinct authority and cadence; two are enough to prove the contract and more would be volume rather than validation | Feature 024 |
| Local and municipal income tax | A sub-state jurisdiction axis the pack path does not yet express | Feature 024 |
| Property tax, primary home, long-term rental, vacation rental | Jurisdiction and rental-mode decisions remain unresolved | Feature 024 |
| Part-year and multi-state residency, credit for taxes paid to another state | Requires an apportionment model and a second residency period; refused here as `RLTAX-RESIDENCY-UNSUPPORTED` | Feature 024 |
| The federal itemized deduction for state and local income tax paid | A genuine circular coupling between the two settlements; see [Cross-Jurisdiction Coupling](#cross-jurisdiction-coupling) | Feature 024 |
| Multi-year lifetime ledger, required minimum distributions, qualified charitable distributions, withdrawal order, reserve policy | This slice still settles exactly one tax year | Feature 025 |
| Roth five-year clocks, 72(t) series, survivor effects, lost growth on taxes paid | Multi-year commitments with no single-year expression | Feature 025 |
| Monte Carlo, bootstrap, regime paths, any market simulation | No path engine and no multi-year ledger exist | Feature 025 |
| Any success, shortfall or survival probability | With no path cohort there is no frequency to report, and a probability with no cohort behind it is a fabricated statistic | Feature 025 |
| Estate, gift, 1031 exchange, trusts, inherited-account windows | Separate rule contracts | Feature 025 |
| Registration in `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md`, market-brief coverage | Explicit operator instruction defers registration | Feature 026 |
| Adding `tax-rules/` to `PUBLIC_DIRECTORIES` in `scripts/build-pages-site.mjs` | The pack directory must enter the Pages allowlist in the same change that registers the page, or the registered page resolves a 404 pack | Feature 026 |

---

## Current Capability Map

What Feature 021 shipped, and what each item becomes here.

| Capability | After Feature 021 | After this feature |
| --- | --- | --- |
| Federal ordinary tax, single and married filing jointly | Computed | Unchanged |
| Federal ordinary tax, married filing separately and head of household | `RLTAX-THRESHOLD-UNAVAILABLE` | Unchanged — still absent, still `BI-2` |
| Federal preferential tax, all statuses | `RLTAX-THRESHOLD-UNAVAILABLE` | Computed where the pack resolves, with per-component provenance |
| Federal total for a household with preferential income | `RLTAX-THRESHOLD-UNAVAILABLE` | Computed |
| Net investment income tax | Named unsupported | Computed from a declared basis |
| Additional Medicare tax | Named unsupported | Computed from a declared basis |
| Long-term gain marginal curve | `RLTAX-THRESHOLD-UNAVAILABLE` | Computed |
| Any state tax | `RLTAX-JURISDICTION-UNSUPPORTED` | California computed, Florida a sourced zero, every other state still refused |
| Combined federal plus state total | Did not exist | Computed, with order-independence proven |
| Combined marginal curve | Did not exist | Computed, thresholds tagged by jurisdiction |

---

## Honest Findings And Research Corrections

Findings established by retrieval in this authoring session that change what a
scope may assume.

**F-1: The preferential gap is a provenance-model defect, not a retrieval
failure.** Feature 021's implementer retrieved the correct section and correctly
reported that it does not state the rate. The rate was never in that document and
never will be. Any pack model that binds one table to one source will reproduce
this refusal on the next indexed-threshold-plus-statutory-rate figure it meets.

**F-2: Topic 409's dollar amounts are tax-year-2025 amounts and are unusable
here.** The retrieved page labels them explicitly. A pack that took its
breakpoints from this page would be a tax-year mixing defect wearing a citation.
The design forbids it structurally by requiring the breakpoint components to cite
the Revenue Procedure.

**F-3: Three preferential categories are taxed above 20 percent.** Section 1202
stock and collectibles at a maximum 28 percent, unrecaptured section 1250 gain at
a maximum 25 percent. The pack's three-band preferential table is correct only
for adjusted net capital gain containing none of them, and the pack must say so.

**F-4: The two surtaxes are driven by different quantities and a conversion moves
only one.** A Roth conversion raises modified adjusted gross income, so it can
push a household across the net investment income tax threshold and increase that
tax on investment income the household did not touch. It is not Medicare wages,
so it cannot increase the additional Medicare tax at all. A tool that presented
both as "the surtaxes" would hide the only asymmetry a converting household needs.

**F-5: Tax-exempt interest is excluded from net investment income by name.** The
retrieved Topic 559 states that the tax does not apply to tax-exempt state or
municipal bond interest. Feature 021 already retains tax-exempt interest as a
recorded, excluded input. This feature must keep it out of both the net
investment income base and the modified adjusted gross income measure, and prove
it with a test rather than a comment.

**F-6: California's surcharge threshold does not vary by filing status.** The
retrieved statute excludes the bracket-recomputation and joint-return provisions
from the surcharge. Married-filing-jointly's threshold is the same one million
dollars as single's. This is counter-intuitive relative to every other threshold
in the feature and is therefore a required known-value boundary case at, below
and above one million for every filing status.

**F-7: California's exemption relief is a credit, not an exemption, and the
surcharge is outside it.** The retrieved statute excludes the credit-allowance
provision. A pack that treats exemption relief as an income reduction, or that
allows a credit against the surcharge, is wrong in two independent ways.

**F-8: Florida's absence is administratively visible but not yet directly
stated.** The retrieved department list contains no individual income tax and the
retrieved constitutional section caps such a tax. Neither states the rate is
zero. That last step is `BI-5` and is not taken here.

**F-9: The California Franchise Tax Board was not reachable in this session.**
Five distinct URLs failed. Every California dollar figure is therefore
unestablished at specification time. This is recorded rather than worked around.

**F-10: The federal itemized deduction for state income tax paid is a real
circular coupling.** Feature 021 models the itemized deduction as a user-declared
amount, which means a household that itemizes may already have state income tax
inside that number. The combined settlement cannot silently resolve this. See
below.

**F-11: A year-labelled authority for both surtax threshold sets exists, and it
also cross-checks the preferential figures.** IRS Publication 505 (2026), whose
title carries the "For use in 2026" label the topic pages lack, states both surtax
rates and all filing-status thresholds, and confirms the tax-year-2026
preferential breakpoints and the 20-percent rate in Worksheet 2-7. This closes
`BI-4` as a planning blocker and gives `BI-1` and `BI-3` a second authority to
cross-check against. It does not reduce what the implementer must retrieve; see
[RD-3](#rd-3-both-federal-surtaxes-ship-together-and-both-require-a-new-declared-basis).

**F-12: Feature 021's green suite pins the absence this feature removes, and that
is a planning defect rather than an implementation one.** Twenty-one pre-existing
assertions describe behaviour Scope 01 and Scope 02 are approved to change. An
absolute "never edit a pre-existing assertion" rule would forbid the feature
itself, and an unwritten exception would let a future implementer weaken a test
under the same words. Both failure modes are closed by the
[Assertion Supersession Contract](#assertion-supersession-contract), which permits
exactly twenty-one named supersessions, each with a named stronger replacement.

**F-13: the ledger grew twice, and each growth is evidence the contract works.**
The contract shipped with nine entries. An implementation dispatch stopped rather
than editing four assertions the ledger did not name, and those became SUP-022-10
… SUP-022-13. The planning sweep that followed read every shipped-pack assertion
in the four Feature 021 selftest groups and every literal count in all five
Feature 021 Playwright specs, and found six more, which became SUP-022-14 …
SUP-022-19. A ledger that is discovered to be incomplete and is extended is
working exactly as ASC-2 requires; a ledger that never grows because implementers
quietly edit around it is the failure this contract exists to prevent. The
[assertions considered and not superseded](#assertions-considered-and-not-superseded)
table records what the sweep cleared, so the next reader inherits the search
rather than repeating it.

**F-14: two design rules could not both hold, and both were repaired in
`design.md` rather than absorbed by the ledger.** SUP-022-02's tax-year
containment clause and `TP-01-07`'s breakpoint-substitution adversarial case were
unsatisfiable together against a flat, whole-record year list, because Topic 409
states a rate with no year qualifier and dollar amounts labelled for a different
year. Separately, the combined-curve chart was placed in Simple while Feature 021
ratified that Simple carries no chart and no table. Neither is an assertion
conflict and neither is eligible for supersession; each is a design defect, and
each is fixed at its own contract in
[`design.md`](design.md#per-component-kind-year-containment).

---

## Research Leads Requiring Independent Re-Retrieval

Retrievals recorded elsewhere in this document are the specification's own
sourcing evidence. The items below are **leads**, not sources. They record where a
figure was seen so the implementer knows which document to open. Under Sourcing
Directive rule 1, a lead never becomes a pack `sourceRef`. The implementer
re-retrieves the document, transcribes from what it opened, and records its own
`retrievedAt`. Trusting this record instead would make this specification a
transcription source, which rule 7 forbids.

**The figures reproduced in RL-3, RL-4 and RL-5 are not transcribable.** They are
recorded for two purposes and no others: so the implementer knows which document,
which section and which row to open, and so a mismatch between the implementer's
own transcription and this record is visible. A mismatch is a **stop and report**,
never a silent adoption of either number — the implementer's retrieval wins on
authority, and the disagreement itself is evidence one of the two readings is
wrong. Copying a figure from this table into a pack, without opening the cited
document in the implementation session, violates Sourcing Directive rules 1 and 7
and is a blocking defect regardless of whether the number happens to be right.

| ID | Lead | What was seen | What the implementer must do |
| --- | --- | --- | --- |
| RL-1 | Rev. Proc. 2025-32 §4.03 | The section was retrieved and carries the tax-year-2026 maximum zero rate amount and maximum 15-percent rate amount, by filing status. This is the authority `BI-1` names. | Open §4.03, transcribe both amounts for each filing status directly from it, and record a `SourceRecord/v2` with its own `retrievedAt`. Any status that cannot be read ships as an `AbsentFigure/v1`. |
| RL-2 | Topic no. 409, *Capital gains and losses* | Its 20-percent rate statement carries no year qualifier and is usable. Its dollar amounts are explicitly labelled tax year 2025 and are therefore **unusable** in a tax-year-2026 pack. | Take only the rate from this page, as a `componentSources[]` override on the top band. Take no dollar figure from it. The per-component-kind containment assertion in SUP-022-02 exists to make a violation impossible to land unnoticed. |
| RL-3 | Rev. Proc. 2025-32 §4.03, IRB 2025-45, `https://www.irs.gov/irb/2025-45_IRB`, retrieved 2026-08-17 | The section heading read *Maximum Capital Gains Rate (§ 1(h), § 1(j)(5)). For taxable years beginning in 2026*, and it carried a maximum zero-rate amount and a maximum 15-percent rate amount for each of four rows: married filing joint and surviving spouse, married filing separate, head of household, and all other individuals. The four row pairs seen were 98,900 / 613,700 · 49,450 / 306,850 · 66,200 / 579,600 · 49,450 / 545,500. | Open §4.03 in the implementation session and transcribe all eight amounts from it. Map "all other individuals" to `single` and record that mapping in the pack's `retrievalNote`. Record `declaredApplicableYearsByComponentKind` with `breakpoint` and `amount` containing 2026, `rate` as `year-invariant` with its cited basis, and `qualifier` empty. A row that cannot be read ships as an `AbsentFigure/v1` for that status. |
| RL-4 | Topic no. 409, `https://www.irs.gov/taxtopics/tc409`, retrieved 2026-08-17, page reviewed 25-Feb-2026 | The page stated that a 20-percent rate applies above the 15-percent thresholds, **with no year qualifier on the rate**. Its dollar amounts were labelled *For taxable years beginning in 2025* and are unusable here. The page also named three categories taxed above 20 percent: section 1202 stock at a maximum 28 percent, collectibles at a maximum 28 percent, and unrecaptured section 1250 gain at a maximum 25 percent. This is the authority `BI-3` names. | Open the page, transcribe only the rate, and record `declaredApplicableYearsByComponentKind` with `rate` as `year-invariant`, `breakpoint` and `amount` containing only 2025, and `qualifier` empty. The `year-invariant` entry requires a `yearInvarianceBasis` quoting what in the retrieved text establishes the absence of a year qualifier. Transcribe the three above-20-percent categories into `unsupportedFeatures[]` per the decision recorded under `BI-3`. |
| RL-5 | Publication 505 (2026), *"For use in 2026"*, `https://www.irs.gov/publications/p505`, retrieved 2026-08-17, chapter 2 *Expected Taxes and Credits — Lines 4–11c*, Step 5 items 4 and 5 | Both surtax rates and all four filing-status thresholds for each surtax were present under an explicitly year-labelled title. The threshold pairs seen, as net investment income tax then additional Medicare tax, were: married filing jointly 250,000 / 250,000 · married filing separately 125,000 / 125,000 · single 200,000 / 200,000 · head of household 200,000 / 200,000. This is the authority `BI-4` names. | Open Publication 505 in the implementation session and transcribe each rate and each threshold from it into two `ThresholdSet/v1` records, populating `indexing.declaredFor` from the publication's own year label rather than from the absence of one. A threshold that cannot be read for the declared year ships as an `AbsentFigure/v1` and its leg refuses. |

**A cross-check that is not a source.** Publication 505 Worksheet 2-7 line 11
(98,900 / 49,450 / 66,200), line 19 (545,500 / 306,850 / 613,700 / 579,600) and
line 27 ("20% (0.20)") were seen to agree exactly with §4.03 and Topic 409. Under
Sourcing Directive rule 5 that agreement may be recorded in a `retrievalNote` as
evidence that a transcription is correct. It never becomes the `sourceRef` of a
breakpoint, which stays with Rev. Proc. 2025-32 §4.03, and it never becomes the
`sourceRef` of the top-band rate, which stays with Topic 409.

`BI-1`, `BI-3` and `BI-4` are now closed as **authority questions**: for each, the
document that establishes the figure is named and was opened. None is closed as a
**figure question**. Every one still requires the implementer's own retrieval and
its own `retrievedAt`, and every unretrieved figure still ships as an
`AbsentFigure/v1` with its leg refusing.


---

## Cross-Jurisdiction Coupling

The federal and state settlements in this feature are **independent by
construction**. Neither consumes the other's output. That is a design commitment
with two visible consequences.

1. **The combined total is order-independent.** Settling the state first and the
   federal second produces a byte-identical result to the reverse. This is
   asserted by an adversarial test rather than by prose: a mutated implementation
   that feeds either total into the other's deduction must be demonstrated to
   break the assertion.
2. **The federal itemized deduction for state and local income tax paid is not
   modeled.** A household with `deductionMode: "itemized"` receives an explicit
   coupling notice naming `federal-itemized-salt-deduction` with
   `RLTAX-FEATURE-UNSUPPORTED`. The notice states that the declared itemized
   amount is used exactly as declared, that the tool did not add the computed
   state tax to it, and that it did not check whether the household already had.

The second point is the honest position. The alternative — solving the circularity
by iterating to a fixed point — would produce a number whose derivation no
retrieved source supports, in a feature whose entire premise is that every figure
traces to an authority.

---

## Domain Capability Model

### Capability

**Multi-jurisdiction, source-qualified tax rule resolution and single-year
combined settlement.** This is Feature 021's capability with the jurisdiction
axis opened and the provenance model refined from per-figure to per-component.

### Domain primitives

- **Rule pack.** A dated, versioned, source-qualified set of tax rules for one
  jurisdiction, one program and a declared set of tax years.
- **Component citation.** The binding of one named component of one figure to one
  retrieved authority and a locator inside it.
- **Absent figure.** A stated, reasoned, in-place declaration that a pack does not
  carry a figure it is shaped to carry.
- **Sourced zero.** A valued figure of zero with a citation, meaning the authority
  establishes that nothing is owed. Distinct from an absent figure in every way
  that matters.
- **Tax leg.** One named, separately computed component of a jurisdiction's total.
- **Residency declaration.** The household's statement of which jurisdiction's
  resident rules apply for the whole declared year.
- **Combined settlement.** The pairing of two independent per-jurisdiction
  settlements with no data flowing between them.

### Relationships

- A rule pack belongs to exactly one jurisdiction and declares its own tax legs.
- A tax leg produces either a valued record with a rule status, or a refusal.
- A jurisdiction total is the sum of its declared legs, and is a refusal if any
  leg is.
- A combined total is the sum of the jurisdiction totals, and is a refusal if
  either is.
- A component citation names exactly one source record whose retrieval succeeded.

### Business policies every concrete pack and engine must obey

- No engine names a jurisdiction, a state, a year or an authority.
- No pack carries arithmetic; no module carries a bracket, rate, edge or
  threshold.
- A figure with no retrieved source is absent, never defaulted.
- A zero is either sourced or absent. It is never implied.
- An unsupported residency pattern refuses; it never approximates.

### Provider-neutral vocabulary

Jurisdiction, program, tax year, rate table, band, breakpoint, rate, threshold,
deduction, credit, surcharge, tax leg, residency, component citation, absent
figure, sourced zero, rule status.

---

## Rule Provenance And Status Model

Unchanged from Feature 021 in its enum membership, refined in its granularity.

| Rule status | Meaning |
| --- | --- |
| `enacted-current-law` | The rule is enacted and applies to the declared tax year as of the pack's retrieval date |
| `enacted-scheduled-law` | The rule is enacted and applies to a future year on a declared schedule |
| `user-hypothetical-law` | The rule was supplied by the user and is not enacted |
| `unavailable` | No rule is carried; the field is a refusal |

Provenance is now recorded at three levels, each strictly narrower than the last:

1. **Pack level.** `sourceRecords[]`, `publishedAt`, `retrievedAt`.
2. **Figure level.** A default `{ sourceRef, locator }` on each figure-bearing
   object, as in Feature 021.
3. **Component level.** An explicit override for any named component whose
   authority differs from the figure default.

A component with no override inherits the figure default. A component whose
override names a source that was not retrieved, or that names a newsroom release,
is refused. There is no level at which a figure may carry no source.

---

## Privacy And Trust Model

Inherited from Feature 021 without relaxation, and extended by exactly one new
class of value.

- The residency state is a household value. It is stored in the same local
  namespace as every other household value, is excluded from any URL, request,
  referrer and console message, and is redacted from the sanitized export in the
  same way as every income amount.
- The two new basis declarations — the ordinary-income portion that is net
  investment income, and Medicare wages and self-employment income — are
  household values under the identical rules.
- No new storage key is introduced outside the declared namespace.
- The zero-network assertion is re-run cumulatively in every scope, because two
  new packs are now fetched from disk and a pack load that reached the network
  would be a silent regression of Feature 021's central guarantee.

---

## Actors And Personas

| Actor | What they need from this feature |
| --- | --- |
| A household holding appreciated taxable assets | A federal total that does not refuse the moment it holds a long-term gain |
| A high-income household near a surtax threshold | To see that a conversion moves one surtax and not the other |
| A California resident | A state figure computed from California's own structure, not a federal shape with California numbers |
| A Florida resident | A zero it can trust, visibly distinct from a blank |
| A skeptical reader | The ability to open one cited document per component and land on the figure |
| A future pack author | A contract that already expresses the split-authority case they will meet immediately |

---

## Use Cases

### UC-022-001: Get a real federal number while holding a long-term gain

A household with ordinary income and a realized long-term gain settles its
federal tax for the declared year. The preferential amount stacks on ordinary
taxable income and is priced across the preferential bands. Every band's rate and
every breakpoint displays the authority that establishes that specific component.

### UC-022-002: See what the threshold surtaxes add

The same household declares the ordinary-income portion that is net investment
income and its Medicare wages. It sees each surtax as its own leg, with its own
threshold, its own base, and a statement of what a conversion would do to each.

### UC-022-003: Learn what applies where they live

The household declares its residency state. It receives either a computed state
settlement, a sourced zero, or a named refusal — and can tell which it received
without inspecting a number.

### UC-022-004: Settle California

A California resident sees a state settlement whose preferential income is taxed
as ordinary income, whose deduction is California's own, whose exemption relief
is applied as a credit after the rate, and whose surcharge applies above one
million dollars of taxable income regardless of filing status.

### UC-022-005: Price the next dollar across both jurisdictions

The household sees one curve whose points carry a federal component, a state
component and a combined figure, with every step attributed to a named threshold
in a named jurisdiction.

### UC-022-006: Audit a split-authority figure

A skeptical reader opens the preferential rate table's detail, sees that the
breakpoint cites a Revenue Procedure section and the top rate cites a different
IRS authority, opens both, and confirms each component independently.

---

## Business Scenarios

Fifteen scenarios, three per scope, each owned by exactly one scope.

### BS-022-001 / SCN-022-001: A preferential rate table carries two authorities and both are displayed

**Given** a resolved federal pack whose preferential rate table carries
breakpoints from one authority and a top-band rate from another
**When** the household opens the rule detail for that table
**Then** each band's rate and each breakpoint displays the title, URL, retrieval
date and locator of the authority that establishes that specific component
**And** no component displays a source that was not retrieved
**And** a component citing a newsroom release is refused rather than displayed

### BS-022-002 / SCN-022-002: A household with preferential income receives a real total

**Given** a household with ordinary income and a realized long-term capital gain
for the declared tax year
**When** the annual federal tax is computed
**Then** the preferential amount is priced in the bands that sit above ordinary
taxable income and the total federal tax is a valued record rather than a refusal
**And** the result is exact immediately below, exactly at, and immediately above
every preferential breakpoint the pack carries
**And** qualified dividends receive identical treatment to long-term gains

### BS-022-003 / SCN-022-003: A preferential category the pack does not carry refuses rather than being folded in

**Given** the pack lists collectibles, section 1202 stock and unrecaptured section
1250 gain as unsupported features
**When** the household opens the preferential detail
**Then** each category is named as unsupported with its own reason
**And** no code path folds any of them into the supported preferential bands
**And** the result is not labelled a complete federal tax

### BS-022-004 / SCN-022-004: The net investment income tax is computed from a declared basis and refuses without one

**Given** a household above the filing-status threshold
**When** the household has declared the ordinary-income portion that is net
investment income
**Then** the tax is the rate applied to the lesser of net investment income and
the excess of modified adjusted gross income over the threshold
**And** tax-exempt interest is excluded from both quantities
**And** a household that has not declared the portion receives
`RLTAX-INPUT-INCOMPLETE` naming the missing member rather than an assumed zero

### BS-022-005 / SCN-022-005: The additional Medicare tax is computed from a separate declared basis

**Given** a household with Medicare wages above the filing-status threshold
**When** the additional Medicare tax is computed
**Then** the tax is the rate applied to the excess of the declared wage basis over
the threshold
**And** the result is exact immediately below, exactly at, and immediately above
the threshold for every filing status
**And** an undeclared wage basis is `RLTAX-INPUT-INCOMPLETE` naming the member

### BS-022-006 / SCN-022-006: A conversion moves one surtax and not the other

**Given** a household holding both investment income and Medicare wages
**When** an amount is added to ordinary income
**Then** the net investment income tax can increase, because modified adjusted
gross income rose
**And** the additional Medicare tax does not change, because the wage basis did
not
**And** the result states this asymmetry rather than presenting the two as one
combined surtax figure

### BS-022-007 / SCN-022-007: A state pack resolves by declared residency and refuses without one

**Given** a household that has not declared a residency state
**When** state resolution runs
**Then** the state settlement is `RLTAX-INPUT-INCOMPLETE` naming the missing
member
**And** no state figure of zero is shown in its place
**And** the federal settlement remains complete and visible

### BS-022-008 / SCN-022-008: A state with no pack refuses and an unsupported residency pattern refuses differently

**Given** a household declaring a state for which no pack ships, and separately a
part-year or multi-state residency pattern
**When** state resolution runs
**Then** the first is `RLTAX-JURISDICTION-UNSUPPORTED` and the second is
`RLTAX-RESIDENCY-UNSUPPORTED`
**And** the two refusals read differently and each names what would make it
available
**And** neither substitutes an average, a national default or a zero

### BS-022-009 / SCN-022-009: A state that imposes no individual income tax returns a sourced zero

**Given** a household declaring residency in a state whose pack states it imposes
no individual income tax
**When** the state settlement is computed
**Then** the state total is a valued record of zero carrying a rule status and a
citation to the authority that establishes the absence
**And** it is visibly distinct from a refusal, from a blank and from a bare dash
**And** the combined total includes it as a real leg rather than skipping it

### BS-022-010 / SCN-022-010: California taxes preferential income as ordinary income

**Given** a California resident with ordinary income and a realized long-term gain
**When** the state settlement is computed
**Then** the gain is taxed in the same schedule as ordinary income, with no
preferential band applied
**And** the pack declares that it carries no preferential treatment rather than
the engine assuming it
**And** the federal settlement for the identical household still applies its
preferential bands

### BS-022-011 / SCN-022-011: California exemption relief is a credit applied after the rate

**Given** a California resident eligible for exemption credits
**When** the state settlement is computed
**Then** the credit is subtracted from the computed tax rather than from income
**And** the order is visible in the displayed stage list
**And** an implementation that subtracts the credit from income is demonstrated to
fail the assertion

### BS-022-012 / SCN-022-012: The California surcharge threshold does not vary by filing status

**Given** California residents in each supported filing status with taxable income
immediately below, exactly at, and immediately above the surcharge threshold
**When** the state settlement is computed
**Then** every filing status crosses at the identical threshold
**And** no exemption credit reduces the surcharge
**And** each of the three positions produces the known value derived from the
pack's own figures

### BS-022-013 / SCN-022-013: The combined total is order-independent and says so

**Given** a household with a resolvable federal pack and a resolvable state pack
**When** the combined settlement is computed
**Then** the combined total equals the sum of the two independent jurisdiction
totals
**And** settling the two in the opposite order produces a byte-identical result
**And** an implementation that feeds either total into the other's deduction is
demonstrated to fail the order-independence assertion

### BS-022-014 / SCN-022-014: The combined curve names the jurisdiction that owns each step

**Given** a household in a state that imposes an income tax
**When** the combined marginal rate curve is computed
**Then** each point carries a federal component, a state component and a combined
rate
**And** each segment's contributing thresholds are tagged with the jurisdiction
and the pack that owns them
**And** a step at a state bracket edge and a step at a federal bracket edge are
each placed exactly at their own edge rather than at a grid position

### BS-022-015 / SCN-022-015: A pack-year mismatch refuses rather than settling

**Given** a resolved federal pack and a resolved state pack whose declared
effective tax years do not both contain the declared year
**When** the combined settlement is attempted
**Then** the combined result is `RLTAX-PACK-YEAR-MISMATCH` naming both packs and
both year sets
**And** neither jurisdiction total is presented as a combined figure
**And** no threshold from either pack is carried into the other's year

---

## Requirements

### Provenance and the preferential completion

| ID | Requirement |
| --- | --- |
| FR-022-001 | A figure-bearing object carries a default citation and an optional list of per-component citations. A component's effective citation is its override when present and the default otherwise. |
| FR-022-002 | Every effective component citation names a source record whose retrieval outcome is `retrieved` and whose document kind is not a newsroom release. Any other case is refused by name. |
| FR-022-003 | Every effective component citation carries a locator naming the section, table or heading inside the cited authority. |
| FR-022-004 | The federal preferential rate table is carried for each filing status for which every component was retrieved, and is an absent figure for any status for which any component was not. |
| FR-022-005 | Preferential income is priced in the bands sitting above ordinary taxable income, and qualified dividends and long-term capital gains are pooled and taxed identically. |
| FR-022-006 | The pack names every preferential category it does not carry, including any category taxed above the pack's top preferential rate, and no code path folds an unnamed category into a carried band. |
| FR-022-007 | No figure is derived, interpolated, extrapolated, carried between tax years, or taken from a summary release. |

### The federal threshold surtaxes

| ID | Requirement |
| --- | --- |
| FR-022-008 | A jurisdiction's total is the sum of the tax legs the pack declares, and is a refusal if any declared leg is a refusal. No leg is treated as zero because it is unavailable. |
| FR-022-009 | The net investment income tax leg applies its pack rate to the lesser of net investment income and the excess of the modified adjusted gross income measure over the pack's filing-status threshold. |
| FR-022-010 | Tax-exempt interest is excluded from both the net investment income base and the modified adjusted gross income measure, and remains recorded. |
| FR-022-011 | The additional Medicare tax leg applies its pack rate to the excess of the declared wage basis over the pack's filing-status threshold, and uses no other income member. |
| FR-022-012 | Each surtax requires its own declared basis. An undeclared basis produces `RLTAX-INPUT-INCOMPLETE` naming the member. A declared zero is a real declaration and produces a computed zero. |
| FR-022-013 | The modified adjusted gross income measure declares its own completeness, and the result names every adjustment the pack does not model rather than implying the measure is complete. |
| FR-022-014 | The result states that added ordinary income can move the net investment income tax and cannot move the additional Medicare tax, and both facts are structural members rather than page copy. |

### The state contract and jurisdiction resolution

| ID | Requirement |
| --- | --- |
| FR-022-015 | A rule pack's jurisdiction is a pack field. No engine, resolver, curve or comparison names a state, a country or an authority. |
| FR-022-016 | State resolution requires a declared residency jurisdiction. An undeclared residency is `RLTAX-INPUT-INCOMPLETE` naming the member and is never treated as no state tax. |
| FR-022-017 | A declared state for which no pack ships is `RLTAX-JURISDICTION-UNSUPPORTED` naming the state and what would make it available. |
| FR-022-018 | A residency pattern outside single-full-year residency — part-year, multi-state, or non-resident source income — is `RLTAX-RESIDENCY-UNSUPPORTED`, which is a distinct condition from an unsupported jurisdiction. |
| FR-022-019 | A pack that states its jurisdiction imposes no individual income tax produces a valued total of zero carrying a rule status and a citation, and that record is structurally distinguishable from every refusal. |
| FR-022-020 | A pack declares whether it applies preferential treatment to any income kind. A pack that declares none applies its ordinary schedule to all supported income kinds without an engine branch on jurisdiction. |
| FR-022-021 | A pack declares the application point of every relief mechanism it carries, and the engine applies each at its declared point rather than at an assumed one. |

### The California pack

| ID | Requirement |
| --- | --- |
| FR-022-022 | The California pack applies its ordinary rate schedule to pooled ordinary, qualified-dividend and long-term-capital-gain income, and carries no preferential rate table. |
| FR-022-023 | The California pack carries its own standard deduction per filing status, distinct from the federal deduction, and applies it to its own taxable-income computation. |
| FR-022-024 | California exemption relief is carried as a credit with an application point after rate application, and is never applied as a reduction of income. |
| FR-022-025 | The California surcharge applies its pack rate above its pack threshold, and the threshold is identical for every filing status, including married filing jointly. |
| FR-022-026 | No credit is applied against the California surcharge. |
| FR-022-027 | Every California figure that could not be retrieved ships as an absent figure with a `missingSource` pointer, and the affected leg refuses rather than resolving. |

### The combined settlement and curve

| ID | Requirement |
| --- | --- |
| FR-022-028 | The federal and state settlements are computed independently. Neither consumes the other's output, and the combined result is order-independent. |
| FR-022-029 | The combined total is the sum of the jurisdiction totals and is a refusal if either is a refusal. A sourced zero is a real addend, not a skipped leg. |
| FR-022-030 | A household whose deduction mode is itemized receives an explicit coupling notice naming the unmodeled federal deduction for state income tax paid and stating that the declared amount was used exactly as declared. |
| FR-022-031 | The combined marginal rate curve carries, per point, a federal component, a state component and a combined rate, and carries no scalar average. |
| FR-022-032 | The combined curve's sample set is the union of both jurisdictions' threshold crossings, and each crossing is bracketed exactly rather than approximated by a grid position. |
| FR-022-033 | Every combined curve segment names its contributing thresholds, each tagged with the jurisdiction and pack that owns it, and a rate change with no attributable threshold is refused rather than rendered. |
| FR-022-034 | Two resolved packs whose declared effective tax years do not both contain the declared year produce `RLTAX-PACK-YEAR-MISMATCH` naming both packs and both year sets, and no combined figure. |

### Non-functional

| ID | Requirement |
| --- | --- |
| NFR-022-001 | Identical input produces a byte-identical result. No clock, random source or network value enters any computation. |
| NFR-022-002 | Zero network requests at runtime, including pack loading, proven by a request ledger rather than asserted. |
| NFR-022-003 | No household value — including the residency state and both new basis declarations — appears in any URL, query string, hash, request, referrer, console message or committed artifact. |
| NFR-022-004 | The refusal vocabulary is extended additively by exactly two members. No existing member's meaning changes. |
| NFR-022-005 | No module carries a bracket, rate, edge, threshold or jurisdiction name. A scan asserts it and is demonstrated to fail on a module that does. |
| NFR-022-006 | Every displayed value carries a contextual tooltip and every chart carries a text-equivalent table with an accessible label. |
| NFR-022-007 | `node scripts/selftest.mjs` stays green with no fall in the pre-existing pass count. No existing assertion is weakened. An assertion is edited only as a supersession admitted by the [Assertion Supersession Contract](#assertion-supersession-contract), which requires a named stronger replacement in the same change. |
| NFR-022-008 | No new root HTML file is created and `site-exclusions.json` is unchanged. |
| NFR-022-009 | Feature 008's files remain byte-identical, proven by a canary in every scope. |
| NFR-022-010 | Every pure analytic function is a top-level function declaration reachable by the selftest extractor, numeric guards use the finite-number predicate rather than the global, and no canvas drawing is wrapped in an animation-frame callback. |
| NFR-022-011 | Every superseded assertion has a ledger entry naming its file, line, superseded clause, owning scope and cause; a named replacement delivered in the same change; at least one adversarial case; and a `SUP-022-NN` marker beside the replacement in the source. The count of distinct markers in the repository equals the count of delivered ledger entries, and an assertion edited with no marker fails the check. |

---

## Blocking Implementation Inputs

Each item below must be resolved by retrieval at implementation time. An item
that cannot be retrieved ships as an `AbsentFigure/v1` and its dependent leg
refuses. None may be closed by derivation, recall or a secondary source.

A row marked **closed** means the authority question is settled and the document
is named, so the implementer no longer has to find one. It never means the figure
is supplied. Every closed row still requires the implementer's own retrieval and
its own `retrievedAt`.

| ID | Input | What must be retrieved | Consequence if not retrieved |
| --- | --- | --- | --- |
| BI-1 | **Closed as an authority question.** The authority is named and was opened: Rev. Proc. 2025-32 §4.03, IRB 2025-45, whose heading carries the tax-year-2026 label and which states a maximum zero rate amount and a maximum 15-percent rate amount for each of its four rows. See [`RL-3`](#research-leads-requiring-independent-re-retrieval). | The implementer still opens §4.03 and transcribes all eight amounts directly from it, recording its own `SourceRecord/v2` with its own `retrievedAt` and its own `declaredApplicableYearsByComponentKind`. Closure names the document; it does not supply the figure. | Unchanged: the preferential table is absent for any status whose amounts cannot be read, and the federal total refuses for households with preferential income in that status |
| BI-2 | Federal ordinary schedule for married filing separately and head of household | Rev. Proc. 2025-32, the ordinary rate schedule sections for those statuses | Carried forward from Feature 021 unchanged; those statuses continue to refuse |
| BI-3 | **Closed as an authority question.** The authority is named and was opened: Topic no. 409, which states the rate above the maximum 15-percent amount without a year qualifier and names three categories taxed above it — section 1202 stock at a maximum 28 percent, collectibles at a maximum 28 percent, and unrecaptured section 1250 gain at a maximum 25 percent. See [`RL-4`](#research-leads-requiring-independent-re-retrieval) and the scope decision below. | The implementer still opens Topic 409, transcribes the rate as a `componentSources[]` override on the top band, and transcribes the three category names into `unsupportedFeatures[]`. It takes **no** dollar figure from the page. | Unchanged: without the rate the preferential table is absent for every status; without the category names the pack cannot claim its table is correct for adjusted net capital gain and must refuse rather than under-declare |
| BI-4 | **Closed as an authority question.** The authority is named and was opened: IRS Publication 505 (2026), "For use in 2026", states both surtax rates and all filing-status thresholds with an explicit year label. It is an accepted primary authority for both threshold sets. See [`RL-5`](#research-leads-requiring-independent-re-retrieval). | The implementer still opens Publication 505 and transcribes each threshold directly from it, recording its own `SourceRecord/v2` with its own `retrievedAt`. Closure names the document; it does not supply the figure. | Unchanged: a threshold the implementer cannot read for the declared year is absent and the corresponding surtax leg refuses |
| BI-5 | Florida imposes no individual income tax for the declared tax year | A Florida Department of Revenue statement of the absence | `imposesIndividualIncomeTax` is absent and Florida resolves `RLTAX-THRESHOLD-UNAVAILABLE` rather than a sourced zero |
| BI-6 | Every California dollar figure: rate schedule bands per filing status, standard deduction per filing status, exemption credit amounts, and the surcharge threshold as applied to the declared year | California Franchise Tax Board publications for the declared tax year, and the statutory section for the surcharge | Each unretrieved figure is absent and its leg refuses; a California pack may ship with several absent figures |
| BI-7 | The California ordering of deduction, rate application, credit and surcharge | The statutory or Franchise Tax Board statement of the computation order | The pack cannot declare a calculation order and the California settlement refuses in full |

### Decision: the three above-20-percent preferential categories are deferred, not dropped

`BI-3`'s retrieval established three categories taxed above the pack's top
preferential rate: section 1202 qualified small business stock at a maximum 28
percent, collectibles at a maximum 28 percent, and unrecaptured section 1250 gain
at a maximum 25 percent. They are **explicitly deferred from this feature**, and
the deferral is recorded in three places so it cannot become a silent omission.

1. Coverage non-goal 10 excludes them by name.
2. `FR-022-006` requires the pack to name every preferential category it does not
   carry, so all three ship as `unsupportedFeatures[]` entries with their own
   reasons in Scope 01, and `SCN-022-003` is the scenario that proves no code path
   folds any of them into a carried band.
3. The [Deferral Register](#deferral-register--recorded-not-omitted) names their
   successor.

They are deferred rather than carried because each is a distinct rate ceiling with
its own qualifying rules, its own holding-period and basis conditions, and its own
authority — none of which was retrieved in this authoring session, and none of
which the three-band preferential table can express. Carrying them from the same
Revenue Procedure would be the derivation Sourcing Directive rule 2 forbids.
The honest position is a named unsupported feature with a named successor, and the
result is therefore never labelled a complete federal tax.

---

## Assumptions

1. Feature 021's shipped modules, contracts and refusal vocabulary are present and
   unchanged at the start of this feature.
2. The declared tax year remains a single year across both jurisdictions.
3. A household declares exactly one residency jurisdiction for the whole year;
   any other pattern is refused rather than modeled.
4. The four supported income kinds are unchanged. The two new basis members
   qualify existing income rather than adding a fifth kind, so the gross-income
   identity is unchanged.
5. The declared itemized amount is used exactly as declared, with the coupling
   notice above.

---

## Open Questions

| ID | Question | Routed to |
| --- | --- | --- |
| OQ-022-001 | If a California figure and the surcharge threshold resolve but the ordering does not, should the pack ship with a partial calculation order or refuse in full? | `design.md` — resolved there in favour of refusing in full |
| OQ-022-002 | Should the combined curve sweep the same input level for both jurisdictions, given that the two taxable-income definitions differ? | `design.md` |
| OQ-022-003 | What is the correct rendering for a sourced zero in the combined total so it is distinguishable from a refusal without reading text? | `design.md`, then the route scope |
| OQ-022-004 | Does a second state pack in Feature 024 require a sub-state jurisdiction axis, or is the postal-code path sufficient? | Feature 024 |
| OQ-022-005 | Should the modified adjusted gross income measure become its own contract once Feature 023 adds taxable Social Security benefits, which consume it? | Feature 023 |

---

## Acceptance Criteria

- Every figure in every shipped pack carries an effective component citation
  naming a retrieved, non-newsroom authority with a locator.
- A household with preferential income receives a valued federal total, exact at
  every carried breakpoint.
- Both surtax legs compute from their own declared basis and refuse without one.
- A conversion is demonstrated to move one surtax and not the other.
- California and Florida both resolve through the same contract with no
  jurisdiction-named branch in any engine.
- Florida returns a sourced zero that is structurally distinguishable from a
  refusal.
- The combined total is proven order-independent by an adversarial mutation.
- The combined curve tags every contributing threshold with its jurisdiction.
- Two new refusal codes exist, each for a genuinely new condition, and no existing
  code's meaning changed.
- Every one of the twenty-one ledger entries in the
  [Assertion Supersession Contract](#assertion-supersession-contract) was
  delivered with its named replacement in the same change, each replacement is at
  least as strong as what it superseded, each carries its adversarial case, and
  each carries its `SUP-022-NN` marker. No assertion outside the ledger was
  edited.
- `node scripts/selftest.mjs` is green with no fall in the pre-existing pass count.

---

## Traceability

| Scenario | Business scenario | Requirements | Scope |
| --- | --- | --- | --- |
| SCN-022-001 | BS-022-001 | FR-022-001, FR-022-002, FR-022-003 | 01 |
| SCN-022-002 | BS-022-002 | FR-022-004, FR-022-005, FR-022-007 | 01 |
| SCN-022-003 | BS-022-003 | FR-022-006 | 01 |
| SCN-022-004 | BS-022-004 | FR-022-009, FR-022-010, FR-022-012, FR-022-013 | 02 |
| SCN-022-005 | BS-022-005 | FR-022-011, FR-022-012 | 02 |
| SCN-022-006 | BS-022-006 | FR-022-008, FR-022-014 | 02 |
| SCN-022-007 | BS-022-007 | FR-022-016 | 03 |
| SCN-022-008 | BS-022-008 | FR-022-017, FR-022-018 | 03 |
| SCN-022-009 | BS-022-009 | FR-022-015, FR-022-019 | 03 |
| SCN-022-010 | BS-022-010 | FR-022-020, FR-022-022 | 04 |
| SCN-022-011 | BS-022-011 | FR-022-021, FR-022-023, FR-022-024 | 04 |
| SCN-022-012 | BS-022-012 | FR-022-025, FR-022-026, FR-022-027 | 04 |
| SCN-022-013 | BS-022-013 | FR-022-028, FR-022-029, FR-022-030 | 05 |
| SCN-022-014 | BS-022-014 | FR-022-031, FR-022-032, FR-022-033 | 05 |
| SCN-022-015 | BS-022-015 | FR-022-034 | 05 |
