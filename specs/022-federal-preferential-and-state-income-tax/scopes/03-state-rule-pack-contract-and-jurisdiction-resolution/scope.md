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
| TP-03-17 | Regression E2E | e2e-ui | SCN-022-007 | `lifetime-tax-state-contract.spec.mjs` | `Regression: SCN-022-007 an undeclared residency refuses by name and never shows a zero` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-007 an undeclared residency refuses by name and never shows a zero" --reporter=list` | Yes | `report.md#scenario-scn-022-007` |
| TP-03-18 | Regression E2E | e2e-ui | SCN-022-008 | `lifetime-tax-state-contract.spec.mjs` | `Regression: SCN-022-008 an unshipped state and an unsupported residency pattern refuse differently` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-008 an unshipped state and an unsupported residency pattern refuse differently" --reporter=list` | Yes | `report.md#scenario-scn-022-008` |
| TP-03-19 | Regression E2E | e2e-ui | SCN-022-009 | `lifetime-tax-state-contract.spec.mjs` | `Regression: SCN-022-009 a no-tax state renders a sourced zero distinct from a refusal` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-009 a no-tax state renders a sourced zero distinct from a refusal" --reporter=list` | Yes | `report.md#scenario-scn-022-009` |
| TP-03-20 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-001 … -009 | Feature 021's five specs plus this feature's three | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-03-20` |
| TP-03-21 | Privacy E2E | e2e-ui | SCN-022-007 | `lifetime-tax-state-contract.spec.mjs` | `Regression: SCN-022-007 the request ledger stays empty and no household value reaches a URL` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-007 the request ledger stays empty and no household value reaches a URL" --reporter=list` | Yes | `report.md#tp-03-21` |
| TP-03-22 | Repo gate | unit | SCN-022-007 … -009 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-03-22` |
| TP-03-23 | Path guard | unit | SCN-022-007 … -009 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-03-23` |
| TP-03-24 | Deploy gate | unit | SCN-022-007 … -009 | `scripts/build-pages-site.mjs` | The Pages plan succeeds and `site-exclusions.json` is unchanged, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-03-24` |

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
- [ ] `BI-5` was closed by a retrieval performed in the implementation session and
      recorded with its own `retrievedAt`, or the Florida pack ships
      `imposesIndividualIncomeTax` as an `AbsentFigure/v1` and the sourced-zero
      path is proven by the fixture pack instead.
  - **Open — the retrieval was performed and did not find the statement.** Branch
    one was attempted rather than assumed unavailable: five Florida Department of
    Revenue pages were fetched at `retrievedAt` `2026-08-21T04:31:33Z`. Four
    retrieved and none states that Florida imposes no individual income tax — they
    enumerate the taxes the department administers, which is the same
    administrative absence the pack already cites. The fifth, the GT-800029
    brochure, returned no extractable content, so nothing may be asserted from it
    and its wording is not recalled. Branch two is a pack edit that moves
    `contentSha256` and re-aims assertions in Scopes 03, 04 and 05, so it stays
    routed to implementation-and-sourcing. **Decidable by:** one retrieved
    Department of Revenue document whose text states the absence for natural
    persons; two unreached candidates are named in the report so the next attempt
    does not start from scratch.
  - **Phase:** implement · **Command:** the retrieval record in the pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#the-bi-5-retrieval-was-attempted-in-this-session-and-did-not-find-the-statement`
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
- [ ] The residency state is inventoried, cleared and redacted, and the request
      ledger stays empty with two pack files now loaded from disk.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser privacy row · **Evidence:** `report.md#tp-03-15`, `report.md#tp-03-21`
- [ ] The federal pack and Feature 021's spec directory are byte-identical,
      proving the jurisdiction axis is a seam rather than a federal edit.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
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
- [ ] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Phase:** implement · **Command:** the exact TP-03-01 through TP-03-21 commands · **Evidence:** `report.md#test-evidence`
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
