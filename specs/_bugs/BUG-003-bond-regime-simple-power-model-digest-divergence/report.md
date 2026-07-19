# Report: BUG-003 Bond Regime Simple/Power Model-Digest Divergence

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Summary

- Adopted the already-committed BUG-003 repair in commit `943972e295b8fa93a19795e46015e5ae780b0350`; no production or test edit was needed in this invocation.
- Executed the exact adversarial TP-01-02 title and protected BS-011 title on current bytes; both passed.
- Executed the complete Bond Regime file (`27 passed`), repository selftest (`497 passed, 0 failed`), regression-quality guard (zero violations/warnings), and Node source-lock validator (actual graph passed; all 16 adversarial mutations rejected).
- Preserved an interrupted implementation diagnostic of the complete system-Chrome inventory (`74 passed` plus two foreign Feature 004 Node-test collection failures). It is not adopted as TP-01-08, independent evidence, or implementation completion evidence.
- Artifact lint, freshness, traceability, and G094 passed. The installed implementation-reality scan cannot resolve this packet's `.html`/`.mjs` implementation surface and failed `ZERO_FILES_RESOLVED`; Bubbles doctor also reports pre-existing framework-integrity drift. Those findings are routed, not patched here.
- No certification, BUG-002 mutation, Feature 003/006/007 mutation, Market Brief mutation, shared-JavaScript mutation, package/config mutation, staging, commit, pull, merge, reset, checkout, stash, or cleanup is claimed.

## Completion Statement

BUG-003 remains In Progress. Current implementation evidence is green and `TR-BUG-003-IMPLEMENT` is resolved by adopting the committed repair without source/test edits. TP-01-08 remains independently test-owned and unclaimed by implementation. Independent `bubbles.test` verification, preserved foreign Feature 004 collection findings, the installed reality-scan limitation, BUG-002 resume, validation, audit, certification, and Feature 006 replay remain open. The next required owner is `bubbles.test`.

## Bug Reproduction - Before Fix

### Independent Acceptance Failure

**Phase:** bug-discovery  
**Claim Source:** interpreted  
**Interpretation:** The invoking `bubbles.test` owner supplied current-session results from its independent BUG-002 acceptance run. This `bubbles.bug` invocation did not execute that failing run and does not relabel it as self-executed evidence.

```text
Complete system-Chrome inventory: 72 passed, 1 failed
Isolated replay: 0 passed, 1 failed
Failing file: tests/bond-regime-lab.spec.mjs
Failing title: BS-011 Simple and Power share one model digest
Protected scenario: SCN-003-011
Expected Simple digest: 8a020d8b
Received Power digest: 40108ba6
BUG-002 focused behavior: green
Independent BUG-002 acceptance: blocked
Parent Feature 006 replay: blocked
```

**Result:** Confirmed external finding. The values and protected identity are preserved verbatim; execution provenance remains attributed to `bubbles.test`.

### Exact Current Isolated Replay

**Phase:** bug-discovery  
**Commands:** exact protected system-Chrome command, executed twice standalone and six times unchanged under concurrent scheduler load through the repo tool logger  
**Exit Codes:** eight executions exited 0  
**Claim Source:** executed  
**Interpretation:** These green replays do not close the bug. They show that the protected failure depends on whether the command observes the page before or after automatic hydration settlement.

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] tests/bond-regime-lab.spec.mjs:313:1 BS-011 Simple and Power share one model digest (747ms)

  1 passed (2.5s)
[tool-log] recorded exit=0 duration=3823ms
Running 1 test using 1 worker

  ✓  1 [system-chrome] tests/bond-regime-lab.spec.mjs:313:1 BS-011 Simple and Power share one model digest (1.1s)

  1 passed (3.2s)
[tool-log] recorded exit=0 duration=3937ms
```

The structured rows are in `.specify/runtime/tool-calls.jsonl` under sessions `BUG003-DISCOVERY-20260715` and `BUG003-DISCOVERY-REPLAY-20260715`.

The unchanged six-command scheduler replay also produced six `1 passed` summaries, six child exit codes of 0, and `BUG003_CONCURRENT_EXACT_AGGREGATE_EXIT=0` under session `BUG003-CONCURRENT-EXACT-RED-20260715`.

> **Uncertainty Declaration**
> **What was attempted:** Two standalone exact isolated commands, one complete Bond file, and six byte-identical exact isolated commands under concurrent scheduler load.
> **What was observed:** All current packet-invocation runs passed; none recreated the invoking test owner's exact assertion failure. The separate real-browser mutation timeline did recreate both exact digest states and the false Ready window on every one of 12 pages.
> **Why this is uncertain:** The pre-existing protected test is scheduler-sensitive and does not deterministically stop inside the cross-time window on the current machine load.
> **What would resolve this:** TP-01-02 must be added before production editing and must deterministically fail by holding the true external Treasury boundary while asserting that Ready is absent.

### Current Complete Bond File Replay

**Phase:** bug-discovery  
**Command:** `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`  
**Exit Code:** 0  
**Claim Source:** executed  
**Output window:** final ten tests and summary from full current-session output.

```text
  ✓ 17 [system-chrome] tests/bond-regime-lab.spec.mjs:313:1 BS-011 Simple and Power share one model digest (346ms)
  ✓ 18 [system-chrome] tests/bond-regime-lab.spec.mjs:328:1 BS-012 lever change recomputes without fetch or observed mutation (221ms)
  ✓ 19 [system-chrome] tests/bond-regime-lab.spec.mjs:344:1 BS-014 partial data is keyboard and text equivalent (249ms)
  ✓ 20 [system-chrome] tests/bond-regime-lab.spec.mjs:358:1 Registered Bond Regime tool publishes one owner read without restricted payload (201ms)
  ✓ 21 [system-chrome] tests/bond-regime-lab.spec.mjs:371:1 Power canvases are nonblank synchronous and text equivalent on desktop and mobile (401ms)
  ✓ 22 [system-chrome] tests/bond-regime-lab.spec.mjs:390:1 Fresh partial stale error and large-shock layouts contain text without overlap (1.8s)
  ✓ 23 [system-chrome] tests/bond-regime-lab.spec.mjs:431:1 Power ratio window sleeve focus and restored preferences stay local (389ms)
  ✓ 24 [system-chrome] tests/bond-regime-lab.spec.mjs:450:1 Power sleeve analytics expose return risk drawdown and trend when history is sufficient (294ms)
  ✓ 25 [system-chrome] tests/bond-regime-lab.spec.mjs:460:1 Live page loads production config cache and reachable public sources without uncaught errors (251ms)
  ✓ 26 [system-chrome] tests/bond-regime-lab.spec.mjs:470:1 Both modes expose landmarks names focus and noncolor states at 390 and 1440 widths (505ms)

  26 passed (19.5s)
```

This is pre-repair compatibility evidence only.

## Timing-Path Reproduction

**Phase:** bug-analysis  
**Command:** current-session read-only Node/Playwright mutation-timeline probe recorded as session `BUG003-RCA-20260715`  
**Exit Code:** 0  
**Claim Source:** interpreted  
**Interpretation:** The probe used current production bytes, the existing real static server, the same shared cache shape, and deterministic true-external-boundary Treasury fixtures. Across 12 pages, every initial Simple/runtime digest was `8a020d8b`, every settled Simple/runtime digest was `40108ba6`, and Power projected `40108ba6`. The status text was already Ready in mutation records where `refresh.active=true`.

```text
BUG003_DIGEST_TIMELINE_BEGIN
trial=1 initialDecisionGrid=8a020d8b initialRuntime=8a020d8b initialRefreshActive=false
trial=1 inFlightDecisionGrid=8a020d8b inFlightRuntime=8a020d8b inFlightRefreshActive=true status=Ready
trial=1 finalDecisionGrid=40108ba6 finalRuntime=40108ba6 finalRefreshActive=true status=Ready
trial=1 powerAfterClick=40108ba6 settledRuntime=40108ba6
trial=2 initialDecisionGrid=8a020d8b initialRuntime=8a020d8b initialRefreshActive=false
trial=2 inFlightDecisionGrid=8a020d8b inFlightRuntime=8a020d8b inFlightRefreshActive=true status=Ready
trial=2 finalDecisionGrid=40108ba6 finalRuntime=40108ba6 finalRefreshActive=true status=Ready
trial=2 powerAfterClick=40108ba6 settledRuntime=40108ba6
trialsObserved=12
allTrialsInitialDigest=8a020d8b
allTrialsSettledDigest=40108ba6
modeTriggeredRecompute=false
BUG003_DIGEST_TIMELINE_END
```

The compact lines above are an interpretation of the full raw JSON timeline, not a claim that the probe printed this compact representation. The full command output was observed in the current session and its structured tool-log row records `exitCode=0` under session `BUG003-RCA-20260715`; it is not reused as completion evidence.

## Controlling Code Path

**Phase:** bug-analysis  
**Claim Source:** interpreted  
**Interpretation:** Current source/test reads were traced against the dynamic timeline. Each conclusion below requires both source structure and observed runtime transitions.

| Step | Current control | Evidence-backed conclusion |
| --- | --- | --- |
| Hash | `stableDecisionDigest` near production line 1997 | One deterministic hash helper |
| Model | digest assembled near 2072 and assigned to `creditView.decisionDigest` near 2083 | One shared digest per model instance |
| Power projection | `renderPower()` assigns `view.decisionDigest` near 2223 | Power does not compute a digest |
| Simple projection | `render()` assigns `runtime.viewModel.decisionDigest` near 2273 | Simple does not compute a digest |
| Mode switch | `setMode()` near 2441 | Visibility/persistence/composition only |
| Boot | cached compute/render then zero-delay `hydrate(false)` near 2524 | Ready is exposed before auto-hydration begins |
| Hydration | cached and final `recompute()` while refresh is active | Same path produces successive model instances |
| Status | `render()` unconditionally writes Ready | Readiness does not prove settlement |

## Root Cause Decision

| Candidate | Disposition | Evidence ref |
| --- | --- | --- |
| Stale DOM projection | Rejected | Timeline shows Simple DOM and runtime advance together |
| Asynchronous rerender | Confirmed primary cause | Exact two hashes occur sequentially during automatic hydration |
| Duplicate digest assignment | Rejected | Both DOM assignments read one shared field |
| View-model mutation by mode switch | Rejected | `setMode` does not recompute or replace model state |
| Actual second Simple/Power compute path | Rejected | Hydration repeats the one compute path; Power has no calculator |

## Regression Contract

The existing protected test remains `BS-011 Simple and Power share one model digest` in `tests/bond-regime-lab.spec.mjs`. Its title and assertions must stay unchanged.

The deterministic scenario-first test is `Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison` in the same feature-specific file. It holds the true external Treasury response through a promise gate, asserts cached content remains Refreshing while the route is unresolved, releases the response, awaits Ready, and then executes the Simple/Power parity, assumption, and zero-request checks on production-produced values.

## Test Evidence

| Test surface | Current-session status | Evidence boundary |
| --- | --- | --- |
| Independent complete system-Chrome run | Caller reports 72 passed, 1 failed | Valid discovery input attributed to `bubbles.test`; not self-executed by this agent |
| Independent exact BS-011 | Caller reports 0 passed, 1 failed | Protected RED preserved; not self-executed by this agent |
| Exact current BS-011, replay 1 | Executed, exit 0, 1 passed | Demonstrates timing sensitivity only |
| Exact current BS-011, replay 2 | Executed, exit 0, 1 passed | Demonstrates timing sensitivity only |
| Six concurrent exact BS-011 replays | Executed, six exits 0, six passed | Scheduler stress did not recreate the exact assertion RED; no completion claim |
| Complete current Bond file | Executed, exit 0, 26 passed | Pre-repair compatibility only |
| Twelve-page mutation timeline | Executed, exit 0 | Root-cause diagnostic, not an after-fix result |
| New adversarial title | Not run; test is not present in this planning phase | Must RED before production edit and GREEN after repair |
| Complete post-repair system Chrome | Not run | Required before BUG-002 acceptance resumes |

## Bug Verification - After Fix

### Adopted Repair And RED Provenance

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The current clean tracked bytes in commit `943972e295b8fa93a19795e46015e5ae780b0350` already contain the planned three-part production lifecycle repair and the exact adversarial title. The packet's inline TP-01-02 evidence records the deterministic pre-fix exit `1` before those production bytes changed. This invocation did not execute that historical failure and does not relabel it as newly executed evidence. The pre-fix anchors were untracked, so recreating the old state would require destructive or synthetic worktree manipulation; none was attempted.

The adopted production bytes keep `render()` from publishing Ready while `runtime.refresh.active` is true, publish Ready only after terminal hydration clears the active flag, and call `hydrate(false)` in the boot turn. `stableDecisionDigest`, `computeBondLabViewModel`, `renderPower`, `setMode`, assumptions, persistence, and source adapters remain outside the repair. `tests/brief-refresh-atomicity.support.mjs` is clean concurrent BUG-002 work from the same commit and was inspected but not changed.

### Focused Current-Session GREEN

**Executed:** YES (current session)
**Commands:**

1. `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison" --reporter=list`
2. `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "BS-011 Simple and Power share one model digest" --reporter=list`

