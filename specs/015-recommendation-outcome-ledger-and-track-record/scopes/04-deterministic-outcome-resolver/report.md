# Scope 04 Report: Deterministic outcome resolver

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** In progress. Five increments have executed — the calendar, value, write, predicate and
reducer-bridge slices, all recorded under `## Test Evidence`. The sections before it record **plan corrections and
eight rulings** (R-04-01 through R-04-07, and R-04-10), not execution evidence. **R-04-02 through R-04-06 are a
PLAN pass:** they correct item text and add one missing obligation, and they tick and untick nothing. **R-04-10
corrects a false claim in three artifacts and ticks the one item that claim was blocking.** No scope completion is
claimed and no certification is requested.

## Summary

Not started. This scope's plan was audited against the shipped tree and found to rest on premises that were already
false when it was written — principally that scope 04 must **build** a resolution layer that scope 03 had already
shipped and exported. The plan has been corrected in place. One **blocking** contract gap that no prior artifact
records was found, and is ruled on below.

---

## Ruling R-04-01 — the price basis is a missing **mint-contract** term, routed to scope 01

**The gap.** The claim contract records **no raw-vs-adjusted close basis**. `HASHED_TERMS` (`rlclaims.js:66`) is
`contractVersion, recommendationKey, subject, actionFamily, direction, thesisFamily, predicate, horizon, magnitude`
— nine terms, none naming a price basis. `SIGN_CONVENTIONS` (`rlclaims.js:65`) is `["direction-adjusted"]`, which
fixes the **sign** convention and says nothing about which price series the return is computed from. Neither this
scope's plan nor `design.md` → `## D4` mentions a basis at all.

**Why it blocks rather than annoys.** Committed bar rows carry **both** closes — the verified row shape is
`{ t, o, h, l, c, v, ac }`, not the `{ t, o, h, l, c, v }` this plan previously asserted. Roughly 74% of committed
series have `ac !== c`, with divergence reaching 57%. So `ret(x)` is not one function; it is two, and the plan never
said which. Worse, BUG-012 established that the refresh cron **retroactively rewrites `ac`**. An `adjusted` basis is
therefore not merely ambiguous, it is **non-reproducible**: the same claim, the same code and the same resolution
date can yield a different `outcomeValue` next week because the substrate moved underneath it.

**Ruling.** Route to **scope 01** as a mint-contract defect requesting a **frozen hashed `priceBasis` term**, and
block this scope's return computation on it. This is deliberately the shape and the route `flatBand` already took,
and it is the composition of the three options rather than a choice among them:

- **(i) Freeze `priceBasis` on the claim at proposal — ADOPTED as the content.** Only a **hashed** term is untunable
  once the outcome is visible. A basis chosen at scoring time sits outside `claimHash`, so one content address could
  yield two different `outcomeClass` values on two runs and the record would stop being reproducible from its own
  identity. That is the identical failure `flatBandFor` (`rlclaims.js:767`) already refuses to make, in its own
  words: *"a band chosen at scoring time would sit OUTSIDE `claimHash`."*
- **(ii) Fix the resolver to one basis by contract — REJECTED.** It puts the decision outside the hash, so changing
  that constant later silently re-scores every historical claim. It also cannot express the BUG-012 problem: pinning
  `adjusted` is still non-reproducible because the values themselves mutate, and pinning `raw` is reproducible but
  wrong across splits and dividends.
- **(iii) Route it to scope 01 as a mint-contract defect — ADOPTED as the mechanism.** Scope 04 **cannot** add the
  term itself: `HASHED_TERMS` is scope 01-owned, and this scope's own DoD forbids altering `claimHash`'s term list.
  Routing is the only path that does not make scope 04 the second author of the claim contract.

**One obligation this scope keeps regardless of the routing.** A frozen basis makes the *choice* reproducible but
does not make a retroactive `ac` rewrite **detectable**. Scope 04 therefore records, in the hashed `provenance`
block, a fingerprint of the exact basis values it read at `entryDate` and `resolutionDate`. A later rewrite then
changes the resolution hash and surfaces as `RTR-RESOLUTION-CONFLICT` (`rlclaims.js:269`, already shipped) instead of
silently re-scoring. This consumes an existing shipped refusal; it invents nothing.

**Proposed refusal code `RTR-PRICE-BASIS` is routed, NOT owned.** Naming a new code is a design act. It is recorded
here as a proposal for `design.md` → `## D4`, in the same posture P-015-07 was held in, and this scope's header does
**not** claim it.

**What changes.** DoD gains four items (the routed block, frozen-basis consumption, the provenance fingerprint, and
the corrected row shape); Test Plan gains **T-04-U8**; **T-04-U1** and **T-04-U7** are amended to assert the basis is
read from the claim rather than chosen by the evaluator. Until scope 01 lands the term, every `ret(x)`-dependent DoD
item is **blocked**, and no item may be ticked on a basis this scope selected for itself.

**Superseded in one particular by Ruling R-04-03.** The "One obligation" paragraph above states that a retroactive
`ac` rewrite "surfaces as `RTR-RESOLUTION-CONFLICT`". The fingerprint obligation itself stands and was implemented;
the named mechanism was wrong. R-04-03 records the correction. This paragraph is left standing rather than rewritten
so the ruling remains a record of what was decided at the time.

---

## Ruling R-04-02 — the bar row shape is THREE measured forms with an OPTIONAL `ac`, not a closed seven

**The premise that was wrong.** A DoD item, plan step 6 and plan step 16 all asserted a **closed seven**-field row
shape `{ t, o, h, l, c, v, ac }`. That is not what the shipped reader measures or validates. `readBars`
(`scripts/brief-resolve-outcomes.mjs:259`) requires `BAR_CORE_FIELDS` (`:241` — `o, h, l, c, v`, finite) plus `t`
(integer, strictly ascending), validates `ac` as **OPTIONAL** — `if ('ac' in row && !Number.isFinite(row.ac)) throw`
(`:279`) — and accepts unknown keys. Its own header (`:248`–`:256`) records the measurement over all 292 committed
series: `{t,o,h,l,c,v,ac}` on 147,337 rows, `{t,o,h,l,c,v}` on 2,675, and a 12-key `source*` provenance variant on
26. The constant's comment states the point outright: *"`ac` is deliberately absent from this list."*

**Ruling — the ITEM is wrong, the CODE is right; correct the item and preserve its intent.** Requiring `ac` would
throw on the 54 real series that carry none (`EA` for all 328 of its rows); requiring a closed key list would throw
on the 26-row provenance variant. Either would mean a claim closes `not-evaluable` because *our own substrate* is
shaped differently than the plan guessed — which the reader explicitly refuses to do, reserving refusals for facts
about the CLAIM. **The item's intent survives intact and is what makes the correction safe:** the obligation was
never "the shape is seven fields", it was "the shape is *validated*, not assumed". That obligation is strictly
harder to satisfy under the corrected wording, because the reader must now be right about which fields are shared,
which is optional, and which are tolerated. The item stays **unticked**: it is now a decidable claim about a
three-form validator, and no pass has been run against it as stated.

**Consequence of the alternative.** Had the code been "corrected" to the item instead, `readBars` would throw on 54
committed series and the resolver would be unable to read a fifth of its own substrate — a plan sentence would have
broken working code.

**Old → new, so the change is auditable rather than silent.**

| Surface | Old | New |
|---|---|---|
| DoD core item | *"Bar rows are read as the verified **seven**-field shape `{ t, o, h, l, c, v, ac }`; no code or fixture assumes the six-field shape an earlier revision of this plan asserted."* | *"**The bar row shape is VALIDATED, not assumed, and it is not closed at seven fields.** `readBars` requires the **six** fields all three measured row forms share … validates `ac` as **OPTIONAL** … and accepts unknown keys …"* |
| Plan step 6 | *"Committed daily bars carry rows shaped `{ t, o, h, l, c, v, ac }` — **seven** fields, including the adjusted close."* | The three measured forms, with the required set, the optional `ac`, and the throw-not-refuse rule stated. |
| Plan step 16 | *"Bar fixtures carry the full **seven**-field row shape `{ t, o, h, l, c, v, ac }`."* | Fixtures **exercise the variation**: at least one with `ac`, at least one without. |

**A second contradiction the correction resolves.** Step 16's old sentence was already false against the shipped
tree: the `RAWONLY` fixture carries **no** `ac` key at all, and that is precisely what makes the `RTR-PRICE-BASIS`
refusal provable. A fixture rule that its own fixtures violate cannot govern anything.

---

## Ruling R-04-03 — a retroactive `ac` rewrite is detected by a MOVED ADDRESS; the code is right and the item is wrong

**The disagreement.** A DoD item and the T-04-U8 Test Plan row both asserted that a retroactive adjusted-close
rewrite (BUG-012) "surfaces as `RTR-RESOLUTION-CONFLICT`". `T-04-I4`
(`tests/recommendation-track-record.integration.mjs:317`) measures the opposite and says so in its own comment
(`:364`–`:369`): the rewritten reading is **accepted** — `moved.ok === true` (`:376`), at a **second** content
address (`:377`), `written: true` (`:378`), two objects on disk (`:379`), and the first record byte-identical
afterwards (`:380`). These are two different contracts and only one can be the plan.

**Ruling — the CODE is right and the ITEM is wrong.** Content addressing means a changed fingerprint **is a
different object**. The `basisFingerprint` sits inside the hashed `provenance`, so a rewritten `ac` changes the
resolution hash, which changes the path. There is no collision to refuse: the second record is not a contradictory
version of the first, it is a *second reading*, and both are true statements about what the substrate said when each
was taken. `RTR-RESOLUTION-CONFLICT` fires on the genuinely different case the shipped `writeResolutionObject`
exists for — an **unhashed** field (an `eventId`) changing at an **already-taken** address, where two different byte
sequences claim one identity. That case is asserted in the same test at `:358`.

