# Report: BUG-020 — Declared Income Beyond The Double Range Settles As A Non-Finite Figure

**Filed at commit:** `7f0c6ce38`

**Filed by:** a `bubbles.stabilize` round against the Lifetime Tax Strategy Lab
route. Nothing was delivered. No shipped file changed.

## Summary

Two income fields declared at `9e307` or more make their sum exceed
`Number.MAX_VALUE`. Six stage rows then render `$∞` or `$NaN`, each carrying the
rule standing `enacted-current-law`, while the settlement header reads `Settled`.
The condition survives a reload. The exported private file is unaffected.

## Evidence Provenance

Every figure below comes from browser runs executed in this session against a
local static server serving the repository root, driven through the bundled
Chromium. The driver was a temporary scratch harness written for this round under
a gitignored path and removed at the end of it, so no path to it is cited here.
The reproduction in `bug.md` is stated as route steps a reader can follow without
it.

Nothing here is inferred from source reading alone. The source reading in
`design.md` explains figures that were observed first.

**Claim Source:** executed in this session, output captured verbatim.

## Test Evidence

### The defect, first observation

A sweep across boundary and overflow declarations. Every case but one is clean;
the case that is not is reproduced in full.

```
--- ordinary-1e308
    echoed value read back from inputs: {"ordinary":"1e308","qd":"0","ltcg":"0","exempt":"0"}
    truthState=Settled bodyState=ready
    non-finite/absent tokens rendered: NONE
--- all-1e308-overflow-sum
    echoed value read back from inputs: {"ordinary":"1e308","qd":"1e308","ltcg":"1e308","exempt":"1e308"}
    truthState=Settled bodyState=ready
    non-finite/absent tokens rendered: 
      !! NaN @ ...ent-law | CO-3        $∞      enacted-current-law | CO-4     $∞       enacted-current-law | CO-5      $NaN    enacted-current-law | CO-6     $NaN     enacte...
--- ordinary-1e400-overflow
    echoed value read back from inputs: {"ordinary":"","qd":"0","ltcg":"0","exempt":"0"}
    truthState=Incomplete bodyState=ready
    non-finite/absent tokens rendered: NONE
--- ordinary-negative
    echoed value read back from inputs: {"ordinary":"-5000","qd":"0","ltcg":"0","exempt":"0"}
    truthState=Incomplete bodyState=ready
    non-finite/absent tokens rendered: NONE
=== console errors during probe ===
NONE
```

The other cases in the same sweep — all-zero, `1`, `1000000`, `1000000000000`,
`Number.MAX_SAFE_INTEGER`, `1e300`, all four fields at `1e300`, and `0.5` —
each reported `non-finite/absent tokens rendered: NONE`.

### The boundary

```
=== minimum trigger search (single view = Simple default) ===
  1 field 1e308                              simple[inf=0 nan=0 truth=Settled] power[inf=0 nan=0 truth=Settled]
  2 fields 1e308                             simple[inf=0 nan=0 truth=Settled] power[inf=4 nan=2 truth=Settled]
  2 fields 9e307                             simple[inf=0 nan=0 truth=Settled] power[inf=4 nan=2 truth=Settled]
  2 fields 8.9e307                           simple[inf=0 nan=0 truth=Settled] power[inf=0 nan=0 truth=Settled]
  1 field 1.7976931348623157e308 (MAX_VALUE) simple[inf=0 nan=0 truth=Settled] power[inf=0 nan=0 truth=Settled]
```

Two fields at `8.9e307` sum to `1.78e308` and are clean. Two fields at `9e307`
sum to `1.8e308`, which is above `Number.MAX_VALUE`, and are not. A single field
at `Number.MAX_VALUE` is clean, which is what identifies the sum rather than any
single entry as the trigger.

### Which rows, and what they claim

