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

#### TP-01-01 intended RED (2026-08-20)

**Claim Source:** executed. Driven by `scripts/red-green-probe.sh`, which installs
its restore trap before it writes, refuses a dirty target, verifies the mutation
landed, reverts, and re-derives the committed blob hash. Block emitted verbatim.

The probe flips the last hex digit of the pack's declared `contentSha256`, so the
pack asserts a digest its own bytes no longer produce. That is the defect this
row's second assertion exists for — a rule pack whose self-description has come
adrift from its content, which is how a silently edited threshold would arrive.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-01 the pack declares a digest that its own bytes no longer produce
file:             tax-rules/federal/2026.json
mutation:         "contentSha256": "sha256:06681e372f4ea15c2f088c7f92de70ce712f05b6aff09c7d3bb819ec9c6753bf"  ->  "contentSha256": "sha256:06681e372f4ea15c2f088c7f92de70ce712f05b6aff09c7d3bb819ec9c6753be"   (1 occurrence(s))
red-exit:         1
red-summary:      Research-Lab self-test: 3167 passed, 5 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=28c096427fc9e5b56d3be4854473dfcccb5f3425 restored=28c096427fc9e5b56d3be4854473dfcccb5f3425)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The intended row failed, and four downstream scopes that pin the same pointer
failed with it, so a drifted digest cannot pass anywhere in the feature:

```
  ✗ FAIL: TP-01-01: the pack contentSha256 is re-derivable from the pack bytes and equals the configuration pointer
  ✗ FAIL: TP-01-03: an unsupported year, a non-federal jurisdiction, an expired pack, an unknown filing status and a digest mismatch each refuse by their own code and return no pack
  ✗ FAIL: TP-03-02: the pack stays valid after the additive insertion, its digest is re-derivable and equals the configuration pointer
  ✗ FAIL: TP-04-02: the profitable Scope 03 fixtures produce their exact prior settlements
  ✗ FAIL: TP-05-01: every Feature 022 preferential fixture produces its exact prior preferential and total figures
```

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

#### TP-01-03 intended RED (2026-08-20)

