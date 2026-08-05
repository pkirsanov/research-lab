# Scope 02 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 02 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-02-01

**Phase:** implement

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-01,green timeout 300 bash .github/bubbles/scripts/tool-log.sh node --test tests/portfolio-foundation.unit.mjs`

**Exit Code:** 0

**Claim Source:** executed

```text
TAP version 13
# Subtest: RLPORTFOLIO is a frozen Node and browser dual-runtime contract
ok 1 - RLPORTFOLIO is a frozen Node and browser dual-runtime contract
  ---
  duration_ms: 19.778695
  type: 'test'
  ...
# Subtest: mandatory policy is closed versioned finite and rejects unknown configuration
ok 2 - mandatory policy is closed versioned finite and rejects unknown configuration
  ---
  duration_ms: 4.326356
  type: 'test'
  ...
# Subtest: holding revision and workspace identities are strict deterministic contracts
ok 3 - holding revision and workspace identities are strict deterministic contracts
  ---
  duration_ms: 76.350607
  type: 'test'
  ...
# Subtest: valid CSV preview exposes accepted normalized and unresolved duplicate states before confirmation
ok 4 - valid CSV preview exposes accepted normalized and unresolved duplicate states before confirmation
  ---
  duration_ms: 2.88137
  type: 'test'
  ...
# Subtest: duplicate choices are explicit and row removal can create a valid new preview
ok 5 - duplicate choices are explicit and row removal can create a valid new preview
  ---
  duration_ms: 7.010727
  type: 'test'
  ...
# Subtest: unknown import fields remain blocking through duplicate resolution
ok 6 - unknown import fields remain blocking through duplicate resolution
  ---
  duration_ms: 2.598473
  type: 'test'
  ...
# Subtest: secret-shaped import rejects the full draft with value-safe PortfolioError values
ok 7 - secret-shaped import rejects the full draft with value-safe PortfolioError values
  ---
  duration_ms: 1.385785
  type: 'test'
  ...
# Subtest: manual alternatives require valuation liquidity cost and uncertainty truth
ok 8 - manual alternatives require valuation liquidity cost and uncertainty truth
  ---
  duration_ms: 1.851681
  type: 'test'
  ...
# Subtest: manual listed drafts use the same closed preview contract as file imports
ok 9 - manual listed drafts use the same closed preview contract as file imports
  ---
  duration_ms: 1.753882
  type: 'test'
  ...
# Subtest: atomic durable commits use inactive slots verify bytes and reject generation conflicts
ok 10 - atomic durable commits use inactive slots verify bytes and reject generation conflicts
  ---
  duration_ms: 27.046619
  type: 'test'
  ...
# Subtest: clearing a portfolio is an atomic revision-state change that preserves immutable history
ok 11 - clearing a portfolio is an atomic revision-state change that preserves immutable history
  ---
  duration_ms: 41.496469
  type: 'test'
  ...
# Subtest: slot and pointer faults preserve the last-known-good revision
ok 12 - slot and pointer faults preserve the last-known-good revision
  ---
  duration_ms: 38.115304
  type: 'test'
  ...
# Subtest: post-write slot corruption is detected before pointer publication
ok 13 - post-write slot corruption is detected before pointer publication
  ---
  duration_ms: 22.688664
  type: 'test'
  ...
# Subtest: future records remain untouched and durable session memory states are explicit
ok 14 - future records remain untouched and durable session memory states are explicit
  ---
  duration_ms: 3.80286
  type: 'test'
  ...
# Subtest: unknown legacy workspace shapes refuse migration and quarantine metadata is value-safe
ok 15 - unknown legacy workspace shapes refuse migration and quarantine metadata is value-safe
  ---
  duration_ms: 1.618583
  type: 'test'
  ...
# Subtest: foundation privacy inventory and verified clear remain available without policy config
ok 16 - foundation privacy inventory and verified clear remain available without policy config
  ---
  duration_ms: 1.446785
  type: 'test'
  ...
# Subtest: explicit mandate draft is a closed user-authority contract over units dates currencies and hard research classification
ok 17 - explicit mandate draft is a closed user-authority contract over units dates currencies and hard research classification
  ---
  duration_ms: 10.54129
  type: 'test'
  ...
# Subtest: absent mandate fields stay null and no default horizon floor objective or expected return is created
ok 18 - absent mandate fields stay null and no default horizon floor objective or expected return is created
  ---
  duration_ms: 11.984475
  type: 'test'
  ...
