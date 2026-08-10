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

## Owner Ruling

Recorded after the analysis above.
[Candidate Resolution Directions](#candidate-resolution-directions) is left
exactly as written — this section records which direction was adopted, why the
others were refused, and what changed as a result. It supersedes the "No
resolution direction was implemented or chosen" line in
[Explicitly Not Done In This Packet](#explicitly-not-done-in-this-packet): a
direction **is** now chosen, and it was implemented **upstream in the Bubbles
framework**, not in this repository.

### Ruling 1 — D1 adopted, implemented at the framework source

**Adopted: D1 (explicit in-place delivery classification), landed upstream.**

The premise is the collision already established above. G087 offered exactly
two dispositions, and for a repository that plans and delivers in the **same**
packet, **both are false statements**. A gate whose only exits are lies is not
enforcing an invariant; it is selecting which lie gets told.

Why the other directions were refused:

| Direction | Refused because |
|---|---|
| **D2** — self-referencing `linkedImplementationSpec` | Spec 013's own `modeTransition` record already refused it as untruthful. Adopting it would **institutionalise a known lie**, leaving G087 passing universally while detecting nothing. |
| **D4** — never occupy `specs_hardened` | **Destroys a real checkpoint.** Planning completeness would lose its own certified terminal state, and the rule would degrade from a mechanical gate into **tribal knowledge a new contributor cannot discover**. |
| **D3** — separate framework amendment | Not refused on merit — **subsumed**. Implementing D1 upstream captures D3's benefit (root-cause fix for every downstream repository) without a second, separate amendment. |

D1 was adopted because it adds a **third truthful disposition** rather than an
escape hatch, and because it was implemented **upstream rather than patched
locally**. Every downstream repository inherits the fix instead of each one
inventing its own workaround.

#### The concrete change

G087 now accepts a third satisfier:

| Field | Accepted value | Meaning |
|---|---|---|
| `deliveryTopology` | `"in-place"` | The packet implements its own scopes; there is no second artifact to name. |
| `deliveryTopologyJustification` | non-empty string | Required whenever `deliveryTopology` is `"in-place"`. |

Three properties make this a narrowing, not a loophole:

- **Absent means `"two-spec"`.** Packets predating the field evaluate **exactly
  as before** — no silent behavior change to any existing state.
- **An unrecognised value is REFUSED**, not treated as absent. A typo
  (`"inplace"`, `"in place"`) cannot buy a pass.
- **`in-place` is mutually exclusive** with both `planningOnly: true` and a
  non-empty `linkedImplementationSpec`. Each of those asserts something the
  in-place claim contradicts, so holding two at once is itself a refusal.

#### Why this is not a weakening of G087

A satisfier tested only on the packets it is meant to admit proves nothing. The
upstream change therefore carries an **adversarial selftest case**: a spec with
**no** `deliveryTopology` and **no** linkage is asserted to be **still
REFUSED**. Without that case the change would read as "add a field that turns
the gate off". With it, G087's orphan-detection force over genuine two-spec
handoffs is demonstrably intact.

#### Provenance

| Upstream commit | Change |
|---|---|
| `675c4cf` | G087 in-place satisfier (`deliveryTopology` / `deliveryTopologyJustification`) |
| `a76bcb5` | Gate wiring-description accuracy (see the secondary finding below) |

Both were landed in a local `<framework>` checkout — no local patch, no fork, no
repository-specific guard override in `<repo>`. **Amended:** this line
previously read that downstream had already picked both up through the normal
framework install refresh. That claim was false when written; see
[Correction — downstream reachability](#correction--downstream-reachability).

#### Consequence for spec 016

Spec 016 is `status: not_started` under workflow mode `product-to-planning`,
whose status ceiling is `specs_hardened`. Before this fix it **could not reach
that ceiling truthfully**: the only mechanically available route was to claim
`planningOnly: true` while fully intending to build the scopes it names.

It can now declare `deliveryTopology: "in-place"` with a justification and reach
`specs_hardened` **honestly**. The active concern recorded under
[Severity Calibration](#severity-calibration) is therefore resolved at the
framework layer.

**This packet makes no change to spec 016.** The declaration is 016's own to
write when it is next worked.

### Ruling 2 — Spec 013's historical certification is discharged; annotate, do not rewrite

**Ruled: discharged by the `602f32db` graduation. No rewrite.**

- **The risk is latent, not active.** G087 fires only when top-level
  `status == "specs_hardened"`. Spec 013 is now `status: in_progress` under
  `full-delivery`, so the gate does not apply and the guard exits **0** against
  it at HEAD — as already evidenced under
  [Severity Calibration](#severity-calibration).
- **Rewriting the record would be worse than the residue.** Editing the
  `b525326d` certification to make a past state look compliant would destroy
  audit evidence in order to improve the appearance of the audit trail. That
  inverts the purpose of keeping one.

**Disposition:** leave the historical record intact. This ruling is the
annotation — the `b525326d` certification was reviewed and ruled **discharged**
by the subsequent graduation. This closes follow-up **F2**.

**`specs/013-*` is NOT modified by this packet.**

### Secondary finding — the wiring-description defect is 16 gates wide, not one

The registry wiring inaccuracy this packet reported for G087 (follow-up **F1**,
FR-005-004) was investigated upstream and found to be **systemic**:
`state-transition-guard.sh` contains **no literal reference** to any of the
affected guards. It sources helper files that hold the real invocations.

| Delegating helper (framework-source path) | Gates |
|---|---|
| `bubbles/scripts/guards/tail-delegated-gates.sh` | 13 |
| `bubbles/scripts/guards/tail-convergence-gates.sh` | 3 |
| **Total** | **16** |

All 16 registry descriptions now name the file the invocation **literally lives
in**, so the false-negative trap recorded above cannot be re-sprung against any
of them. Downstream installs those helpers under
`.github/bubbles/scripts/guards/`; the paths above are the framework-source
layout where the fix was made.

G087 was not a one-off description error — it was the instance that happened to
be investigated first.

### Correction — downstream reachability

The [Provenance](#provenance) claim that downstream had picked both commits up
through the normal framework install refresh was **false when written**. It has
been amended in place; this subsection records what was believed, what was
measured, and what is still outstanding.

**Measured state of `planning-packet-linkage-guard.sh`:**

| Copy | Occurrences of `deliveryTopology` |
|---|---|
| `<repo>/.github/bubbles/scripts/` — working tree | **0** |
| `<repo>/.github/bubbles/scripts/` — at HEAD | **0** |
| `<framework>` source — local checkout | **8** |
| `<framework>` source — `origin/main` | **0** |

The fix itself is **real and proven upstream**: the guard selftest passes
**43/43**, including the S12 non-vacuity case, and the persistent regression
passes **3/3**. What was false is only the reachability claim.

**How it was reverted.** The downstream install genuinely carried the fix
twice, at `7b0bf6e8` and `ecded2ad` (originally `7fac02ac` / `fc890ad7`, before
a rebase re-parented them). A later commit, `f2c6322f`
*"chore(bubbles): refresh framework install to 7.25.0 @ 5d9ce44"*, refreshed the
install from a framework state that does **not** contain the fix, and reverted
it.

**Root cause.** Commits `675c4cf` and `a76bcb5` are committed in a local
`<framework>` checkout but are **not in `origin/main`** —
`git merge-base --is-ancestor` reports both as non-ancestors, and `origin/main`'s
copy of the guard has 0 occurrences of `deliveryTopology`. **Any downstream
refresh sourced from the remote therefore reverts them.** This is not a defect
in the refresh: the refresh faithfully reproduced the remote, and the remote
does not have the fix.

Pushing them is currently blocked by the framework repository's pre-push hook,
which refuses while concurrent validation runs are active — *"Concurrent runs
corrupt each other's shared scratch fixtures and produce false failures. Wait
for the other run to finish, then re-run. There is no bypass."* That is a
**correct refusal, not a defect**; the fix is queued behind a real
serialisation constraint, not behind a broken gate.

**Outstanding operator action:** push `675c4cf` and `a76bcb5` to `<framework>`
`origin/main` once concurrent validation runs are clear, then run a subsequent
framework install refresh in `<repo>`. The fix becomes live here at that point,
and not before.

**Honest consequence until then.** This packet's `deliveryTopology: "in-place"`
declaration is accepted by the **currently installed** guard only because that
guard **predates the field and treats it as absent** — and an absent
`deliveryTopology` resolves to `two-spec` (policy **P2**). The declaration is
therefore **not yet exercising the new satisfier**; it is passing through a code
path that has never seen the field. Stated plainly: the enforcement described
under [Ruling 1](#ruling-1--d1-adopted-implemented-at-the-framework-source) is
proven upstream and **is not in force in this repository right now**.

The same gap applies to the 16-gate wiring accuracy recorded under
[Secondary finding](#secondary-finding--the-wiring-description-defect-is-16-gates-wide-not-one):
it rides on `a76bcb5` and is subject to the identical reachability condition.

### Ruling 3 — this packet is planning-only; `in-place` was a mis-classification

**Adopted: `planningOnly: true` with justification. `deliveryTopology` removed.**

Two facts forced this correction, and they are independent of each other.

**Fact 1 — the upstream amendment is gone.** `a76bcb5` no longer exists. An
exhaustive search of the framework source repository — every commit reachable
from every branch, the full 446-entry reflog, and every dangling object
recovered by `git fsck --lost-found`, 1766 distinct commits in total — found no
commit whose `state-transition-guard.sh` contains the `deliveryTopology`
satisfier. The topic branch that carried it is absent from the branch list. The
downstream install was independently refreshed to 7.25.0 at `5d9ce44` by commit
`f2c6322f`, which also does not contain it. The reachability condition recorded
immediately above did not merely remain unmet; the artifact it was waiting on
ceased to exist.

**Fact 2 — the declaration contradicted this packet's own record.** This is the
load-bearing point, and it holds *even if* `a76bcb5` were restored tomorrow.
[Ruling 1](#ruling-1--d1-adopted-implemented-at-the-framework-source) states the
remedy was implemented **upstream in the Bubbles framework, not in this
repository**. `report.md` § *What this run changed* states that only `state.json`
and `report.md` were written, and that everything under `.github/bubbles/**` was
**read only**. Scope 2's DoD asserts the same. A packet whose remedy lands in a
different repository has not delivered **in place** — upstream delivery is the
precise negation of in-place delivery. The packet was therefore asserting a
topology its own evidence refutes.

So `deliveryTopology: "in-place"` was wrong here on the merits, not merely
unenforced. It is removed rather than left as a dormant false claim, because a
field that is unreadable by the installed guard is exactly the place where an
untrue value survives unchallenged — the failure mode this bug exists to name.

**Why `planningOnly: true` is truthful.** G087 exists to stop a hardened
planning packet from being orphaned from its implementation. This packet's three
deliverables are a governance decision (Scope 1), an upstream routing of a
framework defect (Scope 2), and a historical disposition (Scope 3). None of them
produces implementable behavior in this repository, and there is consequently no
research-lab spec that `linkedImplementationSpec` could name without inventing
one. That is the condition `planningOnly` denotes, and the justification field
records it rather than leaving the exemption bare.

**What this does not do.** It does not retract
[Ruling 1](#ruling-1--d1-adopted-implemented-at-the-framework-source). The
collision it identifies is real and still unfixed for genuine in-place packets —
spec 016 remains the motivating case, and D2 and D4 remain refused for the
reasons tabled there. D1 must be re-landed upstream; that work is now
**unstarted**, not merely unpropagated. Ruling 3 corrects only this packet's
classification of **itself**, which was never an in-place case to begin with.

## Capability Foundation

The capability modelled in [spec.md](spec.md#domain-capability-model) —
truthful terminal-disposition declaration — is realised by
`planning-packet-linkage-guard.sh` (Gate G087). The foundation is the guard's
**disposition-resolution step**: the part that decides *which* disposition a
packet is asserting and *what evidence* that disposition owes, before any
implementation-specific check runs.

The foundation is **upstream framework code**, not repository code. Nothing in
this packet implements it; see
[Single-Implementation Justification](#single-implementation-justification).

### Foundation Contract

| Contract | Responsibility | Consumers |
|---|---|---|
| Trigger predicate | Decide whether the gate applies at all: `status == "specs_hardened"` and `planningOnly != true` | Every promotion attempt on a planning packet |
| Disposition resolution | Read the declared disposition, resolve absence to `two-spec`, refuse an unrecognised value | All three implementations |
| Evidence demand | Require what the resolved disposition owes — a non-empty justification, or a target that resolves on disk | All three implementations |
| Exclusivity check | Refuse any state that asserts two dispositions at once | All three implementations |
| Verdict | Emit a pass line naming status and disposition, or a violation naming the packet and the unmet obligation | `state-transition-guard.sh`, via `guards/tail-delegated-gates.sh` |

### Extension Points

- **Disposition value** — each implementation contributes one recognised value,
  or the absence that resolves to one. Nothing outside that set is recognised.
- **Evidence rule** — each implementation declares what it owes: a non-empty
  justification field, or an external target that must resolve on disk.
- **Exclusion set** — each implementation names the dispositions it may not be
  held together with.

### Foundation-Owned Behavior

Shared by all three implementations, and deliberately not restated by any of
them:

- Gate applicability — the `specs_hardened` trigger.
- Resolution of an absent disposition to `two-spec` (policy **P2**), which is
  what makes the third implementation additive rather than breaking.
- Refusal of an unrecognised value rather than coercion to absent (policy **P3**).
- Mutual-exclusivity refusal (policy **P5**).
- A single diagnostic shape, so all three failure modes are read the same way.

## Concrete Implementations

### CI-1 — Planning-only: delivery happens nowhere

- **Declaration:** `planningOnly: true` plus a non-empty `planningOnlyJustification`.
- **Foundation contract used:** evidence demand (justification), exclusivity.
- **Implementation-specific behavior:** asserts the scopes are never implemented,
  anywhere. There is no target to verify, so the justification carries the entire
  evidentiary weight and an empty or null one is a refusal.
- **Excluded with:** CI-2, CI-3.

### CI-2 — Two-spec linkage: delivery happens in another named packet

- **Declaration:** `linkedImplementationSpec: "<spec-dir>"`. This is also the
  disposition that an **absent** `deliveryTopology` resolves to.
- **Foundation contract used:** evidence demand (live cross-reference), exclusivity.
- **Implementation-specific behavior:** the named directory must really exist and
  contain a `state.json`. Once that target reaches `done`, its
  `linkedPlanningPacket` must point back at this packet, closing the reference in
  both directions. This is the only implementation whose evidence is validated
  against the filesystem rather than read as prose.
- **Excluded with:** CI-1, CI-3.

### CI-3 — In-place delivery: delivery happens in this packet

- **Declaration:** `deliveryTopology: "in-place"` plus a non-empty
  `deliveryTopologyJustification`.
- **Foundation contract used:** evidence demand (justification), exclusivity.
- **Implementation-specific behavior:** the packet implements its own scopes, so
  there is no external target to name and none is demanded. This is the satisfier
  whose absence this bug reported, added upstream at commit `675c4cf`.
- **Excluded with:** CI-1 — one says delivered here, the other says delivered
  nowhere; and CI-2 — which names an external target an in-place packet does not
  have. Each pair asserts two contradictory topologies, one of which must be false.

### Variation Axes

| Axis | Options | Owned By Foundation? |
|---|---|---|
| Where delivery happens | nowhere (CI-1) / another packet (CI-2) / this packet (CI-3) | No — this is the axis that distinguishes the implementations |
| Evidence the disposition demands | a justification string (CI-1, CI-3) versus a live cross-reference validated for existence and back-linkage (CI-2) | No |
| How absence is interpreted | an absent `deliveryTopology` means `two-spec`, so every packet authored before the field existed evaluates exactly as it did before | Yes — policy **P2** |
| How an unrecognised value is treated | refused outright, never silently accepted as absent, so a typo cannot buy a pass | Yes — policy **P3** |
| Mutual exclusivity | `in-place` may combine with neither `planningOnly: true` nor a non-empty `linkedImplementationSpec` | Yes — policy **P5** |

## Why The Foundation Needed A Third Implementation

Before CI-3 existed the model's coverage was incomplete, and incompleteness in a
disposition model is not merely a gap — it is a lie generator. A repository that
plans and delivers in the **same** packet had no truthful option, and the
observed workaround was to claim `planningOnly: true` on a spec that fully
intended to ship. That is precisely the false declaration the gate exists to
prevent, so the gate was manufacturing the defect it was installed to catch.

**A disposition model whose only available exits are lies does not gate
anything; it just launders one.**

CI-3 is therefore a completion of the model rather than a relaxation of it. It
adds a way to be accurate while CI-1 and CI-2 keep every check they had, and the
adversarial case recorded under
[Why this is not a weakening of G087](#why-this-is-not-a-weakening-of-g087) is
what holds that line: a packet with no disposition and no linkage is still
refused. The fix was made **at the framework source** so every downstream
repository inherits it rather than each inventing its own escape. This packet is
the first consumer of the satisfier its own finding caused to exist.

### Single-Implementation Justification

**This packet builds no implementation of the capability above, and therefore
plans no foundation scope of its own.**

The foundation and all three implementations are upstream framework code in
`bubbles/scripts/planning-packet-linkage-guard.sh` (commits `675c4cf` and
`a76bcb5`), reached through the framework rather than patched locally — see
[Explicitly Not Done In This Packet](#explicitly-not-done-in-this-packet). The
sections above document the capability this packet **reported against and now
consumes**; they are not a build plan for it.

This packet's own three scopes are an owner decision, an upstream routing, and a
historical disposition. None of them constructs a shared surface, so there is
nothing here for a `foundation:true` scope to own and nothing for a later scope
to depend on. Tagging one of them as a capability foundation would assert that
this packet builds the disposition model, which is false — the very class of
false declaration this bug was raised to eliminate.

Per the decision tree in the `bubbles-capability-foundation-design` skill, a bug
packet whose capability-trigger keywords are incidental takes a
single-implementation justification rather than a foundation-and-overlay scope
split. That is the disposition recorded here.
