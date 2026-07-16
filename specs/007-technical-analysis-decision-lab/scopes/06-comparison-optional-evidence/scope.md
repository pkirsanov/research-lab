# Scope 06: Comparison And Optional Evidence

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `comparison:true`, `optional-evidence:true`

**Depends On:** Scope 01 - Capability Foundation And Shared Contracts; Scope 02 - Technique Engine And Evidence Independence; Scope 03 - Level Geometry And Setup Lifecycle; Scope 04 - Five-Gate Synthesis And Candidate Selection; Scope 05 - Existing-Owner Publication And Strict Adapters

**Primary Outcome:** Broad-market, sector/industry, peer, and optional context roles remain explicit, aligned, source-qualified, denominator-bearing, and identity-frozen, while compatible option and unavailable microstructure evidence retain their owner assumptions and never substitute for a comparison role.

## Gherkin Scenarios

### SCN-007-014 / BS-014 - Comparison roles reveal relative weakness

```gherkin
Scenario: Stock breakout lacks sector and peer confirmation
  Given the stock closes at a new setup high
  And its sector ratio and peer percentile remain below their corresponding highs
  When comparison evidence resolves
  Then market, sector, and peer outcomes are shown separately
  And relative weakness is a contradiction
  And the product does not generalize Dow's industrial/transport rule into an unsupported identical rule
```

### SCN-007-028 / BS-028 - Comparison-set change creates a new variant

```gherkin
Scenario: User changes the peer membership after validation
  Given a setup variant has a ValidationRecord for one confirmed market, sector, and peer set
  When the user adds, removes, or reclassifies a comparison symbol
  Then the new ComparisonSet shows its membership, rationale, classification source, as-of date, and eligible denominator
  And a new variant identity is created
  And the prior ValidationRecord remains attached only to the prior comparison policy
```

## Exact Pure Symbol Ownership

Scope 06 completes `tadBuildComparisonSet` over the foundation's `tadAlignSeries` and Scope 02 `tadRelativeStrength`. It uses, without changing, `tadBuildVariantIdentity`, `tadValidateOwnerRead`, and all option/microstructure owner adapters from Scopes 01 and 05.

## Implementation Plan

1. Build an exact `TadComparisonSetV1` from explicit broad-market, sector/industry, direct-peer, and optional-context roles. Require symbol, role, rationale, classification source/as-of, currency/session/adjustment policy, normalization, minimum peer denominator, decision vintage, and membership digest.
2. Validate aligned source-qualified series by timestamp availability, session, currency, adjustment, overlap, freshness, and source policy. A conflict degrades or blocks only the affected role and names observed, required, and corrective action.
3. Compute normalized total-return ratios, corresponding swings, relative state, and denominator-aware peer percentile. Raw-price similarity is never a comparison result.
4. Keep market, sector/industry, peers, and optional context separate in evidence, gates, charts, tables, and owner projection. One role never silently replaces another, and arbitrary roles are not described as Dow's industrial/transport theorem.
5. Require `denominator >= minimumPeerDenominator` for percentile output. Below the minimum, preserve named pairwise ratios and excluded-symbol reasons but omit percentile.
6. Freeze membership, roles, rationale, classification source/as-of, session/currency/adjustment, normalization, denominator policy, and decision vintage in the comparison identity. Any behavior-bearing change creates a new variant and retains the prior passport on its prior identity.
7. Never auto-replace an incompatible comparator. Preserve the requested role as partial/incompatible/unavailable until the user confirms a changed membership.
8. Render compatible option positioning from the Scope 05 owner adapter as a separately labeled optional family. Keep snapshot/convention/assumptions visible and preserve exact unavailable footprint/depth/large-trade records.
9. Extend the validator, analytic/source-qualified comparison fixtures, selftest marker, and real-page ratio/denominator/identity regressions. Fixture assertions verify production-aligned calculations rather than fixture-provided expected labels.

## Shared Infrastructure Impact Sweep

| Shared surface | Protected behavior | Canary and restore contract |
| --- | --- | --- |
| `scripts/selftest.mjs` | Existing groups and Scope 01-05 Feature 007 assertions | Full selftest before broad E2E; Scope 06 additions remain in their sub-marker and rollback removes exactly that block |
| Feature page/config | Owner-read admission, source/session identities, family counts, candidate rank, and prior variant/passport links | Every prior focused title and cumulative suite remains green; config validator proves only declared comparison policy records changed |
| Owner-read consumers | Outer/nested truth, snapshot convention, denominators, and deep links | Scope 05 owner matrix runs before the cumulative suite and no owner page is edited in Scope 06 |

