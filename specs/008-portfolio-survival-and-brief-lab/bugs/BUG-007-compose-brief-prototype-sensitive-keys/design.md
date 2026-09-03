# Design: BUG-007 Compose Brief Prototype-Sensitive Keys

## Design Brief

### Current State

The original `composeBrief()` path used ordinary objects for caller-derived
subject and domain keys. That path let `__proto__`, `constructor`, and
`toString` resolve inherited built-ins before the category lookup threw.

Commit `d49a2955b` hardened every affected map and caller lookup. Commits
`82d1db5e5` and `3688388d5` repaired mutation causality and completed the
related error contract. Hardening later proved that reverting `82d1db5e5` does
not apply cleanly to the current tree and that replacing both files with parent
blobs removes unrelated subsequent integrity work.

`TP-B007-012` now has complete test-owned rollback and restoration evidence.
Its rollback DoD is checked, and human acceptance is recorded. Active planning
prose still describes that proof as open, while the scenario manifest repeats
the `executionOwner` key in its rollback object.

### Target State

One active design now matches the delivered architecture. Caller strings remain
data, accepted mutants fail through their protective assertion, and brief
refusals use the parent's closed error contract. The shared-infrastructure
rollback is a semantic injector-only inverse that leaves the current integrity
carrier in place as an independent old-state oracle, then restores the exact
final-tree bytes.

One active planning truth must also match that evidence. Planning records the
rollback proof as `executed-passed`, records acceptance without treating it as
open, and separates reconciliation from hardening and certification. The
rollback object contains one unambiguous `executionOwner: bubbles.test` key.

### Patterns To Follow

- Use the module's existing direct `Object.create(null)` pattern.
- Use `Object.prototype.hasOwnProperty.call()` for caller-supplied lookup maps.
- Route every brief error through `contractErr()`.
- Keep every production-emitted `P008-*` code in `rlportfolio.js::ERROR_CODES`.
- Keep mutation representation process-isolated and assertion-causal.
- Use the current integrity carrier as the independent rollback discriminator.
- Snapshot and compare final-tree bytes before rollback and after restoration.
- Treat undated lifecycle summaries as current views and dated evidence as
   immutable history.
- Keep proof, acceptance, planning, hardening, transition, scope, and
   certification as separate state dimensions.

### Patterns To Avoid

- Do not blacklist `__proto__`, `constructor`, or `toString`.
- Do not use `try/catch` to hide a partial composition.
- Do not read `owners` or `priorEvidenceIds` by inherited membership.
- Do not let both injector hooks claim one `require()`-based source load.
- Do not accept an injector, preload, anchor, syntax, or module-load failure as
  mutation discrimination.
- Do not emit the stale three-field brief error literal.
- Do not exclude error-code registry work from this bug's implemented boundary.
- Do not use a blind historical commit revert for shared test infrastructure.
- Do not replace the current integrity carrier with a historical parent blob.
- Do not treat an empty selector or an expected old-state failure as a pass.
- Do not rewrite dated evidence to repair an undated lifecycle summary.
- Do not use standard JSON parse success as proof that keys are unique.
- Do not make planner reconciliation claim test execution or human acceptance.

### Resolved Decisions

- Keep direct safe-map allocations and own-key membership visible at each site.
- Preserve accepted strings, lane aggregation, ordering, and refusal precedence.
- Assign `Module._compile` ownership to CommonJS `require()` carriers.
- Assign `fs.readFileSync` ownership only to direct text-evaluation carriers.
- Never write a represented test-owned source string into canonical source.
- Require one marker, one selected test, and one assertion-origin failure.
- Keep all 52 currently emitted Feature 008 `P008-*` codes registered.
- Route `err()` through seven-field `contractErr()` with explicit nulls.
- Accept absent or explicit-null optional fields in shared validation.
- Keep exact seven-field expectations for composer errors.
- Reverse only the dual-hook coordination behavior in the injector during a
   disposable rollback proof.
- Keep `tests/portfolio-test-integrity.unit.mjs` byte-identical so the exact
   `TP-B007-012` title remains an independent, non-vacuous oracle.
- Expect that oracle to reject the resurrected dual-hook defect, then require it
   to pass after byte-identical final-tree restoration.
- Preserve `bubbles.test` as the `TP-B007-012` execution owner and
   `bubbles.plan` as the reconciliation owner.
- Hand this design to `bubbles.plan`. After reconciliation, the plan hands the
   packet to `bubbles.harden` for a new exhaustive evaluation.
- Keep `TP-B007-011`, Build Quality, Scope 01, packet status, certification,
   and historical G061 normalization open under their existing owners.

### Open Questions

None. The analyst and UX contracts define every replacement value and owner.

## Purpose And Scope

This design reconciles FR-B007-001 through FR-B007-007 inside the existing
Portfolio Brief capability. The runtime repair covers caller-keyed aggregation,
caller-map membership, the brief error constructor, and the shared error-code
registry.

The test boundary includes the functional and browser carriers. It also
includes the shared process-isolated mutation injector and its test-integrity
carrier.

The repair adds no route, storage field, contract version, policy value,
configuration key, migration, or public function. It does not widen the
browser completion vocabulary.

## Authority And Ownership

The parent Feature 008 design remains authoritative for `PortfolioError/v1`,
the `RLPORTFOLIO_BRIEF` API, ranking, storage, privacy, and UI behavior. This
bug design narrows those contracts to the affected implementation surfaces.

| Surface | Design ownership |
| --- | --- |
| `rlportfoliobrief.js` | Owns caller-key aggregation and the brief-local canonical error constructor path. |
| `rlportfolio.js` | Owns the closed `ERROR_CODES` registry and `validatePortfolioError()`. |
| `tests/portfolio-defect-injector.cjs` | Owns process-isolated represented-source dispatch and marker accounting. |
| `tests/portfolio-test-integrity.unit.mjs` | Owns mutation causality, hook ownership, assertion-origin checks, and no-write verification. |
| Functional and browser carriers | Own persistent behavior and environment-parity assertions. |
| Parent Feature 008 design | Owns the cross-feature contract. This bug does not supersede it. |
| BUG-007 planning artifacts | Remain owned by `bubbles.plan` and must reflect this reconciled design. |

## Planning Truth Reconciliation

### Repair Boundary

This repair addresses only `HARDEN-B007-PLAN-LIFECYCLE-002` and
`HARDEN-B007-MANIFEST-DUPKEY-003`. It changes no runtime behavior and adds no
test obligation. It reconciles current planning views to evidence that already
exists.

