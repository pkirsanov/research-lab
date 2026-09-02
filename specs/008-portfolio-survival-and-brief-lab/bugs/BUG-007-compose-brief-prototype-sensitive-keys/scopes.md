# BUG-007 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Planning reconciliation:** `reconciled-current-evidence` (`bubbles.plan`)
**Next required owner:** `bubbles.harden` (exhaustive re-entry)

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
  six-case RED as pre-implementation evidence; preserve the committed source,
  carrier, mutation-causality, registry, and seven-field error work; reconcile
  current test-owned evidence, including the completed `TP-B007-012` final-tree-
  safe rollback and restoration proof; then route exhaustive re-entry to
  `bubbles.harden` without claiming planner test execution, certification, or
  terminal completion.

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
  injector and test-integrity carrier. Current test-owned evidence closes its
  mutation-causality and independent-canary checks, not validate certification.
3. Commit `3688388d5` remains a separate three-file error-contract batch. The
  current functional and selftest evidence verifies the exact seven-field
  assertions and emitted-to-registered invariant without relabeling the RED.
4. Commit `4c9f2e87b` authors the exact `TP-B007-008` repository census
  assertion. Current test-owned evidence records the final 52/45/zero census,
  canonical selftest `3443/3443`, focused, mutation, and browser closure; the
  current planner run separately validates the revised packet artifacts.
5. Human acceptance is explicitly recorded for all 13 checklist items at
  `2026-09-01T03:40:36Z`; this closes only the acceptance-specific DoD row.
  The validate-owned transition remains an explicit final gate.
6. `TP-B007-012` keeps mechanics distinct from behavior: current canary GREEN,
  expected reverted-state detection, byte-identical restore, then restored
  current canary GREEN. Test-owned route 014 executed that sequence and recorded
  the expected nonzero result while the semantic inverse intentionally restored
  the old dual-hook defect. Plan-owned route 015 reconciled that evidence into
  the packet. The current planning repair requests no test rerun; exhaustive
  hardening re-entry follows the active-truth repair.

| Scope | Outcome | Planned source and test paths | Status |
| --- | --- | --- | --- |
| 1 | Reconcile committed caller-key safety, mutation causality, and the parent error contract | `rlportfolio.js`, `rlportfoliobrief.js`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs`, `tests/portfolio-test-integrity.unit.mjs`, `tests/portfolio-defect-injector.cjs` | Not Started |

## Scope 1 - Harden Caller-Keyed Brief Aggregation

**Scope ID:** `01-harden-caller-keyed-brief-aggregation`
**Status:** Not Started
**Depends On:** -
**Completed execution chain:** `bubbles.test` (RED) -> `bubbles.implement` ->
`bubbles.test` (GREEN and regression).
**Planning reconciliation:** `reconciled-current-evidence` (`bubbles.plan`).
**Next dependency:** `bubbles.harden` (exhaustive re-entry) ->
remaining quality phases -> `bubbles.validate`.
**Reconciled finding:** `HARDEN-B007-001` is planning-resolved as admitted and
implemented by `82d1db5e5` and covered by current test-owned evidence. It is not
validate-certified.

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
| `aad6fb52e` persistent RED authorship | `report.md`, `state.json`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs`, `tests/portfolio-test-integrity.unit.mjs` | Carrier authorship is admitted. `TP-B007-000` remains historical RED; current coverage stays planned. |
| `d49a2955b` caller-key repair | `rlportfoliobrief.js`, `report.md`, `state.json` | Source implementation is admitted, not reimplemented by this plan run. |
| `82d1db5e5` shared mutation-causality repair | `tests/portfolio-defect-injector.cjs`, `tests/portfolio-test-integrity.unit.mjs` | `HARDEN-B007-001` is planning-resolved as implemented and test-evidenced. Validation certification remains required. |
| `3688388d5` error-contract completion | `rlportfolio.js`, `rlportfoliobrief.js`, `tests/portfolio-brief.functional.mjs` | Separate later batch. It owns the 52-code registry, zero-missing invariant, local constructor delegation, explicit-null validation, and exact seven-field expectations. |
| `4c9f2e87b` registry-census test authorship | `scripts/selftest.mjs` | Authors the exact `TP-B007-008` title and source-derived census with invented-code and removed-code negative controls. Structured execution status is reconciled to current test-owned evidence. |

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

