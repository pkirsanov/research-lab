# Scope 04 Report: Deterministic outcome resolver

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Not started. No implementation, no command execution, and no test evidence is claimed for this
scope. The sections below record **plan corrections and one ruling**, not execution evidence. No Definition of Done
item is satisfied and no certification is requested.

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

Only the increment-1 calendar slice recorded below has been executed. No other Test Plan row in
[scope.md](scope.md) has been executed, and no selftest baseline has been captured.

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

**Inputs are empty; this scope is fixture-testable only.** Verified this planning pass: `briefs/objects/claims/` and
`briefs/objects/resolutions/` **do not exist**, there are **0** committed claim objects and **0** resolution objects,
and `claimRef` appears in **0** of the 5,083 committed ledger rows. A resolver run over real committed state today
therefore closes **zero** claims and appends **zero** events — correctly, and while proving nothing. No later pass may
read a green real-data run as coverage: every Test Plan row here is satisfied from
`tests/fixtures/recommendation-track-record/**` or it is not satisfied at all.

## Completion Statement

Scope 04 is in progress. **2 of 55** Definition of Done items are satisfied — both from the increment-1 calendar
slice recorded above — and the remaining 53 are unsatisfied. No scope completion is claimed and no certification is
requested. Ruling R-04-01 routes a blocking mint-contract gap to scope 01; every `ret(x)`-dependent item is blocked
until that term lands.
