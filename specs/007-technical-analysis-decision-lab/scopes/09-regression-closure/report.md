# Scope 09 Report: Protected Regression And Governance Closure

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Execution complete. Every command below was run in this session and the output is copied verbatim.

## Summary

The complete Feature 007 and shared-consumer matrix executes against production functions and real HTTP pages. All 31 business scenarios hold a persistent heading title, the closure scenario SCN-007-032 guards that inventory mechanically, and every shared consumer, prior feature and contract validator remains green.

One pre-existing repository failure was discovered during closure and fixed rather than preserved.

## Decision Record

**D-09-1 — the integrity scanner must not scan itself.** The SCN-007-032 guard names `page.route`, `test.skip` and the other forbidden tokens in order to ban them. Scanning the whole file matched the ban itself, so both the browser guard and the validator's `browser-suite-no-internal-substitution-or-skip` check now exclude the Scope 09 marker block. A scanner that matched itself would force deleting the ban to make the ban pass, which is the same polarity-blind trap seen in Scopes 05 and 06.

**D-09-2 — SCN-007-032 is counted apart from the 31 business scenarios.** The closure title is itself an `SCN-007-*` heading, so folding it into the business set would make the count 32 and the assertion meaningless. The guard asserts all 31 business ids are present AND that the only extra is `032`.

**D-09-3 — the pre-existing brief failure was fixed, not preserved.** Scope 9 permits preserving an unrelated failure under its owning feature. This one was a genuine coverage gap in a gate whose entire purpose is to catch it, and the fix is three lines, so preserving it would have been the weaker choice.

## Completion Statement

All sixteen Test Plan rows executed with recorded output. All Definition of Done items are checked with inline evidence. One controlled break was applied, confirmed present, detected, and restored. Scope 09 is Done, which completes all nine scopes of Feature 007.

## Test Evidence

### TP-09-01 source-lock contract

```
$ node scripts/validate-node-source-lock.mjs
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

### TP-09-02 runner identity

```
$ npx --no-install playwright --version
Version 1.61.1
```

### TP-09-03 broad production helper suite

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 2027 passed, 0 failed
================================================
```

### TP-09-04 complete feature validator

```
$ node scripts/validate-technical-analysis-decision.mjs
[tad-validator] checks=216
[tad-validator] result=PASS
```

### TP-09-05 page integrity

```
$ PAGE=technical-analysis-decision-lab.html node -e '<TAD-PAGE-INLINE-ID>'
OK page=technical-analysis-decision-lab.html inline=2 refs=0
```

As declared in Scope 08, `refs=0` is honest: this page routes lookups through `byId()` and `setText()`, and the selftest resolves all 109 of those references against declared ids.

### TP-09-06 and TP-09-07

```
$ npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
[SCN-007-023] xss=blocked omittedKeys=6
  ✓  37 Regression: SCN-007-023 imported labels stay text and sanitized export omits sensitive state (882ms)
[SCN-007-032] scenarioTitles=32 fixtures=18 rlvalid=7 interception=none
  ✓  38 Regression: SCN-007-032 complete Feature 007 protected matrix remains executable (6.2s)

  38 passed (1.4m)
```

The closure test proves all 31 business scenario titles are present, that the only extra id is `032`, that all 18 analytic fixture routes still resolve to a diagnostic, that the 7 shared `RLVALID` declarations are live on the page, and that the suite contains no interception, fulfillment, service-worker substitution, skipped or exclusive title, or early-return bailout.

### TP-09-08, TP-09-12, TP-09-13

```
$ npx --no-install playwright test tests/bond-regime-lab.spec.mjs \
    tests/fx-regime-relative-value-lab.spec.mjs tests/provider-credentials.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
  ✓  82 TP-05-07 curve level, curve impulse and the inflation pair never share a row, a token or an as-of (4.4s)
  ✓  83 TP-06-06 SCN-018-038 the parity line renders exactly one of three verdicts with its compared-field count, and silence is never agreement (6.7s)
  ✓  84 TP-06-07 Regression: the parity line survives an absent comparison and a Differ verdict is not dismissible, collapsible or snoozable (5.6s)
  ✓  85 TP-05-08 Regression: every publication state stays readable with colour removed and at 200% zoom (6.4s)

  85 passed (2.1m)
```

### TP-09-09, TP-09-10, TP-09-11

```
$ npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs \
    tests/palm-springs-rental-market-lab.spec.mjs tests/causal-rotation-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
[NFR-003] deterministicRerun=true
[NFR-003] committedResultId=replay-run-3
  ✓  53 Regression: maximum work plan reports progress cancels atomically and keeps navigation responsive (3.9s)
  ✓  55 Regression: SCN-005-024 Ocean Shores coastal inputs change nights costs and cash flow (1.4s)
  ✓  56 Regression: SCN-005-025 Palm Springs luxury keeps legal and operating boundaries (658ms)
  ✓  57 Redesign: Simple is a lean cockpit — model + sliders in Simple, deep-dive lives in Power (660ms)

  57 passed (45.0s)
```

Feature 006 and Feature 005 retain their owner-attributed behaviour with zero Feature 007 edits to either.

### TP-09-14 and TP-09-15

