# Spec: BUG-020 — A Figure Outside The Representable Range Is Refused, Not Printed

## Purpose

The route may not present a symbol that is not a number as though it were a
settled figure carrying enacted law. When a computed amount falls outside the
range a double can represent, the surface that would have shown it must name a
refusal instead.

This specification describes the behaviour required. It does not choose the
refusal code, because the code vocabulary is closed and pinned and widening it is
an owner decision. See `design.md` for the two options and the question they turn
on.

### Single-Capability Justification

**Classification:** Existing-capability extension with one refusal path.

This packet extends the existing refusal and value-record contracts.
`rltax.js::computeTaxableIncome` rejects a non-finite sum through `rules.unavailable`.
`rltax.js::formatForDisplay` rejects a non-finite value record through the same contract.
`rltaxrules.js` adds one refusal code, and the route already consumes unavailable records.

The packet adds no second formatter family, numeric provider, rendering strategy, or extension
point. One shared formatter and one shared refusal shape already exist. The repair closes those
existing paths instead of creating a new reusable surface. The matching design classification is
`### Single-Implementation Justification`, not a foundation and overlay split with invented
variation axes.

## Behaviour Under Specification

A household declares amounts the route accepts individually. Their sum exceeds
`Number.MAX_VALUE`. Every downstream stage that would have carried a figure now
carries something that is not a figure. The route must say so.

## Requirements

### FR-020-001 — A non-finite value never reaches a display formatter

The path that turns a value record into displayed text refuses a record whose
value is not finite, before any rounding or locale formatting is applied. The
refusal is returned in the same shape every other refusal on that path uses, so
every existing consumer handles it without a new branch.

### FR-020-002 — The refusal names the domain that could not be represented

The refusal identifies the stage or leg whose figure was unrepresentable. A reader
learns which row went unavailable, not merely that something did.

### FR-020-003 — No rule standing is attached to a refused row

A row carrying a refusal carries no rule-status label. Enacted law is never
attached to an amount that does not exist.

### FR-020-004 — The settlement header does not read Settled

When any stage the settlement depends on is refused for this reason, the header
reports the same non-settled state it reports for every other unpriceable
domain, and names what is missing.

### FR-020-005 — The refusal reaches every surface the figure would have reached

Simple, Power, the stage table and the reconciliation each show the refusal
rather than a blank, a zero, or a stale prior amount.

### FR-020-006 — Behaviour below the boundary is unchanged

Every declaration whose sums remain inside the representable range settles
exactly as it does today. This requirement exists so the remedy cannot be
delivered by narrowing what the route accepts.

### FR-020-007 — The boundary is asserted from both sides

Regression coverage pins a declaration just inside the boundary as settling and a
declaration just outside it as refusing, close enough together that the boundary
cannot move without an assertion failing.

## Acceptance Criteria

### AC-020-001

Two income fields at `9e307` each produce a named refusal on every stage that
would have carried a non-finite amount, and the settlement header does not read
`Settled`.

### AC-020-002

Two income fields at `8.9e307` each settle, and every rendered figure is a real
number. No amount, rounding or standing differs from the value observed before
the remedy.

### AC-020-003

No rendered text anywhere on the route contains `∞` or `NaN` for any declaration
in the acceptance set.

### AC-020-004

A declaration that triggers the refusal, persisted and reloaded, refuses again on
reopening rather than settling.

## Supersession Ledger

The ledger is the audit surface for a protection this remedy had to replace
rather than keep. Each delivered replacement carries its `SUP-020-NN` marker
beside it in the source, so the ledger and the code are greppable against each
other.

| Id | Superseded clause | Scope | Marker | Replacement |
|---|---|---|---|---|
| `SUP-020-01` | `scripts/selftest.mjs` `TP-01-05` — `liveCodeNames.length === FEATURE_021_CODES.length + FEATURE_022_CODES.length` and the two-list membership clause | 1 | marker required | A count derived from three named lists, the new member asserted present by name, and a third adversarial limb proving a vocabulary missing it fails |

Both superseded clauses became false the moment the fifteenth vocabulary member
landed, and they became false whatever the implementation did. The derivation is
not widened: the declared member names are still scraped from `rltaxrules.js` and
compared against the live keys, so a member added to one and not the other still
fails.

## Explicitly Out Of Scope

- Changing what the input fields accept. Rejecting large entries at the input is
  a different remedy with a different failure mode, and it would leave the
  formatter defect in place for any other origin of a non-finite value.
- Precision loss above `Number.MAX_SAFE_INTEGER`. That is a separate question and
  this round established nothing about it.
- The exported private file, which was measured and is already clean.

## Grounding

- `bug.md` in this directory — the observed defect and its boundary.
- `design.md` in this directory — the mechanism and the owner decision.
- `scripts/selftest.mjs` assertion `TP-01-05` — the pinned refusal-code
  vocabulary that makes the code choice an owner decision.
- `rltax.js`, `formatForDisplay` — the seam that already refuses on one input and
  not on the other.
