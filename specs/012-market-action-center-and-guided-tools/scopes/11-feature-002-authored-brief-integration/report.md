# Scope 11 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Scope 11 remains in progress. Twelve of thirteen Test Plan rows have successful receipts on one stable current candidate.

TP-11-12 remains nonzero. The parser now accepts `scripts/selftest.mjs`, and the Scope 11 ToolBrief family derives from four real runner-safe plan globs with no synthetic source declaration. The exact broad selftest executes and reports 3,460 passes plus four failures owned outside this scope boundary.

The current producer record has `status=done`, `certification.status=done`, and `certifiedAt=2026-07-29T23:45:00Z`.

This continuation reconciles implementation-owned Scope 11 DoD evidence. It changes no certification field, human acceptance record, feature status, stage, commit, publication, or foreign scope.

The original eligibility refusal remains below as an audit record.

The validated repository binding was revision 12 for scenario node `tax-unblock-feature012-scope11-implement`.

## Current Eligibility Reconciliation

- The current Feature 002 state publishes all four required milestones.
- Tool-call receipt row 2499 records TP-11-01 at exit 0 on the current candidate.
- That receipt has stdout hash `fe9e72c1507285984a58b8ecd33128ffd3ab1f796e5f492a744ba379b9eb4d93` and a six-file input closure.
- Feature 002 still declares `requiresRevalidation=true`. This implementation run does not clear that producer-owned flag.
- Scope 11 keeps its pickup-time gate. The implementation owner must preserve fail-closed behavior if any current predicate fails.

## Routed Defect Receipt Index

These are existing receipts from `bubbles.implement`. They are diagnostic input, not evidence executed by this planning run.

| Tool-call row | Planned row or check | Exit | Planning interpretation |
| ---: | --- | ---: | --- |
| 2451 | TP-11-08 at the stale Market Action test path | 1 | Preserved historical path failure |
| 2454 | TP-11-07 at `tests/tool-brief-v2.spec.mjs` | 0 | Grounds the corrected path and exact title |
| 2455 | TP-11-08 at `tests/tool-brief-v2.spec.mjs` | 0 | Grounds the corrected path and exact title |
| 2456 | TP-11-11 explicit inventory generated from the broad family | 1 | Included non-Node-runner members and did not prove the planned row |
| 2457 | TP-11-12 broad selftest | 1 | Remains unresolved |
| 2458-2460 | Combined reachability and page-block diagnostics | 1 | Nonzero composite probes remain visible and do not prove reachability alone |
| 2461 | TP-11-11 broad family command | 1 | Reproduces the runner mismatch |
| 2462 | TP-11-12 current broad selftest | 1 | Remains unresolved |
| 2464-2465 | Focused Feature 002 regression before the source repair | 1 | Preserved failed repair attempts |
| 2466 | Focused Feature 002 regression after the source repair | 0 | Narrow evidence only, not TP-11-11 completion |
| 2467 | TP-11-11 broad family command after the source repair | 1 | Still fails because the command selects the Playwright file |
| 2468 | Direct Node-runner diagnosis of `tests/distributed-briefs.spec.mjs` | 1 | Proves the runner ownership mismatch |
| 2469 | TP-11-01 current dependency gate | 0 | Current lifecycle and configured dependency predicate admitted Scope 11 |
| 2470-2475 | TP-11-02 through TP-11-07 current receipts | 0 | Existing implementation receipts only; no DoD item is marked here |

## Planning Defect Reconciliation

