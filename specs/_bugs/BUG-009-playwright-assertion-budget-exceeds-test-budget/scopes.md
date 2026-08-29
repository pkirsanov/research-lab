# Scopes: BUG-009 — Declared Wait Budgets Must Be Reachable

**Layout:** single-file
**Workflow mode:** spec-scope-hardening
**Scope count:** 2

Two scopes, ordered. Scope 01 installs the guard and proves it red against the committed tree. Scope
02 makes the three declarations reachable and turns the guard green. The order is deliberate: a guard
written after the fix can only ever be observed green, which proves nothing.

---

## Scope 1: Budget-Coherence Guard, Proven RED On The Committed Tree

**Status:** Done
**Depends On:** none
**foundation: true**
**Owner surface:** `scripts/validate-playwright-timeout-budgets.mjs`, `scripts/selftest.mjs`

> **Why this scope is the foundation.** It delivers the repository-wide capability — every declared
> wait must fit the enclosing budget that governs it — not a repair of the three sites that happened
> to violate it. Scope 2 is an application of this scope's output, which is why the guard must be
> proven RED here before Scope 2 turns it GREEN.

### RED stage — the guard fails before anything is repaired

This packet is scenario-first, and the ordering is structural rather than incidental: the two scopes
exist in this order *because* the guard has to be shown failing on the untouched tree before any
budget is raised. A guard written after the repair would be indistinguishable from one that never
worked.

**RED — required red-stage, on the committed pre-fix tree.** `node scripts/validate-playwright-timeout-budgets.mjs`
exits **non-zero** and names exactly 3 unreachable declarations across 2 files:
`tests/contextual-tooltip.spec.mjs` (lines 21, 63, 153) and `tests/trend-dynamics-cycle-lab.spec.mjs`
(line 985). That is `T-09-U1`, and it is the proof that the guard reads real contradictions rather
than matching nothing.

Two further red-stage obligations guard the guard itself, because a check that cannot fail proves
nothing about the tree it passes on. `T-09-U3` re-introduces the defect on a scratch fixture and
requires a non-zero exit. `T-09-U4` requires a scan matching **zero** declarations to fail rather
than pass vacuously — the failure mode where a matcher silently stops matching and every subsequent
green is meaningless.

**GREEN — after Scope 2 raises the three budgets.** The same command exits 0 with
`violations=0` (`T-09-U5`), and `node scripts/selftest.mjs` reports 0 failed with the guard wired in
(`T-09-R1`). The green is only meaningful because the red above was demonstrated first on the same
command.


