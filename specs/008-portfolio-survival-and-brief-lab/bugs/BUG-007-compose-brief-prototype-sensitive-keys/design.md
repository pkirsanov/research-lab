# Design: BUG-007 Compose Brief Prototype-Sensitive Keys

## Design Brief

### Current State

The original `composeBrief()` path used ordinary objects for caller-derived
subject and domain keys. That path let `__proto__`, `constructor`, and
`toString` resolve inherited built-ins before the category lookup threw.

Commit `d49a2955b` hardened every affected map and caller lookup. Commits
`82d1db5e5` and `3688388d5` repaired mutation causality and completed the
related error contract.

### Target State

One active design now matches the delivered architecture. Caller strings remain
data, accepted mutants fail through their protective assertion, and brief
refusals use the parent's closed error contract.

### Patterns To Follow

- Use the module's existing direct `Object.create(null)` pattern.
- Use `Object.prototype.hasOwnProperty.call()` for caller-supplied lookup maps.
- Route every brief error through `contractErr()`.
- Keep every production-emitted `P008-*` code in `rlportfolio.js::ERROR_CODES`.
- Keep mutation representation process-isolated and assertion-causal.

### Patterns To Avoid

- Do not blacklist `__proto__`, `constructor`, or `toString`.
- Do not use `try/catch` to hide a partial composition.
- Do not read `owners` or `priorEvidenceIds` by inherited membership.
- Do not let both injector hooks claim one `require()`-based source load.
- Do not accept an injector, preload, anchor, syntax, or module-load failure as
  mutation discrimination.
- Do not emit the stale three-field brief error literal.
- Do not exclude error-code registry work from this bug's implemented boundary.

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

### Open Questions

None blocking in design. Planning must reconcile its owned test obligations.

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

Rollback has three coherent units:

1. Reverting `d49a2955b` restores the unsafe map and lookup behavior. It also
   reopens the original high-severity integrity and availability defect.
2. Reverting `82d1db5e5` restores the non-causal dual-hook test mechanism. It
   changes no production runtime, but it removes trustworthy mutation proof.
3. Reverting `3688388d5` removes the nine registry entries, restores the
   three-field local composer error, rejects explicit-null optionals, and makes
   the corrected exact expectations fail.

A rollback must keep source, registry, constructor, validator, and matching
expectations coherent. No stored state needs restoration.

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

### Scenario-To-Test Mapping

| Scenario | Persistent consumer | Required assertion |
| --- | --- | --- |
| `SCN-B007-NORMAL-COMPATIBILITY` | functional carrier, browser carrier, test-integrity mutation | exact normal lane and subject order plus refusal non-movement |
| `SCN-B007-SUBJECT-KEY-SAFETY` | functional carrier, browser-global matrix, visible `constructor` path | own subject behavior, no throw, no built-in mutation, inherited caller-map absence |
| `SCN-B007-DOMAIN-KEY-SAFETY` | functional carrier, browser-global matrix | actual domain counts and dates, no throw, no built-in mutation |
| `SCN-B007-MUTATION-MECHANISM-CAUSALITY` | test-integrity carrier and shared injector | one intended hook, one marker, one selected protective assertion, direct-text parity, and double-application rejection |
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
- source, persistent tests, scopes, report, state, human acceptance, and
   certification changes in this design-owner invocation.

The shared injector is an implemented, test-owned dependency. Its representation
is process-isolated and memory-only with respect to canonical source. Its marker
file is test-owned temporary output, not a represented source file.

`bubbles.plan` owns reconciliation of `scopes.md`, `scenario-manifest.json`, and
`test-plan.json` with the registry and error-contract invariants in this design.

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
- Open questions: None.
