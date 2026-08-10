# Spec: BUG-005 G087 Planning-Packet Linkage Unsatisfiable Under In-Place Delivery

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Purpose

Define the **expected behavior** that Gate G087 and this repository's delivery
model should jointly satisfy, so that the gap recorded in [bug.md](bug.md) can
be evaluated against a stated contract rather than against intuition.

This spec describes **what correct looks like**. It does not select a
resolution; candidate directions are enumerated in
[design.md](design.md#candidate-resolution-directions) and the choice is an
owner / framework decision.

## Scope Of This Artifact

**This is a documentation-only bug packet.** It records a verified
cross-cutting finding. It changes no product behavior, no gate, no guard, and no
other spec.

## Problem Statement

Gate G087 (`planning_packet_implementation_linkage_gate`) is a BLOCKING
`businessInvariant`. It activates when a `state.json` has:

- top-level `status == "specs_hardened"`, **and**
- `planningOnly != true`

and then requires `linkedImplementationSpec` to name a real spec directory
containing a `state.json`.

That contract presumes a **two-spec** delivery shape: a planning packet hardens,
then hands off to a separate implementation spec. This repository uses a
**one-spec, in-place** shape: a packet plans, graduates its own `workflowMode`
from `product-to-planning` to `full-delivery`, and implements its own scopes.

With no second spec in existence, an honest packet has no valid value for
`linkedImplementationSpec`, and `planningOnly: true` would misstate intent.
`specs_hardened` therefore has no truthful satisfaction path.

## Domain Capability Model

### Capability

**Truthful terminal-disposition declaration for a hardened planning packet.**

Gate G087 fires when a spec reaches `status == "specs_hardened"` and demands
that the packet declare, truthfully, how its scopes reach implementation. The
capability is not "pass G087" — it is *stating where delivery happens* in a form
a machine can check. G087 is the enforcement surface; the disposition is the
domain object.

A disposition model is only as good as its coverage. When a delivery shape the
repository actually practises has no matching disposition, packets in that shape
cannot describe themselves, and the gate stops measuring truth and starts
selecting which false statement gets made. That is the failure recorded in
[bug.md](bug.md) and restated as FR-005-001 and FR-005-002 below.

### Domain Primitives

| Primitive | Purpose | Lifecycle |
|---|---|---|
| Planning packet | The spec whose scopes are being dispositioned | authored → `specs_hardened` → graduates or hands off |
| Disposition | The declared answer to "where do these scopes get built?" | absent → declared → re-validated at every promotion |
| Delivery target | The artifact that actually implements the scopes | none / another packet / this packet |
| Justification | Evidence attached to a disposition that names no target | required non-empty, else the disposition is refused |
| Back-link | `linkedPlanningPacket` on the implementation spec | written when that target reaches `done`; validated in reverse |

### Relationships

- A **planning packet** carries exactly one **disposition**.
- A **disposition** identifies exactly one **delivery target**, which may be *none*.
- A disposition naming **no external target** must carry a **justification**. A
  disposition naming **another packet** must instead survive live cross-reference
  validation, and once that target is `done` it must carry a **back-link**.
- Two dispositions may not be asserted at once. Each names a different delivery
  target, so holding two asserts two contradictory topologies, at least one of
  which is false.

### Business Policies

Every concrete disposition must obey all of these.

- **P1 — Declarations are checkable, not statements of good faith.** A
  disposition either names a target that can be verified to exist, or carries a
  justification that is present and non-empty.
- **P2 — Absence is a defined value, not an error.** A packet authored before a
  disposition field existed evaluates exactly as it did before that field
  existed.
- **P3 — An unrecognised value is refused, never coerced to absent.** A typo must
  fail loudly rather than silently inherit the default and buy a pass.
- **P4 — Coverage is total.** Every delivery shape the repository practises has a
  disposition that describes it truthfully. A shape with no truthful disposition
  is a defect in the model, not in the packet.
- **P5 — Mutual exclusivity is mechanical, not conventional.** Contradictory
  dispositions are refused by the guard, not left to author discipline.

## Requirements

### FR-005-001 — A self-delivered packet MUST have a truthful terminal path

A packet whose scopes will be implemented by that same packet MUST be able to
reach its declared status ceiling without asserting a fact that is false.

**Acceptance:** for every spec in `specs/` whose scopes name real
implementation targets in that spec's own design boundary, there exists a
sequence of state values that (a) passes `planning-packet-linkage-guard.sh` and
(b) contains no false claim about linkage or planning-only status.

### FR-005-002 — G087's two remedies MUST NOT be mutually exhaustive-and-false

At least one of G087's escape hatches must be truthfully available, **or** the
gate must not apply to self-delivered packets, **or** the repository must
document that self-delivered packets never occupy `specs_hardened`.

**Acceptance:** no spec is placed in a position where the only two mechanical
paths forward are both untruthful.

### FR-005-003 — A live BLOCKING gate MUST NOT be passable by a rejecting state

If a gate is wired and live at commit time, no certification recorded at that
commit may leave the spec in a state the gate rejects.

**Acceptance:** replaying the guard against any historically certified spec, at
the commit that certified it, exits 0 — or the discrepancy is explicitly
recorded and dispositioned.

**Currently violated by:** spec 013 at commit `b525326d` (see
[bug.md](bug.md#r1--spec-013-was-certified-in-a-state-g087-rejects)).

### FR-005-004 — Gate wiring MUST be discoverable from its registry description

G087's registry entry states it is invoked by `state-transition-guard.sh` as
"Check 29". The actual invocation is in
`.github/bubbles/scripts/guards/tail-delegated-gates.sh`. Grepping the
documented location returns 0 hits and produces a **false negative**.

**Acceptance:** an investigator following the registry description to the named
script finds the invocation there, or the description names the delegating
script.

### FR-005-005 — Retroactive gate application MUST be a deliberate choice

G094 and G130 each carry an explicit `createdAt` cutoff so that adopting them
never retroactively blocks already-closed work. G087 carries none.

**Acceptance:** G087's retroactive, un-grandfathered application is either
confirmed as intentional or aligned with the G094/G130 precedent.

## Non-Functional Requirements

### NFR-005-001 — Evidence reproducibility

Every claim in this packet MUST be re-runnable from the commands recorded in
[bug.md](bug.md#reproduction-steps) and
[report.md](report.md#test-evidence), against a clean checkout, without
privileged access.

### NFR-005-002 — Non-destructive documentation

Documenting this finding MUST NOT modify `specs/013-*`, `specs/016-*`, any
guard, any gate registry entry, or any `.html` / `.js` / `.mjs` source file.

### NFR-005-003 — Truthful status

This packet's `state.json` MUST carry a non-terminal status while the
resolution decision is unmade, MUST NOT assert any certification, and MUST NOT
carry a checked DoD box.

## Acceptance Criteria

| ID | Criterion | Status |
|---|---|---|
| AC-005-001 | G087 violation reproduces at `b525326d` with exit 1 and the exact diagnostic | Verified — see [report.md](report.md#test-evidence) |
| AC-005-002 | G087 was wired and live at `b525326d` via `tail-delegated-gates.sh` (count 3) while `state-transition-guard.sh` shows 0 | Verified |
| AC-005-003 | G087 carries no grandfather clause; G094 and G130 do | Verified |
| AC-005-004 | Spec 013 passes G087 today (risk is latent, not active) | Verified |
| AC-005-005 | Spec 016 is blocked with `failedGateIds [G087]` and its promotion was fully reverted | Verified |
| AC-005-006 | No spec repo-wide uses either G087 remedy | Verified |
| AC-005-007 | A truthful resolution direction is selected by the owner | **Not met — open decision** |
| AC-005-008 | The selected direction is implemented and 016 can reach its ceiling truthfully | **Not met — out of scope here** |

AC-005-007 and AC-005-008 are deliberately unmet. This packet documents; it does
not resolve.

## Business Scenarios

```gherkin
Feature: Truthful terminal status for a self-delivered planning packet

  Scenario: A self-delivered packet reaches its planning ceiling honestly
    Given a spec whose scopes name implementation targets inside its own boundary
    And no separate implementation spec exists for it
    When the packet completes planning and requests promotion to specs_hardened
    Then the promotion succeeds without setting planningOnly to true
    And it succeeds without naming a linkedImplementationSpec that does not exist

  Scenario: Spec 016 is blocked with no truthful escape
    Given specs/016-auction-gamma-playbook at status not_started
    And its 9 scopes describe implementation it intends to perform itself
    When bubbles.validate promotes it to specs_hardened and re-runs the guard
    Then the guard fails with failedGateIds [G087]
    And the promotion is reverted in full
    And neither available remedy can be applied without making a false claim

  Scenario: A live blocking gate is not passed by a rejecting state
    Given gate G087 is wired and live at a commit
    When a spec is certified to specs_hardened at that commit
    Then replaying the guard at that commit exits 0

  Scenario: Gate wiring is discoverable from its registry description
    Given a gate registry entry naming the script that invokes the gate
    When an investigator greps that named script for the guard invocation
    Then the invocation is found there rather than in an undocumented delegate
```

## Out Of Scope

- Selecting or implementing any resolution direction.
- Any edit to `specs/013-*` or `specs/016-*`.
- Any edit to a guard script, the gate registry, or framework-managed files.
- Any product source change.

## Downstream Handoffs

The next required owner is the **repository owner / framework maintainer**, who
must select among the candidate directions in
[design.md](design.md#candidate-resolution-directions). Only after that choice
can an implementation packet be opened.