**Why this is not a weakening.** The obligation R-04-01 imposed was *detectability*, not refusal, and a second
address is detectable — demonstrably so, since `T-04-I4`'s anti-vacuity control doubles `ac` such that the **return
is bit-identical** and every other hashed term is unchanged (`:374`–`:375`). Without the fingerprint that rewrite
would have been the byte-identical no-op in the same test, and BUG-012 would have been invisible. With it, the
divergence is on disk.

**Consequence of the alternative, stated for a reader of the ledger.** Refusing would mean the resolver **cannot
record** an outcome after the cron touches the series — a rewrite upstream would lock the ledger rather than
document itself. Worse, refusal destroys the comparison: the auditor would have one reading and an error, instead of
two readings whose difference *is* the evidence that the substrate moved. A reader of the ledger under the corrected
contract sees two resolution objects for one `claimHash`, agreeing on `outcomeValue`, `outcomeClass`,
`closureEventType` and `claimHash`, differing only in `provenance.basisFingerprint` (`:384`–`:390`) — which reads
unambiguously as "the same claim, scored twice, on a substrate that changed underneath".

**Old → new.**

| Surface | Old | New |
|---|---|---|
| DoD core item | *"… so a later rewrite (BUG-012) changes the resolution hash and surfaces as `RTR-RESOLUTION-CONFLICT` instead of re-scoring quietly."* | *"… by a MOVED content address, not by a refusal … the rewritten reading is written at a **second** address: both records survive, the first is byte-unchanged, and the divergence is the evidence. `RTR-RESOLUTION-CONFLICT` is the **different** case … and must not be asserted here."* |
| T-04-U8 row | *"… a retroactive `ac` rewrite (BUG-012) surfaces as `RTR-RESOLUTION-CONFLICT` rather than as a silent re-score."* | *"… **moves the content address** — the rewritten reading is written at a second address, both records survive, and the first is byte-unchanged."* |

The item stays **unticked**. Correcting a wrong premise does not evidence the corrected one.

---

## Ruling R-04-04 — every "BLOCKED on R-04-01" clause is stale; R-04-01 is DISCHARGED

**The staleness.** `## Ruling R-04-01` above is recorded **discharged**, and the discharge is real, not declared:
scope 01 landed `PRICE_BASES` (`rlclaims.js:76`), `PRICE_BASIS_ROW_FIELD` (`:79`) and `priceBasisFor` (`:802`), and
this scope consumes them at `scripts/brief-resolve-outcomes.mjs:347` and `:418`. Plan step 8 nevertheless still read
*"`basisAt` is BLOCKED on Ruling R-04-01 … until then no `ret(x)`-dependent DoD item may be ticked"*.

**Ruling — correct it, and correct the full extent rather than the one clause.** The same false premise had spread
to **seven** places, and fixing one while leaving six would leave the file internally contradictory — the scope
header would still announce the finding as BLOCKING while a ticked DoD item below it announced the discharge. A
staleness fix that produces a self-contradicting document has not fixed anything.

| Surface | Old | New |
|---|---|---|
| Header, third-finding paragraph | *"A third finding, R-04-01, is **BLOCKING** and is new … Every `ret(x)`-dependent item below is blocked until that term lands"* | *"was BLOCKING and is now **DISCHARGED** … scope 01 landed that term … No `ret(x)`-dependent item is blocked any longer"* |
| Plan step 8 | *"**`basisAt` is BLOCKED on Ruling R-04-01** … until then no `ret(x)`-dependent DoD item may be ticked"* | *"**`basisAt` reads the claim's frozen `priceBasis` term — Ruling R-04-01 is DISCHARGED** … through the shipped `priceBasisFor` … a claim carrying no such term **refuses**"* |
| Plan step 10 | *"**This step is blocked on Ruling R-04-01** … `ret(subject)` has no defined price basis yet"* | *"**This step is unblocked for the same reason step 8 is**"* |
| Plan step 16 | *"— once R-04-01 lands —"* | *"— R-04-01 having landed —"* |
| T-04-U1 row | *"Blocked on Ruling R-04-01."* | *"Unblocked: Ruling R-04-01 is discharged."* |
| T-04-U7 row | *"Blocked on Ruling R-04-01 for the `ret(subject)` half."* | *"Unblocked: … the `ret(subject)` half reads the claim's frozen basis."* |
| T-04-U8 row | *"**Blocked** until scope 01 lands the term."* | *"Unblocked: scope 01 has landed the term."* |
| DoD `outcomeValue` item (already `[x]`) | *"Blocked on Ruling R-04-01 for the `ret(subject)` half."* | *"Unblocked: Ruling R-04-01 is discharged …"* — the item was **ticked while calling itself blocked**, which is self-contradictory on its face. |

**Consequence of the alternative.** Leaving the clauses would make the remaining 39 items look gated on a scope-01
dependency that shipped, so the next pass would either stall waiting for it or tick items while the plan told it not
to — and the second is how a ticked-but-blocked item like the `outcomeValue` one gets created in the first place.
**No checkbox state is changed by this ruling.** Text was corrected; nothing was ticked or unticked.

---

## Ruling R-04-05 — `RTR-PRICE-BASIS` is resolver-OWNED, and the adjusted-close path refusal gains the DoD item it never had

**The stale ownership.** The scope header listed `RTR-PRICE-BASIS` under *"Refusal codes routed, not owned"* as
*"the **proposed** `RTR-PRICE-BASIS`"*, and *"Refusal codes owned"* named only `RTR-LOOKAHEAD`,
`RTR-CALENDAR-COVERAGE` and `RTR-NETWORK`. That was true when R-04-01 proposed the code. It is no longer true: the
code is declared **in this scope's own source** — `export const PRICE_BASIS_CODE = 'RTR-PRICE-BASIS'`
(`scripts/brief-resolve-outcomes.mjs:227`) — and raised from **three** sites, not one: `:365` (the claim's frozen
basis field is absent from an endpoint observation), `:824` (`path-extreme-absent-from-observation`) and `:1034`
(`path-extremes-absent-for-basis`).

*The brief that requested this ruling cited "declared at `:227`, raised at `:1035`". `:227` is exact; `:1035` is the
`reason:` line of the raise whose `code:` is `:1034`, and it is one of three raise sites rather than the only one.*

**Ruling — ownership moves to OWNED.** A refusal code raised by a scope's own source is owned by that scope. The
alternative — leaving a shipped, thrice-raised code listed as merely proposed — means the code has no owner to
answer for its wording, its reason strings, or its stability, which is the mirror image of the W3 defect this plan
already corrected in the other direction (two owners of one code). One owner, named, is the invariant.

**The obligation nobody wrote down.** `PRICE_BASIS_ROW_FIELD` binds `adjusted-close` to `ac`, and **no committed row
carries an adjusted extreme** — `h` and `l` are quoted against the raw close only. So a path comparator on
`adjusted-close` is **structurally unresolvable**: serving it would divide a raw high by an adjusted entry close,
manufacturing a return from two different series — exactly the untraceable substitution R-04-01 exists to prevent.
The code already refuses (`basisCarriesPathExtremes` at `:811`, raising at `:1034`), and the support test is
**derived** — membership of the bound row field in `BAR_CORE_FIELDS` — rather than a second hand-written list of
basis names that could drift. **No DoD item recorded any of this.**

**Ruling — add the item, leave it unticked.** Adding a genuinely missing obligation is a planning act; a shipped
refusal with no DoD item is an untracked behaviour that a later refactor can delete without failing anything. It is
added **unticked** because this is a plan pass: the behaviour exists in source and is exercised by `T-04-U2`, but no
DoD item has been evidenced against the item **as now worded**, and ticking on a prior pass's evidence is the
fabrication this file's own standard forbids.

**Consequence of the alternative — stated for a reader, because it is user-visible.** A claim minted with
`priceBasis: adjusted-close` and a `crosses-above` / `crosses-below` comparator can **never** resolve. It refuses
rather than closing, which is correct — an unresolvable combination is a defect in the *minted claim*, and a claim
that cannot be scored must not be scored on a substituted series. But it means such a claim would sit `active`
indefinitely with no closure and no `not-evaluable`. That is a real gap, it belongs to scope 01's mint validation
rather than to this scope's resolver, and it is **recorded here rather than fixed here**: this ruling adds the
resolver-side DoD coverage and does not amend the mint contract.

**Old → new.**

| Surface | Old | New |
|---|---|---|
| Header, owned | *"`RTR-LOOKAHEAD`, `RTR-CALENDAR-COVERAGE`, `RTR-NETWORK`"* | *"… `RTR-NETWORK`, **`RTR-PRICE-BASIS`**"* |
| Header, routed | *"… and the **proposed** `RTR-PRICE-BASIS` (see Ruling R-04-01)"* | The proposal is recorded as superseded; the code is named resolver-**owned** with its declaration and three raise sites cited. |
| Plan step 8 | *(no mention of the adjusted-close path case)* | A paragraph stating the structural unresolvability, the derived support test, and that it **refuses rather than closes**. |
| DoD core items | *(no item)* | **New, unticked:** `RTR-PRICE-BASIS` is resolver-owned and a path comparator on `adjusted-close` refuses `path-extremes-absent-for-basis`. |
| T-04-U8 row | *"refuses (proposed `RTR-PRICE-BASIS`)"* | *"refuses (`RTR-PRICE-BASIS`, resolver-**owned** per Ruling R-04-05)"* |

