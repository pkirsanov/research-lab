# Scope 1 Execution Report — Tax Workspace, Federal Rule Pack, And Privacy Foundation

This file is the evidence surface for scope 1. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

The contract layer, the workspace layer, the mandatory configuration and the
first source-qualified federal rule pack are implemented and green at the
contract level. The route-level rows are **not** delivered: this dispatch was
instructed not to create `lifetime-tax-strategy-lab.html`, so every `e2e-ui` row
(TP-01-12, TP-01-13, TP-01-14, TP-01-15) and the two DoD items that depend on a
rendered page remain unchecked.

Revenue Procedure 2025-32 **was retrieved in this session** through the Internal
Revenue Bulletin 2025-45 rendering. All eight present figures — four standard
deductions and four ordinary rate tables — were re-verified digit-by-digit
against the retrieved section 4.01 tables and the section 4.14(1)
standard-deduction table. Section 4.03 of the same authority states only the
maximum zero rate amount and the maximum 15-percent rate amount; it does **not**
state the rate applied above the maximum 15-percent amount, so a contiguous
preferential band table whose final band is unbounded above cannot be
transcribed. All four preferential rate tables therefore ship as
`AbsentFigure/v1` records carrying their code, reason, remediation and
`missingSource`. No figure was derived, interpolated, recalled or taken from the
newsroom summary.

Two defects were found and fixed in this scope's surface:

1. `validateRulePack` refused a deleted required member **twice** — once from
   the presence check and once from the structural validator that then ran over
   the missing member. The design requires one refusal per offending member, so
   the structural validators now skip a member already reported absent.
2. The TP-01-01 citation assertion expected 12 present figures. The shipped pack
   correctly carries 8, because the four preferential tables are `AbsentFigure`
   records. The assertion was corrected to the real coverage boundary.

## Test Evidence

### TP-01-01

Scenario SCN-021-001 — a complete federal pack validates and exposes every
required member.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
Feature 021 Scope 01 — lifetime-tax rule pack contract, resolution, and refusal
  ✓ TP-01-01: the shipped federal pack validates and exposes every required TaxRulePack member
  ✓ TP-01-01: the pack contentSha256 is re-derivable from the pack bytes and equals the configuration pointer
  ✓ TP-01-01: all 8 present figures — four standard deductions and four ordinary rate tables — cite the retrieved revenue procedure with a locator, and none cites the newsroom summary
  ✓ TP-01-01: the pack names all 18 unsupported federal features and states each missing preferential table as a value-free AbsentFigure with its missing source
  ✓ TP-01-01: no file under tax-rules carries a fixture marker
```

Exit code `0` (`SELFTEST_EXIT=0`).

Source verification performed in this session against
`https://www.irs.gov/irb/2025-45_IRB`, Rev. Proc. 2025-32, retrieved 2026-08-17.
Every transcribed figure was checked digit-by-digit:

| Pack figure | Retrieved authority text | Match |
| --- | --- | --- |
| Standard deduction MFJ `32200` | §4.14(1) "Married Individuals Filing Joint Returns and Surviving Spouses (§ 1(j)(2)(A)) \| $32,200" | yes |
| Standard deduction HoH `24150` | §4.14(1) "Heads of Households (§ 1(j)(2)(B)) \| $24,150" | yes |
| Standard deduction single `16100` | §4.14(1) "Unmarried Individuals (other than Surviving Spouses and Heads of Households) (§ 1(j)(2)(C)) \| $16,100" | yes |
| Standard deduction MFS `16100` | §4.14(1) "Married Individuals Filing Separate Returns (§ 1(j)(2)(D)) \| $16,100" | yes |
| Ordinary MFJ edges `24800 / 100800 / 211400 / 403550 / 512450 / 768700` | §4.01 TABLE 1 "$24,800 … $100,800 … $211,400 … $403,550 … $512,450 … $768,700" | yes |
| Ordinary HoH edges `17700 / 67450 / 105700 / 201750 / 256200 / 640600` | §4.01 TABLE 2 "$17,700 … $67,450 … $105,700 … $201,750 … $256,200 … $640,600" | yes |
| Ordinary single edges `12400 / 50400 / 105700 / 201775 / 256225 / 640600` | §4.01 TABLE 3 "$12,400 … $50,400 … $105,700 … $201,775 … $256,225 … $640,600" | yes |
| Ordinary MFS edges `12400 / 50400 / 105700 / 201775 / 256225 / 384350` | §4.01 TABLE 4 "$12,400 … $50,400 … $105,700 … $201,775 … $256,225 … $384,350" | yes |
| Seven ordinary rates `0.10 0.12 0.22 0.24 0.32 0.35 0.37` | §2.01 "The existing seven tax rates of 10%, 12%, 22%, 24%, 32%, 35%, and 37% remain in effect for individual taxpayers", and each §4.01 table | yes |
| Preferential tables, all four statuses: `AbsentFigure/v1` | §4.03 states only "the maximum zero rate amounts and maximum 15 percent rate amounts under § 1(j)(5)(B)". No rate above the maximum 15-percent amount appears anywhere in the retrieved text. | absence confirmed |

### TP-01-02

Scenario SCN-021-002 — a pack missing any one required member is refused
`RLTAX-PACK-INVALID` with the member named, once per member.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

Intended RED, observed before the fix:

```text
  ✗ FAIL: TP-01-02: removing any one required pack member is refused RLTAX-PACK-INVALID exactly once with that member named
```

Diagnosed cause, from a direct probe of `validateRulePack` over each deleted
member. Eight members were refused twice — once by the presence check and once
by the structural validator that then ran over the absent member:

```text
MEMBER_ISSUE sourceRecords ok=false named=2
MEMBER_ISSUE supportedFeatures ok=false named=2
MEMBER_ISSUE unsupportedFeatures ok=false named=2
MEMBER_ISSUE roundingPolicy ok=false named=2
MEMBER_ISSUE expiryPolicy ok=false named=2
MEMBER_ISSUE standardDeductions ok=false named=2
MEMBER_ISSUE ordinaryRateTables ok=false named=2
MEMBER_ISSUE preferentialRateTables ok=false named=2
```

GREEN, same command, after the fix:

```text
  ✓ TP-01-02: removing any one required pack member is refused RLTAX-PACK-INVALID exactly once with that member named
  ✓ TP-01-02: a value-bearing AbsentFigure, a summary-cited figure, an unknown sourceRef, a band gap and a reordered calculationOrder are each refused
```

### TP-01-03

Scenario SCN-021-002 — unsupported year, unsupported jurisdiction, unsupported
income kind and expired pack each produce their own code.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-03: an unsupported year, a non-federal jurisdiction, an expired pack, an unknown filing status and a digest mismatch each refuse by their own code and return no pack
  ✓ TP-01-03: an income kind outside the four supported kinds is refused RLTAX-INCOME-KIND-UNSUPPORTED
```

### TP-01-04

Scenario SCN-021-002 — a mutated resolver that carries a threshold into an
unsupported year or substitutes a zero is proven to fail the refusal assertion.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-04: the guards can fail — a threshold-carrying resolver and a zero-substituting unavailable() are both distinguishable from the real ones
```

### TP-01-05

Scenario SCN-021-001 — `TaxUnavailable/v1` returns a record and no construction
path returns a numeric value.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-05: the RLTAX enum is closed at 12 members, every member constructs a numeric-free TaxUnavailable, and an unknown code is refused
```

### TP-01-06

Scenario SCN-021-001 — the minimum-viable-input boundary, and an unsupplied
domain that blocks no supplied domain.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-06: minimum viable input validates on four declarations, names every missing member, applies no default, and records unsupplied domains without blocking supplied ones
```

### TP-01-07

