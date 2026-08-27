# BUG-009 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.audit` via `BUG-009-ROUTE-023`

[Spec](spec.md) | [Design](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

Planning changes no source or persistent test. The test-owned report records
the two permitted test hunks and their execution evidence. Implementation,
test, regression, simplify, gaps, setup, harden, stabilize, devops, security,
and validate have executed. The revision-315 harden pass recorded `HARDENED`,
and `bubbles.validate` independently re-derived every BUG-009 verification on
the current tree and withheld certification because non-validate-owned residue
remained. This plan pass consumes `BUG-009-ROUTE-022`: it enumerates the
change boundary, repairs the internal route schema, records the G040
adjudication through the sanctioned skip markers, and applies the DoD ticks
that validate's per-item verdict supports. `BUG-009-ROUTE-023` routes the
packet to `bubbles.audit`, the one required `delivery-completion-v1` phase
that has not executed. Scope 1 stays In Progress, human acceptance stays
unclaimed, status and certification stay `in_progress`.

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
| 1 | Give `F008-RISK-INPUT-001` one direct assertion-origin carrier | `tests/portfolio-risk.functional.mjs` and one title remap in `tests/portfolio-test-integrity.unit.mjs` | In Progress |

## Scope 1 - Assert Unsupported-Holding Risk Mapping

**Scope ID:** `01-restore-risk-mutation-assertion-origin`
**Status:** In Progress
**Depends On:** None
**Scope-Kind:** contract-only
**Finding:** `F008-RISK-INPUT-001`
**Execution routing:** `BUG-009-ROUTE-022` is consumed by this plan pass, which
enumerates the change boundary, repairs the internal same-repo route schema,
records the G040 adjudication, and applies the evidence-backed DoD ticks.
`BUG-009-ROUTE-023` routes the packet to `bubbles.audit`. Transition and final
human acceptance remain unclaimed.

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

**Allowed file families** (the complete delivery surface; implementation commit
`4824edc81` changed exactly these two paths, `+29/-0` and `+1/-1`):

| Allowed path | Permitted change |
| --- | --- |
| `tests/portfolio-risk.functional.mjs` | Add the one exact focused `test()` title with its complete direct assertions. |
| `tests/portfolio-test-integrity.unit.mjs` | Change only the `title` scalar of the `F008-RISK-INPUT-001` registry entry. |

BUG-009 packet artifacts under
`specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/`
carry execution evidence and execution-only state. They are packet bookkeeping,
not delivery, and are outside the two-path delivery surface above.

**Excluded surfaces** (must remain byte-identical; a change to any of these is a
boundary violation, and collateral cleanup inside them is not authorized):

| Excluded surface | Reason |
| --- | --- |
| `rlportfolioanalytics.js` and all other product source | The scope is contract-only; the production owner is inspected, never edited. |
| `tests/portfolio-defect-injector.cjs` | The mutation mechanism must stay unchanged so the assertion-origin proof stays causal. |
| The `find`, `replace`, `module`, `carrier`, `finding`, `scope`, and `intendedHook` fields of `F008-RISK-INPUT-001` | Only the `title` scalar is remapped. |
| The other 17 strict-registry entries | The registry must retain all 18 entries unchanged apart from the one title. |
| All parent Feature 008 artifacts, including its `state.json`, `test-plan.json`, and every `scopes/*/` directory | Parent-owned; a concurrent transaction holds them. |
| BUG-007 and BUG-008 packet artifacts | Foreign packets. |
| Every path in the concurrent unrelated working-tree transaction | Foreign work; never staged, reset, stashed, or reverted. |
| `.github/bubbles/**` | Framework-managed; changes only through the sanctioned installer. |

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
- `CMD-B009-G028`: prerequisite: propagate canonical Bubbles fix `db7b4f2`
  through the installer before final downstream execution; then run
  `timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin --verbose`.
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
| `TP-B009-010` | Fixed canonical G028 scan | `functional` | Installed downstream scanner after installer propagation of `db7b4f2` | `CMD-B009-G028` | No | Installed downstream scanner green against this packet. |
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

- [x] `SCN-B009-001` proves the exact focused title calls real exported
  `RLPA.assetTreatment()`, returns `ok`, reports exact `marketBased` and
  `excludedFromMarketAnalytics` values, and reports exact partial look-through;
  the unchanged mutation makes that title execute once and fail once through
  `ERR_ASSERTION` without `TypeError` or `ERR_TEST_FAILURE`.
  Evidence: [report.md#validate-tp-b009-001](report.md#validate-tp-b009-001) and
  [report.md#validate-tp-b009-002](report.md#validate-tp-b009-002).
- [x] Root cause remains the broad mutation-to-title mapping documented in
  [design.md](design.md), with current-session RED evidence retained in
  [report.md](report.md).
  Evidence: [report.md#validate-tp-b009-002](report.md#validate-tp-b009-002) —
  the registry entry `F008-RISK-INPUT-001` now names the focused title and the
  mutant fails at `tests/portfolio-risk.functional.mjs:60`.
- [x] The exact persistent title `BUG-009 risk mapping: unsupported holdings
  remain named exclusions` is implemented with exact state, market inclusion,
  named exclusion, and look-through assertions.
  Evidence: [report.md#validate-tp-b009-001](report.md#validate-tp-b009-001).
- [x] Only the `F008-RISK-INPUT-001` title mapping changes; its anchor,
  replacement, carrier, intended hook, and all other mappings remain unchanged.
  Evidence: [report.md#code-diff-evidence](report.md#code-diff-evidence) —
  `4824edc81` is `+1/-1` in `tests/portfolio-test-integrity.unit.mjs`.
- [x] Delivery changes remain inside the declared test-only Change Boundary.
  Evidence: [report.md#plan-route-022-reconciliation](report.md#plan-route-022-reconciliation).
- [x] `TP-B009-000` persistent wrong-origin RED records the sole strict-registry
  finding and the broad title's `TypeError` / `ERR_TEST_FAILURE` origin.
  Evidence: [report.md#current-session-strict-registry-red](report.md#current-session-strict-registry-red)
  records the sole finding — `F008-RISK-INPUT-001 ... mutant failure did not
  originate from the selected protective assertion` is the only entry in the
  not-load-bearing list — and
  [report.md#selected-title-mutant-origin](report.md#selected-title-mutant-origin)
  records the broad title's origin. The item asserts what the record *contains*,
  and both halves were verified against it this session.
  The broad-mutant half is re-executable: `CMD-B009-BROAD-MUTANT-RED` was re-run
  and reproduced the documented origin exactly — exit 1,
  `code: 'ERR_TEST_FAILURE'`, `failureType: 'testCodeFailure'`,
  `name: 'TypeError'`,
  `error: "Cannot read properties of undefined (reading 'state')"`, `# pass 0`,
  `# fail 1`. The recorded location `tests/portfolio-risk.functional.mjs:43:1`
  (stack `:94:54`) reads `:72:1` (stack `:123:54`) on re-run; the delta is
  exactly +29 lines, matching the `+29/-0` that `4824edc81` added to that file,
  so the origin is identical and only the offsets moved.
  The strict-registry half is legitimately historical: that finding *was* the
  defect, and `TP-B009-003` now passes the registry 3/3, so it is retained as a
  record and correctly not restated as current-session evidence.
- [x] `TP-B009-001` focused shipped-source GREEN passes exactly once.
  Evidence: [report.md#validate-tp-b009-001](report.md#validate-tp-b009-001).
- [x] `TP-B009-002` focused mutation RED fails exactly once through
  `ERR_ASSERTION`, with no `TypeError` or `ERR_TEST_FAILURE` substitute.
  Evidence: [report.md#validate-tp-b009-002](report.md#validate-tp-b009-002).
- [x] `TP-B009-003` full strict registry passes 3/3 and all 18 mutation cases
  remain causal. Evidence:
  [report.md#validate-tp-b009-003](report.md#validate-tp-b009-003).
- [x] `TP-B009-004` full risk carrier passes. Evidence:
  [report.md#validate-tp-b009-004](report.md#validate-tp-b009-004).
- [x] `TP-B009-005` all five BUG-008 functional carriers pass. Evidence:
  [report.md#validate-tp-b009-005](report.md#validate-tp-b009-005).
- [x] `TP-B009-006` proportionate risk browser regression passes without being
  substituted for the direct pure-logic proof. Evidence:
  [report.md#validate-tp-b009-006](report.md#validate-tp-b009-006).
- [x] `TP-B009-008` canonical selftest passes. Evidence:
  [report.md#validate-tp-b009-008](report.md#validate-tp-b009-008) — 3429 passed
  and 0 failed. The recorded total moved from 3426 because a concurrent merge
  changed `scripts/selftest.mjs` among 535 files; no budget or baseline was
  adjusted to absorb it.
- [x] `TP-B009-009` regression-quality guard passes. Evidence:
  [report.md#validate-tp-b009-009](report.md#validate-tp-b009-009).
- [x] `TP-B009-010` installed downstream G028 scanner passes after canonical
  fix `db7b4f2` is propagated through the installer. Evidence:
  [report.md#validate-tp-b009-009](report.md#validate-tp-b009-009).
- [x] `TP-B009-011` artifact lint, traceability, scenario-obligation lint,
  test-mechanism lint, scope-context-fit lint, and capability-foundation guard
  pass. Evidence:
  [report.md#validate-tp-b009-011](report.md#validate-tp-b009-011).
- [x] Human acceptance remains unclaimed and human-owned in
  [uservalidation.md](uservalidation.md). This item asserts the *negative* — that
  the boundary held and no acceptance was manufactured. It does not grant
  acceptance, and checking it does not satisfy Gate G136, which separately and
  correctly still blocks because `uservalidation.md` does not establish
  acceptance. Evidence: the file is byte-identical to the pre-merge tip
  `467e495252b3225f50c0db5cafd909c98ef9fbb7` — blob
  `b5667556a67f0aec71e23b5cf4004d6fe44e73d7` at that tip, at `HEAD`, and in the
  worktree — and carries 0 checked of 6 items. Planning did not modify it.
- [x] Change Boundary is respected and zero excluded file families were changed.
  Evidence: [report.md#plan-route-022-reconciliation](report.md#plan-route-022-reconciliation)
  — `git show --numstat 4824edc81` reports exactly the two allowed paths
  `tests/portfolio-risk.functional.mjs` (`+29/-0`) and
  `tests/portfolio-test-integrity.unit.mjs` (`+1/-1`), and no excluded surface
  from the table above appears in that commit.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero skipped required tests, zero
  infrastructure-error substitutes, zero source changes, zero anchor changes,
  zero unrelated staged paths, exact changed-path containment, current packet
  documentation, fixed canonical G028 scan, artifact lint, traceability, and
  validate-owned transition checks green.
  **Failing clause: `validate-owned transition checks green`.**
  `state-transition-guard.sh` exits 1 with 7 failures, so the item cannot be
  honestly checked. Every other clause was verified green this session:
  `node scripts/selftest.mjs` exits 0 with 3429 passed and 0 failed, covering
  zero skipped required tests and zero infrastructure-error substitutes;
  `4824edc81` touches exactly `tests/portfolio-risk.functional.mjs` (`+29/-0`)
  and `tests/portfolio-test-integrity.unit.mjs` (`+1/-1`), so zero product
  source, zero anchor changes, and exact changed-path containment hold;
  `git diff --cached --name-only` is empty, so zero unrelated staged paths hold;
  and the installed G028 scan, artifact lint, and traceability guard each exit 0,
  covering current packet documentation. The residual guard failures are the
  scope still In Progress, the two `G027` completedScopes and zero-scopes-Done
  blocks, the two missing-`implement`-phase blocks, and `G136` human acceptance.
  None is plan-owned: they resolve only behind human acceptance and the
  owner-gated `B009-PHASE-IMPLEMENT-001` decision, and forcing any of them would
  fabricate the state the gate exists to check.

### Uncertainty Declaration For Unchecked Items

**Attempted:** Consumed `BUG-009-ROUTE-022` by enumerating the change boundary,
repairing the internal same-repo route schema, recording the G040 adjudication
through the sanctioned skip markers, and applying every DoD tick that
validate's recorded per-item verdict supports.

**Observed:** Eighteen of the nineteen items are now checked against commands
executed in a real session. One stays unchecked, for a stated reason:

| Unchecked item | Reason it stays unchecked |
| --- | --- |
| Build Quality Gate | Its final clause requires validate-owned transition checks to be green. `state-transition-guard.sh` exits 1 with 7 failures, so the item cannot be honestly checked. Every other clause verified green this session; the residual failures are the scope status, the two `G027` blocks, the two missing-`implement`-phase blocks, and `G136`, none of which is plan-owned. |

Two items previously carried in this table were re-adjudicated and checked this
session. Each earlier reason is recorded with why it did not hold:

| Re-adjudicated item | Why the earlier reason did not hold |
| --- | --- |
| `TP-B009-000` persistent wrong-origin RED | It was recorded as wholly "not re-executable". That is true of only one half. The broad-mutant half re-executes on demand: `CMD-B009-BROAD-MUTANT-RED` was re-run this session and reproduced the documented `TypeError` / `ERR_TEST_FAILURE` origin exactly, with line offsets shifted by exactly the +29 lines `4824edc81` added to the carrier. Only the strict-registry half is genuinely historical, and the item asserts what the record *contains* rather than that both halves re-run. |
| Human acceptance | It was read as though checking it would claim acceptance. The item asserts the opposite \u2014 that acceptance remains *unclaimed*. Checking it records that the boundary held. `uservalidation.md` is byte-identical to the pre-merge tip with 0 of 6 items checked, planning did not modify it, and Gate G136 still blocks separately and correctly. |

**Resolution:** `bubbles.audit` consumes `BUG-009-ROUTE-023` and runs the one
required `delivery-completion-v1` phase that has not executed. Three findings
sit outside plan ownership and are recorded in `state.json.unresolvedFindings`:
the installed and canonical phase registries both omit the phase names `plan`
and `design`; the G040 exclusion list already exempts four camelCase route
identifiers of the same class but omits the guard's own cross-repo boolean
field, so prose describing the G061 schema trips the scanner on an identifier
rather than on unfinished work; and no `implement` phase record exists for a
packet whose delivery landed under the `test` phase. All three are
framework-surface or orchestrator decisions; this plan pass did not edit
`.github/bubbles/**`.

Scope 1 remains In Progress. Status and certification remain `in_progress`.
Planning claims no audit completion, no transition, no human acceptance, and no
certification.