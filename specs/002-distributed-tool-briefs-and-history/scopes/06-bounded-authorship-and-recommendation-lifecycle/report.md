# Scope 06 Report: Bounded Authorship and Recommendation Lifecycle

**Status:** Done

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 06 delivers the bounded external authorship boundary and the deterministic recommendation
lifecycle for the distributed briefs. Four pure dual-runtime foundation contracts were added to
`rlcontracts.js` — `compactAuthorInput`, `validateToolBrief`, `reduceRecommendationEvents`, and
`groupRecommendations` (plus `deriveRecommendationKeys` for foundation-owned identity) — a new
powerless external author boundary `scripts/brief-author.mjs`
(`buildToolAuthorRequest`/`invokeAuthor`/`validateAuthorEnvelope`), and the shared four-worker author
pool plus `resolveBriefReuse` reuse hook in `scripts/brief-refresh.mjs`. Every source in the frozen
22-source registry reaches exactly one validated authored/carried/no-recommendation/coverage outcome,
changed authoring is bounded (four workers, initial attempt plus at most two retries against identical
frozen input, run-level input/output/attempt reservation with fail-loud `B002-BUDGET` refusal),
unchanged work carries forward with zero author calls, and recommendation identities, observations,
lifecycle events, compatible/shared-origin merges, and visible conflicts are reduced deterministically
with minimum-retained confidence. All work is additive and within the declared Change Boundary; the
existing Market Brief action vocabulary (`hold`, `trim`, `add`, `hedge`, `rotate`) is preserved.

## Decision Record

- The author boundary (`brief-author.mjs`) imports ONLY `node:crypto` and `node:child_process` (spawned
  `shell:false`); it never imports a filesystem write, `fetch`, a shell exec, or any browser API, so it
  structurally has no repository-write / shell / source-fetch / browser-state authority. Owner-model
  formulas are never copied into it or into the shared pool.
- Foundation identity is derived, not author-owned: `deriveRecommendationKeys` computes
  origin/aggregation keys and the observation fingerprint from canonical fields, and a record that
  carries a mismatching key is rejected. Natural-language authors cannot own identity or grouping.
- The conservative token reservation uses the UTF-8 byte length of the canonical request as an upper
  bound on token count (a token is never smaller than a byte). Profile/run budget VALUES are
  caller-supplied from committed config; the pure modules hold no default budget value.
- Reuse is decided by an exact input fingerprint that binds the read identity (which for a live-market
  owner read already encodes evidence semantic fingerprints and freshness/status) to the
  prompt/schema/model/validator policy identity, so a live-market brief can never carry forward across a
  changed evidence semantic fingerprint or freshness result.

## Completion Statement

Complete. Every Scope 06 DoD item is met with reproduced current-session evidence recorded below. The
production surface is left uncommitted in the working tree for the parent to stage and commit;
certification remains owned by bubbles.validate.

## Code Diff Evidence

Working-tree changes (all within the declared Change Boundary; `git status --porcelain`):

```
 M rlcontracts.js
 M scripts/brief-refresh.mjs
 M scripts/selftest.mjs
?? scripts/brief-author.mjs
?? tests/distributed-briefs.author-boundary.functional.mjs
?? tests/distributed-briefs.authorship.e2e.mjs
?? tests/distributed-briefs.authorship.integration.mjs
?? tests/distributed-briefs.authorship.stress.mjs
?? tests/distributed-briefs.authorship.unit.mjs
?? tests/distributed-briefs.lifecycle.unit.mjs
?? tests/fixtures/feature-002/authorship/
```

- `rlcontracts.js` — added `compactAuthorInput`, `validateToolBrief`, `reduceRecommendationEvents`,
  `groupRecommendations`, `deriveRecommendationKeys` (all pure; no `fetch`/`XMLHttpRequest`/`localStorage`/
  `document`) and exported them on the frozen api.
- `scripts/brief-refresh.mjs` — added `resolveBriefReuse` and `runToolAuthorPool` (four-worker pool,
  run-level reservation, retry-against-identical-frozen-input); imports the new boundary.
