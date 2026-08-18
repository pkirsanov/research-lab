# Scope 2 Execution Report — Deterministic Annual Federal Tax

This file is the evidence surface for scope 2. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

`rltax.js` is implemented and green at the contract level: `CO-1` through `CO-9`
in the pack's declared order, the `CO-7` stacking window, the five reconciliation
legs, determinism, precision, and the completeness boundary. The `e2e-ui` rows
(TP-02-11 through TP-02-14) are **not** delivered, because this dispatch was
instructed not to create `lifetime-tax-strategy-lab.html`, so there is no result
panel to drive and no `lifetime-tax-federal.spec.mjs`.

Three defects were found and fixed in this scope's surface:

1. **Engine.** `CO-6` and `CO-7` refused whenever their rate table was an
   `AbsentFigure`, even when the household had **zero** taxable dollars in that
   class. That made an ordinary-only single or married-filing-jointly household
   inherit a refusal on `totalFederalTax`, contradicting the design's coverage
   table, which requires exactly that household to receive a complete
   ordinary-only settlement. A missing table now refuses only when there are
   dollars it would have priced; zero dollars price at zero, which is arithmetic
   rather than a substituted rate.
2. **Assertion.** The TP-02-02 stacking assertion compared `lowOrdinary.income`
   with `highOrdinary.income`. The settlement record has no `income` member, so
   the conjunct compared `undefined` with `undefined` and could never hold. It is
   replaced with the assertion the row actually claims: the long-term gain is
   unchanged, the ordinary income differs, and the tax on the unchanged gain
   differs.
3. **Guard.** The TP-02-07 band-table detector matched any `lowerInclusive:` or
   `upperExclusive:` key, so it fired on the engine echoing the resolved pack's
   band bounds into `bandDetail[]` for display. It now matches a **declared**
   table — a literal assigned to a band member, or a `bands: [` array — and its
   adversarial case proves it still fires on an embedded bracket edge while not
   firing on a pack value echoed into display detail.

## Test Evidence

### TP-02-01

Scenario SCN-021-004 — ordinary-income tax is exact below, at and above every
bracket edge, for every supported filing status.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
Feature 021 Scope 02 — lifetime-tax deterministic annual federal computation
  ✓ TP-02-01: every pack band edge and rate equals the independently transcribed Rev. Proc. 2025-32 schedule
  ✓ TP-02-01: ordinary tax is exact immediately below, exactly at, and immediately above all 24 bracket edges across the four filing statuses (72 checks)
  ✓ TP-02-01: an amount exactly at a band edge sits in the band beginning there, contributes zero dollars to it, and reports the distance to the next edge
```

The source edition and year every fixture is derived from is Rev. Proc. 2025-32,
Internal Revenue Bulletin 2025-45, published 2025-11-03, tax year 2026, retrieved
in this session. The digit-by-digit transcription check is recorded in the Scope 1
report under TP-01-01.

### TP-02-02

Scenario SCN-021-005 — long-term gains and qualified dividends stack above
ordinary taxable income; raising ordinary income alone changes the gain's tax.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

Intended RED, observed before the fix:

```text
  ✗ FAIL: TP-02-02: the preferential amount is taxed in the bands above ordinary taxable income, raising ordinary income alone changes the tax on an unchanged gain, and qualified dividends stack identically
```

GREEN, same command, after the assertion was corrected:

```text
  ✓ TP-02-02: the stacking fixture is a structurally valid pack that can never resolve for a real jurisdiction or a real declared year
  ✓ TP-02-02: the preferential amount is taxed in the bands above ordinary taxable income, raising ordinary income alone changes the tax on an unchanged gain, and qualified dividends stack identically
  ✓ TP-02-02: CO-4 caps the preferential amount at total taxable income, so the deduction is absorbed by ordinary income first and ordinary taxable income never goes negative
```

The stacking arithmetic is proven against the fixture pack
(`jurisdiction: "fixture"`, `effectiveTaxYears: [9999]`), because the shipped pack
carries no preferential table. Preferential bands `[0,100)@0`, `[100,200)@0.15`,
`[200,∞)@0.20`. With ordinary 50 and a gain of 100 the window is `[50,150)` and
the tax is `7.5`. Raising ordinary alone to 150 moves the window to `[150,250)`
and the tax on the **same** gain becomes `17.5`.

### TP-02-03

Scenario SCN-021-005 — a mutated implementation that taxes the gain in isolation
is proven to fail the stacking assertion.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-02-03: the guard can fail — a CO-7 window with the ordinary term dropped taxes the gain in isolation, is blind to ordinary income, and does not match the stacked result
```

