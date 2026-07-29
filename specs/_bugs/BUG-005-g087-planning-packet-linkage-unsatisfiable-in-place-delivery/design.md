# Design: BUG-005 G087 Planning-Packet Linkage Unsatisfiable Under In-Place Delivery

Links: [bug.md](bug.md) | [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Root Cause Analysis

### The gate's assumed model

`G087` (`planning_packet_implementation_linkage_gate`) is a BLOCKING
`businessInvariant`. Its registry description states:

> "Hardened planning packets MUST NOT remain orphaned from implementation. For
> any `state.json` with top-level `status == "specs_hardened"` and
> `planningOnly != true`, `linkedImplementationSpec` MUST point to a real spec
> directory containing `state.json`."

The trigger, verbatim from
`.github/bubbles/scripts/planning-packet-linkage-guard.sh` line 181:

```bash
if [[ "$status" == "specs_hardened" && "$planning_only" != "true" ]]; then
```

The gate therefore encodes a **two-artifact delivery topology**:

```
┌──────────────────────┐   linkedImplementationSpec   ┌──────────────────────┐
│  planning packet     │ ───────────────────────────▶ │ implementation spec  │
│  status: specs_hard. │ ◀─────────────────────────── │ status: done         │
└──────────────────────┘   linkedPlanningPacket       └──────────────────────┘
```

The invariant is coherent **for that topology**. An orphaned hardened packet is
genuinely a smell: plans that harden and then point nowhere are plans that never
ship.

### The repository's actual model

This repository delivers **in place**, in a single artifact:

```
┌────────────────────────────────────────────────────────────┐
│  one spec packet                                           │
│                                                            │
│  workflowMode: product-to-planning   (ceiling specs_hard.) │
│              │                                             │
│              │  graduation — authority: operator-directed  │
│              ▼                                             │
│  workflowMode: full-delivery         (ceiling done)        │
│  ...implements its OWN scopes...                           │
└────────────────────────────────────────────────────────────┘
```

The model claim is not inferred — it is **recorded in the repository's own
state**. Spec 013's `modeTransition` object (commit `602f32db`, authority
`operator-directed`) states:

> "Spec 013 is implemented by its OWN packet; it does not hand off to a separate
> implementation spec, so a product-to-planning classification misclassified it."

and, on convention:

> "specs 001-012 are all workflowMode full-delivery, 003 and 011 reached done
> that way, and a full sweep of all 16 state.json files found ZERO specs carrying
> planningOnly true and ZERO carrying a non-null linkedImplementationSpec, so
> in-spec delivery is this repository's established shape."

