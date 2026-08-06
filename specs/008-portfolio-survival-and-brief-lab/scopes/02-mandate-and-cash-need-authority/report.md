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

## Core Delivery Item Evidence - Requirement Coverage

Covers Core Delivery DoD items 1-3 (FR-011..FR-016; NFR-003/005/007/012/022;
FR-017/FR-022/FR-033). All three are carried by the same functional file and the
same single command, so one run is recorded here and each item is mapped to the
assertions that carry it.

Value discipline: this section names requirement ids, assertion messages, and
refusal/conflict **reason codes** only. No stored mandate content and no probe
literal is reproduced here, because this file is tracked.

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-02,green,DOD-89,DOD-90,DOD-91 timeout 300 bash .github/bubbles/scripts/tool-log.sh node --test tests/portfolio-privacy.functional.mjs`

**Exit Code:** 0 · **Claim Source:** executed

```text
TAP version 13
# Subtest: real-format import previews commits reloads and exports one local revision
ok 1 - real-format import previews commits reloads and exports one local revision
  ---
  duration_ms: 43.168401
  type: 'test'
  ...
# Subtest: secret-bearing import is redacted and cannot mutate any storage namespace
ok 2 - secret-bearing import is redacted and cannot mutate any storage namespace
  ---
  duration_ms: 21.0227
  type: 'test'
  ...
# Subtest: atomic write failures preserve the active pointer and retain a validated candidate only in memory
ok 3 - atomic write failures preserve the active pointer and retain a validated candidate only in memory
  ---
  duration_ms: 29.325101
  type: 'test'
  ...
# Subtest: session and memory commits state truthfully and preserve the last valid candidate after rejection
ok 4 - session and memory commits state truthfully and preserve the last valid candidate after rejection
  ---
  duration_ms: 20.8756
  type: 'test'
  ...
# Subtest: hostile manual labels remain inert data and namespace writes stay closed
ok 5 - hostile manual labels remain inert data and namespace writes stay closed
  ---
  duration_ms: 11.1322
  type: 'test'
  ...
# Subtest: explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved
ok 6 - explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved
  ---
  duration_ms: 56.581501
  type: 'test'
  ...
# Subtest: one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults
ok 7 - one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults
  ---
  duration_ms: 64.571801
  type: 'test'
  ...
# Subtest: FR-011 to FR-016: declared purpose units authority dates amounts currencies priorities and treatment reach the candidate unchanged and an infeasible draft fails loudly with nothing relaxed
ok 8 - FR-011 to FR-016: declared purpose units authority dates amounts currencies priorities and treatment reach the candidate unchanged and an infeasible draft fails loudly with nothing relaxed
  ---
  duration_ms: 22.413601
  type: 'test'
  ...
# Subtest: NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: provenance missing-state integrity atomic revisions latest-complete publication and the research boundary all hold on the mandate surface
ok 9 - NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: provenance missing-state integrity atomic revisions latest-complete publication and the research boundary all hold on the mandate surface
  ---
  duration_ms: 112.500702
  type: 'test'
  ...
