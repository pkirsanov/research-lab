# SCOPE-2: Regime facet contract + composer foundation — Execution Report

## Summary

SCOPE-2 delivers `./rlregime.js` and `./regime-archetypes.json` and covers them
with the four declared groups in the concrete test file `scripts/selftest.mjs`:
`rlregime`, `rlregime-compose`, `rlregime-history`, and `rlregime-projection`.
Thirteen assertions were added; the suite moved from 2464 to 2477 passing with 0
failed. TP-02-01 through TP-02-13 executed and passed. TP-02-14 is blocked by a
scope-sequencing dependency recorded under its own heading below.

Every row below was executed with `node scripts/selftest.mjs` against the
concrete test file `scripts/selftest.mjs` in this session. Rows TP-02-01 through
TP-02-11 were captured at a suite total of 2476; a thirteenth assertion pinning
the registry-enumeration and no-global-`isFinite` invariants was added afterwards,
taking the final total to 2477. Both totals are stated where they were observed
rather than back-filled to a single number.

## Test Evidence

#### TP-02-01

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-compose`)
**Exit Code:** 0

```
  ✓ RLREGIME composeRegime names the enumerated archetype on an exact facet tuple match
Research-Lab self-test: 2476 passed, 0 failed
```

The Gherkin's own tuple — trend-structure `risk-on` (structural), credit
`spreads-tightening` (structural), breadth-participation `broadening` (swing) —
matches the enumerated entry `risk-on-broadening-participation` with
`matchBasis: 'exact-enumerated-tuple'`. The match cites all three contributing
facets with their values, and the confirmation denominator counts three.

**Result:** PASSED

#### TP-02-02

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-compose`)
**Exit Code:** 0

```
  ✓ RLREGIME composeRegime emits a fingerprint plus Mixed or Unresolved and never an invented label
Research-Lab self-test: 2476 passed, 0 failed
```

A `sideways` / `spreads-stable` tuple has no enumerated entry. `archetypeId` is
`null`, `displayName` is drawn from `UNRESOLVED_LABELS`, `matchedTuple` is `null`,
and `matchBasis` is `no-enumerated-match`. The `fingerprintId` splits into two
individually readable facet segments and `unresolvedFacetPair` names both.

**Result:** PASSED

#### TP-02-03

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-compose`)
**Exit Code:** 0

```
  ✓ RLREGIME excludes a facet shorter than the requested horizon from both numerator and denominator
Research-Lab self-test: 2476 passed, 0 failed
```

A tactical `volatility-magnitude` facet requested at the structural horizon is
excluded with reason `horizon shorter than requested read`. It appears in
`excludedFacetIds`, is absent from `participatingFacetIds`, and the denominator
reads 2 rather than 3.

**Result:** PASSED

#### TP-02-04

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-compose`)
**Exit Code:** 0

```
  ✓ RLREGIME degrades a stale facet to unavailable and shrinks the denominator with absentFacetIds
Research-Lab self-test: 2476 passed, 0 failed
```

Five declared structural facets with the credit facet stale: `m` reads 4, not 5,
`absentFacetIds` contains `bond.credit`, and `whatWouldResolve` is populated. The
credit facet is absent from the composed facet list entirely, and a regex over
the serialized read confirms it was not mapped to Neutral or zero. With every
facet stale, `availability` reads `unavailable` with `k` and `ratio` both `null`
rather than the number 0.

**Result:** PASSED

#### TP-02-05

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-compose`)
**Exit Code:** 0

```
  ✓ RLREGIME surfaces a cross-horizon facet contradiction as a first-class record and never averages it
Research-Lab self-test: 2476 passed, 0 failed
```

Structural trend-structure `risk-on` against swing breadth-participation
`narrowing` produces exactly one record carrying `facetIdA`/`valueA`/`horizonA`
and `facetIdB`/`valueB`/`horizonB` — both facets, both values, and both horizons.
A key scan over the composed read finds no `average`, `majority`, `consensus`,
`confidence`, or `score` field standing in for the conflict.

**Result:** PASSED

#### TP-02-06

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-compose`)
**Exit Code:** 0

```
  ✓ RLREGIME holds the composed label and marks the facet forming until the persistence gate is met
Research-Lab self-test: 2476 passed, 0 failed
```

A sub-threshold move (`runLength` 1 against a structural threshold of 5) returns
`persistenceState: 'forming'` with `displayedValue` still the prior `uptrend`. The
control at `runLength` 5 returns `confirmed` with `displayedValue` moved to
`downtrend`, so the assertion discriminates between the two states rather than
passing on either.

**Result:** PASSED

#### TP-02-07

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-history`)
**Exit Code:** 0

```
  ✓ RLREGIME history is as-of-safe per point and refuses a hindsight-smoothed series
Research-Lab self-test: 2476 passed, 0 failed
```

The later print is present in the input for both points, which is what makes the
test discriminating: the point stamped 2026-08-15 composes from one facet because
the 2026-08-20 print had not occurred at its cutoff, while the point stamped
2026-08-25 composes from two. A `centered-3` smoothing request returns
`HINDSIGHT_SMOOTHING_REFUSED` with zero points and a note stating the label would
not be as-of-safe.

**Result:** PASSED

#### TP-02-08

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime`)
**Exit Code:** 0

