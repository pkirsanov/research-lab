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
terms and **excludes** provenance, so re-proposing identical terms in a later run reuses the identical object and
amendment is structurally impossible rather than merely discouraged. Claims are written to
`briefs/objects/claims/<hex>.json`, append-only; a write that would change the bytes at an existing path aborts with
`RTR-PREDICATE-AMEND` and never overwrites. The minter refuses rather than guesses: a positional-fallback subject, an
out-of-vocabulary predicate kind, comparator, or horizon kind, and an unresolvable owning tool each refuse with a
named reason. On completion, every later scope reads the claim shape, the hashing rule, the closed vocabularies, and
the mint-refusal set from here rather than restating them.

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
   specifies: the binding block (`recommendationKey`, `proposalRunId`, `proposalEventId`, `proposedAt`), `subject`
   (`kind`, `id`, `seriesRef`), `actionFamily`, `direction`, `predicate` (`kind`, `basis`, `comparator`, `value`,
   `reference`), `horizon` (`kind`, `resolutionDate`, `eventRef`), `magnitude` (`unit`, `entryBasis`, `entryDate`,
   `signConvention`, `flatBand`), and `claimHash`.
2. **Add the `lifecycleTerms` provenance block** — `{ originToolId, thesisFamily }` — resolving the placement half of
   `design.md` → `## D11` F-015-D4-01. It sits alongside `proposalRunId` / `proposalEventId` / `proposedAt` and is
   **excluded from `claimHash`**, so D1's hashed term list is unchanged and every previously computable hash stays
   byte-stable. `originToolId` is derived at mint from the authored action's `deepLink` mapped through `tools.json`
   `file` → `id`. **`thesisFamily` has no live source (routed finding P-015-03)**; this scope declares the field and
   its refusal path, and scope 04 carries the blocking tag for the reducer bridge that consumes it.
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
5. **Implement `claimHash` as a content-only stable hash** over exactly
   `{ contractVersion, recommendationKey, subject, actionFamily, direction, predicate, horizon, magnitude }`,
   following the existing `stableSha` idiom at `scripts/brief-distributed-publish.mjs#L64`
   (`sha256:${sha256Hex(stableStringify(value))}`). `proposalRunId`, `proposalEventId`, `proposedAt` and
   `lifecycleTerms` are recorded on the object and **excluded from the hash**, mirroring the existing convention in
   which `observationFingerprint` hashes terms while `lifecycleEventId` (`rlcontracts.js#L1103`) carries `runId`.
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
8. **Implement the closed mint-refusal reason set.** `non-semantic-subject` when `subject` or `family` came from the
   publisher's positional fallbacks (`action-${index}` at `scripts/brief-distributed-publish.mjs#L403`, `'note'` at
   `#L404`) — minting a claim on `action-3` creates a resolvable-looking claim whose subject means nothing.
   `no-committed-series` when `subject.seriesRef` is `null` or names a file absent from the 289 committed
   `data/bars/*.json`. `unresolvable-owning-tool` when `deepLink` is absent or does not match a `tools.json` `file`.
   `neutral-direction-no-magnitude` when `direction === 0` (`hold`), which has no signed outcome to define.
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
| Import side-effect freedom — the support module carries no assertions of its own and is imported, never run directly | The `952 passed, 0 failed` baseline arithmetic, and every importing file's own count | An assertion registered at import time shifts every importing file's total, and AC-018's *"no pre-existing count decreasing"* stops being arithmetic anyone can read. |
| The fixture layout and the `*.expected.json` sibling convention | Scopes 02, 03, 04, 05, 08 and 09, which each extend the same root with their own subtree on this convention | A sibling named `*.expect.json` in one scope loads as *no expectation at all*, so that scope's negative inputs pass for the wrong reason while reporting green. |
| The no-clock rule — every input carries its own explicit dates and none reads a clock | The determinism rows `T-05-I2` and `T-09-F7`, which assert byte-identity across runs | A loader that defaulted a missing date to the current time makes those rows intermittently green, which is strictly worse than failing. |
| Loader **ordering** — inputs are returned in a stable, content-derived order | Any later row asserting byte-identical serialized output | An order inherited from directory-read order makes determinism a property of the filesystem rather than of the code. |
| The `briefs/objects/` tree, which already holds `briefs/objects/evidence/bundles/<hex>.json` | The committed brief pipeline that reads that tree | A new sibling directory under a tree an existing reader globs is the cheapest available way to perturb a pipeline nobody edited. |
| `node scripts/selftest.mjs` at **952 passed, 0 failed** (verified this planning run) | The repo-wide baseline that every scope's `T-NN-S1` row re-asserts | The baseline may grow additively to `952 + N`; it may not shrink, and no pre-existing group's count may fall. |

