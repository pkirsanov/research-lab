# Scope 01: Frozen claim contract

**Status:** Not Started
**Depends On:** — (foundation scope; nothing precedes it)
**Tags:** `foundation:true`
**Design section:** `design.md` → `## D1 — Frozen Claim Contract`
**Business Scenarios owned:** BS-001, BS-008
**UI rows owned:** — (no rendered surface in this scope)
**Refusal codes owned:** `RTR-PREDICATE-AMEND`

**Primary Outcome:**
The contract `brief-recommendation-claim/v1` exists as a frozen, content-addressed object that records, at the
moment of proposal, exactly what a recommendation claimed and exactly what would make it right or wrong: subject,
direction, resolution predicate, horizon, and outcome-magnitude definition. `claimHash` covers every one of those
terms — including `thesisFamily` — and **excludes** exactly four provenance fields, so re-proposing identical terms
in a later run reuses the identical object and amendment is structurally impossible rather than merely discouraged.
Claims are written to `briefs/objects/claims/<hex>.json`, append-only; a write that would change the bytes at an
existing path aborts with `RTR-PREDICATE-AMEND` and never overwrites. The minter refuses rather than guesses: a
positional-fallback subject, an out-of-vocabulary predicate kind, comparator, or horizon kind, and each of D1's four
authored-input absences resolve to their own named reason. On completion, every later scope reads the claim shape,
the hashing rule, the closed vocabularies, and the mint-refusal set from here rather than restating them.

**Scope boundary — this scope is fixture-proven and unblocked.** It authors the contract, the hashing, the store,
and the refusal set against committed fixtures. It does **not** bind to the live publisher; that binding is scope 02
and is gated on routed findings P-015-01 and P-015-02.

---

## Business Scenarios owned

### BS-001: A claim is proposed with a frozen predicate

```gherkin
Scenario: A claim is proposed with a frozen predicate (SCN-015-001)
  Given a recommendation for a named subject with a stated direction and confidence
  When it is published in window W
  Then a claim object persists its subject, direction, predicate, horizon, and magnitude definition
  And the ledger row references that claim by hash
  And the predicate is immutable thereafter
```

The second `Then` clause — the ledger row's reference — is delivered by scope 02 as a named cross-referencing DoD
item, because the row contract is Feature 002-owned and consent-gated. This scope owns the claim object, the hash it
is referenced by, and the immutability.

### BS-008: A predicate amended after the fact is refused

```gherkin
Scenario: A predicate amended after the fact is refused (SCN-015-008)
  Given a frozen claim whose outcome is already observable
  When an amended predicate is submitted for that claim
  Then the amendment is refused
  And the original frozen predicate remains the scoring basis
```

---

## Implementation Plan

1. **Author the `brief-recommendation-claim/v1` contract shape** exactly as `design.md` → `## D1` → *Contract*
   specifies: the binding block (`recommendationKey`, `proposalRunId`, `proposalEventId`, `proposedAt`,
   `citedToolId`), `subject` (`kind`, `prose`, `resolvesTo`, `seriesRefs`, `weighting`), `actionFamily`,
   `direction`, `thesisFamily`, `predicate` (`kind`, `basis`, `comparator`, `value`, `reference`), `horizon`
   (`kind`, `sessions`, `authoredBand`, `resolutionDate`, `eventRef`), `magnitude` (`unit`, `entryBasis`,
   `entryDate`, `signConvention`, `flatBand`), and `claimHash`. Two field-level rules are load-bearing and are not
   restatable later: `subject.prose` retains the key-bearing string **verbatim** — normalising, trimming, or
   symbol-extracting it makes `recommendationKey` unreproducible and silently orphans the claim from its ledger row
   — while `subject.resolvesTo` is the only machine field resolution reads (P-015-01); and `horizon.authoredBand`
   records the payload's own band verbatim and **never** derives `sessions` or `resolutionDate` (P-015-02).
