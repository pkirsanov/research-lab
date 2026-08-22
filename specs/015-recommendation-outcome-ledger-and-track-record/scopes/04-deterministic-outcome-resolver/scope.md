# Scope 04: Deterministic outcome resolver

**Status:** In Progress
**Depends On:** 01, 02, 03
**Tags:** `overlay:true`, `routed:P-015-03`, `routed:P-015-07`, `routed:R-04-01`, `blocked-on:01`
**Design section:** `design.md` → `## D4 — Deterministic Outcome Resolver`
**Business Scenarios owned:** BS-002, BS-003, BS-007, BS-009, BS-010
**UI rows owned:** — (no rendered surface in this scope)
**Refusal codes owned:** `RTR-LOOKAHEAD`, `RTR-CALENDAR-COVERAGE`, `RTR-NETWORK`, `RTR-PRICE-BASIS`
**Refusal codes consumed, already shipped by scope 03 — this scope neither owns nor re-implements them:**
`RTR-CLOSURE-VOCAB` (`rlclaims.js:267`, fired by `buildResolution`), `RTR-RESOLUTION-CONFLICT` (`rlclaims.js:269`,
fired by `writeResolutionObject`), `RTR-FLAT-ZERO` (`rlclaims.js:133`, fired by `buildResolution` and
`assertZeroFreeOutcomes` at `:817`), `RTR-LEGACY-BACKFILL` (`rlclaims.js:196`, fired by `authorizeResolutionWrite`
at `:721`). An earlier revision of this header claimed the first two as **owned**; they were already coded when it
was written, and two owners of one refusal code is how a code ends up meaning two things.
**Refusal codes routed, not owned:** `RTR-SESSION-PREDICATE` (D4-owned per `design.md`; this scope must satisfy it,
not define it). *`RTR-PRICE-BASIS` was carried here as merely **proposed** until Ruling **R-04-05** (`report.md`).
It is resolver-**OWNED**: declared in this scope's own source at `scripts/brief-resolve-outcomes.mjs:227` and raised
from three sites — `:365` (the claim's frozen basis field is absent from an endpoint observation), `:824`
(`path-extreme-absent-from-observation`) and `:1034` (`path-extremes-absent-for-basis`). A code raised by this
scope's own source is owned by this scope; leaving it listed as proposed is how a shipped refusal ends up with no
owner to answer for it.*

**Primary Outcome:**
`scripts/brief-resolve-outcomes.mjs` exists as an offline, deterministic Node script that converts a frozen claim
plus committed observations into **one** signed outcome and **exactly one** closure event drawn from the existing
`CLOSE_EVENT_TYPES` vocabulary, applied through the existing `reduceRecommendationEvents` without forking it. The
script is a **caller**, not a second contract layer: every resolution primitive it needs — `classifyOutcome`,
`buildResolution`, `resolutionHash`, `resolutionObjectPath`, `serializeResolution`, `writeResolutionObject`,
`authorizeResolutionWrite`, `enumerateCommittedSeries`, `outcomeContributionFor`, `directionalDenominator`,
`CLOSURE_REASON_CODES`, `NOT_EVALUABLE_REASONS`, `OUTCOME_CLOSURE_EVENTS` — is **already shipped and exported by
scope 03** in `rlclaims.js` and is consumed unchanged. What remains genuinely unbuilt is the *observation* layer:
the due-set gate, calendar-session arithmetic, the as-of slice, the four predicate evaluators, the data-quality
gates, and the reducer call. The lookahead fence is structural, not procedural: the bar array is sliced to
observations dated at or before the claim's frozen `resolutionDate` **before** the predicate evaluator is handed
anything, so lookahead is prevented by the shape of the data the evaluator can see. Closure event and outcome class
are recorded as two **independent** axes, so a `satisfied` claim carrying a negative magnitude keeps both facts.
Idempotence rests on the due-set gate (`entry.state === "active"`), and the test suite proves *where* the invariant
lives, not merely that it holds. The resolver performs no `fetch`, opens no socket, and reads no provider
credential.

**Scope boundary — two routed findings ruled on, one new blocking finding raised.** The **reducer key bridge**
carried routed finding **P-015-03** (`thesisFamily` has no live source) and the **horizon session predicate**
carried routed finding **P-015-07** (the design's `dateState === "regular"` rule skips `early-close` sessions).
Design has since ruled on both, so **neither gates implementation**: `thesisFamily` is authored-or-not-evaluable and
is a top-level hashed claim field, and the session predicate is `row.regular !== null`. This scope implements the
recorded rulings and records in `report.md` which ruling it implemented; it still invents no `thesisFamily` value
and still derives no session count of its own.

**A third finding, R-04-01, was BLOCKING and is now DISCHARGED.** The claim contract recorded **no raw-vs-adjusted
close basis**: `HASHED_TERMS` (`rlclaims.js:66`) named nine terms and none was a price basis, and `SIGN_CONVENTIONS`
(`rlclaims.js:65`) fixes only the **sign** convention. Committed bar rows carry **both** closes, ~74% of series have
`ac !== c`, and BUG-012 established the refresh cron **retroactively rewrites `ac`** — so `ret(x)` was two different
functions and an outcome computed on an unrecorded basis was tunable after the fact and non-reproducible, the same
class of defect as `flatBand`. Ruling R-04-01 (`report.md`) routed it to **scope 01** as a mint-contract defect
requesting a frozen hashed `priceBasis` term, and **scope 01 landed that term**: `PRICE_BASES` (`rlclaims.js:76`),
`PRICE_BASIS_ROW_FIELD` (`:79`) and `priceBasisFor` (`:802`) are shipped and consumed here. No `ret(x)`-dependent
item is blocked any longer, and this scope still selects **no** basis of its own — it reads the frozen term.
*Ruling **R-04-04** records the correction; an earlier revision of this paragraph and of steps 8, 10 and 16 carried
R-04-01 as still blocking, which reads as un-startable work for a reason that no longer exists.*

**Inputs are empty today; this scope is FIXTURE-TESTABLE ONLY.** Verified this planning pass:
`briefs/objects/claims/` and `briefs/objects/resolutions/` **do not exist**, there are **0** committed claim objects
and **0** resolution objects, and `claimRef` appears in **0** of the 5,083 committed ledger rows. A resolver run
over real committed state closes zero claims and appends zero events — correctly, and while proving nothing. Every
Test Plan row below is satisfied from `tests/fixtures/recommendation-track-record/**` or it is not satisfied at all,
and **no green real-data run may be recorded as coverage**.


---

## Business Scenarios owned

### BS-002: A satisfied claim resolves to a positive outcome

```gherkin
Scenario: A satisfied claim resolves to a positive outcome (SCN-015-002)
  Given an open claim whose horizon expired and whose predicate evaluates true on committed bars
  When the resolver runs
  Then exactly one "satisfied" closure event is appended through reduceRecommendationEvents
  And a positive signed outcome is recorded in the claim's declared magnitude unit
```

### BS-003: An invalidated claim resolves to a negative outcome

```gherkin
Scenario: An invalidated claim resolves to a negative outcome (SCN-015-003)
  Given an open claim whose invalidation condition was met before its horizon expired
  When the resolver runs
  Then exactly one "invalidated" closure event is appended
  And a negative signed outcome is recorded
```

### BS-007: Resolution never reads the future

```gherkin
Scenario: Resolution never reads the future (SCN-015-007)
  Given a claim whose resolution date is D
  When the resolver evaluates its predicate
  Then only observations dated at or before D are consulted
  And a resolution attempted with data unavailable at D is refused
```

### BS-009: Re-running the resolver changes nothing

```gherkin
Scenario: Re-running the resolver changes nothing (SCN-015-009)
  Given a ledger in which every due claim has been resolved
  When the resolver runs again over the same committed bars
  Then no duplicate closure event is appended
  And the resulting track record is byte-identical
```

### BS-010: A claim with no committed series is not-evaluable

```gherkin
Scenario: A claim with no committed series is not-evaluable (SCN-015-010)
  Given a claim whose subject has no series under data/bars/
  When the resolver runs
  Then the claim closes as "not-evaluable" with a stated reason
  And it is excluded from rate denominators while remaining visibly counted
```

---

## Implementation Plan

**Orientation — this scope CONSUMES scope 03's shipped module.** An earlier revision of this plan named
`rlclaims.js` zero times and proposed to build the resolution layer from scratch. Scope 03 had already shipped and
exported it. Every step below that touches a resolution object, an outcome class, a reason code, or the committed
series set therefore **calls** the exported function rather than restating its rule; a second copy would put two
resolution vocabularies over one ledger, which surfaces as ledger corruption rather than as a test failure — the
same reason this scope already refuses to fork the reducer. The shipped surface consumed here:

| Consumed export (`rlclaims.js`) | What it already does | This scope must NOT |
|---|---|---|
| `enumerateCommittedSeries` (`:530`) | Derives the committed symbol set from the **bars directory listing**, skipping `BARS_MANIFEST_FILENAME` | re-derive membership, or read `index.json` as the set |
| `authorizeResolutionWrite` (`:733`) | Scope 02's gate: refuses a claimless row with `RTR-LEGACY-BACKFILL` **before** inspecting the resolution | bypass it, re-implement it, or reorder its checks |
| `flatBandFor` (`:767`) | Reads the band from the **minted claim**, refusing a non-finite or non-positive one | accept a band as an argument |
| `outcomeContributionFor` (`:781`) / `OUTCOME_CLASSES` (`:111`) | Validates a class against the closed six-member vocabulary and returns its `number`/`count` routing | restate the class list |
| `classifyOutcome` (`:795`) | Maps one numeric outcome to exactly one class against the claim's frozen band, value carried verbatim | round, nudge, or re-derive the class |
| `assertZeroFreeOutcomes` (`:822`) / `RTR-FLAT-ZERO` (`:133`, `:817`) | Refuses a bare `0` reaching the directional array | emit a bare zero into a directional class |
| `routeOutcomes` (`:850`) / `directionalDenominator` (`:901`) | Builds the fed array and proves the published denominator **is** its length | compute a rate here (that is scope 05) |
| `buildResolution` (`:1003`) | Validates class↔closure↔reason, refuses run-scoped keys in hashed `provenance`, computes `resolutionHash` | assemble a resolution object literal |
| `resolutionHash` (`:986`) / `resolutionObjectPath` (`:988`) / `serializeResolution` (`:994`) | Content address and canonical bytes | hand-roll a path or a stringify |
| `writeResolutionObject` (`:1109`) | Calls the gate first, then refuses a byte-changing write with `RTR-RESOLUTION-CONFLICT` | write to `RESOLUTION_STORE_DIR` directly |
| `OUTCOME_CLOSURE_EVENTS` (`:284`) | Which closure events each class admits; `withdrawn` is the residue no class admits | restate "withdrawn is never emitted" as a separate rule |
| `CLOSURE_REASON_CODES` (`:307`) / `NOT_EVALUABLE_REASONS` (`:305`) | The reason vocabulary, derived from `MINT_REFUSALS` (`:89`) ∪ `RESOLVER_NOT_EVALUABLE_REASONS` (`:298`) | restate a reason list of its own |
| `readClosureEventVocabulary` (`:944`) | Reads `CLOSE_EVENT_TYPES` from `rlcontracts.js` source text | keep a shadow copy of the vocabulary |

1. **Create `scripts/brief-resolve-outcomes.mjs`**, joining the existing `scripts/brief-*.mjs` family
   (`brief-author.mjs`, `brief-distributed-publish.mjs`, `brief-publication.mjs`, `brief-refresh.mjs`,
   `migrate-brief-history.mjs`), so the resolver is an ordinary member of an established script surface rather than a
   new execution model. It imports `rlclaims.js` through the same UMD `module.exports` path scope 03's own tests use
   (`rlclaims.js:39`–`:40`), and adds no module of its own to the contract layer.
2. **Enforce HC-10 structurally.** The resolver's entire input set is committed repository state:
   `briefs/objects/claims/` (`CLAIM_STORE_DIR`), `briefs/history/recommendations/*.jsonl`, the committed
   `data/bars` tree (`BARS_DIR`, `rlclaims.js:228`), and `data/calendars/xnys/calendar.json`. It performs no `fetch`,
   opens no socket, reads no provider key, and never consults `RLDATA`'s browser fetch path. A violation is
   `RTR-NETWORK`, asserted by a source scan in the same idiom the repo already uses for
   `rlvalid-node-safe-no-dom-storage-network`.

   **The committed symbol set is `enumerateCommittedSeries(readdir(BARS_DIR))` — never a count, and never
   `index.json`.** *An earlier revision of this step had the rule inverted*: it said membership comes from
   `data/bars/index.json` `tickers[].sym`. `enumerateCommittedSeries` (`rlclaims.js:530`) deliberately does the
   opposite and documents why — the directory listing is the **availability** set, i.e. what the resolver can
   actually read, while `index.json` is a **curation** set, and *"using it would refuse a claim on a symbol whose
   bars are committed and readable, shrinking the denominator over a curation detail."* Following the old rule would
   have closed `no-committed-series` on `EA`, `NDX` and `PHP=X`, three symbols with committed readable bars.
   The function already skips `BARS_MANIFEST_FILENAME` (`rlclaims.js:230`), so `index` can never be mistaken for a
   tradeable symbol without this scope writing that rule a second time. *Dated observation, deliberately not a
   constant:* on 2026-08-18 the glob matched 293 files, the glob minus the manifest 292, the manifest 289 symbols.
   The tests enumerate the set at run time and assert **no** count literal.
3. **Compute the due set from reduction state and a passed-in binding, not from timestamps.**
   `due(asOfDate) = { key ∈ index.entries : entry.state === "active" ∧ binding(key).claimRef !== null ∧ binding(key).resolutionDate ≤ asOfDate }`.
   Only the first conjunct is a property of the reduction. The other two read facts a
   `recommendation-index/v1` entry does **not** carry — the ledger ROW's `claimRef` and the CLAIM's frozen
   `horizon.resolutionDate` — so they arrive through a `gate.bindings` map keyed by the same
   `originRecommendationKey`, per **Ruling R-04-06** (`report.md`). *An earlier revision wrote the middle conjunct
   as "entry has a claimRef" and the third as `claim(entry).horizon.resolutionDate`; both were unimplementable —
   the reducer writes an entry as a closed nine-field object literal in which neither appears, so the literal
   predicate collapses the due set to EMPTY for every reducer-produced index.*
   `index` is a `recommendation-index/v1` produced by `reduceRecommendationEvents` (`rlcontracts.js:1140`);
   `entry.state` is set to `"closed"` by the reducer's own closure path (`rlcontracts.js:1284`). The `claimRef`
   field name is `CLAIM_REF_FIELD` (`rlclaims.js:199`) and its shape is `CLAIM_REF_PATTERN`, both consumed rather
   than restated. Both dates are asserted against `ISO_DATE` before they meet and compared as whole strings, whose
   lexicographic order **is** their chronological order; an absent or prefix-shaped bound date **refuses** rather
   than falling through to due.
4. **Derive `resolutionDate` by calendar-session arithmetic, never day arithmetic.** The committed exchange calendar
   is `data/calendars/xnys/calendar.json` — contract `xnys-calendar/v1`, `calendarId: "XNYS"`,
   `timeZone: "America/New_York"`, `coverageStart: "2026-01-01"`, `coverageEnd: "2026-12-31"`, **365 rows** each
   carrying `{ tradingDate, dateState, closureCode, closureLabel, preMarket, regular, afterHours }`. Adding calendar
   days would resolve a Friday `next-session` claim on a Saturday and silently mark it `not-evaluable` for want of a
   bar; counting sessions cannot make that mistake.
   **Routed finding P-015-07 is RESOLVED and does not block this step.** *An earlier revision carried it as
   blocking.* The ruling recorded in `design.md` is that a trading session is a row with a **non-null `regular`
   block** — `row.regular !== null`, not `dateState === "regular"` — which admits both `early-close` sessions
   (`2026-11-27` and `2026-12-24`, each a genuine 09:30–13:00 ET session) and yields **251** sessions in 2026
   (249 `regular` + 2 `early-close`; the other 114 rows are 10 `holiday` and 104 `weekend`, and none of them carries
   a `regular` block). Keying on `dateState` is the D4-owned refusal **`RTR-SESSION-PREDICATE`**, which this scope
   must satisfy and does not define. An `early-close` session **resolves normally** and is flagged, not excluded:
   when `entryDate` or `resolutionDate` lands on one, the resolution records
   `provenance.earlyCloseSessions: [<tradingDate>…]`, in the same idiom already used for `reconstructedSessions`, so
   a reader can see the outcome rests on a 3.5-hour session.
5. **Refuse beyond calendar coverage.** A `resolutionDate` beyond `coverageEnd` cannot be derived, and guessing one
   is fabrication. `RTR-CALENDAR-COVERAGE` fires and the claim closes `not-evaluable` with reason
   `calendar-coverage-exhausted` — a member of `RESOLVER_NOT_EVALUABLE_REASONS` (`rlclaims.js:298`), so
   `buildResolution` already accepts it against `not-evaluable` and rejects it against any other closure event. The
   calendar is a committed artifact with a finite window; treating it as infinite is the assumption that fails once,
   quietly, at a year boundary.
6. **Implement the as-of fence as a slice, not a rule.** The committed bar row shape is **not closed at seven
   fields**, and the reader validates it rather than assuming it. Measured over all 292 committed series the row
   takes **three** forms — `{ t, o, h, l, c, v, ac }` on 147,337 rows, `{ t, o, h, l, c, v }` on 2,675, and a
   12-key variant carrying six `source*` provenance fields on 26 — so `readBars` requires the **six** fields all
   three share (`t` integer and strictly ascending, plus `BAR_CORE_FIELDS` = `o, h, l, c, v` finite), validates `ac`
   as **OPTIONAL** (finite *if present*), and accepts unknown keys. *Two earlier revisions of this step were both
   wrong in opposite directions: the first asserted `{ t, o, h, l, c, v }` and omitted `ac` entirely, which is
   precisely how the price-basis gap of Ruling R-04-01 went unnoticed; the second asserted a closed **seven**-field
   shape, which would throw on the 54 real series carrying no `ac` and on the 26-row provenance variant — see Ruling
   **R-04-02**.* A malformed file **throws** rather than closing a claim `not-evaluable`: refusals are reserved for
   facts about the CLAIM, never for our own broken substrate. `t` is the regular-session open in epoch milliseconds. *Dated observation on
   `data/bars/SPY.json`:* the tree is delta-appended on every refresh, so any row count or `asof` recorded here is
   stale by design within days; it is **not** carried into any test, fixture, DoD item, or source literal.
   Because the regular open is `14:30Z` (EST) or `13:30Z` (EDT) — both inside the same UTC calendar day as the ET
   session — the session date is the UTC calendar date of `t`. That coincidence is load-bearing, so it is
   **asserted rather than assumed**: each derived session date is cross-checked against
   `calendar.rows[].regular.startUtc` and a mismatch refuses.
   `readable(claim) = { row ∈ bars.rows : sessionDate(row.t) ≤ claim.horizon.resolutionDate }` is computed **once,
   before** predicate evaluation, and the evaluator is handed only that slice. Any attempt to consult a row outside
   the slice is `RTR-LOOKAHEAD`.
7. **Distinguish "not yet resolvable" from "tried to read the future".** If `bars.asof < claim.horizon.resolutionDate`
   the outcome is simply not observable yet: the claim stays `active`, no event is appended, and **no code fires**.
   Conflating the two would make `RTR-LOOKAHEAD` fire on every routine run and train everyone to ignore it.
8. **Implement the four predicate evaluators** against the fenced slice — the kinds are `PREDICATE_KINDS`
   (`rlclaims.js:61`) and the comparators `PREDICATE_COMPARATORS` (`:62`), both read rather than restated. The
   return is `ret(x) = (basisAt(resolutionDate) / basisAt(entryDate) − 1) × 100` in `percent-return`
   (`MAGNITUDE_UNITS`, `:64`):
   `threshold` → `cmp(ret(subject), predicate.value)`;
   `relative` → `cmp(ret(subject) − ret(reference), predicate.value)`;
   `directional` → `direction × ret(subject) > flatBandFor(claim)`;
   `spread` → `cmp(ret(subject.leg) − ret(reference.leg), predicate.value)`.

   **`basisAt` reads the claim's frozen `priceBasis` term — Ruling R-04-01 is DISCHARGED and this scope still selects
   no basis of its own.** Rows carry both `c` and `ac`; ~74% of committed series have `ac !== c` with divergence to
   57%; and BUG-012 established the refresh cron **retroactively rewrites `ac`**. Scope 01 has landed the frozen
   hashed term, so `basisAt` binds it to a row field through the shipped `priceBasisFor` (`rlclaims.js:802`) and
   `PRICE_BASIS_ROW_FIELD` (`:79`), naming neither `c` nor `ac` here; a claim carrying no such term **refuses**
   rather than defaulting. No `ret(x)`-dependent DoD item is blocked any longer. *An earlier revision of this clause
   read "is BLOCKED on Ruling R-04-01" after the term had shipped — see Ruling **R-04-04**.* `SIGN_CONVENTIONS`
   (`rlclaims.js:65`) is **not** a substitute: it fixes the sign convention, not the series.

   **Point comparators** (`gte`, `lte`, `gt`, `lt`) evaluate once, at `resolutionDate`. **Path comparators**
   (`crosses-above`, `crosses-below`) evaluate over every session in `[entryDate, resolutionDate]` using `h` and `l`,
   so they require the **complete** intervening session set; a gap closes the claim `unresolved`, reason
   `path-incomplete`, because a path predicate evaluated over a partial path is a *different* predicate and silently
   doing that would break HC-6. A required session missing from the slice is `unresolved`, reason `session-absent` —
   never an interpolation. Both reasons are already the coded pair for `unresolved` in `CLOSURE_REASON_CODES`
   (`rlclaims.js:307`), so `buildResolution` rejects either against any other closure event without this scope
   adding a check.

   **A path comparator on `adjusted-close` is STRUCTURALLY UNRESOLVABLE and refuses — it does not close.** The
   session extremes `h` and `l` are quoted against the raw close only; `PRICE_BASIS_ROW_FIELD` binds
   `adjusted-close` to `ac`, and no adjusted extreme exists on any row. Dividing a raw high by an adjusted entry
   close would fabricate a return from two different series, which is the untraceable substitution R-04-01 exists to
   prevent. So `basisCarriesPathExtremes` is **derived** — the basis supports a path exactly when its row field is a
   member of `BAR_CORE_FIELDS`, never a second list of basis names — and a `crosses-above` / `crosses-below` claim
   minted with `priceBasis: adjusted-close` refuses `RTR-PRICE-BASIS` / `path-extremes-absent-for-basis` at
   `scripts/brief-resolve-outcomes.mjs:1034`. This is a **refusal**, not a closure: an unresolvable combination is a
   defect in the minted claim, and scoring it on a substituted series would be worse than refusing it. Ruling
   **R-04-05** records that no DoD item covered this until now.
9. **Apply the data-quality gates.** A bars file may carry `reconstructedSessions`, `thinObservedSessions` and
   `zeroObservedSessions`, and the gate reads whichever are present. **Presence is not universal and must not be
   assumed:** on 2026-08-18, 291 of the 293 files matching `data/bars/*.json` carried all three, and the two that
   did not were `data/bars/index.json` (the refresh manifest, not a series) and `data/bars/NDX.json` (a genuine
   series with none of the three). A gate that dereferenced the arrays unconditionally would throw on `NDX`, so an
   absent array is read as empty rather than as a missing input. Those figures are a **dated observation, not a
   constant**, and no test asserts them. If the `entryDate` or `resolutionDate` session appears in
   `zeroObservedSessions`, the claim closes
   `not-evaluable`, reason `zero-observed-session` (a `RESOLVER_NOT_EVALUABLE_REASONS` member, `rlclaims.js:298`). A
   `reconstructedSessions` or `thinObservedSessions` hit does **not** block resolution but is recorded verbatim in
   the resolution object's `provenance`, so a reader can see that an outcome rests on a repaired bar. The
   `provenance` block is **hashed**, so `buildResolution` (`rlclaims.js:1003`) refuses any `RUN_SCOPED_KEYS` member
   (`:259` — `runId`, `resolvedAt`, `computedAt`, `generatedAt`, `observedAt`) inside it; run-scoped facts go in
   `lifecycleBinding`, which is deliberately outside the hash.
10. **Compute the outcome magnitude as `outcomeValue = direction × ret(subject)`**, with `direction` frozen into the
    claim from `ACTION_DIRECTION` (`rlcontracts.js:720`). Multiplying by it is the only reason
    `rlvSummarizeOutcomes`' `value > 0` win test (`rlvalidation.js:136`) is meaningful for bearish claims: without
    it, every correct `trim` or `hedge` would score as a loss. That citation is **motivation only** — `rlvalidation.js`
    is not imported here and no statistic is computed in this scope. `direction === 0` (`hold`) closes
    `not-evaluable`, reason `neutral-direction-no-magnitude` — already a `MINT_REFUSALS` member
    (`rlclaims.js:89`) — because assigning it a sign would invent a direction the action family explicitly declines
    to take. Values are stored **unrounded** as IEEE-754 doubles, with rounding applied only at render;
    `classifyOutcome` (`rlclaims.js:795`) already carries the value through verbatim and this scope must not
    pre-round it before the call. **This step is unblocked for the same reason step 8 is:** Ruling R-04-01 is
    discharged and `ret(subject)` reads the claim's frozen basis. *An earlier revision read "This step is blocked on
    Ruling R-04-01" after the term had shipped — see Ruling **R-04-04**.*
11. **Record closure event and outcome class as two independent axes.** The **closure event** is decided solely by
    the frozen predicate and is drawn from `CLOSE_EVENT_TYPES` (`rlcontracts.js:726`), read through
    `readClosureEventVocabulary` (`rlclaims.js:944`) rather than restated; the **`outcomeClass`** is decided solely
    by `classifyOutcome` (`rlclaims.js:795`) against the claim's frozen band from `flatBandFor` (`:767`). A
    `satisfied` claim can therefore carry a **negative** `outcomeValue`, and both facts are preserved —
    `buildResolution` enforces the admissible pairings from `OUTCOME_CLOSURE_EVENTS` (`:284`) rather than letting
    either axis derive the other. `withdrawn` is **never** resolver-emitted, and it is already **derived** rather
    than restated: it is the residue of the source vocabulary that no `OUTCOME_CLOSURE_EVENTS` class admits.
    Withdrawal is an authoring act, and a resolver that could withdraw a claim could withdraw the ones it was about
    to score badly. `not-evaluable` closes at the **first** resolver pass after minting, not at horizon expiry,
    because parking a known-unscoreable claim in the open pipeline misrepresents the pipeline.
12. **Route closures through the existing reducer.** Closures enter through `run.closures`, the path the reducer's own
    contract documents. Five verified behaviours constrain the call: `run.closures` must be an array
    (`rlcontracts.js:1271`); closures are sorted by `originRecommendationKey` before processing (`:1272`), so the
    resolver must not depend on its own input order; a type outside `CLOSE_EVENT_TYPES` fails
    `recommendation-closure-type-invalid` (`:1279`), which is the `RTR-CLOSURE-VOCAB` condition scope 03 already
    codes at `rlclaims.js:267`; an absent key fails `recommendation-closure-key-absent` (`:1281`); and a key present
    in the same run's proposals fails `recommendation-closure-still-active` (`:1282`), so the resolver calls the
    reducer with **`current: []`** — it is a closing pass, never a proposing pass. The reducer re-emits the claim's
    **original frozen terms** on the closure (`:1283`) before setting `closureEntry.state = "closed"` (`:1284`),
    which is HC-6 holding at the lifecycle layer too.
13. **Derive the reducer key bridge, never author it.** `originRecommendationKey` is computed by calling
    `deriveRecommendationKeys` (`rlcontracts.js:1040`) on terms assembled from the claim's **hashed**
    `thesisFamily` / `subject` / `actionFamily` / `horizon` (scope 01) plus the `originToolId` **pipeline
    constant** `market-brief`, exactly as the foundation intends (*"Authors never own identity"*,
    `rlcontracts.js:1037`). Per the 2026-08-18 Claim-Identity Reconciliation there is no `lifecycleTerms` block to
    read from: that block is **withdrawn**, `thesisFamily` is a top-level hashed claim field, and `originToolId` is
    not a claim field at all. The constant is asserted against the registry — `tools.json` carries
    `experience.kind === "market-action-center"` exactly once, on the tool whose `id` is `market-brief` — rather
    than hard-coding a second copy of the string; `resolveCitedToolId` (`rlclaims.js`, exported) is the shipped
    reader for that lookup. Because every varying term of the derived key is inside `claimHash`, the bridge is a
    **refinement**: one claim object can only ever derive one reducer key. The derived key is recorded in the
    resolution object as `lifecycleBinding.originRecommendationKey` — `lifecycleBinding` is a
    `RESOLUTION_UNHASHED_FIELDS` member (`rlclaims.js:250`), so this placement is the shipped contract rather than a
    choice — and is **not** added to `claimHash`'s term list, so scope 01's contract stays frozen and byte-stable.
    **Routed finding P-015-03 is RESOLVED and no longer gates this step** — `thesisFamily` is authored; when it is
    absent the claim mints `not-evaluable` (`no-authored-thesis-family`, a `MINT_REFUSALS` member) and **no** closure
    event is emitted, so the reducer is never called with a fabricated key and this scope still invents no value for
    it. The ruling implemented is recorded in `report.md`.
14. **Enforce idempotence upstream of the reducer, by state.** The reducer does **not** self-enforce it:
    `lifecycleEventId` hashes `runId` (`rlcontracts.js:1109`) so the same closure on two days yields two different
    `eventId`s; the `seenEvent` dedup is within-run only (`:1305`–`:1308`); and the closure block checks for an
    absent entry (`:1281`) and a still-active entry (`:1282`) but **not** for an already-closed one. Three layers:
    the **due-set gate** (`state === "active"`) is the mechanism, not a check bolted on afterwards; the
    **`indexFingerprint`** (`rlcontracts.js:1318`, computed over `{ contractVersion, entries }` only, excluding
    `runId` and `canonicalMonth`) is the byte-identical oracle; and **content-addressed resolution objects** are the
    backstop. That third layer is entirely scope 03's: `writeResolutionObject` (`rlclaims.js:1109`) already reuses
    identical bytes and already aborts a byte-changing write with `RTR-RESOLUTION-CONFLICT` (`:269`) without
    overwriting. This scope **calls** it; it does not re-implement the conflict check, does not compute a path from
    `RESOLUTION_STORE_DIR` (`:244`) itself, and does not write to that directory by any other route.
15. **Consume the closed `not-evaluable` reason set — it has ELEVEN members, not six.** *An earlier revision of this
    step listed six and prose elsewhere said seven.* `NOT_EVALUABLE_REASONS` (`rlclaims.js:305`) is **derived**, not
    restated: it is the sorted union of the 8 `MINT_REFUSALS` (`:89` — `non-semantic-subject`,
    `no-authored-subject`, `no-committed-series`, `no-authored-thesis-family`, `no-authored-horizon`,
    `no-authored-predicate`, `neutral-direction-no-magnitude`, `no-authored-flat-band`) and the 3
    `RESOLVER_NOT_EVALUABLE_REASONS` (`:298` — `no-committed-reference`, `zero-observed-session`,
    `calendar-coverage-exhausted`), the latter being exactly the reasons that cannot be known at mint because they
    are properties of the **observations** rather than of the authored claim. Only those **three** are this scope's
    to raise; the other eight arrive already set on the minted claim and are carried through. The resolver reads the
    set from the export and **never restates a list of its own**, which is what guarantees a ninth mint reason can
    never land as an unrecordable outcome whose claim then falls out of the accounting. Each reason carries a
    human-readable sentence for the Power ledger; the claim is excluded from rate denominators and **remains visibly
    counted** in the coverage line.
16. **Extend the fixture substrate** at `tests/fixtures/recommendation-track-record/bars/**` and `.../calendar/**`
    with synthetic bar series and calendar slices covering each predicate kind, the fence boundary, the path gap,
    each of the three resolver-raised `not-evaluable` reasons plus representative mint-set reasons, the
    `early-close` horizon case, and — R-04-01 having landed — a `c`-vs-`ac` divergent series that scores differently
    under each basis. **Bar fixtures exercise the row-shape variation the reader validates, not one canonical
    shape:** at least one fixture carries `{ t, o, h, l, c, v, ac }` and at least one carries no `ac` at all, which
    the shipped `RAWONLY` fixture already does — it is what makes the `adjusted-close` refusal provable. *An earlier
    revision required every fixture to carry "the full **seven**-field row shape", which the shipped `RAWONLY`
    fixture already contradicted and which would leave the 2,675 real `ac`-free rows unexercised — see Ruling
    **R-04-02**.* One rule
    violated per negative fixture; every fixture carries explicit dates and no fixture reads a clock. **These
    fixtures are the only substrate this scope has:** `briefs/objects/claims/` and `briefs/objects/resolutions/` do
    not exist, and `claimRef` appears in 0 of 5,083 committed rows, so a real-data run proves nothing here.
17. **Extend `tests/recommendation-track-record.unit.mjs`, `.functional.mjs`, `.integration.mjs` and
    `.e2e.mjs`** with this scope's named cases. *An earlier revision said "create `.e2e.mjs`"; it already exists*,
    alongside `.canary.mjs` and `.support.mjs`, so every file in this row is extended and none is created.


---

## Test Plan

Every negative row asserts the **exact** refusal string plus its companion field. The idempotence pair is
deliberately non-tautological: case 2 is an **acceptance** assertion, so it fails if someone hardens the reducer
without telling the resolver, and case 1 fails the moment the due-set predicate is loosened.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-04-U1 | Unit | `unit` | BS-002, BS-003 | `tests/recommendation-track-record.unit.mjs` | All four predicate kinds evaluate correctly against a fenced slice — `threshold`, `relative` (subject minus reference over the same window), `directional` (against the band returned by `flatBandFor`, never a band passed in), and `spread` (leg minus leg) — each with a satisfied and an invalidated fixture. **`basisAt` reads the field named by the claim's frozen `priceBasis` term; a fixture omitting the term refuses rather than defaulting.** Unblocked: Ruling R-04-01 is discharged. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u1` |
| T-04-U2 | Unit | `unit` | BS-002, BS-003 | `tests/recommendation-track-record.unit.mjs` | Point comparators evaluate **once** at `resolutionDate`; path comparators (`crosses-above`, `crosses-below`) evaluate over every intervening session using `h` and `l`, and a **gap** in the intervening set closes `unresolved` reason `path-incomplete` rather than evaluating over the partial path. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u2` |
| T-04-U3 | Unit | `unit` | BS-002, BS-003 | `tests/recommendation-track-record.unit.mjs` | Closure event and outcome class are independent: a claim whose predicate is **satisfied** but whose direction-adjusted magnitude is **negative** records `closureEventType: "satisfied"` **and** `outcomeClass: "loss"`. An implementation deriving one axis from the other fails this row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u3` |
| T-04-U4 | Unit | `unit` | BS-002 | `tests/recommendation-track-record.unit.mjs` | `RTR-CLOSURE-VOCAB` fires with its exact code when a closure event outside `CLOSE_EVENT_TYPES` is constructed (`"partially-satisfied"`) — raised by the **already-shipped** `buildResolution` (`rlclaims.js:1003`, code at `:267`), asserting the resolver neither re-implements the check nor extends the vocabulary locally. `rlcontracts.js` and `rlclaims.js` are asserted unmodified by `git diff --quiet` exiting 0. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u4` |
| T-04-U5 | Unit | `unit` | BS-007 | `tests/recommendation-track-record.unit.mjs` | The fence is structural: the slice handed to the evaluator contains **no** row dated after `resolutionDate`, an attempt to consult one fires `RTR-LOOKAHEAD`, **and** the distinct case `bars.asof < resolutionDate` is a **silent skip** that leaves the claim `active` with zero events appended — proving skip and refusal are not conflated. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u5` |
| T-04-U6 | Unit | `unit` | BS-010 | `tests/recommendation-track-record.unit.mjs` | The reason vocabulary is read from `NOT_EVALUABLE_REASONS` (`rlclaims.js:305`) and its length asserted to equal `MINT_REFUSALS.length + RESOLVER_NOT_EVALUABLE_REASONS.length` — **eleven** today, and the row states no literal so an added mint reason cannot silently go unexercised. *An earlier revision asserted six.* Each of the **three** resolver-raised reasons (`no-committed-reference`, `zero-observed-session`, `calendar-coverage-exhausted`) fires for its own trigger and only its own; each of the eight mint reasons is carried through unaltered; each carries a human-readable sentence. A subject naming a symbol absent from `enumerateCommittedSeries(readdir(BARS_DIR))` — **never `index.json`, and never a count literal** — closes `no-committed-series`, while a `relative` claim with a missing reference closes `no-committed-reference`. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u6` |
| T-04-U7 | Unit | `unit` | BS-002, BS-003 | `tests/recommendation-track-record.unit.mjs` | `outcomeValue = direction × ret(subject)`: a **correct bearish** claim (`trim`, `direction: -1`) on a series that fell produces a **positive** outcome, and a wrong one produces a negative outcome — the adapter without which every correct bearish call would score as a loss under `rlvalidation.js:136` (motivation only; the module is not imported). `hold` (`direction: 0`) closes `neutral-direction-no-magnitude`. The class is assigned by calling `classifyOutcome` (`rlclaims.js:795`), asserting the resolver does not re-derive the band comparison. Unblocked: Ruling R-04-01 is discharged, so the `ret(subject)` half reads the claim's frozen basis. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u7` |
| T-04-U8 | Unit | `unit` | BS-002, BS-003 | `tests/recommendation-track-record.unit.mjs` | **Price basis is frozen on the claim, never chosen by the resolver (Ruling R-04-01).** A fixture series whose `c` and `ac` diverge scores **differently** under each basis, and the row asserts the resolver reads the claim's frozen `priceBasis` term rather than picking one: a claim carrying no such term refuses (`RTR-PRICE-BASIS`, resolver-**owned** per Ruling R-04-05) instead of defaulting, and two claims differing only in basis produce two distinct `resolutionHash` values. The hashed `provenance` additionally records a fingerprint of the exact basis values read at `entryDate` and `resolutionDate`, so a retroactive `ac` rewrite (BUG-012) **moves the content address** — the rewritten reading is written at a second address, both records survive, and the first is byte-unchanged. Unblocked: scope 01 has landed the term. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u8` |
| T-04-F1 | Functional | `functional` | BS-007 | `tests/recommendation-track-record.functional.mjs` | Horizon expiry is session arithmetic: a Friday `next-session` claim resolves the following Monday, not Saturday; a claim spanning a `holiday` resolves one session later than day arithmetic says; and each derived session date is cross-checked against `calendar.rows[].regular.startUtc` with a mismatch refusing. **Includes the `early-close` case (P-015-07)** — a `next-session` claim proposed the session before `2026-11-27` or `2026-12-24` must resolve **on** that early-close session, not skip it, and the resolution must record `provenance.earlyCloseSessions: [<tradingDate>]`. Keying the session test on `dateState` instead of `regular !== null` is the D4-owned `RTR-SESSION-PREDICATE` and is asserted to refuse; the derived 2026 session count is **251**. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-f1` |
| T-04-F2 | Functional | `functional` | BS-007 | `tests/recommendation-track-record.functional.mjs` | `RTR-CALENDAR-COVERAGE` fires with its exact code when a horizon expiry lands beyond `coverageEnd`, the claim closes `not-evaluable` reason `calendar-coverage-exhausted`, and **no** date is extrapolated past the committed window. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-f2` |
| T-04-F3 | Functional | `functional` | BS-002, BS-003 | `tests/recommendation-track-record.functional.mjs` | `withdrawn` is **never** resolver-emitted: no resolver path can construct it, asserted across every predicate kind and every failure branch, including a claim the resolver was about to score as a large loss. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-f3` |
| T-04-F4 | Functional | `functional` | BS-010 | `tests/recommendation-track-record.functional.mjs` | Data-quality gates: an `entryDate` or `resolutionDate` in `zeroObservedSessions` closes `not-evaluable` reason `zero-observed-session`, while a `reconstructedSessions` or `thinObservedSessions` hit **resolves normally** and is recorded verbatim in the resolution object's `provenance`. Blocking on a reconstructed bar would fail the row. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-f4` |
| T-04-I1 | Integration | `integration` | BS-002, BS-003 | `tests/recommendation-track-record.integration.mjs` | The closure enters through `run.closures` with `current: []`, `reduceRecommendationEvents` returns `ok`, exactly one event is appended per due claim, the entry's `state` becomes `"closed"`, and the closure event carries the claim's **original frozen terms**. Calling with a non-empty `current` containing the same key is asserted to fail `recommendation-closure-still-active`, proving the closing-pass discipline is necessary. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-04-i1` |
| T-04-I2 | Integration | `integration` | BS-009 | `tests/recommendation-track-record.integration.mjs` | **Idempotence case 1 — the gate holds.** Pass 2 over an unchanged ledger yields `run.closures.length === 0`, zero appended events, zero new resolution objects, and an `indexFingerprint` **byte-identical** to pass 1. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-04-i2` |
| T-04-I3 | Integration | `integration` | BS-009 | `tests/recommendation-track-record.integration.mjs` | **Idempotence case 2 — the adversarial half.** Feeding `reduceRecommendationEvents` a second closure for an **already-closed** entry, bypassing the due-set gate, asserts the reducer **accepts** it and the `indexFingerprint` **changes**. This is an acceptance assertion on purpose: it fails if the reducer is hardened without telling the resolver, and it is what proves case 1 is load-bearing rather than incidental. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-04-i3` |
| T-04-I4 | Integration | `integration` | BS-009 | `tests/recommendation-track-record.integration.mjs` | `RTR-RESOLUTION-CONFLICT` fires with its exact code when a second resolution for the same `claimHash` would produce different bytes at the same content-addressed path, and the on-disk bytes are asserted **unchanged** afterwards. Raised by the **already-shipped** `writeResolutionObject` (`rlclaims.js:1109`, code at `:269`), asserting the resolver calls it rather than writing to `RESOLUTION_STORE_DIR` by any other route. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-04-i4` |
| T-04-I5 | Integration | `integration` | BS-010 | `tests/recommendation-track-record.integration.mjs` | **Scope 02's gate is called, not bypassed.** A resolution written against a ledger row carrying no `claimRef` refuses with `RTR-LEGACY-BACKFILL` (`rlclaims.js:196`, raised by `authorizeResolutionWrite` at `:733`/`:721`) **before** the resolution is inspected in any way, proving a complete and entirely plausible resolution cannot rescue a claimless row; a malformed row still refuses as malformed rather than as legacy; and a resolution whose `claimHash` disagrees with the row's `claimRef` refuses. Nothing is written on any of the three paths. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-04-i5` |
| T-04-E1 | E2E | `e2e` | BS-002, BS-003, BS-010 | `tests/recommendation-track-record.e2e.mjs` | A full resolve pass over a fixture ledger containing a mix of satisfiable, invalidatable, expiring, path-incomplete and not-evaluable claims produces exactly one closure per due claim, leaves not-yet-due claims `active`, writes one resolution object per closure, and the class partition identity holds over the result. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-04-e1` |
| T-04-V1 | Functional | `functional` | BS-007 | `tests/recommendation-track-record.functional.mjs` | `RTR-NETWORK` fires when the resolver module's source references `fetch(`, `providerFetch(`, `rlProviderConfig`, or any socket/credential surface, and the clean module is asserted to reference none of them — the same idiom as the repo's existing `rlvalid-node-safe-no-dom-storage-network` assertion. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-v1` |
| T-04-R1 | Regression E2E | `e2e` | SCN-015-002, SCN-015-003, SCN-015-007, SCN-015-009, SCN-015-010 | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for all five owned scenarios.** A second, permanently-retained resolve pass re-asserts end to end that a satisfied claim resolves positive and an invalidated one negative, that the as-of fence still excludes every future row with `RTR-LOOKAHEAD` firing on an attempt while `bars.asof < resolutionDate` stays a silent skip, that a re-run yields zero closures and a byte-identical `indexFingerprint`, and that a claim with no committed series still closes `not-evaluable`. Unlike `T-04-E1`, which proves the first pass, this row is the standing guard that re-runs on every later scope's pass, so a later change to the reducer bridge, the calendar predicate, or the due-set gate fails here. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-04-r1` |
| T-04-R2 | Regression E2E | `e2e` | SCN-015-009 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the resolver lands, with no pre-existing test removed, skipped, or newly failing — the proof that routing closures through `reduceRecommendationEvents` with `current: []` left every existing lifecycle consumer of `rlcontracts.js` intact rather than only satisfying 015's own fixtures. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-04-r2` |
| T-04-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test reports **`0 failed`** and a passed count **greater than or equal to** the literal baseline captured immediately before this scope's first change and recorded verbatim in `report.md`. *An earlier revision required `baseline + N` with both `baseline` and `N` unbound, which no reader could decide.* Both operands are now literals at check time: the baseline is pinned in `report.md` and the observed count comes from this run's raw output. | `node scripts/selftest.mjs` | No | `report.md#t-04-s1` |

**Test Plan rows: 22.** (Was 20; **T-04-U8** adds the R-04-01 price-basis row and **T-04-I5** adds the
`authorizeResolutionWrite` gate row, a scope 02 surface the earlier plan referenced zero times.)

---

### Definition of Done

#### Core items

- [x] `scripts/brief-resolve-outcomes.mjs` exists, runs offline from committed repository state only, and references no `fetch`, socket, provider key, or `RLDATA` browser fetch path.

  **Evidence — offline purity, verified against the shipped module.** Executed from `<repo-root>`.

  ```
  $ test -f scripts/brief-resolve-outcomes.mjs && wc -c < scripts/brief-resolve-outcomes.mjs
  83955
  exit code: 0

  $ grep -nE 'fetch\(|providerFetch|rlProviderConfig|XMLHttpRequest|WebSocket|RLDATA' scripts/brief-resolve-outcomes.mjs
  exit code: 1

  $ grep -nE 'child_process|process\.env|node:(net|http|https|tls|dgram)' scripts/brief-resolve-outcomes.mjs
  exit code: 1
  ```

  Two empty greps are the whole claim: no browser fetch path, no provider-key surface, no socket module, and
  no `process.env` or `child_process` escape hatch through which off-repository state could enter. The
  scanner-backed half is `T-04-V1`, which runs the module and proves the scanner can flag each surface — so
  the empty grep above is a measured absence rather than a scanner that flags nothing:

  ```
  $ node --test tests/recommendation-track-record.e2e.mjs
  ✔ T-04-V1: the shipped resolver reaches no network, host or credential, under a scanner proven able to flag each and to ignore prose (326.003603ms)
  ℹ tests 7
  ℹ pass 7
  ℹ fail 0
  exit code: 0
  ```

  Every one of the seven E2E cases resolves from committed fixture and calendar bytes with the network
  surface absent, which is the "runs offline from committed repository state only" half executed rather
  than asserted.
- [ ] **The resolver CONSUMES scope 03's shipped exports and re-implements none of them.** `classifyOutcome`, `flatBandFor`, `outcomeContributionFor`, `buildResolution`, `resolutionHash`, `resolutionObjectPath`, `serializeResolution`, `writeResolutionObject`, `authorizeResolutionWrite`, `enumerateCommittedSeries`, `readClosureEventVocabulary`, `CLOSURE_REASON_CODES`, `NOT_EVALUABLE_REASONS`, `OUTCOME_CLOSURE_EVENTS`, `OUTCOME_CLASSES` are imported from `rlclaims.js` and called; no second copy of any of them exists in 015-authored code. *Left unticked: **four** of the fifteen named exports have **zero** references anywhere in `scripts/brief-resolve-outcomes.mjs` — `outcomeContributionFor`, `serializeResolution`, `readClosureEventVocabulary` and `OUTCOME_CLASSES`. Verified by `grep -c "\bNAME\b"` per name over the resolver; the other eleven return 1..7. The namespace import at `:42` (`const claims = require('../rlclaims.js')`) makes all fifteen **importable**, so the failing conjunct is "and called", not "imported". See Ruling **R-04-08**.*
- [x] **Scope 02's write gate is called, never bypassed.** Every resolution write goes through `writeResolutionObject`, which calls `authorizeResolutionWrite` (`rlclaims.js:733`) first; a claimless row refuses `RTR-LEGACY-BACKFILL` before the resolution is inspected, and nothing in `briefs/objects/resolutions/` is written by any other route.

  **Evidence — increment 3 (write slice, commit `c8665265f`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/*.integration.mjs
  ✔ T-04-I5 (increment 3): the write runs scope 02 gate first, so a claimless row is unscoreable and nothing reaches the store (83.755126ms)
  ℹ tests 33
  ℹ pass 33
  ℹ fail 0
  exit code: 0
  ```

  The single write route and the refusal, located in the executed sources rather than asserted in prose:

  ```
  $ grep -nE "claims.writeResolutionObject\(built.resolution|LEGACY_BACKFILL_CODE, 'code'|existsSync\(storeDir\), false, 'and the store" scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.integration.mjs
  scripts/brief-resolve-outcomes.mjs:682:  const write = claims.writeResolutionObject(built.resolution, row, ports);
  tests/recommendation-track-record.integration.mjs:414:        assert.equal(refused.error.code, claims.LEGACY_BACKFILL_CODE, 'code');
  tests/recommendation-track-record.integration.mjs:417:        assert.equal(existsSync(storeDir), false, 'and the store directory is never even created');
  exit code: 0
  ```

  `recordResolution` reaches the store through `writeResolutionObject` and by no other route — that one call is
  the whole write path. The adversarial input is the **same complete, valid record** the anti-vacuity half writes
  cleanly, so no property of a well-formed resolution can rescue a claimless row; the refusal is
  `RTR-LEGACY-BACKFILL` / `claimless-row-unscoreable` and the store directory is asserted never even created.
- [x] The committed symbol set is `enumerateCommittedSeries(readdir(BARS_DIR))` — the **directory listing** availability set, never `data/bars/index.json` (a curation set) and never a count literal. — Evidence: `scripts/brief-resolve-outcomes.mjs:328` is `claims.enumerateCommittedSeries(readdirSync(path.join(base, claims.BARS_DIR)))`, live via the `loadSubjectBars` default argument at `:369`; `grep -nE "index\.json|\b289\b|\b292\b"` over the resolver returns matches on comment lines `208, 254, 288, 310, 311` only — no executable line reads the manifest or pins a count.
- [x] The due set is computed from reduction state (`entry.state === "active"` ∧ has a `claimRef` ∧ `resolutionDate ≤ asOfDate`), never by scanning the ledger for timestamps. — Evidence: `dueEntryKeys` (`scripts/brief-resolve-outcomes.mjs:1572`, called at `:1652`) iterates the reduction `entries` and applies exactly the three gates — `entry?.state !== LIVE_ENTRY_STATE` (`:1602`, constant `'active'` at `:1458`), `binding.claimRef === null` (`:1603`), `resolutionDate > asOfDate` (`:1612`); no ledger row or timestamp is scanned in the function.
- [x] `resolutionDate` is derived by **calendar-session** arithmetic against `data/calendars/xnys/calendar.json`, never by adding calendar days, and each derived session date is cross-checked against `calendar.rows[].regular.startUtc`.

  **Evidence — increment 1 (calendar slice, commit `cd1d0d595`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.functional.mjs
  ✔ T-04-F1 (increment 1): a trading session is a non-null regular block, and horizon arithmetic counts sessions rather than days (9.99118ms)
  ✔ T-04-F2 (increment 1): RTR-CALENDAR-COVERAGE refuses past the committed window and extrapolates nothing (5.749089ms)
  ℹ tests 11
  ℹ pass 11
  ℹ fail 0
  exit code: 0
  ```

  The two facts this item names, located in the executed sources rather than asserted in prose:

  ```
  $ grep -nE "startUtc\) !== epochMs|advanceSessions\(calendar, '2026-01-02'|advanceSessions\(calendar, '2026-01-16'|session-open-mismatch', field" scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.functional.mjs
  scripts/brief-resolve-outcomes.mjs:175:  if (Date.parse(row.regular.startUtc) !== epochMs) {
  tests/recommendation-track-record.functional.mjs:1136:    assert.equal(advanceSessions(calendar, '2026-01-02', 1).tradingDate, '2026-01-05', 'a Friday next-session claim resolves on Monday');
  tests/recommendation-track-record.functional.mjs:1139:    assert.equal(advanceSessions(calendar, '2026-01-16', 1).tradingDate, '2026-01-20', 'a claim spanning a holiday resolves one session later than day arithmetic says');
  tests/recommendation-track-record.functional.mjs:1171:        { code: SESSION_PREDICATE_CODE, reason: 'session-open-mismatch', field: 'observation.t' },
  exit code: 0
  ```

  `advanceSessions` counts sessions — a Friday `next-session` claim lands on Monday `2026-01-05` and a claim spanning
  the `2026-01-19` holiday steps over it — and `sessionDateForEpoch` cross-checks each derived session date against
  that row's `regular.startUtc` for **exact** equality, refusing `session-open-mismatch` one millisecond past the open.

- [x] **Routed finding P-015-07 is RESOLVED and is implemented, not carried as blocking.** The trading-session test is `row.regular !== null`, not `dateState === "regular"`, yielding 251 sessions in 2026 (249 regular + 2 early-close); keying on `dateState` is the D4-owned `RTR-SESSION-PREDICATE` refusal. The implemented ruling is recorded in `report.md`.

  **Evidence — increment 1 (calendar slice, commit `cd1d0d595`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.functional.mjs
  ✔ T-04-F1 (increment 1): a trading session is a non-null regular block, and horizon arithmetic counts sessions rather than days (9.99118ms)
  ℹ tests 11
  ℹ pass 11
  ℹ fail 0
  exit code: 0
  ```

  The predicate, both counts, and the refusal of the rejected rule, located in the executed sources:

  ```
  $ grep -nE "251, '2026 carries|249 — the two it drops|'date-state'\)|row.regular !== null\) tradingDates" scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.functional.mjs
  scripts/brief-resolve-outcomes.mjs:119:    if (row.regular !== null) tradingDates.push(row.tradingDate);
  tests/recommendation-track-record.functional.mjs:1122:    assert.equal(sessions.tradingDates.length, 251, '2026 carries 251 sessions');
  tests/recommendation-track-record.functional.mjs:1123:    assert.equal(byDateState.length, 249, 'and the dateState rule finds 249 — the two it drops are genuine sessions');
  tests/recommendation-track-record.functional.mjs:1127:        sessionsBy(calendar, 'date-state'),
  exit code: 0
  ```

  The implemented predicate is the non-null `regular` block; the derived counts are **251** and **249**; and
  `sessionsBy(calendar, 'date-state')` **refuses** `RTR-SESSION-PREDICATE` / `session-predicate-not-allowed` rather
  than merely going unused. The ruling implemented is recorded in [report.md](report.md).

- [ ] An `early-close` session **resolves normally and is flagged, not excluded**: when `entryDate` or `resolutionDate` falls on one, the resolution records `provenance.earlyCloseSessions: [<tradingDate>…]`.
- [x] `RTR-CALENDAR-COVERAGE` is implemented; a `resolutionDate` beyond `coverageEnd` refuses and closes `not-evaluable` reason `calendar-coverage-exhausted` with no extrapolation.

  **Evidence — the coverage refusal, located in the executed source.** Executed from `<repo-root>`.

  ```
  $ grep -nE "CALENDAR_COVERAGE_REASON = |RESOLVER_NOT_EVALUABLE_REASONS\.includes|refusal\(CALENDAR_COVERAGE_CODE, CALENDAR_COVERAGE_REASON, 'resolutionDate'\)" scripts/brief-resolve-outcomes.mjs
  59:export const CALENDAR_COVERAGE_REASON = 'calendar-coverage-exhausted';
  60:if (!claims.RESOLVER_NOT_EVALUABLE_REASONS.includes(CALENDAR_COVERAGE_REASON)) {
  152:  return refusal(CALENDAR_COVERAGE_CODE, CALENDAR_COVERAGE_REASON, 'resolutionDate');
  365:if (!claims.RESOLVER_NOT_EVALUABLE_REASONS.includes(ZERO_OBSERVED_REASON)) {
  854:if (!claims.RESOLVER_NOT_EVALUABLE_REASONS.includes(NO_COMMITTED_REFERENCE_REASON)) {
  exit code: 0
  ```

  `:60` is load-bearing: the reason is not a local string but is asserted at module load to be a member of the
  shipped `RESOLVER_NOT_EVALUABLE_REASONS`, so a rename in `rlclaims.js` throws here rather than silently
  minting a reason the ledger will not admit. `:152` is the refusal itself, returned rather than clamped —
  there is no fallback branch that extends the window.

  ```
  $ node --test tests/recommendation-track-record.functional.mjs
  ✔ T-04-F2 (increment 1): RTR-CALENDAR-COVERAGE refuses past the committed window and extrapolates nothing (19.451913ms)
  ℹ tests 13
  ℹ pass 13
  ℹ fail 0
  exit code: 0
  ```
- [x] The as-of fence is a **slice computed once before** predicate evaluation; the evaluator can only see readable rows, and `RTR-LOOKAHEAD` fires on any attempt to consult a row outside it.

  **Evidence — increment 2 (value slice, commit `30a9e2624`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U5 (increment 2): the as-of fence is a slice, and "not yet observed" is not "read the future" (11.154275ms)
  ℹ tests 28
  ℹ pass 28
  ℹ fail 0
  exit code: 0
  ```

  The slice and the refusal, located in the executed sources rather than asserted in prose:

  ```
  $ grep -nE "if \(utcDate > resolutionDate\)|return refusal\(LOOKAHEAD_CODE|past.error.code, LOOKAHEAD_CODE|fence.excluded.future > 0" scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.unit.mjs
  scripts/brief-resolve-outcomes.mjs:323:    if (utcDate > resolutionDate) { future += 1; continue; }
  scripts/brief-resolve-outcomes.mjs:355:    return refusal(LOOKAHEAD_CODE, 'observation-past-resolution-date', 'sessionDate');
  tests/recommendation-track-record.unit.mjs:2172:    assert.equal(fence.excluded.future > 0, true, 'and rows after it were excluded rather than absent');
  tests/recommendation-track-record.unit.mjs:2177:    assert.equal(past.error.code, LOOKAHEAD_CODE, 'code');
  exit code: 0
  ```

  `fenceObservations` drops every row dated after `resolutionDate` **before** the map exists, so a reader handed
  that map cannot reach a later row — the fence is the shape of the data, not a check to remember. The test walks
  the map's own keys and additionally asserts the excluded count is non-zero, so an empty slice cannot pass
  vacuously; a lookup past the fence refuses `RTR-LOOKAHEAD` / `observation-past-resolution-date`.
- [ ] **The bar row shape is VALIDATED, not assumed, and it is not closed at seven fields.** `readBars` requires the **six** fields all three measured row forms share (`t` integer and strictly ascending, plus `o, h, l, c, v` finite), validates `ac` as **OPTIONAL** (finite *if present*), and accepts unknown keys — because the committed substrate carries `{ t, o, h, l, c, v, ac }` on 147,337 rows, `{ t, o, h, l, c, v }` on 2,675, and a 12-key `source*` provenance variant on 26. A malformed file **throws** rather than closing a claim `not-evaluable`. Neither a six-field nor a seven-field closed shape is assumed anywhere in code or fixtures; *both were asserted by earlier revisions of this plan — see Ruling R-04-02.*
- [x] **Ruling R-04-01 is DISCHARGED — the price basis is read from the claim, never selected here.** `basisValueAt` resolves `c` vs `ac` from the claim's frozen hashed `priceBasis` term, which scope 01 has landed; a claim carrying no such term refuses rather than defaulting; and no `ret(x)`-dependent item in this DoD may be ticked on a basis this scope chose for itself.

  **Evidence — increment 2 (value slice, commit `30a9e2624`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-01-U8: priceBasis is a HASHED term, so the basis cannot be chosen after the outcome (11.968373ms)
  ✔ T-04-U8 (increment 2): the price basis is read from the frozen claim, and an absent basis refuses instead of falling back (45.941596ms)
  ℹ tests 28
  ℹ pass 28
  ℹ fail 0
  exit code: 0
  ```

  The binding and the refusal, located in the executed sources:

  ```
  $ grep -nE "const rowField = claims.PRICE_BASIS_ROW_FIELD|code: PRICE_BASIS_CODE|const basis = claims.priceBasisFor|substituted.error.code, PRICE_BASIS_CODE" scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.unit.mjs
  scripts/brief-resolve-outcomes.mjs:347:  const rowField = claims.PRICE_BASIS_ROW_FIELD[priceBasis];
  scripts/brief-resolve-outcomes.mjs:365:        code: PRICE_BASIS_CODE,
  scripts/brief-resolve-outcomes.mjs:418:  const basis = claims.priceBasisFor(claim);
  tests/recommendation-track-record.unit.mjs:2138:    assert.equal(substituted.error.code, PRICE_BASIS_CODE, 'code');
  exit code: 0
  ```

  Neither `c` nor `ac` is named by this scope: the row field comes from the shipped `PRICE_BASIS_ROW_FIELD` keyed
  by the claim's own frozen term, read through `priceBasisFor`. The `RAWONLY` fixture is the anti-vacuity half —
  it carries the **same** raw closes as `DVG`, so a fallback would have returned a perfectly plausible `+10` and
  nothing downstream could have told; instead an `adjusted-close` claim on it refuses `RTR-PRICE-BASIS` naming the
  exact row field it could not read, while the same series under `raw-close` resolves. The same two sessions score
  `+10` under one basis and `-10` under the other, so the frozen term decides the sign.
- [ ] **A retroactive `ac` rewrite is detectable, not silent — by a MOVED content address, not by a refusal.** The hashed `provenance` records a fingerprint of the exact basis values read at `entryDate` and `resolutionDate`, so a later rewrite (BUG-012) changes the resolution hash and the rewritten reading is written at a **second** address: both records survive, the first is byte-unchanged, and the divergence is the evidence. `RTR-RESOLUTION-CONFLICT` is the **different** case — an *unhashed* field changing at an *already-taken* address — and must not be asserted here; *an earlier revision of this item named it as the mechanism, which the code demonstrably does not raise — see Ruling R-04-03.*
- [ ] "Not yet resolvable" (`bars.asof < resolutionDate`) is a silent skip leaving the claim `active` with zero events appended — never an `RTR-LOOKAHEAD` refusal.
- [x] All four predicate kinds are implemented; point comparators evaluate once at `resolutionDate` and path comparators require the complete intervening session set, closing `unresolved` reason `path-incomplete` on a gap rather than evaluating a partial path.

  **Evidence — increment 4 (predicate slice, commit `65e47272b`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U1 (increment 4): all four predicate kinds evaluate, and the kind and comparator are bound to the frozen vocabularies (66.35991ms)
  ✔ T-04-U2 (increment 4): point and path comparators are different evaluations, and a path gap closes path-incomplete (18.598175ms)
  ℹ tests 33
  ℹ pass 33
  ℹ fail 0
  exit code: 0
  ```

  The two vocabulary bindings and the shipped reason, located in the executed source:

  ```
  $ grep -nE "bindToVocabulary\(claims\.PREDICATE_(KINDS|COMPARATORS)|^export function evaluatePredicate|^export const PATH_INCOMPLETE_REASON" scripts/brief-resolve-outcomes.mjs
  scripts/brief-resolve-outcomes.mjs:766:export const PATH_INCOMPLETE_REASON = 'path-incomplete';
  scripts/brief-resolve-outcomes.mjs:780:const COMPARATORS = bindToVocabulary(claims.PREDICATE_COMPARATORS, {
  scripts/brief-resolve-outcomes.mjs:894:const KINDS = bindToVocabulary(claims.PREDICATE_KINDS, {
  scripts/brief-resolve-outcomes.mjs:988:export function evaluatePredicate(claim, fences, calendar) {
  exit code: 0
  ```

  The completeness is structural rather than counted: `bindToVocabulary` throws **at import** unless the table's
  keys equal the frozen array exactly, so a fifth kind cannot become silently unreachable and no literal kind or
  comparator is written at any call site. T-04-U1 then iterates `claims.PREDICATE_KINDS` and
  `claims.PREDICATE_COMPARATORS` themselves rather than a list authored in the test. The point/path split is
  measured by disagreement on one bound: the close returns `+10` and misses `11` while the session high reaches
  `+12` and clears it, so a path comparator that quietly read the close would answer "no" for a session that did
  touch it. A gap in the window returns a **closure** — `unresolved` / `path-incomplete`, carrying no `RTR-*` code —
  and the anti-vacuity half is the identical window with the session restored, which resolves.
- [x] A required session missing from the slice closes `unresolved` reason `session-absent`; no value is ever interpolated.

  **Evidence — increment 2 (value slice, commit `30a9e2624`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U5 (increment 2): the as-of fence is a slice, and "not yet observed" is not "read the future" (11.154275ms)
  ℹ tests 28
  ℹ pass 28
  ℹ fail 0
  exit code: 0
  ```

  The closure and its shipped reason, located in the executed sources:

  ```
  $ grep -nE "^export const SESSION_ABSENT_REASON|return closure\('unresolved', SESSION_ABSENT_REASON|reasonCode: SESSION_ABSENT_REASON" scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.unit.mjs
  scripts/brief-resolve-outcomes.mjs:231:export const SESSION_ABSENT_REASON = 'session-absent';
  scripts/brief-resolve-outcomes.mjs:359:    return closure('unresolved', SESSION_ABSENT_REASON, `observations.${fence.symbol}.${sessionDate}`);
  tests/recommendation-track-record.unit.mjs:2196:    reasonCode: SESSION_ABSENT_REASON,
  exit code: 0
  ```

  A session absent from the slice returns a **closure** carrying no value and no `RTR-*` code — the test asserts
  the result has no `error` key at all — so nothing is interpolated across the gap and the fact stays a coded
  outcome rather than an invariant violation. The reason is asserted against `CLOSURE_REASON_CODES.unresolved` at
  module load, so a rename in `rlclaims.js` fails here rather than producing a reason `buildResolution` would
  later reject.
- [ ] **`RTR-PRICE-BASIS` is resolver-OWNED, and a path comparator on `adjusted-close` is structurally unresolvable.** The code is declared here (`scripts/brief-resolve-outcomes.mjs:227`) and raised from three sites — `:365`, `:824` and `:1034`. Because `PRICE_BASIS_ROW_FIELD` binds `adjusted-close` to `ac` and no row carries an adjusted extreme, a `crosses-above` / `crosses-below` claim on that basis **refuses** `RTR-PRICE-BASIS` / `path-extremes-absent-for-basis` rather than closing, and rather than dividing a raw `h`/`l` by an adjusted close. The support test is **derived** — membership of the bound row field in `BAR_CORE_FIELDS` — never a second list of basis names. *No DoD item covered this obligation before Ruling R-04-05.*
- [ ] The data-quality gates are applied: `zeroObservedSessions` closes `not-evaluable`; `reconstructedSessions` and `thinObservedSessions` do not block resolution and are recorded verbatim in the resolution object's `provenance`.
- [x] `outcomeValue = direction × ret(subject)` with `direction` frozen from `ACTION_DIRECTION` (`rlcontracts.js:720`); the class is assigned by calling `classifyOutcome` (`rlclaims.js:795`) rather than re-deriving the band comparison; values are stored unrounded as IEEE-754 doubles with rounding applied only at render; `direction === 0` closes `neutral-direction-no-magnitude`. Unblocked: Ruling R-04-01 is discharged, so the `ret(subject)` half reads the claim's frozen basis. *An earlier revision of this item still read "Blocked on Ruling R-04-01" while ticked — see Ruling R-04-04.*

  **Evidence — increment 3 (write slice, commit `c8665265f`) closing the `classifyOutcome` half.** Increment 2
  produced the number; the class had no call site until the record existed. R-04-01 is discharged above, so the
  `ret(subject)` half is no longer blocked. Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-01-U7: direction is bound to ACTION_DIRECTION and hold has no signed outcome (10.681875ms)
  ✔ T-04-U7 (increment 2): outcomeValue is direction x ret(subject), exact and unrounded, and the basis values are fingerprinted (18.726364ms)
  ✔ T-04-U3 (increment 3): closure event and outcomeClass are independent axes, derived from the shipped table (47.344007ms)
  ℹ tests 28
  ℹ pass 28
  ℹ fail 0
  exit code: 0
  ```

  The call, the unrounded value, and the neutral-direction closure, located in the executed sources:

  ```
  $ grep -nE "const classified = claims.classifyOutcome|outcomeValue, bearOnARise.outcomeValue, 'carried through verbatim|-5.000000000000004, 'which is NOT|hold.expected.reason, 'neutral-direction-no-magnitude'" scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.unit.mjs
  scripts/brief-resolve-outcomes.mjs:580:    const classified = claims.classifyOutcome(outcome.outcomeValue, claim);
  tests/recommendation-track-record.unit.mjs:591:    assert.equal(hold.expected.reason, 'neutral-direction-no-magnitude');
  tests/recommendation-track-record.unit.mjs:2233:    assert.equal(primary.outcomeValue, -5.000000000000004, 'which is NOT the decimal -5');
  tests/recommendation-track-record.unit.mjs:2316:    assert.equal(satisfiedLoss.outcomeValue, bearOnARise.outcomeValue, 'carried through verbatim, not re-derived');
  ```

  The band comparison is never re-derived here: `resolutionAxesFor` hands the value verbatim to the shipped
  `classifyOutcome`, and the test asserts the value that comes back is the **same** value — a re-derivation or a
  nudge would change it. The unrounded assertion pins `-5.000000000000004`, which a `toFixed` would silently turn
  into `-5`. A `hold` claim carries `direction === 0` and never mints a signed outcome, closing
  `neutral-direction-no-magnitude`, so no direction-0 claim ever reaches this multiply.
- [x] Closure event and `outcomeClass` are recorded as two independent axes, with the admissible pairings enforced by `OUTCOME_CLOSURE_EVENTS` (`rlclaims.js:284`) via `buildResolution`; a `satisfied` claim carrying a negative magnitude preserves both facts.

  **Evidence — increment 3 (write slice, commit `c8665265f`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U3 (increment 3): closure event and outcomeClass are independent axes, derived from the shipped table (47.344007ms)
  ℹ tests 28
  ℹ pass 28
  ℹ fail 0
  exit code: 0
  ```

  Both directions of the pair, and the derivation, located in the executed sources:

  ```
  $ grep -nE "satisfiedLoss.outcomeClass, 'loss'|invalidatedWin.outcomeClass, 'win'|DETERMINED_CLOSURE_CLASS = Object.freeze\(Object.fromEntries" scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.unit.mjs
  scripts/brief-resolve-outcomes.mjs:534:export const DETERMINED_CLOSURE_CLASS = Object.freeze(Object.fromEntries(
  tests/recommendation-track-record.unit.mjs:2315:    assert.equal(satisfiedLoss.outcomeClass, 'loss', 'and the magnitude still says loss');
  tests/recommendation-track-record.unit.mjs:2322:    assert.equal(invalidatedWin.outcomeClass, 'win', 'the predicate failed and the magnitude still says win');
  ```

  A `satisfied` claim whose direction-adjusted magnitude is negative records `satisfied` **and** `loss`; the
  mirror — `invalidated` with a `win` — is asserted too, so the row cannot pass under an implementation that
  hard-coded the opposite mapping instead of preserving two axes. The routing is **inverted** out of
  `OUTCOME_CLOSURE_EVENTS` rather than restated, and `buildResolution` accepts the resulting pair.

  The evidence stops here. The independence of the axes is proven; the *never-emitted* `withdrawn` item below is
  left unticked because its own wording requires "every failure branch, including a claim about to score badly",
  which is `T-04-F3`'s functional row and not this slice's.
- [x] `withdrawn` is never resolver-emitted on any path, including for a claim about to score badly — **derived** as the residue of the source vocabulary that no `OUTCOME_CLOSURE_EVENTS` class admits, not restated as a separate rule.

  **Evidence — the residue is computed, not listed.** Executed from `<repo-root>`.

  ```
  $ grep -nE "CLASSES_ADMITTING_CLOSURE = |Object.keys\(claims.OUTCOME_CLOSURE_EVENTS\)|withdrawn" scripts/brief-resolve-outcomes.mjs
  589: * events some class admits. `withdrawn` is the residue no class admits, so it refuses BEFORE a
  596:const CLASSES_ADMITTING_CLOSURE = (() => {
  598:  for (const outcomeClass of Object.keys(claims.OUTCOME_CLOSURE_EVENTS)) {
  exit code: 0
  ```

  The single `withdrawn` occurrence in the whole module is prose at `:589`. The behaviour comes from `:596`,
  which inverts the shipped `claims.OUTCOME_CLOSURE_EVENTS` table at load time — so `withdrawn` is excluded
  because no class admits it, not because a local rule names it. A class added to the shipped table would
  change this index automatically; a second local list could not.

  ```
  $ node --test tests/recommendation-track-record.functional.mjs
  ✔ T-04-F3: `withdrawn` is unreachable from every resolver path — the residue no class admits (8.878661ms)
  ℹ tests 13
  ℹ pass 13
  ℹ fail 0
  exit code: 0
  ```

  This is the `T-04-F3` functional row the increment-4 note above deferred to; it is now green, so the
  "including a claim about to score badly" conjunct is discharged by execution.
- [ ] A bare `0` never reaches a directional class: `RTR-FLAT-ZERO` (`rlclaims.js:133`) is left to fire from the shipped `buildResolution` and `assertZeroFreeOutcomes` (`:817`), and this scope neither coerces a zero nor pre-filters the array to avoid the refusal.
- [ ] `not-evaluable` closes at the **first** resolver pass after minting, not at horizon expiry, so a known-unscoreable claim never sits in the open pipeline.
- [ ] Closures route through `reduceRecommendationEvents` via `run.closures` with `current: []`; the reducer is consumed unchanged, and `rlcontracts.js`, `rlvalidation.js` and `rlclaims.js` are proven unmodified by `git diff --quiet` exiting 0. *An earlier revision asserted "byte-unmodified" with no `sha256` pinned anywhere, which was not decidable as written.* `RTR-CLOSURE-VOCAB` refuses a locally-invented closure type — raised by the shipped `buildResolution`, not re-implemented here.
- [x] The resolver does not depend on its own closure ordering, because the reducer sorts by `originRecommendationKey` before processing (`rlcontracts.js:1272`). — Evidence: `rlcontracts.js:1272` reads `var closures = run.closures.slice().sort(...)` comparing `left.originRecommendationKey` to `right.originRecommendationKey` (`:1273-1276`) — the cited line is exact. On the resolver side `grep -nE "\.sort\("` returns `465, 601, 602, 676, 681, 884, 885, 908, 909, 1345, 1588` and none sorts a closures array; the array is appended in loop order at `:1683`, handed straight to `applyClosures` at `:1690`, and re-exported frozen at `:1695` with no positional read of `applied`.
- [x] `lifecycleBinding.originRecommendationKey` is **derived** by calling `deriveRecommendationKeys` (`rlcontracts.js:1040`), never authored, and is carried in `lifecycleBinding` — a `RESOLUTION_UNHASHED_FIELDS` member (`rlclaims.js:250`) — so it is not added to `claimHash`'s term list.

  **Evidence — increment 5 (reducer bridge, commits `d1a953c8d` and `abcaf0174`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U10: the reducer key is derived by the shipped producer, never authored here (5.176093ms)
  ℹ tests 33
  ℹ pass 33
  ℹ fail 0
  exit code: 0
  ```

  The derivation and the carriage, located in the executed source:

  ```
  $ grep -nE "^export function originRecommendationKeyFor|foundation.deriveRecommendationKeys\(built.terms\)|^export function lifecycleBindingFor|lifecycleBinding: \{ originRecommendationKey" scripts/brief-resolve-outcomes.mjs
  scripts/brief-resolve-outcomes.mjs:1283:export function originRecommendationKeyFor(claim, toolsRegistry) {
  scripts/brief-resolve-outcomes.mjs:1288:  const derived = foundation.deriveRecommendationKeys(built.terms);
  scripts/brief-resolve-outcomes.mjs:1293:export function lifecycleBindingFor(claim, toolsRegistry) {
  scripts/brief-resolve-outcomes.mjs:1296:  return { ok: true, lifecycleBinding: { originRecommendationKey: derived.originRecommendationKey } };
  exit code: 0
  ```

  T-04-U10 does not compare the bridge against a stored expectation — it **re-runs the producer** over the record
  the bridge reports it assembled, so a bridge that derived correctly and then prefixed, truncated, cached or
  substituted an authored key fails there rather than passing on a stale constant. The non-vacuity half perturbs
  every measured contributing term in isolation and requires each to move the key, and `ORIGIN_KEY_TERMS` is read
  off the producer by perturbation rather than authored, so the loop widens by itself if the producer starts
  folding in a further field. The carriage half is the executed source above: `lifecycleBindingFor` is the only
  assembly point and it writes the key into `lifecycleBinding`, which the shipped
  `RESOLUTION_UNHASHED_FIELDS = ["eventId", "lifecycleBinding"]` (verified at `rlclaims.js:262` this pass — the
  `:250` citation above has drifted) holds outside the content address; that exclusion is asserted by execution in
  the same run at `tests/recommendation-track-record.unit.mjs:1813`–`:1822`. **Honest gap:** no test calls
  `lifecycleBindingFor` directly, so the carriage rests on a single-assembly-point source reading rather than on an
  execution assertion.
- [x] No `RUN_SCOPED_KEYS` member (`rlclaims.js:259`) appears inside the hashed `provenance` block; run-scoped facts go in `lifecycleBinding`.

  **Evidence — increment 3 (write slice, commit `c8665265f`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U8 (increment 3): the hashed provenance is assembled here, so no run-scoped key can reach the content address (12.742375ms)
  ℹ tests 28
  ℹ pass 28
  ℹ fail 0
  exit code: 0
  ```

  The assembly point and both halves of the split, located in the executed sources:

  ```
  $ grep -nE "for \(const key of claims.RUN_SCOPED_KEYS\)|withRunId.resolution.lifecycleBinding.runId, 'run-2026|const provenance = \{ earlyCloseSessions" scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.unit.mjs
  scripts/brief-resolve-outcomes.mjs:623:  const provenance = { earlyCloseSessions: earlyCloseSessionsIn(calendar, sessions).slice() };
  tests/recommendation-track-record.unit.mjs:2405:    for (const key of claims.RUN_SCOPED_KEYS) {
  tests/recommendation-track-record.unit.mjs:2415:    assert.equal(withRunId.resolution.lifecycleBinding.runId, 'run-2026-07-29-a');
  ```

  The rule is structural rather than remembered: `resolutionProvenanceFor` assembles the block from the claim and
  the calendar with **no** caller-supplied field, so there is no path a `runId` or a wall clock could arrive
  through, and the test walks the whole shipped `RUN_SCOPED_KEYS` set rather than a local copy. The paired
  assertion is what stops this passing vacuously under a blanket ban: the same `runId` is **accepted** in
  `lifecycleBinding`, and the two records share one content address while differing in bytes.
- [ ] **Routed finding P-015-03 is recorded as ruled on, not as blocking.** `thesisFamily` is a top-level hashed claim field that is authored or the claim is not evaluable; this scope invents no value for it, emits no closure event when it is absent, and records the implemented ruling in `report.md` before the bridge is implemented.
- [ ] Idempotence is enforced by the due-set gate, with `indexFingerprint` (`rlcontracts.js:1318`) as the oracle and content-addressed resolution objects as the backstop; the conflict abort is the shipped `writeResolutionObject` path (`rlclaims.js:1109`) raising `RTR-RESOLUTION-CONFLICT` without overwriting, called rather than re-implemented.
- [ ] The `not-evaluable` reason set is **read from `NOT_EVALUABLE_REASONS` (`rlclaims.js:305`) and never restated**; its length equals `MINT_REFUSALS.length + RESOLVER_NOT_EVALUABLE_REASONS.length` (**eleven** today, asserted by derivation rather than by literal). *An earlier revision of this item and of T-04-U6 asserted six.* Only the three resolver-raised reasons are this scope's to raise; each reason carries a human-readable sentence; every `not-evaluable` claim is excluded from rate denominators while remaining visibly counted.
- [x] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code.

  **Evidence — the global is absent across every 015-authored file.** Executed from `<repo-root>`.

  ```
  $ grep -nE '(^|[^.[:alnum:]_$])isFinite[[:space:]]*\(' scripts/brief-resolve-outcomes.mjs tests/recommendation-track-record.unit.mjs tests/recommendation-track-record.functional.mjs tests/recommendation-track-record.integration.mjs tests/recommendation-track-record.e2e.mjs
  exit code: 1

  $ grep -c 'Number\.isFinite' scripts/brief-resolve-outcomes.mjs
  9
  exit code: 0
  ```

  The pattern excludes a preceding `.`, `$`, `_` or alphanumeric, so it matches the *bare global* call and not
  the `Number.` member — which is what makes the empty result meaningful rather than a pattern that could
  never match. It returns nothing across the resolver and all four executed test files, while the resolver
  carries nine `Number.isFinite` guards. This is the exclusivity the repo needs because
  `isFinite(null) === true`, so the global would let a missing bar field through a finiteness check.
- [ ] No statistic is computed in this scope; `rlvalidation.js` is not imported here, and the `rlvalidation.js:136` citation in the plan is motivation only. Feeding the primitive is scope 05. *Left unticked: the first conjunct is factually wrong against the shipped tests — see Ruling R-04-07.*
- [ ] **Inputs are empty and this scope is fixture-testable only.** `report.md` records that `briefs/objects/claims/` and `briefs/objects/resolutions/` do not exist, that there are 0 committed claim and resolution objects, and that `claimRef` appears in 0 of 5,083 committed rows — so no green run over real committed state may be recorded as coverage for any row above.

#### Test items

- [x] T-04-U1 passes: all four predicate kinds evaluate correctly with satisfied and invalidated fixtures, and the basis is read from the claim's frozen term → evidence recorded in `report.md#t-04-u1`. — proves SCN-015-003

  **Evidence — increment 4 (predicate slice, commit `65e47272b`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U1 (increment 4): all four predicate kinds evaluate, and the kind and comparator are bound to the frozen vocabularies (66.35991ms)
  ℹ tests 33
  ℹ pass 33
  ℹ fail 0
  exit code: 0
  ```

  Each kind is proven satisfied **and** invalidated on the same fixture series, so the verdict tracks the bound
  rather than the fixture. `relative` and `spread` are proven to be different predicates rather than two spellings:
  on the same pair at the same bound, `spread` reads the leg difference (`-15`, satisfied) while `relative` reads
  the basket mean against the reference (`-7.5`, invalidated). `directional` reads the claim's **frozen flat band**
  and expressly not `predicate.value`, which is why a correct bearish call on a falling series is satisfied. The
  basis is the claim's frozen term throughout — the same `DVG` series scores `+10` under `raw-close` and `-10`
  under `adjusted-close`. Out-of-vocabulary refuses rather than coercing, including `constructor`, which a lookup
  that skipped the membership test would have resolved through the prototype chain.
- [x] T-04-U2 passes: point vs path comparator semantics hold and a path gap closes `path-incomplete` → evidence recorded in `report.md#t-04-u2`.

  **Evidence — increment 4 (predicate slice, commit `65e47272b`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U2 (increment 4): point and path comparators are different evaluations, and a path gap closes path-incomplete (18.598175ms)
  ℹ tests 33
  ℹ pass 33
  ℹ fail 0
  exit code: 0
  ```

  A point comparator reports `sessionsEvaluated: [resolution session]`; a path comparator walks the whole committed
  window and decides at the **crossing** session rather than the last one. The gap case removes exactly one interior
  session — asserted as a length difference of `1`, so the fixture cannot be vacuously empty — and returns
  `unresolved` / `path-incomplete` with no `RTR-*` code, while a missing **entry** session comes back as
  `session-absent` because the denominator is the endpoint case, not a path gap. Lookahead stays the increment-2
  refusal: a window fenced short of its own resolution date raises `RTR-LOOKAHEAD` from `basisValueAt` rather than
  from a second rule written here. **Fourth plan defect surfaced here — see `report.md`:** a path comparator on
  `adjusted-close` refuses `RTR-PRICE-BASIS` / `path-extremes-absent-for-basis`, a resolver-owned code that this
  scope's header still lists as merely **proposed**. Surfaced, not fixed.
- [x] T-04-U3 passes: `satisfied` with a negative magnitude preserves both axes → evidence recorded in `report.md#t-04-u3`.

  **Evidence — increment 3 (write slice, commit `c8665265f`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U3 (increment 3): closure event and outcomeClass are independent axes, derived from the shipped table (47.344007ms)
  ℹ tests 28
  ℹ pass 28
  ℹ fail 0
  exit code: 0
  ```

  ```
  $ grep -nE "satisfiedLoss.outcomeClass, 'loss'|invalidatedWin.outcomeClass, 'win'" tests/recommendation-track-record.unit.mjs
  tests/recommendation-track-record.unit.mjs:2315:    assert.equal(satisfiedLoss.outcomeClass, 'loss', 'and the magnitude still says loss');
  tests/recommendation-track-record.unit.mjs:2322:    assert.equal(invalidatedWin.outcomeClass, 'win', 'the predicate failed and the magnitude still says win');
  ```

  The row carries its own anti-vacuity control — the identical call shape with a readable series builds and its
  `resolutionHash` matches `^sha256:[a-f0-9]{64}$` — so the refusals in the same test are caused by the values
  under test rather than by a builder that refuses everything. Full narrative in [report.md](report.md).
- [ ] T-04-U4 passes: `RTR-CLOSURE-VOCAB` fires from the shipped `buildResolution` and `git diff --quiet` proves the consumed modules unmodified → evidence recorded in `report.md#t-04-u4`.
- [ ] T-04-U5 passes: the fence excludes future rows, `RTR-LOOKAHEAD` fires on an attempt, and not-yet-resolvable is a silent skip → evidence recorded in `report.md#t-04-u5`. — proves SCN-015-007
- [ ] T-04-U6 passes: the reason set is read from `NOT_EVALUABLE_REASONS`, its length asserted by derivation (eleven today, no literal), each of the three resolver-raised reasons fires for its own trigger only → evidence recorded in `report.md#t-04-u6`. — proves SCN-015-010
- [ ] T-04-U7 passes: a correct bearish claim yields a positive outcome via `classifyOutcome` and `hold` refuses → evidence recorded in `report.md#t-04-u7`.
- [x] T-04-U8 passes: divergent `c`/`ac` fixtures score differently, the frozen `priceBasis` term decides which, a claim lacking the term refuses rather than defaulting, and the basis-value fingerprint lands in hashed `provenance` → evidence recorded in `report.md#t-04-u8`. **Ruling R-04-01 is discharged, so this row is no longer blocked.**

  **Evidence — increments 2 and 3.** Increment 2 (commit `30a9e2624`) proved the first three clauses; increment 3
  (commit `c8665265f`) closes the fourth by assembling the hashed provenance. Executed from `<repo-root>`.

  ```
  $ node --test tests/recommendation-track-record.unit.mjs
  ✔ T-04-U8 (increment 2): the price basis is read from the frozen claim, and an absent basis refuses instead of falling back (19.359963ms)
  ✔ T-04-U8 (increment 3): the hashed provenance is assembled here, so no run-scoped key can reach the content address (12.742375ms)
  ℹ tests 28
  ℹ pass 28
  ℹ fail 0
  exit code: 0
  ```

  The fingerprint reaching hashed `provenance` — reused from the outcome, not recomputed — located in the
  executed source:

  ```
  $ grep -nE "provenance.provenance.basisFingerprint, outcome.basisFingerprint" tests/recommendation-track-record.unit.mjs
  tests/recommendation-track-record.unit.mjs:2399:    assert.equal(provenance.provenance.basisFingerprint, outcome.basisFingerprint);
  ```

  Reuse rather than recomputation is the load-bearing detail: the record commits to exactly the values the return
  was computed from, not to a second read that could differ. The paired assertion is that an **unmeasured** claim
  gets a provenance block whose only key is `earlyCloseSessions`, so no basis is invented for a read that never
  happened.
- [ ] T-04-F1 passes: session arithmetic is correct across weekend, holiday and **early-close** boundaries with the `startUtc` cross-check, `provenance.earlyCloseSessions` is recorded, `RTR-SESSION-PREDICATE` refuses a `dateState`-keyed test, and the derived 2026 session count is 251 → evidence recorded in `report.md#t-04-f1`.
- [ ] T-04-F2 passes: `RTR-CALENDAR-COVERAGE` fires beyond `coverageEnd` with no extrapolation → evidence recorded in `report.md#t-04-f2`.
- [ ] T-04-F3 passes: `withdrawn` is unreachable from every resolver path → evidence recorded in `report.md#t-04-f3`.
- [ ] T-04-F4 passes: `zeroObservedSessions` closes not-evaluable while reconstructed and thin sessions resolve with recorded provenance → evidence recorded in `report.md#t-04-f4`.
- [ ] T-04-I1 passes: closures route through the reducer with `current: []`, one event per due claim, frozen terms re-emitted, and the still-active case proven to fail → evidence recorded in `report.md#t-04-i1`. — proves SCN-015-002
- [ ] T-04-I2 passes: **idempotence case 1** — pass 2 is a no-op with a byte-identical `indexFingerprint` → evidence recorded in `report.md#t-04-i2`. — proves SCN-015-009
- [ ] T-04-I3 passes: **idempotence case 2** — the reducer is proven to *accept* a double closure when the gate is bypassed and the fingerprint changes → evidence recorded in `report.md#t-04-i3`.
- [x] T-04-I4 passes: `RTR-RESOLUTION-CONFLICT` fires from the shipped `writeResolutionObject` and the on-disk bytes are unchanged → evidence recorded in `report.md#t-04-i4`.

  **Evidence — increment 3 (write slice, commit `c8665265f`).** Executed from `<repo-root>`.

  ```
  $ node --test tests/*.integration.mjs
  ✔ T-04-I4 (increment 3): re-resolving is a byte-identical no-op, a changed unhashed field conflicts, and a moved basis lands at a new address (74.113346ms)
  ℹ tests 33
  ℹ pass 33
  ℹ fail 0
  exit code: 0
  ```

  The refusal and the untouched bytes, located in the executed source:

  ```
  $ grep -nE "reEmitted.error.code, claims.RESOLUTION_CONFLICT_CODE|digestAfterFirst, 'the on-disk bytes are unchanged'" tests/recommendation-track-record.integration.mjs
  tests/recommendation-track-record.integration.mjs:358:        assert.equal(reEmitted.error.code, claims.RESOLUTION_CONFLICT_CODE, 'code');
  tests/recommendation-track-record.integration.mjs:361:        assert.equal(claims.sha256Hex(readBytes(objectPath)), digestAfterFirst, 'the on-disk bytes are unchanged');
  ```

  The conflict is raised by the shipped `writeResolutionObject` against a **real** disposable filesystem outside
  the repository, on the one case the code exists for: a re-emit carrying a fresh `eventId` — an unhashed field —
  lands at the same content address with different bytes. The first record is asserted byte-identical afterwards
  and the store still holds exactly one object, so the refusal overwrites nothing. The preceding half of the same
  test is the anti-vacuity control: an unchanged repeat is `reused: true, written: false` rather than a conflict,
  so the code is not simply firing on every second write.
- [ ] T-04-I5 passes: `authorizeResolutionWrite` is proven to be called first — a claimless row refuses `RTR-LEGACY-BACKFILL` before the resolution is inspected, a malformed row refuses as malformed, and a `claimHash`/`claimRef` mismatch refuses — with nothing written on any path → evidence recorded in `report.md#t-04-i5`.
- [ ] T-04-E1 passes: a full resolve pass produces one closure per due claim, leaves not-yet-due claims active, and the partition identity holds → evidence recorded in `report.md#t-04-e1`.
- [ ] T-04-V1 passes: `RTR-NETWORK` fires on a network/credential reference and the clean module references none → evidence recorded in `report.md#t-04-v1`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-04-R1] the satisfied and invalidated outcomes, the look-ahead fence with its silent-skip counterpart, the byte-identical re-run fingerprint, and the not-evaluable closure all re-assert as a standing guard → evidence recorded in `report.md#t-04-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-04-R2] the committed Node E2E files and the whole committed Playwright spec suite are green, proving every existing `rlcontracts.js` lifecycle consumer survives the closure routing → evidence recorded in `report.md#t-04-r2`.
- [ ] T-04-S1 passes: `node scripts/selftest.mjs` reports `0 failed` and a passed count no lower than the literal baseline pinned in `report.md` before this scope's first change → evidence recorded in `report.md#t-04-s1`.

**Test-related DoD items: 22. Test Plan rows: 22. Parity confirmed.** (Was 20/20; T-04-U8 and T-04-I5 added.)

**Both halves of the idempotence proof (T-04-I2 and T-04-I3) are named DoD items, per `design.md` → `## D11`
F-015-D4-02. Neither alone is sufficient evidence for FR-006.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `rlcontracts.js`, `rlvalidation.js` and `rlclaims.js` proven unmodified by `git diff --quiet` exiting 0; no committed `data/bars/**` or `data/calendars/**` byte modified; `spec.md` and `design.md` unmodified by this scope; no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlcontracts.js` | Feature 002-owned, read-only. `CLOSE_EVENT_TYPES`, `ACTION_DIRECTION`, `deriveRecommendationKeys` and `reduceRecommendationEvents` are consumed **unchanged**. The reducer is never forked: two lifecycle engines over one ledger would surface as ledger corruption rather than as a test failure. Its `runId`-hashed event ids and permissive closure block are worked **around** by the due-set gate, not patched. |
| `rlvalidation.js` | Feature 007-owned, read-only. This scope computes no statistic and does not import it. Feeding `rlvSummarizeOutcomes` is **scope 05**; the `rlvalidation.js:136` citation in the plan is motivation for the direction adapter only. |
| `rlclaims.js` | Scope 01/02/03-owned, read-only **here**. Its resolution, classification, gate and enumeration exports are consumed unchanged and are never re-implemented, extended, or shadowed by a local copy. Adding the `priceBasis` hashed term is **scope 01's** act under Ruling R-04-01, not this scope's. |
| Any committed `data/bars/**` or `data/calendars/**` byte | Read-only substrate. Tests use fixture series under `tests/fixtures/`, and any read of a committed file asserts its bytes unchanged. |
| Any committed `briefs/history/**/*.jsonl` byte | The ledger is append-only and is scope 02's surface. The resolver appends closure events; it never rewrites a prior row. |
| `briefs/objects/claims/**` | Append-only and scope 01-owned. The resolver **reads** claims; it never writes, amends, or deletes one. |
| `scripts/brief-distributed-publish.mjs`, `scripts/brief-publication.mjs` | Feature 002-owned; the mint hook and row emission are scope 02 under its consent gate. |
| `rldata.js`, `rlbrief.js`, `rlmarketaction.js` | Cache schema and Center surfaces; the resolver is a Node script and touches neither. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json` | Counted registries. Scope 10 only. |
| `recommendation-track-record-lab.html` | Does not exist until scope 07. The resolver renders nothing. |
| `scripts/validate-recommendation-track-record.mjs` | The consolidated validator is scope 09; this scope's five codes are proven by `node --test`. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

### Rulings recorded by this scope

**R-04-08 — "imported and called" means CALLED AT A SITE IN THIS SCOPE'S SOURCE, not reached transitively.**
The consumption item names fifteen scope-03 exports and requires each to be "imported from `rlclaims.js` and
called". Four are never referenced in `scripts/brief-resolve-outcomes.mjs`: `outcomeContributionFor`,
`serializeResolution`, `readClosureEventVocabulary`, `OUTCOME_CLASSES`. A softer reading was available and is
**rejected** — that `serializeResolution` and `OUTCOME_CLASSES` are *reached* because the called
`writeResolutionObject` and `classifyOutcome` use them internally (`rlclaims.js:816-817`, `:123`). That reading is
refused for two reasons. First, it is unfalsifiable at this granularity: almost any export of a module is
transitively reachable from almost any other, so the item would assert nothing and could never fail. Second, the
item's own second conjunct — "no second copy of any of them exists in 015-authored code" — only has force against a
**direct** call site, since a transitive reach cannot be shadowed by a local re-implementation the resolver never
consults. The item therefore stays **unticked** and the four names are recorded on it. This is a defect in the
**item**, the **source**, or both, and the choice is not this pass's to make: either the resolver has a genuine gap
(it should be reading the closure vocabulary through `readClosureEventVocabulary` rather than by another route at
`:884-885`, and routing contributions through `outcomeContributionFor`), or the item over-enumerates and should
name only the exports this scope actually calls. Routed to the scope owner; no source or test file was modified.

---

*Educational research context only — not investment advice.*
