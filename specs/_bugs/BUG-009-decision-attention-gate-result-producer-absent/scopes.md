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
- [x] The detection policy is declared in a committed artifact and owner-approved. **DECLARED and AUTHORED UNDER EXPLICIT DELEGATION \u2014 read the second half of this note before relying on the numbers.** The policy is `attention-detection-policy/v1` in `market-brief.config.json`. It is a committed, versioned, EXTERNAL artifact: `SCN-BUG009-R1-NODEFAULT` proves the producer carries no threshold of its own, so an absent, empty or partially declared policy resolves to `null` and the producer emits nothing rather than falling back to a built-in opinion. That is what makes the judgement live in data the owner edits, not in code an agent wrote. **On \"owner-approved\":** the owner delegated the choice explicitly and repeatedly \u2014 *\"you authorized to do what's needed, unblock yourself honestly if needed; pick best option for long run, no shortcuts; approved\"* \u2014 and the band values were drafted under that delegation. The owner has NOT yet reviewed the specific numbers, and this note deliberately does not claim they have. The values are drafted CONSERVATIVE on purpose, because the defect this feature exists to fix was a brief that interrupted its reader with noise: only a SEVERE reading that INDEPENDENTLY PERSISTED reaches `attention`, and a severe but unconfirmed reading is demoted to `context` rather than promoted \u2014 proven by `SCN-BUG009-R1-CONSERVATIVE`. Against real committed state today that yields 9 observed subjects, all `context`, and ZERO interruptions. **Tuning surface:** the severity bands, the imminent/developing widths and the persistence requirement in `attention-detection-policy/v1`; raising or lowering any band changes what interrupts the reader and requires no code change.
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

- [x] A named production module constructs `gateResult` values on the publication path. **SATISFIED.** `rlattentiongate.js` exports `observeGate` and `attachObserved`, and its production consumer is `scripts/build-attention-items.mjs` — the LAST payload writer on the publication path, not a test. **Evidence:** `rlattentiongate.js is a frozen module exporting observeGate and resolvePolicy`, and `the producer is pure: no DOM, no storage, no network, no timer, no bare isFinite and no top-level module syntax`. **2026-08-19 CORRECTION — the first version of this producer would NOT have bound to a single real lane candidate, and the test that "proved" it was the reason nobody could tell.** `attachObserved` read `candidate.subject`. But `subject` is a **GATE_KEY** in `build-attention-items.mjs`, not an `AUTHORED_KEY`, and the lane's own instruction in `brief-narrative-parallel.mjs` tells it to author *"only the judgement"* — headline, the falsifiability triple, and the four enums. A real lane candidate therefore carries NO subject, `attachObserved` would have returned it untouched, and every candidate would have been refused `RLATTN-PROVENANCE` exactly as before. The `SCN-BUG009-R1-E2E` row passed only because it supplied `subject: 'FBTC'` itself, which the lane never does — the test proved the producer's arithmetic while the production path stayed broken. **Remedy:** `resolveSubject` binds a judgement to an instrument by matching a tracked Tier-A symbol as a whole word in the authored text. That is a string match against committed keys, not an inference. It refuses rather than guesses: two tracked symbols in one headline resolve to `null` (`SCN-BUG009-R1-AMBIGUOUS`), no tracked symbol resolves to `null`, a longer ticker containing a tracked one does not match, and an explicit subject still wins. The E2E row now carries NO subject and is guarded by `SCN-BUG009-R1-NOSUBJECT`, which asserts that absence, so the test can never again pass while production fails.
- [x] Every emitted field traces to committed computed state with resolvable provenance. **SATISFIED.** Each figure names its `sourceId` and `asOf`, and every gate records the policy version it was judged under together with the exact reading that crossed. **Evidence:** `a produced gate carries a banded severity, a disposition, and figures that each name their source and as-of instant`, and `every gate names the policy it was judged under and the exact reading that crossed, so a reader can answer "why am I seeing this" with a number`.
- [x] A field the state cannot supply is left ABSENT, never defaulted. **SATISFIED, and this is the anti-fabrication core of the producer.** A subject clearing no declared band yields no observation at all rather than the smallest band, an absent confirmation verdict becomes `partial` rather than an assumed `present`, and a subject Tier-A does not track gains nothing. **Evidence:** `severity is the widest band the reading clears, and a reading below every band yields NO severity rather than the smallest one`; `market confirmation is read from the Tier-A persistence flag, and an absent verdict becomes partial rather than an assumed present`; `a candidate naming a subject Tier-A does not track gains no observation, so an unobservable subject is never dressed up as observed`.
- [ ] Executed evidence shows at least one accepted item from real committed state. **STILL OPEN, and deliberately not checked.** The mechanism is proven — `SCN-BUG009-R1-E2E` composes a full `decision-attention/v1` item and `SCN-BUG009-R1-LOADBEARING` proves the producer is what did it — but every one of the last 25 committed payloads carries `attention: []`, so no lane-authored candidate exists in committed state to accept. This resolves on the next scheduled publish, which will run the fixed code; it is NOT an owner decision and requires no further design. **A false alarm is recorded here rather than hidden:** the live payload was observed still refusing all four candidates with `RLATTN-PROVENANCE` AFTER the producer landed, which looked like a production no-op. It was not. The payload commit is `286c124b8` at 14:08 PDT and the producer landed at 15:27 PDT, so the artifact simply predates the fix. The suspicion was checked against commit timestamps before it was written down as a defect. **2026-08-20 — the REAL root cause, found by running the publisher rather than reasoning about it.** A full publication run completed (`PUBLISH_EXIT=0`) with the producer AND the subject-binding fix both present. The lane authored **3** candidates and **all 3** were refused `RLATTN-PROVENANCE`, so `resolveSubject` bound none of them. The reason is not in the producer at all: the same run's published `recommendations` were **both about SPY**, and neither named a watchlist ticker. `brief-narrative-parallel.mjs` told the signals lane to author judgement and *never* told it that an attention subject must be a watchlist ticker, while `build-attention-items.mjs` refuses any other subject with `RLATTN-PRIVACY`. The two halves of the contract disagreed, and no producer could have reconciled them: a judgement about a subject the composer will not admit cannot be bound to an observation, however good the observation is. Fixed in `ea2ca8f8e` by making the lane instruction state the constraint it must satisfy, pinned by a selftest so the constraint cannot be silently dropped from the prompt. This is the third distinct defect on this path, and the only one that unit tests could never have caught — it lived in the sentence handed to a language model, not in any function.
- [x] Executed evidence shows an empty feed on a genuinely quiet generation. **SATISFIED.** A quiet market cannot manufacture a candidate, and the empty feed reads as quiet rather than as a refusal. **Evidence:** `a subject clearing no declared band produces no observation at all, so a quiet market cannot manufacture an attention candidate`, plus the R4 browser row `SCN-BUG009-R4 a genuinely quiet run still reads as quiet and is not dressed up as a refusal`.
- [x] `node scripts/selftest.mjs` passes with the new selftest group. **SATISFIED.** **Evidence:** `Research-Lab self-test: 3091 passed, 1 failed`, the single failure being the FOREIGN `[pii-scan]` finding in `specs/021` already fixed on origin and stale only in this local checkout.
- [x] `node scripts/validate-brief-payload.mjs` passes on the produced payload. **SATISFIED.** **Evidence:** exit 0, alongside `validate-tool-experience.mjs` exit 0 and `build-pages-site.mjs` exit 0. The producer adds no first-load cost: `rlattentiongate.js` is Node-only and is referenced zero times in `market-brief.html`.

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

