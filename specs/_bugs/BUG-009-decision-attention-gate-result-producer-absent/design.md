# Design: BUG-009 — Root Cause Analysis And Candidate Remedies

This document establishes the causal chain, locates the defect precisely, enumerates
candidate remedies, and selects **none**. Remedy selection is an owner decision.

---

## 1. The causal chain

```
spec 017 ships decision-attention/v1
   requires buildAttentionItem(gateResult, authored, ctx)
   specifies a producer for `authored` (the lane) and `ctx` (committed artifacts)
   specifies NO producer for `gateResult`                        ← the hole
        │
        ▼
the signals lane authors legacy narrative-catalyst items
enforcement is not yet armed, so they render
the list sits pinned at 7 for three weeks — a hand-maintained roster
        │
        ▼
2026-08-10  BUG-007 arms enforcement and repairs the payload IN PLACE, once
            aeb1bcbc3 → attention length 3, exclusions RLATTN-OVERLAP (semantic)
            BUG-007 never examines gateResult: 0 occurrences across 8 artifacts
        │
        ▼
the next generation runs. The lane authors judgement only, per its own contract.
recomposePayloadAttention reduces payload.attention back into candidates.
A non-`decision-attention/v1` item is passed through AS-IS, so `.observed` is undefined.
        │
        ▼
gateResult === undefined
   → rlattention.js:486  !isPlainObject(gateResult)
   → refuse("RLATTN-PROVENANCE", "gateResult", …)
   → 100% of candidates refused, attention: []
        │
        ▼
attention: [] is CONTRACT-VALID. selftest stays green: 2843 passed, 0 failed.
The payload renders "Nothing requires attention in this window."
        │
        ▼
self-perpetuating: each run writes [], the next run's lane writes judgement-only
items into it, recompose refuses them all, [] again. 8 days. ~32 windows.
```

## 2. The defect, located precisely

**`scripts/brief-narrative-parallel.mjs:83`** (the signals lane instruction):

> *"For every attention item author only the judgement … **Author no serialized
> envelope field for an attention item**; the publish-time build step derives each of
> those from a committed contract"*

