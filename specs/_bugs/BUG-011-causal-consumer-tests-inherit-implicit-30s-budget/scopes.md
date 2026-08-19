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
    Given the committed suite enumerated 498 tests before the change
    When the suite is enumerated after the change
    Then it still enumerates 498 tests with none removed or skipped
```

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

- [ ] The file passes in isolation after the change
  - **Phase:** implement · **Claim Source:** not-run · **Uncertainty Declaration**
  - **Why this stays open:** no post-fix isolated run exists. Both recorded isolated runs — 44 passed at `5d4a8202a` and 44 passed at `ec7787e5a` — are *pre*-fix. Producing the post-fix one requires executing the Playwright suite, which this run was instructed not to do.
  - The contended post-fix result recorded under the next item is deliberately **not** reused here. "In isolation" names a specific execution, and passing under four-worker contention does not license a claim about a run nobody performed.

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

- [ ] `node scripts/selftest.mjs` reports 0 failed and no reduction in assertion count
  - **Phase:** implement · **Claim Source:** executed, this run · **Uncertainty Declaration**
  - **Why this stays open:** the selftest is red. At `9af68427b` it reports `Research-Lab self-test: 3012 passed, 15 failed` and exits 1. The item requires 0 failed, so it cannot be ticked, regardless of who owns the failures.
  - Every failing assertion visible in the captured output belongs to another line of work — `SCN-026-CANARY-02`, `SCN-026-CANARY-04`, `TP-026-5.1`, and the cross-asset and delta checks keyed to a literal `market-brief-payload/v2` stamp. None names this file, this packet, or a timeout budget. **Limitation of that characterisation:** the capture was truncated, so five of the fifteen failures were inspected individually and the rest were not.
  - What *is* established for this packet's concern is narrower and was run standalone: `validate-playwright-timeout-budgets.mjs`, the selftest check that governs these budgets, exits 0 with zero violations (previous item).

- [ ] The suite still enumerates 498 tests
  - **Phase:** implement · **Claim Source:** executed (`git diff --stat 5c978c5cb..HEAD -- 'tests/*.spec.mjs'`) · **Uncertainty Declaration**
  - **Why this stays open:** the claim is no longer true at `9af68427b`, for reasons that have nothing to do with this packet. Since the fix, 20 unrelated spec files changed and roughly 99 test declarations were added — the `lifetime-tax-*` family, `company-intelligence-lab`, `market-brief-cockpit`, `tool-experience`. The suite necessarily enumerates more than 498 now.
  - What is evidenced is the narrower fact the item was written to protect: **this fix removed, renamed and skipped nothing.** Its diff is `11 +` / `0 -` with no change to any `test(` declaration, and the file carries no `.skip`, `.fixme` or `.only`.
  - Re-deriving a current enumeration means invoking Playwright, which this run was instructed not to do. The item is left for whoever re-baselines it against the current inventory rather than silently reinterpreted to fit.

- [x] Build Quality Gate: artifact lint passes, `report.md` carries no absolute host path, and no issue found during this scope was deferred
  - **Phase:** implement · **Claim Source:** executed, this run
  - **Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget` — **Exit Code:** 0
  - **Command:** a recursive grep of this packet for an absolute operator home-directory prefix — **Exit Code:** 1 (no match). Every path in `report.md` is repository-relative or written `<repo-root>`.
  - **No deferral, and the three unticked items above are the proof rather than the exception.** Each is left open with its reason stated, the scope stays In Progress, and `state.json` stays `in_progress`. Nothing found in this scope was closed by rewording it: the `networkidle` settle remains timing-dependent, `spec.md` records the condition-based replacement as out of scope rather than as done, and the source comment above `openOwner` states the limitation in the code itself.
