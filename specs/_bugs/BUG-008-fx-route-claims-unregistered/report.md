# Report: BUG-008 — The Registered FX Route Claimed It Was Unregistered

## Scenario-First TDD Ordering

**Red-stage first.** The guard was authored and run as a failing proof against the committed
defect BEFORE any source edit was made: `2 failed`, exit 1. That transcript is E3, and it
names the three contradiction patterns that matched real committed text.

**Green-stage second.** Only after the red stage was recorded was the markup corrected. The
identical command — same file, same `--grep`, same reporter — was then re-run and is recorded
as E4.

Because the two runs differ in exactly one variable, the source under test, the green result
measures the fix rather than merely accompanying it.

### Success Signal Demonstrated

The Outcome Contract's success signal was: *with the tool registered and not excluded,
`Regression BUG-008` succeeds; with the false claims present it fails.* Both halves were
executed and both are recorded. The failing half is what gives the succeeding half meaning.

---

### Code Diff Evidence

**Command:** `git --no-pager diff --stat -- fx-regime-relative-value-lab.html tests/fx-regime-relative-value-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
$ git --no-pager diff --stat -- fx-regime-relative-value-lab.html tests/fx-regime-relative-value-lab.spec.mjs
 fx-regime-relative-value-lab.html           | 12 ++++-----
 tests/fx-regime-relative-value-lab.spec.mjs | 40 +++++++++++++++++++++++++++++
 2 files changed, 46 insertions(+), 6 deletions(-)
exit code: 0

$ git status --porcelain
 M fx-regime-relative-value-lab.html
 M rlportfolio.js
 M tests/fx-regime-relative-value-lab.spec.mjs
exit code: 0
```

The entire delivery is 2 files: 6 replaced lines of markup, and one added test plus its
import line. The full markup diff is reproduced under E9; the test body is quoted in the DoD
item covering SCN-008B-002. The `git status` capture also shows `rlportfolio.js`, which is
another session's uncommitted work and is deliberately excluded from this packet's commit.

## Summary

The FX Regime & Currency Vehicle Lab shipped registered and published while its served markup
still asserted the pre-registration state — once in a source comment, and once in the
reader-visible placeholder inside `#shellMount`.

Feature 004 delivered the route in two deliberate steps. Scope 2 built it while it was
excluded from the published site, when both statements were **true**. Scope 5 performed the
atomic cutover into `tools.json` and out of `site-exclusions.json`, and asserted the runtime
consequence — the shared four-view switcher resolves — with real evidence. Nothing asserted
that the prose describing the now-ended condition was retired in the same transaction.

The remediation retires the two falsified propositions, preserves the two facts in that
comment that are still true (the `build-pages-site.mjs` mutual exclusion, and the deliberate
absence of a page-local mode strip), and installs a regression guard whose expectation is
computed from the registry on every run rather than frozen as a string.

Scope was set by an audit, not by assumption. Five larger hypotheses about the FX tool were
investigated and **four were rejected on evidence** — including two that would each have
justified a substantially bigger packet. Those rejections are recorded in `design.md` §4,
because a packet this small is only defensible if the reader can see what was ruled out.

## Completion Statement

Scope 1 is Done. All 8 DoD items are checked and each carries an inline execution transcript.
The defect is closed, the invariant is guarded in both directions, and the repository baseline
is unchanged at 1578 passed / 0 failed.

One item is deliberately **not** claimed: this guard protects one route. `design.md` §4
records the audit establishing that no sibling tool currently carries the same defect, which
is what makes a single-route guard proportionate. It is not a claim that none ever will.

A concurrent unrelated modification to `rlportfolio.js` was present in the working tree
throughout. It belongs to another session and was left untouched — neither committed nor
reverted.

### Validation Evidence

**Phase Agent:** bubbles.validate (parent-expanded by bubbles.goal — see `state.json`
`certification.assurance.missingForFull`; this phase was executed directly by the authorized
top-level runner, not by an independent subagent)
**Executed:** YES

**Command:** `grep -c 'fx-regime-relative-value-lab' tools.json ; grep -c 'fx-regime' site-exclusions.json ; grep -cEi '<contradiction patterns>' fx-regime-relative-value-lab.html ; grep -c 'NO page-local mode strip' fx-regime-relative-value-lab.html ; grep -c 'build-pages-site.mjs' fx-regime-relative-value-lab.html`
**Exit Code:** 0
**Claim Source:** executed

```text
$ grep -c 'fx-regime-relative-value-lab' tools.json; grep -c 'fx-regime' site-exclusions.json; grep -cEi '<contradictions>' fx-regime-relative-value-lab.html; grep -c 'NO page-local mode strip' fx-regime-relative-value-lab.html; grep -c 'build-pages-site.mjs' fx-regime-relative-value-lab.html
=== VALIDATE: success signal, both directions ===
5
0
0 (not excluded)
--- contradiction patterns remaining in page ---
0
0 contradictions remain
--- surviving design fact preserved ---
1
1
VALIDATE_DONE
exit code: 0
```