**DoD total: 55 → 56.** One item added; **no** item ticked or unticked. Satisfied stays **16**; unsatisfied moves
**39 → 40**. The Completion Statement below is updated to match.

---

## Ruling R-04-06 — step 3's due-set predicate was UNIMPLEMENTABLE; the binding is passed IN, not written onto the entry

**The defect.** Plan step 3 defined the due set as
`entry.state === "active" ∧ entry has a claimRef ∧ claim(entry).horizon.resolutionDate ≤ asOfDate`. Only the first
conjunct is a property of the reduction. The other two read facts a `recommendation-index/v1` entry **does not
carry**, and cannot be made to carry from this scope:

- **`claimRef` is not on the entry, and never becomes so.** `reduceRecommendationEvents` writes a new entry as a
  closed **nine-field object literal** (`rlcontracts.js:1232`) and carries an existing one forward field by named
  field (`:1159`). An injected pointer therefore does not survive one reduction. The module-wide count is the
  evidence: `grep -c claimRef rlcontracts.js` → **0**. `claimRef` is a ledger-**ROW** field — `CLAIM_REF_FIELD`
  (`rlclaims.js:199`) — consumed by `authorizeResolutionWrite(row, resolution)`, which refuses a claimless row
  `RTR-LEGACY-BACKFILL` (`rlclaims.js:196`) before inspecting any resolution.
- **`claim(entry)` is not a function that exists.** The entry carries no claim address, so there is nothing to
  dereference a frozen `horizon.resolutionDate` through.

Applied literally, both conjuncts are false for every entry, so the due set collapses to **EMPTY** for every
reducer-produced index — the resolver would close nothing, silently, forever.

**Ruling — pass the binding IN through a required `gate` argument.** `claimEntryBindings(pairs, toolsRegistry)`
joins claim, ledger row and reducer key into a frozen per-key binding, and `dueEntryKeys(index, gate)` reads
`gate.bindings` alongside `gate.asOfDate`. The key is derived by the shipped producer through
`originRecommendationKeyFor`, so a binding cannot name an entry the reducer would not itself have created.

**Consequence of the alternative — promoting `claimRef` onto the reducer entry.** It would require editing
`rlcontracts.js`, which this scope's own DoD lists under *files and surfaces this scope must not touch*: the module
is Feature 002-owned, and a resolver that rewrites its producer's output shape is the second author of that shape.
It would also **duplicate a field the ledger row already carries by contract** — two homes for one fact, which is
exactly the drift this feature exists to eliminate, and the mirror of the two-owners-of-one-refusal-code defect the
header already corrected.

**Why the three exclusion reasons stay distinct.** `HORIZON_NOT_REACHED_REASON` is cured by the **passage of time
alone** (`remedy: later-as-of-date`); `NOT_DUE_REASON` is cured only by a reducer re-proposal, which re-activates the
entry (`rlcontracts.js:1245`, `remedy: ledger-event`); `ENTRY_UNBOUND_REASON` is cured by **nothing** — a claimless
row is unscoreable by construction (`remedy: never`). Collapsing them would tell an operator to wait for a date that
will never make a difference. `NOT_DUE_REMEDY` already carried all three; the third conjunct's landing added no
reason and therefore **needed no new remedy entry**.

**The comparison, and the date that must not fall through.** Both sides are asserted against `ISO_DATE` and compared
as whole `YYYY-MM-DD` strings, whose lexicographic order **is** their chronological order — no `Date`, no parse, no
timezone, and no prefix matching that would rank `2026-07-1` between `2026-07-09` and `2026-07-10`. `asOfDate` is
asserted at the top of `dueEntryKeys`; the bound `resolutionDate` is asserted at `claimEntryBindings`, and **again**
inside the loop, because `gate.bindings` is a caller-supplied `Map` that need not have come from that builder. The
second assertion **refuses** (`binding-resolution-date-not-iso` on `gate.bindings`) rather than excluding: an
uncomparable date is a contract violation, not a fact about the ledger, and every `notDue` reason promises a remedy
that this one has none of. Admitting it would be worse still — an unparseable date falling through to "due" closes a
claim whose horizon may not have arrived.

**Old → new.**

| Surface | Old | New |
|---|---|---|
| Plan step 3, predicate | *"`entry has a claimRef ∧ claim(entry).horizon.resolutionDate ≤ asOfDate`"* | *"`binding(key).claimRef !== null ∧ binding(key).resolutionDate ≤ asOfDate`"*, with the unimplementability of the old form recorded in place. |
| Plan step 3, citation | `CLAIM_REF_FIELD` (`rlclaims.js:187`) | `CLAIM_REF_FIELD` (`rlclaims.js:199`) — verified |
| Header, consumed codes | `RTR-LEGACY-BACKFILL` (`rlclaims.js:184`) | `RTR-LEGACY-BACKFILL` (`rlclaims.js:196`) — verified |
| T-04-I5 row | `RTR-LEGACY-BACKFILL` (`rlclaims.js:184`) | `RTR-LEGACY-BACKFILL` (`rlclaims.js:196`) — verified |

*Both line numbers were re-derived against the shipped tree rather than copied: `var CLAIM_REF_FIELD = "claimRef";`
is `rlclaims.js:199` and `var LEGACY_BACKFILL_CODE = "RTR-LEGACY-BACKFILL";` is `rlclaims.js:196`.*

**DoD total: 56 → 56.** No item added, ticked or unticked. This ruling corrects plan text and three citations and
records the implementation route; it claims no evidence.

---

## Ruling R-04-07 — "`rlvalidation.js` is not imported here" is FALSE against the shipped tests

The DoD item reading *"No statistic is computed in this scope; `rlvalidation.js` is not imported here, and the
`rlvalidation.js:136` citation in the plan is motivation only"* cannot be ticked, because its middle conjunct is
contradicted by the executed code:

```
$ grep -nE 'rlvalidation' scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.unit.mjs tests/recommendation-track-record.functional.mjs tests/recommendation-track-record.integration.mjs tests/recommendation-track-record.e2e.mjs
tests/recommendation-track-record.unit.mjs:1413:    return validationRequire('../rlvalidation.js').rlvSummarizeOutcomes(values);
tests/recommendation-track-record.functional.mjs:453:    return validationRequire('../rlvalidation.js').rlvSummarizeOutcomes;
tests/recommendation-track-record.e2e.mjs:756:    const summary = validationRequire('../rlvalidation.js').rlvSummarizeOutcomes(routed.directional);
exit code: 0
```

Three of the four executed 015-authored test files load `rlvalidation.js` and call `rlvSummarizeOutcomes`. The
`.unit.mjs:1411` comment states the intent plainly — *"The 007-owned primitive, consumed UNMODIFIED and loaded
lazily so importing opens nothing."* — and `T-03-F3` exists precisely to assert a reachable `resolvedDirectional
=== 0` case, which is a statement *about* the primitive that requires reaching it.

The resolver **production** module is clean: the grep returns no `scripts/brief-resolve-outcomes.mjs` line. So the
item's intent (the resolver does not compute the track-record statistic; feeding the primitive is scope 05) holds,
while the item's **wording** ("is not imported here") does not, because "here" was written as though the scope were
the module and the scope is in fact the module plus its tests.

This is the same defect class as R-04-02 and R-04-03: a plan sentence asserting an absolute that the shipped code
demonstrably violates. As there, the code is right and the item is wrong. The item is left **unticked** and
annotated in place rather than rewritten, because rewriting a DoD item to match what was built is the failure mode
these rulings exist to prevent. Rewording is scope 05's to route, together with the statistic it will feed.

**DoD total: 56 → 56.** No item added or removed. This ruling records a defect and claims no evidence.

---

## Ruling R-04-10 — "the fingerprint changes" across a double closure is FALSE; the gate is the sole enforcement point

**The claim as written.** Three artifacts stated that when a double closure is forced past the due-set gate the
`indexFingerprint` **changes**: the `T-04-I3` DoD item in `scope.md` (*"the reducer is proven to accept a double
closure when the gate is bypassed and the fingerprint changes"*), the `T-04-I3` Test Plan row at `scope.md:412`
(*"asserts the reducer accepts it and the `indexFingerprint` changes"*), and finding `F-015-D4-02` in
`scopes/_index.md` (*"and that the fingerprint changes"*).

**The measurement that refutes it.** The fingerprint is byte-identical across the appended duplicate:

```
$ node --test tests/recommendation-track-record.integration.mjs
# tests 7
# pass 7
# fail 0
# skipped 0
```

`tests/recommendation-track-record.integration.mjs:837-841` compares `twice.index.indexFingerprint` to
`once.index.indexFingerprint` **after** `:816` has measured a second appended event, and requires them equal.
The reading is live, not inert: `:844-848` requires the FIRST closure to have moved the fingerprint.

**The source line.** `rlcontracts.js:1318`:

```
    index.indexFingerprint = fingerprint("recommendation-index", {
      contractVersion: "recommendation-index/v1",
      entries: newEntries
    });