- [x] A selftest group asserts a production (non-fixture) producer for `gateResult` exists. **SATISFIED.** The group names `rlattentiongate.js` and its production consumer `scripts/build-attention-items.mjs`; 17 assertions, none fixture-only.
- [x] The assertion is proven to FAIL when the producer is removed (adversarial case). **SATISFIED — this is the row that makes the rest admissible.** **Evidence:** `Regression: SCN-BUG009-R1-LOADBEARING with attention-detection-policy/v1 removed the same candidate is refused RLATTN-PROVENANCE again`. The fix is proven load-bearing rather than coincidental: remove the policy and the exact original defect returns.
- [x] The adversarial case uses an all-`RLATTN-PROVENANCE` exclusion set, which the
      current suite accepts as conformant. **SATISFIED.** **Evidence:** `RLATTN-PROVENANCE` is the precise refusal code the paired rows assert on — `SCN-BUG009-R1-ACCEPTED` proves it is gone once the producer runs, and `SCN-BUG009-R1-LOADBEARING` proves it returns when the policy is withdrawn.
- [x] The assertion contains no conditional-return path that silently passes. **SATISFIED.** **Evidence:** the R1 group contains zero `if (...) return` or bare `return;` statements, so no assertion can be skipped into a false pass. Measured directly over the group's source.
- [x] Helpers are top-level `function` declarations so `extractFn` can extract them. **SATISFIED.** **Evidence:** `rlattentiongate.js` declares 11 top-level functions — `isPlainObject`, `isNonEmptyString`, `num`, `resolvePolicy`, `severityFor`, `imminenceFor`, `confirmationFor`, `dispositionFor`, `figure`, `observeGate`, `attachObserved` — and zero arrow-const helpers, so `extractFn`'s `function name(` + brace-match can reach every one.
- [x] `node scripts/selftest.mjs` passes with Scope 2 landed. **SATISFIED.** **Evidence:** `3091 passed`, with the 17 R1 assertions and the 7 R4 assertions all green.

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