`bubbles.plan` owns the required edits to `scopes.md`, `test-plan.json`,
`scenario-manifest.json`, and the undated `report.md` Completion Statement.
The plan may update execution routing metadata needed for its handoff. It must
not change certification or any historical transition record.

The repair preserves these surfaces byte-for-byte:

- Every dated report section and every raw evidence block.
- `uservalidation.md` and its human acceptance record.
- Product source and persistent tests.
- `state.json::certification` and top-level terminal status.
- Existing `transitionRequests`, including the G061 history finding.
- The `TP-B007-012` evidence section and its test ownership.

### Lifecycle State Model

Each dimension has one independent value. A completed dimension does not
promote any other dimension.

| Dimension | Current evidence truth | Required active planning value after repair | Owner |
| --- | --- | --- | --- |
| `TP-B007-012` execution | The test-owned rollback and restore sequence completed. | `executed-passed` | `bubbles.test` |
| Rollback DoD | The existing item is checked against the dated test evidence. | checked and evidence-linked | `bubbles.plan` reconciles only |
| Human acceptance | The human record exists. | `recorded` | human owner |
| Planning reconciliation | Findings 002 and 003 are open before the plan edit. | `reconciled-current-evidence` | `bubbles.plan` |
| Post-plan action | Hardening has not evaluated the repaired packet. | `exhaustive-hardening-reentry-required` | `bubbles.harden` next |
| Transition guard | `TP-B007-011` has not run as a certifying gate. | `not-run` and unchecked | `bubbles.validate` later |
| Build Quality | Its grouped item is open. | `unchecked` | later quality chain |
| Scope 01 | The scope has no terminal promotion. | `Not Started` | unchanged |
| Packet | The top-level state is nonterminal. | `in_progress` | unchanged |
| Certification | Validate has made no terminal certification. | `in_progress` | `bubbles.validate` |
| Historical G061 normalization | The finding remains unresolved. | `unresolved` | `bubbles.validate` |

The current design invocation hands findings 002 and 003 to `bubbles.plan`.
That routing belongs in this invocation's result envelope and execution
metadata. The repaired planning artifacts must name `bubbles.harden` as their
next owner because they describe the state after planner reconciliation.

### Field-Level Repair Map

| Artifact and active anchor | Stale or ambiguous content | Truthful replacement | Required preservation |
| --- | --- | --- | --- |
| `scopes.md` Implementation Plan item 5 | Calls rollback and restoration a separate open DoD obligation. | State that `TP-B007-012` is `executed-passed` by `bubbles.test` and the rollback DoD is checked against its dated evidence. | Keep the handoff procedure and evidence link. Do not claim planner execution. |
| `scopes.md` Implementation Plan item 6 | Routes `TP-B007-012` to `bubbles.test` for work already executed. | State that no test rerun is requested. Route the reconciled packet to `bubbles.harden` for exhaustive re-entry. | Keep `TP-B007-011`, Build Quality, Scope 01, packet status, and certification open. |
| `scopes.md` header and current dependency | Names `bubbles.harden` while planning repair is still pending. | Retain `bubbles.harden` only as the post-reconciliation owner. The design result itself routes first to `bubbles.plan`. | Keep packet status `in_progress`. |
| `report.md#completion-statement` | Routes to hardening before this reconciliation and calls human acceptance an open gate. | Replace only the undated statement with the exact post-reconciliation copy below. | Preserve every dated section, evidence block, command, digest, and finding record. |
| `test-plan.json::planningStatus` | `reconciled-route-to-harden` conflates an earlier route with current planning truth. | `reconciled-current-evidence` | Keep all test statuses, evidence references, commands, and test ownership. |
| `test-plan.json` top-level routing | Planning state and next action are encoded only through prose. | Add separate `nextRequiredOwner: bubbles.harden` and `nextRequiredAction: exhaustive-hardening-reentry`. | Do not encode hardening as passed. |
| `test-plan.json::evidenceBoundary` | Says human acceptance remains human-owned without recording its current state. | State that human acceptance is `recorded` and remains human-owned. | Keep `TP-B007-011`, Build Quality, certification, scope status, and terminal status open. |
| `scenario-manifest.json::planningReconciliation.finalTreeRollbackRestore` | Repeats `executionOwner` twice. | Keep exactly one `executionOwner: bubbles.test`. | Keep `status: executed-passed`, the evidence reference, `reconciliationOwner: bubbles.plan`, test row, design reference, handoff reference, and required sequence. |

The active `report.md` Completion Statement must use this post-reconciliation
copy:

```text
Packet status: in_progress
Planning reconciliation: reconciled-current-evidence
Next required owner: bubbles.harden
Next required action: exhaustive-hardening-reentry

TP-B007-012 was executed-passed by bubbles.test. The rollback and restore DoD
is checked against its dated evidence. Human acceptance is recorded. This
planner reconciliation claims no test execution, hardening result, transition
result, scope completion, packet completion, or certification.

TP-B007-011 is not-run and unchecked. Build Quality is unchecked. Scope 01 is
Not Started. Top-level status and certification.status are in_progress.
HARDEN-B007-G061-HISTORY-001 remains unresolved under bubbles.validate.
Historical evidence and route records remain unchanged.
```

### JSON Duplicate-Key Contract

The plan removes one repeated `executionOwner` member from the rollback object.
It must not reserialize unrelated manifest content or choose a value through
last-write-wins parser behavior.

Validation must parse `scenario-manifest.json` with duplicate-key rejection.
Ordinary `JSON.parse()` success is insufficient because it silently keeps the
last duplicate. The duplicate-aware parse must report zero repeated object
members across the complete document.

Follow the fail-closed decoder pattern already used by
`.github/bubbles/scripts/scope-universe-resolver.py`: decode object pairs in
source order, reject a key on its second occurrence, reject non-finite JSON
constants, and reject trailing non-JSON content. Reuse the pattern as a
validation model only. Do not modify the framework-managed resolver.

After strict parsing, the rollback object must satisfy all these assertions:

1. It has exactly one `executionOwner` member.
2. `executionOwner` equals `bubbles.test`.
3. `status` equals `executed-passed`.
4. `evidenceRef` equals
   `report.md#bug007-shared-infrastructure-rollback-restore`.
5. `reconciliationOwner` equals `bubbles.plan`.
6. Every other member and required-sequence entry remains unchanged.

Any duplicate, missing member, changed owner, changed evidence reference, or
changed status blocks the plan-to-harden handoff.