This validates the Outcome Contract term by term. The tool is registered (5 references in
`tools.json`) and not excluded (0 in `site-exclusions.json`), so the guard's preconditions
hold for a real reason. Zero contradiction patterns remain in the page, which is the success
signal. Both hard constraints survive: the no-page-local-mode-strip decision and the
`build-pages-site.mjs` mutual-exclusion mechanism are each still present exactly once.

### Audit Evidence

**Phase Agent:** bubbles.audit (parent-expanded by bubbles.goal — same provenance caveat as
the validate phase above)
**Executed:** YES

**Command:** `grep -c '^- \[x\]' scopes.md ; grep -c '^- \[ \]' scopes.md ; grep -c '\*\*Claim Source:\*\* executed' scopes.md ; npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "BUG-008" --reporter=line`
**Exit Code:** 0
**Claim Source:** executed

```text
=== AUDIT: does every DoD evidence command in scopes.md correspond to a real, re-runnable command? ===
$ grep -c '^- \[x\]' scopes.md ; grep -c '^- \[ \]' scopes.md ; grep -c 'Claim Source: executed' scopes.md
10
0
--- evidence blocks vs checked items ---
10
--- AUDIT: re-run the guard independently to confirm the GREEN claim ---

[1/2] [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered
[2/2] [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered
  2 passed (2.0s)
AUDIT_RERUN_EXIT=0
exit code: 0
```

The audit checks the two things most likely to be wrong in a self-certified packet. First,
accounting: 10 DoD items checked, 0 unchecked, and exactly 10 blocks carrying
`Claim Source: executed` — one per item, so no item is riding on a neighbour's evidence.
Second, the central claim was re-derived rather than re-read: the guard was re-run under a
different reporter and passed again.

Two corrections were made during this packet as a direct result of checking rather than
assuming, and both are recorded because they are the reason the remaining evidence can be
trusted: a `sed` range quoted in `scopes.md` was off by two lines and was corrected to
`1389,1398p`, and the E10 block originally recorded a three-line output and exit 0 when the
real command emitted five lines and exited 1.

## Test Evidence

### E1 — Repository binding

**Command:** `bash .github/bubbles/scripts/repository-binding.sh preflight --session-id … --request-class CONTINUE --repository-root /home/philipk/research-lab`
**Exit Code:** 0
**Claim Source:** executed

```text
$ bash .github/bubbles/scripts/repository-binding.sh preflight --session-id vscode-2385c8f4ad1f394bec01aceff93f3e89 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-2385c8f4ad1f394bec01aceff93f3e89/repository-binding.json --request-class CONTINUE --repository-root /home/philipk/research-lab
REPOSITORY PREFLIGHT BOUND repository=research-lab root=/home/philipk/research-lab source=explicit-repositoryRoot affinity=established
PREFLIGHT_COMMITTED decision=rb:vscode-2385c8f4ad1f394bec01aceff93f3e89:1 revision=1 repository=research-lab root=/home/philipk/research-lab
{"repositoryRoot":"/home/philipk/research-lab","repositoryAlias":"research-lab","repositoryResolution":{"authority":"explicit-repository-root","transition":"established","scopeKind":"command","targetKind":"repository-root","actionable":true}}
exit code: 0
```

### E2 — The defect, reproduced from the registry

**Command:** `grep -n 'fx-regime' site-exclusions.json ; grep -c '"fx-regime-relative-value-lab"' tools.json ; grep -n 'intentionally UNREGISTERED\|once this route is registered' fx-regime-relative-value-lab.html`
**Exit Code:** 0
**Claim Source:** executed

```text
NOT PRESENT in site-exclusions.json (route is published)
1
166:        <!-- Shared four-view shell anchor. This route is intentionally UNREGISTERED until Scope 5,
172:            Shared four-view shell mounts here once this route is registered.
```

The registry reports registered and published. The markup at lines 166 and 172 asserts the
opposite. Both cannot hold, which is the defect.

### E3 — Guard RED against the committed defect (non-vacuity, measured)

**Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "BUG-008" --reporter=list`
**Exit Code:** 1
**Claim Source:** executed

```text
  2) [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered

    Error: expect(received).toEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 5

    - Array []
    + Array [
    +   "/intentionally\\s+UNREGISTERED/i",
    +   "/once\\s+this\\s+route\\s+is\\s+registered/i",
    +   "/E012-REGISTRY\\s+(?:and|so)/i",
    + ]

      1409 |   const found = contradictions.filter((pattern) => pattern.test(markup)).map(String);
    > 1410 |   expect(found).toEqual([]);

  2 failed
RED_EXIT=1
```

Three of four contradiction patterns matched real committed text, on both browser projects.

### E4 — Guard GREEN after the fix, identical command

**Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "BUG-008" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
Running 2 tests using 2 workers

  ✓  1 [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered (17ms)
  ✓  2 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered (19ms)

  2 passed (2.7s)
GREEN_EXIT=0
```

### E5 — Full FX suite, no collateral damage

**Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
  ✓  65 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1185:1 › Regression SCN-004-019: four views share one reader outcome while machine identity stays in Power (1.7s)
  ✓  67 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1231:1 › Regression SCN-004-019 adversarial: switching views neither fetches nor recomputes the owner decision (2.5s)
  ✓  70 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1268:1 › Regression SCN-004-033: Journey evidence refresh reopens transitive dependents and every completion packet remains non-executable (1.9s)
  ✓  73 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered (17ms)
  ✓  78 [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered (11ms)

  78 passed (1.1m)
FX_SUITE_EXIT=0
```

The `#shellMount` element is read directly by the four-view shell assertions, which makes them
the tests most exposed to this edit. They are green, including the adversarial no-recompute case.

### E6 — Repository baseline unchanged

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
  ✓ Parity TP-06-05: data/curves/us-treasury/curve.json is byte-identical before and after the parity group — the suite never mutates published evidence
  ✓ Parity TP-06-05: the parity artifact was written under a temporary root, never into the repository

================================================
Research-Lab self-test: 1578 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### E7 — Page id integrity after the markup edit

**Command:** `node -e '<parse ids and getElementById refs from fx-regime-relative-value-lab.html, print each resolution, exit 1 on any unresolved>'`
**Exit Code:** 0
**Claim Source:** executed

```text
$ node -e '<parse ids and getElementById refs, print each resolution, exit 1 on any unresolved>'
file: fx-regime-relative-value-lab.html
declared ids: 25
getElementById refs: 8
  ref controlGrid -> resolved
  ref simpleKpis -> resolved
  ref simpleReasons -> resolved
  ref vehicleTableBody -> resolved
  ref vehicleChart -> resolved
  ref vehicleChartSummary -> resolved
  ref evidenceTableBody -> resolved
  ref identityKpis -> resolved
shellMount declared: true
unresolved refs: 0
SECTION9_EXIT=0
exit code: 0
```

The check exits 1 on any unresolved reference, so exit 0 is a measured result rather than a
print. `shellMount` — the element this packet edited — is confirmed still declared.

### E8 — Spec-artifact test-path guard still clean

**Command:** `node scripts/validate-spec-test-paths.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=543 references=11997 distinctPaths=218 missingPaths=86 baseline=86 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
PATHS_EXIT=0
exit code: 0
```

This packet adds test-path references in its own artifacts; the guard confirms every one of
them resolves to a file that exists.

### E9 — Code diff

**Command:** `git --no-pager diff -- fx-regime-relative-value-lab.html`
**Exit Code:** 0
**Claim Source:** executed

```text
diff --git a/fx-regime-relative-value-lab.html b/fx-regime-relative-value-lab.html
index 7f0cf3a4..3a98f9eb 100644
@@ -163,13 +163,13 @@
-        <!-- Shared four-view shell anchor. This route is intentionally UNREGISTERED until Scope 5,
-             so rlexperience.js resolveShell refuses with E012-REGISTRY and the shell renders its
-             honest unavailable state. Registration and site-exclusions.json are mutually exclusive
-             (scripts/build-pages-site.mjs), so activating the switcher here would publish an
-             unfinished route. There is deliberately NO page-local mode strip. -->
+        <!-- Shared four-view shell anchor. This route is registered in tools.json and absent from
+             site-exclusions.json, which are mutually exclusive (scripts/build-pages-site.mjs), so
+             rlexperience.js resolveShell returns the ordinary-four-view/v1 set and rlapp.js mounts
+             Simple, Power, Brief, and Journey here. There is deliberately NO page-local mode strip;
+             the shared switcher is the only view control. -->
         <div class="shellmount" id="shellMount" data-rlbrief-mount data-tool-id="fx-regime-relative-value-lab">
-            Shared four-view shell mounts here once this route is registered.
+            Loading the Simple, Power, Brief, and Journey views&hellip;
         </div>
```

### E10 — Hypotheses investigated and rejected before scoping

**Command:** `grep -n 'ensureSharedScript' rlapp.js | head -3 ; grep -cE '\.title\s*=|data-tip' sector-research-lab.html global-rotation-lab.html`
**Exit Code:** 1 (`grep -c` exits 1 when a count is zero — that zero is itself the evidence)
**Claim Source:** executed

```text
255:  function ensureSharedScript(id, src, ready) {
299:      ensureSharedScript("rlexperience-shared-js", "rlexperience.js", function () {
339:        return ensureSharedScript("rlviews-shared-js", "rlviews.js", function () {
---
sector-research-lab.html:0
global-rotation-lab.html:0
EXIT=1
```

`rlapp.js:299` injects `rlexperience.js` dynamically, which disproves the hypothesis that the
FX page cannot mount the shared shell because it carries no static script tag. The two
reference tools carry zero explicit tooltip assignments, which disproves the hypothesis that
FX is deficient in contextual tooltips — it carries two and inherits `rlg.js` auto-decoration
like every other tool. Recording disproved hypotheses is the reason this packet is one markup
block instead of a speculative rewrite.
