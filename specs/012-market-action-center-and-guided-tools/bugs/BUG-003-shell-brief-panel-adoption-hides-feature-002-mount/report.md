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

**RED-stage first (Gate G060).** The failing proof was captured on pre-fix bytes and
exited 1 — see § RED-stage Reproduction and § RED-stage Causal Re-Proof below. Only after
that was the reconciliation written, and the GREEN-stage proof (§ GREEN-stage, exit 0)
follows it in this report, in that order.

## Completion Statement

SCOPE-01 is complete. TP-10-02 passes (exit 0), the 13 sibling regressions pass
(exit 0), `scripts/selftest.mjs` reports `952 passed, 0 failed` (exit 0), and
`tests/simple-production-bridge.integration.mjs` reports 6/6 with `wired (19)`
(exit 0). Every DoD item in [scopes.md](scopes.md) carries inline raw execution
evidence. No deferrals: every issue this packet encountered was fixed inline.

---

## Test Evidence

### RED-stage Reproduction (pre-fix, exit 1)

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

### RED-stage Causal Re-Proof

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

### Code Diff Evidence

The delivery delta is committed at `8206c89c`. The non-planning change surface is exactly
one path, `tests/distributed-briefs.static.integration.mjs` (test family):

```text
$ git --no-pager show 8206c89c --stat --format='commit %H%nsubject: %s' -- tests/distributed-briefs.static.integration.mjs
commit 8206c89c7247ba2d8e5652663ffdb06c19a83a57
subject: fix(012/BUG-003): reconcile TP-10-02 to the shell Brief-view contract

 tests/distributed-briefs.static.integration.mjs | 13 +++++++++++++
 1 file changed, 13 insertions(+)
stat_exit=0

$ git --no-pager show 8206c89c --numstat --format= -- tests/distributed-briefs.static.integration.mjs
13      0       tests/distributed-briefs.static.integration.mjs
numstat_exit=0
```

The full diff of that path, as committed:

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

### GREEN-stage (post-fix, TP-B003-01)

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

---

## Independent Validation (bubbles.validate)

Owner: `bubbles.validate`. Everything below was **re-executed independently** in the
validate session on 2026-07-28; none of it is inherited from the implement agent's
report. Repository-binding preflight passed first (`repo-binding-preflight.sh
--repo-root <repo> --agent-source research-lab`, exit 0).

**Scope-boundary note recorded during validation.** The routing narrative that reached
validate described the fix as landing in `tests/distributed-briefs.spec.mjs`. That is
incorrect and was corrected against git: commit `8206c89c` touches
`tests/distributed-briefs.static.integration.mjs` only. TP-10-02 lives in
`static.integration.mjs`; `spec.mjs` holds the 13 ratified siblings and is byte-unchanged.
`state.json` and `scopes.md` already recorded the correct file, so the packet itself was
accurate — only the hand-off narrative drifted.

### IV-1 TP-10-02 Replay (SCN-B003-01, SCN-B003-02, SCN-B003-03)

**Claim Source:** executed

```text
$ node --test tests/distributed-briefs.static.integration.mjs
✔ static loader verifies coherent current objects and fetches history only after selection (2038.159444ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2148.350271
CMD2_EXIT=0
```

**Interpretation:** `skipped 0` proves the `t.skip('Playwright runtime unavailable')`
guard did not fire, so the browser body really ran. Both mount-wait sites execute inside
this single test, so SCN-B003-01 (coherent graph → `ready`), SCN-B003-02 (four
network-window assertions) and SCN-B003-03 (fail-closed `integrity-error`) are all
covered by this one pass. Completing in 2.0 s rather than exhausting the unchanged
15000 ms wait shows the pass comes from satisfying the wait, not outlasting it.

### IV-2 Sibling Suite Replay (SCN-B003-04)

**Claim Source:** executed

```text
$ npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
Running 13 tests using 1 worker
  ✓   1 …ower keep official close separate and disclose comparable volume (1.1s)
  ✓   2 … the exact published pre-market thesis with owner read evidence (373ms)
  ✓   3 …inal never labels a partial regular print as the official close (445ms)
  ✓   4 …erve official close and label every post-close print indicative (403ms)
  ✓   5 … strips use explicit calendar boundaries and next valid session (618ms)
  ✓   6 …ming to released without stale actual or post-release consensus (709ms)
  ✓   7 …ay separate and revisions append without rewriting the original (749ms)
  ✓   8 … and history exclude look-ahead and retain immutable chronology (389ms)
  ✓   9 …ed unusual evidence remains context and consumes no action slot (341ms)
  ✓  10 …emains truthful and non-current failures cannot replace current (752ms)
  ✓  11 …fetches only the selected partition and opened evidence objects (481ms)
  ✓  12 …ory UI is accessible safe and stable at desktop mobile and zoom (555ms)
  ✓  13 …y source receives the shared mount with no page-specific branch (309ms)
  13 passed (10.2s)
CMD1_EXIT=0
```

### IV-3 Adversarial Non-Silent-Pass Proof

A test that passes regardless of the fix is not evidence. TP-10-02 was mutated twice and
restored byte-exactly. Baseline before any mutation:

**Claim Source:** executed

```text
$ md5sum tests/distributed-briefs.static.integration.mjs
d98e79ebbf31bf0de164fbcbc6dc59a8  tests/distributed-briefs.static.integration.mjs
$ sha256sum tests/distributed-briefs.static.integration.mjs
3acd7764c0d754764053dd3b6cc7352f53cea0d5ae79b414d6693e8a15636727  tests/distributed-briefs.static.integration.mjs
$ wc -c tests/distributed-briefs.static.integration.mjs
6415 tests/distributed-briefs.static.integration.mjs
```

**A1 — remove the fix (both `openBriefView(page)` calls). Expect RED.**

**Claim Source:** executed

```text
$ node --test tests/distributed-briefs.static.integration.mjs
✖ static loader verifies coherent current objects and fetches history only after selection (16003.976926ms)
ℹ pass 0
ℹ fail 1
ℹ skipped 0
  page.waitForSelector: Timeout 15000ms exceeded.
  Call log:
    - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible
      33 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>
    name: 'TimeoutError'
A1_EXIT=1
```

**A2 — keep the fix, break the core expectation (`'ready'` → sentinel). Expect RED.**

**Claim Source:** executed

```text
$ node --test tests/distributed-briefs.static.integration.mjs
✖ static loader verifies coherent current objects and fetches history only after selection (1314.021282ms)
ℹ pass 0
ℹ fail 1
  AssertionError [ERR_ASSERTION]: coherent current graph renders ready
    actual: 'ready',
    expected: 'ADVERSARIAL-SENTINEL-NOT-READY',
    operator: 'strictEqual',
A2_EXIT=1
```

**Byte-exact restore, then re-confirm green.**

**Claim Source:** executed

```text
$ md5sum tests/distributed-briefs.static.integration.mjs
d98e79ebbf31bf0de164fbcbc6dc59a8  tests/distributed-briefs.static.integration.mjs
$ sha256sum tests/distributed-briefs.static.integration.mjs
3acd7764c0d754764053dd3b6cc7352f53cea0d5ae79b414d6693e8a15636727  tests/distributed-briefs.static.integration.mjs
$ wc -c tests/distributed-briefs.static.integration.mjs
6415 tests/distributed-briefs.static.integration.mjs
$ git --no-pager status --porcelain -- tests/
(end porcelain)
$ node --test tests/distributed-briefs.static.integration.mjs
✔ static loader verifies coherent current objects and fetches history only after selection (2414.024845ms)
ℹ pass 1
ℹ fail 0
RESTORED_EXIT=0
```