This plan-owner invocation may change `scopes.md`, `test-plan.json`, and
`scenario-manifest.json`. It may also normalize planner-authored PII evidence
in `report.md` and update planner execution routing in `state.json`. It does not
authorize product source, persistent tests, injector behavior, foreign report
evidence, acceptance, parent Feature 008, certification, or status changes.

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
| Rollback and restore | In a clean disposable clone or copy at the exact candidate revision, preserve `tests/portfolio-test-integrity.unit.mjs` as the byte-identical independent oracle and apply the design's bounded semantic inverse only to `tests/portfolio-defect-injector.cjs`. The inverse removes `DOUBLE_APPLICATION_CONTROL`, `pendingTargetReads`, `takePendingTargetRead()`, and the process-exit recovery; collapses representation and marker recording into `represent(source, via)`; makes `_compile` represent received content with the legacy `require` marker; and makes `readFileSync` immediately return `represent(result, "readFileSync")`. Verify the expected old-state dual-hook zero-anchor or infrastructure-origin failure, preserve the three `3688388d5` controls and all later integrity bytes, restore the injector from the captured final-tree baseline, prove all five controlled paths byte-identical, and rerun the unchanged current canary 1/1. Never mutate the operator checkout or require current behavior to pass while intentionally reverted. |

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
4. Preserve current test-owned evidence for the exact titles in `TP-B007-001`
  through `TP-B007-010`, including assertion-origin mutation causality,
  changed-path containment, and the final `TP-B007-008` census/selftest run.
5. Record that `TP-B007-012` was executed-passed by `bubbles.test` through
  route 014. Keep the distinct shared-infrastructure canary mapped to the exact
  mutation-causality execution, and keep the rollback/restore DoD checked
  against its dated test-owned evidence without claiming planner execution.
