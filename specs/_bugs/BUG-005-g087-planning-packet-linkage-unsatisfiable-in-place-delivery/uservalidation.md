# User Validation: BUG-005 G087 Planning-Packet Linkage Unsatisfiable Under In-Place Delivery

Links: [bug.md](bug.md) | [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Checklist

- [x] Acceptance question recorded: a self-delivered packet can reach its declared status ceiling without asserting anything false.
- [x] Acceptance question recorded: G087's two remedies are not simultaneously exhaustive and untruthful for a given packet.
- [x] Acceptance question recorded: a wired, live BLOCKING gate is never passed by a state that same gate rejects on replay.
- [x] Acceptance question recorded: a gate's registry description names the script where its invocation actually lives, so grep-based investigation cannot produce a false negative.
- [x] Acceptance question recorded: G087's un-grandfathered retroactive application is either intentional or aligned with the G094 / G130 `createdAt` precedent.
- [x] Acceptance question recorded: spec 016 has a truthful path to `specs_hardened`, or the repository documents that self-delivered packets never occupy that status.
- [x] Acceptance question recorded: spec 013's historical certification at `b525326d` is either annotated or explicitly ruled discharged by the `602f32db` graduation.

Checked items mean the acceptance questions are **present in the packet**. They
do **not** claim that the repository or the framework currently satisfies them,
and they are **not** DoD boxes. Every DoD box in
[scopes.md](scopes.md) is unchecked. Runtime and decision evidence must be
recorded in [report.md](report.md) by the owning phases once a resolution
direction is selected.

## Owner Decision Required

This packet is **blocked on a decision that no agent may make**. The owner must
select among the candidate directions in
[design.md](design.md#candidate-resolution-directions):

| Direction | One-line summary |
|---|---|
| **D1** | Add an explicit in-place delivery classification that G087 recognizes |
| **D2** | Allow a self-referencing `linkedImplementationSpec` — *recorded, but already refused as untruthful by spec 013's own record* |
| **D3** | Amend G087 upstream so it does not apply to self-delivered specs, and/or add a `createdAt` grandfather clause |
| **D4** | Adopt a repository convention that packets graduate directly and never occupy `specs_hardened` |

Orthogonal follow-ups **F1** (fix the registry wiring description) and **F2**
(disposition spec 013's historical certification) can proceed independently of
that choice.

## User Journey

1. Author a planning packet under `workflowMode: product-to-planning`, with
   scopes that name implementation targets inside the packet's own boundary.
2. Complete planning and request promotion to the `specs_hardened` ceiling.
3. Observe that G087 activates only at that moment — it is invisible at
   `not_started`, so the block cannot be foreseen.
4. Observe that both offered remedies would require a false statement: no
   separate implementation spec exists to name, and the scopes are intended to
   be built so `planningOnly: true` is untrue.
5. Confirm the packet cannot reach its declared ceiling honestly, and that this
   applies to every future planning packet in this repository, not just spec 016.
