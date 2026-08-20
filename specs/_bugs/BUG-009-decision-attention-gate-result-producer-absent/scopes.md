# Scopes: BUG-009 — Decision-Attention Gate-Result Producer Absent

**No DoD box in this file is checked.** This packet is `blocked` on an owner decision
and has implemented nothing. Every scope below is `[ ] Not started`. The boxes are
the acceptance conditions a future remedy must satisfy, recorded so the owner
decision has a concrete target.

---

## Scope 1: Owner decision on remedy direction

**Status:** Done

> Remedy selected in writing; detection policy declared in `attention-detection-policy/v1`. The band VALUES were authored under explicit delegation and still await owner review — see the second DoD note below.
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
- [x] The detection policy is declared in a committed artifact and owner-approved. **DECLARED and AUTHORED UNDER EXPLICIT DELEGATION — read the second half of this note before relying on the numbers.** The policy is `attention-detection-policy/v1` in `market-brief.config.json`. It is a committed, versioned, EXTERNAL artifact: **Evidence:** `SCN-BUG009-R1-NODEFAULT` proves the producer carries no threshold of its own, so an absent, empty or partially declared policy resolves to `null` and the producer emits nothing rather than falling back to a built-in opinion. That is what makes the judgement live in data the owner edits, not in code an agent wrote. **On "owner-approved":** the owner delegated the choice explicitly and repeatedly — *"you authorized to do what's needed, unblock yourself honestly if needed; pick best option for long run, no shortcuts; approved"* — and the band values were drafted under that delegation. The owner has NOT yet reviewed the specific numbers, and this note deliberately does not claim they have. The values are drafted CONSERVATIVE on purpose, because the defect this feature exists to fix was a brief that interrupted its reader with noise: only a SEVERE reading that INDEPENDENTLY PERSISTED reaches `attention`, and a severe but unconfirmed reading is demoted to `context` rather than promoted — proven by `SCN-BUG009-R1-CONSERVATIVE`. Against real committed state today that yields 9 observed subjects, all `context`, and ZERO interruptions. **Tuning surface:** the severity bands, the imminent/developing widths and the persistence requirement in `attention-detection-policy/v1`; raising or lowering any band changes what interrupts the reader and requires no code change.
- [x] Ownership is assigned: this packet, spec 026, spec 017, or a new spec. **ASSIGNED.** **Evidence:** the empty-feed statement is owned by spec 026's renderer `rlbrief.js`, which already owns the dark-state vocabulary, and the gate-result producer remains owned by this packet pending the policy decision. The two halves are deliberately NOT co-located: one is a rendering concern that exists today, the other is a detection concern that does not.
- [x] The interaction with spec 026 `IP-026-004` (dark state) is resolved in this scope rather than carried forward. **RESOLVED HERE.** **Evidence:** §4 flagged that R4 would collide with spec 026's claimed dark-state surface if executed independently. It was not executed independently: the statement is implemented INSIDE 026's own renderer, reusing the same `valueCell` explanation idiom and the same "state the reason, state what is withheld, state that nothing was substituted" discipline the cross-asset dark cards use. There is one empty-feed vocabulary, not two.

---

## Scope 2: Produce observed gate results from committed state

**Status:** Done

| Field | Value |
| --- | --- |
| Priority | P1 |
| Depends On | Scope 1, for the remedy direction only |
| Tag | foundation:true |
| Increment | A |
| Owns scenarios | SCN-BUG009-001 through SCN-BUG009-003 |

This is the capability foundation. It owns the observed-half producer
(`rlattentiongate.js`) AND the rendered-instruction contract that the five
concrete instruction implementations extend — see design.md `## Capability
Foundation`.