```
before reload, simple : {"mode":"simple","truth":"Settled","inf":0,"nan":0,"ordinary":"1e308"}
before reload, power  : {"mode":"power","truth":"Settled","inf":4,"nan":2,"ordinary":"1e308"}
after  reload, opening: {"mode":"simple","truth":"Settled","inf":0,"nan":0,"ordinary":"1e+308"}
after  reload, power  : {"mode":"power","truth":"Settled","inf":4,"nan":2,"ordinary":"1e+308"}
stage rows carrying a non-finite figure (6):
  CO-1 $∞ enacted-current-law
  CO-3 $∞ enacted-current-law
  CO-5 $∞ enacted-current-law
  CO-6 $∞ enacted-current-law
  CO-7 $NaN enacted-current-law
  CO-8 $NaN enacted-current-law
```

The Simple view shows no non-finite token in any of these states. That is a
property of which figures Simple chooses to render, not a guard.

### It persists across a reload

The run above reloads the page between the second and third line. The declaration
is read back from the workspace — the ordinary field reads `1e+308` — and opening
Power reproduces the same six rows with no further typing.

### The export is clean

```
=== does it reach the exported private file? ===
  export bytes=2663 contains_null_for_overflow=true contains_Infinity_token=false contains_1e\+308=true
    "ordinary": 1e+308,
    "qualifiedDividend": 1e+308,
    "longTermCapitalGain": 1e+308,
    "taxExemptInterest": 1e+308
```

The file carries the declared inputs and no non-finite token.

### Severity reasoning

The declaration required is not reachable by any household. `9e307` dollars
exceeds every quantity that has ever been measured in currency. The defect is
recorded at Low for that reason, and recorded at all because the route's promise
is categorical: a figure carries the standing of the rule it came from, and what
cannot be priced is named. Six rows here carry enacted standing on a symbol that
is not a number.

## What This Round Did Not Establish

- Whether precision loss above `Number.MAX_SAFE_INTEGER` changes any rendered
  amount. No measurement was taken.
- Whether a non-finite value can reach the formatter from an origin other than
  the four income fields.
- Whether a workspace edited directly in local storage can carry a non-finite
  value past `validateWorkspace`.
- Whether the Simple view is clean under every declaration, or only under the
  ones driven here.

## Completion Statement

Nothing was delivered. This packet is a filing. The defect is reproduced, its
boundary is measured from both sides, its persistence is observed and its reach
into the export is measured and found absent.

The remedy is blocked on an owner decision recorded as the open question in
`design.md`: the refusal-code vocabulary is closed at fourteen members and
`scripts/selftest.mjs` assertion `TP-01-05` asserts that every live member is one
of the twelve Feature 021 members or one of the two Feature 022 members. Adding a
member is a deliberate vocabulary change; reusing one contradicts a distinction
the vocabulary was given on purpose. This round took neither path.

## Delivery

**Delivered at commits:** `7577d5ad3` (engine, route, vocabulary, selftest,
ledger) and `4eb4a4725` (browser suite).

**Claim Source:** executed in this session, output captured verbatim.

The owner decision recorded in `design.md` on 2026-08-24 chose a fifteenth
vocabulary member, `RLTAX-FIGURE-UNREPRESENTABLE`. This section records what was
delivered against that decision.

### What changed

