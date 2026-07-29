# Scopes: BUG-003 Reconcile TP-10-02 To The Ratified Shell Brief-View Contract

Single scope. The Feature 012 owner decision (see [design.md](design.md) § The Decision)
rules the shell correct as authored, so the entire remediation is the reconciliation of
one un-reconciled test to a contract its 13 siblings already adopted.

---

## SCOPE-01 — Reconcile TP-10-02 to the shell's Brief-view residency

- **Status:** Done
- **Depends On:** (none)
- **Owner agent:** `bubbles.implement`
- **Files touched:** `tests/distributed-briefs.static.integration.mjs` (test only)
- **Product/shell files touched:** none

### Gherkin

```gherkin
Scenario: SCN-B003-01 The reconciled TP-10-02 asserts brief visibility in the Brief view
  Given an ordinary tool page hosting a data-rlbrief-mount and a coherent current brief graph
  And the Feature 012 shell has adopted the mount into its "brief" view panel
  When TP-10-02 loads the page, waits for the shell to report ready, and drives the real
       rlviews control to the Brief view
  Then the mount is ready and visible
  And data-rlbrief-state is "ready"

Scenario: SCN-B003-02 The view switch does not weaken any network-window assertion
  Given TP-10-02 has driven the shell to the Brief view
  When the test measures brief requests
  Then no history partition has been requested before "Open history"
  And the Power mode switch performs no refetch
  And opening history fetches the pointer and index only
  And selecting one filter fetches exactly one partition

Scenario: SCN-B003-03 The fail-closed integrity path is reconciled identically
  Given a brief graph whose read object fails its SHA-256 check
  When TP-10-02 drives the shell to the Brief view and waits for the mount
  Then data-rlbrief-state is "integrity-error"
  And no partial evidence is rendered

Scenario: SCN-B003-04 The ratified sibling contract is unchanged
  Given the 13 sibling regressions in tests/distributed-briefs.spec.mjs
  When the suite is re-run after the reconciliation
  Then all 13 pass and the file is unmodified
```

### Implementation Plan

1. Reproduce RED on pre-fix bytes.
2. Add a module-local `openBriefView(page)` mirroring
   `tests/distributed-briefs.spec.mjs::mountReady()` (shell-ready wait + Brief-view click)
   with a comment citing the same contract.
3. Invoke it at both mount-wait sites (coherent-graph and fail-closed integrity), placed
   after `goto` and before the untouched `waitForSelector`.
4. Prove additivity (0 deletions, assertion count unchanged, no relaxation, no new skip).
5. Re-run RED causally via a path-scoped stash, then GREEN, then the full regression set.

### Test Plan

| # | Test | Category | File | Command |
|---|---|---|---|---|
| TP-B003-01 | TP-10-02 static loader integration (the reconciled test) | integration | `tests/distributed-briefs.static.integration.mjs` | `node --test tests/distributed-briefs.static.integration.mjs` |
| TP-B003-02 | Regression E2E — 13 sibling brief scenario regressions (TP-10-04..TP-10-16) | e2e-ui | `tests/distributed-briefs.spec.mjs` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |
| TP-B003-03 | Regression E2E — full project selftest baseline | unit | `scripts/selftest.mjs` | `node scripts/selftest.mjs` |
| TP-B003-04 | Regression E2E — production Simple bridge parity (19 wired tools) | integration | `tests/simple-production-bridge.integration.mjs` | `node --test tests/simple-production-bridge.integration.mjs` |

**Stress coverage disposition (Gate G026): not applicable — no stress test is planned or
required for this scope.** The scope declares no latency, throughput, p95/p99, response-time
or SLA/SLO budget, and it adds no runtime code path that could carry one: the delivery is 13
lines inside one test file and the product/shell surface is byte-identical. The G026 keyword
trigger fires on the substring `slo` inside the word `slot`, which occurs only in pasted
`scripts/selftest.mjs` and Playwright output above (`consumes no action slot`, `consumes no
visible slot`) — evidence text, not a performance budget authored by this scope. The single
timing fact this scope does assert is a correctness fact, not a stress budget: the reconciled
test completes in ~2.4 s instead of exhausting its unchanged 15000 ms wait, proving the pass
comes from satisfying the wait rather than outlasting it.

