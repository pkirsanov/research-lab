# BUG-007 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.design`

[Spec](spec.md) | [Design](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

This filing contains no product source or persistent test change. The separate
dirty parent Feature 008 scope and root test-plan transaction is excluded.

## Execution Outline

### Phase Order

1. `bubbles.design` confirms the complete caller-key inventory and the selected
   null-prototype/own-membership boundary.
2. `bubbles.plan` confirms scenario and Test Plan ownership without touching
   the parent Feature 008 transaction.
3. `bubbles.test` adds the persistent functional and browser regressions, then
   records a focused RED result against unchanged source with cleanup proven.
4. `bubbles.implement` changes only the planned map allocations and membership
   reads.
5. `bubbles.test` reruns the unchanged focused carrier, browser carrier,
   broader Feature 008 browser matrix, repository selftest, and mutation
   control.
6. Required quality phases and `bubbles.validate` complete before any terminal
   status or certification change.

### New Types And Signatures

- No new exported type, function, route, schema, or contract version.
- Internal aggregation objects change representation only.
- Caller lookup maps retain their input shape and gain own-membership reads.

### Validation Checkpoints

1. The persistent hostile matrix is observed RED before source changes and
   cleans all shared built-ins after every attempt.
2. After implementation, all six hostile cases return without throw or shared
   mutation and retain their own key identity.
3. The ordinary four-lane fixture and refusal controls remain unchanged.
4. A source mutation restoring ordinary maps turns the hostile matrix red.
5. Browser, repository, and packet gates remain green.

| Scope | Outcome | Planned source and test paths | Status |
| --- | --- | --- | --- |
| 1 | Make all compose-brief caller-keyed aggregation inheritance-free | `rlportfoliobrief.js`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs` | Not Started |

## Scope 1 - Harden Caller-Keyed Brief Aggregation

**Scope ID:** `01-harden-caller-keyed-brief-aggregation`
**Status:** Not Started
**Depends On:** -
**Execution dependency:** `bubbles.test` (RED) -> `bubbles.implement` ->
`bubbles.test` (GREEN and regression) -> quality phases -> `bubbles.validate`.

### Implementation Files

- `rlportfoliobrief.js`
- `tests/portfolio-brief.functional.mjs`
- `tests/portfolio-survival-brief.spec.mjs`

### Change Boundary

Allowed implementation changes:

- `rlportfoliobrief.js`: replace only the affected caller-keyed ordinary map
  allocations, the nested date-set allocation, and inherited reads of
  `owners` and `priorEvidenceIds`.
- `tests/portfolio-brief.functional.mjs`: add the focused normal, hostile-key,
  cleanup, own-membership, and source-mutation regressions.
- `tests/portfolio-survival-brief.spec.mjs`: add the real-browser exported
  module matrix and normal route non-movement assertions.
- this packet for phase-owned evidence and lifecycle fields.

Excluded surfaces:

- Parent Feature 008 scope files and root `test-plan.json`.
- Sibling bugs, policy JSON, storage, data, navigation, registry, and route
  contracts.
- Key blacklists, input coercion, fallback output, and catch-and-continue.
- Unrelated maps or fixed-vocabulary lookups.

A required change outside this boundary must be routed before implementation.

### Consumer Impact Sweep

| Consumer | Required outcome |
| --- | --- |
| Direct `composeBrief()` callers | Dangerous subject/domain strings become ordinary own keys; no API shape change |
| Allocation lab brief route | Normal four-lane output and visible ordering remain unchanged |
| `owners` input | Own entries remain readable; inherited entries remain absent |
| `priorEvidenceIds` input | Own arrays remain readable; inherited values remain absent and never receive `.slice()` |
| Existing policy and local-error callers | Error code, reason, field, and precedence remain unchanged |
| Stored workspaces and behavior events | No migration, rewrite, or accepted-value change |

### Gherkin Scenarios

```gherkin
Scenario: SCN-B007-NORMAL-COMPATIBILITY
  Given the committed four-lane brief fixture and existing invalid-input controls
  When composeBrief evaluates the ordinary fixture after the map hardening
  Then it returns ok true
  And lane order remains held, watchlist, completedResearch, inferredRelevance
  And subject order remains MSFT, BND, ZZTOP, semiconductors
  And existing local and shared-policy refusal envelopes retain their precedence

Scenario: SCN-B007-SUBJECT-KEY-SAFETY
  Given a completion subject is __proto__, constructor, or toString
  And every shared built-in target is snapshotted before the call
  When exported composeBrief evaluates the complete subject matrix
  Then every call returns through the declared result contract without throwing
  And each subject is treated as an own key with its actual evidence and no-action state
  And absent owners and priorEvidenceIds entries remain absent
  And no shared built-in changes
  And cleanup leaves no process-global probe property

Scenario: SCN-B007-DOMAIN-KEY-SAFETY
  Given a completion domain is __proto__, constructor, or toString
  And completions span the existing count and distinct-date floor
  And every shared built-in target is snapshotted before the call
  When exported composeBrief evaluates the complete domain matrix
  Then every call returns through the declared result contract without throwing
  And each domain is treated as an own inferred-domain key using its actual support
  And no shared built-in changes
  And cleanup leaves no process-global probe property
```

### Scenario Obligation Matrix

| Scenario | Behavior traits | Required proof and rows | Implementation owners | Test mechanism and negative control |
| --- | --- | --- | --- | --- |
| `SCN-B007-NORMAL-COMPATIBILITY` | `pure-calculation` | `TP-B007-001` proves exact normal order and refusal non-movement; `TP-B007-006` proves the real route remains usable. | `rlportfoliobrief.js#composeBrief` | `public-function` + `recorded-fixture` + `returned-value`; an in-memory `LANE_ORDER` source mutation must fail the exact order assertion (`mutation`, high risk). |
| `SCN-B007-SUBJECT-KEY-SAFETY` | `pure-calculation`, `degraded-state` | `TP-B007-000` records RED; `TP-B007-002` proves all subject keys; `TP-B007-004` proves load-bearing map safety; `TP-B007-005` repeats the contract in-browser. | `rlportfoliobrief.js#distinctCount`, `rlportfoliobrief.js#composeBrief` | `public-function` + `synthetic-fixture` + `returned-value`; reverting safe maps to `{}` must restore throw or mutation (`mutation`, high risk). |
| `SCN-B007-DOMAIN-KEY-SAFETY` | `pure-calculation`, `degraded-state` | `TP-B007-000` records RED; `TP-B007-003` proves all domain keys and floors; `TP-B007-004` proves load-bearing map safety; `TP-B007-005` repeats the contract in-browser. | `rlportfoliobrief.js#composeBrief` | `public-function` + `synthetic-fixture` + `returned-value`; reverting safe maps to `{}` must restore throw or mutation (`mutation`, high risk). |

### Implementation Plan

1. Add the focused persistent tests before source changes.
2. Execute the focused carrier and record a non-zero RED result with cleanup
   proven for every hostile call.
3. Change all ten internal caller-keyed maps and nested date set to
   `Object.create(null)`.
4. Resolve `owners` and `priorEvidenceIds` only through own membership.
5. Keep every key value, count, floor, lane, sort, output field, and refusal
   expression otherwise unchanged.
6. Execute the unchanged focused test matrix and source mutation control.
7. Execute the real-browser scenario-specific regression and the broader
   Feature 008 browser matrix.
8. Execute the canonical repository selftest and packet guards.

### Browser Coverage Decision

The primary defect is in an exported UMD module used by the allocation page.
The functional carrier provides the most direct RED/GREEN proof. The browser
carrier invokes that same exported function in the real page runtime and is
therefore direct environment-parity coverage rather than a mocked proxy.

### Test Plan

| Plan ID | Test Type | Category | Live system | Persistent file | Required behavior | Command | State |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `TP-B007-000` | Pre-fix RED regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | The newly authored subject/domain matrix fails against unchanged source while cleanup succeeds. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-001` | Normal and refusal compatibility | `functional` | No | `tests/portfolio-brief.functional.mjs` | Normal lane/subject order and representative local/shared refusals do not move. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-002` | Subject-key adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | `__proto__`, `constructor`, and `toString` as subjects are own keys, do not throw, and do not mutate shared built-ins. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-003` | Domain-key adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | `__proto__`, `constructor`, and `toString` as domains use actual support floors, do not throw, and do not mutate shared built-ins. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-004` | Mutation and cleanup regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | Cleanup runs even on RED; restoring ordinary maps makes the exact hostile matrix fail; mutating `LANE_ORDER` makes the exact normal-order assertion fail. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-005` | Scenario-specific Regression E2E | `e2e-ui` | Yes | `tests/portfolio-survival-brief.spec.mjs` | The real page runtime's exported composer passes the normal and hostile matrices with no shared mutation or throw. | `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Existing carrier; scenario not authored or run |
| `TP-B007-006` | Broader Regression E2E | `e2e-ui` | Yes | Feature 008 Playwright carriers | All existing Feature 008 user workflows remain green. | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Existing carriers; re-execution required after implementation |
| `TP-B007-007` | Repository regression | `functional` | No | `scripts/selftest.mjs` | Canonical registered invariants remain green. | `timeout 1800 node scripts/selftest.mjs` | Existing check; re-execution required after implementation |
| `TP-B007-008` | Packet guard battery | `artifact` | No | BUG-007 packet | Artifact shape, traceability, scenario obligations, test mechanism, and scope context are coherent. | See `test-plan.json` `CMD-B007-PACKET-GUARDS`. | Required for filing commit |
| `TP-B007-009` | Transition guard | `guard` | No | BUG-007 packet | Completion contract passes only after implementation, tests, acceptance, and validate-owned certification are complete. | `timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys` | Planned for final validation only |

### Test Plan To DoD Parity

| Test Plan row | Primary DoD item |
| --- | --- |
| `TP-B007-000` | Pre-fix persistent RED and cleanup are observed before implementation |
| `TP-B007-001` | `SCN-B007-NORMAL-COMPATIBILITY` holds |
| `TP-B007-002` | `SCN-B007-SUBJECT-KEY-SAFETY` holds |
| `TP-B007-003` | `SCN-B007-DOMAIN-KEY-SAFETY` holds |
| `TP-B007-004` | Source mutation and cleanup controls are load-bearing |
| `TP-B007-005` | Scenario-specific E2E regression passes |
| `TP-B007-006` | Broader E2E regression suite passes |
| `TP-B007-007` | Canonical repository selftest passes |
| `TP-B007-008` | Packet guard battery passes |
| `TP-B007-009` | Transition guard passes before certification |

### Definition of Done

#### Core Items

- [ ] Root cause and the complete caller-keyed map inventory are confirmed.
- [ ] The change remains inside the declared Change Boundary and the Consumer
  Impact Sweep remains accurate.
- [ ] `TP-B007-000` records the persistent pre-fix RED result before source
  implementation and proves cleanup after every hostile attempt. Evidence:
  `report.md#tp-b007-000`.
- [ ] `SCN-B007-NORMAL-COMPATIBILITY` holds through `TP-B007-001`: normal lane
  and subject order plus representative refusal precedence remain unchanged.
  Evidence: `report.md#tp-b007-001`.
- [ ] `SCN-B007-SUBJECT-KEY-SAFETY` holds through `TP-B007-002`: all three
  subject keys are own data, return without throw, preserve absent lookup-map
  semantics, and mutate no shared built-in. Evidence: `report.md#tp-b007-002`.
- [ ] `SCN-B007-DOMAIN-KEY-SAFETY` holds through `TP-B007-003`: all three
  domain keys use their actual support floors, return without throw, and mutate
  no shared built-in. Evidence: `report.md#tp-b007-003`.
- [ ] `TP-B007-004` proves cleanup is unconditional and restoring ordinary maps
  makes the hostile matrix fail. Evidence: `report.md#tp-b007-004`.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  pass through `TP-B007-005`. Evidence: `report.md#tp-b007-005`.
- [ ] Broader E2E regression suite passes through `TP-B007-006`. Evidence:
  `report.md#tp-b007-006`.
- [ ] `TP-B007-007` canonical repository selftest passes. Evidence:
  `report.md#tp-b007-007`.
- [ ] `TP-B007-008` packet guard battery passes. Evidence:
  `report.md#tp-b007-008`.
- [ ] `TP-B007-009` transition guard passes only after all delivery,
  acceptance, and certification prerequisites are satisfied. Evidence:
  `report.md#tp-b007-009`.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero warnings, zero unresolved findings,
  exact changed-path containment, current documentation, and no skipped
  required test.

All items remain unchecked. This packet records reproduction and planned work,
not implementation or certification.
