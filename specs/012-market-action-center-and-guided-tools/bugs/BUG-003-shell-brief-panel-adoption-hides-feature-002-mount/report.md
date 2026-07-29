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

---

## Stabilize Phase (bubbles.stabilize)

**Executed:** 2026-07-29 · **Agent:** `bubbles.stabilize` · **Mode:** `bugfix-fastlane`
**Change surface under assessment:** `tests/distributed-briefs.static.integration.mjs`
(+13 / −0, commit `8206c89c`). Test-side only; zero product/shell/config/page files.

### Applicability triage (stated before findings, not after)

Research Lab is a **build-free static site** served by GitHub Pages: no build step, no
services, no containers, no orchestrator, no database, no deploy pipeline beyond the
Pages workflow. The following standard stabilize domains are therefore **N/A**, and are
listed explicitly so their absence is not mistaken for an unperformed check:

| Domain | Verdict | Why |
|---|---|---|
| Container/runtime health, restart loops, startup order | **N/A** | No containers. No `docker-compose.yml`, no service runtime in this repo. |
| Deployment reliability beyond Pages | **N/A** | Only deploy path is `.github/workflows/pages.yml` → `upload-pages-artifact` on repo root. Assessed under Category 3. |
| Configuration drift / generated-config pipeline | **N/A** | No config generation step. `tool-experience.config.json` is a committed, hand-authored static asset consumed by the browser. |
| DB connection pools, N+1 queries, query plans | **N/A** | No database, no server-side data layer. |
| Backpressure, retries, timeouts, idempotency of a service tier | **N/A** | No service tier. Client-side fetch of static JSON only. |
| Build reproducibility / toolchain pinning | **Not a finding — already sound** | No build step to make reproducible. The one pinned toolchain that matters (the Playwright runner) is version-gated in CI (`Version 1.61.1`) and matched locally (evidence E4). |
| Resource usage (memory/CPU/FD/log volume) of a deployed process | **N/A** | Nothing is deployed as a process. Client-side per-page cost is assessed under Category 1. |

The three categories that genuinely apply are assessed below.

---

### Category 1 — Runtime/perf risk of the shell reparent

**Question:** does `panel.appendChild(ANCHOR)` in `rlviews.js` introduce reflow,
observer, or listener risk, double-mount, or a leak?

**Verdict: 🟢 no defect found.** Five independent structural properties were verified
mechanically (not inferred), each of which independently bounds the risk:

**1. The reparent happens OFF-DOM → it causes no layout thrash.**
`buildPanels()` creates `panel` via `document.createElement` (rlviews.js:121), moves the
anchor into it at line 126, and only appends `panel` to the document at line 138. The
`appendChild(ANCHOR)` therefore mutates a **detached** subtree. The single reflow is the
one body append, which occurs for every panel regardless of the brief. Evidence E6[G].

**2. It executes exactly once per page → no double-mount.**
`MODES` is `SHELL.viewIds`; `tool-experience.config.json` authors
`["simple","power","brief","journey"]` for `ordinary-four-view/v1` and
`["brief","portfolio","red-alert","journey"]` for the Center — `"brief"` appears
**exactly once** in each, so the `mode === "brief"` branch runs once per `buildPanels()`
call. `build()` itself is single-entry: guarded by `root.__rlviewsInit` (rlviews.js:6,9)
and dispatched through an `if/else` on `readyState` (line 276-277), never both. Evidence E6[C][D].

**3. `appendChild` MOVES, it does not clone → no orphan, no duplicated listeners.**
The anchor is the same node object before and after; `rlviews.js` attaches **no**
listeners to `ANCHOR` at all (its only `addEventListener` calls are on `shellControl`,
lines 235/239, and `popstate`, line 266). Nothing to duplicate, nothing to leak.

**4. The consumer is independently idempotent → even a hypothetical re-mount is safe.**
`BriefMount()` short-circuits on either `data-rlbrief-ready="1"` or
`data-rlbrief-mounting="1"` **before** creating its `.rlbrief-mount` child
(rlbrief.js:1570-1574). So duplicate `.rlbrief-mount` children are structurally
impossible even if the anchor were reparented repeatedly. Evidence E6[E].

**5. No visibility-gated observer exists → the reparent cannot stall the load.**
`rlbrief.js` contains **0** `IntersectionObserver` and **0** `ResizeObserver`
(evidence E6[B]). The brief loads irrespective of whether its panel is displayed. This is
the load-bearing corroboration of the fix's premise: the mount was **loading correctly
all along and was merely not visible**, so a tab click is the semantically correct
remedy — the bug was never a load failure being papered over.

**Bounded observations (reported for completeness; neither is a defect):**

- **One observer wakes on every view switch.** `rlbrief.js:1506-1509` installs a
  `MutationObserver` on `document.body` with `{attributes:true, attributeFilter:["class"]}`
  (no `subtree`), and `applyVisual()` toggles three body classes per switch
  (`power`, `rlv-brief`, `rlv-focused`). Each switch therefore fires one batched callback
  whose entire body is a `classList.contains()` test plus a possible property set — O(1),
  and it is a single instance per page (guaranteed by the BriefMount guard in point 4).
  It is never disconnected, but its lifetime is the page's. **Not a leak.**
- **Hidden panels use `display:none`, not `visibility:hidden`**
  (`[data-rlexperience-panel][hidden]{display:none!important}`, rlviews.js:53). This is
  strictly *better* for perf — the unselected brief subtree is excluded from the layout
  tree entirely and costs zero layout/paint. The trade is a single one-time layout of the
  brief subtree when its tab is first selected; for a brief-sized DOM this is negligible
  and bounded. Evidence E6[H].

**Additional soundness confirmation of the fix itself:** the fix's inline comment claims
the view switch "issues no brief request of its own, so it is placed BEFORE every
network-window baseline below … and cannot invalidate them." That claim is load-bearing —
if false, the test's cache-header and history-partition assertions would be corrupted.
It is **true**: `rlviews.js` contains **0** occurrences of `fetch(`, `XMLHttpRequest`,
`.src =`, or dynamic `import(` (evidence E6[F]). The shell is network-silent.

---

### Category 2 — Determinism / flake risk of the added tab click

**Question:** the fix adds a tab click plus a visibility wait. Is it deterministic under load?

**Verdict: 🟢 deterministic; 8/8 green including 3 runs under 2× core oversubscription.**

The added helper is:

```js
async function openBriefView(page) {
    await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 20000 });
    await page.locator('#rlviews button[data-rlview-mode="brief"]').click();
}
```