### Active And Historical Prose Rules

Active prose states current truth. It includes artifact headers, undated
summaries, the scopes Execution Outline and Implementation Plan, the structured
planning status, and the undated report Completion Statement.

Historical prose records what an owner observed at a dated execution epoch. It
includes dated report sections, raw command output, evidence digests,
transition requests, and execution history. This repair never rewrites those
records, even when their then-current routing differs from the new active view.

The plan may replace stale active prose. It must preserve links into dated
evidence. It must not copy a new status backward into an older evidence block.
It must not turn planner interpretation into test-owned execution evidence.

Human acceptance remains a separate historical record in `uservalidation.md`.
Active prose may state `recorded`, but it must not rewrite the human text or
claim that acceptance certifies the packet.

### Cheap Discriminating Checks

The planner repair uses planning checks only. Product and browser tests need no
rerun because this bounded repair changes no source, test, or behavior.

1. Run a duplicate-aware parse of `scenario-manifest.json` and require zero
   duplicate members.
2. Parse the structured artifacts and assert the exact lifecycle and routing
   values in the field-level map.
3. Require the two stale scopes statements to be absent from active prose.
4. Require the exact post-reconciliation Completion Statement to be present.
5. Inspect the scoped diff. Only the authorized plan-owned active regions and
   execution routing metadata may change.
6. Require every dated report section, raw evidence block, `uservalidation.md`,
   source file, test file, certification field, and transition request to be
   unchanged.
7. Run artifact lint, traceability, scenario obligations, test mechanisms,
   scope context, and capability-foundation validation against the packet.

The state-transition guard remains non-certifying at this stage. Its existing
G061 failure is validation-owned and cannot count against planner repair when
all plan-owned checks pass. The plan must not report that guard as passed.

## Architecture Overview

`composeBrief()` derives caller-keyed indexes from holdings, watchlist symbols,
completions, and evidence. Each internal index has no prototype. Every
missing-versus-present decision uses own-property membership.

The two caller-supplied maps remain caller-owned. The composer does not clone
or normalize them. It reads only own `owners` and `priorEvidenceIds` entries.

Brief-local refusals pass through `err()` into `contractErr()`. The constructor
returns the parent's seven-field `PortfolioError/v1` shape. The shared
validator checks the closed field vocabulary and code registry.

Mutation tests spawn an isolated Node process. The preload replaces one exact
source anchor in a test-owned in-memory string. CommonJS compilation and direct
text evaluation have exclusive hook ownership, so a represented defect cannot
pass because the injector failed before a protective assertion.

## Root Cause Analysis

### Controlling Path

For each retained completion, `composeBrief()` iterates
`[entry.subjectId, entry.domain]` and uses the string as a property key.

With `__proto__`:

1. `supportDatesBySubject[key]` resolves `Object.prototype`.
2. The date assignment writes onto `Object.prototype`.
3. `categoriesBySubject[key]` also resolves `Object.prototype`.
4. `.indexOf()` is missing, so a `TypeError` escapes.

With `constructor`, the inherited value is `Object`. With `toString`, it is
`Object.prototype.toString`. The same date write mutates that function object.
The same category lookup then throws.

Domains are independently vulnerable because the support loop passes both
subject and domain through the same key path, and `inferredDomains` is itself
an ordinary map.

### Reproduction-To-Source Match

The historical reproduction in `report.md#before-fix-reproduction` records the
same throw and built-in mutation for all six subject and domain cases. It is
prior execution evidence, not a current design-session test result.

The current source removes that path. `supportDatesBySubject`,
`categoriesBySubject`, and every sibling caller-keyed index now have null
prototypes. Their initialization and reads use explicit own membership.

### Mutation-Proof Root Cause

The original injector let `fs.readFileSync` and `Module._compile` represent the
same CommonJS load. The read hook first replaced the source. The compile hook
then received the already-replaced string and found zero copies of the original
anchor.

The prior integrity carrier accepted the resulting nonzero process status as
mutation discrimination. Its selected protective assertion never needed to
execute, so an injector self-error could satisfy the test.

Commit `82d1db5e5` gives each carrier one owner. The read hook records a pending
original and represented string. The compile hook consumes the matching
pending read, represents from the original, and records `Module._compile` as
the only application.

A direct text-evaluation carrier never compiles the represented string. Its
pending read remains until process exit, when the injector records
`fs.readFileSync` as the only application.

### Error-Contract Root Cause

The brief module had two error construction paths. `contractErr()` emitted the
closed seven-field shape, while `err()` emitted only `code`, `reason`, and
`field`. Local `composeBrief()` refusals therefore bypassed the canonical brief
constructor.

The shared `ERROR_CODES` registry also omitted nine codes already emitted by
Feature 008 production modules. `validatePortfolioError()` rejected those
otherwise named errors as `P008-SCHEMA-CORRUPT` because code membership is
closed.

The validator treated an explicit-null `field` or `row` as invalid whenever the
key existed. That behavior conflicted with `contractErr()`, which materializes
both optional keys as null when they do not apply.

Commit `3688388d5` resolves all three causes. `err()` delegates to
`contractErr()`, the registry includes the nine missing codes, and
`optionalErrorField()` accepts absent or explicit-null optionals before applying
their non-null validators.

### Complete Affected Inventory

Function and variable names are the durable implementation anchors.

| Surface | Owner | Current invariant |
| --- | --- | --- |
| `distinctCount()::seen` | `rlportfoliobrief.js` | Null-prototype set. `Object.keys()` counts only own entries. |
| `excludedBySubject` | `rlportfoliobrief.js` | Null-prototype set. No-action lookup uses own membership. |
| `supportBySubject` | `rlportfoliobrief.js` | Null-prototype count map for subjects and domains. |
| `categoriesBySubject` | `rlportfoliobrief.js` | Null-prototype map whose own values are category arrays. |
| `horizonBySubject` | `rlportfoliobrief.js` | Null-prototype map with an own-key first-write rule. |
| `newestSupportBySubject` | `rlportfoliobrief.js` | Null-prototype map with own absence distinguished from a stored value. |
| `supportDatesBySubject` | `rlportfoliobrief.js` | Null-prototype outer map with null-prototype date sets. |
| `qualifiesVia` | `rlportfoliobrief.js` | Null-prototype map for lane qualification. |
| `inferredDomains` | `rlportfoliobrief.js` | Null-prototype set enumerated through own keys. |
| `byId` | `rlportfoliobrief.js` | Null-prototype evidence map with own-key creation and lookup. |
| `owners` and `priorEvidenceIds` | Caller, read by `rlportfoliobrief.js` | Caller objects remain unchanged. Only own truthy entries participate. |
| `err()` and `contractErr()` | `rlportfoliobrief.js` | One seven-field constructor path for every brief-local failure. |
| `ERROR_CODES` | `rlportfolio.js` | Closed registry contains every `P008-*` code emitted by the three Feature 008 production modules. |
| `optionalErrorField()` and `validatePortfolioError()` | `rlportfolio.js` | Closed fields and codes. Optional `field` and `row` accept absence or explicit null. |
| `pendingTargetReads` and both preload hooks | `tests/portfolio-defect-injector.cjs` | One represented source string has one carrier owner and one marker application. |
| `mutationCausalityProblems()` | `tests/portfolio-test-integrity.unit.mjs` | One selected test must fail through `ERR_ASSERTION`, with no infrastructure-failure signature. |

