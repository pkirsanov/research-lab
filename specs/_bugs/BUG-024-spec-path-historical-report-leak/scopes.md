# Scopes: BUG-024 Spec Path Historical Report Leak

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Planning Status

This is the initial bug-discovery scope handoff. `bubbles.plan` owns final scope,
Test Plan, DoD wording, and scenario-manifest reconciliation after design settles
the shared authority capability.

## Scope 1: Separate Active Path Authority From Historical Evidence

**Status:** Not Started

**Depends On:** none

**Scope-Kind:** test-infrastructure

**Requirements:** FR-BUG024-001 through FR-BUG024-008

### Consumer Surface

The consumers are `node scripts/validate-spec-test-paths.mjs --all-sites` and the
repository selftest that embeds its result.

### Change Boundary

Candidate implementation paths:

- `scripts/validate-spec-test-paths.mjs`
- the smallest focused fixture block selected by `bubbles.plan`
- a project-owned shared authority classifier only if approved by `bubbles.design`

Packet paths:

- `specs/_bugs/BUG-024-spec-path-historical-report-leak/**`

Excluded paths:

- `specs/031-shock-transmission-foundation/**`
- `scripts/validate-spec-test-paths.baseline`
- `specs/_bugs/BUG-022-historical-report-declaration-leak/**`
- all Feature 031 and Horizon Ladder implementation or test paths
- registry, navigation, standalone-Lab, and installed framework paths

### Gherkin Scenarios

```gherkin
Feature: Spec test-path validation respects artifact authority

  @SCN-BUG024-001
  Scenario: Historical report paths do not declare current tests
    Given a report receipt containing a retired tests path
    When path authority is classified
    Then the site remains visible as historical
    And it creates no actionable missing path

  @SCN-BUG024-002
  Scenario: Active planning paths remain fail-closed
    Given an active Test Plan containing the identical missing path
    When path authority is classified
    Then the site remains active
    And validation fails with artifact and line provenance

  @SCN-BUG024-003
  Scenario: Repository closure preserves evidence and the ratchet
    Given paired authority controls and the current Feature 031 report
    When repository validation runs
    Then historical sites do not fail and active missing sites do fail
    And the baseline and protected evidence remain unchanged
```

### Implementation Plan

1. Reconcile shared capability ownership with BUG-022's role model.
2. Add paired identical-byte historical and active fixtures before source changes.
3. Capture RED for the historical fixture while preserving an active positive
   failure control.
4. Separate candidate extraction from authority classification.
5. Retain historical provenance and fail closed on unknown candidates.
6. Run the focused validator, complete selftest, and protected-byte checks.

### Test Plan

| ID | Scenario | Type | Category | File / exact title | Command | Required result |
| --- | --- | --- | --- | --- | --- | --- |
| TP-BUG024-01 | SCN-BUG024-001 | Functional regression | functional | Focused production collector test selected by `bubbles.plan` | `node scripts/selftest.mjs` | A report path is historical and not actionable. |
| TP-BUG024-02 | SCN-BUG024-002 | Adversarial functional | functional | Paired active authority control | `node scripts/selftest.mjs` | The identical active Test Plan path still fails with provenance. |
| TP-BUG024-03 | SCN-BUG024-003 | Regression E2E | repository | Complete spec-path guard and repository suite | `node scripts/validate-spec-test-paths.mjs --all-sites` followed by `node scripts/selftest.mjs` as separate recorded commands | Both commands exit zero only after all independent groups close; no baseline growth. |
| TP-BUG024-04 | SCN-BUG024-003 | Evidence integrity | governance | Feature 031 report and BUG-022 packet | Exact byte and containment commands selected by `bubbles.plan` | Protected history and related packet bytes remain unchanged. |

### Definition of Done

- [ ] `bubbles.design` confirms one authority model for both BUG-022 precedent and
  the spec-path consumer.
- [ ] A pre-fix RED proves the historical report site is currently actionable.
- [ ] The paired active control fails before and after the repair.
- [ ] Historical sites remain observable with artifact and line provenance.
- [ ] Unknown candidate surfaces fail closed.
- [ ] Planned-not-authored structured rows retain their existing semantics.
- [ ] The missing-path baseline does not grow.
- [ ] An adversarial regression fails if report evidence regains active authority.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
- [ ] Broader E2E regression suite passes
- [ ] Feature 031, BUG-022, Horizon Ladder, registry, navigation, and standalone-Lab
  protected paths remain unchanged.
- [ ] Artifact lint, traceability, and transition validation record truthful
  outcomes.

## Current Blockers

Design has not selected the shared authority owner. Planning has not frozen the
focused test family or exact RED/GREEN commands. No implementation, post-fix test,
audit, or certification phase has run.