# Scope 04 Report: Deterministic outcome resolver

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** In progress. Two increments have executed — the increment-1 calendar slice and the increment-2
value slice, both recorded under `## Test Evidence`. The sections before it record **plan corrections and one
ruling**, not execution evidence. No scope completion is claimed and no certification is requested.

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

## Completion Statement

Scope 04 is in progress. **16 of 55** Definition of Done items are satisfied — two from the increment-1 calendar
slice, three from the increment-2 value slice, seven from the increment-3 write slice, three from the increment-4
predicate slice, and one from the increment-5 reducer bridge, all recorded above — and the remaining 39 are
unsatisfied. No scope completion is claimed and no certification is requested. Ruling R-04-01
is **discharged**: scope 01 landed the frozen hashed `priceBasis` term, and the resolver consumes it rather than
selecting a basis of its own.
