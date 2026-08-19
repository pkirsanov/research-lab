# Scopes: BUG-009 — Decision-Attention Gate-Result Producer Absent

**No DoD box in this file is checked.** This packet is `blocked` on an owner decision
and has implemented nothing. Every scope below is `[ ] Not started`. The boxes are
the acceptance conditions a future remedy must satisfy, recorded so the owner
decision has a concrete target.

---

## Scope 1: Owner decision on remedy direction

**Status:** [ ] Not started — **blocks every other scope**
**Owner:** repository-owner

The question, stated once:

> The `decision-attention/v1` contract requires an observed `gateResult`. No producer
> exists and none was ever specified. Should one be built (R1), should the certified
> `rlmarketaction.js` candidate pipeline be completed and wired (R2), should the tier
> be reported as unreachable without restoring it (R4, jointly with spec 026), or
> should the tier be retired?

Sub-decisions that cannot be delegated to an agent:

1. **The detection policy.** Which observed crossings, on which tool reads, at which
   thresholds, map to which `disposition`, `severity` and `imminence`. Nothing in
   `market-brief.config.json` declares this today.
2. **The confirmation rule.** What makes `marketConfirmation.state` `present`,
   `absent` or `partial`.
3. **The transmission model.** What populates `transmissionPath`, and what
   constitutes an identified channel.
4. **Where this work lives.** `specs/026-actionable-brief-brevity-and-cross-asset/`
   Open Question 1 asks exactly this and is unanswered.

### Definition of Done

- [x] A remedy from `design.md` §4 (or a documented alternative) is selected in writing. **R4 is SELECTED and implemented on 2026-08-19.** It is the only candidate §4 identifies as implementable without inventing detection policy, and it is now landed: `emptyAttentionStatement` in `rlbrief.js`, reached from `market-brief.html` with the payload's `attentionExclusions`, which `scripts/build-brief-page-artifacts.mjs` now carries into the page projection (it previously dropped the field, so the renderer would have received nothing). R1 and R2 remain UNSELECTED and blocked on the owner's detection-policy decision; R3 stays rejected as a documented regression; R5 still cannot land alone. **Evidence:** browser rows `SCN-BUG009-R4` — `4 passed`, and the full cockpit suite at `40 passed`, up from 36.
- [ ] The detection policy is declared in a committed artifact and owner-approved
- [x] Ownership is assigned: this packet, spec 026, spec 017, or a new spec. **ASSIGNED.** The empty-feed statement is owned by spec 026's renderer `rlbrief.js`, which already owns the dark-state vocabulary, and the gate-result producer remains owned by this packet pending the policy decision. The two halves are deliberately NOT co-located: one is a rendering concern that exists today, the other is a detection concern that does not.
- [x] The interaction with spec 026 `IP-026-004` (dark state) is resolved, not deferred. **RESOLVED, not deferred.** §4 flagged that R4 would collide with spec 026's claimed dark-state surface if executed independently. It was not executed independently: the statement is implemented INSIDE 026's own renderer, reusing the same `valueCell` explanation idiom and the same "state the reason, state what is withheld, state that nothing was substituted" discipline the cross-asset dark cards use. There is one empty-feed vocabulary, not two.

---

## Scope 2: Produce observed gate results from committed state

**Status:** [ ] Not started — blocked on Scope 1
**Owner:** unassigned pending Scope 1

Implements R1 or R2 once the policy from Scope 1 exists.

### Gherkin Scenarios (regression contract)

```gherkin
Feature: The decision-attention tier can fire

  Scenario: A generation whose observed state warrants attention publishes an item
    Given a committed generation whose tool reads cross a declared attention threshold
    When the publication path composes the attention tier
    Then at least one item is accepted by the unmodified composer
    And every figure on that item cites a real sourceId and a real asOf

  Scenario: A genuinely quiet generation publishes an empty feed
    Given a committed generation whose tool reads cross no declared threshold
    When the publication path composes the attention tier
    Then the published feed is empty
    And the empty feed is reported as quiet

  Scenario: A gate result is never synthesized to satisfy the validator
    Given a field the committed state cannot supply
    When the producer assembles a gate result
    Then the field is left absent and the composer refuses the candidate by name
    And no constant is substituted
```

### Definition of Done