```

It covers `{ contractVersion, entries }` — the index. It does **not** cover `events`. A repeat closure of the
same type sets `closureEntry.state = "closed"` and `closureEntry.lastEventType` to values they already hold
(`rlcontracts.js:1284-1285`), so `entries` is unchanged and the digest is byte-identical. The claim could only
have been made true by editing `rlcontracts.js`, which is feature 002-owned and read-only here. The claim was
wrong; the code and the test are right.

**The corrected statement.** With the gate bypassed the reducer **accepts** the double closure, a duplicate
event **is appended** under a new `eventId`, and `indexFingerprint` is **byte-identical** across that append.

**The consequence.** This is a stronger reading than the one the plan intended, not a weaker one. If the
fingerprint cannot see an appended duplicate, it is not sufficient on its own to prove idempotence, and no other
reader of the reduction detects the duplicate either. The due-set gate is therefore the **sole** enforcement
point for FR-006 — a single point of failure with nothing behind it. Two things follow. `indexFingerprint` is an
**index-state oracle, not an event-append oracle**, and any idempotence assertion resting on it alone would pass
with the gate deleted. And `T-04-I2` must not rest on it alone: it does not — its append oracle is `:767`
(`second.events.length === 0`), independent of the fingerprint comparison at `:768-772`.

All three carriers are corrected in place. `F-015-D4-02` is **not** deleted: the correction strengthens it, and
the row records that it was corrected.

**DoD total: 56 → 56.** No item added or removed. `T-04-I3` is corrected and ticked; `[x]` count 38 → 39.

---

## Plan corrections — premises that were WRONG, not merely stale

Recorded as old → new rather than silently rewritten. Fourteen premises were corrected; these are the substantive
ones, and the first three would have produced a wrong implementation rather than a wrong comment.

| # | Old premise | Verified reality | Why it matters |
|---|---|---|---|
| W1 | Steps 1–17 name `rlclaims.js` **zero** times and propose to build the resolution layer. | Scope 03 already **shipped and exported** `buildResolution` (`:1003`), `resolutionHash` (`:986`), `resolutionObjectPath` (`:988`), `serializeResolution` (`:994`), `writeResolutionObject` (`:1109`), `classifyOutcome` (`:795`), `enumerateCommittedSeries` (`:530`), `CLOSURE_REASON_CODES` (`:307`). | A second copy puts two resolution vocabularies over one ledger. That surfaces as ledger corruption, not as a test failure — the exact reason the plan already refuses to fork the reducer. |
| W2 | Step 2: *"the resolver reads membership from `data/bars/index.json`"*, with a `<SYMBOL>.json` sibling as the series. | `enumerateCommittedSeries` (`rlclaims.js:530`) does the **opposite** by design and says so: the directory listing is the **availability** set, `index.json` is a **curation** set, and *"using it would refuse a claim on a symbol whose bars are committed and readable, shrinking the denominator over a curation detail."* | Not a stale citation — an inverted rule. Following it would have closed `no-committed-series` on `EA`, `NDX` and `PHP=X`, three symbols with committed readable bars, and quietly shrunk the denominator. |
| W3 | Header claims `RTR-CLOSURE-VOCAB` and `RTR-RESOLUTION-CONFLICT` as **owned**; steps 12 and 14 say to implement them. | Both are already coded in the shipped module — `CLOSURE_VOCAB_CODE` (`rlclaims.js:267`), `RESOLUTION_CONFLICT_CODE` (`:269`) — and both already fire from `buildResolution` and `writeResolutionObject`. | Two owners of one refusal code is how a code ends up meaning two things. Ownership is dropped; the codes move to a **consumed** list. |
| W4 | Step 6: bar rows are shaped `{ t, o, h, l, c, v }`. | Verified `{ t, o, h, l, c, v, ac }`. | The omitted field **is** finding A. |
| W5 | Step 4 and DoD: P-015-07 **blocks** the session predicate. | `design.md` records it **RESOLVED**: the predicate is `regular !== null`, giving **251** sessions (249 regular + 2 early-close). | A resolved finding carried as blocking makes the scope look un-startable for a reason that no longer exists. |
| W6 | Step 15 / T-04-U6 / DoD: the `not-evaluable` reason set has **six** members (prose elsewhere says seven). | `NOT_EVALUABLE_REASONS` (`rlclaims.js:305`) is the derived union of 8 `MINT_REFUSALS` (`:89`) and 3 `RESOLVER_NOT_EVALUABLE_REASONS` (`:298`) — **11**. | A test asserting six reasons "fire for their own trigger and only their own" passes while five coded reasons go unexercised. |
| W7 | Step 17: **create** `tests/recommendation-track-record.e2e.mjs`. | It exists (57,666 bytes). | Corrected to *extend*. |
| W8 | Thirteen `rlcontracts.js` line citations. | All stale by +3..+6; every symbol exists and is exported. Corrected in place: `reduceRecommendationEvents` :1140, `deriveRecommendationKeys` :1040, `ACTION_DIRECTION` :720, `CLOSE_EVENT_TYPES` :726, `lifecycleEventId` :1109, closures guard :1271, sort :1272, `-type-invalid` :1279, `-key-absent` :1281, `-still-active` :1282, frozen-terms re-emit :1283, `state="closed"` :1284, `seenEvent` :1305–1308, `indexFingerprint` :1318, *"Authors never own identity"* :1037. The one correct citation, `rlvalidation.js:136` `value > 0`, is retained. | Stale citations are how a reviewer concludes a symbol was removed and re-invents it. |
| W9 | Six scope 02/03 surfaces and two design surfaces had **zero** references. | `authorizeResolutionWrite` (`:733`), `RTR-LEGACY-BACKFILL` (`:184`/`:721`), `RTR-FLAT-ZERO` (`:133`/`:817`), `outcomeContributionFor` (`:781`) / `OUTCOME_CLASSES` (`:111`) / `OUTCOME_CLOSURE_EVENTS` (`:284`), `directionalDenominator` (`:901`), plus `RTR-SESSION-PREDICATE` and `provenance.earlyCloseSessions` from `design.md` → `## D4`. | `authorizeResolutionWrite` is the gate that makes claimless legacy rows unscoreable **by construction**. A plan that never named it could have written resolutions straight past it. |

Two DoD items were **unverifiable as written** and were rewritten rather than deleted: the `rlcontracts.js`
byte-unmodified claim pinned no `sha256` anywhere (now decided by `git diff --quiet`), and T-04-S1's
`baseline + N` left both `baseline` and `N` unbound (now: `0 failed` plus a passed count no lower than a literal
baseline captured in this file before the first change).

## Test Evidence

Only the increment-1 calendar slice and the increment-2 value slice recorded below have been executed. No other
Test Plan row in [scope.md](scope.md) has been executed, and no selftest baseline has been captured.

### Increment 1 — the calendar-session slice (commit `cd1d0d595`)

The slice lands the calendar substrate ONLY: `readCalendar`, `loadCalendar`, `sessionsBy`, `advanceSessions`,
`sessionDateForEpoch`, `earlyCloseSessionsIn`, and the two refusals `RTR-SESSION-PREDICATE` (routed, not owned) and
`RTR-CALENDAR-COVERAGE` (owned). The predicate evaluators, the as-of fence, the data-quality gates, the outcome
magnitude and the reducer bridge are later increments, so `T-04-F1` and `T-04-F2` each carry an `(increment 1)`
marker and **neither claims its Test Plan row whole**.

**Command, run from `<repo-root>`:** `node --test tests/recommendation-track-record.functional.mjs` — **exit 0**,
`tests 11 / pass 11 / fail 0`, with `T-04-F1 (increment 1)` and `T-04-F2 (increment 1)` both `✔`. The raw output and
the per-item source anchors are recorded inline beside each ticked checkbox in [scope.md](scope.md).

**The P-015-07 ruling implemented is the design's:** a trading session is a row with a **non-null `regular` block**,
not `dateState === "regular"`. The committed calendar yields **251** sessions under the implemented predicate and
**249** under the rejected one; the two it drops — `2026-11-27` and `2026-12-24` — are genuine early-close sessions,
and `sessionsBy` **refuses** any other predicate key with `RTR-SESSION-PREDICATE` rather than leaving the rejected
rule merely unused.

**Two DoD items are ticked; three neighbouring calendar items are deliberately NOT.** Early-close flagging
(`earlyCloseSessionsIn`) and the coverage refusal (`RTR-CALENDAR-COVERAGE`) are both implemented and exercised, but
both items also require the fact to be **recorded on a resolution object** or to **close a claim `not-evaluable`** —
and no resolution is built and no claim is closed until a later increment. Ticking them on the refusal alone would
claim a closure path that does not exist yet.

### Increment 2 — the value slice (commit `30a9e2624`)

The slice lands the observation-and-value substrate ONLY: `readBars`, `loadBars`, `fenceObservations`,
`basisValueAt`, `periodReturn`, `basisFingerprint`, `subjectReturn`, `outcomeValueFor`, the refusals
`RTR-LOOKAHEAD` (owned) and `RTR-PRICE-BASIS` (routed, not owned), and the bars fixtures `DVG`, `DVG2` and
`RAWONLY`. The predicate evaluators, the data-quality gates, the two-axis record and the reducer bridge are later
increments, so `T-04-U5`, `T-04-U7` and `T-04-U8` each carry an `(increment 2)` marker and **none claims its Test
Plan row whole**.

**Command, run from `<repo-root>`:** `node --test tests/recommendation-track-record.unit.mjs` — **exit 0**,
`tests 28 / pass 28 / fail 0`, with `T-04-U5 (increment 2)`, `T-04-U7 (increment 2)` and `T-04-U8 (increment 2)`
all `✔`. The raw output and the per-item source anchors are recorded inline beside each ticked checkbox in
[scope.md](scope.md).

