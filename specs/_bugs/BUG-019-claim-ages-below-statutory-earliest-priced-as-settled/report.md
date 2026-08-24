# Report: BUG-019 — Claim Ages Below The Statutory Earliest Age Are Priced As Settled

**Filed at commit:** `bf56460a8`

**Filed by:** a `bubbles.chaos` round against the Lifetime Tax Strategy Lab route. That round is
authorised to record findings and file bug artifacts. It is not authorised to change a shipped
file, and it changed none.

## Summary

The route prices a Social Security claim age below the earliest age its own rule pack says the
reduction rule reaches, and describes the resulting figure with the word "settled". A claim at age
60 on a $3,000 Primary Insurance Amount is reported as $1,800 monthly and $21,600 annually. No
retirement benefit exists at age 60.

The boundary is exactly one month wide and lands where the pack says it should not: 744 months
(age 62) is correct, 743 months is not, and nothing marks the transition.

## Evidence Provenance

Every figure in this report comes from a browser run executed in this session against a local
static server serving the repository root, on `--project=chromium`. The driver was a temporary
Playwright spec written for the chaos round and removed at the end of it, so no path to it is cited
here; the reproduction in `bug.md` is stated as route steps a reader can follow without it.

Nothing in this report is inferred from source reading alone. The source reading in `design.md`
explains figures that were observed first.

**Claim Source:** executed in this session, output captured verbatim.

## Test Evidence

### The canonical reproduction

Household: filing status `single`, tax year `2026`, deduction mode `standard`, net investment
income `0`, Medicare wage basis `0`, ordinary income `250000`, Power mode, benefit birth year
`1962`, statement PIA `3000`. Only the claim age and the comparison list vary.

**Declared omission.** The capture below begins at the run's first output line. Two Playwright
header lines preceding it named the temporary chaos driver by path, and that driver was removed at
the end of the round. They are omitted rather than reproduced, because a committed artifact naming
a `tests/` file that does not exist is itself a defect this repository's spec-test-path validator
exists to catch. No observed value has been altered, reordered or re-wrapped; the omission is
confined to those two header lines and to the trailing `1 passed` line's own header context.

```
--- single claim age, adjusted monthly and annual ---

claimAgeMonths=840 (age 70.00) money=["$3,000","$3,720","$44,640"] refusalCodes=[] factorRows=42

claimAgeMonths=804 (age 67.00) money=["$3,000","$36,000"] refusalCodes=[] factorRows=6

claimAgeMonths=744 (age 62.00) money=["$3,000","$2,100","$25,200"] refusalCodes=[] factorRows=66

claimAgeMonths=743 (age 61.92) money=["$3,000","$2,087","$25,044"] refusalCodes=[] factorRows=67

claimAgeMonths=720 (age 60.00) money=["$3,000","$1,800","$21,600"] refusalCodes=[] factorRows=90

claimAgeMonths=660 (age 55.00) money=["$3,000","$1,050","$12,600"] refusalCodes=[] factorRows=150

claimAgeMonths=600 (age 50.00) money=["$3,000","$300","$3,600"] refusalCodes=[] factorRows=210

claimAgeMonths=576 (age 48.00) money=["$3,000","$0"] refusalCodes=[] factorRows=234

--- comparison table, which is where a claim age is chosen ---

comparisonAges="62,67,70"

    62 | $25,200The annual benefit this claim age produces, settled from your own 

    67 | $36,000The annual benefit this claim age produces, settled from your own 

    70 | $44,640The annual benefit this claim age produces, settled from your own 

comparisonAges="60,62,67"

    60 | $21,600The annual benefit this claim age produces, settled from your own 

    62 | $25,200The annual benefit this claim age produces, settled from your own 

    67 | $36,000The annual benefit this claim age produces, settled from your own 

comparisonAges="50,62,70"

    50 | $3,600The annual benefit this claim age produces, settled from your own d

    62 | $25,200The annual benefit this claim age produces, settled from your own 

    70 | $44,640The annual benefit this claim age produces, settled from your own 

comparisonAges="999,62"

    999 | $44,640The annual benefit this claim age produces, settled from your own

    62 | $25,200The annual benefit this claim age produces, settled from your own 

pageerrors=[]

  1 passed (3.3s)
```

The row text is truncated at 78 characters by the capture, which is why each comparison row ends
mid-sentence. The full sentence reads "The annual benefit this claim age produces, settled from
your own declarations against the sourced factors."

