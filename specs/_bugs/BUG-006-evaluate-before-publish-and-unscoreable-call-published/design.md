# Design: BUG-006 Evaluate-Before-Publish Ordering, And An Unscoreable Call Published (D16)

Links: [bug.md](bug.md) | [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

> **DO NOT FIX from this packet.** Everything below is analysis. No remedy has
> been selected, none has been implemented, and none may be implemented while a
> scheduled pipeline is writing this surface.

## Root Cause Analysis

### Defect A — the pipeline evaluates before it publishes

[`scripts/brief-refresh-and-push.sh`](../../../scripts/brief-refresh-and-push.sh)
runs, in file order:

```
:239   evaluate-recommendations.mjs        ← the ONLY evaluator invocation in the file
:250   brief-distributed-publish.mjs --prepare-tools   (barrier; produces the tool bundle)
:302   brief-narrative-parallel.mjs        (Tier-B authorship)
:407   brief-distributed-publish.mjs --root .          ← THE PUBLISH
:408   validate-distributed-briefs.mjs --graph-only
:438   build-scorecard.mjs
:560   git commit
:566   git push
```

The publish at `:407` reaches
[`brief-publication.mjs:210`](../../../scripts/brief-publication.mjs), which
appends this run's `proposed` rows to
`briefs/history/recommendations/<month>.jsonl`. The evaluator has already run,
168 lines earlier, and never runs again.

The script's own comment at `:236-238` states the intent plainly:

> *"Score every open call against its OWN published trigger/invalidation
> **BEFORE** the narrative lane runs, so the author sees this run's real track
> record rather than authoring blind."*

That intent is coherent and defensible — the author genuinely needs the current
track record before writing. The consequence is structural: **this run's own
output is, by construction, outside this run's evaluation window.** The
committed ledger is one evaluation behind for the entire interval until the next
cycle.

The failing assertion at
[`selftest.mjs:5370-5371`](../../../scripts/selftest.mjs) asserts the opposite:

```js
assert(evaluate.planEvaluation(ROOT, {}).rows.length === 0,
  'the evaluator is idempotent against the committed ledger — a re-run closes nothing twice');
```

Read carefully, that assertion is not really about *idempotence* — a second
`runEvaluation` genuinely cannot close an already-closed call, because
`foldLedger` marks the entry closed and
[`evaluate-recommendations.mjs:206`](../../../scripts/evaluate-recommendations.mjs)
skips it. What the assertion actually enforces is **completeness**: that the
committed ledger has no closure *pending*. The publisher's ordering cannot
guarantee that. The assertion and the pipeline encode contradictory contracts.

#### Why it is not red after every publish

The reported framing predicted a red/green oscillation on every cron cycle. The
ledger contradicts that; see [bug.md](bug.md#c1--fails-after-every-publish-is-not-supported-by-the-evidence).

`judge()` returns `null` for a `machine-checkable` call still inside its horizon
with nothing breached — *silence means open*. Such a call contributes **0** rows
and the assertion stays green. Thirty-six calls are in exactly that state right
now, including tactical calls from five recent publishes.

**The real trigger condition:** the assertion breaks when a publish mints a call
the evaluator can close **on sight** — no elapsed horizon, no price move
required. Two shapes qualify:

1. an unscoreable call (`not-evaluable` is emitted immediately on inspection) — **this is Defect B**;
2. a call whose declared level is already breached at publication time.

So Defect A is a **latent** structural contradiction. It becomes visible only
when Defect B (or shape 2) supplies the trigger. Recording them as one defect
would lose exactly that: fix B and A goes quiet without being fixed; fix A and B
still breaches D16 while `main` stays green.

#### Contributing factor A2 — the publisher path never runs `selftest`

There are **two** commit paths into this branch, and they hold different
standards:

| Path | Evaluate | `selftest` before commit | Result |
|---|---|---|---|
| [`.github/workflows/tier-a.yml`](../../../.github/workflows/tier-a.yml) | `:112` | **yes**, `:131`, hard and ungated | Self-consistent: it closes the pending call at `:112`, then asserts at `:131`. Passes. |
| [`scripts/brief-refresh-and-push.sh`](../../../scripts/brief-refresh-and-push.sh) | `:239` | **no** — zero references to `selftest` in the file | Commits (`:560`) and pushes (`:566`) a ledger state that would fail the check. |

This is why the red state reaches `origin/main` unobserved, and why it later
heals: the next `tier-a` run evaluates at `:112`, closes the pending call, and
its `:131` selftest then passes.

It is recorded as a **contributing factor to Defect A**, not a third defect,
because it is the same axis — pipeline ordering and gating. It matters for
remedy selection: see the warning under R3 below.

### Defect B — an unscoreable tactical call was published

The published call, from the ledger (`eventType: proposed`, run
`dist-2026-08-04-morning-0a21f353a9b4`):

- `horizon: tactical`, `direction: hedge`, `instrument: VIX`, `confidence: 55`
- `evaluability: not-evaluable`, `evaluabilityReason: no-attributable-invalidation-level`
- `levels: 4` — **all four** carry `source: "trigger"`; **zero** carry `source: "invalidation"`

**D16** ([`docs/Improvement-Plan.md:736`](../../../docs/Improvement-Plan.md)):

> *"**No unscoreable tactical or swing call is published.** If a level cannot be
> attributed, the claim is withheld rather than emitted as `not-evaluable`."*

This call is `tactical` and it was published as `not-evaluable`. That is a
direct breach.

#### Why it happened — grounded, not inferred

The `invalidation` prose is **not** empty and **not** number-free. It reads:

> *"A SPY daily close **below** the 755.68 gamma flip into negative gamma, or a
> SPY close **below** its 50-day (~745.0) on a fresh shock, argues to keep or
> re-add the residual rather than run it off; SPY closing at/**above** the 765
> call wall with VIX settling back **under ~16** removes the residual need (let
> it expire)."*

[`recommendation-body.mjs:236-243`](../../../scripts/recommendation-body.mjs)
classifies each extracted level against the call's **own declared direction**:

```js
const sign = ACTION_DIRECTION[direction];          // hedge → -1
const breakRelation = sign >= 0 ? 'below' : 'above';   // hedge → 'above'
const classify = (level, defaultSource) => {
  const improvement = level.upside || (defaultSource === 'invalidation' && level.relation !== breakRelation);
  return { ..., source: improvement ? 'trigger' : defaultSource };
};
```

For a `hedge` (short-biased, sign `-1`) the **break** case is a move **up**. The
author wrote the risk side **down** (`below 755.68`, `below ~745.0`), so every
one of those levels is read as the hedge's *improvement* branch and reclassified
to `trigger`. With zero surviving invalidation levels,
[`:259-262`](../../../scripts/recommendation-body.mjs) sets
`no-attributable-invalidation-level`.

Re-running the shipped builder on the **exact published text**, varying only the
action family, confirms this with no interpretation required:

| `action` | `directionSign` | `breakRelation` | trigger levels | invalidation levels | evaluability |
|---|---|---|---|---|---|
| `hedge` | −1 | `above` | 4 | **0** | `not-evaluable` / `no-attributable-invalidation-level` |
| `add` | +1 | `below` | 1 | **3** | `machine-checkable` |

Raw output: [report.md](report.md#e5--root-cause-the-same-text-under-two-action-families).

**The classifier is behaving as designed.** That reclassification is the
anti-free-win rule the repository deliberately shipped, and
[`selftest.mjs:5347-5356`](../../../scripts/selftest.mjs) pins it with two
adversarial assertions that pass. Closing such a call `not-evaluable` afterwards
is **honest downstream handling** — the alternative would be scoring a hedge as
a win because the market fell.

**The defect is upstream, at the publish gate.**

#### Why the gate did not stop it

D16 has **no mechanical enforcement anywhere on the publish path.**

- [`validate-brief-payload.mjs:72`](../../../scripts/validate-brief-payload.mjs)
  — the gate the publish path actually runs — requires `invalidation` to be
  **non-empty text**, nothing more. It checks the tactical confidence cap
  (`:77`) but never evaluability.
- The only D16 surface is a **natural-language string in an LLM prompt**,
  [`brief-narrative-parallel.mjs:232`](../../../scripts/brief-narrative-parallel.mjs).

The contrast inside that same file is stark and self-documenting: the comment at
`:222-226` says the *vocabulary* rule is *"Enforced by
`scripts/validate-brief-payload.mjs` on the publish path and by
`scripts/audit-reader-legibility.mjs` on the rendered page (D13)"*. The
evaluability comment at `:227-231` claims **no enforcement surface at all**. D16
is a request to a model; D13 is a gate.

#### And the instruction is under-specified

The prompt demands *"a numeric price level on a named instrument that is in the
committed universe, written with an explicit direction word."* The published
call **satisfied that literally** — four numerals, named instruments, explicit
direction words — and was still unscoreable, because the instruction says
nothing about which **side** the level must land on after direction-aware
attribution.

For a `hedge`, an attributable invalidation level must be an **`above`** level.
The prose did contain one (*"SPY closing at/above the 765 call wall"*), and it
was **not** extracted as an `above` level — the four extracted levels are all
`below`.

> **Open question, not a claim.** Why *"at/above the 765 call wall"* produced no
> `above` level has **not** been established. It could be the `at/above`
> compound form, the *"call wall"* noun phrase, or something else in
> `extractLevels`. Establishing it requires reading the extractor, which is out
> of scope for this document-only packet. Recorded as finding **DISC-006-004**.

### Why this is the exact problem Step 6 exists to solve

[`docs/Improvement-Plan.md:444-446`](../../../docs/Improvement-Plan.md), Step 6:

> *"The proposal path **refuses** to emit `evaluability: not-evaluable` for
> `swing` and `tactical` horizons — if no level can be attributed, no call is
> published. An unscoreable tactical call is not a call."*

That refusal is the missing control. Step 6 is bound `delivery=required` to spec
015 ([`features.md:61`](../../../docs/releases/improvement-plan/features.md)),
and spec 015 is `status: blocked` / `certification.status: blocked`. **The
required preventive feature is not delivered**, so the breach is expected rather
than surprising — but it is still a breach, and it is still accumulating cost.

### Measured consequence

Committed `market-brief.scorecard.json`, 30-day window:

| Slice | `closed` | `resolved` | `notEvaluable` | `notEvaluableShare` |
|---|---|---|---|---|
| **all** | 183 | 33 | 150 | **0.8197** (target ≤ 0.25) |
| `tactical` | 41 | 2 | 39 | 0.9512 (`insufficientSample: true`) |
| `swing` | 106 | 2 | 104 | 0.9811 (`insufficientSample: true`) |
| `structural` | 36 | 29 | 7 | 0.1944 |
| `hedge` (direction) | 43 | 2 | 41 | 0.9535 |

Every unscoreable call published adds one to `notEvaluable` and zero to
`resolved`, pushing the share further from its ≤ 0.25 target. Because the ledger
is append-only (FR-006-006), that cost is **permanent** — no future fix can
retro-score it.

> **Not claimed.** `hedge` at 0.9535 is suggestive given the direction-sign
> mechanism above, but `rotate` and `add` (both sign `+1`) sit at **1.0**, so a
> direction-sign-wide explanation is **not** supported by this evidence. The
> grounded claim is limited to the single call re-derived in
> [report.md](report.md#e5--root-cause-the-same-text-under-two-action-families).
> A cohort analysis is finding **DISC-006-005**.

## Candidate Remedies, And Which Defect Each Addresses

**None of these is selected. None is recommended here.** Costs and unknowns are
stated so the owner can choose.

| # | Remedy | Addresses | Cost / risk |
|---|---|---|---|
| **R1** | Add a second evaluator pass **after** the publish at `:407` | **A only** | See [the loop question](#r1-the-loop-question--must-be-assessed-before-any-attempt). Does not stop the D16 breach; it only closes the unscoreable call sooner. `notEvaluableShare` still degrades. |
| **R2** | Enforce D16 mechanically at the publish gate — refuse a `swing`/`tactical` action whose body resolves to `not-evaluable` | **B only** | This is Step 6, i.e. spec 015 work, currently `blocked`. Consequence: the brief ships with **fewer** calls, or a lane must re-author. Needs a stated policy for the refusal path — drop the action, or fail the run? Leaves A latent, awaiting the next on-sight-closable call. |
| **R3** | Run `selftest` in `brief-refresh-and-push.sh` before `:560` | **A2 only** | Surfaces the problem instead of hiding it, but **on its own it converts a red `main` into a failed publish — the brief stops shipping.** Only safe *after* A or B is resolved. |
| **R4** | Restate the assertion to match the ordering that actually exists | **A only, by redefinition** | **Highest risk. See the warning below.** |
| **R5** | Sharpen the D16 wording to speak in attributed-level terms (FR-006-004) | **B, partially** | Cheap and strictly beneficial, but it is still an instruction to a model, not a gate. Necessary, not sufficient. |
| **R6** | Establish why *"at/above the 765 call wall"* yielded no `above` level | **B, diagnostic** | Read-only investigation. May reveal a separate extractor gap. Prerequisite for judging whether R5 alone would have changed this outcome. |

Note the shape: **no single remedy closes both defects.** Any complete fix is a
combination — which is precisely why they are filed as two.

### ⚠ The risk of "fixing" this by relaxing the assertion (R4)

R4 is the cheapest-looking option and the most dangerous.

The assertion is currently the **only mechanical signal** that an unscoreable
call reached the ledger. There is no D16 gate
([E6](report.md#e6--d16-is-a-prompt-string-not-a-gate)), and the scorecard
publishes `notEvaluableShare` as a **number**, not as a failure — a share
drifting from 0.8197 to 0.83 raises nothing.

So if the assertion is weakened to accommodate the ordering — for example by
allowing `rows.length <= 1`, by excluding `not-evaluable` verdicts from the
count, or by evaluating a synthetic post-publish ledger instead of the committed
one — then:

1. `main` goes green;
2. the D16 breach **remains**, silently;
3. every future unscoreable call publishes with **zero** signal;
4. `notEvaluableShare` continues to climb away from its ≤ 0.25 target;
5. and the repository's central product claim — a measured, published error rate
   — degrades while every check reports healthy.

That is a strictly worse state than a red `main`. A red build is loud; a
silently-relaxed invariant is not. **If R4 is chosen at all, it MUST be paired
with R2**, so that the signal being removed from the assertion is replaced by a
real gate rather than deleted.

The same caution applies in weaker form to R1: closing the unscoreable call
faster makes the symptom disappear while the D16 breach continues.

### R1: the loop question — MUST be assessed before any attempt

**Stated plainly, as required: a second evaluate after the publish must be
assessed for whether it can loop. That assessment has NOT been performed and
this packet does not perform it.**

What is established:

- **Call lifecycle — a loop looks unlikely.** `runEvaluation` appends *outcome*
  rows, never `proposed` rows. `foldLedger` then marks the entry `closed`, and
  [`evaluate-recommendations.mjs:206`](../../../scripts/evaluate-recommendations.mjs)
  skips closed entries. A closed call cannot re-open, so the fixed point is
  reached in one extra pass. **Reasoning from the code, not from a test run.**

- **Artifact fingerprints — a real, unassessed hazard.**
  [`runEvaluation`](../../../scripts/evaluate-recommendations.mjs) at `:318-340`
  does **three** things beyond appending a row:
  1. rewrites `briefs/history/recommendations/<month>.jsonl`;
  2. writes a **new** index at a **new** fingerprint path,
     `briefs/indexes/<fingerprint>/history.json`;
  3. rewrites `briefs/history-current.json`'s `historyIndexRef` **pointer**.

  The publish at `:407` freezes an immutable run manifest recording *"the exact
  publication inventory"*, including a `sha256` per history partition
  ([`brief-publication.mjs:215-232`](../../../scripts/brief-publication.mjs)).
  Mutating that partition **after** the manifest is frozen is exactly the
  drift the distributed publisher is documented to reject — the `:250` barrier
  comment states the publisher *"rejects any snapshot/registry/fingerprint
  drift"*. Moving the canonical history pointer post-publish also interacts with
  the shipped selftest assertions *"the projected site resolves one canonical
  current history index"* and *"orphan history indexes are identified separately
  and cannot replace the current pointer target"*.

  **Claim source: interpreted, from reading the code. Not executed. Not
  proven.** It is raised because a remedy that trips it would trade a failing
  assertion for a failing publish — the R3 failure mode by another route.

Anyone attempting R1 must first establish, with executed evidence:

1. whether `validate-distributed-briefs.mjs` and the next run's `--prepare-tools`
   barrier accept a partition mutated after the manifest was written;
2. whether the moved `historyIndexRef` pointer leaves the prior index orphaned in
   a way the site projection or selftest rejects;
3. whether `build-scorecard.mjs` at `:438` — already downstream of `:407` —
   needs to move relative to the new evaluate;
4. that a second `planEvaluation` after the second `runEvaluation` returns **0**
   rows on a real ledger, not on a fixture.

## Ownership And Routing

| Concern | Owner | Why |
|---|---|---|
| Remedy selection (R1–R6, and any combination) | repository owner | Trades brief availability against invariant strength. Not an agent decision. |
| Defect B mechanical enforcement (R2) | spec `015-recommendation-outcome-ledger-and-track-record` | Step 6 `born-evaluable-calls`, `delivery=required`, currently `blocked`. |
| Loop assessment for R1 | repository owner, after selection | Requires executing against the real publish path — forbidden while the scheduler is live. |
| D16 wording (R5) | repository owner | `docs/Improvement-Plan.md` is an owner-authored surface. |
| Extractor diagnosis (R6) | repository owner | Read-only, but it is scripts-adjacent analysis this packet was scoped out of. |

## What This Design Does NOT Do

- It does not select a remedy.
- It does not modify `scripts/**`, `tests/**`, `rl*.js`, `specs/004-*`, the
  ledger, or any brief artifact.
- It does not claim the loop question is answered.
- It does not claim `notEvaluableShare` can be recovered — the ledger is
  append-only and past verdicts stand.
