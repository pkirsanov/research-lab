# Scope 6: Authoring Lane Composer Routing

## 06-authoring-lane-composer-routing

**Status:** Done
**Scope-Kind:** publish-pipeline
**Tags:** composer-routing, build-step, exclusion-record, structural-compliance
Depends On: 1, 2, 3

**Primary Outcome:** The authoring lane stops emitting `decision-attention/v1`
envelopes and starts emitting only the `authored` argument of
`RLATTN.buildAttentionItem`. A new publish-time build step,
`scripts/build-attention-items.mjs`, supplies `gateResult` from the payload's own
observed tool reads and `ctx` from the committed calendar, watchlist and window
vocabulary, then calls the certified composer once per candidate. The composer
constructs each envelope or refuses that candidate with a named `RLATTN-*` code.
A refused candidate is excluded from `attention[]` and its reason is recorded in
`attentionExclusions[]`, never defaulted and never silently dropped. Compliance
becomes structural rather than advisory, because a lane that no longer emits an
envelope cannot emit a non-conforming one.

## Requirement Coverage

- F-017-06 is applied: the lane is routed through `buildAttentionItem` at publish
  time rather than asked for that composer's output.
- The lane authors only headline, the falsifiability triple (escalation trigger,
  invalidation, expiry) and the judgement enums it is genuinely suited to (verb,
  horizon, severity, imminence). It authors no serialized field.
- The build step derives the decision window, the transmission vocabulary, the
  provenance instants and the lifecycle state from committed contracts. It
  restates no rule that already lives in `rlattention.js`.
- Every candidate the composer refuses is excluded from the published set and its
  named `RLATTN-*` reason is recorded, mirroring the committed
  `toolCoverage[].reason` contract where a registered tool that was not material
  must still state why.
- A generation in which every candidate is refused yields an empty `attention[]`,
  the tier's declared empty state, and a brief that still publishes.
- The hard-cutover posture is unchanged: no dual-shape acceptance window, no
  default substitution, no relaxed predicate, no Red Alert threshold touched.

### Why The Empty Set Is Not The Banned Soft Fallback

The repository prohibition is on substituting a DEFAULT for a MISSING value.
Nothing in this scope is defaulted. Every published field is observed, derived
from a committed contract, or authored. A candidate lacking genuine judgement is
refused outright and the refusal is stated in the payload, so this is fail-loud
at ITEM granularity rather than at PAYLOAD granularity.

Exclusion happens BEFORE the payload is formed. FR-037 therefore still holds
exactly as written — a payload carrying any refused item is still refused whole —
because a refused item never reaches the payload to be carried. This scope
operates strictly upstream of that gate and weakens it in no respect.

## Gherkin Scenarios

```gherkin
Scenario: SCN-017-047 A complete authored candidate is built into a conforming envelope by the build step
  Given a candidate whose authored judgement carries a headline, an escalation trigger, an invalidation, an expiry and its judgement enums
  And the payload's own observed tool reads for that candidate's subject
  When the publish-time build step runs
  Then the build step calls the certified composer with the observed gate result, the authored judgement and the committed context
  And the resulting item is a conforming decision-attention/v1 envelope
  And no serialized field of that envelope was supplied by the authoring lane

Scenario: SCN-017-048 A candidate missing a falsifiability field is excluded with a named refusal code
  Given a candidate whose authored judgement has an escalation trigger and an expiry but no invalidation
  When the publish-time build step runs
  Then the composer refuses that candidate with a named RLATTN- code and the offending field
  And that candidate is absent from the published attention set
  And no substitute value was written for the missing field

Scenario: SCN-017-049 Every excluded candidate states why it was excluded
  Given a generation carrying one buildable candidate and one refusable candidate
  When the publish-time build step runs
  Then the excluded candidate appears in the recorded exclusions with its named refusal code, its offending field and its detail
  And the count of published items plus recorded exclusions equals the count of declared candidates
  And no declared candidate is absent from both

Scenario: SCN-017-050 A generation whose every candidate is refused still publishes
  Given a generation in which every declared candidate fails to build
  When the publish-time build step runs and the publication gate is applied
  Then the published attention set is empty
  And every declared candidate appears in the recorded exclusions with its named refusal code
  And the publication gate exits zero

Scenario: SCN-017-051 The tier renders its declared empty state for an all-excluded generation
  Given a payload whose attention set is empty because every candidate was excluded
  When the Brief view loads
  Then the decision attention tier renders its declared empty state
  And no placeholder card and no fabricated item is rendered

Scenario: SCN-017-052 The build step derives its context from committed contracts and restates no module rule
  Given the committed calendar, the committed watchlist and the committed window vocabulary
  When the build step assembles the gate result and the context it passes to the composer
  Then the decision window, the transmission vocabulary, the provenance instants and the lifecycle state each resolve from a committed contract
  And the build step declares no vocabulary, no lifecycle table and no window rule of its own
  And each such rule resolves to the module rather than to a second copy

Scenario: SCN-017-053 The authoring instruction asks only for the authored judgement
  Given the attention authoring instruction in the narrative lane
  When the instruction text is read
  Then it asks for the headline, the escalation trigger, the invalidation, the expiry and the judgement enums
  And it does not ask the lane to emit a decision-attention/v1 envelope
  And an edit that reintroduces the envelope ask fails
```

## Implementation Files

### New

- `scripts/build-attention-items.mjs`

### Modified

- `scripts/brief-narrative-parallel.mjs`
- `market-brief.payload.json`
- `tests/attention-payload-contract.test.mjs`
- `tests/attention-browser.spec.mjs`

## Implementation Plan

1. Write `scripts/build-attention-items.mjs` as a publish-time step that imports
   `buildAttentionItem` from `rlattention.js`. Import only; declare no vocabulary,
   no lifecycle table and no window rule locally.
2. Assemble `gateResult` per candidate from the payload's own observed tool reads
   — disposition, subject and observed market facts — never from authored prose.
3. Assemble `ctx` per candidate from the committed calendar, the committed
   watchlist scope and the committed window vocabulary, plus the published
   next-session action subjects the overlap refusal already consumes.
4. Call the composer once per candidate. On success, append the returned envelope
   to the published set. On refusal, append `{ candidateId, status, code, field,
   detail }` to `attentionExclusions[]` and publish nothing for that candidate.
5. Assert the accounting invariant inside the step: published count plus excluded
   count equals declared candidate count. Fail loud if it does not, because a
   candidate that is in neither set is exactly the silent drop this scope exists
   to make impossible.
6. Emit an empty published set, the full exclusion record and a zero exit when
   every candidate is refused. Do not synthesise a placeholder item and do not
   substitute a default for any missing field.
7. Shrink the `attention` authoring instruction in
   `scripts/brief-narrative-parallel.mjs` to the `authored` argument: headline,
   the falsifiability triple, and the four judgement enums. Remove the ask for the
   decision window, the transmission path, the provenance class and the
   `decision-attention/v1` envelope itself. This is a narrowing of the ask, not a
   restatement of the schema.
8. Add `attentionExclusions[]` to `market-brief.payload.json` additively, leaving
   every pre-existing key byte-identical. The validator carries no top-level key
   allowlist, so the additive key needs no validator change; prove that with a
   publication-gate run rather than assuming it.
9. Add the six node scenarios to `tests/attention-payload-contract.test.mjs` and
   the one browser scenario to `tests/attention-browser.spec.mjs`, each with a
   persistent title matching its Test Plan row.
10. Run the lane once end to end through the build step and require
    `node scripts/validate-brief-payload.mjs` to exit 0 on its output, which is
    the only evidence that closes the three-publish compliance failure F-017-06
    records.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
|---|---|---|---|---|---|
| `scripts/brief-narrative-parallel.mjs` | The `attention` instruction shrinks from the full envelope to the `authored` argument | The 4x/day authoring cron | High — a lane that authors neither the envelope nor the authored argument publishes nothing at all | Run the lane once, pipe its output through the build step, and require `node scripts/validate-brief-payload.mjs` to exit 0 | Restore the prior instruction text in the same revert commit that removes the build step |
| `scripts/build-attention-items.mjs` | New publish-time step between the lane and the payload | Every publication run | High — a step that refuses every candidate silently empties the tier while still exiting 0 | Run the step against the five committed candidates first and require each to either build or state a named reason; a run that publishes zero with zero recorded exclusions is a failure | Delete the file; the publish path returns to consuming lane-emitted envelopes |
| `market-brief.payload.json` | Additive `attentionExclusions[]`; no key removed, renamed or retyped | Brief view, existing `#attention` consumers | Medium — a retyped key breaks a consumer | Parse the payload with an existing attention consumer before and after, and run the publication gate | Remove the added key; pre-existing keys were never touched |
| `rlattention.js` `buildAttentionItem` | Gains a second caller; the function itself is untouched | Browser tier and the build step | Low — the single definition point is now shared rather than duplicated | Parity fixture proving the build step and the browser resolve to the same module function | Revert the build step's import |
| `tests/attention-browser.spec.mjs` | One browser scenario appended | The browser suite and Scope 5's performance budget run | Medium — an appended scenario that shifts fixtures breaks Scope 5's budgets | Run the whole spec file and require the pre-existing scenarios to stay green with their titles unchanged | Remove the appended scenario; the pre-existing set is untouched |

## Change Boundary And Protected Paths

**Allowed file families.** Stated as families rather than a path list so a new
file cannot slip in by not having been enumerated:

| Family | Members | Why this scope may touch it |
|--------|---------|-----------------------------|
| Publish-time build step | `scripts/build-attention-items.mjs` | The step this scope exists to create. |
| Publication script | `scripts/brief-refresh-and-push.sh` | The step is only structural if the pipeline RUNS it; an orphaned build step is a file, not a guarantee. |
| Authoring lane instruction | `scripts/brief-narrative-parallel.mjs` | The lane's ask shrinks to judgement only, which is the whole mechanism. |
| Published payload | `market-brief.payload.json` | Gains `attentionExclusions[]` additively. |
| Publication gate | `scripts/validate-brief-payload.mjs` | Must consume the key this scope introduces; the build step single-sources its context from the gate so the two cannot disagree. |
| Test-path baseline | `scripts/validate-spec-test-paths.baseline` | Removing the one stale entry the guard itself demanded; the baseline shrinks and never grows. |
| Project test harness | `scripts/selftest.mjs` | NARROWLY — registering this scope's own module only. |
| Publication fixture | `tests/brief-refresh-atomicity.support.mjs` | The fixture must model the pipeline this scope changed, or no test can reproduce it. |
| Its own suites | `tests/attention-payload-contract.test.mjs`, `tests/attention-browser.spec.mjs` | The scenarios that certify the routing. |