**Why this is structurally sound (not merely observed-green):** it waits on the shell's
**own** readiness attribute write before acting, rather than sampling instantaneously.
This is exactly the pattern that resolved the separate `driveSimple` race in
`tests/simple-model-adapters-*.spec.mjs` this session. The downstream wait
(`[data-rlbrief-mount][data-rlbrief-ready="1"]`) is likewise anchored to a
component-authored settled-state attribute — `rlbrief.js:1204-1207` documents in-source
that `data-rlbrief-ready` "signals a SETTLED load attempt, so it is set on terminal
states only — a consumer that waits for `data-rlbrief-ready="1"` must not race the load."
Both waits are edge-triggered on producer writes; neither polls a derived value.

**Empirical margin (measured, evidence E5 and E7):**

| Condition | Runs | Result | Elapsed | Budget | Headroom |
|---|---|---|---|---|---|
| Idle | 5 | 5 pass / 0 fail, exit 0 ×5 | 2229–2475 ms | 15 000 ms mount wait | ~6.5× |
| loadavg ≈ 8–12 (16 CPU burners on 8 cores) | 3 | 3 pass / 0 fail, exit 0 ×3 | 6094–6209 ms | 15 000 ms mount wait | ~2.5× |

Idle spread is ±5 % across five runs — no bimodality, no outliers, i.e. no latent race
manifesting intermittently. Under deliberate 2× CPU oversubscription the suite degrades
by ~2.65× and still clears the budget with ~2.5× to spare. **Reported honestly: the
margin is real but it is not unbounded** — a CI runner roughly 6× slower than this host's
idle baseline would begin to encroach on the 15 s wait. That budget is pre-existing and
unchanged by this fix (the fix altered no timeout), so this is a property of the suite,
not a regression the fix introduced.

**Fail-closed analysis of the click's silent-failure paths.** Two paths exist where the
click performs no state change:
- `selectMode()` early-returns when `mode === current` (rlviews.js:202). Reachable only
  if the page already booted into the Brief view, in which case the panel is already
  visible and the subsequent assertion passes correctly.
- `selectMode()` early-returns when `transition.ok` is false (rlviews.js:216).

In **both** cases the failure mode is that the mount never becomes visible, so
`waitForSelector(..., {timeout: 15000})` times out and the test goes **RED**. Neither
path can produce a false GREEN. The fix is fail-closed.

**One latent ordering smell — verified NOT currently reachable, reported so it is on the
record rather than discovered later.** In `buildControl()`, the shell publishes its
readiness contract *before* it wires its click handler:

- line 228 — `setAttribute("data-rlexperience-shell", "ready")`
- line 233 — `appendChild(shellControl)` → the element enters the DOM already carrying `ready`, so `waitForSelector` can match here
- line 235 — `addEventListener("click", …)` → handler attached only now

A test that matched at line 233 and clicked before line 235 would dispatch onto a
button with no handler. **This is not reachable today**: lines 223–253 contain **zero**
`await` / `async` / `setTimeout` / `setInterval` / `requestAnimationFrame` / `Promise` /
`queueMicrotask` boundaries (mechanically counted, evidence E6[A]), so append-and-wire is
one synchronous task. A browser cannot dispatch input, and Playwright's selector polling
cannot run, mid-task. The 8/8 green runs are consistent with this.