6. Preserve route 015 as the completed plan-owned reconciliation of route 014
  test evidence. This current planning repair requests no test rerun; it repairs
  active lifecycle and structured-key truth, then routes the reconciled packet
  to `bubbles.harden` for exhaustive re-entry. Human acceptance remains recorded
  and human-owned; `TP-B007-011`, Build Quality, Scope 01, packet status, and
  certification remain open and unchanged.

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
| `TP-B007-000` | Historical scenario-first pre-fix RED | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: prototype-sensitive completion keys are safe own keys` | The retained pre-implementation run executes the six direct exported cases and fails because unchanged source violates no-throw and built-in integrity while `finally` cleanup completes. This row is historical RED and must not be rerun as a GREEN proof. | Historical command: `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Required RED observed; historical only |
| `TP-B007-001` | Normal, refusal, and parent error compatibility | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: normal brief order and refusal precedence remain unchanged`; `SCN-008-046 every public boundary emits a closed value-safe PortfolioError` | Exact normal order and refusal precedence remain unchanged. Local brief errors and the parent public boundary retain the closed seven-field `PortfolioError/v1` shape. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Executed-passed; test-owned evidence reconciled |
| `TP-B007-002` | Subject-key adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: prototype-sensitive completion subjects are safe own keys` | The three direct exported subject cases are own keys with actual evidence/no-action behavior; each returns the declared result shape without throw or shared built-in mutation. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Executed-passed; test-owned evidence reconciled |
| `TP-B007-003` | Domain-key adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: prototype-sensitive completion domains are safe own keys` | The three direct exported domain cases use their actual support counts and distinct-date floors; each returns the declared result shape without throw or shared built-in mutation. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Executed-passed; test-owned evidence reconciled |
| `TP-B007-004` | Lookup, built-in, and cleanup regression | `functional` | No | `tests/portfolio-brief.functional.mjs` — `BUG-007: own lookup semantics and RED cleanup preserve shared built-ins` | Own hostile `owners`/`priorEvidenceIds` entries remain readable, inherited entries remain absent, `Object.prototype`, `Object`, and `Object.prototype.toString` remain unchanged, and cleanup is unconditional. | `timeout 240 node --test tests/portfolio-brief.functional.mjs` | Executed-passed; test-owned evidence reconciled |
| `TP-B007-005` | In-memory mutation mechanism causality | `unit` | No | `tests/portfolio-test-integrity.unit.mjs` — `BUG-007: represented mutants execute one protective assertion through one intended hook`; shared injector `tests/portfolio-defect-injector.cjs` | For every represented BUG-007 mutant, require one intended hook, one marker application, one selected protective test, and an `ERR_ASSERTION` origin with no injector/preload/anchor/syntax/module-load failure. Reject deliberate double application, preserve direct-text representation, retain uncoordinated zero-anchor refusal, and prove no tracked source or test write. | `timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs` | Executed-passed; test-owned evidence reconciled; not validate-certified |
| `TP-B007-012` | Canary: Shared-infrastructure independent canary and final-tree rollback oracle | `unit` | No | `tests/portfolio-test-integrity.unit.mjs` — `BUG-007: represented mutants execute one protective assertion through one intended hook`; shared injector `tests/portfolio-defect-injector.cjs` | Preserve the current test-owned canary result. Independently prove final-tree-safe reversibility in a disposable clone: current 1/1 pass; injector-only semantic inverse; one collected exact-title failure with zero passes and the old dual-hook zero-anchor or infrastructure-origin diagnostic; unchanged integrity and error-contract controls; byte-identical injector restore; restored 1/1 pass; unchanged operator worktree. | Current canary: `timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`. Rollback proof: execute `TP-B007-012 Semantic-Inverse Test-Owner Execution Handoff`. | Executed-passed by `bubbles.test`; complete semantic rollback/restore evidence at [test-owned route 014](report.md#bug007-shared-infrastructure-rollback-restore) |
| `TP-B007-006` | Scenario-specific Regression E2E | `e2e-ui` | Yes | `tests/portfolio-survival-brief.spec.mjs` — `BUG-007: browser composer treats hostile keys as data and visible constructor remains operable` | The real page runtime's exported composer passes all six direct hostile cases with no throw/mutation and exact order, while the real preview/confirm controls accept `constructor` and render it in the Brief without an uncaught page error. | `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Executed-passed; test-owned evidence reconciled |
| `TP-B007-007` | Broader Regression E2E | `e2e-ui` | Yes | Eight exact Feature 008 Playwright files listed by `CMD-B007-FEATURE-E2E` | All existing Feature 008 user workflows remain green. | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Executed-passed; test-owned evidence reconciled |
| `TP-B007-008` | Registry census and repository regression | `functional` | No | `scripts/selftest.mjs` — `Feature 008 PortfolioError registry covers every quoted production emitter` | Execute the committed persistent census assertion over `rlportfolio.js`, `rlportfoliobrief.js`, and `rlportfolioanalytics.js`; require the current 52 registered, 45 quoted-emitter, zero-missing invariant; then run the canonical selftest. | `timeout 1800 node scripts/selftest.mjs` | Executed-passed; final test-owned evidence records 52 registered, 45 quoted emitters, zero missing, and canonical selftest 3443/3443 |
| `TP-B007-009` | Planning and packet guard battery | `artifact` | No | Six exact `.github/bubbles/scripts/` guards listed by `CMD-B007-PACKET-GUARDS` | Artifact shape, traceability, all four scenario obligations, mechanism coherence, scope context fit, and capability-foundation proportionality are coherent. | See `test-plan.json` `CMD-B007-PACKET-GUARDS`. | Executed-passed in the current planner run; planning evidence only |
| `TP-B007-010` | Implementation reality guard | `guard` | No | `.github/bubbles/scripts/implementation-reality-scan.sh` over the BUG-007 packet and referenced implementation files | Referenced product/test/injector paths are real and the delivered source contains no stub or fabricated behavior. | `timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --verbose` | Executed-passed; test-owned evidence reconciled |
| `TP-B007-011` | Transition guard | `guard` | No | `.github/bubbles/scripts/state-transition-guard.sh` over the BUG-007 packet | Completion passes only after current implementation tests, human acceptance, validate-owned certification, and causal mutation proof are complete. A mutant process that fails before one selected protective assertion executes cannot satisfy transition evidence. | `timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys` | Authored guard carrier; planned for final validation only |

### TP-B007-012 Semantic-Inverse Test-Owner Execution Handoff

