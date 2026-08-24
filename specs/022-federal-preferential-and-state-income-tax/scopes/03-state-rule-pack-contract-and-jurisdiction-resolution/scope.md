# Scope 3: State Rule-Pack Contract, Jurisdiction Resolution, And Florida

## 03-state-rule-pack-contract-and-jurisdiction-resolution

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** In progress — 6 of 12 Definition of Done rows satisfied
**Scope-Kind:** runtime-behavior
**Tags:** `capability:jurisdiction-axis`, `sourced-zero:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** 01, 02
**Foundation:** false

**Primary Outcome:** the jurisdiction axis becomes a pack seam rather than a
resolver constant. A household declares where it lives and receives one of exactly
three things it can tell apart: a computed state settlement, a **sourced zero**
carrying the authority that establishes the absence of a tax, or a named refusal.
Florida ships in this scope as the proof that the contract handles a genuinely
different regime — one with no individual income tax at all — before California is
written and could silently become the definition of the contract.

## Requirement Coverage

- **FR-022-015** — jurisdiction is a pack field; no engine names a state, country
  or authority.
- **FR-022-016** — state resolution requires a declared residency; undeclared
  refuses by name and is never treated as no state tax.
- **FR-022-017** — a declared state with no pack refuses, naming the state and the
  remediation.
- **FR-022-018** — a residency pattern outside single-full-year residency refuses
  under its own new code.
- **FR-022-019** — a pack stating its jurisdiction imposes no individual income tax
  produces a valued zero with a citation, structurally distinguishable from every
  refusal.
- **FR-022-020** — a pack declares whether it applies preferential treatment, and a
  pack declaring none uses its ordinary schedule without an engine branch.
- **FR-022-021** — a pack declares each relief mechanism's application point and
  the engine applies it there.

Inherited and re-asserted: **FR-022-002** retrieved non-newsroom sources,
**FR-022-003** locators, **FR-022-007** no derivation, **FR-022-008** leg-set
summation, **NFR-022-002** zero network, **NFR-022-003** no household value in any
URL or request, **NFR-022-004** additive enum extension, **NFR-022-009** Feature
008 byte-identity.

## Gherkin Scenarios

```gherkin
Scenario: SCN-022-007 A state pack resolves by declared residency and refuses without one
  Given a household that has not declared a residency jurisdiction
  When state resolution runs
  Then the state settlement is RLTAX-INPUT-INCOMPLETE naming the missing member
  And no state figure of zero is shown in its place
  And the federal settlement remains complete and visible

Scenario: SCN-022-008 A state with no pack refuses and an unsupported residency pattern refuses differently
  Given a household declaring a state for which no pack ships, and separately a part-year or multi-state residency pattern
  When state resolution runs
  Then the first is RLTAX-JURISDICTION-UNSUPPORTED and the second is RLTAX-RESIDENCY-UNSUPPORTED
  And the two refusals read differently and each names what would make it available
  And neither substitutes an average, a national default or a zero

Scenario: SCN-022-009 A state that imposes no individual income tax returns a sourced zero
  Given a household declaring residency in a state whose pack states it imposes no individual income tax
  When the state settlement is computed
  Then the state total is a valued record of zero carrying a rule status and a citation to the authority that establishes the absence
  And it is structurally distinguishable from a refusal, from a blank and from a bare dash
  And the combined view includes it as a real leg rather than skipping it
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-022-007 undeclared | Valid federal workspace, no residency | Open the state panel | `RLTAX-INPUT-INCOMPLETE` naming the member, no numeral, and the federal result still complete beside it | e2e-ui |
| SCN-022-008 no pack | Residency declared as an unshipped state | Open the state panel | `RLTAX-JURISDICTION-UNSUPPORTED` naming the state and the remediation | e2e-ui |
| SCN-022-008 pattern | Residency declared with a part-year pattern | Open the state panel | `RLTAX-RESIDENCY-UNSUPPORTED`, reading differently from the jurisdiction refusal | e2e-ui |
| SCN-022-009 sourced zero | Residency declared as the no-tax state | Open the state panel | A figure of zero with a rule status and a reachable citation, in the same place a computed figure's citation is reachable | e2e-ui |
| Three-shape enumeration | Each of the three terminal shapes in turn | Open the state panel | Each renders distinctly; the refusal surface renders no numeral; no bare dash, empty cell or unattributed zero appears anywhere | e2e-ui |

## Implementation Files

### New

- `rltaxstate.js` — UMD module owning `StateResidency/v1`, `residencyPattern`,
  `resolveStatePack`, `StateSettlement/v1`, `computeAnnualStateTax` and
  `stateMarginalContext`.
- `tax-rules/state/FL/<year>.json` — the Florida pack.
- Fixture packs exercising the contract's branches independently of any real
  jurisdiction: a pack declaring `preferentialPolicy: "none"`, a pack declaring a
  relief mechanism at each application point, a pack with
  `imposesIndividualIncomeTax: false`, and an invalid pack that sets that flag
  false while still carrying a rate table.

### Modified

- `rltaxrules.js` — the widened jurisdiction grammar, `SourcedZero/v1`,
  `ReliefMechanism/v1`, `preferentialPolicy`, `imposesIndividualIncomeTax`,
  `noTaxAuthority`, and the two new `RLTAX_CODES` members.
- `rltax.js` — stages `CO-13` and `CO-14`, the pack-derived calculation-order
  comparison for `preferentialPolicy: "none"`, and reconciliation leg `L7`.
- `rltaxworkspace.js` — `residencyJurisdiction` and `residencyPattern`, plus their
  inclusion in the privacy inventory, the clear action and the export sanitizer.
- `lifetime-tax-strategy-lab.html` — the residency input, the state panel and
  `StateStageLedger`.
- `scripts/selftest.mjs` — one appended assertion group.

## Implementation Plan