Scenario SCN-021-001 — exactly one module declares the rule-status enum, the
supported income-kind list and the `RLTAX-*` codes.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-07: exactly one module declares the RLTAX code map, the RuleStatus enum, the income-kind list and the calculation order
```

### TP-01-08

Scenario SCN-021-003 — the Feature 008 byte-identity canary and the
storage-namespace isolation canary.
Command: `node scripts/selftest.mjs` plus a path-scoped `git status`
**Claim Source:** executed

```text
  ✓ TP-01-08: the tax modules reference no Feature 008 surface and every declared storage key sits inside this feature’s own namespace
  ✓ TP-01-08: clearing private data removes exactly the three declared keys, leaves a portfolio-prefixed key untouched, and a foreign key write is refused
```

The path-scoped `git status` is recorded under [Change Boundary](#change-boundary).

### TP-01-09

Scenario SCN-021-001 — a missing, malformed or unknown-version configuration
blocks dependent computation while the privacy inventory stays reachable.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-09: an unknown key, an unknown version and an over-budget sweep are each RLTAX-CONFIG-INVALID, the privacy inventory and clear stay reachable, and no module carries a config or pack fallback
```

### TP-01-10

Scenario SCN-021-001 — top-level function declarations, UMD rather than ESM, no
global `isFinite`.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-10: all 26 pure functions are extractable top-level declarations, the modules are UMD rather than ESM, and no source uses global isFinite
```

**Uncertainty Declaration.** The CSP-parity half of this row is **not** covered.
No page exists in this dispatch, so no CSP meta was authored and none was
compared. That part of the row is unmet, and the corresponding DoD item is left
unchecked.

### TP-01-11

Scenario SCN-021-001 — the pages-site deploy gate accepts this scope's new root
artifacts.
Command: `node scripts/build-pages-site.mjs --dry-run`
**Claim Source:** executed

```text
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":5,"rootFiles":106,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/29d8da3cd15e4160fb3970047c1b5e808f27a372bb889f64066d3f44b9b16c47","omittedOrphanIndexes":133}
PAGES_DRYRUN_EXIT=0
```

`excludedPaths` rose from 1 to 5. The four new entries are `rltaxrules.js`,
`rltaxworkspace.js`, `rltax.js` and `lifetime-tax-strategy.config.json`.

**Uncertainty Declaration.** The row as written also requires the deploy decision
for `lifetime-tax-strategy-lab.html` and the adversarial proof that removing that
entry makes the build refuse. The page is out of scope for this dispatch, so
neither was exercised. The row is partially met and the corresponding DoD item is
left unchecked.

### Scenario SCN-021-001

`Regression: SCN-021-001 minimum viable input resolves one federal pack and names every unavailable domain`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-001 minimum viable input resolves one federal pack and names every unavailable domain" --reporter=list`
**Claim Source:** not-run. No route exists in this dispatch, so the spec was not
authored and the command was not executed.

### Scenario SCN-021-002

`Regression: SCN-021-002 unsupported year jurisdiction and income kind each refuse without substitution`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-002 unsupported year jurisdiction and income kind each refuse without substitution" --reporter=list`
**Claim Source:** not-run, for the same reason.

### Scenario SCN-021-003

`Regression: SCN-021-003 the tax workspace issues zero network requests and keeps every household value local`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-003 the tax workspace issues zero network requests and keeps every household value local" --reporter=list`
**Claim Source:** not-run, for the same reason. The zero-network guarantee is
therefore **unproven at the route level**. Its contract-level half is covered by
TP-01-08 and TP-01-09.

### TP-01-15

The cumulative Scope 01 browser suite over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-00" --reporter=list`
**Claim Source:** not-run, for the same reason.

### TP-01-16

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

Pass-count accounting. The change to `scripts/selftest.mjs` is a single
append-only hunk with zero deletions:

```text
681     0       scripts/selftest.mjs
@@ -11197,0 +11198,681 @@ try {
--- deletions in selftest diff (expect none) ---
0
```

The two appended Feature 021 groups contribute 35 assertions, 17 in Scope 01 and
18 in Scope 02, counted from the run output:

```text
35
---scope01---
17
---scope02---
18
```

Pre-existing assertions therefore total `2492 - 35 = 2457`, all passing, with
zero failures anywhere in the suite. No pre-existing assertion was edited,
relaxed or removed: the hunk boundary above shows every change landing after the
last pre-existing line.

### TP-01-17

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`
**Claim Source:** executed

```text
[spec-test-paths] scanned=569 references=13348 distinctPaths=221 missingPaths=71 baseline=77 new=0 stale=6
  STALE-BASELINE: 6 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/causal-rotation-adversarial.spec.mjs
      tests/causal-rotation-brief.spec.mjs
      tests/causal-rotation-consumers.spec.mjs
      tests/causal-rotation-delivery.spec.mjs
      tests/causal-rotation-pages.spec.mjs
      tests/causal-rotation-registry.spec.mjs
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
PATHS_EXIT=0
```

`new=0`. The six stale entries pre-date this feature and belong to the
causal-rotation work. The baseline file is a protected path in this scope and was
not modified.

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

Every excluded path is byte-identical. The scoped `git status` returns no rows
for `rlportfolio.js`, `rlportfolioanalytics.js`,
`portfolio-survival-allocation.config.json`,
`specs/008-portfolio-survival-and-brief-lab`, `tools.json`, `index.html`,
`rlnav.js`, `README.md`, `notes/README.md`, the market-brief artifacts,
`rlbrief.js`, `briefs/`, `data/`, `brief-history.jsonl`, `watchlist.json`,
`scripts/validate-spec-test-paths.baseline` or `.github/`.

Two working-tree modifications are **not** this feature's.
`scripts/brief-refresh-and-push.sh` and `tests/brief-refresh-atomicity.test.mjs`
were already modified before this dispatch began and were not touched here.

`notes/lifetime-tax-strategy-lab.md` was created by an earlier interrupted run of
this same dispatch. It sits outside the file set this dispatch was authorised to
create. It was left in place rather than deleted, and is surfaced here for an
explicit operator decision.

## Registration Absence

Command: a path-scoped `git status` over the six registration surfaces.
**Claim Source:** executed

The scoped `git status` above covers `tools.json`, `index.html`, `rlnav.js`,
`README.md`, `notes/README.md` and the market-brief artifacts, and returns no
rows for any of them. The tool is registered nowhere.

## Claim Boundary

Command: a text scan over this scope's allowed paths.
**Claim Source:** executed

```text
grep -rniE 'error rate|track record|accuracy|success probability|success rate|win rate|break-?even|lifetime total|self-invalidation' rltaxrules.js rltaxworkspace.js rltax.js lifetime-tax-strategy.config.json tax-rules/federal/2026.json
CLAIM_SCAN_EXIT=1 (1 means zero matches)
```

Zero matches. The contract-level equivalent is asserted in the suite as well:

```text
  ✓ TP-02-10: no source, pack or configuration string claims a probability, a lifetime total, a break-even year, a track record, an accuracy figure or an error rate
```

## Completion Statement

Scope 1 is **partially delivered** and is **not** complete.

Delivered and evidenced: `rltaxrules.js`, `rltaxworkspace.js`,
`lifetime-tax-strategy.config.json`, `tax-rules/federal/2026.json`, the four
`site-exclusions.json` entries for the modules and the configuration, and the
appended contract-level assertion group. Contract rows TP-01-01 through TP-01-10
and repository rows TP-01-16 and TP-01-17 are green with observed output.
TP-01-11 is green for the artifacts this dispatch created.

Not delivered, and left unchecked rather than asserted: the route shell
`lifetime-tax-strategy-lab.html`, its `site-exclusions.json` entry, its CSP
parity check, the `lifetime-tax-foundation.spec.mjs` Playwright spec, and every
`e2e-ui` row (TP-01-12, TP-01-13, TP-01-14, TP-01-15). This dispatch was
explicitly instructed not to create the page, so the route-level zero-network
proof is outstanding.

Scope status remains **In progress**.