The named adversarial mutation is the design's own: the `OTI` term is dropped
from the `CO-7` window. The isolated form returns `0` at both ordinary levels,
proving it is blind to ordinary income, and it does not match the stacked `7.5`.

### TP-02-04

Scenario SCN-021-006 — standard and itemized selection is explicit; no declared
mode yields `RLTAX-INPUT-INCOMPLETE` and no default is applied.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-02-04: standard and itemized modes each publish the applied amount and the mode, and an undeclared mode refuses RLTAX-INPUT-INCOMPLETE rather than applying a default
  ✓ TP-02-04: CO-3 applies the deduction to total income and floors taxable income at zero when the deduction exceeds it
```

### TP-02-05

Scenario SCN-021-006 — the reconciliation identity holds for every fixture and a
deliberately unbalanced result is refused `RLTAX-RECONCILE`.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

Intended RED, observed before the engine fix:

```text
  ✗ FAIL: TP-02-05: the five reconciliation legs are published and hold for a settled result, and a deliberately unbalanced total is refused RLTAX-RECONCILE
```

The cause was defect 1 above. The married-filing-jointly ordinary-only fixture
carries no preferential income, but `CO-7` refused anyway because the preferential
table is an `AbsentFigure`, so `L4` reported `not-evaluable` and the deliberately
unbalanced total could not break the identity.

GREEN, same command, after the engine fix:

```text
  ✓ TP-02-05: the five reconciliation legs are published and hold for a settled result, and a deliberately unbalanced total is refused RLTAX-RECONCILE
```

### TP-02-06

Scenario SCN-021-004 — repeated computation over identical input is
byte-identical, with global `fetch` stubbed to throw for the group.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-02-06: 50 repeated settlements over identical input produce one byte-identical result while any network call throws
```

### TP-02-07

Scenario SCN-021-004 — `rltax.js` holds no tax-domain numeric constant and no
bracket table, and reaches the pack only through Scope 01's resolver.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

Intended RED, observed before the detector was corrected. The offender list in
the message is empty, which is what localised the failure to the band-table
conjunct rather than the numeric-literal conjunct:

```text
  ✗ FAIL: TP-02-07: rltax.js carries no numeric literal beyond 0 and 1, declares no band table of its own, and reads every rate and edge from the resolved pack ()
```

GREEN, same command, after the detector was corrected:

```text
  ✓ TP-02-07: rltax.js carries no numeric literal beyond 0 and 1, declares no band table of its own, and reads every rate and edge from the resolved pack ()
  ✓ TP-02-07: the no-constant detector really flags an engine that embeds a bracket edge, and the band-table detector separates a declared table from a pack value echoed into display detail
```

### TP-02-08

Scenario SCN-021-005 — tax-exempt interest is retained, excluded from taxable
income, and its downstream uses are named rather than dropped.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-02-08: tax-exempt interest is retained as a recorded input, excluded from gross supported income, and changes no tax leg
```

### TP-02-09

Scenario SCN-021-004 — internal precision is preserved and rounding is applied
only at the display boundary, with the pack's rounding policy published.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-02-09: no calculation stage rounds because the pack declares none, the settled value keeps its fractional cents, and rounding appears only in the display record beside the raw value
```

### TP-02-10

Scenario SCN-021-004 — every unsupported federal feature is surfaced and no code
path emits a complete-federal-tax label.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-02-10: an unavailable preferential leg refuses the total by name rather than treating the missing leg as zero, and the supported ordinary leg stays available
  ✓ TP-02-10: all 18 unsupported features are surfaced with the result, completeFederalTax is structurally false, and the published calculation order is the pack's own
  ✓ TP-02-10: no source, pack or configuration string claims a probability, a lifetime total, a break-even year, a track record, an accuracy figure or an error rate
```

### Scenario SCN-021-004

`Regression: SCN-021-004 federal tax is exact below at and above a bracket edge`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-004 federal tax is exact below at and above a bracket edge" --reporter=list`
**Claim Source:** not-run. No route exists in this dispatch, so the spec was not
authored and the command was not executed.

