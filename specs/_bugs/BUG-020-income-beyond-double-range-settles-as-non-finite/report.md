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

#### P6e and P6f — the guard the row names, removed alone, against a control on the identical literal

A later round re-derived the finding independently rather than reading it back
off the section above, and closed the one reading the earlier probes left open.

`P6c` removed E3 by deleting it. `P6e` removes it a different way, neutralising
its condition in place, and reaches the same verdict. `P6f` then runs the
IDENTICAL literal replacement against `TB-020-04`, the assertion that names that
guard. The pair matters because a lone exit `7` has two readings: the assertion
cannot see the guard, or the mutation was inert. A control on the same literal
eliminates the second. E3 is also the guard this row is about — the finiteness
check on `valueRecord.value` that yields `RLTAX-FIGURE-UNREPRESENTABLE` — so the
verdict is about the named guard rather than a neighbouring one.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-03 with the E3 display-seam guard on valueRecord.value neutralised, the guard this row names
file:             rltax.js
mutation:         if (!Number.isFinite(valueRecord.value)) {  ->  if (false && !Number.isFinite(valueRecord.value)) {   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=chromium --reporter=line --grep no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN
red-exit:         0
red-summary:        1 passed (2.2s)
green-exit:       0
green-summary:      1 passed (1.3s)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   NO (red-exit 0 == green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome (both exited 0). The mutation did not make the command fail, so the assertion under test cannot fail and this is not RED/GREEN evidence.
```

Probe exit `7`. No `--summary-match` was supplied, so the exit-code channel alone
decided; the two summary lines are a Playwright aggregate and were not the basis
of the verdict.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-04 with the SAME E3 mutation, as a control on the TB-020-03 exit 7
file:             rltax.js
mutation:         if (!Number.isFinite(valueRecord.value)) {  ->  if (false && !Number.isFinite(valueRecord.value)) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule stand
green-exit:       1
green-summary:      ✓ TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule standing, a
summary-compared:   ✗ FAIL: TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule stand  vs    ✓ TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule standing, a   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (summary differs: "  ✗ FAIL: TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule stand" vs "  ✓ TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule standing, a")
```

Probe exit `0`.

`green-exit` is `1` in the control, unmutated. That is not this bug's doing: a
concurrent session was editing the brief modules throughout, and the selftest
carried two failures of its own the whole time — see `## Validation`. It is the
exact condition the harness's second channel exists for, and pinning
`--summary-match` to `TB-020-04`'s own wording read the assertion through a suite
that was already red for unrelated reasons.

Together the two runs say something the earlier probes could not. One literal
replacement, one file, one guard — the guard this row names. `TB-020-04` sees it
go and fails. `TB-020-03` does not notice. The mutation is real, it lands, and it
is detectable; `TB-020-03` is simply not the assertion that detects it. The row
stays open on the same reasoning as before, now with the inert-mutation reading
ruled out.

#### P6g, P6h and P6i — a correction to the layer count, and the two guards never removed alone

**Claim Source:** executed in a later session, output captured verbatim.

A correction first. The paragraph after `P6` and `P6b` states that `TB-020-03`
is defended by "three independent layers — E1 … E3 … and R2". That sentence is
left standing above as it was written, and it undercounts. `design.md` specifies
five guards for this remedy — `E1`, `E2`, `E3`, `E4` on the engine and `R1`, `R2`
on the route — and `R1` is the header branch, which is `TB-020-02`'s. That leaves
**four** guards on this assertion's path, not three. `E2` and `E4` had never been
removed on their own, so the phrase "removing any single one of them" had been
asserted of four layers having tested three.

`E2` is the guard that assembles `CO-1` from `basis.grossSupportedIncome`, and
`CO-1` is the row the filing observation recorded as `$∞`. It is one guard at
three sites in `rltax.js`, all three expressed by the same literal, so one literal
replacement removes the guard and nothing else.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-03 with the E2 CO-1 assembly guard neutralised at all three of its sites, the guard the reported $INF row came from
file:             rltax.js
mutation:         rules.isUnavailable(basis.grossSupportedIncome)  ->  false   (3 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN
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

Probe exit `7`. Paired immediately with the control that rules out the
inert-mutation reading — the IDENTICAL literal replacement, read through
`TB-020-01`, the assertion that names the stage this guard assembles.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-01 with the SAME E2 mutation, as a control on the TB-020-03 exit 7
file:             rltax.js
mutation:         rules.isUnavailable(basis.grossSupportedIncome)  ->  false   (3 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g every\ stage\ whose\ amount\ overflows\ the\ double\ range\ is\ refused\ by\ name
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name
summary-compared:     [chromium] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name   vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`. The E2 mutation is real, it lands, and it is detectable.
`TB-020-01` sees the guard go and fails; `TB-020-03` does not notice. That is the
same shape `P6e` and `P6f` established for `E3`, now established for a second
guard on the same path.

`E4` is the fourth. It is the guard added to keep `NaN` off the surface when a
disposition is composed on a refusing basis, which is `TB-020-03`'s own second
clause, so it was removed on its own too.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-03 with the E4 disposition-leg guard deleted, the guard added specifically to keep NaN off the surface
file:             rltax.js
mutation:         if (basis.ok !== true) {  ->  if (false) {   (1 occurrence(s))
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

Probe exit `7`, and this one is recorded as **uninformative** rather than as a
fifth account of the assertion's blindness. `design.md` scopes `E4` to the case
where "the deduction refuses **and a disposition is declared**", and `declareAt`
declares no disposition: it fills filing status, tax year, deduction mode,
ordinary income, qualified dividends, other net investment income and the
Medicare wage basis, and nothing else. The guard sits in `composeDispositionLegs`,
which has no caller inside `rltax.js` and is reached from the route only through
`dispositionDeclarationFromWorkspace()`. So this run does not separate "the
assertion is blind to `E4`" from "`E4` never executed", and no assertion in this
packet's acceptance set exercises `E4` to serve as the control that would separate
them. It is reported as measured and as not load-bearing for the verdict.

Where the enumeration now stands for `TB-020-03`, each mutation removing one
guard and one guard only:

| Guard removed alone | Probe | Exit | Live-mutation control |
|---|---|---|---|
| `E1`, arithmetic origin | `P6b` | `7` | — |
| `E2`, `CO-1` assembly | `P6g` | `7` | `P6h`, `TB-020-01`, exit `0` |
| `E3`, display seam | `P6c`, `P6e` | `7` | `P6f`, `TB-020-04`, exit `0` |
| `E4`, disposition legs | `P6i` | `7` | none available; run uninformative |
| `R2`, raw stringification | `P6` | `7` | — |
| all eighteen `rltax.js` guards at once | `P6d` | `0` | — |

The verdict does not change, and it is now carried by a wider enumeration and a
second control. `TB-020-03` is over-determined across four guards on its path, no
one of which is load-bearing for it, so no single-guard mutation falsifies it and
the row's proof cannot be produced as the row words it. The row stays open, and
`TB-020-03` is the assertion it stays open on.

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

## Each Assertion Probed Independently — Q1 To Q11

**Claim Source:** executed in this session, output captured verbatim.

Earlier rounds probed these assertions as they were added, across several
sessions and several commits. This round re-derives the whole set in one pass at
one head, so the enumeration can be read as a closed list rather than assembled
from scattered blocks. Nothing here weakens or rewrites an assertion; each probe
removes or widens a guard and reads what the assertion does about it.

### The enumeration

Nine assertions were added by this packet, and one existing assertion was
extended. Every one is listed, and every one is probed below.

| Probe | Assertion | Where | Mutation |
|---|---|---|---|
| Q1 | `TP-01-05`, removal direction | `scripts/selftest.mjs` | the new vocabulary member removed |
| Q2 | `TP-01-05`, addition direction | `scripts/selftest.mjs` | a fabricated sixteenth member added |
| Q3 | `TB-020-04` | `scripts/selftest.mjs` | E3, the display-seam guard, deleted |
| Q4 | `TB-020-01`, test at line 41 | `tests/lifetime-tax-representable.spec.mjs` | E1, the arithmetic-origin guard, deleted |
| Q5 | `TB-020-02`, test at line 78 | `tests/lifetime-tax-representable.spec.mjs` | R1, the header branch, deleted |
| Q6 | `TB-020-03`, test at line 93 | `tests/lifetime-tax-representable.spec.mjs` | R2, the `"no figure"` guard this row names, deleted |
| Q7 | `TB-020-05`, test at line 111 | `tests/lifetime-tax-representable.spec.mjs` | E1 widened past non-finiteness |
| Q8 | `TB-020-06`, test at line 137 | `tests/lifetime-tax-representable.spec.mjs` | E1 deleted |
| Q9 | reported refusing pair, test at line 181 | `tests/lifetime-tax-representable.spec.mjs` | E1 deleted |
| Q10 | reported header, test at line 205 | `tests/lifetime-tax-representable.spec.mjs` | R1 deleted |
| Q11 | reported settling pair, test at line 213 | `tests/lifetime-tax-representable.spec.mjs` | E1 widened past non-finiteness |

The node self-test exits `1` in this working tree before any mutation is
applied, because a concurrent session holds untracked `tool-brief-v2*` fixtures
and an untracked `zz-probe-focusable.spec.mjs` that two unrelated assertions
read. Those two failures are not this packet's and are not touched here. It is
the reason every node probe below is read on the summary channel rather than the
exit-status channel: `--summary-match` is pinned to the assertion's own wording,
so the verdict is that assertion's own line and not the aggregate.

#### Q1 — `TP-01-05` fails when the new member is removed from the vocabulary

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-05 with the unrepresentable-figure member removed from the vocabulary
file:             rltaxrules.js
mutation:         "RLTAX-FIGURE-UNREPRESENTABLE": true  ->  "RLTAX-PACK-YEAR-MISMATCH": true   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly th
green-exit:       1
green-summary:      ✓ TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly the one 
summary-compared:   ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly th  vs    ✓ TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly the one    (elapsed time normalised out)
revert-verified:  yes (committed=1b7858372f2c9898d06035f212f2deec8bb09a4c restored=1b7858372f2c9898d06035f212f2deec8bb09a4c)
discriminating:   yes (summary differs: "  ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly th" vs "  ✓ TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly the one ")
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`. Both runs exited `1` on the unrelated concurrent failures, and
the assertion's own line moved from `✗ FAIL` to `✓`, which is the channel the
verdict was read on.

#### Q2 — `TP-01-05` fails when a fabricated sixteenth member is added

The second direction the design names for this assertion. The fabricated member
is given the same name a previous round stranded in the working tree, so the
residue grep at the end of this round is a live check on this probe rather than
on a token nothing here produces.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-01-05 with a fabricated sixteenth member added to the vocabulary
file:             rltaxrules.js
mutation:         "RLTAX-FIGURE-UNREPRESENTABLE": true  ->  "RLTAX-FIGURE-UNREPRESENTABLE": true, "RLTAX-FABRICATED-SIXTEENTH": true   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly th
green-exit:       1
green-summary:      ✓ TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly the one 
summary-compared:   ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly th  vs    ✓ TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly the one    (elapsed time normalised out)
revert-verified:  yes (committed=1b7858372f2c9898d06035f212f2deec8bb09a4c restored=1b7858372f2c9898d06035f212f2deec8bb09a4c)
discriminating:   yes (summary differs: "  ✗ FAIL: TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly th" vs "  ✓ TP-01-05: the RLTAX enum count is derived from the module declaration, carries all twelve Feature 021 members unchanged plus exactly the two named jurisdiction-axis members plus exactly the one ")
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### Q3 — `TB-020-04` fails when the E3 display-seam guard is deleted

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-04 with the E3 display-seam finiteness guard deleted
file:             rltax.js
mutation:         if (!Number.isFinite(valueRecord.value)) {  ->  if (false) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule stand
green-exit:       1
green-summary:      ✓ TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule standing, a
summary-compared:   ✗ FAIL: TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule stand  vs    ✓ TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule standing, a   (elapsed time normalised out)
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (summary differs: "  ✗ FAIL: TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule stand" vs "  ✓ TB-020-04: formatForDisplay refuses a record carrying Infinity, -Infinity or NaN with RLTAX-FIGURE-UNREPRESENTABLE on domain display:value, that refusal carries no figure and no rule standing, a")
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### Q4 — `TB-020-01` fails when the E1 arithmetic-origin guard is deleted

The first attempt at this probe exited `128` before it mutated anything: a
concurrent session held `.git/index.lock`, so the harness could not read the
committed blob it reverts to. `rltax.js` was verified against its committed
hash and against the guard text before the retry below, and matched both, so
nothing was left mutated by the aborted attempt.

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

#### Q5 — `TB-020-02` fails when the R1 header branch alone is deleted

The E1 engine guard is left standing, so the stage rows still refuse and only
the header is free to describe the result as settled. That is the display-only
remedy the design warns about.

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
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### Q6 — `TB-020-03` does not fail when the R2 guard the row names is removed

This is the probe the open Definition of Done row asks for by name: the guard
that returns `"no figure"` before the `String(record.value)` fallback, removed,
against the assertion it protects. The mutation form here is removal rather than
the `if (false)` neutralisation earlier rounds drove, and the replacement carries
a `RED PROBE` marker so the residue grep at the end of this round is a live check
on this probe rather than on a token nothing produces.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-03 with the R2 stageValueText guard removed, which is the guard the Definition of Done row names
file:             lifetime-tax-strategy-lab.html
mutation:         if (!Number.isFinite(record.value)) return "no figure";  ->  /* RED PROBE: BUG-020 R2 guard removed */   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN
red-exit:         0
red-summary:      [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
summary-compared: [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN  vs  [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN   (elapsed time normalised out)
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   NO (both channels agree: exit 0 == 0, summary "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome on both channels (both exited 0, and the --summary-match line was "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN" in each once elapsed time was normalised out). The mutation did not change what the command reported, so the assertion under test cannot fail and this is not RED/GREEN evidence.
```

Probe exit `7`. This reproduces the finding earlier rounds recorded for this
assertion under `P6`, `P6b`, `P6c`, `P6e`, `P6g` and `P6i`, by a mutation form
none of those used. It is recorded as a finding and not retried against another
guard. The row stays open, and `TB-020-03` is the assertion it stays open on.

The source itself already states why. The comment sitting directly above the
removed guard in `stageValueText` says the branch is "not reached from the
acceptance set", because E1 and E2 turn the record into a refusal that the
`RULES.isUnavailable` branch above catches first. Removing R2 therefore changes
no rendered byte at the declaration this assertion drives, and the assertion has
nothing to notice.

#### Q7 — `TB-020-05` fails when the guard is widened past non-finiteness

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

#### Q8 — `TB-020-06` fails when the guard is removed

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

#### Q9 — the reported refusing pair fails when the E1 guard is deleted

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-020-01 at the reported 9e307 pair with the E1 arithmetic-origin finiteness guard deleted
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

#### Q10 — the reported header assertion fails when the R1 branch is deleted

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
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### Q11 — the reported settling pair fails when the guard is widened

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

### What this round settles, and what it leaves open

Ten of the eleven probes discriminated. Every assertion this packet added is
proven falsifiable by removing or widening the guard it protects, except one.

`TB-020-03` is that one. `Q6` removed the guard the row names, in the form the
row names, and the assertion did not notice. That is the same verdict `P6`,
`P6b`, `P6c`, `P6e`, `P6g` and `P6i` reached against four different guards and
three different mutation forms. No further mutation was tried against it: the
row asks whether the assertion fails when its guard is removed, and the answer
this round obtained is that it does not.

The row therefore stays open on `TB-020-03`, and the packet's routing to
`bubbles.design` is unchanged. Nothing here weakened an assertion, and no
assertion text was edited.

## Closing The Over-Determination Row — One Assertion Per Layer (R1 To R3)

The open Definition of Done row asked for a red-green probe proving each new assertion
fails when its guard is removed. Every row cleared except `TB-020-03`, and the recorded
reason was that `TB-020-03` is defended independently by three layers — the R2 render
fallback, the E1 arithmetic origin, and the E3 display seam — so removing any one of them
left the other two standing and the probe returned non-discriminating.

That diagnosis was correct and the conclusion drawn from it was too narrow. Earlier rounds
read the problem as a harness limitation and proposed either a mutation-composing harness or
a design amendment, both of which were held to be outside an implementer's authority. But
the row's real subject is not `TB-020-03`. It is whether each guard is load-bearing, and
`TB-020-03` was never the instrument that could answer that: an assertion on the
user-visible outcome cannot distinguish which of three sufficient layers produced it.

The consequence of leaving it there was concrete rather than procedural. A layer with no
assertion of its own can be deleted as apparent dead code and nothing turns red — and the
E1 probe below shows this was not hypothetical. So the resolution is one assertion per
layer, each pinning its own layer in isolation.

**A finding, not a formality.** Before this round, the origin domain
`income:grossSupportedIncome` was asserted **nowhere** in the suite:

```
$ grep -c 'income:grossSupportedIncome' scripts/selftest.mjs
0
```

`TB-020-04` states in its own comment that it exercises E3 "and nothing else". So deleting
E1 let the overflowing sum flow downstream until E3 caught it, the suite still saw a
refusal, and it stayed green — while the message a reader actually receives silently
degraded from `income:grossSupportedIncome` ("your declared amounts summed out of range")
to `display:value` ("a record arrived unprintable"). The first names the cause; the second
can only report a symptom. That trade is the degradation `TB-020-05` now pins, and it pins
the **domain** rather than the code, because asserting the code alone passes on the E3
cascade and reopens the hole.

### R1 — E1, the arithmetic origin, before and after its assertion existed

Before `TB-020-05`, removing E1 was non-discriminating — the suite could not tell:

```
$ bash scripts/red-green-probe.sh --file rltax.js \
    --find 'if (!Number.isFinite(gross)) {' \
    --replace 'if (false && !Number.isFinite(gross)) {' -- node scripts/selftest.mjs
red-exit:         0
green-exit:       0
discriminating:   NO (red-exit 0 == green-exit 0)
red-green-probe: REFUSED — RED and GREEN produced the same outcome (both exited 0).
```

After `TB-020-05` landed, the same mutation is caught:

```
$ bash scripts/red-green-probe.sh --file rltax.js \
    --find 'if (!Number.isFinite(gross)) {' \
    --replace 'if (false && !Number.isFinite(gross)) {' \
    --label 'BUG-020 E1 origin guard (income sum)' -- node scripts/selftest.mjs
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
```

### R2 — the render fallback in `lifetime-tax-strategy-lab.html`

This was the last layer with no assertion of its own. `TB-020-06` pins the guard's presence
and its **ordering** relative to the `String(record.value)` fallback it protects, because
`String(Infinity)` is the literal text `"Infinity"` — the symbol the bug reported:

```
$ bash scripts/red-green-probe.sh --file lifetime-tax-strategy-lab.html \
    --find 'if (!Number.isFinite(record.value)) return "no figure";' \
    --replace '/* R2 guard removed by probe */' \
    --label 'BUG-020 R2 render fallback guard' -- node scripts/selftest.mjs
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (exit 1 != 0)
```

`TB-020-06` is **source-pinned rather than executed**, and that is weaker. R2 lives in an
inline `<script>` in a page this build-free suite does not load, so the assertion pins the
guard's presence and ordering rather than running it. That is precisely what a deletion or
a reorder would break, which is the failure mode in scope; it would not catch a semantic
change that preserved both. Recorded as a limit rather than left for a reader to discover.

### R3 — E3, the display seam, already covered

`TB-020-04` covers E3 and was already proven discriminating by probe `P3` in an earlier
round. Re-derived here at this head for completeness:

```
$ bash scripts/red-green-probe.sh --file rltax.js \
    --find 'if (!Number.isFinite(valueRecord.value)) {' \
    --replace 'if (false && !Number.isFinite(valueRecord.value)) {' \
    --label 'BUG-020 E3 display-seam guard' -- node scripts/selftest.mjs
red-exit:         1
green-exit:       0
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
```

### What this does and does not establish

Each of the three layers now fails a specific assertion when removed on its own, by a
single literal mutation — no composing harness and no design amendment were required.

`TB-020-03` itself remains over-determined, and that is left deliberately unchanged. It
asserts the user-visible outcome, three independent layers is the right defence for it, and
an assertion that went red when any one layer was removed would be asserting the
implementation rather than the promise. The over-determination was never the defect; the
absence of per-layer coverage was, and that is what closed.

One correction to the earlier record: the round that reported `P6b` as non-discriminating
attributed it to a harness limitation. The measurement was right and the attribution was
wrong — the harness was reporting, accurately, that no assertion depended on E1.

Suite after all three assertions: `3435 passed, 0 failed`, up from `3433`, with no
assertion removed.