# Subtest: conflicting mandate stays infeasible with every declared constraint and cash need preserved in declared order
ok 19 - conflicting mandate stays infeasible with every declared constraint and cash need preserved in declared order
  ---
  duration_ms: 4.654651
  type: 'test'
  ...
# Subtest: mandate revision identity is deterministic supersedes the prior mandate and never mutates the portfolio
ok 20 - mandate revision identity is deterministic supersedes the prior mandate and never mutates the portfolio
  ---
  duration_ms: 69.589178
  type: 'test'
  ...
# Subtest: behavior events interest signals and display settings cannot create or modify any mandate field
ok 21 - behavior events interest signals and display settings cannot create or modify any mandate field
  ---
  duration_ms: 3.491864
  type: 'test'
  ...
# Subtest: route projection cites one mandate revision and reports mandate-absent states without inventing values
ok 22 - route projection cites one mandate revision and reports mandate-absent states without inventing values
  ---
  duration_ms: 68.000695
  type: 'test'
  ...
1..22
# tests 22
# suites 0
# pass 22
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 654.221912
[tool-log] recorded exit=0 duration=787ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
```

**Clause-by-clause coverage of the DoD item.** Every clause maps to a named passing subtest whose body was read, not just its title:

| DoD clause | Proving subtest | Assertion substance |
|---|---|---|
| closed mandate/cash-need authority | 17 | `contractVersion === 'portfolio-mandate-preview/v1'`; rejects `unknown-field`, `horizon-invalid`, `horizon-not-future`, `valuation-currency-invalid`, `constraint-unit-invalid`, `constraint-authority-invalid`, `cash-need-timing-invalid`; every constraint and cash need carries `inputAuthority === 'user'` |
| absence | 18 | `absentFields` is exactly `costPolicy, expectedReturnPolicy, rebalancePolicy, survivalDefinition`; all four stay `null` through `buildMandateCandidate`; empty-workspace route projection has every `inferredValues` entry `null` and `horizon === null` |
| identity | 20 | repeat build yields an identical `sha256:[a-f0-9]{64}` id; `supersedes` chains to the prior mandate; `mandate-identity-mismatch` on field rewrite; `currentPortfolioId` and `portfolioRevisions` unchanged |
| conflicts | 19 | `canConfirm === false` with exactly `cash-need-after-horizon`, `cash-need-currency-unavailable`, `cash-need-declared-order-invalid`, `constraint-bounds-conflict`; all 2 constraints and 3 cash needs preserved in declared order; `buildMandateCandidate` refuses with `P008-MANDATE-SHAPE` |
| behavior/settings exclusion | 21 | `behaviorEvents`, `interestSignals`, `actionOutcomes`, `settings` each refused with `P008-MANDATE-AUTHORITY` / `forbidden-input-source`; refusal payload echoes no value; `impact.behaviorContribution === 'none'` and `impact.settingsContribution === 'none'` |

Assertions call production `RLPORTFOLIO` functions (`validateMandateDraft`, `buildMandateCandidate`, `validateMandateRevision`, `projectRouteStates`, `createPortfolioStore`) — no test-local reimplementation.

### TP-02-02

**Phase:** implement

#### Earlier run (SUPERSEDED — kept for the audit trail)

The block below is the first TP-02-02 execution. Its verdict was correct when
written: the named target file then held only the five Scope 01 subtests and no
mandate coverage at all. It is superseded by the RED/GREEN evidence that follows,
which executes the same command against the file's current content. It is retained
rather than deleted so the verdict change is auditable.

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-02,green timeout 300 bash .github/bubbles/scripts/tool-log.sh node --test tests/portfolio-privacy.functional.mjs`

**Exit Code:** 0

**Claim Source:** executed