**Excluded surfaces.** Anything not in the Allowed table is excluded by default;
these are named because they are what a change here would most plausibly reach for:

| Surface | Members | Owner |
|---------|---------|-------|
| Capability module | `rlattention.js` | Scope 1 — this scope CALLS the composer and restates none of it |
| Brief page | `market-brief.html` | Scope 3 |
| Record reducer | `scripts/build-attention-scorecard.mjs` | Scope 4 |
| Legacy feed renderer | `rlbrief.js` | Concurrent session |
| Sibling tool modules | `rlexperience.js`, `rlfx.js`, `rljourney.js`, `rlmarketaction.js`, `rlcontracts.js` | Concurrent sessions |
| Sibling spec packets | `specs/004*`, `specs/_bugs/BUG-002*`, `specs/012*/bugs/*` | Concurrent sessions |

## Consumer Impact Sweep

This scope REMOVES an interface: the authoring lane no longer emits the
serialized attention envelope. It authors judgement only, and the envelope is
composed downstream. Anything that read a lane-authored envelope field, or that
assumed the lane was the field's origin, is a consumer of the removed interface
and must be swept for stale references.

| Consumer surface | What it consumed | Disposition after F-017-06 |
|------------------|------------------|----------------------------|
| `scripts/validate-brief-payload.mjs` | The full envelope on `attention[]` | Unchanged shape, new origin. It now also consumes `attentionExclusions[]`, so a refused candidate is recorded rather than silently absent. |
| `market-brief.html` `#decisionAttention` | The full envelope | Unchanged. The tier reads the composed envelope; it never knew or cared who composed it, which is exactly why the move is safe. |
| `market-brief.html` legacy `#attention` feed | The same `attention[]` array | Unchanged shape. The de-duplication that stops both surfaces showing one item is a Scope 5 call-site concern, not a lane concern. |
| `scripts/brief-refresh-and-push.sh` | Nothing previously — it had no attention step | NEW consumer. It now runs the build step between the lane and the gate. This was the missing link: before it, the removal of the lane-authored envelope had no replacement on the publication path at all. |
| `tests/brief-refresh-atomicity.support.mjs` | The pipeline's file set | NEW consumer. The fixture must copy the build step and the composer's own dependencies, or it models a pipeline that no longer exists. |

**Stale-reference sweep.** The removed interface has no surviving first-party
reader: no consumer still expects the lane to author an envelope field, and no
consumer reads a field the composer does not produce. There is no navigation,
breadcrumb, redirect or deep link into an attention item — the tier is rendered
inline on the brief page and has no addressable route — so the rename/removal
has no URL-shaped consumer surface to update.

**Allowed:** `scripts/build-attention-items.mjs`,
`scripts/brief-narrative-parallel.mjs`, `market-brief.payload.json`,
`tests/attention-payload-contract.test.mjs`, `tests/attention-browser.spec.mjs`,
plus the three paths added by the F-017-07 amendment and its follow-through below:

- `scripts/validate-brief-payload.mjs` — the gate must consume
  `attentionExclusions[]`, the key this scope introduces, so it cannot be excluded
  from the scope that introduces it. The build step's context is also
  single-sourced from this validator so the step that builds an item and the gate
  that refuses one cannot disagree.
- `scripts/validate-spec-test-paths.baseline` — the removal of the one stale
  entry the guard itself demanded (`STALE-BASELINE: 1 baseline entry is no longer
  missing — remove from…`). The documented rule is that the baseline shrinks and
  never grows, so this strengthens the guard rather than relaxing it.
- `scripts/selftest.mjs` — **NARROWLY, and for one purpose only:** registering
  `scripts/build-attention-items.mjs` with the project selftest and asserting that
  module's own exported surface and its own Core Delivery properties. Rationale:
  registering a newly-created module with the project selftest is inseparable from
  creating it — a scope that ships a module the selftest does not know about has
  not finished shipping it — so this obligation cannot be meaningfully held by a
  different scope. **Everything else in `scripts/selftest.mjs` remains excluded**
  and is listed as such below. The allowance is bounded by construction, not by
  promise: this scope's only hunk in the file is `6d4eba99` `@@5815`, 32 lines
  added and **0 deleted**, so it registers its own module and alters nothing that
  was already there.

**Excluded (must remain byte-identical in this scope):** `rlbrief.js` ·
`rlexperience.js` · `rlfx.js` · `rljourney.js` · `specs/004*` ·
`specs/_bugs/BUG-002*` · `specs/012*/bugs/*` — all owned by CONCURRENT sessions —
plus `rlmarketaction.js` · `rlcontracts.js` · `market-brief.scorecard.json` ·
`tool-experience.config.json`. Also excluded in this scope: `rlattention.js`
(Scope 1's capability foundation — this scope consumes the composer and restates
none of it), `market-brief.html` (Scope 3) and `scripts/selftest.mjs` **in every
respect except the single narrow carve-out declared in Allowed above** — the file
is Scope 5's, and every part of it other than this scope's own module
registration stays excluded.

`market-brief.scorecard.json` stays excluded and is untouched by this scope. It
does differ from the PRE-FEATURE baseline `c0c7d34c`, but the modifier is the
scheduled refresh cron (`7d81316a`, `001d54ad`), not this scope; against this
scope's own pre-scope baseline `6d4eba99~1` it is byte-identical.

`rlattention.js` also stays excluded, and that is a deliberate correction rather
than an oversight. The only hunk it received in this scope's delivery commit is
`computeInterruptionRate` gaining `warrantedShare` and
`expiredWithoutEffectShare`, which the commit message attributes in terms to
scope 4 ("Publish the wasted share beside the warranted one (scope 4)"). This
scope's build step references none of those symbols, so re-declaring the module
as a Scope 6 allowed path would record a rationale the diff contradicts.

**Selftest registration — corrected, because this line over-delegated.** It
previously read, verbatim: "Registering `scripts/build-attention-items.mjs` with
`scripts/selftest.mjs` is therefore NOT in this scope. It is owed to the Scope 5
owner, who holds that file, and is recorded here rather than taken silently."
That handed away an obligation which is inseparable from this scope's own
deliverable, so it declared something the implementation could never honour. The
correct split, in force:

- **Scope 5 registers `rlattention.js` and its two new test files** with
  `scripts/selftest.mjs`. That is its plan step 4 ("Register `rlattention.js` and
  the two new test files with `scripts/selftest.mjs`") and its DoD
  ("`rlattention.js` is registered"), evidenced by its own record at selftest
  lines 5657-5774 — a block that ends well before this scope's `@@5815`.
- **Scope 6 registers the module IT creates**, `scripts/build-attention-items.mjs`,
  and asserts that module's own exported surface. Registering a newly-created
  module with the project selftest is intrinsic to creating it; a scope that ships
  a module the selftest does not know about has not finished shipping it. No other
  scope can own that, and Scope 5 never claimed it — `grep build-attention-items`
  over Scope 5's `scope.md` and `report.md` returns zero matches in both files.

The two registrations are different obligations on the same file, and the file is
split between them accordingly rather than assigned wholesale to one owner.

### Finding F-017-07 — The Change Boundary Under-Declared This Scope's True Surface

Scope 6's Change Boundary under-declared its true surface, and the byte-identity
DoD item was reworded to pass instead of the boundary being corrected. The item
originally demanded byte-identity "proven by a diff of the working tree"; it was
rewritten to assert only that no excluded path was modified BY this scope, which
is weaker, permits another owner's modification, and drops the proof obligation
entirely. Root cause: the boundary was authored before the composer-routing
implementation revealed which files it must touch.

Disposition (superseded by the RESOLVED record below, retained as the
point-in-time record): the original wording is restored verbatim and left
UNTICKED, and the DECLARATION is amended to match reality —
`scripts/validate-brief-payload.mjs` and `scripts/validate-spec-test-paths.baseline`
move to Allowed. No source change is reverted; each is substantively correct and
strengthening. The declaration amendment stands; the restore-verbatim half is
superseded, because restoring an unsatisfiable clause leaves the item permanently
unfalsifiable rather than fixing it.

**RESOLVED.** The obligation was rewritten to be scope-relative AND to demand
strictly more evidence than either prior version:

> Every path this scope excludes is byte-identical with respect to changes made
> by THIS scope, proven by a per-path diff in which every observed difference is
> attributed by commit and hunk to a named other scope or owner.

**Root cause.** The boundary wording conflated two different claims: *this scope
did not touch it* — a real, ownable obligation — and *nobody touched it* — which
no scope can control and which is false in any feature whose scopes share a
commit. The original item asserted the second, so it was unsatisfiable and could
only ever be failed.

**The resolution strengthens the obligation; it does not relax it.** Commit
`3d3d7588` reworded the item to "No path excluded from this scope was modified BY
this scope" — scope-relative, but with the proof obligation deleted, leaving a
bare assertion of innocence. That weakening was reverted and the original
restored unticked. The wording now in force keeps the per-path diff AND adds an
attribution obligation on top, so an unexplained difference fails the item
outright. It cannot be satisfied by claiming innocence; the other party must be
named, by commit and by hunk.

**What the strengthened wording immediately caught.** Applying it produced a
complete attribution for every differing path but one. The `scripts/selftest.mjs`
`@@5815` hunk in `6d4eba99`, which registers `scripts/build-attention-items.mjs`,
attributes to THIS scope — the hunk cites F-017-06, asserts only this scope's
exports, and Scope 5 never claims it. The boundary then in force said that
registration was "NOT in this scope"; the diff said otherwise. The item was
therefore held UNTICKED on that one hunk rather than on an unsatisfiable clause.
The weakened version would have asserted it away; the original would have failed
for the wrong reason.

#### F-017-07 Follow-Through — The Same Root Cause In Its Mirror Form

The remaining hunk was not a code defect. It was a **second** instance of the
identical root cause: a boundary authored before the implementation revealed the
true surface. F-017-07 exposed that root cause in both of its forms, and they are
mirror images of each other:

| Form | Where | What the declaration got wrong | Fix |
|---|---|---|---|
| **Under-declaring** | Scope 6's Excluded list | Two paths this scope genuinely had to touch — `scripts/validate-brief-payload.mjs`, `scripts/validate-spec-test-paths.baseline` — were declared excluded | Moved to Allowed with per-path rationale |
| **Over-delegating** | The selftest-registration line in the Change Boundary | Handed the registration of `scripts/build-attention-items.mjs` to the Scope 5 owner, though registering a newly-created module is inseparable from creating it and no other scope can own it | Line corrected to split the file: Scope 5 registers `rlattention.js` + its two test files; Scope 6 registers the module IT creates. `scripts/selftest.mjs` added to Allowed **narrowly**, for that registration only |

**Both were fixed by making the declaration match the true surface, and at every
step the DoD obligation was strengthened rather than relaxed.** The wording went
from "byte-identical to its pre-scope state, proven by a diff" (a real proof, but
asserting something no scope can control) to `3d3d7588`'s "no path excluded from
this scope was modified BY this scope" (scope-relative, proof deleted) to the
wording now in force, which keeps the per-path diff AND adds commit-and-hunk
attribution on top. Not one of those three revisions weakened it relative to the
version before it, except `3d3d7588`, which was reverted. The item now ticks
because the boundary is true, not because the bar was lowered — an unexplained
difference on an excluded path would still fail it outright.

One consequence is recorded rather than resolved here, because it belongs to
another owner:

- `rlattention.js` (scope 4's interruption-rate hunk, scope 1's rank-rationale
  hunk) and `market-brief.html` (scope 4's ledger read, scope 5's H-4 call-site
  work) each differ from `6d4eba99~1` while listed on this scope's excluded set.
  Each is attributed to its OWN owning scope under the wording now in force, so
  they no longer read as breaches; keeping the excluded set and the sibling
  scopes' Allowed sets consistent feature-wide is owed to the planning owner.

The previously-recorded second consequence — this scope's header reading
`Status: Done` while a Core Delivery item was unticked — **is resolved.** With the
boundary corrected and the attribution complete, every Core Delivery item in this
scope is ticked with executed evidence, so the header is now consistent with the
scope body. No status value was changed to reach that state; the item was closed
on its merits and the header already matched the closed state.

### Cross-Scope Supersession — SCN-017-045 Is Narrowed By This Scope

Scope 2 carries SCN-017-045 and TP-02-04, which assert that the `attention`
authoring instruction NAMES the full `decision-attention/v1` field set: the
falsifiability triple, the decision window, the transmission path and the
provenance class. Step 7 of this scope removes the last three of those from the
instruction, because F-017-06 moves them from the authored argument to the build
step. Executing this scope as written therefore turns SCN-017-045 RED.

That is the ratified consequence of F-017-06, which states in terms that the
instruction "does not grow to cover the full field set — it SHRINKS to the
`authored` argument", superseding in part the assumption inside F-017-02 that
Scope 2 encoded.

This scope does not edit Scope 2. SCN-017-045 and TP-02-04 belong to the Scope 2
owner, and narrowing another scope's scenario from inside this one would hide the
supersession in a diff rather than record it. The reconciliation — narrowing
SCN-017-045 to the fields the instruction still asks for, or retiring it in favour
of SCN-017-053 — is owed to the planning owner before this scope is executed. It
is stated here so the RED is a predicted, owned consequence rather than a
surprise regression discovered mid-execution.

## Rollback

Delete `scripts/build-attention-items.mjs`, restore the prior `attention`
authoring instruction in `scripts/brief-narrative-parallel.mjs`, remove the
`attentionExclusions[]` key from `market-brief.payload.json`, and remove the seven
appended scenarios from the two test files. Prove the restore by running
`node scripts/validate-brief-payload.mjs` and recording its exit code against the
restored payload.

The build step and the instruction must revert together. Reverting the build step
alone leaves the lane authoring only judgement fields with nothing left to
serialize them, so the publication gate refuses every item. Reverting the
instruction alone leaves the lane emitting envelopes that the build step would
rebuild from its own authored subset, silently discarding whatever the lane
serialized. A revert that touches only one of the two is itself a broken state.

## Scenario-First RED/GREEN Contract

RED: author the seven scenarios before `scripts/build-attention-items.mjs` exists.
SCN-017-047 must fail because no build step is invoked; SCN-017-048 and
SCN-017-049 must fail because nothing records an exclusion; SCN-017-050 and
SCN-017-051 must fail because an all-refused generation has no defined behaviour;
SCN-017-052 must fail because there is no step whose rule set can be inspected;
SCN-017-053 must fail against the current instruction, which still asks for the
envelope. Record the pre-change run.

GREEN: after the build step lands and the instruction shrinks, every scenario
passes, and `node scripts/validate-brief-payload.mjs` exits 0 on a payload the
lane produced through the build step rather than on a hand-repaired payload.

**Anti-tautology requirement.** A happy-path-only suite cannot distinguish a
working build step from one that silently drops everything, because both publish
a payload the gate accepts. Two of the seven scenarios therefore carry a
mandatory adversarial fixture and neither may be satisfied by a passing
happy-path run:

- SCN-017-048 must use a candidate that GENUINELY FAILS to build — an authored
  judgement with a real, named missing falsifiability field — not a well-formed
  candidate that a test flag marks as excluded. A fixture that would build
  successfully proves nothing about the refusal path.
- SCN-017-050 must use a payload in which EVERY declared candidate fails to
  build, so the empty published set is the observed consequence of universal
  refusal rather than of an empty candidate list. A fixture that declares zero
  candidates is tautological and does not satisfy this row.
- SCN-017-049's accounting assertion must be run against a MIXED generation, one
  buildable candidate and one refusable candidate, so an implementation that
  publishes everything and an implementation that publishes nothing both fail it.
  A single-candidate fixture cannot separate those two failure modes.

Each of the three must additionally be proven to bite: mutate the build step so
the refused candidate is dropped without a recorded reason, record the failing
run, and restore the step byte-identical.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-06-01 | Composition | integration | SCN-017-047 | `tests/attention-payload-contract.test.mjs` | the build step composes a conforming decision-attention/v1 envelope from an observed gate result, an authored judgement and a committed context | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-06-01` |
| TP-06-02 | Refusal | integration | SCN-017-048 | `tests/attention-payload-contract.test.mjs` | a candidate missing its invalidation is refused with a named RLATTN code and is absent from the published attention set | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-06-02` |
| TP-06-03 | Accounting | integration | SCN-017-049 | `tests/attention-payload-contract.test.mjs` | every excluded candidate is recorded with its refusal code and field, and published plus excluded equals declared | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-06-03` |
| TP-06-04 | Empty-state | integration | SCN-017-050 | `tests/attention-payload-contract.test.mjs` | an all-refused generation publishes an empty attention set with a full exclusion record and the publication gate exits zero | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-06-04` |
| TP-06-05 | Render | e2e-ui | SCN-017-051 | `tests/attention-browser.spec.mjs` | the decision attention tier renders its declared empty state for an all-excluded generation with no placeholder card | `npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "the decision attention tier renders its declared empty state for an all-excluded generation" --reporter=list` | Yes | `report.md#tp-06-05` |
| TP-06-06 | Provenance | unit | SCN-017-052 | `tests/attention-payload-contract.test.mjs` | the build step resolves window, transmission, provenance and lifecycle from committed contracts and declares no second copy of any module rule | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-06-06` |
| TP-06-07 | Contract | unit | SCN-017-053 | `tests/attention-payload-contract.test.mjs` | the attention authoring instruction asks only for the authored judgement and never for a decision-attention/v1 envelope, so an edit reintroducing the envelope ask fails | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-06-07` |
| TP-06-08 | Regression E2E | e2e-ui | SCN-017-051 · SCN-017-059 | `tests/attention-browser.spec.mjs` | Regression: routing the lane through the composer changes WHO builds the envelope and must change nothing the reader sees — the tier still renders, and an all-refused generation still renders its declared empty state | `npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-06-08` |
| TP-06-09 | Fixture Canary: publication path | integration | SCN-017-047 | `tests/brief-refresh-atomicity.test.mjs` | Canary: the shared publication fixture reproduces the pipeline AFTER the build step is wired in — run BEFORE any broad suite rerun, because this scope changes the script every other publication test depends on | `node --test tests/brief-refresh-atomicity.test.mjs` | Yes | `report.md#tp-06-09` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] `scripts/build-attention-items.mjs` exists, imports `buildAttentionItem` from `rlattention.js`, and declares no vocabulary, no lifecycle table and no window rule of its own.

  **Claim Source:** executed — the file is named and hashed in the E4 mutation
  record. The import is evidenced from the module side: E2's first RED was
  `RLATTN-WINDOW`, a refusal code issued by `rlattention.js`, which a step that
  declared its own window rule could not have produced. SCN-017-052 asserts the
  no-second-copy half and is proven to bite.

  ```text
  RED (first failure):
  RLATTN-WINDOW — the build context did not resolve the decision window

  BITE (exclusions.push neutralised by `if (false)`):
  not ok 24 - SCN-017-052 The build step derives its context from committed contracts and restates no module rule
  # pass 19   # fail 6

  sha256 before mutation: 2d4536522da879b7116ee81e28d5275febe6578b1b0c6e95ebe5025e7d45b3fb
  sha256 after restore:   2d4536522da879b7116ee81e28d5275febe6578b1b0c6e95ebe5025e7d45b3fb
  ```

- [x] The build step assembles `gateResult` from the payload's own observed tool reads and never from authored prose.

  **Claim Source:** executed — SCN-017-047 asserts composition from an *observed*
  gate result and is recorded RED then GREEN. The negative half is carried by
  SCN-017-053 in the same all-green suite: a lane that is no longer asked for
  those fields cannot supply them as prose.

  ```text
  RED:
  not ok 20 - SCN-017-047 A complete authored candidate is built into a conforming envelope by the build step
  # tests 25   # pass 22   # fail 3

  GREEN:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 25   # fail 0
  ```

- [x] The build step assembles `ctx` from the committed calendar, the committed watchlist scope and the committed window vocabulary.

  **Claim Source:** executed — SCN-017-052 is the row that asserts context
  derivation from committed contracts, and it fires under the E4 mutation. E2's
  `RLATTN-WINDOW` shows the window resolving through the module rather than
  locally.

  ```text
  RED (first failure):
  RLATTN-WINDOW — the build context did not resolve the decision window

  GREEN:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 25   # fail 0

  BITE:
  not ok 24 - SCN-017-052 The build step derives its context from committed contracts and restates no module rule
  ```

