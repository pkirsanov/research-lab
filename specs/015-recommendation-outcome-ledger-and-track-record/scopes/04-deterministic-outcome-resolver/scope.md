# Scope 04: Deterministic outcome resolver

**Status:** Not Started
**Depends On:** 01, 02, 03
**Tags:** `overlay:true`, `routed:P-015-03`, `routed:P-015-07`
**Design section:** `design.md` → `## D4 — Deterministic Outcome Resolver`
**Business Scenarios owned:** BS-002, BS-003, BS-007, BS-009, BS-010
**UI rows owned:** — (no rendered surface in this scope)
**Refusal codes owned:** `RTR-LOOKAHEAD`, `RTR-CALENDAR-COVERAGE`, `RTR-CLOSURE-VOCAB`, `RTR-NETWORK`, `RTR-RESOLUTION-CONFLICT`

**Primary Outcome:**
`scripts/brief-resolve-outcomes.mjs` exists as an offline, deterministic Node script that converts a frozen claim
plus committed observations into **one** signed outcome and **exactly one** closure event drawn from the existing
`CLOSE_EVENT_TYPES` vocabulary, applied through the existing `reduceRecommendationEvents` without forking it. The
lookahead fence is structural, not procedural: the bar array is sliced to observations dated at or before the claim's
frozen `resolutionDate` **before** the predicate evaluator is handed anything, so lookahead is prevented by the shape
of the data the evaluator can see. Closure event and outcome class are recorded as two **independent** axes, so a
`satisfied` claim carrying a negative magnitude keeps both facts. Idempotence rests on the due-set gate
(`entry.state === "active"`), and the test suite proves *where* the invariant lives, not merely that it holds. The
resolver performs no `fetch`, opens no socket, and reads no provider credential.

