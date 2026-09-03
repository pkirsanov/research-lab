# Report: BUG-024 Spec Path Historical Report Leak

## Summary

`XRL-PATH-GUARD-HIST-001` is an artifact-authority defect in the spec test-path
collector. Five immutable Feature 031 report references to one retired filename
are treated as current path declarations and fail the broad repository selftest.

## Completion Statement

The bug is diagnosed and filed. It remains `in_progress`. No source, test,
baseline, Feature 031 report, BUG-022 packet, certification field, Horizon Ladder
path, registry path, navigation path, or standalone-Lab surface was changed.

## Test Evidence

### Current Path Diagnostic From Feature 031

**Phase:** bug

**Command:** `node scripts/validate-spec-test-paths.mjs --all-sites`

**Exit Code:** `1`, as recorded by Feature 031 tool-log row 428

**Claim Source:** interpreted

**Interpretation:** This bug phase read the current executed receipt and current
Feature 031 report. It did not rerun the command. The only new missing path has
five sites, all in historical report evidence.

**Output SHA-256:** `68fd71ebaf3756fa84cc8572be3daef842d524c02638a4f87bb758d31c9749d7`

```text
XRL-PATH-GUARD-HIST-001: 1 new missing path
missing=tests/shock-transmission.resource.test.mjs
referenceSites=5
allReferenceSites=specs/031-shock-transmission-foundation/report.md
testPathValidatorRepairPath=route-same-repo
Feature031RepairPath=excluded
baselineGrowth=forbidden
historicalReportRewrite=forbidden
currentRealCarrier=tests/shock-transmission.resource.functional.mjs
```

## Root Cause Evidence

**Claim Source:** interpreted

`collectSpecTestPathReferences()` traverses every readable file below `specs/`,
extracts every repository-relative `tests/*.mjs` token, and records only path,
artifact, and line. `validateSpecTestPaths()` can separate structured
planned-not-authored rows, but it has no historical report authority state. A
report-only token therefore enters `actionableMissing` and is compared against the
active baseline.

## Owner Deduplication

The canonical BUG-001 through BUG-023 inventory was searched for the finding id,
collector symbol, retired path, and historical report path classification. No
packet owns this consumer. BUG-022 owns a related Node-glob collector and explicitly
ends its capability at `collectDeclaredTestGlobs()` and
`validateTestFileReachability()`.

## Files Added

| File | Purpose |
| --- | --- |
| `bug.md` | Reproduction, classification, and boundaries |
| `spec.md` | Expected authority behavior and scenarios |
| `design.md` | Initial shared-capability design handoff |
| `scopes.md` | Initial plan handoff and DoD |
| `report.md` | Evidence provenance and routing |
| `uservalidation.md` | Unchecked human acceptance contract |
| `scenario-manifest.json` | Scenario identities and proof obligations |
| `test-plan.json` | Structured initial test handoff |
| `state.json` | In-progress bugfix-fastlane control state |

## Required Route

The next owner is `bubbles.design`. After capability reconciliation, route through
`bubbles.plan`, `bubbles.implement`, `bubbles.test`, and `bubbles.validate`. This
report makes no later-phase claim.