**It would become a genuine race the moment any async boundary is introduced between
lines 233 and 235.** Recommended (NOT applied here — stabilize is diagnostic and this
bug's mandate is test-side only): move the `data-rlexperience-shell="ready"` write to
*after* the two `addEventListener` calls, so the published contract means "wired", not
merely "rendered". Filing this as a hardening note for the Feature 012 shell owner; it is
**not** a defect in BUG-003 and does not block this bug.

---

### Category 3 — Pages deploy risk

**Question:** does the Pages gate pass?

**Verdict: 🟢 pass — 29/29, exit 0.**

The gate was confirmed by reading `.github/workflows/pages.yml` rather than assumed: job
`verify` runs `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs
--config=playwright.config.mjs --project=system-chrome --reporter=list`, and job `deploy`
declares `needs: verify` — so a red gate blocks the Pages deploy. Executed locally with
the same runner version the workflow pins (`Version 1.61.1`, asserted by the workflow's
own version check and matched locally, evidence E4): **29 passed, exit 0** (evidence E2).

The workflow's two other guards were noted but are unaffected by a test-only change:
`node scripts/validate-node-source-lock.mjs` (dependency source lock) and the runner
version assertion. The deploy step uploads the repo root verbatim — since this fix touches
only `tests/`, which is not consumed by any page at runtime, **the deployed artifact is
byte-identical in behaviour**.

---

### Scope-integrity attestation for this phase

- `git status --porcelain -- tests/` returned **empty** (evidence E5): the tree under
  test is byte-identical to `HEAD`, so every result above describes committed code, not
  local drift.
- This phase modified **no** source file, **no** test file, **no** certification field,
  and **no** status. It appended this section to `report.md` and added `"stabilize"` to
  `completedPhases` in `state.json`. Nothing else.
- No file outside this bug folder was written. `specs/002-*`, `specs/013-*`, `specs/014-*`,
  `specs/015-*`, `specs/016-*` were not read for mutation and not touched.

### Real defects found

**One latent (not currently reachable) ordering smell**, Category 2: `rlviews.js` publishes
`data-rlexperience-shell="ready"` at line 228/233 before wiring its click listener at line
235. Mechanically verified non-reachable today (zero async boundaries in that window).
**Reported, not fixed** — it is shell/product code, outside this bug's test-only mandate.
Owner: Feature 012 shell.

**No other defect found.** No fabricated finding is recorded for the N/A domains above.

---

## 🟢 STABLE

All applicable stability domains clean. 71 tests executed across three suites plus an
8-run determinism probe; every run exit 0. One latent (non-reachable) ordering smell
reported to the Feature 012 shell owner; zero blocking findings for BUG-003.

```
Domains audited (applicable): reparent runtime/perf, determinism/flake, Pages deploy
Domains declared N/A (no service tier / no build / no containers): 7 — enumerated above
Blocking issues found: 0
Latent non-blocking observations reported: 1
Files changed by this phase: report.md, state.json (this bug folder only)
```

---

### Stabilize Evidence

#### E1 — Repository-binding preflight (Claim Source: EXECUTED 2026-07-29)

```
$ bash .github/bubbles/scripts/repo-binding-preflight.sh \
    --repo-root <repo-root> --agent-source research-lab
[repo-binding-preflight] OK — agent source 'research-lab' matches target repo 'research-lab'.
EXIT=0
```

#### E2 — Required command 1/3: sibling brief suite (Claim Source: EXECUTED 2026-07-29)

```
$ npx --no-install playwright test tests/distributed-briefs.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 13 tests using 1 worker

  ✓   1 …wer keep official close separate and disclose comparable volume (604ms)
  ✓   2 … the exact published pre-market thesis with owner read evidence (373ms)
  ✓   3 …inal never labels a partial regular print as the official close (458ms)
  ✓   4 …erve official close and label every post-close print indicative (450ms)
  ✓   5 … strips use explicit calendar boundaries and next valid session (543ms)
  ✓   6 …ming to released without stale actual or post-release consensus (694ms)
  ✓   7 …ay separate and revisions append without rewriting the original (677ms)
  ✓   8 … and history exclude look-ahead and retain immutable chronology (379ms)
  ✓   9 …ed unusual evidence remains context and consumes no action slot (358ms)
  ✓  10 …emains truthful and non-current failures cannot replace current (785ms)
  ✓  11 …fetches only the selected partition and opened evidence objects (470ms)
  ✓  12 …ory UI is accessible safe and stable at desktop mobile and zoom (489ms)
  ✓  13 …y source receives the shared mount with no page-specific branch (253ms)

  13 passed (8.4s)
EXIT=0
```

> Note recorded for accuracy: this file is the **sibling** suite whose `mountReady()`
> already clicked the Brief tab — it is the contract TP-10-02 was reconciled *to*. It is
> not the file the fix edited. The edited file is exercised separately in E5/E7.

#### E3 — Required command 2/3: Pages deploy gate (Claim Source: EXECUTED 2026-07-29)

```
$ npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 29 tests using 1 worker

  ✓   1 …002 missing configuration blocks payload fetch and every output (626ms)
  ✓   2 …: SCN-005-004 invalid payload produces errors and no conclusion (375ms)
  ✓   3 …06 occupancy equation clamps and rejects an invalid denominator (472ms)
  ✓   4 …005-008 buyer economics use standard amortization in one result (478ms)
  ✓   5 …86:1 › Regression: SCN-005-009 zero-rate financing stays finite (518ms)
  ✓   6 …duction unavailable financing fails loud without numeric output (627ms)
  ✓   7 …ression: SCN-005-020 five bedrooms alone never qualifies luxury (381ms)
  ✓   8 …Regression: SCN-005-021 sparse segment evidence remains visible (369ms)
  ✓   9 …22 whole-market values never become observed luxury performance (414ms)
  ✓  10 …on: SCN-005-023 deltas require aligned market and segment bases (377ms)
  ✓  11 …ed payload exposes four truthful units and no fixture authority (527ms)
  ✓  12 …013 compared refresh accounts for every material entity by pair (466ms)
  ✓  13 …egression: SCN-005-014 baseline refresh invents no prior change (471ms)
  ✓  14 …N-005-015 inaccessible research remains unknown without a value (471ms)
  ✓  15 …bserved assumptions inference and modeled outputs stay distinct (446ms)
  ✓  16 …026 refresh accounts independently for all four mandatory units (453ms)
  ✓  17 …acquisition baselines disclose sample status and legal unknowns (449ms)
  ✓  18 …emaining-2026 and 2027 scenarios remain falsifiable not factual (617ms)
  ✓  19 …5-003 stale research stays stale in Simple Power and owner read (566ms)
  ✓  20 …: SCN-005-005 pair levers recompute with zero post-boot requests (2.7s)
  ✓  21 …mpatible occupancy definitions remain separate and unaggregated (568ms)
  ✓  22 …5-010 negative cash flow remains signed and explicit everywhere (497ms)
  ✓  23 …both routes keep desktop mobile Simple Power decisions identical (3.8s)
  ✓  24 …2 source inspector resolves provenance and restores exact focus (622ms)
  ✓  25 …gal and active supply remain separate from scenario assumptions (428ms)
  ✓  26 …05-019 market and segment switching commits one matching result (643ms)
  ✓  27 …4 Ocean Shores coastal inputs change nights costs and cash flow (786ms)
  ✓  28 …05-025 Palm Springs luxury keeps legal and operating boundaries (487ms)
  ✓  29 …n cockpit — model + sliders in Simple, deep-dive lives in Power (643ms)

  29 passed (22.4s)
EXIT=0
```

> The per-test `[SCN-005-*]` diagnostic stdout lines emitted between results are omitted
> here for length; every one of the 29 results and the summary line are reproduced verbatim.

#### E4 — Pages gate identity + runner pin (Claim Source: EXECUTED 2026-07-29)

```
$ cat .github/workflows/pages.yml     # relevant excerpt, verbatim
      - name: Verify checkout-local Playwright runner
        run: |
          runner_version="$(npx --no-install playwright --version)"
          printf '%s\n' "$runner_version"
          if [[ "$runner_version" != "Version 1.61.1" ]]; then
            printf 'Expected Version 1.61.1, got %s\n' "$runner_version" >&2
            exit 1
          fi
      - name: Run Palm Springs system Chrome suite
        run: npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
  deploy:
    needs: verify

$ npx --no-install playwright --version
Version 1.61.1
EXIT=0
```

#### E5 — Required command 3/3: repo selftest (Claim Source: EXECUTED 2026-07-29)

Full output is ~20 KB; the exit code was captured separately and the summary tail is
reproduced verbatim.

```
$ node scripts/selftest.mjs > /dev/null 2>&1; echo "selftest EXIT=$?"
selftest EXIT=0

$ node scripts/selftest.mjs 2>&1 | tail -20
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
```

#### E6 — Determinism probe, idle: the file the fix actually changed (Claim Source: EXECUTED 2026-07-29)

```
$ git status --porcelain -- tests/
(empty above = clean)

$ for i in 1 2 3 4 5; do S=$(date +%s%N); node --test tests/distributed-briefs.static.integration.mjs > /tmp/dbsi.$i.log 2>&1; RC=$?; E=$(date +%s%N); \
    echo "run#$i exit=$RC elapsed=$(( (E-S)/1000000 ))ms $(grep -E '^# (pass|fail|skipped)' /tmp/dbsi.$i.log | tr '\n' ' ')"; done
run#1 exit=0 elapsed=2365ms # pass 1 # fail 0 # skipped 0
run#2 exit=0 elapsed=2311ms # pass 1 # fail 0 # skipped 0
run#3 exit=0 elapsed=2475ms # pass 1 # fail 0 # skipped 0
run#4 exit=0 elapsed=2311ms # pass 1 # fail 0 # skipped 0
run#5 exit=0 elapsed=2229ms # pass 1 # fail 0 # skipped 0

$ cat /tmp/dbsi.1.log
TAP version 13
# Subtest: static loader verifies coherent current objects and fetches history only after selection
ok 1 - static loader verifies coherent current objects and fetches history only after selection
  ---
  duration_ms: 2216.034836
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2320.146153
```

#### E7 — Determinism probe UNDER LOAD (Claim Source: EXECUTED 2026-07-29)

16 busy-loop CPU burners spawned on an 8-core host (2× oversubscription), sustained
through three consecutive runs, then killed.

```
$ NPROC=$(nproc); for i in $(seq 1 $((NPROC*2))); do (while :; do :; done) & done
cores=8 — spawning 16 CPU burners to contend

$ cut -d' ' -f1-3 /proc/loadavg
load avg during test: 8.07 7.53 8.21

$ for i in 1 2 3; do S=$(date +%s%N); node --test tests/distributed-briefs.static.integration.mjs > /tmp/load.$i.log 2>&1; RC=$?; E=$(date +%s%N); \
    echo "LOADED run#$i exit=$RC elapsed=$(( (E-S)/1000000 ))ms $(grep -E '^# (pass|fail)' /tmp/load.$i.log | tr '\n' ' ')"; done
LOADED run#1 exit=0 elapsed=6094ms # pass 1 # fail 0
LOADED run#2 exit=0 elapsed=6209ms # pass 1 # fail 0
LOADED run#3 exit=0 elapsed=6111ms # pass 1 # fail 0

$ kill $BURNERS; cut -d' ' -f1-3 /proc/loadavg
burners killed; loadavg now: 11.92 8.40 8.48
```

Degradation under 2× oversubscription: 2.3 s → 6.1 s (≈2.65×), against an unchanged
15 000 ms mount-wait budget. 3/3 pass, exit 0 each.

#### E8 — Structural verification of every Category 1 & 2 claim (Claim Source: EXECUTED 2026-07-29)

Each assertion in this phase was verified by executing a check, not by reading alone.

```
$ echo "[A] async boundary between append(233) and listener(235)? (expect ZERO)"
$ sed -n '223,253p' rlviews.js | grep -cE 'await|async |setTimeout|setInterval|requestAnimationFrame|Promise|queueMicrotask'
0

$ echo "[B] visibility-gated observers in rlbrief.js (expect 0 Intersection/Resize)"
$ echo "IntersectionObserver=$(grep -c 'IntersectionObserver' rlbrief.js) ResizeObserver=$(grep -c 'ResizeObserver' rlbrief.js) MutationObserver=$(grep -c 'new MutationObserver' rlbrief.js)"
IntersectionObserver=0 ResizeObserver=0 MutationObserver=1

$ echo "[C] viewIds (a duplicate 'brief' would double-append)"
$ grep -n '"viewIds"' -A6 tool-experience.config.json
8:      "viewIds": ["simple", "power", "brief", "journey"],
9-      "labels": ["Simple", "Power", "Brief", "Journey"],
10-      "defaultViewId": "simple"
16:      "viewIds": ["brief", "portfolio", "red-alert", "journey"],
17-      "labels": ["Brief", "Portfolio", "Red Alert", "Journey"],
18-      "defaultViewId": "brief"

$ echo "[D] build() re-entry guards"
$ grep -n '__rlviewsInit\|readyState === "loading"' rlviews.js
6:  if (typeof document === "undefined" || root.__rlviewsInit) return;
9:  root.__rlviewsInit = 1;
276:  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);

$ echo "[E] BriefMount idempotency guard"
$ sed -n '1568,1575p' rlbrief.js
  async function BriefMount(anchor, host) {
    host = host || {};
    if (!anchor || anchor.getAttribute("data-rlbrief-ready") === "1" || anchor.getAttribute("data-rlbrief-mounting") === "1") return;
    anchor.setAttribute("data-rlbrief-mounting", "1");
    var toolId = anchor.getAttribute("data-tool-id");
    briefInjectCss();
    var mount = briefEl("div", { cls: "rlbrief-mount" }); anchor.appendChild(mount);

$ echo "[F] does rlviews.js issue ANY network request? (expect 0)"
$ grep -cE 'fetch\(|XMLHttpRequest|\.src *=|import\(' rlviews.js
0

$ echo "[G] is the panel still DETACHED when the ANCHOR is moved into it?"
$ sed -n '119,140p' rlviews.js
  function buildPanels() {
    for (var index = 0; index < MODES.length; index += 1) {
      var mode = MODES[index];
      var panel = document.createElement("section");        // <- created detached
      panel.className = "rlexperience-placeholder";
      if (mode === "brief" && ANCHOR) {
        panel.appendChild(ANCHOR);                          // <- reparent while DETACHED
      ...
      panel.hidden = true;
      panels[mode] = panel;
      (document.body || document.documentElement).appendChild(panel);   // <- single attach
    }
  }

$ echo "[H] hidden-panel mechanism (display vs visibility)"
$ sed -n '40,58p' rlviews.js        # relevant rule
      "[data-rlexperience-panel][hidden]{display:none!important}",
```

#### E9 — Host precondition (Claim Source: EXECUTED 2026-07-29)

Recorded because this host has a documented history of OOM-killing test runs under memory
pressure; the runs above were executed with ample headroom, so no result is an
OOM artefact.

```
$ free -g
               total        used        free      shared  buff/cache   available
Mem:              47           9           6           0          32          38
Swap:             16           0          15
```

---

### Phase attestation

`stabilize` executed and is complete. It is one phase of the `bugfix-fastlane` chain;
`security` and an independent `audit` remain unexecuted, and certification remains
validate-owned. This phase performed **no** terminal-status transition and wrote **no**
certification field.

---

## Security Phase (bubbles.security)

**Agent:** `bubbles.security` · **Executed:** 2026-07-29 · **Verdict:** 🔒 **SECURE**

**Transcript hygiene note:** every block below is real captured output. Shell prompt echo
(`user@host:~/research-lab$`) and terminal soft-wrap artifacts were removed and long lines
re-joined; **command text and output content are otherwise verbatim and unaltered**. No
output was synthesized.

### SEC-0 — Scope statement (read this before the findings)

The change under review is **+13 insertions / 0 deletions in exactly one test file**,
`tests/distributed-briefs.static.integration.mjs`. **No product code changed.** The
attack surface of a test-only change to a build-free static site is genuinely small, and
this report says so plainly rather than manufacturing findings.

```text
$ git show 8206c89c --numstat --format=''
165     0       specs/.../BUG-003-.../bug.md
198     0       specs/.../BUG-003-.../design.md
318     0       specs/.../BUG-003-.../report.md
223     0       specs/.../BUG-003-.../scopes.md
90      0       specs/.../BUG-003-.../spec.md
137     0       specs/.../BUG-003-.../state.json
13      0       specs/.../BUG-003-.../uservalidation.md
13      0       tests/distributed-briefs.static.integration.mjs

$ git show 8206c89c --name-only --format='' | grep -v '^specs/'
tests/distributed-briefs.static.integration.mjs
GREP_EXIT=0
```

The complete added surface — 6 comment lines, a 4-line helper, one blank line, two call
sites:

```text
$ git show 8206c89c -- tests/distributed-briefs.static.integration.mjs | grep -E '^\+' | grep -vE '^\+\+\+'
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
+        await openBriefView(page);
+        await openBriefView(page);
ADDED_EXIT=0
```

---

### SEC-1 — Secret / credential exposure — ✅ PASS, no finding

**Claim Source:** `executed`

Four independent probes. All negative.

```text
$ grep -nEi 'api[_-]?key|secret|token|passwd|password|bearer|authorization|credential|rlProviderConfig|rlApiKeys|RLDATA\.key|setKey\(|private[_-]?key|BEGIN [A-Z ]*PRIVATE KEY' tests/distributed-briefs.static.integration.mjs
SCAN1_EXIT=1 (1 == zero matches)

$ git show 8206c89c -- tests/distributed-briefs.static.integration.mjs | grep -E '^\+' | grep -vE '^\+\+\+' | grep -nEi 'api[_-]?key|secret|token|password|bearer|authorization|credential|rlProviderConfig|rlApiKeys|providerFetch'
SCAN2_EXIT=1 (1 == zero matches)

$ grep -nE "https?://" tests/distributed-briefs.static.integration.mjs
OUTBOUND_EXIT=1 (1 == no hardcoded URLs)

$ grep -nE "rlProviderConfig|providerFetch|rlApiKeys|RLDATA|fetch\(|XMLHttpRequest" rlviews.js
SEAM_EXIT=1 (1 == shell issues no network and reads no key)
```

`rlviews.js` — the shell path the fix exercises — contains **zero** references to
`RLDATA`, `providerFetch`, `rlProviderConfig`, `rlApiKeys`, `fetch(`, or
`XMLHttpRequest`. It cannot bypass the provider seam because it never touches it.

The seam itself is intact and singly-owned. Repo-wide, `rlProviderConfig` is referenced
in **exactly one** non-test file — the seam owner:

```text
$ git ls-files -- '*.js' '*.html' | grep -v '^tests/' | while read -r f; do grep -nH 'rlProviderConfig' "$f"; done
rldata.js:65:  var PROVIDER_CFG_KEY = "rlProviderConfig";
SEAM_OWNER_EXIT=1
```

The brief renderer on the revealed path also holds no credential authority:

```text
$ grep -nE 'rlProviderConfig|providerFetch|rlApiKeys|RLDATA\.key|setKey\(|Authorization|Bearer|apikey|api_key|token=' rlbrief.js
BRIEF_SEAM_EXIT=1 (1 == no direct key access)

$ grep -nE 'fetch\(' rlbrief.js
1158:    try { res = await fetch(url, noStore ? { cache: "no-store" } : undefined); }
BRIEF_FETCH_EXIT=0
```

One plain, header-less, tokenless `fetch`. No `Authorization`, no `Bearer`, no query
token.

The test harness is loopback-bound on an ephemeral port, so the suite performs no
outbound network I/O at all:

```text
$ grep -nE "listen\(|127\.0\.0\.1|localhost|0\.0\.0\.0" tests/distributed-briefs.support.mjs
107:    await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
108:    const baseUrl = `http://127.0.0.1:${server.address().port}`;
LISTEN_EXIT=0
```

**Finding: none.** The change introduces, logs and hard-codes no key or token; it does
not bypass `providerFetch` and does not read `rlProviderConfig`.

---

### SEC-2 — DOM / XSS surface of the reparent — ✅ PASS, no vulnerability

**Claim Source:** `executed`

#### SEC-2a — The reparent itself introduces no injection path

```text
$ sed -n '125,134p' rlviews.js
      if (mode === "brief" && ANCHOR) {
        panel.appendChild(ANCHOR);
        if (SHELL.kind === "ordinary") panel.insertAdjacentHTML("beforeend", dependencyMarkup("FEATURE002"));
      } else if (mode === "journey") {
        panel.innerHTML = '<h2>Journey</h2><p>Choose a tool goal to begin a guided research workflow. Runtime activation is delivered by the Journey foundation.</p>';
      } else if (mode === "portfolio") {
        panel.innerHTML = '<h2>Portfolio</h2><p>Public watchlist research remains available without implying holdings.</p>' + dependencyMarkup("FEATURE008");
      } else if (mode === "red-alert") {
        panel.innerHTML = '<h2>Red Alert</h2><p>No current evidence-qualified alert is published by this shell foundation.</p>';
      }
SED_EXIT=0
```

`ANCHOR` is an **existing DOM `Node`**, not a string — obtained by `querySelectorAll`
over the page's own authored markup:

```text
$ grep -n '__rlviewsRegistration' --include='*.js' --include='*.mjs' --include='*.html' -r . | grep -v node_modules | grep -v '^\./tests/fixtures'
./scripts/selftest.mjs:3901:    appSource02.includes('root.__rlviewsRegistration = {') &&
./rlapp.js:283:        root.__rlviewsRegistration = {
./rlexperience.js:1408:      var registration = globalThis.__rlviewsRegistration;
./rlviews.js:7:  var registration = root.__rlviewsRegistration;
REG_EXIT=0

$ sed -n '253,257p' rlapp.js
  function mountExperienceShell() {
    var anchors = document.querySelectorAll ? document.querySelectorAll("[data-rlbrief-mount][data-tool-id]") : [];
    if (anchors.length !== 1) return Promise.resolve(false);
    var anchor = anchors[0];
```

`appendChild(Node)` **moves** an existing node; it performs no HTML parsing and evaluates
no markup. There is therefore **no injection path in the reparent**. This is the
structural reason the reparent is safe, independent of any escaping.

#### SEC-2b — `escapeHtml` is applied to EVERY interpolated value (mechanically verified)

```text
$ node -e '<audit: classify every dynamic value reaching an HTML sink in rlviews.js>'
dependencyMarkup(): escapeHtml calls = 8 | raw '+ gate.' interpolations = 0 => PRE-ESCAPED PRODUCER: true

L231 template VERBATIM:
return '<button type="button" role="tab" data-rlview-mode="' + escapeHtml(mode) + '" aria-selected="false" title="Switch to ' + escapeHtml(labels[mode]) + '">' + escapeHtml(labels[mode]) + '</button>';

L231 dynamic interpolations = 3 | escapeHtml() wrappers = 3
L231 any interpolation NOT wrapped in escapeHtml? false

L127 arg: insertAdjacentHTML("beforeend", dependencyMarkup("FEATURE002")
L131 dynamic part: dependencyMarkup("FEATURE008")

VERDICT: sinks fed only by (a) static literals, (b) escapeHtml()-wrapped values,
 (c) dependencyMarkup() which is itself fully escaped.
AUDIT2_EXIT=0
```

Every HTML sink in `rlviews.js` accounted for:

| Sink | Content | Escaped? |
|---|---|---|
| L126 `appendChild(ANCHOR)` | existing DOM Node | N/A — no HTML parse |
| L127 `insertAdjacentHTML` | `dependencyMarkup("FEATURE002")` | pre-escaped producer (8 `escapeHtml`, 0 raw) |
| L129 `innerHTML` | static literal | N/A |
| L131 `innerHTML` | static literal + `dependencyMarkup("FEATURE008")` | pre-escaped producer |
| L133 `innerHTML` | static literal | N/A |
| L231 `innerHTML` | 3 interpolations | **3/3 wrapped, 0 unwrapped** |

**Retracted false positive (honesty record).** A first, crude per-line heuristic
(`interpolations > escapeHtml calls`) flagged **L131 as `UNESCAPED!!`**. That was a defect
in *my probe*, not in the code: L131's only dynamic part is `dependencyMarkup("FEATURE008")`,
which is itself fully escaped (8 `escapeHtml` calls, 0 raw `+ gate.` interpolations). The
same crude probe also *missed* L231 because the template lives on the line after the one
containing `innerHTML`. Both were corrected by the precise audit above. **L131 is NOT a
finding and is not reported as one.**

#### SEC-2c — `escapeHtml` correctness, proven by executing the real committed function

The function was extracted verbatim from `rlviews.js` and reconstructed with
`new Function`, so hostile inputs ran through the **actual shipped code**, not a retyped
copy:

```text
=== escapeHtml EXTRACTED VERBATIM FROM rlviews.js ===
function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character];
    });
  }

