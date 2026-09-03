# User Validation: BUG-023 Options Flow Ready Clock Drift

## Automation Readiness

- [ ] A deterministic pre-fix RED proves the positive owner-model case fails when
  its decision time is not explicit.
- [ ] The positive case executes the real page parser, owner-state builder, and
  owner model at an in-window instant.
- [ ] The stale case executes the same production builder outside the freshness
  boundary and remains unavailable.
- [ ] The complete repository selftest exits zero after all three independently
  owned broad groups close.
- [ ] Protected Feature 031, Horizon Ladder, registry, navigation, and standalone
  route paths remain unchanged.

## Checklist

- [ ] A stale options tape is labeled unavailable and is never presented as current.
- [ ] The positive options-flow model proof remains present and uses real owner
  output rather than shaped placeholder metrics.
- [ ] Running the repository selftest on a later date does not change the positive
  options-flow result for unchanged explicit test inputs.
- [ ] An unavailable owner read reports its state directly without a secondary
  property-access exception.
- [ ] No Feature 031 or Horizon Ladder behavior changes as part of this repair.

## Human Acceptance Record

- acceptedBy: [human name or handle - never an agent id]
- acceptedAt: [YYYY-MM-DDTHH:MM:SSZ]
- method: [human-interactive | external-record]
- record: [required only for external-record]