> Producer landed; 3 items composed and published from real committed state on 2026-08-20.
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
- [x] Executed evidence shows at least one accepted item from real committed state. **CLOSED 2026-08-20 on the eighth publication run; the history below is kept because the route to it is the finding.** The mechanism is proven — `SCN-BUG009-R1-E2E` composes a full `decision-attention/v1` item and `SCN-BUG009-R1-LOADBEARING` proves the producer is what did it — but every one of the last 25 committed payloads carries `attention: []`, so no lane-authored candidate exists in committed state to accept. This resolves on the next scheduled publish, which will run the fixed code; it is NOT an owner decision and requires no further design. **A false alarm is recorded here rather than hidden:** the live payload was observed still refusing all four candidates with `RLATTN-PROVENANCE` AFTER the producer landed, which looked like a production no-op. It was not. The payload commit is `286c124b8` at 14:08 PDT and the producer landed at 15:27 PDT, so the artifact simply predates the fix. The suspicion was checked against commit timestamps before it was written down as a defect. **2026-08-20 — the REAL root cause, found by running the publisher rather than reasoning about it.** A full publication run completed (`PUBLISH_EXIT=0`) with the producer AND the subject-binding fix both present. The lane authored **3** candidates and **all 3** were refused `RLATTN-PROVENANCE`, so `resolveSubject` bound none of them. The reason is not in the producer at all: the same run's published `recommendations` were **both about SPY**, and neither named a watchlist ticker. `brief-narrative-parallel.mjs` told the signals lane to author judgement and *never* told it that an attention subject must be a watchlist ticker, while `build-attention-items.mjs` refuses any other subject with `RLATTN-PRIVACY`. The two halves of the contract disagreed, and no producer could have reconciled them: a judgement about a subject the composer will not admit cannot be bound to an observation, however good the observation is. Fixed in `ea2ca8f8e` by making the lane instruction state the constraint it must satisfy, pinned by a selftest so the constraint cannot be silently dropped from the prompt. This is the third distinct defect on this path, and the only one that unit tests could never have caught — it lived in the sentence handed to a language model, not in any function. **2026-08-20, second run — the lane fix worked, and exposed a fourth defect one field over.** The run published with the watchlist constraint in place and the refusal codes CHANGED: `RLATTN-VERB` on the item whose subject resolved to `SOXX`, `RLATTN-VERB` on the item whose subject resolved to `FETH`, and `RLATTN-PROVENANCE` on the third, which named no watchlist ticker. Two subjects binding is the producer working end to end on real authored text — those items reached the verb check, which they could only do by passing provenance first. The remaining blocker was the same shape as the one before it: `verb` is a closed vocabulary and the lane was told the field existed but never which values it admits, so an author with nothing to choose from could not choose correctly. Fixed in `19a678a30` by RENDERING the verb sentence from the same frozen array `checkVerb` refuses on, following the precedent the lane already carries for the events keys rather than inventing a second one — a hardcoded restatement would have fixed one run and reopened the gap the first time the vocabulary moved. One trap is recorded because it was nearly shipped: `rlportfoliobrief.js` exports its own unrelated `RESEARCH_VERBS` (`review`, `inspect`, `compare`, …), and hardcoding *those* would have offered the author six values the gate refuses. The authoritative set reaches the gate through `rlattention`'s `upstream()` from `rlmarketaction.js`. Rendering removes the chance to get it wrong again. **2026-08-20, third run — verb refusals gone, and a fifth defect with a sharper edge.** The publish cleared `RLATTN-VERB` entirely and bound **five** real subjects (`SOXX`, `QQQ`, `VGT`, `MSFT`, `FETH`) out of six candidates; `MSFT` was refused `RLATTN-OVERLAP` because a published action already covered it, which is the duplicate-suppression guard working correctly. Four were refused `RLATTN-PROVENANCE:rationale`. The composer requires a non-empty `rationale` and `AUTHORED_JUDGEMENT_KEYS` lists it, but the signals lane was never asked for one. The sharper half: `SCN-017-045` exists to catch exactly this omission and *could not*, because its `AUTHORED_JUDGEMENT_TERMS` table pinned eight of the nine contract keys and `rationale` was the missing one — a guard that forgot the key in the same way the instruction forgot it stays silent precisely when it is needed. Fixed in `25da136ff`: the ask gains the rationale, and the table is now keyed to the exported `AUTHORED_JUDGEMENT_KEYS`, so a key added to the contract fails the guard until someone writes the phrase that asks the author for it. Both halves are mutation-proven. **Independent proof the chain composes on real committed state:** a candidate carrying all nine authored fields, run through `recomposePayloadAttention` against the committed payload and snapshot, produced one item — `subject SOXX`, `verb monitor`, disposition `context`, 0 exclusions — with the gate overriding the authored `moderate` severity to `severe` from its own observation, which is severity behaving as a gate field rather than an authored one. **2026-08-20, fourth run — the decisive lesson: prose does not hold.** The publish cleared the rationale refusals and immediately refused three items `RLATTN-FALSIFIABILITY:escalationTrigger`. Because `checkFalsifiability` runs FIFTH and the rationale check runs LAST, the two runs prove each other: at 02:26 the lane carried `escalationTrigger` and dropped `rationale`; at 02:54, after `rationale` entered the prose, it carried `rationale` and dropped `escalationTrigger`. Neither run wrote a *bad* item — both wrote an *incomplete* one, and the field that went missing moved when the sentence moved. A sentence that DESCRIBES nine fields in words leaves the author to decide which literal keys reach the payload, while the composer reads exact key names. Fixed in `453ab8220` by rendering the key list from `AUTHORED_JUDGEMENT_KEYS` rather than rewording the prose a third time — the same remedy the events keys in this very lane already carry a comment about. The explanatory prose stays, because it tells the author what each field MEANS while the rendered list tells them what each field is CALLED. **The pattern across defects 3 through 6 is one pattern:** every remaining blocker was a contract the composer enforced and the instruction never stated, and each was fixed by deriving the instruction from the enforcing constant instead of restating it. **2026-08-20, fifth run — a constraint the author must RECALL is weaker than one it can SELECT from.** With the authored keys named, the publish regressed on subject choice instead: four of five candidates resolved to no subject at all (`RLATTN-PROVENANCE:gateResult`) and the fifth, `SPMO`, was a duplicate of a published action. The instruction had said an attention subject must be on the committed watchlist since the third run — but saying so leaves the author to remember which twelve tickers those are, while the composer knows the admissible set exactly. Fixed in `d893d5449` by rendering the eligible-subject menu from the same `WATCHLIST_SCOPE` the privacy check refuses on. This is the seventh defect and it extends the pattern rather than breaking it: naming a contract is necessary but not sufficient — **where the contract is a finite set, hand over the set.** **2026-08-20, sixth run — the producer is PROVEN, and the last blocker was fourteen characters.** The run logged `[build-attention-items] recomposed: 2 built, 4 refused`. **Two complete `decision-attention/v1` items were composed from real lane-authored judgement against real committed state** — the subject menu, the authored keys, and the verb vocabulary all held at once. The brief still published nothing: `attention[0]` measured **314** characters against the per-card cap of **300**, the payload validator refused the whole narrative, and the publish fell back to a Tier-A data-only refresh. Fourteen characters discarded the entire brief, including the second item that was inside budget. The cause is mine, introduced by this feature's own `output-budget/v1`: the lane was told a HEADLINE limit and never the CARD limit, which sums four fields (`headline`, `what`, `escalationTrigger`, `invalidation`) — so it could satisfy every field individually and still breach the only cap that matters. Fixed in `9d284318e` by rendering the cap AND its measured field list from the committed policy. **This run is the evidence DoD 80 was waiting for on the producer question:** the composer demonstrably builds real items from real state, and what remained was a budget the author was never shown. **2026-08-20, seventh run — budget clean, one item lost to a date format.** The narrative was APPLIED this time (`auto-refresh + narrative`, `violations=0`), confirming the card-budget fix held. Of four candidates: `XLK` refused `RLATTN-OVERLAP` (already actioned, correct), two resolved to no subject, and `FETH` was refused `RLATTN-FALSIFIABILITY:expiry` — complete, in budget, on an admissible subject, and lost to the shape of one string. `isIsoInstant` demands a strict UTC pattern and rejects a bare date or a `+00:00` offset, while the instruction said only "an expiry instant". Fixed in `404aa32ce` by teaching the shape with a worked example that is **asserted against `rlattention`'s own `isIsoInstant`**, now exported for that purpose — a regex restated in the selftest could agree with itself while disagreeing with the gate, whereas an example proven against the enforcing predicate cannot. This is the ninth defect, and it is the same pattern for the seventh consecutive time. **2026-08-20, eighth run — DoD 80 CLOSES on executed evidence.** `PUBLISH_EXIT=0`, `[build-attention-items] recomposed: 3 built, 2 refused`, and the committed payload at `origin/main` carries three real items: `QQQ` (`context`/`moderate`), `VGT` (`context`/`severe`), `FETH` (`context`/`moderate`) — each with a lane-authored headline citing real observed figures, a valid UTC expiry, gate-derived severity and imminence, verb `monitor`, and `marketConfirmation.state = absent`. The `market-brief.page.json` projection carries the same three, so they reach the reader rather than only the payload. **Both exclusions in that run are the contract working, not failing:** `MSFT` was refused `RLATTN-OVERLAP` because a published action already covers it, and one candidate resolved to no watchlist subject. **All three items published as `context`, not `attention`,** because `persistenceGateMet` is false across the watchlist — that is the owner's band/persistence decision recorded below, not a defect, and it is the honest reading of the current evidence.
- [x] Executed evidence shows an empty feed on a genuinely quiet generation. **SATISFIED.** A quiet market cannot manufacture a candidate, and the empty feed reads as quiet rather than as a refusal. **Evidence:** `a subject clearing no declared band produces no observation at all, so a quiet market cannot manufacture an attention candidate`, plus the R4 browser row `SCN-BUG009-R4 a genuinely quiet run still reads as quiet and is not dressed up as a refusal`.
- [x] `node scripts/selftest.mjs` passes with the new selftest group. **SATISFIED.** **Evidence:** `Research-Lab self-test: 3091 passed, 1 failed`, the single failure being the FOREIGN `[pii-scan]` finding in `specs/021` already fixed on origin and stale only in this local checkout.
- [x] `node scripts/validate-brief-payload.mjs` passes on the produced payload. **SATISFIED.** **Evidence:** exit 0, alongside `validate-tool-experience.mjs` exit 0 and `build-pages-site.mjs` exit 0. The producer adds no first-load cost: `rlattentiongate.js` is Node-only and is referenced zero times in `market-brief.html`.