**Exit Codes:** `0`, `0`
**Claim Source:** executed
**Output:**

```text
Running 1 test using 1 worker

  ✓  1 …eady waits for auto-hydration before Simple and Power comparison (490ms)

  1 passed (1.1s)

Running 1 test using 1 worker

  ✓  1 ….spec.mjs:375:1 › BS-011 Simple and Power share one model digest (344ms)

  1 passed (883ms)
```

**Result:** PASS. The deterministic held-Treasury scenario and the exact protected consumer title are green on the adopted repair.

### Complete Bond Regime Browser File

**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** `0`
**Claim Source:** executed
**Output:**

```text
Running 27 tests using 1 worker

  ✓   1 …mjs:75:1 › BS-001 duration-driven ratio improvement stays mixed (493ms)
  ✓   2 … › BS-002 aligned ratios plus OAS confirmation are constructive (240ms)
  ✓   3 …1 › BS-003 tight but widening keeps level and momentum separate (295ms)
  ✓   4 …ec.mjs:128:1 › BS-010 latest common date excludes unmatched leg (291ms)
  ✓   5 …:137:1 › BS-004 bull steepener retains defensive credit context (278ms)
  ✓   6 ….mjs:150:1 › BS-005 bear steepener penalizes long duration most (207ms)
  ✓   7 …curve inversion alone leaves duration balanced or indeterminate (204ms)
  ✓   8 …js:172:1 › BS-006 six month mixed shock decomposes every sleeve (224ms)
  ✓   9 …S-007 oversized shock preserves estimate and lowers reliability (200ms)
  ✓  10 …92:1 › BS-008 stale characteristic remains visible and unranked (224ms)
  ✓  11 …reject nonfinite input and persist only allowlisted assumptions (214ms)
  ✓  12 …nd official nominal headers or explicit unavailable source state (6.5s)
  ✓  13 …2:1 › BS-009 optional macro outage leaves truthful partial read (218ms)
  ✓  14 …c.mjs:275:1 › BS-013 restricted observation remains memory only (365ms)
  ✓  15 …rst refresh preserves successful families when one source fails (221ms)
  ✓  16 … restricted endpoint or raw observation persistence path exists (210ms)
  ✓  17 …ady waits for auto-hydration before Simple and Power comparison (260ms)
  ✓  18 …spec.mjs:375:1 › BS-011 Simple and Power share one model digest (239ms)
  ✓  19 …-012 lever change recomputes without fetch or observed mutation (195ms)
  ✓  20 …mjs:406:1 › BS-014 partial data is keyboard and text equivalent (223ms)
  ✓  21 …Regime tool publishes one owner read without restricted payload (204ms)
  ✓  22 … nonblank synchronous and text equivalent on desktop and mobile (471ms)
  ✓  23 …stale error and large-shock layouts contain text without overlap (2.2s)
  ✓  24 …r ratio window sleeve focus and restored preferences stay local (317ms)
  ✓  25 …xpose return risk drawdown and trend when history is sufficient (276ms)
  ✓  26 …nfig cache and reachable public sources without uncaught errors (209ms)
  ✓  27 …andmarks names focus and noncolor states at 390 and 1440 widths (380ms)

  27 passed (16.1s)
```

**Result:** PASS. Every scenario in the complete Bond Regime browser file passed with zero required skip.

### Repository And Functional Integrity

**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** `0`
**Claim Source:** executed
**Output:**

```text
Feature 009 Scope 1 cache-owned MSFT market truth
  ✓ Feature 009 quote validator accepts the actual cache value and exact quote clocks
  ✓ Feature 009 bar validator accepts every actual daily row and exact bar clocks
  ✓ Feature 009 quote validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 bar validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 daily close and SMA20/SMA50/SMA200 equal independent test math over actual daily rows
  ✓ Feature 009 High252 stack and signed distances equal independent test math over actual daily rows
  ✓ Feature 009 delayed quote differs from and never contaminates the last daily close
  ✓ Feature 009 short daily history exposes every unsupported technical as unavailable with a closed reason
  ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of
  ✓ Feature 009 accepted state preserves the model cutoff and daily-only technical ownership
  ✓ Feature 009 accepted state is deeply immutable across market truth branches
  ✓ Feature 009 production-validated quote replacement changes quote-owned fields only

================================================
Research-Lab self-test: 497 passed, 0 failed
================================================
```

**Result:** PASS. The complete repository selftest passed `497/0`.

