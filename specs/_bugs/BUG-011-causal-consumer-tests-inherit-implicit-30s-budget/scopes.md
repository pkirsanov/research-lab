# Scopes: BUG-011 — Declaring The Budget These Tests Actually Need

## Scope 1: 01-declare-owner-reload-budget

**Status:** [ ] In Progress
**Depends On:** none
**Owner:** bubbles.bug (direct-authorized runner; no subagent dispatch surface available this run)

### Change Boundary

| Allowed | Forbidden |
|---|---|
| `tests/causal-rotation-consumers.spec.mjs` — add `test.setTimeout(...)` and one explanatory comment | `playwright.config.mjs` (no `timeout`, no `retries`) |
| This packet's own artifacts under `specs/_bugs/BUG-011-…/` | `sector-research-lab.html`, `global-rotation-lab.html`, `real-assets-lab.html` |
| — | `rlcausalconsumer.js`, `rlviews.js`, `rlapp.js`, `rlnav.js` |
| — | Any file under `specs/015-recommendation-outcome-ledger-and-track-record/` (in-flight uncommitted work) |
| — | Any other spec file under `tests/` |

### Gherkin Scenarios

```gherkin
Feature: BUG-011 Feature 001 consumer regressions run on a declared budget

  Scenario: SCN-011B-001 Every test in the file declares the budget its work needs
    Given tests/causal-rotation-consumers.spec.mjs drives openOwner one to three times per test
    And playwright.config.mjs declares no timeout, so the inherited budget is 30000 ms
    When the file is read
    Then every test declares test.setTimeout as its first statement
    And the declared value is a magnitude already used elsewhere in the repository

  Scenario: SCN-011B-002 The suite is green under its own parallelism
    Given the committed suite runs at four workers and contains a spec file taking 7.0 m
    And the two most expensive tests in this file previously failed in that run
    When the full committed suite is run exactly as the repository runs it
    Then no test in tests/causal-rotation-consumers.spec.mjs fails

  Scenario: SCN-011B-003 The red is removed by giving time, never by checking less
    Given four shortcuts would each turn the red green without verifying the behaviour
    When the committed diff is reviewed
    Then it introduces no retries configuration
    And it marks no test skip or fixme
    And it deletes or weakens no assertion
    And it leaves enterOwnerView byte-identical

  Scenario: SCN-011B-004 Raising an enclosing budget keeps every wait declaration reachable
    Given scripts/validate-playwright-timeout-budgets.mjs enforces BUG-009 INV-009-1
    When the guard runs over the changed tree
    Then it exits zero
    And it reports having scanned a non-zero number of declarations

  Scenario: SCN-011B-005 The suite still tests everything it tested before
    Given the suite total moves with unrelated concurrent work, so it cannot witness this fix
    When the fix commit and the delivered file are inspected after the change
    Then the fix commit deletes no line of tests/causal-rotation-consumers.spec.mjs
    And it adds, removes or renames no test declaration in that file
    And no test in that file is marked skip, fixme or only
    And no test declaration anywhere under tests/ was removed between the fix and HEAD
```

**Scenario correction — `SCN-011B-005` de-pinned.** Its Then-clause asserted `498 tests` — the same
pinned-total defect the last DoD item below was re-baselined off after it went stale twice in one day.
It now asserts the invariant the pin stood proxy for, clause by clause against the four commands that
item already runs; the dated enumerations stay there as observations, not as the asserted condition.

### Implementation Plan

1. Add `test.setTimeout(180_000);` as the first statement of all five tests in
   `tests/causal-rotation-consumers.spec.mjs`.
2. Add one comment above `openOwner()` recording the measured cost, the inherited budget, and the
   honest limitation that the `networkidle` settle remains timing-dependent.
3. Change nothing else.

### Test Plan