2. **Record `citedToolId` as unhashed provenance and `thesisFamily` as a top-level hashed field.** Per the
   2026-08-18 Claim-Identity Reconciliation the `lifecycleTerms` block is **withdrawn**: it is not authored, not
   declared, and not referenced anywhere in this feature. `citedToolId` sits alongside `proposalRunId` /
   `proposalEventId` / `proposedAt` and is resolved at mint from the authored action's `deepLink` through the
   `tools.json` `file` → `id` map; an absent or unmatched `deepLink` sets `citedToolId: null` and **does not refuse
   the mint**, because dropping a resolvable call over a missing display affordance would shrink the denominator in
   the direction that flatters. `citedToolId` is a **citation**, never the producer — `originToolId` is the
   `market-brief` pipeline constant (D4) and is not a claim field at all. `thesisFamily` is authored, top-level and
   **hashed**: it is the one `origin-recommendation-key/v1` term that varies per claim and is not already carried by
   `subject` / `actionFamily` / `horizon`, so excluding it would break the reducer-key containment invariant and let
   two claims asserting different theses collide on one content address. Routed finding **P-015-03 is RESOLVED** —
   `thesisFamily` is authored or the claim is not evaluable (`no-authored-thesis-family`); this scope still derives,
   defaults, and infers nothing.
3. **Declare the closed vocabularies as frozen module constants**, never as literals at a call site:
   `subject.kind ∈ { instrument, basket, sector, aggregate }` (P1);
   `predicate.kind ∈ { threshold, relative, directional, spread }` (P3);
   `predicate.comparator ∈ { gte, lte, gt, lt, crosses-above, crosses-below }`;
   `horizon.kind ∈ { intraday, next-session, multi-session, event-bound }` (P4);
   `magnitude.unit ∈ { percent-return }`; `magnitude.signConvention ∈ { direction-adjusted }`.
   An out-of-set value refuses; it never passes through and is never coerced.
4. **Bind `actionFamily` and `direction` to the existing foundation vocabularies.** `actionFamily` must be a member
   of `MARKET_ACTIONS` (`rlcontracts.js#L708` — `hold`, `trim`, `add`, `hedge`, `rotate`) and `direction` must equal
   `ACTION_DIRECTION[actionFamily]` (`rlcontracts.js#L714` — `add: 1, rotate: 1, trim: -1, hedge: -1, hold: 0`). The
   claim never carries an independently-authored direction; a mismatch refuses.
5. **Implement `claimHash` as a content-only stable hash** over exactly the **nine** terms
   `{ contractVersion, recommendationKey, subject, actionFamily, direction, thesisFamily, predicate, horizon,
   magnitude }`, following the existing `stableSha` idiom at `scripts/brief-distributed-publish.mjs#L64`
   (`sha256:${sha256Hex(stableStringify(value))}`). The complete unhashed set is exactly **four** fields —
   `proposalRunId`, `proposalEventId`, `proposedAt`, `citedToolId` — recorded on the object and **excluded from the
   hash**, mirroring the existing convention in which `observationFingerprint` hashes terms while
   `lifecycleEventId` (`rlcontracts.js#L1103`) carries `runId`. There is no fifth category and no unhashed block.
   `predicate`, `horizon` and `magnitude` are hashed as **whole objects**, so `horizon.sessions` and
   `horizon.authoredBand` are inside the hash even though the resolver never reads the latter.
6. **Implement the content-addressed write** to `briefs/objects/claims/<claimHash-hex>.json`, following the layout
   already on disk — bare lowercase sha256 hex filename, `.json` extension, one object per file, as in
   `briefs/objects/evidence/bundles/<hex>.json` (verified this run). The `sha256:` prefix that `stableSha` returns is
   stripped for the filename and retained in the object body and in any reference to it. Claims are **append-only**:
   never rewritten, never deleted, never garbage-collected, because a deleted claim silently removes a call from the
   denominator.
7. **Implement `RTR-PREDICATE-AMEND`.** Re-minting an identical claim is a byte-identical no-op write. A write that
   would change the bytes at an existing path aborts with `RTR-PREDICATE-AMEND` and never overwrites. Because every
   scoring-relevant field is inside `claimHash`, a genuine amendment yields a *different* path — so the refusal fires
   only on the case that matters: a same-path, different-bytes write.