=== hostile inputs through the REAL function ===
script tag             "<script>alert(1)</script>" -> "&lt;script&gt;alert(1)&lt;/script&gt;"
dquote attr breakout   "\" onmouseover=\"alert(1)" -> "&quot; onmouseover=&quot;alert(1)"
squote attr breakout   "' onmouseover='alert(1)" -> "' onmouseover='alert(1)"
element breakout       "</button><img src=x onerror=alert(1)>" -> "&lt;/button&gt;&lt;img src=x onerror=alert(1)&gt;"
ampersand              "a&b" -> "a&amp;b"
backtick+equals        "`x`=y" -> "`x`=y"
null                   null -> ""
undefined              undefined -> ""

=== rendered buildControl markup with a HOSTILE label (context test) ===
<button type="button" role="tab" data-rlview-mode="brief" aria-selected="false" title="Switch to &quot;&gt;&lt;img src=x onerror=alert(1)&gt;&lt;span a=&quot;">&quot;&gt;&lt;img src=x onerror=alert(1)&gt;&lt;span a=&quot;</button>

breakout achieved (extra < beyond the 2 template tags)? false
single-quote escaped by escapeHtml? false
single-quoted attributes present in rlviews.js markup? false
ESCAPE_PROBE_EXIT=0
```

**Result:** `&`, `<`, `>`, `"` are all correctly escaped. A double-quote attribute-breakout
payload placed in the `title=` and text positions produced **no breakout** — the rendered
markup contains exactly the two template tags and zero injected elements.

