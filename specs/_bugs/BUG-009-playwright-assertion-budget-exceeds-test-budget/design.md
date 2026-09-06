# Design: BUG-009 — Making Declared Wait Budgets Reachable

## 1. Root cause

Three facts compose into the defect.

**1.1 The project declares no test budget.** `playwright.config.mjs` sets `testMatch` and two
projects (`system-chrome`, `chromium`) and nothing else. There is no `timeout` key at config level,
project level, or inside `use`. Playwright therefore applies its own per-test default.

**1.2 That default is 30000 ms, confirmed by the runner rather than by documentation.** Asking
Playwright to describe its own resolved configuration reports `timeout=30000` for both projects and
`globalTimeout=0`, over 498 tests. This is the authoritative figure: it is what the runtime will
actually enforce, not what a doc page says it should.

**1.3 Three declarations name a larger number.** A wait budget bounds only the wait. The enclosing
test budget bounds everything, including that wait. When the inner number is larger, the outer limit
is reached first and the runner aborts the test. Playwright does not warn about the contradiction —
it honours the smaller number silently.

The consequence is a wait that reads as 120 s and behaves as 30 s minus whatever the test already
spent. The failure message compounds it by naming `30000ms`, a number that appears nowhere in the
spec file, which sends the reader looking for a limit they cannot find.

### 1.4 Why the shared-helper shape matters

Two of the three sites are not in a test body at all. `contextual-tooltip.spec.mjs:11` is inside the
module-level helper `waitForHeatmap()`. A helper is written once and reached from several tests, and
it cannot inspect its caller's budget. Its declared wait is therefore only as honourable as the
**weakest** test that reaches it.

`waitForHeatmap()` has three callers and not one of them can honour its 120 s:

| Caller | Declaration | Effective budget | Honours 120 s? |
|---|---|---|---|
| test at line 21 (`SCN-012-003`) | none | 30000 ms | no |
| test at line 63 (`SCN-012-004`) | none | 30000 ms | no |
| test at line 152 | `test.slow()` | 90000 ms | no |

`test.slow()` triples the default. Three times 30 s is 90 s, which is still short of 120 s. The fix
must raise **all three**, not only the two that currently fail.

### 1.5 What the evidence rules out

The failing assertion observed `data-heatmap-hydration="loading"`, not a wrong value. The page was
mid-hydration. Combined with the measurement that the third caller of the same helper took **31.3 s**
— above the 30 s default, surviving only because it declared `test.slow()` — the cause is a budget
contradiction rather than a product regression. Nothing about the page changed between the test that
passes and the tests that fail; only the declaration differs.

## 2. Fix design

The change is confined to enclosing test budgets. No wait budget moves, no assertion changes.

### 2.1 `tests/contextual-tooltip.spec.mjs` — Feature 012

Add `test.setTimeout(180_000)` as the first statement of the tests at lines **21** and **63**, and
**replace** `test.slow()` at line **153** with `test.setTimeout(180_000)`.

`180_000` is chosen for three reasons, in order of weight:

1. It exceeds the helper's declared 120 s with room for the assertions that follow the wait, so the
   declaration becomes genuinely reachable rather than marginally so.
2. `test.slow()` cannot express it. The helper asks for 120 s; the largest value `slow()` can yield
   is 90 s. Keeping `slow()` at line 153 would leave a third unreachable declaration behind.
3. It is an existing in-repo value, used at `attention-browser.spec.mjs:650` and
   `technical-analysis-decision-lab.spec.mjs:861`, so it introduces no new magnitude.

### 2.2 `tests/trend-dynamics-cycle-lab.spec.mjs` — Feature 006

Add `test.setTimeout(180_000)` as the first statement of the test at line **985**.

That test declares **two sequential** 60 s polls (lines 1035 and 1040) for the first and second
deterministic rerun. Honouring both back to back requires at least 120 s of wait capacity before any
other work is counted, so a 90 s budget would still contradict the declarations. `180_000` covers
both polls plus the surrounding steps.

This site is currently **latent** — measured at 4.4 s under CPU pressure — so the change fixes an
unreachable declaration rather than an observed red. That is deliberate: the contradiction is the
defect, and leaving it in place leaves a trap that arms itself the first time the page slows down.

### 2.3 What must NOT be done

