# Bug Specification: BUG-024 Spec Path Historical Report Leak

## Intent

Make test-path existence validation distinguish current path authority from
immutable historical evidence while retaining fail-closed checks for active plans.

## Outcome Contract

- Historical `report.md` path tokens remain observable but non-authoritative.
- The identical path token in an active scope Test Plan remains authoritative.
- Structured planned-not-authored rows retain their current non-failing state rules.
- Unknown candidate surfaces fail closed with artifact and line provenance.
- The frozen baseline only shrinks.
- Feature 031 evidence remains unchanged.

## Stable Scenarios

### SCN-BUG024-001: Historical report paths do not declare current tests

Given a report containing a real prior command or retired `tests/*.mjs` token,
when spec-path validation classifies reference authority, then the site remains
diagnostic and does not create an active missing-path failure.

### SCN-BUG024-002: Active planning paths remain fail-closed

Given the identical missing path in an active scope Test Plan, when validation
runs, then it remains actionable and fails with artifact and line provenance.

### SCN-BUG024-003: Repository closure preserves history and the ratchet

Given historical and active controls plus the current Feature 031 report, when the
complete selftest runs, then historical sites do not fail, active missing paths do
fail, the baseline does not grow, and protected evidence bytes remain unchanged.

## Functional Requirements

- `FR-BUG024-001`: Assign every extracted path site an explicit authority role.
- `FR-BUG024-002`: Exclude historical report sites from actionable missing paths.
- `FR-BUG024-003`: Retain historical sites in diagnostics with artifact and line.
- `FR-BUG024-004`: Keep active Markdown and structured Test Plan sites authoritative.
- `FR-BUG024-005`: Fail closed on unclassified path candidates.
- `FR-BUG024-006`: Preserve planned-not-authored classification semantics.
- `FR-BUG024-007`: Preserve the baseline and Feature 031 report bytes.
- `FR-BUG024-008`: Reuse BUG-022's authority semantics or a project-owned shared
  capability rather than adding a conflicting second policy.

## Acceptance Criteria

1. The current pre-fix path guard records one missing path across five Feature 031
   report sites.
2. A historical-report fixture with the same path returns a historical site and no
   actionable missing entry.
3. An active-plan fixture with the same path remains a new missing entry.
4. An unknown candidate surface produces a named classification failure.
5. `node scripts/validate-spec-test-paths.mjs --all-sites` exits zero without
   baseline growth after the repair.
6. `node scripts/selftest.mjs` exits zero after all independently owned broad
   groups close.
7. Feature 031, BUG-022, Horizon Ladder, registry, navigation, and standalone-Lab
   protected paths remain unchanged.

## Non-Goals

- Rewriting Feature 031 report history.
- Adding the retired path to the baseline.
- Weakening active path existence checks.
- Reopening BUG-022's completed implementation boundary inside this packet.
- Changing Feature 031 or Horizon Ladder product behavior.