- `scripts/brief-author.mjs` — new bounded external author boundary.
- `scripts/selftest.mjs` — additive Scope 06 selftest group (baseline row TP-06-12).
- `tests/…` — the six declared Scope 06 test files plus `tests/fixtures/feature-002/authorship/`
  (`author-echo.mjs` real child author + `brief-fixture-builder.mjs`).

Out-of-scope surfaces were NOT modified: `tools.json`, `rldata.js`, `index.html`, `rlnav.js`,
`rlapp.js`, `rlbrief.js`, `market-brief.payload.json`, `scripts/validate-brief-payload.mjs`, other specs.

## Test Evidence

All commands executed in the current session with full unfiltered output; exit codes recorded.

### [TP-06-01] Unit — owner-evidence-bound brief validation (RED before GREEN)

RED: `validateBriefRecommendation`'s cited-evidence check disabled (`if (false && …)`).
`node --test tests/distributed-briefs.authorship.unit.mjs` produced 1 fail, exit 1:

```
✖ SCN-002-004: brief validation binds recommendations to eligible owner evidence
  TypeError: Cannot read properties of undefined (reading 'reason')
      at .../tests/distributed-briefs.authorship.unit.mjs:33:87
ℹ pass 1  ℹ fail 1
```

GREEN (check restored byte-exact): the ghost-evidence brief is rejected with
`recommendation-cited-evidence-absent`, an ineligible read with `recommendation-read-not-eligible`, a
non-permitted action with `recommendation-action-not-permitted`, a static profile with
`tool-brief-profile-recommendation-forbidden`, foreign evidence with `tool-brief-evidence-not-in-read`,
a wrong read fingerprint with `tool-brief-read-fingerprint-mismatch`, and markup with
`unsafe-instruction-or-markup`. `✔ SCN-002-004 …` (pass 2 / fail 0).

**Claim Source:** executed.

### [TP-06-02] Unit — exact-cap deterministic compaction (RED before GREEN)

RED: optional-fact sort reversed to ascending priority. `node --test …authorship.unit.mjs` produced 1
fail, exit 1, exact discriminator:

```
✖ SCN-002-005: compaction honors exact profile caps and stable whole-fact priority
  AssertionError: Expected values to be strictly deep-equal:
  + actual   [ 'fact-low', 'fact-required' ]
  - expected [ 'fact-high', 'fact-required' ]
```

GREEN (restored): a generous cap includes all facts (`omittedFacts.length === 0`); the exact required+high
cap includes `['fact-high','fact-required']` whole and records `fact-low` omitted by ID + content
fingerprint; mandatory-over-cap refuses `B002-BUDGET` `mandatory-material-exceeds-cap`;
`reservedInputTokens === inputByteLength + promptReserveBytes`. `✔ SCN-002-005 …`.

**Claim Source:** executed.

### [TP-06-03] Unit — lifecycle transition identity and immutability (RED before GREEN)

RED: `modified` branch forced to `reaffirmed` (`else if (true || …)`). `node --test
…lifecycle.unit.mjs` produced 1 fail, exit 1:

```
✖ SCN-002-006: stable identities distinguish reaffirm modify supersede close outcome and correction
  AssertionError: + actual [ 'reaffirmed' ]  - expected [ 'modified' ]
```

GREEN (restored): propose → reaffirm (no narrative copy) → modify (new immutable observation, prior terms
retained) → supersede (linked keys) → close (`satisfied`, state `closed`) → correction (names the affected
event ID, never mutating it); idempotent re-run yields identical event IDs and index fingerprint.
`✔ SCN-002-006 stable identities …`.

**Claim Source:** executed.

### [TP-06-04] Unit — compatible/shared-origin/conflict grouping (RED before GREEN)

RED: merged confidence changed `Math.min` → `Math.max`. `node --test …lifecycle.unit.mjs` produced 1
fail, exit 1:

```
✖ SCN-002-006: compatible origins merge shared causes count once and conflicts remain separate
  AssertionError: 64 !== 50
```

GREEN (restored): independent origins merge with `mergedConfidenceScore === 50` (minimum, never the 57
average) and `independentOriginCount === 2`; shared-evidence origins give `independentOriginCount === 1`
and `mergedConfidenceScore === 64`; an incompatible direction on a shared subject stays a separate
`direction-conflict`; ineligible records are excluded with `market-ineligible`. `✔ SCN-002-006 compatible
origins …`.