### Scenario SCN-021-005

`Regression: SCN-021-005 long term gains stack on ordinary income`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-005 long term gains stack on ordinary income" --reporter=list`
**Claim Source:** not-run, for the same reason.

### Scenario SCN-021-006

`Regression: SCN-021-006 deduction selection is explicit and the annual result reconciles`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-006 deduction selection is explicit and the annual result reconciles" --reporter=list`
**Claim Source:** not-run, for the same reason.

### TP-02-14

The cumulative Scope 01 and Scope 02 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-00" --reporter=list`
**Claim Source:** not-run, for the same reason.

### TP-02-15

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
================================================
Research-Lab self-test: 2492 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

The full pass-count accounting, including the append-only diff proof and the
per-group assertion counts, is recorded in the Scope 1 report under TP-01-16.
Pre-existing assertions total `2492 - 35 = 2457`, all passing.

### TP-02-16

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`
**Claim Source:** executed

```text
[spec-test-paths] scanned=569 references=13348 distinctPaths=221 missingPaths=71 baseline=77 new=0 stale=6
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
PATHS_EXIT=0
```

## Change Boundary

Command: `git status --short` over the working tree, then over the excluded list.
**Claim Source:** executed

```text
=== FULL WORKING TREE ===
 M scripts/brief-refresh-and-push.sh
 M scripts/selftest.mjs
 M site-exclusions.json
 M tests/brief-refresh-atomicity.test.mjs
?? lifetime-tax-strategy.config.json
?? notes/lifetime-tax-strategy-lab.md
?? rltax.js
?? rltaxrules.js
?? rltaxworkspace.js
?? specs/021-lifetime-tax-strategy-lab/
?? tax-rules/
=== EXCLUDED PATHS (expect no output) ===
=== END (empty above means byte-identical) ===
```

Every path this scope excludes is byte-identical, including Feature 008, the
registries, the market-brief artifacts, `briefs/`, `data/`, `watchlist.json` and
`scripts/validate-spec-test-paths.baseline`. The two unrelated modifications to
`scripts/brief-refresh-and-push.sh` and `tests/brief-refresh-atomicity.test.mjs`
pre-date this dispatch and were not touched here.

`site-exclusions.json` is listed as excluded for Scope 2 on the ground that its
entry was already correct from Scope 1. Its four entries were in fact authored in
this same dispatch as Scope 1 work, and Scope 2 added none.

## Claim Boundary

Command: a text scan over this scope's allowed paths.
**Claim Source:** executed

```text
grep -rniE 'error rate|track record|accuracy|success probability|success rate|win rate|break-?even|lifetime total|self-invalidation' rltaxrules.js rltaxworkspace.js rltax.js lifetime-tax-strategy.config.json tax-rules/federal/2026.json
CLAIM_SCAN_EXIT=1 (1 means zero matches)
```

Zero matches, and `completeFederalTax` is a structural `false` on every result
rather than page copy.

## Completion Statement

Scope 2 is **partially delivered** and is **not** complete.

Delivered and evidenced: `rltax.js` with `CO-1` through `CO-9`, the `CO-7`
stacking window and its adversarial mutation, both deduction modes, the five
reconciliation legs, determinism over 50 repeats with `fetch` throwing, preserved
precision with display-only rounding, and the completeness boundary. Contract
rows TP-02-01 through TP-02-10 and repository rows TP-02-15 and TP-02-16 are
green with observed output.

Not delivered, and left unchecked rather than asserted: the result panel in
`lifetime-tax-strategy-lab.html`, the `lifetime-tax-federal.spec.mjs` Playwright
spec, and every `e2e-ui` row (TP-02-11, TP-02-12, TP-02-13, TP-02-14).

One coverage limit is worth naming plainly. Known-value bracket-boundary coverage
exists below, at and above all 24 edges across all four filing statuses, which is
stronger than the design anticipated, because Rev. Proc. 2025-32 was retrieved and
all four ordinary tables were transcribed. There is **no** known-value coverage of
`CO-7` against the shipped pack, because the shipped pack carries no preferential
table; that arithmetic is proven against the fixture pack only, exactly as the
design directs.

Scope status remains **In progress**.
