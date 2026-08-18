# Report: BUG-011 — Declaring The Budget These Tests Actually Need

## Summary

The fix designed in `design.md` §2 is **applied in the working tree and not yet verified end to end**.
All five tests in `tests/causal-rotation-consumers.spec.mjs` now declare `test.setTimeout(180_000)`
as their first statement, and one comment above `openOwner()` records the measured cost and the
honest limitation. The repository selftest — which runs the BUG-009 budget-coherence guard — accepts
the new budgets. The full-suite run that would actually prove the defect gone is **in flight and its
result is not yet known**.

- **Changed:** `tests/causal-rotation-consumers.spec.mjs` (uncommitted; five `test.setTimeout`
  declarations plus one explanatory comment), and this packet under
  `specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget/`.
- **Unchanged, deliberately:** `playwright.config.mjs`, `sector-research-lab.html`,
  `global-rotation-lab.html`, `real-assets-lab.html`, `rlcausalconsumer.js`, `rlviews.js`,
  `rlapp.js`, `rlnav.js`, every other spec file under `tests/`, and every file under
  `specs/015-recommendation-outcome-ledger-and-track-record/`.
- **Scenarios validated:** none of `SCN-011B-001` through `SCN-011B-005` is discharged. Every entry
  in `scenario-manifest.json` remains `not_started`, and all nine Definition of Done items in
  `scopes.md` remain unchecked.

**Provenance of every figure in this report.** All Playwright and selftest measurements below were
executed by the **operator** in this session and are recorded here as reported observations. This
agent did **not** re-derive them and did not run any test command, because a full suite was executing
against this tree while the packet was authored and a competing run would corrupt the very timing
measurement the packet depends on. Commands this agent executed itself are tagged as such.

## Completion Statement

**Delivered:** the code change described in `design.md` §2 — `test.setTimeout(180_000)` on all five
tests plus one explanatory comment — present in the working tree, and the three packet artifacts
authored in this run (`report.md`, `uservalidation.md`, `state.json`), completing the eight-artifact
shape `bug.md` declares.

**Not delivered:** the verification that the change works. The adversarial test named in `scopes.md`
— the full committed suite at four workers, which is the only condition under which the 30 s budget
was ever observed to expire — has not produced a post-fix result. Until it does, the claim "the
defect is fixed" is unproven. The isolated run cannot substitute for it: `scopes.md` records that the
file was green in isolation **before** the change and would stay green if the fix did nothing, so an
isolated pass is tautological here.

**The fix's limitation is real and is not closed by this packet.** `waitForLoadState('networkidle')`
remains timing-dependent; only its allowance grew. The comment committed above `openOwner()` states
this in the source itself. `design.md` §3 records why the condition-based replacement was
investigated and rejected — the three owner pages expose no readiness marker, and every available
substitute either resolves too early or can hang — and `spec.md` records that replacement as out of
scope rather than as done.

`state.json` is therefore `in_progress`, with `certification.status` equal to it. No terminal status
is claimed and none is available: nine DoD items are unchecked, no scope is Done, and the decisive
run has not reported.

## Test Evidence

No test command was executed by this agent. The evidence below has two kinds and they are labelled
separately: **operator-executed measurements**, which ground the defect and the partial verification,
and **agent-executed static reads**, which ground what is in the tree right now.

### Pre-fix full-suite failures — the defect, twice

