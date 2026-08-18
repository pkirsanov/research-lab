# Scope 5 Execution Report — Simple/Power Route, Accessibility, And Local Export

This file is the evidence surface for scope 5. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-05-01

Scenario SCN-021-013 — Simple's rendered field set holds no candidate grid,
per-bracket table, rule trace or raw curve series, and every excluded detail has
a Power link.
Command: `node scripts/selftest.mjs`

### TP-05-02

Scenario SCN-021-013 — Simple and Power read one result envelope and neither
recomputes a tax, a curve point or a conversion amount.
Command: `node scripts/selftest.mjs`

### TP-05-03

Scenario SCN-021-014 — every displayed value has a contextual tooltip sourced
from its own record.
Command: `node scripts/selftest.mjs`

### TP-05-04

Scenario SCN-021-014 — every chart has a text-equivalent table emitted from the
same record.
Command: `node scripts/selftest.mjs`

### TP-05-05

Scenario SCN-021-014 — every unavailable record renders its code, reason and
remediation; a blank, a bare dash and a zero are each proven to fail.
Command: `node scripts/selftest.mjs`

### TP-05-06

Scenario SCN-021-013 — the educational not-tax-advice framing is present and no
page string claims an error rate, a track record, an accuracy figure or a plan
success probability.
Command: `node scripts/selftest.mjs`

### TP-05-07

Scenario SCN-021-015 — the sanitizer removes every identifier category and the
omitted-field manifest matches its actual exclusions exactly.
Command: `node scripts/selftest.mjs`

### TP-05-08

Scenario SCN-021-015 — the written storage key set is unchanged from Scope 01,
clear-all removes every declared private category, and no key carries a portfolio
prefix.
Command: `node scripts/selftest.mjs`

### TP-05-09

Scenario SCN-021-013 — the tool identifier and its page appear in none of the six
registration surfaces.
Command: `node scripts/selftest.mjs`

### TP-05-10

Scenario SCN-021-013 — the finished root page still carries its deploy decision
and the pages-site build accepts it.
Command: `node scripts/build-pages-site.mjs`

### Scenario SCN-021-013

`Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail" --reporter=list`

### Scenario SCN-021-014

`Regression: SCN-021-014 every value is explained and every unavailable state is keyboard reachable`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-014 every value is explained and every unavailable state is keyboard reachable" --reporter=list`

### Scenario SCN-021-014 mobile

`Regression: SCN-021-014 tax and account tables stay readable at the mobile viewport`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-014 tax and account tables stay readable at the mobile viewport" --reporter=list`

### Scenario SCN-021-015

`Regression: SCN-021-015 a private export happens only on explicit action and the request ledger stays empty`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-015 a private export happens only on explicit action and the request ledger stays empty" --reporter=list`

### TP-05-15

The complete cumulative Feature 021 browser suite over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-0" --reporter=list`

### TP-05-16

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-05-17

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

## Regression Remediation — Route Spec Failures (2026-08-17)

**Claim Source:** executed. Every block below is raw terminal output captured in
this session with its real exit code. Nothing here is inferred.

### Entry state

Three of the sixteen Feature 021 browser tests were failing, all four failures
concentrated in `tests/lifetime-tax-route.spec.mjs`. A fourth failure
(`#featureLedgerBody` row count) was latent: the earlier failure at line 62
aborted SCN-021-013 before that assertion could be reached.

### Root cause 1 — product defect: a redundant `change` event destroyed the node under the pointer

`tests/lifetime-tax-route.spec.mjs:62` — following a Power link did not switch
the page into Power mode, and `tests/lifetime-tax-route.spec.mjs:108` — a
displayed value could not take keyboard focus.

Both had a single cause, established by direct in-page probe rather than by
reading the source. Every declaration control was wired to BOTH `input` and
`change`, and both handlers ran the unconditional `onWorkspaceEdit`, which calls
`render()` and rebuilds Simple and Power wholesale. `input` already applied the
edit while the field was being typed into; `change` then fired again when focus
left the field and re-rendered with an identical declaration. The mousedown that
opened a Power link, and the `focus()` that landed on a value, are each the event
that blurs the field — so the node being acted on was detached before the
interaction completed.

The probe that established it, run against the live route:

```
FOCUSPROBE {"before":{"connected":true,"rect":"98.625x39","display":"inline","tabindex":"0",
"outerHTML":"<span class=\"val-figure\" data-rl-value=\"headlineFederalTax\" tabindex=\"0\"
aria-describedby=\"tip-headlineFederalTax\">$7,91","docActive":"INPUT#inputOrdinary",
"hasFocusDoc":true},"afterConnected":false,"active":"BODY#","isSame":false,
"afterRect":"0x0","afterDisplay":""}
CLICKPROBE {"before":"false","after":"true","section":"power-bracket-detail",
"active":"power-bracket-detail","bodyClass":"power","hash":"#power"}
```

