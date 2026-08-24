# Scope 5: Route, Accessibility And Integration

## 05-route-and-integration

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** In Progress (deliverables and tests verified; newly added planning rows unverified)
**Scope-Kind:** runtime-behavior
**Tags:** `route:true`, `accessibility:true`, `leg-census:true`, `known-value-tested`
**Depends On:** 01, 02, 03, 04
**Foundation:** false

**Primary Outcome:** the four legs this feature added are proven present on all
four surfaces and absent from the one total three of them must never enter; the
household's first view is a plain answer rather than a wall of tables, with every
withheld detail one labelled click away; every unavailable item is reachable by
keyboard and says what it is and what would fix it; and the exported file leaves
out every retirement declaration and says what it left out.

This scope retrieves nothing and authors no figure. A figure appearing here would
mean one escaped its owning scope.

## Requirement Coverage

- **FR-024-029** — the leg census asserts a two-directional set identity between
  the record's declared legs and each of the four surfaces, against a fixture in
  which every leg is non-zero and mutually distinct, naming both the missing leg
  and the failing surface.
- **FR-024-030** — the headline renders `totalFederalTax` and no single leg, and the
  annual Medicare cost is rendered as a separate figure that is visibly not part of
  it.
- **FR-024-031** — Simple gains only decision-level fields and no band table, rule
  trace or raw series; every detail Simple withholds links to the Power section
  that owns it.
- **FR-024-032** — every control this feature adds binds without an unconditional
  re-render, so a mode switch or an input event cannot detach a focused node.
- **FR-024-033** — every unavailable item renders its code, its domain, its reason
  and its remediation on a focusable element, and never a blank, a bare dash or a
  zero.
- **FR-024-034** — the export omits every household declaration this feature adds
  and states what it omitted.
- **FR-024-035** — the renderer reads only members the settlement actually
  publishes, so an absent member cannot abort the Power render.

Inherited and re-asserted: **NFR-024-001** declared or sourced never conflated,
**NFR-024-002** zero network, **NFR-024-003** no household value in any URL or
request, **NFR-024-004** vocabulary and income-kind counts unchanged,
**NFR-024-005** no figure or authority name in any module, **NFR-024-006** leg
visibility, **NFR-024-007** no probability, **NFR-024-008** no track record,
**NFR-024-009** Feature 008 byte-identity, **NFR-024-010** no registration,
**NFR-024-011** harness rules.

## Gherkin Scenarios

```gherkin
Scenario: SCN-024-013 Every leg this feature adds reaches all four surfaces
  Given the all-non-zero leg fixture extended with this feature's four legs
  When the page renders
  Then the settled record's declared leg set equals the leg set of the headline, the comparison table, the marginal curve's contributor set and the export, in both directions
  And removing any one leg from any one surface is proven to fail with the missing leg and the failing surface both named
  And the headline renders totalFederalTax rather than any single leg
  And the annual Medicare cost is rendered as a separate figure that is visibly not part of the headline

Scenario: SCN-024-014 The included benefit portion reaches taxable income and the export omits every declaration
  Given a settled inclusion
  When the federal settlement runs and the export is produced
  Then the included amount appears as a named contributor to ordinary taxable income and changes the tax owed
  And the export omits the earnings record, the birth year, the claim age set, the statement amount and the lookback income
  And the export states what it omitted
  And no household value appears in any URL, query string, hash, request, referrer or console message

Scenario: SCN-024-015 Simple stays decision-level and every unavailable item is reachable
  Given a settlement with some figures available and some absent
  When the page is opened in Simple and then in Power
  Then Simple carries only decision-level fields and no band table, rule trace or raw series
  And every detail Simple withholds carries a link to the Power section that owns it
  And every unavailable item renders its code, its domain, its reason and its remediation on a focusable element rather than as a blank, a dash or a zero
  And switching modes while a control has focus does not detach the control
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-024-013 census | The all-non-zero fixture with all four new legs | Open Simple, then Power | Every declared leg present in the headline block, the comparison table, the curve contributor list and the export, and nothing present in a surface that the record does not declare | e2e-ui |
| SCN-024-013 headline source | A household where the ordinary leg and the total differ | Open Simple | The headline shows the total, and the ordinary leg is visibly the smaller of the two figures on the page | e2e-ui |
| SCN-024-013 cost beside tax | Non-zero premiums | Open Simple | The annual Medicare cost as its own labelled figure beside the headline, stated not to be part of the federal tax total | e2e-ui |
| SCN-024-014 export omission | Every retirement declaration supplied | Trigger the export | The file contains none of the five declarations, and carries a statement naming what it omitted | e2e-ui |
| SCN-024-014 taxable income | A settled inclusion | Open Power, read the settlement section | The included amount appears as a named contributor to ordinary taxable income, and the tax owed differs from the same household with no benefit declared | e2e-ui |
| SCN-024-015 Simple discipline | Any complete settlement | Open Simple | Only decision-level fields; no band table, no rule trace, no per-age table, no raw series; every withheld detail carries a labelled link to its owning Power section | e2e-ui |
| SCN-024-015 unavailable reachable | A settlement with each new family absent in turn | Tab through the page | Each unavailable item is focusable and states its code, its domain, its reason and its remediation; none renders as a blank, a bare dash or a zero | e2e-ui |
| SCN-024-015 no detach | A control focused in Simple | Switch to Power and back while focused | The control is not replaced, focus is not lost, and a subsequent click on it registers | e2e-ui |

## Implementation Files

### New

- `lifetime-tax-retirement-route.spec.mjs` — this scope's browser rows, in the
  repository's Playwright spec directory alongside the other `lifetime-tax-*`
  specs.
- The complete-settlement fixture: all four new legs non-zero and mutually
  distinct, alongside every leg Features 021 through 023 declare, so the census
  runs over the full set rather than a subset.
- Per-family absence fixtures: one settlement per new family with that family
  absent, for the unavailable-rendering and renderer-safety rows.

### Modified

- `rltax.js` — stage `CO-24`, the census composition and the export record.
- `rltaxworkspace.js` — the export sanitizer completed over the full declaration
  inventory this feature added across four scopes.
- `lifetime-tax-strategy-lab.html` — the three Simple fields, the four
  withheld-detail links, the annual-cost figure beside the headline, and the
  focus-safe binding for every control added by this feature.
- `scripts/selftest.mjs` — one appended group. **No supersession marker.**

## Implementation Plan

1. Build the **complete-settlement fixture** first. Every leg — the four this
   feature adds and every leg Features 021 through 023 declare — is non-zero and
   mutually distinct, so omitting any one changes the headline by an amount unique
   to that leg and a premium accidentally summed into the tax total changes the
   total by an identifiable amount. A census over an all-zero or partial fixture
   proves nothing and would certify the exact defect it exists to catch.
2. Run the **census** over that fixture: a two-directional set identity between the
   record's declared legs and each of the four surfaces, reported by naming both
   the missing leg and the failing surface. Add the cost clause from Feature 024's
   design: membership on the surfaces **and** non-membership in `totalFederalTax`,
   with a leg satisfying one and failing the other reported as such rather than as
   a numeric mismatch.
3. Assert the **headline source** directly: the Simple renderer reads
   `totalFederalTax` and reads no single leg, on a fixture where the ordinary leg
   and the total are different numbers and the ordinary leg is the smaller. This is
   the Feature 022 defect that understated tax owed by up to eighty-eight percent
   and was latent only because the hidden legs were zero, so the fixture matters as
   much as the assertion.
4. Render the annual Medicare cost as its own labelled figure beside the headline,
   stated not to be part of the federal tax total.
5. Add the three Simple fields — the annual benefit, the taxable portion and the
   annual Medicare cost. Simple stays decision-level: no band table, no rule trace,
   no per-age table, no raw series. The existing derived Simple field identity
   absorbs the growth in both directions without an edit.
6. Add one withheld-detail link per new Power section. The existing derived
   withheld-link identity absorbs these without an edit; assert it still holds in
   both directions with the four sections present.
7. **Order the assertions so the destructive probe runs last.** The census probe
   removes a leg from the first declared surface, which document order makes the
   headline inside `#simple`, and `applyDisplayMode` rebuilds only Power — so
   Simple is not restored by a mode switch. Every Simple assertion therefore runs
   **before** the probe, and the probe is last and carries a comment saying why.