`'` and `` ` `` are **not** escaped. This is **not exploitable in the current code**: the
same probe mechanically confirms **no single-quoted HTML attribute exists anywhere in
`rlviews.js` markup** (`single-quoted attributes present? false`), and every attribute is
double-quoted with `"` escaped. Recorded as hardening note **INFO-1**, not a finding.

#### SEC-2d — Defence in depth: the escaped values are contract-pinned

Even a tampered `tool-experience.config.json` cannot get a payload into `labels`/`viewIds`.
`rlexperience.js` validates them against **hardcoded closed-contract literals** and rejects
on any deviation, so the shell simply never registers:

```text
$ sed -n '327,336p;360,373p' rlexperience.js
  function validateViewSet(viewSet, expected, path) {
    exactKeys(viewSet, VIEW_SET_KEYS, path, "E012-REGISTRY", "config", "tool-experience-config/v1");
    if (viewSet.viewSetId !== expected.viewSetId || viewSet.kind !== expected.kind ||
      viewSet.registryToolId !== expected.registryToolId || viewSet.defaultViewId !== expected.defaultViewId ||
      !equalArray(viewSet.labels, expected.labels)) {
      reject("E012-VIEWSET", "config", "tool-experience-config/v1", path, "view-set identity or labels do not match the closed contract");
    }
    if (!equalArray(viewSet.viewIds, expected.viewIds)) {
      reject("E012-VIEWSET", "config", "tool-experience-config/v1", path + ".viewIds", "view order does not match the closed contract");
    }
  }
      viewIds: ["simple", "power", "brief", "journey"],
      labels: ["Simple", "Power", "Brief", "Journey"], defaultViewId: "simple"
      viewIds: ["brief", "portfolio", "red-alert", "journey"],
      labels: ["Brief", "Portfolio", "Red Alert", "Journey"], defaultViewId: "brief"
```