**Canary before broad reruns.** `T-01-C1` is an independent canary over the substrate's own contracts — the export
surface, import side-effect freedom, a round-trip load of one input of each shape, the stable loader ordering, and
the unchanged `952 passed, 0 failed` baseline with every pre-existing group line byte-identical. It runs in seconds
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
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json`, `simple-models.json` | Counted registries — scope 10 only. `tools.json` is **read** to resolve `originToolId` and is never written. |
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
| T-01-U1 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | `claimHash` is content-only: two claims with identical hashed terms but different `proposalRunId`, `proposalEventId`, `proposedAt` and `lifecycleTerms` produce the **same** hash, proving provenance is excluded and re-proposal is idempotent by construction. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u1` |
| T-01-U2 | Unit | `unit` | BS-008 | `tests/recommendation-track-record.unit.mjs` | Every hashed field is load-bearing: eight mutations, one per hashed term (`subject`, `actionFamily`, `direction`, each of `predicate.kind`/`comparator`/`value`, `horizon.resolutionDate`, `magnitude.flatBand`), each yield a **different** `claimHash`. A hash covering only a subset of terms fails the row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u2` |
| T-01-U3 | Unit | `unit` | BS-008 | `tests/recommendation-track-record.unit.mjs` | `RTR-PREDICATE-AMEND` fires with its exact code on a write that would change bytes at an existing `briefs/objects/claims/<hex>.json` path, and the on-disk bytes are asserted **unchanged** afterwards. A refusal that still overwrote would fail the row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u3` |
| T-01-U4 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | The minter refuses `non-semantic-subject` for a subject matching the publisher's positional fallback and separately for `family === 'note'`, on an action that is otherwise complete and mint-eligible — the case a permissive minter most wants through. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u4` |
| T-01-U5 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | `no-committed-series` fires for `seriesRef: null` and separately for a `seriesRef` naming a symbol absent from `data/bars/`, recording the not-evaluable-at-mint path explicitly rather than failing opaquely at resolution; the claim object is still written with its reason. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u5` |
| T-01-U6 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | Each closed vocabulary refuses a value **one character off** a legal member (`subject.kind`, `predicate.kind`, `predicate.comparator`, `horizon.kind`, `magnitude.unit`), so a `startsWith` or prefix check fails the row; and `actionFamily` outside `MARKET_ACTIONS` refuses. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u6` |
| T-01-U7 | Unit | `unit` | BS-001 | `tests/recommendation-track-record.unit.mjs` | `direction` is never independently authored: a claim declaring `actionFamily: "trim"` with `direction: 1` refuses, while `direction: -1` is accepted, proving the value is bound to `ACTION_DIRECTION` rather than trusted; `direction: 0` (`hold`) refuses `neutral-direction-no-magnitude`. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-01-u7` |
| T-01-F1 | Functional | `functional` | BS-008 | `tests/recommendation-track-record.functional.mjs` | Content-addressed write round-trip: minting an identical claim twice produces one file whose bytes are identical across both passes, the filename equals the bare lowercase hex of `claimHash`, and the object body retains the `sha256:` prefix. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-01-f1` |
| T-01-F2 | Functional | `functional` | BS-001 | `tests/recommendation-track-record.functional.mjs` | `lifecycleTerms` is provenance, not identity: `originToolId` resolves from a `deepLink` matching a real `tools.json` `file`, an unmatched or absent `deepLink` refuses `unresolvable-owning-tool`, and changing `lifecycleTerms` on an otherwise identical claim leaves `claimHash` byte-identical. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-01-f2` |
| T-01-F3 | Functional | `functional` | BS-001, BS-008 | `tests/recommendation-track-record.functional.mjs` | `recommendationKey` is one-to-many with `claimHash`: two claims sharing `{subject, family}` but declaring different `horizon.kind` mint to the **same** `recommendationKey` and **different** `claimHash` values, and both objects coexist on disk. This is the property that makes a same-key/different-horizon pair individually resolvable without touching the publisher's key derivation. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-01-f3` |
| T-01-C1 | Fixture Canary | `unit` | BS-001 | `tests/recommendation-track-record.canary.mjs` | **Canary: the shared substrate's own contracts, asserted before any broad rerun.** `tests/recommendation-track-record.support.mjs` exports exactly the loader, the exact-code assertion helper and the byte-comparison helper and nothing else; importing it registers **zero** tests, prints nothing and opens no file; one input of each fixture shape round-trips through the loader with its `*.expected.json` sibling resolved and its dates read from the input rather than a clock; the loader returns a stable order across two runs; and `node scripts/selftest.mjs` still reports **952 passed, 0 failed** with every pre-existing group line byte-identical. Runs in seconds and **before** `T-01-R1` / `T-01-R2`, so a substrate defect is named at the substrate. | `node --test tests/recommendation-track-record.canary.mjs` | No | `report.md#t-01-c1` |
| T-01-C2 | Fixture Canary | `functional` | BS-001 | `tests/recommendation-track-record.canary.mjs` | **Canary: the restore path is rehearsed in a disposable worktree, never on the live tree.** A detached `git worktree` is created at the pre-scope commit; `node scripts/selftest.mjs` is run inside it and asserted at **952 passed, 0 failed** with its group lines byte-identical to the pre-existing lines of the post-scope run; `git status --porcelain` in the live tree is asserted to contain no entry outside this scope's allowed file families; and the worktree is torn down on exit, success or failure. This is the back-out for a bad substrate change once scopes 02 – 10 import it, rehearsed while the blast radius is still one scope wide. | `node --test tests/recommendation-track-record.canary.mjs` | No | `report.md#t-01-c2` |
| T-01-R1 | Regression E2E | `e2e` | BS-001, BS-008 | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for BS-001 and BS-008.** A full mint pass over the fixture claim set re-asserts, end to end against the real `briefs/objects/claims/` layout, that re-minting identical terms is a byte-identical no-op, that a byte-changing write at an existing path aborts with `RTR-PREDICATE-AMEND` leaving the on-disk bytes unchanged, and that each of the four mint-refusal reasons still fires for its own trigger. The row is permanent and re-runs in every later scope's pass, so a later scope that widens the hashed-term list, softens the append-only store, or drops a refusal fails here rather than silently. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-01-r1` |
| T-01-R2 | Regression E2E | `e2e` | BS-001, BS-008 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the claim module, the store and the fixtures land, with no pre-existing test removed, skipped, or newly failing. This is the row that proves the new content-addressed tree under `briefs/objects/` did not disturb the committed brief pipeline that reads the same tree. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-01-r2` |
| T-01-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the claim module, the fixtures, the support module and the two test files land, at `952 + N passed, 0 failed`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-01-s1` |

