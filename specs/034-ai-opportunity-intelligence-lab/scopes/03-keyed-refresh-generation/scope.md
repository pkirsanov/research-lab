# Scope 3 — Keyed refresh generation

Scope ID: `03-keyed-refresh-generation`
**Status:** Not Started
Scope-Kind: runtime-behavior
Depends On: `02-evidence-critical-path-dossier`

## Outcome And Requirements

Perform selected, rights-qualified acquisition and append an immutable full-universe overlay. A source failure preserves its company and history but marks current research failed. Relevant-row equality prevents false promotion. FR-034-023–026, 083–089; SCN-034-003–004, 027; NFR-034-004–005, 008–009, 011, 013.

## Gherkin

```gherkin
Scenario: SCN-034-003 Overlay a selected refresh
  Given a full-universe current generation and three selected entities
  When the headless refresher composes the next candidate
  Then only the selected assessments are updated
  And all other identities retain their prior reviewed dates

Scenario: SCN-034-004 Preserve a failed selection
  Given one requested source fails acquisition
  When the full-universe candidate is composed
  Then the entity stays in every industry membership
  And the source and current research states show a named failure, not no-change
```

`TP-03-03` repeats integration coverage for `SCN-034-027`, whose sole Gherkin definition and ownership remain in Scope 2. This row validates the refresh-generation boundary without redefining the scenario.

## Implementation Plan

1. Add versioned source-use policies, cadence, public/approved-licensed provider request/result contracts, and bounded `scripts/ai-opportunity-refresh.mjs` orchestration. The base tool works without a licensed source.
2. Reuse governed public acquisition only where approved access/retention terms fit; preserve hashes and reference-only results for restricted records. Prohibited rights refuse public publication.
3. Require one result per requested source and one refresh classification per selected identity. Separate not-due, unavailable, refused, unchanged-row, refreshed, carried, and unreviewed.
4. Recompose the entire candidate universe by stable IDs. Retain old review clocks for carried records; failed evidence cannot appear current. Report refreshed/carried/failed/unreviewed counts.
5. Freeze cutoff, selection/source-plan/predecessor digests and request ID. Same-request retry is byte-stable; changed inputs require a new ID. Publish no partial selector yet; Scope 8 wires full transaction.

## Test Plan

| ID | Type | Scenario ID | Persistent File and Exact Title | Command | Live system |
| --- | --- | --- | --- | --- | --- |
| TP-03-01 | integration | SCN-034-003 | `tests/ai-opportunity-refresh.integration.mjs` — `three-entity refresh retains full universe and distinct clocks` | `node --test tests/ai-opportunity-refresh.integration.mjs` | Yes, real refresh composer with controlled external provider boundary |
| TP-03-02 | e2e-api | SCN-034-004 | `tests/ai-opportunity-refresh.e2e.mjs` — `Regression: one failed acquisition publishes an honest full-universe candidate and retry collision refuses` | `node --test tests/ai-opportunity-refresh.e2e.mjs` | Yes, disposable production-format records |
| TP-03-03 | functional | SCN-034-027 | `tests/ai-opportunity-refresh.functional.mjs` — `changed response with unchanged relevant rows records no progress` | `node --test tests/ai-opportunity-refresh.functional.mjs` | Yes, real provider result and generation diff |

### Definition of Done

- [ ] SCN-034-003: Overlay a selected refresh is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-004: Preserve a failed selection is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-027 integration coverage is verified at the refresh-generation boundary without creating a second scenario definition.
- [ ] TP-03-01 passes with 23/230/196/197 preservation, source rights, clocks, and partial-refresh counts.
- [ ] TP-03-02 passes with failed identity retention, named failure, and retry-collision proof.
- [ ] TP-03-03 passes with changed-response and unchanged-relevant-row proof.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass.
- [ ] Broader E2E regression suite passes.
- [ ] Build quality gate: selftest, source-policy/privacy validator, artifact lint, progress telemetry and docs pass; no stale result is relabeled current.