`afterConnected: false` is the finding: the element was connected before
`focus()` and detached immediately after it, in the same synchronous step.
`CLICKPROBE` is the control — a programmatic `btn.click()`, which issues no
blur, drives the mode from `false` to `true` and focuses `power-bracket-detail`
correctly. The link handler was never broken; the node it lived on was being
removed before the click could reach it.

Fixed in the product, in `lifetime-tax-strategy-lab.html`. `onWorkspaceEdit` now
compares a signature of the declaration controls and returns without rendering
when no declaration actually changed. An edit that changes nothing is not an
edit. The Simple/Power contract is untouched: Simple remains the decision-first
default, Power still holds the drill-down, and both still read the one already
computed envelope.

### Root cause 2 — test defect: a stale literal in the feature-ledger assertion

`tests/lifetime-tax-route.spec.mjs:67` expected `#featureLedgerBody` to hold 19
rows. The shipped rule pack declares 22 features, and the page renders every one
of them:

```
supported 4
unsupported 18
total 22
```

The page was correct; the literal was stale. Fixed in the spec, and strengthened
rather than merely corrected: the assertion now reads the count off
`tax-rules/federal/2026.json` and additionally asserts that every declared
feature label — supported and unsupported — appears in the rendered ledger. That
is the requirement the scenario exists to prove ("every federal feature the pack
does not support is named"), and it cannot silently stop matching its own data.

### Root cause 3 — test defect: the privacy scan flagged the privacy disclosure

`tests/lifetime-tax-route.spec.mjs:222` flattened the whole export to a lowercase
string and rejected `"name"`. The export contains a `neverCollected` array whose
entire purpose is to NAME the identifier categories the tool refuses to collect,
so the scan reported the guarantee itself as a violation:

```
Expected substring: not "\"name\""
Received string: {... "nevercollected":["name","postal-address","account-number",
"tax-identifier","credential"]}
```

The export is behaving correctly. Fixed in the spec, without weakening the
guarantee. `neverCollected` is excluded from the scanned surface, and that
exclusion is sound only because the assertion immediately above it pins that
array to its exact five declared members with `toEqual`, so no value can hide
inside it. `omittedFields` is deliberately NOT excluded — it names workspace
members the export dropped, so an identifier-bearing member appearing there is a
real signal and must still fail. Three positive controls were added
(`"ordinary"`, `"omittedfields"` and the sentinel household figure must all be
present in the scanned string) so the scan cannot pass by scanning nothing.

### Gate 1 — the five-spec browser suite

Command:
`npx playwright test tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-federal.spec.mjs tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-route.spec.mjs --project=system-chrome --reporter=line`

```
Running 16 tests using 5 workers
  16 passed (5.0s)
exit=0
```

Zero skips, zero `.only`, zero `.fixme`, no timeout was raised.

### Gate 2 — whole-repository selftest

Command: `node scripts/selftest.mjs`

```
================================================
Research-Lab self-test: 2529 passed, 0 failed
================================================
exit=0
```

No assertion in `scripts/selftest.mjs` was weakened or deleted.

### Gate 3 — pages-site build

Command: `node scripts/build-pages-site.mjs --dry-run`

```
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,
"excludedPaths":7,"rootFiles":106,"directories":["briefs","data","docs","notes",
"research","rlexperience-adapters","tests/fixtures"],
"historyIndexDirectory":"briefs/indexes/29d8da3cd15e4160fb3970047c1b5e808f27a372bb889f64066d3f44b9b16c47",
"omittedOrphanIndexes":133}
exit=0
```

### Gate 4 — Bubbles artifact lint

Command: `bash .github/bubbles/scripts/artifact-lint.sh specs/021-lifetime-tax-strategy-lab`

```
✅ Every per-scope directory has a report.md file
✅ No forbidden sidecar artifacts present
✅ All checked DoD items in scopes/05-simple-power-route-accessibility-and-local-export/scope.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes/05-simple-power-route-accessibility-and-local-export/report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
exit=0
```

### Environment gap — declared, not claimed away

The `chromium` Playwright project could not be exercised on this machine. Its
bundled browser binary is not installed
(`Executable doesn't exist at .../chromium_headless_shell-1228/...`). Every
browser result recorded above was produced by the `system-chrome` project only.
This scope therefore claims coverage on system Chrome and makes **no** claim of
cross-browser or bundled-chromium coverage. This is an environment gap on the
executing machine, not a product defect and not a defect in the specs.

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical.

## Registration Absence

Filled at execution. Holds the path-scoped `git status` over `tools.json`,
`index.html`, `rlnav.js`, `README.md`, `notes/README.md` and market-brief
coverage, proving all six are unmodified at feature completion.

## Claim Boundary

Filled at execution. Holds the text scan proving no published error rate, no
self-invalidation statistic, no track record, no accuracy figure and no plan
success probability appears anywhere in the finished route.

## Completion Statement

Filled at execution.