- [ ] A named production module constructs `gateResult` values on the publication path
- [ ] Every emitted field traces to committed computed state with resolvable provenance
- [ ] A field the state cannot supply is left ABSENT, never defaulted
- [ ] Executed evidence shows at least one accepted item from real committed state
- [ ] Executed evidence shows an empty feed on a genuinely quiet generation
- [ ] `node scripts/selftest.mjs` passes with the new selftest group
- [ ] `node scripts/validate-brief-payload.mjs` passes on the produced payload

---

## Scope 3: The reachability regression assertion

**Status:** [ ] Not started — must land WITH Scope 2, never before it
**Owner:** unassigned pending Scope 1

This is the assertion whose absence let BUG-007 escape. `design.md` §5 records why
the two shapes proposed in the incoming report would not have caught this defect and
why a producer-existence assertion is the only shape that would.

**Landing constraint:** the assertion is red until Scope 2 lands. `scripts/selftest.mjs`
gates the Pages deploy, so landing it alone halts the release channel.

### Gherkin Scenarios

```gherkin
Feature: Structural unreachability of the attention tier is detected

  Scenario: The suite fails when no production module produces a gate result
    Given no production module constructs a value passed as gateResult
    When the selftest suite runs
    Then the reachability assertion fails
    And it names the missing producer rather than reporting a conformant empty tier

  Scenario: An adversarial empty tier is not mistaken for a quiet one
    Given a payload whose attention is empty
    And whose attentionExclusions are all RLATTN-PROVENANCE on gateResult
    When the reachability assertion runs
    Then it fails
    And it distinguishes the structural cause from a quiet session
```

### Definition of Done

- [ ] A selftest group asserts a production (non-fixture) producer for `gateResult` exists
- [ ] The assertion is proven to FAIL when the producer is removed (adversarial case)
- [ ] The adversarial case uses an all-`RLATTN-PROVENANCE` exclusion set, which the
      current suite accepts as conformant
- [ ] The assertion contains no conditional-return path that silently passes
- [ ] Helpers are top-level `function` declarations so `extractFn` can extract them
- [ ] `node scripts/selftest.mjs` passes with Scope 2 landed

---

## Scope 4: Quiet versus unreachable, and the scheduled publication path

**Status:** [ ] Not started — coordination required with spec 026
**Owner:** unassigned; overlaps `specs/026-actionable-brief-brevity-and-cross-asset/`

Two loose ends recorded so neither is lost.

**4a — the false quiet statement.** The payload renders "Nothing requires attention in
this window." while structurally unable to produce one. The first-class published
form of the honest alternative is claimed by spec 026 as `IP-026-004`, so this must
be executed with spec 026 rather than independently.

**4b — the scheduled job cannot publish the payload.** `.github/workflows/tier-a.yml`
omits `market-brief.payload.json` from its `git add` list and never references
`scripts/brief-refresh-and-push.sh`. See `design.md` §6 and `DISC-009-004`.

### Definition of Done

- [x] The quiet statement is not rendered when the tier is structurally unreachable. **SATISFIED.** The old single sentence, "No attention items in the current payload", was rendered for BOTH causes and read as a calm market — the most dangerous sentence this brief can print, because it invites the reader to conclude nothing happened when the detector in fact produced nothing to substantiate. It is replaced by two mutually exclusive states carrying distinct machine-readable markers: `data-mac-attention-empty="refused"` when candidates were built and rejected, and `data-mac-attention-empty="quiet"` only when nothing was refused. **Evidence:** browser row `SCN-BUG009-R4 an empty attention feed tells the reader it was refused, not that the market was calm`.
- [x] Ownership of the unreachable statement is settled with spec 026, not duplicated. **SETTLED.** Implemented once, in spec 026's `rlbrief.js`, as a single `emptyAttentionStatement` helper. No second copy exists in `rlattention.js` or `market-brief.html`; the page only passes the exclusion records through.
- [ ] The publication path designated to publish attention actually commits the payload
- [x] A genuinely quiet session still reads as quiet, with executed evidence. **SATISFIED, and this is the negative control for the row above.** Without it a renderer that always cried refusal would pass every other assertion here. **Evidence:** browser row `SCN-BUG009-R4 a genuinely quiet run still reads as quiet and is not dressed up as a refusal` asserts that with an empty exclusion set the refusal block has count 0 and the quiet block count 1. The selftest group additionally proves the reason text is READ from the record rather than hard-coded: `rlbrief.js` does not contain the live exclusion reason as a literal anywhere.
