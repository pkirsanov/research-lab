# Scope 15 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 15 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-15-01

### TP-15-02

### TP-15-03

### TP-15-04

### TP-15-05

### TP-15-06

### TP-15-07

## Scenario Contract Evidence

### Scenario SCN-008-031

### Scenario SCN-008-032

### Scenario SCN-008-033

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

---

## Scope 15 - Walk-Forward Research Dossier And Claim Boundaries

Scope 15 delivers `walkForwardDossier`, `marketEfficiencyClaim` and
`replacementComparison` in `rlportfolioanalytics.js`, the `ResearchDossier/v1`
record contract and its append-only write path in `rlportfolio.js`, the
Research Dossier route in `portfolio-survival-allocation-lab.html`, and the
four config keys the dossier reads.

All three analytics functions exist to REFUSE a claim the numbers cannot
support. That is the scope, not a caveat attached to it.

### <a id="s15-separation"></a>TP-15-01 - Three figures stay three figures

`walkForwardDossier` returns in-sample, walk-forward and cost-adjusted results
separately. Collapsing them into one "backtest return" is how a rule fitted to
its own history comes to look like a discovery: the in-sample number is the one
the rule was chosen to maximise, so it is the one that means least. The first
fold is training only and is never scored - scoring it would put the fitted
window straight back into the result.

**Command:** `node --test tests/portfolio-analytics.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# tests 79
# pass 79
# fail 0
```

Proven non-vacuous by a controlled break in the fold loop. Starting the scoring
loop at fold 0 instead of fold 1 puts the training window back into the scored
result; `scoredFolds` moved 1 -> 2 and the row went RED:

**Command:** `node --test tests/portfolio-analytics.unit.mjs` (with the fold
loop starting at 0)
**Exit Code:** 1
**Claim Source:** executed
**Output:**

```text
not ok 75 - TP-15-01 in-sample, walk-forward and cost-adjusted results stay three separate figures
# pass 78
# fail 1
```

A second controlled break set a 0.95 correlation threshold on
`replacementComparison`, turning the adjudication row RED. Both reverted; the
suite returned to 79/79.

One process correction belongs here. I briefly read the second break as not
biting. The file write had not landed when the test ran, so a stale file
produced a green run I nearly accepted as evidence that the break did not
matter. Verifying the break is PRESENT (`grep -c 'CONTROLLED BREAK'`) before
trusting a green run is the correction, and it is now the habit.

### <a id="s15-functional"></a>TP-15-02, TP-15-08 - Production projection and the discharged conjunct

**Command:** `node --test tests/portfolio-allocation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
ok 4 - TP-15-02 production dossier projection preserves separation, costs, trials and the claim boundary
ok 5 - TP-15-08 a persisted dossier is swept by the full-personal clear and survives the behavior clear
# tests 5
# pass 5
# fail 0
```

TP-15-08 discharges the `dossiers` conjunct Scope 03 wrote against an assumed
shape. It is verified here because the record now exists: a real
`ResearchDossier/v1` with an appended correction is persisted, then cleared,
then confirmed absent. A conjunct discharged against an imagined record shape
proves nothing about the record that shipped.

### <a id="s15-e2e-031"></a>TP-15-03 - SCN-008-031 separation in the rendered route

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-008-031 dossier separates" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:388:1 › Regression: SCN-008-031 dossier separates in sample walk forward costs and trials (1.4s)

  1 passed (4.2s)
```

Proven non-vacuous. Rendering `walkForwardReturn` in the cost-adjusted row -
the exact shape of a decorative cost line - turned the row RED on the assertion
that costs must strictly reduce the figure:

**Command:** same command, cost-adjusted row bound to `walkForwardReturn`
**Exit Code:** 1
**Claim Source:** executed
**Output:**

```text
    Error: expect(received).toBeLessThan(expected)
    Expected: < 23.87
    Received:   23.87
  1 failed
```

### <a id="s15-e2e-032"></a>TP-15-04 - SCN-008-032 efficiency claim stays scoped

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-008-032 efficiency claim" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:437:1 › Regression: SCN-008-032 efficiency claim is scoped to one tested information set (1.4s)

  1 passed (4.3s)
```

The route names the one form tested and the two forms it did not test. "The
market is inefficient" is not a sentence a test can support: a test uses one
information set over one sample, so its conclusion binds that and nothing else.
The row asserts the untested forms are named, not merely that the tested one is.

### <a id="s15-e2e-033"></a>TP-15-05 - SCN-008-033 no verdict, in either direction

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-008-033 correlation never" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:475:1 › Regression: SCN-008-033 correlation never emits a substantially identical verdict (1.5s)

  1 passed (4.0s)
```

Proven non-vacuous, and specifically in the direction that is easiest to leave
unguarded. Appending "These securities are not substantially identical." to the
boundary copy turned the row RED:

**Command:** same command, with a negative verdict appended to the boundary copy
**Exit Code:** 1
**Claim Source:** executed
**Output:**

```text
    Error: expect(received).not.toMatch(expected)
    Expected pattern: not /\bnot substantially identical\b/
  1 failed
