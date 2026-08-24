# Design: BUG-019 — Why A Statutory Bound Stated In The Pack Never Reaches The Engine

## What This Document Does And Does Not Do

It states the mechanism as read from the module and the pack, and it sets out remedy options
without choosing between them. The choice belongs to the packet owner, because it changes a pack
contract and therefore the shape of every future benefit pack.

No fix was attempted by the round that filed this packet, and no shipped file was modified.

## Mechanism

### The bound and the factors live in the same object

`tax-rules/benefit/2026.json` carries `earlyReductionRule` as one record. It holds the two
per-month factors the engine consumes:

- `firstSegmentMonths: 36`
- `firstSegmentMonthlyFactor: { numerator: 5, denominator: 9, ofPercent: 1 }`
- `additionalMonthlyFactor: { numerator: 5, denominator: 12, ofPercent: 1 }`

and, in the same object, the prose that bounds them. `quotedRule` ends:

> "if the number of reduction months is 60 (the maximum number for retirement at 62 when normal
> retirement age is 67), then the benefit is reduced by 30 percent"

and `invarianceContrastAlsoStatedBy.quotedRule` is the table row:

> "1960 and later | 67 | 60 | $700 | 30.00%"

The maximum is stated twice. It is stated in prose both times. The three structured fields the
engine reads are the three fields that carry no bound.

### The engine consumes the structured fields only

`applyClaimAgeAdjustment` in `rltaxsocialsecurity.js` guards its input once:

```
if (!Number.isFinite(claimAgeMonths) || claimAgeMonths < 0) {
  return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain, ...);
}
```

Finite and non-negative is the whole of the admission test. The early branch then computes

```
monthsCounted = fra.totalMonths - claimAgeMonths;
```

and loops `monthsCounted` times, adding `firstFactor` for the first `firstSegmentMonths`
iterations and `laterFactor` thereafter, before setting `multiplier = 1 - reductionTotal`.

Nothing compares `monthsCounted` against sixty. Nothing compares `claimAgeMonths` against an
earliest age, because no earliest age exists in the module: a search across
`rltaxsocialsecurity.js`, `rltaxclaimage.js` and `rltaxrules.js` for an earliest-claim,
earliest-eligibility or minimum-claim-age term returns nothing.

### What the extrapolation produces

For a 1962 birth year the pack resolves a full retirement age of 67, which is 804 months.

| Claim age months | `monthsCounted` | Reduction total | Multiplier | Monthly on a $3,000 PIA |
|---|---|---|---|---|
| 744 | 60 | 0.30 | 0.70 | $2,100 |
| 743 | 61 | 0.3042 | 0.6958 | $2,087 |
| 720 | 84 | 0.40 | 0.60 | $1,800 |
| 660 | 144 | 0.65 | 0.35 | $1,050 |
| 600 | 204 | 0.90 | 0.10 | $300 |
| 576 | 228 | 1.00 | 0.00 | $0 |
| below 576 | above 228 | above 1.00 | negative | figures stop rendering |

The 744-month row is correct and matches the pack's declared maximum exactly, which is why the
committed suite is green: every case it holds sits at or above the boundary. The defect lives
entirely in rows the suite never asks about.

### Why the sub-zero band goes quiet instead of refusing

Below 576 months the multiplier is negative. The monthly and annual figures stop appearing in the
rendered section, and no refusal code appears either. The section keeps its heading and keeps its
standing sentence asserting that a claim age was settled against the sourced factors.

This is a second-order consequence of the same missing bound rather than an independent defect.
Whatever suppresses the negative figure is doing so without routing through the refusal
vocabulary, so the reader is left with prose that promises a figure and a body that has none.

### Why the upper end behaves differently

The delayed branch reads `delayedCreditRule.stoppingAgeYears`, which is 70, and stops crediting
there. That is why a declared claim age of 999 produces the age-70 figure rather than an absurd
one. The clamp keeps the arithmetic sane, and it is the reason the upper end is a lower-severity
facet than the lower end. It is still silent: nothing tells the household the declared age was
beyond the stopping age.

The asymmetry is instructive. The delayed rule carries its bound as a **structured field**,
`stoppingAgeYears`, and the engine honours it. The early rule carries its bound as **prose**, and
the engine cannot see it.

### Why the factor table grows

`factors` gains one row per counted month and the route renders every row, because per-month
disclosure is the point of that table. At the pack's declared maximum that is sixty rows. Without
the bound it is 234 rows at age 48 and 804 rows at a claim age of zero. A hostile sweep in the
same round observed the document node count rise from a 1,312-node baseline to 6,822 nodes on a
step that had driven the claim age low, then return to baseline on the next sample. It recovers,
so it is a symptom, not a leak.

## Remedy Options

### Option A — Declare the earliest claim age in the pack (prerequisite)

Add a sourced figure to the benefit pack carrying the earliest age at which a retirement claim can
be priced, with a source reference and a locator, and an `AbsentFigure/v1` in its place when no
authority has been retrieved. Every other option depends on this one, because the alternative is a
constant in the engine, which is the thing this repository's pack contract exists to prevent.

### Option B — Refuse below the declared earliest age

The early branch compares the declared claim age against the pack figure before counting months
and returns a refusal naming the earliest age. This is the option that matches the route's
existing behaviour for an unsupported jurisdiction, and it is the option FR-019-002 is written for.

### Option C — Clamp the reduction at the pack's stated maximum

Cap `reductionTotal` at the declared maximum so a claim at 60 prices as a claim at 62. This is
cheap and it is wrong: it answers a question the household did not ask with a number that looks
like an answer to the question they did ask. It is recorded here to be refused, not chosen.

### What the remedy is not

It is not a `min` on `monthsCounted` with a literal 60 in the engine. That reproduces Option C's
error and adds a constant the pack contract forbids. It is not an `input min` attribute on the
field either: the round reached these values through a paste-shaped path that dispatches the same
events a keystroke dispatches, and an attribute the browser enforces on typing does not bound what
the engine prices.

## Open Questions For The Owner

1. Does the earliest claim age belong inside `earlyReductionRule` as a sibling of
   `firstSegmentMonths`, or as its own top-level pack record? The first keeps the bound beside the
   factors it bounds. The second lets a future survivor or disability rule reference a different
   earliest age without nesting.
2. Should the sub-zero band refuse with the same code as the priced band, or with a distinct code
   naming the arithmetic rather than the eligibility?
3. Should FR-019-005's disclosure of the delayed-credit clamp be a refusal or a note beside the
   figure? The figure at the stopping age is genuinely correct for a household that claims at or
   after that age, so refusing it would withhold a true answer.