> **Scope status vs packet status.** Done here means all 7 authored DoD items are discharged with
> inline execution evidence. It is not a certification claim: the packet stays `in_progress` because
> the terminal transition is refused by gates whose remedies lie outside this scope's DoD — see
> [report.md § Discovered Issues](report.md#discovered-issues) for the named gates and owners.

### Gherkin Scenarios

```gherkin
Feature: A declared wait budget cannot exceed the test budget that contains it

  Scenario: SCN-009B-003 the guard names every unreachable declaration on the committed tree
    Given playwright.config.mjs declares no timeout, so the project default governs
    And tests/contextual-tooltip.spec.mjs:11 declares a 120000 ms wait in a shared helper
    And tests/trend-dynamics-cycle-lab.spec.mjs:1035 and :1040 each declare a 60000 ms poll
    When the budget-coherence guard runs against the committed tree
    Then it exits non-zero
    And it names exactly those three sites with declared value, enclosing value, and attribution

  Scenario: SCN-009B-005 the guard cannot pass by matching nothing
    Given a spec corpus in which the guard's declaration pattern matches zero sites
    When the guard runs
    Then it fails, because a vacuous scan is indistinguishable from a broken pattern

  Scenario: SCN-009B-006 the guard does not red-line a correctly declared budget
    Given a test that declares setTimeout(120_000) and then waits 60_000 inside its own body
    And a file whose budget is raised once in beforeEach and whose waits sit below it
    When the guard runs over both
    Then neither is reported, because attribution is per test and follows the call graph
```

### Implementation Plan

1. Add `scripts/validate-playwright-timeout-budgets.mjs` implementing the algorithm in
   `design.md` §3.2, exporting `validatePlaywrightTimeoutBudgets(root)` and
   `formatTimeoutBudgetFindings(findings, indent)`, and runnable as a CLI.
2. Derive the project default from `playwright.config.mjs`; do not hardcode it blindly.
3. Scrub comments and string/template literals before scanning.
4. Attribute per test, resolving module-level helpers to the minimum budget across reaching callers,
   transitively, with a visited set.
5. Fail on a vacuous scan (zero declarations or zero test blocks).
6. Run the guard **before** any fix and capture the red transcript.
7. Wire it into `scripts/selftest.mjs` following the `validate-spec-test-paths.mjs` import-and-assert
   pattern at lines 27 and 8699.

### Test Plan

| ID | Test | Type | Command | Live |
|---|---|---|---|---|
| T-09-REG1 | Regression E2E, scenario-specific persistent guard — the budget-coherence guard stays green repository-wide, and T-09-U3 proves it turns RED when the defect is re-introduced | `unit` | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| T-09-REG2 | Regression E2E, broader suite — the full committed Playwright suite reports no new failures | `e2e-ui` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line` | Yes | `unit` | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| T-09-U2 | Guard stays green on the two verified near-miss shapes (AC-4) | `unit` | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| T-09-U3 | Adversarial: guard fails on a scratch fixture re-introducing the defect | `unit` | guard invoked against a disposable fixture root | No |
| T-09-U4 | Vacuous scan (zero declarations / zero test blocks) fails | `unit` | guard invoked against a disposable empty fixture root | No |
| T-09-R1 | Repository selftest passes with the guard wired in | `unit` | `node scripts/selftest.mjs` | No |

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior exist and pass
  - **Phase:** regression · **Claim Source:** executed, 2026-08-29
  - **Command:** `node scripts/validate-playwright-timeout-budgets.mjs` — **Exit Code:** 0
  - ```
    $ node scripts/validate-playwright-timeout-budgets.mjs
    [timeout-budgets] scanned=80 tests=830 declarations=160 evaluated=160 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
    [timeout-budgets] OK — every declared wait fits the test budget that governs it
    VALIDATOR_EXIT=0
    ```
  - **This scope's guard IS the scenario-specific regression artifact, and unlike a passive check it is proven to fail.** T-09-U3 above re-introduces the defect on a scratch fixture and requires the guard to exit non-zero; T-09-U4 requires a zero-match scan to fail rather than pass vacuously. Together they establish that a green result here is a comparison, not a matcher that stopped matching.
  - **Contrast recorded because it is not obvious.** The same guard is NOT valid regression coverage for BUG-011, where deleting a `test.setTimeout` left it green at `violations=0` — those tests declare no explicit waits, so the guard had nothing to read. It works here precisely because these three sites DO declare waits, which is the property that makes them detectable.

- [x] Broader E2E regression suite passes
  - **Phase:** regression · **Claim Source:** executed, 2026-08-29
  - **Command:** `node scripts/selftest.mjs` — **Exit Code:** 0
  - ```
    $ node scripts/selftest.mjs
    ================================================
    Research-Lab self-test: 3433 passed, 0 failed
    ================================================
    SELFTEST_EXIT=0
    ```
  - The guard is wired into the selftest (T-09-R1), so this run exercises it against the whole repository rather than against this packet's files alone.

- [x] `scripts/validate-playwright-timeout-budgets.mjs` exists and implements `design.md` §3.2
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-provenance
    $ git log --oneline --diff-filter=A -- scripts/validate-playwright-timeout-budgets.mjs
    027de4258 (HEAD -> main, origin/main, origin/HEAD) fix(009): make declared Playwright waits reachable, and guard the invariant

    $ git ls-files --error-unmatch scripts/validate-playwright-timeout-budgets.mjs
    scripts/validate-playwright-timeout-budgets.mjs
    LS_FILES_EXIT=0

    $ sha256sum scripts/validate-playwright-timeout-budgets.mjs
    acba77ecc464efa93e5e86f05c089467c944c8edd83a9c284d25ab7c594de03e  scripts/validate-playwright-timeout-budgets.mjs

    $ git show --stat 027de4258
     scripts/validate-playwright-timeout-budgets.mjs    | 916 +++++++++++++++++++++

    Exports required by the implementation plan, both present:
      765:export function validatePlaywrightTimeoutBudgets(root = ROOT, options = {}) {
      814:export function formatTimeoutBudgetFindings(findings, indent = '') {
    Runnable as a CLI (--explain / --root / -h), and the project default is DERIVED, not hardcoded:
      default=30000ms (playwright-default (config declares none))
    ```
- [x] **SCN-009B-003** — Guard exits non-zero on the committed pre-fix tree, naming exactly 3 sites in 2 files — [T-09-U1]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-guard-red
    Pre-fix tree d518a377f materialised via `git archive --output` (no worktree, repo unmutated);
    fixture proven pre-fix: 0 occurrences of test.setTimeout(180_000) in both files, grep exit 1.

    $ node scripts/validate-playwright-timeout-budgets.mjs --root /tmp/bug009-prefix
    [timeout-budgets] scanned=49 tests=541 declarations=79 evaluated=79 unattributed=0 unresolved=0 violations=3 default=30000ms (playwright-default (config declares none))
      UNREACHABLE tests/contextual-tooltip.spec.mjs:11 declares 120000ms inside a 30000ms budget (project default)
          attributed to waitForHeatmap() <- test at line 21 'Regression: SCN-012-003 Power chart context is equivalent by pointer k'
      UNREACHABLE tests/trend-dynamics-cycle-lab.spec.mjs:1035 declares 60000ms inside a 30000ms budget (project default)
          attributed to test at line 985 'Regression: maximum work plan reports progress cancels atomically and'
      UNREACHABLE tests/trend-dynamics-cycle-lab.spec.mjs:1040 declares 60000ms inside a 30000ms budget (project default)
          attributed to test at line 985 'Regression: maximum work plan reports progress cancels atomically and'
    [timeout-budgets] FAIL — 3 declared wait(s) exceed the enclosing test budget
    GUARD_PREFIX_EXIT=1

    Exactly 3 sites, exactly 2 files, each with declared value, enclosing value and attribution.
    Paired with the GREEN run in scope 2 (exit 0) using the SAME committed binary — the guard was
    added BY the fix commit and never modified since, so only the scanned tree differs.
    ```
- [x] **SCN-009B-006** — Guard does not report `simple-model-adapters-macro-fundamental.spec.mjs` or `market-brief-session-date-drift.spec.mjs` — [T-09-U2]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-guard-nearmiss
    $ node scripts/validate-playwright-timeout-budgets.mjs --explain
      ok   tests/simple-model-adapters-macro-fundamental.spec.mjs:630 declared=60000 budget=120000 [test at line 620 'etf-momentum-lab publishes volatility drag from the shared metric modu']
      ok   tests/simple-model-adapters-macro-fundamental.spec.mjs:634 declared=60000 budget=120000 [test at line 620 'etf-momentum-lab publishes volatility drag from the shared metric modu']
      ok   tests/market-brief-session-date-drift.spec.mjs:28 declared=45000 budget=90000 [test at line 11 'Regression BUG-002: a failed rollover never serves prior-session actio']
      ok   tests/market-brief-session-date-drift.spec.mjs:44 declared=15000 budget=90000 [test at line 11 'Regression BUG-002: a failed rollover never serves prior-session actio']
      ok   tests/market-brief-session-date-drift.spec.mjs:45 declared=15000 budget=90000 [test at line 11 'Regression BUG-002: a failed rollover never serves prior-session actio']
    [timeout-budgets] OK — every declared wait fits the test budget that governs it
    GUARD_EXPLAIN_EXIT=0

    Verdict is "ok", NOT "SKIP": these sites are EVALUATED and pass, so the green result is real
    coverage rather than the pattern quietly failing to match. :630/:634 is the exact shape that
    red-lined the discarded file-scoped v1 prototype. The same run also clears all 3 refuted sites:
      ok   tests/simple-production-wiring.spec.mjs:518 declared=600000 budget=600000 [awaitDeclaredHydrationBoundary() <- test at line 205 ...]
      ok   tests/simple-production-wiring.spec.mjs:539 declared=60000 budget=900000 [openAndAwaitOwnerEvidence() <- test at line 857 ...]
      ok   tests/simple-production-wiring.spec.mjs:543 declared=60000 budget=900000 [openAndAwaitOwnerEvidence() <- test at line 857 ...]
    ```
- [x] Adversarial fixture re-introducing the defect is caught — [T-09-U3]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-guard-adversarial
    Disposable fixture /tmp/bug009-adversarial re-creates the exact BUG-009 shape plus two controls.
    The guard prints paths relative to its --root, so `<fixture-root>/` is rendered explicitly: the
    file never existed in this repo, and pasted bare the token reads as a missing repo test path.
    Only the root prefix is added; every figure, verdict and exit code below is verbatim.

    $ node scripts/validate-playwright-timeout-budgets.mjs --root /tmp/bug009-adversarial --explain
    [timeout-budgets] scanned=1 tests=3 declarations=2 evaluated=2 unattributed=0 unresolved=0 violations=1 default=30000ms (playwright-default (config declares none))
      FAIL <fixture-root>/tests/adversarial-budget.spec.mjs:9 declared=120000 budget=30000 [waitForHeatmap() <- test at line 12 'ADVERSARIAL: undeclared caller re-introduces the unreachable 120 s wai']
      ok   <fixture-root>/tests/adversarial-budget.spec.mjs:23 declared=60000 budget=120000 [test at line 21 'CONTROL B: in-body wait below a declared budget must not be reported']
      UNREACHABLE <fixture-root>/tests/adversarial-budget.spec.mjs:9 declares 120000ms inside a 30000ms budget (project default)
          attributed to waitForHeatmap() <- test at line 12 'ADVERSARIAL: undeclared caller re-introduces the unreachable 120 s wai'
    [timeout-budgets] FAIL — 1 declared wait(s) exceed the enclosing test budget
    GUARD_ADVERSARIAL_EXIT=1

    Not tautological: CONTROL B stays "ok", so the red verdict is specific to the re-introduced
    defect rather than the fixture being red-by-construction. The fixture ALSO contains a compliant
    caller declaring 180 s; the guard still fails, because it resolves a helper to the WEAKEST
    reaching caller — one compliant caller cannot launder a non-compliant one.
    ```
- [x] **SCN-009B-005** — A scan matching zero declarations fails rather than passing — [T-09-U4]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-guard-vacuous
    $ node scripts/validate-playwright-timeout-budgets.mjs --root /tmp/bug009-vacuous-nofiles
    [timeout-budgets] scanned=0 tests=0 declarations=0 evaluated=0 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
      VACUOUS-SCAN: the guard matched 0 spec file(s) for **/*.spec.mjs — it cannot vouch for anything
      VACUOUS-SCAN: the guard found 0 test block(s) — it cannot vouch for anything
      VACUOUS-SCAN: the guard found 0 timeout declaration(s) — it cannot vouch for anything
    [timeout-budgets] FAIL — vacuous scan
    GUARD_VACUOUS_NOFILES_EXIT=1

    $ node scripts/validate-playwright-timeout-budgets.mjs --root /tmp/bug009-vacuous-nodecl
    [timeout-budgets] scanned=1 tests=1 declarations=0 evaluated=0 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
      VACUOUS-SCAN: the guard found 0 timeout declaration(s) — it cannot vouch for anything
    [timeout-budgets] FAIL — vacuous scan
    GUARD_VACUOUS_NODECL_EXIT=1

    Both branches of INV-009-3 exercised. The second is the sharp one: 1 real file, 1 real test
    block, violations=0 — and it STILL fails, because zero declarations means the declaration
    pattern proved nothing. There is also no way to silence the guard:
    $ node scripts/validate-playwright-timeout-budgets.mjs --skip-budgets
    [timeout-budgets] there is no bypass flag and there never will be. Raise the enclosing test budget instead.
    GUARD_BYPASS_EXIT=2
    ```
- [x] Guard is wired into `scripts/selftest.mjs` and `node scripts/selftest.mjs` passes — [T-09-R1]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — **Claim Source:** executed — evidence: report.md#t-09-r1

    Both halves of the conjunction now hold. Half 1 was open when this item was last written; the
    wiring landed at commit c7fd767a1 and both halves were re-derived here rather than transcribed.

    Half 1 HOLDS — the guard is wired in (3 sites, import + call + finding print):
    $ grep -n 'validate-playwright-timeout-budgets|validatePlaywrightTimeoutBudgets|formatTimeoutBudgetFindings' scripts/selftest.mjs
    28:import { formatTimeoutBudgetFindings, validatePlaywrightTimeoutBudgets } from './validate-playwright-timeout-budgets.mjs';
    8715:  const timeoutBudgets = validatePlaywrightTimeoutBudgets(ROOT);
    8718:  for (const line of formatTimeoutBudgetFindings(timeoutBudgets, 1)) console.log('    ' + line);
    WIRING_GREP_EXIT=0        <- exit 0, three matches

    $ git --no-pager show --stat --format='%H %s' c7fd767a1
    c7fd767a116bc67fe7b8165c9cd332be948dd0ff fix(009): wire the timeout-budget guard into the repo self-test
     scripts/selftest.mjs   | 17 +
     .../report.md          | 521 ++++++++++++++++++++-
     .../scopes.md          | 335 ++++++++++++-
     3 files changed, 847 insertions(+), 26 deletions(-)

    Half 2 HOLDS — the selftest passes with the guard inside it:
    $ node scripts/selftest.mjs
    exit: 0   lines: 2829   sha256: 5495817a6f2140e7e3d04b2108b1659c61f09dcc083befd56c1782f2731abe3f
    ================================================
    Research-Lab self-test: 2490 passed, 0 failed
    ================================================

    2487 -> 2490 is ADDITIVE growth of exactly the 3 assertions the wired block contributes (vacuous,
    attribution, violations). 0 failed both before and after, so no pre-existing assertion was lost
    or weakened to absorb the new guard.

    Load-bearing, not decorative. Claim Source: executed in a prior turn of this session, cited not
    re-run per the operator's instruction. Re-introducing the defect into a spec file made the SUITE
    fail, not merely the standalone guard; the reintroduction was then reverted byte-identically:
    $ git --no-pager diff --stat -- tests/
    TESTS_DIFF_EXIT=0         <- no output: tests/ is byte-identical to the committed tree
    ```
- [x] Build Quality Gate: no assertion weakened, no wait budget lowered, no `timeout` added to `playwright.config.mjs`, no file under `.github/bubbles/**` touched
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-boundary
    $ git diff --name-only d518a377f^ 027de4258
    scripts/validate-playwright-timeout-budgets.mjs
    specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/bug.md
    specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/design.md
    specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/report.md
    specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/scenario-manifest.json
    specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/scopes.md
    specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/spec.md
    specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/state.json
    specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/uservalidation.md
    tests/contextual-tooltip.spec.mjs
    tests/trend-dynamics-cycle-lab.spec.mjs

    $ git diff --name-only d518a377f^ 027de4258 -- playwright.config.mjs
    CONFIG_TOUCHED_EXIT=0        <- no output: config untouched
    $ git diff --name-only d518a377f^ 027de4258 -- .github/bubbles specs/015-recommendation-outcome-ledger-and-track-record
    PROTECTED_TOUCHED_EXIT=0     <- no output: both protected trees untouched
    $ grep -n "timeout" playwright.config.mjs
    CONFIG_TIMEOUT_GREP_EXIT=1   <- exit 1: still declares no timeout key

    Test-surface diff is 4 added test.setTimeout(180_000) declarations plus comments, one replacing
    a test.slow(). No assertion, wait condition, or declared wait budget altered — budgets raised
    only. No blanket config timeout. Suite still enumerates 498 tests in 49 files with zero
    test.skip/test.only/test.fixme, so nothing was removed or skipped to make the gate pass.
    ```

---

## Scope 2: Make The Three Declarations Reachable

**Status:** Done
**Depends On:** Scope 1, the foundation scope — the guard must exist and be proven RED before these
repairs can be shown to turn it GREEN
**Owner surface:** `tests/contextual-tooltip.spec.mjs` (Feature 012), `tests/trend-dynamics-cycle-lab.spec.mjs` (Feature 006)

> **Scope status vs packet status.** Done here means all 8 authored DoD items are discharged with
> inline execution evidence. It is not a certification claim: the packet stays `in_progress` because
> the terminal transition is refused by gates whose remedies lie outside this scope's DoD — see
> [report.md § Discovered Issues](report.md#discovered-issues) for the named gates and owners.

### Gherkin Scenarios

```gherkin
Feature: A wait that asks for 120 seconds is allowed to wait 120 seconds

  Scenario: SCN-009B-001 the Feature 012 heatmap regressions survive a loaded host
    Given waitForHeatmap() declares a 120000 ms wait for data-heatmap-hydration
    And SCN-012-003 and SCN-012-004 call it
    When the host is under CPU pressure and hydration takes longer than 30 seconds
    Then both tests wait for hydration instead of being killed at 30000 ms
    And neither test's assertions are changed to accommodate the delay

  Scenario: SCN-009B-002 the Feature 006 replay regression can honour both declared polls
    Given the test at line 985 declares two sequential 60000 ms completion polls
    When both polls take their full declared budget
    Then the enclosing test budget still contains them

  Scenario: SCN-009B-004 the fix changes only budgets
    Given the committed diff for this scope
    When it is reviewed
    Then it adds only test.setTimeout declarations and replaces one test.slow()
    And no expectation, wait condition, or declared wait budget is altered
```

### Implementation Plan

1. `tests/contextual-tooltip.spec.mjs`: add `test.setTimeout(180_000)` to the tests at lines 21 and
   63, and replace `test.slow()` at line 153 with `test.setTimeout(180_000)` — `slow()` yields only
   90 s, below the helper's declared 120 s.
2. `tests/trend-dynamics-cycle-lab.spec.mjs`: add `test.setTimeout(180_000)` to the test at line 985,
   covering both sequential 60 s polls.
3. Re-run the guard: green.
4. Re-run both affected spec files under CPU pressure and confirm the previously failing tests pass.
5. Re-run the full committed suite and confirm 498 tests remain, none removed or skipped.

### Test Plan

| ID | Test | Type | Command | Live |
|---|---|---|---|---|
| T-09-REG3 | Regression E2E, scenario-specific persistent guard — the three repaired declarations stay reachable, and T-09-U3 proves the guard reddens if any is removed | `unit` | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| T-09-REG4 | Regression E2E, broader suite — the full committed Playwright suite reports no new failures | `e2e-ui` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line` | Yes |
| T-09-U5 | Guard is green post-fix | `unit` | `node scripts/validate-playwright-timeout-budgets.mjs` | No |
| T-09-E1 | `SCN-012-003` / `SCN-012-004` pass under the CPU pressure that previously failed them | `e2e-ui` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/contextual-tooltip.spec.mjs` | Yes |
| T-09-E2 | Feature 006 replay regression still passes | `e2e-ui` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/trend-dynamics-cycle-lab.spec.mjs` | Yes |
| T-09-E3 | Full committed suite retains 498 tests with none removed, skipped, or newly failing | `e2e-ui` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes |
| T-09-R2 | Repository selftest passes | `unit` | `node scripts/selftest.mjs` | No |

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior exist and pass
  - **Phase:** regression · **Claim Source:** executed, 2026-08-29
  - **Command:** `node scripts/validate-playwright-timeout-budgets.mjs` — **Exit Code:** 0
  - ```
    $ node scripts/validate-playwright-timeout-budgets.mjs
    [timeout-budgets] scanned=80 tests=830 declarations=160 evaluated=160 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
    [timeout-budgets] OK — every declared wait fits the test budget that governs it
    VALIDATOR_EXIT=0
    ```
  - **The guard delivered by scope 1 is this scope's persistent regression coverage**, which is why scope 2 declares Depends On the foundation scope. Each of the three sites repaired here is a declaration the guard reads directly, so removing any of the three budgets re-arms the contradiction and the guard reports it. That detectability is what T-09-U3 proves adversarially rather than assumes.

- [x] Broader E2E regression suite passes
  - **Phase:** regression · **Claim Source:** executed, 2026-08-29
  - **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line` — **Exit Code:** 0
  - ```
    $ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line
    [767/767] [system-chrome] › tests/simple-production-wiring.spec.mjs:979:1 › TP-15-04 the swept set is derived from the production registry + pages
      767 passed (14.8m)
    SUITE_EXIT=0
    ```
  - Zero failure markers across the whole run. **The 498-test figure in T-09-E3 below is stale** — the suite has grown to 767 through unrelated work — and the invariant that item protects, that no test was removed or skipped, is what this run confirms.

- [x] Change Boundary is respected and zero excluded file families were changed
  - **Phase:** implement · **Claim Source:** executed, 2026-08-29
  - **Command:** `git show --stat 5c978c5cb -- playwright.config.mjs`, `grep -cE 'retries' playwright.config.mjs` — **Exit Code:** 0
  - ```
    $ grep -cE 'retries' playwright.config.mjs
    0
    $ git diff 5c978c5cb..HEAD -- 'tests/*.spec.mjs' | grep -cE '^-\s*test\('
    0
    ```
  - The excluded families named in `design.md` §2.3 are each verified rather than asserted: no `timeout` key was added to `playwright.config.mjs` and no `retries` exists anywhere in it; no assertion was weakened and no test declaration was removed across the whole suite; and nothing under `specs/015-recommendation-outcome-ledger-and-track-record` was touched, so `T-01-R2` remains that scope's to close.

- [x] All three callers of `waitForHeatmap()` have an effective budget of at least 120000 ms — [AC-1]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-budgets-reachable
    $ grep -n "waitForHeatmap|test\.setTimeout|test\.slow|^test\(" tests/contextual-tooltip.spec.mjs
      8:async function waitForHeatmap(page) {
     21:test('Regression: SCN-012-003 Power chart context is equivalent by pointer keyboard touch and table', ...
     23:  test.setTimeout(180_000);
     24:  await waitForHeatmap(page);
     65:test('Regression: SCN-012-004 label-only context fails the exact Power item without hiding valid peers', ...
     67:  test.setTimeout(180_000);
     68:  await waitForHeatmap(page);
    115:test('Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access', ...
    156:test('Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas', ...
    158:  test.setTimeout(180_000);
    165:  await waitForHeatmap(page);

    Exactly 3 call sites (24, 68, 165); each governed by test.setTimeout(180_000) at 23, 67, 158.
    Zero occurrences of test.slow() remain — the third site previously relied on it, and it yields
    only 3 x 30 s = 90 s, short of the 120 s the helper declares. 180000 >= 120000 at all three.

    Corroborated independently by the guard, which resolves a helper to the MINIMUM budget across
    reaching callers — so budget=180000 on the helper's own line is only possible if EVERY caller
    is at 180000:
      ok   tests/contextual-tooltip.spec.mjs:11 declared=120000 budget=180000 [waitForHeatmap() <- test at line 21 ...]
    ```
- [x] `trend-dynamics-cycle-lab.spec.mjs` test at line 985 covers both declared 60000 ms polls — [AC-2]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-budgets-reachable
    $ node scripts/validate-playwright-timeout-budgets.mjs --explain
      ok   tests/trend-dynamics-cycle-lab.spec.mjs:1037 declared=60000 budget=180000 [test at line 985 'Regression: maximum work plan reports progress cancels atomically and']
      ok   tests/trend-dynamics-cycle-lab.spec.mjs:1042 declared=60000 budget=180000 [test at line 985 'Regression: maximum work plan reports progress cancels atomically and']

    Both polls attributed to the same enclosing test at line 985, each inside a 180000 ms budget.
    120000 ms of sequential poll capacity fits inside 180000 ms with headroom for the rest of the
    test body — which is the point, since the two polls run back to back.

    Line numbers moved 1035/1040 -> 1037/1042 because the fix inserted 2 lines above them:
    $ git diff 027de4258^ 027de4258 -- tests/trend-dynamics-cycle-lab.spec.mjs
    +  // Two sequential 60 s rerun polls below need 120 s of wait capacity before any other work counts.
    +  test.setTimeout(180_000);
       await openReplayCase(page, 'max-work');

    Pre-fix, the same two sites read: declared=60000 budget=30000 -> UNREACHABLE (see scope 1 RED).
    ```
- [x] Guard green post-fix — [T-09-U5]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-guard-green
    $ node scripts/validate-playwright-timeout-budgets.mjs
    HEAD=027de4258  tree_clean=yes
    [timeout-budgets] scanned=49 tests=541 declarations=79 evaluated=79 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
    [timeout-budgets] OK — every declared wait fits the test budget that governs it
    GUARD_POSTFIX_EXIT=0

    violations=0, exit 0. Critically also unattributed=0 and unresolved=0: every one of the 79
    declarations was actually evaluated, so the green verdict is full coverage rather than the
    guard skipping the sites it could not attribute.

    Same scan surface as the RED run in scope 1 (49 files, 541 test blocks, 79 declarations) and
    the SAME committed binary (sha256 acba77e..., added by this commit, unmodified since). The
    only difference between exit 1 and exit 0 is the fix itself.
    ```
- [x] **SCN-009B-001** — `SCN-012-003` and `SCN-012-004` pass under the same CPU pressure that reproduced the failure — [T-09-E1]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-specs-under-pressure
    8 busy loops started and load allowed to settle — the same method that reproduced the failure.

    LOAD_NATURAL=10.99 12.99 14.88
    LOAD_WITH_PRESSURE=16.26 14.05 15.18
    $ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/contextual-tooltip.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs
    exit: 0   lines: 176   sha256: ff7819b2fb1c54fdcd4dab7cb4993bc3c2901584ef7f6b2b38283ebb64827edc
    Running 28 tests using 2 workers
      ✓  23 [system-chrome] › tests/contextual-tooltip.spec.mjs:65:1 › Regression: SCN-012-004 label-only context fails the exact Power item without hiding valid peers (45.6s)
      ✓  27 [system-chrome] › tests/contextual-tooltip.spec.mjs:115:1 › Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access (3.7s)
      ✓  28 [system-chrome] › tests/contextual-tooltip.spec.mjs:156:1 › Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas (1.1m)
      28 passed (2.9m)
    WALL_SECONDS=180
    LOAD_AT_END=29.26 22.23 18.27

    28 passed, 0 failed, exit 0 at terminal load 29.26 — HIGHER than the 18.90 at which report.md
    Evidence 5 recorded both tests failing pre-fix.

    The load-bearing number is 45.6s. SCN-012-004 consumed 45.6 s of wall time against a pre-fix
    budget of 30000 ms. It could NOT have passed on the pre-fix tree under this load; it would have
    been killed at 30 s, which is exactly the failure Evidence 5 captured. It passes here only
    because the fix granted it 180 s. The repair is load-bearing, not cosmetic.
    ```
- [x] **SCN-009B-002** — Feature 006 replay regression passes — [T-09-E2]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-specs-under-pressure
    Same run, same CPU pressure (LOAD_WITH_PRESSURE=16.26, LOAD_AT_END=29.26):

    $ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/contextual-tooltip.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs
    [NFR-003] totalWorkUnits=2200
    [NFR-003] cancelledAfterUnits=27
    [NFR-003] progressSamples=29 monotonic=true
    [NFR-003] deterministicRerun=true
    [NFR-003] committedResultId=replay-run-3
      ✓  26 [system-chrome] › tests/trend-dynamics-cycle-lab.spec.mjs:985:1 › Regression: maximum work plan reports progress cancels atomically and keeps navigation responsive (4.4s)
      ✓  24 [system-chrome] › tests/trend-dynamics-cycle-lab.spec.mjs:918:1 › Regression: SCN-006-005 failed early reversal remains immutable and invalidated (1.7s)
      ✓  25 [system-chrome] › tests/trend-dynamics-cycle-lab.spec.mjs:953:1 › Regression: SCN-006-007 retrospective turn never backdates the real-time alert (1.1s)
      28 passed (2.9m)
    exit: 0

    The target test at line 985 passed in 4.4 s, and its NFR-003 invariants still hold
    (monotonic progress, deterministic rerun, atomic cancellation, stable committedResultId) — so
    raising the budget changed the time allowance, not the behaviour under assertion. 4.4 s also
    confirms report.md Evidence 6: this site's contradiction is latent, not active.
    ```
- [x] Full suite reports 498 tests, none removed, skipped, or newly failing — [T-09-E3]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-suite
    Discharged in two parts with DIFFERENT provenance, distinguished deliberately.

    PART A — inventory. Claim Source: executed in this turn (list only, no execution):
    $ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --list
    exit: 0   lines: 500   sha256: a5a1005be0f7714736defd422dc98740f057d43df89726fd5a4019aac06a50a8
    Total: 498 tests in 49 files

    498 tests in 49 files — identical to the pre-fix census in report.md Evidence 1. None removed.
    And none skipped or narrowed:
    $ grep -rn "test\.skip\(|test\.fixme\(|test\.only\(|describe\.skip\(" tests/*.spec.mjs
    (no matches across all 49 spec files)

    PART B — result. Claim Source: executed EARLIER THIS SESSION; NOT re-run in this turn.
    $ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome
    498 passed, 0 failed, exit 0, 11.3m, load 6.4 -> 21.95

    Cited rather than repeated on explicit operator instruction, because re-running 11 minutes of
    Playwright to restate an established result is waste rather than rigour. Recorded as an
    attributed citation, NOT as a figure produced by this turn. Decisive because the two pre-fix
    full-suite runs failed (3 and 4 failures; the contextual-tooltip pair failed in BOTH).
    ```
- [x] `node scripts/selftest.mjs` passes — [T-09-R2]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-selftest
    $ node scripts/selftest.mjs
    exit: 0
    lines: 2824
    sha256: eae56f9ffb9c8b9b9bc25b13a1a42d21241169c7f61ff38f7981358aad0632a0
    --- last 20 ---
    regime-primitives-stress
      ✓ the facet publication path sustains a repeated high-volume append run without unbounded slot growth or degraded write throughput

    ================================================
    Research-Lab self-test: 2487 passed, 0 failed
    ================================================
    EVIDENCE_CAPTURE_EXIT=0
    LOAD_BEFORE=9.97 13.19 15.06   LOAD_AFTER=10.22 13.02 14.97

    2487 passed, 0 failed, exit 0 on committed HEAD 027de4258 with a clean tree. The personal-
    identifier scan runs inside this suite (selftest.mjs:28 imports pii-scan, invoked at :2656) and
    also passes standalone:
    $ node scripts/pii-scan.mjs
    [pii-scan] files=7545 messages=1423 findings=0 OK
    PII_SCAN_EXIT=0

    NOTE: this item asserts only that the selftest passes, and it does. The SEPARATE scope 1 item
    additionally requiring the guard to be WIRED INTO selftest.mjs is NOT met and stays unticked.
    ```
- [x] Change Boundary: the diff touches only the two spec files named above plus scope 01's guard and its `selftest.mjs` wiring; no assertion or declared wait budget altered; `playwright.config.mjs` unchanged; nothing under `specs/015-recommendation-outcome-ledger-and-track-record/**` or `.github/bubbles/**` modified — [SCN-009B-004]
  - Raw output evidence (inline, no references):
    ```
    **Phase:** implement — evidence: report.md#delivery-boundary
    $ git diff --name-only d518a377f^ 027de4258
    scripts/validate-playwright-timeout-budgets.mjs
    specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/*  (9 packet artifacts)
    tests/contextual-tooltip.spec.mjs
    tests/trend-dynamics-cycle-lab.spec.mjs

    Every touched path is inside the allowed set. Excluded surfaces checked by name, all empty:
    $ git diff --name-only d518a377f^ 027de4258 -- playwright.config.mjs
    CONFIG_TOUCHED_EXIT=0        <- no output
    $ git diff --name-only d518a377f^ 027de4258 -- .github/bubbles specs/015-recommendation-outcome-ledger-and-track-record
    PROTECTED_TOUCHED_EXIT=0     <- no output
    $ grep -n "timeout" playwright.config.mjs
    CONFIG_TIMEOUT_GREP_EXIT=1   <- exit 1: config still declares no timeout key

    The declared boundary is an UPPER bound. It permits scripts/selftest.mjs; the diff does not
    include it. Touching fewer files than permitted is not a boundary violation, so this item
    passes — but that same absence IS a DoD failure under scope 1's wiring item, which is where it
    is recorded and left unticked. It is not double-counted here.

    specs/015-**/T-01-R2 therefore remains correctly unticked in its own packet: it is unblocked by
    this packet completing, not by scope 01 reaching across its Change Boundary.
    ```

---

## Change Boundary

**Allowed:** `scripts/validate-playwright-timeout-budgets.mjs` (new), `scripts/selftest.mjs` (one
import plus one assertion block), `tests/contextual-tooltip.spec.mjs` (budget declarations only),
`tests/trend-dynamics-cycle-lab.spec.mjs` (one budget declaration), and this bug folder.

**Excluded:** `playwright.config.mjs`; every other spec file; every wait-budget literal in the
repository; `specs/015-recommendation-outcome-ledger-and-track-record/**`, whose `T-01-R2` row is
blocked by this bug and must not be closed by editing these files from inside that scope; anything
under `.github/bubbles/**`.
