# Spec: BUG-019 — A Claim Age The Pack Cannot Price Is Refused, Not Extrapolated

## Purpose

The Lifetime Tax Strategy Lab prices a Social Security claim age by counting the months between
that age and the household's full retirement age and applying the rule pack's per-month reduction
factors once per counted month. The pack states, in the same rule object that carries those
factors, that the count has a maximum: sixty months, thirty percent, corresponding to a claim at
age sixty-two. The engine reads the factors and ignores the maximum.

The consequence is that a claim age below the statutory earliest age produces a figure instead of
a refusal, and that figure is described with the route's own settled-fact vocabulary. This
specification states the behaviour that replaces it.

It does not specify a new pricing rule. It specifies where pricing stops.

### Single-Capability Justification

**Classification:** Existing-capability extension with one pack-backed implementation.

This packet extends the existing claim-age adjustment contract. `tax-rules/benefit/2026.json`
adds `earliestClaimAge` inside the existing `earlyReductionRule` record.
`rltaxsocialsecurity.js::applyClaimAgeAdjustment` reads that figure before the existing
per-month factor loop. It reuses the existing citation and `RLTAX-THRESHOLD-UNAVAILABLE`
contracts.

The packet adds no second benefit engine, pack provider, claim-age strategy, or schema adapter.
The pack already owns sourced thresholds, and the engine already owns claim-age adjustment. A
new foundation would duplicate those boundaries. The matching design classification is
`### Single-Implementation Justification`, not a foundation and overlay split with invented
variation axes.

## Behaviour Under Specification

A household declares a claim age in whole months. The route resolves a full retirement age from
the declared birth year and the pack's `fullRetirementAgeTable`, then decides whether the claim
age is early, on time, or delayed.

The early branch is the one under specification. Today its only lower bound is a finiteness and
sign check. Under this specification it acquires a second bound, sourced from the pack rather than
from the engine, below which it produces a refusal carrying the reason and the remedy.

The delayed branch already stops at `delayedCreditRule.stoppingAgeYears`. That stop is a clamp
rather than a refusal, and this specification treats the silence of that clamp as in scope.

## Requirements

### FR-019-001 — The earliest claim age is a declared, sourced pack figure

The earliest age at which the pack can price a claim is carried by the benefit pack as a figure
with a source reference and a locator, in the same manner as every other threshold the pack
declares. It is not a constant in `rltaxsocialsecurity.js`, not a literal in the route, and not
derived arithmetically from the reduction factors.

A pack that does not declare it carries an `AbsentFigure/v1` record in its place, and the claim-age
path refuses under that record rather than proceeding.

### FR-019-002 — A claim age below the declared earliest age refuses

When the declared claim age is below the pack's declared earliest claim age, the claim-age
adjustment produces a refusal. The refusal names the domain, states that the declared age is below
the earliest age the pack can price, states the earliest age, and states what the household would
change to obtain a figure.

No monthly amount, no annual amount, and no multiplier is produced. No zero is substituted, no
nearest priceable age is substituted, and the reduction is not clamped to the pack's maximum.

### FR-019-003 — The refusal reaches every surface the figure would have reached

The refusal appears wherever the settled figure appears: the benefit section's own readout, the
claim-age comparison table, and any total that would have included the benefit. A surface that
would have shown an amount shows the refusal instead of showing nothing.

### FR-019-004 — The comparison table refuses per candidate, not wholesale

A comparison list that mixes priceable and unpriceable ages keeps its priceable rows and refuses
the unpriceable ones in place. Refusing the whole table would withhold ages the pack can price,
and dropping the unpriceable rows silently would let a household believe an age it typed was
considered and lost on the merits.

### FR-019-005 — A claim age above the delayed-credit stopping age is disclosed

When the declared claim age exceeds the age at which the pack's delayed credit stops accruing, the
route states that the figure shown is the figure at the stopping age and that the declared age is
beyond it. The figure remains available; what changes is that the clamp stops being silent.

### FR-019-006 — The per-month factor table is bounded by the pricing bound

Because no claim age below the earliest age is priced, the counted-month table cannot exceed the
months between the earliest claim age and the full retirement age. The table's length becomes a
consequence of FR-019-002 rather than a separate limit.

### FR-019-007 — The prose does not promise a figure the section is withholding

A benefit section that is refusing does not carry the standing sentence asserting that a claim age
was settled against the sourced factors. The section's own words agree with what it is showing.

### FR-019-008 — Regression coverage samples both sides of the boundary

The boundary is covered by cases that assert the priced side and the refused side one month apart,
so a future change that moves or removes the bound fails rather than passing quietly.

## Acceptance Criteria

### AC-019-001

Given a household born in 1962 with a declared Primary Insurance Amount, when the declared claim
age is the pack's earliest priceable age, then a monthly and an annual figure are produced and the
reduction equals the pack's declared maximum.

### AC-019-002

Given the same household, when the declared claim age is one month below that earliest age, then
no monthly figure, no annual figure and no multiplier is produced, and a refusal naming the
earliest age is shown.

### AC-019-003

Given a comparison list containing both a priceable and an unpriceable age, when the table renders,
then the priceable age carries its figure, the unpriceable age carries a refusal in its own row,
and no row is dropped.

### AC-019-004

Given a declared claim age beyond the delayed-credit stopping age, when the figure renders, then
the route states that the declared age is beyond the stopping age and that the figure shown is the
stopping-age figure.

## Explicitly Out Of Scope

- The value of the earliest claim age for any jurisdiction or year. That is a pack authoring task
  with its own source retrieval, and this specification only requires that the value be declared
  and sourced rather than assumed.
- Survivor, spousal and disability claim ages, which differ from the retirement earliest age and
  which this route does not model.
- The federal, state, property, rental and disposition paths, none of which were found to price
  past a declared bound in the round that produced this packet.

## Grounding

- `tax-rules/benefit/2026.json`, `earlyReductionRule.quotedRule` and
  `earlyReductionRule.invarianceContrastAlsoStatedBy`, which state the sixty-month and
  thirty-percent maximum and tie it to age sixty-two.
- `rltaxsocialsecurity.js`, `applyClaimAgeAdjustment`, whose only lower bound is the finiteness and
  sign check.
- `docs/Product-Principles.md`, principle P2, which forbids a plausible placeholder in place of an
  absent figure.
- The refusal shape the route already uses for an unsupported jurisdiction, which this
  specification asks the claim-age path to match.