**Finding: none.** No XSS or DOM-injection vulnerability in the reparent or in
`buildControl()`.

---

### SEC-3 — Supply chain — ✅ PASS

**Claim Source:** `executed`

```text
$ node scripts/validate-node-source-lock.mjs
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
SOURCELOCK_EXIT=0
```

**What it actually enforces** (read from the output, not assumed):

| Surface | Enforced invariant |
|---|---|
| `package.json` | `private=true`, **0 runtime dependencies**, **0 lifecycle scripts**, `playwright` pinned to the exact version `1.61.1` (ranges rejected), `node>=20` |
| `.npmrc` | exactly one registry `https://registry.npmjs.org/`, `ignoreScripts=true`; a second registry, a scoped registry, or any verification-disabling entry is rejected |
| `package-lock.json` | `lockfileVersion 3`, exactly 3 external packages, `sha512` integrity required on each |
| dependency graph | closed and exact — `playwright@1.61.1`, `playwright-core@1.61.1`, `fsevents@2.3.2`; an extra package is rejected |
| resolution source | `git:`, `file:`, `path:`, `http:` and any untrusted resolved URL are rejected (`LOCK-SOURCE`) |

Sixteen adversarial mutations, **all REJECTED**, `unexpectedAcceptances=0` — so the gate is
proven non-tautological rather than merely green.