| Prohibited | Why |
|---|---|
| Lowering any wait budget to fit inside 30 s | Inverts the fix. The author's declared tolerance is the requirement; shrinking it to match an accidental cap discards the intent and makes the test fail sooner under exactly the load it was written to survive. |
| Adding a `timeout` key to `playwright.config.mjs` | Relaxes all 498 tests, including the 46 spec files that are already coherent. It would convert a targeted 3-site correction into a suite-wide loss of sensitivity and would mask genuine hangs everywhere. |
| Weakening any assertion | Changing `toHaveAttribute('ready')` to a softer check, deleting a poll, or wrapping a wait in `.catch(() => {})` would turn the red green without making anything true. |
| Using `test.slow()` for the 120 s helper | 3 × 30 s = 90 s < 120 s. It looks like the fix and leaves the contradiction intact. |
| Editing these files from inside `specs/015` scope 01 | That scope's Change Boundary excludes neighbouring features' test files. `T-01-R2` must stay unticked there and be closed by this packet. |
| Retuning heatmap hydration | Out of scope. This packet changes how long the test may wait, not what it waits for. |

## 3. Regression guard design

The durable value of this packet. Without it, the next author adds a fourth contradiction and nothing
notices.

### 3.1 Placement and wiring

A new `scripts/validate-playwright-timeout-budgets.mjs`, exporting
`validatePlaywrightTimeoutBudgets(root)` and `formatTimeoutBudgetFindings(findings, indent)`, and
runnable standalone as a CLI. It is imported by `scripts/selftest.mjs` and asserted there.

This mirrors the established precedent exactly: `scripts/validate-spec-test-paths.mjs` exports
`validateSpecTestPaths` / `formatSpecTestPathFindings`, is imported at `selftest.mjs:27`, and is
driven at `selftest.mjs:8699`. Following it means the guard runs under the command the repository
already treats as its check, `node scripts/selftest.mjs`, rather than adding a surface someone must
remember.

### 3.2 Algorithm

1. **Resolve the project default.** Parse `playwright.config.mjs` for a `timeout` key at config,
   project, or `use` level. If absent, use Playwright's own default. The value is derived, never
   assumed — if someone later sets a config timeout, the guard tracks it.
2. **Scrub.** Blank out line comments, block comments, string literals, and template literals before
   any pattern runs, so a `timeout:` written in prose or inside a fixture string is never mistaken
   for a declaration. This is load-bearing: this repository comments heavily around its budgets, and
   `simple-production-wiring.spec.mjs` discusses 600 s budgets in prose directly above the code.
3. **Enumerate test blocks** by brace/paren matching from each `test(`, `test.only(`, and
   `test.beforeEach(`, discarding nested duplicates.
4. **Compute each test's effective budget** using the INV-009-1 precedence: own `setTimeout` (max) →
   `test.slow()` → `beforeEach`-declared → project default.
5. **Attribute every declaration.** If it sits inside a test, that test's budget applies. If it sits
   inside a module-level helper, resolve the helper's call sites, follow helper-to-helper calls
   transitively with a visited set, and take the **minimum** effective budget across reaching tests.
   Skip helpers with no reachable caller.
6. **Report** every declaration whose value exceeds its attributed budget, with file, line, declared,
   enclosing, and attribution path.
7. **Fail vacuous scans** — zero declarations found, or zero test blocks found, is an error
   regardless of violations (INV-009-3).

### 3.3 No baseline, deliberately

`validate-spec-test-paths.mjs` uses a committed baseline because its policy predated its guard and
the pre-existing set was large. Here the entire pre-existing violation set is 3 sites in 2 files and
is fixed in this same packet, so a baseline would start empty and serve only as a place for future
violations to hide. The guard ships clean-green.

### 3.4 Why not an AST parser

The precise way to do step 5 is to parse. There is no parser in `node_modules` — `acorn`, `espree`,
`esprima`, and `meriyah` are all absent (`MODULE_NOT_FOUND`), and this repository is deliberately
build-free and dependency-light. Adding a parser dependency to police test metadata is a poor trade,
so the guard uses scrub-then-scan with brace matching. That is weaker than an AST in general, but the
constructs it must recognise — `test(`, `test.setTimeout(`, `test.slow(`, `timeout:` — are a small,
stable, syntactically simple set, and the scrub step removes the realistic sources of confusion.

### 3.5 Prototype outcome, including what it got wrong

A prototype was built and run outside the repository against all 49 spec files, and its first version
was **wrong in a way worth recording**.

- **v1 attributed file-scoped**, comparing each file's largest declaration against its weakest test.
  It reported 4 files. One, `simple-model-adapters-macro-fundamental.spec.mjs:630,634`, is correct
  code: those 60 s waits sit inside a test that declares `setTimeout(120_000)` at line 621. A guard
  that red-lines correct code gets switched off, so file-scoped attribution is unusable.
- **v2 attributes per test with helper call-graph resolution** and reports 2 files, 3 sites. It also
  correctly stopped reporting `simple-production-wiring.spec.mjs`, whose helper waits are reachable
  only from 600 s and 900 s tests — which is how the incoming report's three rows for that file were
  found to be false positives.