# Subtest: FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state
ok 10 - FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state
  ---
  duration_ms: 40.9974
  type: 'test'
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 588.79581
[tool-log] recorded exit=0 duration=671ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
FUNCTIONAL_EXIT=0
```

### How "carried" was decided, not assumed

A requirement id printed in a test title or a comment proves nothing; the run
would be just as green with the behavior absent. Each id was therefore required
to appear **inside an assertion message on a line belonging to an `assert.*`
call**, with comment lines and the `test(...)` title line excluded. Titles and
comments were counted separately and were not allowed to satisfy an id.

One substring trap was corrected mid-check and is recorded because it would have
manufactured a false pass: a naive scan reports `FR-022` as carried by 4
assertions and `FR-012` by extra ones, because `FR-022` is a substring of
`NFR-022` and `FR-012` of `NFR-012`. Re-run with a preceding-character guard
(`(?<![A-Z])`), the real counts are `FR-022` = 1 static-message assertion and
`FR-012` = 14. Both still clear the bar, but only the guarded count is evidence.
Without the guard, item 3 would have appeared to rest on assertions that in fact
belong to item 2.

`FR-017`, `FR-022` and `FR-033` additionally carry their ids through a data field
(`requirement:`) interpolated into the assertion message
``` `${attempt.requirement}: ${attempt.what} must be refused, not absorbed` ```,
across 12 declared attempts plus one computed per forbidden input source. Those
are real assertion-carried occurrences that a literal-text scan cannot see, so
they are enumerated separately below rather than counted in the static totals.

### Item 1 - FR-011 through FR-016

Assertion counts are guarded static-message occurrences inside `assert.*` calls.

| Requirement | Clause in the DoD item | Assertion(s) carrying it | Count |
|---|---|---|---|
| FR-011 | explicit purpose, units, hard/research authority | `the declared purpose must survive verbatim`; `a purposeless mandate must be refused` (reason `objective-label-required`); `the horizon unit must be a declared unit`; `each constraint unit must survive verbatim`; `an undeclared horizon unit must be refused` (reason `horizon-invalid`); `an undeclared constraint unit must be refused` (reason `constraint-unit-invalid`); `hard constraints must be counted as declared`; `research constraints must be counted as declared`; `each declared authority must survive verbatim`; `an inferred constraint authority must be refused` (reason `constraint-authority-invalid`) | 10 |
| FR-012 | dates, amounts, currencies, priorities, treatment | six `the declared <part> must survive verbatim` assertions; five refusal assertions on reasons `cash-need-date-invalid`, `cash-need-amount-invalid`, `cash-need-currency-invalid`, `cash-need-priority-invalid`, `cash-need-timing-invalid`; three date-fault assertions on conflicts `cash-need-date-past`, `cash-need-after-horizon`, `cash-need-declared-order-invalid` | 14 |
| FR-013 | absence is a state, not a default | `every omitted policy field must be reported absent`; per-field `<field> must stay null`, each also asserted not-equal to the zero-shaped values a fallback would use | 2 |
| FR-014 | nothing inferred from holdings | `every policy-declared constraint kind must be an accepted explicit user entry`; `every declared constraint kind must reach the mandate in declared order`; `holdings must not become constraints`; `holdings must not become cash needs`; per-instrument `the held instrument <symbol> must not appear as an inferred constraint subject` | 5 |
| FR-015 | unchanged candidate propagation | `every declared constraint must reach the candidate unchanged and in declared order`; `every declared cash need must reach the candidate unchanged and in declared order` | 2 |
| FR-016 | loud infeasibility without constraint relaxation | LOUD: `an infeasible mandate must not be confirmable`; `infeasibility must be loud: at least one enumerated conflict`; `every conflict must carry a stated reason and a typed value-safe error`; `an infeasible mandate must be refused, not quietly committed`; `the refusal must name a code`. NOT RELAXED: `no declared constraint may be relaxed, reordered or deleted to manufacture feasibility`; `no declared cash need may be relaxed, reordered or deleted to manufacture feasibility` | 7 |

**The FR-016 trap clause is asserted, not assumed.** "Nothing relaxed" is proved
by comparing the produced mandate against the **declared source object**, not
against a stored copy of itself — so an implementation that widened a bound,
dropped a constraint, or resequenced a need to manufacture feasibility fails the
comparison rather than passing it. The comparison covers every declared bound,
subject, unit, date, amount, currency, priority and treatment. A guard then
asserts the source is *genuinely* infeasible (it must declare a competing
constraint pair); without that guard, "nothing was relaxed" would hold vacuously
against a feasible input and the clause would prove nothing.

### Item 2 - NFR-003, NFR-005, NFR-007, NFR-012, NFR-022

| Requirement | Clause in the DoD item | Assertion(s) carrying it | Count |
|---|---|---|---|
| NFR-003 | provenance | `the mandate must name its input authority`; `every constraint must name its input authority`; `every cash need must name its input authority`; `the projection must cite the revision it read`; `every unstated assumption must be reported, not silently supplied`; `every conflict must state a reason`; `invalidation must be stated per dependent state, not implied by a blank` (reason `mandate-absent`) | 7 |
| NFR-005 | missing-state integrity | per-field `<field> must remain missing` and `<field> must not fall back to <zero-shaped value>`; `<field> must stay absent even when a mandate exists`; `a misaligned currency must be surfaced` (reason `cash-need-currency-unavailable`); `a misaligned currency must stay distinct, never rewritten to the valuation currency` | 5 |
| NFR-007 | last-valid integrity under refusal | `an invalid mandate configuration must be refused`; `an invalid import must be refused`; `a refused configuration or import must not change one durable byte`; `the last valid portfolio identity must survive`; `the last valid result identity must survive` | 5 |
| NFR-012 | atomic revisions, latest-complete identity publication | `a stale edit must not publish` (reason `generation-conflict`); `an intermediate identity must never reach durable storage`; `the completed edit must be current`; `exactly one stored revision may answer to currentMandateId`; `the latest complete identity must become current`; `consumers must read the latest complete identity` | 6 |
| NFR-022 | adjacent research/advice boundary | `the route projection must contain no advice, execution, guarantee or suitability language`; `the mandate preview must contain no advice...`; `an infeasibility explanation must not become advice`; `a recommendation field has no slot in the mandate contract` (reason `unknown-field`) | 4 |

Two vacuity guards are themselves asserted. NFR-012 asserts the two concurrent
edits produce **different** identities before racing them (`two identical edits
cannot demonstrate a race`) and, after rebasing, that the winner **actually
changed** — so "latest complete" is proved by a change of winner rather than by a
single uncontested edit. NFR-022 first asserts the advice-vocabulary scan **can**
detect a violation before that same scan is used to claim there is none; a scan
that matched nothing would otherwise report a clean boundary for free.

### Item 3 - FR-017, FR-022, FR-033

This item states a **negative** claim: behavior/settings *cannot* create or modify
protected state. A negative is not proved by the absence of code that does it, and
"state did not change" alone cannot distinguish a refusal from a field that was
silently dropped. It is therefore proved by **attempting** each forbidden write
through the production validators and asserting the refusal that was actually
returned, then that no durable byte moved.

| Requirement | Attempts asserted refused | Static-message assertions |
|---|---|---|
| FR-017 | stored mandate relabelled as an observed fact (reason `mandate-invalid`); stored cash need relabelled as an observed fact (reason `cash-need-invalid`); user-entered holding relabelled as a market observation (reason `holding-invalid`) | `every projected constraint must still be labelled a user entry`; `every projected cash need must still be labelled a user entry`; `every stored holding must still be labelled user-entered, never market-observed` |
| FR-022 | each non-settings forbidden input source offered as mandate input (code `P008-MANDATE-AUTHORITY`, reason `forbidden-input-source`); constraint declared as inferred (reason `constraint-authority-invalid`); behavior provenance tag on a constraint and on a cash need (reason `unknown-field`); stored constraint relabelled behavior-derived (reason `constraint-invalid`); stored objective rewritten from behavior (reason `mandate-identity-mismatch`) | `behavior must contribute nothing after every attempt` |
| FR-033 | settings offered as mandate input (reason `forbidden-input-source`); each settings field smuggled in as a mandate field (reason `unknown-field`); each never-inferred field supplied as a mandate field (reason `unknown-field`); stored expected-return policy rewritten from settings (reason `mandate-identity-mismatch`); survival floor grafted onto the stored mandate (reason `unknown-field`) | `settings must contribute nothing after every attempt` |

Every attempt is asserted individually via
``` `${attempt.requirement}: ${attempt.what} must be refused, not absorbed` ```,
which checks the *specific* refusal production (ok flag, error code, reason, and
field) rather than merely that something failed.

Three vacuity guards are asserted rather than assumed:

- **Refusal is selective, not blanket.** A clean user-entered draft is asserted
  still accepted against the same workspace (`refusal must be selective: a clean
  user-entered draft is still accepted`), and the untampered stored revision and
  holding must still validate. Without this, an implementation that refused
  everything would pass every attempt above while being entirely broken.
- **Coverage is asserted, not counted by eye.** Each of the seven protected state
  kinds must have at least one refused attempt behind it, and each of FR-017,
  FR-022, FR-033 must have at least one — so a target or requirement losing its
  only attempt fails the test instead of silently thinning coverage.
- **No refusal echoes its input.** The serialised errors are asserted not to
  contain the rejected values, keeping refusals value-safe.

Post-conditions then assert nothing moved: not one durable byte, the current
mandate and portfolio identities, the revision count, the stored semantic
fingerprint, the stored constraints and cash needs, and every policy field.

### Item 4 - Scope 01 preservation, exact rollback, per-behavior RED/GREEN

**Phase:** implement

This item joins three independent claims with "and", so it is ticked only if all
three hold. Each is assessed separately below. All three now hold, and the item is
ticked. It was unchecked across several earlier runs on clause (c) alone; that
history is kept below rather than rewritten, because the sequence of what each run
could and could not prove is the useful record.

`git status --porcelain rlportfolio.js` was empty before these runs, so every
capture below reflects committed behavior rather than a working-tree edit.

#### Clause (a) - Scope 01 import/storage behavior remains unchanged: CARRIED

Scope 01's rows are not asserted separately here; they execute inside these three
suites. The unit suite carries the import/preview/duplicate/atomic-slot/
corruption/legacy-migration rows as subtests 1-16, the functional suite carries
the import, redaction, atomic-pointer, session-memory and hostile-label rows as
subtests 1-5, and the browser suite carries SCN-008-001, SCN-008-002 and TP-01-05
as tests 4-6. All are green at the current HEAD.

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-01,green,DOD-scope01-unchanged timeout 300 bash .github/bubbles/scripts/tool-log.sh node --test tests/portfolio-foundation.unit.mjs`

**Exit Code:** 0 · **Claim Source:** executed

```text
TAP version 13
ok 1 - RLPORTFOLIO is a frozen Node and browser dual-runtime contract
ok 2 - mandatory policy is closed versioned finite and rejects unknown configuration
ok 3 - holding revision and workspace identities are strict deterministic contracts
ok 4 - valid CSV preview exposes accepted normalized and unresolved duplicate states before confirmation
ok 5 - duplicate choices are explicit and row removal can create a valid new preview
ok 6 - unknown import fields remain blocking through duplicate resolution
ok 7 - secret-shaped import rejects the full draft with value-safe PortfolioError values
ok 8 - manual alternatives require valuation liquidity cost and uncertainty truth
ok 9 - manual listed drafts use the same closed preview contract as file imports
ok 10 - atomic durable commits use inactive slots verify bytes and reject generation conflicts
ok 11 - clearing a portfolio is an atomic revision-state change that preserves immutable history
ok 12 - slot and pointer faults preserve the last-known-good revision
ok 13 - post-write slot corruption is detected before pointer publication
ok 14 - future records remain untouched and durable session memory states are explicit
ok 15 - unknown legacy workspace shapes refuse migration and quarantine metadata is value-safe
ok 16 - foundation privacy inventory and verified clear remain available without policy config
ok 17 - explicit mandate draft is a closed user-authority contract over units dates currencies and hard research classification
ok 18 - absent mandate fields stay null and no default horizon floor objective or expected return is created
ok 19 - conflicting mandate stays infeasible with every declared constraint and cash need preserved in declared order
ok 20 - mandate revision identity is deterministic supersedes the prior mandate and never mutates the portfolio
ok 21 - behavior events interest signals and display settings cannot create or modify any mandate field
ok 22 - route projection cites one mandate revision and reports mandate-absent states without inventing values
1..22
# tests 22
# suites 0
# pass 22
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 738.261413
[tool-log] recorded exit=0 duration=859ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
UNIT_EXIT=0
```