### Definition of Done

- [x] Feature 012 owner decision recorded with all four evidence points in `design.md` § The Decision

```text
$ grep -n '^### Evidence Point\|^## The Decision\|^### Why the two contracts' design.md
3:## The Decision
11:### Evidence Point 1 — the Brief view is a deliberate, committed top-level view
29:### Evidence Point 2 — Feature 002's own Scope 10 suite already ratified this contract
50:### Evidence Point 3 — TP-10-02 is the only family member never reconciled
66:### Evidence Point 4 — the brief is reachable and already loaded, so there is no user harm
78:### Why the two contracts are NOT actually mutually exclusive
```

- [x] Pre-fix RED reproduced from real execution (not asserted)

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
  page.waitForSelector: Timeout 15000ms exceeded.
    - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible
      32 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" ... data-rlexperience-state="registered">…</section>
    name: 'TimeoutError'
RED_EXIT=1
```

- [x] Reconciliation is additive — zero deletions, zero weakened assertions

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

- [x] SCN-B003-01 — the reconciled TP-10-02 asserts brief visibility in the Brief view

```text
$ timeout 300 node --test tests/distributed-briefs.static.integration.mjs
✔ static loader verifies coherent current objects and fetches history only after selection (2371.520656ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2503.388772
GREEN_EXIT=0
```

- [x] SCN-B003-03 — the fail-closed integrity path is reconciled identically

```text
$ grep -n 'openBriefView' tests/distributed-briefs.static.integration.mjs
19:async function openBriefView(page) {
38:        await openBriefView(page);
93:        await openBriefView(page);
grep_exit=0

$ awk 'NR>=92 && NR<=99 {printf "%d| %s\n", NR, $0}' tests/distributed-briefs.static.integration.mjs
92|         await page.goto(harnessUrl(badServer.baseUrl, 'sector-research-lab'), { waitUntil: 'load' });
93|         await openBriefView(page);
94|         await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
95|         const st = await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state');
96|         assert.equal(st, 'integrity-error', 'hash mismatch fails closed');
97|         assert.equal(await page.$('[data-rlbrief-part="price"]'), null, 'no partial evidence rendered on integrity failure');
98|         const status = await page.textContent('[data-rlbrief-part="status"]');
99|         assert.ok(status.indexOf('Could not verify this brief') >= 0);
awk_exit=0
```

Line 93 is the same `openBriefView(page)` call as line 38 — the integrity site is reconciled
by the identical mechanism, and lines 96-99 (`integrity-error`, no `price` part, "Could not
verify this brief") are unchanged. Both sites execute inside the single `node --test` run
above, which reports `pass 1 / fail 0`.

- [x] SCN-B003-02 — every network-window assertion survives the view switch, still enforced

```text
$ grep -n "no history partition before Open history\|mode switch performs no refetch\|no partition fetched until a filter is selected\|exactly one selected partition fetched" tests/distributed-briefs.static.integration.mjs
18:// below (`no history partition before Open history`, `beforePower`) and cannot invalidate them.
53:        assert.equal(server.briefRequests().some((p) => p.indexOf('/briefs/history/') === 0), false, 'no history partition before Open history');
59:        assert.equal(server.briefRequests().length, beforePower, 'mode switch performs no refetch');
69:        assert.equal(afterOpen.some((p) => p.indexOf('/briefs/history/') === 0), false, 'no partition fetched until a filter is selected');
75:        assert.equal(partitions.length, 1, 'exactly one selected partition fetched');
```

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior

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

- [x] Broader E2E regression suite passes

```text
$ node scripts/selftest.mjs
  ✓ SCN-012-023 a dynamically corroborated, market-confirmed, high-severity candidate qualifies with every falsifiable field and an admission score (never a probability/confidence/crash-odds field), publication Feature-002 gated
  ✓ SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title
  ✓ SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic
================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
SELFTEST_EXIT=0

$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
ℹ tests 6
ℹ pass 6
ℹ fail 0
BRIDGE_EXIT=0
```

- [x] SCN-B003-04 — no product, shell or sibling-test file modified

```text
$ git --no-pager status --porcelain -- rlviews.js rlbrief.js rlexperience.js tool-experience.config.json tests/distributed-briefs.spec.mjs '*.html'
(empty above == byte-identical to HEAD; status_exit=0)

$ git --no-pager diff --numstat -- tests/
13      0       tests/distributed-briefs.static.integration.mjs
```

- [x] Bug packet artifacts complete (`bug.md`, `spec.md`, `design.md`, `scopes.md`, `report.md`, `uservalidation.md`, `state.json`)

```text
$ ls -1 specs/012-market-action-center-and-guided-tools/bugs/BUG-003-shell-brief-panel-adoption-hides-feature-002-mount/
bug.md
design.md
report.md
scopes.md
spec.md
state.json
uservalidation.md
```

- [x] Build Quality Gate — artifact lint and state-transition guard pass, zero deferral language, zero unresolved work

Re-scoped 2026-07-29 per audit finding AUD-F1. The evidence previously pasted here was produced
against `specs/012-market-action-center-and-guided-tools` — the FEATURE directory — while this item
governs the BUG packet. Both tools are re-run below against the bug packet itself.

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-003-shell-brief-panel-adoption-hides-feature-002-mount
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
⚠️  uservalidation.md is using legacy checklist layout without '## Checklist' section
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
⚠️  state.json v3 missing recommended field: executionHistory
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: ###[[:space:]]+Summary|^##[[:space:]]+Summary
✅ report.md contains section matching: ###[[:space:]]+Completion Statement|^##[[:space:]]+Completion Statement
✅ report.md contains section matching: ###[[:space:]]+Test Evidence|^##[[:space:]]+Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0
```

```text
$ bash .github/bubbles/scripts/state-transition-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-003-shell-brief-panel-adoption-hides-feature-002-mount
  BUBBLES STATE TRANSITION GUARD
ℹ️  INFO: Current workflowMode: bugfix-fastlane
⚠️  WARN: report.md has 36 of 108 evidence blocks that lack terminal output signals (potentially fabricated)
⚠️  WARN: report.md has 1 narrative summary phrases outside code blocks (fabrication indicator)
--- Check 13: Artifact Lint ---
✅ PASS: Artifact lint passes (exit 0)
--- Check 18: Deferral Language Scan (Gate G040) ---
✅ PASS: Zero deferral language found in scope and report artifacts (Gate G040)
  TRANSITION GUARD VERDICT
🟡 TRANSITION PERMITTED with 2 warning(s)
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

Both tools pass against the bug packet: `ARTIFACT_LINT_EXIT=0` and `GUARD_EXIT=0` with
`failureCount: 0` / `verdict: PASS`. The "zero deferral language" clause is carried by guard
Check 18 (G040), which passes; the residual deferral-shaped strings in `report.md` are fenced
audit quotations of the already-remediated AUD-F3 phrase (disposition `DI-02`), which G040
excludes. The two remaining items are advisory WARNs, not failures, and both are pre-existing:
the 36 thin evidence blocks predate this pass (the count held at 36 while the denominator rose
from 106 to 108 as this pass appended two blocks of its own).

Scope note: this item's "zero unresolved work" clause is satisfied **for the Build Quality Gate at
the packet's current status**. It is not a certification claim — promotion of this packet to `done`
is separately blocked, and the blockers plus their owners are recorded in `report.md` §
`Validation Phase (bubbles.validate) — 2026-07-29`, CERT-5 and CERT-7.
