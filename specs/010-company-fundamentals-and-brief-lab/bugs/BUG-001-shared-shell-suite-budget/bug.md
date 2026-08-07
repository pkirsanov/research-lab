# Bug: BUG-001 Shared-Shell Suite Budget

- **Bug ID:** BUG-001
- **Owning feature:** `specs/010-company-fundamentals-and-brief-lab`
- **Reported:** 2026-08-04
- **Workflow mode:** `bugfix-fastlane`
- **Status:** Confirmed and diagnosed. No implementation started.

## Summary

One Feature 010 browser regression fails only inside the complete four-worker
suite. The same target passes alone. All 32 tests in its owning file also pass
serially with retries disabled.

The failure occurs before product assertions run. The local
`openNativeResearchSurface` helper waits for the ready shared shell through
Playwright's inherited 5-second expectation timeout. Suite contention can
exhaust that wait before the shell attaches.

## Severity

**Medium.** The product behavior passes focused and file-local discriminators.
The required complete browser acceptance gate remains red.

## Active-Packet Decision

One exact Feature 010 bug search found no existing bug packet. BUG-001 is the
first valid identifier in this feature namespace.

The parent Feature 010 packet is complete historical work. This bug packet
does not rewrite its planning, evidence, state, or certification.

## Reproduction

Run the complete system-Chrome browser suite from the Research Lab root:

```bash
timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0
```

The supplied current run discovered 277 identities across 33 files. It ended
with 276 passed and one failed.

### Sole Failure

- File: `tests/company-fundamentals-lab.spec.mjs`
- Declaration line: 818 at diagnosis time
- Title: `Regression: SCN-010-007 mixed currency and fiscal periods remain visible and unavailable for forced comparison`
- Helper: `openNativeResearchSurface`
- Helper line: 34 at diagnosis time
- Wait: `#rlviews[data-rlexperience-shell="ready"]`
- Timeout source: inherited 5,000 ms Playwright expectation timeout
- Later product assertions: not reached

### Focused Discriminator

The exact title passed 1/1 with one worker and retries disabled. The target took
1.2 seconds. The command took 3.3 seconds.

### Owning-File Discriminator

The complete company-fundamentals browser file passed 32/32 with one worker and
retries disabled. The target took 953 ms. The command took 30.3 seconds.

The two discriminators falsify a deterministic product defect and file-local
state leakage.

## Expected Behavior

The focused target, complete owning file, four-worker suite, and serial suite
must pass with retries disabled. Both complete-suite profiles must retain all
280 current identities across 33 files.

## Actual Behavior

The focused target and owning file pass. The same target can exhaust the local
shell-ready expectation budget when four workers share the host.

## Concurrent Baseline Reconciliation

At current repository HEAD `923833254b9463cfb163cac2aace2b2fb305333b`,
commit `92383325` has additively introduced three browser-test identities in
`tests/portfolio-survival-foundation.spec.mjs` without deleting an identity.
The top-level runner's unrestricted system-Chrome list now reports 280 tests in
33 files. The active complete-suite acceptance baseline is therefore 280
identities across 33 files.

The 277-identity reproduction above remains a historical execution fact and is
not rewritten. The count reconciliation changes no command, retry setting,
worker profile, root cause, code fix, assertion, or behavior requirement.

## Root Cause Classification

### F-BUG001-001: suite-context helper-local readiness budget

`openNativeResearchSurface` is called eight times in the Feature 010 browser
file. It waits for the ready shell, selects Power, and then checks four native
surface contracts.

Only the shell-ready assertion lacks an explicit timeout. It inherits the
5-second Playwright expectation budget. The complete suite can delay shell
attachment beyond that local budget.

The selector remains correct. The Power click, `data-rlview="power"` check,
`rlv-focused` absence check, and detailed-tabs visibility check remain correct.

## Exact Mutation Boundary

Future implementation may change one assertion only:

```diff
-    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
+    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 30_000 });
```

The 30-second value is finite. It gives six times the inherited margin. It is
the maximum allowed without new evidence.

The implementation must preserve these contracts:

- the exact shell-ready selector;
- the Power button click;
- the `body[data-rlview="power"]` assertion;
- the direct `rlv-focused` absence assertion;
- the direct detailed-tabs visibility assertion;
- all eight helper call sites;
- every test title and product assertion;
- workers, retries, dependencies, and Playwright configuration.

The boundary excludes global config, retries, sleeps, catches, interception,
forced actions, optional assertions, product code, dependencies, Feature 004,
BUG-002, BUG-005 through BUG-007, parent Feature 010, certification fields,
and concurrent dirty work.

## Related Contracts

- [Bug specification](spec.md)
- [Routed fix design](design.md)
- [Routed fix scope](scopes.md)
- [Execution evidence](report.md)
- [Scenario contract](scenario-manifest.json)