Per-subtest TAP YAML duration blocks are elided above; the `ok` lines, the plan
line and the unabridged tail counters are verbatim.

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-02,green,DOD-scope01-unchanged timeout 300 bash .github/bubbles/scripts/tool-log.sh node --test tests/portfolio-privacy.functional.mjs`

**Exit Code:** 0 · **Claim Source:** executed

```text
TAP version 13
ok 1 - real-format import previews commits reloads and exports one local revision
ok 2 - secret-bearing import is redacted and cannot mutate any storage namespace
ok 3 - atomic write failures preserve the active pointer and retain a validated candidate only in memory
ok 4 - session and memory commits state truthfully and preserve the last valid candidate after rejection
ok 5 - hostile manual labels remain inert data and namespace writes stay closed
ok 6 - explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved
ok 7 - one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults
ok 8 - FR-011 to FR-016: declared purpose units authority dates amounts currencies priorities and treatment reach the candidate unchanged and an infeasible draft fails loudly with nothing relaxed
ok 9 - NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: provenance missing-state integrity atomic revisions latest-complete publication and the research boundary all hold on the mandate surface
ok 10 - FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state
ok 11 - rolling a mandate back restores the pre-mandate portfolio state by identity, not by resemblance
1..11
# tests 11
# suites 0
# pass 11
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 763.986853
[tool-log] recorded exit=0 duration=867ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
FUNCTIONAL_EXIT=0
```

**Command:** `BUBBLES_AGENT_NAME=bubbles.implement BUBBLES_SPEC=specs/008-portfolio-survival-and-brief-lab BUBBLES_SCOPE=SCOPE-02 BUBBLES_TOOL_LOG_TAGS=TP-02-03,green,DOD-scope01-unchanged timeout 600 bash .github/bubbles/scripts/tool-log.sh npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs`

**Exit Code:** 0 · **Claim Source:** executed

```text
Running 6 tests using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:86:1 › Regression: SCN-008-003 explicit mandate alone supplies every hard constraint (2.3s)
  ✓  2 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:177:1 › Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable (1.6s)
  ✓  3 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:245:1 › Regression: SCN-008-003 conflicting mandate stays visibly infeasible with no constraint relaxed (973ms)
  ✓  4 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:284:1 › Regression: SCN-008-001 valid local portfolio import creates one current revision (1.5s)
  ✓  5 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:388:1 › Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted (1.2s)
  ✓  6 [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:476:1 › Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes (3.0s)

  6 passed (13.4s)
[tool-log] recorded exit=0 duration=15462ms → /home/redacted/research-lab/.specify/runtime/tool-calls.jsonl
SYSTEM_EXIT=0
```

The per-test `[SCN-*]` assertion lines are elided above; they are value-safe
counters and reason codes, already reproduced in [TP-02-03](#tp-02-03),
[TP-02-04](#tp-02-04) and [TP-02-05](#tp-02-05).

#### Clause (b) - rollback is exact: CARRIED BY CITATION AND BY ITS OWN RED PAIR

Carried by the committed assertion `rolling a mandate back restores the
pre-mandate portfolio state by identity, not by resemblance`
(`tests/portfolio-privacy.functional.mjs:1029`), green as subtest 11 in the
functional capture above. The discriminator is in the title: the restored state
is compared by identity, so a rollback that rebuilt a merely equivalent-looking
portfolio fails it rather than passing. It is no longer carried by citation
alone — pair 2 below shows the assertion fails when rollback stops being exact,
and fails on the identity term rather than on resemblance.

The locator moved from `:860` to `:1029` as pairs C, D, E and the FR-015
declared-field-set fix added lines above it. The assertion is unchanged; only its
line is. The name is the durable identifier and the line is not.

#### Clause (c) - every Scope 02 behavior has intended RED and same-command GREEN: CARRIED

Two further RED/GREEN pairs were produced this session, same command in both
directions: `node --test tests/portfolio-privacy.functional.mjs`.

| Injected defect (reverted) | RED | GREEN |
|---|---|---|
| `rlportfolio.js` ~L1390: the `conflicts.length === 0` term dropped from `canConfirm`, so a draft carrying conflicts becomes confirmable | `# pass 9`, `# fail 2`, exit 1 | `# pass 11`, `# fail 0`, exit 0 |
| A horizon value invented into `inferredValues` when no mandate exists | RED observed | reverted; caught by the standing assertion that every `inferredValues` entry is `null` |

**Claim Source:** interpreted. The RED runs were executed and observed directly by
the orchestrator in this session, not by this agent. This agent executed only the
GREEN side — the 11-pass capture above is its own run. The reported RED counts
are arithmetically consistent with that capture: 11 subtests total, 2 failing
under the conflicts defect leaves 9 passing. Both defects were reverted with
`git checkout --`, and `git status --porcelain rlportfolio.js` is empty.

##### Two further pairs produced and executed here

The two highest-value gaps named above — the FR-017/FR-022/FR-033 refusal surface
and the rollback-by-identity assertion — now each have a RED/GREEN pair. Both
sides of both pairs were executed by this agent with the identical command,
`node --test tests/portfolio-privacy.functional.mjs`, whose committed baseline is
`# pass 11`, `# fail 0`, exit 0. One minimal defect was injected per pair and
reverted with `git checkout --` before the GREEN run.

| # | Injected defect (one line, reverted) | RED | Lands on | GREEN |
|---|---|---|---|---|
| 1 | `rlportfolio.js` `validateMandateDraft`: the `forbidden-input-source` refusal removed, so a forbidden input source offered as mandate input is absorbed into the ordinary error path instead of being refused outright | `# pass 10`, `# fail 1`, exit 1 | `not ok 10` | `# pass 11`, `# fail 0`, exit 0 |
| 2 | `rlportfolio.js` `buildMandateClearCandidate`: the rollback re-derives the current portfolio revision's lineage identity instead of preserving it, so an equivalent-looking revision is restored under a new `portfolioId` | `# pass 9`, `# fail 2`, exit 1 | `not ok 11` + `not ok 9` | `# pass 11`, `# fail 0`, exit 0 |

**Claim Source:** executed (both RED runs and both GREEN runs).

**Pair 1 — the refusal surface is not vacuous.** Defect 1 removes only the
outright refusal; every other validator is untouched, so a draft carrying a
forbidden source still reaches the ordinary field checks and still fails to
confirm. That is precisely the failure mode item 3 warned about — a field
silently dropped is not a refusal — and the test discriminates it, because each
attempt asserts the *refusal production* rather than merely that state did not
change:

```text
not ok 10 - FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state
  ---
  failureType: 'testCodeFailure'
  error: |-
    FR-022: actionOutcomes offered as mandate input must be refused, not absorbed
```

Only subtest 10 goes red. The ten other subtests stay green under the defect, so
the RED lands on the refusal surface and nowhere else.

**Pair 2 — the rollback assertion discriminates identity from resemblance.**
Defect 2 was chosen so the restored revision *resembles* the pre-mandate state
exactly: same holdings, same name, same currency, same basis, so its
`semanticFingerprint` is unchanged. Only the lineage identity moves. A test that
compared by resemblance would still pass; this one fails on the identity term:

```text
not ok 11 - rolling a mandate back restores the pre-mandate portfolio state by identity, not by resemblance
  ---
  error: |-
    the current portfolio identity must be the same string, not an equivalent rebuild
```

The second failure is collateral and is reported rather than hidden: subtest 9
also goes red at `tests/portfolio-privacy.functional.mjs:581`, the NFR-003
clear-projection check that every descriptive route still cites the same portfolio
identity after a mandate clear. That is the same defect caught by an independent
assertion in a different block, which strengthens rather than weakens the pair.

Working-tree discipline: `git status --porcelain rlportfolio.js` was verified
**empty** after each of the two reverts and again at the end of this run. A marker
grep was not accepted as evidence of revert, because neither injected defect
carried a marker.

##### A third pair: an inert namespace assertion that both suites were blind to

This run closed a real coverage gap rather than adding a new RED to an assertion
that already discriminated. The gap was that the only assertion guarding the
durable namespace was a **name-prefix test**, and a prefix test cannot detect a
**new key added under that same prefix**.

**The defect used to expose it.** One line in `rlportfolio.js` `commitDurable`,
placed immediately before the candidate is validated, writes the not-yet-validated
workspace to durable storage under a `.staging` key derived from the declared
namespace. It creates a key outside the declared set and, because it precedes
validation, it is the shape of an NFR-007 "last-valid integrity under refusal"
violation.

**Both suites stayed green with the defect present.** Executed here before any fix
was written, against the unmodified assertions:

```text
ℹ tests 11
ℹ pass 11
ℹ fail 0
PREFIX_ONLY_EXIT=0
```

`node scripts/selftest.mjs` was likewise unaffected. The defect was reverted with
`git checkout --` and `git status --porcelain rlportfolio.js` verified empty before
the fix was written.

**Why the old assertion was inert — two independent reasons, both verified in the
source rather than assumed.**

1. *The prefix matched.* The single namespace guard was
   `Object.keys(localStorage.snapshot()).every((key) => /^rlPortfolio/.test(key))`.
   The defect's key is derived from `policy.storage.workspaceNamespace`, so it
   begins `rlPortfolio` and satisfies the regex. A prefix test partitions keys into
   "ours" and "foreign"; it has no opinion at all about which of *ours* are
   declared, which is exactly the question a new-key leak asks.
2. *Every byte-equality check brackets the wrong window.* The suite does contain
   strict `JSON.stringify(localStorage.snapshot())` before/after comparisons, and
   at first reading one of them should have caught this. It does not, and the
   reason is structural: `commitWorkspace` revalidates the candidate and returns
   **before** dispatching to `commitDurable`
   (`rlportfolio.js` `commitWorkspace`: `var candidateValidation = validateWorkspace(candidate, policy); if (!candidateValidation.ok) return candidateValidation;`).
   Every existing byte window brackets a **refused** write, and a refusal
   short-circuits above `commitDurable`, so the injected line never executes inside
   one. The line executes only during a **successful** commit — and no assertion
   examined the key set after a successful commit. The two blind spots compose: the
   one place the write lands was guarded only by the prefix, and the guard that
   compares bytes exactly never covers that place.

**The fix.** Prefix checking is replaced by **declared-key-set** assertions, and the
set is derived from the policy that declares it rather than typed as a literal, so a
future key must be added to `policy.storage` deliberately instead of drifting in
unnoticed:

- `declaredStorageKeys(policy)` builds the allowed local set from
  `policy.storage.pointerKey`, `policy.storage.slotKeys`,
  `policy.storage.quarantineKey` and `policy.storage.returnContextKey`, and the
  allowed session set from `policy.storage.sessionKey`.
- The two transient capability-probe keys are deliberately **excluded** from the
  declared set. `probeStorage` removes its probe on both its success path and its
  failure path, so the probe never legitimately persists and a surviving probe key
  is itself a leak these assertions are now able to catch. This was determined by
  reading `probeStorage`, not assumed.
- `undeclaredKeys(storage, declared)` returns the offending **key names only**, never
  values, so a failure names the leak without printing stored holding or mandate
  content.
- The assertion is made **on the commit path**: after the mandate commit the durable
  image is compared for exact equality against the declared pointer plus both slot
  keys, and a non-vacuity guard rejects an empty image so the closure check cannot
  pass over nothing.

**RED/GREEN proving the new assertion discriminates.** Same command both sides,
`node --test tests/portfolio-privacy.functional.mjs`. The identical one-line defect
was re-injected after the fix landed:

| State | Result |
|---|---|
| Fix in place, `rlportfolio.js` clean | `ℹ pass 11`, `ℹ fail 0`, exit 0 |
| Fix in place, defect re-injected | `ℹ pass 9`, `ℹ fail 2`, exit 1 |
| Fix in place, defect reverted | `ℹ pass 11`, `ℹ fail 0`, exit 0 |
| Old assertion, same defect (before the fix) | `ℹ pass 11`, `ℹ fail 0`, exit 0 |

**Claim Source:** executed. All four runs above were run and observed directly.

The RED names the leaked key and nothing else:

```text
✖ hostile manual labels remain inert data and namespace writes stay closed
  AssertionError: a commit must write no durable key outside the policy-declared set
    actual: [ 'rlPortfolioWorkspaceV1.staging' ]
    expected: []

✖ NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: ...
  AssertionError: a committed mandate must leave exactly the declared pointer and slot keys
    actual:   [ ...pointer, ...slotA, ...slotB, 'rlPortfolioWorkspaceV1.staging' ]
    expected: [ ...pointer, ...slotA, ...slotB ]
```

The last row of the table is the load-bearing one: the same defect against the
**old** assertion is green and against the **new** assertion is red, so the change
is a genuine increase in detection and not a restatement of cover that already
existed.

**Uncertainty Declaration — what this run does NOT prove.** A third assertion was
added after the refused durable commit (`a refused durable commit must leave no
undeclared key behind as residue`). That assertion did **not** fire in the RED run,
and it is not claimed as proven non-vacuous. The reason is the short-circuit
described above: with this defect the only reachable write window is a *successful*
commit, so no refusal path in this suite can currently exercise it. It is retained
as defense in depth against a write placed *after* validation inside
`commitDurable`, and it is recorded here as unproven rather than counted as
evidence.

**Scope note.** The prefix assertion that was replaced lives in the
`hostile manual labels remain inert data and namespace writes stay closed` test,
which serves Scope 01's closed-namespace claim; the exact-set assertion on the
mandate commit path serves this scope's NFR-007 claim. Both are in the same file
and both now use the same policy-derived helper.

Working-tree discipline for this pair: `git status --porcelain rlportfolio.js` was
verified **empty** after the pre-fix revert, after the post-fix revert, and once
more at the end of the run. A `TEMPORARY`/`ADVERSARIAL`/`INJECT` marker grep was
explicitly **not** accepted as evidence of revert — the injected line carried no
marker, so only `git status` could expose it.

##### A fourth pair: NFR-005 had an assertion that could not fail

Two things landed for NFR-005 and neither was recorded until this entry. The
assertion was rewritten in `3faa0131` because the previous form was structurally
incapable of failing, and a targeted RED/GREEN pair then showed the rewritten form
discriminates. The rewrite went unrecorded because `3faa0131` touched only
`tests/portfolio-privacy.functional.mjs`; the map below carried the pre-rewrite
state until now.

**The vacuity.** The previous check filtered by the result and then asserted that
same result:

```text
MANDATE_POLICY_FIELDS.filter((field) => mandate[field] === null).forEach((field) => {
  assert.strictEqual(mandate[field], null, `NFR-005 ${field} must remain missing`);
```

A field that *did* acquire a fallback stops satisfying `mandate[field] === null`,
drops out of the filter, and is never examined. The only fields the assertion
inspected were the ones already known to be null. It named precisely the failure it
could not observe, and it could not fail.

**The rewrite** (`3faa0131`) quantifies over the fields the **user declared
absent**, read from the declaration rather than from the result, so a field that
acquires a fallback stays in the set and fails. It adds a non-vacuity guard —
`a declaration that omits no policy field cannot carry a missing-state claim` — so
the fix cannot itself go vacuous by quantifying over an empty set when a fixture
happens to declare everything.

**Why the defect is targeted rather than incidental — verified in source, not
assumed.** Three facts were read directly rather than taken on trust:

1. `costPolicy` is a member of `MANDATE_POLICY_FIELDS`
   (`tests/portfolio-privacy.functional.mjs:394`), which is exactly the set the
   rewritten assertion quantifies over.
2. The fixture declares every policy field absent — asserted independently at
   `tests/portfolio-privacy.functional.mjs:484` — so `costPolicy` is inside the
   declared-absent set and the non-vacuity guard is satisfied rather than skipped.
3. The value the defect substitutes is itself a member of the assertion's
   rejected-fallback list, so both the `strictEqual(..., null)` term and the
   `notStrictEqual(..., fallback)` term bear on it.

**The pair.** Same command both sides,
`node --test tests/portfolio-privacy.functional.mjs`.

| State | Result |
|---|---|
| `rlportfolio.js` clean | `# pass 11`, `# fail 0`, exit 0 |
| Defect injected at `rlportfolio.js:1357` — the `costPolicy` absent-branch returns a fallback string instead of `null`, so a declared-absent `costPolicy` acquires a value | `# pass 8`, `# fail 3`, exit 1 |
| Defect reverted with `git checkout --` | `# pass 11`, `# fail 0`, exit 0 |

The RED lands on the composite subtest and names the field:

```text
not ok 9 - NFR-003 NFR-005 NFR-007 NFR-012 NFR-022 ...
    NFR-005 costPolicy was declared absent and must remain missing
```

**Claim Source:** interpreted for the RED and for the post-revert GREEN — both were
executed and observed directly by the orchestrator in this session, not by this
agent. This agent independently executed the clean-tree GREEN baseline
(`# pass 11`, `# fail 0`, exit 0), verified `git status --porcelain rlportfolio.js`
**empty**, and verified the three source facts listed above. The reported counts are
arithmetically consistent with that baseline: 11 subtests total, 3 failing leaves 8
passing. The quoted failure string is the exact message template introduced by
`3faa0131` instantiated at `costPolicy` — a template the pre-rewrite assertion did
not contain — so the RED could only have been produced against the rewritten
assertion.

**Uncertainty Declaration.** The RED reports three failures and only one was
identified. Subtest 9 is named, with the NFR-005 message above; the other two
failing subtests were not reported and are not attributed here. No row is advanced
on them.

**This pair is load-bearing beyond its own row.** The defect is exactly the failure
the rewrite was built to catch — a declared-absent field acquiring a fallback — and
it is exactly what the pre-rewrite assertion let through, because a `costPolicy`
holding a fallback value drops out of a `mandate[field] === null` filter and is
never examined. So the pair does not merely give NFR-005 a RED; it establishes that
the rewrite is non-vacuous rather than only better-shaped. That is the same class of
finding as pair 3: an assertion that looked like coverage and could not
discriminate. Two such assertions were found in this scope by injecting defects at
the property each claimed to protect, which is the only method that has located
either of them.

##### Five more pairs: the five behaviors that had no RED at all

Each of the five remaining node-reachable behaviors was given one pair. The method
is unchanged: one minimal defect in `rlportfolio.js` placed at exactly the property
that behavior's assertion claims to protect, `node --test tests/portfolio-privacy.functional.mjs`
run and the failing assertion recorded verbatim, `git checkout -- rlportfolio.js`,
`git status --porcelain rlportfolio.js` verified **empty**, then the same command
re-run for GREEN.

| Pair | Behavior | Defect | RED | Failing assertion | GREEN after revert |
|---|---|---|---|---|---|
| 5 | FR-011 | the constraint normalizer stamps one fixed authority class instead of carrying the declared one | 10 pass / 1 fail, exit 1 | `FR-011 hard constraints must be counted as declared` (`7 !== 4`), `:451` | 11 pass / 0 fail, exit 0 |
| 6 | FR-012 | the out-of-declared-order date fault is removed from conflict detection | 10 pass / 1 fail, exit 1 | `FR-012 needs declared out of chronological order must be identified` (`false !== true`), `:476` | 11 pass / 0 fail, exit 0 |
| 7 | FR-014 | the revision builder derives constraints from the committed holdings when the draft declares none | 10 pass / 1 fail, exit 1 | `FR-014 holdings must not become constraints`, `:507` | 11 pass / 0 fail, exit 0 |
| 8 | FR-015 | propagation drops a declared constraint on the way into the candidate | 10 pass / 1 fail, exit 1 | `FR-015 every declared constraint must reach the candidate unchanged and in declared order`, `:520` | 11 pass / 0 fail, exit 0 |
| 9 | NFR-022 | the closed-contract guard is removed from stored-mandate validation | 9 pass / 2 fail, exit 1 | `TypeError: Cannot read properties of undefined (reading 'reason')`, `:760` | 11 pass / 0 fail, exit 0 |

**Claim Source:** executed. Every RED and every GREEN above was run and observed
directly, and the clean-tree baseline preceding them was `# pass 11`, `# fail 0`,
exit 0.

**Attribution.** Pairs 5 through 8 each produced exactly one failing subtest
carrying exactly one failing assertion, so there is nothing to disambiguate. No id
was credited from a composite title; subtest 8's title names FR-011 through FR-016,
and each of the four pairs landing inside it is credited only to the id whose
assertion actually fired, identified by line.

**Pair 9 produced two failures and only one is credited.** The failure at `:760` is
the NFR-022 closed-contract assertion, and no other assertion occupies that line. The
second, at `:905`, is `FR-033: a survival floor grafted onto the stored mandate must
be refused, not absorbed` — collateral on the FR-017/FR-022/FR-033 row, which already
carries its own RED from pair 1. It is reported, not credited, and advances no row.

**Pair 9's RED is a `TypeError` rather than an `AssertionError`, and that is recorded
rather than smoothed over.** With the contract opened, the validator returned success,
so the assertion's own subject expression had no error object to read and threw before
the comparison ran. The failure is still produced by exactly the removed property and
still lands on exactly the NFR-022 line, so the row is credited. It does expose a
robustness weakness in that assertion — it reaches into the refusal branch without
first asserting that a refusal happened — but not a coverage gap, because the
assertion discriminates: it passes with the contract closed and fails with it open.

##### A fourth inert assertion: the declared authority is unguarded on the propagation path

This run also closed a real coverage gap, and it is the third of the three shapes
already named — a projection that omits the very property in question.

FR-015's propagation check compared each constraint as a five-element tuple of kind,
subject, unit and the two bounds. A declared constraint carries **six** declared
fields. The one left out was `constraintKind`, the hard-versus-research authority
that FR-011 exists to establish. FR-011's own authority assertions do not close the
gap, because they read the **draft preview** and not the candidate. Between the two,
the declared authority was established at draft time and never looked at again after
it was propagated.

**The defect used to expose it.** The revision builder rewrites every propagated
constraint's authority to the research class and recomputes the constraint identity
so no downstream identity check detects a mismatch. Its effect is that every hard
constraint the user declared silently becomes advisory at commit time — the
strongest available failure of the authority FR-011 establishes.

**Both suites stayed green with the defect present.** Executed against the
unmodified assertions, before any fix was written:

```text
# tests 11
# pass 11
# fail 0
AUTHORITY_REWRITE_EXIT=0
Research-Lab self-test: 1220 passed, 0 failed
```

The defect was reverted with `git checkout --` and `git status --porcelain
rlportfolio.js` verified empty before the fix was written.

**The fix.** The comparison is no longer a hand-listed subset. `declaredFieldRows`
derives the compared field set from the declared entry's own keys, asserts every
declared entry shares that set so the comparison cannot be exhaustive over one entry
and partial over another, and rejects an empty set so it cannot pass over nothing. A
named guard additionally asserts the derived set covers `constraintKind`, so the
field that drifted out cannot drift out again unnoticed. The same treatment is
applied to the cash-need comparison, whose tuple happened to be complete but was
equally hand-listed and equally able to drift.

**RED/GREEN proving the new assertion discriminates.** Same command both sides,
`node --test tests/portfolio-privacy.functional.mjs`, same defect:

| State | Result |
|---|---|
| Old assertion, defect present | `# pass 11`, `# fail 0`, exit 0 |
| New assertion, `rlportfolio.js` clean | `# pass 11`, `# fail 0`, exit 0 |
| New assertion, same defect re-injected | `# pass 10`, `# fail 1`, exit 1 |
| New assertion, defect reverted | `# pass 11`, `# fail 0`, exit 0 |

**Claim Source:** executed. All four runs above were run and observed directly.

The RED names the propagation term and nothing else:

```text
FR-015 every declared constraint field must reach the candidate unchanged and in declared order
```

at `tests/portfolio-privacy.functional.mjs:537`.

**An identical shape survives at FR-016 and is deliberately not changed here.**
FR-016's "nothing relaxed" comparison uses the same hand-listed five-element
constraint tuple and is blind to the same field, so a commit-time authority rewrite
would pass it too. It is named rather than fixed, because FR-016 is not one of the
rows this run was scoped to and the row it belongs to already carries a RED. It
should be converted to the same declared-field-set comparison.

**Pair A — TP-02-03, and the browser row was a coverage gap, not a missing RED.**
Command for every run below, unchanged across RED and GREEN:

```text
npx --no-install playwright test --config=playwright.config.mjs \
  --project=system-chrome tests/portfolio-survival-foundation.spec.mjs
```

Baseline before any injection: **6 passed, 0 failed**.

Defect A rewrites the declared `constraintKind` to `research` for every constraint
carried into `projectRouteStates`, leaving subject, bound, unit and
`inputAuthority` untouched. That is exactly the property the row names — it claims
*hard* constraints across dependent route states. Against the assertions as they
stood the suite returned **6 passed, 0 failed**: the defect was invisible. The
preview counters that read `hard` and `research` are computed from the draft, not
from the projection, so they were unaffected; and no assertion in the route-state
loop or the rendered panel looked at the kind at all. Every hard bound could reach
every dependent route as advisory with the browser suite fully green.

Two assertions were added — the projected kinds must equal the declared pair, and
the rendered constraint block must not display `research`. Re-running with defect A
still in place: **1 failed, 5 passed**, the failure landing on the
SCN-008-003 test at the display assertion, with the rendered block showing
`research` where the fixture declares `hard`. The old assertions were green against
this defect and the new ones are red against it, so the new assertions are what
discriminate rather than an incidental precondition. Defect A reverted,
`git status --porcelain rlportfolio.js` verified **empty**, same command:
**6 passed, 0 failed**.

**Pair B — TP-02-04, a second coverage gap of the same two shapes.** Defect B adds
one further key, `expectedReturnPolicy`, to the projected `inferredValues` with a
non-null numeric value. The row claims the mandate-absent route shows no hidden
values, and the rendered panel prints every key in that map, so under the defect a
real number is displayed beneath a heading that reads *No inferred values*. Against
the assertions as they stood: **6 passed, 0 failed**.

Both blind spots are ones this scope has already been bitten by. The panel check was
`toContainText('No inferred values')` — a prefix that survives any appended key —
and the value check iterated the five hand-listed never-inferred names, so a sixth
key was outside what either could see.

Two assertions were added to the SCN-008-004 test — the projected key set must equal
the declared never-inferred set with every value null, and every rendered pair must
read absent. Re-running with defect B still in place: **1 failed, 5 passed**,
the failure landing on the SCN-008-004 test at the rendered-pair matcher, which
reported the single non-absent pair. Defect B reverted,
`git status --porcelain rlportfolio.js` verified **empty**, same command:
**6 passed, 0 failed**.

The assertions were deliberately added to the SCN-008-004 test only, not to both
tests that iterate the never-inferred names, so the RED is attributable to the row
being closed rather than spread across two tests.

**Pairs C, D and E — the three partial rows, and three more coverage gaps of the
same family.** Command for every run below, unchanged across RED and GREEN:

```text
node --test tests/portfolio-privacy.functional.mjs
```

Baseline before any injection: **11 pass, 0 fail**, exit 0. Each defect was aimed at
the portion of its row the earlier run left *uncovered*, not at the portion already
carried, and each was first run against the assertions **as they stood**, to
establish whether the row was merely unproved or actually blind.

All three were blind. That is the seventh, eighth and ninth coverage gap this scope
has produced, and each is the same shape as the earlier six: an assertion that reads
like coverage but cannot discriminate.

| Pair | Row | Defect aimed at the uncovered portion | Old assertions | New assertion |
|---|---|---|---|---|
| C | NFR-003 provenance | the stored revision keeps its declared constraints but carries no cash need at all | **11 pass, 0 fail** — blind | **RED**, `not ok 9` |
| D | NFR-012 latest-complete publication | every durable commit publishes the correct winning identity but discards the revisions it superseded | **11 pass, 0 fail** — blind | **RED**, `not ok 9` |
| E | NFR-007 refusal-path residue | an undeclared key written under the workspace namespace before the pointer publish and removed again on success, so it survives only when the publish fails | **11 pass, 0 fail** — blind | **RED**, `not ok 9`, sole failure |

**Pair C — NFR-003 was vacuous, not merely unproved.** The provenance claim is
universally quantified over the stored inputs, and `[].every()` is `true`. Every
authority assertion in this suite is written that way, so a revision that stored no
cash need at all satisfied all of them at once while carrying not one attributed
input. Under the defect the suite returned **11 pass, 0 fail**: subtest 9 stayed
green with every stored cash need deleted. The quantifier is now bounded by the
declaration that produced the revision, read from that declaration rather than typed
as a count, and the declaration is itself asserted non-empty so the bound cannot
become vacuous in turn. Re-running with the defect still in place: **10 pass,
1 fail**, the failure naming one id and no other:

```text
NFR-003 every declared cash need must be stored to carry an authority

0 !== 1
```

**Pair D — NFR-012 proved which identity won, never that the image was complete.**
Every assertion in the block reads `currentMandateId`, so an image that published the
correct winner while silently dropping the revisions it superseded satisfied all of
them: the winner matched, exactly one stored revision answered to it, the projection
cited it, and the rebase still changed the winner. Under the defect the suite
returned **11 pass, 0 fail**. Completeness is now asserted on the published image
itself, against the identities the commits actually returned. Re-running with the
defect still in place: **8 pass, 3 fail**, subtest 9 failing at

```text
NFR-012 the published image must retain every completed revision, not only the latest identity

false !== true
```

**Pair E — NFR-007, and the earlier "unreachable by construction" reading was
wrong.** The earlier run established that `commitWorkspace` revalidates the candidate
and returns before dispatching to `commitDurable`, and concluded the refusal-path
residue assertion could not be reached. The first half is correct; the conclusion
does not follow from it. It is scoped to the *refusal that run chose* — an invalid
candidate, which is rejected above the write point — and not to the write path, which
is reachable. Three refusals inside `commitDurable` occur **after** the inactive slot
has been written and re-read: slot verification, the pointer publish, and pointer
verification. A valid candidate committed against a store whose pointer write fails
takes the second of them, and that failure reason is by construction reachable only
once the slot write has already succeeded.

The defect writes an undeclared key under the workspace namespace before the pointer
publish and removes it again on the success path, so it survives exactly one
condition: a commit refused after the write had begun. Against the assertions as they
stood the whole suite returned **11 pass, 0 fail** — including the existing subtest
that drives that same refusal directly, which asserts the pointer and the reloaded
identity but never the key set. A key leaked on every failed publish and nothing in
the suite could see it.

A refusal that reaches the write is now constructed inside the row's own block, and
the refusal **reason** is asserted alongside the residue, so the arrangement cannot
silently decay back into one that returns early and re-vacuate the claim. Re-running
with the defect still in place: **10 pass, 1 fail** — subtest 9 the sole failure,
the diff naming the leaked key:

```text
NFR-007 a refusal that reached the write path must leave no undeclared key behind as residue
```

**Attribution.** Subtest 9 carries a composite title naming five ids, so the title
credits none of them. Each pair is credited on the assertion that actually fired,
each of which names exactly one id, and each new assertion was placed in the block
that owns its row so the failure is attributable rather than smeared.

**Claim Source:** executed. Every count and every assertion text above was observed
directly. `rlportfolio.js` is the only file these three defects touched. After each
of the three reverts `git status --porcelain rlportfolio.js` was verified **empty**,
and the suite returned to **11 pass, 0 fail**. None of the three defects carried a
marker, so a marker grep would have read clean against all of them; it was not
accepted as evidence of revert at any point. The browser suite was re-run unchanged
at the end: **6 passed**.


**empty** after each of the seven reverts in this run — five pairs, the gap probe
before the fix, and the same probe re-injected after it — and once more at the end.
None of the seven defects carried a marker, so a marker grep would have read clean
against every one of them; a marker grep was therefore not accepted as evidence of
revert at any point.

The same rule was applied to pairs A and B. `rlportfolio.js` is the only source file
those two injections touched — `portfolio-survival-allocation-lab.html` was read to
choose the injection points but never edited — and `git status --porcelain` was
verified empty for both files after each of the two reverts and once more at the
end. Neither defect carried a marker, so a marker grep would have read clean
against both; it was not accepted as evidence of revert.

**Why the clause still fails.** The clause is universally quantified — *every*
Scope 02 behavior. Counting the RED records that now exist against the behaviors
this scope delivers:

| Scope 02 behavior | RED record | Where |
|---|---|---|
| Atomic mandate round trips | yes | [TP-02-02](#tp-02-02) RED, clause-1 defect |
| One constraint set reaching every consumer | yes | [TP-02-02](#tp-02-02) RED, clause-2 defect |
| NFR-012 atomic revisions / latest-complete publication | yes | pair D above, incomplete-publication defect; the identity-only blind spot is closed and separately proved |
| Conflicts stay infeasible and unconfirmable | yes | this session, `canConfirm` defect |
| Absence never acquires an invented value | yes | this session, `inferredValues` defect |
| FR-017 / FR-022 / FR-033 forbidden-input refusal surface | yes | pair 1 above, `forbidden-input-source` defect |
| Exact rollback by identity (clause (b)'s own test) | yes | pair 2 above, lineage-rebuild defect |
| NFR-003 provenance | yes | pair C above, dropped-cash-need defect; the vacuous quantifier is closed and separately proved |
| FR-011 purpose, units, hard/research authority | yes | pair 5 above, collapsed-authority defect |
| FR-012 cash-need parts and the three date faults | yes | pair 6 above, removed out-of-declared-order date fault |
| FR-014 nothing inferred from holdings | yes | pair 7 above, holdings-derived-constraints defect |
| FR-015 unchanged candidate propagation | yes | pair 8 above, dropped-constraint propagation defect; the tuple gap is closed and separately proved |
| NFR-005 missing-state integrity | yes | pair 4 above, `costPolicy` fallback defect |
| NFR-007 last-valid integrity under refusal | yes | pair E above, residue left by a refusal that reaches the write path; the assertion is now falsifiable and proved |
| NFR-022 research/advice boundary | yes | pair 9 above, opened mandate-contract defect |
| TP-02-03 / TP-02-04 browser rows | yes | pairs A and B above, route-projection `constraintKind` downgrade and an extra rendered inferred value; both were coverage gaps and both are closed |

All sixteen behaviors now carry a RED; none is left at **partial** and none at
**no**. That is up from thirteen yes and three partial before pairs C, D and E, from
twelve yes, three partial and one no before pairs A and B, from four with two
partial at the start of this session, and from seven with three partial before this
run's five pairs. The two gaps the earlier run named as
highest-value — the FR-017/FR-022/FR-033 refusal surface and the
rollback-by-identity assertion — are both closed, and each is closed by a defect
targeted at exactly the property the assertion claims to protect rather than at
some incidental precondition.

NFR-007 moved from **no** to **partial** on pair 3, and from **partial** to **yes**
on pair E. The intermediate step was correct at the time: pair 3 proves the durable
key set is closed after a commit and that a write landing before validation is
detected, but it does not prove the refusal-path residue assertion, because the
refusal it uses is rejected above the write point. What pair 3's run got wrong was
the inference drawn from that — it read the short-circuit as making the assertion
unreachable *by construction*, when the short-circuit is a property of the refusal
that run chose and not of the write path. Pair E reaches the write path with a
different refusal and lands the RED on the residue term itself, so the row is now
carried on executed evidence rather than on an added-but-unfired assertion.

NFR-003 and NFR-012 moved from **partial** to **yes** on pairs C and D. Both were
partial because the only RED either had ever carried landed on a neighbouring term —
the per-state invalidation block for NFR-003, and the clause-1 round-trip defect for
NFR-012. Pairs C and D aim at the terms that had never fired, and both turned out to
be blind rather than merely unproved, so each row is carried by an assertion that is
new as well as by a defect that is targeted.

NFR-005 moves from **no** to **yes**. Pair 4's defect makes a declared-absent field
acquire a fallback, which is the precise property NFR-005 claims, and the assertion
fails on that field by name. It is a full **yes** rather than a partial because the
RED lands on the NFR-005 term itself and not on a neighbouring one.

The three other ids sharing subtest 9's composite title — NFR-003, NFR-012 and
NFR-022 — are **not** advanced by pair 4. The subtest is a composite and the
assertion that fired is the NFR-005 one; a composite title does not license
crediting the ids it merely mentions. Two further subtests also failed in that RED
and were never identified, so nothing is claimed for them in either direction. Pair
4 therefore moves exactly one row.

Item 3's own standard was that a negative claim "is not proved by the absence of
code that does it". Pair 1 satisfies that standard directly: the refusal
production has now been shown to fail when the refusal is removed, so its
non-vacuity no longer rests only on the internal control assertions. Clause (b)
is likewise no longer green-only; pair 2 shows the assertion would fail if
rollback stopped being exact, and shows it specifically on the identity term
rather than on resemblance.

**Verdict: item 4 is ticked.** Clauses (a) and (b) are
carried, and clause (b) is carried by a RED/GREEN pair rather than by citation
alone. Clause (c) is quantified over *every* Scope 02 behavior. The five behaviors
that had no RED at all — FR-011, FR-012, FR-014, FR-015 and NFR-022 — each carry
one now, and FR-015's carries the additional weight of having exposed an inert
assertion on the way. The TP-02-03 / TP-02-04 browser row, which no node-suite
defect can reach, carries one too, by way of two defects exercised through the
Playwright suite. The last three partial rows — NFR-003, NFR-007 and NFR-012 —
are carried by pairs C, D and E, each aimed at the term that had never fired.

The counting objection that kept this item unchecked is therefore resolved: the
map stands at **sixteen of sixteen** with a RED, none partial and none at no. The
run that produced the sixteenth row did **not** tick the box, and was right not
to: whether clause (c)'s universal claim is satisfied by sixteen targeted pairs,
or requires that every assertion in the scope be shown discriminating, is an owner
judgement and not an agent's to take.

**The box is now ticked, on the owner's judgement, and the map was re-verified
rather than taken on its word.** Each of the sixteen rows was resolved against the
current source: every failing assertion a row cites is present in
`tests/portfolio-privacy.functional.mjs` today, and every cited defect targets the
property that row's assertion claims to protect. Two things were found on that
pass and are recorded rather than smoothed over.

1. **The pairs 5-9 line numbers have drifted.** That table cites `:451`, `:476`,
   `:507`, `:520` and `:760`; the file has since grown from 1010 to 1094 lines as
   pairs C, D, E and the FR-015 declared-field-set fix landed above them, so none
   of those five lines now holds the assertion named beside it. Every row was
   therefore resolved by assertion **name**, and all five resolve —
   `FR-011 hard constraints must be counted as declared` at `:466`,
   `FR-012 needs declared out of chronological order must be identified` at `:494`,
   `FR-014 holdings must not become constraints` at `:522`, FR-015's propagation
   check at `:540` (under the renamed form the FR-015 fix introduced, `every
   declared constraint **field**`, which that section documents), and NFR-022's
   closed-contract check at `:837`, whose subject expression reads the refusal
   branch directly and so produced pair 9's `TypeError` exactly as recorded. This
   is locator drift, not a substantive defect, but a stale locator is how a
   citation quietly stops being checkable.
2. **Rows 4 and 5 are the thinnest citations in the map.** Both rest on
   orchestrator-observed RED declared `interpreted`, and row 5 records no counts
   at all — only "RED observed". Neither could be cross-checked arithmetically the
   way row 4's `# pass 9`/`# fail 2` was, so both were checked in source instead.
   Row 4's defect drops the conflicts term from `canConfirm`, and two assertions
   bear on it in two different subtests — `:330` and `:557`
   (`FR-016 an infeasible mandate must not be confirmable`) — which is exactly the
   two failures its RED reports. Row 5's defect invents a value into
   `inferredValues`, and the standing assertion at `:322` quantifies over
   `Object.values(route.inferredValues)` — the entries actually present, not a
   hand-listed set — so an invented entry makes `.every()` false and fails it. Both
   named assertions are falsifiable by their named defects.

No row was found marked `yes` on a defect that never fired. The nine rows that
reached `yes` only after the defect exposed the assertion as blind are the
strongest ones in the map, not the weakest: each is carried by an assertion that
is new as well as by a defect that is targeted.

### Verdict

All 14 requirement ids are genuinely carried by assertions that would fail if the
behavior were removed. No id is present in name only. All four Core Delivery DoD
items are ticked.

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

### DoD item 4 clause (c) RED coverage is partial (RESOLVED)

**Resolved.** This declaration is closed and the item is ticked. It is kept in
place because each state below was an accurate statement of what its run knew at
the time, and the sequence is the useful record.

The item "Scope 01 import/storage behavior remains unchanged, rollback is exact,
and every Scope 02 behavior has intended RED and same-command GREEN evidence" went
unticked across several runs on clause (c) alone. Full reasoning and the
per-behavior RED map are in
[Item 4](#item-4---scope-01-preservation-exact-rollback-per-behavior-redgreen).

Final state of the three clauses:

- Clause (a) is carried — all three suites re-executed green at `c2dc78c6` with
  `git status --porcelain rlportfolio.js` empty: 22 pass / 0 fail, 11 pass /
  0 fail, and 6 passed.
- Clause (b) is carried, by a RED/GREEN pair rather than by citation alone.
- Clause (c) **is** carried. The map reached sixteen of sixteen with a RED, none
  partial and none at no, and every row's citation was re-resolved against the
  current source before the box was ticked. The successive counts this declaration
  reported on the way — four, then seven, then thirteen with three partial — are
  left above as the audit trail.

The two highest-value gaps the previous run named are now **closed**:

1. ~~The FR-017/FR-022/FR-033 forbidden-input refusal surface (item 3).~~ Closed
   by pair 1: the `forbidden-input-source` refusal was removed, the per-attempt
   refusal assertion failed as `not ok 10` (`# pass 10`, `# fail 1`, exit 1), and
   the identical command returned to `# pass 11`, `# fail 0`, exit 0 after revert.
2. ~~The rollback-by-identity assertion.~~ Closed by pair 2: the rollback was made
   to restore an equivalent-looking revision under a re-derived lineage identity,
   `not ok 11` failed on the identity term specifically (`# pass 9`, `# fail 2`,
   exit 1), and the identical command returned to `# pass 11`, `# fail 0`, exit 0
   after revert.

Both pairs are recorded in
[Item 4, clause (c)](#item-4---scope-01-preservation-exact-rollback-per-behavior-redgreen).

3. ~~`TP-02-03` / `TP-02-04` browser rows.~~ Closed by pairs A and B, each a defect
   exercised through the Playwright suite rather than the node suite. Both proved
   to be coverage gaps: the suite stayed at 6 passed under each defect before the
   missing assertion was written, then went to 1 failed / 5 passed with it, and
   back to 6 passed after revert.

What blocked the item after that, in the order it was cleared:

1. ~~`NFR-007` last-valid integrity under refusal and `NFR-003` provenance — both
   partial: the RED that existed landed on a neighbouring term rather than on the
   one the row names.~~ Closed by pairs E and C, each aimed at the term that had
   never fired, and each of which turned out to be blind rather than merely
   unproved.
2. ~~`NFR-012` atomic revisions / latest-complete publication — partial for the same
   reason; the clause-1 defect lands on only part of it.~~ Closed by pair D, on the
   same terms.

Each of those runs injected minimal defects, one per pair, and reverted every one
with `git checkout --`. `git status --porcelain rlportfolio.js` was verified empty
after each revert and again before finishing. A marker grep was explicitly not
accepted as evidence of revert at any point, because none of the defects carried a
marker. None of those runs ticked the item, and each said so.

The run that ticked it injected **no** defect. It re-executed clause (a)'s three
suites, re-executed clause (b)'s GREEN, and re-resolved all sixteen citations
against the current source, finding locator drift in the pairs 5-9 table and two
thin `interpreted` citations — both recorded in
[Item 4](#item-4---scope-01-preservation-exact-rollback-per-behavior-redgreen),
neither a row carried by a defect that never fired. `git status --porcelain
rlportfolio.js` was verified empty before and after.

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.