```

Refusing the negative verdict matters exactly as much as refusing the positive
one. Both are legal and tax determinations; handing a user either from a
correlation number would be answering to a tax authority on their behalf.

### <a id="s15-e2e-a11y"></a>TP-15-06 - Responsive and accessible dossier

**Phase:** implement
**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Feature 008 dossier ledgers" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Carrier row:** `tests/portfolio-survival-allocation.spec.mjs:505`
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:505:1 › Regression: Feature 008 dossier ledgers claims corrections and private export remain accessible without mobile overlap (1.5s)

  1 passed (4.4s)
```

### <a id="s15-e2e-broad"></a>TP-15-07 - Cumulative Feature 008 browser suite

**Command:** `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  ✓  67 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:1396:1 › Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth (3.8s)

  67 passed (1.3m)
```

Enabling the Research Dossier route turned four existing pins RED, and each one
was doing its job rather than obstructing. Three route-list pins asserted the
exact set of descriptive route states; a fifth route is a real change to that
set, so all three were updated to the new truth. The fourth was the privacy
matrix, which refused to let a new `dossiers` category appear without being
declared - a stored dossier is personal research data, so it must be in the
clear matrix. None were loosened.

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
================================================
Research-Lab self-test: 1640 passed, 0 failed
================================================
```

### <a id="s15-boundary"></a>Change boundary and one recurring finding

Files changed: `rlportfolioanalytics.js`, `rlportfolio.js`,
`portfolio-survival-allocation-lab.html`,
`portfolio-survival-allocation.config.json`,
`tests/portfolio-analytics.unit.mjs`,
`tests/portfolio-allocation.functional.mjs`,
`tests/portfolio-survival-allocation.spec.mjs`, plus the four pins named above.

This is the SEVENTH occurrence of the config-owner boundary class. Scope 15
needs `walkForwardFolds`, `dossierTrialsSearched`, `efficiencyFormTested` and
`efficiencyInformationSet` in the visible config, and it needs the `dossiers`
section and category - and the exact-key validators for all of them live in
`rlportfolio.js`, which the scope's Allowed-files list excludes. Recording it a
seventh time without normalising it: the boundary is written per-scope as if
each runtime scope owned only its own surface, but every runtime scope that
introduces a config key or a persisted noun must touch the contract owner. The
pattern is structural, so the fix belongs in how boundaries are authored rather
than in another per-scope note. It is a real finding against the plan, not
against the implementation.

**Current-session re-verification receipts.** The DoD item that cites this
section asserts execution outcomes (`git diff --check`, artifact lint/freshness,
clean boundary), so the narrative above is backed here by commands actually run
in this session rather than by prose alone.

**Command:** `git diff --check`
**Exit Code:** 0
**Claim Source:** executed
**Output:** empty. Per the repository empty-output sentinel convention, exit 0
with no output is the "no whitespace or conflict damage found" result, which is
why the exit code is recorded explicitly beside it.

```text
$ git diff --check
$ echo "diff-check exit=$?"
diff-check exit=0
```

**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab`
**Exit Code:** 0
**Claim Source:** executed
**Output:** captured through `evidence-capture.sh`, so the recorded exit code and
hash were produced by the run itself and can be re-derived with the verify line.

```text
# artifact-lint specs/008-portfolio-survival-and-brief-lab
$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab
exit: 0
lines: 406
sha256: ed9142d7152044254040019b1b8b5bda8eb2f0e069f511acdd675c357cff0950
--- last 6 ---
✅ No unfilled evidence template placeholders in scopes/27-accessible-six-tab-interaction/report.md
✅ No unfilled evidence template placeholders in scopes/28-spec-driven-adversarial-test-replacement/report.md
✅ No unfilled evidence template placeholders in scopes/29-documentation-and-registry-truth/report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

<!-- verify: bash bubbles/scripts/evidence-capture.sh --verify ed9142d7152044254040019b1b8b5bda8eb2f0e069f511acdd675c357cff0950 -- bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab -->

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:** the canonical repository check. Note the count is **3426 passed, 0
failed**, not the 1640 recorded earlier in this report — the repository has grown
since that run. This receipt is the current observation and is not a restatement
of the historical number.

```text
# node scripts/selftest.mjs (canonical repository check)
$ node scripts/selftest.mjs
exit: 0
lines: 3912
sha256: 2ef1284cf3af2f7bfef64894a1abb1597bbcc58760df8dfaa477550e53af3152
--- last 3 ---
================================================
Research-Lab self-test: 3426 passed, 0 failed
================================================
```

<!-- verify: bash bubbles/scripts/evidence-capture.sh --verify 2ef1284cf3af2f7bfef64894a1abb1597bbcc58760df8dfaa477550e53af3152 -- node scripts/selftest.mjs -->

**Not re-run, and therefore not claimed here:** the scope-local
`traceability-guard.sh … --current-scope` invocation. That DoD item requires it
to be executed while Scope 15 is the active scope in `state.json`; the active
scope is currently 27, so running it now would report a different scope and would
not be evidence for this one. The whole-feature `--all-scopes` run is recorded in
Scope 16, which is where the Feature Completion Gate places it.
