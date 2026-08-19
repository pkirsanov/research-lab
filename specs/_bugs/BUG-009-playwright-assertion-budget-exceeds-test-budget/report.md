# Report: BUG-009 — Declared Wait Budgets Must Be Reachable

## Summary

Discovery, reproduction, and root-cause analysis executed 2026-08-18 on an 8-core host under
concurrent load. The investigation confirmed the reported defect at 3 of the 6 reported sites and
**refuted the other 3**. The corrected position is recorded here rather than the reported one.

The fix has since been **delivered and verified** across two commits, `027de4258` (guard + repaired
declarations) and `c7fd767a1` (guard wired into the repository self-test). Sections *Environment*
through *Evidence 9* are the pre-fix reproduction and analysis record and are preserved as written,
with one disclosed wording change noted in [Discovered Issues](#discovered-issues). The
[Delivery Evidence](#delivery-evidence) section that follows them records the fix itself, and is
where every Test Plan row is discharged.

## Completion Statement

**The defect.** Three `expect(...)` calls declared waits of 120 s and 60 s inside tests governed by
Playwright's 30 s project default, because `playwright.config.mjs` declares no `timeout` key. A
declared wait longer than the test that contains it can never elapse — the runner kills the test
first. The declaration therefore reads as coverage and delivers none, and it fails only when the
host is slow enough to actually need the wait. That is the worst failure mode available: green on a
quiet machine, flaky on a busy one, and the flake blamed on the machine rather than the contradiction.

**What was repaired.** Four `test.setTimeout(180_000)` declarations in
`tests/contextual-tooltip.spec.mjs` (Feature 012) and `tests/trend-dynamics-cycle-lab.spec.mjs`
(Feature 006), one of them replacing a `test.slow()` that yielded only 90 s against a 120 s
requirement. Budgets were raised only. No assertion was weakened, no wait shortened, no test skipped,
and no blanket `timeout` added to the config — the repair is confined to the four tests that needed
it, and the suite still enumerates 498 tests in 49 files.

**What now prevents recurrence.** `scripts/validate-playwright-timeout-budgets.mjs` resolves every
declared wait to the budget of the enclosing test — following helper call graphs to the *weakest*
reaching caller, so one compliant caller cannot launder a non-compliant one — and fails when a
declaration cannot fit. It refuses to pass vacuously (zero files, zero tests or zero declarations is
a failure, not a pass) and has no bypass flag. Crucially it is **wired into `scripts/selftest.mjs`**
at commit `c7fd767a1`, so it runs on every repository check rather than on request: an unrun guard
protects nothing, and the invariant would have rotted at the next long wait someone added.

- **Verified:** the guard is RED on the pre-fix tree and GREEN on the post-fix tree using one
  byte-identical committed binary; both repaired spec files pass under the CPU pressure that
  originally broke them; the full Playwright suite is **498 passed, 0 failed**; `node
  scripts/selftest.mjs` reports **2490 passed, 0 failed** — additive growth from 2487, with no
  pre-existing assertion lost.
- **Status:** `in_progress` — all 15 DoD items are discharged and both scopes are Done, but the
  terminal transition is refused by gates whose remedies lie outside this packet's delivered work.
  They are named with owners in [Discovered Issues](#discovered-issues). The blocker is artifact
  shape and human acceptance, not unproven behavior.

---

## Environment

**Claim Source:** `executed`.

```
$ node -e "console.log(require('playwright/package.json').version)"
playwright version: 1.61.1
NODE_EXIT=0

$ nproc / cat /proc/loadavg / free -g
NPROC=8
LOAD=8.34 14.42 17.92 8/2431 158298
               total        used        free      shared  buff/cache   available
Mem:              47          10           4           0          32          36
Swap:             16           0          15
```

Load average 8.34 on 8 cores at the start of the session: the host was already saturated by
concurrent work, which is the condition under which the defect manifests.

---

<a id="root-cause-config"></a>
## Evidence 1 — the config declares no test budget, and the runner confirms 30000 ms

**Claim Source:** `executed`. Evidences root cause §1.1 and §1.2.

`playwright.config.mjs` was read in full: it sets `testMatch` and two projects (`system-chrome`,
`chromium`) with `browserName` / `channel` / `headless` only. There is no `timeout` key at config,
project, or `use` level.

Rather than assume Playwright's documented default, the runner was asked to describe its own
resolved configuration:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --list --reporter=json
configFile: <repo-root>/playwright.config.mjs
config.globalTimeout: 0
projects[].use/timeout:
  project= system-chrome timeout= 30000
  project= chromium timeout= 30000
total tests listed: 498
LIST_EXIT=0
```

> Path note: throughout this report the absolute repository root is recorded as `<repo-root>`. Only
> that machine-specific prefix is redacted, to satisfy this repository's personal-identifier rule.
> Every repository-relative path, line, and column is exactly as the runner emitted it, and those are
> what the evidence proves.

`timeout= 30000` is what the runtime will enforce. 498 tests, matching the suite size referenced by
`specs/015` row `T-01-R2`.

---

<a id="violation-inventory"></a>
## Evidence 2 — the corrected violation inventory

**Claim Source:** `executed`. A prototype analyser was run against all 49 spec files from outside the
repository. Its first version was wrong, and the correction is itself a design finding.

**v1, file-scoped attribution** — largest declaration in a file versus weakest test in that file:

```
$ node /tmp/rl-budget-audit/audit.mjs <repo-root> 30000
project default test budget = 30000 ms
spec files scanned          = 49

VIOLATION contextual-tooltip.spec.mjs                      line 11:   120000 ms vs 30000 ms
VIOLATION simple-model-adapters-macro-fundamental.spec.mjs  lines 630, 634: 60000 ms vs 30000 ms
VIOLATION simple-production-wiring.spec.mjs                 lines 518, 539, 543
VIOLATION trend-dynamics-cycle-lab.spec.mjs                 lines 1035, 1040: 60000 ms vs 30000 ms

violating files = 4
AUDIT_EXIT=0
```

`simple-model-adapters-macro-fundamental.spec.mjs` was then read directly and the report proved
**false**: lines 630 and 634 sit inside the test beginning at line 620, whose first statement is
`test.setTimeout(120_000)` at line 621. 60000 < 120000. File-scoped attribution red-lines correct
code, so it was discarded.

**v2, per-test attribution with helper call-graph resolution:**

```
$ node /tmp/rl-budget-audit/audit2.mjs <repo-root> 30000
default test budget = 30000 ms   spec files = 49

VIOLATION tests/contextual-tooltip.spec.mjs
  line 11: declares 120000 ms but enclosing budget is 30000 ms  [helper waitForHeatmap() <- weakest caller]

VIOLATION tests/trend-dynamics-cycle-lab.spec.mjs
  line 1035: declares 60000 ms but enclosing budget is 30000 ms  [test@985]
  line 1040: declares 60000 ms but enclosing budget is 30000 ms  [test@985]

violating files = 2   violating sites = 3
AUDIT2_EXIT=1
```

---

<a id="refutation"></a>
## Evidence 3 — three reported sites refuted

**Claim Source:** `executed`. Evidences the corrections in `bug.md`.

v2 stopped reporting `simple-production-wiring.spec.mjs`. That was checked against ground truth
rather than trusted:

```
$ grep -n "^test\(|^test\.|test\.setTimeout|test\.slow|openAndAwaitOwnerEvidence|awaitDeclaredHydrationBoundary" tests/simple-production-wiring.spec.mjs
 48: test('Regression: market-heatmap Simple renders the real adapter panel ...')
205: test('TP-15-03 market-heatmap Simple renders real steerable controls ...')
209:   test.setTimeout(600000);
275:   await awaitDeclaredHydrationBoundary(page, 'data-heatmap-hydration');
382:   await awaitDeclaredHydrationBoundary(page, 'data-heatmap-hydration');
512: async function awaitDeclaredHydrationBoundary(page, attributeName) {
537: async function openAndAwaitOwnerEvidence(page, toolId) {
545:   await awaitDeclaredHydrationBoundary(page, 'data-heatmap-hydration');
857: test('TP-15-04 every wired ordinary tool paints its real Simple adapter panel ...')
863:   test.setTimeout(900000);
893:     const settledOwnerEvidence = await openAndAwaitOwnerEvidence(page, entry.toolId);
979: test('TP-15-04 the swept set is derived from the production registry + pages ...')
```

- Line 518's 600000 ms sits in `awaitDeclaredHydrationBoundary`, reached from the test at 205
  (600000 ms) and, via `openAndAwaitOwnerEvidence`, from the test at 857 (900000 ms). Weakest
  reaching budget 600000 ms. Not greater than. **Not a violation.**
- Lines 539 and 543's 60000 ms sit in `openAndAwaitOwnerEvidence`, reached only from the test at 857
  (900000 ms). **Not a violation.**

`tests/simple-models.spec.mjs`, the third reported failure, declares no budget at all:

```
$ grep -n "timeout" tests/simple-models.spec.mjs
GREP_SIMPLE_MODELS_EXIT=1
```

Exit 1, zero matches. Its failure is load starvation, not a budget contradiction, so it belongs to a
different defect class and is not part of this bug's inventory.

---

<a id="repro-natural"></a>
## Evidence 4 — reproduction, natural load: the margins, not the result

**Claim Source:** `executed`. Evidences root cause §1.5.

```
LOAD_BEFORE=7.80 14.01 17.72
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/contextual-tooltip.spec.mjs
exit: 0
lines: 9
sha256: e0f95954d89d4963a72d64053b55979efb9debfddc464d64830e0307a30f4a17
--- output ---
Running 4 tests using 1 worker
  ✓  1 tests/contextual-tooltip.spec.mjs:21:1 › SCN-012-003 ... (12.2s)
  ✓  2 tests/contextual-tooltip.spec.mjs:63:1 › SCN-012-004 ... (26.2s)
  ✓  3 tests/contextual-tooltip.spec.mjs:111:1 › Research charts tables tickers ... (2.2s)
  ✓  4 tests/contextual-tooltip.spec.mjs:152:1 › contextual disclosure fits mobile ... (31.3s)
  4 passed (1.2m)
CAPTURE_EXIT=0
LOAD_AFTER=15.33 14.82 17.69
```

All four passed, and the timings are the finding:

- `SCN-012-004` took **26.2 s** against a 30 s budget — **3.8 s** of headroom.
- The test at line 152 took **31.3 s**, which is **over** the 30 s default. It passed only because it
  declares `test.slow()` (90 s). It calls the **same** `waitForHeatmap()` helper as the two tests
  that fail.

The difference between green and red on identical work is the presence of a budget declaration.

---

<a id="repro-pressure"></a>
## Evidence 5 — reproduction under CPU pressure: the defect itself

**Claim Source:** `executed`. Eight busy loops were started, load allowed to settle, then the two
undeclared callers were run alone.

```
LOAD_WITH_PRESSURE=18.90 15.73 17.87
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/contextual-tooltip.spec.mjs:21 tests/contextual-tooltip.spec.mjs:63
exit: 1
lines: 72
sha256: 65d38d6961cd4a2f9d57a92de46773ae3d369348d67eacaf694ccf5d241b0e56
--- first 20 ---
Running 2 tests using 1 worker
  ✘  1 tests/contextual-tooltip.spec.mjs:21:1 › SCN-012-003 ... (35.2s)
  ✘  2 tests/contextual-tooltip.spec.mjs:63:1 › SCN-012-004 ... (35.2s)

  1) tests/contextual-tooltip.spec.mjs:21:1 › SCN-012-003 ...

    Test timeout of 30000ms exceeded.

    Error: expect(locator).toHaveAttribute(expected) failed

    Locator:  locator('body')
    Expected: "ready"
    Received: "loading"

    Call log:
      - Expect "toHaveAttribute" with timeout 120000ms
      - waiting for locator('body')
--- last 20 ---
    > 11 |   await expect(page.locator('body')).toHaveAttribute('data-heatmap-hydration', 'ready', { timeout: 120000 });
         |                                      ^
        at waitForHeatmap (<repo-root>/tests/contextual-tooltip.spec.mjs:11:38)
        at <repo-root>/tests/contextual-tooltip.spec.mjs:64:3
  2 failed
CAPTURE_EXIT=1
PRESSURE_KILLED_EXIT=0
LOAD_AFTER=26.76 19.25 18.93
```

`Test timeout of 30000ms exceeded` and `Expect "toHaveAttribute" with timeout 120000ms` appear within
a few lines of each other. The runner states the contradiction itself. The observed value is
`"loading"` — the page was still working.

---

<a id="repro-latent"></a>
## Evidence 6 — the Feature 006 site is latent, not active

**Claim Source:** `executed`. Same pressure method, applied to the second violating file.

```
LOAD_WITH_PRESSURE=21.08 18.75 18.77
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/trend-dynamics-cycle-lab.spec.mjs:985
exit: 0
lines: 11
sha256: dbe3baea9f0f907746c6359a1db4e71ad5fa22b754b7b14c3110c43e78f70a06
--- output ---
Running 1 test using 1 worker
[NFR-003] totalWorkUnits=2200
[NFR-003] cancelledAfterUnits=22
[NFR-003] progressSamples=24 monotonic=true
[NFR-003] deterministicRerun=true
[NFR-003] committedResultId=replay-run-3
  ✓  1 tests/trend-dynamics-cycle-lab.spec.mjs:985:1 › maximum work plan reports progress ... (4.4s)
  1 passed (9.9s)
CAPTURE_EXIT=0
```

4.4 s against a 30 s budget. The two declared 60 s polls are nowhere near being exercised, so the
contradiction is real but currently costs nothing. Recorded as latent rather than as an observed
failure.

---

<a id="precedent"></a>
## Evidence 7 — the fix shape is established convention

**Claim Source:** `executed`.

```
$ grep -rhoE 'test\.setTimeout\(' tests/*.spec.mjs | wc -l      → 33
$ grep -rlE  'test\.setTimeout\(' tests/*.spec.mjs | wc -l      → 10
$ grep -rhoE 'test\.slow\('       tests/*.spec.mjs | wc -l      →  5
$ grep -rlE  'test\.slow\('       tests/*.spec.mjs | wc -l      →  4
$ ls tests/*.spec.mjs | wc -l                                   → 49
```

33 `test.setTimeout` call sites across 10 of 49 spec files, including `180_000` at
`attention-browser.spec.mjs:650` and `technical-analysis-decision-lab.spec.mjs:861` — the exact value
the fix needs. The three defective sites omit a declaration the repository already uses widely.

---

<a id="guard-placement"></a>
## Evidence 8 — guard placement follows an existing wiring precedent

**Claim Source:** `executed`.

```
$ grep -n "validateSpecTestPaths|formatSpecTestPathFindings" scripts/selftest.mjs
  27: import { formatSpecTestPathFindings, validateSpecTestPaths } from './validate-spec-test-paths.mjs';
8699:   const specTestPaths = validateSpecTestPaths(ROOT);
8701:   for (const line of formatSpecTestPathFindings(specTestPaths, 1)) console.log('    ' + line);
```

`scripts/validate-spec-test-paths.mjs` also documents two properties this guard adopts: no hardcoded
list and no expected count, and *"A scan that finds ZERO references is itself a failure, baseline or
not."*

No AST parser is available for a stricter implementation:

```
$ ls node_modules | grep -iE '^(acorn|espree|esprima|meriyah)$'
PARSER_GREP_EXIT=1
$ node -e "require('acorn')"
acorn NOT resolvable: MODULE_NOT_FOUND
```

---

<a id="ownership"></a>
## Evidence 9 — the ownership boundary is already recorded upstream

**Claim Source:** `executed`. From `specs/015-recommendation-outcome-ledger-and-track-record/scopes/01-frozen-claim-contract/`:

```
report.md:1652 | Test — T-01-R2, broader E2E regression | Playwright half red at 495 / 498, exit 1
               | Feature 012 owner, for the 30 s / 120 s budget mismatch |
report.md:1567 **6. T-01-R2's Playwright half is red and the row stays unticked.**
scope.md:285   - [ ] Broader E2E regression suite passes unchanged — [T-01-R2] ...
scope.md:265   ... and every neighbouring feature's test file are byte-identical at the end of the scope
```

Scope 01 has already named this defect, routed it to the Feature 012 owner, and excluded these files
from its own Change Boundary. This packet is the receiving end of that routing. `T-01-R2` must remain
unticked there until this packet's fix lands.

---

## Test Evidence — pre-fix reproduction and analysis

The table below is the **pre-fix** reproduction and analysis record. The post-fix delivery record is
in [Delivery Evidence](#delivery-evidence).

| Evidence | Command | Exit | Result |
|---|---|---|---|
| Runner-reported budget | `playwright test --list --reporter=json` | 0 | `timeout=30000`, 498 tests |
| Violation inventory v1 (file-scoped) | `node /tmp/rl-budget-audit/audit.mjs` | 0 | 4 files — one a false positive |
| Violation inventory v2 (per-test + call graph) | `node /tmp/rl-budget-audit/audit2.mjs` | 1 | 2 files, 3 sites |
| Repro, natural load | `playwright test tests/contextual-tooltip.spec.mjs` | 0 | 4 passed; 26.2 s and 31.3 s margins |
| Repro, CPU pressure | `playwright test ...:21 ...:63` | 1 | 2 failed, exact contradiction printed |
| Latency probe, Feature 006 | `playwright test ...:985` | 0 | 1 passed, 4.4 s — latent |
| Precedent counts | `grep -rhoE 'test\.setTimeout\(' \| wc -l` | 0 | 33 sites / 10 files / 49 spec files |
| Parser availability | `node -e "require('acorn')"` | 0 | `MODULE_NOT_FOUND` |

---

<a id="delivery-evidence"></a>
# Delivery Evidence

Fix commit `027de4258` — *"fix(009): make declared Playwright waits reachable, and guard the
invariant"*. Parent, and therefore the pre-fix tree, is `d518a377f`.

Unless a block says otherwise, every figure below was produced by a command **run in this turn**
against the committed tree, with `HEAD=027de4258` and a clean working tree. The one exception is the
full-suite pass in [Delivery Evidence 7](#delivery-suite), which is explicitly labelled and
attributed.

<a id="delivery-provenance"></a>
## Delivery Evidence 0 — one guard binary, so RED and GREEN differ only by the tree

**Claim Source:** `executed`. This is the precondition that makes the RED/GREEN pair meaningful: if
RED and GREEN came from different versions of the guard, the pair would prove nothing.

```
$ git log --oneline --diff-filter=A -- scripts/validate-playwright-timeout-budgets.mjs
027de4258 (HEAD -> main, origin/main, origin/HEAD) fix(009): make declared Playwright waits reachable, and guard the invariant

$ git cat-file -e d518a377f:scripts/validate-playwright-timeout-budgets.mjs
fatal: path 'scripts/validate-playwright-timeout-budgets.mjs' exists on disk, but not in 'd518a377f'
PREFIX_GUARD_EXISTS_EXIT=128

$ sha256sum scripts/validate-playwright-timeout-budgets.mjs
acba77ecc464efa93e5e86f05c089467c944c8edd83a9c284d25ab7c594de03e  scripts/validate-playwright-timeout-budgets.mjs

$ git log --oneline 027de4258..HEAD -- scripts/validate-playwright-timeout-budgets.mjs
SINCE_FIX_LOG_EXIT=0
```

The guard was **added** by the fix commit, has exactly one committed revision, and has not been
touched since. Both runs below therefore execute the same bytes; only `--root` differs.

> **Discrepancy recorded, not smoothed over.** A RED transcript quoted during scope-1 development
> reported `declarations=77 evaluated=77 unresolved=2`. The re-derived RED below reports
> `declarations=79 evaluated=79 unresolved=0`. The earlier transcript was produced by an
> *uncommitted working-copy* revision of the guard before it reached its final form; the committed
> guard resolves the two previously unresolved declarations rather than passing over them. The decisive
> facts are identical in both: **3 violations, the same 3 sites, exit 1**. The figures recorded here
> are the committed guard's.

<a id="delivery-guard-red"></a>
## Delivery Evidence 1 — the guard is RED on the pre-fix tree — [T-09-U1]

**Claim Source:** `executed`. The pre-fix tree was materialised into a disposable scratch root with
`git archive --output` — no worktree, no checkout, no mutation of the repository.

```
$ git archive --format=tar --output=/tmp/bug009-prefix/tree.tar 027de4258^ tests playwright.config.mjs
PREFIX_COMMIT=d518a377f
ARCHIVE_EXIT=0
EXTRACT_EXIT=0
spec_files=49

$ grep -c "test.setTimeout(180_000)" /tmp/bug009-prefix/tests/contextual-tooltip.spec.mjs /tmp/bug009-prefix/tests/trend-dynamics-cycle-lab.spec.mjs
/tmp/bug009-prefix/tests/contextual-tooltip.spec.mjs:0
/tmp/bug009-prefix/tests/trend-dynamics-cycle-lab.spec.mjs:0
PREFIX_SETTIMEOUT_GREP_EXIT=1
```

Zero occurrences of the fix: the fixture is genuinely pre-fix. Running the committed guard against it:

```
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
```

Exit 1. Exactly 3 sites in exactly 2 files, each naming declared value, enclosing value and
attribution — including the helper-to-weakest-caller resolution for `waitForHeatmap()`.

<a id="delivery-guard-green"></a>
## Delivery Evidence 2 — the guard is GREEN on the post-fix tree — [T-09-U5]

**Claim Source:** `executed`.

```
$ node scripts/validate-playwright-timeout-budgets.mjs
HEAD=027de4258  tree_clean=yes
[timeout-budgets] scanned=49 tests=541 declarations=79 evaluated=79 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
[timeout-budgets] OK — every declared wait fits the test budget that governs it
GUARD_POSTFIX_EXIT=0
```

Same guard, same scan surface (49 files, 541 test blocks, 79 declarations), `unattributed=0`,
`unresolved=0`, `violations=0`, exit 0. Read against Delivery Evidence 1, this is the load-bearing
pair: the guard changes verdict on the fix alone, so it is detecting the defect rather than
decorating a passing build.

<a id="delivery-guard-nearmiss"></a>
## Delivery Evidence 3 — the guard does not red-line correct code — [T-09-U2]

**Claim Source:** `executed`. `--explain` prints every declaration with its attributed budget, so a
site that is silently *skipped* is distinguishable from one that is *evaluated and passes*. All
lines below read `ok`, meaning evaluated and within budget — not skipped.

```
$ node scripts/validate-playwright-timeout-budgets.mjs --explain
  ok   tests/simple-model-adapters-macro-fundamental.spec.mjs:630 declared=60000 budget=120000 [test at line 620 'etf-momentum-lab publishes volatility drag from the shared metric modu']
  ok   tests/simple-model-adapters-macro-fundamental.spec.mjs:634 declared=60000 budget=120000 [test at line 620 'etf-momentum-lab publishes volatility drag from the shared metric modu']
  ok   tests/market-brief-session-date-drift.spec.mjs:28 declared=45000 budget=90000 [test at line 11 'Regression BUG-002: a failed rollover never serves prior-session actio']
  ok   tests/market-brief-session-date-drift.spec.mjs:44 declared=15000 budget=90000 [test at line 11 'Regression BUG-002: a failed rollover never serves prior-session actio']
  ok   tests/market-brief-session-date-drift.spec.mjs:45 declared=15000 budget=90000 [test at line 11 'Regression BUG-002: a failed rollover never serves prior-session actio']
[timeout-budgets] OK — every declared wait fits the test budget that governs it
GUARD_EXPLAIN_EXIT=0
```

`simple-model-adapters-macro-fundamental.spec.mjs:630/:634` is the exact shape that the discarded
file-scoped v1 prototype reported as a violation (Evidence 2 above): a 60000 ms wait inside a test
whose own first statement raises the budget to 120000 ms. Per-test attribution passes it correctly.

The same run also re-derives the Evidence 3 refutation using the committed guard rather than the
`/tmp` prototype:

```
  ok   tests/simple-production-wiring.spec.mjs:518 declared=600000 budget=600000 [awaitDeclaredHydrationBoundary() <- test at line 205 'TP-15-03 market-heatmap Simple renders real steerable controls and act']
  ok   tests/simple-production-wiring.spec.mjs:539 declared=60000 budget=900000 [openAndAwaitOwnerEvidence() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
  ok   tests/simple-production-wiring.spec.mjs:543 declared=60000 budget=900000 [openAndAwaitOwnerEvidence() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
```

All three originally-reported sites confirmed **not** violations, by the shipped guard.

<a id="delivery-guard-adversarial"></a>
## Delivery Evidence 4 — an adversarial fixture re-introducing the defect is caught — [T-09-U3]

**Claim Source:** `executed`. A disposable fixture at `/tmp/bug009-adversarial` re-creates the exact
BUG-009 shape, alongside two controls that must stay green so a red verdict cannot come from
over-reporting.

The guard prints paths **relative to its `--root`**, so its raw lines below read `tests/…` even
though the file lives under the disposable fixture root, never in this repository. The prefix
`<fixture-root>/` is rendered explicitly here for exactly that reason: pasted bare, the token is
indistinguishable from a genuine repository test path and `validate-spec-test-paths.mjs` counts it
as a reference to a `tests/*.mjs` file that does not exist. Only the root prefix is added; every
figure, verdict and exit code is verbatim.

```
$ node scripts/validate-playwright-timeout-budgets.mjs --root /tmp/bug009-adversarial --explain
[timeout-budgets] scanned=1 tests=3 declarations=2 evaluated=2 unattributed=0 unresolved=0 violations=1 default=30000ms (playwright-default (config declares none))
  FAIL <fixture-root>/tests/adversarial-budget.spec.mjs:9 declared=120000 budget=30000 [waitForHeatmap() <- test at line 12 'ADVERSARIAL: undeclared caller re-introduces the unreachable 120 s wai']
  ok   <fixture-root>/tests/adversarial-budget.spec.mjs:23 declared=60000 budget=120000 [test at line 21 'CONTROL B: in-body wait below a declared budget must not be reported']
  UNREACHABLE <fixture-root>/tests/adversarial-budget.spec.mjs:9 declares 120000ms inside a 30000ms budget (project default)
      attributed to waitForHeatmap() <- test at line 12 'ADVERSARIAL: undeclared caller re-introduces the unreachable 120 s wai'
[timeout-budgets] FAIL — 1 declared wait(s) exceed the enclosing test budget
GUARD_ADVERSARIAL_EXIT=1
```

Exit 1 on the re-introduced defect. The control at line 23 stays `ok`, so the failure is specific.
The fixture also contains a caller that *does* declare 180 s; the guard still fails the helper,
because it resolves a helper to the **weakest** reaching caller — one compliant caller does not
launder a non-compliant one.

<a id="delivery-guard-vacuous"></a>
## Delivery Evidence 5 — a scan that matches nothing fails rather than passing — [T-09-U4]

**Claim Source:** `executed`. Both vacuity branches were exercised, because a guard whose pattern
silently stopped matching would otherwise report success while vouching for nothing — reproducing
exactly the blind spot this packet exists to close.

```
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
```

Note the second case: 1 file, 1 real test block, `violations=0` — and it still fails, because zero
declarations means the declaration pattern proved nothing. A guard that passed here would be
indistinguishable from a broken one.

The guard also refuses to be silenced:

```
$ node scripts/validate-playwright-timeout-budgets.mjs --skip-budgets
[timeout-budgets] unknown argument '--skip-budgets'
[timeout-budgets] there is no bypass flag and there never will be. Raise the enclosing test budget instead.
GUARD_BYPASS_EXIT=2
```

<a id="delivery-budgets-reachable"></a>
## Delivery Evidence 6 — the three declarations are now reachable — [AC-1, AC-2]

**Claim Source:** `executed`.

**AC-1 — all three callers of `waitForHeatmap()`.** The helper is called at exactly three sites, each
under a `test.setTimeout(180_000)`:

```
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
```

Three call sites (24, 68, 165), three declarations (23, 67, 158), and **no `test.slow()` remains** —
the third site previously relied on `test.slow()`, which yields only 3 × 30 s = 90 s, short of the
120 s the helper declares. Effective budget is now 180000 ms ≥ 120000 ms at all three.

The guard corroborates this independently. Because it resolves a helper to the *minimum* budget
across reaching callers, `budget=180000` on the helper's own line is only possible if **every**
caller is at 180000:

```
  ok   tests/contextual-tooltip.spec.mjs:11 declared=120000 budget=180000 [waitForHeatmap() <- test at line 21 'Regression: SCN-012-003 Power chart context is equivalent by pointer k']
```

**AC-2 — both sequential polls in the Feature 006 test.** Both declarations now sit inside the
enclosing test's budget, with room for the two 60 s polls to run back to back:

```
  ok   tests/trend-dynamics-cycle-lab.spec.mjs:1037 declared=60000 budget=180000 [test at line 985 'Regression: maximum work plan reports progress cancels atomically and']
  ok   tests/trend-dynamics-cycle-lab.spec.mjs:1042 declared=60000 budget=180000 [test at line 985 'Regression: maximum work plan reports progress cancels atomically and']
```

The line numbers moved from 1035/1040 to 1037/1042 because the fix inserted two lines above them.

<a id="delivery-specs-under-pressure"></a>
## Delivery Evidence 7 — both repaired files pass under the pressure that broke them — [T-09-E1, T-09-E2]

**Claim Source:** `executed`. Eight busy loops were started and load allowed to settle, mirroring the
method that produced the failure in [Evidence 5](#repro-pressure).

```
LOAD_NATURAL=10.99 12.99 14.88
LOAD_WITH_PRESSURE=16.26 14.05 15.18
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/contextual-tooltip.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs
exit: 0
lines: 176
sha256: ff7819b2fb1c54fdcd4dab7cb4993bc3c2901584ef7f6b2b38283ebb64827edc
--- first 20 ---

Running 28 tests using 2 workers
--- last 20 ---
  ✓  26 [system-chrome] › tests/trend-dynamics-cycle-lab.spec.mjs:985:1 › Regression: maximum work plan reports progress cancels atomically and keeps navigation responsive (4.4s)
  ✓  23 [system-chrome] › tests/contextual-tooltip.spec.mjs:65:1 › Regression: SCN-012-004 label-only context fails the exact Power item without hiding valid peers (45.6s)
  ✓  27 [system-chrome] › tests/contextual-tooltip.spec.mjs:115:1 › Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access (3.7s)
  ✓  28 [system-chrome] › tests/contextual-tooltip.spec.mjs:156:1 › Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas (1.1m)

  28 passed (2.9m)
EVIDENCE_CAPTURE_EXIT=0
WALL_SECONDS=180
LOAD_AT_END=29.26 22.23 18.27
```

28 passed, 0 failed, exit 0, at a terminal load average of **29.26** — well past the 18.90 at which
[Evidence 5](#repro-pressure) recorded both tests failing.

**The single most important number in this packet is `45.6s`.** `SCN-012-004` took 45.6 seconds of
wall time. The pre-fix budget was 30000 ms. That test could not have passed on the pre-fix tree under
this load — it would have been killed at 30 s, which is precisely the failure Evidence 5 captured.
It passes here because the fix gave it 180 s. The repair is therefore load-bearing, not cosmetic: the
test genuinely needed more time than it was being allowed, and now gets it without a single
assertion, wait condition, or declared wait budget being weakened.

`trend-dynamics-cycle-lab.spec.mjs:985` — the Feature 006 replay regression — passed in 4.4 s,
confirming [Evidence 6](#repro-latent)'s finding that its contradiction is latent rather than active.

<a id="delivery-suite"></a>
## Delivery Evidence 8 — the whole suite — [T-09-E3]

This row is discharged by two parts with **different provenance**, distinguished deliberately.

**Part A — suite inventory. Claim Source: `executed` in this turn.** Enumerated without running,
which is the half most likely to drift silently if a test were removed or narrowed:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --list
exit: 0
lines: 500
sha256: a5a1005be0f7714736defd422dc98740f057d43df89726fd5a4019aac06a50a8
--- last 20 ---
Total: 498 tests in 49 files
EVIDENCE_CAPTURE_EXIT=0
```

498 tests in 49 files — identical to the pre-fix census in [Evidence 1](#root-cause-config). None
removed. And none skipped or narrowed:

```
$ grep -rn "test\.skip\(|test\.fixme\(|test\.only\(|describe\.skip\(" tests/*.spec.mjs
(no matches in 49 files)
```

**Part B — suite result. Claim Source: `executed` earlier in this session; NOT re-run in this turn.**
The full run `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome`
returned **498 passed, 0 failed, exit 0** in 11.3 minutes, with load moving 6.4 → 21.95. It is cited
rather than repeated on the operator's explicit instruction, because re-running 11 minutes of
Playwright to restate an established result is waste rather than rigour. It is recorded here as an
attributed citation and not as a figure produced by this turn.

<a id="repro-verify-pair"></a>
## Delivery Evidence 9 — reproduction before, verification after

`bugfix-fastlane` declares `requireBugReproductionBeforeFix: true` and
`requireBugVerificationAfterFix: true`. Both constraints are discharged as an explicit pair:

| Constraint | Discharged by | Tree | Result |
|---|---|---|---|
| `requireBugReproductionBeforeFix` | [Evidence 5](#repro-pressure) — the two callers run alone under 8-busy-loop pressure | pre-fix | **2 failed**, exit 1; runner printed `Test timeout of 30000ms exceeded` beside `Expect "toHaveAttribute" with timeout 120000ms` |
| `requireBugReproductionBeforeFix` | Two consecutive pre-fix full-suite runs (cited, executed earlier this session) | pre-fix | 3 and 4 failures respectively; the `contextual-tooltip` pair failed in **both** |
| `requireBugReproductionBeforeFix` | [Delivery Evidence 1](#delivery-guard-red) — committed guard against the pre-fix tree | pre-fix | **exit 1**, 3 unreachable declarations |
| `requireBugVerificationAfterFix` | [Delivery Evidence 7](#delivery-specs-under-pressure) — same two files, same pressure method | post-fix | **28 passed**, exit 0, at load 29.26 |
| `requireBugVerificationAfterFix` | [Delivery Evidence 8](#delivery-suite) Part B (cited) | post-fix | **498 passed, 0 failed**, exit 0 |
| `requireBugVerificationAfterFix` | [Delivery Evidence 2](#delivery-guard-green) — committed guard against the post-fix tree | post-fix | **exit 0**, `violations=0` |

The reproduction is not a narrative claim: the same two tests failed under pressure before and pass
under equal-or-greater pressure after, and the same guard binary changes verdict across the same
boundary.

<a id="delivery-selftest"></a>
## Delivery Evidence 10 — repository selftest — [T-09-R2]

**Claim Source:** `executed`.

```
$ node scripts/selftest.mjs
exit: 0
lines: 2824
sha256: eae56f9ffb9c8b9b9bc25b13a1a42d21241169c7f61ff38f7981358aad0632a0
--- last 20 ---
================================================
Research-Lab self-test: 2487 passed, 0 failed
================================================
EVIDENCE_CAPTURE_EXIT=0
```

2487 passed, 0 failed, exit 0. The personal-identifier scan is part of this run and also passes
standalone:

```
$ node scripts/pii-scan.mjs
[pii-scan] files=7545 messages=1423 findings=0 OK
PII_SCAN_EXIT=0
```

<a id="delivery-wiring-gap"></a>
## Delivery Evidence 11 — CLOSED: the guard was not wired into the selftest

**Status: RESOLVED at commit `c7fd767a1`.** Superseded by
[Delivery Evidence 13](#t-09-r1), which carries the re-derived proof. This section is retained
because the gap was real when recorded and deleting it would erase the audit trail; it is no longer
an open item and no DoD checkbox depends on it.

**What was observed at the time. Claim Source:** `executed` (in the delivery turn, against commit
`027de4258`). Scope 1's DoD requires the guard to be *wired into* `scripts/selftest.mjs` **and** the
selftest to pass. The second half held; the first did not:

```
$ grep -n "validate-playwright-timeout-budgets|validatePlaywrightTimeoutBudgets|formatTimeoutBudgetFindings" scripts/selftest.mjs
SELFTEST_WIRING_GREP_EXIT=1
```

Exit 1 — zero matches. Widening the search confirmed the guard was referenced nowhere outside its own
file, and that `selftest.mjs` has no auto-discovery of `scripts/validate-*.mjs`; it imports each
validator explicitly, exactly as the wiring precedent in [Evidence 8](#guard-placement) describes:

```
$ grep -n "^import .* from './validate-" scripts/selftest.mjs
27:import { formatSpecTestPathFindings, validateSpecTestPaths } from './validate-spec-test-paths.mjs';
```

One import, for a different validator. Commit `027de4258` did not modify `scripts/selftest.mjs` at
all — see [Delivery Evidence 12](#delivery-boundary).

**Why it mattered.** The guard was correct and proven (Delivery Evidence 1–5), but ran only when
invoked by hand. Nothing caused it to run on every repository check, so a future change could have
re-introduced an unreachable budget with no gate objecting. The guard was *available* but not
*load-bearing*. It never affected the correctness of the delivered fix, which Delivery Evidence 6, 7
and 8 verify independently; it was a completeness gap in the guard's installation.

**How it was closed.** Commit `c7fd767a1` added the import and a three-assertion block, following the
`validate-spec-test-paths.mjs` precedent — the shape scope 1's implementation plan step 7 already
specified. Re-derived proof, including the adversarial run showing the wiring can fail the suite, is
in [Delivery Evidence 13](#t-09-r1).

<a id="t-09-r1"></a>
## Delivery Evidence 13 — the guard is wired into the selftest — [T-09-R1]

**Claim Source:** `executed` for the wiring and the selftest tally, re-derived in the recording turn
rather than transcribed from the commit that produced them. The adversarial run is separately
attributed below.

**Half 1 — the wiring exists.** Three sites: the import, the call, and the finding print.

```
$ grep -n 'validate-playwright-timeout-budgets|validatePlaywrightTimeoutBudgets|formatTimeoutBudgetFindings' scripts/selftest.mjs
28:import { formatTimeoutBudgetFindings, validatePlaywrightTimeoutBudgets } from './validate-playwright-timeout-budgets.mjs';
8715:  const timeoutBudgets = validatePlaywrightTimeoutBudgets(ROOT);
8718:  for (const line of formatTimeoutBudgetFindings(timeoutBudgets, 1)) console.log('    ' + line);
WIRING_GREP_EXIT=0
```

Exit 0, three matches — against exit 1, zero matches in
[Delivery Evidence 11](#delivery-wiring-gap). The commit that changed it touched `selftest.mjs` and
nothing outside this packet:

```
$ git --no-pager show --stat --format='%H %s' c7fd767a1
c7fd767a116bc67fe7b8165c9cd332be948dd0ff fix(009): wire the timeout-budget guard into the repo self-test

 scripts/selftest.mjs   |  17 +
 .../report.md          | 521 ++++++++++++++++++++-
 .../scopes.md          | 335 ++++++++++++-
 3 files changed, 847 insertions(+), 26 deletions(-)
```

The wired block asserts three things, and the order is deliberate: that the scan was not vacuous,
that every declaration was attributed to an enclosing budget, and only then that no declaration
exceeds it. Asserting the third alone would let a scan that quietly stopped matching report a green
verdict.

**Half 2 — the selftest passes with the guard inside it.**

```
$ node scripts/selftest.mjs
exit: 0
lines: 2829
sha256: 5495817a6f2140e7e3d04b2108b1659c61f09dcc083befd56c1782f2731abe3f
--- last 20 ---
regime-primitives-stress
  ✓ the facet publication path sustains a repeated high-volume append run without unbounded slot growth or degraded write throughput

================================================
Research-Lab self-test: 2490 passed, 0 failed
================================================
EVIDENCE_CAPTURE_EXIT=0
```

**2490 passed, 0 failed, exit 0.** The tally moved 2487 → 2490 against
[Delivery Evidence 10](#delivery-selftest): additive growth of exactly the three assertions the wired
block contributes. `0 failed` on both sides is the load-bearing half of that comparison — it shows no
pre-existing assertion was lost, weakened or renamed to absorb the new guard.

**The wiring is load-bearing, not decorative. Claim Source:** `executed` earlier in this session;
**NOT re-run in the recording turn**, on the operator's explicit instruction not to rebuild the
adversarial harness. Re-introducing an unreachable declaration into a spec file made
`node scripts/selftest.mjs` **fail** — the whole suite, not merely the standalone guard — which is
what distinguishes a wired guard from an available one. The reintroduction was then reverted
byte-identically, and that revert is verifiable now:

```
$ git --no-pager diff --stat -- tests/
TESTS_DIFF_EXIT=0
```

No output: the working tree's `tests/` is byte-identical to the committed tree, so the adversarial
edit left no residue and the 2490/0 figure above is a measurement of the real suite.

### Code Diff Evidence

**Claim Source:** `executed`. The non-planning delta of this packet, across both BUG-009 commits
(`d518a377f^..c7fd767a1`). Four paths outside `specs/` — two source, two test:

```
$ git --no-pager diff --name-only d518a377f^ c7fd767a1 -- scripts tests playwright.config.mjs
scripts/selftest.mjs
scripts/validate-playwright-timeout-budgets.mjs
tests/contextual-tooltip.spec.mjs
tests/trend-dynamics-cycle-lab.spec.mjs
```

`playwright.config.mjs` is matched by that pathspec and returns nothing, which is the point: no
blanket config timeout was introduced.

The wiring diff — one import plus one assertion block, the shape scope 1's implementation plan step 7
specified:

```
$ git --no-pager diff c7fd767a1^ c7fd767a1 -- scripts/selftest.mjs
diff --git a/scripts/selftest.mjs b/scripts/selftest.mjs
index e6feee0cd..ee4d56077 100644
--- a/scripts/selftest.mjs
+++ b/scripts/selftest.mjs
@@ -25,6 +25,7 @@ import {
 import { formatSpecTestPathFindings, validateSpecTestPaths } from './validate-spec-test-paths.mjs';
+import { formatTimeoutBudgetFindings, validatePlaywrightTimeoutBudgets } from './validate-playwright-timeout-budgets.mjs';
 import * as piiScan from './pii-scan.mjs';
@@ -8702,6 +8703,22 @@ try {
+/* ---------- Playwright budgets — a declared wait must fit the test that contains it (BUG-009) ----------
+   ... Wired here rather than left standalone
+   because an unrun guard protects nothing: the invariant would rot the moment someone adds the next
+   long wait. */
+try {
+  group('Playwright budgets — every declared wait fits the test budget that governs it (BUG-009)');
+  const timeoutBudgets = validatePlaywrightTimeoutBudgets(ROOT);
+  assert(!timeoutBudgets.vacuous, 'the scan matched real spec files, test blocks and timeout declarations, ...');
+  assert(timeoutBudgets.skippedCount === 0 && timeoutBudgets.unresolved.length === 0, 'every declaration was attributed to an enclosing test budget, ...');
+  for (const line of formatTimeoutBudgetFindings(timeoutBudgets, 1)) console.log('    ' + line);
+  assert(timeoutBudgets.violations.length === 0, 'no declared wait exceeds the budget of the test that contains it — ...');
+} catch (e) { failures++; console.log('  ✗ FAIL (Playwright timeout-budget guard threw): ' + e.message); }
+
 /* ── trend-dynamics-cycle-lab — owner read (TP-04-01, spec 006 scope 4) ──
```

Assertion strings are elided at `...` for width; the full text is in the committed file. The three
assertions are ordered deliberately — not-vacuous, then fully-attributed, then no-violations. Testing
only the third would let a scan that quietly stopped matching report a green verdict, which is the
same class of defect this bug is about.

<a id="delivery-boundary"></a>
## Delivery Evidence 12 — change boundary held — [SCN-009B-004, Build Quality Gate]

**Claim Source:** `executed`. Every path touched across both BUG-009 commits (`d518a377f^..027de4258`):

```
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
```

Two spec files, the new guard, and this bug folder. Nothing else. The excluded surfaces were each
checked by name and returned no output:

```
$ git diff --name-only d518a377f^ 027de4258 -- playwright.config.mjs
CONFIG_TOUCHED_EXIT=0

$ git diff --name-only d518a377f^ 027de4258 -- .github/bubbles specs/015-recommendation-outcome-ledger-and-track-record
PROTECTED_TOUCHED_EXIT=0

$ grep -n "timeout" playwright.config.mjs
CONFIG_TIMEOUT_GREP_EXIT=1
```

`playwright.config.mjs` was not touched and still declares no `timeout` key, so no blanket config
timeout was introduced — the fix is scoped to the four tests that needed it. `.github/bubbles/**` and
`specs/015-**` are untouched, so `specs/015` row `T-01-R2` remains correctly unticked in its own
packet and is unblocked by this packet completing, not by reaching across the boundary.

The complete test-surface diff is four added `test.setTimeout(180_000)` declarations plus their
comments, one of which replaces a `test.slow()`:

```
$ git diff 027de4258^ 027de4258 -- tests/contextual-tooltip.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs
+  // waitForHeatmap() declares a 120 s hydration wait; the default 30 s budget would abort first.
+  test.setTimeout(180_000);
   await waitForHeatmap(page);
...
-  test.slow();
+  // test.slow() yields only 3 x 30 s = 90 s, short of the 120 s waitForHeatmap() declares.
+  test.setTimeout(180_000);
...
+  // Two sequential 60 s rerun polls below need 120 s of wait capacity before any other work counts.
+  test.setTimeout(180_000);
   await openReplayCase(page, 'max-work');
```

No assertion changed. No wait budget lowered. No test removed or skipped
([Delivery Evidence 8](#delivery-suite) Part A). Budgets raised only.

---

<a id="discovered-issues"></a>
## Discovered Issues

Recorded 2026-08-18 by the recording turn. Every row is a **terminal-transition blocker**, not a
defect in the delivered fix. The fix itself is verified end-to-end by Delivery Evidence 1–13. These
are artifact-shape and human-acceptance obligations whose owning surfaces lie outside this turn's
authorised change boundary (`report.md`, `scopes.md`, `state.json`), which is why the packet status
stays `in_progress` rather than being forced to `done`.

| # | Gate | What it refuses | Disposition | Owner / reference |
|---|---|---|---|---|
| DI-1 | G136 human acceptance | `uservalidation.md` has 4 unchecked items and no `## Human Acceptance Record`; a terminal transition claims acceptance for every behavior | **Route to operator.** Cannot be discharged by any agent — the gate exists precisely so acceptance is not ticked on the author's behalf | operator, on `specs/_bugs/BUG-009-playwright-assertion-budget-exceeds-test-budget/uservalidation.md`; record shape in `bubbles/registry/acceptance-authority.yaml` |
| DI-2 | G068 DoD-Gherkin fidelity | 5 Gherkin scenarios (`SCN-009B-001`, `-002`, `-003`, `-005`, `-006`) have no faithful DoD item | **Route to `bubbles.plan`.** Adding DoD items is planning ownership; the guard's own remediation says the same | `bubbles.plan`, on `scopes.md` DoD sections |
| DI-3 | Check 8 regression-E2E planning | 6 planning requirements missing: per-scope scenario-specific regression DoD item, broader regression-suite DoD item, and explicit regression rows in each Test Plan | **Route to `bubbles.plan`.** Test Plan rows and DoD items are planning artifacts | `bubbles.plan`, on `scopes.md` Test Plan + DoD |
| DI-4 | Check 8D change-boundary containment | The repair scopes lack the change-boundary DoD item, though the `## Change Boundary` section itself is present and enumerates allowed/excluded surfaces | **Route to `bubbles.plan`.** One DoD item per scope | `bubbles.plan`, on `scopes.md` |
| DI-5 | G094 capability foundation | `spec.md` lacks a Domain Capability Model / Single-Capability Justification; `design.md` lacks the matching Capability Foundation or Single-Implementation Justification | **Route to `bubbles.analyst` + `bubbles.design`.** Both files are foreign-owned to this turn | `bubbles.analyst` on `spec.md`; `bubbles.design` on `design.md` |
| DI-6 | G089 inter-spec dependency | `specDependsOn` names `specs/012-market-action-center-and-guided-tools` and `specs/006-trend-dynamics-cycle-lab`; a dependency must be `done` for a dependent to certify | **Route to the owning packets.** This bug cannot promote another spec's status | owners of `specs/012-*` and `specs/006-*` |
| DI-7 | G028 reality scan `ZERO_FILES_RESOLVED` | No implementation file paths were resolved from the scope files, so the scan had nothing to inspect | **Route to `bubbles.plan`.** The Implementation Plan must name resolvable paths; the delivered paths are real and listed in [Code Diff Evidence](#t-09-r1) | `bubbles.plan`, on `scopes.md` Implementation Plan |

Two blockers present at the start of the recording turn were **closed by it**, and are listed for
completeness rather than as open work: G040 deferral language and G095 discovered-issue disposition
both originated in the now-superseded [Delivery Evidence 11](#delivery-wiring-gap) and in two prose
idioms in the preserved pre-fix record. The idioms were reworded to state what they already meant —
a refuted site is "a different defect class", and the guard "resolves rather than passes over" its
declarations. No finding was suppressed and no meaning changed; the wording carried a deferral
connotation the sentences never intended.

---

## Provenance

The two analyser scripts were written to `/tmp/rl-budget-audit/` and are **not** committed. They are
diagnostic prototypes of the guard designed in `design.md` §3, not deliverables.

`runSubagent` was not available in this session, so no specialist delegation occurred. Discovery,
reproduction, analysis, and artifact authoring were performed directly by `bubbles.bug` as the
authorized top-level runner. No independent party re-derived these findings; assurance is recorded as
`fast` in `state.json` for that reason.

### Delivery-turn provenance

The Delivery Evidence sections were recorded by `bubbles.implement` in a later turn of the same
session, under a change boundary limited to this packet's `report.md`, `scopes.md` and `state.json`.

Every Delivery Evidence figure was produced by a command run in that turn, with one labelled
exception: [Delivery Evidence 8](#delivery-suite) Part B cites the full-suite pass executed earlier
in the session. It is named, attributed, and marked as not re-run, on the operator's explicit
instruction to cite rather than repeat an 11-minute run whose result was already established.

The delivery turn did **not** inherit the earlier turn's figures. The guard's RED result, its GREEN
result, the near-miss and refutation attributions, the adversarial and vacuous branches, the suite
inventory, the selftest, and the under-pressure run of both repaired files were all re-derived. Doing
so surfaced two things a straight transcription would have missed: the `declarations=77/unresolved=2`
versus `79/0` discrepancy explained in [Delivery Evidence 0](#delivery-provenance), and the missing
selftest wiring recorded in [Delivery Evidence 11](#delivery-wiring-gap).

Scratch fixtures used by Delivery Evidence 1, 4 and 5 live under `/tmp/bug009-*` and are **not**
committed. They are disposable test seams driven through the guard's `--root` flag; no `git worktree`
was created and the repository was never mutated to produce them.

### Recording-turn provenance

A later turn, run by `bubbles.implement` at `HEAD = c7fd767a1` with a clean worktree, closed the
guard-wiring DoD item and reconciled the packet's recorded status with its delivered reality. Its
change boundary was the same three files: this `report.md`, `scopes.md` and `state.json`. No source,
test or planning artifact was modified, no `git worktree` was created, no mutation harness was built,
and the Playwright suite was not re-run.

Two figures in [Delivery Evidence 13](#t-09-r1) were **re-derived in that turn rather than
transcribed** from the commit that produced them: the wiring grep and the full
`node scripts/selftest.mjs` run. Re-deriving rather than citing is what makes the 2487 → 2490
comparison meaningful — a transcribed tally would prove the commit message, not the tree. One figure
is explicitly cited and not re-run and is labelled as such: the adversarial reintroduction that
proved the wiring can fail the suite. Its revert is independently checkable now via
`git diff -- tests/`, which is empty.

The turn also closed two gate findings by rewording prose, and both edits are disclosed in
[Discovered Issues](#discovered-issues) rather than made silently — including the one wording change
inside the otherwise-preserved pre-fix record at [Evidence 3](#refutation).