**Claim Source:** executed.

### [TP-06-05] Functional — true external author boundary and every adversarial class

`node --test tests/distributed-briefs.author-boundary.functional.mjs` produced 1 pass, exit 0. The
production `invokeAuthor` spawns the real `author-echo.mjs` child at the provider boundary; a matched
safe response passes the gate, and timeout, oversize, malformed, unsafe, mismatch (illegal binding), and
duplicate each return the closed sanitized code (`B002-TOOL-AUTHOR-{TIMEOUT,OVERSIZE,MALFORMED,UNSAFE,
MISMATCH,DUPLICATE}`) with no prompt/narrative/private field.

**Claim Source:** executed.

### [TP-06-06] Integration — complete 22-source four-worker pool

`node --test tests/distributed-briefs.authorship.integration.mjs` produced 1 pass, exit 0. The pool
resolves exactly 22 validated outcomes (IDs equal `orderedSourceToolIds`), independently observed peak
concurrency is within four and genuinely overlaps, one call per source, zero retries, and every returned
brief re-validates through `validateToolBrief`.

**Claim Source:** executed.

### [TP-06-07] Stress — concurrency, retry, and run token ceilings

`node tests/distributed-briefs.authorship.stress.mjs` produced 16 passed, 0 failed, exit 0:

```
  ✓ Case 1 pool resolves all sources with a bounded retry subset inside the ceiling
  ✓ Case 1 every retried source resolves in the initial attempt plus one retry
  ✓ Case 1 peak concurrency 4 stays within the four-worker ceiling and overlaps
  ✓ Case 2 the run output ceiling refuses with B002-BUDGET run-ceiling-exceeded
  ✓ Case 3 the run attempt ceiling refuses with B002-BUDGET run-ceiling-exceeded
  ✓ Case 4 an input-token ceiling below the run total refuses with B002-BUDGET
Scope 06 author-pool stress: 16 passed, 0 failed
```

**Claim Source:** executed.

### [TP-06-08] E2E — Regression SCN-002-004 (RED before GREEN)

RED: `validateToolBrief` evidence-subset check disabled. `node --test
tests/distributed-briefs.authorship.e2e.mjs` produced 1 fail, exit 1 (`✖ Regression: SCN-002-004 …
TypeError: Cannot read properties of undefined (reading 'reason')` — the tampered foreign-evidence brief
validated). GREEN (restored): `✔ Regression: SCN-002-004 all 22 source reads reach one truthful validated
brief outcome` — barrier complete, aggregator never self-consumed, tampered evidence rejected.

**Claim Source:** executed.

### [TP-06-09] E2E — Regression SCN-002-005 (RED before GREEN)

RED: `lifecycleEventId` given a `Math.random()` nonce. `node --test …authorship.e2e.mjs` produced 1 fail,
exit 1 (`✖ Regression: SCN-002-005 …` — the two identical reduce runs produced different event IDs).
GREEN (restored): `✔ Regression: SCN-002-005 unchanged and duplicate work creates no author prose event
or cost churn` — reuse carries with zero author calls, idempotent reduce, duplicate envelope rejected.

**Claim Source:** executed.

### [TP-06-10] E2E — Regression SCN-002-006 (RED before GREEN)

RED: merged confidence `Math.min` → `Math.max`. `node --test …authorship.e2e.mjs` produced 1 fail, exit 1
(`✖ Regression: SCN-002-006 … 64 !== 50`). GREEN (restored): `✔ Regression: SCN-002-006 recommendation
lifecycle preserves prior terms merges origins and exposes conflicts`.

**Claim Source:** executed.

### [TP-06-11] Broader E2E regression — registry-owner-authorship

`node --test` over the full distributed-briefs surface (Scope 01–06, excluding the stress script) =
25 tests / 25 pass / 0 fail, exit 0. This includes `distributed-briefs-foundation.e2e.mjs`,
`distributed-briefs-owner-reads.e2e.mjs`, `distributed-briefs.authorship.e2e.mjs`, the owner/read-adapter
integrations, and both shared canaries — all persistent scenarios pass together with no upstream
regression.

