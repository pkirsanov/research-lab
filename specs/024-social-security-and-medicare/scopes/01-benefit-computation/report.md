# Scope 1 Execution Report — Benefit Computation

This file is the evidence surface for scope 1. Every claim below was observed in
the session that produced it. Where a row was not observed, it says so and the
matching Definition of Done row stays unchecked.

## Summary

The scope is delivered. `rltaxsocialsecurity.js`, the benefit-formula pack, the
two-origin `BenefitBasis/v1`, the sourced row lookup, the exact-boundary
comparison record, stage `CO-20`, the benefit leg, the leg-census extension, four
workspace declarations and the `power-benefit` section are in place, and
`tests/lifetime-tax-benefit.spec.mjs` carries this scope's five browser rows.

Two things changed during this session that the plan did not predict, and both are
recorded rather than absorbed:

1. **SUP-024-09 was admitted under ASC-8.** The route reads a benefit pack from
   disk, and SUP-023-10's permitted-asset derivation named its three pack families
   one key at a time, so the benefit pack was an undeclared request and three
   privacy-ledger assertions failed. The fix is in the product: the benefit pack is
   now DECLARED in `lifetime-tax-strategy.config.json` beside the federal, state
   and property packs, and the derivation reads the family set off the
   configuration. No assertion was weakened or deleted.
