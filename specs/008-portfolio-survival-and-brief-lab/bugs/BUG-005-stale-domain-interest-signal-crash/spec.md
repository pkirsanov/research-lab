# Specification: BUG-005 Stale-Domain Interest Signal Derivation

Governing feature: `specs/008-portfolio-survival-and-brief-lab`.
This document states the behavior `rlportfolio.deriveInterestSignals` MUST have
when a domain's evidence has aged out. It does not restate the feature spec.

## Outcome Contract

**Intent:** Make interest-signal derivation survive its own evidence-expiry
policy. A domain whose eligible evidence has all aged out must resolve to
*nothing* — no signal, no bucket, no claim — and the derivation must return its
declared envelope rather than throwing into the caller's render. The repair must
buy that survival without widening what counts as live evidence.

**Success Signal:** `tests/portfolio-stale-domain-signal.unit.mjs` is 6/6 green
against the shipped `rlportfolio.js`, and 0/6 against the same suite when only
`rlportfolio.js` is reverted to `732bccb6c^` — every row fails, the leading row
with `RangeError: Invalid time value` raised from `Date.toISOString` inside
`Object.deriveInterestSignals`. The pair is the signal, not either half: the
suite fails on the defect and passes on the fix, so it discriminates rather than
passing vacuously. `SCN-B005-DISCRIMINATION` carries that same proof inside a
single run — it reinstates the superseded pre-filter bucket creation in loaded
source, first asserts the mutant is still functional on in-window-only input (so
it is a faithful reinstatement, not merely a broken module), then asserts the
mutant throws `RangeError` on the exact mixed workspace for which the shipped
module returns `ok: true`. Non-movement is measured, not assumed:
`tests/portfolio-behavior-occurrence.unit.mjs` with
`tests/portfolio-brief.functional.mjs` stays 36/36 and `node scripts/selftest.mjs`
stays 3409 passed / 0 failed.

**Hard Constraints:**

- `deriveInterestSignals` has exactly one failure protocol: `{ ok: true, value }`
  or `{ ok: false, error }`. A thrown exception is not that protocol and is never
  an acceptable outcome for an input that satisfies `validateWorkspace`.
- Omission is the honest encoding of "no live evidence here". A stale-only domain
  MUST NOT instead be emitted with null support: under
  `portfolio-interest-signal/v1` that would be a persisted, never-expiring claim
  standing on evidence the policy has already retired.
- `validateInterestSignal` is unchanged and stays strict — it still refuses a null
  `latestSupportAt`, a null `expiresAt`, and an empty `supportingEventIds`. The
  repair must not create pressure to relax it.
- Omission applies only to stale-*only* domains. A domain with in-window evidence
  below the floor is still EMITTED, with `floorSatisfied: false` and band
  `insufficient-evidence`. Silently dropping live-but-thin evidence would be a
  different defect wearing this fix's clothes.
- Out-of-window evidence contributes nothing it did not already contribute: not
  to `evidenceScore`, not to `minimumDistinctCompletions`, not to
  `minimumDistinctUtcDates`. The window itself does not move —
  `maximumEvidenceAgeDays` and `halfLifeDays` are unchanged.
- One stale domain MUST NOT suppress a fresh sibling in the same workspace.
- The age filter keeps its position relative to `dedupeBehaviorEvents`. BUG-004
  settled that placement; only bucket creation moves. Disturbing the filter/dedupe
  order would silently reopen BUG-004.
- The change is confined to statement ordering inside `deriveInterestSignals`. It
  stores no new field, adds no new persisted value, and touches no privacy or
  publication surface.

**Failure Condition:** The repair fails if a stale-only domain again acquires a
bucket and throws, or if it is emitted at all — a null-support row is a worse
outcome than the crash, because the crash is at least visible. It fails if
omission spreads beyond stale-only domains and swallows below-floor in-window
evidence, if a stale domain erases a fresh sibling, or if the filter/dedupe order
shifts and reopens BUG-004. It also fails as *verification* if the carrier ever
passes against pre-fix source: a suite that cannot go red has stopped being
evidence, whatever its pass count says.

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
