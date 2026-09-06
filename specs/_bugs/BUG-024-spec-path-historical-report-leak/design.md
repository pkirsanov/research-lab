# Bug Fix Design: BUG-024 Spec Path Historical Report Leak

## Design Status

This is the substantive bug-discovery handoff. `bubbles.design` owns final design
authority and must reconcile capability reuse before implementation dispatch.

## Root Cause Analysis

### Investigation Summary

The current path diagnostic names one missing path and five sites, all in the
Feature 031 report. The production collector recursively scans every text artifact
under `specs/`, extracts every `tests/*.mjs` token, and records no artifact role or
section role. Its later structured-plan logic can identify planned-only rows, but
it has no representation for immutable report evidence.

### Root Cause

Path extraction and path authority are collapsed into one collection. A lexical
match becomes an active claim unless structured planning proves a narrow
planned-not-authored exception. Historical evidence has no state, so it is treated
as actionable by default.

### Related Capability Boundary

BUG-022 already defines active, historical, and error authority for Node command
candidates. Its current implementation is local to
`scripts/validate-test-file-reachability.mjs`. This bug is the second consumer of
the same policy distinction. Design must choose a shared project-owned classifier
or prove why direct reuse of those role rules is sufficient without creating two
independent authority vocabularies.

### Impact Analysis

- Affected component: spec-artifact test-path existence guard.
- Affected success signal: repository selftest.
- Protected evidence: Feature 031 report with five historical references.
- Preserved behavior: active missing paths and unknown candidates fail closed.
- Unaffected behavior: Feature 031 runtime, Research Agenda, Horizon Ladder,
  registry, navigation, and standalone routes.

## Fix Design

### Proposed Solution Approach

1. Keep repository-wide candidate extraction non-vacuous.
2. Classify each candidate by artifact role before it contributes to active path
   validation.
3. Preserve historical sites in a separate diagnostic collection.
4. Compile `actionableMissing` only from active authority plus existing structured
   planned-state rules.
5. Fail closed when a candidate cannot receive a recognized role.
6. Add paired fixtures carrying identical path bytes in a report and an active Test
   Plan. The report case must pass; the active case must fail.
7. Preserve the existing baseline and Feature 031 report bytes.

### Required Reuse Decision

Because this is the second authority-classification consumer, a local copy of
BUG-022's role policy is not acceptable without a capability analysis. The design
owner must inspect the current BUG-022 implementation and either expose a reusable
project-owned classifier or document one shared lower-level role model consumed by
both validators.

### Negative Controls

- Move the identical retired path from a report fixture to an active Test Plan.
  The active fixture must fail.
- Put an active-looking heading inside report evidence. Artifact role must remain
  historical.
- Put a path token on an unknown artifact surface. Validation must fail closed.
- Remove all active references. The scan must remain non-vacuous or fail rather
  than report a false clean result.

### Alternative Approaches Considered

1. Skip every file named `report.md`. Rejected because it hides provenance and
   duplicates the basename anti-pattern BUG-022 already rejected.
2. Add the retired path to the baseline. Rejected because this is newly discovered
   false authority, not accepted debt.
3. Delete the five Feature 031 references. Rejected because report evidence is
   append-only and the current command was executed.
4. Treat all `specs/**` path tokens as historical. Rejected because it disables
   active plan-path enforcement.

## Change Boundary

The preferred source boundary is `scripts/validate-spec-test-paths.mjs`, its
focused selftest fixtures, and any project-owned shared classifier approved by
design. Feature 031 and BUG-022 artifacts remain read-only inputs.

## Complexity Tracking

| Decision | Simpler alternative | Why rejected |
| --- | --- | --- |
| Closed authority classification | Skip report basenames | A basename skip hides provenance and can drift from BUG-022 policy. |
| Paired identical-byte controls | Test only the historical case | An ignore-all implementation would pass the weaker test. |
| Shared capability review | Copy role rules into the path guard | Two consumers would own conflicting authority definitions. |

## Required Design Decision

`bubbles.design` must identify the exact shared owner for artifact and section roles
before `bubbles.plan` freezes implementation paths and RED/GREEN commands.