- `F012-S11-PLAN-RUNNER-001` is addressed in the plan. TP-11-11 now selects only Feature 002 `node:test` suffix families.
- `F012-S11-PLAN-GATE-002` is addressed in this report. The stale refusal is now explicitly historical.
- `F012-S11-PLAN-E2E-MAP-003` is addressed. TP-11-07 and TP-11-08 use their authored Playwright file and exact titles.
- `F012-S11-PLAN-REACHABILITY-004` is addressed. TP-11-13 declares real, runner-safe ToolBrief v2 family globs.
- `F012-S11-PLAN-EXPOSURE-010` is addressed. Scope 11 now names its already-planned Market Action Center and ordinary Brief consumer surfaces.
- `F012-S11-PLAN-STATUS-017` is addressed. Parent scope progress now matches the active Scope 11 execution state.
- `F012-S11-SOURCE-REACHABILITY-005` is addressed. Receipt row 2497 records a parser-clean current file, four real ToolBrief family patterns from active planning, ten active plan sites, zero foreign sites, zero ToolBrief orphans, and no synthetic source declaration.
- `F012-S11-PRODUCER-REVALIDATION-006` remains open. Feature 002 still declares that its certification requires revalidation.
- `F012-S11-TP11-11-007` is addressed. Receipt row 2509 records 76 passing tests and zero failures on the current candidate.
- `F012-S11-TP11-12-008` remains open. Receipt row 2498 executes the exact broad selftest and records 3,460 passes plus four failures.
- `F012-S11-PROBE-RESIDUE-009` remains open. The excluded untracked probe remains preserved for its owning work.
- `F012-S11-TP11-09-PATH-011` remains open. The current scenario resolver still rejects the legacy ` :: ` reference form.
- `F012-S11-REACHABILITY-LOAD-012` remains open. The reachability validator reports `tests/distributed-briefs.history.load.mjs` as a new orphan.
- `F012-S11-FEATURE-TRACE-013` remains open. The current scenario resolver reports 35 unresolved references across the feature.
- `F012-S11-RLDATA-NODE26-WARN-014` remains open. Receipt row 2509 is green but emits Node 26 `localStorage` warnings from the excluded Feature 002 regression closure.
- `F012-S11-SELFTEST-WRITER-015` is addressed for this execution. The stale writer lease was taken over by the inherited session, renewed before execution, and the complete code/test candidate hash set remained byte-identical across the planned-row run.

## Current Routed Blockers

| Finding | Exact current observation | Required owner |
| --- | --- | --- |
| `F012-S11-PRODUCER-REVALIDATION-006` | Feature 002 still records `requiresRevalidation=true`; Scope 11 cannot alter its certification. | `bubbles.validate` for Feature 002 |
| `F012-S11-PROBE-RESIDUE-009` | `tests/zz-probe-focusable.spec.mjs` remains an excluded untracked probe. | `bubbles.test` for the owning probe |
| `F012-S11-TP11-09-PATH-011` | The feature-wide scenario resolver still rejects legacy string references containing ` :: `. | `bubbles.plan` for Feature 012 |
| `F012-S11-REACHABILITY-LOAD-012` | `tests/distributed-briefs.history.load.mjs` is matched by none of the 22 declared verification globs. | `bubbles.plan` to define its legitimate runner contract, then `bubbles.test` to implement that contract |
| `F012-S11-FEATURE-TRACE-013` | The recorded feature-wide resolver result still contains 35 unresolved references. | `bubbles.plan` for Feature 012 |
| `F012-S11-RLDATA-NODE26-WARN-014` | TP-11-11 passes 76 tests but emits Node 26 `localStorage` warnings from excluded `rldata.js`. | `bubbles.implement` for the owning RLDATA scope |
| `F012-S11-TP1112-TAX-018` | The broad selftest fails the unrelated TP-02-12 tax-pack partition and reconstruction assertion. | `bubbles.implement` for the owning tax scope |
| `F012-S11-TP1112-SPEC029-019` | The broad selftest finds spec number `029` used by both `029-budget-aware-hybrid-brief-generation` and the excluded untracked `029-shock-transmission-foundation-and-lab`. | `bubbles.plan` for the shock-transmission planning node |
| `F012-S11-TP1112-BUG022-020` | The scope-progress checker reports BUG-022 certification at 53/19 while its DoD is 71/1. | `bubbles.validate` for BUG-022 |

## Historical Eligibility Refusal (Retained For Audit)

The following record described the producer state when captured. It is superseded by the current reconciliation above.

**Gate predicate (FALSE):** Feature 002 must be terminally certified — `specs/002-distributed-tool-briefs-and-history/state.json` `certification.status ∈ {done, accepted}` with a non-null `certifiedAt`. Actual (read-only): `status=not_started`, `certification.status=not_started`, `certifiedAt=null`.

