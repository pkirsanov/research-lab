# Report: BUG-011 — Declaring The Budget These Tests Actually Need

## Summary

The fix designed in `design.md` §2 is **committed at `5c978c5cb` and verified under the condition
that produced the red**. All five tests in `tests/causal-rotation-consumers.spec.mjs` declare
`test.setTimeout(180_000)` as their first statement, and one comment above `openOwner()` records the
measured cost and the honest limitation. A post-fix full-suite run at the suite's own parallelism
reported no failure in this file at all. Six of the nine Definition of Done items are now ticked
against executed or reported evidence; three remain open and are named below rather than argued away.

**RED stage — the failing proof, recorded before the fix.** *(Claim Source: prior execution, this
session — reported observation, not re-derived by this run.)* Before `5c978c5cb`, the full suite
reported 4 failed in `tests/causal-rotation-consumers.spec.mjs` at tree `0e51d602f`, and 1 failed at
tree `adb97b983`. Every one of those reported `Test timeout of 30000ms exceeded` inside
`page.waitForLoadState('networkidle')` at `openOwner`. The full tallies, the third observation
recorded in `bug.md`, and why the count moves between runs are set out under *Pre-fix full-suite
failures* below. The GREEN stage that follows this red is recorded under *Post-fix full suite*.

- **Changed and committed:** `tests/causal-rotation-consumers.spec.mjs` at `5c978c5cb` (`11 +`,
  `0 -`: five `test.setTimeout` declarations plus one explanatory comment), and this packet under
  `specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget/`. The file is untouched
  since delivery: `git log 5c978c5cb..HEAD -- tests/causal-rotation-consumers.spec.mjs` is empty at
  `9af68427b`.
- **Unchanged, deliberately:** `playwright.config.mjs`, `sector-research-lab.html`,
  `global-rotation-lab.html`, `real-assets-lab.html`, `rlcausalconsumer.js`, `rlviews.js`,
  `rlapp.js`, `rlnav.js`, and every other spec file under `tests/`.
- **Definition of Done:** 6 ticked, 3 open. Open are *the isolated post-fix run* (never executed),
  *`selftest` at 0 failed* (it is at 15 failed, all belonging to unrelated in-flight Feature 026
  work), and *the 498-test enumeration* (no longer true at HEAD because ~99 test declarations landed
  in 20 unrelated spec files after this fix). Each is recorded with its reason inline in `scopes.md`.

**Provenance of every figure in this report.** Measurements are tagged one of three ways and the
tags are load-bearing: **executed, this run** (a command this agent ran in the current session);
**prior execution, this session** (a Playwright measurement produced before this run and recorded
here as a reported observation, never re-derived); and **not-run**. This run executed no Playwright
command of any kind, by instruction — a competing suite run would corrupt the very timing
measurement the packet depends on.

## Completion Statement

**Delivered:** the code change described in `design.md` §2 — `test.setTimeout(180_000)` on all five
tests plus one explanatory comment — committed at `5c978c5cb`; and the verification that it works
under contention, reported by the post-fix full-suite run.

**The adversarial test carried real force.** `scopes.md` names the full committed suite at its own
parallelism as the decisive test, because that is the only condition under which the 30 000 ms budget
was ever observed to expire, and because the file was green in isolation *before* the change — so an
isolated pass would have been tautological. Pre-fix, that condition produced two failures in this
file at `0e51d602f` and one at the next measurement. Post-fix, it produced none. The test that could
fail did fail, and then stopped failing.

**Not delivered, and not disguised.** Three DoD items are open. The post-fix *isolated* run was never
performed and the contended result is not reused to stand in for it. `node scripts/selftest.mjs` is
red at this HEAD — 3012 passed, 15 failed — for reasons belonging to another line of work, and an
item demanding 0 failed cannot be ticked against a red suite no matter who owns the red. The
498-test enumeration is stale at HEAD because unrelated work added tests after this fix; what this
fix did to the inventory (nothing) is evidenced, but the item as written is not.

