# Scope 02 Report: Yahoo Extended-Hours Evidence

**Status:** Implementation Complete — production/test/fixture/config code committed at HEAD `e8328b7` and byte-identical to HEAD; DoD test-evidence items TP-02-01 through TP-02-09 met by reproduced current-session evidence (TP-02-01/02/03 controlled-mutation RED-before-GREEN, TP-02-04 through TP-02-09 executed GREEN). Independent validation/certification is owned by bubbles.validate; this report records implement-phase delivery evidence only.

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 02 delivers the Yahoo extended-hours evidence vertical: the committed XNYS calendar generator + projection (`scripts/generate-xnys-calendar.mjs`, `data/calendars/xnys/**`), the exact allowlisted `includePrePost=true` five-minute Yahoo acquisition, normalizer, official-close anchor, extended-hours aggregate, comparable-volume baseline, and read-only source smoke (`scripts/market-session-evidence.mjs`, `scripts/market-session-evidence-live-check.mjs`), the additive `marketSessionEvidence` + source-request/source-use/artifact-budget config blocks in `market-brief.config.json`, the Scope 02 tests (`tests/market-session-evidence.{unit,functional,source.e2e}.mjs`), the fixtures under `tests/fixtures/feature-002/market-session-evidence/`, and the additive Scope 02 selftest group in `scripts/selftest.mjs`.

**2026-07-19 tracking reconciliation.** The production/test/fixture/config code was implemented and committed at HEAD `e8328b7`. A prior `bubbles.implement` run was truncated before it recorded this scope's implement DoD tracking (state-transition claim + this report's evidence), so the code was correct and committed but the tracking drifted (state.json carried no SCOPE-02 completed-phase claim and `execution.currentScope` still read `SCOPE-01`). This report closes that drift with **reproduced current-session evidence only**; it changes no Scope 02 production, test, fixture, or config file. `git status --porcelain` is empty and the six Scope 02 code files are byte-identical to HEAD (audit table below).

## Decision Record

1. Reconciliation is evidence-first: every DoD test-evidence item below cites a command re-run and observed in this session (Claim Source: executed). No historical output is relabeled, backdated, or fabricated.
2. TP-02-01, TP-02-02, and TP-02-03 carry an explicit "after its recorded red stage" DoD clause. Because the original implementation RED was never recorded (truncated run), a fresh current-session controlled-mutation RED-before-GREEN pair was executed for each: the committed production file was mutated in place to a single-line weakening, the exact declared discriminator was observed as RED, the file was restored byte-exact via `git checkout -- <file>` (post-restore `git status --porcelain` empty), and the GREEN was observed. The Scope 02 code therefore remains byte-identical to HEAD `e8328b7`.
3. TP-02-04 through TP-02-09 carry no "recorded red stage" clause; each is substantiated by its executed GREEN command output below.
4. Certification is not self-claimed. `spec.md`, `design.md`, `uservalidation.md`, and `state.json.certification.*` are unchanged; final certification remains bubbles.validate's responsibility.

## Completion Statement

Scope 02 implementation is complete and its implement-phase DoD is met by reproduced current-session evidence. All 14 DoD items (4 core outcomes, TP-02-01 through TP-02-09, build-quality gate) are checked in [scope.md](scope.md) with the executed evidence recorded below. The three rows requiring a recorded red stage (TP-02-01/02/03) carry fresh controlled-mutation RED-before-GREEN pairs; the other rows carry executed GREEN command output. The committed Scope 02 production/test/fixture/config code is byte-identical to HEAD `e8328b7` (working tree clean). Independent certification and the `done` promotion are owned by bubbles.validate.

## Reproduced Delivery Validation (summary, Claim Source: executed)

| Command | Result | Exit |
| --- | --- | ---: |
| `node scripts/selftest.mjs` | `Research-Lab self-test: 572 passed, 0 failed` | 0 |
| `node --test tests/market-session-evidence.unit.mjs tests/market-session-evidence.functional.mjs tests/market-session-evidence.source.e2e.mjs` | `tests 9  pass 9  fail 0` (SCN-002-016/017/018/021/022/028) | 0 |
| `node scripts/validate-brief-cache.mjs` | `[brief-cache] PASS: 354 JSON cache files parsed and available indexes are coherent` | 0 |
| `node scripts/validate-brief-payload.mjs market-brief.payload.json` | `[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid` | 0 |
| `node scripts/market-session-evidence-live-check.mjs --symbols SPY --no-write` | `structural=unavailable reason=market-closed dateState=weekend`, `no-write verified`, `[LIVE-CHECK] OK` | 0 |