`COVERAGE_RANK`, `LANE_SOURCE`, and the Intl parts object are excluded from this
inventory. They are fixed-vocabulary maps and are not keyed by the completion
subject/domain contract under repair.

## Reconciled Implementation Design

### Direct Null-Prototype Allocation

Each affected internal map uses `Object.create(null)`:

- `distinctCount()` uses local `seen`.
- All nine named `composeBrief()` aggregation maps use it.
- Each newly created per-subject support-date set uses it.

The implementation adds no `safeMap()`, `dictionary()`, or `hasOwn()` wrapper.
Ten finite allocation sites remain directly auditable inside the composer.

### Own-Property Membership

Null-prototype allocation and own membership are separate invariants. Every
key-presence decision over the affected maps uses this semantic:

```js
Object.prototype.hasOwnProperty.call(map, key)
```

The implementation applies it to these decisions:

- Initialize and increment `supportBySubject`.
- Create nested `supportDatesBySubject` sets.
- Create `categoriesBySubject` arrays.
- Retain the first `horizonBySubject` value.
- Compare or set `newestSupportBySubject`.
- Create `qualifiesVia` entries.
- Create `byId` evidence aggregates.
- Resolve `byId[subjectId]` for a qualified subject.
- Distinguish `excludedBySubject` membership.
- resolve support counts, category arrays, horizons, and newest support when
   producing explanations.
- Resolve inferred-domain date sets before counting their own date keys.
- Resolve the two caller-supplied maps described below.

No affected decision uses `key in map`, falsey direct lookup, fallback lookup,
or inherited direct lookup as membership. `Object.keys()` remains the
enumeration mechanism.

### Caller-Supplied Lookup Maps

The caller's `owners` and `priorEvidenceIds` objects remain unchanged. Before
reading a qualified subject, the composer tests own membership with
`Object.prototype.hasOwnProperty.call(map, subjectId)` and treats a miss as
`null`.

The composer binds one resolved owner per subject. It reuses that value for
`owner`, `unownedCapability`, and `deepLink`. An own falsey owner preserves the
existing falsey-to-null behavior.

The composer resolves prior evidence once through own membership before calling
`.slice()`. An own falsey value preserves the existing no-prior result. The
repair adds no array coercion or new validation envelope.

These rules preserve own entries created by `JSON.parse()` or a null-prototype
caller map, including an own `__proto__` property. They ignore inherited
properties.

### Accepted Inherited-Looking Keys

The direct `composeBrief()` contract accepts the three strings named by this
bug. It treats `__proto__`, `constructor`, and `toString` as data. The repair
does not reject, rewrite, lowercase, or reserve them.

The production completion recorder has a narrower token contract. Its subject
validator accepts lowercase letters, digits, and hyphens. It accepts
`constructor`, but rejects `__proto__` and `toString`. The browser carrier
preserves that contract.

The allocation route fixes the completion domain to `portfolio-research`.
Hostile domains are not user-enterable there. They remain direct-export cases
because `composeBrief()` accepts them.

### Mutation-Injection Causality

The shared preload represents one exact source substitution in a child process.
It never writes the represented string to `rlportfolio.js`,
`rlportfoliobrief.js`, `rlportfolioanalytics.js`, or any persistent test.

For CommonJS carriers, `fs.readFileSync` computes and queues the represented
string. `Module._compile` matches that string, consumes its original, applies
the representation once, and owns the marker as `Module._compile`.

For direct text-evaluation carriers, no compile follows. The exit handler
records the unconsumed pending representation once as `fs.readFileSync`.

The integrity carrier accepts a mutant only when all conditions hold:

1. The exact anchor occurs once and the represented source differs.
2. Exactly one application marker names the expected module and hook.
3. Exactly one selected protective test executes.
4. The child exits nonzero with one failed test and zero passed tests.
5. Output identifies that selected test and an `ERR_ASSERTION` failure.
6. Output contains no injector, preload, setup, anchor, syntax, or module-load
   failure signature.
7. Hashes for product source and persistent tests remain unchanged.

The deliberate double-application control records both hooks and must be
rejected. The uncoordinated already-represented compile must retain its exact
zero-anchor refusal and record no successful application.

### Canonical Brief Error Constructor

`contractErr()` is the one brief error constructor. Public brief functions call
it directly. `composeBrief()`'s local `err()` helper delegates to it with a
null row and `recoverable: false`.

Every brief error materializes this exact seven-field vocabulary:

```text
PortfolioError/v1 {
   contractVersion,
   code,
   reason,
   field,
   row,
   valueEchoed,
   recoverable
}
```

An inapplicable `field` or `row` is explicit `null`. `valueEchoed` is always
false. The constructor does not include the rejected value.

`validatePortfolioError()` keeps the parent's closed field contract. It accepts
an optional `field` or `row` when absent or explicit null. A non-null field must
be a nonempty string. A non-null row must be a positive integer.

The shared `rlportfolio.js::portfolioError()` constructor may omit an
inapplicable optional key. The validator accepts that existing form and the
brief's explicit-null form without widening the seven-name vocabulary.

### Full Emitted-Code Registry Invariant

`rlportfolio.js::ERROR_CODES` is the canonical closed registry. Every
`P008-*` code emitted by `rlportfolio.js`, `rlportfoliobrief.js`, or
`rlportfolioanalytics.js` must appear in it. The emitted and registered sets
must remain equal.

The current 52-code set is:

```text
P008-CONFIG
P008-STORE-UNAVAILABLE, P008-STORE-WRITE, P008-STORE-CONFLICT
P008-SCHEMA-FUTURE, P008-SCHEMA-CORRUPT, P008-MIGRATION
P008-IMPORT-SHAPE, P008-IMPORT-SECRET
P008-MANDATE-SHAPE, P008-MANDATE-AUTHORITY
P008-IDENTITY, P008-CURRENCY, P008-NUMERIC, P008-DATA-COVERAGE
P008-ALIGNMENT, P008-COVARIANCE, P008-PATH, P008-INFEASIBLE, P008-SOLVER
P008-GENERIC-EVIDENCE, P008-EXPORT, P008-DOSSIER, P008-HOLDING-EDIT
P008-CLEAR-CONFIRMATION, P008-CLEAR-UNDECLARED, P008-CLEAR-PARTIAL
P008-REBASE-PARTIAL, P008-TRUTH-INPUT
P008-BEHAVIOR-IDENTITY, P008-BEHAVIOR-TIME, P008-BEHAVIOR-FLOOR
P008-BRIEF-INPUT, P008-BRIEF-TIME, P008-BRIEF-EVIDENCE
P008-BRIEF-COMPOSE, P008-BRIEF-COMPOSED, P008-BRIEF-CUTOFF
P008-BRIEF-POLICY, P008-BRIEF-PUBLISHED, P008-BRIEF-WINDOW-ID
P008-BRIEF-WINDOWS
P008-ACTION-SHAPE, P008-ACTION-RANK, P008-ACTION-WHY
P008-ACTION-LIFECYCLE
P008-COMPUTE-BUDGET, P008-COMPUTE-CANCELLED
P008-COMPUTE-SUPERSEDED, P008-WORKSPACE-COMPUTE
P008-RETURN-CONTEXT, P008-INTERNAL
```

Commit `3688388d5` added the nine previously emitted but unregistered codes:

- `P008-BRIEF-COMPOSED`
- `P008-BRIEF-CUTOFF`
- `P008-BRIEF-POLICY`
- `P008-BRIEF-PUBLISHED`
- `P008-BRIEF-WINDOW-ID`
- `P008-BRIEF-WINDOWS`
- `P008-REBASE-PARTIAL`
- `P008-TRUTH-INPUT`
- `P008-WORKSPACE-COMPUTE`

An unknown code still fails shared validation as `P008-SCHEMA-CORRUPT`.

### Ordering And Contract Preservation

`Object.keys()` over null-prototype objects preserves own enumerable key order
under the same ECMAScript rules used by ordinary objects. `LANE_ORDER` fixes
lane order. Materiality and subject ID explicitly sort items.

Existing local checks remain before aggregation. Shared policy validation stays
at its current insertion point. No catch branch converts a failure into output.

The normal control must retain these observable values:

- Lane order: `held,watchlist,completedResearch,inferredRelevance`.
- Subject order: `MSFT,BND,ZZTOP,semiconductors`.
- One highest-authority lane per subject.
- Unchanged `alsoQualifiesVia` aggregation.
- Unchanged no-action reason and subject ordering.
- Unchanged materiality sort and queue suppression.
- Unchanged action signature construction.

### Result And Error Contract

The repair introduces no public signature or contract-version change.
`composeBrief()` keeps `{ ok: true, value }` and `{ ok: false, error }`.

Removing inherited lookup prevents the original `TypeError`. Existing input,
window, timestamp, cutoff, and shared-policy failures retain their code,
reason, field, and precedence. Composer-local failures now carry the other four
required `PortfolioError/v1` fields as well.

## Data Model And Storage

No persisted data model changes. Behavior events, workspaces, owner-read
artifacts, and prior evidence input retain their current schemas.

Null-prototype maps remain invocation-local implementation details. They are
not serialized into the returned brief.

## API Contract

`RLPORTFOLIOBRIEF.composeBrief(input)` keeps its signature and contract version
`rl-portfolio-brief/v1`. No input field changes.

`owners` and `priorEvidenceIds` retain ordinary object input compatibility.
Only own entries participate. An inherited entry behaves like an absent entry.

An accepted inherited-looking subject or domain follows the same lane,
evidence, floor, explanation, and no-action rules as any ordinary string.

Every local `composeBrief()` refusal now follows `err()` to `contractErr()`.
The returned error always carries the seven names defined by the parent design.
The shared validator rejects unknown fields, unsafe reasons, unknown codes,
echoed values, invalid recovery flags, invalid non-null fields, and invalid
non-null rows.

Registry completeness is part of API validity. A production emitter cannot add
a `P008-*` code without adding the same code to `ERROR_CODES` in the same
coherent change.

## UI And Browser Visibility

The allocation page loads `rlportfoliobrief.js`. Its `renderBrief()` path calls
the exported composer and renders rows into `#briefLanes` and `#briefNoAction`.

The production completion input is `#behaviorSubject`. `completionDraft()`
passes its trimmed value to the behavior constructor. The accepted
`constructor` value is therefore user-reachable.

The browser carrier records `constructor` through the existing preview and
confirm controls. It rerenders the Brief and requires a visible
completed-research row or named no-action row, an enabled window control, and
no uncaught page error.

The browser-runtime matrix invokes `window.RLPORTFOLIOBRIEF.composeBrief`
directly for all six subject and domain cases. That matrix covers UMD runtime
parity. It does not represent the four values that the production recorder
cannot create as user-visible inputs.

## Security And Privacy

The repair prevents caller data from selecting or mutating inherited built-in
objects. The functional and browser carriers snapshot `Object.prototype`,
`Object`, and `Object.prototype.toString` around every hostile call.

Cleanup remains mandatory in a `finally` block so a pre-fix RED run cannot
contaminate later tests. The test must report mutation before cleanup and must
prove cleanup afterward.

No personal value, owner object, or prior evidence array is logged or added to
a public artifact. The change adds no network request or storage write.

## Configuration, Migration, And Rollout

No configuration, migration, flag, or data rewrite applies. The repair ships
as static source and test assets.

Production and error-contract rollback has two independent coherent units:

1. Reverting `d49a2955b` restores the unsafe map and lookup behavior. It also
   reopens the original high-severity integrity and availability defect.
2. Reverting `3688388d5` removes the nine registry entries, restores the
   three-field local composer error, rejects explicit-null optionals, and makes
   the corrected exact expectations fail.

A shared-infrastructure rollback of the behavior introduced by `82d1db5e5` is
different. It must use the final-tree-safe semantic contract below. A blind
`git revert` is invalid because the current integrity carrier has subsequent
changes. Replacing both files with parent blobs is invalid because it erases
those changes and removes the independent canary title. No stored state needs
restoration.