Both near-miss shapes are therefore verified negatives and are pinned as AC-4, because they are the
cases most likely to break a future refactor of the guard.

### 3.6 Adversarial requirement

Proving the guard red on the committed tree is necessary but not sufficient — after the fix it will
be green, and a guard that is green for the wrong reason is indistinguishable from a working one. The
guard must additionally be shown to fail on a synthetic fixture that re-introduces the defect (a wait
declared above the default inside a test with no declaration), and to stay green on the AC-4 shapes.

## Capability Foundation

`scripts/validate-playwright-timeout-budgets.mjs` is the foundation. It reads every Playwright spec
file in the repository, resolves which enclosing budget governs each declared wait, and refuses when
a declaration cannot be honoured inside it.

It is a foundation rather than a fix because its scope is the repository, not this packet's two
files. The three sites repaired below are the contradictions that existed when it was written; the
guard's job is the ones that do not exist yet. §3 above records the full algorithm, the deliberate
absence of a baseline, and why an AST parser was rejected.

**Known limit, stated rather than implied.** The guard evaluates DECLARED waits. A test whose settle
is a bare `waitForLoadState('networkidle')` declares no wait, so the guard has nothing to read and
cannot detect a budget removed from it. That limit was measured, not assumed — see BUG-011, where
deleting a `test.setTimeout` left this guard green at `violations=0`, which is why that packet needed
its own separate assertion rather than citing this one.

## Concrete Implementations

| # | Site | Feature | Act | Pre-state |
|---|---|---|---|---|
| 1 | `tests/contextual-tooltip.spec.mjs` lines 21, 63 | 012 | add `test.setTimeout(180_000)` | no enclosing declaration; inherits the implicit 30 s default |
| 2 | `tests/contextual-tooltip.spec.mjs` line 153 | 012 | **replace** `test.slow()` with `test.setTimeout(180_000)` | `slow()` yields at most 90 s against a helper asking 120 s |
| 3 | `tests/trend-dynamics-cycle-lab.spec.mjs` line 985 | 006 | add `test.setTimeout(180_000)` | two sequential 60 s polls need ≥ 120 s of wait capacity |

All three take the same value, `180_000`, and the value is not arbitrary: it exceeds the 120 s the
helper declares with room for the assertions that follow, and it is an existing in-repo magnitude
(`attention-browser.spec.mjs:650`, `technical-analysis-decision-lab.spec.mjs:861`), so it introduces
no new number to justify.

### Variation Axes

The three sites differ along three axes, and the differences are why they are enumerated separately
rather than described as one edit repeated.

| Axis | Values | Consequence |
|---|---|---|
| **Observed state** | red (site 1) vs **latent** (site 3) | Site 3 was measured at 4.4 s under CPU pressure, so it fixes an unreachable declaration rather than an observed failure. The contradiction is the defect; leaving it arms a trap that fires the first time the page slows. |
| **Corrective act** | add vs **replace** | Site 2 already carried `test.slow()`. Adding alongside it would leave the weaker declaration in place, so the act there is substitution, not addition. |
| **Wait shape** | one 120 s helper wait (sites 1–2) vs **two sequential 60 s polls** (site 3) | Sequential polls sum. Site 3 needs ≥ 120 s of capacity before any other work is counted, which is why a 90 s budget would still contradict its declarations even though no single wait exceeds 90 s. |

The `slow()` axis is the one most easily missed: `3 × 30 s = 90 s < 120 s`, so `test.slow()` looks
like the fix at every site and is the fix at none of them. `§2.3` records it as prohibited for that
reason.

## 4. Residual fragility, recorded but not claimed

`simple-production-wiring.spec.mjs:518` declares `600000 ms` inside a helper whose weakest reaching
test declares exactly `600000 ms`. It does not violate INV-009-1 — equal is not greater — but a wait
permitted to consume the entire test budget leaves nothing for the surrounding work, so in practice
the full 600 s can never elapse. This is noted for the Feature 015 owner and is deliberately **not**
counted as a defect here, because tightening INV-009-1 from `>` to `>=` would need its own analysis
of how much slack is appropriate.

## 5. Ownership

| Surface | Owner |
|---|---|
| `tests/contextual-tooltip.spec.mjs` | Feature 012 |
| `tests/trend-dynamics-cycle-lab.spec.mjs` | Feature 006 |
| `scripts/validate-playwright-timeout-budgets.mjs`, `scripts/selftest.mjs` | this packet |
| `T-01-R2` row in `specs/015` scope 01 | Feature 015 — closes once this packet lands; must not be closed by editing these files |
