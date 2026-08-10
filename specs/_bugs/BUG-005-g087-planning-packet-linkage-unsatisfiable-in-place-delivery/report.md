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
<a id="e-a3--g087-wiring-at-b525326d-the-false-negative-trap"></a>

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
<a id="e-a4--reproduction-g087-violation-at-the-certifying-commit"></a>

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
<a id="e-a6--the-risk-is-latent-not-active"></a>

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
| DISC-005-006 | 2026-08-10 | `resolve_evidence_by_reference` in `state-transition-guard.sh` slugifies headings with `gsub(/[[:space:]]+/, "-")`, collapsing whitespace runs. GitHub does not collapse, so a heading containing an em-dash yields a double dash on GitHub and a single dash in the guard. Valid, navigable anchor links resolve as "anchor missing", and the natural repair — rewriting links to single-dash — satisfies the guard by breaking navigation. | `routed-upstream` | framework defect; worked around locally with explicit `<a id>` anchors, see [Anchor resolution defect found while closing Check-9](#anchor-resolution-defect-found-while-closing-check-9). Not patched locally: `.github/bubbles/**` is framework-managed. |
| DISC-005-007 | 2026-08-10 | The upstream D1 amendment (`a76bcb5`) adopted in [Ruling 1](design.md#ruling-1--d1-adopted-implemented-at-the-framework-source) no longer exists in the framework source: 0 of 1766 commits across all branches, the 446-entry reflog, and `git fsck --lost-found` carry the `deliveryTopology` satisfier. The general in-place collision is therefore **unfixed**, and spec 016 remains blocked by it. | `open` | [E-R3-1](#e-r3-1--upstream-amendment-is-unrecoverable); D1 must be re-landed upstream. Does not affect this packet, which is planning-only per [Ruling 3](design.md#ruling-3--this-packet-is-planning-only-in-place-was-a-mis-classification). |

### Bug Verification — After Fix

**Not applicable.** No fix was attempted. This packet is documentation-only, and
the resolution direction is an open owner decision. Any future fix must record
its verification here.

---

## Certification Attempt — 2026-08-10T20:01:09Z

### What this run did

The owner decision that blocked this packet **has been made** and is recorded in
[design.md § Owner Ruling](design.md#owner-ruling): direction **D1** was adopted
and implemented **upstream in the Bubbles framework** (`675c4cf`, `a76bcb5`),
picked up here by the install refreshes `7fac02ac` and `fc890ad7`. All three
scopes in [scopes.md](scopes.md) read `**Status:** Done` with 17 of 17 DoD boxes
checked.

This run therefore attempted terminal certification. It **re-executed** the four
verification commands below, then ran both promotion guards. Certification was
**refused by the transition guard** and this record states exactly why, rather
than asserting a status the guard does not support.

**Path redaction.** Absolute home paths are replaced with `<repo>` wherever they
appeared in captured output. The command lines use this file's existing
`redacted@redacted-host:~/research-lab$` prompt convention. No other byte of
captured output is altered.

### Test Evidence — Certification Attempt

All blocks below are raw terminal output captured in this session.

#### E-CERT-1 — G087 guard selftest (43 assertions)

**Claim Source:** executed

```
redacted@redacted-host:~/research-lab$ bash .github/bubbles/scripts/planning-packet-linkage-guard-selftest.sh
=== planning-packet-linkage-guard-selftest (Gate G087) ===

--- S0: clean linked pair passes ---
  PASS: S0 clean linked pair exit=0
  PASS: S0 stdout contains 'PASS Gate G087'
  PASS: S0 stdout contains 'planning_packet_implementation_linkage_gate'

--- S1: missing forward linkedImplementationSpec fails ---
  PASS: S1 missing forward link exit=1
  PASS: S1 stderr contains 'G087'
  PASS: S1 stderr contains 'linkedImplementationSpec'

--- S2: dangling implementation pointer fails ---
  PASS: S2 dangling pointer exit=1
  PASS: S2 stderr contains 'G087'
  PASS: S2 stderr contains 'dangling'
  PASS: S2 stderr contains 'specs/999-missing-implementation'

--- S3: done implementation missing reciprocal link fails ---
  PASS: S3 missing back-link exit=1
  PASS: S3 stderr contains 'G087'
  PASS: S3 stderr contains 'linkedPlanningPacket'
  PASS: S3 stderr contains 'point back'

--- S4: planningOnly true without justification fails ---
  PASS: S4 empty justification exit=1
  PASS: S4 stderr contains 'G087'
  PASS: S4 stderr contains 'planningOnlyJustification'

--- S5: example-app-053-shaped planningOnly opt-out passes ---
  PASS: S5 planning-only opt-out exit=0
  PASS: S5 stdout contains 'PASS Gate G087'
  PASS: S5 stdout contains 'planningOnly=true'

--- S6: archived implementation target fails explicitly ---
  PASS: S6 archived target exit=1
  PASS: S6 stderr contains 'G087'
  PASS: S6 stderr contains 'archived implementation target'
  PASS: S6 stderr contains 'relink to an active implementation spec'
  PASS: S6 stderr contains 'planningOnly:true'

--- S7: in-place delivery topology with justification passes ---
  PASS: S7 in-place opt-in exit=0
  PASS: S7 stdout contains 'PASS Gate G087'
  PASS: S7 stdout contains 'deliveryTopology=in-place'

--- S8: in-place without justification fails ---
  PASS: S8 in-place empty justification exit=1
  PASS: S8 stderr contains 'G087'
  PASS: S8 stderr contains 'deliveryTopologyJustification'

--- S9: in-place combined with planningOnly is contradictory and fails ---
  PASS: S9 in-place plus planningOnly exit=1
  PASS: S9 stderr contains 'G087'
  PASS: S9 stderr contains 'not both'

--- S10: in-place combined with an external link is contradictory and fails ---
  PASS: S10 in-place plus external link exit=1
  PASS: S10 stderr contains 'G087'
  PASS: S10 stderr contains 'no external implementation target'

--- S11: an unrecognized deliveryTopology value fails instead of passing silently ---
  PASS: S11 unrecognized topology exit=1
  PASS: S11 stderr contains 'G087'
  PASS: S11 stderr contains 'is not one of'

--- S12: non-vacuity — explicit two-spec still requires the link ---
  PASS: S12 two-spec still enforced exit=1
  PASS: S12 stderr contains 'G087'
  PASS: S12 stderr contains 'linkedImplementationSpec is missing or empty'

=== Selftest verdict ===
  Total assertions: 43
  Passed:           43
  Failed:           0
planning-packet-linkage-guard-selftest: PASSED
EXIT=0
```

S7 through S11 are the in-place satisfier adopted under Ruling 1. S12 is the
non-vacuity case: an explicit `two-spec` packet is **still refused** without its
link, so the new satisfier narrowed G087 rather than switching it off.

#### E-CERT-2 — G087 guard against spec 013 at HEAD

**Claim Source:** executed

```
redacted@redacted-host:~/research-lab$ bash .github/bubbles/scripts/planning-packet-linkage-guard.sh specs/013-market-regime-stack-and-strategy-playbook
planning-packet-linkage-guard: PASS Gate G087 (planning_packet_implementation_linkage_gate) - spec=specs/013-market-regime-stack-and-strategy-playbook status=in_progress planningOnly=false deliveryTopology=two-spec
EXIT=0
```

This reproduces the Ruling 2 disposition against current bytes. Spec 013 is
`status=in_progress`, so G087's `specs_hardened` trigger does not fire and the
guard exits 0 — the historical `b525326d` certification is discharged by the
`602f32db` graduation, exactly as ruled. `specs/013-*` was read only.

#### E-CERT-3 — Registry wiring-description counts (16 gates)

**Claim Source:** executed

```
redacted@redacted-host:~/research-lab$ grep -o 'through its sourced delegator [^,]*' .github/bubbles/registry/gates.yaml | sort | uniq -c
      3 through its sourced delegator bubbles/scripts/guards/tail-convergence-gates.sh
     13 through its sourced delegator bubbles/scripts/guards/tail-delegated-gates.sh
EXIT=0
```

3 convergence + 13 delegated = the 16 gates named in the Ruling's secondary
finding. The registry now names the **sourced delegator** that holds the real
invocation, so the grep-based false negative recorded as DISC-005-003 no longer
misdirects an investigator.

#### E-CERT-4 — Repository product selftest

**Claim Source:** executed

```
redacted@redacted-host:~/research-lab$ node scripts/selftest.mjs 2>&1 | tail -15
  ✓ every declared dependency gate is represented in the projection
  ✓ the public gate projection carries only the fields the runtime predicate reads
  ✓ the browser resolves gates from the public projection and never fetches a governance statePath
  ✓ the statePath-fetch check is non-vacuous — it still matches the regressed shape
  ✓ no registered page fetches a root-absolute asset path — it loses the repo segment on project Pages: 
  ✓ the root-absolute asset detector still matches the regressed shape
  ✓ the workflow checks detect a reduced browser gate and a repo-root deployment

spec artifacts — referenced tests/*.mjs paths exist (Playwright silently ignores absent file args)
  ✓ the scan matched at least one tests/*.mjs reference against a present baseline, so the guard is not vacuously green (11647 reference(s) across 482 artifact(s), baseline 86 entries)
  ✓ no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (0 new, 86 known-missing, 0 stale of 218 referenced)

================================================
Research-Lab self-test: 1370 passed, 0 failed
================================================
PIPE0=0
```

1370 passed / 0 failed. The repository product surface is green and no `.html`,
`.js`, or `.mjs` file was touched by this run.

### Verification Verdict — artifact lint

**Claim Source:** executed

```
redacted@redacted-host:~/research-lab$ bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ uservalidation checklist has checked-by-default entries
✅ All checklist bullet items use checkbox syntax
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: ###[[:space:]]+Summary|^##[[:space:]]+Summary
✅ report.md contains section matching: ###[[:space:]]+Completion Statement|^##[[:space:]]+Completion Statement
✅ report.md contains section matching: ###[[:space:]]+Test Evidence|^##[[:space:]]+Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0
```

**Verdict: PASSED (exit 0).**

### Verification Verdict — state transition guard

**Claim Source:** executed

```
redacted@redacted-host:~/research-lab$ bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery
============================================================
  TRANSITION GUARD VERDICT
============================================================

🔴 TRANSITION BLOCKED: 43 failure(s), 2 warning(s)

state.json status MUST NOT be set to 'done'.
Fix ALL blocking failures above before attempting promotion.

BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:12aa11124fde1e3bdfa9e827413021360e3f81c16f47927c62c4995fc0db5fd5
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G051,G082,G083,G084,G128,G085,G086,G091,G087,G088,G089,G092,G090,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G055,G057,G060,G022,G053,G040,G068,G093,G094]
failedChecks: [Check-9-evidence]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 43
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
GUARD_EXIT=1
```

**Verdict: FAIL (exit 1), 43 failures, `blockingCode: DELIVERY_COMPLETION_FAILED`.**

`certifiedAt` was therefore **not** written and top-level `status` was **not**
set to `done`. G087 itself is in `passedGateIds` — the gate this packet reported
is satisfied. What refuses promotion is the delivery-completion contract around it.

### Why certification is refused — per-gate accounting

Each blocking gate below was diagnosed by running its own guard, not inferred
from the summary line.

| Gate / check | Failure | Artifact that would have to change |
|---|---|---|
| **G093** — Check 29B | `deliveryDeltaPaths=0 planningOnlyPaths=3 otherPaths=0`; a `done`-ceiling delivery mode requires non-planning delta outside `specs/` and `.specify/` | repository source — **none exists**, because Ruling 1 landed the fix upstream in the Bubbles framework, not here |
| **G094** — Check 34 | `triggerHits=12`; `spec.md` needs `## Domain Capability Model` or `### Single-Capability Justification`; `design.md` needs `## Capability Foundation`, `## Concrete Implementations`, `### Variation Axes` | `spec.md` **and** `design.md` |
| **G057** — Check 3C | Scopes define Gherkin scenarios but `scenario-manifest.json` is missing | a **new file** in this packet |
| **G068** — Check 22 | 3 Gherkin scenarios have no faithful DoD item (one per scope) | `scopes.md` |
| **G040** — Check 18 | 1 deferral-language hit on the line closing `F2` | `scopes.md` |
| **G022** — Checks 6 / 6B | 8 required phases absent (`implement`, `test`, `regression`, `simplify`, `stabilize`, `security`, `validate`, `audit`); `discovery` and `documentation` lack specialist provenance | `state.json` — but writing them would assert phases that **never ran** |
| **G053** — Check 13B | No `### Code Diff Evidence` section | `report.md` — shape only; the section has no truthful non-artifact path to name |
| **G060** — Check 3E | Effective TDD mode is `scenario-first`; no RED→GREEN ordering exists in the artifacts | `report.md` — no red proof exists, because the fix was built upstream |
| **G055** — Check 3A | `policySnapshot` carried booleans, not `{mode, source}` provenance objects | `state.json` — **corrected in this run** |
| Check 8A (9 blocks) | Every scope lacks scenario-specific and broader regression-E2E DoD items and Test Plan rows | `scopes.md` |
| Check 9 (3 blocks) | 3 checked DoD items have inline evidence blocks under 10 non-blank lines | `scopes.md` |
| Check 5 | 3 Done scopes but `certification.completedScopes` empty | `state.json` — validate-owned; **not** written by hand |

Five of these are decisive and cannot be cleared by any edit this session is
permitted to make:

1. **G093** has no truthful satisfier. The adopted remedy was implemented in the
   framework source and consumed here as an install refresh. This packet
   genuinely produced no repository implementation delta, and naming one would
   be a false claim.
2. **G094** requires new sections in `spec.md` and `design.md`.
3. **G057** requires creating `scenario-manifest.json`.
4. **G068**, **G040**, Check 8A and Check 9 all require `scopes.md`.
5. **G022** would require asserting eight specialist phases that were never
   dispatched. That is precisely the fabrication G022 exists to detect, and the
   sibling BUG-001 record states the same rule plainly: no `certification.*`
   field and no phase claim may be written by hand to clear a gate.

The guard also prints an alternate route for G093 — `planning-only downgrade
(use a below-done planning workflow when the packet intentionally changes only
specs/ or .specify/)`. Selecting a workflow mode is a planning decision with an
owner, so this run records the option and does not exercise it.

### What this run changed

- `state.json` — `blockedReason` discharged to `null` (the owner decision it
  described **has been made**); `status` and `certification.status` moved
  together from `blocked` to `in_progress`; `policySnapshot` corrected to the
  `{mode, source}` provenance shape, clearing G055; this attempt recorded.
- `report.md` — this section.

No other file was written. `specs/013-*`, `specs/016-*`, `specs/017-*`,
`scopes.md`, `design.md`, `market-brief.payload.json`, every `.html` / `.js` /
`.mjs`, and everything under `.github/bubbles/**` were read only. Nothing was
committed, staged, stashed, restored, or reset.

## Completion Statement — 2026-08-10T20:01:09Z

**This packet is NOT certified and asserts no completion.** This statement
supersedes the run-date [Completion Statement](#completion-statement) above,
which described the earlier `blocked` state.

- The **owner decision is resolved**. D1 was adopted and implemented upstream;
  the blocker recorded on 2026-07-29 is discharged and `blockedReason` is `null`.
- Status is `in_progress`, mirrored in `certification.status`. It is actionable,
  not blocked: the remaining work is authorized edits to `scopes.md`, `spec.md`,
  `design.md`, and a `scenario-manifest.json`, none of which this session may write.
- **No** certification field asserts anything. `certifiedAt` is `null`,
  `certification.completedScopes` is empty, `certification.scopeProgress` is
  empty. Certification belongs to `bubbles.validate` (Gate G056) and the guard
  refuses the transition with 43 failures.
- All 17 DoD boxes in [scopes.md](scopes.md) remain as the prior run left them.
  This run checked none and unchecked none.
- Artifact lint passes (exit 0). The transition guard fails (exit 1).

## Validation Certification Attempt — bubbles.validate — 2026-08-10T20:21:37Z

`bubbles.validate` was dispatched to certify this packet. **Certification is
REFUSED.** No `certification.*` field was written, `certifiedAt` stays `null`,
and top-level `status` stays `in_progress`.

### E-VAL-1 — the three delivered claims all substantiate

Each was re-executed against current bytes rather than read from the record.
**Claim Source:** executed

```
$ bash .github/bubbles/scripts/planning-packet-linkage-guard-selftest.sh
--- S7: in-place delivery topology with justification passes ---
  PASS: S7 in-place opt-in exit=0
  PASS: S7 stdout contains 'deliveryTopology=in-place'
--- S11: an unrecognized deliveryTopology value fails instead of passing silently ---
  PASS: S11 unrecognized topology exit=1
--- S12: non-vacuity — explicit two-spec still requires the link ---
  PASS: S12 two-spec still enforced exit=1
  Total assertions: 43   Passed: 43   Failed: 0
planning-packet-linkage-guard-selftest: PASSED
SELFTEST_EXIT=0

$ bash .github/bubbles/scripts/planning-packet-linkage-guard.sh specs/013-market-regime-stack-and-strategy-playbook
planning-packet-linkage-guard: PASS Gate G087 - spec=specs/013-market-regime-stack-and-strategy-playbook
  status=in_progress planningOnly=false deliveryTopology=two-spec
GUARD013_EXIT=0

$ grep -o 'through its sourced delegator [^,]*' .github/bubbles/registry/gates.yaml | sort | uniq -c
      3 through its sourced delegator bubbles/scripts/guards/tail-convergence-gates.sh
     13 through its sourced delegator bubbles/scripts/guards/tail-delegated-gates.sh

$ grep -c "planning-packet-linkage-guard" .github/bubbles/scripts/state-transition-guard.sh
0
$ grep -n "guards/tail-" .github/bubbles/scripts/state-transition-guard.sh
4057:source "$SCRIPT_DIR/guards/tail-convergence-gates.sh"
4082:source "$SCRIPT_DIR/guards/tail-delegated-gates.sh"

$ git status --porcelain specs/013-market-regime-stack-and-strategy-playbook specs/016-auction-gamma-playbook
$ git status --porcelain .github/bubbles/ | wc -l
0
$ node scripts/selftest.mjs
Research-Lab self-test: 1370 passed, 0 failed
```

The in-place satisfier is present in the **installed** guard, not merely in its
selftest — `planning-packet-linkage-guard.sh` lines 176-211 read
`deliveryTopology` / `deliveryTopologyJustification`, refuse an unrecognised
value, and refuse `in-place` combined with either `planningOnly:true` or a
non-empty `linkedImplementationSpec`. It arrived via refreshes `7fac02ac` and
`fc890ad7`; nothing under `.github/bubbles/**` is locally modified.

### E-VAL-2 — the transition guard refuses, and the refusal is correct

**Claim Source:** executed

```
$ bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery
🔴 TRANSITION BLOCKED: 37 failure(s), 2 warning(s)
state.json status MUST NOT be set to 'done'.
BEGIN TRANSITION_GUARD_RESULT_V1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
failedGateIds: [G057,G060,G022,G053,G040,G068,G093,G094]
failedChecks: [Check-9-evidence]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 37
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
GUARD_EXIT=1
```

37 failures, down from the prior run's 43 — the `policySnapshot` provenance fix
cleared G055, which no longer appears in `failedGateIds`. G087, the gate this
packet reported, is in `passedGateIds`.

### E-VAL-3 — G093 has no truthful satisfier, confirming the prior finding

**Claim Source:** executed

```
$ bash .github/bubbles/scripts/delivery-implementation-delta-guard.sh specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery
G093 delivery_implementation_delta_gate violation: done-ceiling delivery mode
'bugfix-fastlane' has no implementation/runtime/config/contract/test/docs delta
outside specs/ and .specify/
  deliveryDeltaPaths=0 planningOnlyPaths=5 otherPaths=0
  source (0):   runtime (0):   config (0):
  contract (0): test (0):      docs (0):     other (0):
nextOwner: implementation
alternateOwner: planning-only downgrade (use a below-done planning workflow when
 the packet intentionally changes only specs/ or .specify/)
G093_EXIT=1
```

Every changed path is a planning artifact. This is an accurate measurement, not
a defect in the packet: the adopted remedy was built in the Bubbles framework
source and consumed here as an install refresh, so this packet genuinely
produced no repository implementation delta. Naming one to satisfy G093 or to
fill the `### Code Diff Evidence` section G053 wants would be a false claim.

### E-VAL-4 — mirroring the BUG-001 certification shape would fabricate evidence

The dispatch asked for BUG-001's exact shape. That shape cannot be honestly
reproduced here. **Claim Source:** executed

```
$ jq '.execution.audit | length' specs/_bugs/BUG-001-.../state.json
4
$ jq '.execution.audit | length' specs/_bugs/BUG-005-.../state.json
0
$ jq -r '.execution.completedPhaseClaims[] | "\(.phase) <- \(.agent)"' specs/_bugs/BUG-005-.../state.json
discovery <- bubbles.bug
documentation <- bubbles.bug
certification-attempt <- bubbles.bug
```

BUG-001 certifies eight specialist phases and a resolved
`pendingAuditReconciliation` because it genuinely ran them, including four audit
attempts. BUG-005 has zero audit attempts and three phase claims, all by
`bubbles.bug`. Writing BUG-001's field set here would assert eight phases that
were never dispatched and an audit reconciliation that never occurred — exactly
what Gate G022 exists to detect. BUG-001 is a valid precedent for the *shape*
and, for that reason, not available to this packet.

### E-VAL-5 — no failing gate is both validate-owned and truthfully satisfiable

| Failing gate | What it needs | Owner | Available to validate? |
|---|---|---|---|
| G093 | delivery delta outside `specs/` + `.specify/` | — | No truthful satisfier exists |
| G022 (12 blocks) | 8 specialist phases + claim provenance | orchestrator dispatch | No — never dispatched |
| G053 | `### Code Diff Evidence` naming real paths | — | No — there are no such paths |
| G057 | create `scenario-manifest.json` | `bubbles.plan` | No — validate may only update evidence links |
| G060 | RED→GREEN scenario-first ordering | `bubbles.test` | No — remedy shipped upstream, never red-first here |
| G040 | remove 1 deferral hit from `scopes.md` | `bubbles.plan` | No — foreign artifact |
| G068 (4 blocks) | faithful DoD items for 3 scenarios | `bubbles.plan` | No — foreign artifact |
| Check 8A (9 blocks) | regression E2E DoD items + Test Plan rows | `bubbles.plan` | No — foreign artifact |
| Check 9 (3 blocks) | evidence anchors / ≥10-line blocks | `bubbles.plan` | No — foreign artifact |
| G094 | capability sections in `spec.md` + `design.md` | `bubbles.analyst` / `bubbles.design` | No — foreign artifacts |

Check 5 also reports `completedScopes` empty against 3 Done scopes. That field
is validate-owned, but populating it while eight gates refuse is the
certification write itself, not a fix for it.

`delivered_fast` was checked as an escape and is **not** terminal for
`bugfix-fastlane` (`is-terminal-for-mode.sh delivered_fast bugfix-fastlane`
exits 1; `done` exits 0), so no assurance-derived fast lane is available either.

### Validation verdict

`route_required`. The packet's substance is sound and fully verified; its
*workflow mode* is what does not fit. A `bugfix-fastlane` packet whose remedy
shipped upstream can never show a repository delivery delta. The guard's own
`alternateOwner` names the fix: a below-done planning workflow. Selecting it is
a planning decision, so this run routes to `bubbles.plan` rather than forcing a
`done` it cannot substantiate.

Files written by this validation run: `report.md` — this section only. No
`certification.*` field, no status change, no phase claim, no commit.

## Certification — Ruling 3 reclassification — 2026-08-10T23:49:00Z

HEAD at certification time: `d1728158`.

### What this run established

The prior validation run above routed to `bubbles.plan` because no failing gate
was both validate-owned and truthfully satisfiable. That routing was correct for
the classification the packet then carried. This run changed the classification
itself, on evidence, and the gate set then cleared without any claim being
softened.

`deliveryTopology: "in-place"` was removed and `planningOnly: true` recorded with
justification. The reasoning is in
[design.md § Ruling 3](design.md#ruling-3--this-packet-is-planning-only-in-place-was-a-mis-classification).
In short: the upstream amendment the old classification depended on no longer
exists anywhere in the framework source, **and** the classification contradicted
this packet's own `What this run changed` record, which states the remedy landed
upstream. Upstream delivery is not in-place delivery.

<a id="e-r3-1--upstream-amendment-is-unrecoverable"></a>

#### E-R3-1 — the upstream amendment is unrecoverable

**Claim Source:** `executed`

```
$ git --no-pager reflog | wc -l
446
$ { git --no-pager rev-list --all; git --no-pager reflog --format='%H'; \
    git fsck --lost-found 2>/dev/null | awk '/dangling commit/{print $3}'; } \
    | sort -u | wc -l
1766
$ while read -r c; do
    if git --no-pager show "$c:bubbles/scripts/state-transition-guard.sh" 2>/dev/null \
       | grep -q "deliveryTopology"; then echo "FOUND: $c"; fi
  done < /tmp/allc.txt
(no output — zero of 1766 commits carry the satisfier)
$ git --no-pager branch -a --sort=-committerdate
* main
  remotes/origin/main
  awk-posix-migration
  backup-my-g022-fix
```

The topic branch that carried `a76bcb5` is absent. Searching every commit
reachable from every branch, the entire reflog, and every dangling object
recovered by `git fsck --lost-found` — 1766 distinct commits — finds no
`state-transition-guard.sh` containing `deliveryTopology`. The downstream install
is independently at 7.25.0 and also lacks it:

```
$ grep -c "deliveryTopology" .github/bubbles/scripts/state-transition-guard.sh \
    .github/bubbles/scripts/planning-packet-linkage-guard.sh
.github/bubbles/scripts/state-transition-guard.sh:0
.github/bubbles/scripts/planning-packet-linkage-guard.sh:0
```

<a id="e-r3-2--test-plan-static-checks-execute"></a>

#### E-R3-2 — the Test Plan static checks execute

**Claim Source:** `executed`

The `(none)` placeholder row in Scope 1 was replaced by the checks that were in
fact run, and Scope 3 gained the row for SCN-BUG005-004. Each maps to a scenario
and names a concrete file that exists.

```
########## TP-1 SCN-BUG005-001 ##########
$ grep -c '^### Ruling' specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md
3
EXIT=0
########## TP-2 SCN-BUG005-002 ##########
$ grep -n '^### Ruling 1 — D1 adopted' specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md
240:### Ruling 1 — D1 adopted, implemented at the framework source
EXIT=0
########## TP-3 SCN-BUG005-004 ##########
$ grep -n '^### Ruling 2' specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md
318:### Ruling 2 — Spec 013's historical certification is discharged; annotate, do not rewrite
EXIT=0
```

Three rulings exist; Ruling 1 records the adopted direction, so SCN-BUG005-002's
negative case ("no direction is selected") is discharged rather than latent.

<a id="e-r3-3--transition-guard-passes"></a>

#### E-R3-3 — the transition guard passes at `specs_hardened`

**Claim Source:** `executed`

```
$ bash .github/bubbles/scripts/planning-packet-linkage-guard.sh specs/_bugs/BUG-005-...
planning-packet-linkage-guard: PASS Gate G087 (planning_packet_implementation_linkage_gate)
  - spec=specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery
    status=specs_hardened planningOnly=true
G087_EXIT=0

$ bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-005-...
targetStatus: specs_hardened
applicableCheckClasses: [universal,mode-required,planning-maturity]
notApplicableChecks: [Check-4-completion,Check-5-all-done,Check-8-file-existence,Check-11-execution-evidence]
passedGateIds: [G073,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,
G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G001,G002,G006,G007,G008,
G010,G011,G012,G014,G015,G016,G032]
failedGateIds: []
failedChecks: []
blockingCode: none
failureCount: 0
exitStatus: 0
verdict: PASS
GUARD_EXIT=0
```

36 gates pass. G087 and G068 are both in the passed set — the two gates this
packet was raised about, and the one that blocked it for the whole prior run.

<a id="e-r3-4--repository-checks-clean"></a>

#### E-R3-4 — repository-level checks are clean

**Claim Source:** `executed`

```
$ bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-005-...
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
LINT_EXIT=0

$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 1371 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### Anchor resolution defect found while closing Check-9

Three DoD items linked working GitHub anchors that the guard reported as
missing. The cause is a slugifier divergence, not a bad link:

```
$ awk '/^#+[[:space:]]/ { h=$0; sub(/^#+[[:space:]]+/,"",h); slug=tolower(h);
    gsub(/[^a-z0-9 -]/,"",slug); gsub(/[[:space:]]+/,"-",slug); print NR": "slug }' report.md
99: e-a3-g087-wiring-at-b525326d-the-false-negative-trap
169: e-a6-the-risk-is-latent-not-active
```

The guard collapses whitespace runs (`gsub(/[[:space:]]+/, "-")`), producing a
**single** dash where the em-dash was. GitHub does not collapse: it strips the
em-dash and maps each surviving space to its own dash, giving the **double**
dash the links use. The links are correct for the renderer; the guard cannot
resolve them.

Rewriting the links to single-dash would have satisfied the guard by **breaking
navigation on GitHub** — trading a real reader-facing property for a green
check. Instead each block gained an explicit `<a id="...">` immediately after its
heading, a form both the renderer and the guard's `<a id=` matcher honor. The
anchor sits *after* the heading deliberately: placed before it, the guard's
block-extent scan terminates on the heading itself and measures one line.

A fourth item pointed at `#test-evidence`, whose block is genuinely 1 non-blank
line; it was repointed at `#e-a4--reproduction-g087-violation-at-the-certifying-commit`,
the block that actually holds the replay evidence the item claims.

The slugifier divergence is a framework defect of the same class as this bug's
primary finding and is recorded in
[Discovered Issues](#discovered-issues) for upstream routing. It was **not**
patched locally — `.github/bubbles/**` is framework-managed.

### Files written by this run

`state.json` (`planningOnly`, `planningOnlyJustification`, `deliveryTopology`
removed, `completedScopes`, `status`), `scopes.md` (Scope-Kind declarations,
scenario IDs, Test Plan rows, one evidence link repointed), `design.md`
(Ruling 3), `report.md` (this section and four `<a id>` anchors),
`scenario-manifest.json`. Nothing outside this packet directory was modified.
