# Scope 03 Report: Resolved-flat sentinel and resolution record

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Not started. No implementation, no command execution, and no test evidence is claimed for this
scope. The 2026-08-20 sections below are a **planning correction**: measurements of the current repository and the
ruling they forced. They are not implementation evidence and satisfy no Definition of Done item.

## Summary

Not started. A reality check run before any code was written found **six stale premises and one blocking defect** in
`scope.md`. All seven are recorded below, the blocking defect is ruled on, and the falsified plan text is corrected.
No Definition of Done item is ticked; the count moved from 27 unticked / 0 ticked to **30 unticked / 0 ticked**
because the correction added obligations rather than removing them.

---

## BLOCKER (RESOLVED 2026-08-20) — `magnitude.flatBand` is minted but never validated, so HC-7 is vacuous for any claim without a band

*Preserved as the analysis that produced the ruling. See* ***RULING*** *below for the disposition.*

`scope.md` Implementation Plan step 3 and its matching DoD item both read as though the band were guaranteed:
*"`resolved-flat` is classified against `magnitude.flatBand` frozen into the claim at proposal"*. Scope 01 is `Done`,
so the plan treated the frozen band as an established input.

The band is **minted, not validated**. `rlclaims.js#L678`:

```js
flatBand: claimInput && Number.isFinite(claimInput.flatBand) ? claimInput.flatBand : null
```

That is the whole of it. `evaluateMintReason` (`rlclaims.js#L709-749`) inspects `actionFamily`, `subject.prose`,
`subject.resolvesTo`, `subject.seriesRefs`, `thesisFamily`, `horizon.kind`, `horizon.sessions`, `horizon.eventRef`,
`horizon.resolutionDate`, `predicate` and `direction`. It never inspects `magnitude.flatBand`. A claim can therefore
be **evaluable** — `notEvaluable === null`, the field whose entire purpose is to record honest non-scoreability at
proposal — while carrying no band at all.

### Measured, this session

Minted through the live path (`loadMintContext('.')` → `claims.mintClaim`) from the committed evaluable fixture
`tests/fixtures/recommendation-track-record/claims/evaluable-instrument-add.json`, varying only `claim.flatBand`:

| Probe | Input `flatBand` | `mintClaim` result | `notEvaluable` | Minted `magnitude.flatBand` |
|---|---|---|---|---|
| Control | `0.25` | `ok: true` | `null` | `0.25` |
| **A** | key deleted | `ok: true` — **no refusal** | **`null` — evaluable** | **`null`** |
| **B** | `-0.25` | `ok: true` — **no refusal** | `null` | **`-0.25`, verbatim** |
| **C** | `"0.25"` (string) | `ok: true` — **no refusal** | `null` | **`null`, silently** |

Probe A is the defect as diagnosed. Probes B and C are two further modes that were **not** in the diagnosis and are
strictly worse in one respect each: a negative band is preserved rather than nulled, and a typed-as-string band is
silently discarded so a *typo* becomes *no band* with nothing raised.

### Why this halts the increment rather than merely complicating it

`scope.md` step 3 classifies `|outcomeValue| ≤ flatBand ⇒ resolved-flat`. Measured JS semantics for a degenerate
band:

```text
Math.abs(0)      <= null    -> true
Math.abs(1e-320) <= null    -> false
Math.abs(0.0001) <= null    -> false
Math.abs(0)      <= 0       -> true
Math.abs(1e-320) <= 0       -> false
Math.abs(0)      <= -0.25   -> false      # negative band: resolved-flat NEVER fires, for any value
```

