# Design: BUG-007 Compose Brief Prototype-Sensitive Keys

## Design Brief

### Current State

`rlportfoliobrief.js` already uses `Object.create(null)` for identity maps in
its dedupe and interest-signal paths. The later `composeBrief()` path and its
`distinctCount()` helper use ordinary objects for subject/domain aggregation.

Fresh execution proves that normal composition succeeds while all three
prototype-sensitive names throw for both completion subjects and domains.
Each key also writes the completion date onto a different shared built-in
before the throw.

### Target State

Every internal caller-keyed aggregation map has no prototype. Caller-provided
lookup maps are consulted through own-property membership. Prototype-sensitive
strings then follow the same counting, qualification, evidence, ordering, and
explanation path as ordinary strings.

### Patterns To Follow

- Use the module's existing direct `Object.create(null)` pattern.
- Preserve `Object.keys()` iteration and existing explicit lane sorting.
- Use `Object.prototype.hasOwnProperty.call()` for caller-supplied lookup maps.
- Keep cleanup inside persistent adversarial tests so a RED run is isolated.
- Preserve the existing result and refusal contracts without translation.

### Patterns To Avoid

- Do not blacklist `__proto__`, `constructor`, or `toString`.
- Do not use `try/catch` to hide a partial composition.
- Do not mutate or sanitize caller strings.
- Do not convert the whole composition pipeline to `Map`; that would widen the
  output and ordering surface without solving an additional requirement.
- Do not repair only the first map that currently throws.
- Do not read `owners` or `priorEvidenceIds` by inherited membership.

### Resolved Decisions

- Allocate every affected internal map with direct `Object.create(null)`.
- Use direct `Object.prototype.hasOwnProperty.call()` for every membership
   decision over those maps and the two caller-supplied lookup maps.
- Add no map-constructor or membership helper. The finite sites remain easier
   to audit when the security property is visible at each declaration and read.
- Preserve every accepted subject and domain string. Do not add a reserved-key
   vocabulary.
- Preserve lane aggregation, materiality ordering, no-action ordering, action
   signatures, and all existing result and refusal envelopes.
- Cover all six hostile direct-export cases in functional and browser-runtime
   tests. Also cover `constructor` through the production completion recorder
   because that inherited-looking key is accepted by the current UI contract.
- Use the existing in-memory defect injector for mutation proof. Never mutate
   the shipped working-tree source during the regression.

### Open Questions

None. The implementation and planning owners can proceed from this contract.

## Purpose And Scope

This design implements FR-B007-001 through FR-B007-007 inside the existing
Portfolio Brief composition capability. It changes only caller-keyed
aggregation and membership semantics.

The source boundary is `distinctCount()` and `composeBrief()` in
`rlportfoliobrief.js`. The persistent behavior carriers are the existing brief
functional and browser suites. The existing Feature 008 test-integrity carrier
owns in-memory mutation proof.

The repair adds no route, storage field, contract version, policy value,
configuration key, migration, or public function. It does not widen the
browser completion vocabulary.

## Architecture Overview

`composeBrief()` receives arrays of holdings, watchlist symbols, completions,
and evidence. It derives caller-keyed indexes, qualifies each subject once,
aggregates evidence, sorts visible lanes, and returns one result object.

The repaired flow keeps that architecture. Each internal index has no
prototype. Every branch that distinguishes a missing key from an existing key
uses own-property membership. The output remains an ordinary result object.

The two caller-supplied maps remain caller-owned. The composer does not clone
or normalize them. It only reads an own `owners` or `priorEvidenceIds` entry.

## Root Cause Analysis

### Controlling Path

For each retained completion, `composeBrief()` iterates
`[entry.subjectId, entry.domain]` and uses the string as a property key.

With `__proto__`:

1. `supportDatesBySubject[key]` resolves `Object.prototype`.
2. The date assignment writes onto `Object.prototype`.
3. `categoriesBySubject[key]` also resolves `Object.prototype`.
4. `.indexOf()` is missing, so a `TypeError` escapes.

With `constructor`, the inherited value is `Object`; with `toString`, it is
`Object.prototype.toString`. The same date write mutates that function object,
and the same category lookup throws.

Domains are independently vulnerable because the support loop passes both
subject and domain through the same key path, and `inferredDomains` is itself
an ordinary map.

### Reproduction-To-Source Match

The recorded reproduction in `report.md#before-fix-reproduction` reports the
same throw for six subject and domain cases. The current source explains both
the mutation and the throw.