**Ruling R-04-01 is DISCHARGED, and the discharge is what makes the value computable.** Scope 01 has landed
`priceBasis` as a **hashed** term — `T-01-U8` asserts it is inside the content address and `T-01-U9` asserts an
absent or out-of-vocabulary basis refuses at the mint. This scope therefore consumes the shipped
`PRICE_BASIS_ROW_FIELD` binding through `priceBasisFor` and names neither `c` nor `ac` itself. The `RAWONLY`
fixture carries the **same** raw closes as `DVG` precisely so that a silent fallback would have produced a
plausible `+10`; instead it refuses `RTR-PRICE-BASIS` naming the exact absent row field, while the same series
under `raw-close` resolves. The R-04-01 DoD item's leading clause is corrected from `BLOCKED` to `DISCHARGED`,
since a ticked item that still calls itself blocked is self-contradictory.

**The value is exact, and the exactness is asserted rather than described.** `T-04-U7` pins
`-5.000000000000004` — not the decimal `-5` — so a `toFixed` cannot creep in without failing, and it pins
`outcomeValue = direction × ret(subject)` by scoring a **correct bearish** `trim` on a falling series **positive**.
It also proves `legReturns` distinguishes `primary-only` (1 leg) from `equal` (N legs), which the collapsed scalar
cannot, and that `basisFingerprint` moves on a one-ten-millionth rewrite of a read value while staying stable
across a second pass over unchanged bytes.

**Three DoD items are ticked; four neighbouring value items are deliberately NOT.**

| Left unticked | The conjunct that is not yet satisfied |
|---|---|
| Bar rows read as the **seven**-field shape | The implementation measured **three** row forms across the 292 committed series — `{t,o,h,l,c,v,ac}` on 147,337 rows, `{t,o,h,l,c,v}` on 2,675, and a 12-key provenance variant on 26 — so `readBars` validates `ac` as **optional**. Requiring it would throw on 54 real series. The item's own premise is now the wrong one; correcting it is a plan act, not an evidence act. |
| The retroactive `ac` rewrite is detectable | The fingerprint exists and `T-04-U7` proves `buildResolution` **accepts** it in hashed `provenance`. But "surfaces as `RTR-RESOLUTION-CONFLICT`" needs a written resolution object at a content address, which is increment 3. |
| "Not yet resolvable" is a silent skip | `fenceObservations` reports `resolvable: false` and fires no code, which `T-04-U5` asserts. "Leaving the claim `active` with zero events appended" needs the reducer bridge, which no increment has built. |
| `outcomeValue = direction × ret(subject)` | The arithmetic half is proven exact and unrounded. Two conjuncts are not: the class must be assigned by calling `classifyOutcome`, and `direction === 0` must close `neutral-direction-no-magnitude` — both increment 3. |

No Test-Plan test item is ticked. Every increment-2 row is a partial claim on its row, in the same posture
increment 1 held `T-04-F1` and `T-04-F2`.

### Increment 3 — the write slice (commit `c8665265f`)

The slice turns the increment-2 **number** into a **record** in the content-addressed store: `MEASURED_CLOSURE_EVENTS`,
`DETERMINED_CLOSURE_CLASS`, `resolutionAxesFor`, `resolutionProvenanceFor`, `resolutionFor` and `recordResolution`. It
wires `outcomeValueFor` through the shipped `classifyOutcome` and `buildResolution` / `writeResolutionObject`. The
predicate evaluators and the reducer bridge remain later increments, so the closure verdict and the lifecycle ids
arrive as inputs and every new row carries an `(increment 3)` marker.

**Commands, run from `<repo-root>`:** `node --test tests/recommendation-track-record.unit.mjs` — **exit 0**,
`tests 28 / pass 28 / fail 0`; `node --test tests/*.integration.mjs` — **exit 0**, `tests 33 / pass 33 / fail 0`. The
raw output and the per-item source anchors are recorded inline beside each ticked checkbox in [scope.md](scope.md).

**The closure-to-class routing is derived, so `withdrawn` is unreachable rather than merely unused.** Inverting the
shipped `OUTCOME_CLOSURE_EVENTS` yields an index holding only the five events some class admits; `withdrawn` is the
residue no class admits, so `resolutionAxesFor` refuses it before a record can exist. `DETERMINED_CLOSURE_CLASS` is
`Object.fromEntries` over that same inversion rather than a second list, so the two cannot drift into disagreeing
about which events carry a measurement — and the split is asserted at load to coincide exactly with
`MAGNITUDE_BEARING_OUTCOME_CLASSES`.

**The two axes are proven independent in both directions.** `T-04-U3` asserts `satisfied` + `loss` *and*
`invalidated` + `win`, so the row cannot pass under an implementation that hard-coded the opposite mapping. A
determined closure (`expired`) stores `null` for the magnitude while reporting the number it could **not** record,
because a value that vanished without a trace reads exactly like one never computed.

**The write is exactly-once by content address, and the two halves are different tests.** `T-04-I4` runs against a
real disposable filesystem outside the repository: an unchanged repeat is `reused: true, written: false` with the
file byte-identical; a re-emit carrying a fresh `eventId` — an unhashed field — lands at the same address with
different bytes and aborts with `RTR-RESOLUTION-CONFLICT`, overwriting nothing.

**Scope 02's gate is proven to run first by the shape of the adversarial input.** `T-04-I5` hands
`recordResolution` the *same complete, valid record* that the anti-vacuity control writes cleanly. Against a
claimless row it refuses `RTR-LEGACY-BACKFILL` / `claimless-row-unscoreable` and the store directory is never even
created, so no property of a well-formed resolution can rescue a row that never recorded what it claimed.

**Seven DoD items are ticked; four neighbouring write items are deliberately NOT.**

| Left unticked | The conjunct that is not yet satisfied |
|---|---|
| The retroactive `ac` rewrite is detectable | **The item's stated mechanism is now the wrong one, and it is surfaced rather than silently rewritten.** Detection works: the fingerprint is a hashed term, so a rewritten `ac` moves the content address. But `T-04-I4` asserts the moved record is **accepted at a second address** (`moved.ok === true`, two objects on disk, the first untouched) — that is detection by divergence, not the `RTR-RESOLUTION-CONFLICT` refusal the item names. The conflict fires on an *unhashed* change at a *taken* address. Ticking it would assert a refusal the code demonstrably does not raise; correcting the wording is a plan act, not an evidence act. |
| `withdrawn` is never resolver-emitted | The derived-residue half is proven — `withdrawn` is a real member of the 002-owned vocabulary that no class admits, it refuses, and no record is built on it. The item additionally requires "every failure branch, including a claim about to score badly", which is `T-04-F3`'s functional row and is not in this slice. |
| "Not yet resolvable" is a silent skip | Unchanged from increment 2: "leaving the claim `active` with zero events appended" still needs the reducer bridge, which the write slice explicitly defers. |
| `T-04-I5` passes | Two of its three named refusal paths are evidenced — the claimless row and the `claimHash`/`claimRef` mismatch. The third, "a malformed row refuses as malformed rather than as legacy", has no assertion in this slice. |

The seven-field bar-shape item and its increment-2 note are left exactly as they stand: the surfaced premise
correction there is a plan act and is not touched by an evidence pass.

**Inputs are empty; this scope is fixture-testable only.** Verified this planning pass: `briefs/objects/claims/` and
`briefs/objects/resolutions/` **do not exist**, there are **0** committed claim objects and **0** resolution objects,
and `claimRef` appears in **0** of the 5,083 committed ledger rows. A resolver run over real committed state today
therefore closes **zero** claims and appends **zero** events — correctly, and while proving nothing. No later pass may
read a green real-data run as coverage: every Test Plan row here is satisfied from
`tests/fixtures/recommendation-track-record/**` or it is not satisfied at all.

### Increment 4 — the predicate slice (commit `65e47272b`)

The slice supplies the **verdict** the increment-3 write slice had to accept as an input: `evaluatePredicate` decides
`satisfied` / `invalidated` for all four `PREDICATE_KINDS` against the as-of fenced slice, dispatching through
`PREDICATE_COMPARATORS`. Plan step 8 is implemented; no closure is routed yet, so the reducer bridge remains the
next increment.

**Command, run from `<repo-root>`:** `node --test tests/recommendation-track-record.unit.mjs` — **exit 0**,
`tests 33 / pass 33 / fail 0`. The raw output and the per-item source anchors are recorded inline beside each ticked
checkbox in [scope.md](scope.md).

**Vocabulary completeness is enforced at import, not asserted at review.** `bindToVocabulary` throws unless a
table's keys equal the frozen array exactly, so `KINDS` and `COMPARATORS` cannot fall out of step with
`claims.PREDICATE_KINDS` / `claims.PREDICATE_COMPARATORS`, and a fifth kind added upstream fails loudly at module
load rather than becoming a silently unreachable branch. No literal kind or comparator string is written at any call
site, and `T-04-U1` iterates the frozen arrays themselves rather than a list authored in the test.

**Each kind is proven satisfied and invalidated on the same series, so the verdict tracks the bound.** `relative`
and `spread` are proven to be *different predicates* rather than two spellings of one: on the identical pair at the
identical bound, `spread` reads the leg difference (`-15`, satisfied) while `relative` reads the basket mean against
the reference (`-7.5`, invalidated). `directional` reads the claim's **frozen flat band** and expressly not
`predicate.value`, which is why a correct bearish call on a falling series is satisfied — without the direction
multiply every correct `trim` would read as invalidated. An out-of-vocabulary kind refuses rather than coercing,
including `constructor`, which a lookup that skipped the membership test would have resolved through the prototype
chain instead of refusing.

**Point and path are two evaluations, not one with a different constant.** `T-04-U2` holds the bound fixed: the
close returns `+10` and misses `11` while the session high reaches `+12` and clears it, and the mirrored low pair
proves the path branch reads the extreme rather than a second constant. A path comparator walks the committed window
and decides at the **crossing** session, not the last one. A gap in that window closes `unresolved` /
`path-incomplete` carrying no `RTR-*` code, with the anti-vacuity control being the identical window with the
session restored; a missing **entry** session is instead `session-absent`, because the denominator is the endpoint
case and not a path gap.