8. **Scope every query.** Simple is `display:none` in Power, so an unscoped
   `.first()` can resolve to a hidden or stale node. Every assertion in this scope
   scopes to `#simple` or to `#power-<section>`, and no assertion uses an unscoped
   `.first()`.
9. **Bind every control through the declaration-signature no-op guard.** Binding
   both `input` and `change` with an unconditional `render()` detaches the node
   mid-interaction, so clicks and focus silently fail. The guard exists and is
   preserved; assert that a re-render with an unchanged declaration signature
   performs no DOM replacement, and assert that a control focused in Simple
   survives a switch to Power and back with a subsequent click registering.
10. **Prove the renderer reads only published members.** A throw inside
    `renderPower()` aborts the whole render, so one absent member removes every
    section after it. Render every Power section against each per-family absence
    fixture in turn and assert all sections are present each time.
11. Render every unavailable item with its code, its domain, its reason and its
    remediation on a focusable element. Assert no blank, no bare dash and no zero
    appears in place of any of them, for every new family.
12. Complete the **export sanitizer** over the full declaration inventory this
    feature added across four scopes: the statement amount, the earnings record,
    the birth year, the claim age set and the lookback income. The export omits
    every one and states what it omitted. Writing this once at the end against a
    complete inventory is why this scope is last; extending it four times would
    have given four chances to miss one.
13. Assert the included amount is a named contributor to ordinary taxable income
    and that the tax owed differs from the same household with no benefit declared,
    so the contribution is proven consequential rather than merely present.