## Byte-Identity Audit (Claim Source: executed)

`git rev-parse HEAD` = `e8328b75cbbc40f98241868798f312d390811214`; `git status --porcelain` = empty. Scope 02 code file SHA-256 (unchanged by this reconciliation):

| File | SHA-256 |
| --- | --- |
| `scripts/market-session-evidence.mjs` | `0925da178204ebc395d426b750ade1b626f44ad44bbc3e524e84cdcfd44e0cc0` |
| `scripts/generate-xnys-calendar.mjs` | `44178e135d910d5c851a6245ad16a2b85ae3eddc7a7d1b86bbbae79244704b3a` |
| `scripts/market-session-evidence-live-check.mjs` | `46262fea7da53b17a23704eeca1b977c106007ee875ffb4c4d4bf3ed926fea70` |
| `tests/market-session-evidence.unit.mjs` | `15fbaaa06cf20c9103c70e510d9bfd44bb8feeff36ed19d8840f1f0d3a23b167` |
| `tests/market-session-evidence.functional.mjs` | `f3e658afbd7f0e0482529b32a905e965ad57865cafbaffd93ce79b8ef8e8af59` |
| `tests/market-session-evidence.source.e2e.mjs` | `ef5cb81d76964c05d324e4b95ddc8a99d740214603a8354e56e16ee1281aa852` |

## Test Evidence (one block per Test Plan row)

**Phase:** implement · **Agent:** bubbles.implement

### TP-02-01 — Unit source-policy allowlist (SCN-002-028)

Controlled production mutation (restored byte-exact): in `scripts/market-session-evidence.mjs::validateSourceRequest`, the host check `if (url.hostname !== entry.host)` → `if (false && url.hostname !== entry.host)` (host-allowlist rejection disabled).

#### TP-02-01 RED — `node --test tests/market-session-evidence.unit.mjs` — Exit 1 — Claim Source: executed

```text
✖ SCN-002-028: source policy accepts only the exact NYSE and Yahoo request contracts (1.128916ms)
ℹ tests 5
ℹ pass 4
ℹ fail 1

✖ failing tests:
test at tests/market-session-evidence.unit.mjs:401:1
✖ SCN-002-028: source policy accepts only the exact NYSE and Yahoo request contracts
  AssertionError [ERR_ASSERTION]: expected rejection for host-not-allowlisted
  true !== false
      at reject (file:///.../tests/market-session-evidence.unit.mjs:417:12)
    code: 'ERR_ASSERTION', actual: true, expected: false, operator: 'strictEqual'
```

Restore: `git checkout -- scripts/market-session-evidence.mjs`; post-restore `git status --porcelain scripts/market-session-evidence.mjs` = empty.

#### TP-02-01 GREEN — `node --test tests/market-session-evidence.unit.mjs` — Exit 0 — Claim Source: executed

```text
✔ SCN-002-016: opening-boundary bars belong to exactly one session and cutoff
✔ SCN-002-018: comparable volume uses exact completed buckets and preserves missing versus zero
✔ SCN-002-021: committed XNYS rows resolve holidays early closes and DST
✔ SCN-002-022: invalid stale missing disputed and post-cutoff evidence fails loud
✔ SCN-002-028: source policy accepts only the exact NYSE and Yahoo request contracts
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

### TP-02-02 — Functional captured-Yahoo normalization (SCN-002-017)

Controlled production mutation (restored byte-exact): in `normalizeYahooSession`, missing-volume handling `{ volume = null; ... }` → `{ volume = 0; ... }` (coerces missing volume to zero).

#### TP-02-02 RED — `node --test tests/market-session-evidence.functional.mjs` — Exit 1 — Claim Source: executed

```text
✖ SCN-002-017: captured Yahoo bytes normalize official and indicative session fields without missing-volume coercion (2.903541ms)
ℹ tests 2
ℹ pass 1
ℹ fail 1