**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/bond-regime-lab.spec.mjs`
**Exit Code:** `0`
**Claim Source:** executed
**Output:**

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-16T21:16:30Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/bond-regime-lab.spec.mjs
✅ Adversarial signal detected in tests/bond-regime-lab.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

**Result:** PASS. The bugfix test contains an adversarial signal and no skip, bailout, warning, or quality violation.

**Executed:** YES (current session)
**Command:** `node scripts/validate-node-source-lock.mjs`
**Exit Code:** `0`
**Claim Source:** executed
**Output:**

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=manifest-wrong-version result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=lifecycle-relaxation result=REJECTED code=NPMRC-IGNORE-SCRIPTS
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

**Result:** PASS. The actual dependency graph passed and all 16 adversarial source mutations were rejected.

### Implementation Boundary

The current implementation owner made no product or test edit because the coherent repair was already present in clean tracked bytes. Pre-evidence and post-test SHA-256 values remained:

- `bond-regime-lab.html`: `af96efaddf1c4fce9b8e79f9ef988f5226081c0f08a375f85eb403a324a69111`
- `tests/bond-regime-lab.spec.mjs`: `b010a103a2b65f820ba7106f5c73127d6cf3f1ec4495a8d1d7cad3a8908989ed`
- `tests/brief-refresh-atomicity.support.mjs`: `020c98f461a3d528c5e0de113c76f1d5475667fc8a75b9ad6ae5fe681bffd55b`

The complete system-Chrome inventory, independent replay, validation, audit, certification, BUG-002 resume, and Feature 006 replay were not run or claimed by this implementation phase. They remain assigned to `bubbles.test` and the existing downstream owner chain.

## Packet Validation Evidence

**Phase:** bug  
**Commands:** artifact lint; artifact freshness guard; traceability guard; G094 capability-foundation guard; JSON/markdown contract check; `cli.sh doctor`; editor diagnostics; untracked/staged/hash integrity check  
**Final Exit Codes:** 0 for every command-backed final check  
**Claim Source:** executed  
**Interpretation:** The final packet shape, traceability, proportionality decision, machine contracts, diagnostics, and change boundary are valid. These checks validate planning artifacts only and provide no implementation or certification evidence.

```text
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
RESULT: PASSED (0 warnings)
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
artifactInventoryExact=PASS
stateStatusInProgress=PASS
protectedTitleExact=PASS
markdownJsonTestParity=PASS
resumeChainExact=PASS
artifactCount=9
testPlanCount=9
scenarioCount=1
result=PASS
Result: 17 passed, 0 failed, 1 advisory
No errors found.
trackedDiffCheckExit=0
cachedDiffQuietExit=0
bond-regime-lab.htmlUnchanged=PASS
tests/bond-regime-lab.spec.mjsUnchanged=PASS
artifactInventory=PASS
result=PASS
```

The doctor advisory reports pre-existing dirty-local-source/framework-drift and undeclared-observability posture; it does not identify a BUG-003 packet failure. Artifact lint reports the repo-convention compatibility fields `scopeProgress`, `statusDiscipline`, and `scopeLayout` as deprecated advisories while passing. The first traceability run found an explicit G068 DoD-fidelity gap, the first G094 run requested canonical proportionality headings, and the first strict untracked scan found EOF/Markdown-hard-break handling issues. All are corrected and their identical final checks pass.

## Code Diff Boundary

Before packet creation, `bond-regime-lab.html` and `tests/bond-regime-lab.spec.mjs` were both untracked with SHA-256 values `70a5093dbe8a82167dd2839fc9274afcb3b65671a242139ed34e22928790f762` and `e423f76cfa3d6a45deec62e63585730abfa357f47e9854e0f7bcd912c97bee49`. Feature 003, Feature 006, and BUG-002 artifact families were also untracked shared-worktree inputs. This invocation adds only the nine files in the BUG-003 directory and does not normalize any pre-existing untracked family.

## Planning Finding Accounting - Historical

This table records the original `bubbles.bug` handoff. Current dispositions supersede it in [Finding Closure And Routing](#finding-closure-and-routing).

| Finding | Disposition in this invocation | Remaining owner |
| --- | --- | --- |
| `BUG003-RCA-001` | Addressed: exact runtime transitions, controlling path, and rejected classifications are grounded | None |
| `BUG003-PLANNING-001` | Addressed: one-scope repair, deterministic RED, verification order, boundary, and resume chain are complete | None |
| `BUG003-PACKET-G068` | Addressed: SCN-BUG003-001 now has a declared behavior-faithful DoD item and traceability passes | None |
| `BUG003-PACKET-G094` | Addressed: single-capability, single-screen, and single-implementation decisions use canonical headings and G094 passes | None |
| `BUG003-PACKET-INTEGRITY` | Addressed: final newlines, canonical Markdown hard breaks, exact nine-file inventory, no staging, and anchor hashes pass | None |
| `BUG003-ENV-ADVISORIES` | Accounted: doctor advisories are pre-existing environment posture and do not change this packet's route or boundary | None |
| `BUG003-ASYNC-READY-RACE` | Unresolved: current production still publishes Ready before hydration settlement | `bubbles.implement` |
| `BUG003-DETERMINISTIC-RED-GAP` | Unresolved: eight current exact replays passed; the designed adversarial test must produce deterministic scenario-first RED before production editing | `bubbles.implement`, then `bubbles.test` |
| `BUG003-INDEPENDENT-VERIFICATION` | Unresolved: no post-repair exact/file/inventory evidence exists | `bubbles.test` |
| `BUG002-ACCEPTANCE-BLOCK` | Unresolved: BUG-002 independent acceptance remains blocked by the protected regression | `bubbles.test` after BUG-003 verification |

## Bug-Discovery Invocation Audit - Historical

No orchestrator or subagent was invoked. The user explicitly required the `bubbles.goal` direct-authorized runner context and prohibited nested dispatch. All source/test inspection, reproduction attempts, root-cause diagnostics, and packet authoring occurred within this `bubbles.bug` invocation.

## Implementation Reconciliation - Current Session

### Adopted Implementation

**Phase:** implement
**Claim Source:** executed and interpreted
**Commit:** `943972e295b8fa93a19795e46015e5ae780b0350`
**Anchor hashes:** `bond-regime-lab.html` = `af96efaddf1c4fce9b8e79f9ef988f5226081c0f08a375f85eb403a324a69111`; `tests/bond-regime-lab.spec.mjs` = `b010a103a2b65f820ba7106f5c73127d6cf3f1ec4495a8d1d7cad3a8908989ed`

Current source inspection confirms the planned three-part lifecycle: `render()` writes Ready only when `!runtime.refresh.active`; terminal hydration clears `runtime.refresh.active` before publishing Ready; boot calls `hydrate(false)` synchronously after exposing `window.BondRegimeLab`. The dedicated held-boundary test remains immediately before the protected BS-011 block. No source/test bytes were changed by this implementation owner.

Current TP-01-09 reconciliation reconfirmed that both anchors match commit `943972e295b8fa93a19795e46015e5ae780b0350`, both anchor diffs and the cached BUG-003 diff exit 0, and no BUG-003 path is staged. Concurrent Feature 010 and BUG-002 helper bytes remain outside this ownership boundary and were preserved.

### Focused Green And Protected Contract

**Executed:** YES (in current session)
**Commands:**

```text
npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison" --reporter=list
npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "BS-011 Simple and Power share one model digest" --reporter=list
```

**Exit Codes:** 0, 0
**Claim Source:** executed
**Output:**

```text
Running 1 test using 1 worker

  ✓  1 …Ready waits for auto-hydration before Simple and Power comparison (1.8s)

  1 passed (2.8s)

Running 1 test using 1 worker

  ✓  1 ….spec.mjs:375:1 › BS-011 Simple and Power share one model digest (561ms)

  1 passed (1.3s)
```

**Result:** PASS for implement-owned current-byte verification. The packet's already-recorded TP-01-02 RED remains the before-fix evidence; it was not rerun or relabeled.

The current reconciliation rerun also exited `0`, reporting TP-01-02 `1 passed (1.1s)` with a `474ms` test and TP-01-03 `1 passed (1.0s)` with a `459ms` test. This refreshes the implementation evidence without replacing or reclassifying the preserved historical RED.

### Focused File And Repository Matrix

**Executed:** YES (in current session)
**Claim Source:** executed

```text
npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
  27 passed (16.3s)

node scripts/selftest.mjs
================================================
Research-Lab self-test: 497 passed, 0 failed
================================================

bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/bond-regime-lab.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1

node scripts/validate-node-source-lock.mjs
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

The complete unfiltered outputs and hashes are current-session structured tool-log entries for this packet and scope.

The current reconciliation rerun reported `27 passed (13.4s)`, `Research-Lab self-test: 497 passed, 0 failed`, regression quality `0 violation(s), 0 warning(s)`, and Node source lock `actual=PASS` with all 16 adversarial mutations rejected.

### Complete Inventory With Foreign Failures

> **Evidence boundary:** This section preserves an interrupted diagnostic already present in the shared worktree. It is not adopted as implementation-owned TP-01-08 evidence, does not satisfy the broader E2E DoD item, and cannot substitute for independent `bubbles.test` execution.