**The fix's limitation is real and is not closed by this packet.** `waitForLoadState('networkidle')`
remains timing-dependent; only its allowance grew. The comment committed above `openOwner()` states
this in the source itself. `design.md` §3 records why the condition-based replacement was
investigated and rejected — the three owner pages expose no readiness marker, and every available
substitute either resolves too early or can hang — and `spec.md` records that replacement as out of
scope rather than as done.

`state.json` is therefore `in_progress`, with `certification.status` equal to it. A terminal status is
available under this mode's ceiling but is not earned: three DoD items are open, the scope is In
Progress, no independent party has certified anything, and `uservalidation.md` carries an unfilled
Human Acceptance Record that only a human can discharge.

## Test Evidence

No Playwright command was executed by this run. The evidence below has three kinds and they are
labelled separately: **prior-execution measurements**, which ground the defect and its verification;
**agent-executed commands**, run in the current session against `9af68427b`; and **static reads** of
the committed tree.

### Pre-fix full-suite failures — the defect, twice

**Executed by this run:** NO
**Claim Source:** prior execution, this session — reported observation, not re-derived here
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line`

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

**Executed by this run:** NO
**Claim Source:** prior execution, this session — reported observation, not re-derived here

`tests/fx-regime-relative-value-lab.spec.mjs:1348` failed in the first full run and passed in the
second, with no change between the two runs relevant to that file. That is an independent
demonstration — in a spec file this packet does not touch and does not modify — that the suite's
failures under load are timing-dependent rather than deterministic.

### The suspect files in isolation are green — so isolation proves nothing here

**Executed by this run:** NO
**Claim Source:** prior execution, this session — reported observation, not re-derived here

The two suspect spec files run on their own: **44 passed** at `5d4a8202a`, and **44 passed** at
`ec7787e5a`. Green on both trees, while the full suite was red on both. This is the measurement that
rules out a code regression and rules in contention, and it is also the reason the isolated run
cannot discharge the adversarial DoD item.

### Post-fix full suite — the decisive measurement, and it reported

**Executed by this run:** NO
**Claim Source:** prior execution, this session — reported observation, not re-derived here

A clean post-fix full-suite run at the suite's own parallelism showed **no failure in
`tests/causal-rotation-consumers.spec.mjs` at all**. This is the measurement that was in flight when
the fix landed, and it is the one `scopes.md` names as decisive.

Set against the pre-fix runs above, the pairing is what gives it force. Same condition, same file:
two failures, then one, then none. Meanwhile the same file was green in isolation on both pre-fix
trees, which is exactly why an isolated pass could never have discharged this item.

**What this does not say.** The run's overall pass/fail tally is not recorded here, and none is
invented. The criterion `SCN-011B-002` states is file-scoped — *"no test in
`tests/causal-rotation-consumers.spec.mjs` fails"* — and that is the whole of what is claimed. The
corresponding DoD item is ticked on exactly that basis and says so inline.

### Budget-coherence guard — run standalone this session

**Executed by this run:** YES
**Command:** `node scripts/validate-playwright-timeout-budgets.mjs`
**Claim Source:** executed

```
[timeout-budgets] scanned=67 tests=646 declarations=91 evaluated=91 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
[timeout-budgets] OK — every declared wait fits the test budget that governs it
VALIDATOR_EXIT=0
```

This is the BUG-009 guard's verdict on the committed tree: raising these five enclosing budgets left
no wait declaration unreachable anywhere in the repository. The `default=30000ms
(playwright-default (config declares none))` line is the bug's own root cause restated by the guard.

It establishes coherence, not that the tests survive contention — the previous section is what does
that.

### Repository selftest — red at this HEAD, and not for this packet's reasons

**Executed by this run:** YES
**Command:** `node scripts/selftest.mjs`
**Result:** `Research-Lab self-test: 3012 passed, 15 failed`, exit 1
**Claim Source:** executed

The DoD item requires 0 failed. It is 15, so the item is **not ticked**. That holds regardless of who
owns the failures, and no argument about ownership is used to tick it anyway.

The failing assertions visible in the captured output are `SCN-026-CANARY-02`, `SCN-026-CANARY-04`,
`TP-026-5.1`, and the cross-asset and delta checks keyed to a literal `market-brief-payload/v2`
stamp — all belonging to in-flight Feature 026 byte-budget and cross-asset work. None names this
file, this packet, or a timeout budget.

**Limitation of that characterisation, stated rather than glossed.** The captured output was
truncated, so five of the fifteen failures were inspected individually and ten were not. The claim
"none of the fifteen touches this packet" is therefore an *inference* from the five inspected plus
the fact that this packet changed exactly one file (`tests/causal-rotation-consumers.spec.mjs`,
`11 +` / `0 -`), which no byte-budget or cross-asset check reads. It is not a verified enumeration,
and it is not used to tick anything.

### The committed change

**Executed by this run:** YES
**Command:** `git show 5c978c5cb -- tests/causal-rotation-consumers.spec.mjs`, `grep -n`
**Claim Source:** executed

Diffstat for the test file: `11 +`, `0 -`. Every hunk is an insertion. All five tests carry the
declaration as their first statement, and the line numbers shifted by six from those cited in
`bug.md` because the six-line comment above `openOwner()` was added:

| Test | Pre-fix line | Post-fix `test(` line | `test.setTimeout(180_000)` line |
|---|---|---|---|
| served owner timing reads … exposure contracts | 118 | 124 | 125 |
| Sector acceleration remains visible … | 151 | 158 | 159 |
| A country causal read disagrees … | 187 | 195 | 196 |
| Energy equities strengthen … | 213 | 222 | 223 |
| consumers reject unknown causal versions … | 240 | 250 | 251 |

`page.waitForLoadState('networkidle')` inside `openOwner` moved from line 114 to line 120 and is
otherwise unmodified — the wait itself was not touched, which is the point. `enterOwnerView` is
byte-identical; the comment sits after its closing brace. `grep` for `.skip`, `.fixme` and `.only`
returns nothing, and `retries` appears nowhere in the diff.

The magnitude is not new: `tests/attention-browser.spec.mjs:650`,
`tests/contextual-tooltip.spec.mjs:26,70,161` and `tests/trend-dynamics-cycle-lab.spec.mjs:987` all
declare `test.setTimeout(180_000)`.

### Code Diff Evidence

**Executed by this run:** YES
**Claim Source:** executed
**Command:** GIT_PAGER=cat git show 5c978c5cb --stat -- tests/causal-rotation-consumers.spec.mjs

```text
$ GIT_PAGER=cat git show 5c978c5cb --stat -- tests/causal-rotation-consumers.spec.mjs
 tests/causal-rotation-consumers.spec.mjs | 11 +++++++++++
 1 file changed, 11 insertions(+)

$ GIT_PAGER=cat git log --oneline -1 5c978c5cb
5c978c5cb fix(BUG-011): declare the budget these causal consumer tests actually need

$ git --no-pager show 5c978c5cb --numstat --format='' -- tests/causal-rotation-consumers.spec.mjs
11      0       tests/causal-rotation-consumers.spec.mjs
```

The delivery is one file, eleven inserted lines, zero deleted. The hunks below are the complete
change — `git --no-pager show 5c978c5cb --format='' --unified=1 -- tests/causal-rotation-consumers.spec.mjs`:

```diff
@@ -103,2 +103,8 @@ async function enterOwnerView(page) {
 
+/* Every test below drives this helper one to three times, and each call is a FULL load of a heavy
+   analytics page plus a network settle. Measured on one worker with no contention, the sector test
+   spends 23.7 s of the 30 s Playwright applies when a config declares no timeout — 79% of a budget
+   nobody chose. Under the suite's own four-worker parallelism that margin is gone, so each test
+   declares the budget its work actually needs. The settle below is still timing-dependent; only its
+   allowance grew. See specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget. */
 async function openOwner(page, file, { disableCausal = false } = {}) {
@@ -118,2 +124,3 @@ async function openOwner(page, file, { disableCausal = false } = {}) {
 test('Regression: served owner timing reads and causal snapshot share compatible exposure contracts', async ({ page }) => {
+  test.setTimeout(180_000);
   await openOwner(page, 'sector-research-lab.html');
@@ -151,2 +158,3 @@ test('Regression: served owner timing reads and causal snapshot share compatible
 test('Regression: Sector acceleration remains visible while cause is unverified', async ({ page }) => {
+  test.setTimeout(180_000);
   const selectors = ['#simpleView', '#modeSeg'];
@@ -187,2 +195,3 @@ test('Regression: Sector acceleration remains visible while cause is unverified'
 test('Regression: A country causal read disagrees with its market model', async ({ page }) => {
+  test.setTimeout(180_000);
   const selectors = ['#leaderboard', '#narrative'];
@@ -213,2 +222,3 @@ test('Regression: A country causal read disagrees with its market model', async
 test('Regression: Energy equities strengthen while the underlying proxy remains weak', async ({ page }) => {
+  test.setTimeout(180_000);
   const selectors = ['#simpleView'];
@@ -240,2 +250,3 @@ test('Regression: Energy equities strengthen while the underlying proxy remains
 test('Regression: consumers reject unknown causal versions while owner models remain usable', async ({ page }) => {
+  test.setTimeout(180_000);
   const selectors = ['#simpleView', '#modeSeg'];
```

Every hunk is a pure insertion. No assertion was weakened, no test was skipped, no retry was added,
and `page.waitForLoadState('networkidle')` is unmodified — it only moved from line 114 to line 120
because the six-line comment above `openOwner()` was inserted. That is the whole delivery.

### `playwright.config.mjs` untouched

**Executed by this run:** YES
**Command:** `git show --stat 5c978c5cb`, `git merge-base --is-ancestor c26e4a17e 5c978c5cb`, `git diff 5c978c5cb..HEAD -- playwright.config.mjs`
**Claim Source:** executed

The file is absent from the fix commit's 11-file diffstat. Its last modification is `c26e4a17e`,
confirmed an ancestor of the fix. The diff from the fix to HEAD is empty. Read at `9af68427b`, it
still declares no `timeout` and no `retries` — the implicit 30 000 ms default remains the
config-level default, which is why the budget had to be declared per test.

**CORRECTION 2026-08-29 — the "diff to HEAD is empty" sentence above has since gone false, and it
is corrected here rather than left standing.** At today's HEAD,
`git diff 5c978c5cb..HEAD -- playwright.config.mjs` reports **20 insertions**. BUG-017 added
`workers: 2` in `13494be66` and `b08ba13f4`, pinning the local worker count to match the pipeline
after diagnosing a macOS `system-chrome` teardown force-kill at higher worker counts.

Two parts of the original claim survive the correction, and one does not.

- **Survives — the property this section exists to protect.** The *fix* did not touch the config:
  `git show --stat 5c978c5cb -- playwright.config.mjs` is still empty. This packet bought its result
  by declaring per-test budgets, not by loosening a global. Re-verified today:
  `grep -cE 'retries' playwright.config.mjs` returns **0**, so no retry was ever added anywhere.
- **Survives — the root cause.** The config still declares no `timeout`, so the implicit 30 000 ms
  default is still what an undeclared test inherits. That is why the per-test declarations remain
  load-bearing rather than redundant.
- **Does not survive — the literal sentence.** The file is not unchanged at HEAD.

**The consequence reaches further than this section, and is recorded in `uservalidation.md` and
`state.json` rather than only here.** This packet was verified at the suite's then-configured
**four**-worker parallelism, and that is the condition its decisive acceptance item names. The suite
now runs at two. No run today can reproduce the four-worker condition, so that item is left
unticked. The direction of the change is favourable — 180 000 ms budgets sized for higher contention
have strictly more headroom at lower contention — but "more headroom than required" is not the same
claim as "verified under the named condition", and it is not recorded as if it were.

### Full committed suite at the repository's current parallelism — executed 2026-08-29

**Executed by this run:** YES
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line`
**Claim Source:** executed

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=line
[767/767] [system-chrome] › tests/simple-production-wiring.spec.mjs:979:1 › TP-15-04 the swept set is derived from the production registry + pages
  767 passed (14.8m)
SUITE_EXIT=0
```

Zero failure markers across the whole run, and all five tests in
`tests/causal-rotation-consumers.spec.mjs` are among the 767 (they appear at positions 66, 70, 92,
99 and 100 of the run).

**This run is at TWO workers, not four, and the distinction is load-bearing.** BUG-017 pinned
`workers: 2` after this fix. `SCN-011B-002` says *"When the full committed suite is run exactly as
the repository runs it"*, a clause that tracks the repository's configuration rather than a fixed
number, so this run satisfies the scenario as written. It does **not** reproduce the four-worker
condition, and is not presented as doing so — the pre-existing four-worker evidence above remains
the higher-contention datum for the tree it was taken on.

One caution against over-reading a green result: the budgets under test are 180 000 ms and this
run exercised less contention than the condition that sized them, so it confirms the file is
healthy under today's configuration rather than re-proving the headroom margin.

### Tree state at closeout

**Executed by this run:** YES
**Command:** `git rev-parse --short HEAD`, `git log --oneline`, `git log 5c978c5cb..HEAD -- tests/causal-rotation-consumers.spec.mjs`
**Claim Source:** executed

`HEAD` is `9af68427b` and the working tree is clean. The fix is committed at `5c978c5cb`, whose
message records the packet as `in_progress` precisely because the decisive run had not reported when
it landed; this closeout is what reconciles that. No commit between `5c978c5cb` and `9af68427b`
touches `tests/causal-rotation-consumers.spec.mjs`.

The intervening commits belong to other lines of work — market-brief refreshes, framework 7.28.0,
spec 023 and Feature 026 — and they matter to this packet in exactly one way: they changed the test
inventory and left the selftest red, which is why two DoD items below stay open.

### Packet shape

**Executed by this run:** YES
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget`
**Claim Source:** executed
**Result:** exit 0

This is an artifact-contract check. It says nothing whatsoever about whether the defect is fixed.

## Outstanding Verification

The decisive run reported, and the defect it was aimed at is verified. Three DoD items are still
open, and none of them is the defect.

1. **The post-fix isolated run was never performed.** The contended post-fix result exists and is
   recorded, and it is the stronger condition, but "passes in isolation" names an execution nobody
   ran. Reusing the contended result for it would be a claim about a run that does not exist.
2. **`node scripts/selftest.mjs` was red at the HEAD this section was written — it is green now.**
   That entry recorded 3012 passed / 15 failed and attributed the failures to in-flight Feature 026
   byte-budget and cross-asset work. That work has since landed. Re-run on a clean worktree detached
   at `c26f45919`: `node scripts/selftest.mjs` → **3409 passed, 0 failed**, exit **0**. The item's
   condition — 0 failed, with no reduction in assertion count — now holds on both halves, 3409 being
   well above the 2490 the acceptance item quotes. This blocker is discharged; the checkbox is still
   the operator's to tick.
3. **The 498-test enumeration is stale.** Roughly 99 test declarations landed in 20 unrelated spec
   files after this fix, so the suite necessarily enumerates more now. What this fix did to the
   inventory — nothing, `11 +` / `0 -` with no `test(` declaration changed and no `.skip`/`.fixme` —
   is evidenced; the item as written is not, and it needs re-baselining by whoever owns the current
   inventory rather than reinterpreting to fit.
4. **Two acceptance items were falsified by a later fix, and that fix is mine.** `uservalidation.md`
   requires the decisive run to happen "at its configured four-worker parallelism", and separately
   requires that "`playwright.config.mjs` is unchanged". Commit `13494be66` (2026-08-24,
   `fix(BUG-017): pin the worker count local runs share with the pipeline`) changed that file and
   pinned `workers: 2`. This packet's acceptance text was last written at `cb0dfa610` on 2026-08-19,
   five days earlier, so it could not have anticipated it. Neither item is tickable as written: the
   configured parallelism is now two, not four, and the file is demonstrably changed. The BUG-017
   change is not a defect — it was measured (6/8 runs stalled at six workers, 1/3 at four, 0/3 at
   two) and it is the reason the suite is stable — but it does invalidate the wording here. Only the
   operator can amend `uservalidation.md`, so this is routed rather than repaired: the two items need
   re-baselining to the two-worker configuration, or an explicit note that the four-worker phrasing
   is superseded. No checkbox was touched.

Item 2 is now discharged: the green repository suite it was waiting on exists, measured at 3409
passed / 0 failed. Item 3 still needs a re-baselined inventory, and item 4 needs the operator to
amend two acceptance items that a later fix falsified. Item 1 needs one Playwright invocation that
this run was instructed not to make. None of items 1, 3 or 4 is this packet's defect.

Scenario contracts in `scenario-manifest.json` are left at `not_started`. Three of the five
(`SCN-011B-001`, `-003`, `-004`) are discharged by the evidence above and `-002` by the post-fix
full-suite run, but contract status is the validate owner's to write and this run did not claim it.

### Validation Evidence

**Executed by this run:** YES, on 2026-08-29 at HEAD `adcaa0024` — a later HEAD than the sections
above, which is what gives this section its value.

**Command:** `node scripts/validate-playwright-timeout-budgets.mjs`

```
[timeout-budgets] scanned=80 tests=830 declarations=160 evaluated=160 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
[timeout-budgets] OK — every declared wait fits the test budget that governs it
VALIDATOR_EXIT=0
```

The counts moved from `scanned=67 tests=646 declarations=91` to `scanned=80 tests=830
declarations=160` — the repository grew by 13 files and 69 declarations between the two runs. The
verdict is unchanged at `violations=0`, so the budgets this packet declared remain coherent against
a materially larger corpus, not merely against the tree that produced them.

**Command:** `node scripts/selftest.mjs`

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 3429 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

**This reverses the "Repository selftest — red at this HEAD" section above, and the reversal is the
point.** That section recorded `3012 passed, 15 failed`, exit 1, and correctly declined to tick the
DoD item that requires 0 failed. It also stated a limitation honestly: only five of the fifteen
failures were inspected, so "none of the fifteen touches this packet" was an inference, not a
verified enumeration.

That inference is now confirmed by a stronger measurement than inspection could have provided. The
suite is green at `3429 passed, 0 failed` while this packet's one changed file is byte-identical to
what it was during the red run. Fifteen failures went away without this packet being touched, which
is only consistent with them having belonged to the in-flight Feature 026 work named at the time.
Had any of them been caused by this packet's timeout declarations, they would still be red.

The count also rose from 3012 to 3429 — 417 assertions added by concurrent work — so this is a
re-derivation against a moved tree, not a replay.

**What this validation does NOT establish.** Neither command runs the five Playwright tests this
packet re-budgeted. The budget guard reads declarations statically and the selftest does not drive a
browser. The evidence that those tests survive contention remains the post-fix full-suite run
recorded above; this section proves the declarations stayed coherent and that nothing in the
repository's own suite regressed, which is a different and narrower claim.

### Audit Evidence

**Executed by this run:** YES, on 2026-08-29 at HEAD `adcaa0024`.

**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget`

```
$ bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
LINT_EXIT=0
```

**Change reviewed:** `5c978c5cb` and `ac2b7497d`, together touching exactly one runtime file,
`tests/causal-rotation-consumers.spec.mjs`.

Three findings, none blocking:

1. **The remedy is proportionate and its size is justified in-tree.** The change is five
   `test.setTimeout(180_000)` calls plus one comment. The comment carries the measurement that sizes
   them — 23.7 s of the 30 s default on one worker, 79% of a budget nobody chose — so a later reader
   can re-derive the number rather than trust it. 180 s is roughly 7.6x the measured single-worker
   cost, which is a defensible margin for four-worker contention and is stated as such.

2. **No smaller form exists.** `test.setTimeout` is a per-test Playwright API that must be called
   inside each test body; the five calls cannot be hoisted to one declaration. The apparent
   duplication is required by the framework, not incidental.

3. **The comment does not overclaim.** It states that the settle "is still timing-dependent; only
   its allowance grew" — it does not present a budget increase as a determinism fix. That
   distinction is the one most easily blurred in a timeout change, and it was not blurred.

**Scope of this audit, stated rather than implied.** This reviewed the committed change and the
packet's artifact shape. It did not re-review `design.md` or `scopes.md` against their owning
specialists, which `bug.md` records were never dispatched. That remains true and is not discharged
here.

