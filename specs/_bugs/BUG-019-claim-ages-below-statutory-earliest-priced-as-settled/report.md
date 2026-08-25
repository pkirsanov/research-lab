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

---

# Implementation Round

Everything above this line belongs to the filing round and describes the packet as filed and
unstarted. That was true when it was written. This section records a later round that delivered
the fix. It does not amend the section above.

**Landed at commits:** `e28be5814` (pack, engine, comparison surface, route, and a temporal-dead-zone
repair in `scripts/selftest.mjs`) and `eeb2ac7cc` (the boundary regressions).

**Claim Source:** executed in this session, output captured verbatim.

## The Repo Gate Was Red On A Temporal Dead Zone

`node scripts/selftest.mjs` reported `3393 passed, 1 failed` before this round:

```
✗ FAIL (Feature 024 Scope 01 benefit group threw): Cannot access 'sourceIds24' before initialization
```

`sourceIds24` was read by the BUG-019 assertion — which resolves the earliest age's `sourceRef`
against the pack's source records — but was declared twenty-three lines further down, inside the
TP-01-11 sourcing census. A `const` is not hoisted into its initialised state, so the read threw
and the throw took the whole Feature 024 Scope 01 group with it, including every assertion after
it. The count was low because the group aborted, not because assertions were missing.

The declaration was moved above its first use and left in the same scope, so both readers see the
same list. No assertion was deleted, weakened or reordered. The single deleted line was the
declaration in its former position:

```
$ git --no-pager diff -U0 -- scripts/selftest.mjs | grep -E '^-[^-]'
-  const sourceIds24 = benefitPack24.sourceRecords.map((record) => record.sourceId);
```

After the move:

```
$ node scripts/selftest.mjs
self-test: 3405 passed, 0 failed
selftest_exit=0
```

3405 is above the 3404 floor the three scopes each name. The eleven-assertion recovery is the rest
of the aborted group running again plus the BUG-019 assertion itself.

## The Bound Now Lives In The Pack

`tax-rules/benefit/2026.json` carries `earlyReductionRule.earliestClaimAge` as a structured member
alongside the prose it previously only stated:

```
"earliestClaimAge": {
  "contractVersion": "EarliestClaimAge/v1",
  "sourceRef": "ssa-age-reduction-by-birth-year",
  "locator": "Table \"Full Retirement and Age 62 Benefit By Year Of Birth\" — the table's own title and its terminal row",
  "ageYears": 62,
  "maximumReductionMonths": 60,
  ...
}
```

This mirrors the shape the delayed-credit rule has always had. That rule carried `stoppingAgeYears`
as a structured field and the engine honoured it; the early rule carried its maximum only in prose
and nothing compared a candidate age against it. The asymmetry was the defect.

`rltaxsocialsecurity.js` reads `earliest.ageYears` from the pack, multiplies by `MONTHS_PER_YEAR`,
records the comparison, and refuses below it. The refusal quotes the pack's own figure and the
citation resolved from the pack's source records — no age literal appears in the engine. The
selftest asserts that absence directly across `rltaxsocialsecurity.js`, `rltaxclaimage.js` and
`rltaxrules.js`, and a probe below proves the bound moves when the pack moves.

It refuses rather than clamping. Answering a claim at sixty with the figure for sixty-two replaces
one wrong number with another, so the selftest builds the clamping implementation explicitly and
proves it produces the age-62 figure — recorded as different, not shipped.

## Both Sides Of The One-Month Boundary

```
$ npx playwright test --project=chromium tests/lifetime-tax-benefit.spec.mjs -g 'the earliest priceable claim age prices and one month below it refuses'

Running 1 test using 1 worker

  ✓  1 [chromium] › tests/lifetime-tax-benefit.spec.mjs:332:1 › Regression: BUG-019 the earliest priceable claim age prices and one month below it refuses (1.1s)

  1 passed (4.7s)
sample_exit=0
```

744 months prices to a `$25,200` headline with sixty counted months and sixty-six adjustment rows.
743 months refuses under `RLTAX-THRESHOLD-UNAVAILABLE`, carries the pack figure `744` and the word
`earliest`, renders no `[data-rl-value]` at all, no factor row, no `$2,087`, no `$2,100`, no `$0`,
and empties the settled-fact line while it is refusing.

## Probe Evidence

Five probes were run through `scripts/red-green-probe.sh`. Each mutates one committed literal,
runs the assertion under test, reverts, and re-runs the identical command. `--summary-match` is
pinned to each assertion's own title rather than to an aggregate pass count. Every probe reported
`revert-verified: yes` against the committed blob hash.