That sweep was re-run independently for this bug and **confirmed**: every
`specs/*/state.json` carries `planningOnly: false` and
`linkedImplementationSpec: null`. See
[report.md](report.md#e-b4--repo-wide-remedy-usage).

### The collision

Under in-place delivery there is **no second artifact** to name. G087's two
remedies both require asserting something false:

| Remedy | Mechanical effect | Truth value here |
|---|---|---|
| `linkedImplementationSpec: "<real path>"` | Guard passes | **False** — no such spec exists. Self-linking passes the guard while defeating its stated purpose (013's own record calls this out). |
| `planningOnly: true` + `planningOnlyJustification` | Guard passes | **False** — the scopes name real implementation targets and are intended to be built. |

The gate is therefore **unsatisfiable-without-lying** for this repository's
delivery model. `specs_hardened` is a status the model can enter but cannot
legitimately hold.

### Why this produced two different outcomes

The same root cause produced opposite failure modes depending on whether the
guard was actually consulted at promotion time:

- **Spec 013** — the promotion **stuck**. The certification commit `b525326d`
  recorded `status: specs_hardened` in a state the guard rejects (replay exits
  1). The gate was wired and live at that commit.
- **Spec 016** — the promotion was **refused**. `bubbles.validate` wrote the
  promotion, re-ran the guard, got `failedGateIds [G087]` /
  `blockingCode PLANNING_GATE_FAILED`, and reverted in full.

016's behavior is the correct behavior. 013's is the integrity gap.

### The false-negative trap (record this explicitly)

G087's registry entry says:

> "State-transition-guard.sh invokes this guard as Check 29."

That is **misleading for grep-based investigation**. The invocation is delegated:

```bash
git show b525326d:.github/bubbles/scripts/guards/tail-delegated-gates.sh | grep -c planning-packet-linkage-guard   # 3
git show b525326d:.github/bubbles/scripts/state-transition-guard.sh      | grep -c planning-packet-linkage-guard   # 0
```

An investigator who checks only `state-transition-guard.sh` — the script the
registry names — sees **0** and concludes the gate was not enforced at that
commit. That conclusion is wrong. This trap is recorded so the next
investigator does not repeat it.

### No grandfather clause

`planning-packet-linkage-guard.sh` contains **0** occurrences of `createdAt` or
`grandfather`. Registry body mentions:

| Gate | `createdAt` / `grandfather` mentions | Effect |
|---|---|---|
| **G087** | **0** | Applies retroactively with full blocking force |
| G094 | 1 | Specs with `createdAt` before `2026-05-25` grandfathered until touched |
| G130 | 1 | Specs with `createdAt` absent or before `2026-07-27` are WARN-only, explicitly "so adopting this gate never retroactively blocks already-closed work" |

G130's rationale is precisely the protection G087 lacks.

## Severity Calibration

Deliberately **not overstated**.

**Concern A (spec 013) is LATENT, not active.** Spec 013 graduated at commit
`602f32db` to `full-delivery` / `in_progress`. G087 fires only at
`specs_hardened`. Re-running the guard against 013 at HEAD exits **0**:

```
planning-packet-linkage-guard: PASS Gate G087 (planning_packet_implementation_linkage_gate) - spec=specs/013-market-regime-stack-and-strategy-playbook status=in_progress planningOnly=false
```

Nothing in the repository fails today because of 013. The residue is historical:
a commit exists in which a live blocking gate was passed by a rejecting state.
That matters for audit-trail integrity, not for build health.

**Concern B (spec 016) is ACTIVE.** 016 cannot reach its declared ceiling. It
sits at `not_started` with 0 of 197 DoD boxes checked across 9 scopes, and its
validate run routed `nextRequiredOwner` to `bubbles.analyst` for a linkage
decision that `bubbles.analyst` also cannot make truthfully.

**Systemic reach:** every future `product-to-planning` packet in this repository
hits the identical wall. 016 is not special; it is the first one to reach the
gate honestly.

## Candidate Resolution Directions

**No direction is selected here. This is an owner / framework decision.**
Each is stated with its cost so the decision can be made on evidence.

### D1 — Explicit in-place delivery classification

Introduce a first-class state field (e.g. `deliveryTopology: "in-place"`) that
G087 recognizes as a legitimate third case alongside `planningOnly` and
`linkedImplementationSpec`.

- **Pro:** truthful by construction; preserves G087's orphan-detection value for
  genuine two-spec handoffs.
- **Con:** framework schema change; requires guard amendment upstream; new field
  must be honored by every consumer of `state.json`.

### D2 — Self-referencing `linkedImplementationSpec`

Allow a packet to name itself as its own implementation target.

- **Pro:** no schema change; mechanically minimal.
- **Con:** spec 013's own `modeTransition` record already **refused this as
  untruthful**: "self-linking linkedImplementationSpec to 013 would satisfy the
  guard while defeating its purpose." Adopting it would make G087 pass
  universally and detect nothing. Recorded for completeness, not endorsed.

### D3 — G087 framework amendment

Amend the gate so it does not apply to self-delivered specs, and/or add a
`createdAt` grandfather clause consistent with the G094 / G130 precedent.

- **Pro:** fixes the root cause at its source for every downstream repository;
  aligns G087 with existing gate conventions.
- **Con:** upstream framework change, outside this repository's ownership; wider
  blast radius; needs framework-side validation.

### D4 — Repository convention: packets graduate directly, never occupy `specs_hardened`

Codify that `product-to-planning` is a transient classification in this
repository, and that a packet graduates to `full-delivery` before any promotion
attempt — so `specs_hardened` is never entered.

- **Pro:** no framework change; matches what already happened to 013 and 014;
  purely local and documentable.
- **Con:** removes a real intermediate checkpoint — planning completeness would
  no longer have its own certified terminal state; leaves 013's historical
  commit unaddressed; needs an explicit written convention or it becomes tribal
  knowledge.

### Orthogonal follow-ups (independent of D1–D4)

- **F1 — Fix the registry wiring description** so G087's entry names
  `tail-delegated-gates.sh`, eliminating the false-negative trap (FR-005-004).
- **F2 — Disposition spec 013's historical certification** — decide whether the
  `b525326d` record needs an explicit annotation, or whether the subsequent
  graduation at `602f32db` already discharges it.

## Decision Required

| Question | Owner | Blocking |
|---|---|---|
| Which of D1–D4 (or a combination) is adopted? | Repository owner / framework maintainer | Yes — blocks 016 and every future planning packet |
| Is G087's un-grandfathered retroactivity intentional? | Framework maintainer | No — informs D3 |
| Does 013's historical certification need explicit disposition? | Repository owner | No — latent |

## Explicitly Not Done In This Packet

- No guard, gate registry, or framework-managed file was read-modified.
- No `specs/013-*` or `specs/016-*` file was modified.
- No `.html`, `.js`, or `.mjs` file was created or modified.
- No resolution direction was implemented or chosen.