**Claim Source:** executed, through the same harness. The probe short-circuits
the resolver's effective-tax-year membership test, so a pack is handed back for
a year it does not cover. That is the exact failure mode the scope was written
to prevent — a threshold silently carried into an unsupported year.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-03 the resolver carries a pack into a year it does not cover
file:             rltaxrules.js
mutation:         if (pack.effectiveTaxYears.indexOf(ask.declaredTaxYear) < 0) {  ->  if (false && pack.effectiveTaxYears.indexOf(ask.declaredTaxYear) < 0) {   (1 occurrence(s))
red-exit:         1
red-summary:      Research-Lab self-test: 3170 passed, 2 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
  ✗ FAIL: TP-01-03: an unsupported year, a non-federal jurisdiction, an expired pack, an unknown filing status and a digest mismatch each refuse by their own code and return no pack
  ✗ FAIL: TP-01-04: the guards can fail — a threshold-carrying resolver and a zero-substituting unavailable() are both distinguishable from the real ones
```

This probe also supplies TP-01-04's intended RED, recorded immediately below.

### TP-01-04

Scenario SCN-021-002 — a mutated resolver that carries a threshold into an
unsupported year or substitutes a zero is proven to fail the refusal assertion.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-04: the guards can fail — a threshold-carrying resolver and a zero-substituting unavailable() are both distinguishable from the real ones
```

#### TP-01-04 intended RED (2026-08-20)

**Claim Source:** executed. This row is itself the adversarial row — it asserts
that a threshold-carrying resolver and a zero-substituting `unavailable()` are
distinguishable from the real ones. Its intended RED is therefore the case where
the real resolver *becomes* the carrying one, which is exactly what the TP-01-03
probe above produced: the row failed by name, in the same run, on the same
mutation. No separate block is duplicated here; the evidence is the TP-01-03
block and its second failure line.

**Finding — a second probe at the other half of this row was rejected rather
than counted.** The row names two adversarial variants, and an attempt was made
to exercise the second by replacing the body of `isUnavailable` with
`return true;`, so a substituted zero would be indistinguishable from a refusal.
That mutation did not produce a valid RED: it made five whole selftest groups
throw (`Feature 021 Scope 01 rule-pack group threw: unavailable() refuses an
unknown RLTAX code: undefined`) and drove the suite to `2859 passed, 45 failed`.
The scope's Red/Green contract is explicit that a thrown group is not the
intended contract assertion failing, so the probe is recorded as rejected rather
than reported as a discrimination. The mutation was reverted and blob-hash
verified by the harness like every other. What this leaves is honest and narrow:
the carrying-resolver half of TP-01-04 is proven able to fail; the
zero-substituting half is asserted in-process against a locally constructed
`() => 0` and is not separately mutation-proven, because every mutation broad
enough to break the real detector also collapses the modules that depend on it.

### TP-01-05

Scenario SCN-021-001 — `TaxUnavailable/v1` returns a record and no construction
path returns a numeric value.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-05: the RLTAX enum is closed at 12 members, every member constructs a numeric-free TaxUnavailable, and an unknown code is refused
```

#### TP-01-05 intended RED (2026-08-20)

**Claim Source:** executed, through the same harness. The probe unfreezes the
`RLTAX_CODES` map, so the closed refusal vocabulary becomes an open, mutable
object that any module could extend at runtime. The row's whole purpose is that
the vocabulary is closed and derived from one declaration, so this is the defect
it names rather than a cosmetic edit.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-05 the closed RLTAX refusal vocabulary stops being closed
file:             rltaxrules.js
mutation:         var RLTAX_CODES = Object.freeze({  ->  var RLTAX_CODES = ({   (1 occurrence(s))
red-exit:         1
red-summary:      Research-Lab self-test: 3168 passed, 4 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
  ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members
  ✗ FAIL: TP-01-07: exactly one module declares the RLTAX code map, the RuleStatus enum, the income-kind list and the calculation order
  ✗ FAIL: TP-03-01: every member of the refusal vocabulary is raised from exactly the modules that own it
  ✗ FAIL: TP-05-17: at feature end the refusal vocabulary still carries exactly its fourteen pre-feature members in both directions
```

The live assertion text has moved on from the `12 members` wording captured in
the GREEN block above — Feature 022 added the two jurisdiction-axis members and
superseded the literal count with a module-derived one. The RED line quoted here
is the current text. Both are shown rather than the older one being quietly
overwritten.

### TP-01-06

Scenario SCN-021-001 — the minimum-viable-input boundary, and an unsupplied
domain that blocks no supplied domain.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-06: minimum viable input validates on four declarations, names every missing member, applies no default, and records unsupplied domains without blocking supplied ones
```

#### TP-01-06 intended RED (2026-08-20)

**Claim Source:** executed, through the same harness. The probe makes
`minimumViableInput` write a `standard` deduction mode into the workspace instead
of naming the member as missing. That is the precise clause the row carries —
"applies no default" — and it is the most dangerous shape the defect can take,
because the household is never told a choice was made on its behalf.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-06 minimumViableInput defaults a missing deduction mode instead of naming it
file:             rltaxworkspace.js
mutation:         if (!isPlainObject(workspace) || DEDUCTION_MODES[workspace.deductionMode] !== true) missing.push("deductionMode");  ->  if (!isPlainObject(workspace) || DEDUCTION_MODES[workspace.deductionMode] !== true) workspace.deductionMode = "standard";   (1 occurrence(s))
red-exit:         1
red-summary:      Research-Lab self-test: 3171 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=6760587f2303516755ab6a5e14436050717f1227 restored=6760587f2303516755ab6a5e14436050717f1227)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Exactly one assertion moved, and it is this row:

```
  ✗ FAIL: TP-01-06: minimum viable input validates on four declarations, names every missing member, applies no default, and records unsupplied domains without blocking supplied ones
```

### TP-01-07

Scenario SCN-021-001 — exactly one module declares the rule-status enum, the
supported income-kind list and the `RLTAX-*` codes.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-07: exactly one module declares the RLTAX code map, the RuleStatus enum, the income-kind list and the calculation order
```

#### TP-01-07 intended RED (2026-08-20)

**Claim Source:** executed, through the same harness. The probe declares a second
`RLTAX_CODES` map inside `rltaxworkspace.js`. This is deliberately the harder of
the two directions: the TP-01-05 probe above already showed the row fails when
the single declaration disappears, which only proves it can count to zero. A
second declaration is the drift this row actually exists to catch — two modules
each believing they own the closed vocabulary — and the count must reject it too.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-07 a second module declares its own copy of the closed RLTAX vocabulary
file:             rltaxworkspace.js
mutation:           var WORKSPACE_CONTRACT = "TaxWorkspace/v2";  ->    var RLTAX_CODES = Object.freeze({ "RLTAX-PACK-INVALID": true });\n  var WORKSPACE_CONTRACT = "TaxWorkspace/v2";   (1 occurrence(s))
red-exit:         1
red-summary:      Research-Lab self-test: 3171 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=6760587f2303516755ab6a5e14436050717f1227 restored=6760587f2303516755ab6a5e14436050717f1227)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Exactly one assertion moved, and the duplicate declaration is inert code that
changes no behaviour — so the row is catching the declaration itself, not a
knock-on effect:

```
  ✗ FAIL: TP-01-07: exactly one module declares the RLTAX code map, the RuleStatus enum, the income-kind list and the calculation order
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

#### TP-01-09 intended RED (2026-08-20)

**Claim Source:** executed, through the same harness. The probe adds a single
`|| "rlLifetimeTaxV1"` fallback to one configuration read, so a missing storage
namespace resolves to a hard-coded literal instead of refusing. That is the
"production code contains no policy fallback" clause, and it is the shape that
would otherwise be invisible — the tool keeps working, on a value nobody
configured.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-09 a module starts carrying a silent configuration fallback
file:             rltaxworkspace.js
mutation:               namespace: config.storage.namespace,  ->        namespace: config.storage.namespace || "rlLifetimeTaxV1",   (1 occurrence(s))
red-exit:         1
red-summary:      Research-Lab self-test: 3171 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=6760587f2303516755ab6a5e14436050717f1227 restored=6760587f2303516755ab6a5e14436050717f1227)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
  ✗ FAIL: TP-01-09: an unknown key, an unknown version and an over-budget sweep are each RLTAX-CONFIG-INVALID, the privacy inventory and clear stay reachable, and no module carries a config or pack fallback
```

### TP-01-10

Scenario SCN-021-001 — top-level function declarations, UMD rather than ESM, no
global `isFinite`.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed

```text
  ✓ TP-01-10: all 26 pure functions are extractable top-level declarations, the modules are UMD rather than ESM, and no source uses global isFinite
```

**Uncertainty Declaration (2026-08-18, superseded 2026-08-19).** The CSP-parity
half of this row was **not** covered at the time of that run. No page existed in
that dispatch, so no CSP meta was authored and none was compared.

#### TP-01-10 completion (2026-08-19) — CSP byte-identity

**Claim Source:** executed. The page now exists, so the half declared uncertain
above was exercised. The repository's parity guard is the pre-existing
`all pages use one identical CSP instead of drifting per page` assertion, which
extracts the `content="…"` attribute from every shipped HTML page and requires
the resulting set to have exactly one member. Because `lifetime-tax-strategy-lab.html`
is a shipped page, that single-member set IS the byte-identity claim for it: any
character of difference makes the set size two.

Intended RED, probe I — a single extra directive, `; frame-ancestors 'none'`, was
appended to the page's policy. It is a *tightening*, not a weakening, which is
what makes it the right probe: it is the shape of a well-meant per-page edit that
silently ends the repository's one-policy invariant:

```text
# PROBE-I RED: "; frame-ancestors 'none'" appended to the CSP meta in lifetime-tax-strategy-lab.html
$ node scripts/selftest.mjs
  ✗ FAIL: all pages use one identical CSP instead of drifting per page
  ✗ FAIL: CSP keeps the single-file inline-script design while defaulting to self
  ✗ FAIL: CSP blocks object, base-tag, and form exfiltration paths
  ✗ FAIL: CSP connect-src is an explicit origin allowlist, never wildcard https
  ✗ FAIL: CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-05-06: the route carries no runtime transport beyond one same-origin read of the two local policy documents, writes only the two view-mode literals to the location hash, never w…
Research-Lab self-test: 3060 passed, 7 failed
```

The drift detector is the intended catch. The four `CSP …` rows co-fail because
they read the single agreed policy through the same set, which collapses once it
holds two members — so they are downstream of the same detector rather than
independent breaks. The `committed surface carries no personal identifier` row is
a **pre-existing failure owned by a concurrent session**, present identically in
the baseline and in the GREEN below.

Reverted immediately, then the identical command re-run for GREEN:

```text
$ git status --short lifetime-tax-strategy-lab.html
probeI_revert_dirty_lines=0

$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
Research-Lab self-test: 3066 passed, 1 failed
```

##### TP-01-10 re-probe (2026-08-19, clean baseline)

**Claim Source:** executed. The GREEN above still carried one failure — the
repository's `committed surface carries no personal identifier` assertion, which
this session's first task fixed by rewriting the absolute checkout paths in this
very report to the `<repo>/` form. That fix removes the only contaminant, so the
row was re-probed against a zero-failure baseline. Both captures below are
`evidence-capture.sh` blocks: the `sha256` covers every one of the 3466 lines the
run produced and is re-derivable with `--verify`, so the summary cannot be a
paste.

Intended RED, probe II — a *different* mutation from probe I so the row is not
resting on one perturbation shape. One directive value was flipped inside the
existing policy, `manifest-src 'self'` → `manifest-src 'none'`, changing no
directive count and no other character. A same-length token swap is the hardest
case for a length- or shape-based check and the easiest to miss on review:

```text
# PROBE-CSP RED selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3466
sha256: 214fa5603ef5bb453163f9267ff079e40f90bfd547a9740f7c21163a739e4ea1
  ✗ FAIL: all pages use one identical CSP instead of drifting per page
  ✗ FAIL: CSP keeps the single-file inline-script design while defaulting to self
  ✗ FAIL: CSP blocks object, base-tag, and form exfiltration paths
  ✗ FAIL: CSP connect-src is an explicit origin allowlist, never wildcard https
  ✗ FAIL: CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✗ FAIL: TP-05-06: the route carries no runtime transport beyond one same-origin read of the two local policy documents, … and its CSP is byte-identical to the shared policy
Research-Lab self-test: 3061 passed, 6 failed
```

Six failures, not seven: the personal-identifier row that polluted probe I's
GREEN is gone, so every remaining failure is attributable to the mutation. Two
independent detectors fire — the repository-wide one-policy set AND the Scope 05
`pageCsp[1] === referenceCsp[1]` byte comparison — so the claim does not rest on
a single assertion.

Reverted in the same shell invocation that applied the mutation, the revert
proven, then the identical command re-run for GREEN:

```text
$ git checkout -- lifetime-tax-strategy-lab.html
revert_exit=0
$ git status --short -- lifetime-tax-strategy-lab.html
(no rows)

# PROBE-CSP GREEN selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3466
sha256: fbd2d65ea58af3e4961ec05823ccf52aaeac907dbad0549a9e74f31ce51c3d16
Research-Lab self-test: 3067 passed, 0 failed
```

Both halves of TP-01-10 are now met, against a baseline with zero failures.

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

**Uncertainty Declaration (2026-08-18, superseded 2026-08-19).** The row as
written also requires the deploy decision for `lifetime-tax-strategy-lab.html`
and the adversarial proof that removing that entry makes the build refuse. At
the time of the run above the page was out of scope for that dispatch, so
neither was exercised.

#### TP-01-11 completion (2026-08-19) — the page entry and its adversarial

**Claim Source:** executed. The page now exists and carries its own deploy
decision, so the half declared uncertain above was exercised with the full
non-dry-run command. RED and GREEN below are raw terminal output from the
identical command.

RED — the `lifetime-tax-strategy-lab.html` entry was removed from
`site-exclusions.json` with every other entry left standing:

```
=== PROBE-A RED: lifetime-tax-strategy-lab.html deploy decision removed ===
file://<repo-root>/scripts/build-pages-site.mjs:24
  if (!condition) throw new Error(message);
                        ^

Error: unregistered root page lacks a deploy decision: lifetime-tax-strategy-lab.html
    at assert (file://<repo-root>/scripts/build-pages-site.mjs:24:25)
    at planPagesSite (file://<repo-root>/scripts/build-pages-site.mjs:49:3)
    at buildPagesSite (file://<repo-root>/scripts/build-pages-site.mjs:83:16)
    at file://<repo-root>/scripts/build-pages-site.mjs:110:16
    at ModuleJob.run (node:internal/modules/esm/module_job:447:25)
    at async node:internal/modules/esm/loader:646:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v26.4.0
BUILD_PAGES_EXIT=1
```

The refusal names the page, so it is the intended contract assertion failing
rather than a syntax error or an unrelated break. The absolute checkout path in
the `file://` frames is written `file://<repo>/` here so the committed surface
carries no personal identifier; no other character of the captured output is
changed. The mutation was reverted
immediately and the revert proven before the same command was rerun:

```
=== revert check ===
(empty = clean)
=== PROBE-A GREEN: same command, decision restored ===
{"contractVersion":"pages-site-build-result/v1","dryRun":false,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/004902309400a815a8ac1da2877422310e381d5c20748f711cbd0233e959a67a","omittedOrphanIndexes":144}
BUILD_PAGES_EXIT=0
```

`registeredPages` stays at 28 while the page is carried inside `excludedPaths`,
so the build accepts the page as deliberately unregistered rather than
registering it. Both halves of TP-01-11 are now met.

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

#### SCN-021-003 completion (2026-08-19) — the route-level zero-network canary

**Claim Source:** executed. The route and `tests/lifetime-tax-foundation.spec.mjs`
both exist now, so the half declared not-run above was exercised. RED and GREEN
below are raw terminal output from the identical command.

**A note on probe safety, because the previous attempt at this row got it wrong.**
An earlier dispatch probed this canary by adding
`window.fetch("/rl-probe-telemetry.json?ordinary=" + …)` to the page — a request
carrying the household's declared income in a query string. That is the exact
defect this canary exists to prevent, planted in the shipped page. Reverting it
does not make it acceptable: if the revert had failed, the product would have
shipped an exfiltrator. **A probe for a privacy canary must never construct the
leak it is testing for.** Both probes below are therefore value-free with respect
to transmission — neither one puts a household value anywhere it could leave the
machine, and the worst outcome of a failed revert is a harmless 404, not a
disclosure.

Probe A — the "issues no request" arm. One value-free statement,
`window.fetch("/rltaxprobe-undeclared.js")`, was added to the top of the page's
`render()` function. It has no query string and carries no household value at
all; it is simply a request for an asset the route never declared, which is the
shape of an analytics or CDN beacon arriving by accident:

```text
=== PROBE-NET RED: value-free undeclared same-origin request added to render() ===
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-003" --reporter=list
  ✘  1 [system-chrome] › tests/lifetime-tax-foundation.spec.mjs:287:1 › Regression: SCN-021-003 the tax workspace issues zero network requests and keeps every household value local (835ms)
  1) [system-chrome] › tests/lifetime-tax-foundation.spec.mjs:287:1 › Regression: SCN-021-003 …
    Error: expect(received).toEqual(expected) // deep equality
    - Expected  -  1
    + Received  + 11
      309 |   expect(foreign).toEqual([]);
    > 310 |   expect(unexpected).toEqual([]);
  1 failed
```

The failure is on line 310, `expect(unexpected).toEqual([])` — the derived
declared-asset filter, which is the intended detector rather than an unrelated
break. `Received + 11` is the count of requests the undeclared path accumulated
across the session, so the canary caught every one and not merely the first.
Note the detector fired even though the request carried **no** household value:
the canary refuses undeclared traffic on principle, so a leak channel is caught
when it is opened, not only once something sensitive is pushed through it.

Reverted in the same shell invocation that applied the mutation, with the revert
proven twice — by token count and by path-scoped status — before the identical
command was re-run:

```text
=== REVERT (same invocation) ===
$ git checkout -- lifetime-tax-strategy-lab.html
revert_exit=0
probe_token_remaining=0
$ git status --short -- lifetime-tax-strategy-lab.html
(no rows)

=== PROBE-NET GREEN ===
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/lifetime-tax-foundation.spec.mjs:287:1 › Regression: SCN-021-003 the tax workspace issues zero network requests and keeps every household value local (663ms)
  1 passed (1.8s)
```

Probe B — the "a household value appears in no URL" arm. The mutation appends the
declared ordinary amount to the **location hash**. A hash is the one place a value
can enter the URL without ever being transmitted: browsers do not send the
fragment to the server, and the page already declares `<meta name="referrer"
content="no-referrer">`. So this reproduces the leak the canary tests for, in the
URL, with nothing crossing the network.

**First attempt missed, and the miss is recorded rather than discarded.** Probe B
was first written against `state.input.ordinary`, a path the page does not carry.
The hash became `"#simple-undefined"` — the shape assertion fired, but on the
literal `undefined`, so the *sentinel* arm was never exercised and the probe did
not prove what it claimed:

```text
=== PROBE-URL RED (first attempt — imprecise) ===
    Error: expect(received).toMatch(expected)
    Expected pattern: /^#(simple|power)$/
    Received string:  "#simple-undefined"
    > 360 |   expect(location.hash).toMatch(/^#(simple|power)$/);
  1 failed
```

Re-probed against the real path, `state.workspace.income.ordinary`, so the actual
sentinel reaches the URL:

```text
=== PROBE-URL2 RED: real declared ordinary amount appended to the local hash ===
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-003" --reporter=list
  ✘  1 [system-chrome] › tests/lifetime-tax-foundation.spec.mjs:287:1 › Regression: SCN-021-003 the tax workspace issues zero network requests and keeps every household value local (987ms)
    Error: expect(received).toMatch(expected)
    Expected pattern: /^#(simple|power)$/
    Received string:  "#simple-123457"
      359 |   expect(location.search).toBe('');
    > 360 |   expect(location.hash).toMatch(/^#(simple|power)$/);
      361 |   expect(location.href.includes(SENTINEL_ORDINARY)).toBe(false);
      362 |   expect(location.referrer.includes(SENTINEL_ORDINARY)).toBe(false);
  1 failed
```

`Received string: "#simple-123457"` is `SENTINEL_ORDINARY` — declared in
`tests/lifetime-tax.support.mjs` as `'123457'` — sitting in the URL, so the leak
was genuinely constructed and genuinely caught.

**Which assertion caught it, stated precisely.** Line 360 fired; Playwright stops
the test at the first failure, so lines 361-362 did not execute in this run and
are **not** claimed as demonstrated. That ordering is the correct one and not a
gap: line 360 is an *allow-list of shape* — the hash must be exactly `#simple` or
`#power` — while 361 is a *deny-list of one known value*. The shape guard rejects
any hash carrying anything extra, so it catches this sentinel AND a leak of a
household field for which no sentinel exists, which the substring check would
miss. The stronger assertion is the one in front.

Reverted in the same shell invocation that applied the mutation, revert proven by
token count and path-scoped status, then the identical command re-run:

```text
=== REVERT (same invocation) ===
$ git checkout -- lifetime-tax-strategy-lab.html
revert_exit=0
probe_token_remaining=0
$ git status --short -- lifetime-tax-strategy-lab.html
(no rows)

=== PROBE-URL2 GREEN ===
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/lifetime-tax-foundation.spec.mjs:287:1 › Regression: SCN-021-003 the tax workspace issues zero network requests and keeps every household value local (632ms)
  1 passed (1.7s)
```

Both arms of the canary are now proven sensitive by an observed RED: the route
issues no undeclared request (probe A), and no household value reaches the URL
(probe B). The console and committed-artifact arms are covered by the same test's
`expect(consoleMessages).toEqual([])` and by the repository PII scan, which this
session returned to `findings=0 OK`.


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
