# Bubbles Framework Change Proposal

- Title: Scenario receipt append-only supersession
- Slug: scenario-receipt-append-only-supersession
- Created: 2026-09-02
- Created From: research-lab
- Requested Upstream Repo: bubbles
- Downstream Finding: BUG022-APPEND-ONLY-SUBSTITUTION-DEADLOCK

## Summary

Give scenario-state resolution a deterministic current proof-chain view over
the append-only tool log. Keep every receipt as history, but stop superseded
same-revision attempts from blocking a later valid RED-to-GREEN chain.

## Why This Must Be Upstream

The receipt binding contract and resolver live in framework-managed paths.
Research Lab cannot change their behavior through project-owned configuration.
Editing `.github/bubbles/**` downstream would violate framework ownership and
would be replaced by the next framework refresh.

## Current Downstream Limitation

BUG-022 records eight final RED receipts at tool-log rows 2685 through 2692.
Each row binds one distinct `SCN-BUG022-*` scenario to its planned test and
negative control. Every row exits 1 on its intended behavioral assertion.

The installed resolver does not select a current attempt. It selects the first
nonzero RED for each scenario. It then scans every same-revision GREEN receipt.
It also refuses every exit-zero RED, including an older attempt replaced by a
later valid RED.

BUG-022's final recorded resolver execution returns 34 blocking refusals:

- 28 `SCS-TEST-SUBSTITUTED`
- 5 `SCS-CONTROL-SUBSTITUTED`
- 1 `SCS-RED-NOT-FAILING`

The last refusal belongs to preserved row 2674. That row exited 0 and must
never count as RED evidence. Rows 2685 through 2692 correct the receipt set,
but the append-only log gives the resolver no way to adjudicate prior attempts.

Deleting or rewriting old rows would corrupt evidence. Relabeling row 2674
would accept an invalid RED. A downstream state or manifest declaration would
create a second authority. None is an admissible workaround.

## Proposed Bubbles Change

1. Define JSONL append order as the occurrence order for scenario receipts.
2. Resolve one current chain per `sourceRevision` and `scenarioId`.
3. Start that chain at the latest appended RED receipt for the scenario.
4. Evaluate the current RED itself. An exit-zero current RED must still raise
   `SCS-RED-NOT-FAILING`. Never fall back to an older nonzero RED.
5. Treat earlier same-scenario receipts as superseded history. They must remain
   visible in resolver output, but they must not advance state or block it.
6. Within the current chain, use the latest appended receipt for each later
   phase. Enforce append order across RED, implement, GREEN, live, regression,
   and observed phases.
7. Apply the existing same-scenario, same-test, same-control, source-revision,
   and cross-scenario checks to the current chain.
8. Keep an active mismatched GREEN blocking with the existing substitution
   codes. A newer matching GREEN may replace that failed attempt without
   deleting it.
9. Report each excluded row through a structured `supersededReceipts` result.
   Include its one-based log row, scenario, phase, replacement row, and reason.
10. Do not add a hand-written scenario state, skip flag, or downstream
    adjudication sidecar.

This contract needs no mutable receipt update and no tool-log deletion. The
resolver computes the current view while retaining the complete audit trail.

## Affected Framework Paths

- `bubbles/registry/scenario-states.yaml`
- `bubbles/scripts/scenario-state-resolve.sh`
- `bubbles/scripts/scenario-state-resolve-selftest.sh`
- `bubbles/scripts/state-transition-guard-selftest.sh`, if caller coverage is
  needed for the new structured resolver output
- Generated release manifest entries for changed framework files

## Non-Goals

- Do not make a stale receipt current.
- Do not accept an exit-zero RED as `RED_VERIFIED`.
- Do not weaken test, negative-control, revision, or scenario identity checks.
- Do not infer implementation or GREEN from receipts before the current RED.
- Do not mutate or compact `.specify/runtime/tool-calls.jsonl`.
- Do not allow a manifest or state file to declare a derived scenario state.

## Expected Downstream Outcome

After an upstream release and downstream refresh, BUG-022 resolves rows 2685
through 2692 as eight current `RED_VERIFIED` anchors. Older attempts remain
auditable as superseded receipts. They no longer produce the 34 permanent
substitution and invalid-RED blockers.

The resolver must not derive implementation or GREEN from pre-anchor receipts.
BUG-022 remains non-certifiable until new post-RED implementation and GREEN
receipts satisfy the normal chain.

## Acceptance Criteria

- [ ] The tool log remains byte-for-byte append-only during resolution.
- [ ] Append position, not timestamp text, determines receipt occurrence order.
- [ ] The latest RED receipt opens the current chain for one scenario and source revision.
- [ ] A current exit-zero RED raises `SCS-RED-NOT-FAILING` and derives no RED state.
- [ ] A later nonzero RED supersedes an earlier exit-zero RED without accepting the earlier receipt.
- [ ] Superseded receipts remain visible with row, replacement, phase, scenario, and reason fields.
- [ ] Receipts before the current RED cannot derive `IMPLEMENTED`, `GREEN_TARGETED`, or later states.
- [ ] Historical mismatched GREEN receipts before the current RED do not emit blocking substitution refusals.
- [ ] The current mismatched GREEN still raises `SCS-TEST-SUBSTITUTED` or `SCS-CONTROL-SUBSTITUTED`.
- [ ] A later matching GREEN supersedes an earlier mismatched GREEN within the current chain.
- [ ] Cross-scenario substitution remains blocking for current proof chains.
- [ ] Source-revision drift remains excluded and cannot satisfy a required state.
- [ ] A hermetic fixture covering BUG-022's row order derives eight `RED_VERIFIED` states and zero historical blockers.
- [ ] That fixture derives no post-RED state until a later implementation and matching GREEN receipt exist.
- [ ] Upstream selftests cover valid replacement, invalid latest RED, active mismatched GREEN, and preserved history.
- [ ] The installer or refresh flow distributes the changed registry, resolver, and selftests downstream.
- [ ] Refreshed Research Lab resolves the recorded BUG-022 history without a local framework patch.

## Downstream Evidence

- `specs/_bugs/BUG-022-historical-report-declaration-leak/report.md#scenario-receipt-integrity-repair-revision-6`
- `.specify/runtime/tool-calls.jsonl` rows 2685 through 2692
- Installed resolver branch in `.github/bubbles/scripts/scenario-state-resolve.sh`

## Notes

- Do not edit `.github/bubbles/**` or other framework-managed paths locally.
- Implement and test this change in the upstream Bubbles source repository.
- Refresh Research Lab only after the upstream framework release is available.