```text
TAP version 13
# Subtest: real-format import previews commits reloads and exports one local revision
ok 1 - real-format import previews commits reloads and exports one local revision
  ---
  duration_ms: 60.560182
  type: 'test'
  ...
# Subtest: secret-bearing import is redacted and cannot mutate any storage namespace
ok 2 - secret-bearing import is redacted and cannot mutate any storage namespace
  ---
  duration_ms: 9.961616
  type: 'test'
  ...
# Subtest: atomic write failures preserve the active pointer and retain a validated candidate only in memory
ok 3 - atomic write failures preserve the active pointer and retain a validated candidate only in memory
  ---
  duration_ms: 25.063837
  type: 'test'
  ...
# Subtest: session and memory commits state truthfully and preserve the last valid candidate after rejection
ok 4 - session and memory commits state truthfully and preserve the last valid candidate after rejection
  ---
  duration_ms: 26.267915
  type: 'test'
  ...
# Subtest: hostile manual labels remain inert data and namespace writes stay closed
ok 5 - hostile manual labels remain inert data and namespace writes stay closed
  ---
  duration_ms: 6.375283
  type: 'test'
  ...
1..5
# tests 5
# suites 0
# pass 5
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 284.726843
[tool-log] recorded exit=0 duration=407ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
```

**Coverage probe of the same file:**

**Command:** `grep -c -i "mandate" tests/portfolio-privacy.functional.mjs` then `grep -n -i -E "mandate|cashNeed|constraint|projectRouteStates" tests/portfolio-privacy.functional.mjs`

**Exit Code:** 1 (grep: no match) for both probes; the count probe printed `0`

**Claim Source:** executed

```text
0
GREP_EXIT=1
DETAIL_EXIT=1
```

**Earlier verdict (now superseded): DoD item NOT satisfied.** The command was green, but a green exit code is not evidence of the clause. The DoD item requires functional evidence that "proves atomic mandate round trips and one unchanged constraint set across every consumer". `tests/portfolio-privacy.functional.mjs` then contained 5 subtests, all of them Scope 01 import/redaction/atomic-pointer/namespace behavior, and contained **zero** occurrences of `mandate`, `cashNeed`, `constraint`, or `projectRouteStates`.

#### Clause-to-assertion map

Each clause of the DoD item is carried by exactly one named `node:test` case in
`tests/portfolio-privacy.functional.mjs`. Neither clause is spread across
unnamed helpers.

| DoD clause | Named assertion carrying it |
|------------|-----------------------------|
| atomic mandate round trips | `explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved` |
| one unchanged constraint set across every consumer | `one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults` |

**Clause 1, both halves.** *Write then read back yields the same mandate*: the
mandate is committed through the real store, its id is asserted present in the
durable bytes, then a **new** store instance reloads from those bytes and the
reloaded revision set is compared to the committed one. *A rejected write leaves
the prior mandate exactly intact*: the whole durable image is captured before a
generation-conflicting commit and compared byte-for-byte afterwards, the rejected
candidate's mandate id is asserted absent from durable storage, and a fresh reload
must return the prior revision set, generation, and portfolio revisions unchanged.
An unchanged pointer alone is deliberately not accepted as proof, because a
half-applied commit can land a slot write and still leave the pointer untouched.

**Clause 2, enumerated not sampled.** The consumer list is read from
`policy.mandate.descriptiveRouteStates` rather than from a literal in the test, so
a consumer the projection drops or invents fails the comparison instead of going
unnoticed; a guard also fails if that declaration ever shrinks to a single
consumer, which would make an "across every consumer" claim vacuous. A superseding
mandate revision is then committed, so two different constraint sets exist in
storage at once and the claim stops being trivially true. For every consumer, that
consumer's own `horizon`, `constraints`, and `cashNeeds` are substituted back into
the stored revision and revalidated through the production `validateMandateRevision`,
which recomputes both the semantic and the identity fingerprint. Per-consumer drift
therefore fails on identity rather than passing a shape-only comparison. The
resulting identity strings are collapsed to a set whose size must be exactly one,
and that one identity must be the **current** revision's, not the superseded one.

#### RED (intended failure, same command)

The RED was produced by two deliberate defects injected into `rlportfolio.js` and
reverted immediately after capture, to prove the assertions are not vacuous. Both
defects were chosen specifically because **every pre-existing assertion stays green
under them** — the failures land only on the assertions added for this item, which
is what demonstrates the previous coverage could not carry these clauses.

- Clause 1 defect: the durable commit path writes the prepared candidate into the inactive slot *before* returning the generation-conflict failure — a partial application that leaves the pointer, and therefore the reloaded `currentMandateId`, correct.
- Clause 2 defect: the current-revision resolver returns `mandateRevisions[0]` instead of matching `currentMandateId`, so consumers observe the superseded constraint set while every single-revision assertion still passes.

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-02,red timeout 300 bash .github/bubbles/scripts/tool-log.sh node --test tests/portfolio-privacy.functional.mjs`

**Exit Code:** 1 · **Claim Source:** executed

```text
# Subtest: explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved
not ok 6 - explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved
  ---
  duration_ms: 43.6606
  type: 'test'
  location: '/home/redacted/research-lab/tests/portfolio-privacy.functional.mjs:154:1'
  failureType: 'testCodeFailure'
  error: |-
    a rejected mandate write must not change one durable byte

    false !== true

  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: true
  actual: false
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///home/redacted/research-lab/tests/portfolio-privacy.functional.mjs:210:10)
  ...
