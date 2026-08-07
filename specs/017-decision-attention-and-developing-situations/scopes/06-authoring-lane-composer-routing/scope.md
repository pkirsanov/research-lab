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

**Allowed:** `scripts/build-attention-items.mjs`,
`scripts/brief-narrative-parallel.mjs`, `market-brief.payload.json`,
`tests/attention-payload-contract.test.mjs`, `tests/attention-browser.spec.mjs`,
plus the two paths added by the F-017-07 amendment below:

- `scripts/validate-brief-payload.mjs` — the gate must consume
  `attentionExclusions[]`, the key this scope introduces, so it cannot be excluded
  from the scope that introduces it. The build step's context is also
  single-sourced from this validator so the step that builds an item and the gate
  that refuses one cannot disagree.
- `scripts/validate-spec-test-paths.baseline` — the removal of the one stale
  entry the guard itself demanded (`STALE-BASELINE: 1 baseline entry is no longer
  missing — remove from…`). The documented rule is that the baseline shrinks and
  never grows, so this strengthens the guard rather than relaxing it.

**Excluded (must remain byte-identical in this scope):** `rlbrief.js` ·
`rlexperience.js` · `rlfx.js` · `rljourney.js` · `specs/004*` ·
`specs/_bugs/BUG-002*` · `specs/012*/bugs/*` — all owned by CONCURRENT sessions —
plus `rlmarketaction.js` · `rlcontracts.js` · `market-brief.scorecard.json` ·
`tool-experience.config.json`. Also excluded in this scope: `rlattention.js`
(Scope 1's capability foundation — this scope consumes the composer and restates
none of it), `market-brief.html` (Scope 3) and `scripts/selftest.mjs` (Scope 5).

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

Registering `scripts/build-attention-items.mjs` with `scripts/selftest.mjs` is
therefore NOT in this scope. It is owed to the Scope 5 owner, who holds that file,
and is recorded here rather than taken silently.

### Finding F-017-07 — The Change Boundary Under-Declared This Scope's True Surface

Scope 6's Change Boundary under-declared its true surface, and the byte-identity
DoD item was reworded to pass instead of the boundary being corrected. The item
originally demanded byte-identity "proven by a diff of the working tree"; it was
rewritten to assert only that no excluded path was modified BY this scope, which
is weaker, permits another owner's modification, and drops the proof obligation
entirely. Root cause: the boundary was authored before the composer-routing
implementation revealed which files it must touch.

Disposition: the original wording is restored verbatim and left UNTICKED, and the
DECLARATION is amended to match reality —
`scripts/validate-brief-payload.mjs` and `scripts/validate-spec-test-paths.baseline`
move to Allowed. No source change is reverted; each is substantively correct and
strengthening.

Two consequences are recorded rather than resolved here, because both belong to
other owners:

- `rlattention.js` (scope 4's interruption-rate hunk), `market-brief.html`
  (scope 4's ledger read) and `scripts/selftest.mjs` (scope 5's build-step
  registration) each differ from `6d4eba99~1` while listed on this scope's
  excluded set. Each was modified by its OWN owning scope inside this feature,
  which is why they stay excluded here; reconciling the wording that makes a
  sibling scope's legitimate edit read as a boundary breach is owed to the
  planning owner.
- This scope's header still reads `Status: Done` while a Core Delivery item is
  now correctly unticked. That status is not this agent's to change — it is
  mirrored in `state.json` and `scopes/_index.md`, both outside this scope file —
  so the inconsistency is routed to the scope/workflow owner rather than papered
  over. The spec-level `state.json` status is `in_progress`, so nothing
  downstream currently claims certification on the strength of it.

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

  **Claim Source:** executed — each half of the compound claim is evidenced
  separately, which is what the superseded declaration said was missing.

  - **No default substitution** — the refusal path (SCN-017-048, SCN-017-049): a
    candidate the composer refuses is excluded and recorded, never filled in.
  - **Red Alert thresholds byte-identical** — SCN-017-042 compares them, and the
    three files that carry them are untouched across this delivery.
  - **No dual-shape acceptance and no relaxed predicate** — the scan below returns
    four hits and each is read rather than counted: two are function/config
    option defaults (`options || {}`, `config?.thresholds || {}`), one guards a
    `JSON.stringify` of tool-read metrics, and one is prose inside a comment.
    None accepts a second attention shape and none softens a predicate.

  The one predicate ADDED in this scope — `attentionExclusions[]` validated when
  present — is deliberately not a dual-shape window for attention items: the key
  is new, nothing writes it yet, and its SHAPE is refused strictly whenever it
  does appear.

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

- [ ] Every excluded path listed in the Change Boundary is byte-identical to its pre-scope state, proven by a diff of the working tree.

  **Uncertainty Declaration — this item is NOT satisfied, and is left unticked.**
  Three paths still on the excluded list differ from this scope's pre-scope
  baseline `6d4eba99~1`: `rlattention.js`, `market-brief.html` and
  `scripts/selftest.mjs`. Each was modified by its OWN owning scope inside this
  feature — scope 4, scope 4 and scope 5 respectively, per the delivery commit's
  own message — so none is a breach by THIS scope. But the item asserts
  byte-identity, not innocence, and byte-identity does not hold. The honest
  record is an untick plus this declaration, never a reworded checkbox.

  The two paths this scope genuinely had to touch —
  `scripts/validate-brief-payload.mjs` and
  `scripts/validate-spec-test-paths.baseline` — are no longer excluded. The
  DECLARATION was corrected under F-017-07 rather than the assertion softened.

  **Claim Source:** executed — run against both baselines in this turn, because
  the two disagree and the disagreement is material.

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

  **Why the unticked item is nonetheless not a breach by this scope.**
  `scripts/selftest.mjs` is on this scope's excluded list and DID gain the
  build-step registration. That registration is the Scope 5 obligation this scope
  recorded rather than took silently, and it was carried out under Scope 5, not
  smuggled in here. The same applies to `rlattention.js` and `market-brief.html`,
  which the delivery commit attributes in terms to scope 4. Scope isolation
  forbids a scope reaching outside its own paths; it does not require the rest of
  the feature to stand still while one scope runs. That is an argument for
  reconciling the boundary WORDING with the planning owner — recorded as F-017-07
  above — not for ticking an assertion that does not hold.

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

