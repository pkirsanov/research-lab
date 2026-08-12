# Bubbles Framework Change Proposal

- Title: traceability scenario id declared mapping
- Slug: traceability-scenario-id-declared-mapping
- Created: 2026-08-12
- Created From: research-lab
- Requested Upstream Repo: bubbles

## Summary

Let an explicit shared trace ID establish a scenario-to-DoD mapping in
`traceability-guard.sh`, instead of only grading a mapping that word-overlap
already found. Today the strongest available evidence of intent — a DoD item that
names the scenario's own `SCN-` ID — cannot create a match, so a DoD item that
cites a scenario by ID is still reported as having no faithful DoD item.

## Why This Must Be Upstream

The matching logic is entirely inside the framework-owned
`bubbles/scripts/traceability-guard.sh`. No project artifact can change how
`scenario_matches_dod` decides a mapping. A downstream `.github/bubbles/**` edit
violates framework immutability and is refused by `framework-write-guard`.

## Current Downstream Limitation

Feature 007 Scope 01 spec.md declares:

```
### SCN-007-005 / BS-005 - Stock four-hour profile discloses session mismatch
Scenario: Four-hour U.S. stock bars require an explicit session policy
```

and its scope DoD declares:

```
- [x] TP-01-04 Regression E2E evidence proves SCN-007-005 discloses the U.S.
      core-session remainder and uses a distinct identity.
```

The DoD item names `SCN-007-005` outright. The guard still reports:

```
scopes/01-capability-foundation/scope.md Gherkin scenario has no faithful DoD
item preserving its behavioral claim: Four-hour U.S. stock bars require an
explicit session policy
```

Two independent causes, both verified by reading guard source:

1. **The ID check is downstream of the match.** `classify_match_kind` already
   calls `extract_trace_ids` on BOTH sides and returns `declared` when they share
   an ID — but it is only invoked AFTER `scenario_matches_dod` has already
   succeeded. When word overlap fails, the scenario is reported unmapped and the
   ID is never consulted.
2. **The scenario string carries no ID to consult.** The matcher receives the
   `Scenario:` title only; the `SCN-` ID lives on the preceding `###` heading.
   The guard's own summary confirms this — it reports
   `Edge confidence: declared=0 inferred=19 ambiguous=10`. `declared=0` is not a
   property of this feature's authoring; it is structural, because the ID never
   reaches the comparison.

The consequence is a gate that cannot be satisfied by the very convention the
framework asks authors to use. Feature 007 recorded the resulting state as
`blocked` pending "a canonical traceability run … exiting 0", and 25 of its 53
traceability failures are this false positive.

## Proposed Bubbles Change

1. Carry the scenario's `SCN-` ID alongside its title from the extractor, so the
   comparison has an ID to consult at all.
2. In `scenario_matches_dod`, treat a shared trace ID as a match, evaluated
   BEFORE the word-overlap floor. An explicit ID is stronger evidence than any
   similarity score, so it should not be reachable only through one.
3. Keep word overlap as the fallback for DoD items that do not cite an ID, so
   nothing that matches today stops matching.
4. Report such matches as `declared` in the existing edge-confidence counters,
   which makes the improvement observable rather than silent.
5. Add selftest coverage: a DoD item citing the scenario ID with near-zero word
   overlap must MATCH; a DoD item citing a DIFFERENT scenario's ID with near-zero
   overlap must still NOT match, so the ID path cannot become a blanket pass.

## Affected Framework Paths

- `bubbles/scripts/traceability-guard.sh` (scenario extraction, `scenario_matches_dod`, `classify_match_kind`)
- the traceability guard selftest

## Not In Scope For This Proposal

18 of Feature 007's 53 failures are `report is missing evidence reference for
concrete test file` against scopes whose status is `Not Started`. That is a
separate question — whether a feature-level traceability run should demand
delivery evidence from scopes that have not begun — and is deliberately NOT
bundled here. Fixing the ID mapping alone does not make Feature 007 clean, and
this proposal does not claim it does.

## Expected Downstream Outcome

Scenarios whose DoD item cites their `SCN-` ID are reported as mapped with
`declared` confidence, and Feature 007's 25 false `no faithful DoD item` failures
resolve without editing a single scenario, Test Plan row, or DoD claim — which is
exactly the constraint its recorded resolution demands.

## Acceptance Criteria

- [ ] A DoD item citing the scenario's ID matches even with near-zero word overlap.
- [ ] A DoD item citing a different scenario's ID does NOT match on ID alone.
- [ ] Existing word-overlap matches are unchanged.
- [ ] ID-established matches are counted as `declared`, not `inferred`.
- [ ] Feature 007's `no faithful DoD item` failures drop to 0 with no artifact edited.