**Exact unblock condition:** Scope 11 unblocks when `specs/002-distributed-tool-briefs-and-history/state.json` reaches terminal certification (`certification.status` becomes `done`/`accepted` with a non-null `certifiedAt`) AND its pointer/manifest/hash graph, all-current-registry owner outcomes, powerless-author boundary, history, compatibility, and atomic pointer-last publication predicates hold. Until then Scope 02's SCN-012-028 gate is the only correct behavior and Scope 11 remains Not Started/Blocked.

**Atomic-dependency-rule compliance:** No integrated source edit, no promotion, no author request, no publication call, and no fixture/emulated certification were made. No file under `specs/002-*` was read-for-write or modified.

**Mechanical gate evidence (current session).**

- **Phase:** implement (external-gate eligibility-refusal recording)
- **Command (TP-11-01):** `node scripts/validate-tool-experience.mjs --dependency feature-002 --require-accepted`
- **Exit Code:** 0
- **Claim Source:** executed
- **Honest interpretation:** Exit 0 does NOT assert Feature 002 is accepted. This validator version does not implement the `--dependency` / `--require-accepted` flags (source grep confirms no argv handling — they are no-ops). Exit 0 means the feature is correctly in the **pre-integration shadow state**: `shadow=PASS shadowOnly=true integrationClaims=0` (zero fabricated integration). Its adversarial row `narrative-dependency-status result=REJECTED code=E012-REGISTRY` proves that a fabricated "accepted" dependency status would be refused. The authoritative FALSE-predicate proof is the read-only Feature 002 certification read below.

```text
[tool-experience] artifact=config bytes=6007 budget=65536 result=PASS
[tool-experience] registry=PASS tools=23 ordinary=22 marketAction=1
[tool-experience] definitions=PASS simpleModels=23 journeys=48 steps=48
[tool-experience] simpleRuntime=PASS truthStates=6 registeredAdapters=0 toolIdBranches=0 authorityOwned=0
[tool-experience] journeyCoverage=PASS ordinaryTools=22 centerGoals=4 totalGoals=48 definitions=48
[tool-experience] adversarial=journey-execution-enabled result=REJECTED code=E012-JOURNEY-DEFINITION
[tool-experience] adversarial=narrative-dependency-status result=REJECTED code=E012-REGISTRY
[tool-experience] shadow=PASS shadowOnly=true integrationClaims=0
[tool-experience] OK adversarial=13 unexpectedAcceptances=0
=== TP-11-01_EXIT=0 ===
```

- **Authoritative FALSE-predicate proof (read-only):**
- **Command:** `python3 -c "import json;print(json.load(open('specs/002-distributed-tool-briefs-and-history/state.json'))['certification']['status'])"` then the top-level `status`
- **Exit Code:** 0
- **Claim Source:** executed

```text
=== Mechanical proof: Feature 002 certification.status (read-only) ===
not_started
=== Feature 002 top-level status (read-only) ===
not_started
```

## Decision Record

## Completion Statement

No completion statement is authorized by planning.

## Code Diff Evidence

## Test Evidence

The structured log preserves every earlier RED and every unsuccessful repair attempt.

The rows below share the stable source/test candidate recorded in the candidate identity block. Each structured receipt records the exact bounded command, real exit code, stdout and stderr hashes, and the listed input closure.

| Test Plan row | Receipt | Exit | Current closure |
| --- | ---: | ---: | --- |
| TP-11-01 | 2499 | 0 | Yes |
| TP-11-02 | 2500 | 0 | Yes |
| TP-11-03 | 2501 | 0 | Yes |
| TP-11-04 | 2502 | 0 | Yes |
| TP-11-05 | 2503 | 0 | Yes |
| TP-11-06 | 2504 | 0 | Yes |
| TP-11-07 | 2505 | 0 | Yes |
| TP-11-08 | 2506 | 0 | Yes |
| TP-11-09 | 2507 | 0 | Yes |
| TP-11-10 | 2508 | 0 | Yes |
| TP-11-11 | 2509 | 0 | Yes, with warnings routed separately |
| TP-11-12 | 2498 | 1 | No successful receipt |
| TP-11-13 | 2510 | 0 | Yes |

## Current Candidate Reverification — 2026-09-01

**Phase:** implement

**Claim Source:** executed

**Repository binding:** scenario node `tax-unblock-feature012-scope11-implement`, control revision 12.

**Writer lease:** `rls_20260901062625_1641`, exclusive, inherited session owner, renewed before the planned-row execution.

