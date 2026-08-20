# Spec: BUG-009 — Expected Behaviour Of The Decision-Attention Tier

This document states what the decision-attention tier is **supposed** to do, so the
gap recorded in [bug.md](bug.md) is measured against a written expectation rather
than against an impression. It specifies no remedy; remedy selection is the owner
decision this packet routes.

---

## 1. Source of the expectation

| Source | What it establishes |
| --- | --- |
| `notes/market-brief.md` §0 | The brief **owns** "the ranked attention feed (≤ 7 cards)" |
| `notes/market-brief.md` §10a | "a quiet session publishes fewer, and an empty list says so in words" |
| `notes/decision-attention.md` §7 | The publication path is `lane (judgement) → build-attention-items.mjs (envelope) → validate-brief-payload.mjs (refusal)`, and the composer takes three arguments with three distinct origins |
| `notes/decision-attention.md` §6 | The cap is 7 cards; an empty published list renders "Nothing requires attention in this window." |
| `rlattention.js` | The certified `decision-attention/v1` contract and its 12 closed refusal codes |
| `specs/017-decision-attention-and-developing-situations/` | The shipped tier specification (`status: done`) |

## 2. Expected behaviour

### EB-1 — The three composer inputs each have a producer

`notes/decision-attention.md` §7 declares a three-origin table:

| Argument | Origin | Producer on the publication path |
| --- | --- | --- |
| `gateResult` | observed — the candidate's own market facts | **none exists** |
| `authored` | judgement — what the lane wrote, and nothing else | `scripts/brief-narrative-parallel.mjs` (signals lane) |
| `ctx` | deterministic — committed watchlist scope, exchange calendar, window vocabulary, generation window | `attentionBuildContext()` in `scripts/build-attention-items.mjs` |

A documented origin with no producer is not a design; it is a hole. Every argument
the contract requires MUST be produced by a named component on the publication path.

### EB-2 — A run in which conditions warrant attention publishes at least one item

The tier is a ceiling, not a quota. It is correct for a run to publish fewer than 7
items, and correct to publish zero when nothing warrants interruption. It is not
correct for the maximum achievable count to be structurally zero.

### EB-3 — Quiet and unreachable are distinguishable, and are never conflated

Two conditions produce an empty `attention` array and they mean opposite things:

| Condition | `attention` | `attentionExclusions` | Honest reader statement |
| --- | --- | --- | --- |
| **Quiet** | `[]` | empty, or refusals on semantic grounds | "Nothing requires attention in this window." |
| **Unreachable** | `[]` | every candidate refused on a structural provenance ground | must not read as quiet |

Publishing the quiet statement while in the unreachable condition asserts a market
fact the run did not observe. `market-brief.payload.json` has been in the unreachable
condition since 2026-08-10 and has rendered the quiet statement throughout.

### EB-4 — A gate result is observed, never synthesized

Every field of a `gateResult` MUST derive from real computed state with real
provenance. A constant chosen to satisfy the validator, or a threshold mapping
invented by an implementer rather than declared by the owner, is a fabrication even
when the resulting envelope validates. This constraint outranks restoring the feed:
an empty honest feed is correct, a populated invented one is not.

### EB-5 — The suite detects structural unreachability

`node scripts/selftest.mjs` currently asserts that whatever the tier contains is
**conformant**. It asserts nothing about whether the tier is **reachable**. An empty
array satisfies every existing assertion, which is why the condition survived eight
days and roughly 32 publication windows with a green suite.

## 3. Observed behaviour

| # | Expectation | Observed at HEAD `373f4572d` | Holds |
| --- | --- | --- | --- |
| EB-1 | all three composer inputs have producers | `gateResult` has none; the only construction in `scripts/` is the fixture at `selftest.mjs:8522` | **No** |
| EB-2 | maximum achievable count is not structurally zero | every candidate refused `RLATTN-PROVENANCE:gateResult`; reproduced at `built=0, refused=1` | **No** |
| EB-3 | quiet is distinguishable from unreachable | the payload publishes the quiet statement while every candidate is structurally refused | **No** |
| EB-4 | a gate result is observed, never synthesized | not violated — nothing is synthesized, because nothing is produced at all | Yes |
| EB-5 | the suite detects unreachability | `2843 passed, 0 failed`, exit 0, while the feed is unreachable | **No** |

## 4. Acceptance criteria for a future remedy