**`scripts/build-attention-items.mjs:211`** (the composer's input):

```js
const observed = candidate && typeof candidate === 'object' ? candidate.observed : null;
```

**`rlattention.js:486`** (the refusal):

```js
if (!isPlainObject(gateResult)) {
  return refuse("RLATTN-PROVENANCE", "gateResult", "an attention item is built from an observed gate result");
}
```

The lane is contractually forbidden from producing `candidate.observed`. The
composer requires it. **Nothing sits between them.** The build step's own header
comment is candid about the intent and unknowingly names the gap:

```
 *   gateResult  observed      — the candidate's own market facts
 *   authored    judgement     — what the lane wrote, and nothing else
 *   ctx         deterministic — committed calendar, watchlist and vocabulary
```

Two of those three have producers. The comment describes an architecture that was
designed but only two-thirds built.

## 3. What the defect is NOT

Recording these explicitly, because each would send a remedy in a wrong direction.

| Wrong diagnosis | Why it is wrong | What it would cause |
| --- | --- | --- |
| "the builder has no scheduled caller" | `scripts/brief-refresh-and-push.sh:514` calls it every publication window; the 2–7 exclusions written per run are proof it executed | Wiring an already-running builder into `tier-a.yml`; feed stays empty |
| "the composer is broken" | Given an observed gate result from real tool-read state it accepts: `built=1, refused=0` (report.md §E5) | Editing certified contract code that is behaving correctly |
| "the lane is misbehaving" | The lane is obeying its instruction exactly. The instruction is correct in isolation | Rewriting a prose instruction, which `build-attention-items.mjs`'s own header already records as having failed once before |
| "the payload is corrupt" | The payload is contract-valid. `validate-brief-payload.mjs` accepts it | A hand edit to `market-brief.payload.json`, which is fabrication |
| "BUG-007 broke it" | BUG-007 made an always-absent capability *visible*. There was never a gate-detection producer | Reverting a correct fix |

## 4. Candidate remedies — NONE SELECTED

### R1 — Build an observed gate producer over committed Tier-A state

Add a step that reads `market-brief.snapshot.json` / `payload.toolReads` and emits
gate results with real figures, real `sourceId`, real `asOf`.

- **Closes:** EB-1, EB-2, AC-1, AC-3.
- **Blocked on:** AC-2. Requires an owner-declared mapping from observed crossings to
  `disposition`, `severity`, `imminence`, `marketConfirmation.state` and
  `transmissionPath`. `market-brief.config.json` declares numeric thresholds
  (`rotationFlipWarnZ`, `regimeChangeVixJump`, `gammaFlipProximityPct`,
  `notableMemberMinMovePct`) and a `red-alert-policy/v1` scoring model, but **no such
  mapping**. An implementer choosing it is inventing product policy.
- **Cost:** a new committed policy artifact, a new module, a new selftest group.

### R2 — Wire the certified `rlmarketaction.js` candidate pipeline

`rlmarketaction.js` already exports `validateAnomalySeed`, `clusterAnomalySeeds`,
`assembleCandidate`, `scoreCandidate`, `qualifyCandidate` and a declared
`red-alert-policy/v1` with a `scoreThreshold` of 75.

- **Attractive because** the scoring policy is already declared and owner-approved.
- **Blocked on:** the *anomaly seed* producer, which also does not exist —
  `grep -rn "validateAnomalySeed|clusterAnomalySeeds|assembleCandidate" scripts/`
  returns nothing. R2 relocates the hole one layer up rather than closing it.

### R3 — Let the lane author the observed half

Reverse the F-017-06 cutover and permit the lane to emit `observed`.

- **Closes:** EB-2 quickly.
- **Rejected direction, recorded for completeness.** `build-attention-items.mjs`'s
  header documents that this exact arrangement already failed: *"Three consecutive
  cron publishes emitted ZERO conforming items while that instruction was intact …
  A prose instruction to a language model is advisory."* It also violates EB-4: a
  model-authored "observed" market fact is not observed.

### R4 — Report the unreachable state honestly, without restoring the feed

Classify the empty-feed cause and stop rendering the quiet statement when every
candidate was refused on structural grounds.

- **Closes:** EB-3 only. The feed stays empty; the reader stops being misinformed.
- **Coordination constraint:** the first-class published form of this statement is
  claimed by spec 026 as `IP-026-004` (dark state, `FR-026-021`–`FR-026-024`) and is
  listed as out of scope for this bug. R4 must be executed **by or with** spec 026,
  not independently, or the two will collide on the same surface.
- **Note:** R4 is the only candidate that is implementable today without inventing
  policy. It is also the only one that does not restore the capability.

### R5 — Add the missing reachability assertion

Assert that a producer for `gateResult` exists on the publication path.

- **Closes:** EB-5, AC-6 — the escape route BUG-007 left open.
- **Constraint:** this assertion is **red until R1 or R2 lands**. `scripts/selftest.mjs`
  gates the Pages deploy, so landing it red halts the release channel. R5 must land
  **with** its remedy, not before it.

**R1 AND R4 ARE NOW SELECTED AND LANDED (2026-08-19). R2 is superseded by R1. R3 remains a
documented regression. R5 is now landable because its remedy has landed.**

R4 closed EB-3 — the empty feed now states refusal rather than reading as calm — by
implementing the statement inside spec 026's own renderer, which met its coordination
constraint.

R1 closed the producer gap. `rlattentiongate.js` derives the observed half of a
`decision-attention/v1` item from committed Tier-A state and a NEW external policy artifact,
`attention-detection-policy/v1` in `market-brief.config.json`. The objection §9 raised — that
an implementer choosing the mapping is inventing product policy — is answered structurally
rather than waived: the producer carries NO threshold of its own, so an absent or partial
policy resolves to `null` and it emits nothing. The judgement therefore lives in a committed,
versioned artifact the owner edits, not in code, and `SCN-BUG009-R1-NODEFAULT` asserts exactly
that. The band VALUES were drafted under the owner's explicit delegation and are conservative
by construction: only a SEVERE reading that INDEPENDENTLY PERSISTED reaches `attention`, and a
severe but unconfirmed reading is demoted to `context`. Against real committed state that
currently yields 9 observed subjects, all `context`, and zero interruptions.

R2 is superseded rather than rejected. Its blocker was real and was verified in source:
`assertCandidateShape` in `rlmarketaction.js` requires an integer `severity` 1–5 and a finite
`likelihoodInterval`, and `runQualification` gate 4 requires authored `thesis`, `whyNow` and
`trigger`. Those are authored judgement, so wiring that pipeline would have relocated the hole
exactly as §4 predicted. R1's `decision-attention/v1` contract is the lighter one: the lane
authors its judgement half and the gate supplies the observed half, which is derivable.

## 5. Why the proposed regression tests would not have caught this

The incoming report proposed two test shapes. Both are green today, and both were
green throughout the outage. Recording this because it is the most reusable lesson
in the packet.

| Proposed assertion | State today | Would it have caught the defect? |
| --- | --- | --- |
| "the pipeline can produce at least one accepted item from representative observed state" | **Green.** Proven at report.md §E5: `built=1, refused=0` | **No.** It tests the composer, which works. It passes with a fixture regardless of whether any producer exists |
| "the builder has a caller on the publication path" | **Green.** `scripts/brief-refresh-and-push.sh:514` | **No.** The builder has had a caller throughout the entire eight-day outage |

The assertion that would have caught it is different in kind:

> **A production module — not a test fixture — constructs a value passed as
> `gateResult` to `RLATTN.buildAttentionItem`.**

That is a *producer-existence* assertion, and it is red today. It is the only shape
that distinguishes "the tier is quiet" from "the tier cannot fire", because it tests
the half of the contract that has no implementation. It is R5, and it must land with
R1 or R2.

The general lesson, stated once: **a contract-conformance test cannot detect a
capability that produces nothing, because producing nothing is conformant.** Every
tier composed from N inputs needs one assertion per input that the input has a
producer, not only that the composition validates.

## 6. Secondary observation — the scheduled job does not publish the payload

`.github/workflows/tier-a.yml` does not include `market-brief.payload.json` in its
`git add` list, and never references `scripts/brief-refresh-and-push.sh`. The payload
is committed exclusively by the operator-hosted wrapper, visible in the commit
authorship (`market-brief: auto-refresh + narrative <date> <window>`).

**Re-classified 2026-08-20.** This was originally recorded as a secondary DEFECT, as
if the workflow had forgotten a path. It had not. `brief-refresh.mjs` reads the payload
as a COMMITTED artifact and never writes it, and says so in its own comment, naming the
R-5 boundary. Across 197 commits touching the payload the tier-a bot has authored
**zero** of them, so the boundary is not merely stated, it has held. Adding the path to
that `git add` list would stage whatever happened to be dirty in the runner — precisely
what the step's own comment forbids. The narrative is authored by four LLM lanes in the
operator-hosted wrapper, and the scheduled job deliberately calls no external model.
This re-classification was made after nearly applying the wrong fix.

**The real question, still open.** The OBSERVED half of an attention item is derived
from committed Tier-A state and needs no model at all. The scheduled job could
therefore run `build-attention-items.mjs --recompose --write` and keep published
observations consistent with current data between narrative runs. Today an item can go
on referencing a reading that has since moved out of band — and conversely, recomposing
would make published items disappear as data moves. Whether stale-but-stable or
fresh-but-disappearing is the better contract for a reader is an owner decision, and it
is what `DISC-009-004` now tracks. It is NOT a missing path.

**The mechanism was then executed, so the decision is not also a gamble on the tooling.**
Run against the live payload on 2026-08-20, `build-attention-items.mjs --recompose`
exits 0 and reports `1 built, 0 refused` with `violations=0`. Adding `--write` rewrites
88 lines, which looks alarming and is not: comparing the payload before and after shows
**zero semantic change**, and the only two top-level keys that move are `attention` and
`budget` — precisely the two the step owns. A second `--write` is byte-identical to the
first, so the step is idempotent after one normalization and does not churn. The 88 lines
are key ordering inside the regions it legitimately rewrites, which is why the step's own
"additive or nothing" guard — which checks for LOST keys — correctly does not fire.

That narrows `DISC-009-004` to what it always was. The scheduled job COULD call this step
safely today; the reason not to is the reader contract, not a defect. An owner choosing
stale-but-stable is accepting a known-good mechanism they have decided not to run, which
is a different and much smaller decision than the one this record used to imply.

---

## Capability Foundation

The proportionality triggers apply. Closing this bug required not one instruction
fix but **seven consecutive ones**, each a different contract the publication gate
enforced and the authoring instruction never stated. Six of those were fixed by the
same move. That is a capability, not a coincidence, and it is modelled
foundation-first.

The foundation is the **rendered-instruction contract**: an authoring instruction
is DERIVED from the very constant the publication gate refuses on, never restated
alongside it. A restatement is correct on the day it is written and silently wrong
the first time the constant moves — the gate arms, the sentence does not, and the
author is refused over a value nobody offered them. This repository had already
discovered the pattern once, for the §9 event keys, and left a comment saying so;
this work generalised it rather than inventing a second approach.

### Foundation contracts

| Contract | Shape | Owner |
| --- | --- | --- |
| rendered-instruction | `() => string`, derived from an enforcing constant, interpolated into the lane template literal | `scripts/build-attention-items.mjs` |
| offered-term matcher | `(terms[], instruction) => unofferedTerms[]`, whole-value match with a hyphen-safe boundary and regex-escaped terms | `scripts/build-attention-items.mjs` |
| gate-vocabulary export | a frozen array or predicate re-exported from the enforcing module so instruction and refusal read ONE source | `rlattention.js` |

### Foundation extension points

- **A new enforced contract** joins by adding one renderer that reads its enforcing
  constant, one interpolation in the lane, and one selftest pair asserting coverage
  and consumption. No prose is rewritten.
- **A vocabulary that gains a member** needs no artifact edit at all: the renderer,
  the instruction and the gate all move together by construction.
- **A guard that must prove its own example** uses the exported predicate rather
  than a restated pattern, so instruction and gate cannot agree with themselves
  while disagreeing with each other.

### Variation Axes

| Axis | Values observed | Why it varies |
| --- | --- | --- |
| Source of truth | code constant (`RESEARCH_VERBS`, `WATCHLIST_SCOPE`, `AUTHORED_JUDGEMENT_KEYS`); committed config (`output-budget/v1`); enforcing predicate (`isIsoInstant`) | The contract lives wherever it is enforced; the renderer follows it rather than relocating it |
| Contract cardinality | finite set (verbs, subjects, keys, measured fields); scalar cap (per-card chars); format (expiry instant) | A finite set is HANDED OVER; a scalar is stated; a format is taught by a worked example proven against the enforcing predicate |
| Proof obligation | coverage assertion; consumption assertion; example-validity assertion | What can drift differs per contract, so each renderer is pinned by the assertion that can actually catch its drift |
| Prose coexistence | replaces prose (verbs, subjects); coexists with prose (authored keys) | `SCN-017-045` requires explanatory prose for the authored fields, so those keys carry both a meaning sentence and a rendered list, and deliberately carry no "no second copy" rule |

## Concrete Implementations

| Implementation | Enforcing constant | Refusal it prevents |
| --- | --- | --- |
| `attentionVerbContractInstruction` | `rlattention.RESEARCH_VERBS` | `RLATTN-VERB` |
| `attentionSubjectMenuInstruction` | `WATCHLIST_SCOPE` | `RLATTN-PRIVACY` / unresolved subject |
| `attentionAuthoredKeysInstruction` | `AUTHORED_JUDGEMENT_KEYS` | `RLATTN-PROVENANCE:rationale`, `RLATTN-FALSIFIABILITY:escalationTrigger` |
| `attentionCardBudgetInstruction` | `output-budget/v1` | payload-budget refusal that discards the whole narrative |
| `attentionExpiryFormatInstruction` | `rlattention.isIsoInstant` | `RLATTN-FALSIFIABILITY:expiry` |
| `briefEventContractInstruction` (pre-existing) | event key constants | renamed event keys |

`findUnofferedTerms` is the shared matcher behind the coverage assertions for four
of these. It was extracted during the closing simplify pass, which also closed a
latent defect the duplicated inline copies carried: they matched on `\b`, which
finds `scenario` inside `scenario-test` and would report a hyphenated member as
offered when it never was. The extracted version also regex-escapes each term,
which the original verb matcher did not.