## Final-Tree-Safe Rollback And Restore Contract

### Purpose And Execution Boundary

This contract proves that the current shared injector repair is reversible and
that its canary detects the behavior which the repair removed. The proof runs
only in a disposable clone or copy at the exact candidate revision. It never
mutates the operator checkout, index, branch, commits, or untracked files.

The proof boundary contains two shared-test paths:

- `tests/portfolio-defect-injector.cjs` is the only rollback-mutated file.
- `tests/portfolio-test-integrity.unit.mjs` remains byte-identical and acts as
  the independent final-tree oracle.

Product source, functional tests, browser tests, planning artifacts, persisted
data, and the separate `3688388d5` error-contract batch are read-only controls.
No history rewrite, commit, staging operation, or push is authorized.

### Final-Tree Preconditions

The execution owner must start from a clean disposable clone at the exact
candidate revision and record the baseline SHA-256 for these five paths:

1. `tests/portfolio-defect-injector.cjs`.
2. `tests/portfolio-test-integrity.unit.mjs`.
3. `rlportfolio.js`.
4. `rlportfoliobrief.js`.
5. `tests/portfolio-brief.functional.mjs`.

At design epoch `22bd024068fd021c9ae6893ffd503bdb13a96a23`, the expected
hashes are:

| Path | Expected SHA-256 |
| --- | --- |
| `tests/portfolio-defect-injector.cjs` | `6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0` |
| `tests/portfolio-test-integrity.unit.mjs` | `77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e` |
| `rlportfolio.js` | `ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0` |
| `rlportfoliobrief.js` | `2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30` |
| `tests/portfolio-brief.functional.mjs` | `875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124` |

If the candidate revision changes any baseline byte or adds a post-design
injector edit, execution must stop and this semantic patch must be reconciled
against that new final tree. Historical hashes are preconditions, not a reason
to overwrite newer content.

Before mutation, the exact title
`BUG-007: represented mutants execute one protective assertion through one intended hook`
must occur exactly once in the unchanged integrity carrier. The exact selector
must collect one test and pass one of one. These checks establish that the
oracle exists independently of the injector behavior being rolled back.

### Exact Semantic Inverse

Apply a reviewed reverse patch only to
`tests/portfolio-defect-injector.cjs`. The patch reverses these exact current
symbols and behaviors:

| Current final-tree behavior | Required rollback behavior |
| --- | --- |
| `DOUBLE_APPLICATION_CONTROL` and `pendingTargetReads` coordinate ownership. | Remove both coordination variables. |
| `representedSource()` validates and substitutes while `recordApplication()` records ownership. | Collapse validation, substitution, and marker append back into one `represent(source, via)` function. |
| `takePendingTargetRead()` lets `_compile` recover the original source after the read hook represented it. | Remove `takePendingTargetRead()` entirely. |
| `_compile` consumes a matching pending read, represents the original, and records `Module._compile`. | Represent the received `content` directly and use the legacy `require` marker label. |
| `readFileSync` queues `{ original, mutated, markerRecorded }` and normally defers marker ownership. | Return `represent(result, "readFileSync")` immediately. |
| The process-exit handler records an unconsumed direct-text representation once. | Remove the process-exit handler. |

The reverse patch must match every named current anchor exactly once before it
is applied. It must fail rather than partially apply when an anchor is absent or
duplicated. It must not edit comments or any block outside those coordination
hunks merely to resemble the historical file.

Do not edit `tests/portfolio-test-integrity.unit.mjs`. In particular, preserve
all current mutation metadata, BUG-008 and BUG-009 carriers, the v2 41-item
scope-claims verifier, current refusal controls, helper functions, and both
BUG-007 test titles. Byte identity of the whole file is the definitive check
that every subsequent integrity improvement survived.

The protected later-history inventory is:

- `7c0c5d64`: BUG-008 hook metadata and shared mutation-causality adoption.
- `4824edc8`: the BUG-009 named risk-exclusion carrier correction.
- `6c84913a`: scope attribution, consumer checks, and the 41-item verifier.
- `29a6f402`: the v2 authority-derived scope-claims and refusal contract.
- `2fe7bec9`: bounded analysis caching and plan-authoritative causal checks.

### Rollback Preservation Checks

Immediately after applying the semantic inverse, all of these conditions are
required:

1. The disposable clone diff names only
   `tests/portfolio-defect-injector.cjs`.
2. The integrity-carrier SHA-256 still equals its baseline hash.
3. The three `3688388d5` control-file hashes still equal their baseline hashes.
4. The exact `TP-B007-012` title still occurs exactly once.
5. No path is staged and the operator checkout hashes and status remain
   unchanged.

The integrity-file byte check subsumes each of the five post-`82d1db5e5`
commits that changed that file. The three separate control hashes prove the
`3688388d5` error constructor, registry, validator, and matching functional
expectations were not conflated with this rollback.

### Expected Reverted-State Behavior

Rollback mechanics and behavioral expectation are intentionally distinct. The
semantic inverse resurrects the old dual-hook defect for CommonJS carriers:

1. `fs.readFileSync` represents and marks the target source first.
2. `Module._compile` receives that already-represented source.
3. The compile hook searches for the original anchor, finds zero copies, and
   raises the injector's exact zero-anchor refusal.

The unchanged current canary must detect that defect. Running its exact selector
in the reverted state must produce a nonzero process result with exactly one
collected top-level test, zero passes, one failure, the exact selected title,
and the zero-anchor or infrastructure-origin diagnostic. That result is the
expected old-state proof. It must not be reported as a passing current canary.

An empty selector is never evidence. The title cardinality check and the TAP
collection count are both mandatory, so removal of the oracle cannot turn the
expected failure into a vacuous success.

### Restore-To-Current-Tree Checks

Restore only `tests/portfolio-defect-injector.cjs` from the disposable clone's
captured final-tree baseline. Then require all of these conditions:

1. All five SHA-256 values equal the pre-probe baseline values.
2. The scoped diff across all five paths is empty.
3. The disposable clone has no staged or unstaged change.
4. The exact `TP-B007-012` selector collects one test and passes one of one.
5. The exact title remains present once, with zero skipped or cancelled tests.
6. The operator checkout status and hashes equal their pre-probe observations.

Only the complete sequence proves reversibility: current GREEN, expected
old-state detection, byte-identical restoration, and restored current GREEN.
Failure in any phase leaves the rollback/restore obligation open.

## Observability And Failure Handling

