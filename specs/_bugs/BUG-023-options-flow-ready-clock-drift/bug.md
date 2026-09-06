# Bug: BUG-023 Options Flow Ready Clock Drift

## Summary

The repository selftest requires the options-flow owner read to be `ready` at the
wall clock even after the committed option evidence has crossed its seven-day
freshness boundary. The production builder correctly returns `unavailable`, then
later assertions dereference ready-only metrics and turn one clock mismatch into
three failures.

## Severity

- [ ] Critical - System unusable or data loss
- [x] High - A repository-wide delivery gate is blocked with no admissible Feature 031 repair
- [ ] Medium - Feature broken with a safe workaround
- [ ] Low - Minor issue

## Status

- [ ] Reported
- [x] Confirmed by current broad-selftest evidence and controlling-path inspection
- [x] In Progress
- [ ] Fixed
- [ ] Verified
- [ ] Closed

## Filed

- Date: 2026-09-01
- Repository: `research-lab`
- Workflow mode: `bugfix-fastlane`
- Source finding: `F031-BROAD-OPTIONS-FLOW-001`
- Discovery evidence: Feature 031 tool-log rows 427 and 430

## Reproduction Steps

1. Run `node scripts/selftest.mjs` after the newest committed option snapshot is
   older than `OWNER_SNAPSHOT_FRESH_MAX_DAYS`.
2. Observe the options-flow `READY` assertion fail.
3. Observe the next assertion read `contractsFlagged` and `consideredCount` from
   the unavailable result.
4. Observe the following assertion dereference `flow.metrics.top.length`, even
   though unavailable metrics contain only `state` and `reason`.

The current reproduction was executed by `bubbles.test` for Feature 031. This bug
phase did not rerun the test. The exact command, exit, output hash, and failure
lines are retained in `report.md` and the Feature 031 evidence record.

## Expected Behavior

- The live owner read rejects stale option evidence and exposes no ready-only
  metrics.
- A positive owner-model regression evaluates evidence at an explicit instant
  inside the production freshness boundary.
- A stale-evidence regression evaluates an explicit instant outside that boundary
  and requires the named unavailable result.
- The repository selftest does not depend on the date it is executed.
- One unavailable state produces direct state assertions, not a secondary
  property-access exception.

## Actual Behavior

`buildOptionsFlowToolRead()` uses the real wall clock when `asOf` is absent. The
selftest calls it without `asOf`, includes the options-flow read in an unconditional
`readyIds` list, then reads ready-only metrics. On the current evidence, the builder
returns `metrics: { state, reason }`, so the group emits two failed assertions and
one thrown `top.length` access.

## Root Cause

The broad selftest combines two incompatible clock contracts in one variable.
The production call is live-clock and freshness-sensitive, while its assertions
treat the same call as a timeless positive fixture. The later stale-tape case
already proves that production must reject old evidence. The positive case never
pins an in-window decision time, so committed evidence inevitably ages from green
to red without a code change.

## Impact

- `node scripts/selftest.mjs` exits 1 with 3419 passes and five failures.
- Three failures belong to this one options-flow group.
- Feature 031 Scope 1 cannot satisfy its broad build-quality row even though its
  eleven scope rows and five-test Research Agenda browser closure pass.
- Editing Feature 031 would hide an external failure and violate its work boundary.

## Existing-Owner Check

The canonical `specs/_bugs/BUG-*` inventory was searched for the finding id, the
freshness symptom, and the unconditional ready assertion. No existing packet owns
this defect. BUG-022 owns historical report path classification. BUG-017 owns its
own unfinished Scope 2 and certification mirror. Neither packet owns options-flow
clock semantics.

## Change Boundary

Potential repair surfaces for design review:

- `scripts/selftest.mjs`
- `scripts/brief-refresh.mjs`
- `scripts/owner-state.mjs`
- `rlexperience-adapters/options.js`
- `data/options/**`
- this BUG-023 packet

Protected surfaces:

- `specs/031-shock-transmission-foundation/**`
- `rlshock.js` and every Feature 031 test or fixture
- `horizon-ladder-lab.html`, `horizon-ladder-universe.json`, its note, and its tests
- `tools.json`, `index.html`, and `rlnav.js`
- any new standalone Shock Transmission Lab or Options Flow Lab route
- every other bug packet
- installed framework files under `.github/`

## Related

- Blocking feature: `specs/031-shock-transmission-foundation/`
- Production read: `scripts/brief-refresh.mjs#buildOptionsFlowToolRead`
- Owner-state input: `scripts/owner-state.mjs#optionsFlowOwnerState`
- Owner model: `rlexperience-adapters/options.js#computeAnomalySummary`
- Broad assertion group: `scripts/selftest.mjs`

## Required Route

`bubbles.design` must reconcile the initial fix design and choose the smallest
clock-stable contract. `bubbles.plan` must then own the executable scope and test
plan. Implementation and test execution remain unstarted.