**Scope boundary — two routed findings, both now ruled on.** The **reducer key bridge** carried routed finding
**P-015-03** (`thesisFamily` has no live source) and the **horizon session predicate** carried routed finding
**P-015-07** (the design's `dateState === "regular"` rule skips `early-close` sessions). Design has since ruled on
both, so neither gates implementation: `thesisFamily` is authored-or-not-evaluable and is a top-level hashed claim
field, and the session predicate is `row.regular !== null`. This scope implements the recorded rulings and records
in `report.md` which ruling it implemented; it still invents no `thesisFamily` value and still derives no session
count of its own. Everything else in this scope was already fixture-proven and schedulable.

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

1. **Create `scripts/brief-resolve-outcomes.mjs`**, joining the existing `scripts/brief-*.mjs` family
   (`brief-author.mjs`, `brief-distributed-publish.mjs`, `brief-publication.mjs`, `brief-refresh.mjs`,
   `migrate-brief-history.mjs`), so the resolver is an ordinary member of an established script surface rather than a
   new execution model.
2. **Enforce HC-10 structurally.** The resolver's entire input set is committed repository state:
   `briefs/objects/claims/`, `briefs/history/recommendations/*.jsonl`, the committed `data/bars` symbol set, and
   `data/calendars/xnys/calendar.json`. It performs no `fetch`, opens no
   socket, reads no provider key, and never consults `RLDATA`'s browser fetch path. A violation is `RTR-NETWORK`,
   asserted by a source scan in the same idiom the repo already uses for
   `rlvalid-node-safe-no-dom-storage-network`.

   **The committed `data/bars` symbol set is defined by a membership rule, never by a count** (F-015-D5-02). The
   glob `data/bars/*.json` is **not** the symbol set: it also matches the `data/bars/index.json` refresh manifest,
   whose `tickers[].sym` list is the authoritative symbol enumeration. The resolver therefore reads membership from
   `data/bars/index.json` and treats a `<SYMBOL>.json` sibling as the series for a member, so `index` can never be
   mistaken for a tradeable symbol. *Dated observation, deliberately not a constant:* on 2026-08-18 the glob matched
   293 files, the glob minus the manifest matched 292, and the manifest listed 289 symbols — `EA`, `NDX` and `PHP=X`
   have a committed file but no manifest entry, while every manifest entry has a file. Three defensible readings of
   *"the committed bars set"* differ by four files, which is precisely why the rule names the set and the scope's
   tests enumerate it at run time rather than asserting any of the three numbers.
3. **Compute the due set from reduction state, not from timestamps.**
   `due(asOfDate) = { entry ∈ index.entries : entry.state === "active" ∧ entry has a claimRef ∧ claim(entry).horizon.resolutionDate ≤ asOfDate }`.
   `index` is a `recommendation-index/v1` produced by `reduceRecommendationEvents` (`rlcontracts.js#L1134`);
   `entry.state` is set to `"closed"` by the reducer's own closure path (`rlcontracts.js#L1280`).
4. **Derive `resolutionDate` by calendar-session arithmetic, never day arithmetic.** The committed exchange calendar
   is `data/calendars/xnys/calendar.json` — contract `xnys-calendar/v1`, `calendarId: "XNYS"`,
   `timeZone: "America/New_York"`, `coverageStart: "2026-01-01"`, `coverageEnd: "2026-12-31"`, **365 rows** each
   carrying `{ tradingDate, dateState, closureCode, closureLabel, preMarket, regular, afterHours }` (all verified
   this planning run). Adding calendar days would resolve a Friday `next-session` claim on a Saturday and silently
   mark it `not-evaluable` for want of a bar; counting sessions cannot make that mistake.
   **The session predicate is blocked on routed finding P-015-07.** `design.md` → `## D4` specifies
   `dateState === "regular"`, but the committed calendar's `dateState` vocabulary has **four** members —
   `regular` (249), `weekend` (104), `holiday` (10) and `early-close` (2, verified: `2026-11-27` and `2026-12-24`,
   both carrying a **non-null** `regular` block of 09:30–13:00 ET). An `early-close` session is a real trading
   session, so the design's rule skips it and derives a `resolutionDate` one session too far out — a silent
   one-session lookahead produced by the horizon derivation itself. The proposed correction (session ⇔ non-null
   `regular` block, i.e. `dateState ∈ { regular, early-close }`) is **routed, not applied**; `design.md` is
   design-owned.
5. **Refuse beyond calendar coverage.** A `resolutionDate` beyond `coverageEnd` cannot be derived, and guessing one
   is fabrication. `RTR-CALENDAR-COVERAGE` fires and the claim closes `not-evaluable` with reason
   `calendar-coverage-exhausted`. The calendar is a committed artifact with a finite window; treating it as infinite
   is the assumption that fails once, quietly, at a year boundary.
6. **Implement the as-of fence as a slice, not a rule.** Committed daily bars carry rows shaped `{ t, o, h, l, c, v }`
   where `t` is the regular-session open in epoch milliseconds. *Dated observation on `data/bars/SPY.json`,
   2026-08-18: 517 rows, `asof: "2026-08-17"`, last row `t: 1786973400000`.* The tree is delta-appended on every
   refresh, so every figure in that observation is stale by design within days — it is recorded to size the fixture
   set and is **not** carried into any test, fixture, DoD item, or source literal. Because the regular open is
   `14:30Z` (EST) or `13:30Z` (EDT)
   — both inside the same UTC calendar day as the ET session — the session date is the UTC calendar date of `t`.
   That coincidence is load-bearing, so it is **asserted rather than assumed**: each derived session date is
   cross-checked against `calendar.rows[].regular.startUtc` and a mismatch refuses.
   `readable(claim) = { row ∈ bars.rows : sessionDate(row.t) ≤ claim.horizon.resolutionDate }` is computed **once,
   before** predicate evaluation, and the evaluator is handed only that slice. Any attempt to consult a row outside
   the slice is `RTR-LOOKAHEAD`.
7. **Distinguish "not yet resolvable" from "tried to read the future".** If `bars.asof < claim.horizon.resolutionDate`
   the outcome is simply not observable yet: the claim stays `active`, no event is appended, and **no code fires**.
   Conflating the two would make `RTR-LOOKAHEAD` fire on every routine run and train everyone to ignore it.
8. **Implement the four predicate evaluators** against the fenced slice, with
   `ret(x) = (basisAt(resolutionDate) / basisAt(entryDate) − 1) × 100` in `percent-return`:
   `threshold` → `cmp(ret(subject), predicate.value)`;
   `relative` → `cmp(ret(subject) − ret(reference), predicate.value)`;
   `directional` → `direction × ret(subject) > magnitude.flatBand`;
   `spread` → `cmp(ret(subject.leg) − ret(reference.leg), predicate.value)`.
   **Point comparators** (`gte`, `lte`, `gt`, `lt`) evaluate once, at `resolutionDate`. **Path comparators**
   (`crosses-above`, `crosses-below`) evaluate over every session in `[entryDate, resolutionDate]` using `h` and `l`,
   so they require the **complete** intervening session set; a gap closes the claim `unresolved`, reason
   `path-incomplete`, because a path predicate evaluated over a partial path is a *different* predicate and silently
   doing that would break HC-6. A required session missing from the slice is `unresolved`, reason `session-absent` —
   never an interpolation.
9. **Apply the data-quality gates.** A bars file may carry `reconstructedSessions`, `thinObservedSessions` and
   `zeroObservedSessions`, and the gate reads whichever are present. **Presence is not universal and must not be
   assumed:** on 2026-08-18, 291 of the 293 files matching `data/bars/*.json` carried all three, and the two that
   did not were `data/bars/index.json` (the refresh manifest, not a series) and `data/bars/NDX.json` (a genuine
   series with none of the three). A gate that dereferenced the arrays unconditionally would throw on `NDX`, so an
   absent array is read as empty rather than as a missing input. Those figures are a **dated observation, not a
   constant**, and no test asserts them. If the `entryDate` or `resolutionDate` session appears in
   `zeroObservedSessions`, the claim closes
   `not-evaluable`, reason `zero-observed-session`. A `reconstructedSessions` or `thinObservedSessions` hit does
   **not** block resolution but is recorded verbatim in the resolution object's `provenance`, so a reader can see
   that an outcome rests on a repaired bar.
10. **Compute the outcome magnitude as `outcomeValue = direction × ret(subject)`**, with `direction` frozen into the
    claim from `ACTION_DIRECTION` (`rlcontracts.js#L714`). Multiplying by it is the only reason
    `rlvSummarizeOutcomes`' `value > 0` win test (`rlvalidation.js#L136`) is meaningful for bearish claims: without
    it, every correct `trim` or `hedge` would score as a loss. `direction === 0` (`hold`) closes `not-evaluable`,
    reason `neutral-direction-no-magnitude` — assigning it a sign would invent a direction the action family
    explicitly declines to take. Values are stored **unrounded** as IEEE-754 doubles, with rounding applied only at
    render.
11. **Record closure event and outcome class as two independent axes.** The **closure event** is decided solely by
    the frozen predicate and is drawn from `CLOSE_EVENT_TYPES` (`rlcontracts.js#L720`) and nothing else; the
    **`outcomeClass`** is decided solely by `outcomeValue` against `magnitude.flatBand` (scope 03). A `satisfied`
    claim can therefore carry a **negative** `outcomeValue`, and both facts are preserved. `withdrawn` is **never**
    resolver-emitted: withdrawal is an authoring act, and a resolver that could withdraw a claim could withdraw the
    ones it was about to score badly. `not-evaluable` closes at the **first** resolver pass after minting, not at
    horizon expiry, because parking a known-unscoreable claim in the open pipeline misrepresents the pipeline.
12. **Route closures through the existing reducer.** Closures enter through `run.closures`, the path the reducer's own
    contract documents. Four verified behaviours constrain the call: `run.closures` must be an array
    (`rlcontracts.js#L1265`); closures are sorted by `originRecommendationKey` before processing (`#L1266`), so the
    resolver must not depend on its own input order; a type outside `CLOSE_EVENT_TYPES` fails
    `recommendation-closure-type-invalid` (`#L1273`), so a local extension is `RTR-CLOSURE-VOCAB`; and a key present
    in the same run's proposals fails `recommendation-closure-still-active` (`#L1276`), so the resolver calls the
    reducer with **`current: []`** — it is a closing pass, never a proposing pass. The reducer re-emits the claim's
    **original frozen terms** on the closure (`#L1277`), which is HC-6 holding at the lifecycle layer too.
13. **Derive the reducer key bridge, never author it.** `originRecommendationKey` is computed by calling
    `deriveRecommendationKeys` (`rlcontracts.js#L1034`) on terms assembled from the claim's **hashed**
    `thesisFamily` / `subject` / `actionFamily` / `horizon` (scope 01) plus the `originToolId` **pipeline
    constant** `market-brief`, exactly as the foundation intends (*"Authors never own identity"*,
    `rlcontracts.js#L1031`). Per the 2026-08-18 Claim-Identity Reconciliation there is no `lifecycleTerms` block to
    read from: that block is **withdrawn**, `thesisFamily` is a top-level hashed claim field, and `originToolId` is
    not a claim field at all. The constant is asserted against the registry — `tools.json` carries
    `experience.kind === "market-action-center"` exactly once, on the tool whose `id` is `market-brief` — rather
    than hard-coding a second copy of the string. Because every varying term of the derived key is inside
    `claimHash`, the bridge is a **refinement**: one claim object can only ever derive one reducer key. The derived
    key is recorded in the resolution object as `lifecycleBinding.originRecommendationKey` and is **not** added to
    `claimHash`'s term list, so scope 01's contract stays frozen and byte-stable. **Routed finding P-015-03 is
    RESOLVED and no longer gates this step** — `thesisFamily` is authored; when it is absent the claim mints
    `not-evaluable` (`no-authored-thesis-family`) and **no** closure event is emitted, so the reducer is never
    called with a fabricated key and this scope still invents no value for it. The ruling implemented is recorded in
    `report.md`.
14. **Enforce idempotence upstream of the reducer, by state.** The reducer does **not** self-enforce it:
    `lifecycleEventId` hashes `runId` (`rlcontracts.js#L1103`) so the same closure on two days yields two different
    `eventId`s; the `seenEvent` dedup is within-run only (`#L1298`–`#L1305`); and the closure block checks for an
    absent entry and a still-active entry but **not** for an already-closed one (`#L1273`–`#L1281`). Three layers:
    the **due-set gate** (`state === "active"`) is the mechanism, not a check bolted on afterwards; the
    **`indexFingerprint`** (`rlcontracts.js#L1313`–`#L1316`, computed over `{ contractVersion, entries }` only,
    excluding `runId` and `canonicalMonth`) is the byte-identical oracle; and **content-addressed resolution
    objects** are the backstop, with `RTR-RESOLUTION-CONFLICT` aborting a write that would change bytes at an
    existing path.
15. **Implement the closed `not-evaluable` reason set**: `no-committed-series`, `no-committed-reference`,
    `non-semantic-subject`, `neutral-direction-no-magnitude`, `zero-observed-session`, `calendar-coverage-exhausted`
    — each with a human-readable sentence for the Power ledger. The claim is excluded from rate denominators and
    **remains visibly counted** in the coverage line.
16. **Extend the fixture substrate** at `tests/fixtures/recommendation-track-record/bars/**` and `.../calendar/**`
    with synthetic bar series and calendar slices covering each predicate kind, the fence boundary, the path gap,
    each `not-evaluable` reason, and the `early-close` horizon case. One rule violated per negative fixture; every
    fixture carries explicit dates and no fixture reads a clock.
17. **Extend `tests/recommendation-track-record.unit.mjs`, `.functional.mjs`, `.integration.mjs`, and create
    `tests/recommendation-track-record.e2e.mjs`** with this scope's named cases.

---

## Test Plan

Every negative row asserts the **exact** refusal string plus its companion field. The idempotence pair is
deliberately non-tautological: case 2 is an **acceptance** assertion, so it fails if someone hardens the reducer
without telling the resolver, and case 1 fails the moment the due-set predicate is loosened.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-04-U1 | Unit | `unit` | BS-002, BS-003 | `tests/recommendation-track-record.unit.mjs` | All four predicate kinds evaluate correctly against a fenced slice — `threshold`, `relative` (subject minus reference over the same window), `directional` (against `flatBand`), and `spread` (leg minus leg) — each with a satisfied and an invalidated fixture. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u1` |
| T-04-U2 | Unit | `unit` | BS-002, BS-003 | `tests/recommendation-track-record.unit.mjs` | Point comparators evaluate **once** at `resolutionDate`; path comparators (`crosses-above`, `crosses-below`) evaluate over every intervening session using `h` and `l`, and a **gap** in the intervening set closes `unresolved` reason `path-incomplete` rather than evaluating over the partial path. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u2` |
| T-04-U3 | Unit | `unit` | BS-002, BS-003 | `tests/recommendation-track-record.unit.mjs` | Closure event and outcome class are independent: a claim whose predicate is **satisfied** but whose direction-adjusted magnitude is **negative** records `closureEventType: "satisfied"` **and** `outcomeClass: "loss"`. An implementation deriving one axis from the other fails this row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u3` |
| T-04-U4 | Unit | `unit` | BS-002 | `tests/recommendation-track-record.unit.mjs` | `RTR-CLOSURE-VOCAB` fires with its exact code when a closure event outside `CLOSE_EVENT_TYPES` is constructed (`"partially-satisfied"`), and no local extension of the vocabulary is created; `rlcontracts.js` is asserted byte-unmodified. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u4` |
| T-04-U5 | Unit | `unit` | BS-007 | `tests/recommendation-track-record.unit.mjs` | The fence is structural: the slice handed to the evaluator contains **no** row dated after `resolutionDate`, an attempt to consult one fires `RTR-LOOKAHEAD`, **and** the distinct case `bars.asof < resolutionDate` is a **silent skip** that leaves the claim `active` with zero events appended — proving skip and refusal are not conflated. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u5` |
| T-04-U6 | Unit | `unit` | BS-010 | `tests/recommendation-track-record.unit.mjs` | Each of the six `not-evaluable` reasons fires for its own trigger and only its own, and each carries a human-readable sentence; a subject naming a symbol absent from the committed `data/bars` set — **enumerated at test time from `data/bars/index.json` `tickers[].sym` and never asserted as a count literal** — closes `no-committed-series` while a `relative` claim with a missing reference closes `no-committed-reference`. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u6` |
| T-04-U7 | Unit | `unit` | BS-002, BS-003 | `tests/recommendation-track-record.unit.mjs` | `outcomeValue = direction × ret(subject)`: a **correct bearish** claim (`trim`, `direction: -1`) on a series that fell produces a **positive** outcome, and a wrong one produces a negative outcome — the adapter without which every correct bearish call would score as a loss under `rlvalidation.js#L136`. `hold` (`direction: 0`) closes `neutral-direction-no-magnitude`. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-04-u7` |
| T-04-F1 | Functional | `functional` | BS-007 | `tests/recommendation-track-record.functional.mjs` | Horizon expiry is session arithmetic: a Friday `next-session` claim resolves the following Monday, not Saturday; a claim spanning a `holiday` resolves one session later than day arithmetic says; and each derived session date is cross-checked against `calendar.rows[].regular.startUtc` with a mismatch refusing. **Includes the `early-close` case (P-015-07)** — a `next-session` claim proposed the session before `2026-11-27` or `2026-12-24` must resolve **on** that early-close session, not skip it. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-f1` |
| T-04-F2 | Functional | `functional` | BS-007 | `tests/recommendation-track-record.functional.mjs` | `RTR-CALENDAR-COVERAGE` fires with its exact code when a horizon expiry lands beyond `coverageEnd`, the claim closes `not-evaluable` reason `calendar-coverage-exhausted`, and **no** date is extrapolated past the committed window. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-f2` |
| T-04-F3 | Functional | `functional` | BS-002, BS-003 | `tests/recommendation-track-record.functional.mjs` | `withdrawn` is **never** resolver-emitted: no resolver path can construct it, asserted across every predicate kind and every failure branch, including a claim the resolver was about to score as a large loss. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-f3` |
| T-04-F4 | Functional | `functional` | BS-010 | `tests/recommendation-track-record.functional.mjs` | Data-quality gates: an `entryDate` or `resolutionDate` in `zeroObservedSessions` closes `not-evaluable` reason `zero-observed-session`, while a `reconstructedSessions` or `thinObservedSessions` hit **resolves normally** and is recorded verbatim in the resolution object's `provenance`. Blocking on a reconstructed bar would fail the row. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-f4` |
| T-04-I1 | Integration | `integration` | BS-002, BS-003 | `tests/recommendation-track-record.integration.mjs` | The closure enters through `run.closures` with `current: []`, `reduceRecommendationEvents` returns `ok`, exactly one event is appended per due claim, the entry's `state` becomes `"closed"`, and the closure event carries the claim's **original frozen terms**. Calling with a non-empty `current` containing the same key is asserted to fail `recommendation-closure-still-active`, proving the closing-pass discipline is necessary. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-04-i1` |
| T-04-I2 | Integration | `integration` | BS-009 | `tests/recommendation-track-record.integration.mjs` | **Idempotence case 1 — the gate holds.** Pass 2 over an unchanged ledger yields `run.closures.length === 0`, zero appended events, zero new resolution objects, and an `indexFingerprint` **byte-identical** to pass 1. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-04-i2` |
| T-04-I3 | Integration | `integration` | BS-009 | `tests/recommendation-track-record.integration.mjs` | **Idempotence case 2 — the adversarial half.** Feeding `reduceRecommendationEvents` a second closure for an **already-closed** entry, bypassing the due-set gate, asserts the reducer **accepts** it and the `indexFingerprint` **changes**. This is an acceptance assertion on purpose: it fails if the reducer is hardened without telling the resolver, and it is what proves case 1 is load-bearing rather than incidental. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-04-i3` |
| T-04-I4 | Integration | `integration` | BS-009 | `tests/recommendation-track-record.integration.mjs` | `RTR-RESOLUTION-CONFLICT` fires with its exact code when a second resolution for the same `claimHash` would produce different bytes at the same content-addressed path, and the on-disk bytes are asserted **unchanged** afterwards. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-04-i4` |
| T-04-E1 | E2E | `e2e` | BS-002, BS-003, BS-010 | `tests/recommendation-track-record.e2e.mjs` | A full resolve pass over a fixture ledger containing a mix of satisfiable, invalidatable, expiring, path-incomplete and not-evaluable claims produces exactly one closure per due claim, leaves not-yet-due claims `active`, writes one resolution object per closure, and the class partition identity holds over the result. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-04-e1` |
| T-04-V1 | Functional | `functional` | BS-007 | `tests/recommendation-track-record.functional.mjs` | `RTR-NETWORK` fires when the resolver module's source references `fetch(`, `providerFetch(`, `rlProviderConfig`, or any socket/credential surface, and the clean module is asserted to reference none of them — the same idiom as the repo's existing `rlvalid-node-safe-no-dom-storage-network` assertion. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-04-v1` |
| T-04-R1 | Regression E2E | `e2e` | SCN-015-002, SCN-015-003, SCN-015-007, SCN-015-009, SCN-015-010 | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for all five owned scenarios.** A second, permanently-retained resolve pass re-asserts end to end that a satisfied claim resolves positive and an invalidated one negative, that the as-of fence still excludes every future row with `RTR-LOOKAHEAD` firing on an attempt while `bars.asof < resolutionDate` stays a silent skip, that a re-run yields zero closures and a byte-identical `indexFingerprint`, and that a claim with no committed series still closes `not-evaluable`. Unlike `T-04-E1`, which proves the first pass, this row is the standing guard that re-runs on every later scope's pass, so a later change to the reducer bridge, the calendar predicate, or the due-set gate fails here. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-04-r1` |
| T-04-R2 | Regression E2E | `e2e` | SCN-015-009 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the resolver lands, with no pre-existing test removed, skipped, or newly failing — the proof that routing closures through `reduceRecommendationEvents` with `current: []` left every existing lifecycle consumer of `rlcontracts.js` intact rather than only satisfying 015's own fixtures. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-04-r2` |
| T-04-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the resolver, the fixtures and the test cases land, at `baseline + N passed, 0 failed`, where `baseline` is the total captured immediately before this scope's first change and recorded in `report.md`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-04-s1` |

**Test Plan rows: 20.**

---

### Definition of Done

#### Core items

- [ ] `scripts/brief-resolve-outcomes.mjs` exists, runs offline from committed repository state only, and references no `fetch`, socket, provider key, or `RLDATA` browser fetch path.
- [ ] The due set is computed from reduction state (`entry.state === "active"` ∧ has a `claimRef` ∧ `resolutionDate ≤ asOfDate`), never by scanning the ledger for timestamps.
- [ ] `resolutionDate` is derived by **calendar-session** arithmetic against `data/calendars/xnys/calendar.json`, never by adding calendar days, and each derived session date is cross-checked against `calendar.rows[].regular.startUtc`.
- [ ] **Routed finding P-015-07 is recorded as blocking the session predicate.** The `dateState === "regular"` rule in `design.md` → `## D4` skips the two committed `early-close` sessions, which carry non-null `regular` blocks and are real trading days. This scope does **not** silently adopt either rule; it implements whichever the routed decision returns and records the decision in `report.md`.
- [ ] `RTR-CALENDAR-COVERAGE` is implemented; a `resolutionDate` beyond `coverageEnd` refuses and closes `not-evaluable` reason `calendar-coverage-exhausted` with no extrapolation.
- [ ] The as-of fence is a **slice computed once before** predicate evaluation; the evaluator can only see readable rows, and `RTR-LOOKAHEAD` fires on any attempt to consult a row outside it.
- [ ] "Not yet resolvable" (`bars.asof < resolutionDate`) is a silent skip leaving the claim `active` with zero events appended — never an `RTR-LOOKAHEAD` refusal.
- [ ] All four predicate kinds are implemented; point comparators evaluate once at `resolutionDate` and path comparators require the complete intervening session set, closing `unresolved` reason `path-incomplete` on a gap rather than evaluating a partial path.
- [ ] A required session missing from the slice closes `unresolved` reason `session-absent`; no value is ever interpolated.
- [ ] The data-quality gates are applied: `zeroObservedSessions` closes `not-evaluable`; `reconstructedSessions` and `thinObservedSessions` do not block resolution and are recorded verbatim in the resolution object's `provenance`.
- [ ] `outcomeValue = direction × ret(subject)` with `direction` frozen from `ACTION_DIRECTION`; values are stored unrounded as IEEE-754 doubles with rounding applied only at render; `direction === 0` closes `neutral-direction-no-magnitude`.
- [ ] Closure event and `outcomeClass` are recorded as two independent axes; a `satisfied` claim carrying a negative magnitude preserves both facts.
- [ ] `withdrawn` is never resolver-emitted on any path, including for a claim about to score badly.
- [ ] `not-evaluable` closes at the **first** resolver pass after minting, not at horizon expiry, so a known-unscoreable claim never sits in the open pipeline.
- [ ] Closures route through `reduceRecommendationEvents` via `run.closures` with `current: []`; the reducer is consumed unchanged and `rlcontracts.js` is byte-unmodified. `RTR-CLOSURE-VOCAB` refuses a locally-invented closure type.
- [ ] The resolver does not depend on its own closure ordering, because the reducer sorts by `originRecommendationKey` before processing.
- [ ] `lifecycleBinding.originRecommendationKey` is **derived** by calling `deriveRecommendationKeys`, never authored, and is not added to `claimHash`'s term list.
- [ ] **Routed finding P-015-03 is recorded as ruled on, not as blocking.** `thesisFamily` is a top-level hashed claim field that is authored or the claim is not evaluable; this scope invents no value for it, emits no closure event when it is absent, and records the implemented ruling in `report.md` before the bridge is implemented.
- [ ] Idempotence is enforced by the due-set gate, with `indexFingerprint` as the oracle and content-addressed resolution objects as the backstop; `RTR-RESOLUTION-CONFLICT` aborts a byte-changing write without overwriting.
- [ ] The closed `not-evaluable` reason set is implemented, each reason carries a human-readable sentence, and every `not-evaluable` claim is excluded from rate denominators while remaining visibly counted.
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code.
- [ ] No statistic is computed in this scope; `rlvalidation.js` is not imported here.

#### Test items

- [ ] T-04-U1 passes: all four predicate kinds evaluate correctly with satisfied and invalidated fixtures → evidence recorded in `report.md#t-04-u1`. — proves SCN-015-003
- [ ] T-04-U2 passes: point vs path comparator semantics hold and a path gap closes `path-incomplete` → evidence recorded in `report.md#t-04-u2`.
- [ ] T-04-U3 passes: `satisfied` with a negative magnitude preserves both axes → evidence recorded in `report.md#t-04-u3`.
- [ ] T-04-U4 passes: `RTR-CLOSURE-VOCAB` fires and `rlcontracts.js` is byte-unmodified → evidence recorded in `report.md#t-04-u4`.
- [ ] T-04-U5 passes: the fence excludes future rows, `RTR-LOOKAHEAD` fires on an attempt, and not-yet-resolvable is a silent skip → evidence recorded in `report.md#t-04-u5`. — proves SCN-015-007
- [ ] T-04-U6 passes: each of the six `not-evaluable` reasons fires for its own trigger only → evidence recorded in `report.md#t-04-u6`. — proves SCN-015-010
- [ ] T-04-U7 passes: a correct bearish claim yields a positive outcome and `hold` refuses → evidence recorded in `report.md#t-04-u7`.
- [ ] T-04-F1 passes: session arithmetic is correct across weekend, holiday and **early-close** boundaries with the `startUtc` cross-check → evidence recorded in `report.md#t-04-f1`.
- [ ] T-04-F2 passes: `RTR-CALENDAR-COVERAGE` fires beyond `coverageEnd` with no extrapolation → evidence recorded in `report.md#t-04-f2`.
- [ ] T-04-F3 passes: `withdrawn` is unreachable from every resolver path → evidence recorded in `report.md#t-04-f3`.
- [ ] T-04-F4 passes: `zeroObservedSessions` closes not-evaluable while reconstructed and thin sessions resolve with recorded provenance → evidence recorded in `report.md#t-04-f4`.
- [ ] T-04-I1 passes: closures route through the reducer with `current: []`, one event per due claim, frozen terms re-emitted, and the still-active case proven to fail → evidence recorded in `report.md#t-04-i1`. — proves SCN-015-002
- [ ] T-04-I2 passes: **idempotence case 1** — pass 2 is a no-op with a byte-identical `indexFingerprint` → evidence recorded in `report.md#t-04-i2`. — proves SCN-015-009
- [ ] T-04-I3 passes: **idempotence case 2** — the reducer is proven to *accept* a double closure when the gate is bypassed and the fingerprint changes → evidence recorded in `report.md#t-04-i3`.
- [ ] T-04-I4 passes: `RTR-RESOLUTION-CONFLICT` fires and the on-disk bytes are unchanged → evidence recorded in `report.md#t-04-i4`.
- [ ] T-04-E1 passes: a full resolve pass produces one closure per due claim, leaves not-yet-due claims active, and the partition identity holds → evidence recorded in `report.md#t-04-e1`.
- [ ] T-04-V1 passes: `RTR-NETWORK` fires on a network/credential reference and the clean module references none → evidence recorded in `report.md#t-04-v1`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-04-R1] the satisfied and invalidated outcomes, the look-ahead fence with its silent-skip counterpart, the byte-identical re-run fingerprint, and the not-evaluable closure all re-assert as a standing guard → evidence recorded in `report.md#t-04-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-04-R2] the committed Node E2E files and the whole committed Playwright spec suite are green, proving every existing `rlcontracts.js` lifecycle consumer survives the closure routing → evidence recorded in `report.md#t-04-r2`.
- [ ] T-04-S1 passes: `node scripts/selftest.mjs` reports `baseline + N passed, 0 failed` against the scope-start baseline captured in `report.md`, with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-04-s1`.

**Test-related DoD items: 20. Test Plan rows: 20. Parity confirmed.**

**Both halves of the idempotence proof (T-04-I2 and T-04-I3) are named DoD items, per `design.md` → `## D11`
F-015-D4-02. Neither alone is sufficient evidence for FR-006.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `rlcontracts.js` and `rlvalidation.js` byte-unmodified; no committed `data/bars/**` or `data/calendars/**` byte modified; `spec.md` and `design.md` unmodified by this scope; no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlcontracts.js` | Feature 002-owned, read-only. `CLOSE_EVENT_TYPES`, `ACTION_DIRECTION`, `deriveRecommendationKeys` and `reduceRecommendationEvents` are consumed **unchanged**. The reducer is never forked: two lifecycle engines over one ledger would surface as ledger corruption rather than as a test failure. Its `runId`-hashed event ids and permissive closure block are worked **around** by the due-set gate, not patched. |
| `rlvalidation.js` | Feature 007-owned, read-only. This scope computes no statistic and does not import it. |
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

*Educational research context only — not investment advice.*
