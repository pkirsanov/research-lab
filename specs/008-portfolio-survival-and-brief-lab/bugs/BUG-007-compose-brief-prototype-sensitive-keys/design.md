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

### Complete Affected Inventory

| Surface | Caller-derived key | Current failure |
| --- | --- | --- |
| `distinctCount()` local `seen` | completion subject | `__proto__` is not counted as an own key |
| `excludedBySubject` | evidence subject | inherited truth changes no-action reason and `__proto__` assignment is not an own key |
| `supportBySubject` | completion subject and domain | inherited values corrupt the count |
| `categoriesBySubject` | completion subject and domain | inherited built-in lacks `.indexOf()` and throws |
| `horizonBySubject` | completion subject and domain | inherited truth suppresses the actual horizon |
| `newestSupportBySubject` | completion subject and domain | inherited truth suppresses or distorts recency comparison |
| `supportDatesBySubject` | completion subject and domain | inherited built-in receives the date property |
| nested support-date set | derived completion date | not caller-named, but remains part of the set-like chain |
| `qualifiesVia` | holding, watchlist, completion subject, inferred domain | inherited built-in lacks `.lanes()` data and can throw |
| `inferredDomains` | completion domain | `__proto__` is not represented as an own domain |
| `byId` | evidence subject | inherited built-in lacks evidence aggregation fields and can throw |
| `owners` lookup | qualified subject | absent dangerous key resolves inherited state |
| `priorEvidenceIds` lookup | qualified subject | absent dangerous key resolves inherited state and later `.slice()` can throw |

`COVERAGE_RANK`, `LANE_SOURCE`, and the Intl parts object are excluded from this
inventory. They are fixed-vocabulary maps and are not keyed by the completion
subject/domain contract under repair.

## Fix Design

### Internal Aggregation Maps

Replace each affected internal `{}` allocation with `Object.create(null)`:

- `distinctCount()` local `seen`
- all nine named `composeBrief()` aggregation maps
- each newly created per-subject support-date set

No wrapper is needed. Direct null-prototype allocation is already the local
module convention and keeps the change mechanically visible at every map.

### Caller-Supplied Lookup Maps

Keep the caller's `owners` and `priorEvidenceIds` objects unchanged. Before
reading a qualified subject, test own membership with
`Object.prototype.hasOwnProperty.call(map, subjectId)` and treat a miss as
`null`.

Bind the resolved owner once per subject and reuse it for `owner`,
`unownedCapability`, and `deepLink`. Resolve prior evidence the same way before
calling `.slice()`. This preserves own entries created by `JSON.parse()`,
including an own `__proto__` property, while ignoring inherited properties.

### Ordering And Contract Preservation

`Object.keys()` over null-prototype objects preserves own enumerable key order
under the same ECMAScript rules used by ordinary objects. Lane order remains
fixed by `LANE_ORDER`; item order remains explicitly sorted by materiality and
subject ID. No output schema changes.

Existing local checks remain before aggregation, and shared policy validation
remains at its current insertion point. No error is caught or rebuilt.

## Regression Design

The persistent functional carrier must:

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
   explicit own entries remain readable.
8. Mutate the safe allocations back to ordinary objects in memory and prove the
   exact hostile matrix fails. Separately swap the first two `LANE_ORDER`
   entries and prove the exact normal-order assertion fails.

The browser carrier repeats the public module matrix inside the real page
runtime. The broader Feature 008 browser suite proves normal user flows do not
move.

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

## Complexity Tracking

None - the design applies the module's existing null-prototype pattern and
standard own-membership check consistently across one function boundary.

## Change Boundary

Allowed future implementation paths:

- `rlportfoliobrief.js`
- `tests/portfolio-brief.functional.mjs`
- `tests/portfolio-survival-brief.spec.mjs`
- this BUG-007 packet for owned evidence and lifecycle updates

Excluded:

- all parent Feature 008 scope files and root `test-plan.json`
- sibling bug packets
- policy JSON, storage, route, registry, navigation, and public HTML behavior
  outside the existing brief browser test
- unrelated object maps elsewhere in the repository

No source or persistent test change is part of this filing.