**Executed by this agent:** NO
**Executed by:** operator, this session
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line`
**Claim Source:** operator-executed, not re-derived by this agent

Two full-suite runs on adjacent trees, both pre-fix:

| Tree | Result | Failures in `tests/causal-rotation-consumers.spec.mjs` |
|---|---|---|
| `0e51d602f` | 494 passed, 4 failed | lines 151 and 187 |
| `adb97b983` | 497 passed, 1 failed | line 151 only |

Both failures at `0e51d602f` reported `Test timeout of 30000ms exceeded` inside
`page.waitForLoadState('networkidle')` at `openOwner` (line 114 pre-fix). Those two lines are exactly
the two tests `bug.md` measures at 79% and 58% of the inherited 30 s budget with **zero** contention.

**These two tallies do not agree with each other, and that disagreement is itself evidence.** The
same defect produced two failures in one run and one in the next, on trees whose difference does not
touch this file. `bug.md` independently records a third full-suite observation at `adb97b983`
(496 passed, 2 failed). A defect that reproduced identically every time would be a code regression;
one whose failure count moves between runs of the same suite is load-dependent, which is what this
packet claims. No attempt is made here to declare one of these tallies the correct one.

### The same runs demonstrate suite-wide flakiness independently

**Executed by this agent:** NO
**Executed by:** operator, this session
**Claim Source:** operator-executed, not re-derived by this agent

`tests/fx-regime-relative-value-lab.spec.mjs:1348` failed in the first full run and passed in the
second, with no change between the two runs relevant to that file. That is an independent
demonstration — in a spec file this packet does not touch and does not modify — that the suite's
failures under load are timing-dependent rather than deterministic.

### The suspect files in isolation are green — so isolation proves nothing here

**Executed by this agent:** NO
**Executed by:** operator, this session
**Claim Source:** operator-executed, not re-derived by this agent

The two suspect spec files run on their own: **44 passed** at `5d4a8202a`, and **44 passed** at
`ec7787e5a`. Green on both trees, while the full suite was red on both. This is the measurement that
rules out a code regression and rules in contention, and it is also the reason the isolated run
cannot discharge the adversarial DoD item.

### Post-fix selftest — the budget guard accepts the new budgets

**Executed by this agent:** NO
**Executed by:** operator, this session
**Command:** `node scripts/selftest.mjs`
**Result:** 2490 passed, 0 failed
**Claim Source:** operator-executed, not re-derived by this agent

`scripts/validate-playwright-timeout-budgets.mjs` runs inside the selftest, so this run is the
BUG-009 guard's verdict on the changed tree: raising these five enclosing budgets created no
unreachable wait declaration anywhere. It also confirms no repository invariant was broken by the
edit.

This discharges nothing about the defect itself. It establishes coherence, not that the tests now
survive four-worker contention.

### The change present in the working tree

**Executed by this agent:** YES
**Command:** static read of `tests/causal-rotation-consumers.spec.mjs` (no test executed)
**Claim Source:** executed

All five tests carry the declaration as their first statement, and the line numbers have shifted by
six from those cited in `bug.md` because the six-line comment above `openOwner()` was added:

| Test | Pre-fix line | Post-fix `test(` line | `test.setTimeout(180_000)` line |
|---|---|---|---|
| served owner timing reads … exposure contracts | 118 | 124 | 125 |
| Sector acceleration remains visible … | 151 | 158 | 159 |
| A country causal read disagrees … | 187 | 195 | 196 |
| Energy equities strengthen … | 213 | 222 | 223 |
| consumers reject unknown causal versions … | 240 | 250 | 251 |

`page.waitForLoadState('networkidle')` inside `openOwner` moved from line 114 to line 120 and is
otherwise unmodified — the wait itself was not touched, which is the point. The comment now standing
above the helper states the limitation in the source: *"The settle below is still timing-dependent;
only its allowance grew."*

### Tree state at authoring time

**Executed by this agent:** YES
**Command:** `git rev-parse --short HEAD`, `git status --porcelain`
**Claim Source:** executed

`HEAD` is `adb97b983`. The fix is **uncommitted**: `git status --porcelain` reports
`M tests/causal-rotation-consumers.spec.mjs` alongside two modified files under
`specs/015-recommendation-outcome-ledger-and-track-record/`, which belong to another line of work and
were not touched here, and this untracked packet directory. Recording the dirty tree rather than
cleaning it is deliberate: stashing would disturb that other work, and the operator's post-fix
selftest figure was taken against this same tree.

### Packet shape

**Executed by this agent:** YES
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget`
**Claim Source:** executed

Before this run the lint exited 1 on three missing required artifacts — `uservalidation.md`,
`state.json`, and `report.md`. Authoring those three is what this run delivered. The lint's exit code
after the change is recorded in the packet-shape line of `uservalidation.md` automation readiness.

This is an artifact-contract check. It says nothing whatsoever about whether the defect is fixed.

## Outstanding Verification

One thing is missing, it is the decisive one, and it is not predicted here.

**The post-fix full-suite result is not established.** That run is in flight. No tally is written in
this packet, no placeholder number stands in for it, and the corresponding DoD item in `scopes.md` —
*"The full committed suite passes with zero failures in `tests/causal-rotation-consumers.spec.mjs`,
run at the four-worker parallelism that produced the red"* — is left unchecked. Three further DoD
items depend on that same run or on figures it produces (the isolated pass, the 498-test enumeration,
and the selftest assertion count as re-observed post-change), and they are likewise unchecked.

Until that result exists, the honest description of this packet is: *the change is applied, the
budget guard accepts it, and nothing has yet shown the tests survive the contention that killed
them.*

### Validation Evidence

No validation was performed. No independent party re-derived any measurement in this report, and no
certification is claimed — `certification.completedScopes` and
`certification.certifiedCompletedPhases` are both empty in `state.json`.

### Audit Evidence

No audit was performed. `design.md` and `scopes.md` were authored without dispatch to their owning
specialists, as `bug.md` records, and neither has been reviewed by them.
