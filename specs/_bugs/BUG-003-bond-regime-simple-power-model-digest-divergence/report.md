# Report: BUG-003 Bond Regime Simple/Power Model-Digest Divergence

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Summary

- Preserved the independent `bubbles.test` finding: complete system Chrome reported 72 passed/1 failed and isolated BS-011 reported 0 passed/1 failed, with Simple `8a020d8b` versus Power `40108ba6`.
- Executed the exact protected isolated command eight times against unchanged current bytes: two standalone and six concurrently scheduled. All passed after hydration settled, establishing timing sensitivity rather than deterministic absence.
- Executed the complete Bond Regime file against unchanged current bytes; all 26 tests passed, also before repair.
- Traced both exact digest values through a twelve-page real-browser mutation timeline. Every page moved from `8a020d8b` to `40108ba6` through the same `runtime.viewModel` and Simple node while Ready appeared during active refresh.
- Ruled out stale DOM projection, duplicate digest assignment, mode-triggered view-model mutation, and a separate Power compute path as controlling causes.
- Created a complete nine-artifact planning packet only. No implementation, test edit, validation, audit, certification, BUG-002 mutation, or parent-feature mutation is claimed.

## Completion Statement

BUG-003 remains In Progress. Root cause and one implementation-ready scope are complete. The production lifecycle repair, deterministic adversarial RED/GREEN, independent verification, BUG-002 resume, and Feature 006 replay have not been performed. The next required owner is `bubbles.implement`.

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

**Phase:** validate  
**Claim Source:** not-run  
**Reason:** No production or test byte was changed by this invocation, so after-fix evidence does not exist.

> **Uncertainty Declaration**
> **What was attempted:** Exact current replays, complete Bond replay, source-path tracing, dynamic mutation tracing, hash/status baseline, and packet planning.
> **What was observed:** The lifecycle still emits both digests and exposes Ready during active refresh; current exact runs may pass after settlement.
> **Why this is uncertain:** There is no implementation, deterministic RED/GREEN, independent post-repair test, or certification evidence.
> **What would resolve this:** Execute every TP-01 row in scopes.md through the assigned implementation and independent test owners.

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

## Finding Accounting

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

## Invocation Audit

No orchestrator or subagent was invoked. The user explicitly required the `bubbles.goal` direct-authorized runner context and prohibited nested dispatch. All source/test inspection, reproduction attempts, root-cause diagnostics, and packet authoring occurred within this `bubbles.bug` invocation.