These are the conditions a remedy must satisfy. They were recorded so the owner
decision had a target. **Remedy R4 shipped on 2026-08-20; the verdicts below are
an independent audit's, not the delivering agent's.** AC-1, AC-3, AC-4, AC-5 and
AC-7 are MET. AC-6 is met at name level only — the assertion exists and is named,
but the audit did not re-prove it by removing the producer. **AC-2 is PARTIAL and
owner-blocked:** the policy is declared in a committed artifact, but its band
values were drafted under delegation and have not been owner-reviewed, so the
"owner-approved" half is not claimed.

- **AC-1** A named component on the publication path produces `gateResult` values,
  and every field of every emitted gate result traces to committed computed state
  with provenance the composer can resolve.
- **AC-2** The detection policy — which observed conditions map to which
  `disposition`, `severity` and `imminence` — is **declared in a committed artifact**
  and owner-approved, not embedded as implementer-chosen literals.
- **AC-3** A representative observed state yields at least one accepted item through
  the unmodified composer, demonstrated by executed evidence rather than a fixture.
- **AC-4** A genuinely quiet session still publishes an empty feed, and that empty
  feed is reported as quiet.
- **AC-5** A structurally unreachable feed is reported as unreachable and is never
  rendered as quiet. Ownership note: the first-class published form of this statement
  is claimed by spec 026 as `IP-026-004` (dark state), so AC-5 must be satisfied in
  coordination with spec 026, not independently.
- **AC-6** A regression assertion fails when the tier becomes structurally
  unreachable again. See [design.md](design.md) §5 for why the two test shapes
  proposed in the incoming report would **not** have caught this, and what would.
- **AC-7** `market-brief.payload.json` is written by whichever path is designated to
  publish attention. It is currently absent from the `git add` list in
  `.github/workflows/tier-a.yml`, so the scheduled CI job cannot publish it even if
  it produced one.

## 5. Explicit non-goals of this packet

Two entries below were non-goals of the ORIGINAL document-and-route packet and were
overtaken when the operator authorized delivery. They are corrected rather than
deleted, so the change of scope stays visible:

- ~~Selecting a remedy.~~ **Superseded 2026-08-20.** Candidates R1–R5 are enumerated
  in [design.md](design.md) §4; **R4 was selected and implemented.**
- ~~Authoring detection thresholds, a disposition mapping, a severity scale, an
  imminence model, or a transmission model.~~ **Superseded 2026-08-20.** These were
  authored as `attention-detection-policy/v1` under explicit operator delegation.
  The values are deliberately conservative and are NOT owner-reviewed.
- Editing `market-brief.payload.json`. It is regenerated four times a day; a hand
  edit would be a fabrication, not a fix.
- Anything owned by `specs/026-actionable-brief-brevity-and-cross-asset/`: output
  budget caps, delta-only publishing, cross-asset coverage, the dark blindness state,
  progressive disclosure, and the open-call self-scoring loop.
- Adding a permanently-red assertion to `scripts/selftest.mjs`. That suite gates the
  Pages deploy; landing a red assertion would halt the release channel to document a
  finding this packet already documents in prose.

## Domain Capability Model

Proportionality applies, and it was not obvious at filing time. This packet opened
as a single defect — the observed half of an attention item had no producer — and
closing it required **seven consecutive instruction fixes**, six of which were the
same move applied to a different contract. That repetition is the signal: the
domain here is not "one missing producer" but **agreement between a publication
gate and the instruction handed to the author it judges**.

| Capability | Governed material | Concrete instances |
| --- | --- | --- |
| Observed-half production | committed Tier-A state → a gate result | severity, imminence, confirmation, disposition, figures |
| Rendered-instruction contract | an enforcing constant → an authoring sentence | verb vocabulary, subject scope, authored keys, card budget, expiry format |
| Refusal legibility | an exclusion record → reader-facing prose | quiet feed versus refused feed |

The second capability is the one this packet discovered. It is modelled
foundation-first in design.md `## Capability Foundation`, with its variation axes
and its five concrete implementations recorded there. The governing rule is one
sentence: **if the publication gate enforces a contract, derive the instruction
from the enforcing constant — never restate it.** A restatement is correct the day
it is written and silently wrong the first time the constant moves.

Single-capability treatment was rejected because the five instruction contracts
differ on axes that change their proof obligations — a finite set is handed over,
a scalar cap is stated, a format is taught by an example proven against the
enforcing predicate — and collapsing them would have produced one instruction that
is checked loosely rather than five that are each checked by the assertion able to
catch their own drift.