**Test Plan rows: 15.**

---

### Definition of Done

#### Core items

- [ ] The `brief-recommendation-claim/v1` contract is implemented with every field named in `design.md` → `## D1` → *Contract*, and no field beyond them except the `lifecycleTerms` provenance block resolved under F-015-D4-01.
- [ ] `lifecycleTerms` is recorded on the object and **excluded from `claimHash`**, so D1's hashed term list is unchanged and no previously computable hash shifts.
- [ ] `originToolId` is derived at mint from the authored action's `deepLink` mapped through `tools.json` `file` → `id`; it is never authored, defaulted, or guessed.
- [ ] `thesisFamily` is declared on `lifecycleTerms` with its refusal path, and its **value source remains open pending routed finding P-015-03**; this scope invents no value for it.
- [ ] The six closed vocabularies (`subject.kind`, `predicate.kind`, `predicate.comparator`, `horizon.kind`, `magnitude.unit`, `magnitude.signConvention`) are frozen module constants, not literals at call sites, and an unrecognised value refuses rather than passing through.
- [ ] `actionFamily` is validated against `MARKET_ACTIONS` (`rlcontracts.js#L708`) and `direction` is bound to `ACTION_DIRECTION` (`rlcontracts.js#L714`); `rlcontracts.js` is read only and is not modified, forked, or shadowed.
- [ ] `claimHash` covers exactly `{ contractVersion, recommendationKey, subject, actionFamily, direction, predicate, horizon, magnitude }` and excludes all four provenance fields.
- [ ] Claims are written to `briefs/objects/claims/<claimHash-hex>.json` with a bare lowercase hex filename matching the on-disk layout of `briefs/objects/evidence/bundles/<hex>.json`, and the store is append-only — nothing is rewritten, deleted, or garbage-collected.
- [ ] `RTR-PREDICATE-AMEND` is implemented and aborts a byte-changing write at an existing path without overwriting.
- [ ] The closed mint-refusal reason set (`non-semantic-subject`, `no-committed-series`, `unresolvable-owning-tool`, `neutral-direction-no-magnitude`) is implemented, and each refusal names the field that caused it.
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code.
- [ ] `tests/fixtures/recommendation-track-record/claims/**` exists with one rule violated per negative fixture, a sibling `*.expected.json` naming the expected refusal reason and field, and explicit dates on every fixture with no clock read.
- [ ] `tests/recommendation-track-record.support.mjs` exists and provides the fixture loader, the exact-code assertion helper, and the byte-comparison helper; it contains no assertions of its own.
- [ ] This scope creates only new files and modifies **no** existing file, so no Feature 002, 007, 012 or 013 surface is opened.
- [ ] No statistic of any kind is computed in this scope; `rlvalidation.js` is not imported here.
- [ ] Change Boundary is respected and zero excluded file families were changed — `rlvalidation.js`, `rlcontracts.js`, the persisted `rldata.js` cache schema, the Center four-view composition, `scripts/selftest.mjs`, the three committed sibling validators, every counted registry, every committed `briefs/history/**` and `data/**` byte, and every neighbouring feature's test file are byte-identical at the end of the scope, verified by `git status --porcelain` diffed against the allowed-family list with the raw output recorded in `report.md`.

