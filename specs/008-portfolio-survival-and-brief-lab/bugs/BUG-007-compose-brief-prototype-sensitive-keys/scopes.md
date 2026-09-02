# BUG-007 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.test`

[Spec](spec.md) | [Design](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

The source and persistent-test implementation is already committed. This
planning reconciliation changes no source or test file. The separate dirty
parent Feature 008 scope and root test-plan transaction remains excluded.

## Execution Outline

### Phase Order

1. **Scope 1 - Reconcile Caller-Key And Error Contracts:** retain the historical
  six-case RED as pre-implementation evidence; recognize the committed
  functional, browser, source, shared-injector, mutation-causality, registry,
  and seven-field error work; then route the exact current carriers to
  `bubbles.test` for fresh execution and report evidence before validation.

### New Types And Signatures

- No new exported type, function, route, schema, or contract version.
- Internal aggregation objects retain their committed inheritance-free
  representation.
- Caller lookup maps retain their input shape and committed own-membership
  reads.
- The parent `PortfolioError/v1` invariant remains a closed seven-field value.
  The reconciled bug-analysis census is 33 registered codes, 45 quoted
  production emitters, and 19 missing before `3688388d5`; the committed current
  census is 52 registered, 45 quoted production emitters, and zero missing.

### Validation Checkpoints

1. `TP-B007-000` remains the historical scenario-first RED. It is not rerun
  against fixed source as a GREEN check. Its exact persistent carrier remains
  the aggregate hostile-key title in `tests/portfolio-brief.functional.mjs`.
2. Commit `82d1db5e5` admits and implements `HARDEN-B007-001` in the shared
  injector and test-integrity carrier. Planning does not treat that commit as
  fresh test closure or validate certification.
3. Commit `3688388d5` is a separate three-file error-contract batch. Fresh test
  ownership must verify the exact seven-field assertions and emitted-to-
  registered code invariant without relabeling the historical RED.
4. Commit `4c9f2e87b` authors the exact `TP-B007-008` repository census
  assertion. Its authored state does not establish current test execution;
  focused, browser, broader Feature 008, mutation-causality, selftest, packet,
  and implementation-reality closure still require eligible report evidence.
5. Human acceptance is explicitly recorded for all 13 checklist items at
  `2026-09-01T03:40:36Z`; this closes only the acceptance-specific DoD row.
  The validate-owned transition remains an explicit final gate.

| Scope | Outcome | Planned source and test paths | Status |
| --- | --- | --- | --- |
| 1 | Reconcile committed caller-key safety, mutation causality, and the parent error contract | `rlportfolio.js`, `rlportfoliobrief.js`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs`, `tests/portfolio-test-integrity.unit.mjs`, `tests/portfolio-defect-injector.cjs` | Not Started |

## Scope 1 - Harden Caller-Keyed Brief Aggregation

**Scope ID:** `01-harden-caller-keyed-brief-aggregation`
**Status:** Not Started
**Depends On:** -
**Execution dependency:** `bubbles.test` (RED) -> `bubbles.implement` ->
`bubbles.test` (GREEN and regression) -> quality phases -> `bubbles.validate`.
**Reconciled finding:** `HARDEN-B007-001` is planning-resolved as admitted and
implemented by `82d1db5e5`. It is not test-closed or validate-certified.

### Implementation Files

| Path | Delivered role and commit boundary |
| --- | --- |
| `rlportfolio.js` | `3688388d5`: expands the closed `ERROR_CODES` registry from the 33-code baseline to the current 52-code set and admits absent or explicit-null optional `field` and `row` values. |
| `rlportfoliobrief.js` | `d49a2955b`: hardens `distinctCount()` and `composeBrief()` caller-keyed maps and lookups. `3688388d5`: routes local `err()` through the seven-field `contractErr()` path. |
| `tests/portfolio-brief.functional.mjs` | `aad6fb52e`: authors the historical RED and persistent normal, six-case, lookup, cleanup, and no-throw carriers. `3688388d5`: changes the two affected expectations to the exact seven-field parent error shape. |
| `tests/portfolio-survival-brief.spec.mjs` | `aad6fb52e`: authors the real-browser six-case matrix and production-visible `constructor` completion path. |
| `tests/portfolio-test-integrity.unit.mjs` | `aad6fb52e`: authors the original BUG-007 mutation carrier. `82d1db5e5`: adds assertion-origin checks, exact hook/application accounting, double-application rejection, direct-text preservation, and uncoordinated zero-anchor refusal. |
| `tests/portfolio-defect-injector.cjs` | `82d1db5e5`: coordinates pending represented reads so `Module._compile` owns CommonJS carriers and `fs.readFileSync` owns direct text carriers without writing tracked source. |

### Change Boundary

The delivered batches already inside this scope are distinct:

| Batch | Exact committed surfaces | Planning disposition |
| --- | --- | --- |
| `aad6fb52e` persistent RED authorship | `tests/portfolio-brief.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs`, `tests/portfolio-test-integrity.unit.mjs` | Carrier authorship is admitted. `TP-B007-000` remains historical RED; current coverage stays planned. |
| `d49a2955b` caller-key repair | `rlportfoliobrief.js` | Source implementation is admitted, not reimplemented by this plan run. |
| `82d1db5e5` shared mutation-causality repair | `tests/portfolio-defect-injector.cjs`, `tests/portfolio-test-integrity.unit.mjs` | `HARDEN-B007-001` is planning-resolved as implemented. Fresh test and validation closure remain required. |
| `3688388d5` error-contract completion | `rlportfolio.js`, `rlportfoliobrief.js`, `tests/portfolio-brief.functional.mjs` | Separate later batch. It owns the 52-code registry, zero-missing invariant, local constructor delegation, explicit-null validation, and exact seven-field expectations. |
| `4c9f2e87b` registry-census test authorship | `scripts/selftest.mjs` | Authors the exact `TP-B007-008` title and source-derived census with invented-code and removed-code negative controls. Structured execution status remains planned. |

Delivered implementation surfaces recognized by this plan:

- `rlportfolio.js`: the closed registry and optional-field validator.
- `rlportfoliobrief.js`: the inheritance-free aggregation path and canonical
  local error constructor path.
- `tests/portfolio-brief.functional.mjs`: exact persistent functional and
  error-shape assertions.
- `tests/portfolio-survival-brief.spec.mjs`: exact current browser carrier.
- `tests/portfolio-test-integrity.unit.mjs` and
  `tests/portfolio-defect-injector.cjs`: the committed protected shared
  mutation mechanism and its causal consumer.

This plan-owner invocation may change only `scopes.md`, `test-plan.json`, and
`scenario-manifest.json`. It does not authorize a source, test, injector,
report, state, acceptance, parent Feature 008, or certification edit.

Excluded surfaces:

- Parent Feature 008 scope files and root `test-plan.json`.
- Sibling bugs, policy JSON, storage, data, navigation, and route contracts.
- Registry work outside `rlportfolio.js::ERROR_CODES` and the three governed
  Feature 008 emitter modules. The BUG-007 registry completion itself is
  included, not excluded.
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
| Rollback | Reverting `82d1db5e5` as one two-file unit restores the prior shared mechanism. It must not be conflated with reverting the later three-file `3688388d5` error-contract batch. No product fixture or persisted data restore applies. |

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
| Parent `PortfolioError/v1` consumers | Every local brief refusal carries the closed seven-field vocabulary; every quoted code emitted by `rlportfolio.js`, `rlportfoliobrief.js`, or `rlportfolioanalytics.js` is present in `rlportfolio.js::ERROR_CODES` |
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
  And every local brief refusal retains the parent's exact seven-field PortfolioError/v1 shape
  And the committed 52-code registry covers all 45 quoted production emitters with zero missing code

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
| `SCN-B007-NORMAL-COMPATIBILITY` | `pure-calculation`, `shared-consumer` | `TP-B007-001` proves exact normal order, refusal non-movement, and the parent seven-field error shape; `TP-B007-008` owns the persistent emitted-to-registered census; `TP-B007-007` proves the broader real route remains usable. | `rlportfoliobrief.js#composeBrief`, `rlportfoliobrief.js#contractErr`, `rlportfolio.js#ERROR_CODES`, `rlportfolio.js#validatePortfolioError`, `rlportfolioanalytics.js` | `public-function` + `recorded-fixture` + `returned-value`; exact in-memory mutations must fail the normal-order assertion and the planned registry-census assertion (`mutation`, high risk). |
| `SCN-B007-SUBJECT-KEY-SAFETY` | `pure-calculation`, `degraded-state`, `user-visible-ui` | `TP-B007-000` records RED; `TP-B007-002` proves all subject keys; `TP-B007-004` proves lookup and built-in integrity; `TP-B007-005` proves load-bearing protection; `TP-B007-006` repeats the exported matrix in-browser and proves the visible `constructor` path. | `rlportfoliobrief.js#distinctCount`, `rlportfoliobrief.js#composeBrief`, `portfolio-survival-allocation-lab.html#completionDraft`, `portfolio-survival-allocation-lab.html#renderBrief` | `public-function` + `synthetic-fixture` + `returned-value` plus `production-route` + `ephemeral-real` + `visible-ui`; removing one safe allocation or own-property read in memory must restore throw, mutation, or inherited lookup (`mutation`, high risk). |
| `SCN-B007-DOMAIN-KEY-SAFETY` | `pure-calculation`, `degraded-state` | `TP-B007-000` records RED; `TP-B007-003` proves all domain keys and floors; `TP-B007-004` proves built-in integrity; `TP-B007-005` proves load-bearing protection; `TP-B007-006` repeats the exported matrix in-browser. | `rlportfoliobrief.js#composeBrief` | `public-function` + `synthetic-fixture` + `returned-value`; removing one safe allocation in memory must restore throw or mutation (`mutation`, high risk). |
| `SCN-B007-MUTATION-MECHANISM-CAUSALITY` | `shared-consumer` | `TP-B007-005` proves one intended hook, one marker application, one selected protective test, assertion-origin failure, double-application rejection, and direct-text-read preservation; `TP-B007-011` prevents completion while this causal proof is absent. | `tests/portfolio-defect-injector.cjs`, `tests/portfolio-test-integrity.unit.mjs` | `test-infrastructure` + `in-memory-representation` + `process-result`; the positive controls must fail if no representation occurs, the deliberate double-application control must be refused, and the direct-read control must fail if require-path deduplication disables `fs.readFileSync` representation. |

### Implementation Plan

1. Preserve `TP-B007-000` as the historical RED authored in `aad6fb52e`. Do not
  rerun it against fixed source or relabel a GREEN result as reproduction.
2. Treat the caller-key implementation in `d49a2955b` and the
  `HARDEN-B007-001` shared-injector/test-integrity repair in `82d1db5e5` as
  admitted implementation, while leaving current test and certification status
  planned.
3. Treat `3688388d5` as the later, independent three-file error-contract batch.
  Preserve the exact seven-field expectations and the 52-registered,
  45-quoted-emitter, zero-missing invariant.
4. Have `bubbles.test` confirm the exact current titles, including the
  `TP-B007-008` census assertion committed at `4c9f2e87b`, before running the
  focused, mutation, browser, broader Feature 008, and repository checks.
5. Have `bubbles.test` record current evidence for `TP-B007-001` through
  `TP-B007-010`, including assertion-origin mutation causality and changed-path
  containment. The historical `TP-B007-000` evidence remains immutable.
6. Keep every DoD item unchecked until its current owner records eligible
  evidence. Human acceptance remains human-owned, and `TP-B007-011` remains
  validate-owned.

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
| `TP-B007-000` | Historical scenario-first pre-fix RED | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: prototype-sensitive completion keys are safe own keys` | The retained pre-implementation run executes the six direct exported cases and fails because unchanged source violates no-throw and built-in integrity while `finally` cleanup completes. This row is historical RED and must not be rerun as a GREEN proof. | Historical command: `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Authored; historical RED only; current execution remains planned |
| `TP-B007-001` | Normal, refusal, and parent error compatibility | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: normal brief order and refusal precedence remain unchanged`; `SCN-008-046 every public boundary emits a closed value-safe PortfolioError` | Exact normal order and refusal precedence remain unchanged. Local brief errors and the parent public boundary retain the closed seven-field `PortfolioError/v1` shape. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Authored; planned not executed in the current evidence epoch |
| `TP-B007-002` | Subject-key adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: prototype-sensitive completion subjects are safe own keys` | The three direct exported subject cases are own keys with actual evidence/no-action behavior; each returns the declared result shape without throw or shared built-in mutation. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Authored; planned not executed in the current evidence epoch |
| `TP-B007-003` | Domain-key adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: prototype-sensitive completion domains are safe own keys` | The three direct exported domain cases use actual support counts and distinct-date floors; each returns the declared result shape without throw or shared built-in mutation. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Authored; planned not executed in the current evidence epoch |
| `TP-B007-004` | Lookup, built-in, and cleanup regression | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: own lookup semantics and RED cleanup preserve shared built-ins` | Own hostile `owners`/`priorEvidenceIds` entries remain readable, inherited entries remain absent, `Object.prototype`, `Object`, and `Object.prototype.toString` remain unchanged, and cleanup is unconditional. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Authored; planned not executed in the current evidence epoch |
| `TP-B007-005` | In-memory mutation mechanism causality | `unit` | No | `tests/portfolio-test-integrity.unit.mjs` — `BUG-007: represented mutants execute one protective assertion through one intended hook`; shared injector `tests/portfolio-defect-injector.cjs` | For every represented BUG-007 mutant, require one intended hook, one marker application, one selected protective test, and an `ERR_ASSERTION` origin with no injector/preload/anchor/syntax/module-load failure. Reject deliberate double application, preserve direct-text representation, retain uncoordinated zero-anchor refusal, and prove no tracked source or test write. | `timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs` | Authored and implemented at `82d1db5e5`; planned not executed in the current evidence epoch; not validate-certified |
| `TP-B007-006` | Scenario-specific Regression E2E | `e2e-ui` | Yes | `tests/portfolio-survival-brief.spec.mjs` — `BUG-007: browser composer treats hostile keys as data and visible constructor remains operable` | The real page runtime's exported composer passes all six direct hostile cases with no throw/mutation and exact order, while the real preview/confirm controls accept `constructor` and render it in the Brief without an uncaught page error. | `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Authored; planned not executed in the current evidence epoch |
| `TP-B007-007` | Broader Regression E2E | `e2e-ui` | Yes | Eight exact Feature 008 Playwright files listed by `CMD-B007-FEATURE-E2E` | All existing Feature 008 user workflows remain green. | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Authored carriers; planned not executed in the current evidence epoch |
| `TP-B007-008` | Registry census and repository regression | `functional` | No | `scripts/selftest.mjs` — `Feature 008 PortfolioError registry covers every quoted production emitter` | Execute the committed persistent census assertion over `rlportfolio.js`, `rlportfoliobrief.js`, and `rlportfolioanalytics.js`; require the current 52 registered, 45 quoted-emitter, zero-missing invariant; then run the canonical selftest. | `timeout 1800 node scripts/selftest.mjs` | Authored at `4c9f2e87b`; execution remains planned in structured-plan metadata; report-backed test evidence is at `report.md#bug007-tp-b007-008-current` |
| `TP-B007-009` | Planning and packet guard battery | `artifact` | No | Six exact `.github/bubbles/scripts/` guards listed by `CMD-B007-PACKET-GUARDS` | Artifact shape, traceability, all four scenario obligations, mechanism coherence, scope context fit, and capability-foundation proportionality are coherent. | See `test-plan.json` `CMD-B007-PACKET-GUARDS`. | Authored guard carriers; planned not executed as delivery evidence |
| `TP-B007-010` | Implementation reality guard | `guard` | No | `.github/bubbles/scripts/implementation-reality-scan.sh` over the BUG-007 packet and referenced implementation files | Referenced product/test/injector paths are real and the delivered source contains no stub or fabricated behavior. | `timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --verbose` | Authored guard carrier; planned not executed in the current evidence epoch |
| `TP-B007-011` | Transition guard | `guard` | No | `.github/bubbles/scripts/state-transition-guard.sh` over the BUG-007 packet | Completion passes only after current implementation tests, human acceptance, validate-owned certification, and causal mutation proof are complete. A mutant process that fails before one selected protective assertion executes cannot satisfy transition evidence. | `timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys` | Authored guard carrier; planned for final validation only |

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
  > **Uncertainty Declaration**
  > **What was attempted:** Reconciled the design inventory and direct six-file implementation inventory.
  > **What was observed:** Current implementation reality resolves six files with zero violations or warnings.
  > **Why this is uncertain:** Planning does not convert design interpretation into execution-phase confirmation.
  > **What would resolve this:** `bubbles.test` must confirm the inventory against the current carriers and record eligible evidence.
- [ ] The change remains inside the declared Change Boundary, the five committed
  batches remain distinct, and the Consumer Impact Sweep remains accurate.
  > **Uncertainty Declaration**
  > **What was attempted:** Verified commits `82d1db5e5`, `3688388d5`, and `4c9f2e87b` and kept edits within the three authorized planning files.
  > **What was observed:** The six delivered implementation paths are clean while unrelated worktree changes remain present and untouched.
  > **Why this is uncertain:** Planning has not produced execution-owner containment evidence for every committed batch.
  > **What would resolve this:** `bubbles.test` must verify the batch boundaries and current source/test identities.
- [ ] `TP-B007-000` records the persistent pre-fix RED result before source
  implementation and proves cleanup after every hostile attempt. Evidence:
  `report.md#tp-b007-000`.
  > **Uncertainty Declaration**
  > **What was attempted:** Read the historical RED anchor and preserved its no-rerun semantics.
  > **What was observed:** The anchor records exit 1, four exact failing titles, and zero skipped tests.
  > **Why this is uncertain:** This planning pass does not own historical test-evidence adjudication.
  > **What would resolve this:** `bubbles.test` must accept the immutable RED anchor for this exact DoD row.
- [ ] `SCN-B007-NORMAL-COMPATIBILITY` holds through `TP-B007-001`: normal lane
  and subject order plus representative refusal precedence remain unchanged,
  and both exact current titles retain the parent's closed seven-field
  `PortfolioError/v1` invariant.
  Evidence: `report.md#tp-b007-001`.
  > **Uncertainty Declaration**
  > **What was attempted:** Read the row anchor and its linked current focused-functional evidence.
  > **What was observed:** The report records the exact normal-order title in a 34-of-34 execution.
  > **Why this is uncertain:** Structured execution remains test-owned and is not promoted by planning.
  > **What would resolve this:** `bubbles.test` must reconcile the report-backed execution to this row.
- [ ] `SCN-B007-SUBJECT-KEY-SAFETY` holds through `TP-B007-002`: all three
  subject keys are own data, return without throw, preserve absent lookup-map
  semantics, and mutate no shared built-in. Evidence: `report.md#tp-b007-002`.
  > **Uncertainty Declaration**
  > **What was attempted:** Read the subject-row anchor and linked current focused-functional output.
  > **What was observed:** The report records the exact subject title in the 34-of-34 execution.
  > **Why this is uncertain:** Planning cannot certify test execution or assertion sufficiency.
  > **What would resolve this:** `bubbles.test` must reconcile the exact subject assertions and evidence.
- [ ] `SCN-B007-DOMAIN-KEY-SAFETY` holds through `TP-B007-003`: all three
  domain keys use their actual support floors, return without throw, and mutate
  no shared built-in. Evidence: `report.md#tp-b007-003`.
  > **Uncertainty Declaration**
  > **What was attempted:** Read the domain-row anchor and linked current focused-functional output.
  > **What was observed:** The report records the exact domain title in the 34-of-34 execution.
  > **Why this is uncertain:** Planning cannot certify test execution or assertion sufficiency.
  > **What would resolve this:** `bubbles.test` must reconcile the exact domain assertions and evidence.
- [ ] `TP-B007-004` proves cleanup is unconditional and restoring ordinary maps
  own/inherited caller-map semantics and shared built-in integrity hold.
  Evidence: `report.md#tp-b007-004`.
  > **Uncertainty Declaration**
  > **What was attempted:** Read the lookup, built-in, and cleanup anchor and linked current output.
  > **What was observed:** The report records the exact lookup/cleanup title in the 34-of-34 execution.
  > **Why this is uncertain:** Planning cannot certify execution-phase cleanup proof.
  > **What would resolve this:** `bubbles.test` must reconcile this row against its exact assertions.
- [ ] `SCN-B007-MUTATION-MECHANISM-CAUSALITY` holds through `TP-B007-005`:
  each represented BUG-007 mutant uses its declared hook exactly once, its
  marker records one application, exactly one selected protective test runs,
  and the failure originates from that test's protective assertion rather than
  injector, preload, anchor, syntax, or module-load setup. The deliberate
  double application is rejected, the separate `fs.readFileSync` text carrier
  remains effective, representative map/own-property/order mutants fail their
  exact assertions, and no tracked product source or unrelated test file is
  written. Evidence: `report.md#tp-b007-005`.
  > **Uncertainty Declaration**
  > **What was attempted:** Verified implementation commit `82d1db5e5` and read the RED plus later mutation evidence.
  > **What was observed:** `HARDEN-B007-001` is implemented, while planning intentionally claims no test or validate closure.
  > **Why this is uncertain:** Causal mutation closure belongs to the test phase after the admitted repair.
  > **What would resolve this:** `bubbles.test` must execute or adjudicate the exact post-repair causal title and record closure.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  pass through `TP-B007-006`, including all six direct exported browser cases
  and the real visible `constructor` recorder path. Evidence:
  `report.md#tp-b007-006`.
  > **Uncertainty Declaration**
  > **What was attempted:** Read the scenario-browser anchor and its current 19-test execution block.
  > **What was observed:** The exact BUG-007 browser title is present in a reported 19-of-19 run.
  > **Why this is uncertain:** Planning does not promote browser execution evidence into a checked test DoD.
  > **What would resolve this:** `bubbles.test` must reconcile the current browser receipt to this row.
- [ ] Broader E2E regression suite passes through `TP-B007-007`. Evidence:
  `report.md#tp-b007-007`.
  > **Uncertainty Declaration**
  > **What was attempted:** Read the broader Feature 008 anchor and linked eight-file execution block.
  > **What was observed:** The report records a 95-of-95 browser run.
  > **Why this is uncertain:** Structured execution remains test-owned.
  > **What would resolve this:** `bubbles.test` must reconcile the broader E2E receipt to this row.
- [ ] `TP-B007-008` passes the committed persistent emitted-to-registered census
  assertion, proves the committed 52 registered, 45 quoted-emitter, zero-
  missing invariant, and passes the canonical repository selftest. Evidence:
  `report.md#bug007-tp-b007-008-current`.
  > **Uncertainty Declaration**
  > **What was attempted:** Verified the exact title once at HEAD `4c9f2e87b` and read the current test-owner report anchor.
  > **What was observed:** Authorship is committed and the report carries a bounded selftest execution record.
  > **Why this is uncertain:** Planning preserves `planned-not-executed` rather than converting test-owned report evidence into its own execution claim.
  > **What would resolve this:** `bubbles.test` must reconcile `report.md#bug007-tp-b007-008-current` to the execution checkbox.
- [ ] `TP-B007-009` planning and packet guard battery passes. Evidence:
  `report.md#tp-b007-009`.
  > **Uncertainty Declaration**
  > **What was attempted:** Executed all six required packet guards after the planning edits.
  > **What was observed:** Every guard exited zero; this invocation did not edit the test-owned report.
  > **Why this is uncertain:** Current command output is not an execution-owner evidence block in `report.md`.
  > **What would resolve this:** `bubbles.test` must record or reconcile current packet-guard evidence for this row.
- [ ] `TP-B007-010` implementation-reality scan passes after source and
  persistent tests are delivered. Evidence: `report.md#tp-b007-010`.
  > **Uncertainty Declaration**
  > **What was attempted:** Executed the implementation-reality scanner after reconciliation.
  > **What was observed:** It resolved six implementation files with zero violations and zero warnings.
  > **Why this is uncertain:** This planning pass cannot write test-phase evidence into `report.md`.
  > **What would resolve this:** `bubbles.test` must record or reconcile the six-file scanner evidence for this row.
- [x] Human acceptance in `uservalidation.md` is explicitly completed by the
  human owner. This item records acceptance only and makes no test,
  certification, delivery, or terminal-status claim. Evidence:
  [operator acceptance](uservalidation.md#human-acceptance-record).
- [ ] `TP-B007-011` transition guard passes only after all delivery,
  acceptance, certification, and `HARDEN-B007-001` causal mutation-proof
  prerequisites are satisfied. Evidence: `report.md#tp-b007-011`.
  > **Uncertainty Declaration**
  > **What was attempted:** No transition was attempted because certification is outside plan ownership.
  > **What was observed:** The report marks this row `not-run` and the packet remains `in_progress`.
  > **Why this is uncertain:** A transition verdict requires the validate-owned terminal phase.
  > **What would resolve this:** `bubbles.validate` must run the transition guard after test closure.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero warnings, zero unresolved findings,
  exact changed-path containment, current documentation, and no skipped
  required test.
  > **Uncertainty Declaration**
  > **What was attempted:** Ran the required planning guards and scoped diff check.
  > **What was observed:** Planning guards are green, but test closure and transition validation remain unclaimed.
  > **Why this is uncertain:** The grouped gate cannot close before all constituent execution and validation rows close.
  > **What would resolve this:** Complete the test-owned rows, then run validate-owned transition checks.

One acceptance-only item is checked and fifteen items remain unchecked. The
plan recognizes committed implementation, carrier authorship, and explicit
human acceptance. It records no new test closure or certification.
