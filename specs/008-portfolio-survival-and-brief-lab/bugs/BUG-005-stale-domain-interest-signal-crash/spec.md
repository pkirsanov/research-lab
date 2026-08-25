# Specification: BUG-005 Stale-Domain Interest Signal Derivation

Governing feature: `specs/008-portfolio-survival-and-brief-lab`.
This document states the behavior `rlportfolio.deriveInterestSignals` MUST have
when a domain's evidence has aged out. It does not restate the feature spec.

## Expected Behavior

### EB-1 — Derivation returns an envelope, never throws

`deriveInterestSignals(workspace, now, policy)` MUST return
`{ ok: true, value: signals }` or `{ ok: false, error: {...} }` for every input
that satisfies `validateWorkspace` and carries a canonical `now`. It MUST NOT
propagate an exception to its caller.

The module has one failure protocol. A thrown `RangeError` is not that protocol:
the lab renders `result.error.code + " · " + result.error.reason`, so a throw
produces no message, no `warn` state, and no recovery — it takes down the calling
render instead.

### EB-2 — A stale-only domain yields no interest signal

If every eligible event in a domain lies outside
`[now - maximumEvidenceAgeDays, now]`, that domain MUST NOT appear in the emitted
signal array.

This is the honest reading of the contract, not a convenience. Under
`portfolio-interest-signal/v1`, `validateInterestSignal` requires:

- `supportingEventIds` — a **non-empty** array of hashes,
- `latestSupportAt` — a canonical timestamp, non-null,
- `expiresAt` — a canonical timestamp, non-null.

A stale-only domain has none of the three and cannot acquire them without
inventing evidence. An emitted signal in this system *means* "live evidence
exists in this domain". Absence therefore states exactly the truth — "no live
evidence here" — while an emitted null-support row would be a persisted,
never-expiring claim standing on evidence the policy has already retired. The
module's own comment names that hazard: *"Expiry is derived from declared policy,
so a signal cannot outlive the evidence under it."*

### EB-3 — A stale domain must not suppress its fresh siblings

If one domain in a workspace is stale-only and another has in-window evidence,
the derivation MUST emit a signal for the fresh domain. One retired domain MUST
NOT erase a valid one.

### EB-4 — Future-dated-only domains behave identically

`ageDays < 0` is rejected by the same filter. A domain whose only evidence is
future-dated relative to `now` MUST also yield no signal, and MUST NOT throw.

### EB-5 — What remains rejected after the fix

The fix widens nothing. All of the following MUST still hold, and are asserted:

| Rejection | Still enforced |
| --- | --- |
| Out-of-window evidence contributes to `evidenceScore` | No — score is unchanged for fresh domains and the stale domain has no score at all |
| Out-of-window evidence counts toward `minimumDistinctCompletions` / `minimumDistinctUtcDates` | No — the floor is computed only from surviving events |
| A domain with in-window evidence below the floor is dropped | No — it is still EMITTED with `floorSatisfied: false` and band `insufficient-evidence` |
| `validateInterestSignal` accepts a null `latestSupportAt` or `expiresAt` | No — the validator is unchanged and still refuses both |
| `validateInterestSignal` accepts empty `supportingEventIds` | No — unchanged, still refused |
| Semantic de-duplication (BUG-004 contract) | No — unchanged; the fix does not move the age filter relative to `dedupeBehaviorEvents` |

The last row is load-bearing. BUG-004 settled *where* the age filter sits
relative to semantic collapse. This fix must not disturb that placement, or it
would silently reopen BUG-004.

## Acceptance Criteria

| ID | Criterion | Verified by |
| --- | --- | --- |
| AC-1 | The all-stale-domain input that threw now returns `ok: true` | SCN-B005-STALE-OMITTED |
| AC-2 | The stale domain is absent from the emitted array | SCN-B005-STALE-OMITTED |
| AC-3 | A fresh sibling domain in the same workspace still emits its signal, with its pre-existing `evidenceScore` and `relevanceBand` unchanged | SCN-B005-FRESH-SIBLING |
| AC-4 | Reinstating the superseded pre-filter bucket creation turns AC-1 red | SCN-B005-DISCRIMINATION |
| AC-5 | A future-dated-only domain returns `ok: true` and emits no signal | SCN-B005-STALE-OMITTED |
| AC-6 | An in-window domain below the evidence floor is still emitted with `floorSatisfied: false` | SCN-B005-FLOOR-PRESERVED |
| AC-7 | `rlportfoliobrief` and `rlportfolio` agree that a stale domain carries zero live relevance | SCN-B005-BRIEF-AGREEMENT |

## Non-Goals

- Changing `portfolio-interest-signal/v1` or `validateInterestSignal`.
- Changing `BehaviorInterestSignal/v1` or the brief's floor accounting.
- Changing `maximumEvidenceAgeDays`, `halfLifeDays`, or any declared policy value.
- Changing where the age filter sits relative to `dedupeBehaviorEvents`.