#### Test items

- [ ] T-01-U1 passes: `claimHash` is proven content-only across differing provenance → evidence recorded in `report.md#t-01-u1`. — proves SCN-015-001
- [ ] T-01-U2 passes: all eight hashed-term mutations yield distinct hashes → evidence recorded in `report.md#t-01-u2`.
- [ ] T-01-U3 passes: `RTR-PREDICATE-AMEND` fires with its exact code and the on-disk bytes are asserted unchanged → evidence recorded in `report.md#t-01-u3`. — proves SCN-015-008
- [ ] T-01-U4 passes: `non-semantic-subject` fires for both positional fallbacks on an otherwise mint-eligible action → evidence recorded in `report.md#t-01-u4`.
- [ ] T-01-U5 passes: `no-committed-series` fires for a null `seriesRef` and for a symbol absent from `data/bars/` → evidence recorded in `report.md#t-01-u5`.
- [ ] T-01-U6 passes: every closed vocabulary refuses a one-character-off value, defeating a prefix check → evidence recorded in `report.md#t-01-u6`.
- [ ] T-01-U7 passes: `direction` is bound to `ACTION_DIRECTION` rather than trusted, and `hold` refuses → evidence recorded in `report.md#t-01-u7`.
- [ ] T-01-F1 passes: the content-addressed write is a byte-identical no-op on re-mint and the filename equals the bare hex → evidence recorded in `report.md#t-01-f1`.
- [ ] T-01-F2 passes: `originToolId` resolves or refuses, and mutating `lifecycleTerms` leaves `claimHash` byte-identical → evidence recorded in `report.md#t-01-f2`.
- [ ] T-01-F3 passes: `recommendationKey` is proven one-to-many with `claimHash` and both objects coexist → evidence recorded in `report.md#t-01-f3`.
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns — [T-01-C1] the support module's export surface, its import side-effect freedom, a round-trip load of each fixture shape with its `*.expected.json` sibling resolved, the stable loader ordering, and the unchanged `952 passed, 0 failed` baseline with byte-identical group lines are all asserted **before** `T-01-R1` and `T-01-R2` run → evidence recorded in `report.md#t-01-c1`.
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified — [T-01-C2] the pre-scope state is reconstructed in a disposable detached worktree, the baseline there is asserted at `952 passed, 0 failed` with byte-identical group lines, the live tree is asserted to carry no entry outside the allowed file families, and the worktree is torn down on exit whether the rehearsal succeeded or failed → evidence recorded in `report.md#t-01-c2`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-01-R1] the re-mint no-op, the `RTR-PREDICATE-AMEND` byte-preserving abort, and all four mint refusals re-assert end to end against the real claim store → evidence recorded in `report.md#t-01-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-01-R2] the committed Node E2E files and the whole committed Playwright spec suite are green with no pre-existing test removed, skipped, or newly failing → evidence recorded in `report.md#t-01-r2`.
- [ ] T-01-S1 passes: `node scripts/selftest.mjs` reports `952 + N passed, 0 failed` with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-01-s1`.

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
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json` | Counted registries. Scope 10 only. This scope **reads** `tools.json` to resolve `originToolId`; it writes nothing to it. |
| `recommendation-track-record-lab.html` | Does not exist until scope 07. |
| `scripts/validate-recommendation-track-record.mjs` | The consolidated validator is scope 09. This scope's refusals are proven by `node --test`. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