1. Widen the jurisdiction grammar in `rltaxrules.js` to `federal` or
   `state:<two-letter-postal-code>`. Anything else is
   `RLTAX-JURISDICTION-UNSUPPORTED`. The grammar is a pattern; no state code is
   enumerated in any module, and the no-shadow scan is extended to assert it.
2. Add the two new members to `RLTAX_CODES`:
   `RLTAX-RESIDENCY-UNSUPPORTED` and `RLTAX-PACK-YEAR-MISMATCH`. Extend the
   existing selftest scan that asserts exactly one declaration of the vocabulary
   in the repository, and assert that all twelve Feature 021 members retain their
   exact meaning and raising site.
3. Add `SourcedZero/v1` with its three rules: the value is the literal zero and no
   other value validates, `sourceRef` and `locator` are required, and
   `contractVersion` is the discriminator every consumer branches on.
4. Add `ReliefMechanism/v1` with the separate `kind` and `applicationPoint`
   members. A credit applied before rate application and a deduction applied after
   it are each incoherent and refused. `appliesToLegs[]` must name declared legs.
5. Add `preferentialPolicy`, `imposesIndividualIncomeTax` and `noTaxAuthority` to
   the pack contract with the coherence rules from `design.md`: a pack declaring
   no tax carries an authority, an empty leg set and no rate tables; a pack
   declaring `preferentialPolicy: "none"` carries no preferential table.
6. Author `rltaxstate.js`. `computeAnnualStateTax(workspace, statePack)` takes the
   workspace and the state pack **and no federal figure**. There must be no
   parameter through which a federal result could reach it; that absence is what
   makes Scope 05's independence commitment structural rather than conventional.
7. Implement `residencyPattern`. `null` is `RLTAX-INPUT-INCOMPLETE`;
   `full-year-resident` proceeds; every other member is
   `RLTAX-RESIDENCY-UNSUPPORTED` naming the pattern and the remediation. Do not
   route any of these through `RLTAX-JURISDICTION-UNSUPPORTED`.
8. Implement stages `CO-13` and `CO-14` in `rltax.js`, and the pack-derived
   ordered-array comparison for `preferentialPolicy: "none"`, which omits `CO-4`
   and `CO-7`. The engine derives the expected array from the pack's `program`
   and `preferentialPolicy`; a pack whose array differs is `RLTAX-PACK-INVALID`.
9. Add reconciliation leg `L7` asserting that state taxable income derives from
   the state pack's own deduction and never from the federal total taxable income.
10. **Retrieve `BI-5`.** Open a Florida Department of Revenue source that states
    the absence of an individual income tax for the declared tax year, and record
    it in a `SourceRecord/v1`. The constitutional section and the departmental tax
    list already recorded in `spec.md` establish the ceiling and the
    administrative absence; neither states the rate is zero, and that step may not
    be taken by derivation. If the retrieval fails, ship
    `imposesIndividualIncomeTax` as an `AbsentFigure/v1`, let Florida resolve
    `RLTAX-THRESHOLD-UNAVAILABLE`, and prove the sourced-zero path with the
    fixture pack instead — which cannot resolve for any real jurisdiction or year.
11. Author `tax-rules/state/FL/<year>.json` with the declared year, the retrieved
    authority, `imposesIndividualIncomeTax` false, an empty leg set, absent rate
    tables and a populated `unsupportedFeatures[]`.
12. Add `residencyJurisdiction` and `residencyPattern` to `rltaxworkspace.js`.
    Treat the residency state as at least as sensitive as an income amount: it is
    a location signal. Extend the privacy inventory, the clear action and the
    export sanitizer, and prove each independently.
13. Render the state panel branching on `contractVersion`, never on `value === 0`.
    A route test enumerates all three terminal shapes and asserts the refusal
    surface renders no numeral.