```
  ✓ RLREGIME validates facets against their kind-keyed closed vocabulary and rejects volatility-magnitude where a direction is expected
Research-Lab self-test: 2476 passed, 0 failed
```

An off-vocabulary value throws `RLREGIME_SCHEMA_INVALID` at `$.facet.value`; an
unknown kind throws at `$.facet.kind`. The returned reading is frozen and a
strict-mode horizon reassignment throws, so the horizon class is immutable at
declaration. `requireDirectionalFacet` throws at `$.facet.kind` for a
`volatility-magnitude` facet, whose every value carries stance `none`, and a
tactical facet is excluded from a structural read so it can move no structural
value.

**Result:** PASSED

#### TP-02-09

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-projection`)
**Exit Code:** 0

```
  ✓ RLREGIME projectCompatibility is read-only lossless-or-declared-lossy and readPublishedContext exposes no recomposition path
Research-Lab self-test: 2476 passed, 0 failed
```

Both legacy cells reproduce (`Greed·risk-on` with `risk: 1`, and `Risk-on trend`),
each declaring `lossy: true` with the dropped fields named. `JSON.stringify` of
the composed read is byte-identical before and after projecting, so the
projection mutates nothing. An unknown target vocabulary throws
`RLREGIME_SCHEMA_INVALID`. Every registry entry carries both projection cells, so
the legacy mapping is total. `readPublishedContext` returns
`isRecomputation: false` and `derivesLocally: false`, and a key scan finds no
registry, archetype, or recompose field on the returned reader.

**Result:** PASSED

#### TP-02-10

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-compose`)
**Exit Code:** 0

```
  ✓ RLREGIME sleeveFits are ordinal-only with rationale and invalidation and reject the forbidden-output vocabulary
Research-Lab self-test: 2476 passed, 0 failed
```

Five rows, each with an integer ordinal, a non-empty `rationaleFacetIds`, and an
invalidation condition. A key scan finds no weight, allocation, exposure, target,
or position field, and the five sub-types stay distinct so dividend, bond, and
commodity do not collapse. Adding a `weight` key throws
`RLREGIME_SCHEMA_INVALID` at the contract boundary. A flat input where every
sleeve declares the same ordinal returns `noAdvantage: true` with `ordinal: null`
and a stated reason rather than a forced 1..n ordering. Identical frozen input at
an identical `decisionTime` is byte-identical for both the fits and the composed
read, with an identical `fingerprintId`.

**Result:** PASSED

#### TP-02-11

**Executed:** YES — ADVERSARIAL RED-bite, both mutations verified discriminating.
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`)

Mutation (a) — hysteresis gate neutralized by forcing `displayedValue` to the new
value so a sub-threshold move flips the label immediately. **Exit Code: 1**

```
  ✗ FAIL: RLREGIME holds the composed label and marks the facet forming until the persistence gate is met
  ✗ FAIL: RLREGIME records a one-print archetype change as a candidate transition and holds the displayed label
Research-Lab self-test: 2474 passed, 2 failed
```

Mutation (b) — `readPublishedContext` allowed to recompose from a raw facet array.
**Exit Code: 1**

```
  ✗ FAIL: RLREGIME readPublishedContext refuses a raw facet array with RLREGIME_SCHEMA_INVALID at publishedRegime
  ✓ RLREGIME holds the composed label and marks the facet forming until the persistence gate is met
Research-Lab self-test: 2475 passed, 1 failed
```

The persistence assertion passing under mutation (b) is the control that proves
the two mutations are independent rather than one assertion failing on both.

Restored source. **Exit Code: 0**

```
Research-Lab self-test: 2476 passed, 0 failed
```

**Result:** PASSED — each named assertion fails under its own mutation and passes
against the delivered composer.

#### TP-02-12

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`)
**Exit Code:** 0

```
  ✓ regime-archetypes.json is fully enumerated and rlregime.js carries no global isFinite, ambient clock, or stub
Research-Lab self-test: 2477 passed, 0 failed
```

The count rose from 2464 to 2477 — exactly the thirteen assertions added across
the four additive groups. No pre-existing group was edited, and SCOPE-1's
`rlratio` and `rlratio-scale` groups are preserved byte-for-byte.

The thirteenth assertion is itself RED-bite verified: inserting a single
`isFinite(value.length)` into `requireString` produced
`✗ FAIL: regime-archetypes.json is fully enumerated and rlregime.js carries no global isFinite, ambient clock, or stub`
and `2476 passed, 1 failed`, exit 1. Removing it restored `2477 passed, 0 failed`,
exit 0. The guard matters because a bare `isFinite` coerces — `isFinite(null)` is
`true` — so a missing facet would pass a numeric check it should fail.

**Result:** PASSED

#### TP-02-13

