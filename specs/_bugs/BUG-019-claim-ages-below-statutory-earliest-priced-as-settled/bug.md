# BUG-019: Claim Ages Below The Statutory Earliest Age Are Priced As Settled

**Status:** Filed, unstarted. Reproduced deterministically in this session. Root cause established
in the module source. No fix attempted.

**Severity:** P1 (High). It renders a confident, plausible, wrong retirement figure on the surface
a household uses to choose a claim age, and it labels that figure with the route's own
highest-confidence word. It corrupts no stored data and breaks no workflow, which is why it is not
P0.

**Filed at commit:** `bf56460a8`

**Route:** `lifetime-tax-strategy-lab.html` (Lifetime Tax Strategy Lab), benefit and claim-age
sections

**Module:** `rltaxsocialsecurity.js`, `applyClaimAgeAdjustment`

**Pack:** `tax-rules/benefit/2026.json`, `earlyReductionRule`

**Discovered by:** a `bubbles.chaos` round against the Lifetime Tax Strategy Lab route, recorded
as finding `F-CHAOS-LTS-01`. The chaos driver was a temporary spec created for the round and
removed at the end of it, so this packet states the reproduction as route steps rather than
pointing at a file that no longer exists.

---

## Summary

`applyClaimAgeAdjustment` bounds its claim-age input in exactly one place:

> `if (!Number.isFinite(claimAgeMonths) || claimAgeMonths < 0)`

Anything finite and non-negative is priced. The function then counts
`monthsCounted = fra.totalMonths - claimAgeMonths` and applies the pack's per-month reduction
factors once per counted month, with no ceiling on the count.

The pack states its own ceiling twice, in its own words. `earlyReductionRule.quotedRule` reads:

> "if the number of reduction months is 60 (**the maximum number for retirement at 62** when
> normal retirement age is 67), then the benefit is reduced by 30 percent"

and the contrast row it cites in `invarianceContrastAlsoStatedBy` reads:

> "1960 and later | 67 | 60 | $700 | **30.00%**"

Sixty reduction months, thirty percent, earliest age sixty-two. The engine reads the two per-month
factors out of that rule and ignores the bound stated in the same object.

A household born in 1962 has a normal retirement age of 67, which the route resolves as 804
months. Declaring a claim age of 720 months — age 60 — therefore counts 84 reduction months
instead of the declared maximum of 60, and the route prints a monthly benefit of $1,800 and an
annual benefit of $21,600. No retirement benefit exists at age 60. Nothing on the surface says so.

---

## Why This Matters

This contradicts the repository's binding product principle P2 in `docs/Product-Principles.md`:

> Absent data shows as *unavailable* or *incomplete*. **Never zero. Never inferred. Never a
> plausible placeholder.**

and the matching blocking pattern in
`.github/instructions/product-principles.instructions.md`:

> an unprovenanced displayed number

$21,600 for a claim at 60 is not a rendering of *unknown*. It is a rendering of *known*, produced
by extrapolating a statutory formula past the boundary the statute's own quoted text places on it,
and presented in the same grammar the route uses when the figure is real.

It also contradicts this route's own established behaviour elsewhere. The same round confirmed
that declaring residency in `state:NY` produces:

> `RLTAX-JURISDICTION-UNSUPPORTED` — "no rule pack ships for state:NY, and no average, national
> default or zero is substituted"

The route already knows how to refuse a declaration it cannot price, and does so well. The
claim-age path is the one place found in this round where it prices something it cannot price.

The most damaging surface is not the single-age readout. It is the **claim-age comparison table**,
which is where a household chooses when to claim. Each row carries the sentence:

> "The annual benefit this claim age produces, **settled** from your own declarations against the
> sourced factors"

"Settled" is this route's highest-confidence word. It is the same word `#truthState` uses to
distinguish a real settlement from "Incomplete". The comparison table applies it to age 60, to age
50, and to age 999.

---

## Reproduction

Serve the repository root locally and open `lifetime-tax-strategy-lab.html`. The route is listed in
`site-exclusions.json`, so it is not in the built site and must be served directly.

1. Filing status `single`, tax year `2026`, deduction mode `standard`.
2. Net investment income `0`, Medicare wage basis `0`, ordinary income `250000`.
3. Switch to **Power**.
4. Benefit birth year `1962`. Statement PIA `3000`.
5. Set claim age months to `744` (age 62). Read the benefit section: **$2,100 monthly, $25,200
   annual**. This is correct — it is exactly the pack's declared 30.00% maximum reduction.