**Interpretation:** A1 shows the test fails with the exact original defect signature when
the fix is absent — the mount resolves **hidden** 33 consecutive times against the real
DOM — so TP-10-02 is causally sensitive to the fix and cannot pass regardless of it. A2
shows the core assertion is genuinely evaluated: `actual: 'ready'` was read from the live
DOM and compared. Post-restore md5, sha256 and byte count all equal the pre-mutation
baseline and `git status --porcelain -- tests/` is empty, so the whole `tests/` tree is
byte-identical to HEAD.

### IV-4 Regression Baselines

**Claim Source:** executed

```text
$ node scripts/selftest.mjs
  ✓ SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title
  ✓ SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic
================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
CMD3_EXIT=0

$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
ℹ tests 6
ℹ pass 6
ℹ fail 0
CMD4_EXIT=0

$ node --test tests/simple-production-bridge.unit.mjs
ℹ tests 5
ℹ pass 5
ℹ fail 0
CMD5_EXIT=0

$ npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
Running 29 tests using 1 worker
  29 passed (22.3s)
CMD6_EXIT=0
```

### IV-5 Fix Additivity Re-Verification

**Claim Source:** executed

```text
$ git --no-pager show 8206c89c --stat
 .../bug.md                                         | 165 +++++++++++
 .../design.md                                      | 198 +++++++++++++
 .../report.md                                      | 318 +++++++++++++++++++++
 .../scopes.md                                      | 223 +++++++++++++++
 .../spec.md                                        |  90 ++++++
 .../state.json                                     | 137 +++++++++
 .../uservalidation.md                              |  13 +
 tests/distributed-briefs.static.integration.mjs    |  13 +
 8 files changed, 1157 insertions(+)

$ git --no-pager show 8206c89c -- tests/distributed-briefs.spec.mjs
EXIT_A=0

$ git --no-pager show 8206c89c -- tests/distributed-briefs.static.integration.mjs
+async function openBriefView(page) {
+    await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 20000 });
+    await page.locator('#rlviews button[data-rlview-mode="brief"]').click();
+}
+        await openBriefView(page);
+        await openBriefView(page);
```

**Interpretation:** the whole commit is `1157 insertions(+)` with **zero** deleted lines,
and the only non-packet file is `static.integration.mjs` at `+13`. The `spec.mjs` diff is
empty, confirming the 13 ratified siblings were untouched. The added lines are a helper
plus two call sites — no assertion was deleted, weakened, skipped, or relaxed from
`visible` to `attached`, and the two 15000 ms mount-wait timeouts are unchanged.

### IV-6 Assurance Derivation (mechanical, not asserted)

**Claim Source:** executed

```text
$ bash .github/bubbles/scripts/assurance-derive.sh --implement-complete true --tests-complete true --tests-passed true --audit-complete false
achievedLevel=fast
terminalStatus=delivered_fast
riskClass=unknown
missingForFull=independent-audit
reason=implementation + full test coverage + all tests passing, but no independent audit — fast assurance (rapid-tool-delivery achievement)
DERIVE_EXIT=0

$ bash .github/bubbles/scripts/is-terminal-for-mode.sh delivered_fast bugfix-fastlane
TERMINAL_FAST_EXIT=1

$ bash .github/bubbles/scripts/is-terminal-for-mode.sh done bugfix-fastlane
TERMINAL_DONE_EXIT=0
```

**Interpretation:** the achieved level is `fast` — implementation complete, coverage
complete, all tests passing, but **no independent audit**. `fast`'s terminal status
`delivered_fast` is **not** terminal-for-mode under `bugfix-fastlane` (exit 1); the only
terminal status this mode accepts is `done` (exit 0), which requires `full` assurance.
Therefore the derived increment is non-terminal for this mode and the packet MUST remain
`in_progress`. This is the anti-fabrication floor doing its job, not a defect in the fix.

### IV-7 Certification Decision

The fix is real, minimal, causally proven and fully regression-clean. The packet is
nevertheless **not certifiable to `done`**, for one reason only: `bugfix-fastlane`
requires the specialist chain
`implement → test → regression → simplify → stabilize → security → validate → audit`
(`.github/bubbles/registry/required-specialists.yaml`), and only `implement` was ever
executed. `execution.audit.attempts` is empty and `currentAttemptId` is `null`, so under
audit profile `delivery-completion-v1` there is no `AUDIT_RESULT_V1` transcript to certify
against. Validate therefore records the scope completion and the derived assurance, and
routes the remaining phases rather than forcing a terminal status.

`validate` is deliberately **not** recorded in `certifiedCompletedPhases`: this validation
verdict is `route_required`, not clean, and validate must re-run after the remaining
phases to certify the final state.

---

## Test Phase (bubbles.test)

- **Executed by:** `bubbles.test`
- **Executed at:** 2026-07-28T22:44Z – 23:05Z
- **HEAD at execution:** `0a9638012af21750ad005e4cb39041dbd4efa530`
- **Fix commit under test:** `8206c89c` — `fix(012/BUG-003): reconcile TP-10-02 to the shell Brief-view contract`
- **Claim Source:** `executed` — every block below is verbatim terminal output from a
  command run in this session. Nothing is interpreted, summarised or carried over.
- **Files changed by this phase:** only this packet (`report.md`, `state.json`). The
  `tests/` tree, `rlviews.js`, `rlbrief.js`, `rlexperience.js`,
  `tool-experience.config.json`, every `*.html`, `scripts/` and `.github/` are
  byte-identical to HEAD (verified in TPH-3 and TPH-11).

### TPH-0 Repository-binding preflight (mandatory gate)

```text
$ bash .github/bubbles/scripts/repo-binding-preflight.sh --repo-root /home/redacted/research-lab --agent-source research-lab
[repo-binding-preflight] OK — agent source 'research-lab' matches target repo 'research-lab'.
PREFLIGHT_EXIT=0
```

### TPH-1 Packet-vs-request file reconciliation (recorded, not asserted)

The dispatch brief named `tests/distributed-briefs.spec.mjs` as the file holding the
reconciled TP-10-02 and expected "all 14 to pass" there. The repository disagrees, and the
packet is correct: the reconciled test lives in `tests/distributed-briefs.static.integration.mjs`
(1 test, `node --test`), and `tests/distributed-briefs.spec.mjs` holds the **13 siblings**
(Playwright). 13 + 1 = the 14 tests the brief expected, split across two files. Both were
run; neither was skipped.

```text
$ git --no-pager show --numstat --format='%H%n%an%n%ad%n%s' 8206c89c
8206c89c7247ba2d8e5652663ffdb06c19a83a57
pkirsanov
Tue Jul 28 19:34:55 2026 +0000
fix(012/BUG-003): reconcile TP-10-02 to the shell Brief-view contract

165     0       .../BUG-003-.../bug.md
198     0       .../BUG-003-.../design.md
318     0       .../BUG-003-.../report.md
223     0       .../BUG-003-.../scopes.md
90      0       .../BUG-003-.../spec.md
137     0       .../BUG-003-.../state.json
13      0       .../BUG-003-.../uservalidation.md
13      0       tests/distributed-briefs.static.integration.mjs

$ for f in tests/distributed-briefs*.mjs; do printf '%-55s %s\n' "$f" "$(grep -cE "^\s*test\(" "$f")"; done
tests/distributed-briefs.spec.mjs                       13
tests/distributed-briefs.static.integration.mjs         1
tests/distributed-briefs.support.mjs                    0
```