At lines 864-865, an inherited `supportDatesBySubject[key]` receives the date
property. At lines 867-868, an inherited `categoriesBySubject[key]` is treated
as an array. The resulting `.indexOf()` call throws.

No evidence suggests another controlling path. Subject and domain values enter
the same loop at lines 859-874. Domain aggregation then continues through
`inferredDomains` at lines 892-903.

### Complete Affected Inventory

Line numbers identify the reviewed `b23a783232fd48704559328853e9e61a6ebbeeca`
tree. Function and variable names are the durable implementation anchors.

| Surface | Current source | Caller-derived key | Required representation and membership |
| --- | --- | --- | --- |
| `distinctCount()` local `seen` | `rlportfoliobrief.js:763-769` | completion subject or date | null-prototype set; `Object.keys()` counts own keys |
| `excludedBySubject` | `rlportfoliobrief.js:813-822,959` | evidence subject | null-prototype set; no-action reason uses own membership |
| `supportBySubject` | `rlportfoliobrief.js:854,863` | completion subject and domain | null-prototype count map; initialization uses own membership |
| `categoriesBySubject` | `rlportfoliobrief.js:855,867-868` | completion subject and domain | null-prototype map; array creation uses own membership |
| `horizonBySubject` | `rlportfoliobrief.js:856,870` | completion subject and domain | null-prototype map; first-write rule uses own membership |
| `newestSupportBySubject` | `rlportfoliobrief.js:857,871-873` | completion subject and domain | null-prototype map; comparison distinguishes own absence |
| `supportDatesBySubject` | `rlportfoliobrief.js:858,864-865` | completion subject and domain | null-prototype outer map; nested set creation uses own membership |
| nested support-date set | `rlportfoliobrief.js:864-865` | derived completion date | null-prototype set; own keys feed `Object.keys()` |
| `qualifiesVia` | `rlportfoliobrief.js:878-883` | holding, watchlist, completion subject, inferred domain | null-prototype map; qualification creation uses own membership |
| `inferredDomains` | `rlportfoliobrief.js:892-900` | completion domain | null-prototype set; `Object.keys()` enumerates own domains |
| `byId` | `rlportfoliobrief.js:906-919,946` | evidence subject | null-prototype map; record creation and observed lookup use own membership |
| `owners` lookup | `rlportfoliobrief.js:927,982-983,1023` | qualified subject | preserve caller object; resolve one own truthy value per subject |
| `priorEvidenceIds` lookup | `rlportfoliobrief.js:930,993-999` | qualified subject | preserve caller object; only an own truthy value reaches `.slice()` |

`COVERAGE_RANK`, `LANE_SOURCE`, and the Intl parts object are excluded from this
inventory. They are fixed-vocabulary maps and are not keyed by the completion
subject/domain contract under repair.

## Fix Design

### Direct Null-Prototype Allocation

Replace each affected internal `{}` allocation with `Object.create(null)`:

- `distinctCount()` local `seen`
- all nine named `composeBrief()` aggregation maps
- each newly created per-subject support-date set

Do not add `safeMap()`, `dictionary()`, `hasOwn()`, or another wrapper. The
module already uses direct `Object.create(null)` and direct own-property calls.
Ten finite allocation sites inside one function do not create a reusable
capability. A helper would hide the exact property that this repair must expose
for review.

### Own-Property Membership

Null-prototype allocation and own membership are separate requirements. Every
key-presence decision over the affected maps must use this exact semantic:

```js
Object.prototype.hasOwnProperty.call(map, key)
```

Apply it to these decisions:

- initialize and increment `supportBySubject`
- create nested `supportDatesBySubject` sets
- create `categoriesBySubject` arrays
- retain the first `horizonBySubject` value
- compare or set `newestSupportBySubject`
- create `qualifiesVia` entries
- create `byId` evidence aggregates
- resolve `byId[subjectId]` for a qualified subject
- distinguish `excludedBySubject` membership
- resolve support counts, category arrays, horizons, and newest support when
   producing explanations
- resolve inferred-domain date sets before counting their own date keys
- resolve the two caller-supplied maps described below

Do not use `key in map`, `!map[key]`, `map[key] || value`, or inherited direct
lookup as a membership test. `Object.keys()` already returns own enumerable
keys and remains the correct enumeration mechanism.

### Caller-Supplied Lookup Maps