#### Fourth plan defect surfaced — the header's refusal-code ownership is stale

Surfaced, **not** fixed, in the same manner as the three corrections recorded above. `RTR-PRICE-BASIS` is now a
resolver-**owned** code defined in this scope's own source (`scripts/brief-resolve-outcomes.mjs:227`) and raised from
the predicate evaluator (`:1035`, reason `path-extremes-absent-for-basis`) when a path comparator is asked to run on
`adjusted-close`, because `h` / `l` are quoted against the raw close only and dividing a raw high by an adjusted
entry close would fabricate a return from two different series. The scope header still lists it under **"Refusal
codes routed, not owned"** as *"the **proposed** `RTR-PRICE-BASIS`"*, and the "Refusal codes owned" line names only
`RTR-LOOKAHEAD`, `RTR-CALENDAR-COVERAGE` and `RTR-NETWORK`. Two consequences neither the plan nor any DoD item
records: this scope owns a fourth refusal code, and a claim minted with `priceBasis: adjusted-close` and a
`crosses-above` / `crosses-below` comparator is **structurally unresolvable**. Correcting the header and adding the
missing DoD coverage are plan acts and are not performed by an evidence pass.

**Three DoD items are ticked; the neighbouring predicate items are deliberately NOT.**

| Left unticked | The conjunct that is not yet satisfied |
|---|---|
| "Not yet resolvable" is a silent skip | Unchanged from increments 2 and 3: "leaving the claim `active` with zero events appended" is a reducer fact, and the predicate slice routes no closure. |
| `T-04-U5` passes | Its third clause, the silent skip, is the same reducer fact. The fence and the `RTR-LOOKAHEAD` halves were evidenced in increment 2. |
| `T-04-U6` / `T-04-U7` pass | Neither test exists yet; `T-04-U7`'s bearish-outcome half was evidenced against the *value* row in increment 2, which is a different DoD item. |

### Increment 5 — the reducer bridge (commits `d1a953c8d` and `abcaf0174`)

The slice closes the loop plan steps 12–14 describe: `originRecommendationKeyFor` derives the lifecycle key by
calling the shipped `deriveRecommendationKeys`, and `closeDueClaims` / `applyClosures` route every closure through
`reduceRecommendationEvents` as `run.closures` with `current: []`. The reducer is consumed, never forked.

**Command, run from `<repo-root>`:** `node --test tests/recommendation-track-record.unit.mjs` — **exit 0**,
`tests 33 / pass 33 / fail 0`. The raw output and the per-item source anchors are recorded inline beside each ticked
checkbox in [scope.md](scope.md).

**The key is re-derived rather than compared against a stored expectation.** `T-04-U10` runs the shipped producer
again over the record the bridge reports it assembled, so a bridge that derived correctly and then prefixed,
truncated, cached or substituted an authored key fails there instead of passing on a stale constant. Equality alone
would also hold for a producer that returned one value forever, so every measured contributing term is perturbed in
isolation and must move the key — and `ORIGIN_KEY_TERMS` is read off the producer *by perturbation* rather than
authored here, so the loop widens by itself if the producer starts folding in a further field.

**Idempotence is proven by execution, and the emptiness is measured rather than assumed.** `T-04-U9` proposes a live
entry through the shipped reducer, closes it once — one closure, one event, nothing skipped — then replays the same
verdict against *the reduction the first pass returned*. The second pass closes nothing, appends nothing, accounts
for the claim as `skipped` rather than dropping it silently, and leaves `indexFingerprint` byte-identical. The
pairing is what makes it non-vacuous: an implementation that closed nothing unconditionally fails the first-pass
assertions, so the second pass's emptiness is a measured suppression by the `entry.state === "active"` gate rather
than a function that never closes.

**The sanctioned channel is proven to be the only one that works, and the two bypasses fail differently.**
`T-04-U11` holds the payload fixed and varies only the channel. A closure smuggled on the run object is **accepted
and inert** — `applyClosures` passes its own parameter last, so `{ ...run, closures }` overwrites it and the entry
stays live with an unchanged fingerprint; that is a silent drop, and recording it as such matters more than
recording a refusal that does not happen. The same row handed through `current` is a **refusal**, the reducer's own
`unknown-field` on `current.0.eventType`, because a closure cannot masquerade as a proposal. The control is the
identical closure through `run.closures`, which appends exactly one event and moves the fingerprint.

**One DoD item is ticked; the neighbouring bridge items are deliberately NOT.**

| Left unticked | The conjunct that is not yet satisfied |
|---|---|
| Closures route through `reduceRecommendationEvents` … `RTR-CLOSURE-VOCAB` | The routing half is proven by `T-04-U11` and `git diff --quiet` over `rlcontracts.js`, `rlvalidation.js` and `rlclaims.js` exits **0** this pass. The `RTR-CLOSURE-VOCAB` clause is `T-04-U4`'s row by the scope's own Test Plan, and `T-04-U4` does not exist yet. |
| The resolver does not depend on its own closure ordering | No test permutes closure order; the claim rests on reading `rlcontracts.js:1272` rather than on an execution. |
| Idempotence is enforced by the due-set gate … | The gate and the `indexFingerprint` oracle are proven by `T-04-U9`. The content-addressed backstop clause is `T-04-I4`'s row in the *integration* suite, which this evidence pass did not run. |
| The due set is computed from reduction state | `dueEntryKeys` filters on `entry.state` alone; the `claimRef` and `resolutionDate ≤ asOfDate` conjuncts the item names are not implemented in it. |

### Evidence pass — the four resolver unit rows, one ticked and three refused

The whole unit suite was run first, so every per-row claim below sits on a green baseline rather than on an
isolated invocation. Executed from `<repo-root>`.

```
$ node --test tests/recommendation-track-record.unit.mjs
ℹ tests 40
ℹ suites 0
ℹ pass 40
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
exit code: 0
```

**All four rows pass. Only one of the four DoD items is ticked.** A passing test is not the same thing as a
satisfied item: three of these items assert something *narrower or different* from what their test executes, and
ticking them would have recorded a claim the suite does not carry.

#### T-04-U4

```
$ node --test --test-name-pattern="T-04-U4" tests/recommendation-track-record.unit.mjs
✔ T-04-U4: RTR-CLOSURE-VOCAB is raised by the shipped buildResolution, never re-implemented by the resolver (94.798817ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
exit code: 0

$ git diff --quiet -- rlclaims.js rlcontracts.js
exit code: 0
```

**Ticked.** Both clauses hold. `RTR-CLOSURE-VOCAB` is raised by `claims.buildResolution` with the code read off the
module export rather than typed into the test, and the resolver is proven not to own a second copy — it carries no
quoted `'RTR-CLOSURE-VOCAB'` and no constant bound to it, and handed the same offending value it refuses under its
own `closure-event-carries-no-outcome-class` instead. The second clause is a statement about the working tree, so
it was verified independently of the test as well as inside it; both readings exit `0`. The in-test reading is a
measurement rather than a constant, because the same helper is asserted **non-zero** against an absent ref.

#### T-04-U5

```
$ node --test --test-name-pattern="T-04-U5" tests/recommendation-track-record.unit.mjs
✔ T-04-U5 (increment 2): the as-of fence is a slice, and "not yet observed" is not "read the future" (10.782334ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
exit code: 0

$ grep -nE "series-not-yet-observed|later-series-asof|seriesAsOf" tests/recommendation-track-record.unit.mjs
2119:function seriesAsOfMap(symbols, asof) {
3411: * has not reached the frozen horizon and time alone cures it. `series-not-yet-observed` says the
3444:    const observed = dueEntryKeys(index, { ...gate, seriesAsOf: seriesAsOfMap(['DVG'], reached) });
3445:    const unobserved = dueEntryKeys(index, { ...gate, seriesAsOf: seriesAsOfMap(['DVG'], short) });
```

**Not ticked.** The item is a conjunction and only its first half is this test's. `T-04-U5` spans lines
2204–2253: it proves the fence is a slice containing no future row, that `RTR-LOOKAHEAD` fires on an attempt past
it, and that `bars.asof < resolutionDate` is a silent unresolvable rather than a refusal. It does **not** touch the
due set. Every occurrence of `seriesAsOf`, `series-not-yet-observed` and `later-series-asof` falls at line 3411 or
beyond, inside `T-04-U16: the data conjunct gates on the SERIES as-of alone, and no later run date cures it`
(line 3414) — a different row with its own DoD item. Ticking this item on `T-04-U5`'s pass would credit one row
with a second row's work.

#### T-04-U6

```
$ node --test --test-name-pattern="T-04-U6" tests/recommendation-track-record.unit.mjs
✔ T-04-U6: the not-evaluable reason set is READ from rlclaims.js, never restated by the resolver (4.651871ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
exit code: 0

$ node -e "const c=require('./rlclaims.js');console.log('NOT_EVALUABLE_REASONS.length =',c.NOT_EVALUABLE_REASONS.length);console.log('MINT_REFUSALS.length =',c.MINT_REFUSALS.length);console.log('RESOLVER_NOT_EVALUABLE_REASONS =',JSON.stringify(c.RESOLVER_NOT_EVALUABLE_REASONS));console.log('sum =',c.MINT_REFUSALS.length+c.RESOLVER_NOT_EVALUABLE_REASONS.length);"
NOT_EVALUABLE_REASONS.length = 12
MINT_REFUSALS.length = 9
RESOLVER_NOT_EVALUABLE_REASONS = ["no-committed-reference","zero-observed-session","calendar-coverage-exhausted"]
sum = 12
exit code: 0
```