## Change Boundary And Rollback

**Allowed edits:** Feature 007 page/config/validator, Feature 007 selftest marker, Feature 007 browser file, and Feature 007 comparison fixtures.

**Marker-bounded page edit:** Scope 06 declarations/rendering live between `/* ---------- Feature 007 Scope 06: comparison and optional evidence ---------- */` and its matching end marker. Selftest additions use the matching sub-marker.

**Explicitly excluded:** every owner page and publisher marker, shared runtime helpers, registries/navigation, notes/docs, Market Brief, package/workflow files, Feature 005/006 paths, and unrelated tests.

**Rollback/restore:** remove only Scope 06 comparison/config/fixture/test hunks, rerun Scope 05 owner matrix and all earlier focused rows, verify prior variant/passport identities remain byte-identical, and preserve every owner/excluded path.

## Scenario-First TDD Contract

Write role-separation, alignment, denominator, incompatibility, identity, and browser assertions before production behavior. Capture intended RED and same-command GREEN for each Test Plan row. Every visible comparison behavior has a literal `Regression:` title.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-06-01 | Unit | unit | SCN-007-014, 028 | `scripts/selftest.mjs` | Execute comparison-set construction, timestamp alignment, normalized ratios, corresponding swings, role separation, incompatibility, denominator threshold, no auto-replacement, and variant/passport identity changes | `node scripts/selftest.mjs` | No | `report.md#tp-06-01` |
| TP-06-02 | Contract validator | functional | SCN-007-014, 028 | `scripts/validate-technical-analysis-decision.mjs` | Validate comparison policies, membership roles/rationale/source/as-of, normalization, minimum denominator, initial selection, owner capability references, and config/universe JSON parity | `node scripts/validate-technical-analysis-decision.mjs` | No | `report.md#tp-06-02` |
| TP-06-03 | Regression E2E | e2e-ui | SCN-007-014 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-014 market sector and peer roles expose relative weakness separately` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-014 market sector and peer roles expose relative weakness separately" --reporter=list` | Yes | `report.md#scenario-scn-007-014` |
| TP-06-04 | Regression E2E | e2e-ui | SCN-007-028 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-028 comparison membership change creates a new variant and preserves prior validation` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-028 comparison membership change creates a new variant and preserves prior validation" --reporter=list` | Yes | `report.md#scenario-scn-007-028` |
| TP-06-05 | Broader Regression E2E | e2e-ui | SCN-007-014, 028 | `tests/technical-analysis-decision-lab.spec.mjs` | Execute the complete cumulative Feature 007 browser suite after both Scope 06 focused titles | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-06-05` |

### Definition of Done

#### Core Delivery Items

- [ ] Every comparison role retains explicit membership, rationale, source/as-of, alignment, normalization, denominator, eligibility, exclusion, and truth state across all projections.
- [ ] Normalized ratios/corresponding swings and denominator-aware peer evidence are correct; raw-price similarity, silent role substitution, auto-replacement, and unsupported Dow equivalence are absent.
- [ ] Any membership, role, classification, normalization, or denominator-policy change creates a distinct variant and leaves the prior passport attached only to its prior identity.
- [ ] Option and microstructure evidence stays separately optional, source/convention faithful, and unavailable when its exact contract is absent.
- [ ] Scope 06 marker, Shared Impact Sweep, owner-read canaries, fixtures, and rollback preserve every prior and excluded surface.
- [ ] Every Scope 06 Test Plan row has intended RED and same-command GREEN evidence.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-06-01 unit evidence proves comparison construction, alignment, ratios, roles, denominators, incompatibility, identity, and prior-passport preservation.
- [ ] TP-06-02 functional evidence proves comparison/config/owner references and universe JSON parity.
- [ ] TP-06-03 Regression E2E evidence proves SCN-007-014 keeps market, sector, and peer outcomes separate and exposes relative weakness.
- [ ] TP-06-04 Regression E2E evidence proves SCN-007-028 creates a new identity for changed membership and preserves prior validation.
- [ ] TP-06-05 broader E2E evidence proves the cumulative Feature 007 suite passes after focused Scope 06 rows.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, comparison identity/denominator audit, source-qualified fixture review, marker diffs, owner matrix, no-interception/silent-pass scan, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, plan sync, and traceability are current and clean with every finding accounted for.
