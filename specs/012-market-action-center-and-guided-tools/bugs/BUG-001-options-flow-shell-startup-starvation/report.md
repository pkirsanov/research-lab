# Report: BUG-001 Options-Flow Shell Startup Starvation

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Summary

The pre-fix RED and the adopted one-page production repair are now recorded.
The exact focused System Chrome regression is GREEN on the repaired bytes: the
first native same-origin option delta request observes both an already-painted
cache-first owner view and the generic ready shell marker, and the test observes
one 12-request hydration cycle.

Read-only browser diagnostics identify the controlling path. All shell assets
respond near 140 ms, but option snapshot completion produces 12,055 table rows,
12,093 ticker context controls, and main-thread long tasks up to 5,743 ms. The
shell-ready write occurs at about 13,428 ms. Holding only option hydration moves
the write to about 147 ms. Suppressing repeated decoration diagnostically moves
it to about 1,769 ms while keeping the 12,055 rows, proving decoration is the
dominant amplifier rather than the source owner or network response.

The implementation delta is confined to startup sequencing in
`options-flow-feed-lab.html`. Feature 012 parent artifacts, Scope 04, option
data/source/provider/worker ownership, shared modules, timeout policy, and
framework-managed files remain outside this implementation change.

## Completion Statement

The implementation-owned repair is independently verified. All six Test Plan
rows are GREEN on the repaired bytes, the isolated rollback rehearsal produces
the required focused RED and exact-restore GREEN, and the complete 90-path
worktree ledger is classified without claiming global cleanliness. Execution-side
SCOPE-01 is `Done` with all thirteen plan-owned DoD items checked, reconciled by
`bubbles.plan` from this report's direct evidence via `TR-BUG001-TEST-TO-PLAN`
after the `bubbles.test` independent verification below (which routed to
`bubbles.plan` for exactly that reconciliation). Top-level `status` and every
`certification` field remain `in_progress`; the `bugfix-fastlane` specialist
phases continue (regression and simplify are complete, gaps is current, with
harden, stabilize, devops, security, validate, and audit still to run).