### Probe 1 — the refusing side, exit 0 (discriminated)

```
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-019 refusing side: engine stops refusing below the declared earliest age
file:             rltaxsocialsecurity.js
mutation:         if (claimAgeMonths < earliestMonths) {  ->  if (false && claimAgeMonths < earliestMonths) {   (1 occurrence(s))
command:          npx playwright test --project=chromium tests/lifetime-tax-benefit.spec.mjs -g the\ earliest\ priceable\ claim\ age\ prices\ and\ one\ month\ below\ it\ refuses
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=95beaaed147e301bcf2cae7a858b1e0463cdc1c6 restored=95beaaed147e301bcf2cae7a858b1e0463cdc1c6)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe1_exit=0
```

### Probe 2 — first attempt, exit 7 (did not discriminate), recorded rather than discarded

The first attempt at the priced side mutated the wrong occurrence. `claimAgeMonths < earliestMonths`
appears twice: once inside the published `comparisonRecord` and once in the enforcing `if`. Mutating
the published record changed nothing the browser assertion reads.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-019 priced side: the earliest age itself stops pricing when the bound is widened by one month
file:             rltaxsocialsecurity.js
mutation:         claimAgeMonths, "less-than", earliestMonths, claimAgeMonths < earliestMonths  ->  claimAgeMonths, "less-than", earliestMonths, claimAgeMonths <= earliestMonths   (1 occurrence(s))
red-exit:         0
green-exit:       0
revert-verified:  yes (committed=95beaaed147e301bcf2cae7a858b1e0463cdc1c6 restored=95beaaed147e301bcf2cae7a858b1e0463cdc1c6)
discriminating:   NO (both channels agree: exit 0 == 0, summary identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
probe2_exit=7
```

This is a real finding about coverage, not a harness misfire. The published
`claim-age-below-earliest-priceable-age` comparison record's boolean is asserted by
`scripts/selftest.mjs` and by no browser case, so a browser probe cannot make it fail. It is
recorded here so the gap is visible rather than hidden by a probe that was quietly rerun.

### Probe 2b — the priced side against the enforcing guard, exit 0 (discriminated)

```
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-019 priced side: widening the enforcing guard by one month stops the earliest age itself from pricing
file:             rltaxsocialsecurity.js
mutation:         if (claimAgeMonths < earliestMonths) {  ->  if (claimAgeMonths <= earliestMonths) {   (1 occurrence(s))
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=95beaaed147e301bcf2cae7a858b1e0463cdc1c6 restored=95beaaed147e301bcf2cae7a858b1e0463cdc1c6)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe2b_exit=0
```

Widening the guard by one month moves the boundary onto the earliest age itself and the priced half
fails. Together with Probe 1 this pins the boundary from both sides: neither half passes by
accident, and a fix that refused every early claim would fail this one.

### Probe 3 — the bound is read from the pack, exit 0 (discriminated)

```
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-019 the bound is read from the pack: moving the packs declared age moves the boundary
file:             tax-rules/benefit/2026.json
mutation:         "ageYears": 62,  ->  "ageYears": 63,   (1 occurrence(s))
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=7e690813e707f3f0931b1fe8cd2cc276bdbb200b restored=7e690813e707f3f0931b1fe8cd2cc276bdbb200b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe3_exit=0
```

This is the probe that proves the age is not hard-coded. Editing only the pack — no module changed
— moves the boundary and the age-62 case stops pricing. An engine carrying its own literal would
have been unmoved.

### Probe 4 — the sub-zero band, exit 0 (discriminated)

```
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-019 sub-zero band: the band below the bound stops refusing when the guard is disabled
file:             rltaxsocialsecurity.js
mutation:         if (claimAgeMonths < earliestMonths) {  ->  if (false && claimAgeMonths < earliestMonths) {   (1 occurrence(s))
command:          npx playwright test --project=chromium tests/lifetime-tax-benefit.spec.mjs -g every\ claim\ age\ below\ the\ earliest\ priceable\ age\ refuses
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=95beaaed147e301bcf2cae7a858b1e0463cdc1c6 restored=95beaaed147e301bcf2cae7a858b1e0463cdc1c6)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe4_exit=0
```

### Probe 5 — the comparison table refuses per candidate, exit 0 (discriminated)

```
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-019 comparison table: a per-candidate refusal that returns wholesale drops the priceable rows
file:             rltaxclaimage.js
mutation:         if (settlement.domain !== socialsecurity.BELOW_EARLIEST_CLAIM_AGE_DOMAIN) return settlement;  ->  if (settlement.domain !== socialsecurity.BELOW_EARLIEST_CLAIM_AGE_DOMAIN || true) return settlement;   (1 occurrence(s))
command:          npx playwright test --project=chromium tests/lifetime-tax-claim-age.spec.mjs -g a\ comparison\ list\ mixing\ priceable\ and\ unpriceable\ ages
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=00701ee85fdc0f3f7c4c5746cee80d9e9f84a2df restored=00701ee85fdc0f3f7c4c5746cee80d9e9f84a2df)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe5_exit=0
```

Restoring the wholesale return withholds the two ages the pack can price. The scoped refusal is
what keeps `62` and `67` on screen while `60` refuses in place.

## Validation Run

```
$ node scripts/selftest.mjs
self-test: 3405 passed, 0 failed
selftest_exit=0

$ node scripts/validate-spec-test-paths.mjs
new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
vstp_exit=0

$ bash .github/bubbles/scripts/artifact-lint.sh specs/024-social-security-and-medicare
Artifact lint PASSED.
lint024_exit=0

$ npx playwright test --project=chromium tests/lifetime-tax-*.spec.mjs
Running 97 tests using 6 workers
  97 passed (18.1s)
playwright_exit=0

$ git status --short --untracked-files=no
(empty)
```

The tracked tree is clean and every probe reported `revert-verified: yes`, so no probe residue
remains in any shipped module or pack.

### One Flake, Recorded Rather Than Rerun Quietly

A third run of the same family returned `1 failed, 96 passed (38.3s)`:

```
  1) [chromium] › tests/lifetime-tax-california.spec.mjs:226:1 › Regression: SCN-022-012 the surcharge threshold is identical for every filing status
    Test timeout of 30000ms exceeded.
    Error: page.fill: Test timeout of 30000ms exceeded.
```

It is recorded because a rerun that turns green is not by itself proof of a flake. Three facts
separate this from a regression. The spec contains zero references to `benefit`, `claimAge`,
`earliest` or `socialsecurity`, so it does not reach any code this round changed. Run in isolation
it returns `3 passed (3.2s)` at exit 0. The failing run took 38.3s where the clean runs took 18.1s
and 17.2s, and the failure mode is a `page.fill` timeout rather than a value mismatch — the shape a
loaded machine produces, not the shape a wrong number produces.

```
$ npx playwright test --project=chromium tests/lifetime-tax-california.spec.mjs
Running 3 tests using 1 worker
  3 passed (3.2s)
california_exit=0

$ npx playwright test --project=chromium tests/lifetime-tax-*.spec.mjs
Running 97 tests using 6 workers
  97 passed (17.2s)
playwright_exit=0
```

## What This Round Did Not Establish

- The pinned `packContentSha256` in `lifetime-tax-strategy.config.json` pins the **federal income
  tax** pack, not the benefit pack. The benefit pack carries no `contentSha256` and is referenced
  by path through `rules.benefitPackPaths`. Scope 1 step 4 asks for that pin to be updated on the
  premise that editing the benefit pack moves it; measured, it does not. The federal digest
  assertion in `scripts/selftest.mjs` still passes and the route still reaches `ready`, so the
  outcome the step protects holds — but by a different mechanism than the step describes, and that
  discrepancy belongs to `bubbles.plan`.
- The published `claim-age-below-earliest-priceable-age` comparison record is asserted only by
  `scripts/selftest.mjs`. Probe 2's exit 7 is the proof: no browser case can make it fail.
- The delayed-credit clamp is disclosed through `creditBoundByStoppingAge` and rendered by the
  route, and the selftest asserts the bound. Whether the **disclosure** is asserted anywhere was
  not established in this round, so the Scope 2 item naming it stays unticked.
- The two pack-contract questions `design.md` routes to the owner were not answered by this round.
  The delivered shape — a nested `earliestClaimAge` object on `earlyReductionRule`, and the same
  `RLTAX-THRESHOLD-UNAVAILABLE` code for the sub-zero band as for the priced band — is what landed,
  and it is recorded here as a delivered fact awaiting the owner's decision rather than as that
  decision having been made.
- No human acceptance was recorded. `uservalidation.md` is untouched by this round.

## Disclosure Round — Where The Stopping-Age Coverage Actually Was

The previous round left the Scope 2 disclosure item unticked on the ground that "whether the
disclosure is asserted anywhere was not established". Establishing it changed the question. The
disclosure is not one surface but three, and two of the three were already covered by assertions
this packet did not write:

| Surface of the disclosure | Asserted before this round? | Where |
| --- | --- | --- |
| `creditBoundByStoppingAge` true past the stopping age, false at it, plus a non-empty `stoppingAgeStatedFact` | yes — pre-existing | `scripts/selftest.mjs` TP-01-09 |
| The rendered line a household reads | yes — pre-existing | `tests/lifetime-tax-benefit.spec.mjs`, the `#benefitStoppingAgeLine` case at a claim age of 71 |
| The `claim-age-beyond-sourced-stopping-age` comparison record | **no** | produced at `rltaxsocialsecurity.js`, matched by nothing |

So the item was not uncovered; it was covered everywhere except the one surface that makes the
bound machine-checkable. A `grep` for the comparison id across `scripts/selftest.mjs` and `tests/`
returned only the producing site. That record is the audit trail: without it a reader has the
sentence and the flag but nothing that says the engine *performed* a comparison, which is the
difference between a disclosed bound and a figure that quietly stopped moving.

The gap is now closed by an assertion that reads the record in both directions one year apart — at
72 it must be present with `result === true`, at 70 present with `result === false`. One direction
alone cannot separate "the bound applied" from "the engine never compared at all", because a record
published only when the bound bites looks identical to no record at all on the unbound side.

### Probe 6 — the stopping-age comparison record, exit 0 (discriminated)

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            bug019-stopping-age-comparison-record
file:             rltaxsocialsecurity.js
mutation:         rules.comparisonRecord("claim-age-beyond-sourced-stopping-age",  ->  rules.comparisonRecord("claim-age-beyond-sourced-stopping-age-DROPPED",
 (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: BUG-019: a claim age beyond the sourced delayed-credit stopping age publishes a claim-age-beyond-sourced-stopping-age comparison record naming the claim age, the sourced stopping age and a
green-exit:       1
green-summary:      ✓ BUG-019: a claim age beyond the sourced delayed-credit stopping age publishes a claim-age-beyond-sourced-stopping-age comparison record naming the claim age, the sourced stopping age and a true
revert-verified:  yes (committed=95beaaed147e301bcf2cae7a858b1e0463cdc1c6 restored=95beaaed147e301bcf2cae7a858b1e0463cdc1c6)
discriminating:   yes (summary differs)
=== END RED/GREEN PROBE EVIDENCE ===
```

Both exits are `1` because the repository baseline carries two failures owned by a concurrent
session, so `--summary-match` was pinned to this assertion's own wording rather than to the
aggregate. Renaming the comparison id — the shape a dropped record takes — turns the assertion red;
reverting turns it green, and the revert is hash-verified against the committed blob.

### Validation after the addition

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 3408 passed, 2 failed
selftest_exit=1
```

`3407 → 3408` is the one assertion added. The two failures are unchanged from the pre-existing
baseline and belong to a concurrent session's untracked `tool-brief-v2*` and
`zz-probe-focusable.spec.mjs` files; neither is in this packet's blast radius. `git diff --numstat`
on `scripts/selftest.mjs` reports `20` insertions and `0` deletions, so no existing assertion was
removed or weakened. No source module and no browser spec was edited this round, so the browser
surface is byte-identical to the run already recorded above.

## Two Premises Re-Measured, And Where They Landed

The two remaining Uncertainty Declarations were re-measured independently rather than inherited.

**The `AbsentFigure/v1` item.** Measured, `AbsentFigure/v1` is a *pack-authoring* contract —
`rltaxrules.js` defines it as the `contractVersion` a pack member carries to declare itself
unretrieved. It is an input shape, not a return shape. The engine's earliest-age path branches
three ways: a member that is absent entirely returns `unretrievedRule(...)`, a member declaring
itself absent reaches `absentFigureRefusal(...)`, and that helper's own code defaults to
`RLTAX-THRESHOLD-UNAVAILABLE` unless the figure names a code of its own. So a pack lacking the
figure cannot "yield an `AbsentFigure/v1`" in any shipped path — nothing in the engine returns that
contract. Both halves of the *intent* remain evidenced and asserted; the item's wording names a
return that does not exist. Correcting it is a change to a DoD item's behavioural claim, which is
`bubbles.plan`'s to make, so the item stays open and unticked rather than being reworded here.

**The `packContentSha256` item.** Re-measured and the earlier finding holds exactly:
`lifetime-tax-strategy.config.json` pins `tax-rules/federal/2026.json`; the benefit pack carries no
`contentSha256` at all and is reached by path through `rules.benefitPackPaths`. Editing the benefit
pack therefore moves no pin, and the item's first half describes a mechanism the tool does not
have. The second half — the route still reaching `ready` — holds and is evidenced. Same disposition:
the wording belongs to `bubbles.plan`, so the item stays open.