**Claim Source:** executed.

### [TP-06-12] Baseline — `node scripts/selftest.mjs`

`node scripts/selftest.mjs` produced 616 passed, 0 failed, exit 0 (up from the 606 baseline; +10 for the
additive Scope 06 selftest group). The dual-runtime browser-safety of the new `rlcontracts.js` functions
is proven by the contract test's `Function(…)` browser eval (no `fetch`/`XMLHttpRequest`/`localStorage`/
`document`).

**Claim Source:** executed.

## Uncertainty Declarations

None. Every DoD item is backed by a directly executed command whose output proves the specific claim.

## Scenario Contract Evidence

- **SCN-002-004** — `SCN-002-004: brief validation binds recommendations to eligible owner evidence`
  (unit) and `Regression: SCN-002-004 all 22 source reads reach one truthful validated brief outcome`
  (e2e). Both recorded RED before GREEN.
- **SCN-002-005** — `SCN-002-005: compaction honors exact profile caps and stable whole-fact priority`
  (unit), the pool integration/stress, and `Regression: SCN-002-005 unchanged and duplicate work creates
  no author prose event or cost churn` (e2e). RED before GREEN recorded for the unit and e2e rows.
- **SCN-002-006** — the two `SCN-002-006` lifecycle/grouping unit tests and `Regression: SCN-002-006
  recommendation lifecycle preserves prior terms merges origins and exposes conflicts` (e2e). RED before
  GREEN recorded.

## Coverage Report

Coverage is exercised by the six Scope 06 test files (unit, functional, integration, stress, e2e) plus
the selftest group. Every new production function is executed by at least one node --test case and the
selftest: `compactAuthorInput`, `validateToolBrief`, `reduceRecommendationEvents`,
`groupRecommendations`, `deriveRecommendationKeys`, `buildToolAuthorRequest`, `invokeAuthor`,
`validateAuthorEnvelope`, `resolveBriefReuse`, and `runToolAuthorPool`.

## Lint and Quality

- `node scripts/validate-node-source-lock.mjs` → PASS (manifest/npmrc/lockfile/graph PASS; 16 adversarial
  REJECTED; `unexpectedAcceptances=0`), exit 0.
- `node scripts/validate-brief-cache.mjs` → PASS (354 JSON cache files parsed; indexes coherent), exit 0.
- Consumer sweep: `node scripts/validate-brief-payload.mjs market-brief.payload.json` → PASS with
  `market-brief.payload.json` and `scripts/validate-brief-payload.mjs` UNCHANGED — the existing action
  vocabulary (`hold`, `trim`, `add`, `hedge`, `rotate`) is preserved while the new typed
  recommendation IDs/refs are introduced additively in `rlcontracts.js`.
- `bash .github/bubbles/scripts/artifact-lint.sh specs/002-distributed-tool-briefs-and-history` →
  `Artifact lint PASSED`, exit 0.
- Author-process / privacy / unsafe-output scans: the functional boundary test proves the child author
  boundary rejects secret-shaped and instruction/markup-shaped envelopes and bounds size/time;
  `brief-author.mjs` contains no filesystem write, `fetch`, shell exec, or browser API.
- Self-validation guard: the author transport builds its response only from the frozen request it
  receives and every returned brief is independently re-validated by the pure `validateToolBrief`, so no
  test self-validates a supplied answer.
- Diff isolation: `git status --porcelain` shows only the eleven in-scope paths above; byte-exact restore
  of every RED mutation was verified by SHA-256 (`rlcontracts.js` and `scripts/brief-refresh.mjs` match
  their pre-mutation baselines).

## Validation Summary

All twelve Test Plan rows pass with the exact declared titles; every row requiring a recorded red stage
(TP-06-01, TP-06-02, TP-06-03, TP-06-04, TP-06-08, TP-06-09, TP-06-10) has a captured RED with an exact
discriminator followed by a byte-exact restore and GREEN. Baseline selftest is 616/0. Certification is
owned by bubbles.validate.

## Audit Verdict

Owned by bubbles.audit. This report records reproduced current-session execution evidence only.
