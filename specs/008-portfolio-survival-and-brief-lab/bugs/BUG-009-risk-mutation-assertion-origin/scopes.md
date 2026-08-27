# BUG-009 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.test`

[Spec](spec.md) | [Design](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

This reconciled plan changes no source or persistent test. It defines one
test-only execution scope for `bubbles.test`.

## Execution Outline

### Phase Order

1. **Scope 1 - Assert Unsupported-Holding Risk Mapping:** preserve the diagnosed
  wrong-origin RED, add one exact direct carrier, remap only
  `F008-RISK-INPUT-001`, prove shipped GREEN and mutation `ERR_ASSERTION` RED,
  then run the strict registry and proportionate regressions.

### New Types And Signatures

- No product type, API, schema, configuration, or persistence change.
- One new persistent functional `test()` title.
- One registry `title` value changes.

### Validation Checkpoints

1. Preserve the current single-finding strict-registry RED.
2. Prove the focused title GREEN on shipped source.
3. Prove the same title RED through `ERR_ASSERTION` under the exact mutation.
4. Prove the full registry is 3/3 GREEN with all 18 mutations causal.
5. Run the full risk carrier, all five BUG-008 carriers, the risk browser
  carrier, canonical selftest, adversarial guard, fixed canonical G028
  scanner, and packet gates.

| Scope | Outcome | Planned test paths | Status |
| --- | --- | --- | --- |
| 1 | Give `F008-RISK-INPUT-001` one direct assertion-origin carrier | `tests/portfolio-risk.functional.mjs` and one title remap in `tests/portfolio-test-integrity.unit.mjs` | Not Started |

## Scope 1 - Assert Unsupported-Holding Risk Mapping

**Scope ID:** `01-restore-risk-mutation-assertion-origin`
**Status:** Not Started
**Depends On:** None
**Scope-Kind:** contract-only
**Finding:** `F008-RISK-INPUT-001`
**Execution dependency:** `bubbles.test` -> quality phases ->
`bubbles.validate`

### Implementation Files

| Path | Planned role |
| --- | --- |
| `tests/portfolio-risk.functional.mjs` | Add one focused direct `assetTreatment()` title with complete shipped assertions. |
| `tests/portfolio-test-integrity.unit.mjs` | Change only the selected title for `F008-RISK-INPUT-001`. |

`rlportfolioanalytics.js#assetTreatment` is the inspected production owner. It
is not an implementation file for this scope.

### Change Boundary

Only these delivery hunks may change:

- `tests/portfolio-risk.functional.mjs`: add the one exact focused title.
- `tests/portfolio-test-integrity.unit.mjs`: change only the `title` scalar in
  the `F008-RISK-INPUT-001` entry.
- BUG-009 execution evidence and execution-only state fields.

Product source, the injector, the mutation `find` and `replace` strings,
`module`, `carrier`, `finding`, `scope`, `intendedHook`, the other 17 entries,
BUG-007, BUG-008, parent Feature 008, and concurrent dirty paths remain
unchanged and unstaged.

### Shared Infrastructure Impact Sweep

The full strict registry must retain all 18 entries, one application through
each declared hook, one selected test per entry, and one assertion-origin mutant
failure per entry. A changed-path check must prove the test-only boundary.

### Consumer Impact Sweep

| Consumer | Required outcome |
| --- | --- |
| Focused risk carrier | Direct shipped GREEN and mutation `ERR_ASSERTION` RED. |
| Full risk carrier | All titles remain green. |
| BUG-008 functional carriers | `portfolio-privacy`, `portfolio-paths`, `portfolio-diversification`, `portfolio-allocation`, and `portfolio-dossier` remain green. |
| Risk browser carrier | Existing Risk X-Ray behavior remains green. |
| Strict registry | Three outer tests and all 18 mutation cases remain green. |

### Gherkin Scenarios

```gherkin
Scenario: SCN-B009-001 risk mapping keeps unsupported holdings as named exclusions
  Given assetTreatment receives listed holding AAA with id listed, weight 0.6, and complete declared look-through
  And assetTreatment receives unsupported holding UNKNOWN with id unsupported, weight 0.4, and asset type unresolved
  When the exact focused title calls exported RLPA.assetTreatment on shipped source
  Then the returned state is ok and marketBased is exactly AAA
  And excludedFromMarketAnalytics is exactly UNKNOWN with assetType unresolved
  And lookThrough is partial with covered id listed and missing id unsupported
  And covered weight is 0.6 and uncovered weight is 0.4
  When the exact F008-RISK-INPUT-001 early-return mutation is applied once
  Then the exact focused title executes once and fails once through ERR_ASSERTION
  And it does not fail through TypeError or ERR_TEST_FAILURE
```

### UI Scenario Matrix

No user-visible behavior changes. Direct scenario proof is proportionate
functional proof over the exported production function. The existing
`tests/portfolio-survival-risk.spec.mjs` browser carrier remains a broader
regression check; it is not offered as proof of the direct assertion-origin
contract.

### Implementation Plan

1. Retain the current-session RED showing that the broad `SCN-008-047` title
  fails at `lookThrough.state` with `TypeError` / `ERR_TEST_FAILURE` under the
  exact mutation, so the wrong failure origin is explicit.
2. Add the exact focused title
  `BUG-009 risk mapping: unsupported holdings remain named exclusions`.
3. Call real exported `RLPA.assetTreatment()` directly with one listed and one unsupported
   holding.
4. Assert exact state, `marketBased`, `excludedFromMarketAnalytics`, partial
  look-through, covered and missing ids, and covered and uncovered weights.
5. Run the focused title on shipped source and record GREEN.
6. Run the same title under the unchanged mutation and record one
   `ERR_ASSERTION` RED with no runtime-rubble substitute.
7. Remap only the `title` field for `F008-RISK-INPUT-001`.
8. Run the full strict registry, full risk carrier, all five BUG-008 carriers,
  risk browser carrier, selftest, adversarial guard, fixed canonical G028
  scanner, and every named packet gate.
9. Prove changed-path containment before validate-owned certification.

### Command Catalog

- `CMD-B009-PREFIX-RED`: `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 strict-registry before repair" -- node --test --test-name-pattern='^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$' tests/portfolio-test-integrity.unit.mjs`
- `CMD-B009-BROAD-MUTANT-RED`: the exact injector command recorded at [report.md#selected-title-mutant-origin](report.md#selected-title-mutant-origin).
- `CMD-B009-FOCUSED-GREEN`: `timeout 240 node --test --test-name-pattern='^BUG-009 risk mapping: unsupported holdings remain named exclusions$' tests/portfolio-risk.functional.mjs`
- `CMD-B009-MUTATION-RED`: the same focused command with the unchanged `F008-RISK-INPUT-001` injector environment recorded in `test-plan.json`.
- `CMD-B009-FULL-REGISTRY`: `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs`
- `CMD-B009-FULL-RISK`: `timeout 240 node --test tests/portfolio-risk.functional.mjs`
- `CMD-B009-BUG008-CARRIERS`: `timeout 600 node --test tests/portfolio-privacy.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-dossier.functional.mjs`
- `CMD-B009-RISK-E2E`: `timeout 1800 npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
- `CMD-B009-SELFTEST`: `timeout 1800 node scripts/selftest.mjs`
- `CMD-B009-REGRESSION-QUALITY`: `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-test-integrity.unit.mjs tests/portfolio-risk.functional.mjs`
- `CMD-B009-G028`: verify `/home/philipk/bubbles` contains commit `db7b4f2`, then run `/home/philipk/bubbles/bubbles/scripts/implementation-reality-scan.sh` against this packet.
- `CMD-B009-PACKET`: artifact lint, traceability, scenario-obligation lint,
  test-mechanism lint, scope-context-fit lint, and capability-foundation guard
  against this packet.

### Test Plan

| Plan ID | Test Type | Category | File / exact title | Command | Live system | Required result |
| --- | --- | --- | --- | --- | --- | --- |
| `TP-B009-000` | Scenario-first wrong-origin RED | `unit` | Strict registry plus broad `SCN-008-047` mutant title | `CMD-B009-PREFIX-RED`, `CMD-B009-BROAD-MUTANT-RED` | No | Registry names only `F008-RISK-INPUT-001`; broad title fails through `TypeError` / `ERR_TEST_FAILURE`, not assertion. |
| `TP-B009-001` | Focused shipped carrier | `functional` | `tests/portfolio-risk.functional.mjs` - `BUG-009 risk mapping: unsupported holdings remain named exclusions` | `CMD-B009-FOCUSED-GREEN` | No | Exact title executes once and passes once with complete direct assertions. |
| `TP-B009-002` | Focused mutation negative control | `functional` | Same exact BUG-009 title under `F008-RISK-INPUT-001` | `CMD-B009-MUTATION-RED` | No | Exact title executes once and fails once with `ERR_ASSERTION`; no `TypeError`, `ERR_TEST_FAILURE`, or infrastructure error. |
| `TP-B009-003` | Full strict mutation registry | `unit` | `tests/portfolio-test-integrity.unit.mjs` | `CMD-B009-FULL-REGISTRY` | No | Three outer tests pass; all 18 cases apply once and fail through the selected assertion. |
| `TP-B009-004` | Full risk carrier | `functional` | `tests/portfolio-risk.functional.mjs` | `CMD-B009-FULL-RISK` | No | Complete file green. |
| `TP-B009-005` | BUG-008 carrier regression | `functional` | Five exact BUG-008 functional carrier files | `CMD-B009-BUG008-CARRIERS` | No | All five files green. |
| `TP-B009-006` | Proportionate browser regression | `e2e-ui` | `tests/portfolio-survival-risk.spec.mjs` | `CMD-B009-RISK-E2E` | Yes | Existing Risk X-Ray browser carrier green; not used as direct pure-logic proof. |
| `TP-B009-008` | Canonical repository selftest | `functional` | `scripts/selftest.mjs` | `CMD-B009-SELFTEST` | No | Green without budget or baseline change. |
| `TP-B009-009` | Adversarial regression quality | `functional` | Registry and focused risk carrier | `CMD-B009-REGRESSION-QUALITY` | No | Bugfix guard green. |
| `TP-B009-010` | Fixed canonical G028 scan | `functional` | Canonical Bubbles scanner at commit `db7b4f2` or descendant | `CMD-B009-G028` | No | Canonical scanner green against this packet. |
| `TP-B009-011` | Packet planning gates | `functional` | BUG-009 planning artifacts | `CMD-B009-PACKET` | No | All six named planning gates green. |

### Test Plan To DoD Parity

| Test Plan row | Primary DoD item |
| --- | --- |
| `TP-B009-000` | Persistent pre-fix strict-registry RED is recorded |
| `TP-B009-001` | Focused direct carrier passes on shipped source |
| `TP-B009-002` | Focused direct carrier fails through `ERR_ASSERTION` under mutation |
| `TP-B009-003` | Full strict registry is 3/3 GREEN with all 18 cases causal |
| `TP-B009-004` | Full risk carrier passes |
| `TP-B009-005` | All five BUG-008 carriers pass |
| `TP-B009-006` | Proportionate risk browser regression passes |
| `TP-B009-008` | Canonical selftest passes |
| `TP-B009-009` | Regression-quality guard passes |
| `TP-B009-010` | Fixed canonical G028 scanner passes |
| `TP-B009-011` | Packet gates pass |

### Definition of Done - Tiered Validation

#### Core Items

- [ ] `SCN-B009-001` proves the exact focused title calls real exported
  `RLPA.assetTreatment()`, returns `ok`, reports exact `marketBased` and
  `excludedFromMarketAnalytics` values, and reports exact partial look-through;
  the unchanged mutation makes that title execute once and fail once through
  `ERR_ASSERTION` without `TypeError` or `ERR_TEST_FAILURE`.
- [ ] Root cause remains the broad mutation-to-title mapping documented in
  [design.md](design.md), with current-session RED evidence retained in
  [report.md](report.md).
- [ ] The exact persistent title `BUG-009 risk mapping: unsupported holdings
  remain named exclusions` is implemented with exact state, market inclusion,
  named exclusion, and look-through assertions.
- [ ] Only the `F008-RISK-INPUT-001` title mapping changes; its anchor,
  replacement, carrier, intended hook, and all other mappings remain unchanged.
- [ ] Delivery changes remain inside the declared test-only Change Boundary.
- [ ] `TP-B009-000` persistent wrong-origin RED records the sole strict-registry
  finding and the broad title's `TypeError` / `ERR_TEST_FAILURE` origin.
  Evidence: `report.md#tp-b009-000`.
- [ ] `TP-B009-001` focused shipped-source GREEN passes exactly once.
  Evidence: `report.md#tp-b009-001`.
- [ ] `TP-B009-002` focused mutation RED fails exactly once through
  `ERR_ASSERTION`, with no `TypeError` or `ERR_TEST_FAILURE` substitute.
  Evidence: `report.md#tp-b009-002`.
- [ ] `TP-B009-003` full strict registry passes 3/3 and all 18 mutation cases
  remain causal. Evidence: `report.md#tp-b009-003`.
- [ ] `TP-B009-004` full risk carrier passes. Evidence:
  `report.md#tp-b009-004`.
- [ ] `TP-B009-005` all five BUG-008 functional carriers pass. Evidence:
  `report.md#tp-b009-005`.
- [ ] `TP-B009-006` proportionate risk browser regression passes without being
  substituted for the direct pure-logic proof. Evidence:
  `report.md#tp-b009-006`.
- [ ] `TP-B009-008` canonical selftest passes. Evidence:
  `report.md#tp-b009-008`.
- [ ] `TP-B009-009` regression-quality guard passes. Evidence:
  `report.md#tp-b009-009`.
- [ ] `TP-B009-010` canonical G028 scanner from the Bubbles checkout containing
  commit `db7b4f2` passes. Evidence: `report.md#tp-b009-010`.
- [ ] `TP-B009-011` artifact lint, traceability, scenario-obligation lint,
  test-mechanism lint, scope-context-fit lint, and capability-foundation guard
  pass. Evidence: `report.md#tp-b009-011`.
- [ ] Human acceptance remains unclaimed and human-owned in
  [uservalidation.md](uservalidation.md).

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero skipped required tests, zero
  infrastructure-error substitutes, zero source changes, zero anchor changes,
  zero unrelated staged paths, exact changed-path containment, current packet
  documentation, fixed canonical G028 scan, artifact lint, traceability, and
  validate-owned transition checks green.

### Uncertainty Declaration For Unchecked Items

**Attempted:** Reconciled one executable test-only scope and its structured
handoffs. **Observed:** No test or source file was changed by planning, so no
delivery checkbox has execution evidence. **Resolution:** `bubbles.test` must
implement the two permitted test hunks, execute every named command, and append
current-session evidence before changing any checkbox.

All items remain unchecked. This plan claims no implementation, test delivery,
human acceptance, or certification.