**Not ticked, and the item is wrong rather than merely unproven.** Two of the three clauses hold. The set *is* read
from `NOT_EVALUABLE_REASONS`; its length *is* asserted by derivation, as
`MINT_REFUSALS.length + RESOLVER_NOT_EVALUABLE_REASONS.length` with no literal anywhere in the row; and there
genuinely are **three** resolver-raised reasons. The parenthetical "eleven today" is false — the shipped set
carries **twelve** (9 + 3), read above from the module itself. The test is explicit that it declines the plan's
arithmetic for exactly this reason: `MINT_REFUSALS.length + 2` would be 11, but `MINT_REFUSALS` grew to nine and
`RESOLVER_NOT_EVALUABLE_REASONS` carries three, not two. The derivation is what makes the row survive that drift;
the item text did not. **The item needs its count corrected before it can be ticked — that is a plan edit, not an
evidence gap, and it is surfaced here rather than papered over by ticking around it.**

#### T-04-U7

```
$ node --test --test-name-pattern="T-04-U7" tests/recommendation-track-record.unit.mjs
✔ T-04-U7 (increment 2): outcomeValue is direction x ret(subject), exact and unrounded, and the basis values are fingerprinted (35.858279ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
exit code: 0

$ awk 'NR>=2255 && NR<=2312 && (/classifyOutcome/ || /hold/)' tests/recommendation-track-record.unit.mjs
(no output)
```

**Not ticked.** The test proves the *sign*: `trim` carries direction `-1`, so a series that fell scores positive,
and the row pairs that against a wrong bearish call and a correct bullish one so the multiply is measured rather
than assumed. But the item names the mechanism and the refusal, and neither is here. The positive outcome is
produced by `outcomeValueFor` — the direction multiply — not by `classifyOutcome`; and `hold` is never exercised in
the body. The scan above over the test's own line span returns nothing for either symbol. `hold` having no signed
outcome is proven, but by `T-01-U7`, and `classifyOutcome` by the `T-03-U*` rows.

## Evidence pass — the four resolver functional rows, all four ticked

All four tests live in `tests/recommendation-track-record.functional.mjs` and all four pass. Passing was not
treated as sufficient: each DoD item was decomposed into clauses and each clause was matched to a specific
assertion in the test body. Three rows matched every clause on the first pass. T-04-F1 did not, and
was left unticked until its missing clause was asserted in its own body; it now matches all seven.

```
$ node --test --test-name-pattern="T-04-F" tests/recommendation-track-record.functional.mjs
✔ T-04-F1 (increment 1): a trading session is a non-null regular block, and horizon arithmetic counts sessions rather than days (9.12114ms)
✔ T-04-F2 (increment 1): RTR-CALENDAR-COVERAGE refuses past the committed window and extrapolates nothing (6.551757ms)
✔ T-04-F3: `withdrawn` is unreachable from every resolver path — the residue no class admits (9.899135ms)
✔ T-04-F4: the data-quality gate refuses only zero-observed sessions, records the degraded ones, and is scoped to the measured window (35.497167ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
exit code: 0
```

#### T-04-F1

**Ticked — seven clauses of seven.** Line references are into
`tests/recommendation-track-record.functional.mjs`.

| Clause | Assertion | Held |
|---|---|---|
| weekend boundary | `:1145` resolves 2026-01-02 +1 session to 2026-01-05; `:1146` pins the skipped row as `weekend` | yes |
| holiday boundary | `:1148` resolves 2026-01-16 +1 session to 2026-01-20; `:1149` pins 2026-01-19 as `holiday` | yes |
| early-close boundary | `:1153` resolves 2026-11-25 +1 session onto the early close 2026-11-27; `:1154-1156` show the `dateState` rule would land three sessions late | yes |
| `startUtc` cross-check | `:1205` reads `regular.startUtc` via `openOf`; `:1206-1209` refuse `session-open-mismatch` one millisecond past it; `:1211-1214` refuse a weekend instant at the usual open time | yes |
| `RTR-SESSION-PREDICATE` refuses a `dateState` key | `:1135-1139` asserts `session-predicate-not-allowed` on field `predicateKey`; the code is `'RTR-SESSION-PREDICATE'` at `scripts/brief-resolve-outcomes.mjs:53` | yes |
| 2026 session count is 251 | `:1131` asserts `sessions.tradingDates.length === 251`; `:1132` pins the rejected rule at 249 | yes |
| `provenance.earlyCloseSessions` is recorded | `:1177-1179` assert `resolutionProvenanceFor` records `['2026-11-27']`; `:1183` asserts an empty list for a span clear of both early closes; `:1187-1189` prove the recorded array is the caller's own copy | yes |

The previously open clause is now closed in this row's own body. `:1157-1158` still assert
`earlyCloseSessionsIn(calendar, span)` — the span-derived flag helper, the *source* of the value —
and `:1177-1189` now assert the *recording*: a claim minted with `binding.entryDate` 2026-11-25 and
`binding.resolutionDate` 2026-11-27 is handed to `resolutionProvenanceFor`, whose block carries
`earlyCloseSessions: ['2026-11-27']`. The two are different facts. The helper can be correct while
the call site at `scripts/brief-resolve-outcomes.mjs:780` passes it the wrong sessions, and the
answer would still be correct — for an input the resolution never measured.

Three assertions rather than one, because a single positive row proves less than it appears to.

- The positive row, `:1179`, pins the exact list for a span that touches one early close.
- The negative row, `:1183`, pins an **empty** list for the 2026-01-02..2026-01-05 span. Without it
  the positive row is also satisfied by an implementation that flags every session it is given.
- The isolation row, `:1187-1189`, writes into the returned array and then re-reads both
  `earlyCloseSessionsIn` and a freshly assembled resolution, both unchanged. The recorded value is
  a snapshot, so a caller cannot write back into the calendar-derived flag.

Both properties were confirmed by mutating the shipped line and observing the failure, then
reverting. Replacing the `sessions` argument at `scripts/brief-resolve-outcomes.mjs:780` with the
whole calendar's trading dates fails `:1179`:

```
$ node --test --test-name-pattern="T-04-F1" tests/recommendation-track-record.functional.mjs
not ok 1 - T-04-F1 (increment 1): a trading session is a non-null regular block, and horizon arithmetic counts sessions rather than days
  failureType: 'testCodeFailure'
  error: |-
    + actual - expected
        '2026-11-27',
    +   '2026-12-24'
# fail 1
```

`2026-12-24` is the December early close. The November span never touched it, so a record carrying
it is a flag for a session the resolution did not measure — which is the defect the clause names.
Dropping the `.slice()` on the same line fails `:1187` with
`TypeError: Cannot add property 1, object is not extensible`, because `earlyCloseSessionsIn`
returns a frozen array and the copy is what makes the recorded value the caller's own.

After both reverts, `git diff -- scripts/brief-resolve-outcomes.mjs` is empty and the suite is
`tests 13 / pass 13 / fail 0`.

#### T-04-F2

**Ticked.** Item clauses: `RTR-CALENDAR-COVERAGE` fires beyond `coverageEnd`; nothing is extrapolated.

```
$ node --test --test-name-pattern="T-04-F2" tests/recommendation-track-record.functional.mjs
✔ T-04-F2 (increment 1): RTR-CALENDAR-COVERAGE refuses past the committed window and extrapolates nothing (11.01762ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
exit code: 0
```

Fires beyond `coverageEnd`: `:1216-1221` refuses `advanceSessions` started one day past `coverageEnd` and one day
before `coverageStart` with `CALENDAR_COVERAGE_CODE` on field `fromDate`; `:1226-1229` refuses an observation
stamped past `coverageEnd` on field `observation.t`; `:1200` refuses one session past the last session on field
`resolutionDate`. The code is `'RTR-CALENDAR-COVERAGE'` at `scripts/brief-resolve-outcomes.mjs:54`, so the refusal
carries the shipped identifier. No extrapolation: `:1201` asserts the refusal has no `tradingDate` key at all.
Non-vacuous: `:1206` requires a four-session horizon that fits to resolve to the last session, so a resolver that
refused every multi-session horizon fails the row.

#### T-04-F3

**Ticked.** Item clause: `withdrawn` is unreachable from every resolver path.

```
$ node --test --test-name-pattern="T-04-F3" tests/recommendation-track-record.functional.mjs
✔ T-04-F3: `withdrawn` is unreachable from every resolver path — the residue no class admits (23.775943ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
exit code: 0
```

"Every path" is asserted three ways rather than sampled. Structurally, `:1290` builds `emittable` as the union of
`MEASURED_CLOSURE_EVENTS` and the keys of `DETERMINED_CLOSURE_CLASS` — the whole surface `resolutionAxesFor` can
leave through — and `:1299` places `withdrawn` outside it while `:1300-1304` assert it is exactly the one
vocabulary member no class admits. Behaviourally, `:1345-1352` iterates every measured event and `:1355-1361`
every determined event, asserting the outcome class is never `withdrawn` on a clearly negative score, and
`:1366-1373` asserts a direct request refuses with `closure-event-carries-no-outcome-class`. In source,
`:1315-1317` assert the resolver names `withdrawn` in prose only and that no authored emission survives comment
stripping. Non-vacuous in both directions: `:1284` asserts `withdrawn` is a real shipped vocabulary member so the
exclusions are an absence and not a typo, and `:1322-1330` run the scanner over a synthetic source and require it
to flag exactly the assignment and neither the prose nor the negated membership test.