This pure browser and Node module has no trace or metric workflow. The result
envelope and the page's existing unavailable state remain the observable
failure surfaces.

No new log or console output is required. Test-owned marker files record only
the represented module, selected hook, and represented byte count. They contain
no portfolio value or rejected caller key.

An uncaught exception, shared built-in mutation, wrong marker count, wrong hook,
infrastructure-origin mutant failure, changed refusal envelope, or changed
visible order is a failure signal.

## Implementation Locations And Persistent Consumers

| Surface | Current owner | Current obligation |
| --- | --- | --- |
| safe maps, lookups, and brief errors | `rlportfoliobrief.js` | Preserve null-prototype aggregation, own membership, and one seven-field constructor path. |
| code registry and error validator | `rlportfolio.js` | Keep emitted and registered codes equal. Accept absent or explicit-null optionals only. |
| visible route caller | `portfolio-survival-allocation-lab.html` | Preserve rendering, accepted `constructor` recording, and unavailable behavior. |
| focused functional carrier | `tests/portfolio-brief.functional.mjs` | Preserve normal, six-case, lookup, cleanup, refusal, and exact seven-field assertions. |
| real browser carrier | `tests/portfolio-survival-brief.spec.mjs` | Preserve the direct browser matrix and visible `constructor` workflow. |
| mutation causality carrier | `tests/portfolio-test-integrity.unit.mjs` | Reject zero, double, wrong-hook, wrong-test, and infrastructure-origin representations. |
| process-isolated representation preload | `tests/portfolio-defect-injector.cjs` | Coordinate exclusive hook ownership and never write represented canonical source. |
| broader repository check | `scripts/selftest.mjs` | Remains broader regression coverage, not a scenario-specific substitute. |

## Regression Design

### Functional Carrier

`tests/portfolio-brief.functional.mjs` carries these assertions:

1. Execute the ordinary four-lane fixture and assert exact lane and subject
   order plus representative refusal non-movement.
2. Execute `__proto__`, `constructor`, and `toString` as completion subjects.
3. Execute the same matrix as completion domains.
4. Assert no call throws and every call returns its declared result shape.
5. Assert each key appears as an own aggregation result with the expected lane,
   no-action reason, count, and inference floor.
6. Snapshot `Object.prototype`, `Object`, and `Object.prototype.toString` before
   every call, inspect mutation before cleanup, and delete process-local probe
   properties in `finally`.
7. Assert absent `owners` and `priorEvidenceIds` entries remain absent, while
   explicit own entries for each hostile key remain readable.
8. Assert inherited owner and prior-evidence properties remain absent.
9. Assert the two local composition-time refusals as exact seven-field objects.
10. Assert a public brief boundary exposes exactly the seven allowed error keys.

The emitted-versus-registered code equality was executed during the contract
repair and recorded in the bug report. Current BUG-007 persistent carriers do
not contain a dedicated equality title. Planning must represent this invariant
without weakening the focused behavior carriers.

### Browser Carrier

`tests/portfolio-survival-brief.spec.mjs` carries these assertions:

1. Invoke the browser-global exported composer for all six hostile subject and
   domain cases.
2. Assert the same result, order, floor, built-in integrity, and no-throw
   contract as the functional carrier.
3. Record `constructor` through the production completion controls.
4. Rerender through the existing window control.
5. Assert `constructor` is visible in its proper row or named no-action state.
6. Assert the route remains operable and emits no uncaught page error.

The broader Feature 008 browser suite then proves normal user workflows do not
move. It does not replace the scenario-specific carrier.

### Mutation Controls

`tests/portfolio-test-integrity.unit.mjs` and
`tests/portfolio-defect-injector.cjs` carry exact one-anchor, in-memory
substitutions for these controls:

1. Restore one representative caller-keyed allocation to `{}` and require the
   unchanged hostile matrix to fail.
2. Replace one caller-map own-membership decision with inherited direct lookup
   and require the own/inherited lookup test to fail.
3. Swap the first two `LANE_ORDER` entries and require the exact normal-order
   assertion to fail.
4. Expose one CommonJS load to both hooks and require two applications to fail
   infrastructure validation.
5. Use a registered direct-text mutation to prove `fs.readFileSync` still owns
   non-CommonJS text evaluation.
6. Compile already-represented source without coordination and require the
   zero-anchor refusal to record no application.

An accepted mutant reports one application through its intended hook. Its one
selected protective test fails through `ERR_ASSERTION`. The injector never
writes represented source into a canonical module or persistent test.

### Rollback And Restoration Proof

The rollback proof reuses the exact current `TP-B007-012` title as an unchanged
oracle. It does not roll that title or its assertion helpers backward. The
required sequence is:

1. Current final tree: exact title cardinality is one and the selector passes
   one of one.
2. Semantic injector inverse: only the injector differs; the unchanged selector
   collects one test and fails because it detects the resurrected dual-hook
   infrastructure defect.
3. Final-tree restoration: all five controlled paths are byte-identical to the
   baseline and the same selector passes one of one again.

This sequence tests both directions without asking a current-behavior canary to
pass against intentionally reverted behavior.

### Scenario-To-Test Mapping

| Scenario | Persistent consumer | Required assertion |
| --- | --- | --- |
| `SCN-B007-NORMAL-COMPATIBILITY` | functional carrier, browser carrier, test-integrity mutation | exact normal lane and subject order plus refusal non-movement |
| `SCN-B007-SUBJECT-KEY-SAFETY` | functional carrier, browser-global matrix, visible `constructor` path | own subject behavior, no throw, no built-in mutation, inherited caller-map absence |
| `SCN-B007-DOMAIN-KEY-SAFETY` | functional carrier, browser-global matrix | actual domain counts and dates, no throw, no built-in mutation |
| `SCN-B007-MUTATION-MECHANISM-CAUSALITY` | test-integrity carrier and shared injector | one intended hook, one marker, one selected protective assertion, direct-text parity, and double-application rejection |
| Final-tree rollback and restoration | unchanged exact `TP-B007-012` selector plus five-path byte controls | current pass, expected reverted-state detection, integrity and error-batch preservation, byte-identical restore, restored pass |
| Parent `PortfolioError/v1` invariant | functional carrier plus emitted-code inventory | exact seven-field composer errors, explicit-null validity, and zero emitted-but-unregistered codes |

## Alternatives Considered

1. **Reject the three names.** Rejected because the public contract accepts
   strings and no product rule reserves JavaScript prototype names.
2. **Catch `TypeError`.** Rejected because mutation occurs before the throw and
   a caught partial brief would fabricate completeness.