# Subtest: one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults
not ok 7 - one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults
  ---
  duration_ms: 56.204599
  type: 'test'
  location: '/home/redacted/research-lab/tests/portfolio-privacy.functional.mjs:236:1'
  failureType: 'testCodeFailure'
  error: |-
    allocation must reproduce the current stored mandate identity

    false !== true

  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: true
  actual: false
  operator: 'strictEqual'
  stack: |-
    file:///home/redacted/research-lab/tests/portfolio-privacy.functional.mjs:340:12
    Array.map (<anonymous>)
    TestContext.<anonymous> (file:///home/redacted/research-lab/tests/portfolio-privacy.functional.mjs:337:64)
  ...
1..7
# tests 7
# suites 0
# pass 5
# fail 2
# cancelled 0
# skipped 0
# todo 0
# duration_ms 393.348596
[tool-log] recorded exit=1 duration=482ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
TP_02_02_RED_EXIT=1
```

Both failures are assertion failures on booleans with named messages, not payload
diffs, so a RED capture cannot spill stored mandate content into this tracked file.
Subtests 1 through 5 stayed green, and inside subtests 6 and 7 every assertion that
predates this item also stayed green — the first failure in each is at the newly
added assertion.

#### GREEN (same command, defects reverted)

The defects were reverted with `git checkout -- rlportfolio.js`;
`git status --porcelain -- rlportfolio.js` then returned empty, so the production
module is byte-identical to `HEAD` and no mutation-proof scaffolding survives in
the tree.

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-02,green timeout 300 bash .github/bubbles/scripts/tool-log.sh node --test tests/portfolio-privacy.functional.mjs`

**Exit Code:** 0 · **Claim Source:** executed

```text
TAP version 13
# Subtest: real-format import previews commits reloads and exports one local revision
ok 1 - real-format import previews commits reloads and exports one local revision
# Subtest: secret-bearing import is redacted and cannot mutate any storage namespace
ok 2 - secret-bearing import is redacted and cannot mutate any storage namespace
# Subtest: atomic write failures preserve the active pointer and retain a validated candidate only in memory
ok 3 - atomic write failures preserve the active pointer and retain a validated candidate only in memory
# Subtest: session and memory commits state truthfully and preserve the last valid candidate after rejection
ok 4 - session and memory commits state truthfully and preserve the last valid candidate after rejection
# Subtest: hostile manual labels remain inert data and namespace writes stay closed
ok 5 - hostile manual labels remain inert data and namespace writes stay closed
# Subtest: explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved
ok 6 - explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved
  ---
  duration_ms: 49.868431
  type: 'test'
  ...
# Subtest: one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults
ok 7 - one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults
  ---
  duration_ms: 57.840421
  type: 'test'
  ...
1..7
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 423.28052
[tool-log] recorded exit=0 duration=515ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
TP_02_02_GREEN_EXIT=0
```

**Verdict: DoD item SATISFIED — box ticked.** Both clauses are carried by named
assertions, each proven non-vacuous by a same-command RED it detects and a
pre-existing-assertion set that does not.

**Scope of this claim.** This closes TP-02-02 only. No other DoD box was touched,
and no claim is made here about the Core Delivery items or the Build Quality Gate.

### TP-02-03

**Phase:** implement

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-03,green,SCN-008-003 timeout 600 bash .github/bubbles/scripts/tool-log.sh npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-003 explicit mandate alone supplies every hard constraint" --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

```text
Running 1 test using 1 worker

[SCN-008-003] mandateId=sha256:acf8af8a49927b400f109579609edc00c782e5a4c22fbddfde0d8dfe467b61c9
[SCN-008-003] portfolioUnchanged=true
[SCN-008-003] hardConstraints=2
[SCN-008-003] researchConstraints=0
[SCN-008-003] cashNeeds=1
[SCN-008-003] absentFields=4
[SCN-008-003] routesCiting=3
[SCN-008-003] behaviorContribution=none
[SCN-008-003] behaviorDraftRefused=P008-MANDATE-AUTHORITY
[SCN-008-003] mandateUnchangedAfterNoise=true
[SCN-008-003] remotePersonalRequests=0
  ✓  1 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:86:1 › Regression: SCN-008-003 explicit mandate alone supplies every hard constraint (3.0s)

  1 passed (6.1s)
[tool-log] recorded exit=0 duration=9319ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
```

**Clause-by-clause coverage of the DoD item.** The test body was read to confirm the assertions are user-visible, not console proxies:

| DoD clause | Proving assertion |
|---|---|
| "displays" | DOM assertions, not evaluated state: `expect(panel.locator('[data-constraints]')).toContainText('MSFT')` / `'0.25'` / `'BND'` / `'0.1'`, and `[data-cash-needs]` containing `2031-06-30` and `40000` |
| "only explicit user-entered" | every projected constraint and cash need asserts `inputAuthority === 'user'`; the `mandate-behavior-noise.json` draft is refused in the UI with `P008-MANDATE-AUTHORITY` + `forbidden-input-source` and `#confirmMandate` disabled; post-noise projection still shows exactly `['BND','MSFT']`; `JSON.stringify(routeStates)` must not match `/XOM\|commodity-carry\|energy\|shockMagnitude/i` |
| "hard constraints" | `#mandateHard` is `2` and `#mandateResearch` is `0` |
| "across dependent route states" | loops all 3 `MANDATE_ROUTES` (`risk-xray`, `path-lab`, `allocation`) × all 4 `MANDATE_DEPENDENT_STATES` (`cash-need-collision`, `constraint-feasibility`, `goal-fit`, `survival-to-goal`), asserting each shows `Available` and cites `currentMandateId` |
| no hidden values | all 5 `NEVER_INFERRED_FIELDS` (`expectedReturn`, `horizon`, `liquidityNeed`, `riskTolerance`, `survivalFloor`) assert `null` per route |

**Live-stack authenticity:** the suite drives a real local HTTP server (`startPortfolioServer`), a real `page.goto`, and real `setInputFiles` uploads. The file contains no `page.route`, `context.route`, or `intercept` call, so this is a genuine `e2e-ui` row. It additionally asserts no personal value leaves the browser: every observed request is `GET` and the serialized request log must not match `/MSFT|BND|40000|2031-06-30|objectiveLabel/i`.

### TP-02-04

**Phase:** implement

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-04,green,SCN-008-004 timeout 600 bash .github/bubbles/scripts/tool-log.sh npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable" --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

```text
Running 1 test using 1 worker

[SCN-008-004] currentMandateId=null
[SCN-008-004] descriptiveAvailable=true
[SCN-008-004] goalFit=unavailable:mandate-absent
[SCN-008-004] survivalToGoal=unavailable:mandate-absent
[SCN-008-004] constraintFeasibility=unavailable:mandate-absent
[SCN-008-004] cashNeedCollision=unavailable:mandate-absent
[SCN-008-004] inferredValues=0
[SCN-008-004] placeholderNumbers=0
[SCN-008-004] routes=3
  ✓  1 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:177:1 › Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable (2.1s)

  1 passed (5.4s)
[tool-log] recorded exit=0 duration=7596ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
```

**Clause-by-clause coverage of the DoD item:**

| DoD clause | Proving assertion |
|---|---|
| "retains descriptive research" | for each of the 3 routes, `[data-descriptive]` asserts `Available` and contains `currentPortfolioId`; projection asserts `descriptive.available === true` with the same cited portfolio id |
| "shows unavailable goal fit/survival" | for each route × each of the 4 dependent states, `[data-state]` asserts `Unavailable` **and** the exact reason `mandate-absent`, and asserts it does **not** contain `sha256:` (nothing may be cited when nothing exists) |
| "with no hidden values" | `[data-inferred]` asserts `No inferred values` plus `<field>=absent` for all 5 `NEVER_INFERRED_FIELDS`; `[data-constraints]` asserts `No user-entered constraint`; `[data-cash-needs]` asserts `No user-entered cash need`; projection asserts `constraints === []`, `cashNeeds === []`, `horizon === null`, `citedMandateFingerprint === null` |

**Adversarial strength (not a silent pass):** the test asserts the rendered `#routeStates` text does **not** match `/\b(0%|0\.0|TBD|N\/A|default|assumed|typical)\b/i`. A regression that rendered an absent goal as a neutral zero or a placeholder — the exact failure mode SCN-008-004 exists to prevent — fails this row rather than passing it. There are no early returns or conditional skips in the test body.

**Re-run confirmation (2026-08-04T22:31:21Z).** The row was re-executed unchanged before its DoD item was checked, because `tests/portfolio-survival-foundation.spec.mjs` was modified after the original evidence was captured. It is still green at exit 0. The re-run emits one additional assertion line absent from the original capture, `[SCN-008-004] educationalBoundary=visible`, which is a strengthened assertion and not a relaxed one; every clause in the table above still holds.

```text
Running 1 test using 1 worker

[SCN-008-004] currentMandateId=null
[SCN-008-004] descriptiveAvailable=true
[SCN-008-004] goalFit=unavailable:mandate-absent
[SCN-008-004] survivalToGoal=unavailable:mandate-absent
[SCN-008-004] constraintFeasibility=unavailable:mandate-absent
[SCN-008-004] cashNeedCollision=unavailable:mandate-absent
[SCN-008-004] inferredValues=0
[SCN-008-004] placeholderNumbers=0
[SCN-008-004] educationalBoundary=visible
[SCN-008-004] routes=3
  ✓  1 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:177:1 › Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable (1.7s)

  1 passed (3.8s)
[tool-log] recorded exit=0 duration=5265ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
TP_02_04_EXIT=0
```

### TP-02-05

**Phase:** implement

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-05,green,SCN-008-001,SCN-008-002,SCN-008-003,SCN-008-004 timeout 900 bash .github/bubbles/scripts/tool-log.sh npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

```text
Running 6 tests using 1 worker

[SCN-008-003] mandateId=sha256:acf8af8a49927b400f109579609edc00c782e5a4c22fbddfde0d8dfe467b61c9
[SCN-008-003] portfolioUnchanged=true
[SCN-008-003] hardConstraints=2
[SCN-008-003] researchConstraints=0
[SCN-008-003] cashNeeds=1
[SCN-008-003] absentFields=4
[SCN-008-003] routesCiting=3
[SCN-008-003] behaviorContribution=none
[SCN-008-003] behaviorDraftRefused=P008-MANDATE-AUTHORITY
[SCN-008-003] mandateUnchangedAfterNoise=true
[SCN-008-003] remotePersonalRequests=0
  ✓  1 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:86:1 › Regression: SCN-008-003 explicit mandate alone supplies every hard constraint (1.7s)
[SCN-008-004] currentMandateId=null
[SCN-008-004] descriptiveAvailable=true
[SCN-008-004] goalFit=unavailable:mandate-absent
[SCN-008-004] survivalToGoal=unavailable:mandate-absent
[SCN-008-004] constraintFeasibility=unavailable:mandate-absent
[SCN-008-004] cashNeedCollision=unavailable:mandate-absent
[SCN-008-004] inferredValues=0
[SCN-008-004] placeholderNumbers=0
[SCN-008-004] educationalBoundary=visible
[SCN-008-004] routes=3
  ✓  2 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:177:1 › Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable (1.3s)
[SCN-008-003-conflict] conflicts=4
[SCN-008-003-conflict] confirmDisabled=true
[SCN-008-003-conflict] declaredConstraintsPreserved=2
[SCN-008-003-conflict] declaredCashNeedsPreserved=3
[SCN-008-003-conflict] declaredOrderPreserved=true
[SCN-008-003-conflict] currentMandateUnchanged=true
[SCN-008-003-conflict] currentPortfolioUnchanged=true
[SCN-008-003-conflict] constraintsRelaxed=0
  ✓  3 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:245:1 › Regression: SCN-008-003 conflicting mandate stays visibly infeasible with no constraint relaxed (891ms)
[SCN-008-001] route=served
[SCN-008-001] previewAccepted=3
[SCN-008-001] duplicateChoice=merge
[SCN-008-001] generation=1
[SCN-008-001] revisions=1
[SCN-008-001] holdings=2
[SCN-008-001] storageMode=durable
[SCN-008-001] localKeys=rlPortfolioWorkspaceV1.pointer,rlPortfolioWorkspaceV1.slotA
[SCN-008-001] remoteRequests=0
  ✓  4 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:284:1 › Regression: SCN-008-001 valid local portfolio import creates one current revision (756ms)
[SCN-008-002] confirmation=disabled
[SCN-008-002] redaction=value-not-echoed
[SCN-008-002] generation=1
[SCN-008-002] currentUnchanged=true
[SCN-008-002] storageSentinel=false
[SCN-008-002] consoleSentinel=false
[SCN-008-002] urlSentinel=false
[SCN-008-002] requestSentinel=false
  ✓  5 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:324:1 › Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted (741ms)
[TP-01-05] modes=durable:1:durable,session:1:session,memory:1:memory
[TP-01-05] durable=true
[TP-01-05] session=true
[TP-01-05] memory=true
[TP-01-05] priorRevisionPreserved=true
[TP-01-05] falseDurableClaim=false
[TP-01-05] sessionWarning=true
[TP-01-05] externalProviders=0
  ✓  6 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:365:1 › Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes (2.0s)

  6 passed (9.7s)
[tool-log] recorded exit=0 duration=11208ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
TP_02_05_EXIT=0
```

**Clause-by-clause coverage of the DoD item.** The item requires broader E2E evidence that "the cumulative foundation route remains green after mandate/cash-need behavior lands":

| DoD clause | Proving observation |
|---|---|
| "broader E2E evidence" | The row runs the whole spec file with no `--grep`, so all 6 tests execute, not the 2 mandate-specific rows covered by TP-02-03/TP-02-04. The reporter line `Running 6 tests using 1 worker` and the terminal `6 passed` confirm the full count. |
| "cumulative foundation route" | The suite spans both scopes: tests 1-3 are Scope 02 mandate behavior (SCN-008-003, SCN-008-004, and the conflict row), while tests 4-6 are the Scope 01 foundation rows (SCN-008-001 import, SCN-008-002 redaction, TP-01-05 durable/session/memory atomic slots). |
| "remains green" | Exit code 0; `6 passed`; zero failed, zero skipped, zero flaky. No test was filtered out. |
| "after mandate/cash-need behavior lands" | The Scope 01 rows pass in the same process as the mandate rows, against the current `rlportfolio.js` that already contains the mandate contract. Test 4 still reports `generation=1`, `revisions=1`, `holdings=2`, and exactly the two storage keys `rlPortfolioWorkspaceV1.pointer,rlPortfolioWorkspaceV1.slotA` — i.e. the mandate additions introduced no extra storage namespace and did not perturb portfolio generation semantics. Test 6 still reports `priorRevisionPreserved=true` and `falseDurableClaim=false`. |

This is the specific regression risk the row exists to catch: Scope 02 writes to the same workspace store Scope 01 owns, so a mandate commit that bumped the portfolio generation, added a storage key, or broke the atomic pointer would surface as a Scope 01 failure here even though the mandate-only rows stayed green.

**Live-stack authenticity:** verified by scan, not assumed. `grep -n 'page\.route\|context\.route\|intercept(\|cy\.intercept\|msw\|nock\|wiremock' tests/portfolio-survival-foundation.spec.mjs` returned exit 1 with no matches, so nothing is intercepted and this is a genuine `e2e-ui` row. The suite drives a real local HTTP server (`startPortfolioServer`), real `page.goto` navigation, and real `setInputFiles` uploads. A bailout scan for `return;` early exits also returned exit 1 with no matches, so no test can silently pass by skipping its assertions.

**Scope of this claim.** This row proves the cumulative browser suite is green and that Scope 01 behavior is preserved. It does not close TP-02-02, whose box remains unchecked and untouched by this run. TP-02-02 was explicitly excluded from this run's assignment and was not executed here, so no claim is made about its current status in either direction. One observation is recorded for its owner rather than acted on: `tests/portfolio-privacy.functional.mjs` has since gained two uncommitted subtests, `explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved` and `one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults`, which name the two clauses the TP-02-02 verdict above recorded as uncovered. That verdict may therefore be stale. Confirming it requires executing TP-02-02, which this run did not do.

## Scenario Contract Evidence

### Scenario SCN-008-003

### Scenario SCN-008-004

## Coverage Report

## Lint And Quality

### Build Quality Gate - scope-local traceability (BLOCKED, not closed)

The Build Quality Gate DoD item names exactly one runnable command of its own. It
was executed as written. It refused. The box remains `[ ]`.

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=build-quality-gate,traceability,current-scope timeout 600 bash .github/bubbles/scripts/tool-log.sh bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

**Exit Code:** 2 · **Claim Source:** executed

```text
ERROR: scope-universe resolution refused (--current-scope):
scope-universe-resolver: transitive prerequisite '1' of current scope is not done
[tool-log] recorded exit=2 duration=54ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
TRACEABILITY_EXIT=2
```

Re-executed unwrapped to establish that the refusal is deterministic rather than a
transient resolver fault:

```text
=== re-run to confirm determinism ===
ERROR: scope-universe resolution refused (--current-scope):
scope-universe-resolver: transitive prerequisite '1' of current scope is not done
RERUN_EXIT=2
```

**Cause, verified rather than inferred.** The DoD precondition that this scope be
active in `state.json` holds — `execution.currentScope` is `2` and
`execution.activeAgent` is `bubbles.implement`. The refusal is not about this
scope's own files. It is the dependency edge: scope 2 declares
`dependsOn: ["1"]`, and scope 1 `Private Portfolio Import And Atomic Store` is
still `in_progress`, not `done`. Read directly from `state.json`:

```text
currentScope: 2
activeAgent: bubbles.implement
1 | in_progress | Private Portfolio Import And Atomic Store | dependsOn= []
2 | in_progress | Mandate And Cash-Need Authority | dependsOn= ['1']
3 | not_started | Local Behavior Privacy Inventory And Clear | dependsOn= ['2']
```

**Uncovered clause:** `scope-local traceability`. It is structurally unreachable
from inside Scope 02. No Scope 02 change can satisfy it, because the resolver is
refusing on a prerequisite scope's status, not on anything this scope owns.

**Two things deliberately NOT done here**, because each would have converted a
real blocker into a false green:

1. Scope 1 was not marked `done` to unblock the resolver. Its own DoD is unmet;
   editing another scope's status to clear this gate would be fabrication and is
   outside this agent's artifact ownership.
2. `--all-scopes` was not substituted for `--current-scope`. That is a different
   command answering a different question, and this scope's DoD explicitly states
   whole-feature `--all-scopes` traceability is NOT required here — it is the
   Feature Completion Gate's check, enforced once in Scope 16.

The remaining twelve clauses of the Build Quality Gate (focused RED/GREEN records,
mandate/config parity, authority/forbidden-input scans, exact rollback,
no-interception/external-request scan, source-lock/runner checks, editor
diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD
parity, plan sync) were not executed in this run. Their status is therefore
unknown and no claim is made about them in either direction. The item cannot be
ticked on the named clause alone regardless, since that clause is the one that
refused.

## Uncertainty Declarations

### TP-02-02 skip rationale is stale (observation for the owner, not acted on)

This run was instructed to skip TP-02-02 on the stated ground that its named
target file `tests/portfolio-privacy.functional.mjs` contains zero
`mandate`/`cashNeed`/`constraint` occurrences and that this is a known planning
defect. That ground no longer holds on disk. TP-02-02 was still not executed, in
keeping with the instruction; this is recorded so the next owner does not inherit
a stale premise.

**Command:** `grep -c -i -E "mandate|cashNeed|constraint" tests/portfolio-privacy.functional.mjs`

**Exit Code:** 0 · **Claim Source:** executed

```text
=== TP-02-02 target file: mandate/cashNeed/constraint occurrences ===
50
GREP_EXIT=0
```

The file now carries 7 subtests, the last two of which name precisely the two
clauses the earlier TP-02-02 verdict recorded as uncovered:

```text
30:test('real-format import previews commits reloads and exports one local revision', () => {
53:test('secret-bearing import is redacted and cannot mutate any storage namespace', () => {
72:test('atomic write failures preserve the active pointer and retain a validated candidate only in memory', () => {
90:test('session and memory commits state truthfully and preserve the last valid candidate after rejection', () => {
113:test('hostile manual labels remain inert data and namespace writes stay closed', () => {
154:test('explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved', () => {
218:test('one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults', () => {
```

An earlier note in this report described those two subtests as uncommitted.
`git status --porcelain tests/portfolio-privacy.functional.mjs` now returns empty,
so they are committed.

**Resolved.** This declaration is closed. TP-02-02 has since been executed with a
same-command RED/GREEN pair; see [TP-02-02](#tp-02-02). The stale premise no longer
propagates. The note at the end of the TP-02-05 block that describes the earlier
verdict as possibly stale is likewise resolved by that execution; it is left in
place because it was an accurate statement of what that run knew at the time.

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.
