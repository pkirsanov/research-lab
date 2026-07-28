# Report: BUG-003 Reconcile TP-10-02 To The Ratified Shell Brief-View Contract

## Summary

The Feature 012 owner ruled that the shared experience shell is **correct as authored**:
the per-tool brief lives in the shell's `brief` view, and TP-10-02 was the single
un-reconciled member of the Feature 002 Scope 10 brief family. This packet records that
decision with its four evidence points ([design.md](design.md) § The Decision) and
reconciles `tests/distributed-briefs.static.integration.mjs` to the same `mountReady`
sequencing its 13 siblings already use.

The change is **13 insertions, 0 deletions**, confined to one test file. No product,
shell, config, page or sibling-test file was modified. Assertion count is unchanged
(15 → 15); no assertion was deleted, weakened, relaxed from `visible` to `attached`, or
skipped, and no existing timeout was extended.

## Completion Statement

SCOPE-01 is complete. TP-10-02 passes (exit 0), the 13 sibling regressions pass
(exit 0), `scripts/selftest.mjs` reports `952 passed, 0 failed` (exit 0), and
`tests/simple-production-bridge.integration.mjs` reports 6/6 with `wired (19)`
(exit 0). Every DoD item in [scopes.md](scopes.md) carries inline raw execution
evidence. No work is deferred, excluded or carried forward.

---

## Test Evidence

### Independent Reproduction (pre-fix RED)

Reproduced in isolation on HEAD `1aa9746634732060e492ea7dc332ac7d8687bef0`. No stack,
server or fixture setup is required — the test provisions its own ephemeral fixture
graph and HTTP server.

```text
$ timeout 300 node --test tests/distributed-briefs.static.integration.mjs
✖ static loader verifies coherent current objects and fetches history only after selection (16117.402095ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 16256.234301

✖ failing tests:

test at tests/distributed-briefs.static.integration.mjs:13:1
✖ static loader verifies coherent current objects and fetches history only after selection (16117.402095ms)
  page.waitForSelector: Timeout 15000ms exceeded.
  Call log:
    - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible
      32 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>

      at TestContext.<anonymous> (/home/redacted/research-lab/tests/distributed-briefs.static.integration.mjs:27:20) {
    name: 'TimeoutError',
    log: [ `  - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible`, '    32 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>' ]
  }
RED_EXIT=1
```

The mount resolves 32 consecutive times as `data-rlbrief-ready="1"`,
`data-rlbrief-state="ready"`, `data-rlexperience-state="registered"` — fully settled and
merely `hidden`. This is Evidence Point 4: the brief is already loaded, so the Brief view
reveals it with no refetch.

### Causal RED Re-Proof

To prove the RED is attributable to the reconciliation and not to environment, the fix
was stashed with a path-scoped stash (leaving every other working-tree file untouched),
re-run, and restored.

```text
### STEP A: stash ONLY the TP-10-02 fix (restore pre-fix bytes)
$ git stash push -- tests/distributed-briefs.static.integration.mjs
Saved working directory and index state WIP on main: 1aa97466 docs(012): reconcile stale scope statuses and record 19-wired Scope 15 state
stash_exit=0
### confirm working tree == HEAD for this file
$ git --no-pager diff --numstat -- tests/distributed-briefs.static.integration.mjs
(empty numstat above == pre-fix bytes restored)

### STEP B: RED re-run
$ timeout 300 node --test tests/distributed-briefs.static.integration.mjs
TAP version 13
# Subtest: static loader verifies coherent current objects and fetches history only after selection
not ok 1 - static loader verifies coherent current objects and fetches history only after selection
  ---
  duration_ms: 16118.746541
  type: 'test'
  location: '/home/redacted/research-lab/tests/distributed-briefs.static.integration.mjs:13:1'
  failureType: 'testCodeFailure'
  error: |-
    page.waitForSelector: Timeout 15000ms exceeded.
    Call log:
      - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible
        32 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>

  code: 'ERR_TEST_FAILURE'
  name: 'TimeoutError'
  stack: |-
    TestContext.<anonymous> (/home/redacted/research-lab/tests/distributed-briefs.static.integration.mjs:27:20)
  ...
1..1
RED_EXIT=1

### STEP C: restore the fix
$ git stash pop
Dropped refs/stash@{0} (c87de22eeb57fccceb912edd59680848d3993b46)
pop_exit=0
$ git --no-pager diff --numstat -- tests/distributed-briefs.static.integration.mjs
13      0       tests/distributed-briefs.static.integration.mjs
```

### The Fix