`refusalCodes=[]` on every row is the finding. The route emits no refusal at any of these ages.

`pageerrors=[]` matters too: this is not a crash. The route is working exactly as written, and what
is written is wrong.

### What the pack says the bound is

`tax-rules/benefit/2026.json`, `earlyReductionRule.quotedRule`:

> "In the case of early retirement, a benefit is reduced 5/9 of one percent for each month before
> normal retirement age, up to 36 months. If the number of months exceeds 36, then the benefit is
> further reduced 5/12 of one percent per month. For example, if the number of reduction months is
> 60 (the maximum number for retirement at 62 when normal retirement age is 67), then the benefit
> is reduced by 30 percent."

`earlyReductionRule.invarianceContrastAlsoStatedBy.quotedRule`:

> "1960 and later | 67 | 60 | $700 | 30.00%"

The engine reads `firstSegmentMonths`, `firstSegmentMonthlyFactor` and `additionalMonthlyFactor`
from this object. It does not read the maximum, because the maximum is prose.

### The route refuses correctly everywhere else it was driven

The same round drove the residency jurisdiction through supported, unsupported and malformed
values. Captured verbatim:

```
PROBE-F j="state:CA" truth=Settled cardVisible=false stageRows=11 stateMoney=[] combinedMoney=["$51,304"]
        refusal:: "State income taxRLTAX-THRESHOLD-UNAVAILABLEDomain: state-deduction:singleUnavailable because Section 17073.5(a) states a pre-indexing base amount and subdivision (d) requires the Franchise Tax Board to recompute the stan"
PROBE-F j="state:FL" truth=Settled cardVisible=false stageRows=1 stateMoney=[] combinedMoney=["$51,304"]
        refusal:: "State income taxRLTAX-THRESHOLD-UNAVAILABLEDomain: state-settlement:state:FLUnavailable because No retrieved authority states that this jurisdiction imposes no individual income tax on a natural person, so this pack stat"
PROBE-F j="state:NY" truth=Settled cardVisible=false stageRows=0 stateMoney=[] combinedMoney=[]
        refusal:: "State income taxRLTAX-JURISDICTION-UNSUPPORTEDDomain: jurisdiction:state:NYUnavailable because no rule pack ships for state:NY, and no average, national default or zero is substitutedWhat would make it available: author "
```

`stateMoney=[]` on every one of them. The state settlement never renders an amount it cannot
source. This is the shape the claim-age path should have and does not.

### Severity reasoning

P1 rather than P0 because nothing is corrupted, nothing is persisted wrongly, no boundary is
crossed and the household must enter an out-of-range age to reach it. P1 rather than P2 because
age 60 is not an exotic entry — it is a common retirement anchor and it is the age at which a
different Social Security benefit does begin — and because the surface that carries the wrong
figure is the comparison table, which exists so that a household can choose between claim ages.

## What Was Not Established

- No fix was attempted and no shipped file was modified.
- The correct value of the earliest claim age was not retrieved from an authority. The round
  established that the bound is missing, not what its sourced value should be.
- Whether the sub-zero band's silence should carry the same refusal code as the priced band was not
  determined.
- The federal, state, property, rental, disposition, Medicare and workspace-persistence paths were
  driven in the same round and none of them was found to price past a declared bound. That is
  recorded as a negative result in the round's own report, not as a claim of coverage: the round
  drove roughly 950 actions and did not enumerate those domains exhaustively.

## Completion Statement

This packet is filed and unstarted. It records one defect, reproduced deterministically, with its
mechanism read from the module and the pack, the boundary of what the evidence establishes, and
two pack-contract decisions that belong to the owner. It delivers no behaviour.

Zero Definition of Done items are ticked across all three scopes, and none should be. Scope 1 is
pack-authoring work that requires a retrieved authority this round did not retrieve. Scope 2
depends on Scope 1, because refusing below an earliest age requires an earliest age to refuse
below. Scope 3 depends on both.

The mechanism **is** established: the bound is stated in the pack as prose and the engine reads
only the structured fields beside it. The correct **value** of the earliest claim age is **not**
established, and `bug.md`, `design.md` and this report all say so rather than supplying a
plausible one — which would be the same error the packet is about.

No shipped file, module, rule pack or committed test was modified by this round. The temporary
Playwright drivers it used were removed, the `test-results` directory was removed, and the local
static server was closed by the fixture that started it.