2. **The pack's one `AbsentFigure` was closed by a retrieval, and several of its
   quotes were corrected.** An earlier interrupted dispatch left figures in
   `tax-rules/benefit/2026.json` that this session was required to verify rather
   than trust. Every figure verified correct. Four quotes did not, and one
   `AbsentFigure` rested on a statement about the statute that the statute
   contradicts. Both are recorded under [Sourcing](#sourcing).

## Completion Statement

This scope is complete for fourteen of the fifteen Definition of Done rows. One
row stays unchecked and states its reason in
[scope.md](scope.md#definition-of-done) and again here:

- **Per-row intended-RED evidence is now recorded for nineteen of the
  twenty-eight Test Plan rows, and is still absent for nine.** Same-command GREEN
  is recorded for every row. A later session closed the gap for TP-01-01 through
  TP-01-10, TP-01-12, TP-01-13, TP-01-15, TP-01-16, TP-01-17 and TP-01-19 by
  reverting each assertion's subject in the product, observing the named
  assertion fail under the row's own command, restoring the subject
  byte-identically and re-running the identical command — recorded under
  [Per-Row Intended RED And Same-Command GREEN](#per-row-intended-red-and-same-command-green).
  TP-01-14 and TP-01-26 carry a RED observed under another row's probe rather
  than a probe of their own. TP-01-18 and SUP-024-09 carried RED already.
  **Still without any intended RED: TP-01-11, TP-01-20, TP-01-21, TP-01-22,
  TP-01-23, TP-01-24, TP-01-25, TP-01-27 and TP-01-28.** TP-01-25's named
  `--grep "SCN-02"` command still has not been run; the full
  `tests/lifetime-tax-*.spec.mjs` suite was run instead, which is a superset of
  the rows that selector matches, and its output is recorded below.


## Sourcing

Every source below was retrieved in this implementation session and every figure
was verified digit by digit against the retrieved page. `BI-1` through `BI-5` are
closed.

| Source | URL | `retrievedAt` | Verified in this session |
| --- | --- | --- | --- |
| Primary Insurance Amount | `https://www.ssa.gov/oact/cola/piaformula.html` | 2026-08-18 | Bend points `$1,286` and `$7,749`, scoped by the page's own sentence to 2026 |
| Compilation Of The Social Security Laws, Sec. 215 | `https://www.ssa.gov/OP_Home/ssact/title02/0215.htm` | 2026-08-18 | The three percentages at `(a)(1)(A)(i)–(iii)`; the `$0.10` PIA truncation; the `$1` monthly-benefit truncation at `(g)`; the `$1` AIME-quotient truncation at `(e)(2)`; the annual re-establishment formula at `(a)(1)(B)` |
| Average Wage Index (AWI) | `https://www.ssa.gov/oact/cola/awidevelop.html` | 2026-08-18 | All 40 rows 1985–2024, each digit; the `[see data for prior years]` marker below 1985 that bounds the declared domain |
| Benefit Calculation Examples for Workers Retiring in 2026 | `https://www.ssa.gov/oact/ProgData/retirebenefit1.html` | 2026-08-18 | The indexing rule, the highest-35 rule, the 420-month divisor, `Highest-35 total 2,446,845`, `AIME 5,825` |
| … — Primary Insurance Amount | `https://www.ssa.gov/oact/ProgData/retirebenefit2.html` | 2026-08-18 | `.9(1286) + .32(5825 - 1286) = $2,609.88`; `truncated to the next lower dime, or $2,609.80`; `reduced for 60 months`; `$1,826.00`; the case-B `$4,152.40 → $4,152.00` dollar truncation |
| Normal Retirement Age | `https://www.ssa.gov/oact/ProgData/nra.html` | 2026-08-18 | All 13 rows; the January-first note; the open-ended `1960 and later` terminal row |
| Early or Late Retirement? | `https://www.ssa.gov/OACT/quickcalc/early_late.html` | 2026-08-18 | `5/9 of one percent … up to 36 months`, `further reduced 5/12 of one percent per month`, and the worked 30-percent maximum |
| Starting Your Retirement Benefits Early | `https://www.ssa.gov/benefits/retirement/planner/agereduction.html` | 2026-08-18 | The open-ended terminal row `1960 and later / 67 / 60 / $700 / 30.00%`, quoted as the early-reduction invariance contrast |
| Delayed Retirement Credits | `https://www.ssa.gov/benefits/retirement/planner/delayret.html` | 2026-08-18 | All 6 rows including `1943 or later / 8.0% / 2/3 of 1%`; `The benefit increase stops when you reach age 70.` |

### Figures verified against the pack as it stood, and found correct

Every bend point, percentage, wage-index row, full-retirement-age row, reduction
factor, delayed-credit rate, stopping age and rounding multiple already present in
`tax-rules/benefit/2026.json` was re-derived from the retrieved pages and matched.
**No figure was changed.**

### Quotes corrected, because they could not be verified in this session

The retrieval tool consistently truncated the `PIA formula` prose block of
`piaformula.html`, and returned no table or footnote from `earlyretire.html`. Four
quoted strings therefore could not be verified against a page retrieved here, and a
quote that cannot be verified is not evidence regardless of whether it is correct.
Each was re-anchored to text that WAS verified:

| Member | Was cited to | Now cited to |
| --- | --- | --- |
| `bendPointSet.quotedFormula` | `piaformula.html` "PIA formula" items (a)/(b)/(c) | the same page's `PIA formula bend points` paragraph, quoted verbatim |
| `bendPointSet` percentages | `piaformula.html` | `ssa-act-215` Sec. 215(a)(1)(A)(i)–(iii), quoted verbatim, cross-stated by the worked case-A formula |
| `bendPointSet.roundingRule` | `piaformula.html` "We round this amount…" | `ssa-act-215` Sec. 215(a)(1)(A) closing clause, quoted verbatim, cross-stated by `truncated to the next lower dime` |
| `earlyReductionRule` | `earlyretire.html` footnote c | `early_late.html` row `Early retirement reduces benefits`, quoted verbatim |
| `fullRetirementAgeTable.yearInvarianceBasis` | a phrase not present in the retrieved page | the page's own `The table below shows how NRA varies by year of birth for retirees.` plus its open-ended terminal row |

### The `AbsentFigure` that was closed

`indexingRule.quotientRounding` shipped as an `AbsentFigure/v1` whose stated reason
read, in part: *"Sec. 215(b)(1) of the statute likewise defines the quotient and
states no rounding for it; the statute's only roundings are the $0.10 truncation …
the $1 rounding of established bend-point amounts … and the $1 truncation of the
monthly benefit in Sec. 215(g) — none of which is the quotient."*

That sentence is false, and the document it is about is the one that falsifies it.
**Sec. 215(e)(2)** reads:

> if an individual's average indexed monthly earnings … computed under subsection
> (b) or for the purposes of subsection (d) is not a multiple of $1, it shall be
> reduced to the next lower multiple of $1.

That is the quotient rounding, stated in its own text, in a subsection the earlier
transcription did not read. Leaving the absence in place would have shipped a false
claim about a retrieved primary source, which is the failure this feature's sourcing
rule exists to prevent, so the figure is transcribed with its locator and the member
carries a `retrievalNote` recording that the earlier transcription read only
`(b)(1)`. The rule is transcribed from the statute and is **not** inferred from the
worked example; the example is recorded as corroboration only.

Closing it makes the computed origin settle, which is why the shipped pack now
carries no `AbsentFigure` at all and why TP-01-06 and TP-01-11 were rewritten (see
[Test Evidence](#test-evidence)).

### Edition year, judged per component kind

| Component kind | Edition | Basis |
| --- | --- | --- |
| Bend-point dollar amounts | 2026, the declared year | The page scopes them itself: `These dollar amounts are the "bend points" of the 2026 PIA formula.` No invariance basis is required or claimed |
| The three percentages, both PIA roundings, the AIME quotient rounding | statute, undated | Quoted `yearInvarianceBasis` on each: the same document supplies an explicit annual re-establishment formula for the DOLLAR amounts at `(a)(1)(B)` and says nothing of the kind for these, which is the publication's own dating contrast |
| Wage-index rows | undated page | The table is keyed by its own `Year` column, so a row is the figure FOR the year it names |
| Full-retirement-age rows, early reduction, delayed credit, stopping age | undated pages | Each carries a quoted open-ended terminal row keyed by year of birth — a table scoped to a publication year could not state a value for birth years later than its own publication |

## Supersession Ledger

### SUP-024-01 — delivered, intended RED and GREEN both observed

**Superseded clause, verbatim:** `taxExtracted === 26`, together with the sentence
`TP-01-10: all 26 pure functions are extractable top-level declarations`.
**Shape:** `derive`.

**Replacement:** the count is derived from the scanned module set and the
per-module breakdown is asserted, so a module contributing nothing fails by name
rather than being masked by another contributing extra.

**Intended RED.** SUP-024-01 was delivered by the earlier interrupted dispatch,
which recorded no RED, so this session produced one: the superseded literal's own
value was asserted against the delivered module set and the identical command was
run. `node scripts/selftest.mjs`, exit **1**:

```
  ✗ FAIL: TP-01-18 (SUP-024-01): the extractable-function count is derived from the scanned module set rather than pinned to a literal, the per-module breakdown is asserted so a module contributing nothing fails by name, a function rewritten as an arrow const is proven not to be extracted, and the superseded literal survives nowhere outside its own marker comment
Research-Lab self-test: 2740 passed, 1 failed
```

That is the intended contract failure and not an incidental one: the superseded
literal pinned 26, and the delivered tree carries 39.

**GREEN**, identical command after restoring the derived form, exit **0**:

```
Research-Lab self-test: 2741 passed, 0 failed
derived per-module breakdown: {"rltaxrules.js":11,"rltaxworkspace.js":10,"rltax.js":9,"rltaxsocialsecurity.js":9}
derived total = 39 (superseded literal pinned 26)
```

**Adversarial evidence.** A function rewritten as an arrow const is proven not to
be extracted, and the superseded literal is proven to survive nowhere outside its
own marker comment — the needle for that check is assembled from parts so it cannot
match itself. Both pass in the GREEN run.

### SUP-024-09 — admitted under ASC-8 in this session

**Superseded clause, verbatim**, as it stood in all three privacy-ledger specs:

```js
  const packs = [config.rules.packPath]
    .concat(Object.keys(config.rules.statePackPaths || {})
      .map((key) => config.rules.statePackPaths[key]))
    .concat(Object.keys(config.rules.propertyPackPaths || {})
      .map((key) => config.rules.propertyPackPaths[key]))
    .map((path) => '/' + path);
```

**Shape:** `strengthen`. **Replacement:** `declaredPackPaths(config)` in
`tests/lifetime-tax.support.mjs`, which derives the pack set from every pack-path
member `config.rules` declares, paired with the product change that makes the route
declare its benefit pack in that configuration rather than assembling the path
inline.

**What is preserved:** the original promise — no request may go anywhere the page
did not declare — is unchanged, and its two adversarial pins (the derivation is
neither everything nor nothing) are retained verbatim.

**What is added:** the FAMILY set is derived too, so a pack family a later scope adds
is admitted by the configuration's own declaration and never by an edit to three
copies of a key list. Scopes 03 and 04 add a mortality and a medicare family and
need no further entry.

**Intended RED**, `npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line`, exit **1**:

```
  3 failed
    [system-chrome] › tests/lifetime-tax-foundation.spec.mjs:282:1 › Regression: SCN-021-003 the tax workspace issues zero network requests and keeps every household value local
    [system-chrome] › tests/lifetime-tax-property.spec.mjs:312:1 › Regression: SCN-023-001 the request ledger stays empty and no property declaration reaches a URL
    [system-chrome] › tests/lifetime-tax-route.spec.mjs:251:1 › Regression: SCN-021-015 a private export happens only on explicit action and the request ledger stays empty
  34 passed (13.6s)
```

Full capture: `sha256:4451e8e703ca375382565fd564054596ab06adde96e411263aeedbd7fe72cd07`.

**GREEN**, identical command, exit **0**: `42 passed` — full capture
`sha256:c2bbb12652fa4671d622d6c37c157738f848c729702a0a5cfbe0ce108f4de5e3`.

**Adversarial evidence, seen to fail before it was seen to pass.** The first
replacement matched keys against `/PackPaths?$/`, which is capitalisation-sensitive
and therefore silently dropped `config.rules.packPath` — the federal pack itself.
The adversarial pin caught it on the next run, exit **1**:

```
Error: expect(received).toContain(expected) // indexOf
Expected value: "/tax-rules/federal/2026.json"
```

Full capture: `sha256:e95375071bd2abd58b0eedcb43ea52574a444378986139cc2a888a7f232fdce3`.
The boundary was corrected to `/[Pp]ackPaths?$/` and a pin on **both declaration
shapes** was added, so the same defect cannot recur silently. The remaining
adversarial cases — a family present only in a constructed configuration, and
`packContentSha256` never mistaken for a path — pass in the GREEN run above.

**ASC-8 four-surface update, made in the same change:** the ledger row in
[`spec.md`](../../spec.md#supersession-ledger); its opening count paragraph, eight to
nine; the ownership table in [`_index.md`](../_index.md#ownership), Scope 01 one to
two; and the per-file marker distribution in
[`design.md`](../../design.md#per-file-marker-distribution), which now places
SUP-024-09 in the shared support module and the three specs and names Scope 01 as
their owner. That last update is what makes opening those files admissible.

### ASC-9 naming decision

None required. No member name, attribute value or string this scope delivers falls in
the neighbourhood of a forbidden token, and nothing was renamed. TP-01-CLAIM scans
the module, the pack, the settlement and both refusals and passes.

## Change Boundary

`git status --short` over the excluded list, exit **0**:

```
 M site-exclusions.json
```

`site-exclusions.json` carries only the eight Lifetime Tax entries added by Features
021 through 023. This scope did not touch it, and
`node scripts/build-pages-site.mjs --dry-run` reports `excludedPaths: 9` unchanged.
Every other excluded path — `rlportfolio.js`, `rlportfolioanalytics.js`,
`portfolio-survival-allocation.config.json`,
`specs/008-portfolio-survival-and-brief-lab/**`, `tools.json`, `index.html`,
`rlnav.js`, `README.md`, `notes/README.md`, `watchlist.json`,
`scripts/build-pages-site.mjs`, `scripts/validate-spec-test-paths.baseline`,
`market-brief.*`, `briefs/**`, `data/**` — is byte-identical.

`tax-rules/federal/**` is untracked, so its byte-identity is proven the stronger way
instead: the configuration declares the federal pack's content digest, and
`RULES.resolveRulePack` re-derives it at load. Exit **0**:

```
declared digest : sha256:b4a5e68d96b50eae5dc4780cffc227da94eefb6d92ba23eb7206b766262a4afe
resolveRulePack ok = true (federal pack matches its declared digest byte for byte)
```

That is the evidence for the boundary's own claim: establishing what a benefit is did
not require an income-tax pack edit.

The Change Boundary in [scope.md](scope.md#change-boundary-and-protected-paths) was
corrected in this session to add `lifetime-tax-strategy.config.json` and the four
SUP-024-09 test files to the allowed-modified list, because the delivery made its
previous text false. Correcting the boundary rather than checking a row against a
boundary the work had already left is the rule this scope operates under.

## Claim Boundary

TP-01-CLAIM passes: neither the module, the shipped pack, the settlement nor either
refusal states a probability, a plan success figure, a future-year figure, a track
record, an error rate or a typical benefit, and the detector is proven to fire on a
sentence that does. The route renders a line saying the figure is one declared claim
age settled against sourced factors rather than a projection, and TP-01-22 asserts
that line is present.

## Scenario Evidence

### Scenario SCN-024-001

`tests/lifetime-tax-benefit.spec.mjs` rows TP-01-20 and TP-01-24, both passing in the
suite run below. Neither-declared refuses `RLTAX-INPUT-INCOMPLETE` on domain
`benefit-basis:neither-origin-declared` naming both accepted declarations;
both-declared refuses on `benefit-basis:both-origins-declared` naming the ambiguity;
the two domains are asserted distinct so a copy edit cannot collapse them; and
`#power-benefit [data-rl-value]` count is `0` in both, so neither refusal shows a
figure computed from either declaration.

### Scenario SCN-024-002

Row TP-01-21, passing. The computed origin over the authority's own case-A earnings
renders `5,825`, `2,610`, `1,286`, `7,749` and all three percentages; the three
sourced rows each carry a citation naming the publication and its locator while the
declared rows say they carry none; a birth year whose indexing year falls outside the
wage series' declared domain refuses the computed origin alone; and the declared
origin settles `$21,912` in the same run.

### Scenario SCN-024-003

Row TP-01-22, passing. The full-retirement-age row, the 60 months counted and the
`$1,826` monthly benefit are rendered; the January-first applicability note is
surfaced rather than silently applied; a claim past the sourced stopping age produces
the identical figure to a claim at it and the record says the bound applied; and a
birth year beneath the delayed-credit table's declared domain refuses
`RLTAX-THRESHOLD-UNAVAILABLE` naming the domain, with no adjustment row and no `$0`.

## Per-Row Intended RED And Same-Command GREEN

Recorded in a later evidence session against HEAD `639527bbc`. The method for
every row below is the same and was carried out in full each time: revert the
assertion's own subject **in the product** with a small mutation, run the row's
own command and observe the **named** assertion fail, restore the subject
byte-identically, and re-run the **identical** command. No test was edited,
weakened, skipped or retimed; every mutation is in product code, a product pack
or the route page.

Each run was captured through `.github/bubbles/scripts/evidence-capture.sh`,
which records the command, the exit code, the line count, a sha256 over all 3215
lines of output, and the failure-shaped lines. The command for every row here is
`node scripts/selftest.mjs`. The clean baseline is **2843 passed, 0 failed**,
exit **0**.

| Row | Mutation applied to the subject | RED exit | RED count | RED sha256 | GREEN exit | GREEN sha256 |
| --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | `rltaxsocialsecurity.js` `citationFor` no longer refuses a sourced figure carrying no locator | 1 | 2842 / 1 | `252d033b1533…` | 0 | `f0a103e1dca5…` |
| TP-01-02 | the both-origins refusal carries `acceptedDeclarations` instead of `ambiguousDeclarations`, collapsing the shape separation | 1 | 2842 / 1 | `ce0d9bdee114…` | 0 | `d4dede8228bd…` |
| TP-01-03 | the both-origins branch is disabled, so the resolver falls through and prefers the statement amount — the scope's named intended-RED shape | 1 | 2841 / 2 | `3bb3b18014d6…` | 0 | `33f5a0853664…` |
| TP-01-04 | each bend-point percentage is applied to the whole rather than to the portion its own breakpoint delimits | 1 | 2840 / 3 | `ca59f5b9277b…` | 0 | `721f9e6dc104…` |
| TP-01-05 | same mutation as TP-01-04 — it is precisely the whole-not-portion defect TP-01-05 exists to catch | 1 | 2840 / 3 | `ca59f5b9277b…` | 0 | `721f9e6dc104…` |
| TP-01-06 | the computed origin no longer refuses on an `AbsentFigure` wage-indexing series | 1 | 2842 / 1 | `e658bf890e2d…` | 0 | `72444c189e70…` |
| TP-01-07 | the full-retirement-age row publishes `totalMonths` one month off the sourced row | 1 | 2838 / 5 | `45613eff5db6…` | 0 | `a46faea6faf2…` |
| TP-01-08 | `lookupSourcedRow` no longer refuses outside its declared domain, so it clamps to the neighbouring row | 1 | 2841 / 2 | `b28ed501ba04…` | 0 | `aefe17d7a01e…` |
| TP-01-09 | the delayed credit is no longer bounded by the sourced stopping age | 1 | 2841 / 2 | `32008a2fec04…` | 0 | `2c934c0e3b56…` |
| TP-01-10 | same mutation as TP-01-09 — accrual past the sourced stopping age is the defect TP-01-10 exists to catch | 1 | 2841 / 2 | `32008a2fec04…` | 0 | `2c934c0e3b56…` |
| TP-01-12 | the composed benefit leg publishes `includedInTotal: true` instead of the pack's declared value | 1 | 2842 / 1 | `87c984be1c95…` | 0 | `26846ff60680…` |
| TP-01-13 | the leg-census finding detail no longer names the failing surface | 1 | 2840 / 3 | `3b8d1641c77e…` | 0 | `74aa08ff0df8…` |
| TP-01-15 | a real bend point is planted as executable code in `rltaxsocialsecurity.js` | 1 | 2842 / 1 | `50769f81e217…` | 0 | `9b4729e2a0ff…` |
| TP-01-16 | the earnings record is removed from `BENEFIT_RECORD_DECLARATIONS`, so a declaration ships uninventoried | 1 | 2842 / 1 | `3e448dce6a5a…` | 0 | `3e202525164b…` |
| TP-01-17 | one `Number.isFinite` in the module is replaced by the bare global | 1 | 2842 / 1 | `af1a72f92935…` | 0 | `f7150215ac1c…` |
| TP-01-19 | `inputBenefitClaimAgeMonths` is removed from the route's `DECLARATION_INPUTS` list | 1 | 2841 / 2 | `34f7ae3acb53…` | 0 | `1f72fd1ad416…` |

### The named failure text, row by row

Each RED run printed the failing row by its own persistent title. Two examples,
verbatim from the capture:

```
  ✗ FAIL: TP-01-03: an implementation preferring the statement amount when both origins are declared is proven to produce a figure instead of a refusal and to name the precedence it took, the delivered resolver refuses and carries no figure, no precedence branch exists in the module’s code, and the …
Research-Lab self-test: 2841 passed, 2 failed
```

```
  ✗ FAIL: TP-01-09: an early claim applies the sourced per-month factors for the months counted and publishes each one in its own segment — reproducing the authority’s published monthly benefit for its own worked example — a claim at the full retirement age counts zero months, and a delayed claim ac…
  ✗ FAIL: TP-01-10: an implementation accruing delayed credit past the sourced stopping age produces a larger figure than the bounded one and is proven to differ, and one folding the months into a single multiplier publishes no per-month factors and is proven to fail the published-factors assertion
Research-Lab self-test: 2841 passed, 2 failed
```

### Rows whose RED came from another row's probe rather than their own

These two are recorded as RED honestly but are weaker evidence than the rows
above, because no mutation was aimed at them:

- **TP-01-14** failed under the TP-01-08 probe. Its vocabulary-count arms held;
  what failed was its raising-site arm, which asserts that the out-of-domain
  birth year still raises `RLTAX-THRESHOLD-UNAVAILABLE`. The counts themselves
  were never reverted, so TP-01-14's central claim has no probe of its own.
- **TP-01-26** — *the whole-repository suite stays green and the pre-existing
  pass count does not fall* — is the same command as every row above. All
  sixteen RED runs are simultaneously a same-command RED for it (exit 1, pass
  count fallen), and all sixteen GREEN runs are its same-command GREEN.

### Collateral failures, and why they are reported rather than absorbed

Three probes failed more than their target row, and in each case the extra
failure is the shared surface behaving correctly rather than a second defect:

- The TP-01-04/05 probe also failed **TP-01-06b**, the end-to-end check against
  the authority's own worked example. That is the point of TP-01-06b: a wrong
  portion arithmetic must move a published figure.
- The TP-01-07 probe (one month off the sourced row) also failed **TP-01-06b**,
  **TP-01-09**, **TP-01-10** and **TP-01-12**, because the full retirement age is
  the input to the months counted and to the settled leg value. Those three rows
  additionally hold their own dedicated probes above, so none of them rests on
  this one.
- The TP-01-13 probe also failed **TP-02-17** and **TP-04-19**, the equivalent
  rows in Scopes 02 and 04. The leg-census helper is shared by design and this
  is direct evidence that the later scopes genuinely consume it unchanged.
- The TP-01-19 probe also failed **TP-05-12**, which asserts the same
  registration property over the whole control list.

**No product defect was found while producing this evidence.** Every mutation
was reverted and every assertion returned to green; nothing observed here
indicates a fault in the delivered scope.

### Rows still without any intended RED

Nine rows carry same-command GREEN only:

| Row | Command | Why it is still open |
| --- | --- | --- |
| TP-01-11 | `node scripts/selftest.mjs` | The sourcing census was not probed. Closing it means breaking one shipped pack member's locator or `sourceRef`, or planting a smuggling `AbsentFigure`, and observing the row fail. |
| TP-01-20 | the row's `--grep` browser command | No browser probe was run in this session. |
| TP-01-21 | the row's `--grep` browser command | As above. |
| TP-01-22 | the row's `--grep` browser command | As above. |
| TP-01-23 | the row's `--grep` browser command | As above. |
| TP-01-24 | the row's `--grep` browser command | As above. |
| TP-01-25 | `--grep "SCN-02"` | The named command has still never been run at all, in RED or in GREEN. |
| TP-01-27 | `node scripts/validate-spec-test-paths.mjs` | Not probed. Closing it means adding a spec reference to a non-existent test path and observing `new>0`. |
| TP-01-28 | `node scripts/build-pages-site.mjs --dry-run` | Not probed. Closing it means removing a required exclusion entry and observing the build refuse. |

### Byte-identity of every revert

After the last probe, `git status --porcelain` over the whole repository, exit
**0**:

```
?? company-intelligence-lab.html
?? company-intelligence.config.json
?? notes/company-intelligence-lab.md
?? rlcompanyintel.js
?? specs/025-company-multi-horizon-intelligence-lab/
?? specs/026-actionable-brief-brevity-and-cross-asset/
?? tests/company-intelligence-lab.spec.mjs
?? tests/company-intelligence.unit.mjs
```

Every entry is untracked and belongs to other features; none was created,
opened or modified by this evidence work. No tracked file is modified, which is
the proof that all sixteen mutations — across `rltaxsocialsecurity.js`,
`rltaxrules.js`, `rltax.js`, `rltaxworkspace.js`, `rltaxproperty.js` and
`lifetime-tax-strategy-lab.html` — were reverted byte-identically. The tree
closes at **2843 passed, 0 failed**, exit **0**, full-output
`sha256:0fe1de31cc8625f532804346049632a0a7cb0f336501215bc55930a6da61afc9`.

## Test Evidence

### TP-01-01 … TP-01-19 and TP-01-26 — `node scripts/selftest.mjs`, exit 0

```
================================================
Research-Lab self-test: 2741 passed, 0 failed
================================================
```

Full capture: `sha256:830c7c438954c722084886fa4088976da92ee6d5f481ee7073f602fb7d455e38`.
The pre-existing count was 2740 and did not fall. GREEN observed for every row;
intended RED was not observed for these rows (see
[Completion Statement](#completion-statement)).

Two of them were rewritten in this session because the `AbsentFigure` closure made
their claims false:

- **TP-01-06** read the shipped pack's refusal as its live proof of independence.
  That refusal existed only because a retrieval had not yet succeeded, so the
  assertion would have decayed into a false green the moment it did — which is
  exactly what happened. It now strips the series from a clone of the shipped pack
  and proves the same property on a construction that cannot decay.
- **TP-01-11** asserted "the one member whose retrieval failed is an `AbsentFigure`".
  The pack now carries none, so the assertion derives the `AbsentFigure` census by
  walking the pack, requires every one it finds to be well-formed, and proves the
  detector still fires on a constructed absence that smuggles a `multiple`. It also
  gained a check that every secondary citation — the percentage source beside each
  bend point, each corroborating statement — resolves to a retrieved record.

**TP-01-06b was added**, and it is the strongest assertion in the scope. Run over the
authority's own published case-A earnings record, the shipped pack reproduces every
figure the publication prints:

```
AIME      = 5825      (SSA publishes 5,825)
PIA raw   = 2609.88   (SSA publishes 2,609.88)
PIA       = 2609.8    (SSA publishes 2,609.80)
FRA       = 67 years  (SSA publishes 67)
months    = 60        (SSA publishes 60)
monthly   = 1826      (SSA publishes 1,826.00)
```

A wrong bend point, percentage, wage-index row, reduction factor, or rounding rule at
any of the three rounding sites moves at least one of those figures.

### TP-01-20 … TP-01-24 — the browser rows

Authored in this session in `tests/lifetime-tax-benefit.spec.mjs`. First run, exit
**1**, `4 passed 1 failed` — the single failure was this suite's own assertion
expecting `2,609` where the route correctly applies the configured nearest-dollar
display rounding and renders `$2,610`. The assertion was corrected to assert the
displayed figure, with the full-precision figures left to the contract suite that
already pins them. A second correction: an assertion expected an `<a href>` citation
anchor, where this route's convention — shared with the property panel — is a citation
CELL carrying `title · locator`. It was corrected to assert the citation content and
that the declared rows say they carry none.

Both corrections were to this suite's expectations, not to the product: in each case
the route's behaviour was correct and the newly written assertion described it
wrongly. Full capture of the first run:
`sha256:b4cd0cf360add0803af4d283bcd375bbac486ac984ffa7318093973890cc9cb0`.

### TP-01-25 — the cumulative browser suite

The named command `--grep "SCN-02"` was not run. The full suite was run instead, which
is a superset. `npx playwright test tests/lifetime-tax-*.spec.mjs
--project=system-chrome --reporter=line`, exit **0**:

```
Running 42 tests using 6 workers
…
  42 passed (13.9s)
```

Full capture: `sha256:c2bbb12652fa4671d622d6c37c157738f848c729702a0a5cfbe0ce108f4de5e3`.
The suite grew from 37 rows to 42 with this scope's five browser rows, and every row
that passed before still passes.

The `system-chrome` project is used because the bundled Chromium binary is absent from
this environment. That is an environment gap and not a product finding.

### TP-01-27 — `node scripts/validate-spec-test-paths.mjs`, exit 0

```
[spec-test-paths] scanned=618 references=13677 distinctPaths=232 missingPaths=71 baseline=77 new=0 stale=6
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
```

Zero new missing paths. The six stale baseline entries are Feature 019 causal-rotation
rows and predate this scope.

### TP-01-28 — `node scripts/build-pages-site.mjs --dry-run`, exit 0

```
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":9,"rootFiles":115,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
```

`site-exclusions.json` unchanged, `excludedPaths: 9` as before, and `tax-rules/`
remains outside the public directories.