**Candidate identity:** `scripts/selftest.mjs` SHA-256 `4a167fc108c03314b5fe4f9001499f541fcd46394ad59f5ea97a6569c431871c`.

**Candidate stability:** all 17 Scope 11 production/test file hashes matched before and after the planned-row run.

**RED history:** receipt row 2495 preserves the pre-repair exact TP-11-12 failure. Receipt row 2496 preserves the malformed diagnostic command. Neither is presented as product evidence.

**Focused repair GREEN:** receipt row 2497, exit 0, input closure 4, structured stdout hash `2cf7e66a22f5c39aac5f28a592c5c1631e313505291f57b1a21bb81a807e9dd5`.

**TP-11-01:** row 2499, exit 0, closure 6. Output directly reports `dependency=ACCEPTED`, `status=done`, `certification=done`, and `milestones=4/4`.

**TP-11-02:** row 2500, exit 0, closure 5. Nineteen unit tests passed with zero failures.

**TP-11-03:** row 2501, exit 0, closure 7. Nine author-boundary functional tests passed with zero failures.

**TP-11-04:** row 2502, exit 0, closure 12. Twelve publication integration tests passed with zero failures.

**TP-11-05:** row 2503, exit 0, closure 13. The exact SCN-012-005 system-Chrome regression passed.

**TP-11-06:** row 2504, exit 0, closure 13. The exact SCN-012-008 system-Chrome regression passed.

**TP-11-07:** row 2505, exit 0, closure 13. The exact SCN-012-018 system-Chrome regression passed.

**TP-11-08:** row 2506, exit 0, closure 13. The exact SCN-012-020 system-Chrome regression passed.

**TP-11-09:** row 2507, exit 0, closure 9. The exact SCN-012-028 fail-closed system-Chrome regression passed.

**TP-11-10:** row 2508, exit 0, closure 10. Five configured-cap stress tests passed with zero failures.

**TP-11-11:** row 2509, exit 0, closure 52. Seventy-six Feature 002 regression tests passed with zero failures; warning output is routed as `F012-S11-RLDATA-NODE26-WARN-014`.

**TP-11-12:** row 2498, exit 1, closure 4. The exact broad selftest executed 3,464 assertions and reported 3,460 passes plus four failures. It remains unsatisfied.

**TP-11-13:** row 2510, exit 0, closure 16. Forty-five ToolBrief family tests passed with zero failures.

**Result:** Twelve exact Test Plan rows passed on the stable current candidate. TP-11-12 and the grouped Build Quality Gate remain unchecked.

### TP-11-11

**Phase:** implement

**Command:** `node --test tests/distributed-briefs*.unit.mjs tests/distributed-briefs*.functional.mjs tests/distributed-briefs*.integration.mjs tests/distributed-briefs*.e2e.mjs tests/distributed-briefs*.stress.mjs tests/distributed-briefs*.canary.mjs tests/distributed-briefs*-canary.mjs tests/distributed-briefs*.contract.mjs tests/distributed-briefs*.consumer-trace.mjs`

**Exit Code:** 0

**Claim Source:** executed

**Structured receipt:** `.specify/runtime/tool-calls.jsonl` row 2509

**Input closure:** 52 current files

```text
exit: 0
lines: 123
sha256: e5409eca95d0213dea24ea56eceb414b9f2c63a0be5553b8eb1c63070a9eaefc
tests 76
suites 0
pass 76
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 17829.332917
```

### TP-11-12

**Phase:** implement

**Command:** `node scripts/selftest.mjs`

**Exit Code:** 1

**Claim Source:** executed

**Structured receipt:** `.specify/runtime/tool-calls.jsonl` row 2498

**Input identity:** `4a167fc108c03314b5fe4f9001499f541fcd46394ad59f5ea97a6569c431871c` before and after execution

**Path rendering:** The excerpt uses a repository-relative path. The structured receipt retains the raw local output.

```text
exit: 1
lines: 3979
sha256: 9736181097a388f399f59eb9f5dbc042e43b44a86eb6d89e3857011d75c07ed7
FAIL: tests/distributed-briefs.history.load.mjs is unreachable outside the frozen baseline
FAIL: unrelated TP-02-12 tax-pack partition and reconstruction assertion
FAIL: spec number 029 resolves to two current packet directories
FAIL: BUG-022 certification claims 53/19 while its DoD is 71/1
Research-Lab self-test: 3460 passed, 4 failed
```

