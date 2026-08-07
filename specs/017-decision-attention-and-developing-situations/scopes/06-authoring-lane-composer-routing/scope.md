# Scope 6: Authoring Lane Composer Routing

## 06-authoring-lane-composer-routing

**Status:** Not Started
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

**Allowed:** `scripts/build-attention-items.mjs`,
`scripts/brief-narrative-parallel.mjs`, `market-brief.payload.json`,
`tests/attention-payload-contract.test.mjs`, `tests/attention-browser.spec.mjs`.

**Excluded (must remain byte-identical in this scope):** `rlbrief.js` ·
`rlexperience.js` · `rlfx.js` · `rljourney.js` · `specs/004*` ·
`specs/_bugs/BUG-002*` · `specs/012*/bugs/*` — all owned by CONCURRENT sessions —
plus `rlmarketaction.js` · `rlcontracts.js` · `market-brief.scorecard.json` ·
`tool-experience.config.json` · `scripts/validate-spec-test-paths.baseline`. Also
excluded in this scope: `rlattention.js` (Scope 1's capability foundation — this
scope consumes the composer and restates none of it), `scripts/validate-brief-payload.mjs`
(Scope 2), `market-brief.html` (Scope 3) and `scripts/selftest.mjs` (Scope 5).

Registering `scripts/build-attention-items.mjs` with `scripts/selftest.mjs` is
therefore NOT in this scope. It is owed to the Scope 5 owner, who holds that file,
and is recorded here rather than taken silently.

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

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] `scripts/build-attention-items.mjs` exists, imports `buildAttentionItem` from `rlattention.js`, and declares no vocabulary, no lifecycle table and no window rule of its own.
- [ ] The build step assembles `gateResult` from the payload's own observed tool reads and never from authored prose.
- [ ] The build step assembles `ctx` from the committed calendar, the committed watchlist scope and the committed window vocabulary.
- [ ] Every candidate the composer refuses is excluded from `attention[]` and no substitute value is written for any missing field.
- [ ] Every excluded candidate is recorded in `attentionExclusions[]` with its named `RLATTN-*` code, its offending field and its detail, mirroring the `toolCoverage[].reason` contract.
- [ ] The build step enforces its own accounting invariant — published count plus excluded count equals declared candidate count — and fails loud when it does not hold.
- [ ] An all-refused generation yields an empty `attention[]`, a full exclusion record and a zero exit, with no placeholder item synthesised.
- [ ] The `attention` authoring instruction in `scripts/brief-narrative-parallel.mjs` asks only for the headline, the falsifiability triple and the four judgement enums, and no longer asks the lane to emit a `decision-attention/v1` envelope.
- [ ] `market-brief.payload.json` gains `attentionExclusions[]` additively with every pre-existing key byte-identical.
- [ ] `node scripts/validate-brief-payload.mjs` exits 0 against a payload the authoring lane produced through the build step, not against a hand-repaired payload.
- [ ] The hard-cutover posture is unchanged: no dual-shape acceptance window, no default substitution, no relaxed predicate, and every Red Alert threshold byte-identical.
- [ ] The SCN-017-045 supersession recorded under Cross-Scope Supersession has been reconciled by the planning owner before this scope is executed.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-06-01 executed with raw output recorded at `report.md#tp-06-01`.
- [ ] TP-06-02 executed with raw output recorded at `report.md#tp-06-02`, using a candidate that genuinely fails to build.
- [ ] TP-06-03 executed with raw output recorded at `report.md#tp-06-03`, using a mixed generation of one buildable and one refusable candidate.
- [ ] TP-06-04 executed with raw output recorded at `report.md#tp-06-04`, using a payload in which every declared candidate fails to build.
- [ ] TP-06-05 executed with raw output recorded at `report.md#tp-06-05`.
- [ ] TP-06-06 executed with raw output recorded at `report.md#tp-06-06`.
- [ ] TP-06-07 executed with raw output recorded at `report.md#tp-06-07`.
- [ ] TP-06-02, TP-06-03 and TP-06-04 are each proven to bite by a recorded mutation of the build step that drops a refused candidate without a reason, with the step restored byte-identical afterwards.

#### Build Quality Gate

- [ ] `node --test tests/attention-payload-contract.test.mjs` exits 0 with zero skipped scenarios.
- [ ] The browser scenario passes and the pre-existing scenarios in `tests/attention-browser.spec.mjs` stay green with their titles unchanged.
- [ ] `node scripts/validate-brief-payload.mjs` exits 0 against the committed payload.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths.
- [ ] Every excluded path listed in the Change Boundary is byte-identical to its pre-scope state, proven by a diff of the working tree.
- [ ] Zero warnings emitted by any command run for this scope.