#### T-04-F4

**Ticked.** Item clauses: `zeroObservedSessions` closes not-evaluable; reconstructed and thin sessions resolve;
their provenance is recorded.

```
$ node --test --test-name-pattern="T-04-F4" tests/recommendation-track-record.functional.mjs
✔ T-04-F4: the data-quality gate refuses only zero-observed sessions, records the degraded ones, and is scoped to the measured window (37.822489ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
exit code: 0
```

Closes not-evaluable: `:1437-1443` gates each in-window session and asserts `closureEventType` is `not-evaluable`,
`reasonCode` is `ZERO_OBSERVED_REASON`, `error` is `undefined`, and the field names the session that did not
trade — a closure about the claim, not a substrate refusal. `:1428` asserts the reason is a shipped member of
`RESOLVER_NOT_EVALUABLE_REASONS`. Degraded sessions resolve: `:1466-1470` runs `reconstructedSessions` and
`thinObservedSessions` and requires `ok` and an `outcomeValue` equal to the clean read. Provenance recorded:
`:1472-1475` asserts `resolutionProvenanceFor` carries the in-window date under the degraded field and an empty
array under the other. Non-vacuous: `:1431-1433` is a clean control that must score, and `:1449-1451` places the
same bad session outside the measured window and requires the claim to still score, which is the case a
file-global gate fails.

## Evidence pass — the four reducer-bridge and gate integration rows, three ticked and one refused

Executed from `<repo-root>`. The single file carries 7 top-level rows; the integration glob carries 36.

```
$ node --test tests/recommendation-track-record.integration.mjs
# tests 7
# pass 7
# fail 0

$ node --test tests/*.integration.mjs
# tests 36
# pass 36
# fail 0
```

#### T-04-I1

**Ticked.** Item clauses: closures route through the reducer with `current: []`; one event per due claim;
frozen terms re-emitted; the still-active case proven to fail.

```
$ node --test --test-name-pattern="T-04-I" tests/recommendation-track-record.integration.mjs
# tests 5
# pass 5
# fail 0
```

`current: []`: `:708-712` requires that no `proposed`, `reaffirmed` or `modified` event is appended, and
`:714-718` requires the entry key set to be unchanged — a closing pass mints nothing. `:727-729` is the
decisive reading rather than an inference: the reducer refuses `recommendation-closure-still-active` on
`run.closures.0` when one run both re-proposes and closes a key, so the pass that returned cannot have carried
that key in `current`. One event per due claim: the pass is handed BOTH verdicts, so the count is a selection;
`:654-656` requires one closure and one appended event, `:655` names the due key, `:658-660` pins the type, the
key and the closed transition. Frozen terms: `:664-668` requires the event's `observationTerms` to equal the
entry's frozen terms object and `:675-681` requires each measured origin term to equal the minted claim;
`:686-691` is the anti-vacuity, since the bridge supplies `null` for five terms and carrying the proposal
values instead is reachable only by re-emission. The not-due entry is left LIVE and unchanged in every field
(`:695-699`) and reported as skipped with the gate's reason (`:701-703`) rather than dropped.

#### T-04-I2

**Ticked.** Item clauses: pass 2 is a no-op; the `indexFingerprint` is byte-identical.

The no-op: `:767` is the append oracle — pass two appends zero events — and `:776-778` requires nothing
scheduled and the claim reported as skipped naming the closed state, so the result is suppressed-and-accounted
rather than merely empty. The fingerprint: `:768-772` compares the two reductions as one value rather than
field by field. Non-vacuity: `:782-783` requires pass one to have closed and appended on the SAME verdicts, so
the emptiness of pass two is not the behaviour of a resolver that closes nothing. The adversarial detail is the
`runId`: pass two runs under a later one and `lifecycleEventId` folds `runId` in, so a duplicate here would
carry a new event id and the reducer's within-run dedupe cannot account for the zero — T-04-I3 `:854-858`
measures that dedupe and confirms it is within-run only.

#### T-04-I3

**Ticked — after the item itself was corrected under Ruling R-04-10.** Item clauses (corrected): the reducer
accepts the double closure with the gate bypassed; a duplicate event is appended; `indexFingerprint` is
byte-identical across that append; the gate is the sole enforcement point.

The acceptance and the append. `:815-818` measures `ok === true`, one appended event, the same closure type
and a genuinely new `eventId` when the same closure is replayed against the index the first one produced;
`:827-831` measures two appended events across the ungated pair, which is what makes T-04-I2's zero
attributable to the due-set gate rather than to a reducer defence.

The fingerprint. `:837-841` measures it **byte-identical** across the duplicate that `:816` just measured as
appended. `indexFingerprint` covers `{ contractVersion, entries }` (`rlcontracts.js:1318`), and a repeat closure
of the same type leaves both `state` and `lastEventType` where they already were, so an appended duplicate is
outside what it reads. The reading is live, not inert: `:844-848` requires the FIRST closure to have moved it.

The prior revision of this section recorded the item as **not ticked** because it demanded that the fingerprint
**change**. That demand was wrong, not unmet — the DoD item, the Test Plan row at `scope.md:412` and finding
`F-015-D4-02` in `scopes/_index.md` all carried it, and all three are now corrected. Ruling R-04-10 records the
measurement, the source line and the consequence: the fingerprint is an index-state oracle rather than an
event-append oracle, so the due-set gate is the sole enforcement point for FR-006. That is also why T-04-I2
needs its own append oracle at `:767` and could not lean on the fingerprint alone. The reducer's only self-defence
is within-run dedupe by `eventId`, measured at `:854-858`, which cannot apply across calls.

#### T-04-I5

**Ticked.** Item clauses: a claimless row refuses `RTR-LEGACY-BACKFILL` before the resolution is inspected; a
malformed row refuses as malformed; a `claimHash`/`claimRef` mismatch refuses; nothing is written on any path.

Two clauses were already asserted. The claimless refusal is pinned at `:429-431` by code, reason
`claimless-row-unscoreable` and field `claimRef`; the mismatch at `:441-443` on field `claimHash`; and
`:469-471` is the anti-vacuity control that writes the identical record against the same row plus the right
`claimRef`, so a writer that refused everything would fail.

Two clauses were not, and this pass added them. **Ordering** was the subtler gap: every refusal in the body ran
against a well-formed resolution, which establishes that the gate refuses a valid record but not that it runs
*before* the record is read — the same output follows from a writer that inspects the resolution, finds nothing
wrong, and only then reaches the gate. `:492-498` discriminates by offering ONE refusable resolution behind two
rows, for two independent defects (a non-object resolution and an unusable `contractVersion`): behind the
claimless row the GATE's code comes back. `:505-511` is the non-vacuity pair — behind an authorized row the
same object reports its OWN defect and never the legacy code — so the resolution is genuinely refusable and the
precedence is a measurement. **Malformed-row precedence** was absent entirely: `:455-459` feeds a row that is
both malformed and claimless, so both rules match it, and requires `RTR-ROW-CONTRACT` while forbidding
`RTR-LEGACY-BACKFILL`, which would file a structural defect under a policy one.

Nothing written: `:432`, `:444` and `:460` require the store directory never to be created; `:512` requires no
second object after the control write; `:516` requires the committed partition bytes to be unchanged.

Both added clauses were closed by mutation rather than by reading. Reordering `authorizeResolutionWrite` so the
resolution is inspected before the legacy branch fails `:493`:

```
    a non-object resolution: reported as LEGACY, so the gate ran before this resolution was inspected
  expected: 'RTR-LEGACY-BACKFILL'
  actual: 'RTR-ROW-CONTRACT'
  operator: 'strictEqual'
```

Moving the legacy branch ahead of `validateLedgerRow` fails `:456`:

```
    as a row-contract violation
  expected: 'RTR-ROW-CONTRACT'
  actual: 'RTR-LEGACY-BACKFILL'
  operator: 'strictEqual'
```

Both mutations were reverted; `git diff --quiet -- rlclaims.js` exits 0, so the module is byte-identical to the
index and was consumed rather than edited.

## Completion Statement

Scope 04 is in progress. **38 of 56** Definition of Done items are satisfied and the remaining 18 are
unsatisfied. The count is read from the artifact rather than accumulated by hand: `grep -c '^- \[x\]' scope.md`
returns 38 and `grep -c '^- \[ \]' scope.md` returns 18. *The prior statement here read "16 of 56" with a
per-increment breakdown summing to 16. That breakdown was stale — it predated later passes that ticked rows
without revising it — and has been dropped rather than extended, because an enumeration this pass did not verify
should not be carried forward.* An earlier pass ticked T-04-F2, T-04-F3 and T-04-F4 and left T-04-F1 open: its
test passed, but the clause `provenance.earlyCloseSessions` is recorded had no assertion in the body. That pass
added the assertion, its non-vacuity pair and its snapshot check, and ticked T-04-F1.
This pass examined the four reducer-bridge and gate rows and ticked three. T-04-I1 and T-04-I2 were already
fully asserted. T-04-I5 was short by two clauses — the ordering it names and the malformed-row case — both of
which were closed inside the existing test and proven by mutation. T-04-I3 was left open at the time because its
fingerprint clause stated a property the system does not have; **that clause has since been corrected under
Ruling R-04-10 and the item is ticked.**
*The total moved 55 → 56 under Ruling R-04-05, which added the previously-uncovered adjusted-close path
refusal as an unticked obligation.*
No scope completion is claimed and no certification is requested. Ruling R-04-01
is **discharged**: scope 01 landed the frozen hashed `priceBasis` term, and the resolver consumes it rather than
selecting a basis of its own.