| Change | File | What it does |
|---|---|---|
| C1 | `rltaxrules.js` | Adds `RLTAX-FIGURE-UNREPRESENTABLE` as the fifteenth `RLTAX_CODES` member, with the comment naming why it is neither `RLTAX-INPUT-INCOMPLETE` nor `RLTAX-INCOME-KIND-UNSUPPORTED` |
| C2 | `scripts/selftest.mjs` | Supersedes `TP-01-05`'s two-list count and membership clauses with the three-list form recorded as `SUP-020-01` |
| E1 | `rltax.js` | `computeTaxableIncome` refuses when `gross` is not finite, carrying the refusal out through `appliedDeduction` so every existing deduction-unavailable branch cascades it |
| E2 | `rltax.js` | The three `computeAnnualFederalTax` sites that read `basis.grossSupportedIncome` as a bare number now pass a refusal through instead |
| E3 | `rltax.js` | `formatForDisplay` refuses a non-finite `valueRecord.value` at the same seam that already refuses a non-finite factor |
| E4 | `rltax.js` | `composeDispositionLegs` returns the refusing shape on any `ok: false` basis instead of reading absent members into a band walk |
| R1 | `lifetime-tax-strategy-lab.html` | `buildEnvelope` publishes `unrepresentableDomains` on both return shapes, and `render` branches on it before `viable` |
| R2 | `lifetime-tax-strategy-lab.html` | `stageValueText`'s raw-stringification fallback no longer renders a non-finite value as text |

`percent`, `dollars`, `readNumber` and `readDeclaredBasis` are untouched, so
nothing about what the input accepts was narrowed.

### The boundary, both sides

Placed in **both** the ordinary-income and the qualified-dividend field:

| Side | Declared in each field | Sum | Observed |
|---|---|---|---|
| settling | `8.988465674311579e+307` | exactly `Number.MAX_VALUE` | header `Settled`; no stage carries an unrepresentable refusal; no `∞` and no `NaN` |
| refusing | `8.98846567431158e+307` | `Infinity` | header `Incomplete`; `CO-1`, `CO-3`, `CO-4`, `CO-5`, `CO-6`, `CO-7` and `CO-8` each carry `RLTAX-FIGURE-UNREPRESENTABLE`; no rule-status label on those rows |

`8.98846567431158e+307` is the next representable double above
`8.988465674311579e+307`, so no third behaviour can sit between them. The suite
asserts that adjacency against the page's own arithmetic rather than trusting the
two literals, so a later edit cannot widen the gap and leave the boundary
untested.

### Probes

Each block is the verbatim `scripts/red-green-probe.sh` evidence, with
`--summary-match` pinned to the assertion's own wording rather than to the
aggregate pass count.

#### P1 — `TP-01-05` fails when the new member is removed from the vocabulary

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-05 with RLTAX-FIGURE-UNREPRESENTABLE removed from the vocabulary
file:             rltaxrules.js
mutation:             "RLTAX-PACK-YEAR-MISMATCH": true,
    /* Every input to the figure is present, valid and inside contract, and the calculation is
       defined, but the result is not a finite double. It is not RLTAX-INPUT-INCOMPLETE because
       nothing is missing, and not RLTAX-INCOME-KIND-UNSUPPORTED because each declared amount is
       itself finite: the defect is in the range of the RESULT, not in any input. */
    "RLTAX-FIGURE-UNREPRESENTABLE": true  ->      "RLTAX-PACK-YEAR-MISMATCH": true   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly th
green-exit:       0
green-summary:      ✓ TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly the one 
revert-verified:  yes (committed=1b7858372f2c9898d06035f212f2deec8bb09a4c restored=1b7858372f2c9898d06035f212f2deec8bb09a4c)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P2 — `TP-01-05` fails when a fabricated sixteenth member is added