**Executed:** YES (in current session)
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
✖ Feature 004 preserves every pre-existing dirty hunk (51.65725ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (76.418042ms)
✖ Feature 004 preserves the untracked validator prefix and volatile config boundary (15.466541ms)

Running 74 tests using 6 workers
  ✓  39 …07 qualified series and RLVALID preserve legacy shared behavior (868ms)
  ✓  64 …ady waits for auto-hydration before Simple and Power comparison (245ms)
  ✓  65 …spec.mjs:375:1 › BS-011 Simple and Power share one model digest (255ms)
  ✓  74 …andmarks names focus and noncolor states at 390 and 1440 widths (341ms)

  74 passed (48.1s)
```

Direct owner-test diagnosis:

```text
node --test tests/feature-004-dirty-tree-collision.test.mjs
ℹ tests 3
ℹ pass 1
ℹ fail 2
AssertionError [ERR_ASSERTION]: scripts/selftest.mjs complete current identity matches the reviewed disposition
actual status='' hunkCount=0
expected status=' M' hunkCount=7
AssertionError [ERR_ASSERTION]: scripts/validate-brief-payload.mjs remains untracked and unstaged
actual='' expected='??'
```

**Result:** Playwright's 74-test inventory is green, including Feature 007, but the complete command is not a clean broad-regression proof because Node tests executed during collection fail without propagating to the Playwright exit code.

### Packet And Environment Checks

| Check | Outcome |
| --- | --- |
| Artifact lint | PASS; three pre-existing deprecated state-field advisories |
| Artifact freshness | PASS; 0 failures, 0 warnings |
| Traceability | PASS; 0 warnings |
| G094 capability foundation | PASS |
| Implementation reality scan | FAIL; `ZERO_FILES_RESOLVED` because the installed discovery contract excludes this `.html`/`.mjs` surface |
| Evidence tool-log bridge | CONCERN; 6/8 checked items matched (75%) and several matches point to unrelated historical BUG-002 commands |
| Editor diagnostics on the two anchors and three owned artifacts | PASS; no errors found |
| Bubbles doctor | FAIL; one non-executable script, drift in `install-bubbles-hooks.sh`, drift in `query_tool_log.json`, and undeclared observability posture |

The current reconciliation reran artifact lint, freshness, traceability, G094, implementation reality, and editor diagnostics. The first four passed; editor diagnostics reported no errors; implementation reality reproduced `ZERO_FILES_RESOLVED`. Source inspection of the installed scanner confirms its implementation discovery regex omits both `.html` and `.mjs`, so that failure is routed as `BUG003-G028-ZERO-FILES-RESOLVED` rather than patched in this downstream bug.

### Finding Closure And Routing

| Finding ID | Disposition | Owner |
| --- | --- | --- |
| `BUG003-ASYNC-READY-RACE` | Addressed by committed lifecycle bytes plus current TP-01-02 GREEN | `bubbles.implement` |
| `BUG003-DETERMINISTIC-RED-GAP` | Addressed; packet RED is preserved and the exact adversarial title now exists and passes current bytes | `bubbles.implement` |
| `TR-BUG-003-IMPLEMENT` | Resolved by implementation adoption and current focused/file/repository evidence | `bubbles.implement` |
| `BUG003-INDEPENDENT-VERIFICATION` | Unresolved; implementation evidence cannot substitute for the assigned independent owner | `bubbles.test` |
| `BUG002-ACCEPTANCE-BLOCK` | Unresolved; resume only after BUG-003 independent verification and broad-failure disposition | `bubbles.test` |
| `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY` | Unresolved foreign failure: committed `scripts/selftest.mjs` no longer matches Feature 004's dirty-hunk baseline | Feature 004 owning workflow |
| `BUG003-FOREIGN-F004-UNTRACKED-BOUNDARY` | Unresolved foreign failure: committed validator no longer matches Feature 004's untracked baseline | Feature 004 owning workflow |
| `BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION` | Unresolved: two Node collection failures do not affect the Playwright exit code | `bubbles.test`, then owning harness workflow |
| `BUG003-G028-ZERO-FILES-RESOLVED` | Unresolved framework/planning-gate mismatch for `.html`/`.mjs` implementation files | Bubbles framework/planning owner |
| `BUG003-EVIDENCE-BRIDGE-CROSS-SPEC-MATCH` | Unresolved framework matcher defect: 75% coverage and unrelated BUG-002 command matches for BUG-003 DoD items | Bubbles framework owner |
| `BUG003-ENV-DOCTOR-NONEXECUTABLE` | Unresolved pre-existing framework-install finding | Bubbles framework owner |
| `BUG003-ENV-DOCTOR-INSTALL-HOOK-DRIFT` | Unresolved pre-existing managed-file drift | Bubbles framework owner |
| `BUG003-ENV-DOCTOR-QUERY-TOOL-LOG-DRIFT` | Unresolved pre-existing managed-file drift | Bubbles framework owner |
| `BUG003-ENV-OBSERVABILITY-UNDECLARED` | Unresolved advisory posture | Repository governance owner |

Inherited BUG-002 and Feature 006 findings remain unchanged and foreign-owned: `BUG002-INDEPENDENT-VERIFICATION`, `BUG002-BROAD-E2E-INSTABILITY`, `BUG002-REGRESSION-PHASE`, `BUG002-VALIDATE-CERTIFICATION`, `BUG002-AUDIT-CERTIFICATION`, `F006-FW-CHECK8-MJS-001`, `F006-FW-G085-001`, and `F006-EXT-SELFTEST-MARKET-BRIEF-001`. No Feature 007 failure was observed; its shared-canary and browser scenario passed in the current matrix.

## Independent Test Verification - 2026-07-16

### Independent Test Verdict

**Phase:** test

**Claim Source:** executed

**Outcome:** `route_required`

The BUG-003 repair is independently green at its focused boundary, but SCOPE-01 and the bug remain `in_progress`. The direct Feature 004 dirty-tree canary still fails two of three Node tests, so the mandatory broader row is not clean even though the current complete Playwright command reports 76 browser passes and no collection-side Node stderr. BUG-002 may not resume.

| Test Plan row / check | Exit | Current result |
| --- | ---: | --- |
| TP-01-02 exact adversarial title | 0 | 1 passed |
| TP-01-03 exact protected BS-011 title | 0 | 1 passed |
| TP-01-04 complete Bond file | 0 | 27 passed, 0 failed, 0 skipped |
| TP-01-05 repository selftest | 0 | 505 passed, 0 failed; count includes concurrent Feature 010 |
| TP-01-06 regression-quality guard | 0 | 0 violations, 0 warnings; 1 adversarial signal |
| TP-01-07 Node source lock | 0 | Actual graph passed; 16 adversarial mutations rejected |
| Direct Feature 004 Node canary | 1 | 1 passed, 2 failed, 0 skipped |
| TP-01-08 complete system Chrome | 0 | 76 browser tests passed; full transcript contained no Node collection failure in this run |
| TP-01-09 boundary integrity | 0 | Both anchors clean at committed SHA-256 values |

### Exact Focused Proof

**Executed:** YES (in current session)

**Commands:** exact TP-01-02 and TP-01-03 commands from `scopes.md`

**Exit Codes:** `0`, `0`

**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 …eady waits for auto-hydration before Simple and Power comparison (363ms)

  1 passed (1.0s)

Running 1 test using 1 worker

  ✓  1 …b.spec.mjs:375:1 › BS-011 Simple and Power share one model digest (1.6s)

  1 passed (5.3s)
```

**Result:** PASS. The adversarial title independently crosses the held Treasury boundary before the shared helper can establish settlement. Protected BS-011 independently remains green after settled setup.

### Complete Bond And Repository Matrix

**Executed:** YES (in current session)

**Commands:** exact TP-01-04 through TP-01-07 commands from `scopes.md`

**Exit Codes:** `0`, `0`, `0`, `0`

**Claim Source:** executed

**Output windows:** selected lines from the complete unfiltered transcripts retained by the terminal tool.

```text
Running 27 tests using 1 worker

  ✓   1 …mjs:75:1 › BS-001 duration-driven ratio improvement stays mixed (452ms)
  ✓  17 …ady waits for auto-hydration before Simple and Power comparison (249ms)
  ✓  18 …spec.mjs:375:1 › BS-011 Simple and Power share one model digest (249ms)
  ✓  19 …-012 lever change recomputes without fetch or observed mutation (192ms)
  ✓  20 …mjs:406:1 › BS-014 partial data is keyboard and text equivalent (227ms)
  ✓  26 …nfig cache and reachable public sources without uncaught errors (201ms)
  ✓  27 …andmarks names focus and noncolor states at 390 and 1440 widths (419ms)

  27 passed (16.3s)
```

```text
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 source-qualified SEC extract binds to SourceArtifact content identity
  ✓ Feature 010 complete publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 material claim resolves source transformation consumer rights and unavailable-link lineage
  ✓ Feature 010 direct route loads only same-origin scripts and exposes no credential field
  ✓ Feature 010 validator executes production config graph projection and trace functions

================================================
Research-Lab self-test: 505 passed, 0 failed
================================================
```

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-16T23:29:47Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/bond-regime-lab.spec.mjs
✅ Adversarial signal detected in tests/bond-regime-lab.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

### Broader-Suite Finding Accounting

**Executed:** YES (in current session)

**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`

**Exit Code:** `1`

**Claim Source:** executed

**Output:**

```text
✖ Feature 004 preserves every pre-existing dirty hunk (52.846ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (86.382583ms)
✖ Feature 004 preserves the untracked validator prefix and volatile config boundary (15.536167ms)
ℹ tests 3
ℹ suites 0
ℹ pass 1
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 209.122708

AssertionError [ERR_ASSERTION]: scripts/selftest.mjs complete current identity matches the reviewed disposition
actual: indexOid=484706d2f819971c298fd3dcef19e34915c4f052 hunkCount=1 worktreeSha256=0dfd5dc6178ea29e5317a60f30656932240dc6051db7e0c3738b2987371645f3
expected: indexOid=03a285cfa21b2f2e1b22b539ac0452094029c110 hunkCount=7 worktreeSha256=f47e86bc746eddad82892844aacde100ff8f82d6e29e4d0a4df6a68ed0bb53c8

AssertionError [ERR_ASSERTION]: scripts/validate-brief-payload.mjs remains untracked and unstaged
actual=''
expected='??'
```

The two failures are foreign Feature 004 fail-closed identity findings. This invocation did not weaken or edit the tests, `scripts/selftest.mjs`, `scripts/validate-brief-payload.mjs`, Feature 004 artifacts, Feature 010, or the harness configuration.

**Executed:** YES (in current session)

**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** `0`

**Claim Source:** interpreted

**Interpretation:** The full unfiltered transcript reports 76 browser passes and contains no Node collection failure text in this run. This does not clear TP-01-08 acceptance because the mandatory direct Node canary above independently exits 1; a green Playwright exit and browser count cannot override that failure.
**Output window:** final lines from the complete transcript.

```text
  ✓  66 …eady waits for auto-hydration before Simple and Power comparison (2.3s)
  ✓  67 ….spec.mjs:375:1 › BS-011 Simple and Power share one model digest (2.8s)
  ✓  68 …S-012 lever change recomputes without fetch or observed mutation (2.4s)
  ✓  69 ….mjs:406:1 › BS-014 partial data is keyboard and text equivalent (1.8s)
  ✓  70 …Regime tool publishes one owner read without restricted payload (797ms)
  ✓  71 … nonblank synchronous and text equivalent on desktop and mobile (937ms)
  ✓  72 …stale error and large-shock layouts contain text without overlap (2.6s)
  ✓  73 …r ratio window sleeve focus and restored preferences stay local (875ms)
  ✓  74 …xpose return risk drawdown and trend when history is sufficient (350ms)
  ✓  75 …nfig cache and reachable public sources without uncaught errors (220ms)
  ✓  76 …andmarks names focus and noncolor states at 390 and 1440 widths (397ms)

  76 passed (41.5s)
```

### Test Substance And Contract Ownership

**Claim Source:** interpreted

**Interpretation:** Source inspection is used only to classify what the passing exact tests prove; pass/fail claims above come from execution.

- The adversarial title does not call `openFromSharedCache` before its held-state assertions. It waits for a true external Treasury request to start, holds that promise, proves cached model content is visible while `refresh.active` is true, directly asserts public status excludes Ready and includes Refreshing, releases the request in `finally`, then waits for public Ready and verifies terminal `refresh.active=false`.
- After settlement, the adversarial title compares the production-generated Simple and Power model digests, all six scenario-control values, and request count. BS-011 independently compares the Simple and Power model digest, preserves `treasuryShock`, and proves zero mode-switch requests.
- No `assumptionDigest` field or symbol exists in the production page, test, or Feature 003 contract. The required assumption-preservation behavior is proved by direct control-value equality; no standalone digest claim is made.
- `openFromSharedCache` waits for internal refresh settlement and rendered/runtime observed-digest agreement, then separately asserts public Ready. That setup does not replace the public lifecycle proof because the adversarial test crosses the unresolved boundary without the helper.
- Literal zero request routing is not claimed: the file contains three `page.route` controls. They modify only true external Treasury fixture/failure behavior; all other requests fall through. No application-owned route, internal business logic, or digest is mocked.

**Executed:** YES (in current session)

**Command:** selected-test authenticity scan plus canonical page/test diagnostics

**Exit Code:** `0`

**Claim Source:** executed

**Output:**

```text
BUG003_TEST_AUTHENTICITY_BEGIN
231:    await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
295:  await page.route('**/*', async (route) => {
336:  await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
route_scan_exit=0
skip_focus_todo_scan_exit=1
internal_mock_scan_exit=1
test_bailout_scan_exit=1
BUG003_TEST_AUTHENTICITY_END
OK page=bond-regime-lab.html inline=1 refs=71
bond_test_node_check_exit=0
```

### Boundary And Governance

**Executed:** YES (in current session)

**Command:** exact TP-01-09 command from `scopes.md`

**Exit Code:** `0`

**Claim Source:** executed

**Output:**

```text
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/design.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/report.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/scopes.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/state.json
af96efaddf1c4fce9b8e79f9ef988f5226081c0f08a375f85eb403a324a69111  bond-regime-lab.html
b010a103a2b65f820ba7106f5c73127d6cf3f1ec4495a8d1d7cad3a8908989ed  tests/bond-regime-lab.spec.mjs
```

The current commands also produced these governance results: artifact lint passed with three pre-existing deprecated-field advisories; freshness passed with 0 failures and 0 warnings; traceability passed with 0 warnings; G094 passed; editor diagnostics reported no errors for the page, test, report, and state; the page/test syntax diagnostics passed. The prior `BUG003-G028-ZERO-FILES-RESOLVED`, evidence-bridge, doctor, and observability findings were not reclassified or patched by this test invocation.

### Current Finding Disposition

| Finding ID | Current disposition | Owner |
| --- | --- | --- |
| `TR-BUG-003-TEST` | Pending: focused execution is green, but the requested acceptance outcome is blocked by the broader canary | `bubbles.test` after the planning route |
| `BUG003-INDEPENDENT-VERIFICATION` | Unresolved until every mandatory broader check is clean | Feature 004/harness workflow, then `bubbles.test` |
| `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY` | Reproduced: current `scripts/selftest.mjs` identity is 1 hunk against a different index/worktree, not the reviewed 7-hunk checkpoint | `bubbles.plan` for Feature 004 additive checkpoint |
| `BUG003-FOREIGN-F004-UNTRACKED-BOUNDARY` | Reproduced: `scripts/validate-brief-payload.mjs` is clean/tracked rather than `??` | `bubbles.plan` for Feature 004 additive checkpoint |
| `BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION` | Unresolved: current Playwright reports 76 passes while the direct Node canary exits 1 | Feature 004/harness workflow |
| `BUG003-G028-ZERO-FILES-RESOLVED` | Preserved unresolved | Bubbles framework/planning owner |
| `BUG003-EVIDENCE-BRIDGE-CROSS-SPEC-MATCH` | Preserved unresolved | Bubbles framework owner |
| `BUG003-ENV-DOCTOR-NONEXECUTABLE` | Preserved unresolved | Bubbles framework owner |
| `BUG003-ENV-DOCTOR-INSTALL-HOOK-DRIFT` | Preserved unresolved | Bubbles framework owner |
| `BUG003-ENV-DOCTOR-QUERY-TOOL-LOG-DRIFT` | Preserved unresolved | Bubbles framework owner |
| `BUG003-ENV-OBSERVABILITY-UNDECLARED` | Preserved unresolved | Repository governance owner |
| `BUG002-ACCEPTANCE-BLOCK` | Preserved unresolved; BUG-002 may not resume | `bubbles.test` after BUG-003 broader verification |
| `BUG002-INDEPENDENT-VERIFICATION` | Preserved unresolved | BUG-002 owner chain |
| `BUG002-BROAD-E2E-INSTABILITY` | Preserved unresolved | BUG-002 owner chain |
| `BUG002-REGRESSION-PHASE` | Preserved unresolved | BUG-002 owner chain |
| `BUG002-VALIDATE-CERTIFICATION` | Preserved unresolved | `bubbles.validate` |
| `BUG002-AUDIT-CERTIFICATION` | Preserved unresolved | `bubbles.audit` |
| `F006-FW-CHECK8-MJS-001` | Preserved unresolved | Existing Feature 006 owner |
| `F006-FW-G085-001` | Preserved unresolved | Existing Feature 006 owner |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Preserved unresolved | Existing Feature 006 owner |

**BUG-002 may resume:** NO. SCOPE-01 and BUG-003 remain `in_progress`; no certification or downstream state was changed.

## Independent Test Replay - Current Session

### Execution Boundary

**Phase:** test
**Claim Source:** executed and interpreted
**Workflow:** `bugfix-fastlane`, `executionModel: direct-authorized-runner`, parent `bubbles.goal`
**Source commit:** `943972e295b8fa93a19795e46015e5ae780b0350`

This phase read the current packet before execution and ran TP-01-02 through TP-01-09 from the repository root using the exact planned commands. It made no product, test, Feature 003/004/006/010, BUG-002 helper, package, Playwright-config, framework, staging, commit, reset, checkout, stash, clean, or certification change.

The preceding `Independent Test Verification - 2026-07-16` section and its state route landed concurrently while this replay was executing. This replay supplies a second current-session command chain; it does not supersede `TR-BUG-003-F004-PLAN`, the blocked acceptance verdict, or the planning-owned Feature 004 checkpoint route.

The pre-run anchor hashes were:

- `bond-regime-lab.html`: `af96efaddf1c4fce9b8e79f9ef988f5226081c0f08a375f85eb403a324a69111`
- `tests/bond-regime-lab.spec.mjs`: `b010a103a2b65f820ba7106f5c73127d6cf3f1ec4495a8d1d7cad3a8908989ed`

All pre-existing protected foreign hashes remained identical after execution. One new untracked concurrent Feature 010 file, `specs/010-company-fundamentals-and-brief-lab/spec-review.md`, appeared after the pre-run status snapshot. This phase did not create or modify it; its contents identify `bubbles.spec-review` and route five findings to Feature 010 `bubbles.implement`.

### Exact Independent Matrix

| Test Plan row | Category | Exact result | Verdict |
| --- | --- | --- | --- |
| TP-01-02 | e2e-ui adversarial | exit 0; 1 passed | PASS |
| TP-01-03 | protected e2e-ui | exit 0; 1 passed | PASS |
| TP-01-04 | focused e2e-ui file | exit 0; 27 passed | PASS |
| TP-01-05 | repository integration | exit 0; 505 passed, 0 failed | PASS |
| TP-01-06 | regression quality | exit 0; 0 violations, 0 warnings | PASS |
| TP-01-07 | dependency integrity | exit 0; actual graph PASS, 16 adversarial mutations rejected | PASS |
| TP-01-08 | complete system-Chrome e2e-ui | exit 0; 76 passed | PASS |
| TP-01-09 | containment | exit 0; both anchors unchanged and no staged BUG-003 change | PASS |

### TP-01-02 And TP-01-03 Exact Titles

**Executed:** YES (in current session)
**Commands:**

```text
npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison" --reporter=list
npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "BS-011 Simple and Power share one model digest" --reporter=list
```

**Exit Codes:** `0`, `0`
**Claim Source:** executed
**Output:**

```text
Running 1 test using 1 worker

  ✓  1 …Ready waits for auto-hydration before Simple and Power comparison (1.7s)

  1 passed (5.6s)

Running 1 test using 1 worker

  ✓  1 ….spec.mjs:375:1 › BS-011 Simple and Power share one model digest (570ms)

  1 passed (1.6s)
```

**Result:** PASS. The held external Treasury boundary regression and exact protected BS-011 title both passed without a test edit.

### TP-01-04 Complete Bond Regime File

**Executed:** YES (in current session)
**Command:** `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** `0`
**Claim Source:** executed
**Output:** final 14 lines from the complete unfiltered runner output

```text
  ✓  16 … restricted endpoint or raw observation persistence path exists (458ms)
  ✓  17 …ady waits for auto-hydration before Simple and Power comparison (561ms)
  ✓  18 …spec.mjs:375:1 › BS-011 Simple and Power share one model digest (506ms)
  ✓  19 …-012 lever change recomputes without fetch or observed mutation (330ms)
  ✓  20 …mjs:406:1 › BS-014 partial data is keyboard and text equivalent (415ms)
  ✓  21 …Regime tool publishes one owner read without restricted payload (381ms)
  ✓  22 … nonblank synchronous and text equivalent on desktop and mobile (707ms)
  ✓  23 …stale error and large-shock layouts contain text without overlap (2.0s)
  ✓  24 …r ratio window sleeve focus and restored preferences stay local (332ms)
  ✓  25 …xpose return risk drawdown and trend when history is sufficient (246ms)
  ✓  26 …nfig cache and reachable public sources without uncaught errors (213ms)
  ✓  27 …andmarks names focus and noncolor states at 390 and 1440 widths (352ms)

  27 passed (1.8m)
```

**Result:** PASS. Every Bond Regime browser scenario passed with zero required skip.

### TP-01-05 Repository Selftest

**Executed:** YES (in current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** `0`
**Claim Source:** executed
**Output:** final 12 lines from the complete captured output

```text
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 source-qualified SEC extract binds to SourceArtifact content identity
  ✓ Feature 010 complete publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 material claim resolves source transformation consumer rights and unavailable-link lineage
  ✓ Feature 010 direct route loads only same-origin scripts and exposes no credential field
  ✓ Feature 010 validator executes production config graph projection and trace functions

================================================
Research-Lab self-test: 505 passed, 0 failed
================================================
```

**Result:** PASS. The count increased from the earlier implementation-owned `497/0` because concurrent Feature 010 selftests are present on current disk; this phase did not edit them.

### TP-01-06 Regression Quality

**Executed:** YES (in current session)
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/bond-regime-lab.spec.mjs`
**Exit Code:** `0`
**Claim Source:** executed
**Output:**

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-16T23:31:28Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/bond-regime-lab.spec.mjs
✅ Adversarial signal detected in tests/bond-regime-lab.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

**Result:** PASS. The bugfix regression remains adversarial and the guard found no bailout, skip, selective-only, or quality violation.

### TP-01-07 Node Source Lock

**Executed:** YES (in current session)
**Command:** `node scripts/validate-node-source-lock.mjs`
**Exit Code:** `0`
**Claim Source:** executed
**Output:**

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=manifest-wrong-version result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=lifecycle-relaxation result=REJECTED code=NPMRC-IGNORE-SCRIPTS
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

**Result:** PASS. The actual source-locked graph passed and all 16 adversarial mutations were rejected.

### TP-01-08 Complete System-Chrome Inventory

**Executed:** YES (in current session)
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** `0`
**Claim Source:** executed
**Output:** final 15 lines from the complete captured output

```text
  ✓  63 …c.mjs:275:1 › BS-013 restricted observation remains memory only (226ms)
  ✓  64 …rst refresh preserves successful families when one source fails (224ms)
  ✓  65 … restricted endpoint or raw observation persistence path exists (199ms)
  ✓  66 …ady waits for auto-hydration before Simple and Power comparison (254ms)
  ✓  67 …spec.mjs:375:1 › BS-011 Simple and Power share one model digest (530ms)
  ✓  68 …-012 lever change recomputes without fetch or observed mutation (281ms)
  ✓  69 …mjs:406:1 › BS-014 partial data is keyboard and text equivalent (251ms)
  ✓  70 …Regime tool publishes one owner read without restricted payload (237ms)
  ✓  71 … nonblank synchronous and text equivalent on desktop and mobile (449ms)
  ✓  72 …stale error and large-shock layouts contain text without overlap (1.7s)
  ✓  73 …r ratio window sleeve focus and restored preferences stay local (342ms)
  ✓  74 …xpose return risk drawdown and trend when history is sufficient (250ms)
  ✓  75 …nfig cache and reachable public sources without uncaught errors (200ms)
  ✓  76 …andmarks names focus and noncolor states at 390 and 1440 widths (406ms)

  76 passed (24.7s)
```

**Result:** PASS. The complete current system-Chrome browser inventory passed. The full output contained no browser-test failure, skip, worker crash, teardown failure, or process-lifecycle error. It also did not execute or emit the Feature 004 Node collision canary, so this successful Playwright exit is not evidence that the foreign Node assumptions are green.

### TP-01-09 Change Boundary

**Executed:** YES (in current session)
**Command:** `git status --short --untracked-files=all -- bond-regime-lab.html tests/bond-regime-lab.spec.mjs specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence && shasum -a 256 bond-regime-lab.html tests/bond-regime-lab.spec.mjs`
**Exit Code:** `0`
**Claim Source:** executed and interpreted
**Interpretation:** The two anchors were absent from status and retained their exact pre-run hashes. Only pre-existing BUG-003 artifact changes were listed. A separate full-status/hash comparison returned exit 0, every pre-existing protected foreign hash matched its baseline, both anchors matched `HEAD`, and no BUG-003 path was staged.
**Output:**

```text
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/design.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/report.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/scopes.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/state.json
af96efaddf1c4fce9b8e79f9ef988f5226081c0f08a375f85eb403a324a69111  bond-regime-lab.html
b010a103a2b65f820ba7106f5c73127d6cf3f1ec4495a8d1d7cad3a8908989ed  tests/bond-regime-lab.spec.mjs
BUG003_POST_FULL_STATUS_EXIT=0
BUG003_POST_FOREIGN_HASH_EXIT=0
BUG003_POST_ANCHOR_DIFF_EXIT=0
BUG003_POST_CACHED_DIFF_EXIT=0
BUG003_TEST_POST_EXECUTION_CONTAINMENT_END
```

**Result:** PASS for this phase's containment. No excluded byte was changed by `bubbles.test`. The concurrently added Feature 010 `spec-review.md` prevents an absolute claim that the global worktree itself remained static while commands ran.

### Foreign Feature 004 Collision Findings

**Executed:** YES (in current session)
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Code:** `1`
**Claim Source:** executed
**Output:** relevant current failure window

```text
✖ Feature 004 preserves every pre-existing dirty hunk (66.289667ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (68.553708ms)
✖ Feature 004 preserves the untracked validator prefix and volatile config boundary (13.446083ms)
ℹ tests 3
ℹ suites 0
ℹ pass 1
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 214.708666

AssertionError [ERR_ASSERTION]: scripts/selftest.mjs complete current identity matches the reviewed disposition
actual status=' M' hunkCount=1 worktreeSha256='0dfd5dc6178ea29e5317a60f30656932240dc6051db7e0c3738b2987371645f3'
expected status=' M' hunkCount=7 worktreeSha256='f47e86bc746eddad82892844aacde100ff8f82d6e29e4d0a4df6a68ed0bb53c8'

AssertionError [ERR_ASSERTION]: scripts/validate-brief-payload.mjs remains untracked and unstaged
actual='' expected='??'
```

**Result:** FAIL on two foreign Feature 004 assertions. These are ordinary deterministic assertion failures, not worker, teardown, timeout, signal, or process-lifecycle errors. BUG-003's current route assigns the required additive Feature 004 identity checkpoint to `bubbles.plan`; Feature 004's test-owned parser is rerun only after that planning reconciliation. This replay records the failures without changing the foreign target.

### Independent Finding Accounting

| Finding ID | Current disposition | Actual owner |
| --- | --- | --- |
| `BUG003-INDEPENDENT-VERIFICATION` | Unresolved: exact TP-01-02 through TP-01-09 are green, but the mandatory direct Feature 004 canary remains red | Feature 004 `bubbles.plan`, then `bubbles.test` |
| `TR-BUG-003-TEST` | Pending: the independent matrix executed, but required child findings remain unresolved | `bubbles.test` after the planning route |
| `BUG002-ACCEPTANCE-BLOCK` | Unresolved: the mandatory direct Feature 004 canary is red, so BUG-002 may not resume | BUG-003 route after Feature 004 planning/test reconciliation |
| `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY` | Unresolved: current `scripts/selftest.mjs` identity is one hunk, not the reviewed seven-hunk identity | Feature 004 `bubbles.plan` additive checkpoint |
| `BUG003-FOREIGN-F004-UNTRACKED-BOUNDARY` | Unresolved: `scripts/validate-brief-payload.mjs` is tracked/clean rather than expected untracked | Feature 004 `bubbles.plan` additive checkpoint |
| `BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION` | Unresolved: current TP-01-08 did not run the Node canary; its exit 0 cannot propagate a test it did not execute | Feature 004/harness owning workflow |
| `BUG003-G028-ZERO-FILES-RESOLVED` | Unchanged and unresolved; no framework file was modified | Bubbles framework/planning owner |
| `BUG003-EVIDENCE-BRIDGE-CROSS-SPEC-MATCH` | Unchanged and unresolved; no framework file was modified | Bubbles framework owner |
| `BUG003-ENV-DOCTOR-NONEXECUTABLE` | Unchanged and unresolved | Bubbles framework owner |
| `BUG003-ENV-DOCTOR-INSTALL-HOOK-DRIFT` | Unchanged and unresolved | Bubbles framework owner |
| `BUG003-ENV-DOCTOR-QUERY-TOOL-LOG-DRIFT` | Unchanged and unresolved | Bubbles framework owner |
| `BUG003-ENV-OBSERVABILITY-UNDECLARED` | Unchanged and unresolved | Repository governance owner |
| `BUG002-INDEPENDENT-VERIFICATION` | Unchanged and blocked from resuming | BUG-002 `bubbles.test` after BUG-003 acceptance |
| `BUG002-BROAD-E2E-INSTABILITY` | Unchanged | BUG-002 `bubbles.test` |
| `BUG002-REGRESSION-PHASE` | Unchanged | BUG-002 regression owner |
| `BUG002-VALIDATE-CERTIFICATION` | Unchanged | `bubbles.validate` |
| `BUG002-AUDIT-CERTIFICATION` | Unchanged | `bubbles.audit` |
| `F006-FW-CHECK8-MJS-001` | Unchanged | Bubbles framework owner |
| `F006-FW-G085-001` | Unchanged | Bubbles framework owner |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Unchanged | Feature 006 owning workflow |

### Test Verdict

The eight planned TP-01-02 through TP-01-09 commands are green and no required browser test was skipped, but the overall independent verdict is **NOT_TESTED** because the mandatory direct Feature 004 canary failed two assertions. No terminal scope/spec status or certification is claimed. The invocation remains `route_required` to `bubbles.plan`, and BUG-002 independent acceptance may not resume.

### Test Integrity Audits

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** Source inspection classified all three Playwright route hooks against the packet's external-boundary rule, while the executed regression-quality guard and current browser results establish the behavior and skip outcomes.

- **Mock audit:** one selected E2E file scanned; three `page.route` sites found. Two fulfill only `home.treasury.gov` nominal/real Treasury CSV boundaries. The wildcard hook aborts only `daily_treasury_real_yield_curve` and calls `route.fallback()` for every other request. No internal application request, renderer, model, status, digest, or persistence path is mocked. Classification remains `e2e-ui`.
- **Skip-marker audit:** zero `t.Skip`, `.skip(`, `xit(`, `xdescribe(`, `.only(`, `test.todo`, `it.todo`, or `pending(` matches in `tests/bond-regime-lab.spec.mjs`; executed Playwright summaries reported no skipped required test.
- **Regression-quality audit:** one file scanned, one adversarial signal, zero violations, zero warnings.
- **Self-validating audit:** the held-boundary regression reads both digests from the production DOM, asserts format and cross-mode equality rather than an injected expected digest, compares production control state before/after the switch, and counts observed browser requests. Replacing production logic with an identity or hard-coded return would not satisfy its lifecycle, digest, assumption, and request assertions. No self-validating required test was found.
- **Scenario mapping:** `SCN-BUG003-001` maps to the exact held-boundary title and `SCN-003-011` maps to the exact protected BS-011 title; both titles passed independently and inside the complete Bond file/inventory.
- **Trace/SLO audit:** `.github/bubbles-project.yaml` declares neither `testImpact` nor `traceContracts`, and the Test Plan declares no `observabilityWorkflow`; impact planning and trace/SLO capture are clean no-ops for this static-browser scope.

### Final Concurrent-Worktree Reconciliation

**Phase:** test
**Claim Source:** executed and interpreted
**Interpretation:** The final status/hash check ran after all evidence writes. It proves BUG-003 anchor containment and no staging by this phase; it also distinguishes later foreign concurrent edits from this agent's own report-only write.

**Executed:** YES (in current session)
**Commands:** full `git status --short --untracked-files=all`; SHA-256 over both BUG-003 anchors and every observed Feature 010/BUG-002-helper/planning-owned protected file; `git diff --quiet HEAD -- bond-regime-lab.html tests/bond-regime-lab.spec.mjs`; path-scoped cached diff; `git diff --check` over BUG-003 report/state.
**Exit Codes:** `0`, `0`, `0`, `0`, `0`
**Output window:**

```text
 M specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
 M specs/_bugs/BUG-002-market-brief-session-date-drift/state.json
?? specs/010-company-fundamentals-and-brief-lab/spec-review.md
af96efaddf1c4fce9b8e79f9ef988f5226081c0f08a375f85eb403a324a69111  bond-regime-lab.html
b010a103a2b65f820ba7106f5c73127d6cf3f1ec4495a8d1d7cad3a8908989ed  tests/bond-regime-lab.spec.mjs
BUG003_FINAL_HASH_EXIT=0
BUG003_FINAL_ANCHOR_DIFF_EXIT=0
BUG003_FINAL_CACHED_DIFF_EXIT=0
BUG003_FINAL_DIFF_CHECK_EXIT=0
BUG003_FINAL_CONTAINMENT_END
```

Between the pre-run baseline and final snapshot, concurrent Feature 010 work changed its state, `rlcompany.js`, unit/browser tests, and foundation publication fixture, and created `spec-review.md`; BUG-002 report/state also became modified. This phase did not write those paths. `playwright.config.mjs`, `scripts/selftest.mjs`, `tests/brief-refresh-atomicity.support.mjs`, the company page/config/validator/SEC extract, BUG-003 `design.md`/`scopes.md`, and both BUG-003 anchors retained their captured hashes. No path was staged.

## Independent Test Verification Final Disposition - 2026-07-16T23:34:47Z

**Phase:** test

**Claim Source:** executed and interpreted

**Interpretation:** This final disposition confirms the immediately preceding concurrent replay: the current direct Feature 004 canary is a mandatory broader check under the operator's explicit contract and exits 1, so BUG-002 remains blocked. The complete evidence and command matrix are recorded in [Independent Test Verification - 2026-07-16](#independent-test-verification---2026-07-16).

```text
✖ Feature 004 preserves every pre-existing dirty hunk (52.846ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (86.382583ms)
✖ Feature 004 preserves the untracked validator prefix and volatile config boundary (15.536167ms)
ℹ tests 3
ℹ suites 0
ℹ pass 1
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 209.122708
```

**Final verdict:** focused BUG-003 repair independently green; BUG-003/SCOPE-01 not complete; BUG-002 may resume: **NO**. The immediate owner is `bubbles.plan` for the Feature 004 additive dirty-tree checkpoint, followed by Feature 004 `bubbles.test` and a fresh BUG-003 broader verification.

## Current Invocation Evidence Delta - 2026-07-16T23:37:06Z

**Phase:** test
**Claim Source:** executed and interpreted
**Source commit:** `943972e295b8fa93a19795e46015e5ae780b0350`

This invocation independently executed TP-01-02 through TP-01-09 in the declared order. Its exact results agree with the blocked concurrent disposition but have distinct runner timings: TP-01-02 `1 passed (1.0s)`, TP-01-03 `1 passed (1.3s)`, TP-01-04 `27 passed (17.2s)`, TP-01-05 `505 passed, 0 failed`, TP-01-06 zero violations/warnings, TP-01-07 actual source graph PASS with 16 adversarial rejections, TP-01-08 `76 passed (1.8m)`, and TP-01-09 retained both committed anchor hashes.

```text
Running 1 test using 1 worker
  ✓  1 …eady waits for auto-hydration before Simple and Power comparison (393ms)
  1 passed (1.0s)
Running 1 test using 1 worker
  ✓  1 ….spec.mjs:375:1 › BS-011 Simple and Power share one model digest (464ms)
  1 passed (1.3s)
  ✓  27 …andmarks names focus and noncolor states at 390 and 1440 widths (363ms)
  27 passed (17.2s)
Research-Lab self-test: 505 passed, 0 failed
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
  ✓  66 …ady waits for auto-hydration before Simple and Power comparison (512ms)
  ✓  67 …spec.mjs:375:1 › BS-011 Simple and Power share one model digest (323ms)
  76 passed (1.8m)
```

The direct current Feature 004 reproduction remained `1 passed, 2 failed` with `scripts/selftest.mjs` observed as one dirty hunk and `scripts/validate-brief-payload.mjs` observed as tracked/clean. No worker, teardown, timeout, signal, or non-test process error occurred.

### Missing Collection-Boundary Finding

**Executed:** YES (in current session)
**Command:** `git --no-pager diff -- playwright.config.mjs`
**Exit Code:** `0`
**Claim Source:** executed and interpreted
**Interpretation:** The exact TP-01-08 command emitted zero nested Node results because current config narrows discovery to browser specs. The direct failing Node canary remains authoritative under `requireNoPreexistingFailingTests: true`.

```text
diff --git a/playwright.config.mjs b/playwright.config.mjs
index a73ccde..1519a2c 100644
--- a/playwright.config.mjs
+++ b/playwright.config.mjs
@@ -1,6 +1,7 @@
 import { defineConfig } from 'playwright/test';

 export default defineConfig({
+  testMatch: '**/*.spec.mjs',
   projects: [
```

Feature 010's current `spec-review.md` already classifies this exact out-of-bound global discovery hunk as blocking `SR010-005`, owner Feature 010 `bubbles.implement`. This invocation did not modify that config or packet.

### Missing Plan And DoD Parity Finding

**Claim Source:** interpreted
**Interpretation:** The Markdown and JSON Test Plans both enumerate TP-01-01 through TP-01-09, and artifact lint/freshness/traceability pass. Literal one-row-to-one-test-DoD parity is still absent: nine TP rows map to ten test-related DoD bullets; TP-01-05 through TP-01-07 share one bullet, while focused E2E and independent verification repeat TP-01-02/03 responsibilities. The planning-owned finding is `BUG003-PLAN-DOD-PARITY`, owner `bubbles.plan`.

```text
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
RESULT: PASSED (0 warnings)
Scope 1: SCOPE-01 Stable Bond Regime Ready Boundary summary: scenarios=1 test_rows=10
DoD fidelity: 1 scenarios checked, 1 mapped to DoD, 0 unmapped
plan_dod_mapping_scan_exit=0
skip_marker_scan_exit=1
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
bug003_anchor_diff_exit=0
bug003_cached_packet_diff_exit=0
```

**Reconciled disposition:** `TR-BUG-003-TEST` remains pending because required child findings are not clean. `TR-BUG-003-F004-PLAN` is also pending for the two Feature 004 identities and `BUG003-PLAN-DOD-PARITY`; `SR010-005` remains separately owned by Feature 010 `bubbles.implement`.

## Planning Reconciliation - 2026-07-17T00:03:35Z

**Phase:** plan
**Claim Source:** executed and interpreted
**Interpretation:** The preceding parity and two-identity disposition remains historical test evidence. Current planning closes only the literal parity finding and the validator tracking transition. The current selftest hunk is marker-attributable to Feature 010, but Feature 010 Scope 01 remains active and finding-bearing, so those bytes are not accepted as a settled Feature 004 identity.

### Literal Test Plan And DoD Bijection

`scopes.md` now contains exactly one `DOD-TP-*` checkbox for each `test-plan.json` row. Seven mapped items retain their checked evidence truth and TP-01-08/09 remain unchecked with their existing uncertainty declarations. The generic focused-E2E and independent-test duplicates were absorbed into their owning rows; TP-01-05/06/07 are independently mapped.

```text
TP-01-01=DOD-TP-01-01
TP-01-02=DOD-TP-01-02
TP-01-03=DOD-TP-01-03
TP-01-04=DOD-TP-01-04
TP-01-05=DOD-TP-01-05
TP-01-06=DOD-TP-01-06
TP-01-07=DOD-TP-01-07
TP-01-08=DOD-TP-01-08
TP-01-09=DOD-TP-01-09
jsonParse=PASS
testRows=PASS
uniqueTestIds=PASS
uniqueDodIds=PASS
markdownMappings=PASS
literalBijection=PASS
```

### Feature 004 Transition Disposition

- `BUG003-FOREIGN-F004-UNTRACKED-BOUNDARY` is addressed by `feature004-dirty-validator-tracked-v1`. Commit `b11d9f0e41aeb74dc2825a99b7a2d086003dbab6` added `scripts/validate-brief-payload.mjs`; its current index, `HEAD`, and worktree Git OID are all `7bd6639ce774a6b2a04f5cebf5254684a9f3ba28`, its SHA-256 remains `78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f`, its status is empty, and its diff from the add commit exits 0.
- `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY` remains unresolved. The current `scripts/selftest.mjs` diff is one hunk inside `FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION`; Feature 010 state names `bubbles.implement` as active owner and its spec review keeps five findings unresolved. The concurrent two-path checkpoint is preserved as immutable superseded planning history; no selftest successor identity is accepted.
- The unchanged direct canary exited 1 with 3 tests, 1 pass, 2 failures, and 0 skips. Its failures are the unaccepted selftest identity and the not-yet-consumed validator status transition. This is expected pre-parser red, not a test-phase pass.

### Current Route

`TR-BUG-003-F004-PLAN` and `TR-BUG-003-TEST` both remain pending. BUG-003 and SCOPE-01 remain `in_progress`, certification remains unchanged, and BUG-002 may not resume. The next required owner is Feature 010 SCOPE-01 `bubbles.implement`; after owner-settled selftest evidence returns, Feature 004 `bubbles.plan` records a separate additive checkpoint and `bubbles.test` owns parser changes plus the direct-canary and BUG-003 acceptance replays.

## Planning Reconciliation Superseding Disposition - 2026-07-17T00:05:41Z

This planning record supersedes only the route stated in the immediately preceding concurrent planning section. It changes no execution evidence, checkbox truth, product/test byte, terminal status, completed phase claim, or certification field.

- `BUG003-PLAN-DOD-PARITY` is planning-addressed: [scopes.md](scopes.md#test-evidence-parity-index---exactly-nine-rows) and `test-plan.json::dodParity` map TP-01-01 through TP-01-09 bijectively to DOD-TP-01-01 through DOD-TP-01-09 and explicit report destinations. Seven checked and two unchecked states remain unchanged.
- `BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY` is planning-addressed by the authoritative Feature 004 `feature004-dirty-collision-script-transitions-v1` block. It records the current Feature 010 hunk under exact identity, marker bounds, active owner, all five open `SR010-*` findings, and false completion claims. Any later byte drift fails closed.
- `BUG003-FOREIGN-F004-UNTRACKED-BOUNDARY` is planning-addressed in the same successor: the historical 137-line validator bytes are proven byte-identical to the path added by commit `b11d9f0e41aeb74dc2825a99b7a2d086003dbab6` and to the current clean index/worktree.
- The same Feature 004 block freezes all 13 inherited checkpoint paths with status, staging, HEAD/index/worktree Git OIDs, SHA-256, hunk inventory, and last-commit provenance. The later validator-only proposal is explicitly non-authoritative.
- `TR-BUG-003-F004-PLAN` is resolved. `TR-BUG-003-TEST` remains pending. The next owner is `bubbles.test` for strict successor parsing, the direct Feature 004 canary, and a fresh BUG-003 independent replay.
- `BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION` and `BUG003-INDEPENDENT-VERIFICATION` remain unresolved. A green Playwright browser exit does not prove or replace the direct Node canary. BUG-002 may not resume.

## Fresh Independent Acceptance Replay - 2026-07-17T02:27:26Z

This section is the current `bubbles.test` acceptance replay after Feature 004's owner-settled parser became green. It supersedes only earlier blocked replay verdicts. BUG-003 remains `in_progress`, its scope remains nonterminal, all planning-owned DoD checkbox states remain unchanged, and certification is untouched. No product, Bond test, Feature 003/004/006/010, BUG-002, package, Playwright config, framework-managed, staging, commit, reset, checkout, stash, or cleanup byte changed.

### Exact Test Matrix

| Test Plan row | Exact command result | Skipped |
| --- | --- | ---: |
| TP-01-02 | exit 0; adversarial lifecycle title 1 passed | 0 |
| TP-01-03 | exit 0; protected BS-011 title 1 passed | 0 |
| TP-01-04 | exit 0; complete Bond file 27 passed | 0 |
| TP-01-05 | exit 0; repository selftest 508 passed, 0 failed | 0 |
| TP-01-06 | exit 0; one adversarial signal, 0 violations, 0 warnings | 0 |
| TP-01-07 | exit 0; actual graph PASS, 16 adversarial source mutations rejected | 0 |
| TP-01-08 | exit 0; Feature 004 Node prelude 3 passed, system-Chrome inventory 76 passed | 0 |
| TP-01-09 | exit 0; both production/test anchors unchanged | N/A |

### Focused Lifecycle And Protected Parity

**Phase:** test
**Claim Source:** executed
**Commands:** exact TP-01-02 and TP-01-03 commands from the current Test Plan
**Exit Codes:** 0, 0
**Output:**

```text
Running 1 test using 1 worker

  ✓  1 …eady waits for auto-hydration before Simple and Power comparison (732ms)

  1 passed (2.1s)

Running 1 test using 1 worker

  ✓  1 ….spec.mjs:375:1 › BS-011 Simple and Power share one model digest (531ms)

  1 passed (1.6s)
```

**Result:** PASS. The held true-external Treasury boundary remains adversarial, and the exact protected mode-switch contract remains unchanged.

### Complete Bond File

**Phase:** test
**Claim Source:** executed
**Command:** `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Output window:** final 15 lines from the complete unfiltered 27-test capture.

```text
  ✓  16 … restricted endpoint or raw observation persistence path exists (251ms)
  ✓  17 …ady waits for auto-hydration before Simple and Power comparison (313ms)
  ✓  18 …spec.mjs:375:1 › BS-011 Simple and Power share one model digest (352ms)
  ✓  19 …-012 lever change recomputes without fetch or observed mutation (198ms)
  ✓  20 …mjs:406:1 › BS-014 partial data is keyboard and text equivalent (208ms)
  ✓  21 …Regime tool publishes one owner read without restricted payload (188ms)
  ✓  22 … nonblank synchronous and text equivalent on desktop and mobile (361ms)
  ✓  23 …stale error and large-shock layouts contain text without overlap (1.4s)
  ✓  24 …r ratio window sleeve focus and restored preferences stay local (284ms)
  ✓  25 …xpose return risk drawdown and trend when history is sufficient (225ms)
  ✓  26 …nfig cache and reachable public sources without uncaught errors (178ms)
  ✓  27 …andmarks names focus and noncolor states at 390 and 1440 widths (344ms)

  27 passed (14.1s)
```

### Repository Selftest

**Phase:** test
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output window:** final Feature 010 group and aggregate from the complete unfiltered capture.

```text
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 current pointer selects the content-addressed production manifest
  ✓ Feature 010 retained SEC payload is byte-hash coherent and passes production parsing
  ✓ Feature 010 SourceArtifact binds the exact retained response bytes
  ✓ Feature 010 materialized publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 accepted identity and period derive from production-normalized source bytes
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  ✓ Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  ✓ Feature 010 validator executes exact-capture parsing config graph projection and trace functions

================================================
Research-Lab self-test: 508 passed, 0 failed
================================================
```

### Quality And Source Lock

**Phase:** test
**Claim Source:** executed
**Commands:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/bond-regime-lab.spec.mjs`; `node scripts/validate-node-source-lock.mjs`
**Exit Codes:** 0, 0
**Output:**

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-17T02:25:11Z
  Bugfix mode: true
============================================================
ℹ️  Scanning tests/bond-regime-lab.spec.mjs
✅ Adversarial signal detected in tests/bond-regime-lab.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

### Complete System-Chrome Inventory

**Phase:** test
**Claim Source:** executed
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Output windows:** Feature 004 collection prelude and final 15 lines from the complete unfiltered capture.

```text
✔ Feature 004 preserves every pre-existing dirty hunk (634.410209ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (689.6385ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (127.831ms)

Running 76 tests using 6 workers

  ✓  64 …rst refresh preserves successful families when one source fails (210ms)
  ✓  65 … restricted endpoint or raw observation persistence path exists (197ms)
  ✓  66 …ady waits for auto-hydration before Simple and Power comparison (257ms)
  ✓  67 …spec.mjs:375:1 › BS-011 Simple and Power share one model digest (250ms)
  ✓  68 …-012 lever change recomputes without fetch or observed mutation (192ms)
  ✓  69 …mjs:406:1 › BS-014 partial data is keyboard and text equivalent (213ms)
  ✓  70 …Regime tool publishes one owner read without restricted payload (176ms)
  ✓  71 … nonblank synchronous and text equivalent on desktop and mobile (328ms)
  ✓  72 …stale error and large-shock layouts contain text without overlap (1.3s)
  ✓  73 …r ratio window sleeve focus and restored preferences stay local (308ms)
  ✓  74 …xpose return risk drawdown and trend when history is sufficient (223ms)
  ✓  75 …nfig cache and reachable public sources without uncaught errors (181ms)
  ✓  76 …andmarks names focus and noncolor states at 390 and 1440 widths (363ms)

  76 passed (19.6s)
```

**Result:** PASS. The formerly separate Node gate is both independently green and visible as a 3/3 collection prelude; the browser inventory is 76/76 with natural completion.

### Unchanged-Byte Boundary

**Phase:** test
**Claim Source:** executed
**Command:** `git status --short --untracked-files=all -- bond-regime-lab.html tests/bond-regime-lab.spec.mjs specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence && shasum -a 256 bond-regime-lab.html tests/bond-regime-lab.spec.mjs`
**Exit Code:** 0
**Output:**

```text
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/design.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/report.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/scopes.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/state.json
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/test-plan.json
af96efaddf1c4fce9b8e79f9ef988f5226081c0f08a375f85eb403a324a69111  bond-regime-lab.html
b010a103a2b65f820ba7106f5c73127d6cf3f1ec4495a8d1d7cad3a8908989ed  tests/bond-regime-lab.spec.mjs
```

The pre-replay command produced the same two anchor hashes and the same five pre-existing BUG-003 artifact statuses. No anchor or excluded product/test path changed.

### Current Test Integrity Audits

**Claim Source:** interpreted
**Interpretation:** The exact runs above prove behavior. Source classification confirms the three Bond route hooks control only the true external Treasury boundary and fall through for application-owned requests; no digest or success value is injected. The lifecycle test reads production status, refresh state, digest, assumptions, and request counts, so replacing production logic with a pass-through or hard-coded result would fail. The modified collision canary reads immutable report blocks, current Git object/status/diff data, current Feature 010 state/report provenance, and current file bytes; its malformed-record matrix rejects unknown, missing, duplicate, reordered, owner-drifted, marker-drifted, completion-inferred, and identity-drifted inputs.

The raw Bond regression-quality output is recorded under [Quality And Source Lock](#quality-and-source-lock). The collision guard and exact zero-match command/output are recorded under [Feature 004 Test Phase Owner-Settled Successor Acceptance](../../004-fx-regime-relative-value-lab/report.md#test-phase-owner-settled-successor-acceptance---2026-07-17t022726z). The literal zero-match output was:

```text
COLLISION_TEST_INTEGRITY_BEGIN
skipOnlyTodoMatches=0
mockOrInterceptionMatches=0
silentBailoutMatches=0
gitDiffCheckExit=0
auditFailures=0
COLLISION_TEST_INTEGRITY_END
```

### Fresh Finding Accounting And Route

| Finding | Current disposition |
| --- | --- |
| `F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-002` | Addressed by the strict persistent parser and direct 3/3 canary. |
| `BUG003-INDEPENDENT-VERIFICATION` | Addressed by the exact TP-01-02 through TP-01-09 current-session replay. |
| `BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION` | Addressed for acceptance by the independently blocking direct Node command plus its green 3/3 appearance in the TP-01-08 prelude. No browser exit is used as a substitute for the direct command. |
| `TR-BUG-003-TEST` | Resolved. The test-owned chain is green and routes to the registered BUG-002 SCOPE-01 `bubbles.test` acceptance owner. |
| `BUG002-ACCEPTANCE-BLOCK` | Addressed only as a BUG-003 blocker removal. No BUG-002 test, status, validation, audit, or certification claim is made here. |
| `BUG003-G028-ZERO-FILES-RESOLVED` | Preserved unresolved for the Bubbles framework/planning owner; no framework-managed file was edited. |
| `BUG003-EVIDENCE-BRIDGE-CROSS-SPEC-MATCH` | Preserved unresolved for the Bubbles framework owner. |
| `BUG003-ENV-DOCTOR-NONEXECUTABLE` | Preserved unresolved for the Bubbles framework owner. |
| `BUG003-ENV-DOCTOR-INSTALL-HOOK-DRIFT` | Preserved unresolved for the Bubbles framework owner. |
| `BUG003-ENV-DOCTOR-QUERY-TOOL-LOG-DRIFT` | Preserved unresolved for the Bubbles framework owner. |
| `BUG003-ENV-OBSERVABILITY-UNDECLARED` | Preserved unresolved for the repository governance owner. |
| BUG-003 scope/status/certification | Remains `in_progress` and uncertified; no Done, validated, or completed-scope inference is made. |