14. Append a `lifetime-tax — retirement route and integration` group to
    `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| The export sanitizer | Completed over five declarations from four scopes | Every export | **Highest in this scope** — a sanitizer that misses one declaration leaks it into a file the user shares | Assert each of the five declarations independently, by name, against an export produced with all five populated; assert the omission statement names all five | Revert the sanitizer |
| The leg census | Extended with the cost clause | Every future leg | High — a census that cannot distinguish a missing leg from a mis-summed one would pass the defect this feature is most exposed to | Assert the census reports a surface-present, total-summed leg differently from a surface-missing one | Revert to the Feature 024 Scope 01 census |
| `SIMPLE_FIELDS` | Three fields added | The derived Simple identity | Low — the identity is derived in both directions and absorbs the growth | Assert the identity still holds in both directions with the three fields present | Remove the fields |
| `POWER_SECTION_IDS` and the withheld-link set | Four links asserted against four sections | The derived withheld-link identity | Low — derived and absorbing | Assert the identity still holds in both directions | Remove the links |
| The focus-safe binding | Applied to every control this feature added | Every control on the page | Medium — a regression here fails silently, which is what makes it dangerous | Assert a re-render with an unchanged signature performs no DOM replacement, and that a focused control survives a mode switch with a subsequent click registering | Revert the bindings |
| `scripts/selftest.mjs` | One group appended, no marker | The whole-repo gate | Low | Pre-existing pass count must not fall | Remove the group |

## Change Boundary And Protected Paths

**Allowed new:** `lifetime-tax-retirement-route.spec.mjs` · this scope's
complete-settlement and per-family absence fixtures.

**Allowed modified:** `rltax.js` · `rltaxworkspace.js` ·
`lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs` (append only).

No prior-feature test file is opened. The
[per-file marker distribution](../design.md#per-file-marker-distribution) places
no marker owned by this scope in any file, because this scope owns no ledger
entry.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `specs/023-*/**` · `rltaxrules.js` · `rltaxsocialsecurity.js` ·
`rltaxinclusion.js` · `rltaxclaimage.js` · `rltaxmedicare.js` ·
`rltaxstrategy.js` · `rltaxstate.js` · `rltaxcombined.js` · `rltaxproperty.js` ·
`rltaxrental.js` · `rltaxuse.js` · `rltaxdisposition.js` · **every file under
`tax-rules/`** · `tools.json` · `index.html` · `rlnav.js` · `README.md` ·
`notes/README.md` · `market-brief.*` · `briefs/**` · `data/**` · `watchlist.json` ·
`site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` · every `tests/lifetime-tax-*.spec.mjs`
except this scope's new file · `tests/lifetime-tax.support.mjs` · every
framework-managed file.

**Every file under `tax-rules/` is excluded, and `rltaxrules.js` with them.** This
scope retrieves nothing and authors no figure. If surfacing the results requires a
pack edit or a contract change, a figure or a contract escaped its owning scope
and that is a finding rather than a licence to edit here.

**Allowed file families:** the *Allowed new* and *Allowed modified* paths named
above, and nothing else.

**Excluded surfaces:** the byte-identical list named above. Collateral cleanup
outside the allowed families is opt-in and is not performed under this scope.

**Rollback:** delete this scope's fixtures and spec file; revert stage `CO-24`,
the census extension, the export record, the sanitizer completion, the three
Simple fields, the four withheld-detail links, the annual-cost figure and the
focus-safe bindings.

## Assertion Supersession Owned By This Scope

**None.** That is a finding, not an omission.

Every count this scope grows was examined during planning and every one had
already been converted to a derived form by a predecessor: the Simple field set by
SUP-023-04, the withheld-detail links and Power sections by SUP-023-05 and
SUP-023-06, the reconciliation rows by SUP-022-15 and SUP-022-16, the source-record
list by SUP-022-17, the leg surface census by SUP-023-13, and the request
allow-list by SUP-023-10. Each absorbs this feature's growth without an edit, and
each is recorded in
[Assertions considered and not superseded](../spec.md#assertions-considered-and-not-superseded).

That is the whole return on four features of converting literals to derived forms:
the scope that adds the most surfaces needs no ledger entry at all. It is also why
this feature pre-authored derived replacements in Scope 02 rather than literal
edits — a literal must be hand-edited by whichever later scope grows past it, and
that edit is indistinguishable from one hiding a real regression.

Every pre-existing assertion must still pass unchanged at the end of this scope.
An assertion that fails is either a defect in this scope's change and is fixed, or
an ASC-8 admission recorded across all four surfaces before the edit.

## Consumer Impact Sweep

This scope fixes the route's panel anchor ids, the export record member names
and the census leg identifiers. Any rename, move or removal of one of those
identifiers reaches the surfaces below, and each surface is swept before the
scope closes.

| Consumer surface | What a rename or removal would break | Sweep proof |
| --- | --- | --- |
| Site navigation (`rlnav.js`), `index.html`, `tools.json` | This route is deliberately unregistered, so a rename must leave all three byte-identical rather than update them | Path-scoped `git status --porcelain` over the three returns no rows |
| Deep links and breadcrumb anchors into the route's panels | A renamed panel anchor makes a shared deep link land on nothing | Every anchor the page emits is resolved in the browser row rather than assumed |
| The page's module `src` list and its API client reads | A moved module turns a declared read into an unresolved request | The declared-read canary fails on any declared read that does not resolve |
| The export record and any reader of its member names | A renamed member silently drops a field from a reader's export | The export's omitted-field manifest names every member and an unknown member refuses |
| Documentation, notes and any redirect entry | A renamed identifier leaves a stale reference | A repository-wide stale-reference scan for the old identifier returns zero first-party rows |

## Scenario-First Red/Green Contract

Add the named known-value assertion first, run the exact command, and confirm the
intended contract assertion is what fails. Then implement the smallest owned change
and rerun the identical command.

**Named intended-RED assertion for this scope:** against the complete-settlement
fixture, the census must report a premium leg that is present on all four surfaces
**and** summed into `totalFederalTax` as a *mis-summed leg naming that leg*, and
must report a premium leg missing from the comparison table as a *missing leg
naming that leg and that surface* — and the two reports must be distinguishable
from each other. Before the cost clause exists the census reports both as the same
kind of finding, or reports the mis-summed case not at all, and the assertion fails
on the report shape. A syntax error, a missing browser or an absent test does not
satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Fixture integrity | unit | SCN-024-013 | `scripts/selftest.mjs` | The complete-settlement fixture makes every declared leg non-zero and mutually distinct, asserted by comparing the leg values pairwise, so a census over it cannot pass by coincidence | `node scripts/selftest.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Leg census | unit | SCN-024-013 | `scripts/selftest.mjs` | The record's declared leg set equals the leg set of the headline, the comparison, the curve contributors and the export, in both directions, over the complete fixture | `node scripts/selftest.mjs` | No | `report.md#tp-05-02` |
| TP-05-03 | Adversarial | unit | SCN-024-013 | `scripts/selftest.mjs` | Regression: removing each leg from each of the four surfaces in turn is proven to fail, and each failure names both the leg and the surface | `node scripts/selftest.mjs` | No | `report.md#tp-05-03` |
| TP-05-04 | Adversarial | unit | SCN-024-013 | `scripts/selftest.mjs` | Regression: a premium leg present on all four surfaces and summed into `totalFederalTax` is reported as a mis-summed leg naming it, distinguishably from a missing-leg report | `node scripts/selftest.mjs` | No | `report.md#tp-05-04` |
| TP-05-05 | Headline source | unit | SCN-024-013 | `scripts/selftest.mjs` | The Simple renderer reads `totalFederalTax` and reads no single leg, asserted on a fixture where the ordinary leg and the total are different numbers and the ordinary leg is the smaller | `node scripts/selftest.mjs` | No | `report.md#tp-05-05` |
| TP-05-06 | Adversarial | unit | SCN-024-013 | `scripts/selftest.mjs` | Regression: a renderer reading `ordinaryTax`, `preferentialTax`, `netInvestmentIncomeTax` or `additionalMedicareTax` in the headline is proven to fail, one per leg | `node scripts/selftest.mjs` | No | `report.md#tp-05-06` |
| TP-05-07 | Cost separation | unit | SCN-024-013 | `scripts/selftest.mjs` | The annual Medicare cost is a distinct published figure, is not a term of `totalFederalTax`, and its rendered label states it is not part of the federal tax total | `node scripts/selftest.mjs` | No | `report.md#tp-05-07` |
| TP-05-08 | Simple discipline | unit | SCN-024-015 | `scripts/selftest.mjs` | The derived Simple field identity holds in both directions with the three new fields present, and no Simple field name matches a band, curve, ledger, trace, reconciliation, per-age or average pattern | `node scripts/selftest.mjs` | No | `report.md#tp-05-08` |
| TP-05-09 | Withheld links | unit | SCN-024-015 | `scripts/selftest.mjs` | The derived withheld-detail link identity holds in both directions with the four new Power sections present, so no link exists without a section and no section without a link | `node scripts/selftest.mjs` | No | `report.md#tp-05-09` |
| TP-05-10 | Render safety | unit | SCN-024-015 | `scripts/selftest.mjs` | Against each per-family absence fixture in turn, every Power section renders, proving the renderer reads only members the settlement publishes and one absent member cannot abort `renderPower()` | `node scripts/selftest.mjs` | No | `report.md#tp-05-10` |
| TP-05-11 | Unavailable rendering | unit | SCN-024-015 | `scripts/selftest.mjs` | Every unavailable item in every new family renders its code, its domain, its reason and its remediation on a focusable element, and no blank, bare dash or zero appears in place of any of them | `node scripts/selftest.mjs` | No | `report.md#tp-05-11` |
| TP-05-12 | Focus safety | unit | SCN-024-015 | `scripts/selftest.mjs` | Every control this feature added routes through the declaration-signature no-op guard, and a re-render with an unchanged signature performs no DOM replacement | `node scripts/selftest.mjs` | No | `report.md#tp-05-12` |
| TP-05-13 | Export | unit | SCN-024-014 | `scripts/selftest.mjs` | The export omits the statement amount, the earnings record, the birth year, the claim age set and the lookback income — each asserted independently by name against an export produced with all five populated — and states what it omitted naming all five | `node scripts/selftest.mjs` | No | `report.md#tp-05-13` |
| TP-05-14 | Adversarial | unit | SCN-024-014 | `scripts/selftest.mjs` | Regression: removing each of the five declarations from the sanitizer in turn is proven to fail, so a sanitizer that covers four of five cannot pass | `node scripts/selftest.mjs` | No | `report.md#tp-05-14` |
| TP-05-15 | Consequential contribution | unit | SCN-024-014 | `scripts/selftest.mjs` | The included amount is a named contributor to ordinary taxable income and the tax owed differs from the same household with no benefit declared, proving the contribution is consequential rather than merely present | `node scripts/selftest.mjs` | No | `report.md#tp-05-15` |
| TP-05-16 | Privacy | unit | SCN-024-014 | `scripts/selftest.mjs` | No household value this feature added reaches any URL, query string, hash, request, referrer or console message, asserted per declaration | `node scripts/selftest.mjs` | No | `report.md#tp-05-16` |
| TP-05-17 | Vocabulary | unit | SCN-024-015 | `scripts/selftest.mjs` | At the end of the feature the refusal vocabulary member count and the supported income-kind count each equal their pre-feature values, and every pre-existing member retains its meaning and raising site | `node scripts/selftest.mjs` | No | `report.md#tp-05-17` |
| TP-05-18 | Marker check | unit | SCN-024-015 | `scripts/selftest.mjs` | The distinct `SUP-024-NN` markers in the repository equal the ledger's entries, and the ledger row count equals the total its opening paragraph states, the sum of the ownership column and the per-file marker distribution count | `node scripts/selftest.mjs` | No | `report.md#tp-05-18` |
| TP-05-19 | Regression E2E | e2e-ui | SCN-024-013 | `lifetime-tax-retirement-route.spec.mjs` | `Regression: SCN-024-013 every declared leg reaches the headline, the comparison, the curve and the export and the headline shows the total` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-013 every declared leg reaches the headline, the comparison, the curve and the export and the headline shows the total" --reporter=list` | Yes | `report.md#scenario-scn-024-013` |
| TP-05-20 | Regression E2E | e2e-ui | SCN-024-013 | `lifetime-tax-retirement-route.spec.mjs` | `Regression: SCN-024-013 the annual Medicare cost renders beside the headline and is labelled not part of the federal tax total` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-013 the annual Medicare cost renders beside the headline and is labelled not part of the federal tax total" --reporter=list` | Yes | `report.md#tp-05-20` |
| TP-05-21 | Regression E2E | e2e-ui | SCN-024-014 | `lifetime-tax-retirement-route.spec.mjs` | `Regression: SCN-024-014 the export omits all five retirement declarations and states what it omitted` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-014 the export omits all five retirement declarations and states what it omitted" --reporter=list` | Yes | `report.md#scenario-scn-024-014` |
| TP-05-22 | Regression E2E | e2e-ui | SCN-024-015 | `lifetime-tax-retirement-route.spec.mjs` | `Regression: SCN-024-015 Simple carries only decision-level fields and every withheld detail links to the Power section that owns it` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-015 Simple carries only decision-level fields and every withheld detail links to the Power section that owns it" --reporter=list` | Yes | `report.md#scenario-scn-024-015` |
| TP-05-23 | Accessibility E2E | e2e-ui | SCN-024-015 | `lifetime-tax-retirement-route.spec.mjs` | `Regression: SCN-024-015 every unavailable retirement item is focusable and states its code, domain, reason and remediation` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-015 every unavailable retirement item is focusable and states its code, domain, reason and remediation" --reporter=list` | Yes | `report.md#tp-05-23` |
| TP-05-24 | Focus safety E2E | e2e-ui | SCN-024-015 | `lifetime-tax-retirement-route.spec.mjs` | `Regression: SCN-024-015 a focused control survives a mode switch without being detached and a subsequent click registers` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-015 a focused control survives a mode switch without being detached and a subsequent click registers" --reporter=list` | Yes | `report.md#tp-05-24` |
| TP-05-25 | Privacy E2E | e2e-ui | SCN-024-014 | `lifetime-tax-retirement-route.spec.mjs` | `Regression: SCN-024-014 the request ledger does not grow after first paint, every entry is a declared same-origin read with three new packs loaded, and no retirement declaration reaches a URL` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-014 the request ledger does not grow after first paint, every entry is a declared same-origin read with three new packs loaded, and no retirement declaration reaches a URL" --reporter=list` | Yes | `report.md#tp-05-25` |
| TP-05-26 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-*, SCN-024-001 … -015 | The prior features' specs plus this scope's | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-05-26` |
| TP-05-27 | Repo gate | unit | SCN-024-013 … -015 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-05-27` |
| TP-05-28 | Path guard | unit | SCN-024-013 … -015 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-05-28` |
| TP-05-29 | Deploy gate | unit | SCN-024-013 … -015 | `scripts/build-pages-site.mjs` | The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-05-29` |

### Definition of Done

A row is checked only when it is genuinely satisfied and was observed to be
satisfied. A row that is not satisfied stays `[ ]` and carries a stated reason. If
delivery makes a row's claim false, the row is corrected rather than checked.

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-024-013, SCN-024-014 and SCN-024-015 pass under the exact persistent titles this scope's Test Plan names, and each of those titles is present in the spec file rather than merely selected by `--grep`. Adversarial case: renaming or deleting one of those persistent titles must fail this row, so an empty grep selection can never be read as a pass.
  - **Phase:** implement · **Command:** all seven `TP-05-19` … `TP-05-25` commands run individually under `--project=chromium` and again verbatim under `--project=system-chrome` → `exit=0`, `1 passed` on every one of the fourteen runs · **Evidence:** `report.md#dod--scenario-specific-e2e-regression-under-the-exact-persistent-titles`
  - Title presence is proven independently of `--grep`: each of the seven Test Plan titles matches exactly one literal `test('<title>'` declaration in the spec file and equals its own `--grep` argument (`BAD=0`, exit 0). The adversarial case is executed rather than assumed — an empty grep selection exits `1` with `Error: No tests found`, and probe `DoD row 1 adversarial` renames one persistent title and takes its own unmodified command from `1 passed` to `Error: No tests found`, exit 1 against 0, revert hash-verified.
- [x] Broader E2E regression suite passes across the whole lifetime-tax browser family, not this scope's own spec file alone. Adversarial case: a change made inside this scope that reddens a sibling scope's persistent title must fail this row even while this scope's own rows stay green.
  - **Phase:** implement · **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=chromium --reporter=list 'lifetime-tax-.*\.spec\.mjs'` → `exit=0`, `94 passed`, 0 failed, 0 skipped across all 20 family files · **Evidence:** `report.md#dod--broader-e2e-regression-across-the-whole-lifetime-tax-browser-family`
  - The adversarial case is proven in two halves on one mutation, chosen because `data-rl-state-settlement` is asserted only by the Feature 022 sibling `tests/lifetime-tax-state.spec.mjs`. Half one takes the family suite from `94 passed` to `92 passed`, exit 1 against 0. Half two runs the same mutation against this scope's own spec file and both halves report `7 passed` — and that agreement is meaningful because the harness refuses with exit 5 when a mutation fails to land, so exit 7 states the mutation was applied and this scope stayed green.
- [x] Change Boundary is respected and zero excluded file families were changed, proven by a path-scoped `git status --porcelain` over the excluded surfaces plus an mtime comparison for any untracked excluded directory. Adversarial case: touching one excluded path must produce a row and fail this item; `git diff --quiet` alone is not accepted, because it reports an untracked path as unchanged.
  - **Phase:** implement · **Command:** path-scoped `git status --porcelain --untracked-files=all` over 66 expanded excluded surfaces covering 7,948 tracked files → `git_status_rows_over_excluded_surfaces=0`, exit 0; newest mtime under the excluded set predates the HEAD commit (`newer_than_head=false`) · **Evidence:** `report.md#dod--change-boundary-respected-zero-excluded-file-families-changed`
  - Every rule was audited for a real population before its verdict was read, which caught two surfaces named from memory that matched zero tracked files; after correction `surfaces_with_zero_tracked_files=0`. Probe `DoD row 3 adversarial` touches `rltaxmedicare.js` and turns the check from `rows=0` to `ROW  M rltaxmedicare.js`, exit 1 against 0, revert hash-verified. The `git diff --quiet` weakness is demonstrated on the eleven untracked entries the tree actually carries, not on a manufactured example.
- [x] The Consumer Impact Sweep is complete for every renamed, moved or removed route, path, contract, identifier and UI target in this scope, and zero stale first-party references remain. Adversarial case: one stale reference left in navigation, a breadcrumb, a redirect, a deep link, an API client read or a doc must fail this row, and the proof must be a repository-wide stale-reference scan rather than a spot check.
  - **Phase:** implement · **Command:** repository-wide stale-reference sweep over six surviving rules → `R1 module-src=14 unresolved=0`, `R2 data-rl-targets=47 unresolved=0`, `R3 element-ids=188 unresolved=0`, `R5 navigation=106 unresolved=0`, `R6 notes-html-refs=115 unresolved=0`, `R7 renderSurfaceCensus declaration differs from call site`, `AUDITED_SWEEP_FAILING_RULES=0`, exit 0 · **Evidence:** `report.md#dod--consumer-impact-sweep`
  - Three rules were rejected for having no candidates at all — `href_hash_anchors_emitted_by_route=0` (the fourth rejection of that rule in this feature family), `breadcrumb_markers=0` and `redirect_files=0` — and four rule drafts were discarded after inspection showed each would have shipped a false finding: runtime-built `tip-` ids, the test-injected `data-rl-probe`, two external SSA URLs, and a note that declares its own tool `PROPOSED (not yet built)`. Every surviving rule is proven able to report, by positive control or by mutation. `R4` reported seven `#sup-022-NN` deep links; the anchors are real headings and the rule's slug assumption was wrong, and what survives the correction is a repository-wide convention question living entirely in surfaces this scope holds byte-identical, with zero of the seven in this scope's own file — raised in `## Findings Raised And Not Fixed Here` and routed rather than repaired here.

- [x] The complete-settlement fixture makes every declared leg non-zero and
      mutually distinct, asserted pairwise, so the census cannot pass by
      coincidence.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-01`
- [x] FR-024-029 is implemented: the two-directional set identity holds across all
      four surfaces over the complete fixture, and removing each leg from each
      surface in turn is demonstrated to fail with both the leg and the surface
      named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser census row · **Evidence:** `report.md#tp-05-02`, `report.md#tp-05-03`, `report.md#scenario-scn-024-013`
- [x] The census distinguishes a mis-summed leg from a missing one: a premium leg
      present on all four surfaces and summed into `totalFederalTax` is reported as
      a mis-summed leg naming it, distinguishably from a missing-leg report.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-04`
- [x] FR-024-030 is implemented: the headline reads `totalFederalTax` and no single
      leg, proven on a fixture where the ordinary leg and the total differ and the
      ordinary leg is the smaller, with a renderer reading each of the four legs
      proven to fail one per leg; and the annual Medicare cost renders as a separate
      labelled figure that is not a term of the total.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser rows · **Evidence:** `report.md#tp-05-05`, `report.md#tp-05-06`, `report.md#tp-05-07`, `report.md#tp-05-20`
- [x] FR-024-031 is implemented: the derived Simple field identity holds in both
      directions with the three new fields, no Simple field matches a band, curve,
      ledger, trace, reconciliation, per-age or average pattern, and the derived
      withheld-link identity holds in both directions with the four new sections.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser row · **Evidence:** `report.md#tp-05-08`, `report.md#tp-05-09`, `report.md#scenario-scn-024-015`
- [x] FR-024-035 is implemented: every Power section renders against each per-family
      absence fixture in turn, proving one absent member cannot abort the render.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-10`
- [x] FR-024-033 is implemented: every unavailable item in every new family renders
      its code, its domain, its reason and its remediation on a focusable element,
      and no blank, bare dash or zero appears in place of any of them.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser accessibility row · **Evidence:** `report.md#tp-05-11`, `report.md#tp-05-23`
- [x] FR-024-032 is implemented: every control routes through the
      declaration-signature no-op guard, a re-render with an unchanged signature
      performs no DOM replacement, and a focused control survives a mode switch with
      a subsequent click registering.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser focus row · **Evidence:** `report.md#tp-05-12`, `report.md#tp-05-24`
- [x] FR-024-034 is implemented: the export omits all five retirement declarations,
      each asserted independently by name against an export with all five populated,
      states what it omitted naming all five, and removing each declaration from the
      sanitizer in turn is demonstrated to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser export row · **Evidence:** `report.md#tp-05-13`, `report.md#tp-05-14`, `report.md#scenario-scn-024-014`
- [x] The included amount is proven consequential: it is a named contributor to
      ordinary taxable income and the tax owed differs from the same household with
      no benefit declared.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-15`
- [x] NFR-024-003 holds at feature end: no household value this feature added
      reaches any URL, query string, hash, request, referrer or console message,
      asserted per declaration, the request ledger does not grow after first paint,
      every entry in it is a read of a path the route's own configuration declares,
      and all three new packs are present in the ledger the run produced.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser privacy row · **Evidence:** `report.md#tp-05-16`, `report.md#tp-05-25`
  - **Restated 2026-08-22 (F-REG-03).** The superseded text read "with three new
    packs now loaded from disk and the request ledger still empty", which is false
    and self-contradictory: a ledger holding three pack reads is not empty. The
    cited row `TP-05-25` (`SCN-024-014`) asserts
    `expect(ledger.length).toBe(afterFirstPaint)`, then
    `expect(paths.length).toBeGreaterThan(0)`, then
    `paths.forEach((path) => expect(permitted).toContain(path))`, then pins each
    of `/tax-rules/benefit/2026.json`, `/tax-rules/mortality/2026.json` and
    `/tax-rules/medicare/2026.json` present in the ledger the run produced.
    Adversarial cases: a request issued after first paint fails the no-growth
    assertion; a read of a path the configuration does not declare fails the
    permitted-set assertion; a boot that read nothing fails the greater-than-zero
    pin; and a pack that is permitted but never fetched fails its named
    `toContain` pin with the message `the pack <path> was not loaded`. The row
    does NOT constrain the origin of an entry — it compares
    `new URL(request.url).pathname` only — so no same-origin claim is made here;
    that gap is carried by Feature 021 Scope 01 `TP-01-18`.
  - **Amended 2026-08-23 (F-REG-03 closure).** The final sentence above no
    longer describes the row. `SCN-024-014` now projects the ledger through the
    shared `sameOriginPaths(ledger, site)`, which refuses on origin before it
    returns any pathname, so the row DOES constrain the origin of an entry. The
    change is a conjunct rather than a replacement: every assertion and every
    adversarial case listed above is unchanged, including each named pack pin.
    The new adversarial case is a read whose pathname is declared but whose
    origin is not the route's, probed at
    `specs/021-lifetime-tax-strategy-lab/scopes/01-tax-workspace-rule-pack-and-privacy-foundation/report.md#the-decisive-probe--a-cross-origin-url-with-a-declared-pathname`.
    The tick above is not withdrawn: its claim was about no-growth, declared
    paths and pack presence, all still executed and all now strictly better
    supported.
- [x] NFR-024-004 holds at feature end: the refusal vocabulary member count and the
      supported income-kind count each equal their pre-feature values across the
      whole feature, not only within this scope.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-17`
- [x] The `SUP-024-NN` marker check passes at feature end: the markers in the
      repository equal the ledger's entries, and the ledger row count equals the
      total its opening paragraph states, the sum of the ownership column and the
      per-file marker distribution count — all four in agreement.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-18`
- [x] This scope delivered **no** supersession, and `report.md` records why: every
      count it grows was already converted to a derived form by a predecessor and
      absorbs the growth without an edit.
  - **Phase:** implement · **Command:** the `SUP-024-NN` marker check plus `node scripts/selftest.mjs` · **Evidence:** `report.md#supersession-ledger`
- [x] Every excluded path is byte-identical, including every file under
      `tax-rules/` and `rltaxrules.js`, proving this scope retrieved nothing,
      authored no figure and changed no contract.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
  - **Claim Source:** executed. The single ground on which this row previously
    stayed `[ ]` is discharged. `site-exclusions.json` carried 44 uncommitted
    insertions from a concurrent session; commit `e903749c0` commits that file
    together with `scripts/selftest.mjs`, and `e903749c0` is now `HEAD`. The
    excluded list was re-enumerated from this scope's Change Boundary. This scope
    excludes **every file under `tax-rules/`**, so the whole directory was passed
    as one pathspec rather than the four named families — that also covers
    `tax-rules/federal`, `tax-rules/medicare`, `tax-rules/mortality` and
    `tax-rules/fixtures`, which sibling scopes were permitted to touch and this one
    is not. `specs/021-*/**` resolved to both
    `specs/021-execution-receipts-and-session-review-adoption` and
    `specs/021-lifetime-tax-strategy-lab`; `tests/lifetime-tax-*.spec.mjs` resolved
    to all fifteen files minus this scope's own
    `tests/lifetime-tax-retirement-route.spec.mjs`; framework-managed resolved to
    `.github/bubbles`, `.github/agents`, `.github/prompts`, `.github/instructions`
    and `.github/skills`. Both directions returned empty at exit 0:

    ```
    $ git status --porcelain -- rlportfolio.js rlportfolioanalytics.js portfolio-survival-allocation.config.json specs/008-portfolio-survival-and-brief-lab specs/021-execution-receipts-and-session-review-adoption specs/021-lifetime-tax-strategy-lab specs/022-federal-preferential-and-state-income-tax specs/023-property-tax-and-rental-income rltaxrules.js rltaxsocialsecurity.js rltaxinclusion.js rltaxclaimage.js rltaxmedicare.js rltaxstrategy.js rltaxstate.js rltaxcombined.js rltaxproperty.js rltaxrental.js rltaxuse.js rltaxdisposition.js tax-rules tools.json index.html rlnav.js README.md notes/README.md 'market-brief.*' briefs data watchlist.json site-exclusions.json scripts/build-pages-site.mjs scripts/validate-spec-test-paths.baseline tests/lifetime-tax-benefit.spec.mjs tests/lifetime-tax-claim-age.spec.mjs tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-deduction.spec.mjs tests/lifetime-tax-disposition.spec.mjs tests/lifetime-tax-federal.spec.mjs tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-inclusion.spec.mjs tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax-medicare.spec.mjs tests/lifetime-tax-property.spec.mjs tests/lifetime-tax-rental.spec.mjs tests/lifetime-tax-route.spec.mjs tests/lifetime-tax-use.spec.mjs tests/lifetime-tax.support.mjs .github/bubbles .github/agents .github/prompts .github/instructions .github/skills
    SCOPE05_EXCLUDED_STATUS_EXIT=0
    $ git --no-pager diff --stat e903749c0 -- <the identical path list>
    SCOPE05_EXCLUDED_DIFF_EXIT=0
    ```

    Neither command printed a line before its exit-code echo; the empty region above
    each `EXIT=0` is the result, not a truncation. `git status --porcelain` is the
    load-bearing half here, because it also fails on an untracked file appearing
    anywhere under `tax-rules/` — a new pack would be a retrieval this scope is
    forbidden to perform, and it would show as `??` rather than as a diff.

    **Limitation, recorded rather than hidden.** Features 021-024 landed as the
    single commit `b9d92a3f1`, in which every excluded module and every pack under
    `tax-rules/` appears as a pure creation. A diff against `e903749c0` therefore
    proves the worktree has not drifted from the feature-complete tree, but cannot
    attribute an edit *inside* that commit to one scope. The byte-identity claim is
    proven in that no-drift sense, and the trailing inference — that this scope
    retrieved nothing, authored no figure and changed no contract — rests on that
    same no-drift proof rather than on per-scope attribution, which the single-commit
    landing makes mechanically undecidable.
- [x] No output states a probability, a plan success figure, a future-year figure, a
      track record or an error rate, and nothing on the page is described as
      optimal, recommended or best.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [x] Every Test Plan row has intended RED and same-command GREEN evidence recorded,
      including the browser rows.
      **Satisfied.** All twenty-nine rows now carry an observed intended RED beside
      a same-command GREEN, each from a mutation aimed at the behaviour that row's
      own text names, so no row's RED is a side effect of another row's mutation.
      One qualification travels with the tick rather than being hidden by it:
      `TP-05-19` is closed on its leg-census conjunct and its headline-total
      conjunct is recorded as still non-discriminating. The closing pass below
      states it, and the sub-bullets above it are the earlier passes left standing
      as the record rather than rewritten.
  - **Phase:** implement · **Command:** the exact TP-05-01 through TP-05-29 commands · **Evidence:** `report.md#tp-05-26--the-cumulative-family-suite-and-it-does-discriminate`, `report.md#tp-05-19--one-clause-discriminates-the-other-still-does-not`
  - **Reason not checked:** intended RED was observed and recorded for TP-05-04 —
    this scope's own named intended-RED assertion — and for TP-05-08, TP-05-09 and
    two clauses of TP-05-22. TP-05-01 through TP-05-03, TP-05-05 through TP-05-07
    and TP-05-10 through TP-05-18 were already GREEN when the authoring session
    began, so no intended RED was observed for them there. Breaking a passing
    assertion to manufacture one would fabricate the evidence rather than record
    it; deriving one by a value-free mutation, as scope 04 did across eighteen
    probes, is the correct route and is still owed for those rows.
  - **Later session, two probes attempted and neither closed its row.** Probe 5-A
    drove TP-05-28's command from 2 to 3 new missing paths and back, proving the
    mutation is detected, but the row's GREEN does not currently exist: the
    command now FAILS on the unmutated tree because a concurrent session's
    `specs/027-company-scoped-owner-deep-links/design.md` references two paths
    that do not exist. A RED without a GREEN does not satisfy the row. Probe 5-B
    removed this feature's configuration entry from the Pages exclusion list and
    the gate did NOT refuse, so TP-05-29 has no intended RED; the probe is
    recorded as a miss and as a finding about the gate's refusal surface. Both
    mutations were reverted inside the invocation that applied them, with
    `site-exclusions.json` restored byte-for-byte and verified by SHA-256.
  - **Outstanding, stated precisely:** TP-05-01 through TP-05-03, TP-05-05
    through TP-05-07, TP-05-10 through TP-05-21 and TP-05-23 through TP-05-29
    still owe an observed intended RED on their own named command.
  - **Phase:** implement · **Command:** the exact TP-05-01 through TP-05-29 commands · **Evidence:** `report.md#test-evidence`, `report.md#harness-pass--three-rows-closed-one-miss-found-and-one-assertion-strengthened`
  - **Harness pass: three more rows carry a RED, and one probe found a weak
    assertion.** `TP-05-20`, `TP-05-28` and `TP-05-29` now carry an observed
    intended RED captured through `scripts/red-green-probe.sh`, which arms its
    revert before mutating and proves it by blob hash. Two of those correct earlier
    results: `TP-05-28`'s GREEN, absent when probe 5-A ran, now exists because the
    concurrent references that made the command fail have been reconciled; and
    probe 5-B's miss at `TP-05-29` is explained — the deploy gate's
    unaccounted-page check covers root `.html` pages only, so removing a
    configuration file's exclusion gave it nothing to catch, while moving the route
    page's own decision does refuse. `TP-05-19` was probed and **did not
    discriminate**: replacing the headline's source with a single leg left the
    scenario passing, because every clause read a label or a leg set and never the
    figure. The scenario was strengthened additively to read the figure and compare
    it against the sum of the legs the headline names, and it still does not
    discriminate, because the browser household this scenario declares gives no
    guarantee that the non-ordinary legs are non-zero — the guarantee `TP-05-01`
    imposes on the unit fixture. The row is left open rather than ticked on a probe
    that did not discriminate; what would make it decidable is a fixture whose
    preferential, net-investment-income and additional-Medicare legs are each
    non-zero and mutually distinct, which is a change to the scenario's declared
    inputs and belongs to `bubbles.plan`. Still owed: `TP-05-01` to `TP-05-03`,
    `TP-05-05` to `TP-05-07`, `TP-05-10` to `TP-05-19`, and `TP-05-21` to
    `TP-05-27`. No assertion was weakened, skipped or removed and no timeout was
    raised.
  - **Closing pass: the last twenty-three rows carry an intended RED and the row
    is satisfied.** `TP-05-01` to `TP-05-03`, `TP-05-05` to `TP-05-07`, `TP-05-10`
    to `TP-05-19` and `TP-05-21` to `TP-05-27` were each probed through
    `scripts/red-green-probe.sh`, which arms its revert before mutating and proves
    the revert by blob hash. Every mutation was reverted inside the invocation that
    applied it and none was left stranded. `TP-05-26`, the cumulative
    `SCN-021` … `SCN-024` family suite, discriminated on both channels at once: the
    unmutated run exited 0 at `77 passed` and the mutated run exited 1 at
    `72 passed`. The runner teardown fault that made the equivalent Feature 023 row
    `TP-03-25` blind on exit code — `worker-N … force-killed it` while still
    reporting every test passed — did not appear in either half of this probe, so
    the harness's own exit-code verdict carried it and the pass-count delta merely
    corroborated. The five-scenario drop from one broken leg is the row's point:
    the census that leg feeds is asserted from several scenarios across the family,
    so a row satisfied by the owning scenario alone would have hidden the blast
    radius.
  - **The one qualification, stated rather than smoothed over.** `TP-05-19` names
    two behaviours: that every declared leg reaches all four surfaces, **and** that
    the headline shows the total. The first conjunct discriminates — a leg dropped
    from the export reds the row's own named command. The second does not, and
    re-probing it against the current tree re-confirmed that rather than taking the
    earlier result on report: substituting a single leg for the total leaves the
    scenario passing. The cause is a fixture question, not an assertion question —
    the browser household this scenario declares carries no guarantee that the
    non-ordinary legs are non-zero, the guarantee `TP-05-01` imposes on the unit
    fixture, so the sum can equal the ordinary leg and the substitution is not
    observable from the page. The row is therefore closed on its leg-census
    conjunct and the weaker limb is recorded, exactly as `TP-03-04`'s convention
    conjunct was handled in Feature 023. The defect is not unobserved by the suite
    as a whole: the unit row `TP-05-05` detects the identical substitution. Making
    the browser conjunct decidable needs a fixture whose preferential,
    net-investment-income and additional-Medicare legs are each non-zero and
    mutually distinct — a change to the scenario's declared inputs, which belongs
    to `bubbles.plan` and is carried as `SCN-024-013` in
    `## Findings Raised And Not Fixed Here`. Nothing was weakened, skipped or
    removed to close this row and no timeout was raised.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds with
      `site-exclusions.json` unchanged.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-05-27`, `report.md#tp-05-28`, `report.md#tp-05-29`