It is a **blocking CI gate on the publish path**, with no bypass:

```text
$ grep -rn 'validate-node-source-lock' .github/workflows/ scripts/ package.json | grep -v 'scripts/validate-node-source-lock.mjs:'
.github/workflows/pages.yml:24:        run: node scripts/validate-node-source-lock.mjs
WIRE_EXIT=0

$ grep -nEi '\-\-skip|\-\-force|\-\-ignore|\-\-no-verify|ALLOW_ONCE|BYPASS|INSECURE' scripts/validate-node-source-lock.mjs
BYPASS_EXIT=1 (1 == no bypass)
```

This satisfies the `bubbles-supply-chain-source-locking` policy (single pinned registry,
committed lockfile with integrity, lifecycle scripts disabled, no bypass flag).
**Finding: none.**

---

### SEC-4 — Committed secrets — ✅ PASS

**Claim Source:** `executed`

```text
$ git show 8206c89c --name-only --format='' | while read -r f; do [ -f "$f" ] && grep -nEHi 'BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-|(api[_-]?key|secret|token|password)["\x27 ]*[:=]["\x27 ]*[A-Za-z0-9/+_-]{12,}' "$f"; done
SECRET_DIFF_SCAN_EXIT=1 (1 == zero matches)

$ git ls-files -- '*.js' '*.mjs' '*.html' '*.json' | grep -v '^tests/' | grep -v '^specs/' | while read -r f; do grep -nEHi 'BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-' "$f"; done
SECRET_RUNTIME_SCAN_EXIT=1 (1 == zero matches)

$ ls -1 .gitleaks.toml .github/workflows/
.github/workflows/:
pages.yml
CFG_EXIT=2   (.gitleaks.toml absent)
```

Zero credential-shaped matches across **all 8 files** touched by `8206c89c`, and zero
across the **entire tracked runtime surface**. This is consistent with the repo's design:
provider keys live either server-side behind the tailnet proxy or per-browser in
`localStorage.rlProviderConfig` — never in the committed tree.

The absence of `.gitleaks.toml` is recorded as **INFO-2** (pre-existing repo-level gap, not
introduced by this change).

---

### SEC-5 — Categories that DO NOT APPLY (stated explicitly, with reason)

Not fabricated as findings. Each is genuinely inapplicable:

| Category | Status | Reason |
|---|---|---|
| **Broken access control / authz / IDOR (G047)** | **N/A** | No server, no session, no user identity, no role, and no authorization decision anywhere in the runtime. There is nothing to bypass or escalate. |
| **Injection (SQL / OS command / LDAP)** | **N/A** | No database, no server process, no shell execution in the runtime. The repo is a build-free static site published to GitHub Pages. |
| **SSRF** | **N/A for this change** | Runtime fetches use relative same-origin paths (`tools.json`, `tool-experience.config.json`, `simple-models.json`, and three committed `specs/**/state.json` paths). Adapter modules are constrained by `SAFE_MODULE_PATTERN = /^rlexperience-adapters\/[a-z0-9-]+\.js$/` **plus** an explicit allowlist — the character class excludes `.` and `/`, so no scheme, no host and no `..` traversal is expressible. |
| **Auth failures (session, credential stuffing)** | **N/A** | No accounts, no login, no session state. |
| **Cryptographic failures** | **N/A for this change** | No crypto was added or altered. *(Positive observation, not a finding: brief bodies are SHA-256 digest-verified and fail closed — see SEC-6.)* |
| **Data protection / PII** | **N/A** | No PII and no server-side data. Repo policy keeps the watchlist tickers-only; the change touches neither. |
| **Rate limiting / resource exhaustion** | **N/A** | No server and no endpoints to rate-limit. |
| **Insecure deserialization** | **N/A** | `JSON.parse` is applied only to same-origin committed static files inside `try/catch` returning `null`. The change adds no parsing and no prototype-pollution sink. |
| **Silent decode failures (G048)** | **PASS, no finding** | The added helper `await`s both operations and swallows nothing. No `try{}catch{}`, no `.ok()`-style discard, no default substitution was introduced. |
| **Build-Once Deploy-Many supply chain (G081)** | **N/A** | No container images, no `deploy/<target>/` adapter, no build manifest, no cosign/SBOM/SLSA/Trivy surface. Publication is a static GitHub Pages deploy. |
| **Logging failures (A09)** | **N/A for this change** | The change adds no logging. No credential is logged anywhere on the reviewed path (SEC-1). |

---

### SEC-6 — Positive controls observed (context, not findings)

Worth recording because the fix's **second** call site lands precisely on the fail-closed
integrity path:

```text
$ sed -n '1150,1163p' rlbrief.js
    var digest = await crypto.subtle.digest("SHA-256", buf);
    ...
  /* fetch a text body; pointers use cache:no-store. Returns a safe state on 404/redirect/error. */
  async function briefFetchText(url, noStore) {
    var res;
    try { res = await fetch(url, noStore ? { cache: "no-store" } : undefined); }
    catch (e) { return { ok: false, state: "integrity-error", reason: "network" }; }
    if (res.status === 404) return { ok: false, state: "empty", reason: "not-found" };
    if (res.redirected) return { ok: false, state: "integrity-error", reason: "redirected" };
    if (!res.ok) return { ok: false, state: "integrity-error", reason: "http-" + res.status };
CTX_EXIT=0
```

- Brief bodies are **SHA-256 digest-verified**; a hash mismatch fails closed to
  `integrity-error` — the exact assertion the fix's second call site now reaches.
- **Redirects are rejected** (`res.redirected` → `integrity-error`), an anti-substitution
  control.
- Failures return explicit typed states rather than being swallowed.

Repo selftest also enforces least-authority and output-sanitization controls on the
untrusted-content path:

```text
$ grep -nE 'no raw markup|never echoes|provider-key' scripts/selftest.mjs
1603: ... !/rlApiKeys/.test(appSource), 'the landing page exposes the two-tier provider editor (tailnet proxy URL + per-provider local key inputs)'
4312: ... 'the public composer refuses a smuggled Feature 008 private field (RLMKT-PRIVACY) and never echoes the private value'
4340: ... 'web-evidence-acquire.mjs imports ONLY node:crypto and owns zero fetch/provider-key/repo-write/current-pointer/author-publication authority'
4354: ... !JSON.stringify(prim10.acquireResult.value).includes('<p>'), '... the safe bundle is frozen with no raw markup (SCN-012-037)'
4387: ... !JSON.stringify(weak.value).includes('SENSATIONAL'), '... never echoes its dramatic title'
SANITIZE_COV_EXIT=0
```

Green baseline, executed in this phase:

```text
$ node scripts/selftest.mjs
  ✓ SCN-012-022 public matrix labels every row `Public watchlist` with one explicit applicable/state cell per domain (never neutral by omission)
  ✓ the composed public matrix validates round-trip and matches the validator row count
  ✓ the public composer refuses a smuggled Feature 008 private field (RLMKT-PRIVACY) and never echoes the private value
  ✓ SCN-012-019 the Center composes exactly four views (brief/portfolio/red-alert/journey), three exact dependency-pending gates, and a truthful no-action Brief that fabricates no action/catalyst/confidence
  ✓ the market-action contract validator reports four views, three pending gates, and seven distinct closed RLMKT-* adversarial refusals
  ✓ every committed web-evidence fixture (>= 11) evaluates deterministically against the REAL acquire() production transform
  ✓ web-evidence-acquire.mjs imports ONLY node:crypto and owns zero fetch/provider-key/repo-write/current-pointer/author-publication authority
  ✓ the web-evidence validator refuses twelve distinct closed adversarial mutations, each with an E012-* code
  ✓ SCN-012-006/007 single & syndicated origins leave a material claim uncorroborated while two DISTINCT origins corroborate; the safe bundle is frozen with no raw markup (SCN-012-037)

================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

---

### SEC-7 — Informational hardening notes (NOT vulnerabilities, NOT fixed here)

Per the bug's hard rules this phase **reports only**; it changed no source or test file.

| ID | Severity | Observation | Reachable today? |
|---|---|---|---|
| **INFO-1** | Informational | `escapeHtml` (`rlviews.js:29`) does not escape `'` or `` ` ``. Safe now because every attribute in `rlviews.js` markup is double-quoted and `"` **is** escaped — mechanically confirmed `single-quoted attributes present? false`. Becomes a real XSS vector only if a single-quoted or unquoted attribute is ever introduced into an `escapeHtml`-fed template. | **No** — unreachable in current code |
| **INFO-2** | Low (informational) | No automated committed-secret scanner in CI. `.gitleaks.toml` is absent and `pages.yml` is the only workflow. SEC-4 found zero secrets by manual scan, so this is a missing *safety net*, not an active exposure. Pre-existing; not introduced by BUG-003. | N/A — process gap |
| **INFO-3** | Informational | `scripts/selftest.mjs` contains **zero** direct assertions on `escapeHtml` (`grep -c escapeHtml scripts/selftest.mjs` → `0`, exit 1). Escaping is protected indirectly by the closed view-set contract (SEC-2d) rather than by a dedicated escaping test. Coverage observation only. | N/A — coverage gap |

None of the three is attributable to this change, and none blocks it.

---

### SEC-8 — Read-only attestation

This phase modified **no** source file, **no** test file and **no** configuration. All
probes were read-only greps, `sed`, `git show` and non-writing `node -e` evaluations.

```text
$ git status --porcelain
 M specs/002-distributed-tool-briefs-and-history/report.md
 M specs/002-distributed-tool-briefs-and-history/state.json
?? specs/014-shared-cycle-and-seasonality-exchange/
?? specs/015-recommendation-outcome-ledger-and-track-record/
?? specs/016-auction-gamma-playbook/
STATUS_EXIT=0
```

The five entries above belong to **concurrent sessions** (`specs/002-*`, `specs/014-*`,
`specs/015-*`, `specs/016-*`) and were neither created nor touched by this phase, which is
explicitly barred from them. Critically: **`tests/` is unmodified, `rlviews.js` /
`rlbrief.js` / `rlapp.js` / `rlexperience.js` are unmodified, and the BUG-003 folder was
untouched at the time of this capture** — the only subsequent writes are this `report.md`
section and the `completedPhases` update in `state.json`.

Repository-binding preflight for this phase:

```text
$ bash .github/bubbles/scripts/repo-binding-preflight.sh --repo-root /home/redacted/research-lab --agent-source research-lab
[repo-binding-preflight] OK — agent source 'research-lab' matches target repo 'research-lab'.
PREFLIGHT_EXIT=0
```

---

### 🔒 SECURE

All security checks passed for the change under review.

- **Threat model:** complete for the actual surface — a test-only `+13/−0` change to a
  build-free static site with no server, auth, database, PII or network-exposed endpoint.
- **Secret exposure:** none. No key or token introduced, logged or hard-coded; the
  `providerFetch` seam is not bypassed and `rlProviderConfig` is not read. The shell
  (`rlviews.js`) holds zero network and zero credential authority.
- **XSS / DOM injection:** none. The reparent is an `appendChild` of an existing DOM
  **Node** (no HTML parse). `escapeHtml` is applied to **3/3** interpolations in
  `buildControl()` with **0** unwrapped, is **correct for every context in which it is
  used** (proven by executing the real function against hostile payloads — no breakout),
  and its inputs are additionally pinned by a closed view-set contract.
- **Supply chain:** `validate-node-source-lock.mjs` exit 0, 16/16 adversarial mutations
  rejected, `unexpectedAcceptances=0`, wired blocking in `pages.yml`, no bypass flag.
- **Committed secrets:** zero matches across the change and the whole runtime surface.

**Vulnerabilities found: 0.** Three informational hardening notes (INFO-1, INFO-2, INFO-3)
are recorded above; none is reachable or attributable to this change, and none was fixed
here per the bug's report-only rule.

### Phase attestation

`security` executed and is complete. It is one phase of the `bugfix-fastlane` chain; an
independent `audit` remains unexecuted, and certification remains validate-owned. This
phase is **diagnostic**: it performed **no** terminal-status transition, wrote **no**
`certification.*` field, and modified no artifact outside this bug folder's `report.md`
and `state.json`.
