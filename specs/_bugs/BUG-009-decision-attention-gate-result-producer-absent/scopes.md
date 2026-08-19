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

- [ ] A remedy from `design.md` §4 (or a documented alternative) is selected in writing
- [ ] The detection policy is declared in a committed artifact and owner-approved
- [ ] Ownership is assigned: this packet, spec 026, spec 017, or a new spec
- [ ] The interaction with spec 026 `IP-026-004` (dark state) is resolved, not deferred

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

- [ ] The quiet statement is not rendered when the tier is structurally unreachable
- [ ] Ownership of the unreachable statement is settled with spec 026, not duplicated
- [ ] The publication path designated to publish attention actually commits the payload
- [ ] A genuinely quiet session still reads as quiet, with executed evidence
