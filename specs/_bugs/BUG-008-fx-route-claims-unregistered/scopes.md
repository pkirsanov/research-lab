# Scopes: BUG-008 — The Registered FX Route Claimed It Was Unregistered

**Layout:** single-file
**Workflow mode:** bugfix-fastlane
**Scope count:** 1

---

## Scope 1: Retire The Falsified Claims And Guard The Invariant

**Status:** Done
**Depends On:** none

### Gherkin Scenarios (Regression)

```gherkin
Scenario: SCN-008B-001 A registered route does not claim it is unregistered
  Given fx-regime-relative-value-lab is present in tools.json
    And it is absent from site-exclusions.json
  When the served markup of fx-regime-relative-value-lab.html is read
  Then it contains no statement asserting the route is unregistered or excluded
    And the text inside #shellMount does not deny the route's liveness

Scenario: SCN-008B-002 The guard is grounded in the registry, not in a remembered string
  Given the guard asserts registration and non-exclusion before reading the markup
  When the tool is registered and published
  Then those preconditions pass and the markup assertions are meaningful
    And if the tool were de-registered the guard would fail on the precondition
    And the guard therefore detects contradiction in both directions

Scenario: SCN-008B-003 The surviving design fact is preserved
  Given the route deliberately ships no page-local mode strip
  When the false registration claims are removed
  Then the comment still records that the shared switcher is the only view control
    And it still records the build-pages-site.mjs mutual-exclusion mechanism

Scenario: SCN-008B-004 Runtime behavior is unchanged
  Given the edit touches only markup that no runtime path reads
  When the full FX suite runs
  Then every pre-existing assertion holds unchanged
```

### Implementation Plan

1. Write the registry-derived regression test and prove it RED against the defect.
2. Replace the falsified comment with the condition that actually holds, retaining the
   mutual-exclusion mechanism and the no-page-local-mode-strip decision.
3. Replace the placeholder with an honest hydration message.
4. Prove the test GREEN, then prove no collateral damage across the FX suite, the repository
   selftest, and the page's id integrity.

### Test Plan

| ID | Scenario | Type | Category | File / Test | Command | Live |
|----|----------|------|----------|-------------|---------|------|
| TP-B8-01 | SCN-008B-001, SCN-008B-002 | Regression E2E | e2e-ui | `tests/fx-regime-relative-value-lab.spec.mjs` / `Regression BUG-008: a registered route never claims it is unregistered` | CMD-BUG008 | Yes |
| TP-B8-02 | SCN-008B-004 | Regression E2E suite | e2e-ui | `tests/fx-regime-relative-value-lab.spec.mjs` (all) | CMD-FX-SUITE | Yes |
| TP-B8-03 | SCN-008B-003, SCN-008B-004 | Repository baseline | unit | `scripts/selftest.mjs` | CMD-SELFTEST | No |
| TP-B8-04 | SCN-008B-004 | Page id integrity | unit | Section-9 check over `fx-regime-relative-value-lab.html` | CMD-SECTION9 | No |

**Commands**

- `CMD-BUG008` = `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "BUG-008" --reporter=list`
- `CMD-FX-SUITE` = `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --reporter=list`
- `CMD-SELFTEST` = `node scripts/selftest.mjs`
- `CMD-SECTION9` = `node -e '<parse ids and getElementById refs from the page, report unmatched>'`

### Definition of Done

- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior exist and pass.
      The one behavior this packet changes — what the route says about its own registration — is
      covered by `Regression BUG-008` in `tests/fx-regime-relative-value-lab.spec.mjs`, which is
      persistent rather than a one-off verification.

    **Phase:** test
    **Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "BUG-008" --reporter=line`
    **Exit Code:** 0
    **Claim Source:** executed
    **Output:**
    ```text
    $ npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "BUG-008" --reporter=line

    [1/2] [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered
    [2/2] [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered
      2 passed (2.0s)
    AUDIT_RERUN_EXIT=0
    exit code: 0
    ```
    The test is committed to the suite, so it runs on every future FX change rather than only
    in this packet's session.

- [x] Broader E2E regression suite passes with no collateral damage from this change.

    **Phase:** regression
    **Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --reporter=list`
    **Exit Code:** 0
    **Claim Source:** executed
    **Output:**
    ```text
    $ npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --reporter=list
      ✓  65 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1185:1 › Regression SCN-004-019: four views share one reader outcome while machine identity stays in Power (1.7s)
      ✓  67 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1231:1 › Regression SCN-004-019 adversarial: switching views neither fetches nor recomputes the owner decision (2.5s)
      ✓  73 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered (17ms)

      78 passed (1.1m)
    FX_SUITE_EXIT=0
    exit code: 0
    ```
    All 78 tests pass, including the four-view shell assertions that read `#shellMount` directly
    and are therefore the ones most exposed to this edit.

- [x] SCN-008B-001 — a registered route does not claim it is unregistered. Before any source
      fix the regression guard fails against the defect, so its non-vacuity is measured rather
      than asserted.

    **Phase:** test
    **Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "BUG-008" --reporter=list`
    **Exit Code:** 1
    **Claim Source:** executed
    **Output:**
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
        [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008
        [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008
      RED_EXIT=1
    ```
    Three of the four contradiction patterns matched real committed text. The fourth
    (`until this route is registered`) did not match and was retained deliberately as
    coverage for a paraphrase, not removed to make the count tidy.

- [x] SCN-008B-003 — the surviving design fact is preserved. The two falsified statements are
      retired in the same edit that keeps the no-page-local-mode-strip decision and the
      `build-pages-site.mjs` mutual-exclusion mechanism intact.

    **Phase:** implement
    **Command:** `git --no-pager diff -- fx-regime-relative-value-lab.html`
    **Exit Code:** 0
    **Claim Source:** executed
    **Output:**
    ```text
    diff --git a/fx-regime-relative-value-lab.html b/fx-regime-relative-value-lab.html
    index 7f0cf3a4..3a98f9eb 100644
    --- a/fx-regime-relative-value-lab.html
    +++ b/fx-regime-relative-value-lab.html
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
    The mutual-exclusion mechanism and the no-page-local-mode-strip decision both survive; only
    the two propositions that had become false were replaced.

- [x] SCN-008B-001 — a registered route does not claim it is unregistered: TP-B8-01 passes
      after the fix, on the identical command that produced the RED above.

    **Phase:** test
    **Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "BUG-008" --reporter=list`
    **Exit Code:** 0
    **Claim Source:** executed
    **Output:**
    ```text
    Running 2 tests using 2 workers

      ✓  1 [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered (17ms)
      ✓  2 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered (19ms)

      2 passed (2.7s)
    GREEN_EXIT=0
    ```
    Same file, same grep, same reporter as the RED run. The only variable that changed is the
    source under test.

- [x] SCN-008B-004 — runtime behavior is unchanged. TP-B8-02 proves no collateral damage:
      every pre-existing FX assertion still holds.

    **Phase:** regression
    **Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --reporter=list`
    **Exit Code:** 0
    **Claim Source:** executed
    **Output:**
    ```text
      ✓  65 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1185:1 › Regression SCN-004-019: four views share one reader outcome while machine identity stays in Power (1.7s)
      ✓  67 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1231:1 › Regression SCN-004-019 adversarial: switching views neither fetches nor recomputes the owner decision (2.5s)
      ✓  70 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1268:1 › Regression SCN-004-033: Journey evidence refresh reopens transitive dependents and every completion packet remains non-executable (1.9s)
      ✓  72 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1348:1 › Regression SCN-004-026 adversarial: source tokens do not prove an unreachable reader entry point (1.6s)
      ✓  73 [chromium] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered (17ms)
      ✓  78 [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:1388:1 › Regression BUG-008: a registered route never claims it is unregistered (11ms)

      78 passed (1.1m)
    FX_SUITE_EXIT=0
    ```
    The four-view shell assertions are the ones most exposed to a `#shellMount` edit, and they
    are green, including the adversarial no-recompute case.

- [x] SCN-008B-004 — runtime behavior is unchanged: TP-B8-03 proves the repository baseline is
      unaffected.

    **Phase:** regression
    **Command:** `node scripts/selftest.mjs`
    **Exit Code:** 0
    **Claim Source:** executed
    **Output:**
    ```text
      ✓ Parity TP-06-05: data/curves/us-treasury/curve.json is byte-identical before and after the parity group — the suite never mutates published evidence
      ✓ Parity TP-06-05: the parity artifact was written under a temporary root, never into the repository

    ================================================
    Research-Lab self-test: 1578 passed, 0 failed
    ================================================
    SELFTEST_EXIT=0
    ```
    1578 passed and 0 failed, matching the pre-edit baseline count exactly.

- [x] TP-B8-04 proves the edited page's id integrity is intact, which is the failure mode a
      markup edit is most likely to introduce.

    **Phase:** test
    **Command:** `node -e '<parse ids and getElementById refs from fx-regime-relative-value-lab.html, print each resolution, exit 1 on any unresolved>'`
    **Exit Code:** 0
    **Claim Source:** executed
    **Output:**
    ```text
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
    ```
    The check exits 1 on any unresolved reference, so exit 0 is measured rather than printed.
    `#shellMount` is among the 25 ids and survives the edit; no lookup is left dangling.

- [x] SCN-008B-002 — the guard is grounded in the registry, not in a remembered string: it is
      registry-derived rather than string-frozen, so it detects the inverse failure a remembered
      string comparison could not.

    **Phase:** implement
    **Command:** `sed -n '1389,1398p' tests/fx-regime-relative-value-lab.spec.mjs`
    **Exit Code:** 0
    **Claim Source:** executed
    **Output:**
    ```text
      const registry = JSON.parse(readFileSync(new URL('../tools.json', import.meta.url), 'utf8'));
      const registered = JSON.stringify(registry).includes('"fx-regime-relative-value-lab"');
      const excluded = existsSync(new URL('../site-exclusions.json', import.meta.url))
        ? JSON.parse(readFileSync(new URL('../site-exclusions.json', import.meta.url), 'utf8'))
        : [];
      const isExcluded = JSON.stringify(excluded).includes('fx-regime-relative-value-lab');

      // Ground the expectation in the registry, not in a remembered answer.
      expect(registered).toBe(true);
      expect(isExcluded).toBe(false);
    ```
    The preconditions are asserted before the markup is read, so de-registering the tool
    reddens this test rather than silently making its markup assertions vacuous.

- [x] Build Quality Gate: the working tree carries only this packet's intended changes, and a
      concurrent unrelated modification was left untouched rather than swept into the commit.

    **Phase:** stabilize
    **Command:** `git status --porcelain`
    **Exit Code:** 0
    **Claim Source:** executed
    **Output:**
    ```text
     M fx-regime-relative-value-lab.html
     M rlportfolio.js
     M tests/fx-regime-relative-value-lab.spec.mjs
    ```
    `rlportfolio.js` is another session's in-progress work. It is deliberately excluded from
    this packet's commit rather than reverted or committed, because discarding another
    author's uncommitted work to tidy a status listing would be destructive.

### Change Boundary

**In:** `fx-regime-relative-value-lab.html` (one markup block),
`tests/fx-regime-relative-value-lab.spec.mjs` (one added test plus one import line),
this packet's own artifacts.

**Out:** `rlfx.js`, `rlapp.js`, `rlexperience.js`, `tools.json`, `site-exclusions.json`,
`rlportfolio.js`, and every artifact under `specs/004-fx-regime-relative-value-lab`. Spec 004
is certified `done` and this packet does not reopen it.

### Uncertainty Declarations

- The contradiction pattern set is semantic rather than exhaustive. A sufficiently novel
  phrasing of "this route is not registered" could evade it. The registry preconditions
  bound that exposure: they fail on the inverse case regardless of phrasing, and the mount
  assertion independently covers the reader-visible surface.
- The guard is scoped to this one route. Design §4 records the audit establishing that no
  sibling tool currently carries the same defect, which is what makes that scope
  proportionate; it is not a claim that a sibling can never acquire one.