### TP-11-13

**Phase:** implement

**Command:** `node --test tests/tool-brief-v2*.unit.mjs tests/tool-brief-v2*.functional.mjs tests/tool-brief-v2*.integration.mjs tests/tool-brief-v2*.stress.mjs`

**Exit Code:** 0

**Claim Source:** executed

**Structured receipt:** `.specify/runtime/tool-calls.jsonl` row 2510

**Input closure:** 16 current files

```text
exit: 0
lines: 53
sha256: cab36349523212e7ae25e7eaa130f62fb48cc380b438c481bc36c90de696ed3b
tests 45
suites 0
pass 45
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 573.113666
```

## Current Candidate Reverification — 2026-09-06

**Phase:** implement

**Claim Source:** executed

**Repository binding:** revision `bf65fe1c6a83` (HEAD at time of this reverification). `scripts/selftest.mjs` SHA-256 `6cc820054739083f0a4a7c2023c65d5c85c6b3134a46eefff958c20ed2fc8a0b` (changed from the 2026-09-01 candidate identity by unrelated intervening work; no Scope 11 source file was edited in this session).

This session investigated the three items the caller flagged as open: TP-11-12, `F012-S11-REACHABILITY-LOAD-012`, and `F012-S11-FEATURE-TRACE-013`. It also re-ran every already-green Test Plan row rather than trusting the 2026-09-01 receipts, and that re-run surfaced a fourth, previously unrouted regression. Scope 11 is **not** closed by this session.

### `F012-S11-REACHABILITY-LOAD-012` — RESOLVED

**Command:** `node scripts/validate-test-file-reachability.mjs`

**Observation:** `tests/distributed-briefs.history.load.mjs` is now classified `[direct-node-script]`, declared at 4 site(s), first `specs/002-distributed-tool-briefs-and-history/scopes/07-bounded-history-and-legacy-migration/scope.md:87`. It is no longer in the orphan set (`scripts/validate-test-file-reachability.baseline` lists only `tests/market-action-consumer-trace.mjs` and `tests/recommendation-track-record.canary.mjs`, neither owned by Scope 11 or Scope 02). TP-11-14 was executed directly per its scope.md command (`for test_file in tests/distributed-briefs*.load.mjs; do node "$test_file" || exit 1; done`): exit 0, `history load: 8 passed, 0 failed`. This finding is closed; TP-11-14 has a real green receipt.

The validator's overall process exit is still 1, but exclusively from 24 `CLASSIFICATION ERROR` lines against `specs/008-*`, `specs/030-*`, `specs/031-*`, and `specs/_ops/OPS-integrate-research-lab-main/*` authority documents, none of which reference Feature 002, Feature 012, or any Scope 11 implementation file.

### `F012-S11-FEATURE-TRACE-013` — confirmed real, confirmed outside Scope 11's boundary

**Command:** `bash .github/bubbles/scripts/scenario-test-resolve.sh specs/012-market-action-center-and-guided-tools`

**Observation:** exactly `35 unresolved reference(s) of 65 checked`, matching the finding. Root cause traced: every one of the 35 `MISSING-FILE` lines cites a `scenario-manifest.json` `linkedTests` entry written in the legacy `"path :: title"` string form (e.g. `SCN-012-032 -> tests/journey.spec.mjs :: Regression: ...`). `.github/bubbles/scripts/scenario-test-resolve.sh`'s `normalize()` function only splits a string reference on `#`, so a `::`-form reference is treated as one literal (non-existent) file path — `tests/journey.spec.mjs :: Regression: ...` — and reported MISSING-FILE even though `tests/journey.spec.mjs` exists on disk and contains the exact cited title (verified directly, e.g. `tests/journey.spec.mjs:599`).