The only non-packet file the fix touched is `tests/distributed-briefs.static.integration.mjs`
at 13 insertions / 0 deletions.

### TPH-2 Direct regression — TP-B003-01, the previously-failing test (GREEN, exit 0)

```text
$ timeout 300 node --test tests/distributed-briefs.static.integration.mjs
✔ static loader verifies coherent current objects and fetches history only after selection (2979.783849ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3105.493904
TP_B003_01_EXIT=0
```

`skipped 0` — the pre-existing `t.skip('Playwright runtime unavailable')` guard did **not**
fire, so the test really executed a browser. It completed in 2.98 s against an unchanged
15000 ms wait, so it passes by satisfying the wait, not by outlasting it.

### TPH-3 Direct regression — TP-B003-02, the 13 ratified siblings (exit 0)

```text
$ timeout 900 npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 13 tests using 1 worker

  ✓   1 …wer keep official close separate and disclose comparable volume (758ms)
  ✓   2 … the exact published pre-market thesis with owner read evidence (388ms)
  ✓   3 …inal never labels a partial regular print as the official close (458ms)
  ✓   4 …erve official close and label every post-close print indicative (587ms)
  ✓   5 … strips use explicit calendar boundaries and next valid session (625ms)
  ✓   6 …ming to released without stale actual or post-release consensus (743ms)
  ✓   7 …ay separate and revisions append without rewriting the original (737ms)
  ✓   8 … and history exclude look-ahead and retain immutable chronology (493ms)
  ✓   9 …ed unusual evidence remains context and consumes no action slot (487ms)
  ✓  10 …emains truthful and non-current failures cannot replace current (826ms)
  ✓  11 …fetches only the selected partition and opened evidence objects (463ms)
  ✓  12 …ory UI is accessible safe and stable at desktop mobile and zoom (717ms)
  ✓  13 …y source receives the shared mount with no page-specific branch (383ms)

  13 passed (9.6s)
STEP1_EXIT=0
```

SCN-B003-04 additionally requires the sibling file to be **unmodified**. It is byte-identical
across the fix commit:

```text
$ git show 8206c89c^:tests/distributed-briefs.spec.mjs | sha256sum | cut -d' ' -f1
2ab687eb2ef52dca2f7e41b1563ec2ff4fc9c1c09e0a0a99ff79afdd3a990221
$ sha256sum tests/distributed-briefs.spec.mjs | cut -d' ' -f1
2ab687eb2ef52dca2f7e41b1563ec2ff4fc9c1c09e0a0a99ff79afdd3a990221

$ git show 8206c89c^:tests/distributed-briefs.spec.mjs | grep -c 'toBeVisible'
6
$ grep -c 'toBeVisible' tests/distributed-briefs.spec.mjs
6
```

### TPH-4 Adversarial RED proof — the reconciled test still catches BUG-003

**Purpose.** Prove the reconciliation did not neuter the assertion. The mutation reverts
**only the brief-view click** and deliberately **retains** the newly-added 20000 ms
shell-ready wait, so the click — not the extra wait — is isolated as the causal element.

**Baseline checksum before mutation:**

```text
$ sha256sum tests/distributed-briefs.static.integration.mjs
3acd7764c0d754764053dd3b6cc7352f53cea0d5ae79b414d6693e8a15636727  tests/distributed-briefs.static.integration.mjs
```

**The mutation (1 line, click only):**

```text
$ git --no-pager diff -- tests/distributed-briefs.static.integration.mjs
diff --git a/tests/distributed-briefs.static.integration.mjs b/tests/distributed-briefs.static.integration.mjs
index fd54ee7d..f141da3c 100644
--- a/tests/distributed-briefs.static.integration.mjs
+++ b/tests/distributed-briefs.static.integration.mjs
@@ -18,7 +18,7 @@ import { startBriefServer, harnessUrl, loadPlaywright, browserLaunchOptions } fr
 // below (`no history partition before Open history`, `beforePower`) and cannot invalidate them.
 async function openBriefView(page) {
     await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 20000 });
-    await page.locator('#rlviews button[data-rlview-mode="brief"]').click();
+    // ADVERSARIAL-MUTATION-TEMP: brief-view click reverted to prove the assertion still catches BUG-003
 }
 
 test('static loader verifies coherent current objects and fetches history only after selection', async (t) => {

$ git --no-pager diff --numstat -- tests/distributed-briefs.static.integration.mjs
1       1       tests/distributed-briefs.static.integration.mjs

$ sha256sum tests/distributed-briefs.static.integration.mjs
f24c2b82c5a8f9b385ff63d0e0da651509aa0415c6aca433dfa144151ca14ba8  tests/distributed-briefs.static.integration.mjs
```

**RED (exit 1) — identical failure signature to the original defect:**

```text
$ timeout 300 node --test tests/distributed-briefs.static.integration.mjs
✖ static loader verifies coherent current objects and fetches history only after selection (16917.793401ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 17105.372066

✖ failing tests:

test at tests/distributed-briefs.static.integration.mjs:24:1
✖ static loader verifies coherent current objects and fetches history only after selection (16917.793401ms)
  page.waitForSelector: Timeout 15000ms exceeded.
  Call log:
    - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible
      33 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>

      at TestContext.<anonymous> (/home/redacted/research-lab/tests/distributed-briefs.static.integration.mjs:39:20) {
    name: 'TimeoutError',
    log: [ `  - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible`, '    33 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>' ]
  }
ADVERSARIAL_RED_EXIT=1
```

This reproduces the original defect exactly as recorded in [bug.md](bug.md) § Verbatim
Failure Output: same `TimeoutError`, same unchanged `Timeout 15000ms exceeded`, same
`to be visible` state, and the same fully-settled-but-`hidden` mount
(`data-rlbrief-ready="1" data-rlbrief-state="ready" data-rlexperience-state="registered"`).
The poll count differs only by scheduling jitter (33 here vs 32 at discovery).

**Byte-exact restore:**

```text
$ sha256sum tests/distributed-briefs.static.integration.mjs
3acd7764c0d754764053dd3b6cc7352f53cea0d5ae79b414d6693e8a15636727  tests/distributed-briefs.static.integration.mjs
   (identical to the pre-mutation baseline above)

$ git --no-pager diff -- tests/distributed-briefs.static.integration.mjs
(no output — byte-identical to HEAD)

$ git --no-pager status --porcelain -- tests/
(no output — the entire tests/ tree is byte-identical to HEAD)

$ grep -c 'ADVERSARIAL-MUTATION-TEMP' tests/distributed-briefs.static.integration.mjs
0
grep_exit=1
```

**GREEN re-proof after restore (exit 0):**

```text
$ timeout 300 node --test tests/distributed-briefs.static.integration.mjs
✔ static loader verifies coherent current objects and fetches history only after selection (3035.270226ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3197.907499
POST_RESTORE_GREEN_EXIT=0
```

