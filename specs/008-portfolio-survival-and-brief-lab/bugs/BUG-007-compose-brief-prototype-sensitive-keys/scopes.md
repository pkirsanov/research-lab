# BUG-007 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.test`

[Spec](spec.md) | [Design](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

This filing contains no product source or persistent test change. The separate
dirty parent Feature 008 scope and root test-plan transaction is excluded.

## Execution Outline

### Phase Order

1. **Scope 1 - Harden Caller-Keyed Brief Aggregation:** repair and prove the
  shared mutation mechanism, then author the persistent functional, browser,
  and test-integrity regressions; observe all six direct exported hostile cases
  RED against unchanged source; harden only `rlportfoliobrief.js`; then rerun
  the unchanged focused, visible-browser, mutation, broader-regression,
  selftest, and guard checks before validation.

### New Types And Signatures

- No new exported type, function, route, schema, or contract version.
- Internal aggregation objects change representation only.
- Caller lookup maps retain their input shape and gain own-membership reads.

### Validation Checkpoints

1. The persistent functional carrier is authored before implementation and all
  six direct exported `composeBrief()` cases are observed RED against
  unchanged source while `finally` cleanup restores shared built-ins.
2. The shared in-memory defect injector assigns one intended hook to each
  carrier: `Module._compile` for `require(target)` execution and
  `fs.readFileSync` for direct text evaluation. Each represented mutant applies
  once, records one marker application, executes one selected protective test,
  and fails at that test's protective assertion rather than in injector or
  preload setup. A double-application negative control must be rejected, while
  a separate `fs.readFileSync` control preserves text-evaluation carriers.
3. After implementation, all six direct exported cases return without throw or
  shared mutation, and normal lane and subject ordering remains exact.
4. The real browser runtime repeats the six-case exported matrix and records
  the contract-accepted `constructor` subject through the visible completion
  controls without widening the recorder vocabulary.
5. Broader Feature 008 browser regression, repository selftest, packet guards,
  implementation-reality scan, human acceptance, and validate-owned
  certification remain explicit gates before completion.

| Scope | Outcome | Planned source and test paths | Status |
| --- | --- | --- | --- |
| 1 | Make all compose-brief caller-keyed aggregation inheritance-free | `rlportfoliobrief.js`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs`, `tests/portfolio-test-integrity.unit.mjs`, `tests/portfolio-defect-injector.cjs` | Not Started |

## Scope 1 - Harden Caller-Keyed Brief Aggregation

**Scope ID:** `01-harden-caller-keyed-brief-aggregation`
**Status:** Not Started
**Depends On:** -
**Execution dependency:** `bubbles.test` (RED) -> `bubbles.implement` ->
`bubbles.test` (GREEN and regression) -> quality phases -> `bubbles.validate`.
**Reconciled finding:** `HARDEN-B007-001`

### Implementation Files

| Path | Planned role |
| --- | --- |
| `rlportfoliobrief.js` | Only product source allowed to change: harden `distinctCount()` and `composeBrief()` caller-keyed allocations and membership reads. |
| `tests/portfolio-brief.functional.mjs` | Persistent scenario-first RED/GREEN carrier for normal controls, all six direct exported hostile cases, lookup-map ownership, no throw, built-in integrity, and cleanup. |
| `tests/portfolio-survival-brief.spec.mjs` | Persistent real-browser carrier for the six direct exported cases plus the production-visible `constructor` completion path. |
| `tests/portfolio-test-integrity.unit.mjs` | Persistent adversarial mutation carrier proving one intended hook applies each mutant once, one selected protective test executes, and its protective assertion causes the expected failure; also owns double-application and direct-text-read controls. |
| `tests/portfolio-defect-injector.cjs` | Shared in-memory mutation mechanism: separate require-time and direct-text-read representation so one source load cannot apply the same mutant twice, and record exact application count without writing tracked source. |

### Change Boundary

Allowed implementation changes:

- `rlportfoliobrief.js`: replace only the affected caller-keyed ordinary map
  allocations, the nested date-set allocation, and inherited reads of
  `owners` and `priorEvidenceIds`.
- `tests/portfolio-brief.functional.mjs`: add the focused normal, hostile-key,
  cleanup, own-membership, and no-throw regressions.
- `tests/portfolio-survival-brief.spec.mjs`: add the real-browser exported
  module matrix, the visible `constructor` recorder workflow, and normal route
  non-movement assertions.
- `tests/portfolio-test-integrity.unit.mjs`: add exact one-anchor in-memory
  mutations for a representative map protection, caller-map own-membership,
  and normal lane ordering; assert intended hook, one marker application, one
  selected protective test, protective-assertion failure origin, deliberate
  double-application rejection, and direct-text-read carrier preservation.
- `tests/portfolio-defect-injector.cjs`: change only representation dispatch
  and marker accounting needed to make `Module._compile` the single owner for
  `require(target)` and `fs.readFileSync` the single owner for direct text
  evaluation. Preserve all registered mutation substitutions and the no-write
  contract.
- this packet for phase-owned evidence and lifecycle fields.

Excluded surfaces:

- Parent Feature 008 scope files and root `test-plan.json`.
- Sibling bugs, policy JSON, storage, data, navigation, registry, and route
  contracts.
- Other shared test harnesses, preload modules, and mutation registries.
- Key blacklists, input coercion, fallback output, and catch-and-continue.
- Unrelated maps or fixed-vocabulary lookups.

A required change outside this boundary must be routed before implementation.

### Shared Infrastructure Impact Sweep

`tests/portfolio-defect-injector.cjs` is a protected shared test mechanism.
The repair must remain surgical and independently canaried before the broader
mutation registry runs.

| Contract surface | Required invariant and canary |
| --- | --- |
| `require(target)` carriers | `Module._compile` alone represents the target source; a marker reports exactly one application before exactly one selected protective test executes. |
| Direct text-evaluation carriers | `fs.readFileSync` still represents source read as text when no module compilation follows; a dedicated control executes the represented text and reaches its protective assertion. |
| Application marker consumers | The marker carries an exact count and intended-hook identity; zero or more than one application is an infrastructure failure, never causal mutation proof. |
| Test-integrity process result | Expected non-zero status is accepted only with one executed selected test and assertion output attributable to that test; injector, preload, anchor, syntax, or module-load errors are rejected. |
| Existing mutation registry | Registered substitution text and anchor cardinality remain unchanged except for the explicit double-application negative control. |
| Rollback | Reverting the two authorized shared test files restores the prior mechanism; no product source, fixture, or persistent data restore is required. |

### Consumer Impact Sweep

| Consumer | Required outcome |
| --- | --- |
| Direct `composeBrief()` callers | Dangerous subject/domain strings become ordinary own keys; no API shape change |
| Browser-global `window.RLPORTFOLIOBRIEF.composeBrief` | The same six direct exported subject/domain cases retain UMD runtime parity without being mislabeled as user-enterable values |
| Production completion recorder | Existing token rules stay unchanged; accepted lowercase `constructor` records through preview/confirm and becomes visible in the Brief |
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
  And recording the accepted constructor subject through the real browser completion controls renders it in the Brief without an uncaught page error

Scenario: SCN-B007-DOMAIN-KEY-SAFETY
  Given a completion domain is __proto__, constructor, or toString
  And completions span the existing count and distinct-date floor
  And every shared built-in target is snapshotted before the call
  When exported composeBrief evaluates the complete domain matrix
  Then every call returns through the declared result contract without throwing
  And each domain is treated as an own inferred-domain key using its actual support
  And no shared built-in changes
  And cleanup leaves no process-global probe property

Scenario: SCN-B007-MUTATION-MECHANISM-CAUSALITY
  Given each BUG-007 represented mutant declares one intended carrier hook
  And require-based execution uses Module._compile while direct text evaluation uses fs.readFileSync
  When test integrity runs one represented mutant against one selected protective test
  Then the intended hook applies the representation exactly once
  And the application marker records exactly one application by that hook
  And exactly one selected protective test executes
  And the expected failure originates from that test's protective assertion rather than injector or preload setup
  And a deliberate double-application control is rejected as an infrastructure failure
  And a separate fs.readFileSync control still executes represented text and reaches its protective assertion
```

### UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected visible result | Test type and persistent carrier |
| --- | --- | --- | --- | --- |
| `SCN-B007-NORMAL-COMPATIBILITY` | Allocation lab is open with the committed ordinary brief fixture | Open the Brief and inspect its rendered lane rows | Lane order remains `held,watchlist,completedResearch,inferredRelevance`; subject order remains `MSFT,BND,ZZTOP,semiconductors` | `e2e-ui`, `tests/portfolio-survival-brief.spec.mjs`, `TP-B007-006` and broader `TP-B007-007` |
| `SCN-B007-SUBJECT-KEY-SAFETY` visible `constructor` path | Allocation lab is open and the production recorder accepts the lowercase token `constructor` | Enter `constructor` in `#behaviorSubject`, use the existing preview and confirm controls, rerender the Brief | A completed-research row or named no-action row visibly identifies `constructor`; the page remains responsive and emits no uncaught error | `e2e-ui`, `tests/portfolio-survival-brief.spec.mjs`, expected `test()` title `BUG-007: browser composer treats hostile keys as data and visible constructor remains operable`, `TP-B007-006` |

### Scenario Obligation Matrix

| Scenario | Behavior traits | Required proof and rows | Implementation owners | Test mechanism and negative control |
| --- | --- | --- | --- | --- |
| `SCN-B007-NORMAL-COMPATIBILITY` | `pure-calculation` | `TP-B007-001` proves exact normal order and refusal non-movement; `TP-B007-007` proves the broader real route remains usable. | `rlportfoliobrief.js#composeBrief` | `public-function` + `recorded-fixture` + `returned-value`; an exact one-anchor in-memory `LANE_ORDER` mutation must fail the normal-order assertion (`mutation`, high risk). |
| `SCN-B007-SUBJECT-KEY-SAFETY` | `pure-calculation`, `degraded-state`, `user-visible-ui` | `TP-B007-000` records RED; `TP-B007-002` proves all subject keys; `TP-B007-004` proves lookup and built-in integrity; `TP-B007-005` proves load-bearing protection; `TP-B007-006` repeats the exported matrix in-browser and proves the visible `constructor` path. | `rlportfoliobrief.js#distinctCount`, `rlportfoliobrief.js#composeBrief`, `portfolio-survival-allocation-lab.html#completionDraft`, `portfolio-survival-allocation-lab.html#renderBrief` | `public-function` + `synthetic-fixture` + `returned-value` plus `production-route` + `ephemeral-real` + `visible-ui`; removing one safe allocation or own-property read in memory must restore throw, mutation, or inherited lookup (`mutation`, high risk). |
| `SCN-B007-DOMAIN-KEY-SAFETY` | `pure-calculation`, `degraded-state` | `TP-B007-000` records RED; `TP-B007-003` proves all domain keys and floors; `TP-B007-004` proves built-in integrity; `TP-B007-005` proves load-bearing protection; `TP-B007-006` repeats the exported matrix in-browser. | `rlportfoliobrief.js#composeBrief` | `public-function` + `synthetic-fixture` + `returned-value`; removing one safe allocation in memory must restore throw or mutation (`mutation`, high risk). |
| `SCN-B007-MUTATION-MECHANISM-CAUSALITY` | `shared-consumer` | `TP-B007-005` proves one intended hook, one marker application, one selected protective test, assertion-origin failure, double-application rejection, and direct-text-read preservation; `TP-B007-011` prevents completion while this causal proof is absent. | `tests/portfolio-defect-injector.cjs`, `tests/portfolio-test-integrity.unit.mjs` | `test-infrastructure` + `in-memory-representation` + `process-result`; the positive controls must fail if no representation occurs, the deliberate double-application control must be refused, and the direct-read control must fail if require-path deduplication disables `fs.readFileSync` representation. |

### Implementation Plan

1. Repair the shared injector's carrier ownership and exact marker accounting,
  then add test-integrity controls that reject zero/double application and
  non-assertion failures while preserving direct text evaluation.
2. Add the functional and browser persistent tests before any product source
  change.
3. Execute the focused functional carrier against unchanged source and record
  a non-zero RED result for subject/domain `__proto__`, `constructor`, and
  `toString`, with no escaped harness exception and `finally` cleanup proven
  after every hostile call.
4. Change all ten internal caller-keyed maps and nested date set to
   `Object.create(null)`.
5. Resolve `owners` and `priorEvidenceIds` only through own membership.
6. Keep every key value, count, floor, lane, sort, output field, and refusal
   expression otherwise unchanged.
7. Execute the unchanged focused matrix and the persistent in-memory mutation
  controls. Require the intended hook, exactly one marker application, exactly
  one executed selected protective test, and protective-assertion failure
  provenance. Reject the deliberate double application and prove the direct
  `fs.readFileSync` path still represents text without writing tracked files.
8. Execute the real-browser exported six-case matrix and the visible
  `constructor` preview/confirm/rerender workflow, then the broader Feature 008
  browser matrix.
9. Execute the canonical repository selftest, packet guard battery,
  implementation-reality scan, human acceptance, and final transition guard.

### Browser Coverage Decision

The primary defect is in an exported UMD module used by the allocation page.
The functional carrier provides the most direct RED/GREEN proof. The browser
carrier invokes that same exported function in the real page runtime and is
therefore direct environment-parity coverage rather than a mocked proxy.

The authoritative completion recorder accepts lowercase letters, digits, and
hyphens. The design traces `constructor` from `#behaviorSubject` through
`completionDraft()` to the exported composer, so the browser carrier also uses
the real preview and confirm controls and asserts a visible Brief row or named
no-action row. The recorder rejects `__proto__` and `toString`, and the page
fixes completion domains to `portfolio-research`; those four values and all
three hostile domains remain direct browser-export cases only. This scope does
not widen any production input contract.

### Test Plan

| Plan ID | Test Type | Category | Live system | Persistent file | Required behavior | Command | State |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `TP-B007-000` | Scenario-first pre-fix RED | `functional` | No | `tests/portfolio-brief.functional.mjs` | Before source changes, the six direct exported cases (subject/domain each for `__proto__`, `constructor`, and `toString`) fail against unchanged source while the harness catches the call, inspects mutation, and proves `finally` cleanup. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-001` | Normal and refusal compatibility | `functional` | No | `tests/portfolio-brief.functional.mjs` | Normal lane/subject order and representative local/shared refusals do not move. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-002` | Subject-key adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | The three direct exported subject cases are own keys with actual evidence/no-action behavior; each returns the declared result shape without throw or shared built-in mutation. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-003` | Domain-key adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | The three direct exported domain cases use actual support counts and distinct-date floors; each returns the declared result shape without throw or shared built-in mutation. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-004` | Lookup, built-in, and cleanup regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | Own hostile `owners`/`priorEvidenceIds` entries remain readable, inherited entries remain absent, `Object.prototype`, `Object`, and `Object.prototype.toString` remain unchanged, and cleanup is unconditional. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Planned, not authored or run |
| `TP-B007-005` | In-memory mutation mechanism causality | `unit` | No | `tests/portfolio-test-integrity.unit.mjs`, `tests/portfolio-defect-injector.cjs` | For every represented BUG-007 mutant, declare one intended hook; require-based execution is represented once by `Module._compile`, direct text evaluation is represented once by `fs.readFileSync`, the marker records exactly one application, exactly one selected protective test executes, and the expected non-zero result names that test's protective assertion rather than injector/preload/anchor/module-load setup. Reject a deliberate double application, preserve a separate direct-read control, prove representative map/own-property/order mutations fail their exact assertions, and verify no tracked product source or unrelated test file is written. | `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs` | Planned, not authored or run; required by `HARDEN-B007-001` |
| `TP-B007-006` | Scenario-specific Regression E2E | `e2e-ui` | Yes | `tests/portfolio-survival-brief.spec.mjs` | The real page runtime's exported composer passes all six direct hostile cases with no throw/mutation and exact order, while the real preview/confirm controls accept `constructor` and render it in the Brief without an uncaught page error. | `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Existing carrier; scenarios not authored or run |
| `TP-B007-007` | Broader Regression E2E | `e2e-ui` | Yes | Feature 008 Playwright carriers | All existing Feature 008 user workflows remain green. | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Existing carriers; re-execution required after implementation |
| `TP-B007-008` | Repository regression | `functional` | No | `scripts/selftest.mjs` | Canonical registered invariants remain green. | `timeout 1800 node scripts/selftest.mjs` | Existing check; re-execution required after implementation |
| `TP-B007-009` | Planning and packet guard battery | `artifact` | No | BUG-007 packet | Artifact shape, traceability, scenario obligations, mechanism coherence, scope context fit, and capability-foundation proportionality are coherent. | See `test-plan.json` `CMD-B007-PACKET-GUARDS`. | Required for plan commit and delivery rerun; remains unchecked |
| `TP-B007-010` | Implementation reality guard | `guard` | No | BUG-007 packet and referenced implementation files | Referenced product/test paths are real and the delivered source contains no stub or fabricated behavior. | `timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --verbose` | Planned for post-implementation rerun; remains unchecked |
| `TP-B007-011` | Transition guard | `guard` | No | BUG-007 packet | Completion contract passes only after implementation, tests, human acceptance, validate-owned certification, and `HARDEN-B007-001` mechanism-causality proof are complete; a mutant process that fails before one selected protective assertion executes cannot satisfy transition evidence. | `timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys` | Planned for final validation only; remains unchecked |

### Test Plan To DoD Parity

| Test Plan row | Primary DoD item |
| --- | --- |
| `TP-B007-000` | Pre-fix persistent RED and cleanup are observed before implementation |
| `TP-B007-001` | `SCN-B007-NORMAL-COMPATIBILITY` holds |
| `TP-B007-002` | `SCN-B007-SUBJECT-KEY-SAFETY` holds |
| `TP-B007-003` | `SCN-B007-DOMAIN-KEY-SAFETY` holds |
| `TP-B007-004` | Lookup-map, built-in-integrity, and cleanup controls hold |
| `TP-B007-005` | In-memory mutation controls are load-bearing without tracked-source mutation |
| `TP-B007-006` | Scenario-specific browser regression and visible `constructor` path pass |
| `TP-B007-007` | Broader E2E regression suite passes |
| `TP-B007-008` | Canonical repository selftest passes |
| `TP-B007-009` | Planning and packet guard battery passes |
| `TP-B007-010` | Implementation reality guard passes after delivery |
| `TP-B007-011` | Transition guard passes before certification |

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
  own/inherited caller-map semantics and shared built-in integrity hold.
  Evidence: `report.md#tp-b007-004`.
- [ ] `SCN-B007-MUTATION-MECHANISM-CAUSALITY` holds through `TP-B007-005`:
  each represented BUG-007 mutant uses its declared hook exactly once, its
  marker records one application, exactly one selected protective test runs,
  and the failure originates from that test's protective assertion rather than
  injector, preload, anchor, syntax, or module-load setup. The deliberate
  double application is rejected, the separate `fs.readFileSync` text carrier
  remains effective, representative map/own-property/order mutants fail their
  exact assertions, and no tracked product source or unrelated test file is
  written. Evidence: `report.md#tp-b007-005`.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  pass through `TP-B007-006`, including all six direct exported browser cases
  and the real visible `constructor` recorder path. Evidence:
  `report.md#tp-b007-006`.
- [ ] Broader E2E regression suite passes through `TP-B007-007`. Evidence:
  `report.md#tp-b007-007`.
- [ ] `TP-B007-008` canonical repository selftest passes. Evidence:
  `report.md#tp-b007-008`.
- [ ] `TP-B007-009` planning and packet guard battery passes. Evidence:
  `report.md#tp-b007-009`.
- [ ] `TP-B007-010` implementation-reality scan passes after source and
  persistent tests are delivered. Evidence: `report.md#tp-b007-010`.
- [ ] Human acceptance in `uservalidation.md` is explicitly completed by the
  human owner; planning leaves every acceptance item unchecked.
- [ ] `TP-B007-011` transition guard passes only after all delivery,
  acceptance, certification, and `HARDEN-B007-001` causal mutation-proof
  prerequisites are satisfied. Evidence: `report.md#tp-b007-011`.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero warnings, zero unresolved findings,
  exact changed-path containment, current documentation, and no skipped
  required test.

All items remain unchecked. This packet records reproduction and planned work,
not implementation or certification.