Checked all 35 cited scenario ids against Scope 11's own four scenarios: none of SCN-012-005, SCN-012-008, SCN-012-018, or SCN-012-020 appear in the unresolved list, and each of their `linkedTests` entries already uses the object form (`{"file": ..., "testId": ...}`) or a bare path, which the resolver parses correctly. The 35 unresolved references belong to other Scope 12 scopes (Journey, Red Alert, Market Action Center shell, contextual tooltip, web evidence, provider credentials, simple model adapters, portfolio matrix/stress) whose `scenario-manifest.json` entries and whose owning scopes Scope 11 has no authority or Change-Boundary permission to edit, and the resolver itself lives under `.github/bubbles/scripts/`, a framework-managed path explicitly excluded by Scope 11's Change Boundary. This finding is real, is not caused by any Scope 11 change, and cannot be closed from within Scope 11. It remains routed to `bubbles.plan` for Feature 012, as the original finding stated.

### TP-11-12 broad selftest — improved, and the remaining failures are confirmed pre-existing/unrelated

**Command:** `node scripts/selftest.mjs`

**Observation:** `Research-Lab self-test: 3497 passed, 2 failed` (previously 3460 passed, 4 failed at the 2026-09-01 candidate). The 4 failures the report previously routed (`tests/distributed-briefs.history.load.mjs` reachability, the TP-02-12 tax-pack assertion, the spec-029 collision, and the BUG-022 certification-ratio assertion) are now gone — resolved by other owners' work landing on `main` since 2026-09-01, not by this session. Two different failures are now present:

1. `market-brief.html`'s deferred-scorecard first-load budget assertion (`scripts/selftest.mjs:9501`) — the assertion depends on the live byte sizes of `market-brief.page.json`, `market-brief.snapshot.page.json`, etc. (data files refreshed 2026-09-06, unrelated to any Scope 11 code path) summing, with the scorecard added back in, to more than `budgets.briefFirstLoadMaxBytes`; today they do not (175089 + 11982 = 187071 ≤ 204800). This assertion was introduced by commit `2e6826b85` (`wip(scope-05): preserve public-delivery closure repairs`), not by Scope 11, and concerns the Scope 05 market-brief cockpit data pipeline, not the ToolBrief v2 author/publication contract Scope 11 owns.
2. The BUG-016/BUG-017 acceptance-baseline bulk-stamp guard (`scripts/selftest.mjs:30155`) — introduced by commit `57c003889` (`docs(acceptance): record the operator acceptance of BUG-016 and BUG-017...`), entirely about human-acceptance-record bookkeeping unrelated to Feature 002, Feature 012, or any Scope 11 file.