RED (exit 1) → restore → GREEN (exit 0) with a byte-identical file proves the assertion is
still load-bearing: the fix works because it drives the shell, not because it relaxed anything.

### TPH-5 Regression quality guard (exit 0, adversarial signal detected)

```text
$ bash .github/bubbles/scripts/regression-quality-guard.sh tests/distributed-briefs.spec.mjs
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /home/redacted/research-lab
  Timestamp: 2026-07-28T22:44:42Z
  Bugfix mode: false
============================================================

ℹ️  Scanning tests/distributed-briefs.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
============================================================
GUARD_SIBLING_EXIT=0

$ bash .github/bubbles/scripts/regression-quality-guard.sh tests/distributed-briefs.static.integration.mjs
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /home/redacted/research-lab
  Timestamp: 2026-07-28T22:44:42Z
  Bugfix mode: false
============================================================

ℹ️  Scanning tests/distributed-briefs.static.integration.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
============================================================
GUARD_FIXED_EXIT=0

$ bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/distributed-briefs.static.integration.mjs
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /home/redacted/research-lab
  Timestamp: 2026-07-28T22:44:43Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/distributed-briefs.static.integration.mjs
✅ Adversarial signal detected in tests/distributed-briefs.static.integration.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
GUARD_BUGFIX_EXIT=0
```

The guard was run against BOTH the file named in the dispatch brief and the file the fix
actually changed. Both are clean; the bugfix/adversarial mode detects an adversarial signal
in the reconciled file.

### TPH-6 No-weakening verification (mechanical)

```text
$ git --no-pager show --numstat 8206c89c -- tests/distributed-briefs.static.integration.mjs
13      0       tests/distributed-briefs.static.integration.mjs

$ git --no-pager show 8206c89c -- tests/distributed-briefs.static.integration.mjs | grep -E '^-[^-]'
deleted_line_grep_exit=1 (1 == zero deletions)

$ git show 8206c89c^:...static.integration.mjs | grep -c 'assert\.'     # pre-fix
15
$ grep -c 'assert\.' tests/distributed-briefs.static.integration.mjs     # now
15

$ git show 8206c89c^:...static.integration.mjs | grep -cE "state: *['\"]attached['\"]"   # pre-fix
0
$ grep -cE "state: *['\"]attached['\"]" tests/distributed-briefs.static.integration.mjs  # now
0

$ git show 8206c89c^:...static.integration.mjs | grep -c '\.skip'   # pre-fix
1
$ grep -c '\.skip' tests/distributed-briefs.static.integration.mjs  # now
1

--- ALL timeout values, pre-fix ---
27:  waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
46:  waitForSelector('[data-rlbrief-part="price"]', { timeout: 5000 });
54:  waitForSelector('#rlbrief-hist-select', { timeout: 8000 });
61:  waitForSelector('[data-rlbrief-part="history-timeline"]', { timeout: 8000 });
81:  waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
--- ALL timeout values, now ---
20:  waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 20000 });   <-- NEW (shell-ready), copied from the ratified sibling
39:  waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
58:  waitForSelector('[data-rlbrief-part="price"]', { timeout: 5000 });
66:  waitForSelector('#rlbrief-hist-select', { timeout: 8000 });
73:  waitForSelector('[data-rlbrief-part="history-timeline"]', { timeout: 8000 });
94:  waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });

$ grep -nE 'waitForSelector\(.*rlbrief-mount' tests/distributed-briefs.static.integration.mjs
39:        await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
94:        await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
```

| Weakening vector | Pre-fix | Now | Verdict |
|---|---|---|---|
| Deleted lines in the fix diff | — | 0 | additive only |
| Assertion count | 15 | 15 | unchanged |
| `state: 'attached'` relaxations | 0 | 0 | visibility still asserted |
| `.skip` count | 1 (pre-existing runtime guard) | 1 | no new skip |
| Every pre-existing timeout (15000/5000/8000/8000/15000) | 5 values | same 5 values | unchanged |
| Mount-wait state | Playwright default `visible` | Playwright default `visible` | unchanged |
| Sibling `toBeVisible()` | 6 | 6 | unchanged |

The **only** new timeout is the 20000 ms shell-ready wait, which belongs to a newly added
wait copied from the ratified sibling — no existing timeout was extended to mask anything.
The reconciled test finishes in ~3 s against a 15000 ms budget.

### TPH-7 Surrounding suite — full `distributed-briefs` family via `node --test` (61/61, exit 0)

```text
$ timeout 2400 node --test $(ls tests/distributed-briefs*.mjs | grep -v '\.spec\.mjs$')
✔ Regression: SCN-002-001 current registry freezes 22 source reads and one non-recursive final aggregator (14.820289ms)
✔ Regression: SCN-002-002 unavailable non-live and off-theme evidence never becomes a market recommendation (3.590197ms)
✔ Regression: SCN-002-003 registry-only addition joins every read consumer without inventory edits (2.027098ms)
...
================================================
Scope 06 author-pool stress: 16 passed, 0 failed
================================================
✔ tests/distributed-briefs.authorship.stress.mjs (347.472336ms)
...
================================================
history load: 8 passed, 0 failed
================================================
✔ tests/distributed-briefs.history.load.mjs (788.985102ms)
...
distributed-briefs.scheduler.stress: PASS (concurrent duplicates + crash-resume within budgets)
✔ tests/distributed-briefs.scheduler.stress.mjs (1779.318057ms)
✔ SCN-002-010: run state permits only evidence freeze reads authors final publish commit and push order (1.945899ms)
✔ SCN-002-010: manifest inventory and pointer-last generation share one run identity (31.662177ms)
✔ static loader verifies coherent current objects and fetches history only after selection (5968.016387ms)
✔ tests/distributed-briefs.support.mjs (89.628133ms)
✔ Canary: enabled source pages render briefs and retain controls/RLDATA/credential lifecycle; the aggregator stays idle (43527.14261ms)
ℹ tests 61
ℹ suites 0
ℹ pass 61
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 51103.84158
STEP4A_EXIT=0
```

37 files, **61 passed / 0 failed / 0 skipped**, exit 0 — and the reconciled TP-10-02 is
visible inside that run (`✔ static loader verifies coherent current objects …`). The elided
`...` lines are the remaining individual `✔` results in the same 61-test run; every one is a
pass, and the machine-readable totals above are the run's own summary.

### TPH-8 Surrounding suite — TP-B003-03 project selftest (952/0, exit 0)