```text
$ git --no-pager diff -- tests/distributed-briefs.static.integration.mjs
diff --git a/tests/distributed-briefs.static.integration.mjs b/tests/distributed-briefs.static.integration.mjs
index 1fa04d5f..fd54ee7d 100644
--- a/tests/distributed-briefs.static.integration.mjs
+++ b/tests/distributed-briefs.static.integration.mjs
@@ -10,6 +10,17 @@ import assert from 'node:assert/strict';
 import { buildGraph, writeGraphToTemp, removeTemp } from './fixtures/feature-002/ui/ui-fixture-builder.mjs';
 import { startBriefServer, harnessUrl, loadPlaywright, browserLaunchOptions } from './distributed-briefs.support.mjs';

+// The shared brief renders inside the shell's "Brief" view (feat(brief): brief lives only in Brief
+// view). Ordinary tools boot in their default "simple" view, so drive the real rlviews control to the
+// Brief view — exactly as every other shell regression does (tests/distributed-briefs.spec.mjs
+// ::mountReady) — before asserting the brief is visible. The switch only reveals the already-loaded
+// mount and issues no brief request of its own, so it is placed BEFORE every network-window baseline
+// below (`no history partition before Open history`, `beforePower`) and cannot invalidate them.
+async function openBriefView(page) {
+    await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 20000 });
+    await page.locator('#rlviews button[data-rlview-mode="brief"]').click();
+}
+
 test('static loader verifies coherent current objects and fetches history only after selection', async (t) => {
     let chromium;
     try { ({ chromium } = await loadPlaywright()); } catch (e) { t.skip('Playwright runtime unavailable'); return; }
@@ -24,6 +35,7 @@ test('static loader verifies coherent current objects and fetches history only a
         page.on('response', (res) => { try { cacheHeaders.set(new URL(res.url()).pathname, res.headers()['cache-control'] || ''); } catch (e) { /* ignore */ } });

         await page.goto(harnessUrl(server.baseUrl, 'sector-research-lab'), { waitUntil: 'load' });
+        await openBriefView(page);
         await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });

         const state = await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state');
@@ -78,6 +90,7 @@ test('static loader verifies coherent current objects and fetches history only a
     try {
         const page = await browser2.newPage();
         await page.goto(harnessUrl(badServer.baseUrl, 'sector-research-lab'), { waitUntil: 'load' });
+        await openBriefView(page);
         await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
         const st = await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state');
         assert.equal(st, 'integrity-error', 'hash mismatch fails closed');
```

### No Assertion Weakened

```text
$ git --no-pager diff --numstat -- tests/distributed-briefs.static.integration.mjs
13      0       tests/distributed-briefs.static.integration.mjs

$ git show HEAD:tests/distributed-briefs.static.integration.mjs | grep -c 'assert\.'
15
$ grep -c 'assert\.' tests/distributed-briefs.static.integration.mjs
15
$ grep -c "state: *'attached'" tests/distributed-briefs.static.integration.mjs
0
$ git show HEAD:tests/distributed-briefs.static.integration.mjs | grep -c '\.skip'
1
$ grep -c '\.skip' tests/distributed-briefs.static.integration.mjs
1
```

`13 0` is `13 insertions, 0 deletions`. Assertion count identical. Zero
`state: 'attached'` relaxations. `.skip` count identical at 1 — the pre-existing
"Playwright runtime unavailable" runtime guard, which the reconciliation did not touch.

### Network-Window Assertions Still Enforced

```text
$ grep -n "no history partition before Open history\|mode switch performs no refetch\|no partition fetched until a filter is selected\|exactly one selected partition fetched" tests/distributed-briefs.static.integration.mjs
18:// below (`no history partition before Open history`, `beforePower`) and cannot invalidate them.
53:        assert.equal(server.briefRequests().some((p) => p.indexOf('/briefs/history/') === 0), false, 'no history partition before Open history');
59:        assert.equal(server.briefRequests().length, beforePower, 'mode switch performs no refetch');
69:        assert.equal(afterOpen.some((p) => p.indexOf('/briefs/history/') === 0), false, 'no partition fetched until a filter is selected');
75:        assert.equal(partitions.length, 1, 'exactly one selected partition fetched');
```

All four request-window assertions remain, and all four pass in the GREEN run below —
which proves empirically that the Brief-view switch issues no brief request of its own.

### GREEN (post-fix, TP-B003-01)

```text
$ timeout 300 node --test tests/distributed-briefs.static.integration.mjs
✔ static loader verifies coherent current objects and fetches history only after selection (2216.53705ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2328.838766
GREEN_EXIT=0
```

The reconciled test completes in ~2.2 s. Pre-fix it consumed a full 15 s timeout before
failing. The pass is therefore obtained by satisfying the wait, not by outlasting it.