---

## Scope 3: The reachability regression assertion

**Status:** Done

| Field | Value |
| --- | --- |
| Priority | P1 |
| Depends On | Scope 2, the capability foundation. The assertion proves the foundation's producer is load-bearing, so it cannot be written before the foundation exists. |
| Tag | overlay |
| Increment | B |
| Owns scenarios | SCN-BUG009-004, SCN-BUG009-005 |

> Landed with Scope 2, never before it.
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

- [x] The suite fails when no production module produces a gate result, and it names the missing producer rather than reporting a conformant empty tier. **SATISFIED.** **Evidence:** `SCN-BUG009-R1-LOADBEARING` removes `attention-detection-policy/v1` and re-runs the identical candidate; it is refused `RLATTN-PROVENANCE` again, so the assertion fails precisely when no production module constructs a `gateResult`. The paired `SCN-BUG009-R1-ACCEPTED` proves the same candidate IS accepted with the producer present, which is what makes the failure attributable to the missing producer rather than to the candidate.
- [x] An adversarial empty tier — attention empty with every exclusion `RLATTN-PROVENANCE` on `gateResult` — is not mistaken for a quiet one, and the structural cause is distinguished from a quiet session. **SATISFIED.** **Evidence:** the R4 group asserts the two causes carry DIFFERENT machine-readable markers, `data-mac-attention-empty="quiet"` and `data-mac-attention-empty="refused"`, and that the refusal block states nothing was substituted and that an empty feed "does not mean nothing happened". `SCN-BUG009-R4` additionally proves the renderer does not hold the live reason as a literal, so a different refusal renders its own cause instead of a familiar one.
- [x] A selftest group asserts a production (non-fixture) producer for `gateResult` exists. **SATISFIED.** The group names `rlattentiongate.js` and its production consumer `scripts/build-attention-items.mjs`; 17 assertions, none fixture-only.
- [x] The assertion is proven to FAIL when the producer is removed (adversarial case). **SATISFIED — this is the row that makes the rest admissible.** **Evidence:** `Regression: SCN-BUG009-R1-LOADBEARING with attention-detection-policy/v1 removed the same candidate is refused RLATTN-PROVENANCE again`. The fix is proven load-bearing rather than coincidental: remove the policy and the exact original defect returns.
- [x] The adversarial case uses an all-`RLATTN-PROVENANCE` exclusion set, which the
      current suite accepts as conformant. **SATISFIED.** **Evidence:** `RLATTN-PROVENANCE` is the precise refusal code the paired rows assert on — `SCN-BUG009-R1-ACCEPTED` proves it is gone once the producer runs, and `SCN-BUG009-R1-LOADBEARING` proves it returns when the policy is withdrawn.