```text
$ timeout 1200 node scripts/selftest.mjs
  ✓ rlmarketaction.js owns zero forbidden fetch/providerFetch/storage-write/publisher/LLM capability
  ✓ SCN-012-022 public matrix labels every row `Public watchlist` with one explicit applicable/state cell per domain (never neutral by omission)
  ✓ the composed public matrix validates round-trip and matches the validator row count
  ✓ the public composer refuses a smuggled Feature 008 private field (RLMKT-PRIVACY) and never echoes the private value
  ✓ SCN-012-019 the Center composes exactly four views (brief/portfolio/red-alert/journey), three exact dependency-pending gates, and a truthful no-action Brief that fabricates no action/catalyst/confidence
  ✓ the market-action contract validator reports four views, three pending gates, and seven distinct closed RLMKT-* adversarial refusals
  ✓ every committed web-evidence fixture (>= 11) evaluates deterministically against the REAL acquire() production transform
  ✓ web-evidence-acquire.mjs imports ONLY node:crypto and owns zero fetch/provider-key/repo-write/current-pointer/author-publication authority
  ✓ the web-evidence validator refuses twelve distinct closed adversarial mutations, each with an E012-* code
  ✓ SCN-012-006/007 single & syndicated origins leave a material claim uncorroborated while two DISTINCT origins corroborate; the safe bundle is frozen with no raw markup (SCN-012-037)
  ✓ SCN-012-023 a dynamically corroborated, market-confirmed, high-severity candidate qualifies with every falsifiable field and an admission score (never a probability/confidence/crash-odds field), publication Feature-002 gated
  ✓ SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title
  ✓ SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic

================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

The run emitted 370 lines; the verdict line and exit code were extracted from that captured
full output (`grep -nE 'Research-Lab self-test|SELFTEST_EXIT' → line 367/369`) and no `✗` or
`FAIL` line was present. This matches the ratified 952/0 baseline exactly.

### TPH-9 Surrounding suite — Playwright wiring + models (4/4, exit 0)

```text
$ timeout 1800 npx --no-install playwright test tests/simple-production-wiring.spec.mjs tests/simple-models.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 4 tests using 2 workers

  ✓  1 …ter stays unavailable without defaults fetch or fabricated result (2.0s)
  ✓  2 …Simple renders the real adapter panel in the real owner-mode flow (4.5s)
  ✓  3 … last valid run across invalid stale missing and non-finite input (1.2s)
  ✓  4 …e under Power (Simple stays honest-unavailable, nothing deleted) (803ms)

  4 passed (7.5s)