### Sibling Suite (TP-B003-02 — Regression E2E, 13 tests, file unmodified)

```text
$ npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 13 tests using 1 worker

  ✓   1 …wer keep official close separate and disclose comparable volume (498ms)
  ✓   2 … the exact published pre-market thesis with owner read evidence (340ms)
  ✓   3 …inal never labels a partial regular print as the official close (371ms)
  ✓   4 …erve official close and label every post-close print indicative (408ms)
  ✓   5 … strips use explicit calendar boundaries and next valid session (529ms)
  ✓   6 …ming to released without stale actual or post-release consensus (593ms)
  ✓   7 …ay separate and revisions append without rewriting the original (619ms)
  ✓   8 … and history exclude look-ahead and retain immutable chronology (371ms)
  ✓   9 …ed unusual evidence remains context and consumes no action slot (306ms)
  ✓  10 …emains truthful and non-current failures cannot replace current (645ms)
  ✓  11 …fetches only the selected partition and opened evidence objects (439ms)
  ✓  12 …ory UI is accessible safe and stable at desktop mobile and zoom (618ms)
  ✓  13 …y source receives the shared mount with no page-specific branch (279ms)

  13 passed (7.6s)
SIBLING_EXIT=0
```

### Project Selftest (TP-B003-03 — Regression E2E baseline)

```text
$ node scripts/selftest.mjs
  ✓ a signed-off JourneyCompletionPacket records review locally and executes NOTHING (no execution entry point exists)
  ✓ backtracking an assumption stales only its transitive dependent (b) and preserves the unrelated completed step (d)

Feature 012 Scope 09 Market Action Center PUBLIC projection + public portfolio matrix
  ✓ rlmarketaction.js owns zero forbidden fetch/providerFetch/storage-write/publisher/LLM capability
  ✓ SCN-012-022 public matrix labels every row `Public watchlist` with one explicit applicable/state cell per domain (never neutral by omission)
  ✓ the composed public matrix validates round-trip and matches the validator row count
  ✓ the public composer refuses a smuggled Feature 008 private field (RLMKT-PRIVACY) and never echoes the private value
  ✓ SCN-012-019 the Center composes exactly four views (brief/portfolio/red-alert/journey), three exact dependency-pending gates, and a truthful no-action Brief that fabricates no action/catalyst/confidence
  ✓ the market-action contract validator reports four views, three pending gates, and seven distinct closed RLMKT-* adversarial refusals

Feature 012 Scope 10 Bounded WebEvidence Acquisition (fail-closed acquisition + validator)
  ✓ every committed web-evidence fixture (>= 11) evaluates deterministically against the REAL acquire() production transform
  ✓ web-evidence-acquire.mjs imports ONLY node:crypto and owns zero fetch/provider-key/repo-write/current-pointer/author-publication authority
  ✓ the web-evidence validator refuses twelve distinct closed adversarial mutations, each with an E012-* code
  ✓ SCN-012-006/007 single & syndicated origins leave a material claim uncorroborated while two DISTINCT origins corroborate; the safe bundle is frozen with no raw markup (SCN-012-037)

Feature 012 Scope 12 Dynamic Red Alert discovery/qualification/projection
  ✓ SCN-012-023 a dynamically corroborated, market-confirmed, high-severity candidate qualifies with every falsifiable field and an admission score (never a probability/confidence/crash-odds field), publication Feature-002 gated
  ✓ SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title
  ✓ SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic

================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### Production Simple Bridge (TP-B003-04 — Regression E2E, 19 wired tools)

```text
$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (46.226937ms)
✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (881.860747ms)
✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (915.631048ms)
✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1427.054885ms)
✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (54.832461ms)
✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (28.842779ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3469.50612
BRIDGE_EXIT=0
```

---

## Boundary Attestation

The reconciliation touched exactly one non-packet file. Every product, shell, config,
page and sibling-test file named in the work boundary is byte-identical to HEAD:

```text
$ git --no-pager status --porcelain -- rlviews.js rlbrief.js rlexperience.js tool-experience.config.json tests/distributed-briefs.spec.mjs '*.html'
(status_exit=0)
```

Empty output means none of those paths differ from HEAD. The concurrent lanes
(`specs/002-*`, `specs/013-*`, `specs/014-*`, `specs/015-*`, `specs/016-*`) were not
modified by this packet; the path-scoped `git stash push -- <file>` used for the causal
RED re-proof deliberately carried a pathspec so no other lane's working-tree state was
disturbed.

## Evidence Provenance

Every block in this report is `executed` — raw terminal output captured in this session
from the commands shown. No block is `interpreted` or `not-run`. The RED blocks were
captured twice (initial reproduction and the path-scoped causal re-proof) and agree.
