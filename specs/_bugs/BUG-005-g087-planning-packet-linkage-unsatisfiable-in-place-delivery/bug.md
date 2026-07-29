# Bug: BUG-005 G087 Planning-Packet Linkage Unsatisfiable Under In-Place Delivery

## Summary

Gate **G087** (`planning_packet_implementation_linkage_gate`) has no truthful
satisfaction path under this repository's delivery model, and one spec was
certified past it while the gate was live.

G087 fires when a `state.json` carries `status == "specs_hardened"` and
`planningOnly != true`, and then demands a non-empty `linkedImplementationSpec`
pointing at a real, separate implementation spec directory. That design assumes
a **planning packet → separate implementation spec** handoff. This repository
delivers **in place**: a packet graduates its own `workflowMode` from
`product-to-planning` to `full-delivery` and implements its own scopes. There is
no separate spec to name, so an honest packet cannot satisfy G087, and
`specs_hardened` becomes effectively unreachable without a false claim.

This bug records **two linked concerns**:

- **Concern A (spec-013-specific, LATENT):** spec 013 was certified to
  `specs_hardened` while G087 was wired and live, in a state the guard rejects.
  It does **not** fail today because 013 has since graduated to `full-delivery`
  / `in_progress`, and G087 only activates at `specs_hardened`.
- **Concern B (systemic, ACTIVE):** spec 016 is blocked on G087 right now.
  `bubbles.validate` attempted promotion, the guard failed, and validate
  reverted the promotion in full. Neither of G087's two remedies is truthful
  for 016.

This artifact **documents** the finding. It does **not** fix anything. No
`.html`, `.js`, or `.mjs` file was created or modified, and neither
`specs/013-*` nor `specs/016-*` was touched.

## Severity

**Medium — process/governance, latent data-integrity risk.**

Not High: no product behavior is wrong, no user-facing surface is broken, and no
spec is currently mis-certified in a way the guard would reject at HEAD.

Not Low: a live blocking gate was passed in a rejecting state, and the gate now
blocks a real packet (016) with no truthful escape, so every future planning
packet hits the same wall.

## Status

**Documented — awaiting owner / framework decision.**