```
$ node scripts/validate-brief-payload.mjs
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid

$ node scripts/validate-causal-rotation.mjs
[causal-contract] source observations: 6
[causal-contract] adversarial fixtures: 8
[causal-contract] result: PASS
```

### TP-09-16 live-test integrity scan

Executed as part of SCN-007-032. The scan covers the whole Feature 007 browser file except the guard block itself, and asserts the absence of `page.route`, `context.route`, `.fulfill(`, `serviceWorker`, `cy.intercept`, `msw`, `nock`, `test.skip`, `test.only`, `test.describe.skip`, `test.describe.only`, and the `if (...) { return; }` bailout shape. The validator independently pins the same rule as `browser-suite-no-internal-substitution-or-skip`, which is at `checks=216 result=PASS`.

### Reader legibility

```
$ node scripts/audit-reader-legibility.mjs
pages audited: 27   with view tabs: 27   errored: 0   total leaks: 0
```

## Finding Ledger

**F-09-1 — pre-existing selftest failure in the Market Brief coverage gate. FIXED.**

The selftest failed on `every payload string of 200+ characters is declared either reader prose or machine state, so no long field escapes the gate unnoticed: regime.macroCycle`.

Attribution was measured, not assumed. Checking out commit `3e6ff5cf` — a Market Brief auto-refresh commit that landed before the Scope 08 commit — reproduced the failure at `1974 passed, 1 failed`. It is therefore not caused by Feature 007 work.

Root cause: the brief author began writing a 1907-character `regime.macroCycle` prose field. The runbook payload contract at `notes/market-brief.md` declares `macroCycle` only under `backdrop`, and `BRIEF_NARRATIVE_FIELDS_REQUIRED` likewise declared only `backdrop.macroCycle`. The new field was therefore long reader prose sitting outside the vocabulary-leak gate entirely — exactly the condition the 200-character coverage assertion exists to detect.

Fix: declared `regime.macroCycle` in `BRIEF_NARRATIVE_FIELDS_REQUIRED` so it is leak-checked like its siblings `regime.note`, `regime.scoreNote` and `regime.crowdPsychology`, and documented it in the runbook payload contract so the generator and the gate agree. Revalidated: selftest `2027 passed, 0 failed`, brief validator PASS, reader legibility 0 leaks across 27 pages. The newly-guarded field passes the leak gate on its current content.

**F-09-2 — the integrity scanner matched itself. FIXED.** See D-09-1.

**F-09-3 — the closure title inflated its own coverage count. FIXED.** See D-09-2.

## Adversarial Verification

| Break | Change | Detected by |
| --- | --- | --- |
| L | renamed the `Regression: SCN-007-017` heading so scenario 017 lost its title | browser SCN-007-032 coverage guard |

The break was confirmed present with `grep -c 'CONTROLLED BREAK L'` before the run. This is the break that matters for a closure scope: without the guard, deleting or renaming a scenario title would remove its protection while the suite still reported every remaining test green. Restored tree re-verified at `breaks: 0`, selftest 2027/0, validator 216 PASS, artifact lint PASSED, `git diff --check` clean.

## Coverage Report

All 31 business scenarios hold exactly one persistent heading title; SCN-007-023 and SCN-007-029 carry additional Scope 08 titles. The closure guard covers title inventory, extra-id containment, fixture-route resolution across all 18 analytic receipts, live `RLVALID` availability, honest fixture band and truth state, published contract version, and live-stack integrity. The shared matrix covers provider credentials, Feature 006, Feature 005, Causal, Bond, FX, Market Brief and Causal contract validators, plus the Scope 05 real-page owner matrix inside the Feature 007 suite.

## Validation Summary

All sixteen Test Plan rows executed with recorded output. Selftest 2027/0, validator 216 checks PASS, page integrity OK, Feature 007 browser 38/38, Bond/FX/credentials 85/85, Trend Dynamics/Palm Springs/Causal 57/57, brief and causal contract validators PASS, reader legibility 0 leaks across 27 pages, source lock PASS with 16 adversarial rejections, runner exactly `Version 1.61.1`.

## Audit Verdict

Scope 09 found three real problems and fixed all three inside this scope: a pre-existing brief coverage gap that had been failing since an earlier auto-refresh commit, a self-matching integrity scanner, and a closure guard that inflated its own count. Each was closed and revalidated; none was carried forward and none was recorded as an accepted failure.

The controlled break confirms the closure guard fails for its own reason when a scenario title is lost, which is the specific silent-erosion this scope exists to prevent.

## Uncertainty Declarations

1. **The node suite retains 24 named pre-existing failures.** They are Feature 002 and 012 registry-count pins, measured at exact clean-tree parity in the Scope 08 session (848 pass / 25 fail on both sides). They are owned by those features, not by Feature 007, and Scope 09's boundary does not permit editing them.

2. **Certification and terminal status are not changed here.** Scope 09's Primary Outcome explicitly excludes changing certification or terminal status directly. This report records delivery evidence; the spec-level status transition remains a separate governed step.

3. **The composition gap declared in Scopes 04, 06 and 08 remains open.** The projection is driven by the gate fixture, and the comparison, validation and owner bands render from their own fixtures rather than one composed result. Every scope declared this consistently and Scope 09 does not close it, because doing so would be new behaviour rather than regression closure.