`null` coerces to `0` in a relational comparison, so `|v| ≤ null` **is** `v === 0` — the exact implementation
`T-03-U1` exists to defeat, reached without anyone writing `=== 0`. The design's own argument at
[design.md#L671](../../design.md) is that *"on real price data an exactly-zero return has measure zero, so without a
proposal-time band the resolved-flat class would never fire and HC-7 would be vacuous."* A null band is *precisely*
"without a proposal-time band". A negative band is worse still: `resolved-flat` cannot fire even on an exact zero,
so the class is dead and HC-7 is not merely vacuous but unreachable.

`T-03-U1` would not catch any of it. It is written against fixtures with a finite band, where
`Math.abs(v) <= 0.25` is correct and `=== 0` fails — so it passes green against an implementation that degrades
silently on every claim the fixtures do not represent. The headline row proves the boundary arithmetic is right
*when a band exists*; **nothing in the scope proved a band always exists.**

### Fixture census — the reason no existing row catches this

Every `.json` under `tests/fixtures/recommendation-track-record/claims/` (46 files: 23 input + 23 `.expected.json`),
reading `action.claim.flatBand` on the inputs:

```text
input fixtures            = 23
expected fixtures         = 23
flatBand ABSENT/no-claim  = 0
flatBand explicit null    = 0
flatBand finite           = 23  (negative=0, zero=0)
NULL_OR_ABSENT at INPUT   = 0
```

**Zero committed claim fixtures carry a null or absent `flatBand`; all 23 carry `0.25`.** The degenerate path has no
fixture, no row, and no assertion anywhere in the repository. That is why a defect this direct survived scope 01's
certification: the substrate never expressed it.

For contrast, the live `market-brief.payload.json` carries 5 authored actions and **none** carries a `claim` object
at all, so all 5 would mint with `flatBand: null`. They are independently `not-evaluable` today for other reasons
(no authored subject; `hold` is neutral-direction), so no live claim is currently mis-scored. The exposure is
latent, not yet realised — which is the cheapest possible moment to close it.

### Where the premise went stale

It did not go stale; it was **never established**. `flatBand` appears **0 times in `spec.md`** and **3 times in
scope 01's `scope.md`** — twice in a field *list* and once as a `claimHash` mutation target in `T-01-U2`. Scope 01
proved the band is **hashed**; it never undertook to prove the band is **present or well-formed**. The obligation
fell in the gap between a foundation scope that enumerated the field and a consumer scope that assumed the
enumeration implied validation.

`design.md` had already assigned it, and the assignment was not carried into either scope. [design.md#L295](../../design.md),
the Variation Axes ownership table:

> | Flat band | `magnitude.flatBand`, frozen at proposal — D1, D3 | Split — the value is authored per claim; that
> it must be frozen *before* the outcome is visible is **foundation-owned**, **or HC-7 becomes vacuous** |

The design named both the owner (foundation) and the exact failure mode (HC-7 vacuous). Neither scope implemented it.

### Options, for the decision this requires

1. **Scope 03 obligation — the consumer supplies a default band.** Cheapest. **Rejected outright:** it is a direct
   HC-6 violation. `magnitude` is a hashed term (`rlclaims.js#L73-76`; empirically, deleting `flatBand` changes
   `claimHash` from `sha256:ed109685…` to `sha256:f59ee951…`). A band chosen at scoring time sits **outside** the
   content address, so the same `claimHash` could yield a different `outcomeClass` on a later run and the record
   would no longer be reproducible from its own identity. This is the precise failure the claim object exists to
   prevent.
2. **Scope 03 obligation — the consumer refuses on a degenerate band.** Sound as far as it goes, and cheap. But it
   leaves the claim **minted and stored as evaluable** with `notEvaluable: null`. Scope 01's contract says that
   field means *scoreable*. A claim that cannot be classified is not scoreable, so the stored record stays wrong;
   the defect is merely detected later and further from its cause.
3. **Scope 01 defect — the mint validates the band.** Reopens a `Done` scope, which has a real cost.

---

## RULING — recorded 2026-08-20: the fix is a **scope 01 defect** (`F-015-03-01`); scope 03 additionally asserts it as a **precondition**

**Option 3, with option 2 retained as defence in depth.** Not option 1 under any circumstances.

### Rationale

1. **The design already assigned it to the foundation.** [design.md#L295](../../design.md) says the freeze
   obligation is foundation-owned *"or HC-7 becomes vacuous"*, and [design.md#L671](../../design.md) says the band
   is *"frozen **here**, not chosen at scoring time"* — "here" being D1, the claim contract, which is scope 01.
   Placing the fix in scope 03 would contradict a design decision that was already made and already recorded.
2. **`flatBand` is the lone unvalidated member of `magnitude`.** Its siblings refuse at mint —
   `magnitude-unit-not-allowed` (`#L633`), `magnitude-sign-convention-not-allowed` (`#L635`) — and the closest
   analogue outside the object, `predicate.value`, refuses with `predicate-value-not-finite` (`#L624`). A validated
   `unit`, a validated `signConvention` and an unvalidated `flatBand` in the same frozen object is an **omission**,
   not a design position.
3. **Only the mint can satisfy HC-6.** HC-6 requires the band be frozen *before the outcome is visible*. Mint time
   is the only moment that qualifies. A consumer-side fix can refuse but can never restore the invariant, because by
   then the outcome is visible.
4. **Only the mint keeps `notEvaluable` honest.** A claim with no band is not scoreable. Recording that at proposal
   is exactly what `notEvaluable` is for, and it keeps this scope's partition identity intact — the claim is still
   minted, still stored, still counted, in the `notEvaluable` bucket rather than falling out of the accounting.
5. **The existing test infrastructure makes the scope-01 fix safe and forces its coverage.**
   `tests/recommendation-track-record.e2e.mjs#L363` asserts `[...observed.keys()].sort()` deep-equals
   `[...claims.MINT_REFUSALS].sort()`, with the comment: *"A later scope that drops a refusal, **adds one without
   coverage**, or lets a reason fire for a trigger that is not its own fails here rather than silently."* An eighth
   `MINT_REFUSALS` member therefore **cannot** land without a fixture that triggers it. The guard for this class of
   change already exists and already works.
6. **Doing it from scope 03 would break that guard.** Adding the eighth member from here fails `#L363` until scope
   01's fixture set is extended — which is scope 01's surface. The boundary is not bureaucratic; it is where the
   test coverage lives.

### Consequence for HC-6

**Preserved, and preserved by the only mechanism that can preserve it.** The band stays inside `claimHash`, so the
boundary between `resolved-flat` and `small win` is fixed by the claim's own content address at proposal and cannot
be tuned once the outcome is visible. Scope 03 supplying a default would have voided this: two runs with different
scoring-time defaults would produce different `outcomeClass` values for one `claimHash`, and the content address
would stop determining the outcome. Under this ruling scope 03 **never writes a band**; it reads one or refuses.

### Consequence for HC-7

**Made reachable rather than assumed.** HC-7 requires resolved-flat to be distinguishable from unresolved. With a
null band it collapses to exact-zero, which has measure zero on real price data, so the class never fires and the
distinction is real in the record and absent in practice — a green `T-03-U1` over a dead invariant. With a negative
band it cannot fire at all. Once the mint refuses a degenerate band, every claim reaching the classifier carries a
finite positive band, `resolved-flat` fires on a set of positive measure, and HC-7 has something to be true about.

### Shape of the scope 01 fix (routed, NOT implemented here)

Following the precedent already set in the same module, the two failure kinds are distinct:

| Input | Kind | Precedent |
|---|---|---|
| `flatBand` absent | **mint refusal** → `notEvaluable = { reason, field }`; claim still minted, still counted | `no-authored-predicate` (`#L742`) |
| `flatBand` non-finite, negative, or non-numeric | **contract violation** → `{ ok: false }`; never coerced | `predicate-value-not-finite` (`#L624`), `magnitude-unit-not-allowed` (`#L633`) |

Whether a band of exactly `0` is legal is **an open question for the design owner, not for this scope.**
[design.md#L380](../../design.md) shows `"flatBand": 0.0` in the canonical P5 example while
[design.md#L549](../../design.md) shows `0.25` in the claim-input example. By the design's own measure-zero argument
at `#L671`, a band of `0.0` makes HC-7 vacuous, so the two examples are in tension. `design.md` is outside this
scope's mandate and is unmodified; the tension is recorded here and routed, not resolved.

### Second staleness found while correcting the first — `CLOSE_EVENT_TYPES` is unreachable

`scope.md` cited `CLOSE_EVENT_TYPES` at `rlcontracts.js#L720` in three places (step 8, `T-03-U6`, and the matching
DoD item), and the DoD item required validating against it *"with no local extension created"*. Both halves are
false:

- **The line is wrong.** `CLOSE_EVENT_TYPES` is at **`#L726`**. `#L720` is `ACTION_DIRECTION`, an unrelated constant.
- **The constant is private.** Measured export surface of `rlcontracts.js`: **20 keys**, none matching
  `/clos|EVENT_TYPE/i`. `CLOSE_EVENT_TYPES` is a module-internal `var`. As written the DoD item was
  **unsatisfiable** — the only ways to obtain the vocabulary were the local copy the item forbids, or a routed ask
  to Feature 002 to widen its exports.

There is an established, `Done`, working answer already in the repository. `rlclaims.js#L290-295`:

> *"MARKET_ACTIONS and ACTION_DIRECTION are private to rlcontracts.js — they are NOT on its exported api
> (measured). Rather than shadow them with a second copy that would silently go stale, the two frozen literals are
> read out of rlcontracts.js's own source text. There is therefore exactly one definition in the repository, and if
> either literal moves or changes shape this throws instead of scoring against a stale vocabulary."*

Scope 01 hit this exact problem and solved it with `extractFrozenLiteral` + `readFoundationActionVocabulary`. Scope
03 adopts the same pattern. No Feature 002 ask is needed and no local copy is created.

### Third staleness — scope 02 built a write gate this scope must pass, and the plan never mentions it

`authorizeResolutionWrite(row, resolution)` (`rlclaims.js#L551`) is exported and its own comment names this scope:
*"Scope 03 owns the resolution OBJECT; this owns the single question of whether the target row may be resolved at
all."* Its rule order is load-bearing — the `RTR-LEGACY-BACKFILL` legacy check runs **before** the resolution is
inspected, so no property of a well-formed resolution can rescue a claimless row. `scope.md` mentioned it **0
times** while specifying the write in step 9.

### Premises re-verified this session and found SOUND

Recorded so the correction is not mistaken for a general finding of decay.

| Premise | Verdict |
|---|---|
| `rlvalidation.js#L135` — empty-array **and** non-finite guard → `RLV-OUTCOME-VALUES` | Holds exactly |
| `#L136` wins `value > 0` · `#L137` losses `value < 0` · `#L138` `unresolved` by subtraction | Hold exactly |
| `#L146` `summary.unresolved` · `#L147` `winRate` divides by `outcomes.length` | Hold exactly |
| `rlvalidation.js` deep-freezes results, no monkey-patch seam | Holds — `freezeResult` recurses (`#L9-12`) |
| `briefs/objects/evidence/bundles/<hex>.json` bare-lowercase-hex layout exists | Holds — 136 committed objects |
| All three 015 test files exist and are *extended*, never created | Holds — 968 / 399 / 635 lines |
| `playwright.config.mjs` with a `system-chrome` project; Playwright installed for `--no-install` | Holds |
| `recommendation-track-record-lab.html` does not exist until scope 07 | Holds — absent |
| Scope 01 is `Done`; scope 03 depends on 01 | Holds |

### Plan corrections applied to `scope.md`

No Definition of Done item was ticked. **Test Plan rows 12 → 13. DoD 27 unticked → 30 unticked, 0 ticked.** The
scope became larger, not smaller; no row was deleted or weakened.

| # | Location | Was | Now |
|---|---|---|---|
| R1 | Impl step 3 | the band is *"frozen into the claim at proposal"*, stated as an established input | records that the band is minted **unvalidated**; this scope **asserts it as a precondition and refuses**, never supplies one; mint fix routed as `F-015-03-01` |
| R2 | Impl step 8 | `CLOSE_EVENT_TYPES` at `rlcontracts.js#L720` | `#L726`, plus the source-text extraction pattern, because the constant is private and unexported |
| R3 | Impl step 9 | write *"mirroring … `evidence/bundles/<hex>.json`"* | evidence store is the **naming** precedent (two levels deep); `CLAIM_STORE_DIR` (`#L163`) is the **depth** precedent |
| R4 | Impl step 9 | no mention of the write gate | every write passes `authorizeResolutionWrite` (`#L551`); called, never re-implemented or bypassed |
| R5 | Impl step 12 | boundary fixtures only | adds degenerate-band fixtures — `null`/absent, negative, `0`, non-numeric — because 0 of 23 committed fixtures exercise that path |
| R6 | Impl step 13 | extend `.unit.mjs` and `.functional.mjs` | adds `.e2e.mjs`, which `T-03-R1` already targeted |
| R7 | `T-03-U6` | `#L720`; *"without a local extension being created"* | `#L726`; asserts the vocabulary was read from source, and fails if the six members are shadowed |
| R8 | Test Plan | — | **`T-03-U7` added**: a degenerate band refuses on a claim the mint calls evaluable, and no `outcomeClass` is assigned |
| R9 | `T-03-S1` | *"baseline … captured immediately before this scope's first change"* | adds the clean-worktree-with-dependencies precondition; scope 02 measured `3074 passed, 0 failed` clean versus `1 failed` on a tree carrying another session's uncommitted edits |
| R10 | Test Plan footer | *"Test Plan rows: 12."* | *"Test Plan rows: 13."* |
| R11 | DoD core | — | **two items added**: the band precondition/refusal with no scope-03-supplied default; and the `authorizeResolutionWrite` gate |
| R12 | DoD core | `CLOSE_EVENT_TYPES` … `#L720` *"with no local extension created"* | `#L726`, read from source text, no local copy of the six members |
| R13 | DoD test | — | **`T-03-U7` item added** |
| R14 | DoD footer | *"Test-related DoD items: 12. Test Plan rows: 12."* | *"13. … 13. Parity confirmed."* |
| R15 | Must-not-touch table | `rlclaims.js` absent | added — scope 01-owned and `Done`; `F-015-03-01` is fixed there, and an eighth `MINT_REFUSALS` member added from here would fail the existing assertion at `tests/recommendation-track-record.e2e.mjs#L363` |

### What is unblocked, and what is not

| | State |
|---|---|
| `flatBand` ownership decision | **Resolved.** Scope 01 defect `F-015-03-01`; scope 03 asserts the precondition. |
| `CLOSE_EVENT_TYPES` access | **Resolved.** Source-text extraction, the pattern scope 01 already proved. No Feature 002 ask. |
| Scope 03 implementation | **Schedulable.** Every corrected row is satisfiable as written; `T-03-U7` is testable entirely inside scope 03 and does not depend on the scope-01 fix landing first. |
| `F-015-03-01` (mint-side validation) | **Open, routed to scope 01.** Until it lands, a degenerate-band claim is still minted as evaluable; scope 03 will refuse it rather than mis-classify it, so no wrong number is ever published — but the stored claim stays wrong at its source. |
| Band-of-exactly-`0` legality | **Open, routed to the design owner.** `design.md#L380` shows `0.0`, `#L549` shows `0.25`, and `#L671`'s measure-zero argument implies `0.0` is vacuous. `design.md` unmodified by this pass. |
| `T-03-S1` baseline | **Not captured.** Requires a clean worktree; the tree currently carries 59 uncommitted files from a concurrent session. |

## Test Evidence

No test has been executed for this scope. Every Test Plan row in [scope.md](scope.md) remains unexecuted. The
measurements recorded above are repository observations taken to verify planning premises; they are **not** test
evidence and are not offered against any Test Plan row.

## Completion Statement

Scope 03 is `Not Started`. No Definition of Done item is satisfied, no scope completion is claimed, and no
certification is requested. This pass corrected planning artifacts only: no source file, no test file, no fixture,
no `state.json`, no `uservalidation.md`, `spec.md`, or `design.md` was modified, and no committed ledger byte was
touched.