**Execution status:** Executed-passed by `bubbles.test`; evidence:
[final-tree-safe semantic rollback and restore](report.md#bug007-shared-infrastructure-rollback-restore).
This retained contract records the independently executed proof without
converting it into a planner execution claim.

1. In the operator checkout, record `timeout 60 git rev-parse HEAD`,
  `timeout 60 git status --short --untracked-files=all`, and
  `timeout 60 sha256sum tests/portfolio-defect-injector.cjs
  tests/portfolio-test-integrity.unit.mjs rlportfolio.js
  rlportfoliobrief.js tests/portfolio-brief.functional.mjs`.
2. Create a disposable clone or copy outside the operator checkout at that
  exact revision. Require `timeout 60 git status --short --untracked-files=all`
  to be empty. Record the same five hashes and compare them with the design's
  candidate-revision preconditions. Stop for design reconciliation if any
  protected byte differs.
3. Require the exact `TP-B007-012` title to occur once. Run
  `timeout 240 node --test
  --test-name-pattern='^BUG-007: represented mutants execute one protective
  assertion through one intended hook$'
  tests/portfolio-test-integrity.unit.mjs` and require one collected test,
  one pass, zero failures, zero skips, and zero cancellations.
4. In the disposable tree only, use the editor patch tool to apply the exact
  semantic inverse from `design.md#final-tree-safe-rollback-and-restore-contract`
  to `tests/portfolio-defect-injector.cjs`. Each named anchor must match once;
  any absent or duplicate anchor aborts the proof. Do not edit
  `tests/portfolio-test-integrity.unit.mjs`.
5. Require `timeout 60 git diff --name-only` to name only
  `tests/portfolio-defect-injector.cjs`, require `timeout 60 git diff --cached
  --name-only` to be empty, and recheck the unchanged integrity-carrier hash,
  all three `3688388d5` control hashes, and exact-title cardinality.
6. Run the exact selector from step 3 through evidence capture. In this
  intentionally reverted state, require a nonzero process result, exactly one
  collected top-level test, zero passes, one failure, the exact title, and the
  injector's zero-anchor or infrastructure-origin diagnostic. A pass, an empty
  selector, or a failure before the selected oracle executes fails the proof.
7. Restore only `tests/portfolio-defect-injector.cjs` from the disposable
  tree's captured final-tree baseline. Require all five hashes to equal step 2,
  `timeout 60 git diff --exit-code -- tests/portfolio-defect-injector.cjs
  tests/portfolio-test-integrity.unit.mjs rlportfolio.js rlportfoliobrief.js
  tests/portfolio-brief.functional.mjs` to exit zero, and both staged and
  unstaged status to be empty.
8. Rerun the exact selector from step 3 and require 1/1 passing with zero
  failures, skips, or cancellations. Re-record the operator checkout status
  and five hashes and require byte-for-byte equality with step 1.

### Test Plan To DoD Parity

| Test Plan row | Primary DoD item |
| --- | --- |
| `TP-B007-000` | Pre-fix persistent RED and cleanup are observed before implementation |
| `TP-B007-001` | `SCN-B007-NORMAL-COMPATIBILITY` holds |
| `TP-B007-002` | `SCN-B007-SUBJECT-KEY-SAFETY` holds |
| `TP-B007-003` | `SCN-B007-DOMAIN-KEY-SAFETY` holds |
| `TP-B007-004` | Lookup-map, built-in-integrity, and cleanup controls hold |
| `TP-B007-005` | In-memory mutation controls are load-bearing without tracked-source mutation |
| `TP-B007-012` | The protected shared injector passes an independent canary before broader mutation execution |
| `TP-B007-006` | Scenario-specific browser regression and visible `constructor` path pass |
| `TP-B007-007` | Broader E2E regression suite passes |
| `TP-B007-008` | Canonical repository selftest passes |
| `TP-B007-009` | Planning and packet guard battery passes |
| `TP-B007-010` | Implementation reality guard passes after delivery |
| `TP-B007-011` | Transition guard passes before certification |

### Definition of Done

#### Core Items

- [x] Root cause and the complete caller-keyed map inventory are confirmed. ->
  Evidence: [final input identity](report.md#bug007-final-input-identity-20260902),
  [focused behavior](report.md#bug007-recovery-tp-b007-001-004), and
  [implementation reality](report.md#bug007-recovery-tp-b007-010).
- [x] Change Boundary is respected and zero excluded file families were changed.
  Only the five declared committed batches and the three planner-owned artifacts
  are admitted; this planning rework changes no excluded product, test, parent-
  feature, sibling-bug, acceptance, certification, or terminal-status surface.
  Evidence: [final input identity](report.md#bug007-final-input-identity-20260902)
  and [recovery carrier integrity](report.md#bug007-recovery-carrier-quality-20260902).
- [x] `TP-B007-000` records the persistent pre-fix RED result before source
  implementation and proves cleanup after every hostile attempt. Evidence:
  [historical RED](report.md#tp-b007-000) and
  [current provenance adjudication](report.md#bug007-tp-b007-000-current-adjudication).
- [x] `SCN-B007-NORMAL-COMPATIBILITY` holds through `TP-B007-001`: normal lane
  and subject order plus representative refusal precedence remain unchanged,
  and both exact current titles retain the parent's closed seven-field
  `PortfolioError/v1` invariant.
  Evidence: [recovery functional 34/34](report.md#bug007-recovery-tp-b007-001-004).
- [x] `SCN-B007-SUBJECT-KEY-SAFETY` holds through `TP-B007-002`: all three
  subject keys are own data, return without throw, preserve absent lookup-map
  semantics, and mutate no shared built-in. Evidence:
  [recovery functional 34/34](report.md#bug007-recovery-tp-b007-001-004).
- [x] `SCN-B007-DOMAIN-KEY-SAFETY` holds through `TP-B007-003`: all three
  domain keys use their actual support floors, return without throw, and mutate
  no shared built-in. Evidence:
  [recovery functional 34/34](report.md#bug007-recovery-tp-b007-001-004).
- [x] `TP-B007-004` proves cleanup is unconditional and restoring ordinary maps
  own/inherited caller-map semantics and shared built-in integrity hold.
  Evidence: [recovery functional 34/34](report.md#bug007-recovery-tp-b007-001-004).
- [x] `SCN-B007-MUTATION-MECHANISM-CAUSALITY` holds through `TP-B007-005`:
  each represented BUG-007 mutant uses its declared hook exactly once, its
  marker records one application, exactly one selected protective test runs,
  and the failure originates from that test's protective assertion rather than
  injector, preload, anchor, syntax, or module-load setup. The deliberate
  double application is rejected, the separate `fs.readFileSync` text carrier
  remains effective, representative map/own-property/order mutants fail their
  exact assertions, and no tracked product source or unrelated test file is
  written. Evidence: [recovery mutation causality](report.md#bug007-recovery-tp-b007-005)
  and [carrier quality](report.md#bug007-recovery-carrier-quality-20260902).
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns.
  The distinct `TP-B007-012` canary confirms the require and direct-text carrier
  families each retain one intended hook, one marker application, and assertion-
  origin failure, while deliberate double application is refused.
  Evidence: [recovery mutation causality](report.md#bug007-recovery-tp-b007-005)
  and [carrier quality](report.md#bug007-recovery-carrier-quality-20260902).
- [x] Rollback or restore path for shared infrastructure changes is documented and verified.
  `TP-B007-012` applies only the bounded semantic inverse to the injector in a
  disposable clone or copy. It preserves the integrity carrier as the
  independent oracle, expects the unchanged canary to detect the intentionally
  restored old-state dual-hook failure, verifies all later integrity and
  error-contract controls remain byte-identical, restores the exact final tree,
  and reruns the current canary 1/1. Evidence: [test-owned final-tree-safe
  semantic rollback and restore](report.md#bug007-shared-infrastructure-rollback-restore).
- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  pass through `TP-B007-006`, including all six direct exported browser cases
  and the real visible `constructor` recorder path. Evidence:
  [recovery scenario browser 19/19](report.md#bug007-recovery-tp-b007-006).
- [x] Broader E2E regression suite passes through `TP-B007-007`. Evidence:
  [recovery eight-file browser matrix 95/95](report.md#bug007-recovery-tp-b007-007).
- [x] `TP-B007-008` passes the committed persistent emitted-to-registered census
  assertion, proves the committed 52 registered, 45 quoted-emitter, zero-
  missing invariant, and passes the canonical repository selftest. Evidence:
  [final-tree census and canonical selftest 3443/3443](report.md#bug007-final-tp-b007-008-20260902).
- [x] `TP-B007-009` planning and packet guard battery passes. Evidence:
  [recovery six-guard battery](report.md#bug007-recovery-tp-b007-009).
- [x] `TP-B007-010` implementation-reality scan passes after source and
  persistent tests are delivered. Evidence: `report.md#tp-b007-010`.
  [recovery six-file scan](report.md#bug007-recovery-tp-b007-010).
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
  > **What was observed:** Test-owned rollback/restore closure and the current planning guards are green; hardening and transition certification remain open.
  > **Why this is uncertain:** The grouped gate cannot close before all constituent execution and validation rows close.
  > **What would resolve this:** Complete hardening and the remaining quality phases, then run validate-owned transition checks.

Sixteen evidence-backed items are checked. `TP-B007-011` and the Build Quality
Gate remain unchecked. The plan reconciles test-owned closure without claiming
planner execution, certification, scope completion, or terminal status.
