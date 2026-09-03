# Report: BUG-023 Options Flow Ready Clock Drift

## Summary

`F031-BROAD-OPTIONS-FLOW-001` was the clock-contract defect behind three
repository selftest failures. The bounded repair and current production-path
replay now preserve the ready and stale boundaries. Planning remains open for
receipt-derived scenario state, shared-harness canary and restore proof, and the
scenario-specific and broader repository E2E obligations.

## Completion Statement

BUG-023 remains `in_progress`. The clock repair and prior independent test
evidence are present, but this planning invocation does not certify them or
pre-check the new plan obligations. Feature 031 remains downstream of this bug.
BUG-017, BUG-024, and the Feature 031 digest finding retain independent owners.
Certification and human acceptance remain unchanged.

## Success Signal Evidence Map

The declared **Success Signal** is defined in [the Outcome Contract](spec.md#outcome-contract).
This map links each clause to existing evidence without creating a new execution
or certification claim.

| Success Signal clause | Existing evidence | Current interpretation |
| --- | --- | --- |
| Ready at owner evidence time | [Current Owned Behavior Replay](#current-owned-behavior-replay) | Current-session production-path replay reported `AGE_ZERO_STATE=ready`. |
| Ready at the inclusive seven-day boundary | [Current Owned Behavior Replay](#current-owned-behavior-replay) | Current-session production-path replay reported `BOUNDARY_STATE=ready`. |
| Unavailable one millisecond later, with no ready-only metrics | [Current Owned Behavior Replay](#current-owned-behavior-replay) | Current-session production-path replay reported `FIRST_STALE_STATE=unavailable` and `STALE_READY_ONLY_KEYS=none`. |
| Calendar-stable repository validation | [Canonical Broad Selftest And External Baseline](#canonical-broad-selftest-and-external-baseline) | The current broad run contained zero options-flow failures, but its nonzero exit remains owned by BUG-017 and BUG-024; the newly planned broader E2E item stays unchecked. |

## Test Evidence

### RED-stage

**Phase:** test

**Claim Source:** executed

Pre-implementation tool-log rows `447`, `448`, and `450` each exited `1` with
the planned scenario-specific mutation signal. Their selftest input hashes
precede the implementation hash recorded below.

### GREEN-stage

**Phase:** test

**Claim Source:** executed

Post-implementation tool-log rows `480`, `481`, and `482` each exited `0` on
selftest SHA-256 `fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439`.
Tool-log row `485` independently reran the three RED mutations and the broad
controls-disabled command, then exited `0` only after all four witnesses matched.

### Current Broad Selftest Evidence From Feature 031

**Phase:** bug

**Command:** `node scripts/selftest.mjs`

**Exit Code:** `1`, as recorded by Feature 031 tool-log row 427

**Claim Source:** interpreted

**Interpretation:** This bug phase read the current executed receipt and its raw
evidence from `specs/031-shock-transmission-foundation/report.md`. It did not rerun
the command. Three of the five failures are one options-flow group. The other two
belong to BUG-022 and BUG-017.

**Output SHA-256:** `fedf7800df1893f856060c45d82bf0aabd6e9c1a0f6cfbd968e04bea1c833e1e`

```text
lines: 3935
FAIL options-flow-feed-lab reaches a READY read from committed evidence
FAIL the flow read carries the owning model call/put lean over real scanned contracts
FAIL Tier-A owning-model reads group threw: Cannot read properties of undefined (reading 'length')
FAIL one active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline
FAIL one scope progress claim disagrees with its Definition of Done outside the frozen baseline
PASS Feature 031 resolves one frozen required resource policy from repository configuration
PASS Feature 031 canonical identity is stable across object-key order
PASS Feature 031 exports one frozen CommonJS foundation API for contract and reader validation
Research-Lab self-test: 3419 passed, 5 failed
```

### Current Options Owner Diagnostic From Feature 031

**Phase:** bug

**Command:** Feature 031 bounded options-flow owner diagnostic retained at tool-log row 430

**Exit Code:** `1`, as recorded by row 430

**Claim Source:** interpreted

**Interpretation:** The production owner result is unavailable because the newest
chain crossed the freshness boundary. Its metrics contain only `reason` and
`state`; the absent ready-only fields explain the second assertion failure and the
subsequent `top.length` exception.

**Output SHA-256:** `004dcc1b7192af293a7bed7956032150691c9e850ebc87b9631f75704c082772`

```text
F031-BROAD-OPTIONS-FLOW-001: owner read state=unavailable
newestOptionChainAgeDays=7
metricKeys=reason,state
contractsFlagged=null
consideredCount=null
topCount=null
optionsFlowRepairPaths=route-same-repo
Feature031RepairPaths=excluded
ProductionStaleRefusal=preserved
```

## Root Cause Evidence

**Claim Source:** interpreted

The controlling path establishes the mismatch:

- `scripts/selftest.mjs` calls `buildOptionsFlowToolRead()` without `asOf`.
- The same file lists `options-flow-feed-lab` among unconditional ready ids.
- `scripts/brief-refresh.mjs` uses `new Date().toISOString()` when `asOf` is absent.
- The builder returns unavailable when age is greater than seven days.
- The selftest later calls the same builder with an explicit 2027 instant and
  requires the stale refusal, proving stale rejection is intentional behavior.
- The unavailable shape contains no `top` array, but the positive assertion group
  dereferences `flow.metrics.top.length`.

## Owner Deduplication

The current canonical bug inventory contains BUG-001 through BUG-022. A bounded
search of bug, spec, design, scope, and state artifacts found no owner for
`F031-BROAD-OPTIONS-FLOW-001`, the unconditional options-flow ready assertion, or
this freshness symptom. A new packet is therefore required rather than a duplicate.

## Existing Owner Classification For The Other Broad Groups

| Finding | Existing packet | Required owner chain |
| --- | --- | --- |
| `XRL-PATH-GUARD-HIST-001` | `specs/_bugs/BUG-022-historical-report-declaration-leak` | Resume that packet at `bubbles.test`, then route its remaining validation and acceptance owners. |
| `XRL-BUG017-DOD-001` | `specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos` | Resume Scope 2 at `bubbles.implement`; after current receipts, route to `bubbles.test` and `bubbles.validate`. |

`LEGACY-031-001` remains a separate route marker for geopolitical v2 current
selection. It is not one of the five current broad selftest failures and was not
absorbed into BUG-023.

## Files Added

| File | Purpose |
| --- | --- |
| `bug.md` | Reproduction, severity, root cause, and boundaries |
| `spec.md` | Expected behavior and stable scenarios |
| `design.md` | Initial diagnostic design handoff |
| `scopes.md` | Initial plan handoff and DoD |
| `report.md` | Evidence provenance and routing |
| `uservalidation.md` | Unchecked human acceptance contract |
| `scenario-manifest.json` | Scenario identities and proof obligations |
| `test-plan.json` | Structured initial test handoff |
| `state.json` | In-progress bugfix-fastlane control state |

## Required Route

Design and planning reconciliation are present. The current route is
`bubbles.implement` for receipt-bound attribution of the already-present bounded
`scripts/selftest.mjs` change, with no repair rewrite. `bubbles.test` then owns
the scenario-bound RED/GREEN, independent canary, restore, scenario-specific
repository E2E, and broader regression evidence before `bubbles.validate` may
re-evaluate certification under `bugfix-fastlane`.

## Test Phase Persistent RED Evidence

The test phase added three closed `BUG023_RED_CONTROL` values to
`scripts/selftest.mjs`. Each control changes one planned test input. The default
path executes the exact age-zero, seven-day, and seven-days-plus-one-millisecond
production reads without changing the existing reads map.

### TP-BUG023-01 Persistent RED

**Phase:** test

**Environment:** `BUG023_RED_CONTROL=stale-at-seven-days`

**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs`

**Exit Code:** `1`

**Claim Source:** executed

**Full Output SHA-256:** `1e77449e138410cd58dd15e26371779b35ec387ceb09c2ef59aed8f6d9fe8080`

**Tool-Log Stdout SHA-256:** `6ab3163537fdbd065b8ecc25b8f3b4fe77dff3ef8e126c1a9354d7d93b8f99e0`

```text
# BUG-023 TP-BUG023-01 SCN-BUG023-001 independent persistent RED stale boundary mutation
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs
exit: 1
lines: 3938
sha256: 1e77449e138410cd58dd15e26371779b35ec387ceb09c2ef59aed8f6d9fe8080
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: options-flow-feed-lab reaches a READY read from committed evidence, not a coverage-only placeholder
  ✗ FAIL: options-flow first stale instant remains unavailable (state=ready, ready-only keys=tickers,contractsFlagged,consideredCount,callPremium,putPremium,lean,maxScore,top)
  ✗ FAIL: the flow read carries the owning model’s own call/put lean over real scanned contracts (undefined flagged of undefined considered)
  ✗ FAIL (Tier-A owning-model reads group threw): Cannot read properties of undefined (reading 'length')
================================================
Research-Lab self-test: 3421 passed, 6 failed
================================================
```

The control moved the stale fixture to exactly seven days. Production returned
`ready`, so the stale assertion failed and listed every ready-only key without
dereferencing any unavailable metric.

### TP-BUG023-02 Persistent RED

**Phase:** test

**Environment:** `BUG023_RED_CONTROL=boundary-after-seven-days`

**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs`

**Exit Code:** `1`

**Claim Source:** executed

**Full Output SHA-256:** `06fe7aeae61e240acfeec7e30dd714ca7581b976fc62d47385c5f5447cb7735c`

**Tool-Log Stdout SHA-256:** `86b43dc64619279b6c881cd7e1329b05168059a4f2ba74b9959e614977451f25`

```text
# BUG-023 TP-BUG023-02 SCN-BUG023-002 independent persistent RED ready boundary mutation
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs
exit: 1
lines: 3938
sha256: 06fe7aeae61e240acfeec7e30dd714ca7581b976fc62d47385c5f5447cb7735c
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: options-flow-feed-lab reaches a READY read from committed evidence, not a coverage-only placeholder
  ✗ FAIL: options-flow evidence-clock ready boundaries use owner model (age-zero=ready, boundary=unavailable)
  ✗ FAIL: the flow read carries the owning model’s own call/put lean over real scanned contracts (undefined flagged of undefined considered)
  ✗ FAIL (Tier-A owning-model reads group threw): Cannot read properties of undefined (reading 'length')
================================================
Research-Lab self-test: 3421 passed, 6 failed
================================================
```

The control moved only the inclusive boundary to seven days plus one
millisecond. The age-zero read remained `ready`, while the changed boundary
returned `unavailable` and failed its scenario assertion.

### TP-BUG023-03 Persistent RED

**Phase:** test

**Environment:** `BUG023_RED_CONTROL=wall-clock-unguarded`

**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs`

**Exit Code:** `1`

**Claim Source:** executed

**Full Output SHA-256:** `bd668e6dac290e59d7c2111588129d4f2a454e020793a01b6c91d00a548b166e`

**Tool-Log Stdout SHA-256:** `550e5afdcb6ca963e3cc66414486c8810dd6889598afd3b41048d0e1f2f9798e`

```text
# BUG-023 TP-BUG023-03 SCN-BUG023-003 exact persistent RED wall clock and unguarded dereference mutation
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs
exit: 1
lines: 3938
sha256: bd668e6dac290e59d7c2111588129d4f2a454e020793a01b6c91d00a548b166e
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: options-flow-feed-lab reaches a READY read from committed evidence, not a coverage-only placeholder
  ✗ FAIL: options-flow explicit clocks remain calendar-stable (control=wall-clock-unguarded, failure=Cannot read properties of undefined (reading 'length'))
  ✗ FAIL: the flow read carries the owning model’s own call/put lean over real scanned contracts (undefined flagged of undefined considered)
  ✗ FAIL (Tier-A owning-model reads group threw): Cannot read properties of undefined (reading 'length')
================================================
Research-Lab self-test: 3421 passed, 6 failed
================================================
```

The control omitted the positive `asOf` and read `top.length` before checking
state. It reproduced the wall-clock mismatch and the secondary unavailable-metric
dereference named by the plan.

### Controls-Disabled Pre-Fix Baseline

**Phase:** test

**Environment:** `BUG023_RED_CONTROL` unset

**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs`

**Exit Code:** `1`

**Claim Source:** interpreted

**Interpretation:** None of the three new scenario titles appeared in the
failure-shaped lines. The unchanged reads map still produced its original three
options-flow failures.

**Full Output SHA-256:** `bf1162c9d31dd5c5f2aa335d3b97010ab558b69fbfb51ee92291d59deddfa8d3`

```text
# BUG-023 persistent controls disabled against unmodified pre-fix selftest implementation
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs
exit: 1
lines: 3938
sha256: bf1162c9d31dd5c5f2aa335d3b97010ab558b69fbfb51ee92291d59deddfa8d3
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: options-flow-feed-lab reaches a READY read from committed evidence, not a coverage-only placeholder
  ✗ FAIL: the flow read carries the owning model’s own call/put lean over real scanned contracts (undefined flagged of undefined considered)
  ✗ FAIL (Tier-A owning-model reads group threw): Cannot read properties of undefined (reading 'length')
================================================
Research-Lab self-test: 3422 passed, 5 failed
================================================
```

### Test Integrity Receipts

| Check | Exit | Output SHA-256 | Result |
| --- | ---: | --- | --- |
| Persistent scenario title resolution | 0 | `83fc69515ade87dd4e1dfa192278eaf4a957c03ec303bf5cdcfc4921b4963521` | Three references resolved. |
| Artifact lint | 0 | `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` | Packet passed. |
| Traceability guard | 0 | `0946be1963d8d36f8975896ad94a4ebfd3ac3420f65113025099328dfd725ab3` | Three scenarios mapped. |
| Scenario obligation lint | 0 | `7dbb095c16f05c2fae19ae80055d1e32ce124c903ca0237729f2240ac973d146` | Three obligation matrices passed. |
| Test mechanism lint | 0 | `40a09fadd5507bc3e742ca138d1bc1de63a54e6aeb2fd09c530a97f7aa8a5207` | Three mechanisms passed. |
| Bugfix regression quality guard | 0 | `78ea4bdb2c253d575c312dab98b58b54f3a457eeee7372ba8981f54f89e423cc` | Zero violations and warnings. |
| Skip, diff, and protected-path check | 0 | `0d330e0e54848886457119dacbaff6cee17e5250e0d3217394b66e6ee5e7a192` | Zero skip markers and no protected options-flow changes. |

## Test Phase Route

`F031-BROAD-OPTIONS-FLOW-001` remains open. `bubbles.implement` must change only
the existing options-flow reads-map and assertion block in `scripts/selftest.mjs`.
The implementation must use `ownerState.nowMs` clocks and guard ready-only
metric reads. The three persistent controls and their nonzero receipts remain
the RED side of the required RED-to-GREEN trace.

## Implementation Clock Repair And Green Replays

**Phase:** implement

**Claim Source:** executed

The repository packet was derived from scenario node
`shock-deliver-feature-031` and validated as actionable for session
`vscode-a66638659f347684a54d8a6f9606fa12`, control revision `6`, and control
path digest
`sha256:f10550b21098695e1ea28bf43c791c31fb8c52b8cd6cad3f680bcd516f6db7e4`.
No repository-binding preflight ran.

### Verified RED Provenance

The implementation phase queried the structured tool log before changing the
selftest. All three rows belong to `bubbles.test`, the bound session, BUG-023,
Scope 01, revision 6, and carry exit `1`.

| Test | Tool-log row | Full output SHA-256 | Tool-log stdout SHA-256 | Selftest input SHA-256 |
| --- | ---: | --- | --- | --- |
| `TP-BUG023-01` | 447 | `1e77449e138410cd58dd15e26371779b35ec387ceb09c2ef59aed8f6d9fe8080` | `6ab3163537fdbd065b8ecc25b8f3b4fe77dff3ef8e126c1a9354d7d93b8f99e0` | `621ecfae826a68040ee53727f8afa5396e8598a6ffb8cc914dc65dfaaca62751` |
| `TP-BUG023-02` | 448 | `06fe7aeae61e240acfeec7e30dd714ca7581b976fc62d47385c5f5447cb7735c` | `86b43dc64619279b6c881cd7e1329b05168059a4f2ba74b9959e614977451f25` | `621ecfae826a68040ee53727f8afa5396e8598a6ffb8cc914dc65dfaaca62751` |
| `TP-BUG023-03` | 450 | `bd668e6dac290e59d7c2111588129d4f2a454e020793a01b6c91d00a548b166e` | `550e5afdcb6ca963e3cc66414486c8810dd6889598afd3b41048d0e1f2f9798e` | `2172dfbd41b20cd9f559354124fe718e85da3f776a356f5c39163619e0294b03` |

The final RED input identity is the exact pre-implementation selftest identity.
The first two RED rows predate the test-owned third control. Their production
input hashes are identical to the final RED row and to the implementation
epoch.

### Changed And Preserved Identities

The implementation changed only the planned options-flow assertion consumer in
`scripts/selftest.mjs`. It moved the real owner-state construction ahead of the
reads map, derived all normal fixture instants from finite `ownerState.nowMs`,
passed explicit `asOf` values, and guarded the ready-only metric block by
`state === 'ready'`.

| Path | Before implementation | Stable GREEN epoch | Disposition |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | `2172dfbd41b20cd9f559354124fe718e85da3f776a356f5c39163619e0294b03` | `fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439` | Changed |
| `scripts/brief-refresh.mjs` | `464fec252ecdd7cc2789e8de45315f6cafe039dab885c1a86133bd951ea9544c` | same | Unchanged |
| `scripts/owner-state.mjs` | `33d22cd8244c6de6f9ce88773bb37886b3470809b54b6e2e2e261c63ed2f50a3` | same | Unchanged |
| `rlexperience-adapters/options.js` | `416ef1b489da49e407eee79de8415ea562aacf5a920d3e9ccc96338e77e1cb3e` | same | Unchanged |

### TP-BUG023-01 Focused GREEN

**Tool-log row:** `468`

**Exit Code:** `0`

**Full Output SHA-256:** `dd281cf426e92197a3165cb512c310990d2feaea4ccdc7f90ba652283cc077b2`

**Tool-log Stdout SHA-256:** `d66884b2dd3035d32fe02f178f4b9024c0b1c5f265424fe397310ccd662159e0`

```text
TEST_PLAN=TP-BUG023-01
SCENARIO=SCN-BUG023-001
OWNER_NOW_MS=1787667387000
OFFSET_MS=604800001
AS_OF=2026-09-01T14:16:27.001Z
STATE=unavailable
METRIC_KEYS=reason,state
READY_ONLY_KEYS=none
NAMES_AGE=true
NAMES_STALE_TAPE=true
RESULT=PASS
```

### TP-BUG023-02 Focused GREEN

**Tool-log row:** `469`

**Exit Code:** `0`

**Full Output SHA-256:** `c44b8c9bb2f35b722fa246973805127ba28edb7461744111bf5ff6ea6d3d10f9`

**Tool-log Stdout SHA-256:** `32cc92025986d0a90b72237d10d32e555e1af84792a2082ebfa5029cdcfd2e3c`

```text
TEST_PLAN=TP-BUG023-02
SCENARIO=SCN-BUG023-002
OWNER_NOW_MS=1787667387000
AGE_ZERO_AS_OF=2026-08-25T14:16:27.000Z
BOUNDARY_AS_OF=2026-09-01T14:16:27.000Z
AGE_ZERO_STATE=ready
BOUNDARY_STATE=ready
CONSIDERED=17670
FLAGGED=1228
LEAN=balanced
MAX_SCORE=91
RANKED_COUNT=3
BOUNDARY_OUTPUT_IDENTICAL=true
RESULT=PASS
```

### TP-BUG023-03 Focused GREEN

**Tool-log row:** `470`

**Exit Code:** `0`

**Full Output SHA-256:** `515f364ad6679661b01b528ae9dc4d1e22d11be56287d2cd0e95b0b38ad3bc29`

**Tool-log Stdout SHA-256:** `d905bfa8d47c684ccd450e348dbfe9b4de2cb5eef6c51a744faefc13d50a13a3`

```text
TEST_PLAN=TP-BUG023-03
SCENARIO=SCN-BUG023-003
OWNER_NOW_MS=1787667387000
AGE_ZERO_STATE=ready
SEVEN_DAY_STATE=ready
PLUS_ONE_MS_STATE=unavailable
STALE_READY_ONLY_KEYS=none
READS_MAP_CLOCK_PINNED=true
READY_METRICS_STATE_GUARDED=true
POSITIVE_TOP_COUNT=3
BOUNDARY_TOP_COUNT=3
STALE_TOP_COUNT=not-read
RESULT=PASS
```

### Canonical Broad Selftest

**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs`

**Tool-log row:** `467`

**Exit Code:** `1`

**Claim Source:** executed

**Full Output SHA-256:** `4d0f365a3988b2929040e6f50c62837eb7dd32c3e678257ee2ff4abecab82aca`

**Tool-log Stdout SHA-256:** `2c05b024f97a48c5d03a7b9ee49a54177d06c72ef4c89e0462c52a6fb639b008`

```text
# BUG-023 implementation canonical broad selftest GREEN epoch 1
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 600 /opt/homebrew/bin/node scripts/selftest.mjs
exit: 1
lines: 3982
sha256: 4d0f365a3988b2929040e6f50c62837eb7dd32c3e678257ee2ff4abecab82aca
--- failure-shaped lines from the omitted region ---
  FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline
  FAIL: no scope progress claim disagrees with its Definition of Done outside the frozen baseline
--- summary ---
Research-Lab self-test: 3469 passed, 2 failed
```

The broad result contains no BUG-023 options-flow failure and no unavailable
metric dereference. The two remaining groups retain their existing owners:

- `XRL-PATH-GUARD-HIST-001` in BUG-022.
- `XRL-BUG017-DOD-001` in BUG-017.

This implementation evidence is not independent test certification and does not
change human acceptance. Independent GREEN replay and certification remain owned
by their existing workflow phases.

## Independent Test Verification At Revision 6

The test phase derived the packet from scenario node
`shock-deliver-feature-031` and validated it against session
`vscode-a66638659f347684a54d8a6f9606fa12`, control revision `6`, and control
digest `sha256:f10550b21098695e1ea28bf43c791c31fb8c52b8cd6cad3f680bcd516f6db7e4`.
No repository-binding preflight ran. The final seven-row epoch used selftest
SHA-256 `fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439`.

### TP-BUG023-01 Independent Evidence

**Phase:** test

**Commands:** tool-log row `477` for the `stale-at-seven-days` RED mutation,
row `480` for the focused production GREEN replay, and row `485` for the
independent output witness.

**Claim Source:** executed

**Exit Codes:** `1`, `0`, and `0`, respectively.

All commands used the same nine-file input closure. The RED witness required
exactly one options-flow failure and the named stale-boundary assertion. The
GREEN replay used the real page parser, owner-state builder, and production
options-flow builder.

```text
TP-BUG023-01_RED_CHILD_EXIT=1
SIGNAL=none
EXPECTED_SIGNAL_MATCH=true
OPTIONS_FLOW_FAILURE_COUNT=1
RED_PASSED=3468
RED_FAILED=3
RED_VERDICT=PASS
OWNER_NOW_MS=1787667387000
FIRST_STALE_AS_OF=2026-09-01T14:16:27.001Z
FIRST_STALE_STATE=unavailable
STALE_METRIC_KEYS=reason,state
STALE_READY_ONLY_KEYS=none
STALE_NAMES_AGE=true
STALE_NAMES_STALE_TAPE=true
GREEN_VERDICT=PASS
```

### TP-BUG023-02 Independent Evidence

**Phase:** test

**Commands:** tool-log row `478` for the `boundary-after-seven-days` RED
mutation, row `481` for the focused production GREEN replay, and row `485` for
the independent output witness.

**Claim Source:** executed

**Exit Codes:** `1`, `0`, and `0`, respectively.

The RED witness required exactly one options-flow failure and the named
inclusive-boundary assertion. The GREEN replay required both ready results to
carry owner-produced values and required identical output at age zero and the
inclusive seven-day boundary.

```text
TP-BUG023-02_RED_CHILD_EXIT=1
SIGNAL=none
EXPECTED_SIGNAL_MATCH=true
OPTIONS_FLOW_FAILURE_COUNT=1
RED_PASSED=3468
RED_FAILED=3
RED_VERDICT=PASS
AGE_ZERO_AS_OF=2026-08-25T14:16:27.000Z
BOUNDARY_AS_OF=2026-09-01T14:16:27.000Z
AGE_ZERO_STATE=ready
BOUNDARY_STATE=ready
CONSIDERED=17670
FLAGGED=1228
LEAN=balanced
MAX_SCORE=91
RANKED_COUNT=3
BOUNDARY_OUTPUT_IDENTICAL=true
GREEN_VERDICT=PASS
```

### TP-BUG023-03 Independent Evidence

**Phase:** test

**Commands:** tool-log row `479` for the `wall-clock-unguarded` RED mutation,
row `482` for the focused production GREEN replay, and row `485` for the
independent output witness.

**Claim Source:** executed

**Exit Codes:** `1`, `0`, and `0`, respectively.

The RED witness required exactly one options-flow failure and the original
`top.length` dereference. The GREEN replay required all explicit-clock states,
no ready-only stale keys, and both selftest source guards.

```text
TP-BUG023-03_RED_CHILD_EXIT=1
SIGNAL=none
EXPECTED_SIGNAL_MATCH=true
OPTIONS_FLOW_FAILURE_COUNT=1
RED_PASSED=3468
RED_FAILED=3
RED_VERDICT=PASS
AGE_ZERO_STATE=ready
SEVEN_DAY_STATE=ready
PLUS_ONE_MS_STATE=unavailable
STALE_READY_ONLY_KEYS=none
READS_MAP_CLOCK_PINNED=true
READY_METRICS_STATE_GUARDED=true
POSITIVE_TOP_COUNT=3
BOUNDARY_TOP_COUNT=3
STALE_TOP_COUNT=not-read
GREEN_VERDICT=PASS
```

### Canonical Broad Selftest And External Baseline

**Phase:** test

**Command:** tool-log row `483`, canonical `node scripts/selftest.mjs`; tool-log
row `485`, independent output witness over the same command and controls.

**Exit Code:** `1` for the canonical repository command; `0` for the witness.

**Claim Source:** executed

**Full witness output SHA-256:**
`0153f8ca0d504beead9f0e8c0665c7e8a07694fb12afd8aee77187e06bac7846`.

```text
BROAD_CHILD_EXIT=1
SIGNAL=none
OPTIONS_FLOW_FAILURE_COUNT=0
PATH_FAILURE_PRESENT=true
DOD_FAILURE_PRESENT=true
PASSED=3469
FAILED=2
VERDICT=PASS
FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline
FAIL: no scope progress claim disagrees with its Definition of Done outside the frozen baseline
Research-Lab self-test: 3469 passed, 2 failed
```

The first remaining assertion is `XRL-PATH-GUARD-HIST-001`, owned by
`specs/_bugs/BUG-022-historical-report-declaration-leak`. That packet remains
`in_progress` and currently routes to `bubbles.test`. The second is
`XRL-BUG017-DOD-001`, owned by
`specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos`. That
packet remains `in_progress` and currently routes to `bubbles.implement`.
Neither assertion is an options-flow failure. Feature 031 therefore remains
blocked on its external packets even though BUG-023's three owned rows pass.

### Stable Input And Protected Path Evidence

**Phase:** test

**Command:** tool-log row `484`, independent protected-path identity proof.

**Exit Code:** `0`

**Claim Source:** executed

**Full output SHA-256:**
`72485a5ff40e7d1b402011d8464e3abb2f0eb4e7f16c14736de87322f55c06ab`.

The proof compared Feature 031 to its pre-implementation input-closure hashes
and compared tracked product boundaries to `HEAD`. The seven-row harness also
repeated all nine BUG-023 input hashes after the canonical broad run.

```text
FEATURE031_BASELINE_PATH_COUNT=20
FEATURE031_CURRENT_PATH_COUNT=20
FEATURE031_EXTRA_PATH_COUNT=0
FEATURE031_MISSING_PATH_COUNT=0
PRODUCTION_OPTIONS_STATUS_EMPTY=true
HORIZON_LADDER_STATUS_EMPTY=true
REGISTRY_NAVIGATION_STATUS_EMPTY=true
FRAMEWORK_STATUS_EMPTY=true
BUG023_PROTECTED_PATH_FAILURES=0
FINAL_SELFTEST_SHA256=fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439
FINAL_BRIEF_REFRESH_SHA256=464fec252ecdd7cc2789e8de45315f6cafe039dab885c1a86133bd951ea9544c
FINAL_OWNER_STATE_SHA256=33d22cd8244c6de6f9ce88773bb37886b3470809b54b6e2e2e261c63ed2f50a3
FINAL_OPTIONS_ADAPTER_SHA256=416ef1b489da49e407eee79de8415ea562aacf5a920d3e9ccc96338e77e1cb3e
BUG023_EPOCH_3_ORCHESTRATION_FAILURES=0
```

### Code Diff Evidence

**Phase:** test

**Claim Source:** executed

Tool-log row `484` compared the implementation epoch to the pre-implementation
input closure. Only `scripts/selftest.mjs` changed for BUG-023. Its SHA-256 moved
from `2172dfbd41b20cd9f559354124fe718e85da3f776a356f5c39163619e0294b03`
to `fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439`.
The production options owner files retained hashes
`464fec252ecdd7cc2789e8de45315f6cafe039dab885c1a86133bd951ea9544c`,
`33d22cd8244c6de6f9ce88773bb37886b3470809b54b6e2e2e261c63ed2f50a3`,
and `416ef1b489da49e407eee79de8415ea562aacf5a920d3e9ccc96338e77e1cb3e`.
The same row compared 20 Feature 031 paths to their pre-implementation hashes
with zero additions, omissions, or mismatches. It also compared every tracked
options snapshot, all four Horizon Ladder paths, registry/navigation paths, and
installed framework paths to their unchanged baselines. The command exited `0`.

**Phase:** validate

**Command:** `git status --short -- scripts/selftest.mjs specs/_bugs/BUG-023-options-flow-ready-clock-drift; git diff --name-status -- scripts/selftest.mjs specs/_bugs/BUG-023-options-flow-ready-clock-drift; git diff --name-status -- specs/031-shock-transmission-foundation rlshock.js horizon-ladder-lab.html horizon-ladder-universe.json notes/horizon-ladder-lab.md tests/horizon-ladder-lab.spec.mjs tools.json index.html rlnav.js`

**Exit Code:** `0`

**Claim Source:** executed

```text
BUG023_GIT_DELTA_BEGIN
 M scripts/selftest.mjs
?? specs/_bugs/BUG-023-options-flow-ready-clock-drift/
BUG023_GIT_NAME_STATUS_BEGIN
M       scripts/selftest.mjs
BUG023_PROTECTED_NAME_STATUS_BEGIN
BUG023_PROTECTED_NAME_STATUS_EXIT=0
BUG023_GIT_DELTA_END
```

### Excluded Test Setup Attempts

Tool-log row `476` exited `127` before test execution because a runner changed
the requested Node path to absent `/opt/local/bin/node`. Tool-log row `486`
exited `1` before production execution because the external probe supplied an
absolute page path to a repository-relative loader. Rows `477` through `485`
and corrected row `487` supersede those setup attempts. Neither excluded row is
used by a Definition of Done claim.

### Final Test Integrity Gates

**Phase:** test

**Claim Source:** executed

Every required BUG-023 guard ran after the independent evidence anchors were
linked. The test category is functional, so no live-stack mock audit applies.
The output witness supplies the executed mutation check required by the
self-validating-test audit.

| Check | Tool-log row | Exit | Tool-log stdout SHA-256 |
| --- | ---: | ---: | --- |
| Evidence-linked traceability | `489` | `0` | `8a7f578a9eb8e59ece8e21a549a581a3c3073587babaa4ed4eec38f2623a957b` |
| Linked scenario resolution | `490` | `0` | `eee7462013177ea43b319e1a938e36109b452b0c4e26ab5dfa89f5ec6d2ce589` |
| Scenario obligation lint | `491` | `0` | `af65a402b6bf5595f7917ffed696edd6c9deb1fb87c56c9cf11cb956361988ec` |
| Test mechanism lint | `492` | `0` | `11e31f9ed69d85ec2f329c0433ef5eb992fd8275d01d883b4f2fb6bc56939049` |
| Bugfix regression quality | `493` | `0` | `27e62fda92a064db6848cfa1d4d036ca67a7bc8b212f5e32f3a87aa549f7f89d` |
| Artifact lint | `494` | `0` | `cf0b9eb4733c8a375512407df4e6c2da35c523177e55fb571c67e7eb5144ae38` |
| Skip, diff, mock, and self-validation audit | `496` | `0` | `a89b5bfd2cac9924370bc2443e5e26faa14bec688823451e15da7fca3daa3529` |

```text
SCENARIOS_CHECKED=3
TEST_ROWS=4
CONCRETE_TEST_REFERENCES=3
REPORT_EVIDENCE_REFERENCES=3
DOD_MAPPINGS=3/3
SKIP_MARKER_MATCHES=0
GIT_DIFF_CHECK_EXIT=0
MOCK_AUDIT_APPLICABLE=false
SELF_VALIDATING_AUDIT=PASS
BUG023_FINAL_STATIC_CHECK=PASS
```

Tool-log row `495` exited `126` because its runner prepended Bash to a Zsh
inline command. Corrected row `496` supersedes that wrapper failure and is the
only static-integrity receipt used by the DoD claim.

## Domain-Invariant Justifications

Invariant-Justification: `INV-RL-SHOCK-QUALIFIERS-LOSSLESS` - BUG-023 changes
only the options-flow selftest consumer. Executed protected-path and Git-diff
evidence show all Feature 031 implementation and test paths unchanged, so this
packet neither alters nor claims enforcement of the shock-qualifier invariant.

## Validate Phase Current-Session Decision 2026-09-02

**Phase:** validate

**Claim Source:** interpreted

**Interpretation:** Current execution proves that BUG-023's owned options-flow
behavior is repaired on the same bytes independently verified by the test phase.
Certification remains unavailable because the pre-certification and transition
guards report required planning, dependency, scope, phase, evidence, and human
acceptance failures. The broad selftest's two remaining failures resolve to the
existing BUG-024 and BUG-017 packets, while Feature 031 TP-01-08 has a separate
stale digest expectation.

### Current Receipt And Input Identity

The inherited repository packet was validated against scenario node
`shock-close-bug-023` at host control revision `1`. The disposable scenario had
33 unique nodes, all 33 repository resolutions used session
`vscode-7fbaa0072aa19f2dad3c4e8b6569c268`, and the Company and Shock dependency
edges were present. The scenario rewrite was removed after packet validation.

Tool-log row `524` verified 17 selected test-phase receipts. Rows `477`, `478`,
`479`, and `483` retained their expected nonzero RED or broad-suite exits. Every
selected GREEN and guard row retained exit `0`. All selected rows retained
selftest SHA-256
`fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439`.
Rows `476`, `486`, and `495` remained excluded setup failures.

Tool-log row `525` compared the current four owning files to that receipt epoch:

```text
fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439  scripts/selftest.mjs
464fec252ecdd7cc2789e8de45315f6cafe039dab885c1a86133bd951ea9544c  scripts/brief-refresh.mjs
33d22cd8244c6de6f9ce88773bb37886b3470809b54b6e2e2e261c63ed2f50a3  scripts/owner-state.mjs
416ef1b489da49e407eee79de8415ea562aacf5a920d3e9ccc96338e77e1cb3e  rlexperience-adapters/options.js
CURRENT_BYTE_IDENTITY=PASS
SELFTEST_MATCH=true
PRODUCTION_OWNER_MATCH=true
```

### Current Owned Behavior Replay

**Command:** Current-session production-path probe over
`brief-refresh.mjs`, `owner-state.mjs`, the page parser, and `scripts/selftest.mjs`

**Exit Code:** `0` at tool-log row `526`

**Claim Source:** executed

**Full Output SHA-256:**
`034ef881ff33181307c3a14592b7382ae404618f7ec37817180df56cd6865310`

```text
TEST_PLANS=TP-BUG023-01,TP-BUG023-02,TP-BUG023-03
SCENARIOS=SCN-BUG023-001,SCN-BUG023-002,SCN-BUG023-003
OWNER_NOW_MS=1787667387000
AGE_ZERO_AS_OF=2026-08-25T14:16:27.000Z
BOUNDARY_AS_OF=2026-09-01T14:16:27.000Z
FIRST_STALE_AS_OF=2026-09-01T14:16:27.001Z
AGE_ZERO_STATE=ready
BOUNDARY_STATE=ready
FIRST_STALE_STATE=unavailable
CONSIDERED=17670
FLAGGED=1228
LEAN=balanced
MAX_SCORE=91
RANKED_COUNT=3
BOUNDARY_OUTPUT_IDENTICAL=true
STALE_METRIC_KEYS=reason,state
STALE_READY_ONLY_KEYS=none
STALE_NAMES_AGE=true
STALE_NAMES_STALE_TAPE=true
READS_MAP_CLOCK_PINNED=true
READY_METRICS_STATE_GUARDED=true
FOCUSED_REPLAY_VERDICT=PASS
```

### Broad And External Classification

| Evidence | Exit | Full output SHA-256 | Observed result |
| --- | ---: | --- | --- |
| Tool-log row `527`, `node scripts/selftest.mjs` | 1 | `67b23b8db86c44ccafa9d0cf3e7a6efe4224c0fd5cf8bbbb2e06d6afc3776556` | `3469 passed, 2 failed`; zero options-flow failure lines. |
| Tool-log row `530`, spec-path validator | 1 | `c4611ad3f4b5a91aad3e3781f8050d2e28521fa3e3fcb9ace73f6813217e576b` | The one new path is `tests/shock-transmission.resource.test.mjs`; the existing owner is BUG-024. |
| Tool-log row `531`, scope/DoD validator | 1 | `af0c0630449de65a3a9835e03914a8419c7033dc4fcf7c4d0351bac7a3d304b0` | The one new drift is BUG-017 Scope 02 certification claiming `9/0` while its artifact has `9/2`. |
| Tool-log row `532`, Feature 031 TP-01-08 | 1 | `2d6c9519384a75ea510511191e22fda268fd5b7357ec0ea82904a4326a2c01d4` | The canary expected digest `98605f...` while current legitimate inventory digest is `8c9500...`. |

The failed setup attempts at rows `523` and `528` did not execute their intended
checks. Corrected rows `524` and `530` supersede them. Row `529` was a valid
first BUG-017 diagnostic and row `531` repeated the same finding in the paired
classification epoch.

### Transition Decision

Tool-log row `533` resolved `bugfix-fastlane` to audit profile
`delivery-completion-v1`, target `done`, contract digest
`sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`,
and target revision
`sha256:07a2803255c300845ed43aed30826fd6d7d0a28375f6a6401fee2cf98ad2e50e`.

Tool-log row `534` ran the pre-certification goal-fidelity guard and exited `1`
with full output SHA-256
`ac28dc113b0bdd3f01f1fbe2ac61fcc99994738c322c92139577e2ad36795908`.
It reported two `G070` findings: no non-empty `## Outcome Contract` and no
declared Hard Constraints.

Tool-log row `535` ran the exact asserted state-transition guard and exited `1`
with full output SHA-256
`e97795e1e7d6459d845236217760c7163a0e1d8afe591e5e22229f3aa2a0b235`.
The structured result reported 21 failures, two warnings, failed gates `G022`,
`G027`, `G089`, `G094`, and `G136`, and failed checks
`Check-4-scenario-states`, `Check-5-all-done`, and `Check-9-evidence`.

The standalone `G089` guard exited `1` with full output SHA-256
`83c168637c866b03054b021aadee83964e865d9ae1b35d4521271c26a8500cc6`
because BUG-023 declares in-progress Feature 031 as a dependency. The standalone
`G094` guard exited `1` with full output SHA-256
`3d0e32f4c7940e18356dd0cde79341896dc301413276af8f1789d036b62dcf95`
because the bug spec has neither a Domain Capability Model nor a
Single-Capability Justification.

### Finding Accounting

| Finding | Classification | Disposition |
| --- | --- | --- |
| `F031-BROAD-OPTIONS-FLOW-001` | Addressed in BUG-023 | Current row `526` directly replays all three owned scenarios on the stable GREEN bytes. |
| `BUG023-G070-OUTCOME-CONTRACT` | Required | `bubbles.analyst` owns the missing Outcome Contract and Hard Constraints in BUG-023 `spec.md`. |
| `BUG023-G094-CAPABILITY-MODEL` | Required | `bubbles.analyst` owns the missing capability-model or single-capability justification in BUG-023 `spec.md`. |
| `BUG023-G089-DEPENDENCY` | Required planning reconciliation | `bubbles.plan` must reconcile the declared dependency on in-progress Feature 031 with the scenario order that closes BUG-023 before Feature 031. |
| `BUG023-G022-PHASE-CHAIN` | Required workflow evidence | The registry-required regression, simplify, gaps, harden, stabilize, devops, security, validate, and audit dispositions are not certified. |
| `BUG023-G027-SCOPE-CERTIFICATION` | Required execution-state reconciliation | The scope artifact and execution progress remain In Progress, so validate cannot populate completed scopes. |
| `BUG023-CHECK-4-SCENARIO-STATES` | Required planning reconciliation | Scenario and test-plan execution-state metadata still describes planned tests. |
| `BUG023-CHECK-9-EVIDENCE` | Required evidence reconciliation | The transition guard did not accept the full evidence set for terminal delivery. |
| `BUG023-G136-HUMAN-ACCEPTANCE` | Human-owned | The Checklist remains unchecked. No agent inference or checkbox mutation occurred. |
| `XRL-PATH-GUARD-HIST-001` | Blocking external | Existing packet `specs/_bugs/BUG-024-spec-path-historical-report-leak` routes to `bubbles.design`. |
| `XRL-BUG017-DOD-001` | Blocking external | Existing BUG-017 Scope 02 routes to `bubbles.implement`. |
| `F031-TP-01-08-STALE-INVENTORY` | Independent external | Feature 031 test ownership must reconcile its digest expectation with the accepted BUG-023 selftest delta. |

BUG-023 remains `in_progress`. Certification status, completed scopes,
certified phases, scenario evidence links, and human acceptance remain unchanged.

## Implementation Attribution On Reconciled Plan

**Phase:** implement

**Claim Source:** executed

The inherited packet was validated against the in-memory 33-node amended
scenario for node `shock-close-bug-023`. The repository binding remained session
`vscode-7fbaa0072aa19f2dad3c4e8b6569c268`, decision
`rb:vscode-7fbaa0072aa19f2dad3c4e8b6569c268:1:node:shock-close-bug-023`, control
revision `1`, and control digest
`sha256:091ebb74a3dc57bfab99a63219b3f1e4662c1e5f3cea94fafc5dd801352f47ac`.
No scenario bytes were persisted.

The reconciled plan matches the existing implementation exactly. This phase did
not rewrite `scripts/selftest.mjs`. Its SHA-256 remains
`fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439`.

### Current Code Diff Evidence

**Command:** `git status --short -- scripts/selftest.mjs specs/_bugs/BUG-023-options-flow-ready-clock-drift; git diff -- scripts/selftest.mjs; git diff --name-status -- <excluded paths>`

**Exit Code:** `0`

**Claim Source:** executed

The full diff showed the planned BUG-023 options-flow hunks and a separate
pre-existing Feature 031 hunk in the same shared selftest. This phase attributed
only the options-flow hunks. It did not modify or absorb the Feature 031 hunk.

```text
 M scripts/selftest.mjs
?? specs/_bugs/BUG-023-options-flow-ready-clock-drift/
BUG023_SELFTEST_DIFF_EXIT=0
BUG023_PROTECTED_DIFF_EXIT=0
```

The BUG-023 hunks construct `flowOwnerState`, require finite
`flowOwnerState.nowMs`, derive age-zero, exact-seven-day, and plus-one-millisecond
instants, pass explicit `asOf` values, preserve the strict production boundary,
and guard ready-only metrics behind `flow.state === 'ready'`. The protected diff
was empty for `scripts/brief-refresh.mjs`, `scripts/owner-state.mjs`,
`rlexperience-adapters/options.js`, `data/options/**`, Feature 031, Horizon
Ladder, registry, navigation, and installed framework paths.

Final scoped status at tool-log row `621` reported four dirty entries:

```text
 M scripts/selftest.mjs
?? rlshock.js
?? specs/031-shock-transmission-foundation/
?? specs/_bugs/BUG-023-options-flow-ready-clock-drift/
```

The untracked `rlshock.js` and Feature 031 directory are pre-existing unrelated
work. They are not an empty-worktree claim and were not modified or attributed
to BUG-023. The tracked protected-path diff remained empty. The complete current
`scripts/selftest.mjs` diff at row `620` contains 171 lines with SHA-256
`0b54baefd2028072b17c6deac93409450f0a37160b80803d78097b5a1af9ac60`; its
separate Feature 031 hunk remains outside this implementation claim.

### Current Input Identities

Focused rows `600` through `602` and bound implementation rows `606` through
`608` share this current input closure:

| Path | SHA-256 |
| --- | --- |
| `scripts/selftest.mjs` | `fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439` |
| `scripts/brief-refresh.mjs` | `464fec252ecdd7cc2789e8de45315f6cafe039dab885c1a86133bd951ea9544c` |
| `scripts/owner-state.mjs` | `33d22cd8244c6de6f9ce88773bb37886b3470809b54b6e2e2e261c63ed2f50a3` |
| `rlexperience-adapters/options.js` | `416ef1b489da49e407eee79de8415ea562aacf5a920d3e9ccc96338e77e1cb3e` |
| `options-flow-feed-lab.html` | `f3a8cfe4398ac0be3a666fd3190118bc19f166e17278d3609a2f6a5f9f2cdc26` |
| `market-brief.config.json` | `9375fbf40d3c39f8257cf6c6ffb397cf06d0c4d169e6ec7f9ad1dec5aa0dfd70` |
| `spec.md` | `110d01a7797910d2336b1e33173013baeaf5216f0e68e2b80a8e19e3d10c35a0` |
| `design.md` | `754f6cdcd56536c36e3fab03e983aba3db35b02bb870772cff37f501f4235235` |
| `scopes.md` | `c46f06b8ba95d276c87d1f73e42b819b49516d849daffe9f9df38cd145e67eab` |
| `test-plan.json` | `d0bb9493ff585e7d18f2d0a034f17add71fdea71dc4c245853d5887b40f3732d` |
| `scenario-manifest.json` | `764900e71b393ff73b2609766a3c455a56fc9b44503b31c05153707e662653ef` |

The three production-owner hashes equal the earlier implementation epoch. The
specification, scope, test-plan, and manifest hashes are the reconciled planning
identities rather than the superseded identities on rows `468` through `470`.

### Current Focused Implementation Receipts

Each command executed the real page parser, owner-state builder, production
options-flow builder, and anomaly model. These are implementation-owned
attribution receipts. They are not independent test certification.

| Test row | Scenario | Bound tool-log row | Exit | Tool-log stdout SHA-256 | Full output SHA-256 |
| --- | --- | ---: | ---: | --- | --- |
| `TP-BUG023-01` | `SCN-BUG023-001` | `606` | `0` | `3f48f0ca0f707b61e3cc566141aab9e1744f5a89965d0a7d0425714ff7538e2e` | `f75d38d9650673c83b774ec7f4880ba05ceac503ef8f9cdbbc222b2be5e40ce8` |
| `TP-BUG023-02` | `SCN-BUG023-002` | `607` | `0` | `9d3e53120e0d536ff15d24e5572edf9f5c5be86e1fac5a1d940e2b29eaeacc6a` | `75e76ee61163bdc51c40400f8756d026ee455254898f57e92ba161af7925a738` |
| `TP-BUG023-03` | `SCN-BUG023-003` | `608` | `0` | `f103a0c97fde55043b7b7fa5cd2261c16bac28cb175e11b020f30e93e665af44` | `553a96d13ce509c9d1173c19e466105490315e80c3b62c3d7863a2dd0340292a` |

All three receipts have empty-stderr SHA-256
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
They carry a complete `scenarioBinding` with phase `implement`, the matching
scenario and assertion identity, the exact planned negative control, source
revision `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`, and implementation ref
`scripts/selftest.mjs`. Row `605` is a complete duplicate `SCN-BUG023-001`
receipt from the interrupted retry and is retained but not used as the evidence
anchor. Rows `600` through `602` remain valid focused behavior output but are not
state-advancing because they predate the structured binding correction.

```text
TP-BUG023-01: STATE=unavailable METRIC_KEYS=reason,state READY_ONLY_KEYS=none RESULT=PASS
TP-BUG023-02: AGE_ZERO_STATE=ready BOUNDARY_STATE=ready BOUNDARY_OUTPUT_IDENTICAL=true RESULT=PASS
TP-BUG023-03: PLUS_ONE_MS_STATE=unavailable READS_MAP_CLOCK_PINNED=true READY_METRICS_STATE_GUARDED=true RESULT=PASS
```

### Scenario-State Handoff Check

**Command:** `bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-023-options-flow-ready-clock-drift --changed-file scripts/selftest.mjs --require IMPLEMENTED --certifiable --format text`

**Exit Code:** `1` at tool-log row `609`

**Claim Source:** executed

**Interpretation:** The corrected resolver output contains no missing-binding
refusal for any BUG-023 implementation receipt. All three scenarios remain
`PLANNED` with `IMPLEMENTED` in `BLOCKED_NOT_RUN` because no receipt-bound RED
exists yet. This is the planned next test-phase prerequisite, not an
implementation pass. The command also reports pre-existing malformed Feature
031 receipts and superseded BUG-022 revision drift, neither of which this phase
changes or absorbs.

```text
SCN-BUG023-001  state=PLANNED  derived=[PLANNED]
  BLOCKED_NOT_RUN: IMPLEMENTED
SCN-BUG023-002  state=PLANNED  derived=[PLANNED]
  BLOCKED_NOT_RUN: IMPLEMENTED
SCN-BUG023-003  state=PLANNED  derived=[PLANNED]
  BLOCKED_NOT_RUN: IMPLEMENTED
UNSATISFIED IMPLEMENTED does not hold for SCN-BUG023-001
UNSATISFIED IMPLEMENTED does not hold for SCN-BUG023-002
UNSATISFIED IMPLEMENTED does not hold for SCN-BUG023-003
certifiable: no
```

The complete resolver output SHA-256 is
`e247ae245c1b85de0b7c325d6cbf997cbc2f1663968e59a14e10597bc9bbc27d`.

### Implementation Validation Receipts

**Phase:** implement

**Claim Source:** executed

| Check | Tool-log row | Exit | Tool-log stdout SHA-256 | Full output SHA-256 | Result |
| --- | ---: | ---: | --- | --- | --- |
| Artifact lint | `610` | `0` | `c9cb8f0bb78912afb9bc25cf9d94d05b9534c48e3e15b98a279dee3bd5dcac50` | `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` | All 40 artifact and anti-fabrication checks passed. |
| Traceability guard | `611` | `0` | `128c08c27fcb83ddbd4677dd06e83ef531d5c9fadce9b175a8224b258b62bc6e` | `581d81acd4b04fd2cc7e8498a7a7ade64eaa3a7ba64ef926d6478b54127cc29d` | Three scenarios, seven rows, three concrete tests, and three DoD mappings passed with zero warnings. |
| Implementation reality scan | `612` | `0` | `d16cb4d5e0939d1f4df602e68d0470d17d300f7296e3e6e0b3a5cb6f4c9e15d7` | `ac91cd45ce32958c58d4f91b12ecac0c187fd9c8e0dbac9a9d53f1db766a93d1` | Four files scanned with zero violations. One warning reports design fallback because the scanner did not resolve implementation paths from the scope table. |
| Regression quality guard | `615` | `0` | `def0fc50a8aed0fd77f2103b4187a6746ae46675e07e42ae8fbac8752cb93f53` | `0d37b489bb6b14d34417efa31994b327de2cc0675fd3b0f97b8a067af2933188` | One selftest file scanned with an adversarial signal, zero violations, and zero warnings. |

Row `613` exited `127` because the historical
`bugfix-regression-quality-guard.sh` path is absent from this installation. Row
`614` exited `2` because the current guard expects test paths rather than a spec
directory. Row `615` uses the script's declared exact form,
`regression-quality-guard.sh --bugfix scripts/selftest.mjs`, and supersedes both
setup attempts. Neither failed invocation supports a completion claim.

The Test Plan declares no `observabilityWorkflow`, and every row has
`liveSystem: false`. Implement check I6 is therefore not applicable. The scope
remains in progress because independent RED, GREEN, canary, restore, repository
E2E, broader regression, certification, and human acceptance are not claimed by
this phase.

### Implementation Finding Accounting

`F031-BROAD-OPTIONS-FLOW-001` is addressed on the reconciled planning identities
by focused rows `600` through `602` and bound implementation rows `606` through
`608`. The implementation-attribution request is resolved. Receipt-derived
`IMPLEMENTED` remains covered by `BUG023-CHECK-9-EVIDENCE` until test-owned RED
receipts establish the required predecessor state.

The following findings remain unresolved and outside this implementation claim:

- `BUG023-G022-PHASE-CHAIN`
- `BUG023-G027-SCOPE-CERTIFICATION`
- `BUG023-CHECK-9-EVIDENCE`
- `BUG023-G136-HUMAN-ACCEPTANCE`
- `XRL-PATH-GUARD-HIST-001`
- `XRL-BUG017-DOD-001`
- `F031-TP-01-08-STALE-INVENTORY`

BUG-017, BUG-024, and Feature 031 `TP-01-08` retain their existing owners. The
next owner is `bubbles.test` for independent scenario-bound RED, GREEN, canary,
restore, scenario-specific repository E2E, and broader regression evidence.
BUG-023 remains `in_progress`; certification and human acceptance are unchanged.

## Independent Test Phase On Additive Node shock-close-bug-023

**Phase:** test

**Claim Source:** executed

The inherited packet was validated against an auto-deleted 33-node amendment of
the three-stream scenario. The amended graph SHA-256 was
`3eef8b821d17f0c1d10df575edfe5571dd78e6fb9489a6000a0be9e702726dee`.
Scenario compile lint exited `0`, and repository packet validation exited `0`
for session `vscode-7fbaa0072aa19f2dad3c4e8b6569c268`, decision
`rb:vscode-7fbaa0072aa19f2dad3c4e8b6569c268:1:node:shock-close-bug-023`,
control revision `1`, and control digest
`sha256:091ebb74a3dc57bfab99a63219b3f1e4662c1e5f3cea94fafc5dd801352f47ac`.
No preflight ran, and no scenario bytes were persisted.

### Current Input And Plan Contract

Tool-log row `658` recorded the 11-file source and planning closure at exit `0`.
Its tool-log stdout SHA-256 is
`07d2039f171d3446312358f8686a27ae45b672e5e4ed2fa28cbc0978ea506229`,
and the complete identity output SHA-256 is
`d90f3378bd569a2d2fcd69e3d5b5240051f7663d09d6ef4932850ddee66010c3`.

```text
fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439  scripts/selftest.mjs
464fec252ecdd7cc2789e8de45315f6cafe039dab885c1a86133bd951ea9544c  scripts/brief-refresh.mjs
33d22cd8244c6de6f9ce88773bb37886b3470809b54b6e2e2e261c63ed2f50a3  scripts/owner-state.mjs
416ef1b489da49e407eee79de8415ea562aacf5a920d3e9ccc96338e77e1cb3e  rlexperience-adapters/options.js
f3a8cfe4398ac0be3a666fd3190118bc19f166e17278d3609a2f6a5f9f2cdc26  options-flow-feed-lab.html
9375fbf40d3c39f8257cf6c6ffb397cf06d0c4d169e6ec7f9ad1dec5aa0dfd70  market-brief.config.json
110d01a7797910d2336b1e33173013baeaf5216f0e68e2b80a8e19e3d10c35a0  spec.md
754f6cdcd56536c36e3fab03e983aba3db35b02bb870772cff37f501f4235235  design.md
c46f06b8ba95d276c87d1f73e42b819b49516d849daffe9f9df38cd145e67eab  scopes.md
d0bb9493ff585e7d18f2d0a034f17add71fdea71dc4c245853d5887b40f3732d  test-plan.json
764900e71b393ff73b2609766a3c455a56fc9b44503b31c05153707e662653ef  scenario-manifest.json
```

Tool-log row `659` exited `0` and verified exactly six Test Plan rows, exactly
three scenario IDs, functional and non-live classification for every row,
negative controls for every row, and concrete row plus linked-test bindings for
every scenario. Its tool-log stdout SHA-256 is
`4efd7c17836c7f7b14397baf837b2427ffc429419e4c1bc904220156ebe901ce`,
and its complete output SHA-256 is
`fdcd3c5b16cba33abf885223028d4af3f752cd3744f5e92b297da0d166ce093f`.
Linked-test resolution at row `628` exited `0` for all three named assertions.

### Scenario-Bound RED And Targeted GREEN

All RED and GREEN receipts use source revision
`d0c09a3ec90d2bb72920caee9e44f1d5f697c619`, the same 11-file input closure,
the scenario's exact test identity, and the same negative control on both sides
of each chain.

| Test row | Scenario | RED row / exit / tool-log SHA-256 / full-output SHA-256 | GREEN row / exit / tool-log SHA-256 / full-output SHA-256 | Outcome |
| --- | --- | --- | --- | --- |
| `TP-BUG023-01` | `SCN-BUG023-001` | `629` / `1` / `52c42c018828101bd1b2883de67a0466823397eea8a5e14e4ed83ddf7b5e4f24` / `672f511bff9a4eb1e7a6400821632eb2cd4884f2c738b223503ce06b77ac3774` | `633` / `0` / `3f32400f75070b7b9c415a4732537582e3e1e776377e2f23450315a3d8ff6801` / `f75d38d9650673c83b774ec7f4880ba05ceac503ef8f9cdbbc222b2be5e40ce8` | RED discriminator and targeted GREEN both observed |
| `TP-BUG023-02` | `SCN-BUG023-002` | `630` / `1` / `720ae5c6007bae541ef5719f5aa8d91f8aebeea2e6d6000a5b5cc83c2f974b45` / `6bb99f920deadf1d708aafc63ba5df950f4b7a798dd88c159b299f5304f061cc` | `634` / `0` / `3ef4cc10c39a4e2bd30b7cd1b666a983b9a5c872b47993f411e7c20fbfddc7ba` / `75e76ee61163bdc51c40400f8756d026ee455254898f57e92ba161af7925a738` | RED discriminator and targeted GREEN both observed |
| `TP-BUG023-03` | `SCN-BUG023-003` | `631` / `1` / `88d1c3591b5c0f32eb6a56bb6ac1697159d6a942bd0fdf1ead886b4fe4522a79` / `41ecfee3d413dd3661e6ecc609c4a3ec5c364c2203949a679faef696fa063dea` | `635` / `0` / `b2c3b669abf8a1016e1e8f4d6233bfef25afd6550c243f6ad43766cfb19d4beb` / `553a96d13ce509c9d1173c19e466105490315e80c3b62c3d7863a2dd0340292a` | RED discriminator and targeted GREEN both observed |

The corrected isolated resolver at row `648` exited `0`. Its tool-log stdout
SHA-256 is
`7742a1aac56fa1262cc52e65704f76636f2e70782fa9120e9a9d9f81edd20950`,
and its complete output SHA-256 is
`8707ffdb8caf6d19996561281919d052b37d79e3c22918e86e4e0523a09c3242`.

```text
SCN-BUG023-001  state=GREEN_TARGETED  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED]
SCN-BUG023-002  state=GREEN_TARGETED  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED]
SCN-BUG023-003  state=GREEN_TARGETED  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED]
certifiable: yes
```

Row `647` is excluded from the GREEN claim. It supplied `--changed-file` after
revalidation, which intentionally invalidates matching GREEN states and exited
`1`. Row `648` uses the resolver's post-revalidation form and supersedes that
invocation.

### Canary And Restore Evidence

| Check | Tool-log row | Exit | Tool-log stdout SHA-256 | Full-output SHA-256 | Result |
| --- | ---: | ---: | --- | --- | --- |
| Pre-canary owner and harness hashes | `636` | `0` | `0e11f512c0d4615c7aac7449bff8258c53e3d91ae2e7c2bd5d937f219320c8ab` | `f82908e276d7a8cc71b1b3850377d133f146f8dbd95f759b50f9a13203208490` | Stable identity captured |
| Exact seven-day negative canary | `637` | `1` | `747fb5e4d0fe09517086146da5ee69f5f2369598cb445d68223c65469ce9c295` | `a7d2e4cd0557f435aac9741d85baa98ef00e67993e089809f1d6fe676f184b47` | Printed `BUG023_SHARED_HARNESS_CANARY=FAIL` as required |
| Unchanged positive canary | `638` | `0` | `824eecf6e5011abf75d45735a839634b8d5bc41478020065b0451368dccfc016` | `a70a93aa199e2edd4e7e11cf4138c2056af8a9542fc70d0256d015b7e869cd7f` | Printed `BUG023_SHARED_HARNESS_CANARY=PASS` |
| Post-canary owner and harness hashes | `639` | `0` | `df29741c0cbd4f4ed933e8db97107af9885ba912cd245d5c692d77b2c8dfaec8` | `f82908e276d7a8cc71b1b3850377d133f146f8dbd95f759b50f9a13203208490` | Pre/post hashes match |

The selftest SHA-256 remained
`fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439`.
No restore mutation was necessary.

### Required Repository Rows And Test Verdict

`TP-BUG023-04` ran one real repository process through three nested scenario
receipt carriers. Rows `640`, `641`, and `642` each retain exit `1`; their shared
tool-log stdout SHA-256 is
`1c1bc3134532ccc4586c77d73f4c7ee938a58dfe3a70723a68d845b6f5120ef3`,
and the complete selftest output SHA-256 is
`d790ede8e1cc79ba4b8000a65d0b73e98e3440318ba6fdb6e0f666f6a1f54435`.
The command reported `3469 passed, 2 failed`. The row is **FAIL**, because its
required exact command was nonzero even though neither failure was an
options-flow assertion.

`TP-BUG023-05` at row `643` also exited `1`, with tool-log stdout SHA-256
`e4631c0be19168cb2972fe7ee8e13986a73fef76456f2fa564e97ff8bb84a4d7`
and complete output SHA-256
`56efe8bbbea850de217ee63e4f1ac9c9f520306038281c7f60d8290394da36f2`.
It reported the same `3469 passed, 2 failed` summary. The broader row is
**FAIL** and is not scenario-state evidence for `REGRESSION_GREEN`.

The isolated `REGRESSION_GREEN` check at row `649` exited `1`, with complete
output SHA-256
`588fef45fa41d29d372b009593e7218ec7ab53ffb7b10f777c2ca97de428d75f`.
The canonical full-log check at row `650` exited `1`, with complete output
SHA-256
`a777f414fade19d0c347db40f97abee7e06d1ee36b8cbbb5e3fdf078413f1614`.
Both checks leave all three BUG-023 scenarios at `GREEN_TARGETED` and report
`REGRESSION_GREEN` unsatisfied.

**Test verdict:** `NOT_TESTED`. Targeted GREEN and the canary/restore contract
pass, but required rows `TP-BUG023-04` and `TP-BUG023-05` are nonzero.

### External Finding Accounting

| Finding | Current receipt | Observed result | Current owner |
| --- | --- | --- | --- |
| `XRL-PATH-GUARD-HIST-001` | Row `644`, exit `1`, tool-log SHA-256 `87f020d017cada5b8972c4106be197fad9497ac63ba42cb669649651f458d4c7`, full-output SHA-256 `213a97e089214604b1685db792792a969fd2ecceeca78d5d94d89c6527becd0c` | One new historical reference to absent `tests/shock-transmission.resource.test.mjs` | BUG-024, `bubbles.design` |
| `XRL-BUG017-DOD-001` | Row `645`, exit `1`, tool-log SHA-256 `a6995c94939c776f6ca14ccf028512e62de3a367f2d5132c1fb1ea79ac4b2928`, full-output SHA-256 `af0c0630449de65a3a9835e03914a8419c7033dc4fcf7c4d0351bac7a3d304b0` | BUG-017 Scope 02 certification says `9/0`; its artifact says `9/2` | BUG-017, `bubbles.implement` |
| `F031-TP-01-08-STALE-INVENTORY` | Row `646`, exit `1`, tool-log SHA-256 `4f4ae35bc9de6b9ac634a81269cf7ab047976a757c746ddd078fbbbb3f82ff89`, full-output SHA-256 `7ef48077814e67d6dce9ebdd4f9a1da05560ca8233c70aacf46ba40ffebdd8f0` | Expected digest `98605f...`; current inventory digest `8c9500...` | Feature 031 test ownership |
| Feature 031 scenario-receipt bindings | Row `650`, exit `1` | Existing `SCN-031-*` GREEN receipts omit test identity and negative control | Feature 031 workflow |
| BUG-022 receipt revision drift | Row `650`, exit `1` | Existing `SCN-BUG022-008` receipts cite `fa9be9d...` rather than current `d0c09a3...` | BUG-022 workflow |

No external artifact was edited or absorbed into BUG-023.

### Test Integrity And Boundary Checks

| Check | Tool-log row | Exit | Tool-log stdout SHA-256 | Full-output SHA-256 | Result |
| --- | ---: | ---: | --- | --- | --- |
| Artifact lint | `651` | `0` | `ac58356a0186ecd7004dab88954cf752023d8c135471a3801cd1bc3925336cd4` | `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` | Passed |
| Traceability guard | `652` | `0` | `1e7b9499548df68cf93396265e7aa50021261ab97c79e1a351b129f00741ebf3` | `fa3d1f4297d258b16b9da44216378ff3c78e26fdecd02cb7e544a0c9b1f43699` | Passed with zero warnings |
| Bugfix regression-quality guard | `653` | `0` | `70ac727f40c717f0f9e8efdfc42a4bf74a2f0421d6e0caaccbe1b86eabd6ae49` | `50618a4aadcfbed290cfd1a147c105fd0c119b417cc916cd7b5bb50871b86e84` | One adversarial file, zero violations |
| Corrected protected tracked-path diff | `655` | `0` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | Empty output by contract | No protected tracked diff |
| Scoped status inventory | `656` | `0` | `643a1e46941cf884538646057a3fd5594d4bf984f5dcfad37f939f2a91d552c2` | `09044474fe686fe4441e1290720f4e766b9443ad7c41a1c59348e482e7c6d742` | Preserved BUG-023 versus Feature 031 ownership |
| No-skip marker check | `657` | `0` | `716efe44086ac3237fc1f52640b677510a13859b82c1bdfac0dde7a2c22e24b2` | `98b6782aaf52efb8098fe524c8fdb35f8aeb403cebd914974ff83f4740838b53` | Eight marker classes, zero matches |

Row `654` is excluded. Its underlying protected-path diff exited `0`, but the
capture helper mishandled an empty stream and emitted arithmetic errors. Direct
tool-log row `655` supersedes it and records the unchanged empty-output hash.

The Test Plan declares no live-system row and no `observabilityWorkflow`.
Mock/live-stack and trace/SLO checks are therefore not applicable. The three
executed mutation controls establish non-vacuity for the changed behavior.

### Test Phase Finding Accounting

`F031-BROAD-OPTIONS-FLOW-001` is independently verified through the three fresh
RED/GREEN chains and the direct owner canary. The following findings remain
unresolved:

- `BUG023-TP-04-NONZERO`
- `BUG023-TP-05-NONZERO`
- `BUG023-REGRESSION-GREEN-UNSATISFIED`
- `BUG023-G022-PHASE-CHAIN`
- `BUG023-G027-SCOPE-CERTIFICATION`
- `BUG023-CHECK-9-EVIDENCE`
- `BUG023-G136-HUMAN-ACCEPTANCE`
- `XRL-PATH-GUARD-HIST-001`
- `XRL-BUG017-DOD-001`
- `F031-TP-01-08-STALE-INVENTORY`
- Feature 031 scenario-receipt binding debt
- BUG-022 scenario-receipt revision drift

The test phase does not route to `bubbles.regression` because the required
repository rows are nonzero and `REGRESSION_GREEN` does not derive. BUG-023
remains `in_progress`; certification and human acceptance remain unchanged.