**Executed:** YES
**Command:** `node scripts/selftest.mjs` (concrete test file `scripts/selftest.mjs`, group `rlregime-compose`)
**Exit Code:** 0

```
  ✓ RLREGIME records a one-print archetype change as a candidate transition and holds the displayed label
Research-Lab self-test: 2476 passed, 0 failed
```

After a confirmed run of twelve observations, a single new observation implying a
different archetype returns `transitionState: 'candidate'` with
`transitionedFrom: 'uptrend'`. The displayed archetype remains the previously
confirmed `uptrend`, and the candidate is visible with `runLength: 1` against
`thresholdBars: 5` rather than hidden until it confirms.

**Result:** PASSED

#### TP-02-14

**Executed:** NO — blocked by a scope-sequencing dependency, not deferred.

This row targets `tests/market-regime-lab.spec.mjs` against
`./market-regime-lab.html`. Neither exists:

```
$ ls -la market-regime-lab.html tests/market-regime-lab.spec.mjs
ls: cannot access 'market-regime-lab.html': No such file or directory
ls: cannot access 'tests/market-regime-lab.spec.mjs': No such file or directory
```

`./market-regime-lab.html` is SCOPE-4's deliverable
(`scopes/04-market-regime-lab-surface/`). This scope's Implementation Files table
names exactly two paths — `./rlregime.js` and `./regime-archetypes.json` — so
building the page here to satisfy this row would breach the scope boundary and
would also pre-empt SCOPE-4's own scenarios. The row is held open with its owner
named rather than closed against a page that does not exist.

**Result:** BLOCKED ON SCOPE-4

## Completion Statement

SCOPE-2 is **In Progress**, not Done.

Delivered and evidenced: `./rlregime.js` and `./regime-archetypes.json`, covered
by thirteen assertions across the four declared groups in `scripts/selftest.mjs`.
TP-02-01 through TP-02-13 executed and passed, including the TP-02-11 adversarial
RED-bite where each named assertion was verified to fail under its own mutation
and pass against the delivered composer. Final suite state: `2477 passed, 0
failed`, exit 0.

Also green in this session: `node scripts/validate-causal-rotation.mjs` PASS,
`node scripts/validate-brief-payload.mjs` PASS, `node scripts/build-pages-site.mjs`
28 registered pages, `node scripts/validate-node-source-lock.mjs` PASS with 16
adversarial rejections and 0 unexpected acceptances. `artifact-lint.sh` PASSED for
this spec directory.

Four Definition of Done items are held open with their blockers named:

1. **TP-02-14** — requires `./market-regime-lab.html`, which is SCOPE-4's
   deliverable and outside this scope's two-file Implementation Files table.
2. **The scenario-specific E2E regression item** — same dependency as TP-02-14.
3. **The broader E2E regression item** — its selftest half is green at 2476/0, but
   its second half names the feature's real-page Playwright spec, which does not
   yet exist.
4. **Build Quality Gate** — `traceability-guard.sh` reports FAILED (8 failures, 0
   warnings) for the whole spec directory. **Zero failures belong to SCOPE-2.**
   Six belong to unbuilt `04-market-regime-lab-surface` and two to unbuilt
   `06-consumer-migration-projection`, whose mapped rows reference concrete test
   files that do not exist yet. Four further failures belonged to SCOPE-1's
   unfilled report and were fixed in this session, taking the total from 12 to 8.
   The gate is written against the spec directory, so it cannot go clean until
   those scopes are built.

No item above was closed by weakening a test, and no blocked item was recorded as
passing.

## Finding: G028 reality scan does not cover this scope's delivered files

`implementation-reality-scan.sh` reports `PASSED with 1 warning` over 31 files for
this spec directory. **That pass is not evidence about `./rlregime.js`.** The
warning is the symptom:

```
ℹ️  INFO: Scopes yielded 0 files — falling back to design.md for file discovery
⚠️  WARN: Resolved 31 file(s) from design.md fallback — scopes.md should reference these directly
```

The scanner discovers files from a section headed exactly `### Implementation
Files`. Spec 013 uses per-scope directories, and each `scope.md` heads its table
`## Implementation Files` at h2, so the scan finds nothing and falls back.

Probed rather than assumed. Inserting `// TODO: STUB placeholder` into
`./rlregime.js` and re-running the scan returned:

```
  Violations:     0
  Warnings:       1

🟡 PASSED with 1 warning(s) — manual review advised
```

The marker was not detected, so the file is not being scanned. The probe was
removed immediately and `grep -c "STUB placeholder" rlregime.js` returns `0`.

This is a spec-layout and framework-heading mismatch, not a defect in the
delivered code, and fixing it means editing spec-level artifacts outside this
scope's two-file Implementation Files table. It is recorded here so no later
reader mistakes the G028 pass for coverage of this scope.

The gap is covered in-scope by a named, discriminating assertion instead:
`regime-archetypes.json is fully enumerated and rlregime.js carries no global
isFinite, ambient clock, or stub`, which greps the delivered source for stub
markers, a bare `isFinite`, and an ambient clock, and which was RED-bite verified
to fail when a single `isFinite(` is introduced.