14. Append a `lifetime-tax — state rule-pack contract and jurisdiction
    resolution` group to `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `RLTAX_CODES` | Two members added | Every module and every scope | High — the vocabulary is the repository's single refusal contract; a repurposed member silently changes what a refusal means | Assert all twelve Feature 021 members retain their exact meaning and raising site, and that exactly one declaration exists, BEFORE either new member is consumed | Remove both members; the constructor refuses unknown codes |
| Jurisdiction grammar in `resolveRulePack` | Widened from a constant to a pattern | Scopes 04, 05 | High — a widened resolver that accepts a malformed jurisdiction would load an arbitrary path | Assert the pattern refuses a malformed code, a lowercase code, a three-letter code and a path-traversal attempt, before any state pack is loaded | Restore the federal-only constant |
| `rltax.js` calculation-order derivation | Now derived from `program` and `preferentialPolicy` | Scopes 04, 05 | High — a derivation that returns the federal array for a state pack refuses every state pack | Assert the federal pack still derives the federal array element for element, before any state array is derived | Restore the single closed array |
| `rltaxworkspace.js` | Residency members plus privacy surface | Scopes 04, 05 | High — the residency state is a location signal that must not escape | Assert residency appears in the inventory, is cleared, is redacted, and reaches no URL, request, referrer or console message | Remove the members |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the appended group |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxstate.js` · `tax-rules/state/FL/<year>.json` · this scope's
fixture packs.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs` (append-only — this
scope owns no supersession) · this scope's Playwright spec.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`rltaxstrategy.js` · `tax-rules/federal/**` · `tools.json` · `index.html` ·
`rlnav.js` · `README.md` · `notes/README.md` · `market-brief.*` · `briefs/**` ·
`data/**` · `watchlist.json` · `site-exclusions.json` ·
`scripts/build-pages-site.mjs` · `scripts/validate-spec-test-paths.baseline` ·
`tests/lifetime-tax-*.spec.mjs` · `tests/lifetime-tax.support.mjs` ·
every framework-managed file.

`tax-rules/federal/**` is excluded deliberately. Opening the jurisdiction axis
must not require a federal pack edit; if it does, the axis is not a seam.

**Rollback:** delete `rltaxstate.js`, the Florida pack and the fixtures; revert
the enum, the grammar, the two stages and the workspace members; revert the page
panel and the appended selftest group.

## Assertion Supersession Owned By This Scope

**None.** This scope owns no entry in the
[supersession ledger](../../spec.md#supersession-ledger). Every pre-existing
assertion in `scripts/selftest.mjs` and in every Feature 021 Playwright spec must
still pass unchanged at the end of this scope. Opening the jurisdiction axis
changes no behaviour any of them pins, so an assertion that fails here is a defect
in this scope's change and is fixed rather than edited. This scope appends only.

## Scenario-First Red/Green Contract

Add the named known-value assertion or the persistent browser title first, run the
exact command, and confirm the intended contract assertion is what fails. Then
implement the smallest owned change and rerun the identical command.

**Named intended-RED assertion for this scope:** a workspace declaring a valid,
shipped residency jurisdiction together with a part-year residency pattern must
produce `RLTAX-RESIDENCY-UNSUPPORTED` and must **not** produce
`RLTAX-JURISDICTION-UNSUPPORTED`. Before `residencyPattern` exists the assertion
fails because the pattern is ignored and the jurisdiction resolves. A syntax
error, a missing browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Enum integrity | unit | SCN-022-008 | `scripts/selftest.mjs` | The vocabulary has exactly one declaration in the repository, all twelve Feature 021 members retain their exact meaning and raising site, and exactly two members were added | `node scripts/selftest.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Contract | unit | SCN-022-008 | `scripts/selftest.mjs` | The widened jurisdiction grammar accepts `federal` and a well-formed state code and refuses a malformed code, a lowercase code, a three-letter code and a path-traversal attempt | `node scripts/selftest.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Compatibility | unit | SCN-022-007 | `scripts/selftest.mjs` | The federal pack still derives the federal ordered array element for element and every Feature 021 fixture value is unchanged | `node scripts/selftest.mjs` | No | `report.md#tp-03-03` |
| TP-03-04 | Contract | unit | SCN-022-009 | `scripts/selftest.mjs` | `SourcedZero/v1` validates only with the literal zero, requires `sourceRef` and `locator`, and a non-zero value, an absent citation and a missing locator are each refused | `node scripts/selftest.mjs` | No | `report.md#tp-03-04` |
| TP-03-05 | Contract | unit | SCN-022-009 | `scripts/selftest.mjs` | A pack declaring no individual income tax must carry an authority, an empty leg set and no rate table; a pack that declares no tax while carrying a rate table is refused `RLTAX-PACK-INVALID` | `node scripts/selftest.mjs` | No | `report.md#tp-03-05` |
| TP-03-06 | Contract | unit | SCN-022-008 | `scripts/selftest.mjs` | `ReliefMechanism/v1` refuses a credit applied before rate application, a deduction applied after it, and an `appliesToLegs[]` naming an undeclared leg | `node scripts/selftest.mjs` | No | `report.md#tp-03-06` |
| TP-03-07 | Refusal separation | unit | SCN-022-007 | `scripts/selftest.mjs` | An undeclared residency jurisdiction is `RLTAX-INPUT-INCOMPLETE` naming the member, and the federal settlement still resolves in full beside it | `node scripts/selftest.mjs` | No | `report.md#tp-03-07` |
| TP-03-08 | Refusal separation | unit | SCN-022-008 | `scripts/selftest.mjs` | An unshipped state is `RLTAX-JURISDICTION-UNSUPPORTED`; a part-year, multi-state and non-resident-source pattern are each `RLTAX-RESIDENCY-UNSUPPORTED`; the four refusals carry four distinct reasons and remediations | `node scripts/selftest.mjs` | No | `report.md#tp-03-08` |
| TP-03-09 | Adversarial | unit | SCN-022-008 | `scripts/selftest.mjs` | Regression: an implementation that routes an unsupported residency pattern through `RLTAX-JURISDICTION-UNSUPPORTED` is proven to fail the refusal-separation assertion | `node scripts/selftest.mjs` | No | `report.md#tp-03-09` |
| TP-03-10 | Adversarial | unit | SCN-022-009 | `scripts/selftest.mjs` | Regression: an implementation that returns a bare `0` instead of a `SourcedZero/v1` is proven to fail the contract-version discriminator assertion | `node scripts/selftest.mjs` | No | `report.md#tp-03-10` |
| TP-03-11 | Adversarial | unit | SCN-022-007 | `scripts/selftest.mjs` | Regression: an implementation that treats an undeclared residency as no state tax is proven to fail the `RLTAX-INPUT-INCOMPLETE` assertion | `node scripts/selftest.mjs` | No | `report.md#tp-03-11` |
| TP-03-12 | Known value | unit | SCN-022-009 | `scripts/selftest.mjs` | The Florida pack validates, resolves for the declared year, produces a `SourcedZero/v1` total with a rule status and a citation, and carries no rate table for any filing status | `node scripts/selftest.mjs` | No | `report.md#tp-03-12` |
| TP-03-13 | Contract | unit | SCN-022-008 | `scripts/selftest.mjs` | A fixture pack declaring `preferentialPolicy: "none"` prices pooled preferential income in its ordinary schedule, and its ordered array omits the two preferential stages | `node scripts/selftest.mjs` | No | `report.md#tp-03-13` |
| TP-03-14 | Independence | unit | SCN-022-009 | `scripts/selftest.mjs` | `computeAnnualStateTax` accepts no federal figure through any parameter, and reconciliation leg `L7` proves state taxable income derives from the state pack's own deduction | `node scripts/selftest.mjs` | No | `report.md#tp-03-14` |
| TP-03-15 | Privacy | unit | SCN-022-007 | `scripts/selftest.mjs` | The residency members appear in the privacy inventory, are removed by the clear action, are redacted by the export sanitizer, and reach no URL, request, referrer or console message | `node scripts/selftest.mjs` | No | `report.md#tp-03-15` |
| TP-03-16 | No-shadow | unit | SCN-022-008 | `scripts/selftest.mjs` | Regression: no module holds a state name, postal code, bracket, rate, edge, threshold or authority name; the detector is proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-03-16` |
| TP-03-17 | Regression E2E | e2e-ui | SCN-022-007 | `tests/lifetime-tax-state.spec.mjs` | `Regression: SCN-022-007 / SCN-022-008 an unshipped state, an undeclared residency and an unmodelled residency pattern refuse under three different codes and none of them shows a zero` — the title is the family-convention form routed to `bubbles.implement` under F-03-B; the command greps the descriptive clause, which the rename leaves byte-identical, so this row selects the same one test before and after it lands. This row owns that test's **undeclared-jurisdiction** clause: a declared pattern with no jurisdiction is `RLTAX-INPUT-INCOMPLETE` on domain `residency:residencyJurisdiction` and no state figure is rendered. One test carries this row and TP-03-18; each row names the clause it owns so a reader knows which regression falls which row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "an unshipped state, an undeclared residency and an unmodelled residency pattern refuse under three different codes and none of them shows a zero" --reporter=list` | Yes | `report.md#scenario-scn-022-007` |
| TP-03-18 | Regression E2E | e2e-ui | SCN-022-008 | `tests/lifetime-tax-state.spec.mjs` | `Regression: SCN-022-007 / SCN-022-008 an unshipped state, an undeclared residency and an unmodelled residency pattern refuse under three different codes and none of them shows a zero` — the title is the family-convention form routed to `bubbles.implement` under F-03-B; the command greps the descriptive clause, which the rename leaves byte-identical. This row owns that test's **separation** clause: an unshipped state is `RLTAX-JURISDICTION-UNSUPPORTED` on domain `jurisdiction:state:NY` while a part-year pattern on a fully shipped jurisdiction is `RLTAX-RESIDENCY-UNSUPPORTED` on domain `residency:pattern:part-year`, and the two carry different remediations. Shares its test with TP-03-17 | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "an unshipped state, an undeclared residency and an unmodelled residency pattern refuse under three different codes and none of them shows a zero" --reporter=list` | Yes | `report.md#scenario-scn-022-008` |
| TP-03-19 | Regression E2E | e2e-ui | SCN-022-009 | `tests/lifetime-tax-state.spec.mjs` | `Regression: SCN-022-009 a jurisdiction that levies no individual income tax renders its sourced zero with the authority that establishes it, and never enters the federal total` — the title is the family-convention form routed to `bubbles.implement` under F-03-B; the command greps the descriptive clause, which the rename leaves byte-identical. The sourced zero renders as a figure with its constitutional locator while the refusal element is absent, which is the "distinct from a refusal" clause this row names | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "a jurisdiction that levies no individual income tax renders its sourced zero with the authority that establishes it, and never enters the federal total" --reporter=list` | Yes | `report.md#scenario-scn-022-009` |
| TP-03-20 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-001 … -009 | Feature 021's five specs plus this feature's three | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row. **Selection floor, asserted before the run.** `--grep` matches on test **title**, so a spec whose titles omit their scenario token is silently excluded and the row still reads green off the tests it did select — F-03-B. The `--list` invocation therefore runs first and its output must name at least one title carrying each of `SCN-022-007`, `SCN-022-008` and `SCN-022-009`, which are this scope's own three scenarios and the ones the coverage column claims; a listing that names none of them fells the row before a single test executes. The listed `Total:` count is recorded in the evidence anchor and must not fall between runs, so a later spec dropping its token is visible as shrinkage rather than as a smaller green run. Until the F-03-B rename lands the floor is unmet by construction and this row cannot be ticked | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --list` then `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-03-20` |
| TP-03-21 | Privacy E2E | e2e-ui | SCN-022-007 | `tests/lifetime-tax-state.spec.mjs` | `Regression: SCN-022-007 the residency declaration reaches no URL, no request, no console message and no export` — the title is the family-convention form routed to `bubbles.implement` under F-03-B; the command greps the descriptive clause, which the rename leaves byte-identical. The request count after declaring a residency equals the count at first paint, every request is a same-origin member of the page's own declared asset set, and the declared jurisdiction appears in no URL, query string, hash, body, referrer or console message in either literal or percent-encoded form | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "the residency declaration reaches no URL, no request, no console message and no export" --reporter=list` | Yes | `report.md#tp-03-21` |
| TP-03-22 | Repo gate | unit | SCN-022-007 … -009 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-03-22` |
| TP-03-23 | Path guard | unit | SCN-022-007 … -009 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-03-23` |
| TP-03-24 | Deploy gate | unit | SCN-022-007 … -009 | `scripts/build-pages-site.mjs` | The Pages plan succeeds and `site-exclusions.json` is unchanged, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-03-24` |

### F-03-B: A Title-Matching Selector Under-Selects Silently, And The Routed Title Repair

**The finding.** `TP-03-20` selects with `--grep "SCN-02[1-4]"`. Playwright's
`--grep` matches on the test **title**, not on any declared scenario mapping. Of
the nineteen `tests/lifetime-tax-*.spec.mjs` members of this family, eighteen
carry their scenario id in the title under the form
`Regression: SCN-0NN-NNN <clause>`; `tests/lifetime-tax-state.spec.mjs` is the
sole exception, and **zero of its six** titles carry the token. That file holds
every browser assertion this scope owns, so the selector's selection can contain
`SCN-022-001` … `-006` and `-013` … `-015` and **none** of `SCN-022-007`,
`-008`, `-009` — precisely the three scenarios the row's coverage column claims.
The counts above are read off the test titles in `tests/`; the size of the
resulting selection is not restated here because no `--list` run is recorded
against it, which is itself the omission the selection floor below closes. The
row could not fail on the behaviour it names, and it read green because the
tests it *did* select all passed.

**The defect is the titles, not the selector.** A row is repaired by pointing it
at a truthful selection, but retargeting `TP-03-20` at some other expression
would leave the underlying breach in place: a spec whose titles omit their
scenario ids is unreachable by *every* scenario-keyed selector any future row
writes, and the next author would rediscover this from scratch. Renaming brings
the nineteenth file into the convention the other eighteen already keep, which
fixes this row and every row not yet written. The cost of renaming — that four
Test Plan cells quote the old titles verbatim and go stale — is planning-owned
and is paid above in this same change, which is why `bubbles.test` correctly
declined to rename and handed it here.

**Old → new title mapping, routed to `bubbles.implement`.** Three of the six
tests are renamed. Each is a title-string edit in
`tests/lifetime-tax-state.spec.mjs` and nothing else; no assertion, no body and
no helper changes.

| Test | Current title | Routed title |
| --- | --- | --- |
| sourced zero | `Regression: a jurisdiction that levies no individual income tax renders its sourced zero with the authority that establishes it, and never enters the federal total` | `Regression: SCN-022-009 a jurisdiction that levies no individual income tax renders its sourced zero with the authority that establishes it, and never enters the federal total` |
| three refusal codes | `Regression: an unshipped state, an undeclared residency and an unmodelled residency pattern refuse under three different codes and none of them shows a zero` | `Regression: SCN-022-007 / SCN-022-008 an unshipped state, an undeclared residency and an unmodelled residency pattern refuse under three different codes and none of them shows a zero` |
| residency privacy | `Regression: the residency declaration reaches no URL, no request, no console message and no export` | `Regression: SCN-022-007 the residency declaration reaches no URL, no request, no console message and no export` |

The insertion is a **prefix**; every descriptive clause is left byte-identical.
That is deliberate: `TP-03-17`, `TP-03-18`, `TP-03-19` and `TP-03-21` grep the
clause, so all four keep selecting the same single test across the rename and
the repair cannot strand them mid-flight. The three-codes test is shared by
`TP-03-17` and `TP-03-18`, so its title carries both ids; a single-id title
would leave one of the two scenarios unreachable by a per-scenario grep.

**The other three titles are deliberately not renamed, and that is a named
gap.** `Regression: California renders an unavailable naming the source that was
not retrieved, and shows no figure at all in its place`,
`Regression: a residency declaration that changes nothing rebuilds nothing, and
a residency that changes rebuilds the card` and
`Regression: the state surfaces are absorbed by the declared Simple field set
and the withheld-detail link table` are named by **no** Test Plan row in this
feature and by **no** `satisfiedBy` list in `scenario-manifest.json`. Minting a
scenario id for a title whose owner has not been decided would fabricate the
mapping the id is supposed to record, so the rename stops at the three whose
ownership an existing row already establishes. The California test is the
sharper half of the gap: `SCN-022-009`'s `user-visible-ui` obligation requires
that the route "renders no numeral on the refusal surface", and that clause is
asserted in the browser by *that* test and by nothing else, while the
obligation's `satisfiedBy` names only `TP-03-10` and `TP-03-19`. **Decidable
by:** an owner decision binding each of the three to a scenario, or recording
them as convention-exempt — analyst-owned, not resolvable by renaming.

**Adversarial case this repair must fail.** Break `SCN-022-008`'s refusal
separation — route an unsupported residency pattern through
`RLTAX-JURISDICTION-UNSUPPORTED` so the two refusals collapse to one code — and
`TP-03-20` must fall. Before the rename it does not: the three-codes test is
outside the selection, the other 77 are unaffected, and the row reports zero
failed. After it, the same perturbation fells the row. A rename that is claimed
but not applied is caught by the same probe, because the `--list` floor is
asserted before the run and a listing naming no `SCN-022-008` title fells the
row without executing anything.

**How a row naming a `--grep` command must be written.** This generalises
finding F-15 in [`spec.md`](../../spec.md) — that finding covers a row id
resolving to another feature's assertion; this one covers a row's *selector*
resolving to fewer tests than it claims. Both read green while owned by nothing.

- **Assert the selection, not only the result.** A `--grep` row states the
  scenario ids its selection must contain and proves containment from a `--list`
  run before the suite runs. Exit 0 over an empty or short selection is
  indistinguishable from exit 0 over the right one.
- **Record the selected count.** The `--list` `Total:` figure belongs in the
  evidence anchor. A count that falls between runs is a spec that dropped its
  token or a file that left the family, and it is invisible in a pass count.
- **Never let a title-matching selector be the only pin on a scenario.** The
  binding between a scenario and a test is a string in a title that no guard
  parses. A row that names a scenario must also name the file and the exact
  title, so a title edit shows up as stale plan text rather than as a quietly
  smaller run.

### Definition of Done

- [x] FR-022-015 is implemented: jurisdiction is a pack field expressed as a
      pattern, and no module holds a state name or postal code.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-02`, `report.md#tp-03-16`
  - **Evidence:** intended RED then same-command GREEN for both anchors. Widening
    the grammar to accept a lowercase postal code fell TP-03-02 alone
    (`3090 passed, 2 failed`); planting a state name in the state module fell
    TP-03-16 and its Scope 04 sibling (`3089 passed, 3 failed`). Both reverted
    under a trap inside the applying invocation, both returned to
    `3091 passed, 1 failed`.
- [x] The refusal vocabulary gained exactly two members, every Feature 021 member
      retains its exact meaning and raising site, and exactly one declaration
      exists in the repository.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-01`
  - **Evidence:** the declaration, count and meaning clauses were already pinned by
    the assertion labelled `TP-01-05`; the raising-site clause was pinned by nothing
    and is now closed by an appended assertion that maps every member to the exact
    modules that raise it. Intended RED: a value-free comment planting a foreign
    raise in the state module fell the new assertion alone
    (`3098 passed, 2 failed`, the second failure pre-existing and not this scope's).
    Reverted with `git checkout --` in the same session with the leftover count
    re-read as zero; the same command returned `3099 passed, 1 failed`.
- [x] FR-022-016 through FR-022-018 are implemented: undeclared residency,
      unshipped state and unsupported residency pattern each refuse under their
      own code with their own remediation, and the separation is proven by an
      adversarial mutation.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-07`, `report.md#tp-03-08`, `report.md#tp-03-09`, `report.md#tp-03-11`
  - **Evidence:** two intended-RED mutations, each reverted under a trap inside the
    applying invocation. Rerouting the residency-pattern raise through
    `RLTAX-JURISDICTION-UNSUPPORTED` — the scope's named intended-RED — fell
    TP-03-08 and TP-03-09 (`3090 passed, 2 failed`). Swapping the
    undeclared-residency raise to the jurisdiction code fell TP-03-07 and TP-03-11
    together (`3089 passed, 3 failed`), proving each pins its specific code. Both
    same-command GREEN runs returned `3091 passed, 1 failed`.
- [x] `BI-5` was closed by a retrieval performed in the implementation session and
      recorded with its own `retrievedAt`, or the Florida pack ships
      `imposesIndividualIncomeTax` as an `AbsentFigure/v1` and the sourced-zero
      path is proven by the fixture pack instead.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs`, `npx playwright test tests/lifetime-tax-*.spec.mjs --project=chromium`, and four `scripts/red-green-probe.sh` probes · **Evidence:** `report.md#bi-5-branch-two`, `report.md#sourcing`, `report.md#the-bi-5-retrieval-was-attempted-in-this-session-and-did-not-find-the-statement`
  - **Closed on branch two.** Branch one was attempted rather than assumed
    unavailable: five Florida Department of Revenue pages were fetched at
    `retrievedAt` `2026-08-21T04:31:33Z`. Four retrieved and none states that
    Florida imposes no individual income tax — they enumerate the taxes the
    department administers, which is the same administrative absence the pack
    already cites. The fifth, the GT-800029 brochure, returned no extractable
    content, so nothing was asserted from it. Branch two was then executed.
    `imposesIndividualIncomeTax` ships as an `AbsentFigure/v1` carrying
    `RLTAX-THRESHOLD-UNAVAILABLE`, a domain, a reason stating that a prohibition
    plus an administrative absence do not state the fact, a
    `whatWouldMakeItAvailable` and a `missingSource`; `noTaxAuthority` is `null`;
    `contentSha256` is recomputed. Florida settles to a refusal carrying no
    numeral, and the sourced-zero path is proven by the new no-tax fixture pack
    `tax-rules/fixtures/state-no-tax-2999.json`, which declares `state:QQ` and so
    cannot resolve for any real household. Assertions in Scopes 03, 04 and 05
    were re-aimed rather than removed, and both browser specs gained a
    shipped-Florida refusal assertion. Pre-existing pass count unchanged.
- [x] FR-022-019 is implemented: a sourced zero validates only with the literal
      zero and a citation, the route branches on the contract version rather than
      on the value, and a bare zero is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-04`, `report.md#tp-03-05`, `report.md#tp-03-10`, `report.md#tp-03-12`
  - **Evidence:** three intended-RED mutations, each reverted under a trap inside
    the applying invocation. Dropping the locator clause fell TP-03-04; rewriting
    the discriminator to branch on `value === 0` fell TP-03-10 with TP-03-11;
    disabling the no-tax leg-set and rate-table rules fell TP-03-05. Two earlier
    mis-aimed mutations are recorded as misses under TP-03-05, one of which
    exposed a rule no assertion exercises. This item covers the contract; whether
    the Florida figure fed to it is soundly sourced is `BI-5`, which is left open.
- [x] FR-022-020 and FR-022-021 are implemented: a pack declaring no preferential
      treatment prices pooled preferential income in its ordinary schedule with no
      engine branch, and each relief mechanism is applied at its declared point.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-06`, `report.md#tp-03-13`
  - **Evidence:** two intended-RED mutations, each reverted under a trap inside the
    applying invocation. Disabling the relief kind/application-point coherence rule
    fell TP-03-06 with its Scope 04 sibling (`3090 passed, 3 failed`). Narrowing
    the pooled base to drop long-term gain fell TP-03-13 alone
    (`3091 passed, 2 failed`). A first mutation aimed at TP-03-13 missed and is
    recorded: the row reads the fixture directly, so the validator is not its
    lever, and that mutation fell the Scope 04 row instead. Both same-command
    GREEN runs returned `3092 passed, 1 failed`.
- [x] `computeAnnualStateTax` accepts no federal figure through any parameter and
      reconciliation leg `L7` holds for every fixture.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-14`
  - **Evidence:** the two halves were probed separately so each is shown to be read.
    Adding a never-read third parameter named `federalResult` to the signature fell
    this row alone (`3098 passed, 2 failed`, the second failure pre-existing and not
    this scope's). Flipping the sign of the one term that names the state pack's own
    deduction in the `L7` identity fell this row plus three Scope 05 rows and threw
    that group (`3087 passed, 5 failed`) — a cascade that shows `L7` is load-bearing.
    Both reverted with `git checkout --` inside the applying invocation with the
    leftover counts re-read as zero; the same command returned `3099 passed, 1 failed`.
- [x] The residency state is inventoried, cleared and redacted, the request
      ledger does not grow after first paint, every entry in it is a same-origin
      read of a path the route's own configuration declares, and both the federal
      pack and the resolved state pack are present in the ledger the run produced.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser privacy row · **Evidence:** `report.md#tp-03-15`, `report.md#tp-03-21`
  - **Restated 2026-08-22 (F-REG-03).** The superseded text read "the request
    ledger stays empty with two pack files now loaded from disk", which is false
    and self-contradictory on its own terms: a ledger holding two pack reads is
    not empty. This is the strongest-supported instance in the family, so the
    restatement is correspondingly strong. The cited row `TP-03-21`
    (`SCN-022-007`) asserts `expect(afterFirstPaint).toBeGreaterThan(0)`, then
    `expect(ledger.length).toBe(afterFirstPaint)`, then
    `expect(ledger.filter((entry) => !entry.url.startsWith(site.baseUrl))).toEqual([])`
    — the only same-origin assertion in this family besides `SCN-022-013`'s —
    then `paths.forEach((path) => expect(permitted).toContain(path))`, and finally
    pins BOTH `/tax-rules/federal/2026.json` and `/tax-rules/state/CA/2026.json`
    present in the ledger the run produced rather than merely permitted.
    Adversarial cases: a request issued after first paint fails the no-growth
    assertion; a cross-origin read fails the `startsWith(site.baseUrl)` filter
    even when its path collides with a declared one; a read of an undeclared path
    fails the permitted-set assertion; a boot that read nothing fails the
    greater-than-zero pin; and a state pack that is permitted but never fetched
    fails the two `expect(paths).toContain(...)` pins.
  - **Closed 2026-08-21.** The row is one nine-term conjunction, so a single probe
    cannot show every clause is read; an earlier draft misdescribed it as separate
    assertions and that correction is recorded. Each of the three state clauses was
    perturbed on its own through `scripts/red-green-probe.sh`, with the summary
    channel pinned to the assertion's own label so the evidence names the row that
    fell rather than inferring it from a moved count. Inventory: the entry stops
    being flagged as carrying household values while the declaration is still
    stored. Clear: the clear action keeps reporting every key in `removedKeys[]`
    but removes none, which a return-value-only assertion would miss. Redaction:
    the sanitizer keeps the residency instead of withholding it. All three read
    `✗ FAIL` under RED against `✓` under GREEN, reverts hash-verified. The ledger
    half was re-run live in this session rather than cited — `1 passed (4.3s)` —
    and holds two clauses: the request count after declaring a residency equals
    the count at first paint, and both pack paths appear in the ledger the run
    produced.
- [x] `tax-rules/federal/**` is frozen — no commit after the lab-creation commit
      and no working-tree modification — and no commit of this scope names any path
      on the excluded list, proving the jurisdiction axis is a seam rather than a
      federal edit. Feature 021's spec directory is deliberately **not** part of
      this claim: it is expected to move while Feature 021 records its own evidence.
  - **Requirement text corrected 2026-08-21 by `bubbles.plan`. The row stays open;
    the correction fixes what the row asks, not whether it is met.** The row
    previously read "the federal pack and Feature 021's spec directory are
    byte-identical", which is false as written and false for a reason no execution
    could repair. Half of it holds and is the half that carries the seam argument:
    `tax-rules/federal/2026.json` has exactly one commit in the repository's entire
    history, `b9d92a3f1`, the commit that created the lab. The other half is false
    by construction — `specs/021-lifetime-tax-strategy-lab/` has nine commits after
    that one, every one Feature 021 closing its own Definition-of-Done items with
    its own evidence. A sibling feature recording evidence is that feature working,
    not this scope leaking, so a row that fell on it would fail for the wrong
    reason. The other grammatical reading — the two being byte-identical to *each
    other* — is unavailable: that directory holds no copy of the pack, only fourteen
    Markdown files and the two Bubbles artifacts `state.json` and
    `scenario-manifest.json`. The corrected row states the property the original was
    reaching for and drops the clause that was never this scope's to hold.
  - **Adversarial case the corrected row must still fail.** Change one byte of
    `tax-rules/federal/2026.json` — moving a single bracket edge is enough — and
    either commit it or leave it dirty. Committed, `git log --follow --
    tax-rules/federal/` then reports a commit after `b9d92a3f1`; uncommitted,
    `git status --porcelain -- tax-rules/federal/` is non-empty. Either falls the
    row. A row that survived that edit would not be testing the seam at all, which
    is exactly what the superseded wording risked: its true half was unfalsifiable
    prose and its false half could never pass. **Negative control:** the identical
    two checks run against `scripts/selftest.mjs`, which this scope legitimately
    appended to, must report movement. An all-frozen result across every path
    checked would mean the comparator is dead rather than the tree clean.
  - **Still open because:** the corrected claim has not been executed and recorded
    under its own command in this feature's evidence. The per-commit half is
    already proven — all eight of this scope's commits were re-checked per commit
    and none names an excluded path — but the frozen-pack half plus its negative
    control is execution work owned by `bubbles.test`, not a planning edit.
  - **Closed 2026-08-21 by execution.** All three halves are now recorded. Read-only:
    `git log --oneline b9d92a3f1..HEAD -- tax-rules/federal/` reports 0 commits,
    `git log --follow` reports 1 commit in the pack's whole history, and
    `git status --porcelain -- tax-rules/federal/` reports 0 lines. Negative control:
    the identical two checks against `scripts/selftest.mjs` report 50 commits, so
    the comparator is alive and the 0 is a fact about the pack rather than about the
    check. Adversarial: the row's own named perturbation — one bracket edge moved
    from `24800` to `24801` — makes the porcelain check report one line and the
    frozen assertion exit 1, against exit 0 and zero lines on the same command once
    reverted. The mutation ran under `scripts/red-green-probe.sh`, so the revert was
    trap-protected and hash-verified against the committed blob.
  - **Phase:** implement · **Command:** `git log --follow -- tax-rules/federal/` and `git status --porcelain -- tax-rules/federal/`, the same two against `scripts/selftest.mjs` as the negative control, plus a per-commit path-scoped check over the excluded list · **Evidence:** `report.md#change-boundary`
- [x] No output states a probability, a lifetime figure, a track record or an
      error rate, and no state figure is presented as an estimate or an average.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
  - **Closed 2026-08-21.** The row was previously open because the output surface
    did not exist; the page now declares both residency inputs, loads the state
    module and renders a `power-state` band, so it is decidable. Nothing pinned it
    before — Feature 021's equivalent check scans five federal files and none of
    this scope's surfaces. One appended assertion now scans the module, both state
    packs and the band slice, under two rules: claim tokens must not appear at all,
    and `average`/`estimate` are permitted only where the same line negates them,
    which is the shipped refusal wording. Both rules were probed through
    `scripts/red-green-probe.sh` and each fells exactly one assertion —
    `3176 passed, 1 failed` against `3177 passed, 0 failed`, reverts hash-verified.
    The second probe targets the page rather than the module so the band slice is
    proven live rather than assumed non-empty.
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Closed 2026-08-21 by execution — the one short row is now recorded.**
    **Command:** the exact TP-03-01 through TP-03-24 commands · **Evidence:**
    `report.md#tp-03-20`. The F-03-B rename landed in `8e882bfc1` as a prefix-only
    edit, so `tests/lifetime-tax-state.spec.mjs` now carries its scenario tokens and
    every descriptive clause stays byte-identical; TP-03-17, TP-03-18, TP-03-19 and
    TP-03-21 each still select exactly one test, verified by `--list` on both sides
    of the rename. TP-03-20 then met both halves this row demands. **Selection
    floor, asserted before the run:** the `--list` output names `SCN-022-007`
    twice, `SCN-022-008` once and `SCN-022-009` once, and the recorded count is
    `Total: 80 tests in 19 files`, up from `77 tests in 18 files` — the three tests
    the row claims and could not previously select. **Perturbation:** rerouting the
    unmodelled residency pattern through `RLTAX-JURISDICTION-UNSUPPORTED`,
    collapsing `SCN-022-008`'s separation, fells the cumulative command at
    `79 passed` exit 1 against `80 passed` exit 0 on the same command reverted.
    That mutation could not have moved this row before the rename, which is the
    whole of what F-03-B named. The mutation ran under
    `scripts/red-green-probe.sh` and its revert is hash-verified.
  - **The history below is kept as history.** Its three bullets record the row's
    open state and are superseded by the closure above; they are retained because
    they name the two ways this row could have been closed falsely.
  - **Was open — one row short after the retarget, and the retarget is the whole of
    what planning could fix.** The census was taken row by row rather than
    asserted. Four rows were short because TP-03-17, TP-03-18, TP-03-19 and
    TP-03-21 named the spec file `lifetime-tax-state-contract.spec.mjs` and four
    titles, none of which exist — Finding F-03-A. Their commands selected zero
    tests, and a run that selects zero tests reports success without asserting
    anything, so those rows could never have been ticked on execution. The four
    titles were deliberately **not** authored: their substance already exists in
    `tests/lifetime-tax-state.spec.mjs` under different titles, so writing them
    would have added duplicate coverage whose only purpose is to satisfy a
    document — which is the failure this census exists to catch, not a way of
    closing it.
  - **Retargeted 2026-08-21 by `bubbles.plan`.** The four rows now name
    `tests/lifetime-tax-state.spec.mjs` and its real titles. Each mapping was
    verified against the test **body**, not against its title: TP-03-17 and
    TP-03-18 share the three-codes refusal test and each names the clause it owns
    within it, TP-03-19 names the sourced-zero test that asserts the figure renders
    while the refusal element is absent, and TP-03-21 names the privacy test that
    asserts the post-declaration request count equals the first-paint count. The
    RED/GREEN evidence those four rows need is already recorded in the report under
    labels naming the rows whose substance each probe carries.
  - **Was short: TP-03-20 alone, and for a second reason.** It is the cumulative
    family suite. The report records a 69-passed run of it but no perturbation, so
    nothing yet shows that command can fail. The census has since found a stronger
    reason it cannot: its `--grep "SCN-02[1-4]"` selection contains **no** test
    carrying `SCN-022-007`, `-008` or `-009`, because
    `tests/lifetime-tax-state.spec.mjs` is the one member of this nineteen-file
    family whose titles omit their scenario token — Finding F-03-B above. The row
    claims those three scenarios and cannot fail on any of them. A perturbation
    probe run today would therefore have proved nothing about this row's declared
    coverage even had one been recorded. **Decidable by:** the F-03-B title
    rename landing in `tests/lifetime-tax-state.spec.mjs`, then one probe against
    the cumulative command with the `--list` selection floor asserted first —
    execution work owned by `bubbles.implement` and `bubbles.test`, not a further
    planning-wording change. The row stays open until both are recorded.
  - **Adversarial case this row must still fail.** Point any row back at a title
    that does not exist, or at a test whose assertions cannot fail on the behavior
    the row names, and the census must fall — a `--grep` selecting zero tests exits
    0, so a census satisfied by exit codes alone would read green over an empty
    selection. F-03-B is the same failure one degree weaker and therefore harder to
    see: a selection that is neither empty nor complete still exits 0, and the
    passing tests it does contain make the row look owned. Satisfying this DoD item
    requires, per row, a named command whose selection is non-empty, **proven to
    contain the scenarios the row claims**, and a recorded perturbation that fells
    it.
  - **Phase:** implement · **Command:** the exact TP-03-01 through TP-03-24 commands · **Evidence:** `report.md#test-evidence`, `report.md#tp-03-21`
- [x] `node scripts/selftest.mjs` is green with no fall in pass count and no
      existing assertion edited, `node scripts/validate-spec-test-paths.mjs`
      reports zero new missing paths, and `node scripts/build-pages-site.mjs
      --dry-run` succeeds with `tax-rules/` still outside the public directories.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-03-22`, `report.md#tp-03-23`, `report.md#tp-03-24`
  - **Closed 2026-08-21.** All three ran. `3177 passed, 0 failed`, up by exactly one
    from the pre-existing 3176. The no-edit clause is derived, not asserted: the
    change to `scripts/selftest.mjs` is 49 insertions and **zero deletions** in one
    hunk, and an insertion cannot relax an assertion still present. The path guard
    reports `missingPaths=67 baseline=67 new=0`. The Pages dry-run exits 0 and its
    own `directories` array omits `tax-rules`, so the state packs are engine-reachable
    and unpublished. Each of the three commands also carries an intended RED through
    `scripts/red-green-probe.sh` with a hash-verified revert.