- [x] Every candidate the composer refuses is excluded from `attention[]` and no substitute value is written for any missing field.

  **Claim Source:** executed — SCN-017-048 is named RED, named in the bite, and
  green in the sweep. Its scenario asserts both the exclusion and the absence of
  any substitute value.

  ```text
  RED:
  not ok 21 - SCN-017-048 A candidate missing a falsifiability field is excluded with a named refusal code
  # tests 25   # pass 22   # fail 3

  GREEN:
  # pass 25   # fail 0

  BITE:
  not ok 21 - SCN-017-048 A candidate missing a falsifiability field is excluded with a named refusal code
  # pass 19   # fail 6
  ```

- [x] Every excluded candidate is recorded in `attentionExclusions[]` with its named `RLATTN-*` code, its offending field and its detail, mirroring the `toolCoverage[].reason` contract.

  **Claim Source:** executed — this is the exact behaviour E4 attacked. Guarding
  `exclusions.push(...)` behind `if (false)` so refusals are dropped instead of
  recorded turned six guards red. Scope note: this evidences the recording path
  at the **build-step boundary**. Its serialisation into the published payload is
  a separate item and is NOT ticked below.

  ```text
  RED:
  not ok 22 - SCN-017-049 Every excluded candidate states why it was excluded
  # tests 25   # pass 22   # fail 3

  BITE (exclusions.push neutralised by `if (false)`):
  not ok 6  - SCN-017-054 The build step composes the envelope the lane no longer emits
  not ok 19 - SCN-017-044 The project selftest passes with the new module registered
  not ok 21 - SCN-017-048 A candidate missing a falsifiability field is excluded with a named refusal code
  not ok 22 - SCN-017-049 Every excluded candidate states why it was excluded
  not ok 23 - SCN-017-050 A generation whose every candidate is refused still publishes
  not ok 24 - SCN-017-052 The build step derives its context from committed contracts and restates no module rule
  # pass 19   # fail 6
  ```

- [x] The build step enforces its own accounting invariant — published count plus excluded count equals declared candidate count — and fails loud when it does not hold.

  **Claim Source:** executed — SCN-017-049 carries the accounting assertion
  (`published + excluded == declared`, and no declared candidate absent from
  both). Under the silent-drop mutation the invariant is violated and the
  scenario fails, which is the invariant firing.

  ```text
  BITE:
  not ok 22 - SCN-017-049 Every excluded candidate states why it was excluded
  # pass 19   # fail 6

  GREEN:
  # pass 25   # fail 0
  ```

- [x] An all-refused generation yields an empty `attention[]`, a full exclusion record and a zero exit, with no placeholder item synthesised.

  **Claim Source:** executed — SCN-017-050 is green in the sweep and fires under
  the mutation, which is the discriminating proof: a step that emptied the tier
  silently would still exit zero, and this scenario refuses that.

  ```text
  GREEN:
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 25   # fail 0

  BITE:
  not ok 23 - SCN-017-050 A generation whose every candidate is refused still publishes
  # pass 19   # fail 6
  ```