✖ failing tests:
test at tests/market-session-evidence.functional.mjs:34:1
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  0 !== null
      at TestContext.<anonymous> (file:///.../tests/market-session-evidence.functional.mjs:47:12)
    code: 'ERR_ASSERTION', actual: 0, expected: null, operator: 'strictEqual'
```

Restore: `git checkout -- scripts/market-session-evidence.mjs`; post-restore `git status --porcelain` = empty.

#### TP-02-02 GREEN — `node --test tests/market-session-evidence.functional.mjs` — Exit 0 — Claim Source: executed

```text
✔ SCN-002-017: captured Yahoo bytes normalize official and indicative session fields without missing-volume coercion
✔ SCN-002-028: Yahoo and NYSE fixture mutations enforce bounds retries provenance and source use
ℹ tests 2
ℹ pass 2
ℹ fail 0
```

### TP-02-03 — Functional source mutations/bounds/retry/provenance/use (SCN-002-028)

Controlled production mutation (restored byte-exact): in `fetchWithSourcePolicy`, the redirect guard `if (response.redirected || (response.status >= 300 && response.status < 400))` → `if (false && (...))` (redirect rejection disabled).

#### TP-02-03 RED — `node --test tests/market-session-evidence.functional.mjs` — Exit 1 — Claim Source: executed

```text
✖ SCN-002-028: Yahoo and NYSE fixture mutations enforce bounds retries provenance and source use (0.843ms)
ℹ tests 2
ℹ pass 1
ℹ fail 1

✖ failing tests:
test at tests/market-session-evidence.functional.mjs:101:1
  AssertionError [ERR_ASSERTION]: expected failure B002-SOURCE-REDIRECT
  true !== false
      at expectFail (file:///.../tests/market-session-evidence.functional.mjs:116:16)
    code: 'ERR_ASSERTION', actual: true, expected: false, operator: 'strictEqual'
```

Restore: `git checkout -- scripts/market-session-evidence.mjs`; post-restore `git status --porcelain` = empty.

#### TP-02-03 GREEN — `node --test tests/market-session-evidence.functional.mjs` — Exit 0 — Claim Source: executed

```text
✔ SCN-002-017: captured Yahoo bytes normalize official and indicative session fields without missing-volume coercion
✔ SCN-002-028: Yahoo and NYSE fixture mutations enforce bounds retries provenance and source use
ℹ tests 2
ℹ pass 2
ℹ fail 0
```

### TP-02-04 — Integration calendar `--check` no-write — Exit 0 — Claim Source: executed

`node scripts/generate-xnys-calendar.mjs --config market-brief.config.json --check`

```text
[XNYS-CALENDAR] --check OK: data/calendars/xnys/calendar.json matches reviewed source (365 rows, 251 open) sha=sha256:37e08c3300da2a0cab45d3c6bc7cd26bc7d062ad261b6a8b02455ad839d67172 tz=2026a
```

### TP-02-05 — Integration live no-write source smoke — Exit 0 — Claim Source: executed

`node scripts/market-session-evidence-live-check.mjs --symbols SPY --no-write` (weekend / market-closed — truthful unavailable, no fixed numeric claim, zero repository writes)

```text
[LIVE-CHECK] mode=read-only no-write=true nowUtc=2026-07-19T05:58:52.365Z nyDate=2026-07-19 nyWall=01:58 symbols=SPY
[LIVE-CHECK] structural=unavailable reason=market-closed dateState=weekend nextOpen=2026-07-20 (no network call made)
[LIVE-CHECK] no-write verified: scope-owned generated roots unchanged (calendar=233285:...|session-bars=absent)
[LIVE-CHECK] OK
```

### TP-02-06 / TP-02-07 — Scenario-specific E2E regression (SCN-002-017, SCN-002-028) — Exit 0 — Claim Source: executed

`node --test tests/market-session-evidence.source.e2e.mjs` (run within the combined suite below)

```text
✔ Regression: SCN-002-017 publishes separate official and indicative price with exact-window volume context
✔ Regression: SCN-002-028 source acquisition is bounded reviewed fail-loud and no-write
```

### TP-02-08 — Broader E2E regression (foundation + source) — Exit 0 — Claim Source: executed

`node --test tests/market-session-evidence.foundation.e2e.mjs tests/market-session-evidence.source.e2e.mjs`

```text
✔ Regression: SCN-002-016 freezes opening-boundary observations once across the production evidence graph
✔ Regression: SCN-002-018 publishes only exact-bucket qualified volume context
✔ Regression: SCN-002-021 validates a whole-graph closed-date bundle and refuses invalid closure proof
✔ Regression: SCN-002-022 invalid temporal evidence cannot produce a current graph
✔ Regression: SCN-002-017 publishes separate official and indicative price with exact-window volume context
✔ Regression: SCN-002-028 source acquisition is bounded reviewed fail-loud and no-write
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

### TP-02-09 — Baseline complete-repository selftest — Exit 0 — Claim Source: executed

`node scripts/selftest.mjs`

```text
================================================
Research-Lab self-test: 572 passed, 0 failed
================================================
```

## Scenario Contract Evidence

- **SCN-002-017** — official regular close remains a separate timestamped anchor while extended-hours latest is labeled indicative and volume is compared only over the exact completed-bucket window; proven by `SCN-002-017` (functional TP-02-02) and `Regression: SCN-002-017 …` (source.e2e TP-02-06/TP-02-08), both GREEN this session.
- **SCN-002-028** — extended-hours evidence is acquired only through the reviewed source contract with bounded retries/bytes/timestamps, exact provenance, and fail-loud rejection of redirect/credentials/unknown-field/media/use-policy violations, and the live smoke writes no file; proven by `SCN-002-028` (unit TP-02-01, functional TP-02-03) and `Regression: SCN-002-028 …` (source.e2e TP-02-07/TP-02-08), all GREEN this session, with TP-02-01/03 RED discriminators recorded above.

## Consumer and Shared Infrastructure Sweep

- **Consumer Impact Sweep (Claim Source: executed):** the new `scripts/market-session-evidence.mjs` adapter is additive. `grep -rn "market-session-evidence" --include='*.mjs' --include='*.js' --include='*.json'` shows the only `import`/`require` of the adapter MODULE (`./market-session-evidence.mjs`) is `scripts/selftest.mjs:2455` (the additive Scope 02 selftest group) plus the Scope 02 test files; every other match is a Scope 01 contract-name string (`market-session-evidence-config/v1`, `market-session-evidence/v1`, …) in `rlsession.js`/`rlcontracts.js`/`market-brief.config.json` or the config-key read in `generate-xnys-calendar.mjs:282` — not an adapter import. `scripts/fetch-bars.mjs`, daily snapshots, and Market Brief window labels are untouched, so daily-bar semantics are not repointed and no existing caller is silently changed.
- **Shared Infrastructure Impact Sweep (Claim Source: executed):** the independent canaries `node scripts/selftest.mjs` (572/0), `node scripts/validate-brief-cache.mjs` (PASS, 354 files), and `node scripts/validate-brief-payload.mjs market-brief.payload.json` (PASS) all pass, confirming the pre-existing daily fetch / Market Brief behavior is unchanged by the additive calendar, source-policy, and acquisition modules. `node scripts/generate-xnys-calendar.mjs --config market-brief.config.json --check` (TP-02-04) proves the committed calendar bytes are byte-stable against the reviewed source.
- **Rollback (Claim Source: interpreted):** the change boundary is additive-only (new scripts, new tests, new fixtures, one additive `marketSessionEvidence` config block). Narrow rollback is removal of those additive files/block, which restores the previous daily-only consumer path; the green baseline canaries above confirm that daily path already runs independently of the Scope 02 additions. No committed evidence/history object is mutated by the additive change, so rollback touches no unrelated root state.

## Uncertainty Declarations

- The **original** pre-implementation RED for the Scope 02 test rows (from the truncated original build run) was never recorded and is not claimed, relabeled, or backdated. It is replaced by the fresh current-session controlled-mutation RED-before-GREEN pairs recorded above for the three rows (TP-02-01/02/03) whose DoD requires a recorded red stage. TP-02-04 through TP-02-09 are executed-GREEN validation rows with no red-stage clause.

## Coverage Report

Business-logic coverage for the Scope 02 vertical is exercised by the unit + functional + source.e2e suites (9 scenarios) plus the additive Scope 02 selftest group (14 checks in the 572-total baseline). No coverage instrumentation tool is configured in this build-free repository; scenario coverage is the coverage contract.

## Lint and Quality

`node scripts/selftest.mjs` = 572 passed / 0 failed (exit 0) with no warning. Working tree clean (`git status --porcelain` empty); declared Change Boundary respected — no file outside the Scope 02 surface was modified by this reconciliation.

## Validation Summary

Delivery evidence reproduced and recorded (executed). Independent certification is owned by bubbles.validate; `state.json.certification.*` is unchanged and `certified` is false on the implement claim.

## Audit Verdict

Not audited (bubbles.audit owns audit). This report records implement-phase delivery evidence only.
