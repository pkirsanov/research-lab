# Spec: BUG-016 — A Branch That Carries A Test Also Carries What The Test Exercises

## Purpose

This specification states the behaviour that would have prevented the defect in `bug.md` and
the behaviour a remedy must establish. It does not select between the remedy options in
`design.md`; that selection is an owner decision recorded there.

## Behaviour Under Specification

A blocking deploy gate exists to answer one question: is this branch fit to publish. It can
only answer that question if the branch is internally coherent — if the assertions it runs
describe behaviour it actually contains.

The defect is a coherence failure. `origin/main` runs six assertions against a panel it does
not carry. The gate correctly reports red; the branch is genuinely unfit. What is wrong is
that the branch reached that state silently, and stayed there across eleven runs, because
nothing in the pipeline notices when a merge discards the implementation half of a change
while keeping the test half.

## Requirements

### FR-016-001 — The deployed branch carries the page wiring its specs exercise

Every selector asserted by `tests/lifetime-tax-combined.spec.mjs` resolves on
`lifetime-tax-strategy-lab.html` as that page exists on the deployed branch. The selectors
currently absent are `#combinedCurveChart`, `#combinedSettlementCard`, and
`[data-rl-value="combinedFederalLeg"]`, together with the `rltaxcombined.js` script tag that
mounts them.

### FR-016-002 — A merge that drops an implementation is not silent

When a merge resolution removes content that a commit on one parent introduced, and a spec
file exercising that content remains on the result, the condition is detectable before the
result is published. Detection may be a guard, a gate, or a check; this requirement fixes the
property, not the mechanism.

### FR-016-003 — The gate names its owners

A run that fails in more than one independently owned area reports the split. A reader of a
red gate can determine which failures are theirs without downloading and parsing the report
artifact by hand.

### FR-016-004 — The remedy covers all three absent selectors

A fix is verified against `#combinedCurveChart`, `#combinedSettlementCard
[data-rl-unavailable]`, and `[data-rl-value="combinedFederalLeg"]`. Verifying only the
selector named in the most visible error clears one of six tests and leaves five red.

### FR-016-005 — The deployed spec revision matches the deployed page revision

The spec file on the deployed branch is the revision that describes the deployed page. The
current mismatch is observable: the deployed branch still runs a test title that commit
`8135cb540` retired locally as a false claim.

### FR-016-006 — The remedy does not reintroduce the loss

Whatever reconciles the two resolutions leaves the wiring present on the deployed branch
across subsequent merges. Four merges have already discarded it once each; a remedy that
restores it without addressing recurrence restores a value that the next merge may drop.

## Acceptance Criteria

- The deploy workflow's `verify` job passes on the deployed branch, and `deploy` runs rather
  than reporting `skipped`.
- All eight tests in `tests/lifetime-tax-combined.spec.mjs` pass against the deployed page.
- The wiring markers counted in `report.md` are non-zero on the deployed branch.
- `node scripts/selftest.mjs` reports zero failures and no fewer assertions than the recorded
  baseline.
- The recurrence condition in FR-016-002 is either satisfied by a landed mechanism or
  explicitly declined by the owner with the decision recorded.

## Explicitly Out Of Scope

- The twenty-five failures owned outside this packet. They are attributed in `bug.md` and are
  a separate remedy with a separate owner.
- The macOS-only browser-teardown defect. It is filed separately as
  `specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos`, does not reproduce
  in the pipeline, and is not a cause of the red gate.
- Any decision about pushing, merging, rebasing, or moving a branch or remote.

## Grounding

Every factual claim in this specification is established by executed evidence in `report.md`.
Nothing here is inherited from a description that was not re-derived during filing.