`state.json` status is `blocked`. The blocker is a classification decision that
is neither `bubbles.bug`-owned nor `bubbles.validate`-owned: it selects between
mutually exclusive resolution directions recorded in
[design.md](design.md#candidate-resolution-directions). No direction has been
chosen and none has been implemented.

## Reproduction Steps

### R1 — Spec 013 was certified in a state G087 rejects

```bash
cd /home/redacted/research-lab
T=$(mktemp -d)
git archive b525326d specs/013-market-regime-stack-and-strategy-playbook | tar -x -C "$T"
bash .github/bubbles/scripts/planning-packet-linkage-guard.sh "$T/specs/013-market-regime-stack-and-strategy-playbook"
echo "GUARD_EXIT=$?"
rm -rf "$T"
```

Observed: exit **1**, with

```
G087 planning_packet_implementation_linkage_gate violation: specs/013-market-regime-stack-and-strategy-playbook has status specs_hardened and planningOnly is not true, but linkedImplementationSpec is missing or empty
```

### R2 — G087 was WIRED AND LIVE at that commit

```bash
git show b525326d:.github/bubbles/scripts/guards/tail-delegated-gates.sh | grep -c planning-packet-linkage-guard   # -> 3
git show b525326d:.github/bubbles/scripts/state-transition-guard.sh      | grep -c planning-packet-linkage-guard   # -> 0
```

> **FALSE-NEGATIVE TRAP — read this before concluding the gate was not wired.**
> The gate registry describes G087 as invoked by `state-transition-guard.sh` as
> "Check 29", but the actual invocation lives in
> `.github/bubbles/scripts/guards/tail-delegated-gates.sh`. Grepping only
> `state-transition-guard.sh` returns **0** and yields a **false negative**. Any
> investigator who checks only the state-transition guard will wrongly conclude
> G087 was not enforced at that commit.

### R3 — G087 has no grandfather clause (unlike G094 / G130)

```bash
grep -cEi 'createdAt|grandfather' .github/bubbles/scripts/planning-packet-linkage-guard.sh   # -> 0
```

Registry body mentions of `createdAt` / `grandfather`: **G087 = 0**,
**G094 = 1**, **G130 = 1**. G130 explicitly makes specs with `createdAt` before
`2026-07-27` WARN-only "so adopting this gate never retroactively blocks
already-closed work". G087 has no such clause, so it applies retroactively with
full blocking force.

### R4 — The risk is LATENT, not active

```bash
bash .github/bubbles/scripts/planning-packet-linkage-guard.sh specs/013-market-regime-stack-and-strategy-playbook
echo "GUARD_EXIT=$?"
```

Observed: exit **0**, `PASS ... status=in_progress planningOnly=false`. Spec 013
graduated at commit `602f32db` to `workflowMode: full-delivery` /
`status: in_progress`, and G087 only activates at `specs_hardened`. **013 does
not fail today.** This is stated plainly and deliberately: the defect is a
governance-integrity gap, not an active build break.

### R5 — Spec 016 is blocked on G087 right now

```bash
jq -r '{status, workflowMode, planningOnly, linkedImplementationSpec}' specs/016-auction-gamma-playbook/state.json
jq -r '.executionHistory[] | select(.agent=="bubbles.validate") | .outcome, .summary' specs/016-auction-gamma-playbook/state.json
```

Observed: 016 sits at `not_started` / `not_started` / `certifiedAt: null` with
**0 of 197** DoD boxes checked across 9 scopes. Its `bubbles.validate` record
has `outcome: blocked` and states the promotion was written, the guard returned
`failedGateIds [G087]` / `blockingCode PLANNING_GATE_FAILED`, and
"THE PROMOTION WAS THEREFORE REVERTED IN FULL".

## Expected Behavior

A planning packet that is honestly self-delivered — one that plans and then
implements its **own** scopes — must have a truthful, mechanically valid path to
its declared `specs_hardened` ceiling, without:

- naming a `linkedImplementationSpec` that does not exist, and
- claiming `planningOnly: true` when the scopes are intended to be built.

Equivalently: if `specs_hardened` is genuinely unreachable for in-place
delivery, that should be an explicit, documented repository convention rather
than an undocumented dead end discovered only at certification time.

## Actual Behavior

G087 offers exactly two remedies, and under in-place delivery **both are false
statements**:

| Remedy | Why it is untruthful here |
|---|---|
| `linkedImplementationSpec: "<path>"` | No separate implementation spec exists. Repo-wide sweep: **zero** specs carry a non-null `linkedImplementationSpec`. Self-linking a packet to itself would satisfy the guard while defeating its stated purpose. |
| `planningOnly: true` + justification | False on the evidence. 016's 9 scopes and 013's 14 scopes name real implementation targets and are intended to be built. |

The observed outcomes are therefore either a **false claim** (013's route: the
promotion stuck while the guard would reject it) or a **hard block** (016's
route: validate correctly refused and reverted).

## Environment

- Repository: `/home/redacted/research-lab`
- HEAD at documentation time: `3605cf42ca84b1a7301453006010f363b55042d1`
- Gate: `G087` `planning_packet_implementation_linkage_gate`, classification
  `businessInvariant`, BLOCKING
- Guard: `.github/bubbles/scripts/planning-packet-linkage-guard.sh`
- Invocation site: `.github/bubbles/scripts/guards/tail-delegated-gates.sh`
- Affected specs: `specs/013-market-regime-stack-and-strategy-playbook`
  (latent), `specs/016-auction-gamma-playbook` (active)

## Error Output

From the reproduction in R1, verbatim:

```
G087 planning_packet_implementation_linkage_gate violation: specs/013-market-regime-stack-and-strategy-playbook has status specs_hardened and planningOnly is not true, but linkedImplementationSpec is missing or empty
G087 planning_packet_implementation_linkage_gate blocked: findings=1 spec=specs/013-market-regime-stack-and-strategy-playbook
GUARD_EXIT=1
```

From spec 016's `bubbles.validate` record, verbatim excerpt:

```
CERTIFICATION REFUSED on Gate G087, blockingCode PLANNING_GATE_FAILED.
...
the guard returned exit 1, verdict FAIL, failureCount 1, failedGateIds [G087],
blockingCode PLANNING_GATE_FAILED with the diagnostic 'specs/016-auction-gamma-playbook
has status specs_hardened and planningOnly is not true, but linkedImplementationSpec
is missing or empty'. THE PROMOTION WAS THEREFORE REVERTED IN FULL
```

## Current State

- **013:** `full-delivery` / `in_progress`. G087 passes. Historical certification
  at `b525326d` remains in git history in a state the guard rejects. No
  correction has been applied and none is proposed here.
- **016:** `product-to-planning` / `not_started`, 0 of 197 DoD checked,
  `certifiedAt: null`. Cannot reach its `specs_hardened` ceiling. Its validate
  record routes `nextRequiredOwner` to `bubbles.analyst` for the linkage
  decision.
- **Repo-wide:** every `specs/*/state.json` carries `planningOnly: false` and
  `linkedImplementationSpec: null`. No spec has ever used either G087 remedy.

## Root Cause

G087 encodes a **planning-packet → separate-implementation-spec** delivery
model. This repository uses **in-place delivery**: a packet graduates its own
`workflowMode` and implements its own scopes.

Spec 013's own `modeTransition` record (added at commit `602f32db`, authority
`operator-directed`) states this directly and independently:

> "G087 governs planning packets that hand off to a separate implementation
> spec; it does not govern self-delivered specs."

and records that both mechanical escapes were **refused at the time as
untruthful**:

> "Both mechanical escapes were refused at the time as untruthful - planningOnly
> true is false on the evidence, and self-linking linkedImplementationSpec to
> 013 would satisfy the guard while defeating its purpose."

The model mismatch — not any individual agent error — is the root cause. Full
analysis in [design.md](design.md).

## Corrections To The Originally Reported Framing

Recorded for accuracy; **neither changes the conclusion**.

1. **The linkage fields were PRESENT with falsy values, not absent.** At
   `b525326d`, spec 013's `state.json` contained
   `"linkedImplementationSpec": null` (line 7), `"planningOnly": false`
   (line 9), and `"planningOnlyJustification": null` (line 10). `jq has()`
   returns `true` for all three. The guard's wording — "missing **or empty**" —
   covers the null case identically, so G087 fires either way.
   (Note: `jq 'paths(scalars)'` does **not** list these keys, because `paths(f)`
   drops paths whose filter output is falsy, and `null`/`false` are falsy. A raw
   `grep` is authoritative here.)
2. **016's reverted promotion IS durably recorded.** It lives in the
   **top-level** `.executionHistory[]` array, not `.execution.executionHistory[]`.
   Querying the nested path returns empty and looks like no trace exists.

## Explicitly Out Of Scope

- Fixing G087, amending the framework gate, or editing any guard script.
- Modifying `specs/013-*` or `specs/016-*` in any way.
- Choosing among the candidate resolution directions.
- Creating or modifying any `.html`, `.js`, or `.mjs` file.
- Touching `market-heatmap-lab.html`, `rlexperience.js`, `rlbrief.js`, or their
  tests — those are owned by a concurrent in-flight packet (BUG-004,
  `in_progress`).

## Related

- `specs/013-market-regime-stack-and-strategy-playbook` — Concern A (latent)
- `specs/016-auction-gamma-playbook` — Concern B (active blocker)
- `specs/014-*` — graduated under the same operator ruling at `602f32db`
- `.github/bubbles/registry/gates.yaml` → `G087`, `G094`, `G130`
- Commits: `b525326d` (013 certified), `602f32db` (013/014 graduation),
  `5cc90c1a` (016 audit clean, certification blocked on G087)