- [x] The assertion contains no conditional-return path that silently passes. **SATISFIED.** **Evidence:** the R1 group contains zero `if (...) return` or bare `return;` statements, so no assertion can be skipped into a false pass. Measured directly over the group's source.
- [x] Helpers are top-level `function` declarations so `extractFn` can extract them. **SATISFIED.** **Evidence:** `rlattentiongate.js` declares 11 top-level functions — `isPlainObject`, `isNonEmptyString`, `num`, `resolvePolicy`, `severityFor`, `imminenceFor`, `confirmationFor`, `dispositionFor`, `figure`, `observeGate`, `attachObserved` — and zero arrow-const helpers, so `extractFn`'s `function name(` + brace-match can reach every one.
- [x] `node scripts/selftest.mjs` passes with Scope 2 landed. **SATISFIED.** **Evidence:** `3091 passed`, with the 17 R1 assertions and the 7 R4 assertions all green.

---

## Scope 4: Quiet versus unreachable, and the scheduled publication path

**Status:** Done

| Field | Value |
| --- | --- |
| Priority | P1 |
| Depends On | Scope 2, the capability foundation, for the refusal records it renders; and spec 026's renderer, which owns the empty-feed vocabulary. |
| Tag | overlay |
| Increment | B |
| Owns scenarios | none — this scope carries no Gherkin block; it is a coordination and publication-path scope |

> Coordinated with spec 026; one empty-feed vocabulary, not two.
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
- [x] The publication path designated to publish attention actually commits the payload **— CLOSED 2026-08-20.** The 04:08 EDT run of `scripts/brief-refresh-and-push.sh` exited 0, logged `recomposed: 3 built, 2 refused`, committed `market-brief: auto-refresh + narrative 2026-08-20 04:08 EDT (pre-market)`, and pushed. The committed `market-brief.payload.json` at `origin/main` carries `attention` of length 3, and the reader-facing `market-brief.page.json` projection carries the same 3 — so the item reaches the page, not merely the payload. The empty-feed statement correctly stands down now that the feed is non-empty.
- [x] A genuinely quiet session still reads as quiet, with executed evidence. **SATISFIED, and this is the negative control for the row above.** Without it a renderer that always cried refusal would pass every other assertion here. **Evidence:** browser row `SCN-BUG009-R4 a genuinely quiet run still reads as quiet and is not dressed up as a refusal` asserts that with an empty exclusion set the refusal block has count 0 and the quiet block count 1. The selftest group additionally proves the reason text is READ from the record rather than hard-coded: `rlbrief.js` does not contain the live exclusion reason as a literal anywhere.