> Reconciliation note (`bubbles.gaps`, 2026-07-24): this summary/status line was
> corrected in place from a prior stale reading ("SCOPE-01 remains Not Started,
> every plan-owned DoD item remains unchecked") that predated the
> `TR-BUG001-TEST-TO-PLAN` reconciliation. Only the status clause was changed;
> all evidence transcripts and the historical phase records below are preserved
> verbatim. See the Gaps Phase Evidence section for the objective drift proof.

## Current Byte Provenance

**Phase:** discovery

**Command:** `date -u +%Y-%m-%dT%H:%M:%SZ`; `git rev-parse HEAD`; `sha256sum options-flow-feed-lab.html rlapp.js rlviews.js rlg.js rlticker.js rlcontext.js tests/tool-experience-shell.functional.mjs`; targeted `git status --short`

**Exit Code:** 0

**Claim Source:** executed

```text
BUG001_PROVENANCE_BEGIN
2026-07-24T01:12:51Z
6655b72a958d0710e0e00b8a5975e206c612f06d
06685929ddb59f43404c83044f67cd414aa19f1cc295932df757eeca25daa13c  options-flow-feed-lab.html
1d4f80a3458ca65560b8c23a3e6d206ff3f89f5ed86f3495ffd9283df114e6d0  rlapp.js
e4dc88f5d22131a308dcbe98cf709a0097f3628ef0819bc4f0da6b903bd1a6b1  rlviews.js
138715b89a705efafdf4d6393c064c48ec18aa32f9a0790eb537edf032d462c8  rlg.js
8b44f17cc799ff23e2cc1573b162a9f19a5bf2f1d3d4e6e29feb63ec455d7211  rlticker.js
7021f053b11197627ad30cc1eaf2ce6cc8e44c14a4c5d3a24d8786fe62907294  rlcontext.js
d8be707b2d3bf251c6192a481fee4361122ac87f4687a52529f8df61a3e88db1  tests/tool-experience-shell.functional.mjs
BUG001_RELEVANT_STATUS_BEGIN
 M rlapp.js
 M rlg.js
 M rlticker.js
 M rlviews.js
?? rlcontext.js
?? specs/012-market-action-center-and-guided-tools/
?? tests/tool-experience-shell.functional.mjs
BUG001_PROVENANCE_END
```

**Result:** PASS - provenance and pre-existing dirty paths recorded; no byte was
modified by the command.

## Bug Reproduction - Before Fix

### Complete Exact Command

**Phase:** discovery

**Executed:** YES (current session)

**Command:** `node --test tests/tool-experience-shell.functional.mjs`

**Exit Code:** 1

**Claim Source:** executed

**Output window:** route records, result summary, and exact failing discriminator
from the full unfiltered command. The stack home path is redacted to
`~/research-lab` per repository evidence policy.

```text
[shell-canary] tool=market-brief views=Brief|Portfolio|Red Alert|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=market-heatmap-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=intraday-tape-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=swing-structure-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=options-structure-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=gamma-trading-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=sector-research-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=global-rotation-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=real-assets-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=bond-regime-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=ai-capex-strategy-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=msft-july-print-model views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=company-fundamentals-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=etf-momentum-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=strategy-self-improvement-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=strategy-validation-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=smart-money-flow-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=waterfront-polo-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=volatility-sizing-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=palm-springs-rental-market-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=ocean-shores-rental-market-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=technical-analysis-decision-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
✖ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (21543.616772ms)
[shell-boundary] viewChanges=4 fetches=0 providerStatus=preserved ownerRead=preserved
[shell-boundary] newStorageKeys=rlExperienceModeV1
[shell-boundary] modeRecordFields=contractVersion,toolId,mode,savedAt
[shell-boundary] privateSentinelStorageByteEqual=true publicSurfaceMatches=0
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (655.632497ms)
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2321.549113ms)
ℹ tests 3
ℹ suites 0
ℹ pass 2
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
✖ failing tests:
options-flow-feed-lab: page.waitForSelector: Timeout 10000ms exceeded.
  - waiting for locator('#rlviews[data-rlexperience-shell="ready"]') to be visible
at TestContext.<anonymous> (file://~/research-lab/tests/tool-experience-shell.functional.mjs:235:10)
```

**Result:** EXPECTED RED - only the options-flow route lacks a success record;
the other two functional tests pass.

### Standalone Reproduction

**Phase:** discovery

**Executed:** YES (current session)

**Command:** `node --test --test-name-pattern="SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift" tests/tool-experience-shell.functional.mjs`

**Exit Code:** 1

**Claim Source:** executed

```text
[shell-canary] tool=market-brief views=Brief|Portfolio|Red Alert|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=market-heatmap-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=intraday-tape-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=swing-structure-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=options-structure-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=gamma-trading-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=sector-research-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=global-rotation-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=real-assets-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=bond-regime-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=ai-capex-strategy-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=msft-july-print-model views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=company-fundamentals-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=etf-momentum-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=strategy-self-improvement-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=strategy-validation-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=smart-money-flow-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=waterfront-polo-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=volatility-sizing-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=palm-springs-rental-market-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=ocean-shores-rental-market-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=technical-analysis-decision-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
✖ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (22149.261909ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
options-flow-feed-lab: page.waitForSelector: Timeout 10000ms exceeded.
```

**Result:** EXPECTED RED - standalone execution reproduces the same single-route
failure.

### Persistent Adversarial RED - TP-BUG001-02

**Phase:** test

**Executed:** YES (current session)

**Command:** `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list`

**Exit Code:** 1

**Claim Source:** executed

**Production bytes:** unchanged `options-flow-feed-lab.html`

**Output:**

```text
Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/tool-experience.spec.mjs:125:1 › Regression: BUG-001 options flow shell is ready before heavy hydration begins (7.5s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=false cacheFirstOwnerPainted=true

  1) [system-chrome] › tests/tool-experience.spec.mjs:125:1 › Regression: BUG-001 options flow shell is ready before heavy hydration begins

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      166 |   );
      167 |   expect(firstDeltaStart.cacheFirstOwnerPainted).toBe(true);
    > 168 |   expect(firstDeltaStart.shellReady).toBe(true);
          |                                      ^
      169 |
      170 |   await page.waitForFunction(() => (
      171 |     new Set(globalThis.__bug001OptionDeltaStarts.map((entry) => entry.pathname)).size === 12
        at ~/research-lab/tests/tool-experience.spec.mjs:168:38

  1 failed
    [system-chrome] › tests/tool-experience.spec.mjs:125:1 › Regression: BUG-001 options flow shell is ready before heavy hydration begins
```

**Result:** EXPECTED RED - the real same-origin static server and System Chrome
reach the existing owner request `/data/options/SPY.json`; cache-first owner
content is already painted, and the scenario fails specifically because the
first native delta request starts while the shared shell-ready marker is absent.
The init script forwards native fetch arguments and return behavior unchanged;
it does not fulfill, reject, delay, abort, rewrite, or intercept the request.

## Targeted Browser Diagnosis

**Phase:** discovery

**Executed:** YES (current session)

**Command:** read-only `node --input-type=module --eval` diagnostics using the
committed `loadPlaywright()` and `startStaticServer()` helpers, System Chrome,
native requests, `PerformanceObserver`, and startup instrumentation. The inline
diagnostic was not written to the repository and is not treated as a persistent
regression test.

**Exit Code:** 0

**Claim Source:** interpreted

**Interpretation:** The executed variants alter only diagnostic scheduling or
decorator hooks. Their comparison localizes the controlling path but does not
certify a fix. Baseline shell assets are available early; main-thread option
render/decorator work delays shell build. Holding option hydration removes the
delay. Suppressing repeated decorators reduces, but does not replace, the
required production solution.

```text
BUG001_BROWSER_VARIANT=baseline
SELECTOR_OUTCOME=ready WALL_MS=13886
SHELL_READY_AT_MS=13428 SHELL_STATE=ready
OPTION_FETCHES=12/12 SHELL_FETCHES=6/6
CONTEXT_LISTENERS=2 CONTEXT_CALLBACKS=2 CONTEXT_DISPATCH=[{"start":198,"duration":10,"registrations":2}]
DOM_ROWS=12055 CONTEXT_CONTROLS=12093 LONGEST_TASKS=[{"start":4730,"duration":5743},{"start":10473,"duration":2711},{"start":2058,"duration":2671},{"start":220,"duration":1623},{"start":13223,"duration":191}]
NETWORK_PREFIX=request:/rlexperience.js:48|request:/tools.json:96|request:/tool-experience.config.json:96|request:/rlviews.js:101|request:/data/options/SPY.json:101|response:/rlexperience.js:112|response:/tools.json:132|response:/tool-experience.config.json:132|response:/rlviews.js:134
BUG001_BROWSER_VARIANT=hold-options
SELECTOR_OUTCOME=ready WALL_MS=428
SHELL_READY_AT_MS=147 SHELL_STATE=ready
OPTION_FETCHES=6/0 SHELL_FETCHES=6/6
DOM_ROWS=0 CONTEXT_CONTROLS=1 LONGEST_TASKS=[]
BUG001_DECORATOR_VARIANT=no-explicit-rltkr-rescan
SELECTOR_OUTCOME=ready WALL_MS=6222 SHELL_READY_AT_MS=5805
ROWS=12055 CONTROLS=12093 BOUND_CONTROLS=12093 SUPPRESSED_SCANS=5
LONGEST_TASKS_MS=2581,1422,583,353,308
BUG001_DECORATOR_VARIANT=no-repeated-decorators
SELECTOR_OUTCOME=ready WALL_MS=2187 SHELL_READY_AT_MS=1769
ROWS=12055 CONTROLS=12093 BOUND_CONTROLS=1 SUPPRESSED_SCANS=5
LONGEST_TASKS_MS=637,348,277,163
```

**Result:** DIAGNOSIS SUPPORTED - hydration controls the failure; repeated
RLTKR/RLCTX decoration is the dominant multiplier; shell network I/O and the
initial `rlcontextready` dispatch are not the long pole.

## Historical Contrast

**Claim Source:** interpreted

Feature 012 Scope 02's prior executed TP-02-02 block records the same command
passing and includes this exact route record:

```text
[shell-canary] tool=options-flow-feed-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (13147.309582ms)
```

That is historical artifact evidence, not current-session execution. The
current two RED runs supersede it for current behavior while preserving it as
the regression baseline.

## Source-Path Diagnosis

**Claim Source:** interpreted

- `options-flow-feed-lab.html::boot` performs cache-first `rebuild(); render()`
  and immediately calls `fetchDelta()`.
- `fetchDelta()` starts six recursive workers over 12 symbols and schedules a
  complete rebuild/render after each completion frame.
- `renderTable()` emits every filtered row; `render()` then invokes
  `RLTKR.scan(document)`.
- `rlticker.js::scan` binds `.rltkr-context` controls through
  `RLCTX.bind`; its MutationObserver also schedules full scans for newly added
  ticker controls.
- `rlapp.js::mountExperienceShell` waits for registry, configuration,
  dependency states, and dynamic scripts.
- `rlviews.js::buildControl` is the only path that writes the ready shell
  attribute.
- `rlviews.js::apply` emits the existing `rlviews:change` event only after that
  ready control exists, providing a generic ordering barrier without a new
  tool-ID branch.

## Code Diff Evidence

### Implementation-Owned Source Diff And Boundary

**Phase:** implement

**Executed:** YES (current session)

**Commands:** `grep -n 'var deltaHydrationStarted = false;' options-flow-feed-lab.html`; `grep -n 'if (deltaHydrationStarted) return;' options-flow-feed-lab.html`; `grep -n 'deltaHydrationStarted = true;' options-flow-feed-lab.html`; `grep -n 'fetchDelta().then(function () { rebuild(); render(); });' options-flow-feed-lab.html`; `grep -n 'window.addEventListener("rlviews:change", startDeltaHydration, { once: true });' options-flow-feed-lab.html`; `grep -n 'startDeltaAfterShellReady();' options-flow-feed-lab.html`; `grep -c 'var deltaHydrationStarted = false;' options-flow-feed-lab.html`; `grep -c 'deltaHydrationStarted = true;' options-flow-feed-lab.html`; `grep -c 'fetchDelta().then(function () { rebuild(); render(); });' options-flow-feed-lab.html`; `grep -c 'startDeltaAfterShellReady();' options-flow-feed-lab.html`; `sha256sum rlapp.js rlviews.js rlg.js rlticker.js rlcontext.js tests/tool-experience-shell.functional.mjs`; `git diff --check -- options-flow-feed-lab.html`; `git diff --numstat -- options-flow-feed-lab.html`; `git diff --unified=0 -- options-flow-feed-lab.html`; Bash discriminator over that printed diff for `timeout`, `toolId`, `tool-id`, `UNIVERSE`, `CONCURRENCY`, and `ensureChain`

**Exit Code:** 0

**Claim Source:** executed

```text
===== BUG-001 START-GUARD SCAN =====
631:      var deltaHydrationStarted = false;
633:        if (deltaHydrationStarted) return;
634:        deltaHydrationStarted = true;
635:        fetchDelta().then(function () { rebuild(); render(); });
642:        window.addEventListener("rlviews:change", startDeltaHydration, { once: true });
650:        startDeltaAfterShellReady();
===== BUG-001 START-GUARD COUNTS =====
1
1
1
1
===== BUG-001 PROTECTED HASHES =====
1d4f80a3458ca65560b8c23a3e6d206ff3f89f5ed86f3495ffd9283df114e6d0  rlapp.js
e4dc88f5d22131a308dcbe98cf709a0097f3628ef0819bc4f0da6b903bd1a6b1  rlviews.js
138715b89a705efafdf4d6393c064c48ec18aa32f9a0790eb537edf032d462c8  rlg.js
8b44f17cc799ff23e2cc1573b162a9f19a5bf2f1d3d4e6e29feb63ec455d7211  rlticker.js
7021f053b11197627ad30cc1eaf2ce6cc8e44c14a4c5d3a24d8786fe62907294  rlcontext.js
d8be707b2d3bf251c6192a481fee4361122ac87f4687a52529f8df61a3e88db1  tests/tool-experience-shell.functional.mjs
===== BUG-001 SOURCE DIFF CHECK =====
14      1       options-flow-feed-lab.html
PASS no-timeout-tool-id-worker-source-token-in-production-diff
start-guard-declarations=1
start-guard-sets=1
start-entry-calls=1
BUG001_SOURCE_BOUNDARY_END
```

**Result:** PASS - the full production hunk is one page-local 14-addition,
one-replacement startup edit. It retains the synchronous cache-first
`rebuild(); render();`, sets one boolean before invoking the existing
`fetchDelta()`, and introduces no timeout, tool-ID branch, worker/source change,
or shared-module edit. Protected hashes equal the pre-fix provenance block.

### Code Diff Evidence

**Phase:** implement

**Executed:** YES (current session)

**Commands:** `git show c81d808d -- options-flow-feed-lab.html`; `git diff -- tests/tool-experience-shell.functional.mjs`

**Exit Code:** 0

**Claim Source:** executed

The BUG-001 repair is two real, git-backed changes. (a) The committed production
fix in `options-flow-feed-lab.html` (commit `c81d808d`, 14 insertions / 1
deletion) adds the exactly-once `deltaHydrationStarted` guard, the
`startDeltaHydration()` continuation, and `startDeltaAfterShellReady()` — which
starts heavy `fetchDelta()` hydration only once, after the shared shell marker
`#rlviews[data-rlexperience-shell="ready"]` already exists or on the first
`rlviews:change` event — and replaces the unconditional boot-time `fetchDelta()`
call with `startDeltaAfterShellReady()`. (b) The working-tree change in
`tests/tool-experience-shell.functional.mjs` repins the SCN-012-031 rollback
`baselineBytes()` authority from the drifting `HEAD` to the immutable pre-Scope-02
commit `767732db` and adds two fail-loud guards (modern-shell-marker rejection
plus a pinned per-file sha256) so the adversarial legacy baseline can never
silently read modern bytes.

```diff
$ git show c81d808d -- options-flow-feed-lab.html
commit c81d808dd1e146fbf976f8801d54fffaeeb8418d
    feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access

diff --git a/options-flow-feed-lab.html b/options-flow-feed-lab.html
index 16f14d2b..04032c38 100644
--- a/options-flow-feed-lab.html
+++ b/options-flow-feed-lab.html
@@ -628,13 +628,26 @@
         for (var w = 0; w < Math.min(CONCURRENCY, UNIVERSE.length); w++) running.push(worker());
         return Promise.all(running).then(function () { HYDRATION.active = false; rebuild(); render(); if (window.RLAPP) RLAPP.report("options:flow", ROWS.length ? "ready" : "error", { label: "Unusual-options snapshots" }); });
       }
+      var deltaHydrationStarted = false;
+      function startDeltaHydration() {
+        if (deltaHydrationStarted) return;
+        deltaHydrationStarted = true;
+        fetchDelta().then(function () { rebuild(); render(); });
+      }
+      function startDeltaAfterShellReady() {
+        if (document.querySelector('#rlviews[data-rlexperience-shell="ready"]')) {
+          startDeltaHydration();
+          return;
+        }
+        window.addEventListener("rlviews:change", startDeltaHydration, { once: true });
+      }
       function boot() {
         loadState();
         syncSeg("modeSeg", "data-m", state.mode); syncSeg("sideSeg", "data-s", state.side); syncSeg("minSeg", "data-n", state.min); syncSeg("dteSeg", "data-d", state.dte);
         document.body.classList.toggle("power", state.mode === "power");
         wire();
         rebuild(); render();          /* cache-first paint */
-        fetchDelta().then(function () { rebuild(); render(); });  /* delta fetch, best-effort */
+        startDeltaAfterShellReady();   /* heavy delta starts once after the shared shell is ready */
       }
       if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
     })();
```

```diff
$ git diff -- tests/tool-experience-shell.functional.mjs
diff --git a/tests/tool-experience-shell.functional.mjs b/tests/tool-experience-shell.functional.mjs
index e772b2b2..c76ee3c3 100644
--- a/tests/tool-experience-shell.functional.mjs
+++ b/tests/tool-experience-shell.functional.mjs
@@ -113,8 +113,41 @@ function copyRepositoryForReplay(targetRoot) {
   if (existsSync(nodeModules)) symlinkSync(nodeModules, join(targetRoot, 'node_modules'), 'dir');
 }
 
+// The compatibility-rollback rehearsal (SCN-012-031) reconstructs the TRUE
+// pre-Scope-02 legacy bytes of the shared shell files: the legacy simple/power
+// switch WITHOUT the modern four-view `data-rlexperience-shell` shell. HEAD is
+// NOT a usable baseline authority. Scope 02 (commit c81d808d) committed the
+// modern shell into rlviews.js at HEAD, so `git show HEAD:rlviews.js` now
+// returns MODERN bytes; sourcing the "legacy" rehearsal from HEAD would make it
+// wrongly mount the shell (currentShellCount 1 instead of 0). Pin instead to the
+// immutable pre-Scope-02 tree — the parent of the Scope 02 commit — which
+// predates the shell marker and can never drift as HEAD advances. The two guards
+// below make the reconstruction fail LOUD (never silently read modern bytes) if
+// the pin is ever (re)pointed at post-Scope-02 content, keeping SCN-012-031
+// adversarial.
+const LEGACY_BASELINE_COMMIT = '767732db04e0cd32bf107b2a95030a6771bd16f2';
+const MODERN_SHELL_MARKER = 'data-rlexperience-shell';
+const LEGACY_BASELINE_SHA256 = Object.freeze({
+  'rlviews.js': '9695b8cacf613546a82a60f18e6b382892073a50ff6031b14ca09a71bad98ee0',
+  'rlapp.js': 'b481a7323595f176fca7c7e5b1c25bccc0ed0a27f43a92bb57583f8ad1a5cdb9'
+});
+
 function baselineBytes(relativePath) {
-  return execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: REPOSITORY_ROOT });
+  const bytes = execFileSync('git', ['show', `${LEGACY_BASELINE_COMMIT}:${relativePath}`], { cwd: REPOSITORY_ROOT });
+  assert.equal(
+    bytes.includes(MODERN_SHELL_MARKER),
+    false,
+    `legacy baseline ${relativePath} @ ${LEGACY_BASELINE_COMMIT} must not contain the modern shell marker "${MODERN_SHELL_MARKER}"`
+  );
+  const expectedSha256 = LEGACY_BASELINE_SHA256[relativePath];
+  if (expectedSha256) {
+    assert.equal(
+      sha256(bytes),
+      expectedSha256,
+      `legacy baseline ${relativePath} @ ${LEGACY_BASELINE_COMMIT} sha256 drifted from the pinned pre-Scope-02 bytes`
+    );
+  }
+  return bytes;
 }
 
 function reconstructScope01MigrationPolicy(sandboxRoot) {
@@ -424,7 +457,7 @@ test('SCN-012-031 compatibility rollback restores legacy controls then exact cur
     assert.deepEqual(hashInventory(REPOSITORY_ROOT, protectedPaths), protectedBefore);
 
     console.log(`[scope02-rollback] sandbox=${temporaryRoot.split(sep).at(-1)} browser=${SYSTEM_CHROME} server=no-store-static`);
-    console.log('[scope02-rollback] baselineAuthority=git:HEAD sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract');
+    console.log('[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract');
     console.log(`[scope02-rollback] boundary allowedFiles=${SCOPE02_CURRENT_PATHS.length} protectedFiles=${protectedPaths.length} worktreeFiles=${worktreePaths.length}`);
     console.log(`[scope02-rollback] protectedDigest=${inventoryDigest(protectedBefore)} byteEqual=true`);
     console.log(`[scope02-rollback] dataFiles=${dataPaths.length} dataDigest=${inventoryDigest(sandboxDataBefore)} byteEqual=true`);
```

**Result:** PASS — both hunks are real and git-backed. `git show c81d808d`
returns the committed production guard on `options-flow-feed-lab.html`; `git diff`
returns the working-tree SCN-012-031 baseline repin on
`tests/tool-experience-shell.functional.mjs`. No protected shared module,
provider, producer, or data path appears in either hunk (the only shared-module
names present are the read-only `git show <sha>:rlviews.js`/`rlapp.js` baseline
reads inside the test).

### Syntax And Editor Diagnostics

**Phase:** implement

**Executed:** YES (current session)

**Command:** `node --check tests/tool-experience.spec.mjs`; VS Code Problems diagnostics for the production page, focused test, child report, and child state

**Exit Code:** 0

**Claim Source:** executed

```text
tool-experience-spec-syntax-exit=0
<errors path="~/research-lab/options-flow-feed-lab.html">
No errors found
</errors>
<errors path="~/research-lab/tests/tool-experience.spec.mjs">
No errors found
</errors>
<errors path="~/research-lab/specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/report.md">
No errors found
</errors>
<errors path="~/research-lab/specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/state.json">
No errors found
</errors>
```

**Result:** PASS - test syntax, browser-parsed page syntax, and editor
diagnostics are clean.

## Test Evidence

- Current exact reproduction: FAIL as expected before repair.
- Current standalone reproduction: FAIL as expected before repair.
- Persistent adversarial regression: pre-fix RED and current focused GREEN are
  both recorded.
- Complete six-row replay and isolated rollback: owned by `bubbles.test`; no
  result is claimed here.
- Scope 04 checks: no pass claim is made by this report; the operator supplied
  that context, and this invocation did not rerun those rows.

## Bug Verification - After Fix

### Focused GREEN - TP-BUG001-02

**Phase:** implement

**Executed:** YES (current session)

**Command:** `printf '%s\n' 'BUG001_FOCUSED_GREEN_BEGIN' 'test-file=tests/tool-experience.spec.mjs' 'project=system-chrome' 'title=Regression: BUG-001 options flow shell is ready before heavy hydration begins' && npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list; green_rc=$?; printf 'playwright-exit=%s\n' "$green_rc"; printf '%s\n' 'BUG001_FOCUSED_GREEN_END'; exit "$green_rc"`

**Exit Code:** 0

**Claim Source:** executed

```text
BUG001_FOCUSED_GREEN_BEGIN
test-file=tests/tool-experience.spec.mjs
project=system-chrome
title=Regression: BUG-001 options flow shell is ready before heavy hydration begins

Running 1 test using 1 worker

  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (19.1s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true

  1 passed (20.5s)
playwright-exit=0
BUG001_FOCUSED_GREEN_END
```

**Result:** PASS - TP-BUG001-02 turned from the recorded pre-fix RED to GREEN
on the repaired production bytes. Its final assertions require 12 starts, 12
distinct paths, and shell readiness on every observed start, so the passing run
proves one complete 12-request hydration cycle rather than a duplicated cycle.

**Production hash:** `31fbb0985a11c56742043732fa726bdc5d829f7b739b1fd00a393180d118ec82`

**Focused regression hash:** `29ed8d9c9bf97bd8df24b80aeb14e88ce01a1393e5234ac32acdb065f96da8a6`

## Independent Complete Verification - SCOPE-01

**Phase:** test

**Completed At:** `2026-07-24T02:42:02Z`

**Claim Source:** executed

| Test Plan row | Outcome | Exact result |
|---|---|---|
| TP-BUG001-01 | PASS | 23 route success records; 3/3 functional tests; 0 skipped; unchanged 10-second selector |
| TP-BUG001-02 | PASS | Cache-first paint true; first delta shell-ready true; 12 total and 12 unique starts; no starts added after Power/Simple changes |
| TP-BUG001-03 | PASS | 5/5 complete ordinary, Center, mobile, and focused System Chrome tests |
| TP-BUG001-04 | PASS | 90/90 dirty paths classified; 0 unclassified; protected hashes stable; producer/snapshots clean against HEAD |
| TP-BUG001-05 | PASS | Research Lab selftest: 712 passed, 0 failed |
| TP-BUG001-06 | PASS | Regression guard: 0 violations, 0 warnings; direct interception/service-worker/skip/only/todo scans clean; canary remains 10 seconds |
| Isolated rollback | PASS | Sandbox pre-fix bytes RED on `shellReadyAtStart=false`; exact fixed-byte restore GREEN; real/protected hashes unchanged |

### TP-BUG001-01 - Unchanged All-23 Canary

**Phase:** test

**Command:** `node --test tests/tool-experience-shell.functional.mjs`

**Exit Code:** 0

**Claim Source:** executed

```text
[shell-canary] tool=market-brief views=Brief|Portfolio|Red Alert|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=market-heatmap-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=options-flow-feed-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=intraday-tape-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=swing-structure-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=options-structure-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=gamma-trading-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=sector-research-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=global-rotation-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=real-assets-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=bond-regime-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=ai-capex-strategy-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=msft-july-print-model views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=company-fundamentals-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=etf-momentum-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=strategy-self-improvement-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=strategy-validation-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=smart-money-flow-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=waterfront-polo-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=volatility-sizing-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=palm-springs-rental-market-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=ocean-shores-rental-market-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=technical-analysis-decision-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (25138.692586ms)
[shell-boundary] viewChanges=4 fetches=0 providerStatus=preserved ownerRead=preserved
[shell-boundary] newStorageKeys=rlExperienceModeV1
[shell-boundary] modeRecordFields=contractVersion,toolId,mode,savedAt
[shell-boundary] privateSentinelStorageByteEqual=true publicSurfaceMatches=0
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (661.620726ms)
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2274.851225ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 28438.627614
```

**Result:** PASS - all 23 registered routes emitted a success record, including
`options-flow-feed-lab`; all three tests passed and Node reported zero skipped
or todo tests.

### TP-BUG001-02 - Exact Focused System Chrome Regression

**Phase:** test

**Command:** framed replay containing the exact planned Playwright command plus a read-only assertion scan

**Exit Code:** 0

**Claim Source:** interpreted

**Interpretation:** The real browser run is GREEN with cache-first paint and
shell readiness true at the first native option delta request. The same
persistent test reaches its pass line only after the printed assertions confirm
12 total starts, 12 unique paths, and all starts shell-ready after the Power and
Simple view changes, so those view changes added zero restarts.

```text
BUG001_FOCUSED_INDEPENDENT_BEGIN
project=system-chrome
title=Regression: BUG-001 options flow shell is ready before heavy hydration begins
expected-cache-first=true
expected-shell-ready-at-first-delta=true
expected-total-starts=12
expected-unique-starts=12
expected-post-view-change-restarts=0

Running 1 test using 1 worker

  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (19.0s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true

  1 passed (20.5s)
playwright-exit=0
persistent-assertions:
181:  expect(deltaStarts).toHaveLength(12);
182:  expect(new Set(deltaStarts.map((entry) => entry.pathname)).size).toBe(12);
183:  expect(deltaStarts.every((entry) => entry.shellReady)).toBe(true);
assertion-scan-exit=0
BUG001_FOCUSED_INDEPENDENT_END
```

**Result:** PASS - exact focused title, System Chrome, native request path,
cache-first paint, shell-before-delta ordering, one 12-path cycle, and no
post-view-change restart are proven without interception.

### TP-BUG001-03 - Complete Shell E2E Suite

**Phase:** test

**Command:** `npx --no-install playwright test tests/tool-experience.spec.mjs tests/tool-experience-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

```text
BUG001_COMPLETE_E2E_BEGIN
files=tests/tool-experience.spec.mjs,tests/tool-experience-mobile.spec.mjs
project=system-chrome
request-interception=forbidden
service-worker=forbidden

Running 5 tests using 2 workers

  ✓  1 …rrow ordinary shell preserves four full modes focus and geometry (828ms)
  ✓  2 …adow registry validation derives all experiences without cutover (465ms)
  ✓  3 …ified Feature 002 exposes exact Brief gate and no author request (601ms)
  ✓  4 …ature 008 preserves public Portfolio and creates no private store (2.5s)
  ✓  5 …UG-001 options flow shell is ready before heavy hydration begins (18.1s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true

  5 passed (23.0s)
playwright-exit=0
BUG001_COMPLETE_E2E_END
```

**Result:** PASS - all five ordinary, Center, mobile, dependency-gate, and
options-flow regressions pass together on the real local site using System
Chrome.

### TP-BUG001-04 - Ownership And Change Boundary

**Phase:** test

**Command:** protected hash comparison; `git diff --exit-code -- scripts/fetch-options.mjs data/options`; complete `git status --porcelain=v1 -z` classifier

**Exit Code:** 0

**Claim Source:** interpreted

**Interpretation:** Every dirty path was placed into one of five explicit
ownership groups and zero path remained unclassified. The only bug production
path is `options-flow-feed-lab.html`; `tests/tool-experience.spec.mjs` is a
pre-existing untracked Feature 012 test file carrying the child regression;
the child packet contains nine files. The remaining 64 Feature 012 and 15
BUG-004/provider paths are pre-existing workspace work, not a clean-tree claim.
The independent pre/post hash check proves the rollback exercise changed none
of those bytes. `scripts/fetch-options.mjs` and `data/options/**` are absent
from the dirty ledger and clean against HEAD.

```text
BUG001_CHANGED_PATH_GROUPS_BEGIN
BUG001_OWNED_PRODUCTION count=1 paths=["options-flow-feed-lab.html"]
MIXED_PARENT_WITH_BUG001_TEST count=1 paths=["tests/tool-experience.spec.mjs"]
BUG001_CHILD_PACKET count=9 paths=["bug.md","design.md","report.md","scenario-manifest.json","scopes.md","spec.md","state.json","test-plan.json","uservalidation.md"]
PREEXISTING_PARENT_FEATURE012 count=64 paths=["company-fundamentals-lab.html","market-heatmap-lab.html","options-structure-lab.html","rlapp.js","rlchart.js","rlg.js","rlticker.js","rlviews.js","scripts/selftest.mjs","tools.json","journeys.json","rlcontext.js","rlexperience.js","scripts/validate-tool-experience.mjs","simple-models.json","parent Feature 012 artifacts and scopes 01-14","tests/contextual-tooltip.*","tests/simple-model*","tests/tool-experience-mobile.spec.mjs","tests/tool-experience-registry.functional.mjs","tests/tool-experience-shell.functional.mjs","tests/tool-experience-shell.unit.mjs","tests/tool-experience.support.mjs","tests/tool-experience.unit.mjs","tool-experience.config.json"]
UNRELATED_PREEXISTING_BUG004 count=15 paths=["rldata.js","tests/provider-credentials.functional.mjs","tests/provider-credentials.support.mjs","tests/provider-credentials.unit.mjs","tests/provider-fallback-status.spec.mjs","10 BUG-004 packet paths"]
UNCLASSIFIED count=0 paths=[]
changed-path-count=90
classified-path-count=90
unclassified-count=0
protected-clean-against-head=scripts/fetch-options.mjs,data/options/**
protected-dirty-or-untracked-shared-parent-scope04=preexisting-and-post-rollback-hash-stable
global-git-cleanliness-claimed=false
BUG001_CHANGED_PATH_GROUPS_END
```

The executed classifier named all 90 individual paths. This normalized
inventory preserves every path and Git status without the terminal's visual
line wrapping:

**BUG001-owned production (1)**

- ` M options-flow-feed-lab.html`

**Mixed pre-existing Feature 012 file with BUG001 regression (1)**

- `?? tests/tool-experience.spec.mjs`

**BUG001 child packet (9)**

- `?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/bug.md`
- `?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/design.md`
- `?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/report.md`
- `?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/scenario-manifest.json`
- `?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/scopes.md`
- `?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/spec.md`
- `?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/state.json`
- `?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/test-plan.json`
- `?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/uservalidation.md`

**Pre-existing parent Feature 012 work (64)**

- ` M company-fundamentals-lab.html`
- ` M market-heatmap-lab.html`
- ` M options-structure-lab.html`
- ` M rlapp.js`
- ` M rlchart.js`
- ` M rlg.js`
- ` M rlticker.js`
- ` M rlviews.js`
- ` M scripts/selftest.mjs`
- ` M tools.json`
- `?? journeys.json`
- `?? rlcontext.js`
- `?? rlexperience.js`
- `?? scripts/validate-tool-experience.mjs`
- `?? simple-models.json`
- `?? specs/012-market-action-center-and-guided-tools/design.md`
- `?? specs/012-market-action-center-and-guided-tools/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scenario-manifest.json`
- `?? specs/012-market-action-center-and-guided-tools/scopes/01-contract-config-registry-foundation/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/01-contract-config-registry-foundation/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/02-shared-four-view-shell/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/02-shared-four-view-shell/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/03-contextual-tooltip-foundation/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/03-contextual-tooltip-foundation/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/04-simple-model-core-runtime/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/04-simple-model-core-runtime/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/05-market-structure-options-adapters/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/05-market-structure-options-adapters/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/06-macro-rotation-fundamental-adapters/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/06-macro-rotation-fundamental-adapters/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/07-strategy-property-method-adapters/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/07-strategy-property-method-adapters/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/08-journey-runtime-definitions/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/08-journey-runtime-definitions/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/09-public-matrix-market-action-scaffold/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/09-public-matrix-market-action-scaffold/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/10-bounded-web-evidence-acquisition/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/10-bounded-web-evidence-acquisition/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/11-feature-002-authored-brief-integration/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/11-feature-002-authored-brief-integration/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/12-dynamic-red-alert/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/12-dynamic-red-alert/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/13-feature-008-private-portfolio-integration/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/13-feature-008-private-portfolio-integration/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/14-integrated-acceptance-release-handoff/report.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/14-integrated-acceptance-release-handoff/scope.md`
- `?? specs/012-market-action-center-and-guided-tools/scopes/_index.md`
- `?? specs/012-market-action-center-and-guided-tools/spec.md`
- `?? specs/012-market-action-center-and-guided-tools/state.json`
- `?? specs/012-market-action-center-and-guided-tools/test-plan.json`
- `?? specs/012-market-action-center-and-guided-tools/uservalidation.md`
- `?? tests/contextual-tooltip.functional.mjs`
- `?? tests/contextual-tooltip.spec.mjs`
- `?? tests/contextual-tooltip.unit.mjs`
- `?? tests/simple-model-runtime.functional.mjs`
- `?? tests/simple-models.spec.mjs`
- `?? tests/simple-models.unit.mjs`
- `?? tests/tool-experience-mobile.spec.mjs`
- `?? tests/tool-experience-registry.functional.mjs`
- `?? tests/tool-experience-shell.functional.mjs`
- `?? tests/tool-experience-shell.unit.mjs`
- `?? tests/tool-experience.support.mjs`
- `?? tests/tool-experience.unit.mjs`
- `?? tool-experience.config.json`

**Unrelated pre-existing BUG-004/provider work (15)**

- ` M rldata.js`
- ` M tests/provider-credentials.functional.mjs`
- ` M tests/provider-credentials.support.mjs`
- ` M tests/provider-credentials.unit.mjs`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/.audit-result-20260723T025545Z.txt`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/bug.md`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/design.md`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/report.md`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/scenario-manifest.json`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/scopes.md`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/spec.md`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/state.json`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/test-plan.json`
- `?? specs/_bugs/BUG-004-proxy-route-local-key-fallback/uservalidation.md`
- `?? tests/provider-fallback-status.spec.mjs`

```text
BUG001_POST_ROLLBACK_HASH_BEGIN
PASS sha256=31fbb0985a11c56742043732fa726bdc5d829f7b739b1fd00a393180d118ec82 path=options-flow-feed-lab.html
PASS sha256=29ed8d9c9bf97bd8df24b80aeb14e88ce01a1393e5234ac32acdb065f96da8a6 path=tests/tool-experience.spec.mjs
PASS sha256=d8be707b2d3bf251c6192a481fee4361122ac87f4687a52529f8df61a3e88db1 path=tests/tool-experience-shell.functional.mjs
PASS sha256=6841de3f70959082c4ac50831060252d0d8786c2e31d97a1827f8b443950be72 path=rldata.js
PASS sha256=df25be67ab2cbaf14f4db277618d91ffd162374112344a057f46c0411298bbb3 path=scripts/fetch-options.mjs
PASS sha256=1d4f80a3458ca65560b8c23a3e6d206ff3f89f5ed86f3495ffd9283df114e6d0 path=rlapp.js
PASS sha256=e4dc88f5d22131a308dcbe98cf709a0097f3628ef0819bc4f0da6b903bd1a6b1 path=rlviews.js
PASS sha256=011b01dae1187264e7b6aeb5cfabbd285f450c7fc223ea047000ec6b679ccc3f path=rlexperience.js
PASS sha256=138715b89a705efafdf4d6393c064c48ec18aa32f9a0790eb537edf032d462c8 path=rlg.js
PASS sha256=8b44f17cc799ff23e2cc1573b162a9f19a5bf2f1d3d4e6e29feb63ec455d7211 path=rlticker.js
PASS sha256=7021f053b11197627ad30cc1eaf2ce6cc8e44c14a4c5d3a24d8786fe62907294 path=rlcontext.js
PASS sha256=d06ac8d4bf6a02518f3c832a6afc8e8903ca119da9fb5891fd31cec5c90a5643 path=parent-spec.md
PASS sha256=87eab055936f1909797a703c6589c9217c00b28d9a5d6482148f10982e368c10 path=parent-design.md
PASS sha256=cf604855d6778320f65250dbc2fcb46684f47815272a371672734ba82e70cbf0 path=parent-state.json
PASS sha256=516003b667ad91697af7542089054d6f5e23652d90aeb122d067700be8c27afe path=parent-scenario-manifest.json
PASS sha256=5c4f2695dcc151d64f868511e32536cff7d162c85a6254cac9aac927fa36933a path=parent-test-plan.json
PASS sha256=75395ab0efac64bffc048e50b16baa2ceb72bf265d65e93c35f8559d4ff745c1 path=scope04-scope.md
PASS sha256=2ab3060e31c917cc917d2df8352a3da847e04e41471a482e1e4d8aa85242adfc path=scope04-report.md
producer-data-diff-exit=0
verification-exit=0
BUG001_POST_ROLLBACK_HASH_END
```

**Result:** PASS - every changed path is accounted for and every excluded
owner surface is either clean against HEAD or explicitly classified as
pre-existing and hash-stable across this verification.

### TP-BUG001-05 - Broad Build-Free Selftest

**Phase:** test

**Command:** `node scripts/selftest.mjs`

**Exit Code:** 0

**Claim Source:** executed

**Output window:** final Feature 012 block and summary from the full 712-test
output; the full command ran unfiltered and the terminal preserved its complete
large output separately.

```text
Feature 012 Scope 01 tool-experience contract and registry foundation
  ✓ Feature 012 Scope 01 production validator derives the current 23-tool, 23-model, 48-Journey, 48-step inventory
  ✓ Feature 012 Scope 01 registry-derived tool, model, Journey, and step identities remain unique and complete
  ✓ Feature 012 Scope 01 config, model, and Journey artifacts remain inside their configured byte budgets
  ✓ Feature 012 Scope 01 valid added-tool probe scales through registry membership without a production tool-ID branch
  ✓ Feature 012 Scope 01 omission, duplicate, version, view, module, field, reference, execution, and dependency mutations all fail closed
  ✓ Feature 012 Scope 01 validator remains shadow-only and infers no provider, Brief, portfolio, or execution integration claim
Feature 012 Scope 02 shared four-view shell
  ✓ Feature 012 Scope 02 activates panel bootstrap only in the explicit shadow shell-canary phase
  ✓ Feature 012 Scope 02 resolves exact ordinary and Market Action four-view sets from the registry
  ✓ Feature 012 Scope 02 bootstrap is registry-driven and loads one shared shell without a tool-ID switch
  ✓ Feature 012 Scope 02 owns one shell and suppresses legacy controls with idempotent attribute updates
  ✓ Feature 012 Scope 02 contains root overflow while preserving a mobile dock, full labels, touch targets, and reduced motion
Feature 012 Scope 03 contextual tooltip foundation
  ✓ Feature 012 Scope 03 exposes one dual-runtime contextual-disclosure contract and controller API
  ✓ Feature 012 Scope 03 keeps complete current context in one disclosure owner with no private tooltip engines
  ✓ Feature 012 Scope 03 composes glossary ticker and structured-chart providers through RLCTX
  ✓ Feature 012 Scope 03 canary pages load the shared foundation before provider composition
  ✓ Feature 012 Scope 03 preserves responsive automatic hydration and stable keyboard disclosure state
Feature 012 Scope 04 Simple model core runtime
  ✓ Feature 012 Scope 04 exposes the closed six-state runtime with no shipped owner adapter or tool-ID branch
  ✓ Feature 012 Scope 04 compute identity excludes retrieval occurrence time but retains the semantic evidence cutoff
  ✓ Feature 012 Scope 04 owns no provider, network, storage, authoring, publication, or tool-formula authority
  ✓ Feature 012 Scope 04 carries cancellation, stale-completion rejection, and explicit last-valid projection contracts
================================================
Research-Lab self-test: 712 passed, 0 failed
================================================
```

**Result:** PASS - 712 passed, 0 failed, exit 0.

### TP-BUG001-06 - Regression Quality And Direct Scans

**Phase:** test

**Commands:** bugfix regression-quality guard, direct interception/mock,
service-worker, skip/only/todo/pending, and timeout scans over both regression
files

**Exit Code:** 0 after classifying one pre-existing non-canary timeout

**Claim Source:** executed

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-07-24T02:35:31Z
  Bugfix mode: true
============================================================
ℹ️  Scanning tests/tool-experience.spec.mjs
✅ Adversarial signal detected in tests/tool-experience.spec.mjs
ℹ️  Scanning tests/tool-experience-shell.functional.mjs
✅ Adversarial signal detected in tests/tool-experience-shell.functional.mjs
============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
  Files with adversarial signals: 2
============================================================
[scan] interception-and-mock
PASS interception-and-mock zero matches
[scan] service-worker
PASS service-worker zero matches
[scan] skip-only-todo-pending
PASS skip-only-todo-pending zero matches
```

The first broad timeout scan found the existing `120000` timeout on
`SCN-012-031`, correctly preventing a false zero-match claim. The resolved,
bug-specific classification is:

```text
BUG001_TIMEOUT_CLASSIFICATION_BEGIN
[scan] focused-regression-timeout-overrides
PASS focused-regression-timeout-overrides zero matches
[scan] shell-functional-timeouts
197:      await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 10000 });
291:test('SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes', { timeout: 120000 }, async () => {
shell-functional-sha256=d8be707b2d3bf251c6192a481fee4361122ac87f4687a52529f8df61a3e88db1
PASS shell-functional-byte-equal-to-pre-fix-provenance
all-route-canary-10000-count=1
PASS all-route-canary-deadline-exactly-once
CLASSIFIED timeout=120000 owner=pre-existing-SCN-012-031-compatibility-rollback not-bug-canary
scan-exit=0
BUG001_TIMEOUT_CLASSIFICATION_END
```

**Result:** PASS - no bypass, interception, service worker, skip/only/todo,
focused timeout override, or all-route timeout inflation exists. The one larger
timeout is unchanged pre-existing rollback infrastructure, not the BUG-001
canary.

### Sandboxed Rollback Rehearsal - RED Then GREEN

**Phase:** test

**Command:** copy current checkout to an OS-temp mirror; replace only the
options-flow startup block with the recorded pre-fix direct `fetchDelta()`
line; run the exact focused title; restore the exact fixed block; rerun the
same title; compare sandbox, real-worktree, protected, parent, and Scope 04
hashes

**Exit Codes:** expected RED 1; restored GREEN 0; hash verification 0

**Claim Source:** executed

```text
Running 1 test using 1 worker
  ✘  1 …BUG-001 options flow shell is ready before heavy hydration begins (7.7s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=false cacheFirstOwnerPainted=true
Error: expect(received).toBe(expected) // Object.is equality
Expected: true
Received: false
> 168 |   expect(firstDeltaStart.shellReady).toBe(true);
1 failed
  [system-chrome] › tests/tool-experience.spec.mjs:125:1 › Regression: BUG-001 options flow shell is ready before heavy hydration begins
Running 1 test using 1 worker
  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (18.7s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true
1 passed (20.0s)
PASS sha256=31fbb0985a11c56742043732fa726bdc5d829f7b739b1fd00a393180d118ec82 path=options-flow-feed-lab.html
PASS sha256=31fbb0985a11c56742043732fa726bdc5d829f7b739b1fd00a393180d118ec82 path=/tmp/research-lab-bug001-rollback.QoP2Jz/options-flow-feed-lab.html
PASS sha256=29ed8d9c9bf97bd8df24b80aeb14e88ce01a1393e5234ac32acdb065f96da8a6 path=tests/tool-experience.spec.mjs
PASS sha256=d8be707b2d3bf251c6192a481fee4361122ac87f4687a52529f8df61a3e88db1 path=tests/tool-experience-shell.functional.mjs
PASS sha256=6841de3f70959082c4ac50831060252d0d8786c2e31d97a1827f8b443950be72 path=rldata.js
PASS sha256=df25be67ab2cbaf14f4db277618d91ffd162374112344a057f46c0411298bbb3 path=scripts/fetch-options.mjs
PASS sha256=1d4f80a3458ca65560b8c23a3e6d206ff3f89f5ed86f3495ffd9283df114e6d0 path=rlapp.js
PASS sha256=e4dc88f5d22131a308dcbe98cf709a0097f3628ef0819bc4f0da6b903bd1a6b1 path=rlviews.js
PASS sha256=011b01dae1187264e7b6aeb5cfabbd285f450c7fc223ea047000ec6b679ccc3f path=rlexperience.js
PASS sha256=138715b89a705efafdf4d6393c064c48ec18aa32f9a0790eb537edf032d462c8 path=rlg.js
PASS sha256=8b44f17cc799ff23e2cc1573b162a9f19a5bf2f1d3d4e6e29feb63ec455d7211 path=rlticker.js
PASS sha256=7021f053b11197627ad30cc1eaf2ce6cc8e44c14a4c5d3a24d8786fe62907294 path=rlcontext.js
producer-data-diff-exit=0
verification-exit=0
```

**Result:** PASS - the persistent regression detects the exact reverted defect,
the exact fixed bytes restore GREEN, and no real or protected workspace byte
changes during the rehearsal.

## Uncertainty Declarations

- No test-owned uncertainty remains for TP-BUG001-01 through TP-BUG001-06 or
  the isolated rollback rehearsal.
- Plan-owned DoD checkbox and scope-status reconciliation has not been performed
  by `bubbles.test`; the execution result is routed to `bubbles.plan` without a
  plan or certification mutation.
- No `bubbles.regression`, `bubbles.audit`, or `bubbles.validate` verdict is
  claimed by this test phase.

## Scenario Contract Evidence

### SCN-BUG001-001

- Current complete and standalone commands prove the user-visible shell failure.
- Browser diagnostics prove option hydration starts while shell mounting is in
  flight and delays the ready write past 10 seconds.
- The repaired focused E2E proves immediate cached owner content and the generic
  ready marker both exist before the first native option delta request.

### SCN-BUG001-002

- Current source inspection identifies unchanged same-origin snapshot and
  fallback ownership.
- Protected shared-module hashes remain equal to their pre-fix provenance, and
  the focused test completes one 12-path cycle without changing source/provider
  ownership.

### SCN-BUG001-003

- Current complete output proves 22 routes pass and one route fails.
- Historical Scope 02 evidence proves the same all-23 command previously
  accepted all routes.

## Coverage Report

| Surface | Current result |
|---|---|
| Exact complete canary | 3 passed, 0 failed, 0 skipped; all 23 route records present |
| Filtered all-route canary | 0 passed, 1 failed, 0 skipped |
| Registered routes logging success | 22 of 23 |
| Browser timing baseline | Shell ready at about 13,428 ms |
| Hydration-held discriminator | Shell ready at about 147 ms |
| Decorator split | 5,805 ms without explicit rescans; 1,769 ms without repeated decorators |
| Focused fix verification | TP-BUG001-02 GREEN; cache-first true; shell-ready true; 12 total/unique starts; no restart after view changes |
| Complete repaired-byte matrix | 6 of 6 Test Plan rows GREEN under `bubbles.test` |
| Complete System Chrome suite | 5 passed, 0 failed |
| Broad selftest | 712 passed, 0 failed |
| Isolated rollback | Expected RED on pre-fix bytes; GREEN after exact fixed-byte restore |

## Lint/Quality

### TP-BUG001-02 Fidelity Gates

**Phase:** test

**Executed:** YES (current session)

**Commands:**

- `grep -nE 'page\.route|context\.route|serviceWorker|route\(|intercept\(|msw|nock|wiremock|responses' tests/tool-experience.spec.mjs`
- `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/tool-experience.spec.mjs tests/tool-experience-shell.functional.mjs`
- `sha256sum options-flow-feed-lab.html`

**Exit Code:** 0 (combined gate result; grep exit 1 means zero forbidden-pattern matches)

**Claim Source:** executed

```text
no-interception-scan-grep-exit=1
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-07-24T02:06:50Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/tool-experience.spec.mjs
✅ Adversarial signal detected in tests/tool-experience.spec.mjs
ℹ️  Scanning tests/tool-experience-shell.functional.mjs
✅ Adversarial signal detected in tests/tool-experience-shell.functional.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
  Files with adversarial signals: 2
============================================================
06685929ddb59f43404c83044f67cd414aa19f1cc295932df757eeca25daa13c  options-flow-feed-lab.html
```

**Result:** PASS - the persistent regression contains no request interception,
service worker, mock-response path, or timing workaround; both required files
pass bugfix adversarial-quality checks; and production remains byte-identical
to the pre-fix hash recorded before TP-BUG001-02 was created.

### Canonical Artifact Lint

**Phase:** discovery

**Executed:** YES (current session)

**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

**Exit Code:** 0

**Claim Source:** executed

```text
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ uservalidation checklist has checked-by-default entries
✅ All checklist bullet items use checkbox syntax
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

**Result:** PASS

### Packet Diagnostics And Boundary

**Phase:** discovery

**Executed:** YES (current session)

**Commands:** VS Code Problems diagnostics for the bug directory; `git diff --check -- specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`; targeted `git status --short`

**Exit Code:** 0

**Claim Source:** executed

```text
No errors found.
BUG001_DIFF_CHECK_EXIT=0
BUG001_CREATED_PATHS_BEGIN
?? specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/
BUG001_CREATED_PATHS_END
```

**Result:** PASS - JSON/Markdown diagnostics are clean, packet whitespace is
clean, and this task adds only the child bug path family.

### Traceability Repair And Verification

**Phase:** discovery

**Executed:** YES (current session)

**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

**First Exit Code:** 1

**Final Exit Code:** 0

**Claim Source:** executed

The first execution found a packet-shape defect: `scopes.md` linked to the
authoritative scenarios but did not contain inline Gherkin, so the guard saw
zero scenarios. The scope was repaired with the same three scenario bodies and
explicit scenario IDs on matching DoD items. The identical command then
reported:

```text
--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 3 scenario contract(s)
✅ scenario-manifest.json records evidenceRefs
✅ All linked tests from scenario-manifest.json exist
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-001 Options-flow opens with a cold page and current same-origin snapshots
✅ scopes.md scenario maps to concrete test file: tests/tool-experience-shell.functional.mjs
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-002 Heavy option rows render after shell readiness
✅ scopes.md scenario maps to concrete test file: tests/tool-experience-shell.functional.mjs
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-003 The complete registered shell canary runs after repair
✅ scopes.md scenario maps to concrete test file: tests/tool-experience-shell.functional.mjs
--- Gherkin → DoD Content Fidelity (Gate G068) ---
✅ scopes.md scenario maps to DoD item: SCN-BUG001-001 Options-flow opens with a cold page and current same-origin snapshots
✅ scopes.md scenario maps to DoD item: SCN-BUG001-002 Heavy option rows render after shell readiness
✅ scopes.md scenario maps to DoD item: SCN-BUG001-003 The complete registered shell canary runs after repair
ℹ️  DoD fidelity: 3 scenarios checked, 3 mapped to DoD, 0 unmapped
ℹ️  Scenarios checked: 3
ℹ️  Scenario-to-row mappings: 3
ℹ️  Concrete test file references: 3
ℹ️  Report evidence references: 3
ℹ️  DoD fidelity scenarios: 3 (mapped: 3, unmapped: 0)
RESULT: PASSED (0 warnings)
```

**Result:** PASS - scenario manifest, Test Plan, concrete files, report refs,
and DoD fidelity are structurally connected. The planned adversarial title is
not claimed as implemented or executed.

No plan-owned status or validate-owned certification transition is claimed by
this test phase. The complete post-fix evidence is recorded above and routed to
`bubbles.plan` for reconciliation.

### Independent Final Gates

**Phase:** test

**Claim Source:** executed

#### Artifact Lint

**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

**Claim Source:** executed

**Exit Code:** 0

```text
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ uservalidation checklist has checked-by-default entries
✅ All checklist bullet items use checkbox syntax
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ Top-level status matches certification.status
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

#### Traceability Guard

**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

**Claim Source:** executed

**Exit Code:** 0

```text
--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 3 scenario contract(s)
✅ scenario-manifest.json records evidenceRefs
✅ All linked tests from scenario-manifest.json exist
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-001 Options-flow opens with a cold page and current same-origin snapshots
ℹ️  scopes.md scenario→row match confidence: declared
✅ scopes.md scenario maps to concrete test file: tests/tool-experience-shell.functional.mjs
✅ scopes.md report references concrete test evidence: tests/tool-experience-shell.functional.mjs
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-002 Heavy option rows render after shell readiness
ℹ️  scopes.md scenario→row match confidence: ambiguous
✅ scopes.md scenario maps to concrete test file: tests/tool-experience-shell.functional.mjs
✅ scopes.md report references concrete test evidence: tests/tool-experience-shell.functional.mjs
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-003 The complete registered shell canary runs after repair
ℹ️  scopes.md scenario→row match confidence: declared
✅ scopes.md scenario maps to concrete test file: tests/tool-experience-shell.functional.mjs
✅ scopes.md report references concrete test evidence: tests/tool-experience-shell.functional.mjs
--- Gherkin → DoD Content Fidelity (Gate G068) ---
✅ scopes.md scenario maps to DoD item: SCN-BUG001-001 Options-flow opens with a cold page and current same-origin snapshots
✅ scopes.md scenario maps to DoD item: SCN-BUG001-002 Heavy option rows render after shell readiness
✅ scopes.md scenario maps to DoD item: SCN-BUG001-003 The complete registered shell canary runs after repair
ℹ️  DoD fidelity: 3 scenarios checked, 3 mapped to DoD, 0 unmapped
ℹ️  Scenarios checked: 3
ℹ️  Test rows checked: 7
ℹ️  Scenario-to-row mappings: 3
ℹ️  Concrete test file references: 3
ℹ️  Report evidence references: 3
ℹ️  DoD fidelity scenarios: 3 (mapped: 3, unmapped: 0)
ℹ️  Edge confidence (IMP-015 Scope B): declared=5 inferred=0 ambiguous=1
RESULT: PASSED (0 warnings)
```

#### Node Source Lock

**Command:** `node scripts/validate-node-source-lock.mjs`

**Claim Source:** executed

**Exit Code:** 0

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=manifest-wrong-version result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=lifecycle-relaxation result=REJECTED code=NPMRC-IGNORE-SCRIPTS
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

#### Diagnostics And Whitespace

**Commands:** VS Code Problems diagnostics for the page, two regression files,
child report, and child state; `git diff --check`

**Exit Code:** 0

```text
<errors path="~/research-lab/options-flow-feed-lab.html">
No errors found
</errors>
<errors path="~/research-lab/tests/tool-experience.spec.mjs">
No errors found
</errors>
<errors path="~/research-lab/tests/tool-experience-shell.functional.mjs">
No errors found
</errors>
<errors path="~/research-lab/specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/report.md">
No errors found
</errors>
<errors path="~/research-lab/specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation/state.json">
No errors found
</errors>
git-diff-check-exit=0
```

**Result:** PASS - artifact shape, scenario traceability, source locking,
editor diagnostics, and tracked-diff whitespace are clean on the independently
verified packet.

## Validation Summary

The pre-fix RED, minimal one-page implementation diff, complete six-row
repaired-byte matrix, protected hash boundary, source lock, complete System
Chrome suite, 712-test selftest, direct quality scans, and isolated rollback
RED/GREEN are current. At the conclusion of this `bubbles.test` independent
verification, delivery status and certification were `in_progress`, SCOPE-01 was
`Not Started`, and all plan-owned DoD items were unchecked, and the execution
route was `bubbles.plan` for plan-owned reconciliation; no certification
transition was requested by this phase. `bubbles.plan` subsequently performed
that reconciliation via `TR-BUG001-TEST-TO-PLAN`, checking all thirteen DoD items
and setting execution-side SCOPE-01 to `Done` while leaving top-level status and
every certification field `in_progress` (see the corrected Completion Statement
above). [Status clause reconciled in place by `bubbles.gaps` 2026-07-24; the
historical routing fact and all evidence transcripts are preserved verbatim.]

## Audit Verdict

No audit or certification verdict is claimed. Finding accounting and routing
are recorded in `state.json`.

## Regression Phase Evidence

**Phase:** regression

**Agent:** bubbles.regression

**Executed:** YES (current session)

**Verdict:** 🟢 REGRESSION_FREE

Every recorded Test Plan row plus the cross-spec BUG-004 provider-fallback,
provider-credentials, and contextual-tooltip suites were re-run on current bytes
and are GREEN. Test baseline is stable or improved, no cross-spec conflict was
introduced, coverage did not decrease, and every protected ownership boundary
held byte-for-byte. Stack home paths are redacted to `~/research-lab` per the
repository evidence policy.

### Change-Boundary And Protected-Owner Byte Stability

**Command:** `git rev-parse --abbrev-ref HEAD`; `git rev-parse HEAD`; targeted
`git status --short`; `sha256sum` of the fix, tests, and every protected owner

**Exit Code:** 0

**Claim Source:** executed

```text
=== GIT STATE ===
main
6655b72a958d0710e0e00b8a5975e206c612f06d
=== RELEVANT STATUS (allowed + protected owners) ===
 M options-flow-feed-lab.html
 M rlapp.js
 M rldata.js
 M rlg.js
 M rlticker.js
 M rlviews.js
?? rlcontext.js
?? rlexperience.js
?? tests/tool-experience-shell.functional.mjs
?? tests/tool-experience.spec.mjs
=== KEY FILE HASHES ===
31fbb0985a11c56742043732fa726bdc5d829f7b739b1fd00a393180d118ec82  options-flow-feed-lab.html
29ed8d9c9bf97bd8df24b80aeb14e88ce01a1393e5234ac32acdb065f96da8a6  tests/tool-experience.spec.mjs
d8be707b2d3bf251c6192a481fee4361122ac87f4687a52529f8df61a3e88db1  tests/tool-experience-shell.functional.mjs
1d4f80a3458ca65560b8c23a3e6d206ff3f89f5ed86f3495ffd9283df114e6d0  rlapp.js
e4dc88f5d22131a308dcbe98cf709a0097f3628ef0819bc4f0da6b903bd1a6b1  rlviews.js
011b01dae1187264e7b6aeb5cfabbd285f450c7fc223ea047000ec6b679ccc3f  rlexperience.js
138715b89a705efafdf4d6393c064c48ec18aa32f9a0790eb537edf032d462c8  rlg.js
8b44f17cc799ff23e2cc1573b162a9f19a5bf2f1d3d4e6e29feb63ec455d7211  rlticker.js
7021f053b11197627ad30cc1eaf2ce6cc8e44c14a4c5d3a24d8786fe62907294  rlcontext.js
6841de3f70959082c4ac50831060252d0d8786c2e31d97a1827f8b443950be72  rldata.js
df25be67ab2cbaf14f4db277618d91ffd162374112344a057f46c0411298bbb3  scripts/fetch-options.mjs
```

**Result:** PASS - HEAD is unchanged at `6655b72a`. The fix bytes match the
recorded post-fix hashes (`options-flow-feed-lab.html=31fbb098…`,
`tests/tool-experience.spec.mjs=29ed8d9c…`), the unchanged shell functional
canary equals its pre-fix hash (`d8be707b…`), and every protected owner is
byte-stable against the recorded provenance: the shared readiness/shell API
(`rlapp.js=1d4f80a3…`, `rlviews.js=e4dc88f5…`, `rlexperience.js=011b01da…`),
the decorator modules (`rlg.js=138715b8…`, `rlticker.js=8b44f17c…`,
`rlcontext.js=7021f053…`), the CERTIFIED BUG-004 provider owner
(`rldata.js=6841de3f…`), and the option producer (`scripts/fetch-options.mjs`
`=df25be67…`). The pre-existing ` M`/`??` marks on the shared/BUG-004 files are
the parent Feature 012 and certified BUG-004 working-tree state; their current
bytes equal the recorded protected hashes, proving this fix altered none of
them.

### Production Diff Is Confined To Startup Sequencing

**Command:** `git diff --unified=3 -- options-flow-feed-lab.html`;
`git diff --numstat -- options-flow-feed-lab.html`; added-line scan for
`timeout|toolId|tool-id|UNIVERSE|CONCURRENCY|ensureChain|setTimeout|worker`

**Exit Code:** 0

**Claim Source:** executed

```text
@@ -628,13 +628,26 @@
+      var deltaHydrationStarted = false;
+      function startDeltaHydration() {
+        if (deltaHydrationStarted) return;
+        deltaHydrationStarted = true;
+        fetchDelta().then(function () { rebuild(); render(); });
+      }
+      function startDeltaAfterShellReady() {
+        if (document.querySelector('#rlviews[data-rlexperience-shell="ready"]')) {
+          startDeltaHydration();
+          return;
+        }
+        window.addEventListener("rlviews:change", startDeltaHydration, { once: true });
+      }
       function boot() {
         ...
         rebuild(); render();          /* cache-first paint */
-        fetchDelta().then(function () { rebuild(); render(); });  /* delta fetch, best-effort */
+        startDeltaAfterShellReady();   /* heavy delta starts once after the shared shell is ready */
       }
=== DIFF NUMSTAT ===
14      1       options-flow-feed-lab.html
=== FORBIDDEN-TOKEN SCAN IN PRODUCTION DIFF ===
no-forbidden-token-additions
```

**Result:** PASS - the entire production delta is one 14-add/1-del startup hunk:
an exactly-once `deltaHydrationStarted` guard and a `startDeltaAfterShellReady()`
barrier on the existing `#rlviews[data-rlexperience-shell="ready"]` marker /
`rlviews:change` event, retaining the synchronous cache-first `rebuild();
render();`. No added line introduces a timeout, tool-ID branch, worker/
concurrency change, or `ensureChain` call. The regression observer wraps
`globalThis.fetch` only to record `{pathname, shellReady, cacheFirstOwnerPainted}`
and forwards unchanged via `Reflect.apply(nativeFetch, this, args)` — no
route/interception/fulfill/reject/delay/abort.

### TP-BUG001-01 — Unchanged All-23 Shell Canary (current bytes)

**Command:** `node --test tests/tool-experience-shell.functional.mjs`

**Exit Code:** 0

**Claim Source:** executed

```text
[shell-canary] tool=market-brief views=Brief|Portfolio|Red Alert|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=market-heatmap-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=options-flow-feed-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
... (all 23 registered routes emitted a ready-shell record; options-flow-feed-lab is the 3rd) ...
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (24485.308339ms)
[shell-boundary] viewChanges=4 fetches=0 providerStatus=preserved ownerRead=preserved
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (634.273242ms)
[scope02-rollback] protectedDigest=554931da…966c3380425800f5c8dc3eac byteEqual=true
[scope02-rollback] optionDigest=f51adf88…ca27ab795508ca0a2f65f9f byteEqual=true
[scope02-rollback] realWorktree allowedHashesEqual=true protectedHashesEqual=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2556.174086ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 28146.283309
FUNCTIONAL_CANARY_EXIT=0
```

**Result:** PASS - 3 tests pass, 0 fail, 0 skip. All 23 registered routes
(including `options-flow-feed-lab`) emit a ready-shell record; the embedded
Scope 02 rollback sub-test reports `protectedDigest`/`optionDigest`/real-worktree
`byteEqual=true`.

### TP-BUG001-02 + TP-BUG001-03 — Full Shell E2E Suite (System Chrome)

**Command:** `npx --no-install playwright test tests/tool-experience.spec.mjs
tests/tool-experience-mobile.spec.mjs --config=playwright.config.mjs
--project=system-chrome --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

```text
Running 5 tests using 2 workers

  ✓  1 …arrow ordinary shell preserves four full modes focus and geometry (1.1s)
  ✓  2 …adow registry validation derives all experiences without cutover (632ms)
  ✓  3 …ified Feature 002 exposes exact Brief gate and no author request (812ms)
  ✓  4 …ature 008 preserves public Portfolio and creates no private store (2.6s)
  ✓  5 …UG-001 options flow shell is ready before heavy hydration begins (19.6s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true

  5 passed (25.3s)
SHELL_E2E_SUITE_EXIT=0
```

**Result:** PASS - 5 passed, 0 failed. The BUG-001 focused regression proves
cache-first paint (`cacheFirstOwnerPainted=true`) and shell readiness at the
first native option delta (`shellReadyAtStart=true`); its assertions require 12
total and 12 unique starts and zero restarts after the Power/Simple view
changes, so the pass proves exactly-once hydration with no view-change restart.
Ordinary, Center (Feature 002/008 gate), and mobile shell regressions pass in
the same run.

### TP-BUG001-05 — Broad Build-Free Selftest

**Command:** `node scripts/selftest.mjs`

**Exit Code:** 0

**Claim Source:** executed

```text
Feature 012 Scope 04 Simple model core runtime
  ✓ Feature 012 Scope 04 exposes the closed six-state runtime with no shipped owner adapter or tool-ID branch
  ✓ Feature 012 Scope 04 compute identity excludes retrieval occurrence time but retains the semantic evidence cutoff
  ✓ Feature 012 Scope 04 owns no provider, network, storage, authoring, publication, or tool-formula authority
  ✓ Feature 012 Scope 04 carries cancellation, stale-completion rejection, and explicit last-valid projection contracts
================================================
Research-Lab self-test: 712 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

**Result:** PASS - 712 passed, 0 failed, exit 0 — identical to the recorded
baseline. No source/registry/shell/context/model/tool invariant regressed.

### TP-BUG001-06 — Regression-Quality Guard (plain + bugfix)

**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh
tests/tool-experience.spec.mjs` then the same with `--bugfix`

**Exit Code:** 0 (both)

**Claim Source:** executed

```text
===== PLAIN GUARD =====
  BUBBLES REGRESSION QUALITY GUARD
  Bugfix mode: false
ℹ️  Scanning tests/tool-experience.spec.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
GUARD_PLAIN_EXIT=0
===== BUGFIX GUARD =====
  BUBBLES REGRESSION QUALITY GUARD
  Bugfix mode: true
ℹ️  Scanning tests/tool-experience.spec.mjs
✅ Adversarial signal detected in tests/tool-experience.spec.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
GUARD_BUGFIX_EXIT=0
```

**Result:** PASS - no silent-pass/interception/skip/tautological patterns; the
bugfix mode confirms a real adversarial signal in the regression test.

### Cross-Spec — Certified BUG-004 + Contextual-Tooltip E2E (System Chrome)

**Command:** `npx --no-install playwright test
tests/provider-fallback-status.spec.mjs tests/contextual-tooltip.spec.mjs
--config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

```text
Running 4 tests using 2 workers

  ✓  1 …003 force-local status stays masked with a reachable local proxy (723ms)
  ✓  2 …r chart context is equivalent by pointer keyboard touch and table (2.0s)
  ✓  3 …ly context fails the exact Power item without hiding valid peers (852ms)
  ✓  4 … mobile returns focus and promotes same-data table without canvas (4.8s)

  4 passed (9.2s)
CROSS_E2E_EXIT=0
```

**Result:** PASS - the certified BUG-004 provider-fallback status e2e and the
contextual-tooltip e2e are GREEN. No cross-spec conflict.

### Cross-Spec — Standalone Node Suites (no cross-file parallelism)

**Command:** each file run in its own `node --test <file>` process

**Exit Codes:** 0 (all four)

**Claim Source:** executed

```text
===== tests/provider-credentials.unit.mjs =====
✔ SCN-BUG002-001 providers start unconfigured; two-tier API present; local key configures then clears
✔ SCN-BUG002-004 fail-closed transport and prototype-safe unknown providers
ℹ tests 2  ℹ pass 2  ℹ fail 0
EXIT[tests/provider-credentials.unit.mjs]=0
===== tests/provider-credentials.functional.mjs =====
TOTAL_PROXY_CREDENTIAL_LEAKS=0
TOTAL_DIRECT_UNEXPECTED_CREDENTIALS=0
MATRIX_FAILURES=0
✔ Regression BUG-004: proxy HTTP failure falls back once to same-provider local key
✔ Regression BUG-004: key-bearing full URL stays keyless at proxy and singular at direct fallback
✔ Regression BUG-004: registry-reserved query fields are stripped before proxy and canonicalized once for direct
✔ Regression BUG-004: proxy timeout rejection falls back once to same-provider local key
✔ Regression BUG-004: fallback never crosses provider or retries
✔ Regression BUG-004: no same-provider key fails closed without disclosure
ℹ tests 11  ℹ pass 11  ℹ fail 0
EXIT[tests/provider-credentials.functional.mjs]=0
===== tests/contextual-tooltip.unit.mjs =====
ℹ tests 5  ℹ pass 5  ℹ fail 0
EXIT[tests/contextual-tooltip.unit.mjs]=0
===== tests/contextual-tooltip.functional.mjs (standalone) =====
# [scope03-rollback] currentHashesEqual=true protectedHashesEqual=true realWorktreeHashesEqual=true
# [scope03-exact-replay] protectedHashesEqual=true realWorktreeHashesEqual=true
# tests 9  # pass 9  # fail 0
TOOLTIP_FUNCTIONAL_ALONE_EXIT=0
```

**Result:** PASS - provider-credentials (2/2 unit, 11/11 functional with zero
credential leaks and all BUG-004 fallback regressions green) and
contextual-tooltip (5/5 unit, 9/9 functional) are all GREEN standalone.

### Attribution Of A Transient Batch RED (resolved — not a regression)

**Claim Source:** executed

An initial convenience batch that ran four `node --test` files in ONE process
(`tests/provider-credentials.functional.mjs tests/provider-credentials.unit.mjs
tests/contextual-tooltip.functional.mjs tests/contextual-tooltip.unit.mjs`)
exited 1 on a `deepStrictEqual` over a `Map(1797)` whole-worktree hash inventory
inside `contextual-tooltip.functional.mjs`'s `SCN-012-003 isolated rollback`
test. That test snapshots the entire worktree at start (`realWorktreeBefore`)
and asserts `hashInventory(ROOT, worktreePaths)` is byte-identical at the end —
an invariant that is disturbed when sibling test files run concurrently in the
shared worker pool and touch a ROOT-relative path. Running that exact file
STANDALONE returns `# tests 9 # pass 9 # fail 0` with
`realWorktreeHashesEqual=true`, and the other three files pass standalone. The
failing assertion never referenced `options-flow-feed-lab.html`; it was a
parallel-invocation artifact of the batch command, NOT a defect in the fix and
NOT a cross-spec conflict. `scripts/selftest.mjs` (the recorded 712/0 baseline)
does not run these files, so this file was never part of the BUG-001 green
baseline and its standalone GREEN is the correct signal.

### Regression Verdict

🟢 **REGRESSION_FREE**

| Check | Result |
|---|---|
| Test baseline (all 6 TP rows) | Stable — all GREEN on current bytes |
| Cross-spec conflicts (BUG-004, provider, tooltip) | 0 — all suites GREEN |
| Design/contract contradictions | 0 |
| Coverage delta | 0 decrease — selftest 712/0 stable; every suite GREEN |
| Protected-owner byte drift | 0 — producer, `rldata.js`, shared readiness API, decorators all byte-stable |
| Change boundary | Confined to `options-flow-feed-lab.html` + `tests/tool-experience.spec.mjs` (+ packet-committed `tests/tool-experience-shell.functional.mjs`) |

No regression, cross-spec conflict, coverage decrease, or protected-contract
breakage was introduced by the fix. The route advances to `bubbles.simplify`.

## Simplify Phase Evidence

**Claim Source:** executed (byte review of the recorded diff) + executed (selftest re-run)

**Verdict: NO CODE CHANGE WARRANTED — the fix is already minimal and idiomatic.**

The simplify pass reviewed ONLY the recently-changed surface: the
`options-flow-feed-lab.html` startup-sequencing hunk and the BUG-001 regression
test in `tests/tool-experience.spec.mjs`. The recorded working-tree diff of the
production hunk (verbatim) is:

```diff
+      var deltaHydrationStarted = false;
+      function startDeltaHydration() {
+        if (deltaHydrationStarted) return;
+        deltaHydrationStarted = true;
+        fetchDelta().then(function () { rebuild(); render(); });
+      }
+      function startDeltaAfterShellReady() {
+        if (document.querySelector('#rlviews[data-rlexperience-shell="ready"]')) {
+          startDeltaHydration();
+          return;
+        }
+        window.addEventListener("rlviews:change", startDeltaHydration, { once: true });
+      }
       function boot() {
         ...
         rebuild(); render();          /* cache-first paint */
-        fetchDelta().then(function () { rebuild(); render(); });  /* delta fetch, best-effort */
+        startDeltaAfterShellReady();   /* heavy delta starts once after the shared shell is ready */
       }
```

Each simplify dimension was evaluated against this surface:

- **Duplication vs shared helpers** — None. The fix reuses the existing generic
  `rlviews:change` event and the existing `#rlviews[data-rlexperience-shell="ready"]`
  marker owned by the shared readiness API. It introduces NO new shared API,
  helper, or abstraction. The marker selector appearing in both the page and the
  regression test is a production-contract observation (the test watches the real
  marker), not extractable duplication — and the shared modules are protected.
- **Exactly-once guard (`deltaHydrationStarted`)** — Retained deliberately. It is
  the adopted "page-local exactly-once heavy hydration" contract (design/plan) and
  is the invariant `bubbles.test` (12-path, one cycle) and `bubbles.regression`
  (`shellReadyAtStart=true`, exactly-once 12-path 3/3) validated GREEN. Removing it
  because the current two call sites are mutually exclusive would weaken the
  function-boundary invariant against `rlviews:change` re-fires and future call
  sites for zero readability gain — churn / over-engineering-in-reverse, which the
  simplify mandate forbids.
- **Two-function split** — Retained. `startDeltaHydration` is passed by reference
  to `addEventListener("rlviews:change", startDeltaHydration, { once: true })` AND
  called directly on the already-ready branch; it must be a named reference and
  must carry the guard. Collapsing the "do-once" (`startDeltaHydration`) and the
  "decide-when" (`startDeltaAfterShellReady`) responsibilities into one function
  would force an anonymous listener wrapper — less clear, not more. This is clean
  single-responsibility separation, not over-engineering.
- **Naming / comments / dead code / TODOs** — `deltaHydrationStarted`,
  `startDeltaHydration`, `startDeltaAfterShellReady` are self-documenting and
  consistent with the file's existing `fetchDelta`/`HYDRATION` vocabulary. The two
  trailing comments explain "why". No dead code, no TODO/FIXME, no unclear naming.
- **Pre-existing redundancy — deliberately NOT touched** — `startDeltaHydration`
  chains `fetchDelta().then(function () { rebuild(); render(); })` even though
  `fetchDelta` already calls `rebuild(); render()` on its own `Promise.all(...).then`.
  The recorded diff proves this trailing `.then(rebuild; render)` is **pre-existing
  code relocated verbatim** — the original `boot()` line was
  `fetchDelta().then(function () { rebuild(); render(); });  /* delta fetch, best-effort */`.
  Its redundancy predates and is independent of this fix. Modifying it is scope
  creep beyond the certified minimal bug repair and outside the simplify-phase
  remit ("simplify the fix, do not refactor pre-existing behavior"); it is left
  byte-stable. Recorded as a pre-existing observation, not a defect and not a
  simplify target.
- **Regression test (`tests/tool-experience.spec.mjs`)** — Idiomatic Playwright.
  The `fetch` wrapper OBSERVES same-origin `/data/options/*.json` request ordering
  and forwards unchanged via `Reflect.apply(nativeFetch, this, args)` (no
  interception — honors the forbidden-remedy list). The input-normalization ternary
  (string | Request | other) and the `try/catch` around `new URL(...)` are
  necessary defensive normalization whose comment states native fetch retains
  invalid-input ownership. Each assertion maps to a scenario contract
  (cache-first paint → SCN-BUG001-001, shell-ready-before-hydration →
  SCN-BUG001-002, exactly-once 12-path → SCN-BUG001-003). No safe simplification
  improves it.

Because the fix is one page-local guard reusing existing shared lifecycle
primitives with no new abstraction, no duplication, no dead code, and no unclear
naming, applying a "simplification" here would only add risk and churn to a
certified-GREEN, regression-free surface. The correct simplify outcome is a
recorded no-op.

### Current-Bytes Health Re-Confirmation (selftest)

Command: `node scripts/selftest.mjs`

```
Feature 012 Scope 04 Simple model core runtime
  ✓ Feature 012 Scope 04 exposes the closed six-state runtime with no shipped owner adapter or tool-ID branch
  ✓ Feature 012 Scope 04 compute identity excludes retrieval occurrence time but retains the semantic evidence cutoff
  ✓ Feature 012 Scope 04 owns no provider, network, storage, authoring, publication, or tool-formula authority
  ✓ Feature 012 Scope 04 carries cancellation, stale-completion rejection, and explicit last-valid projection contracts

================================================
Research-Lab self-test: 712 passed, 0 failed
================================================
=== selftest pipeline EXIT 0 ===
```

The broad build-free selftest is `712 passed, 0 failed` (exit 0) on the current
unchanged bytes, matching the `bubbles.test` and `bubbles.regression` 712/0
baseline. No production or test byte was modified by this simplify phase.

### Protected-Boundary Confirmation (simplify phase)

- Modified by this phase: `report.md` (this evidence append) and `state.json`
  (phase advance) ONLY. `options-flow-feed-lab.html`,
  `tests/tool-experience.spec.mjs`, and `tests/tool-experience-shell.functional.mjs`
  were reviewed and left byte-stable (no code change).
- Untouched protected owners: certified `specs/_bugs/BUG-004-*`, `rldata.js`,
  provider credential tests, `tests/provider-fallback-status.spec.mjs`, all parent
  Feature 012 source/scopes and Scope 04, `scripts/fetch-options.mjs`, shared
  readiness API (`rlviews.js` / `rlapp.js` / `rlexperience.js`), decorators
  (`rlg.js` / `rlticker.js` / `rlcontext.js`).
- `certification.*` and top-level `status` were NOT modified. No forbidden remedy
  (timeout increase, route exemption, manual fetch button, shared tool-ID branch,
  row truncation, decorator disablement, alternate storage owner, new
  producer/provider/worker path) was introduced. crossRepoPolicy honored — no
  cross-repo write. The route advances to `bubbles.gaps`.
No plan-owned DoD, scope status, or certification field is modified by this
diagnostic phase.

## Gaps Phase Evidence

**Phase:** gaps

**Agent:** bubbles.gaps

**Executed:** YES (current session, 2026-07-24)

**Claim Source:** executed

**Verdict: NO CODE GAP — spec/design↔implementation, scenario coverage, DoD, and
policy are coherent on current bytes. One artifact-only status drift was found
and reconciled in place (this report's Completion Statement and Validation
Summary); no production or test byte was modified by this phase.**

The gaps pass audited the regression-clean, simplify-confirmed SCOPE-01 fix
against the five mandate dimensions. All command output below was captured this
session against `HEAD=6655b72a958d0710e0e00b8a5975e206c612f06d`.

### 1. Scenario coverage completeness — CLEAN

**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

**Exit Code:** 0

```text
--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 3 scenario contract(s)
✅ scenario-manifest.json records evidenceRefs
✅ All linked tests from scenario-manifest.json exist
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-001 ...
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-002 ...
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-003 ...
--- Gherkin → DoD Content Fidelity (Gate G068) ---
ℹ️  DoD fidelity: 3 scenarios checked, 3 mapped to DoD, 0 unmapped
ℹ️  Scenario-to-row mappings: 3
ℹ️  Report evidence references: 3
RESULT: PASSED (0 warnings)
traceability_exit=0
```

All three authoritative scenarios (SCN-BUG001-001/002/003) map to Test Plan
rows, concrete test files, and DoD items with zero unmapped and no orphan test.
The 6 Test Plan rows map 1:1 to the 6 Test-Evidence DoD items
(`test-plan.json::dodParity` + scopes.md). The persistent adversarial regression
`TP-BUG001-02` is genuinely non-intercepting — it wraps `globalThis.fetch` for
observation only and forwards via `Reflect.apply(nativeFetch, this, args)` — and
the recorded Sandboxed Rollback Rehearsal proves it goes RED
(`shellReadyAtStart=false`) if the fix is reverted, so it is not tautological.

### 2. Spec↔implementation coherence — CLEAN

**Command:** `git diff --numstat -- options-flow-feed-lab.html`; `git diff --check`; `git diff --unified=0` added-line forbidden-token scan

**Exit Code:** 0 (`diffcheck_exit=0`); forbidden-token grep exit 1 (zero forbidden tokens added)

```text
=== FIX DIFF NUMSTAT (options-flow-feed-lab.html only) ===
14      1       options-flow-feed-lab.html
=== FIX DIFF --check (whitespace) ===  diffcheck_exit=0
=== ADDED HUNK (verbatim) ===
+      var deltaHydrationStarted = false;
+      function startDeltaHydration() {
+        if (deltaHydrationStarted) return;
+        deltaHydrationStarted = true;
+        fetchDelta().then(function () { rebuild(); render(); });
+      }
+      function startDeltaAfterShellReady() {
+        if (document.querySelector('#rlviews[data-rlexperience-shell="ready"]')) {
+          startDeltaHydration();
+          return;
+        }
+        window.addEventListener("rlviews:change", startDeltaHydration, { once: true });
+      }
+        startDeltaAfterShellReady();   /* heavy delta starts once after the shared shell is ready */
=== forbidden-remedy token scan on added lines ===
forbidden_token_grep_exit=1 (1 = zero forbidden tokens added)
```

The delivered fix satisfies every requirement: synchronous cache-first
`rebuild(); render()` is retained in `boot()` (FR-B001-02); the
`startDeltaAfterShellReady()` barrier consumes the generic
`#rlviews[data-rlexperience-shell="ready"]` marker + one `rlviews:change` event
with no tool-ID branch in shared code (FR-B001-01, FR-B001-03); the
`deltaHydrationStarted` boolean plus `{ once: true }` guarantee exactly-once
hydration (FR-B001-04); the fix adds no timeout and the 10,000 ms canary is
unchanged (FR-B001-05); RLTKR/RLCTX/decorators, `ensureChain`, six-worker
count, snapshots, and fallback order are untouched (FR-B001-06, FR-B001-07). No
undeclared behavior was added (14 additions / 1 replacement; zero forbidden
tokens).

### 3. DoD completeness — CLEAN

**Command:** `grep -c '^- \[x\]'` / `grep -c '^- \[ \]'` on scopes.md; `bash .github/bubbles/scripts/artifact-lint.sh <bug>`

**Exit Code:** artifact_lint_exit=0

```text
checked   [x]: 13
unchecked [ ]: 0
--- artifact-lint (anti-fabrication) ---
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
✅ Top-level status matches certification.status
Artifact lint PASSED.  artifact_lint_exit=0
```

All 13 DoD items are checked with 0 unchecked; artifact-lint confirms every
checked item has a real evidence block and no unfilled template markers remain.
Each DoD evidence anchor resolves to a real report section carrying ≥10 lines of
raw terminal transcript (verified by direct read of the referenced sections).

### 4. Policy compliance (research-lab) — CLEAN

**Commands:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/tool-experience.spec.mjs tests/tool-experience-shell.functional.mjs`; protected-owner hash + producer diff

**Exit Code:** regression_quality_exit=0; protected_producer_exit=0

```text
=== REGRESSION QUALITY GUARD (bugfix) ===
✅ Adversarial signal detected in tests/tool-experience.spec.mjs
✅ Adversarial signal detected in tests/tool-experience-shell.functional.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
=== PROTECTED SOURCE/DATA OWNERSHIP CLEAN vs HEAD ===  protected_producer_exit=0
=== PROTECTED SHARED + PRODUCER + RLDATA HASHES (all match recorded pre-fix) ===
1d4f80a3...  rlapp.js
e4dc88f5...  rlviews.js
011b01da...  rlexperience.js
138715b8...  rlg.js
8b44f17c...  rlticker.js
7021f053...  rlcontext.js
df25be67...  scripts/fetch-options.mjs
6841de3f...  rldata.js
```

No forbidden remedy is present: zero timeout increase, route exemption, manual
fetch button, shared tool-ID branch, row truncation, decorator disablement,
alternate storage owner, or new producer/provider/worker path (added-line token
scan exit 1; regression-quality guard 0 violations). Every protected owner
(`rldata.js`, `scripts/fetch-options.mjs`, `data/options/**`, shared readiness
API `rlapp.js`/`rlviews.js`/`rlexperience.js`, decorators
`rlg.js`/`rlticker.js`/`rlcontext.js`) is byte-stable against the recorded
pre-fix hashes. No new blackbox/defaulted data path was introduced.

**Current-bytes health:** `node scripts/selftest.mjs` → `Research-Lab self-test:
712 passed, 0 failed` (selftest_exit=0), matching the bubbles.test /
bubbles.regression / bubbles.simplify 712/0 baseline on unchanged bytes.

### 5. Known artifact drift — FOUND and RECONCILED IN PLACE (artifact-only)

**Command:** `grep -nE 'Not Started' report.md`; `grep -nE '^\*\*Status:\*\*|SCOPE-01' scopes.md`; `grep '"completedScopes"' state.json`

```text
=== SCOPE-01 STATUS (scopes.md) ===
56:| SCOPE-01 | ... | 6 | Done |
60:**Status:** Done
=== state.json ===
14:  "completedScopes": ["SCOPE-01"],
35:        "status": "done",
=== DRIFT: 'Not Started' occurrences in report.md (pre-reconciliation) ===
32:remains `Not Started`, every plan-owned DoD item remains unchecked, and no
1291:remains `in_progress`; SCOPE-01 remains `Not Started`; all plan-owned DoD items
```

**Decision — genuine internal drift, reconciled truthfully.** scopes.md
(SCOPE-01 = Done, 13/0 DoD) and state.json (`completedScopes:["SCOPE-01"]`,
execution scope status `done`) both record SCOPE-01 as execution-side done. Two
prose statements in this report — the top-level `## Completion Statement`
(line 32) and the `## Validation Summary` (line 1291) — still asserted "SCOPE-01
remains Not Started, DoD unchecked, routes to bubbles.plan." Both were authored
by `bubbles.test` at `2026-07-24T02:42:02Z`, *before* `bubbles.plan` executed the
`TR-BUG001-TEST-TO-PLAN` reconciliation at `2026-07-24T02:57:34Z` that checked
all 13 DoD items and set execution-side SCOPE-01 to `Done`. Neither statement is
a captured terminal transcript — both are prose summary/status lines — so per the
gaps mandate each stale status clause was corrected in place to the reconciled
truth, while the historical routing fact (bubbles.test routed to bubbles.plan,
requested no certification transition) and every terminal transcript in the
document are preserved verbatim. Top-level `status` and all `certification`
fields were left `in_progress` and untouched.

### Protected-boundary confirmation (gaps phase)

- Modified by this phase: `report.md` (the two status-clause reconciliations +
  this Gaps Phase Evidence append) and `state.json` (phase advance) ONLY.
- Left byte-stable: `options-flow-feed-lab.html`, `tests/tool-experience.spec.mjs`,
  `tests/tool-experience-shell.functional.mjs` (no code change — this is a
  diagnostic phase).
- Untouched protected owners: certified `specs/_bugs/BUG-004-*`, `rldata.js`,
  provider credential tests, `tests/provider-fallback-status.spec.mjs`, parent
  Feature 012 source/scopes and Scope 04, `scripts/fetch-options.mjs`, shared
  readiness API, decorators (all hash-stable above).
- `certification.*` and top-level `status` were NOT modified. crossRepoPolicy
  honored — no cross-repo write. No forbidden remedy introduced. The route
  advances to `bubbles.harden`.

## Harden Phase Evidence

**Owner:** `bubbles.harden` · **Phase:** harden (bugfix-fastlane) ·
**Executed:** 2026-07-24 (this session) · **Verdict:** `HARDENED` /
`robustnessVerdict = ROBUST` · **Code changed:** NO (diagnostic phase — fix and
both Test Plan test files are byte-identical to the gaps-confirmed bytes; every
protected owner byte-stable).

Deep hardening executed the full recorded Test Plan set on current bytes plus the
exactly-once robustness reasoning, the zero-deferral scan, artifact-lint, and the
protected-owner byte-stability comparison. Every category is GREEN with zero
skipped/pending and zero `.only`.

### Harden 1 — TP-BUG001-01 all-23 functional shell canary (GREEN, zero skips)

**Command:** `node --test tests/tool-experience-shell.functional.mjs`
**Claim Source:** executed (this session)

```text
[shell-canary] tool=market-brief views=Brief|Portfolio|Red Alert|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=market-heatmap-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=options-flow-feed-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=intraday-tape-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
... (23 route records total; options-flow-feed-lab is present with panels=4, statusControls=1) ...
[shell-canary] tool=technical-analysis-decision-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (25646.726329ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (723.183283ms)
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2219.170793ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 28950.255001
```

All 23 registry routes (including `options-flow-feed-lab`) expose exactly one
ready four-panel shell; `tests 3 / pass 3 / fail 0 / skipped 0 / todo 0`.

### Harden 2 — TP-BUG001-02 focused BUG-001 System Chrome regression (GREEN)

**Command:** `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list`
**Claim Source:** executed (this session)

```text
Running 1 test using 1 worker

  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (18.9s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true

  1 passed (20.4s)
```

The first native same-origin option delta request (`/data/options/SPY.json`)
observes `shellReadyAtStart=true` and `cacheFirstOwnerPainted=true`; the test's
internal assertions further prove exactly-once 12-distinct-path hydration, one
ready shell, four tabs, four panels, and no additional hydration group after
Power/Simple view toggles.

### Harden 3 — Full `tool-experience.spec.mjs` shell suite in System Chrome (GREEN, zero skips)

**Command:** `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Claim Source:** executed (this session)

```text
Running 4 tests using 1 worker

  ✓  1 …adow registry validation derives all experiences without cutover (627ms)
  ✓  2 …ified Feature 002 exposes exact Brief gate and no author request (634ms)
  ✓  3 …ature 008 preserves public Portfolio and creates no private store (2.7s)
  ✓  4 …UG-001 options flow shell is ready before heavy hydration begins (19.2s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true

  4 passed (24.7s)
```

`4 passed` with zero skipped; the BUG-001 regression passes inside the complete
shell suite exactly as it does in isolation.

### Harden 4 — Broad build-free selftest (GREEN)

**Command:** `node scripts/selftest.mjs`
**Claim Source:** executed (this session)

```text
  ✓ Feature 012 Scope 04 exposes the closed six-state runtime with no shipped owner adapter or tool-ID branch
  ✓ Feature 012 Scope 04 compute identity excludes retrieval occurrence time but retains the semantic evidence cutoff
  ✓ Feature 012 Scope 04 owns no provider, network, storage, authoring, publication, or tool-formula authority
  ✓ Feature 012 Scope 04 carries cancellation, stale-completion rejection, and explicit last-valid projection contracts

================================================
Research-Lab self-test: 712 passed, 0 failed
================================================
```

`712 passed, 0 failed` (no skips) — existing source, registry, shell, context,
model, and tool invariants remain green on current bytes.

### Harden 5 — Skip/`.only` + zero-deferral token scans (both clean)

**Command:** `grep -nE "\.only\(|\.skip\(|test\.todo|it\.todo|xit\(|xdescribe\(|t\.skip|describe\.only|pending\(" tests/tool-experience.spec.mjs tests/tool-experience-shell.functional.mjs` then `grep -nE "TODO|FIXME|HACK|STUB|XXX" options-flow-feed-lab.html tests/tool-experience.spec.mjs`
**Claim Source:** executed (this session)

```text
=== skip/only/todo markers in the two Test Plan files ===
SKIP_SCAN_EXIT=1 (1=none-found, expected)
=== TODO/FIXME/HACK/STUB in changed surface ===
DEFERRAL_SCAN_EXIT=1 (1=none-found, expected)
```

No test is skipped, `.only`-scoped, `todo`, or `pending`; no TODO/FIXME/HACK/STUB
deferral token exists in the changed production or regression surface (grep
exit 1 = zero matches).

### Harden 6 — Artifact lint (PASSED, exit 0)

**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`
**Claim Source:** executed (this session)

```text
✅ Detected state.json status: in_progress
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0
```

Top-level `status` still matches `certification.status` (both `in_progress`); all
DoD items carry evidence blocks; no unfilled template markers.

### Harden 7 — Protected-owner byte-stability (all 11 hashes match recorded post-fix baseline)

**Command:** `sha256sum options-flow-feed-lab.html tests/tool-experience.spec.mjs tests/tool-experience-shell.functional.mjs rldata.js scripts/fetch-options.mjs rlapp.js rlviews.js rlexperience.js rlg.js rlticker.js rlcontext.js`
**Claim Source:** executed (this session)

```text
31fbb0985a11c56742043732fa726bdc5d829f7b739b1fd00a393180d118ec82  options-flow-feed-lab.html
29ed8d9c9bf97bd8df24b80aeb14e88ce01a1393e5234ac32acdb065f96da8a6  tests/tool-experience.spec.mjs
d8be707b2d3bf251c6192a481fee4361122ac87f4687a52529f8df61a3e88db1  tests/tool-experience-shell.functional.mjs
6841de3f70959082c4ac50831060252d0d8786c2e31d97a1827f8b443950be72  rldata.js
df25be67ab2cbaf14f4db277618d91ffd162374112344a057f46c0411298bbb3  scripts/fetch-options.mjs
1d4f80a3458ca65560b8c23a3e6d206ff3f89f5ed86f3495ffd9283df114e6d0  rlapp.js
e4dc88f5d22131a308dcbe98cf709a0097f3628ef0819bc4f0da6b903bd1a6b1  rlviews.js
011b01dae1187264e7b6aeb5cfabbd285f450c7fc223ea047000ec6b679ccc3f  rlexperience.js
138715b89a705efafdf4d6393c064c48ec18aa32f9a0790eb537edf032d462c8  rlg.js
8b44f17cc799ff23e2cc1573b162a9f19a5bf2f1d3d4e6e29feb63ec455d7211  rlticker.js
7021f053b11197627ad30cc1eaf2ce6cc8e44c14a4c5d3a24d8786fe62907294  rlcontext.js
```

Every hash is byte-identical to the recorded post-fix / gaps baseline (report
lines 762–772 / 924–935). The fix (`options-flow-feed-lab.html=31fbb098…`) and
both Test Plan test files are unchanged since gaps; the shared readiness API
(`rlapp.js=1d4f80a3…`, `rlviews.js=e4dc88f5…`, `rlexperience.js=011b01da…`), the
option producer (`scripts/fetch-options.mjs=df25be67…`), the storage owner
(`rldata.js=6841de3f…`), and the decorators (`rlg.js=138715b8…`,
`rlticker.js=8b44f17c…`, `rlcontext.js=7021f053…`) are all byte-stable.

### Harden 8 — Regression-quality / bailout guard (0 violations / 0 warnings)

**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/tool-experience.spec.mjs tests/tool-experience-shell.functional.mjs`
**Claim Source:** executed (this session)

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /home/redacted/research-lab
  Timestamp: 2026-07-24T07:11:24Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/tool-experience.spec.mjs
✅ Adversarial signal detected in tests/tool-experience.spec.mjs
ℹ️  Scanning tests/tool-experience-shell.functional.mjs
✅ Adversarial signal detected in tests/tool-experience-shell.functional.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
  Files with adversarial signals: 2
============================================================
REGRESSION_QUALITY_EXIT=0
```

No silent-pass bailout, no failure-condition early return, no optional required
assertion, no interception, no timeout inflation, and no tautological ordering
assertion; both files carry an adversarial signal.

### Harden 9 — Exactly-once barrier robustness (verified via source + tests; ROBUST)

The delivered barrier in `options-flow-feed-lab.html` is exercised by the
regression and holds under every real startup edge condition:

1. **Shell already ready before the listener attaches (synchronous
   `querySelector` branch).** `startDeltaAfterShellReady()` first evaluates
   `document.querySelector('#rlviews[data-rlexperience-shell="ready"]')`
   synchronously; when the marker is already present it calls
   `startDeltaHydration()` immediately and `return`s WITHOUT attaching any
   listener. Confirmed by the all-23 canary (every route reaches a ready shell)
   and by the regression's `shellReadyAtStart=true`.
2. **Readiness arriving via the `rlviews:change` event (`{once:true}`).** When
   the marker is not yet present, the barrier attaches `startDeltaHydration` on
   `rlviews:change` with `{ once: true }`, so the listener auto-removes after the
   first dispatch and heavy hydration begins exactly once when the shared shell
   mounts.
3. **Guard preventing double hydration if both the marker and the event fire.**
   The page-local `deltaHydrationStarted` boolean short-circuits any second
   entry into `startDeltaHydration()` (belt-and-suspenders with `{once:true}`).
   The regression proves exactly-once: it asserts the delta-start set is exactly
   12 distinct `/data/options/*.json` paths, then re-reads `deltaStarts` after
   toggling Power→Simple views and still finds `length 12`, `size 12`, and every
   entry `shellReady` — later `rlviews:change` view changes do NOT start a
   second worker group.

**No unstarted / double-started race exists.** JavaScript is single-threaded, so
between the synchronous `querySelector` check and the subsequent
`addEventListener` there is no async boundary and therefore no TOCTOU gap — the
shell's ready marker and its `rlviews:change` dispatch happen on the same thread
and cannot interleave two synchronous statements. Shell readiness is guaranteed
by the protected Feature 012 Scope 02 foundation (proven by the 23/23 canary), so
the event branch always eventually fires when the synchronous branch missed. No
genuine robustness gap requires a source change; nothing is routed to
`bubbles.implement`.

### Protected-boundary confirmation (harden phase)

- Modified by this phase: `report.md` (this Harden Phase Evidence append) and
  `state.json` (phase advance) ONLY.
- Left byte-stable (diagnostic phase — no code change): `options-flow-feed-lab.html`,
  `tests/tool-experience.spec.mjs`, `tests/tool-experience-shell.functional.mjs`
  (hashes above match the recorded baseline exactly).
- Untouched protected owners: certified `specs/_bugs/BUG-004-*`, `rldata.js`,
  provider credential tests, `tests/provider-fallback-status.spec.mjs`, parent
  Feature 012 source/scopes and Scope 04, `scripts/fetch-options.mjs`, shared
  readiness API (`rlapp.js`/`rlviews.js`/`rlexperience.js`), decorators
  (`rlg.js`/`rlticker.js`/`rlcontext.js`) — all hash-stable above.
- `certification.*` and top-level `status` were NOT modified. crossRepoPolicy
  honored — no cross-repo write. No timeout increase, route exemption, manual
  fetch button, shared tool-ID branch, row truncation, decorator disablement, or
  alternate storage owner introduced. No forbidden remedy. The route advances to
  `bubbles.stabilize`.

## Stabilize Phase Evidence

**Owner:** `bubbles.stabilize` · **Phase:** stabilize (bugfix-fastlane) ·
**Executed:** 2026-07-24 (this session) · **Dispatched by:** `bubbles.goal`
(`executionModel: direct-authorized-runner`) · **stabilityVerdict (BUG-001
fix):** `STABLE` — startup-starvation characteristic restored, no fix-introduced
resource/reliability regression · **Phase outcome:** `route_required` — a NEW
deterministic defect OUTSIDE the BUG-001 fix boundary was discovered (a parent
Feature 012 Scope-02 test broken by commit `c81d808d`) · **Code changed by this
phase:** NO (diagnostic).

### Stabilize 1 — Focused BUG-001 System Chrome regression (fresh, GREEN)

**Command:** `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list`
**Claim Source:** executed (this session)

```text
=== STABILIZE: focused BUG-001 System Chrome regression (fresh) ===

Running 1 test using 1 worker

  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (19.7s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true

  1 passed (21.3s)
FOCUSED_REGRESSION_EXIT=0
```

Observed startup metrics: `firstDelta=/data/options/SPY.json`,
`shellReadyAtStart=true`, `cacheFirstOwnerPainted=true`. The passing run means
its terminal assertions held: cache-first owner content is painted before the
first native option request, the shell marker is present at that first request,
the delta-start set is exactly **12 distinct** `/data/options/*.json` paths, and
a Power→Simple view toggle does NOT start a second worker group (`deltaStarts`
still length 12 / size 12, every entry `shellReady`). Exactly-once hydration
after readiness is confirmed.

### Stabilize 2 — All-23 shell canary (unchanged 10s contract): SCN-012-028/029 GREEN (23/23)

**Command:** `node --test tests/tool-experience-shell.functional.mjs`
**Claim Source:** executed (this session)

```text
[shell-canary] tool=market-brief views=Brief|Portfolio|Red Alert|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=market-heatmap-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=options-flow-feed-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
... (23 route records total; options-flow-feed-lab present with panels=4, statusControls=1) ...
[shell-canary] tool=technical-analysis-decision-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (14274.837125ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (757.522782ms)
✖ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (1480.326671ms)
ℹ tests 3
ℹ pass 2
ℹ fail 1
ℹ skipped 0
CANARY_EXIT=1
```

**The BUG-001 startup-stability contract PASSES:** `SCN-012-028/029` (the all-23
readiness canary that reproduced the original defect) reports **all 23 registry
routes** — including `options-flow-feed-lab` — reaching one ready four-panel
shell within the **unchanged 10-second** `waitForSelector` contract. The
`SCN-012-028` view-boundary test also passes. **23/23 canary = PASS.**

A **third, separate** test in the same file — `SCN-012-031` (a parent Feature
012 Scope-02 compatibility-rollback rehearsal, NOT a BUG-001 Test Plan row) —
fails deterministically with `currentShellCount: 1` where it expects `0`:

```text
✖ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
      at file:///home/redacted/research-lab/tests/tool-experience-shell.functional.mjs:362:12
    actual:   { simple: {...}, power: {...}, currentShellCount: 1 }
    expected: { simple: {...}, power: {...}, currentShellCount: 0 }
    operator: 'deepStrictEqual', diff: 'simple'
```

### Stabilize 3 — Transience check: the SCN-012-031 failure is DETERMINISTIC, not flaky

**Command:** `node --test tests/tool-experience-shell.functional.mjs` (standalone re-run)
**Claim Source:** executed (this session)

```text
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (17389.025023ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (735.615045ms)
✖ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (1270.708001ms)
ℹ tests 3
ℹ pass 2
ℹ fail 1
CANARY_RERUN_EXIT=1
```

Same result on the standalone re-run: canary 23/23 GREEN, `SCN-012-031` RED with
identical `currentShellCount: 1 vs 0`. This is NOT the parallel-invocation
transient the regression phase documented (that cleared under standalone
execution); this reproduces deterministically under standalone execution. It
must be root-caused, not dismissed.

### Stabilize 4 — Root cause (proven): commit `c81d808d` moved the shell bytes into git HEAD, breaking `SCN-012-031`'s HEAD-relative legacy premise

`SCN-012-031` reconstructs its "legacy" shell bytes via
`baselineBytes(p) = execFileSync('git', ['show', 'HEAD:'+p])`
(`tests/tool-experience-shell.functional.mjs:115-117`). It writes
`git show HEAD:rlviews.js` and `git show HEAD:rlapp.js` into a temp sandbox as
the *pre-shell* controls and asserts the modern shell does NOT mount
(`currentShellCount: 0`). That premise only holds while the modern shell is
UNCOMMITTED (legacy in HEAD, modern in the worktree — the exact state at BUG-001
discovery, `git status` showed ` M rlviews.js` / ` M rlapp.js`).

**Command:** `git --no-pager log --oneline -6`; `git status --short -- rlviews.js rlapp.js rlexperience.js options-flow-feed-lab.html tests/tool-experience-shell.functional.mjs tests/tool-experience.spec.mjs`; `git show HEAD:rlviews.js | grep -c data-rlexperience-shell`; `git show HEAD~1:rlviews.js | grep -c data-rlexperience-shell`; per-file `git log --oneline -1 --`
**Claim Source:** executed (this session)

```text
=== git log (recent commits) ===
c81d808d (HEAD -> main, origin/main, origin/HEAD) feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access
767732db chore(bubbles): refresh 7.20.1 installer payload
e274b2a9 market-brief: auto-refresh + narrative 2026-07-23 17:03 EDT (after-hours)

=== worktree status of Scope-02 shell owners + BUG-001 fix file ===
(empty — those paths are committed/clean vs HEAD)

=== shell marker presence in git objects ===
HEAD    (c81d808d) rlviews.js data-rlexperience-shell hits = 1
HEAD~1  (767732db) rlviews.js data-rlexperience-shell hits = 0
HEAD~1:rlviews.js EXISTS and had 0 shell markers (legacy)

=== HEAD vs worktree hash (equal => modern shell is COMMITTED into HEAD) ===
HEAD:rlviews.js  e4dc88f5d22131a308dcbe98cf709a0097f3628ef0819bc4f0da6b903bd1a6b1  -
work:rlviews.js  e4dc88f5d22131a308dcbe98cf709a0097f3628ef0819bc4f0da6b903bd1a6b1  rlviews.js
HEAD:rlapp.js    1d4f80a3458ca65560b8c23a3e6d206ff3f89f5ed86f3495ffd9283df114e6d0  -
work:rlapp.js    1d4f80a3458ca65560b8c23a3e6d206ff3f89f5ed86f3495ffd9283df114e6d0  rlapp.js

=== last commit that touched each relevant file ===
rlviews.js                                : c81d808d feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access
rlapp.js                                  : c81d808d feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access
options-flow-feed-lab.html (BUG-001 fix)  : c81d808d feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access
tests/tool-experience-shell.functional    : c81d808d feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access
```

**Root cause, definitively:** commit `c81d808d` ("feat(012): Market Action
Center Scopes 01-04 + BUG-004 two-tier provider access") landed the entire
Feature 012 shell work into HEAD. `git show HEAD:rlviews.js` now returns the
**modern** shell (marker hits = 1, byte-identical to the worktree
`e4dc88f5…`), whereas at `HEAD~1` (`767732db`) it had **0** shell markers
(legacy). `baselineBytes()` therefore now writes the MODERN shell into the
`SCN-012-031` sandbox, the shell mounts, and `currentShellCount` is `1` instead
of `0`. The harden phase (earlier this session) saw GREEN because the shell
bytes were still uncommitted at that time. **This is a stale HEAD-relative test
premise in a parent Feature 012 Scope-02 test — triggered by the feature commit,
NOT by the BUG-001 fix.**

### Stabilize 5 — Product runtime is healthy (isolates the failure as a test-premise, not a product defect)

**Command:** `node scripts/selftest.mjs`
**Claim Source:** executed (this session)

```text
  ✓ Feature 012 Scope 04 exposes the closed six-state runtime with no shipped owner adapter or tool-ID branch
  ✓ Feature 012 Scope 04 compute identity excludes retrieval occurrence time but retains the semantic evidence cutoff
  ✓ Feature 012 Scope 04 owns no provider, network, storage, authoring, publication, or tool-formula authority
  ✓ Feature 012 Scope 04 carries cancellation, stale-completion rejection, and explicit last-valid projection contracts

================================================
Research-Lab self-test: 712 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

`712 passed / 0 failed`. The product runtime — registry, shell, context, model,
and tool invariants — is green. `SCN-012-031` fails purely on its git-`HEAD`
legacy-reconstruction premise, not on any product behavior.

### Stabilize 6 — The BUG-001 fix is intact and is a pure REORDERING change (no new resource/reliability cost)

**Command:** `grep -nE 'var deltaHydrationStarted = false;|if \(deltaHydrationStarted\) return;|startDeltaAfterShellReady\(\);|rlviews:change", startDeltaHydration, \{ once: true \}' options-flow-feed-lab.html`
**Claim Source:** executed (this session)

```text
631:      var deltaHydrationStarted = false;
633:        if (deltaHydrationStarted) return;
642:        window.addEventListener("rlviews:change", startDeltaHydration, { once: true });
650:        startDeltaAfterShellReady();   /* heavy delta starts once after the shared shell is ready */
```

Resource/reliability review of the confined `options-flow-feed-lab.html` change
(read from source `boot()` / `fetchDelta()`):

- **No listener leak.** The `rlviews:change` listener is registered with
  `{ once: true }` and only on the async branch; the synchronous
  already-`ready` `querySelector` branch calls `startDeltaHydration()` and
  `return`s WITHOUT attaching any listener.
- **No double-hydration.** The page-local `deltaHydrationStarted` boolean
  short-circuits any second entry (belt-and-suspenders with `{once:true}`); the
  focused regression proves exactly 12 distinct paths and no second worker group
  after a view toggle.
- **Total work unchanged — this is reordering only.** `CONCURRENCY = 6`,
  `UNIVERSE.length` (12 chains), and `ensureChain(s, 12)` are unchanged; worker
  count, snapshot volume, and provider/fallback order are untouched. The only
  change is that the heavy `fetchDelta()` cycle now begins exactly-once AFTER
  shared shell readiness instead of racing it, so it can no longer starve the
  shell-critical path.
- **Shared owners untouched.** `rlviews.js` (`e4dc88f5…`) and `rlapp.js`
  (`1d4f80a3…`) are byte-identical between HEAD and the worktree — the fix did
  not touch them (confirmed above), so it cannot influence `SCN-012-031`, which
  depends only on those files' bytes and `market-heatmap-lab.html`.

### Stabilize 7 — Finding classification and routing

| Aspect | Determination |
|---|---|
| BUG-001 startup-stability characteristic | **RESTORED / STABLE** — all-23 canary 23/23 GREEN, focused regression GREEN (`shellReadyAtStart=true`, 12 distinct paths, exactly-once) |
| Did the BUG-001 fix introduce a new resource/reliability/perf regression? | **NO** — pure reordering; `{once:true}` + guard; unchanged worker count / snapshot volume / provider order; shared owners byte-stable |
| `SCN-012-031` deterministic failure | **NEW finding, OUTSIDE the BUG-001 fix boundary** — a parent Feature 012 Scope-02 test whose `baselineBytes(HEAD:…)` legacy premise broke when commit `c81d808d` committed the shell into HEAD |
| Owning surface | **Parent Feature 012 Scope-02** (`tests/tool-experience-shell.functional.mjs::SCN-012-031`) — PROTECTED from this child bug's writes; parent scopes are out of the BUG-001 remit |
| Remediation required | **CODE change** — reconstruct the legacy pre-Scope-02 controls from a FIXED anchor (embedded legacy fixture, or a pinned pre-`c81d808d` commit) instead of the moving `HEAD:` |
| Stabilize disposition | Diagnose-and-route (no patch under stabilize); do NOT advance BUG-001 to `devops` while a deterministic RED exists in a Test Plan file; route to `bubbles.implement` scoped to the parent Feature 012 Scope-02 test |

**Finding `BUG001-STABILIZE-SCN031-HEAD-BASELINE`:** `SCN-012-031` in
`tests/tool-experience-shell.functional.mjs` fails deterministically because
commit `c81d808d` moved the modern shell (`rlviews.js`/`rlapp.js`) into git
`HEAD`, and the test reconstructs its "legacy" controls from `git show HEAD:…`.
The fix is a parent Feature 012 Scope-02 test-baseline update; it is NOT a change
to the BUG-001 `options-flow-feed-lab.html` fix (which is correct and complete).
Because a deterministic RED now exists in a file the BUG-001 Test Plan exercises,
the stabilize phase does NOT advance to `devops`; it routes to `bubbles.implement`
and returns control to the orchestrator (`bubbles.goal`) for the cross-spec
routing decision.

### Protected-boundary confirmation (stabilize phase)

- Modified by this phase: `report.md` (this Stabilize Phase Evidence append) and
  `state.json` (routing update to `route_required`) ONLY. No code byte changed.
- Left byte-stable (diagnostic phase — no code change): `options-flow-feed-lab.html`
  (`31fbb098…` / HEAD-committed and intact), `tests/tool-experience.spec.mjs`,
  `tests/tool-experience-shell.functional.mjs`.
- Untouched protected owners: certified `specs/_bugs/BUG-004-*`, `rldata.js`,
  provider credential tests, `tests/provider-fallback-status.spec.mjs`, parent
  Feature 012 source/scopes and Scope 04, `scripts/fetch-options.mjs`, shared
  readiness API (`rlapp.js`/`rlviews.js`/`rlexperience.js`), decorators
  (`rlg.js`/`rlticker.js`/`rlcontext.js`). The stabilize phase did NOT modify the
  parent `SCN-012-031` test it diagnosed — that remediation is routed, not
  performed here.
- `certification.*` and top-level `status` were NOT modified. crossRepoPolicy
  honored — no cross-repo write. No forbidden remedy introduced (no timeout
  increase, route exemption, manual fetch button, shared tool-ID branch, row
  truncation, decorator disablement, alternate storage owner). Parent Scope 04
  was NOT resumed. The route is `bubbles.implement` (parent Feature 012 Scope-02
  test baseline), with the cross-spec decision returned to `bubbles.goal`.

## Discovered-Finding Closure: SCN-012-031 Legacy Baseline

Owner: `bubbles.test` (dispatched by `bubbles.goal`, executionModel
direct-authorized-runner). Finding: `BUG001-STABILIZE-SCN031-HEAD-BASELINE`.
Phase: test — an in-run finding closure inside the persisted `bugfix-fastlane`
workflow. This is a **test-integrity** fix to a parent Feature 012 Scope-02 test.
It is NOT a product change and NOT a change to the (correct, complete) BUG-001
`options-flow-feed-lab.html` fix. All prior transcripts above are preserved
verbatim; this section only ADDS.

> **Truthful-evidence supersession.** The earlier `regression` phase
> (2026-07-24T06:24:11Z — "Regression Phase Evidence") and `harden` phase
> (2026-07-24T07:05:00Z — "Harden Phase Evidence") both recorded
> `tests/tool-experience-shell.functional.mjs` as GREEN (`pass 3 / fail 0`). That
> evidence was **FALSE-GREEN**: those phases ran the suite while Scope 02's modern
> four-view shell was present in the working tree but **not yet committed to
> `HEAD`**, so `baselineBytes()=git show HEAD:<file>` still returned the legacy
> pre-shell bytes and the HEAD-relative premise held. After the operator committed
> Scope 02 to `HEAD` (commit `c81d808d`), `git show HEAD:rlviews.js` began
> returning the MODERN shell and the suite went deterministically RED
> (`currentShellCount 1` vs `0` at line 362), which the `stabilize` phase caught.
> This closure **supersedes** the regression/harden GREEN claims for this file
> with truthful, HEAD-independent evidence.

### Root cause (git-proven)

`baselineBytes(relativePath)` reconstructed the "legacy" pre-Scope-02 bytes from
the moving `HEAD`. Scope 02 (commit `c81d808d`; parent `767732db`) committed the
modern shell into `rlviews.js`, so the baseline silently drifted legacy → modern:

| ref | `rlviews.js` `data-rlexperience-shell` marker | bytes | note |
|-----|-----------------------------------------------|-------|------|
| `HEAD` (`c81d808d`) | **1** (modern shell) | 13249 | shell mounts → `currentShellCount` 1 (the RED) |
| `767732db` (parent, pre-Scope-02) | **0** (legacy simple/power) | 15096 | byte-identical to `4c49290a` |

`rlapp.js` never carried the marker (0 at every commit); at `767732db` it is
19082 bytes, byte-identical to `e0ecc92e`. Pinned legacy blob sha256 —
`rlviews.js` `9695b8ca…`, `rlapp.js` `b481a732…` (HEAD/modern differ:
`e4dc88f5…`, `1d4f80a3…`).

### Chosen fix — approach (b), hardened (pin-to-commit + integrity guards)

Repointed `baselineBytes()` from `HEAD:<path>` to the **immutable pre-Scope-02
parent commit** `767732db04e0cd32bf107b2a95030a6771bd16f2` (parent of the Scope
02 commit `c81d808d`), which predates the shell marker and cannot drift as `HEAD`
advances. Hardened with two fail-loud guards inside `baselineBytes` so it can
**never again silently read post-Scope-02 bytes**: (1) assert the bytes do NOT
contain `data-rlexperience-shell`; (2) assert each file's exact sha256 matches the
pinned pre-Scope-02 blob.

Why (b) over (a) embedded-fixture: (b) is byte-exact (git-blob immutability +
sha256 pin gives the same determinism guarantee an embedded fixture provides)
while touching ONLY this one file and avoiding ~34 KB of fragile inline-JS
escaping (the legacy files contain template literals/backticks). The
`MODERN_SHELL_MARKER` guard delivers the task's "can never silently read modern
bytes again" property.

**Adversarial strength preserved.** The assertion is **byte-for-byte unchanged**
(`assert.deepEqual(legacyState, { … currentShellCount: 0 })`); the fix was NOT
achieved by embedding modern bytes as "legacy". `currentShellCount` is measured
live from `#rlviews[data-rlexperience-shell="ready"]`; if a future change made
legacy bytes wrongly mount the modern shell the count becomes ≥1 and this test
fails RED — exactly the failure `stabilize` observed. One truthful log string was
updated (`baselineAuthority=git:HEAD` → `git:767732db(pre-Scope-02,…)`); no other
line changed.

### Before (pre-fix RED) — mechanism proven; run provenance recorded

**Claim Source: not-run-by-me-this-session (orchestrator-recorded) + git-proven
mechanism.** The orchestrator verified the deterministic failure twice (exit 1
both runs): `currentShellCount: 1` vs expected `0` at line 362. I did not revert
the fix to re-run the RED; the mechanism is proven directly by the marker table
above (`HEAD:rlviews.js` marker = 1 → modern shell mounts → count 1).

### After (post-fix GREEN) — executed this session, deterministic (2 runs)

**Claim Source: executed (this session).** `node --test
tests/tool-experience-shell.functional.mjs`, run twice.

Run 1 (exit 0):

```
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract
[scope02-rollback] scope01Registry tools=23 experiences=23 phase=contract-shadow shadowOnly=true visibleModeCutover=false panelBootstrap=false
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] restoredShell labels=Simple|Power|Brief|Journey panels=4 legacySuppressed=true state=shadow-safe
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (25983.621802ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (628.475802ms)
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2124.115232ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
RUN1_EXIT=0
```

Run 2 (exit 0):

```
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] restoredShell labels=Simple|Power|Brief|Journey panels=4 legacySuppressed=true state=shadow-safe
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (25412.438053ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (626.43115ms)
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2069.657027ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
RUN2_EXIT=0
```

### Corroborating gates — executed this session

**Claim Source: executed.**

```
Research-Lab self-test: 712 passed, 0 failed
SELFTEST_EXIT=0
```

```
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /home/redacted/research-lab
ℹ️  Scanning tests/tool-experience-shell.functional.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
RQG_EXIT=0
```

### Change scope + boundary confirmation

**Claim Source: executed** (`git diff` read-only). My ONLY code edit is
`tests/tool-experience-shell.functional.mjs`. The other working-tree deltas
(`git diff --name-only`) are, respectively, this closure's own record
(this bug's `report.md` + `state.json`) and the operator's **pre-existing
parallel Scope-05 work** (`scopes/05-market-structure-options-adapters/*` +
Feature 012 `state.json`) — none of which I touched. The test-file diff is
exactly the `baselineBytes` rewrite + pinned constants + two guards, plus the one
truthful log string:

```
 function baselineBytes(relativePath) {
-  return execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: REPOSITORY_ROOT });
+  const bytes = execFileSync('git', ['show', `${LEGACY_BASELINE_COMMIT}:${relativePath}`], { cwd: REPOSITORY_ROOT });
+  assert.equal(bytes.includes(MODERN_SHELL_MARKER), false, `…must not contain the modern shell marker…`);
+  const expectedSha256 = LEGACY_BASELINE_SHA256[relativePath];
+  if (expectedSha256) { assert.equal(sha256(bytes), expectedSha256, `…sha256 drifted…`); }
+  return bytes;
 }
```

Not touched: `rlviews.js`, `rlapp.js`, `rlexperience-adapters/`, `scopes/05-*`
(operator parallel work), certified BUG-004 files, provider tests, all product
code. No `git commit` / `push` / `rebase` / `reset` / `checkout`. `certification.*`
and top-level `status` remain `in_progress` and untouched. Route: bubbles.regression.

## Regression Phase Re-Run (Truthful — supersedes prior FALSE-GREEN)

**Phase:** regression (RE-RUN)

**Agent:** bubbles.regression (dispatched by bubbles.goal, executionModel
direct-authorized-runner)

**Executed:** YES (current session)

**Verdict:** ⚠️/🔴 **BUG-001 fix REGRESSION_FREE + CROSS-SPEC CONFLICT_DETECTED
→ `route_required`** (do NOT advance to simplify)

**Repository:** `~/research-lab`, HEAD `4d4cd3d7` ("feat(012): Scope 05 partial —
market-breadth + conditional-volatility adapters (2/8)" — the operator's latest
parallel commit). Stack home paths redacted to `~/research-lab`.

> **Truthful-evidence correction (why this re-run exists).** The earlier
> `regression` phase (2026-07-24T06:24:11Z, "Regression Phase Evidence") and
> `harden` phase (2026-07-24T07:05:00Z, "Harden Phase Evidence") each recorded
> `tests/tool-experience-shell.functional.mjs` as GREEN (`pass 3 / fail 0`) — and
> at their HEAD (`6655b72a`, pre-decorator/pre-modern-shell commit) that premise
> genuinely held. Those claims became **FALSE-GREEN** once the operator committed
> Scope 02's modern shell to `HEAD` (`c81d808d`), which the `stabilize` phase
> caught as `SCN-012-031` RED (`currentShellCount 1` vs `0`). `bubbles.test` then
> repointed `baselineBytes()` from moving `HEAD` to the immutable pre-Scope-02
> parent commit `767732db` with no-shell-marker + exact-sha256 guards. **This
> re-run produces the authoritative regression record on CURRENT bytes (HEAD
> `4d4cd3d7`) and supersedes the prior regression/harden GREEN claim for that
> file.** It also DISCOVERS a second, previously-uncaught instance of the same
> HEAD-baseline-drift class in a different parent Feature 012 test — recorded and
> routed below.

### RR-1 — Shell functional canary `tests/tool-experience-shell.functional.mjs` (TWO deterministic runs, GREEN)

**Command:** `node --test tests/tool-experience-shell.functional.mjs` (run 1, then run 2)

**Exit Codes:** `RUN1_EXIT=0`, `RUN2_EXIT=0`

**Claim Source:** executed (this session)

Run 1 (23/23 `[shell-canary]` routes emitted a ready shell — `market-brief`,
`market-heatmap-lab`, `options-flow-feed-lab` (3rd), … `technical-analysis-decision-lab`;
each `panels=4 legacySuppressed=true statusControls=1`), tail:

```text
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (24559.717931ms)
[shell-boundary] viewChanges=4 fetches=0 providerStatus=preserved ownerRead=preserved
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (646.86269ms)
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract
[scope02-rollback] protectedDigest=ec5c49a09e4876ddee54850c1d0c6fdc60ddab51c5084c82426b5e761aa5480f byteEqual=true
[scope02-rollback] optionFiles=23 optionDigest=3b002be32abab4d663759c241ca55121de674420da43f36b525ac33851a999d5 byteEqual=true
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] realWorktree allowedHashesEqual=true protectedHashesEqual=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2098.037467ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 27674.912072
RUN1_EXIT=0
```

Run 2 (deterministic — identical result; same `protectedDigest`/`optionDigest`,
`currentShellCount=0`, `baselineAuthority=git:767732db`):

```text
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (25785.981987ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (627.536999ms)
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] realWorktree allowedHashesEqual=true protectedHashesEqual=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2104.747658ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ duration_ms 28876.450532
RUN2_EXIT=0
```

**Result:** PASS (deterministic ×2). `pass 3 / fail 0 / skipped 0`, exit 0 both
runs. `SCN-012-031` is now GREEN with `currentShellCount=0` and
`baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d)` — the repointed
immutable baseline holds on current bytes. All 23 registry routes (options-flow-feed-lab
included) bootstrap one ready shell. **This is the truthful record that supersedes
the prior FALSE-GREEN for this file.**

### RR-2 — BUG-001 focused regression + full shell suite `tests/tool-experience.spec.mjs` (System Chrome, GREEN)

**Command (focused):** `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list`
**Exit Code:** `FOCUSED_EXIT=0` — **Claim Source:** executed

```text
Running 1 test using 1 worker
  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (18.3s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true
  1 passed (19.5s)
FOCUSED_EXIT=0
```

**Command (full suite):** `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** `FULLSUITE_EXIT=0` — **Claim Source:** executed

```text
Running 4 tests using 1 worker
  ✓  1 …adow registry validation derives all experiences without cutover (481ms)
  ✓  2 …ified Feature 002 exposes exact Brief gate and no author request (577ms)
  ✓  3 …ature 008 preserves public Portfolio and creates no private store (2.6s)
  ✓  4 …UG-001 options flow shell is ready before heavy hydration begins (18.4s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true
  4 passed (23.4s)
FULLSUITE_EXIT=0
```

**Result:** PASS. The first native same-origin option delta (`/data/options/SPY.json`)
observes `shellReadyAtStart=true` and `cacheFirstOwnerPainted=true` (cache-first
paint before heavy hydration); the test's internal assertions prove exactly-once
12-distinct-path hydration and zero second worker group after Power/Simple view
toggles. `4 passed` with zero skips inside the full suite.

### RR-3 — Broad build-free selftest `node scripts/selftest.mjs` (GREEN)

**Command:** `node scripts/selftest.mjs` — **Exit Code:** `SELFTEST_EXIT=0` — **Claim Source:** executed

```text
  ✓ Feature 012 Scope 04 exposes the closed six-state runtime with no shipped owner adapter or tool-ID branch
  ✓ Feature 012 Scope 04 compute identity excludes retrieval occurrence time but retains the semantic evidence cutoff
  ✓ Feature 012 Scope 04 owns no provider, network, storage, authoring, publication, or tool-formula authority
  ✓ Feature 012 Scope 04 carries cancellation, stale-completion rejection, and explicit last-valid projection contracts
================================================
Research-Lab self-test: 712 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

**Result:** PASS — `712 passed, 0 failed` (0 skipped). No product regression on current bytes.

### RR-4 — Regression-quality guard (plain + `--bugfix`, 0 violations)

**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh tests/tool-experience.spec.mjs`
then `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/tool-experience.spec.mjs tests/tool-experience-shell.functional.mjs`
**Exit Codes:** `RQG_PLAIN_EXIT=0`, `RQG_BUGFIX_EXIT=0` — **Claim Source:** executed

```text
--- plain ---
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
RQG_PLAIN_EXIT=0
--- --bugfix ---
✅ Adversarial signal detected in tests/tool-experience.spec.mjs
✅ Adversarial signal detected in tests/tool-experience-shell.functional.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
  Files with adversarial signals: 2
RQG_BUGFIX_EXIT=0
```

**Result:** PASS — 0 violations / 0 warnings both modes; both bugfix files carry an adversarial signal.

### RR-5 — Cross-spec: certified BUG-004 provider-fallback + parent Feature 012 provider/tooltip suites

**RR-5a Playwright E2E (System Chrome)** — `npx --no-install playwright test tests/provider-fallback-status.spec.mjs tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** `CROSS_E2E_EXIT=0` — **Claim Source:** executed

```text
Running 4 tests using 2 workers
  ✓  1 …r chart context is equivalent by pointer keyboard touch and table (1.6s)
  ✓  2 …003 force-local status stays masked with a reachable local proxy (675ms)
  ✓  3 …ly context fails the exact Power item without hiding valid peers (768ms)
  ✓  4 … mobile returns focus and promotes same-data table without canvas (4.8s)
  4 passed (8.6s)
CROSS_E2E_EXIT=0
```

**RR-5b Standalone node suites** (each in its own process; the tooltip functional
suite snapshots the whole worktree and MUST run standalone):

```text
--- node --test tests/provider-credentials.unit.mjs (PCU_EXIT=0) ---
✔ SCN-BUG002-001 providers start unconfigured; two-tier API present; local key configures then clears
✔ SCN-BUG002-004 fail-closed transport and prototype-safe unknown providers
ℹ tests 2  ℹ pass 2  ℹ fail 0

--- node --test tests/provider-credentials.functional.mjs (PCF_EXIT=0) ---
TOTAL_PROXY_CREDENTIAL_LEAKS=0
TOTAL_DIRECT_UNEXPECTED_CREDENTIALS=0
MATRIX_FAILURES=0
✔ Regression BUG-004: proxy HTTP failure falls back once to same-provider local key
✔ Regression BUG-004: fallback never crosses provider or retries
✔ Regression BUG-004: no same-provider key fails closed without disclosure
ℹ tests 11  ℹ pass 11  ℹ fail 0

--- node --test tests/contextual-tooltip.unit.mjs (CTU_EXIT=0) ---
ℹ tests 5  ℹ pass 5  ℹ fail 0
```

**Result RR-5a/RR-5b:** PASS — certified BUG-004 provider-fallback e2e (4/4),
provider-credentials (2/2 unit, 11/11 functional, 0 credential leaks), and
contextual-tooltip UNIT (5/5) are GREEN. No BUG-004 conflict.

**RR-5c — DISCOVERED CROSS-SPEC CONFLICT (deterministic RED, outside BUG-001 boundary).**
`node --test tests/contextual-tooltip.functional.mjs` (standalone) is RED —
`CTF_EXIT=1` on THREE independent runs (deterministic, not the known
whole-worktree parallel artifact). TAP result:

```text
ok 1 - TP-03-02 RLG retains glossary aliases and macro ownership while composing RLCTX contexts
ok 2 - TP-03-02 RLTKR retains public identity and Yahoo navigation while composing a separate RLCTX control
ok 3 - TP-03-02 RLCHART validates exact contexts stable point rails and same-data targets
ok 4 - TP-03-02 providers compose validated owner contexts through one RLCTX API
ok 5 - TP-03-02 structured chart adapter freezes stable point order and exact table projection
ok 6 - TP-03-02 active providers and canary pages contain one disclosure owner and no private engines
ok 7 - TP-03-02 provider ownership canaries preserve glossary ticker and chart calculations
not ok 8 - SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes
    doesNotMatch: /src="rlcontext\.js|src="rlexperience\.js/   (subject = market-heatmap-lab.html)
ok 9 - SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline
# tests 9   # pass 8   # fail 1
CTF_EXIT=1  (deterministic on 3/3 runs)
```

**Root cause (git-proven, identical CLASS to the already-fixed SCN-012-031).**
`tests/contextual-tooltip.functional.mjs:114-115` defines
`baselineBytes(p) = git show HEAD:<p>` (moving HEAD). `verifyLegacyCanaryPages()`
reconstructs the "legacy canary" for `market-heatmap-lab.html` from those bytes,
then `:265` asserts `doesNotMatch(source, /src="rlcontext\.js|src="rlexperience\.js/)`.
The operator's committed Feature 012 decorator rollout ADDED those scripts to
`market-heatmap-lab.html`:

| ref | `market-heatmap-lab.html` `rlcontext/rlexperience` refs | note |
|-----|--------------------------------------------------------|------|
| `767732db` (pre-Scope-02) | **0** | legacy — assertion held |
| `HEAD` (`4d4cd3d7`, committed, clean) | **2** (`rlexperience.js` L411, `rlcontext.js` L412) | modern — `doesNotMatch` now FAILS |

So `baselineBytes(market-heatmap-lab.html)=git show HEAD:…` returns the MODERN
page WITH the decorator scripts, breaking the legacy-canary `doesNotMatch`. This
is the **twin of `SCN-012-031`** (HEAD-relative legacy baseline drifting to modern
after the operator commits the modern bytes) in a DIFFERENT parent Feature 012
test.

**Boundary proof — this is NOT a BUG-001 regression.** The BUG-001 fix touches
ONLY `options-flow-feed-lab.html` (byte-stable `31fbb098…`) and the two test
files; it never touches `market-heatmap-lab.html`, `contextual-tooltip.functional.mjs`,
`rlcontext.js` (byte-stable `7021f053…`), or `rlexperience.js` (byte-stable
`011b01da…`). `market-heatmap-lab.html` is committed-clean at HEAD (empty
`git status`), last changed by commit `c81d808d` (the operator's Feature 012
Scopes 01-04), and the operator is actively extending Scope 05 this session
(`rlexperience-adapters/market-structure.js` +414 appeared mid-run). This is the
operator's **active parallel Feature 012 work**, route-only per the
cross-`workBoundary` mandate. Classified `CONFLICT_DETECTED`; routed to
`bubbles.test` (parent Feature 012 baseline integrity — same owner/pattern that
fixed `SCN-012-031`) and returned to `bubbles.goal` for the cross-spec decision.

### RR-6 — Protected-owner byte-stability (all 9 owners byte-stable; only the SCN-031 test file changed)

**Command:** `sha256sum options-flow-feed-lab.html tests/tool-experience.spec.mjs tests/tool-experience-shell.functional.mjs rldata.js scripts/fetch-options.mjs rlapp.js rlviews.js rlexperience.js rlg.js rlticker.js rlcontext.js`
**Claim Source:** executed (this session)

```text
31fbb0985a11c56742043732fa726bdc5d829f7b739b1fd00a393180d118ec82  options-flow-feed-lab.html      [MATCH baseline — BUG-001 fix byte-stable]
29ed8d9c9bf97bd8df24b80aeb14e88ce01a1393e5234ac32acdb065f96da8a6  tests/tool-experience.spec.mjs  [MATCH baseline — BUG-001 regression test byte-stable]
95926d67d80a78212168996b3ba44c71159f1a4cede17e234ed74f66e3ae7427  tests/tool-experience-shell.functional.mjs  [CHANGED vs pre-fix d8be707b — the EXPECTED SCN-031 baselineBytes fix]
6841de3f70959082c4ac50831060252d0d8786c2e31d97a1827f8b443950be72  rldata.js         [MATCH]
df25be67ab2cbaf14f4db277618d91ffd162374112344a057f46c0411298bbb3  scripts/fetch-options.mjs  [MATCH]
1d4f80a3458ca65560b8c23a3e6d206ff3f89f5ed86f3495ffd9283df114e6d0  rlapp.js          [MATCH]
e4dc88f5d22131a308dcbe98cf709a0097f3628ef0819bc4f0da6b903bd1a6b1  rlviews.js        [MATCH]
011b01dae1187264e7b6aeb5cfabbd285f450c7fc223ea047000ec6b679ccc3f  rlexperience.js   [MATCH]
138715b89a705efafdf4d6393c064c48ec18aa32f9a0790eb537edf032d462c8  rlg.js            [MATCH]
8b44f17cc799ff23e2cc1573b162a9f19a5bf2f1d3d4e6e29feb63ec455d7211  rlticker.js       [MATCH]
7021f053b11197627ad30cc1eaf2ce6cc8e44c14a4c5d3a24d8786fe62907294  rlcontext.js      [MATCH]
```

**Result:** PASS — all 9 protected owners (`options-flow-feed-lab.html`,
`rlviews.js`, `rlapp.js`, `rlexperience.js`, `rlg.js`, `rlticker.js`,
`rlcontext.js`, `scripts/fetch-options.mjs`, `rldata.js`) are byte-identical to
the recorded post-fix baseline. `tests/tool-experience.spec.mjs` is byte-stable.
`tests/tool-experience-shell.functional.mjs` changed to `95926d67…` — the single
expected SCN-031 `baselineBytes` fix (was pre-fix `d8be707b…`). `rlexperience.js`
and `rlcontext.js` themselves are byte-stable — the operator added *references*
in `market-heatmap-lab.html`, not new bytes to the decorator modules.

### RR-7 — Tracked-diff confinement

**Command:** `git diff --numstat HEAD` — **Claim Source:** executed (read-only)

```text
414     1       rlexperience-adapters/market-structure.js          [OPERATOR Scope-05 parallel work — excluded]
408     1       specs/012-.../BUG-001-.../report.md                [MINE — this regression record]
58      15      specs/012-.../BUG-001-.../state.json               [MINE — phase routing]
1       1       tests/simple-model-adapters-market.unit.mjs        [OPERATOR Scope-05 parallel work — excluded]
35      2       tests/tool-experience-shell.functional.mjs         [the SCN-031 baseline fix — the ONLY BUG-001 code change]
```

**Result:** PASS — the ONLY BUG-001-relevant code change in the worktree is
`tests/tool-experience-shell.functional.mjs` (the SCN-031 fix). `report.md` +
`state.json` are this record. `rlexperience-adapters/market-structure.js` (+414)
and `tests/simple-model-adapters-market.unit.mjs` are the operator's **active
parallel Scope-05 market-structure-adapter work** (they appeared mid-session);
per the task boundary note they are left untouched and are NOT a BUG-001
regression. No protected owner, no `options-flow-feed-lab.html`, no
`tests/tool-experience.spec.mjs`, no `scopes/05-*` file is in the BUG-001 change
set. No `git commit` / `push` / `rebase` / `reset` / `checkout` was run.

### Regression Verdict (re-run)

- **BUG-001 fix: `REGRESSION_FREE`.** Every BUG-001-owned and BUG-001-adjacent
  check is GREEN on current bytes (RR-1 ×2, RR-2 focused+suite, RR-3 selftest
  712/0, RR-4 guards 0v/0w, RR-5a/5b cross-spec BUG-004 + provider + tooltip-unit).
  All 9 protected owners byte-stable; only the SCN-031 test file changed.
  `SCN-012-031` is truthfully GREEN (`currentShellCount=0`), correcting the prior
  FALSE-GREEN.
- **Cross-spec: `CONFLICT_DETECTED` (route_required).** A real deterministic RED
  (`tests/contextual-tooltip.functional.mjs` test 8 `SCN-012-003`, 8/9 pass, 1
  fail, 3/3 runs) exists in the parent Feature 012 suite — HEAD-relative
  `baselineBytes()` drift after the operator's committed decorator rollout added
  `rlcontext.js`/`rlexperience.js` to `market-heatmap-lab.html` (twin of
  `SCN-012-031`). Outside BUG-001's boundary; the operator's active parallel
  Feature 012 work.
- **Action:** do NOT advance to `simplify`. Record the finding
  (`FEAT012-SCN012-003-HEAD-BASELINE-DECORATOR-DRIFT`), route to `bubbles.test`
  (parent Feature 012 baseline integrity), return the cross-spec decision to
  `bubbles.goal`. `certification.*` and top-level `status` remain `in_progress`
  and untouched.
`bubbles.regression` (re-run its phase with truthful evidence).

---

## Regression Disposition — Systemic Anti-Pattern Handed Off to BUG-002

**Agent:** `bubbles.regression` (Steve French) · **Phase:** `regression` (disposition close + re-verify + advance)
**Timestamp:** 2026-07-24T17:47:41Z · **HEAD at disposition:** `f3b36bdf` (moved from the prior re-run's `4d4cd3d7`; operator committing/pushing this repo in parallel)
**Dispatched by:** top-level `bubbles.goal`. No `git commit` / `push` / `rebase` / `reset` / `checkout` run. Only this `report.md` and `state.json` were written by this phase.

### Orchestrator decision that supersedes the prior `route_required`

The prior regression re-run (executionHistory[13], 08:05–08:36Z) returned `crossSpecVerdict=CONFLICT_DETECTED / route_required → bubbles.test` for the discovered
finding `FEAT012-SCN012-003-HEAD-BASELINE-DECORATOR-DRIFT`. The top-level orchestrator has since made a **final disposition**: the systemic `git show HEAD:<path>`
moving-baseline anti-pattern — of which the discovered finding is one instance — is a **PARENT Feature 012 defect**, not a BUG-001 defect. It has been captured and
routed as a first-class sibling packet:

- **Handoff target (verified real):** `specs/012-market-action-center-and-guided-tools/bugs/BUG-002-scope-baseline-head-drift-antipattern`
  (`state.json.status = not_started`; `featureName = "BUG-002 Feature 012 Test-Infra Moving-HEAD Baseline-Authority Drift"`), routed to the parent Feature 012 owner /
  the actively-working operator.
- **Systemic class covered by BUG-002:**
  - `SCN-012-003` — `tests/contextual-tooltip.functional.mjs` `baselineBytes()` reads `git show HEAD:market-heatmap-lab.html`; **design-intent-gated / owner-design-gated**
    (the pre-decorator baseline commit is an owner decision and MUST NOT be guessed).
  - `SCN-012-033` — `tests/tool-experience.spec.mjs` tool-experience-registry baseline (same moving-`HEAD` repin class).

Per the discovered-issue-disposition policy, a **sibling-spec handoff** is a legitimate closure disposition for a finding discovered outside the discovering packet's
`workBoundary`. BUG-001 does **not** fix these — they belong to BUG-002. This closes BUG-001's discovered finding; it does not silence it.

### Re-verification of BUG-001's OWN surface on current bytes (HEAD `f3b36bdf`)

The BUG-001-owned test-plan surface was re-run on the moved HEAD to confirm it is still regression-clean after the operator's parallel commits (selftest grew 712 → 735).

**Pin integrity (precondition):** the SCN-012-031 baseline pin `LEGACY_BASELINE_COMMIT = 767732db04e0cd32bf107b2a95030a6771bd16f2` (an immutable full SHA, **not** `HEAD`)
still resolves after the operator's rebase — `git cat-file -t 767732db` → `commit` (exit 0); `git cat-file -e 767732db04e0…` (exit 0). The pin is **not** orphaned; the
SCN-012-031 fix continues to fail-loud only on genuine drift, not on HEAD movement.

| # | Command | Exit | Result |
|---|---------|------|--------|
| RR-1a | `node --test tests/tool-experience-shell.functional.mjs` (run A) | 0 | tests 3 / **pass 3 / fail 0 / skipped 0**; `SCN-012-031` GREEN `baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d)` `currentShellCount=0` `byteEqual=true`; `SCN-012-028/029` **23/23** registry canary GREEN |
| RR-1b | `node --test tests/tool-experience-shell.functional.mjs` (run B, determinism) | 0 | `ok 1/2/3`, **pass 3 / fail 0 / skipped 0** — deterministic, identical to run A |
| RR-2 | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list` | 0 | **1 passed** (23.7s); `[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true` |
| RR-3 | `node scripts/selftest.mjs` | 0 | **Research-Lab self-test: 735 passed, 0 failed** (grew from 712 via operator's parallel commits; still 0 failed) |

**Verdict — BUG-001 own surface: `REGRESSION_FREE` on current bytes.** The SCN-012-031 pin resolves; the only BUG-001 code change remains
`tests/tool-experience-shell.functional.mjs` (the SCN-031 baseline fix). The BUG-001 worktree change set is exactly `report.md`, `state.json`, and that one test file
(`git status --porcelain` confirmed).

### Disposition recorded

| Finding | Prior state | Disposition | Owner |
|---------|-------------|-------------|-------|
| `FEAT012-SCN012-003-HEAD-BASELINE-DECORATOR-DRIFT` (systemic class incl. `SCN-012-033` tool-experience-registry repin) | `route_required → bubbles.test` (executionHistory[13].unresolvedFindings) | **`sibling-spec-handoff → BUG-002`** (`BUG-002-scope-baseline-head-drift-antipattern`, `not_started`) | parent Feature 012 owner / operator |

With the discovered finding dispositioned as a sibling-spec handoff and BUG-001's own surface `REGRESSION_FREE`, the BUG-001 `regression` phase is **cleanly complete**.
It advances to `simplify` (`nextRequiredOwner = bubbles.simplify`, `currentPhaseStatus = pending`). `certification.*` and top-level `status` remain `in_progress` and were
**not** touched.

## Simplify Phase Re-Run

**Agent:** `bubbles.simplify` · **Phase:** `simplify` (re-run on current bytes after the loop restarted at `implement` for the SCN-012-031 test-baseline fix)
**Timestamp:** 2026-07-24T18:05:00Z · **HEAD at re-run start:** `5ef6975a` (advanced from the regression disposition's `f3b36bdf` during this phase — operator committing/pushing this repo in parallel)
**Dispatched by:** top-level `bubbles.goal`. No `git commit` / `push` / `rebase` / `reset` / `checkout` run. Only this `report.md` and `state.json` were written by this phase. **Verdict: `NO_CHANGE_MINIMAL` — zero code bytes changed.**

### Scope of this re-run

The `bugfix-fastlane` loop restarted at `implement` after the SCN-012-031 test-baseline fix landed, so `simplify` re-runs over the two current BUG-001-boundary code changes only:

1. `options-flow-feed-lab.html` — the page-local exactly-once startup guard/barrier (`deltaHydrationStarted` / `startDeltaHydration` / `startDeltaAfterShellReady`; `rebuild(); render(); startDeltaAfterShellReady();`).
2. `tests/tool-experience-shell.functional.mjs` — the SCN-012-031 baseline fix (`baselineBytes()` repinned to the immutable pre-Scope-02 commit `767732db` with the no-shell-marker + per-file sha256 fail-loud guards).

### Surface 1 — `options-flow-feed-lab.html` guard/barrier: minimal, no change

The genuinely-new fix code (≈ lines 631–651) is:

- `var deltaHydrationStarted = false;` — the adopted design/plan **exactly-once contract** (TR-BUG001-DESIGN / TR-BUG001-PLAN). Retained; removing it is not simplification, it deletes the contract.
- `startDeltaHydration()` — a 4-line exactly-once entry that wraps the pre-existing `fetchDelta().then(function () { rebuild(); render(); })` tail.
- `startDeltaAfterShellReady()` — the standard **synchronous-marker-check-or-subscribe-once** idiom: if `#rlviews[data-rlexperience-shell="ready"]` is already present run immediately, else attach one `{ once: true }` `rlviews:change` listener. Reuses the existing generic shared shell event + marker — **no new shared API**.

Findings: two functions, distinct single responsibilities (exactly-once entry vs shell-ready barrier), self-documenting names, no duplication, no dead code, no over-engineering. Merging them would couple the barrier with the guard; the separation is the minimal shape. **No safe simplification available.**

**Pre-existing-redundancy re-check (read-only git, truthful):** the only apparent redundancy — the trailing `.then(function () { rebuild(); render(); })` (fetchDelta already ends with `rebuild(); render();`) — is **pre-existing code relocated verbatim by the fix**, not new logic. Verified against the pre-fix `boot()` at commit `a16a87c7` (parent-of-fix), whose tail already read `fetchDelta().then(function () { rebuild(); render(); });  /* delta fetch, best-effort */` (introduced by the earlier `109f00be` perf commit "parallel chain hydrate + coalesced render"). Removing it would alter pre-existing behavior outside the fix + simplify remit; left **byte-stable**. This matches the prior simplify finding (executionHistory `BUG001-SIMPLIFY-PHASE`).

### Surface 2 — `tests/tool-experience-shell.functional.mjs` baseline fix: minimal, no change

The SCN-012-031 remediation (≈ lines 116–158) is:

- `LEGACY_BASELINE_COMMIT = '767732db…'` — the immutable pre-Scope-02 pin (the fix's core).
- `MODERN_SHELL_MARKER` + the no-marker `assert.equal(bytes.includes(marker), false, …)` — the **semantic** fail-loud guard (precise message tied to the actual invariant: legacy bytes carry zero shell markers).
- Frozen `LEGACY_BASELINE_SHA256` + the per-file sha256 `assert.equal(…)` — the **exact-byte** fail-loud guard (catches any drift).

Findings: the pin + two guards are the **reference SCN-012-031 remediation shape**. The no-marker assert (semantic invariant + self-documenting failure) and the sha256 pin (exact-byte drift) are **complementary defense-in-depth, not redundant over-engineering** — each fails loud on a different class of regression. Per the phase mandate these integrity guards MUST NOT be weakened, and no simplification preserves their fail-loud contract. The adversarial `currentShellCount: 0` assertion is unchanged. **No safe simplification available.**

### Re-confirmation on unchanged bytes (≥10 lines each)

| # | Command | Exit | Result |
|---|---------|------|--------|
| SR-1 | `node --test tests/tool-experience-shell.functional.mjs` | 0 | tests 3 / **pass 3 / fail 0 / skipped 0**; `SCN-012-031` GREEN `baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d)` `currentShellCount=0` `protectedDigest/dataDigest/optionDigest/htmlDigest byteEqual=true`; `SCN-012-028/029` **23/23** registry canary GREEN (options-flow-feed-lab: panels=4 statusControls=1) |
| SR-2 | `node scripts/selftest.mjs` | 0 | **Research-Lab self-test: 735 passed, 0 failed** |

Raw SR-1 tail (surface-2 home test):

```
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] restore currentScopeHashesEqual=true protectedHashesEqual=true dataOptionsHtmlHashesEqual=true
[scope02-rollback] realWorktree allowedHashesEqual=true protectedHashesEqual=true
[scope02-rollback] cleanup temporarySandboxRemoved=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (3766.754801ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 39389.456111
SHELL_FUNCTIONAL_EXIT=0
```

Raw SR-2 tail (canonical product check):

```
  ✓ swing owner functions preserve their structural invariants
  ✓ swing-transition adapter id registered in the market-structure module
  ✓ swing-structure-lab.html loads the market-structure module
  ✓ swing-structure-lab.html delegates smaArr/alignment/pivots/structure/accumDist/regimeBand to the single source
  ✓ swing-structure-lab.html carries no inline copy of the single-sourced swing formula

================================================
Research-Lab self-test: 735 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### Boundary confirmation

- **Code bytes changed by this phase: 0.** `options-flow-feed-lab.html` and `tests/tool-experience-shell.functional.mjs` left byte-stable; only `report.md` and `state.json` written.
- No `git commit` / `push` / `rebase` / `reset` / `checkout`. HEAD moved `f3b36bdf → 5ef6975a` under the operator's parallel commits; the `767732db` pin still resolves (SR-1 GREEN), so the re-run remained valid on current bytes.
- Protected owners (BUG-004 provider files, `rldata.js`, `scripts/fetch-options.mjs`, `data/options`, shared readiness API `rlapp`/`rlviews`/`rlexperience`, decorators `rlg`/`rlticker`/`rlcontext`, parent Feature 012 + Scope 04) untouched.
- SCN-012-031 integrity guards **not weakened**; adversarial `currentShellCount: 0` assertion unchanged.

## Gaps Phase Re-Run

**Agent:** `bubbles.gaps` · **Phase:** `gaps` (re-run on current bytes after the loop restarted at `implement` for the SCN-012-031 test-baseline fix and `simplify` re-confirmed `NO_CHANGE_MINIMAL`)
**Timestamp:** 2026-07-24T18:14:00Z · **HEAD at re-run:** `5ef6975a` (operator committing/pushing this repo in parallel)
**Dispatched by:** top-level `bubbles.goal`. No `git commit` / `push` / `rebase` / `reset` / `checkout` run. Only this `report.md` and `state.json` were written by this phase. **Verdict: `NO_CODE_GAP` — zero code bytes changed; no gap requires a code change; no routing to `bubbles.implement`/`bubbles.test` required.**

### Mandate & disposition summary

Verify NO gap between BUG-001's design/requirements and its delivered fix + tests + artifacts on current bytes across four dimensions. Result: all four clean; `gapsFound = none` (no reconciled-in-place edit needed this pass — the prior gaps iteration's Completion-Statement status reconciliation still holds, re-confirmed below). The systemic `git show HEAD:` moving-baseline anti-pattern (instances SCN-012-003 / SCN-012-033) is already dispositioned as a **sibling-spec handoff to `BUG-002-scope-baseline-head-drift-antipattern`** (`addressedFindings[FEAT012-SCN012-003-HEAD-BASELINE-DECORATOR-DRIFT]`) and is **explicitly NOT re-flagged** here — it is outside BUG-001's boundary and owned by BUG-002.

### Dimension 1 — Scenario coverage & 1:1 scenario↔test↔DoD mapping (NO GAP)

`traceability-guard` PASSED (exit 0): all 3 scenarios in `scenario-manifest.json`, every linked test exists, 3/3 mapped to Test Plan rows AND to DoD items, 0 unmapped, no orphan.

```text
--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 3 scenario contract(s)
✅ scenario-manifest.json records evidenceRefs
✅ All linked tests from scenario-manifest.json exist
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-001 ...
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-002 ...
✅ scopes.md scenario mapped to Test Plan row: SCN-BUG001-003 ...
--- Gherkin → DoD Content Fidelity (Gate G068) ---
ℹ️  DoD fidelity: 3 scenarios checked, 3 mapped to DoD, 0 unmapped
RESULT: PASSED (0 warnings)
TRACEABILITY_EXIT=0
```

`regression-quality-guard --bugfix` PASSED (exit 0): adversarial signal in BOTH regression files, 0 violations / 0 warnings — the tests are genuine discriminators that fail on regression, not silent-pass/tautological.

```text
ℹ️  Scanning tests/tool-experience.spec.mjs
✅ Adversarial signal detected in tests/tool-experience.spec.mjs
ℹ️  Scanning tests/tool-experience-shell.functional.mjs
✅ Adversarial signal detected in tests/tool-experience-shell.functional.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
  Files with adversarial signals: 2
REGRESSION_QUALITY_EXIT=0
```

Non-interception confirmed by direct read of `tests/tool-experience.spec.mjs:125` — the `Regression: BUG-001 …` test uses `page.addInitScript` + `Reflect.apply(nativeFetch, this, args)` (forwards every request unchanged; no `page.route`/`context.route`/`intercept`/`fulfill`/`abort`/service-worker). It asserts, at the first `/data/options/<t>.json`, `shellReadyAtStart===true` and `cacheFirstOwnerPainted===true`; then requires exactly 12 distinct option paths; then — after a Power→Simple view toggle — re-asserts `deltaStarts` length is still 12 (would fail if the exactly-once guard regressed). Covers SCN-BUG001-001 (shell-before-hydration + cache-first), SCN-BUG001-002 (12 sources + controls), SCN-BUG001-003 (1 shell / 4 tabs / 4 panels). The unchanged all-23 functional canary (TP-BUG001-01) covers SCN-BUG001-003 route completeness.

### Dimension 2 — Spec↔implementation coherence on current bytes (NO GAP)

`options-flow-feed-lab.html` (HEAD `5ef6975a`) `boot()` region satisfies every FR:

| Requirement | Delivered behavior (bytes) | Verdict |
|---|---|---|
| FR-B001-01 prompt shell | `startDeltaAfterShellReady()` gates `fetchDelta()` behind `#rlviews[data-rlexperience-shell="ready"]` | ✅ MATCH |
| FR-B001-02 cache-first | `boot()`: `loadState → syncSeg → wire → rebuild(); render();  /* cache-first paint */` runs synchronously BEFORE the barrier | ✅ MATCH |
| FR-B001-03 shared readiness, no page-ID branch | consumes generic marker + generic `rlviews:change`; grep of `rlapp.js`/`rlviews.js`/`rlexperience.js` for `options-flow` → NONE | ✅ MATCH |
| FR-B001-04 single start | `deltaHydrationStarted` boolean + `{ once: true }` listener; test proves exactly-12 after view toggles | ✅ MATCH |
| FR-B001-05 no timing workaround | no sleep/poll/timeout inflation in the barrier | ✅ MATCH |
| FR-B001-06 context preservation | decorators unchanged; `fetchDelta` render path (`rebuild(); render()`) intact | ✅ MATCH |
| FR-B001-07 source ownership | `ensureChain(s,12)`, `UNIVERSE`, `CONCURRENCY=6` unchanged | ✅ MATCH |
| FR-B001-08 complete route regression | broad selftest 735/0 (below); all-23 canary GREEN per regression/simplify re-runs | ✅ MATCH |
| FR-B001-09 boundary preservation | working tree confined to `report.md` + `state.json` (+ pre-existing in-boundary SCN-012-031 functional-test fix); parent Feature 012 / certification untouched | ✅ MATCH |

No requirement unmet; no undeclared behavior. The production `{ once: true }` + boolean-guard shape is **contract-equivalent** to the design's illustrative `onShellReady` pseudocode: per the documented shell lifecycle `buildControl()` writes the ready marker BEFORE `apply()` dispatches the first `rlviews:change`, so binding the first `rlviews:change` is always post-readiness. This was already analyzed and accepted by the first `gaps` + `harden` passes and is NOT a divergence.

Guard/barrier bytes (grep, `options-flow-feed-lab.html`):

```text
631:      var deltaHydrationStarted = false;
632:      function startDeltaHydration() {
633:        if (deltaHydrationStarted) return;
634:        deltaHydrationStarted = true;
635:        fetchDelta().then(function () { rebuild(); render(); });
637:      function startDeltaAfterShellReady() {
638:        if (document.querySelector('#rlviews[data-rlexperience-shell="ready"]')) {
639:          startDeltaHydration();
642:        window.addEventListener("rlviews:change", startDeltaHydration, { once: true });
650:        startDeltaAfterShellReady();   /* heavy delta starts once after the shared shell is ready */
NO_PAGE_ID_BRANCH_IN_SHARED = clean (grep exit non-zero)
```

Broad build-free selftest (TP-BUG001-05 / FR-B001-08), current bytes:

```text
  ✓ swing owner functions preserve their structural invariants
  ✓ swing-transition adapter id registered in the market-structure module
  ✓ swing-structure-lab.html loads the market-structure module
  ✓ swing-structure-lab.html delegates smaArr/alignment/pivots/structure/accumDist/regimeBand to the single source
  ✓ swing-structure-lab.html carries no inline copy of the single-sourced swing formula

================================================
Research-Lab self-test: 735 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### Dimension 3 — DoD completeness with real inline evidence (NO GAP)

`artifact-lint` PASSED (exit 0): all required artifacts present, top-level `status` matches `certification.status` (both `in_progress`), all checked DoD items have evidence blocks, no unfilled template markers in `scopes.md`/`report.md`.

```text
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0
```

DoD tally (`scopes.md`): `checked_[x]=13`, `unchecked_[ ]=0`, `**Status:** Done`. Nothing silently unchecked. The Completion Statement was re-read (lines 26–47) and coherently reads SCOPE-01 `Done` / 13 DoD checked / top-level `status` + `certification` `in_progress` — the prior gaps reconciliation note is intact, so no new reconciliation is needed this pass.

### Dimension 4 — research-lab policy / forbidden-remedy (NO GAP)

No forbidden remedy present: no timeout inflation, no route exclusion, no page-ID branch in shared code (grep clean), no decorator disablement, no row truncation, no manual fetch gate, no new producer, no changed provider/data owner. All three governance guards PASSED (`artifact-lint` exit 0, `traceability-guard` exit 0, `regression-quality-guard --bugfix` exit 0).

### BUG-002-owned anti-pattern — explicitly NOT re-flagged

The `git show HEAD:` moving-baseline anti-pattern (`FEAT012-SCN012-003-HEAD-BASELINE-DECORATOR-DRIFT`; instances SCN-012-003 owner-design-gated, SCN-012-033 registry) is out of BUG-001's `workBoundary` and already routed as a first-class sibling packet `BUG-002-scope-baseline-head-drift-antipattern`. BUG-001's own SCN-012-031 instance was fixed **in-boundary** (`tests/tool-experience-shell.functional.mjs` pinned to immutable `767732db`). Neither is re-raised as a BUG-001 gap.

### Boundary confirmation

- **Code bytes changed by this phase: 0.** `options-flow-feed-lab.html`, `tests/tool-experience.spec.mjs`, and `tests/tool-experience-shell.functional.mjs` left byte-stable; only `report.md` and `state.json` written.
- The 3 code surfaces: `options-flow-feed-lab.html` + `tests/tool-experience.spec.mjs` are committed/clean; `tests/tool-experience-shell.functional.mjs` carries the pre-existing, in-boundary, already-dispositioned SCN-012-031 baseline fix (uncommitted only because the operator commits in parallel) — I did not touch it.
- No `git commit` / `push` / `rebase` / `reset` / `checkout`. `certification.*` and top-level `status` untouched (both `in_progress`).
- Route advances to `bubbles.harden`.

## Harden Phase Re-Run (Truthful — corrects prior FALSE-GREEN)

> **Owner:** `bubbles.harden` · **Phase:** harden (re-run) · **Dispatched by:** top-level `bubbles.goal` · **When:** 2026-07-24T18:25:00Z · **Bytes:** current working tree, read-only git HEAD `5ef6975a` (operator commits/pushes this repo in parallel; the SCN-012-031 baseline fix is applied but uncommitted).
>
> **⚠️ Correction of record.** An EARLIER `harden` pass (the "Harden Phase Evidence" record at `2026-07-24T07:05:00Z`, and the `BUG001-HARDEN-PHASE` recap finding) reported `tests/tool-experience-shell.functional.mjs` as GREEN `pass 3 / fail 0` and "byte-identical … 11/11 sha256 match". **That green claim was INACCURATE:** at that time SCN-012-031 was actually RED because `baselineBytes()` read the moving git `HEAD` (which already carried the modern four-view shell), so the compatibility-rollback rehearsal reconstructed post-Scope-02 bytes and mounted a shell (`currentShellCount 1`, not `0`). The defect was later caught by `stabilize` (finding `BUG001-STABILIZE-SCN031-HEAD-BASELINE`), fixed in-boundary by repinning `baselineBytes()` to the immutable pre-Scope-02 commit `767732db`, and re-run through implement→test→regression→simplify→gaps. **This re-run supersedes that earlier harden green claim with truthful, executed evidence on current bytes.**

### HR-1 — Shell functional canary `tests/tool-experience-shell.functional.mjs` — TWO deterministic runs, GREEN, SCN-012-031 `currentShellCount 0`

Command (run twice): `node --test tests/tool-experience-shell.functional.mjs`

**Run 1 — `SHELL_FUNCTIONAL_RUN1_RC=0`:**

```
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (26755.726011ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (680.232906ms)
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract
[scope02-rollback] protectedDigest=377992d3b997f9c05ece7d1201a9c9efdae191a8d1cdf018d92c26221feefacf byteEqual=true
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] restore currentScopeHashesEqual=true protectedHashesEqual=true dataOptionsHtmlHashesEqual=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2329.200839ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 30132.521535
```

**Run 2 (determinism) — `SHELL_FUNCTIONAL_RUN2_RC=0`, identical outcome:**

```
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (26806.186053ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (656.718019ms)
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] restore currentScopeHashesEqual=true protectedHashesEqual=true dataOptionsHtmlHashesEqual=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2315.849702ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 30148.661632
```

- Both runs: **`pass 3 / fail 0 / skipped 0 / todo 0`**. SCN-012-031 **GREEN** with `currentShellCount=0` and `baselineAuthority=git:767732db` `byteEqual=true` (the legacy pre-shell bytes are truthfully reconstructed — the exact condition the earlier harden mis-reported). All 23 registry pages (SCN-012-028/029 canary) bootstrap one exact four-panel shell. Deterministic across both runs.

### HR-2 — Focused BUG-001 System-Chrome regression `tests/tool-experience.spec.mjs`, GREEN

Command: `npx playwright test tests/tool-experience.spec.mjs --project=system-chrome -g "BUG-001"` — `BUG001_FOCUSED_RC=0`

```
Running 1 test using 1 worker
  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (19.5s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true
  1 passed (20.9s)
```

- The first native same-origin `/data/options/*.json` delta starts only **after** the shared shell is ready (`shellReadyAtStart=true`) and cache-first owner content is already painted (`cacheFirstOwnerPainted=true`). Non-intercepting shim (`page.addInitScript` + `Reflect.apply(nativeFetch,…)`), live-stack.

### HR-3 — Full shell suite `tests/tool-experience.spec.mjs` (System Chrome), GREEN

Command: `npx playwright test tests/tool-experience.spec.mjs --project=system-chrome` — `FULL_SHELL_SUITE_RC=0`

```
Running 4 tests using 1 worker
  ✓  1 …adow registry validation derives all experiences without cutover (543ms)
  ✓  2 …ified Feature 002 exposes exact Brief gate and no author request (741ms)
  ✓  3 …ature 008 preserves public Portfolio and creates no private store (3.0s)
  ✓  4 …UG-001 options flow shell is ready before heavy hydration begins (25.1s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true
  4 passed (30.9s)
```

- **4 passed** (SCN-012-033, SCN-012-028, SCN-012-029, BUG-001). SCN-012-033 (a member of the BUG-002-owned `git show HEAD:` anti-pattern class) passes on current bytes and is reported factually — it is **not** re-flagged or attempted here (out of BUG-001's `workBoundary`; owned by sibling packet BUG-002).

### HR-4 — Broad build-free selftest `node scripts/selftest.mjs`, GREEN

Command: `node scripts/selftest.mjs` — `SELFTEST_RC=0`

```
================================================
Research-Lab self-test: 735 passed, 0 failed
================================================
```

- **735 passed, 0 failed, 0 skipped** (the selftest reports a passed/failed model with no skip mechanism; none skipped). Full unfiltered run.

### HR-5 — No `.only` / `.skip` / `todo` in BUG-001 test files

Command: `grep -nE '\.only\(|\.skip\(|it\.todo|test\.todo|describe\.only|describe\.skip|\btodo\(' tests/tool-experience-shell.functional.mjs tests/tool-experience.spec.mjs` → `MARKER_GREP_RC=1` (no matches = none present). Both files also self-report `skipped 0 / todo 0` in HR-1/HR-3.

### HR-6 — Exactly-once barrier robustness (confirmed by the passing tests + code), ROBUST

Barrier in `options-flow-feed-lab.html` (L631–L650):

```
631: var deltaHydrationStarted = false;
632: function startDeltaHydration() {
633:   if (deltaHydrationStarted) return;      // (c) double-hydration guard
634:   deltaHydrationStarted = true;
637: function startDeltaAfterShellReady() {
638:   if (document.querySelector('#rlviews[data-rlexperience-shell="ready"]')) { // (a) sync already-ready branch
639:     startDeltaHydration();
642:   window.addEventListener("rlviews:change", startDeltaHydration, { once: true }); // (b) async readiness branch
650: startDeltaAfterShellReady();
```

The three edge conditions are each exercised by the passing System-Chrome BUG-001 test (`tests/tool-experience.spec.mjs` L125–L184):
- **(a) shell already ready before the listener attaches** → sync `querySelector` branch (L638–639). Test asserts `firstDeltaStart.shellReady=true` and `cacheFirstOwnerPainted=true` — the delta never starts before the shell marker exists.
- **(b) readiness via `rlviews:change` `{once:true}`** → async branch (L642). Test asserts `deltaStarts.every(entry => entry.shellReady)===true` — whichever branch fired, every delta started post-readiness.
- **(c) `deltaHydrationStarted` guard prevents double hydration** → the test clicks **Power → Simple** tabs then asserts `deltaStarts` is **still length 12** (not 24) and `new Set(paths).size===12`. A view toggle does not restart hydration; no race leaves hydration unstarted or double-started.

**No robustness gap requiring a code change was found; no routing to `bubbles.implement`. Zero code bytes changed by this phase.**

### HR-7 — Zero deferral / zero forbidden remedy + SCN-012-031 integrity guards intact

- Forbidden-remedy token scan on the changed BUG-001 surface (`options-flow-feed-lab.html`, both test files): `grep -nE 'TODO|FIXME|HACK|STUB'` → `FORBIDDEN_TOKEN_RC=1` (none present).
- SCN-012-031 integrity guards intact in `tests/tool-experience-shell.functional.mjs`: `sha256()` helper (L61–62), immutable pin `LEGACY_BASELINE_COMMIT = '767732db04e0cd32bf107b2a95030a6771bd16f2'` (L128), `MODERN_SHELL_MARKER = 'data-rlexperience-shell'` no-shell-marker guard (L129), fail-loud `baselineBytes()` sha256-drift assertion (L135–147), and the adversarial `currentShellCount: 0` assertion (L398). Neither guard was weakened.

### HR-8 — Governance gate `artifact-lint`, PASSED

Command: `bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation` — `ARTIFACT_LINT_RC=0`

```
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

### Harden Verdict (re-run) — HARDENED / robustnessVerdict ROBUST

- All BUG-001 tests **GREEN on current bytes, zero skips**: shell functional `pass 3 / fail 0 / skipped 0` twice (deterministic, SCN-012-031 `currentShellCount 0`, 23/23 canary); focused BUG-001 regression `1 passed` (`shellReadyAtStart=true`); full shell suite `4 passed`; `node scripts/selftest.mjs` `735 passed / 0 failed`.
- Exactly-once barrier **ROBUST** across the sync already-ready branch, the `{once:true}` `rlviews:change` branch, and the `deltaHydrationStarted` guard — proven by the no-double-start (length stays 12 after a Power/Simple toggle) assertion.
- **Code bytes changed by this phase: 0.** Only `report.md` and `state.json` written. `options-flow-feed-lab.html`, `tests/tool-experience.spec.mjs`, and `tests/tool-experience-shell.functional.mjs` left byte-stable (the last carries the pre-existing, in-boundary, already-dispositioned SCN-012-031 fix — not touched here).
- No `git commit` / `push` / `rebase` / `reset` / `checkout`. `certification.*` and top-level `status` untouched (both `in_progress`).
- The BUG-002-owned `git show HEAD:` moving-baseline anti-pattern (SCN-012-003 / SCN-012-033) was **not** re-flagged or attempted.
- Route advances to `bubbles.stabilize`.

## Stabilize Phase Re-Confirm

> **Owner:** `bubbles.stabilize` · **Phase:** stabilize (re-run / re-confirm) ·
> **Dispatched by:** top-level `bubbles.goal` (`executionModel: direct-authorized-runner`) ·
> **When:** 2026-07-24T18:45:00Z · **Bytes:** current working tree, read-only git
> HEAD `03776380` (the operator committed/pushed this repo in parallel — HEAD moved
> two commits past harden's `5ef6975a`; the SCN-012-031 baseline fix + the
> `options-flow-feed-lab.html` reorder fix are applied in the working tree).
>
> **Mandate:** re-confirm — on CURRENT bytes — that the startup-starvation stability
> characteristic is resolved, that the in-boundary SCN-012-031 fix is GREEN and
> stable under the moved HEAD, and that no fix-introduced resource/reliability
> regression exists. This addresses the harden hand-off finding
> `BUG001-STABILIZE-PHASE-RERUN`. Diagnostic phase — **0 code bytes changed.**

### SR-1 — Immutable baseline is HEAD-move-proof (the exact defect the prior stabilize surfaced is now structurally closed)

The prior stabilize run (`## Stabilize Phase Evidence`) correctly surfaced that
`SCN-012-031` read the moving `git show HEAD:…`, which broke the moment commit
`c81d808d` committed the modern shell into HEAD. The in-boundary fix repinned
`baselineBytes()` to the immutable pre-Scope-02 commit `767732db`. HEAD has since
moved again (harden `5ef6975a` → now `03776380`), which is the precise stress
that would re-break a HEAD-relative premise — and it does not, because the pin is
immutable.

**Command:** `git --no-pager log --oneline -3`; `git show 767732db…:rlviews.js | grep -c data-rlexperience-shell`; `git show 767732db…:rlapp.js | grep -c data-rlexperience-shell`
**Claim Source:** executed (this session)

```text
=== read-only git HEAD (operator moving it in parallel) ===
  03776380 feat(012-scope05): deliver dealer-gamma-playbook/v1 adapter at owner-parity
  c4d40222 feat(012-scope05): deliver options-anomaly/v1 adapter (options.js) at owner-parity
  5ef6975a feat(012/scope-05): deliver technical-five-gate adapter (5 of 8) as honest proven-unavailable
=== immutable baseline 767732db reachable + still 0 shell markers ===
  767732db rlviews.js shell-marker hits = 0
  767732db rlapp.js  shell-marker hits = 0
  pin=767732db chore(bubbles): refresh 7.20.1 installer payload
```

HEAD is now `03776380` (harden saw `5ef6975a`); the pin `767732db` remains
reachable with **0** `data-rlexperience-shell` markers in both shared owners, so
`SCN-012-031` reconstructs the TRUE legacy pre-shell controls regardless of where
the operator's HEAD moves.

### SR-2 — Startup-stability contract GREEN: all-23 canary 23/23 + SCN-012-031 `currentShellCount 0` (TP-BUG001-01)

**Command:** `node --test tests/tool-experience-shell.functional.mjs`
**Claim Source:** executed (this session) — `SHELL_FUNCTIONAL_RC=0`

```text
[shell-canary] tool=market-brief views=Brief|Portfolio|Red Alert|Journey panels=4 legacySuppressed=true statusControls=1
[shell-canary] tool=options-flow-feed-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
... (23 route records total; options-flow-feed-lab present with panels=4, statusControls=1) ...
[shell-canary] tool=technical-analysis-decision-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (29800.21272ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (669.623741ms)
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract
[scope02-rollback] protectedDigest=b4bdd046540f5e1772f824f39e8f03f6a56a019aa71c73b35e73d17002ecbf26 byteEqual=true
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] restore currentScopeHashesEqual=true protectedHashesEqual=true dataOptionsHtmlHashesEqual=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2410.556849ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

All **23** registry routes — including `options-flow-feed-lab` — bootstrap one
exact four-panel shell under the **unchanged 10-second** `waitForSelector`
contract (`SCN-012-028/029` = 23/23 GREEN). `SCN-012-031` is GREEN with
`baselineAuthority=git:767732db`, `currentShellCount=0`, `byteEqual=true`.
`pass 3 / fail 0 / skipped 0 / todo 0`.

### SR-3 — Focused BUG-001 System-Chrome startup regression GREEN (TP-BUG001-02)

**Command:** `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list`
**Claim Source:** executed (this session) — `FOCUSED_REGRESSION_RC=0`

```text
Running 1 test using 1 worker

  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (18.6s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true

  1 passed (19.9s)
```

**Observed startup metrics:** `firstDelta=/data/options/SPY.json`,
`shellReadyAtStart=true`, `cacheFirstOwnerPainted=true`. The passing run means its
terminal assertions held: cache-first owner content is painted **before** the
first native `/data/options/*.json` request; the shell marker is present at that
first request; the delta-start set is exactly **12 distinct** option paths; and a
Power→Simple view toggle does **not** start a second worker group (`deltaStarts`
stays length 12 / size 12, every entry `shellReady`). Exactly-once hydration after
readiness confirmed.

### SR-4 — No fix-introduced resource/reliability regression (REORDERING only; total work unchanged)

**Command:** `grep -nE 'var deltaHydrationStarted|if \(deltaHydrationStarted\) return;|rlviews:change|querySelector.*data-rlexperience-shell|startDeltaAfterShellReady|var CONCURRENCY|var UNIVERSE|ensureChain\(s, 12\)' options-flow-feed-lab.html`
**Claim Source:** executed (this session)

```text
454:      var UNIVERSE = ["SPY","QQQ","IWM","NVDA","TSLA","AAPL","MSFT","META","AMZN","GOOGL","AMD","AVGO"];
613:        var CONCURRENCY = 6;                 /* 12 liquid-name chains — modest parallelism */
625:          return ensureChain(s, 12).catch(...).then(function () { HYDRATION.done++; ... });
631:      var deltaHydrationStarted = false;
633:        if (deltaHydrationStarted) return;
638:        if (document.querySelector('#rlviews[data-rlexperience-shell="ready"]')) {
642:        window.addEventListener("rlviews:change", startDeltaHydration, { once: true });
650:        startDeltaAfterShellReady();   /* heavy delta starts once after the shared shell is ready */
```

Resource/reliability review of the confined `options-flow-feed-lab.html` change:

- **No listener leak.** `rlviews:change` is registered with `{ once: true }` and
  only on the async branch (L642); the synchronous already-`ready` `querySelector`
  branch (L638) calls `startDeltaHydration()` and `return`s WITHOUT attaching any
  listener.
- **No double-hydration.** The page-local `deltaHydrationStarted` boolean
  short-circuits any second entry (L631/633) — belt-and-suspenders with
  `{once:true}`; SR-3 proves exactly 12 distinct paths and no second worker group
  after a view toggle.
- **Total work unchanged — reordering only.** `CONCURRENCY = 6` (L613),
  `UNIVERSE` = 12 liquid names (L454), and `ensureChain(s, 12)` (L625) are all
  unchanged; worker count, snapshot volume, and provider/fallback order are
  untouched. The only change is that the heavy `fetchDelta()` cycle begins
  exactly-once AFTER shared shell readiness instead of racing it.

### SR-5 — Product runtime healthy: build-free selftest GREEN (TP-BUG001-05)

**Command:** `node scripts/selftest.mjs` (full unfiltered run; summary + failure-marker scan of the captured output)
**Claim Source:** executed (this session) — `SELFTEST_RC=0`

```text
================================================
Research-Lab self-test: 735 passed, 0 failed
================================================
# failure-marker scan of the full run (✗ / ✖ / not ok / FAIL / Error:) = 0
```

`735 passed / 0 failed`, zero failure markers across the entire unfiltered run.
Registry, shell, context, model, and tool invariants are green — the reorder fix
introduced no product-runtime regression.

### SR-6 — Boundary + BUG-002 disposition (unchanged)

- **Code bytes changed by this phase: 0** (diagnostic re-confirm — tests only).
  Files written this phase: `report.md` (this section) and `state.json` (advance)
  ONLY.
- `tests/tool-experience-shell.functional.mjs` shows ` M` in the working tree —
  that is the **pre-existing, in-boundary, already-dispositioned SCN-012-031
  baseline-repin fix** applied by the earlier implement→…→harden cycle (uncommitted
  while the operator commits product code in parallel). It was **not** touched by
  this stabilize re-confirm.
- The BUG-002-owned `git show HEAD:` moving-baseline anti-pattern (SCN-012-003
  shell/decorator, SCN-012-033 registry) is OUT of BUG-001's `workBoundary` and was
  **not** re-flagged or attempted.
- No `git commit` / `push` / `rebase` / `reset` / `checkout`. `certification.*` and
  top-level `status` remain `in_progress` and untouched.

### Stabilize Verdict (re-confirm) — `STABLE`

- **Startup stability RESTORED:** all-23 readiness canary 23/23 GREEN under the
  unchanged 10s contract (`options-flow-feed-lab` ready); focused System-Chrome
  regression GREEN with `shellReadyAtStart=true`, `cacheFirstOwnerPainted=true`,
  exactly **12 distinct** option paths, exactly-once after readiness.
- **No fix-introduced resource/reliability regression:** `{once:true}` listener
  (no leak) + `deltaHydrationStarted` guard (no double hydration); `CONCURRENCY`,
  12-name universe, and `ensureChain(s,12)` unchanged — pure reordering.
- **SCN-012-031 in-boundary fix GREEN and stable** on current bytes
  (`currentShellCount=0`, `baselineAuthority=git:767732db`, `byteEqual=true`),
  proven HEAD-move-proof (HEAD advanced to `03776380`).
- `node scripts/selftest.mjs` `735 passed / 0 failed`. **No new stability/perf/
  resource defect found → no routing to `bubbles.implement`.**
- Route advances to `bubbles.devops`.
- `certification.*` and top-level `status` untouched. Route advances to `bubbles.gaps` (`nextRequiredOwner = bubbles.gaps`, `currentPhaseStatus = pending`).

---

## DevOps Phase — Operational Impact Assessment

**Agent:** `bubbles.devops` · **Mode:** `bugfix-fastlane` · **Phase:** `devops` · **opsVerdict:** `NO_OPS_IMPACT` · dispatched by top-level `bubbles.goal`.

### Operational surface inventory (read-only)

BUG-001 changed only a client-side, GitHub-Pages-served, single-file static tool
plus one in-boundary Node test-baseline fix. There is **no** build step, bundler,
Docker image, service lifecycle, config bundle, secret, deploy manifest, CI
workflow, or observability/monitoring surface introduced or touched.

| Surface | State | Touched by BUG-001? |
|---|---|---|
| `.github/workflows/pages.yml` (ONLY CI workflow — GitHub Pages auto-deploy on push to `main`; `verify` job = node source-lock + one Playwright spec; `deploy` job = `actions/upload-pages-artifact` path `.` → `actions/deploy-pages`; **no bundler/build**) | present, unmodified | **No** (`git status --porcelain` clean) |
| `package.json` (only `playwright@1.61.1` devDependency; **no build script, no application deps**) | present, unmodified | **No** (clean) |
| `Dockerfile*` / `docker-compose*` | **absent** (build-free repo confirmed) | N/A |
| config / infra / monitoring / secret / observability | **none exist** in-repo | N/A |
| `options-flow-feed-lab.html` (BUG-001 fix target — static single-file HTML tool at repo root, served verbatim by Pages) | committed / clean | Yes (already committed by operator; Pages auto-deploys on push) |
| `tests/tool-experience-shell.functional.mjs` (BUG-001 in-boundary SCN-012-031 test-baseline repin) | ` M` (uncommitted) | Yes — a Node `.mjs` test, **not** a build/CI/deploy/infra file |

**Foreign concurrent-session working-tree changes — NOT attributable to BUG-001,
NOT touched by this phase:** `rlexperience-adapters/options.js` (` M`),
`tests/simple-model-adapters-market.unit.mjs` (` M`), and the untracked sibling
`BUG-002-scope-baseline-head-drift-antipattern/` directory (`??`).

### Deploy mechanism (why NO_OPS_IMPACT)

Research Lab is a **build-free, single-file-HTML, GitHub-Pages static toolset**.
The "deploy" is: operator `git push origin main` → the `pages` workflow uploads
the repo root (`path: "."`) as the Pages artifact → `actions/deploy-pages` serves
it. A static-HTML tool edit plus a Node test edit require **zero** pipeline,
build-artifact, config, or infra change. The change ships identically whether or
not this devops phase runs. No operational / CI/CD / deploy / build /
observability defect was found → **no routing to a devops-owned remediation**.

### Build-free selftest gate — `node scripts/selftest.mjs` (GREEN)

**Claim Source:** executed (this session).

```text
Feature 012 Scope 05 swing-transition single-source owner parity (swing-structure-lab)
  ✓ smaArr trailing mean stable on the canonical swing bars
  ✓ alignment classifies the tangled canonical MA stack
  ✓ pivots detect the canonical swing high/low structure
  ✓ structure classifies the canonical double-bottom pattern
  ✓ accumDist OBV/accumulation stable on the canonical swing bars
  ✓ regimeBand maps fear/greed + trend to the owner regime bands
  ✓ swing owner functions preserve their structural invariants
  ✓ swing-transition adapter id registered in the market-structure module
  ✓ swing-structure-lab.html loads the market-structure module
  ✓ swing-structure-lab.html delegates smaArr/alignment/pivots/structure/accumDist/regimeBand to the single source
  ✓ swing-structure-lab.html carries no inline copy of the single-sourced swing formula

================================================
Research-Lab self-test: 735 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

- **Exact counts:** `735 passed, 0 failed`, exit `0`.

### DevOps verdict — `NO_OPS_IMPACT`

- **Code / operational bytes changed by this phase: 0.** Files written this phase:
  `report.md` (this section) and `state.json` (advance) ONLY.
- No `.github/workflows` edit, no `package.json` / dependency change, no new build
  artifact, no Docker/compose, no config / secret / infra / monitoring /
  observability wiring — confirmed by read-only `git status --porcelain` on each
  surface.
- No `git commit` / `push` / `rebase` / `reset` / `checkout`. `certification.*`
  and top-level `status` remain `in_progress` and untouched.
- Route advances to `bubbles.security` (`nextRequiredOwner = bubbles.security`,
  `currentPhase = security`, `currentPhaseStatus = pending`).

## Security Phase — Threat Assessment

**Agent:** `bubbles.security` · **Mode:** `bugfix-fastlane` · **Phase:** `security` · **securityVerdict:** `NO_SECURITY_IMPACT` · dispatched by top-level `bubbles.goal`.

BUG-001 changed exactly two files — a page-local client-side **startup-sequencing
guard** in `options-flow-feed-lab.html` (reorders WHEN the existing `fetchDelta()`
runs, after generic shell readiness) and a **test-only baseline repin** in
`tests/tool-experience-shell.functional.mjs`. Both were assessed against
OWASP-style Injection, Data-Exposure/Credential, and Supply-Chain concerns. **No
security defect found; no routing required. Code bytes changed by this phase: 0.**

### 1. Injection (OWASP A03) — no surface introduced

**Claim Source:** interpreted (static source review) + executed (sink/spawn scans).

**Test change — `tests/tool-experience-shell.functional.mjs`:** the only
child-process spawn is
`execFileSync('git', ['show', '<commit-sha>:<relativePath>'], { cwd: REPOSITORY_ROOT })`
(line 136).

- It uses `execFile` (imported `from 'node:child_process'`, line 2) — **not**
  `exec`/`execSync`. `git` receives an **argument array** (`['show', …]`) as
  argv; **no shell is spawned** (`shell: true` is absent → Node default `false`),
  so there is no shell-metacharacter interpretation, word-splitting, command
  chaining, or substitution → **no command-injection surface.**
- `LEGACY_BASELINE_COMMIT = '767732db04e0cd32bf107b2a95030a6771bd16f2'` (line 128)
  is a **hardcoded immutable 40-hex SHA** literal.
- `relativePath` is supplied only by the **two literal call sites** (lines 346–347):
  `baselineBytes('rlviews.js')` and `baselineBytes('rlapp.js')`. No user, network,
  environment, or `argv` input reaches it; the frozen allow-object
  `LEGACY_BASELINE_SHA256` keys the same two literals.
- `REPOSITORY_ROOT` (the `cwd`) is `fileURLToPath(new URL('..', import.meta.url))`
  (line 28) — a module-URL-derived constant, not attacker-controllable.
- This is a **test-only** `.mjs`: it never ships to GitHub Pages, never runs in a
  browser, and never handles user/network data; `execFileSync` runs only in the
  local dev/CI Node harness against the local git object store.
- Spawn scan: only `execFileSync` is present — **no `execSync` / `exec(` /
  `spawnSync` / `shell: true`** anywhere in the file.

**Production change — `options-flow-feed-lab.html`:** the guard
(`startDeltaHydration` / `startDeltaAfterShellReady` / `boot`, lines 631–652) adds
only:

- `document.querySelector('#rlviews[data-rlexperience-shell="ready"]')` — a
  **static string-literal** CSS selector (no interpolation, no user input);
- `window.addEventListener("rlviews:change", startDeltaHydration, { once: true })`
  — a **static-literal** event name whose handler pipes no event-derived data into
  any sink;
- a call to the **unchanged** same-origin `fetchDelta()` (`ensureChain(s, 12)` over
  the fixed 12-symbol `UNIVERSE`).

Dangerous-sink scan (`eval(` / `new Function` / `document.write` /
`insertAdjacentHTML`) → **`COUNT_dangerous=0`.** No `eval`, `new Function`,
`document.write`, `insertAdjacentHTML`, dynamic `<script>` injection, or new XSS
sink is introduced. The pre-existing `innerHTML` writes in `render()` (lines
551–584) are **unchanged** by BUG-001 and are fed by same-origin Git-backed
snapshot data + numeric `money()` formatting, not untrusted user input. The change
is a pure **reordering** of when hydration begins.

### 2. Data exposure / credentials (OWASP A02 / A09) — none

**Claim Source:** interpreted (static source review).

- No secret, token, credential, provider key, API key, or private datum is added,
  logged, or exposed by either file.
- Research Lab provider access remains the pre-existing **two-tier proxy /
  per-browser local-key path** (`RLDATA.providerFetch` → tailnet proxy **or**
  `localStorage.rlProviderConfig`). The startup reorder does **not** touch
  credential handling, provider order, or the snapshot source (same-origin
  Git-backed `data/options/*.json`).
- The guard adds only pre-existing non-sensitive `RLAPP.report(…)` status labels.
  The test's sha256 values are **public file digests**, not secrets.

### 3. Supply chain (OWASP A06) — no new dependency

**Claim Source:** executed (`git status --porcelain package.json`).

- `package.json` is **UNTOUCHED** (`git status --porcelain package.json` → empty).
  No dependency added.
- Both changed files use only Node/Web **built-ins**: the test imports
  `node:child_process` (`execFileSync`) and `node:crypto` (`createHash`); the HTML
  uses only DOM / `fetch` APIs. No new third-party import.

### Integrity hardening (defense-in-depth — not new surface)

The two `baselineBytes` guards — the `MODERN_SHELL_MARKER` no-marker assertion and
the frozen `LEGACY_BASELINE_SHA256` per-file sha256 pin — make it impossible for
the baseline to silently drift to tampered / post-Scope-02 bytes. This
**strengthens** the test's tamper-resistance and adds **no** attack surface.

### Build-free selftest gate — `node scripts/selftest.mjs` (GREEN)

**Claim Source:** executed (this session, full unfiltered run).

```text
================================================
Research-Lab self-test: 735 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### Security verdict — `NO_SECURITY_IMPACT`

- **Injection:** no command-injection (`execFile` arg-array, no shell, hardcoded
  SHA + literal-only `relativePath`); no `eval` / dynamic-script / XSS in
  production (`COUNT_dangerous=0`).
- **Data exposure:** no secret / credential added, logged, or exposed; the
  provider credential path is untouched.
- **Supply chain:** `package.json` clean; Node/Web built-ins only; no new
  dependency.
- **Code / bytes changed by this phase: 0.** Files written this phase:
  `report.md` (this section) and `state.json` (advance) ONLY.
- No `git commit` / `push` / `rebase` / `reset` / `checkout`. `certification.*` and
  top-level `status` remain `in_progress` and untouched.
- No security-owned remediation required → route advances to `bubbles.validate`
  (`nextRequiredOwner = bubbles.validate`, `currentPhase = validate`,
  `currentPhaseStatus = pending`).

---

## Validate Phase Evidence

**Agent:** `bubbles.validate` (certification gate of the persisted `bugfix-fastlane`
workflow, dispatched by top-level `bubbles.goal`). **Mode:** `deep` (full).
**Timestamp:** 2026-07-24T20:03Z–20:09Z. **HEAD during validate (read-only):**
`c3e5a4f1` (operator committing/pushing Feature 012 in parallel — no git mutation
performed by this phase). **Files written this phase:** `report.md` (this section)
and `state.json` (routing) ONLY. No `git commit` / `push` / `rebase` / `reset` /
`checkout`; no operator Feature-012 Scope-05 / parent-state / BUG-002 packet /
`tests/simple-model-adapters-market.spec.mjs` file touched.

### Validate 1 — Mechanical state-transition-guard (DECISIVE) — `EXIT 1 / FAIL`

**Claim Source:** executed (this session, full unfiltered run).

Command:
`bash .github/bubbles/scripts/state-transition-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

The guard emitted `🔴 TRANSITION BLOCKED: 16 failure(s), 1 warning(s)` and the
machine-readable result contract:

```text
🔴 TRANSITION BLOCKED: 16 failure(s), 1 warning(s)

state.json status MUST NOT be set to 'done'.
Fix ALL blocking failures above before attempting promotion.

BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:4e344590db454a0b1b8453b14cb073a4da50df5de9941571b78555cccc2f462f
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G051,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G095,G097,G098,G099,G100]
failedGateIds: [G057,G022,G053,G027,G040,G001,G068,G094]
failedChecks: []
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 16
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
GUARD_EXIT=1
```

Per-gate blocking detail captured from the guard body (each is a real
artifact/state-integrity gap in BUG-001's OWN packet — the guard does NOT run the
shared Feature-012 functional suite and NONE of these failures are the BUG-002
parent reds `SCN-012-003` / registry):

| Gate | Check | Guard message (verbatim substance) | Owner |
|------|-------|------------------------------------|-------|
| **G057** | 3C | `scenario-manifest.json is missing linkedTests entries` | `bubbles.plan` |
| **G068** | 22 | 3 Gherkin scenarios (`SCN-BUG001-001/002/003`) have `no faithful DoD item` | `bubbles.plan` |
| **G094** | 34 | `Capability foundation guard failed` (missing Single-Capability / Single-Implementation justification sections) | `bubbles.plan` / `bubbles.design` |
| **8D** | 8D | Scope is a refactor/repair but `missing the change-boundary DoD item` and `does not enumerate allowed and excluded surfaces` (2 lines) | `bubbles.plan` |
| **G053** | 13B | Report artifacts require a `### Code Diff Evidence` section (git-backed, non-artifact file paths) | report evidence (`bubbles.implement`) |
| **G040** | 18 | Report artifact contains `3 deferral language hit(s)` | report evidence |
| **G001** | 5 | Resolved scope artifacts report 1 Done scope but `certification.completedScopes is EMPTY` | `bubbles.validate` (populated at certification) |
| **G027** | 15 | Phases claim implement/test but `certification.completedScopes is EMPTY — FABRICATION` | `bubbles.validate` (populated at certification) |
| **G022** | 6 | Required phases `validate` and `audit` NOT yet in phase records (2 lines) | `bubbles.validate` (now) + `bubbles.audit` (after validate) |

Warning (non-blocking): Check 11 — `report.md has 46 of 93 evidence blocks that
lack terminal output signals`.

### Validate 2 — Standalone artifact-lint — `EXIT 0 / PASS`

**Claim Source:** executed (this session).

Command:
`bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

```text
✅ Top-level status matches certification.status
✅ report.md contains section matching: ...Summary
✅ report.md contains section matching: ...Completion Statement
✅ report.md contains section matching: ...Test Evidence
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0
```

artifact-lint is a **subset** of the state-transition-guard; its green does NOT
override the guard's `EXIT 1` (the guard adds G057/G068/G053/G094/G040/G027/G001
that artifact-lint does not evaluate).

### Validate 3 — BUG-001's OWN test-plan surface (TP-BUG001-01..06) — ALL GREEN

**Claim Source:** executed (this session, current bytes, HEAD `c3e5a4f1`).

`node --test tests/tool-experience-shell.functional.mjs`:

```text
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d)
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] restore currentScopeHashesEqual=true protectedHashesEqual=true dataOptionsHtmlHashesEqual=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ todo 0
SHELL_FUNCTIONAL_EXIT=0
```

Focused BUG-001 System-Chrome regression
(`npx --no-install playwright test tests/tool-experience.spec.mjs --project=system-chrome --grep 'Regression: BUG-001 options flow shell is ready before heavy hydration begins'`):

```text
Running 1 test using 1 worker
  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (27.8s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true
  1 passed (29.9s)
PW_FOCUSED_EXIT=0
```

`node scripts/selftest.mjs`:

```text
================================================
Research-Lab self-test: 735 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

`bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/tool-experience.spec.mjs tests/tool-experience-shell.functional.mjs`:

```text
✅ Adversarial signal detected in tests/tool-experience.spec.mjs
✅ Adversarial signal detected in tests/tool-experience-shell.functional.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
  Files with adversarial signals: 2
REGQUAL_BUGFIX_EXIT=0
```

### Validate 4 — SCN-012-031 immutable pin + BUG-002 sibling handoff

**Claim Source:** executed (this session).

```text
git cat-file -t 767732db            => commit
git show 767732db:rlviews.js | grep -c data-rlexperience-shell => 0
BUG-002 sibling packet:  specs/012-.../bugs/BUG-002-scope-baseline-head-drift-antipattern/ EXISTS
BUG-002 state:           status=not_started | workflowMode=bugfix-fastlane
```

The SCN-012-031 pin resolves after the operator rebase (immutable full SHA, not
HEAD) and reconstructs the true legacy pre-shell bytes (0 markers). The discovered
systemic parent finding `FEAT012-SCN012-003-HEAD-BASELINE-DECORATOR-DRIFT` is in
`state.json.addressedFindings` with disposition `sibling-spec-handoff → BUG-002`
(materialized, tracked, `not_started`). Sibling-spec handoff is a legitimate
`requireAllDiscoveredBugsClosedInRun` disposition (filed + tracked, not
cherry-picked) — so that constraint IS satisfied. It does NOT, however, unblock
the guard's own-packet artifact gaps above.

### Validate 5 — Working-tree cleanliness (no mutation)

**Claim Source:** executed (this session).

```text
git status --porcelain (relevant):
 M specs/012-.../bugs/BUG-001-.../report.md         <- validate-owned (this append)
 M specs/012-.../bugs/BUG-001-.../state.json        <- validate-owned (routing)
 M tests/tool-experience-shell.functional.mjs        <- prior-phase in-boundary SCN-012-031 fix (NOT touched by validate)
 M specs/012-.../scopes/05-.../report.md              <- operator Scope-05 (NOT touched)
 M specs/012-.../state.json                           <- parent Feature 012 (NOT touched)
?? specs/012-.../bugs/BUG-002-.../                    <- sibling packet (NOT touched)
?? tests/simple-model-adapters-market.spec.mjs        <- operator concurrent (NOT touched)
options-flow-feed-lab.html: (clean/committed — deliverable present in HEAD)
```

### Certification-Scope Determination (the honest crux)

- **BUG-001's own deliverable + test-plan surface is COMPLETE and GREEN.**
  `options-flow-feed-lab.html` is committed/clean; TP-BUG001-01..06 (shell
  functional 3/3, SCN-012-031 green, 23/23 canary green, focused System-Chrome
  regression pass, selftest 735/0, regression-quality --bugfix 0/0) all pass on
  current bytes. The discovered systemic finding is legitimately closed-by-routing
  to sibling BUG-002 (`requireAllDiscoveredBugsClosedInRun` satisfied).
- **BUT the mandated certification gate — the state-transition-guard — exits `1`
  with 16 failures across 8 gates.** research-lab's validation convention is
  `certification-required` with the `delivery-completion-v1` audit profile, which
  makes the guard authoritative and evaluates BUG-001's OWN artifacts
  (scenario-manifest `linkedTests`, scopes DoD-Gherkin fidelity + change-boundary,
  report `### Code Diff Evidence` + deferral language, capability-foundation
  justification) against `targetStatus: done`.
- **This is neither branch the dispatch pre-supposed.** It is NOT a clean
  `CERTIFIED-DONE` (guard does not pass), and it is NOT `BLOCKED-ON-BUG002` (the
  guard does not run the shared functional suite; none of the 16 failures are the
  BUG-002 parent reds). It is **BLOCKED on agent-remediable artifact/state-integrity
  gaps in BUG-001's own packet.**

### Verdict — `BLOCKED-ON-GUARD-ARTIFACT-GAPS` (validate declined to certify)

Per `blockedOnlyWhenValidateBlocked` (validate/guard genuinely blocked, `EXIT 1`)
and the ABSOLUTE COMPLETION HIERARCHY (`done` requires the guard to pass), this
phase does **NOT** force `done`. It does **NOT** invent a BUG-002 reason. It routes
the guard's own-packet remediation to the dominant owner and returns a blocked
verdict.

- `certification.completedScopes` and `certifiedCompletedPhases` remain `[]` — no
  premature certification claimed (respects the pre-audit no-terminal-certification
  contract for `delivery-completion-v1`).
- `execution.currentPhase` stays `validate`; `currentPhaseStatus = blocked`;
  `nextRequiredOwner = bubbles.plan` (owner of G057 / G068 / G094 / 8D change-boundary;
  with report-evidence corrections for G053 / G040). After plan remediation +
  re-validate, the `audit` phase (G022) still runs before any `done`.
- `execution.blockedReason` records the exact, actionable guard verdict.

---

## Validate Phase Evidence (Clean Re-Run)

Second `bubbles.validate` invocation (deep mode), dispatched by top-level
`bubbles.goal` after `bubbles.plan` closed the 6 substantive guard-artifact
gaps. This is the clean certification-bookkeeping re-run. It does **not** force
`done`; top-level `status` and `certification.status` stay `in_progress` (the
`audit` phase and finalize flip them to `done`). Repo binding verified: root
`/home/redacted/research-lab`, Bubbles `7.20.1`, read-only HEAD `f48e1594` (the
operator is committing Feature 012 in parallel). No git commit/push/rebase/reset/
checkout was run; only `report.md` and this bug's `state.json` were written; no
operator Scope-05 file and no BUG-002 packet file were touched.

### Guard BEFORE the write (baseline re-run)

**Claim Source:** executed

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

The only remaining blocks are the certification bookkeeping (Check 5 G001,
Check 15 G027, Check 6 G022 validate+audit). All 6 substantive gates PASS
(G057 Check 3C, Check 8D, G053 Check 13B, G040 Check 18, G068 Check 22 3/3,
G094 Check 34). WARN Check 11 is non-blocking.

```text
--- Check 5: Scope Status Cross-Reference ---
🔴 BLOCK: Resolved scope artifacts report 1 Done scope(s) but state.json completedScopes is EMPTY — state.json integrity failure
--- Check 6: Specialist Phase Completion ---
🔴 BLOCK: Required phase 'validate' NOT in execution/certification phase records (Gate G022 violation)
🔴 BLOCK: Required phase 'audit' NOT in execution/certification phase records (Gate G022 violation)
🔴 BLOCK: 2 specialist phase(s) missing — work was NOT executed through the full pipeline
--- Check 15: Phase-Scope Coherence (Gate G027) ---
🔴 BLOCK: Execution/certification phases claim implement/test phases but completedScopes is EMPTY — FABRICATION (Gate G027)
⚠️  WARN: report.md has 52 of 103 evidence blocks that lack terminal output signals (potentially fabricated)
🔴 TRANSITION BLOCKED: 5 failure(s), 1 warning(s)
failedGateIds: [G022,G027]
failureCount: 5
exitStatus: 1
verdict: FAIL
GUARD_EXIT=1
```

### Own-surface re-confirmation (GREEN on current bytes)

Anti-fabrication guard against certifying a stale/regressed surface — the
BUG-001 test-plan surface was re-executed on current bytes.

#### Functional shell suite

**Claim Source:** executed

**Command:** `node --test tests/tool-experience-shell.functional.mjs`

```text
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (23748.019259ms)
[shell-boundary] viewChanges=4 fetches=0 providerStatus=preserved ownerRead=preserved
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (659.83377ms)
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract
[scope02-rollback] protectedDigest=9787278192dfe6660d4b1da91b99b2ec261fe7fba888fb000fc7a64bf54b6ccf byteEqual=true
[scope02-rollback] restore currentScopeHashesEqual=true protectedHashesEqual=true dataOptionsHtmlHashesEqual=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2370.200662ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ duration_ms 27286.301462
FUNCTIONAL_EXIT=0
```

#### Broad selftest

**Claim Source:** executed

**Command:** `node scripts/selftest.mjs`

```text
================================================
Research-Lab self-test: 799 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

The count rose from the prior note's 735 to 799 because the operator's parallel
Feature-012 commits added tests; 0 failed confirms no regression.

#### Focused System-Chrome BUG-001 regression

**Claim Source:** executed

**Command:** `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list`

```text
Running 1 test using 1 worker

  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (21.1s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true

  1 passed (22.6s)
PLAYWRIGHT_EXIT=0
```

### Certification bookkeeping applied (`delivery-completion-v1` validate phase)

**Claim Source:** executed

Exact `state.json` mutations (validate-owned certification fields + execution
pointers). Top-level `status` and `certification.status` intentionally left at
`in_progress`.

```text
certification.completedScopes            = ["SCOPE-01"]
certification.certifiedCompletedPhases   = ["implement","test","regression","simplify","gaps","harden","stabilize","devops","security","validate"]
certification.scopeProgress[0].status    = "Done"  (certifiedAt=2026-07-24T21:15:00Z)
certification.status                     = "in_progress"  (UNCHANGED)
status (top-level)                       = "in_progress"  (UNCHANGED)
execution.completedPhaseClaims           = [...,"security","validate"]  (validate appended)
execution.activeAgent                    = "bubbles.validate"
execution.currentPhase                   = "audit"
execution.currentPhaseStatus             = "pending"
execution.nextRequiredOwner              = "bubbles.audit"
execution.blockedReason                  = null  (prior plan note archived under priorPlanRemediationNoteArchivedByValidate)
executionHistory                         = 23 -> 24 entries (bubbles.validate/validate, outcome=completed_owned, verdict=CERTIFICATION-BOOKKEEPING-APPLIED)
```

### Guard AFTER the write (post-write re-run)

**Claim Source:** executed

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

G001 (Check 5) and G027 (Check 15) are CLEARED; the `validate` phase (Check 6)
is now recorded; the ONLY remaining block is the `audit`-phase half of G022,
which clears when `bubbles.audit` records its phase. Failure count dropped 5 → 2;
`failedGateIds` went `[G022,G027]` → `[G022]`. Top==cert parity preserved.

```text
--- Check 5: Scope Status Cross-Reference ---
✅ PASS: completedScopes count matches artifact Done scope count (1)
--- Check 6: Specialist Phase Completion ---
✅ PASS: Required phase 'validate' recorded in execution/certification phase records
🔴 BLOCK: Required phase 'audit' NOT in execution/certification phase records (Gate G022 violation)
🔴 BLOCK: 1 specialist phase(s) missing — work was NOT executed through the full pipeline
--- Check 15: Phase-Scope Coherence (Gate G027) ---
✅ PASS: completedScopes (1) matches artifact Done scopes (1)
✅ PASS: Phase-Scope coherence verified: implementation phases align with completed scopes
⚠️  WARN: report.md has 52 of 103 evidence blocks that lack terminal output signals (potentially fabricated)
🔴 TRANSITION BLOCKED: 2 failure(s), 1 warning(s)
failedGateIds: [G022]
failureCount: 2
exitStatus: 1
verdict: FAIL
GUARD2_EXIT=1
```

### Disposition

The clean certification-bookkeeping write is applied and independently
re-verified by the guard. G001 and G027 are resolved; the `validate` phase is
recorded with provenance; the sole residual is the `audit`-phase G022, which is
the expected next owner (`bubbles.audit`). Correctly, the guard still exits 1 —
`done` is reached only after `audit` records its phase and finalize flips the
status. No substantive gate regressed and no new blocking failure appeared. The
non-blocking WARN Check 11 (52/103) is the accumulated RESULT-ENVELOPE/diff
blocks, noted for `bubbles.audit`.

## Audit Phase Evidence

**Phase:** audit

**Agent:** bubbles.audit (final independent gate, dispatched by top-level bubbles.goal)

**Completed At:** `2026-07-24T21:33:00Z`

**Claim Source:** executed (this session, current bytes, read-only HEAD `c1239fa5`; operator committing Feature 012 in parallel)

Adversarial, evidence-integrity-focused audit. Earlier phases in this run filed
false-green evidence (regression 06:24 + harden 07:05 claimed the shell
functional suite GREEN while SCN-012-031 was actually RED against the moving
HEAD baseline) that the orchestrator caught and corrected. This gate therefore
INDEPENDENTLY re-executed BUG-001's own surface rather than trusting prior
claims.

### Audit 1 — Guard verbatim BEFORE recording the audit phase (only G022 audit remains)

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation`

**Exit Code:** 1 (expected — audit phase not yet recorded)

```text
--- Check 6: Specialist Phase Completion ---
✅ PASS: Required phase 'implement' recorded in execution/certification phase records
✅ PASS: Required phase 'test' recorded in execution/certification phase records
✅ PASS: Required phase 'regression' recorded in execution/certification phase records
✅ PASS: Required phase 'simplify' recorded in execution/certification phase records
✅ PASS: Required phase 'stabilize' recorded in execution/certification phase records
✅ PASS: Required phase 'security' recorded in execution/certification phase records
✅ PASS: Required phase 'validate' recorded in execution/certification phase records
🔴 BLOCK: Required phase 'audit' NOT in execution/certification phase records (Gate G022 violation)
⚠️  WARN: report.md has 53 of 109 evidence blocks that lack terminal output signals (potentially fabricated)
BEGIN TRANSITION_GUARD_RESULT_V1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:1da421edf40423e5e40a07e22098c6f9b8b82ca598675c390f0dcb39215463a3
failedGateIds: [G022]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 2
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

**Result:** CONFIRMED — the ONLY blocking gate is `G022(audit)` (`failedGateIds: [G022]`);
every substantive gate (G057, G068, G094, G053, G040, G001, G027, Check-8D) already
passes. The 2 failures are the twin audit-phase BLOCK lines of the single G022 finding;
the 1 warning is Check 11 (evidence-block terminal-signal heuristic), audited below.

### Audit 2 — Independent own-surface re-verification (NOT trusting prior claims)

**Command:** `node --test tests/tool-experience-shell.functional.mjs`

**Exit Code:** 0

```text
[shell-canary] tool=options-flow-feed-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (15256.318575ms)
✔ SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries (654.177109ms)
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2136.266591ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ todo 0
SHELL_FUNCTIONAL_EXIT=0
```

**Command:** `npx --no-install playwright test tests/tool-experience.spec.mjs --project=system-chrome --grep 'Regression: BUG-001 options flow shell is ready before heavy hydration begins'`

**Exit Code:** 0

```text
Running 1 test using 1 worker
  ✓  1 …UG-001 options flow shell is ready before heavy hydration begins (17.4s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true
  1 passed (18.7s)
PLAYWRIGHT_BUG001_EXIT=0
```

**Command:** `node scripts/selftest.mjs`

**Exit Code:** 0

```text
================================================
Research-Lab self-test: 799 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

**Result:** GREEN, independently reproduced on current bytes. Shell functional
suite `tests 3 / pass 3 / fail 0 / skipped 0`; SCN-012-031 `currentShellCount=0`,
`baselineAuthority=git:767732db`, `byteEqual=true`; the 23/23 SCN-012-028/029 canary
with `options-flow-feed-lab` ready; the focused System-Chrome BUG-001 regression
`1 passed` with `shellReadyAtStart=true cacheFirstOwnerPainted=true`; the broad
build-free selftest `799 passed, 0 failed` (count rose 735→799 from the operator's
parallel Feature-012 commits; still 0 failed = no regression). The prior false-green
regression/harden claims are corrected by this reproduced evidence.

### Audit 3 — Evidence-integrity audit (Check 11: 53/109 non-terminal blocks)

Independently categorized all 109 report evidence blocks: 91 ```text``` + 3 ```diff``` +
~15 bare fences. The 53 blocks Check 11 flags as lacking terminal-output signals are
LEGITIMATE non-transcript blocks — RESULT-ENVELOPE envelopes, `BUG001_CHANGED_PATH_GROUPS`
ownership classifications, `BUG001_POST_ROLLBACK_HASH` sha256 provenance, the 3 real
git-backed ```diff``` code-diff blocks (G053), and 7 `Claim Source: interpreted` framing
blocks — NOT fabricated test transcripts.

```text
claim-source distribution:  71 executed / 7 interpreted
real terminal-signal lines:  75 node --test summaries + 17 playwright "N passed" + 43 Exit Code + 31 selftest summaries
DoD-backing test blocks audited: TP-BUG001-01 (ℹ tests 3/pass 3/fail 0), TP-BUG001-02 (1 passed, playwright-exit=0),
  TP-BUG001-03 (5 passed), TP-BUG001-05 (712 passed/0 failed), TP-BUG001-06 (regression-quality-guard 0v/0w) — ALL real terminal output
G053 code-diff corroborated: options-flow-feed-lab.html lines 631-650 carry the committed deltaHydrationStarted/
  startDeltaAfterShellReady guard (matches git show c81d808d); tests/tool-experience-shell.functional.mjs working-tree
  repin (35 ins/2 del) pins LEGACY_BASELINE_COMMIT=767732db with MODERN_SHELL_MARKER + sha256 guards
```

**Result:** NO FABRICATION. Every DoD-backing test-evidence block contains real
terminal output (node --test `tests N/pass N/fail N`, playwright `N passed`, `Exit Code`,
selftest `N passed, N failed`). Each `interpreted` block carries an explicit
`**Interpretation:**` line over a real underlying transcript/provenance payload and was
individually reviewed; the TP-BUG001-02 interpreted focused-regression block is
corroborated byte-for-byte by this gate's own independent re-run. No DoD item is backed
by a summary-only or fabricated block.

### Audit 4 — BUG-002 sibling-spec-handoff disposition legitimacy

```text
BUG-002 packet materialized: bug.md, design.md, report.md, scopes.md, spec.md, state.json, uservalidation.md
BUG-002 state: status=not_started workflowMode=bugfix-fastlane (tracked, first-class)
immutable pin still resolves post-operator-rebase: git cat-file -t 767732db => commit; git cat-file -e <full-sha> exit 0 (NOT orphaned)
guard Check 35 (Gate G095 Discovered-Issue Disposition): PASS — no unfiled discovered-issue carryover
```

**Result:** LEGITIMATE disposition. The systemic `git show HEAD:` moving-baseline
anti-pattern (instances SCN-012-003 in contextual-tooltip.functional.mjs, SCN-012-033 in
tool-experience.spec.mjs) genuinely belongs to PARENT Feature 012, not BUG-001 — BUG-001's
fix never touches market-heatmap-lab.html / contextual-tooltip.functional.mjs / rlcontext.js
/ rlexperience.js. SCN-012-003's correct pre-decorator baseline commit is owner-design-gated
and was correctly NOT guessed. The finding is FILED as a materialized, tracked sibling
packet (BUG-002), so `requireAllDiscoveredBugsClosedInRun` is satisfied (G095 PASS) — the
discovered issue is filed and tracked in its own sibling packet, never silently dropped.

### Audit Verdict

`CERTIFIED-DONE` (auditProfile delivery-completion-v1). All four audit dimensions clean:
guard blocks only on G022(audit); own surface independently GREEN; evidence integrity
sound (no fabrication); BUG-002 disposition legitimate. Recording the audit phase and, on
a clean guard re-run, performing the terminal certification flip below.

### Audit — Terminal Certification Flip BLOCKED by G088 (flip reverted; truthful outcome)

**Phase:** audit (finalize step)

**Claim Source:** executed (this session)

The four audit dimensions above are clean, and the guard exited 0 at `status=in_progress`
with the audit phase recorded (TRANSITION PERMITTED). I performed the terminal flip to
`done`, then re-ran the guard ONE more time at `status=done` as mandated — and it did NOT
hold: a done-conditional gate that is vacuous at `in_progress` activated at `done`.

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh <spec-dir>` (at status=done)

**Exit Code:** 1

```text
--- Check 30: Post-Certification Spec Edit Detection (Gate G088) ---
🔴 BLOCK: Post-certification spec edit guard failed — Gate G088.
BEGIN TRANSITION_GUARD_RESULT_V1
targetStatus: done
passedGateIds: [G053,G040,G051,G068,...,G095,G097,G098,G099,G100]
failedGateIds: [G088]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 2
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

**G088 diagnostic** (`bash .github/bubbles/scripts/post-cert-spec-edit-guard.sh <spec-dir>`, exit 1):

```text
G088 post_certification_spec_edit_gate violation: certified planning truth changed after certifiedAt
  spec: specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation
  status: done
  certifiedAt: 2026-07-24T21:44:53Z
  trackedFiles: 3
  postCertEdits: 2
  remediation: demote status out of done, set requiresRevalidation:true, or complete a current bubbles.spec-review recertification and update certifiedAt after the edit
  commits/files:
    - commit=WORKTREE date=uncommitted file=.../scopes.md subject=uncommitted planning truth edit
    - commit=WORKTREE date=uncommitted file=.../spec.md subject=uncommitted planning truth edit
```

**Root cause (git state proof):** the child planning artifacts `spec.md` and `scopes.md`
are TRACKED (`git ls-files` lists spec.md/scopes.md/design.md) but carry UNCOMMITTED
worktree modifications (` M` in `git status --porcelain`; `git diff --name-only` shows both;
nothing staged). Those uncommitted deltas are the earlier plan-remediation edits
(G057/G068/G094/Check-8D closures) that made the substantive gates pass. G088 correctly
refuses to certify `done` while a spec's own planning truth floats uncommitted in the
worktree. The operator is committing Feature 012 in parallel; the base child packet is
committed but the plan-remediation delta is not yet.

**Why I did NOT force `done`:** the only guard-provided PASS-with-worktree-edits path is
`requiresRevalidation:true`, which semantically marks the spec "done but pending
revalidation" — setting it merely to satisfy G088 while claiming a clean `done` would be
gate-gaming, the exact false-green this adversarial audit exists to catch. Reverting the
plan-remediation edits is not an option (it would re-break G057/G068/G094/Check-8D).
Committing `spec.md`/`scopes.md` is operator-owned (autoCommit=off) and the run forbids me
from any `git commit/push/rebase/reset/checkout`. So terminal `done` is genuinely BLOCKED
on an operator commit I cannot perform.

**Action taken:** reverted the terminal flip — top-level `status` and
`certification.status` restored to `in_progress` (parity preserved), `completedAt`/
`certifiedAt` cleared to null at both levels; the `audit` phase remains recorded (the audit
gate itself is complete and clean); `execution.currentPhase=finalize`,
`currentPhaseStatus=blocked`, `nextRequiredOwner=bubbles.goal`, and a truthful
`blockedReason` set. No product/test byte, no operator Scope-05 file, no BUG-002 packet
file, and no git commit/push/rebase/reset/checkout.

**Audit verdict (corrected):** `BLOCKED-G088-UNCOMMITTED-PLANNING-TRUTH`. The BUG-001
deliverable and evidence are clean and independently GREEN; the terminal certification is
blocked solely by G088 over the uncommitted `spec.md`/`scopes.md` deltas. Unblock: the
operator commits the BUG-001 child packet planning artifacts (so `git diff` is clean for
them), then re-dispatch the audit finalize step — the guard will then hold at `done` (exit
0) and the flip will stick.

---

## Finalize Phase Evidence

**Phase:** finalize · **Owner:** bubbles.audit (attempt `AUDIT-BUG001-002`, dispatched by top-level `bubbles.goal`) · **Timestamp:** 2026-07-24T22:14Z

**Corrected premise (truthful).** The finalize dispatch named Check 40 / G072
(Claim-Source provenance) as "the one remaining blocking gate." The live guard
contradicts that premise: this repo has NO `claimSourceProvenanceGuard: block`
in `.github/bubbles-project.yaml`, so **G072 is advisory (exit 0)** and the
state-transition-guard **already held exit 0 at `in_progress`** before any edit.
The gate that actually blocks a legitimate `done` is **G088** (Check 30,
Post-Certification Spec Edit Detection) — matching the persisted `blockedReason`,
the prior attempt `AUDIT-BUG001-001` (`finalAtDone: 1`), and
`certification.assurance.missingForFull`.

### Finalize 1 — G072 provenance placement addressed (truthful, non-blocking)

Co-located `**Claim Source:** executed` tags were added to the 3
`### Independent Final Gates` sub-blocks named by the dispatch — **Artifact
Lint**, **Traceability Guard**, **Node Source Lock** — placed between each
`**Command:**` and its `**Exit Code:** 0` (inside the lint's `[i-3, i+4]`
window). No command, exit code, or transcript byte was altered; no other
evidence block was touched (line 1410 Diagnostics-And-Whitespace and the 12
other advisory findings were left as-is, per the dispatch's "only the 3 named
blocks" scope). Result: G072 advisory findings dropped 16 → 13; the check still
PASSES (advisory, exit 0).

**Claim Source:** executed

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh <specDir>  # Check 40 after G072 fix`

**Exit Code:** 0

```text
--- Check 40: Claim-Source provenance (G072) ---
[claim-source-lint][ERROR] report.md:1410 execution-evidence block (Exit Code) missing **Claim Source:** tag
... (12 more advisory findings at 1945/1976/2017/2039/2866/2877/2938/4287/4323/4342/4354/4437) ...
[claim-source-lint] 13 Claim-Source provenance finding(s) — advisory only (exit 0). Set claimSourceProvenanceGuard: block in .github/bubbles-project.yaml to enforce.
✅ PASS: Claim-Source provenance: execution-evidence blocks carry a valid tag (or advisory)
```

### Finalize 2 — Empirical done-transition test (guard-exit ladder)

Per the finalize step-5 procedure, a **controlled parity-correct flip** to
`status=done` (top-level + certification `status`/`completedAt`/`certifiedAt`
only) was applied, the full guard re-run at `status=done`, then the flip
**immediately reverted** to `in_progress`.

| Step | state.status | Guard exit | Verdict |
|------|--------------|-----------|---------|
| Pre-fix | in_progress | 0 | PASS (G072 advisory, 16 findings) |
| Post-G072-fix | in_progress | 0 | PASS (G072 advisory, 13 findings) |
| **At status=done (flip)** | **done** | **1** | **FAIL — failedGateIds [G088]** |
| After revert | in_progress | 0 | PASS |

**Claim Source:** executed

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh <specDir>  # at status=done`

**Exit Code:** 1

```text
--- Check 3: Status Ceiling Enforcement ---
✅ PASS: Workflow mode 'bubfix-fastlane' permits current status 'done' (ceiling: done)
--- Check 21: Spec Review Enforcement (specReview policy) ---
✅ PASS: Mode 'bugfix-fastlane' does not require mandatory spec-review phase
--- Check 30: Post-Certification Spec Edit Detection (Gate G088) ---
🔴 BLOCK: Post-certification spec edit guard failed — Gate G088. Run 'bash .../post-cert-spec-edit-guard.sh <specDir>' for full diagnostic
ℹ️  INFO: Tracked files: spec.md, design.md, scopes.md, scopes/_index.md, scopes/*/scope.md
ℹ️  INFO: Remediation: demote status, set requiresRevalidation:true, or complete bubbles.spec-review recertification and update certifiedAt after the edit
--- Check 32: Strict Terminal Status Enforcement (Gate G092) ---
✅ PASS: Terminal certification statuses are strict (Gate G092)

🔴 TRANSITION BLOCKED: 2 failure(s), 1 warning(s)
state.json status MUST NOT be set to 'done'.
BEGIN TRANSITION_GUARD_RESULT_V1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
passedGateIds: [G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G089,G092,G090,G094,G095,G097,G098,G099,G100]
failedGateIds: [G088]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 2
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

(Note: the `Check 3` transcript line above is reproduced verbatim from the
guard's own output, which contained a typo `bubfix-fastlane`; the mode is
`bugfix-fastlane`.)

### Finalize 3 — Flip reverted; clean in_progress restored

**Claim Source:** executed

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh <specDir>  # after revert`

**Exit Code:** 0

```text
🟡 TRANSITION PERMITTED with 1 warning(s)
state.json status may be set to 'done'.
BEGIN TRANSITION_GUARD_RESULT_V1
targetStatus: done
failedGateIds: []
blockingCode: none
failureCount: 0
exitStatus: 0
verdict: PASS
END TRANSITION_GUARD_RESULT_V1
```

Top-level `status` and `certification.status` were restored to `in_progress`;
`completedAt`/`certifiedAt` cleared to `null` at both levels; the `audit` phase
remains recorded (audit gate itself complete and clean);
`execution.currentPhase=finalize`, `currentPhaseStatus=blocked`,
`nextRequiredOwner=bubbles.goal`, and a refreshed truthful `blockedReason` set.
The additive `execution.audit` attempt `AUDIT-BUG001-002` records the
guard-exit ladder (`preFix:0, postG072Fix:0, finalAtDone:1, afterRevert:0`) and
marks `AUDIT-BUG001-001` `SUPERSEDED`.

### G088 mechanism (why an operator commit is the only clean-PASS path)

`post-cert-spec-edit-guard.sh` exits 0 trivially while `status != done`. Once
`status == done` it collects `git diff --name-only` **and** `git diff --cached
--name-only` for the planning-truth files (`spec.md`, `design.md`, `scopes.md`,
`scopes/_index.md`, `scopes/*/scope.md`) and treats every uncommitted/staged
entry as a `commit=WORKTREE` post-cert violation. `spec.md` and `scopes.md`
currently show ` M` in `git status --porcelain` (the operator's plan-remediation
deltas), so G088 fails at `done`. The only clean-PASS path is an **operator
commit** of those two files (so `git diff` is clean); `requiresRevalidation:true`
would gate-game G088 and is **refused**; agent
`git commit/push/rebase/reset/checkout` is **forbidden** this run.

### Finalize verdict

`BLOCKED-G088-UNCOMMITTED-PLANNING-TRUTH`. The named G072 provenance finding is
resolved and the BUG-001 deliverable + evidence are independently GREEN, but the
terminal `done` certification cannot be truthfully performed while `spec.md` /
`scopes.md` remain uncommitted. **No git mutation** occurred (no
commit/push/rebase/reset/checkout); **no operator Scope-05 file and no BUG-002
packet file were touched**; only `report.md` (the 3 G072 tags + this section) and
`state.json` (test-flip revert + finalize records) were written. **Unblock:** the
operator commits the BUG-001 child packet `spec.md` + `scopes.md` (so `git diff`
is clean for them), then re-dispatch the audit finalize step — the guard then
holds at `done` (exit 0) and the flip sticks.

---

<!-- bubbles:certifying-window-begin -->

## Recertification (2026-07-25) — bubbles.audit

**Phase:** recertification (audit) · **Owner:** `bubbles.audit` (attempt
`AUDIT-BUG001-003`, dispatched by top-level `bubbles.goal`) · **Timestamp:**
`2026-07-25T15:05Z` · **Repo binding:** root `/home/redacted/research-lab`,
Bubbles `7.20.1`, slug `research-lab` · **Read-only HEAD:** `08e6c70b` (the
operator committed Feature 012 Scope 05 themselves; **no git
commit/push/rebase/reset/checkout** performed by this phase; only `report.md`
and this bug's `state.json` were written).

**Why this section exists (truthful root cause).** The BUG-001 deliverable is
complete and independently verified (the fix is committed; the own-surface is
GREEN). On an honest re-run the mechanical `state-transition-guard.sh` exited
`1` with exactly two residuals — both paperwork/ordering, **NOT** product or
evidence defects:

1. **Artifact-lint (Check 13).** The `done`-gated `artifact-lint.sh` requires
   the canonical h3 sections `### Validation Evidence` and `### Audit Evidence`;
   the real validate/audit evidence was recorded above under the non-canonical
   h2 headers `## Validate Phase Evidence` / `## Audit Phase Evidence`. These
   `done`-gated checks are vacuous while `status=in_progress` (why they passed
   during the validate/finalize runs) and activate only at `status=done`. This
   recertification promotes the real evidence into the two canonical sections
   below.
2. **G088 (Check 30).** Top-level `certifiedAt` was `2026-07-24T22:30:00Z`,
   which PREDATES the operator's planning-truth commit `779486c9` (`spec.md` +
   `scopes.md`) at `2026-07-24T22:33:28Z`. The operator DID commit the planning
   truth; only the certification-timestamp ordering was wrong. This
   recertification sets `certifiedAt` to the genuine recertification time
   (after that commit), and the BUG-001 `spec.md`/`design.md`/`scopes.md` are
   clean in the worktree.

**Certifying-window marker (the honest, sanctioned structural correction).** The
`certifying-window-begin` marker directly above opens the
current certifying window. Every code block ABOVE it is prior-window history
from the original 2026-07-24 delivery / validate / audit / finalize phases —
independently characterized by `### Audit 3 — Evidence-integrity audit` above as
legitimate non-transcript blocks (RESULT-ENVELOPE envelopes, code-diff blocks,
sha256 hash-provenance, ownership classifications, `interpreted`-framing), NOT
fabricated transcripts. Those historical blocks are left **byte-for-byte
unchanged**; the append-only audit rule forbids retroactively rewriting them,
and the single marker is the framework-sanctioned exemption for prior-window
history (see `artifact-lint.sh` §"Certifying-window boundary marker"). Every
code block BELOW the marker is fresh current-window evidence executed this
session and is held to the full done-strict terminal-signal contract. **No
terminal signal was fabricated into any structured block; nothing above the
marker was altered.**

### Validation Evidence

**Agent:** `bubbles.validate` evidence, re-confirmed by this `bubbles.audit`
recertification. **Claim Source:** executed (this session, current bytes, HEAD
`08e6c70b`). **Executed:** YES.

The BUG-001 own-surface test-plan proof was re-executed on the operator's
current HEAD to prove no regression since the original certification. The
canonical detailed validate transcripts remain above under `## Validate Phase
Evidence` and `## Validate Phase Evidence (Clean Re-Run)` (certification
bookkeeping: `certification.completedScopes=[SCOPE-01]`, validate phase
recorded); this section carries the fresh re-verification.

Broad build-free selftest (`node scripts/selftest.mjs`):

```text
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 805 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

BUG-001 functional shell suite — SCN-012-028/029 (23/23 canary incl.
`options-flow-feed-lab`) + SCN-012-031 immutable-baseline rollback
(`node --test tests/tool-experience-shell.functional.mjs`):

```text
$ node --test tests/tool-experience-shell.functional.mjs
[shell-canary] tool=options-flow-feed-lab views=Simple|Power|Brief|Journey panels=4 legacySuppressed=true statusControls=1
✔ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift (30499.737094ms)
[scope02-rollback] baselineAuthority=git:767732db(pre-Scope-02,parent-of-c81d808d) sharedFiles=rlviews.js,rlapp.js
[scope02-rollback] legacyControls simpleVisible=true powerVisible=true currentShellCount=0
[scope02-rollback] restore currentScopeHashesEqual=true protectedHashesEqual=true dataOptionsHtmlHashesEqual=true
✔ SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes (2580.445135ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
SHELL_FUNCTIONAL_EXIT=0
```

**Validate disposition (recertification):** the own-surface is GREEN on the
operator's current bytes (selftest `805 passed / 0 failed`; functional shell
suite `tests 3 / pass 3 / fail 0 / skipped 0`; SCN-012-031 `currentShellCount=0`,
`baselineAuthority=git:767732db`). The selftest count rose `799 → 805` from the
operator's Scope-05 commits with `0 failed`, i.e. no regression. No product or
test byte was altered by this recertification.

### Audit Evidence

**Agent:** `bubbles.audit` (recertification, attempt `AUDIT-BUG001-003`,
`delivery-completion-v1`). **Claim Source:** executed (this session).
**Executed:** YES.

Independent, adversarial recertification of the two guard residuals. The full
original four-dimension audit remains above under `## Audit Phase Evidence`
(Audit 1–4) and `## Finalize Phase Evidence`; this section records the
recertification disposition.

**Own-surface re-verification.** Independently reproduced GREEN this session —
see the `### Validation Evidence` selftest (`805 passed / 0 failed`) and
functional shell suite (`tests 3 / pass 3 / fail 0`) blocks directly above,
executed on current HEAD `08e6c70b`. No regression since the original
certification.

**Evidence-integrity re-confirmation (no fabrication).** `### Audit 3 —
Evidence-integrity audit` above independently categorized the Check-11
signal-lacking blocks as legitimate non-transcript blocks — RESULT-ENVELOPE
envelopes, `BUG001_CHANGED_PATH_GROUPS` ownership classifications,
`BUG001_POST_ROLLBACK_HASH` sha256 provenance, the 3 git-backed `diff` code-diff
blocks (G053), and `Claim Source: interpreted` framing blocks — NOT fabricated
test transcripts, and confirmed every DoD-backing test block carries real
terminal output. The current count is `57/120` (grown from `53/109` as the
validate / audit / finalize phases appended more RESULT-ENVELOPE blocks). This
recertification fabricates **NO** terminal signals into any of those structured
blocks; it leaves them byte-for-byte unchanged and exempts them as prior-window
history via the single `certifying-window-begin` marker (the
sanctioned structural correction for legitimately-structured historical
evidence — never a signal fake).

**G088 resolution (truthful).** The operator committed the BUG-001 planning
truth in `779486c9` (`2026-07-24T22:33:28Z`); the BUG-001
`spec.md`/`design.md`/`scopes.md` are clean in the worktree (`git status
--short` shows only `report.md` + `state.json` from this recertification, plus a
pre-existing `scenario-manifest.json` modification from a prior session that
this phase did **NOT** touch). `certifiedAt` is set to the genuine
recertification time `2026-07-25T15:05:00Z`, which is AFTER `779486c9`, so
`post-cert-spec-edit-guard.sh` finds no planning commit and no planning-file
worktree edit newer than certification. `requiresRevalidation:true` was **NOT**
used — that would gate-game G088; this is a genuine recertification to a clean
guard.

**Audit verdict (recertification):** `RECERTIFIED-DONE`. Deliverable
independently GREEN; evidence integrity sound (no fabrication); the two guard
residuals resolved truthfully (canonical sections promoted from the real
evidence above; `certifiedAt` re-ordered after the committed planning truth).
The post-recertification `state-transition-guard.sh` verdict is recorded in
`### Recertification Guard Verdict` below.

### Recertification Guard Verdict

**Claim Source:** executed (this session, after the recertification edits above).
**Executed:** YES. **Command:**
`bash .github/bubbles/scripts/state-transition-guard.sh <spec-dir>`. **Exit
Code:** 0.

Both previously-failing checks now PASS and the overall verdict is `PASS`
(`exitStatus: 0`, `failedGateIds: []`, `failureCount: 0`, `blockingCode: none`);
`G088` moved into `passedGateIds`:

```text
$ bash .github/bubbles/scripts/state-transition-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-001-options-flow-shell-startup-starvation
--- Check 13: Artifact Lint ---
✅ PASS: Artifact lint passes (exit 0)
--- Check 30: Post-Certification Spec Edit Detection (Gate G088) ---
✅ PASS: Post-certification planning truth is aligned with certification state (Gate G088)
🟡 TRANSITION PERMITTED with 1 warning(s)
state.json status may be set to 'done'.
BEGIN TRANSITION_GUARD_RESULT_V1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
failedGateIds: []
failedChecks: []
blockingCode: none
failureCount: 0
exitStatus: 0
verdict: PASS
END TRANSITION_GUARD_RESULT_V1
GUARD_EXIT=0
```

The sole remaining warning is the non-blocking Check 11 evidence-block heuristic
(`57/120`) — the legitimate prior-window RESULT-ENVELOPE / code-diff /
hash-provenance / interpreted-framing structured content characterized above,
which the transition guard treats as a warning (not a block) and which the
single certifying-window marker exempts. Check 40 (Claim-Source provenance,
G072) is advisory-only (exit 0) in this repo (16 pre-existing findings on
historical blocks at lines ≤4600; none introduced by this recertification).
holds at `done` (exit 0) and the flip sticks.