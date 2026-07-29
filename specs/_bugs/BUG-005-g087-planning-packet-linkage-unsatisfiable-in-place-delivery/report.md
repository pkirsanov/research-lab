# Report: BUG-005 G087 Planning-Packet Linkage Unsatisfiable Under In-Place Delivery

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

### Summary

This run **documented** a verified cross-cutting finding. It fixed nothing.

Gate G087 (`planning_packet_implementation_linkage_gate`) has no truthful
satisfaction path under this repository's in-place delivery model. Spec 013 was
certified past the gate while it was wired and live (latent today), and spec 016
is blocked by it right now with neither remedy available truthfully.

All evidence below was produced by executing commands in this session against
`/home/redacted/research-lab` at HEAD
`3605cf42ca84b1a7301453006010f363b55042d1`. Two claims in the originally
reported framing were found **inaccurate** and are corrected in
[bug.md](bug.md#corrections-to-the-originally-reported-framing); neither
correction changes the conclusion.

**Run date:** 2026-07-29T19:26:27Z

### Completion Statement

**This packet is NOT complete and asserts no completion.**

- Status is `blocked`. The blocker is an owner / framework decision among the
  candidate directions in
  [design.md](design.md#candidate-resolution-directions).
- **Zero** DoD boxes are checked across all three scopes.
- **No** certification field asserts anything: `certifiedAt` is `null`,
  `certification.completedScopes` is empty, `certification.scopeProgress` is
  empty, and `certification.status` mirrors the non-terminal top-level status.
- No resolution direction was selected or implemented.
- No `.html`, `.js`, or `.mjs` file was created or modified.
- `specs/013-*` and `specs/016-*` were read only, never written.
- No file under `.github/bubbles/**` was patched.
- Files owned by the concurrent BUG-004 packet were not touched, reverted,
  stashed, or committed.

### Test Evidence

All blocks below are raw terminal output captured in this session.

#### E-A1 — Certifying commit identity

**Claim Source:** `executed`

```
redacted@redacted-host:~/research-lab$ git --no-pager show -s --format='%H%n%ci%n%s' b525326d
########## E-A1: commit b525326d identity ##########
b525326dfcae879c6db435c038bc8d238e4214c8
2026-07-28 22:56:21 +0000
spec(013): CERTIFIED at specs_hardened ceiling
```

#### E-A2 — Spec 013 state at the certifying commit

**Claim Source:** `executed`

```
########## E-A2: state.json AT b525326d ##########
{
  "status": "specs_hardened",
  "workflowMode": "product-to-planning",
  "planningOnly": false,
  "linkedImplementationSpec": null,
  "planningOnlyJustification": null
}
```

#### E-A2b — Key presence (CORRECTION: keys present with falsy values, not absent)

**Claim Source:** `executed`

```
########## E-A2b: key PRESENCE (has) at b525326d — top level ##########
has(planningOnly)                = true
has(linkedImplementationSpec)    = true
has(planningOnlyJustification)   = true

########## any occurrence ANYWHERE in the doc (paths) ##########
  (no such path anywhere in the document)

########## raw grep of the file at that commit ##########
7:  "linkedImplementationSpec": null,
9:  "planningOnly": false,
10:  "planningOnlyJustification": null,
```

**Interpretation** — *Claim Source: `interpreted`.* The originally reported
framing said these fields were **absent**. They are **present with falsy
values**. The `jq 'paths(scalars)'` probe returned nothing because `paths(f)`
drops paths whose filter output is falsy, and both `null` and `false` are falsy
— so that probe is unreliable here and the raw `grep` is authoritative. G087's
condition is "missing **or empty**", which matches `null` identically, so the
violation and the conclusion are unchanged.

#### E-A3 — G087 wiring at b525326d (the false-negative trap)

**Claim Source:** `executed`

```
########## E-A3: G087 wiring AT b525326d ##########
tail-delegated-gates.sh  planning-packet-linkage-guard count = 3
state-transition-guard.sh planning-packet-linkage-guard count = 0   <-- FALSE-NEGATIVE TRAP
```

Commands:

```bash
git show b525326d:.github/bubbles/scripts/guards/tail-delegated-gates.sh | grep -c planning-packet-linkage-guard
git show b525326d:.github/bubbles/scripts/state-transition-guard.sh      | grep -c planning-packet-linkage-guard
```

**Interpretation** — *Claim Source: `interpreted`.* The gate registry describes
G087 as invoked by `state-transition-guard.sh` as "Check 29", but that script
contains **0** references. Checking only the documented script yields a **false
negative**: an investigator would wrongly conclude G087 was not enforced at that
commit. The gate **was** live, via `tail-delegated-gates.sh`.

#### E-A4 — Reproduction: G087 violation at the certifying commit

**Claim Source:** `executed`

```
########## E-A4: REPRODUCTION (exact commands from the finding) ##########
extracted to: /tmp/tmp.xXxTodagxR
--- guard output ---
G087 planning_packet_implementation_linkage_gate violation: specs/013-market-regime-stack-and-strategy-playbook has status specs_hardened and planningOnly is not true, but linkedImplementationSpec is missing or empty
G087 planning_packet_implementation_linkage_gate blocked: findings=1 spec=specs/013-market-regime-stack-and-strategy-playbook
GUARD_EXIT=1
```

Commands:

```bash
T=$(mktemp -d)
git archive b525326d specs/013-market-regime-stack-and-strategy-playbook | tar -x -C "$T"
bash .github/bubbles/scripts/planning-packet-linkage-guard.sh "$T/specs/013-market-regime-stack-and-strategy-playbook"
rm -rf "$T"
```

#### E-A5 — G087 has no grandfather clause

**Claim Source:** `executed`

```
########## E-A5: G087 grandfather/createdAt clause? (compare with G130) ##########
planning-packet-linkage-guard.sh  createdAt/grandfather hits = 0
```

Registry-body mention counts:

```
########## E-G2: grandfather/createdAt presence — G087 vs G130 vs G094 ##########
  G087 : createdAt/grandfather mentions = 0
  G094 : createdAt/grandfather mentions = 1
  G130 : createdAt/grandfather mentions = 1
```

G130's clause, verbatim from the registry:

```
########## E-G1: G130 grandfather clause (the contrast the finding cites) ##########
createdAt` is absent or earlier than 2026-07-27 are WARN-only so adopting this gate never retroactively blocks already-closed work; only specs created on/after the cutof
```

#### E-A6 — The risk is LATENT, not active

**Claim Source:** `executed`

```
########## E-A6: 013 TODAY (is the risk latent?) ##########
{
  "status": "in_progress",
  "workflowMode": "full-delivery",
  "planningOnly": false,
  "linkedImplementationSpec": null
}
--- guard against 013 as it stands TODAY ---
planning-packet-linkage-guard: PASS Gate G087 (planning_packet_implementation_linkage_gate) - spec=specs/013-market-regime-stack-and-strategy-playbook status=in_progress planningOnly=false
GUARD_013_TODAY_EXIT=0

########## E-A7: graduation commit 602f32db ##########
602f32dba3b4d3eff0b16850cfefa36f1ed36ba3
2026-07-29 15:08:15 +0000
chore(specs): record mode graduation for 013 and 014
```

#### E-B1 — Spec 016 today

**Claim Source:** `executed`

```
########## E-B1: 016 TODAY ##########
{
  "status": "not_started",
  "workflowMode": "product-to-planning",
  "planningOnly": false,
  "linkedImplementationSpec": null,
  "certification_status": "not_started",
  "certifiedAt": null
}
--- guard against 016 as it stands TODAY ---
planning-packet-linkage-guard: PASS Gate G087 (planning_packet_implementation_linkage_gate) - spec=specs/016-auction-gamma-playbook status=not_started planningOnly=false
GUARD_016_TODAY_EXIT=0
```

**Interpretation** — *Claim Source: `interpreted`.* G087 passes at
`not_started` because the gate only activates at `specs_hardened`. It is
invisible until promotion is attempted, which is exactly why validate could not
foresee it.

#### E-B2 — Spec 016 DoD counts

**Claim Source:** `executed`

```
########## E-B2: 016 DoD counts ##########
  checked   [x] = 0
  unchecked [ ] = 197
  scope dirs    = 9
```

#### E-B3 — The reverted promotion is recorded at the TOP level, not under `.execution`

**Claim Source:** `executed`

```
########## E-B5: 016 TOP-LEVEL executionHistory ##########
  agent=bubbles.analyst before=not_started after=not_started at=2026-07-28T16:09:22Z
  agent=bubbles.docs before=not_started after=not_started at=2026-07-29T15:10:00Z
  agent=bubbles.harden before=not_started after=not_started at=2026-07-29T15:33:00Z
  agent=bubbles.validate before=not_started after=not_started at=2026-07-29T18:47:00Z
```

**Interpretation** — *Claim Source: `interpreted`.* A first query against
`.execution.executionHistory[]` returned **empty**, which falsely suggested no
durable trace of the reverted promotion existed. The array is **top-level**
(`.executionHistory[]`). Second correction to the originally reported framing.

#### E-B13 — Spec 016 `bubbles.validate` record (verbatim excerpt)

**Claim Source:** `executed`

```
[agent]
bubbles.validate

[statusBefore]
not_started

[statusAfter]
not_started

[startedAt]
2026-07-29T18:35:58Z

[finishedAt]
2026-07-29T18:47:00Z

[outcome]
blocked

[summary]
CERTIFICATION REFUSED on Gate G087, blockingCode PLANNING_GATE_FAILED. ... THE BLOCKER:
G087 planning_packet_implementation_linkage_gate is NOT APPLICABLE at not_started and only
activates once status becomes specs_hardened, so it could not be observed before the
promotion was attempted. The promotion was written, the guard re-run against the promoted
state, and the guard returned exit 1, verdict FAIL, failureCount 1, failedGateIds [G087],
blockingCode PLANNING_GATE_FAILED with the diagnostic 'specs/016-auction-gamma-playbook has
status specs_hardened and planningOnly is not true, but linkedImplementationSpec is missing
or empty'. THE PROMOTION WAS THEREFORE REVERTED IN FULL and the status trio restored to
not_started, not_started, null. ... WHY VALIDATE DID NOT CLEAR G087 ITSELF: the gate offers
exactly two remedies and neither is validate-owned. Setting linkedImplementationSpec would
require naming a real implementation spec directory carrying a state.json, and no such
downstream spec exists; spec 016 has written zero implementation and its nine scopes carry
the implementation plan itself. Setting planningOnly true with a non-empty
planningOnlyJustification would reclassify the packet's downstream handoff semantics. ...
SCOPE OF THIS RUN AFTER REVERT: no DoD box checked, all nine scope statuses left Not Started,
certification.completedScopes left empty
```

#### E-B4 — Repo-wide remedy usage

**Claim Source:** `executed`

```
########## E-B4: any spec carrying planningOnly:true or a non-null link (repo-wide) ##########
  (no rows above = every spec is planningOnly:false with null link)
```

**Interpretation** — *Claim Source: `interpreted`.* Zero specs use either G087
remedy. This independently confirms spec 013's `modeTransition` claim that
in-spec delivery is this repository's established shape, and shows neither
remedy has ever been exercised.

#### E-C1 — G087 trigger condition (fires only at `specs_hardened`)

**Claim Source:** `executed`

```
########## E-C1: G087 guard trigger logic ##########
171:status="$(state_string_or_empty '.status // ""' "$STATE_FILE")"
172:planning_only="$(state_string_or_empty 'if .planningOnly == true then "true" else "false" end' "$STATE_FILE")"
173:planning_only_justification="$(state_string_or_empty '.planningOnlyJustification // ""' "$STATE_FILE")"
174:link_type="$(state_string_or_empty '(.linkedImplementationSpec | type) // "null"' "$STATE_FILE")"
175:linked_implementation="$(state_string_or_empty '.linkedImplementationSpec // ""' "$STATE_FILE")"
178:  violation "$spec_rel sets planningOnly:true but planningOnlyJustification is empty or null"
181:if [[ "$status" == "specs_hardened" && "$planning_only" != "true" ]]; then
183:    violation "$spec_rel has status specs_hardened and planningOnly is not true, but linkedImplementationSpec is missing or empty"
```

#### E-C2 — Spec 013's `modeTransition` corroborates the root cause

**Claim Source:** `executed`

```
[authority]
operator-directed

[reason]
Spec 013 is implemented by its OWN packet; it does not hand off to a separate implementation
spec, so a product-to-planning classification misclassified it.

[conventionBasis]
Repository convention supports the change rather than creating an exception: specs 001-012 are
all workflowMode full-delivery, 003 and 011 reached done that way, and a full sweep of all 16
state.json files found ZERO specs carrying planningOnly true and ZERO carrying a non-null
linkedImplementationSpec, so in-spec delivery is this repository's established shape.

[gateEffect]
... It also clears a G087 trap: planning-packet-linkage-guard.sh fails any spec at status
specs_hardened whose planningOnly is not true and whose linkedImplementationSpec is missing,
and that gate was the single live blocker before the change. Both mechanical escapes were
refused at the time as untruthful - planningOnly true is false on the evidence, and
self-linking linkedImplementationSpec to 013 would satisfy the guard while defeating its
purpose. G087 governs planning packets that hand off to a separate implementation spec; it
does not govern self-delivered specs.
```

#### E-G4 — HEAD at documentation time

**Claim Source:** `executed`

```
########## E-G4: current HEAD ##########
3605cf42ca84b1a7301453006010f363b55042d1 2026-07-29 19:16:17 +0000 fix(002): resolve GAP-F5 - required tests no longer pass silently
```

### Discovered Issues

| ID | Observed | Issue | Disposition | Artifact |
|---|---|---|---|---|
| DISC-005-001 | 2026-07-29 | G087 has no truthful satisfaction path under in-place delivery; blocks spec 016 | `bug-filed` | this packet (`specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/bug.md`) |
| DISC-005-002 | 2026-07-29 | Spec 013 certified to `specs_hardened` at `b525326d` in a state the live G087 guard rejects; latent today | `bug-filed` | this packet — [Scope 3](scopes.md#scope-3-disposition-of-spec-013s-historical-certification-f2) |
| DISC-005-003 | 2026-07-29 | G087 registry description names `state-transition-guard.sh`, but the invocation is in `tail-delegated-gates.sh`, producing a false negative | `bug-filed` | this packet — [Scope 2](scopes.md#scope-2-registry-wiring-description-correction-f1) |
| DISC-005-004 | 2026-07-29 | Originally reported framing said linkage keys were absent at `b525326d`; they are present with falsy values | `fixed-in-session` | corrected in [bug.md](bug.md#corrections-to-the-originally-reported-framing) and [E-A2b](#e-a2b--key-presence-correction-keys-present-with-falsy-values-not-absent) |
| DISC-005-005 | 2026-07-29 | 016's reverted promotion is recorded at top-level `.executionHistory`, not `.execution.executionHistory`; the nested query returns empty and looks like no trace | `fixed-in-session` | corrected in [bug.md](bug.md#corrections-to-the-originally-reported-framing) and [E-B3](#e-b3--the-reverted-promotion-is-recorded-at-the-top-level-not-under-execution) |

### Bug Verification — After Fix

**Not applicable.** No fix was attempted. This packet is documentation-only, and
the resolution direction is an open owner decision. Any future fix must record
its verification here.
