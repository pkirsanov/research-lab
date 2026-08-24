# Feature: 023 Property Tax And Rental Income (Slice 3)

Feature directory: `specs/023-property-tax-and-rental-income`
Repository: `research-lab`
Specification owner: `bubbles.analyst`
Design owner: `bubbles.design` — [`design.md`](design.md)
Planning owner: `bubbles.plan` — [`scopes/_index.md`](scopes/_index.md)
Direct predecessor: [`specs/022-federal-preferential-and-state-income-tax`](../022-federal-preferential-and-state-income-tax/spec.md)

This specification is the direct successor to Feature 022. It opens the housing
axis: what a household pays to hold real property, what holding it does to the
federal return, what renting it out does, how the tool tells a long-term rental
apart from a vacation home, and what happens on sale.

It inherits Feature 021's and Feature 022's contracts, the closed `RLTAX-*`
refusal vocabulary, the `AbsentFigure/v1` discipline, the `SourcedZero/v1`
distinction and the privacy boundary without weakening any of them. It extends
no closed set: **this feature adds no refusal code.** Five candidate conditions
were considered and each folds into an existing member, named individually in
[design.md](design.md#refusal-conditions-folded-into-existing-members).

---

## Problem Statement

Feature 022 can settle a household's income tax across two jurisdictions. It
cannot say anything at all about the largest asset most of those households own.
Three separate holes sit behind that.

**The first is that property tax has no honest source shape.** A property tax
bill is the product of an assessed value set by a county assessor, a millage rate
set by a patchwork of overlapping local districts, and a set of exemptions the
owner may or may not have claimed. None of those three is published in one place,
none is stable across a state, and a database of them starts rotting the day it
is transcribed. A tool that shipped a county rate table would be shipping a
figure that is wrong for most users and undetectably stale for the rest.

But the *relief regimes* are a different object entirely. Florida's homestead
exemption and its Save Our Homes assessment-increase cap sit in the state
constitution. California's Proposition 13 acquisition-value basis, its ad valorem
rate ceiling and its annual assessed-value inflation cap sit in Article XIII A of
the California constitution. These are statutory, stable, and citable to a
section. **The rate and the assessment are local facts the household declares.
The relief regime is a sourced rule the pack carries.** Collapsing the two into
one input model is what makes property tax look unsourceable when it is not.

**The second is that the federal return already depends on property tax and the
tool pretends it does not.** Feature 021 models the itemized deduction as a single
declared amount, and the current suite pins `'state-and-local-tax'` in the
not-modeled ledger. Once state income tax exists (Feature 022) and property tax
exists (this feature's Scope 01), those two compete inside one capped deduction,
and that competition decides whether itemizing beats the standard deduction at
all. A declared lump sum cannot express a cap that two named components are
fighting over, and it cannot show a household that its next dollar of property tax
bought it nothing.

**The third is that rental income is not one thing.** Publication 527 splits a
dwelling unit into categories by a personal-use test with two parameters, and the
answer changes the arithmetic completely: a property rented fewer than fifteen
days excludes the rent from income and deducts none of the expenses, while a
property below the personal-use threshold runs a full Schedule E with
depreciation, at-risk limits and passive-activity loss limits. A tool that
computed "rental income minus rental expenses" would be silently wrong for the
vacation-home population and would give no signal that it had chosen a category.

Two failure modes still matter more than accuracy, because a user cannot detect
either:

1. **A plausible number in place of a refusal.** A "typical effective property tax
   rate" is an average wearing a calculation's clothes.
2. **A computed leg that never reaches the page.** Feature 022's validation found
   a headline showing one leg where the combined total belonged, understating tax
   by eighty-eight percent, latent only because the hidden legs happened to be
   zero. This feature adds more legs than any before it. A leg that is computed
   and not surfaced is the same defect with a larger blast radius.

---

## Outcome Contract

**Intent.** A household that declares its property's assessed value, its local
tax rate, the exemptions it claims, its mortgage interest, its rental days and
personal-use days, and — on sale — its basis and holding history, learns five
things Feature 022 could not tell it: what its property tax is and which statutory
relief regime shaped it, whether itemizing now beats the standard deduction once
property tax and state income tax compete inside one capped deduction, what a
long-term rental contributes after depreciation and loss limits, which Publication
527 category its vacation property actually falls into, and what a sale costs
once the recapture and the primary-residence exclusion are both applied.
Everything the tool cannot compute is still named, not omitted.

**Success signal.** For the declared tax year, an independent reader can take the
displayed result, the displayed reconciliation identity, and the displayed source
records, and re-derive every figure from the cited primary sources without
consulting this repository — including which figures came from the household and
which came from an authority. Every computed leg appears in the headline, the
comparison, the marginal curve and the export, and an assertion fails if any one
of them is computed and not surfaced.

**Hard constraints.**

- Every rate, threshold, cap, limit, recovery period, convention and exclusion
  amount in any pack is transcribed from a primary source actually retrieved at
  implementation time, cited inline with source title, URL, `retrievedAt` and a
  locator naming the section. No figure comes from memory, a secondary site,
  interpolation, derivation, or another tax year.
- **Declared and sourced are separate object kinds and refuse differently.** An
  assessed value, a local tax rate, an exemption election and a declared
  assessment cap are household declarations; missing ones refuse
  `RLTAX-INPUT-INCOMPLETE`. A statutory relief-regime parameter is a sourced rule;
  an unretrieved one ships `AbsentFigure/v1` and refuses
  `RLTAX-THRESHOLD-UNAVAILABLE`. The two are never rendered the same way.
- Whatever a retrieval genuinely fails to establish ships as an `AbsentFigure/v1`
  and its dependent leg refuses. That discipline is not weakened to improve
  coverage.
- Unavailable is never `0`, never `null`, never a missing key and never a dropped
  leg. `SourcedZero/v1` remains a distinct object from every unavailable shape.
- Every result field carries a rule status from the closed enum
  `enacted-current-law` · `enacted-scheduled-law` · `user-hypothetical-law` ·
  `unavailable`.
- The refusal vocabulary is **not extended**. Every condition this feature raises
  is an existing member.
- No probability of any kind. No market simulation. No lifetime projection. No
  break-even year. No ranking. No recommendation. No appreciation assumption.
- No published error rate, self-invalidation statistic, track record or accuracy
  figure anywhere in spec text, scope text or user-facing copy.
- Local-only. The only runtime transport is same-origin reads of the declared
  policy and pack documents. No household value — including the
  property's assessed value, its rental days and its basis — in any URL, query
  string, hash, request, referrer, console message or committed artifact.
- Educational only. Not tax advice. Does not prepare or file a return.

**Failure condition.** The feature fails — even with every test green — if a user
can read a housing figure and be unable to tell whether it came from an authority
or from their own keyboard; if any computed leg exists in the record and not on
the page; or if a Publication 527 classification is made without the sourced test
parameters that decide it.

---

## Resolved Decisions

### RD-1: The assessment is declared and the relief regime is sourced

**Decision.** `PropertyAssessment/v1` carries only declared members: assessed
value, the local combined tax rate, the exemption elections the owner claims, and
the prior-year assessed value where a cap regime needs it. `PropertyReliefRegime/v1`
carries only sourced members: the regime's identifier, the exemption amounts and
tiers the constitution fixes, the assessment-increase cap and its basis, and the
rate ceiling where one exists — each with its own `SourceRecord`.

**Why.** A county millage rate and an individual parcel's assessed value are
neither published centrally nor stable, so a shipped table of them is stale on
arrival and undetectably wrong per user. The relief regimes are constitutional
text with section numbers. Splitting the object along that line means the parts
that can be sourced are sourced and the parts that cannot be are asked for, and
the user can see which is which. The alternative — one blended "property tax
input" — makes the sourced half unsourceable and the declared half look
authoritative.

**Consequence.** Two different refusals reach the same panel and must read
differently. An undeclared assessed value is the household's to fix. An
unretrieved Save Our Homes cap is the pack's.

### RD-2: Florida and California again, for a different reason

**Decision.** The two shipped relief regimes are Florida (homestead exemption plus
the Save Our Homes assessment-increase cap) and California (Proposition 13
acquisition-value basis, annual assessed-value inflation cap, ad valorem rate
ceiling).

**Why.** Feature 022 chose these two states because their income-tax regimes are
maximally different. Their property-tax regimes are maximally different along a
*different* axis, which is what makes the reuse honest rather than convenient.
Florida caps the *growth* of an assessed value that otherwise tracks market value.
California freezes the *basis* at acquisition and lets a separate cap limit its
growth. One is a brake on an annually re-set figure; the other is a different
figure entirely. A regime contract that handles both is handling the two shapes
the rest of the country's regimes are variations on.

**Consequence.** The regime contract cannot assume a single "cap percentage"
member. It carries a cap with a declared basis — `prior-assessed-value` versus
`acquisition-value` — and the engine applies it at the declared basis.

### RD-3: SALT is a composition, not a lump sum

**Decision.** The itemized deduction stops being a single declared amount and
becomes a composed record: named components, each with its own origin, summed and
then capped, with the cap's binding recorded explicitly.

**Why.** Once state income tax and property tax are both computed, a household's
next dollar of either may buy no deduction at all. That is a decision-relevant
fact and it is invisible in a lump sum. It is also the only honest way to remove
`'state-and-local-tax'` from the not-modeled ledger: the ledger entry is a promise
that the tool is not silently including it, and the replacement must be a visible
composition rather than a quieter inclusion.

**Consequence.** This is the single largest supersession surface in the feature.
Every assertion pinning the not-modeled count and the declared-amount shape is
named in the [supersession ledger](#supersession-ledger).

### RD-4: The Publication 527 classification is a first-class result, not a branch

**Decision.** `UseClassification/v1` is a returned record carrying the category,
the two declared day counts, the sourced test parameters that decided it, and the
comparison that was actually performed. The engine does not branch on days
inline; it classifies, publishes the classification, and then settles the category.

**Why.** A household cannot verify a number it cannot see the category behind. The
14-day and 10-percent parameters are sourced figures, and a classification made
without them is not a classification — it is a recalled rule of thumb. Publishing
the record also makes the three boundary cases assertable at the exact figure
rather than at a chosen side of it.

**Consequence.** Adversarial coverage at exactly 14 personal-use days, at exactly
10 percent of rental days, and at exactly 15 days rented is mandatory, and each
must be shown to fail against an off-by-one implementation.

### RD-5: Unrecaptured Section 1250 gain becomes a carried preferential category

**Decision.** The disposition scope removes depreciation recapture from the list
of preferential categories Feature 022 ships as unsupported, and carries it as a
category with its own maximum rate, stacking inside Feature 022's preferential
model rather than beside it.

**Why.** Feature 022 deferred three categories taxed above its top carried
preferential rate, of which depreciation recapture is one. A rental disposition
without it is not a disposition result; it is the part of the answer that happens
to be easy. The maximum rate is a sourced figure with its own authority, which is
exactly the split-authority shape Feature 022's `ComponentSource/v1` exists for.

**Consequence.** The assertion that names depreciation recapture as permanently
unsupported is superseded by this feature, and the other deferred categories keep
their clause verbatim.

---

## Sourcing Directive

This section is inherited verbatim in force from
[Feature 022](../022-federal-preferential-and-state-income-tax/spec.md#sourcing-directive)
and binds every pack in this feature.

1. **Retrieved or absent.** A figure enters a pack only from a primary source the
   pack author retrieved directly, recorded in a `SourceRecord` whose
   `retrievalOutcome` is `retrieved`. There is no third state.
2. **No derivation.** A figure is never computed, interpolated, extrapolated,
   inferred from an adjacent figure, carried from another year, recalled, or read
   off a secondary aggregator.
3. **Per-component citation.** Where the components of one figure-bearing object
   come from different authorities, each cites its own.
4. **The locator is part of the citation.** A `sourceRef` without a locator naming
   the section, table or publication heading is not a citation.
5. **Cross-checking is not sourcing.** Agreement between a summary and a detail
   authority is a `retrievalNote`, never a promotion.
6. **A sourced zero is a figure.** A regime that grants no relief carries a valued
   record with a citation, not an absent one and not a missing key.
7. **This specification is not a transcription source.** No figure in this
   document may be transcribed into a pack.
8. **A declaration is not a source.** A household-declared assessed value or local
   rate is neither sourced nor absent; it is declared, carries no `sourceRef`, and
   is labelled as the household's own input wherever it is displayed.

### Named authorities for this feature

Each is a likely authority for the input beside it. None has been retrieved by
this planning session, and none may be transcribed from this table. Each must be
retrieved at implementation time, and an input that cannot be retrieved ships as
an `AbsentFigure/v1` while its leg refuses.

| Input | Likely authority |
| --- | --- |
| Homestead exemption structure and the Save Our Homes assessment-increase cap | Florida Constitution Article VII, and the Florida Department of Revenue property-tax pages |
| Acquisition-value basis, the annual assessed-value inflation cap and the ad valorem rate ceiling | California Constitution Article XIII A, and the California State Board of Equalization |
| State and local tax deduction cap and its filing-status variation | IRS Schedule A instructions |
| Mortgage interest acquisition-debt limit and its grandfathered tier | IRS Publication 936 |
| Residential rental recovery period and applicable convention | IRS Publication 527 and IRS Publication 946 |
| At-risk limitation and passive-activity loss limits, the special allowance and its phase-out | IRS Publication 925 |
| Personal-use test parameters and the fewer-than-15-days rental exception | IRS Publication 527 |
| Primary-residence exclusion amounts and the ownership and use period figures | IRS Publication 523 |
| Unrecaptured Section 1250 gain maximum rate | IRS Topic no. 409 |

---

## Assertion Supersession Contract

This section is inherited from
[Feature 022](../022-federal-preferential-and-state-income-tax/spec.md#assertion-supersession-contract)
and is normative here. Rules ASC-1 through ASC-7 apply unchanged. ASC-8 is added
by this feature and is the correction of a defect Feature 022 experienced three
times.

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
| ASC-1 | **Cause.** An assertion may be superseded only when an approved scope of this feature deliberately changes the behaviour it pinned, and only when that scope's requirement coverage names the `FR-023-*` or `NFR-023-*` requirement mandating the change. Convenience, difficulty, a red suite, a deadline and a large diff are never sufficient cause. |
| ASC-2 | **Individual naming.** Every superseded assertion is named individually in the ledger below: the file, the approximate line, the exact clause it asserted, the owning scope, and why the change is deliberate. A group, a file and a "related assertions" phrase are not names. |
| ASC-3 | **Same-change replacement.** Every superseded assertion is replaced in the same change by a named assertion that preserves the original protection in the new world. Deletion without a named replacement is forbidden. A replacement deferred to a later scope is a deletion. |
| ASC-4 | **At least as strong, and derived.** The replacement asserts everything the original asserted that is still true, plus the rule the new behaviour introduces. Where the original was a brittle literal, the replacement derives its expected value from the artifact it describes, so it cannot rot into a false green. |
| ASC-5 | **Adversarial case.** Every replacement carries at least one adversarial case that fails if the new behaviour regresses to the old defect, and at least one that fails on a fabricated figure. |
| ASC-6 | **Ledger and marker.** Each delivered replacement carries a `SUP-023-NN` marker beside it in the source, so the ledger and the code are greppable against each other. |
| ASC-7 | **No vacuous branch.** Where a replacement splits into a branch for the new behaviour and a retained branch for the old, the retained branch runs against a fixture the implementer controls and is asserted to have been exercised at least once. |
| ASC-8 | **In-flight admission, without a planning round trip.** The ledger below is pre-populated with every supersession this planning session could predict from the tree it read. It is explicitly **not** closed. An implementer who meets a pre-existing assertion that fails for an ASC-1 cause not already in the ledger **admits a new entry in place** — appending a row here with the next free `SUP-023-NN`, its target, its owning scope and its traded protection — and proceeds under ASC-2 through ASC-7 without returning to planning. What the implementer may **not** do is edit an assertion without an entry, admit an entry whose cause is not ASC-1, or leave the entry unrecorded until the end of the scope. The stop that ASC-2 produces in Feature 022 exists to prevent a silent edit; a recorded in-flight admission serves that purpose and a round trip does not. |

### What this contract does not permit

- Relaxing a sourcing rule. An unretrieved figure still ships as an
  `AbsentFigure/v1` and its leg still refuses. No entry here touches the
  [Sourcing Directive](#sourcing-directive), and none ever may.
- Loosening a tolerance, widening a numeric range, converting an equality to an
  inequality, or replacing a value assertion with a truthiness check.
- Deleting an adversarial case, a determinism assertion, a privacy assertion, a
  zero-network assertion, or a Feature 008 byte-identity canary.
- Removing a Playwright test, renaming a persistent test title, or changing a
  `--grep` selector.
- Superseding an assertion belonging to a feature this feature does not extend.
- Changing the pre-existing selftest pass count downward.

### Supersession ledger

Nine pre-existing assertions were predicted to be superseded, each by a named
stronger replacement, a tenth was admitted in flight under ASC-8 during Scope
01's implementation, an eleventh was admitted in flight under ASC-8 during Scope
02's, a twelfth was admitted in flight under ASC-8 during Scope 03's, and a
thirteenth and a fourteenth were admitted in flight under ASC-8 during Scope
04's.
**Five are owned by Scope 01, five by Scope 02, one by Scope 03, two by Scope 04
and one by Scope 05.** The ledger is open under ASC-8 and the implementer may
append.

Every target below was read from the repository tree during this planning
session. Line numbers are approximate and are re-resolved at implementation time,
because Feature 022's scopes land between this plan and this implementation and
will move them.

| ID | Target | Owning scope | Protection traded for |
| --- | --- | --- | --- |
| SUP-023-01 | `scripts/selftest.mjs` ~L11525 — `requiredUnsupportedIds` contains `'state-and-local-tax'` | 02 | A disjoint, exhaustive accounting between `unsupportedFeatures[]` and the deduction composition record, so the id is proven to have moved into a modelled component rather than to have vanished |
| SUP-023-02 | `tests/lifetime-tax-conversion.spec.mjs` L58 — `#notModeledSummary li` `toHaveCount(8)` together with the `'State and local income tax'` label expectation | 02 | A pack-derived count plus two-directional label/id set identity, and a positive assertion that the removed entry is now a named component of the itemized composition |
| SUP-023-03 | `tests/lifetime-tax-conversion.spec.mjs` L69 — `#notModeledDetailBody tr` `toHaveCount(8)` and the positional `detail.nth(0)` / `detail.nth(3)` code expectations | 02 | The same derived count, with selection by declared entry id instead of by ordinal so a reordering cannot pass |
| SUP-023-04 | `scripts/selftest.mjs` ~L13002 — `simpleFields.length === 7` | 02 | Cross-artifact identity between the closed Simple list and the rendered Simple markup, derived so the fields Scopes 03 and 05 add are absorbed without a further entry; every Simple-stays-decision-level clause retained verbatim |
| SUP-023-05 | `scripts/selftest.mjs` ~L13009 — `powerLinkDetails.length === 9 && powerLinkSections.length === 9` | 01 | Two-directional identity between the withheld-detail links and the declared `POWER_SECTION_IDS`, derived from the page rather than pinned |
| SUP-023-06 | `tests/lifetime-tax-route.spec.mjs` L55 — `#powerLinkRows button[data-power-section]` `toHaveCount(9)` | 01 | The same derived identity, in the file that owns the rendering |
| SUP-023-07 | `tests/lifetime-tax-foundation.spec.mjs` L216 — `#storageInventoryBody tr` `toHaveCount(3)` | 01 | A count derived from the declared storage inventory plus two-directional key identity, so a stored key added without an inventory entry fails |
| SUP-023-08 | `tests/lifetime-tax-foundation.spec.mjs` L279 — the same literal in the clear-action test | 01 | The same derived count, plus the assertion that the clear action removes every inventoried key rather than a fixed three |
| SUP-023-09 | `scripts/selftest.mjs` — the clause naming depreciation recapture among the preferential categories taxed above the top carried rate as unsupported, delivered by Feature 022's SUP-022-02 replacement near ~L11461; exact line re-resolved at implementation time | 05 | Unrecaptured Section 1250 gain is a carried preferential category with its own sourced maximum rate and its own stacking position; the remaining above-rate categories keep the original clause verbatim and are asserted still refused |
| SUP-023-10 | `tests/lifetime-tax-foundation.spec.mjs` L246 and `tests/lifetime-tax-route.spec.mjs` L277 — the request-ledger filter against `ALLOWED_ASSET_PATHS`, a hand-maintained literal naming the route's four modules | 01 | **Admitted in flight under ASC-8.** Cause: FR-023-007 requires the property settlement to reach the route, so Scope 01 adds `rltaxproperty.js` to the page and the literal no longer describes it. Traded for: an allow-list derived from the route's own script tags and its declared configuration and packs, so a module the page declares is admitted by that declaration while a request to anything the page never declared still fails. Strictly stronger because a literal must be hand-edited to admit a new module and that edit is indistinguishable from one admitting a leak. Adversarial cases assert the derived set contains the added module, contains every member of the superseded literal, and rejects an undeclared asset — so a degenerate derivation returning everything or nothing fails |
| SUP-023-11 | `scripts/selftest.mjs` — TP-02-10's `noticeIds.includes('state-and-local-tax')` clause, delivered by Feature 022's group; exact line re-resolved at implementation time | 02 | **Admitted in flight under ASC-8.** Cause: FR-023-013 moves that id out of `unsupportedFeatures[]`, so a clause requiring it to be SURFACED as a not-carried feature pins a fact that is no longer the fact. Traded for: the id is asserted ABSENT from the notice set and PRESENT as the capped component family the pack's own cap declares. Strictly stronger because a deletion with nothing modelled in its place fails both halves rather than passing one; the other five named ids keep their clause verbatim |
| SUP-023-12 | `scripts/selftest.mjs` — TP-02-12's `restored02` reconstruction, which deletes a hand-maintained list of exactly three top-level members and restores one `unsupportedFeatures` entry before comparing the pre-feature content digest | 03 | **Admitted in flight under ASC-8.** Cause: FR-023-016, FR-023-017 and FR-023-018 require the recovery period, the convention and the loss-limit ordering to live in the federal pack, so Scope 03 inserts two source records and two top-level members. The reconstruction removes only Scope 02's three members, so the pre-feature digest no longer reproduces and the assertion fails for an ASC-1 cause. Traded for: the reconstruction is DERIVED from the recorded pre-feature top-level member list instead of from a per-scope removal list, and gains a clause the literal never had — the pack's member set is asserted to partition exactly into that recorded pre-feature list and this feature's declared additions, so a top-level member inserted without being declared fails by name rather than hiding behind the additive permission. Strictly stronger because the same pre-feature digest constant is retained and re-asserted unchanged over the same reconstructed bytes, a new smuggling route is closed, and a later scope's additive insertion no longer requires editing the check — which is the maintenance hole that produced this admission. Adversarial cases assert the derived reconstruction fails when a pre-existing figure is mutated, fails when an undeclared top-level member is added, and still reproduces the recorded pre-feature digest |
| SUP-023-13 | `tests/lifetime-tax-rental.spec.mjs` L103 and L232 — `page.locator('[data-rl-leg="rental-net"]')` `toHaveCount(1)`, a literal pinning the rental leg to exactly one node anywhere on the page; exact lines re-resolved at implementation time | 04 | **Admitted in flight under ASC-8.** Cause: FR-023-028 and NFR-023-006 require every settled leg to reach the headline, the comparison, the curve and the export, and Scope 04 wires the rental leg into the comparison and curve tables it previously reached only as a headline figure. The literal was true only while the leg reached one surface, so it now fails BECAUSE the leg reached more of them, which is an ASC-1 cause. Traded for: a surface-scoped identity in which the surface set is read from the page's own `data-rl-leg-surfaces` declaration, each declared surface is asserted to host the leg exactly once, the total node count is asserted to equal the declared surface count so no node sits outside a declared surface, and the exported leg record is asserted to carry it. Strictly stronger because the literal could not distinguish a leg missing from one surface and duplicated on another from a leg correctly placed on both, while the replacement names the failing surface; and because a bare count must be hand-edited by the next scope that adds a surface, and that edit is indistinguishable from one hiding a leg that stopped rendering. Adversarial cases remove the leg from the first declared surface and render it twice on that surface, and each is asserted to be reported by the name of that surface — so a degenerate census returning an empty finding list for everything fails |
| SUP-023-14 | `scripts/selftest.mjs` — TP-03-26's `ledgerRows03 === 12` together with its `Five plus five plus one plus one is twelve` arithmetic clause, two hand-maintained TOTALS pinned while the ledger stood at twelve rows; exact line re-resolved at implementation time | 04 | **Admitted in flight under ASC-8.** Cause: SUP-023-13 is itself an ASC-8 admission, and ASC-8 requires the ledger, its opening count paragraph, the ownership table and the marker distribution to be updated in the same change; the two pinned totals then describe a ledger that no longer exists, which is an ASC-1 cause. Traded for: the totals are DERIVED — the ledger row count, the sum of the ownership table's own count column, and the total the arithmetic sentence states in words are each computed from the artefacts and asserted equal to one another, the sentence's per-scope addends are asserted equal to the ownership column entry by entry, and each ledger id is asserted to be owned by exactly the scope the ownership table lists it under. Strictly stronger because the literal `12` passed even when the ownership table and the arithmetic sentence disagreed with the ledger, while the derived form fails naming whichever surface drifted; and because every future ASC-8 admission is absorbed without editing this check, which is the maintenance hole that produced this admission. Every Scope-03-specific clause — the twelfth-admitted sentence, the `| 03 | SUP-023-12 | 1 |` row, the marker-distribution row and the marker's presence in the file that carries it — is retained verbatim |

### Assertions considered and not superseded

This table records what the planning sweep examined and cleared, so a later reader
can tell a cleared assertion from an unexamined one.

| Assertion | Why it is not eligible |
| --- | --- |
| `tests/lifetime-tax-route.spec.mjs` L79 — `#bracketDetailBody tr` `toHaveCount(7)` | This feature changes no federal ordinary bracket. The count is unaffected and an edit would be a weakening. |
| `tests/lifetime-tax-route.spec.mjs` L80 — the reconciliation row count | Already superseded by Feature 022's SUP-022-16 with a replacement derived from the published leg list, which absorbs every leg this feature adds. No further entry is needed and none is permitted. |
| `tests/lifetime-tax-federal.spec.mjs` L213 — the reconciliation row count and its bounded loop | Already superseded by SUP-022-15 with a derived replacement, for the same reason. |
| `scripts/selftest.mjs` ~L13643 — `absentFigures.length === 12` | This is the Feature 022 California income-tax pack's absent-figure count. The property relief regimes are separate packs and do not enter that array. |
| `scripts/selftest.mjs` ~L11379 — the refusal-vocabulary member count | This feature adds no refusal code, so the count does not change. A DoD item asserts it did not. |
| `tests/lifetime-tax-conversion.spec.mjs` L27 — `#policyComparisonBody tr` `toHaveCount(2)` | This feature adds no conversion policy. |
| Every Feature 008 byte-identity canary | Not eligible under any circumstance. |
| Every determinism, privacy and zero-network assertion | Not eligible under any circumstance. |

---

## Scope Of This Feature

Five sequential scopes. Each delivers one user-visible outcome across contract,
engine and route in the same slice. No scope is a layer.

1. Property assessment mechanics and the two statutory relief regimes.
2. Primary-residence federal interaction: mortgage interest, the capped state and
   local tax deduction, and the itemized-versus-standard decision.
3. Long-term rental: Schedule E, residential rental depreciation, at-risk and
   passive-activity loss limits, and suspended losses.
4. Short-term and vacation rental: the Publication 527 classification, the
   fewer-than-15-days exception, and personal-versus-rental expense allocation.
5. Disposition: gain on sale, unrecaptured Section 1250 recapture at its own
   maximum rate, and the primary-residence exclusion.

## Goals

- Make property tax computable from what a household actually knows, with the
  statutory relief that shaped it cited to a section.
- Make the itemized-versus-standard decision visible as a competition inside a cap
  rather than as a lump sum.
- Give a long-term rental an honest after-depreciation, after-limits answer, with
  disallowed amounts named rather than dropped.
- Make the vacation-rental category an explicit, sourced, verifiable classification.
- Price a disposition including the part that is usually omitted.

## Non-Goals

- No county, municipal or district rate database. Local rates are declared.
- No property valuation, appraisal, comparable-sales estimate or appreciation
  assumption of any kind.
- No multi-year depreciation schedule, no carryforward projection beyond the
  declared year's closing figure, and no lifetime housing projection. Those are
  Feature 025.
- No additional state packs, no local income tax, no part-year or multi-state
  residency. Those remain Feature 024.
- No registration. `tools.json`, `index.html`, `rlnav.js`, `README.md`,
  `notes/README.md` and market-brief coverage are untouched. That is Feature 026.
- No commercial or non-residential rental property, no like-kind exchange, no
  installment sale, no rental of a unit the household does not own.
- No probability, no market simulation, no ranking, no recommendation.

## Deferral Register — Recorded, Not Omitted

Each is a real capability this feature does not deliver, recorded with the
successor that owns it so the not-modeled ledger can name it.

| Deferred | Owner |
| --- | --- |
| Multi-year depreciation schedules and cumulative suspended-loss ledgers | Feature 025 |
| Additional state property regimes beyond Florida and California | Feature 024 |
| Local and municipal income tax interacting with the deduction cap | Feature 024 |
| Like-kind exchanges, installment sales and involuntary conversions | Not scheduled; recorded as unsupported |
| Reduced primary-residence exclusion for unforeseen circumstances | Not scheduled; refuses `RLTAX-SCOPE-DEFERRED` |
| Commercial and non-residential rental property | Not scheduled; recorded as unsupported |
| Registration in the site index, navigation and brief | Feature 026 |

## Domain Capability Model

### Capability

Given declared property facts, declared use facts and a sourced relief regime,
produce a property-tax settlement, a housing contribution to the federal
settlement, a rental settlement under a published use classification, and a
disposition settlement — each traceable to either an authority or a declaration.

### Domain primitives

- **Assessment** — a declared valuation of one property for one year, with the
  prior-year value where a cap regime needs it.
- **Relief regime** — a sourced set of rules that reduce an assessment or cap its
  growth, identified and dated.
- **Deduction component** — one named contributor to the itemized deduction, with
  its origin recorded as declared or computed.
- **Use classification** — a category assigned to a dwelling unit by comparing
  declared day counts against sourced test parameters.
- **Cost recovery** — a periodic deduction against rental income under a sourced
  recovery period and convention.
- **Loss limitation** — a rule that disallows a computed loss and states what
  becomes of the disallowed amount.
- **Disposition** — a realized transfer producing gain components that are priced
  under different rate rules.

### Business policies every concrete regime and engine must obey

- A declared figure is never presented as sourced, and a sourced figure is never
  presented as declared.
- A disallowed loss is named and carried, never silently zeroed.
- A classification is published with the parameters that decided it.
- A leg that is computed is surfaced.

---

## Actors And Personas

- **The homeowner** — holds one primary residence, wants to know what property tax
  costs and whether itemizing is now worth it.
- **The landlord** — holds one long-term rental, wants an after-depreciation,
  after-limits figure and wants to know what was disallowed.
- **The vacation-home owner** — mixes personal and rental use, needs to know which
  category the property falls into before any number means anything.
- **The seller** — is disposing of a property and needs the recapture and the
  exclusion applied in the right order.

## Use Cases

### UC-023-001: Find out what the house costs to hold
The homeowner declares an assessed value, a local rate and an exemption election,
picks a state with a shipped regime, and receives a property-tax figure with the
constitutional relief that shaped it cited to a section.

### UC-023-002: Find out whether itemizing is still worth it
The homeowner declares mortgage interest, and sees property tax and state income
tax competing inside one capped deduction, with the cap's binding stated and the
standard-deduction comparison shown.

### UC-023-003: Price a long-term rental honestly
The landlord declares rent and expenses and receives a Schedule E result after
depreciation, with any at-risk or passive-activity disallowance named and carried.

### UC-023-004: Learn which category the vacation home is in
The vacation-home owner declares rental days and personal-use days and receives a
published classification with the sourced parameters that produced it.

### UC-023-005: Price a sale
The seller declares proceeds, basis, accumulated depreciation and holding history
and receives a gain split into its components, each priced under its own rule.

### UC-023-006: Audit a housing figure
Any user opens a housing figure's detail and can tell at a glance whether it came
from an authority or from their own declaration, and reach the section behind it.

---

## Business Scenarios

### BS-023-001 / SCN-023-001: A declared assessment and a sourced regime refuse differently
Given a property whose assessed value is undeclared, and separately a property in
a jurisdiction whose relief regime was not retrieved, when the property-tax
settlement runs, then the first is `RLTAX-INPUT-INCOMPLETE` naming the missing
declaration and the second is `RLTAX-THRESHOLD-UNAVAILABLE` naming the unretrieved
rule; the two refusals read differently, neither shows a zero, and neither
substitutes an average or a typical rate.

### BS-023-002 / SCN-023-002: A homestead exemption and an assessment-growth cap are applied at their declared points
Given a declared assessment, a declared prior-year assessed value and a shipped
regime carrying an exemption and a growth cap, when the settlement runs, then the
exemption is applied to the assessment and the cap is applied against the regime's
declared basis, both figures are shown before and after, and each cites the
constitutional section that establishes it.

### BS-023-003 / SCN-023-003: An acquisition-value regime is a different figure, not a different percentage
Given a property under an acquisition-value regime whose declared acquisition
value differs materially from its declared current market value, when the
settlement runs, then the taxable basis is the capped acquisition value rather
than the market value, the rate ceiling is applied as a ceiling on the declared
local rate rather than as the rate, and a regime declaring a `prior-assessed-value`
cap basis is proven to produce a different figure from one declaring
`acquisition-value`.

### BS-023-004 / SCN-023-004: Property tax and state income tax compete inside one cap
Given a household with both a computed property tax and a computed state income
tax, when the itemized deduction is composed, then each component appears by name
with its origin, the sum is capped at the sourced limit for the filing status, the
cap's binding is stated explicitly, and the amount of each component that bought
no deduction is shown.

### BS-023-005 / SCN-023-005: Mortgage interest is limited by a sourced debt limit
Given declared mortgage interest and a declared acquisition-debt balance above the
sourced limit, when the deduction is composed, then the deductible portion is
computed from the sourced limit, the disallowed portion is named rather than
dropped, and a declared balance for which no sourced limit was retrieved refuses
rather than deducting the full amount.

### BS-023-006 / SCN-023-006: The itemized-versus-standard decision is shown, not assumed
Given a composed itemized total and the sourced standard deduction for the filing
status, when the federal settlement runs, then both totals are displayed side by
side, the one actually used is named, the decision is recomputed rather than
declared, and a household whose itemized total falls below the standard deduction
is told that its property tax changed nothing.

### BS-023-007 / SCN-023-007: A long-term rental settles on Schedule E after depreciation
Given declared rental income, declared operating expenses, a declared depreciable
basis and a sourced recovery period and convention, when the rental settlement
runs, then depreciation is computed from the sourced period and convention rather
than from a recalled figure, the net result is a leg of the federal settlement,
and an unretrieved recovery period refuses the depreciation rather than omitting it.

### BS-023-008 / SCN-023-008: A rental loss is limited and the disallowed amount is carried, not dropped
Given a rental producing a loss, a declared at-risk amount and declared modified
adjusted gross income within the special-allowance phase-out, when the limits are
applied, then the at-risk limit is applied before the passive-activity limit, the
special allowance is computed from the sourced amount and phase-out range, the
disallowed amount is published as a closing suspended-loss figure for the declared
year, and no disallowed amount is silently zeroed.

### BS-023-009 / SCN-023-009: A declared opening suspended loss is used without becoming a projection
Given a declared opening suspended-loss carryforward, when the rental settlement
runs, then the opening figure is treated as a declaration, is allowed only to the
extent the declared year's rules permit, and the closing figure is published for
the declared year only, with no future year computed, displayed or implied.

### BS-023-010 / SCN-023-010: The personal-use test is run against sourced parameters and published
Given declared rental days and declared personal-use days, when the classification
runs, then the category is produced by comparing the declarations against the
sourced day figure and the sourced percentage figure, the record publishes both
parameters with their citations and the comparison performed, and a classification
attempted without a retrieved parameter refuses rather than falling back to a
recalled rule.

### BS-023-011 / SCN-023-011: The three classification boundaries land on the correct side
Given a property at exactly the sourced personal-use day figure, one at exactly the
sourced percentage of rental days, and one rented exactly at the fewer-than-15-days
boundary, when each is classified, then each lands on the side the publication
states, each is asserted at the exact figure rather than near it, and an
implementation that treats any of the three comparisons as strict where the
publication states inclusive is proven to fail.

### BS-023-012 / SCN-023-012: A property rented under the exception excludes income and deducts nothing
Given a property rented fewer than the sourced threshold of days and used as a
residence, when the settlement runs, then the rental income is excluded from
income, no rental expense is deducted, the exclusion is stated as the reason
rather than presented as a zero result, and the mortgage interest and property tax
remain available to the itemized composition unallocated.

### BS-023-013 / SCN-023-013: A mixed-use property allocates expenses between personal and rental use
Given declared rental days, declared personal-use days and declared expenses, when
the settlement runs, then each expense is allocated by the declared day counts,
the allocation basis is published with each allocated figure, the rental portion
of a directly-allocable expense is not re-allocated, and the personal portion is
routed to the itemized composition rather than discarded.

### BS-023-014 / SCN-023-014: A disposition splits gain into components priced under different rules
Given declared proceeds, declared adjusted basis and declared accumulated
depreciation, when the disposition settles, then the gain is split into an
unrecaptured Section 1250 component and a remaining long-term component, the
first is priced at the sourced maximum rate for that category and the second
stacks under Feature 022's preferential model, the two are separate legs, and a
result that prices the whole gain at one rate is proven to fail.

### BS-023-015 / SCN-023-015: The primary-residence exclusion applies after recapture and only when both tests pass
Given a declared ownership history and a declared use history over the sourced
lookback period, when the exclusion is applied, then the ownership test and the use
test are evaluated separately against sourced period figures, the exclusion amount
is the sourced amount for the filing status, the exclusion is applied to the
remaining gain and not to the recapture component, and a history that fails either
test receives no exclusion with the failing test named.

---

## Requirements

### Property assessment mechanics — Scope 01

- **FR-023-001** — `PropertyAssessment/v1` carries only declared members and no
  `sourceRef`; every displayed assessment figure is labelled as the household's
  declaration.
- **FR-023-002** — `PropertyReliefRegime/v1` carries only sourced members, each
  with its own `SourceRecord` and locator; an unretrieved member is an
  `AbsentFigure/v1`.
- **FR-023-003** — an undeclared assessment member refuses `RLTAX-INPUT-INCOMPLETE`
  naming the member; an unretrieved regime member refuses
  `RLTAX-THRESHOLD-UNAVAILABLE` naming the rule; the two are structurally distinct.
- **FR-023-004** — a relief regime declares each mechanism's application point and
  the engine applies it there; an exemption applied to a rate and a cap applied to
  a tax amount are each incoherent and refused.
- **FR-023-005** — an assessment cap declares its basis from the closed set
  `prior-assessed-value` · `acquisition-value`, and the engine applies it at that
  basis with no regime-name branch anywhere in any module.
- **FR-023-006** — a rate ceiling is applied as a ceiling on the declared local
  rate and never as the rate itself; a declared rate below the ceiling is used
  unchanged and the fact is stated.
- **FR-023-007** — the property-tax settlement is a leg with a rule status, and it
  appears in the headline, the comparison, the marginal curve and the export.

### Primary residence federal interaction — Scope 02

- **FR-023-008** — the itemized deduction is a composed record of named components,
  each carrying its origin as declared or computed.
- **FR-023-009** — the state and local tax cap is a sourced figure with its
  filing-status variation; the cap is applied to the summed component and the
  binding is recorded explicitly.
- **FR-023-010** — the amount of each capped component that produced no deduction is
  computed and displayed.
- **FR-023-011** — mortgage interest deductibility is computed from a sourced
  acquisition-debt limit; the disallowed portion is named; an unretrieved limit
  refuses rather than deducting in full.
- **FR-023-012** — the itemized-versus-standard decision is recomputed from the
  composed total and the sourced standard deduction, and the chosen side is named.
- **FR-023-013** — `'state-and-local-tax'` moves out of `unsupportedFeatures[]` into
  a named component, and the accounting between the two is disjoint and exhaustive.
- **FR-023-014** — the composition and the decision are surfaced in the headline,
  the comparison, the marginal curve and the export.

### Long-term rental — Scope 03

- **FR-023-015** — rental income and operating expenses are declared members; the
  net result is computed and published as a named leg.
- **FR-023-016** — depreciation is computed from a sourced recovery period and a
  sourced convention; neither may be recalled, derived or defaulted.
- **FR-023-017** — the at-risk limit is applied before the passive-activity limit
  and the order is asserted rather than assumed.
- **FR-023-018** — the passive-activity special allowance is computed from a sourced
  amount and a sourced phase-out range, with the phase-out applied at the declared
  modified adjusted gross income.
- **FR-023-019** — every disallowed amount is published with the limit that
  disallowed it; no disallowed amount is zeroed, merged or omitted.
- **FR-023-020** — an opening suspended-loss carryforward is a declaration; the
  closing figure is published for the declared year only and no future year is
  computed, displayed or implied.
- **FR-023-021** — the rental leg appears in the headline, the comparison, the
  marginal curve and the export.

### Short-term and vacation rental — Scope 04

- **FR-023-022** — `UseClassification/v1` publishes the category, both declared day
  counts, the sourced test parameters and the comparison performed.
- **FR-023-023** — the personal-use test parameters are sourced figures; a
  classification attempted without a retrieved parameter refuses.
- **FR-023-024** — the comparisons are exact at the sourced day figure, at the
  sourced percentage of rental days, and at the fewer-than-15-days boundary, and
  each inclusivity follows the publication rather than a convention.
- **FR-023-025** — a property meeting the fewer-than-15-days exception excludes the
  rental income and deducts no rental expense, and states the exclusion as the
  reason.
- **FR-023-026** — expense allocation between personal and rental use is computed
  from the declared day counts, and the allocation basis is published with each
  allocated figure.
- **FR-023-027** — the personal portion of an allocated expense is routed to the
  itemized composition rather than discarded.
- **FR-023-028** — the classification and the category's leg appear in the headline,
  the comparison, the marginal curve and the export.

### Disposition — Scope 05

- **FR-023-029** — the gain is computed from declared proceeds, declared adjusted
  basis and declared accumulated depreciation, and split into components.
- **FR-023-030** — the unrecaptured Section 1250 component is priced at its own
  sourced maximum rate and is a separate leg from the remaining long-term component.
- **FR-023-031** — the remaining long-term component stacks under Feature 022's
  preferential model without a parallel implementation of that stacking.
- **FR-023-032** — depreciation recapture moves out of the unsupported preferential
  categories; the remaining above-rate categories keep their refusal unchanged.
- **FR-023-033** — the primary-residence exclusion evaluates the ownership test and
  the use test separately against sourced period figures and names the failing one.
- **FR-023-034** — the exclusion amount is sourced per filing status and is applied
  to the remaining gain and never to the recapture component.
- **FR-023-035** — both disposition legs appear in the headline, the comparison, the
  marginal curve and the export.

### Non-functional

- **NFR-023-001** — every figure is sourced or declared, and never presented as the
  other.
- **NFR-023-002** — runtime transport is a bounded set of same-origin reads of the
  configuration-declared policy and pack documents, regime pack loading included,
  and no read reaches another origin. No read carries a household value; that
  guarantee is `NFR-023-003` and this requirement does not qualify it.
  **Adversarial cases.** A read of a regime pack the configuration does not
  declare, or of any remote document, fails; an assessed value, a rental-day
  count or a basis appearing in any request, URL, referrer or console message
  fails. The declared regime reads must still be present and resolvable, so a
  route that reads nothing does not satisfy this.
- **NFR-023-003** — no household value, including assessed value, rental days and
  basis, reaches any URL, query string, hash, request, referrer, console message or
  committed artifact.
- **NFR-023-004** — the refusal vocabulary is unchanged; the member count is
  asserted equal to its pre-feature value.
- **NFR-023-005** — no module holds a state name, a county name, a rate, a cap, a
  recovery period, a day figure or an authority name; a scan asserts it and is
  demonstrated to fail on a module that does.
- **NFR-023-006** — every computed leg is surfaced in the headline, the comparison,
  the marginal curve and the export; an assertion fails if a leg exists in the
  record and not in all four.
- **NFR-023-007** — no probability, market simulation, lifetime projection,
  break-even year, ranking or recommendation appears anywhere.
- **NFR-023-008** — no published error rate, self-invalidation statistic, track
  record or accuracy figure appears anywhere.
- **NFR-023-009** — Feature 008 files remain byte-identical.
- **NFR-023-010** — no registration; no new root HTML, and `site-exclusions.json` is
  unchanged unless a new root HTML is created, in which case its entry lands in the
  same scope.

---

## Blocking Implementation Inputs

Every input below must be closed by a retrieval performed at implementation time.
None may be closed by derivation, recall or a secondary source. An input that
cannot be retrieved ships as an `AbsentFigure/v1` and its dependent leg refuses.

| ID | Input | Scope | Consequence if the retrieval fails |
| --- | --- | --- | --- |
| BI-1 | Homestead exemption amounts and tiers, and the Save Our Homes assessment-increase cap and its basis | 01 | The Florida regime ships the unretrieved member absent; a Florida property-tax settlement refuses `RLTAX-THRESHOLD-UNAVAILABLE` and the relief path is proven by a fixture regime instead |
| BI-2 | Acquisition-value basis, the annual assessed-value inflation cap, and the ad valorem rate ceiling | 01 | The California regime ships the unretrieved member absent and its settlement refuses; the acquisition-value cap basis is proven by a fixture regime |
| BI-3 | The state and local tax deduction cap amount and its filing-status variation | 02 | The composition ships the cap absent, the itemized total refuses, and the standard deduction is used with the refusal stated rather than silently chosen |
| BI-4 | The mortgage interest acquisition-debt limit and its grandfathered tier | 02 | The mortgage interest component refuses; no full-amount deduction is taken in its place |
| BI-5 | The residential rental recovery period and the applicable convention | 03 | Depreciation refuses; the rental leg refuses rather than settling without cost recovery |
| BI-6 | The passive-activity special allowance amount and its phase-out range | 03 | The special allowance refuses; the passive limit is applied without it only if the publication establishes that path, and otherwise the leg refuses |
| BI-7 | The at-risk limitation rule statement and its ordering relative to the passive limit | 03 | The ordering is not assumed; the rental leg refuses |
| BI-8 | The personal-use day figure, the personal-use percentage figure, and the fewer-than-15-days rental threshold | 04 | The classification refuses; no category is assigned and no rental figure is produced |
| BI-9 | The primary-residence exclusion amounts per filing status and the ownership and use period figures | 05 | The exclusion refuses; no gain is excluded and the refusal is stated |
| BI-10 | The unrecaptured Section 1250 gain maximum rate | 05 | The recapture component refuses; the disposition does not fall back to pricing the whole gain under the preferential model |

## Assumptions

- Feature 022 lands before this feature's implementation begins. Where a ledger
  target is an assertion Feature 022 delivers, the implementer re-resolves it
  against the tree at implementation time under ASC-8.
- One property per household in this slice. A second property is a later feature
  and is recorded as unsupported rather than approximated.
- One declared tax year, consistent with Feature 021 and Feature 022.

## Open Questions

- Whether the mortgage interest limit's grandfathered tier is reachable from a
  declared acquisition date alone, or requires a declaration the workspace does not
  yet carry. Routed to the implementer; if the latter, the tier refuses rather than
  assuming the current tier.
- Whether the personal-use percentage comparison is against days rented at fair
  rental value or days rented at all. Routed to BI-8; the retrieved publication
  decides, and the classification record publishes which was compared.

## Acceptance Criteria

- Every scenario `SCN-023-001` … `SCN-023-015` has a passing named test and a
  passing persistent browser row.
- Every figure is traceable to a retrieved authority or is labelled a declaration.
- Every unretrieved input ships absent and its leg refuses.
- Every computed leg is surfaced in all four places, proven by an assertion that
  fails when it is not.
- The refusal vocabulary member count is unchanged.
- `node scripts/selftest.mjs` is green with no fall in the pre-existing pass count.
- Every superseded assertion has a `SUP-023-NN` marker and a ledger entry.

## Traceability

| Scenario | Business scenario | Requirements | Scope |
| --- | --- | --- | --- |
| SCN-023-001 | BS-023-001 | FR-023-001, FR-023-002, FR-023-003 | 01 |
| SCN-023-002 | BS-023-002 | FR-023-004, FR-023-005, FR-023-007 | 01 |
| SCN-023-003 | BS-023-003 | FR-023-005, FR-023-006 | 01 |
| SCN-023-004 | BS-023-004 | FR-023-008, FR-023-009, FR-023-010, FR-023-013 | 02 |
| SCN-023-005 | BS-023-005 | FR-023-011 | 02 |
| SCN-023-006 | BS-023-006 | FR-023-012, FR-023-014 | 02 |
| SCN-023-007 | BS-023-007 | FR-023-015, FR-023-016, FR-023-021 | 03 |
| SCN-023-008 | BS-023-008 | FR-023-017, FR-023-018, FR-023-019 | 03 |
| SCN-023-009 | BS-023-009 | FR-023-020 | 03 |
| SCN-023-010 | BS-023-010 | FR-023-022, FR-023-023 | 04 |
| SCN-023-011 | BS-023-011 | FR-023-024 | 04 |
| SCN-023-012 | BS-023-012 | FR-023-025, FR-023-026, FR-023-027, FR-023-028 | 04 |
| SCN-023-013 | BS-023-013 | FR-023-026, FR-023-027 | 04 |
| SCN-023-014 | BS-023-014 | FR-023-029, FR-023-030, FR-023-031, FR-023-035 | 05 |
| SCN-023-015 | BS-023-015 | FR-023-032, FR-023-033, FR-023-034 | 05 |

Note: SCN-023-012 and SCN-023-013 both trace FR-023-026 and FR-023-027 because the
exception path and the allocation path are two different users of the same
allocation rule, and each must be asserted independently.
