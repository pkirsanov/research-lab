# User Validation: BUG-008 — The Registered FX Route Claimed It Was Unregistered

Items are **checked by default** because each was verified by execution in this run. Uncheck
any item to report that the behavior is not what you observe, and it becomes a blocking
regression for the next run.

## Checklist

### [Verification] The FX route no longer contradicts its own registration state

- [x] Opening the FX Regime & Currency Vehicle Lab shows the Simple, Power, Brief, and Journey
      switcher, and no text anywhere claims the route is unregistered or pending registration.
- [x] Before the views finish loading, the placeholder reads `Loading the Simple, Power, Brief,
      and Journey views…` rather than a statement about registration.
- [x] The route still ships no page-local mode strip; the shared four-view switcher remains the
      only view control.
- [x] Nothing about the FX analytics changed — vehicle eligibility, owner decision, pair reads,
      dispositions, and reason codes behave exactly as before.

### [Verification] The guard is real

- [x] The regression test fails when the false claims are present and passes when they are not,
      proven with the same command in both directions.
- [x] The test reads `tools.json` and `site-exclusions.json` at run time, so it also fails if
      the tool is ever de-registered while the page still presents itself as live.

### [Verification] Nothing else moved

- [x] All 78 tests in the FX suite pass.
- [x] The repository selftest is unchanged at 1578 passed, 0 failed.
- [x] Every `getElementById` on the edited page still resolves.

### [Open] Items this run did not settle

- [x] This guard protects the FX route only. Eight other registered tools were audited and none
      currently carries the same defect, so no sibling guard was written. If you would rather
      have a repository-wide check that every registered tool's markup agrees with the registry,
      that is a separate packet — uncheck this item to request it.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-25T16:59:38Z
- method: external-record
- record: .specify/memory/open-work.md residue row res-acceptance-method-mislabelled, and the grant quoted in res-g136-acceptance-record-backfill section OPERATOR ACCEPTANCE GRANT 2026-08-28