8. **Implement the closed mint-refusal reason set — seven reasons, each naming the field that caused it.** Each is
   recorded on the claim's not-evaluable path rather than silently dropping the call, so the coverage line can name
   *which* input was missing instead of showing one opaque bucket. `non-semantic-subject` when `subject` or `family`
   came from the publisher's positional fallbacks (`action-${index}` at
   `scripts/brief-distributed-publish.mjs#L403`, `'note'` at `#L404`) — minting a claim on `action-3` creates a
   resolvable-looking claim whose subject means nothing. `no-committed-series` when `subject.seriesRefs` is empty or
   when **any** member names a symbol absent from the committed `data/bars/*.json` set; that set is **enumerated at
   test time from the directory itself and never asserted as a literal**, per the F-015-D5-02 no-literal-count rule.
   `neutral-direction-no-magnitude` when `direction === 0` (`hold`), which has no signed outcome to define. Plus
   D1's four authored-input absences, one code per missing field: `no-authored-subject` (absent or empty
   `resolvesTo`), `no-authored-horizon` (absent horizon mechanics), `no-authored-thesis-family` (absent
   `thesisFamily`), `no-authored-predicate` (absent predicate). **`unresolvable-owning-tool` is retired** — an
   unmatched `deepLink` now yields `citedToolId: null` rather than a refusal, so the code has no trigger left and
   carrying it forward would refuse a mint D1 requires to succeed.

   *Sizing observation, dated and deliberately not a constant:* the committed bars tree held **293** files on
   2026-08-18 (`find data/bars -maxdepth 1 -type f -name '*.json' | wc -l`). It is recorded here only to size the
   fixture set and is **not** carried into any test, fixture, DoD item, or source literal.
9. **Create `tests/fixtures/recommendation-track-record/claims/**`** as the fixture substrate: each fixture is a
   `brief-recommendation-claim/v1`-conforming (or deliberately non-conforming) JSON literal with a sibling
   `*.expected.json` naming the expected outcome and, for negatives, the expected refusal reason. **One rule violated
   per negative fixture.** Every fixture carries explicit dates; no fixture reads a clock.
10. **Create `tests/recommendation-track-record.support.mjs`** with the shared fixture loader, the exact-code
    assertion helper (asserting the refusal string plus its companion field), and the byte-comparison helper used by
    the content-addressed-write tests. It carries no assertions of its own and is imported, never run directly.
11. **Create `tests/recommendation-track-record.unit.mjs` and `tests/recommendation-track-record.functional.mjs`**
    carrying this scope's named cases. Both files are extended — never rewritten — by later scopes.

---

## Shared Infrastructure Impact Sweep

Three of this scope's deliverables are **shared substrate**, not scope-local files:
`tests/recommendation-track-record.support.mjs`, the fixture root `tests/fixtures/recommendation-track-record/**`,
and the two test files that scopes 02 – 10 extend rather than replace. Every later scope in this feature imports the
first, extends the second, and appends to the third. That makes this scope's blast radius the whole feature: a
decision made here in scope 05 lands inside scope 02's already-green cases without scope 02 being opened at all.

**Downstream contract surfaces**

| Downstream contract | What depends on it | What breaks if it changes silently |
|---|---|---|
| The support module's export surface — the fixture loader, the exact-code assertion helper, the byte-comparison helper | Every `tests/recommendation-track-record.*.mjs` file authored by scopes 02 – 10 | A changed signature fails nine files at once, at a point where the failure presents as nine unrelated defects rather than one substrate defect. |
| Import side-effect freedom — the support module carries no assertions of its own and is imported, never run directly | The captured-baseline arithmetic, and every importing file's own count | An assertion registered at import time shifts every importing file's total, and AC-018's *"no pre-existing count decreasing"* stops being arithmetic anyone can read. |
| The fixture layout and the `*.expected.json` sibling convention | Scopes 02, 03, 04, 05, 08 and 09, which each extend the same root with their own subtree on this convention | A sibling named `*.expect.json` in one scope loads as *no expectation at all*, so that scope's negative inputs pass for the wrong reason while reporting green. |
| The no-clock rule — every input carries its own explicit dates and none reads a clock | The determinism rows `T-05-I2` and `T-09-F7`, which assert byte-identity across runs | A loader that defaulted a missing date to the current time makes those rows intermittently green, which is strictly worse than failing. |
| Loader **ordering** — inputs are returned in a stable, content-derived order | Any later row asserting byte-identical serialized output | An order inherited from directory-read order makes determinism a property of the filesystem rather than of the code. |
| The `briefs/objects/` tree, which already holds `briefs/objects/evidence/bundles/<hex>.json` | The committed brief pipeline that reads that tree | A new sibling directory under a tree an existing reader globs is the cheapest available way to perturb a pipeline nobody edited. |
| `node scripts/selftest.mjs` at the **baseline captured at scope start** and recorded in `report.md` | The repo-wide baseline that every scope's `T-NN-S1` row re-asserts | The baseline may grow additively to `baseline + N`; it may not shrink, and no pre-existing group's count may fall. The baseline is **captured, never pinned**: the figure planning recorded on 2026-07-29 was `952 passed, 0 failed` and re-measuring on 2026-08-18 returned `2487 passed, 0 failed`, exit 0, so any literal written into a row is wrong within weeks and fails for a reason that has nothing to do with this scope. |