The second direction the design names for this assertion. A previous round drove
this mutation by hand and left it in the working tree, which took the suite to
`3398 passed, 10 failed` until it was reverted. It is driven here through the
harness, whose revert trap is installed before the mutation lands.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-05 with a fabricated sixteenth member added to the vocabulary
file:             rltaxrules.js
mutation:         "RLTAX-FIGURE-UNREPRESENTABLE": true  ->  "RLTAX-FIGURE-UNREPRESENTABLE": true, "RLTAX-FABRICATED-SIXTEENTH": true   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly th
green-exit:       0
green-summary:      ✓ TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly the one 
summary-compared:   ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly th  vs    ✓ TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly the one    (elapsed time normalised out)
revert-verified:  yes (committed=1b7858372f2c9898d06035f212f2deec8bb09a4c restored=1b7858372f2c9898d06035f212f2deec8bb09a4c)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P3 — `TB-020-04` fails when the E3 display-seam guard is deleted

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-04 with the E3 display-seam finiteness guard deleted
file:             rltax.js
mutation:         if (!Number.isFinite(valueRecord.value)) {  ->  if (false) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule stand
green-exit:       0
green-summary:      ✓ TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule standing, a
summary-compared:   ✗ FAIL: TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule stand  vs    ✓ TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule standing, a   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P4 — `TB-020-01` fails when the E1 arithmetic-origin guard is deleted

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-01 with the E1 arithmetic-origin finiteness guard deleted
file:             rltax.js
mutation:         if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g every\ stage\ whose\ amount\ overflows\ the\ double\ range\ is\ refused\ by\ name
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name
summary-compared:     [chromium] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name   vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P5 — `TB-020-02` fails when the R1 header branch alone is deleted

This is the display-only remedy the design warns about: the E1 engine guard is
left in place, so the stage rows still refuse, and only the header is left free
to describe the result as settled.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-02 with the R1 header branch deleted while the E1 engine guard remains, which is the state a display-only remedy would ship
file:             lifetime-tax-strategy-lab.html
mutation:         if (state.envelope.unrepresentableDomains.length > 0) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g the\ settlement\ header\ does\ not\ describe\ an\ unrepresentable\ result\ as\ settled
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:78:1 › Regression: SCN-020-02 the settlement header does not describe an unrepresentable result as settled 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:78:1 › Regression: SCN-020-02 the settlement header does not describe an unrepresentable result as settled
summary-compared:     [chromium] › tests/lifetime-tax-representable.spec.mjs:78:1 › Regression: SCN-020-02 the settlement header does not describe an unrepresentable result as settled   vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:78:1 › Regression: SCN-020-02 the settlement header does not describe an unrepresentable result as settled   (elapsed time normalised out)
revert-verified:  yes (committed=074bc697bc8a4de6290f0819b602f2f2ce684fa4 restored=074bc697bc8a4de6290f0819b602f2f2ce684fa4)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P6 and P6b — `TB-020-03` has no single-mutation adversarial case

Recorded because the outcome is a finding rather than a pass. The design names
the adversarial case for `TB-020-03` as "the R2 fallback is restored to
`String(record.value)` **and** a record carrying `Infinity` is placed in a
stage". That is two mutations in two files. The harness applies one literal
replacement to one committed file, so the case cannot be expressed as written,
and each half was driven separately to establish what the assertion is in fact
sensitive to.

First half — restore the R2 fallback while E1 stands:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-03 with the R2 raw-stringification guard restored to String(record.value)
file:             lifetime-tax-strategy-lab.html
mutation:         if (!Number.isFinite(record.value)) return "no figure";  ->  if (false) return "no figure";   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN
red-exit:         0
red-summary:      [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
summary-compared: [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN  vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN   (elapsed time normalised out)
revert-verified:  yes (committed=074bc697bc8a4de6290f0819b602f2f2ce684fa4 restored=074bc697bc8a4de6290f0819b602f2f2ce684fa4)
discriminating:   NO (both channels agree: exit 0 == 0, summary "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome on both channels (both exited 0, and the --summary-match line was "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN" in each once elapsed time was normalised out). The mutation did not change what the command reported, so the assertion under test cannot fail and this is not RED/GREEN evidence.
```

Probe exit `7`.

Second half — delete the E1 guard so a non-finite value is produced at all:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-03 with the E1 arithmetic-origin finiteness guard deleted
file:             rltax.js
mutation:         if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN
red-exit:         0
red-summary:      [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
summary-compared: [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN  vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   NO (both channels agree: exit 0 == 0, summary "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome on both channels (both exited 0, and the --summary-match line was "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN" in each once elapsed time was normalised out). The mutation did not change what the command reported, so the assertion under test cannot fail and this is not RED/GREEN evidence.
```

Probe exit `7`.

What the two runs together establish: `TB-020-03` is defended by three
independent layers — E1 refuses at the origin, E3 refuses at the display seam,
and R2 refuses at the raw-stringification fallback — and removing any single one
of them leaves the other two sufficient to keep the route free of an infinity
symbol and of `NaN`. The assertion therefore holds under every mutation this
harness can apply, and no run in this round showed it failing. It is not proven
to discriminate, and the DoD row that asks for such a proof for **each** new
assertion is left open on that account.

#### P6c and P6d — the enumeration completed, and the assertion shown falsifiable

**Claim Source:** executed in a later session, output captured verbatim.

The finding above rests on an enumeration that was two thirds complete. `P6`
removed R2 and `P6b` removed E1; E3 had not been removed on its own, so "removing
any single one of them" was asserted of three layers having tested two. It is
tested now, and it behaves as claimed.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-03 with the E3 display-seam finiteness guard deleted, the third and last layer removed on its own
file:             rltax.js
mutation:         if (!Number.isFinite(valueRecord.value)) {  ->  if (false) {   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN
red-exit:         0
red-summary:      [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
summary-compared: [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN  vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   NO (both channels agree: exit 0 == 0, summary "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `7`. All three layers are now individually accounted for.

An enumeration of failed mutations cannot by itself distinguish an assertion that
is defended in depth from one that cannot fail at all, and the second of those is
the vacuous-guard class this programme keeps finding. The distinction was
therefore measured rather than argued. E1 and E3 both live in `rltax.js`, so one
mutation can reach both — at the cost of reaching every other finiteness guard in
that module as well.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-03 with every finiteness guard in the calculation module neutralised at once, E1 and E3 among them
file:             rltax.js
mutation:         !Number.isFinite(  ->  false \&\& Number.isFinite(   (18 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
summary-compared:     [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN   vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

`TB-020-03` can fail. It is over-determined, not vacuous. What it cannot do is
fail under a mutation confined to one guard, because no one guard is load-bearing
for it.

The row stays open, and the reason it stays open has changed. It is no longer
"the assertion was never seen failing". It is that the narrowest mutation that
falsifies it removes eighteen guards where the row's wording contemplates one,
and `design.md` itself specifies a two-mutation adversarial case for this
assertion while the harness applies one literal replacement to one file. Closing
this row honestly needs either a harness that composes mutations or a design
amendment that states the true adversarial case for an over-determined assertion.
Neither is an implementer's decision, and neither was taken here.

#### P7 — `TB-020-05` fails when the guard is widened past non-finiteness

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-05 with the E1 guard widened to refuse at half the representable range, which is how an over-eager remedy starts refusing real households
file:             rltax.js
mutation:         if (!Number.isFinite(gross)) {  ->  if (!Number.isFinite(gross) || gross > Number.MAX_VALUE / 2) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g the\ settling\ side\ of\ the\ boundary\ settles\ with\ finite\ figures\ throughout
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:111:1 › Regression: SCN-020-04 the settling side of the boundary settles with finite figures throughout 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:111:1 › Regression: SCN-020-04 the settling side of the boundary settles with finite figures throughout
summary-compared:     [chromium] › tests/lifetime-tax-representable.spec.mjs:111:1 › Regression: SCN-020-04 the settling side of the boundary settles with finite figures throughout   vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:111:1 › Regression: SCN-020-04 the settling side of the boundary settles with finite figures throughout   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P8 — `TB-020-06` fails when the guard is removed

The design names the mutation for this row as narrowing the guard to
`value !== Infinity`. That narrowing does not apply to this side: the refusing
declaration's sum **is** `+Infinity`, so a guard narrowed to admit only `NaN`
still refuses it and the probe would not discriminate. The mutation driven here
is the one the DoD row itself asks for — the guard removed, which is the pre-fix
state.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-06 with the E1 arithmetic-origin finiteness guard deleted, which is the pre-fix state
file:             rltax.js
mutation:         if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g the\ refusing\ side\ of\ the\ boundary\ refuses\ on\ the\ next\ representable\ double
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:137:1 › Regression: SCN-020-05 the refusing side of the boundary refuses on the next representable double 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:137:1 › Regression: SCN-020-05 the refusing side of the boundary refuses on the next representable double
summary-compared:     [chromium] › tests/lifetime-tax-representable.spec.mjs:137:1 › Regression: SCN-020-05 the refusing side of the boundary refuses on the next representable double   vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:137:1 › Regression: SCN-020-05 the refusing side of the boundary refuses on the next representable double   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

## The Reported Pair, Asserted In Its Own Right

**Delivered at commit:** `af9934c82`.

**Claim Source:** executed in this session, output captured verbatim.

Three scenarios name the reported declaration literally — `9e307` in both income
fields for `SCN-020-01` and `SCN-020-02`, `8.9e307` for `SCN-020-03` — while the
delivered suite pinned only the adjacent-double pair. Ticking those rows on the
adjacent-double assertions would have been an inference from a neighbouring
value rather than a measurement of the one the scenario names, so the reported
pair is now asserted in its own right. The adjacent-double pair remains the
tighter pin and is unchanged.

For `SCN-020-03` the pre-change observation this round can compare against is the
one recorded above under **The boundary**: `2 fields 8.9e307` reading
`simple[inf=0 nan=0 truth=Settled] power[inf=0 nan=0 truth=Settled]`. Those three
facts are asserted unchanged. The assertion then goes further than the recorded
observation could, because that observation carried no figures: `CO-1` is
asserted to carry a rounded dollar figure and the rule standing
`enacted-current-law`.

```
Running 8 tests using 1 worker

[1/8] [chromium] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name
[2/8] [chromium] › tests/lifetime-tax-representable.spec.mjs:78:1 › Regression: SCN-020-02 the settlement header does not describe an unrepresentable result as settled
[3/8] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
[4/8] [chromium] › tests/lifetime-tax-representable.spec.mjs:111:1 › Regression: SCN-020-04 the settling side of the boundary settles with finite figures throughout
[5/8] [chromium] › tests/lifetime-tax-representable.spec.mjs:137:1 › Regression: SCN-020-05 the refusing side of the boundary refuses on the next representable double
[6/8] [chromium] › tests/lifetime-tax-representable.spec.mjs:181:1 › Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage
[7/8] [chromium] › tests/lifetime-tax-representable.spec.mjs:205:1 › Regression: SCN-020-02 the settlement header at the reported 9e307 pair names the unrepresentable domain
[8/8] [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard
  8 passed (3.8s)
```

Exit code `0`.

#### P9 — the reported refusing pair fails when the E1 guard is deleted

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-020-01 at the reported 9e307 pair with the E1 arithmetic-origin guard deleted
file:             rltax.js
mutation:         if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g the\ reported\ pair\ at\ 9e307\ refuses\ by\ name\ on\ every\ dependent\ stage
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:181:1 › Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:181:1 › Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage
summary-compared:     [chromium] › tests/lifetime-tax-representable.spec.mjs:181:1 › Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage   vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:181:1 › Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P10 — the reported header assertion fails when the R1 branch is deleted

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-020-02 at the reported 9e307 pair with the R1 header branch deleted
file:             lifetime-tax-strategy-lab.html
mutation:         if (state.envelope.unrepresentableDomains.length > 0) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g the\ settlement\ header\ at\ the\ reported\ 9e307\ pair\ names\ the\ unrepresentable\ domain
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:205:1 › Regression: SCN-020-02 the settlement header at the reported 9e307 pair names the unrepresentable domain 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:205:1 › Regression: SCN-020-02 the settlement header at the reported 9e307 pair names the unrepresentable domain
summary-compared:     [chromium] › tests/lifetime-tax-representable.spec.mjs:205:1 › Regression: SCN-020-02 the settlement header at the reported 9e307 pair names the unrepresentable domain   vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:205:1 › Regression: SCN-020-02 the settlement header at the reported 9e307 pair names the unrepresentable domain   (elapsed time normalised out)
revert-verified:  yes (committed=074bc697bc8a4de6290f0819b602f2f2ce684fa4 restored=074bc697bc8a4de6290f0819b602f2f2ce684fa4)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P11 — the reported settling pair fails when the guard is widened

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-020-03 at the reported 8.9e307 pair with the E1 guard widened to refuse at half the representable range
file:             rltax.js
mutation:         if (!Number.isFinite(gross)) {  ->  if (!Number.isFinite(gross) || gross > Number.MAX_VALUE / 2) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g the\ reported\ settling\ pair\ at\ 8.9e307\ is\ unchanged\ by\ the\ guard
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard
summary-compared:     [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard   vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P12 — the reported settling pair is untouched by the guard

Run to establish "unchanged", which `P11` alone does not. The pre-change
observation this report carries for `8.9e307` records only `truth=Settled`,
`inf=0` and `nan=0`; it carries no figure, so no figure can be compared against
it directly. What can be measured is whether the shipped guard is on that
declaration's path at all. It is not: with the guard deleted the assertion still
passes on both channels, because a sum of `1.78e308` is finite and never reaches
it. Read with `P11`, which shows the same assertion failing the moment the guard
is widened to catch finite sums, the pair establishes that the settling
declaration renders what it rendered before the guard and would stop doing so if
the guard ever grew to cover it.

Exit `7` is the expected and wanted outcome here, and this block is therefore not
offered as discrimination evidence.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-020-03 at the reported 8.9e307 pair with the E1 guard deleted — expected NOT to discriminate, because a finite sum never reaches it
file:             rltax.js
mutation:         if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g the\ reported\ settling\ pair\ at\ 8.9e307\ is\ unchanged\ by\ the\ guard
red-exit:         0
red-summary:      [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard
summary-compared: [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard  vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   NO (both channels agree: exit 0 == 0, summary "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome on both channels (both exited 0, and the --summary-match line was "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard" in each once elapsed time was normalised out). The mutation did not change what the command reported, so the assertion under test cannot fail and this is not RED/GREEN evidence.
```

Probe exit `7`.

## A Correction To The Cited Location Of The Display Guard

The delivery summary this round was handed placed the `stageValueText` guard at
`rltax.js:3246`. It is not in that module. `rltax.js` carries the E3 seam guard
at line 1205 and the E1 origin guard at line 180; the `!Number.isFinite(record.value)`
guard that returns `"no figure"` before the `String(record.value)` fallback is in
`lifetime-tax-strategy-lab.html` at lines 3246 and 3247. The line numbers were
right and the file was not. Both guards were read in this session before any row
below was ticked.

## Validation

**Claim Source:** executed in this session, output captured verbatim.

```
SELFTEST_EXIT=0
self-test: 3408 passed, 0 failed
VALIDATE_PATHS_EXIT=0
[spec-test-paths] scanned=793 references=17963 distinctPaths=266 missingPaths=70 plannedMissing=0 baseline=70 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
```

The `3408` figure is the count with the three reported-pair browser assertions
added; they are browser assertions and are not counted by the node self-test, so
the total is unchanged from the round that shipped the guards and is not lower
than it.

## The Lifetime-Tax Browser Suite

**Claim Source:** executed in this session, output captured verbatim.

```
Running 105 tests using 2 workers

  105 passed (36.7s)
```

Exit code `0`. Command:
`npx playwright test tests/lifetime-tax-*.spec.mjs --project=chromium --reporter=line`.
The suite held 102 tests before this round and holds 105 after it, so it carries
no fewer assertions than it did.

