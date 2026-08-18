# Report: BUG-009 — Declared Wait Budgets Must Be Reachable

## Summary

Discovery, reproduction, and root-cause analysis executed 2026-08-18 on an 8-core host under
concurrent load. Every figure below comes from a command run in this session. **No fix has been
implemented** — this packet is documentation, root cause, and design only.

The investigation confirmed the reported defect at 3 of the 6 reported sites and **refuted the other
3**. The corrected position is recorded here rather than the reported one.

## Completion Statement

- **Delivered:** verified root cause, deterministic reproduction, corrected violation inventory,
  fix design per file, and a validated regression-guard design with a working prototype.
- **Not delivered:** the fix itself, the committed guard, and any change to a test file.
- **Status:** `blocked` — awaiting authorization to run a delivery-capable workflow mode over the
  Feature 006 and Feature 012 test surfaces.

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

Exit 1, zero matches. Its failure is load starvation, not a budget contradiction. Out of scope.

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

## Test Evidence

No fix tests exist yet — nothing has been implemented. The table below is the reproduction and
analysis record for this packet.

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

## Provenance

The two analyser scripts were written to `/tmp/rl-budget-audit/` and are **not** committed. They are
diagnostic prototypes of the guard designed in `design.md` §3, not deliverables.

`runSubagent` was not available in this session, so no specialist delegation occurred. Discovery,
reproduction, analysis, and artifact authoring were performed directly by `bubbles.bug` as the
authorized top-level runner. No independent party re-derived these findings; assurance is recorded as
`fast` in `state.json` for that reason.