**Canary before broad reruns.** `T-01-C1` is an independent canary over the substrate's own contracts — the export
surface, import side-effect freedom, a round-trip load of one input of each shape, the stable loader ordering, and
the unchanged captured baseline with every pre-existing group line byte-identical. It runs in seconds
and **before** `T-01-R1` and `T-01-R2`, so a substrate defect is named as a substrate defect instead of surfacing as
a scatter of unrelated failures at the end of a full browser suite.

**Rollback and restore.** This scope creates only new files, so its restore target is *absent*: discarding the
support module and the fixture root and clearing any untracked input returns the repo to its exact pre-scope state.
`T-01-C2` rehearses that rather than asserting it on paper, and it rehearses it in a **disposable detached
worktree** so the live tree — which concurrent sessions share — is never touched. Once scopes 02 – 10 import the
module, the same discard is the back-out for a bad substrate change; rehearsing it now is what proves the back-out
works while the blast radius is still one scope wide.

---

## Change Boundary

This scope is purely additive: it creates new files and modifies none. That is precisely why it can be the
foundation scope, and the boundary below is what keeps *"purely additive"* a checked fact rather than an intention.

**Allowed file families** — the only families this scope may create:

| Family | Nature of the change |
|---|---|
| The 015-owned claim-contract module | New file. The contract shape, the six closed vocabularies, `claimHash`, the content-addressed write, and the closed mint-refusal set. |
| `tests/recommendation-track-record.support.mjs` | New file. Loader, exact-code assertion helper, byte-comparison helper; no assertions of its own. |
| `tests/fixtures/recommendation-track-record/claims/**` | New inputs with their `*.expected.json` siblings, one rule violated per negative input. |
| `tests/recommendation-track-record.unit.mjs`, `.functional.mjs`, `.e2e.mjs`, `.canary.mjs` | New files, created here and **extended** — never rewritten — by scopes 02 – 10. |
| `briefs/objects/claims/**` | Written at runtime by the store under test; append-only, never rewritten and never garbage-collected. |
| `specs/015-recommendation-outcome-ledger-and-track-record/scopes/01-frozen-claim-contract/**` and this scope's sections of `report.md` | The planning and evidence artifacts this scope owns. |

**Excluded surfaces** — byte-untouched, no exceptions:

| Surface | Why it is out of bounds |
|---|---|
| `rlvalidation.js` | Feature 007-owned. This scope computes no statistic and does not import it. |
| `rlcontracts.js` | Feature 002-owned. `MARKET_ACTIONS` and `ACTION_DIRECTION` are read; nothing is forked or shadowed. |
| The persisted `rldata.js` cache schema | Feature 013-protected (FR-021, AC-012). Nothing is persisted to any cache and no key is created. |
| The Market Action Center four-view composition | Feature 012-owned (`RLMKT-VIEW`). No view id is declared. |
| `scripts/selftest.mjs`, `scripts/validate-brief-payload.mjs`, `scripts/validate-market-action.mjs`, `scripts/validate-tool-experience.mjs` | The baseline and its committed validators. This scope adds no import and edits no assertion; wiring one in is scope 09's single named change. |
| Every pre-existing file under `tests/` belonging to another feature | Extending a neighbouring feature's test file to reuse a helper is the most tempting breach available here, and it is forbidden outright. |
| `briefs/history/**`, `data/bars/**`, `data/calendars/**` | Committed read-only substrate, read for existence checks only. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json`, `simple-models.json` | Counted registries — scope 10 only. `tools.json` is **read** to resolve `citedToolId` from the authored `deepLink` and is never written. |
| Every other `scopes/NN-*/` directory and every other `specs/**` directory | Owned by sibling scopes and by concurrent sessions. |

**Collateral cleanup is opt-in, never implicit.** A pre-existing lint finding, an unused import, or a stale comment
noticed in a neighbouring file while working here is recorded and routed — it is not corrected in this change. The
entire value of `T-01-C2`'s restore rehearsal comes from the change set being small enough to back out cleanly, and
one unrelated correction is enough to destroy that property.

---

## Test Plan

Every negative row asserts the **exact** refusal string plus its companion field; *"some refusal occurred"* is not
coverage. Every negative row uses at least one input a permissive implementation would have accepted, so reverting
the behaviour under test makes the row fail. No row contains an early-exit bailout.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-01-U1 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | `claimHash` is content-only across **exactly** the four unhashed fields: two claims with identical hashed terms but differing `proposalRunId`, `proposalEventId`, `proposedAt` **and** `citedToolId` produce the **same** hash, proving provenance is excluded and re-proposal is idempotent by construction. The adversarial half is what makes the row detect the withdrawn `lifecycleTerms` placement rather than certify it: the same pair mutated only in `thesisFamily` must produce a **different** hash, so an implementation still carrying `thesisFamily` as unhashed provenance passes the first half and fails the second. This row asserts the hash **function** only — the store-level consequence of two objects sharing an address is `T-01-F1` and `T-01-F2`, so nothing here asserts a byte-changing write and nothing here contradicts step 7's `RTR-PREDICATE-AMEND` abort. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u1` |
| T-01-U2 | Unit | `unit` | BS-008 | `tests/recommendation-track-record.unit.mjs` | Every hashed field is load-bearing: **eleven** mutations spanning the nine hashed terms (`subject`, `actionFamily`, `direction`, `thesisFamily`, each of `predicate.kind`/`comparator`/`value`, `horizon.resolutionDate`, `horizon.sessions`, `horizon.authoredBand`, `magnitude.flatBand`), each yielding a **different** `claimHash`. `thesisFamily` and `horizon.authoredBand` are the two a permissive implementation is likeliest to omit — the first because the withdrawn `lifecycleTerms` placement held it unhashed, the second because the resolver never reads it — so a hash covering only the terms resolution consumes fails the row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u2` |
| T-01-U3 | Unit | `unit` | BS-008 | `tests/recommendation-track-record.unit.mjs` | `RTR-PREDICATE-AMEND` fires with its exact code on a write that would change bytes at an existing `briefs/objects/claims/<hex>.json` path, and the on-disk bytes are asserted **unchanged** afterwards. A refusal that still overwrote would fail the row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u3` |
| T-01-U4 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | The minter refuses `non-semantic-subject` for a subject matching the publisher's positional fallback and separately for `family === 'note'`, on an action that is otherwise complete and mint-eligible — the case a permissive minter most wants through. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u4` |
| T-01-U5 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | `no-committed-series` fires for an empty `seriesRefs` array and separately for a `seriesRefs` whose **first member resolves and whose second does not** — the case a permissive implementation that checks only `seriesRefs[0]` would accept — with the committed symbol set enumerated from `data/bars/` at test time and never asserted as a count literal; the not-evaluable-at-mint path is recorded explicitly rather than failing opaquely at resolution, and the claim object is still written with its reason. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u5` |
| T-01-U6 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | Each closed vocabulary refuses a value **one character off** a legal member (`subject.kind`, `predicate.kind`, `predicate.comparator`, `horizon.kind`, `magnitude.unit`), so a `startsWith` or prefix check fails the row; and `actionFamily` outside `MARKET_ACTIONS` refuses. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u6` |
| T-01-U7 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | `direction` is never independently authored: a claim declaring `actionFamily: "trim"` with `direction: 1` refuses, while `direction: -1` is accepted, proving the value is bound to `ACTION_DIRECTION` rather than trusted; `direction: 0` (`hold`) refuses `neutral-direction-no-magnitude`. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u7` |
| T-01-F1 | Functional | `functional` | BS-008 | `tests/recommendation-track-record.functional.mjs` | Content-addressed write round-trip: minting an identical claim twice produces one file whose bytes are identical across both passes, the filename equals the bare lowercase hex of `claimHash`, and the object body retains the `sha256:` prefix. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-01-f1` |
| T-01-F2 | Functional | `functional` | BS-001 | `tests/recommendation-track-record.functional.mjs` | `citedToolId` is a citation — neither identity nor the producer. It resolves from a `deepLink` matching a real `tools.json` `file` to that tool's `id`, and the resolved value is asserted **not** to equal the `market-brief` producer constant, so conflating the citation with `originToolId` fails the row. An absent or unmatched `deepLink` sets `citedToolId: null` and the claim is **still minted and still counted** — the adversarial input, since the retired `unresolvable-owning-tool` behaviour would refuse that action and fail the row. Re-minting an otherwise identical claim carrying a **different** `citedToolId` yields the same `claimHash`, is a no-op that **reuses the first object**, leaves the on-disk bytes carrying the **first** citation, and does **not** fire `RTR-PREDICATE-AMEND` — which is how an unhashed provenance field coexists with step 7's byte-changing abort instead of contradicting it. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-01-f2` |
| T-01-F3 | Functional | `functional` | BS-001, BS-008 | `tests/recommendation-track-record.functional.mjs` | `recommendationKey` is one-to-many with `claimHash`: two claims sharing `{subject, family}` but declaring different `horizon.kind` mint to the **same** `recommendationKey` and **different** `claimHash` values, and both objects coexist on disk. This is the property that makes a same-key/different-horizon pair individually resolvable without touching the publisher's key derivation. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-01-f3` |
| T-01-C1 | Fixture Canary | `unit` | BS-001 | `tests/recommendation-track-record.canary.mjs` | **Canary: the shared substrate's own contracts, asserted before any broad rerun.** `tests/recommendation-track-record.support.mjs` exports exactly the loader, the exact-code assertion helper and the byte-comparison helper and nothing else; importing it registers **zero** tests, prints nothing and opens no file; one input of each fixture shape round-trips through the loader with its `*.expected.json` sibling resolved and its dates read from the input rather than a clock; the loader returns a stable order across two runs; and `node scripts/selftest.mjs` still reports the **baseline captured at scope start and recorded in `report.md`**, `0 failed`, with every pre-existing group line byte-identical. The baseline is compared against that captured value rather than a literal, because a pinned figure fails on unrelated repo growth instead of on a substrate defect. Runs in seconds and **before** `T-01-R1` / `T-01-R2`, so a substrate defect is named at the substrate. | `node --test tests/recommendation-track-record.canary.mjs` | No | `report.md#t-01-c1` |
| T-01-C2 | Fixture Canary | `functional` | BS-001 | `tests/recommendation-track-record.canary.mjs` | **Canary: the restore path is rehearsed in a disposable worktree, never on the live tree.** A detached `git worktree` is created at the pre-scope commit; `node scripts/selftest.mjs` is run inside it and asserted to equal the **baseline captured at scope start**, `0 failed`, with its group lines byte-identical to the pre-existing lines of the post-scope run; `git status --porcelain` in the live tree is asserted to contain no entry outside this scope's allowed file families; and the worktree is torn down on exit, success or failure. This is the back-out for a bad substrate change once scopes 02 – 10 import it, rehearsed while the blast radius is still one scope wide. | `node --test tests/recommendation-track-record.canary.mjs` | No | `report.md#t-01-c2` |
| T-01-R1 | Regression E2E | `e2e` | BS-001, BS-008 | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for BS-001 and BS-008.** A full mint pass over the fixture claim set re-asserts, end to end against the real `briefs/objects/claims/` layout, that re-minting identical terms is a byte-identical no-op, that a byte-changing write at an existing path aborts with `RTR-PREDICATE-AMEND` leaving the on-disk bytes unchanged, and that each of the **seven** mint-refusal reasons still fires for its own trigger and only its own. The row additionally re-asserts that an unmatched `deepLink` still **mints** with `citedToolId: null`, so a later scope that reinstates the retired `unresolvable-owning-tool` refusal fails here. The row is permanent and re-runs in every later scope's pass, so a later scope that narrows the hashed-term list, softens the append-only store, or drops a refusal fails here rather than silently. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-01-r1` |
| T-01-R2 | Regression E2E | `e2e` | BS-001, BS-008 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the claim module, the store and the fixtures land, with no pre-existing test removed, skipped, or newly failing. This is the row that proves the new content-addressed tree under `briefs/objects/` did not disturb the committed brief pipeline that reads the same tree. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-01-r2` |
| T-01-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the claim module, the fixtures, the support module and the two test files land, at `baseline + N passed, 0 failed`, where `baseline` is the total captured immediately before this scope's first change and recorded in `report.md`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-01-s1` |

**Test Plan rows: 15.**

---

### Definition of Done

#### Core items

- [ ] The `brief-recommendation-claim/v1` contract is implemented with every field named in `design.md` → `## D1` → *Contract*, and no field beyond them. The withdrawn `lifecycleTerms` block is **absent**: the identifier appears nowhere in 015-authored source, fixtures, or tests.
- [ ] `citedToolId` is recorded on the object and **excluded from `claimHash`**, joining `proposalRunId` / `proposalEventId` / `proposedAt` as the complete four-field unhashed set; there is no fifth unhashed field and no unhashed block.
- [ ] `citedToolId` is resolved at mint from the authored action's `deepLink` through `tools.json` `file` → `id`; an absent or unmatched `deepLink` sets it to `null` and the claim is **still minted**. It is never authored, defaulted, or guessed, and it is never conflated with `originToolId`, which is the `market-brief` pipeline constant (D4) and is not a claim field.
- [ ] `thesisFamily` is a **top-level, hashed** claim field. It is authored or the claim mints `not-evaluable` with reason `no-authored-thesis-family`; no value is derived from `actionFamily`, `direction`, or `horizon`, defaulted, or inferred from prose. Routed finding P-015-03 is **RESOLVED** and its ruling is recorded in `report.md`.
- [ ] The six closed vocabularies (`subject.kind`, `predicate.kind`, `predicate.comparator`, `horizon.kind`, `magnitude.unit`, `magnitude.signConvention`) are frozen module constants, not literals at call sites, and an unrecognised value refuses rather than passing through.
- [ ] `actionFamily` is validated against `MARKET_ACTIONS` (`rlcontracts.js#L708`) and `direction` is bound to `ACTION_DIRECTION` (`rlcontracts.js#L714`); `rlcontracts.js` is read only and is not modified, forked, or shadowed.
- [ ] `claimHash` covers exactly the nine terms `{ contractVersion, recommendationKey, subject, actionFamily, direction, thesisFamily, predicate, horizon, magnitude }` and excludes exactly the four provenance fields, so every varying term of `origin-recommendation-key/v1` is inside the hash and one claim object can only ever derive one reducer key.
- [ ] Claims are written to `briefs/objects/claims/<claimHash-hex>.json` with a bare lowercase hex filename matching the on-disk layout of `briefs/objects/evidence/bundles/<hex>.json`, and the store is append-only — nothing is rewritten, deleted, or garbage-collected.
- [ ] `RTR-PREDICATE-AMEND` is implemented and aborts a byte-changing write at an existing path without overwriting.
- [ ] The closed seven-reason mint-refusal set (`non-semantic-subject`, `no-committed-series`, `neutral-direction-no-magnitude`, `no-authored-subject`, `no-authored-horizon`, `no-authored-thesis-family`, `no-authored-predicate`) is implemented, each refusal names the field that caused it, and the retired `unresolvable-owning-tool` code is absent from the source.
- [ ] `no-committed-series` is evaluated against `subject.seriesRefs` (plural) with the committed symbol set **enumerated from `data/bars/` at run time**; no count literal for that tree appears in any 015-authored source, fixture, test name, or DoD item.
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code.
- [ ] `tests/fixtures/recommendation-track-record/claims/**` exists with one rule violated per negative fixture, a sibling `*.expected.json` naming the expected refusal reason and field, and explicit dates on every fixture with no clock read.
- [ ] `tests/recommendation-track-record.support.mjs` exists and provides the fixture loader, the exact-code assertion helper, and the byte-comparison helper; it contains no assertions of its own.
- [ ] This scope creates only new files and modifies **no** existing file, so no Feature 002, 007, 012 or 013 surface is opened.
- [ ] No statistic of any kind is computed in this scope; `rlvalidation.js` is not imported here.
- [ ] Change Boundary is respected and zero excluded file families were changed — `rlvalidation.js`, `rlcontracts.js`, the persisted `rldata.js` cache schema, the Center four-view composition, `scripts/selftest.mjs`, the three committed sibling validators, every counted registry, every committed `briefs/history/**` and `data/**` byte, and every neighbouring feature's test file are byte-identical at the end of the scope, verified by `git status --porcelain` diffed against the allowed-family list with the raw output recorded in `report.md`.

#### Test items

- [ ] T-01-U1 passes: `claimHash` is proven content-only across the four unhashed fields **and** proven to change when `thesisFamily` alone changes → evidence recorded in `report.md#t-01-u1`. — proves SCN-015-001
- [ ] T-01-U2 passes: all eleven hashed-term mutations, including `thesisFamily` and `horizon.authoredBand`, yield distinct hashes → evidence recorded in `report.md#t-01-u2`.
- [ ] T-01-U3 passes: `RTR-PREDICATE-AMEND` fires with its exact code and the on-disk bytes are asserted unchanged → evidence recorded in `report.md#t-01-u3`. — proves SCN-015-008
- [ ] T-01-U4 passes: `non-semantic-subject` fires for both positional fallbacks on an otherwise mint-eligible action → evidence recorded in `report.md#t-01-u4`.
- [ ] T-01-U5 passes: `no-committed-series` fires for an empty `seriesRefs` and for a `seriesRefs` whose second member is absent from the run-time-enumerated `data/bars/` set → evidence recorded in `report.md#t-01-u5`.
- [ ] T-01-U6 passes: every closed vocabulary refuses a one-character-off value, defeating a prefix check → evidence recorded in `report.md#t-01-u6`.
- [ ] T-01-U7 passes: `direction` is bound to `ACTION_DIRECTION` rather than trusted, and `hold` refuses → evidence recorded in `report.md#t-01-u7`.
- [ ] T-01-F1 passes: the content-addressed write is a byte-identical no-op on re-mint and the filename equals the bare hex → evidence recorded in `report.md#t-01-f1`.
- [ ] T-01-F2 passes: `citedToolId` resolves to the cited tool and not the `market-brief` constant, an unmatched `deepLink` still mints with `citedToolId: null`, and mutating `citedToolId` leaves `claimHash` byte-identical while reusing the first object without firing `RTR-PREDICATE-AMEND` → evidence recorded in `report.md#t-01-f2`.
- [ ] T-01-F3 passes: `recommendationKey` is proven one-to-many with `claimHash` and both objects coexist → evidence recorded in `report.md#t-01-f3`.
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns — [T-01-C1] the support module's export surface, its import side-effect freedom, a round-trip load of each fixture shape with its `*.expected.json` sibling resolved, the stable loader ordering, and the baseline **captured at scope start and recorded in `report.md`** re-asserted unchanged with `0 failed` and byte-identical group lines are all asserted **before** `T-01-R1` and `T-01-R2` run → evidence recorded in `report.md#t-01-c1`.
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified — [T-01-C2] the pre-scope state is reconstructed in a disposable detached worktree, the baseline there is asserted to equal the captured scope-start baseline with `0 failed` and byte-identical group lines, the live tree is asserted to carry no entry outside the allowed file families, and the worktree is torn down on exit whether the rehearsal succeeded or failed → evidence recorded in `report.md#t-01-c2`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-01-R1] the re-mint no-op, the `RTR-PREDICATE-AMEND` byte-preserving abort, all seven mint refusals, and the unmatched-`deepLink` mint with `citedToolId: null` re-assert end to end against the real claim store → evidence recorded in `report.md#t-01-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-01-R2] the committed Node E2E files and the whole committed Playwright spec suite are green with no pre-existing test removed, skipped, or newly failing → evidence recorded in `report.md#t-01-r2`.
- [ ] T-01-S1 passes: `node scripts/selftest.mjs` reports `baseline + N passed, 0 failed` against the scope-start baseline captured in `report.md`, with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-01-s1`.

**Test-related DoD items: 15. Test Plan rows: 15. Parity confirmed.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `spec.md` and `design.md` unmodified by this scope; no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlvalidation.js` | Feature 007-owned, read-only. This scope computes no statistic and does not import it. |
| `rlcontracts.js` | Feature 002-owned, read-only. `MARKET_ACTIONS`, `ACTION_DIRECTION` and `CLOSE_EVENT_TYPES` are consumed, never modified, forked, or shadowed. |
| `briefs/history/recommendations/*.jsonl` | The ledger row contract is Feature 002-owned and is scope 02's consent-gated concern. This scope writes no ledger row. |
| `scripts/brief-distributed-publish.mjs` | The live publisher binding is scope 02 and is gated on P-015-01 / P-015-02. This scope reads it for the key derivation and the positional fallbacks only. |
| `rldata.js`, `rlbrief.js`, `rlmarketaction.js` | Cache schema and Center surfaces. No claim-contract work touches them. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json` | Counted registries. Scope 10 only. This scope **reads** `tools.json` to resolve `citedToolId` from the authored `deepLink`; it writes nothing to it. |
| `recommendation-track-record-lab.html` | Does not exist until scope 07. |
| `scripts/validate-recommendation-track-record.mjs` | The consolidated validator is scope 09. This scope's refusals are proven by `node --test`. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