STEP4C_EXIT=0
```

### TPH-10 Surrounding suite — TP-B003-04 production Simple bridge (6/6, 19 wired, exit 0)

```text
$ timeout 900 node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (57.791058ms)
✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (1069.186667ms)
✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (1125.209687ms)
✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1742.179487ms)
✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (61.00885ms)
✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (52.111358ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4258.610693
TP_B003_04_EXIT=0
```

### TPH-11 Boundary attestation for this phase

```text
$ git --no-pager status --porcelain -- tests/ rlviews.js rlbrief.js rlexperience.js tool-experience.config.json '*.html' scripts/ .github/
(no output — every one of these surfaces is byte-identical to HEAD)
```

The only files this phase writes are inside the BUG-003 packet: `report.md` (this section)
and `state.json` (`completedPhases` + execution claim). No `certification.*` field and no
`status` field is touched — those remain validate-owned.

### TPH-12 Coverage check — scenario manifest and Test Plan

```text
$ node -e 'const m=require("./.../scenario-manifest.json"); for(const s of m.scenarios){for(const t of s.linkedTests){console.log(s.scenarioId+" | "+t.file+" | "+t.testId);}}'
SCN-B003-01 | tests/distributed-briefs.static.integration.mjs | static loader verifies coherent current objects and fetches history only after selection
SCN-B003-02 | tests/distributed-briefs.static.integration.mjs | static loader verifies coherent current objects and fetches history only after selection
SCN-B003-03 | tests/distributed-briefs.static.integration.mjs | static loader verifies coherent current objects and fetches history only after selection
SCN-B003-04 | tests/distributed-briefs.spec.mjs | Regression: valid added registry source receives the shared mount with no page-specific branch
node_exit=0

$ grep -nF "static loader verifies coherent current objects and fetches history only after selection" tests/distributed-briefs.static.integration.mjs
24:test('static loader verifies coherent current objects and fetches history only after selection', async (t) => {

$ grep -nF "valid added registry source receives the shared mount with no page-specific branch" tests/distributed-briefs.spec.mjs
224:test('Regression: valid added registry source receives the shared mount with no page-specific branch', async ({ page }) => {

$ grep -nE "no history partition before Open history|mode switch performs no refetch|no partition fetched until a filter is selected|exactly one selected partition fetched" tests/distributed-briefs.static.integration.mjs
53:        assert.equal(server.briefRequests().some((p) => p.indexOf('/briefs/history/') === 0), false, 'no history partition before Open history');
59:        assert.equal(server.briefRequests().length, beforePower, 'mode switch performs no refetch');
69:        assert.equal(afterOpen.some((p) => p.indexOf('/briefs/history/') === 0), false, 'no partition fetched until a filter is selected');
75:        assert.equal(partitions.length, 1, 'exactly one selected partition fetched');

$ grep -nE "integrity-error|no partial evidence rendered|Could not verify this brief" tests/distributed-briefs.static.integration.mjs
96:        assert.equal(st, 'integrity-error', 'hash mismatch fails closed');
97:        assert.equal(await page.$('[data-rlbrief-part="price"]'), null, 'no partial evidence rendered on integrity failure');
99:        assert.ok(status.indexOf('Could not verify this brief') >= 0);

$ grep -n "openBriefView" tests/distributed-briefs.static.integration.mjs
19:async function openBriefView(page) {
38:        await openBriefView(page);
93:        await openBriefView(page);
```

**Scenario coverage — 4 of 4 declared scenarios have a real, existing, executed test:**

| Scenario | Linked test (exists at line) | Executed in | Result |
|---|---|---|---|
| SCN-B003-01 | `static.integration.mjs:24` | TPH-2, TPH-4, TPH-7 | PASS |
| SCN-B003-02 | `static.integration.mjs:24` (asserts L53/59/69/75) | TPH-2, TPH-7 | PASS |
| SCN-B003-03 | `static.integration.mjs:24` (asserts L96/97/99, 2nd `openBriefView` at L93) | TPH-2, TPH-7 | PASS |
| SCN-B003-04 | `spec.mjs:224` + file-unmodified check | TPH-3 | PASS (13/13, sha256 identical) |

**Test Plan coverage — 4 of 4 declared rows executed:**

| Row | Command | Evidence | Result |
|---|---|---|---|
| TP-B003-01 | `node --test tests/distributed-briefs.static.integration.mjs` | TPH-2 | pass 1 / fail 0, exit 0 |
| TP-B003-02 | `npx --no-install playwright test tests/distributed-briefs.spec.mjs …` | TPH-3 | 13 passed, exit 0 |
| TP-B003-03 | `node scripts/selftest.mjs` | TPH-8 | 952 passed / 0 failed, exit 0 |
| TP-B003-04 | `node --test tests/simple-production-bridge.integration.mjs` | TPH-10 | 6 pass / 0 fail, wired (19), exit 0 |

**Honest coverage observations (declared, not papered over):**

1. **Three scenarios share one test function.** SCN-B003-01, SCN-B003-02 and SCN-B003-03 all
   resolve to the single test `static loader verifies coherent current objects and fetches
   history only after selection`. Their assertions are genuinely distinct and all execute
   (L39/41 visibility+ready, L53/59/69/75 network windows, L96/97/99 integrity), but they do
   **not** fail in isolation — one failure reds all three scenario ids. This is what the
   packet declares and what the upstream Feature 002 test authored; this phase records it
   rather than claiming per-scenario isolation the suite does not provide.
2. **SCN-B003-04's `linkedTests` names only sibling #13**, while the scenario text asserts
   "all 13 pass". All 13 were run and passed (TPH-3), so the scenario is satisfied, but the
   manifest linkage under-specifies the other 12.
3. **No stress/load test** — correct for this scope. Confirmed against the packet's own
   Gate G026 disposition in [scopes.md](scopes.md): the scope declares no latency/throughput
   budget and adds no runtime code path. Independently, the broad run in TPH-7 did execute
   the family's stress and load files (`authorship.stress` 16/0, `history.load` 8/0,
   `scheduler.stress` PASS) and all were green.

Neither observation blocks the test phase: every declared scenario and every declared Test
Plan row has a real executing test that passed.

### TPH-13 Test-phase verdict

```text
| Test Type   | Category    | Command                                                        | Total | Passed | Failed | Skipped |
|-------------|-------------|----------------------------------------------------------------|-------|--------|--------|---------|
| integration | integration | node --test tests/distributed-briefs.static.integration.mjs      | 1     | 1      | 0      | 0       |
| e2e-ui      | e2e-ui      | playwright tests/distributed-briefs.spec.mjs                     | 13    | 13     | 0      | 0       |
| integration | integration | node --test (37 distributed-briefs files)                        | 61    | 61     | 0      | 0       |
| unit        | unit        | node scripts/selftest.mjs                                        | 952   | 952    | 0      | 0       |
| e2e-ui      | e2e-ui      | playwright simple-production-wiring + simple-models              | 4     | 4      | 0      | 0       |
| integration | integration | node --test tests/simple-production-bridge.integration.mjs       | 6     | 6      | 0      | 0       |
| adversarial | bugfix-RED  | mutated (click removed) node --test static.integration           | 1     | 0      | 1      | 0       |
```

**✅ TESTED.** Every selected suite passed with exit 0, zero skips and zero failures; the
adversarial mutation reproduced the original defect exactly (exit 1) and the file was
restored byte-for-byte (sha256 identical, `git diff` empty). The reconciliation is proven
additive and non-weakening.

**Scope of this verdict.** `test` is one phase of the `bugfix-fastlane` chain. The packet
remains `in_progress` and is **not** certifiable from here: `regression`, `simplify`,
`stabilize`, `security` and an independent `audit` are still unexecuted, and certification
remains validate-owned. This phase changed no certification field and no status.

---

## Regression Phase (bubbles.regression)

**Agent:** bubbles.regression · **Executed:** 2026-07-29 · **Verdict:** 🟢 REGRESSION_FREE

Delta under review: fix commit `8206c89c`, `+13 / −0`, a single purely-additive
`openBriefView()` helper in **one Feature 002-authored test file**. No product, shell,
or source file changed. `git diff --stat HEAD -- tests/` is empty at regression time,
so the tree under test is byte-identical to the committed fix.

### RG-0 Repository-binding preflight

**Claim Source:** direct execution, this session.

```text
$ bash .github/bubbles/scripts/repo-binding-preflight.sh \
    --repo-root ~/research-lab --agent-source research-lab
[repo-binding-preflight] OK — agent source 'research-lab' matches target repo 'research-lab'.
PREFLIGHT_EXIT=0
```

### RG-1 Corrected test-path finding (evidence-integrity, NOT a product regression)

The regression request named `tests/distributed-briefs-scope10.spec.mjs` as the
reconciled straggler. **That file does not exist**, and it is not the file the fix
touched. Recording a green result against it would have been fabricated evidence, so
the path was corrected against the commit itself before any baseline was accepted.

```text
$ ls -la tests/distributed-briefs-scope10.spec.mjs
ls: cannot access 'tests/distributed-briefs-scope10.spec.mjs': No such file or directory
ls_exit=2

$ git show --stat --oneline 8206c89c | tail -3
 .../uservalidation.md                              |  13 +
 tests/distributed-briefs.static.integration.mjs    |  13 +
 8 files changed, 1157 insertions(+)

$ grep -rn 'TP-10-02' tests/
tests/web-evidence.functional.mjs:5: * Feature 012 Scope 10 — TP-10-02 acquisition functional tests.
tests/distributed-briefs.static.integration.mjs:2: * Feature 002 Scope 10 — TP-10-02 integration (node --test + real browser).
```

The real reconciled file is **`tests/distributed-briefs.static.integration.mjs`** — a
`node --test` file, not a Playwright spec — exactly as commit `8206c89c` states. This
matches the `test` phase's own TPH-13 table above, which already cites the correct file.

**Silent-pass hazard actually demonstrated.** Playwright exits **0** when *one* of
several file arguments matches nothing, so the requested combined invocation reports a
clean `13 passed` while contributing **zero** tests from the intended file:

```text
$ npx --no-install playwright test tests/distributed-briefs-scope10.spec.mjs \
    tests/distributed-briefs.spec.mjs --config=playwright.config.mjs \
    --project=system-chrome --reporter=list
Running 13 tests using 1 worker
  ✓   1 …wer keep official close separate and disclose comparable volume (957ms)
  ✓  13 …y source receives the shared mount with no page-specific branch (456ms)
  13 passed (11.1s)
EXIT_CODE=0

$ npx --no-install playwright test tests/distributed-briefs-scope10.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
Error: No tests found.
Make sure that arguments are regular expressions matching test files.
EXIT_SCOPE10=1
```

All 13 tests in the combined run came from `distributed-briefs.spec.mjs` alone (RG-3).
The reconciled test is therefore verified separately and explicitly in RG-2.

### RG-2 Reconciled TP-10-02 — the actual fixed test

**Claim Source:** direct execution, this session.

```text
$ node --test tests/distributed-briefs.static.integration.mjs
✔ static loader verifies coherent current objects and fetches history only after selection (6556.265115ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6738.248369
EXIT_CODE=0
```

1 pass / 0 fail / 0 skipped, exit 0 — reproduces the commit's stated GREEN result.

### RG-3 Feature 002 sibling suite — cross-spec conflict check

The reconciliation touched **only** a Feature 002-authored test file (header:
`Feature 002 Scope 10 — TP-10-02`). No Feature 012 test, no shared helper, no product
module. The single credible cross-spec risk is therefore Feature 002's own suite, run
here in isolation:

```text
$ npx --no-install playwright test tests/distributed-briefs.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
Running 13 tests using 1 worker
  ✓   1 …wer keep official close separate and disclose comparable volume (797ms)
  ✓   2 … the exact published pre-market thesis with owner read evidence (451ms)
  ✓   3 …inal never labels a partial regular print as the official close (550ms)
  ✓   4 …erve official close and label every post-close print indicative (563ms)
  ✓   5 … strips use explicit calendar boundaries and next valid session (752ms)
  ✓   6 …ming to released without stale actual or post-release consensus (803ms)
  ✓   7 …ay separate and revisions append without rewriting the original (881ms)
  ✓   8 … and history exclude look-ahead and retain immutable chronology (494ms)
  ✓   9 …ed unusual evidence remains context and consumes no action slot (447ms)
  ✓  10 …emains truthful and non-current failures cannot replace current (996ms)
  ✓  11 …fetches only the selected partition and opened evidence objects (587ms)
  ✓  12 …ory UI is accessible safe and stable at desktop mobile and zoom (653ms)
  ✓  13 …y source receives the shared mount with no page-specific branch (361ms)
  13 passed (10.4s)
EXIT_SIBLINGS=0
```

**No cross-spec conflict.** Feature 002's own 13-test suite is fully green after the
change to its file. There is no route collision, no shared-table mutation, no API
contract change, and no shared-component modification — the delta cannot reach any
other spec because it is confined to one test body's view-navigation preamble.

### RG-4 Full project selftest — coverage regression check

**Claim Source:** direct execution, this session.

```text
$ node scripts/selftest.mjs
  ✓ etf-momentum-lab.html: delegates etfCompositeScore to the single source
  ✓ etf page carries no inline composite-score formula (single-sourced to RLMACROROTATION)
  ✓ etfMomentumSignal is byte-parity with the owner trailing/blend signal (null when absent)
  ✓ etfCompositeScore is byte-parity with the owner composite (raw/balanced weights, null when no momentum)

Feature 012 Scope 08 RLJOURNEY runtime + all-tool + no-execution canaries
  ✓ RLJOURNEY validates all 22 ordinary tools (>=2 goals) + the 4 Market Action Center goals across 48 definitions
  ✓ the 48-definition journey registry compiles under the runtime
  ✓ a function value anywhere in Journey data is rejected (no-executable-code invariant)
  ✓ a signed-off JourneyCompletionPacket records review locally and executes NOTHING (no execution entry point exists)
  ✓ backtracking an assumption stales only its transitive dependent (b) and preserves the unrelated completed step (d)
...
================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
EXIT_CODE=0
```

**952 passed / 0 failed**, exit 0 — identical to the declared baseline. Zero coverage
regression: the suite total did not drop, no test became `skip`/`todo`, and the fix
added no test-count delta (it is a helper inside an existing test body).

### RG-5 Simple-view production wiring + model adapters

**Claim Source:** direct execution, this session.

```text
$ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
    tests/simple-models.spec.mjs tests/simple-model-adapters-market.spec.mjs \
    tests/simple-model-adapters-macro-fundamental.spec.mjs \
    tests/simple-model-adapters-strategy-property.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1
Running 27 tests using 1 worker
  ✓   1 … rotation Simple controls recompute owner transition and ETF fit (1.5s)
  ✓  10 …mple auction controls recompute from truthful snapshot evidence (570ms)
  ✓  14 …trols recompute without trade-side inference or new chain owner (20.4s)
  ✓  23 …controls recompute bounded action or no-action inside Brief only (2.5s)
  ✓  24 …r stays unavailable without defaults fetch or fabricated result (611ms)
  ✓  25 …ast valid run across invalid stale missing and non-finite input (579ms)
  ✓  26 … under Power (Simple stays honest-unavailable, nothing deleted) (448ms)
  ✓  27 …imple renders the real adapter panel in the real owner-mode flow (1.5s)
  27 passed (45.0s)
EXIT_CODE=0
```

27 passed / 0 failed, exit 0. Test 23 (`…recompute bounded action or no-action inside
Brief only`) is the shell Brief-view contract asserted from the Feature 012 side and is
green — the two contracts remain mutually consistent, confirming the fix's premise.

### RG-6 Simple production bridge — integration (TP-15-02 wired count)

**Claim Source:** direct execution, this session.

```text
$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (59.062252ms)
✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (1141.410374ms)
✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (1040.968655ms)
✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1640.853366ms)
✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (63.118549ms)
✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (34.378072ms)
ℹ tests 6
ℹ pass 6
ℹ fail 0
ℹ skipped 0
EXIT_INTEGRATION=0
```

**6/6 passed**, `[TP-15-02] wired (19)`, exit 0 — exact baseline match. The wired-tool
set is registry-derived, so an unnoticed shell/mount regression would have moved this
count; it did not.

### RG-7 Simple production bridge — unit

**Claim Source:** direct execution, this session.

```text
$ node --test tests/simple-production-bridge.unit.mjs
✔ renderSimpleBridge is exposed on the production API (8.655393ms)
✔ provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused (31.168876ms)
✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (6.510295ms)
✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (11.521591ms)
✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (5.326696ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 169.356872
EXIT_UNIT=0
```

**5/5 passed**, exit 0 — exact baseline match.

### RG-8 Palm Springs rental market lab — GitHub Pages deploy gate

**Claim Source:** direct execution, this session.

```text
$ npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
Running 29 tests using 1 worker
  ✓   1 …002 missing configuration blocks payload fetch and every output (507ms)
  ✓   2 …: SCN-005-004 invalid payload produces errors and no conclusion (356ms)
  ✓   6 …duction unavailable financing fails loud without numeric output (661ms)
  ✓  19 …5-003 stale research stays stale in Simple Power and owner read (696ms)
  ✓  20 …: SCN-005-005 pair levers recompute with zero post-boot requests (2.8s)
  ✓  23 …both routes keep desktop mobile Simple Power decisions identical (4.3s)
  ✓  26 …05-019 market and segment switching commits one matching result (935ms)
  ✓  27 …24 Ocean Shores coastal inputs change nights costs and cash flow (1.0s)
  ✓  28 …05-025 Palm Springs luxury keeps legal and operating boundaries (637ms)
  ✓  29 …n cockpit — model + sliders in Simple, deep-dive lives in Power (669ms)
  29 passed (26.5s)
EXIT_CODE=0
```

**29 passed / 0 failed**, exit 0 — exact baseline match. The deploy gate is clear.

### RG-9 Regression verdict

| # | Check | Baseline | Observed | Exit | Status |
|---|-------|----------|----------|------|--------|
| RG-0 | repo-binding preflight | OK | OK | 0 | 🟢 |
| RG-2 | TP-10-02 reconciled test (`distributed-briefs.static.integration.mjs`) | 1/0 | 1 pass / 0 fail | 0 | 🟢 |
| RG-3 | Feature 002 siblings (`distributed-briefs.spec.mjs`) | 13 | 13 passed | 0 | 🟢 |
| RG-4 | `scripts/selftest.mjs` | 952 / 0 | 952 passed / 0 failed | 0 | 🟢 |
| RG-5 | simple wiring + 4 adapter suites | green | 27 passed | 0 | 🟢 |
| RG-6 | bridge integration | 6/6, wired 19 | 6/6, wired (19) | 0 | 🟢 |
| RG-7 | bridge unit | 5/5 | 5/5 | 0 | 🟢 |
| RG-8 | palm-springs (Pages deploy gate) | 29 | 29 passed | 0 | 🟢 |

**Test-baseline delta:** zero. No previously-passing test now fails; no suite total
decreased; no new `skip`/`todo`/`ignore` marker was introduced.

**Cross-spec impact:** one file changed (`tests/distributed-briefs.static.integration.mjs`,
Feature 002-authored). Its owning suite is green (RG-3) and the Feature 012 side of the
same contract is green (RG-5 test 23). No route collision, shared-table mutation, API
contract change, or shared-component modification exists in the delta.

**Design coherence:** no `design.md` in any spec changed; the fix is test-side only and
ratifies the already-committed `ordinary-four-view/v1` Brief-view contract rather than
contradicting it.

**Coverage regression:** none (RG-4, 952/952 unchanged; the fix adds no test and removes
no assertion — diff is `+13/−0`, all helper lines).

**Deployment regression scan:** **N/A** — this repo is build-free GitHub Pages with no
`deploy/`, no `.github/workflows/build.yml` image build, and no `scripts/deploy/`. No
deployment surface appears in the delta. The Pages deploy gate itself (RG-8) is green.

## 🟢 REGRESSION_FREE

```text
All regression checks passed.

Test baseline: 952/952 selftest + 13 F002 e2e + 1 TP-10-02 + 27 simple + 6 bridge-int
               + 5 bridge-unit + 29 palm-springs  (stable — zero delta)
Cross-spec conflicts:   0
Design contradictions:  0
Coverage:               952 passed / 0 failed (unchanged)
Deployment regressions: N/A (build-free Pages repo; deploy gate green)
```

**One non-blocking finding, recorded not suppressed:** the regression request named a
non-existent spec file (RG-1). No product defect; it is corrected here so no future
reader mistakes the combined-command `13 passed` for proof that the reconciled test ran.

**Scope of this verdict.** `regression` is one phase of the `bugfix-fastlane` chain.
`simplify`, `stabilize`, `security` and an independent `audit` remain unexecuted, and
certification stays validate-owned. This phase changed **no** source file, **no** test
file (`git diff HEAD -- tests/` empty), **no** certification field, and **no** status.

---

## Simplify Phase (bubbles.simplify)

Owner: `bubbles.simplify`. Repository-binding preflight passed first
(`repo-binding-preflight.sh --repo-root <repo> --agent-source research-lab`, exit 0).

### Verdict: NO SIMPLIFICATION WARRANTED — zero files changed

### What was reviewed

The fix commit `8206c89c` diff **only**: `+13 / −0` in a single file,
`tests/distributed-briefs.static.integration.mjs` — the `openBriefView()` helper
(6 comment lines + 3 code lines) and its two call sites. Compared line-by-line
against the sibling helper it cites, `tests/distributed-briefs.spec.mjs::mountReady`
(lines 19–27), and against the shared module both files already import,
`tests/distributed-briefs.support.mjs`.

Review dimensions: duplication vs the sibling helper, dead code, over-complication,
naming, and whether the preamble is the simplest correct expression of the contract.

### Finding 1 — duplication is 2 lines, and extraction would make it worse, not better

`openBriefView(page)` and `mountReady(page, ctx, toolId)` are **not** the same
function. `mountReady` owns navigation (`page.goto`) plus the view switch plus the
mount wait. `openBriefView` owns **only** the view switch, because the static
integration test cannot delegate navigation: it must install its
`page.on('response', …)` cache-header listener **before** `goto`, and its second
(corrupt-fixture) block navigates a *different* server. The two overlapping lines are
the shell-ready wait and the tab click.

`tests/distributed-briefs.support.mjs` is a real shared module imported by both
files, so one-sided extraction is *possible*. It is not *net-positive*: the sibling
`mountReady` is Feature-002-owned and outside this diff's scope, so its inline copy
would remain. The result would be **three** locations (support export + sibling copy
+ an import hop) in place of two. Two-sided extraction would require editing a
sibling-owned test file that this bug did not touch — out of scope, and it is the
same file family whose blast radius the regression phase deliberately bounded.

**Claim Source:** executed

```
$ grep -rn 'data-rlview-mode="brief"' --include='*.mjs' --include='*.js' --include='*.html' . | grep -v node_modules
./tests/distributed-briefs.spec.mjs:25:    await page.locator('#rlviews button[data-rlview-mode="brief"]').click();
./tests/distributed-briefs.static.integration.mjs:21:    await page.locator('#rlviews button[data-rlview-mode="brief"]').click();

$ grep -rn 'data-rlexperience-shell="ready"' --include='*.mjs' . | grep -v node_modules | wc -l
25
$ grep -rln 'data-rlexperience-shell="ready"' --include='*.mjs' . | grep -v node_modules | wc -l
12
```

The brief-tab click exists in exactly **2** places — the diff proliferated nothing.
The shell-ready gate is inlined in **25 places across 12 test files** — the two brief
files plus **10 others** (`volatility-sizing-lab`, `tool-experience`,
`company-fundamentals-lab`, `bond-regime-lab`, `simple-models`,
`simple-production-wiring`, `tool-experience-mobile`,
`tool-experience-shell.functional`, `simple-model-adapters-macro-fundamental`,
`simple-model-adapters-market`). Inlining that wait is the **established house
idiom**. Hoisting it into a shared export for these two files alone would make them
the inconsistent outlier among twelve.

### Finding 2 — no dead code, no over-complication, correct naming

- **Dead code:** none. `openBriefView` has exactly two call sites (lines 37 and 92),
  both reached; every line of the helper executes on both paths.
- **Complexity:** two statements, no branching, no `try`/`catch`, no options object,
  no return value. There is no smaller correct form — dropping the
  `#rlviews[data-rlexperience-shell="ready"]` gate would let the click race a
  partially-initialized shell, which weakens the test and diverges from the sibling.
- **Naming:** `openBriefView` states precisely what it does and nothing more.
  It deliberately does **not** reuse the name `mountReady`, which would over-promise
  (that helper also navigates and waits for the mount). Distinct responsibility,
  distinct name — correct, not inconsistent.
- **Timeouts:** the new shell-ready wait uses `20000`, matching the sibling exactly.
  The pre-existing mount waits stayed at `15000` — untouched by the diff, neither
  weakened nor silently retuned.
- **Comment ratio (6 lines of comment : 3 of code):** justified. The comment is pure
  *why*, per repo policy: it records the product contract, cites the ratifying
  sibling, and — the genuinely non-obvious part — pins the **ordering invariant**
  that the switch must precede every network-window baseline
  (`no history partition before Open history`, `beforePower`). A future editor moving
  the call would otherwise silently corrupt the request-accounting assertions. This
  comment prevents a real, non-obvious regression and earns its place.

### Finding 3 — the preamble is the simplest correct expression of the contract

The bug was that TP-10-02 asserted visibility of a mount the Feature 012 shell
reparents into the hidden Brief panel. The minimal correct fix is to drive the real
user-facing control into the Brief view before asserting — which is exactly what the
13 sibling tests already do. The diff is additive, changes no assertion, no
`visible` semantics, and no timeout. There is no smaller change that still proves
the contract.

### What was changed

**Nothing.** No source file, no test file, no documentation outside this report
section, no `state.json` field other than appending `"simplify"` to
`completedPhases`. Because no code changed, the `node --test` / `scripts/selftest.mjs`
re-run gate does not apply; the regression-phase baselines (selftest 952 passed /
0 failed, reconciled test 1 pass) remain the current, unperturbed truth.

**Claim Source:** executed

```
$ git --no-pager status --porcelain -- tests/distributed-briefs.static.integration.mjs tests/distributed-briefs.spec.mjs tests/distributed-briefs.support.mjs
(no output — all three files byte-identical to commit 8206c89c)
```

Inventing a refactor here would have added an abstraction the repo's own twelve-file
convention rejects, in order to look busy. "No simplification warranted" is the
honest and correct outcome for a 13-line, contract-conforming test fix.

**Correction recorded, not silently fixed:** the two counts above were first drafted
from a visual read of prior output as `24` / `11`. They were then re-derived by
executing the exact commands shown, which returned `25` / `12`. The executed values
are what stand. The conclusion is unaffected (the idiom is more widespread, not less).

### Scope of this verdict

`simplify` is one phase of the `bugfix-fastlane` chain. `stabilize`, `security` and
an independent `audit` remain unexecuted, and certification stays validate-owned.
This phase changed **no** source file, **no** test file, **no** certification field,
and **no** status.