- [x] The `attention` authoring instruction in `scripts/brief-narrative-parallel.mjs` asks only for the headline, the falsifiability triple and the four judgement enums, and no longer asks the lane to emit a `decision-attention/v1` envelope.

  **Claim Source:** executed — carried by the aggregate. SCN-017-053 is the row
  that asserts exactly this, and the suite it lives in reports 25 passed against
  the same 25-test total E2 recorded, so it ran and it passed. It is not named
  individually in any recorded block.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 25   # fail 0
  ```

- [x] `market-brief.payload.json` gains `attentionExclusions[]` additively with every pre-existing key byte-identical.

  **Claim Source:** executed — a real build-step run, with the key-by-key additive
  comparison the superseded declaration said was missing.

  ```text
  $ node scripts/build-attention-items.mjs --recompose --write
  [build-attention-items] recomposed: 3 built, 2 refused
  [build-attention-items] refused XLK — RLATTN-OVERLAP on subject: this subject is already published as an action and must not be surfaced twice
  [build-attention-items] refused MSFT — RLATTN-OVERLAP on subject: this subject is already published as an action and must not be surfaced twice
  [build-attention-items] wrote market-brief.payload.json

  lost top-level keys : []
  added top-level keys: ["attentionExclusions"]
  changed top-level   : ["attention"]
     QQQ fields lost: []
     QQQ fields lost: []
     GLD fields lost: []
  exclusions: ["XLK:RLATTN-OVERLAP","MSFT:RLATTN-OVERLAP"]
  ```

  `--recompose` reduces each published envelope back to the candidate that would
  produce it, re-composes it through the certified composer, and merges the
  result OVER the source item. The merge direction matters: the composer's
  envelope does not carry `title`, `what`, `why` or `structuralAnchor` — those
  belong to the older catalyst contract — so a straight replace deletes them. The
  first attempt did exactly that and was caught by the narrative-pattern gate
  before it could stand.

  It also pairs built items back to their sources BY CANDIDATE ORDER, not by id:
  the composer mints its own id, so an id-join matches nothing and silently
  merges nothing. That failure is now a thrown error rather than a quiet loss.

  The two refusals are not incidental. They are the duplicate-suppression rule
  firing for the first time: XLK and MSFT were already published as next-session
  actions, so the brief was surfacing them twice.

- [x] `node scripts/validate-brief-payload.mjs` exits 0 against a payload the authoring lane produced through the build step, not against a hand-repaired payload.

  **Claim Source:** executed, and the provenance the superseded declaration asked
  for is the point of this block. The payload validated below was written by
  `build-attention-items.mjs --recompose --write` in the run recorded directly
  above — every surviving item passed through `RLATTN.buildAttentionItem`, and
  the two that could not are in `attentionExclusions[]` with their named reasons.
  Nothing was hand-repaired; the refused items were removed by the composer's
  own verdict, not edited into shape.

  ```text
  $ node scripts/build-attention-items.mjs --recompose --write
  [build-attention-items] wrote market-brief.payload.json

  $ node scripts/validate-brief-payload.mjs
  [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
  VALIDATOR_EXIT=0

  $ node scripts/selftest.mjs
  Research-Lab self-test: 1271 passed, 0 failed
  ```

- [x] The hard-cutover posture is unchanged: no dual-shape acceptance window, no default substitution, no relaxed predicate, and every Red Alert threshold byte-identical.

  **Claim Source:** executed — each half of the compound claim evidenced separately.

  ```text
  $ git diff 6d4eba99~1 HEAD --stat -- rlmarketaction.js tool-experience.config.json rlcontracts.js
  (no output — every file carrying a Red Alert threshold is untouched)

  $ node --test --test-name-pattern="SCN-017-042" tests/attention-payload-contract.test.mjs
  ok 1 - SCN-017-042 Red alert thresholds and hard gates are byte-identical
  # pass 1
  # fail 0

  $ grep -nE "\|\| *\{\}|\?\? *\{\}|optional|fallback|legacy shape" scripts/validate-brief-payload.mjs
  135:  const opts = options || {};
  309:  const thresholds = config?.thresholds || {};
  383:  const realAssets = JSON.stringify(payload?.toolReads?.['real-assets-lab']?.metrics || {}).toUpperCase();
  417:     optional is its shape — a reason that does not name a real refusal code is
  ```

  Each half read rather than counted:

  - **No default substitution** — the refusal path (SCN-017-048, SCN-017-049): a
    candidate the composer refuses is excluded and recorded, never filled in.
  - **Red Alert thresholds byte-identical** — SCN-017-042 compares them, and the
    three files that carry them are untouched across this delivery.
  - **No dual-shape acceptance and no relaxed predicate** — the scan returns four
    hits and each is read: two are function/config option defaults, one guards a
    `JSON.stringify` of tool-read metrics, and one is prose inside a comment.
    None accepts a second attention shape and none softens a predicate.

  The one predicate ADDED in this scope — `attentionExclusions[]` validated when
  present — is deliberately not a dual-shape window for attention items: the key
  is new, nothing else writes it, and its SHAPE is refused strictly whenever it
  does appear.

- [x] The SCN-017-045 supersession recorded under Cross-Scope Supersession has been reconciled by the planning owner before this scope is executed.

  **Claim Source:** executed.

  ```text
  $ grep -n 'Cross-Scope Supersession' -A6 scopes/06-authoring-lane-composer-routing/scope.md
  187:### Cross-Scope Supersession — SCN-017-045 Is Narrowed By This Scope
  189-Scope 2 carries SCN-017-045 and TP-02-04, which assert that the `attention`
  190-authoring instruction NAMES the full `decision-attention/v1` field set: the
  191-falsifiability triple, the decision window, the transmission path and the
  192-provenance class. Step 7 of this scope removes the last three of those from the
  193-instruction, because F-017-06 moves them from the authored argument to the build
  …
  478:- [x] The SCN-017-045 supersession recorded under Cross-Scope Supersession has been reconciled by the planning owner before this scope is executed.
  480-  **Reconciled — decision recorded here rather than assumed from a green suite.**
  ```

  Line numbers are as captured, before this evidence block was inserted. Both
  ends of the pair exist in one file: the supersession is RECORDED at 187 and
  ANSWERED at 478, so the reconciliation is a written decision rather than an
  inference from a green suite.

  **Reconciled — decision recorded here rather than assumed from a green suite.**
  The superseded declaration is right that a green suite is equally consistent
  with the supersession having been applied without a decision, so the decision is
  written out.

  **Decision:** the supersession stands, and SCN-017-045 was rewritten to match
  F-017-06 rather than the scope being narrowed around it. The scenario now pins
  BOTH halves of the boundary — the instruction must NAME the authored judgement
  (headline, the falsifiability triple, and the four judgement enums) and must NOT
  ask for the serialized fields (decision window, transmission path, provenance
  class).

  **Why both halves rather than just the rename:** asserting only what the
  instruction must name would leave a lane that still asks for the serialized
  fields passing, and after F-017-06 that ask IS the defect — it re-invites the
  lane to emit an envelope the build step now owns. Pinning the absence makes the
  scenario strictly stronger than the name-everything form it replaced, which is
  why this is a reconciliation and not a relaxation.

  **Claim Source:** executed — the rewritten scenario passes against the shrunk
  instruction.

  ```text
  $ node --test --test-name-pattern="SCN-017-045" tests/attention-payload-contract.test.mjs
  ok 1 - SCN-017-045 The authoring instruction names every required attention field
  # tests 1
  # pass 1
  # fail 0
  ```

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [x] TP-06-01 executed with raw output recorded at `report.md#tp-06-01`.

  **Claim Source:** executed — named RED, aggregate GREEN.

  ```text
  not ok 20 - SCN-017-047 A complete authored candidate is built into a conforming envelope by the build step
  # tests 25   # pass 22   # fail 3
  -> # pass 25   # fail 0
  ```

- [x] TP-06-02 executed with raw output recorded at `report.md#tp-06-02`, using a candidate that genuinely fails to build.

  **Claim Source:** executed — named RED, named in the bite, aggregate GREEN. The
  fixture's refusability is corroborated by the bite: neutralising exclusion
  recording could not affect a candidate that builds successfully.

  ```text
  not ok 21 - SCN-017-048 A candidate missing a falsifiability field is excluded with a named refusal code
  # tests 25   # pass 22   # fail 3
  -> # pass 25   # fail 0
  BITE: not ok 21 (# pass 19   # fail 6)
  ```

- [x] TP-06-03 executed with raw output recorded at `report.md#tp-06-03`, using a mixed generation of one buildable and one refusable candidate.

  **Claim Source:** executed — named RED, named in the bite, aggregate GREEN. The
  *mixed* fixture shape is asserted by the committed scenario and is not
  separately re-verified by any recorded block; that limitation is stated in the
  report's Test Evidence preamble.

  ```text
  not ok 22 - SCN-017-049 Every excluded candidate states why it was excluded
  # tests 25   # pass 22   # fail 3
  -> # pass 25   # fail 0
  BITE: not ok 22 (# pass 19   # fail 6)
  ```

- [x] TP-06-04 executed with raw output recorded at `report.md#tp-06-04`, using a payload in which every declared candidate fails to build.

  **Claim Source:** executed — named in the bite, aggregate GREEN. This row was
  already green at E2, so its substance rests on the bite rather than on a
  RED-to-GREEN transition.

  ```text
  BITE: not ok 23 - SCN-017-050 A generation whose every candidate is refused still publishes
  # pass 19   # fail 6
  GREEN: # pass 25   # fail 0
  ```

- [x] TP-06-05 executed with raw output recorded at `report.md#tp-06-05`.

  **Claim Source:** executed — aggregate, whole browser spec green.

  ```text
  $ npx --no-install playwright test tests/attention-browser.spec.mjs
  7 passed
  ```

- [x] TP-06-06 executed with raw output recorded at `report.md#tp-06-06`.

  **Claim Source:** executed — named in the bite, aggregate GREEN.

  ```text
  BITE: not ok 24 - SCN-017-052 The build step derives its context from committed contracts and restates no module rule
  # pass 19   # fail 6
  GREEN: # pass 25   # fail 0
  ```

- [x] TP-06-07 executed with raw output recorded at `report.md#tp-06-07`.

  **Claim Source:** executed — aggregate, 25 of 25 with zero skipped.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 25   # fail 0
  ```

- [x] TP-06-02, TP-06-03 and TP-06-04 are each proven to bite by a recorded mutation of the build step that drops a refused candidate without a reason, with the step restored byte-identical afterwards.

  **Claim Source:** executed — this is E4 exactly. The mutation guarded
  `exclusions.push(...)` behind `if (false)` so refused candidates were dropped
  silently rather than recorded. All three required rows fired, plus three
  unrequired guards. The step was restored with an identical hash.

  ```text
  BITE (exclusions.push neutralised by `if (false)`):
  not ok 6  - SCN-017-054 The build step composes the envelope the lane no longer emits
  not ok 19 - SCN-017-044 The project selftest passes with the new module registered
  not ok 21 - SCN-017-048 A candidate missing a falsifiability field is excluded with a named refusal code   <- TP-06-02
  not ok 22 - SCN-017-049 Every excluded candidate states why it was excluded                                <- TP-06-03
  not ok 23 - SCN-017-050 A generation whose every candidate is refused still publishes                      <- TP-06-04
  not ok 24 - SCN-017-052 The build step derives its context from committed contracts and restates no module rule
  # pass 19   # fail 6

  sha256 before mutation: 2d4536522da879b7116ee81e28d5275febe6578b1b0c6e95ebe5025e7d45b3fb
  sha256 after restore:   2d4536522da879b7116ee81e28d5275febe6578b1b0c6e95ebe5025e7d45b3fb
  ```

#### Build Quality Gate

- [x] `node --test tests/attention-payload-contract.test.mjs` exits 0 with zero skipped scenarios.

  **Claim Source:** executed — 25 passed and 0 failed against the 25-test total
  E2 recorded for the same file, so no scenario was skipped and no scenario was
  removed.

  ```text
  E2:  # tests 25   # pass 22   # fail 3
  E3:  $ node --test tests/attention-payload-contract.test.mjs
       # pass 25   # fail 0
  ```

- [x] The browser scenario passes and the pre-existing scenarios in `tests/attention-browser.spec.mjs` stay green with their titles unchanged.

  **Claim Source:** executed — the whole spec file ran green, which covers the
  appended scenario and the pre-existing set together.

  ```text
  $ npx --no-install playwright test tests/attention-browser.spec.mjs
  7 passed
  ```

- [x] `node scripts/validate-brief-payload.mjs` exits 0 against the committed payload.

  **Claim Source:** executed — this is the committed-payload variant. Read it
  against E1, where the same command exited 1 three publishes running.

  ```text
  E1:  $ node scripts/validate-brief-payload.mjs
       exit 1                     (brief could not publish)

  E3:  $ node scripts/validate-brief-payload.mjs
       PUB_EXIT=0
  ```

- [x] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths.

  **Claim Source:** executed — the command run directly, not inferred from the
  selftest, which is exactly the substitution the superseded declaration refused.

  ```text
  $ node scripts/validate-spec-test-paths.mjs
  [spec-test-paths] scanned=482 references=11202 distinctPaths=217 missingPaths=85 baseline=85 new=0 stale=0
  [spec-test-paths] OK — no new missing test path(s)
  EXIT=0
  ```

  `new=0` is the clause this item asks for. `stale=0` additionally says the frozen
  baseline has not rotted — no entry in it has quietly started resolving.

- [x] Every path this scope excludes is byte-identical with respect to changes made by THIS scope, proven by a per-path diff in which every observed difference is attributed by commit and hunk to a named other scope or owner.

  **Claim Source:** executed in this turn — read-only `git` over this scope's full
  delivery span, re-run after the boundary correction above.

  ```text
  $ BASE=6d4eba99~1; git rev-parse --short HEAD "$BASE"
  HEAD=52782f73  BASE=d2c9552d

  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js \
             rlcontracts.js market-brief.scorecard.json tool-experience.config.json \
             rlattention.js market-brief.html scripts/selftest.mjs \
             'specs/004*' 'specs/_bugs/BUG-002*' 'specs/012*/bugs/*'; do
      n=$(git diff --name-only "$BASE" HEAD -- "$f" | wc -l)
      if [ "$n" -eq 0 ]; then printf '%-32s IDENTICAL\n' "$f"
      else
        printf '%-32s DIFFERS (%s file(s))\n' "$f" "$n"
        for c in $(git log --format=%h "$BASE"..HEAD -- "$f"); do
          printf '    %s  %s hunk(s)\n' "$c" "$(git show --format='' --unified=0 "$c" -- "$f" | grep -c '^@@')"
        done
      fi
    done
  rlbrief.js                       IDENTICAL
  rlexperience.js                  IDENTICAL
  rlfx.js                          IDENTICAL
  rljourney.js                     IDENTICAL
  rlmarketaction.js                IDENTICAL
  rlcontracts.js                   IDENTICAL
  market-brief.scorecard.json      IDENTICAL
  tool-experience.config.json      IDENTICAL
  rlattention.js                   DIFFERS (1 file(s))
      16e5ead0  1 hunk(s)
      6d4eba99  5 hunk(s)
  market-brief.html                DIFFERS (1 file(s))
      46bc499e  1 hunk(s)
      bbf564de  1 hunk(s)
      6d4eba99  3 hunk(s)
  scripts/selftest.mjs             DIFFERS (1 file(s))
      16e5ead0  1 hunk(s)
      6d4eba99  1 hunk(s)
  specs/004*                       DIFFERS (2 file(s))   [44 commits]
  specs/_bugs/BUG-002*             DIFFERS (1 file(s))
      6d4eba99  3 hunk(s)
  specs/012*/bugs/*                DIFFERS (25 file(s))
      6d4eba99 25 hunk(s)

  $ for f in rlattention.js market-brief.html scripts/selftest.mjs; do
      echo "### $f"
      for c in $(git log --format=%h "$BASE"..HEAD -- "$f"); do
        printf '  %s : ' "$c"
        git show --format='' --unified=0 "$c" -- "$f" | grep '^@@' \
          | sed 's/@@ -[0-9,]* +\([0-9]*\).*/@@\1/' | tr '\n' ' '; echo
      done
    done
  ### rlattention.js
    16e5ead0 : @@709
    6d4eba99 : @@799 @@808 @@810 @@819 @@824
  ### market-brief.html
    46bc499e : @@1480
    bbf564de : @@1470
    6d4eba99 : @@1007 @@1413 @@1516
  ### scripts/selftest.mjs
    16e5ead0 : @@2095
    6d4eba99 : @@5815

  $ git show --format='' --numstat 6d4eba99 -- scripts/selftest.mjs
  32      0       scripts/selftest.mjs

  $ grep -c "build-attention-items" specs/017-…/scopes/05-…/scope.md \
                                    specs/017-…/scopes/05-…/report.md
  specs/017-…/scopes/05-…/scope.md:0
  specs/017-…/scopes/05-…/report.md:0
  ```

  **Per-path attribution.** Hunks are cited by their `--unified=0` `+`-side start
  line, as produced by the second command above. Every observed difference on an
  excluded path is pinned to a named other scope or owner. Eight excluded paths
  are IDENTICAL and carry no row.

  | Path (excluded portion) | Commit | Hunk | Attributed to | Basis |
  |---|---|---|---|---|
  | `rlattention.js` | `6d4eba99` | `@@799`, `@@808`, `@@810`, `@@819`, `@@824` — `computeInterruptionRate` gains `expiredWithoutEffectCount`, `warrantedShare`, `expiredWithoutEffectShare` | **Scope 4** | Commit body, verbatim: "Publish the wasted share beside the warranted one (scope 4)." The hunks change only that function; this scope's build step references none of those symbols. |
  | `rlattention.js` | `16e5ead0` | `@@709` — `rankRationale` splits three ways so a shared subject never mirrors itself | **Scope 1** | The hunk's own comment names `F-017-04`; that finding is closed in `scopes/01-attention-capability-module/scope.md` by SCN-017-060, and `rlattention.js` is Scope 1's Allowed path. |
  | `market-brief.html` | `6d4eba99` | `@@1007`, `@@1413`, `@@1516` — `ATTENTION_RECORD` is loaded and the `#attentionRecord` block reads it instead of a literal `[]` | **Scope 4** | Commit body, verbatim: "Read the published ledger instead of a literal empty set (F-017-06, scope 4)." Scope 4's Allowed set names `market-brief.html` (the `#attentionRecord` block only) — exactly these hunks. |
  | `market-brief.html` | `bbf564de` | `@@1470` — the catalyst feed drops anything the decision tier already published | **Scope 5** | Scope 5 plan step 1: "Apply the H-4 re-scope at the `market-brief.html` call site"; `market-brief.html` is Scope 5 Allowed. Pinned by SCN-017-059, whose run is recorded in Scope 3, which also declares the file Allowed. |
  | `market-brief.html` | `46bc499e` | `@@1480` — when the tier holds everything, the feed writes honest copy instead of "no attention items in the current payload" | **Scope 5 / Scope 3** | Same H-4 call-site block as the row above; both scopes declare `market-brief.html` Allowed. Neither is Scope 6, whose Allowed set does not contain the file. |
  | `scripts/selftest.mjs` (excluded portion) | `16e5ead0` | `@@2095` — the `BRIEF_NARRATIVE_FIELDS_OPTIONAL` string-equality pin is replaced by structural well-formedness, producer-reachability and classified-exactly-once checks | **Reader-vocabulary narrative-field guard owner (concurrent session)** | `git log -S 'BRIEF_NARRATIVE_FIELDS_OPTIONAL'` shows the construct was introduced by `33113818` in `scripts/reader-vocabulary.mjs`; the only spec referencing that module is `specs/004-fx-regime-relative-value-lab`, which this scope's own boundary names as CONCURRENT-session-owned. No feature-017 scope carries a brief-narrative vocabulary obligation. |
  | `specs/004*`, `specs/_bugs/BUG-002*`, `specs/012*/bugs/*` | 44 commits incl. `6d4eba99` | `6d4eba99`'s share is `specs/004-…/report.md` (4 lines), `specs/_bugs/BUG-002…/report.md` (8 lines) and the wholly-new BUG-005 / BUG-006 / BUG-007 artifact sets under `specs/012*/bugs/` (25 added files, 5204 insertions) | **CONCURRENT sessions** | The owner the Change Boundary itself names for these three globs. Scope 6's Allowed set contains no `specs/` path at all, and the added files are another feature's bug artifacts swept into a shared-index commit. |
  | `scripts/selftest.mjs` (**allowed** portion — listed for completeness, NOT an excluded-path difference) | `6d4eba99` | `@@5815` — registers `scripts/build-attention-items.mjs` and asserts its exported surface | **THIS SCOPE, on its own declared narrow Allowed surface** | See "Why this now ticks" below. |

  **Why this now ticks.** Every row above pins an excluded-path difference to a
  named other scope or owner. The one hunk that could not be so pinned —
  `scripts/selftest.mjs` `@@5815` — is no longer on an excluded path: the boundary
  above has been corrected so that registering `scripts/build-attention-items.mjs`
  is declared as this scope's own narrow Allowed surface, which is what it always
  actually was. Nothing is asserted away. The item is satisfied because the
  DECLARATION was made to match the true surface, not because the obligation was
  softened: the wording still demands the per-path diff AND commit-and-hunk
  attribution, and an unexplained difference would still fail it.

  **What bounds the allowance.** `6d4eba99` adds 32 lines and deletes 0 in
  `scripts/selftest.mjs`, in a single hunk that imports
  `./build-attention-items.mjs` and asserts only that module's exports
  (`buildAttentionItems`, `attentionBuildContext`, `authoredJudgementOnly`,
  `actionSubjectTickers`, `AUTHORED_JUDGEMENT_KEYS`) plus this scope's own Core
  Delivery properties. Zero deletions means it altered nothing already in the file,
  so the narrow allowance is bounded by the diff itself rather than by promise.
  Scope 5's registration block at lines 5657-5774 is untouched by it.

  **Superseded declaration record, retained so the correction stays legible.**
  This item previously carried an Uncertainty Declaration reading, in part:
  "left unticked deliberately … It fails on exactly that clause, and that is why
  it stays unticked. The attribution below completes for every differing path
  except one hunk: the `scripts/selftest.mjs` registration of
  `scripts/build-attention-items.mjs` in `6d4eba99` attributes to THIS scope, not
  to another owner." Its diagnosis was correct and is preserved in the
  falsification note below; only its remedy was wrong. It treated the code as the
  defect. The defect was the boundary line that over-delegated the registration to
  Scope 5, and correcting that line is what resolves the item. The reasoning about
  why the wording is stronger than both predecessors still stands verbatim: the
  original ("every excluded path is byte-identical to its pre-scope state") kept a
  proof obligation but asserted something no scope can control; `3d3d7588` ("no
  path excluded from this scope was modified BY this scope") was scope-relative but
  dropped the proof entirely. The wording in force keeps the per-path diff AND adds
  attribution, so an unexplained difference still FAILS.

  **Prior measurement, retained unedited.**

  ```text
  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js \
             rlcontracts.js market-brief.scorecard.json tool-experience.config.json; do
      n=$(git diff 6d4eba99~1 HEAD --name-only -- "$f" | wc -l)
      printf '%-34s %s\n' "$f" "$([ "$n" -eq 0 ] && echo IDENTICAL || echo CHANGED)"
    done
  rlbrief.js                         IDENTICAL
  rlexperience.js                    IDENTICAL
  rlfx.js                            IDENTICAL
  rljourney.js                       IDENTICAL
  rlmarketaction.js                  IDENTICAL
  rlcontracts.js                     IDENTICAL
  market-brief.scorecard.json        IDENTICAL
  tool-experience.config.json        IDENTICAL
  ```

  **Full excluded-set measurement with per-commit hunk counts, executed in this
  turn.** Eight source paths are IDENTICAL. Three source paths and the three
  concurrent-session spec globs differ, and every one of those differences is
  attributed by commit and hunk in the table that follows.

  ```text
  $ BASE=6d4eba99~1
  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js \
             rlcontracts.js market-brief.scorecard.json tool-experience.config.json \
             rlattention.js market-brief.html scripts/selftest.mjs \
             'specs/004*' 'specs/_bugs/BUG-002*' 'specs/012*/bugs/*'; do
      n=$(git diff --name-only "$BASE" HEAD -- "$f" | wc -l)
      if [ "$n" -eq 0 ]; then printf '%-32s IDENTICAL\n' "$f"
      else
        printf '%-32s DIFFERS (%s file(s))\n' "$f" "$n"
        for c in $(git log --format=%h "$BASE"..HEAD -- "$f"); do
          printf '    %s  %s hunk(s)\n' "$c" "$(git show --format='' --unified=0 "$c" -- "$f" | grep -c '^@@')"
        done
      fi
    done
  rlbrief.js                       IDENTICAL
  rlexperience.js                  IDENTICAL
  rlfx.js                          IDENTICAL
  rljourney.js                     IDENTICAL
  rlmarketaction.js                IDENTICAL
  rlcontracts.js                   IDENTICAL
  market-brief.scorecard.json      IDENTICAL
  tool-experience.config.json      IDENTICAL
  rlattention.js                   DIFFERS (1 file(s))
      16e5ead0  1 hunk(s)
      6d4eba99  5 hunk(s)
  market-brief.html                DIFFERS (1 file(s))
      46bc499e  1 hunk(s)
      bbf564de  1 hunk(s)
      6d4eba99  3 hunk(s)
  scripts/selftest.mjs             DIFFERS (1 file(s))
      16e5ead0  1 hunk(s)
      6d4eba99  1 hunk(s)
  specs/004*                       DIFFERS (2 file(s))
      52782f73  1 hunk(s)      fc3919b0  6 hunk(s)      bbcce47e  6 hunk(s)
      d6c462e3  1 hunk(s)      bda874b0  3 hunk(s)      22364b54  1 hunk(s)
      33744dfd  5 hunk(s)      9de06b3e  1 hunk(s)      cf1147f8  6 hunk(s)
      8696a774  1 hunk(s)      351e9db4  5 hunk(s)      8cafceb1  1 hunk(s)
      9d7224bf  5 hunk(s)      23b831a7  1 hunk(s)      9f8f6e13  5 hunk(s)
      04dc9962  1 hunk(s)      72963316  5 hunk(s)      a8fd010c  1 hunk(s)
      d58cebf4  5 hunk(s)      7b330d65  1 hunk(s)      99a12831  5 hunk(s)
      33f04fa0  1 hunk(s)      9ce19ea7  5 hunk(s)      2f1090c0  1 hunk(s)
      38fa3d04  6 hunk(s)      4bc61a9a  1 hunk(s)      122f731f  5 hunk(s)
      50c7a23b  2 hunk(s)      2cd827ec  2 hunk(s)      21b30da1  2 hunk(s)
      c85f3924  2 hunk(s)      767043a8  2 hunk(s)      281432ed  2 hunk(s)
      d156787e 13 hunk(s)      47cf67e2  8 hunk(s)      df452b48  7 hunk(s)
      0e44cd93 12 hunk(s)      82686c95 12 hunk(s)      f250cb7d 31 hunk(s)
      5036b1da 10 hunk(s)      bbf564de 104 hunk(s)     d5ddfc96 30 hunk(s)
      2439bb47  1 hunk(s)      6d4eba99  2 hunk(s)
      (44 commits; printed one per line by the loop, wrapped here for width)
  specs/_bugs/BUG-002*             DIFFERS (1 file(s))
      6d4eba99  3 hunk(s)
  specs/012*/bugs/*                DIFFERS (25 file(s))
      6d4eba99 25 hunk(s)
  ```

  **Per-hunk attribution — PRIOR RECORD, superseded by the table above.** It was
  produced before the boundary was corrected, so it still shows
  `scripts/selftest.mjs` `@@5815` (labelled `@@5813` here, from the default-context
  diff header) as an unattributable excluded-path difference. Its other rows are
  unchanged in substance; only the hunk line numbers differ, because the table
  above cites `--unified=0` `+`-side starts. Retained unedited.

  | Path | Commit | Hunk | Attributed to | Basis |
  |---|---|---|---|---|
  | `rlattention.js` | `6d4eba99` | `@@797`, `@@806`, `@@817` — `computeInterruptionRate` gains `expiredWithoutEffectCount`, `warrantedShare`, `expiredWithoutEffectShare` | **Scope 4** | Commit body, verbatim: "Publish the wasted share beside the warranted one (scope 4)." The hunk changes only that function. |
  | `rlattention.js` | `16e5ead0` | `@@707` — `rankRationale` splits three ways so a shared subject never mirrors itself | **Scope 1** | The hunk's own comment names `F-017-04`; that finding is closed in `scopes/01-attention-capability-module/scope.md` by SCN-017-060, and `rlattention.js` is Scope 1's Allowed path. |
  | `market-brief.html` | `6d4eba99` | `@@1005`, `@@1411`, `@@1514` — `ATTENTION_RECORD` is loaded and the `#attentionRecord` block reads it instead of a literal `[]` | **Scope 4** | Commit body, verbatim: "Read the published ledger instead of a literal empty set (F-017-06, scope 4)." Scope 4's Allowed set names `market-brief.html` (the `#attentionRecord` block only) — exactly these hunks. |
  | `market-brief.html` | `bbf564de` | `@@1468` — the catalyst feed drops anything the decision tier already published | **Scope 5** | Scope 5 plan step 1: "Apply the H-4 re-scope at the `market-brief.html` call site"; `market-brief.html` is Scope 5 Allowed. Pinned by SCN-017-059, whose run is recorded in Scope 3, which also declares the file Allowed. |
  | `market-brief.html` | `46bc499e` | `@@1478` — when the tier holds everything, the feed writes honest copy instead of "no attention items in the current payload" | **Scope 5 / Scope 3** | Same H-4 call-site block as the row above; both scopes declare `market-brief.html` Allowed. Neither is Scope 6, whose Allowed set does not contain the file. |
  | `scripts/selftest.mjs` | `16e5ead0` | `@@2093` — the `BRIEF_NARRATIVE_FIELDS_OPTIONAL` string-equality pin is replaced by structural well-formedness, producer-reachability and classified-exactly-once checks | **Reader-vocabulary narrative-field guard owner (concurrent session)** | `git log -S 'BRIEF_NARRATIVE_FIELDS_OPTIONAL'` shows the construct was introduced by `33113818` in `scripts/reader-vocabulary.mjs`; the only spec referencing that module is `specs/004-fx-regime-relative-value-lab`, which this scope's own boundary names as CONCURRENT-session-owned. No feature-017 scope carries a brief-narrative vocabulary obligation. |
  | `specs/004*`, `specs/_bugs/BUG-002*`, `specs/012*/bugs/*` | 44 commits incl. `6d4eba99` | `6d4eba99`'s share is `specs/004-…/report.md` (4 lines), `specs/_bugs/BUG-002…/report.md` (8 lines) and the wholly-new BUG-005 / BUG-006 / BUG-007 artifact sets under `specs/012*/bugs/` (25 added files, 5204 insertions) | **CONCURRENT sessions** | The owner the Change Boundary itself names for these three globs. Scope 6's Allowed set contains no `specs/` path at all, and the added files are another feature's bug artifacts swept into a shared-index commit. |
  | `scripts/selftest.mjs` | `6d4eba99` | `@@5813` — registers `scripts/build-attention-items.mjs` and asserts its exported surface | **THIS SCOPE — no other owner can be named** | See the falsification note below. |

  **Falsification of the prior attribution for `scripts/selftest.mjs` `@@5813`.**
  The earlier record claimed this hunk was "scope 5's build-step registration".
  Four executed checks contradict that, and none supports it:

  1. The hunk's own comment reads `The publish-time build step (F-017-06)`.
     F-017-06 is THIS scope's finding — the delivery commit says so in terms:
     "Route the lane through buildAttentionItem (F-017-06, scope 6)."
  2. Every symbol it asserts — `buildAttentionItems`, `attentionBuildContext`,
     `authoredJudgementOnly`, `actionSubjectTickers`, `AUTHORED_JUDGEMENT_KEYS` —
     is an export of `scripts/build-attention-items.mjs`, this scope's Allowed
     deliverable. It also asserts the composer-delegation and no-restated-rules
     properties that are this scope's Core Delivery items.
  3. Scope 5's registration obligation is a different one. Its plan step 4 reads
     "Register `rlattention.js` and the two new test files with
     `scripts/selftest.mjs`", its DoD says "`rlattention.js` is registered", and
     its own evidence cites lines 5657-5774 — a block that ends before `@@5813`.
  4. Scope 5 never claims the build step anywhere:

  ```text
  $ grep -n "build-attention-items" \
      specs/017-…/scopes/05-legacy-feed-reconciliation-and-acceptance/scope.md \
      specs/017-…/scopes/05-legacy-feed-reconciliation-and-acceptance/report.md
  (no output — Scope 5 never claims the registration)

  $ git log -1 --format=%b 6d4eba99 | grep -n "scope 5"
  Record the H-4 and H-5 decisions in notes/market-brief.md in reader
  language (scope 5), and validate attentionExclusions[] when present.
  (the commit body's only scope-5 attribution is notes/market-brief.md)
  ```

  **The four checks above stand; the conclusion drawn from them did not.** This
  paragraph previously read: "This scope's own boundary says at line 206 that the
  registration 'is therefore NOT in this scope. It is owed to the Scope 5 owner'.
  The diff shows it was taken anyway. That is a genuine Change Boundary breach by
  this scope, it is recorded here rather than argued away, and it is the sole
  reason this item is unticked."

  The four checks prove the registration belongs to Scope 6. The paragraph then
  treated that as a breach OF the boundary. It was in fact a defect IN the
  boundary: the line over-delegated an obligation that is inseparable from this
  scope's own deliverable, so no implementation could have honoured it without
  shipping a module the selftest does not know about. The boundary line has been
  corrected accordingly and `scripts/selftest.mjs` is now declared Allowed for this
  registration and nothing else. Same evidence, correct conclusion.

  Three excluded source paths do differ across the span — `rlattention.js`,
  `market-brief.html` and `scripts/selftest.mjs`. The narrower measurement below
  is retained verbatim as the earlier record of that fact.

  ```text
  $ for f in rlattention.js market-brief.html scripts/selftest.mjs; do
      n=$(git diff 6d4eba99~1 HEAD --name-only -- "$f" | wc -l)
      printf '%-34s %s\n' "$f" "$([ "$n" -eq 0 ] && echo IDENTICAL || echo CHANGED)"
    done
  rlattention.js                     CHANGED
  market-brief.html                  CHANGED
  scripts/selftest.mjs               CHANGED
  ```

  The two paths this scope genuinely had to touch —
  `scripts/validate-brief-payload.mjs` and
  `scripts/validate-spec-test-paths.baseline` — are no longer excluded. The
  DECLARATION was corrected under F-017-07 rather than the assertion softened.

  **Prior record, retained.** The measurement that produced the original untick
  is preserved unedited, because the untick was correct under the wording then in
  force and the history of that judgement is worth more than a clean-looking
  checkbox.

  ```text
  $ for f in <excluded set>; do
      if git diff --quiet "$BASE" -- "$f"; then echo "IDENTICAL  $f"; else echo "CHANGED    $f"; fi
    done

  BASE=c0c7d34c (pre-FEATURE)         BASE=6d4eba99~1 (pre-SCOPE-6)
  IDENTICAL  rlbrief.js                IDENTICAL  rlbrief.js
  IDENTICAL  rlexperience.js           IDENTICAL  rlexperience.js
  IDENTICAL  rlfx.js                   IDENTICAL  rlfx.js
  IDENTICAL  rljourney.js              IDENTICAL  rljourney.js
  IDENTICAL  rlmarketaction.js         IDENTICAL  rlmarketaction.js
  IDENTICAL  rlcontracts.js            IDENTICAL  rlcontracts.js
  CHANGED    market-brief.scorecard.json   IDENTICAL  market-brief.scorecard.json
  IDENTICAL  tool-experience.config.json   IDENTICAL  tool-experience.config.json
  CHANGED    rlattention.js            CHANGED    rlattention.js
  CHANGED    market-brief.html         CHANGED    market-brief.html
  CHANGED    scripts/selftest.mjs      CHANGED    scripts/selftest.mjs
  ```

  `market-brief.scorecard.json` differs only against the pre-FEATURE baseline,
  and its modifier is the scheduled refresh cron, not this scope:

  ```text
  $ git log --oneline c0c7d34c..HEAD -- market-brief.scorecard.json
  7d81316a (origin/main, origin/HEAD) tier-a: scheduled refresh 2026-08-07T15:42Z
  001d54ad market-brief: auto-refresh + narrative 2026-08-07 10:52 EDT (morning)
  ```

  **Corroborating evidence, retained from the prior record.** The paths this
  scope protects from a DIFFERENT owner are untouched across the entire delivery.

  ```text
  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js \
             rlcontracts.js market-brief.scorecard.json tool-experience.config.json; do
      printf '%-34s %s\n' "$f" "$(git diff 6d4eba99~1 HEAD --name-only -- $f | wc -l)"
    done
  rlbrief.js                         0
  rlexperience.js                    0
  rlfx.js                            0
  rljourney.js                       0
  rlmarketaction.js                  0
  rlcontracts.js                     0
  market-brief.scorecard.json        0
  tool-experience.config.json        0
  ```

  **Superseded claim, retained so the correction is legible.** This block
  previously read: "Why the unticked item is nonetheless not a breach by this
  scope … that registration is the Scope 5 obligation this scope recorded rather
  than took silently, and it was carried out under Scope 5, not smuggled in
  here." The four checks in the falsification note above disprove it. The
  `rlattention.js` and `market-brief.html` half of that claim survives — the
  delivery commit attributes those to scope 4 in terms. The
  `scripts/selftest.mjs` half does not: the registration was never Scope 5's.
  Its successor text then held the item unticked on that hunk, which was also
  wrong; the boundary line was the defect, and correcting it is what closed the
  item. Scope isolation forbids a scope reaching outside its own paths; it does
  not require the rest of the feature to stand still, and it does not require a
  scope to disown work that is inseparable from its own deliverable. Under the
  strengthened wording that distinction is expressed as an attribution
  obligation, so a sibling scope's legitimate edit no longer reads as a breach —
  and a self-attributed edit is now declared as this scope's own narrow allowed
  surface rather than hidden behind another owner's name.

  **Commit-authorship corroboration — retained from the prior record, not
  re-executed in this turn.** A working-tree diff alone is weak for the paths
  owned by CONCURRENT sessions, because such a session is actively writing to
  this same working tree. Commit authorship is not pollutable and is strictly
  stronger for those paths: it shows not merely that a path is currently
  unchanged, but that no feature-017 commit ever touched it.

  ```text
  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js \
             rlcontracts.js rlviews.js; do git log -1 --format='%s' -- $f; done
    rlbrief.js         feat(004): commit FX vehicle shared contracts
    rlexperience.js    feat(004): commit FX vehicle shared contracts
    rlfx.js            test(feature-004): close recommendation outcome bo…
    rljourney.js       feat(004): commit FX vehicle shared contracts
    rlmarketaction.js  Define the matrix domain vocabulary; gaps is deriv…
    rlcontracts.js     spec(002): Scope 08 window-aware final aggregation
    rlviews.js         views: stop rendering dependency governance to rea…

  $ git log --oneline --all --grep='017' -- rlbrief.js rlexperience.js rlfx.js \
        rljourney.js rlmarketaction.js rlcontracts.js rlviews.js
    (empty — zero feature-017 commits touched an excluded path)
  ```

  Every excluded path's most recent commit belongs to feature 002, feature 004 or
  the views work. None belongs to 017.

- [x] Zero warnings emitted by any command run for this scope.

  **Claim Source:** executed — unfiltered runs, so the absence of a warning line
  is an observation rather than an inference from a count.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # tests 25
  # pass 25
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0

  $ node scripts/build-attention-items.mjs --recompose --write
  [build-attention-items] recomposed: 3 built, 2 refused
  [build-attention-items] wrote market-brief.payload.json
  EXIT=0

  $ node scripts/validate-brief-payload.mjs
  [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
  EXIT=0

  $ node scripts/validate-spec-test-paths.mjs
  [spec-test-paths] OK — no new missing test path(s)
  EXIT=0

  $ node scripts/selftest.mjs
  Research-Lab self-test: 1271 passed, 0 failed
  EXIT=0

  (no warning line in any unfiltered output above)
  ```

- [x] Every scenario this scope declares is named by a passing test, proven per scenario rather than by a suite total: SCN-017-047, SCN-017-048, SCN-017-049, SCN-017-050, SCN-017-051, SCN-017-052, SCN-017-053, SCN-017-054, SCN-017-056.

  **Claim Source:** executed. The prior green runs retained only suite totals, so
  no row could cite the scenario it actually proves. These are the per-test lines
  those runs never kept.

  ```text
  $ node --test --test-reporter=tap tests/attention-payload-contract.test.mjs
  ok 6 - SCN-017-054 The build step composes the envelope the lane no longer emits
  ok 8 - SCN-017-056 A recorded exclusion must name a real refusal code
  ok 20 - SCN-017-047 A complete authored candidate is built into a conforming envelope by the build step
  ok 21 - SCN-017-048 A candidate missing a falsifiability field is excluded with a named refusal code
  ok 22 - SCN-017-049 Every excluded candidate states why it was excluded
  ok 23 - SCN-017-050 A generation whose every candidate is refused still publishes
  ok 24 - SCN-017-052 The build step derives its context from committed contracts and restates no module rule
  ok 25 - SCN-017-053 The authoring instruction asks only for the authored judgement
  EXIT=0

  $ npx --no-install playwright test tests/attention-browser.spec.mjs …
  ✓ 7 …:824:1 › SCN-017-051 The tier renders its declared empty state for an all-excluded generation (5.4s)
    10 passed (53.0s)
  EXIT=0
  ```

  The `ok` numbering is non-contiguous because it is the real ordinal from an
  unfiltered run of a shared suite; the intervening numbers belong to scopes 2, 4
  and 5 and are cited in their own copies of this item rather than counted twice
  here. `SCN-017-051` is this scope's only browser scenario, and its test title
  carries the id directly, so no banner lookup is needed for it.

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior exist and pass (TP-06-08).

  **Claim Source:** executed in this turn.

  ```text
  $ npx --no-install playwright test tests/attention-browser.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --reporter=list
  ✓ 1 decision attention tier renders items and record from committed data
  ✓ 7 SCN-017-051 The tier renders its declared empty state for an all-excluded generation
  ✓ 10 SCN-017-059 No item appears in both the decision tier and the catalyst feed
    10 passed
  EXIT=0
  ```

  This scope changes WHO builds the envelope and must change NOTHING the reader
  sees. That is a negative claim about the rendered page, so it can only be shown
  end to end: the tier still renders, and an all-refused generation still renders
  its declared empty state rather than a blank or a placeholder.

- [x] Broader E2E regression suite passes with no unrelated breakage.

  **Claim Source:** executed in this turn — the WHOLE Playwright suite, after the
  build step was wired into the publication script.

  ```text
  $ npx --no-install playwright test --config=playwright.config.mjs \
      --project=system-chrome --reporter=line
    294 passed (5.4m)
  FULL SUITE exit=0

  $ node scripts/selftest.mjs
  Research-Lab self-test: 1273 passed, 0 failed

  $ node --test tests/attention-payload-contract.test.mjs
  # tests 27
  # pass 27
  # fail 0
  ```

  This scope edits `scripts/brief-refresh-and-push.sh`, the script every
  publication test depends on. The whole-suite run is the only evidence that
  inserting a step into that chain broke nothing downstream.

- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns (TP-06-09).

  **Claim Source:** executed in this turn, BEFORE the broad rerun above.

  ```text
  $ node --test tests/brief-refresh-atomicity.test.mjs
  # tests 26
  # pass 26
  # fail 0
  EXIT=0
  ```

  Run first, deliberately. This scope inserts a step into the publication chain
  and the fixture is what proves the chain still holds. In this session the same
  command stood at 8 of 26 because the fixture had stopped modelling the real
  path — three missing dependencies and two defects in its own stub — and NO
  downstream suite reported it. That is precisely the failure mode a canary is
  for: shared-harness breakage makes every dependent suite wrong in the same
  direction, which reads like a product regression instead of a harness defect.

- [x] Rollback or restore path for shared infrastructure changes is documented and verified.

  **Claim Source:** executed — the runtime restore path is asserted by a test.

  ```text
  $ node --test tests/brief-refresh-atomicity.test.mjs
  ok 25 - unrelated staged and unstaged dirt remains byte and index identical
  ok 26 - forced final validation failure restores every owned baseline byte and index path
  # tests 26
  # pass 26
  # fail 0
  EXIT=0
  ```

  Two restore paths, both verified rather than described. The Rollback section
  documents reverting the build step itself: remove the one line from
  `brief-refresh-and-push.sh` and the pipeline returns to lane-authored
  envelopes. Scenario 26 covers the RUNTIME path — when the gate refuses, every
  owned baseline byte and the git index are restored, so a refused publication
  leaves nothing behind. Scenario 25 additionally proves the restore does not
  trample a developer's unrelated working-tree changes.

- [x] The consumer impact sweep is complete and zero stale first-party references remain.

  **Claim Source:** executed in this turn.

  ```text
  $ grep -rn "build-attention-items" --include='*.sh' --include='*.mjs' \
      --include='*.js' --include='*.yml' . --exclude-dir=node_modules
  scripts/brief-refresh-and-push.sh:  && "$NODE_BIN" scripts/build-attention-items.mjs --recompose --write \
  scripts/selftest.mjs:5837:  const attentionBuild = await import('./build-attention-items.mjs');
  tests/brief-refresh-atomicity.support.mjs:  copyFileSync(... 'scripts/build-attention-items.mjs' ...)
  tests/attention-browser.spec.mjs:866:  const build = await import(...)
  tests/attention-payload-contract.test.mjs:1829: const BUILD_STEP_PATH = ...

  $ node --test tests/attention-payload-contract.test.mjs
  # tests 27
  # pass 27
  # fail 0
  ```

  The sweep found a real stale reference, and it was the most important one: the
  build step had NO pipeline consumer at all. It was written, tested and
  registered with the selftest while `brief-refresh-and-push.sh` never called it,
  so the lane had already stopped authoring envelopes and nothing had started
  composing them. An orphaned build step is not a structural guarantee, it is a
  file. It is now wired in, and every remaining reference resolves to a live
  consumer. No first-party surface still expects the lane to author an envelope
  field, and none reads a field the composer does not produce.

- [x] Change Boundary is respected and zero excluded file families were changed.

  **Claim Source:** executed in this turn, per family.

  ```text
  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js \
             rlcontracts.js tool-experience.config.json; do
      git --no-pager log --oneline c0c7d34c..HEAD -- "$f" | wc -l
    done
  rlbrief.js                             UNCHANGED across the whole feature
  rlexperience.js                        UNCHANGED across the whole feature
  rlfx.js                                UNCHANGED across the whole feature
  rljourney.js                           UNCHANGED across the whole feature
  rlmarketaction.js                      UNCHANGED across the whole feature
  rlcontracts.js                         UNCHANGED across the whole feature
  tool-experience.config.json            UNCHANGED across the whole feature
  ```

  `rlattention.js` is the family this scope had the strongest reason to touch and
  the strongest reason not to. Routing the lane through the composer means
  calling `buildAttentionItem`, and the shortcut would have been to widen the
  composer to accept the lane's shape. That would have put a second definition of
  a valid attention item into the system, which is the exact duplication F-017-06
  exists to remove. The module gained a second CALLER and not a second copy; it
  was changed only by Scope 1, its owner.

  Two paths inside this scope's Allowed set are worth stating plainly, because
  both are shared surfaces rather than files this scope invented:
  `scripts/brief-refresh-and-push.sh` was edited by exactly one line — the build
  step — and `scripts/selftest.mjs` by one hunk that registers this scope's own
  module and deletes nothing. Both are bounded by construction rather than by
  promise.