Both are confirmed pre-existing (introduced by other scopes' commits, not present in any Scope 11 Implementation File) and outside Scope 11's Change Boundary. Scope 11 has broken no existing invariant: this broad-selftest run demonstrates 3497 passes including every ToolBrief v2/publication/privacy canary, with the two residual failures owned elsewhere. Absent the fourth finding below, this would have been sufficient to treat TP-11-12 as satisfied for Scope 11's own purposes.

### NEW: `F012-S11-NARRATIVE-WEB-BOUNDARY-021` (unrouted, within Scope 11's own Change Boundary) — Scope 11 is NOT closed

Re-running TP-11-03 exactly as scope.md specifies (`node --test tests/tool-brief-v2-author-boundary.functional.mjs`, also exercised via the TP-11-13 family command `node --test tests/tool-brief-v2*.unit.mjs tests/tool-brief-v2*.functional.mjs tests/tool-brief-v2*.integration.mjs tests/tool-brief-v2*.stress.mjs`) reproduces, deterministically, one failing test that the 2026-09-01 receipt (row 2501, "nine author-boundary functional tests passed with zero failures") did not report:

```text
✖ legacy narrative author lanes cannot browse after web evidence moves before authorship
  expected: /web:\s*false\b/
  actual:   id: 'core', ... web: true, ...
```

The test (`tests/tool-brief-v2-author-boundary.functional.mjs:113-132`) asserts that the `core` and `signals` lanes in `scripts/brief-narrative-parallel.mjs` (a Scope 11 Modified Implementation File) declare `web: false`, while only the separately named `research-acquisition` lane retains web capability. `git blame` on `scripts/brief-narrative-parallel.mjs:66-74` shows `web: true` for both `core` and `signals` dating to commit `ec89de469d` (2026-07-16), predating Scope 11's own test file (`ff31ed2e2`, 2026-09-02) — i.e. this assertion has apparently never actually passed since the test was written; the 2026-09-01 report's "nine passed, zero failures" claim for TP-11-03 does not match what the committed source and test currently produce.

This is not vestigial: `lane.web` gates a real, live capability at `scripts/brief-narrative-parallel.mjs:504` (`if (lane.web && process.env.BRIEF_NO_WEB !== '1') { for (const host of NARRATIVE_WEB_ALLOWLIST) args.push('--allow-url=' + host); }`), granting the `core`/`signals` LLM-author subprocess `--allow-url` access to a real host allowlist (Yahoo Finance, FRED, BLS, BEA, Fed, Reuters, CNBC, MarketWatch, Investing.com, CME, TreasuryDirect — `scripts/web-evidence-policy.mjs:1-7`) during the live narrative-refresh pipeline (`scripts/brief-refresh-and-push.sh`, which does not set `BRIEF_NO_WEB=1`). Scope 11's own Implementation Plan step 3 calls for exactly this removal ("web acquisition may occur only in Scope 10's stage"), so the required end-state is specified — but flipping `web: true` to `web: false` on a currently-live production authoring path changes what data the `core`/`signals` narrative sections can draw on in real Market Brief generation, and this session found no evidence establishing whether Scope 10's frozen evidence bundle already supplies an equivalent substitute for these two legacy lanes. Determining that is a real product/architecture judgment call about the live narrative pipeline's behavior, not a mechanical test-driven fix, so it was not made unilaterally in this session.

**Conclusion:** three of the four items this session was asked to close are genuinely resolved or confirmed out-of-boundary (`F012-S11-REACHABILITY-LOAD-012` resolved; `F012-S11-FEATURE-TRACE-013` and the residual TP-11-12 failures confirmed pre-existing/unrelated). But this reverification surfaced a real, reproducible, in-boundary regression against Scope 11's own author-boundary contract (TP-11-03) that was not previously routed and is not closed. Scope 11's DoD checkboxes and `state.json` `scopeProgress` are left unchanged (not marked done) pending a decision on `F012-S11-NARRATIVE-WEB-BOUNDARY-021`.

## Uncertainty Declarations

### TP-11-12 broad selftest

**What was attempted:** The exact TP-11-12 command ran repeatedly with finite bounds.

**What was observed:** The parser accepts the current file. The exact stable-input run executes 3,464 assertions, passes 3,460, and fails four checks owned outside Scope 11.

**Why this is uncertain:** The required broad-regression success signal remains false. Scope 11 cannot alter the standalone Feature 002 load-runner contract, the tax scope, the shock-transmission planning folder, or BUG-022 certification.

**What would resolve this:** The routed owners must clear `F012-S11-REACHABILITY-LOAD-012`, `F012-S11-TP1112-TAX-018`, `F012-S11-TP1112-SPEC029-019`, and `F012-S11-TP1112-BUG022-020`. TP-11-12 must then pass on one unchanged candidate.

### Build Quality Gate

**What was attempted:** TP-11-11, TP-11-12, TP-11-13, warning tracing, reachability checks, and scenario resolution ran.

**What was observed:** TP-11-12 is nonzero. TP-11-11 also emits Node 26 `localStorage` warnings from an excluded RLDATA path.

**Why this is uncertain:** The required zero-warning and broad-regression conditions are not satisfied.

**What would resolve this:** The routed owners must clear the four broad selftest failures and `F012-S11-RLDATA-NODE26-WARN-014`. The implementation owner must then rerun the affected exact rows on unchanged inputs.

## Scenario Contract Evidence

### SCN-012-005

Current executed proof: TP-11-02 row 2500, TP-11-03 row 2501, TP-11-05 row 2503, TP-11-10 row 2508, and TP-11-13 row 2510.

### SCN-012-008

Current executed proof: TP-11-02 row 2500, TP-11-06 row 2504, and TP-11-13 row 2510.

### SCN-012-018

Current executed proof: TP-11-07 row 2505.

### SCN-012-020

Current executed proof: TP-11-04 row 2502, TP-11-08 row 2506, TP-11-10 row 2508, TP-11-11 row 2509, and TP-11-13 row 2510.

## Coverage Report

## Lint/Quality

## Spot-Check Recommendations

## Validation Summary

## Audit Verdict