Keep the caller's `owners` and `priorEvidenceIds` objects unchanged. Before
reading a qualified subject, test own membership with
`Object.prototype.hasOwnProperty.call(map, subjectId)` and treat a miss as
`null`.

Bind one resolved owner per subject. Reuse it for `owner`,
`unownedCapability`, and `deepLink`. Preserve the existing falsey-to-null
behavior for an own falsey owner value.

Resolve prior evidence once through own membership before calling `.slice()`.
Preserve the existing no-prior result for an own falsey value. Do not add array
coercion or a new validation envelope in this repair.

These rules preserve own entries created by `JSON.parse()` or a null-prototype
caller map, including an own `__proto__` property. They ignore inherited
properties.

### Accepted Inherited-Looking Keys

The direct `composeBrief()` contract accepts the three strings named by this
bug. It must treat `__proto__`, `constructor`, and `toString` as data. The
repair must not reject, rewrite, lowercase, or reserve them.

The production completion recorder has a narrower token contract.
`rlportfolio.js:38,2168-2169` accepts lowercase letters, digits, and hyphens.
It therefore accepts `constructor`, but rejects `__proto__` and `toString`.
The browser test must preserve that contract rather than widening it.

`portfolio-survival-allocation-lab.html:1319` fixes the completion domain to
`portfolio-research`. Hostile domains are not user-enterable on this route.
They remain required direct-export cases because `composeBrief()` accepts them.

### Ordering And Contract Preservation

`Object.keys()` over null-prototype objects preserves own enumerable key order
under the same ECMAScript rules used by ordinary objects. Lane order remains
fixed by `LANE_ORDER`; item order remains explicitly sorted by materiality and
subject ID. No output schema changes.

Existing local checks remain before aggregation, and shared policy validation
remains at its current insertion point. No error is caught or rebuilt.

The normal control must retain these observable values:

- lane order: `held,watchlist,completedResearch,inferredRelevance`
- subject order: `MSFT,BND,ZZTOP,semiconductors`
- one highest-authority lane per subject
- unchanged `alsoQualifiesVia` aggregation
- unchanged no-action reason and subject ordering
- unchanged materiality sort and queue suppression
- unchanged action signature construction

### Result And Error Contract

The repair introduces no new failure code. `composeBrief()` keeps its current
`{ ok: true, value }` and `{ ok: false, error }` shapes.

Do not catch the current `TypeError`. Removing inherited lookup prevents the
throw. Existing input, window, timestamp, cutoff, and shared policy failures
retain their current code, reason, field, and precedence.

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

## UI And Browser Visibility

The allocation page loads `rlportfoliobrief.js` at
`portfolio-survival-allocation-lab.html:1248`. `renderBrief()` calls the
exported composer at line 6412 and renders result rows into `#briefLanes` and
`#briefNoAction` at lines 6528-6695.

The production completion input is `#behaviorSubject` at lines 946-949.
`completionDraft()` passes its trimmed value to the behavior constructor at
lines 7280-7295. The accepted `constructor` value is therefore user-reachable.

The browser regression must record `constructor` through the existing preview
and confirm controls. It must rerender the Brief and assert a visible
completed-research row or named no-action row. The route must remain responsive
and show no uncaught page error.

The browser-runtime matrix must also invoke `window.RLPORTFOLIOBRIEF.composeBrief`
directly for all six subject and domain cases. That matrix proves UMD runtime
parity. It is not described as user-visible coverage for the four values that
the production recorder cannot create.

## Security And Privacy

The repair prevents caller data from selecting or mutating inherited built-in
objects. Tests must snapshot `Object.prototype`, `Object`, and
`Object.prototype.toString` around every hostile call.

Cleanup remains mandatory in a `finally` block so a pre-fix RED run cannot
contaminate later tests. The test must report mutation before cleanup and must
prove cleanup afterward.

No personal value, owner object, or prior evidence array is logged or added to
a public artifact. The change adds no network request or storage write.

## Configuration, Migration, And Rollout

No configuration, migration, flag, or data rewrite applies. The repair ships
with the existing static module and page.

Rollback restores the prior source and test commit. No stored data transition
is required.

## Observability And Failure Handling

This pure browser and Node module has no trace or metric workflow. The result
envelope and the page's existing unavailable state remain the observable
failure surfaces.

No new log or console output is required. An uncaught exception, shared
built-in mutation, changed refusal envelope, or changed visible order is a
test failure.

