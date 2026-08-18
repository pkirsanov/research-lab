# Feature: 024 Social Security And Medicare (Slice 4)

Feature directory: `specs/024-social-security-and-medicare`
Repository: `research-lab`
Specification owner: `bubbles.analyst`
Design owner: `bubbles.design` — [`design.md`](design.md)
Planning owner: `bubbles.plan` — [`scopes/_index.md`](scopes/_index.md)
Direct predecessor: [`specs/023-property-tax-and-rental-income`](../023-property-tax-and-rental-income/spec.md)

This specification is the direct successor to Feature 023. It opens the
retirement axis: what a household's Social Security benefit actually is, how much
of it the federal return picks up, what a different claim age does to the
arithmetic, and what Medicare costs once an income-related adjustment is applied
two years after the income that caused it.

It inherits Feature 021's, Feature 022's and Feature 023's contracts, the closed
`RLTAX-*` refusal vocabulary, the `AbsentFigure/v1` discipline, the
`SourcedZero/v1` distinction, the leg-visibility rule and the privacy boundary
without weakening any of them. It extends no closed set: **this feature adds no
refusal code**, and it adds no income kind. Six candidate conditions were
considered and each folds into an existing member, named individually in
[design.md](design.md#refusal-conditions-folded-into-existing-members).

---

## Problem Statement

Feature 023 can settle income tax across two jurisdictions and price a house.
It knows nothing about the two largest cash flows a retired household has: the
benefit coming in and the premium going out. Four separate holes sit behind that.

**The first is that the federal pack already names both and models neither.**
`tax-rules/federal/2026.json` carries `taxable-social-security-benefits` and
`irmaa-bands` in its `unsupportedFeatures[]` ledger, and both are flagged
`movesMarginalRate`. The tool therefore tells a user that its marginal-rate curve
is incomplete *because* of these two, and then offers no way to complete it. That
is honest, and it is also the whole of the retirement answer missing.

**The second is that a benefit figure has two legitimate origins and they are not
interchangeable.** A household reading a Social Security statement has a Primary
Insurance Amount computed by the Social Security Administration from an earnings
record the household cannot fully reconstruct. A household without a statement
has only earnings. A tool that accepted one number called "benefit" would be
unable to say whether the figure carried the authority of an agency computation
or the authority of a user's arithmetic — and the two carry different confidence,
different failure modes and different remediations. The computed path is also
dependent on a wage-indexing series that may not be retrievable at all, which
means the two paths can fail independently and must be able to.

**The third is that the taxation thresholds are the only figures in this whole
program that do not move.** The base amounts that decide whether none, half or up
to eighty-five percent of a benefit is included are statutory and are not
inflation-indexed. That makes them the strongest candidate this program has met
for a `yearInvarianceBasis` — and precisely for that reason the strongest
temptation to assume it. Feature 023 learned the shape of this problem the hard
way across three publications: Publication 936 served only a prior-year edition
and was refused outright; Publication 925's dollar figures were all refused;
Publication 527's method parameters and qualifier figures were carried on a
documented invariance basis established from the publication's own dating
contrast. Invariance is a **finding**, not a property of a figure's category.

**The fourth is that the Medicare adjustment is computed from an income year the
tool is not settling.** The income-related monthly adjustment applies to a
premium year using a modified adjusted gross income from two years earlier. A
tool holding a current-year income figure will reach for it, because it is right
there and it is the same shape. Every such reach produces a number that is
plausible, wrong, and undetectable by the user. The lookback figure is a
different fact about a different year, and the only safe design is one in which
the current year's income physically cannot arrive at the adjustment.

Two failure modes still matter more than accuracy, because a user cannot detect
either:

1. **A plausible number in place of a refusal.** An assumed invariance, an
   assumed lookback and an inflation-adjusted-from-memory bracket are all
   averages wearing a calculation's clothes.
2. **A computed leg that never reaches the page.** Feature 022's validation found
   a headline rendering `ordinaryTax` where `totalFederalTax` belonged,
   understating tax owed by up to eighty-eight percent, latent only because the
   hidden legs happened to be zero. This feature adds four more legs, three of
   which are costs rather than taxes and must therefore be surfaced everywhere
   and summed nowhere.

---

## Outcome Contract

**Intent.** A household that declares either its Primary Insurance Amount from a
Social Security statement or the earnings the computation needs, its birth year,
its intended claim age, its other income and its modified adjusted gross income
from two years before the premium year, learns four things Feature 023 could not
tell it: what the annual benefit is at the claim age it is considering and which
sourced adjustment produced it, how much of that benefit the federal return
includes and which tier decided it, how the arithmetic differs across claim ages
on a declared mortality basis with no probability attached, and what Medicare
costs once the income-related adjustment for its declared lookback year is
applied. Everything the tool cannot compute is still named, not omitted.

**Success signal.** For the declared tax year, an independent reader can take the
displayed result, the displayed reconciliation identity and the displayed source
records, and re-derive every figure from the cited primary sources without
consulting this repository — including which figures came from the household,
which came from an authority, which authority year each figure belongs to, and
which figures are costs rather than taxes. Every computed leg appears in the
headline, the comparison, the marginal curve and the export, and an assertion
fails if any one of them is computed and not surfaced, or is a cost and summed
into a tax total.

**Hard constraints.**

- Every rate, threshold, bend point, factor, percentage, premium, bracket
  boundary and table row in any pack is transcribed from a primary source
  actually retrieved at implementation time, cited inline with source title, URL,
  `retrievedAt` and a locator naming the section, table or line. No figure comes
  from memory, a secondary site, interpolation, derivation, or another year.
- **Publication edition year is judged per component kind, per publication.** A
  figure whose publication served only a prior-year edition is refused unless the
  publication's own text establishes that the component kind does not vary by
  year. That basis is a written `yearInvarianceBasis` quoting the contrast the
  publication itself draws. An invariance asserted from category, from
  plausibility, or from this specification is not a basis.
- **Declared and sourced are separate object kinds and refuse differently.** A
  Primary Insurance Amount read off a statement, an earnings record, a birth
  year, a claim age and a lookback modified adjusted gross income are household
  declarations; missing ones refuse `RLTAX-INPUT-INCOMPLETE`. A bend point, a
  full-retirement-age row, a reduction factor, a base amount, a premium and a
  bracket boundary are sourced rules; unretrieved ones ship `AbsentFigure/v1` and
  refuse `RLTAX-THRESHOLD-UNAVAILABLE`. The two are never rendered the same way.
- Whatever a retrieval genuinely fails to establish ships as an `AbsentFigure/v1`
  and its dependent leg refuses. That discipline is not weakened to improve
  coverage.
- Unavailable is never `0`, never `null`, never a missing key and never a dropped
  leg. `SourcedZero/v1` remains a distinct object from every unavailable shape.
- Every result field carries a rule status from the closed enum
  `enacted-current-law` · `enacted-scheduled-law` · `user-hypothetical-law` ·
  `unavailable`.
- The refusal vocabulary is **not extended**, and neither is the supported
  income-kind list. Every condition this feature raises is an existing member.
- **No probability of any kind, and specifically no probability of plan success.**
  The mortality source is used for its deterministic life-expectancy column only;
  a probability-bearing column is not carried, and a pack member that carries one
  is refused. No market simulation. No Monte Carlo. No appreciation assumption.
  No ranking. No recommendation. No future-year premium, benefit or tax figure.
- No published error rate, self-invalidation statistic, track record or accuracy
  figure anywhere in spec text, scope text or user-facing copy.
- Local-only. Zero network requests at runtime. No household value — including
  the earnings record, the birth year, the claim age and the lookback modified
  adjusted gross income — in any URL, query string, hash, request, referrer,
  console message or committed artifact.
- Educational only. Not tax advice. Does not prepare or file a return.

**Failure condition.** The feature fails — even with every test green — if a user
can read a retirement figure and be unable to tell whether it came from an
authority or from their own keyboard; if a current-year income figure can reach
the income-related adjustment through any path; if an invariance basis is
recorded without the publication's own contrast behind it; if any computed leg
exists in the record and not on the page; or if a premium appears inside a
federal tax total.

---

## Resolved Decisions

### RD-1: Two benefit-basis origins, each able to fail alone

**Decision.** `BenefitBasis/v1` carries a `basisOrigin` from the closed set
`declared-statement-pia` · `computed-from-earnings`. The declared path takes a
Primary Insurance Amount the household read off its Social Security statement and
treats it as authoritative for the household, carrying no `sourceRef` and
labelled as the household's own input. The computed path takes a declared
earnings record and computes an Average Indexed Monthly Earnings and then a
Primary Insurance Amount through the sourced bend-point formula. Neither path is
a fallback for the other: a household that supplies neither refuses
`RLTAX-INPUT-INCOMPLETE` naming both, and a household that supplies both is
refused rather than silently reconciled.

**Why.** The statement figure is the agency's own computation over an earnings
history the household cannot reconstruct, so it is the better figure whenever it
exists. The computed figure is the only figure available to a household without a
statement, and it depends on a wage-indexing series that is a separate retrieval
and may fail on its own. Making the two a single input with a hidden preference
order would mean a user could not tell which arithmetic produced the number in
front of them, and a failed indexing retrieval would silently degrade a
statement-backed answer that never needed it.

**Consequence.** The computed path can be entirely unavailable while the declared
path settles, and the panel must say so without implying the declared figure is
degraded. A household supplying both is a genuine ambiguity and is refused, not
resolved by precedence.

### RD-2: The taxation base amounts are an invariance finding, not an invariance category

**Decision.** The base amounts that select the inclusion tier may be carried from
a publication edition other than the declared tax year **only** when the
publication's own text establishes that they do not vary by year, and the
`yearInvarianceBasis` records that text and its locator. Absent that contrast the
base amounts ship as `AbsentFigure/v1` and the inclusion refuses. The invariance
is recorded per component kind: a `breakpoint` kind may be invariant in the same
publication in which an `amount` kind is not.

**Why.** These thresholds genuinely are statutory and genuinely are not indexed,
which is exactly why assuming it is dangerous. Feature 023 met three
publications: one served only a prior-year edition and was refused outright, one
had every dollar figure refused, and one had method parameters carried on a
documented basis drawn from the publication's own dating contrast. The difference
between the three was never the category of the figure. It was what the
publication said about itself.

**Consequence.** The retrieval may succeed and the basis may still fail, in which
case the inclusion refuses on a figure the implementer is holding. That outcome
is correct and a scope may not route around it.

### RD-3: The lookback income cannot reach the adjustment

**Decision.** The income-related monthly adjustment is resolved by a function
whose parameters are a `LookbackMagi/v1` and a bracket pack, and nothing else.
The settlement's current-year income, its modified adjusted gross measure and its
workspace are not parameters, are not reachable through a closure, and are not
members of either argument. The lookback year is a declared member of
`LookbackMagi/v1` and is asserted to be the premium year minus the pack's own
declared lookback offset, refusing when it is not.

**Why.** The adjustment applies a premium year's brackets to an income figure
from an earlier year. A current-year figure has the same units, the same shape
and the same name, so any code path that can see it will eventually use it, and
the resulting number is plausible and undetectably wrong. Feature 023 solved the
same class of problem by making `computePropertyTax` structurally incapable of
receiving an income figure. This is that pattern applied to the case where the
wrong figure is not merely irrelevant but confusable.

**Consequence.** The lookback figure is a mandatory declaration with no default
and no inference. A household that has not supplied it gets a refusal naming the
year it must supply, and the offset that produced that year is shown.

### RD-4: A premium is a cost leg, and the exclusion clause becomes non-vacuous

**Decision.** The Part B premium, the Part D premium and the income-related
adjustment are declared legs with `includedInTotal: false`. They are surfaced in
the headline, the comparison, the marginal curve and the export like every other
leg, and they are summed into a separately published annual Medicare cost that is
never added to any tax total. An unretrieved premium refuses rather than shipping
as a display-only leg, because `includedInTotal: false` is a display mechanism
and not a mechanism for excluding a refusal from a total.

**Why.** A premium is a real household outflow and hiding it would defeat the
point of the feature, but it is not tax and a total that included it would be
wrong in the direction users are least able to check. The pack contract already
carries `includedInTotal` and already refuses a `false` leg whose figure is
absent, so the honest design uses that seam rather than inventing a parallel one.

**Consequence.** Reconciliation identity `L4` — *the sum of every declared leg
whose `includedInTotal` is true equals `totalFederalTax`* — has never had a leg to
exclude. This feature gives it three, which makes its exclusion clause
non-vacuous for the first time. A DoD item requires that fact to be asserted
rather than assumed, and a mutation that flips a premium leg to `true` must be
demonstrated to fail.

### RD-5: The claim-age comparison is arithmetic, and it is not renamed to pass a scan

**Decision.** The comparison reports, for each declared claim age, the adjusted
annual benefit and the cumulative benefit total to the life-expectancy age the
mortality pack carries, plus the age at which two claim ages' cumulative totals
are equal. That last figure is labelled as the age at which the two cumulative
totals are equal, and the record states in its own text that it is arithmetic
over declared figures rather than a prediction. The mortality pack carries the
life-expectancy column only; a probability-bearing member is refused. The record
carries no discount rate, no appreciation assumption, no ranking, no
recommendation and no probability member.

**Why.** This is a break-even-style output, and the program already forbids a
break-even year in five separate detectors because such a claim is a prediction
about the future. The resolution is not to rename the member until the detectors
stop firing — that would be evasion, and evasion is the failure mode the
supersession contract exists to prevent. The resolution is to make the claim
genuinely weaker than the one the detectors forbid: an equality of two sums over
declared inputs is a fact about arithmetic, and it is stated as one.

**Consequence.** The claim-boundary detectors are **strengthened**, not
superseded. The new module and the mortality pack are added to the scanned file
sets, the forbidden tokens stay forbidden in all of them, and the claim-age
record gets its own exhaustive member enumeration proving no forbidden member
name appears anywhere inside it. No ledger entry is admitted for this family, and
[the reasoning is recorded below](#assertions-considered-and-not-superseded) so a
later reader can tell a cleared assertion from an unexamined one.

### RD-6: No new income kind

**Decision.** The included portion of the benefit is ordinary income and enters
the existing `ordinary` kind. `SUPPORTED_INCOME_KINDS` is unchanged and the
pack's `incomeKinds` member is unchanged. The gross benefit is a declared
workspace member and is not an income kind at all.

**Why.** The statute includes a portion of the benefit in gross income taxed at
ordinary rates. A separate kind would create a second place where ordinary income
lives, and every downstream rule that reads ordinary income would have to be
taught about it — which is how a rule silently applies to one half of a quantity.

**Consequence.** The composition that produces ordinary taxable income gains a
named contributor rather than a new kind, and the assertion pinning the
income-kind list to four members is cleared rather than superseded.

---

## Sourcing Directive

This section is inherited verbatim in force from
[Feature 022](../022-federal-preferential-and-state-income-tax/spec.md#sourcing-directive)
and [Feature 023](../023-property-tax-and-rental-income/spec.md#sourcing-directive),
and binds every pack in this feature.

1. **Retrieved or absent.** A figure enters a pack only from a primary source the
   pack author retrieved directly in the implementing session, recorded in a
   `SourceRecord` whose `retrievalOutcome` is `retrieved`. There is no third
   state.
2. **No derivation.** A figure is never computed, interpolated, extrapolated,
   inferred from an adjacent figure, carried from another year, recalled, or read
   off a secondary aggregator.
3. **Per-component citation.** Where the components of one figure-bearing object
   come from different authorities, each cites its own.
4. **The locator is part of the citation.** A `sourceRef` without a locator naming
   the section, table, line or column is not a citation.
5. **Cross-checking is not sourcing.** Agreement between a summary and a detail
   authority is a `retrievalNote`, never a promotion.
6. **A sourced zero is a figure.** A tier that adds nothing carries a valued
   record with a citation, not an absent one and not a missing key.
7. **This specification is not a transcription source.** No figure in this
   document may be transcribed into a pack. This document contains no figure.
8. **A declaration is not a source.** A household-declared Primary Insurance
   Amount, earnings record, birth year, claim age or lookback modified adjusted
   gross income is neither sourced nor absent; it is declared, carries no
   `sourceRef`, and is labelled as the household's own input wherever displayed.
9. **Edition year is judged per component kind.** A publication serving an
   edition other than the declared tax year yields a figure only when the
   publication's own text establishes that the component kind does not vary by
   year, recorded as a written `yearInvarianceBasis` with its locator. Category,
   plausibility and prior features' findings are not bases.

### Named authorities for this feature

Each is a likely authority for the input beside it. None has been retrieved by
this planning session, and none may be transcribed from this table. Each must be
retrieved at implementation time, and an input that cannot be retrieved ships as
an `AbsentFigure/v1` while its leg refuses.

| Input | Likely authority |
| --- | --- |
| Primary Insurance Amount bend points and the formula percentages | Social Security Administration, the benefit-formula and bend-point pages |
| Average wage indexing series used to index an earnings record | Social Security Administration, the wage-indexing pages |
| Full retirement age by year of birth | Social Security Administration, the full-retirement-age pages |
| Early-claiming reduction factors and their per-month rates | Social Security Administration, the early-retirement reduction pages |
| Delayed retirement credit rate by year of birth and the age at which credits stop | Social Security Administration, the delayed-retirement-credit pages |
| Provisional income composition, the base amounts per filing status, and the inclusion tier arithmetic | Internal Revenue Service, Publication 915 |
| Whether the base amounts vary by year | Internal Revenue Service, Publication 915, read for its own dating contrast |
| Period life table life expectancy by age | Social Security Administration, the actuarial period life table |
| Standard Part B premium and the Part D base beneficiary premium | Medicare.gov and the Centers for Medicare and Medicaid Services |
| Income-related monthly adjustment bracket boundaries and the Part B and Part D adjustment amounts per filing status, and the declared lookback offset | Centers for Medicare and Medicaid Services |

---

## Assertion Supersession Contract

This section is inherited from
[Feature 022](../022-federal-preferential-and-state-income-tax/spec.md#assertion-supersession-contract)
and [Feature 023](../023-property-tax-and-rental-income/spec.md#assertion-supersession-contract)
and is normative here. Rules ASC-1 through ASC-8 apply unchanged. ASC-9 is added
by this feature and closes a hole ASC-5 leaves open.

### The distinction

| | Weakening — always forbidden | Supersession — permitted under the rules below |
| --- | --- | --- |
| What changed first | The implementation broke | An approved scope deliberately changed the behaviour |
| Why the assertion is touched | It is in the way | It pins a fact that is no longer the fact |
| What replaces it | Something looser, or nothing | A named replacement that is at least as strong |
| The original protection | Lost | Preserved in the new world |
| Discoverable afterwards | Only by reading the diff | By reading the ledger below |

A red suite is evidence of one of these two situations. It is never, by itself,
evidence of which one.

### Admission rules

| ID | Rule |
| --- | --- |
| ASC-1 | **Cause.** An assertion may be superseded only when an approved scope of this feature deliberately changes the behaviour it pinned, and only when that scope's requirement coverage names the `FR-024-*` or `NFR-024-*` requirement mandating the change. Convenience, difficulty, a red suite, a deadline and a large diff are never sufficient cause. |
| ASC-2 | **Individual naming.** Every superseded assertion is named individually in the ledger below: the file, the approximate line, the exact clause it asserted, the owning scope, and why the change is deliberate. A group, a file and a "related assertions" phrase are not names. |
| ASC-3 | **Same-change replacement.** Every superseded assertion is replaced in the same change by a named assertion that preserves the original protection in the new world. Deletion without a named replacement is forbidden. A replacement deferred to a later scope is a deletion. |
| ASC-4 | **At least as strong, and derived.** The replacement asserts everything the original asserted that is still true, plus the rule the new behaviour introduces. Where the original was a brittle literal, the replacement derives its expected value from the artifact it describes, so it cannot rot into a false green. |
| ASC-5 | **Adversarial case.** Every replacement carries at least one adversarial case that fails if the new behaviour regresses to the old defect, and at least one that fails on a fabricated figure. |
| ASC-6 | **Ledger and marker.** Each delivered replacement carries a `SUP-024-NN` marker beside it in the source, so the ledger and the code are greppable against each other. |
| ASC-7 | **No vacuous branch.** Where a replacement splits into a branch for the new behaviour and a retained branch for the old, the retained branch runs against a fixture the implementer controls and is asserted to have been exercised at least once. |
| ASC-8 | **In-flight admission, without a planning round trip.** The ledger below is pre-populated with every supersession this planning session could predict from the tree it read. It is explicitly **not** closed. An implementer who meets a pre-existing assertion that fails for an ASC-1 cause not already in the ledger **admits a new entry in place** — appending a row here with the next free `SUP-024-NN`, its target, its owning scope and its traded protection — and proceeds under ASC-2 through ASC-7 without returning to planning. A ledger addition updates **all four surfaces in the same change**: the ledger row, the opening count paragraph, the ownership table in [`scopes/_index.md`](scopes/_index.md#ownership), and the per-file marker distribution in [`design.md`](design.md#per-file-marker-distribution). What the implementer may **not** do is edit an assertion without an entry, admit an entry whose cause is not ASC-1, or leave the entry unrecorded until the end of the scope. |
| ASC-9 | **Renaming to pass a detector is a weakening, not a supersession.** Where a delivered member name, attribute value or user-facing string would be caught by a pre-existing forbidden-token scan, the permitted responses are to make the delivered claim genuinely weaker than the one the scan forbids, or to supersede the scan under ASC-1 through ASC-8. Choosing a synonym so that the same claim passes the same scan is a weakening under any circumstance, is not admissible to this ledger, and does not become admissible because the suite goes green. A scope that changes a name in the neighbourhood of a forbidden token records in its `report.md` which of the two permitted responses it took and why. |

### What this contract does not permit

- Relaxing a sourcing rule. An unretrieved figure still ships as an
  `AbsentFigure/v1` and its leg still refuses. No entry here touches the
  [Sourcing Directive](#sourcing-directive), and none ever may. In particular no
  entry may relax the per-component-kind edition-year judgement in rule 9.
- Loosening a tolerance, widening a numeric range, converting an equality to an
  inequality, or replacing a value assertion with a truthiness check.
- Deleting an adversarial case, a determinism assertion, a privacy assertion, a
  zero-network assertion, a claim-boundary assertion, or a Feature 008
  byte-identity canary.
- Removing a Playwright test, renaming a persistent test title, or changing a
  `--grep` selector.
- Superseding an assertion belonging to a feature this feature does not extend.
- Changing the pre-existing selftest pass count downward.

### Supersession ledger

Twelve pre-existing assertions are superseded, each by a named stronger
replacement. **Two are owned by Scope 01, five by Scope 02, none by Scope 03,
five by Scope 04 and none by Scope 05.** Two plus five plus zero plus five plus
zero is twelve, which must equal the row count of this table, the total this
paragraph states, the sum of the ownership column in
[`scopes/_index.md`](scopes/_index.md#ownership), and step 4 of `design.md`'s
[marker check](design.md#the-marker-check). The ledger is open under ASC-8 and
the implementer may append, updating all four surfaces in the same change.
SUP-024-09 was appended under ASC-8 during Scope 01 and all four surfaces were
updated in that same change. SUP-024-10, SUP-024-11 and SUP-024-12 were appended
under ASC-8 during Scope 04. SUP-024-10's marker was written into
`scripts/selftest.mjs` before its ledger row existed, which is an incomplete
admission rather than a permitted one; the row below closes it and the count
surfaces are corrected in the same change as SUP-024-11 and SUP-024-12. The eight
entries before them were pre-authored.

Every target below was read from the repository tree during this planning
session. Line numbers are approximate and are re-resolved at implementation time.

| ID | Target | Owning scope | Protection traded for |
| --- | --- | --- | --- |
| SUP-024-01 | `scripts/selftest.mjs` ~L12242 — TP-01-10's `taxExtracted === 26`, a hand-maintained count of the pure functions the brace-matching extractor must be able to lift out of the tax modules | 01 | Cause: FR-024-001 through FR-024-005 add a module of pure analytic functions, so a literal describing the pre-feature module set stops describing the tree. Traded for: a count DERIVED from the modules the extractor is pointed at, with the per-module breakdown asserted so a module contributing zero extractable functions fails by name; the clauses that no module is ESM, that no source uses the bare global `isFinite`, and that every module completes its UMD attachment are retained verbatim and re-asserted over the widened set. Strictly stronger because the literal passes when a new module's functions are written as arrow consts and are silently never extracted, while the derived form names the module that contributed nothing. Adversarial cases assert the derived count falls when a top-level declaration is rewritten as an arrow const, and that a module added to the scan set with no extractable function is reported by name |
| SUP-024-02 | `scripts/selftest.mjs` ~L12249 — the `requiredUnsupportedIds` literal, and the accounting SUP-022 and SUP-023 built over it, insofar as they require `'taxable-social-security-benefits'` to be a named not-carried feature of the shipped federal pack | 02 | Cause: FR-024-013 moves that id out of `unsupportedFeatures[]` into a modelled inclusion, so a clause requiring it to be surfaced as not-carried pins a fact that is no longer the fact. Traded for: the id is asserted ABSENT from the not-carried set and PRESENT as the inclusion policy the pack's own tier declaration carries, with the accounting between the two proven disjoint and exhaustive. Strictly stronger because a deletion with nothing modelled in its place fails both halves rather than passing one; every other id in the literal keeps its clause verbatim and is asserted still named |
| SUP-024-03 | `scripts/selftest.mjs` ~L13294 and ~L13308 — TP-03-07's `surgicalRemoval` triple `['taxable-social-security-benefits', 'irmaa-bands', 'premium-tax-credit'].every((id) => contributorIds.indexOf(id) >= 0)` together with the clause `Social Security benefits, IRMAA and the premium tax credit are still named so the removal was surgical` | 02 | Cause: the same FR-024-013 move removes the first member from the marginal-rate contributor set, so a triple asserting all three are still named fails BECAUSE the feature did what it was asked to do. Traded for: a split. The surgical-removal clause is retained verbatim over the members this feature does not model, and the moved member gains the stronger moved-not-deleted clause the surtax already carries — absent from the contributor set AND present as a declared contributor to ordinary taxable income whose figure resolves. Strictly stronger because the triple could not distinguish a member that moved into a modelled leg from one that was culled, while the replacement fails differently for each; per ASC-7 the retained branch is exercised against the shipped pack, in which `'premium-tax-credit'` is still not carried |
| SUP-024-04 | `tests/lifetime-tax-marginal.spec.mjs` L167 — the browser-side literal `['taxable-social-security-benefits', 'irmaa-bands', 'premium-tax-credit'].forEach((id) => expect(domains).toContain('marginal-contributor:' + id))` | 02 | Cause: the same move, on the surface that renders the contributor list. Traded for: the not-carried contributor set is READ from the pack's own `movesMarginalRate` entries and asserted equal in both directions to the rendered domain set, so a member this feature models is absorbed by the derivation and a member it does not model is still required to be rendered. Strictly stronger because a hand-maintained triple must be edited by every feature that models one of its members, and that edit is indistinguishable from one hiding a contributor that stopped rendering; Scope 04's removal of `'irmaa-bands'` is then absorbed without a further entry, which is the whole point of deriving it |
| SUP-024-05 | `scripts/selftest.mjs` ~L15531 and ~L15828 — the recorded pre-feature top-level member list used by SUP-023-12's derived reconstruction, which asserts the federal pack's member set partitions exactly into that recorded list plus Feature 023's declared additions | 02 | Cause: FR-024-010 and FR-024-011 require the inclusion policy to live in the federal pack, so Scope 02 inserts a top-level member that is in neither half of the declared partition and the assertion fails for an ASC-1 cause. Traded for: the partition gains a third declared term — this feature's own additions list — and the assertion is re-expressed so that each feature's additions are named separately and a member belonging to no named term fails by name rather than by count. Strictly stronger because the same pre-feature digest constant is retained and re-asserted unchanged over the same reconstructed bytes, the smuggling route SUP-023-12 closed stays closed, and a fourth feature's additions no longer require re-deriving the check; Scope 04's medicare policy member is absorbed by the same term |
| SUP-024-06 | `scripts/selftest.mjs` ~L12249 — the same `requiredUnsupportedIds` literal, insofar as it requires `'irmaa-bands'` to be a named not-carried feature | 04 | Cause: FR-024-024 moves that id out of `unsupportedFeatures[]` into three declared premium legs, so the clause pins a fact that is no longer the fact. Traded for: the id is asserted ABSENT from the not-carried set and PRESENT as the bracket policy the pack's own adjustment declaration carries, with the same disjoint and exhaustive accounting SUP-024-02 establishes and with the additional clause that the moved id resolves to legs whose `includedInTotal` is false. Strictly stronger because the accounting now proves not only that the id moved but that it moved to the correct side of the tax total |
| SUP-024-07 | `scripts/selftest.mjs` ~L13314 through ~L13320 — SUP-022-10's adversarial probe, which builds `deletedNotMovedPack` by filtering `'irmaa-bands'` out of both `unsupportedFeatures` and `taxLegs` and asserts the id is then accounted for in neither, using `'irmaa-bands'` as an id the shipped pack carries only on the unsupported side | 04 | Cause: FR-024-024 makes `'irmaa-bands'` a declared leg in the shipped pack, so the probe's premise — that removing it from both lists is a deletion rather than a move — inverts, and the adversarial case stops proving what it was written to prove. Traded for: a relocation. The probe is re-pointed at an id the shipped pack still carries only as unsupported, chosen from the pack at run time rather than named as a literal, and gains a second arm that applies the same deletion to a genuinely modelled id and asserts THAT is caught too. Strictly stronger because the probe now proves the guard fires on both sides of the move rather than on one, and because choosing the probe id from the pack means a later feature modelling that id cannot silently render the adversarial case vacuous |
| SUP-024-08 | `tax-rules/federal/2026.json` — the `modifiedAdjustedGrossCompleteness.unmodeledAdjustments` entry reading `the taxable portion of Social Security and railroad retirement benefits`, together with the assertion pinning that array's content, re-resolved at implementation time | 02 | Cause: FR-024-010 models the Social Security half of that entry, so an entry naming both as unmodelled states something false about half of itself. Traded for: a split. The entry is replaced by one naming railroad retirement benefits alone, retained verbatim as to that half, and the completeness record gains a positive clause naming the Social Security inclusion among the adjustments it now DOES model. Strictly stronger because the original could be satisfied by deleting the entry outright, while the replacement requires the modelled half to appear on the modelled side; if the re-resolution finds no assertion pinning the array's content, the replacement is delivered as a new assertion pinning both halves verbatim in the same change, which is stronger than the unpinned string it replaces |
| SUP-024-09 | `tests/lifetime-tax-foundation.spec.mjs`, `tests/lifetime-tax-route.spec.mjs` and `tests/lifetime-tax-property.spec.mjs` — the pack half of SUP-023-10's `declaredRouteAssets()` derivation, `[config.rules.packPath].concat(Object.keys(config.rules.statePackPaths ‖ {})…).concat(Object.keys(config.rules.propertyPackPaths ‖ {})…)`, which names the three pack families one key at a time. Admitted under ASC-8 during Scope 01 | 01 | Cause: FR-024-006 and FR-024-007 add a fourth pack family, and the route must read the benefit pack from disk before first paint. SUP-023-10 derived the permitted asset PATHS but hand-listed the FAMILIES, so the benefit pack is a request the page genuinely makes and the derivation genuinely does not admit — the three privacy-ledger assertions fail for an ASC-1 cause. Traded for: the pack set is derived from EVERY pack-path member `config.rules` declares — a member whose name ends in `packPath`/`PackPath` is one path, one ending in `PackPaths` is a map of paths — and the route is changed to DECLARE its benefit pack in that same configuration surface rather than assembling the path inline. Strictly stronger because a hand-listed family set must be edited to admit each new family and that edit is indistinguishable from one admitting a leak, while the derived form admits only what the configuration itself declares; Scopes 03 and 04 add a mortality and a medicare family and are absorbed without a further entry. Adversarial cases assert the benefit family the superseded set excluded is present, that both declaration shapes are derived so a capitalisation-only match cannot silently drop the federal pack, that a family named only in a constructed configuration is derived from it, and that `packContentSha256` is never mistaken for a path. The unchanged half — that a request to anything the page never declared is a failure, and that the derivation is neither everything nor nothing — is retained verbatim |
| SUP-024-10 | `scripts/selftest.mjs` ~L13416 — the `surgicalRemoval` pair's clause naming `'irmaa-bands'` as an id the shipped pack still carries as not modelled. Admitted under ASC-8 during Scope 04; its marker was written before this row existed and this row closes that gap | 04 | Cause: FR-024-024 models that id, so a clause asserting it is still a marginal-rate contributor fails BECAUSE the feature did what it was asked to do. Traded for: a split. The surgical-removal clause is retained VERBATIM over the member this feature does not model, and the moved member gains the stronger moved-not-deleted clause the benefit id already carries — absent from the contributor set AND present as a medicare policy whose `taxLegs` every carry `includedInTotal: false`. Strictly stronger because the pair could not distinguish a member that moved into a modelled premium from one that was culled, while the replacement fails differently for each; per ASC-7 the retained branch is exercised against the shipped pack, in which `'premium-tax-credit'` is still not carried |
| SUP-024-11 | `tests/lifetime-tax-route.spec.mjs` L211 through L212 — SCN-021-014's `await unavailable.first().focus(); await expect(unavailable.first()).toBeFocused();`, a positional spot-check that focused whichever `[data-rl-unavailable]` node happened to be first in DOCUMENT order. Admitted under ASC-8 during Scope 04 | 04 | Cause: FR-024-027 renders an unavailable annual Medicare cost into `#annualMedicareCostCard`, which sits inside `<section id="simple">`. That node becomes first in document order, and the spec reaches this clause with Power open, so `.first()` resolves to a node hidden in the active view, `focus()` is a silent no-op and `toBeFocused()` fails on a node the user cannot reach in this view rather than on any defect. The product decision is that the Simple-view Medicare refusal STAYS: an unavailable Medicare cost is decision-level information a Simple user must see, so the honest refusal is not deleted, hidden or demoted to satisfy a positional probe. Traded for: a VIEW-AWARE SWEEP. Every VISIBLE unavailable node is swept in Power and then every visible one in Simple; each is required to carry its code, its domain, its reason and its remediation, and each is FOCUSED and read back rather than inspected for a `tabindex` attribute. A non-zero visible count is asserted in each view so a sweep over an empty set cannot pass. Strictly stronger because the superseded pair proved one arbitrary node in one view was focusable while the replacement proves every reachable node in both views is; because it is order-independent and assumes nothing about which node is first; and because exercising focus catches a node that carries `tabindex="0"` yet cannot take focus, which the retained attribute clause cannot see. Adversarial case, executed: rendering the unavailable node `inert` while leaving its `tabindex="0"` in place passes the retained attribute clause and fails the replacement by name, `Power visible unavailable node 0 (RLTAX-INPUT-INCOMPLETE) is keyboard focusable`. The pre-existing whole-set attribute sweep is retained verbatim beside it |
| SUP-024-12 | `scripts/selftest.mjs` ~L19256 — TP-03-19's `/"inputClaimAgeComparisonAges", "inputMortalityColumn"\]/`, whose trailing `]` required that pair to TERMINATE `DECLARATION_INPUTS`. Admitted under ASC-8 during Scope 04 | 04 | Cause: the regex asserts an ORDERING nobody intended. It pins the two watched ids to the end of the array, so any later scope that appends a control breaks it — which says nothing about whether the two ids are registered. It already broke once when Scope 04 appended its lookback controls. Traded for: the order-independent form its sibling TP-01-19 already uses — extract the `DECLARATION_INPUTS` block and assert each watched id is present within it by membership. Strictly stronger because it still requires every watched id to be registered while no longer asserting a position, so a removed id fails and an appended one does not. Adversarial cases, both executed: removing `"inputMortalityColumn"` from the list fails the replacement by name and drops the suite to `2785 passed, 1 failed`; appending a further control after the pair passes the replacement at `2786 passed, 0 failed` while the superseded regex matches the page zero times and would therefore have failed |

### Assertions considered and not superseded

This table records what the planning sweep examined and cleared, so a later reader
can tell a cleared assertion from an unexamined one. Every row was read from the
tree during this planning session.

| Assertion | Why it is not eligible |
| --- | --- |
| `scripts/selftest.mjs` ~L13014 and ~L13018 — TP-02-10's `claimTokens` including `'breakEvenYear'`, scanned over five named files; `scripts/selftest.mjs` ~L13981 — TP-05-06's token list including `'break-even'` and `'breakEven'`, scanned over the page and `rltaxstrategy.js`; `scripts/selftest.mjs` ~L15279, ~L15719, ~L16273, ~L16887 and ~L17518 — the per-feature `claimScanNN` regexes each containing `break-even`; `tests/lifetime-tax-conversion.spec.mjs` L32 — `FORBIDDEN_CLAIMS` including `'break-even'` and `'break even'` | Per **RD-5** this feature does not emit a break-even claim. It emits an equality of two cumulative sums over declared figures, labelled as the age at which the two cumulative totals are equal and stated in the record's own text to be arithmetic rather than a prediction. That claim is genuinely weaker than the one these detectors forbid, so none of them is superseded. They are **strengthened instead**: the new claim-age module and the mortality pack are added to the scanned file sets and every forbidden token stays forbidden in them. Renaming a member so that the same claim passes the same scan is forbidden by **ASC-9** and is not admissible to the ledger |
| `scripts/selftest.mjs` ~L13706 and ~L13722 — TP-04-10's `forbiddenMembers` enumeration over the conversion comparison record | This feature does not extend the conversion comparison record. The clause is retained verbatim, and the claim-age record gets its own exhaustive member enumeration using the same forbidden list rather than sharing this one |
| `scripts/selftest.mjs` ~L13683 through ~L13698 — TP-04-08's `requiredNotModeled` including `'medicare-and-irmaa'`, `baseComparison.notModeled.length === 8`, and `rltaxstrategy.js` L50–L52's reason `IRMAA uses a two-year income lookback and the pack declares no band, so a conversion's premium effect is not priced` | The entry stays. A Roth conversion's effect on the adjustment lands two premium years later, and this feature computes no future year, so the conversion comparison genuinely still does not price it. The clause `the pack declares no band` does become false and is corrected in Scope 04 — a correction, not a supersession, because no assertion pins the reason verbatim. Scope 04 carries a DoD row requiring the corrected reason and a new assertion pinning it against the pack's declared brackets |
| `rltax.js` ~L518 — reconciliation identity `L4`, *the sum of every declared leg whose `includedInTotal` is true == totalFederalTax* | Preserved exactly. Per **RD-4** this feature adds the first legs it must exclude, which makes its exclusion clause non-vacuous for the first time. Scope 04 carries a DoD row requiring that to be asserted rather than assumed, and requiring a mutation that flips a premium leg to `includedInTotal: true` to be demonstrated to fail |
| `scripts/selftest.mjs` ~L12075 — `RLTAXRULES.SUPPORTED_INCOME_KINDS.length === 4`, and `rltaxrules.js` ~L1550's requirement that the pack's `incomeKinds` equal that list exactly | Per **RD-6** the included portion of the benefit is ordinary income and adds no kind. The count is unaffected and an edit would be a weakening. A DoD item asserts it did not change |
| `scripts/selftest.mjs` ~L11940 — `RLTAXRULES.PACK_REQUIRED_MEMBERS.length === 22`, and ~L12025 — `missingMemberFindings.length === 22` | The twenty-two are the members required of every pack. This feature's additions are conditional policy members, exactly as Feature 023's six were, and do not enter the required list. Verified by reading the current list, which contains none of Feature 023's additions |
| `scripts/selftest.mjs` ~L12171 — `declaredTaxKeys.length === 3`, and ~L12190 — `inventoryBefore.entries.length === 3` and `cleared.removedKeys.length === 3` | Every declaration this feature adds lives inside the existing workspace key rather than in a new storage key, so the declared key count is unchanged. Verified against the current workspace contract. A DoD item asserts the count did not change and that every new declaration is nonetheless inventoried, cleared and redacted |
| `scripts/selftest.mjs` ~L12101 — `Object.keys(RLTAXRULES.RLTAX_CODES).length === 12`, superseded by SUP-022-22 to a derived form, currently resolving to fourteen members | This feature adds no refusal code. The derived form absorbs nothing because nothing changes, and NFR-024-004 asserts the member count is unchanged |
| `scripts/selftest.mjs` ~L13823 through ~L13871 — the Simple field set identity delivered by SUP-023-04's replacement | Already derived from the page in both directions, so the three Simple fields Scope 05 adds are absorbed. No further entry is needed and none is permitted |
| `scripts/selftest.mjs` ~L13009 and `tests/lifetime-tax-route.spec.mjs` L55 — the withheld-detail link and Power section counts, superseded by SUP-023-05 and SUP-023-06 to two-directional derived identities | Already derived, so the four Power sections this feature adds are absorbed |
| `tests/lifetime-tax-foundation.spec.mjs` and `tests/lifetime-tax-route.spec.mjs` — the request-ledger allow-list, superseded by SUP-023-10 to a set derived from the route's own script tags and declared packs | Already derived, so the four modules and three packs this feature adds are admitted by the page's own declaration. A request to anything the page never declared still fails |
| `tests/lifetime-tax-federal.spec.mjs` L213 and `tests/lifetime-tax-route.spec.mjs` L118 — the reconciliation row counts, superseded by SUP-022-15 and SUP-022-16 to forms derived from the published leg list | Already derived, so legs `L12` through `L15` are absorbed |
| `tests/lifetime-tax-route.spec.mjs` L129 — the source-record list count, superseded by SUP-022-17 to a derived form | Already derived, so this feature's source records are absorbed |
| `tests/lifetime-tax-rental.spec.mjs` L74 — the leg surface census, superseded by SUP-023-13 to a surface-scoped identity read from the page's own `data-rl-leg-surfaces` declaration | Already derived, so this feature's four legs are checked by the same census without an edit |
| `tests/lifetime-tax-route.spec.mjs` L117 — `#bracketDetailBody tr` `toHaveCount(7)` | This feature changes no federal ordinary bracket. The count is unaffected and an edit would be a weakening |
| `tests/lifetime-tax-property.spec.mjs` L130, `tests/lifetime-tax-use.spec.mjs` L80, L92 and L108, `tests/lifetime-tax-disposition.spec.mjs` L111 and L195 | Feature 023 surfaces this feature does not touch. Each stays byte-identical |
| Every Feature 008 byte-identity canary | Not eligible under any circumstance |
| Every determinism, privacy and zero-network assertion | Not eligible under any circumstance |

---

## Scope Of This Feature

Five sequential scopes. Each delivers one user-visible outcome across contract,
engine and route in the same slice. No scope is a layer.

1. Benefit computation: the two basis origins, the bend-point formula, full
   retirement age, early reduction and delayed credits.
2. Taxation of benefits: provisional income, the base amounts, the inclusion
   tiers and the invariance basis that decides whether they may be carried.
3. Claim-age comparison: deterministic figures across claim ages on a declared
   mortality basis, with no probability of any kind.
4. Medicare premiums and the income-related adjustment: the declared lookback,
   the bracket boundaries, and three cost legs that are surfaced and not summed.
5. Route, accessibility and integration: Simple and Power surfacing, the leg
   census across all four surfaces, the export, and the two cross-stage
   interactions.

## Goals

- Make a benefit figure computable from either of the two things a household
  actually has, with the origin visible and the two paths able to fail alone.
- Make the taxable portion of the benefit a published tier decision rather than a
  percentage, with the parameters that decided it on the page.
- Make the claim-age question answerable as arithmetic, without becoming a
  prediction.
- Make Medicare's cost visible, correct as to its income year, and structurally
  incapable of entering a tax total.
- Remove two entries from the not-modeled ledger by modelling them, not by
  quieting them.

## Non-Goals

- No probability of plan success, no Monte Carlo, no market simulation, no
  portfolio interaction. That is Feature 025, which is deliberately not a
  probability engine either.
- No future-year benefit, premium, bracket or tax figure. One declared year, as in
  Features 021 through 023.
- No spousal, survivor, divorced-spouse, child or disability benefit. One
  beneficiary's own retirement benefit in this slice.
- No earnings test for a beneficiary working before full retirement age, no
  windfall elimination or government pension offset, no railroad retirement
  benefit, no benefit taxation by a state.
- No Medicare Advantage, Medigap, Part A premium, late-enrolment penalty, or
  prescription-drug plan selection.
- No additional state packs, no local income tax, no part-year or multi-state
  residency. See the note in the deferral register below.
- No registration. `tools.json`, `index.html`, `rlnav.js`, `README.md`,
  `notes/README.md` and market-brief coverage are untouched. That is Feature 026.
- No change to `rlportfolio.js`, `rlportfolioanalytics.js`,
  `specs/008-portfolio-survival-and-brief-lab/`, `briefs/`, `data/` or
  `market-brief.*`.

## Deferral Register — Recorded, Not Omitted

Each is a real capability this feature does not deliver, recorded with the
successor that owns it so the not-modeled ledger can name it.

| Deferred | Owner |
| --- | --- |
| Plan success probability, market simulation and multi-year retirement projection | Feature 025, which is not a probability engine |
| Spousal, survivor, divorced-spouse, child and disability benefits | Not scheduled; refuses `RLTAX-SCOPE-DEFERRED` |
| The retirement earnings test, windfall elimination and government pension offset | Not scheduled; recorded as unsupported |
| Railroad retirement benefits | Not scheduled; retained by name in the completeness record under SUP-024-08 |
| State taxation of Social Security benefits | Not scheduled; refuses `RLTAX-JURISDICTION-UNSUPPORTED` |
| Part A premiums, late-enrolment penalties, Medicare Advantage and Medigap | Not scheduled; recorded as unsupported |
| A conversion's effect on a later premium year's adjustment | Not scheduled; keeps its `medicare-and-irmaa` entry with a corrected reason |
| Additional state property and income regimes, and local income tax | Not scheduled. **Feature 023's deferral register routed these to "Feature 024".** This feature is Social Security and Medicare and does not deliver them, so the routing is stale. Recorded as an [open question](#open-questions) for the owner rather than silently re-numbered here, because Feature 023's register is not this feature's artifact to edit |
| Registration in the site index, navigation and brief | Feature 026 |

## Domain Capability Model

### Capability

Given declared household facts about a benefit, a birth year, a claim age, other
income and an earlier year's modified adjusted gross income, together with
sourced benefit-formula, taxation, mortality and premium rules, produce a benefit
settlement, a taxable-inclusion contribution to the federal settlement, a
deterministic claim-age comparison, and a Medicare cost settlement — each
traceable to either an authority or a declaration.

### Domain primitives

- **Benefit basis** — the monthly amount a beneficiary's own record produces at
  full retirement age, from either of two declared origins.
- **Claim-age adjustment** — a sourced reduction or credit applied for claiming
  before or after full retirement age, stopping at a sourced age.
- **Provisional income** — a composed measure that decides how much of a benefit
  is included, distinct from adjusted gross income and from any modified measure.
- **Inclusion tier** — a category selected by comparing a composed measure against
  sourced base amounts, carrying its own arithmetic and its own ceiling.
- **Mortality basis** — a sourced deterministic life-expectancy figure by age,
  carrying no probability member.
- **Lookback measure** — a declared modified adjusted gross income for a year the
  settlement is not settling, used only for the adjustment.
- **Cost leg** — a named household outflow that is surfaced like a tax leg and
  summed into no tax total.

### Business policies every concrete pack and engine must obey

- A declared figure is never presented as sourced, and a sourced figure is never
  presented as declared.
- A figure carried from another publication edition carries a written invariance
  basis quoting the publication's own contrast, or it is absent.
- A cost is surfaced and is never summed into a tax total.
- A tier decision is published with the parameters and the comparison that
  produced it.
- A leg that is computed is surfaced.

---

## Actors And Personas

- **The statement holder** — has a Social Security statement, wants the annual
  figure at a claim age and the tax consequence of taking it.
- **The estimator** — has no statement, has earnings, and needs to know both what
  the formula produces and how much less certain that path is.
- **The timing decider** — is choosing between claim ages and wants arithmetic,
  not a recommendation and not odds.
- **The premium payer** — is near or over the first adjustment boundary and needs
  to know which year's income decides it.

## Use Cases

### UC-024-001: Find out what the benefit is
The statement holder declares a Primary Insurance Amount, a birth year and a
claim age, and receives an annual benefit figure with the sourced adjustment that
produced it and the full retirement age it was measured from.

### UC-024-002: Get a benefit figure without a statement
The estimator declares an earnings record and receives a computed Primary
Insurance Amount with the bend points that shaped it — or a refusal naming the
indexing series that could not be retrieved, while the declared path stays
available.

### UC-024-003: Find out how much of it is taxed
Either user declares other income and sees the provisional income the tool
composed, the base amounts it compared against, the tier that resulted and the
included amount, each with its citation.

### UC-024-004: Compare claim ages
The timing decider declares a set of claim ages and receives, for each, the
adjusted annual benefit and the cumulative total to the sourced life-expectancy
age, plus the age at which two cumulative totals are equal — with no probability,
no ranking and no recommendation anywhere in the result.

### UC-024-005: Find out what Medicare costs
The premium payer declares the modified adjusted gross income for the year the
pack's own lookback offset names, and receives the standard premiums, the
adjustment for the resulting bracket, and an annual cost that is visibly not part
of the tax total.

### UC-024-006: Audit a retirement figure
Any user opens a retirement figure's detail and can tell at a glance whether it
came from an authority or from their own declaration, which year's publication it
came from, and — when it came from another year's edition — the publication's own
words establishing that it does not vary by year.

---

## Business Scenarios

### BS-024-001 / SCN-024-001: The two benefit-basis origins are separate object kinds and refuse separately
Given a household declaring neither a statement Primary Insurance Amount nor an
earnings record, and separately a household declaring both, when the benefit basis
resolves, then the first refuses `RLTAX-INPUT-INCOMPLETE` naming both accepted
declarations and the second refuses `RLTAX-INPUT-INCOMPLETE` naming the ambiguity;
neither is resolved by a precedence rule, neither shows a zero, and a household
declaring exactly one settles with its origin published.

### BS-024-002 / SCN-024-002: The Primary Insurance Amount is computed through sourced bend points at their declared breakpoints
Given a declared earnings record and a sourced bend-point set, when the computed
path runs, then the Average Indexed Monthly Earnings is computed from the declared
record and the sourced indexing series, each bend-point percentage is applied to
the portion its own declared breakpoint delimits, the record publishes the
breakpoints and the percentages with their citations, and an unretrieved indexing
series refuses the computed path while leaving the declared path available.

### BS-024-003 / SCN-024-003: Full retirement age, the early reduction and the delayed credit come from sourced tables and stop where the source says
Given a declared birth year and a declared claim age, when the adjustment runs,
then the full retirement age is read from the sourced table row for that birth
year, a claim before it applies the sourced per-month reduction factors for the
months involved, a claim after it applies the sourced delayed retirement credit
rate up to the sourced stopping age and no further, the record publishes the
months counted and the factor applied to each, and a birth year outside the
sourced table refuses rather than using an adjacent row.

### BS-024-004 / SCN-024-004: Provisional income is composed from named parts and is not any other income measure
Given declared other income, declared tax-exempt interest and a settled benefit,
when provisional income is computed, then it is composed from the parts the source
names, each part appears by name with its amount and its origin, the result is
published as a measure distinct from adjusted gross income and from the pack's
modified adjusted gross measure, and a composition that silently reused either of
those measures is proven to fail.

### BS-024-005 / SCN-024-005: The inclusion tier is selected at its exact sourced base amounts and the included amount is bounded by the sourced ceiling
Given a provisional income below the first sourced base amount, exactly at it,
between the two, exactly at the second, and above it, when the inclusion runs,
then each lands in the tier the source states, each comparison is asserted at the
exact sourced figure rather than near it, the included amount never exceeds the
sourced ceiling proportion of the benefit, and an implementation treating a
comparison as strict where the source states inclusive is proven to fail.

### BS-024-006 / SCN-024-006: A base amount from another publication edition is carried only on the publication's own contrast
Given base amounts retrieved from a publication edition other than the declared
tax year, when the pack is authored, then the figures are carried only when a
written `yearInvarianceBasis` quotes the publication's own dating contrast for
that component kind, the basis and its locator are published beside the figures,
a component kind lacking such a contrast ships as an `AbsentFigure/v1` and the
inclusion refuses, and a basis recorded without a quoted contrast is proven to
fail validation.

### BS-024-007 / SCN-024-007: The claim-age comparison is deterministic and carries no probability
Given a declared set of claim ages and a sourced mortality basis, when the
comparison runs twice over identical declarations, then the two records are
byte-identical, the mortality basis is the life-expectancy column alone, a pack
carrying a probability-bearing member is refused, and an exhaustive enumeration of
every member name in the record finds no probability, rank, score, success,
survival or recommendation member.

### BS-024-008 / SCN-024-008: The cumulative totals and the age at which they are equal are arithmetic over declared figures
Given two declared claim ages and a sourced life-expectancy figure, when the
comparison runs, then each claim age's cumulative total is the adjusted annual
benefit summed over the whole years from that claim age to the sourced
life-expectancy age, the age at which two cumulative totals are equal is published
with both claim ages named and with the record's own statement that it is
arithmetic over declared figures rather than a prediction, no discount rate and no
appreciation assumption appears anywhere in the record, and an absent mortality
figure withholds both the cumulative totals and the equality age rather than
substituting a default horizon.

### BS-024-009 / SCN-024-009: The comparison ranks nothing and recommends nothing
Given a comparison across three claim ages in which one produces a larger
cumulative total than the others, when the record is produced and rendered, then
no claim age is marked best, optimal, recommended or preferred, the ages are
presented in declared order rather than sorted by any figure, the record states
that it selects nothing, and a rendering that ordered or emphasised by outcome is
proven to fail.

### BS-024-010 / SCN-024-010: The adjustment is resolved from a declared lookback year and the current year cannot reach it
Given a declared modified adjusted gross income for the year the pack's declared
lookback offset names, when the adjustment resolves, then the tier is selected
from that declaration alone, the resolver accepts no current-year income figure
through any parameter, the lookback year is asserted equal to the premium year
minus the pack's declared offset and refuses when it is not, an undeclared
lookback refuses `RLTAX-INPUT-INCOMPLETE` naming the year required, and a
substitution of the current year's measure is proven to fail.

### BS-024-011 / SCN-024-011: The bracket boundaries are exact and the adjustment applies to both parts
Given a declared lookback income below the first sourced boundary, exactly at it
and above it, when the adjustment resolves, then each lands in the bracket the
source states, the comparison is asserted at the exact sourced boundary, the
bracket's Part B and Part D adjustment amounts are both applied and both cited,
the filing-status variation is taken from the source rather than assumed, and an
unretrieved boundary or amount refuses the adjustment rather than applying zero.

### BS-024-012 / SCN-024-012: A premium is surfaced everywhere and summed into no tax total
Given a settled household with non-zero premiums and a non-zero adjustment, when
the settlement runs, then the three premium legs are declared with
`includedInTotal` false, they appear in the headline, the comparison, the marginal
curve and the export, they are summed into a separately published annual Medicare
cost, `totalFederalTax` is proven to exclude every one of them, the reconciliation
identity over included legs is proven to hold with legs present that it must
exclude, and a mutation flipping any premium leg to included is proven to fail.

### BS-024-013 / SCN-024-013: Every leg this feature adds reaches all four surfaces
Given the all-non-zero leg fixture extended with this feature's four legs, when
the page renders, then the settled record's declared leg set equals the leg set of
the headline, the comparison table, the marginal curve's contributor set and the
export, in both directions, removing any one leg from any one surface is proven to
fail with the missing leg and the failing surface both named, and the headline
renders `totalFederalTax` rather than any single leg.

### BS-024-014 / SCN-024-014: The included benefit portion reaches taxable income and the export omits every declaration
Given a settled inclusion, when the federal settlement runs and the export is
produced, then the included amount appears as a named contributor to ordinary
taxable income and changes the tax owed, the export omits the earnings record, the
birth year, the claim age, the statement Primary Insurance Amount and the lookback
income, the export states what it omitted, and no household value appears in any
URL, query string, hash, request, referrer or console message.

### BS-024-015 / SCN-024-015: Simple stays decision-level and every unavailable item is reachable
Given a settlement with some figures available and some absent, when the page is
opened in Simple and then in Power, then Simple carries only decision-level
fields, every detail Simple withholds carries a link to the Power section that
owns it, every unavailable item renders its code, its domain, its reason and its
remediation on a focusable element rather than as a blank, a dash or a zero, and
switching modes while a control has focus does not detach the control.

---

## Requirements

### Benefit computation — Scope 01

- **FR-024-001** — `BenefitBasis/v1` carries a `basisOrigin` from the closed set
  `declared-statement-pia` · `computed-from-earnings`; the declared origin carries
  no `sourceRef` and is labelled the household's own input.
- **FR-024-002** — a household declaring neither origin refuses
  `RLTAX-INPUT-INCOMPLETE` naming both; a household declaring both refuses
  naming the ambiguity; neither is resolved by precedence.
- **FR-024-003** — the computed origin derives the Average Indexed Monthly
  Earnings from the declared earnings record and a sourced indexing series, and
  applies each sourced bend-point percentage to the portion its own declared
  breakpoint delimits.
- **FR-024-004** — the full retirement age is read from a sourced table row for
  the declared birth year; a birth year outside the table refuses rather than
  using an adjacent row.
- **FR-024-005** — a claim before full retirement age applies the sourced
  per-month reduction factors for the months counted, and a claim after it applies
  the sourced delayed retirement credit rate up to the sourced stopping age and no
  further.
- **FR-024-006** — the benefit record publishes the months counted, the factor
  applied to each, and every sourced parameter with its citation and locator; an
  unretrieved parameter is an `AbsentFigure/v1` and the benefit refuses.
- **FR-024-007** — the benefit settlement is surfaced with a rule status in the
  headline, the comparison, the marginal curve and the export.

### Taxation of benefits — Scope 02

- **FR-024-008** — provisional income is composed from the parts the source names,
  each published by name with its amount and its origin.
- **FR-024-009** — provisional income is a distinct measure from adjusted gross
  income and from the pack's modified adjusted gross measure, and reusing either
  is refused.
- **FR-024-010** — the inclusion tier is selected by comparing provisional income
  against sourced base amounts for the filing status, and the comparison performed
  is published.
- **FR-024-011** — the included amount is computed by the tier's own sourced
  arithmetic and is bounded by the sourced ceiling proportion of the benefit.
- **FR-024-012** — a base amount carried from a publication edition other than the
  declared tax year carries a written `yearInvarianceBasis` quoting the
  publication's own dating contrast for that component kind; without it the figure
  ships absent and the inclusion refuses.
- **FR-024-013** — `'taxable-social-security-benefits'` moves out of
  `unsupportedFeatures[]` into a modelled inclusion, and the accounting between the
  two is disjoint and exhaustive.
- **FR-024-014** — the included amount is a named contributor to ordinary taxable
  income, and the inclusion is surfaced in the headline, the comparison, the
  marginal curve and the export.

### Claim-age comparison — Scope 03

- **FR-024-015** — the mortality pack carries a life-expectancy figure by age and
  no probability-bearing member; a pack carrying one is refused.
- **FR-024-016** — each declared claim age's cumulative total is the adjusted
  annual benefit summed over the whole years from that claim age to the sourced
  life-expectancy age.
- **FR-024-017** — the age at which two claim ages' cumulative totals are equal is
  published with both claim ages named and with the record's own statement that it
  is arithmetic over declared figures rather than a prediction.
- **FR-024-018** — the record carries no probability, rank, score, success,
  survival, recommendation, discount-rate or appreciation member, proven by an
  exhaustive enumeration of every member name in it.
- **FR-024-019** — claim ages are presented in declared order and none is marked
  best, optimal, recommended or preferred.
- **FR-024-020** — an absent mortality figure withholds the cumulative totals and
  the equality age rather than substituting a default horizon.
- **FR-024-021** — the comparison is deterministic: two runs over identical
  declarations produce byte-identical records.

### Medicare premiums and the income-related adjustment — Scope 04

- **FR-024-022** — `LookbackMagi/v1` is a declaration carrying its own year; an
  undeclared lookback refuses `RLTAX-INPUT-INCOMPLETE` naming the year required.
- **FR-024-023** — the adjustment resolver accepts a `LookbackMagi/v1` and a
  bracket pack and nothing else; no current-year income figure is reachable
  through any parameter, member or closure.
- **FR-024-024** — the declared lookback year is asserted equal to the premium year
  minus the pack's own declared offset, and refuses when it is not;
  `'irmaa-bands'` moves out of `unsupportedFeatures[]` into declared legs.
- **FR-024-025** — the bracket is selected at the exact sourced boundary for the
  filing status, and both the Part B and the Part D adjustment amounts are applied
  and cited.
- **FR-024-026** — the Part B premium, the Part D premium and the adjustment are
  declared legs with `includedInTotal` false, summed into a separately published
  annual Medicare cost that enters no tax total.
- **FR-024-027** — an unretrieved premium, boundary or adjustment amount refuses;
  `includedInTotal` false is never used to carry an absent figure.
- **FR-024-028** — the three premium legs are surfaced in the headline, the
  comparison, the marginal curve and the export.

### Route, accessibility and integration — Scope 05

- **FR-024-029** — the leg census asserts a two-directional set identity between
  the record's declared legs and each of the four surfaces, against a fixture in
  which every leg is non-zero and mutually distinct, naming both the missing leg
  and the failing surface.
- **FR-024-030** — the headline renders `totalFederalTax` and no single leg, and
  the annual Medicare cost is rendered as a separate figure that is visibly not
  part of it.
- **FR-024-031** — Simple gains only decision-level fields and no band table, rule
  trace or raw series; every detail Simple withholds links to the Power section
  that owns it.
- **FR-024-032** — every control this feature adds binds without an unconditional
  re-render, so a mode switch or an input event cannot detach a focused node.
- **FR-024-033** — every unavailable item renders its code, its domain, its reason
  and its remediation on a focusable element, and never a blank, a bare dash or a
  zero.
- **FR-024-034** — the export omits every household declaration this feature adds
  and states what it omitted.
- **FR-024-035** — the renderer reads only members the settlement actually
  publishes, so an absent member cannot abort the Power render.

### Non-functional

- **NFR-024-001** — every figure is sourced or declared, and never presented as the
  other.
- **NFR-024-002** — zero network requests at runtime, including benefit, mortality
  and medicare pack loading.
- **NFR-024-003** — no household value, including the earnings record, the birth
  year, the claim age and the lookback income, reaches any URL, query string,
  hash, request, referrer, console message or committed artifact.
- **NFR-024-004** — the refusal vocabulary is unchanged and the supported
  income-kind list is unchanged; both member counts are asserted equal to their
  pre-feature values.
- **NFR-024-005** — no module holds a bend point, a percentage, a factor, an age, a
  base amount, a premium, a bracket boundary, a life-expectancy figure or an
  authority name; a scan asserts it and is demonstrated to fail on a module that
  does.
- **NFR-024-006** — every computed leg is surfaced in the headline, the comparison,
  the marginal curve and the export; an assertion fails if a leg exists in the
  record and not in all four.
- **NFR-024-007** — no probability, plan success figure, market simulation, Monte
  Carlo, future-year figure, ranking or recommendation appears anywhere.
- **NFR-024-008** — no published error rate, self-invalidation statistic, track
  record or accuracy figure appears anywhere.
- **NFR-024-009** — Feature 008 files remain byte-identical, and no module or test
  this feature adds references a Feature 008 surface.
- **NFR-024-010** — no registration; no new root HTML, and `site-exclusions.json`
  is unchanged unless a new root HTML is created, in which case its entry lands in
  the same scope.
- **NFR-024-011** — every module this feature adds is UMD rather than ESM, works
  from `file://`, exposes its pure analytic functions as top-level
  `function name(...) {}` declarations so the selftest extractor can lift them,
  uses `Number.isFinite` rather than the bare global, and wraps no canvas drawing
  in `requestAnimationFrame`.

---

## Blocking Implementation Inputs

Every input below must be closed by a retrieval performed at implementation time.
None may be closed by derivation, recall or a secondary source. An input that
cannot be retrieved ships as an `AbsentFigure/v1` and its dependent leg refuses.

| ID | Input | Scope | Consequence if the retrieval fails |
| --- | --- | --- | --- |
| BI-1 | The bend-point breakpoints and the formula percentages that convert Average Indexed Monthly Earnings into a Primary Insurance Amount | 01 | The computed origin refuses `RLTAX-THRESHOLD-UNAVAILABLE`; the declared origin stays available and the panel says which path is unavailable and why |
| BI-2 | The wage indexing series used to index a declared earnings record, and the rule fixing which year's series applies | 01 | The computed origin refuses in full; no unindexed earnings figure is used in its place |
| BI-3 | The full retirement age by year of birth | 01 | The adjustment refuses for every claim age; no default full retirement age is assumed |
| BI-4 | The early-claiming reduction factors, their per-month rates, and the month counts each rate applies to | 01 | An early claim refuses; a claim at full retirement age still settles and the panel states which claim ages are unavailable |
| BI-5 | The delayed retirement credit rate by year of birth and the age at which credits stop | 01 | A delayed claim refuses; the stopping age is never assumed |
| BI-6 | The parts that compose provisional income and the rule fixing how tax-exempt interest enters it | 02 | Provisional income refuses and the inclusion refuses; no adjacent income measure is substituted |
| BI-7 | The base amounts per filing status and the inclusion tier arithmetic and ceiling | 02 | The inclusion refuses; no percentage is applied from memory |
| BI-8 | Whether the base amounts vary by year, established from the publication's own dating contrast for each component kind | 02 | Any component kind without a written contrast ships absent and the inclusion refuses, even when the figure itself was retrieved |
| BI-9 | The period life table's life-expectancy figure by age, and the table's own year | 03 | The cumulative totals and the equality age are withheld; no default horizon and no substitute table is used |
| BI-10 | The standard Part B premium and the Part D base beneficiary premium | 04 | The affected premium leg refuses; no zero is carried in its place |
| BI-11 | The adjustment bracket boundaries and the Part B and Part D adjustment amounts per filing status, and the pack's declared lookback offset | 04 | The adjustment refuses and the lookback-year assertion has no offset to check against, so the whole Medicare settlement refuses rather than applying the standard premium alone |

## Assumptions

- Feature 023 lands before this feature's implementation begins. Where a ledger
  target is an assertion Feature 023 delivers, the implementer re-resolves it
  against the tree at implementation time under ASC-8.
- One beneficiary per household in this slice. A spouse's own benefit, a spousal
  benefit and a survivor benefit are later features and are recorded as
  unsupported rather than approximated.
- One declared tax year, consistent with Features 021 through 023. The lookback
  year is a declaration about a different year and is not a second settled year.

## Open Questions

- **The Feature 023 deferral routing.** Feature 023's deferral register names
  "Feature 024" as the owner of additional state property regimes and of local and
  municipal income tax. This feature is Social Security and Medicare and delivers
  neither. Routed to the owner: either a later feature takes that routing, or
  Feature 023's register is corrected by its own owner. This feature does not edit
  another feature's artifact and does not silently re-number the routing.
- Whether the provisional income composition treats a benefit received by each
  spouse of a joint filer as one summed quantity or as two. Routed to BI-6; the
  retrieved publication decides, and the composition record publishes what was
  summed.
- Whether the delayed retirement credit accrues monthly or annually for the
  purpose of a claim between birthdays. Routed to BI-5; if the publication does
  not establish it, the partial year refuses rather than being interpolated.
- Whether the adjustment brackets are stated per filing status or per a filing
  grouping that does not map one-to-one onto the pack's filing statuses. Routed to
  BI-11; a status the source does not enumerate ships absent rather than borrowing
  an adjacent status's amount.

## Acceptance Criteria

- Every scenario `SCN-024-001` … `SCN-024-015` has a passing named test and a
  passing persistent browser row.
- Every figure is traceable to a retrieved authority or is labelled a declaration,
  and every figure carried across an edition year carries a quoted invariance
  basis.
- Every unretrieved input ships absent and its leg refuses.
- Every computed leg is surfaced in all four places, proven by an assertion that
  fails when it is not and that names both the leg and the surface.
- No premium enters any tax total, proven by an assertion and by a mutation that
  is demonstrated to fail.
- The refusal vocabulary member count and the supported income-kind count are
  unchanged.
- `node scripts/selftest.mjs` is green with no fall in the pre-existing pass count.
- Every superseded assertion has a `SUP-024-NN` marker and a ledger entry, and
  every ledger addition updated all four surfaces in the same change.

## Traceability

| Scenario | Business scenario | Requirements | Scope |
| --- | --- | --- | --- |
| SCN-024-001 | BS-024-001 | FR-024-001, FR-024-002 | 01 |
| SCN-024-002 | BS-024-002 | FR-024-003, FR-024-006 | 01 |
| SCN-024-003 | BS-024-003 | FR-024-004, FR-024-005, FR-024-007 | 01 |
| SCN-024-004 | BS-024-004 | FR-024-008, FR-024-009 | 02 |
| SCN-024-005 | BS-024-005 | FR-024-010, FR-024-011, FR-024-014 | 02 |
| SCN-024-006 | BS-024-006 | FR-024-012, FR-024-013 | 02 |
| SCN-024-007 | BS-024-007 | FR-024-015, FR-024-018, FR-024-021 | 03 |
| SCN-024-008 | BS-024-008 | FR-024-016, FR-024-017, FR-024-020 | 03 |
| SCN-024-009 | BS-024-009 | FR-024-018, FR-024-019 | 03 |
| SCN-024-010 | BS-024-010 | FR-024-022, FR-024-023, FR-024-024 | 04 |
| SCN-024-011 | BS-024-011 | FR-024-025, FR-024-027 | 04 |
| SCN-024-012 | BS-024-012 | FR-024-026, FR-024-028 | 04 |
| SCN-024-013 | BS-024-013 | FR-024-029, FR-024-030 | 05 |
| SCN-024-014 | BS-024-014 | FR-024-034, FR-024-035 | 05 |
| SCN-024-015 | BS-024-015 | FR-024-031, FR-024-032, FR-024-033 | 05 |

Note: SCN-024-007 and SCN-024-009 both trace FR-024-018 because the member
enumeration must hold both for a record produced deterministically and for a
record in which one claim age genuinely outperforms the others, and each must be
asserted independently.