6. Now set claim age months to `720` (age 60). Read it again: **$1,800 monthly, $21,600 annual**,
   with no refusal code anywhere in the section.
7. Set the comparison ages field to `60,62,67`. The table lists age 60 at $21,600 beside age 62 at
   $25,200 and age 67 at $36,000, all three described as "settled".

Steps 5 through 7 are a two-field change on an otherwise ordinary household. Nothing exotic is
required and the result is identical on every run.

---

## Observed Against Expected

| Claim age months | Age | Observed monthly | Observed annual | Refusal code | Expected |
|---|---|---|---|---|---|
| 840 | 70.00 | $3,720 | $44,640 | none | correct, delayed-credit ceiling |
| 804 | 67.00 | $3,000 | $36,000 | none | correct, full retirement age |
| 744 | 62.00 | $2,100 | $25,200 | none | correct, pack's declared 30.00% maximum |
| **743** | **61.92** | **$2,087** | **$25,044** | **none** | **refusal** |
| **720** | **60.00** | **$1,800** | **$21,600** | **none** | **refusal** |
| **660** | **55.00** | **$1,050** | **$12,600** | **none** | **refusal** |
| **600** | **50.00** | **$300** | **$3,600** | **none** | **refusal** |
| **576** | **48.00** | **$0** | — | **none** | **refusal** |

The boundary is sharp and lands exactly where the pack says it should not: 744 months is right and
743 months is wrong, and the transition is silent.

Expected behaviour is a refusal in the route's existing vocabulary, naming the bound the pack
already states — the same shape `state:NY` already receives.

---

## Two Further Facets

**The sub-zero band.** At 576 months the reduction total reaches exactly 1.0 and the route prints
`$0` as a figure rather than refusing. Below 576 months the multiplier is negative and the monthly
and annual figures **stop being rendered at all, with no refusal code emitted**. That is a quieter
failure than the priced band but it is still not a refusal: the section keeps its heading, "Your
Social Security benefit, and every factor that adjusted it", and its standing sentence, "This is
one declared claim age settled against the sourced factors for one declared birth year", while
silently omitting the figures those sentences promise. The prose at 480 months is byte-identical to
the prose at 744 months.

**The unbounded factor table.** `factors` gains one row per counted reduction month, and the route
renders every row. At age 62 that is 60 rows, which is the point of the table. At age 48 it is 234
rows. At a claim age of 0 months it is 804 rows, all reading "5/12 of 1 percent". A hostile sweep
in the same round saw the document node count rise from a 1,312-node baseline to 6,822 nodes on a
step that had driven the claim age low, then return to baseline. It recovers, so it is a symptom
rather than a second defect, but it is the visible signature of the missing bound.

**The upper end.** `delayedCreditRule.stoppingAgeYears` is 70, so a claim age above 840 months is
clamped to the age-70 figure rather than extrapolated. A declared claim age of 999 *years* is
therefore reported as $44,640 annually and described as "settled". The clamp keeps the number
finite; it does not make the answer honest, because the route never says the input was out of
range.

---

## Root Cause

`rltaxsocialsecurity.js`, `applyClaimAgeAdjustment`. The early-reduction branch reads
`firstSegmentMonths`, `firstSegmentMonthlyFactor` and `additionalMonthlyFactor` off
`pack.earlyReductionRule` and loops `monthsCounted` times. `monthsCounted` derives from the
declared claim age and the resolved full retirement age, and nothing compares it against the
maximum the same rule object states in its `quotedRule` and in its cited contrast row.

There is no earliest-eligibility concept anywhere in the modules. A search across
`rltaxsocialsecurity.js`, `rltaxclaimage.js` and `rltaxrules.js` for an earliest-claim,
earliest-eligibility or minimum-claim-age term returns nothing.

The fix is not simply to clamp `monthsCounted` at 60. A clamp would price age 60 at the age-62
figure, which is a different wrong number. The bound belongs in the pack as a declared, sourced
figure and the engine should refuse below it, so that a jurisdiction or year whose earliest age
differs is carried by its own pack rather than by a constant in the engine.

---

## Not Established

- Whether the earliest-eligibility age belongs in `earlyReductionRule` or as a sibling record is a
  pack-contract decision and is not settled here.
- Whether the sub-zero band should refuse with the same code as the priced band, or with a distinct
  one, is not settled here.
- No fix was attempted and no shipped file was modified by the round that found this.