| Test Type | Category | File / Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Regression, isolated | `e2e-ui` | `tests/causal-rotation-consumers.spec.mjs` | The file is green on its own after the change | `npx --no-install playwright test tests/causal-rotation-consumers.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes (local HTTP server, real pages) |
| Regression, adversarial | `e2e-ui` | full suite | The file is green under the four-worker contention that produced the red | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line` | Yes |
| Suite inventory | `unit` | full suite | No test removed, skipped, or renamed | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --list` | No |
| Budget coherence guard | `unit` | `scripts/validate-playwright-timeout-budgets.mjs` | No wait declaration became unreachable | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| Repository selftest | `unit` | `scripts/selftest.mjs` | Repository invariants, including the budget guard and the PII scan | `node scripts/selftest.mjs` | No |
| Diff review | `unit` | committed diff | The change is additive only and touches no prohibited surface | `git --no-pager diff` | No |
| Artifact lint | `unit` | this packet | The packet satisfies the Bubbles artifact contract | `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget` | No |

**Adversarial note.** The isolated run is *not* the regression test. It was green before the change
and would stay green if the fix did nothing. The test that can actually fail if the bug is
reintroduced is the **full-suite** run at four workers, because that is the condition under which the
30 s budget was observed to expire. A DoD that ticked only on the isolated run would be tautological.

### Definition of Done — 3-Part Validation

- [x] Every test in `tests/causal-rotation-consumers.spec.mjs` declares `test.setTimeout(180_000)` as its first statement, and the value is an existing in-repo magnitude
  - **Phase:** implement · **Claim Source:** executed, this run (static read at `9af68427b`; no test run)
  - **Command:** `grep -n "test.setTimeout\|^test(\|\.skip\|\.fixme\|\.only" tests/causal-rotation-consumers.spec.mjs` — **Exit Code:** 0
  - The five `test(` declarations sit at lines 124, 158, 195, 222, 250; `test.setTimeout(180_000)` sits at 125, 159, 196, 223, 251 — each the immediately following line, so each is the first statement of its test.
  - **Command:** `grep -rn "180_000" tests/ scripts/ playwright.config.mjs` — the magnitude is already in use here: `tests/attention-browser.spec.mjs:650`, `tests/contextual-tooltip.spec.mjs:26,70,161` and `tests/trend-dynamics-cycle-lab.spec.mjs:987` all declare `test.setTimeout(180_000)`. Nothing new was invented.
  - **Command:** `git log 5c978c5cb..HEAD -- tests/causal-rotation-consumers.spec.mjs` — returns no commits: the delivered file is untouched at `9af68427b`.

- [x] The file passes in isolation after the change
  - **Phase:** implement · **Claim Source:** executed, this run
  - **Command:** `npx --no-install playwright test tests/causal-rotation-consumers.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=line` — **Exit Code:** 0
  - ```
    ISOLATED_AT=6ff62f62c LOAD=22.34 22.24 29.86

    Running 5 tests using 1 worker
      5 passed (1.1m)
    ISO_EXIT=0
    ```
  - **This run is POST-fix, which is the property the item was blocked on.** `git merge-base --is-ancestor 5c978c5cb HEAD` exits **0** at `6ff62f62c`, so HEAD contains the fix commit. Both previously recorded isolated runs — 44 passed at `5d4a8202a`, 44 passed at `ec7787e5a` — are *pre*-fix and remain unusable for this item. It is discharged by performing the missing execution, not by reinterpreting an existing one, and the contended four-worker result is still **not** reused here.
  - **The load average is recorded because contention is the variable under test.** The run above executed at a three-minute load of `22.34 22.24 29.86` on a machine running other work, and still passed on **1 worker** — Playwright's own choice for a single file. That is the isolated condition the item names; it is not, and is not claimed to be, evidence about the four-worker condition.
  - **5 here versus 44 in the earlier isolated evidence is a difference in scope, not a coverage regression.** The `44 passed` figure covered **two** spec files run together, which is what the adjacent item means by "the same two spec files". Verified rather than restated: `grep -cE '^test\('` returns **5** for `tests/causal-rotation-consumers.spec.mjs` and **39** for `tests/fx-regime-relative-value-lab.spec.mjs`, and `5 + 39 = 44` exactly. Re-counted at both commits where the 44 was recorded, via `git show <sha>:<path>`, the split is identical — `5d4a8202a: causal=5 fx=39 sum=44` and `ec7787e5a: causal=5 fx=39 sum=44`. This file has therefore carried 5 tests throughout; nothing was lost between the two measurements because they never measured the same thing.
  - Corroborating that no declaration went missing: the fix commit's diff for this file is 11 insertions / 0 deletions, `git show 5c978c5cb -- tests/causal-rotation-consumers.spec.mjs | grep -cE '^[+-]\s*test\('` is 0, and `git diff 5c978c5cb..HEAD -- tests/causal-rotation-consumers.spec.mjs` is empty (all recorded under later items).
  - **What this tick does not claim.** The adversarial note above still stands in full: this isolated run is not the regression test, it was green before the change, and it would stay green if the fix did nothing. The item that carries adversarial force is the four-worker full-suite one below. This entry closes the isolated criterion only, on its own execution.

- [x] The full committed suite passes with zero failures in `tests/causal-rotation-consumers.spec.mjs`, run at the four-worker parallelism that produced the red
  - **Phase:** implement · **Claim Source:** prior execution, this session — recorded as a reported observation, **not** re-derived by this run
  - **Command (prior execution; NOT run here):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line`
  - **Evidence:** a clean post-fix full-suite run at the suite's own parallelism reported **no failure in `tests/causal-rotation-consumers.spec.mjs` at all** — the first post-fix observation of this file under the exact condition that produced the red.
  - Adversarial force is real, not assumed. Under that same condition *before* the fix: 494 passed / 4 failed at `0e51d602f` with two failures in this file, both `Test timeout of 30000ms exceeded` inside `page.waitForLoadState('networkidle')` at `openOwner`; then 497 / 1 at the next measurement. The same two spec files ran 44 passed in isolation at both `5d4a8202a` and `ec7787e5a` — load dependence, not a code regression. A test that could not fail here would be tautological; this one demonstrably did fail here.
  - **Exactly what this tick asserts.** The discharged criterion is the file-scoped one `SCN-011B-002` states — *"no test in `tests/causal-rotation-consumers.spec.mjs` fails"*. It asserts nothing about the suite's overall tally, which was not recorded and is not claimed.

- [x] The committed diff is additive only, introduces no `retries`, marks no test `.skip`/`.fixme`, deletes no assertion, and leaves `enterOwnerView` unchanged
  - **Phase:** implement · **Claim Source:** executed, this run
  - **Command:** `git show 5c978c5cb -- tests/causal-rotation-consumers.spec.mjs` — **Exit Code:** 0
  - **Evidence:** the diffstat for the test file is `11 +` and `0 -`: six comment lines above `openOwner` and five `test.setTimeout(180_000)` lines. Every hunk is an insertion; no line was removed or rewritten, so no assertion could have been deleted or weakened.
  - `grep` over the file at `9af68427b` for `.skip`, `.fixme` and `.only` returns nothing; `retries` appears nowhere in the diff or in `playwright.config.mjs`.
  - `enterOwnerView` is byte-identical: the added comment sits *after* its closing brace, in the gap before `async function openOwner`. The `page.waitForLoadState('networkidle')` call itself is unmodified and merely shifted six lines — which is the point of the fix, that the wait was never the thing to change.

- [x] `playwright.config.mjs` is unchanged
  - **Phase:** implement · **Claim Source:** executed, this run
  - **Command:** `git show --stat 5c978c5cb`, `git merge-base --is-ancestor c26e4a17e 5c978c5cb`, `git diff 5c978c5cb..HEAD -- playwright.config.mjs` — **Exit Code:** 0
  - **Evidence:** the file does not appear in the fix commit's 11-file diffstat. Its last modification is `c26e4a17e`, which the ancestry check confirms predates the fix. The diff from the fix to HEAD is empty.
  - Read at `9af68427b`, it still declares no `timeout` and no `retries` — the implicit 30 000 ms default the bug is about is still the config-level default, which is why the budget had to be declared per test instead.

- [x] `node scripts/validate-playwright-timeout-budgets.mjs` exits 0
  - **Phase:** implement · **Claim Source:** executed, this run
  - ```
    [timeout-budgets] scanned=67 tests=646 declarations=91 evaluated=91 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
    [timeout-budgets] OK — every declared wait fits the test budget that governs it
    VALIDATOR_EXIT=0
    ```
  - Non-zero declarations scanned (91, all evaluated, none unresolved), which is what `SCN-011B-004` requires beyond the exit code. Raising these five enclosing budgets left no wait declaration unreachable anywhere in the repository.

- [x] `node scripts/selftest.mjs` reports 0 failed and no reduction in assertion count
  - **Phase:** implement · **Claim Source:** executed, this session
  - **Command:** `node scripts/selftest.mjs` — **Exit Code:** 0
  - ```
    ================================================
    Research-Lab self-test: 3064 passed, 0 failed
    ================================================
    SELFTEST_EXIT=0
    ```
  - **Both halves of the item, separately.** *0 failed* is read straight off the tally. *No reduction in assertion count* needs a comparison against the recorded blocker, and it holds on either way of counting:

    | measure | at `9af68427b` (blocked) | at `6ff62f62c` (now) | direction |
    |---|---|---|---|
    | passing assertions | 3012 | 3064 | +52 |
    | total assertions executed | 3027 (3012 + 15 failed) | 3064 (3064 + 0 failed) | +37 |

    The distinction is load-bearing: the passing count alone could rise merely by repairing failures without retaining coverage, so the executed total is given as well. Both rose, so no assertion was dropped to reach green.
  - **Where this was run, stated precisely.** The live working tree carries another session's uncommitted edits under `specs/007-*` and `specs/008-*`; with those present the same command reports `3063 passed, 1 failed` and exits 1, on an unrelated dependency-gate projection check those edits cause. The run above was therefore performed in a clean detached worktree at `6ff62f62c` (`git worktree add --detach <tmp>/rl-head-clean 6ff62f62c`; `git status --porcelain` empty) so the observation describes committed state rather than a third party's in-flight work. Both figures are recorded; the red one is not omitted for being inconvenient.
  - **What this tick does and does not claim.** The 15 failures that blocked this item never named this file, this packet, or a timeout budget, and their disappearance is not this packet's doing. The check that actually governs these budgets, `validate-playwright-timeout-budgets.mjs`, remains green standalone at zero violations (previous item). This records that the named gate is now observably green — not that this packet made it so.

- [x] The BUG-011 fix removed, renamed and skipped no test — asserted over the fix commit and the delivered file, not as a pinned suite total
  - **Phase:** implement · **Claim Source:** executed, this run · **Reformulated — second re-baseline in one day**
  - **REFORMULATED, and the churn is the reason.** This item has been re-baselined **twice within one day**. It was written pinned at `498`; that went stale; it was re-baselined to `597` earlier today at `6ff62f62c`; and by `c5b1fb085` — inside the same hour — it was stale again at `604`. A second correction in a single day is not a coincidence to absorb quietly, and the churn is left visible here rather than smoothed over, because it is the evidence. **The pinned absolute count is the defect.** The item is restated to the invariant it was always a proxy for, which this packet had already named in its own words: *this fix removed, renamed and skipped no test.*
  - **Why a pinned total cannot do this job — it fails in both directions.** It is **over-sensitive**: it goes red whenever unrelated concurrent work adds a spec, which is a fact about other people's commits and has nothing to do with BUG-011. It is also **under-sensitive**, which is the worse half: had this fix deleted three tests in a window where unrelated work added three, the total would still have matched and the item would have ticked green over a real regression. A check that can be both falsely red and falsely green is not a check. The four assertions below are neither — each names one specific way this fix could have cheated, and each is evaluated against the fix commit itself.
  - **The invariant, and the four ways it can be falsified.** Every command was run at `c5b1fb085`; the outputs are this run's.

    ```
    $ git --no-pager show --numstat --format='' 5c978c5cb -- tests/causal-rotation-consumers.spec.mjs
    11      0       tests/causal-rotation-consumers.spec.mjs
    ```
    **Red if** the fix commit deleted or rewrote any line of the spec. `0` deletions means no assertion could have been removed or weakened, because neither is reachable without a deletion.

    ```
    $ git --no-pager show 5c978c5cb -- tests/causal-rotation-consumers.spec.mjs | grep -cE '^[+-]\s*test\('
    0
    ```
    **Red if** the fix added, removed **or renamed** a `test(` declaration. A rename is caught because it surfaces as a `-test(` / `+test(` pair, so counting both signs is what stops a rename passing as a no-op.

    ```
    $ grep -nE '\.(skip|fixme|only)\b' tests/causal-rotation-consumers.spec.mjs
    exit: 1
    ```
    **Red if** any test in the file is skipped, marked `fixme`, or — via `.only` — silently excludes its four siblings. No match at `c5b1fb085`.

    ```
    $ git --no-pager diff 5c978c5cb..HEAD -- 'tests/*.spec.mjs' | grep -cE '^-\s*test\('
    0
    ```
    **Red if** *any* `test(` declaration anywhere under `tests/` was removed between the fix and now. Repo-wide rather than file-scoped, so it also catches a later deletion made elsewhere to keep this packet's file looking clean.

    Supporting: `git --no-pager diff 5c978c5cb..HEAD -- tests/causal-rotation-consumers.spec.mjs | wc -l` is **0**, so the delivered file has not drifted since the fix, and `grep -cE '^test\(' tests/causal-rotation-consumers.spec.mjs` is **5** — the same five declarations the first DoD item located at lines 124/158/195/222/250.
  - **Counts, recorded as dated observations only.** None of these is the assertion; the history is kept because it is what condemns the pinned form:

    | enumeration | commit | status |
    |---|---|---|
    | 498 tests | original baseline, pre-fix | stale |
    | 597 tests in 67 files | `6ff62f62c` | stale within the hour |
    | 604 tests in 68 files | `c5b1fb085` (this run) | will also go stale |

    The last row is measured, not assumed: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --list` reports `Total: 604 tests in 68 files`, and `ls tests/*.spec.mjs | wc -l` independently reports `68`. It is listed with its commit precisely because the next unrelated push will invalidate it — and under this formulation that no longer matters. A `--list` performs no browser or server work, so it did not disturb anything running concurrently.
  - **The growth reconciles exactly, with zero removals.** `git --no-pager diff 5c978c5cb..HEAD -- 'tests/*.spec.mjs' | grep -cE '^\+\s*test\('` is **106** added declarations against **0** removed, and `498 + 106 = 604`. The suite total moved because the suite grew; nothing was lost. At `6ff62f62c` the same arithmetic was `498 + 99 = 597`, and the seven-declaration delta between the two measurements is other sessions' work — this packet's file contributed to neither figure, its drift being zero.
  - **The tick stands on the invariant, not on the number.** It could not have stood on the number: the number was already false at the moment this entry was written.

- [x] Build Quality Gate: artifact lint passes, `report.md` carries no absolute host path, and no issue found during this scope was deferred
  - **Phase:** implement · **Claim Source:** executed, this run
  - **Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget` — **Exit Code:** 0
  - **Command:** a recursive grep of this packet for an absolute operator home-directory prefix — **Exit Code:** 1 (no match). Every path in `report.md` is repository-relative or written `<repo-root>`.
  - **No deferral, and the DoD is now discharged in full on execution.** Re-baselined across sessions from **three** unticked items, to **one**, and now to **zero**. The last one — *"the file passes in isolation after the change"* — was closed by finally performing the post-fix isolated run it had always named (`5 passed`, exit 0, at `6ff62f62c`, recorded above), which is the opposite of deferring it. `grep -c '^- \[ \]'` over this file now returns 0. This count is corrected here rather than left standing, because "one remaining unticked item" had become a false statement about this scope.
  - **The scope Status stays In Progress and `state.json` stays `in_progress` anyway.** A complete DoD is not a status transition. Promotion is owned by the state-transition guard and by validate-side certification, not by a checkbox, and this session did not touch `state.json` — which still carries a blocker note asserting the isolated run "was never performed". That note is stale as of this run and is left intact for its owner to clear, rather than quietly edited here to make the packet look self-consistent.
  - Nothing found in this scope was closed by rewording it: the `networkidle` settle remains timing-dependent, `spec.md` records the condition-based replacement as out of scope rather than as done, and the source comment above `openOwner` states the limitation in the code itself.