## Implementation Locations And Persistent Consumers

| Surface | Exact current location | Design obligation |
| --- | --- | --- |
| map allocation and counting helper | `rlportfoliobrief.js:763-769` | make `seen` inheritance-free |
| composition and all caller-keyed indexes | `rlportfoliobrief.js:789-1042` | apply direct null-prototype allocation and own membership without changing flow |
| visible route caller | `portfolio-survival-allocation-lab.html:6353-6695` | no source edit planned; preserve result rendering and unavailable behavior |
| reachable completion control | `portfolio-survival-allocation-lab.html:946-956,7280-7295,8615-8667` | no source edit planned; preserve accepted `constructor` recording and visible rerender |
| focused functional carrier | `tests/portfolio-brief.functional.mjs:254-259,304-984` | add normal, six-case, own-map, built-in integrity, cleanup, and refusal assertions |
| real browser carrier | `tests/portfolio-survival-brief.spec.mjs:41-49,294-340` | add direct browser-runtime matrix and visible `constructor` recorder path |
| mutation challenge registry | `tests/portfolio-test-integrity.unit.mjs:1-180` | add exact cases that challenge map allocation, caller-map membership, and normal order |
| in-memory mutation adapter | `tests/portfolio-defect-injector.cjs:1-75` | consume unchanged; require exact one-anchor substitution and applied marker |
| broader repository check | `scripts/selftest.mjs` | rerun as broad regression; do not treat it as the scenario-specific carrier |

## Regression Design

### Functional Carrier

`tests/portfolio-brief.functional.mjs` must:

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

### Browser Carrier

`tests/portfolio-survival-brief.spec.mjs` must:

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

Use `tests/portfolio-test-integrity.unit.mjs` and the existing
`tests/portfolio-defect-injector.cjs`. Add exact, one-anchor in-memory
substitutions that prove these controls are load-bearing:

1. Restore one representative caller-keyed allocation to `{}` and require the
   unchanged hostile matrix to fail.
2. Replace one caller-map own-membership decision with inherited direct lookup
   and require the own/inherited lookup test to fail.
3. Swap the first two `LANE_ORDER` entries and require the exact normal-order
   assertion to fail.

The injector must report one applied substitution. It must never write
`rlportfoliobrief.js` or any test file.

### Scenario-To-Test Mapping

| Scenario | Persistent consumer | Required assertion |
| --- | --- | --- |
| `SCN-B007-NORMAL-COMPATIBILITY` | functional carrier, browser carrier, test-integrity mutation | exact normal lane and subject order plus refusal non-movement |
| `SCN-B007-SUBJECT-KEY-SAFETY` | functional carrier, browser-global matrix, visible `constructor` path | own subject behavior, no throw, no built-in mutation, inherited caller-map absence |
| `SCN-B007-DOMAIN-KEY-SAFETY` | functional carrier, browser-global matrix | actual domain counts and dates, no throw, no built-in mutation |

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

### Single-Implementation Justification

This is a narrow repair inside one existing composition capability. It adds no
provider, adapter, strategy, route, storage layer, or second contract. A new
capability foundation or safe-map abstraction would add indirection without
removing real complexity.

## Complexity Tracking

None - simplest viable approach used.

## Change Boundary

Allowed future implementation paths:

- `rlportfoliobrief.js`
- `tests/portfolio-brief.functional.mjs`
- `tests/portfolio-survival-brief.spec.mjs`
- `tests/portfolio-test-integrity.unit.mjs`
- this BUG-007 packet for owned evidence and lifecycle updates

Excluded:

- all parent Feature 008 scope files and root `test-plan.json`
- sibling bug packets
- policy JSON, storage, route, registry, navigation, and public HTML behavior
  outside the existing brief browser test
- unrelated object maps elsewhere in the repository

`tests/portfolio-defect-injector.cjs` is a read-only existing dependency. No
change to it is planned.

This design invocation changes no source, persistent test, scope, human
acceptance, or certification content. `bubbles.plan` must reconcile the current
scope, scenario manifest, and structured test plan with the added visible
`constructor` path and test-integrity consumer before test authorship begins.

## Risks And Open Questions

- A partial allocation-only repair leaves caller-map reads vulnerable.
- A partial own-membership-only repair leaves ordinary `__proto__` assignment
   semantics in internal maps.
- A direct browser-global test alone would miss the visible accepted
   `constructor` path.
- Open questions: None.