3. **Convert all maps to `Map`.** Rejected because it broadens iteration and
   serialization mechanics when the module already has a safe plain-object
   representation.
4. **Repair only `categoriesBySubject`.** Rejected because at least nine later
   caller-keyed surfaces and two lookup maps would remain vulnerable.
5. **Add a shared safe-map helper.** Rejected because all affected allocations
   are finite and local to one function. Direct calls match the module and keep
   the security property visible.
6. **Widen the browser token contract.** Rejected because the source repair
   does not require new user input. Direct-export tests cover values the current
   recorder rejects.
7. **Exclude injector changes.** Rejected because the shared dual-hook behavior
   itself caused false mutation discrimination.
8. **Let both hooks represent CommonJS loads.** Rejected because a zero-anchor
   injector failure could replace the protective assertion.
9. **Keep the three-field `err()` result.** Rejected because the parent contract
   defines the closed seven-field vocabulary.
10. **Permit emitted codes outside the registry.** Rejected because shared
    validation would replace the named cause with schema corruption.
11. **Reject explicit null for optional fields.** Rejected because the canonical
    brief constructor uses explicit null to retain all seven keys.
12. **Blindly revert `82d1db5e5`.** Rejected because the current integrity file
   contains subsequent changes and the revert conflicts on the final tree.
13. **Replace both shared-test files with parent blobs.** Rejected because that
   removes unrelated integrity work and the independent exact canary title.
14. **Expect the current canary to pass in the reverted state.** Rejected
   because rollback intentionally resurrects the defect. The valid old-state
   assertion is that the unchanged canary collects one test and detects it.

### Single-Implementation Justification

This is a narrow repair inside one existing composition capability. It adds no
provider, adapter, strategy, route, storage layer, or second contract. A new
capability foundation or safe-map abstraction would add indirection without
removing real complexity.

## Complexity Tracking

None — simplest viable approach used.

## Change Boundary

The delivered implementation boundary contains:

- `rlportfolio.js`.
- `rlportfoliobrief.js`.
- `tests/portfolio-brief.functional.mjs`.
- `tests/portfolio-survival-brief.spec.mjs`.
- `tests/portfolio-test-integrity.unit.mjs`.
- `tests/portfolio-defect-injector.cjs`.
- This `design.md` for design-owner reconciliation.

Excluded:

- All parent Feature 008 scope files and root `test-plan.json`.
- Sibling bug packets.
- policy JSON, storage schemas, navigation, route contracts, and public HTML
   source.
- analytics behavior beyond inclusion of its emitted codes in the shared
   registry invariant.
- Unrelated object maps elsewhere in the repository.
- source, persistent tests, scopes, report, scenario manifest, structured Test
   Plan, human acceptance, certification, and transition-request changes in
   this design-owner invocation.

This design-owner invocation may update only this `design.md` and
execution-owned current-agent metadata in `state.json`. Any state update must
leave top-level status, `certification.*`, transition requests, finding history,
and G061 evidence unchanged.

The shared injector is an implemented, test-owned dependency. Its representation
is process-isolated and memory-only with respect to canonical source. Its marker
file is test-owned temporary output, not a represented source file.

`bubbles.plan` owns the planning-truth reconciliation defined above. Its repair
must remain within `scopes.md`, `test-plan.json`, `scenario-manifest.json`, the
undated report Completion Statement, and plan-owned execution routing metadata.

## Risks And Open Questions

- A partial allocation-only repair leaves caller-map reads vulnerable.
- A partial own-membership-only repair leaves ordinary `__proto__` assignment
  semantics in internal maps.
- A direct browser-global test alone would miss the visible accepted
  `constructor` path.
- A dual-hook mutant can look discriminating while failing before its protective
   assertion. Exact marker, test-count, failure-origin, and infrastructure scans
   remain mandatory.
- A new production `P008-*` code can make a truthful failure fail closed as
   schema corruption unless the registry changes with its emitter.
- A loose or partial error assertion can let the three-field constructor return.
- A rollback probe can become vacuous if it removes its own selector. The
   unchanged-carrier cardinality and TAP-count checks prevent that outcome.
- Restoring only functional behavior without restoring exact bytes can conceal
   collateral edits. Five-path hash equality and an empty scoped diff are both
   required.
- Open questions: None.

## Provenance Finding Closure - 2026-09-03 {#bug007-design-provenance-closure-20260903}

### Design Disposition

No design delta is required. The analyst and UX adjudications repair provenance
and active routing only. They change no technical architecture, product
behavior, rollback contract, security boundary, or test mechanism.

The existing null-prototype allocation, own-property membership, error
contract, mutation causality, and final-tree-safe rollback design remain
authoritative. Product source, persistent tests, accepted behavior,
`TP-B007-012` execution, and certification remain unchanged by this record.

This section supersedes only earlier future-tense lifecycle routing in this
design. It does not reopen or relabel any original hardening finding.

### Finding Accounting

| Finding | Current disposition | Design effect |
| --- | --- | --- |
| `AUDIT-B007-ROUTE018-PROVENANCE-001` | Addressed by the analyst adjudication in `spec.md#bug007-route-018-analyst-adjudication-20260902`. | None. Preserve the technical design. |
| `AUDIT-B007-UX-OWNERSHIP-001` | Addressed by the UX adjudication in `spec.md#bug007-ux-provenance-adjudication-20260903`. | None. Preserve the technical design. |
| `VALIDATE-B007-G090-FRAMEWORK-001` | Unresolved under its existing external route. | None. Do not claim the framework defect fixed. |
| `VALIDATE-B007-CHECK8-AGENT-ID-001` | Unresolved under its existing external route. | None. Do not claim the parser defect fixed. |
| `VALIDATE-REPO-HANDOFF-CYCLE-001` | Unresolved under its existing external route. | None. Do not claim the graph defect fixed. |
| `VALIDATE-REPO-COLLECTED-TEST-COUNT-001` | Unresolved in its existing Research Lab packets. | None. Preserve test ownership. |
| `VALIDATE-REPO-STALE-RECEIPT-001` | Unresolved in the existing BUG-025 packet. | None. Preserve validation ownership. |

Audit attempt `BUG-007-AUDIT-001` remains `REWORK_REQUIRED`. The five
unresolved findings retain their current owners and packet dispositions.

### Routing

Route next to `bubbles.plan`. Planning must reconcile or confirm its active
surfaces against this no-design-delta closure without changing product source,
tests, accepted behavior, audit history, or certification.
